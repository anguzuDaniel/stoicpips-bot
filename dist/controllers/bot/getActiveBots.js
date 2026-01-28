"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAllActiveBots = async (req, res) => {
    try {
        if (!req.user.isAdmin)
            return res.status(403).json({ error: 'Admin access required' });
        const activeBots = Array.from(botStates.entries()).map(([userId, state]) => ({
            userId,
            isRunning: state.isRunning,
            startedAt: state.startedAt,
            tradesExecuted: state.tradesExecuted,
            totalProfit: state.totalProfit,
            activeTrades: state.currentTrades.length,
            symbols: state.config.symbols || []
        }));
        res.json({
            totalActive: activeBots.length,
            bots: activeBots
        });
    }
    catch (error) {
        console.error('Get all bots error:', error);
        res.status(500).json({ error: 'Failed to get active bots' });
    }
};
module.exports = getAllActiveBots;
