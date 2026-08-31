// @shard-gruppe: 8
// ─── Ä1 (LESER-V3 H2b) · EINE ORTSANGABE, EINE QUELLE (§7-Wahrheitsproblem) ───
//
// DER ANLASS: der Ästhetik-Review H1 meldete, die Krumen-Leiste nenne im
// Split-View einen ANDEREN Artikel als die Lesespalte («Art. 428» statt
// «Art. 429»). Eine falsche Ortsangabe ist kein Geschmacksbefund, sondern ein
// §7-Fehler — darum verlangt der Fahrplan (Kap. 7, Zeile H2b) hierfür
// ausdrücklich einen eigenen Test statt einer Zusicherung.
//
// ── NACHGEFÜHRT AUF DIE A-2-WAHRHEIT (17.8.2026, Auftrag David) ──────────────
// Bis A-2 verglich diese Spec ZWEI Chrome-Angaben: die App-Krumen-Leiste
// (`[data-ort-artikel]`) und die V3-Kopfzeile (`[data-v3-kopf-artikel]`). Die
// Leisten-Verschmelzung hat die erste beseitigt — der Vergleich hätte damit
// keine zwei Seiten mehr und wäre stumm grün geworden, also genau das, was §6.7
// verbietet.
//
// Die Frage bleibt dieselbe, die Messung wird SCHÄRFER: statt Chrome gegen
// Chrome misst die Spec jetzt Chrome gegen den TEXT.
//   (1) Es gibt nur EINE Quelle: `[data-ort-artikel]` ist nirgends mehr im DOM
//       (weder App-Leiste noch Pane-Titelleiste nennen einen Artikel), und je
//       Lesefläche steht genau EIN `[data-v3-kopf-artikel]`.
//   (2) Die genannte Bestimmung ist WIRKLICH DA: sie gehört zu einem Artikel,
//       der im Augenblick der Messung sichtbar unter dem klebenden Kopf steht.
//       Nennt der Kopf etwas, das der Leser nicht sieht — ein nachlaufender
//       Wert, der Artikel des Nachbar-Panes, eine zweite Quelle —, wird die Spec
//       rot. Das ist mehr, als der alte Mengenvergleich leisten konnte: der war
//       auch dann grün, wenn BEIDE Leisten dasselbe Falsche sagten.
//   (3) Im Split gilt (2) je Pane getrennt, mit verschiedenen Erlassen und
//       verschiedenen Scroll-Strecken — sonst trüge der Fall nicht.
//
// Gemessen wird innerhalb der Seite (ein `evaluate` je Fläche), damit Kopf und
// Artikel im GLEICHEN Augenblick gelesen werden; zwei getrennte Runden hätten
// den Scroll-Spy dazwischen laufen lassen und eine Abweichung erzeugt, die es
// gar nicht gibt.
//
// ROT ZU BEKOMMEN (§6.7, am 17.8.2026 gesehen): in
// `src/pages/gesetz-leser/v3/LeserRahmenV3.tsx` beim `LeserKopf` die Prop
// `aktArtikel={m.aktArtikel}` durch einen festen Wert ersetzen (z. B.
// `aktArtikel={'Art. 1'}`) — dann nennt der Kopf nach dem Scrollen eine
// Bestimmung, die nicht mehr im Bild steht, und (2) fällt in beiden Fällen.
import { test, expect, type Locator } from '@playwright/test'
import { fehlerSammeln } from './helpers/fehlerSammeln'

/**
 * Die Ortsangabe einer Lesefläche und die Bestimmungen, die dort GERADE
 * SICHTBAR sind (unterhalb des klebenden Kopfes, oberhalb der Unterkante).
 *
 * `wurzel` ist die Einzelansicht (`body`) oder ein Pane — dieselbe Funktion für
 * beide, damit der Split keine zweite Messregel bekommt.
 */
async function ort(wurzel: Locator): Promise<{ kopf: string | null; sichtbar: string[] }> {
  return wurzel.evaluate((el) => {
    // Die EINE Nummern-Grammatik dieser Messung — «Art. 429», «§ 12», «Art. 66a».
    const nr = (text: string | null) => {
      const t = (text ?? '').replace(/\s+/g, ' ').trim()
      const m = /((?:Art\.|§)\s*[\w.–-]+)/.exec(t)
      return m ? m[1].replace(/\s+/g, ' ') : null
    }
    const kopfEl = el.querySelector('[data-v3-kopf-artikel]')
    const stick = el.querySelector('[data-v3-kopf]')
    // Lesefenster: von der Unterkante des klebenden Kopfes bis zum unteren Rand
    // der Fläche. Im Pane ist das der Scroller, in der Einzelansicht das Fenster.
    const oben = stick ? stick.getBoundingClientRect().bottom : 0
    const flaeche = el.getBoundingClientRect()
    const unten = Math.min(flaeche.bottom, window.innerHeight)
    const sichtbar: string[] = []
    for (const art of el.querySelectorAll('article[id^="art-"]')) {
      const r = art.getBoundingClientRect()
      if (r.bottom <= oben || r.top >= unten) continue
      const n = nr((art as HTMLElement).innerText)
      if (n) sichtbar.push(n)
    }
    return { kopf: nr(kopfEl ? (kopfEl as HTMLElement).innerText : null), sichtbar }
  })
}

test.describe('Ä1 — die V3-Kopfzeile nennt den Ort, an dem der Leser wirklich steht', () => {
  test('(a) Einzelansicht: EINE Quelle, und sie nennt eine sichtbare Bestimmung', async ({ page }) => {
    test.slow() // grosser Erlass, damit der Spy mehrere Artikelgrenzen sieht
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/gesetze/bund/STPO')
    await expect(page.locator('[data-v3-kopf]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })

    // (1) Keine zweite Quelle: die App-Krumen-Leiste ist mit A-2 weg, ihr
    // Ortsangabe-Anker damit auch. Wäre er wieder da, stünde der Artikel an zwei
    // Stellen und der alte §7-Befund könnte zurückkommen.
    await expect(page.locator('[data-ort-artikel]')).toHaveCount(0)

    // Weit scrollen, damit überhaupt ein Artikel «dran» ist, und die Entprellung
    // (150 ms) auslaufen lassen — sonst misst der Test das Nachlaufen und nicht
    // die Übereinstimmung.
    await page.evaluate(() => window.scrollBy(0, 3000))
    await page.waitForTimeout(1200)

    await expect(page.locator('[data-v3-kopf-artikel]')).toHaveCount(1)
    await expect.poll(async () => {
      const m = await ort(page.locator('body'))
      return m.kopf != null && m.sichtbar.includes(m.kopf)
    }, { timeout: 20_000 }).toBe(true)

    const m = await ort(page.locator('body'))
    expect(m.sichtbar.length, 'keine sichtbare Bestimmung gefunden — die Messung prüfte nichts')
      .toBeGreaterThan(0)
    expect(m.sichtbar, `Kopf nennt «${m.kopf}», sichtbar sind ${m.sichtbar.join(', ')}`).toContain(m.kopf)
    await expect(page.locator('[data-ort-artikel]')).toHaveCount(0)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })

  test('(b) Split-View: jeder Kopf nennt eine sichtbare Bestimmung SEINES Erlasses', async ({ page }) => {
    test.slow()
    const fehler = fehlerSammeln(page)
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/gesetze/bund/STPO?leser=v3&p=/gesetze/bund/BGFA%3Fleser%3Dv3')
    await expect(page.locator('[data-pane="sekundaer"]')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[data-pane="primaer"] #art-1')).toBeAttached({ timeout: 20_000 })

    // BEIDE Panes um VERSCHIEDENE Strecken scrollen. Zwei Gründe, beide gemessen
    // (17.8.2026): (1) ein Pane, das nie gescrollt wurde, meldet gar keinen
    // Artikel — der Scroll-Spy hat dann nichts entschieden, und die Zusage «beide
    // Köpfe nennen ihren Artikel» wäre unprüfbar. (2) Verschiedene Strecken
    // erzeugen VERSCHIEDENE Nummern (gemessen «Art. 8» in StPO, «Art. 2» in
    // BGFA) — erst dadurch fällt der Test auf, wenn ein Kopf den Artikel des
    // Nachbar-Panes nennt.
    await page.locator('[data-pane="primaer"]').evaluate((el) => { el.scrollTop = 3000 })
    await page.locator('[data-pane="sekundaer"]').evaluate((el) => { el.scrollTop = 1500 })
    await page.waitForTimeout(2000)

    await expect(page.locator('[data-v3-kopf-artikel]')).toHaveCount(2)
    await expect(page.locator('[data-ort-artikel]')).toHaveCount(0)

    const nummern: string[] = []
    for (const wahl of ['[data-pane="primaer"]', '[data-pane="sekundaer"]']) {
      await expect.poll(async () => {
        const m = await ort(page.locator(wahl))
        return m.kopf != null && m.sichtbar.includes(m.kopf)
      }, { timeout: 20_000 }).toBe(true)
      const m = await ort(page.locator(wahl))
      expect(m.sichtbar.length, `${wahl}: keine sichtbare Bestimmung — Fall trägt nicht`).toBeGreaterThan(0)
      expect(m.sichtbar, `${wahl}: Kopf nennt «${m.kopf}», sichtbar sind ${m.sichtbar.join(', ')}`)
        .toContain(m.kopf)
      nummern.push(m.kopf!)
    }
    // Die Nummern müssen sich unterscheiden — sonst wäre der Fall blind gegen
    // «Kopf nennt den Artikel des Nachbarn» (§6.7: der Fall muss tragen).
    expect(new Set(nummern).size, `beide Panes nennen dieselbe Nummer ${nummern.join(' | ')} — Fall trägt nicht`)
      .toBe(2)

    expect(fehler, `Konsolen-/Seitenfehler: ${fehler.join(' | ')}`).toEqual([])
  })
})
