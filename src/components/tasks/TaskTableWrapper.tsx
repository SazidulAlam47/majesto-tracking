"use client";

import { useAuth } from "@/hooks/useAuth";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export function TaskTableWrapper() {
    const { userType } = useAuth();
    const router = useRouter();

    return (
        <>
            {userType === "admin" ? (
                <Button
                    onClick={() => router.push("/add-task")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Task
                </Button>
            ) : (
                <Button
                    onClick={() => router.push("/download-report")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                </Button>
            )}
        </>
    );
}
