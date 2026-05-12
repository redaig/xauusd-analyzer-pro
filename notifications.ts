// ============================================================
// NOTIFICATIONS — Alertes instantanees pour signaux Diamond/Premium
// Uses: Web Push API + Audio + Visual
// ============================================================

const NOTIFICATION_STORAGE_KEY = 'xauusd_notifications_enabled';

// Verifier si les notifications sont supportees
export function areNotificationsSupported(): boolean {
  return 'Notification' in window;
}

// Verifier si les notifications sont activees
export function areNotificationsEnabled(): boolean {
  if (!areNotificationsSupported()) return false;
  return Notification.permission === 'granted';
}

// Demander la permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!areNotificationsSupported()) return false;
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    try { localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true'); } catch { /* */ }
    return true;
  }
  return false;
}

// Envoyer une notification pour un signal
export function sendSignalNotification(signal: {
  type: string;
  direction: 'bullish' | 'bearish';
  entry: number;
  sl: number;
  tp: number;
  score: number;
  tier: string;
}): void {
  if (!areNotificationsEnabled()) return;
  
  const emoji = signal.direction === 'bullish' ? '🟢' : '🔴';
  const tierEmoji = signal.tier === 'diamond' ? '💎' : signal.tier === 'premium' ? '⭐' : '✓';
  
  try {
    new Notification(`${emoji} SIGNAL ${tierEmoji} ${signal.tier.toUpperCase()} — XAU/USD`, {
      body: `${signal.direction === 'bullish' ? 'ACHETER' : 'VENDRE'} a $${signal.entry.toFixed(2)}\nSL: $${signal.sl.toFixed(2)} | TP: $${signal.tp.toFixed(2)}\nScore: ${signal.score}/150`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `signal-${Date.now()}`,
      requireInteraction: true,
      // vibrate: [200, 100, 200, 100, 400],
    });
  } catch (err) {
    console.error('[Notification] Failed:', err);
  }
}

// Notification pour cloture de trade
export function sendTradeCloseNotification(trade: {
  type: string;
  direction: 'bullish' | 'bearish';
  pnl: number;
  result: 'win' | 'loss' | 'breakeven';
}): void {
  if (!areNotificationsEnabled()) return;
  
  const isWin = trade.result === 'win';
  const emoji = isWin ? '✅' : trade.result === 'breakeven' ? '⚪' : '❌';
  
  try {
    new Notification(`${emoji} Trade Cloture — ${trade.type}`, {
      body: `${trade.direction === 'bullish' ? 'LONG' : 'SHORT'} ${trade.result.toUpperCase()}\nP&L: ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`,
      icon: '/favicon.ico',
      tag: `close-${Date.now()}`,
    });
  } catch (err) {
    console.error('[Notification] Close failed:', err);
  }
}

// Son d'alerte pour signal
export function playSignalSound(tier: 'diamond' | 'premium' | 'quality'): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();
    
    if (tier === 'diamond') {
      // Diamond: 5 tonalites fortes
      [880, 1100, 1320, 880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2 + i * 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + 0.2 + i * 0.15);
      });
    } else if (tier === 'premium') {
      // Premium: double arpege
      [440, 554, 659, 880, 440, 554, 659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.2;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1 + i * 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + 0.1 + i * 0.08);
      });
    } else {
      // Quality: bip simple
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15 + i * 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + 0.15 + i * 0.15);
      });
    }
  } catch {
    // Audio not supported
  }
}

// In-app toast notification (visuel dans le UI)
export function showToast(message: string, type: 'success' | 'warning' | 'info' = 'info'): void {
  const existing = document.getElementById('xauusd-toast-container');
  if (existing) existing.remove();
  
  const container = document.createElement('div');
  container.id = 'xauusd-toast-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 350px;
    font-family: system-ui, sans-serif;
  `;
  
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#48bb78' : type === 'warning' ? '#ed8936' : '#2962FF';
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
  `;
  toast.textContent = message;
  toast.onclick = () => toast.remove();
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  container.appendChild(toast);
  document.body.appendChild(container);
  
  // Auto remove after 10 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => container.remove(), 300);
  }, 10000);
}
