import { chromium } from 'playwright';
const B='http://localhost:4347';
const b = await chromium.launch();
// 1) CLS @390 mit Anker
for (const r of ['/gesetze/bund/OR#art-336_c','/gesetze/bund/ZGB#art-457','/gesetze/bund/OR#art-1','/gesetze/bund/ZPO']) {
  const werte=[];
  for (let i=0;i<3;i++){
    const ctx=await b.newContext({viewport:{width:390,height:844}});
    const p=await ctx.newPage();
    await p.addInitScript(()=>{window.__c=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__c+=e.value;}).observe({type:'layout-shift',buffered:true});});
    await p.goto(B+r,{waitUntil:'load'}); await p.waitForTimeout(3500);
    werte.push(+(await p.evaluate(()=>window.__c)).toFixed(4));
    if(i===0){const z=await p.evaluate(()=>{const m=location.hash.slice(1);const e=m&&document.getElementById(m);return e?Math.round(e.getBoundingClientRect().top):null;});console.log('  Ziel-y',z);}
    await ctx.close();
  }
  console.log('CLS@390', r, werte.join(' '));
}
// 2) Satzspiegel + Randnotiz
for (const w of [1440,1024,1920]) {
  const ctx=await b.newContext({viewport:{width:w,height:900}}); const p=await ctx.newPage();
  await p.goto(B+'/gesetze/bund/OR#art-336_c',{waitUntil:'load'}); await p.waitForTimeout(3000);
  console.log(w, JSON.stringify(await p.evaluate(()=>{
    const a=document.querySelector('article[data-normtext-linie]');
    const z=document.getElementById('art-336_c');
    return {grid:a?getComputedStyle(a).gridTemplateColumns:null,
      spiegel:document.querySelector('[data-lr-spiegel]')?.getAttribute('data-lr-spiegel'),
      notiz:document.querySelectorAll('.lr-notiz').length,
      rechnen:document.querySelectorAll('.lr6-notiz-liste').length,
      zielNotiz:z?(z.querySelector('.lr-notiz')?.textContent||'').replace(/\s+/g,' ').trim().slice(0,140):null,
      ueberlauf:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  })));
  await ctx.close();
}
await b.close();
