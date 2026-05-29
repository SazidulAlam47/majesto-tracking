"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDashboardData } from "@/services/taskService";
import { generateDashboardInsight } from "@/app/actions";
import { DashboardStats, GeminiInsight } from "@/types";
import { ProgressSummary } from "@/components/homepage/ProgressSummary";
import { TaskChart } from "@/components/homepage/TaskChart";
import { RecentTasks } from "@/components/homepage/RecentTasks";
import {
    Loader2,
    LayoutDashboard,
    CalendarDays,
    CheckSquare,
    Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [insight, setInsight] = useState<GeminiInsight | null>(null);
    const [loading, setLoading] = useState(true);
    const [insightLoading, setInsightLoading] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getDashboardData();
                if (res.success && res.data) {
                    setStats(res.data);

                    // Generate AI insight in the background
                    if (
                        res.data.recentTasks &&
                        res.data.recentTasks.length > 0
                    ) {
                        setInsightLoading(true);
                        const aiData = await generateDashboardInsight(
                            res.data.recentTasks,
                        );
                        if (aiData) setInsight(aiData);
                        setInsightLoading(false);
                    }
                }
            } catch (error) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium animate-pulse">
                        Loading dashboard metrics...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Dashboard Overview
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Track your internship progress, analyze trends, and view
                        AI-powered insights.
                    </p>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckSquare className="w-16 h-16 text-indigo-300" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Total Tasks Logged
                        </p>
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                            {stats?.totalTasks || 0}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CalendarDays className="w-16 h-16 text-emerald-300" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Active Days
                        </p>
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                            {stats?.totalDays || 0}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-16 h-16 text-pink-300" />
                    </div>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Assets Uploaded
                        </p>
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                            {stats?.totalImages || 0}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ProgressSummary insight={insight} loading={insightLoading} />
                <TaskChart data={stats?.dailyTaskCounts || []} />
                <RecentTasks tasks={stats?.recentTasks || []} />
            </div>
        </div>
    );
}
