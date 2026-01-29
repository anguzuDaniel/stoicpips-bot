import { BotConfig } from "../../../types/BotConfig";
import { BotLogger } from "../../../utils/botLogger";
import { DerivSupplyDemandStrategy } from "../../../strategies/DerivSupplyDemandStrategy";
import { delay } from "../../../utils/delay";
import saveTradeToDatabase from "./saveTradeToDatabase";
import convertTimeframe from "../helpers/convertTimeFrame";
import { updateExistingTrades } from "./UpdateExistingTrades";
import symbolTimeFrames from "../helpers/symbolTimeFrames";

import { checkCircuitBreaker } from "../risk/checkCircuitBreaker";
const fetchLatestCandles = require("../../../strategies/fetchLatestCandles");
const executeTradeOnDeriv = require("./../deriv/executeTradeOnDeriv");
const botStates = require("../../../types/botStates");
const supabase = require("../../../config/supabase").supabase;



/**
 * Execute a single trading cycle for a given user.
 * This function is called repeatedly by the bot controller.
 * It fetches the latest candle data for all symbols in the user's config,
 * analyzes the data using the Supply/Demand strategy, and executes trades
 * based on the strategy's signals.
 *
 * @param userId The ID of the user to execute the trading cycle for.
 * @param config The user's bot configuration.
 * @param candlesMap A map of symbol to candle data.
 */
export const executeTradingCycle = async (
  userId: string,
  config: BotConfig,
  candlesMap: Record<string, any[]>
) => {
  const botState = botStates.get(userId);
  if (!botState || !botState.isRunning) return;

  // 🛡️ Circuit Breaker (Risk Check)
  const riskStatus = await checkCircuitBreaker(userId);
  if (!riskStatus.safe) {
    BotLogger.log(userId, `⚠️ RISK STOP: ${riskStatus.message}`, 'error');
    console.error(`[${userId}] Circuit Breaker Tripped! Stopping bot.`);
    botState.isRunning = false; // Emergency Stop
    return;
  }

  const mergedSymbols = Array.from(
    new Set([
      ...(config.symbols || []),
    ])
  );

  config.symbols = mergedSymbols;
  console.log(`🔥 Final Symbols: ${JSON.stringify(config.symbols)}`);

  const today = new Date().toISOString().slice(0, 10);
  if (botState.lastTradeDate !== today) {
    botState.dailyTrades = 0;
    botState.lastTradeDate = today;
  }

  let tradesThisCycle = 0;

  // BotLogger.log(userId, 'Scanning market for opportunities...', 'info');

  for (const symbol of config.symbols) {
    if (!botState.isRunning) break;

    // Max trades per cycle
    if (
      config.maxTradesPerCycle &&
      tradesThisCycle >= config.maxTradesPerCycle
    )
      break;

    // Max daily trades
    if (config.dailyTradeLimit && botState.dailyTrades >= config.dailyTradeLimit)
      break;


    try {
      let candles = [];

      try {

        candles = await fetchLatestCandles(symbol, symbolTimeFrames[symbol], botState.derivWS);

      } catch (err: any) {
        console.log(`⚠️ Skipping ${symbol}: ${err.message}`);
        continue; // Continue to next symbol
      }

      if (!candles || candles.length === 0) {
        console.log(`⚠️ No candle data for ${symbol}, skipping`);
        continue;
      }

      const signal = botState.strategy.analyze(
        candles,
        symbol,
        symbolTimeFrames[symbol]
      );

      console.log(`Signal debug for ${symbol}:`, signal);

      if (!signal || signal.action === "HOLD") {
        console.log(`⏸️ [${userId}] HOLD → ${symbol}`);
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
        continue;
      }

      const executionAmount = sentinelDecision.amount;
      signal.amount = executionAmount; // Apply adjusted amount (e.g. 50% for fallback)

      BotLogger.log(userId, `Signal approved by Sentinel for ${symbol} (Amount: $${executionAmount})`, 'success', symbol);

      // --- Execution Logic ---
      const mode = botState.executionMode || 'auto';

      if (mode === 'signal_only') {
        console.log(`🛡️ [${userId}] Signal Only Mode. Skipping execution.`);
        BotLogger.log(userId, `Philosopher's Signal: Opportunity detected but Automation is reserved for Elite Tier.`, 'warning', symbol);
        continue;
      }

      // Execute via the new OCO-supported method in DerivWebSocket
      // This uses multipliers with exchange-managed TP/SL
      const tradeResult = await botState.derivWS.executeTrade(signal);

      if (tradeResult && mode === 'first_trade') {
        console.log(`🎁 [${userId}] First trade executed. Disabling further automation.`);
        await supabase.from('profiles').update({ has_taken_first_trade: true }).eq('id', userId);
        botState.executionMode = 'signal_only';
        botState.hasTakenFirstTrade = true;
        BotLogger.log(userId, `The Emperor has spoken. First trade used. Upgrade to Elite for full automation.`, 'info');
      }
      // -----------------------------

      if (tradeResult) {
        botState.tradesExecuted++;
        botState.dailyTrades++;
        tradesThisCycle++;
        botState.currentTrades.push(tradeResult);

        // Optionally save to DB if structure matches
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

  // Log summary if no trades were verified this cycle to reassure user bot is running
  if (tradesThisCycle === 0) {
    // BotLogger.log(userId, 'Cycle complete: No trade opportunities found in active zones', 'info');
  }

  console.log(`⏳ Next cycle in ${config.cycleInterval ?? 30} seconds...`);
};