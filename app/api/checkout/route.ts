import { NextResponse } from 'next/server';
import { createCheckoutUrl } from '@/lib/payments/lemon-squeezy';
import { updateSession } from '@/lib/session-store';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';

interface Body {
  sessionId: string;
  email: string;
  locale: 'ko' | 'en';
}

export const POST = withErrorHandling('checkout', async (req: Request) => {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!body.sessionId || !body.email) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // Persist email on the session so it's available before webhook lands.
  updateSession(body.sessionId, { email: body.email });

  const origin = new URL(req.url).origin;
  const successUrl = `${origin}/${body.locale}/thank-you?sessionId=${body.sessionId}`;

  const url = await createCheckoutUrl({
    sessionId: body.sessionId,
    email: body.email,
    locale: body.locale,
    successUrl,
  });
  return NextResponse.json({ url });
});
