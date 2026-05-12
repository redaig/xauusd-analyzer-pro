// ============================================================
// PANEL INDICATEURS TECHNIQUES
// ============================================================

interface TechPanelProps {
  indicators: {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    bollingerBands: { upper: number; middle: number; lower: number };
    ema20: number;
    ema50: number;
    ema200: number;
    atr: number;
    stochastic: { k: number; d: number };
    cci: number;
    williamsR: number;
    volumeSMA: number;
  } | null;
  trend: string;
  trendStrength: number;
  currentPrice: number;
}

export function TechPanel({ indicators, trend, trendStrength, currentPrice }: TechPanelProps) {
  if (!indicators) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h3 className="text-sm font-bold text-[#a0aec0] mb-2">Indicateurs Techniques</h3>
        <p className="text-xs text-[#4a5568]">Chargement...</p>
      </div>
    );
  }

  const i = indicators;

  const getTrendColor = () => {
    if (trend === 'bullish') return 'text-[#48bb78]';
    if (trend === 'bearish') return 'text-[#ed8936]';
    return 'text-[#ffd700]';
  };

  const getTrendLabel = () => {
    if (trend === 'bullish') return 'BULLISH';
    if (trend === 'bearish') return 'BEARISH';
    return 'NEUTRE';
  };

  const getRsiColor = (v: number) => v > 70 ? 'text-[#ed8936]' : v < 30 ? 'text-[#48bb78]' : 'text-[#a0aec0]';
  const getRsiLabel = (v: number) => v > 70 ? 'Surachete' : v < 30 ? 'Survendu' : 'Neutre';

  const aboveEMA20 = currentPrice > i.ema20;
  const aboveEMA50 = currentPrice > i.ema50;
  const aboveEMA200 = currentPrice > i.ema200;

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
        <span className="text-[#63b3ed]">📉</span> Indicateurs Techniques
      </h3>

      {/* Trend */}
      <div className="mb-3 p-3 bg-[#0d1117] rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#a0aec0]">Trend H4</span>
          <span className={`text-sm font-black ${getTrendColor()}`}>{getTrendLabel()}</span>
        </div>
        <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${trendStrength}%`,
              background: trend === 'bullish' ? '#48bb78' : trend === 'bearish' ? '#ed8936' : '#ffd700',
            }}
          />
        </div>
        <p className="text-[10px] text-[#4a5568] mt-1">Force: {trendStrength}/100</p>
      </div>

      {/* EMAs */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'EMA 20', value: i.ema20, above: aboveEMA20 },
          { label: 'EMA 50', value: i.ema50, above: aboveEMA50 },
          { label: 'EMA 200', value: i.ema200, above: aboveEMA200 },
        ].map((ema, idx) => (
          <div key={idx} className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[10px] text-[#4a5568]">{ema.label}</p>
            <p className="text-xs font-bold text-white">${ema.value.toFixed(2)}</p>
            <p className={`text-[10px] font-bold ${ema.above ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
              {ema.above ? 'Above' : 'Below'}
            </p>
          </div>
        ))}
      </div>

      {/* RSI */}
      <div className="mb-3 p-2 bg-[#0d1117] rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#a0aec0]">RSI (14)</span>
          <span className={`text-xs font-bold ${getRsiColor(i.rsi)}`}>{i.rsi.toFixed(1)} — {getRsiLabel(i.rsi)}</span>
        </div>
        <div className="h-2 bg-[#2d3748] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, i.rsi))}%`,
              background: i.rsi > 70 ? '#ed8936' : i.rsi < 30 ? '#48bb78' : '#63b3ed',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#4a5568] mt-0.5">
          <span>0</span><span>30</span><span>50</span><span>70</span><span>100</span>
        </div>
      </div>

      {/* MACD */}
      <div className="mb-3 p-2 bg-[#0d1117] rounded">
        <p className="text-[10px] text-[#4a5568] mb-1">MACD</p>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-[10px] text-[#4a5568]">MACD</p>
            <p className={`text-xs font-bold ${i.macd.macd > 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>{i.macd.macd.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#4a5568]">Signal</p>
            <p className="text-xs font-bold text-[#a0aec0]">{i.macd.signal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#4a5568]">Histogram</p>
            <p className={`text-xs font-bold ${i.macd.histogram > 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>{i.macd.histogram > 0 ? '+' : ''}{i.macd.histogram.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Bollinger */}
      <div className="mb-3 p-2 bg-[#0d1117] rounded">
        <p className="text-[10px] text-[#4a5568] mb-1">Bollinger Bands (20,2)</p>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-[10px] text-[#4a5568]">Upper</p>
            <p className="text-xs font-bold text-[#48bb78]">${i.bollingerBands.upper.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#4a5568]">Middle</p>
            <p className="text-xs font-bold text-[#a0aec0]">${i.bollingerBands.middle.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#4a5568]">Lower</p>
            <p className="text-xs font-bold text-[#ed8936]">${i.bollingerBands.lower.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Other indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#0d1117] rounded p-2 flex justify-between">
          <span className="text-[#4a5568]">ATR (14)</span>
          <span className="font-bold text-[#a0aec0]">${i.atr.toFixed(2)}</span>
        </div>
        <div className="bg-[#0d1117] rounded p-2 flex justify-between">
          <span className="text-[#4a5568]">Stoch K</span>
          <span className="font-bold text-[#a0aec0]">{i.stochastic.k.toFixed(1)}</span>
        </div>
        <div className="bg-[#0d1117] rounded p-2 flex justify-between">
          <span className="text-[#4a5568]">CCI</span>
          <span className={`font-bold ${i.cci > 100 ? 'text-[#ed8936]' : i.cci < -100 ? 'text-[#48bb78]' : 'text-[#a0aec0]'}`}>{i.cci.toFixed(1)}</span>
        </div>
        <div className="bg-[#0d1117] rounded p-2 flex justify-between">
          <span className="text-[#4a5568]">Williams %R</span>
          <span className={`font-bold ${i.williamsR < -80 ? 'text-[#48bb78]' : i.williamsR > -20 ? 'text-[#ed8936]' : 'text-[#a0aec0]'}`}>{i.williamsR.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
