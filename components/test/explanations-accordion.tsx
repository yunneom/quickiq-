'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Row {
  order_index: number;
  category: 'verbal' | 'numerical' | 'spatial' | 'logical';
  question_text: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  chosen: 'A' | 'B' | 'C' | 'D' | null;
  correct: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  explanation: string;
  time_ms: number;
}

interface Props {
  sessionId: string;
}

const CATEGORY_PILL: Record<Row['category'], string> = {
  verbal: 'bg-violet-50 text-violet-700',
  numerical: 'bg-sky-50 text-sky-700',
  spatial: 'bg-amber-50 text-amber-700',
  logical: 'bg-emerald-50 text-emerald-700',
};

/**
 * Paid-only accordion of the 30-question breakdown. Lazy-fetches once
 * (no IntersectionObserver — already gated by DeferMount upstream),
 * caches results in component state, and renders the same content the
 * PDF carries on its breakdown page. Gives users instant gratification
 * during the ~30s Resend window before the PDF email arrives.
 */
export function ExplanationsAccordion({ sessionId }: Props) {
  const t = useTranslations('result');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/test/explanations?sessionId=${encodeURIComponent(sessionId)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) {
          setErr(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as { rows: Row[] };
        if (!cancelled) setRows(data.rows);
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-gray-900">
        {t('explanationsTitle')}
      </h2>
      <p className="mt-1 text-xs text-gray-500">{t('explanationsHint')}</p>

      {!rows && !err && (
        <p className="mt-3 text-center text-xs text-gray-400">
          {t('explanationsLoading')}
        </p>
      )}
      {err && (
        <p className="mt-3 text-center text-xs text-red-500">{err}</p>
      )}

      {rows && (
        <ul className="mt-3 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {rows.map((r, idx) => {
            const isOpen = openIdx === idx;
            return (
              <li key={`${r.order_index}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-start gap-2 px-3 py-3 text-left hover:bg-gray-50"
                >
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                    {r.order_index}
                  </span>
                  <span
                    className={
                      'self-start rounded-full px-1.5 py-0.5 text-[10px] font-semibold ' +
                      CATEGORY_PILL[r.category]
                    }
                  >
                    {t(r.category)}
                  </span>
                  <span className="flex-1 truncate text-xs text-gray-700">
                    {r.question_text}
                  </span>
                  <span
                    className={
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
                      (r.is_correct
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600')
                    }
                  >
                    {r.is_correct
                      ? t('explanationsCorrect')
                      : t('explanationsWrong')}
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-1.5 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                    <p className="whitespace-pre-line leading-relaxed">
                      {r.question_text}
                    </p>
                    <p className="flex gap-3 text-[11px] text-gray-500">
                      <span>
                        {t('explanationsChose')}:{' '}
                        <span
                          className={
                            r.is_correct ? 'text-emerald-700' : 'text-red-600'
                          }
                        >
                          {r.chosen ?? '—'}
                        </span>
                      </span>
                      <span>
                        {t('explanationsAnswer')}:{' '}
                        <span className="text-gray-900">{r.correct}</span>
                      </span>
                    </p>
                    <p className="leading-relaxed text-gray-800">
                      {r.explanation}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
