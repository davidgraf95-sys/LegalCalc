const { chromium } = require('playwright');
const info = () => ({
  spiegel: document.querySelector('.lc-leser[data-leser-v3="rahmen"]')?.getAttribute('data-lr-spiegel'),
  grid: (()=>{const a=document.getElementById('art-336_c');return a?getComputedStyle(a).gridTemplateColumns:null})(),
  notizKoepfe: [...document.querySelectorAll('#art-336_c .lr-notiz-titel')].map(h=>h.textContent),
  notizLinks: document.querySelectorAll('#art-336_c .lr-notiz a').length,
  bezZeileFuss: !!document.querySelector('#art-336_c [data-beiwerk] [data-bezuege-zeile]'),
  notizW: Math.round(document.querySelector('#art-336_c .lr-notiz')?.getBoundingClientRect().width ?? 0),
  scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
});
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:1440,height:900}});
  await c.addInitScript(()=>{ try{ localStorage.setItem('lm.leser.optionen', JSON.stringify({ bezugKlassen:['bge','bger','kantonal'] })); }catch(e){} });
  const p=await c.newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR#art-336_c',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  console.log('marg    ', JSON.stringify(await p.evaluate(info)));
  await p.getByRole('button', { name: /Gliederung ausblenden/ }).click();
  await p.waitForTimeout(1200);
  console.log('voll    ', JSON.stringify(await p.evaluate(info)));
  await b.close();
})();
