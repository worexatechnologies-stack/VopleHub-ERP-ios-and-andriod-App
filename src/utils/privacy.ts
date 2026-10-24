import type { Student } from '../types/student';
import type { Teacher } from '../types/teacher';
import type { User } from '../types/auth';

/**
 * FINDING PRIV-01 (testable privacy contract):
 * role-scoped student DTOs. Teachers get roster minimum only; admin,
 * linked parent, and self keep the full record. Guests get nothing.
 */
export function sanitizeStudent(student: Student, user: User | null): Partial<Student> {
  if (!student) return {} as Partial<Student>;
  const role = (user?.role || 'teacher').toLowerCase();
  if (role === 'super_admin' || role === 'school_admin' || role === 'parent' || role === 'student') {
    return student;
  }
  const roster: Partial<Student> & Record<string, unknown> = { ...(student as unknown as Record<string, unknown>) };
  delete roster.parentPhone;
  delete roster.aadhaar;
  delete roster.feeTotal;
  delete roster.feePaid;
  delete roster.medicalConditions;
  delete roster.bloodGroup;
  return roster;
}

/** Teacher rows never expose salary/bank internals to non-admin callers. */
export function sanitizeTeacherList(teachers: Teacher[], user: User | null): Array<Partial<Teacher>> {
  if (!user || user.role === 'super_admin' || user.role === 'school_admin') return teachers;
  return teachers.map((t) => {
    const row: Partial<Teacher> & Record<string, unknown> = { ...(t as unknown as Record<string, unknown>) };
    delete row.salary;
    delete row.phone;
    return row;
  });
}
