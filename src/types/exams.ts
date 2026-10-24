export type ExamScheduleStatus = 'DRAFT' | 'PUBLISHED' | 'HALL_TICKETS_RELEASED' | 'MARKS_SUBMITTED' | 'REPORT_CARDS_PUBLISHED';

export interface ExamPaper {
  id: number;
  subjectId: number;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passingMarks: number;
  classroom: string;
}

export interface ExamSchedule {
  id: number;
  schoolId: string;
  name: string; // e.g. "Mid-Term Examination 2026"
  className: string;
  classId: number;
  academicYear: string;
  status: ExamScheduleStatus;
  startDate: string;
  endDate: string;
  papers: ExamPaper[];
  hallTicketsReleased: boolean;
  marksPublished: boolean;
  reportCardsPublished: boolean;
}

export interface MarksEntry {
  studentId: number;
  studentName?: string;
  rollNo?: string;
  subjectName: string;
  subjectId: number;
  marksObtained: number;
  maxMarks: number;
  remarks?: string;
  grade?: string;
}

export interface HallTicket {
  ticketNumber: string;
  studentId: number;
  studentName: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  sectionName: string;
  examName: string;
  academicYear: string;
  photoUrl?: string;
  papers: ExamPaper[];
  rules: string[];
  qrPayload: string;
}

export interface ReportCard {
  id: number;
  studentId: number;
  studentName: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  sectionName: string;
  examName: string;
  academicYear: string;
  entries: MarksEntry[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  gpa: string;
  grade: string;
  rank: number;
  attendancePercentage: number;
  teacherRemarks: string;
  principalRemarks: string;
  publishedDate: string;
}
