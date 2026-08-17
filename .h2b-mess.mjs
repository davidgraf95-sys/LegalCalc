// Ä-Reproduktion H2b — misst den Ist-Zustand, ändert nichts.
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:4733'
const b = await chromium.launch()

async function seite({ width = 1440, height = 900 } = {}) {
  const ctx = await b.newContext({ viewport: { width, height } })
  await ctx.addInitScript(() => { try { localStorage.setItem('lm.leser.v3', '1') } catch { /* */ } })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => console.log('  !! pageerror', e.message))
  return p
}

const box = (l) => l.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }).catch(() => null)

// ═══ Ä1a · Leerzone unter der Krumen-Leiste ════════════════════════════════
{
  const p = await seite()
  await p.goto(`${BASE}/gesetze/bund/STPO`)
  await p.waitForSelector('[data-v3-kopf]', { timeout: 30000 })
  await p.waitForTimeout(800)
  const krume = await box(p.locator('[data-inhalt-kopf]').first())
  const kopf = await box(p.locator('[data-v3-kopf]').first())
  console.log('Ä1a @1440 scroll=0  Krume', JSON.stringify(krume), ' V3-Kopf', JSON.stringify(kopf))
  console.log('Ä1a  LEERZONE =', kopf.y - (krume.y + krume.h), 'px')
  await p.mouse.wheel(0, 900); await p.waitForTimeout(500)
  const k2 = await box(p.locator('[data-v3-kopf]').first())
  const kr2 = await box(p.locator('[data-inhalt-kopf]').first())
  console.log('Ä1a  nach Scroll: Leerzone =', k2.y - (kr2.y + kr2.h), 'px')
  // Ä1c · App-Seitenleiste eingeklappt?
  const sb = await p.evaluate(() => ({
    ein: localStorage.getItem('lexmetrik-seitenleiste-eingeklappt'),
    aside: !!document.querySelector('aside[aria-label*="Haupt"], #seitenleiste, [data-seitenleiste]'),
  }))
  console.log('Ä1c  Seitenleiste-Speicher:', JSON.stringify(sb))
  // Ä9 · zwei Schriftregler?
  const regler = await p.locator('[role="group"][aria-label="Schriftgrösse"]').count()
  console.log('Ä9   [role=group][aria-label="Schriftgrösse"] im DOM (Panel zu):', regler)
  await p.locator('[data-v3-ansicht]').first().click()
  await p.waitForTimeout(300)
  console.log('Ä9   … Panel offen:', await p.locator('[role="group"][aria-label="Schriftgrösse"]').count())
  await p.keyboard.press('Escape')
  // Ä5 · gerahmte Kästen in der Leiste
  const rahmen = await p.locator('[data-v3-leiste] *').evaluateAll((els) => els
    .filter((el) => { const s = getComputedStyle(el); return s.borderTopWidth !== '0px' || s.borderLeftWidth !== '0px' })
    .map((el) => `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').split(' ').slice(0, 3).join('.')}`))
  console.log('Ä5   Elemente mit Rahmen in der Leiste:', rahmen.length, JSON.stringify(rahmen.slice(0, 8)))
  const uebZeile = await p.locator('[data-v3-uebersicht-zeile]').first().innerText()
  console.log('Ä5   Übersichtszeile:', JSON.stringify(uebZeile))
  // Ä14 · Fokusring
  const feld = p.locator('[data-v3-suchsprung] input').first()
  await feld.focus(); await p.waitForTimeout(200)
  console.log('Ä14  Fokus-Stil:', JSON.stringify(await feld.evaluate((el) => { const s = getComputedStyle(el); return { boxShadow: s.boxShadow, outline: s.outline, borderColor: s.borderColor } })))
  // Ä16 · nativer Cancel
  console.log('Ä16  input type =', await feld.getAttribute('type'))
  await feld.fill('Kosten'); await p.waitForTimeout(1200)
  const cancel = await feld.evaluate((el) => {
    const r = el.getBoundingClientRect()
    // Klickpunkt dort, wo Chromium seinen Cancel malt (rechter Rand innen)
    return { rechts: Math.round(r.right), obenMitte: Math.round(r.y + r.height / 2) }
  })
  console.log('Ä16  Feld rechts/Mitte:', JSON.stringify(cancel), ' eigener ✕:', await p.locator('[data-v3-such-leeren]').count())
  // Ä15 · Trefferzähler Ellipse
  await p.waitForSelector('[data-treffer-leiste]', { timeout: 20000 })
  const zaehler = await p.locator('[data-treffer-leiste] p').first().evaluate((el) => ({
    text: el.innerText, scrollW: el.scrollWidth, clientW: el.clientWidth, ellip: el.scrollWidth > el.clientWidth,
  }))
  console.log('Ä15  Zähler:', JSON.stringify(zaehler))
  // Ä17 · Schnipsel im Ruhezustand
  const ersteZeile = await p.locator('[data-treffer-artikel]').first().innerText()
  console.log('Ä17  erste Trefferzeile (zu):', JSON.stringify(ersteZeile.replace(/\n/g, ' ⏎ ')))
  console.log('Ä17  sichtbare Schnipsel im Ruhezustand:', await p.locator('[data-treffer-stellen] .lc-such-ausschnitt').count())
  // Ä18 · Desktop-Reihenfolge
  const ordD = await p.evaluate(() => [...document.querySelectorAll('[data-v3-leiste-uebersicht],[data-v3-leiste-feld],[data-v3-leiste-baum]')].map((e) => e.dataset.v3LeisteUebersicht !== undefined ? 'uebersicht' : e.dataset.v3LeisteFeld !== undefined ? 'feld' : 'baum'))
  console.log('Ä18  Desktop-Reihenfolge:', JSON.stringify(ordD))
  await p.context().close()
}

// ═══ Ä8 · Hover auf lit. a ═════════════════════════════════════════════════
{
  const p = await seite()
  await p.goto(`${BASE}/gesetze/bund/STPO#art-429`)
  await p.waitForSelector('article', { timeout: 30000 })
  await p.waitForTimeout(2500)
  const li = p.locator('article li.rounded-md').first()
  const n = await p.locator('article li.rounded-md').count()
  if (n > 0) {
    const vor = await li.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, w: Math.round(el.getBoundingClientRect().width), tf: getComputedStyle(el).transform }))
    await li.hover(); await p.waitForTimeout(400)
    const nach = await li.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, w: Math.round(el.getBoundingClientRect().width), tf: getComputedStyle(el).transform }))
    console.log('Ä8   lit-Item vor Hover:', JSON.stringify(vor))
    console.log('Ä8   lit-Item bei Hover:', JSON.stringify(nach))
  } else console.log('Ä8   kein li.rounded-md gefunden (n=0)')
  await p.context().close()
}

// ═══ Ä19 + Ä1b · Split-View ════════════════════════════════════════════════
{
  const p = await seite({ width: 1440, height: 900 })
  await p.goto(`${BASE}/gesetze/bund/STPO?p=/gesetze/bund/VMWG`)
  await p.waitForSelector('[data-pane="sekundaer"]', { timeout: 30000 })
  await p.waitForTimeout(1500)
  console.log('Ä19  Suchfelder im Split (sichtbar):', await p.locator('[data-v3-suchsprung] input').count())
  const paneB = await box(p.locator('[data-pane="sekundaer"]').first())
  console.log('Ä19  Pane-Breite sekundaer:', paneB && paneB.w)
  // Ä1b · Artikel in PaneKopf vs. V3-Kopf
  const pane = p.locator('[data-pane="primaer"]').first()
  await pane.evaluate((el) => el.scrollBy(0, 2600)); await p.waitForTimeout(1500)
  await pane.evaluate((el) => el.scrollBy(0, 700)); await p.waitForTimeout(1800)
  const v3 = await p.locator('[data-pane="primaer"] [data-v3-kopf-artikel]').first().innerText().catch(() => '(kein)')
  const krumeArt = await p.evaluate(() => {
    const köpfe = [...document.querySelectorAll('.num')].map((e) => e.textContent || '')
    return köpfe.filter((t) => /^·?\s*Art\./.test(t.trim())).slice(0, 6)
  })
  console.log('Ä1b  V3-Kopf (primär):', JSON.stringify(v3), ' alle Art.-Etiketten im DOM:', JSON.stringify(krumeArt))
  await p.context().close()
}

// ═══ Ä10 + Ä18 · Handy-Sheet ═══════════════════════════════════════════════
{
  const p = await seite({ width: 390, height: 844 })
  await p.goto(`${BASE}/gesetze/bund/STPO`)
  await p.waitForSelector('[data-v3-kopf]', { timeout: 30000 })
  await p.waitForTimeout(800)
  await p.locator('[data-v3-gliederung-auf]').first().click()
  await p.waitForSelector('[data-gliederung-sheet]', { timeout: 15000 })
  await p.waitForTimeout(500)
  const glied = await p.locator('[data-gliederung-sheet]').first().evaluate((el) =>
    [...el.querySelectorAll('*')].filter((e) => (e.textContent || '').trim().toLowerCase() === 'gliederung' && e.children.length === 0).map((e) => e.textContent))
  console.log('Ä10  «Gliederung» im Sheet, Vorkommen:', glied.length, JSON.stringify(glied))
  const ordH = await p.locator('[data-gliederung-sheet]').first().evaluate((el) =>
    [...el.querySelectorAll('[data-v3-suchsprung],[data-v3-leiste-uebersicht],[data-v3-leiste-baum],[data-sie-sind-hier]')].map((e) =>
      e.dataset.v3Suchsprung !== undefined ? 'feld' : e.dataset.v3LeisteUebersicht !== undefined ? 'uebersicht' : e.dataset.sieSindHier !== undefined ? 'sie-sind-hier' : 'baum'))
  console.log('Ä18  Sheet-Reihenfolge:', JSON.stringify(ordH))
  const ueb = await p.locator('[data-gliederung-sheet] [data-v3-uebersicht-zeile]').first()
  if (await ueb.count()) {
    console.log('Ä10  Übersichtszeile im Sheet, Overflow:', JSON.stringify(await ueb.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, txt: el.innerText.slice(0, 60) }))))
  }
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  // Ä10 · «···»-Popover
  const ausl = p.locator('[data-v3-ansicht]').first()
  const ab = await box(ausl)
  await ausl.click(); await p.waitForTimeout(400)
  const pb = await box(p.locator('[data-v3-ansicht-panel]').first())
  console.log('Ä10  Auslöser ···:', JSON.stringify(ab), ' Panel:', JSON.stringify(pb))
  console.log('Ä10  Panel-Rechtskante vs. Auslöser-Rechtskante:', pb && ab ? (pb.x + pb.w) - (ab.x + ab.w) : '?')
  await p.context().close()
}

// ═══ Ä20 + Ä21 + Ä23 + Ä-(d) · Erlassarten ═════════════════════════════════
for (const [ebene, key] of [['kanton', 'ZH-211.11'], ['kanton', 'BS-640.100'], ['bund', 'LUGUE'], ['bund', 'VMWG']]) {
  const p = await seite()
  await p.goto(`${BASE}/gesetze/${ebene}/${encodeURIComponent(key)}`)
  await p.waitForSelector('[data-v3-kopf]', { timeout: 30000 })
  await p.waitForTimeout(1200)
  const ph = await p.locator('[data-v3-suchsprung] input').first().getAttribute('placeholder').catch(() => '(kein Feld)')
  const kuerzel = await p.locator('[data-v3-kopf-kuerzel]').first().innerText().catch(() => '?')
  const kopfText = await p.locator('[data-v3-kopf-ort]').first().innerText().catch(() => '?')
  const h1 = await p.locator('h1').first().innerText().catch(() => '?')
  const appKrume = await p.locator('[data-inhalt-kopf] nav').first().innerText().catch(() => '?')
  console.log(`\n${key}`)
  console.log('  Ä20 Platzhalter :', JSON.stringify(ph))
  console.log('  Ä21 App-Krume   :', JSON.stringify(appKrume.replace(/\n/g, ' ')))
  console.log('  Ä21 V3-Kopf-Ort :', JSON.stringify(kopfText.replace(/\n/g, ' ')), '(Kürzel:', JSON.stringify(kuerzel) + ')')
  console.log('  Ä-d H1         :', JSON.stringify(h1.replace(/\n/g, ' ')), 'Zeilen-h:', JSON.stringify(await box(p.locator('h1').first())))
  // Ä23 «Artikel» in der Trefferliste
  await p.locator('[data-v3-suchsprung] input').first().fill('Gericht')
  await p.waitForTimeout(1600)
  const z = await p.locator('[data-treffer-leiste] p').first().innerText().catch(() => '(keine Liste)')
  console.log('  Ä23 Zählzeile  :', JSON.stringify(z.replace(/\n/g, ' ')))
  await p.context().close()
}

await b.close()
