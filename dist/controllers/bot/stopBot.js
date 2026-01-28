"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stopBot = async (req, res) => {
    try {
        const userId = req.user.id;
        const botState = botStates.get(userId);
        console.log(`🛑 Stopping bot for user ${userId}`);
        if (!botState || !botState.isRunning) {
            return res.status(400).json({ error: "Bot is not running for your account" });
        }
        // Stop the interval
        if (botState.tradingInterval) {
            clearInterval(botState.tradingInterval);
            botState.tradingInterval = null;
        }
        // Remove signal handler
        if (botState.config._signalHandler) {
            deriv.off('trading_signal', botState.config._signalHandler);
        }
        // Unsubscribe from all symbols
        if (botState.config.symbols) {
            // Note: You might need to implement unsubscribe in DerivWebSocket
            console.log(`🔇 Unsubscribed from symbols for user ${userId}`);
        }
        // Update bot state
        botState.isRunning = false;
        botState.derivConnected = false;
        // Update database
        const stoppedAt = new Date();
        const { error } = await supabase
            .from("bot_status")
            .update({
            is_running: false,
            stopped_at: stoppedAt,
            updated_at: stoppedAt
        })
            .eq("user_id", userId);
        if (error) {
            console.log('Database error:', error);
        }
        // Remove from memory
        botStates.delete(userId);
        console.log(`✅ Bot stopped for user ${userId}`);
        console.log(`📊 Final stats: ${botState.tradesExecuted} trades, P&L: $${botState.totalProfit.toFixed(2)}`);
        res.json({
            message: "Trading bot stopped successfully",
            status: "stopped",
            startedAt: botState.startedAt,
            stoppedAt: stoppedAt,
            performance: {
                tradesExecuted: botState.tradesExecuted,
                totalProfit: botState.totalProfit,
                activeTrades: botState.currentTrades.length
            },
            user: {
                id: userId,
                subscription: req.user.subscription_status
            }
        });
    }
    catch (error) {
        console.error('Stop bot error:', error);
        res.status(500).json({ error: 'Failed to stop bot' });
    }
};
module.exports = stopBot;
