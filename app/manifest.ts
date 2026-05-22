import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IQ Test',
    short_name: 'IQ Test',
    description: '30문항 7분, 무료로 추정 IQ 확인하기',
    start_url: '/ko',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafafa',
    theme_color: '#2554e6',
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
    categories: ['education', 'productivity', 'lifestyle'],
  };
}
