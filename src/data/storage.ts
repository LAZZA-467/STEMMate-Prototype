/**
 * Safe local storage utility for offline data persistence
 * Ensures zero-data-loss and prevents crashes if storage quota is exceeded or unavailable.
 */

export const safeStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
      const raw = window.localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[safeStorage] Could not read ${key} from localStorage:`, e);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[safeStorage] Could not write ${key} to localStorage:`, e);
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Could not remove ${key} from localStorage:`, e);
    }
  },
};
