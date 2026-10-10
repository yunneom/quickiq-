import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { cleanReason, connectRedirectUrl } from '../../lib/social/connect-log';
import { extractUserId } from '../../lib/social/threads';
import { verifyState, issueState } from '../../lib/social/oauth-state';

describe('Threads user id', () => {
  it('keeps every digit of a 17-digit id that JSON.parse would round', () => {
    const body = '{"access_token":"THQ","user_id":17841400123456789}';
    // The bug this guards: the number is past MAX_SAFE_INTEGER.
    assert.notEqual(String((JSON.parse(body) as { user_id: number }).user_id), '17841400123456789');
    assert.equal(extractUserId(body), '17841400123456789');
  });

  it('reads a quoted id and tolerates whitespace', () => {
    assert.equal(extractUserId('{ "user_id" : "26123456789012345" }'), '26123456789012345');
  });

  it('returns undefined when there is no id', () => {
    assert.equal(extractUserId('{"error_message":"Invalid redirect_uri"}'), undefined);
    assert.equal(extractUserId(''), undefined);
  });
});

describe('connect result redirect', () => {
  const admin = 'https://iq.dailyenterkr.com/admin/media';

  it('marks a success with the platform flag only', () => {
    assert.equal(
      connectRedirectUrl(admin, 'threads', { outcome: 'connected' }),
      `${admin}?threads=connected`,
    );
  });

  it('carries the reason, encoded and single-line', () => {
    const url = connectRedirectUrl(admin, 'threads', {
      outcome: 'error',
      reason: 'Invalid redirect_uri\n  in request',
    });
    assert.equal(url, `${admin}?threads=error&reason=${encodeURIComponent('Invalid redirect_uri in request')}`);
  });

  it('bounds a long provider message', () => {
    const r = cleanReason('x'.repeat(500));
    assert.ok(r.length <= 200);
    assert.ok(r.endsWith('…'));
    assert.equal(cleanReason('   '), 'unknown');
  });
});

describe('OAuth state window', () => {
  it('accepts a state issued 20 minutes ago — a full login with 2FA fits', () => {
    const prev = process.env.ADMIN_TOKEN;
    process.env.ADMIN_TOKEN = 'test-secret';
    try {
      const realNow = Date.now;
      const issued = issueState();
      Date.now = () => realNow() + 20 * 60 * 1000;
      try {
        assert.ok(verifyState(issued));
      } finally {
        Date.now = realNow;
      }
      // …and still rejects a tampered one.
      assert.ok(!verifyState(issued.replace(/.$/, (c) => (c === '0' ? '1' : '0'))));
    } finally {
      if (prev === undefined) delete process.env.ADMIN_TOKEN;
      else process.env.ADMIN_TOKEN = prev;
    }
  });
});
