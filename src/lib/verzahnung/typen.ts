// ─── Verzahnungs-Grammatik: gemeinsamer Datentyp (Fundament) ────────────────
//
// EINE Kante Norm ↔ Entscheid ↔ Material ↔ Werkzeug — der geteilte Datentyp für
// die Verzahnungs-UI (FAHRPLAN-VERZAHNUNG-UI §1.0). Reine Datenschicht (§3): kein
// JSX, keine Rechtslogik. Die vier Reader/Suche projizieren ihre bestehenden
// Bezüge (NormBezug, EntscheidRef, MaterialBezug, Werkzeug) auf diese Form, damit
// KantenChip/StatusBadge/KontextGruppe EINE Anatomie tragen.
//
// §8-Regel: `herkunft` ist Pflichtfeld — kein Element rendert ohne Herkunft. Der
// kuratierte Normalfall bleibt nackt (kein Badge, §1.3); Badges markieren nur
// Abweichungen.

export type Zieltyp =
  | 'norm' | 'entscheid' | 'material' | 'werkzeug' | 'verwaltungsverordnung';

/** §8-Herkunft der Kante — nie optional, nie verschwiegen. */
export type Herkunft = 'amtlich' | 'kuratiert' | 'maschinell';

/** E4-Konfidenz-Slot (V1 ungenutzt; V2 sichtbar am KantenChip). */
export type Konfidenz = 'hoch' | 'niedrig' | 'unresolved';

/** Q1 im Typsystem: Bandjahr-Datum wird NIE als Tagesdatum gerendert. */
export type Datumspraezision = 'tag' | 'bandjahr' | 'unbekannt';

export type VerzahnungsKante = {
  ziel: { typ: Zieltyp; key: string; label: string };
  richtung: 'zitiert' | 'zitiert-von';
  fundstelle?: { artikel?: string; erwaegung?: string };   // → #e-N / Art.-Anker
  herkunft: Herkunft;                                        // §8-Pflichtfeld, NIE optional
  konfidenz?: Konfidenz;                                     // E4-Slot, V1 ungenutzt
  gewicht?: number;                                          // In-degree, nie «Autorität»
  datum?: { iso: string; praezision: Datumspraezision };     // Q1 im Typ
  /** V1c-Slot (Normrevisions-Ehrlichkeit, FAHRPLAN-VERZAHNUNG-UI §V1c), V1a
   *  ungenutzt — Quelle: struktur-Sidecar-Revisions-Fussnoten (hat sich die
   *  zitierte Norm seit dem Entscheidzeitpunkt revidiert?). */
  fassungsBezug?: 'gleich' | 'revidiert' | 'unbekannt';
  /**
   * B1-Facetten (W2·7-BEZUG, FAHRPLAN-VERZAHNUNG-UI §9): Quelltyp · Ebene ·
   * Kanton · Gericht · Leitentscheid-Status. Hier und nicht in einem eigenen
   * Kantentyp, weil §1.0 EINE Anatomie für alle Bezüge festlegt — Entscheide,
   * Materialien und künftige Quellgattungen filtern über dieselben Achsen.
   *
   * OPTIONAL, damit die Bestands-Projektionen (NormBezug, MaterialBezug,
   * Werkzeug) unverändert weiterlaufen: eine Kante ohne Facetten ist heute
   * genau so gültig wie vorher. Sobald B4 die Filter-UI baut, ist das Feld die
   * einzige Quelle der Schalter — nicht `leitcharakter` und nicht `herkunft`,
   * die beide etwas anderes messen (Begründung in facetten.ts).
   */
  facetten?: import('./facetten').BezugsFacetten;
};

// ─── Status-Vokabular (geschlossene Liste, nur Abweichungen) ─────────────────
//
// Der Normalfall (kuratiert erfasst) trägt KEIN Prädikat (§1.3/§0-1a). `masse`
// und `nur-verweis` sind Enum-Slots für V2/V3 — die Rendering-Schicht bespielt
// heute nur `leitentscheid` und `maschinell` (StatusBadge.tsx).
// `revidiert` ist die V1c-Abweichung (Normrevisions-Ehrlichkeit): die zitierte
// Norm hat sich SEIT dem Entscheid revidiert — der alte Entscheid legt eine andere
// Fassung aus (§1/§8). Der Gegenpol `gleich` trägt bewusst KEIN Badge (kein
// positives «noch aktuell»-Siegel, R16/Scheinautorität).
export type StatusPraedikat = 'leitentscheid' | 'maschinell' | 'masse' | 'nur-verweis' | 'revidiert';

/**
 * Q1-sichere Datums-Anzeige (§1.0): ein `praezision:'bandjahr'`-Datum ergibt NIE
 * einen Tag, nur den Jahrgang; `tag` gibt DD.MM.YYYY; `unbekannt` gibt ''. Rein
 * und deterministisch (§2) — Sortierung nach ISO bleibt dem Aufrufer erlaubt, nur
 * die *Anzeige* eines Bandjahr-Tagesdatums ist verboten (Unit-Test).
 */
export function zeigeKantenDatum(datum?: VerzahnungsKante['datum']): string {
  if (!datum) return '';
  if (datum.praezision === 'unbekannt') return '';
  const jahr = datum.iso.slice(0, 4);
  if (datum.praezision === 'bandjahr') return jahr;
  const m = datum.iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : jahr;
}
