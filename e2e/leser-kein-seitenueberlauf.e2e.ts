// @shard-gruppe: 6
// ═══ B6 (H4-Nachzug 18.8.2026) · KEINE SEITE LÄUFT QUER ═════════════════════
//
// AUSGANGSBEFUND (Klick-Test B9): «ZH-211.11 § 4: Tabelle 81 px Seiten-Überlauf
// @390 trotz `.lc-scroll-x`, V1 + V3, Kern-Render».
//
// NACHGEMESSEN 18.8.2026 (390×844, `vite preview`, beide Hüllen je 81 px): die
// Zahl stimmt, die URSACHE nicht — und der Irrtum ist die eigentliche Lehre.
//
//   Tabelle in § 4   1002 px breit, IM Scroller `span.lc-scroll-x`
//                    (clientWidth 312 · scrollWidth 1002 · overflow-x: auto)
//                    ⇒ korrekt gefasst, läuft nirgends über.
//   Echter Überläufer `a` «Notariatsgebührenverordnung (NotGebV) ›» in der
//                    Fusszeile «Weitere Erlasse»: 191 px breit, rechte Kante 471
//                    in einem 390-Fenster ⇒ genau die 81 px.
//
// Warum die Fehlzuordnung naheliegt: `getBoundingClientRect` einer Tabelle IM
// Scroller liefert ihre volle Breite (1002), nicht die sichtbare. Wer nach
// «breiten Elementen» sucht, findet zuerst sie. Die Sonde unten macht darum den
// zweiten Schritt zur Bedingung: ein Element zählt nur als Überläufer, wenn es
// KEINEN klippenden Vorfahren hat (`overflow-x` ≠ `visible`). Ohne diesen Filter
// meldet jede Überlauf-Sonde den Inhalt jedes Scrollers mit — sie kann dann
// nicht mehr zwischen «gefasst» und «hinausgeragt» unterscheiden und ist als
// Wächter wertlos (§6.7).
//
// URSACHE des echten Überlaufs: drei Flex-Kinder ohne `min-w-0`. Ein Flex-Kind
// schrumpft nicht unter seine `min-content`-Breite — und die ist hier das
// längste Wort, «Notariatsgebührenverordnung». Dass der Kürzel-Wert an diesem
// Erlass der Volltitel ist, ist ein eigener Daten-Befund (Klick-Test C3); die
// Zeile darf aber an KEINEM Wert brechen.
//
// ROT ZU BEKOMMEN (§6.7): in `v3/LeserLesespalte.tsx` bzw.
// `inhalt-volltext.tsx` das `min-w-0` an den beiden Nachbar-Links entfernen ⇒
// beide Fälle rot mit 81 px. So gemessen.
import { test, expect, type Page } from '@playwright/test'

/** Elemente, die über die Fensterbreite ragen UND von niemandem geklippt werden. */
async function ueberlaeufer(page: Page): Promise<{ ueberlauf: number; quellen: string[] }> {
  return page.evaluate(() => {
    const grenze = document.documentElement.clientWidth
    const quellen: string[] = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.right <= grenze + 1) continue
      let a = el.parentElement
      let geklippt = false
      while (a && a !== document.documentElement) {
        const ox = getComputedStyle(a).overflowX
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') { geklippt = true; break }
        a = a.parentElement
      }
      if (geklippt) continue
      quellen.push(`${el.tagName}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`
        + ` right=${Math.round(r.right)} «${(el.textContent ?? '').trim().slice(0, 40)}»`)
    }
    return {
      ueberlauf: document.documentElement.scrollWidth - grenze,
      quellen: quellen.slice(0, 6),
    }
  })
}

for (const [name, suffix] of [['V3', ''], ['V1', '?leser=v1']] as const) {
  test(`${name} @390: ZH-211.11 läuft nicht quer — die Tabelle bleibt im Scroller`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/gesetze/kanton/ZH-211.11${suffix}`)
    await expect(page.locator('article[id^="art-"]').first()).toBeAttached({ timeout: 20_000 })
    // Die Fusszeile ist das Ziel der Messung — sie muss gerendert sein.
    await expect(page.locator('nav[aria-label="Weitere Erlasse"]')).toBeAttached({ timeout: 20_000 })

    const { ueberlauf, quellen } = await ueberlaeufer(page)
    expect(ueberlauf, `Seiten-Überlauf @390 — ungeklippte Quellen: ${quellen.join(' | ') || '—'}`)
      .toBeLessThanOrEqual(0)

    // Positiv-Sonde: die breite Tabelle IST da und IST gefasst. Ohne sie könnte
    // der Fall grün werden, weil die Tabelle verschwunden ist (§6.7).
    const scroller = await page.evaluate(() => {
      const t = [...document.querySelectorAll('span.table')].find((x) => x.scrollWidth > 500)
      if (!t) return null
      const s = t.closest('.lc-scroll-x') as HTMLElement | null
      return s ? { cw: s.clientWidth, sw: s.scrollWidth, overflowX: getComputedStyle(s).overflowX } : null
    })
    expect(scroller, 'die breite Tabelle sitzt in keinem `.lc-scroll-x`').not.toBeNull()
    expect(scroller!.overflowX).toBe('auto')
    expect(scroller!.sw, 'der Scroller hat nichts zu scrollen — die Tabelle ist nicht mehr breit')
      .toBeGreaterThan(scroller!.cw)
  })
}
