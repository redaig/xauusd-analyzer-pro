// ============================================================
// GRAPHIQUE HISTORIQUE DES PRIX - 24h (version légère sans Chart.js)
// ============================================================

import { useMemo, useState } from 'react';
import { getPriceHistory24h, getPriceStats } from '@/services/priceHistory';

export function PriceChart() {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');

  const history = useMemo(() => {
    const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24;
    const all = getPriceHistory24h();
    const cutoff = Date.now() - hours * 3600 * 1000;
    return all.filter(p => p.timestamp >= cutoff);
  }, [timeRange]);

  const stats = useMemo(() => getPriceStats(), []);

  // Mini sparkline SVG
  const sparkline = useMemo(() => {
    if (history.length < 2) return null;
    const prices = history.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const w = 600;
    const h = 120;
    const points = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 20) - 10;
      return `${x},${y}`;
    }).join(' ');
    return { points, w, h, min, max };
  }, [history]);

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-[#a0aec0] flex items-center gap-2">
          <span className="text-[#63b3ed]">📊</span> Historique des Prix
        </h3>
        <div className="flex gap-1">
          {(['1h', '6h', '24h'] as const).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${timeRange === r ? 'bg-[#2962FF] text-white' : 'bg-[#0d1117] text-[#4a5568]'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[
          { label: 'High', value: stats.high, color: 'text-[#48bb78]' },
          { label: 'Low', value: stats.low, color: 'text-[#ed8936]' },
          { label: 'Open', value: stats.open, color: 'text-[#a0aec0]' },
          { label: 'Close', value: stats.close, color: 'text-[#63b3ed]' },
          { label: 'Volatilite', value: stats.volatility, color: 'text-[#ffd700]', suffix: '$' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1117] rounded p-1.5 text-center">
            <p className="text-[9px] text-[#4a5568]">{s.label}</p>
            <p className={`text-xs font-bold ${s.color}`}>{s.value > 0 ? `$${s.value.toFixed(2)}` : '--'}</p>
          </div>
        ))}
      </div>

      {/* Sparkline SVG */}
      <div className="bg-[#0d1117] rounded-lg p-2">
        {sparkline ? (
          <svg viewBox={`0 0 ${sparkline.w} ${sparkline.h}`} className="w-full" style={{ height: '120px' }}>
            <defs>
              <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2962FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`${sparkline.points} ${sparkline.w},${sparkline.h} 0,${sparkline.h}`}
              fill="url(#sparkGradient)"
            />
            <polyline
              points={sparkline.points}
              fill="none"
              stroke="#2962FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="h-[120px] flex items-center justify-center text-[#4a5568] text-xs">
            Donnees en cours de collecte... ({history.length} points)
          </div>
        )}
      </div>
    </div>
  );
}
