"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { ConfidenceGauge } from "@/components/ConfidenceGauge";
import { UpgradeModal } from "@/components/UpgradeModal";
import { AlertModal } from "@/components/AlertModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import dynamic from "next/dynamic";
const ActivityLog = dynamic(() => import("@/components/ActivityLog").then(mod => mod.ActivityLog), { ssr: false });
const ProfitChart = dynamic(() => import("@/components/ProfitChart").then(mod => mod.ProfitChart), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-secondary/10 animate-pulse rounded-lg mt-4" />
});
import { Bell, Wallet, ChevronDown, Activity, Play, RefreshCw, XCircle, Power, Loader2, CheckCircle, AlertTriangle, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { botApi, fetcher } from "@/lib/api";
import useSWR from "swr";
import { Skeleton } from "@/components/Skeleton";
import { NotificationBell } from "@/components/NotificationBell";

export default function Dashboard() {
  const router = useRouter(); // Initialize router
  const [loading, setLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const [alertState, setAlertState] = useState<{ isOpen: boolean, type: "error" | "success" | "info", title?: string, message: string }>({ isOpen: false, type: "error", message: "" });
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title?: string, message: string, onConfirm: () => void }>({ isOpen: false, message: "", onConfirm: () => { } });

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

  // State to track if we have attempted to load from cache
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Data Fetching with SWR (Optimized)
  const { data: analytics, mutate: refreshAnalytics } = useSWR('/bot/analytics', fetcher, {
    refreshInterval: 30000, // 30s
    dedupingInterval: 20000, // Don't re-fetch within 20s
    revalidateOnFocus: true, // Refresh on focus
    keepPreviousData: true // Keep showing old data while fetching
  });

  const { data: status, mutate: refreshStatus } = useSWR('/bot/status', fetcher, {
    refreshInterval: 10000, // 10s
    dedupingInterval: 5000,
    keepPreviousData: true
  });

  const { data: profile } = useSWR('/user/profile', fetcher);

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
    const cachedStats = localStorage.getItem("dunam_last_stats");
    if (cachedStats) {
      try {
        const parsed = JSON.parse(cachedStats);
        if (parsed.accountType) {
          setStats(parsed);
        }
      } catch (e) {
        console.error("Failed to parse cached stats", e);
      }
    }
    setIsHydrated(true); // Mark as hydrated so we can start saving updates
  }, []);

  // 2. Consolidate Caching Logic (Dual Cache)
  useEffect(() => {
    // Block saving if we haven't hydrated yet (prevents overwriting cache with default zeros)
    if (!isHydrated) return;

    if (stats.accountType) {
      // Save to general cache for initial load (current state)
      localStorage.setItem("dunam_last_stats", JSON.stringify(stats));

      // ALSO save to specific cache bucket
      const bucketKey = `dunam_cache_${stats.accountType}`;
      const cacheData = {
        balance: stats.balance,
        currency: stats.currency,
        timestamp: Date.now()
      };
      localStorage.setItem(bucketKey, JSON.stringify(cacheData));
    }
  }, [stats, isHydrated]);

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
      const response = await botApi.startBot();
      setIsConnected(true);
      setIsRunning(true);

      if (response.data?.welcomeMessage) {
        // Check if user has seen the trial start message before
        const hasSeenTrial = localStorage.getItem("hasSeenTrialStart");

        if (!hasSeenTrial) {
          localStorage.setItem("hasSeenTrialStart", "true");
          setAlertState({
            isOpen: true,
            type: "success",
            title: "Trial Activated! 🚀",
            message: response.data.welcomeMessage
          });
        } else {
          // If seen before, just show standard connected message
          setAlertState({
            isOpen: true,
            type: "success",
            title: "Bot Started Successfully! 🚀",
            message: "The AI engine is now active and scanning the market."
          });
        }
      } else {
        setAlertState({
          isOpen: true,
          type: "success",
          title: "Bot Started Successfully! 🚀",
          message: "The AI engine is now active and scanning the market."
        });
      }

      // Refresh status to get updated account info
      await checkConnection();
    } catch (e: any) {
      console.error(e);
      if (e.response?.data?.code === 'UPGRADE_REQUIRED') {
        setUpgradeMessage(e.response.data.error);
        setShowUpgradeModal(true);
        return;
      }
      const errorMsg = e.response?.data?.error || "Failed to start bot. Please check Settings.";
      setAlertState({ isOpen: true, type: "error", message: errorMsg });
    } finally {
      setConnecting(false);
    }
  };

  const performAccountSwitch = async (type: "real" | "demo") => {
    try {
      setIsSwitching(true);

      // Optimistic Update from Cache
      const bucketKey = `syntoic_cache_${type}`;
      const cachedData = localStorage.getItem(bucketKey);
      if (cachedData) {
        try {
          const parsedCache = JSON.parse(cachedData);
          if (parsedCache && parsedCache.timestamp) {
            console.log(`⚡ Optimistically applying cached ${type} stats`);
            setStats(prev => ({
              ...prev,
              balance: parsedCache.balance || 0,
              currency: parsedCache.currency || 'USD',
              accountType: type // Switch UI immediately
            }));
          }
        } catch (e) { console.error("Cache parse error", e); }
      } else {
        // If no cache, we still want to switch the UI toggle immediately to feel responsive
        setStats(prev => ({ ...prev, accountType: type }));
      }

      console.log(`🔄 Switching account to ${type}...`);
      const response = await botApi.toggleAccount(type);

      // Wait a moment for balance subscription to kick in
      await new Promise(r => setTimeout(r, 1000));

      await checkConnection(); // Refresh status immediately
      console.log("✅ Account switched successfully:", response.data);
      setAlertState({
        isOpen: true,
        type: "success",
        title: "Switched Successfully",
        message: type === "real" ? "You are now trading with REAL funds." : "Switched to Demo account."
      });
    } catch (e: any) {
      console.error("❌ Toggle failed:", e);
      const errorMsg = e.response?.data?.error || "Failed to switch account. Ensure tokens are configured in Settings.";
      setAlertState({ isOpen: true, type: "error", message: errorMsg });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleAccountSwitch = (type: "real" | "demo") => {
    if (stats.accountType === type) return;

    const confirmMsg = type === "real"
      ? "Switching to REAL account. Real funds will be used. Continue?"
      : "Switching to Demo account.";

    setConfirmState({
      isOpen: true,
      title: "Confirm Switch",
      message: confirmMsg,
      onConfirm: () => performAccountSwitch(type)
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-8 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">Dashboard</h1>
              {/* Subscription Badge */}
              {profile?.user ? (
                (profile.user.subscription_tier === 'pro' || profile.user.subscription_tier === 'premium') ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-black uppercase tracking-widest shadow-[0_0_10px_rgba(234,179,8,0.2)]">PRO</span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground border border-border font-black uppercase tracking-widest">FREE</span>
                )
              ) : (
                <div className="h-5 w-12 bg-secondary/30 rounded-full animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Account Toggle - Fixed event propagation */}
            <div className={`flex items-center bg-secondary/20 rounded-lg p-1 border border-border ${isSwitching ? 'opacity-50 pointer-events-none cursor-wait' : ''}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountSwitch('real');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${stats.accountType === 'real'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {isSwitching && stats.accountType !== 'real' && <Loader2 className="h-3 w-3 animate-spin" />} Real
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountSwitch('demo');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${stats.accountType === 'demo'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {isSwitching && stats.accountType !== 'demo' && <Loader2 className="h-3 w-3 animate-spin" />} Demo
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
            <NotificationBell />
          </div>
        </header>
        {/* Deriv Account Notice Banner - Only show if tokens are not configured */}
        {!status?.derivAccount && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Deriv Account Required
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500 text-white uppercase font-black">Mandatory</span>
                </h4>
                <p className="text-xs text-muted-foreground">You must have an active Deriv account to use Dunam Ai trading services. Don&apos;t have one yet?</p>
              </div>
            </div>
            <a
              href="https://partners.deriv.com/rx?ca=1069524e30dbb2&utm_campaign=dynamicworks&utm_medium=affiliate&utm_source=CU32294"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              Create Required Account
            </a>
          </div>
        )}

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Chart & Signals) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bot Configuration (Redesigned) */}
            <div className="rounded-xl border border-secondary/30 bg-card/50 backdrop-blur-sm p-6 overflow-hidden relative">
              {/* Subtle background glow */}
              <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/5 blur-2xl rounded-full" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col gap-1">
                  <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-foreground/80">
                    <SettingsIcon className="h-4 w-4 text-primary" /> Bot Configuration
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Trading Risk Management</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
                  <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                    {/* Stop Loss Input Group */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 px-2">
                        <div className="h-1 w-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                        <label className="text-[9px] font-black text-red-500/80 uppercase tracking-widest">Stop Loss ($)</label>
                      </div>
                      <div className="relative group">
                        <input
                          type="number"
                          defaultValue={50}
                          className="w-full sm:w-[120px] bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all hover:bg-secondary/30"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-opacity">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        </div>
                      </div>
                    </div>

                    {/* Take Profit Input Group */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 px-2">
                        <div className="h-1 w-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                        <label className="text-[9px] font-black text-green-500/80 uppercase tracking-widest">Take Profit ($)</label>
                      </div>
                      <div className="relative group">
                        <input
                          type="number"
                          defaultValue={100}
                          className="w-full sm:w-[120px] bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30 transition-all hover:bg-secondary/30"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-opacity">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset History Button */}
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to reset all trade history and stats? This cannot be undone.")) {
                        try {
                          await botApi.resetBot();
                          await fetchStats();
                          alert("Bot history reset successfully.");
                        } catch (e) {
                          console.error("Reset failed", e);
                          alert("Failed to reset.");
                        }
                      }
                    }}
                    className="h-[42px] px-5 flex items-center justify-center gap-2 rounded-xl bg-secondary/10 border border-border/40 hover:bg-secondary/20 hover:border-border transition-all text-[11px] font-black uppercase tracking-tighter w-full sm:w-auto"
                  >
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    <span>Reset Trades</span>
                  </button>
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
          <div className="flex flex-col h-full gap-6 overflow-hidden">
            {/* AI Confidence Widget */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> AI Probability Engine
                </h3>
                {status?.isRunning && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                )}
              </div>
              <ConfidenceGauge value={status?.performance?.confidence ?? 85} isLoading={!status} />
            </div>

            <div className="flex-1 min-h-0">
              <ActivityLog />
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
    </DashboardLayout >
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
