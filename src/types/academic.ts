export interface AcademicYear {
  id: number;
  schoolId: string;
  name: string; // e.g. "2026-2027"
  startsOn: string;
  endsOn: string;
  is_active: boolean;
}

export interface SchoolClass {
  id: number;
  schoolId: string;
  name: string; // e.g. "Class 10"
  code: string; // e.g. "C10"
  sortOrder: number;
  subjectIds: number[];
}

export interface Section {
  id: number;
  schoolId: string;
  classId: number;
  className?: string;
  name: string; // e.g. "A"
}

export interface Subject {
  id: number;
  schoolId: string;
  name: string;
  code?: string;
  scopes?: string[];
  semantics?: {
    assigned?: boolean;
    scheduled?: boolean;
  };
}

export interface TimetableSlot {
  id: number;
  schoolId: string;
  academicYear: string;
  sectionId: number;
  subjectId: number;
  teacherId: number;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number; // 1 to 6
  time: string; // e.g. "09:00 - 09:45"
  classroom: string;
  published: boolean;
  // Resolved labels
  subjectName?: string;
  teacherName?: string;
  className?: string;
  sectionName?: string;
  subject?: string;
  class?: string;
  section?: string;
}

