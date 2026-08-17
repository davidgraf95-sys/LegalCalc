import { oeffnerLabel, oeffnerName } from './panelModell';

// ─── Die ZWEI Öffner des Panels — ein Zustand, zwei Orte (H3, F8) ────────────
//
// F8-Entscheid David 16.8.2026 («V1, a, Lasche behalten»): das Panel hat einen
// Zähler in der Kopfzeile UND eine Randlasche. Beide sind derselbe Knopf an
// verschiedenen Orten — darum stehen sie in EINER Datei und ziehen Beschriftung
// und Accessible-Name aus derselben reinen Funktion (`panelModell`), nie aus
// zwei Zeichenketten (§5).
//
// ── DIE REGEL DAVIDS, UND WO SIE STEHT ──────────────────────────────────────
// «Rechtsprechung im Text» AUS ⇒ Zähler UND Lasche weg. Diese Datei prüft das
// NICHT: sie wird dann gar nicht gerendert. Die Entscheidung liegt an genau
// einer Stelle (`LeserRahmenV3`, `panelSichtbar`) — zwei Stellen, die dieselbe
// Option lesen, hätten irgendwann zwei Antworten.
//
// ── WARUM DER ZÄHLER AUF DEM HANDY-ZUSCHNITT FEHLT (Ä11) ────────────────────
// Design-Grundlage Kap. 6: «Kopfzeile im Ruhezustand ≤ 4 Elemente». Auf `mini`
// stehen dort schon Ort · ☰ · ··· · ✕. Ein fünftes Element wäre genau die
// Icon-Flut, die Ä11 benennt — und der Öffner ist dort ohnehin besser am Rand:
// die Lasche liegt in der Daumenzone. Die Zuordnung selbst steht in
// `kopfElemente(stufe).panel`, damit sie eine prüfbare Aussage über einen
// Rückgabewert ist und nicht über abwesenden Code (§6.7).

/** Zähler in der Kopfzeile: «⚖ 14 Entscheide». Ohne bekannte Zahl «⚖ Rechtsprechung». */
export function PanelZaehler({ anzahl, artikelLabel, offen, panelId, onKlick }: {
  anzahl: number | null;
  artikelLabel: string | null;
  offen: boolean;
  /** Id der Fläche — nur im offenen Zustand gesetzt (Bug-Check B3, H1): im
   *  geschlossenen Zustand existiert sie nicht, und eine kaputte Id-Referenz
   *  meldet axe als `aria-valid-attr-value`. */
  panelId?: string;
  onKlick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onKlick}
      aria-expanded={offen}
      aria-controls={offen ? panelId : undefined}
      aria-label={oeffnerName(anzahl, artikelLabel)}
      title={oeffnerName(anzahl, artikelLabel)}
      data-v3-panel-zaehler
      data-v3-panel-anzahl={anzahl ?? undefined}
      className="lc-leiste-griff lc-leiste-griff-fest gap-1 px-1.5"
    >
      <span aria-hidden>⚖</span>
      {/* `tabular-nums` + `whitespace-nowrap`: die Zahl wechselt mit der
          Leseposition (Scroll-Spy). Proportionale Ziffern liessen den Knopf bei
          jedem Artikelwechsel um Bruchteile atmen und schöben die Nachbarn —
          eine Bewegung in der klebenden Kopfzeile, die niemand angefordert hat. */}
      <span className="num tabular-nums whitespace-nowrap">{oeffnerLabel(anzahl)}</span>
    </button>
  );
}

/**
 * Randlasche: derselbe Öffner am rechten Rand.
 *
 * SENKRECHTER ECHTER TEXT, kein Bild und kein `aria-label` als Ersatz für Inhalt
 * — dieselbe Bauart wie die Gliederungs-Schiene links (`writing-mode`), damit
 * die beiden Ränder des Lesers sich gleich verhalten und der Text vorlesbar und
 * durchsuchbar bleibt.
 */
export function PanelLasche({ anzahl, artikelLabel, offen, panelId, onKlick, className = '' }: {
  anzahl: number | null;
  artikelLabel: string | null;
  offen: boolean;
  panelId?: string;
  onKlick: () => void;
  /** Positionierung kommt vom Aufrufer (Schiene im Grid bzw. Rand im Blatt-Modus)
   *  — die Lasche selbst weiss nicht, wo sie hängt (§3). */
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onKlick}
      aria-expanded={offen}
      aria-controls={offen ? panelId : undefined}
      aria-label={oeffnerName(anzahl, artikelLabel)}
      title={oeffnerName(anzahl, artikelLabel)}
      data-v3-panel-lasche
      className={`flex min-h-11 w-9 flex-col items-center gap-2 rounded-md border border-line bg-paper py-3 text-micro text-ink-600 transition-colors hover:border-brass-300 hover:bg-paper-sunken/60 hover:text-brass-700 ${className}`}
    >
      <span aria-hidden className="text-base leading-none">⚖</span>
      <span className="num tabular-nums [writing-mode:vertical-rl] [text-orientation:mixed]">
        {oeffnerLabel(anzahl)}
      </span>
    </button>
  );
}
