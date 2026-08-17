import { chromium } from '@playwright/test'
const b=await chromium.launch()
const c=await b.newContext({viewport:{width:1600,height:900}})
const p=await c.newPage()
await p.goto('http://localhost:4733/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
await p.waitForSelector('[data-pane="sekundaer"]',{timeout:30000})
await p.waitForTimeout(2000)
await p.locator('[data-pane="primaer"]').evaluate(el=>{el.scrollTop=3000}); await p.locator('[data-pane="sekundaer"]').evaluate(el=>{el.scrollTop=1500}); await p.waitForTimeout(2500)
console.log(JSON.stringify(await p.evaluate(()=>({
  ort:[...document.querySelectorAll('[data-ort-artikel]')].map(e=>({t:e.textContent,sicht:!!e.offsetParent})),
  v3:[...document.querySelectorAll('[data-v3-kopf-artikel]')].map(e=>({t:e.textContent,sicht:!!e.offsetParent})),
})),null,1))
await b.close()
