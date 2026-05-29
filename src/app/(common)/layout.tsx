"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";

export default function CommonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
