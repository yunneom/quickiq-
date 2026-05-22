/**
 * Concrete figure components used by the spatial-reasoning questions.
 * Each is keyed by a string id that the question references via `figure_id`.
 */

import { Arrow, CubeNet, CubePyramid, FigureBox, LetterF } from './primitives';

// ─────────────────────────────────────────────────────────────
//  Cube nets — used by ko-017 / en-017
// ─────────────────────────────────────────────────────────────
export function CubeNetCross({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <CubeNet
        cells={[
          [1, 0],
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
          [1, 2],
        ]}
      />
    </FigureBox>
  );
}

export function CubeNetTShape({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <CubeNet
        cells={[
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
          [1, 1],
          [1, 2],
        ]}
      />
    </FigureBox>
  );
}

export function CubeNetLShape({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <CubeNet
        cells={[
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 3],
          [2, 3],
        ]}
      />
    </FigureBox>
  );
}

export function CubeNetBad({ label }: { label?: string }) {
  // Six squares arranged in an "O" — cannot fold into a cube.
  return (
    <FigureBox label={label}>
      <CubeNet
        cells={[
          [0, 0],
          [1, 0],
          [2, 0],
          [0, 1],
          [2, 1],
          [1, 1],
        ]}
      />
    </FigureBox>
  );
}

// ─────────────────────────────────────────────────────────────
//  Letter rotation — used by ko-018 / en-018
// ─────────────────────────────────────────────────────────────
export function FUpright({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <LetterF cx={60} cy={60} />
    </FigureBox>
  );
}
export function FRot90CW({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <LetterF cx={60} cy={60} rotation={90} />
    </FigureBox>
  );
}
export function FRot180({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <LetterF cx={60} cy={60} rotation={180} />
    </FigureBox>
  );
}
export function FRot270CW({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <LetterF cx={60} cy={60} rotation={-90} />
    </FigureBox>
  );
}
export function FMirror({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <LetterF cx={60} cy={60} mirrored />
    </FigureBox>
  );
}

// ─────────────────────────────────────────────────────────────
//  Arrow rotation — used by ko-020 / en-020
// ─────────────────────────────────────────────────────────────
export function ArrowRight({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <Arrow cx={60} cy={60} direction="right" />
    </FigureBox>
  );
}
export function ArrowDown({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <Arrow cx={60} cy={60} direction="down" />
    </FigureBox>
  );
}
export function ArrowLeft({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <Arrow cx={60} cy={60} direction="left" />
    </FigureBox>
  );
}
export function ArrowUp({ label }: { label?: string }) {
  return (
    <FigureBox label={label}>
      <Arrow cx={60} cy={60} direction="up" />
    </FigureBox>
  );
}

// ─────────────────────────────────────────────────────────────
//  Cube pyramids — used by ko-022 / en-022 (count blocks)
// ─────────────────────────────────────────────────────────────
export function Pyramid3Step({ label }: { label?: string }) {
  return (
    <FigureBox viewBox="0 0 120 120" label={label}>
      <CubePyramid steps={3} cube={14} />
    </FigureBox>
  );
}

// ─────────────────────────────────────────────────────────────
//  Painted-cube illustration — ko-023/en-023 stays text but
//  gets a small reference figure.
// ─────────────────────────────────────────────────────────────
export function PaintedCube({ label }: { label?: string }) {
  return (
    <FigureBox viewBox="0 0 120 120" label={label}>
      <g transform="translate(60 65)">
        {/* Top */}
        <path d="M 0 -42 L 42 -19 L 0 4 L -42 -19 Z" fill="#3b6cff" stroke="#111827" strokeWidth="1.2" />
        {/* Right */}
        <path d="M 0 4 L 42 -19 L 42 25 L 0 48 Z" fill="#2554e6" stroke="#111827" strokeWidth="1.2" />
        {/* Left */}
        <path d="M 0 4 L -42 -19 L -42 25 L 0 48 Z" fill="#1d40b8" stroke="#111827" strokeWidth="1.2" />
        {/* grid lines on top */}
        <path d="M -28 -27 L 14 -4 M 14 -27 L -28 -4" stroke="#dde9ff" strokeWidth="0.8" />
        {/* grid lines on right */}
        <path d="M 14 -4 L 14 33 M 28 -11 L 28 18" stroke="#a9bdff" strokeWidth="0.8" />
        {/* grid lines on left */}
        <path d="M -14 -4 L -14 33 M -28 -11 L -28 18" stroke="#7e94e0" strokeWidth="0.8" />
      </g>
    </FigureBox>
  );
}

// ─────────────────────────────────────────────────────────────
//  Registry — figure_id → component
// ─────────────────────────────────────────────────────────────
import type { FC } from 'react';

export const FIGURES: Record<string, FC<{ label?: string }>> = {
  // cube nets
  'cube-net-cross': CubeNetCross,
  'cube-net-t': CubeNetTShape,
  'cube-net-l': CubeNetLShape,
  'cube-net-bad': CubeNetBad,
  // letter F rotations & mirror
  'f-upright': FUpright,
  'f-rot90': FRot90CW,
  'f-rot180': FRot180,
  'f-rot270': FRot270CW,
  'f-mirror': FMirror,
  // arrows
  'arrow-right': ArrowRight,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp,
  // pyramids
  'pyramid-3step': Pyramid3Step,
  // painted cube reference
  'painted-cube': PaintedCube,
};
