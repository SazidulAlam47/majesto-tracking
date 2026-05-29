'use client';

import { useAuth } from '@/hooks/useAuth';
import { TaskTable } from '@/components/tasks/TaskTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useRouter } from 'next/navigation';

export function TaskTableWrapper() {
  const { userType } = useAuth();
  const router = useRouter();
  
  return (
    <div className="space-y-4">
      {userType === 'admin' && (
        <div className="flex justify-end">
          <Button onClick={() => router.push('/add-task')} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </div>
      )}
      <TaskTable />
    </div>
  );
}
