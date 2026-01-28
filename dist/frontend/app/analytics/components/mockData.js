export const mockData = {
    overview: {
        totalTrades: 247,
        winRate: 68.2,
        totalProfit: 12450.75,
        averageWin: 245.30,
        averageLoss: -98.45,
        profitLossRatio: 2.49,
        sharpeRatio: 1.8,
        maxDrawdown: -12.3,
    },
    performance: [
        { date: 'Jan 1', profit: 450, trades: 8 },
        { date: 'Jan 2', profit: 320, trades: 6 },
        { date: 'Jan 3', profit: -120, trades: 5 },
        { date: 'Jan 4', profit: 680, trades: 9 },
        { date: 'Jan 5', profit: 540, trades: 7 },
        { date: 'Jan 6', profit: 290, trades: 6 },
        { date: 'Jan 7', profit: 610, trades: 8 },
    ],
    pairs: [
        { pair: 'EUR/USD', trades: 45, winRate: 71.1, profit: 2450 },
        { pair: 'GBP/USD', trades: 38, winRate: 65.8, profit: 1890 },
        { pair: 'USD/JPY', trades: 42, winRate: 69.0, profit: 2105 },
        { pair: 'AUD/USD', trades: 35, winRate: 62.9, profit: 1560 },
        { pair: 'USD/CAD', trades: 28, winRate: 75.0, profit: 1345 },
    ],
    recentTrades: [
        { id: 1, pair: 'EUR/USD', type: 'BUY', entry: 1.0850, exit: 1.0890, profit: 40, time: '10:30' },
        { id: 2, pair: 'GBP/USD', type: 'SELL', entry: 1.2700, exit: 1.2675, profit: 25, time: '11:15' },
        { id: 3, pair: 'USD/JPY', type: 'BUY', entry: 148.50, exit: 148.20, profit: -30, time: '12:45' },
        { id: 4, pair: 'AUD/USD', type: 'BUY', entry: 0.6580, exit: 0.6610, profit: 30, time: '14:20' },
    ]
};
//# sourceMappingURL=mockData.js.map