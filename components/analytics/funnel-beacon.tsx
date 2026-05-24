'use client';

import { useEffect } from 'react';
import { trackFunnel, type FunnelEvent } from '@/components/analytics/meta-pixel';

interface Props {
  event: FunnelEvent;
  /** Extra labels attached to the event (e.g., { isPaid: true }). */
  params?: Record<string, unknown>;
}

/**
 * Drop-in client helper for server components — mounts, fires one
 * funnel beacon, and unmounts. Idempotent across StrictMode double-
 * mount because the event name itself is the dedup key on the server
 * (counts are aggregated, not stamped per session).
 */
export function FunnelBeacon({ event, params }: Props) {
  useEffect(() => {
    trackFunnel(event, params);
    // We intentionally exclude params from the deps so a parent that
    // re-renders with a fresh object doesn't refire the beacon. The
    // event-name change is the only thing that should trigger a refire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
