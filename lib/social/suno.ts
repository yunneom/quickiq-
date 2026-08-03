/**
 * Resolve a Suno SHARE link (suno.com/s/... or suno.com/song/...) to the
 * direct MP3 on Suno's CDN, so the operator can paste the link straight
 * from the app instead of hunting for the audio URL.
 *
 * Resolution ladder, most reliable first:
 *   1. the share page's og:audio / twitter:player:stream meta tag
 *   2. any cdn*.suno.ai/*.mp3 URL embedded in the page's data
 *   3. the song UUID from the canonical /song/<uuid> URL, rebuilt as
 *      cdn1.suno.ai/<uuid>.mp3 (Suno's stable audio path)
 *
 * Runs on Vercel (open internet). Pure string work is factored out so it
 * can be unit-tested without network access.
 */

// Real Suno tracks live at cdn*.suno.ai/<song-uuid>.mp3. The share
// page's JS bundle ALSO embeds junk mp3s (a silence placeholder named
// sil-100.mp3 among them) — matching any cdn mp3 once shipped three
// days of reels with a silent "soundtrack". UUID filenames only.
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const CDN_MP3 = new RegExp(`https://cdn\\d*\\.suno\\.ai/${UUID}\\.mp3`, 'i');
const OG_AUDIO =
  /<meta[^>]+(?:property|name)="(?:og:audio|twitter:player:stream)"[^>]+content="([^"]+)"/;
const SONG_UUID = new RegExp(`/song/(${UUID})`, 'i');

/**
 * True when a URL points at an actual Suno track file rather than a
 * player asset. Used both at resolve time and to purge previously
 * mis-imported placeholders from the library.
 */
export function isRealSunoTrackUrl(url: string): boolean {
  if (!/\bsuno\.ai\//i.test(url)) return true; // non-Suno hosts: not ours to judge
  return new RegExp(`/${UUID}\\.mp3$`, 'i').test(url);
}

export function isSunoShareUrl(url: string): boolean {
  return /^https:\/\/(?:www\.)?suno\.com\/(?:s|song)\//i.test(url);
}

/** Extract the MP3 URL from a fetched share page. Exported for tests. */
export function extractSunoMp3(html: string, finalUrl: string): string | null {
  const og = html.match(OG_AUDIO)?.[1];
  if (og && CDN_MP3.test(og)) return og.match(CDN_MP3)![0];

  // A share short-link (suno.com/s/…) redirects to the canonical
  // /song/<uuid> URL — the redirected URL alone identifies the track,
  // which is more reliable than scraping the JS shell.
  const uuid = (finalUrl.match(SONG_UUID) ?? html.match(SONG_UUID))?.[1];
  if (uuid) return `https://cdn1.suno.ai/${uuid.toLowerCase()}.mp3`;

  const embedded = html.match(CDN_MP3)?.[0];
  if (embedded) return embedded;

  return null;
}

/**
 * Fetch the share page and resolve the MP3 URL. Returns null when the
 * page is unreachable or carries no recognizable audio reference.
 */
export async function resolveSunoShareUrl(url: string): Promise<string | null> {
  // /song/<uuid> URLs carry the answer in the URL itself — usable even
  // when the page fetch fails or is bot-blocked.
  const direct = url.match(SONG_UUID)?.[1];
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: {
        // Suno serves the full page (with meta tags) to normal browsers.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
    });
    if (!res.ok) {
      return direct ? `https://cdn1.suno.ai/${direct}.mp3` : null;
    }
    const html = await res.text();
    return extractSunoMp3(html, res.url);
  } catch {
    return direct ? `https://cdn1.suno.ai/${direct}.mp3` : null;
  }
}
