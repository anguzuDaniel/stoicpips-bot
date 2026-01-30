"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DerivWebSocket_1 = require("../deriv/DerivWebSocket");
const HybridScalpStrategy_1 = require("../strategies/HybridScalpStrategy");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * High-Fidelity Backtester for Directional-Aware Strategy
 *
 * 1. Fetches historical data for Volatility 75 (1-minute candles)
 * 2. Simulates HybridScalpStrategy execution on every candle
 * 3. Records paper trades and generates performance metrics
 */
async function runBacktest() {
    console.log("🚀 Starting High-Fidelity Backtest...");
    // 1. Setup Connection & Strategy
    const apiToken = process.env.DERIV_API_TOKEN;
    const appId = process.env.DERIV_APP_ID || "65646";
    if (!apiToken) {
        console.error("❌ DERIV_API_TOKEN missing in .env");
        process.exit(1);
    }
    const deriv = new DerivWebSocket_1.DerivWebSocket({
        apiToken,
        appId,
        reconnect: false
    });
    const strategy = new HybridScalpStrategy_1.HybridScalpStrategy();
    // 2. Fetch Historical Data
    console.log("📥 Fetching historical data for R_75 (1m candles)...");
    // Create a promise to handle the async websocket response
    const history = await new Promise((resolve, reject) => {
        deriv.connect();
        deriv.on('open', () => {
            console.log("Wait for open...");
        });
        // Wait for connection
        setTimeout(() => {
            deriv.send({
                ticks_history: "R_75",
                adjust_start_time: 1,
                count: 50000, // Max allowed by basic API is usually 5000, might need pagination or smaller chunks for 30 days. 
                // 30 days * 24h * 60m = 43,200 candles. 
                // We'll try requesting max and seeing what we get, or just use `style: 'candles'` with a larger count if supported or loop.
                // For simplicity in this script, we'll ask for 5000 (approx 3.5 days) as a proof of concept, or try 'latest' with a high count.
                // Note: Deriv standard API limit for ticks_history is often 5000. 
                end: "latest",
                start: 1,
                style: "candles",
                granularity: 60 // 1 minute
            });
        }, 2000);
        deriv.on('message', (data) => {
            if (data.candles) {
                console.log(`✅ Received ${data.candles.length} candles.`);
                const candles = data.candles.map((c) => ({
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                    epoch: c.epoch
                }));
                resolve(candles);
                deriv.disconnect();
            }
            else if (data.error) {
                reject(new Error(data.error.message));
                deriv.disconnect();
            }
        });
        // Timeout
        setTimeout(() => {
            reject(new Error("Timeout fetching candles"));
            deriv.disconnect();
        }, 30000);
    });
    if (history.length < 100) {
        console.error("❌ Not enough data for backtest.");
        return;
    }
    // 3. Run Simulation
    console.log(`🔄 Simulating strategy on ${history.length} candles...`);
    const results = {
        trades: [],
        metrics: {
            totalTrades: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            grossProfit: 0,
            grossLoss: 0,
            directionalAccuracy: {
                rise: { wins: 0, total: 0 },
                fall: { wins: 0, total: 0 }
            }
        }
    };
    let balance = 10000; // Starting Balance
    let maxBalance = balance;
    let currentDrawdown = 0;
    // Window size for indicators (e.g. 100 candles)
    // We slide a window of past candles to analyze proper indicator values
    const windowSize = 100;
    for (let i = windowSize; i < history.length - 5; i++) { // -5 to allow checking future result (5m expiration)
        // Create sliding window
        const window = history.slice(i - windowSize, i + 1); // Current + past
        const currentCandle = window[window.length - 1];
        // Analyze
        const signal = strategy.analyze(window, "R_75", 60);
        if (signal && signal.action !== "HOLD") {
            // Paper Trade
            const entryPrice = currentCandle.close;
            const duration = 5; // 5 minute expiry
            const exitCandle = history[i + duration]; // Future candle
            const exitPrice = exitCandle.close;
            let profit = 0;
            let status = 'loss';
            const stake = 100;
            const payout = 195; // 95% return approx
            if (signal.contract_type === 'CALL') {
                if (exitPrice > entryPrice) {
                    profit = payout - stake;
                    status = 'win';
                }
                else {
                    profit = -stake;
                }
            }
            else if (signal.contract_type === 'PUT') {
                if (exitPrice < entryPrice) {
                    profit = payout - stake;
                    status = 'win';
                }
                else {
                    profit = -stake;
                }
            }
            // Record Trade
            balance += profit;
            // Drawdown Logic
            if (balance > maxBalance)
                maxBalance = balance;
            const dd = maxBalance - balance;
            if (dd > results.metrics.maxDrawdown)
                results.metrics.maxDrawdown = dd;
            const tradeResult = {
                id: results.trades.length + 1,
                time: new Date(currentCandle.epoch * 1000).toISOString(),
                type: signal.contract_type,
                entry: entryPrice,
                exit: exitPrice,
                status,
                pnl: profit,
                balance
            };
            results.trades.push(tradeResult);
            // Update Metrics
            results.metrics.totalTrades++;
            if (status === 'win') {
                results.metrics.wins++;
                results.metrics.grossProfit += profit;
                if (signal.contract_type === 'CALL')
                    results.metrics.directionalAccuracy.rise.wins++;
                else
                    results.metrics.directionalAccuracy.fall.wins++;
            }
            else {
                results.metrics.losses++;
                results.metrics.grossLoss += Math.abs(profit);
            }
            if (signal.contract_type === 'CALL')
                results.metrics.directionalAccuracy.rise.total++;
            else
                results.metrics.directionalAccuracy.fall.total++;
        }
    }
    // Final Calculations
    results.metrics.winRate = (results.metrics.wins / results.metrics.totalTrades) * 100;
    results.metrics.profitFactor = results.metrics.grossProfit / (results.metrics.grossLoss || 1);
    // 4. Output Results
    const outputPath = path.join(__dirname, "../..", "backtest_results.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log("✅ Backtest Complete!");
    console.log(`📊 Total Trades: ${results.metrics.totalTrades}`);
    console.log(`🏆 Win Rate: ${results.metrics.winRate.toFixed(2)}%`);
    console.log(`💰 P&L: $${(balance - 10000).toFixed(2)}`);
    console.log(`📉 Max Drawdown: $${results.metrics.maxDrawdown.toFixed(2)}`);
    console.log(`📄 Results saved to: ${outputPath}`);
}
runBacktest().catch(console.error);
