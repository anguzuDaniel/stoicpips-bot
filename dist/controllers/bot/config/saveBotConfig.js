"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBotConfig = void 0;
const supabase = require('../../../config/supabase').supabase;
/**
 * Saves bot configuration to the database.
 * Requires authentication and a valid bot configuration to be passed in the request body.
 * The configuration object must contain a valid symbols array.
 * Other configuration options are optional and default to the following values:
 * - amountPerTrade: 10
 * - timeframe: 5
 * - candleCount: 10
 * - cycleInterval: 30
 * - contractPreference: 'RISE/FALL'
 * - maxTradesPerCycle: 3
 * - dailyTradeLimit: 5
 * - derivRealToken: string
 * - derivDemoToken: string
 * - openaiApiKey: string
 * - aiProvider: 'local' | 'openai'
 * @param {AuthenticatedRequest} req - The request object containing the authenticated user and bot configuration.
 * @param {Response} res - The response object to send back to the client.
 * @returns {Promise<Response>} - A promise that resolves to the response object.
 * @throws {Error} - If the bot configuration is invalid or if there's an error saving the configuration to the database.
 */
const saveBotConfig = async (req, res) => {
    try {
        const user = req.user;
        const config = req.body;
        if (!user || !user.id) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        if (!config.symbols || !Array.isArray(config.symbols) || config.symbols.length === 0) {
            return res.status(400).json({ error: "Symbols array is required" });
        }
        const { error } = await supabase
            .from("bot_configs")
            .upsert({
            user_id: user.id,
            symbols: config.symbols,
            deriv_api_token: config.derivApiToken, // Legacy support
            deriv_real_token: config.derivRealToken,
            deriv_demo_token: config.derivDemoToken,
            openai_api_key: config.openaiApiKey,
            ai_provider: config.aiProvider || 'local',
            amount_per_trade: config.amountPerTrade ?? 10,
            timeframe: config.timeframe ?? 5,
            candle_count: config.candleCount ?? 10,
            cycle_interval: config.cycleInterval ?? 30,
            contract_preference: config.contractPreference ?? 'RISE/FALL',
            max_trades_per_cycle: config.maxTradesPerCycle ?? 3,
            daily_trade_limit: config.dailyTradeLimit ?? 5,
            updated_at: new Date(),
            created_at: new Date() // optional, if inserting first time
        }, {
            onConflict: "user_id" // ← tells Supabase to update if user_id exists
        });
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json({ message: "Bot settings saved successfully" });
    }
    catch (err) {
        console.error('Save bot config error:', err.message);
        res.status(500).json({ error: 'Failed to save bot configuration' });
    }
};
exports.saveBotConfig = saveBotConfig;
