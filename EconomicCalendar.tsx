// ============================================================
// ECONOMIC CALENDAR — Donnees FRED API en temps reel
// Impact analyse sur XAU/USD
// ============================================================

import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle, Activity, DollarSign, Percent } from 'lucide-react';
import { useMacroData } from '@/hooks/useMacroData';

function ImpactBadge({ impact, strength }: { impact: 'bullish' | 'bearish' | 'neutral'; strength: number }) {
  if (impact === 'bullish') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#48bb78]/10 text-[#48bb78] border border-[#48bb78]/30 rounded text-[10px] font-bold">
        <TrendingUp className="w-3 h-3" />
        BULLISH ({strength}%)
      </span>
    );
  }
  if (impact === 'bearish') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ed8936]/10 text-[#ed8936] border border-[#ed8936]/30 rounded text-[10px] font-bold">
        <TrendingDown className="w-3 h-3" />
        BEARISH ({strength}%)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30 rounded text-[10px] font-bold">
      <Minus className="w-3 h-3" />
      NEUTRE
    </span>
  );
}

export function EconomicCalendar() {
  const { data, impacts, bias, isLoading, error, refresh } = useMacroData();

  if (isLoading) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ed8936]" />
          Calendrier Economique FRED
          <span className="animate-pulse text-[10px] text-[#2962FF]">Chargement...</span>
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[#2d3748]/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#ed8936]/30 p-4">
        <h3 className="text-sm font-bold text-[#ed8936] mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Erreur FRED API
        </h3>
        <p className="text-xs text-[#4a5568] mb-3">{error || 'Donnees non disponibles'}</p>
        <button
          onClick={refresh}
          className="px-3 py-1.5 bg-[#2962FF] text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-[#1a237e]"
        >
          <RefreshCw className="w-3 h-3" />
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec Biais Global */}
      <div className={`rounded-xl border p-4 ${
        bias.bias === 'bullish' ? 'bg-[#48bb78]/5 border-[#48bb78]/30' :
        bias.bias === 'bearish' ? 'bg-[#ed8936]/5 border-[#ed8936]/30' :
        'bg-[#ffd700]/5 border-[#ffd700]/30'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Activity className={`w-5 h-5 ${
              bias.bias === 'bullish' ? 'text-[#48bb78]' :
              bias.bias === 'bearish' ? 'text-[#ed8936]' : 'text-[#ffd700]'
            }`} />
            Fondamental FRED
            <ImpactBadge impact={bias.bias} strength={bias.strength} />
          </h3>
          <button
            onClick={refresh}
            className="p-1.5 rounded bg-[#0d1117] text-[#4a5568] hover:text-[#a0aec0] transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Biais Score */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2 bg-[#2d3748] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                bias.bias === 'bullish' ? 'bg-[#48bb78]' :
                bias.bias === 'bearish' ? 'bg-[#ed8936]' : 'bg-[#ffd700]'
              }`}
              style={{ width: `${bias.score}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${
            bias.bias === 'bullish' ? 'text-[#48bb78]' :
            bias.bias === 'bearish' ? 'text-[#ed8936]' : 'text-[#ffd700]'
          }`}>
            {bias.score}/100
          </span>
        </div>

        {/* KPIs rapides */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[9px] text-[#4a5568]">FED Rate</p>
            <p className="text-sm font-bold text-[#63b3ed]">{data.fedRate.toFixed(2)}%</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[9px] text-[#4a5568]">CPI YoY</p>
            <p className="text-sm font-bold text-[#ffd700]">{data.cpiYoY.toFixed(1)}%</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[9px] text-[#4a5568]">DXY</p>
            <p className="text-sm font-bold text-[#a0aec0]">{data.dxy.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Detail des indicateurs */}
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h4 className="text-[10px] font-bold text-[#4a5568] mb-3 uppercase">Indicateurs Detailles</h4>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Percent className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">Core CPI YoY</span>
            </div>
            <p className="text-sm font-bold text-white">{data.coreCpiYoY.toFixed(1)}%</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Percent className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">PPI YoY</span>
            </div>
            <p className="text-sm font-bold text-white">{data.ppiYoY.toFixed(1)}%</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">Chomage</span>
            </div>
            <p className="text-sm font-bold text-white">{data.unemployment.toFixed(1)}%</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">NFP Change</span>
            </div>
            <p className={`text-sm font-bold ${data.nfpChange >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
              {data.nfpChange >= 0 ? '+' : ''}{data.nfpChange}K
            </p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">US 10Y</span>
            </div>
            <p className="text-sm font-bold text-[#a0aec0]">{data.us10y.toFixed(2)}%</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">VIX</span>
            </div>
            <p className={`text-sm font-bold ${data.vix > 25 ? 'text-[#ed8936]' : 'text-[#48bb78]'}`}>{data.vix.toFixed(1)}</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">Retail Sales MoM</span>
            </div>
            <p className={`text-sm font-bold ${data.retailSalesMoM >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
              {data.retailSalesMoM >= 0 ? '+' : ''}{data.retailSalesMoM.toFixed(1)}%
            </p>
          </div>
          <div className="bg-[#0d1117] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[9px] text-[#4a5568]">Yield Curve</span>
            </div>
            <p className={`text-sm font-bold ${data.yieldCurve < 0 ? 'text-[#ed8936]' : 'text-[#48bb78]'}`}>
              {data.yieldCurve.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Date de mise a jour */}
        <p className="text-[9px] text-[#4a5568] text-center">
          FRED API — Actualise: {new Date(data.lastUpdated).toLocaleString('fr-FR')}
          {' '}
          (FED: {data.sources.fed}, CPI: {data.sources.cpi})
        </p>
      </div>

      {/* Analyse d'impact sur XAU/USD */}
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h4 className="text-[10px] font-bold text-[#4a5568] mb-3 uppercase">Impact sur XAU/USD</h4>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {impacts.map((imp, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#2d3748] last:border-0 text-[10px]">
              <div className="flex items-center gap-2">
                <ImpactBadge impact={imp.impact} strength={imp.impactStrength} />
                <span className="text-[#a0aec0]">{imp.factor}</span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-white font-bold">{imp.value}{imp.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
