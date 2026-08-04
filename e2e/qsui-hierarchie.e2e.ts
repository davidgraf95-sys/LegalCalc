// ─── QS-UI 8b · Tor «Verdikt zuerst» ────────────────────────────────────────
//
// Der Informationshierarchie-Pass (FAHRPLAN-UI-QUALITAET.md §2) hat die Ordnung
// im Ergebnisblock geradegezogen. Ohne Tor wäre das ein Einmal-Zustand: die
// Ordnung von R4/R6 lebt in 14 Formularen, und jede neue Visualisierung, jede
// neue Prosa-Zeile kann sie still wieder kippen. Genau so war sie gekippt —
// `ErbteilungForm` schob Tabelle und Quoten-Balken zwischen Eckdaten und
// Verdikt, und niemand merkte es, weil nichts es mass.
//
// Gemessen werden fünf Invarianten, alle aus geltenden Regeln, keine neuen:
//
//  I1  R4 Ziff. 2 / B1 — das Verdikt steht VOR der Herleitung: vor den
//      Aufklappern «Rechenweg»/«Annahmen» und vor jeder abgeleiteten Ansicht
//      (Tabelle, Kalender, Timeline, Balken) desselben Blocks. Ansichten
//      tragen dafür `data-ansicht`; `table, svg` bleibt Auffangnetz.
//  I2  R6 Ziff. 2 — «Warnungen sind nie weiter vom Verdikt entfernt als eine
//      Bildschirmhöhe.» Diese Regel stand seit 11.6.2026 im Reglement und war
//      bis QS-UI 8b ungegatet. Zwei Schranken (Reglement + gemessene
//      Regression) plus Skip-Ausweis — Begründung bei den Konstanten unten.
//  I3  B2 — Fliesstext im Ergebnisblock hält die Lesespalte (`max-w-reading`,
//      40rem). Ausgenommen sind ausdrücklich Kacheln und Tabellen (D-1.5:
//      «NUR Prosa-<p>; Kacheln/lc-tile/Tabellen bleiben unbegrenzt»).
//  I4  Die Sprungmarke zum Ergebnis ist **erreichbar** — sichtbar, im Bild und
//      am Klickpunkt nicht verdeckt —, solange das Ergebnis nicht im Bild
//      steht, auf JEDER Breite. Sie trug bis QS-UI 8b `sm:hidden`, war also
//      auf Desktop tot, obwohl dort kein Verdikt im ersten Viewport steht
//      (gemessen 1.32–3.15 Bildschirmhöhen).
//      Warum nicht bloss `display !== 'none'`: Die Marke ist `position: fixed`
//      und lebt im `ErgebnisBlock`, der während seiner `lc-reveal`-Einblendung
//      (220 ms) ein `transform` trägt — ein transformierter Vorfahr wird zum
//      enthaltenden Block für `fixed`. Ein Tor, das nur die Sichtbarkeit
//      prüft, würde eine Marke durchwinken, die irgendwo im Dokument klebt
//      statt in der Bildschirmecke (§6.7: ein Tor, das nicht scheitern kann,
//      ist gefährlicher als keines). Geprüft wird darum die Geometrie.
//  I5  Die Sprungmarke druckt NICHT mit. Sie ist viewport-`fixed`; im Druck
//      läge sie sonst auf jeder Seite über dem Inhalt.
//
// Reine Darstellungs-Prüfung (§3): kein Wortlaut, kein Wert, keine Frist wird
// geprüft — nur Reihenfolge, Abstand und Breite.
import { test, expect, type Page } from '@playwright/test'

// Rechner-Flächen, die ohne Eingabe schon ein Ergebnis zeigen (Live-Berechnung).
// Eingabe-gegatete Flächen (Streitwert, Prozesskosten, Betreibungskosten,
// Notariat/Grundbuch, Zuständigkeit, Gerichtszitat) sind hier bewusst NICHT
// aufgeführt: sie tragen im Leerzustand den `ErgebnisPlatzhalter` und werden von
// ihren eigenen Fluss-Specs abgedeckt.
const FLAECHEN = [
  '/rechner/tagerechner',
  '/rechner/zpo-fristen',
  '/rechner/schkg-fristen',
  '/rechner/verjaehrung',
  '/rechner/kuendigung',
  '/rechner/mietrecht',
  '/rechner/erb-fristen',
  '/rechner/erbteilung',
  '/rechner/gewaehrleistung',
  '/rechner/verzugszins',
  '/rechner/teuerung',
  '/rechner/bgg-fristen',
  '/rechner/verjaehrung-board',
  '/rechner/inkasso-strecke',
] as const

// Ergebnisblöcke ohne ErgebnisAnzeige — abschliessend, aus DESIGN-REGLEMENT-
// RECHNER R12. Ein NEUER Block ohne Verdikt macht das Tor rot; wer eine echte
// Ausnahme baut, trägt sie hier UND in R12 nach (keine stille Abweichung).
const OHNE_VERDIKT_ERLAUBT: readonly string[] = [
  // R12 Ziff. 1 — Tagerechner-Schnellrechner (EinfacheFristForm): bewusst
  // minimal, sein PDF-/Verdikt-Fall ist der jeweilige Regime-Rechner.
  'lc-ergebnis-einfach',
]

// 40rem Lesespalte + 1rem Toleranz für Rahmen/Innenabstand des Trägers.
const LESESPALTE_MAX = 16 * 41

// ── I2-Schranken (R6 Ziff. 2) ───────────────────────────────────────────────
// ZWEI Schranken, bewusst getrennt:
//
// (1) Die REGLEMENT-Schranke ist eine Bildschirmhöhe — so steht R6 Ziff. 2 da,
//     und so wird sie geprüft (unten gegen `hoehe`).
// (2) Die REGRESSIONS-Schranke ist gemessen. Ohne sie wäre I2 ein Tor, das
//     nicht scheitern kann (§6.7): der gemessene Abstand liegt über alle 22
//     Blöcke mit Vorbehalten bei 48–213 px gegen 800/844 px Schwelle, also
//     Faktor 3.8 Reserve. Die Werte sind quantisiert (48 · 75 · 103 · 130 ·
//     158 · 185 · 213) — der Schritt von ~27 px ist eine Zeile Vorbehalt.
//     320 px lässt also rund vier Zeilen Textwachstum zu und feuert trotzdem,
//     sobald zwischen Verdikt und Vorbehalte etwas EINGESCHOBEN wird — und das
//     ist der Fall, gegen den R6 Ziff. 2 geschrieben ist: jede Karte, jede
//     Kachelreihe, jede Visualisierung misst ein Vielfaches davon.
//     Das ist eine Regressions-Schranke auf gemessener Grundlage, KEINE neue
//     Regel — dieselbe Bauart wie die Budgets in `check:perf-budget`.
const WARN_ABSTAND_REGRESSION = 320

// Flächen, deren Vorgabe-Eingabe KEINE Vorbehalte erzeugt — abschliessend und
// gemessen (4.8.2026, beide Breiten). Der Ausweis ist die Gegenprobe zum Skip:
// eine Fläche, die HIER NICHT steht und trotzdem ohne Vorbehalte kommt, macht
// das Tor rot. Damit fällt auf, wenn Warnungen still verschwinden — §8 ist der
// Grund, aus dem I2 überhaupt existiert, und ein stummer Skip wäre genau die
// Lücke, die §8 verbietet.
const OHNE_VORBEHALTE_ERWARTET: readonly string[] = [
  '/rechner/verjaehrung',
  '/rechner/teuerung',
  '/rechner/bgg-fristen',
]

type Befund = {
  id: string
  ohneVerdikt: boolean
  herleitungVorVerdikt: string[]
  ansichtVorVerdikt: number
  warnAbstand: number | null
  breiteProsa: { breite: number; anfang: string }[]
  sprung: { sichtbar: boolean; imBild: boolean; frei: boolean; hoehe: number; breite: number } | null
}

async function erhebe(page: Page, viewportHoehe: number): Promise<Befund[]> {
  return page.evaluate((vh) => {
    const oben = (el: Element) => el.getBoundingClientRect().top + window.scrollY
    const bloecke = [...document.querySelectorAll('[id^="lc-ergebnis"]')]
    return bloecke.map((b) => {
      // Der Verdikt-Satz ist das Display-<p> im Kopf der ErgebnisAnzeige.
      const verdikt = b.querySelector('p.font-display.font-semibold')
      // Die Marke steht seit QS-UI 8b NEBEN dem Block (sie ist `fixed` und darf
      // nicht im transform-animierten Wrapper liegen) — darum dokumentweit
      // suchen und über das Sprungziel dem Block zuordnen.
      const sprung = document.querySelector(`a[href="#${b.id}"]`)
      const befund = {
        id: b.id,
        ohneVerdikt: !verdikt,
        herleitungVorVerdikt: [] as string[],
        ansichtVorVerdikt: 0,
        warnAbstand: null as number | null,
        breiteProsa: [] as { breite: number; anfang: string }[],
        sprung: null as null | { sichtbar: boolean; imBild: boolean; frei: boolean; hoehe: number; breite: number },
      }
      if (sprung) {
        const r = sprung.getBoundingClientRect()
        const mx = r.left + r.width / 2
        const my = r.top + r.height / 2
        befund.sprung = {
          sichtbar: getComputedStyle(sprung).display !== 'none',
          // Vollständig im Bild — nicht «existiert irgendwo im Dokument».
          imBild: r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight + 1 && r.right <= window.innerWidth + 1,
          // Am eigenen Mittelpunkt oberstes Element, also wirklich klickbar.
          frei: sprung.contains(document.elementFromPoint(mx, my)) || document.elementFromPoint(mx, my) === sprung,
          hoehe: Math.round(r.height),
          breite: Math.round(r.width),
        }
      }
      // I3 gilt auch ohne Verdikt (der Schnellrechner trägt Prosa).
      befund.breiteProsa = [...b.querySelectorAll('p')]
        .filter((p) => (p.textContent || '').trim().length > 90)
        // Kacheln und Tabellen sind ausgenommen (D-1.5); `sr-only`-Absätze sind
        // 1 px breit und tragen keine Lesespalte.
        .filter((p) => !p.closest('.lc-tile') && !p.closest('table') && p.getBoundingClientRect().width > 1)
        .filter((p) => p.getBoundingClientRect().width > 16 * 41)
        .map((p) => ({ breite: Math.round(p.getBoundingClientRect().width), anfang: (p.textContent || '').trim().slice(0, 44) }))
      if (!verdikt) return befund
      const yVerdikt = oben(verdikt)
      befund.herleitungVorVerdikt = [...b.querySelectorAll('button')]
        .filter((k) => /Rechenweg|Annahmen/.test(k.textContent || '') && oben(k) < yVerdikt)
        .map((k) => (k.textContent || '').trim().slice(0, 24))
      // Abgeleitete Ansichten: `data-ansicht` ist die EXPLIZITE Markierung
      // (Kalender, Zeitstrahlen, Balken, Erben-Tabelle); `table, svg` bleibt als
      // Auffangnetz für künftige Ansichten, die die Markierung vergessen.
      // Ohne `data-ansicht` sah I1 die vier Divs-Ansichten nicht: eine unter den
      // FristenKalender geschobene ErgebnisAnzeige liess das Tor grün
      // (§9-Bug-Check zu PR #440, B2 — reproduziert, dann behoben).
      befund.ansichtVorVerdikt = [...b.querySelectorAll('[data-ansicht], table, svg')]
        .filter((t) => oben(t) < yVerdikt).length
      // I2: warn-SPEZIFISCHER Griff. `[class*="bg-warn-bg"]` traf auch
      // dekorative Warn-Tönung (Quoten-Balken der Erbteilung) — siehe
      // ErgebnisAnzeige.tsx.
      const warn = b.querySelector('[data-vorbehalte]')
      if (warn) befund.warnAbstand = Math.round(Math.abs(oben(warn) - yVerdikt))
      void vh
      return befund
    })
  }, viewportHoehe)
}

for (const [breite, hoehe, name] of [[1280, 800, 'Desktop'], [390, 844, 'Mobil']] as const) {
  test.describe(`Verdikt zuerst — ${name}`, () => {
    for (const pfad of FLAECHEN) {
      test(`${pfad}`, async ({ page }) => {
        await page.setViewportSize({ width: breite, height: hoehe })
        await page.goto(pfad)
        await page.locator('[id^="lc-ergebnis"]').first().waitFor()
        const befunde = await erhebe(page, hoehe)
        expect(befunde.length, 'mindestens ein Ergebnisblock').toBeGreaterThan(0)

        for (const b of befunde) {
          // I3 — Lesespalte (gilt für jeden Block).
          expect(b.breiteProsa, `B2 · Fliesstext über der Lesespalte (${LESESPALTE_MAX} px) in #${b.id}`).toEqual([])

          if (b.ohneVerdikt) {
            // Kein Verdikt ist nur zulässig, wo R12 es abschliessend erlaubt.
            expect(OHNE_VERDIKT_ERLAUBT, `R4 Ziff. 2 · Ergebnisblock #${b.id} ohne ErgebnisAnzeige — als R12-Ausnahme nachtragen oder Verdikt ergänzen`)
              .toContain(b.id)
            continue
          }
          // I1 — Verdikt vor Herleitung und vor abgeleiteter Ansicht.
          expect(b.herleitungVorVerdikt, `R4/B1 · Herleitungs-Aufklapper über dem Verdikt in #${b.id}`).toEqual([])
          expect(b.ansichtVorVerdikt, `R4/B1 · abgeleitete Ansicht (Tabelle/Grafik) über dem Verdikt in #${b.id}`).toBe(0)
          // I2 — Vorbehalte nahe am Verdikt. Zwei Schranken (s. oben).
          if (b.warnAbstand !== null) {
            expect(b.warnAbstand, `R6 Ziff. 2 · Vorbehalte weiter als eine Bildschirmhöhe (${hoehe} px) vom Verdikt in #${b.id}`)
              .toBeLessThanOrEqual(hoehe)
            expect(b.warnAbstand, `R6 Ziff. 2 · Regressions-Schranke gerissen — zwischen Verdikt und Vorbehalte ist etwas eingeschoben worden (gemessener Bestand 48–213 px) in #${b.id}`)
              .toBeLessThanOrEqual(WARN_ABSTAND_REGRESSION)
          } else {
            // Skip-Ausweis: Wo Vorbehalte fehlen, muss das erwartet sein.
            expect(OHNE_VORBEHALTE_ERWARTET, `§8 · #${b.id} auf ${pfad} zeigt KEINE Vorbehalte — entweder sind Warnungen still verschwunden, oder die Fläche gehört in OHNE_VORBEHALTE_ERWARTET`)
              .toContain(pfad)
          }
        }

        // I4 — die Sprungmarke ist erreichbar, solange das Ergebnis nicht im Bild
        // steht. Beim Laden steht der Seitenanfang im Bild, das Ergebnis nie
        // (gemessen auf allen 14 Flächen). Geprüft werden die Blöcke, die eine
        // Marke tragen — `sprung={false}`-Blöcke haben bewusst keine.
        const mitMarke = befunde.filter((b) => b.sprung !== null)
        expect(mitMarke.length, 'mindestens ein Block mit Sprungmarke').toBeGreaterThan(0)
        const erreichbar = mitMarke.filter((b) => b.sprung!.sichtbar)
        expect(erreichbar.length,
          `Sprungmarke auf ${name} unsichtbar, obwohl das Ergebnis nicht im ersten Viewport steht`).toBeGreaterThan(0)
        for (const b of erreichbar) {
          expect(b.sprung!.imBild, `Sprungmarke #${b.id} liegt nicht vollständig im Bild (fixed gegen einen transformierten Vorfahren?)`).toBe(true)
          expect(b.sprung!.frei, `Sprungmarke #${b.id} ist an ihrem Klickpunkt verdeckt`).toBe(true)
          // A9: Tap-Ziel. 36 px Höhe ist der Bestand der `lc-btn-sm`-Klasse;
          // die Marke darf nie darunter fallen.
          expect(b.sprung!.hoehe, `Tap-Ziel der Sprungmarke #${b.id} zu flach`).toBeGreaterThanOrEqual(32)
          expect(b.sprung!.breite, `Tap-Ziel der Sprungmarke #${b.id} zu schmal`).toBeGreaterThanOrEqual(44)
        }
      })
    }
  })
}

// ── I5 · Die Sprungmarke druckt nicht mit ───────────────────────────────────
// §9-Bug-Check zu PR #440, B1: Der Druckblock in `src/index.css` listete
// `.lc-btn` — die Varianten `.lc-btn-outline/-primary/-ghost` entstehen aber
// über `@apply lc-btn`, und `@apply` inlined Deklarationen, es vergibt keine
// Klasse. Der Selektor griff also nie. Unbemerkt blieb das, weil fast alle
// Bedienelemente `<button>` sind; es traf die button-gestylten LINKS. Mit dem
// Wegfall von `sm:hidden` (QS-UI 8b) betraf es die Sprungmarke auf jeder
// Breite — auf schmalen Schirmen druckte sie schon vorher mit.
// Geprüft wird das ECHTE Druckmedium, nicht die CSS-Quelle: eine Regel, die
// man nur im Stylesheet nachliest, kann genau so danebengreifen wie diese es
// tat. Beide Breiten, weil die Marke früher breitenabhängig war.
for (const [breite, hoehe, name] of [[1280, 800, 'Desktop'], [390, 844, 'Mobil']] as const) {
  test(`Sprungmarke druckt nicht mit — ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: breite, height: hoehe })
    await page.goto('/rechner/verjaehrung')
    await page.locator('[id^="lc-ergebnis"]').first().waitFor()

    // Gegenprobe zuerst: am Bildschirm IST die Marke da. Ohne sie wäre der
    // Druck-Nachweis wertlos (er würde auch bei fehlender Marke bestehen).
    const marke = page.locator('a[href^="#lc-ergebnis"]').first()
    await expect(marke, 'Vorbedingung: die Marke ist am Bildschirm sichtbar').toBeVisible()

    await page.emulateMedia({ media: 'print' })
    await expect(marke, 'Sprungmarke erscheint im Ausdruck').toBeHidden()

    // Und keine weiteren Bedienelemente im Ausdruck (dieselbe Fehlerklasse).
    const bedienelementeImDruck = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="lc-btn"]')]
        .filter((el) => getComputedStyle(el).display !== 'none')
        .map((el) => el.tagName + '.' + [...el.classList].filter((c) => c.startsWith('lc-btn')).join('.')),
    )
    expect(bedienelementeImDruck, 'Bedienelemente im Ausdruck').toEqual([])

    await page.emulateMedia({ media: 'screen' })
  })
}
