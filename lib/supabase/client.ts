'use client';

import { createBrowserClient } from '@supabase/ssr';
import { sanitizeSupabaseUrl } from './sanitize-url';

// Match lib/supabase/server.ts — strip trailing slash, whitespace, and an
// accidental /rest/v1 suffix so a mispasted URL doesn't produce PGRST125.
const URL = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function createSupabaseBrowser() {
  if (!URL || !ANON) {
    throw new Error('Supabase env vars missing');
  }
  return createBrowserClient(URL, ANON);
}
