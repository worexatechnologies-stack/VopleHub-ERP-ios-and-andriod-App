/**
 * Pure validators with NO react-native imports (jest-safe).
 * UI-level Alert wrappers live in validation.ts (RN runtime only).
 */

/** Centralized validation — was scattered across document/payment/leave/comms tabs. */

export function isValidAadhaar(v: string | undefined | null): boolean {
  return !!v && /^\d{12}$/.test(v.trim());
}

export function validateAadhaarInput(aadhaar: string): string | null {
  const t = (aadhaar || '').trim();
  if (!t) return null; // optional: empty means "Front and Back" generic upload
  if (!/^\d{12}$/.test(t)) return 'Aadhaar number must be exactly 12 digits.';
  return null;
}

export function validateRequired(value: string | undefined | null, fieldLabel = 'This field'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required.`;
  return null;
}

export function validatePasswordPair(password: string, confirm: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validatePositiveAmount(amount: number | string | undefined | null): string | null {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 'Amount must be a positive number';
  return null;
}

/** Show a validation failure without leaking internals (RN wrapper). */
export function alertValidation(
  message: string | null,
  title = 'Check input',
  show: (t: string, m: string) => void
): boolean {
  if (!message) return false;
  show(title, message);
  return true;
}

/** Wrap an async submit with validation-first + safe error surfacing (RN wrapper). */
export async function submitWithValidation(
  error: string | null,
  task: () => Promise<void>,
  failureTitle = 'Save failed',
  show: (t: string, m: string) => void = () => {},
  getMessage: (e: unknown) => string = (e) => (e as any)?.message || failureTitle
): Promise<boolean> {
  if (error) {
    show('Check input', error);
    return false;
  }
  try {
    await task();
    return true;
  } catch (e) {
    show(failureTitle, getMessage(e));
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Login input shape check. Real credential verification stays server-side. */
export function validateLoginInput(email: string, password: string): string | null {
  const e = (email || '').trim();
  if (!e || !EMAIL_RE.test(e.slice(0, 254))) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  if (password.length > 256) return 'Password is too long.';
  return null;
}

/** Change-password input check (length + match only; strength policy is server-side). */
export function validateNewPassword(password: string, confirm: string): string | null {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long';
  if (password.length > 256) return 'Password is too long.';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

const MAX_TEXT_LEN: Record<string, number> = {
  default: 2000,
  title: 200,
  name: 120,
};

/** Bounded free-text check used before chat/broadcast/leave submissions. */
export function validateBoundedText(
  value: string | undefined | null,
  fieldLabel = 'Message',
  max = MAX_TEXT_LEN.default
): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required.`;
  if (value.trim().length > max) return `${fieldLabel} must be under ${max} characters.`;
  return null;
}

/** Document metadata allow-list (no executable / path-traversal names). */
export function validateDocumentMeta(name: string, category: string): string | null {
  const n = (name || '').trim();
  if (!n) return 'Document name is required.';
  if (n.length > 160) return 'Document name is too long.';
  if (/[<>:"/\\|?*\x00-\x1f]/.test(n) || /\.\./.test(n)) return 'Document name contains invalid characters.';
  if (/\.(exe|bat|cmd|sh|js|jar|apk|com|scr|msi)$/i.test(n)) return 'That file type is not allowed.';
  if (!category || !category.trim()) return 'Document category is required.';
  return null;
}


