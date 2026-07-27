import * as Sentry from '@sentry/nextjs';

/**
 * Instagram content publishing (Instagram API with Instagram Login).
 *
 * Flow is always two calls:
 *   1. POST /{ig_user_id}/media          → creation_id (a "container")
 *   2. POST /{ig_user_id}/media_publish  → published media id
 * Instagram needs a few seconds to ingest the container between the two,
 * so callers must wait (see waitForContainer).
 *
 * Requirements the API enforces on us:
 *   - the account must be Professional (Business/Creator)
 *   - image_url must be a PUBLIC url the Instagram fetcher can GET
 *     (our /api/ig/card route is public and returns image/jpeg)
 *   - publishing is rate limited (~50 posts / rolling 24h)
 *
 * Credentials (Meta app → Instagram → API setup with Instagram login):
 *   IG_USER_ID        numeric Instagram professional account id
 *   IG_ACCESS_TOKEN   long-lived token (60d) — refresh before expiry
 * Publishing to our OWN account only needs Standard Access, so no
 * multi-week App Review is required.
 */

const GRAPH = 'https://graph.instagram.com/v21.0';

const IG_USER_ID = process.env.IG_USER_ID?.trim();
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN?.trim();

export function isInstagramConfigured(): boolean {
  return Boolean(IG_USER_ID && IG_ACCESS_TOKEN);
}

export type IgResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: string; raw?: unknown };

async function igPost<T>(
  path: string,
  params: Record<string, string>,
): Promise<IgResult<T>> {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    return { ok: false, reason: 'instagram_not_configured' };
  }
  const body = new URLSearchParams({ ...params, access_token: IG_ACCESS_TOKEN });
  try {
    const res = await fetch(`${GRAPH}/${IG_USER_ID}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (raw as { error?: { message?: string } })?.error?.message ??
        `http_${res.status}`;
      return { ok: false, reason: msg, raw };
    }
    return { ok: true, data: raw as T };
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'instagram', step: path } });
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'fetch_failed',
    };
  }
}

/** Step 1 — stage a single-image post. Returns the container id. */
export async function createImageContainer(args: {
  imageUrl: string;
  caption: string;
}): Promise<IgResult<{ id: string }>> {
  return igPost<{ id: string }>('/media', {
    image_url: args.imageUrl,
    caption: args.caption,
  });
}

/** Step 1b — a carousel child (not published on its own). */
export async function createCarouselItem(
  imageUrl: string,
): Promise<IgResult<{ id: string }>> {
  return igPost<{ id: string }>('/media', {
    image_url: imageUrl,
    is_carousel_item: 'true',
  });
}

/** Step 1c — the carousel parent that ties 2–10 children together. */
export async function createCarouselContainer(args: {
  childIds: string[];
  caption: string;
}): Promise<IgResult<{ id: string }>> {
  return igPost<{ id: string }>('/media', {
    media_type: 'CAROUSEL',
    children: args.childIds.join(','),
    caption: args.caption,
  });
}

/** Step 2 — publish a staged container. */
export async function publishContainer(
  creationId: string,
): Promise<IgResult<{ id: string }>> {
  return igPost<{ id: string }>('/media_publish', { creation_id: creationId });
}

/**
 * Poll a container until Instagram finishes ingesting it. Publishing a
 * container that is still IN_PROGRESS fails, and images occasionally take
 * longer than a fixed sleep, so we poll instead of guessing.
 */
export async function waitForContainer(
  containerId: string,
  { attempts = 10, delayMs = 3000 } = {},
): Promise<IgResult<'FINISHED'>> {
  if (!IG_ACCESS_TOKEN) return { ok: false, reason: 'instagram_not_configured' };
  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    try {
      const res = await fetch(
        `${GRAPH}/${containerId}?fields=status_code,status&access_token=${IG_ACCESS_TOKEN}`,
        { cache: 'no-store' },
      );
      const raw = (await res.json().catch(() => ({}))) as {
        status_code?: string;
        status?: string;
      };
      if (raw.status_code === 'FINISHED') return { ok: true, data: 'FINISHED' };
      if (raw.status_code === 'ERROR' || raw.status_code === 'EXPIRED') {
        return { ok: false, reason: `container_${raw.status_code}`, raw };
      }
    } catch {
      // transient — keep polling
    }
  }
  return { ok: false, reason: 'container_timeout' };
}

/** Remaining posts in the rolling 24h publishing quota. */
export async function getPublishingQuota(): Promise<
  IgResult<{ used: number; limit: number }>
> {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    return { ok: false, reason: 'instagram_not_configured' };
  }
  try {
    const res = await fetch(
      `${GRAPH}/${IG_USER_ID}/content_publishing_limit?fields=config,quota_usage&access_token=${IG_ACCESS_TOKEN}`,
      { cache: 'no-store' },
    );
    const raw = (await res.json().catch(() => ({}))) as {
      data?: Array<{ quota_usage?: number; config?: { quota_total?: number } }>;
    };
    const row = raw.data?.[0];
    return {
      ok: true,
      data: {
        used: row?.quota_usage ?? 0,
        limit: row?.config?.quota_total ?? 50,
      },
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'fetch_failed',
    };
  }
}

/** Convenience: stage → wait → publish a single image post. */
export async function publishImagePost(args: {
  imageUrl: string;
  caption: string;
}): Promise<IgResult<{ id: string }>> {
  const container = await createImageContainer(args);
  if (!container.ok) return container;

  const ready = await waitForContainer(container.data.id);
  if (!ready.ok) return { ok: false, reason: ready.reason };

  return publishContainer(container.data.id);
}
