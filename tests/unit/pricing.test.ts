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

  it('defaults to 4900 when env unset', async () => {
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 4900);
  });

  it('reads env when set to valid number', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '7900';
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 7900);
  });

  it('falls back when env is malformed', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = 'not-a-number';
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 4900);
  });

  it('rejects zero and negative prices', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '0';
    const { priceKRW } = await load();
    assert.equal(priceKRW(), 4900);
    process.env.NEXT_PUBLIC_PRICE_KRW = '-500';
    assert.equal((await load()).priceKRW(), 4900);
  });

  it('formats KO price with 원 suffix and thousands sep', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '12900';
    const { priceLabel } = await load();
    assert.equal(priceLabel('ko'), '12,900원');
  });

  it('formats EN price as USD with two decimals', async () => {
    process.env.NEXT_PUBLIC_PRICE_KRW = '4900';
    const { priceLabel } = await load();
    const en = priceLabel('en');
    // 4900 / 1320 ≈ 3.71, rounded to one dime → "$3.70"
    assert.match(en, /^\$\d+\.\d{2}$/);
  });
});
