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
  derivRealToken?: string;
  derivDemoToken?: string;
  openaiApiKey?: string;
  aiProvider?: 'local' | 'openai';

  // DB column mapping
  deriv_real_token?: string;
  deriv_demo_token?: string;
  openai_api_key?: string;
  ai_provider?: 'local' | 'openai';


  maxTradesPerCycle?: number;
  dailyTradeLimit?: number;
}