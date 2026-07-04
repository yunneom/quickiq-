import { headers } from 'next/headers';
import { getTestEntry } from '@/lib/tests/catalog';
import { renderTestOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/test-og';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = '너 T야? 테스트 — 팩폭력·공감력 분석';

export default async function Image({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return renderTestOg({
    origin: `${proto}://${host}`,
    entry: getTestEntry('tf'),
    locale: locale === 'en' ? 'en' : 'ko',
  });
}
