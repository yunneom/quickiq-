/**
 * IQ bell-curve visualization with the user's position marked.
 *
 * Pure SVG — works in Server Components, no client JS needed.
 * The curve is a discrete approximation of a normal distribution
 * with mean 100, SD 15 — matching the scoring formula in lib/scoring.
 */

interface Props {
  iq: number;
  /** Optional caption shown under the curve. */
  caption?: string;
}

const MEAN = 100;
const SD = 15;
const IQ_MIN = 55;
const IQ_MAX = 145;
const W = 320;
const H = 120;
const PAD_X = 16;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

function pdf(x: number): number {
  // Standard normal density at z = (x - mean) / sd, scaled.
  const z = (x - MEAN) / SD;
  return Math.exp(-(z * z) / 2);
}

function pathFor(iqValues: number[]): { area: string; line: string; yAt: (iq: number) => number } {
  const pdfMax = pdf(MEAN);
  const xAt = (iq: number) =>
    PAD_X + ((iq - IQ_MIN) / (IQ_MAX - IQ_MIN)) * (W - 2 * PAD_X);
  const yAt = (iq: number) =>
    H - PAD_BOTTOM - (pdf(iq) / pdfMax) * (H - PAD_TOP - PAD_BOTTOM);

  const points = iqValues.map((iq) => `${xAt(iq).toFixed(1)},${yAt(iq).toFixed(1)}`);
  const line = `M ${points.join(' L ')}`;
  const area = `M ${xAt(IQ_MIN).toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} L ${points.join(' L ')} L ${xAt(IQ_MAX).toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} Z`;
  return { area, line, yAt };
}

export function IqDistribution({ iq, caption }: Props) {
  const samples: number[] = [];
  for (let v = IQ_MIN; v <= IQ_MAX; v += 1) samples.push(v);
  const { area, line, yAt } = pathFor(samples);

  const clampedIq = Math.max(IQ_MIN, Math.min(IQ_MAX, iq));
  const markerX = PAD_X + ((clampedIq - IQ_MIN) / (IQ_MAX - IQ_MIN)) * (W - 2 * PAD_X);
  const markerY = yAt(clampedIq);

  // X-axis ticks at 70, 85, 100, 115, 130
  const ticks = [70, 85, 100, 115, 130];

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden="true">
        {/* Filled area under the curve */}
        <path d={area} fill="#dde9ff" />
        {/* Bell curve outline */}
        <path d={line} fill="none" stroke="#3b6cff" strokeWidth="1.4" />
        {/* X-axis line */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={H - PAD_BOTTOM}
          y2={H - PAD_BOTTOM}
          stroke="#cbd5e1"
          strokeWidth="0.8"
        />
        {/* X-axis ticks */}
        {ticks.map((t) => {
          const x = PAD_X + ((t - IQ_MIN) / (IQ_MAX - IQ_MIN)) * (W - 2 * PAD_X);
          return (
            <g key={t}>
              <line
                x1={x}
                x2={x}
                y1={H - PAD_BOTTOM}
                y2={H - PAD_BOTTOM + 3}
                stroke="#94a3b8"
                strokeWidth="0.8"
              />
              <text
                x={x}
                y={H - PAD_BOTTOM + 13}
                fontSize="9"
                fill="#64748b"
                textAnchor="middle"
              >
                {t}
              </text>
            </g>
          );
        })}
        {/* User marker — vertical line + dot */}
        <line
          x1={markerX}
          x2={markerX}
          y1={markerY}
          y2={H - PAD_BOTTOM}
          stroke="#1d40b8"
          strokeWidth="1.6"
          strokeDasharray="2 2"
        />
        <circle cx={markerX} cy={markerY} r="4" fill="#1d40b8" />
        <text
          x={markerX}
          y={markerY - 8}
          fontSize="10"
          fill="#1d40b8"
          fontWeight="700"
          textAnchor="middle"
        >
          {clampedIq}
        </text>
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-[10px] text-gray-500">{caption}</figcaption>
      )}
    </figure>
  );
}
