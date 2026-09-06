const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR#art-336_c', { waitUntil:'networkidle' });
  await p.waitForTimeout(1200);
  console.log(JSON.stringify(await p.evaluate(() => {
    const w = document.querySelector('.lc-leser[data-leser-v3="rahmen"]');
    const sp = document.getElementById('lc-lesespalte');
    const zelle = sp?.closest('.relative.min-w-0') ?? sp?.parentElement?.parentElement;
    const gridEl = w?.querySelector('[style*="grid-template-columns"]') ?? null;
    const main = document.querySelector('main');
    return {
      wurzelW: w?.getBoundingClientRect().width,
      elternW: w?.parentElement?.getBoundingClientRect().width,
      mainW: main?.clientWidth,
      grid: gridEl ? getComputedStyle(gridEl).gridTemplateColumns : null,
      zelleW: zelle?.getBoundingClientRect().width,
      spiegel: w?.getAttribute('data-lr-spiegel'),
      lesemassMax: w ? getComputedStyle(w).getPropertyValue('--leser-lesemass-max') : null,
    };
  }), null, 1));
  await b.close();
})();
