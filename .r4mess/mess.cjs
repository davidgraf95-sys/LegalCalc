const { chromium } = require('playwright');
const B = 'http://localhost:4334';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(B + '/gesetze/bund/OR#art-336_c', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const wurzel = document.querySelector('.lc-leser[data-leser-v3="rahmen"]');
    const sp = document.getElementById('lc-lesespalte');
    const art = document.getElementById('art-336_c');
    const cs = (el, p) => el ? getComputedStyle(el).getPropertyValue(p).trim() : null;
    const nav = document.querySelector('nav[aria-label="Offene Reiter"]');
    const top = document.querySelector('header');
    return {
      spiegel: wurzel?.getAttribute('data-lr-spiegel') ?? null,
      lesespalteW: sp ? sp.getBoundingClientRect().width : null,
      lesespaltePadL: sp ? cs(sp, 'padding-left') : null,
      lesespaltePadR: sp ? cs(sp, 'padding-right') : null,
      artGrid: art ? cs(art, 'grid-template-columns') : null,
      artW: art ? art.getBoundingClientRect().width : null,
      randW: art?.querySelector('.lr-rand')?.getBoundingClientRect().width ?? null,
      textW: art?.querySelector('.lr-text .max-w-normtext')?.getBoundingClientRect().width ?? null,
      notiz: !!art?.querySelector('.lr-notiz'),
      reiterH: nav ? nav.getBoundingClientRect().height : null,
      reiterTop: nav ? nav.getBoundingClientRect().top : null,
      topbarH: top ? top.getBoundingClientRect().height : null,
      appKopf: cs(document.documentElement, '--app-kopf-h'),
      ntStick: wurzel ? cs(wurzel, '--nt-stick') : null,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    };
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
