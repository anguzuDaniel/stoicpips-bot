"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../../../config/supabase");
const botLogger_1 = require("../../../utils/botLogger");
const botStates_1 = require("../../../types/botStates");
/**
 * Saves a trade to the database
 */
const saveTradeToDatabase = async (userId, trade) => {
    try {
        const { error } = await supabase_1.supabase
            .from("trades")
            .insert({
            user_id: userId,
            trade_id: trade.id,
            symbol: trade.symbol,
            contract_type: trade.contractType,
            action: trade.action,
            amount: trade.amount,
            entry_price: trade.entryPrice,
            payout: trade.payout,
            status: trade.status,
            contract_id: trade.contractId,
            proposal_id: trade.proposalId,
            pnl: trade.pnl,
            pnl_percentage: trade.pnlPercentage,
            created_at: trade.timestamp,
            entry_tick: trade.entryPrice, // Entry price is the entry tick
            transaction_id: trade.transaction_id || null // If available from buy response
        });
        if (error) {
            console.error(`❌ [${userId}] Failed to save trade to database:`, error.message);
            botLogger_1.BotLogger.log(userId, `Failed to save trade: ${error.message}`, 'error');
        }
        else {
            console.log(`💾 [${userId}] Trade saved to database: ${trade.id}`);
            const botState = botStates_1.botStates.get(userId);
            if (botState) {
                botState.analyticsCache = undefined;
                botState.lastSyncTime = 0;
            }
        }
    }
    catch (error) {
        console.error(`❌ [${userId}] Save trade error:`, error.message);
    }
};
exports.default = saveTradeToDatabase;
