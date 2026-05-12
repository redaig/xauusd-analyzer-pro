// ============================================================
// ALERTES SONORES - Signal confirmé
// ============================================================

let audioEnabled = true;

try {
  audioEnabled = localStorage.getItem('xauusd_audio_enabled') !== 'false';
} catch { /* */ }

export function setAudioEnabled(enabled: boolean) {
  audioEnabled = enabled;
  try { localStorage.setItem('xauusd_audio_enabled', String(enabled)); } catch { /* */ }
}

export function isAudioEnabled() { return audioEnabled; }

// Son de notification
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* */ }
}

export function playSignalAlert(direction: 'bullish' | 'bearish', tier: 'quality' | 'premium' | 'diamond' = 'quality') {
  if (!audioEnabled) return;

  if (tier === 'diamond') {
    // 💎 Diamond = Alarme forte + vocal
    playTone(880, 0.15, 'square');
    setTimeout(() => playTone(1100, 0.15, 'square'), 150);
    setTimeout(() => playTone(1320, 0.2, 'square'), 300);
    setTimeout(() => playTone(880, 0.3, 'square'), 500);
    setTimeout(() => playTone(1320, 0.4, 'square'), 800);
  } else if (tier === 'premium') {
    // ⭐ Premium = Double arpège
    playTone(440, 0.1);
    setTimeout(() => playTone(554, 0.1), 80);
    setTimeout(() => playTone(659, 0.1), 160);
    setTimeout(() => playTone(880, 0.15), 240);
    setTimeout(() => playTone(440, 0.1), 500);
    setTimeout(() => playTone(554, 0.1), 580);
    setTimeout(() => playTone(659, 0.1), 660);
    setTimeout(() => playTone(880, 0.25), 740);
  } else {
    // ✓ Quality = Bip simple
    if (direction === 'bullish') {
      playTone(523, 0.15); // Do
      setTimeout(() => playTone(659, 0.15), 150); // Mi
      setTimeout(() => playTone(784, 0.3), 300); // Sol
    } else {
      playTone(784, 0.15); // Sol
      setTimeout(() => playTone(659, 0.15), 150); // Mi
      setTimeout(() => playTone(523, 0.3), 300); // Do
    }
  }
}

export function playSqueezeAlert() {
  if (!audioEnabled) return;
  playTone(880, 0.1, 'square');
  setTimeout(() => playTone(1100, 0.2, 'square'), 100);
}

export function playPremiumAlert() {
  if (!audioEnabled) return;
  // Arpège premium
  playTone(440, 0.1);
  setTimeout(() => playTone(554, 0.1), 100);
  setTimeout(() => playTone(659, 0.1), 200);
  setTimeout(() => playTone(880, 0.4), 300);
}

export function testAlert() {
  playSignalAlert('bullish');
}
