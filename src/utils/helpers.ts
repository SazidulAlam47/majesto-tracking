// src/utils/helpers.ts

export const generateSignature = async (): Promise<string> => {
  const raw = `${navigator.userAgent}${screen.width}${screen.height}${navigator.language}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateShort = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Safe localStorage wrappers to prevent crashes in restricted environments (e.g., incognito)
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Silently fail, it falls back to cookies
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Silently fail
    }
  }
};

export const getStoredToken = (): string | null => {
  let token = safeStorage.getItem('admin_token') || safeStorage.getItem('user_token');
  
  if (!token && typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'admin_token' || name === 'user_token') {
        token = value;
        break;
      }
    }
  }
  
  return token || null;
};

export const getUserType = (): 'admin' | 'user' | null => {
  if (safeStorage.getItem('admin_token')) return 'admin';
  if (safeStorage.getItem('user_token')) return 'user';
  
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name] = cookie.trim().split('=');
      if (name === 'admin_token') return 'admin';
      if (name === 'user_token') return 'user';
    }
  }
  
  return null;
};

export const clearAuth = (): void => {
  safeStorage.removeItem('admin_token');
  safeStorage.removeItem('user_token');
  safeStorage.removeItem('login_request');
  // Clear cookies too
  if (typeof document !== 'undefined') {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

export const setAuthToken = (token: string, type: 'admin' | 'user'): void => {
  const key = type === 'admin' ? 'admin_token' : 'user_token';
  safeStorage.setItem(key, token);
  // Also set as cookie for proxy middleware
  document.cookie = `${key}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
