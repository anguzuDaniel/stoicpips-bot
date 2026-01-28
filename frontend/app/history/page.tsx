"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { botApi } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

interface Trade {
    id: string;
    symbol: string;
    contract_type: "CALL" | "PUT";
    amount: number;
    entry_price: number;
    payout: number;
    status: "won" | "lost";
    pnl: number;
    created_at: string;
    contract_id: number;
}

export default function TradeHistory() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await botApi.getHistory();
            setTrades(response.data.trades || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />

            <main className="flex-1 p-6 overflow-y-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Trade History</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </header>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : trades.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground">
                            <p>No trades found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Time</th>
                                        <th className="px-6 py-3 font-medium">Symbol</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Stake</th>
                                        <th className="px-6 py-3 font-medium">Entry</th>
                                        <th className="px-6 py-3 font-medium">Result</th>
                                        <th className="px-6 py-3 font-medium text-right">Profit/Loss</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {trades.map((trade) => (
                                        <tr key={trade.id} className="hover:bg-accent/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {format(new Date(trade.created_at), "MMM d, HH:mm:ss")}
                                            </td>
                                            <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 font-medium ${trade.contract_type === "CALL" ? "text-green-500" : "text-red-500"
                                                    }`}>
                                                    {trade.contract_type === "CALL" ? (
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowDownRight className="h-3 w-3" />
                                                    )}
                                                    {trade.contract_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">${trade.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">{trade.entry_price?.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${trade.status === "won"
                                                        ? "bg-green-500/20 text-green-500 border border-green-500/20"
                                                        : "bg-red-500/20 text-red-500 border border-red-500/20"
                                                    }`}>
                                                    {trade.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {trade.pnl > 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
