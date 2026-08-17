// @shard-gruppe: 1
// LESER-SCHRIFTSKALA — David-Anmerkung 16.8.2026, Punkt 4:
// «Schriftgrössen-Regler wirkt auf die ganze Seite.»
//
// BEFUND (gemessen 16.8.2026 im Leser der StPO, Vite-Dev, 1440×900): der Regler
// im V3-Optionsmenü bediente den GLOBALEN App-Steller, der `font-size` am
// `<html>` setzt. Drei Klicks «A+» hoben `<html>` von 16 px auf 20.8 px — und
// mit ihm die Kopfzeile (16 px → 20.8 px), weil alle Typo-Tokens rem-basiert
// sind. Der Nutzer wollte den Gesetzestext grösser, bekam die ganze Anwendung.
//
// Diese Spec ist der Abnahmetest der Umkehr: der Regler schreibt jetzt in die
// leser-eigene Stufe (`schrift` im geteilten Store `lm.leser.optionen`,
// leserOptionen.ts), und die einzige CSS-Regel, die sie auswertet, ist auf den
// Normtext der Lesespalte gescopt (`.lc-leser .nt-art-cv`, index.css).
//
// WARUM IM BROWSER: dass NUR der Normtext wächst, ist eine Aussage über
// gerechnete Schriftgrössen im echten Kaskaden-Kontext. Ein Unit-Test kann den
// Store prüfen (`src/tests/leser-schriftskala.test.ts`), aber nie, ob die Regel
// die Kopfzeile mit erwischt. Darum wird hier `getComputedStyle(...).fontSize`
// an einem NORMTEXT-Element UND an Kopfzeile/Seitenleiste vorher/nachher
// gemessen — genau die Grössen, die der Befund auseinanderhält.
//
// ROT ZU BEKOMMEN (§6.7): in `index.css` den Scope der Regel von
// `.lc-leser .nt-art-cv .text-body-l` auf `html` verkürzen (Fall a und b werden
// rot: Kopf und Seitenleiste wachsen mit) oder in `leserSchrift.ts`
// `setzeLeserSchrift` aus `groesser` entfernen (Fall a rot: nichts wächst).
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** Der Normtext selbst — der Fliesstext-Container von Art. 1, nicht die
 *  Überschrift und nicht der Fussnoten-Apparat. */
const normtext = (page: Page) => page.locator('#art-1 .text-body-l').first()
const kopf = (page: Page) => page.locator('[data-v3-kopf]')
const leiste = (page: Page) => page.locator('[data-v3-aside]')
// Ä9 (Ästhetik-Review 16.8.2026) BEISST HIER: «A+» gibt es ZWEIMAL — in der
// App-Leiste (globaler Regler, wirkt absichtlich auf die ganze Seite) und im
// Ansicht-Menü des Lesers (neuer Leser-Regler). Ein `getByRole`-Treffer ohne
// Bezugsraum erwischt @1440 den APP-Regler, und der Test misst dann korrekt
// dessen globale Wirkung — und meldet sie als Fehlschlag des Leser-Reglers.
// Der Selektor ist darum auf das Ansicht-Panel eingeschränkt. Dass zwei gleich
// beschriftete Knöpfe nebeneinander stehen, bleibt der offene Befund Ä9.
// BEIDE Knöpfe müssen gescopt sein, nicht nur «A+». `Schrift verkleinern` gibt
// es ebenfalls zweimal (`components/layout/Topbar.tsx` und
// `v3/LeserAnsichtV3.tsx`); ungescopt bediente der Rückweg dieser Spec den
// APP-Regler, während der Hinweg den Leser-Regler bediente. Der Test hätte dann
// zwei verschiedene Steller gegeneinander gemessen und den Fehlschlag dem
// falschen zugeschrieben. Gefunden 16.8.2026, als der Hinweg zum ersten Mal
// überhaupt bis zum Rückweg durchlief.
const panel = (page: Page) => page.locator('[data-v3-ansicht-panel]')
const groesser = (page: Page) => panel(page).getByRole('button', { name: 'Schrift vergrössern' })
const kleiner = (page: Page) => panel(page).getByRole('button', { name: 'Schrift verkleinern' })

async function schriftgroesse(wahl: ReturnType<typeof normtext>): Promise<number> {
  return wahl.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
}

/** Schriftgrösse des Wurzelelements — der direkte Zeuge des Befunds: genau hier
 *  griff der alte Regler, und genau hier darf sich jetzt nichts mehr rühren. */
async function wurzelGroesse(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
}

async function oeffneStPO(page: Page): Promise<string[]> {
  const fehler = fehlerSammeln(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/gesetze/bund/STPO?leser=v3')
  await expect(page.locator('[data-leser-v3="rahmen"]')).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  // Das Optionsmenü steht im Ist-Stand offen; sollte es zugeklappt starten,
  // wird es über den Ansicht-Knopf aufgezogen. Bewusst defensiv statt fest
  // verdrahtet — die Menü-Mechanik gehört nicht zum Prüfgegenstand.
  // Immer öffnen: der Leser-Regler lebt ausschliesslich im Panel, und die
  // frühere Bedingung «nur öffnen, wenn kein A+ sichtbar ist» griff nie, weil
  // die App-Leiste ihr eigenes A+ zeigt (Ä9).
  if (!(await groesser(page).isVisible().catch(() => false))) {
    await page.locator('[data-v3-ansicht]').click()
  }
  await expect(groesser(page)).toBeVisible({ timeout: 10_000 })
  return fehler
}

test.describe('Leser-Schriftskala — der Regler bewegt NUR den Normtext', () => {
  test('(a) «A+» vergrössert den Normtext; Kopfzeile, Seitenleiste und Wurzel bleiben gleich', async ({ page }) => {
    test.slow() // grosser Erlass (StPO, 480 Art.)
    const fehler = await oeffneStPO(page)

    const vorher = {
      norm: await schriftgroesse(normtext(page)),
      kopf: await schriftgroesse(kopf(page)),
      leiste: await schriftgroesse(leiste(page)),
      wurzel: await wurzelGroesse(page),
    }

    await groesser(page).click()
    // Auf die WIRKUNG warten, nicht auf eine Zeitspanne: erst wenn der Normtext
    // gewachsen ist, sind die anderen Messwerte überhaupt aussagekräftig.
    await expect
      .poll(() => schriftgroesse(normtext(page)), { timeout: 5_000 })
      .toBeGreaterThan(vorher.norm)

    const nachher = {
      norm: await schriftgroesse(normtext(page)),
      kopf: await schriftgroesse(kopf(page)),
      leiste: await schriftgroesse(leiste(page)),
      wurzel: await wurzelGroesse(page),
    }

    // DAS ist der gemeldete Fehler, in Zahlen: vor der Umkehr wuchsen alle vier
    // Werte gemeinsam. Jetzt darf sich exakt einer bewegen.
    expect(nachher.kopf, `Kopfzeile ${vorher.kopf} → ${nachher.kopf} px (Normtext ${vorher.norm} → ${nachher.norm} px)`)
      .toBe(vorher.kopf)
    expect(nachher.leiste, `Seitenleiste ${vorher.leiste} → ${nachher.leiste} px`).toBe(vorher.leiste)
    expect(nachher.wurzel, `<html> ${vorher.wurzel} → ${nachher.wurzel} px — der Regler wirkt wieder global`)
      .toBe(vorher.wurzel)

    expect(fehler).toEqual([])
  })

  test('(b) über alle vier Stufen hinauf und zurück: Kopf und Leiste rühren sich nie', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)

    const start = await schriftgroesse(normtext(page))
    const kopfStart = await schriftgroesse(kopf(page))
    const leisteStart = await schriftgroesse(leiste(page))
    // Die Vorgabestufe IST die heutige Normtext-Grösse (text-body-l = 1.125 rem
    // bei 16-px-Wurzel). Wäre das nicht so, hätte die neue Skala den Ist-Stand
    // verschoben und der Pixelvergleich der V3-Paritätsspecs wäre hinfällig.
    expect(start, 'Vorgabestufe verschiebt die Normtext-Grösse').toBe(18)

    const treppe: number[] = [start]
    // Vier Stufen ⇒ DREI wirksame Klicks. Der Anschlag wird danach an der
    // Bedienbarkeit des Knopfes geprüft, nicht an einem vierten Klick:
    // `kannGroesser` schaltet den Knopf auf `disabled` (LeserAnsichtV3.tsx), und
    // Playwright wartet auf einem deaktivierten Knopf bis zum Test-Timeout,
    // statt folgenlos zu klicken — genau daran starb diese Spec (gemessen
    // 16.8.2026: «element is not enabled», 90 s).
    //
    // KEINE LOCKERUNG, SONDERN DIE SCHÄRFERE PROBE. «Der vierte Klick bleibt
    // folgenlos» wäre auch dann erfüllt, wenn ein Fehler den Klick verschluckt.
    // «Der Knopf ist am Anschlag deaktiviert» ist die Zusage, die der Nutzer
    // tatsächlich sieht, und sie schliesst das Überlaufen des Vokabulars
    // genauso aus.
    for (let i = 0; i < 3; i++) {
      await groesser(page).click()
      await page.waitForTimeout(120)
      treppe.push(await schriftgroesse(normtext(page)))
    }
    expect(treppe, `Treppe ${treppe.join(' → ')} px`).toEqual([18, 20, 22, 24])
    await expect(groesser(page), 'oberer Anschlag ist nicht gesperrt — die Skala kann über ihr Vokabular hinauslaufen')
      .toBeDisabled()

    // Zurück bis zum unteren Anschlag — die Vorgabestufe muss exakt wieder
    // erreicht werden, nicht ein Wert daneben.
    for (let i = 0; i < 3; i++) {
      await kleiner(page).click()
      await page.waitForTimeout(120)
    }
    expect(await schriftgroesse(normtext(page)), 'Rückweg landet nicht auf der Vorgabestufe').toBe(start)
    await expect(kleiner(page), 'unterer Anschlag ist nicht gesperrt').toBeDisabled()

    expect(await schriftgroesse(kopf(page)), 'Kopfzeile hat sich unterwegs verstellt').toBe(kopfStart)
    expect(await schriftgroesse(leiste(page)), 'Seitenleiste hat sich unterwegs verstellt').toBe(leisteStart)

    expect(fehler).toEqual([])
  })

  test('(c) die Stufe überlebt den Reload — und bleibt auch dann auf den Normtext beschränkt', async ({ page }) => {
    test.slow()
    const fehler = await oeffneStPO(page)

    const kopfVorher = await schriftgroesse(kopf(page))
    await groesser(page).click()
    await groesser(page).click()
    await expect.poll(() => schriftgroesse(normtext(page)), { timeout: 5_000 }).toBe(22)

    await page.reload()
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
    // Nach dem Reload trägt der Normtext die gewählte Stufe bereits beim ersten
    // Paint (`wendeLeserOptionenAn` setzt `data-leserschrift` vor dem Render) —
    // und die Kopfzeile steht unverändert da.
    expect(await schriftgroesse(normtext(page)), 'Stufe hat den Reload nicht überlebt').toBe(22)
    expect(await schriftgroesse(kopf(page)), 'Kopfzeile nach Reload verstellt').toBe(kopfVorher)

    expect(fehler).toEqual([])
  })
})
