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
  config: any;
}>();

module.exports = botStates;