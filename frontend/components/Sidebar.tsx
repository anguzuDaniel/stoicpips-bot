"use client";

import { LayoutDashboard, Activity, Settings, History, BarChart3, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Activity, label: "Live Trading", href: "/live" },
  { icon: Settings, label: "Bot Settings", href: "/settings" },
  { icon: History, label: "Trade History", href: "/history" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Middleware might redirect anyway, but good to be explicit
    // Force refresh to clear any cached state
    router.refresh();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-border bg-card p-4 transition-transform duration-300 md:sticky md:top-0 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          <div className="flex items-center justify-between px-2 pb-8 pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight">SynthBot <span className="text-xs font-normal text-primary border border-primary/20 bg-primary/10 px-1 rounded">Beta</span></span>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
              <LogOut className="h-5 w-5 rotate-180" />
            </button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()} // Close on navigation
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-1 border-t border-border pt-4">
          <Link
            href="/help"
            onClick={() => onClose()}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
