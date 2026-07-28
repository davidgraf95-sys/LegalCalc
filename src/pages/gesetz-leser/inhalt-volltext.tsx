import type { ComponentProps, Dispatch, MutableRefObject, ReactNode, RefObject, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { Link, type NavigateFunction } from 'react-router-dom';
import { naechsteInstanz, merkeTab } from '../../lib/tabs';
import type { InternRefs } from '../../components/NormText';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { KontextPanel } from '../../components/kontext/KontextPanel';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import type { CurrencyMap, ErlassKopf, Sektion, StrukturMap } from '../../lib/normtext/browse';
import { sachgruppe, topTitel, type KantonSystematik } from '../../lib/normtext/systematik';
import type { LinienProfil } from './linienAufbau';
import { kopfOverline, grundartMeta } from './helpers';
import { ArtikelLeser, ErlassKopfBlock, ErlassLeserKopf } from './parts';
import { LeserAnsichtMenu } from './LeserAnsichtMenu';
import { LeserRechtsprechungMenu } from './LeserRechtsprechungMenu';
import { istAnhangToken } from './berechnungen';
import { AmtlichesPdf } from './parts/AmtlichesPdf';

// ═══ ABSCHNITT · Volltext-Leseansicht — INNENinhalt (§6.6-Split, W2·12-HYGIENE/B24) ═══
// Reine Präsentationsschicht (Props rein, §3): der gesamte Innen-Render des
// Volltext-Readers (Toast, Erlass-Kopf + Options, pane-lokale Such-Leiste, mobiler
// Gliederungs-Drawer, 2-Spalten-TOC, Lesespalte, Kontext-Panel, Nachbar-Nav).
// VERHALTENSNEUTRAL: identisches Markup + identische Handler wie zuvor inline (golden/
// Snapshot byte-gleich). Die reader-root-Hülle (`.lc-leser` mit data-grundart/
// data-guide-auto) UND `renderSektion` (Linien-Kanon: border-guide/linien.guideEbene/
// data-normtext-linie) bleiben in GesetzLeserInhalt (inhalt.tsx) — dort gated sie
// `check:linien-kanon`; `renderSektion` wird als Prop hereingereicht. Keine
// Rechtsregel, kein Normtext, keine Hook-Reihenfolge berührt.

type ArtikelLeserProps = ComponentProps<typeof ArtikelLeser>;
type GrundartMeta = ReturnType<typeof grundartMeta>;

export function LeserVolltextInhalt({
  erlass, eintraege, struktur, kopf, currency, vorher, nachher,
  sektionen, ohneGliederung, linien, fussnotenAnzahl, meta,
  internRefs, margAnzeige, kantonSys, basisPfad, renderSektion,
  imPane, istXl, overlayWurzel, treffer, suche, sucheDebounced, setSuche,
  tocBaumEl, tocOffen, tocAuf, setTocOffen, setTocAuf, springeZuArtikel,
  leitfaelleFuer, bezuegeFuer = () => undefined, revisionFuer, historieFuer, kantoneVerfuegbar = [],
  reiterToast, setReiterToast, reiterToastTimerRef,
  tocDrawerRef, trefferRef, navigate,
}: {
  erlass: BrowseErlass;
  eintraege: NormSnapshot[];
  struktur: StrukturMap | null;
  kopf: ErlassKopf | null;
  currency: CurrencyMap | null;
  vorher: BrowseErlass | null;
  nachher: BrowseErlass | null;
  sektionen: Sektion[];
  ohneGliederung: NormSnapshot[];
  linien: LinienProfil;
  fussnotenAnzahl: number | null;
  meta: GrundartMeta;
  internRefs: InternRefs | undefined;
  margAnzeige: Map<string, { teile: string[]; ab: number }>;
  kantonSys: Record<string, KantonSystematik>;
  basisPfad: string;
  renderSektion: (s: Sektion, defOpen: boolean, tiefe: number) => ReactNode;
  imPane: boolean;
  istXl: boolean;
  overlayWurzel: RefObject<HTMLElement | null> | null;
  treffer: NormSnapshot[] | null;
  suche: string;
  sucheDebounced: string;
  setSuche: Dispatch<SetStateAction<string>>;
  tocBaumEl: ReactNode;
  tocOffen: boolean;
  tocAuf: boolean;
  setTocOffen: Dispatch<SetStateAction<boolean>>;
  setTocAuf: Dispatch<SetStateAction<boolean>>;
  springeZuArtikel: (token: string) => void;
  /** V1a-Leitfälle je Artikel. OPTIONAL und vom Reader NICHT MEHR gesetzt
   *  (W2·7-BEZUG/B4, Vorgabe David 28.7.2026): der Artikelfuss speist sich aus
   *  `bezuegeFuer`. Der Eingang bleibt für direkte Konsumenten offen. */
  leitfaelleFuer?: (artikel: string) => ArtikelLeserProps['leitfaelle'];
  /** W2·7-BEZUG/B4: facettierte Bezüge je Artikel (nur im erweiterten Zustand).
   *  OPTIONAL: ohne sie rendert der Artikelfuss die unveränderte Leitfall-Zeile —
   *  der Grundzustand braucht die Bezüge nicht, und ein Aufrufer soll sie nicht
   *  mitschleppen müssen, nur um die heutige Darstellung zu bekommen. */
  bezuegeFuer?: (artikel: string) => ArtikelLeserProps['bezuege'];
  revisionFuer: (artikel: string) => ArtikelLeserProps['revision'];
  historieFuer: (artikel: string) => ArtikelLeserProps['historie'];
  /** B4: Kantone, zu denen DIESER Erlass Kanten hat — speist den Kanton-Schalter.
   *  OPTIONAL: leer heisst schlicht «noch kein Shard geladen» (kein Streifen). */
  kantoneVerfuegbar?: string[];
  reiterToast: boolean;
  setReiterToast: Dispatch<SetStateAction<boolean>>;
  reiterToastTimerRef: MutableRefObject<number | null>;
  tocDrawerRef: RefObject<HTMLDivElement | null>;
  trefferRef: RefObject<HTMLDivElement | null>;
  navigate: NavigateFunction;
}) {
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;
  const bestimmungsWort = meta.bestimmungsEtikett === 'paragraf' ? 'Paragraphen' : 'Artikel';

  // E4/A32 (David 16.7.2026): das Kontext-Panel sass am Gesetzes-ENDE der Lese-
  // spalte und war «schwer sichtbar/auffindbar». Neuer Platz: unterhalb der
  // GLIEDERUNG in der TOC-Spalte — überall dort, wo die 2-Spalten-Gliederung
  // steht (istXl: Desktop/xl UND breites Split-View-Pane, beide Pfade laufen
  // über dasselbe `istXl`) und die Spalte offen ist. Sonst (Mobil/schmales
  // Pane: Gliederung ist Drawer — dort NICHT verstecken; Spalte eingeklappt)
  // bleibt der ehrlich sichtbare Platz das LESEENDE wie bisher. Es rendert
  // stets genau EIN Panel (nie doppelt, nie eines in einem hidden-Container).
  const kontextImToc = istXl && sektionen.length > 0 && tocOffen;
  const kontextPanelLesespalte = kontextImToc ? null : <KontextPanel typ="norm" normKeys={[erlass.key]} />;

  // N13 (BS-Audit 23.6.2026): die Reader-Overline zeigte für JEDEN kantonalen
  // Erlass stur das Einheits-Rechtsgebiet («Öffentliches Recht»). Stattdessen das
  // echte Sachgebiet aus der amtlichen Kanton-Systematik (sachgruppe→topTitel).
  // Nur wenn ein verifizierter Titel vorliegt — der neutrale Fallback («Bereich N»,
  // «Ohne Systematik-Nummer») wird weggelassen (§8, nichts Geratenes). Bund bleibt
  // beim Rechtsgebiet-Label.
  const overlineGebiet: string | null = (() => {
    if (erlass.ebene === 'bund') return GEBIET_LABEL[erlass.rechtsgebiet];
    const sys = erlass.kanton ? kantonSys[erlass.kanton] : undefined;
    if (!sys) return null;
    const { top } = sachgruppe(sys, erlass.sr);
    if (top === '~') return null;
    const name = topTitel(sys, top);
    return /^Bereich /.test(name) ? null : name;
  })();

  // Geteilte Such-Steuerung (nur noch die Eingabe — der frühere Fussnoten-Schalter
  // ist in die Options-Leiste unifiziert, G2b).
  // A35 (David 16.7.2026): das Suchfeld lebt jetzt AUSSCHLIESSLICH in der STICKY
  // Kopfzeilen-Leiste (data-such-bar, direkt unter dem Ansicht-tragenden Inhalts-
  // Kopf) — NICHT mehr «oberhalb der Gliederung» in der TOC-Spalte. EINE Quelle,
  // in JEDER Breite dieselbe Stelle (§5, Auftrag David «in die kopfzeile wo sich
  // auch ansicht usw. befindet»).
  const sucheEingabe = (
    <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
      placeholder="Im Gesetz suchen …" aria-label="Im Gesetz suchen"
      className="lc-input h-9 py-0 text-body-s flex-1 min-w-0" />
  );
  // E3/A34 + E5/A35: das «Ansicht»-Dropdown im SPLIT-VIEW (nur `imPane`). Es lebt in
  // der pane-lokalen STICKY Kopfzeilen-Such-Leiste (data-such-bar) statt im
  // wegscrollenden ErlassLeserKopf — so bleibt die Ansichtswahl beim Lesen im Pane
  // dauerhaft erreichbar (A26-Ziel «immer sichtbar», jetzt auch für den Pane). Seit
  // A35 ist diese Such-Leiste in JEDER Breite präsent (die frühere 2-Spalten-TOC-Sub-
  // Bar entfiel, weil die Suche dauerhaft im Kopf sitzt), darum trägt sie das Menü
  // einheitlich an EINER Stelle — nie zwei Menüs gleichzeitig. In der Einzelansicht
  // (!imPane) trägt der sticky Inhalts-Kopf das Menü (A26) → hier `null`, kein Doppel.
  const ansichtMenuPane = imPane
    ? (
      <>
        {/* B4: dieselbe Paarung wie in der Einzelansicht — im Pane trägt sie die
            pane-lokale Such-Leiste statt des Inhalts-Kopfs. */}
        <LeserRechtsprechungMenu kantoneVerfuegbar={kantoneVerfuegbar} />
        <LeserAnsichtMenu zeigeLinien={linien.guideEbene !== null} linienAutoAn={linien.autoGuide} fussnotenAnzahl={fussnotenAnzahl} />
      </>
    )
    : null;

  return (
    <>
      {/* O3: flüchtige Bestätigung nach «In neuem Reiter» — zeigt zum ☰-Reiter-
          Tracker oben rechts (aria-live für Screenreader). Fixed, überlagert nichts
          Interaktives; verschwindet nach ~3 s bzw. bei erneutem Reiter-Öffnen. */}
      {reiterToast && (
        <div role="status" aria-live="polite"
          className="fixed right-3 top-20 z-50 flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2 text-body-s text-ink-700 shadow-lg">
          <span aria-hidden className="text-brass-700">⧉</span>
          Im neuen Reiter geöffnet — oben unter ☰
        </div>
      )}
      {/* Breadcrumb trägt seit A/F der Kopf: Einzelansicht → Inhalts-Kopf, Split-View
          → PaneKopf. Kein zweiter Inline-Breadcrumb mehr (sonst Dopplung im Pane).
          G2b: EINE Kopf-Komponente (ErlassLeserKopf) — dieselbe wie im pdf-embed-
          Pfad; sie trägt die Options-Leiste (Linien/Fussnoten/Verweise). */}
      <ErlassLeserKopf erlass={erlass} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort} currency={currency?.[erlass.key]}
        overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet)}
        hinweis="Snapshot — massgeblich ist die amtliche Fassung"
        aktionen={
          // V2 (koordinierter Kopf-PR): EIN Slot-Layout in der Reihenfolge
          // Ansicht · Fussnoten · Download (§F2) — der Slot wird nicht mehrfach
          // umgebaut. «In neuem Reiter» steht zwischen den Bedien- und den
          // Download-Aktionen (Download bleibt der letzte, verankerte Punkt).
          <>
            {/* W2·5d U-KOPF/A4 + V2·B-1/B-2: «Ansicht»-Dropdown
                (Linien/Fussnoten/Verweise/Entscheide + Zeitraum) — reine data-*-/
                CSS-Toggles bzw. JS-Filter (leserOptionen.ts), global, jede Instanz
                synchron. A26 (David 11.7.2026) verschob es in der EINZELANSICHT in
                den immer sichtbaren Inhalts-Kopf (via ansichtSlot). E3/A34 (David
                16.7.2026): im SPLIT-VIEW lag es hier im ErlassLeserKopf — der scrollt
                mit dem Gesetzestext weg, sodass beim Lesen «keine Möglichkeit mehr,
                die Ansicht zu ändern» blieb. Das Menü wandert darum in die pane-
                lokale STICKY Such-/Gliederungs-Leiste (unten `ansichtMenuPane`),
                die im Pane dauerhaft oben klebt — daher hier NICHT mehr gerendert. */}
            {/* Dasselbe Gesetz zusätzlich in einem zweiten Reiter öffnen (Auftrag
                David) — zum Vergleich zweier Stellen; die Reiter unterscheiden sich
                im Label über den Artikel («OR – Art. 41» / «OR – Art. 97»). */}
            <button type="button"
              onClick={() => {
                const ziel = naechsteInstanz(window.location.pathname + window.location.hash);
                merkeTab(ziel, erlass.kuerzel);
                navigate(ziel);
                // O3: kurze Bestätigung mit Zeiger auf den Reiter-Tracker (☰ oben).
                setReiterToast(true);
                if (reiterToastTimerRef.current) window.clearTimeout(reiterToastTimerRef.current);
                reiterToastTimerRef.current = window.setTimeout(() => setReiterToast(false), 3200);
              }}
              className="lc-chip hover:text-brass-700" title="Diesen Erlass zusätzlich in einem neuen Reiter öffnen">⧉ In neuem Reiter</button>
            {/* W2·5d U-PDF/A12: Download = AMTLICHES PDF der gepinnten Fassung
                (Bund Fedlex-Filestore / Kanton LexWork; aus erlass.pdfUrl,
                synchron am Erlass ⇒ CLS 0, §15/2). Fehlt die amtliche PDF-URL,
                entfällt die Aktion (nie render-eigenes PDF, §8/§10.5). */}
            {erlass.pdfUrl && (
              <AmtlichesPdf href={erlass.pdfUrl} stand={erlass.pdfStand ?? erlass.stand} extern />
            )}
          </>
        } />

      {/* M5: Erlass-Kopf (Ingress/Erlassformel bzw. materielle Präambel + Erlass-
          datum + Kopf-Fussnoten) — Fedlex-Fundiertheits-Floor (§2), bisher verworfen. */}
      {kopf && <ErlassKopfBlock kopf={kopf} intern={internRefs} />}

      {/* A35 (David 19.7.2026): das In-Gesetz-Suchfeld ist in der EINZELansicht in den
          Inhalts-Kopf (oben, neben «Ansicht»/Stand/✕) gewandert — die frühere full-
          width Such-Leiste entfällt dort rückstandsfrei (kein toter Code, §Aufräumen).
          Diese `data-such-bar` bleibt NUR im SPLIT-VIEW (`imPane`): dort gibt es keinen
          InhaltsKopf, also trägt die pane-lokale sticky Leiste weiterhin ☰ + Suchfeld +
          Ansicht-Menü. Sticky direkt unter der Pane-Oberkante. */}
      {imPane && (
        <div data-such-bar className="sticky z-[16] mb-4 rounded-lg bg-paper"
          style={{ top: '0.5rem' }}>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 shadow-sm">
            {istXl ? (
              // ab lg (breites Pane): ☰ nur wenn die Gliederungsspalte EINGEKLAPPT ist.
              sektionen.length > 0 && !tocOffen && (
                <button type="button" aria-expanded={tocOffen} onClick={() => setTocOffen(true)}
                  title="Gliederung einblenden" className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-micro font-medium text-ink-600 hover:text-brass-700 hover:border-brass-300 transition-colors">
                  <span aria-hidden>☰</span><span className="hidden sm:inline">Gliederung</span>
                </button>
              )
            ) : (
              // schmales Pane: ☰ öffnet die Gliederung als Overlay-Drawer.
              sektionen.length > 0 && (
                <button type="button" aria-expanded={tocAuf} onClick={() => setTocAuf((v) => !v)}
                  title="Gliederung" className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-micro font-medium text-ink-600 hover:text-brass-700 hover:border-brass-300 transition-colors">
                  <span aria-hidden>☰</span><span className="hidden sm:inline">Gliederung</span>
                </button>
              )
            )}
            {sucheEingabe}
            {/* Split-View-Ansicht-Menü (nur `imPane`) — an derselben Stelle rechts nach
                der Suche, dauerhaft erreichbar während man im Pane liest. */}
            {ansichtMenuPane && <span className="shrink-0">{ansichtMenuPane}</span>}
          </div>
        </div>
      )}

      {/* 2-Spalten (Gliederungs-Sidebar links, Inhalt rechts) ab lg (1024px, R2) —
          darunter (mobil / sehr schmale Fenster) bekommt der Normtext die volle
          Spaltenbreite, die Gliederung sitzt als einklappbarer Drawer (wie mobil).
          So frisst die feste 16rem-TOC-Spalte erst, wenn genug Breite da ist —
          deckungsgleich mit der App-Seitenleiste (lg). Reine Darstellung (§3). */}
      {/* Unter xl: die GLIEDERUNG als Overlay-Drawer (analog Seitenleiste), NUR auf
          Wunsch über den sticky ☰-Knopf geöffnet (Auftrag David 25.6.2026). A35: die
          Suche ist NICHT mehr im Drawer — sie steht dauerhaft in der Kopfzeilen-Leiste
          (oben). Der Drawer trägt jetzt allein den Gliederungsbaum; Sektionswahl
          schliesst ihn (springeZuSektion). */}
      {!istXl && tocAuf && sektionen.length > 0 && (() => {
        // Im Pane in die Overlay-Schicht portalieren + `absolute` (vom relative-
        // Wrapper eingefangen) → der Drawer bleibt IM Pane statt als `position:fixed`
        // über beide Panes zu quellen (container-type fängt fixed nicht). Ausserhalb
        // unverändert `fixed` an den Viewport (byte-gleich).
        const ziel = (imPane && overlayWurzel?.current) || null;
        const inPane = ziel != null;
        const drawer = (
          <>
            <div className={inPane ? 'pointer-events-auto absolute inset-0 z-40 bg-ink-900/30' : `fixed inset-0 z-40 bg-ink-900/30 ${imPane ? '' : 'lg:hidden'}`}
              onClick={() => setTocAuf(false)} aria-hidden />
            {/* Kompakt (Wunsch David): begrenzte Höhe, fixer Kopf, NUR der
                Gliederungsbaum scrollt darunter. In der Einzelansicht beginnt er UNTER
                dem Inhalts-Kopf (Topbar 4rem + Kopf 2.25rem); im Pane in der Overlay-
                Schicht ab dessen Oberkante. */}
            <div ref={tocDrawerRef} tabIndex={-1} role="dialog" aria-modal={inPane ? undefined : true} aria-label="Gliederung"
              className={`${inPane ? 'pointer-events-auto absolute inset-x-0 top-0 z-50 max-h-[75%]' : `fixed inset-x-0 z-50 max-h-[60vh] ${imPane ? '' : 'lg:hidden'}`} flex flex-col bg-paper-raised border-b border-line shadow-lg`}
              style={inPane ? undefined : { top: 'calc(4rem + 2.25rem)' }}>
              <div className="shrink-0 border-b border-line bg-paper-raised">
                <div className="flex items-center justify-between px-4 pt-2.5 pb-2.5">
                  <p className="lc-overline">Gliederung</p>
                  <button type="button" onClick={() => setTocAuf(false)} className="text-micro text-ink-500 hover:text-brass-700">✕ schliessen</button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 [scrollbar-width:thin]">{tocBaumEl}</div>
            </div>
          </>
        );
        return ziel ? createPortal(drawer, ziel) : drawer;
      })()}

      {/* 2-Spalten-Gliederung: ab `istXl` — im Pane container-breitenabhängig
          (ResizeObserver), sonst viewport-xl. istXl treibt die Klassen direkt
          (kein xl:-Prefix), damit ein BREITES Pane denselben Aufbau wie der
          Einzelbildschirm bekommt. */}
      <div className={istXl && sektionen.length > 0 && tocOffen ? 'grid grid-cols-[16rem_minmax(0,1fr)] gap-8' : ''}>
        {/* TOC-Spalte (nur der Gliederungsbaum, sticky). A35: das Suchfeld lebt nicht
            mehr hier «oberhalb der Gliederung», sondern in der Kopfzeilen-Leiste (oben).
            Nur wenn istXl; darunter Overlay-Drawer über den sticky ☰-Knopf. */}
        {istXl && sektionen.length > 0 && (
          <aside
            // A35 (David 19.7.2026): in der EINZELansicht entfiel die full-width Such-
            // Leiste (Suchfeld jetzt IM Inhalts-Kopf) → die Gliederungsspalte klebt
            // wieder direkt unter dem Kopf (Topbar 4rem + Inhalts-Kopf 2.25rem), ohne
            // den früheren +3.5rem-Such-Leisten-Vorhalt. Im Pane bleibt die pane-lokale
            // Such-Leiste (+3.5rem), also dort unverändert.
            style={imPane
              // Im Pane: an die SICHTBARE Pane-Höhe binden (Topbar 4rem + PaneKopf
              // 2.25rem ab), nicht an die indefinite Grid-Zeile (calc(100%) löste
              // gegen content-Höhe → kein interner Scroll, sticky brach).
              ? { top: 'calc(0.5rem + 3.5rem)', maxHeight: 'calc(100dvh - 4rem - 2.25rem - 3.5rem - 1rem)' }
              : { top: 'calc(4rem + 2.25rem)', maxHeight: 'calc(100vh - 4rem - 2.25rem - 1.5rem)' }}
            className={`mb-0 sticky flex-col ${tocOffen ? 'flex' : 'hidden'}`}>
            <div className="mb-2 flex items-baseline justify-between shrink-0">
              <p className="lc-overline">Gliederung</p>
              <button type="button" onClick={() => setTocOffen((v) => !v)} className="text-micro text-ink-500 hover:text-brass-700" title="Gliederung ein-/ausklappen">{tocOffen ? '‹ einklappen' : 'ausklappen ›'}</button>
            </div>
            {/* A32 + E4-Korrektur (David 25.7.2026: «das kontextfenster soll
                gliederung nicht abschneiden. sie soll einfach unten an der
                gliederung stehen»): das Kontext-Panel steht IM FLUSS INNERHALB
                des [data-toc]-Scrollers, unterhalb des Baums. Der frühere feste
                33vh-Geschwister-Slot klemmte das Gliederungs-Sichtfenster ein
                (ZGB@1440: 444px statt ~740px) — er entfällt ersatzlos. Der Baum
                behält damit das VOLLE Spalten-Sichtfenster (wie vor E4); wer die
                Gliederung zu Ende scrollt, findet das Panel direkt darunter.
                [data-toc]-Semantik (interner Scroller, A33-Mitscroll/Scroll-Spy)
                unverändert — das Panel ist nur zusätzlicher Inhalt am Scroller-
                Ende. §15.2: das Panel blendet erst NACH vollständiger Ladung ein
                (variante="seitenleiste", KontextPanel-Gating) und unter ihm steht
                im Scroller nichts — das Einwachsen vergrössert nur die Scroll-
                höhe, verschiebt aber kein sichtbares Element (CLS 0, Beweis neu
                geführt in e2e/leser-kontext-e4.e2e.ts). */}
            <div data-toc className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
              {tocBaumEl}
              {kontextImToc && (
                <div data-toc-kontext className="mt-4 border-t border-line pt-3">
                  <KontextPanel typ="norm" normKeys={[erlass.key]} variante="seitenleiste" />
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Lesespalte: auf die Reader-Lese-Token-Breite `max-w-normtext` (42rem ≈
            70–72 ch) begrenzt und STETS zentriert (mx-auto) — E6/A37 (David 16.7.2026):
            die Norm bekommt mehr Platz bis an die Fedlex-taugliche Lesbarkeits-Decke
            (≤ 75 ch), und die Restbreite der 2-Spalten-Zelle (istXl) verteilt sich
            symmetrisch statt rechts als toter Steg zu bleiben — der Steg trieb den
            «Zitat»-Link weit nach rechts (A37-Befund). Das Zeilenmass bleibt gedeckelt
            (§13/2 Lesespalte, nie volle Fensterbreite; R2: kein arbitrary max-w). Die
            Artikel-Kopfzeile (Art. N · Zitat/Link) UND der Fliesstext (ArtikelBody /
            Ingress) teilen sich dieselbe Breite `max-w-normtext` → «Zitat» fluchtet
            bündig mit der rechten Textkante statt in den Leerraum zu wandern. */}
        <div className="group/lese mx-auto w-full max-w-normtext">
          {/* A27 (David 12.7.2026): der Sticky Section-Kontextkopf «Titel › … ›
              Art. N › ⧉ Zitat» ist ENTFERNT. Seit A26 (#198) trägt der immer
              sichtbare Inhalts-Kopf (InhaltsKopf, Brotkrümel + Live-Artikel) die
              Orientierung; der tiefe In-Erlass-Gliederungspfad war für David
              «nicht notwendig». Die «Zitat kopieren»-Aktion bleibt vollständig
              erhalten — sie steht (identisches baueZitat-Voll-Zitat) je Artikel in
              der Artikelnummer-Zeile (ArtikelLeser). §15 Funktions-Treue gewahrt. */}
          {treffer ? (
            <div ref={trefferRef} className="space-y-4">
              <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{sucheDebounced.trim()}»</p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={struktur?.[e.artikel]?.marginalie} imTreffer onSpringe={springeZuArtikel} leitfaelle={leitfaelleFuer?.(e.artikel)} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />)}
              {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Artikel gefunden.</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {ohneGliederung.length > 0 && (
                <div className="space-y-5 mb-6">
                  {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} leitfaelle={leitfaelleFuer?.(e.artikel)} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />)}
                </div>
              )}
              {sektionen.map((s) => renderSektion(s, true, 0))}
            </div>
          )}

          {/* Einheitliches Kontext-Panel (B3): Entscheide/Materialien/Werkzeuge zu
              diesem Erlass — Norm ↔ Entscheid ↔ Material ↔ Werkzeug an einer Stelle
              (Burggraben). Lädt die Entscheide selbst (Single Source, §5). A32: in
              der 2-Spalten-Ansicht sitzt es unterhalb der Gliederung (oben, TOC-
              Spalte); HIER am Leseende nur noch als Mobil-/Rückfall-Platz
              (kontextImToc=false — Drawer-Layouts und eingeklappte Spalte). */}
          {kontextPanelLesespalte}

          <nav className="mt-12 border-t border-line pt-5 flex justify-between gap-4 text-body-s" aria-label="Weitere Erlasse">
            {vorher ? <Link to={`/gesetze/${vorher.ebene}/${encodeURIComponent(vorher.key)}`} className="text-brass-700 hover:underline">‹ {vorher.kuerzel}</Link> : <span />}
            <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">Übersicht</Link>
            {nachher ? <Link to={`/gesetze/${nachher.ebene}/${encodeURIComponent(nachher.key)}`} className="text-brass-700 hover:underline text-right">{nachher.kuerzel} ›</Link> : <span />}
          </nav>
        </div>
      </div>
    </>
  );
}
