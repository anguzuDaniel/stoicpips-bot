import { botStates } from '../../../types/botStates';
import { supabase } from '../../../config/supabase';
import { BotLogger } from "../../../utils/botLogger";

/**
 * Updates existing trades for a given user.
 */
export const updateExistingTrades = async (userId: string): Promise<number> => {
  let updatedTrades = 0;

  const botState = botStates.get(userId);
  if (!botState || !botState.derivWS) return 0;

  for (const trade of botState.currentTrades) {
    if (trade.status === 'open') {

      try {
        const response = await botState.derivWS.request({
          proposal_open_contract: 1,
          contract_id: trade.contractId
        });

        const contract = response.proposal_open_contract;

        if (contract && contract.is_sold) {
          const profit = contract.profit;
          const isWin = profit > 0;
          const status = isWin ? 'won' : 'lost';

          trade.status = status;
          trade.pnl = profit;
          trade.exitPrice = contract.exit_tick;
          trade.closedAt = new Date();

          console.log(`🔒 [${userId}] Contract ${trade.contractId} CLOSED. Result: ${status.toUpperCase()} ($${profit})`);
          BotLogger.log(userId, `Trade closed: ${status.toUpperCase()} ($${profit})`, isWin ? 'success' : 'error', trade.symbol);

          const { error } = await supabase
            .from("trades")
            .update({
              status: status,
              pnl: profit,
              close_price: contract.exit_tick,
              exit_tick: contract.exit_tick,
              entry_tick: contract.entry_tick, // Ensure we have the precise entry tick
              tick_count: contract.tick_count,
              transaction_id: contract.transaction_ids?.sell || null, // Capture sell transaction ID
              closed_at: new Date()
            })
            .eq('trade_id', trade.id);

          updatedTrades++;
          botState.totalProfit += profit;
          botState.analyticsCache = undefined;
          botState.lastSyncTime = 0;

          // Check Trading Cycle Targets (Stop Loss / Take Profit)
          const { stopLoss, takeProfit } = botState.config;

          if (takeProfit && botState.totalProfit >= takeProfit) {
            botState.isRunning = false;
            BotLogger.log(userId, `🎯 Take Profit Triggered! Total Profit: $${botState.totalProfit.toFixed(2)}. Bot stopped.`, 'success');
            console.log(`🎯 [${userId}] Take Profit reached ($${botState.totalProfit}). Stopping bot.`);
          } else if (stopLoss && botState.totalProfit <= -stopLoss) {
            botState.isRunning = false;
            BotLogger.log(userId, `🛑 Stop Loss Triggered! Total Loss: $${Math.abs(botState.totalProfit).toFixed(2)}. Bot stopped.`, 'error');
            console.log(`🛑 [${userId}] Stop Loss reached ($${botState.totalProfit}). Stopping bot.`);
          }
        }
      } catch (err: any) {
        console.error(`⚠️ [${userId}] Error checking contract ${trade.contractId}:`, err.message);
      }
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  botState.currentTrades = botState.currentTrades.filter((trade: any) =>
    trade.status === 'open' || new Date(trade.timestamp) > oneHourAgo
  );

  return updatedTrades;
};
