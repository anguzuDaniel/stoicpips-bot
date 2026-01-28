async function saveTradeToDatabase(userId, trade) {
    try {
        const { error } = await supabase
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
            created_at: trade.timestamp
        });
        if (error) {
            console.error(`❌ [${userId}] Failed to save trade to database:`, error.message);
        }
        else {
            console.log(`💾 [${userId}] Trade saved to database: ${trade.id}`);
        }
    }
    catch (error) {
        console.error(`❌ [${userId}] Save trade error:`, error.message);
    }
}
module.exports = { saveTradeToDatabase };
