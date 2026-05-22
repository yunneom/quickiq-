/**
 * In-memory fallback session store used when Supabase env vars are absent
 * (i.e. local development without a backend). Lifetime = single server process.
 * When Supabase is configured the API routes write to the `test_sessions`
 * table instead and ignore this module.
 */

import type { ScoreResult } from '@/lib/scoring';
import type { AnswerInput } from '@/lib/scoring';

export interface StoredSession {
  id: string;
  locale: 'ko' | 'en';
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
