import { headers } from 'next/headers';
import { getTestEntry } from '@/lib/tests/catalog';
import { getRegistryEntry } from '@/lib/personality/registry';
import { renderProfileOg, renderTestOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/test-og';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = '너 T야? 테스트 — 팩폭력·공감력 분석';

export default async function Image({
  params: { locale, type },
}: {
  params: { locale: string; type: string };
}) {
  const h = headers();
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host') ?? 'localhost:3000'}`;
  const loc = locale === 'en' ? 'en' : 'ko';
  const entry = getTestEntry('tf');
  const profile = getRegistryEntry('tf')?.getProfile(type, loc);
  if (!profile) return renderTestOg({ origin, entry, locale: loc });
  return renderProfileOg({ origin, entry, profile, locale: loc });
}
