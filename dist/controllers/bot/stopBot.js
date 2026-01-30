"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopBot = void 0;
const botStates_1 = require("../../types/botStates");
const supabase_1 = require("../../config/supabase");
const createNotification_1 = require("../../utils/createNotification");
const stopBot = async (req, res) => {
    try {
        const userId = req.user.id;
        const botState = botStates_1.botStates.get(userId);
        console.log(`🛑 Stopping bot for user ${userId}`);
        if (!botState || !botState.isRunning) {
            return res.status(400).json({ error: "Bot is not running for your account" });
        }
        if (botState.tradingInterval) {
            clearInterval(botState.tradingInterval);
            botState.tradingInterval = null;
        }
        botState.isRunning = false;
        const stoppedAt = new Date();
        const { error } = await supabase_1.supabase
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
        console.log(`⏸️ Bot paused for user ${userId} (Connection kept alive)`);
        console.log(`📊 Final stats: ${botState.tradesExecuted} trades, P&L: $${botState.totalProfit.toFixed(2)}`);
        // Send Notification
        await (0, createNotification_1.createNotification)(userId, "Bot Stopped 🛑", `Trading session ended. Trades: ${botState.tradesExecuted}, P&L: $${botState.totalProfit.toFixed(2)}`, 'warning');
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
exports.stopBot = stopBot;
