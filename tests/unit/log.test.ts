import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { maskEmail } from '../../lib/log';

describe('maskEmail', () => {
  it('preserves first char + domain', () => {
    assert.equal(maskEmail('alice@gmail.com'), 'a***@gmail.com');
    assert.equal(maskEmail('bob@naver.com'), 'b***@naver.com');
  });

  it('handles falsy input safely', () => {
    assert.equal(maskEmail(undefined), '');
    assert.equal(maskEmail(null), '');
    assert.equal(maskEmail(''), '');
  });

  it('refuses to leak a missing-@ string', () => {
    // If someone passes a non-email by mistake we should not echo it
    // back to the log — return a neutral placeholder.
    assert.equal(maskEmail('no-at-sign-here'), '***');
  });

  it('handles edge case: @ at index 0', () => {
    // Same defensive behavior — never echo the original string.
    assert.equal(maskEmail('@onlydomain.com'), '***');
  });
});
