import { useWindowDimensions } from 'react-native';

/**
 * Single source of truth for responsive breakpoints.
 * Replaces duplicated `isWide / isTablet / isMobile / isSplit / isSmallMobile`
 * logic previously copy-pasted in TeacherDashboard, StudentDashboard, PortalTopBar, ParentDashboard.
 */
export function useResponsive(wideBreakpoint = 960) {
  const { width, height } = useWindowDimensions();
  const isWide = width >= wideBreakpoint;
  const isTablet = width >= 600 && width < 960;
  const isMobile = width < 600;
  const isSplit = width >= 640;
  const isSmallMobile = width < 380;
  return { width, height, isWide, isTablet, isMobile, isSplit, isSmallMobile };
}

/** Greeting by hour — shared by all portal dashboards. */
export function useGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const first = (name || '').trim().split(/\s+/)[0] || 'there';
  if (hour < 12) return `Good Morning, ${first}!`;
  if (hour < 17) return `Good Afternoon, ${first}!`;
  return `Good Evening, ${first}!`;
}

/** Today label e.g. "Tuesday, 30 September 2026". */
export function useTodayLabel(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

