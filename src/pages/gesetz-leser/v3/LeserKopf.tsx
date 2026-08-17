import { Link, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import { LeserAnsichtV3 } from './LeserAnsichtV3';
import { ebeneAngabe, zeigeVolltitel } from './erlassAnsicht';
import { kopfElemente, type KopfStufe } from './kopfStufen';

// ─── Die EINE Kopfzeile des Lesers V3 (FAHRPLAN-LESER-V3 Kap. 4a, H1) ────────
//
//   D  │ Gesetze › StPO      Art. 429                    Ansicht ▾   ✕ │
//   S  │ StPO   Art. 429                        Ansicht ▾ ✕│
//   H  │ StPO · Art. 429   ☰   ···  ✕│
//
// EIN VERTRAG FÜR DREI BREITEN — und das ist die eigentliche Zusicherung von
// H1: dieselbe Komponente, derselbe Baum, dieselben Bedienelemente in der
// Einzelansicht, im primären UND im sekundären Pane. Die Datei enthält darum
// KEINE einzige `imPane`-Verzweigung (Kap. 10, Ziel «Kopf-/Layout-
// Verzweigungen 21 → 0»); was sich unterscheidet, ist ausschliesslich die
// gemessene BREITE, und die kommt als `stufe` aus einer Quelle
// (`./kopfStufen`, ResizeObserver am Rahmen). Bewiesen von
// `e2e/leser-kopf-paritaet.e2e.ts`.
//
// Was hier bewusst NICHT steht (Kap. 4a):
//  · kein Suchfeld — es lebt in der Seitenleiste (Kap. 4b, `SuchSprungFeld`),
//  · kein Menü «Rechtsprechung ▾» — die Facetten ziehen in H3 ins Panel,
//  · kein Chip «Stand …» — die eine Stand-Wahrheit steht im Erlass-Kopf
//    (Kap. 4e); die App-Leiste darüber führt ihn unverändert weiter.
//
// ✕ SCHLIESST DAS GESETZ, nicht die Anwendung: die App-Leiste (Einzelansicht
// `InhaltsKopf`, Split-View `PaneKopf`) trägt bereits ein ✕ mit App-Bedeutung
// («zur Startseite» bzw. «Pane schliessen»). Ein zweites ✕ mit derselben
// Bedeutung wäre eine Dopplung; ein ✕ ohne Bedeutung wäre schlimmer. Dieses
// hier führt zur Gesetzes-Übersicht — in einem Pane pane-lokal, weil jedes
// Pane seinen eigenen Navigator hat. Der Accessible-Name sagt es aus (§8).

export function LeserKopf({
  erlass, aktArtikel, fussnotenAnzahl, hatAenderungsvermerke, stufe, gliederungKnopf,
  panelOeffner, onPanelOeffnen, suchZone,
}: {
  erlass: BrowseErlass;
  /** Laufender Artikel aus dem bestehenden Scroll-Spy («Art. 429»). */
  aktArtikel: string | null;
  fussnotenAnzahl: number | null;
  /** D1 — durchgereicht, nicht hier abgeleitet: die Frage gehört ins Modell (§5). */
  hatAenderungsvermerke: boolean;
  stufe: KopfStufe;
  /** ☰-Öffner der Gliederung — der Rahmen baut ihn, wenn die Seitenleiste
   *  gerade NICHT als Spalte steht. `undefined` = die Gliederung ist sichtbar,
   *  ein Öffner wäre ein Knopf ohne Wirkung. */
  gliederungKnopf?: ReactNode;
  /** H3 — Öffner des Rechtsprechungs-Panels («⚖ 14 Entscheide →»). Leer
   *  gelassen kostet er nichts: kein Platzhalter, keine reservierte Fläche. */
  panelOeffner?: ReactNode;
  /** A2 (H3-Nachzug) — dieselbe Fläche, geöffnet aus dem «Ansicht ▾»-Menü. Der
   *  Weg, der bleibt, wenn der Zähler nach der F8-Regel weg ist und keine
   *  Tastatur da ist; Herleitung in `./LeserAnsichtV3`. */
  onPanelOeffnen?: () => void;
  /** ── Ä19 (H2b) · zweite Zeile des klebenden Kopf-BLOCKS ────────────────────
   *  Das Such-/Sprungfeld, wo die Gliederung NICHT als Spalte steht (Handy,
   *  Split-Pane, Desktop mit eingeklappter Gliederung). Vorher gab es in genau
   *  diesen drei Lagen gar kein erreichbares Feld — gemessen im Split @1440:
   *  `[data-v3-suchsprung] input` count === 0.
   *  Die Kopf-ZEILE bleibt davon unberührt: ihre Element-Zahl ändert sich nicht
   *  (Design-Grundlage Kap. 6, ≤ 4 Elemente). Der Rahmen entscheidet, ob es die
   *  Zone gibt, und legt ihre Höhe als `--leser-v3-such-h` aus — diese Datei
   *  rendert sie nur (§3) und bleibt ohne Breiten-Zweig. */
  suchZone?: ReactNode;
}) {
  const navigate = useNavigate();
  const el = kopfElemente(stufe);
  // Ebene-Beschriftung aus dem Datenmodell, nicht aus `if (bund)` — die eine
  // Ableitung steht in `./erlassAnsicht` (Fundament-Auflage 2).
  const ebene = ebeneAngabe(erlass);

  return (
    // `sticky top` aus `--leser-v3-kopf-top`: der Rahmen legt den Wert EINMAL
    // aus (Einzelansicht = unter Topbar + App-Leiste, Pane = 0, weil PaneKopf
    // ausserhalb des Pane-Scrollers liegt). Dieselbe Variable speist
    // `--nt-stick`, also den Sprung-Offset — eine Quelle für «wie hoch klebt
    // es» (Risiko R1). Höhe aus `--leser-v3-kopf-h` (ebenfalls Rahmen).
    //
    // `z-[17]` ist eine rohe Zahl, weil das Repo (Stand 16.8.2026) KEINE
    // z-Index-Token führt — weder in `src/index.css` noch in der Tailwind-
    // Konfiguration; erfunden würde hier also eine Skala von einem einzigen
    // Aufrufer aus (§17: Rahmen zuerst, dann Feature). ANLASS der Zahl: die
    // Such-Leiste der Ist-Volltextansicht klebt auf `z-[16]`
    // (`inhalt-volltext.tsx:424`) — der V3-Kopf muss darüber liegen, aber unter
    // den Overlays (`z-40`/`z-50`: Ansicht-Panel, Sheet, Toast). Eine echte
    // Token-Skala ist ein eigener Design-Schritt (W-3), nicht Beiwerk von H1.
    <div
      data-v3-kopf
      className="sticky z-[17] -mx-1 mb-4 border-b border-line bg-paper px-1"
      // ── Ä1 (H2b) · KEINE LEERZONE UNTER DER KRUMEN-LEISTE ──────────────────
      // Gemessen 17.8.2026 @1440: die Krumen-Leiste endet bei y = 102, der
      // V3-Kopf begann bei y = 150 — 48 px Leerzone im Ruhezustand, die beim
      // ersten Scroll auf 0 zusammenfiel (dann klebt der Kopf bei y = 100). Der
      // Nutzer sah also eine Lücke, die sich beim Scrollen von selbst schloss:
      // zwei verschiedene Bilder derselben Kopfzone.
      // Die 48 px sind die Polsterung des ROUTE-Wrappers (`py-8 sm:py-12` in
      // `components/layout/Shell.tsx`, im Pane `py-6` in `Pane.tsx`) — sie gehört
      // dem Seiteninhalt, nicht einer klebenden Leiste. Der Kopf verschluckt sie
      // darum genau einmal, über `--leser-v3-kopf-luecke`: die Vorgabe steht in
      // `src/index.css` (mit derselben 640-px-Schwelle wie der Wrapper), der
      // Pane-Wert kommt inline vom Rahmen. DIESE Datei kennt weiterhin keinen
      // `imPane`- und keinen Breakpoint-Zweig (Kap. 10) — sie liest eine Variable.
      // BEWACHT: `e2e/leser-v3-kopf-buendig.e2e.ts` misst die Lücke auf H/D/S
      // gegen 0 und wird rot, wenn eine der beiden Polsterungen sich ändert.
      style={{
        top: 'var(--leser-v3-kopf-top)',
        marginTop: 'calc(-1 * var(--leser-v3-kopf-luecke, 0px))',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3" style={{ height: 'var(--leser-v3-kopf-h)' }}>
        {/* ── Ortsangabe: EINE schrumpfende Zone (Krume + laufender Artikel) ── */}
        <nav aria-label="Ort im Gesetz" data-v3-kopf-ort
          className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden whitespace-nowrap text-xs text-ink-500">
          {el.sektion && (
            <>
              <Link to="/gesetze" className="shrink-0 truncate no-underline hover:text-brass-700">Gesetze</Link>
              <span aria-hidden className="shrink-0 text-ink-300">›</span>
            </>
          )}
          {/* ── A4 (H2b-Nachzug) · DIE KENNUNG WIRD NIE ELLIPSIERT ────────────
              Ä21 gab dem Kürzel `min-w-0 truncate` (statt `shrink-0`), weil es bei
              ZH-211.11 der ganze Name ist (45 Zeichen) und die Zone sonst
              gesprengt hätte. NEBENWIRKUNG, gemessen 17.8.2026 @1440 an LugÜ: in
              einer Zone mit ZWEI `truncate`-Geschwistern verteilt Flexbox den
              Mangel auf beide — das VIER Zeichen kurze «LugÜ» wurde zu «Lu…»
              (`scrollWidth` 29 in `clientWidth` 23). Ausgerechnet die Kennung, die
              man sucht, um den Erlass wiederzuerkennen (Ä-(d) hat sie im Titel
              gerade darum nach vorn gezogen), verschwand als erste.
              REGEL: das Kürzel schrumpft nur, wenn es allein steht — dann ist es
              der ganze Name und darf umbrechen bzw. kürzen. Steht ein Volltitel
              daneben, gibt DIESER nach, und die Kennung bleibt vollständig.
              BEWACHT: `e2e/leser-v3-kopf-buendig.e2e.ts` (d) misst LugÜ/StPO und
              ZH-211.11 auf `scrollWidth <= clientWidth` am Kürzel-Element. */}
          <span data-v3-kopf-kuerzel
            className={`font-medium text-ink-800 ${
              el.volltitel && zeigeVolltitel(erlass) ? 'shrink-0' : 'min-w-0 truncate'}`}>{erlass.kuerzel}</span>
          {/* ── Ä21 (H2b) · DER NAME STEHT EINMAL ─────────────────────────────
              Gemessen 17.8.2026 an ZH-211.11: «Gebührenverordnung des
              Obergerichts (GebV OG)» stand in der App-Krume, direkt darunter als
              V3-Kürzel UND ein drittes Mal als Volltitel daneben — weil dort das
              Register-Kürzel bereits der volle Name ist. Drei Ausgaben derselben
              Angabe in zwei Zentimetern (§5).
              Die Entscheidung liegt in `erlassAnsicht.zeigeVolltitel` (rein,
              erlassneutral, unit-geprüft): trägt der Titel neben dem Kürzel keine
              eigene Auskunft, entfällt er. Bund, Verordnung und Staatsvertrag
              sind unberührt — dort sagt der Volltitel etwas anderes als das
              Kürzel.
              B2 (H2b-Nachzug): «keine eigene Auskunft» heisst seit dem Nachzug
              WORTGLEICH, nicht «fängt gleich an» — die alte Regel unterdrückte
              auch Titel, die mehr sagen als das Kürzel (BS-BeE 610.100, AsylG;
              Herleitung und Messwerte in `erlassAnsicht.zeigeVolltitel`). Hier
              stand zudem der Satz, der volle Wortlaut bleibe «im `title` des
              Kürzels» erreichbar — das war falsch (das Kürzel trug nie ein
              `title`) und wäre auch als Absicht falsch: ein Tooltip ist kein
              Ersatz für sichtbare Auskunft (§8). Bleibt der Volltitel, steht er
              sichtbar; sein `title` unten ist nur der Volltext der Ellipse. */}
          {el.volltitel && zeigeVolltitel(erlass) && (
            <span className="min-w-0 truncate text-ink-500" title={`${erlass.titel} · ${ebene.label}`}>{erlass.titel}</span>
          )}
          {/* Der laufende Artikel fällt NIE (Kap. 4a) — darum `shrink-0`: beim
              Engerwerden gibt der Volltitel nach, nie die genauere Angabe.
              Auf der Mini-Stufe steht er als «StPO · Art. N» direkt hinter dem
              Kürzel, wie es die Skizze zeigt. */}
          {aktArtikel && (
            <span data-v3-kopf-artikel className="num shrink-0 text-micro font-medium text-ink-700">
              <span aria-hidden className="mr-1 text-ink-300">·</span>{aktArtikel}
            </span>
          )}
        </nav>

        {/* ── Griffe: ☰ (nur wenn nötig) · Ansicht · ✕ ────────────────────────
            Design-Grundlage Kap. 6: «Kopfzeile im Ruhezustand ≤ 4 Elemente,
            davon ≤ 2 reine Icons». Ort + Ansicht + ✕ = 3; ☰ tritt nur hinzu,
            wenn die Gliederung nicht ohnehin sichtbar ist. */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {panelOeffner}
          {gliederungKnopf}
          <LeserAnsichtV3 kompakt={stufe === 'mini'} fussnotenAnzahl={fussnotenAnzahl}
            hatAenderungsvermerke={hatAenderungsvermerke} onPanelOeffnen={onPanelOeffnen} />
          <button type="button" onClick={() => navigate('/gesetze')}
            aria-label="Gesetz schliessen (zur Gesetzesübersicht)"
            title="Gesetz schliessen (zur Gesetzesübersicht)"
            data-v3-kopf-schliessen
            className="lc-leiste-griff">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>
      </div>
      {/* Ä19: die Such-Zone als zweite Zeile DESSELBEN klebenden Blocks — nicht
          als eigenes `sticky`-Element darunter. Zwei gestapelte Sticky-Blöcke
          hätten zwei `top`-Werte, zwei z-Ebenen und zwischen sich den `mb-4`
          dieses Kopfes als durchscheinenden Spalt gebraucht. Ein Block, eine
          Kante, eine Höhe (`--leser-v3-kopf-h` + `--leser-v3-such-h`). */}
      {suchZone}
    </div>
  );
}
