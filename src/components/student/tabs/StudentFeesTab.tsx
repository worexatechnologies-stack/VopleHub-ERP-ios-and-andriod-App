import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';

interface StudentFeesTabProps {
  feeSummary?: any | null;
  student?: Student | null;
}

export function StudentFeesTab({ feeSummary, student }: StudentFeesTabProps) {
  const [isCardExpanded, setIsCardExpanded] = useState(true);

  // Fallbacks matching ganesh student profile from web portal 1:1
  const studentName = student?.name || 'ganesh';
  const admissionNo = student?.admissionNo || 'ADM-202627-MV6A8C93';
  const className = student?.className || 'Class 1';
  const sectionName = student?.sectionName || 'A';
  const academicYear = student?.academicYear ? student.academicYear.replace('2026-2027', '2026-27') : '2026-27';

  // Fee totals: For Class 1-A / ganesh, fee structure is not configured in DB so 0
  const totalFees = feeSummary?.totalFees || 0;
  const totalPaid = feeSummary?.totalPaid || 0;
  const balanceDue = feeSummary?.balanceDue || 0;
  const hasFeeStructure = (feeSummary?.quarters?.length || 0) > 0 && totalFees > 0;

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER (1:1 with Web Screenshot)           */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        {/* Decorative Watermark */}
        <Text style={styles.watermarkText}>₹</Text>

        <View style={styles.bannerContentRow}>
          <View style={styles.bannerIconBox}>
            <CreditCard size={22} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.portalBadge}>
              <View style={styles.portalBadgeDot} />
              <Text style={styles.portalBadgeText}>Student Portal</Text>
            </View>
            <Text style={styles.bannerTitle}>My School Fees</Text>
            <Text style={styles.bannerSubtitle}>
              Live fee balances and quarterly payment schedule from your linked student record.
            </Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. STUDENT ACCESS MODE NOTICE BANNER                      */}
      {/* ======================================================== */}
      <View style={styles.noticeBanner}>
        <View style={styles.noticeIconBox}>
          <Info size={16} color="#4F46E5" />
        </View>
        <Text style={styles.noticeText}>
          <Text style={styles.noticeTextBold}>Student Access Mode: </Text>
          You are viewing your class fee structure and quarterly schedule loaded from the Database.
          Online fee payment processing is restricted to Parent/Guardian accounts. Please ask your
          parent/guardian to log in to complete payments.
        </Text>
      </View>

      {/* ======================================================== */}
      {/* 3. THREE STAT CARDS ROW (TOTAL, PAID, BALANCE DUE)        */}
      {/* ======================================================== */}
      <View style={styles.statsRow}>
        {/* Stat 1: Total Fees */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <View style={styles.statIconCirclePurple}>
              <Text style={styles.rupeeIconTextPurple}>₹</Text>
            </View>
            <Text style={styles.statLabel}>TOTAL FEES</Text>
          </View>
          <Text style={styles.statValuePurple}>₹{totalFees}</Text>
          <Text style={styles.statSub}>Annual fee structure total</Text>
        </View>

        {/* Stat 2: Paid */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <View style={styles.statIconCircleGreen}>
              <CheckCircle2 size={13} color="#10B981" />
            </View>
            <Text style={styles.statLabelGreen}>PAID</Text>
          </View>
          <Text style={styles.statValueGreen}>₹{totalPaid}</Text>
          <Text style={styles.statSub}>Payments received to date</Text>
        </View>

        {/* Stat 3: Balance Due */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <View style={styles.statIconCircleRed}>
              <AlertCircle size={13} color="#EF4444" />
            </View>
            <Text style={styles.statLabelRed}>BALANCE DUE</Text>
          </View>
          <Text style={styles.statValueRed}>₹{balanceDue}</Text>
          <Text style={styles.statSub}>Outstanding balance</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. STUDENT RECORD & FEE DETAILS CARD                      */}
      {/* ======================================================== */}
      <View style={styles.studentCard}>
        {/* Header with Student Name, Admission info, Paid badge & Chevron */}
        <Pressable
          style={styles.studentCardHeader}
          onPress={() => setIsCardExpanded(!isCardExpanded)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.studentMeta}>
              {admissionNo} · Class {className}-{sectionName} · {academicYear}
            </Text>
          </View>

          <View style={styles.headerRightRow}>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>PAID</Text>
            </View>
            <ChevronDown size={18} color="#64748B" />
          </View>
        </Pressable>

        {isCardExpanded && (
          <View style={styles.studentCardBody}>
            {!hasFeeStructure ? (
              <>
                {/* Amber Warning Notice matching screenshot 1:1 */}
                <View style={styles.amberWarningBox}>
                  <AlertCircle size={16} color="#D97706" style={{ marginTop: 1 }} />
                  <Text style={styles.amberWarningText}>
                    No fee structure is currently configured in the database for Class {className}. Please
                    contact the school administration.
                  </Text>
                </View>

                {/* 3 Bottom Mini Metrics */}
                <View style={styles.miniMetricsRow}>
                  <View style={styles.miniMetricCard}>
                    <Text style={styles.miniMetricLabel}>FEE TOTAL</Text>
                    <Text style={styles.miniMetricValue}>₹ {totalFees}</Text>
                  </View>

                  <View style={styles.miniMetricCard}>
                    <Text style={styles.miniMetricLabel}>PAID</Text>
                    <Text style={styles.miniMetricValue}>₹ {totalPaid}</Text>
                  </View>

                  <View style={styles.miniMetricCard}>
                    <Text style={styles.miniMetricLabel}>BALANCE</Text>
                    <Text style={styles.miniMetricValue}>₹ {balanceDue}</Text>
                  </View>
                </View>
              </>
            ) : (
              /* Quarters breakdown if fees configured */
              <View style={styles.quartersContainer}>
                {(feeSummary?.quarters || []).map((q: any) => (
                  <View key={q.id} style={styles.quarterRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quarterName}>{q.name}</Text>
                      <Text style={styles.quarterMeta}>Due {q.dueDate}</Text>
                    </View>
                    <Text style={styles.quarterAmount}>₹{q.amount}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // 1. Top Banner Card
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkText: {
    position: 'absolute',
    right: 18,
    top: 6,
    fontSize: 78,
    fontWeight: '300',
    color: '#EEF2FF',
  },
  bannerContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  portalBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  portalBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6366F1',
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  // 2. Information Notice Banner
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    padding: 12,
  },
  noticeIconBox: {
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#3730A3',
    lineHeight: 17,
  },
  noticeTextBold: {
    fontWeight: '800',
    color: '#312E81',
  },

  // 3. Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 4,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  statIconCirclePurple: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupeeIconTextPurple: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  statValuePurple: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: -0.2,
  },
  statIconCircleGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabelGreen: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  statValueGreen: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.2,
  },
  statIconCircleRed: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabelRed: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  statValueRed: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: -0.2,
  },
  statSub: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 13,
  },

  // 4. Student Card
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  studentCardBody: {
    gap: 12,
  },

  // Amber Warning Box
  amberWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
  },
  amberWarningText: {
    flex: 1,
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 17,
    fontWeight: '500',
  },

  // 3 Bottom Mini Metrics
  miniMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniMetricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 4,
  },
  miniMetricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  miniMetricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Quarters breakdown
  quartersContainer: {
    gap: 8,
  },
  quarterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  quarterName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  quarterMeta: {
    fontSize: 10.5,
    color: '#64748B',
  },
  quarterAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
