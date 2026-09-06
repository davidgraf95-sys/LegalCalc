import { chromium } from 'playwright';
const PORT = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage();
await p.goto(`http://localhost:${PORT}/gesetze/bund/BGBM`, { waitUntil: 'load' });
await p.waitForTimeout(3000);
console.log('BGBM @1280', JSON.stringify(await p.evaluate(() => ({
  spiegel: document.querySelector('[data-lr-spiegel]')?.getAttribute('data-lr-spiegel'),
  histInRand: !!document.querySelector('.lr-rand [data-hist-slot]'),
}))));
// StPO Zeilenhöhe @1440
const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await ctx2.newPage();
await p2.goto(`http://localhost:${PORT}/gesetze/bund/STPO`, { waitUntil: 'load' });
await p2.waitForTimeout(3000);
console.log('StPO lh @1440', JSON.stringify(await p2.evaluate(() => {
  const el = [...document.querySelectorAll('#lc-lesespalte p')].find(e => (e.textContent||'').length > 120);
  if (!el) return null;
  const cs = getComputedStyle(el);
  return { fs: cs.fontSize, lh: cs.lineHeight };
})));
await b.close();
