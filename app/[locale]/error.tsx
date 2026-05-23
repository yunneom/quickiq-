'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('errors');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">{t('pageError')}</h1>
      <p className="mt-2 text-sm text-gray-600">{t('pageErrorBody')}</p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-gray-400">id: {error.digest}</p>
      )}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        <Button size="lg" onClick={reset}>
          {t('retry')}
        </Button>
        <Link href={`/${locale}`} className="block">
          <Button size="lg" variant="secondary" className="w-full">
            {t('goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
