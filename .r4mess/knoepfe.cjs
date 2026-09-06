const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR#art-336_c',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('button,[role="button"]')]
    .map(x=>({t:(x.textContent||'').trim().slice(0,40), a:x.getAttribute('aria-label')}))
    .filter(x=>/glieder|rechtsprech|bez|entscheid|ansicht|einstell/i.test((x.t||'')+(x.a||'')))), null, 1));
  await b.close();
})();
