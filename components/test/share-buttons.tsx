'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { isKakaoConfigured, shareToKakao } from '@/lib/share/kakao';

interface Props {
  pct: number;
  locale: 'ko' | 'en';
  url: string;
}

export function ShareButtons({ pct, locale, url }: Props) {
  const t = useTranslations('result');
  const [copied, setCopied] = useState(false);
  const text = t('shareText', { pct });
  const absoluteUrl =
    typeof window === 'undefined'
      ? url
      : new URL(url, window.location.origin).toString();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${absoluteUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(absoluteUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    absoluteUrl,
  )}`;

  const kakaoEnabled = isKakaoConfigured();
  const handleKakao = async () => {
    await shareToKakao({
      title: text,
      description:
        locale === 'ko' ? 'IQ 테스트 결과를 확인해보세요.' : 'Check out my IQ test result.',
      imageUrl: `${absoluteUrl}/opengraph-image`,
      linkUrl: absoluteUrl,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-700">{t('shareTitle')}</p>
      <div
        className={
          'mt-3 grid gap-2 ' +
          (locale === 'ko' && kakaoEnabled ? 'grid-cols-4' : 'grid-cols-3')
        }
      >
        {locale === 'ko' && kakaoEnabled && (
          <button
            type="button"
            onClick={handleKakao}
            className="grid place-items-center rounded-xl border border-amber-200 bg-amber-50 py-3 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            {t('shareKakao')}
          </button>
        )}
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className="grid place-items-center rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('shareX')}
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="grid place-items-center rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('shareFacebook')}
        </a>
        <button
          type="button"
          onClick={copy}
          className="grid place-items-center rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {copied ? t('shareCopied') : t('shareCopy')}
        </button>
      </div>
      {locale === 'ko' && !kakaoEnabled && (
        <p className="mt-2 text-[10px] text-gray-400">
          카카오톡 공유는 운영 시 NEXT_PUBLIC_KAKAO_APP_KEY 등록 후 활성화됩니다.
        </p>
      )}
    </div>
  );
}
