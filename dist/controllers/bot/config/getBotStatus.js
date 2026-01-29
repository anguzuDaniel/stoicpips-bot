"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBotStatus = void 0;
const supabase_1 = require("../../../config/supabase");
const botStates_1 = require("../../../types/botStates");
const getBotStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const botState = botStates_1.botStates.get(userId);
        const { data: status } = await supabase_1.supabase
            .from("bot_status")
            .select("*")
            .eq("user_id", userId)
            .single();
        res.json({
            isRunning: botState ? botState.isRunning : false,
            startedAt: botState ? botState.startedAt : null,
            tradesExecuted: botState ? botState.tradesExecuted : 0,
            totalProfit: botState ? botState.totalProfit : 0,
            statusFromDb: status
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBotStatus = getBotStatus;
