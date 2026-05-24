import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

/**
 * Webhook signature verification is the security boundary that
 * prevents a malicious POST from marking arbitrary sessions paid.
 * These tests pin the algorithm contract so a refactor can't quietly
 * widen the accept criteria.
 *
 * The module reads LEMON_SQUEEZY_WEBHOOK_SECRET at *import time*, so
 * we have to set the env before the first dynamic import + then
 * reload between cases that need different secrets.
 */

const SECRET = 'test-secret-do-not-use-in-prod';

function sign(body: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

describe('verifyWebhookSignature', () => {
  let verify: typeof import('../../lib/payments/lemon-squeezy').verifyWebhookSignature;
  const originalSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const originalDisabled = process.env.WEBHOOK_VERIFY_DISABLED;

  before(async () => {
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = SECRET;
    delete process.env.WEBHOOK_VERIFY_DISABLED;
    // First import after env is set, so the module-level capture sees it.
    const mod = await import('../../lib/payments/lemon-squeezy');
    verify = mod.verifyWebhookSignature;
  });

  after(() => {
    if (originalSecret === undefined) {
      delete process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    } else {
      process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = originalSecret;
    }
    if (originalDisabled === undefined) {
      delete process.env.WEBHOOK_VERIFY_DISABLED;
    } else {
      process.env.WEBHOOK_VERIFY_DISABLED = originalDisabled;
    }
  });

  it('accepts a valid signature', () => {
    const body = JSON.stringify({ meta: { event_name: 'order_created' } });
    const r = verify(body, sign(body));
    assert.equal(r.ok, true);
  });

  it('accepts the "sha256=" prefix variant', () => {
    const body = '{"hello":"world"}';
    const r = verify(body, `sha256=${sign(body)}`);
    assert.equal(r.ok, true);
  });

  it('rejects when signature is missing', () => {
    const r = verify('{}', null);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'missing_signature_header');
  });

  it('rejects on hmac mismatch', () => {
    const body = '{"a":1}';
    const wrong = sign(body, 'completely-different-secret');
    const r = verify(body, wrong);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'hmac_mismatch');
  });

  it('rejects on length mismatch (truncated sig)', () => {
    const body = '{"a":1}';
    const truncated = sign(body).slice(0, 16);
    const r = verify(body, truncated);
    assert.equal(r.ok, false);
    assert.match(r.reason ?? '', /^length_mismatch/);
  });

  it('rejects when body is tampered after signing', () => {
    const body = '{"amount":9900}';
    const sigForOriginal = sign(body);
    const tampered = '{"amount":99}';
    const r = verify(tampered, sigForOriginal);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'hmac_mismatch');
  });
});
