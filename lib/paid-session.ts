import { getSession } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import type { ScoreResult, AnswerInput } from '@/lib/scoring';

/**
 * Unified session lookup for buyer-facing backup channels (PDF download,
 * email resend). The in-memory store is empty in production — sessions
 * live in Supabase — so any route that only calls getSession() 404s for
 * every real buyer. This helper falls back: memory → Supabase.
 */
export interface PaidSessionData {
  locale: 'ko' | 'en';
  email?: string;
  is_paid: boolean;
  result?: ScoreResult;
  answers?: AnswerInput[];
}

export async function fetchPaidSessionData(
  sessionId: string,
): Promise<PaidSessionData | null> {
  const mem = getSession(sessionId);
  if (mem) {
    return {
      locale: mem.locale,
      email: mem.email,
      is_paid: Boolean(mem.is_paid),
      result: mem.result,
      answers: mem.answers,
    };
  }

  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from('test_sessions')
      .select(
        'locale, email, is_paid, raw_score, estimated_iq, percentile, category_scores, answers',
      )
      .eq('id', sessionId)
      .single();
    if (!data) return null;

    const result: ScoreResult | undefined =
      data.estimated_iq != null
        ? {
            rawScore: data.raw_score ?? 0,
            total: 30,
            estimatedIq: data.estimated_iq,
            topPercentile: data.percentile,
            categoryScores: data.category_scores,
          }
        : undefined;

    return {
      locale: data.locale === 'en' ? 'en' : 'ko',
      email: data.email ?? undefined,
      is_paid: Boolean(data.is_paid),
      result,
      answers: Array.isArray(data.answers) ? (data.answers as AnswerInput[]) : undefined,
    };
  } catch (err) {
    console.error('[paid-session] Supabase lookup failed:', err);
    return null;
  }
}
