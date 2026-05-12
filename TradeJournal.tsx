// ============================================================
// TRADE JOURNAL — Suivi des trades pris
// Checkbox "PRIS" → Suivi EN COURS → GAGNE/PERDU → P&L → Performance
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, TrendingUp, Trophy, Target, Percent, DollarSign, BarChart3 } from 'lucide-react';

export interface Trade {
  id: string;
  type: string;
  direction: 'bullish' | 'bearish';
  entry: number;
  sl: number;
  tp: number;
  tp2: number;
  rr: number;
  score: number;
  convictionScore: number;
  convictionTier: 'quality' | 'premium' | 'diamond';
  setup: string;
  time: string;
  createdAt: number;
  status: 'active' | 'won' | 'lost' | 'breakeven';
  pnl: number; // Profit/Perd en $
  closedAt?: number;
  exitPrice?: number;
  note?: string;
}

const STORAGE_KEY = 'trade_journal_v1';

function loadTrades(): Trade[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* */ }
  return [];
}

function saveTrades(trades: Trade[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trades)); } catch { /* */ }
}

// Calculer P&L
function calculatePnL(trade: Trade, exitPrice: number): number {
  if (trade.direction === 'bullish') {
    return exitPrice - trade.entry;
  }
  return trade.entry - exitPrice;
}

// Ajouter un trade
export function addTrade(signal: any): Trade {
  const trades = loadTrades();
  const exists = trades.some(t => t.id === signal.id);
  if (exists) return trades.find(t => t.id === signal.id)!;

  const trade: Trade = {
    id: signal.id,
    type: signal.type,
    direction: signal.direction,
    entry: signal.entry,
    sl: signal.sl,
    tp: signal.tp,
    tp2: signal.tp2,
    rr: signal.rr,
    score: signal.score,
    convictionScore: signal.convictionScore,
    convictionTier: signal.convictionTier,
    setup: signal.setup,
    time: signal.time,
    createdAt: signal.createdAt || Date.now(),
    status: 'active',
    pnl: 0,
  };

  trades.push(trade);
  saveTrades(trades);
  return trade;
}

export function TradeJournal() {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [exitPrice, setExitPrice] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'performance'>('active');
  const [editingTrade, setEditingTrade] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTrades(loadTrades()), 5000);
    return () => clearInterval(timer);
  }, []);

  const markWon = useCallback((tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    const pnl = calculatePnL(trade, trade.tp);
    const updated = trades.map(t =>
      t.id === tradeId ? { ...t, status: 'won' as Trade['status'], pnl, closedAt: Date.now(), exitPrice: trade.tp } : t
    );
    setTrades(updated);
    saveTrades(updated);
    setEditingTrade(null);
  }, [trades]);

  const markLost = useCallback((tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    const pnl = calculatePnL(trade, trade.sl);
    const updated = trades.map(t =>
      t.id === tradeId ? { ...t, status: 'lost' as Trade['status'], pnl, closedAt: Date.now(), exitPrice: trade.sl } : t
    );
    setTrades(updated);
    saveTrades(updated);
    setEditingTrade(null);
  }, [trades]);

  const markBreakeven = useCallback((tradeId: string) => {
    const updated = trades.map(t =>
      t.id === tradeId ? { ...t, status: 'breakeven' as Trade['status'], pnl: 0, closedAt: Date.now(), exitPrice: t.entry } : t
    );
    setTrades(updated);
    saveTrades(updated);
    setEditingTrade(null);
  }, [trades]);

  const closeWithPrice = useCallback((tradeId: string) => {
    const price = parseFloat(exitPrice);
    if (!price || price <= 0) return;
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return;
    const pnl = calculatePnL(trade, price);
    const status: Trade['status'] = pnl > 0.5 ? 'won' : pnl < -0.5 ? 'lost' : 'breakeven';
    const updated = trades.map(t =>
      t.id === tradeId ? { ...t, status, pnl, closedAt: Date.now(), exitPrice: price } : t
    );
    setTrades(updated);
    saveTrades(updated);
    setExitPrice('');
    setEditingTrade(null);
  }, [trades, exitPrice]);

  const deleteTrade = useCallback((tradeId: string) => {
    const updated = trades.filter(t => t.id !== tradeId);
    setTrades(updated);
    saveTrades(updated);
  }, [trades]);

  // Stats
  const activeTrades = trades.filter(t => t.status === 'active');
  const closedTrades = trades.filter(t => t.status !== 'active');
  const wonTrades = trades.filter(t => t.status === 'won');
  const lostTrades = trades.filter(t => t.status === 'lost');
  const beTrades = trades.filter(t => t.status === 'breakeven');
  const totalPnl = closedTrades.reduce((s, t) => s + t.pnl, 0);
  const winRate = closedTrades.length > 0 ? Math.round((wonTrades.length / closedTrades.length) * 100) : 0;
  const bestTrade = closedTrades.length > 0 ? closedTrades.reduce((best, t) => t.pnl > best.pnl ? t : best, closedTrades[0]) : null;
  const worstTrade = closedTrades.length > 0 ? closedTrades.reduce((worst, t) => t.pnl < worst.pnl ? t : worst, closedTrades[0]) : null;
  const avgWin = wonTrades.length > 0 ? wonTrades.reduce((s, t) => s + t.pnl, 0) / wonTrades.length : 0;
  const avgLoss = lostTrades.length > 0 ? lostTrades.reduce((s, t) => s + t.pnl, 0) / lostTrades.length : 0;
  const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : 0;

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'premium': return 'text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/30';
      default: return 'text-[#48bb78] bg-[#48bb78]/10 border-[#48bb78]/30';
    }
  };

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#ffd700]" />
        Trade Journal
        <span className="text-[10px] px-2 py-0.5 bg-[#2962FF]/10 text-[#63b3ed] rounded-full">
          {activeTrades.length} actif{activeTrades.length > 1 ? 's' : ''} | {closedTrades.length} clos
        </span>
      </h3>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Win Rate</p>
          <p className={`text-sm font-black ${winRate >= 60 ? 'text-[#48bb78]' : winRate >= 40 ? 'text-[#ffd700]' : 'text-[#ed8936]'}`}>
            {winRate}%
          </p>
        </div>
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">P&L Total</p>
          <p className={`text-sm font-black ${totalPnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Trades Gagnes</p>
          <p className="text-sm font-black text-[#48bb78]">{wonTrades.length}</p>
        </div>
        <div className="bg-[#0d1117] rounded p-2 text-center">
          <p className="text-[9px] text-[#4a5568]">Trades Perdus</p>
          <p className="text-sm font-black text-[#ed8936]">{lostTrades.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { key: 'active' as const, label: `EN COURS (${activeTrades.length})` },
          { key: 'history' as const, label: `HISTORIQUE (${closedTrades.length})` },
          { key: 'performance' as const, label: 'PERFORMANCE' },
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

      {/* Tab: ACTIFS */}
      {activeTab === 'active' && (
        <div className="space-y-2">
          {activeTrades.length === 0 ? (
            <p className="text-xs text-[#4a5568] text-center py-4">Aucun trade actif. Clique "PRENDRE" sur un signal intraday.</p>
          ) : (
            activeTrades.map(trade => (
              <div key={trade.id} className="bg-[#0d1117] rounded-lg border border-[#2962FF]/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${trade.direction === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                      {trade.direction === 'bullish' ? '▲ LONG' : '▼ SHORT'}
                    </span>
                    <span className="text-[10px] text-[#a0aec0]">{trade.type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${tierColor(trade.convictionTier)}`}>
                      {trade.convictionScore}%
                    </span>
                  </div>
                  <span className="text-[10px] text-[#2962FF] font-bold animate-pulse">EN COURS</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center text-[10px] mb-2">
                  <div><span className="text-[#4a5568]">Entry</span><br/><span className="font-bold">${trade.entry.toFixed(2)}</span></div>
                  <div><span className="text-[#4a5568]">SL</span><br/><span className="font-bold text-[#ed8936]">${trade.sl.toFixed(2)}</span></div>
                  <div><span className="text-[#4a5568]">TP</span><br/><span className="font-bold text-[#48bb78]">${trade.tp.toFixed(2)}</span></div>
                  <div><span className="text-[#4a5568]">RR</span><br/><span className="font-bold text-[#ffd700]">1:{trade.rr.toFixed(1)}</span></div>
                </div>

                {/* Actions */}
                {editingTrade === trade.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={exitPrice}
                        onChange={e => setExitPrice(e.target.value)}
                        placeholder="Prix de sortie"
                        className="flex-1 px-2 py-1 bg-[#1a202c] border border-[#4a5568] rounded text-white text-xs"
                      />
                      <button
                        onClick={() => closeWithPrice(trade.id)}
                        className="px-3 py-1 bg-[#2962FF] text-white rounded text-xs font-bold"
                      >
                        OK
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => markWon(trade.id)} className="flex-1 py-1.5 bg-[#48bb78]/20 text-[#48bb78] rounded text-[10px] font-bold border border-[#48bb78]/30 hover:bg-[#48bb78]/30">
                        <CheckCircle className="w-3 h-3 inline mr-1" />TP ATTEINT (GAGNE)
                      </button>
                      <button onClick={() => markLost(trade.id)} className="flex-1 py-1.5 bg-[#ed8936]/20 text-[#ed8936] rounded text-[10px] font-bold border border-[#ed8936]/30 hover:bg-[#ed8936]/30">
                        <XCircle className="w-3 h-3 inline mr-1" />SL TOUCHE (PERDU)
                      </button>
                    </div>
                    <button onClick={() => markBreakeven(trade.id)} className="w-full py-1 bg-[#ffd700]/10 text-[#ffd700] rounded text-[10px] font-bold border border-[#ffd700]/20">
                      BREAKEVEN (0$)
                    </button>
                    <button onClick={() => setEditingTrade(null)} className="text-[10px] text-[#4a5568] hover:text-[#a0aec0]">Annuler</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingTrade(trade.id)}
                    className="w-full py-1.5 bg-[#2962FF]/10 text-[#63b3ed] rounded text-[10px] font-bold border border-[#2962FF]/20 hover:bg-[#2962FF]/20"
                  >
                    Cloturer ce trade
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: HISTORIQUE */}
      {activeTab === 'history' && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {closedTrades.length === 0 ? (
            <p className="text-xs text-[#4a5568] text-center py-4">Aucun trade dans l historique.</p>
          ) : (
            closedTrades.slice().reverse().map(trade => (
              <div key={trade.id} className={`flex items-center justify-between py-2 px-2 rounded text-[10px] border-b border-[#2d3748] last:border-0 ${
                trade.status === 'won' ? 'bg-[#48bb78]/5' : trade.status === 'lost' ? 'bg-[#ed8936]/5' : 'bg-[#ffd700]/5'
              }`}>
                <div className="flex items-center gap-2">
                  {trade.status === 'won' && <CheckCircle className="w-3.5 h-3.5 text-[#48bb78]" />}
                  {trade.status === 'lost' && <XCircle className="w-3.5 h-3.5 text-[#ed8936]" />}
                  {trade.status === 'breakeven' && <TrendingUp className="w-3.5 h-3.5 text-[#ffd700]" />}
                  <span className={trade.direction === 'bullish' ? 'text-[#48bb78]' : 'text-[#ed8936]'}>
                    {trade.direction === 'bullish' ? '▲' : '▼'}
                  </span>
                  <span className="text-[#a0aec0]">{trade.type}</span>
                  <span className={`font-bold ${trade.pnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4a5568]">1:{trade.rr.toFixed(1)}</span>
                  <span className="text-[#4a5568]">{trade.time}</span>
                  <button onClick={() => deleteTrade(trade.id)} className="text-[#4a5568] hover:text-[#ed8936]">×</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-3">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0d1117] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="w-3.5 h-3.5 text-[#63b3ed]" />
                <span className="text-[10px] text-[#4a5568]">Win Rate</span>
              </div>
              <p className={`text-2xl font-black ${winRate >= 60 ? 'text-[#48bb78]' : winRate >= 40 ? 'text-[#ffd700]' : 'text-[#ed8936]'}`}>
                {winRate}%
              </p>
              <p className="text-[9px] text-[#4a5568]">{wonTrades.length}G / {lostTrades.length}P / {beTrades.length}BE</p>
            </div>
            <div className="bg-[#0d1117] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#63b3ed]" />
                <span className="text-[10px] text-[#4a5568]">P&L Total</span>
              </div>
              <p className={`text-2xl font-black ${totalPnl >= 0 ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </p>
              <p className="text-[9px] text-[#4a5568]">{closedTrades.length} trades clos</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[#0d1117] rounded-lg p-3 space-y-2">
            <h4 className="text-[10px] font-bold text-[#a0aec0] mb-2 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Statistiques Detail
            </h4>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#4a5568]">Profit Factor</span>
              <span className={`font-bold ${profitFactor >= 2 ? 'text-[#48bb78]' : profitFactor >= 1 ? 'text-[#ffd700]' : 'text-[#ed8936]'}`}>
                {profitFactor.toFixed(2)} {profitFactor >= 2 ? '(Excellent)' : profitFactor >= 1.5 ? '(Bon)' : '(Faible)'}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#4a5568]">Gain Moyen</span>
              <span className="font-bold text-[#48bb78]">+${avgWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#4a5568]">Perte Moyenne</span>
              <span className="font-bold text-[#ed8936]">${avgLoss.toFixed(2)}</span>
            </div>
            {bestTrade && (
              <div className="flex justify-between text-[10px]">
                <span className="text-[#4a5568]">Meilleur Trade</span>
                <span className="font-bold text-[#48bb78]">+${bestTrade.pnl.toFixed(2)} ({bestTrade.type})</span>
              </div>
            )}
            {worstTrade && (
              <div className="flex justify-between text-[10px]">
                <span className="text-[#4a5568]">Pire Trade</span>
                <span className="font-bold text-[#ed8936]">${worstTrade.pnl.toFixed(2)} ({worstTrade.type})</span>
              </div>
            )}
            <div className="flex justify-between text-[10px]">
              <span className="text-[#4a5568]">Total Trades</span>
              <span className="font-bold text-white">{trades.length}</span>
            </div>
          </div>

          {/* Grade */}
          {closedTrades.length >= 5 && (
            <div className={`rounded-lg p-3 text-center ${
              winRate >= 70 ? 'bg-purple-400/10 border border-purple-400/30' :
              winRate >= 60 ? 'bg-[#ffd700]/10 border border-[#ffd700]/30' :
              winRate >= 50 ? 'bg-[#48bb78]/10 border border-[#48bb78]/30' :
              'bg-[#ed8936]/10 border border-[#ed8936]/30'
            }`}>
              <Trophy className={`w-6 h-6 mx-auto mb-1 ${
                winRate >= 70 ? 'text-purple-400' : winRate >= 60 ? 'text-[#ffd700]' : winRate >= 50 ? 'text-[#48bb78]' : 'text-[#ed8936]'
              }`} />
              <p className={`text-sm font-black ${
                winRate >= 70 ? 'text-purple-400' : winRate >= 60 ? 'text-[#ffd700]' : winRate >= 50 ? 'text-[#48bb78]' : 'text-[#ed8936]'
              }`}>
                {winRate >= 70 ? 'TRADER DIAMOND' : winRate >= 60 ? 'TRADER PREMIUM' : winRate >= 50 ? 'TRADER QUALITE' : 'A ENTRAINER'}
              </p>
              <p className="text-[9px] text-[#4a5568]">
                {winRate >= 70 ? 'Performance institutionnelle' : winRate >= 60 ? 'Tres bon trader' : winRate >= 50 ? 'Trader profitable' : 'Continue a pratiquer'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
