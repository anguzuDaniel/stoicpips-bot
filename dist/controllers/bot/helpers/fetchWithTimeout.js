"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fetchLatestCandles = require('../../../strategies/fetchLatestCandles');
const fetchWithTimeout = (symbol, granularity, deriv, timeout = 5000) => {
    return Promise.race([
        fetchLatestCandles(symbol, granularity, deriv),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout fetching candles for ${symbol}`)), timeout))
    ]);
};
exports.default = fetchWithTimeout;
