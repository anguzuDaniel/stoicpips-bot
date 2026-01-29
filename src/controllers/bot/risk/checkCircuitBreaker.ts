import { supabase } from "../../../config/supabase";
import { botStates } from "../../../types/botStates";

/**
 * Checks if the user has hit the max loss threshold for the past hour.
 */
export const checkCircuitBreaker = async (userId: string): Promise<{ safe: boolean; message?: string }> => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        // 1. Fetch trades from last hour
        const { data: recentTrades, error } = await supabase
            .from('trades') // Changed from trade_history to trades to match syncDerivTrades
            .select('pnl')
            .eq('user_id', userId)
            .gte('created_at', oneHourAgo);

        if (error) {
            console.error("CircuitBreaker DB Error:", error);
            return { safe: true };
        }

        if (!recentTrades || recentTrades.length === 0) {
            return { safe: true };
        }

        // 2. Calculate PnL
        const hourlyPnL = recentTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);

        // 3. Get Account Balance
        let balance = 10000;
        const botState = botStates.get(userId);

        if (botState && botState.derivWS) {
            const status = botState.derivWS.getStatus();
            if (status.authorized && status.balance > 0) {
                balance = status.balance;
            }
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

    } catch (e) {
        console.error("CircuitBreaker Error:", e);
        return { safe: true };
    }
};
