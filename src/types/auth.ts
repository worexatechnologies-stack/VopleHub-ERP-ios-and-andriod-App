export type Role = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student' | 'public_learner';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  schoolId: string;
  schoolName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  studentId: number | null;
  parentStudentIds: number[];
  permissions: string[];
  avatarUrl?: string;
  phone?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  studentsCount?: number;
  teachersCount?: number;
}

export interface AuthResponse {
  access: string;
  user: User;
}

/**
 * SECURITY CONTRACT (mock auth — see AUDIT_REPORT/SECURITY_FINDINGS):
 * - This in-app mock is NOT the production backend. The production backend MUST
 *   re-enforce every rule below from a verified session and MUST NOT trust ids,
 *   roles, or filters sent by the phone.
 * - Client checks here are defense-in-depth + UX only.
 */
export const AUTHZ_CONTRACT = [
  'deny-by-default: unknown role/action => 403',
  'ownership: parent<->parentStudentIds, student<->studentId, teacher<->userId',
  'id-integrity: teacher.userId must equal auth user id (no teacherId==userId alias)',
  'rate-limit: 5 failed logins per 15 min per account+device (server-enforced)',
  'no backdoor passwords: only stored credential verifies',
  'no role elevation via role param mismatch',
] as const;

export interface LoginCredentials {
  loginId: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
  userId: number;
}
