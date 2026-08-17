import { chromium } from '@playwright/test'
const BASE='http://localhost:4733'
const b=await chromium.launch()
const c=await b.newContext({viewport:{width:1440,height:900}})
await c.addInitScript(()=>{try{localStorage.setItem('lm.leser.v3','1')}catch{}})
const p=await c.newPage()
await p.goto(`${BASE}/gesetze/bund/STPO`)
await p.waitForSelector('[data-v3-kopf]',{timeout:30000}); await p.waitForTimeout(900)

// Woher kommen die 48 px?
console.log('Ä1a Kette:', JSON.stringify(await p.evaluate(()=>{
  const aus=[]; let n=document.querySelector('[data-v3-kopf]')
  while(n && n.tagName!=='HTML'){ const s=getComputedStyle(n); const r=n.getBoundingClientRect()
    aus.push({tag:n.tagName.toLowerCase(), data:Object.keys(n.dataset).join(','), cls:(n.className||'').toString().slice(0,50), pt:s.paddingTop, mt:s.marginTop, y:Math.round(r.y)})
    n=n.parentElement }
  return aus })))

// Ä5 Durchschimmern — tief scrollen
await p.locator('[data-v3-uebersicht-zeile]').first().click(); await p.waitForTimeout(400)
for (const st of [150,260,400]) {
  console.log(`Ä5 scrollTop=${st}:`, JSON.stringify(await p.evaluate((st)=>{
    const sc=document.querySelector('[data-toc]'); sc.scrollTop=st
    const zoneA=document.querySelector('[data-toc-zone-a]').getBoundingClientRect()
    const ueb=document.querySelector('[data-v3-uebersicht]').getBoundingClientRect()
    const mitte=zoneA.x+zoneA.width/2
    const probe=[]
    for(const y of [zoneA.y+1, zoneA.y+6, zoneA.y+zoneA.height-3]){
      const el=document.elementFromPoint(mitte,y)
      probe.push({dy:Math.round(y-zoneA.y), el: el? el.tagName.toLowerCase()+'['+Object.keys(el.dataset).join(',')+']':'null'})
    }
    // sichtbarer Streifen der Übersichtsbox INNERHALB der Zone-A-Höhe?
    const ueberlapp = Math.max(0, Math.min(ueb.bottom, zoneA.bottom) - Math.max(ueb.y, zoneA.y))
    return { zoneAy:Math.round(zoneA.y), zoneAh:Math.round(zoneA.height), uebY:Math.round(ueb.y), uebBottom:Math.round(ueb.bottom), ueberlapp:Math.round(ueberlapp), probe }
  }, st)))
}
// Randfall: Zone A deckt nur 74 px; darüber liegt nichts Opakes? Prüfe den Streifen ZWISCHEN Scroller-Oberkante und Zone A
console.log('Ä5 Scroller vs Zone A:', JSON.stringify(await p.evaluate(()=>{
  const sc=document.querySelector('[data-toc]'); const scr=sc.getBoundingClientRect()
  const zoneA=document.querySelector('[data-toc-zone-a]').getBoundingClientRect()
  return { scrollerTop:Math.round(scr.y), zoneATop:Math.round(zoneA.y), diff:Math.round(zoneA.y-scr.y), scrollTop:sc.scrollTop }
})))
await b.close()
