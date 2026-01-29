import { DerivSupplyDemandStrategy } from "../strategies/DerivSupplyDemandStrategy";

const botStates = new Map<string, {
  isRunning: boolean;
  startedAt: Date | null;
  tradingInterval: NodeJS.Timeout | null;
  currentTrades: any[];
  totalProfit: number;
  tradesExecuted: number;
  strategy?: any; // Strategy instance
  derivConnected: boolean;
  derivWS?: any; // Store the DerivWebSocket instance
  dailyTrades?: number;
  lastTradeDate?: string;
  lastSyncTime?: number;
  analyticsCache?: {
    data: any;
    timestamp: number;
  };
  config: any;
}>();

module.exports = botStates;