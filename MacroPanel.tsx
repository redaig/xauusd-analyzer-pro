// ============================================================
// PANEL ANALYSE MACRO
// ============================================================

interface MacroPanelProps {
  macro: any;
}

export function MacroPanel({ macro }: MacroPanelProps) {
  if (!macro) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h3 className="text-sm font-bold text-[#a0aec0] mb-2">Analyse Macro</h3>
        <p className="text-xs text-[#4a5568]">Chargement...</p>
      </div>
    );
  }

  const score = macro.score;

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
        <span>📈</span> Analyse Macro
      </h3>

      {/* Score global */}
      <div className="mb-3 p-3 bg-[#0d1117] rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#a0aec0]">Score Macro</span>
          <span className={`text-sm font-black ${score?.goldBias === 'buy' ? 'text-[#48bb78]' : score?.goldBias === 'sell' ? 'text-[#ed8936]' : 'text-[#ffd700]'}`}>
            {score?.totalScore}/100
          </span>
        </div>
        <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, score?.totalScore || 50)}%`,
              background: score?.goldBias === 'buy' ? '#48bb78' : score?.goldBias === 'sell' ? '#ed8936' : '#ffd700'
            }}
          />
        </div>
        <p className={`text-xs mt-1 font-bold ${score?.goldBias === 'buy' ? 'text-[#48bb78]' : score?.goldBias === 'sell' ? 'text-[#ed8936]' : 'text-[#ffd700]'}`}>
          {score?.goldBias === 'buy' ? 'Positif pour Gold' : score?.goldBias === 'sell' ? 'Negatif pour Gold' : 'Neutre'}
        </p>
      </div>

      {/* Facteurs */}
      <div className="space-y-2">
        {macro.factors?.map((f: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-[#a0aec0]">{f.name}</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${f.impact === 'positive' ? 'text-[#48bb78]' : f.impact === 'negative' ? 'text-[#ed8936]' : 'text-[#ffd700]'}`}>
                {f.impact === 'positive' ? '✓' : f.impact === 'negative' ? '✗' : '○'}
              </span>
              <span className="text-[#4a5568]">{f.desc}</span>
            </div>
          </div>
        )) || (
          <div className="space-y-2 text-xs text-[#4a5568]">
            <div className="flex justify-between"><span>DXY</span><span className="text-[#a0aec0]">97.99 — Dollar faible ✓</span></div>
            <div className="flex justify-between"><span>FED</span><span className="text-[#a0aec0]">5.5% — Taux eleves ✓</span></div>
            <div className="flex justify-between"><span>CPI</span><span className="text-[#a0aec0]">3.2% — Inflation moderee ○</span></div>
            <div className="flex justify-between"><span>NFP</span><span className="text-[#a0aec0]">275k — Emploi fort ✗</span></div>
            <div className="flex justify-between"><span>Geo</span><span className="text-[#a0aec0]">85/100 — Risque ELEVE ✓</span></div>
            <div className="flex justify-between"><span>US10Y</span><span className="text-[#a0aec0]">4.45% — Yields eleves ✓</span></div>
          </div>
        )}
      </div>

      {/* News danger */}
      {macro.newsDanger?.isDangerous && (
        <div className="mt-3 p-2 bg-[#ed8936]/10 rounded border border-[#ed8936]/30">
          <p className="text-xs text-[#ed8936] font-bold">⚠ {macro.newsDanger.reason}</p>
        </div>
      )}
    </div>
  );
}
