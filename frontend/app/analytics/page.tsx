"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { botApi } from "@/lib/api";
import { Loader2, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";

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
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold mb-8">Performance Analytics</h1>

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
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.profitHistory || []}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="profit"
                                        stroke="#22c55e"
                                        fillOpacity={1}
                                        fill="url(#colorProfit)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Win/Loss Distribution */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-bold mb-6">Win / Loss Ratio</h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.winLossData || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.winLossData?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
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
            </div>
        </DashboardLayout>
    );
}
