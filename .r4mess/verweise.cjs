const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR',{waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  console.log(JSON.stringify(await p.evaluate(()=>{
    const ov=[...document.querySelectorAll('article .lc-overline')].filter(x=>/Verweise/.test(x.textContent||''));
    return { spiegel: document.querySelector('.lc-leser')?.getAttribute('data-lr-spiegel'),
             verweisBloecke: ov.length,
             erste: ov.slice(0,3).map(x=>x.closest('article')?.id),
             beiwerkBez: document.querySelectorAll('article [data-bezuege-zeile]').length };
  }),null,1));
  await b.close();
})();
