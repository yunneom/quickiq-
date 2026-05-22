'use client';

import { createBrowserClient } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseBrowser() {
  if (!URL || !ANON) {
    throw new Error('Supabase env vars missing');
  }
  return createBrowserClient(URL, ANON);
}
