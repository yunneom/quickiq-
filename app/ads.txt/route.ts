import { adsenseClient } from '@/lib/ads/adsense';

export const runtime = 'nodejs';

/**
 * Serves /ads.txt for AdSense site verification. Google's crawler
 * checks this file at the domain root; the required line is
 * `google.com, pub-<id>, DIRECT, f08c47fec0942fa0`.
 *
 * Empty (but 200) when the env var is unset so the route never 404s
 * during the approval window.
 */
export function GET() {
  const client = adsenseClient();
  const pub = client?.replace(/^ca-/, '');
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '';
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
