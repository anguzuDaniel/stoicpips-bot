const botStates = require('./botStates');
async function updateExistingTrades(userId) {
    const botState = botStates.get(userId);
    if (!botState)
        return;
    // Check for contract updates
    botState.currentTrades.forEach(async (trade, index) => {
        if (trade.status === 'open') {
            // Check if contract is expired (assuming 5-minute contracts)
            const now = new Date();
            const tradeTime = new Date(trade.timestamp);
            const duration = 5 * 60 * 1000; // 5 minutes in milliseconds
            if (now.getTime() - tradeTime.getTime() > duration) {
                // Contract expired, close it
                trade.status = 'closed';
                trade.closedAt = now;
                trade.closePrice = trade.entryPrice;
                // Update in database
                const { error } = await supabase
                    .from("trades")
                    .update({
                    status: 'closed',
                    closed_at: now,
                    close_price: trade.closePrice
                })
                    .eq('trade_id', trade.id);
                if (!error) {
                    console.log(`🔒 [${userId}] Contract ${trade.contractId} closed (expired)`);
                }
            }
        }
    });
    // Remove closed trades from memory after 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    botState.currentTrades = botState.currentTrades.filter((trade) => trade.status === 'open' || new Date(trade.timestamp) > oneHourAgo);
}
module.exports = updateExistingTrades;
