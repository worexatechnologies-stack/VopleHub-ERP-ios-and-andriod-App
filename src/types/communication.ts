export type NotificationCategory = 'General' | 'Exam' | 'Fee' | 'Attendance' | 'Urgent' | 'Event' | 'Message' | 'Meeting' | 'Academic';
export type RecipientMode = 'all' | 'class' | 'section' | 'subject' | 'individual';

export interface AppNotification {
  id: number;
  schoolId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  channel: 'PUSH' | 'IN_APP' | 'SMS';
  readAt: string | null;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    role: string;
  };
  requiresDecision?: boolean;
  decisionStatus?: 'pending' | 'approved' | 'rejected';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT' | string;
}

export interface FCMDevice {
  token: string;
  deviceName: string;
  lastSyncedAt: string;
  userId: number;
}

export interface ChatContact {
  id: number | string;
  userId: number;
  name: string;
  role: string;
  email: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
  assignedSections?: string[];
  subjects?: string[];
  teachingAssignments?: any[];
  childName?: string;
  avatarUrl?: string;
  isOfficeDesk?: boolean;
  studentSummary?: string;
  studentNames?: string[];
  students?: Array<{
    id: number;
    name: string;
    className: string;
    section: string;
    rollNo: string | number;
    admissionNo: string;
  }>;
}

export interface ChatAttachment {
  id: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  downloadUrl: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  recipientId?: number;
  recipientName?: string;
  body: string;
  messageType?: string;
  createdAt: string;
  isRead: boolean;
  isMe?: boolean;
  readAt?: string | null;
  attachments?: ChatAttachment[];
  localUri?: string;
}

export interface ChatConversation {
  id: number;
  uuid?: string;
  conversationType?: string;
  otherParticipant: {
    id: number;
    name: string;
    role: string;
    email: string;
    isOnline: boolean;
    lastSeenAt?: string | null;
    avatarUrl?: string;
    studentSummary?: string;
    assignedSections?: string[];
    isOfficeDesk?: boolean;
  };
  lastMessage?: {
    id: number;
    body: string;
    createdAt: string;
    isMe?: boolean;
    senderId?: number;
    isRead?: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface ParentChatbotInteraction {
  id: number;
  studentId: number;
  studentName: string;
  message: string;
  response: string;
  timestamp: string;
  tokenUsage?: number;
}

export interface SchoolEvent {
  id: number;
  schoolId: string;
  title: string;
  kind: 'Workshop' | 'Sports' | 'Cultural' | 'Parent-Teacher Meet' | 'Celebration' | 'Academic' | 'School event';
  status: 'Published' | 'Draft';
  activityStatus: 'active' | 'completed' | 'cancelled';
  description: string;
  eventDate: string;
  date?: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  ticketCode?: string;
  isRegistered?: boolean;
  dateTimeFormatted?: string;
  registrationDeadline?: string;
  hasPass?: boolean;
}

export interface CommunityPost {
  id: number;
  schoolId: string;
  authorName: string;
  authorRole: string;
  kind: 'Announcement' | 'Achievement' | 'Gallery';
  title: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  createdAt: string;
}
