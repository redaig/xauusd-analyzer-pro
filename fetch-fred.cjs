// Script de pre-build: Fetch les donnees FRED et les sauvegarde
const fs = require('fs');
const https = require('https');

const API_KEY = '9257f2ba3e95b7f249f0c11cce2bb109';
const OUTPUT = './public/fred-data.json';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('[FRED] Fetching economic data...');

  const series = {
    FEDFUNDS: 'FEDFUNDS',
    CPIAUCSL: 'CPIAUCSL',
    CPILFESL: 'CPILFESL',
    UNRATE: 'UNRATE',
    PAYEMS: 'PAYEMS',
    DGS10: 'DGS10',
    DTWEXBGS: 'DTWEXBGS',
    PPIACO: 'PPIACO',
    UMCSENT: 'UMCSENT',
    RSAFS: 'RSAFS',
    INDPRO: 'INDPRO',
    HOUST: 'HOUST',
    M2SL: 'M2SL',
    VIXCLS: 'VIXCLS',
  };

  const results = {};

  for (const [name, id] of Object.entries(series)) {
    try {
      const limit = name === 'CPIAUCSL' || name === 'CPILFESL' || name === 'PPIACO' ? 15 : 3;
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
      const data = await fetchJson(url);
      results[name] = data;
      console.log(`[FRED] ${name}: ${data.observations?.[0]?.value || 'N/A'} (${data.observations?.[0]?.date || ''})`);
    } catch (err) {
      console.error(`[FRED] Error ${name}:`, err.message);
      results[name] = null;
    }
  }

  // Calculer les derivees
  const cpiObs = results.CPIAUCSL?.observations || [];
  const cpiYoY = cpiObs.length >= 13
    ? (((parseFloat(cpiObs[0].value) - parseFloat(cpiObs[12].value)) / parseFloat(cpiObs[12].value)) * 100).toFixed(2)
    : '0';
  const cpiMoM = cpiObs.length >= 2
    ? (((parseFloat(cpiObs[0].value) - parseFloat(cpiObs[1].value)) / parseFloat(cpiObs[1].value)) * 100).toFixed(2)
    : '0';

  const coreObs = results.CPILFESL?.observations || [];
  const coreCpiYoY = coreObs.length >= 13
    ? (((parseFloat(coreObs[0].value) - parseFloat(coreObs[12].value)) / parseFloat(coreObs[12].value)) * 100).toFixed(2)
    : '0';

  const ppiObs = results.PPIACO?.observations || [];
  const ppiYoY = ppiObs.length >= 13
    ? (((parseFloat(ppiObs[0].value) - parseFloat(ppiObs[12].value)) / parseFloat(ppiObs[12].value)) * 100).toFixed(2)
    : '0';

  const nfpObs = results.PAYEMS?.observations || [];
  const nfpChange = nfpObs.length >= 2
    ? (parseFloat(nfpObs[0].value) - parseFloat(nfpObs[1].value)).toFixed(0)
    : '0';

  const retailObs = results.RSAFS?.observations || [];
  const retailMoM = retailObs.length >= 2
    ? (((parseFloat(retailObs[0].value) - parseFloat(retailObs[1].value)) / parseFloat(retailObs[1].value)) * 100).toFixed(2)
    : '0';

  const output = {
    timestamp: new Date().toISOString(),
    fedRate: results.FEDFUNDS?.observations?.[0]?.value || '0',
    fedDate: results.FEDFUNDS?.observations?.[0]?.date || '',
    cpiIndex: results.CPIAUCSL?.observations?.[0]?.value || '0',
    cpiDate: results.CPIAUCSL?.observations?.[0]?.date || '',
    cpiYoY,
    cpiMoM,
    coreCpiIndex: results.CPILFESL?.observations?.[0]?.value || '0',
    coreCpiYoY,
    unemployment: results.UNRATE?.observations?.[0]?.value || '0',
    unempDate: results.UNRATE?.observations?.[0]?.date || '',
    nfpLevel: results.PAYEMS?.observations?.[0]?.value || '0',
    nfpDate: results.PAYEMS?.observations?.[0]?.date || '',
    nfpChange,
    us10y: results.DGS10?.observations?.[0]?.value || '0',
    us10yDate: results.DGS10?.observations?.[0]?.date || '',
    dxy: results.DTWEXBGS?.observations?.[0]?.value || '0',
    dxyDate: results.DTWEXBGS?.observations?.[0]?.date || '',
    ppiIndex: results.PPIACO?.observations?.[0]?.value || '0',
    ppiYoY,
    consumerSentiment: results.UMCSENT?.observations?.[0]?.value || '0',
    retailSales: results.RSAFS?.observations?.[0]?.value || '0',
    retailSalesMoM: retailMoM,
    industrialProduction: results.INDPRO?.observations?.[0]?.value || '0',
    housingStarts: results.HOUST?.observations?.[0]?.value || '0',
    m2Supply: results.M2SL?.observations?.[0]?.value || '0',
    vix: results.VIXCLS?.observations?.[0]?.value || '0',
  };

  fs.mkdirSync('./public', { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`[FRED] Saved to ${OUTPUT}`);
  console.log('[FRED] CPI YoY:', cpiYoY + '%');
  console.log('[FRED] FED Rate:', output.fedRate + '%');
  console.log('[FRED] DXY:', output.dxy);
}

main().catch(console.error);
