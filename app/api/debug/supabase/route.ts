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
        insertCheck = { ok: false, error: insertRes.error.message };
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

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon,
      SUPABASE_SERVICE_ROLE_KEY: hasService,
    },
    isSupabaseConfigured: configured,
    urlFingerprint,
    dbCheck,
    insertCheck,
    runtime: process.env.VERCEL_ENV ?? 'local',
    deploymentUrl: process.env.VERCEL_URL ?? null,
  });
});
