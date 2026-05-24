import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { waitUntil } from '@vercel/functions';
import { verifyWebhookSignature } from '@/lib/payments/lemon-squeezy';
import { getSession, updateSession, markEventProcessed } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { sendReport } from '@/lib/email/send-report';
import { sendPurchaseEventCAPI } from '@/lib/analytics/capi';

export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel — allow background work to finish

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
  const check = verifyWebhookSignature(raw, signature);
  if (!check.ok) {
    console.error('[webhook] signature verify failed', {
      reason: check.reason,
      bodyLen: raw.length,
      sigLen: signature?.length ?? 0,
      sigPrefix: signature?.slice(0, 12) ?? null,
    });
    // Surface to Sentry at warning level (not error) so it shows in the
    // dashboard but doesn't page the operator. Persistent volume here =
    // either LS secret drift or an attacker probing — both deserve eyes.
    Sentry.captureMessage('webhook signature verify failed', {
      level: 'warning',
      tags: { area: 'webhook', step: 'verify' },
      extra: {
        reason: check.reason,
        bodyLen: raw.length,
        sigLen: signature?.length ?? 0,
      },
    });
    return NextResponse.json(
      { error: 'invalid_signature', reason: check.reason },
      { status: 401 },
    );
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
    // This is *our* config bug (the LS checkout custom_data isn't set
    // correctly) or LS sending an event we didn't expect. Surface it
    // so we notice instead of silently 400-ing every order.
    console.error('[webhook] missing required fields', {
      hasSessionId: Boolean(sessionId),
      hasEmail: Boolean(email),
      hasEventId: Boolean(eventId),
      eventName,
    });
    Sentry.captureMessage('webhook missing required fields', {
      level: 'error',
      tags: { area: 'webhook', step: 'parse' },
      extra: {
        hasSessionId: Boolean(sessionId),
        hasEmail: Boolean(email),
        hasEventId: Boolean(eventId),
        eventName,
      },
    });
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
    // In-memory fallback: dedupe by event id so an LS retry after a slow
    // first attempt doesn't trigger a second email.
    const seen = markEventProcessed(eventId);
    if (seen.duplicate) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    updateSession(sessionId, { email, is_paid: true, paid_at: Date.now() });
  }

  // Heavy work (PDF render, Resend, Meta CAPI) runs in the background so
  // Lemon Squeezy gets a fast 200 well under its 15-second webhook timeout.
  // waitUntil extends the function's lifetime until the promise resolves,
  // so the buyer's email still goes out even though we already responded.
  const session = getSession(sessionId);
  const locale = payload.meta?.custom_data?.locale ?? session?.locale ?? 'ko';
  const totalCents = payload.data?.attributes?.total ?? 990;
  const currency = payload.data?.attributes?.currency ?? 'USD';

  waitUntil(
    (async () => {
      try {
        await sendReport({
          sessionId,
          email,
          locale,
          result: session?.result,
        });
      } catch (err) {
        console.error('[webhook bg] sendReport failed:', err);
        Sentry.captureException(err, {
          tags: { area: 'webhook', step: 'sendReport' },
          extra: { sessionId },
        });
      }
      try {
        await sendPurchaseEventCAPI({
          email,
          value: totalCents / 100,
          currency,
          eventId,
        });
      } catch (err) {
        console.error('[webhook bg] CAPI failed:', err);
        Sentry.captureException(err, {
          tags: { area: 'webhook', step: 'capi' },
          extra: { sessionId },
        });
      }
    })(),
  );

  return NextResponse.json({ ok: true });
}
