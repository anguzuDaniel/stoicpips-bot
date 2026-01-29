"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const { supabase } = require('../../../config/supabase');
/**
 * Get aggregated analytics for the user
 */
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch all trades for this user
        const { data: trades, error } = await supabase
            .from('trades')
            .select('entry_price, payout, pnl, status, contract_type, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (error)
            throw error;
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
                ]
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
        trades.forEach((trade) => {
            const pnl = parseFloat(trade.pnl);
            totalProfit += pnl;
            cumulativeProfit += pnl;
            if (trade.status === 'won') {
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
                date: new Date(trade.created_at).toLocaleDateString(),
                profit: cumulativeProfit,
                dailyPnl: pnl
            });
        });
        // Calculate Streak (Iterate backwards)
        let currentStreak = 0;
        if (trades.length > 0) {
            const lastTrade = trades[trades.length - 1];
            const isWin = lastTrade.status === 'won';
            for (let i = trades.length - 1; i >= 0; i--) {
                if ((trades[i].status === 'won') === isWin) {
                    currentStreak++;
                }
                else {
                    break;
                }
            }
            // If it's a losing streak, make it negative or just keep the number? 
            // Usually dashboard shows green/red number. Let's just return the counts.
            // But for "Streak", let's return the signed integer: +5 (wins) or -3 (losses).
            currentStreak = isWin ? currentStreak : -currentStreak;
        }
        const totalTrades = trades.length;
        const winRate = (wins / totalTrades) * 100;
        const averageProfit = totalProfit / totalTrades;
        res.json({
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
            currentStreak
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getAnalytics = getAnalytics;
