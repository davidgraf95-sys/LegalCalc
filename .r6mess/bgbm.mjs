import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w,h] of [[1280,720],[1440,900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4347/gesetze/bund/BGBM', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  console.log(w, JSON.stringify(await p.evaluate(() => ({
    spiegel: document.querySelector('[data-lr-spiegel]')?.getAttribute('data-lr-spiegel'),
    histInRand: !!document.querySelector('.lr-rand [data-hist-slot]'),
    histSlots: document.querySelectorAll('[data-hist-slot]').length,
    histZeilen: document.querySelectorAll('[data-historie-zeile]').length,
  }))));
  await ctx.close();
}
await b.close();
