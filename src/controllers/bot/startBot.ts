import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { DerivSupplyDemandStrategy } from '../../strategies/DerivSupplyDemandStrategy';
import ALLOWED_GRANULARITIES from './helpers/ALLOWED_GRANULARITIES';
import symbolTimeFrames from './helpers/symbolTimeFrames';
import { DerivWebSocket } from "../../deriv/DerivWebSocket";

const botStates = require('../../types/botStates');
const { executeTradingCycle } = require('./trade/executeTradingCycle');
const supabase = require('../../config/supabase').supabase;
const fetchLatestCandles = require('../../strategies/fetchLatestCandles');

const startBot = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const subscription = req.user.subscription_status;

    console.log(`🚀 Starting bot for user ${userId} (${userEmail})`);

    // Prevent multiple bots
    if (botStates.has(userId) && botStates.get(userId).isRunning) {
      return res.status(400).json({ error: "You already have a bot running. Stop the current bot first." });
    }

    // Cleanup stale bot status
    const { data: existingBots } = await supabase
      .from("bot_status")
      .select("*")
      .eq("user_id", userId)
      .eq("is_running", true);

    if (existingBots && existingBots.length > 0) {
      console.log(`🔄 Cleaning up stale bot status for user ${userId}`);
      await supabase.from("bot_status").update({ is_running: false }).eq("user_id", userId);
    }

    // Get bot configuration
    const { data: botConfig, error: configError } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (configError && configError.code !== 'PGRST116') {
      return res.status(400).json({ error: configError.message });
    }

    if (!botConfig) return res.status(400).json({ error: "No bot configuration found" });

    console.log(`BotConfig: ${JSON.stringify(botConfig)}`);

    // Merge top-level fields with config_data
    const config = { ...botConfig, ...botConfig.config_data };

    // 🔥 Merge both symbol lists safely
    const mergedSymbols = Array.from(
      new Set([
        ...(botConfig.symbols || []),
        ...(botConfig.config_data?.symbols || [])
      ])
    );

    config.symbols = mergedSymbols;

    console.log("🔥 Final symbols to trade:", mergedSymbols);

    if (!config.symbols || !Array.isArray(config.symbols) || config.symbols.length === 0) {
      return res.status(400).json({ error: "Please configure trading symbols first" });
    }

    const baseAmount = config.amountPerTrade || 10;
    if (subscription === 'free' && baseAmount > 10) {
      return res.status(403).json({
        error: "Free users are limited to $10 per trade. Upgrade to premium for higher limits."
      });
    }

    // Initialize strategy
    const strategy = new DerivSupplyDemandStrategy();
    if (config.minSignalGap) strategy.setMinSignalGap(config.minSignalGap * 60000);



    // ... existing imports ...

    // Inside startBot function ...

    const token = config.derivApiToken || config.deriv_api_token || process.env.DERIV_API_TOKEN;

    if (!token) {
      return res.status(400).json({ error: "No Deriv API Token found. Please configure it in Settings." });
    }

    // Initialize Deriv Connection
    const derivConnection = new DerivWebSocket({
      apiToken: token,
      appId: process.env.DERIV_APP_ID || '1089',
      reconnect: true
    });

    derivConnection.connect();

    // Map timeframe to allowed granularity
    // ... existing granularity logic ...

    // Initialize bot state
    const botState = {
      isRunning: true,
      startedAt: new Date(),
      tradingInterval: null as NodeJS.Timeout | null,
      currentTrades: [],
      totalProfit: 0,
      tradesExecuted: 0,
      strategy,
      derivConnected: true,
      deriv: derivConnection, // Store connection
      dailyTrades: 0,
      lastTradeDate: new Date().toISOString().slice(0, 10),
      config
    };
    botStates.set(userId, botState);

    // Trading cycle
    const tradingCycle = async () => {
      if (!botState.isRunning) {
        if (botState.tradingInterval) clearInterval(botState.tradingInterval);
        return;
      }

      try {
        const candlesMap: Record<string, any[]> = {};

        for (const symbol of config.symbols) {
          const desiredTimeframe = symbolTimeFrames[symbol] || 900;
          const closestGranularity = ALLOWED_GRANULARITIES.reduce((prev, curr) =>
            Math.abs(curr - desiredTimeframe) < Math.abs(prev - desiredTimeframe) ? curr : prev
          );

          const candles = await fetchLatestCandles(symbol, closestGranularity, derivConnection);
          if (candles && candles.length > 0) candlesMap[symbol] = candles;
          else console.log(`⚠️ No candles for ${symbol}, skipping`);

          console.log(`Signal debug for ${symbol}: using timeframe ${closestGranularity}s`);
        }

        const availableSymbols = Object.keys(candlesMap);
        if (availableSymbols.length === 0) return;

        console.log(`📊 Available symbols this cycle: ${availableSymbols.join(', ')}`);

        const cycleConfig = { ...config, symbols: availableSymbols, amountPerTrade: baseAmount };
        await executeTradingCycle(userId, cycleConfig, candlesMap);

      } catch (err) {
        console.error(`❌ Error in trading cycle for user ${userId}:`, err);
      }
    };

    const cycleIntervalMs = (config.cycleInterval || 30) * 1000;

    tradingCycle();
    botState.tradingInterval = setInterval(tradingCycle, cycleIntervalMs);

    console.log(`🤖 Bot started for user ${userId}`);
    console.log(`📊 Trading symbols: ${config.symbols.join(', ')}`);
    console.log(`💰 Trade amount: $${baseAmount}`);
    console.log(`👑 Subscription: ${subscription}`);
    console.log(`⏱️ Cycle interval: ${cycleIntervalMs / 1000} seconds`);

    res.json({
      message: "Trading bot started successfully",
      status: "running",
      startedAt: botState.startedAt,
      user: { id: userId, email: userEmail, subscription },
      config
    });

  } catch (error: any) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot: ' + error.message });
  }
};

export { startBot };