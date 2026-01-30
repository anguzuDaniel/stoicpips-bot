"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { botApi } from "@/lib/api";
import { Loader2, Save, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface BotConfig {
    symbols: string[];
    amountPerTrade: number;
    timeframe: number;
    candleCount: number;
    cycleInterval: number;
    contractPreference: string;
    maxTradesPerCycle: number;
    dailyTradeLimit: number;
    derivApiToken?: string;
    derivRealToken?: string;
    derivDemoToken?: string;
    openaiApiKey?: string;
    aiProvider?: 'local' | 'openai';
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Visibility toggles
    const [showDemoToken, setShowDemoToken] = useState(false);
    const [showRealToken, setShowRealToken] = useState(false);
    const [showOpenAiKey, setShowOpenAiKey] = useState(false);

    const [config, setConfig] = useState<BotConfig>({
        symbols: ["R_100"],
        amountPerTrade: 10,
        timeframe: 5,
        candleCount: 10,
        cycleInterval: 30,
        contractPreference: "RISE/FALL",
        maxTradesPerCycle: 3,
        dailyTradeLimit: 5,
    });

    const [symbolsString, setSymbolsString] = useState("R_100");

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await botApi.getConfigs();
            const fetchedConfig = response.data;

            if (fetchedConfig && Object.keys(fetchedConfig).length > 0) {
                setConfig({
                    symbols: fetchedConfig.symbols || ["R_100"],
                    amountPerTrade: fetchedConfig.amount_per_trade || 10,
                    timeframe: fetchedConfig.timeframe || 5,
                    candleCount: fetchedConfig.candle_count || 10,
                    cycleInterval: fetchedConfig.cycle_interval || 30,
                    contractPreference: fetchedConfig.contract_preference || "RISE/FALL",
                    maxTradesPerCycle: fetchedConfig.max_trades_per_cycle || 3,
                    dailyTradeLimit: fetchedConfig.daily_trade_limit || 5,
                    derivApiToken: fetchedConfig.deriv_api_token,
                    derivRealToken: fetchedConfig.deriv_real_token,
                    derivDemoToken: fetchedConfig.deriv_demo_token,
                    openaiApiKey: fetchedConfig.openai_api_key,
                    aiProvider: fetchedConfig.ai_provider || 'local',
                });
                setSymbolsString(fetchedConfig.symbols ? fetchedConfig.symbols.join(", ") : "R_100");
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            setError("Could not load bot configuration.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const symbolsArray = symbolsString.split(",").map(s => s.trim()).filter(s => s.length > 0);

            const payload = {
                ...config,
                symbols: symbolsArray,
            };

            await botApi.saveConfig(payload);
            setSuccess("Configuration saved successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const AVAILABLE_SYMBOLS = [
        { value: "R_10", label: "Volatility 10 Index" },
        { value: "R_25", label: "Volatility 25 Index" },
        { value: "R_50", label: "Volatility 50 Index" },
        { value: "R_75", label: "Volatility 75 Index" },
        { value: "R_100", label: "Volatility 100 Index" },
        { value: "1HZ10V", label: "Volatility 10 (1s) Index" },
        { value: "1HZ25V", label: "Volatility 25 (1s) Index" },
        { value: "1HZ50V", label: "Volatility 50 (1s) Index" },
        { value: "1HZ75V", label: "Volatility 75 (1s) Index" },
        { value: "1HZ100V", label: "Volatility 100 (1s) Index" },
        { value: "JD10", label: "Jump 10 Index" },
        { value: "JD25", label: "Jump 25 Index" },
        { value: "JD50", label: "Jump 50 Index" },
        { value: "JD75", label: "Jump 75 Index" },
        { value: "JD100", label: "Jump 100 Index" },
    ];

    const handleAddSymbol = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value && !config.symbols.includes(value)) {
            const newSymbols = [...config.symbols, value];
            setConfig({
                ...config,
                symbols: newSymbols
            });
            setSymbolsString(newSymbols.join(", "));
        }
        e.target.value = "";
    };

    const removeSymbol = (symbolToRemove: string) => {
        const newSymbols = config.symbols.filter(s => s !== symbolToRemove);
        setConfig({
            ...config,
            symbols: newSymbols
        });
        setSymbolsString(newSymbols.join(", "));
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-8">Bot Settings</h1>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trading Parameters */}
                        <div className="rounded-xl border border-border bg-card p-6 space-y-6 h-full shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary" />
                                Trading Parameters
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Symbols</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-secondary/10 rounded-xl min-h-[50px] border border-border/50">
                                        {config.symbols.map((symbol) => (
                                            <span key={symbol} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                                                {AVAILABLE_SYMBOLS.find(s => s.value === symbol)?.label || symbol}
                                                <button
                                                    type="button"
                                                    onClick={() => removeSymbol(symbol)}
                                                    className="hover:bg-primary/20 rounded-full p-1 ml-1 transition-colors"
                                                >
                                                    <AlertCircle className="h-3.5 w-3.5 rotate-45" />
                                                </button>
                                            </span>
                                        ))}
                                        {config.symbols.length === 0 && (
                                            <span className="text-muted-foreground text-xs italic">No symbols selected</span>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <select
                                            onChange={handleAddSymbol}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none appearance-none transition-all cursor-pointer"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>+ Add a symbol...</option>
                                            {AVAILABLE_SYMBOLS.map((s) => (
                                                <option key={s.value} value={s.value} disabled={config.symbols.includes(s.value)}>
                                                    {s.label} ({s.value})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3 pointer-events-none text-muted-foreground">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Stake Amount ($)</label>
                                        <input
                                            type="number"
                                            value={config.amountPerTrade}
                                            onChange={(e) => setConfig({ ...config, amountPerTrade: Number(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
                                        <select
                                            value={config.timeframe}
                                            onChange={(e) => setConfig({ ...config, timeframe: Number(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value={1}>1 Minute</option>
                                            <option value={3}>3 Minutes</option>
                                            <option value={5}>5 Minutes</option>
                                            <option value={15}>15 Minutes</option>
                                            <option value={60}>1 Hour</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                                        <select
                                            value={config.contractPreference}
                                            onChange={(e) => setConfig({ ...config, contractPreference: e.target.value })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value="RISE/FALL">Rise / Fall</option>
                                            <option value="TOUCH/NO_TOUCH">Touch / No Touch</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column Grid - Nested */}
                        <div className="space-y-6 flex flex-col">
                            {/* Risk Management */}
                            <div className="rounded-xl border border-border bg-card p-6 space-y-6 flex-grow shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    Risk Management
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Daily Trade Limit</label>
                                        <input
                                            type="number"
                                            value={config.dailyTradeLimit}
                                            onChange={(e) => setConfig({ ...config, dailyTradeLimit: Number(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Max Trades / Cycle</label>
                                        <input
                                            type="number"
                                            value={config.maxTradesPerCycle}
                                            onChange={(e) => setConfig({ ...config, maxTradesPerCycle: Number(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* AI Configuration */}
                            <div className="rounded-xl border border-border bg-card p-6 space-y-6 flex-grow shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="text-lg font-semibold border-b border-border pb-2 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    AI Engine
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-3 block">Signal Provider</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setConfig({ ...config, aiProvider: 'local' })}
                                                className={`p-4 rounded-xl border text-left transition-all group ${config.aiProvider !== 'openai'
                                                    ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/50'
                                                    : 'border-border hover:border-indigo-500/30 hover:bg-indigo-500/5'
                                                    }`}
                                            >
                                                <div className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">Internal Model</div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">Uses built-in XGBoost analysis. Fast and optimized for synthetics.</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfig({ ...config, aiProvider: 'openai' })}
                                                className={`p-4 rounded-xl border text-left transition-all group ${config.aiProvider === 'openai'
                                                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/50'
                                                    : 'border-border hover:border-emerald-500/30 hover:bg-emerald-500/5'
                                                    }`}
                                            >
                                                <div className="font-semibold mb-1 group-hover:text-emerald-400 transition-colors">OpenAI GPT-4</div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">Advanced LLM market analysis. Requires valid API Key.</p>
                                            </button>
                                        </div>
                                    </div>

                                    {config.aiProvider === 'openai' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2">OpenAI API Key</label>
                                            <div className="relative">
                                                <input
                                                    type={showOpenAiKey ? "text" : "password"}
                                                    value={config.openaiApiKey || ''}
                                                    onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                                                    placeholder="sk-..."
                                                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm pr-11 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                                                >
                                                    {showOpenAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deriv Configuration */}
                    <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-4 md:pb-2 gap-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    Deriv Connection
                                </h2>
                                <a
                                    href="https://partners.deriv.com/rx?ca=1069524e30dbb2&utm_campaign=dynamicworks&utm_medium=affiliate&utm_source=CU32294"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto justify-center md:justify-start"
                                >
                                    Don&apos;t have a Deriv account? (Mandatory)
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    Demo Account Token
                                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">VRTC...</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showDemoToken ? "text" : "password"}
                                        value={config.derivDemoToken || config.derivApiToken || ''}
                                        onChange={(e) => setConfig({ ...config, derivDemoToken: e.target.value })}
                                        placeholder="p-XXXXX..."
                                        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm pr-11 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDemoToken(!showDemoToken)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    >
                                        {showDemoToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    Real Account Token
                                    <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded uppercase">CR...</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showRealToken ? "text" : "password"}
                                        value={config.derivRealToken || ''}
                                        onChange={(e) => setConfig({ ...config, derivRealToken: e.target.value })}
                                        placeholder="r-XXXXX..."
                                        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm pr-11 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRealToken(!showRealToken)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    >
                                        {showRealToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages & Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-8">
                        <div className="flex-1 w-full sm:w-auto">
                            {error && (
                                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm animate-in fade-in slide-in-from-left-2 shadow-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-500 text-sm animate-in fade-in slide-in-from-left-2 shadow-sm">
                                    <Save className="h-4 w-4" />
                                    {success}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="px-6 py-2.5 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-2.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>

                <div className="pt-8 text-center pb-4">
                    <span className="text-xs font-mono text-muted-foreground/40 select-all">
                        App Version: v1.0.0-beta.1
                    </span>
                </div>
            </div>
        </DashboardLayout>
    );
}
