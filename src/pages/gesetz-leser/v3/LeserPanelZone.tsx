import { useId, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { setzeBezugKantone, setzeBezugKlassen, setzeBezugZeit, useBezugKantone, useBezugKlassen } from '../leserOptionen';
import { LeserPanel } from './LeserPanel';
import { PanelLasche } from './LeserPanelOeffner';
import { PanelEntscheide } from './PanelEntscheide';
import { PanelAenderungen } from './PanelAenderungen';
import { PanelMaterialien } from './PanelMaterialien';
import { useMaterialien, useRevisionen } from './panelKontextLaden';
import { shardGeladen, type PanelBezuege, type PanelZustand } from './panelModell';
import { usePopoverAutoZu } from './usePopoverAutoZu';

// ─── WO das Panel steht — und wo die Lasche (H3, Kap. 4d) ────────────────────
//
// EIN Blatt (Sheet) über der Fläche: auf H von unten, im Pane in der
// Overlay-Schicht des Panes. Modal, mit Fokus-Fang und Überlagerung.
//
// WARUM KEINE ANGEDOCKTE SPALTE AUF D: die Rechnung steht im Rahmen
// (`LeserRahmenV3`, «KEINE DRITTE SPUR») — der Seitenrahmen ist auf 70 rem
// gedeckelt (gemessen 1072 px auf jeder Desktop-Breite), 18 + 40 + 22 rem
// brauchen 1344. Ein Zweig, den keine Breite erreicht, ist toter Code (§17).
// Der Blatt-Modus erfüllt die harte Regel «NIE drei vertikale Flächen» ohnehin
// in jeder Lage, nicht nur im Pane.
//
// Die Lasche liegt am rechten Rand, ausserhalb des Flusses (`fixed` bzw.
// `absolute` in der Pane-Overlay-Schicht) — dort kostet sie keine Grid-Spur und
// keinen Layout-Sprung (§15/2, CLS).

export function LeserPanelZone({
  paneZiel, paneRolle, zustand, bezuege, erlassKey, quelleUrl, normZitat, artikelLabel, aktArtikel, zaehler,
}: {
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
  aktArtikel: string | null;
  zaehler: number | null;
}) {
  const panelId = useId();
  const titelId = `${panelId}-titel`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const klassen = useBezugKlassen();
  const kantone = useBezugKantone();
  const { oeffnerSichtbar, offen, reiter, setReiter, schliesse, umschalten } = zustand;

  usePopoverAutoZu({ offen, schliesse, wrapRef, panelRef, modus: 'blatt' });

  // Nachladen: erst wenn das Panel einmal offen war (Begründung in
  // `panelKontextLaden`). Die Hooks laufen unbedingt — das GATE ist ihr Argument,
  // nicht ein `if` um den Aufruf.
  const revisionen = useRevisionen(erlassKey, zustand.jeGeoeffnet);
  const materialien = useMaterialien(erlassKey, zustand.jeGeoeffnet);

  // F8: ohne sichtbaren Öffner GAR KEINE Lasche — das per `r` geöffnete Panel
  // rendert dann trotzdem (`panelModell`: `offen` hängt nicht an `oeffnerSichtbar`).
  const lasche = oeffnerSichtbar
    ? (
      <PanelLasche anzahl={zaehler} artikelLabel={artikelLabel} offen={offen}
        panelId={offen ? panelId : undefined} onKlick={umschalten} />
    )
    : null;

  const inhalt = {
    entscheide: (
      <PanelEntscheide
        kanten={aktArtikel ? bezuege.bezuegeFuer(aktArtikel)?.kanten : undefined}
        normZitat={normZitat} artikelLabel={artikelLabel}
        geladen={shardGeladen(bezuege.klassenImErlass)}
        klassen={klassen} kantone={kantone} kantoneVerfuegbar={bezuege.kantoneVerfuegbar}
        klassenImErlass={bezuege.klassenImErlass} histogramm={bezuege.histogramm} bereich={bezuege.bereich}
        onKlassen={setzeBezugKlassen} onKantone={setzeBezugKantone}
        onBereich={(von, bis) => setzeBezugZeit(von, bis)} />
    ),
    aenderungen: <PanelAenderungen stand={revisionen} quelleUrl={quelleUrl} />,
    materialien: <PanelMaterialien stand={materialien} quelleUrl={quelleUrl} />,
  } as const;

  // ── Lasche am Rand + Sheet über der Fläche ─────────────────────────────────
  const imPaneBlatt = paneZiel != null;
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
      {/* Die Lasche: am rechten Rand, senkrecht, ausserhalb des Flusses. Auf der
          Höhe des Lesetexts, nicht mittig im Fenster — dort greift der Daumen. */}
      {/* `pointer-events-auto` im Pane ist KEIN Zierrat: die Overlay-Schicht des
          Panes steht auf `pointer-events: none`, damit sie den Pane-Inhalt unter
          sich nicht blockiert. Ohne die Rücknahme war die Lasche sichtbar, aber
          nicht klickbar — der Pane-Inhalt fing jeden Klick ab (gemessen 17.8.2026
          im Split @1440: «subtree intercepts pointer events»). Dieselbe Rücknahme
          setzt das Gliederungs-Blatt an seiner Überlagerung. */}
      {lasche && (
        <div className={`${imPaneBlatt ? 'pointer-events-auto absolute' : 'fixed'} right-0 top-1/3 z-30`}>
          {lasche}
        </div>
      )}
      {offen && (
        <>
          <div className={imPaneBlatt ? 'pointer-events-auto absolute inset-0 z-40 bg-ink-900/30' : 'fixed inset-0 z-40 bg-ink-900/30'}
            onClick={schliesse} aria-hidden />
          <div role="dialog" aria-modal={imPaneBlatt ? undefined : true} aria-labelledby={titelId}
            className={`${imPaneBlatt
              ? 'pointer-events-auto absolute inset-x-0 bottom-0 top-8 z-50'
              : 'fixed inset-x-0 bottom-0 z-50'} flex flex-col`}
            style={imPaneBlatt ? undefined : { top: 'var(--leser-kopf-h)', maxHeight: 'calc(100dvh - var(--leser-kopf-h))' }}>
            <LeserPanel panelId={panelId} titelId={titelId} artikelLabel={artikelLabel}
              reiter={reiter} setReiter={setReiter} inhalt={inhalt}
              onSchliessen={schliesse} panelRef={panelRef}
              // Griffleiste wie im Gliederungs-Blatt: dieselbe Geste, dieselbe
              // Optik — ein zweites Sheet-Idiom wäre die schlechtere Wucherung.
              kopfExtra={<div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line" />} />
          </div>
        </>
      )}
    </div>
  );

  return paneZiel ? createPortal(blatt, paneZiel) : blatt;
}
