import { Response } from 'express';
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
import { supabase } from '../../../config/supabase';
import { botStates } from '../../../types/botStates';
import { BotLogger } from "../../../utils/botLogger";

export const resetBot = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // 1. Delete all trades for this user from DB
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        // 2. Clear in-memory logs
        BotLogger.clearLogs(userId);

        // 3. Reset in-memory stats in botState
        const botState = botStates.get(userId);
        if (botState) {
            botState.totalProfit = 0;
            botState.tradesExecuted = 0;
            botState.dailyTrades = 0;
            botState.currentTrades = [];
        }

        console.log(`🧹 Bot reset for user ${userId}`);

        res.json({ message: "Bot data reset successfully" });
    } catch (error: any) {
        console.error('Reset bot error:', error);
        res.status(500).json({ error: 'Failed to reset bot' });
    }
};
