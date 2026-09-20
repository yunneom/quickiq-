import { generateText } from 'ai';
import * as Sentry from '@sentry/nextjs';
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import type { PersonalityProfile } from '@/lib/personality/types';
import * as log from '@/lib/log';

/**
 * AI 개인 해설 — Vercel AI Gateway(AI SDK) 로 성격 테스트 결과에 "이 사람만의"
 * 3줄 해설을 붙인다. 유형 설명은 유형당 고정 텍스트라 같은 유형이면 누구나
 * 같은 결과 페이지를 본다. 축 비율(예: 외향 63%)까지 반영한 짧은 해설은
 * 결과 캡처·공유 동기를 만든다(바이럴 벤치마크: "나만의 결과").
 *
 * 운영 원칙(CLAUDE.md 3대 원칙 준수):
 * - 무료: AI_GATEWAY_API_KEY(또는 Vercel OIDC)가 없으면 아무것도 렌더하지 않음.
 *   Gateway 는 팀당 월 $5 크레딧 + 마크업 0. 기본 모델은 Haiku 급(1회 ≈ ₩1 미만).
 * - 자동화: 세션당 1회 생성 후 test_sessions.ai_insight 에 캐시. 재방문·공유
 *   유입은 모델 호출 0.
 * - 안전: 진단/의학/외모/부정 라벨 금지, "재미용" 고지는 UI 가 담당.
 *   실패는 조용히 null (결과 페이지는 해설 없이 정상 렌더).
 */

export type InsightLocale = 'ko' | 'en';

export interface InsightInput {
  locale: InsightLocale;
  /** Test display name, e.g. "16 성격 유형". */
  testName: string;
  profile: Pick<PersonalityProfile, 'name' | 'tagline' | 'strengths' | 'weaknesses'>;
  /** Axis lines as shown to the user, e.g. "외향 E 63% / 37% 내향 I". */
  axisLines: string[];
}

export interface AiInsightRecord {
  items: string[];
  model: string;
  locale: InsightLocale;
  created_at: string;
}

const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';
const ITEM_COUNT = 3;
const MAX_ITEM_CHARS: Record<InsightLocale, number> = { ko: 90, en: 150 };
const TIMEOUT_MS = 9_000;

/** Enabled when a Gateway credential path exists and the operator hasn't switched it off. */
export function isAiInsightEnabled(): boolean {
  if (process.env.AI_INSIGHT_ENABLED?.trim() === 'off') return false;
  const hasKey = Boolean(process.env.AI_GATEWAY_API_KEY?.trim());
  const onVercel = process.env.VERCEL === '1'; // OIDC auth works without a key
  return hasKey || onVercel;
}

export function insightModel(): string {
  return process.env.AI_INSIGHT_MODEL?.trim() || DEFAULT_MODEL;
}

export function buildInsightPrompt(input: InsightInput): { system: string; prompt: string } {
  const n = ITEM_COUNT;
  const max = MAX_ITEM_CHARS[input.locale];
  const system =
    input.locale === 'ko'
      ? [
          '당신은 성격 테스트 결과를 따뜻하고 구체적으로 풀어주는 해설가입니다.',
          `반드시 JSON 객체 {"items": [문장 ${n}개]} 만 출력합니다. 다른 텍스트 금지.`,
          `각 문장은 한국어 존댓말, 2인칭("당신"), ${max}자 이내, 이모지 없음.`,
          '축 비율 숫자를 최소 한 문장에 자연스럽게 인용해 "이 사람만의" 결과처럼 보이게 합니다.',
          '금지: 의학·심리 진단 표현, 정신건강 언급, 외모 언급, 부정적 낙인, 연애 상대 추천, AI 언급.',
          '테스트는 재미용이므로 단정 대신 "~한 편이에요", "~일 수 있어요" 같은 완곡한 표현을 씁니다.',
        ].join('\n')
      : [
          'You write warm, specific commentary on personality test results.',
          `Output ONLY a JSON object {"items": [${n} sentences]}. No other text.`,
          `Each sentence: second person ("you"), at most ${max} characters, no emoji.`,
          'Quote at least one axis percentage naturally so the result feels personal.',
          'Forbidden: medical or psychological diagnosis, mental-health claims, appearance, negative labels, dating advice, mentioning AI.',
          'It is an entertainment test, so hedge ("you tend to", "you may") rather than assert.',
        ].join('\n');
  const prompt = [
    `Test: ${input.testName}`,
    `Type: ${input.profile.name} — ${input.profile.tagline}`,
    `Axes: ${input.axisLines.join(' | ')}`,
    `Strengths: ${input.profile.strengths.join(', ')}`,
    `Watch-outs: ${input.profile.weaknesses.join(', ')}`,
  ].join('\n');
  return { system, prompt };
}

/**
 * Tolerant parser: accepts a JSON object with `items`, a bare JSON array, or
 * a code-fenced variant. Returns exactly ITEM_COUNT trimmed, length-capped
 * strings or null (caller treats null as "no insight").
 */
export function parseInsight(raw: string, locale: InsightLocale): string[] | null {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = Math.min(
    ...['{', '['].map((ch) => text.indexOf(ch)).filter((i) => i >= 0),
  );
  if (!Number.isFinite(start)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start));
  } catch {
    return null;
  }
  const arr = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown }).items)
      ? (parsed as { items: unknown[] }).items
      : null;
  if (!arr) return null;
  const max = MAX_ITEM_CHARS[locale];
  const items = arr
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 8)
    .map((s) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s))
    .slice(0, ITEM_COUNT);
  return items.length === ITEM_COUNT ? items : null;
}

// Per-process soft daily cap so a traffic spike can't burn credits. Serverless
// instances each keep their own counter, so treat it as a rough ceiling, not
// an exact budget — the exact number lives in the Gateway dashboard.
const g = globalThis as unknown as { __aiInsightBudget?: { day: string; used: number } };
function underDailyCap(): boolean {
  const cap = Number(process.env.AI_INSIGHT_DAILY_CAP ?? 1000);
  const day = new Date().toISOString().slice(0, 10);
  if (!g.__aiInsightBudget || g.__aiInsightBudget.day !== day) {
    g.__aiInsightBudget = { day, used: 0 };
  }
  if (g.__aiInsightBudget.used >= cap) return false;
  g.__aiInsightBudget.used += 1;
  return true;
}

async function generate(input: InsightInput): Promise<AiInsightRecord | null> {
  const model = insightModel();
  const { system, prompt } = buildInsightPrompt(input);
  const { text } = await generateText({
    model,
    system,
    prompt,
    temperature: 0.7,
    maxOutputTokens: 400,
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const items = parseInsight(text, input.locale);
  if (!items) {
    log.warn({ area: 'ai-insight', step: 'parse', data: { model, sample: text.slice(0, 120) } }, 'unparseable');
    return null;
  }
  return { items, model, locale: input.locale, created_at: new Date().toISOString() };
}

/**
 * Returns the cached insight for the session, or generates + stores one.
 * Never throws — any failure degrades to null so the result page renders
 * without the section.
 */
export async function getOrCreateInsight(
  sessionId: string,
  cached: AiInsightRecord | null | undefined,
  input: InsightInput,
): Promise<string[] | null> {
  if (cached?.items?.length === ITEM_COUNT && cached.locale === input.locale) {
    return cached.items;
  }
  if (!isAiInsightEnabled() || !isSupabaseConfigured()) return null;
  if (!underDailyCap()) {
    log.warn({ area: 'ai-insight', step: 'cap' }, 'daily cap reached — skipping');
    return null;
  }
  try {
    const rec = await generate(input);
    if (!rec) return null;
    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from('test_sessions')
      .update({ ai_insight: rec })
      .eq('id', sessionId);
    if (error) {
      // Still show it this once; the next view will regenerate (bounded by the cap).
      log.warn({ area: 'ai-insight', step: 'store', data: { message: error.message } }, 'cache write failed');
    }
    return rec.items;
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'ai-insight' } });
    log.error({ area: 'ai-insight', step: 'generate', data: { model: insightModel() } }, 'failed', err);
    return null;
  }
}
