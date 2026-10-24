/**
 * Single source of truth for app-wide constants.
 * Eliminates duplicated literals: week days (4 files), month names,
 * cycle label (3 dashboards + TopBar default), payment gateways/methods,
 * poll intervals, and academic year strings.
 */

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const CYCLE_LABEL = 'CYCLE 2026-27';
export const ACADEMIC_YEAR = '2026-2027';
export const SALARY_YEAR = 2026;

/** Payment gateway pills shown in ParentFeesTab. 'NetBanking' matches API normalization. */
export const FEE_GATEWAYS = ['UPI', 'Card', 'NetBanking'] as const;

/** Canonical payment methods (matches FeePayment['paymentMethod'] type). */
export const FEE_PAYMENT_METHODS = [
  'UPI',
  'Net Banking',
  'Card',
  'Cash',
  'Cheque',
] as const;

/** Live-poll intervals (ms) used across chat / notices hooks. */
export const POLL_MS = {
  chat: 3000,
  notices: 10000,
} as const;

export const TOKEN_STORAGE_KEY = 'school_erp_api_token';
export const USER_STORAGE_KEY = 'school_erp_user_json';
export const BASE_URL_STORAGE_KEY = 'school_erp_base_url';
export const DEFAULT_API_BASE_URL = 'https://volpehub.in/api/v1';
export const DEFAULT_WS_BASE_URL = 'wss://volpehub.in/ws/chat/';

/**
 * FINDING CCTV-01 / LOC-01 (production contract — features do not exist yet):
 * the app ships NO camera, microphone, CCTV/live-stream, WebView video, or
 * geolocation code. When/if such features are added, ALL of these MUST hold —
 * enforced by the backend, never by UI hiding alone.
 */
export const MEDIA_SECURITY_POLICY = {
  cctv: {
    allowed: false, // no CCTV/live-classroom feature in this build
    requires: [
      'verified session (short-lived stream token, 60-300s expiry)',
      'backend check of user + school + class + camera permission per request',
      'per-viewer signed URL (never a permanent public stream URL)',
      'TLS in transit; recording/screenshot policy enforced + audited',
    ],
  },
  location: {
    collected: false, // no geolocation collection in this build
    requires: [
      'explicit feature need + foreground-only collection',
      'purpose string shown before permission prompt',
      'no background tracking; minimal retention; no cross-user exposure',
    ],
  },
} as const;
