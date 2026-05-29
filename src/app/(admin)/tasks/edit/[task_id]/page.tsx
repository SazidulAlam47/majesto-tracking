"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TaskForm } from "@/components/forms/TaskForm";
import { getTaskById } from "@/services/taskService";
import type { ITask } from "@/types";
import { Button } from "@/components/ui/button";

export default function EditTaskPage() {
    const params = useParams<{ task_id: string | string[] }>();
    const router = useRouter();
    const taskId = Array.isArray(params.task_id)
        ? params.task_id[0]
        : params.task_id;

    const [task, setTask] = useState<ITask | null>(null);
    const [loading, setLoading] = useState(Boolean(taskId));
    const [error, setError] = useState<string | null>(
        taskId ? null : "Task ID is missing",
    );

    useEffect(() => {
        if (!taskId) {
            return;
        }

        const loadTask = async () => {
            try {
                const res = await getTaskById(taskId);
                if (res.success && res.data) {
                    setTask(res.data);
                    setError(null);
                } else {
                    setError(res.error || "Task not found");
                }
            } catch (requestError: unknown) {
                const errorObject = requestError as {
                    response?: { data?: { error?: string } };
                };

                setError(
                    errorObject.response?.data?.error || "Failed to load task",
                );
            } finally {
                setLoading(false);
            }
        };

        loadTask();
    }, [taskId]);

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="space-y-4 max-w-2xl mx-auto">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Edit Daily Task
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {error || "The task could not be loaded."}
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push("/tasks")}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Edit Daily Task
                </h2>
                <p className="text-slate-500 mt-1">
                    Update the date, completed work, notes, and attachments for
                    this task record.
                </p>
            </div>

            <TaskForm initialTask={task} />
        </div>
    );
}
