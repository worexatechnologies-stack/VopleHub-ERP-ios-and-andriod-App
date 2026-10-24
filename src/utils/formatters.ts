/**
 * Centralized formatting and utility helpers
 * Eliminates duplicate currency, date, initials, and status formatting across portals
 */

/**
 * Formats a numeric or string amount into standard Indian Rupee format (₹)
 * Example: formatCurrency(16000) => "₹16,000"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
  if (isNaN(numeric)) return '₹0';
  return `₹${numeric.toLocaleString('en-IN')}`;
}

/**
 * Extracts 1-2 uppercase initials from a full name
 * Example: getInitials("Aarav Sharma") => "AS"
 * Example: getInitials("Teacher") => "T"
 */
export function getInitials(name: string | undefined | null, maxChars = 2): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, maxChars).toUpperCase();
  }
  return parts
    .slice(0, maxChars)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/**
 * Standardized date formatter
 * Example: formatDate("2026-09-30") => "30 Sep 2026"
 */
export function formatDate(
  dateInput: string | Date | undefined | null,
  style: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    if (style === 'short') {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    if (style === 'long') {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(dateInput);
  }
}

export interface StatusTheme {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

/**
 * Resolves standard styling palette for status values across all modules
 */
export function getStatusTheme(status: string | undefined | null): StatusTheme {
  const s = (status || '').toLowerCase().trim();

  // Success / Green
  if (
    s === 'present' ||
    s === 'paid' ||
    s === 'active' ||
    s === 'approved' ||
    s === 'verified' ||
    s === 'completed' ||
    s === 'passed' ||
    s === 'good standing' ||
    s === 'submitted'
  ) {
    return {
      bg: '#DCFCE7',
      text: '#16A34A',
      border: '#BBF7D0',
      dot: '#16A34A',
    };
  }

  // Danger / Red
  if (
    s === 'absent' ||
    s === 'due' ||
    s === 'overdue' ||
    s === 'failed' ||
    s === 'rejected' ||
    s === 'cancelled' ||
    s === 'inactive'
  ) {
    return {
      bg: '#FEE2E2',
      text: '#DC2626',
      border: '#FECACA',
      dot: '#DC2626',
    };
  }

  // Warning / Amber
  if (
    s === 'late' ||
    s === 'pending' ||
    s === 'upcoming' ||
    s === 'under review' ||
    s === 'partial' ||
    s === 'in progress'
  ) {
    return {
      bg: '#FEF3C7',
      text: '#D97706',
      border: '#FDE68A',
      dot: '#D97706',
    };
  }

  // Info / Indigo / Purple
  if (
    s === 'half day' ||
    s === 'half_day' ||
    s === 'halfday' ||
    s === 'leave' ||
    s === 'excused' ||
    s === 'draft' ||
    s === 'optional'
  ) {
    return {
      bg: '#EEF2FF',
      text: '#4F46E5',
      border: '#C7D2FE',
      dot: '#4F46E5',
    };
  }

  // Default neutral
  return {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#E2E8F0',
    dot: '#94A3B8',
  };
}

/**
 * Formats user online / last seen / typing status for chat headers & cards
 * Example:
 * - isTyping=true -> "typing..."
 * - isOnline=true -> "online"
 * - lastSeenAt="2026-10-22T08:30:00Z" -> "last seen today at 2:00 PM"
 * - lastSeenAt="2026-10-21T08:30:00Z" -> "last seen yesterday at 2:00 PM"
 * - lastSeenAt=null/undefined -> "offline"
 */
export function formatPresenceStatus(
  isOnline: boolean,
  lastSeenAt?: string | null,
  isTyping?: boolean
): string {
  if (isTyping) return 'typing...';
  if (isOnline) return 'online';
  if (!lastSeenAt) return 'offline';

  try {
    const d = new Date(lastSeenAt);
    if (isNaN(d.getTime())) return 'offline';

    const now = new Date();
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return `last seen today at ${timeStr}`;
    }
    if (isYesterday) {
      return `last seen yesterday at ${timeStr}`;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    if (d.getFullYear() === now.getFullYear()) {
      return `last seen ${d.getDate()} ${month} at ${timeStr}`;
    }
    return `last seen ${d.getDate()} ${month} ${d.getFullYear()} at ${timeStr}`;
  } catch {
    return 'offline';
  }
}
