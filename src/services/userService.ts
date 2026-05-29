// src/services/userService.ts
import api from './api';
import type { ApiResponse, IUser } from '@/types';

export const getUsers = async () => {
  const res = await api.get<ApiResponse<IUser[]>>('/users');
  return res.data;
};

export const updateUser = async (id: string, name: string) => {
  const res = await api.patch<ApiResponse<IUser>>(`/users/${id}`, { name });
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete<ApiResponse>(`/users/${id}`);
  return res.data;
};

export const approveUser = async (id: string) => {
  const res = await api.put<ApiResponse<IUser>>(`/users/${id}/approve`);
  return res.data;
};

export const rejectUser = async (id: string) => {
  const res = await api.put<ApiResponse<IUser>>(`/users/${id}/reject`);
  return res.data;
};

export const revokeUserToken = async (id: string) => {
  const res = await api.delete<ApiResponse>(`/users/${id}/token`);
  return res.data;
};
