import { headers } from 'next/headers';
import { getTestEntry } from '@/lib/tests/catalog';
import { getRegistryEntry } from '@/lib/personality/registry';
import { renderProfileStory } from '@/lib/og/test-og';

export const runtime = 'edge';

interface Params { params: { locale: string; type: string }; }

/**
 * 1080×1920 Instagram-story share card per type. Result page's share
 * button deep-links to this URL so the user can long-press → save → upload
 * to their IG/TikTok story with the archetype baked in.
 */
export async function GET(_req: Request, { params }: Params) {
  const h = headers();
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host') ?? 'localhost:3000'}`;
  const loc = params.locale === 'en' ? 'en' : 'ko';
  const entry = getTestEntry('attachment');
  const profile = getRegistryEntry('attachment')?.getProfile(params.type, loc);
  if (!profile) return new Response('not found', { status: 404 });
  const res = await renderProfileStory({ origin, entry, profile, locale: loc });
  return new Response(res.body, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="quickiq-${'attachment'}-${params.type}-story.png"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
