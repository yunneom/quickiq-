/**
 * Tiny structured-log helper. The codebase hand-rolls "[webhook]" /
 * "[email]" prefixes — this consolidates the convention so log lines
 * are consistently parseable in Vercel logs (and in Sentry breadcrumbs
 * which carry the formatted message).
 *
 * Why not winston/pino: extra dependency for ~20 call sites is overkill,
 * and the Node runtime on Vercel pipes console.* straight to log
 * aggregation. We get most of the value with zero deps.
 */

interface LogMeta {
  /** Component name (webhook, email, pdf, etc.). */
  area: string;
  /** Optional sub-step ("verify", "sendReport", "capi"). */
  step?: string;
  /** Free-form extra data. Avoid PII — emails should be masked. */
  data?: Record<string, unknown>;
}

function fmt(meta: LogMeta, msg: string): unknown[] {
  const tag = meta.step ? `[${meta.area}/${meta.step}]` : `[${meta.area}]`;
  return meta.data ? [tag, msg, meta.data] : [tag, msg];
}

export function info(meta: LogMeta, msg: string): void {
  console.log(...fmt(meta, msg));
}

export function warn(meta: LogMeta, msg: string): void {
  console.warn(...fmt(meta, msg));
}

export function error(meta: LogMeta, msg: string, err?: unknown): void {
  if (err !== undefined) {
    console.error(...fmt(meta, msg), err);
  } else {
    console.error(...fmt(meta, msg));
  }
}

/** Mask an email so it's safe to drop into a structured log. */
export function maskEmail(email: string | undefined | null): string {
  if (!email) return '';
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  return email.slice(0, 1) + '***' + email.slice(at);
}
