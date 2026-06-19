import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';

/**
 * Read-only diagnostic endpoint. Tells the operator whether Supabase env
 * vars are visible to the running Vercel function (presence flags only —
 * never echoes values) and whether the service-role key can actually
 * touch the database. Safe to ship in production: leaks no secrets, just
 * yes/no signals + a one-line error from the DB driver when a query
 * fails. Delete or gate behind ADMIN_TOKEN once everything is green.
 */
export const GET = withErrorHandling('debug/supabase', async () => {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const configured = isSupabaseConfigured();

  // Fingerprint of the URL (first 12 chars of host) so the operator can
  // confirm Vercel picked up the RIGHT project's URL, not a typo'd one.
  // Never exposes the API keys themselves.
  const urlFingerprint = (() => {
    try {
      const u = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const host = new URL(u).host;
      return host.slice(0, 12) + (host.length > 12 ? '…' : '');
    } catch {
      return null;
    }
  })();

  // Surface common copy-paste issues with the URL value: trailing slash,
  // whitespace, embedded newline, or accidentally pasted "https://"
  // twice. All cause the supabase-js URL builder to emit malformed paths.
  const urlHealth = (() => {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const trimmed = raw.trim();
    return {
      length: raw.length,
      trimmedLength: trimmed.length,
      hasLeadingOrTrailingWhitespace: raw !== trimmed,
      hasTrailingSlash: trimmed.endsWith('/'),
      hasNewline: /[\r\n]/.test(raw),
      startsWithHttps: trimmed.startsWith('https://'),
      doubleHttps: (trimmed.match(/https?:\/\//g) ?? []).length > 1,
      lastChar: raw.length > 0 ? raw.charCodeAt(raw.length - 1) : null,
    };
  })();

  let dbCheck:
    | { ok: true; tablesReachable: boolean; testSessionsCount: number | null }
    | { ok: false; error: string } = {
    ok: false,
    error: 'not-attempted',
  };
  let insertCheck:
    | { ok: true; insertedId: string }
    | { ok: false; error: string } = {
    ok: false,
    error: 'not-attempted',
  };
  if (configured && hasService) {
    try {
      const admin = createSupabaseAdmin();
      const { count, error } = await admin
        .from('test_sessions')
        .select('id', { count: 'exact', head: true });
      if (error) {
        dbCheck = { ok: false, error: error.message };
      } else {
        dbCheck = {
          ok: true,
          tablesReachable: true,
          testSessionsCount: count ?? 0,
        };
      }

      // Mirror the personality start-route insert so we can see the
      // *exact* error if the schema is missing a column or RLS is
      // misconfigured. Insert then immediately delete so the table stays
      // clean — debug calls don't pollute the data.
      const insertRes = await admin
        .from('test_sessions')
        .insert({ locale: 'ko', test_type: 'mbti' })
        .select('id')
        .single();
      if (insertRes.error) {
        const e = insertRes.error as unknown as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };
        insertCheck = {
          ok: false,
          error: [
            e.message && `msg: ${e.message}`,
            e.code && `code: ${e.code}`,
            e.details && `details: ${e.details}`,
            e.hint && `hint: ${e.hint}`,
          ]
            .filter(Boolean)
            .join(' | '),
        };
      } else {
        insertCheck = { ok: true, insertedId: insertRes.data.id };
        // best-effort cleanup
        await admin.from('test_sessions').delete().eq('id', insertRes.data.id);
      }
    } catch (err) {
      dbCheck = {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Raw REST probe — bypass supabase-js entirely to see the exact HTTP
  // request path + PostgREST response. SELECT working while INSERT fails
  // through the SDK means the SDK (or its URL handling), not the DB, is
  // the suspect. This isolates it.
  let rawProbe:
    | {
        sanitizedUrl: string;
        getStatus: number;
        getBody: string;
        postStatus: number;
        postBody: string;
        restBaseStatus: number;
        authHealthStatus: number;
      }
    | { error: string } = { error: 'not-attempted' };
  if (hasUrl && hasService) {
    try {
      const sanitized = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
        .trim()
        .replace(/\/+$/, '');
      const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
      const headers = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      };
      const getRes = await fetch(
        `${sanitized}/rest/v1/test_sessions?select=id&limit=1`,
        { headers, cache: 'no-store' },
      );
      const getBody = (await getRes.text()).slice(0, 300);

      const postRes = await fetch(`${sanitized}/rest/v1/test_sessions`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ locale: 'ko', test_type: 'mbti' }),
        cache: 'no-store',
      });
      const postBody = (await postRes.text()).slice(0, 300);

      // The REST base + auth health endpoints tell us whether the host is
      // even a valid Supabase API origin (404 on /rest/v1/ with a working
      // auth health = wrong/garbled REST host or a non-PostgREST URL).
      let restBaseStatus = -1;
      let authHealthStatus = -1;
      try {
        restBaseStatus = (
          await fetch(`${sanitized}/rest/v1/`, { headers, cache: 'no-store' })
        ).status;
      } catch {
        /* ignore */
      }
      try {
        authHealthStatus = (
          await fetch(`${sanitized}/auth/v1/health`, { cache: 'no-store' })
        ).status;
      } catch {
        /* ignore */
      }

      rawProbe = {
        // Full host is the public anon URL — safe to display, never a key.
        sanitizedUrl: sanitized,
        getStatus: getRes.status,
        getBody,
        postStatus: postRes.status,
        postBody,
        restBaseStatus,
        authHealthStatus,
      };
    } catch (err) {
      rawProbe = { error: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon,
      SUPABASE_SERVICE_ROLE_KEY: hasService,
    },
    isSupabaseConfigured: configured,
    urlFingerprint,
    urlHealth,
    dbCheck,
    insertCheck,
    rawProbe,
    runtime: process.env.VERCEL_ENV ?? 'local',
    deploymentUrl: process.env.VERCEL_URL ?? null,
  });
});
