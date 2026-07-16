'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { shareToKakao } from '@/lib/share/kakao';
import { markShareBonusUnlocked } from '@/components/test/share-bonus';

interface Props {
  pct: number;
  locale: 'ko' | 'en';
  url: string;
  /** Optional — when set, enables an "Save result image" button. */
  sessionId?: string;
}

export function ShareButtons({ pct, locale, url, sessionId }: Props) {
  const t = useTranslations('result');
  const [copied, setCopied] = useState(false);
  const text = t('shareText', { pct });
  // Prefer the 8-char short URL `/r/{code}` over the full
  // `/{locale}/result/{uuid}` path when we know the session id. Short
  // URLs are dramatically easier to share via SMS / voice / printed QR
  // and still resolve to the right locale because /r looks up the
  // session's saved locale before redirecting.
  const longUrl =
    typeof window === 'undefined'
      ? url
      : new URL(url, window.location.origin).toString();
  const absoluteUrl =
    sessionId && typeof window !== 'undefined'
      ? `${window.location.origin}/r/${sessionId.slice(0, 8)}`
      : longUrl;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${absoluteUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      // Share-to-unlock: a successful copy counts as a share intent.
      markShareBonusUnlocked();
    } catch {
      // ignore
    }
  };

  // Web Share API — when available (most mobile browsers, Safari 12+,
  // Edge/Chrome on Android), opens the OS native share sheet. Lets
  // users pick from any installed app (Messages, KakaoTalk, Telegram,
  // LinkedIn, etc.) instead of being limited to the four buttons.
  const nativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      void copy();
      return;
    }
    try {
      await navigator.share({ title: t('shareTitle'), text, url: absoluteUrl });
      markShareBonusUnlocked();
    } catch {
      // user dismissed the share sheet or share blocked — silent
    }
  };
  const hasNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(absoluteUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    absoluteUrl,
  )}`;

  // Always show the Kakao button for KO users. If the SDK can't open
  // the share sheet (no app key, domain mismatch, blocked init), we
  // gracefully fall back to copying the share text + URL to the clipboard
  // and showing a toast — the user can then paste it into KakaoTalk
  // manually, which still completes the referral loop.
  const handleKakao = async () => {
    // Card image must be the real OG route — `${absoluteUrl}/opengraph-image`
    // resolved to /r/{code}/opengraph-image, which doesn't exist (404), so
    // KakaoTalk cards went out imageless.
    const imageUrl =
      sessionId && typeof window !== 'undefined'
        ? `${window.location.origin}/${locale}/result/${sessionId}/opengraph-image`
        : `${longUrl}/opengraph-image`;
    const ok = await shareToKakao({
      title: text,
      description:
        locale === 'ko' ? 'IQ 테스트 결과를 확인해보세요.' : 'Check out my IQ test result.',
      imageUrl,
      linkUrl: absoluteUrl,
    });
    if (ok) markShareBonusUnlocked();
    if (!ok) {
      try {
        await navigator.clipboard.writeText(`${text}\n${absoluteUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // last-resort: ignore — the per-button Copy still works
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{t('shareTitle')}</p>
        {hasNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            {t('shareNative')}
          </button>
        )}
      </div>
      <div
        className={
          'mt-3 grid gap-2 ' +
          (locale === 'ko' ? 'grid-cols-4' : 'grid-cols-3')
        }
      >
        {locale === 'ko' && (
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
      {copied && (
        <p className="mt-2 text-[10px] text-emerald-600">
          {t('shareKakaoFallback')}
        </p>
      )}

      {sessionId && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a
            href={`/${locale}/result/${sessionId}/opengraph-image`}
            download={`iq-result-top-${pct}pct.png`}
            className="grid place-items-center rounded-xl border border-gray-200 bg-gray-50 py-3 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
          >
            {t('downloadImage')}
          </a>
          <a
            href={`/${locale}/result/${sessionId}/feed-image`}
            download={`iq-feed-top-${pct}pct.png`}
            className="grid place-items-center rounded-xl border border-pink-200 bg-pink-50 py-3 text-[11px] font-semibold text-pink-900 hover:bg-pink-100"
          >
            {t('downloadFeed')}
          </a>
          <a
            href={`/${locale}/result/${sessionId}/story-image`}
            download={`iq-story-top-${pct}pct.png`}
            className="grid place-items-center rounded-xl border border-amber-200 bg-amber-50 py-3 text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
          >
            {t('downloadStory')}
          </a>
        </div>
      )}
    </div>
  );
}
