"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
    onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const pathname = usePathname();
    const { userName, userType } = useAuth();

    // Derive page title from pathname
    const getPageTitle = () => {
        if (pathname === "/") return "Dashboard";
        if (pathname.startsWith("/tasks/edit")) return "Edit Task";

        // Remove leading slash, replace hyphens with spaces, capitalize words
        return pathname
            .slice(1)
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 bg-white/90 backdrop-blur-xl sticky top-0 z-30 shadow-sm shadow-slate-200/40">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-3 lg:gap-5">
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium text-slate-700 leading-none mb-1">
                            {userName || "User"}
                        </p>
                        <Badge
                            variant="outline"
                            className={`h-5 px-1.5 text-[10px] font-semibold tracking-wide uppercase ${
                                userType === "admin"
                                    ? "border-indigo-500/30 text-indigo-700 bg-indigo-50"
                                    : "border-emerald-500/30 text-emerald-700 bg-emerald-50"
                            }`}
                        >
                            {userType || "Guest"}
                        </Badge>
                    </div>

                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                            {getInitials(userName || "User")}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
