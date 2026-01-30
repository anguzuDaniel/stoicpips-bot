"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
            setError("This email is already registered. Please log in instead.");
        } else {
            setSuccessMessage("Account created! Please check your email to confirm your registration.");
        }
        setLoading(false);
    };

    const handleGoogleSignup = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <div className="flex flex-col items-center justify-center mb-6 gap-3">
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-black tracking-tighter text-foreground">Dunam Ai</h1>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20">Beta</span>
                        </div>
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-muted-foreground/80 uppercase mb-2">Zero Emotion. Total Execution.</h2>
                    <p className="text-sm text-muted-foreground">
                        Start your automated trading journey today
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleSignup}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 font-medium transition-colors hover:bg-accent"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign up with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or sign up with email
                            </span>
                        </div>
                    </div>

                    {successMessage ? (
                        <div className="space-y-6 text-center py-6 animate-in fade-in zoom-in duration-500">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                <div className="relative flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full border-2 border-green-500/50">
                                    <Mail className="h-10 w-10 text-green-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight">Check Your Inbox</h3>
                                <p className="text-sm text-muted-foreground">
                                    We've sent a verification link to <span className="font-semibold text-foreground underline">{email}</span>.
                                </p>
                            </div>

                            <div className="bg-muted/50 rounded-xl p-4 text-left border border-border/50">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Next Steps:
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                                    <li>Open your email application</li>
                                    <li>Look for an email from <span className="text-foreground">SyntoicAi</span></li>
                                    <li>Click the <span className="text-foreground font-semibold italic">"Verify Email"</span> button to activate your account</li>
                                </ul>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Link
                                    href="/login"
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Go to Sign In
                                </Link>

                                <p className="text-xs text-muted-foreground">
                                    Didn't receive the email? Check your spam folder or{" "}
                                    <button
                                        onClick={() => setSuccessMessage(null)}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        try again
                                    </button>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailSignup} className="space-y-4">
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                        minLength={6}
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
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" /> Create Account
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
