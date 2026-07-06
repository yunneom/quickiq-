'use client';

import { useState } from 'react';
import { shareToKakao } from '@/lib/share/kakao';

interface Props {
  locale: 'ko' | 'en';
  /** Absolute or root-relative URL of the canonical type page to share. */
  shareUrl: string;
  /** Pre-filled share text with the archetype baked in. */
  shareText: string;
  /** Optional 1080×1920 IG-story card URL — adds a "save story image" button. */
  storyCardUrl?: string;
}

const COPY = {
  ko: {
    title: '결과 공유하기',
    tagFriend: '👀 이 유형일 것 같은 친구에게 보내보세요',
    native: '기기 공유',
    kakao: '카카오톡',
    x: 'X',
    facebook: '페이스북',
    copy: '링크 복사',
    copied: '복사됨!',
    kakaoDesc: '내 유형 결과를 확인해보세요.',
    pasteHint: '클립보드에 복사됐어요. 카카오톡에 붙여넣기 하세요.',
    story: '📱 스토리용 이미지 저장',
    storyHint: '인스타·틱톡 스토리에 그대로 올릴 수 있어요',
  },
  en: {
    title: 'Share your result',
    tagFriend: '👀 Send this to a friend who fits the type',
    native: 'Share…',
    kakao: 'KakaoTalk',
    x: 'X',
    facebook: 'Facebook',
    copy: 'Copy link',
    copied: 'Copied!',
    kakaoDesc: 'Check out my result.',
    pasteHint: 'Copied — paste it into your chat.',
    story: '📱 Save story image',
    storyHint: 'Long-press to save, then upload to Instagram/TikTok story',
  },
} as const;

/**
 * Result-page share affordance built on the virality benchmark: pre-filled
 * copy with the archetype baked in (not "I took a quiz"), a tag-a-friend
 * prompt, and explicit share targets that work on desktop too. The native
 * Web Share sheet is offered as a top-right shortcut where available (great
 * on mobile), but desktop users still get KakaoTalk / X / Facebook / Copy
 * buttons instead of the degraded native-share dialog. Mirrors the IQ
 * result's ShareButtons so every test shares equally well.
 */
export function PersonalityShare({
  locale,
  shareUrl,
  shareText,
  storyCardUrl,
}: Props) {
  const c = COPY[locale];
  const [copied, setCopied] = useState(false);

  const absoluteUrl =
    typeof window !== 'undefined' && shareUrl.startsWith('/')
      ? `${window.location.origin}${shareUrl}`
      : shareUrl;

  const hasNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copyToClipboard(showToast = true) {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${absoluteUrl}`);
      if (showToast) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
      return true;
    } catch {
      return false;
    }
  }

  async function onNativeShare() {
    if (!hasNativeShare) {
      void copyToClipboard();
      return;
    }
    try {
      await navigator.share({ title: shareText, text: shareText, url: absoluteUrl });
    } catch {
      // user dismissed or share blocked — silent (explicit buttons remain)
    }
  }

  async function onKakao() {
    const ok = await shareToKakao({
      title: shareText,
      description: c.kakaoDesc,
      imageUrl: `${absoluteUrl}/opengraph-image`,
      linkUrl: absoluteUrl,
    });
    // No app key / domain not registered → copy so the referral loop still closes.
    if (!ok) {
      await copyToClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(absoluteUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    absoluteUrl,
  )}`;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{c.title}</h2>
          <p className="mt-1 text-xs text-gray-500">{c.tagFriend}</p>
        </div>
        {hasNativeShare && (
          <button
            type="button"
            onClick={onNativeShare}
            className="flex-shrink-0 text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            {c.native}
          </button>
        )}
      </div>

      <div
        className={
          'mt-3 grid gap-2 ' + (locale === 'ko' ? 'grid-cols-4' : 'grid-cols-3')
        }
      >
        {locale === 'ko' && (
          <button
            type="button"
            onClick={onKakao}
            className="grid place-items-center rounded-xl border border-amber-200 bg-amber-50 py-3 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            {c.kakao}
          </button>
        )}
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className="grid place-items-center rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {c.x}
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="grid place-items-center rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {c.facebook}
        </a>
        <button
          type="button"
          onClick={() => void copyToClipboard()}
          className="grid place-items-center rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {copied ? c.copied : c.copy}
        </button>
      </div>

      {copied && (
        <p className="mt-2 text-[10px] text-emerald-600">{c.pasteHint}</p>
      )}

      {storyCardUrl && (
        <a
          href={storyCardUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-gray-300"
        >
          {c.story}
          <span className="mt-0.5 block text-[11px] font-normal text-gray-500">
            {c.storyHint}
          </span>
        </a>
      )}
    </section>
  );
}
