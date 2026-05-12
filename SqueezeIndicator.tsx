// ============================================================
// SQUEEZE MOMENTUM (LAZYBEAR)
// ============================================================

interface SqueezeData {
  sqzOn: boolean;
  sqzOff: boolean;
  noSqz: boolean;
  momentum: number;
  val: number;
  signal: string;
  color: string;
}

interface SqueezeIndicatorProps {
  squeeze: SqueezeData | null;
}

export function SqueezeIndicator({ squeeze }: SqueezeIndicatorProps) {
  if (!squeeze) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h3 className="text-sm font-bold text-[#a0aec0] mb-2">Squeeze Momentum</h3>
        <p className="text-xs text-[#4a5568]">Chargement...</p>
      </div>
    );
  }

  const isRelease = squeeze.sqzOff;
  const isSqueeze = squeeze.sqzOn;
  const momentumUp = squeeze.momentum > 0;

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
        <span className="text-[#63b3ed]">📊</span> Squeeze Momentum (LazyBear)
      </h3>

      {/* Status */}
      <div className="mb-3 p-3 bg-[#0d1117] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#a0aec0]">Status</span>
          <span className={`text-sm font-black ${isRelease ? 'text-[#48bb78]' : isSqueeze ? 'text-[#ed8936]' : 'text-[#ffd700]'}`}>
            {squeeze.signal}
          </span>
        </div>
        <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.abs(squeeze.momentum) * 2)}%`,
              background: squeeze.color,
              marginLeft: momentumUp ? '50%' : `${50 - Math.min(50, Math.abs(squeeze.momentum))}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#ed8936]">Bearish</span>
          <span className="text-[10px] text-[#ffd700]">0</span>
          <span className="text-[10px] text-[#48bb78]">Bullish</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Momentum</span>
          <span className={`font-bold ${momentumUp ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {squeeze.momentum > 0 ? '+' : ''}{squeeze.momentum.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Squeeze</span>
          <span className={`font-bold ${isSqueeze ? 'text-[#ed8936]' : 'text-[#48bb78]'}`}>
            {isSqueeze ? 'ON (Compression)' : 'OFF'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Release</span>
          <span className={`font-bold ${isRelease ? 'text-[#48bb78]' : 'text-[#4a5568]'}`}>
            {isRelease ? 'RELEASE!' : 'Attente'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Signal</span>
          <span className="font-bold text-[#ffd700]">{squeeze.signal}</span>
        </div>
      </div>

      {/* Alert */}
      {isRelease && (
        <div className="mt-3 p-2 bg-[#48bb78]/10 rounded border border-[#48bb78]/30">
          <p className="text-xs text-[#48bb78] font-bold">
            {momentumUp ? '🚀 RELEASE HAUSSIER! Momentum explosif bullish' : '💥 RELEASE BAISSIER! Momentum explosif bearish'}
          </p>
        </div>
      )}
      {isSqueeze && !isRelease && (
        <div className="mt-3 p-2 bg-[#ffd700]/10 rounded border border-[#ffd700]/30">
          <p className="text-xs text-[#ffd700] font-bold">⚡ Compression en cours — Preparez-vous pour le breakout</p>
        </div>
      )}
    </div>
  );
}
