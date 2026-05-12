// ============================================================
// FRED API — Donnees economiques reelles
// 1. Charge les donnees pre-fetched (public/fred-data.json)
// 2. Essaie d actualiser via API FRED
// Clef: 9257f2ba3e95b7f249f0c11cce2bb109
// ============================================================

const FRED_BASE = 'https://api.stlouisfed.org/fred';
const API_KEY = '9257f2ba3e95b7f249f0c11cce2bb109';

// ============================================================
// DONNEES PRE-FETCHED (chargees au build)
// ============================================================

export interface RealMacroData {
  fedRate: number;
  cpiIndex: number;
  cpiYoY: number;
  cpiMoM: number;
  coreCpiIndex: number;
  coreCpiYoY: number;
  unemployment: number;
  nfpLevel: number;
  nfpChange: number;
  us10y: number;
  dxy: number;
  ppiIndex: number;
  ppiYoY: number;
  consumerSentiment: number;
  retailSales: number;
  retailSalesMoM: number;
  industrialProduction: number;
  housingStarts: number;
  m2Supply: number;
  vix: number;
  yieldCurve: number;
  lastUpdated: string;
  sources: Record<string, string>;
}

export async function loadPrebuiltData(): Promise<RealMacroData | null> {
  try {
    const resp = await fetch('/fred-data.json', { cache: 'no-cache' });
    if (!resp.ok) return null;
    const raw = await resp.json();

    return {
      fedRate: parseFloat(raw.fedRate) || 0,
      cpiIndex: parseFloat(raw.cpiIndex) || 0,
      cpiYoY: parseFloat(raw.cpiYoY) || 0,
      cpiMoM: parseFloat(raw.cpiMoM) || 0,
      coreCpiIndex: parseFloat(raw.coreCpiIndex) || 0,
      coreCpiYoY: parseFloat(raw.coreCpiYoY) || 0,
      unemployment: parseFloat(raw.unemployment) || 0,
      nfpLevel: parseFloat(raw.nfpLevel) || 0,
      nfpChange: parseFloat(raw.nfpChange) || 0,
      us10y: parseFloat(raw.us10y) || 0,
      dxy: parseFloat(raw.dxy) || 0,
      ppiIndex: parseFloat(raw.ppiIndex) || 0,
      ppiYoY: parseFloat(raw.ppiYoY) || 0,
      consumerSentiment: parseFloat(raw.consumerSentiment) || 0,
      retailSales: parseFloat(raw.retailSales) || 0,
      retailSalesMoM: parseFloat(raw.retailSalesMoM) || 0,
      industrialProduction: parseFloat(raw.industrialProduction) || 0,
      housingStarts: parseFloat(raw.housingStarts) || 0,
      m2Supply: parseFloat(raw.m2Supply) || 0,
      vix: parseFloat(raw.vix) || 0,
      yieldCurve: parseFloat(raw.yieldCurve) || 0,
      lastUpdated: raw.timestamp || new Date().toISOString(),
      sources: {
        fed: raw.fedDate || '',
        cpi: raw.cpiDate || '',
        unemp: raw.unempDate || '',
        nfp: raw.nfpDate || '',
        us10y: raw.us10yDate || '',
        dxy: raw.dxyDate || '',
      },
    };
  } catch {
    return null;
  }
}

// ============================================================
// API FRED (actualisation temps reel si possible)
// ============================================================

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

async function fetchFredSeries(seriesId: string, limit: number = 6): Promise<FredResponse | null> {
  try {
    const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch {
    return null;
  }
}

// Essayer d actualiser depuis FRED API
export async function fetchRealMacroData(): Promise<RealMacroData | null> {
  // Charger d abord les donnees pre-fetched
  const prebuilt = await loadPrebuiltData();

  // Essayer de fetcher les donnees fraiches
  try {
    const [fedData, cpiData, unempData, nfpData, us10yData, dxyData] = await Promise.all([
      fetchFredSeries('FEDFUNDS', 3),
      fetchFredSeries('CPIAUCSL', 15),
      fetchFredSeries('UNRATE', 3),
      fetchFredSeries('PAYEMS', 3),
      fetchFredSeries('DGS10', 3),
      fetchFredSeries('DTWEXBGS', 3),
    ]);

    // Si l API a repondu, utiliser les donnees fraiches
    if (fedData?.observations?.[0]?.value) {
      const cpi = cpiData?.observations || [];
      const cpiYoY = cpi.length >= 13
        ? parseFloat(((((parseFloat(cpi[0].value) - parseFloat(cpi[12].value)) / parseFloat(cpi[12].value)) * 100)).toFixed(2))
        : (prebuilt?.cpiYoY || 0);

      const nfp = nfpData?.observations || [];
      const nfpChange = nfp.length >= 2
        ? parseFloat((parseFloat(nfp[0].value) - parseFloat(nfp[1].value)).toFixed(0))
        : (prebuilt?.nfpChange || 0);

      return {
        fedRate: parseFloat(fedData.observations[0].value) || (prebuilt?.fedRate || 0),
        cpiIndex: parseFloat(cpiData?.observations?.[0]?.value || '0') || (prebuilt?.cpiIndex || 0),
        cpiYoY,
        cpiMoM: prebuilt?.cpiMoM || 0,
        coreCpiIndex: prebuilt?.coreCpiIndex || 0,
        coreCpiYoY: prebuilt?.coreCpiYoY || 0,
        unemployment: parseFloat(unempData?.observations?.[0]?.value || '0') || (prebuilt?.unemployment || 0),
        nfpLevel: parseFloat(nfpData?.observations?.[0]?.value || '0') || (prebuilt?.nfpLevel || 0),
        nfpChange,
        us10y: parseFloat(us10yData?.observations?.[0]?.value || '0') || (prebuilt?.us10y || 0),
        dxy: parseFloat(dxyData?.observations?.[0]?.value || '0') || (prebuilt?.dxy || 0),
        ppiIndex: prebuilt?.ppiIndex || 0,
        ppiYoY: prebuilt?.ppiYoY || 0,
        consumerSentiment: prebuilt?.consumerSentiment || 0,
        retailSales: prebuilt?.retailSales || 0,
        retailSalesMoM: prebuilt?.retailSalesMoM || 0,
        industrialProduction: prebuilt?.industrialProduction || 0,
        housingStarts: prebuilt?.housingStarts || 0,
        m2Supply: prebuilt?.m2Supply || 0,
        vix: prebuilt?.vix || 0,
        yieldCurve: prebuilt?.yieldCurve || 0,
        lastUpdated: new Date().toISOString(),
        sources: {
          fed: fedData?.observations?.[0]?.date || prebuilt?.sources.fed || '',
          cpi: cpiData?.observations?.[0]?.date || prebuilt?.sources.cpi || '',
          unemp: unempData?.observations?.[0]?.date || prebuilt?.sources.unemp || '',
          nfp: nfpData?.observations?.[0]?.date || prebuilt?.sources.nfp || '',
          us10y: us10yData?.observations?.[0]?.date || prebuilt?.sources.us10y || '',
          dxy: dxyData?.observations?.[0]?.date || prebuilt?.sources.dxy || '',
        },
      };
    }
  } catch {
    // Fallback: utiliser les donnees pre-fetched
  }

  // Si l API a echoue, retourner les donnees pre-fetched
  return prebuilt;
}

// ============================================================
// ANALYSE D'IMPACT SUR XAU/USD
// ============================================================

export interface ImpactAnalysis {
  factor: string;
  value: number;
  unit: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  impactStrength: number;
  description: string;
}

export function analyzeImpact(data: RealMacroData): ImpactAnalysis[] {
  const impacts: ImpactAnalysis[] = [];

  // FED Rate
  if (data.fedRate > 0) {
    const strength = Math.min(100, (data.fedRate / 6) * 100);
    impacts.push({
      factor: 'FED Funds Rate',
      value: data.fedRate,
      unit: '%',
      impact: data.fedRate > 4.5 ? 'bearish' : data.fedRate < 2.0 ? 'bullish' : 'neutral',
      impactStrength: Math.round(strength),
      description: data.fedRate > 4.5
        ? 'Taux eleves = dollar fort = OR faible'
        : data.fedRate < 2.0
          ? 'Taux bas = dollar faible = OR fort'
          : `Taux moderes (${data.fedRate}%)`,
    });
  }

  // CPI YoY
  if (data.cpiYoY !== 0) {
    const strength = Math.min(100, Math.abs(data.cpiYoY) * 15);
    impacts.push({
      factor: 'CPI YoY (Inflation)',
      value: data.cpiYoY,
      unit: '%',
      impact: data.cpiYoY > 3.0 ? 'bullish' : 'neutral',
      impactStrength: Math.round(strength),
      description: data.cpiYoY > 3.0
        ? `Inflation ${data.cpiYoY}% = devaluation monnaie = OR refuge`
        : `Inflation ${data.cpiYoY}% moderee`,
    });
  }

  // Core CPI
  if (data.coreCpiYoY !== 0) {
    impacts.push({
      factor: 'Core CPI YoY',
      value: data.coreCpiYoY,
      unit: '%',
      impact: data.coreCpiYoY > 3.0 ? 'bullish' : 'neutral',
      impactStrength: Math.round(Math.min(100, Math.abs(data.coreCpiYoY) * 15)),
      description: data.coreCpiYoY > 3.0 ? `Core inflation ${data.coreCpiYoY}% = OR refuge` : `Core inflation ${data.coreCpiYoY}% stable`,
    });
  }

  // PPI
  if (data.ppiYoY !== 0) {
    impacts.push({
      factor: 'PPI YoY',
      value: data.ppiYoY,
      unit: '%',
      impact: data.ppiYoY > 2.0 ? 'bullish' : 'neutral',
      impactStrength: Math.round(Math.min(100, Math.abs(data.ppiYoY) * 12)),
      description: data.ppiYoY > 2.0 ? `Inflation production ${data.ppiYoY}% = OR` : `PPI ${data.ppiYoY}% stable`,
    });
  }

  // Unemployment
  if (data.unemployment > 0) {
    const strength = Math.min(100, data.unemployment * 15);
    impacts.push({
      factor: 'Unemployment Rate',
      value: data.unemployment,
      unit: '%',
      impact: data.unemployment > 5.0 ? 'bullish' : data.unemployment < 3.5 ? 'bearish' : 'neutral',
      impactStrength: Math.round(strength),
      description: data.unemployment > 5.0
        ? `Chomage ${data.unemployment}% = recession = OR`
        : data.unemployment < 3.5
          ? `Plein emploi ${data.unemployment}% = OR faible`
          : `Chomage ${data.unemployment}% normal`,
    });
  }

  // NFP Change
  if (data.nfpChange !== 0) {
    const strength = Math.min(100, Math.abs(data.nfpChange) / 3);
    impacts.push({
      factor: 'NFP Change',
      value: data.nfpChange,
      unit: 'K jobs',
      impact: data.nfpChange > 250 ? 'bearish' : data.nfpChange < 50 ? 'bullish' : 'neutral',
      impactStrength: Math.round(strength),
      description: data.nfpChange > 250
        ? `NFP +${data.nfpChange}K fort = dollar fort`
        : data.nfpChange < 50
          ? `NFP ${data.nfpChange}K faible = OR refuge`
          : `NFP +${data.nfpChange}K neutre`,
    });
  }

  // US 10Y Yield
  if (data.us10y > 0) {
    const strength = Math.min(100, (data.us10y / 6) * 100);
    impacts.push({
      factor: 'US 10Y Treasury',
      value: data.us10y,
      unit: '%',
      impact: data.us10y > 4.5 ? 'bearish' : data.us10y < 3.0 ? 'bullish' : 'neutral',
      impactStrength: Math.round(strength),
      description: data.us10y > 4.5
        ? `Yields ${data.us10y}% eleves = cout OR eleve`
        : data.us10y < 3.0
          ? `Yields ${data.us10y}% bas = OR attractif`
          : `Yields ${data.us10y}% neutres`,
    });
  }

  // DXY
  if (data.dxy > 0) {
    const strength = Math.min(100, (data.dxy / 120) * 100);
    impacts.push({
      factor: 'DXY (Dollar Index)',
      value: data.dxy,
      unit: '',
      impact: data.dxy > 105 ? 'bearish' : data.dxy < 95 ? 'bullish' : 'neutral',
      impactStrength: Math.round(strength),
      description: data.dxy > 105
        ? `DXY ${data.dxy.toFixed(1)} fort = XAU/USD baisse`
        : data.dxy < 95
          ? `DXY ${data.dxy.toFixed(1)} faible = XAU/USD hausse`
          : `DXY ${data.dxy.toFixed(1)} neutre`,
    });
  }

  // VIX
  if (data.vix > 0) {
    impacts.push({
      factor: 'VIX (Fear Index)',
      value: data.vix,
      unit: '',
      impact: data.vix > 25 ? 'bullish' : 'neutral',
      impactStrength: Math.round(Math.min(100, (data.vix / 40) * 100)),
      description: data.vix > 25 ? `VIX ${data.vix} = peur = OR refuge` : `VIX ${data.vix} = volatilite normale`,
    });
  }

  // Retail Sales
  if (data.retailSalesMoM !== 0) {
    impacts.push({
      factor: 'Retail Sales MoM',
      value: data.retailSalesMoM,
      unit: '%',
      impact: data.retailSalesMoM > 1.0 ? 'bearish' : data.retailSalesMoM < 0 ? 'bullish' : 'neutral',
      impactStrength: Math.round(Math.min(100, Math.abs(data.retailSalesMoM) * 30)),
      description: data.retailSalesMoM > 1.0
        ? `Retail +${data.retailSalesMoM}% = conso forte = dollar`
        : data.retailSalesMoM < 0
          ? `Retail ${data.retailSalesMoM}% = conso faible = OR`
          : `Retail +${data.retailSalesMoM}% stable`,
    });
  }

  return impacts;
}

// Calculer le biais global
export function calculateMacroBias(impacts: ImpactAnalysis[]): { bias: 'bullish' | 'bearish' | 'neutral'; score: number; strength: number } {
  let bullishScore = 0;
  let bearishScore = 0;
  let totalWeight = 0;

  for (const imp of impacts) {
    const weight = imp.impactStrength;
    if (imp.impact === 'bullish') bullishScore += weight;
    else if (imp.impact === 'bearish') bearishScore += weight;
    totalWeight += weight;
  }

  const netScore = bullishScore - bearishScore;
  const maxPossible = totalWeight || 1;
  const normalizedScore = ((netScore + maxPossible) / (2 * maxPossible)) * 100;

  let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (normalizedScore > 55) bias = 'bullish';
  else if (normalizedScore < 45) bias = 'bearish';

  const strength = Math.abs(normalizedScore - 50) * 2;

  return {
    bias,
    score: Math.round(normalizedScore),
    strength: Math.round(Math.min(100, strength)),
  };
}
