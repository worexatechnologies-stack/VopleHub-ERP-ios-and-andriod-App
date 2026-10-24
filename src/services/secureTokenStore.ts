/**
 * Secure token storage (Keychain/Keystore) with in-memory + AsyncStorage fallback.
 * Tokens MUST NOT live in plaintext long-term storage when secure hardware store exists.
 * No new dependency: uses installed react-native-keychain, guarded by try/catch.
 */
import { memStore } from './memoryStore';

const TOKEN_KEY = 'school_erp_api_token';
const TOKEN_SERVICE = 'school-erp-auth-token';

let cachedToken: string | null | undefined;

async function readSecureToken(): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Keychain = require('react-native-keychain');
    const get = Keychain?.getGenericPassword ?? Keychain?.default?.getGenericPassword;
    if (typeof get !== 'function') return null;
    const creds = await get({ service: TOKEN_SERVICE });
    if (creds && typeof creds.password === 'string') return creds.password;
    return null;
  } catch {
    return null;
  }
}

async function writeSecureToken(token: string | null): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Keychain = require('react-native-keychain');
    const set = Keychain?.setGenericPassword ?? Keychain?.default?.setGenericPassword;
    const reset = Keychain?.resetGenericPassword ?? Keychain?.default?.resetGenericPassword;
    if (token == null) {
      if (typeof reset === 'function') await reset({ service: TOKEN_SERVICE });
      return;
    }
    if (typeof set === 'function') {
      await set('session', token, { service: TOKEN_SERVICE });
    }
  } catch {}
}

export const secureTokenStore = {
  /** Sync read for the request path: memory cache, else legacy store (migration). */
  get(): string | null {
    if (cachedToken) return cachedToken;
    const token = memStore.getItem(TOKEN_KEY) || memStore.getItem('access_token');
    if (token) {
      cachedToken = token;
      return token;
    }
    return null;
  },
  /** Prefer secure write; always mirror to legacy store until migration completes. */
  set(token: string | null): void {
    cachedToken = token;
    if (token == null) {
      memStore.removeItem(TOKEN_KEY);
      memStore.removeItem('access_token');
    } else {
      memStore.setItem(TOKEN_KEY, token);
      memStore.setItem('access_token', token);
    }
    void writeSecureToken(token);
  },
  /** Hydrate cache: secure store first, legacy fallback (one-time migration). */
  async hydrate(): Promise<void> {
    try {
      const secured = await readSecureToken();
      if (secured) {
        cachedToken = secured;
        memStore.setItem(TOKEN_KEY, secured);
        memStore.setItem('access_token', secured);
        return;
      }
    } catch {}
    cachedToken = memStore.getItem(TOKEN_KEY) || memStore.getItem('access_token');
    if (cachedToken) {
      memStore.setItem('access_token', cachedToken);
    }
  },
  async clear(): Promise<void> {
    cachedToken = null;
    memStore.removeItem(TOKEN_KEY);
    memStore.removeItem('access_token');
    await writeSecureToken(null);
  },
};
