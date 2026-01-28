'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useRouter } from 'next/navigation';
import ConfigureModal from '../components/ConfigureModal';
export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [botStatus, setBotStatus] = useState('stopped');
    const [showConfig, setShowConfig] = useState(false);
    const [botConfig, setBotConfig] = useState({
        riskPerTrade: 2,
        maxDailyTrades: 5,
        vixPairs: ['VIX10', 'VIX25'],
    });
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data.user) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);
            }
            catch (error) {
                console.error('Error fetching user:', error);
                router.push('/login');
            }
            finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);
    const handleStartBot = () => setBotStatus('running');
    const handleStopBot = () => setBotStatus('stopped');
    const handleConfigChange = (key, value) => {
        setBotConfig(prev => ({ ...prev, [key]: value }));
    };
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx("div", { className: "w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) }), _jsx(Footer, {})] }));
    }
    if (!user)
        return null;
    const userName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Trader';
    const hasPaid = user.user_metadata?.has_paid || false;
    // Simple stats
    const stats = {
        totalTrades: 47,
        winRate: 68,
        profitLoss: 1250,
        activePairs: botConfig.vixPairs.length,
    };
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [showConfig && (_jsx(ConfigureModal, { showConfig: showConfig, setShowConfig: setShowConfig, initialConfig: botConfig })), _jsx(Navbar, {}), _jsxs("main", { className: "p-4 sm:p-6 max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-6 sm:mb-8", children: [_jsxs("h1", { className: "text-xl sm:text-2xl font-bold text-gray-800", children: ["Welcome, ", userName] }), _jsx("p", { className: "text-gray-600 text-sm sm:text-base", children: "Trading Dashboard" })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-blue-600 text-base sm:text-lg", children: "\uD83E\uDD16" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-base sm:text-lg font-semibold text-gray-800", children: "Stoic Pips Bot" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${botStatus === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}` }), _jsxs("p", { className: "text-gray-600 text-xs sm:text-sm", children: [botStatus === 'running' ? 'Running' : 'Stopped', " \u2022 VIX Auto Trading"] })] })] })] }), _jsxs("div", { className: "flex gap-2 w-full sm:w-auto", children: [botStatus === 'stopped' ? (_jsxs("button", { onClick: handleStartBot, className: "flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-sm sm:text-base", children: [_jsx("span", { children: "\u25B6" }), _jsx("span", { className: "hidden xs:inline", children: "Start" })] })) : (_jsxs("button", { onClick: handleStopBot, className: "flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm sm:text-base", children: [_jsx("span", { children: "\u23F9" }), _jsx("span", { className: "hidden xs:inline", children: "Stop" })] })), _jsxs("button", { onClick: () => setShowConfig(true), className: "flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm sm:text-base", children: [_jsx("span", { children: "\u2699\uFE0F" }), _jsx("span", { className: "hidden xs:inline", children: "Configure" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6", children: [_jsxs("div", { className: "text-center p-3 sm:p-4 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "text-base sm:text-lg font-bold text-gray-800", children: stats.totalTrades }), _jsx("div", { className: "text-gray-600 text-xs sm:text-sm", children: "Total Trades" })] }), _jsxs("div", { className: "text-center p-3 sm:p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "text-base sm:text-lg font-bold text-green-600", children: [stats.winRate, "%"] }), _jsx("div", { className: "text-gray-600 text-xs sm:text-sm", children: "Win Rate" })] }), _jsxs("div", { className: "text-center p-3 sm:p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "text-base sm:text-lg font-bold text-gray-800", children: ["$", stats.profitLoss] }), _jsx("div", { className: "text-gray-600 text-xs sm:text-sm", children: "Profit" })] }), _jsxs("div", { className: "text-center p-3 sm:p-4 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "text-base sm:text-lg font-bold text-blue-600", children: stats.activePairs }), _jsx("div", { className: "text-gray-600 text-xs sm:text-sm", children: "Active Pairs" })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-3 sm:pt-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-2 sm:mb-3", children: "Current Settings" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm", children: [_jsxs("div", { className: "flex justify-between sm:block", children: [_jsx("span", { className: "text-gray-600", children: "Risk:" }), _jsxs("span", { className: "text-gray-800", children: [botConfig.riskPerTrade, "%"] })] }), _jsxs("div", { className: "flex justify-between sm:block", children: [_jsx("span", { className: "text-gray-600", children: "Max Trades:" }), _jsxs("span", { className: "text-gray-800", children: [botConfig.maxDailyTrades, "/day"] })] }), _jsxs("div", { className: "sm:col-span-2 flex flex-col sm:block", children: [_jsx("span", { className: "text-gray-600", children: "VIX Pairs:" }), _jsx("span", { className: "text-gray-800 text-xs sm:text-sm mt-1 sm:mt-0 sm:ml-2", children: botConfig.vixPairs.length > 0
                                                            ? botConfig.vixPairs.join(', ')
                                                            : 'None selected' })] })] })] })] })] }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=page.js.map