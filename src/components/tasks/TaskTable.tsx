'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getTasks, deleteTask } from '@/services/taskService';
import { useAuth } from '@/hooks/useAuth';
import { ITask } from '@/types';
import { formatDate } from '@/utils/helpers';
import { 
  Loader2, ExternalLink, Trash2, Calendar, FileText, Image as ImageIcon, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function TaskTable() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { userType } = useAuth();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);

  const fetchTasks = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await getTasks(pageNum, 10);
      if (res.success && res.data) {
        setTasks(res.data);
        // @ts-ignore - pagination exists in PaginatedResponse but types might be strict
        setTotalPages(res.pagination?.totalPages || 1);
        setPage(pageNum);
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteTask(deleteId);
      if (res.success) {
        toast.success('Task deleted successfully');
        setDeleteId(null);
        fetchTasks(page);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium w-40"><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</div></th>
                <th className="px-6 py-4 font-medium min-w-[300px]"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Tasks Completed</div></th>
                <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Assets</div></th>
                <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</div></th>
                {userType === 'admin' && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={userType === 'admin' ? 5 : 4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ListTodo className="h-10 w-10 text-slate-700" />
                      <p>No tasks recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-800/30 transition-colors align-top">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200 bg-slate-800/50 inline-block px-3 py-1.5 rounded-lg border border-slate-700/50">
                        {formatDate(task.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="space-y-1.5 text-slate-300">
                        {task.tasks.map((t, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1 text-xs font-mono">{i + 1}.</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {task.images && task.images.length > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20 w-fit"
                            onClick={() => setSelectedImages(task.images!)}
                          >
                            <ImageIcon className="h-3 w-3 mr-1.5" />
                            {task.images.length} Image{task.images.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {task.driveLink && (
                          <a 
                            href={task.driveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Drive Folder
                          </a>
                        )}
                        {!task.images?.length && !task.driveLink && (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.note ? (
                        <p className="text-slate-400 text-xs italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 max-w-xs">
                          "{task.note}"
                        </p>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    {userType === 'admin' && (
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteId(task._id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTasks(page - 1)}
            disabled={page === 1 || loading}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400 font-medium">
            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTasks(page + 1)}
            disabled={page === totalPages || loading}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Task Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Task</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this task record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Images Dialog */}
      <Dialog open={!!selectedImages} onOpenChange={(open) => !open && setSelectedImages(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-4xl">
          <DialogHeader>
            <DialogTitle>Attached Assets</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {selectedImages?.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block group relative aspect-video rounded-lg overflow-hidden border border-slate-700">
                <img src={url} alt={`Asset ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Just importing ListTodo here to use in the empty state
import { ListTodo } from 'lucide-react';
