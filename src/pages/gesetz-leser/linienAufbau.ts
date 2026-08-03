// ─── Linien-Aufbau-Metrik (W2·5d U-LINIEN / A8) ──────────────────────────────
//
// SSoT für die Frage «wann zeigt der Gesetzes-Reader den vertikalen Gliederungs-
// Guide?». Davids Anmerkung A8 (5.7.2026): «Liniengliederungsdarstellung nochmals
// komplett überarbeiten und regeln festlegen wie es wann angezeigt wird JE NACH
// AUFBAU GESETZ. zgb bspw. sehr viele aber arg fast keine aktuell.»
//
// Der frühere Default war KATEGORIE-basiert (G3a/K11: nur grundart===KODIFIKATION
// zeigte den Guide) — genau die Inkonsistenz, die David rügt: das tiefe ZGB
// (KODIFIKATION) ertrank in Linien, das flache ArG (STANDARD_ERLASS) bekam gar
// keine. Neu ist der Default AUFBAU-basiert: abgeleitet aus dem TATSÄCHLICHEN
// Struktur-Sidecar (Gliederungstiefe + Artikel-Dichte je Ebene), nicht aus der
// Grundart-Schublade. Der K11-Tri-State-NUTZER-Override (data-linien an/aus,
// global) bleibt unangetastet — hier geht es allein um den AUTO-Default.
//
// Reine Darstellung (§3): entscheidet nur über eine border-Sichtbarkeit, nie über
// Rechtsinhalt. Der amtliche Wortlaut ist unberührt.
//
// ── CHRONIK des Auto-Defaults: #161 → L-3 → A28 → L-3-Reaktivierung ───────────
// Diese Regel ist DREIMAL gedreht worden. Die Chronik steht hier vollständig, damit
// die nächste Session nicht den nächsten Flip-Flop baut, ohne zu wissen, was schon
// geprüft wurde. Wer hier etwas ändert, ergänzt einen vierten Absatz — er löscht
// keinen der bestehenden.
//
// (1) #161 (5.7.2026) — TIEFE DECKELT. `autoGuide = strukturTiefe ≤ TIEF_AB−1 &&
//     dichteAmGuide ≥ DICHTE_MIN`: tiefe Kodifikationen (ZGB/OR, strukturTiefe ≥ 3)
//     bekamen den Auto-Guide GANZ AUS, aus Sorge vor einem «Barcode» aus einem
//     Strich je Ebene. David meldete das zurück als «funktioniert praktisch nicht»:
//     gerade seine tiefen Leit-Kodifikationen zeigten gar keine Gliederungslinie.
//
// (2) L-3 (11.7.2026, gebaut als #207) — DICHTE-BODEN ALLEIN. Der Denkfehler von
//     #161 war, dass es gar keinen Strich JE Ebene gibt: der Reader emittiert
//     HÖCHSTENS EINEN Guide, fix auf `guideEbene` (= min(tiefe−1, 1); renderSektion,
//     R4-gegated). Ein einzelner vertikaler Guide auf der inneren Gruppierungsebene
//     ist kein Barcode. Darum Umkehr: `autoGuide = dichteAmGuide ≥ DICHTE_MIN` —
//     die Tiefe deckelt NICHTS mehr, der Dichte-Boden bleibt der einzige Schwellwert
//     (er hält den Per-Artikel-Barcode fern). Empirie damals: Auto-Guide AN 158 → 230.
//
// (3) A28 (12.7.2026, #219) — KORPUSWEIT AUS. David prüfte L-3 live an seinen
//     eigenen Erlassen und verwarf es: «das mit den linien funktioniert überhaupt
//     nicht» / «also ist überhaupt nicht fördernd für die übersicht» (Wortlaut
//     persistiert in docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-12.md).
//     Konsequenz: `autoGuide = false` korpusweit — der Reader drängt die Linie NIE
//     auf. Das war der konservative Zustand nach einem Total-Urteil.
//
// (4) L-3-REAKTIVIERUNG (3.8.2026) — ZURÜCK AUF DEN DICHTE-BODEN. David hat den
//     Auto-Default am 3.8.2026 erneut entschieden, und zwar in VOLLER KENNTNIS der
//     Chronik: ihm wurde ausdrücklich vorgehalten, dass sein Live-Urteil vom 12.7.
//     («funktioniert überhaupt nicht») der Grund für A28 war und dass A28 der
//     aktuelle Live-Zustand ist. Er hat trotzdem bewusst «L-3 wirklich reaktivieren»
//     gewählt. Damit ist A28 AUFGEHOBEN und die L-3-Regel aus (2) wieder in Kraft:
//       autoGuide = dichteAmGuide ≥ DICHTE_MIN
//     Rechtfertigung ist NICHT eine bessere Theorie über Übersicht — die Theorie
//     von L-3 wurde 12.7. falsifiziert und wird hier nicht wiederbelebt. Tragend ist
//     allein Davids späterer, informierter Entscheid: er ist der einzige zuständige
//     Abnehmer, und er hat die Falsifikation vor Augen gehabt. Sollte er das Ergebnis
//     erneut live verwerfen, ist der nächste Schritt NICHT ein weiteres Drehen an
//     DICHTE_MIN, sondern die Alternativen-Skizze in FAHRPLAN-GESETZES-UX §10.9
//     (Typo-Hierarchie · Sticky-Mini-Kontext · TOC-Scroll-Spy · Abschnitts-Rhythmus).
//
// WICHTIG — der K11-Tri-State-NUTZER-Schalter «Linien» (data-linien an/aus, global,
// LeserAnsichtMenu) war und ist von alledem unberührt: er übersteuert den Auto-
// Default in beide Richtungen. `strukturTiefe`/`guideEbene`/`dichteAmGuide` bleiben
// voll berechnet — sie steuern, WO der Guide sitzt und OB der Schalter erscheint
// (zeigeLinien = guideEbene !== null). Hier geht es allein um den AUTO-Default.
//
// FLACHE Erlasse (strukturTiefe 0 ⇒ FLACH) haben NIE einen Guide — auch unter der
// reaktivierten Regel nicht. Dort, wo der Aufbau keine Ebene hat, entsteht kein
// neues Linien-Rauschen (VMWG & Co. bleiben unverändert guide-frei).
//
// TIEF_AB ist seit L-3 nur noch Klassifikations-Schwelle («ab hier tiefe
// Kodifikation», Diagnose/Doku) und deckelt den Auto-Default nicht.
//
// Gliederungstiefe (max. Sidecar-Verschachtelung) je Erlass, zur Einordnung
// (Erhebung `node scripts/linien-korpus-verteilung.mjs`):
//   Tiefe 0: 900 (79 %)  ·  1: 64  ·  2: 98  ·  3: 58  ·  4: 12  ·  5: 3
//
// Referenz-Verdikte (im Tor `check:linien-kanon` positiv+negativ gegated):
//   ZGB  tiefe5 dichte92 → AN (der EINE Guide)   OR   tiefe4 dichte22 → AN
//   ArG  tiefe2 dichte4  → AN (Ebene 1)          VMWG tiefe0        → kein Guide (flach)
//   Kurzerlass/Staatsvertrag tiefe1 → AN (Ebene 0, «flache Ebene sichtbar»)

import type { StrukturMap } from '../../lib/normtext/browse';

export const LINIEN_SCHWELLEN = {
  /** Ab dieser Gliederungstiefe gilt ein Erlass als «tiefe Kodifikation» (ZGB/OR).
   *  NUR Klassifikations-Schwelle für Diagnose/Doku — seit L-3 deckelt die Tiefe den
   *  Auto-Guide NICHT (Umkehr der #161-Politik, s. Chronik im Kopf): ein einzelner
   *  Guide auf `guideEbene` ist keine Ebenen-Stapelung. Die Auto-Guide-Entscheidung
   *  hängt allein an DICHTE_MIN. */
  TIEF_AB: 3,
  /** Median Artikel je geführter Sektion; darunter wäre der EINE Guide ein Per-
   *  Artikel-Barcode statt einer Gruppierung ⇒ Auto-Guide AUS. Seit der L-3-
   *  Reaktivierung (David 3.8.2026, hebt A28 auf) wieder der EINZIGE Schwellwert
   *  des Auto-Defaults. */
  DICHTE_MIN: 2,
} as const;

export interface LinienProfil {
  /** Maximale Gliederungs-Verschachtelung des Erlasses (0 = flache Artikelliste). */
  strukturTiefe: number;
  /** Sektions-tiefe (Rekursionstiefe in renderSektion), die den EINEN vertikalen
   *  Guide trägt, wenn Linien sichtbar sind — 0 oder 1; `null` = der Erlass hat
   *  keine Gliederungs-Sektionen, kein Guide möglich. Bei tiefen Kodifikationen
   *  bleibt guideEbene = 1 (der frühere Fix-Wert), damit Auto-Default UND Nutzer-
   *  Override `an` denselben Ort treffen. */
  guideEbene: number | null;
  /** Median Artikel je Sektion auf `guideEbene` (0 wenn n/a). */
  dichteAmGuide: number;
  /** Zeigt der Guide im AUTO-Default (ohne expliziten Nutzer-Klick)? */
  autoGuide: boolean;
}

const FLACH: LinienProfil = { strukturTiefe: 0, guideEbene: null, dichteAmGuide: 0, autoGuide: false };

/** Median einer bereits NICHT sortierten Zahlenliste (untere Mitte). */
function median(werte: number[]): number {
  if (werte.length === 0) return 0;
  const s = [...werte].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/**
 * Leitet das Linien-Aufbau-Profil eines Erlasses aus seinem Struktur-Sidecar ab
 * (die von `ladeStruktur` geladene StrukturMap). Deterministisch, seiteneffektfrei;
 * dieselbe Funktion nutzt der Reader (Laufzeit) UND das Tor (Korpus-Gegenprobe).
 */
export function linienProfil(struktur: StrukturMap | null | undefined): LinienProfil {
  if (!struktur) return FLACH;

  let strukturTiefe = 0;
  // artProSektion[L] : voller Pfad-Präfix der Länge L+1 → Anzahl Artikel darunter.
  const artProSektion: Array<Map<string, number>> = [];
  for (const key in struktur) {
    const g = struktur[key].gliederung ?? [];
    if (g.length > strukturTiefe) strukturTiefe = g.length;
    for (let L = 0; L < g.length; L++) {
      const map = (artProSektion[L] ??= new Map());
      const pref = g.slice(0, L + 1).map((x) => x.label).join(' / ');
      map.set(pref, (map.get(pref) ?? 0) + 1);
    }
  }
  if (strukturTiefe === 0) return FLACH;

  // Der Guide markiert die INNERE Gruppierungsebene (Ebene 1), sofern vorhanden;
  // hat der Erlass nur EINE Ebene, sitzt er auf der äussersten (Ebene 0) — so wird
  // «die flache Ebene sichtbar» (Kurzerlass/Staatsvertrag mit einer Gliederung).
  const guideEbene = Math.min(strukturTiefe - 1, 1);
  const dichteAmGuide = median([...(artProSektion[guideEbene]?.values() ?? [])]);
  // L-3-Regel, reaktiviert 3.8.2026 (David-Entscheid, hebt A28 auf — Chronik im
  // Kopf): Auto-Guide AN, sobald der Aufbau ihn TRÄGT (Dichte-Boden) — die Tiefe
  // deckelt NICHT. Tiefe Kodifikationen (ZGB/OR) zeigen damit wieder ihren EINEN
  // Guide auf `guideEbene`; der Dichte-Boden hält den Per-Artikel-Barcode fern.
  // Flache Erlasse (strukturTiefe 0) sind oben schon als FLACH abgebogen.
  const autoGuide = dichteAmGuide >= LINIEN_SCHWELLEN.DICHTE_MIN;

  return { strukturTiefe, guideEbene, dichteAmGuide, autoGuide };
}
