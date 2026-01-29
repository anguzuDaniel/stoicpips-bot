const botStates = require('../../../types/botStates');
const { supabase } = require('../../../config/supabase');
import { BotLogger } from "../../../utils/botLogger";

/**
 * Updates existing trades for a given user.
 * Checks contract status via Deriv API.
 */
const updateExistingTrades = async (userId: string): Promise<number> => {
  let updatedTrades = 0;

  const botState = botStates.get(userId);
  if (!botState || !botState.deriv) return 0;

  for (const trade of botState.currentTrades) {
    if (trade.status === 'open') {

      try {
        // Check status with Deriv
        // Sending proposal_open_contract gets the latest status
        const response = await botState.deriv.request({
          proposal_open_contract: 1,
          contract_id: trade.contractId
        });

        const contract = response.proposal_open_contract;

        if (contract && contract.is_sold) {
          const profit = contract.profit;
          const isWin = profit > 0;
          const status = isWin ? 'won' : 'lost';

          // Update local state
          trade.status = status;
          trade.pnl = profit;
          trade.exitPrice = contract.exit_tick;
          trade.closedAt = new Date();

          console.log(`🔒 [${userId}] Contract ${trade.contractId} CLOSED. Result: ${status.toUpperCase()} ($${profit})`);
          BotLogger.log(userId, `Trade closed: ${status.toUpperCase()} ($${profit})`, isWin ? 'success' : 'error', trade.symbol);

          // Update DB
          const { error } = await supabase
            .from("trades")
            .update({
              status: status,
              pnl: profit, // Important for Net Profit stats
              close_price: contract.exit_tick,
              closed_at: new Date()
            })
            .eq('trade_id', trade.id);

          if (!error) {
            updatedTrades++;
            // Invalidate analytics cache
            botState.analyticsCache = undefined;
            botState.lastSyncTime = 0;
          }
        }

      } catch (err: any) {
        console.error(`⚠️ [${userId}] Error checking contract ${trade.contractId}:`, err.message);
      }
    }
  }

  // Cleanup old closed trades from memory
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  botState.currentTrades = botState.currentTrades.filter((trade: any) =>
    trade.status === 'open' || new Date(trade.timestamp) > oneHourAgo
  );

  return updatedTrades;
};

export { updateExistingTrades };
