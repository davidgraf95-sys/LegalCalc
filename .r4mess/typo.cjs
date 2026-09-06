const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR#art-336_c',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  console.log(JSON.stringify(await p.evaluate(()=>{
    const art=document.getElementById('art-336_c');
    const body=art?.querySelector('.max-w-normtext [data-lese], .max-w-normtext p, .max-w-normtext div');
    const txt=art?.querySelector('[data-lese]');
    const cs=e=>e?getComputedStyle(e):null;
    const c=cs(txt);
    // CPL: längster mehrzeiliger Absatz
    let best=0, bestT='';
    for (const el of art.querySelectorAll('[data-lese]')) {
      const r=el.getClientRects(); const t=(el.textContent||'').trim();
      if (r.length>1 && t.length>best) { best=t.length; bestT=t; }
    }
    let cpl=null;
    if (bestT) { const el=[...art.querySelectorAll('[data-lese]')].find(e=>(e.textContent||'').trim()===bestT);
      cpl = Math.round(bestT.length / el.getClientRects().length); }
    const rand=art?.querySelector('.lr-rand .lr-blatt');
    const reg=art?.querySelector('.lr-reg');
    return {
      textFont: c?.fontFamily, textSize: c?.fontSize, lh: c?.lineHeight,
      cpl, zeilen: bestT? [...art.querySelectorAll('[data-lese]')].find(e=>(e.textContent||'').trim()===bestT).getClientRects().length : null,
      randFont: cs(rand)?.fontFamily, randStyle: cs(rand)?.fontStyle, randSize: cs(rand)?.fontSize,
      regBg: cs(reg)?.backgroundColor, regH: cs(reg)?.height,
      sup: art?.querySelector('sup')?.outerHTML?.slice(0,80) ?? null,
      absMarke: art?.querySelector('[data-abs-marke], .num')?.outerHTML?.slice(0,90) ?? null,
    };
  }),null,1));
  await b.close();
})();
