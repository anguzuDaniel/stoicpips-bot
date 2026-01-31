"use client";

import { Lock, CreditCard, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrialExpiredPage() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-lg bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                <div className="flex flex-col items-center text-center space-y-8">

                    {/* Icon Stack */}
                    <div className="relative">
                        <div className="h-24 w-24 rounded-[2rem] bg-secondary/10 border border-border/50 flex items-center justify-center animate-pulse">
                            <Lock className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg border-2 border-[#0A0A0A]">
                            <span className="text-white font-black text-xs">OFF</span>
                        </div>
                    </div>

                    {/* Stoic Message */}
                    <div className="space-y-4">
                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full inline-block">
                            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Trial Expired</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                            True discipline requires <span className="text-primary">commitment</span>
                        </h1>
                        <p className="text-muted-foreground text-base font-medium leading-relaxed">
                            The trial has ended, but your journey doesn't have to. Upgrade to Pro to continue trading with Zero Emotion and unlock the full potential of Dunam AI.
                        </p>
                    </div>

                    {/* CTA Stack */}
                    <div className="w-full space-y-4 pt-4">
                        <Link
                            href="/pricing"
                            className="w-full h-16 bg-primary text-primary-foreground flex items-center justify-center gap-3 text-lg font-black uppercase tracking-widest rounded-2xl shadow-[0_4px_20px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                        >
                            Upgrade to Pro <CreditCard className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full py-4 text-muted-foreground hover:text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>

                    {/* Footer Tip */}
                    <div className="pt-12 border-t border-white/5 w-full">
                        <p className="text-[10px] text-muted-foreground/40 uppercase font-bold tracking-[0.3em]">
                            Built for Stoic Traders • Managed by Dunam AI
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
