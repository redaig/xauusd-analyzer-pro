#!/usr/bin/env node
/**
 * Scraper TradingView OANDA XAU/USD
 * Utilise Puppeteer pour récupérer le prix exact de TradingView
 */

const puppeteer = require('puppeteer');

const TV_URL = 'https://www.tradingview.com/symbols/OANDA-XAUUSD/';
let cachedPrice = {
  bid: 4737.10,
  ask: 4737.57,
  spread: 0.47,
  change: 21.39,
  changePercent: 0.45,
  source: 'TradingView OANDA',
  timestamp: Date.now(),
  isUp: true,
};
let browser = null;
let page = null;
let lastScrapeTime = 0;

async function initBrowser() {
  console.log('[TV-Scraper] Initializing browser...');
  browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  page = await browser.newPage();

  // User agent réaliste
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Intercepter les images et CSS pour accélérer
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
      req.abort();
    } else {
      req.continue();
    }
  });

  console.log('[TV-Scraper] Browser ready');
}

async function scrapePrice() {
  if (!page) {
    console.log('[TV-Scraper] Page not ready');
    return null;
  }

  try {
    console.log('[TV-Scraper] Scraping...');

    // Navigation
    await page.goto(TV_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Attendre le prix (différents sélecteurs)
    await page.waitForFunction(
      () => {
        const selectors = [
          'h1[class*="price"]',
          '.priceValue-G1h3ZX4I',
          '[class*="priceValue"]',
          '[data-symbol="OANDA:XAUUSD"]',
        ];
        return selectors.some((s) => document.querySelector(s));
      },
      { timeout: 15000 }
    );

    // Extraire le prix
    const priceData = await page.evaluate(() => {
      let price = 0;
      let change = 0;
      let changePct = 0;

      // Prix
      const h1 = document.querySelector('h1[class*="price"]');
      if (h1) {
        const txt = h1.textContent.replace(/\s/g, '').replace(',', '.');
        const m = txt.match(/([4-5]\d{3}\.\d+)/);
        if (m) price = parseFloat(m[1]);
      }

      if (!price) {
        const pv = document.querySelector('.priceValue-G1h3ZX4I');
        if (pv) {
          const txt = pv.textContent.replace(/\s/g, '').replace(',', '.');
          const p = parseFloat(txt);
          if (p > 4000 && p < 6000) price = p;
        }
      }

      if (!price) {
        const el = document.querySelector('[class*="priceValue"]');
        if (el) {
          const txt = el.textContent.replace(/\s/g, '').replace(',', '.');
          const p = parseFloat(txt);
          if (p > 4000 && p < 6000) price = p;
        }
      }

      // Change
      const changeEl = document.querySelector('[class*="changeValue"], [class*="change-percent"]');
      if (changeEl) {
        const txt = changeEl.textContent;
        const m = txt.match(/([+-]?\d+\.?\d*)/);
        if (m) changePct = parseFloat(m[1]);
      }

      return { price, change, changePct };
    });

    if (priceData.price > 4000 && priceData.price < 6000) {
      const spread = 0.47;
      const prevPrice = cachedPrice.bid || priceData.price;
      const change = priceData.price - prevPrice;

      cachedPrice = {
        bid: Math.round(priceData.price * 100) / 100,
        ask: Math.round((priceData.price + spread) * 100) / 100,
        spread: spread,
        change: Math.round(change * 100) / 100,
        changePercent: priceData.changePct || Math.round((change / prevPrice) * 10000) / 100,
        source: 'TradingView OANDA (scraped)',
        timestamp: Date.now(),
        isUp: change >= 0,
      };

      lastScrapeTime = Date.now();
      console.log('[TV-Scraper] Price:', cachedPrice.bid, 'Change:', cachedPrice.changePercent + '%');
      return cachedPrice;
    } else {
      console.log('[TV-Scraper] Invalid price:', priceData.price);
      return null;
    }
  } catch (err) {
    console.log('[TV-Scraper] Error:', err.message);
    return null;
  }
}

function getCachedPrice() {
  return {
    ...cachedPrice,
    age: Date.now() - lastScrapeTime,
  };
}

// Exports
module.exports = { initBrowser, scrapePrice, getCachedPrice };

// Si exécuté directement
if (require.main === module) {
  (async () => {
    await initBrowser();
    const result = await scrapePrice();
    console.log('Result:', JSON.stringify(result, null, 2));
    await browser.close();
    process.exit(0);
  })();
}
