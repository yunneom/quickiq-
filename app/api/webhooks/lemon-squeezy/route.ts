import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { verifyWebhookSignature } from '@/lib/payments/lemon-squeezy';
import { getSession, updateSession } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { sendReport } from '@/lib/email/send-report';
import { sendPurchaseEventCAPI } from '@/lib/analytics/capi';

export const runtime = 'nodejs';

interface LSWebhookPayload {
  meta?: {
    event_name?: string;
    custom_data?: { session_id?: string; locale?: 'ko' | 'en' };
    webhook_id?: string;
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      user_email?: string;
      total?: number;
      currency?: string;
      order_id?: number;
      customer_id?: number;
      status?: string;
    };
  };
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-signature');
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  let payload: LSWebhookPayload;
  try {
    payload = JSON.parse(raw) as LSWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  if (eventName !== 'order_created') {
    return NextResponse.json({ ok: true, ignored: eventName });
  }
  const sessionId = payload.meta?.custom_data?.session_id;
  const email = payload.data?.attributes?.user_email;
  const eventId = payload.meta?.webhook_id ?? payload.data?.id;
  if (!sessionId || !email || !eventId) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      // Idempotency check via ls_event_id unique constraint.
      const { error: dupErr } = await admin.from('payments').insert({
        session_id: sessionId,
        ls_event_id: eventId,
        ls_order_id: String(payload.data?.attributes?.order_id ?? ''),
        ls_customer_id: payload.data?.attributes?.customer_id
          ? String(payload.data.attributes.customer_id)
          : null,
        email,
        amount_cents: payload.data?.attributes?.total ?? 0,
        currency: payload.data?.attributes?.currency ?? 'USD',
        status: 'paid',
        raw_payload: payload,
      });
      if (dupErr) {
        // Code 23505 = unique_violation → already processed
        if (String(dupErr.code) === '23505') {
          return NextResponse.json({ ok: true, duplicate: true });
        }
        throw dupErr;
      }
      await admin
        .from('test_sessions')
        .update({ email, is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (err) {
      console.error('[webhook] supabase write failed:', err);
      Sentry.captureException(err, { tags: { area: 'webhook', step: 'supabase' }, extra: { sessionId } });
    }
  } else {
    updateSession(sessionId, { email, is_paid: true, paid_at: Date.now() });
  }

  const session = getSession(sessionId);
  await sendReport({
    sessionId,
    email,
    locale: payload.meta?.custom_data?.locale ?? session?.locale ?? 'ko',
    result: session?.result,
  });
  await sendPurchaseEventCAPI({
    email,
    value: (payload.data?.attributes?.total ?? 990) / 100,
    currency: payload.data?.attributes?.currency ?? 'USD',
    eventId,
  });

  return NextResponse.json({ ok: true });
}
