import { Response } from 'express';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';

const botStates = require('../../../types/botStates');
const { supabase } = require('../../../config/supabase');
import { DerivWebSocket } from '../../../deriv/DerivWebSocket';

/**
 * Returns the current status of the bot for the given user.
 * @param {AuthenticatedRequest} req - The authenticated request object.
 * @param {Response} res - The response object to send the result.
 * @returns {Promise<Response>} - A promise that resolves to a response object.
 * The response object contains the following properties:
 * - isRunning: A boolean indicating whether the bot is currently running.
 * - startedAt: The timestamp when the bot was started.
 * - stoppedAt: The timestamp when the bot was stopped.
 * - currentTrades: An array of open trades.
 * - totalProfit: The total profit made by the bot.
 * - tradesExecuted: The number of trades executed by the bot.
 * - message: A message indicating whether the bot is running or not.
 * - user: An object containing the user ID and subscription status.
 */
const getBotStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const botState = botStates.get(userId);

    console.log(`📊 Getting bot status for user ${userId}`);

    if (!botState) {
      console.log(`🔍 Bot state missing for ${userId}. Attempting Auto-Connect for balance...`);

      // Try to Auto-Connect to show balance
      try {
        const { data: config } = await supabase.from('bot_configs').select('*').eq('user_id', userId).single();
        if (config && (config.deriv_demo_token || config.deriv_real_token)) {
          const token = config.deriv_demo_token || config.deriv_real_token;
          const derivConnection = new DerivWebSocket({
            apiToken: token,
            appId: process.env.DERIV_APP_ID || '1089',
            reconnect: true
          });
          derivConnection.connect();

          const newState = {
            isRunning: false,
            startedAt: null,
            tradingInterval: null,
            currentTrades: [],
            totalProfit: 0,
            tradesExecuted: 0,
            derivWS: derivConnection,
            derivConnected: true,
            config: config
          };
          botStates.set(userId, newState);

          // Return initial idle status
          return res.json({
            isRunning: false,
            startedAt: null,
            derivConnected: true,
            derivAccount: derivConnection.getStatus(),
            user: { id: userId, subscription: req.user.subscription_status }
          });
        }
      } catch (e) {
        console.error("Auto-connect failed:", e);
      }

      // Fallback if no tokens or error
      const { data: status } = await supabase.from("bot_status").select("*").eq("user_id", userId).single();
      return res.json({
        isRunning: false,
        startedAt: status?.started_at || null,
        stoppedAt: status?.stopped_at || null,
        currentTrades: [],
        totalProfit: 0,
        tradesExecuted: 0,
        message: "Bot not currently running",
        user: { id: userId, subscription: req.user.subscription_status }
      });
    }

    const activeTrades = botState.currentTrades.filter((trade: any) => trade.status === 'open');
    const closedTrades = botState.currentTrades.filter((trade: any) => trade.status === 'closed');

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
          ((botState.tradesExecuted - closedTrades.filter((t: any) => t.pnl < 0).length) / botState.tradesExecuted * 100).toFixed(1) : 0
      },
      activeTrades: activeTrades,
      config: botState.config,

      derivConnected: botState.derivConnected,
      derivAccount: botState.derivWS ? botState.derivWS.getStatus() : null,
      status: botState.isRunning ? "running" : "stopped",
      user: {
        id: userId,
        subscription: req.user.subscription_status
      }
    });
  } catch (error: any) {
    console.error('Get bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
};

export { getBotStatus };