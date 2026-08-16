import { GesetzLeserInhalt } from './inhalt';

// ═══ ABSCHNITT · V3-Rahmen (Vorprobe V-1…V-3, FAHRPLAN-LESER-V3 Kap. 6) ══════
//
// WAS DAS HIER IST — und was es ausdrücklich NICHT ist:
//
// Dies ist der Naht-Punkt («strangler fig seam») für Leser V3. Er existiert
// heute NUR, damit die Vorprobe beweisen kann, dass die 8-Zeilen-Fassade
// `src/pages/GesetzLeser.tsx` als EINZIGER Schaltpunkt trägt — für die
// Einzelansicht UND für beide Split-Panes, weil `Pane.tsx:126` beide Panes
// durch denselben `RouteSwitch` und damit durch dieselbe Fassade schickt.
//
// KEIN H1-Design. Keine neue Kopfzeile, keine Seitenleiste, kein neues Panel.
// Der Rahmen rendert den Ist-Baum (`GesetzLeserInhalt`, der seinerseits
// `ArtikelLeser` und die Leser-Hooks hält) BUCHSTÄBLICH unverändert weiter.
// Genau das ist die Bedingung dafür, dass die acht N-e2e (Normtext-Treue,
// Kap. 10) im Flag-Projekt `leser-v3` grün laufen — sie prüfen Optionen-Menü,
// PDF-Download, Marginalien und Suche, also die volle Hülle. Ein Rahmen, der
// `ArtikelLeser` selbst zusammensetzt, könnte sie gar nicht bestehen; die
// Fahrplan-Formulierung «Rahmen, der ArtikelLeser importiert» ist deshalb hier
// als «Rahmen, der den ArtikelLeser-Baum einhängt» umgesetzt (Abweichung im
// Vorproben-Protokoll offengelegt, docs/ux-audit-2026-07/reader/
// leser-v3-vorprobe.md).
//
// H1 ERSETZT DANN VON INNEN: Kopfzeile, Seitenleiste und Panel wandern
// schrittweise HIER hinein, während `GesetzLeserInhalt` unberührt (FL-4:
// eingefroren) daneben weiterläuft. In H5 fällt beides zusammen mit dem Flag
// (FL-7).
//
// Der Marker ist die einzige sichtbare Zutat: ohne ihn wäre am Bildschirm
// nicht erkennbar, in welchem Modus man steht — und ein Flag, dessen Wirkung
// man nicht sieht, ist ein Tor, das nicht scheitern kann (§6.7). Er trägt
// `data-leser-v3` und ist damit auch maschinell prüfbar.

export function GesetzLeserV3({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  return (
    <>
      <div
        data-leser-v3="rahmen"
        className="mb-3 rounded border border-dashed border-brass-600 px-3 py-1 text-body-s text-ink-700"
      >
        V3-Rahmen (Vorprobe)
      </div>
      <GesetzLeserInhalt ebene={ebene} schluessel={schluessel} />
    </>
  );
}
