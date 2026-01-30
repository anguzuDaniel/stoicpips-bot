"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExistingTrades = void 0;
const botStates_1 = require("../../../types/botStates");
const supabase_1 = require("../../../config/supabase");
const botLogger_1 = require("../../../utils/botLogger");
/**
 * Updates existing trades for a given user.
 */
const updateExistingTrades = async (userId) => {
    let updatedTrades = 0;
    const botState = botStates_1.botStates.get(userId);
    if (!botState || !botState.derivWS)
        return 0;
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
                    botLogger_1.BotLogger.log(userId, `Trade closed: ${status.toUpperCase()} ($${profit})`, isWin ? 'success' : 'error', trade.symbol);
                    const { error } = await supabase_1.supabase
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
                    if (!error) {
                        updatedTrades++;
                        botState.analyticsCache = undefined;
                        botState.lastSyncTime = 0;
                    }
                }
            }
            catch (err) {
                console.error(`⚠️ [${userId}] Error checking contract ${trade.contractId}:`, err.message);
            }
        }
    }
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    botState.currentTrades = botState.currentTrades.filter((trade) => trade.status === 'open' || new Date(trade.timestamp) > oneHourAgo);
    return updatedTrades;
};
exports.updateExistingTrades = updateExistingTrades;
