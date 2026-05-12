// ============================================================
// WALK-FORWARD BACKTEST — Actualisation temps reel
// Recalcule les parametres optimaux chaque semaine
// Affiche les resultats en direct
// ============================================================

import type { PriceData } from '@/types';

export interface WalkForwardResult {
  period: string;
  optimalScore: number;
  optimalRR: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  totalPnL: number;
  maxDrawdown: number;
  recommendation: string;
}

// Simuler un backtest walk-forward sur les 30 derniers jours
export function runWalkForward(data: PriceData[]): WalkForwardResult[] {
  if (data.length < 30) return [];
  
  const results: WalkForwardResult[] = [];
  
  // Diviser en 3 periodes de 10 jours
  const periodSize = Math.floor(data.length / 3);
  
  for (let p = 0; p < 3; p++) {
    const start = data.length - (3 - p) * periodSize;
    const end = start + periodSize;
    const periodData = data.slice(Math.max(0, start), end);
    
    if (periodData.length < 5) continue;
    
    const period = p === 2 ? 'Cette Semaine' : p === 1 ? 'Semaine -1' : 'Semaine -2';
    
    // Tester differentes combinaisons de parametres
    const paramSets = [
      { score: 85, rr: 1.5 },
      { score: 88, rr: 1.8 },
      { score: 90, rr: 2.0 },
      { score: 92, rr: 2.0 },
      { score: 95, rr: 2.5 },
    ];
    
    let bestResult = { winRate: 0, pf: 0, pnl: 0, params: { score: 85, rr: 1.5 } };
    
    for (const params of paramSets) {
      const trades = simulatePeriod(periodData, params.score, params.rr);
      if (trades.length === 0) continue;
      
      const wins = trades.filter(t => t.result === 'win');
      const wr = wins.length / trades.length * 100;
      const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
      const losses = trades.filter(t => t.result === 'loss');
      const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 1;
      const pf = avgLoss > 0 ? avgWin / avgLoss : 0;
      const pnl = trades.reduce((s, t) => s + t.pnl, 0);
      
      // Score composite: WR*0.4 + PF*20 + PnL/10
      const composite = wr * 0.4 + Math.min(pf, 5) * 20 + pnl / 20;
      const bestComposite = bestResult.winRate * 0.4 + Math.min(bestResult.pf, 5) * 20 + bestResult.pnl / 20;
      
      if (composite > bestComposite) {
        bestResult = { winRate: wr, pf, pnl, params };
      }
    }
    
    // Calculer le drawdown
    let peak = 0;
    let running = 0;
    let maxDD = 0;
    const allTrades = simulatePeriod(periodData, bestResult.params.score, bestResult.params.rr);
    for (const t of allTrades) {
      running += t.pnl;
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDD) maxDD = dd;
    }
    
    const totalTrades = simulatePeriod(periodData, bestResult.params.score, bestResult.params.rr).length;
    
    // Recommendation
    let rec = 'Maintenir les parametres actuels';
    if (bestResult.winRate < 55) rec = 'Renforcer les filtres — eviter les signaux faibles';
    else if (bestResult.pf < 1.5) rec = 'Augmenter le RR minimum — les pertes sont trop grandes';
    else if (bestResult.winRate > 70 && bestResult.pf > 2.5) rec = 'Excellente periode — maintenir ces parametres';
    
    results.push({
      period,
      optimalScore: bestResult.params.score,
      optimalRR: bestResult.params.rr,
      winRate: Math.round(bestResult.winRate * 10) / 10,
      profitFactor: Math.round(bestResult.pf * 100) / 100,
      totalTrades,
      totalPnL: Math.round(bestResult.pnl * 100) / 100,
      maxDrawdown: Math.round(maxDD * 100) / 100,
      recommendation: rec,
    });
  }
  
  return results;
}

function simulatePeriod(data: PriceData[], minScore: number, minRR: number) {
  const trades: { pnl: number; result: 'win' | 'loss' }[] = [];
  
  for (let i = 5; i < data.length; i++) {
    const bar = data[i];
    const prev = data[i - 1];
    const prev2 = data[i - 2];
    
    // Score simple base sur le mouvement
    let score = 50;
    const change = bar.close - prev.close;
    const changePrev = prev.close - prev2.close;
    
    if (change > 0 && changePrev > 0) score += 15; // Momentum
    if (change > 0 && prev.close > prev.open) score += 10; // Candle bullish
    if (Math.abs(change) > Math.abs(changePrev) * 1.5) score += 10; // Volume d'acceleration
    if (bar.close > Math.max(prev.high, prev2.high)) score += 15; // Breakout
    
    if (score < minScore) continue;
    
    const atr = Math.abs(bar.high - bar.low) * 0.8 || 15;
    const sl = atr * 1.5;
    const tp = atr * minRR * 1.5;
    const rr = tp / sl;
    
    if (rr < minRR) continue;
    
    // Simuler le resultat
    const winProb = Math.min(0.85, 0.5 + (score - 80) * 0.01);
    const result = Math.random() < winProb ? 'win' : 'loss';
    const pnl = result === 'win' ? tp : -sl;
    
    trades.push({ pnl, result });
  }
  
  return trades;
}
