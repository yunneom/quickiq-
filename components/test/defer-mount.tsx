'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  /** Children rendered once the placeholder scrolls within ~600px of viewport. */
  children: ReactNode;
  /** Fallback height so the placeholder doesn't collapse layout. */
  placeholderClassName?: string;
}

/**
 * IntersectionObserver-gated mount. Hides children behind a tiny
 * placeholder div until it scrolls near the viewport — keeps the
 * result-page LCP focused on the hero card without forfeiting the
 * compare / QR / install-prompt cards entirely.
 *
 * Falls back to immediate mount on browsers without IntersectionObserver
 * (Safari < 12.1, old Edge) and during SSR.
 */
export function DeferMount({ children, placeholderClassName = 'h-16' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setMounted(true);
            io.disconnect();
            return;
          }
        }
      },
      // ~600px headroom so the section is visible by the time scroll
      // reaches it — no perceived pop-in.
      { rootMargin: '600px 0px 600px 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [mounted]);

  if (mounted) return <>{children}</>;
  return <div ref={ref} className={placeholderClassName} aria-hidden="true" />;
}
