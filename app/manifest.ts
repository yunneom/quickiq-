import type { MetadataRoute } from 'next';

/**
 * PWA manifest. Required by the Add-to-Home-Screen flow on Chrome /
 * Edge / Samsung Browser, and consumed by iOS Safari for the home-
 * screen icon + title once the user picks "Add to Home Screen" from
 * the share sheet.
 *
 * `display: 'standalone'` makes the launched app run without the
 * browser chrome — same effect as a native app shell. `id` is the
 * stable identifier browsers use to detect "is this app already
 * installed" so changing the start_url later doesn't double-install.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?source=pwa',
    name: '7iq · IQ Test',
    short_name: '7iq',
    description: '30문항 7분, 무료로 추정 IQ 확인하기 · Free IQ estimate in 7 minutes',
    lang: 'ko-KR',
    dir: 'ltr',
    start_url: '/ko?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafafa',
    theme_color: '#2554e6',
    icons: [
      // Browsers prefer "maskable" for adaptive icons (Android/Chrome)
      // and "any" for everything else; same image works for both at
      // these small sizes, declared twice with different purposes.
      { src: '/icon', sizes: '64x64', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '64x64', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
    categories: ['education', 'productivity', 'lifestyle'],
    // Show the test as the only meaningful shortcut from a long-press
    // on the installed icon — keeps the app shell focused.
    shortcuts: [
      {
        name: '테스트 시작',
        short_name: '시작',
        url: '/ko/test',
      },
      {
        name: 'Start test',
        short_name: 'Start',
        url: '/en/test',
      },
    ],
  };
}
