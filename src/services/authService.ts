// src/services/authService.ts
import api from './api';
import type { ApiResponse, IUser } from '@/types';

export const adminLogin = async (email: string, password: string) => {
  const res = await api.post<ApiResponse<{ token: string; user: IUser }>>(
    '/auth/admin-login',
    { email, password }
  );
  return res.data;
};

export const requestLogin = async (name: string, signature: string) => {
  const res = await api.post<ApiResponse<{ user: IUser }>>(
    '/auth/request-login',
    { name, signature }
  );
  return res.data;
};

export const checkStatus = async (signature: string) => {
  const res = await api.get<
    ApiResponse<{ status: string; token?: string }>
  >(`/auth/check-status?signature=${signature}`);
  return res.data;
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const res = await api.put<ApiResponse>('/auth/update-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return res.data;
};
