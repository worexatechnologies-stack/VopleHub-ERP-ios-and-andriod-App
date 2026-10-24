import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import {
  Calendar,
  CreditCard,
  GraduationCap,
  CheckCircle2,
  Bell,
  MessageSquare,
  FileText,
  BookOpen,
  ArrowRight,
  User,
  ExternalLink,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import type { TimetableSlot } from '../../../types/academic';
import type { User as AuthUser } from '../../../types/auth';
import type { ParentNavTab } from '../ParentDashboard';

export function ParentHomeTab({
  currentUser,
  wards,
  selectedWardId,
  onSelectWard,
  slots,
  onNavigate,
}: {
  currentUser: AuthUser;
  wards: Student[];
  selectedWardId: number | 'all';
  onSelectWard: (id: number | 'all') => void;
  slots: TimetableSlot[];
  onNavigate: (tab: ParentNavTab) => void;
}) {
  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];
  const parentName = currentUser.name || 'ullasam';

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP WELCOME CARD (1:1 Web Portal Screenshot 1)        */}
      {/* ======================================================== */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeHeaderRow}>
          <View style={styles.userIconCircle}>
            <User size={22} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.welcomeBadgeRow}>
              <View style={styles.portalPillBadge}>
                <Text style={styles.portalPillBadgeText}>Parent & Family Portal</Text>
              </View>
              <Text style={styles.bulletDateText}>• Thursday, October 15, 2026</Text>
            </View>
            <Text style={styles.welcomeTitle}>Good Afternoon, {parentName}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Welcome to your family dashboard. Monitor your children's daily class attendance, examination marks, and school circulars.
            </Text>
          </View>
        </View>

        {/* SELECT WARD ROW (1:1 Screenshot 1) */}
        <View style={styles.selectWardRow}>
          <Text style={styles.selectWardLabel}>SELECT WARD:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wardPillsScroll}>
            {wards.map((w) => {
              const isSelected = (selectedWardId === w.id) || (selectedWardId === 'all' && w === activeWard);
              return (
                <Pressable
                  key={w.id}
                  style={[styles.wardCapsulePill, isSelected && styles.wardCapsulePillActive]}
                  onPress={() => onSelectWard(w.id)}
                >
                  <GraduationCap size={14} color="#4F46E5" />
                  <Text style={styles.wardCapsuleName}>{w.name}</Text>
                  <View style={styles.wardClassBadge}>
                    <Text style={styles.wardClassBadgeText}>
                      {(w.className || 'Class 1').startsWith('Class')
                        ? `${w.className}-${w.sectionName || 'A'}`
                        : `Class ${w.className}-${w.sectionName || 'A'}`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. DUAL HERO CARDS (1:1 Web Portal Screenshot 1)         */}
      {/* ======================================================== */}
      <View style={styles.dualCardsRow}>
        {/* CARD 1: ATTENDANCE PULSE */}
        <View style={styles.attendancePulseCard}>
          <View style={styles.cardTopHeaderRow}>
            <Text style={styles.cardCategoryHeader}>ATTENDANCE PULSE · COMBINED RECORD</Text>
            <View style={styles.liveDataBadge}>
              <Text style={styles.liveDataBadgeText}>Live Data</Text>
            </View>
          </View>

          <View style={styles.attendanceBodyRow}>
            {/* Donut Progress Ring */}
            <View style={styles.donutRing}>
              <Text style={styles.donutPctText}>50%</Text>
              <Text style={styles.donutLabelText}>PRESENT</Text>
            </View>

            {/* Attendance Details Column */}
            <View style={styles.attendanceDetailsCol}>
              <Text style={styles.attendanceStatusTitle}>Needs Regularity Focus</Text>
              <Text style={styles.attendanceSubtext}>12 daily sessions on file</Text>
              <View style={styles.attentionAdvisedBadge}>
                <View style={styles.orangeDot} />
                <Text style={styles.attentionAdvisedText}>Attention Advised (&lt;75%)</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.cardFooterLink}
            onPress={() => onNavigate('attendance')}
          >
            <Text style={styles.cardFooterLinkText}>View Full Attendance Register →</Text>
          </Pressable>
        </View>

        {/* CARD 2: FINANCIAL DESK */}
        <View style={styles.financialDeskCard}>
          <View style={styles.cardTopHeaderRow}>
            <Text style={styles.cardCategoryHeader}>FINANCIAL DESK · TUITION & FEES</Text>
            <View style={styles.secureGatewayBadge}>
              <Text style={styles.secureGatewayBadgeText}>Secure Gateway</Text>
            </View>
          </View>

          <View style={styles.financialBodyRow}>
            <View style={styles.creditCardIconBox}>
              <CreditCard size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.financialTitle}>Term Invoices & Fee Ledger</Text>
              <Text style={styles.financialSubtext}>
                Review verified school fee dues, previous installment receipts, and make real-time fee payments.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.accessFeeDeskBtn}
            onPress={() => onNavigate('fees')}
          >
            <Text style={styles.accessFeeDeskBtnText}>Access School Fee Desk →</Text>
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. CLASS HOMEWORK & COURSEWORK (1:1 Screenshot 1)        */}
      {/* ======================================================== */}
      <View style={styles.homeworkCard}>
        <View style={styles.homeworkHeaderRow}>
          <View style={styles.homeworkHeaderLeft}>
            <View style={styles.bookOutlineBox}>
              <BookOpen size={18} color="#4F46E5" />
            </View>
            <Text style={styles.homeworkHeaderTitle}>Class Homework & Coursework</Text>
          </View>
          <Pressable onPress={() => onNavigate('homework')}>
            <Text style={styles.openDeskLinkText}>Open Homework Desk (0) →</Text>
          </Pressable>
        </View>

        <Text style={styles.homeworkSubtitle}>
          Active assignments, project tasks, and curriculum deadlines from class teachers.
        </Text>

        {/* Empty state (1:1 with Screenshot 1) */}
        <View style={styles.homeworkEmptyBox}>
          <CheckCircle2 size={36} color="#10B981" />
          <Text style={styles.homeworkEmptyTitle}>
            No active homework assignments for this class.
          </Text>
          <Text style={styles.homeworkEmptySub}>
            Your child is all caught up with their coursework!
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. PARENT PORTALS & SERVICES (1:1 Screenshot 2)          */}
      {/* ======================================================== */}
      <View style={styles.servicesSection}>
        <View style={styles.servicesHeader}>
          <Text style={styles.servicesSectionTitle}>Parent Portals & Services</Text>
          <Text style={styles.servicesSectionSubtitle}>
            Select any section below to view detailed records, timetables, and circulars for your children.
          </Text>
        </View>

        <View style={styles.servicesGrid}>
          {/* 1. Child's Timetable */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('academic')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxPurple}>
                <Calendar size={18} color="#6366F1" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>ACADEMIC</Text>
              </View>
            </View>
            <Text style={styles.serviceItemTitle}>Child's Timetable</Text>
            <Text style={styles.serviceItemSubtitle}>
              View weekly schedules, periods, instructors & classroom venues.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>

          {/* 2. Ward Attendance */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('attendance')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxBlue}>
                <CheckCircle2 size={18} color="#3B82F6" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>DAILY TRACKER</Text>
              </View>
            </View>
            <Text style={styles.serviceItemTitle}>Ward Attendance</Text>
            <Text style={styles.serviceItemSubtitle}>
              Track daily class presence, session status and period registers.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>

          {/* 3. Class Homework */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('homework')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxPurple}>
                <BookOpen size={18} color="#6366F1" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>CURRICULUM</Text>
              </View>
            </View>
            <Text style={styles.serviceItemTitle}>Class Homework</Text>
            <Text style={styles.serviceItemSubtitle}>
              View assigned class tasks, due dates, and ward completion marks.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>

          {/* 4. School Notices */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('notifications')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxPurple}>
                <Bell size={18} color="#6366F1" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>CIRCULARS</Text>
              </View>
            </View>
            <Text style={styles.serviceItemTitle}>School Notices</Text>
            <Text style={styles.serviceItemSubtitle}>
              Official announcements, circulars & class-wise broadcast alerts.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>

          {/* 5. School Fee Desk */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('fees')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxBlueFilled}>
                <CreditCard size={18} color="#FFFFFF" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>FINANCE DESK</Text>
              </View>
            </View>
            <Text style={[styles.serviceItemTitle, { color: '#2563EB' }]}>School Fee Desk</Text>
            <Text style={styles.serviceItemSubtitle}>
              Review term tuition fees, invoice ledgers & payment receipts.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>

          {/* 6. Exam Reports */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('exams')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxPurple}>
                <FileText size={18} color="#6366F1" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>REPORT CARDS</Text>
              </View>
            </View>
            <Text style={styles.serviceItemTitle}>Exam Reports</Text>
            <Text style={styles.serviceItemSubtitle}>
              Access published subject marks, grades & teacher evaluation feedback.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>

          {/* 7. Teacher Chat */}
          <Pressable style={styles.serviceItemCard} onPress={() => onNavigate('communication')}>
            <View style={styles.serviceCardTopRow}>
              <View style={styles.serviceIconBoxPurple}>
                <MessageSquare size={18} color="#6366F1" />
              </View>
              <View style={styles.serviceCategoryPill}>
                <Text style={styles.serviceCategoryPillText}>DIRECT CHAT</Text>
              </View>
            </View>
            <Text style={styles.serviceItemTitle}>Teacher Chat</Text>
            <Text style={styles.serviceItemSubtitle}>
              Direct 1-on-1 private messaging with your children's assigned teachers.
            </Text>
            <Text style={styles.serviceOpenLink}>Open Section →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 32,
  },
  // 1. Welcome Card
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  userIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  welcomeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  portalPillBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  portalPillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.2,
  },
  bulletDateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 3,
  },
  selectWardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  selectWardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  wardPillsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  wardCapsulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  wardCapsulePillActive: {
    backgroundColor: '#E0E7FF',
    borderColor: '#818CF8',
  },
  wardCapsuleName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  wardClassBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  wardClassBadgeText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '700',
  },

  // 2. Dual Hero Cards
  dualCardsRow: {
    gap: 12,
  },
  attendancePulseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  financialDeskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategoryHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  liveDataBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveDataBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  secureGatewayBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  secureGatewayBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  attendanceBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  donutRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 7,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPctText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D97706',
  },
  donutLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  attendanceDetailsCol: {
    flex: 1,
    gap: 3,
  },
  attendanceStatusTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  attendanceSubtext: {
    fontSize: 11,
    color: '#64748B',
  },
  attentionAdvisedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  attentionAdvisedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  cardFooterLink: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  cardFooterLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  financialBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  creditCardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  financialTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  financialSubtext: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  accessFeeDeskBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessFeeDeskBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // 3. Class Homework Card
  homeworkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  homeworkHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  homeworkHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  bookOutlineBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  homeworkHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  openDeskLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  homeworkSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  homeworkEmptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  homeworkEmptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  homeworkEmptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },

  // 4. Parent Portals & Services (1:1 Screenshot 2)
  servicesSection: {
    gap: 12,
    marginTop: 8,
  },
  servicesHeader: {
    gap: 3,
  },
  servicesSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  servicesSectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  serviceCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceIconBoxPurple: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconBoxBlue: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconBoxBlueFilled: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceCategoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceCategoryPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.3,
  },
  serviceItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  serviceItemSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  serviceOpenLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 4,
  },
});
