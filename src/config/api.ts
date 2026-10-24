import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { secureTokenStore } from '../services/secureTokenStore';

export const API_BASE_URL = 'https://volpehub.in/api/v1';
export const WS_BASE_URL = 'wss://volpehub.in/ws/chat/';

/**
 * Production Axios REST API Client
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach Bearer token to all outgoing requests
api.interceptors.request.use(async (config) => {
  try {
    const token =
      secureTokenStore.get() ||
      (await AsyncStorage.getItem('access_token')) ||
      (await AsyncStorage.getItem('school_erp_api_token'));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Failed to retrieve auth token for request', err);
  }
  return config;
});

type AuthExpiryListener = () => void;
const authExpiryListeners: Set<AuthExpiryListener> = new Set();

export function onAuthExpired(fn: AuthExpiryListener): () => void {
  authExpiryListeners.add(fn);
  return () => authExpiryListeners.delete(fn);
}

function notifyAuthExpired() {
  authExpiryListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

// Auto-handle 401 token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove([
          'access_token',
          'school_erp_api_token',
        ]);
        secureTokenStore.clear().catch(() => {});
      } catch (err) {
        console.warn('Failed to clear expired auth session', err);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Real-Time WebSocket Connection to Daphne on volpehub.in
 */
export async function connectChatSocket(onMessage?: (data: any) => void): Promise<WebSocket | null> {
  const token =
    secureTokenStore.get() ||
    (await AsyncStorage.getItem('access_token')) ||
    (await AsyncStorage.getItem('school_erp_api_token'));
  if (!token) {
    console.warn('No access token available for WebSocket connection');
    return null;
  }

  const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('Connected to VolpeHub production WebSocket');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Real-time event received:', data);
      if (onMessage) {
        onMessage(data);
      }
    } catch {
      console.log('Real-time raw event received:', event.data);
      if (onMessage) {
        onMessage({ raw: event.data });
      }
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = (event) => {
    console.log(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason || 'none'})`);
  };

  return socket;
}
