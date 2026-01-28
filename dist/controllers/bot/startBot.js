"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DerivSupplyDemandStrategy_1 = require("../../strategies/DerivSupplyDemandStrategy");
const startBot = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const subscription = req.user.subscription_status;
        console.log(`🚀 Starting bot for user ${userId} (${userEmail})`);
        // Check if user already has a bot running (in-memory check)
        if (botStates.has(userId) && botStates.get(userId).isRunning) {
            return res.status(400).json({
                error: "You already have a bot running. Stop the current bot first."
            });
        }
        // For ALL users (free and premium), check database for running bots
        const { data: existingBots } = await supabase
            .from("bot_status")
            .select("*")
            .eq("user_id", userId)
            .eq("is_running", true);
        if (existingBots && existingBots.length > 0) {
            // Clean up database state (in case of server restart)
            console.log(`🔄 Cleaning up stale bot status for user ${userId}`);
            await supabase
                .from("bot_status")
                .update({ is_running: false })
                .eq("user_id", userId);
        }
        // Get bot configuration
        const { data: configData, error: configError } = await supabase
            .from("bot_configs")
            .select("config_data")
            .eq("user_id", userId)
            .single();
        if (configError && configError.code !== 'PGRST116') {
            return res.status(400).json({ error: configError.message });
        }
        const config = configData?.config_data || {};
        // Validate config
        if (!config.symbols || config.symbols.length === 0) {
            return res.status(400).json({ error: "Please configure trading symbols first" });
        }
        // Validate trade amount based on subscription
        const baseAmount = config.amountPerTrade || 10;
        if (subscription === 'free' && baseAmount > 10) {
            return res.status(403).json({
                error: "Free users are limited to $10 per trade. Upgrade to premium for higher limits."
            });
        }
        // Initialize bot state
        const strategy = new DerivSupplyDemandStrategy_1.DerivSupplyDemandStrategy();
        if (config.minSignalGap) {
            strategy.setMinSignalGap(config.minSignalGap * 60000);
        }
        const botState = {
            isRunning: true,
            startedAt: new Date(),
            tradingInterval: null,
            currentTrades: [],
            totalProfit: 0,
            tradesExecuted: 0,
            strategy,
            derivConnected: true,
            config
        };
        botStates.set(userId, botState);
        // Save bot status to database
        const startedAt = new Date();
        const { error: statusError } = await supabase
            .from("bot_status")
            .upsert({
            user_id: userId,
            is_running: true,
            started_at: startedAt,
            current_trades: [],
            updated_at: startedAt
        });
        if (statusError) {
            console.log('Database error:', statusError);
        }
        // Start the trading cycle
        const tradingInterval = setInterval(() => {
            executeTradingCycle(userId, config);
        }, config.analysisInterval || 30000);
        botState.tradingInterval = tradingInterval;
        console.log(`🤖 Bot started for user ${userId}`);
        console.log(`📊 Trading symbols: ${config.symbols.join(', ')}`);
        console.log(`💰 Trade amount: $${baseAmount}`);
        console.log(`👑 Subscription: ${subscription}`);
        res.json({
            message: "Trading bot started successfully",
            status: "running",
            startedAt: startedAt,
            user: {
                id: userId,
                email: userEmail,
                subscription: subscription
            },
            config: {
                symbols: config.symbols,
                analysisInterval: config.analysisInterval || 30,
                amountPerTrade: baseAmount
            }
        });
    }
    catch (error) {
        console.error('Start bot error:', error);
        res.status(500).json({ error: 'Failed to start bot: ' + error.message });
    }
};
module.exports = startBot;
