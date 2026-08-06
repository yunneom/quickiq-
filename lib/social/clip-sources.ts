/**
 * Auto-collector for reel background clips.
 *
 * Runs on Vercel (open internet). Searches license-safe libraries for
 * each scene, filters to licenses we may embed in a monetized reel,
 * downloads a modest rendition, validates it with ffmpeg and stores it
 * in our bucket. The reel builder never touches these hosts.
 *
 * Providers:
 *   · Wikimedia Commons — keyless API. Only CC0 / Public domain / plain
 *     CC BY are accepted (BY gets an automatic caption credit).
 *     ShareAlike, NonCommercial, GFDL and anything ambiguous is dropped.
 *   · Pexels / Pixabay — enabled when an API key is present, either as
 *     PEXELS_API_KEY / PIXABAY_API_KEY env vars or pasted once into
 *     /admin/media (stored in the private settings bucket). Their
 *     native licenses allow commercial use without attribution.
 *
 * Never added here: news/documentary footage, YouTube rips, anything
 * rights-managed — a Rights Manager match mutes the reel or strikes the
 * account, which is the one risk this account cannot take.
 */

import type { BgScene } from './reel-bg';
import { MAX_CLIP_BYTES, readClipManifest, storeClip } from './clips';
import { clipResolutionOk, probeClip } from './clip-frames';
import { getStockKeys } from './settings';

/** How many clips we aim to hold per scene before the collector idles. */
export const CLIPS_PER_SCENE_TARGET = 3;

export interface ClipCandidate {
  id: string;
  scene: BgScene;
  url: string;
  credit?: string;
  license: string;
  requiresAttribution: boolean;
  sourcePage?: string;
}

/**
 * Search phrasing per scene. Ordered: earlier queries describe the shot
 * we actually want; later ones widen the net.
 */
export const SCENE_QUERIES: Record<BgScene, string[]> = {
  rails: ['train approaching camera', 'train arriving station', 'railway cab view'],
  road: ['night highway headlights', 'driving at night', 'city traffic night'],
  chalk: ['writing on chalkboard', 'chalkboard classroom', 'blackboard math'],
  // Calm dark backdrops that actually EXIST on Commons — the abstract
  // stock phrases ("ink in water") return zero there.
  slate: ['night sky stars timelapse', 'ocean waves night', 'aurora borealis timelapse'],
};

/**
 * Titles that must never become a quiz background, whatever their
 * license: real-world violence, death, crime footage. Commons carries
 * plenty of public-domain news/bodycam video, and a search for "train
 * arriving" has surfaced shooting footage before. A quiz account posts
 * NOTHING from this list — full stop.
 */
export const TITLE_BLOCKLIST =
  /shoot|shot\b|gun\b|weapon|kill|dead|death|fatal|victim|injur|accident|crash|collision|derail|disaster|suicide|police|officer|arrest|patrol|border|riot|protest|war\b|combat|attack|assault|blood|violen|explos|bomb\b|murder|crime|terror|funeral|memorial|rescue|emergency/i;

// ---------------------------------------------------------------------------
// License filter — pure, unit-tested.
// ---------------------------------------------------------------------------

/**
 * Decide whether a Wikimedia Commons LicenseShortName is usable, and
 * whether it demands a caption credit. Anything not explicitly
 * recognized is rejected — unknown licenses are treated as hostile.
 */
export function commonsLicenseAllowed(
  shortName: string | undefined,
): { allowed: boolean; requiresAttribution: boolean } {
  const name = (shortName ?? '').trim().toLowerCase();
  if (!name) return { allowed: false, requiresAttribution: false };
  // Explicit rejections first: SA/NC/ND riders poison any base license.
  if (/(-|\s)(sa|nc|nd)\b/.test(name) || /gfdl|fal\b|copyright/.test(name)) {
    return { allowed: false, requiresAttribution: false };
  }
  if (/^cc0\b/.test(name) || /^public domain/.test(name) || /^pd\b|^pd-/.test(name) || /^no restrictions/.test(name)) {
    return { allowed: true, requiresAttribution: false };
  }
  if (/^cc by(\s|-)?\d/.test(name) || name === 'cc by') {
    return { allowed: true, requiresAttribution: true };
  }
  return { allowed: false, requiresAttribution: false };
}

/** Strip the HTML Commons wraps around author names. */
export function stripHtml(html: string | undefined): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------

interface CommonsPage {
  title?: string;
  videoinfo?: CommonsInfo[];
  imageinfo?: CommonsInfo[];
}
interface CommonsInfo {
  url?: string;
  mime?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  derivatives?: { src?: string; type?: string; width?: number; height?: number }[];
  extmetadata?: Record<string, { value?: string } | undefined>;
}

/**
 * Turn one Commons API page into a candidate, or null when it fails any
 * gate (license, format, size, duration). Exported for tests — the
 * network call is a thin wrapper around this.
 */
export function commonsPageToCandidate(
  page: CommonsPage,
  scene: BgScene,
): ClipCandidate | null {
  const info = page.videoinfo?.[0] ?? page.imageinfo?.[0];
  if (!info) return null;

  // Content safety BEFORE license: no violent/news footage behind a quiz.
  if (TITLE_BLOCKLIST.test(page.title ?? '')) return null;

  const license = commonsLicenseAllowed(info.extmetadata?.LicenseShortName?.value);
  if (!license.allowed) return null;

  // Loopable range: too short reads as a GIF stutter, very long files
  // are usually full documentaries (and huge).
  if (typeof info.duration === 'number' && (info.duration < 5 || info.duration > 300)) {
    return null;
  }

  // Prefer a mid-size transcode; fall back to a modest original.
  const derivatives = (info.derivatives ?? []).filter(
    (d) => d.src && /video\/(webm|mp4)/.test(d.type ?? ''),
  );
  const scored = derivatives.map((d) => ({
    src: d.src!,
    h: Math.min(d.width ?? 0, d.height ?? 0),
  }));
  // Smallest rendition that still survives the crop → smallest download.
  const sharpEnough = scored.filter((d) => d.h >= 700).sort((a, b) => a.h - b.h);
  // Much of Commons is SD-only. 540p under our heavy scrim still beats a
  // drawn background, so accept the best sub-700 rendition as a fallback.
  const acceptable = scored.filter((d) => d.h >= 540).sort((a, b) => b.h - a.h);
  let url = sharpEnough[0]?.src ?? acceptable[0]?.src;
  if (!url) {
    const originalOk =
      info.url &&
      /video\/(webm|mp4)/.test(info.mime ?? '') &&
      (info.size ?? Infinity) <= MAX_CLIP_BYTES &&
      Math.min(info.width ?? 0, info.height ?? 0) >= 540;
    if (!originalOk) return null;
    url = info.url!;
  }

  const title = page.title?.replace(/^File:/, '') ?? 'commons';
  const artist = stripHtml(info.extmetadata?.Artist?.value);
  return {
    id: `commons-${slug(title)}`,
    scene,
    url,
    credit: artist || undefined,
    license: info.extmetadata?.LicenseShortName?.value ?? 'unknown',
    requiresAttribution: license.requiresAttribution,
    sourcePage: page.title
      ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`
      : undefined,
  };
}

async function searchCommons(scene: BgScene, query: string): Promise<ClipCandidate[]> {
  // Two search dialects: `filetype:` is the documented CirrusSearch file
  // filter, `filemime:` is the older one. Whichever hits first wins —
  // guards against either keyword regressing on Commons' side.
  for (const gsrsearch of [`${query} filetype:video`, `${query} filemime:video/webm`]) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      generator: 'search',
      gsrsearch,
      gsrnamespace: '6',
      gsrlimit: '20',
      prop: 'videoinfo|imageinfo',
      viprop: 'url|size|mime|derivatives|extmetadata',
      iiprop: 'url|size|mime|extmetadata',
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'QuickIQBot/1.0 (https://iq.dailyenterkr.com; media pipeline; contact via site)' },
    });
    if (!res.ok) continue;
    const data = (await res.json()) as { query?: { pages?: CommonsPage[] } };
    const pages = data.query?.pages ?? [];
    const candidates = pages
      .map((p) => commonsPageToCandidate(p, scene))
      .filter((c): c is ClipCandidate => c !== null);
    if (candidates.length > 0) return candidates;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Pexels / Pixabay (API-key gated)
// ---------------------------------------------------------------------------

interface PexelsVideo {
  id?: number;
  duration?: number;
  user?: { name?: string };
  url?: string;
  video_files?: { link?: string; width?: number; height?: number; file_type?: string }[];
}

/** Exported for tests. */
export function pexelsVideoToCandidate(
  video: PexelsVideo,
  scene: BgScene,
): ClipCandidate | null {
  if (!video.id) return null;
  if (typeof video.duration === 'number' && (video.duration < 5 || video.duration > 120)) {
    return null;
  }
  const files = (video.video_files ?? [])
    .filter((f) => f.link && /mp4/.test(f.file_type ?? 'video/mp4'))
    .map((f) => ({ link: f.link!, short: Math.min(f.width ?? 0, f.height ?? 0) }))
    .filter((f) => f.short >= 700)
    .sort((a, b) => a.short - b.short);
  if (files.length === 0) return null;
  return {
    id: `pexels-${video.id}`,
    scene,
    url: files[0].link,
    credit: video.user?.name,
    license: 'Pexels License',
    requiresAttribution: false,
    sourcePage: video.url,
  };
}

async function searchPexels(
  scene: BgScene,
  query: string,
  key: string | undefined,
): Promise<ClipCandidate[]> {
  if (!key) return [];
  const params = new URLSearchParams({ query, per_page: '15' });
  const res = await fetch(`https://api.pexels.com/videos/search?${params}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
    headers: { Authorization: key },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { videos?: PexelsVideo[] };
  return (data.videos ?? [])
    .map((v) => pexelsVideoToCandidate(v, scene))
    .filter((c): c is ClipCandidate => c !== null);
}

interface PixabayHit {
  id?: number;
  duration?: number;
  user?: string;
  pageURL?: string;
  videos?: Record<string, { url?: string; width?: number; height?: number; size?: number } | undefined>;
}

/** Exported for tests. */
export function pixabayHitToCandidate(
  hit: PixabayHit,
  scene: BgScene,
): ClipCandidate | null {
  if (!hit.id) return null;
  if (typeof hit.duration === 'number' && (hit.duration < 5 || hit.duration > 120)) {
    return null;
  }
  const renditions = ['medium', 'large', 'small'] as const;
  for (const r of renditions) {
    const v = hit.videos?.[r];
    if (!v?.url) continue;
    if (Math.min(v.width ?? 0, v.height ?? 0) < 700) continue;
    if ((v.size ?? 0) > MAX_CLIP_BYTES) continue;
    return {
      id: `pixabay-${hit.id}`,
      scene,
      url: v.url,
      credit: hit.user,
      license: 'Pixabay Content License',
      requiresAttribution: false,
      sourcePage: hit.pageURL,
    };
  }
  return null;
}

async function searchPixabay(
  scene: BgScene,
  query: string,
  key: string | undefined,
): Promise<ClipCandidate[]> {
  if (!key) return [];
  const params = new URLSearchParams({
    key,
    q: query,
    per_page: '15',
    safesearch: 'true',
  });
  const res = await fetch(`https://pixabay.com/api/videos/?${params}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { hits?: PixabayHit[] };
  return (data.hits ?? [])
    .map((h) => pixabayHitToCandidate(h, scene))
    .filter((c): c is ClipCandidate => c !== null);
}

// ---------------------------------------------------------------------------
// Import loop
// ---------------------------------------------------------------------------

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export interface ClipImportResult {
  imported: string[];
  /** Scenes still below target after this pass. */
  scenesShort: BgScene[];
  /** Per-attempt notes for the admin/cron response — small, no URLs. */
  notes: string[];
}

/**
 * Top up scenes that are below CLIPS_PER_SCENE_TARGET, up to
 * `maxImports` downloads per call, hard-bounded by `deadlineAt`.
 * Order: quality-first providers (Pexels/Pixabay, when keys exist),
 * then Commons.
 */
export async function importClips(
  maxImports: number,
  deadlineAt: number,
): Promise<ClipImportResult> {
  const notes: string[] = [];
  const imported: string[] = [];
  // Resolve once per run: env vars first, then the operator-pasted keys
  // in the private settings bucket.
  const keys = await getStockKeys();
  const manifest = await readClipManifest();
  const have = new Set(manifest.clips.map((c) => c.id));
  const countByScene = new Map<BgScene, number>();
  for (const c of manifest.clips) {
    countByScene.set(c.scene, (countByScene.get(c.scene) ?? 0) + 1);
  }

  const scenes = (Object.keys(SCENE_QUERIES) as BgScene[])
    .filter((s) => (countByScene.get(s) ?? 0) < CLIPS_PER_SCENE_TARGET)
    // Fill the emptiest scene first so every scene gets SOME footage
    // before any scene gets variety.
    .sort((a, b) => (countByScene.get(a) ?? 0) - (countByScene.get(b) ?? 0));

  // Once Commons 429s us, EVERY remaining Commons candidate this run will
  // too (same host, same limit) — but that must not stop us from trying
  // Pexels/Pixabay for the OTHER scenes. Scoped per-host, not a global
  // abort: a Commons ban must never block a working Pexels key.
  let commonsBackoff = false;

  for (const scene of scenes) {
    if (imported.length >= maxImports || Date.now() > deadlineAt) break;

    let candidates: ClipCandidate[] = [];
    const perQuery: string[] = [];
    for (const query of SCENE_QUERIES[scene]) {
      if (Date.now() > deadlineAt) break;
      const [pexels, pixabay, commons] = await Promise.all([
        searchPexels(scene, query, keys.pexels).catch(() => []),
        searchPixabay(scene, query, keys.pixabay).catch(() => []),
        commonsBackoff ? Promise.resolve([]) : searchCommons(scene, query).catch(() => []),
      ]);
      perQuery.push(
        `"${query}" px=${pexels.length} pb=${pixabay.length} cm=${commons.length}`,
      );
      candidates = [...pexels, ...pixabay, ...commons].filter((c) => !have.has(c.id));
      if (candidates.length > 0) break;
    }
    if (candidates.length === 0) {
      notes.push(
        `${scene}: no_candidates [${perQuery.join(' | ')}]${commonsBackoff ? ' (commons skipped: rate-limited earlier this run)' : ''}`,
      );
      continue;
    }

    let stored = false;
    for (const candidate of candidates.slice(0, 4)) {
      if (Date.now() > deadlineAt) break;
      const result = await downloadValidateStore(candidate, deadlineAt, notes);
      if (result === 'stored') {
        imported.push(candidate.id);
        have.add(candidate.id);
        countByScene.set(scene, (countByScene.get(scene) ?? 0) + 1);
        stored = true;
        break;
      }
      if (result === 'rate_limited') {
        // Every candidate after this one in the array is also a Commons
        // entry (Pexels/Pixabay are ordered first), so further attempts
        // this scene would just 429 again — stop here, not mid-array.
        if (!commonsBackoff) notes.push('commons_rate_limited_skipping_for_rest_of_run');
        commonsBackoff = true;
        break;
      }
    }
    if (!stored) notes.push(`${scene}: all_candidates_failed`);
  }

  const scenesShort = (Object.keys(SCENE_QUERIES) as BgScene[]).filter(
    (s) => (countByScene.get(s) ?? 0) < CLIPS_PER_SCENE_TARGET,
  );
  return { imported, scenesShort, notes };
}

async function downloadValidateStore(
  candidate: ClipCandidate,
  deadlineAt: number,
  notes: string[],
): Promise<'stored' | 'failed' | 'rate_limited'> {
  try {
    // The download must not overrun the caller's window: a fetch started
    // 1s before the deadline gets ~1s, not a fresh 60s.
    const timeout = Math.min(60_000, Math.max(1_000, deadlineAt - Date.now()));
    const res = await fetch(candidate.url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(timeout),
      headers: {
        'User-Agent':
          'QuickIQBot/1.0 (https://iq.dailyenterkr.com; media pipeline; contact via site)',
      },
    });
    if (res.status === 429) {
      notes.push(`${candidate.id}: http_429`);
      return 'rate_limited';
    }
    if (!res.ok) {
      notes.push(`${candidate.id}: http_${res.status}`);
      return 'failed';
    }
    const declared = Number(res.headers.get('content-length') ?? 0);
    if (declared > MAX_CLIP_BYTES) {
      notes.push(`${candidate.id}: too_large_declared`);
      return 'failed';
    }
    const video = Buffer.from(await res.arrayBuffer());
    if (video.length === 0 || video.length > MAX_CLIP_BYTES) {
      notes.push(`${candidate.id}: too_large`);
      return 'failed';
    }

    const size = await probeClip(video);
    if (!size || !clipResolutionOk(size)) {
      notes.push(`${candidate.id}: probe_failed`);
      return 'failed';
    }

    const stored = await storeClip(
      {
        id: candidate.id,
        scene: candidate.scene,
        credit: candidate.credit,
        license: candidate.license,
        requiresAttribution: candidate.requiresAttribution,
        sourceUrl: candidate.url,
        sourcePage: candidate.sourcePage,
      },
      video,
    );
    if (!stored.ok) {
      notes.push(`${candidate.id}: store_${stored.reason}`);
      return 'failed';
    }
    return 'stored';
  } catch {
    notes.push(`${candidate.id}: download_error`);
    return 'failed';
  }
}
