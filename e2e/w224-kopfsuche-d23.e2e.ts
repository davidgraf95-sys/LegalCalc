// @shard-gruppe: 2
// ═══ D23 · KOPF-SUCHE IST EIN OBJEKT (David 6.9.2026) ═══════════════════════
//
// Davids Wortlaut zum Bild des Leerzustands nach «+»: «schau mal wie das
// aussieht mit der suche. sehr unästhetisch». Drei der Befunde sind
// GEOMETRISCH und darum hier bewacht, statt nur im Bericht behauptet:
//   (a) Panelkante = Feldkante (links UND rechts, Δ 0) — das Panel hatte einen
//       eigenen Breiten-Boden (`min-w-[22rem]`) und war überall dort breiter
//       als das Feld, wo das Feld schmaler ist.
//   (b) kein Spalt zwischen Feld und Panel (`mt-1.5` = 6 px sind weg).
//   (c) das Panel liegt ÜBER der Reiterleiste — beide trugen `z-leiste` (20)
//       als Geschwister, das spätere DOM-Element gewann, und das Etikett
//       «Zuletzt geöffnet» war schlicht übermalt.
// Dazu (d): der «Einstiege»-Block ist weg (er wiederholte die Seitenleiste).
//
// ROT GEFAHREN (§6.7 — 6.9.2026, alle sechs Fälle einmal rot gesehen):
//   Lauf 1 (Mutationen a/b/c/d zusammen): 5 failed · 1 passed.
//     rot: Kanten @1024 (Δ links −32) · Spalt @1024 und @1440 (je 6 px) ·
//          «Panel über der Reiterleiste» · «kein Einstiege-Block».
//     grün blieb «Kanten @1440»: dort ist das Feld 384 px breit und damit
//     ohnehin breiter als der Vorher-Boden von 22 rem = 352 px — der Fall
//     kann an DIESER Mutation nicht scheitern.
//   Lauf 2 (nur `min-w-[26rem]` = 416 px): «Kanten @1440» rot (Δ links −32).
//   Danach zurückgenommen; alle sechs grün.
// DIE MUTATIONEN:
//   (a)/(b) in `HeaderSuche.tsx` die Hülle auf den Vorher-Stand zurücksetzen
//       (`absolute right-0 top-full mt-1.5 w-full min-w-[22rem]`) ⇒ «Kanten»
//       wird rot (@1024 Δ links 176 px) und «kein Spalt» wird rot (6 px).
//   (c) `z-dropdown` am `<header>` in `Topbar.tsx` auf `z-leiste` zurück ⇒
//       «Panel über der Reiterleiste» wird rot (elementFromPoint trifft die
//       Reiterleiste statt das Panel).
//   (d) den `EINSTIEGE`-Block in `SucheLeerzustand.tsx` wieder rendern ⇒
//       «kein Einstiege-Block» wird rot.
import { test, expect, type Page } from '@playwright/test'

const feld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ })

/** Verlauf anlegen (der Leerzustand zeigt sonst nur die ehrliche Leerzeile). */
async function mitVerlauf(page: Page) {
  await page.goto('/rechner/tagerechner')
  await expect(page.locator('h1').first()).toBeVisible()
  await page.goto('/gesetze')
  await expect(page.locator('h1').first()).toBeVisible()
}

async function oeffneLeer(page: Page) {
  await feld(page).click()
  await expect(page.locator('header [role="search"] .lc-suchpanel-huelle')).toBeVisible()
}

/** Kanten von Feld und Panel in Viewport-Koordinaten. */
async function kanten(page: Page) {
  return page.evaluate(() => {
    const s = document.querySelector('header [role="search"]')!
    const f = s.querySelector('input')!.getBoundingClientRect()
    const p = s.querySelector('.lc-suchpanel-huelle')!.getBoundingClientRect()
    const r = (n: number) => Math.round(n)
    return { fl: r(f.left), fr: r(f.right), fb: r(f.bottom), pl: r(p.left), pr: r(p.right), pt: r(p.top) }
  })
}

for (const breite of [1024, 1440]) {
  test(`D23 · Panelkante = Feldkante @${breite}`, async ({ page }) => {
    await page.setViewportSize({ width: breite, height: 900 })
    await mitVerlauf(page)
    await oeffneLeer(page)
    const k = await kanten(page)
    // Δ 0 links UND rechts: das Panel kann seine Breite gar nicht mehr selbst
    // wählen, sie IST die Feldbreite (`inset-x-0` am `role="search"`-Anker).
    expect(k.pl - k.fl, `linke Kante @${breite}`).toBe(0)
    expect(k.pr - k.fr, `rechte Kante @${breite}`).toBe(0)
  })

  test(`D23 · kein Spalt zwischen Feld und Panel @${breite}`, async ({ page }) => {
    await page.setViewportSize({ width: breite, height: 900 })
    await mitVerlauf(page)
    await oeffneLeer(page)
    const k = await kanten(page)
    // Die Unterkante des Feldes (`.lc-input`, 1 px `--rule`) IST die Oberkante
    // des Panels — kein `mt`, keine Luft.
    expect(k.pt - k.fb, `Spalt @${breite}`).toBe(0)
  })
}

test('D23 · das Panel liegt über der Reiterleiste', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mitVerlauf(page)
  await oeffneLeer(page)
  const treffer = await page.evaluate(() => {
    const s = document.querySelector('header [role="search"]')!
    const panel = s.querySelector('.lc-suchpanel-huelle')!
    const reiter = document.querySelector('nav[aria-label="Offene Reiter"]')
    if (!reiter) return { ueberlappt: false, imPanel: false }
    const p = panel.getBoundingClientRect(), r = reiter.getBoundingClientRect()
    const y = (Math.max(p.top, r.top) + Math.min(p.bottom, r.bottom)) / 2
    const x = (p.left + p.right) / 2
    const oben = document.elementFromPoint(x, y)
    return {
      ueberlappt: Math.min(p.bottom, r.bottom) > Math.max(p.top, r.top),
      imPanel: !!oben && panel.contains(oben),
    }
  })
  // Vorbedingung der Messung: die beiden Flächen überlappen überhaupt.
  expect(treffer.ueberlappt, 'Panel und Reiterleiste überlappen (Vorbedingung)').toBe(true)
  expect(treffer.imPanel, 'in der Überlappung liegt das Panel obenauf').toBe(true)
})

test('D23 · kein «Einstiege»-Block mehr im Leerzustand', async ({ page }) => {
  await mitVerlauf(page)
  await oeffneLeer(page)
  const panel = page.locator('header [role="search"] .lc-suchpanel-huelle')
  await expect(panel.getByText('Zuletzt geöffnet', { exact: true })).toBeVisible()
  await expect(panel.getByText('Einstiege', { exact: true })).toHaveCount(0)
  // Die fünf Bereichs-Routen erscheinen im leeren Panel nicht mehr als
  // Optionen — sie stehen in der Seitenleiste (D17).
  for (const name of ['Gesetze', 'Rechtsprechung', 'Materialien', 'Rechner', 'Vorlagen']) {
    await expect(panel.getByRole('option', { name, exact: true })).toHaveCount(0)
  }
})
