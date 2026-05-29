import { UserTable } from '@/components/admin/UserTable';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">User Management</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage access requests, approve users, and review device signatures.
        </p>
      </div>
      
      <UserTable />
    </div>
  );
}
