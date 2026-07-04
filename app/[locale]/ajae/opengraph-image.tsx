import { headers } from 'next/headers';
import { getTestEntry } from '@/lib/tests/catalog';
import { renderTestOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/test-og';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = '아재력 테스트 — 레트로 문화 지식 판정';

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
    entry: getTestEntry('ajae'),
    locale: locale === 'en' ? 'en' : 'ko',
  });
}
