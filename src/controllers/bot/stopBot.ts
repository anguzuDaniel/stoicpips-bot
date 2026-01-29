import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
// const deriv = require('../../config/deriv');
const botStates = require('../../types/botStates');

const supabase = require('../../config/supabase').supabase;

/**
 * Stops a running bot and updates the database with the final stats.
 * Returns a response with the final stats and a success message.
 * @param {AuthenticatedRequest} req - The authenticated request object.
 * @param {Response} res - The response object to send the result.
 * @returns {Promise<Response>} - A promise that resolves to a response object.
 * The response object contains the following properties:
 * - message: A message indicating whether the bot was stopped successfully.
 * - status: A string indicating whether the bot is running or not.
 * - startedAt: The timestamp when the bot was started.
 * - stoppedAt: The timestamp when the bot was stopped.
 * - performance: An object containing the performance metrics of the bot.
 * - user: An object containing the user ID and subscription status.
 */
const stopBot = async (req: AuthenticatedRequest, res: Response) => {
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

    /* 
    // Don't disconnect, keep alive for balance updates
    if (botState.derivWS) {
      console.log(`🔌 Disconnecting Deriv session for user ${userId}`);
      botState.derivWS.disconnect();
    }
    */

    botState.isRunning = false;
    // botState.derivConnected = false; // Keep connected

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

    // botStates.delete(userId); // Don't delete state, keep for monitoring
    console.log(`⏸️ Bot paused for user ${userId} (Connection kept alive)`);

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
  } catch (error: any) {
    console.error('Stop bot error:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
};

export { stopBot };