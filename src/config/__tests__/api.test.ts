jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, WS_BASE_URL, api, connectChatSocket } from '../api';

describe('Production API Configuration & Client', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('production URLs match volpehub.in specification', () => {
    expect(API_BASE_URL).toBe('https://volpehub.in/api/v1');
    expect(WS_BASE_URL).toBe('wss://volpehub.in/ws/chat/');
    expect(api.defaults.baseURL).toBe('https://volpehub.in/api/v1');
    expect(api.defaults.timeout).toBe(15000);
  });

  test('request interceptor attaches Bearer token from access_token', async () => {
    await AsyncStorage.setItem('access_token', 'test-access-token-jwt');
    const config: any = { headers: {} };
    // Trigger request interceptor handlers
    const handlers = (api.interceptors.request as any).handlers;
    const fulfilled = handlers[0].fulfilled;
    const result = await fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer test-access-token-jwt');
  });

  test('request interceptor fallback attaches token from school_erp_api_token', async () => {
    await AsyncStorage.setItem('school_erp_api_token', 'legacy-school-jwt');
    const config: any = { headers: {} };
    const handlers = (api.interceptors.request as any).handlers;
    const fulfilled = handlers[0].fulfilled;
    const result = await fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer legacy-school-jwt');
  });

  test('response interceptor removes token on 401 error', async () => {
    await AsyncStorage.setItem('access_token', 'expired-token');
    await AsyncStorage.setItem('school_erp_api_token', 'expired-token');

    const handlers = (api.interceptors.response as any).handlers;
    const rejected = handlers[0].rejected;

    const error401 = { response: { status: 401 } };
    await expect(rejected(error401)).rejects.toEqual(error401);

    expect(await AsyncStorage.getItem('access_token')).toBeNull();
    expect(await AsyncStorage.getItem('school_erp_api_token')).toBeNull();
  });

  test('connectChatSocket returns null when no token is stored', async () => {
    const socket = await connectChatSocket();
    expect(socket).toBeNull();
  });
});
