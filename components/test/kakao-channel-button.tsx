'use client';

import { useTranslations } from 'next-intl';
import { addKakaoChannel, isKakaoChannelConfigured } from '@/lib/share/kakao';

/**
 * "카카오톡 채널 추가" CTA shown on the thank-you page. Hidden when
 * NEXT_PUBLIC_KAKAO_CHANNEL_ID is not configured.
 */
export function KakaoChannelButton() {
  const t = useTranslations('thankYou');
  if (!isKakaoChannelConfigured()) return null;

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
      <p className="text-sm font-semibold text-amber-900">{t('kakaoChannelTitle')}</p>
      <p className="mt-1 text-xs text-amber-700">{t('kakaoChannelDesc')}</p>
      <button
        type="button"
        onClick={() => {
          void addKakaoChannel();
        }}
        className="mt-3 grid w-full place-items-center rounded-xl bg-amber-400 py-3 text-sm font-bold text-amber-950 hover:bg-amber-500"
      >
        💬 {t('kakaoChannelTitle')}
      </button>
    </div>
  );
}
