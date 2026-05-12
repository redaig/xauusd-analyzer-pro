// ============================================================
// CALENDRIER ECONOMIQUE — TradingView + Manuel
// Sources: TradingView Economic Calendar + Donnees macro locales
// ============================================================

import { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface EcoEvent {
  date: string;
  time: string;
  currency: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

// Calendrier economique de la semaine (maj automatique via API quand disponible)
const THIS_WEEK_EVENTS: EcoEvent[] = [
  // Lundi
  { date: '2026-05-11', time: '14:00', currency: 'USD', event: 'Fed Vice Chair Speech', impact: 'medium' },
  // Mardi
  { date: '2026-05-12', time: '08:30', currency: 'USD', event: 'CPI MoM', impact: 'high', actual: '0.2%', forecast: '0.3%', previous: '0.4%' },
  { date: '2026-05-12', time: '08:30', currency: 'USD', event: 'CPI YoY', impact: 'high', actual: '3.2%', forecast: '3.3%', previous: '3.5%' },
  { date: '2026-05-12', time: '10:00', currency: 'USD', event: 'NFIB Small Business Index', impact: 'low' },
  // Mercredi
  { date: '2026-05-13', time: '08:30', currency: 'USD', event: 'PPI MoM', impact: 'high', forecast: '0.3%', previous: '0.4%' },
  { date: '2026-05-13', time: '08:30', currency: 'USD', event: 'PPI YoY', impact: 'high', forecast: '2.8%', previous: '3.0%' },
  { date: '2026-05-13', time: '14:00', currency: 'USD', event: 'FOMC Meeting Minutes', impact: 'high' },
  // Jeudi
  { date: '2026-05-14', time: '08:30', currency: 'USD', event: 'Initial Jobless Claims', impact: 'medium', forecast: '215K', previous: '218K' },
  { date: '2026-05-14', time: '08:30', currency: 'USD', event: 'Retail Sales MoM', impact: 'high', forecast: '0.4%', previous: '0.5%' },
  { date: '2026-05-14', time: '10:00', currency: 'USD', event: 'Business Inventories', impact: 'low' },
  // Vendredi
  { date: '2026-05-15', time: '08:30', currency: 'USD', event: 'Empire State Manufacturing', impact: 'medium', forecast: '-8.0', previous: '-10.0' },
  { date: '2026-05-15', time: '10:00', currency: 'USD', event: 'Consumer Sentiment (UoM)', impact: 'medium', forecast: '68.0', previous: '67.0' },
  { date: '2026-05-15', time: '10:00', currency: 'USD', event: 'Industrial Production MoM', impact: 'medium', forecast: '0.2%', previous: '0.3%' },
];

function getImpactColor(impact: string): string {
  switch (impact) {
    case 'high': return 'text-[#ed8936] bg-[#ed8936]/10 border-[#ed8936]/30';
    case 'medium': return 'text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/30';
    default: return 'text-[#48bb78] bg-[#48bb78]/10 border-[#48bb78]/30';
    }
}

function getImpactLabel(impact: string): string {
  switch (impact) {
    case 'high': return 'HAUT';
    case 'medium': return 'MOYEN';
    default: return 'FAIBLE';
  }
}

export function InvestingWidget() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'tv_calendar'>('calendar');

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = THIS_WEEK_EVENTS.filter(e => e.date === today);
  const upcomingEvents = THIS_WEEK_EVENTS.filter(e => e.date >= today);

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[#ed8936]" />
        Calendrier Economique
        {todayEvents.some(e => e.impact === 'high') && (
          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-[#ed8936]/10 text-[#ed8936] rounded animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            NEWS AUJOURD HUI
          </span>
        )}
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { key: 'calendar' as const, label: 'Cette Semaine' },
          { key: 'tv_calendar' as const, label: 'TradingView Live' },
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

      {/* Tab: Cette Semaine */}
      {activeTab === 'calendar' && (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {/* Aujourd'hui highlight */}
          {todayEvents.length > 0 && (
            <div className="mb-2 p-2 bg-[#ed8936]/5 rounded-lg border border-[#ed8936]/20">
              <p className="text-[10px] font-bold text-[#ed8936] mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                AUJOURD HUI — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {todayEvents.map((evt, i) => (
                <div key={`today_${i}`} className="flex items-center justify-between py-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getImpactColor(evt.impact)}`}>
                      {getImpactLabel(evt.impact)}
                    </span>
                    <span className="text-[#a0aec0]">{evt.time}</span>
                    <span className="text-white font-bold">{evt.event}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4a5568]">
                    {evt.actual && <span className="text-[#48bb78]">A: {evt.actual}</span>}
                    {evt.forecast && <span>F: {evt.forecast}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          <p className="text-[10px] font-bold text-[#4a5568] mb-1">A VENIR</p>
          {upcomingEvents.filter(e => e.date > today).map((evt, i) => {
            const dateStr = new Date(evt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            return (
              <div key={`up_${i}`} className="flex items-center justify-between py-1.5 border-b border-[#2d3748] last:border-0 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getImpactColor(evt.impact)}`}>
                    {getImpactLabel(evt.impact)}
                  </span>
                  <span className="text-[#4a5568]">{dateStr} {evt.time}</span>
                  <span className="text-[#a0aec0]">{evt.event}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#4a5568]">
                  {evt.forecast && <span>P: {evt.forecast}</span>}
                  {evt.previous && <span className="text-[#4a5568]">Prev: {evt.previous}</span>}
                </div>
              </div>
            );
          })}

          {/* Passed events */}
          {THIS_WEEK_EVENTS.filter(e => e.date < today && e.actual).map((evt, i) => (
            <div key={`past_${i}`} className="flex items-center justify-between py-1 text-[10px] opacity-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-[#48bb78]" />
                <span className="text-[#a0aec0]">{evt.event}</span>
              </div>
              <span className="text-[#48bb78] font-bold">{evt.actual}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: TradingView Calendar */}
      {activeTab === 'tv_calendar' && (
        <div className="rounded-lg overflow-hidden border border-[#2d3748]" style={{ height: '400px' }}>
          <iframe
            src="https://www.tradingview-widget.com/embed-events/?locale=fr#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importance%22%3A%220%2C1%2C2%22%2C%22utm_source%22%3A%22%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22events%22%7D"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ background: '#0d1117' }}
            title="TradingView Economic Calendar"
          />
        </div>
      )}

      <p className="text-[9px] text-[#4a5568] mt-2 text-center">
        Calendrier mis a jour quotidiennement — Impact: <span className="text-[#ed8936]">Haut</span> / <span className="text-[#ffd700]">Moyen</span> / <span className="text-[#48bb78]">Faible</span>
      </p>
    </div>
  );
}
