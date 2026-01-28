const fetchLatestCandles = require('../../../strategies/fetchLatestCandles');

const fetchWithTimeout = (symbol: string, granularity: number, deriv: any, timeout = 5000) => {
  return Promise.race([
    fetchLatestCandles(symbol, granularity, deriv),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout fetching candles for ${symbol}`)), timeout)
    )
  ]);
};

export default fetchWithTimeout;