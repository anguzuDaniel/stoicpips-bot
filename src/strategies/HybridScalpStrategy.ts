import { DerivCandle, TradingSignal, SupplyDemandZone } from '../deriv/types';
import { ZoneDetector } from './ZoneDetector';
import { TechnicalIndicators } from '../utils/TechnicalIndicators';

export class HybridScalpStrategy {
    private zoneDetector: ZoneDetector;
    private lastSignalTime: number = 0;
    private minSignalGap: number = 60000; // 1 minute gap for scalping

    constructor() {
        this.zoneDetector = new ZoneDetector();
    }

    public analyze(candles: DerivCandle[], symbol: string, timeframe: number): TradingSignal | null {
        const now = Date.now();
        if (now - this.lastSignalTime < this.minSignalGap) return null;

        // Convert DerivCandles to standard format for ZoneDetector
        const standardCandles = candles.map(c => ({
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: 0, // Deriv candles might not have volume, but ZoneDetector uses it
            timestamp: new Date(c.epoch * 1000),
            timeframe: timeframe.toString()
        }));

        const zones = this.zoneDetector.detectZones(standardCandles);
        const freshZones = zones.filter(z => z.touched === 0);

        if (freshZones.length === 0) return null;

        const currentPrice = candles[candles.length - 1].close;
        const activeZone = freshZones.find(z => currentPrice >= z.bottom && currentPrice <= z.top);

        if (!activeZone) return null;

        // Indicators
        const prices = candles.map(c => c.close);
        const rsi = TechnicalIndicators.rsi(prices, 7);
        const vwap = TechnicalIndicators.vwap(candles as any); // Assuming input has enough fields or handled by utility
        const atr = TechnicalIndicators.atr(candles as any, 14);

        // Entry Rules:
        // Buy: Price touches 'Fresh' Demand Zone AND RSI(7) < 25 AND Price > VWAP.
        // Sell: Price touches 'Fresh' Supply Zone AND RSI(7) > 75 AND Price < VWAP.

        if (activeZone.type === 'demand' && rsi < 25 && currentPrice > vwap) {
            this.lastSignalTime = now;
            return {
                action: 'BUY_CALL',
                symbol,
                contract_type: 'CALL',
                amount: 0, // To be set by execution layer
                duration: 1,
                duration_unit: 'm',
                confidence: 0.8, // Base confidence
                zone: activeZone as any,
                timestamp: now
            };
        }

        if (activeZone.type === 'supply' && rsi > 75 && currentPrice < vwap) {
            this.lastSignalTime = now;
            return {
                action: 'BUY_PUT',
                symbol,
                contract_type: 'PUT',
                amount: 0, // To be set by execution layer
                duration: 1,
                duration_unit: 'm',
                confidence: 0.8, // Base confidence
                zone: activeZone as any,
                timestamp: now
            };
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
