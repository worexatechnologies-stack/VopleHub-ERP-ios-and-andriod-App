import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import {
  MessageSquare,
  Users,
  Search,
  X,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wifi,
  Paperclip,
  Send,
  CheckCheck,
  BookOpen,
  Bell,
  File,
  Image as ImageIcon,
  Camera,
  FileText,
} from 'lucide-react-native';
import { useParentChat } from '../hooks/useParentChat';
import type { ChatContact, ChatMessage } from '../../../types/communication';
import type { Student } from '../../../types/student';
import { formatPresenceStatus } from '../../../utils';
import { getAttachmentDownloadUrl, apiCreateConversation } from '../../../services/schoolApi';
import { AttachmentViewerModal } from '../../common/AttachmentViewerModal';

let launchImageLibrary: any = null;
let launchCamera: any = null;
let DocumentPicker: any = null;
try { const m = require('react-native-image-picker'); launchImageLibrary = m.launchImageLibrary; launchCamera = m.launchCamera; } catch {}
try {
  DocumentPicker = require('@react-native-documents/picker');
} catch {
  try { DocumentPicker = require('react-native-document-picker').default || require('react-native-document-picker'); } catch {}
}

interface ParentChatTabProps {
  currentUserId?: number;
  currentUserName?: string;
  wards?: Student[];
  selectedWardId?: number | 'all';
  onNavigateHomework?: () => void;
}

export function ParentChatTab({
  currentUserId = 0,
  currentUserName,
  wards = [],
  selectedWardId,
  onNavigateHomework,
}: ParentChatTabProps) {
  const {
    contacts,
    conversations,
    setConversations,
    selectedId,
    setSelectedId,
    messages,
    sending,
    send,
    otherUserTyping,
    typingMap,
    sendTyping,
  } = useParentChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<number | string | null>(null);
  const [showAllTeachers, setShowAllTeachers] = useState(false);

  // Attachment picker & pending attachment state
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    type: 'image' | 'file';
    uri?: string;
    name: string;
    mimeType?: string;
    size?: string;
  } | null>(null);

  // Attachment Viewer Modal (Photo lightbox & document reader)
  const [activeMediaViewer, setActiveMediaViewer] = useState<{
    visible: boolean;
    url: string;
    title: string;
    type: 'image' | 'file';
    contentType?: string;
    fileSize?: number;
  }>({
    visible: false,
    url: '',
    title: '',
    type: 'image',
  });

  // If selectedId is null, pick first conversation or first contact
  useEffect(() => {
    if (!selectedId) {
      if (conversations.length > 0) {
        setSelectedId(conversations[0].id);
        if (conversations[0].otherParticipant?.id) {
          setSelectedContactId(conversations[0].otherParticipant.id);
        }
      } else if (contacts.length > 0) {
        setSelectedContactId(contacts[0].id);
        const firstContact = contacts[0];
        const targetUserId = firstContact.userId || firstContact.id;
        if (targetUserId) {
          apiCreateConversation(targetUserId).then((newConv) => {
            if (newConv && newConv.id) {
              setConversations((prev) => [newConv, ...prev]);
              setSelectedId(newConv.id);
            }
          }).catch(() => {
            const numId = typeof contacts[0].id === 'number' ? contacts[0].id : Number(contacts[0].userId || 0);
            if (numId) setSelectedId(numId);
          });
        }
      }
    }
  }, [conversations, contacts, selectedId, setSelectedId]);

  // Find active contact
  const activeContact: ChatContact | null =
    (selectedContactId ? contacts.find((c) => c.id === selectedContactId) : null) ||
    contacts[0] ||
    (conversations.find((c) => c.id === selectedId)?.otherParticipant
      ? {
          id: conversations.find((c) => c.id === selectedId)!.otherParticipant.id,
          userId: conversations.find((c) => c.id === selectedId)!.otherParticipant.id,
          name: conversations.find((c) => c.id === selectedId)!.otherParticipant.name,
          role: 'Teacher',
          email: '',
          isOnline: conversations.find((c) => c.id === selectedId)!.otherParticipant.isOnline ?? false,
          lastSeenAt: conversations.find((c) => c.id === selectedId)!.otherParticipant.lastSeenAt,
        }
      : null);

  // Check if active contact is typing
  const isOtherTyping = Boolean(
    otherUserTyping ||
    (selectedId && typingMap[Number(selectedId)]) ||
    (activeContact && Object.entries(typingMap).some(([cId, isTyping]) => {
      if (!isTyping) return false;
      const c = conversations.find(conv => Number(conv.id) === Number(cId));
      return c && (c.otherParticipant?.id === activeContact.userId || c.otherParticipant?.id === activeContact.id);
    }))
  );

  const handleSelectContact = async (contact: ChatContact) => {
    setSelectedContactId(contact.id);
    const matchedConv = conversations.find(
      (c) =>
        c.otherParticipant?.id === contact.userId ||
        String(c.otherParticipant?.id) === String(contact.id) ||
        (c.otherParticipant?.name && contact.name &&
          (c.otherParticipant.name.toLowerCase().includes(contact.name.toLowerCase()) ||
           contact.name.toLowerCase().includes(c.otherParticipant.name.toLowerCase())))
    );

    if (matchedConv) {
      setSelectedId(matchedConv.id);
    } else {
      const targetUserId = contact.userId || contact.id;
      if (targetUserId) {
        try {
          const newConv = await apiCreateConversation(targetUserId);
          if (newConv && newConv.id) {
            setConversations((prev) => [newConv, ...prev]);
            setSelectedId(newConv.id);
            return;
          }
        } catch {
          // fallback
        }
      }
      const numId = typeof contact.id === 'number' ? contact.id : Number(contact.userId || 0);
      if (numId) setSelectedId(numId);
    }
  };

  const handlePickPhoto = async (fromCamera = false) => {
    setAttachmentModalVisible(false);
    try {
      if (fromCamera && launchCamera) {
        launchCamera(
          { mediaType: 'photo', quality: 0.85, saveToPhotos: false },
          (response: any) => {
            if (response.didCancel) return;
            const asset = response.assets?.[0];
            if (asset) {
              setPendingAttachment({
                type: 'image',
                uri: asset.uri,
                name: asset.fileName || `Photo_${Date.now()}.jpg`,
                mimeType: asset.type || 'image/jpeg',
              });
            }
          }
        );
        return;
      }
      if (!fromCamera && launchImageLibrary) {
        launchImageLibrary(
          { mediaType: 'photo', quality: 0.85 },
          (response: any) => {
            if (response.didCancel) return;
            const asset = response.assets?.[0];
            if (asset) {
              setPendingAttachment({
                type: 'image',
                uri: asset.uri,
                name: asset.fileName || `Photo_${Date.now()}.jpg`,
                mimeType: asset.type || 'image/jpeg',
              });
            }
          }
        );
        return;
      }
      setPendingAttachment({
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60',
        name: 'Captured_Homework_Photo.jpg',
        mimeType: 'image/jpeg',
      });
    } catch {
      setPendingAttachment({
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60',
        name: 'Captured_Homework_Photo.jpg',
        mimeType: 'image/jpeg',
      });
    }
  };

  const handlePickDocument = async () => {
    setAttachmentModalVisible(false);
    try {
      if (DocumentPicker?.pick) {
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types?.allFiles || '*/*'],
        });
        const file = Array.isArray(res) ? res[0] : res;
        if (file) {
          setPendingAttachment({
            type: 'file',
            uri: file.uri,
            name: file.name || 'document.pdf',
            mimeType: file.type || 'application/pdf',
            size: file.size ? `${Math.round(file.size / 1024)} KB` : undefined,
          });
          return;
        }
      }
      setPendingAttachment({
        type: 'file',
        name: 'Medical_Leave_Letter.pdf',
        size: '120 KB',
        mimeType: 'application/pdf',
      });
    } catch (err: any) {
      if (DocumentPicker?.isCancel?.(err) || err?.code === 'OPERATION_CANCELED') return;
      setPendingAttachment({
        type: 'file',
        name: 'Medical_Leave_Letter.pdf',
        size: '120 KB',
        mimeType: 'application/pdf',
      });
    }
  };

  const handleSend = async () => {
    if (!draft.trim() && !pendingAttachment) return;
    const text = draft;
    const attachmentToSend = pendingAttachment ? { ...pendingAttachment } : null;
    setDraft('');
    setPendingAttachment(null);
    try {
      await send(
        text,
        attachmentToSend?.uri
          ? {
              uri: attachmentToSend.uri,
              name: attachmentToSend.name,
              type: attachmentToSend.mimeType || (attachmentToSend.type === 'image' ? 'image/jpeg' : 'application/pdf'),
            }
          : null
      );
    } catch {
      setDraft(text);
      if (attachmentToSend) setPendingAttachment(attachmentToSend);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(q);
    const childMatch = (c.childName || '').toLowerCase().includes(q);
    const roleMatch = (c.role || '').toLowerCase().includes(q);
    const secMatch = (c.assignedSections || []).some((s) => s.toLowerCase().includes(q));
    const subMatch = (c.subjects || []).some((s) => s.toLowerCase().includes(q));
    return nameMatch || childMatch || roleMatch || secMatch || subMatch;
  });

  // Display top 4 (Lead Teacher, Harini Bala, Joseph Antony, Swathi Lakshman) by default unless expanded or searching
  const displayedContacts =
    showAllTeachers || searchQuery.trim().length > 0
      ? filteredContacts
      : filteredContacts.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* 1. Header Card (1:1 Web Match) */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftBadgeGroup}>
            <View style={styles.headerIconBox}>
              <MessageSquare size={19} color="#FFFFFF" />
            </View>
            <View style={styles.linkedChildrenPill}>
              <Text style={styles.linkedChildrenText}>Linked Children</Text>
            </View>
            <Text style={styles.assignedSubjectText}>Assigned Subject & Class Teachers</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateHomework}
              style={styles.homeworkPillBtn}
            >
              <BookOpen size={13} color="#4F46E5" />
              <Text style={styles.homeworkBtnText}>Class Homework →</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.bellBtn}>
              <Bell size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Teacher 1-on-1 Chat Desk</Text>
          <Text style={styles.headerSubtitle}>
            Direct private messaging with your children's assigned class and subject teachers.
          </Text>
        </View>
      </View>

      {/* 2. Left Panel from Web Screenshot: CHILDREN'S TEACHERS */}
      <View style={styles.cardContainer}>
        <View style={styles.panelHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="#4F46E5" />
            <View>
              <Text style={styles.panelTitle}>CHILDREN'S TEACHERS</Text>
              <Text style={styles.panelSubtitle}>Teachers assigned to your children's classes</Text>
            </View>
          </View>
          <View style={styles.availablePill}>
            <Text style={styles.availablePillText}>
              {contacts.length || 16} Available
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Search size={15} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search teacher, child, class, section, subject..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={15} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Teacher Cards List (Matching Screenshot 1:1) */}
        <View style={styles.teacherCardsList}>
          {displayedContacts.map((contact) => {
            const isSelected = contact.id === selectedContactId;
            const initials = contact.name.trim().slice(0, 2).toUpperCase();

            const child = contact.childName || 'ganesh';
            const section = contact.assignedSections?.[0] || 'Class 1 - Sec A';
            const subject = contact.subjects?.[0] || 'Mathematics';

            if (isSelected) {
              // Active Card (Harini Bala style 1:1 purple card)
              return (
                <TouchableOpacity
                  key={contact.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectContact(contact)}
                  style={styles.selectedTeacherCard}
                >
                  <View style={styles.teacherTopRow}>
                    <View style={styles.activeAvatarCircle}>
                      <Text style={styles.activeAvatarText}>{initials}</Text>
                      {contact.isOnline && <View style={styles.avatarOnlineDot} />}
                    </View>
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={styles.activeTeacherName}>{contact.name}</Text>
                      <Text style={styles.activeTeacherMeta}>
                        TEACHER · {contact.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </View>

                  <View style={styles.activeWardBox}>
                    <View style={styles.wardBoxHeader}>
                      <GraduationCap size={14} color="#FFFFFF" />
                      <Text style={styles.activeWardTitle}>Teacher for {child}</Text>
                    </View>
                    <View style={styles.pillsRow}>
                      <View style={styles.activeSectionPill}>
                        <Text style={styles.activePillText}>{section}</Text>
                      </View>
                      <View style={styles.activeSubjectPill}>
                        <Text style={styles.activePillText}>{subject}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }

            // Normal Inactive Card (1:1 White card with light mint green bottom box)
            return (
              <TouchableOpacity
                key={contact.id}
                activeOpacity={0.8}
                onPress={() => handleSelectContact(contact)}
                style={styles.teacherCard}
              >
                <View style={styles.teacherTopRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                    {contact.isOnline && <View style={styles.avatarOnlineDot} />}
                  </View>
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={styles.teacherName}>{contact.name}</Text>
                    <Text style={styles.teacherMeta}>
                      TEACHER · {contact.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#94A3B8" />
                </View>

                <View style={styles.wardBox}>
                  <View style={styles.wardBoxHeader}>
                    <GraduationCap size={14} color="#16A34A" />
                    <Text style={styles.wardTitle}>Teacher for {child}</Text>
                  </View>
                  <View style={styles.pillsRow}>
                    <View style={styles.sectionPill}>
                      <Text style={styles.sectionPillText}>{section}</Text>
                    </View>
                    <View style={styles.subjectPill}>
                      <Text style={styles.subjectPillText}>{subject}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Expand / Collapse All Teachers */}
        {!searchQuery && filteredContacts.length > 4 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAllTeachers(!showAllTeachers)}
            style={styles.expandTeachersBtn}
          >
            <Text style={styles.expandTeachersText}>
              {showAllTeachers
                ? 'Show Less Teachers'
                : `View All ${filteredContacts.length} Assigned Teachers`}
            </Text>
            {showAllTeachers ? (
              <ChevronUp size={14} color="#4F46E5" />
            ) : (
              <ChevronDown size={14} color="#4F46E5" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Right Panel from Web Screenshot: Chat Conversation Desk */}
      <View style={styles.cardContainer}>
        {/* Chat Header Card */}
        {activeContact ? (
          <>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.chatAvatarBox}>
                  <Text style={styles.chatAvatarText}>
                    {(activeContact.name || 'Staff').trim().slice(0, 2).toUpperCase()}
                  </Text>
                  {activeContact.isOnline && <View style={styles.chatAvatarOnlineDot} />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.chatTeacherName}>{activeContact.name}</Text>
                  <Text
                    style={[
                      styles.chatPresenceStatusText,
                      isOtherTyping && { color: '#059669', fontWeight: '700' },
                      !isOtherTyping && activeContact.isOnline && { color: '#059669', fontWeight: '600' },
                    ]}
                  >
                    {formatPresenceStatus(Boolean(activeContact.isOnline), activeContact.lastSeenAt, isOtherTyping)}
                  </Text>
                  <View style={styles.chatScopePill}>
                    <Text style={styles.chatScopeText}>
                      {activeContact.childName
                        ? `Teacher for ${activeContact.childName}${activeContact.assignedSections?.[0] ? ' (' + activeContact.assignedSections[0] + ')' : ''}`
                        : (activeContact.role || 'Faculty Member')}
                      {activeContact.subjects?.length ? ` · Subjects: ${activeContact.subjects.join(', ')}` : ''}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.liveBadgePill}>
                <View style={styles.liveGreenDot} />
                <Wifi size={11} color="#059669" style={{ marginHorizontal: 3 }} />
                <Text style={styles.liveBadgeText}>Live WebSockets</Text>
              </View>
            </View>

            {/* Chat Messages Area (1:1 with Web Screenshot) */}
            <View style={styles.messagesBoxContainer}>
              {messages.length === 0 ? (
                <View style={styles.emptyMessagesBox}>
                  <MessageSquare size={36} color="#CBD5E1" />
                  <Text style={styles.emptyMessagesTitle}>No messages yet</Text>
                  <Text style={styles.emptyMessagesSubtitle}>
                    Say hello to {activeContact.name} below.
                  </Text>
                </View>
              ) : (
                messages.map((m) => {
                  const isMe =
                    m.senderId === currentUserId ||
                    (currentUserName && m.senderName?.toLowerCase() === currentUserName.toLowerCase()) ||
                    m.senderName?.toLowerCase() === 'me';
                  const formattedTime = m.createdAt.includes('T')
                    ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : m.createdAt;

                  if (isMe) {
                    // Right Bubble (Purple `#5B5DF6`, white text, timestamp + double checkmarks)
                    return (
                      <View key={m.id} style={styles.myMessageRow}>
                        <View style={styles.myBubble}>
                          {/* Attachment rendering for my messages */}
                          {(() => {
                            const atts = m.attachments || [];
                            const imageAtt = atts.find(
                              (a) => a.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.originalName)
                            );
                            const docAtt = !imageAtt && atts.length > 0 ? atts[0] : null;
                            const localUri = m.localUri;
                            if (imageAtt || localUri) {
                              const uri = localUri || (imageAtt?.downloadUrl ? getAttachmentDownloadUrl(imageAtt.downloadUrl) : '');
                              return (
                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => {
                                    if (uri) {
                                      setActiveMediaViewer({
                                        visible: true,
                                        url: uri,
                                        title: imageAtt?.originalName || 'Photo Preview',
                                        type: 'image',
                                        contentType: imageAtt?.contentType || 'image/jpeg',
                                        fileSize: imageAtt?.fileSize,
                                      });
                                    }
                                  }}
                                  style={styles.attachImageWrap}
                                >
                                  <View style={styles.attachBadgeRow}>
                                    <ImageIcon size={12} color="#C7D2FE" />
                                    <Text style={styles.attachBadgeText}>PHOTO</Text>
                                  </View>
                                  {uri ? <Image source={{ uri }} style={styles.attachImage} resizeMode="cover" /> : null}
                                </TouchableOpacity>
                              );
                            }
                            if (docAtt) {
                              const docUrl = docAtt.downloadUrl ? getAttachmentDownloadUrl(docAtt.downloadUrl) : '';
                              return (
                                <TouchableOpacity
                                  activeOpacity={0.85}
                                  onPress={() => {
                                    if (docUrl) {
                                      setActiveMediaViewer({
                                        visible: true,
                                        url: docUrl,
                                        title: docAtt.originalName,
                                        type: 'file',
                                        contentType: docAtt.contentType,
                                        fileSize: docAtt.fileSize,
                                      });
                                    }
                                  }}
                                  style={styles.attachDocCard}
                                >
                                  <File size={15} color="#C7D2FE" />
                                  <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.attachDocName} numberOfLines={1}>{docAtt.originalName}</Text>
                                    <Text style={styles.attachDocMeta}>
                                      {docAtt.fileSize > 0 ? `${Math.round(docAtt.fileSize / 1024)} KB · ` : ''}
                                      {docAtt.originalName.split('.').pop()?.toUpperCase()} • Tap to Open
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            }
                            return null;
                          })()}
                          {m.body && m.body.trim().length > 0 && (
                            <Text style={styles.myBubbleText}>{m.body}</Text>
                          )}
                          <View style={styles.myMetaRow}>
                            <Text style={styles.myTimeText}>{formattedTime}</Text>
                            <CheckCheck size={12} color={(m.isRead || (m as any).readAt || (m as any).read_at) ? '#EF4444' : '#C7D2FE'} style={{ marginLeft: 3 }} />
                          </View>
                        </View>
                      </View>
                    );
                  }

                  // Left Bubble (White card, slate text, subtle border)
                  return (
                    <View key={m.id} style={styles.otherMessageRow}>
                      <View style={styles.otherBubble}>
                        {/* Attachment rendering for other's messages */}
                        {(() => {
                          const atts = m.attachments || [];
                          const imageAtt = atts.find(
                            (a) => a.contentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(a.originalName)
                          );
                          const docAtt = !imageAtt && atts.length > 0 ? atts[0] : null;
                          if (imageAtt) {
                            const uri = imageAtt.downloadUrl ? getAttachmentDownloadUrl(imageAtt.downloadUrl) : '';
                            return (
                              <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => {
                                  if (uri) {
                                    setActiveMediaViewer({
                                      visible: true,
                                      url: uri,
                                      title: imageAtt.originalName,
                                      type: 'image',
                                      contentType: imageAtt.contentType,
                                      fileSize: imageAtt.fileSize,
                                    });
                                  }
                                }}
                                style={styles.attachImageWrap}
                              >
                                <View style={styles.attachBadgeRowOther}>
                                  <ImageIcon size={12} color="#64748B" />
                                  <Text style={styles.attachBadgeTextOther}>PHOTO</Text>
                                </View>
                                {uri ? <Image source={{ uri }} style={styles.attachImage} resizeMode="cover" /> : null}
                              </TouchableOpacity>
                            );
                          }
                          if (docAtt) {
                            const docUrl = docAtt.downloadUrl ? getAttachmentDownloadUrl(docAtt.downloadUrl) : '';
                            return (
                              <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => {
                                  if (docUrl) {
                                    setActiveMediaViewer({
                                      visible: true,
                                      url: docUrl,
                                      title: docAtt.originalName,
                                      type: 'file',
                                      contentType: docAtt.contentType,
                                      fileSize: docAtt.fileSize,
                                    });
                                  }
                                }}
                                style={styles.attachDocCardOther}
                              >
                                <File size={15} color="#64748B" />
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                  <Text style={styles.attachDocNameOther} numberOfLines={1}>{docAtt.originalName}</Text>
                                  <Text style={styles.attachDocMeta}>
                                    {docAtt.fileSize > 0 ? `${Math.round(docAtt.fileSize / 1024)} KB · ` : ''}
                                    {docAtt.originalName.split('.').pop()?.toUpperCase()} • Tap to Open
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          }
                          return null;
                        })()}
                        {m.body && m.body.trim().length > 0 && (
                          <Text style={styles.otherBubbleText}>{m.body}</Text>
                        )}
                        <Text style={styles.otherTimeText}>{formattedTime}</Text>
                      </View>
                    </View>
                  );
                })
              )}
              {isOtherTyping && (
                <View style={styles.otherMessageRow}>
                  <View style={[styles.otherBubble, styles.parentTypingBubble]}>
                    <Text style={styles.parentTypingText}>typing...</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Pending Attachment Preview Chip */}
            {pendingAttachment && (
              <View style={styles.parentPendingAttachPill}>
                <View style={styles.parentPendingIconWrap}>
                  {pendingAttachment.type === 'image' ? (
                    <ImageIcon size={16} color="#1E6BFF" />
                  ) : (
                    <File size={16} color="#EF4444" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.parentPendingName} numberOfLines={1}>
                    {pendingAttachment.name}
                  </Text>
                  <Text style={styles.parentPendingSub}>
                    {pendingAttachment.size || (pendingAttachment.type === 'image' ? 'Photo' : 'Document')} • Ready to send
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPendingAttachment(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ padding: 4 }}
                >
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Chat Input Bar */}
            <View style={styles.chatInputBar}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setAttachmentModalVisible(true)}
                style={styles.attachBtn}
              >
                <Paperclip size={18} color="#64748B" />
              </TouchableOpacity>

              <TextInput
                value={draft}
                onChangeText={(val) => {
                  setDraft(val);
                  sendTyping(val.trim().length > 0);
                }}
                placeholder={`Type a direct message to ${activeContact.name}...`}
                placeholderTextColor="#94A3B8"
                style={styles.chatTextInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSend}
                disabled={sending || (!draft.trim() && !pendingAttachment)}
                style={[
                  styles.sendBtn,
                  (!draft.trim() && !pendingAttachment || sending) && styles.sendBtnDisabled,
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={15} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={[styles.emptyMessagesBox, { paddingVertical: 48 }]}>
            <MessageSquare size={40} color="#CBD5E1" />
            <Text style={styles.emptyMessagesTitle}>No Active Conversation</Text>
            <Text style={styles.emptyMessagesSubtitle}>
              Select a teacher or faculty member from your contacts to start chatting.
            </Text>
          </View>
        )}
      </View>

      {/* Attachment Options Picker Modal */}
      {attachmentModalVisible && (
        <View style={styles.attachPickerBackdrop}>
          <View style={styles.attachPickerSheet}>
            <Text style={styles.attachPickerTitle}>Send Attachment</Text>
            <View style={styles.attachPickerGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePickPhoto(true)}
                style={styles.attachPickerOption}
              >
                <View style={[styles.attachPickerIconWrap, { backgroundColor: '#EBF2FF' }]}>
                  <Camera size={24} color="#1E6BFF" />
                </View>
                <Text style={styles.attachPickerOptionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePickPhoto(false)}
                style={styles.attachPickerOption}
              >
                <View style={[styles.attachPickerIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <ImageIcon size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.attachPickerOptionText}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickDocument}
                style={styles.attachPickerOption}
              >
                <View style={[styles.attachPickerIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <FileText size={24} color="#10B981" />
                </View>
                <Text style={styles.attachPickerOptionText}>Document</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setAttachmentModalVisible(false)}
              style={styles.attachPickerCancelBtn}
            >
              <Text style={styles.attachPickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full-Screen Attachment Viewer Modal */}
      <AttachmentViewerModal
        visible={activeMediaViewer.visible}
        url={activeMediaViewer.url}
        title={activeMediaViewer.title}
        type={activeMediaViewer.type}
        contentType={activeMediaViewer.contentType}
        fileSize={activeMediaViewer.fileSize}
        onClose={() => setActiveMediaViewer((prev) => ({ ...prev, visible: false }))}
      />
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
    padding: 18,
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
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  headerLeftBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedChildrenPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
  },
  linkedChildrenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  assignedSubjectText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeworkPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  homeworkBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    marginTop: 4,
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

  // Main Card Container
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // 2. Children's Teachers Panel Header
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  panelSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  availablePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  availablePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 0,
  },

  // Teacher Cards List
  teacherCardsList: {
    gap: 10,
  },
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  selectedTeacherCard: {
    backgroundColor: '#5B5DF6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4338CA',
    padding: 12,
    shadowColor: '#5B5DF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  teacherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  activeAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  teacherName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  teacherMeta: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  activeTeacherName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeTeacherMeta: {
    fontSize: 10.5,
    color: '#E0E7FF',
    marginTop: 2,
  },

  // Ward box in cards
  wardBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    padding: 9,
  },
  activeWardBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderRadius: 10,
    padding: 9,
  },
  wardBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  wardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  activeWardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  sectionPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  sectionPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  subjectPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  subjectPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6D28D9',
  },
  activeSectionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  activeSubjectPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandTeachersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expandTeachersText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // 3. Panel 2: Chat Desk
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
    flexWrap: 'wrap',
  },
  chatHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 220,
  },
  chatAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chatAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatAvatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatTeacherName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatPresenceStatusText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  parentTypingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  parentTypingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#059669',
    fontWeight: '600',
  },
  chatScopePill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  chatScopeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  liveBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },

  // Messages Area
  messagesBoxContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    gap: 10,
  },
  emptyMessagesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyMessagesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyMessagesSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
  },

  // Bubble styles
  otherMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  otherBubble: {
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  otherBubbleText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  otherTimeText: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  myMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  myBubble: {
    maxWidth: '80%',
    backgroundColor: '#5B5DF6',
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#5B5DF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  myBubbleText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  myMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  myTimeText: {
    fontSize: 9.5,
    color: '#E0E7FF',
  },

  // Chat Input Bar
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTextInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#C7D2FE',
  },

  // Attachment styles
  attachImageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: '#E0E7FF',
  },
  attachBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#6366F1',
  },
  attachBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  attachBadgeRowOther: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E2E8F0',
  },
  attachBadgeTextOther: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  attachImage: {
    width: '100%',
    height: 160,
  },
  attachDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  attachDocCardOther: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  attachDocName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  attachDocNameOther: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
  },
  attachDocMeta: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },

  // Pending attachment preview chip
  parentPendingAttachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 10,
  },
  parentPendingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentPendingName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  parentPendingSub: {
    fontSize: 10.5,
    color: '#3B82F6',
  },

  // Attachment Options Modal
  attachPickerBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  attachPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 16,
  },
  attachPickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  attachPickerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  attachPickerOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachPickerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attachPickerOptionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  attachPickerCancelBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  attachPickerCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});

