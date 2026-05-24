import { useTranslations } from 'next-intl';

/**
 * Static "this is what the paid report looks like" preview card for the
 * landing page. Shows a fake-but-believable score card + four category
 * rows + a "PDF report" footer chip — enough for visitors to picture
 * the deliverable before they take the test.
 */
export function ReportPreview() {
  const t = useTranslations('landing');

  const rows: Array<{ key: 'verbal' | 'numerical' | 'spatial' | 'logical'; score: number }> = [
    { key: 'verbal', score: 88 },
    { key: 'numerical', score: 74 },
    { key: 'spatial', score: 92 },
    { key: 'logical', score: 81 },
  ];
  const tr = useTranslations('result');

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-600">
        {t('previewLabel')}
      </p>
      <div className="mt-2 overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-4 text-white">
        <p className="text-[10px] uppercase tracking-widest opacity-80">
          {tr('title')}
        </p>
        <p className="mt-1 text-3xl font-extrabold">상위 15.9%</p>
        <p className="text-xs opacity-80">추정 IQ 115</p>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{tr(r.key)}</span>
              <span className="font-semibold tabular-nums text-gray-900">{r.score}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-brand-500" style={{ width: `${r.score}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] text-gray-400">
        {t('previewFooter')}
      </p>
    </div>
  );
}
