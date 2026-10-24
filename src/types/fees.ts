export type FeeTier = 'school' | 'class' | 'section' | 'student';
export type PaymentStatus = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'UNCONFIGURED';

export interface FeeStructureItem {
  category: string; // Tuition, Laboratory, Library, Sports, Transport
  amount: number;
}

export interface FeeStructure {
  id: number;
  schoolId: string;
  tier: FeeTier;
  targetClassId?: number;
  targetSectionId?: number;
  targetStudentId?: number;
  academicYear: string;
  name: string;
  totalAnnualAmount: number;
  breakdown: FeeStructureItem[];
}

export interface FeeQuarter {
  id: number;
  name: string; // "Q1 (Apr - Jun)", "Q2 (Jul - Sep)", "Q3 (Oct - Dec)", "Q4 (Jan - Mar)"
  quarterCode: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: string;
  transactionRef?: string;
}

export interface FeePayment {
  id: number;
  receiptNo: string;
  studentId: number;
  studentName?: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'Net Banking' | 'Card' | 'Cash' | 'Cheque';
  category: string;
  installmentType: string;
  quarterId?: number;
  quarterName?: string;
  transactionRef: string;
}

export interface StudentFeeSummary {
  studentId: number;
  studentName: string;
  admissionNo: string;
  class: string;
  section: string;
  academicYear: string;
  hasStructure: boolean;
  totalFees: number;
  totalPaid: number;
  balanceDue: number;
  quartersPaid: number;
  totalQuarters: number;
  paymentStatus: PaymentStatus;
  quarters: FeeQuarter[];
  payments: FeePayment[];
  breakdown: FeeStructureItem[];
}

export interface SchoolRevenueData {
  totalRevenue: number;
  totalInvoiced: number;
  pendingReceivables: number;
  collectionRate: number; // percentage e.g. 78.5
  monthlyDistribution: { month: string; amount: number }[];
  recentPayments: FeePayment[];
  studentsCount: number;
  lastUpdated: string;
}
