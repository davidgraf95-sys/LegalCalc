const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:1440,height:900}});
  for (const u of ['/gesetze/bund/ZPO','/gesetze/bund/StPO','/gesetze/bund/SchKG','/gesetze/bund/ZGB','/gesetze/bund/BV']) {
    const p=await c.newPage();
    try{
      await p.goto('http://localhost:4334'+u,{waitUntil:'networkidle',timeout:30000});
      await p.waitForTimeout(2000);
      console.log(u, JSON.stringify(await p.evaluate(()=>({
        v:[...document.querySelectorAll('article .lc-overline')].filter(x=>/Verweise/.test(x.textContent||'')).length,
        erste:[...document.querySelectorAll('article .lc-overline')].filter(x=>/Verweise/.test(x.textContent||'')).slice(0,3).map(x=>x.closest('article')?.id)
      }))));
    }catch(e){ console.log(u,'FEHLER',e.message.slice(0,60)); }
    await p.close();
  }
  await b.close();
})();
