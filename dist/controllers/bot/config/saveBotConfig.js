"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBotConfig = void 0;
const supabase_1 = require("../../../config/supabase");
const saveBotConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const { symbols, amountPerTrade, timeframe, candleCount, cycleInterval, contractPreference, maxTradesPerCycle, dailyTradeLimit, derivApiToken, derivRealToken, derivDemoToken, openaiApiKey, aiProvider } = req.body;
        const dbConfig = {
            user_id: userId,
            symbols,
            amount_per_trade: amountPerTrade,
            timeframe,
            candle_count: candleCount,
            cycle_interval: cycleInterval,
            contract_preference: contractPreference,
            max_trades_per_cycle: maxTradesPerCycle,
            daily_trade_limit: dailyTradeLimit,
            deriv_api_token: derivApiToken,
            deriv_real_token: derivRealToken,
            deriv_demo_token: derivDemoToken,
            openai_api_key: openaiApiKey,
            ai_provider: aiProvider,
            updated_at: new Date()
        };
        const { data, error } = await supabase_1.supabase
            .from("bot_configs")
            .upsert(dbConfig, { onConflict: 'user_id' })
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.saveBotConfig = saveBotConfig;
