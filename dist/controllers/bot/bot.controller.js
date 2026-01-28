"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { supabase } = require('../config/supabase');
const saveBotConfig = async (req, res) => {
    try {
        const userId = req.user.id;
        const config = req.body;
        console.log(`💾 Saving bot config for user ${userId}`);
        // Validate required config
        if (!config.symbols || !config.symbols.length) {
            return res.status(400).json({ error: "At least one trading symbol is required" });
        }
        // Validate trade amount based on subscription
        const baseAmount = config.amountPerTrade || 10;
        if (req.user.subscription_status === 'free' && baseAmount > 10) {
            return res.status(403).json({
                error: "Free users are limited to $10 per trade. Upgrade to premium for higher limits."
            });
        }
        const { error } = await supabase
            .from("bot_configs")
            .upsert({
            user_id: userId,
            config_data: config,
            updated_at: new Date()
        }, {
            onConflict: 'user_id'
        });
        if (error) {
            console.log('Supabase error:', error);
            return res.status(400).json({ error: error.message });
        }
        // Update local config if bot is running
        const botState = botStates.get(userId);
        if (botState && botState.isRunning) {
            botState.config = config;
            console.log(`🔄 Updated config for user ${userId} while bot is running`);
        }
        res.json({
            message: "Bot settings saved",
            user: {
                id: userId,
                subscription: req.user.subscription_status
            }
        });
    }
    catch (error) {
        console.error('Save bot config error:', error);
        res.status(500).json({ error: 'Failed to save bot configuration' });
    }
};
module.exports = { saveBotConfig };
