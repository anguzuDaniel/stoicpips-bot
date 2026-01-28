const { deriv } = require('../config/deriv');
async function getCandlesFromDeriv(symbol, timeframe, count) {
    return new Promise((resolve, reject) => {
        const requestId = Date.now();
        // Set up one-time listener
        const handler = (data) => {
            if (data.req_id === requestId) {
                deriv.off('message', handler);
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
            }
        };
        deriv.on('message', handler);
        // Send request
        deriv.send({
            ticks_history: symbol,
            adjust_start_time: 1,
            end: 'latest',
            start: 1,
            count,
            style: 'candles',
            granularity: timeframe,
            req_id: requestId
        });
        // Timeout after 5 seconds
        setTimeout(() => {
            deriv.off('message', handler);
            reject(new Error('Timeout loading candles'));
        }, 5000);
    });
}
module.exports = { getCandlesFromDeriv };
