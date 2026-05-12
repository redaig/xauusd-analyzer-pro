// ==UserScript==
// @name         XAU/USD Price Sender V6.0
// @namespace    tv-price-sender
// @version      6.0
// @description  Envoie le prix XAU/USD OANDA depuis TradingView vers le backend
// @author       MCTPRO
// @match        https://www.tradingview.com/symbols/XAUUSD*
// @match        https://fr.tradingview.com/symbols/XAUUSD*
// @match        https://www.tradingview.com/symbols/OANDA-XAUUSD*
// @match        https://fr.tradingview.com/symbols/OANDA-XAUUSD*
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const NTFY_TOPIC = 'xauusd-mctpro-price';
    const NTFY_URL = 'https://ntfy.sh/' + NTFY_TOPIC;
    const INTERVAL = 30000; // 30 secondes
    let lastPrice = 0;
    let lastSend = 0;
    let isActive = false;

    // Parse prix FR: "4 737,100" ou EN: "4,737.100"
    function parsePriceText(text) {
        if (!text) return 0;
        let t = text.replace(/USD?\$/gi, '').trim();
        if (t.includes(' ') && t.includes(',')) {
            t = t.replace(/\s/g, '').replace(',', '.');
        } else if (t.includes(',') && !t.includes('.')) {
            t = t.replace(',', '.');
        } else if (t.includes(',') && t.includes('.')) {
            t = t.replace(/,/g, '');
        } else if (t.includes(' ')) {
            t = t.replace(/\s/g, '');
        }
        const p = parseFloat(t);
        return (p > 4000 && p < 6000) ? p : 0;
    }

    function getPriceFromTV() {
        let p = 0;

        // h1 price
        let el = document.querySelector('h1[class*="price"]');
        if (el) { p = parsePriceText(el.textContent); if (p) return p; }

        // priceValue
        el = document.querySelector('.priceValue-G1h3ZX4I');
        if (el) { p = parsePriceText(el.textContent); if (p) return p; }

        // any priceValue
        el = document.querySelector('[class*="priceValue"]');
        if (el) { p = parsePriceText(el.textContent); if (p) return p; }

        // OANDA symbol
        el = document.querySelector('[data-symbol="OANDA:XAUUSD"]');
        if (el) {
            let child = el.querySelector('[class*="price"]');
            if (child) { p = parsePriceText(child.textContent); if (p) return p; }
        }

        // last resort: scan page
        const body = document.body.innerText;
        const m = body.match(/([4-5]\d{3}[\s,]?\d{3}[,.]\d{2,3})/);
        if (m) return parsePriceText(m[1]);

        const m2 = body.match(/([4-5]\d{3}[,.]\d+)/);
        if (m2) return parsePriceText(m2[1]);

        return 0;
    }

    function sendPrice(price) {
        if (!price) return;
        const now = Date.now();
        if (Math.abs(price - lastPrice) < 0.1) return; // prix inchangé
        if ((now - lastSend) < 5000) return; // anti-spam

        lastPrice = price;
        lastSend = now;

        // Envoyer via ntfy.sh (cross-domain, pas de CORS)
        try {
            GM_xmlhttpRequest({
                method: 'POST',
                url: NTFY_URL,
                headers: {
                    'Content-Type': 'text/plain',
                    'Title': 'XAUUSD TV Pro',
                    'Priority': 'default'
                },
                data: String(price),
                timeout: 15000,
                onload: function(r) {
                    if (r.status === 429) {
                        console.log('[TV-Prix] 429 rate limit - attendre');
                    } else {
                        console.log('[TV-Prix] OK $' + price.toFixed(2));
                    }
                },
                onerror: function() {
                    console.log('[TV-Prix] Erreur reseau');
                },
                ontimeout: function() {
                    console.log('[TV-Prix] Timeout');
                }
            });
        } catch(e) {
            console.log('[TV-Prix] Exception:', e.message);
        }
    }

    function tick() {
        const p = getPriceFromTV();
        if (p > 0) {
            console.log('[TV-Prix] Lu: $' + p.toFixed(2));
            sendPrice(p);
        } else {
            console.log('[TV-Prix] Prix non trouvé');
        }
    }

    function init() {
        console.log('[TV-Prix] V6.0 ACTIVE');
        console.log('[TV-Prix] URL:', window.location.href);

        // Premier envoi apres 3s
        setTimeout(tick, 3000);

        // Puis toutes les 30s
        setInterval(tick, INTERVAL);

        isActive = true;

        // Afficher badge
        const badge = document.createElement('div');
        badge.id = 'tv-price-badge';
        badge.innerHTML = '📡 TV-Prix V6.0';
        badge.style.cssText = 'position:fixed;top:5px;right:5px;z-index:999999;background:#2962FF;color:#fff;padding:4px 8px;border-radius:4px;font-size:11px;font-family:monospace;';
        document.body.appendChild(badge);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
