// ─── Trefferflächen-Token (DESIGN-REGLEMENT F9, W2·10-UI-NAV-R4 / R6) ───────
//
// E1 macht aus der Reglement-Zeile eine Schranke: die Mindest-Hitbox lebt als
// EIN Token `--tap-ziel` in `src/index.css` und wird von den Komponenten-
// Klassen als `var(--tap-ziel)` gegriffen — nie als rohe Zahl (D2 «keine
// Magic-Numbers», §5 «eine Quelle»).
//
// Der Wert selbst ist normativ, nicht gestalterisch: WCAG 2.2, Erfolgs-
// kriterium 2.5.8 «Target Size (Minimum)», Konformitätsstufe AA
// (https://www.w3.org/TR/WCAG22/#target-size-minimum, W3C Recommendation
// vom 5.10.2023) verlangt 24 × 24 CSS-px. Der Test lässt darum GRÖSSER zu
// (Verschärfung ist erlaubt), KLEINER nie.
//
// Abgrenzung: `height:` bleibt ungeprüft — 44 px in `.lc-btn` und 36 px in
// `.lc-btn-sm`/`.lc-input-sm` sind die ANATOMIE des Knopfes (feste Höhe einer
// Grössenvariante), nicht eine Untergrenze. Geprüft wird genau das, was die
// Regel meint: `min-height`/`min-width`.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const CSS = readFileSync('src/index.css', 'utf8')

// WCAG 2.2 SC 2.5.8 (AA) — die Untergrenze, die der Token nie unterschreiten darf.
const WCAG_2_5_8_MIN_PX = 24

describe('DESIGN-REGLEMENT F9 — Trefferflächen-Token', () => {
  it('definiert --tap-ziel genau einmal in :root', () => {
    const treffer = [...CSS.matchAll(/^\s*--tap-ziel\s*:/gm)]
    expect(treffer.length, '--tap-ziel darf nur EINE Definition haben (§5)').toBe(1)
  })

  it('hält den WCAG-2.5.8-Wert (≥ 24 px) ein', () => {
    const m = CSS.match(/--tap-ziel\s*:\s*([0-9.]+)px/)
    expect(m, '--tap-ziel muss ein px-Wert sein (Hitboxen werden in CSS-px gemessen)').not.toBeNull()
    const px = Number(m![1])
    expect(px, `WCAG 2.2 SC 2.5.8 verlangt ≥ ${WCAG_2_5_8_MIN_PX} CSS-px`).toBeGreaterThanOrEqual(WCAG_2_5_8_MIN_PX)
  })

  it('lässt keine rohe min-height/min-width-Zahl in den Komponenten-Klassen zu', () => {
    // Kommentare vorher entfernen: sie zitieren die Zahl 24 legitim als Beleg
    // (Norm-Nachweis, §7) — verboten ist die Zahl in der DEKLARATION.
    const ohneKommentare = CSS.replace(/\/\*[\s\S]*?\*\//g, '')
    // B3 (Bug-Check #428): auch logische Properties und em — sonst schlüpft
    // min-block-size/min-inline-size bzw. eine em-Zahl am Wächter vorbei.
    const roh = [...ohneKommentare.matchAll(/min-(?:height|width|block-size|inline-size)\s*:\s*([0-9.]+)(px|rem|em)/g)]
      .map((t) => `min-…: ${t[1]}${t[2]}`)
    expect(
      roh,
      'Trefferflächen kommen aus var(--tap-ziel), nicht aus einer Zahl (F9/D2)',
    ).toEqual([])
  })

  it('wird von den W2·10-Flächen (Kopf-Chips, Leser-Werkzeugleiste) tatsächlich gegriffen', () => {
    // Die Regel ist nur so viel wert wie ihre Anwendung: beide Klassen, die die
    // W2·10-Bedienflächen tragen, müssen den Token führen.
    const chip = CSS.match(/\.lc-chip\s*\{[\s\S]*?\}/)?.[0] ?? ''
    const griff = CSS.match(/\.lc-leiste-griff\s*\{[\s\S]*?\}/)?.[0] ?? ''
    expect(chip, '.lc-chip (Kopf-Metazeilen/Facetten) greift --tap-ziel').toContain('var(--tap-ziel)')
    expect(griff, '.lc-leiste-griff (Leser-Werkzeugleiste) greift --tap-ziel').toContain('var(--tap-ziel)')
  })
})
