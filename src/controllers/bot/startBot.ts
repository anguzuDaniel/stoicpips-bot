import { Response } from 'express';
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { HybridScalpStrategy } from '../../strategies/HybridScalpStrategy';
import { SentinelExecutionLayer } from '../../strategies/SentinelExecutionLayer';
import ALLOWED_GRANULARITIES from './helpers/ALLOWED_GRANULARITIES';
import symbolTimeFrames from './helpers/symbolTimeFrames';
import { DerivWebSocket } from "../../deriv/DerivWebSocket";
import { BotLogger } from "../../utils/botLogger";
import { botStates } from '../../types/botStates';
import { executeTradingCycle } from './trade/executeTradingCycle';
import { supabase } from '../../config/supabase';
import fetchLatestCandles from '../../strategies/fetchLatestCandles';
import { createNotification } from '../../utils/createNotification';

export const startBot = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const subscription = req.user.subscription_status;

    console.log(`🚀 Starting bot for user ${userId} (${userEmail})`);

    // Prevent multiple bots (Running)
    if (botStates.has(userId)) {
      const existingState = botStates.get(userId);
      if (existingState!.isRunning) {
        return res.status(400).json({ error: "You already have a bot running. Stop the current bot first." });
      }

      // If exists but not running (Idle), disconnect old socket to start fresh
      if (existingState!.derivWS) {
        console.log(`♻️ Cleaning up idle connection for user ${userId}`);
        try {
          existingState!.derivWS.disconnect();
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

    if (!config.symbols || !Array.isArray(config.symbols) || config.symbols.length === 0) {
      return res.status(400).json({ error: "Please configure trading symbols first" });
    }

    // Check Subscription Tier & First Trade Logic
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, has_taken_first_trade, created_at, bank_name, account_number, account_name')
      .eq('id', userId)
      .single();

    const tier = profile?.subscription_tier || 'free';
    const hasTakenFirstTrade = profile?.has_taken_first_trade || false;
    const createdAt = profile?.created_at;
    const { bank_name, account_number, account_name } = profile || {};
    let executionMode = 'auto'; // Default for Elite

    // Card Information Check (Required for account linkage/trading)
    if (!bank_name || !account_number || !account_name) {
      console.warn(`⚠️ [${userId}] Missing Card Info - Blocking startup`);
      return res.status(403).json({
        error: "Card Information Required: Please go to 'Account Profile' and update your card details (Cardholder Name, Card Number, Expiry/CVV) before starting the bot.",
        code: "CARD_INFO_REQUIRED"
      });
    }

    // 1-Week Trial Check
    const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
    const isTrialExpired = createdAt && (new Date().getTime() - new Date(createdAt).getTime()) > trialDurationMs;

    if (tier === 'free') {
      if (isTrialExpired) {
        return res.status(403).json({
          error: "Your 1-week free trial has expired. Upgrade to Pro or Elite to continue using Dunam Ai.",
          code: "UPGRADE_REQUIRED"
        });
      }

      // Allow full access for 1 week
      executionMode = 'auto'; // Was 'first_trade'

      // If this is effectively their "first" real run (even if we reset them), let's show the welcome
      if (!hasTakenFirstTrade) {
        // modifying the response object later to include this
        // We can attach it to req or just set a local var
      }
      BotLogger.log(userId, "Welcome! You are currently in your 1-week free trial. Enjoy full access!", "info");
    } else if (tier === 'pro') {
      executionMode = 'signal_only';
    } else {
      console.log(`👑 [${userId}] Elite Tier: Full Automation.`);
    }

    const baseAmount = config.amountPerTrade || 10;
    if (tier === 'free' && baseAmount > 10) {
      return res.status(403).json({
        error: "Free users are limited to $10 per trade. Upgrade to premium for higher limits."
      });
    }

    // Initialize strategy & Sentinel
    const strategy = new HybridScalpStrategy();
    const sentinel = new SentinelExecutionLayer();

    if (config.minSignalGap) strategy.minSignalGap = config.minSignalGap * 60000;

    const sanitizeToken = (t: string) => t ? t.trim().replace(/[\[\]"]/g, '') : '';
    const demoToken = sanitizeToken(config.deriv_demo_token || config.derivDemoToken);
    const realToken = sanitizeToken(config.deriv_real_token || config.derivRealToken);

    if (!demoToken && !realToken) {
      return res.status(400).json({
        error: "Account Information Required: No Deriv API Tokens found. Please go to Settings > Account Information and configure your Real or Demo API Tokens to start trading.",
        code: "ACCOUNT_INFO_REQUIRED"
      });
    }

    // Default to demo if available for safety
    let token = demoToken;
    let activeAccountType = 'demo';

    if (!token) {
      console.warn("⚠️ No Demo token found. Starting in REAL mode.");
      token = realToken;
      activeAccountType = 'real';
    }

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
          reject(new Error("Timeout waiting for Deriv authorization"));
        }, 15000);

        derivConnection.once('authorized', (auth: any) => {
          clearTimeout(timeout);
          if (auth.success) resolve(auth);
          else reject(new Error(auth.error || "Authorization failed"));
        });

        derivConnection.connect();
      });

      // Check Balance for Real Accounts
      const status = derivConnection.getStatus();
      if (activeAccountType === 'real' && status.balance <= 0.5) {
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

    // Initialize bot state
    const botState = {
      isRunning: true,
      startedAt: new Date(),
      tradingInterval: null as NodeJS.Timeout | null,
      currentTrades: [],
      totalProfit: 0,
      tradesExecuted: 0,
      strategy,
      sentinel,
      derivConnected: true,
      derivWS: derivConnection,
      dailyTrades: 0,
      lastTradeDate: new Date().toISOString().slice(0, 10),
      executionMode,
      config,
      subscriptionTier: tier,
      hasTakenFirstTrade
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
          const desiredTimeframe = symbolTimeFrames[symbol as keyof typeof symbolTimeFrames] || 900;
          const closestGranularity = ALLOWED_GRANULARITIES.reduce((prev, curr) =>
            Math.abs(curr - desiredTimeframe) < Math.abs(prev - desiredTimeframe) ? curr : prev
          );

          const candles = await fetchLatestCandles(symbol, closestGranularity, derivConnection);
          if (candles && candles.length > 0) candlesMap[symbol] = candles;
          else console.log(`⚠️ No candles for ${symbol}, skipping`);
        }

        const availableSymbols = Object.keys(candlesMap);
        if (availableSymbols.length === 0) return;

        const cycleConfig = { ...config, symbols: availableSymbols, amountPerTrade: baseAmount };
        await executeTradingCycle(userId, cycleConfig, candlesMap);

      } catch (err) {
        console.error(`❌ Error in trading cycle for user ${userId}:`, err);
      }
    };

    const cycleIntervalMs = (config.cycleInterval || 1) * 1000;

    // Non-overlapping loop
    const runCycle = async () => {
      if (!botState.isRunning) return;

      await tradingCycle();

      // Schedule next run ONLY after the previous one finishes
      if (botState.isRunning) {
        botState.tradingInterval = setTimeout(runCycle, cycleIntervalMs);
      }
    };

    runCycle();

    // Send Notification
    await createNotification(
      userId,
      "Bot Started 🚀",
      `The AI engine is active. Strategy: Directional-Aware (1s). Syms: ${config.symbols.length}`,
      'success'
    );

    res.json({
      message: "Trading bot started successfully",
      status: "running",
      startedAt: botState.startedAt,
      user: { id: userId, email: userEmail, subscription, subscriptionTier: tier },
      config,
      welcomeMessage: (tier === 'free' && !hasTakenFirstTrade) ? "Welcome to your 1-week free trial! 🚀 Enjoy the full power of Dunam Ai. Consider upgrading to Elite if you love the experience!" : undefined
    });

  } catch (error: any) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot: ' + error.message });
  }
};