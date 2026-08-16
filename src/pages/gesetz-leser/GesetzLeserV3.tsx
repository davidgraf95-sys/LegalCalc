import { Suspense, lazy } from 'react';
import { LadeAnzeige } from './inhalt-ansichten';

// ═══ ABSCHNITT · Einsprungspunkt der V3-Hülle (FAHRPLAN-LESER-V3, H1) ════════
//
// Diese Datei ist bewusst DÜNN. Sie tut genau zwei Dinge:
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
// Der Marker `data-leser-v3="rahmen"` sitzt seit H1 am Rahmen selbst
// (`v3/LeserRahmenV3.tsx`), nicht mehr auf einem eigenen Vorproben-Streifen:
// er muss weiter maschinell sichtbar sein (`e2e/leser-v3-flag.e2e.ts` sieht
// ihn POSITIV — ein Flag, dessen Wirkung man nicht prüfen kann, ist ein Tor,
// das nicht scheitern kann, §6.7), aber er darf im fertigen Bild nichts mehr
// überlagern.

const LeserRahmenV3 = lazy(() =>
  import('./v3/LeserRahmenV3').then((m) => ({ default: m.LeserRahmenV3 })));

export function GesetzLeserV3({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  return (
    <Suspense fallback={<LadeAnzeige />}>
      <LeserRahmenV3 ebene={ebene} schluessel={schluessel} />
    </Suspense>
  );
}
