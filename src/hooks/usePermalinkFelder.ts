// ─── usePermalinkFelder — Einlese-Baustein der Rechner-Formulare ─────────────
//
// Fachneutrale Darstellungs-Infrastruktur (§3): kapselt das Muster, das in den
// Rechner-Formularen 17× wortgleich stand — den Permalink EINMAL beim Mount aus
// der Adresszeile lesen und das Ergebnis als Vorbelegung der Feld-States
// bereitstellen. Keine Rechtslogik: Validierung und Typprüfung bleiben in
// `permalinkLesen` (src/lib/permalink.ts), die Feld-Defaults bleiben in den
// Formularen.
//
// Zwei Sicherungen, die der Baustein aus den Fundstellen übernimmt:
//
//  1. SSR-Sicherheit. Prerender und `check:smoke` rendern die Formulare mit
//     `renderToString` in Node — dort gibt es kein `window`. Die Fundstellen
//     lösten das auf zwei Wegen: entweder mit dem expliziten
//     `typeof window === 'undefined' ? '' : …`-Wächter (useMemo-Variante) oder
//     dadurch, dass der ReferenceError im try/catch hängen blieb
//     (useState-Variante). Beide Wege enden beim leeren Ergebnis —
//     `permalinkLesen(spec, '')` liefert `{}`, genau wie der catch-Zweig.
//     Hier stehen beide Sicherungen, damit keine der 17 Fundstellen ihr
//     bisheriges Verhalten verliert.
//
//  2. Exakt einmal. Die Vorbelegung wird im Lazy-Initializer von `useState`
//     berechnet: React garantiert dafür genau einen Lauf je gemountetem
//     Formular. `useMemo(fn, [])` — die Form, die ein Teil der Fundstellen
//     benutzte — ist demgegenüber nur ein Cache ohne Garantie; ein Neulauf
//     nach einem `replaceState` (die Formulare schreiben ihren Permalink
//     laufend zurück) hätte eine ANDERE Adresszeile gelesen. Das Ergebnis
//     floss dort ohnehin nur in useState-Initializer, die selbst nur einmal
//     laufen — der Wechsel auf useState verschiebt also kein Verhalten,
//     sondern schliesst genau diese Lücke.

import { useState } from 'react';
import { permalinkLesen, type PermalinkSpec } from '../lib/permalink';

/**
 * Liest die Permalink-Felder der Spec einmalig aus `window.location.search`.
 *
 * Rückgabe ist stabil über die Lebensdauer des Formulars und dient als
 * Vorbelegung der einzelnen Feld-States:
 * `const ausLink = usePermalinkFelder(VJ_LINK_SPEC);`
 * `const [regime, setRegime] = useState(ausLink.regime ?? 'ordentlich');`
 */
export function usePermalinkFelder<T extends Record<string, unknown>>(
  spec: PermalinkSpec<T>,
): Partial<T> {
  const [ausLink] = useState<Partial<T>>(() => {
    try {
      return permalinkLesen(spec, typeof window === 'undefined' ? '' : window.location.search);
    } catch {
      return {};
    }
  });
  return ausLink;
}
