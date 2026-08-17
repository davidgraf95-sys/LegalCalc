// @shard-gruppe: 8
// ─── Ä1 (LESER-V3 H2b) · EINE ORTSANGABE, EINE QUELLE (§7-Wahrheitsproblem) ───
//
// DER ANLASS: der Ästhetik-Review H1 meldete, die Krumen-Leiste nenne im
// Split-View einen ANDEREN Artikel als die Lesespalte («Art. 428» statt
// «Art. 429»). Eine falsche Ortsangabe ist kein Geschmacksbefund, sondern ein
// §7-Fehler — darum verlangt der Fahrplan (Kap. 7, Zeile H2b) hierfür
// ausdrücklich einen eigenen Test statt einer Zusicherung.
//
// WAS DIE NACHMESSUNG ERGAB (17.8.2026, Split @1440, StPO neben VMWG): der
// Befund ist am gebauten Stand NICHT reproduzierbar. Beide Angaben stammen
// bereits aus derselben Quelle — `aktArtikel` des Scroll-Spys
// (`inhalt-hooks.tsx`); die V3-Kopfzeile liest sie als Prop, die Pane-Titelleiste
// bekommt sie über `meldeInhaltsKopf` (`leserV3Modell.ts`). Gemessen zeigten
// beide «Art. 7». Der Review hat vermutlich den 150-ms-Entprellungsfenster
// gesehen, in dem die Leiste dem Text um einen Artikel nachläuft.
//
// WARUM DIE SPEC TROTZDEM ENTSTEHT: «es gibt nur eine Quelle» ist heute wahr und
// morgen eine Behauptung. Ein zweiter Schreiber wäre billig hinzugefügt (H3 hängt
// ein Panel in dieselbe Schicht) und würde erst am Nutzer auffallen. Die Spec
// misst die ÜBEREINSTIMMUNG, nicht die Existenz einer Variablen — sie überlebt
// damit jede Umbenennung und fällt genau dann, wenn die Aussagen auseinandergehen.
//
// ROT ZU BEKOMMEN (§6.7, gesehen): in `src/pages/gesetz-leser/v3/leserV3Modell.ts`
// im `meldeInhaltsKopf`-Effekt `artikel: aktArtikel ? …` durch einen zweiten,
// eigenen Wert ersetzen (z. B. `artikel: 'Art. 1 ' + erlass.kuerzel`) — dann
// melden Leiste und Kopfzeile verschiedene Artikel und beide Fälle werden rot.
import { test, expect, type Page } from '@playwright/test'

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`) })
  return fehler
}

/** «Art. 429» aus einem Etikett herausziehen — die beiden Orte setzen dieselbe
 *  Nummer in verschiedene Zuschnitte (Leiste mit Kürzel, Kopfzeile ohne). */
function nummer(text: string | null): string | null {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  const m = /((?:Art\.|§)\s*[\w.–-]+)/.exec(t)
  return m ? m[1].replace(/\s+/g, ' ') : null
}

/**
 * Alle Ortsangaben des CHROMES bzw. der V3-Kopfzeilen — als Menge.
 *
 * Zwei Anker, zwei Herkünfte: `[data-ort-artikel]` sitzt in der App-Krumen-Leiste
 * (`InhaltsKopf.tsx`) und in der Pane-Titelleiste (`PaneKopf.tsx`),
 * `[data-v3-kopf-artikel]` in der V3-Kopfzeile. Die Marke im Chrome wurde für
 * diese Spec gesetzt, weil die Angabe vorher nur an einer Utility-Klasse (`.num`)
 * hing — und `.num` traf im ersten Lauf dieser Spec die SR-Nummer der
 * Übersichtsbox statt der Ortsangabe. Ein Test, der am Aussehen sucht, prüft
 * irgendwas (dieselbe Lehre wie der `data-fn-ref`-Fix in H2).
 *
 * MENGEN und keine Paare: im Split hängt die Titelleiste eines Panes als
 * GESCHWISTER neben dessen Scroller, eine Zuordnung müsste die DOM-Reihenfolge
 * annehmen. Die Mengen sind trotzdem scharf — die beiden Panes zeigen
 * verschiedene Erlasse und damit verschiedene Nummern; nennt eine Leiste den
 * Artikel des Nachbar-Panes oder einen veralteten, gehen die Mengen auseinander.
 */
async function ortsangaben(page: Page): Promise<{ chrome: string[]; kopf: string[] }> {
  const lies = async (wahl: string) => {
    const texte = await page.locator(`${wahl}:visible`).allInnerTexts()
    return texte.map(nummer).filter((n): n is string => n != null).sort()
  }
  return { chrome: await lies('[data-ort-artikel]'), kopf: await lies('[data-v3-kopf-artikel]') };
}

test.describe('Ä1 — Krumen-Leiste und V3-Kopfzeile nennen denselben Artikel', () => {
  test('(a) Einzelansicht: die App-Leiste folgt der Lesespalte, nicht einer zweiten Quelle', async ({ page }) => {
    test.slow() // grosser Erlass, damit der Spy mehrere Artikelgrenzen sieht
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    // Weit scrollen, damit überhaupt ein Artikel «dran» ist, und die Entprellung
    // (150 ms) auslaufen lassen — sonst misst der Test das Nachlaufen und nicht
    // die Übereinstimmung.
    await page.evaluate(() => window.scrollBy(0, 3000))
    await page.waitForTimeout(1200)

    await expect.poll(async () => {
      const { chrome, kopf } = await ortsangaben(page)
      return kopf.length === 1 && chrome.join() === kopf.join()
    }, { timeout: 20_000 }).toBe(true)

    const { chrome, kopf } = await ortsangaben(page)
    expect(chrome.join(' '), `App-Leiste «${chrome.join(' ')}» gegen V3-Kopf «${kopf.join(' ')}»`)
      .toBe(kopf.join(' '))

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Split-View: jedes Pane nennt SEINEN Artikel — und zwar denselben zweimal', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-pane="primaer"] #art-1')).toBeAttached({ timeout: 20_000 })

    // BEIDE Panes um VERSCHIEDENE Strecken scrollen. Zwei Gründe, beide gemessen
    // (17.8.2026): (1) ein Pane, das nie gescrollt wurde, meldet gar keinen
    // Artikel — der Scroll-Spy hat dann nichts entschieden, und die Zusage «beide
    // Leisten nennen ihren Artikel» wäre unprüfbar. (2) Verschiedene Strecken
    // erzeugen VERSCHIEDENE Nummern (gemessen «Art. 7 StPO» und «Art. 2 BGFA») —
    // erst dadurch fällt der Test auf, wenn eine Leiste den Artikel des
    // Nachbar-Panes nennt. Bei gleichen Nummern wäre die Mengengleichheit blind.
    await page.locator('[data-pane="primaer"]').evaluate((el) => { el.scrollTop = 3000 })
    await page.locator('[data-pane="sekundaer"]').evaluate((el) => { el.scrollTop = 1500 })
    await page.waitForTimeout(2000)

    await expect.poll(async () => {
      const { chrome, kopf } = await ortsangaben(page)
      return kopf.length === 2 && chrome.join() === kopf.join()
    }, { timeout: 20_000 }).toBe(true)

    const { chrome, kopf } = await ortsangaben(page)
    expect(kopf.length, `im Split müssen ZWEI V3-Kopfzeilen einen Artikel nennen: ${kopf.join(' | ')}`).toBe(2)
    // Die Nummern müssen sich unterscheiden — sonst wäre die Mengengleichheit
    // darunter kein Beweis, sondern ein Zufall (§6.7: der Fall muss tragen).
    expect(new Set(kopf).size, `beide Panes nennen dieselbe Nummer ${kopf.join(' | ')} — Fall trägt nicht`).toBe(2)
    expect(chrome.join(' '),
      `Pane-Titelleisten «${chrome.join(' | ')}» gegen V3-Köpfe «${kopf.join(' | ')}» — Ä1-Wahrheitsproblem`)
      .toBe(kopf.join(' '))

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
