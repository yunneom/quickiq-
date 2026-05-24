import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';

// Per-session result URL — has no SEO value (unique UUID, user-owned).
// We still want Google to follow share links for crawl discovery but
// not index them, to keep result URLs from polluting search.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};
import { Button } from '@/components/ui/button';
import { CategoryBars } from '@/components/test/category-bars';
import { FunnelBeacon } from '@/components/analytics/funnel-beacon';
import { CategoryRadar } from '@/components/test/category-radar';
import { CompareCard } from '@/components/test/compare-card';
import { ResultQr } from '@/components/test/result-qr';
import { InstallPrompt } from '@/components/test/install-prompt';
import { ExitIntentModal } from '@/components/test/exit-intent-modal';
import { DeferMount } from '@/components/test/defer-mount';
import { IqDistribution } from '@/components/test/iq-distribution';
import { TimingBars } from '@/components/test/timing-bars';
import { ShareButtons } from '@/components/test/share-buttons';
import { ShareBonus } from '@/components/test/share-bonus';
import { PaidActions } from '@/components/test/paid-actions';
import { locales, type Locale } from '@/i18n';
import type { ScoreResult } from '@/lib/scoring';
import {
  AVERAGE_CATEGORY_SCORES,
  classifyIq,
  leadSizeKey,
  strengthsAndWeaknesses,
  summaryHookKey,
} from '@/lib/scoring/classify';

interface ApiResponse {
  sessionId: string;
  locale: 'ko' | 'en';
  isPaid: boolean;
  durationMs: number | null;
  result: ScoreResult;
}

async function fetchResult(sessionId: string): Promise<ApiResponse | null> {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const url = `${proto}://${host}/api/test/result?sessionId=${sessionId}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as ApiResponse;
}

function formatDuration(
  ms: number | null,
  format: (vars: { min: number; sec: number }) => string,
): string | null {
  // Skip the chip entirely for ultra-short sessions (test-runner shortcuts,
  // QA bots, etc.) — those would just render "0m 0s" which looks broken.
  if (!ms || ms < 1500) return null;
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return format({ min, sec });
}

export default async function ResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = await getTranslations('result');
  const tErr = await getTranslations('errors');
  const tThanks = await getTranslations('thankYou');

  const data = await fetchResult(sessionId);
  if (!data) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {tErr('sessionNotFound')}
      </div>
    );
  }

  const { result, isPaid, durationMs } = data;
  const classKey = classifyIq(result.estimatedIq);
  const { strength, weakness } = strengthsAndWeaknesses(result.categoryScores);
  const hookKey = summaryHookKey(result.topPercentile);
  const leadKey = leadSizeKey(result.categoryScores);
  const signatureKey =
    leadKey === 'dominant'
      ? 'signatureDominant'
      : leadKey === 'clear'
      ? 'signatureClear'
      : 'signatureBalanced';
  const durationLabel = formatDuration(durationMs, ({ min, sec }) =>
    t('durationFormat', { min, sec }),
  );
  const shareUrl = `/${locale}`;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-8">
      <FunnelBeacon event="IQ_ResultViewed" params={{ isPaid }} />
      {/* Hero score card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-white shadow-lg">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-white/5" />

        <div className="relative" data-testid="result-hero">
          <p className="text-xs uppercase tracking-widest opacity-80">
            {t('title')}
          </p>
          <p
            className="mt-2 text-5xl font-extrabold tracking-tight"
            data-testid="result-percentile"
          >
            {t('topPercentile', { pct: result.topPercentile })}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              {t('estimatedIq', { iq: result.estimatedIq })}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              {t(`classification.${classKey}`)}
            </span>
            {durationLabel && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                {durationLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm text-gray-600">{t(hookKey)}</p>

      {/* IQ bell-curve distribution with user position */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {locale === 'ko' ? '인구 분포 내 위치' : 'Where you stand'}
        </p>
        <div className="mt-2">
          <IqDistribution iq={result.estimatedIq} />
        </div>
      </section>

      {/* Strength / Weakness — visible to free users to whet appetite */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {t('strength')}
          </p>
          <p className="mt-1 text-base font-bold text-emerald-900">
            {t(strength)}
          </p>
          <p className="text-xs text-emerald-700">
            {result.categoryScores[strength]}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            {t('weakness')}
          </p>
          <p className="mt-1 text-base font-bold text-amber-900">
            {t(weakness)}
          </p>
          <p className="text-xs text-amber-700">
            {result.categoryScores[weakness]}
          </p>
        </div>
      </section>

      {/* Radar overview — 4 domains at a glance */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-gray-900">{t('radarTitle')}</h2>
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
          <CategoryRadar
            scores={result.categoryScores}
            compareTo={AVERAGE_CATEGORY_SCORES}
          />
          <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-brand-600" />
              {t('youLabel')}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-sm bg-slate-400" />
              {t('avgLabel')}
            </span>
          </div>
        </div>
      </section>

      {/* Free signature-insight card — narrative tease above the paywall,
          chosen by the gap between #1 and #2 category. Wider gap = louder
          copy variant. Always shown (paid users get a pleasant recap;
          free users get a FOMO hook). */}
      <section className="mt-6 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
          {t('signatureTitle')}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-800">
          {t(signatureKey, { cat: t(strength) })}
        </p>
      </section>

      {/* Category bars */}
      <section className="mt-6">
        <h2 className="flex items-center justify-between text-base font-semibold text-gray-900">
          <span>{t('compareTitle')}</span>
          {!isPaid && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              🔒
            </span>
          )}
        </h2>
        <div className="relative mt-3 rounded-2xl border border-gray-200 bg-white p-4">
          <CategoryBars scores={result.categoryScores} blurred={!isPaid} />
          {!isPaid && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-gradient-to-t from-white/95 via-white/40 to-transparent">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow">
                🔒 {t('lockNotice')}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-6">
        {!isPaid ? (
          <Link href={`/${locale}/checkout/${sessionId}`} prefetch>
            <Button size="lg" className="w-full">
              {t('buyCta')}
            </Button>
          </Link>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              ✅ {tThanks('body')}
            </div>
            <PaidActions sessionId={sessionId} locale={locale as Locale} />
          </div>
        )}
      </div>

      {/* Timing per category — surface "fast intuitive" strength */}
      {result.categoryTiming && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-gray-900">
            {t('timingTitle')}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{t('timingHint')}</p>
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
            <TimingBars timing={result.categoryTiming} />
          </div>
        </section>
      )}

      {/* Share */}
      <div className="mt-8">
        <ShareButtons
          pct={result.topPercentile}
          locale={locale as Locale}
          url={shareUrl}
          sessionId={sessionId}
        />
      </div>

      {/* Share-to-unlock bonus — hidden until a share action fires */}
      <ShareBonus pct={result.topPercentile} />

      {/* Compare with a friend */}
      <div className="mt-4">
        <CompareCard sessionId={sessionId} locale={locale as Locale} />
      </div>

      {/* QR + Install + Retake — all below-the-fold; defer mount to
          keep the hero/category breakdown LCP path lean. */}
      <DeferMount placeholderClassName="mt-4 h-64">
        <div className="mt-4">
          <ResultQr url={`/${locale}/result/${sessionId}`} />
        </div>
        <div className="mt-4">
          <InstallPrompt />
        </div>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-700">{t('retakeTitle')}</p>
          <p className="mt-1 text-xs text-gray-500">{t('retakeBody')}</p>
          <Link href={`/${locale}/test`} className="mt-3 block">
            <Button size="md" variant="secondary" className="w-full">
              {t('retakeCta')}
            </Button>
          </Link>
        </div>
      </DeferMount>

      <p className="mt-8 text-center text-xs text-gray-400">{t('disclaimer')}</p>

      {/* Exit-intent modal — free users only, one-shot dismissal */}
      {!isPaid && (
        <ExitIntentModal locale={locale as Locale} sessionId={sessionId} />
      )}
    </div>
  );
}
