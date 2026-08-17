// @shard-gruppe: 2
// ═══ H2b-NACHZUG · DAS BLATT UND DAS KÜRZEL (A2 · A3 · Ä32 · B11) ═══════════
//
// Diese Spec deckt die Befunde, die nur im echten Browser sichtbar sind, weil sie
// an FOKUS und OVERLAY hängen — genau das, was ein Screenshot nicht zeigt.
//
//  A2  Bei offenem Treffer-Blatt @390 fokussierte Ctrl+K das VERDECKTE Kopf-Feld
//      (`sheet.contains(activeElement) === false`), Tippen landete unsichtbar
//      («KostenX» im Feld hinter dem Overlay), und Esc leerte das Feld statt das
//      Blatt zu schliessen (`blattOffen: true`, `feldWert: ''`). Zugleich war im
//      Blatt gar kein Feld erreichbar (`felderImBlatt: 0`) — vor H2b lag eines
//      darin. Gemessen 17.8.2026, StPO, Suche «Kosten».
//  A3  Im Split @1600 registriert jedes Pane seit Ä19 einen ⌘K-Listener am
//      Fenster; der zuletzt registrierte gewann. Gemessen: Fokus im primären
//      Pane, Ctrl+K ⇒ Fokus im SEKUNDÄREN (`imPrimaer:false, imSekundaer:true`),
//      und ebenso in der anderen Richtung. Das Kürzel bediente nie das Pane, in
//      dem der Leser arbeitet.
//  Ä32 Im TREFFER-Blatt standen «Sie sind hier — Noch keine Leseposition
//      erfasst.» und die Erlass-Übersichtszeile, und die Knopfgruppe «⌄ alles auf
//      ↑ Anfang» hing etikettlos rechts.
//  B11 Der ✕ des Blatts hiess immer «Gliederung schliessen» — auch wenn über ihm
//      «Treffer» stand.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Suche starten und das Treffer-Blatt öffnen (@390, Feld im klebenden Kopf). */
async function trefferBlattOeffnen(page: Page, begriff: string): Promise<void> {
  await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
  await page.locator('[data-v3-such-zone] input').fill(begriff)
  await expect(page.locator('[data-v3-treffer-weg]')).toBeVisible({ timeout: 15_000 })
  await page.locator('[data-v3-treffer-weg]').click()
  await expect(page.locator('[data-gliederung-sheet]')).toBeVisible({ timeout: 15_000 })
}

test.describe('A2 — bei offenem Blatt bleibt die Bedienung im Blatt', () => {
  // ROT ZU BEKOMMEN (§6.7): in `v3/LeserRahmenV3.tsx` `sprungFeld={suchFeld}` am
  // `GliederungSheet` entfernen ⇒ (a) `imDialog` false, `felderImBlatt` 0;
  // `escLeert={!blattOffen}` auf `escLeert` (also true) ⇒ (b) Blatt bleibt offen
  // und das Feld ist geleert. Beide Fälle so gemessen (Ist-Stand vor dem Nachzug).
  test('(a) ⌘K fokussiert das Feld IM Blatt, und Tippen ist sichtbar', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await trefferBlattOeffnen(page, 'Kosten')

    await page.keyboard.press('Control+k')

    const lage = await page.evaluate(() => {
      const sheet = document.querySelector('[data-gliederung-sheet]')
      const ae = document.activeElement as HTMLElement | null
      const r = ae?.getBoundingClientRect()
      return {
        tag: ae?.tagName ?? null,
        imDialog: sheet ? sheet.contains(ae) : false,
        felderImBlatt: sheet ? sheet.querySelectorAll('input').length : 0,
        // «Sichtbar» heisst hier: das fokussierte Feld liegt im Viewport und ist
        // nicht durch das Overlay verdeckt — genau der Punkt des Befunds.
        obenLiegend: r
          ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === ae
          : false,
      }
    })
    expect(lage.tag, 'Ctrl+K hat kein Eingabefeld fokussiert').toBe('INPUT')
    expect(lage.imDialog, 'der Fokus hat den Dialog verlassen (WCAG 2.4.3)').toBe(true)
    expect(lage.felderImBlatt, 'im Blatt steht kein Suchfeld (Bug-Check 6)').toBe(1)
    expect(lage.obenLiegend, 'das fokussierte Feld ist verdeckt — Tippen wäre unsichtbar').toBe(true)

    // Und die Suche ist im Blatt wirklich VERFEINERBAR: das getippte Zeichen
    // landet im Feld, das obenauf liegt, und die Trefferzahl reagiert.
    await page.keyboard.type('X')
    await expect(page.locator('[data-gliederung-sheet] [data-v3-suchsprung] input'))
      .toHaveValue('KostenX')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Esc schliesst das Blatt und behält den Suchbegriff', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await trefferBlattOeffnen(page, 'Kosten')
    await page.keyboard.press('Control+k')
    await expect(page.locator('[data-gliederung-sheet] [data-v3-suchsprung] input')).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.locator('[data-gliederung-sheet]'),
      'Esc hat das Blatt nicht geschlossen (es leerte das Feld)').toHaveCount(0, { timeout: 10_000 })
    // Der Begriff steht weiterhin — Esc im Dialog schliesst, es löscht nicht.
    await expect(page.locator('[data-v3-such-zone] input')).toHaveValue('Kosten')

    // Ausserhalb eines Blatts leert Esc weiterhin das Feld (Pos. 14 unverändert).
    await page.locator('[data-v3-such-zone] input').focus()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-v3-such-zone] input')).toHaveValue('')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})

test.describe('A3 — ⌘K bedient das Pane, in dem der Fokus steht', () => {
  // ROT ZU BEKOMMEN (§6.7): in `v3/suchKuerzel.ts` die Zeile
  // `if (!tastendruckGehoertMir(imSekundaerenPane)) return;` entfernen ⇒ beide
  // Richtungen landen im sekundären Pane (so gemessen 17.8.2026).
  test('(c) im Split trifft das Kürzel nie das fremde Pane', async ({ page }) => {
    test.slow() // zwei volle Leser-Instanzen
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/BGFA?leser=v3&p=/gesetze/bund/BGBM%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"] [data-v3-kopf]')).toBeVisible({ timeout: 25_000 })
    // Positiv-Sonde: es gibt wirklich zwei Felder — sonst prüfte die Zuordnung
    // unten eine Menge mit einem Element und wäre grundlos grün (§6.7 b).
    await expect(page.locator('[data-v3-suchsprung] input')).toHaveCount(2, { timeout: 20_000 })

    for (const start of ['primaer', 'sekundaer'] as const) {
      await page.locator(`[data-pane="${start}"] [data-v3-suchsprung] input`).focus()
      await expect(page.locator(`[data-pane="${start}"] [data-v3-suchsprung] input`)).toBeFocused()
      // Fokus vom Feld nehmen, ohne das Pane zu verlassen: der Kopf des Panes
      // trägt einen echten Knopf. So ist der Fall der ECHTE — «⌘K aus dem Pane,
      // aber nicht aus dem Feld».
      // Ä46 (H4-II, 17./18.8.2026): das war bis dahin `[data-v3-kopf-schliessen]`;
      // im Pane gibt es dieses ✕ nicht mehr (zweites Kreuz je Pane, Duplikat des
      // Rücksprungs). Der «Ansicht»-Öffner steht dort unverändert und ist
      // ebenso ein echter, fokussierbarer Knopf im Kopf DIESES Panes — die
      // Aussage des Tests (⌘K trifft das Pane, in dem der Fokus steht) ist
      // unberührt (§6.3).
      await page.locator(`[data-pane="${start}"] [data-v3-ansicht]`).focus()

      await page.keyboard.press('Control+k')

      const wo = await page.evaluate(() => {
        const ae = document.activeElement
        return {
          primaer: document.querySelector('[data-pane="primaer"]')?.contains(ae) ?? false,
          sekundaer: document.querySelector('[data-pane="sekundaer"]')?.contains(ae) ?? false,
        }
      })
      expect(wo[start], `Fokus stand im Pane «${start}», ⌘K landete woanders`).toBe(true)
      const anderes = start === 'primaer' ? 'sekundaer' : 'primaer'
      expect(wo[anderes], `⌘K hat den Fokus ins fremde Pane «${anderes}» gezogen`).toBe(false)
    }

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})

test.describe('Ä32/B11 — das Blatt zeigt und benennt, was es zeigt', () => {
  // ROT ZU BEKOMMEN (§6.7): `ortAnzeigen={!m.sucheAktiv}` im Rahmen auf
  // `ortAnzeigen` (true) setzen ⇒ «Sie sind hier» erscheint im Treffer-Blatt;
  // die `uebersicht`-Weiche zurücknehmen ⇒ Übersichtszeile erscheint;
  // `aria-label={`${titel} schliessen`}` in `parts/GliederungSheet.tsx` wieder
  // fest auf «Gliederung schliessen» ⇒ (d) rot. Alle drei so gemessen.
  test('(d) im TREFFER-Blatt: kein «Sie sind hier», keine Übersicht, richtiger Name', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await trefferBlattOeffnen(page, 'Kosten')

    const blatt = page.locator('[data-gliederung-sheet]')
    // Positiv-Sonde: es ist wirklich das TREFFER-Blatt und es trägt Treffer.
    await expect(blatt.locator('[data-treffer-liste]')).toBeVisible({ timeout: 15_000 })
    expect(await blatt.locator('[data-sie-sind-hier]').count(),
      '«Sie sind hier» steht im Treffer-Blatt').toBe(0)
    expect(await blatt.locator('[data-v3-uebersicht]').count(),
      'die Erlass-Übersicht steht im Treffer-Blatt').toBe(0)
    expect(await blatt.locator('[data-v3-alle]').count(),
      '«alles auf/zu» steht über der Trefferliste, klappt aber einen Baum').toBe(0)
    // «↑ Anfang» bleibt — es bezieht sich auf den Erlass, nicht auf den Baum.
    await expect(blatt.locator('[data-v3-anfang]')).toHaveCount(1)

    // B11: Dialog UND ✕ heissen «Treffer».
    await expect(blatt).toHaveAttribute('aria-label', 'Treffer')
    expect(await blatt.locator('button[aria-label="Treffer schliessen"]').count(),
      'der ✕ heisst nicht «Treffer schliessen»').toBe(1)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(e) im GLIEDERUNGS-Blatt bleibt alles, was dort hingehört', async ({ page }) => {
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await page.locator('[data-v3-gliederung-auf]').first().click()
    const blatt = page.locator('[data-gliederung-sheet]')
    await expect(blatt).toBeVisible({ timeout: 15_000 })

    await expect(blatt).toHaveAttribute('aria-label', 'Gliederung')
    expect(await blatt.locator('button[aria-label="Gliederung schliessen"]').count()).toBe(1)
    await expect(blatt.locator('[data-sie-sind-hier]'),
      'ohne Suche gehört die Ortsangabe ins Blatt').toHaveCount(1)
    await expect(blatt.locator('[data-v3-alle]'),
      'ohne Suche gehört «alles auf» ins Blatt').toHaveCount(1)
    // Ä18: das Feld ist das oberste Element unter der Titelleiste — dieselbe
    // Regel wie in Spalte und Kopf-Block.
    const reihenfolge = await blatt.evaluate((el) => {
      const feld = el.querySelector('[data-v3-blatt-feld]')
      const ort = el.querySelector('[data-sie-sind-hier]')
      if (!feld || !ort) return null
      return feld.compareDocumentPosition(ort) & Node.DOCUMENT_POSITION_FOLLOWING ? 'feld-zuerst' : 'ort-zuerst'
    })
    expect(reihenfolge, 'das Feld steht nicht zuoberst (Ä18)').toBe('feld-zuerst')

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
