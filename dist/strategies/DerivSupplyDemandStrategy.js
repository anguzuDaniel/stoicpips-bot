"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DerivSupplyDemandStrategy = void 0;
const ZoneDetector_1 = require("./ZoneDetector");
class DerivSupplyDemandStrategy {
    constructor() {
        this.activeZones = [];
        this.lastSignalTime = 0;
        this.minSignalGap = 30000; // 30 seconds for testing (was 5 mins)
        this.zoneDetector = new ZoneDetector_1.ZoneDetector();
    }
    analyzeCandles(candles, symbol, timeframe) {
        const now = Date.now();
        // Prevent rapid-fire signals
        if (now - this.lastSignalTime < this.minSignalGap) {
            return this.HoldSignal(symbol, timeframe, `Cooldown active (${Math.round((this.minSignalGap - (now - this.lastSignalTime)) / 1000)}s remaining)`);
        }
        const standardCandles = candles.map(c => ({
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: 0,
            timestamp: new Date(c.epoch * 1000),
            timeframe: timeframe.toString()
        }));
        // Detect new zones
        this.updateZones(standardCandles, symbol, timeframe);
        const currentPrice = candles[candles.length - 1].close;
        const activeZone = this.findActiveZone(currentPrice, symbol);
        // If price is inside a zone → evaluate entry
        if (activeZone) {
            return this.evaluateZoneEntry(currentPrice, activeZone, standardCandles);
        }
        return this.HoldSignal(symbol, timeframe, 'Price not in any active supply/demand zone');
    }
    updateZones(candles, symbol, timeframe) {
        const newZones = this.zoneDetector.detectZones(candles);
        newZones.forEach(zone => {
            const derivZone = {
                top: zone.top,
                bottom: zone.bottom,
                type: zone.type,
                strength: zone.strength,
                symbol,
                timeframe,
                created: Date.now(),
                touched: 0
            };
            const existingIndex = this.activeZones.findIndex(z => Math.abs(z.top - derivZone.top) / derivZone.top < 0.01 &&
                Math.abs(z.bottom - derivZone.bottom) / derivZone.bottom < 0.01 &&
                z.symbol === symbol &&
                z.type === derivZone.type);
            if (existingIndex >= 0) {
                this.activeZones[existingIndex] = {
                    ...this.activeZones[existingIndex],
                    strength: Math.max(this.activeZones[existingIndex].strength, derivZone.strength),
                    touched: this.activeZones[existingIndex].touched + 1
                };
            }
            else {
                this.activeZones.push(derivZone);
            }
        });
        // Remove zones older than 24 hours or over-used
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        this.activeZones = this.activeZones.filter(z => z.created > cutoff && z.touched < 3);
    }
    findActiveZone(price, symbol) {
        return (this.activeZones.find(z => z.symbol === symbol &&
            price >= z.bottom &&
            price <= z.top) || null);
    }
    evaluateZoneEntry(currentPrice, zone, candles) {
        const rsi = this.calculateRSI(candles.map(c => c.close));
        const latestRSI = rsi[rsi.length - 1];
        let confidence = 0.5;
        confidence += (10 - zone.strength) * 0.05;
        const baseAmount = 5; // You can adjust
        const duration = this.calculateDuration(zone.timeframe);
        // Demand zone = expect price to RISE
        if (zone.type === 'demand') {
            if (latestRSI < 35) {
                this.lastSignalTime = Date.now();
                confidence += 0.3;
                return {
                    action: 'BUY_RISE',
                    symbol: zone.symbol,
                    contract_type: 'RISE',
                    amount: baseAmount * confidence,
                    duration: duration.value,
                    duration_unit: duration.unit,
                    confidence,
                    zone,
                    timestamp: Date.now()
                };
            }
            else {
                return this.HoldSignal(zone.symbol, zone.timeframe, `In Demand Zone but RSI too high (${latestRSI.toFixed(2)} >= 35)`);
            }
        }
        // Supply zone = expect price to FALL
        if (zone.type === 'supply') {
            if (latestRSI > 65) {
                this.lastSignalTime = Date.now();
                confidence += 0.3;
                return {
                    action: 'BUY_FALL',
                    symbol: zone.symbol,
                    contract_type: 'FALL',
                    amount: baseAmount * confidence,
                    duration: duration.value,
                    duration_unit: duration.unit,
                    confidence,
                    zone,
                    timestamp: Date.now()
                };
            }
            else {
                return this.HoldSignal(zone.symbol, zone.timeframe, `In Supply Zone but RSI too low (${latestRSI.toFixed(2)} <= 65)`);
            }
        }
        return this.HoldSignal(zone.symbol, zone.timeframe, 'In zone but conditions not met');
    }
    calculateRSI(prices, period = 14) {
        const rsi = [];
        for (let i = period; i < prices.length; i++) {
            const gains = [];
            const losses = [];
            for (let j = i - period + 1; j <= i; j++) {
                const diff = prices[j] - prices[j - 1];
                gains.push(diff > 0 ? diff : 0);
                losses.push(diff < 0 ? Math.abs(diff) : 0);
            }
            const avgGain = gains.reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
            const rs = avgGain / (avgLoss || 0.0001);
            const rsiValue = 100 - 100 / (1 + rs);
            rsi.push(isNaN(rsiValue) ? 50 : rsiValue);
        }
        return rsi;
    }
    calculateDuration(timeframe) {
        if (timeframe <= 60)
            return { value: 5, unit: 'm' };
        if (timeframe <= 300)
            return { value: 15, unit: 'm' };
        if (timeframe <= 900)
            return { value: 60, unit: 'm' };
        return { value: 120, unit: 'm' };
    }
    HoldSignal(symbol, timeframe, reason = '') {
        return {
            action: 'HOLD',
            symbol,
            contract_type: 'RISE', // Neutral, ignored
            amount: 0,
            duration: 0,
            duration_unit: 'm',
            confidence: 0,
            zone: this.getEmptyZone(symbol, timeframe),
            timestamp: Date.now(),
            reason
        };
    }
    getEmptyZone(symbol, timeframe) {
        return {
            top: 0,
            bottom: 0,
            type: 'demand',
            strength: 0,
            symbol,
            timeframe,
            created: Date.now(),
            touched: 0
        };
    }
    setMinSignalGap(ms) {
        this.minSignalGap = ms;
        console.log(`⏱️ Test strategy: Min signal gap updated to ${ms}ms`);
    }
}
exports.DerivSupplyDemandStrategy = DerivSupplyDemandStrategy;
