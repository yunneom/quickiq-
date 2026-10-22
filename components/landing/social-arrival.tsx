'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/** Where the daily puzzle runs — a visitor from one of these just solved one. */
const SOCIAL_SOURCES = new Set(['instagram', 'threads', 'tiktok', 'youtube']);

/**
 * Challenge banner for visitors arriving from the daily puzzle posts.
 * They came off a "can you solve it?" — keep that momentum instead of
 * greeting them with the generic headline. Read client-side so the
 * landing page stays static (LCP); everyone else never sees it.
 */
export function SocialArrival() {
  const t = useTranslations('landing.socialArrival');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const source = new URLSearchParams(window.location.search)
      .get('utm_source')
      ?.toLowerCase();
    setShow(Boolean(source && SOCIAL_SOURCES.has(source)));
  }, []);

  if (!show) return null;
  return (
    <div
      className="mb-6 rounded-2xl bg-gray-900 px-4 py-4 text-white"
      data-testid="social-arrival"
    >
      <p className="text-base font-bold leading-snug">🧠 {t('title')}</p>
      <p className="mt-1.5 text-base leading-relaxed text-gray-300">{t('body')}</p>
    </div>
  );
}
