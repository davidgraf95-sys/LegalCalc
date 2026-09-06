import { chromium } from 'playwright';
const br=await chromium.launch();
const ctx=await br.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto('http://localhost:4354/gesetze/bund/OR#art-336_c');
await p.locator('#art-336_c').waitFor({state:'visible'});
await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  const a=document.getElementById('art-336_c');
  const out=[];
  a.querySelectorAll('*').forEach((el)=>{
    const r=el.getBoundingClientRect();
    if(r.top>=0&&r.top<a.getBoundingClientRect().top+80&&r.width>0)
      out.push(`${el.tagName}.${el.className||''}|x${Math.round(r.x)}-${Math.round(r.right)} y${Math.round(r.y)} w${Math.round(r.width)} "${(el.textContent||'').trim().slice(0,30)}"`);
  });
  return out.join('\n');
}));
await br.close();
