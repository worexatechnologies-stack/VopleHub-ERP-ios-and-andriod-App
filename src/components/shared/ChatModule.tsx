import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { VolpeTheme } from '../../theme/theme';
import { InitialsAvatar, EmptyState, ModuleHeader, LoadingView, ChatBubble } from '../common';
import type { User as UserType } from '../../types/auth';
import type { ChatConversation, ChatMessage } from '../../types/communication';
import { apiGetConversations, apiGetMessages, apiSendMessage } from '../../services/schoolApi';
import { chatSocket } from '../../services/chatSocket';
import { logger } from '../../utils/logger';
import { validateBoundedText } from '../../utils/validation';
import { getErrorMessage } from '../../utils/alerts';
import { formatPresenceStatus } from '../../utils';

export function ChatModule({
  currentUser,
  onClose,
  initialConversationId,
}: {
  currentUser: UserType;
  onClose: () => void;
  initialConversationId?: number | null;
}) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(initialConversationId ?? 1);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConvId(initialConversationId);
    }
  }, [initialConversationId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTypingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = React.useRef<number>(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const convs = await apiGetConversations();
        if (alive) setConversations(convs);
      } catch (e) {
        logger.warn('conversations fetch failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedConvId) { setMessages([]); return; }
    let alive = true;
    apiGetMessages(selectedConvId)
      .then((m) => alive && setMessages(m || []))
      .catch(() => logger.warn('messages fetch failed'));

    // Subscribe to real-time events via the shared chatSocket.
    chatSocket.connect();
    chatSocket.joinConversation(selectedConvId);

    const onMessageCreated = (payload: any) => {
      if (!alive) return;
      const convId = payload?.conversationId || payload?.conversation_id || selectedConvId;
      if (convId !== selectedConvId) return;
      const newMsg: ChatMessage = {
        id: payload.id,
        conversationId: convId,
        senderId: payload.senderId || payload.sender_id || 0,
        senderName: payload.senderName || payload.sender_name || 'User',
        body: payload.body || payload.text || payload.message || '',
        createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
        isRead: Boolean(payload.isRead || payload.read_at),
        isMe: payload.isMe ?? false,
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    };

    const unsubMessage = chatSocket.on('message.created', onMessageCreated);

    const unsubTyping = chatSocket.on('typing.updated', (payload: any) => {
      if (!alive) return;
      const data = payload || {};
      const convId = Number(data.conversationId);
      if (convId === Number(selectedConvId) && Number(data.userId) !== Number(currentUser.id)) {
        const isTyping = Boolean(data.isTyping);
        setOtherUserTyping(isTyping);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (isTyping) {
          typingTimerRef.current = setTimeout(() => {
            if (alive) setOtherUserTyping(false);
          }, 4000);
        }
      }
    });

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
    });

    const unsubRead = chatSocket.on('conversation.read', (payload: any) => {
      if (!alive) return;
      const convId = payload?.conversationId || payload?.conversation_id;
      const isCurrent = !convId || String(convId) === String(selectedConvId);
      if (isCurrent) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
      if (convId) {
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(convId) && c.lastMessage
              ? { ...c, lastMessage: { ...c.lastMessage, isRead: true }, unreadCount: isCurrent ? 0 : c.unreadCount }
              : c
          )
        );
      }
    });

    return () => {
      alive = false;
      unsubMessage();
      unsubTyping();
      unsubPresence();
      unsubRead();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }
      chatSocket.leaveConversation(selectedConvId);
    };
  }, [selectedConvId]);

  const send = async () => {
    if (!inputText.trim() || !selectedConvId) return;
    // FINDING CHAT-02: client-side bound; server re-validates + rate-limits.
    const invalid = validateBoundedText(inputText, 'Message', 2000);
    if (invalid) {
      Alert.alert('Message too long', invalid);
      return;
    }
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
    if (selectedConvId) chatSocket.sendTyping(selectedConvId, false);

    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      const msg = await apiSendMessage(selectedConvId, text);
      setMessages((prev) => [...prev, msg]);
      const convs = await apiGetConversations();
      setConversations(convs);
    } catch (e: any) {
      setInputText(text);
      Alert.alert('Send failed', getErrorMessage(e, 'Failed sending message'));
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={s.wrap}
    >
      {/* Header — shared ModuleHeader replaces duplicated backBtn/titleBox */}
      <ModuleHeader title="School Messaging" subtitle="Encrypted Direct Channel" onClose={onClose} />

      {/* Conversations Selector */}
      {conversations.length > 0 && (
        <View style={s.convRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={conversations}
            keyExtractor={(c) => String(c.id)}
            renderItem={({ item }) => {
              const isSelected = selectedConvId === item.id;
              const isOnline = item.otherParticipant?.isOnline;
              return (
                <Pressable
                  onPress={() => {
                    setSelectedConvId(item.id);
                    setOtherUserTyping(false);
                  }}
                  style={[s.convChip, isSelected && s.convChipSelected]}
                >
                  <View style={{ position: 'relative' }}>
                    <InitialsAvatar
                      name={item.otherParticipant?.name || (item as any).participantName || `Chat #${item.id}`}
                      size={22}
                      fontSize={10}
                    />
                    {isOnline && <View style={s.chipOnlineDot} />}
                  </View>
                  <Text style={[s.convChipText, isSelected && s.convChipTextSelected]}>
                    {item.otherParticipant?.name || (item as any).participantName || `Chat #${item.id}`}
                  </Text>
                  {(item as any).unreadCount ? (
                    <View style={s.unreadBadge}>
                      <Text style={s.unreadText}>{(item as any).unreadCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Active Conversation Presence Status Header */}
      {(() => {
        const activeConv = conversations.find((c) => c.id === selectedConvId);
        if (!activeConv) return null;
        const other = activeConv.otherParticipant;
        const isOnline = Boolean(other?.isOnline);
        const lastSeen = other?.lastSeenAt;
        const presenceLabel = formatPresenceStatus(isOnline, lastSeen, otherUserTyping);

        return (
          <View style={s.presenceBar}>
            <View style={s.presenceBarLeft}>
              <View style={[s.presenceDot, isOnline && s.presenceDotOnline]} />
              <Text style={s.presenceTargetName} numberOfLines={1}>
                {other?.name || 'Contact'}
              </Text>
            </View>
            <Text
              style={[
                s.presenceStatusText,
                otherUserTyping && s.presenceTextTyping,
                !otherUserTyping && isOnline && s.presenceTextOnline,
              ]}
              numberOfLines={1}
            >
              {presenceLabel}
            </Text>
          </View>
        );
      })()}

      {/* Messages Stream — shared LoadingView + ChatBubble */}
      {loading ? (
        <LoadingView message="Loading conversations..." />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={s.messagesList}
          ListEmptyComponent={
            <EmptyState
              title="No messages yet"
              subtitle="Send a message to start this direct faculty or guardian conversation."
            />
          }
          ListFooterComponent={
            otherUserTyping ? (
              <View style={s.typingBubbleWrap}>
                <View style={s.typingBubble}>
                  <Text style={s.typingText}>typing...</Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser.id;
            return (
              <ChatBubble
                isMe={isMe}
                senderName={item.senderName}
                text={item.body}
                time={item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              />
            );
          }}
        />
      )}

      {/* Input Field */}
      <View style={s.inputBar}>
        <TextInput
          value={inputText}
          onChangeText={(val) => {
            setInputText(val);
            if (selectedConvId) {
              const now = Date.now();
              if (val.trim().length > 0) {
                if (now - lastTypingSentRef.current > 2000) {
                  chatSocket.sendTyping(selectedConvId, true);
                  lastTypingSentRef.current = now;
                }
                if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
                stopTypingTimeoutRef.current = setTimeout(() => {
                  if (selectedConvId) chatSocket.sendTyping(selectedConvId, false);
                }, 2500);
              } else {
                if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
                chatSocket.sendTyping(selectedConvId, false);
              }
            }
          }}
          placeholder="Type a message..."
          placeholderTextColor={VolpeTheme.colors.textLight}
          style={s.input}
        />
        <Pressable onPress={send} disabled={sending} style={s.sendBtn}>
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={s.sendBtnText}>Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: VolpeTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: VolpeTheme.colors.border,
    ...VolpeTheme.shadows.card,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
    borderRadius: VolpeTheme.radius.pill,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: VolpeTheme.colors.primary,
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: VolpeTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: VolpeTheme.colors.textMuted,
  },
  convRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: VolpeTheme.colors.border,
  },
  convChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: VolpeTheme.radius.pill,
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
    marginRight: 8,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
  },
  convChipSelected: {
    backgroundColor: VolpeTheme.colors.primaryLight,
    borderColor: VolpeTheme.colors.primaryBorder,
  },
  convChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: VolpeTheme.colors.textSecondary,
  },
  convChipTextSelected: {
    color: VolpeTheme.colors.primary,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: VolpeTheme.colors.primary,
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  messagesList: {
    padding: 16,
    gap: 10,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: VolpeTheme.colors.textMuted,
    fontSize: 14,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    ...VolpeTheme.shadows.card,
  },
  me: {
    alignSelf: 'flex-end',
    backgroundColor: VolpeTheme.colors.primary,
    borderBottomRightRadius: 4,
  },
  them: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.border,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '800',
    color: VolpeTheme.colors.primary,
    marginBottom: 4,
  },
  meText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  themText: {
    color: VolpeTheme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timestampMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timestampThem: {
    color: VolpeTheme.colors.textLight,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: VolpeTheme.colors.border,
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: VolpeTheme.colors.borderStrong,
    borderRadius: VolpeTheme.radius.pill,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
    color: VolpeTheme.colors.textPrimary,
    backgroundColor: VolpeTheme.colors.surfaceSubtle,
  },
  sendBtn: {
    backgroundColor: VolpeTheme.colors.primary,
    borderRadius: VolpeTheme.radius.pill,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chipOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  presenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  presenceBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  presenceDotOnline: {
    backgroundColor: '#10B981',
  },
  presenceTargetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  presenceStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  presenceTextOnline: {
    color: '#059669',
    fontWeight: '600',
  },
  presenceTextTyping: {
    color: '#059669',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  typingBubbleWrap: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typingText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#059669',
    fontWeight: '600',
  },
});
