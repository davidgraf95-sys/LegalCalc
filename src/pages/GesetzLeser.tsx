import { Suspense, lazy, useLayoutEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useMeldeInhaltsKopf } from '../components/layout/InhaltsKopfKontext';
import { LadeAnzeige } from './gesetz-leser/inhalt-ansichten';
import { umzugsZiel } from './gesetz-leser/adressUmzug';

// ═══ ABSCHNITT · Einsprungspunkt des Lesers ══════════════════════════════════
//
// GELÖSCHT 21.8.2026 (H5): bis dahin standen hier ZWEI Dateien — diese als
// Fassade (FL-1/FL-2, entschied V1 vs. V3 über `leserFlag.ts`) und
// `gesetz-leser/GesetzLeserV3.tsx` als «Naht» (Lazy-Boundary + `kopfzeileSelbst`-
// Meldung). Mit dem Flag ist die Fassade gegenstandslos geworden (FL-7,
// H5-Abnahmezeile), und die Naht war seit H1 ausdrücklich als DIE Stelle
// angelegt, die «in H5 mit dem Flag verschwindet, nicht ihr Inhalt» — beide
// Dateien sind hier zu einer verschmolzen, wortgleicher Inhalt.
//
// Diese Datei tut jetzt genau drei Dinge (vormals ②/①/③ der Naht):
//
//  ① SIE HÄLT DEN LESER-BAUM AUS DEM START-BUNDLE. `check:perf-budget` misst
//     das. Der Fallback ist derselbe `LadeAnzeige`-Platzhalter, den der Reader
//     ohnehin während des Snapshot-Ladens zeigt — kein zweites Lade-Bild und
//     keine kollabierende Höhe (§15/2 CLS).
//
//  ② SIE SAGT DER HÜLLE, DASS DER LESER SEINE KOPFZEILE SELBST TRÄGT (A-2,
//     Auftrag David 17.8.2026). Ein Satz, `KopfDaten.kopfzeileSelbst` —
//     daraufhin lässt `components/layout` die App-Krumen-Leiste weg
//     (Einzelansicht) bzw. behält im Split nur die Fenster-Steuerung.
//     WARUM HIER und nicht im Rahmen/Modell, wo die Krume entsteht: der Rahmen
//     ist `lazy`. Meldete er es, rendert die Shell die Leiste, bis der Chunk da
//     ist, und liesse sie danach um ihre 37 px zusammenfallen — gemessen
//     17.8.2026 @1440 StPO: 19 Frames mit Leiste, CLS 0.0303–0.0309. Diese
//     Datei rendert synchron mit der Route, die Meldung steht also vor dem
//     ersten Paint des Lesers.
//     SIE IST RESERVIERUNG, NICHT DAS LETZTE WORT (Nachzug 17.8.2026). Genau
//     weil sie datenunabhängig sein MUSS, um vor dem ersten Paint zu stehen, ist
//     sie auf drei Wegen falsch, auf denen der Rahmen früh zurückkehrt und nie
//     einen Leser-Kopf rendert: pdf-embed (EMRK) · nur-live-link (DSGVO) ·
//     Fehlseite. `v3/LeserRahmenV3.tsx` nimmt die Reservierung auf diesen drei
//     Wegen zurück, sobald die Daten da sind (Herleitung dort am Effekt); der
//     Lade-Platzhalter zählt ausdrücklich nicht dazu — für ihn existiert die
//     Reservierung. Zurückgenommen wird sie beim Abbau, hier und geteilt in
//     `useLeserDaten`.
//
//  ③ SIE VOLLZIEHT DIE ROUTE. `RouteSwitch.tsx:116` bindet `/gesetze/:ebene/
//     :key` an diese Datei, und `Pane.tsx` schickt BEIDE Split-Panes durch
//     denselben `RouteSwitch` — der Leser-Baum steht damit in Einzelansicht
//     und beiden Panes gleichermassen.

const LeserRahmenV3 = lazy(() =>
  import('./gesetz-leser/v3/LeserRahmenV3').then((m) => ({ default: m.LeserRahmenV3 })));

export function GesetzLeser() {
  // `ebene` heisst in der Route so, im Register auch — darum hier einmal
  // umbenannt: was aus der ADRESSE kommt, heisst ab hier `routenSegment`.
  const { ebene: routenSegment, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  const { hash, search } = useLocation();
  const meldeInhaltsKopf = useMeldeInhaltsKopf();
  // `useLayoutEffect`, nicht `useEffect` — und das ist gemessen, nicht Geschmack:
  // die Shell setzt ihre Kopfdaten bei JEDEM Pfadwechsel zurück (Shell.tsx, im
  // Render-Rumpf). Ein passiver Effekt käme danach, also potenziell erst nach
  // einem Paint — und dieser eine Frame zeigt die Leiste, die es nicht mehr
  // geben soll. Der Layout-Effekt läuft vor dem Paint; die Leiste erscheint
  // damit in keinem einzigen Frame (gemessen: 19 → 0 Frames, s. ② oben).
  useLayoutEffect(() => {
    meldeInhaltsKopf({ kopfzeileSelbst: true, breadcrumb: [] });
    return () => meldeInhaltsKopf(null);
  }, [meldeInhaltsKopf]);

  //  ④ SIE VOLLZIEHT DEN ADRESS-UMZUG (Befund 45, Entscheid David 29.8.2026).
  //     Steht die Alt-Adresse eines Staatsvertrags in der Zeile, führt EIN
  //     `replace`-Sprung auf die kanonische — mit Anker UND Query, sonst
  //     überlebte ein versendeter Deep-Link `…/CISG#art-35` die Weiterleitung
  //     nicht. `replace`: der Umzug hinterlässt keinen History-Eintrag, «Zurück»
  //     führt dorthin, wo der Nutzer herkam, nicht in die Alt-Adresse zurück.
  //     NACH den Hooks, damit die Hook-Reihenfolge über beide Zweige gleich
  //     bleibt (Regeln der Hooks); der Rahmen-Chunk lädt in diesem Fall nie.
  const ziel = umzugsZiel(routenSegment ?? '', schluessel);
  if (ziel) return <Navigate replace to={{ pathname: ziel, search, hash }} />;

  return (
    <Suspense fallback={<LadeAnzeige />}>
      <LeserRahmenV3 key={schluessel} ebene={routenSegment ?? ''} schluessel={schluessel} />
    </Suspense>
  );
}
