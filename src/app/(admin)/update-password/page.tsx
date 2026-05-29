"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        try {
            const res = await updatePassword(
                currentPassword,
                newPassword,
                confirmPassword,
            );
            if (res.success) {
                toast.success("Password updated successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to update password",
            );
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordField = (
        id: string,
        label: string,
        value: string,
        onChange: (v: string) => void,
        show: boolean,
        setShow: (v: boolean) => void,
    ) => (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-slate-700">
                {label}
            </Label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    {show ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-xl mx-auto mt-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Update Password
                </h2>
                <p className="text-slate-500 mt-1">
                    Change your admin account password. Ensure your new password
                    is secure.
                </p>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 -mt-4" />
                <CardHeader>
                    <CardTitle className="text-slate-900">
                        Security Settings
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Password must be at least 8 characters long.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {renderPasswordField(
                            "currentPassword",
                            "Current Password",
                            currentPassword,
                            setCurrentPassword,
                            showCurrent,
                            setShowCurrent,
                        )}
                        {renderPasswordField(
                            "newPassword",
                            "New Password",
                            newPassword,
                            setNewPassword,
                            showNew,
                            setShowNew,
                        )}
                        {renderPasswordField(
                            "confirmPassword",
                            "Confirm New Password",
                            confirmPassword,
                            setConfirmPassword,
                            showConfirm,
                            setShowConfirm,
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
