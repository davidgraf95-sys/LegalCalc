import { chromium } from 'playwright';
const B='http://localhost:4354', OUT='abnahme/design-identitaet';
const br=await chromium.launch();
// ── Split: Leser+Leser und Leser+Entscheid
const faelle=[
 ['leser-leser','/gesetze/bund/OR?p=/gesetze/bund/ZPO'],
 ['leser-entscheid','/gesetze/bund/OR?p=/rechtsprechung'],
];
for(const t of ['hell','dunkel']){
 for(const [name,url] of faelle){
  const ctx=await br.newContext({viewport:{width:1440,height:900},colorScheme:t==='dunkel'?'dark':'light'});
  const p=await ctx.newPage();
  await p.goto(B+url);
  await p.locator('[data-pane="sekundaer"]').waitFor({state:'visible',timeout:30000});
  await p.evaluate(()=>document.fonts?.ready);
  await p.waitForTimeout(1200);
  await p.screenshot({path:`${OUT}/r6b-1440-${t}-split-${name}.jpg`,quality:72,type:'jpeg'});
  const z=await p.evaluate(()=>({
    spiegel:[...document.querySelectorAll('[data-lr-spiegel]')].map(e=>e.getAttribute('data-lr-spiegel')),
    notiz:document.querySelectorAll('.lr-notiz').length,
    kopf:document.querySelectorAll('.lr7-kopf').length,
    bez:document.querySelectorAll('.lr7-bez').length,
    ovf:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  }));
  console.log(`SPLIT ${t} ${name}`,JSON.stringify(z));
  await ctx.close();
 }
}
// ── CLS @390 auf dem Tieflink
for(let i=0;i<3;i++){
  const ctx=await br.newContext({viewport:{width:390,height:844}});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{ window.__cls=0; new PerformanceObserver((l)=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true}); });
  await p.goto(B+'/gesetze/bund/OR#art-336_c');
  await p.locator('#art-336_c').waitFor({state:'attached',timeout:30000});
  await p.waitForTimeout(2500);
  console.log('CLS @390 #art-336_c:', await p.evaluate(()=>window.__cls));
  await ctx.close();
}
await br.close();
