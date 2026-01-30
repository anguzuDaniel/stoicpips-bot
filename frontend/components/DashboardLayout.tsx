"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { botApi } from "@/lib/api";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isEmailVerified, setIsEmailVerified] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkProfileStatus();
    }, [pathname]);

    const checkProfileStatus = async () => {
        // Skip check if already on profile page to avoid loops
        // But we still want to know if email is verified
        try {
            const { data } = await botApi.getProfile();
            const profile = data.user;

            setIsEmailVerified(profile?.is_email_verified !== false);

            // Definition of "Incomplete": Missing Full Name, Username, or Trading Experience
            const isIncomplete = !profile?.full_name || !profile?.username || !profile?.trading_experience;

            if (isIncomplete && pathname !== "/profile") {
                console.warn("⚠️ Profile incomplete. Redirecting to onboarding...");
                router.push("/profile");
            } else {
                setIsCheckingProfile(false);
            }
        } catch (error) {
            console.error("Profile check failed:", error);
            setIsCheckingProfile(false);
        }
    };

    if (isCheckingProfile && pathname !== "/profile") {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Synchronizing Dunam Ai Status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full">
                <div className="md:hidden flex items-center p-4 border-b border-border bg-card sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-accent text-muted-foreground"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-2 font-bold text-lg">Dunam Ai</span>
                </div>

                <main className="flex-1 overflow-y-auto">
                    {!isEmailVerified && (
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-amber-500/20">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] md:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Email Not Verified</p>
                                    <p className="text-[10px] md:text-xs text-muted-foreground">Please check your inbox to activate all platform features.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/profile')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-tighter hover:bg-amber-600 transition-all shadow-sm"
                            >
                                Verify Now
                                <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
