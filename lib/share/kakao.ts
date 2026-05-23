/**
 * Kakao JavaScript SDK loader + share helper.
 *
 * - Activated when NEXT_PUBLIC_KAKAO_APP_KEY is set.
 * - Otherwise every export is a no-op so the UI can show a fallback hint
 *   without breaking.
 *
 * The SDK is loaded on demand the first time a share is attempted, not
 * on page load, so the landing/test pages stay light.
 */

const SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
const SDK_INTEGRITY = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';

interface KakaoLinkArgs {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

interface KakaoGlobal {
  isInitialized: () => boolean;
  init: (appKey: string) => void;
  Share?: {
    sendDefault: (payload: unknown) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoGlobal;
  }
}

export function isKakaoConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_KAKAO_APP_KEY);
}

let loadPromise: Promise<void> | null = null;

async function loadKakaoSdk(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.Kakao?.isInitialized()) return;
  if (loadPromise) return loadPromise;

  const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
  if (!appKey) return;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.integrity = SDK_INTEGRITY;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => {
      try {
        window.Kakao?.init(appKey);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error('kakao_sdk_load_failed'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function shareToKakao(args: KakaoLinkArgs): Promise<boolean> {
  if (!isKakaoConfigured()) return false;
  try {
    await loadKakaoSdk();
    const Share = window.Kakao?.Share;
    if (!Share || typeof Share.sendDefault !== 'function') return false;
    Share.sendDefault({
      objectType: 'feed',
      content: {
        title: args.title,
        description: args.description,
        imageUrl: args.imageUrl,
        link: { mobileWebUrl: args.linkUrl, webUrl: args.linkUrl },
      },
      buttons: [
        {
          title: '나도 테스트하기',
          link: { mobileWebUrl: args.linkUrl, webUrl: args.linkUrl },
        },
      ],
    });
    return true;
  } catch (err) {
    // Common cause in production: web platform domain not registered in
    // the Kakao Developers console. Callers should fall back to clipboard.
    console.warn('[kakao] share failed — falling back to clipboard:', err);
    return false;
  }
}
