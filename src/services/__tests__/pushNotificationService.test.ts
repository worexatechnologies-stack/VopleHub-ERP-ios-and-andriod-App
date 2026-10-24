jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    Version: 33,
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    request: jest.fn().mockResolvedValue('granted'),
  },
  NativeModules: {
    NativeNotification: {
      displayNotification: jest.fn(),
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('../schoolApi', () => ({
  apiRegisterFCMDevice: jest.fn().mockResolvedValue({ success: true }),
  apiUnregisterFCMDevice: jest.fn().mockResolvedValue({ success: true }),
  getStoredToken: jest.fn().mockReturnValue('mock_jwt_token_for_tests'),
}));

jest.mock('../chatSocket', () => ({
  chatSocket: {
    connect: jest.fn(),
    on: jest.fn().mockReturnValue(() => {}),
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn().mockReturnValue({}),
  hasPermission: jest.fn().mockResolvedValue(1),
  requestPermission: jest.fn().mockResolvedValue(1),
  getToken: jest.fn().mockResolvedValue('fcm_mocked_token_from_firebase_messaging'),
  onMessage: jest.fn().mockReturnValue(() => {}),
  onNotificationOpenedApp: jest.fn().mockReturnValue(() => {}),
  getInitialNotification: jest.fn().mockResolvedValue(null),
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
}));

(global as any).__DEV__ = true;

import { pushNotificationService, PushNotificationPayload } from '../pushNotificationService';

describe('pushNotificationService', () => {
  it('generates an opaque, compliant FCM token representation', async () => {
    const token = await pushNotificationService.getOrGenerateToken();
    expect(token).toBeDefined();
    expect(token.startsWith('fcm_')).toBe(true);
    expect(token.length).toBeGreaterThan(20);
  });

  it('dispatches foreground notifications to active listeners', (done) => {
    const mockPayload: PushNotificationPayload = {
      title: 'New Message from Sarah',
      body: 'Hello, please review the assignment.',
      data: {
        type: 'chat_message',
        conversationId: 42,
      },
    };

    const unsub = pushNotificationService.onForegroundNotification((payload) => {
      expect(payload.title).toBe(mockPayload.title);
      expect(payload.data?.conversationId).toBe(42);
      unsub();
      done();
    });

    pushNotificationService.dispatchForegroundNotification(mockPayload);
  });

  it('dispatches notification tap and routes to navigation subscribers', (done) => {
    const mockPayload: PushNotificationPayload = {
      title: 'Annual Sports Meet',
      body: 'Event scheduled for next Friday.',
      data: {
        type: 'event',
        eventId: 101,
      },
    };

    const unsub = pushNotificationService.onNotificationTap((payload) => {
      expect(payload.data?.type).toBe('event');
      expect(payload.data?.eventId).toBe(101);
      unsub();
      done();
    });

    pushNotificationService.dispatchNotificationTap(mockPayload);
  });

  it('registers device with backend on registerDevice()', async () => {
    const res = await pushNotificationService.registerDevice(1001);
    expect(res).toBe(true);
  });

  it('triggers local push notification for events and broadcasts', (done) => {
    const { NativeModules } = require('react-native');
    const mockEventPayload: PushNotificationPayload = {
      title: 'New Campus Event: Science Exhibition',
      body: 'Science Exhibition is scheduled for Nov 10 at Main Hall.',
      data: {
        type: 'event',
        eventId: 501,
        title: 'Science Exhibition',
      },
    };

    const unsub = pushNotificationService.onForegroundNotification((payload) => {
      expect(payload.title).toContain('Science Exhibition');
      expect(payload.data?.type).toBe('event');
      expect(NativeModules.NativeNotification.displayNotification).toHaveBeenCalledWith(
        mockEventPayload.title,
        mockEventPayload.body,
        mockEventPayload.data
      );
      unsub();
      done();
    });

    pushNotificationService.triggerLocalPushNotification(mockEventPayload);
  });
});

