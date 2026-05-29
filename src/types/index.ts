// src/types/index.ts

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  password?: string;
  signature?: string;
  status: 'pending' | 'approved' | 'rejected';
  token?: string;
  type: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  _id: string;
  date: string;
  tasks: string[];
  note?: string;
  images?: string[];
  driveLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  id: string;
  email?: string;
  name?: string;
  type: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalTasks: number;
  totalDays: number;
  totalImages: number;
  recentTasks: ITask[];
  dailyTaskCounts: { date: string; count: number }[];
}

export interface GeminiInsight {
  summary: string;
  currentFocus: string;
  insight: string;
}
