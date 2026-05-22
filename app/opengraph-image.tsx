import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'IQ Test';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #3b6cff 0%, #1d40b8 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 80,
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            fontSize: 28,
            opacity: 0.85,
            letterSpacing: 8,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          IQ TEST
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.1,
            textAlign: 'center',
            maxWidth: 1000,
          }}
        >
          What percentile is your IQ?
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            opacity: 0.85,
          }}
        >
          30 questions · 7 minutes · Free
        </div>
      </div>
    ),
    { ...size },
  );
}
