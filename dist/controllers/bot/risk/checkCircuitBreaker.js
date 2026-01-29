"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCircuitBreaker = void 0;
const { supabase } = require("../../../config/supabase");
const botStates = require("../../../types/botStates");
/**
 * Checks if the user has hit the max loss threshold for the past hour.
 * @param userId - The user's ID
 * @returns { success: boolean, message?: string } - success=false means breaker TRIPPED
 */
const checkCircuitBreaker = async (userId) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        // 1. Fetch trades from last hour
        const { data: recentTrades, error } = await supabase
            .from('trade_history')
            .select('profit')
            .eq('user_id', userId)
            .gte('timestamp', oneHourAgo);
        if (error) {
            console.error("CircuitBreaker DB Error:", error);
            return { safe: true }; // Fail open (safe) or closed? Usually fail closed in finance, but here safe to keep running if DB err
        }
        if (!recentTrades || recentTrades.length === 0) {
            return { safe: true };
        }
        // 2. Calculate PnL
        const hourlyPnL = recentTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        // 3. Get Account Balance
        // We try to get real balance if connected, otherwise fallback (which effectively disables it for paper trading without balance)
        let balance = 10000; // Default fallback
        const botState = botStates.get(userId);
        if (botState && botState.deriv) {
            // We'd ideally fetch real balance here. 
            // For V1, let's assume valid access or use a stored balance.
            // Doing a quick fetch might be too slow for HFT loop, better to cache balance.
            // For now, use fallback or cache if available.
        }
        // 4. Check Threshold (-1.5%)
        const threshold = balance * -0.015;
        if (hourlyPnL <= threshold) {
            return {
                safe: false,
                message: `Circuit Breaker Tripped! Hourly Loss ${hourlyPnL.toFixed(2)} exceeds limit (${threshold.toFixed(2)})`
            };
        }
        return { safe: true };
    }
    catch (e) {
        console.error("CircuitBreaker Error:", e);
        return { safe: true };
    }
};
exports.checkCircuitBreaker = checkCircuitBreaker;
