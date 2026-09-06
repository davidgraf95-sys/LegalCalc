import { chromium } from 'playwright';
const B='http://localhost:4354';
const ERL=['ZGB','OR','VMWG','STPO','STGB'];
async function cpl(page){
  return page.evaluate(()=>{
    let best=null;
    document.querySelectorAll('[id^="art-"] p').forEach((p)=>{
      const t=(p.textContent??'').trim(); if(t.length<40) return;
      const r=document.createRange(); r.selectNodeContents(p);
      const rects=r.getClientRects(); if(rects.length<3) return;
      const ch=Math.round(t.length/rects.length);
      const px=Math.round(p.getBoundingClientRect().width);
      if(!best||ch>best.ch) best={ch,px};
    });
    return best;
  });
}
const br=await chromium.launch();
for(const w of [1440,1280,1024]){
  const ctx=await br.newContext({viewport:{width:w,height:900}});
  const page=await ctx.newPage();
  const zeile=[];
  for(const k of ERL){
    await page.goto(`${B}/gesetze/bund/${k}`);
    await page.locator('#art-1').waitFor({state:'visible',timeout:30000});
    await page.evaluate(()=>document.fonts?.ready);
    await page.evaluate(()=>window.scrollTo(0,400));
    await page.waitForTimeout(350);
    const m=await cpl(page);
    const geo=await page.evaluate(()=>{
      const sp=document.querySelector('#lc-lesespalte');
      const art=document.querySelector('[id^="art-"] [data-lese]');
      const wrap=document.querySelector('[data-lr-spiegel]');
      const fs=art?getComputedStyle(art):null;
      return {
        spalte: sp?Math.round(sp.getBoundingClientRect().width):null,
        text: art?Math.round(art.getBoundingClientRect().width):null,
        spiegel: wrap?wrap.getAttribute('data-lr-spiegel'):null,
        fs: fs?parseFloat(fs.fontSize):null, lh: fs?parseFloat(fs.lineHeight):null,
        notiz: document.querySelectorAll('.lr-notiz').length,
        rand: document.querySelectorAll('.lr-rand').length,
        kopf: document.querySelectorAll('.lr7-kopf').length,
        bez: document.querySelectorAll('.lr7-bez').length,
        grid: (()=>{const a=document.querySelector('#lc-lesespalte .lr-satz'); return a?getComputedStyle(a).gridTemplateColumns:null;})(),
        ovf: document.documentElement.scrollWidth-document.documentElement.clientWidth,
      };
    });
    zeile.push(`${k} ${m?m.ch:'-'}ch/${m?m.px:'-'}px spalte=${geo.spalte} text=${geo.text} sp=${geo.spiegel} fs=${geo.fs}/${geo.lh} notiz=${geo.notiz} rand=${geo.rand} kopf=${geo.kopf} bez=${geo.bez} grid=${geo.grid} ovf=${geo.ovf}`);
  }
  console.log(`@${w}\n  `+zeile.join('\n  '));
  await ctx.close();
}
await br.close();
