// Messreihe zur Übersichtsbox — Zahlen statt Eindrücke (§0 Ziff. 2).
// Aufruf: node mass.mjs   (erwartet `npm run preview -- --port 4321`)
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:4321'
const ERLASSE = [
  ['STPO', '/gesetze/bund/STPO'],
  ['VMWG', '/gesetze/bund/VMWG'],
  ['LUGUE', '/gesetze/bund/LUGUE'],
  ['BS-640.100', '/gesetze/kanton/BS-640.100'],
  ['ZH-211.11', '/gesetze/kanton/ZH-211.11'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

for (const [name, pfad] of ERLASSE) {
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    localStorage.setItem('lm.leser.v3', '1')
    localStorage.setItem('lexmetrik-thema', 'hell')
  })
  await page.goto(BASE + pfad, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('[data-v3-uebersicht]', { timeout: 30000 })
  await page.waitForTimeout
  await page.waitForTimeout(2500)
  await page.locator('[data-v3-uebersicht-zeile]').first().click()
  await page.waitForTimeout(600)

  const m = await page.evaluate(() => {
    const box = document.querySelector('[data-v3-uebersicht]')
    const zeile = document.querySelector('[data-v3-uebersicht-zeile]')
    const fam = (el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '')
    const px = (el) => Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10
    // Gekappte Zeilen: text-overflow greift, wenn scrollWidth > clientWidth.
    const gekappt = [...box.querySelectorAll('p')]
      .filter((p) => getComputedStyle(p).textOverflow === 'ellipsis' && p.scrollWidth > p.clientWidth + 1)
      .map((p) => ({
        text: (p.textContent ?? '').replace(/\s+/g, ' ').trim(),
        verloren: p.scrollWidth - p.clientWidth,
      }))
    // Zeilen, die über den Behälter hinauslaufen (Überlauf statt Kappung).
    const box_r = box.getBoundingClientRect()
    const ueberlauf = [...box.querySelectorAll('p, li, a')]
      .filter((el) => el.getBoundingClientRect().right > box_r.right + 1)
      .map((el) => ({
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50),
        px: Math.round(el.getBoundingClientRect().right - box_r.right),
      }))
    const saetze = [...box.querySelectorAll('p, li')]
      .map((p) => (p.textContent ?? '').replace(/\s+/g, ' ').trim())
    const zsf = zeile.querySelector('.num, [class*="num"]')
    return {
      boxHoehe: Math.round(box_r.height),
      // Zeilenzahl der Zusammenfassung: Höhe / line-height.
      zsfZeilen: Math.round(zeile.getBoundingClientRect().height
        / parseFloat(getComputedStyle(zeile).lineHeight)),
      zsfFamilie: zsf ? fam(zsf) : null,
      zsfPx: zsf ? px(zsf) : null,
      etikettInnen: [...box.querySelectorAll('h2, h3')].map((h) => (h.textContent ?? '').trim()),
      details: box.querySelectorAll('details').length,
      linien: [...box.querySelectorAll('*')].filter((el) => {
        const s = getComputedStyle(el)
        return (parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderBottomWidth) > 0)
          && s.borderTopStyle !== 'none'
      }).length,
      // Der doppelte Halbsatz: «massgeblich … amtliche Fassung» — wie oft?
      massgeblich: saetze.filter((t) => /massgeblich ist/i.test(t)),
      gekappt,
      ueberlauf,
      // Zahlen-Stimmen in der Box: wie viele verschiedene Familien tragen Ziffern?
      zahlFamilien: [...new Set([...box.querySelectorAll('.num')].map(fam))],
      labelBreiten: [...box.querySelectorAll('p > span:first-child')]
        .map((s) => ({ t: (s.textContent ?? '').trim(), w: Math.round(s.getBoundingClientRect().width) }))
        .filter((o) => o.t.endsWith(':')),
    }
  })
  console.log(`\n═══ ${name} ═══`)
  console.log(JSON.stringify(m, null, 1))
  await page.close()
}
await ctx.close()
await browser.close()
