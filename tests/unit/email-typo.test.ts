import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { suggestEmailFix } from '../../lib/email-typo';

describe('suggestEmailFix', () => {
  it('suggests gmail.com for common typos', () => {
    assert.equal(suggestEmailFix('user@gmial.com'), 'user@gmail.com');
    assert.equal(suggestEmailFix('user@gmai.com'), 'user@gmail.com');
    assert.equal(suggestEmailFix('user@gnail.com'), 'user@gmail.com');
  });

  it('suggests naver.com for naver typos', () => {
    assert.equal(suggestEmailFix('user@naver.con'), 'user@naver.com');
    assert.equal(suggestEmailFix('user@naer.com'), 'user@naver.com');
  });

  it('returns null for already-correct domains', () => {
    assert.equal(suggestEmailFix('user@gmail.com'), null);
    assert.equal(suggestEmailFix('user@naver.com'), null);
    assert.equal(suggestEmailFix('user@kakao.com'), null);
  });

  it('returns null for unrecognised domains (no false positives)', () => {
    assert.equal(suggestEmailFix('user@my-company.io'), null);
    assert.equal(suggestEmailFix('user@university.ac.kr'), null);
  });

  it('returns null for malformed input', () => {
    assert.equal(suggestEmailFix('no-at-sign'), null);
    assert.equal(suggestEmailFix('@startswithat.com'), null);
    assert.equal(suggestEmailFix('endswithat@'), null);
    assert.equal(suggestEmailFix('no-dot@nodot'), null);
  });

  it('preserves the local part verbatim', () => {
    assert.equal(
      suggestEmailFix('long.email+tag@gmial.com'),
      'long.email+tag@gmail.com',
    );
  });

  it('case-insensitive domain matching', () => {
    // Levenshtein lowercases for comparison, but result keeps the
    // suggester's canonical lowercase form — correct UX.
    assert.equal(suggestEmailFix('user@GMIAL.COM'), 'user@gmail.com');
  });
});
