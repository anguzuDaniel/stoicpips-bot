"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Activity className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Reset Password</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Check your email</h3>
                            <p className="text-sm text-muted-foreground">
                                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex w-full items-center justify-center rounded-lg bg-secondary px-4 py-2 font-medium transition-colors hover:bg-secondary/80"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
