// ============================================================
// BACKTEST PANEL — Resultats 90 jours avec donnees reelles
// Affiche: Win Rate, P&L, Drawdown, Points d'amelioration
// ============================================================

import { useState, useEffect } from 'react';
import { BarChart3, Target, AlertTriangle, Trophy, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { runBacktest90Days, generateBacktestReportTxt } from '@/services/backtestEngine';
import type { BacktestReport, TradeResult } from '@/services/backtestEngine';

export function BacktestPanel() {
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'trades' | 'improvements'>('summary');

  useEffect(() => {
    runBacktest90Days()
      .then(r => setReport(r))
      .catch(err => console.error('[Backtest]', err))
      .finally(() => setLoading(false));
  }, []);

  const downloadReport = () => {
    if (!report) return;
    const txt = generateBacktestReportTxt(report);
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_90j_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
        <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#ffd700]" />
          Backtest 90 Jours — Calcul en cours...
          <span className="animate-pulse text-[10px] text-[#2962FF]">Simulating...</span>
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-[#2d3748]/30 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-[#1a202c] rounded-xl border border-[#ed8936]/30 p-4">
        <h3 className="text-sm font-bold text-[#ed8936] mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Erreur Backtest
        </h3>
        <p className="text-xs text-[#4a5568]">Impossible de charger les donnees pour le backtest.</p>
      </div>
    );
  }

  const grade = report.winRate >= 70 ? 'A+ (Excellent)' :
    report.winRate >= 60 ? 'A (Tres Bon)' :
    report.winRate >= 55 ? 'B (Bon)' :
    report.winRate >= 50 ? 'C (Moyen)' : 'D (A Ameliorer)';

  const gradeColor = report.winRate >= 70 ? 'text-[#48bb78]' :
    report.winRate >= 60 ? 'text-[#48bb78]' :
    report.winRate >= 55 ? 'text-[#ffd700]' :
    report.winRate >= 50 ? 'text-[#ed8936]' : 'text-[#ed8936]';

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#ffd700]" />
          Backtest 90 Jours
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${gradeColor} bg-current bg-opacity-10`}>
            {grade}
          </span>
        </h3>
        <button
          onClick={downloadReport}
          className="px-3 py-1.5 bg-[#2962FF] text-white rounded text-[10px] font-bold hover:bg-[#1a237e] transition-colors flex items-center gap-1"
        >
          <BarChart3 className="w-3 h-3" />
          Rapport Complet (.txt)
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-[#0d1117] rounded-lg p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Win Rate</p>
          <p className={`text-xl font-black ${report.winRate >= 60 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {report.winRate.toFixed(1)}%
          </p>
          <p className="text-[8px] text-[#4a5568]">{report.winningTrades}G / {report.losingTrades}P</p>
        </div>
        <div className="bg-[#0d1117] rounded-lg p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">P&L Total</p>
          <p className={`text-xl font-black ${report.totalPnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {report.totalPnl >= 0 ? '+' : ''}{report.totalPnl.toFixed(0)}$
          </p>
          <p className="text-[8px] text-[#4a5568]">{report.totalPnlPercent >= 0 ? '+' : ''}{report.totalPnlPercent.toFixed(1)}%</p>
        </div>
        <div className="bg-[#0d1117] rounded-lg p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Profit Factor</p>
          <p className={`text-xl font-black ${report.profitFactor >= 2 ? 'text-[#48bb78]' : report.profitFactor >= 1.5 ? 'text-[#ffd700]' : 'text-[#ed8936]'}`}>
            {report.profitFactor.toFixed(2)}
          </p>
          <p className="text-[8px] text-[#4a5568]">{report.profitFactor >= 2 ? 'Excellent' : 'OK'}</p>
        </div>
        <div className="bg-[#0d1117] rounded-lg p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Drawdown Max</p>
          <p className={`text-xl font-black ${report.maxDrawdownPercent < 5 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {report.maxDrawdownPercent.toFixed(1)}%
          </p>
          <p className="text-[8px] text-[#4a5568]">{report.maxDrawdown.toFixed(0)}$</p>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Sharpe Ratio</p>
          <p className="text-sm font-bold text-[#63b3ed]">{report.sharpeRatio.toFixed(2)}</p>
        </div>
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Serie Gagnante</p>
          <p className="text-sm font-bold text-[#48bb78]">{report.winningStreak} trades</p>
        </div>
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Serie Perdante</p>
          <p className="text-sm font-bold text-[#ed8936]">{report.losingStreak} trades</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { key: 'summary' as const, label: 'Resume' },
          { key: 'trades' as const, label: `Trades (${report.totalTrades})` },
          { key: 'improvements' as const, label: 'Ameliorations' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-colors ${
              activeTab === tab.key
                ? 'bg-[#2962FF] text-white'
                : 'bg-[#0d1117] text-[#4a5568] hover:text-[#a0aec0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Resume */}
      {activeTab === 'summary' && (
        <div className="space-y-3">
          {/* Monthly breakdown */}
          <div className="bg-[#0d1117] rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-[#a0aec0] mb-2">Performance Mensuelle</h4>
            <div className="space-y-1">
              {report.monthlyBreakdown.map((m: { month: string; trades: number; wins: number; pnl: number }) => {
                const wr = m.trades > 0 ? (m.wins / m.trades) * 100 : 0;
                return (
                  <div key={m.month} className="flex items-center justify-between text-[10px]">
                    <span className="text-[#4a5568]">{m.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-24 bg-[#2d3748] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${wr >= 60 ? 'bg-[#48bb78]' : 'bg-[#ed8936]'}`} style={{ width: `${Math.min(100, wr)}%` }} />
                      </div>
                      <span className="text-[#a0aec0] w-16">{m.trades} trades</span>
                      <span className={`font-bold w-16 ${m.pnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                        {m.pnl >= 0 ? '+' : ''}{m.pnl.toFixed(0)}$
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best/Worst */}
          <div className="grid grid-cols-2 gap-2">
            {report.bestTrade && (
              <div className="bg-[#48bb78]/5 rounded-lg p-3 border border-[#48bb78]/20">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy className="w-3 h-3 text-[#48bb78]" />
                  <span className="text-[9px] text-[#48bb78] font-bold">MEILLEUR TRADE</span>
                </div>
                <p className="text-xs text-[#a0aec0]">{report.bestTrade.date}</p>
                <p className="text-sm font-black text-[#48bb78]">+{report.bestTrade.pnl.toFixed(2)} $</p>
                <p className="text-[9px] text-[#4a5568]">{report.bestTrade.type} | Score {report.bestTrade.score}</p>
              </div>
            )}
            {report.worstTrade && (
              <div className="bg-[#ed8936]/5 rounded-lg p-3 border border-[#ed8936]/20">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-[#ed8936]" />
                  <span className="text-[9px] text-[#ed8936] font-bold">PIRE TRADE</span>
                </div>
                <p className="text-xs text-[#a0aec0]">{report.worstTrade.date}</p>
                <p className="text-sm font-black text-[#ed8936]">{report.worstTrade.pnl.toFixed(2)} $</p>
                <p className="text-[9px] text-[#4a5568]">{report.worstTrade.type} | Score {report.worstTrade.score}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Trades */}
      {activeTab === 'trades' && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {report.trades.slice().reverse().map((trade: TradeResult, i: number) => (
            <div key={`${trade.date}_${i}`} className={`flex items-center justify-between py-1.5 px-2 rounded text-[10px] border-b border-[#2d3748] last:border-0 ${
              trade.result === 'win' ? 'bg-[#48bb78]/5' : trade.result === 'loss' ? 'bg-[#ed8936]/5' : ''
            }`}>
              <div className="flex items-center gap-2">
                {trade.result === 'win' ? <ArrowUpRight className="w-3 h-3 text-[#48bb78]" /> :
                 trade.result === 'loss' ? <ArrowDownRight className="w-3 h-3 text-[#ed8936]" /> :
                 <Activity className="w-3 h-3 text-[#ffd700]" />}
                <span className={`${trade.direction === 'long' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                  {trade.direction === 'long' ? '▲' : '▼'}
                </span>
                <span className="text-[#a0aec0]">{trade.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffd700]">1:{trade.rr.toFixed(1)}</span>
                <span className={`font-bold ${trade.pnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(1)}$
                </span>
                <span className="text-[#4a5568]">{trade.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Ameliorations */}
      {activeTab === 'improvements' && (
        <div className="space-y-2">
          <div className="bg-[#ed8936]/5 rounded-lg p-3 border border-[#ed8936]/20">
            <h4 className="text-[10px] font-bold text-[#ed8936] mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Points d'Amelioration Identifies
            </h4>
            <div className="space-y-2">
              {report.improvementPoints.map((point: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-[10px]">
                  <span className="text-[#ed8936] font-bold flex-shrink-0">{i + 1}.</span>
                  <span className="text-[#a0aec0]">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#48bb78]/5 rounded-lg p-3 border border-[#48bb78]/20">
            <h4 className="text-[10px] font-bold text-[#48bb78] mb-2">Recommandations</h4>
            <div className="space-y-1 text-[10px] text-[#a0aec0]">
              <p>• Backtester sur 180 jours pour valider la robustesse</p>
              <p>• Tester sur donnees 2020-2023 (periode volatile)</p>
              <p>• Ajouter un filtre de volume minimum</p>
              <p>• Tester le systeme sur XAG/USD (argent)</p>
              <p>• Implementer un trailing stop sur les trades gagnants</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
