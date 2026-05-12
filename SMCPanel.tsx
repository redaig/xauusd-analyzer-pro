// ============================================================
// SMC/ICT PANEL — Order Blocks, FVG, BOS, Liquidity
// ============================================================

interface SMCPanelProps {
  orderBlocks: any[];
  fvgs: any[];
  liquidityPools: any[];
  marketStructure: { structure: string; signals: any[] } | null;
  keyLevels: { support: number[]; resistance: number[] };
}

export function SMCPanel({ orderBlocks, fvgs, liquidityPools, marketStructure, keyLevels }: SMCPanelProps) {
  const getStructureColor = (s: string) => {
    if (s?.includes('Bullish')) return 'text-[#48bb78]';
    if (s?.includes('Bearish')) return 'text-[#ed8936]';
    return 'text-[#ffd700]';
  };

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
        <span className="text-[#63b3ed]">🎯</span> SMC/ICT Analysis
      </h3>

      {/* Market Structure */}
      <div className="mb-3 p-3 bg-[#0d1117] rounded-lg">
        <p className="text-[10px] text-[#4a5568] mb-1">Structure Marche</p>
        <p className={`text-sm font-black ${getStructureColor(marketStructure?.structure || '')}`}>
          {marketStructure?.structure || 'Analyse...'}
        </p>
        {marketStructure && marketStructure.signals.length > 0 && (
          <div className="mt-2 space-y-1">
            {marketStructure.signals.slice(0, 3).map((sig: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span className={`font-bold ${sig.direction === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                  {sig.type} {sig.direction === 'bullish' ? '▲' : '▼'}
                </span>
                <span className="text-[#a0aec0]">${sig.price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Levels */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Support */}
        <div className="bg-[#0d1117] rounded p-2">
          <p className="text-[10px] text-[#48bb78] font-bold mb-1">Supports</p>
          {keyLevels.support.slice(0, 3).map((s, i) => (
            <p key={i} className="text-xs text-[#a0aec0] font-mono">${s.toFixed(2)}</p>
          ))}
          {keyLevels.support.length === 0 && <p className="text-[10px] text-[#4a5568]">Aucun</p>}
        </div>
        {/* Resistance */}
        <div className="bg-[#0d1117] rounded p-2">
          <p className="text-[10px] text-[#ed8936] font-bold mb-1">Resistances</p>
          {keyLevels.resistance.slice(0, 3).map((r, i) => (
            <p key={i} className="text-xs text-[#a0aec0] font-mono">${r.toFixed(2)}</p>
          ))}
          {keyLevels.resistance.length === 0 && <p className="text-[10px] text-[#4a5568]">Aucun</p>}
        </div>
      </div>

      {/* Order Blocks */}
      <div className="mb-3">
        <p className="text-[10px] text-[#4a5568] mb-1 font-bold">Order Blocks ({orderBlocks.length})</p>
        {orderBlocks.length === 0 ? (
          <p className="text-[10px] text-[#4a5568] bg-[#0d1117] rounded p-2">Aucun OB detecte</p>
        ) : (
          <div className="space-y-1">
            {orderBlocks.slice(0, 3).map((ob, i) => (
              <div key={i} className={`flex items-center justify-between text-[10px] px-2 py-1 rounded ${ob.type === 'bullish' ? 'bg-[#48bb78]/5' : 'bg-[#ed8936]/5'}`}>
                <span className={`font-bold ${ob.type === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                  {ob.type === 'bullish' ? 'Bull OB' : 'Bear OB'}
                </span>
                <span className="text-[#a0aec0]">${ob.price?.toFixed(2)}</span>
                <span className="text-[#4a5568]">Force: {ob.strength}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FVGs */}
      <div className="mb-3">
        <p className="text-[10px] text-[#4a5568] mb-1 font-bold">Fair Value Gaps ({fvgs.length})</p>
        {fvgs.length === 0 ? (
          <p className="text-[10px] text-[#4a5568] bg-[#0d1117] rounded p-2">Aucun FVG detecte</p>
        ) : (
          <div className="space-y-1">
            {fvgs.slice(0, 3).map((fvg, i) => (
              <div key={i} className={`flex items-center justify-between text-[10px] px-2 py-1 rounded ${fvg.type === 'bullish' ? 'bg-[#48bb78]/5' : 'bg-[#ed8936]/5'}`}>
                <span className={`font-bold ${fvg.type === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                  {fvg.type === 'bullish' ? 'Bull FVG' : 'Bear FVG'}
                </span>
                <span className="text-[#a0aec0]">${fvg.low?.toFixed(2)} - ${fvg.high?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liquidity Pools */}
      <div>
        <p className="text-[10px] text-[#4a5568] mb-1 font-bold">Liquidity Pools ({liquidityPools.length})</p>
        {liquidityPools.length === 0 ? (
          <p className="text-[10px] text-[#4a5568] bg-[#0d1117] rounded p-2">Aucune liquidity detectee</p>
        ) : (
          <div className="space-y-1">
            {liquidityPools.slice(0, 3).map((lp, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] px-2 py-1 rounded bg-[#0d1117]">
                <span className={`font-bold ${lp.type === 'high' ? 'text-[#ed8936]' : 'text-[#48bb78]'}`}>
                  {lp.type === 'high' ? 'Sell Liquidity' : 'Buy Liquidity'}
                </span>
                <span className="text-[#a0aec0]">${lp.price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
