import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__l=[];
  const tick=()=>{const d=document.documentElement;const f=document.querySelector('footer');
    window.__l.push({t:Math.round(performance.now()),docH:d?d.scrollHeight:0,y:Math.round(window.scrollY),
      fy:f?Math.round(f.getBoundingClientRect().top):null, fh:f?Math.round(f.getBoundingClientRect().height):null,
      art:document.querySelectorAll('article[data-normtext-linie]').length});
    if(performance.now()<4000)requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
});
await p.goto('http://localhost:4347/gesetze/bund/OR#art-1',{waitUntil:'load'});
await p.waitForTimeout(4500);
let prev=null;
for(const r of await p.evaluate(()=>window.__l)){
  if(!prev||r.docH!==prev.docH||r.art!==prev.art||Math.abs((r.fy??0)-(prev.fy??0))>3||Math.abs(r.y-prev.y)>2) console.log(JSON.stringify(r));
  prev=r;}
await b.close();
