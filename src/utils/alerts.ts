import { Alert } from 'react-native';

/** Shared alert helpers — one wording for the same failure everywhere. */
export function alertError(title: string, e: unknown, fallback: string): void {
  const message = (e as any)?.message || fallback;
  Alert.alert(title, message);
}

export function alertSaveFailed(e: unknown, what = 'Save'): void {
  alertError(`${what} failed`, e, `Could not ${what.toLowerCase()}. Try again.`);
}

export function getErrorMessage(e: unknown, fallback = 'Something went wrong. Try again.'): string {
  return (e as any)?.message || fallback;
}
