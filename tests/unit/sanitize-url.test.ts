import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeSupabaseUrl } from '../../lib/supabase/sanitize-url';

describe('sanitizeSupabaseUrl', () => {
  const clean = 'https://abc.supabase.co';

  it('passes a clean URL through unchanged', () => {
    assert.equal(sanitizeSupabaseUrl(clean), clean);
  });
  it('strips a trailing slash', () => {
    assert.equal(sanitizeSupabaseUrl(clean + '/'), clean);
  });
  it('strips surrounding whitespace', () => {
    assert.equal(sanitizeSupabaseUrl('  ' + clean + '  '), clean);
  });
  it('strips an accidental /rest/v1 suffix', () => {
    assert.equal(sanitizeSupabaseUrl(clean + '/rest/v1'), clean);
  });
  it('strips /rest/v1/ with trailing slash (the real prod bug)', () => {
    assert.equal(sanitizeSupabaseUrl(clean + '/rest/v1/'), clean);
  });
  it('strips an accidental /auth/v1 suffix', () => {
    assert.equal(sanitizeSupabaseUrl(clean + '/auth/v1'), clean);
  });
  it('handles undefined', () => {
    assert.equal(sanitizeSupabaseUrl(undefined), undefined);
  });
});
