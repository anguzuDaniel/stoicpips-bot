"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { botApi } from '@/lib/api';

export interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "info" | "success" | "warning" | "alert";
    read: boolean;
    timestamp: number;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
    markAllRead: () => void;
    clearAll: () => void;
    toggleRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within NotificationProvider");
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const lastLogIdRef = useRef<string | null>(null);
    const lastBotStatusRef = useRef<boolean | null>(null);

    // Initial Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dunam_notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load notifications", e);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('dunam_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = useCallback((payload: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...payload,
            id: Math.random().toString(36).substring(7),
            read: false,
            timestamp: Date.now()
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep last 100
    }, []);

    // Fetch Logs and convert to notifications
    const pollLogs = useCallback(async () => {
        try {
            const { data } = await botApi.getLogs();
            const logs = data.logs;
            if (!logs || !Array.isArray(logs) || logs.length === 0) return;

            // Find new logs
            const latestLog = logs[0];
            if (lastLogIdRef.current && lastLogIdRef.current !== latestLog.id) {
                // Determine how many new logs to add
                const newLogs = [];
                for (const log of logs) {
                    if (log.id === lastLogIdRef.current) break;
                    newLogs.push(log);
                }

                // Reverse to add in chronological order if needed, but here we prepending
                newLogs.reverse().forEach(log => {
                    addNotification({
                        title: log.type.toUpperCase(),
                        description: log.message,
                        time: "Just now",
                        type: log.type === 'error' ? 'alert' : log.type as any
                    });
                });
            }
            lastLogIdRef.current = latestLog.id;
        } catch (e) {
            // Silently fail log polling
        }
    }, [addNotification]);

    // Monitor Status for changes
    const pollStatus = useCallback(async () => {
        try {
            const { data: status } = await botApi.getStatus();

            // Check for bot start/stop events
            if (lastBotStatusRef.current !== null && lastBotStatusRef.current !== status.isRunning) {
                addNotification({
                    title: status.isRunning ? "Bot Started" : "Bot Stopped",
                    description: status.isRunning
                        ? "Dunam Ai Engine has started trading on your behalf."
                        : "Bot execution has been paused.",
                    time: "Just now",
                    type: status.isRunning ? "success" : "warning"
                });
            }
            lastBotStatusRef.current = status.isRunning;

            // Check for critical balance (Real account only)
            if (status.derivAccount?.accountType === 'real' && status.derivAccount?.balance < 1) {
                addNotification({
                    title: "Low Balance Alert",
                    description: "Your balance is below $1.00. Bot may stop soon.",
                    time: "Just now",
                    type: "alert"
                });
            }
        } catch (e) {
            // Silently fail status polling
        }
    }, [addNotification]);

    // Fetch Admin Announcements
    const pollAnnouncements = useCallback(async () => {
        try {
            const { data } = await botApi.getAnnouncements();
            const announcements = data.announcements;
            if (!announcements || !Array.isArray(announcements)) return;

            const seenIds = JSON.parse(localStorage.getItem('dunam_seen_announcements') || '[]');
            const newSeenIds = [...seenIds];

            announcements.forEach(ann => {
                if (!seenIds.includes(ann.id)) {
                    addNotification({
                        title: `OFFICIAL: ${ann.title}`,
                        description: ann.message,
                        time: "Just now",
                        type: ann.type || "alert"
                    });
                    newSeenIds.push(ann.id);
                }
            });

            if (newSeenIds.length > seenIds.length) {
                localStorage.setItem('dunam_seen_announcements', JSON.stringify(newSeenIds));
            }
        } catch (e) {
            // Silently fail
        }
    }, [addNotification]);

    useEffect(() => {
        const interval = setInterval(() => {
            pollLogs();
            pollStatus();
            pollAnnouncements();
        }, 5000);
        return () => clearInterval(interval);
    }, [pollLogs, pollStatus, pollAnnouncements]);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const clearAll = () => setNotifications([]);
    const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAllRead,
            clearAll,
            toggleRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
