// ─── Druck-Fundstellen-Wächter (W2·10-UI-NAV-Z2) ───────────────────────────
//
// Die Print-Regel in `src/index.css` blendet die klebende Topbar über
// `header.lc-glass` aus — statt wie früher über den nackten Tag `header`, der
// AUCH den Erlass-/Entscheid-Kopf traf und damit Titel, SR, Stand-Zeile, ELI
// und das §8-Aufhebungsbanner aus jedem Ausdruck warf.
//
// Diese Kopplung ist unsichtbar und bricht still: Nimmt jemand `lc-glass` aus
// der Topbar oder setzt jemand wieder einen Pauschal-Selektor in den
// Druckblock, merkt es niemand — bis ein Ausdruck entweder die Navigation
// mitschleppt oder erneut ohne Stand-Zeile herauskommt. Beide Enden werden
// darum hier festgehalten (§6.7: der Wächter kann scheitern — er wurde einmal
// rot gezeigt, indem `lc-glass` testweise aus Topbar.tsx entfernt wurde).
//
// Das VERHALTEN im echten Druckmedium prüft `e2e/druck-fundstellen-z2.e2e.ts`
// (page.emulateMedia({ media: 'print' })); dieser Unit-Wächter sichert nur die
// Kopplung, die der e2e-Lauf voraussetzt.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const CSS = readFileSync('src/index.css', 'utf8')
const TOPBAR = readFileSync('src/components/layout/Topbar.tsx', 'utf8')

/** Der Inhalt des `@media print`-Blocks, Kommentare entfernt. */
function druckBlock(): string {
  const ohneKommentare = CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  const start = ohneKommentare.indexOf('@media print')
  expect(start, 'src/index.css führt einen @media-print-Block').toBeGreaterThan(-1)
  // Klammern zählen statt regex-greedy schneiden (der Block enthält @page und
  // verschachtelte Regeln).
  let tiefe = 0
  let i = ohneKommentare.indexOf('{', start)
  const von = i
  for (; i < ohneKommentare.length; i++) {
    if (ohneKommentare[i] === '{') tiefe++
    else if (ohneKommentare[i] === '}') {
      tiefe--
      if (tiefe === 0) return ohneKommentare.slice(von + 1, i)
    }
  }
  throw new Error('@media-print-Block ist nicht geschlossen')
}

describe('Z2 — Druck der Fundstelle', () => {
  it('blendet die Topbar über ihre Klasse aus, nicht über den Tag `header`', () => {
    const block = druckBlock()
    // Ein nackter `header`-Selektor (Zeilenanfang oder nach Komma) würde den
    // Inhalts-Kopf wieder mitreissen.
    const nackt = [...block.matchAll(/(^|[,{}])\s*header\s*(?=[,{ ])/g)]
    expect(
      nackt.map((m) => m[0].trim()),
      'Druckregel darf keinen Pauschal-Selektor `header` führen (er trifft auch den Erlass-/Entscheid-Kopf)',
    ).toEqual([])
    expect(block, 'die klebende Topbar wird über header.lc-glass ausgeblendet').toContain('header.lc-glass')
  })

  it('Topbar trägt die Klasse, auf die die Druckregel zielt', () => {
    expect(TOPBAR, 'Topbar.tsx muss lc-glass führen, sonst greift die Druckregel ins Leere').toContain('lc-glass')
    // …und zwar am <header> selbst, nicht irgendwo im Baum.
    const headerTag = TOPBAR.match(/<header[\s\S]{0,300}?>/)?.[0] ?? ''
    expect(headerTag, '<header> der Topbar trägt lc-glass').toContain('lc-glass')
  })

  it('druckt absolute Quell-URLs als Text (Fundstelle bleibt auf Papier)', () => {
    const block = druckBlock()
    expect(block, 'externe Links geben ihr href im Ausdruck aus').toMatch(/a\[href\^="http"\]::after/)
    expect(block, 'die URL kommt aus attr(href), nicht aus einer Kopie').toContain('attr(href)')
  })

  it('hebt content-visibility und Scroll-Clipping für den Ausdruck auf', () => {
    const block = druckBlock()
    expect(block, 'content-visibility darf im Druck nichts überspringen').toMatch(/content-visibility:\s*visible/)
    expect(block, 'Scroll-Panes clippen im Druck nicht').toMatch(/overflow:\s*visible/)
  })
})
