// src/utils/tokenClient.ts
// Client-side JWT decoder (no verification — just decode the payload)
// Full verification happens server-side; this is for UI state only

import type { AuthPayload } from '@/types';

export function verifyTokenClient(token: string): AuthPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload as AuthPayload;
  } catch {
    return null;
  }
}
