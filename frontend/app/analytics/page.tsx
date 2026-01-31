"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { botApi } from "@/lib/api";
import { Loader2, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import dynamic from "next/dynamic";

const GrowthChart = dynamic(() => import("@/components/GrowthChart").then(mod => mod.GrowthChart), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-secondary/10 animate-pulse rounded-xl" />
});
const DistributionChart = dynamic(() => import("@/components/DistributionChart").then(mod => mod.DistributionChart), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-secondary/10 animate-pulse rounded-xl" />
});

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await botApi.getAnalytics();
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const COLORS = ['#22c55e', '#ef4444']; // Green for wins, Red for losses

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-8">Performance Analytics</h1>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        label="Total Profit"
                        value={`$${data?.totalProfit?.toFixed(2) || '0.00'}`}
                        color={data?.totalProfit >= 0 ? "green" : "red"}
                        icon={TrendingUp}
                    />
                    <StatsCard
                        label="Win Rate"
                        value={`${data?.winRate || '0'}%`}
                        icon={Target}
                    />
                    <StatsCard
                        label="Total Trades"
                        value={data?.totalTrades || '0'}
                        icon={Zap}
                    />
                    <StatsCard
                        label="Avg. Profit / Trade"
                        value={`$${data?.averageProfit?.toFixed(2) || '0.00'}`}
                        color={data?.averageProfit >= 0 ? "green" : "red"}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Profit Growth Chart */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                        <h3 className="font-bold mb-6">Profit Growth</h3>
                        <GrowthChart data={data?.profitHistory} />
                    </div>

                    {/* Win/Loss Distribution */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-bold mb-6">Win / Loss Ratio</h3>
                        <DistributionChart data={data?.winLossData} colors={COLORS} />
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground mb-2">Largest Win</p>
                        <h3 className="text-3xl font-bold text-green-500">+${data?.largestWin?.toFixed(2)}</h3>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground mb-2">Largest Loss</p>
                        <h3 className="text-3xl font-bold text-red-500">-${Math.abs(data?.largestLoss || 0).toFixed(2)}</h3>
                    </div>
                </div>

                {/* Pair Efficiency Analytics */}
                <PerformanceAnalytics />
            </div>
        </DashboardLayout>
    );
}
