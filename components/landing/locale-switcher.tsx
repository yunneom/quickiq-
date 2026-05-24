'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Footer toggle "한국어 / English" that swaps the leading locale segment
 * in the URL. Used on landing + /about so visitors who landed on the
 * wrong locale (e.g. a KO user clicking an EN ad) can switch without
 * editing the URL.
 *
 * The middleware `localeDetection` still runs on subsequent visits, but
 * the explicit click here remembers the choice via next-intl's locale
 * cookie so the user stays in the language they picked.
 */
export function LocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: 'ko' | 'en') {
    if (target === current) return;
    // pathname is /{currentLocale}/... — swap the first segment.
    const next = pathname.replace(/^\/(ko|en)/, `/${target}`);
    router.push(next);
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-gray-400">
      <button
        type="button"
        onClick={() => switchTo('ko')}
        className={
          'rounded px-2 py-0.5 ' +
          (current === 'ko'
            ? 'bg-gray-100 font-semibold text-gray-700'
            : 'hover:text-gray-600')
        }
        aria-pressed={current === 'ko'}
      >
        한국어
      </button>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={
          'rounded px-2 py-0.5 ' +
          (current === 'en'
            ? 'bg-gray-100 font-semibold text-gray-700'
            : 'hover:text-gray-600')
        }
        aria-pressed={current === 'en'}
      >
        English
      </button>
    </div>
  );
}
