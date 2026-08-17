// @shard-gruppe: 8
// ═══ Ä70–Ä74 · DIE ÜBERSICHTSBOX IM BROWSER (David 17.8.2026) ════════════════
//
// «Das Übersichtfeld ist sehr unästhetisch. Insbesondere wenn es aufgeklappt
//  ist. Mach das schöner und orientiere dich an Fedlex.» — Wortlaut David.
//
// Was der Vitest NICHT sagen kann und diese Spec darum misst: ob der Text
// wirklich in die Spalte passt statt gekappt oder überzulaufen, ob die Box eine
// einzige Schriftstimme führt, ob im Handy-Blatt nichts über den Rand tritt und
// ob die Warnung auf der Seite GENAU EINMAL steht. Die Auswahl der Zeilen prüft
// `src/tests/leser-v3-uebersicht.test.ts` — hier geht es um Geometrie.
//
// ── ROT ZU BEKOMMEN (§6.7), je Fall ─────────────────────────────────────────
//  (a) In `v3/uebersichtAngaben.ts` `ruheZeile` wieder `Stand …` anhängen
//      ⇒ die Ruhezeile braucht drei Zeilen statt einer.
//  (b) In `src/index.css` an `.lc-v3-steckbrief dd` `white-space: nowrap;
//      overflow: hidden; text-overflow: ellipsis` setzen (der Ist-Zustand vor
//      Ä70) ⇒ gekappte Werte, gemessen an `scrollWidth > clientWidth`.
//  (c) In `v3/LeserUebersicht.tsx` die Warnung zusätzlich an eine zweite Stelle
//      geben ⇒ zwei Warnsätze auf der Seite.
//  (d) In `v3/UebersichtBox.tsx` den §8-Block wieder in ein `<details>` legen
//      ⇒ zwei Klappen.
//  (e) `.lc-v3-steckbrief > dl { grid-template-columns: 5rem 1fr }` auf `auto
//      1fr` stellen ⇒ die Werte stehen nicht mehr auf einer Kante.
// Alle fünf so gemessen (17.8.2026, chromium, Projekt `leser-v3`).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Die fünf Erlassarten der Neutralitätsprobe (Fahrplan Kap. 7). */
const ERLASSE = [
  { name: 'StPO (Bund, mit Warnung)', pfad: '/gesetze/bund/STPO?leser=v3' },
  { name: 'VMWG (Verordnung)', pfad: '/gesetze/bund/VMWG?leser=v3' },
  { name: 'LugÜ (Staatsvertrag)', pfad: '/gesetze/bund/LUGUE?leser=v3' },
  { name: 'BS-640.100 (Kanton, §)', pfad: '/gesetze/kanton/BS-640.100?leser=v3' },
  { name: 'ZH-211.11 (Kanton, §)', pfad: '/gesetze/kanton/ZH-211.11?leser=v3' },
]

async function boxOeffnen(page: Page, pfad: string): Promise<void> {
  await page.goto(pfad)
  await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('[data-v3-uebersicht]')).toBeVisible({ timeout: 20_000 })
  await page.locator('[data-v3-uebersicht-zeile]').first().click()
  await expect(page.locator('[data-v3-uebersicht-inhalt]').first()).toBeVisible({ timeout: 10_000 })
  // Die Sidecars (Struktur, Currency, Revisionen) wachsen nach — erst wenn der
  // Erlassgeber steht, ist die längste Zeile da und die Messung aussagekräftig.
  await page.waitForTimeout(1200)
}

test.describe('Ä70 — aufgeklappt: nichts gekappt, nichts über den Rand', () => {
  for (const e of ERLASSE) {
    test(`${e.name}: kein Wert gekappt, kein Überlauf, keine leere Zeile`, async ({ page }) => {
      const fehler = fehlerSammeln(page)
      await page.setViewportSize({ width: 1440, height: 900 })
      await boxOeffnen(page, e.pfad)

      const befund = await page.evaluate(() => {
        const box = document.querySelector('[data-v3-uebersicht]') as HTMLElement
        const rect = box.getBoundingClientRect()
        const werte = [...box.querySelectorAll('dd')] as HTMLElement[]
        const labels = [...box.querySelectorAll('dt')] as HTMLElement[]
        return {
          zeilen: werte.length,
          // Die EINE Zeile, die jeder Erlass trägt (`kopfOverline` liefert immer
          // einen Wert) — sie ist die Positiv-Sonde dafür, dass hier überhaupt
          // eine Liste steht.
          hatArt: !!box.querySelector('[data-v3-uebersicht-zeile-id="art"] dd'),
          // Ist-Befund vor Ä70: bis 284 px Text lagen ausserhalb und waren nur
          // im `title` erreichbar — ein Tooltip ist keine Auskunft (§8).
          gekappt: werte
            .map((w, i) => ({
              label: labels[i]?.textContent ?? '?',
              verloren: w.scrollWidth - w.clientWidth,
            }))
            .filter((o) => o.verloren > 1),
          // Nichts tritt seitlich aus der Box heraus.
          ueberlauf: [...box.querySelectorAll('dd, dt, a, li, p')]
            .filter((el) => el.getBoundingClientRect().right > rect.right + 1)
            .map((el) => (el.textContent ?? '').trim().slice(0, 40)),
          // §8: kein Label ohne Wert.
          leereWerte: werte
            .map((w, i) => ({ label: labels[i]?.textContent ?? '?', t: (w.textContent ?? '').trim() }))
            .filter((o) => o.t.length === 0),
          // Fedlex-Rhythmus: ALLE Werte beginnen auf derselben senkrechten Kante.
          wertKanten: [...new Set(werte.map((w) => Math.round(w.getBoundingClientRect().left)))],
        }
      })

      // POSITIV-SONDE, erlassneutral kalibriert: die Zeilenzahl ist KEINE feste
      // Zahl — sie hängt am Datenmodell, und das ist der Punkt. ZH-211.11 trägt
      // genau zwei Zeilen (Art · Stand), weil der Kanton ZH keinen
      // Struktur-Sidecar hat (0 von 1193 unter `public/normtext/struktur/kanton/`,
      // gezählt 17.8.2026) und damit weder Erlassgeber noch Erlassdatum, und
      // weil ohne verifizierte Systematik kein Sachgebiet behauptet wird (§8).
      // Geprüft wird darum das, was IMMER gilt: die Liste steht, und sie trägt
      // die Art-Zeile.
      expect(befund.hatArt, 'die Art-Zeile fehlt — die Messung prüfte nichts').toBe(true)
      expect(befund.zeilen, 'die Box zeigt keine Werte — die Messung prüfte nichts')
        .toBeGreaterThanOrEqual(2)
      expect(befund.gekappt, `gekappte Werte: ${JSON.stringify(befund.gekappt)}`).toEqual([])
      expect(befund.ueberlauf, `tritt aus der Box: ${JSON.stringify(befund.ueberlauf)}`).toEqual([])
      expect(befund.leereWerte, `Label ohne Wert: ${JSON.stringify(befund.leereWerte)}`).toEqual([])
      expect(befund.wertKanten.length,
        `die Werte beginnen an ${befund.wertKanten.length} verschiedenen Kanten (${befund.wertKanten}) — kein Raster`)
        .toBe(1)

      expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
    })
  }
})

test.describe('Ä70/Ä72 — eine Stimme, eine Klappe, eine Warnung', () => {
  test('StPO: EINE Schriftfamilie in der Box, EINE Klappe, die Warnung genau einmal', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await boxOeffnen(page, '/gesetze/bund/STPO?leser=v3')

    const befund = await page.evaluate(() => {
      const box = document.querySelector('[data-v3-uebersicht]') as HTMLElement
      const fam = (el: Element) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '')
      const texte = [...box.querySelectorAll('dt, dd, summary, li, a')]
      return {
        // Ist-Befund: die Ruhezeile lief in `Geist Mono Variable`, die Liste in
        // der Sans — zwei Stimmen in einem Bauteil (Grundlage Kap. 2.1 begrenzt
        // Mono «auf SR-Nr./Aktenzeichen»).
        familien: [...new Set(texte.map(fam))],
        // Ist-Befund: ein zweites `<details>` «Mehr zu diesem Erlass», und
        // dahinter die §8-Sätze — ein Hinweis hinter zwei Klicks ist keiner.
        klappenInnen: box.querySelectorAll('details').length,
        // Ist-Befund: ein zweites Etikett «Erlass-Übersicht» IN einer Box, die
        // schon «Übersicht» heisst.
        ueberschriften: [...box.querySelectorAll('h1,h2,h3,h4,h5,h6')]
          .map((h) => (h.textContent ?? '').trim()),
        // Höhe der Ruhezeile in Zeilen — sie war an allen fünf Erlassen dreizeilig.
        ruheZeilen: (() => {
          const s = box.querySelector('summary') as HTMLElement
          return Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight))
        })(),
      }
    })
    expect(befund.familien.length,
      `zwei Schriftstimmen in der Box: ${befund.familien.join(' + ')}`).toBe(1)
    expect(befund.klappenInnen, 'die Box trägt eine ZWEITE Klappe').toBe(0)
    expect(befund.ueberschriften,
      `zweite Überschrift in der Box: ${JSON.stringify(befund.ueberschriften)}`).toEqual([])
    expect(befund.ruheZeilen, 'die Ruhezeile ist mehrzeilig').toBe(1)

    // Ä28-Erbe, verschärft: der Sachverhalt steht auf der GANZEN SEITE genau
    // zweimal — einmal im Erlass-Kopf, einmal in der Box —, und in der Box
    // genau einmal. Bis Ä70 stand er in der Box zweimal (Warnung + Grundhinweis
    // mit demselben Schluss-Halbsatz).
    const inDerBox = await page.evaluate(() => {
      const box = document.querySelector('[data-v3-uebersicht]') as HTMLElement
      return [...box.querySelectorAll('p, li, dd')]
        .map((p) => (p.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter((t) => /massgeblich ist/i.test(t))
    })
    expect(inDerBox.length, `«massgeblich ist …» in der Box: ${JSON.stringify(inDerBox)}`).toBe(1)
    expect(inDerBox[0]).toContain('noch nicht in den Text eingearbeitet')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})

test.describe('Ä74 — der Stand steht nicht zweimal untereinander', () => {
  test('BS-640.100: das Erlassdatum trägt den Stand-Zusatz nicht mehr', async ({ page }) => {
    // Gemessen 17.8.2026 am gebauten Ä70-Stand: «Erlassdatum · Vom 12. April
    // 2000 (Stand 1. Januar 2026)» und direkt darunter «Stand · 01.01.2026».
    // Ursache war das «am» im Muster von `nurErlassdatum` — Fedlex schreibt
    // «(Stand am …)», die Kantone «(Stand …)»; 1182 von 1420 Sidecars.
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await boxOeffnen(page, '/gesetze/kanton/BS-640.100?leser=v3')

    const datum = await page.evaluate(() => {
      const z = document.querySelector('[data-v3-uebersicht-zeile-id="datum"] dd')
      return (z?.textContent ?? '').trim()
    })
    expect(datum, 'die Erlassdatum-Zeile fehlt — die Messung prüfte nichts').not.toBe('')
    expect(datum, `Erlassdatum trägt den Stand doppelt: «${datum}»`).not.toMatch(/\(Stand/)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})

test.describe('Ä10-Erbe — im Handy-Blatt kein Überlauf', () => {
  test('StPO @390: die Box im Gliederungs-Blatt bleibt in ihrer Breite', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    // Das GLIEDERUNGS-Blatt; im TREFFER-Blatt ist die Box per Ä32/B11-Weiche
    // bewusst abwesend (e2e/leser-v3-blatt (d)).
    await page.locator('[data-v3-gliederung-auf]').first().click()
    const blatt = page.locator('[data-gliederung-sheet]')
    await expect(blatt).toBeVisible({ timeout: 15_000 })
    await blatt.locator('[data-v3-uebersicht-zeile]').click()
    await expect(blatt.locator('[data-v3-uebersicht-inhalt]')).toBeVisible({ timeout: 10_000 })
    await page.waitForTimeout(1200)

    const befund = await page.evaluate(() => {
      const blatt = document.querySelector('[data-gliederung-sheet]') as HTMLElement
      const box = blatt.querySelector('[data-v3-uebersicht]') as HTMLElement
      const r = box.getBoundingClientRect()
      return {
        breiter: box.scrollWidth - box.clientWidth,
        ausserhalb: [...box.querySelectorAll('dd, dt, a, li, p')]
          .filter((el) => {
            const b = el.getBoundingClientRect()
            return b.right > r.right + 1 || b.left < r.left - 1
          })
          .map((el) => (el.textContent ?? '').trim().slice(0, 40)),
        // Die Box darf das Blatt nicht seitlich aufreissen.
        blattBreiter: blatt.scrollWidth - blatt.clientWidth,
      }
    })
    expect(befund.breiter, 'die Box selbst scrollt waagrecht').toBeLessThanOrEqual(1)
    expect(befund.ausserhalb, `tritt aus der Box: ${JSON.stringify(befund.ausserhalb)}`).toEqual([])
    expect(befund.blattBreiter, 'das Blatt scrollt wegen der Box waagrecht').toBeLessThanOrEqual(1)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})

test.describe('a11y — die Klappe hat einen Namen und sagt ihren Zustand', () => {
  test('StPO: `summary` trägt einen Namen, `details` meldet auf/zu', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-uebersicht]')).toBeVisible({ timeout: 20_000 })

    const zeile = page.locator('[data-v3-uebersicht-zeile]').first()
    // Der zugängliche Name kommt aus dem Textinhalt — «Übersicht» plus die
    // Zusammenfassung, die im DOM steht, auch wenn die Box zu ist (§8).
    await expect(zeile).toContainText('Übersicht')
    await expect(zeile).toContainText('SR 312.0')

    const box = page.locator('[data-v3-uebersicht]').first()
    // `<details>`/`<summary>` bringen `aria-expanded` vom Browser mit — es steht
    // nicht im Markup, sondern im Barrierefreiheits-Baum. Geprüft wird darum
    // das `open`-Attribut, das ihn steuert, UND die vom Browser gemeldete Rolle.
    await expect(box).not.toHaveAttribute('open', /.*/)
    await zeile.click()
    await expect(box).toHaveAttribute('open', /.*/)
    const rolle = await zeile.evaluate((el) => (el as HTMLElement).tagName.toLowerCase())
    expect(rolle, 'die Klappe ist kein natives <summary> mehr').toBe('summary')

    // Tastatur: Enter auf dem fokussierten summary schliesst wieder.
    await zeile.focus()
    await page.keyboard.press('Enter')
    await expect(box).not.toHaveAttribute('open', /.*/)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
