"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import dynamic from "next/dynamic";
const ActivityLog = dynamic(() => import("@/components/ActivityLog").then(mod => mod.ActivityLog), { ssr: false });
const ProfitChart = dynamic(() => import("@/components/ProfitChart").then(mod => mod.ProfitChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-secondary/10 animate-pulse rounded-lg mt-4" />
});
import { Bell, Wallet, ChevronDown, Activity, Play, RefreshCw, XCircle, Power, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { botApi, fetcher } from "@/lib/api";
import useSWR from "swr";
import { Skeleton } from "@/components/Skeleton";

export default function Dashboard() {
  const router = useRouter(); // Initialize router
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    netProfit: 0,
    wins: 0,
    losses: 0,
    streak: 0,
    profitHistory: [],
    balance: 0,
    currency: 'USD',
    accountType: 'demo',
    recentTrades: []
  });

  // 1. Data Fetching with SWR
  const { data: analytics, mutate: refreshAnalytics } = useSWR('/bot/analytics', fetcher, {
    refreshInterval: 30000, // 30s
    revalidateOnFocus: false
  });

  const { data: status, mutate: refreshStatus } = useSWR('/bot/status', fetcher, {
    refreshInterval: 10000, // 10s
  });

  // 2. Synchronize SWR data to state and localStorage
  useEffect(() => {
    if (analytics) {
      setStats(prev => ({
        ...prev,
        totalTrades: analytics.totalTrades,
        winRate: analytics.winRate,
        netProfit: analytics.totalProfit,
        wins: analytics.winLossData?.find((d: any) => d.name === 'Wins')?.value || 0,
        losses: analytics.winLossData?.find((d: any) => d.name === 'Losses')?.value || 0,
        streak: analytics.currentStreak || 0,
        profitHistory: analytics.profitHistory || [],
        recentTrades: analytics.recentTrades || []
      }));
    }
  }, [analytics]);

  useEffect(() => {
    if (status) {
      setIsConnected(true);
      setIsRunning(status.isRunning || false);
      if (status.derivAccount) {
        setStats(prev => ({
          ...prev,
          balance: status.derivAccount.balance || 0,
          currency: status.derivAccount.currency || 'USD',
          accountType: status.derivAccount.accountType || 'demo'
        }));
      }
    }
  }, [status]);

  useEffect(() => {
    // 1. Initial Load from Cache for Instant UI
    const cachedStats = localStorage.getItem("syntoic_last_stats");
    if (cachedStats) {
      try {
        setStats(JSON.parse(cachedStats));
      } catch (e) {
        console.error("Failed to parse cached stats", e);
      }
    }
  }, []);

  // 2. Consolidate Caching Logic
  useEffect(() => {
    if (stats.balance > 0 || stats.totalTrades > 0) {
      localStorage.setItem("syntoic_last_stats", JSON.stringify(stats));
    }
  }, [stats]);

  const fetchStats = async () => {
    await refreshAnalytics();
  };

  const checkConnection = async () => {
    await refreshStatus();
  };

  // useSWR refresh provides the polling now

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Regardless of isConnected (which might just mean idle balance connection),
      // we want to ensure the bot is actually STARTED if the user clicks this.
      console.log("🚀 Attempting to start the bot...");
      await botApi.startBot();
      setIsConnected(true);
      setIsRunning(true);

      // Refresh status to get updated account info
      await checkConnection();
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.response?.data?.error || "Failed to start bot. Please check Settings.";
      alert(errorMsg);
      if (errorMsg.includes("Token")) {
        router.push("/settings");
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleAccountSwitch = async (type: 'real' | 'demo') => {
    if (stats.accountType === type) return;

    const confirmMsg = type === 'real'
      ? "Switching to REAL account. Real funds will be used. Continue?"
      : "Switching to Demo account.";

    if (!confirm(confirmMsg)) return;

    try {
      setLoading(true);
      console.log(`🔄 Switching account to ${type}...`);
      const response = await botApi.toggleAccount(type);

      // Wait a moment for balance subscription to kick in
      await new Promise(r => setTimeout(r, 1000));

      await checkConnection(); // Refresh status immediately
      console.log("✅ Account switched successfully:", response.data);
    } catch (e: any) {
      console.error("❌ Toggle failed:", e);
      const errorMsg = e.response?.data?.error || "Failed to switch account. Ensure tokens are configured in Settings.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Account Toggle - Fixed event propagation */}
            <div className="flex items-center bg-secondary/20 rounded-lg p-1 border border-border">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountSwitch('real');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${stats.accountType === 'real'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Real
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountSwitch('demo');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${stats.accountType === 'demo'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Demo
              </button>
            </div>

            <button
              onClick={async () => {
                if (loading) return;
                setLoading(true); // Re-using loading state for button spinner
                try {
                  if (isConnected && isRunning) {
                    // Stop Bot
                    await botApi.stopBot();
                    setIsRunning(false);
                    // setIsConnected(false); // Optional: Do we want to disconnect or just stop? Usually stop = running=false
                  } else {
                    // Connect & Start (Handled by handleConnect)
                    await handleConnect();
                    // handleConnect already sets isConnected and isRunning
                  }
                } catch (e) {
                  console.error(e);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-sm ${isRunning
                  ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20'
                  : isConnected
                    ? stats.accountType === 'real'
                      ? 'bg-yellow-500/10 text-yellow-500 border-2 border-yellow-500/50 hover:bg-yellow-500/20'
                      : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRunning ? (
                <Power className="h-4 w-4" />
              ) : isConnected ? (
                <Play className="h-4 w-4" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              )}

              {!isConnected ? "Connect & Start" : isRunning ? "Stop Bot" : "Start Bot"}
            </button>
            <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Low Balance Warning */}
        {stats.accountType === 'real' && stats.balance <= 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <h4 className="font-bold text-sm">Insufficient Funds</h4>
                <p className="text-xs opacity-90">Your Real Account balance is {stats.currency} 0.00. Please deposit funds on Deriv to start trading.</p>
              </div>
            </div>
            <a
              href="https://app.deriv.com/cashier/deposit"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Deposit Now
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            label={`${stats.accountType === 'real' ? 'Live' : 'Demo'} Account Balance`}
            value={`${stats.currency} ${stats.balance.toLocaleString()}`}
            icon={Wallet}
            isLoading={!status && stats.balance === 0}
            color={stats.accountType === 'real' ? 'default' : 'default'}
          />
          <StatsCard
            label="Net Profit"
            value={`$${stats.netProfit.toFixed(2)}`}
            color={stats.netProfit >= 0 ? "green" : "red"}
            icon={Activity}
            isLoading={!analytics && stats.netProfit === 0}
          />
          <StatsCard
            label="Win Rate"
            value={`${stats.winRate}%`}
            icon={RefreshCw}
            isLoading={!analytics && stats.winRate === 0}
          />
          <StatsCard
            label="Current Streak"
            value={stats.streak.toString()}
            icon={stats.streak >= 0 ? CheckCircle : AlertTriangle}
            color={stats.streak > 0 ? "green" : stats.streak < 0 ? "red" : "default"}
            isLoading={!analytics && stats.streak === 0}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* Left Column (Chart & Signals) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bot Configuration (Moved here) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h3 className="font-bold flex items-center gap-2 shrink-0">
                  <SettingsIcon className="h-4 w-4" /> Bot Configuration
                </h3>
                <div className="grid grid-cols-2 md:flex items-end gap-3 w-full sm:w-auto">
                  <div className="col-span-2 md:col-auto flex items-end">
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to reset all trade history and stats? This cannot be undone.")) {
                          try {
                            await botApi.resetBot();
                            await fetchStats(); // Refresh stats immediately
                            alert("Bot history reset successfully.");
                          } catch (e) {
                            console.error("Reset failed", e);
                            alert("Failed to reset.");
                          }
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-accent text-xs font-medium transition-colors h-9"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset History
                    </button>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] text-red-500 font-bold uppercase block mb-1">Stop Loss ($)</label>
                    <input type="number" defaultValue={50} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm h-9" />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] text-green-500 font-bold uppercase block mb-1">Take Profit ($)</label>
                    <input type="number" defaultValue={100} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm h-9" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Trades / Profit Graph Placeholder */}
            <div className="rounded-xl border border-border bg-card p-6 min-h-[300px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Performance
                </h2>
              </div>
              <ProfitChart data={stats.profitHistory} />
            </div>

            {/* Recent Trades (Full Width now) */}
            {/* Recent Trades (Last 5) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Recent Activity</h3>
              </div>

              {!stats.recentTrades || stats.recentTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No trades yet. Start trading to see your history.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 font-medium">Symbol</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">Result</th>
                        <th className="px-4 py-2 font-medium text-right">P/L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.recentTrades.map((trade: any, i: number) => (
                        <tr key={i} className="hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 font-medium ${trade.contract_type === "CALL" ? "text-green-500" : "text-red-500"}`}>
                              {trade.contract_type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.status === "won" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                              }`}>
                              {trade.status}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${(trade.pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
                            }`}>
                            {(trade.pnl || 0) > 0 ? "+" : ""}{(trade.pnl || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Live Activity) */}
          <div className="flex flex-col h-full">
            <ActivityLog />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
