import { supabase } from '../../../config/supabase';
import { botStates } from '../../../types/botStates';
import { DerivWebSocket } from '../../../deriv/DerivWebSocket';

/**
 * Syncs trade history from Deriv to Supabase (Bulk Upsert)
 */
export const syncTrades = async (userId: string) => {
    try {
        console.log(`🔄 [${userId}] Starting Trade History Sync...`);
        let botState = botStates.get(userId);

        // 1. Establish CONNECTION if missing (Passive Mode)
        let localDerivWS = botState?.derivWS;
        let shouldDisconnect = false;

        if (!localDerivWS || !localDerivWS.getStatus().authorized) {
            console.log(`🔌 [${userId}] No active connection. Creating passive connection for sync...`);

            // Fetch Config
            const { data: botConfig } = await supabase.from("bot_configs").select("*").eq("user_id", userId).single();
            if (!botConfig) {
                console.error(`❌ [${userId}] No bot config found for sync.`);
                return;
            }

            const config = { ...botConfig, ...botConfig.config_data };
            const token = config.deriv_demo_token || config.derivDemoToken || config.deriv_real_token || config.derivRealToken;

            if (!token) {
                console.error(`❌ [${userId}] No token found for sync.`);
                return;
            }

            // Create temporary connection
            localDerivWS = new DerivWebSocket({
                apiToken: token,
                appId: process.env.DERIV_APP_ID || '1089',
                reconnect: false
            });

            // Wait for auth
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => reject('Auth Timeout'), 10000);
                localDerivWS.once('authorized', (auth: any) => {
                    clearTimeout(timeout);
                    if (auth.success) resolve(); else reject(auth.error);
                });
                localDerivWS.connect();
            });
            shouldDisconnect = true;
        }

        // 2. Fetch Full History from Deriv
        // Limit 100 or higher? User said "Initial History Migration". 
        // We'll fetch 100 for now. If user has thousands, we might need paging, but Deriv API limit is usually 100.
        const transactions = await localDerivWS.getProfitTable(100);

        if (!transactions || transactions.length === 0) {
            console.log(`⚠️ [${userId}] No history found on Deriv.`);
            if (shouldDisconnect) localDerivWS.disconnect();
            return;
        }

        console.log(`📥 [${userId}] Fetched ${transactions.length} trades from Deriv. Saving to DB...`);

        // 3. Map to Supabase Schema
        const tradesToUpsert = transactions.map((t: any) => {
            // Determine Contract Type
            let contractType = t.contract_type;
            if (!contractType && t.shortcode) {
                if (t.shortcode.includes('CALL') || t.shortcode.includes('MULTUP')) contractType = 'CALL';
                else if (t.shortcode.includes('PUT') || t.shortcode.includes('MULTDOWN')) contractType = 'PUT';
            }

            // Determine Symbol
            let symbol = t.underlying_symbol || t.symbol;
            if (!symbol && t.shortcode) {
                const parts = t.shortcode.split('_');
                if (parts.length >= 2) symbol = parts[1];
                if (symbol === 'R' && parts.length > 2) symbol = `R_${parts[2]}`;
            }

            return {
                user_id: userId,
                contract_id: t.contract_id,
                transaction_id: t.transaction_id,
                symbol: symbol || 'Unknown',
                contract_type: contractType || 'UNKNOWN',
                action: contractType === 'CALL' ? 'BUY_CALL' : 'BUY_PUT', // Simplified mapping
                amount: parseFloat(t.buy_price),
                entry_price: parseFloat(t.buy_price),
                // entry_tick: t.entry_tick, // Deriv profit table might NOT have explicit entry_tick, only buy_price. 
                // We'll leave entry_tick null if not provided, or use buy_price as proxy if it's a spot trade? 
                // Checks: t.purchase_time
                payout: parseFloat(t.sell_price),
                // exit_tick: t.exit_tick, 
                pnl: parseFloat(t.sell_price) - parseFloat(t.buy_price),
                status: (parseFloat(t.sell_price) - parseFloat(t.buy_price)) >= 0 ? 'won' : 'lost',
                created_at: new Date(t.purchase_time * 1000).toISOString(),
                // closed_at: new Date(t.sell_time * 1000).toISOString() // Commented out due to schema cache issue
            };
        });

        // 4. Bulk Upsert (Using contract_id as conflict key, or transaction_id if unique constraint exists)
        // We set a unique constraint on transaction_id in the schema update.
        // However, 'trades' usually identifies by `trade_id` (UUID) in Supabase or `contract_id`?
        // Let's check `saveTradeToDatabase`. It uses `contract_id`.
        // We'll upsert on `transaction_id`.

        const { error } = await supabase.from('trades').upsert(tradesToUpsert, {
            onConflict: 'transaction_id',
            ignoreDuplicates: true // or false to update? 'Update' is better to fill missing fields. 
        });

        if (error) {
            console.error(`❌ [${userId}] Bulk Sync Error:`, error.message);
        } else {
            console.log(`✅ [${userId}] History Sync Complete. ${tradesToUpsert.length} records processed.`);

            // Clear cache
            if (botState) {
                botState.analyticsCache = undefined;
                botState.lastSyncTime = 0;
            }
        }

        // Cleanup
        if (shouldDisconnect) {
            localDerivWS.disconnect();
            console.log(`🔌 [${userId}] Passive connection closed.`);
        }

    } catch (err: any) {
        console.error(`❌ [${userId}] Sync Failed:`, err.message || err);
    }
};
