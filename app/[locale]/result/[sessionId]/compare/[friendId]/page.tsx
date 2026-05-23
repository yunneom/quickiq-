import { notFound } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import type { ScoreResult, CategoryScores } from '@/lib/scoring';

interface ApiResponse {
  sessionId: string;
  locale: 'ko' | 'en';
  result: ScoreResult;
}

async function fetchOne(sessionId: string): Promise<ApiResponse | null> {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const url = `${proto}://${host}/api/test/result?sessionId=${sessionId}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as ApiResponse;
}

export const dynamic = 'force-dynamic';

export default async function ComparePage({
  params: { locale, sessionId, friendId },
}: {
  params: { locale: string; sessionId: string; friendId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = await getTranslations('result');

  const [you, friend] = await Promise.all([fetchOne(sessionId), fetchOne(friendId)]);

  if (!you || !friend) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-12">
        <p className="text-center text-sm text-gray-500">{t('compareMissing')}</p>
        <Link href={`/${locale}`} className="mt-8">
          <Button size="lg" className="w-full">
            {t('compareTakeNow')}
          </Button>
        </Link>
      </div>
    );
  }

  const a = you.result;
  const b = friend.result;
  const diff = a.estimatedIq - b.estimatedIq;
  const youHigher = diff >= 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
        IQ TEST · COMPARE
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {t('compareTitleAB', { a: t('compareYou'), b: t('compareFriend') })}
      </h1>

      {/* Side-by-side score cards */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <ScoreCard
          label={t('compareYou')}
          iq={a.estimatedIq}
          pct={a.topPercentile}
          accent
          winner={youHigher}
        />
        <ScoreCard
          label={t('compareFriend')}
          iq={b.estimatedIq}
          pct={b.topPercentile}
          winner={!youHigher}
        />
      </div>

      {/* Difference badge */}
      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {t('compareDifference')}: {diff > 0 ? '+' : ''}
          {diff} ({youHigher ? '🏆 ' + t('compareYou') : '🏆 ' + t('compareFriend')})
        </span>
      </div>

      {/* Per-category dumbbell */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-900">{t('categoryTitle')}</h2>
        <div className="mt-3 space-y-3">
          {(['verbal', 'numerical', 'spatial', 'logical'] as (keyof CategoryScores)[]).map((key) => (
            <DumbbellRow
              key={key}
              label={t(key)}
              you={a.categoryScores[key]}
              friend={b.categoryScores[key]}
              youLabel={t('compareYou')}
              friendLabel={t('compareFriend')}
            />
          ))}
        </div>
      </section>

      <div className="mt-10">
        <Link href={`/${locale}`} prefetch>
          <Button size="lg" className="w-full">
            {t('compareTakeNow')}
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">{t('disclaimer')}</p>
    </div>
  );
}

function ScoreCard({
  label,
  iq,
  pct,
  accent,
  winner,
}: {
  label: string;
  iq: number;
  pct: number;
  accent?: boolean;
  winner?: boolean;
}) {
  return (
    <div
      className={
        'rounded-2xl border p-4 ' +
        (accent
          ? 'border-brand-500 bg-brand-50'
          : 'border-gray-200 bg-white')
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label} {winner ? '🏆' : ''}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-gray-900">{iq}</p>
      <p className="text-xs text-gray-500">상위 {pct}%</p>
    </div>
  );
}

function DumbbellRow({
  label,
  you,
  friend,
  youLabel,
  friendLabel,
}: {
  label: string;
  you: number;
  friend: number;
  youLabel: string;
  friendLabel: string;
}) {
  const min = Math.min(you, friend);
  const max = Math.max(you, friend);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">
          {youLabel} {you} · {friendLabel} {friend}
        </span>
      </div>
      <div className="relative mt-1 h-2 w-full rounded-full bg-gray-100">
        <div
          className="absolute h-full rounded-full bg-gray-300"
          style={{ left: `${min}%`, width: `${Math.max(2, max - min)}%` }}
        />
        <div
          className="absolute -top-0.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-brand-600 shadow"
          style={{ left: `${you}%` }}
          title={youLabel}
        />
        <div
          className="absolute -top-0.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-gray-400 shadow"
          style={{ left: `${friend}%` }}
          title={friendLabel}
        />
      </div>
    </div>
  );
}
