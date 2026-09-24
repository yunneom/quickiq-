import { headers } from 'next/headers';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import type { AxisScoreMap } from './types';
import type { AiInsightRecord } from '@/lib/ai/insight';

export interface PersonalitySessionRow {
  id: string;
  locale: string;
  profile_id: string | null;
  axis_scores: AxisScoreMap | null;
  /** 0011: cached AI 개인 해설 (null until first result view). */
  ai_insight: AiInsightRecord | null;
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
  // ai_insight (migration 0011) is read separately and tolerantly: until the
  // operator applies the migration the column doesn't exist, and folding it
  // into the main select would make *every* result page 404 (PostgREST
  // rejects the whole query on an unknown column). Missing column → null →
  // the page renders without the section (and the insight write is skipped
  // with a warning in lib/ai/insight.ts).
  let ai_insight: AiInsightRecord | null = null;
  try {
    const { data: extra, error: extraErr } = await admin
      .from('test_sessions')
      .select('ai_insight')
      .eq('id', sessionId)
      .single();
    if (!extraErr && extra) {
      ai_insight = (extra as { ai_insight?: AiInsightRecord | null }).ai_insight ?? null;
    }
  } catch {
    ai_insight = null;
  }
  return { ...(data as Omit<PersonalitySessionRow, 'ai_insight'>), ai_insight };
}
