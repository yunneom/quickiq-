'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * Last-resort error boundary. Triggered when the root layout itself crashes
 * (e.g. i18n provider failure). Plain HTML — no i18n, no Tailwind utilities
 * — because the surrounding layout is not available here.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#111827',
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 420, padding: 24 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 8, color: '#6b7280' }}>
            We&apos;re sorry — please reload the page and try again.
          </p>
          {error.digest && (
            <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}>
              id: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: '12px 24px',
              background: '#2554e6',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
