import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Strip trailing slashes + whitespace from the project URL. The Supabase
 * dashboard "Copy" button sometimes appends a slash, and pasted values
 * occasionally carry surrounding whitespace. Either one makes supabase-js
 * build paths like `/rest/v1//test_sessions`, which PostgREST rejects
 * with PGRST125 "Invalid path specified in request URL".
 */
function sanitizeSupabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  return raw.trim().replace(/\/+$/, '');
}

const URL = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON);
}

export function createSupabaseServer() {
  if (!URL || !ANON) {
    throw new Error('Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  const cookieStore = cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: CookieToSet[]) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component context — ignore.
        }
      },
    },
  });
}

export function createSupabaseAdmin() {
  if (!URL || !SERVICE) {
    throw new Error('Supabase service role missing — set SUPABASE_SERVICE_ROLE_KEY');
  }
  return createServerClient(URL, SERVICE, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
