"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetBot = void 0;
const supabase_1 = require("../../../config/supabase");
const botStates_1 = require("../../../types/botStates");
const botLogger_1 = require("../../../utils/botLogger");
const resetBot = async (req, res) => {
    try {
        const userId = req.user.id;
        // 1. Delete all trades for this user from DB
        const { error } = await supabase_1.supabase
            .from('trades')
            .delete()
            .eq('user_id', userId);
        if (error)
            throw error;
        // 2. Clear in-memory logs
        botLogger_1.BotLogger.clearLogs(userId);
        // 3. Reset in-memory stats in botState
        const botState = botStates_1.botStates.get(userId);
        if (botState) {
            botState.totalProfit = 0;
            botState.tradesExecuted = 0;
            botState.dailyTrades = 0;
            botState.currentTrades = [];
        }
        console.log(`🧹 Bot reset for user ${userId}`);
        res.json({ message: "Bot data reset successfully" });
    }
    catch (error) {
        console.error('Reset bot error:', error);
        res.status(500).json({ error: 'Failed to reset bot' });
    }
};
exports.resetBot = resetBot;
