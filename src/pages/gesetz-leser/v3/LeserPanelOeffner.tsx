import { oeffnerLabel, oeffnerName, zaehlerAttribut } from './panelModell';

// ─── Der Öffner des Panels — EINER je Zuschnitt (H3, F8; Nachzug Ä46/Ä49) ─────
//
// ═══ DIE RANDLASCHE IST GESTRICHEN — GEMESSEN, NICHT ENTSCHIEDEN ═════════════
//
// F8-Entscheid David 16.8.2026 lautete «V1, a, Lasche behalten»: ein Zähler in
// der Kopfzeile UND eine Randlasche im Seitenrand. Am GEBAUTEN Stand hält die
// Prämisse dieses Entscheids an keiner Breite (gemessen 17.8.2026, StPO):
//
//   Breite   Artikel-Rechtskante   Lasche (w-9 = 36 px)   Überlappung
//   ──────────────────────────────────────────────────────────────────
//   390 px   x = 370               x = 354 … 390          16 px IM Normtext
//   1024 px  x = 992               x = 988 … 1024          4 px IM Normtext
//   1440 px  x = 1200              x = 1404 … 1440         keine
//
// Bei 1024 px lässt die Lesespalte zwischen ihrer Kante und dem Rand des Lesers
// **8 px** — eine 36 px breite Schiene passt dort nicht, und sie passt auch
// nirgends unterhalb von ~1200 px. Die Design-Grundlage (Kap. 6) erlaubt im
// Lesekörper «**null** Icons ausser dem Entscheid-Zähler», und dieser Zähler ist
// der am ARTIKEL (Beiwerk-Zone, S2) — nicht eine schwebende Schiene über dem
// Text. Wo die Lasche NICHT überlappte (@1440), war sie zudem das wortgleiche
// Doppel des Kopf-Zählers: fünf Elemente in der Kopfzeile, zwei Knöpfe mit
// identischem Accessible-Name für dieselbe Fläche (Ä49).
//
// DARAUS DIE NEUE ORDNUNG — GENAU EIN ÖFFNER JE ZUSCHNITT:
//
//   Zuschnitt   Öffner                                  Grund
//   ────────────────────────────────────────────────────────────────────────────
//   voll        Zähler in der Kopfzeile                 Platz ist da, Zahl ist da
//   kompakt     Zähler in der Kopfzeile                 dito
//   mini        Eintrag im «···»-Menü                   Kopfzeile ist bei 4 (Kap. 6)
//   alle        Eintrag im «Ansicht ▾»/«···»-Menü       F8-Weg, wenn der Schalter aus ist
//   alle        Taste «r»                               F8-Weg (Kap. 4h)
//
// Der Menü-Eintrag steht auf JEDEM Zuschnitt und in JEDEM Pane (A2) — er ist der
// Weg, den Davids F8-Regel ausdrücklich offen halten will («Panel bleibt über
// ‹Ansicht ▾› und Tastatur erreichbar»), und auf `mini` ist er der einzige
// sichtbare. Die Abweichung von «Lasche behalten» ist im Vollzugsvermerk als
// §7-Abweichung ausgewiesen und wartet auf Davids Bestätigung.
//
// ── DIE REGEL DAVIDS, UND WO SIE STEHT ──────────────────────────────────────
// «Rechtsprechung im Text» AUS ⇒ der Zähler verschwindet. Diese Datei prüft das
// NICHT: sie wird dann gar nicht gerendert. Die Entscheidung liegt an genau
// einer Stelle (`panelModell.oeffnerSichtbar`) — zwei Stellen, die dieselbe
// Option lesen, hätten irgendwann zwei Antworten. Der MENÜ-Eintrag bleibt in
// jeder Stellung: «aus» heisst «ich will keinen Hinweis sehen», nicht «ich
// verzichte auf den Zugang».
//
// ── WARUM DER ZÄHLER AUF DEM HANDY-ZUSCHNITT FEHLT (Ä11) ────────────────────
// Design-Grundlage Kap. 6: «Kopfzeile im Ruhezustand ≤ 4 Elemente». Auf `mini`
// stehen dort schon Ort · ☰ · ··· · ✕. Die Zuordnung steht in
// `kopfElemente(stufe).panel`, damit sie eine prüfbare Aussage über einen
// Rückgabewert ist und nicht über abwesenden Code (§6.7).

/** Zähler in der Kopfzeile: «⚖ 14 Entscheide». Ohne bekannte Zahl «⚖ Rechtsprechung». */
export function PanelZaehler({ anzahl, artikelLabel, offen, panelId, onKlick }: {
  anzahl: number | null;
  artikelLabel: string | null;
  offen: boolean;
  /** Id der Fläche — nur im offenen Zustand gesetzt (Bug-Check B3, H1): im
   *  geschlossenen Zustand existiert sie nicht, und eine kaputte Id-Referenz
   *  meldet axe als `aria-valid-attr-value`.
   *
   *  A3 (H3-Nachzug): der RAHMEN reicht sie herein. Bis zum Nachzug entstand sie
   *  in `LeserPanelZone` per `useId` und wurde nie durchgereicht — `aria-controls`
   *  war am Kopf-Zähler auf JEDER Desktop-Breite `null` (gemessen @1024/@1440). */
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
      // A3: der Öffner ist für die Aussenklick-Regel des Panels kein «Aussen».
      // Sammel-Marker statt Aufzählung zweier Selektoren (`OEFFNER_SELEKTOR` in
      // `panelModell`), damit ein dritter Öffner nicht vergessen werden kann.
      data-v3-panel-oeffner
      data-v3-panel-anzahl={zaehlerAttribut(anzahl)}
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
