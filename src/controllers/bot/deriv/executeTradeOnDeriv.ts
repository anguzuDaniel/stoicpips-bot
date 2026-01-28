import { DerivSignal } from "../../../strategies/DerivSupplyDemandStrategy";
import { BotLogger } from "../../../utils/botLogger";

const getProposalFromDeriv = require('./getProposalFromDeriv');
const buyContractOnDeriv = require('./buyContractOnDeriv');

/**
 * Execute a trade on Deriv based on a given trading signal.
 * The function takes a user ID, a trading signal, and a config object as parameters.
 * It first checks if the signal is valid and if the user is currently running the bot.
 * If so, it gets a proposal from Deriv, executes the trade, and returns the result.
 * If the signal is HOLD or undefined, it skips the trade.
 * If the proposal or trade execution fails, it logs an error and returns null.
 * @param userId The ID of the user.
 * @param signal The trading signal received from the user.
 * @param config The user's bot configuration.
 * @param deriv The DerivWebSocket instance.
 * @returns A promise that resolves to the trade result or null if the trade fails.
 */
const executeTradeOnDeriv = async (
  userId: string,
  signal: DerivSignal,
  config: any,
  deriv: any
): Promise<any> => {
  try {
    if (!deriv) {
      console.error(`❌ [${userId}] No Deriv connection available for trade`);
      return null;
    }

    // ... validation ...

    // Get proposal first
    const proposal = await getProposalFromDeriv(signal, deriv);

    if (!proposal) {
      console.error(`❌ [${userId}] No proposal received`);
      return null;
    }

    console.log(`📊 [${userId}] Proposal: ${proposal.display_value} - Payout: $${proposal.payout}`);
    // BotLogger.log(userId, `Proposal: ${proposal.display_value} - Payout: $${proposal.payout}`, 'info');

    // Execute the trade
    const tradeResult = await buyContractOnDeriv(signal, proposal, deriv);

    if (!tradeResult) {
      console.error(`❌ [${userId}] Trade execution failed`);
      return null;
    }

    console.log(`✅ [${userId}] Trade executed: ${tradeResult.buy?.contract_id}`);
    BotLogger.log(userId, `Trade executed: Contract #${tradeResult.buy?.contract_id}`, 'success');

    return {
      id: tradeResult.buy?.contract_id || Date.now().toString(),
      userId: userId,
      symbol: signal.symbol,
      contractType: signal.contract_type,
      action: signal.action,
      amount: signal.amount,
      entryPrice: tradeResult.buy?.entry_tick || 0,
      payout: tradeResult.buy?.payout || 0,
      status: 'open',
      timestamp: new Date(),
      proposalId: proposal.id,
      contractId: tradeResult.buy?.contract_id,
      pnl: 0,
      pnlPercentage: 0
    };

  } catch (error: any) {
    console.error(`❌ [${userId}] Trade execution error: ${error.message}`);
    console.error(`🔍 [${userId}] Error stack:`, error.stack);
    return null;
  }
}

module.exports = executeTradeOnDeriv;