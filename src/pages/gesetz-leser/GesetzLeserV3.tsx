import { Suspense, lazy, useLayoutEffect } from 'react';
import { useMeldeInhaltsKopf } from '../../components/layout/InhaltsKopfKontext';
import { LadeAnzeige } from './inhalt-ansichten';

// ═══ ABSCHNITT · Einsprungspunkt der V3-Hülle (FAHRPLAN-LESER-V3, H1) ════════
//
// Diese Datei ist bewusst DÜNN. Sie tut genau drei Dinge:
//
//  ① SIE HÄLT DEN V3-BAUM AUS DEM START-BUNDLE. Im Flag-Fenster liegen BEIDE
//     Hüllen im Build (Risiko R7). Ohne `lazy` wanderte die neue Hülle in
//     denselben Chunk wie die alte, und jeder Besucher — auch der, der V3 nie
//     anfordert — bezahlte sie mit. `check:perf-budget` misst das; der
//     Grundzustand ist AUS (FL-3/R10), also darf er auch nichts kosten.
//     Der Fallback ist derselbe `LadeAnzeige`-Platzhalter, den der Reader
//     ohnehin während des Snapshot-Ladens zeigt — kein zweites Lade-Bild und
//     keine kollabierende Höhe (§15/2 CLS).
//
//  ② SIE BLEIBT DER NAHT-PUNKT. `GesetzLeser.tsx` (die 8-Zeilen-Fassade)
//     entscheidet, WELCHE Hülle rendert (FL-1); hier steht, WIE die neue
//     geladen wird. In H5 fällt beides zusammen mit dem Flag (FL-7) — dann
//     verschwindet diese Datei, nicht ihr Inhalt.
//
//  ③ SIE SAGT DER HÜLLE, DASS V3 SEINE KOPFZEILE SELBST TRÄGT (A-2, Auftrag
//     David 17.8.2026). Ein Satz, `KopfDaten.kopfzeileSelbst` — daraufhin lässt
//     `components/layout` die App-Krumen-Leiste weg (Einzelansicht) bzw. behält
//     im Split nur die Fenster-Steuerung. Herleitung am Feld selbst.
//     WARUM HIER und nicht im Rahmen/Modell, wo die Krume entsteht: der Rahmen
//     ist `lazy`. Meldete er es, rendert die Shell die Leiste, bis der Chunk da
//     ist, und liesse sie danach um ihre 37 px zusammenfallen — gemessen
//     17.8.2026 @1440 StPO: 19 Frames mit Leiste, CLS 0.0303–0.0309 gegen
//     0.0039–0.0054 in V1. Diese Datei rendert synchron mit der Fassade, die
//     Meldung steht also vor dem ersten Paint des Lesers.
//     EIN SCHREIBER, EIN SLOT (§5): die Meldung ist datenunabhängig und
//     vollständig — der Rahmen meldet seit A-2 nichts mehr (der frühere Effekt
//     ist in `v3/leserV3Modell.ts` als Kommentar dokumentiert). Zurückgenommen
//     wird sie beim Abbau, hier und geteilt in `useLeserDaten`.
//
// Der Marker `data-leser-v3="rahmen"` sitzt seit H1 am Rahmen selbst
// (`v3/LeserRahmenV3.tsx`), nicht mehr auf einem eigenen Vorproben-Streifen:
// er muss weiter maschinell sichtbar sein (`e2e/leser-v3-flag.e2e.ts` sieht
// ihn POSITIV — ein Flag, dessen Wirkung man nicht prüfen kann, ist ein Tor,
// das nicht scheitern kann, §6.7), aber er darf im fertigen Bild nichts mehr
// überlagern.

const LeserRahmenV3 = lazy(() =>
  import('./v3/LeserRahmenV3').then((m) => ({ default: m.LeserRahmenV3 })));

export function GesetzLeserV3({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const meldeInhaltsKopf = useMeldeInhaltsKopf();
  // `useLayoutEffect`, nicht `useEffect` — und das ist gemessen, nicht Geschmack:
  // die Shell setzt ihre Kopfdaten bei JEDEM Pfadwechsel zurück (Shell.tsx, im
  // Render-Rumpf). Ein passiver Effekt käme danach, also potenziell erst nach
  // einem Paint — und dieser eine Frame zeigt die Leiste, die es nicht mehr
  // geben soll. Der Layout-Effekt läuft vor dem Paint; die Leiste erscheint
  // damit in keinem einzigen Frame (gemessen: 19 → 0 Frames, s. ③ oben).
  // Im Prerender (node) ist das ungefährlich: die Fassade wählt dort immer V1
  // (`leserFlagLesen()` liest kein localStorage), diese Komponente rendert
  // serverseitig also nie.
  useLayoutEffect(() => {
    meldeInhaltsKopf({ kopfzeileSelbst: true, breadcrumb: [] });
    return () => meldeInhaltsKopf(null);
  }, [meldeInhaltsKopf]);
  return (
    <Suspense fallback={<LadeAnzeige />}>
      <LeserRahmenV3 ebene={ebene} schluessel={schluessel} />
    </Suspense>
  );
}
