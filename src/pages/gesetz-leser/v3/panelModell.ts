import { useCallback, useState } from 'react';
import { useBezuege } from '../bezuegeLaden';
import { useLeserOptionen } from '../leserOptionen';
import { STATUS_RANG, type BezugStatus } from '../../../lib/verzahnung/facetten';
import type { Bezug } from '../../../lib/rechtsprechung/bezuege';

// ─── Modell des Rechtsprechungs-/Kontext-Panels (FAHRPLAN-LESER-V3 Kap. 4d, H3) ─
//
// Rechnende und zustandshaltende Hälfte des Panels — ohne JSX, damit die drei
// Zusagen ohne Browser prüfbar sind (§3/§6): der Zähler-Wortlaut, die
// Reiter-Ordnung und die Gruppierung der Kanten.
//
// ── NACHLADEN: DIE EINE STELLE, AN DER ES ENTSCHIEDEN WIRD (Kap. 7) ─────────
// `useBezuege` bekommt den Erlass-Key ERST, nachdem das Panel einmal offen war.
// Ohne Key läuft ihr Lade-Effekt in die frühe Rückgabe (`if (!erlassKey) return`),
// es geht also kein Byte des Bezugs-Shards über die Leitung, solange niemand das
// Panel aufzieht. Gemessen: BGG 300.2 KB gzip, BV 123.3, StPO 102.0
// (`check:perf-budget` führt die drei als eigene Budget-Zeilen).
//
// `jeGeoeffnet`, NICHT `offen`: Schliessen wirft die Daten nicht weg. Ein Panel,
// das bei jedem Zu/Auf neu lädt, wäre teurer als das eager-Laden, das wir gerade
// abgeschafft haben — und der Zähler verlöre seine Zahl wieder (§8).
//
// DIE HÜLLE BLEIBT DIE SELBE DATENLOGIK: geladen, gefiltert und gezählt wird
// weiterhin ausschliesslich in `bezuegeLaden`/`bezugAuswahl`/`bezugZeit`/
// `lib/rechtsprechung/bezuege`. H3 verschiebt den ZEITPUNKT und den ORT der
// Darstellung, nicht die Rechnung (§5).

export type PanelReiter = 'entscheide' | 'aenderungen' | 'materialien';

/** Reiter-Ordnung UND Beschriftung aus EINER Quelle (§5): ein Reiter, der hier
 *  fehlt, existiert nirgends; einer, der hier steht, ist überall gleich benannt.
 *  Reihenfolge = die Reihenfolge der Fragen am Gesetzesartikel: wie wird er
 *  ausgelegt (Entscheide) · wie ist er geworden (Änderungen) · woher kommt er
 *  (Materialien). */
export const PANEL_REITER: readonly { id: PanelReiter; label: string; titel: string }[] = [
  { id: 'entscheide', label: 'Entscheide', titel: 'Gerichtsentscheide zu diesem Artikel' },
  { id: 'aenderungen', label: 'Änderungen', titel: 'Änderungserlasse dieses Erlasses' },
  { id: 'materialien', label: 'Materialien', titel: 'Botschaften und Vernehmlassungen zu diesem Erlass' },
];

/**
 * Beschriftung des Panel-Öffners.
 *
 * ── §8: KEINE ZAHL, DIE WIR NICHT HABEN ────────────────────────────────────
 * `null` heisst «noch nicht geladen» und ergibt «Rechtsprechung» ohne Zahl —
 * NICHT «0 Entscheide». Der Bezugs-Shard wird erst beim Öffnen geholt (s. o.),
 * und ein Korpus führt kein leichtes Zähl-Sidecar, aus dem die Zahl vorher
 * bekannt sein könnte. Eine 0 an dieser Stelle wäre eine Behauptung über den
 * Bestand, die wir aus Unwissen aufstellen.
 *
 * `0` heisst «geladen, dieser Artikel führt keine Entscheide» und ergibt
 * ebenfalls KEINEN Zähler: ein «0 Entscheide →» ist genau der leere Zähler, den
 * die Erlass-Neutralitäts-Regel verbietet (Kantonserlasse ohne Bezüge).
 * Der Öffner bleibt in beiden Fällen da — er führt zu drei Reitern, nicht nur
 * zu den Entscheiden.
 */
export function oeffnerLabel(anzahl: number | null): string {
  if (anzahl === null || anzahl <= 0) return 'Rechtsprechung';
  return anzahl === 1 ? '1 Entscheid' : `${anzahl} Entscheide`;
}

/**
 * Maschinell lesbarer Zähler am Öffner (`data-v3-panel-anzahl`).
 *
 * DIESELBE WAHRHEIT WIE DAS LABEL, nicht eine zweite: `undefined` überall, wo
 * `oeffnerLabel` keine Zahl schreibt. Sonst stand am Kantonserlass sichtbar
 * «Rechtsprechung» und im Attribut «0» — zwei Aussagen an einem Knopf, und die
 * maschinelle war die falsche (gefunden beim ersten Lauf von
 * `leser-v3-panel-facetten` (d), 17.8.2026: «Öffner zeigt ‹0›»).
 */
export function zaehlerAttribut(anzahl: number | null): number | undefined {
  return anzahl !== null && anzahl > 0 ? anzahl : undefined;
}

/** Voller Accessible-Name des Öffners — sagt, WAS sich öffnet und WORAUF sich
 *  die Zahl bezieht (der Zähler allein ist zweideutig: Artikel oder Erlass?). */
export function oeffnerName(anzahl: number | null, artikelLabel: string | null): string {
  const ort = artikelLabel ? ` zu ${artikelLabel}` : '';
  if (anzahl === null) return `Rechtsprechung und Kontext${ort} öffnen`;
  if (anzahl <= 0) return `Rechtsprechung und Kontext${ort} öffnen — keine Entscheide erfasst`;
  return `Rechtsprechung und Kontext${ort} öffnen — ${anzahl} ${anzahl === 1 ? 'Entscheid' : 'Entscheide'}`;
}

/**
 * Kanten nach Instanz-Klasse gruppieren, Klassen nach `STATUS_RANG`.
 *
 * Dieselbe Ordnung wie am Artikelfuss der Ist-Hülle (`BezuegeZeile`) und aus
 * demselben Grund (§8, `facetten.ts`): «Wer die drei in EINE Liste kippt und nur
 * nach Datum sortiert, behauptet stillschweigend Gleichrang.» Die Reihenfolge
 * INNERHALB einer Klasse ist die Shard-Ordnung (chronologisch neu → alt) — hier
 * wird sie erhalten, nie neu gesetzt (§5: keine zweite Sortier-Wahrheit).
 */
export function gruppiereKanten(kanten: readonly Bezug[]): [BezugStatus, Bezug[]][] {
  const gruppen = new Map<BezugStatus, Bezug[]>();
  for (const b of kanten) {
    const liste = gruppen.get(b.facetten.status);
    if (liste) liste.push(b);
    else gruppen.set(b.facetten.status, [b]);
  }
  return [...gruppen.entries()].sort((a, b) => STATUS_RANG[a[0]] - STATUS_RANG[b[0]]);
}

export interface PanelZustand {
  /**
   * REGEL DAVID 16.8.2026 (V-0-Entscheid F8), an EINER Stelle: Schalter
   * «Rechtsprechung im Text» AUS ⇒ Zähler UND Randlasche weg.
   *
   * Der Schalter ist der umgewidmete `leitfaelle`-Schalter des «Ansicht ▾»
   * (Kap. 4f, seit H1). Er steuert in V3 nicht mehr eine Zeile im Lesetext — die
   * gibt es dort nicht mehr —, sondern die SICHTBARKEIT DER ÖFFNER. Das Panel
   * bleibt dabei erreichbar: über «Ansicht ▾» wieder einschaltbar und über die
   * Taste `r` (Kap. 4h, `LeserTastatur`) direkt aufziehbar. «Aus» heisst «ich
   * will keinen Rechtsprechungs-Hinweis sehen», nicht «ich verzichte auf den
   * Zugang».
   */
  oeffnerSichtbar: boolean;
  offen: boolean;
  /** War das Panel in dieser Sitzung schon einmal offen? Steuert das Nachladen. */
  jeGeoeffnet: boolean;
  reiter: PanelReiter;
  setReiter: (r: PanelReiter) => void;
  oeffne: (r?: PanelReiter) => void;
  schliesse: () => void;
  umschalten: () => void;
}

export function usePanelZustand(): PanelZustand {
  const oeffnerSichtbar = useLeserOptionen().leitfaelle === 'an';
  const [offen, setOffen] = useState(false);
  const [jeGeoeffnet, setJeGeoeffnet] = useState(false);
  const [reiter, setReiter] = useState<PanelReiter>('entscheide');

  const oeffne = useCallback((r?: PanelReiter) => {
    if (r) setReiter(r);
    setJeGeoeffnet(true);
    setOffen(true);
  }, []);
  const schliesse = useCallback(() => setOffen(false), []);
  const umschalten = useCallback(() => {
    setOffen((o) => {
      if (!o) setJeGeoeffnet(true);
      return !o;
    });
  }, []);

  // `offen` ist BEWUSST NICHT mit `oeffnerSichtbar` verrechnet. Die F8-Regel
  // nimmt die ÖFFNER weg, nicht den Zugang: «Panel bleibt über ‹Ansicht ▾› und
  // Tastatur erreichbar». Wer `r` drückt, während der Schalter aus ist, bekommt
  // das Panel — es hat dann nur keine Lasche und keinen Zähler, über die man es
  // wieder zumachen könnte, wohl aber sein eigenes ✕ und Esc.
  return { oeffnerSichtbar, offen, jeGeoeffnet, reiter, setReiter, oeffne, schliesse, umschalten };
}

/**
 * Bezugs-Daten des Panels — dieselbe Hook wie in der Ist-Hülle, nur mit
 * verzögertem Key (Begründung im Dateikopf).
 *
 * Rückgabe ist unverändert die von `useBezuege`; das Panel bekommt damit
 * `bezuegeFuer`, die verfügbaren Kantone, die Klassen-Zahlen des Erlasses und
 * das Jahres-Histogramm aus EINER Quelle.
 */
export type PanelBezuege = ReturnType<typeof useBezuege>;

export function usePanelBezuege(erlassKey: string | undefined, jeGeoeffnet: boolean): PanelBezuege {
  return useBezuege(jeGeoeffnet ? erlassKey : undefined);
}

/**
 * Trefferzahl am Öffner: Kanten des GELESENEN Artikels nach Facetten-Filter.
 *
 * `null` = wir wissen es nicht (Shard nicht geladen) ⇒ der Öffner zeigt keine
 * Zahl (§8, siehe `oeffnerLabel`). Die Unterscheidung «lädt noch» gegen «leer»
 * kann NICHT aus `bezuegeFuer` kommen: die Hook gibt in beiden Fällen
 * `undefined` zurück (Begründung dort). Sie kommt darum aus `geladen` — dem
 * Klassen-Zähler des Erlasses, der genau dann Einträge hat, wenn ein Shard
 * ausgewertet wurde.
 */
export function trefferZahl(
  bezuegeFuer: (artikel: string) => { kanten: readonly Bezug[] } | undefined,
  geladen: boolean,
  aktArtikel: string | null,
): number | null {
  if (!geladen || !aktArtikel) return null;
  return bezuegeFuer(aktArtikel)?.kanten.length ?? 0;
}

/**
 * Kurz-Zitat für den Fundstellen-Sprung («Art. 429 StPO»).
 *
 * MUSS ZEICHENGLEICH SEIN mit dem, was der Kern am Artikelfuss baut
 * (`ArtikelLeser`: `${labelMitBereich(e.artikelLabel, e.artikel)} ${erlass.kuerzel}`)
 * — sonst matcht der EntscheidLeser die zitierende Erwägung nicht mehr und der
 * Sprung landet am Seitenanfang. Der Scroll-Spy liefert genau dieses Label
 * (`artLabelByToken` in `inhalt-ableitungen` wendet `labelMitBereich` an), es
 * wird hier also NICHT neu gebildet, nur zusammengesetzt (§5).
 *
 * Ohne Leseposition bleibt das Kürzel allein — ein erfundenes «Art. 1» wäre eine
 * falsche Fundstellen-Angabe (§8).
 */
export function normZitat(artikelLabel: string | null, kuerzel: string): string {
  return artikelLabel ? `${artikelLabel} ${kuerzel}` : kuerzel;
}

/** Ist ein Bezugs-Shard ausgewertet? Einziges verlässliches «geladen»-Signal der
 *  Bezugs-Hook (§8, siehe `trefferZahl`). */
export function shardGeladen(klassenImErlass: Readonly<Record<string, unknown>>): boolean {
  return Object.keys(klassenImErlass).length > 0;
}
