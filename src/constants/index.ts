// src/constants/index.ts

export const APP_NAME = "Majesto Tracking";
export const OWNER_NAME = "Sazidul Alam";

export const USER_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
} as const;

export const USER_TYPE = {
    ADMIN: "admin",
    USER: "user",
} as const;

export const STORAGE_KEYS = {
    ADMIN_TOKEN: "admin_token",
    USER_TOKEN: "user_token",
    LOGIN_REQUEST: "login_request",
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
} as const;

export const ADMIN_NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { label: "Tasks", href: "/tasks", icon: "ListTodo" },
    { label: "Add Task", href: "/add-task", icon: "PlusCircle" },
    { label: "Users", href: "/users", icon: "Users" },
    { label: "Download Report", href: "/download-report", icon: "FileDown" },
    { label: "Profile", href: "/profile", icon: "UserCircle" },
    { label: "Update Password", href: "/update-password", icon: "KeyRound" },
] as const;

export const USER_NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { label: "Tasks", href: "/tasks", icon: "ListTodo" },
    { label: "Download Report", href: "/download-report", icon: "FileDown" },
    { label: "Profile", href: "/profile", icon: "UserCircle" },
] as const;
