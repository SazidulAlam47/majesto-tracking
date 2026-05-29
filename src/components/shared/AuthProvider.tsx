'use client';

import { AuthProvider as AuthProviderHook, AuthContext } from '@/hooks/useAuth';
import { ReactNode, createElement } from 'react';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const auth = AuthProviderHook({ children: null });
  // Omit children from the value we provide
  const { children: _children, ...authValue } = auth as any;

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}
