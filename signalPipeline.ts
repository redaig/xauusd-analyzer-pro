// ============================================================
// PIPELINE SIGNAUX: Max 2 PREMIUM par session
// Les 3 meilleurs vont dans "Signaux Swing Premium"
// ============================================================

import type { QualitySignal } from './qualityFilter';

export type SignalStage = 'forming' | 'confirmed';

export interface PipelineSignal {
  id: string;
  stage: SignalStage;
  signal: QualitySignal;
  createdAt: number;
  progress: number;
}

let activeSignals: PipelineSignal[] = [];
let signalCounter = 0;
let confirmedThisSession = 0;
const MAX_PER_SESSION = 2;

export function updatePipeline(newSignals: QualitySignal[]) {
  const now = Date.now();
  const confirmed: PipelineSignal[] = [];
  const forming: PipelineSignal[] = [];

  // Mettre a jour signaux existants
  for (const sig of activeSignals) {
    if (sig.stage === 'forming') {
      sig.progress = Math.min(100, sig.progress + 15);
      if (now - sig.createdAt > 300000) {
        sig.stage = 'confirmed';
        sig.signal.quality.status = 'confirmed';
        if (confirmedThisSession < MAX_PER_SESSION) {
          confirmed.push(sig);
          confirmedThisSession++;
        }
      } else {
        forming.push(sig);
      }
    } else if (sig.stage === 'confirmed') {
      confirmed.push(sig);
    }
  }

  // Ajouter nouveaux signaux (max 2 confirmes par session)
  for (const qs of newSignals) {
    const exists = activeSignals.some(s => Math.abs(s.signal.entryPrice - qs.entryPrice) < 1);
    if (exists) continue;

    if (qs.quality.status === 'confirmed' && confirmedThisSession < MAX_PER_SESSION) {
      const pipeline: PipelineSignal = {
        id: `sig-${now}-${++signalCounter}`,
        stage: 'confirmed',
        signal: qs,
        createdAt: now,
        progress: 100,
      };
      activeSignals.push(pipeline);
      confirmed.push(pipeline);
      confirmedThisSession++;
    } else {
      const pipeline: PipelineSignal = {
        id: `sig-${now}-${++signalCounter}`,
        stage: 'forming',
        signal: qs,
        createdAt: now,
        progress: 0,
      };
      activeSignals.push(pipeline);
      forming.push(pipeline);
    }
  }

  // Nettoyer vieux signaux
  activeSignals = activeSignals.filter(s => now - s.createdAt < 3600000);

  // Swing Premium: 3 meilleurs confirmes
  const swingPremium = [...confirmed]
    .sort((a, b) => b.signal.quality.score - a.signal.quality.score)
    .slice(0, 3);

  return { confirmed, forming, swingPremium };
}

export function getPipelineStats() {
  return {
    total: activeSignals.length,
    confirmed: activeSignals.filter(s => s.stage === 'confirmed').length,
    forming: activeSignals.filter(s => s.stage === 'forming').length,
    confirmedThisSession,
    maxPerSession: MAX_PER_SESSION,
    currentSession: new Date().getUTCHours() >= 13 && new Date().getUTCHours() < 16 ? 'OVERLAP' : 'ACTIVE',
  };
}

export function resetPipeline() {
  activeSignals = [];
  signalCounter = 0;
  confirmedThisSession = 0;
}
