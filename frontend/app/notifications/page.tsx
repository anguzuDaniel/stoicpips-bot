"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useNotifications } from "@/context/NotificationContext";
import { Bell, Info, CheckCircle, AlertTriangle, Zap, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function NotificationsPage() {
    const { notifications, markAllRead, clearAll, toggleRead } = useNotifications();
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "read") return n.read;
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case "alert": return <Zap className="h-5 w-5 text-primary" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1200px] mx-auto w-full space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                            <Bell className="h-8 w-8 text-primary" /> Notifications
                        </h1>
                        <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                            System Alerts & Trading Signals History
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-all text-[11px] font-black uppercase tracking-tighter"
                        >
                            <CheckCircle2 className="h-4 w-4" /> Mark All Read
                        </button>
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all text-[11px] font-black uppercase tracking-tighter"
                        >
                            <Trash2 className="h-4 w-4" /> Clear All
                        </button>
                    </div>
                </header>

                <div className="flex items-center gap-2 bg-secondary/10 p-1.5 rounded-2xl w-fit border border-border/30">
                    {(["all", "unread", "read"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f
                                ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => (
                            <div
                                key={n.id}
                                className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6 ${!n.read
                                    ? 'bg-primary/5 border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]'
                                    : 'bg-card/50 border-border/50'
                                    }`}
                            >
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/10 shadow-inner' : 'bg-secondary/20'
                                    }`}>
                                    {getIcon(n.type)}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className={`text-base tracking-tight ${!n.read ? 'font-black text-foreground' : 'font-bold text-foreground/80'}`}>
                                            {n.title}
                                        </h3>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                            {n.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                                        {n.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleRead(n.id)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!n.read
                                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                            : 'text-muted-foreground hover:bg-secondary/30'
                                            }`}
                                    >
                                        {n.read ? "Mark Unread" : "Mark Read"}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4 rounded-3xl border border-dashed border-border/50 bg-muted/5">
                            <div className="p-6 rounded-full bg-secondary/20">
                                <Bell className="h-12 w-12 text-muted-foreground/20" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-muted-foreground/50 uppercase tracking-widest">Sky is clear</p>
                                <p className="text-sm text-muted-foreground/30 font-bold uppercase tracking-widest mt-1">No notifications matched your filter</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
