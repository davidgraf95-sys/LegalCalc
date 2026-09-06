import { chromium } from 'playwright';
const B='http://localhost:4354';
const OUT='abnahme/design-identitaet';
const br=await chromium.launch();
async function neu(w,h,dunkel){
  const ctx=await br.newContext({viewport:{width:w,height:h},colorScheme:dunkel?'dark':'light'});
  const p=await ctx.newPage();
  if(dunkel) await p.addInitScript(()=>{try{localStorage.setItem('lm.theme','dunkel');}catch{}});
  return {ctx,p};
}
async function laden(p,url,anker){
  await p.goto(B+url);
  await p.locator(anker??'#art-1').waitFor({state:'visible',timeout:30000});
  await p.evaluate(()=>document.fonts?.ready);
  await p.waitForTimeout(700);
}
async function schuss(p,name){ await p.screenshot({path:`${OUT}/${name}.jpg`,quality:72,type:'jpeg',fullPage:false}); console.log('OK',name); }

for(const [w,h] of [[1440,900],[1024,800],[390,844]]){
  for(const dunkel of [false,true]){
    const t=dunkel?'dunkel':'hell';
    const {ctx,p}=await neu(w,h,dunkel);
    await laden(p,'/gesetze/bund/OR#art-336_c','#art-336_c');
    await p.evaluate(()=>document.getElementById('art-336_c')?.scrollIntoView({block:'start'}));
    await p.waitForTimeout(500);
    await schuss(p,`r6b-${w}-${t}-or336c-zu`);
    // Bezüge aufklappen
    const s=p.locator('#art-336_c ~ * summary.lr7-bez-zeile, #art-336_c summary.lr7-bez-zeile').first();
    if(await s.count()>0){ await s.click(); await p.waitForTimeout(400);
      await p.evaluate(()=>document.getElementById('art-336_c')?.scrollIntoView({block:'start'}));
      await p.waitForTimeout(300);
      await schuss(p,`r6b-${w}-${t}-or336c-auf`); }
    await laden(p,'/gesetze/kanton/BS-640.100');
    await schuss(p,`r6b-${w}-${t}-kanton`);
    await ctx.close();
  }
}
await br.close();
