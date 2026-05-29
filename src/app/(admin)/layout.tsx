"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { userType, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && userType !== "admin") {
            router.push("/");
        }
    }, [userType, loading, router]);

    if (loading || userType !== "admin") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium">
                        Verifying admin access...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
