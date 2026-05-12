// ============================================================
// TYPES XAU/USD 24/7 Analyzer
// ============================================================

export type SignalType = 'bullish' | 'bearish' | 'neutral';

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingSetup {
  id: string;
  type: string;
  direction: SignalType;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  confidence: number;
  description: string;
  indicators: string[];
  timestamp: number;
}

export interface AnalysisReport {
  id: string;
  timestamp: number;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  trend: SignalType;
  trendStrength: number;
  setups: TradingSetup[];
  indicators: {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    bollingerBands: { upper: number; middle: number; lower: number };
    ema20: number;
    ema50: number;
    ema200: number;
    atr: number;
    stochastic: { k: number; d: number };
    cci: number;
    williamsR: number;
    volumeSMA: number;
  };
  keyLevels: { support: number[]; resistance: number[] };
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  next24hForecast: string;
  orderBlocks: any[];
  fvgs: any[];
  liquidityPools: any[];
  marketStructure: { structure: string; signals: any[] };
  keyLevelsDetailed: any[];
}

export interface PriceQuote {
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  source: string;
  isReal: boolean;
  timestamp: number;
  isUp: boolean;
}

export interface MacroScore {
  totalScore: number;
  goldBias: 'buy' | 'sell' | 'neutral';
  dxy: number;
  fed: number;
  cpi: number;
  nfp: number;
  geo: number;
  yield10y: number;
}

export interface SessionInfo {
  session: 'London' | 'NewYork' | 'Asia' | 'Overlap' | 'Closed' | 'Weekend';
  sessionName: string;
  liquidity: 'High' | 'Medium' | 'Low';
  isHighLiquidity: boolean;
  moroccoTime: string;
}
