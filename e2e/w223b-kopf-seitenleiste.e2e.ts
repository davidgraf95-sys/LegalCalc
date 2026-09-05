// @shard-gruppe: 2
// ── Kopf- und Seitenleiste nach W2·23-STARTSEITE-V4 §6 (Arbeitspaket B) ──────
//
// Drei Zusagen, je mit Gegenprobe (§6.7 — ein Fall, der nicht rot werden kann,
// ist keiner):
//   §6.1  Auf «/» trägt der Streifen KEIN Suchfeld (der Hero trägt die eine
//         Suche); auf jeder anderen Route steht es unverändert. «/» und ⌘K
//         fokussieren auf «/» die Suche der Seite, und der Streifen springt
//         beim Routenwechsel nicht.
//   §6.2  Der Schriftregler «Ganze Seite» steht auf /einstellungen und wirkt
//         dort — im Streifen steht er nicht mehr.
//   §6.3  Die Seitenleiste trägt den Korpus-Stand-Fuss, auf Desktop wie in der
//         mobilen Schublade.
import { test, expect, type Page } from '@playwright/test'

const kopfFeld = (page: Page) => page.locator('header.sticky input[type="search"]')
/** Das erste Suchfeld der Seite AUSSERHALB des Kopfes — derselbe ARIA-Kontrakt,
 *  über den die Umleitung in `Topbar.tsx` ihr Ziel sucht (keine Kopplung an die
 *  Startseiten-Interna von Arbeitspaket A). */
const seitenFeld = (page: Page) => page.locator('[role="search"] input').first()

test.describe('§6.1 · Der Streifen trägt auf «/» keine zweite Suche', () => {
  // ROT ZU BEKOMMEN: in `Topbar.tsx` das `{!aufStartseite && …}` um die
  // HeaderSuche entfernen ⇒ «/» trägt wieder zwei Suchfelder.
  test('«/» ohne Kopf-Suchfeld, /gesetze mit (Gegenprobe)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header.sticky')).toBeVisible({ timeout: 20_000 })
    await expect(kopfFeld(page)).toHaveCount(0)
    await expect(page.locator('header.sticky [data-suche-lupe]')).toHaveCount(0)
    // Die eine Suche der Seite steht im Inhalt.
    await expect(seitenFeld(page)).toBeVisible()

    await page.goto('/gesetze')
    await expect(kopfFeld(page)).toHaveCount(1)
  })

  test('«/» und ⌘K fokussieren auf «/» die Suche der Seite (Umleitung ohne Kopf-Feld)', async ({ page }) => {
    await page.goto('/')
    const feld = seitenFeld(page)
    await expect(feld).toBeVisible({ timeout: 20_000 })

    await page.keyboard.press('/')
    await expect(feld).toBeFocused()
    // Das fokussierte Feld liegt NICHT im Kopf (dort steht auf «/» keines mehr).
    expect(await feld.evaluate((el) => el.closest('header') !== null)).toBe(false)

    // Feld verlassen, dann Ctrl-K — beide Kürzel führen zum selben Feld.
    await page.getByRole('link', { name: 'Zum Inhalt springen' }).focus()
    await page.keyboard.press('Control+k')
    await expect(feld).toBeFocused()
  })

  // Der Alltagsweg ist der SPA-Wechsel (Klick auf «Start»), nicht das Neuladen:
  // dabei meldet sich die HeaderSuche als Kürzel-Empfänger AB und die Umleitung
  // AN. Die Reihenfolge steht nirgends geschrieben — darum wird sie gemessen.
  // ROT ZU BEKOMMEN: in `Topbar.tsx` den Aufruf `useSuchKuerzelUmleitung(...)`
  // entfernen ⇒ «/» drückt nach dem Wechsel ins Leere.
  test('Auch nach dem SPA-Wechsel auf «/» greift die Umleitung', async ({ page }) => {
    await page.goto('/gesetze')
    await expect(kopfFeld(page)).toHaveCount(1)
    await page.locator('aside[data-app-seitenleiste]').getByRole('link', { name: 'Start', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(kopfFeld(page)).toHaveCount(0)
    await page.keyboard.press('/')
    await expect(seitenFeld(page)).toBeFocused()
  })

  // §6.1 «Layout darf nicht springen»: die Hülle des Feldes bleibt als
  // flex-1-Dehnungsraum stehen, also endet die Werkzeug-Gruppe rechts auf «/»
  // an derselben Kante wie auf /gesetze.
  // ROT ZU BEKOMMEN: in `Topbar.tsx` statt der leeren Hülle das ganze <div>
  // bedingt rendern ⇒ die Knöpfe rücken auf «/» nach links.
  test('Der Streifen springt beim Routenwechsel nicht', async ({ page }) => {
    const kante = async () => {
      const box = await page.locator('header.sticky button[aria-label^="Farbschema"]').first().boundingBox()
      return Math.round(box!.x)
    }
    await page.goto('/gesetze')
    await expect(page.locator('header.sticky')).toBeVisible({ timeout: 20_000 })
    const mitFeld = await kante()
    await page.goto('/')
    await expect(page.locator('header.sticky')).toBeVisible({ timeout: 20_000 })
    expect(Math.abs((await kante()) - mitFeld)).toBeLessThanOrEqual(2)
  })
})

test.describe('§6.2 · Der Schriftregler steht auf /einstellungen', () => {
  const regler = (page: Page) => page.getByRole('group', { name: 'Schriftgrösse der ganzen Seite' })

  // ROT ZU BEKOMMEN: den Regler-Block in `pages/Einstellungen.tsx` entfernen.
  test('/einstellungen trägt ihn und er skaliert die Wurzel-Schrift', async ({ page }) => {
    await page.goto('/einstellungen')
    await expect(regler(page)).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Ganze Seite vergrössern' })).toBeVisible()
    await page.getByRole('button', { name: 'Ganze Seite vergrössern' }).click()
    // 100 % → 110 %: sichtbarer Wert UND Wurzel-Schriftgrösse ziehen mit.
    await expect(regler(page)).toContainText('110 %')
    expect(await page.evaluate(() => document.documentElement.style.fontSize)).toBe('110%')
  })

  // ROT ZU BEKOMMEN: den Block wieder in `Topbar.tsx` einsetzen.
  test('Der Streifen trägt ihn nicht mehr (auch nicht auf breitem Schirm)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze')
    await expect(page.locator('header.sticky')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('banner').getByRole('group', { name: 'Schriftgrösse der ganzen Seite' })).toHaveCount(0)
  })
})

test.describe('§6.3 · Die Seitenleiste nennt den Stand des Korpus', () => {
  // ROT ZU BEKOMMEN: den <KorpusStand>-Fuss in `Sidebar.tsx` entfernen.
  test('Desktop-Leiste: Fuss «Register erzeugt» mit allen drei Registern', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze')
    const fuss = page.locator('aside[data-app-seitenleiste] nav p', { hasText: 'Register erzeugt' })
    await expect(fuss).toBeVisible({ timeout: 20_000 })
    await expect(fuss).toContainText('Gesetze')
    await expect(fuss).toContainText('Rechtsprechung')
    await expect(fuss).toContainText('Materialien')
    // §8: «Register erzeugt», nie «Stand der Rechtsprechung» (die Felder
    // datieren den Build-Lauf, nicht den jüngsten Inhalt).
    await expect(fuss).not.toContainText('Stand der Rechtsprechung')
  })

  test('Mobile Schublade @390 trägt denselben Fuss', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze')
    await page.getByRole('button', { name: 'Navigation öffnen' }).click()
    const schublade = page.getByRole('dialog', { name: 'Navigation' })
    await expect(schublade).toBeVisible({ timeout: 20_000 })
    await expect(schublade.locator('p', { hasText: 'Register erzeugt' })).toBeVisible()
  })
})
