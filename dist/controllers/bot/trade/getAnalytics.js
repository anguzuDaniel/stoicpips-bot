"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const supabase_1 = require("../../../config/supabase");
const botStates_1 = require("../../../types/botStates");
/**
 * Get aggregated analytics for the user
 */
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const botState = botStates_1.botStates.get(userId);
        const now = Date.now();
        const CACHE_TTL = 10000; // 10 seconds (Short cache for responsiveness)
        // 0. Check Cache
        if (botState && botState.analyticsCache && (now - botState.analyticsCache.timestamp < CACHE_TTL)) {
            // Keep cache active
            return res.json(botState.analyticsCache.data);
        }
        // 1. Trigger Background Sync (Fire & Forget)
        // We do this to ensure DB is eventually consistent, but we don't wait for it to avoid slow loading.
        Promise.resolve().then(() => __importStar(require('../history/syncTrades'))).then(({ syncTrades }) => {
            syncTrades(userId).catch(err => console.error("Background sync error:", err));
        });
        // 2. Fetch exclusively from DB
        let trades = [];
        const { data: dbTrades, error } = await supabase_1.supabase
            .from('trades')
            .select('*') // Select all fields including new ones
            .eq('user_id', userId)
            .order('created_at', { ascending: true }); // Ascending for calculations
        if (dbTrades)
            trades = dbTrades;
        if (error) {
            console.error("DB Fetch Error:", error);
        }
        if (!trades || trades.length === 0) {
            return res.json({
                totalTrades: 0,
                winRate: 0,
                totalProfit: 0,
                largestWin: 0,
                largestLoss: 0,
                averageProfit: 0,
                profitHistory: [],
                winLossData: [
                    { name: 'Wins', value: 0 },
                    { name: 'Losses', value: 0 },
                ],
                currentStreak: 0
            });
        }
        let totalProfit = 0;
        let wins = 0;
        let losses = 0;
        let largestWin = 0;
        let largestLoss = 0;
        // Aggregated data for charts
        const profitHistory = [];
        let cumulativeProfit = 0;
        // Sort by date ascending for charts
        trades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        trades.forEach((trade) => {
            const pnl = parseFloat(trade.pnl);
            totalProfit += pnl;
            cumulativeProfit += pnl;
            // Determine status if not set
            const isWin = pnl >= 0; // >= 0 usually win/breakeven
            if (isWin) {
                wins++;
                if (pnl > largestWin)
                    largestWin = pnl;
            }
            else {
                losses++;
                if (pnl < largestLoss)
                    largestLoss = pnl;
            }
            // Group by day or hour could be done here, simplified for now
            profitHistory.push({
                date: new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Show time for recent trades
                profit: cumulativeProfit,
                dailyPnl: pnl
            });
        });
        // Calculate Streak (Iterate backwards from newest)
        let currentStreak = 0;
        if (trades.length > 0) {
            const reversedTrades = [...trades].reverse();
            const lastIsWin = parseFloat(reversedTrades[0].pnl) >= 0;
            for (let i = 0; i < reversedTrades.length; i++) {
                const isWin = parseFloat(reversedTrades[i].pnl) >= 0;
                if (isWin === lastIsWin) {
                    currentStreak++;
                }
                else {
                    break;
                }
            }
            currentStreak = lastIsWin ? currentStreak : -currentStreak;
        }
        const totalTrades = trades.length;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const averageProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;
        // Get last 5 trades for dashboard
        const recentTrades = trades.slice(-5).reverse();
        const responseData = {
            totalTrades,
            winRate: parseFloat(winRate.toFixed(2)),
            totalProfit: parseFloat(totalProfit.toFixed(2)),
            largestWin,
            largestLoss,
            averageProfit: parseFloat(averageProfit.toFixed(2)),
            profitHistory: profitHistory.slice(-20), // Send last 20 data points for chart
            winLossData: [
                { name: 'Wins', value: wins, fill: '#22c55e' },
                { name: 'Losses', value: losses, fill: '#ef4444' },
            ],
            currentStreak,
            recentTrades
        };
        // 4. Update Cache
        if (botState) {
            botState.analyticsCache = {
                data: responseData,
                timestamp: Date.now()
            };
        }
        res.json(responseData);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getAnalytics = getAnalytics;
