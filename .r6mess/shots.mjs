import { chromium } from 'playwright';
const B='http://localhost:4347';
const OUT='abnahme/design-identitaet';
const b = await chromium.launch();
const faelle = [
  ['leser-bund', '/gesetze/bund/OR#art-336_c', [1440,1024,390]],
  ['leser-kanton', '/gesetze/kanton/BS-640.100', [1440,390]],
  ['split-leser-leser', `/gesetze/bund/OR?p=${encodeURIComponent('/gesetze/bund/ZGB')}#art-336_c`, [1440,1024]],
  ['split-leser-entscheid', `/gesetze/bund/OR?p=${encodeURIComponent('/rechtsprechung/bge_146_III_1')}#art-336_c`, [1440]],
  ['split-leser-rechner', `/gesetze/bund/OR?p=${encodeURIComponent('/rechner/fristen')}#art-336_c`, [1440]],
  ['split-start-leser', `/?p=${encodeURIComponent('/gesetze/bund/OR')}`, [1440]],
  ['uebersicht-gesetze', '/gesetze', [1440,390]],
  ['uebersicht-rechtsprechung', '/rechtsprechung', [1440]],
  ['uebersicht-materialien', '/materialien', [1440]],
];
for (const modus of ['hell','dunkel']) {
  for (const [name, url, breiten] of faelle) {
    for (const w of breiten) {
      const ctx = await b.newContext({ viewport: { width: w, height: w===390?844:900 },
        colorScheme: modus === 'dunkel' ? 'dark' : 'light', deviceScaleFactor: 1 });
      const p = await ctx.newPage();
      await p.goto(B+url, { waitUntil: 'load' });
      await p.waitForTimeout(3000);
      await p.screenshot({ path: `${OUT}/r6-${w}-${modus}-${name}.jpg`, type: 'jpeg', quality: 78 });
      await ctx.close();
    }
  }
}
// Druck-Probe (L16)
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(B+'/gesetze/bund/ZPO', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  await p.emulateMedia({ media: 'print' });
  const r = await p.evaluate(() => {
    const a = document.querySelector('[data-v3-aside]');
    const felder = [...document.querySelectorAll('input[type=search], input[placeholder*="Erlass"]')]
      .filter(e => getComputedStyle(e).display !== 'none' && e.getClientRects().length);
    return { asideDisplay: a ? getComputedStyle(a).display : 'fehlt',
      asideSichtbar: a ? a.getClientRects().length > 0 : false, sichtbareFelder: felder.length };
  });
  console.log('DRUCK', JSON.stringify(r));
  await p.screenshot({ path: `${OUT}/r6-1440-druck.jpg`, type: 'jpeg', quality: 78 });
  await ctx.close();
}
await b.close();
console.log('Screens fertig');
