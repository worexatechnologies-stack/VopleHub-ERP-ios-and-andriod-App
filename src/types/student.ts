export interface Student {
  id: number;
  schoolId: string;
  admissionNo: string;
  name: string;
  sectionId: number;
  className: string;
  sectionName: string;
  rollNo: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  medicalConditions?: string;
  bloodGroup?: string;
  aadhaar?: string;
  fatherName?: string;
  motherName?: string;
  academicYear: string;
  photoUrl?: string;
  status: 'Active' | 'Inactive' | 'Transferred';
  parentUserId?: number;
  studentUserId?: number;
  attendancePercentage?: number;
  feeTotal?: number;
  feePaid?: number;
  gpa?: number;
  documents?: StudentDocument[];
}

export interface StudentDocument {
  id: number;
  studentId: number;
  schoolId: string;
  name: string;
  category: 'Aadhaar Card' | 'Birth Certificate' | 'Transfer Certificate' | 'Immunization Record' | 'Previous Marksheet';
  status: 'Verified' | 'Rejected' | 'Pending';
  remarks?: string;
  uploadedAt: string;
  fileSize?: string;
  downloadUrl?: string;
}

export interface StudentAdmissionResponse {
  student: Student;
  studentCredentials: {
    loginId: string;
    temporaryPassword: string;
    mustChangePassword: boolean;
  };
  parentCredentials: {
    loginId: string;
    temporaryPassword: string;
    mustChangePassword: boolean;
  };
}

export interface StudentFilterParams {
  classId?: number;
  sectionId?: number;
  search?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export type StudentAdmissionPayload = Partial<Student> & {
  name: string;
  academicYear: string;
};
