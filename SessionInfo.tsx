// ============================================================
// SESSION INFO — Heures Maroc + Sessions
// ============================================================

interface SessionData {
  session: string;
  sessionName: string;
  liquidity: string;
  isHighLiquidity: boolean;
  moroccoTime: string;
}

interface SessionInfoProps {
  session: SessionData | null;
  statusMsg: string;
  analysisCount: number;
  countdown: number;
}

export function SessionInfo({ session, statusMsg, analysisCount, countdown }: SessionInfoProps) {
  const s = session;

  const getSessionColor = () => {
    if (!s) return 'text-[#4a5568]';
    if (s.session === 'Overlap') return 'text-[#ffd700]';
    if (s.isHighLiquidity) return 'text-[#48bb78]';
    return 'text-[#ed8936]';
  };

  return (
    <div className="bg-[#1a202c] rounded-xl border border-[#2d3748] p-4">
      <h3 className="text-sm font-bold text-[#a0aec0] mb-3 flex items-center gap-2">
        <span className="text-[#63b3ed]">🕐</span> Session & Systeme
      </h3>

      {/* Maroc Time */}
      <div className="mb-3 p-3 bg-[#0d1117] rounded-lg text-center">
        <p className="text-[10px] text-[#4a5568]">Heure Maroc (GMT+1)</p>
        <p className="text-2xl font-black text-[#ffd700] tabular-nums">{s?.moroccoTime || '--:--'}</p>
      </div>

      {/* Session */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Session</span>
          <span className={`font-bold ${getSessionColor()}`}>{s?.sessionName || 'Chargement...'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Liquidite</span>
          <span className={`font-bold ${s?.isHighLiquidity ? 'text-[#48bb78]' : 'text-[#ed8936]'}`}>
            {s?.liquidity || '---'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4a5568]">Golden Window</span>
          <span className={`font-bold ${s?.session === 'Overlap' ? 'text-[#ffd700]' : 'text-[#4a5568]'}`}>
            {s?.session === 'Overlap' ? 'ACTIVE (13h-16h)' : 'Attente 13h-16h'}
          </span>
        </div>
      </div>

      {/* Sessions Timeline */}
      <div className="mt-3 space-y-1">
        {[
          { name: 'Asie', hours: '00h-07h GMT', active: s?.session === 'Asia' },
          { name: 'Londres', hours: '07h-16h GMT', active: s?.session === 'London' },
          { name: 'New York', hours: '12h-21h GMT', active: s?.session === 'NewYork' },
          { name: 'Overlap', hours: '13h-16h GMT', active: s?.session === 'Overlap' },
        ].map((ses, i) => (
          <div key={i} className={`flex items-center justify-between text-[10px] px-2 py-1 rounded ${ses.active ? 'bg-[#2962FF]/10 border border-[#2962FF]/30' : 'bg-[#0d1117]'}`}>
            <span className={ses.active ? 'text-[#63b3ed] font-bold' : 'text-[#4a5568]'}>{ses.name}</span>
            <span className={ses.active ? 'text-[#63b3ed]' : 'text-[#4a5568]'}>{ses.hours}</span>
            {ses.active && <span className="text-[#48bb78]">●</span>}
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="mt-3 p-2 bg-[#0d1117] rounded">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-[#4a5568]">Status</span>
          <span className="text-[#48bb78] font-bold">{statusMsg || 'Actif'}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-[#4a5568]">Analyses</span>
          <span className="text-[#63b3ed] font-bold">#{analysisCount}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-[#4a5568]">Prochaine</span>
          <span className="text-[#ffd700] font-bold">{countdown}s</span>
        </div>
      </div>

      {/* Best Times */}
      <div className="mt-3 p-2 bg-[#ffd700]/5 rounded border border-[#ffd700]/10">
        <p className="text-[10px] text-[#ffd700] font-bold mb-1">Meilleurs creneaux</p>
        <p className="text-[10px] text-[#a0aec0]">London/NY Overlap: 13h-16h GMT</p>
        <p className="text-[10px] text-[#a0aec0]">London Open: 07h-10h GMT</p>
        <p className="text-[10px] text-[#a0aec0]">NY Open: 12h-14h GMT</p>
      </div>
    </div>
  );
}
