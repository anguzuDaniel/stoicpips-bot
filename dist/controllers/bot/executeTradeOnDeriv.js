"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getProposalFromDeriv = require('./getProposalFromDeriv');
const botContractOnDeriv = require('./botContractOnDeriv');
const buyContractOnDeriv = require('./buyContractOnDeriv');
async function executeTradeOnDeriv(userId, signal, config) {
    try {
        console.log(`📤 [${userId}] Executing trade: ${signal.contract_type} ${signal.symbol} $${signal.amount}`);
        // Get proposal first
        const proposal = await getProposalFromDeriv(signal);
        if (!proposal) {
            console.error(`❌ [${userId}] No proposal received`);
            return null;
        }
        console.log(`📊 [${userId}] Proposal: ${proposal.display_value} - Payout: $${proposal.payout}`);
        // Execute the trade
        const tradeResult = await buyContractOnDeriv(signal, proposal.id);
        if (!tradeResult) {
            console.error(`❌ [${userId}] Trade execution failed`);
            return null;
        }
        console.log(`✅ [${userId}] Trade executed: ${tradeResult.buy?.contract_id}`);
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
    }
    catch (error) {
        console.error(`❌ [${userId}] Trade execution error:`, error.message);
        return null;
    }
}
module.exports = executeTradeOnDeriv;
