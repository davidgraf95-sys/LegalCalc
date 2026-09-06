const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:1440,height:900}});
  for (const u of ['/gesetze/bund/OR','/gesetze/bund/SchKG','/gesetze/bund/ZGB','/gesetze/bund/ZPO']) {
    const p=await c.newPage();
    await p.goto('http://localhost:4334'+u,{waitUntil:'networkidle',timeout:40000});
    await p.waitForTimeout(2000);
    console.log(u, JSON.stringify(await p.evaluate(()=>{
      const arts=[...document.querySelectorAll('article.lr-satz')];
      const voll=arts.filter(a=>{const r=a.querySelector('.lr-rand'); return r && (r.textContent||'').trim().length>0;});
      const histSlot=document.querySelectorAll('article [data-hist-slot]').length;
      const histGefuellt=[...document.querySelectorAll('article [data-hist-slot]')].filter(x=>(x.textContent||'').trim().length>0).length;
      return { artikel:arts.length, randGefuellt:voll.length,
               bsp: voll.slice(0,3).map(a=>({id:a.id,t:(a.querySelector('.lr-rand').textContent||'').trim().slice(0,50)})),
               histSlot, histGefuellt };
    })));
    await p.close();
  }
  await b.close();
})();
