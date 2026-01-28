"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TradeForm } from "@/components/TradeForm";
import { TradingChart } from "@/components/TradingChart";
import { botApi } from "@/lib/api";
import { Loader2, Activity, Play, StopCircle, RefreshCw, ChevronDown } from "lucide-react";

const AVAILABLE_SYMBOLS = [
    { value: "R_10", label: "Volatility 10 Index" },
    { value: "R_25", label: "Volatility 25 Index" },
    { value: "R_50", label: "Volatility 50 Index" },
    { value: "R_75", label: "Volatility 75 Index" },
    { value: "R_100", label: "Volatility 100 Index" },
    { value: "1HZ10V", label: "Volatility 10 (1s) Index" },
    { value: "1HZ25V", label: "Volatility 25 (1s) Index" },
    { value: "1HZ50V", label: "Volatility 50 (1s) Index" },
    { value: "1HZ75V", label: "Volatility 75 (1s) Index" },
    { value: "1HZ100V", label: "Volatility 100 (1s) Index" },
];

export default function LiveTradingPage() {
    const [loading, setLoading] = useState(true);
    const [activeSymbol, setActiveSymbol] = useState("R_100");
    const [botStatus, setBotStatus] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        fetchStatus();
        // Poll status every 5 seconds
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await botApi.getStatus();
            setBotStatus(response.data);
            setIsRunning(response.data.isRunning);
        } catch (error) {
            console.error("Failed to fetch status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartBot = async () => {
        try {
            if (isRunning) {
                await botApi.stopBot();
            } else {
                await botApi.startBot();
            }
            fetchStatus();
        } catch (error) {
            console.error("Failed to toggle bot:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="flex-none flex items-center justify-between p-6 border-b border-border bg-card">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Live Trading</h1>
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                {AVAILABLE_SYMBOLS.find(s => s.value === activeSymbol)?.label || activeSymbol}
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>
                            {/* Dropdown would go here, simplified for now */}
                            <div className="absolute top-full left-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
                                {AVAILABLE_SYMBOLS.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setActiveSymbol(s.value)}
                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-lg">
                            <div className={`h-2.5 w-2.5 rounded-full ${botStatus?.derivConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-xs font-medium text-muted-foreground">
                                {botStatus?.derivConnected ? 'Connected to Deriv' : 'Disconnected'}
                            </span>
                        </div>
                        <button
                            onClick={handleStartBot}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${isRunning
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                                }`}
                        >
                            {isRunning ? (
                                <>
                                    <StopCircle className="h-5 w-5" /> Stop Bot
                                </>
                            ) : (
                                <>
                                    <Play className="h-5 w-5" /> Start Auto-Trading
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Chart Area */}
                    <div className="flex-1 flex flex-col border-r border-border bg-background p-6">
                        {/* <div className="flex-none flex items-center justify-between mb-4">
                 <div className="flex gap-2">
                    {['1m', '5m', '15m', '1h'].map(t => (
                       <button key={t} className="px-3 py-1 text-xs font-medium rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">{t}</button>
                    ))}
                 </div>
              </div> */}
                        <div className="flex-1 relative min-h-0 bg-secondary/5 rounded-xl border border-border overflow-hidden">
                            <div className="absolute inset-0 p-4">
                                <TradingChart />
                            </div>
                        </div>

                        {/* Active Trades Panel */}
                        <div className="flex-none h-48 mt-6 rounded-xl border border-border bg-card overflow-hidden flex flex-col">
                            <div className="px-4 py-3 border-b border-border bg-muted/30">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Active Run
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0">
                                {botStatus?.activeTrades && botStatus.activeTrades.length > 0 ? (
                                    <table className="w-full text-xs">
                                        <thead className="text-muted-foreground bg-muted/20">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Symbol</th>
                                                <th className="px-4 py-2 text-left">Type</th>
                                                <th className="px-4 py-2 text-right">Stake</th>
                                                <th className="px-4 py-2 text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {botStatus.activeTrades.map((trade: any, i: number) => (
                                                <tr key={i} className="border-b border-border/50">
                                                    <td className="px-4 py-2">{trade.symbol}</td>
                                                    <td className="px-4 py-2">{trade.contract_type}</td>
                                                    <td className="px-4 py-2 text-right">${trade.amount}</td>
                                                    <td className="px-4 py-2 text-right">...</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                        No active trades running.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Trade Form) */}
                    <div className="w-80 flex-none bg-card border-l border-border p-6 overflow-y-auto">
                        <h2 className="font-bold mb-6">Manual Trade</h2>
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-muted-foreground">Account Balance</span>
                                <span className="text-xs font-medium text-green-500">+2.4%</span>
                            </div>
                            <div className="text-2xl font-bold">$10,024.50</div>
                        </div>
                        <TradeForm />

                        <div className="mt-8 pt-8 border-t border-border">
                            <h3 className="font-bold mb-4 text-sm">Performance Today</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total P/L</span>
                                    <span className={botStatus?.performance?.totalProfit >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                        ${botStatus?.performance?.totalProfit?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Trades</span>
                                    <span className="font-medium">{botStatus?.performance?.tradesExecuted || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Win Rate</span>
                                    <span className="font-medium">{botStatus?.performance?.winRate || '0.0'}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
