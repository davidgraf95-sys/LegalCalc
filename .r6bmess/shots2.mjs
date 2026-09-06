import { chromium } from 'playwright';
const B='http://localhost:4354', OUT='abnahme/design-identitaet';
const br=await chromium.launch();
async function laden(p,url,anker){ await p.goto(B+url); await p.locator(anker).waitFor({state:'visible',timeout:30000}); await p.evaluate(()=>document.fonts?.ready); await p.waitForTimeout(700); }
// ZPO: Erlass mit Randtiteln
for(const t of ['hell','dunkel']){
  const ctx=await br.newContext({viewport:{width:1440,height:900},colorScheme:t==='dunkel'?'dark':'light'});
  const p=await ctx.newPage();
  await laden(p,'/gesetze/bund/ZPO#art-52','#art-52');
  await p.evaluate(()=>document.getElementById('art-52')?.scrollIntoView({block:'start'}));
  await p.waitForTimeout(400);
  await p.screenshot({path:`${OUT}/r6b-1440-${t}-randtitel.jpg`,quality:72,type:'jpeg'});
  console.log('OK randtitel',t);
  await ctx.close();
}
// Druck
{
  const ctx=await br.newContext({viewport:{width:1440,height:1200}});
  const p=await ctx.newPage();
  await laden(p,'/gesetze/bund/ZPO#art-52','#art-52');
  await p.emulateMedia({media:'print'});
  await p.evaluate(()=>document.getElementById('art-52')?.scrollIntoView({block:'start'}));
  await p.waitForTimeout(400);
  await p.screenshot({path:`${OUT}/r6b-1440-druck.jpg`,quality:72,type:'jpeg'});
  const z=await p.evaluate(()=>({
    bez:[...document.querySelectorAll('.lr7-bez')].filter(e=>e.getBoundingClientRect().width>0).length,
    bezDom:document.querySelectorAll('.lr7-bez').length,
    kopf:[...document.querySelectorAll('.lr7-kopf')].filter(e=>e.getBoundingClientRect().width>0).length,
    randtitelSichtbar:[...document.querySelectorAll('.lr7-kopf .lr-blatt')].filter(e=>e.getBoundingClientRect().width>0).length,
    toc:[...document.querySelectorAll('#lc-leser-toc, [data-v3-toc]')].filter(e=>e.getBoundingClientRect().width>0).length,
  }));
  console.log('DRUCK',JSON.stringify(z));
  await ctx.close();
}
await br.close();
