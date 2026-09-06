const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  await p.getByRole('button', { name: /Gliederung ausblenden/ }).click();
  await p.waitForTimeout(800);
  // durchscrollen und Artikel mit gefüllter Randnotiz zählen
  for (let i=0;i<12;i++){ await p.mouse.wheel(0,4000); await p.waitForTimeout(250); }
  console.log(JSON.stringify(await p.evaluate(()=>{
    const mit=[...document.querySelectorAll('article[data-lr-notiz] .lr-notiz')].slice(0,6)
      .map(n=>({art:n.closest('article')?.id, koepfe:[...n.querySelectorAll('.lr-notiz-titel')].map(h=>h.textContent), links:n.querySelectorAll('a').length}));
    return { spiegel: document.querySelector('.lc-leser')?.getAttribute('data-lr-spiegel'),
             artikelMitNotiz: document.querySelectorAll('article .lr-notiz').length,
             artikelGesamt: document.querySelectorAll('article[data-lr-notiz]').length, mit };
  }),null,1));
  await b.close();
})();
