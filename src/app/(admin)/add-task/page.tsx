import { TaskForm } from "@/components/forms/TaskForm";

export default function AddTaskPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Add Daily Task
                </h2>
                <p className="text-slate-500 mt-1">
                    Record the tasks completed today, add notes, and upload any
                    relevant screenshots.
                </p>
            </div>

            <TaskForm />
        </div>
    );
}
