"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { TradingChart } from "@/components/TradingChart";
import { TradeForm } from "@/components/TradeForm";
import { Bell, Wallet, ChevronDown, Activity, Play, RefreshCw, XCircle } from "lucide-react";

export default function Dashboard() {
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
              <span className="text-sm font-bold text-foreground">$10,000.00</span>
            </div>
            {/* Mobile Balance (Compact) */}
            <div className="md:hidden flex items-center bg-card border border-border px-2 py-1.5 rounded-lg">
              <span className="text-sm font-bold text-foreground">$10k</span>
            </div>

            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-sm">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Connect
            </button>
            <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatsCard label="Total Trades" value="0" />
          <StatsCard label="% Win Rate" value="0.0%" color="red" />
          <StatsCard label="$ Net Profit" value="+0.00" color="green" />
          <StatsCard label="Wins" value="0" color="green" icon={Activity} />
          <StatsCard label="Losses" value="0" color="red" icon={XCircle} />
          <StatsCard label="Streak" value="0" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Chart & Signals) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chart Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold">Volatility 10 Index</h2>
                    <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">9841.82</span>
                    <span className="text-sm font-medium text-primary flex items-center gap-1">
                      +12.45 (0.13%)
                    </span>
                  </div>
                </div>
                <div className="flex bg-secondary/50 rounded-lg p-1">
                  {['1m', '5m', '15m', '1h', '4h', '1D'].map((time) => (
                    <button
                      key={time}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${time === '5m' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <TradingChart />
                <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground">
                  V10 Price Chart
                </div>
              </div>
            </div>

            {/* Bottom Row (Bot Config & Recent Trades) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bot Configuration */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" /> Bot Configuration
                  </h3>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-xs font-medium transition-colors">
                      <RefreshCw className="h-3 w-3" /> Reset
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 text-xs font-medium transition-colors">
                      <Play className="h-3 w-3" /> Start Bot
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Trading Strategy</label>
                    <div className="bg-input border border-border rounded-lg p-2 text-sm">
                      <span className="font-medium">Martingale</span>
                      <p className="text-xs text-muted-foreground">Double stake after loss</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Base Stake ($)</label>
                    <input type="number" defaultValue={10} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-red-500 block mb-1">Stop Loss ($)</label>
                      <input type="number" defaultValue={100} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-green-500 block mb-1">Take Profit ($)</label>
                      <input type="number" defaultValue={50} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Trades (Placeholder) */}
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

          </div>

          {/* Right Column (Place Trade & Indicators) */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col items-center justify-center h-[120px] mb-6 border border-dashed border-border rounded-lg bg-secondary/10">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-border flex items-center justify-center">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-muted border-2 border-card" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground font-medium">No active trade</p>
                <p className="text-xs text-muted-foreground opacity-60">Place a trade or start the bot</p>
              </div>

              <div className="mb-4">
                <h3 className="font-bold mb-4">Place Trade</h3>
                <TradeForm />
              </div>
            </div>
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
