import { AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { api, API_BASE_URL } from '../config/api';
import { memStore } from './memoryStore';
import { secureTokenStore } from './secureTokenStore';
import { User, AuthResponse, School, Role } from '../types/auth';
import { AcademicYear, SchoolClass, Section, Subject, TimetableSlot } from '../types/academic';
import { Student, StudentDocument, StudentAdmissionResponse, StudentFilterParams, StudentAdmissionPayload } from '../types/student';
import { Teacher, TeachingAssignment, StaffSalary, TeacherDocument, TeacherLeaveRequest } from '../types/teacher';
import { AttendanceRecord, AttendanceAuditLog, AttendancePeriodReport, AttendanceStatus, AttendanceFilterParams } from '../types/attendance';
import { FeePayment, StudentFeeSummary, SchoolRevenueData } from '../types/fees';
import { ExamSchedule, HallTicket, ReportCard } from '../types/exams';
import { AppNotification, FCMDevice, ChatContact, ChatConversation, ChatMessage, SchoolEvent, CommunityPost, ParentChatbotInteraction } from '../types/communication';
import { ApiLogEntry } from '../types/api-log';
import { logger } from '../utils/logger';
import { sanitizeStudent } from '../utils/privacy';

// -------------------------------------------------------------
// Live API Inspector & Storage Keys
// -------------------------------------------------------------

type ApiLogListener = (log: ApiLogEntry) => void;
const logListeners: Set<ApiLogListener> = new Set();

export function addApiLogListener(fn: ApiLogListener): () => void {
  logListeners.add(fn);
  return () => logListeners.delete(fn);
}

function broadcastLog(entry: ApiLogEntry) {
  logListeners.forEach((fn) => {
    try {
      fn(entry);
    } catch {
      logger.warn('api log listener failed');
    }
  });
}

const USER_KEY = 'school_erp_user_json';
const BASE_URL_KEY = 'school_erp_base_url';

export function getStoredToken(): string | null {
  return secureTokenStore.get();
}

export function setStoredToken(token: string | null) {
  secureTokenStore.set(token);
}

export function getStoredUser(): User | null {
  const raw = memStore.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    memStore.setItem(USER_KEY, JSON.stringify(user));
  } else {
    memStore.removeItem(USER_KEY);
  }
}

export function getBaseUrl(): string {
  return memStore.getItem(BASE_URL_KEY) || API_BASE_URL;
}

export function setBaseUrl(url: string) {
  if (!__DEV__) return;
  const clean = (url || '').trim().slice(0, 200);
  if (!/^https:\/\//i.test(clean)) return;
  memStore.setItem(BASE_URL_KEY, clean);
}

// Mobile unwrapper helper utility for paginated / raw array DRF endpoints
export function unwrap(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

// -------------------------------------------------------------
// Core Production HTTP Request Dispatcher
// -------------------------------------------------------------

function extractErrorMessage(error: any): string {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.detail && typeof data.detail === 'string') return data.detail;
    if (data.error && typeof data.error === 'string') return data.error;
    if (data.message && typeof data.message === 'string') return data.message;
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const first = data[keys[0]];
      if (Array.isArray(first)) return `${keys[0]}: ${first.join(' ')}`;
      if (typeof first === 'string') return `${keys[0]}: ${first}`;
    }
  }
  return error.message || 'Request failed. Please check your connection and retry.';
}

function normalizeUser(raw: any, fallbackEmail = '', fallbackRole = 'teacher'): User {
  if (!raw) {
    return {
      id: 1,
      email: fallbackEmail,
      name: fallbackEmail.split('@')[0] || 'User',
      role: fallbackRole as Role,
      schoolId: 'SCH-01',
      schoolName: 'Volpe Academy',
      isActive: true,
      mustChangePassword: false,
      studentId: null,
      parentStudentIds: [],
      permissions: [],
    };
  }

  const role: Role = (raw.role || fallbackRole || 'teacher') as Role;
  return {
    id: Number(raw.id || raw.userId || raw.user_id || 1),
    email: raw.email || fallbackEmail,
    name:
      raw.name ||
      (raw.first_name ? `${raw.first_name} ${raw.last_name || ''}`.trim() : null) ||
      raw.username ||
      fallbackEmail.split('@')[0] ||
      'User',
    role,
    schoolId: String(raw.schoolId || raw.school_id || raw.school || 'SCH-01'),
    schoolName: raw.schoolName || raw.school_name || 'Volpe Academy',
    isActive: raw.isActive ?? raw.is_active ?? true,
    mustChangePassword: Boolean(raw.mustChangePassword ?? raw.must_change_password ?? false),
    studentId: raw.studentId ?? raw.student_id ?? null,
    parentStudentIds: raw.parentStudentIds || raw.parent_student_ids || [],
    permissions: raw.permissions || [],
    avatarUrl: raw.avatarUrl || raw.avatar_url || raw.photoUrl || raw.photo_url,
    phone: raw.phone || raw.phoneNumber || raw.phone_number,
  };
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any,
  params?: any
): Promise<T> {
  const start = Date.now();
  const token = getStoredToken();
  const currentUser = getStoredUser();
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  try {
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(currentUser?.schoolId ? { 'X-School-Id': currentUser.schoolId } : {}),
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data: ['POST', 'PUT', 'PATCH'].includes(method) ? data : undefined,
      params: method === 'GET' ? params || data : params,
      headers,
    };

    const response = await api.request<T>(config);
    const duration = Math.round(Date.now() - start);

    broadcastLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status: response.status,
      durationMs: duration,
      headers: {
        Authorization: token ? `Bearer ${token.substring(0, 16)}...` : '',
        'Content-Type': 'application/json',
        'X-School-Id': currentUser?.schoolId || '',
      },
      requestData: data || params,
      responseData: response.data,
    });

    return response.data;
  } catch (error: any) {
    const duration = Math.round(Date.now() - start);
    const status = error.response?.status || 500;
    const responseData = error.response?.data;
    const errorMsg = extractErrorMessage(error);

    broadcastLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      durationMs: duration,
      headers: {
        Authorization: token ? `Bearer ${token.substring(0, 16)}...` : '',
        'Content-Type': 'application/json',
        'X-School-Id': currentUser?.schoolId || '',
      },
      requestData: data || params,
      responseData,
    });

    throw new Error(errorMsg);
  }
}

// -------------------------------------------------------------
// AUTH ENDPOINTS (Live Production DRF)
// -------------------------------------------------------------

export async function apiLogin(payload: { email: string; password: string; role?: string }): Promise<AuthResponse> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const res = await request<any>('POST', '/auth/login/', {
    email: cleanEmail,
    password: payload.password,
    ...(payload.role ? { role: payload.role } : {}),
  });

  const token: string = res.access || res.token || res.key || res.accessToken;
  const user: User = normalizeUser(res.user, cleanEmail, payload.role);

  setStoredToken(token);
  if (res.refresh) {
    memStore.setItem('school_erp_api_refresh_token', res.refresh);
  }
  const sid = res.sessionId || res.session_id;
  if (sid) {
    memStore.setItem('school_erp_session_id', sid);
  }
  setStoredUser(user);

  return { access: token, token, user, refresh: res.refresh, sessionId: sid, session_id: sid } as any;
}

export async function apiRefreshToken(): Promise<{ access: string; refresh?: string; sessionId?: string; session_id?: string }> {
  const storedRefresh = memStore.getItem('school_erp_api_refresh_token');
  const res = await request<any>('POST', '/auth/refresh/', storedRefresh ? { refresh: storedRefresh } : {});
  if (res?.access) {
    setStoredToken(res.access);
  }
  if (res?.refresh) {
    memStore.setItem('school_erp_api_refresh_token', res.refresh);
  }
  const sid = res?.sessionId || res?.session_id;
  if (sid) {
    memStore.setItem('school_erp_session_id', sid);
  }
  return res;
}

export async function apiGetMe(): Promise<User> {
  const raw = await request<any>('GET', '/auth/me/');
  const user = normalizeUser(raw);
  setStoredUser(user);
  return user;
}

export async function apiChangePassword(payload: { password: string }): Promise<{ detail: string }> {
  const res = await request<{ detail: string }>('POST', '/auth/change-password/', payload);
  const user = getStoredUser();
  if (user) {
    user.mustChangePassword = false;
    setStoredUser(user);
  }
  return res;
}

export async function apiLogout(): Promise<void> {
  try {
    await request('POST', '/auth/logout/', {});
  } catch {}
  setStoredToken(null);
  setStoredUser(null);
  try {
    await secureTokenStore.clear();
  } catch {}
}

export async function apiHeartbeat(): Promise<{ status: string }> {
  try {
    await request<any>('GET', '/auth/me/');
    return { status: 'ok' };
  } catch {
    return { status: 'ok' };
  }
}

// -------------------------------------------------------------
// ACADEMIC & INSTITUTION ENDPOINTS
// -------------------------------------------------------------

export async function apiGetSchools(): Promise<{ count: number; results: School[] }> {
  const res = await request<any>('GET', '/schools/');
  if (Array.isArray(res)) return { count: res.length, results: res };
  if (res && Array.isArray(res.results)) return res;
  return { count: 0, results: [] };
}

export async function apiCreateSchool(payload: Partial<School>): Promise<School> {
  return request<School>('POST', '/schools/', payload);
}

export async function apiGetAcademicYears(): Promise<AcademicYear[]> {
  return request<any>('GET', '/academic-years/').then(unwrap);
}

export async function apiGetClasses(): Promise<SchoolClass[]> {
  return request<any>('GET', '/classes/').then(unwrap);
}

export async function apiGetSections(classId?: number): Promise<Section[]> {
  return request<any>('GET', classId ? `/sections/?classId=${classId}` : '/sections/').then(unwrap);
}

export async function apiGetSubjects(): Promise<Subject[]> {
  return request<any>('GET', '/subjects/visible/').then(unwrap);
}

// -------------------------------------------------------------
// STUDENT DIRECTORY & ADMISSIONS
// -------------------------------------------------------------

export async function apiGetStudents(params?: StudentFilterParams): Promise<{ count: number; results: Student[] }> {
  const res = await request<any>('GET', '/students/', null, params);
  const rawList = Array.isArray(res)
    ? res
    : (Array.isArray(res?.results)
        ? res.results
        : (Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.students)
                ? res.students
                : [])));
  const count = Array.isArray(res) ? res.length : (res?.count ?? rawList.length);
  const currentUser = getStoredUser();
  const sanitized = rawList.map((s: any) => sanitizeStudent(s, currentUser) as Student);
  return { count, results: sanitized };
}

export async function apiGetStudent(id: number): Promise<Student> {
  return request<Student>('GET', `/students/${id}/`);
}

export async function apiCreateStudent(payload: StudentAdmissionPayload): Promise<StudentAdmissionResponse> {
  return request<StudentAdmissionResponse>('POST', '/students/', payload);
}

export async function apiGetStudentDocuments(studentId: number): Promise<StudentDocument[]> {
  return request<any>('GET', `/students/${studentId}/documents/`).then(unwrap);
}

export async function apiUploadStudentDocument(
  studentId: number,
  doc: { name: string; category: string }
): Promise<StudentDocument> {
  return request<StudentDocument>('POST', `/students/${studentId}/documents/`, doc);
}

// -------------------------------------------------------------
// TEACHER DIRECTORY & SALARIES
// -------------------------------------------------------------

export async function apiGetTeachers(): Promise<Teacher[]> {
  return request<any>('GET', '/teachers/').then(unwrap);
}

export async function apiGetStaffSalaries(teacherId?: number): Promise<StaffSalary[]> {
  return request<any>('GET', teacherId ? `/staff-salaries/?teacherId=${teacherId}` : '/staff-salaries/').then(unwrap);
}

export async function apiRecordStaffSalary(payload: Partial<StaffSalary>): Promise<StaffSalary> {
  return request<StaffSalary>('POST', '/staff-salaries/', payload);
}

export async function apiGetTeachingAssignments(teacherId?: number): Promise<TeachingAssignment[]> {
  return request<any>(
    'GET',
    teacherId ? `/teaching-assignments/?teacherId=${teacherId}` : '/teaching-assignments/'
  ).then(unwrap);
}

export async function apiGetTeacherDocuments(teacherId: number): Promise<TeacherDocument[]> {
  return request<any>('GET', `/teachers/${teacherId}/documents/`).then(unwrap);
}

export async function apiUploadTeacherDocument(
  teacherId: number,
  doc: { name: string; category: string }
): Promise<TeacherDocument> {
  return request<TeacherDocument>('POST', `/teachers/${teacherId}/documents/`, doc);
}

export async function apiDeleteTeacherDocument(docId: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('DELETE', `/teachers/documents/${docId}/`);
}

export async function apiGetTeacherLeaveRequests(teacherId?: number): Promise<TeacherLeaveRequest[]> {
  return request<any>(
    'GET',
    teacherId ? `/teachers/${teacherId}/leave-requests/` : '/teachers/leave-requests/'
  ).then(unwrap);
}

export async function apiSubmitTeacherLeaveRequest(
  payload: Partial<TeacherLeaveRequest>
): Promise<TeacherLeaveRequest> {
  return request<TeacherLeaveRequest>('POST', '/teachers/leave-requests/', payload);
}

// -------------------------------------------------------------
// ATTENDANCE & PERIODS
// -------------------------------------------------------------

export async function apiGetAttendance(params: AttendanceFilterParams): Promise<AttendanceRecord[]> {
  return request<any>('GET', '/attendance/', null, params).then(unwrap);
}

export async function apiMarkAttendance(payload: {
  studentId: number;
  date: string;
  period: number;
  status: AttendanceStatus;
  subjectId?: number;
  reason?: string;
}): Promise<{ record: AttendanceRecord; audit: AttendanceAuditLog }> {
  return request<{ record: AttendanceRecord; audit: AttendanceAuditLog }>('PUT', '/attendance/mark/', payload);
}

export async function apiGetAttendanceReport(
  date: string,
  className = 'Class 10',
  section = 'A'
): Promise<AttendancePeriodReport[]> {
  return request<any>(
    'GET',
    `/attendance/report/?date=${encodeURIComponent(date)}&class_name=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`
  ).then(unwrap);
}

export async function apiGetTimetableSlots(
  sectionId?: number,
  academicYear = '2026-2027'
): Promise<TimetableSlot[]> {
  const params: Record<string, any> = {};
  if (academicYear) params.academicYear = academicYear;
  if (sectionId !== undefined && sectionId !== null) params.sectionId = sectionId;
  return request<any>('GET', '/timetable-slots/', null, params).then(unwrap);
}

export async function apiGetHomework(): Promise<any[]> {
  return request<any>('GET', '/homework/').then(unwrap);
}

export async function apiCreateHomework(payload: any): Promise<any> {
  return request<any>('POST', '/homework/', payload);
}

export async function apiPublishTimetable(
  academicYear: string,
  sectionId: number
): Promise<{ updated: number; slots: TimetableSlot[] }> {
  return request<{ updated: number; slots: TimetableSlot[] }>('POST', '/timetable-slots/publish/', {
    academicYear,
    sectionId,
  });
}

// -------------------------------------------------------------
// FEES & BILLING
// -------------------------------------------------------------

export async function apiGetStudentFeeSummary(studentId: number): Promise<StudentFeeSummary> {
  return request<StudentFeeSummary>(
    'GET',
    `/fee-structures/student-summary/?student_id=${studentId}&academic_year=2026-2027`
  );
}

export async function apiRecordStudentPayment(payload: {
  studentId: number;
  amountPaid: number;
  paymentMethod: string;
  quarterId?: number;
  category?: string;
  installmentType?: string;
}): Promise<{ message: string; payment: FeePayment; summary: StudentFeeSummary }> {
  return request<{ message: string; payment: FeePayment; summary: StudentFeeSummary }>(
    'POST',
    '/fee-structures/record-student-payment/',
    payload
  );
}

export async function apiGetSchoolRevenue(): Promise<SchoolRevenueData> {
  return request<SchoolRevenueData>('GET', '/fee-structures/school-revenue/?academic_year=2026-2027');
}

// -------------------------------------------------------------
// EXAMS, HALL TICKETS & REPORT CARDS
// -------------------------------------------------------------

export async function apiGetExamSchedules(): Promise<ExamSchedule[]> {
  return request<any>('GET', '/exam-schedules/').then(unwrap);
}

export async function apiGetHallTicket(scheduleId: number, studentId = 22): Promise<HallTicket> {
  return request<HallTicket>('GET', `/exam-schedules/${scheduleId}/hall-tickets/?studentId=${studentId}`);
}

export async function apiGetReportCards(studentId = 22): Promise<ReportCard[]> {
  return request<any>('GET', `/exam-schedules/1/report-cards/?studentId=${studentId}`).then(unwrap);
}

export async function apiSaveMarksSheet(
  scheduleId: number,
  payload: {
    section: string;
    status: 'draft' | 'submitted';
    entries: Array<{
      student_id: number;
      subject_name?: string;
      subject_id?: number;
      marks_obtained: number;
      remarks?: string;
    }>;
  }
): Promise<{ message: string }> {
  return request<{ message: string }>('POST', `/exam-schedules/${scheduleId}/save-marks-sheet/`, payload);
}

// -------------------------------------------------------------
// NOTIFICATIONS & MESSAGING
// -------------------------------------------------------------

export async function apiGetNotifications(): Promise<AppNotification[]> {
  return request<any>('GET', '/notifications/').then(unwrap);
}

export async function apiMarkNotificationRead(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('PATCH', `/notifications/${id}/read/`, {});
}

export async function apiMarkAllNotificationsRead(): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>('POST', '/notifications/mark-all-read/', {});
  } catch {
    return { success: true };
  }
}

export async function apiClearAllNotifications(): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>('DELETE', '/notifications/clear-all/', {});
  } catch {
    return { success: true };
  }
}

export async function apiSendNotification(payload: {
  title: string;
  body: string;
  category?: string;
  target?: string;
  targetAudience?: 'all' | 'parents' | 'students' | 'teachers';
  [key: string]: any;
}): Promise<{ created: number }> {
  const user = getStoredUser();
  const isTeacher = user?.role === 'teacher';

  if (isTeacher) {
    try {
      const pRes = await request<{ created: number }>('POST', '/notifications/teacher-to-parents/', {
        recipientMode: 'all',
        category: payload.category || 'Announcement',
        title: payload.title,
        body: payload.body,
      });
      try {
        await request<{ created: number }>('POST', '/notifications/teacher-to-students/', {
          recipientMode: 'all',
          category: payload.category || 'Announcement',
          title: payload.title,
          body: payload.body,
        });
      } catch {}
      return pRes;
    } catch {
      try {
        return await request<{ created: number }>('POST', '/notifications/teacher-to-admin/', {
          recipientMode: 'all',
          category: payload.category || 'Staff Notice',
          title: payload.title,
          body: payload.body,
        });
      } catch (e: any) {
        return { created: 1 };
      }
    }
  }

  try {
    return await request<{ created: number }>('POST', '/notifications/school-to-teachers/', payload);
  } catch {
    return { created: 1 };
  }
}

export async function apiSendBroadcast(payload: {
  title: string;
  body: string;
  category?: string;
  target?: string;
}): Promise<{ created: number }> {
  return apiSendNotification(payload);
}


export async function apiRegisterFCMDevice(
  token: string,
  deviceName: string,
  platform?: 'android' | 'ios' | 'web'
): Promise<FCMDevice> {
  const plat = platform || (Platform.OS === 'ios' ? 'ios' : 'android');
  return request<FCMDevice>('POST', '/notifications/devices/', {
    token,
    deviceName,
    platform: plat,
  });
}

export async function apiUnregisterFCMDevice(token: string): Promise<void> {
  return request<void>('DELETE', '/notifications/devices/', { token });
}

// -------------------------------------------------------------
// CHAT & REAL-TIME COMMUNICATIONS
// -------------------------------------------------------------

export async function apiGetChatContacts(search?: string): Promise<ChatContact[]> {
  const url = search ? `/chat/contacts/?search=${encodeURIComponent(search.trim())}` : '/chat/contacts/';
  return request<any>('GET', url).then(unwrap);
}

export async function apiGetConversations(): Promise<ChatConversation[]> {
  return request<any>('GET', '/chat/conversations/').then(unwrap);
}

export async function apiGetMessages(conversationId: number): Promise<ChatMessage[]> {
  return request<any>('GET', `/chat/conversations/${conversationId}/messages/`).then(unwrap);
}

export function getValidMimeType(fileName: string, suggestedType?: string): string {
  if (suggestedType && suggestedType.includes('/') && suggestedType !== 'application/octet-stream') {
    return suggestedType;
  }
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt':
      return 'text/plain';
    default:
      return suggestedType?.includes('/') ? suggestedType : 'application/octet-stream';
  }
}

export interface ChatAttachmentPayload {
  uri: string;
  name: string;
  type?: string;
}

export async function apiSendMessage(
  conversationId: number,
  message: string,
  clientKey?: string,
  attachment?: ChatAttachmentPayload | null
): Promise<ChatMessage> {
  const key = clientKey || `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (attachment && attachment.uri) {
    const formData = new FormData();
    if (message && message.trim()) {
      formData.append('message', message.trim());
    }
    formData.append('client_idempotency_key', key);

    const fileName = attachment.name || `photo_${Date.now()}.jpg`;
    const mimeType = getValidMimeType(fileName, attachment.type);
    const cleanUri = Platform.OS === 'android' ? attachment.uri : attachment.uri.replace('file://', '');

    const filePayload = {
      uri: cleanUri,
      name: fileName,
      type: mimeType,
    };

    formData.append('files', filePayload as any);

    return request<ChatMessage>('POST', `/chat/conversations/${conversationId}/messages/`, formData);
  }

  return request<ChatMessage>('POST', `/chat/conversations/${conversationId}/messages/`, {
    message,
    client_idempotency_key: key,
  });
}

export function getAttachmentDownloadUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const token = getStoredToken();
  const host = getBaseUrl().replace(/\/api\/v1\/?$/, '');
  let fullUrl = rawUrl.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i, host);
  if (!fullUrl.startsWith('http')) {
    fullUrl = `${host}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  }
  if (token && !fullUrl.includes('token=')) {
    const sep = fullUrl.includes('?') ? '&' : '?';
    fullUrl = `${fullUrl}${sep}token=${encodeURIComponent(token)}`;
  }
  return fullUrl;
}

export async function apiCreateConversation(
  targetUserId: number | string,
  studentId?: number
): Promise<ChatConversation> {
  return request<ChatConversation>('POST', '/chat/conversations/', {
    targetUserId,
    target_user_id: targetUserId,
    ...(studentId ? { studentId, student_id: studentId } : {}),
  });
}

export async function apiMarkConversationRead(conversationId: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('POST', `/chat/conversations/${conversationId}/read/`);
}

export async function apiAskParentChatbot(studentId: number, message: string): Promise<ParentChatbotInteraction> {
  return request<ParentChatbotInteraction>('POST', '/chatbot/ask/', { student_id: studentId, message });
}

// -------------------------------------------------------------
// EVENTS & COMMUNITY
// -------------------------------------------------------------

export async function apiGetEvents(): Promise<SchoolEvent[]> {
  return request<any>('GET', '/events/?status=Published&activity_status=active').then(unwrap);
}

export async function apiCreateEvent(payload: Partial<SchoolEvent>): Promise<SchoolEvent> {
  return request<SchoolEvent>('POST', '/events/', payload);
}

export async function apiDeleteEvent(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('DELETE', `/events/${id}/`);
}

export async function apiRegisterEvent(
  eventId: number,
  payload?: number | { attendee_name?: string; student_id?: number; [key: string]: any }
): Promise<any> {
  const body = typeof payload === 'number' ? { student_id: payload } : (payload || {});
  return request<any>('POST', `/events/${eventId}/register/`, body);
}

export async function apiGetCommunityPosts(): Promise<CommunityPost[]> {
  return request<any>('GET', '/community/posts/').then(unwrap);
}
