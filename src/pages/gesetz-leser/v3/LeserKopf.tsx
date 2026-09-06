import { Link } from 'react-router-dom';
import { Fragment, type ReactNode } from 'react';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import { LeserAnsichtV3 } from './LeserAnsichtV3';
import { brotkrume, zeigeVolltitel } from './erlassAnsicht';
import { kopfElemente, type KopfStufe } from './kopfStufen';

// ─── Die EINE Kopfzeile des Lesers V3 (FAHRPLAN-LESER-V3 Kap. 4a, H1) ────────
//
//   D  │ Gesetze › Bund › StPO   Art. 429      ⚖ 14 Entscheide  Ansicht ▾ │
//   S  │ ‹ Gesetze  StPO   Art. 429     ⚖ 14 Entscheide  ☰  Ansicht ▾│
//   H  │ ‹ Gesetze StPO · Art. 429   ⚖  ☰  ···│
//
// ── A-2 · «DIE EINE» IST SEIT 17.8.2026 WÖRTLICH GEMEINT ────────────────────
// Bis dahin sass diese Zeile UNTER der App-Krumen-Leiste, die denselben Ort
// nannte (Auftrag David 17.8.2026: «wir haben jetzt oben einen header mit
// ähnlichem inhalt … passe das entsprechend sinnvoll an»). Die Leiste ist weg —
// die Seite meldet der Hülle `KopfDaten.kopfzeileSelbst` und trägt seither
// Krume, Ebene, Kennung, Ortsangabe und Aktionen allein. Im Split-View bleibt
// über dem Kopf einzig die Pane-Titelleiste, und die trägt nur noch die
// FENSTER-Steuerung (⠿ ◂▸ ⇱ ⧉ ✕), also nichts, was eine Inhaltsseite tragen
// könnte.
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
//    (Kap. 4e), zwei Zentimeter darunter und in jeder Breite. Seit A-2 ist das
//    auch der EINZIGE Ort: die App-Leiste, die ihn klebend mitführte, ist weg.
//    Ihn hier nachzubauen hiesse, ihn im Ruhezustand zweimal zu zeigen (§5) —
//    dass er beim Scrollen nicht mitläuft, ist der bewusste Preis, siehe
//    Vollzugsvermerk A-2.
//
// ── Ä46/Ä87/Ä91 · DIESE ZEILE TRÄGT KEIN ✕ MEHR (H4-Nachzug 18.8.2026) ──────
// Bis 17.8. stand hier ein ✕ «Gesetz schliessen», das auf `/gesetze` führte.
// Es ist in drei Schritten gefallen: im Pane (Ä46 — zwei ✕ je Pane, 44 px
// übereinander), auf `mini` (Element-Budget), und mit dem H4-Nachzug ganz
// (Ä87: @1440 lag es bei offenem Blatt 47 px über dessen ✕; Ä91: @720 war es
// das fünfte Element einer Zeile, die vier trägt).
// Verloren geht nichts: das Ziel `/gesetze` steht auf JEDER Breite links als
// beschriftetes Wort — als volle Kette «Gesetze › Bund ›» oder als Rücksprung
// «‹ Gesetze», beide aus `erlassAnsicht.brotkrume` und beide pane-lokal
// aufgelöst (`<Link>` gegen den Pane-Navigator). Die Zusage, dass dieser
// Rücksprung immer da ist, hängt an `erlassAnsicht.hatRuecksprung` und ist
// dort unit-bewiesen; die Auflage «höchstens ein ✕ je Kopfzeile, Rücksprung
// immer beschriftet» samt Messreihe steht in `./kopfStufen`.

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
  const el = kopfElemente(stufe);
  // A-2: dieselbe Kette, die bis 17.8. an die App-Leiste gemeldet wurde.
  const krume = brotkrume(erlass);
  // V2 (Nachzug 17.8.): der EINE Rücksprung für die engen Zuschnitte — die
  // erste Stufe DERSELBEN Kette («Gesetze»), nie ein zweiter Text (§5).
  const rueckKrume = krume[0];

  return (
    // `sticky top` aus `--leser-v3-kopf-top`: der Rahmen legt den Wert EINMAL
    // aus (Einzelansicht = unter Topbar + App-Leiste, Pane = 0, weil PaneKopf
    // ausserhalb des Pane-Scrollers liegt). Dieselbe Variable speist
    // `--nt-stick`, also den Sprung-Offset — eine Quelle für «wie hoch klebt
    // es» (Risiko R1). Höhe aus `--leser-v3-kopf-h` (ebenfalls Rahmen).
    //
    // `z-reader-kopf` (C3, 5.9.2026: benannte Rolle für den vormals rohen
    // Wert 17, Schichtungs-Skala in index.css — vorher gab das Repo (Stand
    // 16.8.2026) keine z-Index-Token her, s. Chronik dort). ANLASS der Zahl:
    // der V3-Kopf muss über seinem eigenen Scrim (`z-reader-scrim` = 16,
    // `LeserScrim.tsx`) liegen, aber unter den Overlays (`z-overlay`/
    // `z-modal`: Ansicht-Panel, Sheet, Toast).
    <div
      data-v3-kopf
      className="sticky z-reader-kopf -mx-1 mb-4 border-b border-line bg-paper px-1"
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
      //
      // A-2 (17.8.2026): verschluckt wird jetzt ZWEIERLEI — die Wrapper-
      // Polsterung UND das reservierte Band der App-Krumen-Leiste. Das Band
      // behält seine Höhe, damit beim Eintreffen der Meldung «ich trage die
      // Kopfzeile selbst» nichts wandert (Messung und Tor-Beleg in
      // `components/layout/InhaltsKopf.tsx`); dieser Kopf legt sich opak darüber,
      // und genau dadurch sind die 37 px sichtbar gewonnen. Beide Werte kommen
      // von aussen — die Datei bleibt ohne Breakpoint- und ohne `imPane`-Zweig.
      style={{
        top: 'var(--leser-v3-kopf-top)',
        marginTop: 'calc(-1 * (var(--leser-v3-kopf-luecke, 0px) + var(--leser-v3-app-band, 0px)))',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3" style={{ height: 'var(--leser-v3-kopf-h)' }}>
        {/* ── Ortsangabe: EINE schrumpfende Zone (Krume + laufender Artikel) ── */}
        <nav aria-label="Ort im Gesetz" data-v3-kopf-ort
          className="flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden whitespace-nowrap text-xs text-ink-500">
          {/* ── A-2 (David 17.8.2026) · DIE GANZE KRUME STEHT JETZT HIER ──────
              «Gesetze › Bund › StPO» — die Kette, die bis 17.8. die App-Krumen-
              Leiste 37 px darüber trug. Sie kommt aus DERSELBEN Funktion, die sie
              dorthin gemeldet hat (`erlassAnsicht.brotkrume`): Bund, Kanton und
              Staatsvertrag laufen durch eine Ableitung, kein `if (bund)` (Bund →
              «Bund», Kanton BS → «Kanton BS», Staatsvertrag → «International»;
              unit-geprüft in `leser-v3-erlassansicht.test.ts`). Gerendert werden
              hier nur die FÜHRENDEN Stufen — die letzte ist das Kürzel und hat
              unten ihre eigene Kürzungs-Regel (A4).
              KLICKBAR bleibt sie: `<Link>` löst im Pane gegen den PANE-EIGENEN
              Navigator auf (`Pane.tsx`, `navKontext`) — der Klick navigiert
              pane-lokal und reisst nicht das ganze Fenster weg (dieselbe
              Zusicherung wie beim ✕ unten). */}
          {el.krume === 'voll' && krume.slice(0, -1).map((stufeKrume) => (
            <Fragment key={stufeKrume.label}>
              {stufeKrume.to
                ? <Link to={stufeKrume.to} className="shrink-0 truncate no-underline hover:text-brass-700">{stufeKrume.label}</Link>
                : <span className="shrink-0 truncate">{stufeKrume.label}</span>}
              {/* C5 (29.8.2026): Trenner ink-300 → ink-400, Herleitung in `layout/InhaltsKopf.tsx`. */}
              <span aria-hidden className="shrink-0 text-ink-400">›</span>
            </Fragment>
          ))}
          {/* ── V2 (Nachzug 17.8.2026) · DER RÜCKSPRUNG, WO DIE KETTE NICHT PASST
              Unter 900 px Elementbreite fiel die Krume bis hierher GANZ weg —
              @390 und in jedem Pane unter 900 px. Bis A-2 fing die
              App-Krumen-Leiste das auf; seither gab es dort keinen Weg nach oben
              ausser dem ✕, und das springt auf die Gesetzes-Übersicht, also an
              der Ebene vorbei. Statt der Kette steht jetzt ihre erste Stufe als
              EIN Rücksprung: dieselbe Quelle (`brotkrume`), dieselbe pane-lokale
              Auflösung wie oben (`<Link>` gegen den Pane-Navigator), ein Element
              mehr in der Ort-Zone und keines mehr in der Kopf-ZEILE (Kap. 6).
              Trüge die Stufe kein Ziel, wäre sie kein Rücksprung und entfällt —
              ein stummer Link wäre schlechter als keiner (§8). */}
          {el.krume === 'kurz' && rueckKrume?.to && (
            <Link to={rueckKrume.to} data-v3-kopf-krume-kurz
              className="shrink-0 truncate no-underline hover:text-brass-700">
              <span aria-hidden className="mr-0.5 text-ink-400">‹</span>{rueckKrume.label}
            </Link>
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
          {/* ── W2·24-R6/L10 · DER VOLLTITEL STEHT NUR NOCH IN DER H1 ────────
              GEMESSEN 6.9.2026 @1440: über der H1 «Bundesgesetz betreffend die
              Ergänzung des ZGB (OR)» stand hier dieselbe Angabe ein zweites Mal
              («Gesetze › Bund › OR *Bundesgesetz betreffend die Ergänzung des
              ZGB (Obligationenrecht)*»), auf dem CISG zusätzlich abgeschnitten
              («… über den internationalen Warenkauf (Wiener Kaufrec…»). Zwei
              Fassungen desselben Namens in zwei Zentimetern, eine davon
              verstümmelt — genau der Fall, den Ä21 eine Zeile höher für das
              Kürzel schon entschieden hat (§5, «der Name steht einmal»).
              Die Ortsangabe der Krume ist jetzt durchgehend die knappe:
              Bereich › Ebene › Kürzel › laufender Artikel. Der volle Wortlaut
              steht im Titelblatt des Erlasses, wo er hingehört — und die
              Kopf-Stufe `volltitel` behält ihre Bedeutung für die Kürzel-Regel
              darüber (dort ist sie bewacht: `e2e/leser-v3-kopf-buendig`).
              ABWEICHUNG zu keiner Vorgabe: das Referenzbild führt in seiner
              Kopfzeile ebenfalls nur die kurze Ortsangabe. */}
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

        {/* ── Griffe: ⚖ · ☰ (nur wenn nötig) · Ansicht ────────────────────────
            Design-Grundlage Kap. 6: «Kopfzeile im Ruhezustand ≤ 4 Elemente,
            davon ≤ 2 reine Icons». Ort + Ansicht = 2; ☰ tritt hinzu, wenn die
            Gliederung nicht ohnehin sichtbar ist (und seit Ä79 auch nicht als
            Schiene danebensteht), ⚖ trägt die Rechtsprechung.
            Ä87/Ä91 (H4-Nachzug 18.8.2026): das ✕ ist WEG — auf jeder Breite und
            in jeder Lage. Gemessen stand es @1440 bei offenem Blatt 47 px über
            dessen eigenem ✕ und machte @720 das fünfte Element aus einer Zeile,
            die vier trägt. Sein Ziel `/gesetze` steht links als beschriftetes
            Wort (Krume bzw. «‹ Gesetze»); Herleitung, Messreihe und die neue
            Auflage «höchstens ein ✕ je Kopfzeile» in `./kopfStufen`. Damit
            ergibt jede Stufe höchstens Ort · ⚖ · ☰ · Ansicht = vier. */}
        <div data-v3-kopf-griffe className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {panelOeffner}
          {gliederungKnopf}
          <LeserAnsichtV3 kompakt={stufe === 'mini'} fussnotenAnzahl={fussnotenAnzahl}
            hatAenderungsvermerke={hatAenderungsvermerke} onPanelOeffnen={onPanelOeffnen} />
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
