"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { botApi, fetcher } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/Skeleton";

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
    const [statusFilter, setStatusFilter] = useState<"all" | "won" | "lost">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const ITEMS_PER_PAGE = 10;

    const { data, mutate, isValidating: loading } = useSWR(
        `/bot/history?page=${currentPage}&limit=${ITEMS_PER_PAGE}&status=${statusFilter}`,
        fetcher,
        { keepPreviousData: true }
    );

    const trades: Trade[] = data?.trades || [];
    const totalPages = data?.pagination?.pages || 1;
    const totalCount = data?.pagination?.total || 0;

    const handleRefresh = async () => {
        setRefreshing(true);
        await mutate();
        setRefreshing(false);
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
                <header className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight">Trade History</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-secondary/20 rounded-lg p-1 border border-border">
                            {(["all", "won", "lost"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        setStatusFilter(f);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-1 text-xs font-medium rounded-md transition-all capitalize ${statusFilter === f
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
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

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-t border-border">
                                <span className="text-xs text-muted-foreground font-medium">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} trades
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1 || loading}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border hover:bg-accent disabled:opacity-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs font-bold px-3">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || loading}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border hover:bg-accent disabled:opacity-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
