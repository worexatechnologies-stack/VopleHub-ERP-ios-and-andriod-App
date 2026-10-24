import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Plus,
  RefreshCw,
  Smile,
  Camera,
  X,
  Building2,
  ShieldCheck,
  MessageSquare,
  Image as ImageIcon,
  File,
} from 'lucide-react-native';
import { VolpeTheme } from '../../../theme/theme';
import type { User as UserType } from '../../../types/auth';
import type { ChatConversation, ChatMessage, ChatContact } from '../../../types/communication';
import {
  apiGetConversations,
  apiGetChatContacts,
  apiGetMessages,
  apiSendMessage,
  apiCreateConversation,
  apiMarkConversationRead,
  getAttachmentDownloadUrl,
} from '../../../services/schoolApi';
import { AttachmentViewerModal } from '../../common/AttachmentViewerModal';
import { chatSocket } from '../../../services/chatSocket';
import { formatPresenceStatus } from '../../../utils';
let launchImageLibrary: any = null;
let launchCamera: any = null;
let DocumentPicker: any = null;
try { const m = require('react-native-image-picker'); launchImageLibrary = m.launchImageLibrary; launchCamera = m.launchCamera; } catch {}
try {
  DocumentPicker = require('@react-native-documents/picker');
} catch {
  try { DocumentPicker = require('react-native-document-picker').default || require('react-native-document-picker'); } catch {}
}

interface TeacherCommsTabProps {
  currentUser?: UserType;
  students?: any[];
  onUnreadCountChange?: (count: number) => void;
}

type FilterChip = 'All' | 'Unread' | 'Office' | 'Parents';

// Common emoji palette for the emoji picker
const EMOJI_LIST = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
  '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
  '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
  '🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥',
  '😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵',
  '👍','👎','👏','🙌','🤝','👊','✊','🤜','🤛','💪',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️',
  '🎉','🎊','🎈','🏆','🌟','⭐','✨','🔥','💯','✅',
  '📚','📖','📝','📋','✏️','🖊️','📌','📎','🔗','📁',
  '🏫','🎓','🧑‍🏫','👨‍🎓','👩‍🎓','📅','⏰','🔔','📢','💡',
];

export function TeacherCommsTab({
  currentUser,
  students = [],
  onUnreadCountChange,
}: TeacherCommsTabProps) {
  // Navigation: null = Chat List view; number = Conversation ID view
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Data states
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [searchOpen, setSearchOpen] = useState(false);

  // Chat message input
  const [inputText, setInputText] = useState('');

  // New Chat Modal
  const [newChatModalVisible, setNewChatModalVisible] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  // Emoji Picker & Attachment Picker Modal
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

  // Pending attachment (image uri or file name)
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

  // WebSocket & Real-time State
  const [wsConnected, setWsConnected] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingMap, setTypingMap] = useState<Record<number, boolean>>({});
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const lastTypingSentRef = useRef<number>(0);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConvRef = useRef<number | null>(null);
  activeConvRef.current = activeConversationId;
  const messagesScrollRef = useRef<ScrollView>(null);
  // Track sent message IDs to avoid WS echo duplicates
  const sentMessageIdsRef = useRef<Set<number>>(new Set());
  // Map clientKey -> optimistic tempId for reconciling WS message.created echoes
  const pendingByClientKeyRef = useRef<Map<string, { tempId: number; body: string }>>(new Map());

  // Handle inserting emoji
  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  // Handle Photo Picker (Camera or Gallery)
  const handlePickPhoto = async (fromCamera = false) => {
    setAttachmentModalVisible(false);
    try {
      if (fromCamera && launchCamera) {
        launchCamera(
          { mediaType: 'photo', quality: 0.85, saveToPhotos: false },
          (response: any) => {
            if (response.didCancel) return;
            if (response.errorMessage) {
              console.warn('Camera error:', response.errorMessage);
            }
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
            if (response.errorMessage) {
              console.warn('Image picker error:', response.errorMessage);
            }
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

      // Fallback sample photos if native modules are not linked
      setPendingAttachment({
        type: 'image',
        uri: fromCamera
          ? 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60',
        name: fromCamera ? 'Camera_Blackboard_Snap.jpg' : 'Class_Notes_Attachment.jpg',
        mimeType: 'image/jpeg',
      });
    } catch (err) {
      console.warn('Photo picker error:', err);
      setPendingAttachment({
        type: 'image',
        name: 'Captured_Blackboard_Photo.jpg',
        uri: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60',
      });
    }
  };

  // Handle Document Picker
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
        name: 'Unit_4_Science_Assignment.pdf',
        size: '340 KB',
      });
    } catch (err: any) {
      if (DocumentPicker?.isCancel?.(err) || err?.code === 'OPERATION_CANCELED') return;
      console.warn('Document picker error:', err);
      setPendingAttachment({
        type: 'file',
        name: 'Syllabus_Term2_Official.pdf',
        size: '420 KB',
      });
    }
  };

  // Handle Quick Academic Presets
  const handleSelectPresetAttachment = (type: 'image' | 'file', name: string, uri?: string) => {
    setAttachmentModalVisible(false);
    setPendingAttachment({
      type,
      name,
      uri: uri || (type === 'image' ? 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60' : undefined),
    });
  };


  // -------------------------------------------------------------
  // 1. Initial Load: Conversations & Contacts from Backend API
  // -------------------------------------------------------------
  const fetchConversations = async () => {
    try {
      const convs = await apiGetConversations();
      const normalized = (convs || []).map((c: any) => {
        const rawLast = c.lastMessage || c.last_message;
        const lastMsg = rawLast ? {
          ...rawLast,
          isMe: rawLast.isMe ?? (
            (rawLast.senderId && rawLast.senderId === currentUser?.id) ||
            (rawLast.sender_id && rawLast.sender_id === currentUser?.id) ||
            (rawLast.sender?.id && rawLast.sender.id === currentUser?.id)
          ),
          isRead: Boolean(
            rawLast.isRead ||
            rawLast.is_read ||
            rawLast.readAt ||
            rawLast.read_at ||
            rawLast.read
          ),
        } : undefined;
        return {
          ...c,
          lastMessage: lastMsg,
          unreadCount: Number(c.unreadCount ?? c.unread_count ?? 0),
        };
      });
      setConversations(normalized);
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Report distinct unread conversations (people) count to parent dashboard
  useEffect(() => {
    if (onUnreadCountChange) {
      const unreadPeopleCount = conversations.filter(
        (c) => ((c.unreadCount || (c as any).unread_count || 0) > 0)
      ).length;
      onUnreadCountChange(unreadPeopleCount);
    }
  }, [conversations, onUnreadCountChange]);

  // When active conversation opens, mark its local unreadCount as 0
  useEffect(() => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [activeConversationId]);

  const fetchContacts = async () => {
    try {
      const cnts = await apiGetChatContacts();
      setContacts(cnts || []);
    } catch (e) {
      console.warn('Failed to load contacts:', e);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, []);

  // -------------------------------------------------------------
  // 2. WebSocket Real-Time Connection
  // -------------------------------------------------------------
  useEffect(() => {
    let alive = true;

    // Connect the shared WebSocket (auto-reconnects on drop).
    chatSocket.connect();

    const unsubStatus = chatSocket.subscribeStatus((status) => {
      setWsConnected(status === 'connected');
    });

    // Rejoin the active conversation whenever the socket is (re)connected.
    if (activeConversationId) {
      chatSocket.joinConversation(activeConversationId);
    }

    // Incoming new message: reconcile optimistic/pending/sent states.
    const unsubMessage = chatSocket.on('message.created', (payload: any) => {
      if (!alive) return;

      const convId = payload?.conversationId || payload?.conversation_id;
      if (!convId) return;

      // Reconcile optimistic message when the server echoes our own send.
      const clientKey = payload?.clientKey;
      const isOwnEcho = Boolean(clientKey && pendingByClientKeyRef.current.has(clientKey));

      const incomingMsg: ChatMessage = {
        id: payload.id,
        conversationId: convId,
        senderId: payload.senderId || payload.sender_id || 0,
        senderName: payload.senderName || payload.sender_name || 'Staff',
        body: payload.body || payload.text || payload.message || '',
        createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
        isRead: Boolean(payload.isRead || payload.read_at),
        isMe: payload.isMe ?? (payload.senderId === currentUser?.id),
        attachments: payload.attachments || [],
      };

      if (convId === activeConvRef.current) {
        setMessages((prev) => {
          // Already persisted (REST responded first): dedupe by id.
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;

          // This is our own message echoed via WS: replace optimistic temp copy.
          if (isOwnEcho) {
            const pending = pendingByClientKeyRef.current.get(clientKey!);
            if (pending) {
              pendingByClientKeyRef.current.delete(clientKey!);
              return prev.map((m) =>
                m.id === pending.tempId ? { ...incomingMsg, isMe: true } : m
              );
            }
          }

          // Fallback: body match against an optimistic temp message (no clientKey).
          if (incomingMsg.isMe) {
            const optIndex = prev.findIndex(
              (m) =>
                m.isMe &&
                m.body.trim() === incomingMsg.body.trim() &&
                typeof m.id === 'number' &&
                m.id > 1700000000000
            );
            if (optIndex !== -1) {
              const updated = [...prev];
              updated[optIndex] = incomingMsg;
              return updated;
            }
          }

          return [...prev, incomingMsg];
        });
        setTimeout(() => {
          messagesScrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
        apiMarkConversationRead(convId).catch(() => {});
      }

      // Update the conversations list item and move to top.
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === convId);
        if (index !== -1) {
          const updated = [...prev];
          const currentConv = updated[index];
          const isCurrentlyOpen = convId === activeConvRef.current;
          updated.splice(index, 1);
          updated.unshift({
            ...currentConv,
            lastMessage: {
              id: incomingMsg.id,
              body: incomingMsg.body,
              createdAt: incomingMsg.createdAt,
              isMe: incomingMsg.isMe,
            },
            unreadCount: isCurrentlyOpen ? 0 : (currentConv.unreadCount || 0) + 1,
            updatedAt: incomingMsg.createdAt,
          });
          return updated;
        }
        fetchConversations();
        return prev;
      });
    });

    // Typing indicators
    const unsubTyping = chatSocket.on('typing.updated', (payload: any) => {
      if (!alive) return;
      const data = payload || {};
      const convId = Number(data.conversationId);
      const isTyping = Boolean(data.isTyping);
      if (data.userId && data.userId === currentUser?.id) return;

      if (convId) {
        setTypingMap((prev) => ({ ...prev, [convId]: isTyping }));
        if (convId === Number(activeConvRef.current)) {
          setOtherUserTyping(isTyping);
        }
        if (typingTimersRef.current[convId]) {
          clearTimeout(typingTimersRef.current[convId]);
        }
        if (isTyping) {
          typingTimersRef.current[convId] = setTimeout(() => {
            if (alive) {
              setTypingMap((prev) => ({ ...prev, [convId]: false }));
              if (convId === Number(activeConvRef.current)) {
                setOtherUserTyping(false);
              }
            }
          }, 4000);
        }
      }
    });

    // Real-time presence updates (online / offline / lastSeenAt)
    const unsubPresence = chatSocket.on('user.presence', (payload: any) => {
      if (!alive) return;
      const data = payload || {};
      const userId = data.userId;
      if (!userId) return;

      const isOnline = Boolean(data.isOnline);
      const lastSeenAt = data.lastSeenAt || new Date().toISOString();

      setConversations((prev) =>
        prev.map((c) => {
          if (c.otherParticipant && (c.otherParticipant.id === userId || (c.otherParticipant as any).userId === userId)) {
            return {
              ...c,
              otherParticipant: {
                ...c.otherParticipant,
                isOnline,
                lastSeenAt,
              },
            };
          }
          return c;
        })
      );

      setContacts((prev) =>
        prev.map((contact) => {
          if (contact.userId === userId || Number(contact.id) === Number(userId)) {
            return {
              ...contact,
              isOnline,
              lastSeenAt,
            };
          }
          return contact;
        })
      );
    });

    // Read receipts over WebSocket
    const unsubRead = chatSocket.on('conversation.read', (payload: any) => {
      if (!alive) return;
      const data = payload || {};
      const convId = data.conversationId || data.conversation_id || data.id;
      const isCurrent = !convId || String(convId) === String(activeConvRef.current);
      if (isCurrent) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
      if (convId) {
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(convId) && c.lastMessage
              ? {
                  ...c,
                  lastMessage: { ...c.lastMessage, isRead: true },
                  unreadCount: isCurrent ? 0 : c.unreadCount,
                }
              : c
          )
        );
      }
    });

    // Unread count updates for the current conversation.
    const unsubUnread = chatSocket.on('unread_count.updated', (payload: any) => {
      if (!alive) return;
      const data = payload || {};
      const convId = data.conversationId || data.conversation_id;
      if (convId && convId === activeConvRef.current) {
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(convId)
              ? { ...c, unreadCount: data.conversationUnread ?? c.unreadCount }
              : c
          )
        );
      }
    });

    return () => {
      alive = false;
      unsubStatus();
      unsubMessage();
      unsubTyping();
      unsubPresence();
      unsubRead();
      unsubUnread();
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }
      if (activeConversationId) {
        chatSocket.leaveConversation(activeConversationId);
      }
      setWsConnected(false);
    };
  }, [currentUser?.id, activeConversationId]);

  // -------------------------------------------------------------
  // 3. Load Messages for Active Conversation
  // -------------------------------------------------------------
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let alive = true;
    setLoadingMessages(true);

    const normalizeIncomingMessage = (m: any): ChatMessage => {
      const isMe = m.isMe ?? (
        m.senderId === currentUser?.id ||
        m.sender_id === currentUser?.id ||
        m.sender?.id === currentUser?.id ||
        (currentUser?.name && (m.senderName || m.sender_name)?.toLowerCase() === currentUser.name.toLowerCase()) ||
        (m.senderName || m.sender_name)?.toLowerCase() === 'me'
      );
      const isRead = Boolean(
        m.isRead ||
        m.is_read ||
        m.readAt ||
        m.read_at ||
        m.read ||
        m.status === 'read' ||
        m.seen
      );
      return {
        id: m.id || Date.now(),
        conversationId: m.conversationId || m.conversation_id || activeConversationId,
        senderId: m.senderId || m.sender_id || m.sender?.id || 0,
        senderName: m.senderName || m.sender_name || m.sender?.name || (isMe ? (currentUser?.name || 'Me') : 'Staff'),
        body: m.body || m.text || m.message || '',
        createdAt: m.createdAt || m.created_at || new Date().toISOString(),
        isRead,
        isMe,
        attachments: m.attachments || [],
      };
    };

    const loadMessages = async () => {
      try {
        const res = await apiGetMessages(activeConversationId);
        if (alive && res) {
          const list = (Array.isArray(res) ? res : []).map(normalizeIncomingMessage);
          setMessages(list);
          setTimeout(() => {
            messagesScrollRef.current?.scrollToEnd({ animated: false });
          }, 150);
        }
      } catch (err) {
        console.warn('Failed loading messages:', err);
      } finally {
        if (alive) setLoadingMessages(false);
      }
    };

    loadMessages();
    apiMarkConversationRead(activeConversationId)
      .then(() => {
        if (alive) {
          // Only mark incoming messages from other participant as read by ME
          setMessages((prev) => prev.map((m) => (!m.isMe ? { ...m, isRead: true } : m)));
        }
      })
      .catch(() => {});

    // Subscribe and broadcast read via WebSocket if available
    try {
      chatSocket.joinConversation(activeConversationId);
      chatSocket.markConversationRead(activeConversationId);
    } catch {}

    // Polling fallback every 4 seconds while active chat is open
    const pollInterval = setInterval(() => {
      if (!alive) return;
      apiGetMessages(activeConversationId)
        .then((fresh) => {
          if (alive && fresh) {
            const list = (Array.isArray(fresh) ? fresh : []).map(normalizeIncomingMessage);
            setMessages((prev) => {
              const seen = new Set<number>();
              const deduped: ChatMessage[] = [];
              for (const m of list) {
                if (!seen.has(m.id)) {
                  seen.add(m.id);
                  deduped.push(m);
                }
              }
              const pendingOpt = prev.filter(
                (m) => typeof m.id === 'number' && m.id > 1700000000000 && !seen.has(m.id)
              );
              return [...deduped, ...pendingOpt];
            });
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      alive = false;
      clearInterval(pollInterval);
    };
  }, [activeConversationId, currentUser?.id, currentUser?.name]);

  // -------------------------------------------------------------
  // 4. Send Message (WebSocket + REST Backend API)
  // -------------------------------------------------------------
  const handleSendMessage = async () => {
    if ((!inputText.trim() && !pendingAttachment) || !activeConversationId || sendingMessage) return;

    const textToSend = inputText.trim();
    const attachmentToSend = pendingAttachment ? { ...pendingAttachment } : null;

    setInputText('');
    setPendingAttachment(null);
    setShowEmojiPicker(false);
    setSendingMessage(true);

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
    chatSocket.sendTyping(activeConversationId, false);

    // Optimistic local message
    const tempId = Date.now();
    const clientKey = `client-${tempId}-${Math.random().toString(36).slice(2)}`;
    sentMessageIdsRef.current.add(tempId);
    pendingByClientKeyRef.current.set(clientKey, { tempId, body: textToSend });
    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: currentUser?.id || 0,
      senderName: currentUser?.name || 'Me',
      body: textToSend,
      createdAt: new Date().toISOString(),
      isRead: false,
      isMe: true,
      // Show local preview of the attachment before server confirms
      localUri: attachmentToSend?.uri,
      attachments: attachmentToSend ? [{
        id: `local-${tempId}`,
        originalName: attachmentToSend.name,
        contentType: attachmentToSend.type || (attachmentToSend.uri ? 'image/jpeg' : 'application/octet-stream'),
        fileSize: 0,
        downloadUrl: '',
      }] : [],
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => {
      messagesScrollRef.current?.scrollToEnd({ animated: true });
    }, 50);

    // Message creation stays REST-only; WebSocket is delivery-only.
    // The clientKey lets us reconcile the WS message.created echo with this optimistic copy.

    // 2. Persist to Backend REST API
    try {
      const persisted = await apiSendMessage(
        activeConversationId,
        textToSend,
        clientKey,
        attachmentToSend?.uri
          ? {
              uri: attachmentToSend.uri,
              name: attachmentToSend.name,
              type: (attachmentToSend as any).mimeType || (attachmentToSend.type === 'image' ? 'image/jpeg' : 'application/pdf'),
            }
          : null
      );
      sentMessageIdsRef.current.add(persisted.id);
      pendingByClientKeyRef.current.delete(clientKey);

      // Replace optimistic message with backend saved message, avoiding duplicate copies
      setMessages((prev) => {
        const hasPersisted = prev.some((m) => m.id === persisted.id);
        if (hasPersisted) {
          // Already received via WS echo, drop temp optimistic copy
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) => (m.id === tempId ? { ...persisted, isMe: true, attachments: (persisted as any).attachments || [] } : m));
      });

      // Update conversations list
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === activeConversationId);
        if (index === -1) return prev;
        const updated = [...prev];
        const currentConv = updated[index];
        updated.splice(index, 1);
        updated.unshift({
          ...currentConv,
          lastMessage: {
            id: persisted.id,
            body: persisted.body,
            createdAt: persisted.createdAt,
            isMe: true,
            isRead: false,
          },
          updatedAt: persisted.createdAt,
        });
        return updated;
      });
    } catch (err: any) {
      Alert.alert('Send Error', err?.message || 'Failed to deliver message.');
      // Remove failed optimistic message and clear pending clientKey
      pendingByClientKeyRef.current.delete(clientKey);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSendingMessage(false);
    }
  };

  // -------------------------------------------------------------
  // Dynamic search for contacts when modal is open
  useEffect(() => {
    if (!newChatModalVisible) return;
    const timer = setTimeout(() => {
      apiGetChatContacts(contactSearch)
        .then((fresh) => {
          if (fresh && fresh.length > 0) setContacts(fresh);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [contactSearch, newChatModalVisible]);

  // -------------------------------------------------------------
  // 5. Start or Open Chat with a Contact
  // -------------------------------------------------------------
  const handleSelectContactToChat = async (contact: ChatContact) => {
    setStartingChat(true);
    try {
      const isOffice =
        contact.isOfficeDesk ||
        contact.id === 'admin-office' ||
        contact.role?.toLowerCase().includes('admin');

      // Check if conversation already exists for this contact
      const existing = conversations.find(
        (c) =>
          c.otherParticipant?.id === contact.userId ||
          String(c.otherParticipant?.id) === String(contact.id) ||
          (isOffice && (
            c.otherParticipant?.role?.toLowerCase().includes('admin') ||
            c.conversationType === 'ADMIN_STAFF' ||
            c.otherParticipant?.isOfficeDesk
          ))
      );

      if (existing) {
        setNewChatModalVisible(false);
        setActiveConversationId(existing.id);
        return;
      }

      // Otherwise create a conversation on backend
      const targetUserId = isOffice ? 'admin-office' : (contact.userId || contact.id);
      const studentId = contact.students?.[0]?.id;
      const created = await apiCreateConversation(targetUserId, studentId);

      setConversations((prev) => [created, ...prev]);
      setNewChatModalVisible(false);
      setActiveConversationId(created.id);
    } catch (err: any) {
      Alert.alert(
        'Unable to Start Chat',
        err?.message || 'Could not initiate conversation with this contact.'
      );
    } finally {
      setStartingChat(false);
    }
  };

  // -------------------------------------------------------------
  // 6. Formatted Date / Time Helpers & Participant Info
  // -------------------------------------------------------------
  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatConversationDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
    } catch {
      return '';
    }
  };

  // Active Conversation participant
  const activeConversation = useMemo(() => {
    return conversations.find((c) => String(c.id) === String(activeConversationId));
  }, [conversations, activeConversationId]);

  const getParticipantInfo = (conv?: ChatConversation | null) => {
    if (!conv) {
      return {
        name: 'School Admin / Office Desk',
        isOffice: true,
        isOnline: true,
        subtitle: 'online',
        lastSeenAt: null,
        isTyping: false,
      };
    }
    const other = conv.otherParticipant || (conv as any).other_participant || {};
    const isOffice =
      conv.conversationType === 'ADMIN_STAFF' ||
      (conv as any).conversation_type === 'ADMIN_STAFF' ||
      other.role?.toLowerCase().includes('admin') ||
      other.isOfficeDesk ||
      (other as any).is_office_desk ||
      other.email?.toLowerCase().includes('office') ||
      (other.name && other.name.toLowerCase().includes('office'));

    const name = isOffice
      ? 'School Admin / Office Desk'
      : (other.name || (other as any).full_name || 'Staff / Contact');

    const isOnline = Boolean(
      other.isOnline ??
      (other as any).is_online ??
      (isOffice ? true : false)
    );

    const lastSeenAt = other.lastSeenAt || (other as any).last_seen_at || null;
    const isThisConvTyping = Boolean(
      conv.id && (typingMap[conv.id] || (conv.id === activeConvRef.current && otherUserTyping))
    );

    const subtitle = formatPresenceStatus(isOnline, lastSeenAt, isThisConvTyping);

    return { name, isOffice, isOnline, subtitle, lastSeenAt, isTyping: isThisConvTyping };
  };

  // Combined full contacts list: backend contacts + dynamically mapped from students
  const fullContactsList = useMemo(() => {
    const list: ChatContact[] = [];

    // Ensure School Admin / Office Desk is included
    const hasAdmin = contacts.some((c) => c.role?.toLowerCase().includes('admin') || c.isOfficeDesk);
    if (!hasAdmin) {
      list.push({
        id: 'admin-office',
        userId: 1,
        name: 'School Admin / Office Desk',
        role: 'School Admin',
        email: 'office@school.edu',
        isOnline: true,
        isOfficeDesk: true,
      });
    }

    contacts.forEach((c) => list.push(c));

    // Also populate any parents from assigned students not yet in contacts
    (students || []).forEach((s: any) => {
      const alreadyIn = list.some(
        (c) =>
          c.students?.some((st) => st.id === s.id) ||
          c.name.toLowerCase() === (s.parentName || '').toLowerCase()
      );
      if (!alreadyIn && (s.parentName || s.name)) {
        list.push({
          id: `student-parent-${s.id}`,
          userId: s.userId || s.id,
          name: s.parentName || `Parent of ${s.name}`,
          role: 'Parent',
          email: s.parentEmail || '',
          isOnline: false,
          studentSummary: `Parent of ${s.name} (${s.className || 'Class'}${s.sectionName ? ' - Sec ' + s.sectionName : ''})`,
          students: [
            {
              id: s.id,
              name: s.name,
              className: s.className || '',
              section: s.sectionName || '',
              rollNo: s.rollNo || '-',
              admissionNo: s.admissionNo || '',
            },
          ],
        });
      }
    });

    return list;
  }, [contacts, students]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const name = c.otherParticipant?.name || 'Contact';
      const lastMsg = c.lastMessage?.body || '';

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = name.toLowerCase().includes(q);
        const matchesMsg = lastMsg.toLowerCase().includes(q);
        if (!matchesName && !matchesMsg) return false;
      }

      if (activeFilter === 'Unread') {
        if (!c.unreadCount || c.unreadCount === 0) return false;
      } else if (activeFilter === 'Office') {
        const isOffice =
          c.otherParticipant?.role?.toLowerCase().includes('admin') ||
          name.toLowerCase().includes('office') ||
          name.toLowerCase().includes('admin');
        if (!isOffice) return false;
      } else if (activeFilter === 'Parents') {
        const isParent =
          c.otherParticipant?.role?.toLowerCase().includes('parent') ||
          name.toLowerCase().includes('parent');
        if (!isParent) return false;
      }

      return true;
    });
  }, [conversations, searchQuery, activeFilter]);

  // Filtered contacts for New Chat Modal
  const filteredContactsModal = useMemo(() => {
    if (!contactSearch.trim()) return fullContactsList;
    const q = contactSearch.toLowerCase().trim();
    return fullContactsList.filter((c) => {
      const matchesName = (c.name || '').toLowerCase().includes(q);
      const matchesRole = (c.role || '').toLowerCase().includes(q);
      const matchesStudent = (c.studentSummary || '').toLowerCase().includes(q);
      const matchesChild = c.students?.some((s) => s.name.toLowerCase().includes(q));
      return matchesName || matchesRole || matchesStudent || matchesChild;
    });
  }, [fullContactsList, contactSearch]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const AVATAR_PALETTE = [
    VolpeTheme.colors.primary,
    VolpeTheme.colors.accentTeal,
    VolpeTheme.colors.accentPurple,
    VolpeTheme.colors.accentOrange,
    VolpeTheme.colors.accentPink,
    VolpeTheme.colors.accentGreen,
    VolpeTheme.colors.accentBlue,
  ];

  const getAvatarBg = (name: string) => {
    if (!name) return VolpeTheme.colors.primary;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 100000;
    }
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* VIEW A: CHAT LIST VIEW (MESSENGER HOME)                   */}
      {/* ======================================================== */}
      {activeConversationId === null ? (
        <View style={styles.chatListWrapper}>
          {/* Website Portal Messenger Header */}
          <View style={styles.waHeader}>
            <View style={styles.waHeaderTopRow}>
              <View style={styles.rowAlignCenter}>
                <Text style={styles.waLogoText}>Campus Messenger</Text>
                <View style={styles.facultyBadge}>
                  <Text style={styles.facultyBadgeText}>FACULTY DESK</Text>
                </View>
              </View>

              <View style={styles.waHeaderActions}>
                {/* Live Gateway Indicator */}
                <View style={[styles.wsStatusPill, wsConnected ? styles.wsStatusOnline : styles.wsStatusOffline]}>
                  <View style={[styles.wsStatusDot, wsConnected ? styles.wsStatusDotOnline : styles.wsStatusDotOffline]} />
                  <Text style={styles.wsStatusText}>{wsConnected ? 'Live' : 'Syncing'}</Text>
                </View>

                {/* Search Toggle */}
                <Pressable
                  style={styles.headerIconBtn}
                  onPress={() => setSearchOpen((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Search size={19} color="#FFFFFF" />
                </Pressable>

                {/* Refresh */}
                <Pressable
                  style={styles.headerIconBtn}
                  onPress={() => {
                    setLoadingConversations(true);
                    fetchConversations();
                    fetchContacts();
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RefreshCw
                    size={17}
                    color="#FFFFFF"
                    style={loadingConversations ? styles.rotatingIcon : undefined}
                  />
                </Pressable>
              </View>
            </View>

            {/* Search Input Bar */}
            {searchOpen && (
              <View style={styles.searchBarContainer}>
                <Search size={15} color="#8696A0" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search chats or contacts..."
                  placeholderTextColor="#8696A0"
                  style={styles.searchBarInput}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={15} color="#8696A0" />
                  </Pressable>
                )}
              </View>
            )}

            {/* Messenger Filter Chips */}
            <View style={styles.filterChipsRow}>
              {(['All', 'Unread', 'Office', 'Parents'] as const).map((chip) => (
                <Pressable
                  key={chip}
                  style={[styles.filterChip, activeFilter === chip && styles.filterChipActive]}
                  onPress={() => setActiveFilter(chip)}
                >
                  <Text style={[styles.filterChipText, activeFilter === chip && styles.filterChipTextActive]}>
                    {chip}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Conversations List */}
          <ScrollView
            style={styles.conversationsScroll}
            showsVerticalScrollIndicator={false}
          >
            {loadingConversations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={VolpeTheme.colors.primary} />
                <Text style={styles.loadingText}>Syncing chats...</Text>
              </View>
            ) : filteredConversations.length === 0 ? (
              <View style={styles.emptyChatsBox}>
                <View style={styles.emptyIconCircle}>
                  <MessageSquare size={36} color={VolpeTheme.colors.primary} />
                </View>
                <Text style={styles.emptyChatsTitle}>No chats in this view</Text>
                <Text style={styles.emptyChatsSub}>
                  Connect directly with the School Office Desk and Parents of your assigned students.
                </Text>
                <Pressable
                  style={styles.startNewChatBtn}
                  onPress={() => setNewChatModalVisible(true)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.startNewChatBtnText}>Start a New Chat</Text>
                </Pressable>
              </View>
            ) : (
              filteredConversations.map((conv) => {
                const info = getParticipantInfo(conv);
                const name = info.name;
                const lastMsg = conv.lastMessage;
                const isOnline = info.isOnline;
                const unread = conv.unreadCount || 0;
                const dateFormatted = formatConversationDate(conv.updatedAt || lastMsg?.createdAt);

                return (
                  <Pressable
                    key={conv.id}
                    style={styles.convItemRow}
                    onPress={() => setActiveConversationId(conv.id)}
                  >
                    {/* Avatar */}
                    <View style={styles.convAvatarWrap}>
                      <View style={[styles.convAvatarCircle, { backgroundColor: getAvatarBg(name) }]}>
                        <Text style={styles.convAvatarInitials}>{getInitials(name)}</Text>
                      </View>
                      {isOnline && <View style={styles.onlineStatusDot} />}
                    </View>

                    {/* Middle Info */}
                    <View style={styles.convMiddleCol}>
                      <View style={styles.convNameTimeRow}>
                        <Text style={styles.convNameText} numberOfLines={1}>
                          {name}
                        </Text>
                        <Text style={[styles.convTimeText, unread > 0 && styles.convTimeTextUnread]}>
                          {dateFormatted}
                        </Text>
                      </View>

                      {/* Parent or Office Subtitle tag */}
                      {(conv.otherParticipant?.studentSummary || info.isOffice) && (
                        <Text style={styles.studentContextTag} numberOfLines={1}>
                          {info.isOffice ? '🏛️ Official Faculty Desk' : `🎓 ${conv.otherParticipant?.studentSummary}`}
                        </Text>
                      )}

                      {/* Snippet Row */}
                      <View style={styles.convSnippetRow}>
                        {lastMsg?.isMe && (() => {
                          const isConvSeen = Boolean(
                            lastMsg.isRead ||
                            (lastMsg as any).is_read ||
                            (lastMsg as any).readAt ||
                            (lastMsg as any).read_at ||
                            (lastMsg as any).read
                          );
                          if (isConvSeen) {
                            return <CheckCheck size={14} color="#EF4444" strokeWidth={2.4} style={styles.snippetCheckIcon} />;
                          }
                          if (isOnline) {
                            return <CheckCheck size={14} color="#94A3B8" strokeWidth={2.2} style={styles.snippetCheckIcon} />;
                          }
                          return <Check size={14} color="#94A3B8" strokeWidth={2.2} style={styles.snippetCheckIcon} />;
                        })()}
                        {typingMap[conv.id] ? (
                          <Text style={[styles.convSnippetText, { color: '#00A884', fontStyle: 'italic', fontWeight: '600' }]}>
                            typing...
                          </Text>
                        ) : (
                          <Text
                            style={[styles.convSnippetText, unread > 0 && styles.convSnippetTextUnread]}
                            numberOfLines={1}
                          >
                            {lastMsg
                              ? (lastMsg.body && lastMsg.body.trim().length > 0
                                  ? lastMsg.body
                                  : (lastMsg as any).attachments?.length > 0
                                      ? ((lastMsg as any).attachments[0].contentType?.startsWith('image/') ? '📷 Photo' : '📄 Document')
                                      : 'Tap to open chat conversation')
                              : 'Tap to open chat conversation'}
                          </Text>
                        )}
                        {unread > 0 && (
                          <View style={styles.unreadCountBadge}>
                            <Text style={styles.unreadCountBadgeText}>{unread}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* Floating Action Button (FAB) -> Start New Chat */}
          <Pressable
            style={styles.floatingNewChatBtn}
            onPress={() => setNewChatModalVisible(true)}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2.6} />
          </Pressable>
        </View>
      ) : (
        /* ======================================================== */
        /* VIEW B: ACTIVE CHAT SCREEN (PORTAL CONVERSATION)         */
        /* ======================================================== */
        <KeyboardAvoidingView
          style={styles.activeChatWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Chat App Bar */}
          <View style={styles.waChatHeader}>
            <Pressable
              style={styles.waBackBtn}
              onPress={() => setActiveConversationId(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>

            {/* Avatar */}
            {(() => {
              const activeInfo = getParticipantInfo(activeConversation);
              return (
                <>
                  <View style={styles.chatHeaderAvatarWrap}>
                    <View
                      style={[
                        styles.chatHeaderAvatarCircle,
                        { backgroundColor: getAvatarBg(activeInfo.name) },
                      ]}
                    >
                      <Text style={styles.chatHeaderAvatarInitials}>
                        {getInitials(activeInfo.name)}
                      </Text>
                    </View>
                    {activeInfo.isOnline && (
                      <View style={styles.chatHeaderOnlineDot} />
                    )}
                  </View>

                  {/* Name & Online Status */}
                  <View style={styles.chatHeaderTitleCol}>
                    <Text style={styles.chatHeaderNameText} numberOfLines={1}>
                      {activeInfo.name}
                    </Text>
                    <Text
                      style={[
                        styles.chatHeaderSubtitleText,
                        activeInfo.isTyping && { color: '#00A884', fontWeight: '700' },
                        !activeInfo.isTyping && activeInfo.isOnline && { color: '#00A884', fontWeight: '600' },
                      ]}
                      numberOfLines={1}
                    >
                      {activeInfo.subtitle}
                    </Text>
                  </View>
                </>
              );
            })()}

            {/* Header Right Action */}
            <Pressable
              style={styles.chatHeaderRightBtn}
              onPress={() => {
                if (activeConversationId) {
                  apiGetMessages(activeConversationId)
                    .then((m) => setMessages(m || []))
                    .catch(() => {});
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <RefreshCw size={17} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Chat Wallpaper Background */}
          <View style={styles.chatWallpaperBackground}>
            <ScrollView
              ref={messagesScrollRef}
              style={styles.chatMessagesScroll}
              contentContainerStyle={styles.chatMessagesContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Date Separator Pill */}
              <View style={styles.dateSeparatorRow}>
                <View style={styles.dateSeparatorPill}>
                  <Text style={styles.dateSeparatorText}>TODAY</Text>
                </View>
              </View>

              {/* Security Pill */}
              <View style={styles.securityPillRow}>
                <View style={styles.securityPill}>
                  <ShieldCheck size={13} color={VolpeTheme.colors.primary} style={styles.securityPillIcon} />
                  <Text style={styles.securityPillText}>
                    Messages are scoped to school personnel and official academic records.
                  </Text>
                </View>
              </View>

              {/* Messages Loader */}
              {loadingMessages ? (
                <View style={styles.loadingMessagesBox}>
                  <ActivityIndicator size="small" color={VolpeTheme.colors.primary} />
                  <Text style={styles.loadingMessagesText}>Loading messages...</Text>
                </View>
              ) : messages.length === 0 ? (
                <View style={styles.noMessagesContainer}>
                  <Text style={styles.noMessagesText}>No messages yet.</Text>
                  <Text style={styles.noMessagesSub}>
                    Say hello to start the conversation with {activeConversation?.otherParticipant?.name}.
                  </Text>
                </View>
              ) : (
                messages.map((msg, _index) => {
                  const isMe = msg.isMe ?? (msg.senderId === currentUser?.id);
                  const time = formatMessageTime(msg.createdAt);

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.bubbleWrapper,
                        isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther,
                      ]}
                    >
                      <View
                        style={[
                          styles.bubbleCard,
                          isMe ? styles.bubbleCardMe : styles.bubbleCardOther,
                        ]}
                      >
                        {!isMe && (
                          <Text style={styles.bubbleSenderName}>
                            {(() => {
                              const activeInfo = getParticipantInfo(activeConversation);
                              if (activeInfo.isOffice) return 'School Admin / Office Desk';
                              return msg.senderName || activeInfo.name;
                            })()}
                          </Text>
                        )}

                        {/* Visual Attachment Card inside Bubble — uses real server attachments or local preview */}
                        {(() => {
                          const atts = msg.attachments || [];
                          const imageAtt = atts.find(
                            (a) =>
                              a.contentType?.startsWith('image/') ||
                              /\.(jpg|jpeg|png|gif|webp)$/i.test(a.originalName)
                          );
                          const docAtt = !imageAtt && atts.length > 0 ? atts[0] : null;

                          // local optimistic uri (before server responds)
                          const localPreviewUri = msg.localUri;

                          if (imageAtt || localPreviewUri) {
                            const imageUri = localPreviewUri ||
                              (imageAtt?.downloadUrl ? getAttachmentDownloadUrl(imageAtt.downloadUrl) : '');
                            return (
                              <Pressable
                                onPress={() => {
                                  if (imageUri) {
                                    setActiveMediaViewer({
                                      visible: true,
                                      url: imageUri,
                                      title: imageAtt?.originalName || 'Photo Preview',
                                      type: 'image',
                                      contentType: imageAtt?.contentType || 'image/jpeg',
                                      fileSize: imageAtt?.fileSize,
                                    });
                                  }
                                }}
                                style={styles.bubbleAttachmentCard}
                              >
                                <View style={styles.bubbleImageBadge}>
                                  <ImageIcon size={14} color="#FFFFFF" />
                                  <Text style={styles.bubbleImageBadgeText}>PHOTO</Text>
                                </View>
                                {imageUri ? (
                                  <Image
                                    source={{ uri: imageUri }}
                                    style={styles.bubbleImagePreview}
                                    resizeMode="cover"
                                  />
                                ) : null}
                              </Pressable>
                            );
                          }

                          if (docAtt) {
                            const docUrl = docAtt.downloadUrl ? getAttachmentDownloadUrl(docAtt.downloadUrl) : '';
                            return (
                              <Pressable
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
                                style={[styles.bubbleFileCard, isMe ? styles.bubbleFileCardMe : styles.bubbleFileCardOther]}
                              >
                                <View style={styles.fileIconBadge}>
                                  <File size={16} color="#DC2626" />
                                </View>
                                <View style={{ flex: 1, gap: 1 }}>
                                  <Text style={[styles.bubbleFileName, isMe ? styles.bubbleFileNameMe : styles.bubbleFileNameOther]} numberOfLines={1}>
                                    {docAtt.originalName}
                                  </Text>
                                  <Text style={styles.bubbleFileSize}>
                                    {docAtt.fileSize > 0 ? `${Math.round(docAtt.fileSize / 1024)} KB · ` : ''}
                                    {docAtt.originalName.split('.').pop()?.toUpperCase() || 'DOC'} Document • Tap to Open
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          }

                          return null;
                        })()}

                        {/* Only render body text if non-empty */}
                        {msg.body && msg.body.trim().length > 0 && (
                          <Text style={[styles.bubbleBodyText, isMe ? styles.bubbleBodyTextMe : styles.bubbleBodyTextOther]}>
                            {msg.body}
                          </Text>
                        )}
                        <View style={styles.bubbleMetaRow}>
                          <Text style={[styles.bubbleTimeText, isMe ? styles.bubbleTimeTextMe : styles.bubbleTimeTextOther]}>
                            {time}
                          </Text>
                          {isMe && (() => {
                            const activeInfo = getParticipantInfo(activeConversation);
                            const isDelivered = Boolean(activeInfo.isOnline || otherUserTyping);

                            // Only seen if confirmed read via WebSocket event or backend read receipt
                            const isSeen = Boolean(
                              msg.isRead ||
                              (msg as any).readAt ||
                              (msg as any).read_at ||
                              (msg as any).is_read ||
                              (msg as any).read
                            );

                            if (isSeen) {
                              return (
                                <CheckCheck size={14} color="#EF4444" strokeWidth={2.4} style={styles.bubbleCheckIcon} />
                              );
                            }
                            if (isDelivered) {
                              return (
                                <CheckCheck size={14} color="rgba(255, 255, 255, 0.85)" strokeWidth={2.2} style={styles.bubbleCheckIcon} />
                              );
                            }
                            return (
                              <Check size={14} color="rgba(255, 255, 255, 0.7)" strokeWidth={2.2} style={styles.bubbleCheckIcon} />
                            );
                          })()}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}

              {/* Other user is typing bubble */}
              {otherUserTyping && (
                <View style={[styles.bubbleWrapper, styles.bubbleWrapperOther]}>
                  <View style={[styles.bubbleCard, styles.bubbleCardOther, styles.typingCard]}>
                    <Text style={styles.typingIndicatorText}>typing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Pending Attachment Preview Chip */}
            {pendingAttachment && (
              <View style={styles.pendingAttachmentPill}>
                <View style={styles.pendingAttachmentIconWrap}>
                  {pendingAttachment.type === 'image' ? (
                    pendingAttachment.uri ? (
                      <Image source={{ uri: pendingAttachment.uri }} style={styles.pendingThumbnail} />
                    ) : (
                      <ImageIcon size={18} color="#2563EB" />
                    )
                  ) : (
                    <File size={18} color="#DC2626" />
                  )}
                </View>
                <View style={styles.pendingAttachmentTextWrap}>
                  <Text style={styles.pendingAttachmentName} numberOfLines={1}>
                    {pendingAttachment.name}
                  </Text>
                  <Text style={styles.pendingAttachmentType}>
                    {pendingAttachment.type === 'image' ? 'Photo ready to share' : 'Academic document attached'}
                  </Text>
                </View>
                <Pressable
                  style={styles.pendingAttachmentCloseBtn}
                  onPress={() => setPendingAttachment(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color="#64748B" />
                </Pressable>
              </View>
            )}

            {/* Emoji Drawer Panel */}
            {showEmojiPicker && (
              <View style={styles.emojiPickerContainer}>
                <View style={styles.emojiPickerHeader}>
                  <Text style={styles.emojiPickerTitle}>Campus Emojis & Symbols</Text>
                  <Pressable
                    onPress={() => setShowEmojiPicker(false)}
                    style={styles.emojiCloseBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={16} color="#64748B" />
                  </Pressable>
                </View>
                <ScrollView
                  style={styles.emojiScrollView}
                  contentContainerStyle={styles.emojiGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {EMOJI_LIST.map((emoji, index) => (
                    <Pressable
                      key={index}
                      style={styles.emojiCell}
                      onPress={() => handleInsertEmoji(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Composer Input Bar */}
            <View style={styles.waComposerContainer}>
              <View style={styles.waInputPill}>
                <Pressable
                  style={[
                    styles.composerIconBtn,
                    showEmojiPicker && styles.composerIconBtnActive,
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => setShowEmojiPicker((v) => !v)}
                >
                  <Smile size={20} color={showEmojiPicker ? VolpeTheme.colors.primary : '#8696A0'} />
                </Pressable>

                <TextInput
                  value={inputText}
                  onChangeText={(val) => {
                    setInputText(val);
                    if (activeConversationId) {
                      const now = Date.now();
                      const isTyping = val.trim().length > 0;
                      if (isTyping) {
                        if (now - lastTypingSentRef.current > 1500) {
                          chatSocket.sendTyping(activeConversationId, true);
                          lastTypingSentRef.current = now;
                        }
                        if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
                        stopTypingTimeoutRef.current = setTimeout(() => {
                          if (activeConversationId) {
                            chatSocket.sendTyping(activeConversationId, false);
                          }
                        }, 2500);
                      } else {
                        if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
                        chatSocket.sendTyping(activeConversationId, false);
                      }
                    }
                  }}
                  placeholder={pendingAttachment ? "Add a message caption..." : "Message..."}
                  placeholderTextColor="#8696A0"
                  style={styles.composerTextInput}
                  multiline
                  maxLength={1500}
                />

                <Pressable
                  style={styles.composerIconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => setAttachmentModalVisible(true)}
                >
                  <Paperclip size={18} color="#8696A0" />
                </Pressable>

                <Pressable
                  style={styles.composerIconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => handlePickPhoto(true)}
                >
                  <Camera size={19} color="#8696A0" />
                </Pressable>
              </View>

              {/* Action Button */}
              <Pressable
                style={[
                  styles.waSendRoundBtn,
                  (!inputText.trim() && !pendingAttachment) && styles.waSendRoundBtnDisabled,
                  sendingMessage && styles.waSendRoundBtnSending,
                ]}
                onPress={handleSendMessage}
                disabled={sendingMessage || (!inputText.trim() && !pendingAttachment)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send
                    size={17}
                    color={(inputText.trim() || pendingAttachment) ? '#FFFFFF' : '#94A3B8'}
                    style={styles.sendIconOffset}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* 3. NEW CHAT / CONTACTS SELECTION MODAL                   */}
      {/* ======================================================== */}
      <Modal
        visible={newChatModalVisible}
        animationType="slide"
        onRequestClose={() => setNewChatModalVisible(false)}
      >
        <View style={styles.modalFullContainer}>
          {/* Header */}
          <View style={styles.newChatHeader}>
            <Pressable
              style={styles.newChatBackBtn}
              onPress={() => setNewChatModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={22} color="#FFFFFF" />
            </Pressable>
            <View>
              <Text style={styles.newChatHeaderTitle}>Select Contact</Text>
              <Text style={styles.newChatHeaderSubtitle}>
                {filteredContactsModal.length} contacts available
              </Text>
            </View>
          </View>

          {/* Search Contacts Bar */}
          <View style={styles.modalSearchBar}>
            <Search size={16} color="#8696A0" />
            <TextInput
              value={contactSearch}
              onChangeText={setContactSearch}
              placeholder="Search name, class, section, student..."
              placeholderTextColor="#8696A0"
              style={styles.modalSearchInput}
              autoFocus
            />
            {contactSearch.length > 0 && (
              <Pressable onPress={() => setContactSearch('')}>
                <X size={16} color="#8696A0" />
              </Pressable>
            )}
          </View>

          {/* Contacts List */}
          <FlatList
            data={filteredContactsModal}
            keyExtractor={(item) => String(item.id || item.userId)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const name = item.name || 'Contact';
              const isOffice = item.isOfficeDesk || item.role?.toLowerCase().includes('admin');
              const subtitle = item.studentSummary || item.role || 'Parent';

              return (
                <Pressable
                  style={styles.modalContactItem}
                  onPress={() => handleSelectContactToChat(item)}
                  disabled={startingChat}
                >
                  <View
                    style={[
                      styles.modalContactAvatar,
                      isOffice ? styles.modalContactAvatarOffice : { backgroundColor: getAvatarBg(name) },
                    ]}
                  >
                    {isOffice ? (
                      <Building2 size={18} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalContactInitials}>{getInitials(name)}</Text>
                    )}
                    {item.isOnline && <View style={styles.modalOnlineDot} />}
                  </View>

                  <View style={styles.modalContactInfoCol}>
                    <View style={styles.rowAlignCenter}>
                      <Text style={styles.modalContactName} numberOfLines={1}>
                        {name}
                      </Text>
                      {isOffice && (
                        <View style={styles.officePillBadge}>
                          <Text style={styles.officePillBadgeText}>OFFICE DESK</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.modalContactRole} numberOfLines={1}>
                      {subtitle}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />

          {startingChat && (
            <View style={styles.startingChatOverlay}>
              <ActivityIndicator size="large" color={VolpeTheme.colors.primary} />
              <Text style={styles.startingChatText}>Opening conversation...</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 4. ATTACHMENT SELECTION MODAL (PHOTO & FILES)            */}
      {/* ======================================================== */}
      <Modal
        visible={attachmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAttachmentModalVisible(false)}
        >
          <View style={styles.attachmentSheet}>
            <View style={styles.attachmentSheetHandle} />
            <Text style={styles.attachmentSheetTitle}>Share & Attach</Text>

            <View style={styles.attachmentOptionsGrid}>
              <Pressable
                style={styles.attachmentOptionBtn}
                onPress={() => handlePickPhoto(true)}
              >
                <View style={[styles.attachmentOptionIconWrap, { backgroundColor: '#EF4444' }]}>
                  <Camera size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Camera</Text>
              </Pressable>

              <Pressable
                style={styles.attachmentOptionBtn}
                onPress={() => handlePickPhoto(false)}
              >
                <View style={[styles.attachmentOptionIconWrap, { backgroundColor: '#8B5CF6' }]}>
                  <ImageIcon size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Gallery</Text>
              </Pressable>

              <Pressable
                style={styles.attachmentOptionBtn}
                onPress={handlePickDocument}
              >
                <View style={[styles.attachmentOptionIconWrap, { backgroundColor: '#3B82F6' }]}>
                  <File size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentOptionLabel}>Document</Text>
              </Pressable>
            </View>

            {/* Quick School Presets Section */}
            <View style={styles.presetSection}>
              <Text style={styles.presetSectionTitle}>Quick Academic Presets</Text>
              <View style={styles.presetRow}>
                <Pressable
                  style={styles.presetChip}
                  onPress={() =>
                    handleSelectPresetAttachment(
                      'image',
                      'Blackboard_Class_Notes.jpg',
                      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=60'
                    )
                  }
                >
                  <Text style={styles.presetChipEmoji}>📝</Text>
                  <Text style={styles.presetChipText}>Board Notes</Text>
                </Pressable>

                <Pressable
                  style={styles.presetChip}
                  onPress={() =>
                    handleSelectPresetAttachment(
                      'file',
                      'Math_Homework_Unit4.pdf'
                    )
                  }
                >
                  <Text style={styles.presetChipEmoji}>📋</Text>
                  <Text style={styles.presetChipText}>Homework</Text>
                </Pressable>

                <Pressable
                  style={styles.presetChip}
                  onPress={() =>
                    handleSelectPresetAttachment(
                      'file',
                      'Term_Exam_Syllabus.pdf'
                    )
                  }
                >
                  <Text style={styles.presetChipEmoji}>📊</Text>
                  <Text style={styles.presetChipText}>Syllabus</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.attachmentCancelBtn}
              onPress={() => setAttachmentModalVisible(false)}
            >
              <Text style={styles.attachmentCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
    flex: 1,
    backgroundColor: VolpeTheme.colors.background,
  },
  rowAlignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rotatingIcon: {
    transform: [{ rotate: '180deg' }],
  },
  snippetCheckIcon: {
    marginRight: 4,
  },
  bubbleCheckIcon: {
    marginLeft: 4,
  },
  sendIconOffset: {
    marginLeft: 2,
  },
  securityPillIcon: {
    marginRight: 6,
  },

  // 1. Website Portal Messenger (Chats List)
  chatListWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  waHeader: {
    backgroundColor: VolpeTheme.colors.primaryNavy,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  waHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  facultyBadge: {
    backgroundColor: 'rgba(30, 107, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(30, 107, 255, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginLeft: 8,
  },
  facultyBadgeText: {
    color: '#BFDBFE',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  waHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  wsStatusOnline: {
    borderColor: 'rgba(22, 163, 74, 0.5)',
  },
  wsStatusOffline: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  wsStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  wsStatusDotOnline: {
    backgroundColor: '#16A34A',
  },
  wsStatusDotOffline: {
    backgroundColor: '#F59E0B',
  },
  wsStatusText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: VolpeTheme.colors.primary,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Conversations List
  conversationsScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12.5,
    color: VolpeTheme.colors.textMuted,
    fontWeight: '600',
  },
  emptyChatsBox: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: VolpeTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
  },
  emptyChatsSub: {
    fontSize: 12.5,
    color: VolpeTheme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  startNewChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VolpeTheme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 8,
  },
  startNewChatBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  convItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  convAvatarWrap: {
    position: 'relative',
  },
  convAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convMiddleCol: {
    flex: 1,
    gap: 3.5,
  },
  convNameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: VolpeTheme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  convTimeText: {
    fontSize: 11,
    color: VolpeTheme.colors.textMuted,
  },
  convTimeTextUnread: {
    color: VolpeTheme.colors.primary,
    fontWeight: '700',
  },
  studentContextTag: {
    fontSize: 11,
    color: VolpeTheme.colors.primary,
    fontWeight: '600',
  },
  convSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convSnippetText: {
    fontSize: 12.5,
    color: VolpeTheme.colors.textMuted,
    flex: 1,
    marginRight: 6,
  },
  convSnippetTextUnread: {
    color: VolpeTheme.colors.textPrimary,
    fontWeight: '700',
  },
  unreadCountBadge: {
    backgroundColor: VolpeTheme.colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  floatingNewChatBtn: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: VolpeTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: VolpeTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // 2. Active Chat View (Portal Chat Room)
  activeChatWrapper: {
    flex: 1,
    backgroundColor: VolpeTheme.colors.background,
    overflow: 'hidden',
  },
  waChatHeader: {
    backgroundColor: VolpeTheme.colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  waBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderAvatarWrap: {
    position: 'relative',
  },
  chatHeaderAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderAvatarInitials: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatHeaderOnlineDot: {
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
  chatHeaderTitleCol: {
    flex: 1,
  },
  chatHeaderNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatHeaderSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chatHeaderRightBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatWallpaperBackground: {
    flex: 1,
    backgroundColor: VolpeTheme.colors.background,
  },
  chatMessagesScroll: {
    flex: 1,
  },
  chatMessagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  dateSeparatorPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dateSeparatorText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: VolpeTheme.colors.textMuted,
    letterSpacing: 0.5,
  },
  securityPillRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VolpeTheme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.primaryBorder,
    maxWidth: '92%',
  },
  securityPillText: {
    fontSize: 11,
    color: VolpeTheme.colors.primaryHover,
    flexShrink: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  loadingMessagesBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingMessagesText: {
    fontSize: 11.5,
    color: VolpeTheme.colors.textMuted,
  },
  noMessagesContainer: {
    padding: 36,
    alignItems: 'center',
    gap: 6,
  },
  noMessagesText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: VolpeTheme.colors.textPrimary,
  },
  noMessagesSub: {
    fontSize: 11.5,
    color: VolpeTheme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 17,
  },
  bubbleWrapper: {
    width: '100%',
    flexDirection: 'row',
  },
  bubbleWrapperMe: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperOther: {
    justifyContent: 'flex-start',
  },
  bubbleCard: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleCardMe: {
    backgroundColor: VolpeTheme.colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleCardOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 4,
  },
  typingCard: {
    paddingVertical: 7,
  },
  bubbleSenderName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: VolpeTheme.colors.primary,
    marginBottom: 3,
  },
  bubbleBodyText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  bubbleBodyTextMe: {
    color: '#FFFFFF',
  },
  bubbleBodyTextOther: {
    color: VolpeTheme.colors.textPrimary,
  },
  bubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  bubbleTimeText: {
    fontSize: 10.5,
  },
  bubbleTimeTextMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bubbleTimeTextOther: {
    color: VolpeTheme.colors.textMuted,
  },
  typingIndicatorText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: VolpeTheme.colors.primary,
    fontWeight: '600',
  },
  waComposerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  waInputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    gap: 4,
  },
  composerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerTextInput: {
    flex: 1,
    fontSize: 13.5,
    color: VolpeTheme.colors.textPrimary,
    maxHeight: 90,
    paddingVertical: 2,
  },
  waSendRoundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: VolpeTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: VolpeTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  waSendRoundBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  waSendRoundBtnSending: {
    opacity: 0.7,
  },

  // 3. New Chat Modal
  modalFullContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  newChatHeader: {
    backgroundColor: VolpeTheme.colors.primaryNavy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  newChatBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  newChatHeaderSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: VolpeTheme.colors.textPrimary,
    paddingVertical: 0,
  },
  modalContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  modalContactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalContactAvatarOffice: {
    backgroundColor: VolpeTheme.colors.primaryNavy,
  },
  modalContactInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalContactInfoCol: {
    flex: 1,
    gap: 2,
  },
  modalContactName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: VolpeTheme.colors.textPrimary,
  },
  officePillBadge: {
    backgroundColor: VolpeTheme.colors.primaryLight,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.primaryBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  officePillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: VolpeTheme.colors.primary,
  },
  modalContactRole: {
    fontSize: 12,
    color: VolpeTheme.colors.textMuted,
  },
  startingChatOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startingChatText: {
    fontSize: 13,
    fontWeight: '700',
    color: VolpeTheme.colors.primary,
  },

  // Pending Attachment Pill
  pendingAttachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  pendingAttachmentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pendingThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  pendingAttachmentTextWrap: {
    flex: 1,
    gap: 2,
  },
  pendingAttachmentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  pendingAttachmentType: {
    fontSize: 11,
    color: '#3B82F6',
  },
  pendingAttachmentCloseBtn: {
    padding: 6,
  },

  // Emoji Picker Drawer
  emojiPickerContainer: {
    height: 220,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  emojiPickerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiCloseBtn: {
    padding: 4,
  },
  emojiScrollView: {
    flex: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  emojiCell: {
    width: '10%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  composerIconBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },

  // Message Bubble Attachments
  bubbleAttachmentCard: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  bubbleImageBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bubbleImageBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bubbleImagePreview: {
    width: 220,
    height: 140,
    borderRadius: 8,
  },
  bubbleFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 10,
    marginBottom: 6,
  },
  bubbleFileCardMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  bubbleFileCardOther: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fileIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleFileName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  bubbleFileNameMe: {
    color: '#FFFFFF',
  },
  bubbleFileNameOther: {
    color: '#1E293B',
  },
  bubbleFileSize: {
    fontSize: 10.5,
    color: '#94A3B8',
  },

  // Attachment Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  attachmentSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 16,
  },
  attachmentSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  attachmentSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
    textAlign: 'center',
  },
  attachmentOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  attachmentOptionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  attachmentOptionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  attachmentOptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: VolpeTheme.colors.textPrimary,
  },
  presetSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  presetSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
  },
  presetChipEmoji: {
    fontSize: 14,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: VolpeTheme.colors.textPrimary,
  },
  attachmentCancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  attachmentCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
