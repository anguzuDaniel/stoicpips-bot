import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { DerivSupplyDemandStrategy } from '../../strategies/DerivSupplyDemandStrategy';
import ALLOWED_GRANULARITIES from './helpers/ALLOWED_GRANULARITIES';
import symbolTimeFrames from './helpers/symbolTimeFrames';
import { DerivWebSocket } from "../../deriv/DerivWebSocket";
import { BotLogger } from "../../utils/botLogger";

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

    // Prevent multiple bots (Running)
    if (botStates.has(userId)) {
      const existingState = botStates.get(userId);
      if (existingState.isRunning) {
        return res.status(400).json({ error: "You already have a bot running. Stop the current bot first." });
      }

      // If exists but not running (Idle), disconnect old socket to start fresh
      if (existingState.derivWS) {
        console.log(`♻️ Cleaning up idle connection for user ${userId}`);
        try {
          existingState.derivWS.disconnect();
        } catch (e) { console.error("Error disconnecting old socket", e); }
      }
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

    // Check Subscription Tier & First Trade Logic
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, has_taken_first_trade')
      .eq('id', userId)
      .single();

    const tier = profile?.subscription_tier || 'free';
    const hasTakenFirstTrade = profile?.has_taken_first_trade || false;
    let executionMode = 'auto'; // Default for Elite

    if (tier === 'free') {
      if (hasTakenFirstTrade) {
        return res.status(403).json({
          error: "The Emperor has spoken. You have seen the power of SyntoicAi. Upgrade to Elite for full automation.",
          code: "UPGRADE_REQUIRED"
        });
      }
      executionMode = 'first_trade';
      console.log(`🎁 [${userId}] User granted First Trade Exception.`);
    } else if (tier === 'pro') {
      executionMode = 'signal_only';
      console.log(`🛡️ [${userId}] Pro Tier: Signal Only Mode.`);
    } else {
      console.log(`👑 [${userId}] Elite Tier: Full Automation.`);
    }

    const baseAmount = config.amountPerTrade || 10;
    if (tier === 'free' && baseAmount > 10) {
      return res.status(403).json({
        error: "Free users are limited to $10 per trade. Upgrade to premium for higher limits."
      });
    }

    // Initialize strategy
    const strategy = new DerivSupplyDemandStrategy();
    if (config.minSignalGap) strategy.setMinSignalGap(config.minSignalGap * 60000);



    // ... existing imports ...

    // Inside startBot function ...


    const sanitizeToken = (t: string) => t ? t.trim().replace(/[\[\]"]/g, '') : '';
    const demoToken = sanitizeToken(config.deriv_demo_token || config.derivDemoToken);
    const realToken = sanitizeToken(config.deriv_real_token || config.derivRealToken);

    if (!demoToken && !realToken) {
      return res.status(400).json({
        error: "No Deriv API Tokens found. Please go to Settings and configure your Real and Demo API Tokens."
      });
    }

    // Default to demo if available for safety
    let token = demoToken;
    let activeAccountType = 'demo';

    if (!token) {
      // Fallback to real if demo is missing
      console.warn("⚠️ No Demo token found. Starting in REAL mode.");
      token = realToken;
      activeAccountType = 'real';
    }

    console.log(`🔑 Using ${activeAccountType.toUpperCase()} Token: ${token.substring(0, 4)}...`);

    // Initialize Deriv Connection
    const derivConnection = new DerivWebSocket({
      apiToken: token,
      appId: process.env.DERIV_APP_ID || '1089',
      reconnect: true
    });

    // Wire up logs to frontend
    derivConnection.on('log', (logData: any) => {
      BotLogger.log(userId, logData.message, logData.type);
    });

    // Wait for connection & authorization check
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          // Don't disconnect here, let the catch block handle cleanup
          reject(new Error("Timeout waiting for Deriv authorization"));
        }, 15000);

        derivConnection.once('authorized', (auth: any) => {
          clearTimeout(timeout);
          if (auth.success) resolve(auth);
          else reject(new Error(auth.error || "Authorization failed"));
        });

        // Also listen for error during connect
        // derivConnection emits 'error' event? Checked source, yes.
        // But 'error' might restart connection. We want to catch fatal auth/connect errors.

        derivConnection.connect();
      });

      // Check Balance for Real Accounts
      const status = derivConnection.getStatus();
      if (activeAccountType === 'real' && status.balance <= 0.5) {
        console.warn(`🛑 [${userId}] Real account empty (${status.balance}). Blocking start.`);
        derivConnection.disconnect();
        return res.status(400).json({
          error: `Insufficient Funds: Your Real Account balance is ${status.balance} ${status.currency || 'USD'}. Please deposit funds to start trading.`
        });
      }

    } catch (err: any) {
      console.error("❌ Connection failed during start:", err.message);
      derivConnection.disconnect();
      return res.status(400).json({ error: `Connection failed: ${err.message}` });
    }

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
      derivWS: derivConnection, // Store connection as derivWS to match other controllers
      dailyTrades: 0,
      lastTradeDate: new Date().toISOString().slice(0, 10),
      executionMode,
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