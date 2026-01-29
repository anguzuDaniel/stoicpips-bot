import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import { botStates } from '../../types/botStates';
import { supabase } from '../../config/supabase';

export const stopBot = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const botState = botStates.get(userId);

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

    console.log(`⏸️ Bot paused for user ${userId} (Connection kept alive)`);
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
  } catch (error: any) {
    console.error('Stop bot error:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
};