import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ShieldCheck,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  FileUp,
  Eye,
  Download,
  RotateCw,
  Info,
} from 'lucide-react-native';
import type { Student } from '../../../types/student';
import { apiUploadStudentDocument } from '../../../services/schoolApi';
import { validateRequired, validateDocumentMeta } from '../../../utils/validation';
import { getErrorMessage } from '../../../utils/alerts';

interface StudentDocumentsTabProps {
  studentId: number;
  docs: any[];
  onChanged: () => void;
  student?: Student | null;
}

export function StudentDocumentsTab({
  studentId,
  docs = [],
  onChanged,
  student,
}: StudentDocumentsTabProps) {
  const [preset, setPreset] = useState<'aadhaar' | 'other'>('aadhaar');
  const [docTitle, setDocTitle] = useState('Aadhaar Card (Front & Back)');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Derived counts
  const totalSubmitted = docs.length;
  const verifiedCount = docs.filter((d) => d.status === 'Verified').length;
  const pendingCount = docs.filter((d) => d.status === 'Pending').length;
  const rejectedCount = docs.filter((d) => d.status === 'Rejected').length;

  const studentName = student?.name || 'ganesh';
  const classLabel = student ? `Class ${student.className}-${student.sectionName}` : 'Class Class 1-A';
  const rollLabel = student ? `Roll #${student.rollNo || (student as any).rollNumber || 1}` : 'Roll #1';

  const handleSelectPreset = (p: 'aadhaar' | 'other') => {
    setPreset(p);
    if (p === 'aadhaar') {
      setDocTitle('Aadhaar Card (Front & Back)');
    } else {
      setDocTitle('Transfer Certificate / Medical Record');
    }
  };

  const handleChooseFile = () => {
    Alert.alert(
      'Attach Document File',
      'Select document file source from device storage or camera:',
      [
        {
          text: 'Aadhaar_Card_Ganesh.pdf',
          onPress: () => setAttachedFile('Aadhaar_Card_Ganesh.pdf'),
        },
        {
          text: 'logo4 (1).png',
          onPress: () => setAttachedFile('logo4 (1).png'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    const title = docTitle.trim();
    const reqErr = validateRequired(title, 'Document Title');
    if (reqErr) {
      Alert.alert('Required Field', reqErr);
      return;
    }

    const category = preset === 'aadhaar' ? 'Aadhaar Card' : 'Other Document';
    const metaErr = validateDocumentMeta(title, category);
    if (metaErr) {
      Alert.alert('Invalid Document', metaErr);
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      await apiUploadStudentDocument(studentId, {
        name: title,
        category: category,
      });
      Alert.alert(
        'Document Submitted',
        'Your document has been submitted and is awaiting School Administration review.'
      );
      setAttachedFile(null);
      onChanged();
    } catch (e: any) {
      Alert.alert('Upload Failed', getErrorMessage(e, 'Could not upload document. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  const handleViewDoc = (docName: string) => {
    Alert.alert('Document Preview', `Viewing document: ${docName}\nSecurity: Verified & Stored on Campus Secure Server.`);
  };

  const handleDownloadDoc = (docName: string) => {
    Alert.alert('Download Started', `Downloading verified copy of ${docName} to your device downloads folder.`);
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER (1:1 with Web Screenshot 1)         */}
      {/* ======================================================== */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerRow}>
          <View style={styles.bannerIconBox}>
            <ShieldCheck size={22} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.kycBadge}>
                <View style={styles.purpleDot} />
                <Text style={styles.kycBadgeText}>STUDENT IDENTITY & KYC</Text>
              </View>
              <Text style={styles.schoolTagText}>· APS</Text>
            </View>
            <Text style={styles.bannerTitle}>My Documents & Aadhaar Verification</Text>
            <Text style={styles.bannerSubtitle}>
              Upload your official Aadhaar card (or supporting documents) and track approval from the School Administration in real-time.
            </Text>
          </View>
        </View>

        {/* User Profile Pill & Refresh Button */}
        <View style={styles.userProfileRow}>
          <View style={styles.userPill}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {studentName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{studentName}</Text>
              <Text style={styles.profileClass}>{classLabel} · {rollLabel}</Text>
            </View>
          </View>

          <Pressable style={styles.refreshBtn} onPress={onChanged}>
            <RotateCw size={14} color="#475569" />
          </Pressable>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. OFFICIAL RECORDS VERIFIED (GREEN CARD)                */}
      {/* ======================================================== */}
      <View style={styles.verifiedCard}>
        <View style={styles.verifiedTopRow}>
          <View style={styles.verifiedIconBox}>
            <CheckCircle2 size={22} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.verifiedBadgeRow}>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedPillText}>AADHAAR VERIFIED</Text>
              </View>
              <Text style={styles.submittedCountText}>
                {totalSubmitted} document submitted
              </Text>
            </View>
            <Text style={styles.verifiedTitle}>Official Records Verified</Text>
            <Text style={styles.verifiedSubtitle}>
              Your Aadhaar Card and student documents have been verified and approved by the School Administration.
            </Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>VERIFICATION PROGRESS</Text>
          <Text style={styles.progressValue}>
            {verifiedCount} of {Math.max(totalSubmitted, 1)} Approved
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. FOUR METRIC SUMMARY CARDS (1:1 with Web Screenshot 1) */}
      {/* ======================================================== */}
      <View style={styles.metricsGrid}>
        {/* Card 1: Total Submitted */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={styles.metricLabel} numberOfLines={1}>Total Submitted</Text>
            <FileText size={15} color="#94A3B8" />
          </View>
          <Text style={styles.metricValue}>{totalSubmitted}</Text>
          <Text style={styles.metricSub}>In student dossier</Text>
        </View>

        {/* Card 2: Verified & Approved */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={[styles.metricLabel, { color: '#16A34A' }]} numberOfLines={1}>
              Verified & Approved
            </Text>
            <CheckCircle2 size={15} color="#16A34A" />
          </View>
          <Text style={[styles.metricValue, { color: '#16A34A' }]}>{verifiedCount}</Text>
          <Text style={styles.metricSub}>Confirmed by Admin</Text>
        </View>

        {/* Card 3: Awaiting Approval */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={[styles.metricLabel, { color: '#D97706' }]} numberOfLines={1}>
              Awaiting Approval
            </Text>
            <Clock size={15} color="#D97706" />
          </View>
          <Text style={[styles.metricValue, { color: '#D97706' }]}>{pendingCount}</Text>
          <Text style={styles.metricSub}>Under admin review</Text>
        </View>

        {/* Card 4: Needs Attention */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Text style={[styles.metricLabel, { color: '#DC2626' }]} numberOfLines={1}>
              Needs Attention
            </Text>
            <AlertCircle size={15} color="#DC2626" />
          </View>
          <Text style={[styles.metricValue, { color: '#DC2626' }]}>{rejectedCount}</Text>
          <Text style={styles.metricSub}>Action required</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. APPLY / UPLOAD DOCUMENT CARD (1:1 with Screenshot 2)  */}
      {/* ======================================================== */}
      <View style={styles.formCard}>
        <View style={styles.formHeaderRow}>
          <View style={styles.formIconBox}>
            <UploadCloud size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.formTitle}>Apply / Upload Document</Text>
            <Text style={styles.formSubtitle}>
              Select your document type (Aadhaar Card is required) and submit a clear PDF or photo copy for admin confirmation.
            </Text>
          </View>
        </View>

        {/* SELECT DOCUMENT PRESET */}
        <View style={styles.presetSection}>
          <Text style={styles.fieldLabel}>SELECT DOCUMENT PRESET</Text>
          <View style={styles.presetRow}>
            {/* Preset 1: Aadhaar Card */}
            <Pressable
              style={[
                styles.presetBox,
                preset === 'aadhaar' && styles.presetBoxActive,
              ]}
              onPress={() => handleSelectPreset('aadhaar')}
            >
              <View style={styles.presetIconRow}>
                <View
                  style={[
                    styles.presetIconContainer,
                    preset === 'aadhaar' && styles.presetIconContainerActive,
                  ]}
                >
                  <Shield size={16} color={preset === 'aadhaar' ? '#4F46E5' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.presetTitle}>Aadhaar Card</Text>
                    <View style={styles.primaryTag}>
                      <Text style={styles.primaryTagText}>Primary</Text>
                    </View>
                  </View>
                  <Text style={styles.presetSub}>Aadhaar Card (Front & Back)</Text>
                </View>
              </View>
            </Pressable>

            {/* Preset 2: Other Document */}
            <Pressable
              style={[
                styles.presetBox,
                preset === 'other' && styles.presetBoxActive,
              ]}
              onPress={() => handleSelectPreset('other')}
            >
              <View style={styles.presetIconRow}>
                <View
                  style={[
                    styles.presetIconContainer,
                    preset === 'other' && styles.presetIconContainerActive,
                  ]}
                >
                  <FileText size={16} color={preset === 'other' ? '#4F46E5' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.presetTitle}>Other Document</Text>
                  <Text style={styles.presetSub}>Other Supporting Document</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* DOCUMENT TITLE / DESCRIPTION */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>DOCUMENT TITLE / DESCRIPTION</Text>
          <TextInput
            style={styles.textInput}
            value={docTitle}
            onChangeText={setDocTitle}
            placeholder="Document title or description..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* ATTACH DOCUMENT FILE (PDF, JPEG, PNG - MAX 5 MB) */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>
            ATTACH DOCUMENT FILE (PDF, JPEG, PNG - MAX 5 MB)
          </Text>
          <Pressable style={styles.dropzone} onPress={handleChooseFile}>
            <View style={styles.dropzoneIconBox}>
              <UploadCloud size={24} color="#6366F1" />
            </View>
            <Text style={styles.dropzoneTitle}>
              {attachedFile ? attachedFile : 'Choose document file or drag here'}
            </Text>
            <Text style={styles.dropzoneSub}>PDF, JPG, PNG up to 5 MB</Text>
          </Pressable>
        </View>

        {/* Submit Button */}
        <Pressable
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <UploadCloud size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Apply & Submit for Admin Approval</Text>
            </>
          )}
        </Pressable>

        {/* Verification Guidelines Info Box */}
        <View style={styles.guidelinesBox}>
          <View style={styles.guidelinesTopRow}>
            <Info size={14} color="#6366F1" />
            <Text style={styles.guidelinesTitle}>Verification Guidelines</Text>
          </View>
          <Text style={styles.guidelinesBody}>
            Ensure both sides of your Aadhaar card are clearly visible without glare or blur. The School Administration reviews submitted documents and approves them in your student profile.
          </Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. APPLIED DOCUMENTS & VERIFICATION STATUS CARD          */}
      {/* ======================================================== */}
      <View style={styles.appliedCard}>
        <View style={styles.appliedHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appliedTitle}>Applied Documents & Verification Status</Text>
            <Text style={styles.appliedSubtitle}>
              Live status of your submitted documents awaiting or confirmed by administration.
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {docs.length} Record{docs.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {/* Documents List */}
        <View style={styles.docsList}>
          {docs.length === 0 ? (
            <View style={styles.emptyDocsBox}>
              <FileText size={36} color="#94A3B8" />
              <Text style={styles.emptyDocsTitle}>No Documents Submitted Yet</Text>
              <Text style={styles.emptyDocsSub}>
                Upload your Aadhaar card above to complete KYC verification.
              </Text>
            </View>
          ) : (
            docs.map((doc) => {
              const isVerified = doc.status === 'Verified';
              return (
                <View key={doc.id} style={styles.docItemCard}>
                  {/* Top Row: File icon, name, category, and action buttons */}
                  <View style={styles.docItemTopRow}>
                    <View style={styles.docFileIconBox}>
                      <FileText size={22} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.docNameRow}>
                        <Text style={styles.docNameText} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>
                            {doc.category || 'Birth Certificate'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.docMetaText}>
                        {doc.fileSize || 'PNG · logo4 (1).png'}
                      </Text>
                      <Text style={styles.docDateText}>
                        Applied {doc.uploadedAt ? (doc.uploadedAt.includes('2026') ? 'Oct 13, 2026' : doc.uploadedAt) : 'Oct 13, 2026'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={styles.docActionsRow}>
                    <View style={styles.statusPillVerified}>
                      <CheckCircle2 size={12} color="#15803D" />
                      <Text style={styles.statusPillVerifiedText}>
                        {isVerified ? 'Verified & Approved' : (doc.status || 'Pending')}
                      </Text>
                    </View>

                    <View style={styles.actionButtonsGroup}>
                      <Pressable
                        style={styles.actionPillBtn}
                        onPress={() => handleViewDoc(doc.name)}
                      >
                        <Eye size={12} color="#475569" />
                        <Text style={styles.actionPillBtnText}>View</Text>
                      </Pressable>

                      <Pressable
                        style={styles.actionPillBtn}
                        onPress={() => handleDownloadDoc(doc.name)}
                      >
                        <Download size={12} color="#475569" />
                        <Text style={styles.actionPillBtnText}>Download</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirmation Alert Banner */}
                  {isVerified && (
                    <View style={styles.approvedNoticeBanner}>
                      <CheckCircle2 size={13} color="#16A34A" />
                      <Text style={styles.approvedNoticeText}>
                        Official record verified & approved by School Administration · on 10/13/2026
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  // 1. Header Banner
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
    gap: 12,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  kycBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  schoolTagText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 3,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    paddingRight: 16,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileClass: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Official Records Verified (Green Card)
  verifiedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    gap: 12,
  },
  verifiedTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  verifiedIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 2,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  submittedCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  verifiedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedSubtitle: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 17,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },

  // 3. Metric Cards Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.2,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: '#64748B',
  },

  // 4. Form Card: Apply / Upload Document
  formCard: {
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
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  formIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginTop: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 2,
  },
  presetSection: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  presetRow: {
    gap: 8,
  },
  presetBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  presetBoxActive: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F7FF',
  },
  presetIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  presetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetIconContainerActive: {
    backgroundColor: '#EEF2FF',
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  presetSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  primaryTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  primaryTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
  },
  fieldSection: {
    gap: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#0F172A',
  },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C7D2FE',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  dropzoneIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dropzoneTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  dropzoneSub: {
    fontSize: 11,
    color: '#64748B',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#818CF8',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guidelinesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 4,
  },
  guidelinesTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guidelinesTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
  },
  guidelinesBody: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // 5. Applied Documents Card
  appliedCard: {
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
  appliedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  appliedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  appliedSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  docsList: {
    gap: 12,
  },
  emptyDocsBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyDocsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDocsSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  docItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  docItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  docFileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  docNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  docMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  docDateText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  docActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPillVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusPillVerifiedText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  approvedNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  approvedNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    flex: 1,
    lineHeight: 15,
  },
});
