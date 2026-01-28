"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DerivSupplyDemandStrategy = void 0;
const ZoneDetector_1 = require("./ZoneDetector");
class DerivSupplyDemandStrategy {
    constructor() {
        this.activeZones = [];
        this.lastSignalTime = 0;
        this.minSignalGap = 300000; // 5 minutes between signals
        this.zoneDetector = new ZoneDetector_1.ZoneDetector();
    }
    analyzeCandles(candles, symbol, timeframe) {
        const currentTime = Date.now();
        // Prevent too frequent signals
        if (currentTime - this.lastSignalTime < this.minSignalGap) {
            return {
                action: 'HOLD',
                symbol,
                contract_type: 'CALL',
                amount: 0,
                duration: 0,
                duration_unit: 'm',
                confidence: 0,
                zone: this.getEmptyZone(symbol, timeframe),
                timestamp: currentTime
            };
        }
        // Convert Deriv candles to standard format
        const standardCandles = candles.map(c => ({
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: 0,
            timestamp: new Date(c.epoch * 1000),
            timeframe: timeframe.toString()
        }));
        // Detect zones
        this.updateZones(standardCandles, symbol, timeframe);
        // Get current price
        const currentPrice = candles[candles.length - 1].close;
        // Find active zones
        const activeZone = this.findActiveZone(currentPrice, symbol);
        if (activeZone) {
            return this.evaluateZoneEntry(currentPrice, activeZone, standardCandles);
        }
        return {
            action: 'HOLD',
            symbol,
            contract_type: 'CALL',
            amount: 0,
            duration: 0,
            duration_unit: 'm',
            confidence: 0,
            zone: this.getEmptyZone(symbol, timeframe),
            timestamp: currentTime
        };
    }
    setMinSignalGap(ms) {
        this.minSignalGap = ms;
        console.log(`⏱️ Min signal gap updated to ${ms}ms (${ms / 60000} minutes)`);
    }
    updateZones(candles, symbol, timeframe) {
        const newZones = this.zoneDetector.detectZones(candles);
        // Convert to Deriv format and update
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
            // Check if similar zone exists
            const existingIndex = this.activeZones.findIndex(z => Math.abs(z.top - derivZone.top) / derivZone.top < 0.01 &&
                Math.abs(z.bottom - derivZone.bottom) / derivZone.bottom < 0.01 &&
                z.symbol === symbol &&
                z.type === derivZone.type);
            if (existingIndex >= 0) {
                // Update existing zone
                this.activeZones[existingIndex] = {
                    ...this.activeZones[existingIndex],
                    strength: Math.max(this.activeZones[existingIndex].strength, derivZone.strength),
                    touched: this.activeZones[existingIndex].touched + 1
                };
            }
            else {
                // Add new zone
                this.activeZones.push(derivZone);
            }
        });
        // Clean up old zones (keep for 24 hours max)
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.activeZones = this.activeZones.filter(z => z.created > twentyFourHoursAgo && z.touched < 3);
    }
    findActiveZone(currentPrice, symbol) {
        return this.activeZones.find(z => z.symbol === symbol &&
            currentPrice >= z.bottom &&
            currentPrice <= z.top) || null;
    }
    evaluateZoneEntry(currentPrice, zone, candles) {
        const rsi = this.calculateRSI(candles.map(c => c.close));
        const latestRSI = rsi[rsi.length - 1];
        let confidence = 0.5;
        confidence += (10 - zone.strength) * 0.05;
        // For Deriv, we need to decide on contract parameters
        const baseAmount = 10; // Base amount in USD
        const duration = this.calculateDuration(zone.timeframe);
        if (zone.type === 'demand') {
            // Buy CALL contract when price is in demand zone
            if (latestRSI < 35) {
                confidence += 0.3;
                this.lastSignalTime = Date.now();
                return {
                    action: 'BUY_CALL',
                    symbol: zone.symbol,
                    contract_type: 'CALL',
                    amount: baseAmount * confidence,
                    duration: duration.value,
                    duration_unit: duration.unit,
                    confidence,
                    zone,
                    timestamp: Date.now()
                };
            }
        }
        else {
            // Buy PUT contract when price is in supply zone
            if (latestRSI > 65) {
                confidence += 0.3;
                this.lastSignalTime = Date.now();
                return {
                    action: 'BUY_PUT',
                    symbol: zone.symbol,
                    contract_type: 'PUT',
                    amount: baseAmount * confidence,
                    duration: duration.value,
                    duration_unit: duration.unit,
                    confidence,
                    zone,
                    timestamp: Date.now()
                };
            }
        }
        return {
            action: 'HOLD',
            symbol: zone.symbol,
            contract_type: 'CALL',
            amount: 0,
            duration: 0,
            duration_unit: 'm',
            confidence: 0,
            zone,
            timestamp: Date.now()
        };
    }
    calculateRSI(prices, period = 14) {
        const rsi = [];
        for (let i = period; i < prices.length; i++) {
            const gains = [];
            const losses = [];
            for (let j = i - period + 1; j <= i; j++) {
                const change = prices[j] - prices[j - 1];
                if (change > 0) {
                    gains.push(change);
                    losses.push(0);
                }
                else {
                    gains.push(0);
                    losses.push(Math.abs(change));
                }
            }
            const avgGain = gains.reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
            const rs = avgGain / (avgLoss || 0.0001); // Avoid division by zero
            const rsiValue = 100 - (100 / (1 + rs));
            rsi.push(isNaN(rsiValue) ? 50 : rsiValue);
        }
        return rsi;
    }
    calculateDuration(timeframe) {
        // Determine contract duration based on timeframe
        if (timeframe <= 60) {
            return { value: 5, unit: 'm' }; // 5 minutes for 1-minute charts
        }
        else if (timeframe <= 300) {
            return { value: 15, unit: 'm' }; // 15 minutes for 5-minute charts
        }
        else if (timeframe <= 900) {
            return { value: 60, unit: 'm' }; // 1 hour for 15-minute charts
        }
        else {
            return { value: 120, unit: 'm' }; // 2 hours for higher timeframes
        }
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
    getActiveZones() {
        return [...this.activeZones];
    }
    clearZones() {
        this.activeZones = [];
    }
}
exports.DerivSupplyDemandStrategy = DerivSupplyDemandStrategy;
