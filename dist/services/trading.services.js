"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingService = void 0;
const DerivWebSocket_1 = require("../deriv/DerivWebSocket");
const DerivSupplyDemandStrategy_1 = require("../strategies/DerivSupplyDemandStrategy");
class TradingService {
    constructor(apiToken, appId = '1089') {
        this.activeSymbols = [];
        this.isRunning = false;
        this.pendingRequests = new Map();
        this.requestId = 1;
        this.derivWS = new DerivWebSocket_1.DerivWebSocket({
            apiToken,
            appId,
            reconnect: true,
            maxReconnectAttempts: 10,
            heartbeatInterval: 15000
        });
        this.strategy = new DerivSupplyDemandStrategy_1.DerivSupplyDemandStrategy();
        // Set up event listeners
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.derivWS.on('message', (data) => {
            this.handleDerivMessage(data);
        });
        this.derivWS.on('trading_signal', (signal) => {
            this.handleTradingSignal(signal);
        });
    }
    async initialize() {
        this.derivWS.connect();
        await new Promise((resolve) => {
            const authHandler = (data) => {
                if (data.msg_type === 'authorize') {
                    console.log('✅ Authorized successfully');
                    this.derivWS.off('message', authHandler);
                    resolve();
                }
            };
            this.derivWS.on('message', authHandler);
            setTimeout(() => {
                this.derivWS.off('message', authHandler);
                resolve();
            }, 10000);
        });
        await this.loadActiveSymbols();
        console.log(`📊 Loaded ${this.activeSymbols.length} trading symbols`);
    }
    async loadActiveSymbols() {
        return new Promise((resolve, reject) => {
            const requestId = this.requestId++;
            this.pendingRequests.set(requestId, {
                resolve: (data) => {
                    if (data.active_symbols) {
                        this.activeSymbols = data.active_symbols
                            .filter((s) => s.exchange_is_open === 1)
                            .map((s) => s.symbol)
                            .slice(0, 10);
                        resolve();
                    }
                    else {
                        reject(new Error('No symbols returned'));
                    }
                },
                reject
            });
            this.derivWS.send({
                active_symbols: 'brief',
                product_type: 'basic',
                req_id: requestId
            });
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Timeout loading symbols'));
                }
            }, 5000);
        });
    }
    handleDerivMessage(data) {
        if (data.req_id) {
            const pending = this.pendingRequests.get(data.req_id);
            if (pending) {
                this.pendingRequests.delete(data.req_id);
                if (data.error) {
                    pending.reject(new Error(data.error.message));
                }
                else {
                    pending.resolve(data);
                }
            }
        }
        if (data.proposal) {
            console.log(`📊 Proposal received for ${data.echo_req?.symbol}: ${data.proposal.display_value}`);
        }
        if (data.buy) {
            console.log(`✅ Trade executed: ${data.buy.contract_id} - Payout: $${data.buy.payout}`);
        }
    }
    async analyzeAndTrade(symbol, timeframe = 60) {
        try {
            const candles = await this.getCandles(symbol, timeframe, 100);
            if (candles.length < 50) {
                console.warn(`Insufficient data for ${symbol}`);
                return null;
            }
            const signal = this.strategy.analyzeCandles(candles, symbol, timeframe);
            if (signal.action !== 'HOLD') {
                console.log(`🎯 Signal generated: ${signal.action} for ${symbol}`);
                await this.executeTrade(signal);
                return signal;
            }
            return null;
        }
        catch (error) {
            console.error(`Error analyzing ${symbol}:`, error);
            return null;
        }
    }
    async getCandles(symbol, timeframe, count) {
        return new Promise((resolve, reject) => {
            const requestId = this.requestId++;
            this.pendingRequests.set(requestId, {
                resolve: (data) => {
                    if (data.candles || data.history?.prices) {
                        const candles = data.candles || data.history.prices;
                        resolve(candles.map((c) => ({
                            open: parseFloat(c.open),
                            high: parseFloat(c.high),
                            low: parseFloat(c.low),
                            close: parseFloat(c.close),
                            epoch: c.epoch || c.time
                        })));
                    }
                    else {
                        reject(new Error('No candle data returned'));
                    }
                },
                reject
            });
            this.derivWS.send({
                ticks_history: symbol,
                adjust_start_time: 1,
                end: 'latest',
                start: 1,
                count,
                style: 'candles',
                granularity: timeframe,
                req_id: requestId
            });
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Timeout loading candles'));
                }
            }, 5000);
        });
    }
    async executeTrade(signal) {
        try {
            const proposal = await this.getProposal(signal);
            if (proposal) {
                console.log(`📈 Proposal: ${proposal.display_value} - Payout: ${proposal.payout}`);
                await this.buyContract(signal, proposal.proposal_id);
            }
        }
        catch (error) {
            console.error('Error executing trade:', error);
        }
    }
    async getProposal(signal) {
        return new Promise((resolve, reject) => {
            const requestId = this.requestId++;
            const params = {
                amount: signal.amount,
                basis: 'stake',
                contract_type: signal.contract_type,
                currency: 'USD',
                duration: signal.duration,
                duration_unit: signal.duration_unit,
                symbol: signal.symbol
            };
            this.pendingRequests.set(requestId, {
                resolve: (data) => {
                    if (data.proposal) {
                        resolve(data.proposal);
                    }
                    else {
                        reject(new Error('No proposal returned'));
                    }
                },
                reject
            });
            this.derivWS.send({
                proposal: 1,
                ...params,
                req_id: requestId
            });
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Timeout getting proposal'));
                }
            }, 5000);
        });
    }
    async buyContract(signal, proposalId) {
        return new Promise((resolve, reject) => {
            const requestId = this.requestId++;
            const params = {
                amount: signal.amount,
                basis: 'stake',
                contract_type: signal.contract_type,
                currency: 'USD',
                duration: signal.duration,
                duration_unit: signal.duration_unit,
                symbol: signal.symbol
            };
            this.pendingRequests.set(requestId, {
                resolve: (data) => {
                    if (data.buy) {
                        console.log(`✅ Contract purchased: ${data.buy.contract_id}`);
                        resolve();
                    }
                    else {
                        reject(new Error('Buy request failed'));
                    }
                },
                reject
            });
            this.derivWS.send({
                buy: proposalId || '1',
                price: signal.amount,
                parameters: params,
                req_id: requestId
            });
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Timeout buying contract'));
                }
            }, 5000);
        });
    }
    handleTradingSignal(signal) {
        console.log(`🚀 Trading signal received: ${signal.action} ${signal.symbol}`);
        if (this.isRunning) {
            this.executeTrade(signal).catch(console.error);
        }
    }
    startMonitoring(interval = 60000) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log(`🚀 Starting monitoring (interval: ${interval}ms)`);
        this.activeSymbols.forEach(symbol => {
            this.derivWS.subscribeTicks(symbol);
            console.log(`👂 Listening to real-time ticks for ${symbol}`);
        });
        const analysisInterval = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(analysisInterval);
                return;
            }
            this.activeSymbols.forEach(async (symbol) => {
                try {
                    await this.analyzeAndTrade(symbol);
                    await this.delay(1000); // Rate limiting
                }
                catch (error) {
                    console.error(`Error analyzing ${symbol}:`, error);
                }
            });
        }, interval);
    }
    stopMonitoring() {
        this.isRunning = false;
        console.log('🛑 Monitoring stopped');
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getStrategy() {
        return this.strategy;
    }
    getActiveSymbols() {
        return [...this.activeSymbols];
    }
    getActiveZones() {
        return this.strategy.getActiveZones();
    }
    disconnect() {
        this.derivWS.disconnect();
        this.isRunning = false;
    }
    // Method to manually trigger analysis
    async analyzeSymbol(symbol, timeframe) {
        return this.analyzeAndTrade(symbol, timeframe);
    }
}
exports.TradingService = TradingService;
