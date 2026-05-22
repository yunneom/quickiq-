import { FIGURES } from './spatial';

interface Props {
  id: string;
  /** Optional caption shown under the figure (e.g. "(A)"). */
  label?: string;
  className?: string;
}

/**
 * Renders a figure by id. Returns null if the id is unknown — callers should
 * fall back to text. Logging a console warning helps surface typos during dev.
 */
export function Figure({ id, label, className }: Props) {
  const C = FIGURES[id];
  if (!C) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Figure] Unknown figure_id: "${id}"`);
    }
    return null;
  }
  return (
    <div className={className}>
      <C label={label} />
    </div>
  );
}

export function hasFigure(id: string | undefined | null): boolean {
  return Boolean(id && FIGURES[id]);
}
