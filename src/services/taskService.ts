// src/services/taskService.ts
import api from "./api";
import type {
    ApiResponse,
    ITask,
    PaginatedResponse,
    DashboardStats,
} from "@/types";
import type { CreateTaskInput } from "@/schemas/task";

export const getTasks = async (
    page: number = 1,
    limit: number = 10,
    from?: string,
    to?: string,
) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await api.get<PaginatedResponse<ITask>>(`/tasks?${params}`);
    return res.data;
};

export const createTask = async (data: CreateTaskInput) => {
    const res = await api.post<ApiResponse<ITask>>("/tasks", data);
    return res.data;
};

export const getTaskById = async (id: string) => {
    const res = await api.get<ApiResponse<ITask>>(`/tasks/${id}`);
    return res.data;
};

export const updateTask = async (
    id: string,
    data: Partial<CreateTaskInput>,
) => {
    const res = await api.put<ApiResponse<ITask>>(`/tasks/${id}`, data);
    return res.data;
};

export const deleteTask = async (id: string) => {
    const res = await api.delete<ApiResponse>(`/tasks/${id}`);
    return res.data;
};

export const getDashboardData = async () => {
    const res = await api.get<ApiResponse<DashboardStats>>("/dashboard");
    return res.data;
};
