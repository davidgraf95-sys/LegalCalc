const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto('http://localhost:4334/gesetze/bund/OR#art-336_c',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  const h = await p.evaluate(()=>{
    const a=document.getElementById('art-336_c');
    return { rand: a?.querySelector('.lr-rand')?.innerHTML.slice(0,400),
             text: a?.querySelector('.max-w-normtext')?.innerHTML.slice(0,1400) };
  });
  console.log('--RAND--\n'+h.rand+'\n--TEXT--\n'+h.text);
  await b.close();
})();
