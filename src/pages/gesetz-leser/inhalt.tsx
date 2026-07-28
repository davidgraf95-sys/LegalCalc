import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { aktualisiereTabArtikel } from '../../lib/tabs';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import { usePaneKontext } from '../../components/layout/PaneKontext';
import { useMeldeInhaltsKopf } from '../../components/layout/InhaltsKopfKontext';
import type { InternRefs } from '../../components/NormText';
import { labelMitBereich, randtitelKnoten } from '../../lib/normtext/darstellung';
import {
  baueGliederungsbaum, type Sektion, type StrukturMap, type ErlassKopf, type CurrencyMap,
} from '../../lib/normtext/browse';
import { type KantonSystematik } from '../../lib/normtext/systematik';
import { verifizierLinkSektion } from '../../lib/normtext/verifikationslink';
import { linienProfil } from './linienAufbau';
import type { BrowseErlass, BrowseManifest } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { passtAufSuche, pfadZu, grundartMeta } from './helpers';
import { ArtikelLeser, SektionKopf, SektionBaumTOC } from './parts';
import { beiLeerlauf } from '../../lib/leerlauf';
import { ladeLeitfallShard, normArtikelToken, type LeitfallShard } from '../../lib/rechtsprechung/norm-index';
import { useBezuege } from './bezuegeLaden';
import { ladeRevisionShard, revisionFuerToken, type RevisionShard } from '../../lib/verzahnung/artikel-revisionen';
import { ladeHistorieShard, historieFuerArtikel, type HistorieShard } from '../../lib/normtext/historie-laden';
import {
  paneRoot, istAnhangToken, findeArt,
  berechneSekPos, berechneSektionMeta, kuratiereTocSektionen,
} from './berechnungen';
import { GesetzFehlSeite } from './FehlSeite';
import { setzeSuchHighlight } from './suchHighlight';
import { LadeAnzeige, PdfEmbedAnsicht, LiveVerweisAnsicht } from './inhalt-ansichten';
import { LeserVolltextInhalt } from './inhalt-volltext';
import { useLeserDaten, useInhaltsKopfMeldung, useLeserSprungSpy } from './inhalt-hooks';

// ═══ ABSCHNITT · Reine Rechenlogik ausgelagert (QS-TOK/P5, §6 Ziff. 6) ═══════
// paneRoot/istAnhangToken/findeArt (Pane-Scoping, referenzstabil, KEIN React
// Compiler → Modulfunktionen), sekPos/sektionMeta/sekLabelById-Ableitungen und
// der Download-Text leben jetzt in ./berechnungen.ts. §6.6-Split (W2·12-HYGIENE/
// B24): die Nicht-Volltext-Ansichten (./inhalt-ansichten), die Volltext-Ansicht
// (./inhalt-volltext) und die side-effect-reinen Effekt-Hooks (./inhalt-hooks)
// leben jetzt in Geschwister-Dateien — verhaltensneutral, Hook-Reihenfolge und
// Markup byte-gleich. Ab hier NUR die zustandsbehaftete Reader-Komponente
// (Hooks, Effekte, Delegation an die Ansichts-Komponenten).

export function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const navigate = useNavigate();
  const location = useLocation();
  const [erlass, setErlass] = useState<BrowseErlass | null>(null);
  const [eintraege, setEintraege] = useState<NormSnapshot[] | null>(null);
  const [struktur, setStruktur] = useState<StrukturMap | null>(null);
  const [kopf, setKopf] = useState<ErlassKopf | null>(null);
  const [manifest, setManifest] = useState<BrowseManifest | null>(null);
  // P1-d: Currency-Sidecar (geltend-geprüft-Datum + angekündigte Fassung je Erlass-Key).
  const [currency, setCurrency] = useState<CurrencyMap | null>(null);
  // Leitfall-Shard des Erlasses: GENAU EIN idle-Fetch auf Reader-Ebene (V1a-
  // Endzustand nach CI-Befund W2·7-VZUI) — die ~1000 LeitfallZeilen grosser
  // Erlasse sind reine Renderer und erhalten ihre Treffer als Prop. Ergebnis an
  // den Erlass-Key gebunden (Pane-/Erlass-Wechsel liefert nie fremde Chips).
  const [leitfallShard, setLeitfallShard] = useState<{ key: string; shard: LeitfallShard | null } | null>(null);
  // Revisions-Shard des Erlasses (V1c): Artikel-Token → Datum der letzten Text-
  // änderung + AS-Fundstelle. EIN idle-Fetch auf Reader-Ebene wie der Leitfall-
  // Shard; klassifiziert je Leitfall-Kante, ob sich die Norm SEIT dem Entscheid
  // revidiert hat (Normrevisions-Ehrlichkeit, §V1c).
  const [revisionShard, setRevisionShard] = useState<{ key: string; shard: RevisionShard | null } | null>(null);
  // G-HIST-UI: Per-Artikel-Historie-Shard des Erlasses. EIN idle-Fetch auf Reader-
  // Ebene (wie Leitfall-/Revisions-Shard); der Artikel-Eintrag wird als Prop
  // durchgereicht (die ArtikelHistorieZeile ist ein reiner Renderer). An den Erlass-
  // Key gebunden — ein Pane-/Erlass-Wechsel liefert nie fremde Historie.
  const [historieShard, setHistorieShard] = useState<{ key: string; shard: HistorieShard | null } | null>(null);
  // W2·7-BEZUG/B4: facettierte Bezüge. `useBezuege` lädt den (deutlich grösseren)
  // Bezugs-Shard NUR im erweiterten Facetten-Zustand und im Leerlauf — im
  // Grundzustand fasst der Reader ihn nie an (§15). `erweitert` steuert zugleich,
  // ob der schlanke Leitfall-Shard überhaupt noch geladen wird (Entweder/Oder, §5).
  const { erweitert: bezuegeErweitert, bezuegeFuer, kantoneVerfuegbar } = useBezuege(erlass?.key);
  const [fehler, setFehler] = useState(false);
  // W2·10-UI-NAV/N0d·O3: kurze Bestätigung nach «In neuem Reiter» — der Reader
  // wird bei der ?r-Instanz-Navigation NICHT neu gemountet (gleicher key=schluessel),
  // darum überlebt dieser Zustand den Soft-Nav und weist zum Reiter-Tracker (☰).
  const [reiterToast, setReiterToast] = useState(false);
  const reiterToastTimer = useRef<number | null>(null);
  useEffect(() => () => { if (reiterToastTimer.current) window.clearTimeout(reiterToastTimer.current); }, []);
  const [suche, setSuche] = useState('');
  // Rank 9 (QS-PERF, §15/3): entprellter Suchwert. Das Eingabefeld bleibt sofort
  // responsiv (`suche`), aber die TEUREN Ableitungen — Treffer-Filter über ~1000
  // Artikel + IntersectionObserver-Neuaufbau — laufen erst ~200 ms nach dem letzten
  // Tastendruck über `sucheDebounced` statt bei JEDEM Zeichen (Jank auf schwacher
  // CPU). LEEREN wirkt SOFORT (kein Lag beim Suche-Verlassen / Treffer→Artikel-Sprung,
  // `springeZuArtikel` setzt setSuche('')). Reine Timing-Optimierung (§6.4): ändert
  // nur WANN gefiltert wird, nie WAS (dieselbe passtAufSuche-Menge, dieselbe Ansicht).
  const [sucheDebounced, setSucheDebounced] = useState('');
  useEffect(() => {
    // Leeren: 0 ms (praktisch sofort, ein Tick — kein Lag beim Suche-Verlassen /
    // Treffer→Artikel-Sprung). Tippen: 200 ms entprellt. Beide über setTimeout,
    // damit kein synchrones set-state-in-effect entsteht (Muster wie UniversalSuche).
    const id = window.setTimeout(() => setSucheDebounced(suche), suche === '' ? 0 : 200);
    return () => window.clearTimeout(id);
  }, [suche]);
  // Scrollposition VOR der Suche merken → beim Leeren der Suche dorthin zurück,
  // statt an den Anfang zu springen (Auftrag David). Ein Treffer-Klick nullt das
  // (springt stattdessen zum Artikel).
  const scrollVorSuche = useRef<number | null>(null);
  const sucheVorher = useRef('');
  // Auf-/Zu-Zustand des FLIESSTEXTS (Sektionen im Lesefluss). Default OFFEN
  // (renderSektion mit defOpen=true) — Fedlex-treu der ganze Erlass lesbar; jede
  // Stufe ist per SektionKopf-Toggle einzeln einklappbar. Eigener State, vom TOC
  // entkoppelt (D, Auftrag David 26.6.2026).
  useEffect(() => {
    const key = erlass?.key;
    if (!key) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      // W2·7-BEZUG/B4: im ERWEITERTEN Facetten-Zustand lädt `useBezuege` den
      // Bezugs-Shard (Obermenge) — dann bleibt der schlanke Leitfall-Shard
      // ungeladen. Nicht aus Sparsamkeit allein: beide zu laden brächte
      // dieselben BGE-Kanten zweimal über die Leitung und liesse die Zeile
      // zweimal einwachsen (zweiter Layout-Sprung, §15/CLS).
      if (!bezuegeErweitert) {
        void ladeLeitfallShard(key).then((shard) => { if (lebt) setLeitfallShard({ key, shard }); });
      }
      void ladeRevisionShard(key).then((shard) => { if (lebt) setRevisionShard({ key, shard }); });
      // G-HIST-UI: Historie-Shard (Bund; Kanton 404 → null → still kein Badge, §8).
      void ladeHistorieShard(key).then((shard) => { if (lebt) setHistorieShard({ key, shard }); });
    });
    return () => { lebt = false; abbrechen(); };
  }, [erlass?.key, bezuegeErweitert]);
  // Artikel-Token → Leitfälle des AKTUELLEN Erlasses (sonst undefined = keine Zeile).
  const leitfaelleFuer = useCallback((artikel: string) => (
    erlass && leitfallShard?.key === erlass.key
      ? leitfallShard.shard?.proArtikel[normArtikelToken(artikel)]
      : undefined
  ), [erlass, leitfallShard]);
  // Revision r(a) des AKTUELLEN Erlass-Artikels (§V1c): undefined = Shard
  // fehlt/lädt/Erlass nicht abgedeckt (⇒ 'unbekannt'); null = Urfassung (⇒ 'gleich');
  // Objekt = letzte Textänderung. Stabile Referenz aus dem Shard → memo-freundlich.
  const revisionFuer = useCallback((artikel: string) => (
    erlass && revisionShard?.key === erlass.key
      ? revisionFuerToken(revisionShard.shard, artikel)
      : undefined
  ), [erlass, revisionShard]);
  // G-HIST-UI: Artikel-Token → Fassungshistorie des AKTUELLEN Erlasses (sonst
  // undefined = kein Badge). Direkter Roh-Token-Lookup (Snapshot/Shard gleiche
  // Extraktion). Stabile Referenz aus dem Shard → memo-freundlich.
  const historieFuer = useCallback((artikel: string) => (
    erlass && historieShard?.key === erlass.key
      ? historieFuerArtikel(historieShard.shard, artikel)
      : undefined
  ), [erlass, historieShard]);

  const [offen, setOffen] = useState<Record<string, boolean>>({});
  // Eigener Auf-/Zu-Zustand NUR für den TOC-Baum (entkoppelt vom Fliesstext).
  // Default ZU (SektionBaumTOC: `?? false`); beim Scrollen klappt der Spy die
  // aktive Sektion auf und beim Verlassen wieder zu (K) — manuell geöffnete
  // Zweige bleiben offen (autoOffenRef).
  const [tocBaum, setTocBaum] = useState<Record<string, boolean>>({});
  // Während eines Klick-Sprungs den Scroll-Spy stilllegen, damit der Baum nicht
  // durch die durchscrollten Zwischen-Sektionen flackert (auf/zu).
  const jumpLock = useRef(false);
  // K (Auftrag David 26.6.2026): Zweige, die der Scroll-Spy AUTOMATISCH geöffnet
  // hat. Nur diese darf der Spy wieder zuklappen, sobald die Leseposition den
  // Zweig verlässt — manuell (Klick) geöffnete Zweige bleiben offen, weil sie
  // nicht in diesem Set stehen (tocToggle/springeZuSektion nehmen sie heraus).
  const autoOffenRef = useRef<Set<string>>(new Set());
  // §15.2-Nachlauf (18.7.2026): Tick des letzten Aktiv-Vorkommens je Auto-Zweig +
  // monotoner Pfadwechsel-Zähler. Der Spy klappt einen Auto-Zweig erst zu, wenn er
  // AUTO_ZU_NACHLAUF Pfadwechsel aus dem aktiven Pfad heraus ist (dann off-screen →
  // CLS-frei); verhindert das sichtbare Auf-/Zuklappen beim Hin-und-Her-Scrollen.
  const autoTickRef = useRef<Map<string, number>>(new Map());
  const autoTickNowRef = useRef(0);
  // Zweige, die der NUTZER selbst aufgeklappt hat (Klick/Sprung). Der Scroll-Spy
  // darf diese NIE ins Auto-Set adoptieren und NIE auto-zuklappen — auch dann
  // nicht, wenn die Leseposition durch sie hindurchscrollt (David: «nur was
  // automatisch geöffnet wurde, geht wieder zu»).
  const manuellOffenRef = useRef<Set<string>>(new Set());
  // Zweige, die der NUTZER selbst zugeklappt hat — auch wenn sie im aktiven
  // Lesepfad liegen. Der Scroll-Spy darf sie NICHT wieder auto-aufklappen,
  // solange der Nutzer sie nicht selbst wieder öffnet (sonst überschreibt der
  // Spy das explizite Einklappen des gerade gelesenen Zweigs).
  const manuellZuRef = useRef<Set<string>>(new Set());
  // Manuelles Auf-/Zuklappen im TOC: beim Öffnen in manuellOffenRef aufnehmen
  // (bleibt offen) + aus manuellZuRef nehmen; beim Schliessen umgekehrt (in
  // manuellZuRef, aus manuellOffenRef); nie im Auto-Set (K).
  // Rank 4 (QS-PERF, §15/4): useCallback ([] — liest nur setTocBaum + stabile Refs),
  // sonst hätte onToggle bei jedem Parent-Render neue Identität und die React.memo-
  // Wrapper von SektionBaumTOC liefe bei jeder Scroll-Spy-Aktualisierung leer.
  const tocToggle = useCallback((id: string) => {
    setTocBaum((o) => {
      const offenJetzt = !o[id];
      autoOffenRef.current.delete(id); autoTickRef.current.delete(id);
      if (offenJetzt) { manuellOffenRef.current.add(id); manuellZuRef.current.delete(id); }
      else { manuellOffenRef.current.delete(id); manuellZuRef.current.add(id); }
      return { ...o, [id]: offenJetzt };
    });
  }, []);
  const [aktivIds, setAktivIds] = useState<string[]>([]); // Sektions-IDs (TOC-Markierung, eindeutig)
  const [tocAuf, setTocAuf] = useState(false); // unter lg: Gliederungs-Drawer offen?
  const [tocOffen, setTocOffen] = useState(true); // ab lg: Gliederungsspalte ein-/ausklappen
  // 2-Spalten-Erkennung. R2 (Auftrag David 30.6.2026): Schwelle von 1280px auf
  // 1024px (Tailwind lg) gesenkt → die linke Gliederungsspalte erscheint schon auf
  // kleineren Laptops «grundsätzlich», nicht erst ab 1280px. 1024px deckt sich mit
  // der Schwelle der persistenten App-Seitenleiste (lg) UND mit PANE_BREIT_PX (1024)
  // des Pane-Pfads → unter lg sind sowohl Seitenleiste als auch Gliederung Drawer
  // (kohärent, «nur bei echt-zu-klein in den Drawer»). Die Lesespalte bleibt nutzbar:
  // Inhaltsbreite ist auf max-w-content (70rem) gedeckelt, abzüglich 16rem TOC + gap-8
  // läuft der Fliesstext (max-w-normtext 42rem, E6/A37) nie unter ~26rem. SSR-Default false =
  // mobil-Layout (byte-gleich). Ohne diese Erkennung behandelte der Code «tocOffen»
  // fälschlich als 2-Spalten-aktiv → der Gliederungs-Zugang verschwand beim Scrollen.
  // §15.2 «Client-Initialstate auf den Server-Zustand pinnen»: den WAHREN
  // Viewport-Stand schon im ERSTEN Client-Render lesen (lazy Initializer),
  // nicht erst per useEffect nach dem Mount. Sonst rendert der Client (der per
  // createRoot frisch mountet, kein hydrateRoot — §15.5) zuerst mit `false`
  // = 1-Spalten-Layout und flippt danach auf `true` = 2-Spalten-Grid
  // (`grid-cols-[16rem_…]`) → die gesamte Lesespalte reflowt = grosser Layout-
  // Shift. Unter CPU-Last (CI: 6 parallele Tore-Jobs) verlor dieser useEffect
  // das Rennen gegen den Snapshot-Fetch: die Artikel rendern 1-spaltig, DANN
  // flippt der Effekt → byte-identischer 0,49-CLS (verweis-u «Plural-Sprung»).
  // SSR/Prerender: `window` ist undefiniert → `false` (Mobil-Layout,
  // renderToString byte-gleich; die Erlass-Detailseiten kommen ohnehin aus dem
  // separaten String-Builder `erlassVolltextHtml`, nicht aus dieser Komponente).
  const [istXlVp, setIstXlVp] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const upd = () => setIstXlVp(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);
  const { imPane, rolle, wurzel, overlayWurzel } = usePaneKontext();
  // Split-View E (Container-responsiv): ein Pane wählt sein Layout nach SEINER
  // Breite, nicht nach dem Viewport. `istXl` (treibt 2-Spalten-Gliederung + Drawer-
  // vs-Sidebar) kommt im Pane aus einem ResizeObserver auf der Pane-Wurzel (Schwelle
  // PANE_BREIT_PX = 1024), sonst aus matchMedia (1024px, R2) — beide Pfade ab 1024.
  // Reines @container-CSS reicht hier NICHT: istXl steuert bedingtes Rendering
  // (Vollbar/Kompaktknopf, Existenz des Drawers), das CSS nicht schalten kann.
  const PANE_BREIT_PX = 1024;
  const [istBreit, setIstBreit] = useState(false);
  useEffect(() => {
    // Kein Reset bei !imPane nötig: istXl ignoriert istBreit dann ohnehin.
    if (!imPane || !wurzel?.current || typeof ResizeObserver === 'undefined') return;
    const el = wurzel.current;
    const ro = new ResizeObserver((eintraege) => {
      // border-box (inkl. Scrollbar) → die Scrollbarbreite verschiebt den
      // Schwellenvergleich nicht (kein Flackern an der 1024px-Grenze).
      for (const e of eintraege) {
        const w = e.borderBoxSize?.[0]?.inlineSize ?? e.contentRect.width;
        setIstBreit(w >= PANE_BREIT_PX);
      }
    });
    ro.observe(el, { box: 'border-box' });
    return () => ro.disconnect();
  }, [imPane, wurzel]);
  const istXl = imPane ? istBreit : istXlVp;
  // A3: aktuell gelesener Artikel (live) für den Einzelansicht-Kopf. Nur in der
  // Einzelansicht (!imPane) gepflegt; im Split-View trägt der PaneKopf den Titel.
  const meldeInhaltsKopf = useMeldeInhaltsKopf();
  const [aktArtikel, setAktArtikel] = useState<string | null>(null);
  // B-2.5: In einem Pane scopen wir DOM-Queries + Scroll auf die Pane-Wurzel
  // (sonst kollidieren doppelte `art-`-IDs / trifft der Scroll das falsche Pane).
  // NUR ein SEKUNDÄRES Pane unterdrückt globale URL-/Reiter-Writes — das primäre
  // Pane IST die URL und pflegt sie wie heute. Ausserhalb eines Panes alles wie bisher.
  const istSekundaer = rolle === 'sekundaer';
  // W2·5d G2b (Fussnoten-Unifizierung): der frühere `fussnotenAuf`-React-Schalter
  // (Such-Leiste, Default AUS) entfällt — die Fussnoten-Bedienung ist jetzt EINE
  // (der data-fussnoten-Toggle der Options-Leiste, Default AN). Marker + Apparat
  // liegen IMMER im DOM (R9/§8, Ctrl+F/Print/Screenreader); «AUS» dämpft rein per
  // CSS (index.css), versteckt nie. Kein React-State-Zweig mehr im Artikel-Baum.
  // W2·5d G2a: Die Gruppierungs-/Gliederungslinien werden nicht mehr per
  // component-local useState geschaltet (das rendert die Artikelliste neu, §15),
  // sondern über den globalen data-linien-Toggle der Options-Leiste
  // (leserOptionen.tsx) rein per CSS. renderSektion emittiert Guide + Einzug
  // darum IMMER (wie der frühere Default AN → Markup byte-gleich); `[data-linien
  // ="aus"]` blendet Guide + Einzug per CSS aus (index.css, gescopt auf .lc-leser).
  // N13: amtliche Kanton-Systematik (lazy) — liefert das echte Sachgebiet eines
  // kantonalen Erlasses für die Reader-Overline (statt Einheits-«Öffentliches Recht»).
  const [kantonSys, setKantonSys] = useState<Record<string, KantonSystematik>>({});
  // BGer-Entscheide/Materialien/Werkzeuge zu diesem Erlass: das einheitliche
  // KontextPanel (B3) lädt + zeigt sie selbst (Single Source, §5) — am Leseende.
  const sekRefs = useRef<Map<string, HTMLElement>>(new Map());
  // Mobiler Suche-&-Gliederung-Drawer (role=dialog): Esc-Schliessen, Fokus
  // setzen + fangen, Fokus-Rückgabe an den Auslöser über den geteilten Hook (§5).
  const tocDrawerRef = useRef<HTMLDivElement | null>(null);
  useDialogFokus(!istXl && tocAuf, tocDrawerRef, () => setTocAuf(false));
  // Live-Label des aktiven Reiters beim Scrollen entprellen (Trailing-Debounce):
  // sonst ein localStorage-Write + globales TABS_EVENT pro überschrittener
  // Artikelgrenze (Scroll-Jank auf langen Erlassen). Reine Timing-Optimierung (§6.4).
  const tabArtikelTimer = useRef<number | null>(null);
  // Entprellt die Kopf-Artikel-Meldung: beim schnellen Durchscrollen sonst ein
  // setKopfDaten (Shell) pro Artikelgrenze → unnötige Re-Renders der übrigen Panes.
  const aktArtikelTimer = useRef<number | null>(null);
  // E7/A33-F3 (RC2): das automatische Auf-/Zuklappen des aktiven Zweigs (K) wird
  // entprellt — analog aktArtikelTimer/tabArtikelTimer. Beim schnellen Durchscrollen
  // sonst eine dichte Reflow-Folge des Gliederungsbaums (Δ~100 px pro Zweigwechsel),
  // die den TOC in Eigenbewegung versetzt («Gliederung springt umher», David 16.7.).
  const tocBaumTimer = useRef<number | null>(null);
  // E7/A33-F2 (RC1b): Zeitstempel der letzten NUTZER-Bedienung des TOC (wheel/
  // pointerdown/touchstart). Solange der Nutzer die Gliederung aktiv durchblättert,
  // pausiert das automatische Nachführen (Mitscroll-Effekt) — sonst reisst eine
  // verspätete Rückhol-Bewegung das manuelle Erkunden zurück (Symptom 3). Kein
  // `scroll`-Event als Auslöser: der eigene programmatische Scroll würde den Guard
  // sonst selbst armieren.
  const tocTouchRef = useRef(0);

  // §6.6-Split: Datenladung (Manifest/Currency/Struktur/Kopf/Kanton-Systematik/
  // Erlass/Einträge, Case-Redirect N0b, pdf-embed/nur-live-link) + Browser-Tab-Titel
  // + Kopf-Aufräumen — verhaltensneutral in ./inhalt-hooks. Drei useEffects in
  // exakt dieser Reihenfolge wie zuvor inline (Hook-Reihenfolge erhalten).
  useLeserDaten({
    ebene, schluessel, navigate, erlass, istSekundaer, meldeInhaltsKopf,
    setManifest, setCurrency, setStruktur, setKopf, setKantonSys, setErlass, setEintraege, setFehler,
  });

  // ═══ ABSCHNITT · Abgeleitete Werte (Gliederungsbaum, Linien-Profil, Sektions-
  // Positionen/-Meta/-Labels, Randtitel) — useMemo, Rechenkerne in ./berechnungen.ts ═══
  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );

  // E4/A36: kuratierter Baum NUR für die GLIEDERUNG (SektionBaumTOC) — die
  // Lesespalte (renderSektion unten) arbeitet weiter auf dem vollen `sektionen`
  // (§15-Treue: Inhalt/Anker/Ctrl+F/Print vollständig; reine TOC-Kuration).
  const tocSektionen = useMemo(() => kuratiereTocSektionen(sektionen), [sektionen]);


  // W2·5d U-LINIEN (A8): das Linien-Regelwerk «wann welche Linie» leitet der Reader
  // aus dem TATSÄCHLICHEN Aufbau des Erlasses ab (Struktur-Sidecar: Gliederungstiefe
  // + Artikel-Dichte je Ebene), NICHT mehr aus der grundart-Schublade (der frühere
  // K11-Default «nur KODIFIKATION»). `guideEbene` sagt renderSektion, welche Sektions-
  // tiefe den EINEN vertikalen Guide trägt; `autoGuide` steuert den Auto-Default
  // (data-guide-auto am .lc-leser → index.css). Reine Darstellung (§3, SSoT
  // linienAufbau.ts, im Tor `check:linien-kanon` korpusweit gegated).
  const linien = useMemo(() => linienProfil(struktur), [struktur]);

  // V2·K-2: Gesamtzahl der Fussnoten aus dem Struktur-Sidecar (Kopf-Signal + Zähler
  // am Fussnoten-Chip). null = Sidecar noch nicht geladen ⇒ der Chip erscheint erst
  // danach (kein Zahl-Nachwachsen im Kopf → CLS-schonend). EINMAL je Sidecar berechnet.
  const fussnotenAnzahl = useMemo<number | null>(() => {
    if (!struktur) return null;
    let n = 0;
    for (const v of Object.values(struktur)) n += v?.fussnoten?.length ?? 0;
    return n;
  }, [struktur]);

  // §6.6-Split: Kopf-Meldung (Breadcrumb · Stand · Live-Artikel · Ansicht-/Such-Slot)
  // — verhaltensneutral in ./inhalt-hooks (EIN useEffect, identische Deps). Steht
  // NACH `linien`/`fussnotenAnzahl` (TDZ des A26-Ansicht-Slots), wie zuvor inline.
  useInhaltsKopfMeldung({
    erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, linien, fussnotenAnzahl,
    kantoneVerfuegbar,
    suche, setSuche, istXl, tocOffen, tocAuf, setTocOffen, setTocAuf, sektionen,
  });

  // Dokument-Position (Index des ersten enthaltenen Artikels) je Sektion — EINMAL
  // bottom-up berechnet, damit renderSektion die Kinder + direkten Artikel eines
  // Knotens in Dokument-Reihenfolge mischen kann, ohne pro Scroll-Render erneut den
  // Teilbaum zu durchlaufen (6b: Knoten tragen seit der Randtitel-Promotion oft
  // beides). Reine Darstellung (§3).
  const sekPos = useMemo(() => berechneSekPos(sektionen, eintraege), [sektionen, eintraege]);

  // Dokument-Position je Artikel-Token (für den Artikel-Bereich «Art. 1–10» in den
  // Sektionsüberschriften).
  const artIndex = useMemo(() => {
    const map = new Map<string, number>();
    (eintraege ?? []).forEach((e, i) => map.set(e.artikel, i));
    return map;
  }, [eintraege]);

  // Rank 4 (QS-PERF, §6.4): Sektions-Bereichslabel («Art. 1–10») + Artikelzahl
  // EINMAL bottom-up vorberechnen — statt 2× O(Subtree) je Sektion je Scroll-Render
  // (bisher rief renderSektion sekBereich(s) UND sammleArtikel(s).length je Knoten,
  // jeweils den Teilbaum sammelnd). Deps [sektionen, artIndex] → nur bei echtem
  // Gliederungs-/Index-Wechsel neu. Die Label-Logik ist byte-identisch zur früheren
  // sekBereich/sammleArtikel (golden/struktur-konsistenz grün). Reine Darstellung (§3).
  const sektionMeta = useMemo(() => berechneSektionMeta(sektionen, artIndex), [sektionen, artIndex]);

  // M13: Token → korrektes Anzeige-Label («Art. 3», «Art. 31–32») für den
  // Scroll-Spy-/Reiter-Kopf. Schlusstitel-Token («disp_u1_art_3») lassen sich
  // NICHT heuristisch aus dem Token ableiten — hier den echten artikelLabel des
  // Eintrags nehmen (Haupttext byte-gleich: dort ist es ohnehin «Art. <token>»).
  const artLabelByToken = useMemo(() => {
    const map = new Map<string, string>();
    (eintraege ?? []).forEach((e) => map.set(e.artikel, labelMitBereich(e.artikelLabel, e.artikel)));
    return map;
  }, [eintraege]);

  // Ueberschrift je Artikel im FLIESSTEXT: nur noch die artikel-EIGENE
  // Sachueberschrift (das Randtitel-Blatt). Die uebergeordneten, von mehreren
  // Artikeln geteilten Randtitel-Gruppierungen (A. ... -> II. ...) sind seit 6b
  // eigene, einklappbare Gliederungs-Knoten (baueGliederungsbaum) und erscheinen
  // als Sektions-Ueberschriften -- sie hier zusaetzlich je Artikel zu wiederholen,
  // waere die vom Auftrag gewarnte Doppel-Darstellung. Hat der Artikel keine eigene
  // Sachueberschrift (blatt = null, z. B. aufgehoben), faellt ArtikelLeser auf
  // e.titel zurueck. Form wie die Such-/Volltextsicht erwartet ({ teile, ab }); das
  // Blatt wird ueber margStufeStil(_, istBlatt=true) prominent gesetzt. Reine
  // Darstellung (Sektions-Knoten zur Laufzeit abgeleitet, Sidecars unberuehrt).
  const margAnzeige = useMemo(() => {
    const map = new Map<string, { teile: string[]; ab: number }>();
    for (const e of eintraege ?? []) {
      const { blatt } = randtitelKnoten(struktur?.[e.artikel]?.marginalie ?? []);
      map.set(e.artikel, { teile: blatt ? [blatt] : [], ab: 0 });
    }
    return map;
  }, [eintraege, struktur]);

  // Interner Artikel-Sprung (Querverweise im Wortlaut): Vorfahren öffnen, scrollen,
  // Permalink setzen — derselbe Mechanismus wie der Hash-Sprung.
  // ═══ ABSCHNITT · Navigation & Sprünge (Artikel/Sektion, Hash, Permalink, Scroll-Spy) ═══
  const springeZuArtikel = useCallback((token: string) => {
    // Im Suchmodus erst die Suche verlassen, sonst ist das Ziel nicht im DOM
    // (nur Treffer gerendert) → Permalink änderte sich ohne Sprung. Kein Zurück
    // zur Vor-Such-Position (wir springen ja gezielt zum Artikel).
    scrollVorSuche.current = null;
    setSuche('');
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    if (ids.length) {
      setOffen((o) => { const n = { ...o }; for (const id of ids) n[id] = true; return n; });
      // TOC sofort auf den Zielpfad + Spy während des (zweistufigen, wegen
      // content-visibility ungenauen) Sprungs stilllegen — sonst flackert der Baum
      // durch die kurz zentrierten Zwischensektionen auf/zu. autoOffenRef/manuellOffenRef
      // bleiben unangetastet (der Zweig wird vom Spy normal nachgeführt + collabiert
      // beim Wegscrollen wieder), nur ein evtl. manuelles ZU wird aufgehoben.
      for (const id of ids) manuellZuRef.current.delete(id);
      // F3: einen noch schwebenden Auto-Akkordeon-Timer verwerfen — der Klick-Sprung
      // setzt den Zielpfad sofort und autoritativ; ein verspäteter Auto-Update dürfte
      // ihn nicht überschreiben.
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      jumpLock.current = true;
    }
    if (typeof window === 'undefined') return;
    // ?search (Instanz-Diskriminator ?r) erhalten, sonst verliert ein Mehrfach-
    // Reiter seine Identität. Aktiven Reiter auf diesen Artikel melden → Live-
    // Label «Kürzel – Art. X» bei Mehrfach-Instanz (Auftrag David).
    // Sekundäres Pane: NIE die Haupt-URL/-Reiter überschreiben (es ist nicht die
    // adressierte Seite). Primär/1-Pane: wie heute URL + Reiter-Live-Label pflegen.
    if (!istSekundaer) {
      const ziel = `${basisPfad}${window.location.search}#art-${token}`;
      window.history.replaceState(null, '', ziel);
      aktualisiereTabArtikel(ziel);
    }
    // Erst nach dem Aufklapp-Render scrollen (behavior:auto wie der Hash-Sprung);
    // grosse Sektionen wachsen beim Aufklappen → nach Settle ein Korrektur-Scroll.
    const scrolle = () => {
      const el = findeArt(paneRoot(imPane, wurzel), token);
      if (!el) return;
      // R1: an den OBEREN Lese-Rand sprungen (block:'start' + nt-anker-scroll-margin
      // ≈5rem) statt zentrieren — deckt sich mit der oben angesetzten Scroll-Spy-
      // Bezugslinie, sonst markierte der Spy nach dem Sprung den Vorgänger-Artikel.
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => {
      scrolle();
      window.setTimeout(() => { scrolle(); jumpLock.current = false; }, 400);
    }, 110));
  }, [sektionen, basisPfad, istSekundaer, imPane, wurzel]);

  // Sprung aus dem Gliederungs-Baum (TOC): Pfad öffnen, markieren, scrollen. Beim
  // Sprung den mobilen Drawer schliessen (analog Seitenleiste). Rank 4 (QS-PERF,
  // §15/4): useCallback [sektionen] — nur pfadZu liest sektionen, alle Setter/Refs
  // stabil → SektionBaumTOC (React.memo) re-rendert nur bei aktivPfad-/offen-Wechsel.
  // Muss ÜBER dem early-return (`!erlass || !eintraege`) stehen, sonst wäre der Hook
  // bedingt (Rules of Hooks) — das war der in Batch 1 zurückgestellte Reorder.
  const springeZuSektion = useCallback((id: string) => {
    const ids = pfadZu(sektionen, (s) => s.id === id) ?? [id];
    jumpLock.current = true;
    // F3: schwebenden Auto-Akkordeon-Timer verwerfen (Klick-Sprung ist autoritativ).
    if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
    // Sprung-Ziel als MANUELL behandeln (K): in manuellOffenRef aufnehmen und aus
    // dem Auto-Set nehmen, damit der Scroll-Spy den angesprungenen Zweig nicht
    // gleich wieder zuklappt.
    for (const x of ids) { autoOffenRef.current.delete(x); autoTickRef.current.delete(x); manuellOffenRef.current.add(x); manuellZuRef.current.delete(x); }
    // §15.2: der Klick öffnet den TOC-Zweig — diese Höhenänderung SYNCHRON im
    // Klick-Task committen (flushSync), damit der Layout-Shift des einwachsenden
    // Gliederungs-Zweigs dem Input zugerechnet wird (hadRecentInput ⇒ CLS-frei).
    // Ohne flushSync verzögert React unter CPU-Last (CI: 6 parallele Tore-Jobs)
    // den Commit über das 500-ms-Input-Fenster hinaus → der Shift zählt als
    // unerwartet (leser-kopf-a9 «Breadcrumb-Fluss» Mikro-CLS).
    flushSync(() => {
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
      setOffen((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
      setTocAuf(false); // mobilen Drawer schliessen
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sekRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
      // §15.2: den Scroll-Spy bis NACH dem Einschwingen des programmatischen Scrolls
      // gesperrt halten (jumpLock). Sonst feuert der IntersectionObserver, sobald der
      // Sprung-Scroll einläuft, und klappt den aktiven TOC-Zweig auf/zu — eine
      // Höhenänderung im Sticky-Gliederungsbaum, die (nicht input-nah) als
      // unerwarteter CLS zählt. Unter CPU-Last läuft der Scroll spät ein, darum ein
      // Zeit- statt rAF-Fenster (wie springeZuArtikel); der Spy nimmt die Endposition
      // danach normal auf. Reine Timing-Steuerung (kein setState) → kein Re-Render.
      window.setTimeout(() => { jumpLock.current = false; }, 500);
    }));
  }, [sektionen]);

  // Wechsel zwischen zwei Instanzen DESSELBEN Gesetzes (?r) bzw. ein Tab-Klick mit
  // #art-Anker remountet den Reader nicht (gleicher pathname) — darum bei jeder
  // Navigation mit Artikel-Anker gezielt dorthin springen (Auftrag David: Klick
  // auf den Reiter führt zum gemerkten Artikel der Instanz).
  const letzteNavKey = useRef<string | null>(null);
  useEffect(() => {
    if (!sektionen.length || typeof window === 'undefined') return;
    if (istSekundaer) return; // sekundäres Pane: location.key ist fix («default»), kein Instanz-Wechsel
    // Nur bei ECHTER Navigation (location.key wechselt), nicht wenn sektionen
    // nachlädt. Den Initial-Load (erster key) deckt der Lade-Hash-Effekt ab →
    // kein doppelter Sprung/Blink. Dieser Effekt trägt nur den Instanz-Wechsel
    // (gleicher pathname, nur ?r/#).
    if (letzteNavKey.current === location.key) return;
    const erstmalig = letzteNavKey.current === null;
    letzteNavKey.current = location.key;
    if (erstmalig) return;
    const m = location.hash.match(/^#art-(.+)$/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    const id = window.requestAnimationFrame(() => springeZuArtikel(token));
    return () => window.cancelAnimationFrame(id);
  }, [location.key, location.hash, sektionen, springeZuArtikel, istSekundaer]);

  // Suche aktivieren → an den Anfang scrollen; Suche schliessen/leeren → an die
  // Scrollposition VOR der Suche zurück (Auftrag David). Grund fürs Hoch-Scrollen
  // beim Aktivieren (Bug David 26.6.2026): die Trefferliste ist kürzer als der
  // Volltext — war man tief gescrollt, rutschte der sticky-Container (Suchleiste +
  // Gliederung) mit seinem geschrumpften Inhalt über den Viewport hinaus und war
  // «aus dem Bild». Nach oben scrollen holt Suchleiste + Gliederung zurück ins
  // Sichtfeld. Reine Scroll-Steuerung (kein setState) → keine Render-Kaskade.
  useEffect(() => {
    // An `sucheDebounced` gekoppelt (nicht `suche`): der Ansichtswechsel Volltext↔
    // Trefferliste erfolgt über `treffer` (aus sucheDebounced), darum muss die
    // Scroll-Rettung/-Rückgabe mit genau diesem Moment fluchten (Rank 9).
    const war = sucheVorher.current;
    sucheVorher.current = sucheDebounced;
    if (typeof window === 'undefined') return;
    // Im Pane scrollt der Pane-Container, nicht das Fenster (B-2.5).
    const sc = paneRoot(imPane, wurzel);
    const hole = () => sc ? sc.scrollTop : window.scrollY;
    const setze = (y: number) => sc ? sc.scrollTo(0, y) : window.scrollTo(0, y);
    if (!war && sucheDebounced) {
      scrollVorSuche.current = hole();
      window.requestAnimationFrame(() => setze(0));
    } else if (war && !sucheDebounced && scrollVorSuche.current != null) {
      const y = scrollVorSuche.current;
      scrollVorSuche.current = null;
      window.requestAnimationFrame(() => setze(y));
    }
  }, [sucheDebounced, imPane, wurzel]);

  // Token-Auflösung für bare Artikelverweise (normalisiert «6a» → Token «6_a»).
  const internRefs = useMemo<InternRefs | undefined>(() => {
    if (!eintraege) return undefined;
    const tokenMap = new Map<string, string>();
    for (const e of eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
    // W2·5d U-POSITION/A16: ein Klick auf einen Verweis IM Text ist nutzer-initiiert
    // und soll einen echten History-Eintrag anlegen, damit Browser-/UI-Zurück exakt
    // an den Ausgangs-Artikel zurückkehrt. In der PRIMÄR-/Einzelansicht darum über
    // den Router navigieren (react-router besitzt die History; der letzteNavKey-
    // Effekt führt den eigentlichen Sprung aus, ScrollWiederherstellung/ScrollZuHash
    // stellt beim Zurück die Ausgangsstelle her — Anker bei hashlosem Ausgang,
    // #art-Hash bei Hash-Ausgang). Ein MANUELLES pushState würde react-router
    // desynchronisieren (Zurück löste dann keinen Location-Wechsel aus → kein
    // Rück-Sprung). Im SEKUNDÄREN Pane bleibt der direkte Sprung (eigene Pane-
    // History, scrollt den Pane-Container; kein globaler Router-Eingriff, B-2.5).
    const springeZuRef = (t: string) => {
      if (istSekundaer) { springeZuArtikel(t); return; }
      navigate(`${basisPfad}${window.location.search}#art-${t}`);
    };
    return { tokenMap, basisPfad, springeZu: springeZuRef };
  }, [eintraege, basisPfad, springeZuArtikel, istSekundaer, navigate]);

  // §6.6-Split: der FLIESSTEXT-Offen-Zustand (istOffen/toggle) lebt jetzt in der
  // Volltext-Ansicht (./inhalt-volltext), `oeffnePfad` im Sprung-/Spy-Hook
  // (./inhalt-hooks) — beide arbeiten weiter auf demselben `offen`/`setOffen`.

  // §6.6-Split: Hash-Sprung-Seed + geteilter Aktiv-Artikel-Beobachter (Scroll-Spy) +
  // TOC-Mitscroll + Nutzer-Interaktions-Guard + Scroll-Anker — verhaltensneutral in
  // ./inhalt-hooks. Acht Hooks (2 useRef + 6 useEffect) in EXAKT der bisherigen
  // Reihenfolge; alle geteilten Refs/Setter/abgeleiteten Werte werden durchgereicht,
  // damit tocToggle/springeZuArtikel/springeZuSektion weiter dieselben Refs treffen.
  useLeserSprungSpy({
    ebene, schluessel, eintraege, sektionen, ohneGliederung, istSekundaer, imPane, wurzel,
    paneLocationHash: location.hash, basisPfad, offen, sucheDebounced, aktivIds, tocBaum,
    istXl, tocOffen, artLabelByToken, setOffen, setAktArtikel, setAktivIds, setTocBaum,
    refs: {
      jumpLock, autoOffenRef, autoTickRef, autoTickNowRef, manuellOffenRef, manuellZuRef,
      tocBaumTimer, tabArtikelTimer, aktArtikelTimer, tocTouchRef,
    },
  });


  const sucheTrim = sucheDebounced.trim().toLowerCase(); // Rank 9: entprellt (nicht `suche`)
  // ═══ ABSCHNITT · In-Gesetz-Suche & Treffer ═══
  const treffer = useMemo(
    () => (eintraege && sucheTrim ? eintraege.filter((e) => passtAufSuche(e, sucheTrim)) : null),
    [eintraege, sucheTrim],
  );

  const { vorher, nachher } = useMemo(() => {
    if (!manifest || !erlass) return { vorher: null as BrowseErlass | null, nachher: null as BrowseErlass | null };
    const g = manifest.erlasse.filter((e) => e.ebene === erlass.ebene && e.status === 'snapshot');
    const i = g.findIndex((e) => e.key === erlass.key);
    return { vorher: i > 0 ? g[i - 1] : null, nachher: i >= 0 && i < g.length - 1 ? g[i + 1] : null };
  }, [manifest, erlass]);

  // A35 (David 16.7.2026): Suchtreffer im Text markieren. Wenn die Trefferliste
  // steht, den Suchbegriff als reine Paint-Schicht (CSS Custom Highlight API,
  // suchHighlight.ts) über die gerenderten Artikel legen — keine DOM-Mutation,
  // kein Reflow (CLS 0), keine Berührung von Autolinks/Fussnoten/Zitat-Marken.
  // rAF: erst NACH dem Treffer-Render (Artikel im DOM); Cleanup löscht die
  // Highlight-Menge (Suche verlassen / Erlass wechseln). Ausser-Bestand-neutral,
  // da `treffer===null` (kein Suchmodus) sofort löscht.
  const trefferRef = useRef<HTMLDivElement | null>(null);
  // Handle auf den noch nicht gefeuerten Setz-rAF, damit ihn AUCH der Sofort-
  // Aufräumer unten abbestellen kann (React Compiler ist AUS, §15/4 → Ref).
  const highlightRaf = useRef<number | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!treffer) { setzeSuchHighlight(null, ''); return; }
    const id = window.requestAnimationFrame(() => setzeSuchHighlight(trefferRef.current, sucheTrim));
    highlightRaf.current = id;
    return () => { window.cancelAnimationFrame(id); highlightRaf.current = null; setzeSuchHighlight(null, ''); };
  }, [treffer, sucheTrim]);

  // A35-Sofort-Aufräumer (Befund 20.7.2026, Shard 3/3). Das Löschen der Highlight-
  // Registry hing bisher AUSSCHLIESSLICH am Effekt oben — und der läuft erst, wenn
  // `treffer` über den ENTPRELLTEN `sucheTrim` auf null kippt. Genau dieser Commit
  // ist der teuerste des Readers: die Trefferliste weicht dem vollständigen
  // Volltext-Baum (OR: 1686 Artikel-Knoten neu gemountet). Gemessen von der Leerung
  // des Feldes bis zum `CSS.highlights.delete`: ~2,4 s ohne Drossel, 9,8 s bei 4×,
  // 21,9 s bei 8× CPU-Drossel — auf dem 2-vCPU-Runner reisst das reihum das
  // 15-s-Prüfbudget des A35-Specs, und der Nutzer sieht die Markierung sekundenlang
  // weiterleuchten, obwohl das Suchfeld leer ist (§8: die Anzeige lügt über den
  // Zustand). Latenz-Kopplung, KEIN Leck: der Eintrag verschwand am Ende immer.
  //
  // Darum das Aufräumen vom teuren Commit ENTKOPPELN: es hängt am ROHEN Feldwert,
  // nicht am entprellten. Der Render, der `suche` leert, ist billig (die memoisierten
  // ArtikelLeser der noch stehenden Trefferliste steigen aus der Reconciliation aus),
  // also feuert dieser Effekt im nächsten Frame. Nur der boolesche Kipp-Punkt ist
  // Dependency — beim Tippen läuft KEIN zusätzlicher TreeWalker (§15/3, kein
  // Setz-Pfad hier). Wirkt für JEDEN Ausstieg aus dem Suchmodus (Feld leeren,
  // `springeZuArtikel`, Erlass-/Pane-Wechsel), unabhängig davon, welche Teilbäume
  // neu rendern. Der Effekt oben bleibt unverändert der einzige SETZENDE Pfad.
  const sucheFeldLeer = suche.trim() === '';
  useEffect(() => {
    if (typeof window === 'undefined' || !sucheFeldLeer) return;
    if (highlightRaf.current !== null) {
      window.cancelAnimationFrame(highlightRaf.current);
      highlightRaf.current = null;
    }
    setzeSuchHighlight(null, '');
  }, [sucheFeldLeer]);

  if (fehler) {
    // W2·10-UI-NAV/N0b: hilfreiche Fehlseite (angefragter Key + Fuzzy-Vorschläge +
    // eingebettetes Erlass-Suchfeld) statt der nackten «nicht verfügbar»-Notiz.
    return <GesetzFehlSeite schluessel={schluessel} manifest={manifest} />;
  }
  // ── A9 §15.2-Pin: Currency-Chips NICHT nachträglich einwachsen lassen ────────
  // Die Kopf-Chips «geltend geprüft am … / nächste Fassung ab …» (ErlassLeserKopf)
  // stehen im Prerender (erlassVolltextHtml projiziert currency.json build-time).
  // Der Client lädt currency aber async (ladeCurrency, eigener Fetch). Rendert ein
  // Kopf-Pfad die Kopfzeile schon VOR dem Currency-Fetch, wachsen die zwei
  // whitespace-nowrap-Chips nachträglich in die flex-wrap-Meta-Zeile ein und
  // schieben Ingress + 2-Spalten-Grid ~30 px nach unten (Lade-Shift, auf dem
  // 2-vCPU-Runner voll gezählt: CLS ~0.10, lokal repro unter 6× Drossel + langsamem
  // Netz = 0.086). Darum ALLE Kopf-tragenden Render-Pfade (pdf-embed / nur-live-link
  // / Volltext) auf den AUFGELÖSTEN Currency-Stand pinnen (§15.2 «Client-Initialstate
  // auf den Server-Zustand pinnen»): solange `currency === null`, bleibt der
  // reservierte Lade-Platzhalter stehen — kein Inhalt versteckt (§15/2). `ladeCurrency`
  // löst IMMER auf (Fetch-Fehler ⇒ {}), i. d. R. lange vor dem grossen eintraege-Fetch
  // ⇒ kein LCP-Verlust, und die Kopfzeile kann den Reader nicht aufhängen.
  if (erlass && currency === null) {
    return <LadeAnzeige />;
  }
  // ── pdf-embed: amtliches PDF in-app (kein extrahierbarer Volltext-HTML) ──────
  // Reine Präsentation in ./inhalt-ansichten (§6.6-Split), Markup byte-gleich.
  if (erlass && erlass.status === 'pdf-embed' && erlass.pdfPfad) {
    return <PdfEmbedAnsicht erlass={erlass} currency={currency} kopf={kopf} internRefs={internRefs} />;
  }
  // ── ⑧ LIVE_VERWEIS: kein In-App-Volltext — ehrliche Verweiskarte (§8) ────────
  // Reine Präsentation in ./inhalt-ansichten (§6.6-Split), Markup byte-gleich.
  if (erlass && erlass.status === 'nur-live-link') {
    return <LiveVerweisAnsicht erlass={erlass} currency={currency} />;
  }
  if (!erlass || !eintraege) {
    // Mindesthöhe reserviert die volle Lesehöhe, solange Snapshot/Struktur async
    // laden: ohne sie kollabiert das (bei Bund prerenderte) Volltext-Dokument auf
    // die kurze Spinner-Zeile und der einwachsende React-Baum erzeugt den grossen
    // CLS-Sprung. min-h-screen ist ein Token (§13), reserviert nur Platz, kürzt
    // keinen Inhalt (§15/2). Derselbe `LadeAnzeige`-Platzhalter wie der Currency-Pin.
    return <LadeAnzeige />;
  }

  // §6.6-Split (W2·12-HYGIENE/B24): der Innen-Render des Volltext-Readers lebt in der
  // reinen Präsentationskomponente ./inhalt-volltext (Markup + Handler byte-gleich).
  // `renderSektion` (Linien-Kanon: border-guide / linien.guideEbene / data-normtext-
  // linie) und die reader-root-Hülle (data-grundart / data-guide-auto) bleiben HIER —
  // dort gated sie `check:linien-kanon` (READER-Liste). renderSektion wird als Prop
  // hereingereicht; sie arbeitet weiter auf demselben `offen`/`setOffen`.
  const istOffen = (id: string, defOpen: boolean) => offen[id] ?? defOpen;
  const toggle = (id: string, defOpen: boolean) => setOffen((o) => ({ ...o, [id]: !(o[id] ?? defOpen) }));
  const regRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sekRefs.current.set(id, el); else sekRefs.current.delete(id);
  };
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;

  // W2·5d G3a: Grundart-Metadaten zur Laufzeit aus dem Register (SSoT, §5) per key —
  // steuert Kopf-Label (erlassTyp), §-Zähl-Substantiv (bestimmungsEtikett, ⑥) und den
  // grundart-abhängigen Linien-Default (data-grundart am .lc-leser-Root, K11).
  const meta = grundartMeta(erlass.key);

  // Jede Sektionsstufe ist klappbar (Fedlex-analog); Inhalt rendert nur offen.
  // Randtitel-promotete Knoten (s.randtitel) bekommen einen ruhigen Einzug-Strich,
  // damit die Buchstaben-/Ziffern-Gruppierung als Verschachtelung lesbar bleibt.
  // Ein Knoten kann seit 6b DIREKTE Artikel UND Unter-Knoten tragen (z. B.
  // «II. Handlungsfähigkeit» enthält Art. 12 direkt und die Untergruppe
  // «2. Voraussetzungen») — beide werden in Dokument-Reihenfolge gemischt.
  const renderSektion = (s: Sektion, defOpen: boolean, tiefe: number): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    // Kinder + direkte Artikel in EINER nach Dokument-Position sortierten Liste.
    const inhalt = auf
      ? [
          ...s.kinder.map((k) => ({ pos: sekPos.get(k.id) ?? Infinity, el: renderSektion(k, true, tiefe + 1) })),
          ...s.artikel.map((e) => ({
            pos: artIndex.get(e.artikel) ?? 0,
            el: <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} leitfaelle={leitfaelleFuer(e.artikel)} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />,
          })),
        ].sort((a, b) => a.pos - b.pos)
      : [];
    // Linien-Kanon (W2·5d G1 + U-LINIEN/A8, DESIGN-REGLEMENT-NORMTEXT §4b Regel 1 +
    // §Weissraum-Rhythmus): HÖCHSTENS EINE vertikale Guide-Linie gleichzeitig — genau
    // die aufbau-abhängige `linien.guideEbene` trägt den Guide (Ebene 0 bei einer
    // einzigen Gliederungsebene → «flache Ebene sichtbar», sonst Ebene 1); tiefere
    // Ebenen tragen ihre Tiefe allein über den EINZUG (kein gestapelter «Barcode» aus
    // border-l pro Ebene, der ZGB Art. 684 / OR Art. 319 zupflasterte). `guideEbene
    // === null` (flache Artikelliste) ⇒ gar kein Guide. Einzug-Skala (V2·L-1): Tiefe
    // 1–5 → je eine `einzug`-Stufe (20px), gedeckelt bei 5 (vorher 3 — tiefe
    // Kodifikationen ZGB/OR verloren ab Ebene 3 die visuelle Verschachtelung, David-
    // Befund «funktioniert praktisch nicht»). MOBIL kollabiert der Einzug NICHT mehr
    // auf 0, sondern trägt `einzug-mobil` (~0.75rem, `pl-einzug-mobil sm:pl-einzug`)
    // → die Verschachtelung flüstert auch @390 weiter; die eine Guide bleibt am
    // Spaltenrand. CLS 0: Einzug = padding, Guide = border darauf. Der Guide wird bei
    // jedem Erlass mit Gliederung emittiert; ob er im Auto-Default SICHTBAR ist,
    // entscheidet der aufbau-basierte `data-guide-auto`-Toggle rein per CSS (kein
    // Artikel-Re-Render, §15). `data-linien="aus"` kollabiert den Einzug weiterhin
    // auf 0 über ALLE Ebenen (index.css, padding-left:0).
    const guide = linien.guideEbene !== null && tiefe === linien.guideEbene;
    const eingerueckt = tiefe > 0 && tiefe <= 5;
    const einzugCls = eingerueckt ? 'pl-einzug-mobil sm:pl-einzug' : '';
    return (
      <section key={s.id} data-normtext-linie className={`space-y-3 ${guide ? 'border-l border-guide' : ''} ${einzugCls}`}>
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} bereich={sektionMeta.get(s.id)?.bereich} bereichEinzel={sektionMeta.get(s.id)?.einzel ?? false}
          // EID-2 (W2·5d §12): Sektions-Deep-Link zur amtlichen Fassung — nur wenn
          // das EID-1-Sidecar eine Container-eId trägt UND der Erlass eine ELI-
          // Quelle hat (Builder liefert sonst null ⇒ kein Link, §8).
          amtlichUrl={verifizierLinkSektion(erlass, s.eId) ?? undefined} />
        {auf && <div className="space-y-5">{inhalt.map((x) => x.el)}</div>}
      </section>
    );
  };

  // Gliederungs-Baum EINMAL beschreiben (genutzt in der xl-Spalte UND im mobilen
  // Drawer, §5 — kein doppelter onSprung). `springeZuSektion`/`tocToggle` sind
  // oben als useCallback definiert (über dem early-return, Rank 4).
  const tocBaumEl = (
    // A36: kuratierter Baum (tocSektionen) — Sprung-/Toggle-Handler arbeiten
    // weiter über IDs des vollen Baums (Teilmenge, pfadZu findet sie identisch).
    <SektionBaumTOC sektionen={tocSektionen} aktivPfad={aktivIds} offen={tocBaum}
      onToggle={tocToggle} onSprung={springeZuSektion} />
  );

  return (
    // `lc-leser`: Scope-Anker für die G2a-Options-CSS (index.css) — die
    // data-linien/-fussnoten/-verweise-Regeln greifen NUR im Reader, nie im
    // Norm-Popover der Rechner o. Ä. `data-guide-auto` (U-LINIEN/A8): der
    // AUFBAU-abhängige Linien-Default 'auto' wertet CSS hieran aus — 'aus' = tiefe
    // Kodifikation bleibt ruhig (Guide unsichtbar, Einzug bleibt), 'an' = flaches/
    // mittleres Gesetz zeigt seine EINE Guide-Ebene. Löst den grundart-Kategorie-
    // Default (K11) ab. `data-grundart` bleibt als semantischer Marker (§5).
    <div className="lc-leser space-y-5" data-grundart={meta.grundart ?? undefined} data-guide-auto={linien.autoGuide ? 'an' : 'aus'}
      // W2·10-UI-NAV/N0c: reale Sticky-Höhe für die .nt-anker-Sprünge. Einzelansicht:
      // Topbar (4rem) + Inhalts-Kopf (2.25rem) — die frühere dritte klebende Such-Zeile
      // (~3rem) entfiel mit A35 (Suchfeld jetzt IM Inhalts-Kopf). Im Pane liegen Topbar/
      // PaneKopf ausserhalb des Scroll-Containers → nur die pane-lokale Such-Leiste
      // (top 0.5rem, ~3.5rem) klebt (Muster --rsp-stick, Entscheid-Leser B3).
      style={{ '--nt-stick': imPane ? '3.5rem' : 'calc(4rem + 2.25rem)' } as CSSProperties}>
      <LeserVolltextInhalt
        erlass={erlass} eintraege={eintraege} struktur={struktur} kopf={kopf} currency={currency}
        vorher={vorher} nachher={nachher}
        sektionen={sektionen} ohneGliederung={ohneGliederung} linien={linien} fussnotenAnzahl={fussnotenAnzahl}
        meta={meta} internRefs={internRefs} margAnzeige={margAnzeige} kantonSys={kantonSys}
        basisPfad={basisPfad} renderSektion={renderSektion}
        imPane={imPane} istXl={istXl} overlayWurzel={overlayWurzel}
        treffer={treffer} suche={suche} sucheDebounced={sucheDebounced} setSuche={setSuche}
        tocBaumEl={tocBaumEl} tocOffen={tocOffen} tocAuf={tocAuf} setTocOffen={setTocOffen} setTocAuf={setTocAuf}
        springeZuArtikel={springeZuArtikel}
        leitfaelleFuer={leitfaelleFuer} bezuegeFuer={bezuegeFuer} revisionFuer={revisionFuer} historieFuer={historieFuer}
        kantoneVerfuegbar={kantoneVerfuegbar}
        reiterToast={reiterToast} setReiterToast={setReiterToast} reiterToastTimerRef={reiterToastTimer}
        tocDrawerRef={tocDrawerRef} trefferRef={trefferRef} navigate={navigate}
      />
    </div>
  );
}
