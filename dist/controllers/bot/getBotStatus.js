"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getBotStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const botState = botStates.get(userId);
        console.log(`📊 Getting bot status for user ${userId}`);
        if (!botState) {
            // Check database for historical status
            const { data: status, error } = await supabase
                .from("bot_status")
                .select("*")
                .eq("user_id", userId)
                .single();
            if (error && error.code !== 'PGRST116') {
                return res.status(400).json({ error: error.message });
            }
            return res.json({
                isRunning: false,
                startedAt: status?.started_at || null,
                stoppedAt: status?.stopped_at || null,
                currentTrades: [],
                totalProfit: 0,
                tradesExecuted: 0,
                message: "Bot not currently running",
                user: {
                    id: userId,
                    subscription: req.user.subscription_status
                }
            });
        }
        const activeTrades = botState.currentTrades.filter((trade) => trade.status === 'open');
        const closedTrades = botState.currentTrades.filter((trade) => trade.status === 'closed');
        res.json({
            isRunning: botState.isRunning,
            startedAt: botState.startedAt,
            stoppedAt: null,
            performance: {
                totalProfit: botState.totalProfit,
                tradesExecuted: botState.tradesExecuted,
                activeTrades: activeTrades.length,
                closedTrades: closedTrades.length,
                winRate: botState.tradesExecuted > 0 ?
                    ((botState.tradesExecuted - closedTrades.filter((t) => t.pnl < 0).length) / botState.tradesExecuted * 100).toFixed(1) : 0
            },
            activeTrades: activeTrades,
            config: botState.config,
            derivConnected: botState.derivConnected,
            status: botState.isRunning ? "running" : "stopped",
            user: {
                id: userId,
                subscription: req.user.subscription_status
            }
        });
    }
    catch (error) {
        console.error('Get bot status error:', error);
        res.status(500).json({ error: 'Failed to get bot status' });
    }
};
module.exports = getBotStatus;
