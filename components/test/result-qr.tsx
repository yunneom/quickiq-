'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  url: string;
}

/**
 * QR code via api.qrserver.com — free public service, no API key,
 * generates a PNG QR from a URL. Used on the result page so a buyer
 * can show their phone to a friend in person ("scan this") rather than
 * messaging the link.
 *
 * Lazy-rendered after a 600 ms delay so it doesn't hold up LCP.
 */
export function ResultQr({ url }: Props) {
  const t = useTranslations('result');
  const [ready, setReady] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState(url);

  useEffect(() => {
    setAbsoluteUrl(new URL(url, window.location.origin).toString());
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, [url]);

  if (!ready) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(absoluteUrl)}`;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="grid h-24 w-24 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="QR"
          width={96}
          height={96}
          loading="lazy"
          className="h-24 w-24"
        />
      </div>
      <div className="text-xs text-gray-600">
        <p className="text-sm font-semibold text-gray-800">{t('qrTitle')}</p>
        <p className="mt-1">{t('qrHint')}</p>
      </div>
    </div>
  );
}
