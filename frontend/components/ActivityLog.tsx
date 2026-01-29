"use client";

// import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { botApi } from "@/lib/api";

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    symbol?: string;
}

export function ActivityLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await botApi.getLogs();
                if (res.data && res.data.logs && res.data.logs.length > 0) {
                    setLogs(res.data.logs.slice(0, 50));
                }
            } catch (e) {
                console.error("Failed to fetch logs", e);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    // Simulated AI Logs effect
    useEffect(() => {
        const aiMessages = [
            "AI: Scanning market volatility...",
            "AI: Analyzing trend momentum...",
            "AI: Checking resistance levels...",
            "AI: Calculating risk/reward ratios...",
            "AI: Monitoring spread variations...",
            "AI: Validating candlestick patterns..."
        ];

        const simulateInterval = setInterval(() => {
            // Only add fake log if we don't have many real logs or randomly to show activity
            const randomMsg = aiMessages[Math.floor(Math.random() * aiMessages.length)];
            const newLog: LogEntry = {
                id: `ai-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                message: randomMsg,
                type: 'info'
            };

            setLogs(prev => {
                const updated = [newLog, ...prev].slice(0, 50);
                return updated;
            });

        }, 5000 + Math.random() * 5000); // Random interval 5-10s

        return () => clearInterval(simulateInterval);
    }, []);

    return (
        <div className="rounded-xl border border-border bg-card h-full max-h-[600px] flex flex-col">
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

                    <div className="flex gap-3 items-start text-sm opacity-50 animate-pulse">
                        <span className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                            --:--:--
                        </span>
                        <p>Waiting for next signal...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
