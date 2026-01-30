import { DerivCandle, TradingSignal, SupplyDemandZone } from '../deriv/types';
import { ZoneDetector } from './ZoneDetector';
import { TechnicalIndicators } from '../utils/TechnicalIndicators';

export class HybridScalpStrategy {
    private zoneDetector: ZoneDetector;
    private lastSignalTime: number = 0;
    public minSignalGap: number = 60000; // 1 minute gap for scalping

    constructor() {
        this.zoneDetector = new ZoneDetector();
    }

    private getMarketDirection(ema20: number, ema50: number, rsi: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
        if (ema20 > ema50 && rsi > 50) return 'BULLISH';
        if (ema20 < ema50 && rsi < 50) return 'BEARISH';
        return 'NEUTRAL';
    }

    public analyze(candles: DerivCandle[], symbol: string, timeframe: number): TradingSignal | null {
        const now = Date.now();
        if (now - this.lastSignalTime < this.minSignalGap) return null;

        const prices = candles.map(c => c.close);
        const currentPrice = prices[prices.length - 1];

        // 1. Calculate Indicators
        const ema20Array = TechnicalIndicators.ema(prices, 20);
        const ema50Array = TechnicalIndicators.ema(prices, 50);
        const rsi = TechnicalIndicators.rsi(prices, 14); // Using 14 as per standard RSI, user prompt said "RSI > 50" but usually implies RSI 14. 
        // User prompt "RSI momentum" -> "RSI > 50"

        const bb = TechnicalIndicators.bollingerBands(prices, 20, 2);

        if (!bb || ema20Array.length === 0 || ema50Array.length === 0) return null;

        const ema20 = ema20Array[ema20Array.length - 1];
        const ema50 = ema50Array[ema50Array.length - 1];

        // 2. Volatility Filter (Sideways Squeeze)
        if (bb.bandwidth < 0.0015) {
            // console.log(`💤 [${symbol}] Squeeze Detected (BW: ${bb.bandwidth.toFixed(5)}). No Trade.`);
            return null;
        }

        // 3. Determine Market Direction
        const direction = this.getMarketDirection(ema20, ema50, rsi);

        if (direction === 'NEUTRAL') return null;

        // 4. Detect Zones (Confluence)
        const standardCandles = candles.map(c => ({
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: 0,
            timestamp: new Date(c.epoch * 1000),
            timeframe: timeframe.toString()
        }));

        const zones = this.zoneDetector.detectZones(standardCandles);
        const freshZones = zones.filter(z => z.touched === 0);
        const activeZone = freshZones.find(z => currentPrice >= z.bottom && currentPrice <= z.top);

        console.log(`🔎 [${symbol}] Dir: ${direction} | P: ${currentPrice} | EMA20: ${ema20.toFixed(2)} | RSI: ${rsi.toFixed(2)}`);

        // 5. Entry Triggers
        // Trigger 1: Zone Touch (Classic)
        // Trigger 2: Pullback to EMA 20 (Trend Following) -> Price close to EMA20 (within 0.05%?)

        const distToEma20 = Math.abs(currentPrice - ema20) / ema20;
        const isNearEma20 = distToEma20 < 0.0005; // 0.05% tolerance

        if (direction === 'BULLISH') {
            // Long Entry: Zone Support OR Pullback to EMA20
            if (activeZone?.type === 'demand' || (isNearEma20 && currentPrice > ema50)) {
                console.log(`✅ [${symbol}] BULLISH Trigger!`);
                this.lastSignalTime = now;
                return {
                    action: 'BUY_CALL',
                    symbol,
                    contract_type: 'CALL',
                    amount: 0,
                    duration: 1, // Scalp duration
                    duration_unit: 'm',
                    confidence: 0.85,
                    zone: activeZone as any,
                    timestamp: now
                };
            }
        } else if (direction === 'BEARISH') {
            // Short Entry: Zone Resistance OR Pullback to EMA20
            if (activeZone?.type === 'supply' || (isNearEma20 && currentPrice < ema50)) {
                console.log(`✅ [${symbol}] BEARISH Trigger!`);
                this.lastSignalTime = now;
                return {
                    action: 'BUY_PUT',
                    symbol,
                    contract_type: 'PUT',
                    amount: 0,
                    duration: 1, // Scalp duration
                    duration_unit: 'm',
                    confidence: 0.85,
                    zone: activeZone as any,
                    timestamp: now
                };
            }
        }

        return null;
    }

    public calculateExits(currentPrice: number, atr: number, action: 'BUY_CALL' | 'BUY_PUT') {
        // TP: 1.5x ATR, SL: 0.8x ATR
        if (action === 'BUY_CALL') {
            return {
                takeProfit: currentPrice + (1.5 * atr),
                stopLoss: currentPrice - (0.8 * atr)
            };
        } else {
            return {
                takeProfit: currentPrice - (1.5 * atr),
                stopLoss: currentPrice + (0.8 * atr)
            };
        }
    }
}
