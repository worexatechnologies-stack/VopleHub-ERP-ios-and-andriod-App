/**
 * Real-Time WebSocket Client for VolpeHub Mobile App (React Native)
 * Features: auto-reconnect with exponential backoff, event deduplication,
 * heartbeat ping, connection status subscriptions, and multi-store token resolution.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureTokenStore } from './secureTokenStore';
import { logger } from '../utils/logger';
import { DEFAULT_WS_BASE_URL } from '../utils/constants';

export type ChatSocketStatus = 'connected' | 'connecting' | 'disconnected';

export interface ChatSocketMessageEvent {
  id: number;
  uuid?: string;
  conversationId: number;
  senderId: number;
  senderName: string;
  recipientId: number;
  recipientName: string;
  isMe: boolean;
  body: string;
  messageType?: string;
  clientKey?: string;
  replyToId?: number;
  editedAt?: string;
  isDeleted?: boolean;
  attachments?: Array<{
    id: string;
    originalName: string;
    contentType: string;
    fileSize: number;
    downloadUrl: string;
  }>;
  createdAt: string;
  readAt?: string | null;
}

export interface TypingUpdatedEvent {
  conversationId: number;
  userId: number;
  userName?: string;
  isTyping: boolean;
}

export interface UserPresenceEvent {
  userId: number;
  isOnline: boolean;
  lastSeenAt: string;
}

export interface ConversationReadEvent {
  conversationId: number;
  userId: number;
  readAt: string;
}

export interface UnreadCountUpdatedEvent {
  totalUnread: number;
  conversationId?: number;
  conversationUnread?: number;
}

export interface ServerEnvelope {
  type: string;
  eventId?: string;
  createdAt?: string;
  data?: any;
}

type EventListener = (payload: any) => void;
type StatusListener = (status: ChatSocketStatus) => void;

class ChatSocketClient {
  private socket: WebSocket | null = null;
  private status: ChatSocketStatus = 'disconnected';
  public activeConversationId: number | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private statusListeners: Set<StatusListener> = new Set();
  private isIntentionallyClosed = false;
  private processedEventIds: Set<string> = new Set();
  private processedEventTimestamps: Array<{ key: string; time: number }> = [];
  private isConnecting = false;

  public getStatus(): ChatSocketStatus {
    return this.status;
  }

  private setStatus(status: ChatSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach((listener) => {
        try {
          listener(status);
        } catch (e) {
          logger.warn('[ChatSocket] Status listener error', e);
        }
      });
    }
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public on(event: string, listener: EventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  public off(event: string, listener: EventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(event: string, payload: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          logger.warn('[ChatSocket] Listener error for ' + event, e);
        }
      });
    }
  }

  private isDuplicateEvent(eventType: string, data: any): boolean {
    const rawId =
      data?.eventId ||
      (data?.data && data.data.eventId) ||
      (eventType === 'message.created' && (data?.id || (data?.data && data.data.id)));
    if (!rawId) return false;

    const key = eventType + ':' + rawId;
    const now = Date.now();
    const cutoff = now - 5 * 60 * 1000;
    this.processedEventTimestamps = this.processedEventTimestamps.filter((e) => e.time > cutoff);

    if (this.processedEventIds.has(key)) return true;

    this.processedEventIds.add(key);
    this.processedEventTimestamps.push({ key, time: now });
    if (this.processedEventTimestamps.length > 1000) {
      const oldest = this.processedEventTimestamps.shift();
      if (oldest) this.processedEventIds.delete(oldest.key);
    }
    return false;
  }

  private async resolveToken(): Promise<string | null> {
    let token = secureTokenStore.get();
    if (token) return token;

    try {
      token =
        (await AsyncStorage.getItem('school_erp_api_token')) ||
        (await AsyncStorage.getItem('access_token')) ||
        (await AsyncStorage.getItem('token'));
      if (token) {
        secureTokenStore.set(token);
        return token;
      }
    } catch {}

    return null;
  }

  public async connect(): Promise<void> {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.isConnecting) return;

    this.isIntentionallyClosed = false;
    this.isConnecting = true;
    this.setStatus('connecting');

    const token = await this.resolveToken();
    if (!token) {
      logger.warn('[ChatSocket] No auth token found. Cannot connect WebSocket.');
      this.setStatus('disconnected');
      this.isConnecting = false;
      return;
    }

    const wsUrl = `${DEFAULT_WS_BASE_URL}?token=${encodeURIComponent(token)}`;
    console.log('[ChatSocket] Connecting WebSocket to:', wsUrl);

    try {
      const socket = new WebSocket(wsUrl);
      this.socket = socket;

      socket.onopen = () => {
        console.log('[ChatSocket] WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.startHeartbeat();

        if (this.activeConversationId) {
          this.joinConversation(this.activeConversationId);
        }
      };

      socket.onmessage = (event: any) => {
        try {
          const parsed = JSON.parse(event.data) as ServerEnvelope;
          const eventType = parsed.type;
          if (eventType) {
            if (this.isDuplicateEvent(eventType, parsed)) return;
            const payload = parsed.data !== undefined ? parsed.data : parsed;
            this.emit(eventType, payload);
            this.emit('*', parsed);
          }
        } catch (err) {
          logger.warn('[ChatSocket] Failed to parse message', err);
        }
      };

      socket.onclose = (event: any) => {
        console.log('[ChatSocket] WebSocket closed (code: ' + (event ? event.code : 'none') + ')');
        this.isConnecting = false;
        this.stopHeartbeat();
        if (this.socket === socket) {
          this.socket = null;
        }
        this.setStatus('disconnected');

        if (event && (event.code === 4001 || event.code === 4003)) {
          this.isIntentionallyClosed = true;
          return;
        }
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      socket.onerror = (err: any) => {
        logger.warn('[ChatSocket] WebSocket error', err);
        this.isConnecting = false;
        try {
          socket.close();
        } catch {}
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      try {
        this.socket.close(1000);
      } catch {}
      this.socket = null;
    }
    this.setStatus('disconnected');
  }

  public sendAction(action: string, payload: Record<string, any> = {}): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...payload }));
    } else {
      this.connect();
    }
  }

  public markConversationRead(conversationId: number): void {
    this.sendAction('mark_read', { conversationId });
  }

  public joinConversation(conversationId: number): void {
    this.activeConversationId = conversationId;
    this.sendAction('join_conversation', { conversationId });
  }

  public leaveConversation(conversationId: number): void {
    this.sendAction('leave_conversation', { conversationId });
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
  }

  public sendTyping(conversationId: number, isTyping: boolean): void {
    this.sendAction(isTyping ? 'typing.start' : 'typing.stop', {
      conversationId,
      isTyping,
    });
  }
}

export const chatSocket = new ChatSocketClient();
