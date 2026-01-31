"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTradingCycle = void 0;
const botLogger_1 = require("../../../utils/botLogger");
const delay_1 = require("../../../utils/delay");
const saveTradeToDatabase_1 = __importDefault(require("./saveTradeToDatabase"));
const UpdateExistingTrades_1 = require("./UpdateExistingTrades");
const symbolTimeFrames_1 = __importDefault(require("../helpers/symbolTimeFrames"));
const checkCircuitBreaker_1 = require("../risk/checkCircuitBreaker");
const fetchLatestCandles_1 = __importDefault(require("../../../strategies/fetchLatestCandles"));
const botStates_1 = require("../../../types/botStates");
const supabase_1 = require("../../../config/supabase");
/**
 * Execute a single trading cycle for a given user.
 */
const executeTradingCycle = async (userId, config, candlesMap) => {
    const botState = botStates_1.botStates.get(userId);
    if (!botState || !botState.isRunning)
        return;
    // 🛡️ Concurrency Guard: Prevent overlapping cycles
    if (botState.isProcessing) {
        console.log(`⚠️ [${userId}] Cycle already in progress, skipping...`);
        return;
    }
    botState.isProcessing = true;
    try {
        // 🛡️ Circuit Breaker (Risk Check)
        const riskStatus = await (0, checkCircuitBreaker_1.checkCircuitBreaker)(userId);
        if (!riskStatus.safe) {
            botLogger_1.BotLogger.log(userId, `⚠️ RISK STOP: ${riskStatus.message}`, 'error');
            console.error(`[${userId}] Circuit Breaker Tripped! Stopping bot.`);
            // Add persistent notification
            await supabase_1.supabase.from('notifications').insert({
                user_id: userId,
                type: 'error',
                title: 'Risk Stop Triggered',
                message: riskStatus.message || 'Circuit breaker tripped due to excessive losses.',
                is_read: false
            });
            botState.isRunning = false; // Emergency Stop
            return;
        }
        const mergedSymbols = Array.from(new Set([
            ...(config.symbols || []),
        ]));
        config.symbols = mergedSymbols;
        const today = new Date().toISOString().slice(0, 10);
        if (botState.lastTradeDate !== today) {
            botState.dailyTrades = 0;
            botState.lastTradeDate = today;
            botState.dailyLimitReachedNotificationSent = false; // Reset notification flag
        }
        let tradesThisCycle = 0;
        // Log scanning start
        botLogger_1.BotLogger.log(userId, "🔍 AI Engine: Scanning volatility markets for favorable setups...", "info");
        for (const symbol of config.symbols) {
            if (!botState.isRunning)
                break;
            // Max trades per cycle
            if (config.maxTradesPerCycle &&
                tradesThisCycle >= config.maxTradesPerCycle)
                break;
            // Max daily trades
            if (config.dailyTradeLimit && botState.dailyTrades >= config.dailyTradeLimit) {
                if (!botState.dailyLimitReachedNotificationSent) {
                    console.warn(`⚠️ [${userId}] Daily trade limit of ${config.dailyTradeLimit} reached.`);
                    botLogger_1.BotLogger.log(userId, `Daily trade limit of ${config.dailyTradeLimit} reached. Trading paused for today.`, 'warning');
                    // Add persistent notification
                    await supabase_1.supabase.from('notifications').insert({
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
                        const timeframe = symbolTimeFrames_1.default[symbol] || 900;
                        candles = await (0, fetchLatestCandles_1.default)(symbol, timeframe, botState.derivWS);
                    }
                    catch (err) {
                        console.log(`⚠️ Skipping ${symbol}: ${err.message}`);
                        continue;
                    }
                }
                if (!candles || candles.length === 0) {
                    console.log(`⚠️ No candle data for ${symbol}, skipping`);
                    continue;
                }
                const signal = botState.strategy.analyze(candles, symbol, symbolTimeFrames_1.default[symbol] || 900);
                if (!signal || signal.action === "HOLD") {
                    console.log(`🚫 No signal generated for ${symbol}`);
                    continue;
                }
                // --- Sentinel Filter & AI Fallback ---
                const baseAmount = config.amountPerTrade || 10;
                signal.amount = baseAmount; // Set base amount before sentinel
                const sentinelDecision = await botState.sentinel.executeScalpWithFallback(signal, botState.subscriptionTier || 'free', botState.hasTakenFirstTrade || false);
                if (!sentinelDecision.shouldExecute) {
                    console.log(`🛡️ [${userId}] Sentinel Blocked Trade for ${symbol}: Low AI Confidence.`);
                    botLogger_1.BotLogger.log(userId, `⚖️ Philosopher's Shield: Strategy detected a setup for ${symbol}, but AI confidence (${(sentinelDecision.confidence * 100).toFixed(0)}%) is below threshold. Standing by.`, 'info', symbol);
                    continue;
                }
                const executionAmount = sentinelDecision.amount;
                signal.amount = executionAmount; // Apply adjusted amount
                botLogger_1.BotLogger.log(userId, `Signal approved by Sentinel for ${symbol} (Amount: $${executionAmount})`, 'success', symbol);
                // --- Execution Logic ---
                const mode = botState.executionMode || 'auto';
                if (mode === 'signal_only') {
                    botLogger_1.BotLogger.log(userId, `Philosopher's Signal: Opportunity detected but Automation is reserved for Elite Tier.`, 'warning', symbol);
                    continue;
                }
                // Execute via the new OCO-supported method in DerivWebSocket
                const tradeResult = await botState.derivWS.executeTrade(signal);
                if (tradeResult && mode === 'first_trade') {
                    await supabase_1.supabase.from('profiles').update({ has_taken_first_trade: true }).eq('id', userId);
                    botState.executionMode = 'signal_only';
                    botState.hasTakenFirstTrade = true;
                    botLogger_1.BotLogger.log(userId, `The Emperor has spoken. First trade used. Upgrade to Elite for full automation.`, 'info');
                }
                if (tradeResult) {
                    botState.tradesExecuted++;
                    botState.dailyTrades++;
                    tradesThisCycle++;
                    botState.currentTrades.push(tradeResult);
                    await (0, saveTradeToDatabase_1.default)(userId, {
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
                await (0, delay_1.delay)(2000); // small pause between symbols
            }
            catch (error) {
                console.error(`❌ [${userId}] Error processing ${symbol}:`, error.message);
                botLogger_1.BotLogger.log(userId, `Error processing ${symbol}: ${error.message}`, 'error', symbol);
            }
        }
        const updated = await (0, UpdateExistingTrades_1.updateExistingTrades)(userId);
        if (updated > 0)
            console.log(`📝 Updated ${updated} open trades`);
        console.log(`⏳ Next cycle in ${config.cycleInterval ?? 30} seconds...`);
        // Final cycle log if no trades were executed
        if (tradesThisCycle === 0) {
            botLogger_1.BotLogger.log(userId, "✅ Analysis complete. No high-probability setups found. Monitoring continues...", "info");
        }
        else {
            botLogger_1.BotLogger.log(userId, `🚀 Cycle complete. ${tradesThisCycle} trade(s) executed successfully.`, "success");
        }
    }
    finally {
        botState.isProcessing = false;
    }
};
exports.executeTradingCycle = executeTradingCycle;
