"use client";

import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { data } = await userApi.getNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await userApi.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await userApi.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    // Poll for notifications every 60s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent/50">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <Check className="h-3 w-3" /> Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            No notifications
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={clsx(
                                    "p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                                    !n.is_read && "bg-muted/30"
                                )}
                                onClick={() => !n.is_read && handleMarkRead(n.id)}
                            >
                                <div className="flex gap-3 items-start">
                                    <div className="mt-0.5">{getIcon(n.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className={clsx("text-sm", !n.is_read ? "font-semibold" : "font-medium")}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60 pt-1">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!n.is_read && (
                                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
