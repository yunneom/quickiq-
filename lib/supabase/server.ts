import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
