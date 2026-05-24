import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Each `priceKRW()` call re-reads process.env, so we can flip env vars
// per-case without resetting modules.
async function load() {
  const mod = await import('../../lib/pricing');
  return mod;
}

describe('pricing helpers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_PRICE_KRW;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_PRICE_KRW;
  });
  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_PRICE_KRW;
    } else {
      process.env.NEXT_PUBLIC_PRICE_KRW = originalEnv;
    }
  });

  it('defaults to 9900 when env unset', async () => {
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 9900);
  });

  it('reads env when set to valid number', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '7900';
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 7900);
  });

  it('falls back when env is malformed', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = 'not-a-number';
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 9900);
  });

  it('rejects zero and negative prices', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '0';
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 9900);
    process.env.NEXT_PUBLIC_PRICE_KRW = '-500';
    assert.equal((await load()).priceKRW(), 9900);
  });

  it('formats KO price with 원 suffix and thousands sep', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '12900';
    const { priceLabel } = await load();
    assert.equal(priceLabel('ko'), '12,900원');
  });

  it('formats EN price as USD with two decimals', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '9900';
    const { priceLabel } = await load();
    const en = priceLabel('en');
    // 9900 / 1320 ≈ 7.5, rounded to one dime → "$7.50"
    assert.match(en, /^\$\d+\.\d{2}$/);
  });
});
