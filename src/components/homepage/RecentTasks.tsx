"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITask } from "@/types";
import { formatDate } from "@/utils/helpers";
import { CheckCircle2, Image as ImageIcon, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentTasksProps {
    tasks: ITask[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
    return (
        <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/50 col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-slate-900">
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4 text-center">
                            No recent tasks to display.
                        </p>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task._id}
                                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                                <div className="mt-1 h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            {task.tasks.length} task
                                            {task.tasks.length > 1 ? "s" : ""}{" "}
                                            completed
                                        </p>
                                        <span className="text-xs text-slate-500 shrink-0">
                                            {formatDate(task.date)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 truncate">
                                        {task.tasks[0]}
                                        {task.tasks.length > 1 && (
                                            <span className="text-slate-500">
                                                {" "}
                                                and {task.tasks.length - 1}{" "}
                                                more...
                                            </span>
                                        )}
                                    </p>

                                    <div className="flex gap-2 mt-3">
                                        {task.images &&
                                            task.images.length > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] border-slate-200 text-slate-600 bg-white"
                                                >
                                                    <ImageIcon className="h-3 w-3 mr-1" />{" "}
                                                    {task.images.length}
                                                </Badge>
                                            )}
                                        {task.driveLink && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] border-slate-200 text-blue-600 bg-white"
                                            >
                                                <Link2 className="h-3 w-3 mr-1" />{" "}
                                                Drive
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
