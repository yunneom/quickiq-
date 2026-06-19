'use client';

import { useState } from 'react';

interface FaqEntry {
  q: string;
  a: string;
}

interface Props {
  locale: 'ko' | 'en';
  faqs: FaqEntry[];
}

const COPY = {
  ko: { title: '자주 묻는 질문' },
  en: { title: 'Frequently asked questions' },
} as const;

/**
 * Mobile-friendly accordion + invisible FaqPage JSON-LD payload emitted
 * via app/[locale]/<slug>/page.tsx. The JSON-LD lives in the page (not
 * this client component) so Google sees it without JS execution.
 */
export function TestFaq({ locale, faqs }: Props) {
  const c = COPY[locale];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="mt-10" aria-labelledby="test-faq-title">
      <h2
        id="test-faq-title"
        className="text-base font-semibold text-gray-900"
      >
        {c.title}
      </h2>
      <div className="mt-3 space-y-2">
        {faqs.map((f, i) => {
          const open = openIdx === i;
          return (
            <div
              key={f.q}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">
                  {f.q}
                </span>
                <span
                  aria-hidden
                  className={`text-base text-gray-400 transition-transform ${
                    open ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className="border-t border-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-700">
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
