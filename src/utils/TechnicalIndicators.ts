/**
 * Technical Indicators for Dunam Ai
 */

export class TechnicalIndicators {
    /**
     * Calculates RSI (Relative Strength Index)
     */
    static rsi(prices: number[], period: number = 7): number {
        if (prices.length <= period) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const diff = prices[prices.length - i] - prices[prices.length - i - 1];
            if (diff > 0) gains += diff;
            else losses += Math.abs(diff);
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculates ATR (Average True Range)
     */
    static atr(candles: { high: number, low: number, close: number }[], period: number = 14): number {
        if (candles.length <= period) return 0;

        const trs: number[] = [];
        for (let i = 1; i < candles.length; i++) {
            const h = candles[i].high;
            const l = candles[i].low;
            const pc = candles[i - 1].close;

            const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
            trs.push(tr);
        }

        // Return simple moving average of TR
        const recentTRs = trs.slice(-period);
        return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
    }

    /**
     * Calculates VWAP (Volume Weighted Average Price)
     */
    static vwap(candles: { high: number, low: number, close: number, volume: number }[]): number {
        let totalVP = 0;
        let totalVolume = 0;

        // Typically VWAP is calculated for the current session, but for crypto/synthetic,
        // we use a rolling window or the provided candle set.
        for (const candle of candles) {
            const typicalPrice = (candle.high + candle.low + candle.close) / 3;
            totalVP += typicalPrice * (candle.volume || 1);
            totalVolume += (candle.volume || 1);
        }

        return totalVolume === 0 ? 0 : totalVP / totalVolume;
    }
    /**
     * Calculates EMA (Exponential Moving Average)
     */
    static ema(prices: number[], period: number): number[] {
        if (prices.length === 0) return [];

        const k = 2 / (period + 1);
        const emaArray = [prices[0]];

        for (let i = 1; i < prices.length; i++) {
            const ema = prices[i] * k + emaArray[i - 1] * (1 - k);
            emaArray.push(ema);
        }

        return emaArray;
    }

    /**
     * Calculates Bollinger Bands
     */
    static bollingerBands(prices: number[], period: number = 20, stdDevMultiplier: number = 2) {
        if (prices.length < period) return null;

        // Simple Moving Average (Middle Band)
        const sma = prices.slice(-period).reduce((a, b) => a + b, 0) / period;

        // Standard Deviation
        const squaredDiffs = prices.slice(-period).map(p => Math.pow(p - sma, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
        const stdDev = Math.sqrt(variance);

        const upper = sma + (stdDev * stdDevMultiplier);
        const lower = sma - (stdDev * stdDevMultiplier);

        // Bandwidth: (Upper - Lower) / Middle
        const bandwidth = (upper - lower) / sma;

        return { upper, middle: sma, lower, bandwidth };
    }

    /**
     * Calculates ADX (Average Directional Index)
     */
    static adx(candles: { high: number, low: number, close: number }[], period: number = 14): number {
        if (candles.length < period * 2) return 0; // Need history for smoothing

        const trs: number[] = [];
        const plusDMs: number[] = [];
        const minusDMs: number[] = [];

        // 1. Calculate TR, +DM, -DM
        for (let i = 1; i < candles.length; i++) {
            const h = candles[i].high;
            const l = candles[i].low;
            const ph = candles[i - 1].high;
            const pl = candles[i - 1].low;
            const pc = candles[i - 1].close;

            const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
            trs.push(tr);

            const upMove = h - ph;
            const downMove = pl - l;

            if (upMove > downMove && upMove > 0) {
                plusDMs.push(upMove);
            } else {
                plusDMs.push(0);
            }

            if (downMove > upMove && downMove > 0) {
                minusDMs.push(downMove);
            } else {
                minusDMs.push(0);
            }
        }

        // 2. Smooth TR, +DM, -DM (Wilder's Smoothing)
        // First value is simple sum
        let smoothTR = trs.slice(0, period).reduce((a, b) => a + b, 0);
        let smoothPlusDM = plusDMs.slice(0, period).reduce((a, b) => a + b, 0);
        let smoothMinusDM = minusDMs.slice(0, period).reduce((a, b) => a + b, 0);

        // Loop for the rest
        const dxList: number[] = [];

        for (let i = period; i < trs.length; i++) {
            smoothTR = smoothTR - (smoothTR / period) + trs[i];
            smoothPlusDM = smoothPlusDM - (smoothPlusDM / period) + plusDMs[i];
            smoothMinusDM = smoothMinusDM - (smoothMinusDM / period) + minusDMs[i];

            const plusDI = 100 * (smoothPlusDM / smoothTR);
            const minusDI = 100 * (smoothMinusDM / smoothTR);

            const dx = 100 * Math.abs((plusDI - minusDI) / (plusDI + minusDI));
            dxList.push(dx);
        }

        // 3. ADX is SMA of DX
        if (dxList.length < period) return dxList[dxList.length - 1]; // Fallback

        const adx = dxList.slice(-period).reduce((a, b) => a + b, 0) / period;
        return adx;
    }
}
