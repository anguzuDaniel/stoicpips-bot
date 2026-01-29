
import { supabase } from '../config/supabase';
import { botStates } from '../types/botStates';
import { BotLogger } from './botLogger';
import { HybridScalpStrategy } from '../strategies/HybridScalpStrategy';
import { SentinelExecutionLayer } from '../strategies/SentinelExecutionLayer';
import { DerivWebSocket } from '../deriv/DerivWebSocket';
import { executeTradingCycle } from '../controllers/bot/trade/executeTradingCycle';
import fetchLatestCandles from '../strategies/fetchLatestCandles';
import ALLOWED_GRANULARITIES from '../controllers/bot/helpers/ALLOWED_GRANULARITIES';
import symbolTimeFrames from '../controllers/bot/helpers/symbolTimeFrames';

export const resurrectBots = async () => {
    console.log('🧟‍♂️ Attempting to resurrect active bots from database...');

    try {
        const { data: activeBots, error } = await supabase
            .from('bot_status')
            .select('*')
            .eq('is_running', true);

        if (error) {
            console.error('❌ Failed to fetch active bots for resurrection:', error.message);
            return;
        }

        if (!activeBots || activeBots.length === 0) {
            console.log('✅ No active bots to resurrect.');
            return;
        }

        console.log(`🔄 Found ${activeBots.length} bots to resurrect.`);

        for (const botStatus of activeBots) {
            const userId = botStatus.user_id;

            // Fetch full config to restart properly
            const { data: botConfig } = await supabase
                .from("bot_configs")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (!botConfig) {
                console.warn(`⚠️ Config missing for user ${userId}, skipping resurrection.`);
                continue;
            }

            // Reconstruct config
            const config = { ...botConfig, ...botConfig.config_data };
            const mergedSymbols = Array.from(
                new Set([
                    ...(botConfig.symbols || []),
                    ...(botConfig.config_data?.symbols || [])
                ])
            );
            config.symbols = mergedSymbols;

            // Re-initialize components
            const strategy = new HybridScalpStrategy();
            const sentinel = new SentinelExecutionLayer();
            if (config.minSignalGap) strategy.minSignalGap = config.minSignalGap * 60000;

            const sanitizeToken = (t: string) => t ? t.trim().replace(/[\[\]"]/g, '') : '';
            const demoToken = sanitizeToken(config.deriv_demo_token || config.derivDemoToken);
            const realToken = sanitizeToken(config.deriv_real_token || config.derivRealToken);

            let token = demoToken;
            // Simple logic: if status was real, use real token, but for safety default to demo unless explicit
            // For now, we reuse the token logic from startBot roughly
            if (!token && realToken) token = realToken;

            // Initialize Deriv Connection
            const derivConnection = new DerivWebSocket({
                apiToken: token,
                appId: process.env.DERIV_APP_ID || '1089',
                reconnect: true
            });

            // Wire up logs
            derivConnection.on('log', (logData: any) => {
                BotLogger.log(userId, logData.message, logData.type);
            });

            // Connect asynchronously (don't block loop)
            derivConnection.connect();

            // Restore State
            const botState = {
                isRunning: true,
                startedAt: new Date(botStatus.updated_at || new Date()), // Use DB timestamp or now
                tradingInterval: null as NodeJS.Timeout | null,
                currentTrades: [],
                totalProfit: botStatus.total_profit || 0,
                tradesExecuted: botStatus.trades_executed || 0,
                strategy,
                sentinel,
                derivConnected: true,
                derivWS: derivConnection,
                dailyTrades: 0,
                config,
                subscriptionTier: 'unknown', // Will be fetched if needed
            };

            botStates.set(userId, botState);

            // Restart Trading Cycle
            const tradingCycle = async () => {
                if (!botState.isRunning) {
                    if (botState.tradingInterval) clearInterval(botState.tradingInterval);
                    return;
                }
                try {
                    // ... minimal trading logic replication or import ...
                    // Importing logic from startBot is hard because it's inside the handler.
                    // Ideally refactor 'tradingCycle' to a shared function. 
                    // For now, we blindly re-implement the loop logic using the imported `executeTradingCycle`.

                    const candlesMap: Record<string, any[]> = {};
                    for (const symbol of config.symbols) {
                        const desiredTimeframe = symbolTimeFrames[symbol as keyof typeof symbolTimeFrames] || 900;
                        const closestGranularity = ALLOWED_GRANULARITIES.reduce((prev, curr) =>
                            Math.abs(curr - desiredTimeframe) < Math.abs(prev - desiredTimeframe) ? curr : prev
                        );
                        const candles = await fetchLatestCandles(symbol, closestGranularity, derivConnection);
                        if (candles && candles.length > 0) candlesMap[symbol] = candles;
                    }

                    const availableSymbols = Object.keys(candlesMap);
                    if (availableSymbols.length > 0) {
                        const cycleConfig = { ...config, symbols: availableSymbols, amountPerTrade: config.amountPerTrade || 10 };
                        await executeTradingCycle(userId, cycleConfig, candlesMap);
                    }

                } catch (err) {
                    console.error(`❌ Error in resurrector cycle for ${userId}:`, err);
                }
            };

            const cycleIntervalMs = (config.cycleInterval || 30) * 1000;
            tradingCycle(); // Run immediately
            botState.tradingInterval = setInterval(tradingCycle, cycleIntervalMs);

            console.log(`🧟‍♂️ Resurrected bot for user ${userId}`);
        }

    } catch (error: any) {
        console.error('🔥 Critical error during bot resurrection:', error.message);
    }
};
