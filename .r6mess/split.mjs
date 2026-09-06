import { chromium } from 'playwright';
const B='http://localhost:4347';
const b = await chromium.launch();
const faelle = [
  ['leser+leser', `/gesetze/bund/OR?p=${encodeURIComponent('/gesetze/bund/ZGB')}#art-336_c`],
  ['leser+entscheid', `/gesetze/bund/OR?p=${encodeURIComponent('/rechtsprechung/bge_146_III_1')}#art-336_c`],
  ['leser+rechner', `/gesetze/bund/OR?p=${encodeURIComponent('/rechner/fristen')}#art-336_c`],
  ['start+leser', `/?p=${encodeURIComponent('/gesetze/bund/OR')}`],
];
for (const w of [1440, 1024]) {
  for (const [name, url] of faelle) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(B+url, { waitUntil: 'load' }); await p.waitForTimeout(2800);
    const r = await p.evaluate(() => {
      const a = document.querySelector('#lc-lesespalte article[data-normtext-linie]');
      const panes = [...document.querySelectorAll('[data-pane]')].map(e => Math.round(e.getBoundingClientRect().width));
      return { grid: a?getComputedStyle(a).gridTemplateColumns:null,
        spiegel: [...document.querySelectorAll('[data-lr-spiegel]')].map(e=>e.getAttribute('data-lr-spiegel')),
        notiz: document.querySelectorAll('.lr-notiz').length,
        aside: document.querySelectorAll('[data-v3-aside]').length,
        panes, ueberlauf: document.documentElement.scrollWidth-document.documentElement.clientWidth };
    });
    console.log(w, name.padEnd(16), JSON.stringify(r));
    await ctx.close();
  }
}
await b.close();
