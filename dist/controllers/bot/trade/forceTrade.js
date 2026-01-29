"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceTrade = void 0;
const botStates_1 = require("../../../types/botStates");
// Removed global deriv import, use botState.derivWS
/**
 * Force a trade on Deriv using the given parameters
 */
const forceTrade = async (req, res) => {
    try {
        const { amount, symbol, contractType, duration } = req.body;
        const userId = req.user.id;
        const botState = botStates_1.botStates.get(userId);
        if (!botState || !botState.derivWS) {
            throw new Error("Bot is not running or Deriv connection not initialized");
        }
        // This is a simplified version, ideally would use buildProposalParams
        // and correctly handle the proposal response.
        // For now, we'll use the existing executeTrade method on the WebSocket if available.
        const signal = {
            action: contractType === 'CALL' ? 'BUY' : 'SELL',
            contract_type: contractType,
            symbol: symbol,
            amount: amount,
            duration: duration,
            barrier: null // Optional
        };
        const tradeResult = await botState.derivWS.executeTrade(signal);
        if (tradeResult) {
            res.json({ message: "Trade executed successfully", tradeId: tradeResult.id });
        }
        else {
            res.status(500).json({ error: "Trade execution failed" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Trade failed: " + error.message });
    }
};
exports.forceTrade = forceTrade;
