"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, TrendingDown, Info, HelpCircle } from "lucide-react";
import { Skeleton } from "./Skeleton";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface Trade {
    symbol: string;
    pnl: string | number;
    status: string;
}

interface PerformanceStats {
    symbol: string;
    roi: number;
    wins: number;
    losses: number;
    total: number;
    winRate: number;
}

export function PerformanceAnalytics() {
    const { data, isValidating } = useSWR('/bot/history?limit=200', fetcher, {
        refreshInterval: 60000,
        revalidateOnFocus: true
    });

    const performance = useMemo(() => {
        if (!data?.trades || data.trades.length === 0) return null;

        const trades: Trade[] = data.trades;
        const statsMap = new Map<string, PerformanceStats>();

        trades.forEach(trade => {
            const symbol = trade.symbol;
            const pnl = parseFloat(trade.pnl as string);
            const isWin = pnl > 0;

            const existing = statsMap.get(symbol) || {
                symbol,
                roi: 0,
                wins: 0,
                losses: 0,
                total: 0,
                winRate: 0
            };

            existing.roi += pnl;
            if (isWin) existing.wins++;
            else if (pnl < 0) existing.losses++;
            existing.total++;
            existing.winRate = (existing.wins / existing.total) * 100;

            statsMap.set(symbol, existing);
        });

        const allStats = Array.from(statsMap.values()).sort((a, b) => b.roi - a.roi);

        return {
            apex: allStats.slice(0, 3),
            underperformers: allStats.length > 3 ? allStats.slice(-3).reverse() : []
        };
    }, [data]);

    if (isValidating && !performance) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {[1, 2].map(i => (
                    <div key={i} className="bg-card/50 border border-border rounded-2xl p-6">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(j => (
                                <Skeleton key={j} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!performance || performance.apex.length === 0) {
        return (
            <div className="mt-8 bg-card/50 border border-border border-dashed rounded-2xl p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Gathering Market Data...</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                    The AI engine needs more trade data to rank pair efficiency. Continue trading to unlock insights.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Apex Performers */}
            <div className="bg-[#116466]/5 border border-[#116466]/20 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#D1E8E2] rounded-lg">
                            <Trophy className="h-5 w-5 text-[#116466]" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-[#116466]">APEX PERFORMERS</h2>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#116466]/60">Top Efficiency</span>
                </div>

                <div className="space-y-3">
                    {performance.apex.map((stat, index) => (
                        <div key={stat.symbol} className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 border border-[#116466]/10 rounded-xl transition-all hover:bg-white/80 dark:hover:bg-black/30">
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-[#116466]/30">{index + 1}</span>
                                <div>
                                    <div className="text-sm font-black text-[#116466]">{stat.symbol}</div>
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">WR: {stat.winRate.toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-[#116466]">+{stat.roi.toFixed(2)}%</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{stat.wins}W - {stat.losses}L</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Underperformers */}
            <div className="bg-[#D98282]/5 border border-[#D98282]/20 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#FFCB9A]/30 rounded-lg">
                            <TrendingDown className="h-5 w-5 text-[#D98282]" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-[#D98282]">UNDERPERFORMERS</h2>
                    </div>
                    <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-[#D98282]/40 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-[#2C3531] text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 z-10">
                            "Discipline in loss is as vital as discipline in profit."
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {performance.underperformers.map((stat, index) => (
                        <div key={stat.symbol} className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 border border-[#D98282]/10 rounded-xl transition-all hover:bg-white/80 dark:hover:bg-black/30">
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-[#D98282]/30">{index + 1}</span>
                                <div>
                                    <div className="text-sm font-black text-[#D98282]">{stat.symbol}</div>
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">WR: {stat.winRate.toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-[#D98282]">{stat.roi.toFixed(2)}%</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{stat.wins}W - {stat.losses}L</div>
                            </div>
                        </div>
                    ))}
                    {performance.underperformers.length === 0 && (
                        <div className="py-8 text-center border-2 border-dashed border-[#D98282]/10 rounded-xl">
                            <span className="text-[10px] font-bold uppercase text-[#D98282]/40 tracking-widest">More Data Required</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
