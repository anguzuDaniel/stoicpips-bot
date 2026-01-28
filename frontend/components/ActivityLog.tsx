"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

interface LogEntry {
    id: string;
    time: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    symbol?: string;
}

// Mock data - in real app this would come from websocket/api
const mockLogs: LogEntry[] = [
    { id: '1', time: '10:42:15', message: 'Bot started successfully', type: 'info' },
    { id: '2', time: '10:42:30', message: 'Scanning market for opportunities...', type: 'info' },
    { id: '3', time: '10:45:00', message: 'Signal found for R_100 (BUY CALL)', type: 'success', symbol: 'R_100' },
    { id: '4', time: '10:45:05', message: 'Trade executed: Contract #89283921', type: 'info' },
];

export function ActivityLog() {
    return (
        <div className="rounded-xl border border-border bg-card h-full flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Activity
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {mockLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 items-start text-sm">
                            <span className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                                {log.time}
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
                    ))}

                    <div className="flex gap-3 items-start text-sm opacity-50 animate-pulse">
                        <span className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                            --:--:--
                        </span>
                        <p>Waiting for next signal...</p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
