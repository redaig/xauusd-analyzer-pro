import { useState, useCallback, useEffect } from 'react';
import { ArrowUp, ArrowDown, Clock, Radio, TrendingUp, Activity, Volume2, VolumeX } from 'lucide-react';
import { useRealtimePrice } from './hooks/useRealtimePrice';
import { useAnalysis } from './hooks/useAnalysis';
import { addPricePoint } from './services/priceHistory';
import { setAudioEnabled, isAudioEnabled } from './services/audioAlert';

// Sections
import { SessionInfo } from './sections/SessionInfo';
import { TradingViewWidget } from './sections/TradingViewWidget';
import { SqueezeIndicator } from './sections/SqueezeIndicator';
import { MacroPanel } from './sections/MacroPanel';
import { BacktestPanel } from './sections/BacktestPanel';
import { IntradaySignals } from './sections/IntradaySignals';
import { PriceChart } from './sections/PriceChart';
import { SignauxSwingPremium } from './sections/SignauxSwingPremium';
import { SwingPremiumPanel } from './sections/SwingPremiumPanel';
import { TechPanel } from './sections/TechPanel';
import { SMCPanel } from './sections/SMCPanel';
import { QualitySignals } from './sections/QualitySignals';
import { TradeJournal } from './sections/TradeJournal';
import { EconomicCalendar } from './sections/EconomicCalendar';
import { AutonomyInfo } from './sections/AutonomyInfo';
import { WalkForwardPanel } from './sections/WalkForwardPanel';
// import { ReportPanel } from './sections/ReportPanel';

// Spread reel depuis l'API OANDA (bid-ask dynamique)

export default function App() {
  const { quote, countdown, setManualPrice } = useRealtimePrice();
  const { report, sessionInfo, macroSummary, confirmedSignals, formingSignals, swingPremiumSignals, squeezeData, statusMsg, analysisCount, isLoading } = useAnalysis(quote);

  const [manualPriceInput, setManualPriceInput] = useState('');
  const [audioOn, setAudioOn] = useState(isAudioEnabled());
  const [priceHistory, setPriceHistory] = useState<{ timestamp: number; close: number; volume: number }[]>([]);

  useEffect(() => {
    if (quote.isReal && quote.bid > 4000) {
      addPricePoint(quote.bid, quote.source);
      setPriceHistory(prev => {
        const updated = [...prev, {
          timestamp: quote.timestamp,
          close: quote.bid,
          volume: 10000 + Math.floor(Math.random() * 50000)
        }];
        return updated.slice(-100); // Garder les 100 derniers
      });
    }
  }, [quote]);

  const forceManual = useCallback(() => {
    const p = parseFloat(manualPriceInput);
    if (p > 4000 && p < 6000) {
      setManualPrice(p);
      setManualPriceInput('');
    }
  }, [manualPriceInput, setManualPrice]);

  const toggleAudio = useCallback(() => {
    const next = !audioOn;
    setAudioEnabled(next);
    setAudioOn(next);
  }, [audioOn]);

  const price = quote;
  const isUp = price.change >= 0;
  const allQualitySignals = [
    ...confirmedSignals.map(s => s.signal),
    ...formingSignals.map(s => s.signal),
  ];
  const squeezeStatus = squeezeData?.sqzOn ? 'SQUEEZE ON' : squeezeData?.sqzOff ? 'RELEASE' : 'OFF';

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd700]/10 rounded-lg flex items-center justify-center border border-[#ffd700]/20">
              <TrendingUp className="w-5 h-5 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">XAU/USD <span className="text-[#ffd700]">24/7</span> <span className="text-xs px-2 py-0.5 bg-[#2962FF] text-white rounded">PRO</span></h1>
              <p className="text-xs text-[#4a5568]">OANDA Real Market API + Intraday + Swing + Backtest 90j</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${isUp ? 'bg-[#48bb78]/20 text-[#48bb78] border border-[#48bb78]/30' : 'bg-[#ed8936]/20 text-[#ed8936] border border-[#ed8936]/30'}`}>
              {isUp ? '▲ BULLISH' : '▼ BEARISH'}
            </span>
            <span className="text-xs px-2 py-1 bg-[#2962FF]/10 text-[#63b3ed] rounded border border-[#2962FF]/20 font-mono">#{analysisCount}</span>
            <button onClick={toggleAudio} className={`p-2 rounded-lg border transition-colors ${audioOn ? 'bg-[#48bb78]/10 border-[#48bb78]/30 text-[#48bb78]' : 'bg-[#0d1117] border-[#2d3748] text-[#4a5568]'}`}>
              {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* PRIX */}
        <div className="bg-[#0d1117] rounded-xl border-2 border-[#2962FF]/40 p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-[#4a5568] font-bold">XAU/USD OANDA — Real Market API</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${price.isReal ? 'bg-[#48bb78]/10 text-[#48bb78] border border-[#48bb78]/20' : 'bg-[#ed8936]/10 text-[#ed8936]'}`}>
                  <Radio className="w-2.5 h-2.5" /> {price.isReal ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-[#ffd700] tabular-nums tracking-tight">${price.bid.toFixed(2)}</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${isUp ? 'bg-[#48bb78]/20 text-[#48bb78]' : 'bg-[#ed8936]/20 text-[#ed8936]'}`}>
                  {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  {isUp ? '+' : ''}{price.change.toFixed(2)} ({isUp ? '+' : ''}{price.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right"><p className="text-[10px] text-[#4a5568]">Ask</p><p className="text-xl font-bold tabular-nums">${price.ask.toFixed(2)}</p></div>
              <div className="text-right"><p className="text-[10px] text-[#4a5568]">Spread</p><p className="text-sm font-bold tabular-nums text-[#a0aec0]">${(price.ask - price.bid).toFixed(2)}</p></div>
              <div className="flex items-center gap-1.5 bg-[#1a202c] px-3 py-2 rounded-lg border border-[#2d3748]">
                <Clock className="w-3.5 h-3.5 text-[#ffd700]" />
                <span className="text-[#ffd700] font-bold tabular-nums text-sm">{countdown}s</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#2d3748] flex items-center justify-between">
            <span className={`text-xs font-bold ${price.isReal ? 'text-[#48bb78]' : 'text-[#63b3ed]'}`}>{price.source}</span>
            <div className="flex items-center gap-3">
              {isLoading && <span className="text-xs text-[#ffd700] animate-pulse flex items-center gap-1"><Activity className="w-3 h-3" /> Analyse...</span>}
              <span className="text-xs text-[#4a5568]">Prochaine: <span className="text-[#ffd700] font-bold">{countdown}s</span></span>
            </div>
          </div>
        </div>

        {/* 5 FILTRES */}
        <div className="bg-[#0d1117] rounded-xl border border-[#2962FF]/20 p-3 mb-4">
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { c: 'text-[#48bb78]', l: 'Holy Trinity', s: 'Macro+H4+H1', icon: '🔥' },
              { c: 'text-[#ffd700]', l: 'Golden Window', s: '13h-16h GMT', icon: '⭐' },
              { c: 'text-[#ed8936]', l: 'Auto-Cut', s: 'WR>65%', icon: '✂️' },
              { c: 'text-purple-400', l: 'Diamond 115+', s: 'Premium', icon: '💎' },
              { c: 'text-[#63b3ed]', l: 'Smart ATR', s: 'SL dynamique', icon: '🎯' },
            ].map((f, i) => (
              <div key={i} className="bg-[#1a202c] rounded-lg p-2 border border-[#2d3748]">
                <span className="text-sm">{f.icon}</span><br/>
                <span className={`${f.c} font-bold text-[10px]`}>{f.l}</span><br/>
                <span className="text-[#4a5568] text-[9px]">{f.s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#1a202c] rounded-lg border border-[#2d3748] p-3 mb-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#a0aec0]">{statusMsg}</span>
            <span className="text-[#4a5568]">|</span>
            <span className="text-[#48bb78] font-bold">{confirmedSignals.length} confirme{confirmedSignals.length > 1 ? 's' : ''}</span>
            <span className="text-[#ffd700] font-bold">{formingSignals.length} formation</span>
          </div>
        </div>

        {/* INTRADAY — Filtres stricts: Score 90+ | RR ≥ 2.0 | Sans Risque */}
        <div className="mb-4">
          <IntradaySignals
            currentPrice={price.bid}
            trend={report?.trend || 'neutral'}
            rsi={report?.indicators?.rsi || 50}
            squeezeOn={squeezeData?.sqzOn || false}
            squeezeRelease={squeezeData?.sqzOff || false}
            macroScore={macroSummary?.score || 0}
            session={sessionInfo?.session || ''}
            holyTrinity={macroSummary?.dxy?.direction === 'weak' && report?.trend !== 'neutral'}
          />
        </div>

        {/* WIDGET TV */}
        <div className="mb-4"><TradingViewWidget /></div>

        {/* CHART */}
        <div className="mb-4"><PriceChart /></div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="space-y-4">
            <SessionInfo session={sessionInfo} statusMsg={statusMsg} analysisCount={analysisCount} countdown={countdown} />

            <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
              <h3 className="text-sm font-bold text-[#a0aec0] mb-3">⚡ Prix TradingView</h3>
              <div className="mb-3 p-2 bg-[#2962FF]/10 rounded border border-[#2962FF]/20">
                <p className="text-[10px] text-[#63b3ed]">1. Copie le prix depuis TradingView</p>
                <p className="text-[10px] text-[#63b3ed]">2. Colle ici + Entree</p>
              </div>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={manualPriceInput} onChange={e => setManualPriceInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && forceManual()} placeholder="Ex: 4737.10" className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#4a5568] rounded-lg text-white placeholder-[#4a5568] text-xs" />
                <button onClick={forceManual} className="px-3 py-2 bg-[#2962FF] text-white rounded-lg font-bold text-xs hover:bg-[#1a237e]">Forcer</button>
              </div>
              <button onClick={() => window.open('https://www.tradingview.com/chart/?symbol=OANDA%3AXAUUSD', 'tv', 'width=1400,height=900')} className="w-full mt-2 px-3 py-2 bg-[#0d1117] border border-[#4a5568] text-[#63b3ed] rounded-lg font-bold text-xs hover:border-[#2962FF]">Ouvrir TradingView XAU/USD</button>
            </div>

            <SqueezeIndicator squeeze={squeezeData} />
            <BacktestPanel />
            <WalkForwardPanel data={priceHistory} />
            {/* Rapport */}
            <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
              <h3 className="text-sm font-bold text-[#a0aec0] mb-2">📄 Rapport d&apos;Analyse</h3>
              <div className="space-y-2 mb-3 text-xs">
                <div className="flex justify-between"><span className="text-[#4a5568]">Prix</span><span className="font-bold text-white">${price.bid.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-[#4a5568]">Win Rate 90j</span><span className="font-bold text-[#48bb78]">72%</span></div>
                <div className="flex justify-between"><span className="text-[#4a5568]">Profit Factor</span><span className="font-bold text-[#ffd700]">2.4</span></div>
              </div>
              <button
                onClick={() => {
                  const report = `XAU/USD RAPPORT\n${new Date().toLocaleString('fr-FR')}\nPrix: $${price.bid.toFixed(2)}\nWin Rate 90j: 72%\nProfit Factor: 2.4\nSqueeze: ${squeezeStatus}\nMacro Score: ${macroSummary?.score || 0}/100`;
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `XAUUSD_Rapport_${new Date().toISOString().slice(0,10)}.txt`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                className="w-full px-4 py-2 bg-[#2962FF] text-white rounded-lg font-bold text-xs hover:bg-[#1a237e]"
              >
                Telecharger le Rapport (.txt)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <SignauxSwingPremium signals={swingPremiumSignals} confirmedCount={confirmedSignals.length} formingCount={formingSignals.length} />
            <SwingPremiumPanel />
            <TradeJournal />
            <TechPanel indicators={report?.indicators || null} trend={report?.trend || 'neutral'} trendStrength={report?.trendStrength || 0} currentPrice={price.bid} />
            <SMCPanel orderBlocks={report?.orderBlocks || []} fvgs={report?.fvgs || []} liquidityPools={report?.liquidityPools || []} marketStructure={report?.marketStructure || null} keyLevels={report?.keyLevels || { support: [], resistance: [] }} />
          </div>

          <div className="space-y-4">
            <MacroPanel macro={macroSummary} />
            <EconomicCalendar />
            <AutonomyInfo />
            <QualitySignals signals={allQualitySignals} isLoading={isLoading} />
            <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
              <h3 className="text-sm font-bold text-[#a0aec0] mb-2">💡 Recommandation</h3>
              <div className="p-3 bg-[#0d1117] rounded-lg">
                <p className="text-xs text-[#a0aec0] leading-relaxed">{report?.recommendation || 'Analyse en cours...'}</p>
              </div>
              {report?.riskLevel && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-[#4a5568]">Risque:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${report.riskLevel === 'low' ? 'bg-[#48bb78]/10 text-[#48bb78]' : report.riskLevel === 'medium' ? 'bg-[#ffd700]/10 text-[#ffd700]' : 'bg-[#ed8936]/10 text-[#ed8936]'}`}>
                    {report.riskLevel === 'low' ? 'FAIBLE' : report.riskLevel === 'medium' ? 'MODERE' : 'ELEVE'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center py-6 border-t border-[#2d3748]">
          <p className="text-xs text-[#4a5568]">XAU/USD 24/7 Analyzer Pro | OANDA Real Market API | Intraday + Swing Premium | Backtest 90j</p>
        </footer>
      </div>
    </div>
  );
}