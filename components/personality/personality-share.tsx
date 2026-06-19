'use client';

import { useState } from 'react';

interface Props {
  locale: 'ko' | 'en';
  /** Absolute or root-relative URL of the canonical type page to share. */
  shareUrl: string;
  /** Pre-filled share text with the archetype baked in. */
  shareText: string;
}

const COPY = {
  ko: {
    title: '결과 공유하기',
    tagFriend: '👀 이 유형일 것 같은 친구에게 보내보세요',
    share: '공유하기',
    copy: '링크 복사',
    copied: '복사됨!',
  },
  en: {
    title: 'Share your result',
    tagFriend: '👀 Send this to a friend who fits the type',
    share: 'Share',
    copy: 'Copy link',
    copied: 'Copied!',
  },
} as const;

/**
 * Result-page share affordance built on the virality benchmark: pre-filled
 * copy with the archetype baked in (not "I took a quiz"), a tag-a-friend
 * prompt naming a specific reason to share, and a one-tap native share that
 * falls back to clipboard. The shared URL is the canonical per-type page so
 * the share also feeds SEO.
 */
export function PersonalityShare({ locale, shareUrl, shareText }: Props) {
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
    </section>
  );
}
