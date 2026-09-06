const { chromium } = require('playwright');
const B='http://localhost:4334';
const info = () => ({
  spiegel: document.querySelector('.lc-leser[data-leser-v3="rahmen"]')?.getAttribute('data-lr-spiegel'),
  grid: (()=>{const a=document.getElementById('art-336_c');return a?getComputedStyle(a).gridTemplateColumns:null})(),
  notiz: !!document.querySelector('#art-336_c .lr-notiz'),
  notizKoepfe: [...document.querySelectorAll('#art-336_c .lr-notiz-titel')].map(h=>h.textContent),
  verweise: document.querySelectorAll('#art-336_c .lr-notiz a').length,
  bezZeile: !!document.querySelector('#art-336_c [data-bezuege-zeile]'),
  ankerY: (()=>{const a=document.getElementById('art-336_c');return a?Math.round(a.getBoundingClientRect().top):null})(),
  reiterBottom: (()=>{const n=document.querySelector('nav[aria-label="Offene Reiter"]');return n?Math.round(n.getBoundingClientRect().bottom):null})(),
  kopfBottom: (()=>{const k=document.querySelector('.lc-leser [data-leser-kopf], .lc-leser header, .lc-leser [class*="sticky"]');return k?Math.round(k.getBoundingClientRect().bottom):null})(),
  scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
});
(async()=>{
  const b=await chromium.launch();
  for (const [name,w,h] of [['1440',1440,900],['1920',1920,1000]]) {
    const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
    await p.goto(B+'/gesetze/bund/OR#art-336_c',{waitUntil:'networkidle'});
    await p.waitForTimeout(1500);
    console.log(name, JSON.stringify(await p.evaluate(info)));
    // Gliederung einklappen
    const zu = p.locator('button:has-text("Gliederung ausblenden"), [aria-label*="Gliederung"]').first();
    if (await zu.count()) { await zu.click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(900);
      console.log(name+' (Gliederung zu)', JSON.stringify(await p.evaluate(info))); }
    await p.context().close();
  }
  await b.close();
})();
