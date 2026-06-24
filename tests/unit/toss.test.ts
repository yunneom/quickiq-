import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// confirmTossPayment reads TOSS_SECRET_KEY at module load, and rejects
// amount mismatches BEFORE any network call — so we can test the guard
// without hitting Toss. We stub global fetch to prove it's never called
// on a mismatch, and that a configured + matching call attempts fetch.
async function load() {
  return import('../../lib/payments/toss');
}

describe('confirmTossPayment guards', () => {
  const origKey = process.env.TOSS_SECRET_KEY;
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.TOSS_SECRET_KEY = 'test_sk_xxx';
  });
  afterEach(() => {
    if (origKey === undefined) delete process.env.TOSS_SECRET_KEY;
    else process.env.TOSS_SECRET_KEY = origKey;
    globalThis.fetch = origFetch;
  });

  it('rejects an amount mismatch without calling fetch', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    const { confirmTossPayment } = await load();
    const r = await confirmTossPayment({
      paymentKey: 'pk', orderId: 'oid', amount: 9900, expectedAmount: 4900,
    });
    assert.equal(r.ok, false);
    assert.equal(called, false, 'fetch must not run on amount mismatch');
    if (!r.ok) assert.equal(r.reason, 'amount_mismatch');
  });

  it('calls Toss confirm when amount matches', async () => {
    let calledUrl = '';
    globalThis.fetch = (async (url: string) => {
      calledUrl = String(url);
      return new Response(
        JSON.stringify({ method: '카드', approvedAt: 'now', totalAmount: 4900 }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;
    const { confirmTossPayment } = await load();
    const r = await confirmTossPayment({
      paymentKey: 'pk', orderId: 'oid', amount: 4900, expectedAmount: 4900,
    });
    assert.ok(calledUrl.includes('tosspayments.com'));
    assert.equal(r.ok, true);
  });

  it('rejects when Toss confirms a different amount than expected', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ totalAmount: 100 }), { status: 200 })) as unknown as typeof fetch;
    const { confirmTossPayment } = await load();
    const r = await confirmTossPayment({
      paymentKey: 'pk', orderId: 'oid', amount: 4900, expectedAmount: 4900,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, 'confirmed_amount_mismatch');
  });
});
