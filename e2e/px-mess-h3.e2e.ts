// TEMPORÄRE MESS-SONDE (H3-Nachzug, 17.8.2026) — wird nach der Diagnose gelöscht.
// Läuft nur mit PX=1 im Projekt `px`, ist damit aus den Shards heraus.
import { test, expect, type Page } from '@playwright/test'

async function v3(page: Page, pfad: string): Promise<void> {
  await page.goto(pfad)
  await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
}

async function box(page: Page, sel: string) {
  const l = page.locator(sel).first()
  if (await l.count() === 0) return null
  return await l.boundingBox()
}

test('M1 · A1 ewiges Laden ohne Shard (ZH-211.11) vs mit Shard (BS-640.100)', async ({ page }) => {
  for (const pfad of ['/gesetze/kanton/ZH-211.11?leser=v3', '/gesetze/kanton/BS-640.100?leser=v3']) {
    await v3(page, pfad)
    await page.locator('[data-v3-panel-lasche], [data-v3-panel-zaehler]').first().click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(8000)
    const txt = await page.locator('[data-v3-panel-reiter-inhalt="entscheide"]').innerText()
    console.log(`M1 ${pfad}\n     TEXT: ${txt.replace(/\n/g, ' | ').slice(0, 300)}`)
  }
})

test('M2 · B1/B2/B4/B5 Geometrie an drei Breiten (StPO)', async ({ page }) => {
  for (const [w, h] of [[390, 844], [1024, 800], [1440, 900]] as const) {
    await page.setViewportSize({ width: w, height: h })
    await v3(page, '/gesetze/bund/STPO?leser=v3')
    const artikel = await box(page, '.lc-leser article')
    const lasche0 = await box(page, '[data-v3-panel-lasche]')
    const zaehler0 = await box(page, '[data-v3-panel-zaehler]')
    const kopf = await box(page, '[data-v3-kopf]')
    const wurzel = await box(page, '[data-leser-v3="rahmen"]')
    console.log(`M2 @${w}: kopf=${JSON.stringify(kopf)} wurzel=${JSON.stringify(wurzel)}`)
    console.log(`M2 @${w}: article=${JSON.stringify(artikel)} lasche=${JSON.stringify(lasche0)} zaehler=${JSON.stringify(zaehler0)}`)
    if (artikel && lasche0) {
      const ueberlappung = (artikel.x + artikel.width) - lasche0.x
      console.log(`M2 @${w}: LASCHE-ÜBERLAPPUNG in den Artikel = ${ueberlappung.toFixed(1)} px`)
    }
    // Öffner-Zahl im Ruhezustand (Ä49)
    console.log(`M2 @${w}: Öffner sichtbar — lasche=${await page.locator('[data-v3-panel-lasche]').count()} zaehler=${await page.locator('[data-v3-panel-zaehler]').count()}`)
    // Panel auf
    await page.locator('[data-v3-panel-lasche], [data-v3-panel-zaehler]').first().click()
    await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
    const blatt = await box(page, '[data-v3-panel-form]')
    const form = await page.locator('[data-v3-panel-form]').first().getAttribute('data-v3-panel-form')
    console.log(`M2 @${w}: BLATT form=${form} box=${JSON.stringify(blatt)}  (Kopf endet bei y=${kopf ? kopf.y + kopf.height : '?'})`)
    // Ist der Lesetext bei offenem Blatt anklickbar? (B1 · nicht-modal auf D)
    const scrim = await page.locator('[data-v3-panel-spur="blatt"] .bg-ink-900\\/30').count()
    const modal = await page.locator('[data-v3-panel-form]').first().getAttribute('aria-modal')
    console.log(`M2 @${w}: scrim=${scrim} aria-modal=${modal}`)
    // A3: aria-controls am Öffner
    const oe = page.locator('[data-v3-panel-zaehler], [data-v3-panel-lasche]').first()
    console.log(`M2 @${w}: öffner aria-controls=${await oe.getAttribute('aria-controls')} aria-expanded=${await oe.getAttribute('aria-expanded')}`)
  }
})

test('M3 · A2 Kehrseite: Schalter aus @390 — welche Wege bleiben?', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await v3(page, '/gesetze/bund/STPO?leser=v3')
  await page.locator('[data-v3-ansicht]').click()
  await page.getByRole('switch', { name: /Rechtsprechung im Text/ }).click()
  await page.keyboard.press('Escape')
  console.log(`M3 @390 nach AUS: lasche=${await page.locator('[data-v3-panel-lasche]').count()} zaehler=${await page.locator('[data-v3-panel-zaehler]').count()}`)
  await page.locator('[data-v3-ansicht]').click()
  const menu = await page.locator('[data-v3-ansicht-panel]').innerText()
  console.log(`M3 Ansicht-Menü-Inhalt: ${menu.replace(/\n/g, ' | ')}`)
})

test('M4 · Filterzeile: Höhe vor der ersten Gruppe (Ä47)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await v3(page, '/gesetze/bund/STPO?leser=v3')
  await page.locator('[data-v3-panel-zaehler], [data-v3-panel-lasche]').first().click()
  await expect(page.locator('[data-v3-panel]')).toBeVisible({ timeout: 20_000 })
  const filter = await box(page, '[data-v3-panel-filter]')
  const gruppe = await box(page, '[data-v3-panel-gruppe]')
  console.log(`M4 filter=${JSON.stringify(filter)} ersteGruppe=${JSON.stringify(gruppe)}`)
  const txt = await page.locator('[data-v3-panel-filter]').innerText()
  console.log(`M4 Filter-TEXT (${txt.length} Zeichen): ${txt.replace(/\n/g, ' | ').slice(0, 600)}`)
})
