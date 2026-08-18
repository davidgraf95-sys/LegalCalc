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
// `scrollBy(SUCH_H_RUHE)`. Sie wäre zweimal falsch: sobald der Nutzer die
// Schriftgrösse verstellt (die App führt eine `schriftskala` — ein rem sind dann
// nicht 16 px), und sobald eine Suche läuft (dann gilt `SUCH_H_AKTIV`).
//
// ── UND GEMESSEN WIRD DER ABSTAND, NICHT DIE HÖHE (im Bau reproduziert) ─────
// Die erste Fassung las die HÖHE des Blocks vorher/nachher und scrollte die
// Differenz weg. Sie machte es schlimmer, und die Spec hat es sofort gezeigt:
// `#art-429` stand danach bei y = 76 statt bei 120, also 44 px HÖHER — genau die
// Höhendifferenz, doppelt statt gar nicht.
// URSACHE: Chromiums **Scroll-Anchoring**. Wächst Inhalt oberhalb des Sichtfelds,
// zieht der Browser die Scroll-Position von sich aus nach; der Text bleibt also
// stehen, und der gewachsene Kopf legt sich einfach ÜBER ihn. Genau das war Ä77 —
// nicht «der Text springt», sondern «der Kopf verdeckt ihn». Eine Korrektur, die
// den Text zusätzlich verschiebt, addiert zum Anchoring, statt es zu ergänzen.
// DIE INVARIANTE, die in beiden Welten stimmt (mit und ohne Anchoring, und auch
// wenn Chromium seine Heuristik ändert): **der Abstand zwischen der Unterkante
// des klebenden Blocks und dem gelesenen Artikel bleibt gleich.** Gemessen wird
// darum dieser ABSTAND vorher und nachher; verschoben wird um seine Differenz.
// Rechnerisch: Anchoring an ⇒ Abstand schrumpft um 44, Korrektur −44; Anchoring
// aus ⇒ Abstand unverändert, Korrektur 0. Dieselbe Zeile, beide Male richtig.
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
//
// ═══ Ä88 (H4-Nachzug 18.8.2026) · ES GIBT EINEN ZWEITEN AUSLÖSER ═════════════
//
// Seit Ä60 (c) faltet auch das BEIWERK-BLATT die Gliederung: zwischen 1024 und
// 1391 px reicht der Raum nicht für Spalte und Blatt, die Gliederung weicht auf
// ihre Schiene — und damit wandert die Such-Zone in den klebenden Kopf (Ä19),
// der Block wächst um dieselben 44 px. Bis zum Nachzug lief dieser Weg NICHT
// durch den Ausgleich; gemessen 18.8.2026 (StPO Art. 429, Panel über den
// Kopf-Zähler aufgezogen, `scratchpad/a-mess.cjs`):
//
//   Viewport   Kopfhöhe        Abstand Block→Artikel   Befund
//   1024        57 → 101 px     −1 → −45 px            Artikelkopf 44 px HINTER
//                                                       dem Kopf, also unsichtbar
//   1150        57 → 101 px     −1 →  −1 px            Anchoring hält
//   1280        57 → 101 px     −1 →  −1 px            Anchoring hält
//   1440        57 →  57 px     −1 →  −1 px            keine Faltung, kein Fall
//
// Die Zahlenreihe zeigt genau, warum die Korrektur GEMESSEN und nicht gerechnet
// wird (Absatz oben): dieselbe Höhenänderung kostet auf einer Breite 44 px
// Leseposition und auf der nächsten null. Eine feste `scrollBy(44)` hätte 1150
// und 1280 kaputt gemacht, um 1024 zu heilen.
//
// DARAUS DIE VERALLGEMEINERUNG: die Hook kennt nicht mehr `tocOffen`, sondern
// eine LAGE — eine Zeichenkette aus allen Zuständen, deren Wechsel die Höhe des
// klebenden Blocks ändern kann. Und statt eines Setters gibt sie eine Klammer
// zurück (`mitAusgleich`), durch die JEDE solche Handlung läuft: Gliederung
// ein/aus, Blatt auf/zu, und der Schienen-Griff, der beides zugleich tut (dann
// EINE Messung, nicht zwei).

export interface StickAusgleich {
  /** An die Leser-WURZEL hängen. Der klebende Block wird darunter gesucht, damit
   *  im Split nicht der Nachbar-Pane gemessen wird.
   *  Am Rahmen steht dort schon der Breiten-Callback aus `./useElementBreite`;
   *  beide teilen sich ein `ref={(el) => {…}}`, das bewusst nichts zurückgibt —
   *  ein Rückgabewert wäre in React 19 eine Aufräumfunktion. */
  wurzelRef: React.RefObject<HTMLDivElement | null>;
  /** DIE EINE KLAMMER um jede Handlung, die den klebenden Block wachsen oder
   *  schrumpfen lassen kann: sie misst zuerst den Abstand, führt dann aus.
   *  Alle Bedienpunkte (☰ · Schiene · «ausblenden» · Panel auf/zu) gehen hier
   *  durch; einer, der seinen Setter direkt riefe, bekäme den Sprung zurück —
   *  darum reicht der Rahmen die Handlung herein statt sie selbst zu rufen.
   *  Mehrere Zustandswechsel in EINER Handlung sind ausdrücklich erlaubt (der
   *  Schienen-Griff): React fasst sie zu einem Commit zusammen, der Ausgleich
   *  läuft danach genau einmal. */
  mitAusgleich: (handlung: () => void) => void;
}

/**
 * Hält die Leseposition, wenn der klebende Kopf-Block seine Höhe ändert.
 *
 * @param lage Zeichenkette aus allen Zuständen, deren Wechsel die Höhe des
 *   klebenden Blocks ändern kann (Gliederung offen · Blatt offen). Sie triggert
 *   den Ausgleich. EIN Auslöser statt zweier Effekte: der Schienen-Griff ändert
 *   beide Zustände in einem Commit, und zwei Effekte hätten den Ausgleich
 *   doppelt gefahren.
 * @param scroller der Scroll-Container dieses Lesers — im Pane dessen Wurzel,
 *   sonst `null` für das Fenster. Der Rahmen löst ihn mit `berechnungen.paneRoot`
 *   auf, also mit DERSELBEN Funktion wie «↑ Anfang» und der Artikel-Sprung (§5);
 *   im Pane wäre `window` schlicht wirkungslos. Dass die Auflösung draussen
 *   bleibt, ist Absicht: `imPane` darf nur an der Wurzel gelesen werden
 *   (Fundament-Sonde, Kap. 10).
 * @param bezugsToken Token des GELESENEN Artikels (Scroll-Spy, `m.aktivToken`).
 *   Er ist das Bezugsobjekt der Invariante — und die ehrliche Wahl: Ä77 handelt
 *   davon, dass GENAU DIESE Überschrift hinter dem Kopf verschwindet. `null`
 *   (noch keine Leseposition, Seitenanfang) ⇒ es gibt nichts zu erhalten, dann
 *   wird nicht gescrollt; ungefragt zu scrollen wäre schlimmer als nichts.
 */
export function useStickAusgleich(
  lage: string,
  scroller: HTMLElement | null,
  bezugsToken: string | null,
): StickAusgleich {
  const wurzelRef = useRef<HTMLDivElement | null>(null);
  const vorherRef = useRef<number | null>(null);
  const tokenRef = useRef<string | null>(null);

  /** Abstand zwischen der Unterkante des klebenden Blocks und der Oberkante des
   *  gelesenen Artikels. `null` = kein Kopf oder kein Bezug im DOM (frühe
   *  Ansicht, Ladezustand, Seitenanfang).
   *  Gesucht wird INNERHALB der eigenen Wurzel: im Split trägt der Nachbar-Pane
   *  dieselben `art-…`-Ids, und `document.getElementById` fände irgendeine. */
  const abstand = (): number | null => {
    const wurzel = wurzelRef.current;
    const token = tokenRef.current;
    if (!wurzel || !token) return null;
    const kopf = wurzel.querySelector('[data-v3-kopf]');
    const bezug = wurzel.querySelector(`[id="art-${CSS.escape(token)}"]`);
    if (!kopf || !bezug) return null;
    return bezug.getBoundingClientRect().top - kopf.getBoundingClientRect().bottom;
  };

  useLayoutEffect(() => {
    const vorher = vorherRef.current;
    vorherRef.current = null;
    // KEIN gemerkter Wert = der Zustand kam nicht von einem Umschalt-Knopf,
    // sondern vom Erst-Render, einem Erlass-Wechsel oder
    // `gliederung.leisteStartetZu`. Dann gibt es keine Leseposition zu erhalten,
    // und ungefragt zu scrollen wäre schlimmer als nichts zu tun.
    if (vorher == null) return;
    const nachher = abstand();
    if (nachher == null) return;
    // `scrollBy(+d)` schiebt den Inhalt um d nach OBEN, verkleinert den Abstand
    // also um d. Um ihn auf den alten Wert zurückzuholen, ist d genau seine
    // Zunahme — Vorzeichen inklusive, in beide Umschaltrichtungen.
    const delta = nachher - vorher;
    // Unter 1 px ist es Rundung, kein Sprung.
    if (Math.abs(delta) < 1) return;
    (scroller ?? window).scrollBy({ top: delta, behavior: 'auto' });
    // Nur die Lage triggert; `abstand` liest Refs, der Scroller wird beim
    // Auslösen gelesen, nicht beim Einhängen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lage]);

  return {
    wurzelRef,
    mitAusgleich: (handlung: () => void) => {
      tokenRef.current = bezugsToken;
      vorherRef.current = abstand();
      handlung();
    },
  };
}
