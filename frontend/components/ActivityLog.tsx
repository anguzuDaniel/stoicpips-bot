"use client";

// import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import { botApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    symbol?: string;
}

export function ActivityLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const { addToast } = useToast();
    const lastLogIdRef = useRef<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await botApi.getLogs();
                if (res.data && res.data.logs && res.data.logs.length > 0) {
                    const latestLogs = res.data.logs;
                    const newestId = latestLogs[0].id;

                    // Check for new logs if we have a history
                    if (lastLogIdRef.current && lastLogIdRef.current !== newestId) {
                        const previousId = lastLogIdRef.current;
                        // Find logs newer than previousId
                        const newItems = [];
                        for (const log of latestLogs) {
                            if (log.id === previousId) break;
                            newItems.push(log);
                        }

                        // Notify for relevant new items (reverse to show oldest first if multiple)
                        newItems.reverse().forEach(log => {
                            if (log.type === 'success') {
                                addToast(`Trade Executed: ${log.message}`, 'success', 'New Trade');
                            } else if (log.type === 'warning') {
                                addToast(log.message, 'warning', 'Warning');
                            } else if (log.type === 'error') {
                                addToast(log.message, 'error', 'Error');
                            }
                        });
                    }

                    lastLogIdRef.current = newestId;
                    setLogs(latestLogs.slice(0, 50));
                }
            } catch (e) {
                console.error("Failed to fetch logs", e);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    // AI Simulation removed as requested
    useEffect(() => {
        // AI Simulation removed to focus on real trades
    }, []);

    return (
        <div className="rounded-xl border border-border bg-card h-full flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Activity
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50">
                            <Activity className="h-8 w-8 mb-2" />
                            <p className="text-sm">Waiting for bot activity...</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex gap-3 items-start text-sm">
                                <span className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                                    {log.timestamp}
                                </span>
                                <div className="space-y-1">
                                    <p className={`leading-none ${log.type === 'success' ? 'text-green-500' :
                                        log.type === 'error' ? 'text-red-500' :
                                            log.type === 'warning' ? 'text-yellow-500' :
                                                'text-foreground'
                                        }`}>
                                        {log.message}
                                    </p>
                                    {log.symbol && (
                                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                            {log.symbol}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )))}

                    {/* Waiting for next signal element removed */}
                </div>
            </div>
        </div>
    );
}
