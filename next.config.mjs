import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// CSP allowlist — third parties used by the app:
//   self          → our own origin
//   Vercel        → analytics, speed insights, asset hosts
//   Sentry        → ingest.sentry.io for error reporting
//   Meta          → connect.facebook.net + www.facebook.com (Pixel)
//   Lemon Squeezy → app.lemonsqueezy.com (hosted checkout iframe)
//   Toss Payments → js.tosspayments.com (SDK) + *.tosspayments.com (pay UI)
//   AdSense       → googlesyndication (loader/creatives), doubleclick +
//                   adtrafficquality (ad frames/beacons), gstatic (assets)
//   data:         → inline OG and icon images
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://app.lemonsqueezy.com https://*.tosspayments.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  // 'unsafe-inline' is needed for Next.js inline styles and the Tailwind
  // critical-path. 'unsafe-eval' is needed for the dev React refresh runtime.
  "style-src 'self' 'unsafe-inline'",
  // 'unsafe-inline' for Next.js script chunks. The Meta Pixel snippet is
  // also inline; tightening with nonces is a future improvement.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://va.vercel-scripts.com https://js.tosspayments.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://www.googletagservices.com",
  "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.supabase.co wss://*.supabase.co https://api.lemonsqueezy.com https://*.tosspayments.com https://www.facebook.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://api.qrserver.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://*.google.com",
  "frame-src 'self' https://app.lemonsqueezy.com https://*.tosspayments.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // CSP is reported (not enforced) in dev to avoid breaking the React
  // refresh runtime — the report header is read by Sentry-style monitors.
  {
    key: 'Content-Security-Policy',
    value: CSP_DIRECTIVES,
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

// Sentry only wraps the config when an auth token is present (i.e. running in
// CI / Vercel with secrets). Without one, the wrapper is skipped so local dev
// builds stay fast and don't try to upload sourcemaps to nowhere.
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SHOULD_USE_SENTRY = Boolean(SENTRY_ORG && SENTRY_PROJECT && SENTRY_AUTH_TOKEN);

const baseConfig = withNextIntl(nextConfig);

export default SHOULD_USE_SENTRY
  ? withSentryConfig(baseConfig, {
      org: SENTRY_ORG,
      project: SENTRY_PROJECT,
      authToken: SENTRY_AUTH_TOKEN,
      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : baseConfig;
