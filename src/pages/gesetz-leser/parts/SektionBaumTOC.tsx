import { memo, type ReactNode } from 'react';
import { romanFrei, margLabel } from '../helpers';
import { merkeRuecksprungVonDom } from '../scrollAnker';
import type { GliederungsKnoten } from '../gliederungsModell';

// ═══ Gliederungsbaum der Seitenleiste (Zone B) ═══════════════════════════════
//
// W2·19-GLIEDERUNG · S4. Bau-Spec fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md
// §3.3 (Zeilen-Anatomie), §3.4 (Sonderknoten), §3.5 (Positionsmarke F5).
//
// EINGABE IST SEIT S4 DAS MODELL, NICHT MEHR DER ROHBAUM. Die Komponente
// rendert `GliederungsKnoten[]` aus `gliederungsModell.ts` — dort und nur dort
// werden Zählwerte, Bereiche, Einzelkind-Verdichtung, Vorspann-, Anhang- und
// gemischte Knoten bestimmt (§3 Schichtentrennung: hier lebt Darstellung, keine
// Ableitung). Der Vorteil ist nicht Eleganz, sondern Prüfbarkeit: die
// Entscheidungen sind ohne DOM unit-getestet (src/tests/gliederung-modell-w219).
//
// Der Schlüssel bleibt `sek-N`. Eine verdichtete Zeile trägt ihre
// zusammengefassten Ids in `k.ids`; Aktiv-Erkennung und Klapp-Zustand fragen
// deshalb immer die ganze Liste, nie nur `k.id`. Ohne das verlöre eine
// verdichtete Zeile ihre Markierung, sobald der Scroll-Spy eine INNERE Stufe
// meldet.

// Entscheid David 5.8.2026 («gliederung … standardmässig zugeklappt und erst auf
// klicken öffnen»): der Baum startet zu. Der Wert lebt seit S4 NICHT mehr hier,
// sondern als `startOffeneTiefe` im Modell — David hat den Entscheid am 8.8.2026
// für KLEINE Bäume (≤ 40 Zeilen) und den Artikel-Index moduliert (Spec §11
// Ziff. 1, Entscheid-Protokoll), und diese Unterscheidung kann nur das Modell
// treffen, das die Zeilenzahl kennt. Für grosse Bäume (OR/ZGB) liefert es
// weiterhin 0 = alles zu.

// ─── LM-155 · Tiefenführung (B4-N1) — was bleibt, was S4 ersetzt ─────────────
//
// BLEIBT (Mittel 1, «eine Sprache für beide Spalten»): die Ebenen-STIMME. Der
// Fliesstext unterscheidet amtliche Teil/Titel/Abschnitt (Display-Stimme) von
// randtitel-promoteter Feingliederung (ruhige Serif-Stimme, SektionKopf.tsx);
// der Baum spricht dieselbe Sprache. Der Gewinn ist die Wiedererkennung.
//
// BLEIBT (Mittel 3, Rhythmus): der Vorlauf der obersten Knoten, der die lange
// Liste in Blöcke fasst — statisch, also ohne Eigenbewegung (A33 «ruhige
// Gliederung»).
//
// ERSETZT (Mittel 2, Schrittweite): der KUMULIERTE Einzug mit zwei Schrittweiten
// (0.875 rem amtlich / 0.625 rem randtitel, Deckel 5 rem) weicht der
// Stufenleiter aus Spec §3.3 — 0 / 0.75 / 1.25 / 1.75 rem, ab Ebene 4 je
// +0.25 rem. Drei Gründe, deklariert statt beiläufig:
//   (a) Die Verdichtung der Einzelkind-Ketten (§3.3, im Modell) hat die leeren
//       Durchgangsstufen entfernt, für die die kumulative Zweitskala gedacht
//       war — eine Zeile ist jetzt eine echte Stufe.
//   (b) Der kumulative Weg hatte KEINEN harten Deckel je Ebene, nur die
//       5-rem-Klemme; in der 16-rem-Spalte lief die Textbreite bei sieben
//       Ebenen trotzdem gegen 9 rem. Die Leiter deckelt bei Ebene 6 auf
//       2.5 rem: ZGB Stufe 5 behält in der neuen 18-rem-Spalte > 13 rem.
//   (c) Ein reiner Tiefen-Ausdruck ist ohne Elternkontext berechenbar — die
//       Zeile wird damit zu einem memoisierbaren Bauteil (F3, s. u.).
// Und unverändert: KEINE Linie, kein Guide, kein «Gleisbett» im Baum (A28,
// David 12.7.2026 «das mit den linien funktioniert überhaupt nicht»).

/** Einzug-Leiter je Tiefe (rem). Ab Ebene 4 wächst sie in 0.25-rem-Schritten. */
const EINZUG_STUFEN = [0, 0.75, 1.25, 1.75];
const EINZUG_SCHRITT_TIEF = 0.25;
// Bewusst NICHT exportiert: `react-refresh/only-export-components` verlangt, dass
// eine Komponenten-Datei nur Komponenten exportiert. Die Leiter hat hier ohnehin
// keinen zweiten Konsumenten — bräuchte sie einen, gehörte sie in eine eigene Datei.
function einzugFuerTiefe(tiefe: number): number {
  if (tiefe < EINZUG_STUFEN.length) return EINZUG_STUFEN[tiefe];
  return EINZUG_STUFEN[EINZUG_STUFEN.length - 1] + (tiefe - (EINZUG_STUFEN.length - 1)) * EINZUG_SCHRITT_TIEF;
}

/**
 * Stimme einer Baum-Ebene: `form` (Grösse/Gewicht/Schriftfamilie) und `tinte`
 * getrennt, weil Aktiv-Zeile und Ahnen-Pfad die Tinte überschreiben und zwei
 * gleichrangige Tinten-Utilities in EINEM className sonst quellordnungs-abhängig
 * gewinnen würden (nicht deterministisch, §2). `pre` hebt den Enumerator-Vorsatz
 * («Erster Titel:») nur dort, wo die Ebene selbst nicht schon hebt.
 * Tinten enden bei ink-800: ink-900 bleibt der EINEN Positionsmarke vorbehalten.
 */
function ebenenStimme(randtitel: boolean, tiefe: number): { form: string; tinte: string; pre: string } {
  if (randtitel) return { form: 'text-xs font-serif font-normal', tinte: 'text-ink-500', pre: 'font-medium' };
  if (tiefe === 0) return { form: 'text-body-s font-semibold', tinte: 'text-ink-800', pre: '' };
  if (tiefe === 1) return { form: 'text-xs font-semibold', tinte: 'text-ink-700', pre: '' };
  if (tiefe === 2) return { form: 'text-xs font-medium', tinte: 'text-ink-700', pre: '' };
  return { form: 'text-xs font-normal', tinte: 'text-ink-600', pre: 'font-medium' };
}

/**
 * F5 Ahnen-Pfad (§3.5): Knoten oberhalb der Marke werden um GENAU EINE
 * Tintenstufe gehoben — keine Fläche, kein Fettschnitt. Der Fettschnitt ist die
 * belegte a9-CLS-Wurzel (bei 256 px Spaltenbreite brach er lange Labels um:
 * 42.5 px fett gegen 23.25 px normal), und eine zweite Fläche neben der Marke
 * hiesse wieder «mehrere Stellen sind aktiv». Die Abbildung ist explizit statt
 * gerechnet, damit nie eine Stufe entsteht, die es im Token-Satz nicht gibt.
 */
const AHNEN_TINTE: Record<string, string> = {
  'text-ink-500': 'text-ink-700',
  'text-ink-600': 'text-ink-800',
  'text-ink-700': 'text-ink-800',
  'text-ink-800': 'text-ink-800',
};

/**
 * Ist die Zeile aufgeklappt? Eine explizite Angabe (Klick oder Scroll-Spy) für
 * IRGENDEINE ihrer Ids gewinnt gegen den Modus-Default; liegt keine vor,
 * entscheidet die Ausnahme des Knotens (Anhang-Dominanz) bzw. die Start-Tiefe.
 */
function istOffen(k: GliederungsKnoten, offen: Record<string, boolean>, startOffeneTiefe: number): boolean {
  const zustaende = k.ids.map((id) => offen[id]).filter((v): v is boolean => v !== undefined);
  if (zustaende.length > 0) return zustaende.some(Boolean);
  return k.startOffen ?? k.tiefe < startOffeneTiefe;
}

/**
 * F5: welche EINE Zeile trägt die Positionsmarke?
 *
 * Die Spec sagt «der tiefste aktive Knoten». Das genügt als Regel nicht ganz,
 * denn der Nutzer darf einen Ast, in dem er gerade liest, von Hand zuklappen
 * (`manuellZuRef` — der Spy reisst ihn dann bewusst NICHT wieder auf). Läge die
 * Marke stur am tiefsten Knoten, verschwände sie in diesem Fall aus der
 * sichtbaren Leiste: der Leser stünde ohne Standort da, und der Selektor
 * `[data-toc] [data-toc-aktiv]` (a9-Sprungziel, a33-Ruhe-Messung) fände nichts
 * Bedienbares mehr. Darum: der tiefste aktive Knoten, der noch SICHTBAR ist —
 * man steigt den Aktiv-Pfad hinab, solange die Äste offen sind. Bei ganz
 * geöffnetem Pfad ist das exakt der tiefste Knoten (der Normalfall), sonst der
 * letzte sichtbare Vorfahre. In beiden Fällen genau EINE Marke.
 */
function findeMarke(
  knoten: GliederungsKnoten[], aktivPfad: string[], offen: Record<string, boolean>, startOffeneTiefe: number,
): string | null {
  if (aktivPfad.length === 0) return null;
  let marke: string | null = null;
  let liste = knoten;
  for (;;) {
    const treffer = liste.find((k) => k.ids.some((id) => aktivPfad.includes(id)));
    if (!treffer) return marke;
    marke = treffer.id;
    if (treffer.kinder.length === 0 || !istOffen(treffer, offen, startOffeneTiefe)) return marke;
    liste = treffer.kinder;
  }
}

/** Zählwert-Text für `aria-label`/`title` (die Optik baut die Zeile selbst). */
function zaehlwertText(k: GliederungsKnoten, auf: boolean): string {
  if (k.artikelAnzahl === 0) return '';
  const hatKinder = k.kinder.length > 0;
  if (!hatKinder) return k.bereich ?? `${k.artikelAnzahl}`;
  if (auf) return `${k.artikelAnzahl} Artikel`;
  return k.bereich ? `${k.bereich} · ${k.artikelAnzahl} Artikel` : `${k.artikelAnzahl} Artikel`;
}

interface ZeilenProps {
  k: GliederungsKnoten;
  erster: boolean;
  aktivPfad: string[];
  /** Id der EINEN Zeile mit der Positionsmarke (s. findeMarke). */
  markeId: string | null;
  offen: Record<string, boolean>;
  startOffeneTiefe: number;
  onToggle: (id: string) => void;
  onSprung: (id: string) => void;
  onSprungArtikel: (token: string) => void;
}

// ─── F3 (Teil 1 von 2): EINE Zeile = EIN memoisiertes Bauteil ────────────────
// BEFUND (Perf-Diagnose 8.8.2026, U3): der Baum war EIN einziges memo-Bauteil,
// das seine 11 075 Knoten in einer Closure-Rekursion erzeugte — jede Änderung an
// `offen`/`aktivPfad` liess React den kompletten Kodex neu durchlaufen (OR: 2181
// Zeilen). Klick-Latenz @4× 231 ms gegen 33 ms bei BGFA.
//
// WAS DIESE HÄLFTE BRINGT — und was nicht (§15/4, Default-Komparator, bewusst
// keine eigene Vergleichsfunktion): `offen` und `aktivPfad` sind Referenzen;
// ändert sich eine davon, rendern die Zeilen neu. Der Gewinn liegt in den
// Fällen, in denen der Elternbaum aus ANDEREN Gründen rendert (Scroll-Spy setzt
// `aktArtikel`, Callback-Identität, Suche) — dann hält jede Zeile. Den grossen
// Teil nimmt erst der Unmount zugeklappter Äste weg (S5): was zu ist, existiert
// nicht mehr, also kostet auch ein Voll-Rerender nur den offenen Pfad
// (~250 statt 11 075 Knoten). Beides zusammen ist F3; einzeln trüge keines —
// darum steht hier ausdrücklich nur die Hälfte, und der Unmount folgt in S5.
const Zeile = memo(function Zeile({
  k, erster, aktivPfad, markeId, offen, startOffeneTiefe, onToggle, onSprung, onSprungArtikel,
}: ZeilenProps): ReactNode {
  const auf = istOffen(k, offen, startOffeneTiefe);
  const hatKinder = k.kinder.length > 0;
  const istMarke = markeId !== null && k.id === markeId;
  const aufPfad = !istMarke && k.ids.some((id) => aktivPfad.includes(id));
  const stimme = ebenenStimme(k.randtitel, k.tiefe);
  const tinte = istMarke ? 'text-ink-900' : aufPfad ? (AHNEN_TINTE[stimme.tinte] ?? stimme.tinte) : stimme.tinte;
  // LM-155 Mittel 3: Rhythmus — die obersten Knoten bekommen einen Vorlauf. Der
  // jeweils ERSTE Knoten einer Liste bleibt bündig. Statisches margin ⇒ kein
  // Layout-Shift zur Laufzeit (§15.2).
  const takt = erster ? '' : k.tiefe === 0 ? 'mt-3' : k.tiefe === 1 && !k.randtitel ? 'mt-1.5' : '';
  const { pre, rest } = romanFrei(k.labelKette[k.labelKette.length - 1]);
  const zaehler = zaehlwertText(k, auf);
  // Vollständiger Text für Screenreader und Tooltip: der sichtbare Label ist auf
  // zwei Zeilen geklammert (Labels bis 280 Zeichen sind belegt) — ohne diesen
  // Vollwert wäre der Rest still verloren (§8). Der Zählwert steht mit drin,
  // damit `aria-label` die sichtbare Zeile nicht ärmer macht, als sie ist.
  const voll = [k.label, zaehler, k.aufgehoben ? 'aufgehoben' : ''].filter(Boolean).join(' — ');

  return (
    // data-sektion-id nur an echten Sektionszeilen: der Auto-Zuklapp-Pfad
    // (inhalt-hooks) misst darüber die Lage eines Astes im Sichtfenster des
    // [data-toc]-Containers. Synthetische Zeilen (Vorspann/Anhänge) haben keine
    // `sek-N`-Identität — sie hier zu erfinden, wäre eine zweite Wahrheit (§5).
    // `data-sektion-ids` (S5): ALLE Ids dieser Zeile, leerzeichengetrennt — der
    // Auto-Zuklapp-Pfad schlägt darüber Id → gerendertes Element nach
    // (`[data-sektion-ids~="sek-8"]`). Eine verdichtete Einzelkind-Kette hat für
    // ihre INNEREN Stufen kein eigenes Element; ein Sonder-DOM dafür wäre eine
    // zweite Wahrheit über den Baum (§5) — ein Attribut an der Zeile, die die
    // Stufe ohnehin trägt, sagt dasselbe ehrlicher. `data-sektion-id` bleibt
    // unverändert der äussere Schlüssel (Bestandssonden, e2e).
    <li data-sektion-id={k.art === 'sektion' ? k.id : undefined}
      data-sektion-ids={k.art === 'sektion' ? k.ids.join(' ') : undefined}>
      <div className={`flex items-start ${takt}`} style={{ paddingLeft: `${einzugFuerTiefe(k.tiefe)}rem` }}>
        {hatKinder
          ? (
            <button
              type="button"
              // Die Zeile klappt über ALLE ihre Ids — sonst bliebe bei einer
              // verdichteten Kette die innere Stufe aus der Buchhaltung heraus
              // und der Spy klappte gegen den Nutzer an.
              onClick={() => k.ids.forEach(onToggle)}
              aria-expanded={auf} aria-label={auf ? 'Einklappen' : 'Aufklappen'}
              className="shrink-0 text-ink-300 hover:text-ink-600 px-1 mt-0.5 text-micro w-4">{auf ? '▾' : '▸'}</button>
          )
          : <span className="shrink-0 w-4" aria-hidden />}
        {/* F5-Positionsmarke (§3.5): 2-px-Messingkante, Muster layout/Sidebar.tsx.
            Der Streifen steht IMMER im Markup und ist im Ruhezustand nur
            transparent — so reserviert er seinen Platz und der Wechsel der
            Leseposition bewegt nichts (§15.2, dieselbe Vorsichtsmassnahme wie in
            der App-Seitenleiste).
            §7-ABWEICHUNG VON DER SPEC, gemessen statt übernommen: die Spec nennt
            `bg-brass-500`, ihre eigene Referenzstelle (layout/Sidebar.tsx:65–74)
            benutzt aber `bg-brass-600`. Gegen den Leisten-Hintergrund gemessen
            (Chromium, beide Themes): brass-500 = 2.98:1 hell / 6.55:1 dunkel,
            brass-600 = 3.78:1 hell / 11.74:1 dunkel. Die Hausregel «beide Themes
            ≥ 3:1» (Spec §9) reisst brass-500 im HELLEN Modus um zwei
            Hundertstel — und eine Positionsmarke, die man nicht sieht, ist keine.
            Darum brass-600, also genau der Ton des zitierten Musters. */}
        <span aria-hidden className={`mt-1 h-3.5 w-0.5 shrink-0 rounded-full ${istMarke ? 'bg-brass-600' : 'bg-transparent'}`} />
        <button
          type="button"
          onClick={() => {
            // W2·10-UI-NAV/R5: die verlassene Leseposition VOR dem Sprung
            // vormerken — der TOC-Sprung erzeugt bewusst keinen History-Eintrag
            // (LM-202), ohne diese Notiz gäbe es keinen Rückweg.
            merkeRuecksprungVonDom();
            if (k.art === 'sektion') onSprung(k.id);
            else if (k.ersterArtikel) onSprungArtikel(k.ersterArtikel);
          }}
          // F5: GENAU EINE Zeile trägt die Marke — der tiefste aktive Knoten.
          // Bis S4 trugen alle bis zu sechs Vorfahren `aria-current="true"`; ein
          // Screenreader meldete damit sechs gleichzeitige Standorte, was
          // schlicht falsch war (§8). `location` statt `true`, weil es genau das
          // ist: die Stelle im Dokument, an der der Leser steht.
          data-toc-aktiv={istMarke ? '1' : undefined}
          aria-current={istMarke ? 'location' : undefined}
          title={voll}
          aria-label={voll}
          className={`flex-1 min-w-0 text-left rounded px-1.5 py-0.5 leading-snug transition-colors ${stimme.form} ${tinte} ${istMarke ? '' : 'hover:text-ink-900 hover:bg-paper-sunken/60'}`}>
          {/* line-clamp-2 (§3.3): Labels bis 280 Zeichen sind belegt — ohne
              Klammer wuchs eine einzige Zeile auf sechs und schob den ganzen
              Baum. Der volle Text bleibt über title/aria-label erreichbar. */}
          <span className="line-clamp-2">
            {pre ? <><span className={stimme.pre}>{pre}:</span> {margLabel(rest)}</> : margLabel(k.labelKette[k.labelKette.length - 1])}
            {/* Verdichtete Einzelkind-Kette: die übersprungenen Stufen stehen
                sichtbar davor, sonst behauptete die Zeile eine Ebene, die es
                nicht gibt. Gedämpft, damit der Sachtitel führt. */}
            {k.labelKette.length > 1 && (
              // B5 (Bug-Check 9.8.2026): `text-ink-400` misst hell 3.30:1 gegen
              // `paper` und reisst damit WCAG AA für Text (4.5:1). ink-500 ist
              // der nächste tor-geprüfte Ton, der die Dämpfung behält.
              <span className="text-ink-500"> ({k.labelKette.slice(0, -1).join(' › ')})</span>
            )}
          </span>
          {/* Aufgehoben-Signal (§3.3, Inventar C «heute klappt man blind auf»):
              sichtbarer Text, nicht nur `title`. Statisch je Knoten ⇒ kein CLS. */}
          {/* B5: s. o. — auch dieser Zusatz ist TEXT und braucht 4.5:1. */}
          {k.aufgehoben && <span className="ml-1 text-micro text-ink-500">aufgehoben</span>}
        </button>
        {/* Adaptiver Zählwert (§3.3): zugeklappt «Art. 1–40 · 14», aufgeklappt
            nur «14». Der Bereich wird beim Aufklappen NICHT entfernt, sondern
            `invisible` — er behält seine Box. Sonst änderte sich die Breite des
            Label-Feldes, ein grenzwertiges Label kippte von einer auf zwei
            Zeilen, und weil der Scroll-Spy auch OHNE Klick aufklappt, zählte
            dieser Sprung als unerwarteter Layout-Shift (§15.2, a9). */}
        {zaehler !== '' && (
          <span className="shrink-0 self-start pl-1.5 pt-0.5 text-micro leading-snug tabular-nums text-ink-500">
            {k.bereich && <span className={hatKinder && auf ? 'invisible' : ''}>{k.bereich}{hatKinder ? ' · ' : ''}</span>}
            {hatKinder && <span>{k.artikelAnzahl}</span>}
          </span>
        )}
      </div>
      {/* ── F3, zweite Hälfte (S5): zugeklappte Äste werden UNMOUNTET ──────────
          Bis S4 blieben sie gemountet und wurden nur per `grid-rows-[0fr]` auf
          Höhe 0 geklemmt. Gemessen (Perf-Diagnose 8.8.2026, U3): 11 075
          dauerhaft gemountete Knoten beim OR, Klick-Latenz @4× 231 ms gegen
          33 ms beim BGFA. Ein Baum, dessen zugeklappte Teile nicht existieren,
          kostet nur noch den offenen Pfad.
          §15-Abgrenzung: der Baum ist KEIN Normtext. Das Virtualisierungsverbot
          schützt die Lesespalte (Anker, Ctrl+F, Druck, Screenreader-Vollzugriff
          auf den amtlichen Text) — die Gliederung ist ein Verzeichnis, und der
          zugeklappte Ast ist auch für den Nutzer nicht da.
          Die 7.8.-Lehre (`invisible` am zugeklappten Ast, weil die Kind-Knöpfe
          sonst fokussierbar und Playwright-klickbar blieben, obwohl unsichtbar)
          wird damit GEGENSTANDSLOS und ist entfernt: was nicht im DOM ist, liegt
          weder in der Tab-Reihenfolge noch im a11y-Baum noch im Hit-Testing.
          `e2e/leser-ruecksprung-r5-r7.ts` bewacht genau das weiterhin
          («kein unsichtbarer Gliederungs-Knopf in der Tab-Reihenfolge»).
          §15.2: weiterhin KEINE Höhen-Animation — eine animierte Höhenänderung
          reflowt Frame für Frame die Geschwister und zählt, wenn der Spy sie
          auslöst, als unerwarteter CLS. Das Umschalten bleibt ein Schritt. */}
      {hatKinder && auf && (
        <div className="grid grid-rows-[1fr]">
          <div className="overflow-hidden min-h-0">
            <ul className="space-y-0.5 mt-0.5">
              {k.kinder.map((kind, i) => (
                <Zeile key={kind.id} k={kind} erster={i === 0}
                  aktivPfad={aktivPfad} markeId={markeId} offen={offen}
                  startOffeneTiefe={startOffeneTiefe}
                  onToggle={onToggle} onSprung={onSprung} onSprungArtikel={onSprungArtikel} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
});

/**
 * Gliederungsbaum. `React.memo` (Default-Komparator) — der Baum re-renderte
 * sonst bei JEDER Scroll-Spy-Aktualisierung des Parents mit. Props sind
 * referenzstabil: `knoten` (useMemo über das Modell), `offen`/`aktivPfad`
 * (State), Callbacks (useCallback).
 */
export const SektionBaumTOC = memo(function SektionBaumTOC({
  knoten, aktivPfad, offen, startOffeneTiefe, onToggle, onSprung, onSprungArtikel,
}: {
  knoten: GliederungsKnoten[];
  aktivPfad: string[]; // Sektions-Ids des aktiven Pfads, Wurzel → tiefster Knoten
  offen: Record<string, boolean>;
  startOffeneTiefe: number;
  onToggle: (id: string) => void;
  onSprung: (id: string) => void;
  onSprungArtikel: (token: string) => void;
}) {
  // Genau EINE Marke je gerendertem Baum — die Invariante, auf die sich a9
  // (`[data-toc] [data-toc-aktiv]` als Sprungziel) und a33 (Ruhe-Messung)
  // stützen: nie mehr als eine, und solange der Spy überhaupt einen Pfad im
  // Baum meldet, auch nie weniger (s. findeMarke).
  const markeId = findeMarke(knoten, aktivPfad, offen, startOffeneTiefe);
  return (
    <ul className="space-y-0.5">
      {knoten.map((k, i) => (
        <Zeile key={k.id} k={k} erster={i === 0}
          aktivPfad={aktivPfad} markeId={markeId} offen={offen}
          startOffeneTiefe={startOffeneTiefe}
          onToggle={onToggle} onSprung={onSprung} onSprungArtikel={onSprungArtikel} />
      ))}
    </ul>
  );
});
