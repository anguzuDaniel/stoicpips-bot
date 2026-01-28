"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DerivWebSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = __importDefault(require("events"));
class DerivWebSocket extends events_1.default {
    constructor(options) {
        super();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.heartbeatTimer = null;
        this.activeZones = [];
        this.lastSignalTime = 0;
        this.minSignalGap = 300000; // 5 minutes between signals
        this.isAuthorized = false;
        this.options = {
            reconnect: true,
            maxReconnectAttempts: 10,
            heartbeatInterval: 15000,
            ...options,
        };
        if (!options.apiToken)
            throw new Error("Deriv API token missing.");
        if (!options.appId)
            throw new Error("Deriv APP ID missing.");
    }
    connect() {
        const { appId } = this.options;
        this.ws = new ws_1.default(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);
        this.ws.on("open", () => {
            console.log("🔗 Connected to Deriv WebSocket");
            this.ws.send(JSON.stringify({
                authorize: this.options.apiToken,
            }));
            this.reconnectAttempts = 0;
            this.startHeartbeat();
        });
        this.ws.on("message", (msg) => {
            const data = JSON.parse(msg.toString());
            this.handleMessage(data);
        });
        this.ws.on("close", () => {
            console.log("⚠️ Connection closed.");
            this.isAuthorized = false;
            this.stopHeartbeat();
            if (this.options.reconnect)
                this.tryReconnect();
        });
        this.ws.on("error", (err) => {
            console.error("❌ WebSocket Error:", err);
            this.isAuthorized = false;
            if (this.options.reconnect)
                this.tryReconnect();
        });
    }
    tryReconnect() {
        const { maxReconnectAttempts } = this.options;
        if (this.reconnectAttempts >= maxReconnectAttempts) {
            console.error("❌ Max reconnect attempts reached. Stopping.");
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(5000 * this.reconnectAttempts, 20000);
        console.log(`🔄 Reconnecting in ${delay / 1000}s... (Attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (!this.ws || this.ws.readyState !== ws_1.default.OPEN)
                return;
            this.ws.ping();
        }, this.options.heartbeatInterval);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer)
            clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }
    handleMessage(data) {
        if (data.msg_type === "ping")
            return;
        if (data.msg_type === "authorize") {
            this.isAuthorized = true;
            console.log("✅ Authorized successfully");
        }
        // Emit event for external handling
        this.emit('message', data);
        // Process trading logic if authorized
        if (this.isAuthorized) {
            this.processTradingData(data);
        }
    }
    processTradingData(data) {
        // Handle candle data for analysis
        if (data.candles || (data.history && data.history.prices)) {
            const candles = data.candles || data.history.prices;
            this.analyzeCandles(candles, data.echo_req?.ticks_history || 'R_100');
        }
        // Handle tick data for real-time signals
        if (data.tick) {
            this.analyzeTick(data.tick);
        }
    }
    // ================== SUPPLY & DEMAND LOGIC ==================
    analyzeCandles(candles, symbol) {
        if (!candles || candles.length < 50)
            return;
        // Convert to standard format
        const standardCandles = candles.map((c) => ({
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close),
            epoch: c.epoch || c.time
        }));
        // Detect supply/demand zones
        this.detectZones(standardCandles, symbol, 60); // Default 60-second timeframe
    }
    detectZones(candles, symbol, timeframe) {
        const consolidationThreshold = 0.02; // 2% range
        const minConsolidationBars = 5;
        const impulseThreshold = 0.03; // 3% impulse
        for (let i = 0; i <= candles.length - minConsolidationBars; i++) {
            const consolidationBars = candles.slice(i, i + minConsolidationBars);
            if (this.isConsolidation(consolidationBars, consolidationThreshold)) {
                const baseHigh = Math.max(...consolidationBars.map(c => c.high));
                const baseLow = Math.min(...consolidationBars.map(c => c.low));
                // Check for next candle breakout
                if (i + minConsolidationBars < candles.length) {
                    const impulseCandle = candles[i + minConsolidationBars];
                    // Demand zone: price breaks below consolidation
                    if (impulseCandle.close < baseLow &&
                        (impulseCandle.close - impulseCandle.low) / impulseCandle.close > impulseThreshold) {
                        const zone = {
                            top: baseHigh,
                            bottom: baseLow,
                            type: 'demand',
                            strength: this.calculateZoneStrength(consolidationBars, impulseCandle),
                            symbol,
                            timeframe,
                            created: Date.now(),
                            touched: 0
                        };
                        this.addZone(zone);
                    }
                    // Supply zone: price breaks above consolidation
                    if (impulseCandle.close > baseHigh &&
                        (impulseCandle.high - impulseCandle.close) / impulseCandle.close > impulseThreshold) {
                        const zone = {
                            top: baseHigh,
                            bottom: baseLow,
                            type: 'supply',
                            strength: this.calculateZoneStrength(consolidationBars, impulseCandle),
                            symbol,
                            timeframe,
                            created: Date.now(),
                            touched: 0
                        };
                        this.addZone(zone);
                    }
                }
            }
        }
        // Clean up old zones
        this.cleanupZones();
    }
    isConsolidation(bars, threshold) {
        const highs = bars.map(b => b.high);
        const lows = bars.map(b => b.low);
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);
        const range = maxHigh - minLow;
        const avgPrice = bars.reduce((sum, b) => sum + b.close, 0) / bars.length;
        return (range / avgPrice) < threshold;
    }
    calculateZoneStrength(consolidationBars, impulseCandle) {
        let strength = 5;
        // Calculate impulse strength
        const impulseStrength = Math.abs(impulseCandle.close - impulseCandle.open) / impulseCandle.open;
        if (impulseStrength > 0.05)
            strength += 2;
        // Clean break (no wick crossing back)
        const baseHigh = Math.max(...consolidationBars.map(c => c.high));
        const baseLow = Math.min(...consolidationBars.map(c => c.low));
        if (impulseCandle.close < baseLow) {
            // Demand zone
            if (impulseCandle.low <= baseLow * 0.995)
                strength += 1;
        }
        else {
            // Supply zone
            if (impulseCandle.high >= baseHigh * 1.005)
                strength += 1;
        }
        return Math.min(strength, 10);
    }
    addZone(zone) {
        const existingIndex = this.activeZones.findIndex(z => Math.abs(z.top - zone.top) / zone.top < 0.01 &&
            Math.abs(z.bottom - zone.bottom) / zone.bottom < 0.01 &&
            z.symbol === zone.symbol &&
            z.type === zone.type);
        if (existingIndex >= 0) {
            // Update existing zone
            this.activeZones[existingIndex] = {
                ...this.activeZones[existingIndex],
                strength: Math.max(this.activeZones[existingIndex].strength, zone.strength),
                touched: this.activeZones[existingIndex].touched + 1
            };
        }
        else {
            // Add new zone
            this.activeZones.push(zone);
            console.log(`📍 New ${zone.type} zone detected: ${zone.symbol} [${zone.bottom.toFixed(5)} - ${zone.top.toFixed(5)}]`);
        }
    }
    cleanupZones() {
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.activeZones = this.activeZones.filter(z => z.created > twentyFourHoursAgo && z.touched < 3);
    }
    analyzeTick(tick) {
        const currentPrice = tick.quote;
        const symbol = tick.symbol;
        // Find active zone for this symbol
        const activeZone = this.activeZones.find(z => z.symbol === symbol &&
            currentPrice >= z.bottom &&
            currentPrice <= z.top);
        if (activeZone) {
            // Mark zone as touched
            activeZone.touched++;
            // Generate trading signal
            this.generateSignal(currentPrice, activeZone, symbol);
        }
    }
    generateSignal(currentPrice, zone, symbol) {
        const currentTime = Date.now();
        // Prevent too frequent signals
        if (currentTime - this.lastSignalTime < this.minSignalGap)
            return;
        // Simple RSI calculation (simplified for example)
        const rsi = this.calculateRSI(symbol); // You'd need to track price history
        let confidence = 0.5;
        confidence += (10 - zone.strength) * 0.05;
        const duration = this.calculateDuration(zone.timeframe);
        const baseAmount = 10; // Base trade amount
        if (zone.type === 'demand' && (rsi < 35 || !rsi)) {
            confidence += 0.3;
            this.lastSignalTime = currentTime;
            const signal = {
                action: 'BUY_CALL',
                symbol,
                contract_type: 'CALL',
                amount: baseAmount * confidence,
                duration: duration.value,
                duration_unit: duration.unit,
                confidence,
                zone,
                timestamp: currentTime
            };
            console.log(`📈 BUY_CALL Signal: ${symbol} at ${currentPrice} (RSI: ${rsi})`);
            this.emit('trading_signal', signal);
            this.executeTrade(signal);
        }
        else if (zone.type === 'supply' && (rsi > 65 || !rsi)) {
            confidence += 0.3;
            this.lastSignalTime = currentTime;
            const signal = {
                action: 'BUY_PUT',
                symbol,
                contract_type: 'PUT',
                amount: baseAmount * confidence,
                duration: duration.value,
                duration_unit: duration.unit,
                confidence,
                zone,
                timestamp: currentTime
            };
            console.log(`📉 BUY_PUT Signal: ${symbol} at ${currentPrice} (RSI: ${rsi})`);
            this.emit('trading_signal', signal);
            this.executeTrade(signal);
        }
    }
    calculateRSI(symbol) {
        // Implement RSI calculation based on recent prices
        // For now, return null (you should implement this properly)
        return null;
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
    async executeTrade(signal) {
        if (!this.isAuthorized) {
            console.error("❌ Not authorized to trade");
            return;
        }
        const contractParams = {
            proposal: 1,
            amount: signal.amount,
            basis: 'stake',
            contract_type: signal.contract_type,
            currency: 'USD',
            duration: signal.duration,
            duration_unit: signal.duration_unit,
            symbol: signal.symbol
        };
        try {
            // First get proposal
            this.send(contractParams);
            // The actual buy would happen in response to the proposal
            // You need to handle the proposal response and then send buy request
        }
        catch (error) {
            console.error("❌ Trade execution failed:", error);
        }
    }
    // ================== PUBLIC METHODS ==================
    send(data) {
        if (this.ws?.readyState === ws_1.default.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
        else {
            console.error("❌ Cannot send message. WebSocket is not open.");
        }
    }
    subscribeTicks(symbol) {
        this.send({
            ticks: symbol,
            subscribe: 1
        });
    }
    getCandles(symbol, timeframe = 60, count = 100) {
        this.send({
            ticks_history: symbol,
            adjust_start_time: 1,
            end: 'latest',
            start: 1,
            count,
            style: 'candles',
            granularity: timeframe
        });
    }
    getActiveSymbols() {
        this.send({
            active_symbols: 'brief',
            product_type: 'basic'
        });
    }
    getActiveZones() {
        return [...this.activeZones];
    }
    clearZones() {
        this.activeZones = [];
        console.log("🧹 All trading zones cleared");
    }
    updateSettings(settings) {
        if (settings.minSignalGap)
            this.minSignalGap = settings.minSignalGap;
        // Add more settings as needed
    }
    disconnect() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
        }
    }
    // Add this to your DerivWebSocket class
    async sendTestTrade() {
        if (!this.isAuthorized) {
            console.error("❌ Not authorized to trade");
            return;
        }
        // Create a simple test trade signal
        const testSignal = {
            action: 'BUY_CALL',
            symbol: 'R_100', // Volatility 100 Index
            contract_type: 'CALL',
            amount: 1, // $1 test amount
            duration: 5,
            duration_unit: 'm',
            confidence: 0.5,
            zone: {
                top: 0,
                bottom: 0,
                type: 'demand',
                strength: 0,
                symbol: 'R_100',
                timeframe: 60,
                created: Date.now(),
                touched: 0
            },
            timestamp: Date.now()
        };
        console.log('🚀 Sending test trade...');
        const contractParams = {
            proposal: 1,
            amount: testSignal.amount,
            basis: 'stake',
            contract_type: testSignal.contract_type,
            currency: 'USD',
            duration: testSignal.duration,
            duration_unit: testSignal.duration_unit,
            symbol: testSignal.symbol
        };
        try {
            // First get proposal
            this.send(contractParams);
            // Listen for proposal response
            const proposalHandler = (data) => {
                if (data.msg_type === 'proposal' && data.echo_req?.contract_type === 'CALL') {
                    console.log('📊 Proposal received:', data.proposal);
                    // Send buy request
                    this.send({
                        buy: data.proposal.id,
                        price: testSignal.amount
                    });
                    // Remove this listener
                    this.off('message', proposalHandler);
                }
            };
            this.on('message', proposalHandler);
            // Listen for buy response
            const buyHandler = (data) => {
                if (data.msg_type === 'buy') {
                    console.log('✅ Buy response:', data.buy);
                    console.log(`💰 Contract ID: ${data.buy?.contract_id}`);
                    console.log(`💰 Payout: $${data.buy?.payout}`);
                    console.log(`💰 Entry Tick: ${data.buy?.entry_tick}`);
                    this.off('message', buyHandler);
                }
            };
            this.on('message', buyHandler);
        }
        catch (error) {
            console.error("❌ Test trade failed:", error);
        }
    }
}
exports.DerivWebSocket = DerivWebSocket;
