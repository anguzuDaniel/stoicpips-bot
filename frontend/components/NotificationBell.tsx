"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Info, CheckCircle, AlertTriangle, Zap, X } from "lucide-react";
// import { useNotifications } from "@/context/NotificationContext";
import { userApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    // const { notifications, unreadCount, markAllRead } = useNotifications(); // Use direct API instead
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await userApi.getNotifications();
            if (data.notifications) {
                setNotifications(data.notifications.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    description: n.message,
                    time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
                    read: n.is_read,
                    type: n.type
                })));
                setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        await userApi.markAllNotificationsRead();
        fetchNotifications();
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "alert": return <Zap className="h-4 w-4 text-primary" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all relative ${isOpen ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background border-none shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-[450px] overflow-hidden bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                        <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-[350px] divide-y divide-border custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 transition-colors hover:bg-muted/50 flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm tracking-tight ${!n.read ? 'font-black' : 'font-bold'}`}>{n.title}</p>
                                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap uppercase tracking-tighter">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            {n.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center space-y-2">
                                <div className="p-3 rounded-full bg-secondary/50 w-fit mx-auto">
                                    <Bell className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No new updates</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-border bg-muted/20 text-center">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors block w-full"
                        >
                            View All History
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
