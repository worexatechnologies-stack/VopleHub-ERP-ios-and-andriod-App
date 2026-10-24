import { encode as btoaPolyfill } from 'base-64';

// RN Hermes has no btoa. src/services/api.ts uses btoa for mock JWTs.
export function ensureBtoa() {
  const g = globalThis as any;
  if (typeof g.btoa === 'undefined') g.btoa = btoaPolyfill;
  if (typeof g.atob === 'undefined') {
    g.atob = (s: string) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let out = '';
      let i = 0;
      s = s.replace(/[^A-Za-z0-9+/=]/g, '');
      while (i < s.length) {
        const e1 = chars.indexOf(s.charAt(i++));
        const e2 = chars.indexOf(s.charAt(i++));
        const e3 = chars.indexOf(s.charAt(i++));
        const e4 = chars.indexOf(s.charAt(i++));
        const c1 = (e1 << 2) | (e2 >> 4);
        const c2 = ((e2 & 15) << 4) | (e3 >> 2);
        const c3 = ((e3 & 3) << 6) | e4;
        out += String.fromCharCode(c1);
        if (e3 !== 64) out += String.fromCharCode(c2);
        if (e4 !== 64) out += String.fromCharCode(c3);
      }
      return out;
    };
  }
}
