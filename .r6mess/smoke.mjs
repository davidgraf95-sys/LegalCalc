import { chromium } from 'playwright';
const B='http://localhost:4347';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(B+'/gesetze/bund/OR#art-336_c', { waitUntil: 'load' });
await p.waitForTimeout(3000);
const vorher = await p.evaluate(() => ({
  panes: document.querySelectorAll('[data-pane]').length,
  url: location.pathname + location.search,
  ziel: !!document.getElementById('art-336_c'),
}));
const link = p.locator('#art-336_c .lr-notiz a').first();
console.log('Randnotiz-Link:', await link.count() ? (await link.textContent())?.trim() : 'KEINER', '→', await link.getAttribute('href'));
await link.click();
await p.waitForTimeout(2000);
const nachher = await p.evaluate(() => ({
  panes: document.querySelectorAll('[data-pane]').length,
  url: location.pathname + location.search,
  zielNochDa: !!document.getElementById('art-336_c'),
  zweiteHaelfte: [...document.querySelectorAll('[data-pane]')].map(e => (e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60)),
}));
console.log('vorher ', JSON.stringify(vorher));
console.log('nachher', JSON.stringify(nachher));
// Tastatur: Escape/Alt bleibt unberührt, ⌘-Klick öffnet nicht daneben
await b.close();
