import { BotConfig } from "../../../types/BotConfig";
import { BotLogger } from "../../../utils/botLogger";
import { delay } from "../../../utils/delay";
import saveTradeToDatabase from "./saveTradeToDatabase";
import { updateExistingTrades } from "./UpdateExistingTrades";
import symbolTimeFrames from "../helpers/symbolTimeFrames";
import { checkCircuitBreaker } from "../risk/checkCircuitBreaker";
import fetchLatestCandles from "../../../strategies/fetchLatestCandles";
import { botStates } from "../../../types/botStates";
import { supabase } from "../../../config/supabase";

/**
 * Execute a single trading cycle for a given user.
 */
export const executeTradingCycle = async (
  userId: string,
  config: BotConfig,
  candlesMap: Record<string, any[]>
) => {
  const botState = botStates.get(userId);
  if (!botState || !botState.isRunning) return;

  // 🛡️ Concurrency Guard: Prevent overlapping cycles
  if (botState.isProcessing) {
    console.log(`⚠️ [${userId}] Cycle already in progress, skipping...`);
    return;
  }

  botState.isProcessing = true;

  try {

    // 🛡️ Circuit Breaker (Risk Check)
    const riskStatus = await checkCircuitBreaker(userId);
    if (!riskStatus.safe) {
      BotLogger.log(userId, `⚠️ RISK STOP: ${riskStatus.message}`, 'error');
      console.error(`[${userId}] Circuit Breaker Tripped! Stopping bot.`);

      // Add persistent notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'error',
        title: 'Risk Stop Triggered',
        message: riskStatus.message || 'Circuit breaker tripped due to excessive losses.',
        is_read: false
      });

      botState.isRunning = false; // Emergency Stop
      return;
    }

    const mergedSymbols = Array.from(
      new Set([
        ...(config.symbols || []),
      ])
    );

    config.symbols = mergedSymbols;

    const today = new Date().toISOString().slice(0, 10);
    if (botState.lastTradeDate !== today) {
      botState.dailyTrades = 0;
      botState.lastTradeDate = today;
      botState.dailyLimitReachedNotificationSent = false; // Reset notification flag
    }

    let tradesThisCycle = 0;

    // Log scanning start
    BotLogger.log(userId, "🔍 AI Engine: Scanning volatility markets for favorable setups...", "info");

    for (const symbol of config.symbols) {
      if (!botState.isRunning) break;

      // Max trades per cycle
      if (
        config.maxTradesPerCycle &&
        tradesThisCycle >= config.maxTradesPerCycle
      )
        break;

      // Max daily trades
      if (config.dailyTradeLimit && botState.dailyTrades! >= config.dailyTradeLimit) {
        if (!botState.dailyLimitReachedNotificationSent) {
          console.warn(`⚠️ [${userId}] Daily trade limit of ${config.dailyTradeLimit} reached.`);
          BotLogger.log(userId, `Daily trade limit of ${config.dailyTradeLimit} reached. Trading paused for today.`, 'warning');

          // Add persistent notification
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'warning',
            title: 'Daily Trade Limit Reached',
            message: `Your daily trade limit of ${config.dailyTradeLimit} has been reached. Trading is paused until tomorrow.`,
            is_read: false
          });

          botState.dailyLimitReachedNotificationSent = true;
        }
        break;
      }


      try {
        console.log(`🔄 Processing Symbol: ${symbol}`);
        let candles = candlesMap[symbol];

        if (!candles || candles.length === 0) {
          // Fallback fetch if not in map
          try {
            const timeframe = symbolTimeFrames[symbol as keyof typeof symbolTimeFrames] || 900;
            candles = await fetchLatestCandles(symbol, timeframe, botState.derivWS);
          } catch (err: any) {
            console.log(`⚠️ Skipping ${symbol}: ${err.message}`);
            continue;
          }
        }

        if (!candles || candles.length === 0) {
          console.log(`⚠️ No candle data for ${symbol}, skipping`);
          continue;
        }

        const signal = botState.strategy.analyze(
          candles,
          symbol,
          symbolTimeFrames[symbol as keyof typeof symbolTimeFrames] || 900
        );

        if (!signal || signal.action === "HOLD") {
          console.log(`🚫 No signal generated for ${symbol}`);
          continue;
        }

        // --- Sentinel Filter & AI Fallback ---
        const baseAmount = config.amountPerTrade || 10;
        signal.amount = baseAmount; // Set base amount before sentinel

        const sentinelDecision = await botState.sentinel.executeScalpWithFallback(
          signal,
          botState.subscriptionTier || 'free',
          botState.hasTakenFirstTrade || false
        );

        if (!sentinelDecision.shouldExecute) {
          console.log(`🛡️ [${userId}] Sentinel Blocked Trade for ${symbol}: Low AI Confidence.`);
          BotLogger.log(userId, `⚖️ Philosopher's Shield: Strategy detected a setup for ${symbol}, but AI confidence (${(sentinelDecision.confidence * 100).toFixed(0)}%) is below threshold. Standing by.`, 'info', symbol);
          continue;
        }

        const executionAmount = sentinelDecision.amount;
        signal.amount = executionAmount; // Apply adjusted amount

        BotLogger.log(userId, `Signal approved by Sentinel for ${symbol} (Amount: $${executionAmount})`, 'success', symbol);

        // --- Execution Logic ---
        const mode = botState.executionMode || 'auto';

        if (mode === 'signal_only') {
          BotLogger.log(userId, `Philosopher's Signal: Opportunity detected but Automation is reserved for Elite Tier.`, 'warning', symbol);
          continue;
        }

        // Execute via the new OCO-supported method in DerivWebSocket
        const tradeResult = await botState.derivWS.executeTrade(signal);

        if (tradeResult && mode === 'first_trade') {
          await supabase.from('profiles').update({ has_taken_first_trade: true }).eq('id', userId);
          botState.executionMode = 'signal_only';
          botState.hasTakenFirstTrade = true;
          BotLogger.log(userId, `The Emperor has spoken. First trade used. Upgrade to Elite for full automation.`, 'info');
        }

        if (tradeResult) {
          botState.tradesExecuted!++;
          botState.dailyTrades!++;
          tradesThisCycle++;
          botState.currentTrades.push(tradeResult);

          await saveTradeToDatabase(userId, {
            ...tradeResult,
            symbol,
            contractType: signal.contract_type,
            action: signal.action,
            amount: signal.amount,
            entryPrice: tradeResult.entry_tick || 0,
            status: 'open',
            timestamp: new Date()
          });
        }

        await delay(2000); // small pause between symbols

      } catch (error: any) {
        console.error(`❌ [${userId}] Error processing ${symbol}:`, error.message);
        BotLogger.log(userId, `Error processing ${symbol}: ${error.message}`, 'error', symbol);
      }
    }

    const updated = await updateExistingTrades(userId);
    if (updated > 0) console.log(`📝 Updated ${updated} open trades`);

    console.log(`⏳ Next cycle in ${config.cycleInterval ?? 30} seconds...`);

    // Final cycle log if no trades were executed
    if (tradesThisCycle === 0) {
      BotLogger.log(userId, "✅ Analysis complete. No high-probability setups found. Monitoring continues...", "info");
    } else {
      BotLogger.log(userId, `🚀 Cycle complete. ${tradesThisCycle} trade(s) executed successfully.`, "success");
    }
  } finally {
    botState.isProcessing = false;
  }
};