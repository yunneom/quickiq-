'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  sessionId: string;
  locale: 'ko' | 'en';
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * "친구 결과 비교" — paste a friend's session id, get a shareable
 * /compare/[friendId] URL. Two-way curiosity hook: the user wants to
 * see who scored higher, the friend wants to take the test back.
 */
export function CompareCard({ sessionId, locale }: Props) {
  const t = useTranslations('result');
  const [friendId, setFriendId] = useState('');
  const [copied, setCopied] = useState(false);

  const friendIdTrim = friendId.trim();
  const isValid = UUID_RE.test(friendIdTrim);
  const compareHref = isValid
    ? `/${locale}/result/${sessionId}/compare/${friendIdTrim}`
    : null;

  const copyLink = async () => {
    if (!compareHref) return;
    const url =
      typeof window === 'undefined'
        ? compareHref
        : new URL(compareHref, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-700">{t('compareLink')}</p>
      <p className="mt-1 text-[10px] text-gray-500">
        {t('compareFriendIdHint')}
      </p>
      <input
        type="text"
        value={friendId}
        onChange={(e) => setFriendId(e.target.value)}
        placeholder="00000000-0000-0000-0000-000000000000"
        className="mt-2 block w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
      <button
        type="button"
        disabled={!isValid}
        onClick={copyLink}
        className="mt-2 grid w-full place-items-center rounded-xl bg-brand-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {copied ? t('compareLinkCopied') : t('compareLink')}
      </button>
    </div>
  );
}
