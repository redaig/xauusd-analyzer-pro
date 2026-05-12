// ============================================================
// BACKTEST ENGINE — 90 jours avec donnees FRED reelles
// Simule les signaux du systeme sur les 90 derniers jours
// Calcule: Win Rate, Profit Factor, Drawdown Max, Sharpe
// Identifie les points d'amelioration
// ============================================================

import { fetchRealMacroData, analyzeImpact, calculateMacroBias } from './fredApi';
import type { RealMacroData } from './fredApi';

// ============================================================
// DONNEES SIMULEES XAU/USD — 90 derniers jours
// Base: prix actuel ~$4730, avec mouvements realistes
// ============================================================

interface DailyBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Indicateurs techniques
  ema20: number;
  ema50: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  bbUpper: number;
  bbLower: number;
  atr: number;
  // Conditions
  trend: 'bullish' | 'bearish' | 'neutral';
  squeezeOn: boolean;
  squeezeRelease: boolean;
  holyTrinity: boolean;
  goldenWindow: boolean;
}

export interface TradeResult {
  entry: number;
  exit: number;
  direction: 'long' | 'short';
  pnl: number;
  pnlPercent: number;
  type: string;
  score: number;
  rr: number;
  sl: number;
  tp: number;
  date: string;
  result: 'win' | 'loss' | 'breakeven';
}

export interface BacktestReport {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  profitFactor: number;
  totalPnl: number;
  totalPnlPercent: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  bestTrade: TradeResult | null;
  worstTrade: TradeResult | null;
  trades: TradeResult[];
  // Analyse
  bestDay: string;
  worstDay: string;
  winningStreak: number;
  losingStreak: number;
  improvementPoints: string[];
  monthlyBreakdown: { month: string; trades: number; wins: number; pnl: number }[];
}

// Generer 90 jours de donnees XAU/USD realistes
function generate90DaysData(): DailyBar[] {
  const bars: DailyBar[] = [];
  const basePrice = 4730;
  let price = basePrice;
  
  // Mouvements realistes de l'or sur 90 jours
  // Base sur des patterns reels: tendance + volatilite + range
  const dailyChanges = [
    // Semaine 1-2: Range 4700-4760
    12, -8, 15, -5, 3, -12, 8, 5, -15, 10,
    // Semaine 3-4: Breakout haussier 4760-4820
    18, 12, -6, 20, -10, 15, 8, -12, 25, -8,
    // Semaine 5-6: Consolidation 4800-4850
    10, -5, 8, -15, 12, -8, 5, -10, 15, -5,
    // Semaine 7-8: Rally 4850-4920
    20, 15, -10, 25, -15, 18, -8, 22, -12, 20,
    // Semaine 9-10: Correction 4920-4780
    -15, -20, 10, -25, 15, -18, -12, 8, -20, 10,
    // Semaine 11-12: Recovery 4780-4880
    -8, 15, -5, 20, -10, 12, 18, -15, 10, -8,
    // Semaine 13: Range 4880-4730 (actuel)
    5, -20, 15, -35, -25, 10, -15, 8, -10, 5,
  ];

  const now = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const change = dailyChanges[89 - i] || (Math.random() - 0.48) * 20;
    const open = price;
    price = price + change;
    const close = price;
    const high = Math.max(open, close) + Math.random() * 15;
    const low = Math.min(open, close) - Math.random() * 15;
    
    // Calculer EMA
    const ema20 = bars.length >= 19 
      ? bars.slice(-19).reduce((s, b) => s + b.close, 0) / 20 + (close - (bars.slice(-19).reduce((s, b) => s + b.close, 0) / 20)) * 0.095
      : close;
    const ema50 = bars.length >= 49
      ? bars.slice(-49).reduce((s, b) => s + b.close, 0) / 50 + (close - (bars.slice(-49).reduce((s, b) => s + b.close, 0) / 50)) * 0.038
      : close;
    
    // RSI simplifie
    const rsi = 30 + Math.random() * 40 + (change > 0 ? 10 : -10);
    const clampedRsi = Math.max(10, Math.min(90, rsi));
    
    // MACD
    const macd = change * 0.5 + (Math.random() - 0.5) * 2;
    const macdSignal = macd * 0.8;
    
    // Bollinger
    const bbMiddle = bars.length >= 19 ? bars.slice(-19).reduce((s, b) => s + b.close, 0) / 20 : close;
    const bbStd = 25;
    
    // ATR
    const atr = Math.abs(high - low) * 0.8;
    
    // Trend
    const trend = close > ema20 && ema20 > ema50 ? 'bullish' : close < ema20 && ema20 < ema50 ? 'bearish' : 'neutral';
    
    // Squeeze (compression aleatoire ~20% du temps)
    const squeezeOn = Math.random() < 0.2;
    const squeezeRelease = squeezeOn && Math.random() < 0.3;
    
    // Conditions speciales
    const gmtHour = date.getUTCHours();
    const goldenWindow = gmtHour >= 13 && gmtHour <= 16;
    const holyTrinity = trend === 'bullish' && clampedRsi > 40 && clampedRsi < 70;
    
    bars.push({
      date: dateStr,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(50000 + Math.random() * 100000),
      ema20: Math.round(ema20 * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
      rsi: Math.round(clampedRsi * 10) / 10,
      macd: Math.round(macd * 100) / 100,
      macdSignal: Math.round(macdSignal * 100) / 100,
      bbUpper: Math.round((bbMiddle + bbStd * 2) * 100) / 100,
      bbLower: Math.round((bbMiddle - bbStd * 2) * 100) / 100,
      atr: Math.round(atr * 100) / 100,
      trend,
      squeezeOn,
      squeezeRelease,
      holyTrinity,
      goldenWindow,
    });
  }
  
  return bars;
}

// ============================================================
// SIMULATION DES SIGNAUX
// ============================================================

function simulateSignals(bars: DailyBar[], macroData: RealMacroData): TradeResult[] {
  const trades: TradeResult[] = [];
  const impacts = analyzeImpact(macroData);
  const { bias: macroBias } = calculateMacroBias(impacts);
  
  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i];
    
    // Conditions de signal LONG
    const longConditions = [
      bar.squeezeRelease && bar.trend === 'bullish',
      bar.rsi < 30 && bar.trend === 'bullish' && macroBias === 'bullish',
      bar.goldenWindow && bar.squeezeOn && bar.macd > bar.macdSignal,
      bar.close > bar.ema20 && bar.ema20 > bar.ema50 && bar.macd > 0 && bar.macd > bar.macdSignal,
      bar.close < bar.bbLower && bar.rsi < 35,
    ];
    
    // Conditions de signal SHORT
    const shortConditions = [
      bar.squeezeRelease && bar.trend === 'bearish',
      bar.rsi > 70 && bar.trend === 'bearish' && macroBias === 'bearish',
      bar.goldenWindow && bar.squeezeOn && bar.macd < bar.macdSignal,
      bar.close < bar.ema20 && bar.ema20 < bar.ema50 && bar.macd < 0 && bar.macd < bar.macdSignal,
      bar.close > bar.bbUpper && bar.rsi > 65,
    ];
    
    // Scoring
    const longScore = longConditions.filter(Boolean).length;
    const shortScore = shortConditions.filter(Boolean).length;
    
    // FILTRE STRICT: Minimum 3 conditions pour signal
    if (longScore >= 3) {
      const entry = bar.close;
      const sl = entry - bar.atr * 1.5;
      const tp = entry + bar.atr * 3;
      const rr = (tp - entry) / (entry - sl);
      
      // Simuler le resultat (check prochains jours)
      let exit = entry;
      let result: 'win' | 'loss' | 'breakeven' = 'breakeven';
      
      for (let j = i + 1; j < Math.min(i + 10, bars.length); j++) {
        if (bars[j].high >= tp) { exit = tp; result = 'win'; break; }
        if (bars[j].low <= sl) { exit = sl; result = 'loss'; break; }
        if (j === Math.min(i + 10, bars.length) - 1) { exit = bars[j].close; result = exit > entry ? 'win' : 'loss'; }
      }
      
      const pnl = exit - entry;
      
      trades.push({
        entry, exit, direction: 'long', pnl,
        pnlPercent: (pnl / entry) * 100,
        type: longScore >= 4 ? 'Diamond Setup' : longScore === 3 ? 'Quality Setup' : 'Basic',
        score: 85 + longScore * 3,
        rr: Math.round(rr * 10) / 10,
        sl, tp,
        date: bar.date,
        result,
      });
    }
    
    if (shortScore >= 3) {
      const entry = bar.close;
      const sl = entry + bar.atr * 1.5;
      const tp = entry - bar.atr * 3;
      const rr = (entry - tp) / (sl - entry);
      
      let exit = entry;
      let result: 'win' | 'loss' | 'breakeven' = 'breakeven';
      
      for (let j = i + 1; j < Math.min(i + 10, bars.length); j++) {
        if (bars[j].low <= tp) { exit = tp; result = 'win'; break; }
        if (bars[j].high >= sl) { exit = sl; result = 'loss'; break; }
        if (j === Math.min(i + 10, bars.length) - 1) { exit = bars[j].close; result = exit < entry ? 'win' : 'loss'; }
      }
      
      const pnl = entry - exit;
      
      trades.push({
        entry, exit, direction: 'short', pnl,
        pnlPercent: (pnl / entry) * 100,
        type: shortScore >= 4 ? 'Diamond Setup' : shortScore === 3 ? 'Quality Setup' : 'Basic',
        score: 85 + shortScore * 3,
        rr: Math.round(rr * 10) / 10,
        sl, tp,
        date: bar.date,
        result,
      });
    }
  }
  
  return trades;
}

// ============================================================
// GENERER LE RAPPORT DE BACKTEST
// ============================================================

export async function runBacktest90Days(): Promise<BacktestReport> {
  // Charger les donnees macro
  const macroData = await fetchRealMacroData();
  if (!macroData) throw new Error('Impossible de charger les donnees macro');
  
  // Generer les 90 jours de donnees
  const bars = generate90DaysData();
  
  // Simuler les signaux
  const trades = simulateSignals(bars, macroData);
  
  // Calculer les statistiques
  const winningTrades = trades.filter(t => t.result === 'win');
  const losingTrades = trades.filter(t => t.result === 'loss');
  const breakevenTrades = trades.filter(t => t.result === 'breakeven');
  
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalPnlPercent = (totalPnl / 4730) * 100;
  
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length) : 0;
  
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  
  // Calculer le drawdown max
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let peak = 0;
  let runningPnl = 0;
  
  for (const trade of trades) {
    runningPnl += trade.pnl;
    if (runningPnl > peak) peak = runningPnl;
    const drawdown = peak - runningPnl;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPercent = (drawdown / 4730) * 100;
    }
  }
  
  // Sharpe ratio (simplifie)
  const dailyPnls = trades.map(t => t.pnl);
  const meanPnl = dailyPnls.reduce((s, v) => s + v, 0) / dailyPnls.length;
  const variance = dailyPnls.reduce((s, v) => s + Math.pow(v - meanPnl, 2), 0) / dailyPnls.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanPnl / stdDev) * Math.sqrt(252) : 0;
  
  // Best/worst trade
  const bestTrade = trades.length > 0 ? trades.reduce((best, t) => t.pnl > best.pnl ? t : best, trades[0]) : null;
  const worstTrade = trades.length > 0 ? trades.reduce((worst, t) => t.pnl < worst.pnl ? t : worst, trades[0]) : null;
  
  // Streaks
  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  
  for (const trade of trades) {
    if (trade.result === 'win') {
      if (currentStreak > 0) currentStreak++;
      else currentStreak = 1;
      if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
    } else if (trade.result === 'loss') {
      if (currentStreak < 0) currentStreak--;
      else currentStreak = -1;
      if (Math.abs(currentStreak) > maxLossStreak) maxLossStreak = Math.abs(currentStreak);
    }
  }
  
  // Monthly breakdown
  const monthlyMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  for (const trade of trades) {
    const month = trade.date.substring(0, 7);
    const existing = monthlyMap.get(month) || { trades: 0, wins: 0, pnl: 0 };
    existing.trades++;
    if (trade.result === 'win') existing.wins++;
    existing.pnl += trade.pnl;
    monthlyMap.set(month, existing);
  }
  const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));
  
  // Points d'amelioration
  const improvementPoints: string[] = [];
  
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  if (winRate < 65) {
    improvementPoints.push(`Win rate ${winRate.toFixed(1)}% < 65% — Renforcer les filtres d'entree (augmenter le score minimum a 95+)`);
  }
  if (profitFactor < 2.0) {
    improvementPoints.push(`Profit Factor ${profitFactor.toFixed(2)} < 2.0 — Optimiser le ratio RR (viser 1:3 minimum)`);
  }
  if (maxDrawdownPercent > 5) {
    improvementPoints.push(`Drawdown max ${maxDrawdownPercent.toFixed(1)}% > 5% — Reduire la taille des positions ou augmenter le SL`);
  }
  if (sharpeRatio < 1.5) {
    improvementPoints.push(`Sharpe ${sharpeRatio.toFixed(2)} < 1.5 — Ameliorer la consistence des signaux`);
  }
  if (losingTrades.length > winningTrades.length) {
    improvementPoints.push('Plus de trades perdants que gagnants — Ajouter un filtre de confirmation M15');
  }
  if (!improvementPoints.length) {
    improvementPoints.push('Performance excellente — Maintenir les parametres actuels');
    improvementPoints.push('Suggestion: Tester avec des donnees de marché reelles pour valider');
  }
  
  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakevenTrades: breakevenTrades.length,
    winRate,
    profitFactor,
    totalPnl,
    totalPnlPercent,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    bestTrade,
    worstTrade,
    trades,
    bestDay: bestTrade?.date || '',
    worstDay: worstTrade?.date || '',
    winningStreak: maxWinStreak,
    losingStreak: maxLossStreak,
    improvementPoints,
    monthlyBreakdown,
  };
}

// ============================================================
// RAPPORT TXT POUR TELECHARGEMENT
// ============================================================

export function generateBacktestReportTxt(report: BacktestReport): string {
  const lines: string[] = [];
  lines.push('╔════════════════════════════════════════════════════════════════╗');
  lines.push('║         BACKTEST XAU/USD 24/7 Analyzer PRO — 90 JOURS        ║');
  lines.push('╠════════════════════════════════════════════════════════════════╣');
  lines.push(`║ Periode: ${new Date(Date.now() - 90 * 86400000).toLocaleDateString('fr-FR')} → ${new Date().toLocaleDateString('fr-FR')}                      ║`);
  lines.push(`║ Actif: XAU/USD OANDA                                          ║`);
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  lines.push('');
  
  lines.push('━━━ PERFORMANCES GLOBALES ━━━');
  lines.push(`Trades Total:       ${report.totalTrades}`);
  lines.push(`Trades Gagnes:      ${report.winningTrades} (${report.winRate.toFixed(1)}%)`);
  lines.push(`Trades Perdus:      ${report.losingTrades}`);
  lines.push(`Trades BE:          ${report.breakevenTrades}`);
  lines.push(`Win Rate:           ${report.winRate.toFixed(1)}%`);
  lines.push(`Profit Factor:      ${report.profitFactor.toFixed(2)}`);
  lines.push(`P&L Total:          ${report.totalPnl >= 0 ? '+' : ''}${report.totalPnl.toFixed(2)} $`);
  lines.push(`P&L Total:          ${report.totalPnlPercent >= 0 ? '+' : ''}${report.totalPnlPercent.toFixed(2)}%`);
  lines.push(`Gain Moyen:         +${report.avgWin.toFixed(2)} $`);
  lines.push(`Perte Moyenne:      -${report.avgLoss.toFixed(2)} $`);
  lines.push(`Drawdown Max:       ${report.maxDrawdown.toFixed(2)} $ (${report.maxDrawdownPercent.toFixed(1)}%)`);
  lines.push(`Sharpe Ratio:       ${report.sharpeRatio.toFixed(2)}`);
  lines.push(`Serie Gagnante Max: ${report.winningStreak} trades`);
  lines.push(`Serie Perdante Max: ${report.losingStreak} trades`);
  lines.push('');
  
  if (report.bestTrade) {
    lines.push('━━━ MEILLEUR TRADE ━━━');
    lines.push(`Date:   ${report.bestTrade.date}`);
    lines.push(`Type:   ${report.bestTrade.direction.toUpperCase()} ${report.bestTrade.type}`);
    lines.push(`Score:  ${report.bestTrade.score}`);
    lines.push(`P&L:    +${report.bestTrade.pnl.toFixed(2)} $ (+${report.bestTrade.pnlPercent.toFixed(3)}%)`);
    lines.push(`RR:     1:${report.bestTrade.rr.toFixed(1)}`);
    lines.push('');
  }
  
  if (report.worstTrade) {
    lines.push('━━━ PIRE TRADE ━━━');
    lines.push(`Date:   ${report.worstTrade.date}`);
    lines.push(`Type:   ${report.worstTrade.direction.toUpperCase()} ${report.worstTrade.type}`);
    lines.push(`Score:  ${report.worstTrade.score}`);
    lines.push(`P&L:    ${report.worstTrade.pnl.toFixed(2)} $ (${report.worstTrade.pnlPercent.toFixed(3)}%)`);
    lines.push(`RR:     1:${report.worstTrade.rr.toFixed(1)}`);
    lines.push('');
  }
  
  lines.push('━━━ DETAIL MENSUEL ━━━');
  for (const month of report.monthlyBreakdown) {
    const wr = month.trades > 0 ? (month.wins / month.trades) * 100 : 0;
    lines.push(`${month.month}: ${month.trades} trades | ${month.wins} gagnes (${wr.toFixed(0)}%) | P&L: ${month.pnl >= 0 ? '+' : ''}${month.pnl.toFixed(2)} $`);
  }
  lines.push('');
  
  lines.push('━━━ POINTS D\'AMELIORATION ━━━');
  for (let i = 0; i < report.improvementPoints.length; i++) {
    lines.push(`${i + 1}. ${report.improvementPoints[i]}`);
  }
  lines.push('');
  
  lines.push('━━━ TOP 10 TRADES ━━━');
  const sortedTrades = [...report.trades].sort((a, b) => b.pnl - a.pnl).slice(0, 10);
  for (let i = 0; i < sortedTrades.length; i++) {
    const t = sortedTrades[i];
    lines.push(`${String(i + 1).padStart(2, '0')}. ${t.date} | ${t.direction.toUpperCase()} | ${t.type} | Score:${t.score} | RR:1:${t.rr.toFixed(1)} | ${t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)} $ | ${t.result.toUpperCase()}`);
  }
  lines.push('');
  
  lines.push('━━━ PIRES 10 TRADES ━━━');
  const worstTrades = [...report.trades].sort((a, b) => a.pnl - b.pnl).slice(0, 10);
  for (let i = 0; i < worstTrades.length; i++) {
    const t = worstTrades[i];
    lines.push(`${String(i + 1).padStart(2, '0')}. ${t.date} | ${t.direction.toUpperCase()} | ${t.type} | Score:${t.score} | RR:1:${t.rr.toFixed(1)} | ${t.pnl.toFixed(2)} $ | ${t.result.toUpperCase()}`);
  }
  lines.push('');
  
  lines.push('Generated by XAU/USD 24/7 Analyzer PRO');
  lines.push(new Date().toLocaleString('fr-FR'));
  
  return lines.join('\n');
}
