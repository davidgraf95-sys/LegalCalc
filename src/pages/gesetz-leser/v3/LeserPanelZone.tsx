import { useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { setzeBezugKantone, setzeBezugKlassen, setzeBezugZeit, useBezugKantone, useBezugKlassen } from '../leserOptionen';
import type { BestimmungsWort } from './erlassAnsicht';
import { LeserPanel } from './LeserPanel';
import { PanelEntscheide } from './PanelEntscheide';
import { PanelAenderungen } from './PanelAenderungen';
import { PanelMaterialien } from './PanelMaterialien';
import { useMaterialien, useRevisionen } from './panelKontextLaden';
import { OEFFNER_SELEKTOR, type PanelBezuege, type PanelZustand } from './panelModell';
import { usePopoverAutoZu } from './usePopoverAutoZu';

// ─── WO das Panel steht (H3, Kap. 4d) ────────────────────────────────────────
//
// EIN Blatt (Sheet) über der Fläche, in zwei Gestalten (`panelForm`):
//
//   'rechts'  D, Einzelansicht — 22 rem am rechten Rand, NICHT modal. Der
//             Lesetext links bleibt sichtbar UND bedienbar; das Panel ist
//             Beiwerk und verhält sich auch so (Ä52, s. u.).
//   'unten'   H und jedes Pane — echtes Bottom-Sheet, modal. Es reicht von der
//             Unterkante nach oben und lässt den Artikel darüber stehen (Ä55).
//
// WARUM KEINE ANGEDOCKTE SPALTE AUF D: die Rechnung steht im Rahmen
// (`LeserRahmenV3`, «KEINE DRITTE SPUR») — der Seitenrahmen ist auf 70 rem
// gedeckelt (gemessen 1072 px auf jeder Desktop-Breite), 18 + 40 + 22 rem
// brauchen 1344. Ein Zweig, den keine Breite erreicht, ist toter Code (§17).
// Der Blatt-Modus erfüllt die harte Regel «NIE drei vertikale Flächen» ohnehin
// in jeder Lage, nicht nur im Pane.
//
// ═══ Ä52 (H3-Nachzug) · DAS BLATT DECKTE DEN KOPF, DEN ES BEDIENT ════════════
// Gemessen 17.8.2026: das Blatt begann auf D bei `top: var(--leser-kopf-h)` =
// **y 100**, der V3-Kopf liegt bei **y 100–159**. Es lag also über der Kopfzeile
// samt Öffner, «Ansicht ▾» und ✕ — über genau den Bedienelementen, die es
// aufgezogen haben. Neu beginnt es an der UNTERKANTE des klebenden Kopf-BLOCKS,
// und zwar aus derselben Quelle, aus der die Anker ihren Sprung-Offset rechnen
// (`--nt-stick`, Risiko R1/LM-003): eine zweite Zahl hätte beim nächsten
// Stufenwechsel der Kopfzeile auseinandergelaufen.
//
// ZWEITER TEIL VON Ä52 — KOMMENTAR UND BAU STIMMEN JETZT ÜBEREIN: `panelForm`
// verspricht für `'rechts'` «Lesetext bleibt links sichtbar und LESBAR; Panel ist
// Beiwerk». Gebaut war ein Vollflächen-Scrim (`fixed inset-0 bg-ink-900/30`) mit
// `aria-modal` und Fokus-Falle — also ein Dialog, der genau das verhindert. Auf D
// gibt es darum keinen Scrim, kein `aria-modal` und keine Fokus-Falle mehr
// (`usePopoverAutoZu` Modus `beiwerk`, Herleitung dort); auf H und im Pane bleibt
// das Sheet modal, weil es dort die ganze Bedienfläche beansprucht.
//
// ═══ Ä55 (H3-Nachzug) · DAS «BOTTOM-SHEET» HING OBEN ═════════════════════════
// Gemessen @390: das Sheet begann bei y = 100 und war 744 px hoch — es füllte
// den ganzen Schirm und verdeckte mit 25 Treffern den gesamten Gesetzestext
// (dieselbe Wurzel wie Ä19). Ein Bottom-Sheet ist unten angeschlagen und wächst
// nach oben, nur so weit es darf. `--leser-v3-panel-max` deckelt es auf 55 % der
// Fläche: darüber bleibt der gelesene Artikel stehen — das ist der ganze Sinn
// eines Blatts gegenüber einem Vollbild-Dialog. Anatomie (Griffleiste zuoberst,
// obere Rundung, Rand nur oben, EIN Scroller, `overscroll-contain`) ist Zeichen
// für Zeichen die des Gliederungs-Blatts. Eine GETEILTE `SheetHuelle` bleibt
// H5-Auflage: `GliederungSheet` liegt in `parts/` und ist unter FL-4 eingefroren
// (Herleitung im Vollzugsvermerk H3, «Sheet-Anatomie zweimal»).
//
// ── DIE RANDLASCHE IST WEG (Ä53/Ä56, gemessen — Herleitung in `LeserPanelOeffner`) ─
// Sie lag @390 mit 16 px IM Normtext und @1024 mit 4 px; wo sie nicht überlappte
// (@1440), war sie das wortgleiche Doppel des Kopf-Zählers. Der Öffner steht
// jetzt genau einmal je Zuschnitt: im Kopf (`voll`/`kompakt`) bzw. im
// «···»-Menü (`mini`) — dieses Bauteil rendert keinen Öffner mehr.

/** Höhe des unten angeschlagenen Blatts: 55 % der Lesefläche (Ä55).
 *
 *  WARUM 55 UND NICHT 60 ODER 100: über dem Blatt müssen mindestens ein
 *  Artikel-Kopf und zwei Absätze stehen bleiben, sonst ist das Blatt ein
 *  Vollbild-Dialog mit Rundung. Gemessen @390 (StPO): Artikelhöhe ~348 px bei
 *  844 px Fläche — 45 % Restfläche = 380 px trägt genau das. Als CSS-Variable und
 *  nicht als Klassen-Literal, damit BEIDE Zweige (Pane und Einzelansicht) aus
 *  EINER Zahl rechnen; `dvh` bzw. `%`, weil der Pane-Zweig relativ zur
 *  Overlay-Schicht liegt und nicht zum Fenster. */
const BLATT_ANTEIL = 55;

export function LeserPanelZone({
  form, panelId, paneZiel, paneRolle, zustand, bezuege, erlassKey, quelleUrl, normZitat,
  artikelLabel, bestimmungsWort, aktArtikel, steckbrief,
}: {
  /** Gestalt des Blatts — `panelForm(stufe, vollflaechig)` im Rahmen entscheidet. */
  form: 'rechts' | 'unten';
  /** Id der Fläche. Kommt vom RAHMEN, nicht aus einem lokalen `useId` (A3): die
   *  Öffner stehen ausserhalb dieser Datei und brauchen dieselbe Id für ihr
   *  `aria-controls` — zwei `useId` hätten zwei Ids ergeben, und eine davon
   *  zeigte ins Leere (axe: `aria-valid-attr-value`). */
  panelId: string;
  /** Overlay-Wurzel des Panes (nur im Pane gesetzt) — dieselbe Schicht, in die
   *  das Gliederungs-Blatt portaliert (§5, H2-Befund: die Rolle wandert MIT). */
  paneZiel: HTMLElement | null;
  paneRolle: 'primaer' | 'sekundaer';
  zustand: PanelZustand;
  bezuege: PanelBezuege;
  erlassKey: string | undefined;
  quelleUrl: string;
  normZitat: string;
  artikelLabel: string | null;
  bestimmungsWort: BestimmungsWort;
  aktArtikel: string | null;
  /** Der Erlass-Steckbrief als Tafel — oder `null`, wenn er gerade OFFEN in der
   *  Leiste steht. Die Weiche trifft der Rahmen (er kennt Spalte und Blatt),
   *  nicht diese Datei (§3): sie ordnet an, sie entscheidet nicht. */
  steckbrief?: ReactNode;
}) {
  const titelId = `${panelId}-titel`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const klassen = useBezugKlassen();
  const kantone = useBezugKantone();
  const { offen, reiter, setReiter, schliesse } = zustand;

  // Im Pane ist das Blatt IMMER modal (es beansprucht die ganze Pane-Fläche);
  // in der Einzelansicht entscheidet die Gestalt. `imPaneBlatt` ist die
  // Portal-Frage, `modal` die Bedien-Frage — bis zum Nachzug waren beide
  // dieselbe Bedingung, und genau daran hing Ä52.
  const imPaneBlatt = paneZiel != null;
  const modal = imPaneBlatt || form === 'unten';

  usePopoverAutoZu({
    offen, schliesse, wrapRef, panelRef,
    modus: modal ? 'blatt' : 'beiwerk',
    // Die Öffner liegen ausserhalb von `wrapRef` (Kopfzeile, «Ansicht ▾»-Menü) —
    // ohne diese Ausnahme schlösse ihr `pointerdown` das Panel, das ihr `click`
    // gleich darauf wieder öffnete (Herleitung in `usePopoverAutoZu`).
    aussenAusnahme: OEFFNER_SELEKTOR,
  });

  // Nachladen: erst wenn das Panel einmal offen war (Begründung in
  // `panelKontextLaden`). Die Hooks laufen unbedingt — das GATE ist ihr Argument,
  // nicht ein `if` um den Aufruf.
  const revisionen = useRevisionen(erlassKey, zustand.jeGeoeffnet);
  const materialien = useMaterialien(erlassKey, zustand.jeGeoeffnet);

  const inhalt = {
    // ── Steckbrief (H4-Vorbereitung II) ──────────────────────────────────────
    // `null` heisst hier NICHT «kein Steckbrief», sondern «er steht bereits
    // sichtbar in der Leiste» — der Rahmen entscheidet das, weil nur er die Lage
    // kennt (Spalte offen? Gliederungs-Blatt offen?). Der Reiter bleibt in beiden
    // Fällen an derselben Stelle: eine Reiter-Leiste, die je nach Fensterbreite
    // drei oder vier Fächer hat, wäre schlechter vorhersagbar als eine, die
    // immer vier hat und in einem davon auf den offenen Ort verweist (Kap. 4d,
    // «drei benannte Reiter sind vorhersagbar»).
    // KEIN zweiter Steckbrief: die Zusage «die Warnung steht genau einmal»
    // (Ä28) hängt daran, dass die Angaben zu jedem Zeitpunkt an GENAU EINER
    // Stelle im DOM stehen.
    steckbrief: steckbrief ?? (
      <p data-v3-panel-steckbrief-verweis className="px-2.5 py-2 text-body-s leading-snug text-ink-500">
        Der Steckbrief steht offen in der Gliederungs-Leiste — dort unter «Übersicht».
      </p>
    ),
    entscheide: (
      <PanelEntscheide
        kanten={aktArtikel ? bezuege.bezuegeFuer(aktArtikel)?.kanten : undefined}
        normZitat={normZitat} artikelLabel={artikelLabel} bestimmungsWort={bestimmungsWort}
        // A1: das Lade-ENDE kommt aus der Hook, die den Fetch kennt — nicht aus
        // dem Klassen-Zähler (der bei einem Erlass ohne Shard für immer leer ist).
        geladen={bezuege.geladen}
        klassen={klassen} kantone={kantone} kantoneVerfuegbar={bezuege.kantoneVerfuegbar}
        klassenImErlass={bezuege.klassenImErlass} histogramm={bezuege.histogramm} bereich={bezuege.bereich}
        onKlassen={setzeBezugKlassen} onKantone={setzeBezugKantone}
        onBereich={(von, bis) => setzeBezugZeit(von, bis)} />
    ),
    aenderungen: <PanelAenderungen stand={revisionen} quelleUrl={quelleUrl} />,
    materialien: <PanelMaterialien stand={materialien} quelleUrl={quelleUrl} />,
  } as const;

  // ── Die Fläche ────────────────────────────────────────────────────────────
  // Anschlag-Kante und Deckel je Gestalt. Alle drei Zweige sind `fixed` bzw.
  // `absolute`, brauchen also keinen Platz im Fluss (§15/2, CLS 0).
  const flaeche = form === 'rechts' && !imPaneBlatt
    // D · rechts angeschlagen, von der Kopf-Unterkante bis zum Fensterboden.
    ? {
      klassen: 'fixed bottom-0 right-0 z-50 w-[22rem] max-w-[calc(100vw-2rem)] p-2',
      stil: { top: 'var(--nt-stick)' } as CSSProperties,
    }
    : imPaneBlatt
      // Pane · unten angeschlagen in der Overlay-Schicht (die den Pane deckt).
      ? {
        klassen: 'pointer-events-auto absolute inset-x-0 bottom-0 z-50',
        stil: { maxHeight: `${BLATT_ANTEIL}%` } as CSSProperties,
      }
      // H · echtes Bottom-Sheet: unten angeschlagen, gedeckelt, Artikel bleibt oben.
      : {
        klassen: 'fixed inset-x-0 bottom-0 z-50',
        stil: { maxHeight: `${BLATT_ANTEIL}dvh` } as CSSProperties,
      };

  const blatt = (
    <div ref={wrapRef} data-v3-panel-spur="blatt"
      data-v3-pane={paneRolle}
      // `display: contents` — KEIN Zierrat, sondern der Grund, warum das Blatt
      // im Grid des Rahmens keine Spur erzeugt: alle Kinder sind `fixed` bzw.
      // `absolute`, der Träger selbst darf darum keine Box haben. Ein
      // gewöhnliches `div` als Grid-Kind hätte eine implizite dritte Spalte samt
      // `gap-8` daneben aufgezogen — 32 px Leerraum, die niemand angefordert hat
      // (derselbe Mechanismus, den der Rahmen für Toast/Weiterlesen beschreibt).
      // Die DOM-Vorfahrenkette bleibt unberührt: `data-v3-pane` trägt weiter
      // (H2-Befund), und die CSS-Variable unten erbt an die Kinder.
      className="contents"
      // Ä5: der BEHÄLTER nennt seine Fläche (dieselbe Zusage wie beim
      // Gliederungs-Blatt) — sonst malte ein klebender Sockel darin `paper` auf
      // ein `paper-raised`-Blatt.
      style={{ '--leser-leiste-flaeche': 'var(--paper-raised)' } as CSSProperties}>
      {offen && (
        <>
          {/* Der Scrim gehört zum MODALEN Blatt. Auf D gibt es keinen — dort ist
              das Panel Beiwerk, und ein Scrim hätte den Lesetext, den es
              erläutert, hinter einer Scheibe gezeigt (Ä52). */}
          {modal && (
            <div className={imPaneBlatt ? 'pointer-events-auto absolute inset-0 z-40 bg-ink-900/30' : 'fixed inset-0 z-40 bg-ink-900/30'}
              onClick={schliesse} aria-hidden />
          )}
          <div
            // `role="dialog"` nur, wo es einer IST. Das Beiwerk ist eine benannte
            // REGION: ein Dialog ohne Fokus-Falle und ohne Modalität wäre die
            // Rollen-Lüge, die §8 an anderer Stelle («ehrliche Disclosure statt
            // role=menu») schon verboten hat.
            role={modal ? 'dialog' : 'region'}
            aria-modal={modal && !imPaneBlatt ? true : undefined}
            aria-labelledby={titelId}
            data-v3-panel-form={form}
            data-v3-panel-modal={modal ? 'ja' : 'nein'}
            className={`${flaeche.klassen} flex flex-col`}
            style={flaeche.stil}>
            <LeserPanel panelId={panelId} titelId={titelId} artikelLabel={artikelLabel}
              bestimmungsWort={bestimmungsWort}
              reiter={reiter} setReiter={setReiter} inhalt={inhalt}
              onSchliessen={schliesse} panelRef={panelRef}
              // Griffleiste NUR am unten angeschlagenen Blatt: sie ist das Zeichen
              // für «von unten wischbar» (dieselbe Geste und Optik wie im
              // Gliederungs-Blatt, §5). Am rechten Rand wäre sie ein Versprechen
              // ohne Geste (§8).
              kopfExtra={form === 'unten'
                ? <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line" />
                : undefined} />
          </div>
        </>
      )}
    </div>
  );

  return paneZiel ? createPortal(blatt, paneZiel) : blatt;
}
