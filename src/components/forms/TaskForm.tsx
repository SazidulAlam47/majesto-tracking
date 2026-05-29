"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    CalendarIcon,
    Plus,
    Trash2,
    Save,
    Loader2,
    Link2,
    FileText,
    CheckCircle2,
    ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";
import { createTask } from "@/services/taskService";
import { CreateTaskInput } from "@/schemas/task";

export function TaskForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const [tasks, setTasks] = useState<string[]>([""]);
    const [note, setNote] = useState("");
    const [driveLink, setDriveLink] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const handleTaskChange = (index: number, value: string) => {
        const newTasks = [...tasks];
        newTasks[index] = value;
        setTasks(newTasks);
    };

    const addTaskRow = () => {
        if (tasks.length < 20) {
            setTasks([...tasks, ""]);
        } else {
            toast.error("Maximum 20 tasks allowed per day");
        }
    };

    const removeTaskRow = (index: number) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty tasks
        const validTasks = tasks
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        if (validTasks.length === 0) {
            toast.error("Please enter at least one task");
            return;
        }

        if (!date) {
            toast.error("Please select a date");
            return;
        }

        setLoading(true);
        const payload: CreateTaskInput = {
            date: date.toISOString(),
            tasks: validTasks,
            note: note.trim() || undefined,
            driveLink: driveLink.trim() || undefined,
            images: images.length > 0 ? images : undefined,
        };

        try {
            const res = await createTask(payload);
            if (res.success) {
                toast.success("Task created successfully");
                router.push("/tasks");
            } else {
                toast.error(res.error || "Failed to create task");
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error || "Failed to create task",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 max-w-4xl mx-auto pb-12"
        >
            <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden">
                {/* Top gradient bar */}
                <div className="h-2 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 -mt-4" />

                <CardContent className="p-6 sm:p-8 space-y-8">
                    {/* Date Picker */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-indigo-600" />
                            Task Date
                        </Label>
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-70 justify-start text-left font-medium bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                                            !date && "text-slate-500",
                                        )}
                                    >
                                        {date ? (
                                            format(date, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                }
                            />
                            <PopoverContent
                                className="w-auto p-0 bg-white border-slate-200"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    autoFocus
                                    className="bg-white text-slate-900 rounded-md border border-slate-200"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Dynamic Task List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Tasks Completed
                            </Label>
                            <Badge
                                variant="outline"
                                className="text-xs border-slate-200 text-slate-600 bg-white"
                            >
                                {tasks.length} / 20
                            </Badge>
                        </div>

                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            {tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex gap-2 items-start animate-fadeIn"
                                >
                                    <div className="mt-2 text-slate-400 font-mono text-xs w-6 text-right">
                                        {index + 1}.
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={task}
                                            onChange={(e) =>
                                                handleTaskChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Implemented the user authentication flow"
                                            className="bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex shrink-0">
                                        {index === tasks.length - 1 ? (
                                            <Button
                                                type="button"
                                                onClick={addTaskRow}
                                                variant="secondary"
                                                size="icon"
                                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeTaskRow(index)
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Optional Sections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Notes */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="h-4 w-4 text-amber-600" />
                                Additional Notes
                            </Label>
                            <Textarea
                                placeholder="Any blockers or important notes for the day..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="min-h-30 bg-white border-slate-200 text-slate-900 resize-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Drive Link & Images */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                    <Link2 className="h-4 w-4 text-blue-600" />
                                    Drive Folder Link
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={driveLink}
                                    onChange={(e) =>
                                        setDriveLink(e.target.value)
                                    }
                                    className="bg-white border-slate-200 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-pink-600" />
                                    Screenshots / Assets
                                </Label>
                                <ImageUploader
                                    value={images}
                                    onChange={setImages}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    size="lg"
                    className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium h-12 px-8 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving Task...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5" />
                            Save Daily Task
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
