/**
 * Production-safe logging.
 * - console.* is dev-only (no PII/secrets in release Logcat/Console).
 * - Server/audit trail should use request/correlation IDs, not raw payloads.
 */
type LogArgs = any[];

function devOnly(fn: (...a: LogArgs) => void, ...args: LogArgs): void {
  if (__DEV__) {
    try {
      fn(...args);
    } catch {}
  }
}

/** Redact likely-secret values before any dev log line. */
export function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    if (/^[A-Za-z0-9+/=_-]{16,}$/.test(value)) return '[redacted-token]';
    return value;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = Array.isArray(value) ? [...(value as unknown[])] as any : {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/pass|secret|token|otp|authorization|card|cvv|aadhaar/i.test(k)) out[k] = '[redacted]';
      else out[k] = redact(v);
    }
    return out;
  }
  return value;
}

export const logger = {
  warn(...args: LogArgs): void {
    devOnly(console.warn as any, ...args.map(redact));
  },
  error(...args: LogArgs): void {
    devOnly(console.error as any, ...args.map(redact));
  },
};
