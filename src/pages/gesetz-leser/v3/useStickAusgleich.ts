import { useLayoutEffect, useRef } from 'react';

// ═══ V6 (Nachzug 17.8.2026) · DAS UMSCHALTEN DER GLIEDERUNG VERSCHIEBT NICHTS ═
//
// BEFUND des Ästhetik-Reviews, gemessen @1440 an StPO: klappt man die Gliederung
// ein, verliert der Leser die Spalte — und der klebende Kopf-BLOCK übernimmt
// dafür die Such-Zone (Ä19). Er wächst dabei von 121 auf 164 px. Der Lesetext
// rutscht um dieselben ~43 px nach unten, die SCROLL-Position bleibt aber, wo sie
// war: `#art-429` stand vorher bündig unter dem Kopf (y = 120) und lag danach
// dahinter. Wer die Gliederung ausblendet, um mehr Text zu sehen, verliert als
// erstes die Überschrift, an der er gerade las.
//
// DIE KORREKTUR IST GEMESSEN, NICHT GERECHNET. Die naheliegende Fassung wäre
// `scrolleUm(SUCH_H_RUHE)`. Sie wäre zweimal falsch: sobald der Nutzer die
// Schriftgrösse verstellt (die App führt eine `schriftskala` — ein rem sind dann
// nicht 16 px), und sobald eine Suche läuft (dann gilt `SUCH_H_AKTIV`). Statt die
// Höhe zu behaupten, wird sie vor und nach dem Umschalten AM KLEBENDEN BLOCK
// SELBST abgelesen und die Differenz weggescrollt — dasselbe Vorher/Nachher-
// Muster, mit dem `--nt-stick` seine Zusage hält (Risiko R1, Lehre LM-003).
//
// Der Layout-Effekt läuft nach dem Commit und VOR dem Paint: es gibt keinen
// Zwischenzustand, den der Nutzer sieht, also auch keinen Sprung, den man
// zurücknimmt. Die Grid-BREITE wandert mit `transition` über 200 ms; die HÖHE des
// Kopfes nicht — sie steht sofort, und nur sie wird hier gemessen.
//
// EIGENE DATEI (§6.6): der Rahmen sagt, WO etwas steht. Dass eine Höhenänderung
// des Chromes die Leseposition nicht kosten darf, ist eine Zusage über die
// Geometrie und gehört neben ihre Messung — dasselbe Argument, mit dem
// `./leserGeometrie` aus dem Rahmen herausgelöst wurde.

export interface StickAusgleich {
  /** An die Leser-WURZEL hängen. Der klebende Block wird darunter gesucht, damit
   *  im Split nicht der Nachbar-Pane gemessen wird.
   *  Am Rahmen steht dort schon der Breiten-Callback aus `./useElementBreite`;
   *  beide teilen sich ein `ref={(el) => {…}}`, das bewusst nichts zurückgibt —
   *  ein Rückgabewert wäre in React 19 eine Aufräumfunktion. */
  wurzelRef: React.RefObject<HTMLDivElement | null>;
  /** DER EINE WEG, `tocOffen` zu setzen: merkt zuerst die Höhe des klebenden
   *  Blocks, setzt dann. Alle Bedienpunkte (☰ · Schiene · «ausblenden») gehen
   *  hier durch; ein weiterer, der `setTocOffen` direkt riefe, bekäme den Sprung
   *  zurück — darum reicht der Rahmen den Setter herein statt ihn selbst zu rufen. */
  setzeTocOffen: (auf: boolean) => void;
}

/**
 * Hält die Leseposition, wenn der klebende Kopf-Block seine Höhe ändert.
 *
 * @param tocOffen der Zustand, dessen Wechsel die Höhe ändert — er triggert den
 *   Ausgleich.
 * @param setTocOffen sein Setter; kommt gekapselt als `setzeTocOffen` zurück.
 * @param scroller der Scroll-Container dieses Lesers — im Pane dessen Wurzel,
 *   sonst `null` für das Fenster. Der Rahmen löst ihn mit `berechnungen.paneRoot`
 *   auf, also mit DERSELBEN Funktion wie «↑ Anfang» und der Artikel-Sprung (§5);
 *   im Pane wäre `window` schlicht wirkungslos. Dass die Auflösung draussen
 *   bleibt, ist Absicht: `imPane` darf nur an der Wurzel gelesen werden
 *   (Fundament-Sonde, Kap. 10).
 */
export function useStickAusgleich(
  tocOffen: boolean,
  setTocOffen: (auf: boolean) => void,
  scroller: HTMLElement | null,
): StickAusgleich {
  const wurzelRef = useRef<HTMLDivElement | null>(null);
  const vorherRef = useRef<number | null>(null);

  /** Aktuelle Höhe des klebenden Kopf-BLOCKS (Kopfzeile + Such-Zone).
   *  `null` = noch kein Kopf im DOM (frühe Ansicht, Ladezustand). */
  const hoehe = (): number | null => {
    const el = wurzelRef.current?.querySelector('[data-v3-kopf]');
    return el ? el.getBoundingClientRect().height : null;
  };

  useLayoutEffect(() => {
    const vorher = vorherRef.current;
    vorherRef.current = null;
    // KEIN gemerkter Wert = der Zustand kam nicht von einem Umschalt-Knopf,
    // sondern vom Erst-Render, einem Erlass-Wechsel oder
    // `gliederung.leisteStartetZu`. Dann gibt es keine Leseposition zu erhalten,
    // und ungefragt zu scrollen wäre schlimmer als nichts zu tun.
    if (vorher == null) return;
    const nachher = hoehe();
    if (nachher == null) return;
    const delta = nachher - vorher;
    // Unter 1 px ist es Rundung, kein Sprung.
    if (Math.abs(delta) < 1) return;
    (scroller ?? window).scrollBy({ top: delta, behavior: 'auto' });
    // Nur der Umschalt-Zustand triggert; `hoehe` liest eine Ref, der Scroller
    // wird beim Auslösen gelesen, nicht beim Einhängen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocOffen]);

  return {
    wurzelRef,
    setzeTocOffen: (auf: boolean) => { vorherRef.current = hoehe(); setTocOffen(auf); },
  };
}
