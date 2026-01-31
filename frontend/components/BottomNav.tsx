"use client";

import { LayoutDashboard, Activity, History, Settings, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { icon: Activity, label: "Stats", href: "/analytics", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: History, label: "History", href: "/history", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Settings, label: "Settings", href: "/settings", color: "text-blue-500", bg: "bg-blue-500/10" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 group",
                                isActive ? item.color : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={clsx(
                                "p-1.5 rounded-xl transition-all duration-300",
                                isActive ? item.bg : "group-hover:bg-secondary"
                            )}>
                                <item.icon className={clsx("h-5 w-5", isActive && "fill-current animate-in zoom-in-50 duration-300")} />
                            </div>
                            <span className="text-[10px] font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
