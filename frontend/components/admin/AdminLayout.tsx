import { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-[#1B1B1B]">
            {/* Emperor's View Banner */}
            <div className="border-b border-[#00F2FF]/30 bg-gradient-to-r from-[#1B1B1B] via-[#252525] to-[#1B1B1B]">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#00F2FF] tracking-tight">
                                Emperor's Command Center
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                "You have power over your mind - not outside events. Realize this, and you will find strength." - Marcus Aurelius
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-[#00F2FF] animate-pulse" />
                            <span className="text-xs text-[#00F2FF] font-mono">SYSTEM ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {children}
            </div>
        </div>
    );
}
