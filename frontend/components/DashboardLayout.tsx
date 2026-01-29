"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { botApi } from "@/lib/api";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkProfileStatus();
    }, [pathname]);

    const checkProfileStatus = async () => {
        // Skip check if already on profile page to avoid loops
        if (pathname === "/profile") {
            setIsCheckingProfile(false);
            return;
        }

        try {
            const { data } = await botApi.getProfile();
            const profile = data.user;

            // Definition of "Incomplete": Missing Full Name, Username, or Trading Experience
            const isIncomplete = !profile?.full_name || !profile?.username || !profile?.trading_experience;

            if (isIncomplete) {
                console.warn("⚠️ Profile incomplete. Redirecting to onboarding...");
                router.push("/profile");
            } else {
                setIsCheckingProfile(false);
            }
        } catch (error) {
            console.error("Profile check failed:", error);
            // If it's an auth error, the middleware/guard should handle it,
            // but for now we just let them through or they might be stuck.
            setIsCheckingProfile(false);
        }
    };

    if (isCheckingProfile && pathname !== "/profile") {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Synchronizing Empire Status...</p>
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
                    <span className="ml-2 font-bold text-lg">SyntoicAi Bot</span>
                </div>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
