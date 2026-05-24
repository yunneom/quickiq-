/**
 * In-memory fallback store used when Supabase env vars are absent
 * (i.e. local development or initial production launch without a DB).
 * Lifetime = single server process. When Supabase is configured the API
 * routes write to `test_sessions` / `payments` instead and ignore this
 * module.
 *
 * In addition to test sessions, we also track processed webhook event
 * ids so a Lemon Squeezy retry (after a slow first attempt) doesn't
 * double-send the report email.
 */

import type { ScoreResult } from '@/lib/scoring';
import type { AnswerInput } from '@/lib/scoring';

export interface StoredSession {
  id: string;
  locale: 'ko' | 'en';
  /** Ad-campaign attribution captured from URL params on first hit. */
  utm?: Record<string, string>;
  started_at: number;
  completed_at?: number;
  answers?: AnswerInput[];
  result?: ScoreResult;
  email?: string;
  is_paid?: boolean;
  paid_at?: number;
}

// `global` so the Map survives hot-reload in dev.
const g = globalThis as unknown as { __iqSessions?: Map<string, StoredSession> };
if (!g.__iqSessions) g.__iqSessions = new Map();
const sessions = g.__iqSessions;

export function createSession(locale: 'ko' | 'en'): StoredSession {
  const id = crypto.randomUUID();
  const session: StoredSession = { id, locale, started_at: Date.now() };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): StoredSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, patch: Partial<StoredSession>): StoredSession | undefined {
  const cur = sessions.get(id);
  if (!cur) return undefined;
  const next = { ...cur, ...patch };
  sessions.set(id, next);
  return next;
}

// ── Webhook idempotency (in-memory, falls back to Supabase when configured) ──

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const g2 = globalThis as unknown as {
  __iqEventSeen?: Map<string, number>;
};
if (!g2.__iqEventSeen) g2.__iqEventSeen = new Map();
const seenEvents = g2.__iqEventSeen;

function gcExpired(): void {
  const cutoff = Date.now() - IDEMPOTENCY_TTL_MS;
  for (const [key, ts] of seenEvents) {
    if (ts < cutoff) seenEvents.delete(key);
  }
}

/**
 * Returns true if the event was already processed (caller should short-circuit).
 * On false, marks the event as seen.
 */
export function markEventProcessed(eventId: string): { duplicate: boolean } {
  gcExpired();
  if (seenEvents.has(eventId)) return { duplicate: true };
  seenEvents.set(eventId, Date.now());
  return { duplicate: false };
}

