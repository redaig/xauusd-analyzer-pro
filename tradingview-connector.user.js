// ==UserScript==
// @name         XAUUSD TradingView Prix → ntfy.sh
// @namespace    tv-xauusd-ntfy
// @version      5.3
// @description  Lit le prix XAU/USD depuis TradingView OANDA et l'envoie au site via ntfy.sh (gratuit, temps reel)
// @author       You
// @match        https://www.tradingview.com/symbols/OANDA-XAUUSD*
// @match        https://www.tradingview.com/symbols/XAUUSD/*
// @match        https://www.tradingview.com/chart/*
// @grant        GM_xmlhttpRequest
// @connect      ntfy.sh
// @connect      self
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    let lastSent = 0;
    // Topic unique — doit matcher celui du site
    const TOPIC = 'xauusd-mctpro-price';
    const NTFY_URL = 'https://ntfy.sh/' + TOPIC;

    // ===== PANNEAU =====
    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:999999;background:#0d1117;color:#48bb78;padding:12px 16px;border-radius:8px;font-family:monospace;font-size:12px;border:1px solid #48bb7840;min-width:240px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    panel.innerHTML = `
        <div style="font-weight:bold;color:#ffd700;margin-bottom:6px;">📊 TV Prix V5.3</div>
        <div id="tv-p" style="font-size:18px;margin-bottom:4px;font-weight:bold;color:#ffd700;">Prix: ...</div>
        <div id="tv-s" style="color:#666;margin-bottom:4px;">Demarrage...</div>
        <div style="color:#2962FF;font-size:10px;">ntfy: ${TOPIC}</div>
    `;
    document.body.appendChild(panel);

    function ui(price, msg, color) {
        const p = document.getElementById('tv-p');
        const s = document.getElementById('tv-s');
        if (p) p.textContent = '$' + price.toFixed(3);
        if (s) { s.textContent = msg; s.style.color = color || '#666'; }
    }

    // ===== LIRE LE PRIX =====
    function getPrice() {
        // Chercher "4,681.280" ou "4681.280" dans le DOM
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent?.trim() || '';
            const m = text.match(/(\d{1,3},\d{3}\.\d{2,3})/);
            if (m) {
                const num = parseFloat(m[1].replace(/,/g, ''));
                if (num >= 4000 && num <= 6000) {
                    const parent = node.parentElement;
                    if (parent) {
                        const pt = parent.textContent || '';
                        if (!pt.includes('Volume') && !pt.includes('Ticks') && !pt.includes('M') && !pt.includes('D')) return num;
                    }
                    return num;
                }
            }
        }
        // Titre
        const tm = document.title.match(/([\d,]+\.\d+)/);
        if (tm) {
            const num = parseFloat(tm[1].replace(/,/g, ''));
            if (num >= 4000 && num <= 6000) return num;
        }
        return null;
    }

    // ===== ENVOYER a ntfy.sh =====
    function sendNtfy(price) {
        lastSent = price;

        const payload = String(price);

        // GM_xmlhttpRequest (Tampermonkey) — contourne les restrictions CORS
        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: 'POST',
                url: NTFY_URL,
                headers: {
                    'Content-Type': 'text/plain',
                    'Title': 'XAUUSD Price',
                },
                data: payload,
                onload: function(response) {
                    if (response.status === 200) {
                        ui(price, '✓ Envoye a ntfy.sh', '#48bb78');
                    } else {
                        ui(price, 'Erreur HTTP ' + response.status, '#ed8936');
                    }
                },
                onerror: function() {
                    ui(price, '✗ Erreur reseau', '#ed8936');
                }
            });
        }
        // Fallback: fetch (peut echouer a cause de CORS)
        else {
            fetch(NTFY_URL, {
                method: 'POST',
                body: payload,
                headers: { 'Title': 'XAUUSD Price' }
            })
            .then(r => {
                if (r.ok) ui(price, '✓ Envoye', '#48bb78');
                else ui(price, 'Erreur ' + r.status, '#ed8936');
            })
            .catch(() => ui(price, '✗ Erreur', '#ed8936'));
        }

        console.log('[TV V5.3] Prix envoye a ntfy.sh:', price);
    }

    // ===== BOUCLE =====
    function tick() {
        const price = getPrice();
        if (price) {
            const shouldSend = Math.abs(price - lastSent) > 0.005 || Date.now() - lastSent > 5000;
            if (shouldSend) {
                sendNtfy(price);
            } else {
                ui(price, '...', '#666');
            }
        } else {
            ui(lastSent, '❌ Prix non trouve', '#ed8936');
        }
    }

    // ===== DEMARRAGE =====
    console.log('[TV V5.3] Demarre');
    console.log('[TV V5.3] Topic:', TOPIC);
    console.log('[TV V5.3] ntfy URL:', NTFY_URL);

    setTimeout(() => {
        tick();
        setInterval(tick, 5000);
    }, 3000);
})();
