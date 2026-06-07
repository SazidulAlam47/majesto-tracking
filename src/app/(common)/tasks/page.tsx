import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskTableWrapper } from "@/components/tasks/TaskTableWrapper";
import { OWNER_NAME } from "@/constants";

export default function TasksPage() {
    return (
        <div>
            <div className="space-y-6 mb-4 sm:flex justify-between items-end">
                <div className="mb-2 sm:mb-0">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Daily Tasks
                    </h2>
                    <p className="text-slate-500 mt-1">
                        View all recorded tasks, progress, and uploaded assets
                        of {OWNER_NAME}.
                    </p>
                </div>
                <TaskTableWrapper />
            </div>
            <TaskTable />
        </div>
    );
}
