/**
 * Meta Conversion API — server-side Purchase event.
 * No-op when env vars are missing (dev mode).
 */

import crypto from 'node:crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

interface PurchaseInput {
  email: string;
  value: number;
  currency: string;
  eventId: string;
}

function sha256Lower(s: string): string {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

export async function sendPurchaseEventCAPI(input: PurchaseInput): Promise<void> {
  if (!PIXEL_ID || !TOKEN) {
    console.log('[CAPI] skipped (env missing):', { eventId: input.eventId, value: input.value });
    return;
  }
  try {
    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${TOKEN}`;
    const body = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          action_source: 'website',
          user_data: { em: [sha256Lower(input.email)] },
          custom_data: { value: input.value, currency: input.currency },
        },
      ],
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error('[CAPI] failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[CAPI] error:', err);
  }
}
