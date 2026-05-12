// ============================================================
// ANALYSE FONDAMENTALE MACRO
// DXY, FED Rates, CPI, NFP, Geopolitique, US10Y Yields
// ============================================================

import type { MacroScore } from '@/types';

// Dernieres donnees macro (mise a jour manuelle possible)
let macroData: MacroScore = {
  totalScore: 55, // Score 0-100
  goldBias: 'buy', // buy | sell | neutral
  dxy: 97.99,     // DXY Index
  fed: 5.5,       // FED Funds Rate
  cpi: 3.2,       // CPI YoY
  nfp: 275,       // NFP (k)
  geo: 85,        // Geopolitical Risk (0-100)
  yield10y: 4.45, // US10Y Yield
};

export function getMacroSummary() {
  const m = macroData;

  // Factors analysis
  const factors = [
    { name: 'DXY', score: m.dxy, weight: 15, impact: m.dxy < 98 ? 'positive' : m.dxy > 102 ? 'negative' : 'neutral', desc: `DXY ${m.dxy} - Dollar ${m.dxy < 100 ? 'faible' : 'fort'}` },
    { name: 'FED', score: m.fed * 10, weight: 20, impact: m.fed > 5 ? 'positive' : m.fed < 4 ? 'negative' : 'neutral', desc: `FED ${m.fed}% - Taux ${m.fed > 5 ? 'eleves' : 'bas'}` },
    { name: 'CPI', score: (5 - m.cpi) * 20, weight: 15, impact: m.cpi > 3.5 ? 'positive' : m.cpi < 2 ? 'negative' : 'neutral', desc: `CPI ${m.cpi}% - Inflation ${m.cpi > 3 ? 'elevee' : 'moderée'}` },
    { name: 'NFP', score: (400 - m.nfp) / 4, weight: 15, impact: m.nfp < 200 ? 'positive' : m.nfp > 300 ? 'negative' : 'neutral', desc: `NFP ${m.nfp}k - Emploi ${m.nfp < 200 ? 'faible' : 'fort'}` },
    { name: 'Geo', score: m.geo, weight: 20, impact: m.geo > 70 ? 'positive' : 'neutral', desc: `Risque Geo ${m.geo}/100 - ${m.geo > 70 ? 'ELEVE' : 'Modere'}` },
    { name: 'US10Y', score: (5 - m.yield10y) * 20, weight: 15, impact: m.yield10y > 4.5 ? 'positive' : m.yield10y < 3.5 ? 'negative' : 'neutral', desc: `US10Y ${m.yield10y}% - Yields ${m.yield10y > 4 ? 'eleves' : 'bas'}` },
  ];

  // Calculer le biais global
  let totalWeighted = 0;
  let totalWeight = 0;
  let positiveCount = 0;

  for (const f of factors) {
    const weightedScore = Math.min(100, Math.max(0, f.score)) * f.weight;
    totalWeighted += weightedScore;
    totalWeight += f.weight;
    if (f.impact === 'positive') positiveCount++;
  }

  const totalScore = Math.round(totalWeighted / totalWeight);
  const goldBias = totalScore > 55 ? 'buy' as const : totalScore < 45 ? 'sell' as const : 'neutral' as const;

  return {
    score: { totalScore, goldBias, dxy: m.dxy, fed: m.fed, cpi: m.cpi, nfp: m.nfp, geo: m.geo, yield10y: m.yield10y },
    factors,
    newsDanger: {
      isDangerous: false,
      reason: 'Pas de news critique detectee',
    },
    summary: `Analyse fondamentale: ${goldBias === 'buy' ? 'Positif pour Gold' : goldBias === 'sell' ? 'Negatif pour Gold' : 'Neutre'}. Score: ${totalScore}/100. ${positiveCount}/6 facteurs positifs.`,
  };
}

export function getMacroScore(): MacroScore {
  return { ...macroData };
}

export function updateMacroData(data: Partial<MacroScore>) {
  macroData = { ...macroData, ...data };
}

export function validateWithMacro(direction: 'bullish' | 'bearish', macro: MacroScore): { macroAlignment: boolean; canTrade: boolean; reason: string } {
  const isBullish = direction === 'bullish';
  const macroIsBullish = macro.goldBias === 'buy';
  const macroIsBearish = macro.goldBias === 'sell';

  // Anti-contre-tendance: SI macro est bearish et signal est bullish = REJETE
  if (isBullish && macroIsBearish) {
    return { macroAlignment: false, canTrade: false, reason: 'MACRO CONTRARIEN: Macro bearish + Signal bullish = NO TRADE' };
  }
  if (!isBullish && macroIsBullish) {
    return { macroAlignment: false, canTrade: false, reason: 'MACRO CONTRARIEN: Macro bullish + Signal bearish = NO TRADE' };
  }

  // Danger news
  if (macro.totalScore < 20 || macro.totalScore > 80) {
    return { macroAlignment: true, canTrade: false, reason: `News danger: Score macro extreme (${macro.totalScore}). Attendre calme.` };
  }

  return { macroAlignment: true, canTrade: true, reason: 'Macro aligne avec le signal' };
}

export function checkNewsDanger(): { isDangerous: boolean; reason: string } {
  // Verifier si une news dangereuse est proche (simule)
  const now = new Date();
  const gmtHour = now.getUTCHours();
  if (gmtHour >= 12 && gmtHour <= 14) {
    return { isDangerous: true, reason: 'NO TRADE: Periode de haute volatilite (12h-14h GMT)' };
  }
  return { isDangerous: false, reason: 'Pas de danger macro detecte' };
}
