const fetchLatestCandles = async (symbol: string, timeframe: number, deriv: any) => {
  if (!deriv) {
    throw new Error("Deriv connection not provided for fetching candles");
  }

  return new Promise<any[]>((resolve, reject) => {
    const requestId = Date.now();

    const handler = (msg: any) => {
      if (msg.req_id === requestId) {
        deriv.off('message', handler);

        if (msg.error) return reject(msg.error);
        if (msg.candles) {
          resolve(msg.candles.map((c: any) => ({
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            epoch: c.epoch
          })));
        } else {
          resolve([]);
        }
      }
    };

    deriv.on('message', handler);

    deriv.send({
      ticks_history: symbol,
      granularity: timeframe,
      count: 100,
      end: 'latest',
      style: 'candles',
      req_id: requestId
    });

    setTimeout(() => {
      deriv.off('message', handler);
      reject(new Error('Timeout fetching candles'));
    }, 15000);
  });
};

export default fetchLatestCandles;