// ============================================================
// HISTORIQUE DES PRIX - 24h
// ============================================================

export interface PricePoint {
  timestamp: number;
  price: number;
  source: string;
}

const MAX_POINTS = 2880; // 24h * 60min * 2 (toutes les 30s)

let history: PricePoint[] = [];

// Charger depuis localStorage
try {
  const saved = localStorage.getItem('xauusd_price_history');
  if (saved) {
    history = JSON.parse(saved);
  }
} catch { /* */ }

export function addPricePoint(price: number, source: string) {
  const now = Date.now();
  // Éviter doublons < 5s
  if (history.length > 0 && now - history[history.length - 1].timestamp < 5000) {
    history[history.length - 1] = { timestamp: now, price, source };
  } else {
    history.push({ timestamp: now, price, source });
  }
  if (history.length > MAX_POINTS) {
    history = history.slice(-MAX_POINTS);
  }
  try {
    localStorage.setItem('xauusd_price_history', JSON.stringify(history));
  } catch { /* */ }
}

export function getPriceHistory(hours: number = 24): PricePoint[] {
  const cutoff = Date.now() - hours * 3600 * 1000;
  return history.filter(p => p.timestamp >= cutoff);
}

export function getPriceHistory24h(): PricePoint[] {
  return getPriceHistory(24);
}

export function getPriceStats() {
  const h24 = getPriceHistory24h();
  if (h24.length === 0) return { high: 0, low: 0, open: 0, close: 0, avg: 0, volatility: 0 };
  const prices = h24.map(p => p.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const open = prices[0];
  const close = prices[prices.length - 1];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
  const volatility = Math.sqrt(variance);
  return { high, low, open, close, avg, volatility };
}

export function getCandleData(intervalMinutes: number = 30) {
  const raw = getPriceHistory24h();
  if (raw.length === 0) return [];

  const candles: { time: string; open: number; high: number; low: number; close: number }[] = [];
  let currentCandle: { open: number; high: number; low: number; close: number; start: number } | null = null;

  for (const point of raw) {
    if (!currentCandle || point.timestamp - currentCandle.start >= intervalMinutes * 60 * 1000) {
      if (currentCandle) {
        const date = new Date(currentCandle.start);
        candles.push({
          time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          open: currentCandle.open,
          high: currentCandle.high,
          low: currentCandle.low,
          close: currentCandle.close,
        });
      }
      currentCandle = { open: point.price, high: point.price, low: point.price, close: point.price, start: point.timestamp };
    } else {
      currentCandle.high = Math.max(currentCandle.high, point.price);
      currentCandle.low = Math.min(currentCandle.low, point.price);
      currentCandle.close = point.price;
    }
  }

  if (currentCandle) {
    const date = new Date(currentCandle.start);
    candles.push({
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      open: currentCandle.open,
      high: currentCandle.high,
      low: currentCandle.low,
      close: currentCandle.close,
    });
  }

  return candles;
}
