"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_NAV_ITEMS, USER_NAV_ITEMS, OWNER_NAME } from "@/constants";
import {
    LayoutDashboard,
    ListTodo,
    PlusCircle,
    Users,
    FileDown,
    UserCircle,
    KeyRound,
    LogOut,
    X,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Map icon names from constants to Lucide components
const iconMap: Record<string, React.ElementType> = {
    LayoutDashboard,
    ListTodo,
    PlusCircle,
    Users,
    FileDown,
    UserCircle,
    KeyRound,
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { userType, logout } = useAuth();

    // Handle escape key to close sidebar on mobile
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const navItems = userType === "admin" ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-70 flex flex-col overflow-hidden bg-slate-950/95 text-slate-100 border-r border-slate-800/70 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.98))] pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-px bg-white/5 pointer-events-none" />

                {/* Logo Area */}
                <div className="relative z-10 shrink-0">
                    <div className="h-16 flex items-center justify-between px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-3 group"
                            onClick={() =>
                                window.innerWidth < 1024 && onClose()
                            }
                        >
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-indigo-500/35">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-lg text-white tracking-tight">
                                Majesto Tracking
                            </span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-white lg:hidden transition-colors rounded-lg hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 relative z-10 custom-scrollbar">
                    <div className="mb-4 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.24em]">
                        Menu
                    </div>

                    {navItems.map((item) => {
                        const Icon = iconMap[item.icon];
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() =>
                                    window.innerWidth < 1024 && onClose()
                                }
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${
                                    isActive
                                        ? "text-white font-medium bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_-16px_rgba(99,102,241,0.9)] ring-1 ring-white/10"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-white/6 hover:ring-1 hover:ring-white/8"
                                }`}
                            >
                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-indigo-400 to-purple-500 rounded-l-xl" />
                                )}

                                <Icon
                                    className={`w-5 h-5 transition-colors ${
                                        isActive
                                            ? "text-indigo-300"
                                            : "text-slate-500 group-hover:text-slate-300"
                                    }`}
                                />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Logout Area */}
                <div className="relative z-10 shrink-0 bg-linear-to-t from-slate-950/90 to-transparent">
                    <div className="h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
                    <div className="p-4">
                        <Button
                            variant="ghost"
                            onClick={logout}
                            className="w-full justify-start rounded-xl border bg-white/5 px-3 text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-200"
                            style={{ borderColor: "rgb(51 65 85 / 0.8)" }}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </Button>
                        <div className="mt-4 px-3 flex items-center justify-between text-[11px] text-slate-500">
                            <span>© 2026 {OWNER_NAME}</span>
                            <span>v0.1.0</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
