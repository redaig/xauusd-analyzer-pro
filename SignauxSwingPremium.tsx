// ============================================================
// SIGNAUX SWING PREMIUM
// 3 meilleurs signaux confirmes
// ============================================================

interface PremiumSignal {
  id: string;
  signal: {
    type: string;
    direction: 'bullish' | 'bearish' | 'neutral';
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    takeProfit3: number;
    riskRewardRatio: number;
    confidence: number;
    description: string;
    indicators: string[];
    quality: {
      score: number;
      diamondLevel: string;
      holyTrinityScore: number;
      goldenWindow: string;
      macroAligned: boolean;
      autoCutStatus: string;
      smartATR: string;
      confluences: string[];
    };
  };
}

interface SignauxSwingPremiumProps {
  signals: PremiumSignal[];
  confirmedCount: number;
  formingCount: number;
}

export function SignauxSwingPremium({ signals, confirmedCount, formingCount }: SignauxSwingPremiumProps) {
  const getDirColor = (dir: string) => {
    if (dir === 'bullish') return 'text-[#48bb78]';
    if (dir === 'bearish') return 'text-[#ed8936]';
    return 'text-[#ffd700]';
  };

  const getDirBg = (dir: string) => {
    if (dir === 'bullish') return 'bg-[#48bb78]/10 border-[#48bb78]/30';
    if (dir === 'bearish') return 'bg-[#ed8936]/10 border-[#ed8936]/30';
    return 'bg-[#ffd700]/10 border-[#ffd700]/30';
  };

  const getLevelColor = (level: string) => {
    if (level === 'DIAMOND') return 'text-purple-400';
    if (level === 'PREMIUM') return 'text-[#ffd700]';
    return 'text-[#63b3ed]';
  };

  const displaySignals = signals.length > 0 ? signals : [];

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#ffd700]/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <span className="text-[#ffd700]">👑</span> Signaux Swing Premium
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 bg-[#48bb78]/10 rounded text-[#48bb78] font-bold">
            {confirmedCount} confirme{confirmedCount > 1 ? 's' : ''}
          </span>
          <span className="px-2 py-1 bg-[#ffd700]/10 rounded text-[#ffd700] font-bold">
            {formingCount} formation
          </span>
        </div>
      </div>

      {displaySignals.length === 0 ? (
        <div className="bg-[#0d1117] rounded-lg p-8 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-[#a0aec0] font-bold mb-1">Analyse en cours...</p>
          <p className="text-xs text-[#4a5568]">2 signaux max par session — 9/10 reussite</p>
          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[10px]">
            {[
              { c: 'text-[#48bb78]', l: 'Holy Trinity', s: 'Macro+H4+H1' },
              { c: 'text-[#ffd700]', l: 'Golden Window', s: '13h-16h GMT' },
              { c: 'text-[#ed8936]', l: 'Auto-Cut', s: 'WR>65%' },
              { c: 'text-purple-400', l: 'Diamond 115+', s: 'Premium' },
              { c: 'text-[#63b3ed]', l: 'Smart ATR', s: 'SL dynamique' },
            ].map((f, i) => (
              <div key={i} className="bg-[#1a202c] rounded p-1">
                <span className={`${f.c} font-bold`}>{f.l}</span>
                <br />
                <span className="text-[#4a5568]">{f.s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displaySignals.map((s, idx) => (
            <div key={s.id} className={`rounded-lg border p-3 ${getDirBg(s.signal.direction)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black ${getDirColor(s.signal.direction)}`}>
                    {s.signal.direction === 'bullish' ? '▲ LONG' : s.signal.direction === 'bearish' ? '▼ SHORT' : '● NEUTRE'}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getLevelColor(s.signal.quality.diamondLevel)} bg-[#0d1117]`}>
                    {s.signal.quality.diamondLevel}
                  </span>
                </div>
                <span className="text-xs text-[#4a5568]">#{idx + 1}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                <div className="bg-[#0d1117] rounded p-2">
                  <p className="text-[#4a5568]">Entry</p>
                  <p className="font-bold text-white">${s.signal.entryPrice.toFixed(2)}</p>
                </div>
                <div className="bg-[#0d1117] rounded p-2">
                  <p className="text-[#4a5568]">Stop Loss</p>
                  <p className="font-bold text-[#ed8936]">${s.signal.stopLoss.toFixed(2)}</p>
                </div>
                <div className="bg-[#0d1117] rounded p-2">
                  <p className="text-[#4a5568]">Take Profit</p>
                  <p className="font-bold text-[#48bb78]">${s.signal.takeProfit1.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2 text-[10px]">
                <div className="bg-[#0d1117] rounded p-1.5 text-center">
                  <p className="text-[#4a5568]">RR</p>
                  <p className="font-bold text-[#ffd700]">1:{s.signal.riskRewardRatio.toFixed(1)}</p>
                </div>
                <div className="bg-[#0d1117] rounded p-1.5 text-center">
                  <p className="text-[#4a5568]">Confiance</p>
                  <p className="font-bold text-[#63b3ed]">{s.signal.confidence}%</p>
                </div>
                <div className="bg-[#0d1117] rounded p-1.5 text-center">
                  <p className="text-[#4a5568]">Score</p>
                  <p className="font-bold text-[#48bb78]">{s.signal.quality.score}/100</p>
                </div>
                <div className="bg-[#0d1117] rounded p-1.5 text-center">
                  <p className="text-[#4a5568]">Holy Trinity</p>
                  <p className="font-bold text-[#ffd700]">{s.signal.quality.holyTrinityScore}/30</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {s.signal.indicators.slice(0, 6).map((ind, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-[#0d1117] rounded text-[10px] text-[#a0aec0]">{ind}</span>
                ))}
              </div>

              <p className="text-[10px] text-[#a0aec0] mb-1">{s.signal.description}</p>

              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 bg-[#2962FF]/10 rounded text-[#63b3ed]">{s.signal.quality.goldenWindow}</span>
                <span className={`px-1.5 py-0.5 rounded ${s.signal.quality.macroAligned ? 'bg-[#48bb78]/10 text-[#48bb78]' : 'bg-[#ed8936]/10 text-[#ed8936]'}`}>
                  Macro {s.signal.quality.macroAligned ? '✓' : '✗'}
                </span>
                <span className="px-1.5 py-0.5 bg-[#0d1117] rounded text-[#4a5568]">{s.signal.quality.autoCutStatus}</span>
                <span className="px-1.5 py-0.5 bg-[#0d1117] rounded text-[#4a5568]">{s.signal.quality.smartATR}</span>
              </div>

              {s.signal.quality.confluences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.signal.quality.confluences.map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#48bb78]/10 rounded text-[10px] text-[#48bb78]">{c}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 p-2 bg-[#0d1117] rounded text-center">
        <p className="text-[10px] text-[#4a5568]">
          Max 2 signaux confirmes par session | Objectif 9/10 | Diamond Score 115+
        </p>
      </div>
    </div>
  );
}
