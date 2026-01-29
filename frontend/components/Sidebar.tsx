"use client";

import { LayoutDashboard, Activity, Settings, History, BarChart3, HelpCircle, LogOut, Cpu, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Settings, label: "Bot Settings", href: "/settings" },
  { icon: CreditCard, label: "Pricing / Upgrade", href: "/pricing" },
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
              <Image
                src="/logo.png"
                alt="SyntoicAi Logo"
                width={32}
                height={32}
                className="rounded-full"
                priority
              />
              <span className="text-xl font-bold tracking-tight">SyntoicAi Bot <span className="text-xs font-normal text-primary border border-primary/20 bg-primary/10 px-1 rounded">Beta</span></span>
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

        <div className="px-3 py-2 mt-auto mb-2">
          <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-500 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                AI Engine
              </span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Status</span>
                <span className="text-green-500 font-medium">Online</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Latency</span>
                <span className="font-mono">45ms</span>
              </div>
              <div className="w-full bg-secondary/50 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-indigo-500 h-full w-[85%] animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
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
