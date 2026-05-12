// ============================================================
// SIGNAUX QUALITE — 14 Filtres + 5 Filtres Avances
// ============================================================

interface QualitySignal {
  id: string;
  type: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  riskRewardRatio: number;
  confidence: number;
  indicators: string[];
  quality: {
    filtersPassed: number;
    totalFilters: number;
    score: number;
    status: string;
    confluences: string[];
    warnings: string[];
    macroAligned: boolean;
    macroReason: string;
    sessionValid: boolean;
    rrValid: boolean;
    trendValid: boolean;
    holyTrinityScore: number;
    goldenWindow: string;
    diamondLevel: string;
    autoCutStatus: string;
    smartATR: string;
    isPremium: boolean;
    isDiamond: boolean;
  };
}

interface QualitySignalsProps {
  signals: QualitySignal[];
  isLoading: boolean;
}

const FILTERS = [
  'Confiance >= 85%',
  'R/R >= 1:2.5',
  'Trend H4 aligne',
  'Session active',
  'Stop Loss 1.5-3x ATR',
  'Limit distance < 2x ATR',
  'Volume suffisant',
  'News filter',
  'M15 confirmation',
  'Wick size',
  'Win Rate > 65%',
  'Confluence >= 3',
  'Anti-contre-tendance',
  'Macro aligne',
];

export function QualitySignals({ signals, isLoading }: QualitySignalsProps) {
  const getDirColor = (dir: string) => {
    if (dir === 'bullish') return 'text-[#48bb78]';
    if (dir === 'bearish') return 'text-[#ed8936]';
    return 'text-[#ffd700]';
  };

  const confirmedSignals = signals.filter(s => s.quality.status === 'confirmed');
  const formingSignals = signals.filter(s => s.quality.status === 'forming');

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#a0aec0] flex items-center gap-2">
          <span className="text-[#48bb78]">✓</span> Filtres Qualite (14 filtres)
        </h3>
        {isLoading && <span className="text-xs text-[#ffd700] animate-pulse">Analyse...</span>}
      </div>

      {/* 14 Filters Grid */}
      <div className="grid grid-cols-2 gap-1 mb-3">
        {FILTERS.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] bg-[#0d1117] rounded px-2 py-1">
            <span className="text-[#48bb78]">✓</span>
            <span className="text-[#a0aec0]">{f}</span>
          </div>
        ))}
      </div>

      {/* 5 Advanced Filters */}
      <div className="grid grid-cols-5 gap-1 mb-3 text-center">
        {[
          { label: 'Holy Trinity', color: 'text-[#48bb78]', desc: 'Macro+H4+H1' },
          { label: 'Golden Window', color: 'text-[#ffd700]', desc: '13h-16h' },
          { label: 'Auto-Cut', color: 'text-[#ed8936]', desc: 'WR>65%' },
          { label: 'Diamond', color: 'text-purple-400', desc: '115+' },
          { label: 'Smart ATR', color: 'text-[#63b3ed]', desc: 'SL dyn' },
        ].map((f, i) => (
          <div key={i} className="bg-[#0d1117] rounded p-1">
            <span className={`text-[10px] font-bold ${f.color}`}>{f.label}</span>
            <br />
            <span className="text-[9px] text-[#4a5568]">{f.desc}</span>
          </div>
        ))}
      </div>

      {/* Signals */}
      {signals.length === 0 ? (
        <div className="bg-[#0d1117] rounded p-4 text-center">
          <p className="text-xs text-[#4a5568]">Aucun signal qualifie pour le moment</p>
          <p className="text-[10px] text-[#4a5568] mt-1">Analyse en cours — patience...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Confirmed */}
          {confirmedSignals.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#48bb78] mb-1">CONFIRMES ({confirmedSignals.length})</p>
              {confirmedSignals.map(s => (
                <div key={s.id} className="bg-[#48bb78]/5 rounded border border-[#48bb78]/20 p-2 mb-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${getDirColor(s.direction)}`}>
                      {s.direction === 'bullish' ? '▲' : '▼'} {s.type}
                    </span>
                    <span className="text-[10px] text-[#48bb78] font-bold">{s.quality.filtersPassed}/{s.quality.totalFilters} ✓</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#a0aec0] mt-1">
                    <span>Entry: ${s.entryPrice.toFixed(2)}</span>
                    <span>SL: ${s.stopLoss.toFixed(2)}</span>
                    <span>TP: ${s.takeProfit1.toFixed(2)}</span>
                    <span className="text-[#ffd700]">RR 1:{s.riskRewardRatio.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Forming */}
          {formingSignals.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#ffd700] mb-1">FORMATION ({formingSignals.length})</p>
              {formingSignals.map(s => (
                <div key={s.id} className="bg-[#ffd700]/5 rounded border border-[#ffd700]/20 p-2 mb-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${getDirColor(s.direction)}`}>
                      {s.direction === 'bullish' ? '▲' : '▼'} {s.type}
                    </span>
                    <span className="text-[10px] text-[#ffd700] font-bold">{s.quality.filtersPassed}/{s.quality.totalFilters} — {s.quality.score}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#a0aec0] mt-1">
                    <span>Entry: ${s.entryPrice.toFixed(2)}</span>
                    <span className="text-[#ffd700]">RR 1:{s.riskRewardRatio.toFixed(1)}</span>
                  </div>
                  {s.quality.warnings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.quality.warnings.slice(0, 3).map((w, i) => (
                        <span key={i} className="text-[9px] text-[#ed8936]">⚠ {w}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
        <div className="bg-[#0d1117] rounded p-1">
          <p className="text-[#4a5568]">Confirmes</p>
          <p className="font-bold text-[#48bb78]">{confirmedSignals.length}</p>
        </div>
        <div className="bg-[#0d1117] rounded p-1">
          <p className="text-[#4a5568]">Formation</p>
          <p className="font-bold text-[#ffd700]">{formingSignals.length}</p>
        </div>
        <div className="bg-[#0d1117] rounded p-1">
          <p className="text-[#4a5568]">Premium</p>
          <p className="font-bold text-[#63b3ed]">{signals.filter(s => s.quality.isPremium).length}</p>
        </div>
        <div className="bg-[#0d1117] rounded p-1">
          <p className="text-[#4a5568]">Diamond</p>
          <p className="font-bold text-purple-400">{signals.filter(s => s.quality.isDiamond).length}</p>
        </div>
      </div>
    </div>
  );
}
