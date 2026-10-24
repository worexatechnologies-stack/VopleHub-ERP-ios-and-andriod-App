jest.mock('../secureTokenStore', () => ({
  secureTokenStore: { get: jest.fn(), set: jest.fn(), clear: jest.fn(), hydrate: jest.fn() },
}));

(global as any).__DEV__ = true;

import { secureTokenStore } from '../secureTokenStore';
import { chatSocket, ChatSocketStatus } from '../chatSocket';

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = MockWebSocket.CONNECTING;
  onopen: any = null;
  onmessage: any = null;
  onclose: any = null;
  closedByCode: number | null = null;
  messages: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) { this.messages.push(data); }
  close(code?: number) {
    this.readyState = MockWebSocket.CLOSED;
    this.closedByCode = code ?? null;
    if (this.onclose) this.onclose({ code: code ?? 1000, reason: '', wasClean: true });
  }
  simulateOpen() { this.readyState = MockWebSocket.OPEN; if (this.onopen) this.onopen({}); }
  simulateMessage(data: string) { if (this.onmessage) this.onmessage({ data }); }
  simulateClose(code = 1000) {
    this.readyState = MockWebSocket.CLOSED;
    this.closedByCode = code;
    if (this.onclose) this.onclose({ code, reason: '', wasClean: true });
  }
}

(global as any).WebSocket = MockWebSocket;

async function flush(): Promise<void> { return new Promise(r => setTimeout(r, 0)); }

async function connectAndOpen(): Promise<MockWebSocket> {
  chatSocket.connect();
  await flush();
  const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  ws.simulateOpen();
  await flush();
  return ws;
}

describe('ChatSocketClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chatSocket.disconnect();
    (secureTokenStore.get as jest.Mock).mockReturnValue('test-jwt-token');
    MockWebSocket.instances = [];
  });

  afterEach(() => chatSocket.disconnect());

  test('minimal: connect and open', async () => {
    const ws = await connectAndOpen();
    expect(chatSocket.getStatus()).toBe('connected');
    expect(ws.url).toContain('?token=test-jwt-token');
  });

  describe('Authentication', () => {
    test('connect does not open socket when no token is stored', async () => {
      (secureTokenStore.get as jest.Mock).mockReturnValue(null);
      const statuses: ChatSocketStatus[] = [];
      const unsub = chatSocket.subscribeStatus((s) => statuses.push(s));

      const result = chatSocket.connect();
      await result;
      await flush();

      expect(chatSocket.getStatus()).toBe('disconnected');
      expect(MockWebSocket.instances).toHaveLength(0);
      unsub();
    });

    test('connect opens socket with ?token= query param when token stored', async () => {
      const ws = await connectAndOpen();

      expect(chatSocket.getStatus()).toBe('connected');
      expect(MockWebSocket.instances.length).toBe(1);
      expect(ws.url).toContain('?token=test-jwt-token');
    });
  });

  describe('Event envelope unwrapping', () => {
    let ws: MockWebSocket;

    beforeEach(async () => {
      ws = await connectAndOpen();
    });

    test('unwraps { type, eventId, createdAt, data } envelope and emits payload', async () => {
      const received: any[] = [];
      const unsub = chatSocket.on('message.created', (payload) => received.push(payload));

      const envelope = {
        type: 'message.created',
        eventId: 'evt-123',
        createdAt: '2026-01-01T00:00:00Z',
        data: {
          id: 42,
          conversationId: 7,
          body: 'Hello',
          senderId: 1,
          senderName: 'Teacher',
          isMe: false,
        },
      };
      ws.simulateMessage(JSON.stringify(envelope));
      await flush();

      expect(received).toHaveLength(1);
      expect(received[0].id).toBe(42);
      expect(received[0].body).toBe('Hello');
      expect(received[0].eventId).toBeUndefined();
      unsub();
    });

    test('emits raw envelope on wildcard * listener', async () => {
      const received: any[] = [];
      const unsub = chatSocket.on('*', (env) => received.push(env));

      ws.simulateMessage(
        JSON.stringify({ type: 'connection.ready', eventId: 'evt-1', data: { userId: 1 } })
      );
      await flush();

      expect(received[0].type).toBe('connection.ready');
      expect(received[0].eventId).toBe('evt-1');
      unsub();
    });

    test('passes through non-envelope messages (data undefined)', async () => {
      const received: any[] = [];
      const unsub = chatSocket.on('typing.updated', (payload) => received.push(payload));

      ws.simulateMessage(
        JSON.stringify({ type: 'typing.updated', conversationId: 7, userId: 1, isTyping: true })
      );
      await flush();

      expect(received[0].conversationId).toBe(7);
      expect(received[0].isTyping).toBe(true);
      unsub();
    });
  });

  describe('Deduplication', () => {
    let ws: MockWebSocket;

    beforeEach(async () => {
      ws = await connectAndOpen();
    });

    test('drops duplicate eventId for the same event type', async () => {
      const received: any[] = [];
      const unsub = chatSocket.on('message.created', (payload) => received.push(payload));

      const envelope = {
        type: 'message.created',
        eventId: 'evt-dup',
        data: { id: 1, conversationId: 7, body: 'Hi', senderId: 1, senderName: 'A', isMe: false },
      };
      ws.simulateMessage(JSON.stringify(envelope));
      ws.simulateMessage(JSON.stringify(envelope));
      await flush();

      expect(received).toHaveLength(1);
      unsub();
    });

    test('does not treat same eventId across different event types as duplicate', async () => {
      const received: any[] = [];
      chatSocket.on('message.created', (payload) => received.push({ kind: 'msg', id: payload.id }));
      chatSocket.on('conversation.read', (payload) => received.push({ kind: 'read', id: payload.conversationId }));

      ws.simulateMessage(
        JSON.stringify({ type: 'message.created', eventId: 'evt-x', data: { id: 1, conversationId: 7, body: 'Hi', senderId: 1, senderName: 'A', isMe: false } })
      );
      ws.simulateMessage(
        JSON.stringify({ type: 'conversation.read', eventId: 'evt-x', data: { conversationId: 7, userId: 1, readAt: 'now' } })
      );
      await flush();

      expect(received).toHaveLength(2);
    });
  });

  describe('Reconnection', () => {
    test('transitions to disconnected on unexpected close', async () => {
      const ws = await connectAndOpen();

      ws.simulateClose(1006);
      await flush();

      expect(chatSocket.getStatus()).toBe('disconnected');
      expect(ws.closedByCode).toBe(1006);
    });

    test('does not reconnect on 4001 (unauthorized)', async () => {
      const ws = await connectAndOpen();

      ws.simulateClose(4001);
      await flush();

      expect(chatSocket.getStatus()).toBe('disconnected');
      expect(MockWebSocket.instances.length).toBe(1);
    });
  });

  describe('Send actions', () => {
    let ws: MockWebSocket;

    beforeEach(async () => {
      ws = await connectAndOpen();
    });

    test('sendAction sends JSON action when socket is open', () => {
      chatSocket.sendAction('ping', {});
      expect(ws.messages).toContain(JSON.stringify({ action: 'ping' }));
    });

    test('joinConversation sends join_conversation and sets activeConversationId', () => {
      chatSocket.joinConversation(7);
      expect(chatSocket.activeConversationId).toBe(7);
      expect(ws.messages).toContain(
        JSON.stringify({ action: 'join_conversation', conversationId: 7 })
      );
    });

    test('markConversationRead sends mark_read', () => {
      chatSocket.markConversationRead(7);
      expect(ws.messages).toContain(
        JSON.stringify({ action: 'mark_read', conversationId: 7 })
      );
    });

    test('sendTyping sends typing.start/stop', () => {
      chatSocket.sendTyping(7, true);
      expect(ws.messages).toContain(
        JSON.stringify({ action: 'typing.start', conversationId: 7, isTyping: true })
      );
      chatSocket.sendTyping(7, false);
      expect(ws.messages).toContain(
        JSON.stringify({ action: 'typing.stop', conversationId: 7, isTyping: false })
      );
    });

    test('sendAction is no-op when socket is not open', () => {
      ws.readyState = MockWebSocket.CLOSED;
      const beforeLen = ws.messages.length;
      chatSocket.sendAction('ping', {});
      expect(ws.messages.length).toBe(beforeLen);
    });
  });

  describe('Cleanup', () => {
    test('disconnect closes socket and clears timers', async () => {
      const ws = await connectAndOpen();

      chatSocket.disconnect();
      expect(ws.closedByCode).toBe(1000);
      expect(chatSocket.getStatus()).toBe('disconnected');
      expect(chatSocket.socket).toBeNull();
    });

    test('on() returns unsubscribe that removes listener', async () => {
      const ws = await connectAndOpen();

      const received: any[] = [];
      const unsub = chatSocket.on('message.created', (payload) => received.push(payload));
      unsub();

      ws.simulateMessage(
        JSON.stringify({
          type: 'message.created',
          data: { id: 1, conversationId: 7, body: 'Hi', senderId: 1, senderName: 'A', isMe: false },
        })
      );
      await flush();

      expect(received).toHaveLength(0);
    });

    test('subscribeStatus returns unsubscribe', async () => {
      await connectAndOpen();
      const statuses: ChatSocketStatus[] = [];
      const unsub = chatSocket.subscribeStatus((s) => statuses.push(s));
      unsub();

      chatSocket.disconnect();
      expect(statuses.length).toBe(1);
    });
  });
});