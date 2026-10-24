import type { Student } from '../types/student';
import type { TimetableSlot } from '../types/academic';
import { WEEK_DAYS } from './constants';

export type WardId = number | 'all';

/**
 * Single impl of the ward-resolution rule duplicated in
 * ParentHomeTab / ParentAcademicTab / ParentExamsTab / useActiveWard.
 * 'all' -> first ward; unknown id -> first ward (never undefined when wards exist).
 */
export function resolveActiveWard(
  wards: Student[],
  selectedWardId: WardId
): Student | undefined {
  if (!wards.length) return undefined;
  if (selectedWardId === 'all') return wards[0];
  return wards.find((w) => w.id === selectedWardId) || wards[0];
}

function slotClassOf(s: TimetableSlot): string {
  return s.className || (s as any).class || '';
}

function slotSectionOf(s: TimetableSlot): string {
  return s.sectionName || (s as any).section || '';
}

export function slotMatchesWard(slot: TimetableSlot, ward?: Student | null): boolean {
  if (!ward) return true;
  return (
    slotClassOf(slot) === (ward.className || '') &&
    slotSectionOf(slot) === (ward.sectionName || '')
  );
}

/** Ward-scoped + published-only filter (was inline in ParentAcademicTab). */
export function filterWardSlots(slots: TimetableSlot[], ward?: Student | null): TimetableSlot[] {
  return (slots || []).filter((s) => s.published !== false && slotMatchesWard(s, ward));
}

/** Day filter + period sort, shared by 6 timetable views. */
export function filterSlotsByDay(slots: TimetableSlot[], day: string): TimetableSlot[] {
  return (slots || []).filter((s) => s.day === day).sort((a, b) => a.period - b.period);
}

export function getWardDaySlots(
  slots: TimetableSlot[],
  ward: Student | undefined,
  day: string
): TimetableSlot[] {
  return filterSlotsByDay(filterWardSlots(slots, ward ?? null), day);
}

export function slotSubjectLabel(slot: TimetableSlot): string {
  return slot.subjectName || (slot as any).subject || 'Subject';
}

export function slotClassLabel(slot: TimetableSlot): string {
  const c = slotClassOf(slot);
  const sec = slotSectionOf(slot);
  return c && sec ? `${c}-${sec}` : c || sec || '';
}

export function todayWeekdayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

export function isWeekDayName(v: string): boolean {
  return (WEEK_DAYS as readonly string[]).includes(v);
}
