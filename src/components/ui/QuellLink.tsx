import type { ReactNode } from 'react';
import { AMTLICHE_FASSUNG, AMTLICHE_FASSUNG_AUFGEHOBEN } from '../../lib/benennung';

// ═══ Der Link auf die MASSGEBLICHE amtliche Quelle — EIN Baustein (B-1/B-2) ══
//
// GEMESSEN (Design-Konsistenz, Finder-Welle B, Runde 1, 31.8.2026): derselbe
// Link — «öffne die amtliche Fassung bei der Behörde» — trat in VIER Optiken
// und vier Wortlauten auf:
//   · `parts/ErlassLeserKopf.tsx:275`   «Amtliche Fassung ↗», `.lc-chip`
//   · `pages/MaterialLeser.tsx:116`     «Zur amtlichen Fassung ↗», schwarzer
//                                        Primärknopf (`.lc-btn-primary`)
//   · `components/NormPopover.tsx:167`  «↗ geltende Fassung», Pfeil VORNE
//   · `components/vorlagen/NormChip.tsx:484` «↗ geltende Fassung auf Fedlex»
// Dazu das Aufhebungs-Banner (`ErlassLeserKopf:299/304`) mit «↗ amtliche
// (aufgehobene) Fassung» und «↗ Nachfolge-Erlass: …» — Pfeil vorne, klein
// beginnend, beides gegen Ä110.
//
// KANON (Benennungs-Glossar Ä110, `docs/ux-audit-2026-07/reader/
// leser-v3-design-grundlage.md`): **«Amtliche Fassung ↗»** — Pfeil HINTEN (er
// kündigt das Verlassen der Seite an und gehört ans Ende der Beschriftung),
// gross beginnend (Aktions-/Link-Beschriftungen beginnen gross), ruhiger
// Textlink (kein Primärknopf: das Ziel ist eine Auskunft, keine Erledigung —
// und ein schwarzer Knopf ist auf einer Leseseite die lauteste Form, die es
// gibt).
//
// WARUM EIN BAUSTEIN UND NICHT VIER ANGEGLICHENE KOPIEN (§5/§10): die vier
// Stellen sind vier Mal AUSEINANDERGELAUFEN, obwohl das Wort seit Ä110
// (18.8.2026) feststeht — genau das kann nur eine geteilte Stelle verhindern.
//
// §3: reine Darstellung. Der Baustein entscheidet NICHT, ob ein Erlass gilt
// oder aufgehoben ist — das sagt ihm der Aufrufer über `variante`.
export function QuellLink({ href, variante = 'geltend', className, children }: {
  href: string;
  /** `aufgehoben` = derselbe Link führt auf die AUFGEHOBENE Konsolidierung; das
   *  gehört nach §8 in den Namen, nicht in eine Fussnote. */
  variante?: 'geltend' | 'aufgehoben';
  /** Container-Grammatik des Aufrufers (z. B. `.lc-chip` in der Kopf-Aktionen-
   *  Zeile, die ihre Chip-Anatomie in `.lc-kopf-aktionen` selbst neutralisiert).
   *  Ohne Angabe der ruhige Textlink — die Form, die der Kanon meint. */
  className?: string;
  /** Eigener Name statt des Kanon-Worts — für Ziele, die NICHT «die amtliche
   *  Fassung dieses Dokuments» sind, aber dieselbe Anatomie tragen (Pfeil
   *  hinten, gross beginnend): heute genau der Nachfolge-Erlass im
   *  Aufhebungs-Banner. */
  children?: ReactNode;
}) {
  // Der Pfeil bleibt SICHTBARER TEXT und nicht `aria-hidden`: er ist seit Ä110
  // Teil des Namens («Amtliche Fassung ↗»), und die bestehenden Sonden lesen
  // genau diesen zugänglichen Namen. Eine Umstellung auf `aria-hidden` wäre
  // eine eigene, deklarierte Änderung an allen Aussenlinks — nicht ein
  // Nebeneffekt der Vereinheitlichung.
  //
  // Der Kanon-Name wird als EINE Zeichenkette gebaut, nicht als «{wort} ↗»:
  // `renderToString` setzt zwischen zwei Textknoten ein `<!-- -->`, und der
  // Name landet so zerschnitten im prerenderten HTML und in jeder
  // SSR-Zeichenketten-Sonde. Ein Name, der nur im Browser zusammenhängt, ist
  // keiner (§5 — gemessen wird, was gedruckt wird).
  const kanon = `${variante === 'aufgehoben' ? AMTLICHE_FASSUNG_AUFGEHOBEN : AMTLICHE_FASSUNG} ↗`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? 'text-brass-700 hover:underline'}
    >
      {children ? <>{children} ↗</> : kanon}
    </a>
  );
}
