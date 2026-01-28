"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { botApi } from "@/lib/api";
import { Loader2, Save, AlertCircle } from "lucide-react";
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
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
            const fetchedConfig = response.data.botConfig;

            // Map backend snake_case to frontend camelCase if necessary, 
            // or usage of fetched config:
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
                });
                setSymbolsString(fetchedConfig.symbols ? fetchedConfig.symbols.join(", ") : "R_100");
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            // Don't show error on 404/empty, just use defaults
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
            // Parse symbols string back to array
            const symbolsArray = symbolsString.split(",").map(s => s.trim()).filter(s => s.length > 0);

            const payload = {
                ...config,
                symbols: symbolsArray,
            };

            await botApi.saveConfig(payload);
            setSuccess("Configuration saved successfully!");

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }


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
            setConfig({
                ...config,
                symbols: [...config.symbols, value]
            });
            setSymbolsString([...config.symbols, value].join(", "));
        }
        // Reset select
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

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />

            <main className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-8">Bot Settings</h1>

                <form onSubmit={handleSave} className="max-w-2xl space-y-8">

                    {/* General Settings */}
                    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold border-b border-border pb-2">Trading Parameters</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-sm font-medium">Active Symbols</label>

                                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-secondary/20 rounded-lg min-h-[42px]">
                                    {config.symbols.map((symbol) => (
                                        <span key={symbol} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-sm font-medium">
                                            {AVAILABLE_SYMBOLS.find(s => s.value === symbol)?.label || symbol}
                                            <button
                                                type="button"
                                                onClick={() => removeSymbol(symbol)}
                                                className="hover:bg-primary/20 rounded-full p-0.5 ml-1"
                                            >
                                                <AlertCircle className="h-3 w-3 rotate-45" />
                                            </button>
                                        </span>
                                    ))}
                                    {config.symbols.length === 0 && (
                                        <span className="text-muted-foreground text-sm italic px-2 py-1">No symbols selected</span>
                                    )}
                                </div>

                                <div className="relative">
                                    <select
                                        onChange={handleAddSymbol}
                                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>+ Add a symbol...</option>
                                        {AVAILABLE_SYMBOLS.map((s) => (
                                            <option key={s.value} value={s.value} disabled={config.symbols.includes(s.value)}>
                                                {s.label} ({s.value})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-2.5 pointer-events-none text-muted-foreground">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stake Amount ($)</label>
                                <input
                                    type="number"
                                    value={config.amountPerTrade}
                                    onChange={(e) => setConfig({ ...config, amountPerTrade: Number(e.target.value) })}
                                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Timeframe (Minutes)</label>
                                <select
                                    value={config.timeframe}
                                    onChange={(e) => setConfig({ ...config, timeframe: Number(e.target.value) })}
                                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                    <option value={1}>1 Minute</option>
                                    <option value={3}>3 Minutes</option>
                                    <option value={5}>5 Minutes</option>
                                    <option value={15}>15 Minutes</option>
                                    <option value={60}>1 Hour</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contract Type</label>
                                <select
                                    value={config.contractPreference}
                                    onChange={(e) => setConfig({ ...config, contractPreference: e.target.value })}
                                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                >
                                    <option value="RISE/FALL">Rise / Fall</option>
                                    <option value="TOUCH/NO_TOUCH">Touch / No Touch</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Risk Management */}
                    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                        <h2 className="text-lg font-semibold border-b border-border pb-2">Risk Management</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Daily Trade Limit</label>
                                <input
                                    type="number"
                                    value={config.dailyTradeLimit}
                                    onChange={(e) => setConfig({ ...config, dailyTradeLimit: Number(e.target.value) })}
                                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Trades / Cycle</label>
                                <input
                                    type="number"
                                    value={config.maxTradesPerCycle}
                                    onChange={(e) => setConfig({ ...config, maxTradesPerCycle: Number(e.target.value) })}
                                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            {/* Note: Stop Loss / Take Profit not supported by backend yet, so omitted */}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500 text-sm">
                            <Save className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Configuration
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
