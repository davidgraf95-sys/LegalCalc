import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__l=[];
  const tick=()=>{const d=document.documentElement;
    window.__l.push({t:Math.round(performance.now()),docH:d?d.scrollHeight:0,y:Math.round(window.scrollY),
      art:document.querySelectorAll('article[data-normtext-linie]').length});
    if(performance.now()<6000)requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
});
await p.goto('http://localhost:4347/gesetze/bund/OR#art-336_c',{waitUntil:'load'});
await p.waitForTimeout(6500);
let prev=null;
for(const r of await p.evaluate(()=>window.__l)){
  if(!prev||r.docH!==prev.docH||r.art!==prev.art||Math.abs(r.y-prev.y)>2) console.log(JSON.stringify(r));
  prev=r;
}
await b.close();
