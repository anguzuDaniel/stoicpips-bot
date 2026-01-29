"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { ActivityLog } from "@/components/ActivityLog";
import { ProfitChart } from "@/components/ProfitChart";
import { Bell, Wallet, ChevronDown, Activity, Play, RefreshCw, XCircle, Power, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { botApi } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter(); // Initialize router
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchStats();
  }, []);

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
    accountType: 'demo'
  });

  const fetchStats = async () => {
    try {
      const res = await botApi.getAnalytics();
      if (res.data) {
        setStats(prev => ({
          ...prev,
          totalTrades: res.data.totalTrades,
          winRate: res.data.winRate,
          netProfit: res.data.totalProfit,
          wins: res.data.winLossData.find((d: any) => d.name === 'Wins')?.value || 0,
          losses: res.data.winLossData.find((d: any) => d.name === 'Losses')?.value || 0,
          streak: res.data.currentStreak || 0,
          profitHistory: res.data.profitHistory || []
        }));
      }
    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  const checkConnection = async () => {
    try {
      const res = await botApi.getStatus();
      if (res.data) {
        setIsConnected(true);
        // Assuming status returns if bot is running
        setIsRunning(res.data.isActive || false);

        // Sync account info from status
        if (res.data.derivAccount) {
          setStats(prev => ({
            ...prev,
            balance: res.data.derivAccount.balance || 0,
            currency: res.data.derivAccount.currency || 'USD',
            accountType: res.data.derivAccount.accountType || 'demo'
          }));
        }
      }
    } catch (e) {
      console.error("Connection check failed", e);
      setIsConnected(false);
    }
  };

  // Poll stats every 10 seconds if connected
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (isConnected) {
        // If already connected, maybe just refresh status
        await checkConnection();
      } else {
        // Attempt to start the bot
        await botApi.startBot();
        setIsConnected(true);
        setIsRunning(true);
        // You might want to show a success toast here
      }
    } catch (e: any) {
      console.error(e);
      // Simple alert for now, or use a toast component if available
      alert(e.response?.data?.error || "Failed to connect. Please check Settings.");
      if (e.response?.data?.error?.includes("Token")) {
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
      await botApi.toggleAccount(type);
      await checkConnection(); // Refresh status immediately
    } catch (e: any) {
      alert("Failed to switch account. Ensure tokens are configured in Settings.");
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
            <div className="hidden md:flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Balance:</span>
              <span className="text-sm font-bold text-foreground">
                {stats.currency} {stats.balance.toFixed(2)}
              </span>
            </div>
            {/* Mobile Balance */}
            <div className="md:hidden flex items-center bg-card border border-border px-2 py-1.5 rounded-lg">
              <span className="text-sm font-bold text-foreground">{stats.currency} {stats.balance.toFixed(0)}</span>
            </div>

            {/* Account Toggle */}
            <div className="flex items-center bg-secondary/20 rounded-lg p-1 border border-border">
              <button
                onClick={() => handleAccountSwitch('real')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${stats.accountType === 'real'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Real
              </button>
              <button
                onClick={() => handleAccountSwitch('demo')}
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
                  if (!isConnected) {
                    await handleConnect();
                    // Auto-start after connect if successful
                    await botApi.startBot();
                    setIsRunning(true);
                  } else if (isRunning) {
                    await botApi.stopBot();
                    setIsRunning(false);
                  } else {
                    await botApi.startBot();
                    setIsRunning(true);
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
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatsCard label="Total Trades" value={stats.totalTrades.toString()} />
          <StatsCard label="% Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? "green" : "red"} />
          <StatsCard label="$ Net Profit" value={`${stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)}`} color={stats.netProfit >= 0 ? "green" : "red"} />
          <StatsCard label="Wins" value={stats.wins.toString()} color="green" icon={Activity} />
          <StatsCard label="Losses" value={stats.losses.toString()} color="red" icon={XCircle} />
          <StatsCard label="Streak" value={stats.streak.toString()} color={stats.streak > 0 ? "green" : stats.streak < 0 ? "red" : "default"} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Chart & Signals) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bot Configuration (Moved here) */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" /> Bot Configuration
                </h3>
                <div className="flex gap-2">
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs font-medium transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Reset
                  </button>
                  <div>
                    <label className="text-xs text-red-500 block mb-1">Stop Loss ($)</label>
                    <input type="number" defaultValue={50} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-green-500 block mb-1">Take Profit ($)</label>
                    <input type="number" defaultValue={100} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
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
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Recent Trades</h3>
              </div>
              <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No trades yet. Start trading to see your history.</p>
              </div>
            </div>

          </div>

          {/* Right Column (Live Activity) */}
          <div className="space-y-6 lg:h-full">
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
