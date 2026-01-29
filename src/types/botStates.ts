export const botStates = new Map<string, {
  isRunning: boolean;
  startedAt: Date | null;
  tradingInterval: NodeJS.Timeout | null;
  currentTrades: any[];
  totalProfit: number;
  tradesExecuted: number;
  strategy?: any; // Strategy instance
  sentinel?: any; // Sentinel execution layer
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
  executionMode?: string;
  subscriptionTier?: string;
  hasTakenFirstTrade?: boolean;
  globalPause?: boolean;
  pauseReason?: string;
  pausedAt?: string;
  pausedBy?: string;
  resumedAt?: string;
  resumedBy?: string;
}>();
// Added to handle global flags that are not per-user
(botStates as any).globalPause = false;
(botStates as any).pauseReason = null;
(botStates as any).pausedAt = null;
(botStates as any).pausedBy = null;
(botStates as any).resumedAt = null;
(botStates as any).resumedBy = null;