"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
    getUsers,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
} from "@/services/userService";
import { IUser } from "@/types";
import {
    Loader2,
    RefreshCw,
    MoreVertical,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Edit2,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/utils/helpers";

export function UserTable() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit user modal
    const [editUser, setEditUser] = useState<IUser | null>(null);
    const [editName, setEditName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // Delete user confirmation
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = useCallback(async (showRefreshToast = false) => {
        if (showRefreshToast) setRefreshing(true);
        try {
            const res = await getUsers();
            if (res.success && res.data) {
                setUsers(res.data);
                if (showRefreshToast) toast.success("Users refreshed");
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleApprove = async (id: string) => {
        try {
            const res = await approveUser(id);
            if (res.success) {
                toast.success("User approved");
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to approve user",
            );
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await rejectUser(id);
            if (res.success) {
                toast.success("User rejected");
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to reject user");
        }
    };



    const handleUpdateName = async () => {
        if (!editUser || !editName.trim()) return;
        setIsEditing(true);
        try {
            const res = await updateUser(editUser._id, editName.trim());
            if (res.success) {
                toast.success("Name updated");
                setEditUser(null);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update name");
        } finally {
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await deleteUser(deleteId);
            if (res.success) {
                toast.success("User deleted");
                setDeleteId(null);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete user");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const pendingCount = users.filter((u) => u.status === "pending").length;
    const approvedCount = users.filter(
        (u) => u.status === "approved" && u.type === "user",
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-3">
                    <Badge
                        variant="secondary"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                        {pendingCount} Pending
                    </Badge>
                    <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                        {approvedCount} Approved Users
                    </Badge>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(true)}
                    disabled={refreshing}
                    className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm shadow-slate-200/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-4 font-medium hidden md:table-cell">
                                    Device Signature
                                </th>
                                <th className="px-6 py-4 font-medium hidden sm:table-cell">
                                    Joined
                                </th>
                                <th className="px-6 py-4 font-medium text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-8 text-center text-slate-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">
                                                {user.name}
                                            </div>
                                            {user.email && (
                                                <div className="text-xs text-slate-500">
                                                    {user.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    user.type === "admin"
                                                        ? "border-indigo-200 text-indigo-700 bg-indigo-50"
                                                        : "border-slate-200 text-slate-600 bg-slate-50"
                                                }
                                            >
                                                {user.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    user.status === "approved"
                                                        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                                        : user.status ===
                                                            "pending"
                                                          ? "border-amber-200 text-amber-700 bg-amber-50"
                                                          : "border-red-200 text-red-700 bg-red-50"
                                                }
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div
                                                className="font-mono text-xs text-slate-500 truncate max-w-30"
                                                title={user.signature}
                                            >
                                                {user.signature
                                                    ? `${user.signature.substring(0, 12)}...`
                                                    : "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-slate-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-slate-100 text-slate-500"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48 bg-white border-slate-200 text-slate-700 shadow-lg shadow-slate-200/60"
                                                >
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                    </DropdownMenuGroup>
                                                    <DropdownMenuSeparator className="bg-slate-200" />

                                                    {user.status ===
                                                        "pending" && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        user._id,
                                                                    )
                                                                }
                                                                className="text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
                                                            >
                                                                <ShieldCheck className="h-4 w-4 mr-2" />{" "}
                                                                Approve Access
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleReject(
                                                                        user._id,
                                                                    )
                                                                }
                                                                className="text-amber-700 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
                                                            >
                                                                <ShieldAlert className="h-4 w-4 mr-2" />{" "}
                                                                Reject Request
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-200" />
                                                        </>
                                                    )}

                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditUser(user);
                                                            setEditName(
                                                                user.name,
                                                            );
                                                        }}
                                                        className="focus:bg-slate-50 cursor-pointer"
                                                    >
                                                        <Edit2 className="h-4 w-4 mr-2" />{" "}
                                                        Edit Name
                                                    </DropdownMenuItem>



                                                    {user.type !== "admin" && (
                                                        <>
                                                            <DropdownMenuSeparator className="bg-slate-200" />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setDeleteId(
                                                                        user._id,
                                                                    )
                                                                }
                                                                className="text-red-700 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />{" "}
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Dialog */}
            <Dialog
                open={!!editUser}
                onOpenChange={(open) => !open && setEditUser(null)}
            >
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Update the name for this user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-white border-slate-200 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditUser(null)}
                            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateName}
                            disabled={isEditing || !editName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            {isEditing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            Delete User
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Are you sure you want to delete this user? This
                            action cannot be undone and will permanently remove
                            their access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            variant="destructive"
                        >
                            {isDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
