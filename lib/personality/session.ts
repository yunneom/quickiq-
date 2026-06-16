import { headers } from 'next/headers';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import type { AxisScoreMap } from './types';

export interface PersonalitySessionRow {
  id: string;
  locale: string;
  profile_id: string | null;
  axis_scores: AxisScoreMap | null;
}

/**
 * Shared result-page loader for every personality test. Returns null when
 * Supabase isn't configured (local dev / preview without DB) or the row
 * isn't found, so callers render their "결과를 찾을 수 없습니다" state.
 * The test_type filter guards against a session id from another test type
 * resolving on the wrong result page.
 */
export async function fetchPersonalitySession(
  sessionId: string,
  testType: string,
): Promise<PersonalitySessionRow | null> {
  if (!isSupabaseConfigured()) return null;
  // Touch headers so Next treats the page as dynamic per request, matching
  // the IQ result page behavior.
  headers();
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from('test_sessions')
    .select('id, locale, profile_id, axis_scores')
    .eq('id', sessionId)
    .eq('test_type', testType)
    .single();
  if (error || !data) return null;
  return data as PersonalitySessionRow;
}
