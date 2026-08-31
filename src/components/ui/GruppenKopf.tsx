import type { ReactNode } from 'react';

// ═══ EIN Gruppenkopf, EINE Anatomie (C-2/C-6/C-7, 31.8.2026) ════════════════
//
// GEMESSEN (Design-Konsistenz, Finder-Welle C, Runde 1): derselbe Sachverhalt —
// «hier beginnt eine Gruppe, sie enthält n Einträge» — wurde in ~24 Fundstellen
// in vier Zähler-Schemata und zwei Typo-Stimmen gezeichnet:
//
//   nackte Zahl   12×  Materialien · Rechtsprechung · RechtsgebietUebersicht ·
//                      International · GesetzeGliederung · KantonAuswahl · Suche
//   «(n)»          6×  Katalog (Werkzeug-/Vorlagen-Rubriken)
//   «· n»          4×  Gesetze.tsx (Such-Trefferliste) · KantonSystematik
//   «n verfügbar»  2×  Katalog-Registerkopf   → siehe §8-Ausnahme unten
//
// KANON (Mehrheitsform, das Reglement schweigt zur Zähler-Schreibweise):
// die **nackte Zahl**. Klammern und Mittelpunkt sind Satzzeichen ohne Aussage;
// die Zahl steht ohnehin allein in ihrem Slot. Die Stimme ist `.lc-overline`
// (DESIGN-REGLEMENT §G-e in der Fassung 29.8.2026: Mono trägt «kleine
// STRUKTUR-ETIKETTEN» — ein Gruppenkopf beschriftet eine Region, er wird
// gescannt, nicht gelesen). Sans-H3-Gruppenköpfe (Materialien, International,
// EU-Recht) wechseln darum sichtbar auf Overline.
//
// ANORDNUNG — Titel · Haarlinie · Zahl. Beide Reihenfolgen kamen je 5× vor;
// entschieden hat die umgebende Anatomie: `items-center` (17×) schlägt
// `items-baseline` (5×), und in der `items-center`-Familie steht die Zahl
// rechts der Linie (Materialien, International, GesetzeGliederung-Intl,
// Katalog-Registerkopf). Fachlich trägt dieselbe Richtung: die Linie führt das
// Auge auf einen rechtsbündigen Registerwert; klebt die Zahl am Titel, liest
// sich ein langer Titel («Weitere Entscheide — nicht in der amtlichen Sammlung
// (BGE) 12») als Fliesstext mit angehängter Ziffer.
//
// §8-AUSNAHME, bewusst NICHT eingesammelt: der Katalog-Registerkopf
// («n verfügbar», Katalog.tsx) zählt NICHT die Einträge der Gruppe darunter —
// die Sektion trägt zusätzlich einen «In Vorbereitung»-Block. Eine nackte Zahl
// wäre dort eine falsche Aussage über den Sektionsinhalt, nicht bloss eine
// andere Schreibweise. Das Wort bleibt (§8: Ehrlichkeitstexte nie abschwächen).
//
// §3: reine Darstellung — der Baustein zählt nichts, er zeigt eine übergebene
// Zahl an.
export function GruppenKopf({ titel, zahl, stufe = 3, id, marke, className }: {
  titel: ReactNode;
  /** Einträge der Gruppe. Weggelassen = Gruppenkopf ohne Zähler (kein `0`). */
  zahl?: number;
  /** Überschriften-Ebene der Umgebung — Darstellung bleibt gleich, nur das
   *  Dokument-Outline folgt der Schachtelung (h2 Seite → h3 Sektion → h4). */
  stufe?: 2 | 3 | 4;
  /** Für `aria-labelledby` der umgebenden Sektion. */
  id?: string;
  /** Vorangestellte Marke links vom Titel (Sachziffer «0.1», Untergruppen-Nr.);
   *  rein dekorativ, der Aufrufer setzt `aria-hidden`. */
  marke?: ReactNode;
  /** Zusatz-Klassen der Zeile (Abstände der Umgebung), nie Typo/Farbe. */
  className?: string;
}) {
  const H = `h${stufe}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={className ? `flex items-center gap-3 ${className}` : 'flex items-center gap-3'}>
      {marke}
      <H id={id} className="lc-overline text-brass-700">{titel}</H>
      <span aria-hidden className="flex-1 h-px bg-line" />
      {zahl != null && <span className="num text-body-s text-ink-500">{zahl}</span>}
    </div>
  );
}
