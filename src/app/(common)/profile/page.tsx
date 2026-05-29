"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const { userName, userType, logout } = useAuth();

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 mt-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Profile
                </h2>
                <p className="text-slate-500 mt-1">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-indigo-500 to-purple-500 opacity-10" />

                <CardContent className="p-8 relative z-10 pt-16">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl bg-slate-100">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                                {getInitials(userName || "User")}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center sm:text-left space-y-2">
                            <h3 className="text-3xl font-bold text-slate-900">
                                {userName || "User Name"}
                            </h3>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Badge
                                    variant="outline"
                                    className={`px-3 py-1 text-sm font-semibold tracking-wide uppercase ${
                                        userType === "admin"
                                            ? "border-indigo-200 text-indigo-700 bg-indigo-50"
                                            : "border-emerald-200 text-emerald-700 bg-emerald-50"
                                    }`}
                                >
                                    {userType === "admin" ? (
                                        <ShieldCheck className="w-4 h-4 mr-1.5 inline" />
                                    ) : (
                                        <UserCircle className="w-4 h-4 mr-1.5 inline" />
                                    )}
                                    {userType || "Guest"} Role
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                <p className="text-sm text-slate-500 mb-1">
                                    Account Status
                                </p>
                                <p className="font-medium text-emerald-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                <p className="text-sm text-slate-500 mb-1">
                                    Access Level
                                </p>
                                <p className="font-medium text-slate-800 capitalize">
                                    {userType} Privileges
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                            onClick={logout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out Securely
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
