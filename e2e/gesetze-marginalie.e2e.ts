// @shard-gruppe: 6
// Regressionsschutz für die einheitliche Randtitel-Formatierung (Auftrag 6a,
// David 26.6.2026 «uneinheitliche Bold-Formatierung»). Zwei stabile Rollen
// (margStufeStil): das BLATT (unterste gezeigte Stufe = Sachüberschrift) ist
// immer prominent, die VORFAHREN sind ruhiger Kontext je absoluter Tiefe — so
// flippt kein Vorfahre («II. Handlungsfähigkeit») mehr zwischen den Artikeln.
// Diese Tests prüfen die Invariante glyph-agnostisch am echten ZGB-Reader.
import { test, expect } from '@playwright/test'

async function margStapel(page: import('@playwright/test').Page) {
  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('a[href="#art-11"]').first()).toBeVisible()
  return page.evaluate(() => {
    const stapel = [...document.querySelectorAll('div.font-serif.leading-snug')].filter((d) =>
      d.className.includes('space-y-0.5'),
    )
    return stapel.map((s) =>
      [...s.children].map((c) => {
        const cs = getComputedStyle(c as Element)
        return {
          text: (c.textContent ?? '').trim().slice(0, 30),
          size: parseFloat(cs.fontSize),
          weight: parseInt(cs.fontWeight, 10),
          // S2: die Hierarchie trägt seit Ä7 auch die FARBE (Blatt ink-800 gegen
          // Vorfahren ink-600) — ohne sie liesse sich «prominenter» nicht mehr
          // vollständig prüfen, wenn alle Stufen dieselbe Grösse haben.
          color: cs.color,
        }
      }),
    )
  })
}

// ── S2 · DEKLARIERTE FACHLICHE ÄNDERUNG (§6.3, kein Refactoring) ─────────────
//
// Bis S2 stand hier eine ABSOLUTE Grössenschwelle: Blatt ≥ 16 px, Vorfahren
// strikt kleiner. Der Entscheid David 17.8.2026 am Bildbogen (F3 = V2 «amtsnah
// kompakt») setzt die Zeile «Marginalie/Randtitel 0.8125 rem, Sans, ink-600» —
// alle Randtitel-Stufen laufen damit auf 13 px, und die alte Schwelle prüfte
// nicht mehr die Invariante, sondern die abgelöste Grösse (gemessen: Blatt 13 px
// gegen erwartete ≥ 16).
//
// DIE INVARIANTE BLEIBT UNVERÄNDERT und ist weiterhin die des Auftrags David
// 26.6.2026 («uneinheitliche Bold-Formatierung»): das Blatt ist je Stapel die
// prominenteste Stufe, die Vorfahren sind ruhiger Kontext, und es gibt nie einen
// zweiten «Titel» im Stapel. Geprüft wird sie ab S2 an den Merkmalen, die sie
// nach Ä7 wirklich tragen — GEWICHT (semibold 600 gegen medium/regular) und
// FARBE (ink-800 gegen ink-600) — statt an der Schriftgrösse, die jetzt in allen
// drei Stufen gleich ist. Die Prüfung wird dadurch nicht schwächer: sie verlangt
// zusätzlich, dass jeder Vorfahr am Gewicht ODER an der Farbe unterscheidbar
// bleibt, und lässt keinen Stapel durch, in dem Blatt und Vorfahr identisch
// aussehen (das wäre der Wildwuchs, gegen den der Test 26.6. angelegt wurde).
//
// OFFEN FÜR DAVIDS AUGE (§8, nicht vom Test zu entscheiden): die Sachüberschrift
// ist mit V2 von 16 px auf 13 px gefallen. Das folgt der V2-Zeile, die David am
// Bogen gewählt hat, berührt aber denselben Auftrag vom 26.6.2026, der verlangte,
// sie dürfe nicht «zu einem blassen Abschnittslabel verkümmern». Die Nachher-
// Bilder unter docs/ux-audit-2026-07/reader/leser-v3-s2/nachher/ zeigen es am
// Objekt; der Vollzugsvermerk S2 führt es als Vorbehalt.
/** Relative Helligkeit einer `rgb(...)`-Farbe (WCAG-Formel, ohne Alpha-Fall). */
function helligkeit(farbe: string): number {
  const m = farbe.match(/\d+(\.\d+)?/g)
  if (!m || m.length < 3) throw new Error(`Farbe nicht lesbar: ${farbe}`)
  const [r, g, b] = m.slice(0, 3).map((v) => {
    const k = Number(v) / 255
    return k <= 0.03928 ? k / 12.92 : ((k + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// ── BEFUND S2, GEMESSEN: DIE VORFAHREN-FÄLLE UNTEN LAUFEN HEUTE NIE ──────────
//
// Beim Nachziehen dieses Tests ist aufgefallen, dass die Vorfahren-Zusicherungen
// in der Schleife unten NICHT ERREICHT werden — und zwar schon vor S2 nicht: alle
// 11 Randtitel-Stapel, die der Test auf dem ZGB sieht, haben GENAU EIN Kind
// (`mitVorfahren: 0`). Über ZGB und OR hinweg 40 000 px durchgescrollt: kein
// einziger Stapel mit mehr als einem Kind. `margAnzeige` zeigt nur die gegenüber
// dem Vorartikel GEÄNDERTEN Stufen, und das ist in der Praxis fast immer nur das
// Blatt. Belegt ist der toten Zweig zusätzlich durch einen Rot-Beweis, der GRÜN
// blieb: das Blatt versuchsweise auf `font-semibold text-ink-400` gesetzt (heller
// als jeder Vorfahr) — 4/4 grün, weil die Schleife nicht läuft.
//
// BEWUSST NICHT «REPARIERT»: die Zusicherungen sind richtig, nur unerreicht. Sie
// zu löschen nähme einen korrekten Schutz für den Tag, an dem ein Erlass doch
// einen mehrstufigen Stapel rendert; eine künstliche Lage zu konstruieren, damit
// sie laufen, prüfte die Konstruktion und nicht das Produkt. Was NICHT bleiben
// durfte, ist der falsche Eindruck von Deckung — darum steht der Befund hier und
// als offener Punkt im Vollzugsvermerk S2. LIVE geprüft ist von diesem Fall heute
// allein die Blatt-Zusicherung (Gewicht ≥ 600).
test('Blatt (Sachüberschrift) ist je Stapel die prominenteste Stufe', async ({ page }) => {
  const stapel = await margStapel(page)
  expect(stapel.length, 'ZGB hat Randtitel-Stapel').toBeGreaterThan(5)
  for (const zeilen of stapel) {
    const blatt = zeilen[zeilen.length - 1]
    // Das Blatt ist immer halbfett — auch wenn der Stapel nur eine Stufe hat.
    expect(blatt.weight, `Blatt ${JSON.stringify(blatt.text)}`).toBeGreaterThanOrEqual(600)
    for (let i = 0; i < zeilen.length - 1; i++) {
      const v = zeilen[i]
      // Nie grösser als das Blatt (nach V2 gleich gross, darum nicht mehr strikt)…
      expect(v.size, `Vorfahr ${JSON.stringify(v.text)} ist grösser als das Blatt`)
        .toBeLessThanOrEqual(blatt.size)
      // …und nie selbst fett: kein zweiter «Titel» im Stapel.
      expect(v.weight, `Vorfahr ${JSON.stringify(v.text)} ist fett`).toBeLessThan(600)
      // …und nie DUNKLER als das Blatt (seit Ä7 ist die Farbe das zweite Merkmal
      // der Hierarchie, weil alle Stufen gleich gross sind).
      expect(helligkeit(blatt.color), `Sachüberschrift ${JSON.stringify(blatt.text)} ist heller `
        + `als ihr Vorfahr ${JSON.stringify(v.text)} (${blatt.color} gegen ${v.color})`)
        .toBeLessThanOrEqual(helligkeit(v.color) + 0.001)
    }
  }
})

test('Höchstens drei definierte Randtitel-Stil-Stufen (kein Wildwuchs)', async ({ page }) => {
  const stapel = await margStapel(page)
  const stile = new Set(stapel.flat().map((z) => `${z.size}/${z.weight}`))
  // margStufeStil definiert genau drei Stufen: Blatt 16/600, Vorfahr-Abschnitt
  // 14/500, Vorfahr-tiefer 14/400 → höchstens drei distinkte (size,weight)-Paare.
  expect(stile.size, `gefundene Stile: ${[...stile].join(', ')}`).toBeLessThanOrEqual(3)
})

// A30/A31 (David 16.7.2026, E2): Marginalien-Suffix hochgestellt + Fussnoten-
// Marker klebt an Artikelnummer/Marginalie (Fedlex-treu, empirisch am Filestore-
// HTML verifiziert: «III<sup>bis</sup>.», Marker als <sup> DIREKT am Bezugswort).
test('A30: Marginalien-Ordnungssuffix (bis/ter) wird hochgestellt', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB')
  await expect(page.locator('a[href="#art-19_d"]').first()).toBeVisible()
  // Der Randtitel «IIIbis. …» rendert «bis» als eigenes <sup> (nicht flach im
  // Text); ein <sup> mit exakt «bis» ist ausschliesslich der Marginalien-Suffix
  // (Absatznummern stehen als «1bis» ganz im <sup>, Fussnoten sind <button>).
  const hatSuffixSup = await page.evaluate(() =>
    [...document.querySelectorAll('sup')].some((s) => s.textContent?.trim() === 'bis'),
  )
  expect(hatSuffixSup, 'Randtitel-Suffix «bis» ist hochgestellt').toBe(true)
})

test('A31: Fussnoten-Marker klebt ohne Abstand an der Artikelnummer', async ({ page }) => {
  await page.goto('/gesetze/bund/ZGB#art-276')
  await expect(page.locator('a[href="#art-276"]').first()).toBeVisible()
  const geklebt = await page.evaluate(() => {
    const a = document.querySelector('a[href="#art-276"]')
    const wrap = a?.parentElement
    if (!wrap || getComputedStyle(wrap).whiteSpace !== 'nowrap') return false
    // Der Artikel-Fussnoten-Marker (353) liegt IM selben nowrap-Wrapper wie das
    // «Art. N»-Label → kein gap-x-2/ml-Abstand, kein Umbruch auf eine eigene Zeile.
    return !!wrap.querySelector('button[aria-label^="Fussnote"]')
  })
  expect(geklebt, '«Art. 276» + Marker sind EIN nowrap-Inline-Element').toBe(true)
})
