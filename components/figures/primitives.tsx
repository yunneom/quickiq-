/**
 * Reusable SVG primitives used by the spatial-reasoning figure library.
 * Pure presentation — no client-side logic, safe in Server Components.
 */

import type { ReactNode } from 'react';

interface FigureBoxProps {
  children: ReactNode;
  /** ViewBox sizing — default fits common 120×120 figures with padding. */
  viewBox?: string;
  /** Outer aspect ratio kept square unless overridden. */
  className?: string;
  /** Optional label rendered under the figure. */
  label?: string;
}

export function FigureBox({
  children,
  viewBox = '0 0 120 120',
  className,
  label,
}: FigureBoxProps) {
  return (
    <figure className={className}>
      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
        aria-hidden="true"
      >
        {children}
      </svg>
      {label && (
        <figcaption className="mt-1 text-center text-[10px] font-medium text-gray-500">
          {label}
        </figcaption>
      )}
    </figure>
  );
}

const STROKE = '#111827';
const FILL = '#dde9ff';

interface CubeNetProps {
  /** Pattern of which grid cells are filled. Each entry is `[col, row]` on a 4×4 grid. */
  cells: [number, number][];
  cellSize?: number;
  origin?: [number, number];
}

/**
 * Renders an unfolded cube net by drawing squares on a 4×4 grid.
 * Useful for "which net folds into a cube" questions.
 */
export function CubeNet({
  cells,
  cellSize = 22,
  origin = [12, 12],
}: CubeNetProps) {
  const [ox, oy] = origin;
  return (
    <g>
      {cells.map(([c, r]) => (
        <rect
          key={`${c}-${r}`}
          x={ox + c * cellSize}
          y={oy + r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

/** A simple arrow head pointing in a cardinal direction, centered at (cx, cy). */
export function Arrow({
  cx,
  cy,
  size = 50,
  direction = 'right',
  color = STROKE,
}: {
  cx: number;
  cy: number;
  size?: number;
  direction?: 'right' | 'left' | 'up' | 'down';
  color?: string;
}) {
  // Define shape pointing right then rotate.
  const half = size / 2;
  const shaftH = size * 0.22;
  // Path: shaft + head — points define the arrow shape.
  const pts = [
    [-half, -shaftH / 2],
    [half * 0.4, -shaftH / 2],
    [half * 0.4, -shaftH],
    [half, 0],
    [half * 0.4, shaftH],
    [half * 0.4, shaftH / 2],
    [-half, shaftH / 2],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
  const rotation =
    direction === 'right'
      ? 0
      : direction === 'down'
        ? 90
        : direction === 'left'
          ? 180
          : 270;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotation})`}>
      <polygon points={pts} fill={color} />
    </g>
  );
}

/** A "letter F" — useful for rotation/mirror questions. */
export function LetterF({
  cx,
  cy,
  size = 70,
  mirrored = false,
  rotation = 0,
  color = STROKE,
}: {
  cx: number;
  cy: number;
  size?: number;
  mirrored?: boolean;
  rotation?: number;
  color?: string;
}) {
  const s = size / 100;
  // F shape on a 100×100 grid centered roughly.
  const path =
    'M 20 10 L 80 10 L 80 28 L 38 28 L 38 45 L 70 45 L 70 63 L 38 63 L 38 90 L 20 90 Z';
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${rotation}) scale(${(mirrored ? -1 : 1) * s} ${s}) translate(-50 -50)`}
    >
      <path d={path} fill={color} />
    </g>
  );
}

/** Stack of cubes drawn isometrically; renders an N-step pyramid. */
export function CubePyramid({ steps = 3, cube = 14 }: { steps?: number; cube?: number }) {
  const isoX = cube;
  const isoY = cube * 0.55;
  const elems: ReactNode[] = [];
  // Draw from back to front, top to bottom for correct overlap.
  for (let layer = 0; layer < steps; layer++) {
    const w = steps - layer;
    for (let row = 0; row < w; row++) {
      for (let col = 0; col < w; col++) {
        const baseX = 60 + (col - row) * isoX;
        const baseY = 80 + (col + row) * isoY - layer * cube;
        elems.push(<IsoCube key={`${layer}-${row}-${col}`} x={baseX} y={baseY} s={cube} />);
      }
    }
  }
  return <g>{elems}</g>;
}

function IsoCube({ x, y, s }: { x: number; y: number; s: number }) {
  const h = s * 0.55;
  const top = `M ${x} ${y - s} L ${x + s} ${y - s + h} L ${x} ${y - s + 2 * h} L ${x - s} ${y - s + h} Z`;
  const right = `M ${x} ${y - s + 2 * h} L ${x + s} ${y - s + h} L ${x + s} ${y + h} L ${x} ${y + 2 * h} Z`;
  const left = `M ${x} ${y - s + 2 * h} L ${x - s} ${y - s + h} L ${x - s} ${y + h} L ${x} ${y + 2 * h} Z`;
  return (
    <g>
      <path d={top} fill="#eef4ff" stroke={STROKE} strokeWidth={0.9} strokeLinejoin="round" />
      <path d={right} fill="#c7d6ff" stroke={STROKE} strokeWidth={0.9} strokeLinejoin="round" />
      <path d={left} fill="#aab9f5" stroke={STROKE} strokeWidth={0.9} strokeLinejoin="round" />
    </g>
  );
}

export const COLORS = { STROKE, FILL };
