"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { Skeleton } from "../Skeleton";

export function BotAnalytics() {
    const { data, isValidating } = useSWR(
        '/admin/analytics/global',
        fetcher,
        { refreshInterval: 30000 }
    );

    const metrics = data?.global_metrics || {};
    const tierBreakdown = data?.tier_breakdown || {};

    const StatCard = ({ label, value, icon: Icon, trend }: any) => (
        <div className="p-4 rounded-lg border border-[#00F2FF]/30 bg-[#1B1B1B]/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
                {Icon && <Icon className="h-4 w-4 text-[#00F2FF]" />}
            </div>
            {isValidating && !value ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <div className="text-2xl font-bold text-white">{value}</div>
            )}
            {trend && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="border border-[#00F2FF]/30 rounded-lg bg-[#252525]/50 backdrop-blur">
            {/* Header */}
            <div className="p-6 border-b border-[#00F2FF]/20">
                <h2 className="text-xl font-bold text-[#00F2FF]">Bot Performance Analytics</h2>
                <p className="text-xs text-gray-400 mt-1">Platform-wide trading metrics</p>
            </div>

            {/* Global Metrics */}
            <div className="p-6">
                <h3 className="text-sm font-bold text-[#00F2FF] mb-4">Global Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Trades"
                        value={metrics.total_trades || 0}
                        icon={Activity}
                    />
                    <StatCard
                        label="Win Rate"
                        value={`${metrics.win_rate || 0}%`}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Total P/L"
                        value={`$${metrics.total_pnl || '0.00'}`}
                        icon={DollarSign}
                    />
                    <StatCard
                        label="AI Confidence"
                        value={`${metrics.avg_ai_confidence || 0}%`}
                        icon={Activity}
                    />
                </div>
            </div>

            {/* Tier Breakdown */}
            <div className="p-6 border-t border-[#00F2FF]/20">
                <h3 className="text-sm font-bold text-[#00F2FF] mb-4">Breakdown by Subscription Tier</h3>
                <div className="space-y-4">
                    {['free', 'pro', 'elite'].map((tier) => {
                        const tierData = tierBreakdown[tier] || {};
                        return (
                            <div key={tier} className="p-4 rounded-lg bg-[#1B1B1B]/50 border border-[#00F2FF]/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-white uppercase">{tier}</span>
                                    <span className="text-xs text-gray-400">
                                        {tierData.active_users || 0} active users
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Trades</span>
                                        <p className="text-white font-bold">{tierData.total_trades || 0}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Win Rate</span>
                                        <p className="text-white font-bold">{tierData.win_rate || 0}%</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">P/L</span>
                                        <p className={`font-bold ${parseFloat(tierData.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            ${tierData.total_pnl || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
