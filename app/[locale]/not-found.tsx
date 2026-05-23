import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function LocaleNotFound() {
  const locale = useLocale();
  const t = useTranslations('errors');

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl">🔍</p>
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">404</h1>
      <p className="mt-4 text-lg font-semibold text-gray-900">{t('notFoundTitle')}</p>
      <p className="mt-2 text-sm text-gray-600">{t('notFoundBody')}</p>
      <Link href={`/${locale}`} className="mt-8 w-full max-w-xs">
        <Button size="lg" className="w-full">
          {t('goHome')}
        </Button>
      </Link>
    </div>
  );
}
