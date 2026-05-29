// src/app/(common)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { requestLogin, checkStatus } from "@/services/authService";
import { generateSignature, safeStorage } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Send, RefreshCw, CheckCircle, Clock } from "lucide-react";

interface LoginRequest {
    name: string;
    signature: string;
    requestSent: boolean;
}

export default function LoginPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [loginRequest, setLoginRequest] = useState<LoginRequest | null>(null);
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        // Check if there's a pending request in localStorage
        const stored = safeStorage.getItem("login_request");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as LoginRequest;
                if (parsed.requestSent) {
                    setLoginRequest(parsed);
                    setName(parsed.name);
                }
            } catch {
                safeStorage.removeItem("login_request");
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setLoading(true);
        try {
            const signature = await generateSignature();
            await requestLogin(name.trim(), signature);

            const request: LoginRequest = {
                name: name.trim(),
                signature,
                requestSent: true,
            };

            safeStorage.setItem("login_request", JSON.stringify(request));
            setLoginRequest(request);
            toast.success(
                "Access request sent! Please wait for admin approval.",
            );
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const msg = err.response?.data?.error || "Failed to send request";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!loginRequest?.signature) return;

        setChecking(true);
        try {
            const result = await checkStatus(loginRequest.signature);

            if (result.data?.status === "approved" && result.data?.token) {
                login(result.data.token, "user");
                safeStorage.removeItem("login_request");
                toast.success("Access approved! Redirecting...");
                router.push("/");
            } else if (result.data?.status === "pending") {
                toast.info(
                    "Your request is still pending. Please wait for admin approval.",
                );
            } else if (result.data?.status === "rejected") {
                toast.error(
                    "Your request was rejected. Please contact the admin.",
                );
                safeStorage.removeItem("login_request");
                setLoginRequest(null);
            }
        } catch {
            toast.error("Failed to check status");
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50 to-white p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 bg-white/90 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/60">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <span className="text-2xl font-bold text-white">M</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                        Majesto Tracking
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Request access to track your daily tasks
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!loginRequest?.requestSent ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-slate-700"
                                >
                                    Your Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium h-11 shadow-lg shadow-indigo-500/25 transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Request...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Request Access
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Status card */}
                            <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-amber-300 mb-1">
                                            Request Pending
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Hi{" "}
                                            <span className="text-white font-medium">
                                                {loginRequest.name}
                                            </span>
                                            , your access request has been sent
                                            to the admin. Please wait for
                                            approval.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckStatus}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium h-11 shadow-lg shadow-emerald-500/25 transition-all duration-300"
                                disabled={checking}
                            >
                                {checking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Check Status
                                    </>
                                )}
                            </Button>

                            <button
                                onClick={() => {
                                    safeStorage.removeItem("login_request");
                                    setLoginRequest(null);
                                    setName("");
                                }}
                                className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Send a new request
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
