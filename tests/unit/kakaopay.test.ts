import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// kakaopayApprove reads KAKAOPAY_SECRET_KEY at module load, so we set it
// in beforeEach and stub global fetch to simulate Kakao's amount object
// for the post-confirm amount-guard assertion. (We don't test the
// unconfigured path here — Node caches the module on first import so the
// `const ADMIN_KEY` capture would survive any later env reset.)
async function load() {
  return import('../../lib/payments/kakaopay');
}

describe('kakaopayApprove guards', () => {
  const origKey = process.env.KAKAOPAY_SECRET_KEY;
  const origCid = process.env.KAKAOPAY_CID;
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.KAKAOPAY_SECRET_KEY = 'test_admin_key';
    process.env.KAKAOPAY_CID = 'TC0ONETIME';
  });
  afterEach(() => {
    if (origKey === undefined) delete process.env.KAKAOPAY_SECRET_KEY;
    else process.env.KAKAOPAY_SECRET_KEY = origKey;
    if (origCid === undefined) delete process.env.KAKAOPAY_CID;
    else process.env.KAKAOPAY_CID = origCid;
    globalThis.fetch = origFetch;
  });

  it('rejects when Kakao confirms a different amount than expected', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ amount: { total: 100 }, payment_method_type: 'CARD' }),
        { status: 200 },
      )) as unknown as typeof fetch;
    const { kakaopayApprove } = await load();
    const r = await kakaopayApprove({
      tid: 'T1', sessionId: 'sid', email: 'a@b.c', pgToken: 'pg', expectedAmount: 4900,
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.reason, 'confirmed_amount_mismatch');
  });

  it('succeeds on matching amount and returns method + approvedAt', async () => {
    let calledUrl = '';
    globalThis.fetch = (async (url: string) => {
      calledUrl = String(url);
      return new Response(
        JSON.stringify({
          amount: { total: 4900 },
          payment_method_type: 'MONEY',
          approved_at: '2026-06-24T00:00:00Z',
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;
    const { kakaopayApprove } = await load();
    const r = await kakaopayApprove({
      tid: 'T1', sessionId: 'sid', email: 'a@b.c', pgToken: 'pg', expectedAmount: 4900,
    });
    assert.ok(calledUrl.includes('kapi.kakao.com'));
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.method, 'MONEY');
      assert.equal(r.approvedAt, '2026-06-24T00:00:00Z');
    }
  });

  it('surfaces Kakao error msg on non-2xx', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ msg: 'invalid tid', code: -780 }), { status: 400 })) as unknown as typeof fetch;
    const { kakaopayApprove } = await load();
    const r = await kakaopayApprove({
      tid: 'T1', sessionId: 'sid', email: 'a@b.c', pgToken: 'pg', expectedAmount: 4900,
    });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.reason, 'invalid tid');
      assert.equal(r.status, 400);
    }
  });
});
