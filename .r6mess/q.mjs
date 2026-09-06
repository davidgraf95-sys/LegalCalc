import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__ev=[];
  const dh=()=>document.documentElement?document.documentElement.scrollHeight:0;
  new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;
    window.__ev.push({t:Math.round(e.startTime),v:+e.value.toFixed(4),docH:dh(),y:Math.round(window.scrollY),
      src:(e.sources||[]).slice(0,2).map(s=>({tag:s.node?.tagName,txt:(s.node?.textContent||'').trim().slice(0,28),
        py:Math.round(s.previousRect?.y??0),cy:Math.round(s.currentRect?.y??0),ph:Math.round(s.previousRect?.height??0),ch:Math.round(s.currentRect?.height??0)}))});}}
  ).observe({type:'layout-shift',buffered:true});
});
await p.goto('http://localhost:4347/gesetze/bund/OR#art-1',{waitUntil:'load'});
await p.waitForTimeout(4000);
for (const e of await p.evaluate(()=>window.__ev)) console.log(JSON.stringify(e));
await b.close();
