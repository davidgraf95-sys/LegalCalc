import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://localhost:4347/gesetze/bund/STPO', { waitUntil: 'load' });
await p.waitForTimeout(2500);
const lies = () => p.evaluate(() => ({
  spiegel: document.querySelector('[data-lr-spiegel]')?.getAttribute('data-lr-spiegel'),
  grid: (() => { const a = document.querySelector('article[data-normtext-linie]'); return a ? getComputedStyle(a).gridTemplateColumns : null; })(),
  notiz: document.querySelectorAll('.lr-notiz').length,
  maxW: getComputedStyle(document.querySelector('[data-leser-v3="rahmen"]') ?? document.body).getPropertyValue('--leser-max-w'),
}));
console.log('zu  ', JSON.stringify(await lies()));
await p.locator('[data-v3-panel-oeffner], button:has-text("Rechtsprechung")').first().click();
await p.waitForTimeout(1200);
console.log('offen', JSON.stringify(await lies()));
await b.close();
