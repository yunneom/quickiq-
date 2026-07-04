import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import {
  getAllTetoEgenProfiles,
  getTetoEgenProfile,
  TETO_EGEN_TEST_TYPE,
} from '@/lib/personality/teto-egen';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { ResultAd } from '@/components/ads/result-ad';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

const COPY = {
  ko: {
    title: '당신은',
    strengthsTitle: '강점',
    weaknessesTitle: '약점',
    compatibilityTitle: '궁합표',
    shareTitle: '결과 공유하기',
    retake: '다시 응시',
    disclaimer: '재미용 테스트 · 과학적 진단이 아닙니다.',
    notFound: '결과를 찾을 수 없습니다.',
  },
  en: {
    title: 'You are',
    strengthsTitle: 'Strengths',
    weaknessesTitle: 'Watch out for',
    compatibilityTitle: 'Compatibility',
    shareTitle: 'Share your result',
    retake: 'Retake',
    disclaimer: 'For entertainment · Not a scientific assessment.',
    notFound: 'Result not found.',
  },
} as const;

interface SessionRow {
  id: string;
  locale: string;
  profile_id: string | null;
  axis_scores: { T?: number; E?: number } | null;
}

async function fetchSession(sessionId: string): Promise<SessionRow | null> {
  if (!isSupabaseConfigured()) {
    // Local dev without DB — we can't reconstruct the result.
    return null;
  }
  // Touch headers so Next.js treats this as dynamic per request (consistent
  // with the IQ result page which uses headers() for the host lookup).
  headers();
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from('test_sessions')
    .select('id, locale, profile_id, axis_scores')
    .eq('id', sessionId)
    .eq('test_type', TETO_EGEN_TEST_TYPE)
    .single();
  if (error || !data) return null;
  return data as SessionRow;
}

export default async function TetoEgenResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const c = COPY[locale as 'ko' | 'en'] ?? COPY.ko;

  const session = await fetchSession(sessionId);
  if (!session || !session.profile_id) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {c.notFound}
      </div>
    );
  }

  const profile = getTetoEgenProfile(session.profile_id, locale);
  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {c.notFound}
      </div>
    );
  }

  const allProfiles = getAllTetoEgenProfiles(locale);
  const tScore = session.axis_scores?.T ?? 0;
  const eScore = session.axis_scores?.E ?? 0;
  const total = tScore + eScore || 1;
  const tPct = Math.round((tScore / total) * 100);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-8">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 px-6 py-8 text-white shadow-lg">
        <p className="text-xs uppercase tracking-widest opacity-80">{c.title}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight">{profile.name}</p>
        <p className="mt-2 text-sm leading-relaxed opacity-95">{profile.tagline}</p>
        <p className="mt-4 text-[11px] font-medium opacity-90">ⓘ {c.disclaimer}</p>
      </div>

      {/* T/E axis bar */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex justify-between text-xs font-semibold text-gray-500">
          <span>테토 {tPct}%</span>
          <span>에겐 {100 - tPct}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-emerald-400">
          <div
            className="h-full w-1 bg-gray-900"
            style={{ marginLeft: `${tPct}%` }}
            aria-hidden
          />
        </div>
      </section>

      {/* Description */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-gray-700">{profile.description}</p>
      </section>

      {/* Strengths / Weaknesses */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {c.strengthsTitle}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900">
            {profile.strengths.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            {c.weaknessesTitle}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {profile.weaknesses.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compatibility */}
      {profile.compatibility && (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-gray-900">{c.compatibilityTitle}</h2>
          <div className="mt-3 space-y-2">
            {allProfiles
              .filter((p) => p.id !== profile.id)
              .map((other) => (
                <div
                  key={other.id}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="text-sm font-bold text-gray-900">{other.name}</span>
                  <span className="text-xs leading-relaxed text-gray-600">
                    {profile.compatibility?.[other.id] ?? ''}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Ad — free result page only */}
      <ResultAd />

      {/* Retake */}
      <div className="mt-8">
        <Link href={`/${locale}/teto-egen`} prefetch>
          <Button size="md" variant="secondary" className="w-full">
            {c.retake}
          </Button>
        </Link>
      </div>
    </div>
  );
}
