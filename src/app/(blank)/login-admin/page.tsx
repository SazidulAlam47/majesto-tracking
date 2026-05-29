// src/app/(blank)/login-admin/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminLogin } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Signing in...");

        try {
            const result = await adminLogin(email.trim(), password);
            toast.dismiss(loadingToast);

            if (result.success && result.data?.token) {
                login(result.data.token, "admin");
                toast.success("Welcome back, Admin!");
                router.push("/");
            } else {
                toast.error(result.error || "Login failed");
            }
        } catch (error: unknown) {
            toast.dismiss(loadingToast);
            const err = error as { response?: { data?: { error?: string } } };
            toast.error(err.response?.data?.error || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-slate-100 to-white p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-indigo-200/25 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 bg-white/90 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/60">
                <CardHeader className="text-center space-y-2 pb-2">
                    <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-200">
                        <Shield className="h-7 w-7 text-slate-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                        Admin Access
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        Restricted area — authorized personnel only
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-slate-700 text-sm"
                            >
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-slate-700 text-sm"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
