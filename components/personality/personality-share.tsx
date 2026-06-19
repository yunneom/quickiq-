'use client';

import { useState } from 'react';

interface Props {
  locale: 'ko' | 'en';
  /** Absolute or root-relative URL of the canonical type page to share. */
  shareUrl: string;
  /** Pre-filled share text with the archetype baked in. */
  shareText: string;
  /** Optional 1080×1920 IG-story card URL — adds a third "stories" button. */
  storyCardUrl?: string;
}

const COPY = {
  ko: {
    title: '결과 공유하기',
    tagFriend: '👀 이 유형일 것 같은 친구에게 보내보세요',
    share: '공유하기',
    copy: '링크 복사',
    copied: '복사됨!',
    story: '📱 스토리용 이미지 저장',
    storyHint: '인스타·틱톡 스토리에 그대로 올릴 수 있어요',
  },
  en: {
    title: 'Share your result',
    tagFriend: '👀 Send this to a friend who fits the type',
    share: 'Share',
    copy: 'Copy link',
    copied: 'Copied!',
    story: '📱 Save story image',
    storyHint: 'Long-press to save, then upload to Instagram/TikTok story',
  },
} as const;

/**
 * Result-page share affordance built on the virality benchmark: pre-filled
 * copy with the archetype baked in (not "I took a quiz"), a tag-a-friend
 * prompt naming a specific reason to share, and a one-tap native share that
 * falls back to clipboard. The shared URL is the canonical per-type page so
 * the share also feeds SEO.
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

  async function onShare() {
    const data = { title: shareText, text: shareText, url: absoluteUrl };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled or unsupported — fall through to copy
      }
    }
    void onCopy();
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${absoluteUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — no-op
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-gray-900">{c.title}</h2>
      <p className="mt-1 text-xs text-gray-500">{c.tagFriend}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onShare}
          className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {c.share}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
        >
          {copied ? c.copied : c.copy}
        </button>
      </div>
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
