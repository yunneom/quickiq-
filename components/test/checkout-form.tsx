'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/components/analytics/meta-pixel';
import { suggestEmailFix } from '@/lib/email-typo';
import { priceKRW } from '@/lib/pricing';

interface Props {
  sessionId: string;
  locale: 'ko' | 'en';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface TossCheckout {
  mode: 'toss';
  clientKey: string;
  orderId: string;
  amount: number;
  orderName: string;
  customerEmail: string;
  successUrl: string;
  failUrl: string;
}

// Minimal shape of the Toss SDK we use (loaded via <script>).
interface TossPaymentsSDK {
  requestPayment: (
    method: string,
    opts: {
      amount: number;
      orderId: string;
      orderName: string;
      customerEmail?: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
}
declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsSDK;
  }
}

/** Load the Toss SDK once, on demand. */
function loadTossSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'));
    if (window.TossPayments) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-toss]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('toss sdk load failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://js.tosspayments.com/v1/payment';
    s.dataset.toss = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('toss sdk load failed'));
    document.head.appendChild(s);
  });
}

export function CheckoutForm({ sessionId, locale }: Props) {
  const t = useTranslations('checkout');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Only suggest when the email looks roughly complete (has @ and a dot
  // in the domain) so users don't see flicker on every keystroke.
  const suggestion = useMemo(() => {
    if (!email.includes('@')) return null;
    return suggestEmailFix(email);
  }, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError(t('emailInvalid'));
      return;
    }
    setBusy(true);
    trackEvent('InitiateCheckout', { value: priceKRW(), currency: 'KRW' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, email, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'checkout_failed');

      // Kakao Pay path: server already opened the payment session and
      // returned the Kakao-hosted redirect URL. Just send the buyer there;
      // Kakao bounces back to /api/payments/kakaopay/approve on success.
      if (data.mode === 'kakaopay') {
        const url = (data as { mobileUrl?: string; pcUrl?: string }).mobileUrl
          ?? (data as { pcUrl?: string }).pcUrl;
        if (!url) throw new Error('kakaopay_no_url');
        window.location.href = url;
        return;
      }

      // Toss Payments path: load the SDK and open the hosted payment UI.
      if (data.mode === 'toss') {
        const d = data as TossCheckout;
        await loadTossSdk();
        if (!window.TossPayments) throw new Error('toss sdk unavailable');
        const toss = window.TossPayments(d.clientKey);
        await toss.requestPayment('카드', {
          amount: d.amount,
          orderId: d.orderId,
          orderName: d.orderName,
          customerEmail: d.customerEmail,
          successUrl: d.successUrl,
          failUrl: d.failUrl,
        });
        return; // Toss redirects away; if it resolves without redirect, leave busy.
      }

      // Redirect path: Lemon Squeezy / mock checkout.
      if (!data.url) throw new Error('checkout_failed');
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(t('errorGeneric'));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('emailLabel')}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          autoComplete="email"
          inputMode="email"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && suggestion && (
          <button
            type="button"
            onClick={() => setEmail(suggestion)}
            className="mt-1 text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            {t('emailSuggest', { suggestion })}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-600">Detailed IQ Report</span>
        <span className="text-base font-bold text-gray-900">{t('priceLabel')}</span>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? t('processing') : t('payButton')}
      </Button>
    </form>
  );
}
