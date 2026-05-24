import { createHash } from 'node:crypto';

/**
 * Stable A/B bucket assignment from a session id. Same input always
 * produces the same bucket — even across cold starts, function
 * instances, and runtime environments — because we hash with SHA-256
 * and take the integer modulo of the first 8 bytes (a uniform sample
 * from the 0..2^32 range).
 *
 * Used by the result-page sticky CTA experiment, exit-intent copy A/B,
 * pricing label A/B (if we ever bypass NEXT_PUBLIC_PRICE_KRW for an
 * in-app experiment), etc. The variant name space is the caller's
 * choice — we just give them a deterministic bucket index in [0, n).
 *
 * Why this isn't crypto-random or DB-backed:
 *   - random would re-bucket the same user every page nav
 *   - DB-backed needs a write per session start; SHA gives the same
 *     property with zero IO
 */
export function bucket(sessionId: string, n: number, salt = 'iq'): number {
  if (n < 1) return 0;
  const h = createHash('sha256').update(`${salt}:${sessionId}`).digest();
  // Use the first 4 bytes as an unsigned 32-bit int.
  const sample = h.readUInt32BE(0);
  return sample % n;
}

/**
 * Convenience for two-variant experiments. Returns 'a' for half the
 * traffic, 'b' for the other half. Pass a `salt` per experiment so
 * variants don't correlate across unrelated experiments.
 */
export function variantAB(sessionId: string, salt = 'iq'): 'a' | 'b' {
  return bucket(sessionId, 2, salt) === 0 ? 'a' : 'b';
}
