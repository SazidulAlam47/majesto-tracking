"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface TaskChartProps {
    data: { date: string; count: number }[];
}

export function TaskChart({ data }: TaskChartProps) {
    // Format dates for display
    const chartData = data
        .map((item) => ({
            ...item,
            displayDate: format(parseISO(item.date), "MMM dd"),
        }))
        .reverse(); // Assuming API returns desc, we want chronological order for chart

    return (
        <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/50 col-span-1 lg:col-span-2 overflow-hidden">
            <CardHeader>
                <CardTitle className="text-slate-900">
                    Productivity Trend
                </CardTitle>
                <CardDescription className="text-slate-500">
                    Tasks completed over the last 7 active days
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full mt-4" style={{ minHeight: "300px" }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="displayDate"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: "#f1f5f9" }}
                                contentStyle={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "0.5rem",
                                    color: "#0f172a",
                                }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            index === chartData.length - 1
                                                ? "#8b5cf6"
                                                : "#6366f1"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
