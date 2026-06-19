'use client';

import { createBrowserClient } from '@supabase/ssr';

// Match lib/supabase/server.ts — strip trailing slash + whitespace so a
// pasted "https://xxx.supabase.co/" doesn't produce PGRST125 paths.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, '');
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function createSupabaseBrowser() {
  if (!URL || !ANON) {
    throw new Error('Supabase env vars missing');
  }
  return createBrowserClient(URL, ANON);
}
