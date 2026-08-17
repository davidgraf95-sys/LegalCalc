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
// ZWEI MODI, EINE HARTE REGEL: «im Pane ist das Panel ein Sheet über dem Pane,
// auf H ein Bottom-Sheet, auf D rechts 22 rem» — NIE drei vertikale Flächen in
// einem Pane (Design-Grundlage Kap. 8 Nr. 3). Welcher Modus gilt, entscheidet
// der Rahmen: nur er darf `imPane` lesen und nur er kennt die gemessene Breite
// (Fundament-Sonde `leser-v3-fundament.test.ts`). Diese Datei rendert, was ihr
// gesagt wird (§3).
//
//   spalte  Angedockte Spalte im DREI-Spalten-Grid des Rahmens. NICHT modal: der
//           Lesetext daneben bleibt lesbar und bedienbar (kein Fokus-Fang, kein
//           Aussenklick-Schliessen — Herleitung in `usePopoverAutoZu`).
//   blatt   Sheet über der Fläche: auf H von unten, im Pane in der
//           Overlay-Schicht des Panes. Modal, mit Fokus-Fang und Überlagerung.
//
// ── DIE LASCHE UND DIE SPALTE TEILEN DIE SPUR (§15/2, CLS) ──────────────────
// Im `spalte`-Modus hält der Rahmen die dritte Grid-Spur IMMER offen: 2.25 rem
// geschlossen, 22 rem offen. Die Lasche steht in der schmalen Spur, das Panel in
// der breiten — dieselbe Bauart, die David am 16.8. für die Gliederung links
// entschieden hat («das Grid bleibt stehen und die linke Spalte wird zur
// schmalen Schiene»). Der Lesetext behält dabei sein Mass: die Spalten-Schwelle
// des Rahmens ist so gesetzt, dass 40 rem Lesebreite auch im offenen Zustand
// Platz haben — das Öffnen verschiebt den Textblock, es bricht ihn nicht neu um.
//
// Im `blatt`-Modus liegt die Lasche am rechten Rand, ausserhalb des Flusses
// (`fixed` bzw. `absolute` in der Pane-Overlay-Schicht) — dort kostet sie keine
// Spur und keinen Layout-Sprung.

export function LeserPanelZone({
  modus, paneZiel, paneRolle, zustand, bezuege, erlassKey, quelleUrl, normZitat, artikelLabel, aktArtikel, zaehler,
}: {
  modus: 'spalte' | 'blatt';
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

  usePopoverAutoZu({ offen, schliesse, wrapRef, panelRef, modus });

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

  // ── `spalte`: Lasche ODER Panel in derselben Grid-Spur ─────────────────────
  if (modus === 'spalte') {
    return (
      <div ref={wrapRef} data-v3-panel-spur="spalte" className="sticky self-start" style={{ top: 'var(--nt-stick)' }}>
        {offen
          ? (
            <div role="region" aria-labelledby={titelId}
              // Höhe wie die Gliederungs-Spalte gegenüber, aus derselben
              // Variablen-Kette (`--nt-stick`) — sonst liefen die beiden Ränder
              // des Lesers auseinander (Risiko R1, LM-003).
              style={{ maxHeight: 'calc(100vh - var(--nt-stick) - 1.5rem)' } as CSSProperties}
              className="flex min-h-0 flex-col">
              <LeserPanel panelId={panelId} titelId={titelId} artikelLabel={artikelLabel}
                reiter={reiter} setReiter={setReiter} inhalt={inhalt}
                onSchliessen={schliesse} panelRef={panelRef} />
            </div>
          )
          : lasche}
      </div>
    );
  }

  // ── `blatt`: Lasche am Rand + Sheet über der Fläche ────────────────────────
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
      {lasche && <div className={`${imPaneBlatt ? 'absolute' : 'fixed'} right-0 top-1/3 z-30`}>{lasche}</div>}
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
              onSchliessen={schliesse} panelRef={panelRef} variante="blatt"
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
