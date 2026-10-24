import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatConversation, ChatMessage, ChatContact } from '../../../types/communication';
import {
  apiGetChatContacts,
  apiGetConversations,
  apiGetMessages,
  apiSendMessage,
} from '../../../services/schoolApi';
import { POLL_MS } from '../../../utils/constants';
import { useAsyncEffect, useBusy } from '../../../utils/async';
import { chatSocket } from '../../../services/chatSocket';

/** Parent 1-on-1 chat: contacts scoped to wards, thread poll + real-time WebSocket. */
export function useParentChat() {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingMap, setTypingMap] = useState<Record<number, boolean>>({});
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const lastTypingSentRef = useRef<number>(0);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { busy: sending, run: runSend } = useBusy();
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selectedId;

  useAsyncEffect((alive) => {
    apiGetChatContacts().then((c) => alive() && setContacts(c || [])).catch(() => alive() && setContacts([]));
    apiGetConversations().then((c) => {
      if (!alive()) return;
      setConversations(c || []);
      if (c?.length && !selectedRef.current) setSelectedId(c[0].id);
    }).catch(() => alive() && setConversations([]));
  }, []);

  // WebSocket connection lifecycle: connect once, rejoin active conversation on reconnect.
  useEffect(() => {
    chatSocket.connect();
    const unsubStatus = chatSocket.subscribeStatus(() => {
      // Status changes are surfaced via the socket's own listeners below.
    });
    return () => {
      unsubStatus();
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    setOtherUserTyping(false);

    const load = () => apiGetMessages(selectedId).then((m) => alive && setMessages(m || [])).catch(() => {});
    load();
    const t = setInterval(load, POLL_MS.chat);

    // Subscribe to real-time events via the shared chatSocket.
    chatSocket.joinConversation(selectedId);

    const onMessageCreated = (payload: any) => {
      if (!alive) return;
      const convId = payload?.conversationId || payload?.conversation_id || selectedId;
      if (convId !== selectedRef.current) return;

      const newMsg: ChatMessage = {
        id: payload.id,
        conversationId: convId,
        senderId: payload.senderId || payload.sender_id || 0,
        senderName: payload.senderName || payload.sender_name || 'Staff',
        body: payload.body || payload.text || payload.message || '',
        createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
        isRead: Boolean(payload.isRead || payload.read_at),
        isMe: payload.isMe ?? false,
        attachments: payload.attachments || [],
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
      const isTyping = Boolean(data.isTyping);

      if (convId) {
        setTypingMap((prev) => ({ ...prev, [convId]: isTyping }));
        if (convId === Number(selectedRef.current)) {
          setOtherUserTyping(isTyping);
        }
        if (typingTimersRef.current[convId]) {
          clearTimeout(typingTimersRef.current[convId]);
        }
        if (isTyping) {
          typingTimersRef.current[convId] = setTimeout(() => {
            if (alive) {
              setTypingMap((prev) => ({ ...prev, [convId]: false }));
              if (convId === Number(selectedRef.current)) {
                setOtherUserTyping(false);
              }
            }
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

    const unsubRead = chatSocket.on('conversation.read', (payload: any) => {
      if (!alive) return;
      const convId = payload?.conversationId || payload?.conversation_id;
      const isCurrent = !convId || String(convId) === String(selectedRef.current);
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

    return () => {
      alive = false;
      clearInterval(t);
      unsubMessage();
      unsubTyping();
      unsubPresence();
      unsubRead();
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }
      chatSocket.leaveConversation(selectedId);
    };
  }, [selectedId]);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedId) return;
      const now = Date.now();
      if (isTyping) {
        if (now - lastTypingSentRef.current > 2000) {
          chatSocket.sendTyping(selectedId, true);
          lastTypingSentRef.current = now;
        }
        if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = setTimeout(() => {
          if (selectedId) chatSocket.sendTyping(selectedId, false);
        }, 2500);
      } else {
        if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
        chatSocket.sendTyping(selectedId, false);
      }
    },
    [selectedId]
  );

  const send = useCallback(
    async (text: string, attachment?: { uri: string; name: string; type?: string } | null) => {
      if ((!text.trim() && !attachment) || !selectedId) return;
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }
      chatSocket.sendTyping(selectedId, false);

      await runSend(async () => {
        // Message creation stays REST-only; WebSocket is delivery-only.
        const msg = await apiSendMessage(selectedId, text.trim(), undefined, attachment);
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    },
    [selectedId, runSend]
  );

  return {
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
  };
}
