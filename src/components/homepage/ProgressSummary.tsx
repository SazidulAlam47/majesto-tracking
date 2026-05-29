"use client";

import { Sparkles, TrendingUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GeminiInsight } from "@/types";
import { useEffect, useState } from "react";

interface ProgressSummaryProps {
    insight: GeminiInsight | null;
    loading: boolean;
}

export function ProgressSummary({ insight, loading }: ProgressSummaryProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:col-span-2">
            {/* AI Summary Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm shadow-slate-200/50 overflow-hidden relative card-glow">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24 text-indigo-300" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            AI Progress Summary
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                            </div>
                        ) : (
                            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                {insight?.summary ||
                                    "Keep logging tasks to generate personalized AI insights."}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Current Focus Card */}
            <div className="flex flex-col gap-4">
                <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/50 flex-1">
                    <CardContent className="p-5 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Current Focus
                            </h4>
                        </div>
                        {loading ? (
                            <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse mt-2"></div>
                        ) : (
                            <p className="text-slate-900 font-medium text-lg leading-snug">
                                {insight?.currentFocus ||
                                    "Waiting for more data..."}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/50 flex-1">
                    <CardContent className="p-5 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-amber-400" />
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Key Insight
                            </h4>
                        </div>
                        {loading ? (
                            <div className="h-4 bg-slate-200 rounded w-full animate-pulse mt-2"></div>
                        ) : (
                            <p className="text-slate-600 text-sm">
                                {insight?.insight ||
                                    "Continue working consistently to establish trends."}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
