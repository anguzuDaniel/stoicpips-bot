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
const fetchLatestCandles = require("../../../strategies/fetchLatestCandles");
const executeTradeOnDeriv = require("./../deriv/executeTradeOnDeriv");
const botStates = require("../../../types/botStates");
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
const executeTradingCycle = async (userId, config, candlesMap) => {
    const botState = botStates.get(userId);
    if (!botState || !botState.isRunning)
        return;
    // 🛡️ Circuit Breaker (Risk Check)
    const riskStatus = await (0, checkCircuitBreaker_1.checkCircuitBreaker)(userId);
    if (!riskStatus.safe) {
        botLogger_1.BotLogger.log(userId, `⚠️ RISK STOP: ${riskStatus.message}`, 'error');
        console.error(`[${userId}] Circuit Breaker Tripped! Stopping bot.`);
        botState.isRunning = false; // Emergency Stop
        return;
    }
    const mergedSymbols = Array.from(new Set([
        ...(config.symbols || []),
    ]));
    config.symbols = mergedSymbols;
    console.log(`🔥 Final Symbols: ${JSON.stringify(config.symbols)}`);
    const today = new Date().toISOString().slice(0, 10);
    if (botState.lastTradeDate !== today) {
        botState.dailyTrades = 0;
        botState.lastTradeDate = today;
    }
    let tradesThisCycle = 0;
    botLogger_1.BotLogger.log(userId, 'Scanning market for opportunities...', 'info');
    for (const symbol of config.symbols) {
        if (!botState.isRunning)
            break;
        // Max trades per cycle
        if (config.maxTradesPerCycle &&
            tradesThisCycle >= config.maxTradesPerCycle)
            break;
        // Max daily trades
        if (config.dailyTradeLimit && botState.dailyTrades >= config.dailyTradeLimit)
            break;
        try {
            let candles = [];
            try {
                candles = await fetchLatestCandles(symbol, symbolTimeFrames_1.default[symbol], botState.deriv);
            }
            catch (err) {
                console.log(`⚠️ Skipping ${symbol}: ${err.message}`);
                continue; // Continue to next symbol
            }
            if (!candles || candles.length === 0) {
                console.log(`⚠️ No candle data for ${symbol}, skipping`);
                continue;
            }
            const signal = botState.strategy.analyzeCandles(candles, symbol, symbolTimeFrames_1.default[symbol]);
            console.log(`Signal debug for ${symbol}:`, signal);
            if (signal.action === "HOLD") {
                const reason = signal.reason || 'No signal';
                console.log(`⏸️ [${userId}] HOLD → ${symbol}: ${reason}`);
                // Removed UI log to prevent spam
                continue;
            }
            botLogger_1.BotLogger.log(userId, `Signal found for ${symbol} (${signal.action} ${signal.contract_type})`, 'success', symbol);
            const tradeResult = await executeTradeOnDeriv(userId, signal, config, botState.deriv);
            if (tradeResult) {
                botState.tradesExecuted++;
                botState.dailyTrades++;
                tradesThisCycle++;
                botState.currentTrades.push(tradeResult);
                await (0, saveTradeToDatabase_1.default)(userId, tradeResult);
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
    // Log summary if no trades were verified this cycle to reassure user bot is running
    if (tradesThisCycle === 0) {
        botLogger_1.BotLogger.log(userId, 'Cycle complete: No trade opportunities found in active zones', 'info');
    }
    console.log(`⏳ Next cycle in ${config.cycleInterval ?? 30} seconds...`);
};
exports.executeTradingCycle = executeTradingCycle;
