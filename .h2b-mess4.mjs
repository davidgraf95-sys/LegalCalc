import { chromium } from '@playwright/test'
const BASE='http://localhost:4733'
const b=await chromium.launch()
const c=await b.newContext({viewport:{width:390,height:844}})
await c.addInitScript(()=>{try{localStorage.setItem('lm.leser.v3','1')}catch{}})
const p=await c.newPage()
await p.goto(`${BASE}/gesetze/bund/STPO`)
await p.waitForSelector('[data-v3-kopf]',{timeout:30000}); await p.waitForTimeout(700)
await p.locator('[data-v3-gliederung-auf]').first().click()
await p.waitForSelector('[data-gliederung-sheet]',{timeout:15000}); await p.waitForTimeout(500)
console.log('Sheet-Flächen:', JSON.stringify(await p.evaluate(()=>{
  const sh=document.querySelector('[data-gliederung-sheet]')
  const za=sh.querySelector('[data-toc-zone-a]')
  const ub=sh.querySelector('[data-v3-uebersicht]')
  const sc=sh.querySelector('[data-toc]')
  const g=(e)=>e?getComputedStyle(e).backgroundColor:null
  return { sheetBg:g(sh), zoneABg:g(za), uebBg:g(ub), scrollerBg:g(sc),
    zoneAda: !!za, uebDa: !!ub }
})))
// unter den Sockel scrollen
console.log('Nach Scrollen:', JSON.stringify(await p.evaluate(()=>{
  const sh=document.querySelector('[data-gliederung-sheet]')
  const sc=sh.querySelector('[data-toc]'); if(!sc) return 'kein [data-toc] im Sheet'
  sc.scrollTop=200
  const za=sh.querySelector('[data-toc-zone-a]').getBoundingClientRect()
  const ub=sh.querySelector('[data-v3-uebersicht]').getBoundingClientRect()
  return { scrollTop:sc.scrollTop, maxScroll: sc.scrollHeight-sc.clientHeight,
    zoneAy:Math.round(za.y), zoneAh:Math.round(za.height), uebBottom:Math.round(ub.bottom),
    ueberlapp: Math.round(Math.max(0, Math.min(ub.bottom,za.bottom)-Math.max(ub.y,za.y))) }
})))
await b.close()
