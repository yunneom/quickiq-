import type { Metadata } from 'next';

/**
 * Root document for the /admin segment.
 *
 * The top-level app/layout.tsx returns bare children (the [locale]
 * layout owns <html>/<body> for the site), so admin pages — which live
 * OUTSIDE [locale] — were rendering with no document shell at all and
 * crashed on hydration the moment the middleware stopped 404-ing them.
 */
export const metadata: Metadata = {
  title: 'Admin · QuickIQ',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
