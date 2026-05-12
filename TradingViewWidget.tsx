// ============================================================
// WIDGET TRADINGVIEW + MULTI-TIMEFRAMES
// ============================================================

import { useState } from 'react';

const TIMEFRAMES = [
  { label: 'M15', value: '15', desc: '15 minutes' },
  { label: 'H1', value: '60', desc: '1 heure' },
  { label: 'H4', value: '240', desc: '4 heures' },
  { label: 'D1', value: 'D', desc: '1 jour' },
];

export function TradingViewWidget() {
  const [activeTf, setActiveTf] = useState('240'); // H4 par défaut

  const widgetUrl = `https://www.tradingview.com/chart/?symbol=OANDA%3AXAUUSD&interval=${activeTf}&theme=dark`;
  const embedUrl = `https://s.tradingview.com/embed-widget/advanced-chart/?symbol=OANDA%3AXAUUSD&interval=${activeTf}&theme=dark&style=1&timezone=Africa%2FCasablanca&withdateranges=true&hide_side_toolbar=false&allow_symbol_change=false&save_image=true&calendar=false&hide_volume=false&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MACD%40tv-basicstudies%22%2C%22BB%40tv-basicstudies%22%5D`;

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-[#a0aec0] flex items-center gap-2">
          <span className="text-[#2962FF]">📈</span> TradingView XAU/USD OANDA
        </h3>

        {/* Timeframes */}
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => setActiveTf(tf.value)}
              title={tf.desc}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                activeTf === tf.value
                  ? 'bg-[#2962FF] text-white'
                  : 'bg-[#0d1117] text-[#4a5568] hover:text-[#a0aec0] hover:bg-[#2d3748]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Widget iframe */}
      <div className="rounded-lg overflow-hidden border border-[#2d3748]" style={{ height: '420px' }}>
        <iframe
          key={activeTf}
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={`TradingView XAU/USD ${activeTf}`}
          allowTransparency
          allowFullScreen
        />
      </div>

      {/* Info bar */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-[#4a5568]">
        <span>Timeframe actif: <span className="text-[#ffd700] font-bold">{TIMEFRAMES.find(t => t.value === activeTf)?.label}</span></span>
        <button
          onClick={() => window.open(widgetUrl, 'tv_full', 'width=1400,height=900')}
          className="text-[#63b3ed] hover:text-[#2962FF] transition-colors"
        >
          Ouvrir dans TradingView →
        </button>
      </div>
    </div>
  );
}
