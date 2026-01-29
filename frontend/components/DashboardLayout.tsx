"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { clsx } from "clsx";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full">
                {/* Mobile Header Trigger (Only visible on mobile if page doesn't have its own header) 
            Actually, it's safer to provide a Context or just put the trigger here 
            and let pages have their own content. 
        */}

                {/* 
           We inject the Mobile Menu Trigger as a fixed/sticky element or 
           helper that can be used. 
           
           Better approach: The Page content usually starts with a Header. 
           We can pass the toggle function or just render a mobile header here.
        */}

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
