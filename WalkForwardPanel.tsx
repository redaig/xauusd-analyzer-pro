// ============================================================
// WALK-FORWARD PANEL — Backtest temps reel
// Recalcule les parametres optimaux chaque semaine
// ============================================================

import { useState, useEffect } from 'react';
import { Activity, Target, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { runWalkForward } from '@/services/walkForward';
import type { WalkForwardResult } from '@/services/walkForward';

interface WalkForwardPanelProps {
  data: { timestamp: number; close: number; volume: number }[];
}

export function WalkForwardPanel({ data }: WalkForwardPanelProps) {
  const [results, setResults] = useState<WalkForwardResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data.length < 30) {
      setLoading(false);
      return;
    }

    // Convertir les donnees pour le walk-forward
    const priceData = data.map((d, i, arr) => ({
      timestamp: d.timestamp,
      open: i > 0 ? arr[i - 1].close : d.close,
      high: Math.max(d.close, i > 0 ? arr[i - 1].close : d.close) + Math.random() * 10,
      low: Math.min(d.close, i > 0 ? arr[i - 1].close : d.close) - Math.random() * 10,
      close: d.close,
      volume: d.volume || 10000,
    }));

    const res = runWalkForward(priceData);
    setResults(res);
    setLoading(false);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#2962FF] animate-pulse" />
          <span className="text-sm font-bold text-[#a0aec0]">Walk-Forward Backtest</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-[#2d3748]/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-[#2962FF]" />
          <span className="text-sm font-bold text-[#a0aec0]">Walk-Forward Backtest</span>
        </div>
        <p className="text-[10px] text-[#4a5568]">Donnees insuffisantes. Minimum 30 periodes requises.</p>
      </div>
    );
  }

  // Latest result
  const latest = results[results.length - 1];

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#a0aec0] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2962FF]" />
          Walk-Forward Backtest
          <span className="text-[9px] px-1.5 py-0.5 bg-[#2962FF]/10 text-[#63b3ed] rounded">TEMPS REEL</span>
        </h3>
        <span className="text-[9px] text-[#4a5568]">3 periodes x 10 jours</span>
      </div>

      {/* Parametres optimaux actuels */}
      <div className={`rounded-lg p-3 mb-3 ${
        latest.winRate >= 60 ? 'bg-[#48bb78]/5 border border-[#48bb78]/20' :
        latest.winRate >= 50 ? 'bg-[#ffd700]/5 border border-[#ffd700]/20' :
        'bg-[#ed8936]/5 border border-[#ed8936]/20'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#4a5568]">Parametres Optimaux ({latest.period})</span>
          <span className={`text-[10px] font-bold ${
            latest.winRate >= 60 ? 'text-[#48bb78]' :
            latest.winRate >= 50 ? 'text-[#ffd700]' : 'text-[#ed8936]'
          }`}>
            {latest.recommendation}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[8px] text-[#4a5568]">Score Min</p>
            <p className="text-sm font-bold text-[#63b3ed]">{latest.optimalScore}</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[8px] text-[#4a5568]">RR Min</p>
            <p className="text-sm font-bold text-[#ffd700]">1:{latest.optimalRR.toFixed(1)}</p>
          </div>
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[8px] text-[#4a5568]">Win Rate</p>
            <p className={`text-sm font-bold ${latest.winRate >= 60 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
              {latest.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-[#0d1117] rounded p-2 text-center">
            <p className="text-[8px] text-[#4a5568]">Profit Fact</p>
            <p className={`text-sm font-bold ${latest.profitFactor >= 2 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
              {latest.profitFactor.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="space-y-1">
        {results.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#2d3748] last:border-0 text-[10px]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-[#4a5568]" />
              <span className="text-[#a0aec0]">{r.period}</span>
              <span className="px-1.5 py-0.5 bg-[#0d1117] text-[#63b3ed] rounded text-[8px]">
                S≥{r.optimalScore} RR≥{r.optimalRR.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={r.winRate >= 60 ? 'text-[#48bb78]' : 'text-[#ed8936]'}>
                {r.winRate.toFixed(0)}% WR
              </span>
              <span className={r.profitFactor >= 2 ? 'text-[#48bb78]' : 'text-[#ed8936]'}>
                PF {r.profitFactor.toFixed(1)}
              </span>
              <span className={r.totalPnL >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}>
                {r.totalPnL >= 0 ? '+' : ''}{r.totalPnL.toFixed(0)}$
              </span>
              <span className="text-[#4a5568]">{r.totalTrades}T</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommandation */}
      <div className="mt-3 bg-[#0d1117] rounded p-2">
        <div className="flex items-center gap-1 mb-1">
          {latest.winRate >= 60 ? <CheckCircle className="w-3 h-3 text-[#48bb78]" /> :
           latest.winRate >= 50 ? <Target className="w-3 h-3 text-[#ffd700]" /> :
           <AlertTriangle className="w-3 h-3 text-[#ed8936]" />}
          <span className="text-[9px] font-bold text-[#a0aec0]">Recommandation Systeme</span>
        </div>
        <p className="text-[10px] text-[#a0aec0]">{latest.recommendation}</p>
        <p className="text-[9px] text-[#4a5568] mt-1">
          Score minimum: {latest.optimalScore} | RR minimum: 1:{latest.optimalRR.toFixed(1)} | 
          Trades: {latest.totalTrades} | P&L: ${latest.totalPnL.toFixed(2)} | DD: ${latest.maxDrawdown.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
