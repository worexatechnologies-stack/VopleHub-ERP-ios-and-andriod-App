import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import { useWardFees } from '../hooks/useWardFees';
import { apiRecordStudentPayment } from '../../../services/schoolApi';
import { formatCurrency, alertError } from '../../../utils';
import { useBusyId } from '../../../utils/async';
import type { Student } from '../../../types/student';

interface ParentFeesTabProps {
  wards?: Student[];
  selectedWardId?: number | 'all';
  onSelectWard?: (id: number) => void;
  studentId?: number;
  studentName?: string;
}

export function ParentFeesTab({
  wards = [],
  selectedWardId,
  onSelectWard,
  studentId: directStudentId,
  studentName: directStudentName,
}: ParentFeesTabProps) {
  const [internalWardId, setInternalWardId] = useState<number | undefined>(
    typeof selectedWardId === 'number' ? selectedWardId : wards[0]?.id || directStudentId || 301
  );

  const activeWardId = internalWardId ?? (typeof selectedWardId === 'number' ? selectedWardId : wards[0]?.id || 301);

  // Resolve active student
  const activeWard =
    wards.find((w) => w.id === activeWardId) ||
    wards[0] ||
    (directStudentId
      ? {
          id: directStudentId,
          name: directStudentName || 'ganesh',
          admissionNo: 'ADM-202627-MV6A8C93',
          className: 'Class 1',
          sectionName: 'A',
          rollNo: '1',
        }
      : {
          id: 301,
          name: 'ganesh',
          admissionNo: 'ADM-202627-MV6A8C93',
          className: 'Class 1',
          sectionName: 'A',
          rollNo: '1',
        });

  const studentId = activeWard?.id ?? 301;
  const wardName = activeWard?.name || 'ganesh';
  const admissionNo = activeWard?.admissionNo || 'ADM-202627-MV6A8C93';
  const classLabel = `${activeWard?.className || 'Class 1'}-${activeWard?.sectionName || 'A'}`;

  const handleSelectWard = (id: number) => {
    setInternalWardId(id);
    onSelectWard?.(id);
  };

  const { summary, loading, reload } = useWardFees(studentId);
  const [accordionOpen, setAccordionOpen] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<'UPI' | 'Net Banking' | 'Card'>('UPI');
  const { busyId: paying, runWithId: payWithId } = useBusyId();

  const totalFees = summary?.totalFees ?? 0;
  const totalPaid = summary?.totalPaid ?? 0;
  const balanceDue = summary?.balanceDue ?? 0;
  const hasStructure = summary?.hasStructure ?? false;
  const quarters = summary?.quarters ?? [];
  const breakdown = summary?.breakdown ?? [];

  const handlePayQuarter = async (quarterId: number) => {
    if (!summary) return;
    const idx = summary.quarters.findIndex((q) => q.id === quarterId);
    if (idx < 0) return;
    const blocked = summary.quarters.slice(0, idx).find((q) => q.status !== 'PAID');
    if (blocked) {
      Alert.alert('Pay earlier quarters first', `Please clear ${blocked.name} before paying this quarter.`);
      return;
    }
    const q = summary.quarters[idx];
    if (q.status === 'PAID') return;

    await payWithId(quarterId, async () => {
      try {
        await apiRecordStudentPayment({
          studentId,
          amountPaid: q.amount,
          paymentMethod: selectedGateway,
          category: q.name,
          installmentType: 'Quarterly',
          quarterId: q.id,
        });
        await reload(studentId);
        Alert.alert('Payment Successful', `Recorded ${formatCurrency(q.amount)} for ${q.name}.`);
      } catch (e: any) {
        alertError('Payment failed', e, 'Could not record payment. Please try again.');
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerIconBox}>
            <CreditCard size={20} color="#4F46E5" />
          </View>
          <View style={styles.parentPortalPill}>
            <View style={styles.portalDot} />
            <Text style={styles.parentPortalText}>Parent Portal</Text>
          </View>
        </View>

        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.headerTitle}>My School Fees</Text>
            <Text style={styles.headerSubtitle}>
              Live fee balances and quarterly payment schedule from your linked student record.
            </Text>
          </View>
          <Text style={styles.watermarkRupee}>₹</Text>
        </View>
      </View>

      {/* Ward Switcher Pills (if multiple wards) */}
      {wards.length > 1 && (
        <View style={styles.wardSwitcherRow}>
          <Text style={styles.wardSwitcherLabel}>STUDENT RECORD:</Text>
          <View style={styles.wardPillsWrap}>
            {wards.map((w) => {
              const isSelected = w.id === studentId;
              return (
                <Pressable
                  key={w.id}
                  onPress={() => handleSelectWard(w.id)}
                  style={[styles.wardPill, isSelected && styles.wardPillActive]}
                >
                  <Text style={[styles.wardPillText, isSelected && styles.wardPillTextActive]}>
                    {w.name} ({w.className}-{w.sectionName})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* 2. Top 3 Stat Cards in a row */}
      <View style={styles.statsRow}>
        {/* Total Fees */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <Text style={styles.statRupeeSymbol}>₹</Text>
            <Text style={styles.statLabel}>TOTAL FEES</Text>
          </View>
          <Text style={[styles.statValue, { color: '#0F172A' }]}>
            ₹{totalFees.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.statFootnote}>Annual fee structure total</Text>
        </View>

        {/* Paid */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <CheckCircle2 size={13} color="#059669" />
            <Text style={styles.statLabel}>PAID</Text>
          </View>
          <Text style={[styles.statValue, { color: '#059669' }]}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.statFootnote}>Payments received to date</Text>
        </View>

        {/* Balance Due */}
        <View style={styles.statCard}>
          <View style={styles.statHeaderRow}>
            <AlertCircle size={13} color="#EF4444" />
            <Text style={styles.statLabel}>BALANCE DUE</Text>
          </View>
          <Text style={[styles.statValue, { color: balanceDue > 0 ? '#EF4444' : '#EF4444' }]}>
            ₹{balanceDue.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.statFootnote}>Outstanding balance</Text>
        </View>
      </View>

      {/* 3. Ward Fee Accordion Card */}
      <View style={styles.wardCard}>
        {/* Accordion Header */}
        <Pressable
          onPress={() => setAccordionOpen(!accordionOpen)}
          style={styles.wardCardHeader}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.wardName}>{wardName}</Text>
            <Text style={styles.wardMeta}>
              {admissionNo} · Class {classLabel} · 2026-27
            </Text>
          </View>
          <View style={styles.wardHeaderRight}>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>
                {balanceDue === 0 ? 'PAID' : 'PARTIALLY PAID'}
              </Text>
            </View>
            {accordionOpen ? (
              <ChevronUp size={20} color="#64748B" />
            ) : (
              <ChevronDown size={20} color="#64748B" />
            )}
          </View>
        </Pressable>

        {accordionOpen && (
          <View style={styles.wardCardBody}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.loadingText}>Fetching live ledger...</Text>
              </View>
            ) : (
              <>
                {/* Warning banner if no fee structure is configured for this class */}
                {!hasStructure && (
                  <View style={styles.warningBanner}>
                    <AlertCircle size={16} color="#D97706" style={{ marginTop: 1 }} />
                    <Text style={styles.warningText}>
                      No fee structure is currently configured in the database for Class{' '}
                      {activeWard?.className || 'Class 1'}. Please contact the school administration.
                    </Text>
                  </View>
                )}

                {/* 3 Mini Stat Cards */}
                <View style={styles.miniStatsRow}>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatLabel}>FEE TOTAL</Text>
                    <Text style={styles.miniStatValue}>₹ {totalFees.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatLabel}>PAID</Text>
                    <Text style={styles.miniStatValue}>₹ {totalPaid.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatLabel}>BALANCE</Text>
                    <Text style={styles.miniStatValue}>₹ {balanceDue.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Section Header: Quarterly Fee Schedule */}
                <View style={styles.scheduleHeaderRow}>
                  <View style={styles.scheduleTitleWrap}>
                    <Calendar size={15} color="#4F46E5" />
                    <Text style={styles.scheduleTitle}>
                      Quarterly Fee Schedule & Payment Division
                    </Text>
                  </View>
                  <Text style={styles.scheduleSubtitle}>
                    Pay per quarter or in custom partial amounts
                  </Text>
                </View>

                {/* Quarters List (if configured) */}
                {hasStructure && quarters.length > 0 && (
                  <View style={styles.quartersContainer}>
                    {quarters.map((q) => {
                      const isPaid = q.status === 'PAID';
                      return (
                        <View key={q.id} style={styles.quarterItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.quarterName}>{q.name}</Text>
                            <Text style={styles.quarterMeta}>
                              ₹{q.amount.toLocaleString('en-IN')} · Due {q.dueDate}
                            </Text>
                          </View>
                          <View style={styles.quarterActionCol}>
                            <View
                              style={[
                                styles.quarterStatusBadge,
                                isPaid ? styles.qBadgePaid : styles.qBadgePending,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.quarterStatusText,
                                  isPaid ? styles.qTextPaid : styles.qTextPending,
                                ]}
                              >
                                {q.status}
                              </Text>
                            </View>
                            {!isPaid && (
                              <Pressable
                                onPress={() => handlePayQuarter(q.id)}
                                disabled={paying === q.id}
                                style={styles.payBtn}
                              >
                                {paying === q.id ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <Text style={styles.payBtnText}>Pay Now</Text>
                                )}
                              </Pressable>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* ANNUAL FEE COMPONENT DIVISION */}
                <View style={styles.breakdownCard}>
                  <View style={styles.breakdownHeaderPill}>
                    <View style={styles.dollarBadge}>
                      <DollarSign size={12} color="#4F46E5" />
                    </View>
                    <Text style={styles.breakdownHeaderTitle}>
                      ANNUAL FEE COMPONENT DIVISION
                    </Text>
                  </View>

                  <View style={styles.tableHeader}>
                    <Text style={styles.thLeft}>FEE COMPONENT</Text>
                    <Text style={styles.thRight}>AMOUNT (₹)</Text>
                  </View>

                  {/* Components breakdown if exists */}
                  {hasStructure && breakdown.length > 0 ? (
                    breakdown.map((item, idx) => (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tdLeft}>{item.category}</Text>
                        <Text style={styles.tdRight}>₹{item.amount.toLocaleString('en-IN')}</Text>
                      </View>
                    ))
                  ) : null}

                  {/* Total Breakup row */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={styles.totalRowLabel}>Total Fee Breakup</Text>
                    <Text style={styles.totalRowValue}>
                      ₹{totalFees.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  // 1. Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentPortalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#EEF2FF',
  },
  portalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
  },
  parentPortalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  watermarkRupee: {
    fontSize: 40,
    fontWeight: '300',
    color: '#C7D2FE',
    marginTop: -8,
  },

  // Ward Switcher
  wardSwitcherRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexWrap: 'wrap',
  },
  wardSwitcherLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  wardPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wardPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wardPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  wardPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  wardPillTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  // 2. Top Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  statRupeeSymbol: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statFootnote: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },

  // 3. Ward Card
  wardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  wardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  wardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  wardMeta: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  wardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  paidBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },

  wardCardBody: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    gap: 16,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },

  // 3 Mini Stat Cards inside ward
  miniStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniStatBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  miniStatLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Schedule Header
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  scheduleTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleSubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
  },

  // Quarters
  quartersContainer: {
    gap: 10,
  },
  quarterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quarterName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  quarterMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quarterActionCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  quarterStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  qBadgePaid: {
    backgroundColor: '#ECFDF5',
  },
  qBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  quarterStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  qTextPaid: {
    color: '#059669',
  },
  qTextPending: {
    color: '#D97706',
  },
  payBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // ANNUAL FEE COMPONENT DIVISION Card
  breakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 6,
  },
  breakdownHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dollarBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  thLeft: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  thRight: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tdLeft: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  tdRight: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalRow: {
    borderBottomWidth: 0,
    backgroundColor: '#FFFFFF',
  },
  totalRowLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalRowValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },
});
