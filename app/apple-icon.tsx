import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2554e6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 90,
          fontWeight: 800,
          fontFamily: 'system-ui',
          letterSpacing: -2,
        }}
      >
        IQ
      </div>
    ),
    { ...size },
  );
}
