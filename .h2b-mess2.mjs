import { chromium } from '@playwright/test'
const BASE='http://localhost:4733'
const b=await chromium.launch()
async function seite(w=1440,h=900){const c=await b.newContext({viewport:{width:w,height:h}});await c.addInitScript(()=>{try{localStorage.setItem('lm.leser.v3','1')}catch{}});return c.newPage()}

// Ä1a — welche Werte tragen die Sticky-Variablen?
{
  const p=await seite(); await p.goto(`${BASE}/gesetze/bund/STPO`)
  await p.waitForSelector('[data-v3-kopf]',{timeout:30000}); await p.waitForTimeout(900)
  console.log('Ä1a Variablen:', JSON.stringify(await p.locator('[data-v3-kopf]').first().evaluate(el=>{
    const s=getComputedStyle(el)
    return { top:s.top, position:s.position,
      v3Top:s.getPropertyValue('--leser-v3-kopf-top').trim(), kopfH:s.getPropertyValue('--leser-kopf-h').trim(),
      v3H:s.getPropertyValue('--leser-v3-kopf-h').trim(), ntStick:s.getPropertyValue('--nt-stick').trim() }
  })))
  console.log('Ä1a scrollY vor/nach:', await p.evaluate(()=>window.scrollY))
  await p.evaluate(()=>window.scrollBy(0,1200)); await p.waitForTimeout(600)
  const nach = await p.evaluate(()=>{
    const kr=document.querySelector('[data-inhalt-kopf]').getBoundingClientRect()
    const k=document.querySelector('[data-v3-kopf]').getBoundingClientRect()
    return { scrollY: window.scrollY, krumeBottom: Math.round(kr.bottom), kopfTop: Math.round(k.top), luecke: Math.round(k.top-kr.bottom) }
  })
  console.log('Ä1a nach echtem Scroll:', JSON.stringify(nach))

  // Ä5 — Rahmen-Inventar der Leiste (mit Pfad)
  const rahmen = await p.evaluate(()=>{
    const wurzel=document.querySelector('[data-v3-leiste]')
    return [...wurzel.querySelectorAll('*')].filter(el=>{const s=getComputedStyle(el);return ['Top','Right','Bottom','Left'].some(k=>s['border'+k+'Width']!=='0px'&&s['border'+k+'Style']!=='none')})
      .map(el=>{const s=getComputedStyle(el);return {tag:el.tagName.toLowerCase(), data:Object.keys(el.dataset).join(','), cls:(el.className||'').slice(0,70), bw:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth].join('/'), w:Math.round(el.getBoundingClientRect().width)}})
  })
  console.log('Ä5 Rahmen-Inventar:'); rahmen.forEach(r=>console.log('   ', JSON.stringify(r)))

  // Ä5 — Durchschimmern: Übersichtsbox unter dem klebenden Sockel
  await p.locator('[data-v3-uebersicht-zeile]').first().click(); await p.waitForTimeout(400)
  const durch = await p.evaluate(()=>{
    const sc=document.querySelector('[data-toc]'); sc.scrollTop=60
    const zoneA=document.querySelector('[data-toc-zone-a]').getBoundingClientRect()
    const ueb=document.querySelector('[data-v3-uebersicht]').getBoundingClientRect()
    const mitte=zoneA.x+zoneA.width/2
    const treffer=[]
    for(const y of [zoneA.y+2, zoneA.y+zoneA.height/2, zoneA.bottom-2]){
      const el=document.elementFromPoint(mitte,y)
      treffer.push({y:Math.round(y), el: el? el.tagName.toLowerCase()+'['+Object.keys(el.dataset).join(',')+']':'null'})
    }
    return { zoneA:{y:Math.round(zoneA.y),h:Math.round(zoneA.height),w:Math.round(zoneA.width),x:Math.round(zoneA.x)},
      ueb:{y:Math.round(ueb.y),h:Math.round(ueb.height),w:Math.round(ueb.width),x:Math.round(ueb.x)},
      uebRagtInZoneA: ueb.bottom > zoneA.y + 1, ueberlappUnten: Math.round(ueb.bottom - zoneA.y), treffer,
      zoneABg: getComputedStyle(document.querySelector('[data-toc-zone-a]')).backgroundColor }
  })
  console.log('Ä5 Durchschimmern:', JSON.stringify(durch,null,1))
  await p.context().close()
}

// Ä10 — Überlauf in der geöffneten Übersicht @390
{
  const p=await seite(390,844); await p.goto(`${BASE}/gesetze/bund/STPO`)
  await p.waitForSelector('[data-v3-kopf]',{timeout:30000}); await p.waitForTimeout(700)
  await p.locator('[data-v3-gliederung-auf]').first().click()
  await p.waitForSelector('[data-gliederung-sheet]',{timeout:15000}); await p.waitForTimeout(400)
  await p.locator('[data-gliederung-sheet] [data-v3-uebersicht-zeile]').first().click(); await p.waitForTimeout(400)
  const o = await p.evaluate(()=>{
    const sheet=document.querySelector('[data-gliederung-sheet]')
    const ueb=sheet.querySelector('[data-v3-uebersicht]')
    const r=ueb.getBoundingClientRect(), sr=sheet.getBoundingClientRect()
    const kinder=[...ueb.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName.toLowerCase(),sw:e.scrollWidth,cw:e.clientWidth,txt:(e.textContent||'').slice(0,40)}))
    const scroller=sheet.querySelector('[data-gliederung-baum-scroll]')
    return { uebW:Math.round(r.width), uebRight:Math.round(r.right), sheetRight:Math.round(sr.right),
      uebRagtRaus: r.right > sr.right+1, uebH:Math.round(r.height), sheetH:Math.round(sr.height),
      uebUnten: Math.round(r.bottom), sheetUnten: Math.round(sr.bottom), ragtUnten: r.bottom>sr.bottom+1,
      scrollerSW: scroller.scrollWidth, scrollerCW: scroller.clientWidth, kinderMitOverflow:kinder }
  })
  console.log('Ä10 Übersicht im Sheet (offen):', JSON.stringify(o,null,1))
  await p.context().close()
}
await b.close()
