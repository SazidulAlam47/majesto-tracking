// src/hooks/useAuth.ts
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { verifyTokenClient } from '@/utils/tokenClient';
import {
  getStoredToken,
  getUserType,
  clearAuth,
  setAuthToken,
} from '@/utils/helpers';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'user' | null;
  userName: string | null;
  userId: string | null;
  loading: boolean;
  login: (token: string, type: 'admin' | 'user') => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userName: null,
  userId: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshAuth: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = useCallback(() => {
    const token = getStoredToken();
    const type = getUserType();

    if (token && type) {
      const payload = verifyTokenClient(token);
      if (payload) {
        setIsAuthenticated(true);
        setUserType(type);
        setUserName(payload.name || payload.email || 'User');
        setUserId(payload.id);
      } else {
        clearAuth();
        setIsAuthenticated(false);
        setUserType(null);
        setUserName(null);
        setUserId(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserType(null);
      setUserName(null);
      setUserId(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(
    (token: string, type: 'admin' | 'user') => {
      setAuthToken(token, type);
      refreshAuth();
    },
    [refreshAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    setIsAuthenticated(false);
    setUserType(null);
    setUserName(null);
    setUserId(null);
    router.push('/login');
  }, [router]);

  return {
    isAuthenticated,
    userType,
    userName,
    userId,
    loading,
    login,
    logout,
    refreshAuth,
    children,
  };
}

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
