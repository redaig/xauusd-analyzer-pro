// ============================================================
// PANEL SWING PREMIUM — 3 meilleurs signaux de la semaine
// ============================================================

import { useState, useEffect } from 'react';
import { playPremiumAlert } from '@/services/audioAlert';

interface SwingSignal {
  id: string;
  day: string;
  type: string;
  direction: 'bullish' | 'bearish';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  rr: number;
  score: number;
  result: 'win' | 'loss' | 'open';
  pnl: number;
  date: string;
}

// Donnees demo - en production viendrait du backend
const SWING_SIGNALS: SwingSignal[] = [
  {
    id: 'sw1', day: 'Lundi', type: 'Golden Window + Squeeze',
    direction: 'bullish', entry: 4720.50, sl: 4705.00, tp1: 4750.00, tp2: 4780.00, tp3: 4810.00,
    rr: 3.5, score: 98, result: 'win', pnl: 29.50, date: '2026-05-05',
  },
  {
    id: 'sw2', day: 'Mercredi', type: 'Breakout Structure',
    direction: 'bullish', entry: 4695.00, sl: 4675.00, tp1: 4730.00, tp2: 4760.00, tp3: 4790.00,
    rr: 2.8, score: 95, result: 'win', pnl: 35.00, date: '2026-05-07',
  },
  {
    id: 'sw3', day: 'Vendredi', type: 'SMC Order Block + FVG',
    direction: 'bearish', entry: 4745.00, sl: 4765.00, tp1: 4710.00, tp2: 4680.00, tp3: 4650.00,
    rr: 2.3, score: 92, result: 'open', pnl: 0, date: '2026-05-09',
  },
];

export function SwingPremiumPanel() {
  const [signals] = useState<SwingSignal[]>(SWING_SIGNALS);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (!played && signals.filter(s => s.result === 'open').length > 0) {
      playPremiumAlert();
      setPlayed(true);
    }
  }, [signals, played]);

  const wins = signals.filter(s => s.result === 'win').length;
  const totalPnl = signals.reduce((sum, s) => sum + s.pnl, 0);

  return (
    <div className="bg-[#1a202c] rounded-xl border-2 border-[#ffd700]/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <span className="text-[#ffd700]">👑</span> Swing Premium
          <span className="text-[10px] px-2 py-0.5 bg-[#ffd700]/10 text-[#ffd700] rounded-full">Semaine</span>
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#48bb78] font-bold">{wins}/{signals.length} Gagnes</span>
          <span className={`font-bold ${totalPnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}$
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {signals.map((sig, idx) => (
          <div key={sig.id} className={`rounded-lg border p-3 ${
            sig.result === 'win' ? 'bg-[#48bb78]/5 border-[#48bb78]/20' :
            sig.result === 'loss' ? 'bg-[#ed8936]/5 border-[#ed8936]/20' :
            'bg-[#2962FF]/5 border-[#2962FF]/20'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#ffd700] font-black text-sm">#{idx + 1}</span>
                <span className={`text-xs font-black ${sig.direction === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                  {sig.direction === 'bullish' ? '▲ LONG' : '▼ SHORT'}
                </span>
                <span className="text-[10px] text-[#a0aec0]">{sig.day}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sig.result === 'win' ? 'bg-[#48bb78]/10 text-[#48bb78]' :
                sig.result === 'loss' ? 'bg-[#ed8936]/10 text-[#ed8936]' :
                'bg-[#2962FF]/10 text-[#63b3ed]'
              }`}>
                {sig.result === 'win' ? '✓ GAGNE' : sig.result === 'loss' ? '✗ PERDU' : '● EN COURS'}
              </span>
            </div>

            <p className="text-xs text-[#a0aec0] mb-2">{sig.type}</p>

            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
              <div className="bg-[#0d1117] rounded p-1">
                <p className="text-[#4a5568]">Entry</p>
                <p className="font-bold text-white">${sig.entry.toFixed(0)}</p>
              </div>
              <div className="bg-[#0d1117] rounded p-1">
                <p className="text-[#4a5568]">SL</p>
                <p className="font-bold text-[#ed8936]">${sig.sl.toFixed(0)}</p>
              </div>
              <div className="bg-[#0d1117] rounded p-1">
                <p className="text-[#4a5568]">TP1</p>
                <p className="font-bold text-[#48bb78]">${sig.tp1.toFixed(0)}</p>
              </div>
              <div className="bg-[#0d1117] rounded p-1">
                <p className="text-[#4a5568]">TP2</p>
                <p className="font-bold text-[#48bb78]">${sig.tp2.toFixed(0)}</p>
              </div>
              <div className="bg-[#0d1117] rounded p-1">
                <p className="text-[#4a5568]">TP3</p>
                <p className="font-bold text-[#48bb78]">${sig.tp3.toFixed(0)}</p>
              </div>
              <div className="bg-[#0d1117] rounded p-1">
                <p className="text-[#4a5568]">Score</p>
                <p className="font-bold text-[#ffd700]">{sig.score}</p>
              </div>
            </div>

            {sig.result === 'win' && (
              <p className="mt-1 text-[10px] text-[#48bb78] font-bold">+${sig.pnl.toFixed(2)} profit realise</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 bg-[#0d1117] rounded text-center">
        <p className="text-[10px] text-[#4a5568]">
          3 meilleurs signaux par semaine | Score minimum 90+ | Objectif 2/3 gagnants
        </p>
      </div>
    </div>
  );
}
