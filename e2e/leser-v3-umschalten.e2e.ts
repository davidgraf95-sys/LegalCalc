// @shard-gruppe: 5
// FAHRPLAN-LESER-V3, FL-6 — Umschalten V1↔V3 verliert nichts. Zwei geteilte
// Wahrheiten dürfen beim Wechsel nicht auseinanderlaufen: der Options-Store
// `lm.leser.optionen` (leserOptionen.ts, §5 — EIN Speicher, KEIN zweiter für
// V3) und der Artikel-Anker in der Adresse (`#art-N`). FL-7-Fussnote: solange
// FL-1…FL-6 gelten, bleibt `inhalt.tsx` (V1) eingefroren — dieser Test prüft
// darum nur, dass V3 sich an die geteilten Wahrheiten hält, nie den V1-Code.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

test.describe('FL-6 — Umschalten V1 ↔ V3 verliert nichts', () => {
  test('(a) Options-Schalter (Fussnoten aus) ist NACH dem Wechsel auf V1 noch aus — geteilter Store', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })

    // BGBM: kleiner Erlass mit Fussnoten-Apparat (Präzedenz leser-optionen.e2e.ts).
    await page.goto('/gesetze/bund/BGBM?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    // ── SELEKTOR NACHGEZOGEN (Treuebruch-Fix 16.8.2026) ────────────────────
    // Hier stand `.lc-leser button[aria-label^="Fussnote"]`. Dieser Selektor
    // trifft in V3 NICHT den Fussnoten-Marker, sondern den SCHALTER
    // «Fussnoten (26)» im Ansicht-Menü — das Menü liegt in V3 innerhalb von
    // `.lc-leser`. Genau daraus bestand der von David gemeldete Defekt: die
    // CSS-Regel suchte über den accessible name und blendete den Schalter aus,
    // mit dem man sie zurücknimmt.
    //
    // DIESER TEST WAR GRÜN, WEIL DER DEFEKT DA WAR: `toBeHidden()` prüfte in
    // Wahrheit, dass der Bedienknopf verschwindet. Nachdem der Wurzel-Fix den
    // Schalter korrekt stehen lässt, fällt die Zeile — richtigerweise.
    // Der Test zielt jetzt auf die Kennung, die der Marker seit dem Fix trägt
    // (`data-fn-ref`, gesetzt in `ArtikelBody.tsx`); sie ist eindeutig,
    // hüllenneutral, und der Schalter trägt sie nicht.
    const marker = page.locator('.lc-leser [data-fn-ref]').first()
    await expect(marker).toBeVisible({ timeout: 15_000 })

    await page.locator('[data-v3-ansicht]').click()
    await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
    await page.getByRole('switch', { name: 'Fussnoten' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus')
    await expect(marker).toBeHidden()

    // Wechsel auf V1 — derselbe Erlass, derselbe localStorage-Origin.
    await page.goto('/gesetze/bund/BGBM?leser=v1')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus')
    // Die Ist-Hülle zeigt denselben Zustand — kein zweiter, unabhängiger Speicher.
    // Dieselbe Kennung in der Ist-Hülle — sie ist bewusst hüllenneutral, damit
    // dieser Vergleich überhaupt einer ist (in V1 lag das Ansicht-Menü
    // ausserhalb von `.lc-leser`, der alte Selektor traf dort tatsächlich
    // Marker; die Spec verglich also links und rechts Verschiedenes).
    const markerV1 = page.locator('.lc-leser [data-fn-ref]').first()
    await expect(markerV1).toBeHidden({ timeout: 15_000 })

    expect(fehler).toEqual([])
  })

  test('(a2) S1: «Änderungsvermerke aus» in V3 wirkt in V1 GENAUSO — geteilte Optionen-Schicht', async ({ page }) => {
    // S1 ist eine Etappe des Strangs S: sie baut die GETEILTE Optionen-Schicht um
    // und wirkt darum in BEIDEN Hüllen. Ein Umbau, der nur in einer Hülle greift,
    // wäre ein zweiter Speicher (§5) — genau das, was FL-6 ausschliesst.
    //
    // Der Fall ist zugleich der Parität-Beweis für die Zusage der Etappe: bei
    // «aus» bleibt keine Historie-Spur im Lesekörper, und «keine» heisst in
    // BEIDEN Hüllen keine. Geprüft wird die «Fassung»-Zeile
    // (`[data-historie-zeile]`), weil sie der Träger ist, der vor S1 an gar
    // keinem Schalter hing (Befund K4) — sie ist die Stelle, an der eine
    // halbe Umsetzung auffällt.
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto('/gesetze/bund/BGBM?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-2')).toBeVisible({ timeout: 20_000 })
    await page.locator('#art-2').scrollIntoViewIfNeeded()

    // POSITIV-Vorbedingung: die Fassungs-Zeile ist überhaupt da (sie wächst mit
    // dem idle-Shard-Resolve ein). Ohne sie prüfte die Negativ-Zusicherung
    // nichts — ein Tor, das nicht scheitern kann (§6.7).
    const fassungV3 = page.locator('#art-2 [data-historie-zeile]')
    await expect(fassungV3).toBeVisible({ timeout: 15_000 })

    await page.locator('[data-v3-ansicht]').click()
    await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
    await page.getByRole('switch', { name: 'Änderungsvermerke' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus')
    await page.locator('#art-2').scrollIntoViewIfNeeded()
    await expect(fassungV3).toBeHidden()

    // Wechsel auf V1 — derselbe Erlass, derselbe localStorage-Origin.
    await page.goto('/gesetze/bund/BGBM?leser=v1')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus')
    await expect(page.locator('#art-2')).toBeVisible({ timeout: 20_000 })
    await page.locator('#art-2').scrollIntoViewIfNeeded()
    // Dieselbe Kennung in der Ist-Hülle: die Zeile ist im DOM (der Shard lädt),
    // aber unsichtbar — kein zweiter, unabhängiger Speicher und keine Hülle, die
    // den Schalter anders auslegt.
    const fassungV1 = page.locator('#art-2 [data-historie-zeile]')
    await expect(fassungV1).toHaveCount(1, { timeout: 15_000 })
    await expect(fassungV1).toBeHidden()

    expect(fehler).toEqual([])
  })

  // ── D1 (S1-Rest, gebaut im H3-Nachzug 17.8.2026) ──────────────────────────
  // «Änderungsvermerke» wird auch in V3 nur noch ANGEBOTEN, wenn der Erlass
  // Vermerke trägt. Die Bedingung ist NICHT nachgebaut: V3 zieht dieselbe
  // Funktion `bieteAenderungsvermerkeSchalter` aus `../berechnungen`, die V1
  // seit S1 zieht (§5) — Regel, drei Zustände und Korpus-Messung stehen dort
  // und in `src/tests/aenderungsvermerke-schalter.test.ts`.
  //
  // VORHER, gemessen am gebauten H3-Stand: auf BS-640.100 und ZH-211.11 stand
  // der Schalter unbedingt im «Ansicht ▾»-Panel (3 `role=switch`), obwohl es
  // dort nichts zu blenden gibt — V1 hatte ihn an derselben Stelle schon nicht
  // mehr. Genau diese Asymmetrie war die offene S1-Nachzug-Zeile B3.
  //
  // PAAR aus Positiv und Negativ, bewusst beides (Muster aus
  // `leser-optionen.e2e.ts`): eine Sonde, die nur die Abwesenheit prüft, wäre
  // auch mit einem generell verschwundenen Schalter grün.
  //
  // ROT ZU BEKOMMEN (§6.7): in `v3/LeserAnsichtV3.tsx` die Bedingung
  // `hatAenderungsvermerke && …` vor dem zweiten `V3Switch` entfernen ⇒ die
  // beiden Negativ-Fälle melden «expected count 0, received 1» und der
  // Schalter-Zähler 2 → 3.
  test('(a3) D1: «Änderungsvermerke» nur bei Erlassen, die Vermerke tragen — dieselbe Quelle wie V1', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    const panel = page.locator('[data-v3-ansicht-panel]')
    const oeffne = async (pfad: string) => {
      await page.goto(`${pfad}?leser=v3`)
      await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
      // Vorbedingung: die Artikel sind da. Sonst prüfte die Sonde den
      // Lade-Zustand, in dem die Funktion bewusst KONSERVATIV anbietet
      // (`erlassGeladen === false`, Herleitung in `../berechnungen`) — und
      // wäre je nach Laufzeit einmal grün und einmal rot.
      await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 })
      await page.locator('[data-v3-ansicht]').click()
      await expect(panel).toBeVisible()
    }

    // POSITIV — StPO: 187 von 283 Fussnoten sind `kl:'A'`, dazu ein
    // Historie-Shard. Alle drei V3-Schalter stehen.
    await oeffne('/gesetze/bund/STPO')
    await expect(panel.getByRole('switch', { name: 'Änderungsvermerke' })).toHaveCount(1)
    await expect(panel.getByRole('switch')).toHaveCount(3)

    // NEGATIV 1 — BS-640.100 (StG BS): 16 Fussnoten, KEINE klassifiziert, kein
    // Historie-Shard. Der Fussnoten-Schalter bleibt (die 16 sind da und er
    // blendet sie wirklich aus), «Rechtsprechung im Text» auch.
    await oeffne('/gesetze/kanton/BS-640.100')
    await expect(panel.getByRole('switch', { name: 'Änderungsvermerke' })).toHaveCount(0)
    await expect(panel.getByRole('switch', { name: 'Fussnoten' })).toHaveCount(1)
    await expect(panel.getByRole('switch')).toHaveCount(2)
    // §8: nichts weggeblendet — es gibt hier wirklich keine Fassungs-Zeile.
    await expect(page.locator('[data-historie-zeile]')).toHaveCount(0)

    // NEGATIV 2 — ZH-211.11: gar KEIN Struktur-Sidecar (404 → `null`). Der
    // zweideutige `null`-Fall, an dem eine naive Fassung scheitert: bei
    // geladenem Erlass heisst kein Sidecar «keine Fussnoten, also auch keine
    // Vermerke». Er zählt Paragraphen, nicht Artikel — darum eigener Anker.
    await page.goto('/gesetze/kanton/ZH-211.11?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.lc-leser article').first()).toBeVisible({ timeout: 20_000 })
    await page.locator('[data-v3-ansicht]').click()
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('switch', { name: 'Änderungsvermerke' })).toHaveCount(0)
    await expect(panel.getByRole('switch')).toHaveCount(2)

    expect(fehler, fehler.join('\n')).toEqual([])
  })

  test('(b) #art-429 bleibt beim Wechsel V3→V1→V3 im Viewport (Erlass + Anker gehen nicht verloren)', async ({ page }) => {
    test.slow() // grosser Erlass (StPO)
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeInViewport({ timeout: 20_000 })

    await page.goto('/gesetze/bund/STPO?leser=v1#art-429')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('StPO', { timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeInViewport({ timeout: 20_000 })

    await page.goto('/gesetze/bund/STPO?leser=v3#art-429')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-429')).toBeInViewport({ timeout: 20_000 })

    expect(fehler).toEqual([])
  })

  test('(b2) Ansicht-Öffner: `aria-controls` erst, wenn das Panel wirklich da ist (B3)', async ({ page }) => {
    // Bug-Check 16.8.2026: der Öffner trug `aria-controls` auch im Ruhezustand,
    // in dem das Panel gar nicht gerendert wird — eine Id-Referenz ins Leere
    // (axe `aria-valid-attr-value`; ein Screenreader bietet einen Sprung an,
    // der nirgends landet, §8). Geprüft wird der VERTRAG in beiden Zuständen,
    // nicht nur die Abwesenheit des Attributs: im offenen Zustand muss die
    // referenzierte Id auch wirklich existieren, sonst wäre «weg damit» ein
    // Fix, der die Verbindung ganz zerstört.
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3')
    await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })

    const oeffner = page.locator('[data-v3-ansicht]')
    await expect(oeffner).toHaveAttribute('aria-expanded', 'false')
    await expect(oeffner).not.toHaveAttribute('aria-controls', /./)

    await oeffner.click()
    await expect(page.locator('[data-v3-ansicht-panel]')).toBeVisible()
    await expect(oeffner).toHaveAttribute('aria-expanded', 'true')
    const ziel = await oeffner.getAttribute('aria-controls')
    expect(ziel, 'offen ohne aria-controls — die Verbindung fehlt ganz').toBeTruthy()
    await expect(
      page.locator(`[id="${ziel}"]`),
      `aria-controls zeigt auf «${ziel}» — kein solches Element im DOM`,
    ).toHaveCount(1)

    expect(fehler).toEqual([])
  })

  test('(c) Grundzustand: ohne Flag existiert [data-leser-v3="rahmen"] NICHT (R10)', async ({ page }, info) => {
    // Diese Zusage ist projekt-ABHÄNGIG: im Projekt `leser-v3` setzt der
    // `storageState` das Flag, «ohne Flag» gibt es dort also gar nicht. Sie
    // gehört ins Projekt `chromium` — und wird für die Flag-Seite bereits von
    // `leser-v3-flag.e2e.ts:27` geführt, das beide Projekte ausdrücklich
    // unterscheidet. Ohne diesen Wächter wäre der Test im Flag-Projekt
    // konstruktiv rot (reproduziert 16.8.2026 beim Zuschnitt des Projekts).
    test.skip(info.project.name === 'leser-v3',
      'R10 ist die Aussage ohne Flag — im Flag-Projekt sinnlos, dort deckt sie leser-v3-flag.e2e.ts')
    const fehler = fehlerSammeln(page)
    await page.goto('/gesetze/bund/BGFA')
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    await expect(page.locator('[data-leser-v3="rahmen"]')).toHaveCount(0)

    expect(fehler).toEqual([])
  })
})
