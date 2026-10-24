export interface Teacher {
  id: number;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  salary: number;
  joiningDate: string;
  subjectIds: number[];
  assignedSectionIds: number[];
  photoUrl?: string;
  userId?: number;
}

export interface TeachingAssignment {
  id: number;
  schoolId: string;
  teacherId: number;
  sectionId: number;
  subjectId: number;
  sectionName?: string;
  className?: string;
  subjectName?: string;
}

export interface StaffSalary {
  id: number;
  schoolId: string;
  teacherId: number;
  teacherName?: string;
  month: number; // 1-12
  year: number; // 2026
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash' | 'UPI';
  referenceNumber: string;
  status: 'Paid' | 'Pending' | 'Processing';
  receiptNumber: string;
  notes?: string;
}

export interface TeacherDocument {
  id: number;
  teacherId: number;
  schoolId?: string;
  name: string;
  category: 'Aadhaar Card' | 'Bank Passbook' | 'PAN Card' | 'Qualification Certificate' | 'Other Document' | string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Uploaded';
  remarks?: string;
  uploadedAt: string;
  fileSize?: string;
  downloadUrl?: string;
}

export interface TeacherLeaveRequest {
  id: number;
  teacherId: number;
  teacherName: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Duty Leave';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Declined';
  appliedAt: string;
  adminRemarks?: string;
}

