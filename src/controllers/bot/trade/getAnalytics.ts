import { Response } from 'express';
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
const { supabase } = require('../../../config/supabase');

/**
 * Get aggregated analytics for the user
 */
const botStates = require('../../../types/botStates');

/**
 * Get aggregated analytics for the user
 */
const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const botState = botStates.get(userId);
        let trades: any[] = [];

        // 1. Try fetching from Deriv if connected
        if (botState && botState.derivWS && botState.derivWS.getStatus().authorized) {
            console.log(`📡 Fetching profit table from Deriv for user ${userId}`);
            try {
                const derivTrades = await botState.derivWS.getProfitTable(50); // Fetch last 50

                // Map Deriv trades to our schema
                trades = derivTrades.map((t: any) => ({
                    entry_price: t.buy_price,
                    payout: t.sell_price,
                    pnl: parseFloat(t.sell_price) - parseFloat(t.buy_price), // or t.profit_loss if available? usually sell - buy
                    status: (parseFloat(t.sell_price) - parseFloat(t.buy_price)) >= 0 ? 'won' : 'lost',
                    contract_type: t.longcode.includes('CALL') ? 'CALL' : t.longcode.includes('PUT') ? 'PUT' : 'UNKNOWN',
                    created_at: new Date(t.purchase_time * 1000).toISOString(), // Epoch to ISO
                    contract_id: t.contract_id
                }));

                // Sort by time asc for charts
                trades.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            } catch (err) {
                console.error("Failed to fetch Deriv history:", err);
                // Fallback?
            }
        }

        // 2. Fallback to DB if Deriv failed or not connected
        if (trades.length === 0) {
            console.log(`⚠️ Bot not connected or Deriv empty. Falling back to DB for user ${userId}`);
            const { data: dbTrades, error } = await supabase
                .from('trades')
                .select('entry_price, payout, pnl, status, contract_type, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: true }); // History order

            if (!error && dbTrades) {
                trades = dbTrades;
            }
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
        const profitHistory: any[] = [];
        let cumulativeProfit = 0;

        trades.forEach((trade: any) => {
            const pnl = parseFloat(trade.pnl || (trade.payout - trade.entry_price)); // Robustness
            totalProfit += pnl;
            cumulativeProfit += pnl;

            // Determine status if not set
            const isWin = pnl >= 0; // >= 0 usually win/breakeven

            if (isWin) {
                wins++;
                if (pnl > largestWin) largestWin = pnl;
            } else {
                losses++;
                if (pnl < largestLoss) largestLoss = pnl;
            }

            // Group by day or hour could be done here, simplified for now
            profitHistory.push({
                date: new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Show time for recent trades
                profit: cumulativeProfit,
                dailyPnl: pnl
            });
        });

        // Calculate Streak (Iterate backwards)
        let currentStreak = 0;
        if (trades.length > 0) {
            const reversedTrades = [...trades].reverse();
            const lastIsWin = reversedTrades[0].pnl >= 0;

            for (let i = 0; i < reversedTrades.length; i++) {
                const isWin = reversedTrades[i].pnl >= 0;
                if (isWin === lastIsWin) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            currentStreak = lastIsWin ? currentStreak : -currentStreak;
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

    } catch (error: any) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

export { getAnalytics };
