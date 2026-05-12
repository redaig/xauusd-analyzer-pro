// ============================================================
// ANALYSE TECHNIQUE COMPLETE
// SMA, EMA, RSI, MACD, Bollinger, ATR, Stochastic, CCI
// + Squeeze Momentum (LazyBear)
// + SMC/ICT (Order Blocks, FVG, BOS, Liquidity)
// ============================================================

import type { PriceData, SignalType } from '@/types';

function sma(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const sum = data.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function ema(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const k = 2 / (period + 1);
  let result = sma(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) {
    result = data[i] * k + result * (1 - k);
  }
  return result;
}

function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change; else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function macd(closes: number[]) {
  // MACD Line = EMA12 - EMA26
  // Signal Line = EMA9 of MACD Line
  // Histogram = MACD - Signal
  const macdLine: number[] = [];
  for (let i = 26; i < closes.length; i++) {
    const e12 = ema(closes.slice(0, i + 1), 12);
    const e26 = ema(closes.slice(0, i + 1), 26);
    macdLine.push(e12 - e26);
  }
  if (macdLine.length < 9) {
    const e12 = ema(closes, 12);
    const e26 = ema(closes, 26);
    return { macd: e12 - e26, signal: 0, histogram: e12 - e26 };
  }
  const currentMACD = macdLine[macdLine.length - 1];
  const signalLine = ema(macdLine, 9);
  return { macd: currentMACD, signal: signalLine, histogram: currentMACD - signalLine };
}

function bollinger(closes: number[], period = 20, mult = 2) {
  const mid = sma(closes, period);
  const slice = closes.slice(-period);
  const std = Math.sqrt(slice.reduce((s, v) => s + (v - mid) ** 2, 0) / period);
  return { upper: mid + mult * std, middle: mid, lower: mid - mult * std };
}

function atr(data: PriceData[], period = 14): number {
  if (data.length < period) return 5;
  const trs = data.slice(-period).map((d, i) => {
    if (i === 0) return d.high - d.low;
    const prevClose = data[data.length - period + i - 1]?.close || d.close;
    return Math.max(d.high - d.low, Math.abs(d.high - prevClose), Math.abs(d.low - prevClose));
  });
  return trs.reduce((a, b) => a + b, 0) / period;
}

function stochastic(highs: number[], lows: number[], closes: number[], k = 14, _d = 3) {
  const lowest = Math.min(...lows.slice(-k));
  const highest = Math.max(...highs.slice(-k));
  const kVal = highest !== lowest ? ((closes[closes.length - 1] - lowest) / (highest - lowest)) * 100 : 50;
  return { k: kVal, d: kVal };
}

// Squeeze Momentum (LazyBear)
function squeezeMomentum(data: PriceData[]) {
  const length = 20;
  const mult = 2.0;
  const lengthKC = 20;
  const multKC = 1.5;

  const closes = data.map(d => d.close);
  const basis = sma(closes, length);
  const dev = mult * Math.sqrt(closes.slice(-length).reduce((s, v) => s + (v - basis) ** 2, 0) / length);
  const upperBB = basis + dev;
  const lowerBB = basis - dev;

  const ma = sma(closes, lengthKC);
  const range = data.slice(-lengthKC).map(d => d.high - d.low);
  const rangema = sma(range, lengthKC);
  const upperKC = ma + rangema * multKC;
  const lowerKC = ma - rangema * multKC;

  const sqzOn = lowerBB > lowerKC && upperBB < upperKC;
  const sqzOff = lowerBB < lowerKC && upperBB > upperKC;
  const noSqz = !sqzOn && !sqzOff;

  // Momentum
  const highestHigh = Math.max(...data.slice(-lengthKC).map(d => d.high));
  const lowestLow = Math.min(...data.slice(-lengthKC).map(d => d.low));
  const avg = (highestHigh + lowestLow) / 2;
  const momentum = data[data.length - 1].close - avg;

  return {
    sqzOn, sqzOff, noSqz,
    momentum: Math.round(momentum * 100) / 100,
    val: Math.round(momentum * 100) / 100,
    signal: sqzOff ? 'RELEASE' : sqzOn ? 'SQUEEZE' : 'NO SIGNAL',
    color: momentum > 0 ? (momentum > (data.length > 1 ? data[data.length - 2].close - avg : 0) ? '#00e676' : '#2962FF') : (momentum < (data.length > 1 ? data[data.length - 2].close - avg : 0) ? '#ff5252' : '#ff9100')
  };
}

// SMC/ICT Analysis
function analyzeSMC(data: PriceData[]) {
  const closes = data.map(d => d.close);
  const orderBlocks: any[] = [];
  const fvgs: any[] = [];
  const liquidityPools: any[] = [];
  const structureSignals: any[] = [];

  // Order Blocks (3 dernières bougies avec fort rejet)
  for (let i = data.length - 5; i < data.length - 2; i++) {
    const candle = data[i];
    const body = Math.abs(candle.close - candle.open);
    const wick = candle.high - candle.low - body;
    if (wick > body * 1.5) {
      orderBlocks.push({
        price: Math.round(candle.low * 100) / 100,
        type: candle.close > candle.open ? 'bullish' : 'bearish',
        strength: Math.round((wick / body) * 10),
      });
    }
  }

  // FVG (Fair Value Gaps)
  for (let i = 2; i < data.length; i++) {
    const c1 = data[i - 2], c3 = data[i];
    if (c1.high < c3.low) {
      fvgs.push({ high: c3.low, low: c1.high, type: 'bullish' });
    }
    if (c1.low > c3.high) {
      fvgs.push({ high: c1.low, low: c3.high, type: 'bearish' });
    }
  }

  // BOS/CHoCH detection
  const last20 = closes.slice(-20);
  let highest = Math.max(...last20.slice(0, 10));
  let lowest = Math.min(...last20.slice(0, 10));

  for (let i = 10; i < last20.length; i++) {
    if (last20[i] > highest) {
      structureSignals.push({ type: 'BOS', direction: 'bullish', price: last20[i] });
      highest = last20[i];
    }
    if (last20[i] < lowest) {
      structureSignals.push({ type: 'BOS', direction: 'bearish', price: last20[i] });
      lowest = last20[i];
    }
  }

  // Liquidity pools (swing highs/lows)
  for (let i = 3; i < last20.length - 3; i++) {
    const slice = last20.slice(i - 3, i + 3);
    if (last20[i] === Math.max(...slice)) {
      liquidityPools.push({ price: last20[i], type: 'high' });
    }
    if (last20[i] === Math.min(...slice)) {
      liquidityPools.push({ price: last20[i], type: 'low' });
    }
  }

  return { orderBlocks, fvgs, liquidityPools, structureSignals };
}

// Trend detection
function detectTrend(closes: number[]): SignalType {
  const ema20v = ema(closes, 20);
  const ema50v = ema(closes, 50);
  const ema200v = ema(closes, 200);

  if (ema20v > ema50v && ema50v > ema200v) return 'bullish';
  if (ema20v < ema50v && ema50v < ema200v) return 'bearish';
  return 'neutral';
}

// Key levels
function findKeyLevels(data: PriceData[]) {
  const closes = data.map(d => d.close);
  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];

  for (let i = 5; i < closes.length - 5; i++) {
    const slice5 = closes.slice(i - 5, i + 5);
    if (closes[i] === Math.max(...slice5)) pivotHighs.push(closes[i]);
    if (closes[i] === Math.min(...slice5)) pivotLows.push(closes[i]);
  }

  // Group nearby levels
  const cluster = (arr: number[], tolerance = 2) => {
    const groups: number[][] = [];
    for (const val of arr) {
      let found = false;
      for (const g of groups) {
        if (Math.abs(g[0] - val) < tolerance) { g.push(val); found = true; break; }
      }
      if (!found) groups.push([val]);
    }
    return groups.map(g => g.reduce((a, b) => a + b, 0) / g.length).sort((a, b) => b - a);
  };

  const resistances = cluster(pivotHighs).slice(0, 5);
  const supports = cluster(pivotLows).slice(0, 5);

  return {
    support: supports.map(p => ({ price: Math.round(p * 100) / 100, type: 'support' as const })),
    resistance: resistances.map(p => ({ price: Math.round(p * 100) / 100, type: 'resistance' as const })),
  };
}

// OBV (On-Balance Volume)
function obv(data: PriceData[]): number {
  let obvVal = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      obvVal += data[i].volume;
    } else if (data[i].close < data[i - 1].close) {
      obvVal -= data[i].volume;
    }
  }
  return obvVal;
}

// Volume confirmation: prix monte avec volume = fort, prix monte sans volume = faible
function volumeConfirmation(data: PriceData[]): { obv: number; obvTrend: 'rising' | 'falling' | 'flat'; volumeSpike: boolean; strength: number } {
  const obvVal = obv(data);
  const recent = data.slice(-10);
  const recentOBV = obv(recent);
  
  // OBV trend
  const obvTrend = recentOBV > obvVal * 0.1 ? 'rising' : recentOBV < -obvVal * 0.1 ? 'falling' : 'flat';
  
  // Volume spike (volume > 2x moyenne)
  const avgVolume = data.slice(-20).reduce((s, d) => s + d.volume, 0) / 20;
  const lastVolume = data[data.length - 1].volume;
  const volumeSpike = lastVolume > avgVolume * 2;
  
  // Volume strength 0-100
  let strength = 50;
  if (obvTrend === 'rising') strength += 25;
  if (obvTrend === 'falling') strength -= 25;
  if (volumeSpike) strength += 15;
  if (lastVolume > avgVolume * 1.5) strength += 10;
  
  return { obv: obvVal, obvTrend, volumeSpike, strength: Math.max(0, Math.min(100, strength)) };
}

// Full analysis
export function runTechnicalAnalysis(data: PriceData[], currentPrice: number) {
  const closes = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  const trend = detectTrend(closes);
  const rsiVal = rsi(closes);
  const macdVal = macd(closes);
  const bb = bollinger(closes);
  const atrVal = atr(data);
  const stoch = stochastic(highs, lows, closes);
  const ema20v = ema(closes, 20);
  const ema50v = ema(closes, 50);
  const ema200v = ema(closes, 200);

  const squeeze = squeezeMomentum(data);
  const smc = analyzeSMC(data);
  const keyLevels = findKeyLevels(data);

  // Trend strength
  const aboveEMA200 = currentPrice > ema200v;
  const aboveEMA50 = currentPrice > ema50v;
  const aboveEMA20 = currentPrice > ema20v;
  let strength = 0;
  if (aboveEMA200) strength += 30;
  if (aboveEMA50) strength += 30;
  if (aboveEMA20) strength += 20;
  if (rsiVal > 50 && rsiVal < 80) strength += 10;
  if (macdVal.histogram > 0) strength += 10;

  // Generate setups
  const setups = generateSetups(data, currentPrice, trend, rsiVal, macdVal, bb, smc, atrVal);

  // Volume analysis
  const volAnalysis = volumeConfirmation(data);

  // Recommendation
  let recommendation = 'Attendre. Pas de signal clair.';
  if (trend === 'bullish' && rsiVal < 70 && macdVal.histogram > 0) {
    recommendation = 'Bullish. Chercher un pullback vers EMA20 ou un OB pour entree LONG.';
  } else if (trend === 'bearish' && rsiVal > 30 && macdVal.histogram < 0) {
    recommendation = 'Bearish. Chercher un rejet vers resistance pour entree SHORT.';
  }

  return {
    trend,
    trendStrength: Math.min(100, strength),
    rsi: Math.round(rsiVal * 10) / 10,
    macd: { macd: Math.round(macdVal.macd * 100) / 100, signal: Math.round(macdVal.signal * 100) / 100, histogram: Math.round(macdVal.histogram * 100) / 100 },
    bollinger: { upper: Math.round(bb.upper * 100) / 100, middle: Math.round(bb.middle * 100) / 100, lower: Math.round(bb.lower * 100) / 100 },
    ema20: Math.round(ema20v * 100) / 100,
    ema50: Math.round(ema50v * 100) / 100,
    ema200: Math.round(ema200v * 100) / 100,
    atr: Math.round(atrVal * 100) / 100,
    stochastic: { k: Math.round(stoch.k * 10) / 10, d: Math.round(stoch.d * 10) / 10 },
    cci: Math.round((closes[closes.length - 1] - sma(closes, 20)) / (0.015 * atrVal)),
    williamsR: Math.round((closes[closes.length - 1] - Math.max(...closes.slice(-14))) / (Math.max(...closes.slice(-14)) - Math.min(...closes.slice(-14))) * -100),
    volumeSMA: Math.round(data.slice(-20).reduce((s, d) => s + d.volume, 0) / 20),
    keyLevels: keyLevels,
    squeeze,
    orderBlocks: smc.orderBlocks,
    fvgs: smc.fvgs,
    liquidityPools: smc.liquidityPools,
    marketStructure: { structure: trend === 'bullish' ? 'Bullish Structure' : trend === 'bearish' ? 'Bearish Structure' : 'Range', signals: smc.structureSignals },
    keyLevelsDetailed: [...keyLevels.support, ...keyLevels.resistance],
    recommendation,
    riskLevel: (atrVal > 15 ? 'high' : atrVal > 8 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    setups,
    volume: volAnalysis,
    forecast: trend === 'bullish' ? 'Reprise haussiere possible. Targets: $' + (currentPrice + 30).toFixed(2) + ' / $' + (currentPrice + 60).toFixed(2) : trend === 'bearish' ? 'Pression baissiere. Support a $' + (currentPrice - 30).toFixed(2) : 'Consolidation. Attendre breakout.',
  };
}

function generateSetups(_data: PriceData[], price: number, trend: SignalType, rsi: number, macd: any, _bb: any, smc: any, atr: number) {
  const setups: any[] = [];

  // Long setup
  if (trend === 'bullish' || trend === 'neutral') {
    const entry = Math.round(price * 100) / 100;
    const sl = Math.round((price - atr * 2) * 100) / 100;
    const tp1 = Math.round((price + atr * 3) * 100) / 100;
    const tp2 = Math.round((price + atr * 5) * 100) / 100;
    const tp3 = Math.round((price + atr * 7) * 100) / 100;
    const rr = Math.round(((tp1 - entry) / (entry - sl)) * 10) / 10;

    setups.push({
      id: `setup-long-${Date.now()}`,
      type: 'SMC/ICT Long',
      direction: 'bullish' as SignalType,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit1: tp1,
      takeProfit2: tp2,
      takeProfit3: tp3,
      riskRewardRatio: rr,
      confidence: Math.min(95, 60 + (trend === 'bullish' ? 20 : 0) + (rsi < 70 ? 10 : 0) + (macd.histogram > 0 ? 10 : 0)),
      description: `Long XAU/USD. Entry: $${entry}, SL: $${sl} (${(atr * 2).toFixed(2)}$), TP: $${tp1}. RR: 1:${rr}. Confluences: ${trend === 'bullish' ? 'Trend bullish, ' : ''}RSI ${rsi.toFixed(1)}, MACD ${macd.histogram > 0 ? 'bullish' : 'bearish'}.`,
      indicators: [`SMC/ICT`, `Trend ${trend}`, `RSI ${rsi.toFixed(1)}`, `MACD ${macd.histogram > 0 ? 'bull' : 'bear'}`, ...smc.orderBlocks.slice(0, 2).map((ob: any) => `${ob.type} OB`)],
      timestamp: Date.now(),
    });
  }

  // Short setup
  if (trend === 'bearish' || trend === 'neutral') {
    const entry = Math.round(price * 100) / 100;
    const sl = Math.round((price + atr * 2) * 100) / 100;
    const tp1 = Math.round((price - atr * 3) * 100) / 100;
    const tp2 = Math.round((price - atr * 5) * 100) / 100;
    const tp3 = Math.round((price - atr * 7) * 100) / 100;
    const rr = Math.round(((entry - tp1) / (sl - entry)) * 10) / 10;

    setups.push({
      id: `setup-short-${Date.now()}`,
      type: 'SMC/ICT Short',
      direction: 'bearish' as SignalType,
      entryPrice: entry,
      stopLoss: sl,
      takeProfit1: tp1,
      takeProfit2: tp2,
      takeProfit3: tp3,
      riskRewardRatio: rr,
      confidence: Math.min(95, 60 + (trend === 'bearish' ? 20 : 0) + (rsi > 30 ? 10 : 0) + (macd.histogram < 0 ? 10 : 0)),
      description: `Short XAU/USD. Entry: $${entry}, SL: $${sl} (${(atr * 2).toFixed(2)}$), TP: $${tp1}. RR: 1:${rr}. Confluences: ${trend === 'bearish' ? 'Trend bearish, ' : ''}RSI ${rsi.toFixed(1)}, MACD ${macd.histogram < 0 ? 'bearish' : 'bullish'}.`,
      indicators: [`SMC/ICT`, `Trend ${trend}`, `RSI ${rsi.toFixed(1)}`, `MACD ${macd.histogram < 0 ? 'bear' : 'bull'}`, ...smc.orderBlocks.slice(0, 2).map((ob: any) => `${ob.type} OB`)],
      timestamp: Date.now(),
    });
  }

  return setups;
}
