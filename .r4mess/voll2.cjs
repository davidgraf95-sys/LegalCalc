const { chromium } = require('playwright');
const info = () => ({
  spiegel: document.querySelector('.lc-leser[data-leser-v3="rahmen"]')?.getAttribute('data-lr-spiegel'),
  grid: (()=>{const a=document.getElementById('art-336_c');return a?getComputedStyle(a).gridTemplateColumns:null})(),
  zelleW: Math.round(document.getElementById('lc-lesespalte')?.getBoundingClientRect().width ?? 0),
  notizKoepfe: [...document.querySelectorAll('#art-336_c .lr-notiz-titel')].map(h=>h.textContent),
  notizLinks: document.querySelectorAll('#art-336_c .lr-notiz a').length,
  bezZeileFuss: !!document.querySelector('#art-336_c [data-beiwerk] [data-bezuege-zeile]'),
  scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
});
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR#art-336_c',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  console.log('start   ', JSON.stringify(await p.evaluate(info)));
  await p.getByRole('button', { name: /Gliederung ausblenden/ }).click();
  await p.waitForTimeout(900);
  console.log('toc-zu  ', JSON.stringify(await p.evaluate(info)));
  await b.close();
})();
