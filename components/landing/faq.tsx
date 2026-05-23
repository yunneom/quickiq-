'use client';

import { useState } from 'react';
import { useMessages, useTranslations } from 'next-intl';

interface FaqItem {
  q: string;
  a: string;
}

export function Faq() {
  const t = useTranslations('landing');
  // useMessages gives us the raw JSON tree — needed to read the `faqs` array
  // as a list rather than calling t() for each unknown-length key.
  const messages = useMessages() as unknown as { landing?: { faqs?: FaqItem[] } };
  const faqs: FaqItem[] = messages?.landing?.faqs ?? [];
  const [open, setOpen] = useState<number | null>(null);

  if (!faqs.length) return null;

  return (
    <section className="mt-12">
      <h2 className="text-base font-semibold text-gray-900">{t('faqTitle')}</h2>
      <ul className="mt-3 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        {faqs.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                <span>{item.q}</span>
                <span
                  className={
                    'text-base text-gray-400 transition-transform ' +
                    (isOpen ? 'rotate-45' : '')
                  }
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
