import { ContractPreference } from "./ContactPreferences";

export interface BotConfig {
  id?: string;
  user_id?: string;
  symbols: string[];
  derivApiToken?: string; // Optional token
  deriv_api_token?: string; // DB column name (for mapping)
  amountPerTrade: number;
  timeframe?: number;
  candleCount?: number;
  cycleInterval?: number;
  contractPreference?: ContractPreference;
  maxTradesPerCycle?: number;   // new
  dailyTradeLimit?: number;     // new
}