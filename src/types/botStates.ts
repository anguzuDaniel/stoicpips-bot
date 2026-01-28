import { DerivSupplyDemandStrategy } from "../strategies/DerivSupplyDemandStrategy";

const botStates = new Map<string, {
  isRunning: boolean;
  startedAt: Date | null;
  tradingInterval: NodeJS.Timeout | null;
  currentTrades: any[];
  totalProfit: number;
  tradesExecuted: number;
  strategy: DerivSupplyDemandStrategy;
  derivConnected: boolean;
  deriv?: any; // Store the DerivWebSocket instance
  dailyTrades?: number;
  lastTradeDate?: string;
  config: any;
}>();

module.exports = botStates;