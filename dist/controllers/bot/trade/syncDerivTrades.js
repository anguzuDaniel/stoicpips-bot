"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDerivTrades = void 0;
const supabase_1 = require("../../../config/supabase");
const botStates_1 = require("../../../types/botStates");
const SYNC_COOLDOWN = 60 * 1000; // 60 seconds
/**
 * Syncs trade history from Deriv profit table to Supabase trades table.
 */
const syncDerivTrades = async (userId, derivWS, limit = 50) => {
    try {
        const botState = botStates_1.botStates.get(userId);
        const now = Date.now();
        if (botState && botState.lastSyncTime && (now - botState.lastSyncTime < SYNC_COOLDOWN)) {
            console.log(`ℹ️ [${userId}] Skipping Deriv sync (Cooldown active: ${(SYNC_COOLDOWN - (now - botState.lastSyncTime)) / 1000}s left)`);
            return 0;
        }
        console.log(`📡 [${userId}] Starting Deriv trade sync...`);
        const derivTrades = await derivWS.getProfitTable(limit);
        if (botState) {
            botState.lastSyncTime = now;
        }
        if (!derivTrades || derivTrades.length === 0) {
            console.log(`ℹ️ [${userId}] No trades found in Deriv profit table.`);
            return 0;
        }
        const { data: existingTrades, error: fetchError } = await supabase_1.supabase
            .from('trades')
            .select('contract_id')
            .eq('user_id', userId);
        if (fetchError) {
            console.error(`❌ [${userId}] Failed to fetch existing trades:`, fetchError.message);
        }
        const existingIds = new Set((existingTrades || []).map((t) => String(t.contract_id)));
        const tradesToInsert = derivTrades
            .filter((t) => !existingIds.has(String(t.contract_id)))
            .map((t) => {
            const buyPrice = parseFloat(t.buy_price);
            const sellPrice = parseFloat(t.sell_price);
            const pnl = sellPrice - buyPrice;
            const status = pnl >= 0 ? 'won' : 'lost';
            return {
                user_id: userId,
                contract_id: t.contract_id,
                trade_id: `DERIV_${t.transaction_id}`,
                symbol: t.shortcode ? t.shortcode.split('_')[1] || t.shortcode : 'UKN',
                contract_type: t.longcode.includes('CALL') ? 'CALL' : t.longcode.includes('PUT') ? 'PUT' : 'UNKNOWN',
                action: 'BUY',
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
        if (tradesToInsert.length === 0)
            return 0;
        const { error: insertError } = await supabase_1.supabase
            .from('trades')
            .insert(tradesToInsert);
        if (insertError) {
            console.error(`❌ [${userId}] Supabase sync error:`, insertError);
            throw insertError;
        }
        console.log(`✅ [${userId}] Successfully synced ${tradesToInsert.length} new trades.`);
        if (botState && tradesToInsert.length > 0) {
            botState.analyticsCache = undefined;
        }
        return tradesToInsert.length;
    }
    catch (error) {
        console.error(`❌ [${userId}] Trade sync error:`, error.message);
        return 0;
    }
};
exports.syncDerivTrades = syncDerivTrades;
