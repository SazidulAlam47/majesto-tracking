import { TaskTableWrapper } from '@/components/tasks/TaskTableWrapper';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Daily Tasks</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View all recorded tasks, progress, and uploaded assets.
          </p>
        </div>
      </div>
      
      <TaskTableWrapper />
    </div>
  );
}
