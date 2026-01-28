export interface DerivConfig {
  appId: number;
  endpoint: string;
  apiUrl: string;
}

export interface DerivTicker {
  ask: number;
  bid: number;
  epoch: number;
  id: string;
  pip_size: number;
  quote: number;
  symbol: string;
}

export interface DerivCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  epoch: number;
}

export interface ContractParameters {
  amount: number;
  barrier?: number;
  basis: string;
  contract_type: 'CALL' | 'PUT' | 'MULTUP' | 'MULTDOWN';
  currency: string;
  duration: number;
  duration_unit: 's' | 'm' | 'h' | 'd';
  symbol: string;
}

export interface TradeResult {
  buy: {
    balance_after: number;
    contract_id: string;
    entry_tick: number;
    payout: number;
    price: number;
  };
  contract_type: string;
  longcode: string;
  proposal_id?: string;
}
 
export interface SupplyDemandZone {
  top: number;
  bottom: number;
  type: 'demand' | 'supply';
  strength: number;
  symbol: string;
  timeframe: number;
  created: number;
  touched: number;
}

export interface DerivConnectionOptions {
  apiToken: string;
  appId: string;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface SupplyDemandZone {
  top: number;
  bottom: number;
  type: 'demand' | 'supply';
  strength: number;
  symbol: string;
  timeframe: number;
  created: number;
  touched: number;
}

export interface TradingSignal {
  action: 'BUY_CALL' | 'BUY_PUT' | 'HOLD';
  symbol: string;
  contract_type: 'CALL' | 'PUT';
  amount: number;
  duration: number;
  duration_unit: 's' | 'm' | 'h' | 'd';
  confidence: number;
  zone: SupplyDemandZone;
  timestamp: number;
}