const { supabase } = require('../../../config/supabase');
import { DerivWebSocket } from "../../../deriv/DerivWebSocket";
const botStates = require('../../../types/botStates');

const SYNC_COOLDOWN = 60 * 1000; // 60 seconds

/**
 * Syncs trade history from Deriv profit table to Supabase trades table.
 * @param userId - The user ID to sync for.
 * @param derivWS - An authorized DerivWebSocket instance.
 * @param limit - Number of trades to fetch (default 50).
 */
export const syncDerivTrades = async (userId: string, derivWS: DerivWebSocket, limit: number = 50) => {
    try {
        const botState = botStates.get(userId);
        const now = Date.now();

        if (botState && botState.lastSyncTime && (now - botState.lastSyncTime < SYNC_COOLDOWN)) {
            console.log(`ℹ️ [${userId}] Skipping Deriv sync (Cooldown active: ${(SYNC_COOLDOWN - (now - botState.lastSyncTime)) / 1000}s left)`);
            return 0;
        }

        console.log(`📡 [${userId}] Starting Deriv trade sync...`);

        const derivTrades = await derivWS.getProfitTable(limit);

        // Update lastSyncTime even if no trades found to respect the cooldown
        if (botState) {
            botState.lastSyncTime = now;
        }

        if (!derivTrades || derivTrades.length === 0) {
            console.log(`ℹ️ [${userId}] No trades found in Deriv profit table.`);
            return 0;
        }

        // 1. Fetch existing contract_ids from DB to prevent duplicates (Manual Sync)
        const { data: existingTrades, error: fetchError } = await supabase
            .from('trades')
            .select('contract_id')
            .eq('user_id', userId);

        if (fetchError) {
            console.error(`❌ [${userId}] Failed to fetch existing trades:`, fetchError.message);
        }

        const existingIds = new Set((existingTrades || []).map((t: any) => String(t.contract_id)));

        const tradesToInsert = derivTrades
            .filter((t: any) => !existingIds.has(String(t.contract_id)))
            .map((t: any) => {
                const buyPrice = parseFloat(t.buy_price);
                const sellPrice = parseFloat(t.sell_price);
                const pnl = sellPrice - buyPrice;
                const status = pnl >= 0 ? 'won' : 'lost';

                // Map Deriv fields to database schema
                return {
                    user_id: userId,
                    contract_id: t.contract_id,
                    trade_id: `DERIV_${t.transaction_id}`, // Prefix shared IDs
                    symbol: t.shortcode ? t.shortcode.split('_')[1] || t.shortcode : 'UKN', // Fallback to full shortcode
                    contract_type: t.longcode.includes('CALL') ? 'CALL' : t.longcode.includes('PUT') ? 'PUT' : 'UNKNOWN',
                    action: 'BUY', // Default action for history trades
                    amount: buyPrice,
                    entry_price: buyPrice,
                    payout: sellPrice,
                    status: status,
                    pnl: pnl,
                    pnl_percentage: buyPrice > 0 ? (pnl / buyPrice) * 100 : 0,
                    created_at: new Date(t.purchase_time * 1000).toISOString(),
                };
            });

        console.log(`📦 [${userId}] Found ${tradesToInsert.length} new trades to sync.`);

        if (tradesToInsert.length === 0) return 0;

        // Insert new trades
        const { error: insertError } = await supabase
            .from('trades')
            .insert(tradesToInsert);

        if (insertError) {
            console.error(`❌ [${userId}] Supabase sync error:`, insertError);
            throw insertError;
        }

        console.log(`✅ [${userId}] Successfully synced ${tradesToInsert.length} new trades.`);

        // Invalidate analytics cache since we have new data
        if (botState && tradesToInsert.length > 0) {
            botState.analyticsCache = undefined;
        }

        return tradesToInsert.length;

    } catch (error: any) {
        console.error(`❌ [${userId}] Trade sync error:`, error.message);
        return 0;
    }
};
