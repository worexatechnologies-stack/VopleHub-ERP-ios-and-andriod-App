import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// In-memory mirror of web localStorage so ALL outer src/services/api.ts
// logic (sync getStoredToken/getStoredUser/getBaseUrl) keeps working
// unchanged in React Native. Hydrate once at startup, writes go through.
let mem: Record<string, string> = {};
let hydrated = false;

const TOKEN_KEY = 'school_erp_api_token';
const USER_KEY = 'school_erp_user_json';
const BASE_URL_KEY = 'school_erp_base_url';

export async function initMobileStorage(): Promise<void> {
  if (hydrated) return;
  try {
    const pairs = await AsyncStorage.multiGet([TOKEN_KEY, 'access_token', USER_KEY, BASE_URL_KEY]);
    for (const [k, v] of pairs) {
      if (v !== null && v !== undefined) mem[k] = v;
    }
    if (mem['access_token'] && !mem[TOKEN_KEY]) {
      mem[TOKEN_KEY] = mem['access_token'];
    }
    // Tokens prefer Keychain/Keystore; migrate any legacy plaintext token once.
    try {
      const { secureTokenStore } = require('./secureTokenStore');
      await secureTokenStore.hydrate();
    } catch {}
  } catch (e) {
    logger.warn('initMobileStorage failed', e);
  }
  hydrated = true;
}

export const memStore = {
  getItem(key: string): string | null {
    return mem[key] ?? null;
  },
  setItem(key: string, value: string): void {
    mem[key] = value;
    AsyncStorage.setItem(key, value).catch(() => {});
  },
  removeItem(key: string): void {
    delete mem[key];
    AsyncStorage.removeItem(key).catch(() => {});
  },
};
