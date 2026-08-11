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
 *   - image_url must be a PUBLIC url the Instagram fetcher can GET, and
 *     the documented image format is JPEG — the cron re-encodes the card
 *     to JPEG in storage before handing it over
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
      // Bounded: a hung Graph API socket must never eat the cron budget.
      signal: AbortSignal.timeout(20_000),
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

/**
 * Step 1 (video) — stage a Reel. `share_to_feed` keeps it visible on the
 * profile grid, which is where bio-link traffic comes from.
 */
export async function createReelsContainer(args: {
  videoUrl: string;
  caption: string;
}): Promise<IgResult<{ id: string }>> {
  return igPost<{ id: string }>('/media', {
    media_type: 'REELS',
    video_url: args.videoUrl,
    caption: args.caption,
    share_to_feed: 'true',
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

/** One status poll of a container. Exported for the post-publish re-check. */
export async function getContainerStatus(
  containerId: string,
): Promise<
  IgResult<{ statusCode?: string; errorMessage?: string; errorCode?: number }>
> {
  if (!IG_ACCESS_TOKEN) return { ok: false, reason: 'instagram_not_configured' };
  try {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code,status&access_token=${IG_ACCESS_TOKEN}`,
      { cache: 'no-store', signal: AbortSignal.timeout(15_000) },
    );
    const raw = (await res.json().catch(() => ({}))) as {
      status_code?: string;
      status?: string;
      error?: { message?: string; code?: number };
    };
    return {
      ok: true,
      data: {
        statusCode: raw.status_code,
        errorMessage: raw.error?.message ?? (res.ok ? undefined : `http_${res.status}`),
        errorCode: raw.error?.code,
      },
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'fetch_failed',
    };
  }
}

/**
 * Poll a container until Instagram finishes ingesting it. Publishing a
 * container that is still IN_PROGRESS fails, and images occasionally take
 * longer than a fixed sleep, so we poll instead of guessing.
 *
 * `deadlineAt` (epoch ms) hard-stops the wait regardless of attempts —
 * the cron route uses it to guarantee the image fallback still has time
 * to run inside the function's maxDuration.
 *
 * Hard API errors (expired token, bad permissions) bail out immediately
 * instead of burning the whole poll window as a fake "timeout" — except
 * error code 100 ("object does not exist") during the first attempts,
 * which is Instagram's replication lag right after container creation.
 */
export async function waitForContainer(
  containerId: string,
  {
    attempts = 10,
    delayMs = 3000,
    deadlineAt,
  }: { attempts?: number; delayMs?: number; deadlineAt?: number } = {},
): Promise<IgResult<'FINISHED'>> {
  if (!IG_ACCESS_TOKEN) return { ok: false, reason: 'instagram_not_configured' };
  for (let i = 0; i < attempts; i++) {
    if (deadlineAt && Date.now() + delayMs > deadlineAt) {
      return { ok: false, reason: 'container_timeout' };
    }
    await new Promise((r) => setTimeout(r, delayMs));
    const status = await getContainerStatus(containerId);
    if (!status.ok) continue; // network blip — keep polling
    const { statusCode, errorMessage, errorCode } = status.data;
    if (statusCode === 'FINISHED') return { ok: true, data: 'FINISHED' };
    if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
      return { ok: false, reason: `container_${statusCode}` };
    }
    if (errorMessage) {
      const replicationLag = errorCode === 100 && i < 3;
      if (!replicationLag) return { ok: false, reason: errorMessage };
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
      { cache: 'no-store', signal: AbortSignal.timeout(15_000) },
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

/**
 * Convenience: stage → wait → publish a single image post. Deadline-aware
 * and step-prefixed like publishReelPost — the media_publish ambiguity
 * (committed on IG, response lost) exists here too.
 */
export async function publishImagePost(args: {
  imageUrl: string;
  caption: string;
  deadlineAt?: number;
}): Promise<IgResult<{ id: string }>> {
  const container = await createImageContainer(args);
  if (!container.ok) {
    return { ok: false, reason: `create:${container.reason}` };
  }

  const ready = await waitForContainer(container.data.id, {
    attempts: 10,
    delayMs: 3000,
    deadlineAt: args.deadlineAt,
  });
  if (!ready.ok) return { ok: false, reason: `wait:${ready.reason}` };

  const published = await publishContainer(container.data.id);
  if (published.ok) return published;

  const status = await getContainerStatus(container.data.id);
  if (status.ok && status.data.statusCode === 'PUBLISHED') {
    return { ok: true, data: { id: container.data.id } };
  }
  return { ok: false, reason: `publish:${published.reason}` };
}

/**
 * Convenience: stage → wait → publish a Reel. Video ingestion is much
 * slower than images (transcode + safety checks), so the poll window is
 * up to ~3 minutes, bounded harder by `deadlineAt` when provided.
 *
 * Failure reasons are step-prefixed (`create:` / `wait:` / `publish:`) so
 * the caller can decide whether an image fallback is SAFE: a `publish:`
 * failure is ambiguous — Instagram may have committed the publish even
 * though our HTTP response was lost — so falling back there risks a
 * double post. We re-check the container once: `PUBLISHED` means the
 * reel actually went out and we report success.
 */
export async function publishReelPost(args: {
  videoUrl: string;
  caption: string;
  deadlineAt?: number;
}): Promise<IgResult<{ id: string }>> {
  const container = await createReelsContainer(args);
  if (!container.ok) {
    return { ok: false, reason: `create:${container.reason}` };
  }

  const ready = await waitForContainer(container.data.id, {
    attempts: 36,
    delayMs: 5000,
    deadlineAt: args.deadlineAt,
  });
  if (!ready.ok) return { ok: false, reason: `wait:${ready.reason}` };

  const published = await publishContainer(container.data.id);
  if (published.ok) return published;

  // Ambiguous publish failure — did Instagram commit it anyway?
  const status = await getContainerStatus(container.data.id);
  if (status.ok && status.data.statusCode === 'PUBLISHED') {
    // The reel is live; we only lost the media id. Report the container
    // id so the ledger still records something traceable.
    return { ok: true, data: { id: container.data.id } };
  }
  return { ok: false, reason: `publish:${published.reason}` };
}

/**
 * Post one first-party comment on a published post.
 *
 * A brand-new account's posts sit at 0 comments, which itself suppresses
 * reach (an empty comment section reads as "nobody engages here" to both
 * viewers and the ranking algorithm) — so every publish seeds its own
 * comment thread the way an editor's own "first!" comment does on any
 * platform: from OUR account, openly, nudging real replies rather than
 * impersonating anyone.
 *
 * Unlike the publish flow, comments are non-critical — a failure here
 * must never fail the post itself, so callers should swallow the error.
 */
export async function postComment(
  mediaId: string,
  message: string,
): Promise<IgResult<{ id: string }>> {
  if (!IG_ACCESS_TOKEN) return { ok: false, reason: 'instagram_not_configured' };
  const body = new URLSearchParams({ message, access_token: IG_ACCESS_TOKEN });
  try {
    const res = await fetch(`${GRAPH}/${mediaId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        (raw as { error?: { message?: string } })?.error?.message ??
        `http_${res.status}`;
      return { ok: false, reason: msg, raw };
    }
    return { ok: true, data: raw as { id: string } };
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'instagram', step: 'comment' } });
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'fetch_failed',
    };
  }
}
