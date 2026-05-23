'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  sessionId: string;
  locale: 'ko' | 'en';
}

/**
 * Action row for buyers on the result page: download the PDF directly
 * (backup channel if the Resend email never arrived) and re-trigger a
 * fresh email if needed.
 */
export function PaidActions({ sessionId, locale }: Props) {
  const t = useTranslations('result');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resend = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/email/resend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setMsg(res.ok ? t('resendOk') : t('resendErr'));
    } catch {
      setMsg(t('resendErr'));
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div className="mt-4 grid gap-2">
      <a
        href={`/api/test/pdf?sessionId=${sessionId}`}
        className="grid place-items-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
      >
        {t('downloadPdf')}
      </a>
      <button
        type="button"
        onClick={resend}
        disabled={busy}
        className="grid place-items-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {t('resendEmail')}
      </button>
      {msg && (
        <p className="text-center text-[11px] text-gray-500">{msg}</p>
      )}
      {/* hint that locale-en uses the same lib only with different copy */}
      {locale === 'en' ? null : null}
    </div>
  );
}
