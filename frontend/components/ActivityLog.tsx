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
                                const title = log.message.includes('Take Profit') ? 'Target Reached 🎯' : 'New Trade';
                                const message = log.message.startsWith('Trade Executed:') ? log.message :
                                    log.message.includes('Take Profit') ? log.message :
                                        `Trade Executed: ${log.message}`;
                                addToast(message, 'success', title);
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
        <div className="rounded-xl border border-border bg-card h-[500px] flex flex-col shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
                <h3 className="font-bold flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Activity
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>

            <div className="flex-1 p-0 overflow-y-auto custom-scrollbar relative">
                <div className="divide-y divide-border/50">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground opacity-50 p-6">
                            <Activity className="h-8 w-8 mb-2" />
                            <p className="text-xs font-medium uppercase tracking-wider">Waiting for activity...</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex gap-3 items-start p-3 hover:bg-muted/30 transition-colors text-sm group">
                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity">
                                    {log.timestamp}
                                </span>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <p className={`leading-snug break-words ${log.type === 'success' ? 'text-green-500 dark:text-green-400 font-medium' :
                                        log.type === 'error' ? 'text-red-500 dark:text-red-400 font-medium' :
                                            log.type === 'warning' ? 'text-amber-500 font-medium' :
                                                'text-foreground/90'
                                        }`}>
                                        {log.message}
                                    </p>
                                    {log.symbol && (
                                        <span className="inline-flex items-center gap-1 rounded bg-secondary/50 border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                                            {log.symbol}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )))}
                </div>
            </div>
        </div>
    );
}
