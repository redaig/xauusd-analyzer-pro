// ============================================================
// AUTONOMIE 24/7 — Ce qui marche sans Kimi
// ============================================================

import { Server, Cloud, Wifi, WifiOff, CheckCircle, AlertTriangle, HardDrive, Globe, Database } from 'lucide-react';

export function AutonomyInfo() {
  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2962FF]/30 p-4">
      <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
        <Server className="w-4 h-4 text-[#2962FF]" />
        Autonomie 24/7 — Analyse
      </h3>

      {/* Status global */}
      <div className="bg-[#0d1117] rounded-lg p-3 mb-3 border border-[#48bb78]/20">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-[#48bb78]" />
          <span className="text-xs font-bold text-[#48bb78]">LE SITE FONCTIONNE SANS KIMI</span>
        </div>
        <p className="text-[10px] text-[#a0aec0]">
          Le site est deploye sur un serveur independant. Il fonctionne 24/7 sans ton compte Kimi.
          Cependant, certaines fonctionnalites dependent d'API externes.
        </p>
      </div>

      {/* Services */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-[#4a5568] uppercase">Fonctionnalites & Dependances</h4>

        {/* Prix temps reel */}
        <div className="flex items-start gap-2 py-1.5 border-b border-[#2d3748]">
          <div className="mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#48bb78]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-[#63b3ed]" />
              <span className="text-[10px] font-bold text-white">Prix OANDA temps reel</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#48bb78]/10 text-[#48bb78] rounded">AUTONOME</span>
            </div>
            <p className="text-[9px] text-[#4a5568] mt-0.5">
              Real Market API (clef: JedfVQU5FG44YIDiTerib4vjumXAQUm7wstzeMTGoVmRD7Fk)
              Fonctionne tant que la clef est valide.
            </p>
          </div>
        </div>

        {/* Analyse technique */}
        <div className="flex items-start gap-2 py-1.5 border-b border-[#2d3748]">
          <div className="mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#48bb78]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-[#63b3ed]" />
              <span className="text-[10px] font-bold text-white">Analyse technique</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#48bb78]/10 text-[#48bb78] rounded">100% LOCAL</span>
            </div>
            <p className="text-[9px] text-[#4a5568] mt-0.5">
              Calculee dans le navigateur. Aucune API externe. Fonctionne toujours.
            </p>
          </div>
        </div>

        {/* FRED Macro */}
        <div className="flex items-start gap-2 py-1.5 border-b border-[#2d3748]">
          <div className="mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffd700]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-[#63b3ed]" />
              <span className="text-[10px] font-bold text-white">Donnees macro FRED</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#ffd700]/10 text-[#ffd700] rounded">CACHE</span>
            </div>
            <p className="text-[9px] text-[#4a5568] mt-0.5">
              Dernieres donnees integrees au build. Pour actualiser, il faut rebuild le site
              (possible automatiquement avec GitHub Actions).
            </p>
          </div>
        </div>

        {/* Calendrier eco */}
        <div className="flex items-start gap-2 py-1.5 border-b border-[#2d3748]">
          <div className="mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#48bb78]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Cloud className="w-3 h-3 text-[#63b3ed]" />
              <span className="text-[10px] font-bold text-white">Calendrier economique</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#48bb78]/10 text-[#48bb78] rounded">STATIQUE</span>
            </div>
            <p className="text-[9px] text-[#4a5568] mt-0.5">
              Mis a jour manuellement. Les dates des prochaines news sont pre-renseignees.
            </p>
          </div>
        </div>

        {/* TradingView widget */}
        <div className="flex items-start gap-2 py-1.5 border-b border-[#2d3748]">
          <div className="mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#48bb78]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-[#63b3ed]" />
              <span className="text-[10px] font-bold text-white">TradingView Widget</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#48bb78]/10 text-[#48bb78] rounded">EXTERNE</span>
            </div>
            <p className="text-[9px] text-[#4a5568] mt-0.5">
              Charge depuis tradingview.com. Fonctionne tant que TradingView est en ligne.
            </p>
          </div>
        </div>

        {/* Trade Journal */}
        <div className="flex items-start gap-2 py-1.5 border-b border-[#2d3748]">
          <div className="mt-0.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#48bb78]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-[#63b3ed]" />
              <span className="text-[10px] font-bold text-white">Trade Journal</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#48bb78]/10 text-[#48bb78] rounded">LOCAL</span>
            </div>
            <p className="text-[9px] text-[#4a5568] mt-0.5">
              Sauvegarde dans ton navigateur (localStorage). Perdu si tu changes de navigateur
              ou effaces les donnees. Exporter regulierement le rapport.
            </p>
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="mt-3 bg-[#2962FF]/5 rounded-lg p-3 border border-[#2962FF]/20">
        <h4 className="text-[10px] font-bold text-[#63b3ed] mb-2">Resume Autonomie</h4>
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-[#48bb78]" />
            <span className="text-[#a0aec0]">Site: <span className="text-[#48bb78] font-bold">OK</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-[#48bb78]" />
            <span className="text-[#a0aec0]">Prix: <span className="text-[#48bb78] font-bold">OK</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-[#48bb78]" />
            <span className="text-[#a0aec0]">Analyse tech: <span className="text-[#48bb78] font-bold">OK</span></span>
          </div>
          <div className="flex items-center gap-1">
            <WifiOff className="w-3 h-3 text-[#ffd700]" />
            <span className="text-[#a0aec0]">Macro FRED: <span className="text-[#ffd700] font-bold">Cache</span></span>
          </div>
        </div>
      </div>

      {/* Solutions pour 100% autonome */}
      <div className="mt-3 bg-[#48bb78]/5 rounded-lg p-3 border border-[#48bb78]/20">
        <h4 className="text-[10px] font-bold text-[#48bb78] mb-2">Pour 100% Autonome (Recommandations)</h4>
        <div className="space-y-1 text-[9px] text-[#a0aec0]">
          <p className="flex items-start gap-1">
            <span className="text-[#48bb78] flex-shrink-0">1.</span>
            <span>Heberger sur <strong>Vercel</strong> (gratuit) + GitHub pour rebuild auto toutes les 24h</span>
          </p>
          <p className="flex items-start gap-1">
            <span className="text-[#48bb78] flex-shrink-0">2.</span>
            <span>Configurer <strong>GitHub Actions</strong> pour rebuild + redeploy quotidien avec FRED frais</span>
          </p>
          <p className="flex items-start gap-1">
            <span className="text-[#48bb78] flex-shrink-0">3.</span>
            <span>Ajouter un <strong>worker Cloudflare</strong> pour actualiser les donnees FRED en temps reel</span>
          </p>
          <p className="flex items-start gap-1">
            <span className="text-[#48bb78] flex-shrink-0">4.</span>
            <span>Sauvegarder le <strong>Trade Journal</strong> sur Google Sheets via API</span>
          </p>
        </div>
      </div>
    </div>
  );
}
