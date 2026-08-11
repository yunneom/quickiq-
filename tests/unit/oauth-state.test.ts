import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

describe('oauth-state (TikTok/YouTube connect CSRF)', () => {
  const ORIGINAL = process.env.ADMIN_TOKEN;

  before(() => {
    process.env.ADMIN_TOKEN = 'test-admin-token-abc123';
  });
  after(() => {
    if (ORIGINAL === undefined) delete process.env.ADMIN_TOKEN;
    else process.env.ADMIN_TOKEN = ORIGINAL;
  });

  it('a freshly issued state verifies', async () => {
    const { issueState, verifyState } = await import('../../lib/social/oauth-state');
    const state = issueState();
    assert.equal(verifyState(state), true);
  });

  it('rejects null/empty/malformed state', async () => {
    const { verifyState } = await import('../../lib/social/oauth-state');
    assert.equal(verifyState(null), false);
    assert.equal(verifyState(''), false);
    assert.equal(verifyState('not-three-parts'), false);
    assert.equal(verifyState('a.b.c.d'), false);
  });

  it('rejects a tampered payload or signature', async () => {
    const { issueState, verifyState } = await import('../../lib/social/oauth-state');
    const state = issueState();
    const [ts, nonce, sig] = state.split('.');

    // Flip one character of the nonce — signature no longer matches.
    const tamperedNonce = nonce[0] === 'a' ? 'b' + nonce.slice(1) : 'a' + nonce.slice(1);
    assert.equal(verifyState(`${ts}.${tamperedNonce}.${sig}`), false);

    // Flip one character of the signature itself.
    const tamperedSig = sig[0] === 'a' ? 'b' + sig.slice(1) : 'a' + sig.slice(1);
    assert.equal(verifyState(`${ts}.${nonce}.${tamperedSig}`), false);
  });

  it('rejects a state older than maxAgeMs (replay protection)', async () => {
    const { verifyState } = await import('../../lib/social/oauth-state');
    const { createHmac } = await import('node:crypto');
    const oldTs = Date.now() - 3_600_000; // 1 hour ago
    const nonce = 'deadbeefcafe';
    const payload = `${oldTs}.${nonce}`;
    const sig = createHmac('sha256', 'test-admin-token-abc123')
      .update(payload)
      .digest('hex')
      .slice(0, 32);
    assert.equal(verifyState(`${payload}.${sig}`, 10 * 60 * 1000), false);
  });

  it('two issued states are never identical (nonce entropy)', async () => {
    const { issueState } = await import('../../lib/social/oauth-state');
    const a = issueState();
    const b = issueState();
    assert.notEqual(a, b);
  });

  it('a state signed with a DIFFERENT secret is rejected', async () => {
    const { verifyState } = await import('../../lib/social/oauth-state');
    const { createHmac } = await import('node:crypto');
    const payload = `${Date.now()}.somenonce123`;
    const wrongSig = createHmac('sha256', 'a-completely-different-secret')
      .update(payload)
      .digest('hex')
      .slice(0, 32);
    assert.equal(verifyState(`${payload}.${wrongSig}`), false);
  });
});
