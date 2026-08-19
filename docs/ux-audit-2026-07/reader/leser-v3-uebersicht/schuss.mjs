// Bildbogen Übersichtsbox — Ist/Soll, gleiche Matrix vorher/nachher.
// Aufruf: node schuss.mjs <ZIELORDNER>
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4321'
const OUT = process.argv[2]
if (!OUT) { console.error('Zielordner fehlt'); process.exit(1) }
mkdirSync(OUT, { recursive: true })

// Die fünf Erlassarten der Neutralitätsprobe.
const ERLASSE = [
  { name: 'stpo', pfad: '/gesetze/bund/STPO' },        // Bund, mit Warnung «nicht konsolidiert»
  { name: 'vmwg', pfad: '/gesetze/bund/VMWG' },        // Verordnung
  { name: 'lugue', pfad: '/gesetze/bund/LUGUE' },      // Staatsvertrag
  { name: 'bs-640-100', pfad: '/gesetze/kanton/BS-640.100' }, // Kanton, §
  { name: 'zh-211-11', pfad: '/gesetze/kanton/ZH-211.11' },   // Kanton, §
]

const MODI = ['hell', 'dunkel']

const browser = await chromium.launch()

async function seiteVorbereiten(ctx, modus) {
  const page = await ctx.newPage()
  await page.addInitScript((m) => {
    // Die App kennt die Werte 'hell'|'dunkel'|'auto' (src/components/thema.ts).
    // Ein fremder Wert wird als «keine Wahl» verworfen und fällt auf
    // prefers-color-scheme zurück — der erste Anlauf am 17.8.2026 schrieb
    // 'dark'/'light' und nahm darum ZWEIMAL hell auf (byte-gleiche Dateien).
    localStorage.setItem('lexmetrik-thema', m)
    localStorage.setItem('lm.leser.v3', '1')
  }, modus)
  return page
}

async function warte(page) {
  await page.waitForSelector('[data-leser-v3="rahmen"]', { timeout: 30000 })
  await page.waitForSelector('[data-v3-uebersicht]', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2200) // Sidecars (Struktur, Currency, Revisionen)
}

/** Ausschnitt der Übersichtsbox + etwas Luft — das ist der Prüfgegenstand. */
async function boxSchuss(page, datei) {
  const box = page.locator('[data-v3-uebersicht]').first()
  if (await box.count() === 0) { console.log('KEINE BOX', datei); return }
  const b = await box.boundingBox()
  if (!b) { console.log('BOX UNSICHTBAR', datei); return }
  const vp = page.viewportSize()
  await page.screenshot({
    path: datei,
    clip: {
      x: Math.max(0, b.x - 12),
      y: Math.max(0, b.y - 12),
      width: Math.min(vp.width - Math.max(0, b.x - 12), b.width + 24),
      height: Math.min(vp.height - Math.max(0, b.y - 12), b.height + 24),
    },
  })
  console.log('OK', datei)
}

for (const modus of MODI) {
  // ── D 1440 · Ruhe + aufgeklappt (Box-Ausschnitt und ganze Seite) ──────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    for (const e of ERLASSE) {
      const page = await seiteVorbereiten(ctx, modus)
      try {
        await page.goto(BASE + e.pfad, { waitUntil: 'domcontentloaded', timeout: 45000 })
        await warte(page)
        await boxSchuss(page, `${OUT}/d-${e.name}-${modus}-ruhe.png`)
        await page.screenshot({ path: `${OUT}/d-${e.name}-${modus}-seite.png` })
        await page.locator('[data-v3-uebersicht-zeile]').first().click()
        await page.waitForTimeout(700)
        await boxSchuss(page, `${OUT}/d-${e.name}-${modus}-offen.png`)
        await page.screenshot({ path: `${OUT}/d-${e.name}-${modus}-seite-offen.png` })
      } catch (err) { console.log('FAIL', 'd', e.name, modus, err.message) }
      await page.close()
    }
    await ctx.close()
  }

  // ── H 390 · Blatt (Sheet) hinter ☰ ────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
    for (const e of ERLASSE) {
      const page = await seiteVorbereiten(ctx, modus)
      try {
        await page.goto(BASE + e.pfad, { waitUntil: 'domcontentloaded', timeout: 45000 })
        await page.waitForSelector('[data-leser-v3="rahmen"]', { timeout: 30000 })
        await page.waitForTimeout(2200)
        // Blatt öffnen
        // Das GLIEDERUNGS-Blatt (nicht das Treffer-Blatt — dort ist die Box per
        // Ä32/B11-Weiche bewusst abwesend, s. e2e/leser-v3-blatt (d)).
        await page.locator('[data-v3-gliederung-auf]').first().click()
        await page.waitForSelector('[data-gliederung-sheet]', { timeout: 15000 })
        await page.waitForTimeout(700)
        await page.screenshot({ path: `${OUT}/h-${e.name}-${modus}-blatt.png` })
        const zeile = page.locator('[data-v3-uebersicht-zeile]').first()
        if (await zeile.count() > 0) {
          await zeile.click(); await page.waitForTimeout(700)
          await page.screenshot({ path: `${OUT}/h-${e.name}-${modus}-blatt-offen.png` })
          await boxSchuss(page, `${OUT}/h-${e.name}-${modus}-offen.png`)
        } else {
          console.log('H: keine Übersichtszeile im Blatt', e.name)
        }
      } catch (err) { console.log('FAIL', 'h', e.name, modus, err.message) }
      await page.close()
    }
    await ctx.close()
  }

  // ── Split 1440 · zwei Panes ───────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const page = await seiteVorbereiten(ctx, modus)
    try {
      await page.goto(`${BASE}/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/VMWG%3Fleser%3Dv3`,
        { waitUntil: 'domcontentloaded', timeout: 45000 })
      await warte(page)
      await page.screenshot({ path: `${OUT}/split-stpo-vmwg-${modus}-ruhe.png` })
      // Im Split trägt kein Pane eine Spalte (Kap. 4d: nie drei vertikale
      // Flächen) — die Gliederung liegt je Pane im Blatt. Also erst öffnen.
      const auf = page.locator('[data-v3-gliederung-auf]')
      if (await auf.count() > 0) {
        await auf.first().click()
        await page.waitForSelector('[data-gliederung-sheet]', { timeout: 15000 })
        await page.waitForTimeout(700)
        await page.screenshot({ path: `${OUT}/split-stpo-vmwg-${modus}-blatt.png` })
      }
      const zeilen = page.locator('[data-v3-uebersicht-zeile]')
      const n = await zeilen.count()
      for (let i = 0; i < n; i++) { await zeilen.nth(i).click(); await page.waitForTimeout(350) }
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${OUT}/split-stpo-vmwg-${modus}-offen.png` })
      console.log('Split-Übersichtszeilen:', n)
    } catch (err) { console.log('FAIL', 'split', modus, err.message) }
    await page.close()
    await ctx.close()
  }
}

await browser.close()
console.log('DONE')
