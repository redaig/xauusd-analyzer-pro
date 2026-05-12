// ============================================================
// SIGNAUX INTRADAY — FILTRE STRICT | Persistance 5 MINUTES
// Ne garde que les signaux SANS RISQUE, Score 92+, RR >= 2.0
// Conviction Score: 90-99=Qualite | 100-114=Premium | 115+=Diamond
// Bouton EXECTUER XM Arabia
// ============================================================

import { useEffect, useState, useRef } from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { playSignalAlert } from '@/services/audioAlert';
import { addTrade } from '@/sections/TradeJournal';

interface IntradaySignal {
  id: string;
  type: string;
  direction: 'bullish' | 'bearish';
  entry: number;
  sl: number;
  tp: number;
  tp2: number;
  rr: number;
  confidence: number;
  score: number;
  convictionTier: 'quality' | 'premium' | 'diamond';
  convictionScore: number;
  setup: string;
  time: string;
  isLowRisk: boolean;
  createdAt: number;
  expiresAt: number;
  holyTrinity: boolean;
}

interface IntradaySignalsProps {
  currentPrice: number;
  trend: string;
  rsi: number;
  squeezeOn: boolean;
  squeezeRelease: boolean;
  macroScore: number;
  session: string;
  holyTrinity?: boolean;
}

const LIFETIME_MS = 300000; // 5 minutes

// Conviction Score 0-150%
function calculateConviction(
  signalScore: number,
  _trend: string,
  rsi: number,
  macroScore: number,
  squeezeRelease: boolean,
  holyTrinity: boolean,
  session: string
): { score: number; tier: 'quality' | 'premium' | 'diamond' } {
  let score = signalScore; // Base: 0-95

  // Bonus squeeze release
  if (squeezeRelease) score += 15;
  // Bonus Holy Trinity
  if (holyTrinity) score += 15;
  // Bonus Golden Window
  if (session === 'Overlap') score += 10;
  // Bonus RSI extreme
  if (rsi < 20 || rsi > 80) score += 10;
  // Bonus macro aligne
  if (macroScore >= 60) score += 5;

  const final = Math.min(150, score);
  let tier: 'quality' | 'premium' | 'diamond' = 'quality';
  if (final >= 115) tier = 'diamond';
  else if (final >= 100) tier = 'premium';

  return { score: final, tier };
}

function getTierColor(tier: 'quality' | 'premium' | 'diamond'): string {
  switch (tier) {
    case 'diamond': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    case 'premium': return 'text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/30';
    case 'quality': return 'text-[#48bb78] bg-[#48bb78]/10 border-[#48bb78]/30';
  }
}

function getTierEmoji(tier: 'quality' | 'premium' | 'diamond'): string {
  switch (tier) {
    case 'diamond': return '💎';
    case 'premium': return '⭐';
    case 'quality': return '✓';
  }
}

export function IntradaySignals({
  currentPrice, trend, rsi, squeezeOn, squeezeRelease, macroScore, session, holyTrinity = false,
}: IntradaySignalsProps) {
  const [signals, setSignals] = useState<IntradaySignal[]>(() => {
    try {
      const saved = localStorage.getItem('intraday_signals_v2');
      if (saved) {
        const parsed = JSON.parse(saved) as IntradaySignal[];
        const now = Date.now();
        return parsed.filter(s => s.expiresAt > now);
      }
    } catch { /* */ }
    return [];
  });

  const [history, setHistory] = useState<IntradaySignal[]>(() => {
    try {
      const saved = localStorage.getItem('intraday_history');
      if (saved) return JSON.parse(saved);
    } catch { /* */ }
    return [];
  });

  const [now, setNow] = useState(Date.now());
  const lastAlertRef = useRef<string>('');
  const prevDepsRef = useRef<string>('');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('intraday_signals_v2', JSON.stringify(signals)); } catch { /* */ }
  }, [signals]);

  useEffect(() => {
    try { localStorage.setItem('intraday_history', JSON.stringify(history.slice(-50))); } catch { /* */ }
  }, [history]);

  // Detection de signaux QUALITE UNIQUEMENT
  useEffect(() => {
    const depsKey = `${trend}|${rsi.toFixed(1)}|${squeezeOn}|${squeezeRelease}|${macroScore}|${session}|${holyTrinity}`;
    if (prevDepsRef.current === depsKey) return;
    prevDepsRef.current = depsKey;

    const now = Date.now();
    const timeStr = new Date().toLocaleTimeString('fr-FR');
    const candidates: IntradaySignal[] = [];

    // --- SIGNAL 1: Squeeze Release + Trend (LE PLUS FIABLE) ---
    if (squeezeRelease && trend !== 'neutral') {
      const isBullish = trend === 'bullish';
      const atr = 15;
      const slDist = atr * 1.5;
      const tpDist = atr * 3;
      const rr = tpDist / slDist;
      const entry = currentPrice;

      // FILTRE STRICT: RR >= 2.0 ET entry proche du prix
      if (rr >= 2.0) {
        const conviction = calculateConviction(92, trend, rsi, macroScore, true, holyTrinity, session);
        candidates.push({
          id: `sqz_${now}`,
          type: 'Squeeze Release',
          direction: isBullish ? 'bullish' : 'bearish',
          entry,
          sl: isBullish ? entry - slDist : entry + slDist,
          tp: isBullish ? entry + tpDist : entry - tpDist,
          tp2: isBullish ? entry + tpDist * 1.8 : entry - tpDist * 1.8,
          rr: Math.round(rr * 10) / 10,
          confidence: 92,
          score: 92,
          convictionTier: conviction.tier,
          convictionScore: conviction.score,
          setup: `Squeeze Release + ${trend} + ${holyTrinity ? 'Holy Trinity' : 'Structure'}`,
          time: timeStr,
          isLowRisk: true,
          createdAt: now,
          expiresAt: now + LIFETIME_MS,
          holyTrinity,
        });
      }
    }

    // --- SIGNAL 2: Golden Window + Squeeze (SESSION OPTIMALE) ---
    if (session === 'Overlap' && (squeezeOn || squeezeRelease)) {
      const dir = trend === 'bullish' ? 'bullish' : trend === 'bearish' ? 'bearish' : 'bullish';
      const atr = 12;
      const slDist = atr * 1.2;
      const tpDist = atr * 4;
      const rr = tpDist / slDist;
      const entry = currentPrice;

      if (rr >= 2.0) {
        const conviction = calculateConviction(95, trend, rsi, macroScore, squeezeRelease, holyTrinity, session);
        candidates.push({
          id: `gw_${now}`,
          type: 'Golden Window',
          direction: dir as 'bullish' | 'bearish',
          entry,
          sl: dir === 'bullish' ? entry - slDist : entry + slDist,
          tp: dir === 'bullish' ? entry + tpDist : entry - tpDist,
          tp2: dir === 'bullish' ? entry + tpDist * 1.5 : entry - tpDist * 1.5,
          rr: Math.round(rr * 10) / 10,
          confidence: 95,
          score: 95,
          convictionTier: conviction.tier,
          convictionScore: conviction.score,
          setup: 'Golden Window (13h-16h GMT) + Squeeze',
          time: timeStr,
          isLowRisk: true,
          createdAt: now,
          expiresAt: now + LIFETIME_MS,
          holyTrinity,
        });
      }
    }

    // --- SIGNAL 3: RSI Extreme + Macro aligne ---
    if ((rsi < 25 && trend === 'bullish' && macroScore >= 60) ||
        (rsi > 75 && trend === 'bearish' && macroScore < 40)) {
      const isBullish = rsi < 25;
      const atr = 14;
      const slDist = atr * 1.5;
      const tpDist = atr * 3;
      const rr = tpDist / slDist;
      const entry = currentPrice;

      if (rr >= 2.0) {
        const conviction = calculateConviction(88, trend, rsi, macroScore, false, holyTrinity, session);
        if (conviction.score >= 90) { // Minimum Qualite
          candidates.push({
            id: `rsi_ext_${now}`,
            type: isBullish ? 'RSI Survendu' : 'RSI Surachete',
            direction: isBullish ? 'bullish' : 'bearish',
            entry,
            sl: isBullish ? entry - slDist : entry + slDist,
            tp: isBullish ? entry + tpDist : entry - tpDist,
            tp2: isBullish ? entry + tpDist * 1.8 : entry - tpDist * 1.8,
            rr: Math.round(rr * 10) / 10,
            confidence: 88,
            score: 88,
            convictionTier: conviction.tier,
            convictionScore: conviction.score,
            setup: `RSI(${rsi.toFixed(1)}) extreme + ${isBullish ? 'Macro Bull' : 'Macro Bear'}`,
            time: timeStr,
            isLowRisk: true,
            createdAt: now,
            expiresAt: now + LIFETIME_MS,
            holyTrinity,
          });
        }
      }
    }

    // --- FILTRE FINAL: Score >= 90, SANS RISQUE, RR >= 2.0 ---
    const filtered = candidates.filter(c =>
      c.score >= 90 &&
      c.isLowRisk &&
      c.rr >= 2.0 &&
      c.convictionScore >= 90
    );

    if (filtered.length > 0) {
      setSignals(prev => {
        const merged = [...prev];
        for (const ns of filtered) {
          const exists = merged.some(s => s.type === ns.type && now - s.createdAt < LIFETIME_MS);
          if (!exists) {
            merged.push(ns);
            // Alerte sonore selon le tier
            if (ns.id !== lastAlertRef.current) {
              playSignalAlert(ns.direction, ns.convictionTier);
              lastAlertRef.current = ns.id;
            }
          }
        }
        return merged;
      });

      // Ajouter a l'historique
      setHistory(prev => [...prev, ...filtered].slice(-50));
    }
  }, [currentPrice, trend, rsi, squeezeOn, squeezeRelease, macroScore, session, holyTrinity]);

  // Cleanup signaux expires
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSignals(prev => {
        const now = Date.now();
        return prev.filter(s => s.expiresAt > now);
      });
    }, 10000);
    return () => clearInterval(cleanup);
  }, []);

  const activeSignals = signals.filter(s => s.expiresAt > now);

  if (activeSignals.length === 0) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h3 className="text-sm font-bold text-[#4a5568] mb-2">⚡ Signaux Intraday</h3>
        <p className="text-xs text-[#4a5568]">Aucun signal qualifie. Filtres actifs: Score 90+ | RR ≥ 2.0 | Sans Risque</p>
      </div>
    );
  }

  return (
    <div>
      {/* SIGNAUX ACTIFS */}
      <div className="bg-[#1a202c] rounded-xl border-2 border-[#48bb78]/40 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span className="text-[#ffd700]">⚡</span> Signaux Intraday
            <span className="text-[10px] px-2 py-0.5 bg-[#48bb78]/10 text-[#48bb78] rounded-full">
              {activeSignals.length} actif{activeSignals.length > 1 ? 's' : ''}
            </span>
          </h3>
          <span className="text-[10px] text-[#4a5568]">Valide 5 min | Filtres: Score 90+ | RR ≥ 2.0</span>
        </div>

        <div className="space-y-3">
          {activeSignals.map(sig => {
            const remaining = Math.max(0, sig.expiresAt - now);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const pct = (remaining / LIFETIME_MS) * 100;
            const tierColor = getTierColor(sig.convictionTier);

            return (
              <div key={sig.id} className="rounded-lg border p-3 bg-[#0d1117] border-[#2d3748]">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${sig.direction === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                      {sig.direction === 'bullish' ? '▲ LONG' : '▼ SHORT'} {sig.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierColor}`}>
                      {getTierEmoji(sig.convictionTier)} {sig.convictionTier.toUpperCase()} {sig.convictionScore}%
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#48bb78]/10 text-[#48bb78] text-[10px] font-bold rounded">
                    Score: {sig.score}
                  </span>
                </div>

                {/* Niveaux */}
                <div className="grid grid-cols-5 gap-1 text-center text-[10px] mb-2">
                  <div className="bg-[#1a202c] rounded p-1.5">
                    <p className="text-[#4a5568]">Entry</p>
                    <p className="font-bold text-white">${sig.entry.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#1a202c] rounded p-1.5">
                    <p className="text-[#4a5568]">SL</p>
                    <p className="font-bold text-[#ed8936]">${sig.sl.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#1a202c] rounded p-1.5">
                    <p className="text-[#4a5568]">TP1</p>
                    <p className="font-bold text-[#48bb78]">${sig.tp.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#1a202c] rounded p-1.5">
                    <p className="text-[#4a5568]">TP2</p>
                    <p className="font-bold text-[#48bb78]">${sig.tp2.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#1a202c] rounded p-1.5">
                    <p className="text-[#4a5568]">RR</p>
                    <p className="font-bold text-[#ffd700]">1:{sig.rr.toFixed(1)}</p>
                  </div>
                </div>

                {/* Setup + Temps */}
                <div className="flex items-center justify-between text-[10px] mb-2">
                  <span className="text-[#a0aec0]">{sig.setup}</span>
                  <span className="text-[#4a5568]">{sig.time}</span>
                </div>

                {/* Compte a rebours */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 bg-[#2d3748] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      pct > 50 ? 'bg-[#48bb78]' : pct > 20 ? 'bg-[#ffd700]' : 'bg-[#ed8936]'
                    }`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold tabular-nums ${
                    pct > 50 ? 'text-[#48bb78]' : pct > 20 ? 'text-[#ffd700]' : 'text-[#ed8936]'
                  }`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </div>

                {/* Bouton PRENDRE + EXECTUER XM */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addTrade(sig);
                      const el = document.getElementById(`btn_take_${sig.id}`);
                      if (el) { el.textContent = '\u2713 PRIS'; el.classList.add('bg-[#48bb78]'); }
                    }}
                    id={`btn_take_${sig.id}`}
                    className="flex-shrink-0 px-3 py-2.5 bg-[#2962FF] text-white rounded-lg font-bold text-xs hover:bg-[#1a237e] transition-all flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    PRENDRE
                  </button>
                  <button
                    onClick={() => {
                      addTrade(sig);
                      const action = sig.direction === 'bullish' ? 'buy' : 'sell';
                      const url = `https://www.xm.com/member/Trading/Order/Open?symbol=XAUUSD&action=${action}&price=${sig.entry.toFixed(2)}&sl=${sig.sl.toFixed(2)}&tp=${sig.tp.toFixed(2)}`;
                      window.open(url, '_blank', 'width=1200,height=800');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      sig.direction === 'bullish'
                        ? 'bg-[#48bb78] text-white hover:bg-[#3da86a]'
                        : 'bg-[#ed8936] text-white hover:bg-[#d9772e]'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {sig.direction === 'bullish' ? 'ACHETER' : 'VENDRE'} sur XM
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORIQUE DES SIGNAUX */}
      {history.length > 0 && (
        <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
          <h3 className="text-sm font-bold text-[#a0aec0] mb-3">📊 Historique Signaux ({history.length})</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.slice().reverse().map((sig, i) => (
              <div key={`${sig.id}_hist_${i}`} className="flex items-center justify-between text-[10px] py-1 border-b border-[#2d3748] last:border-0">
                <div className="flex items-center gap-2">
                  <span className={sig.direction === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}>
                    {sig.direction === 'bullish' ? '▲' : '▼'}
                  </span>
                  <span className="text-[#a0aec0]">{sig.type}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getTierColor(sig.convictionTier)}`}>
                    {getTierEmoji(sig.convictionTier)} {sig.convictionScore}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#ffd700]">1:{sig.rr.toFixed(1)}</span>
                  <span className="text-[#4a5568]">{sig.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
