import { useTranslations } from 'next-intl';
import type { CategoryScores } from '@/lib/scoring';

interface Props {
  scores: CategoryScores;
  /** Show a comparison polygon (gray) for the "average" baseline. */
  compareTo?: CategoryScores;
}

const KEYS: (keyof CategoryScores)[] = ['verbal', 'numerical', 'spatial', 'logical'];

const W = 240;
const CENTER = W / 2;
const RADIUS = 90;

/**
 * Radar chart of 4-category scores. Pure SVG so it renders in Server
 * Components without client hydration. Pairs the user's polygon with
 * an optional baseline (e.g. peer average) so the strengths/weaknesses
 * are visible at a glance.
 */
export function CategoryRadar({ scores, compareTo }: Props) {
  const t = useTranslations('result');

  // Axes: north (0), east (90), south (180), west (270)
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

  function point(score: number, angleIdx: number): [number, number] {
    const r = (score / 100) * RADIUS;
    const a = angles[angleIdx];
    return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
  }

  const userPoints = KEYS.map((k, i) => point(scores[k], i));
  const userPath =
    'M ' + userPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ') + ' Z';

  const comparePath = compareTo
    ? 'M ' +
      KEYS.map((k, i) => {
        const [x, y] = point(compareTo[k], i);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' L ') +
      ' Z'
    : null;

  // Concentric grid rings at 25/50/75/100
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Axis lines + labels
  const axisLabels = KEYS.map((k, i) => {
    const a = angles[i];
    const lx = CENTER + (RADIUS + 18) * Math.cos(a);
    const ly = CENTER + (RADIUS + 18) * Math.sin(a);
    return { key: k, label: t(k), x: lx, y: ly };
  });

  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="block h-auto w-full">
      {/* concentric rings */}
      {rings.map((r) => (
        <circle
          key={r}
          cx={CENTER}
          cy={CENTER}
          r={r * RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.8"
        />
      ))}
      {/* axis lines */}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={CENTER}
          y1={CENTER}
          x2={CENTER + RADIUS * Math.cos(a)}
          y2={CENTER + RADIUS * Math.sin(a)}
          stroke="#e5e7eb"
          strokeWidth="0.8"
        />
      ))}
      {/* comparison polygon (under user) */}
      {comparePath && (
        <path d={comparePath} fill="rgba(148, 163, 184, 0.2)" stroke="#94a3b8" strokeWidth="1" />
      )}
      {/* user polygon */}
      <path
        d={userPath}
        fill="rgba(37, 84, 230, 0.25)"
        stroke="#2554e6"
        strokeWidth="1.6"
      />
      {/* user vertex dots */}
      {userPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#2554e6" />
      ))}
      {/* axis labels */}
      {axisLabels.map((al) => (
        <text
          key={al.key}
          x={al.x}
          y={al.y}
          fontSize="10"
          fill="#374151"
          fontWeight="600"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {al.label}
        </text>
      ))}
    </svg>
  );
}
