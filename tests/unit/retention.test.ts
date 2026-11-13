import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { RETENTION_DAYS, expiredObjects } from '../../lib/social/retention';

const now = new Date('2026-11-13T00:30:00Z');
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

describe('expiredObjects', () => {
  it('keeps the last few days and returns older objects oldest first', () => {
    const out = expiredObjects(
      [
        { name: 'new.mp4', created_at: daysAgo(1) },
        { name: 'old.mp4', created_at: daysAgo(RETENTION_DAYS + 1) },
        { name: 'oldest.mp4', created_at: daysAgo(40) },
        { name: 'edge.mp4', created_at: daysAgo(RETENTION_DAYS - 0.1) },
      ],
      now,
    );
    assert.deepEqual(out, ['oldest.mp4', 'old.mp4']);
  });

  it('never touches placeholders or objects without a timestamp', () => {
    const out = expiredObjects(
      [
        { name: '.emptyFolderPlaceholder', created_at: daysAgo(90) },
        { name: 'mystery.mp4', created_at: null },
      ],
      now,
    );
    assert.deepEqual(out, []);
  });
});
