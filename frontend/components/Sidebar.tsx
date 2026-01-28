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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col justify-between border-r border-border bg-card p-4">
      <div>
        <div className="flex items-center gap-2 px-2 pb-8 pt-4">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">SynthBot <span className="text-xs font-normal text-primary border border-primary/20 bg-primary/10 px-1 rounded">Beta</span></span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
          href="/config"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <HelpCircle className="h-5 w-5" />
          Help & Support
        </Link>
      </div>
    </div>
  );
}
