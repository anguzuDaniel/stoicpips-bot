import { Response } from 'express';
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
const { supabase } = require('../../../config/supabase');

/**
 * Get aggregated analytics for the user
 */
const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // Fetch all trades for this user
        const { data: trades, error } = await supabase
            .from('trades')
            .select('entry_price, payout, pnl, status, contract_type, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;

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
        const profitHistory: any[] = [];
        let cumulativeProfit = 0;

        trades.forEach((trade: any) => {
            const pnl = parseFloat(trade.pnl);
            totalProfit += pnl;
            cumulativeProfit += pnl;

            if (trade.status === 'won') {
                wins++;
                if (pnl > largestWin) largestWin = pnl;
            } else {
                losses++;
                if (pnl < largestLoss) largestLoss = pnl;
            }

            // Group by day or hour could be done here, simplified for now
            profitHistory.push({
                date: new Date(trade.created_at).toLocaleDateString(),
                profit: cumulativeProfit,
                dailyPnl: pnl
            });
        });

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
            ]
        });

    } catch (error: any) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

export { getAnalytics };
