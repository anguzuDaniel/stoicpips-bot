"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeTradeOnDeriv = require('./executeTradeOnDeriv');
const botStates = require('./botStates');
const forceTrade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { symbol, contract_type, amount } = req.body;
        if (!symbol || !contract_type || !amount) {
            return res.status(400).json({ error: "Missing required parameters" });
        }
        // Validate amount based on subscription
        if (req.user.subscription_status === 'free' && amount > 10) {
            return res.status(403).json({
                error: "Free users are limited to $10 per trade. Upgrade to premium for higher limits."
            });
        }
        const signal = {
            action: contract_type === 'CALL' ? 'BUY_CALL' : 'BUY_PUT',
            symbol,
            contract_type: contract_type,
            amount: amount,
            duration: 5,
            duration_unit: 'm',
            confidence: 0.7,
            zone: {
                top: 0,
                bottom: 0,
                type: contract_type === 'CALL' ? 'demand' : 'supply',
                strength: 0,
                symbol,
                timeframe: 60,
                created: Date.now(),
                touched: 0
            },
            timestamp: Date.now()
        };
        const botState = botStates.get(userId);
        const config = botState?.config || {};
        const tradeResult = await executeTradeOnDeriv(userId, signal, config);
        if (tradeResult) {
            res.json({
                message: "Trade executed successfully",
                contractId: tradeResult.buy?.contract_id,
                payout: tradeResult.buy?.payout,
                user: {
                    id: userId,
                    subscription: req.user.subscription_status
                }
            });
        }
        else {
            res.status(500).json({ error: "Trade execution failed" });
        }
    }
    catch (error) {
        console.error('Force trade error:', error);
        res.status(500).json({ error: 'Failed to execute trade' });
    }
};
module.exports = forceTrade;
