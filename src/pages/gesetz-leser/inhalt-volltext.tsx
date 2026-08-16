import { useCallback, type ComponentProps, type Dispatch, type MutableRefObject, type ReactNode, type RefObject, type SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { Link, type NavigateFunction } from 'react-router-dom';
import { naechsteInstanz, merkeTab } from '../../lib/tabs';
import type { InternRefs } from '../../components/NormText';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { KontextPanel } from '../../components/kontext/KontextPanel';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import type { CurrencyMap, ErlassKopf, Sektion, StrukturMap } from '../../lib/normtext/browse';
import type { KantonSystematik } from '../../lib/normtext/systematik';
import { kopfOverline, grundartMeta, verifiziertesSachgebiet } from './helpers';
import { ArtikelLeser, ErlassKopfBlock, ErlassLeserKopf } from './parts';
import { LeserMenuPaar } from './LeserMenuPaar';
import type { Histogramm, Zeitbereich } from './bezugZeit';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import type { KlassenZahlen } from '../../lib/rechtsprechung/bezuege';
import { istAnhangToken } from './berechnungen';
import { AmtlichesPdf } from './parts/AmtlichesPdf';
import { TrefferListe } from './parts/TrefferListe';
import type { LeserTreffer } from './leserSuche';
import { ArtikelSprungFeld } from './parts/ArtikelSprungFeld';
import { GliederungSheet } from './parts/GliederungSheet';
import { ErlassUebersicht } from './parts/ErlassUebersicht';
import type { GliederungsKennzahlen } from './gliederungsModell';
import type { ArtikelKontextAnsicht } from '../../lib/kontext';

// ═══ ABSCHNITT · Volltext-Leseansicht — INNENinhalt (§6.6-Split, W2·12-HYGIENE/B24) ═══
// Reine Präsentationsschicht (Props rein, §3): der gesamte Innen-Render des
// Volltext-Readers (Toast, Erlass-Kopf + Options, pane-lokale Such-Leiste, mobiler
// Gliederungs-Drawer, 2-Spalten-TOC, Lesespalte, Kontext-Panel, Nachbar-Nav).
// VERHALTENSNEUTRAL: identisches Markup + identische Handler wie zuvor inline (golden/
// Snapshot byte-gleich). Die reader-root-Hülle (`.lc-leser` mit data-grundart) UND
// `renderSektion` bleiben in GesetzLeserInhalt (inhalt.tsx); `renderSektion` wird als
// Prop hereingereicht. Keine Rechtsregel, kein Normtext, keine Hook-Reihenfolge
// berührt.

type ArtikelLeserProps = ComponentProps<typeof ArtikelLeser>;
type GrundartMeta = ReturnType<typeof grundartMeta>;

export function LeserVolltextInhalt({
  erlass, eintraege, struktur, kopf, currency, vorher, nachher,
  sektionen, ohneGliederung, gliederungsTiefe, fussnotenAnzahl, meta,
  internRefs, margAnzeige, kantonSys, basisPfad, renderSektion,
  imPane, istXl, overlayWurzel, treffer, suche, sucheDebounced, setSuche,
  tocBaumEl, tocOffen, tocAuf, setTocOffen, setTocAuf, springeZuArtikel,
  fundstellen = 0, fussnotenAus = false, trefferPos = -1, trefferAktivToken = null,
  springeZuFundstelle, springeZuTreffer,
  loeseArtikel, siePfad = [], siePfadArtikel = null,
  leitfaelleFuer, bezuegeFuer = () => undefined, revisionFuer, historieFuer, kantoneVerfuegbar = [], klassenImErlass,
  bezugHistogramm, bezugBereich,
  reiterToast, setReiterToast, reiterToastTimerRef,
  tocDrawerRef, leseRef, navigate,
  kennzahlen = null, kantonErlassAnzahl = null, nichtKonsolidiert = false, nichtKonsolidiertSeit = null,
  artikelKontext = null,
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
  /** Amtliche Gliederungstiefe (Kennzahl der Erlass-Übersicht, strukturTiefe.ts). */
  gliederungsTiefe: number;
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
  /** W2·19-GLIEDERUNG/S8: Treffer der erlass-lokalen Suche (`leserSuche.ts`).
   *  Leer = kein Suchmodus; die Lesespalte zeigt IMMER den vollständigen Text
   *  (Entscheid David (c) 8.8.2026) — es wird nichts mehr weggefiltert. */
  treffer: LeserTreffer[];
  suche: string;
  sucheDebounced: string;
  setSuche: Dispatch<SetStateAction<string>>;
  tocBaumEl: ReactNode;
  tocOffen: boolean;
  tocAuf: boolean;
  setTocOffen: Dispatch<SetStateAction<boolean>>;
  setTocAuf: Dispatch<SetStateAction<boolean>>;
  springeZuArtikel: (token: string) => void;
  /** S8 (§4.4 Ziff. 1): DATENSEITIGE Gesamtzahl der Fundstellen — die eine
   *  Wahrheit, unabhängig von Ansicht-Schaltern. Sie steht ab dem ersten Render
   *  (nichts wächst nach, §15/2) und braucht darum kein `null` mehr. */
  fundstellen?: number;
  /** S8 (§4.4 Ziff. 2): `html[data-fussnoten="aus"]` — steuert ALLEIN die
   *  Badge-Ehrlichkeit («Fussnote (ausgeblendet)»), nie den Zähler. */
  fussnotenAus?: boolean;
  /** R1: 0-basierte aktive Fundstelle der Vor/Zurück-Navigation (-1 = keine). */
  trefferPos?: number;
  /** S8: Artikel-Token der laufenden Fundstelle — markiert die Zeile der Liste. */
  trefferAktivToken?: string | null;
  /** R1: Sprung um `delta` Fundstellen (zyklisch). Ohne Handler keine Tasten. */
  springeZuFundstelle?: (delta: number) => void;
  /** S8: Klick auf einen Treffer-Eintrag — springt in der VOLLSTÄNDIGEN
   *  Lesespalte zur ersten Fundstelle dieses Artikels, ohne die Suche zu
   *  verlassen (Entscheid c). */
  springeZuTreffer?: (token: string) => void;
  /** R2: Quickjump-Auflösung «Art. N» → Token (oder null). Ohne sie kein Feld. */
  loeseArtikel?: (eingabe: string) => string | null;
  /** R2: «Sie sind hier» — Gliederungspfad der aktuellen Leseposition. */
  siePfad?: string[];
  /** R2: «Sie sind hier» — Label des aktuell gelesenen Artikels. */
  siePfadArtikel?: string | null;
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
  /** B7/c: Kanten je Instanz-Klasse in diesem Erlass (Zahl am Instanz-Schalter). */
  klassenImErlass?: Partial<Record<BezugStatus, KlassenZahlen>>;
  /** B5: Jahres-Verteilung der Kanten — speist den Zeitstrahl im Pane-Dropdown.
   *  OPTIONAL: ohne sie zeigt der Streifen seinen ehrlichen Leer-Hinweis. */
  bezugHistogramm?: Histogramm;
  /** B5: aktiver Von-Bis-Bereich. OPTIONAL: Default = beide Enden offen. */
  bezugBereich?: Zeitbereich;
  reiterToast: boolean;
  setReiterToast: Dispatch<SetStateAction<boolean>>;
  reiterToastTimerRef: MutableRefObject<number | null>;
  tocDrawerRef: RefObject<HTMLDivElement | null>;
  /** S8: Wurzel der Lesespalte — Beobachtungsraum des artikelweisen Highlights
   *  (§4.5). Hiess bis S8 `trefferRef` und zeigte auf den gefilterten
   *  Treffer-Block; den gibt es nicht mehr. */
  leseRef: RefObject<HTMLDivElement | null>;
  navigate: NavigateFunction;
  /** W2·19-GLIEDERUNG/S6: Kennzahlen des Gliederungs-Modells (S3) — speisen die
   *  Umfang-Zeile der Erlass-Übersicht (Anhang ja/nein, Sidecar vorhanden).
   *  OPTIONAL: ohne sie lässt die Übersicht die abgeleiteten Angaben weg,
   *  statt sie zu raten (§8). */
  kennzahlen?: GliederungsKennzahlen | null;
  /** S6: in LexMetrik erfasste Erlass-Zahl des Kantons dieses Erlasses (aus dem
   *  Browse-Manifest gezählt) — Eingabe des Erfassungsgrads (§8, erfassungsgrad.ts).
   *  `null` = Bund oder Manifest noch nicht da ⇒ keine Erfassungs-Aussage. */
  kantonErlassAnzahl?: number | null;
  /** S6: mindestens eine in Kraft getretene Änderung ist nicht konsolidiert. */
  nichtKonsolidiert?: boolean;
  /** S3/F5: frühestes Inkrafttreten unter den nicht konsolidierten Änderungen
   *  (ISO) — der Zeitbezug des Klartextsatzes im Erlass-Kopf. `null` = Datum
   *  nicht bekannt; die Warnung erscheint dann ohne Datum (§8). */
  nichtKonsolidiertSeit?: string | null;
  /** W2·19-GLIEDERUNG/S7: Wegweiser zum aktiv gelesenen Artikel — geht als
   *  eigene, hart gegatete Prop ins KontextPanel (nie über `artikelZitate`,
   *  Bau-Spec §5.2). `null` = keine Gruppe. */
  artikelKontext?: ArtikelKontextAnsicht | null;
}) {
  // B6: Zone A misst sich selbst und legt ihre Höhe als `--toc-deckel` auf den
  // [data-toc]-Scroller. Alles, was unter ihr kleben soll (Trefferlisten-Kopf),
  // liest die Marke; der TOC-Nudge (inhalt-hooks.tsx) liest dieselbe. Reine
  // Darstellungs-Geometrie, kein State ⇒ kein Re-Render (§15).
  const zoneARef = useCallback((el: HTMLDivElement | null) => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ziel = el.closest('[data-toc]') as HTMLElement | null;
    if (!ziel) return;
    const setze = () => ziel.style.setProperty('--toc-deckel', `${Math.round(el.getBoundingClientRect().height)}px`);
    setze();
    const ro = new ResizeObserver(setze);
    ro.observe(el);
    // Kein Cleanup-Rückgabewert: ein Callback-Ref darf keinen liefern. Der
    // Observer stirbt mit dem Element (er hält nur eine schwache Beobachtung auf
    // einen Knoten desselben Teilbaums) — und beim Unmount ruft React den
    // Callback ohnehin mit `null`, worauf hier nichts Neues entsteht.
  }, []);
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;
  const bestimmungsWort = meta.bestimmungsEtikett === 'paragraf' ? 'Paragraphen' : 'Artikel';

  // ── W2·19-GLIEDERUNG/S8 · Zone B: Trefferliste statt Baum, solange gesucht
  //    wird (Bau-Spec §2/§4.3). Der Baum verschwindet nicht, er tritt zurück:
  //    verlässt man die Suche, steht er unverändert wieder da (derselbe
  //    Klapp-Zustand, kein Remount des Modells).
  const sucheAktivTrim = sucheDebounced.trim();
  const sucheAktiv = sucheAktivTrim !== '';
  // W2·19-GLIEDERUNG/S9 (Bau-Spec §7 «☰-Knopf und Kontext-Zugang existieren
  // künftig auch bei sektionen.length === 0» — behebt Schwachstelle 8, «heute
  // verschwindet die ganze Leiste ersatzlos»): JEDER geladene Erlass hat seit
  // S3 einen Modus (b1…b4) und damit IMMER etwas, das die Leiste zeigen kann —
  // den Baum, den Artikel-Index (S9) oder die ehrliche B3-Leerzeile. Die frühere
  // Bedingung `sektionen.length > 0` blendete ☰, die TOC-Spalte, das mobile
  // Sheet UND Zone C (Übersicht/Kontext) komplett aus, sobald ein Erlass KEINE
  // amtliche Gliederung hatte — genau die 486 T4-Erlasse plus alle T10/T3-Fälle,
  // die B2/B3 überhaupt erst betreffen. `hatLeiste` ersetzt sie an jeder Stelle,
  // an der bisher `sektionen.length > 0` stand (§5, EINE Bedingung). Die einzige
  // verbleibende Schranke ist ein wirklich leerer Snapshot (praktisch nie, aber
  // §8-ehrlich statt einer Leiste ohne jeden Inhalt).
  const hatLeiste = eintraege.length > 0;
  // Die Leiste trägt die Liste nur, wo es sie überhaupt gibt: ab `istXl`, mit
  // Gliederung, aufgeklappt. Sonst (mobil, schmales Pane, eingeklappte Spalte,
  // Erlass ohne Sektionen) steht sie ÜBER der Lesespalte — genau dort, wo bis
  // S8 die gefilterte Liste stand. Es gibt zu jedem Zeitpunkt GENAU EINE
  // Trefferliste (§5); eine zweite in einem versteckten Container wäre die
  // Doppelwahrheit, die a32 für das Kontext-Panel schon einmal ausgeschlossen
  // hat.
  const listeInLeiste = istXl && hatLeiste && tocOffen;
  const trefferListeEl = sucheAktiv ? (
    <TrefferListe treffer={treffer} begriff={sucheAktivTrim} fundstellen={fundstellen}
      fussnotenAus={fussnotenAus} position={trefferPos} aktivToken={trefferAktivToken}
      onZurueck={() => springeZuFundstelle?.(-1)} onVor={() => springeZuFundstelle?.(1)}
      onSprung={(token) => springeZuTreffer?.(token)} />
  ) : null;
  // W2·19-GLIEDERUNG/S10 (S8-Restpunkt, Bau-Spec §4.5 «Mobil: Trefferliste im
  // bestehenden Such-Overlay unter dem Feld; Tap schliesst und springt»):
  // eigene Fassung NUR für den mobilen Schwebe-Fall — mit einem onSprung, der
  // ZUSÄTZLICH die Suche leert (`setSuche('')`). Das ist bewusst ANDERS als
  // die Leisten-Fassung oben (dort BLEIBT die Suche stehen, Entscheid David
  // (c) 8.8.2026, §4.5) — auf einem Telefon gibt es keine daneben stehende
  // Leiste, die den Suchzustand weiter zeigt; ein Overlay, das nach dem
  // Antippen offen über dem Text schwebt, wäre nur im Weg.
  const trefferListeMobilEl = sucheAktiv ? (
    <TrefferListe treffer={treffer} begriff={sucheAktivTrim} fundstellen={fundstellen}
      fussnotenAus={fussnotenAus} position={trefferPos} aktivToken={trefferAktivToken}
      onZurueck={() => springeZuFundstelle?.(-1)} onVor={() => springeZuFundstelle?.(1)}
      onSprung={(token) => { springeZuTreffer?.(token); setSuche(''); }} />
  ) : null;
  // Unter `xl` (echtes Mobil UND schmales Pane — §7 «Pane schmal: wie mobil»)
  // schwebt die Liste; ab `xl` bleibt sie in der Leiste (`listeInLeiste`) oder,
  // im unbenannten Rand-Fall einer eingeklappten/leiste-losen Spalte, unten im
  // Fluss (Inline-Zweig weiter unten, unverändert seit S8).
  const trefferOverlayMobil = sucheAktiv && !listeInLeiste && !istXl;

  // E4/A32 (David 16.7.2026): das Kontext-Panel sass am Gesetzes-ENDE der Lese-
  // spalte und war «schwer sichtbar/auffindbar». Neuer Platz: unterhalb der
  // GLIEDERUNG in der TOC-Spalte — überall dort, wo die 2-Spalten-Gliederung
  // steht (istXl: Desktop/xl UND breites Split-View-Pane, beide Pfade laufen
  // über dasselbe `istXl`) und die Spalte offen ist. Sonst (Mobil/schmales
  // Pane: Gliederung ist Drawer — dort NICHT verstecken; Spalte eingeklappt)
  // bleibt der ehrlich sichtbare Platz das LESEENDE wie bisher. Es rendert
  // stets genau EIN Panel (nie doppelt, nie eines in einem hidden-Container).
  const kontextImToc = istXl && hatLeiste && tocOffen;
  const kontextPanelLesespalte = kontextImToc ? null
    : <KontextPanel typ="norm" normKeys={[erlass.key]} artikelKontext={artikelKontext} />;
  // W2·19-GLIEDERUNG/S6 (Bau-Spec §2 Zone C, §5.1): der Übersichts-Sockel wird
  // EINMAL beschrieben (§5) und folgt exakt derselben Platz-Weiche wie das
  // Kontext-Panel — in der 2-Spalten-Ansicht im Fluss des [data-toc]-Scrollers
  // ÜBER dem Panel, sonst am Leseende ebenfalls über dem Panel. Damit steht
  // stets genau EINE Übersicht (nie doppelt, nie eine in einem hidden-Container),
  // und die a32-Invariante «genau EIN Panel» bleibt unberührt: die Übersicht ist
  // eine eigene <section> mit eigener Überschrift, KEINE zweite Panel-Wurzel.
  const erlassUebersichtEl = (
    <ErlassUebersicht erlass={erlass} kopf={kopf} currency={currency?.[erlass.key]}
      erlassTyp={meta.erlassTyp} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort}
      bestimmungsEtikettStatus={meta.bestimmungsEtikettStatus}
      gliederungsTiefe={gliederungsTiefe} kennzahlen={kennzahlen}
      kantonSys={kantonSys} kantonErlassAnzahl={kantonErlassAnzahl}
      nichtKonsolidiert={nichtKonsolidiert} />
  );

  // N13 (BS-Audit 23.6.2026): die Reader-Overline zeigte für JEDEN kantonalen
  // Erlass stur das Einheits-Rechtsgebiet («Öffentliches Recht»). Stattdessen das
  // echte Sachgebiet aus der amtlichen Kanton-Systematik (sachgruppe→topTitel).
  // Nur wenn ein verifizierter Titel vorliegt — der neutrale Fallback («Bereich N»,
  // «Ohne Systematik-Nummer») wird weggelassen (§8, nichts Geratenes). Bund bleibt
  // beim Rechtsgebiet-Label.
  // W2·19-GLIEDERUNG/S7 (Bug-Check B9): die Filterregel selbst lebt seit hier in
  // `verifiziertesSachgebiet` (helpers) — dieselbe Quelle, die auch die
  // Erlass-Übersicht konsumiert (§5). Vorher stand sie nur hier, und die
  // Übersicht zeigte den Platzhalter, den diese Zeile korrekt unterdrückte.
  const overlineGebiet: string | null = erlass.ebene === 'bund'
    ? GEBIET_LABEL[erlass.rechtsgebiet]
    : verifiziertesSachgebiet(erlass, kantonSys)?.top ?? null;

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
  // W2·10-UI-NAV/R2: EIN Quickjump-Baustein (§5) — dasselbe Element im mobilen
  // Gliederungs-Sheet UND im Desktop-TOC-Kopf. Ohne `loeseArtikel` (Aufrufer
  // reicht sie nicht durch) entfällt er ersatzlos, statt ein totes Feld zu zeigen.
  const quickjump = loeseArtikel
    ? <ArtikelSprungFeld loese={loeseArtikel} onSprung={springeZuArtikel} />
    : null;
  // W2·19-GLIEDERUNG/S4 · Zone-A-Pfadzeile (Bau-Spec §2). Sie ist die Antwort auf
  // die T1-Sorge, die F5 aufwirft: seit der Positionsmarke trägt im Baum nur noch
  // EINE Zeile die Markierung, und bei einer fünfstufigen Kodifikation (ZGB/OR)
  // ist «der tiefste Knoten» allein keine Verortung. Der volle Pfad steht darum
  // hier — einzeilig, dieselben Daten wie das mobile Sheet (§5, siePfad kommt aus
  // dem bestehenden Scroll-Spy, es wird nichts zusätzlich beobachtet).
  // Kurzform: die tiefsten ZWEI Stufen ausgeschrieben, davor «…». Der volle Pfad
  // bleibt über title/aria-label erreichbar — nie stiller Verlust (§8).
  const sieHierGlieder = [...siePfad, ...(siePfadArtikel ? [siePfadArtikel] : [])];
  const sieHierVoll = sieHierGlieder.length > 0 ? sieHierGlieder.join(' › ') : 'Noch keine Leseposition erfasst';
  const sieHierKurz = sieHierGlieder.length === 0
    ? 'Noch keine Leseposition erfasst'
    : (sieHierGlieder.length > 2 ? '… › ' : '') + sieHierGlieder.slice(-2).join(' › ');
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
      // B4: dieselbe Paarung wie in der Einzelansicht — im Pane trägt sie die
      // pane-lokale Such-Leiste statt des Inhalts-Kopfs. B6: buchstäblich
      // dieselbe Komponente, nicht mehr eine zweite Kopie (§5).
      <LeserMenuPaar kantoneVerfuegbar={kantoneVerfuegbar} klassenImErlass={klassenImErlass}
        bezugHistogramm={bezugHistogramm} bezugBereich={bezugBereich}
        fussnotenAnzahl={fussnotenAnzahl} />
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
          Pfad; sie trägt die Options-Leiste (Fussnoten/Verweise). */}
      {/* S3: `kennzahlen` speist die Anhang-Dominanz der Fakten-Zeile («Einträge»
          statt «Artikel») — dieselbe Kennzahl, die die Erlass-Übersicht schon
          bekommt (§5). Tatsache und Datum reisen als zwei getrennte Props. */}
      <ErlassLeserKopf erlass={erlass} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort} currency={currency?.[erlass.key]}
        kennzahlen={kennzahlen}
        nichtKonsolidiert={nichtKonsolidiert} nichtKonsolidiertSeit={nichtKonsolidiertSeit}
        overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet)}
        hinweis="Snapshot — massgeblich ist die amtliche Fassung"
        aktionen={
          // V2 (koordinierter Kopf-PR): EIN Slot-Layout in der Reihenfolge
          // Ansicht · Fussnoten · Download (§F2) — der Slot wird nicht mehrfach
          // umgebaut. «In neuem Reiter» steht zwischen den Bedien- und den
          // Download-Aktionen (Download bleibt der letzte, verankerte Punkt).
          <>
            {/* W2·5d U-KOPF/A4 + V2·B-1/B-2: «Ansicht»-Dropdown
                (Fussnoten/Verweise + Rechtsprechungs-Filter) — reine data-*-/
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
          datum + Kopf-Fussnoten) — Fedlex-Fundiertheits-Floor (§2), bisher verworfen.
          LM-149 (W2·17-UI-BEFUNDE-B4, §5 DESIGN-REGLEMENT-NORMTEXT §4b): dieselbe
          18rem+gap-Spaltenaufteilung wie die Lesespalte weiter unten (Zeile ~338) —
          sonst sitzt der Ingress-Abschluss (border-rule-struktur) flush-left, während
          die Lesespalte im Grid nach rechts zentriert ist: zwei Trennlinien auf
          unterschiedlicher Höhe, deren X-Bereiche sich überschneiden. Die leere erste
          Zelle hält nur den Platz der TOC-Spalte frei (kein Inhalt, aria-hidden);
          `ErlassKopfBlock` zentriert sich selbst per `mx-auto w-full max-w-normtext`
          identisch zur Lesespalte (`#lc-lesespalte`). */}
      {kopf && (
        // W2·19-GLIEDERUNG/S2: 16rem → 18rem. BEIDE Grids (hier UND die Lesespalte
        // weiter unten) ändern sich im selben Commit — wer die Kopf-Zelle vergisst,
        // reproduziert LM-149 (versetzte Trennlinien). Rechnung (Bau-Spec §2):
        // 18 + 2 (gap-8) + 42 (max-w-normtext) = 62rem < max-w-content 70rem.
        <div className={istXl && hatLeiste && tocOffen ? 'grid grid-cols-[18rem_minmax(0,1fr)] gap-8' : ''}>
          {istXl && hatLeiste && tocOffen && <div aria-hidden />}
          <ErlassKopfBlock kopf={kopf} intern={internRefs} />
        </div>
      )}

      {/* A35 (David 19.7.2026): das In-Gesetz-Suchfeld ist in der EINZELansicht in den
          Inhalts-Kopf (oben, neben «Ansicht»/Stand/✕) gewandert — die frühere full-
          width Such-Leiste entfällt dort rückstandsfrei (kein toter Code, §Aufräumen).
          Diese `data-such-bar` bleibt NUR im SPLIT-VIEW (`imPane`): dort gibt es keinen
          InhaltsKopf, also trägt die pane-lokale sticky Leiste weiterhin ☰ + Suchfeld +
          Ansicht-Menü. Sticky direkt unter der Pane-Oberkante.
          LM-003/LM-004 (W2·17-UI-BEFUNDE-B3, K-01): `top: '0.5rem'` liess einen
          8-px-Streifen (Einzelreiter) bzw. bis zu 44 px (mehrzeiliger PaneKopf)
          zwischen dem PaneKopf (Pane.tsx — ECHTE Leiste, ausserhalb des
          Scroll-Containers) und dieser sticky Leiste offen, durch den Gesetzestext
          sichtbar durchlief; exakt reproduziert (PaneKopf-Unterkante 101 px,
          Leiste fixierte auf 109 px). `shadow-sm` liess sie zugleich wie einen
          eigenen schwebenden Kasten über dem Text wirken (LM-004) statt wie ein
          Fortsatz des PaneKopfs. Fix: `top: 0` (flach an den PaneKopf
          anschliessend, kein Streifen mehr möglich) + kein Schatten (liest sich
          als EIN zusammenhängender Kopfblock, nicht als zwei versetzte Karten).
          Die TOC-Spalte weiter unten verrechnet denselben Offset (0.5rem-Term
          dort entsprechend entfernt). */}
      {imPane && (
        <div data-such-bar className="sticky top-0 z-[16] mb-4 rounded-lg bg-paper">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
            {istXl ? (
              // ab lg (breites Pane): ☰ nur wenn die Gliederungsspalte EINGEKLAPPT ist.
              hatLeiste && !tocOffen && (
                <button type="button" aria-expanded={tocOffen} onClick={() => setTocOffen(true)}
                  title="Gliederung einblenden" className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-micro font-medium text-ink-600 hover:text-brass-700 hover:border-brass-300 transition-colors">
                  <span aria-hidden>☰</span><span className="hidden sm:inline">Gliederung</span>
                </button>
              )
            ) : (
              // schmales Pane: ☰ öffnet die Gliederung als Overlay-Drawer.
              hatLeiste && (
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

      {/* W2·19-GLIEDERUNG/S10 (S8-Restpunkt, Bau-Spec §4.5): mobile
          Overlay-Trefferliste — schwebt direkt unter dem Kopf, drückt NICHTS
          in den Lesefluss (anders als der alte Inline-Zweig, den sie unter
          `xl` ablöst). `fixed` ausserhalb des Panes (an den Viewport, wie das
          Gliederungs-Sheet), `absolute` + Portal IM Pane (dieselbe
          `overlayWurzel`-Technik wie das Sheet direkt darunter, §5 — kein
          zweiter Positionierungs-Mechanismus). `top` bindet an dieselben
          Kopf-Höhen-Variablen wie Zone A/die TOC-Spalte (`--leser-kopf-h` /
          `--leser-sub-h`, inhalt.tsx) — EINE Quelle für «wie hoch ist der
          Kopf», kein drittes hartkodiertes Mass. `role="status"`, weil die
          Liste eine LEBENDE Antwort auf die Eingabe ist (aria-live wäre hier
          zu geschwätzig bei jedem Tastenanschlag — der Zähler in TrefferListe
          trägt bereits `aria-live="polite"` für die laufende Position). */}
      {trefferOverlayMobil && (() => {
        const ziel = (imPane && overlayWurzel?.current) || null;
        const inPane = ziel != null;
        const panel = (
          <div role="status" className={`${inPane ? 'absolute' : 'fixed'} inset-x-3 z-30`}
            style={{ top: inPane ? 'var(--leser-sub-h)' : 'var(--leser-kopf-h)' }}>
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-line bg-paper-raised p-1 shadow-lg">
              {trefferListeMobilEl}
            </div>
          </div>
        );
        return ziel ? createPortal(panel, ziel) : panel;
      })()}

      {/* 2-Spalten (Gliederungs-Sidebar links, Inhalt rechts) ab lg (1024px, R2) —
          darunter (mobil / sehr schmale Fenster) bekommt der Normtext die volle
          Spaltenbreite, die Gliederung sitzt als einklappbarer Drawer (wie mobil).
          So frisst die feste 18rem-TOC-Spalte erst, wenn genug Breite da ist —
          deckungsgleich mit der App-Seitenleiste (lg). Reine Darstellung (§3). */}
      {/* Unter xl: die GLIEDERUNG als Overlay-Sheet (analog Seitenleiste), NUR auf
          Wunsch über den sticky ☰-Knopf geöffnet (Auftrag David 25.6.2026). A35: die
          Suche ist NICHT mehr darin — sie steht dauerhaft in der Kopfzeilen-Leiste
          (oben). Sektionswahl schliesst es (springeZuSektion).
          W2·10-UI-NAV/R2: aus dem OBEN angeschlagenen 60-vh-Drawer ist ein volles
          BOTTOM-SHEET in der Daumenzone geworden (GliederungSheet) — mit «Sie sind
          hier» aus dem bestehenden Scroll-Spy-Zustand und dem Quickjump «Art. N».
          Rolle/Fokus/Esc/Portal-Verhalten unverändert (dieselbe tocDrawerRef, derselbe
          useDialogFokus, dieselbe Overlay-Wurzel im Pane). */}
      {!istXl && tocAuf && hatLeiste && (() => {
        // Im Pane in die Overlay-Schicht portalieren + `absolute` (vom relative-
        // Wrapper eingefangen) → das Sheet bleibt IM Pane statt als `position:fixed`
        // über beide Panes zu quellen (container-type fängt fixed nicht). Ausserhalb
        // unverändert `fixed` an den Viewport.
        const ziel = (imPane && overlayWurzel?.current) || null;
        const inPane = ziel != null;
        const sheet = (
          <GliederungSheet sheetRef={tocDrawerRef} inPane={inPane}
            onSchliessen={() => setTocAuf(false)}
            pfad={siePfad} aktArtikelLabel={siePfadArtikel}
              sprungFeld={quickjump} baum={tocBaumEl} />
        );
        return ziel ? createPortal(sheet, ziel) : sheet;
      })()}

      {/* 2-Spalten-Gliederung: ab `istXl` — im Pane container-breitenabhängig
          (ResizeObserver), sonst viewport-xl. istXl treibt die Klassen direkt
          (kein xl:-Prefix), damit ein BREITES Pane denselben Aufbau wie der
          Einzelbildschirm bekommt. */}
      <div className={istXl && hatLeiste && tocOffen ? 'grid grid-cols-[18rem_minmax(0,1fr)] gap-8' : ''}>
        {/* TOC-Spalte (nur der Gliederungsbaum, sticky). A35: das Suchfeld lebt nicht
            mehr hier «oberhalb der Gliederung», sondern in der Kopfzeilen-Leiste (oben).
            Nur wenn istXl; darunter Overlay-Drawer über den sticky ☰-Knopf. */}
        {istXl && hatLeiste && (
          <aside
            // LM-147 (W2·17-UI-BEFUNDE-B4): `<aside>` ohne `role`/`aria-label` — ein
            // Screenreader kündigte den Gliederungsbaum nicht als Navigationsbereich
            // an; `role="navigation"` ist bei `<aside>` (nicht implizit `navigation`,
            // anders als `<nav>`) explizit nötig. Reine a11y-Auszeichnung, kein
            // Markup-/Verhaltens-Wechsel.
            role="navigation" aria-label="Gliederung"
            // A35 (David 19.7.2026): in der EINZELansicht entfiel die full-width Such-
            // Leiste (Suchfeld jetzt IM Inhalts-Kopf) → die Gliederungsspalte klebt
            // wieder direkt unter dem Kopf (Topbar 4rem + Inhalts-Kopf 2.25rem), ohne
            // den früheren +3.5rem-Such-Leisten-Vorhalt. Im Pane bleibt die pane-lokale
            // Such-Leiste (+3.5rem), also dort unverändert.
            // LM-003 (W2·17-UI-BEFUNDE-B3): der frühere `0.5rem`-Term war der
            // Streifen-Offset der Such-Leiste (jetzt `top: 0`, s. o.) — mitgezogen,
            // sonst klebte die Gliederungsspalte 0.5rem zu tief. `maxHeight` brauchte
            // KEINE Anpassung: sie rechnete den 0.5rem-Streifen nie mit (10.75rem
            // Abzug deckte bisher nur Topbar+PaneKopf+Leistenhöhe+mb-4 — mit dem
            // Streifen-Wegfall stimmt die Summe jetzt exakt).
            // W2·19-GLIEDERUNG/S2: die vier ausgeschriebenen Kopf-Höhen sind auf die
            // beiden Variablen aus inhalt.tsx umgestellt (--leser-kopf-h = Topbar +
            // Inhalts-/PaneKopf = 6.25rem, --leser-sub-h = pane-lokale Such-Leiste
            // = 3.5rem bzw. 0). Der Sticky-Anschlag ist damit in BEIDEN Ansichten
            // derselbe Ausdruck wie der Sprung-Offset der Anker (--nt-stick) —
            // ein Auseinanderlaufen wie bei LM-003 ist konstruktiv nicht mehr
            // möglich. Rechnerisch unverändert: Pane 3.5rem / 100dvh − 10.75rem,
            // Einzelansicht 6.25rem / 100vh − 7.75rem.
            style={{
              top: 'var(--nt-stick)',
              // Im Pane: an die SICHTBARE Pane-Höhe binden (Topbar + PaneKopf ab),
              // nicht an die indefinite Grid-Zeile (calc(100%) löste gegen
              // content-Höhe → kein interner Scroll, sticky brach). Die 1rem sind
              // das mb-4 der Such-Leiste, die 1.5rem der Fussabstand aussen.
              maxHeight: imPane
                ? 'calc(100dvh - var(--leser-kopf-h) - var(--leser-sub-h) - 1rem)'
                : 'calc(100vh - var(--leser-kopf-h) - 1.5rem)',
            }}
            className={`mb-0 sticky flex-col ${tocOffen ? 'flex' : 'hidden'}`}>
            {/* LM-147 (W2·17-UI-BEFUNDE-B4): «per Tastatur überspringbar» — bei einem
                tiefen Kodex (OR: 2887 Tabstopps allein im Baum) gab es keinen Weg, die
                Gliederung per Tab zu umgehen. Derselbe sr-only/focus:not-sr-only-Skip-
                Link wie der globale «Zum Inhalt springen» (Shell.tsx) — unsichtbar bis
                fokussiert, springt zur Lesespalte (`#lc-lesespalte`, oben vergeben). */}
            <a href="#lc-lesespalte"
              className="lc-btn lc-btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50">
              Gliederung überspringen
            </a>
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
            {/* W2·19-GLIEDERUNG/S9 (Zusatzpunkt David 9.8.2026): die Leiste darf
                NIE horizontal scrollbar werden — lange Etikette (HAdoptÜ-Anhang,
                tief verschachtelte ZGB/OR-Zweige) brechen um statt zu über-
                laufen. `overflow-x-hidden` ist die harte Garantie am EINEN
                Scroller (Baum, Trefferliste UND Zone A/C liegen alle darin);
                die Zeilen selbst tragen zusätzlich `min-w-0`/`line-clamp`, damit
                nichts tatsächlich abgeschnitten werden MUSS. */}
            <div data-toc className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
              {/* ── Zone A (W2·19-GLIEDERUNG/S4, Bau-Spec §2) ──────────────────
                  Standort-Sockel: «Sie sind hier»-Pfadzeile + Quickjump, sticky
                  INNERHALB des [data-toc]-Scrollers.
                  WARUM INNERHALB und nicht darüber: die E4-Assertion misst
                  `tocClient > aside · 0.85` — jedes Element, das ausserhalb des
                  Scrollers über ihm sitzt, zehrt direkt von diesem Verhältnis.
                  Der Quickjump stand bisher genau dort (R2-Kommentar: «damit er
                  beim Blättern stehen bleibt»); sticky im Scroller leistet
                  dasselbe, ohne die 85 % anzugreifen — er bleibt beim Blättern
                  ebenso stehen, zählt aber zum Scroller.
                  §15.2 CLS 0: beide Zeilen stehen ab dem ERSTEN Render da und
                  haben feste Höhe — die Pfadzeile ist einzeilig (`truncate`,
                  nie umbrechend) und zeigt ohne bekannte Leseposition einen
                  ehrlichen Platzhalter statt zu verschwinden (§8). `bg-paper`
                  deckt die durchlaufenden Baumzeilen ab. */}
              {/* B6 (Bug-Check §9 zu S8) — STICKY-KOLLISION. Zone A und der Kopf
                  der Trefferliste klebten beide mit `top-0 z-10` im SELBEN
                  Scroller; die Liste steht später im DOM und übermalte damit
                  Quickjump und «Sie sind hier» vollständig — beides war während
                  einer Suche unbedienbar (mit Playwright belegt).
                  Zwei Zeilen lösen es: Zone A liegt eine Stufe höher (`z-20`)
                  und publiziert ihre gemessene Höhe als `--toc-deckel`; der
                  Trefferlisten-Kopf klebt an dieser Marke statt an 0. Gemessen
                  statt angenommen, weil die Höhe davon abhängt, ob der Erlass
                  einen Quickjump trägt — dieselbe Grösse, die der TOC-Nudge in
                  inhalt-hooks.tsx als «deckel» braucht, jetzt an EINER Stelle
                  bestimmt (§5). `ResizeObserver` statt Effekt-Takt: die Höhe
                  ändert sich mit der Schriftskala (R3) und mit dem Erscheinen
                  des Quickjumps, nicht mit dem React-Zustand. */}
              <div data-toc-zone-a ref={zoneARef} className="sticky top-0 z-20 -mt-0.5 bg-paper pb-2 pt-0.5">
                {/* B10 (Bug-Check 9.8.2026): `aria-label` auf einem `<p>` ist nach
                    ARIA 1.2 unzulässig — die Rolle `paragraph` gehört zu den
                    Rollen ohne Namensberechtigung, und eine spec-treue
                    Hilfstechnik DARF den Namen ignorieren. Chromium berechnet
                    ihn trotzdem, darum blieb der Fehler unsichtbar (axe legt den
                    Fall bei Text-Inhalt unter `incomplete`, nicht `violations` —
                    das Tor konnte ihn gar nicht finden). Statt eines Namens am
                    Absatz stehen jetzt beide Fassungen als TEXT nebeneinander:
                    die gekürzte sichtbar, aber `aria-hidden` (sie sagt mit «…»
                    nichts Verlässliches), der volle Pfad `sr-only`. Die
                    Hilfstechnik liest damit denselben Wortlaut wie zuvor, ohne
                    verbotenes Attribut; `title` bleibt für die Maus. */}
                <p data-toc-pfad className="truncate text-micro leading-snug text-ink-500" title={sieHierVoll}>
                  <span aria-hidden>{sieHierKurz}</span>
                  <span className="sr-only">Sie sind hier: {sieHierVoll}</span>
                </p>
                {quickjump && <div className="mt-1.5">{quickjump}</div>}
              </div>
              {/* ── Zone B (W2·19-GLIEDERUNG/S4 + S8, Bau-Spec §2) ────────────
                  Standard: der Gliederungsbaum. Suche aktiv: die Trefferliste
                  mit Textausschnitten (Entscheid David (c) 8.8.2026) — sie
                  ERSETZT den Baum im selben Scroller, statt ihn zu verdrängen
                  oder unter ihn zu wachsen. Grund: die E4-Assertion misst
                  `tocClient > aside · 0.85`; zwei gleichzeitige Zone-B-Inhalte
                  hälfteten das Sichtfenster beider. */}
              {sucheAktiv && listeInLeiste ? trefferListeEl : tocBaumEl}
              {/* ── Zone C (W2·19-GLIEDERUNG/S6, Bau-Spec §2) ──────────────────
                  Erlass-Übersicht als Sockel, DARUNTER erst das Kontext-Panel:
                  «Was ist das für ein Erlass» kommt vor «Was hängt an ihm».
                  Beide im FLUSS des [data-toc]-Scrollers — die E4-Geometrie
                  (Panel im Scroller, tocClient > 85 % der Aside-Höhe) bleibt
                  damit unberührt; zusätzlicher Inhalt am Scroller-Ende
                  vergrössert nur die Scrollhöhe. */}
              {kontextImToc && (
                <div data-toc-uebersicht className="mt-4 border-t border-line pt-3">
                  {erlassUebersichtEl}
                </div>
              )}
              {kontextImToc && (
                <div data-toc-kontext className="mt-4 border-t border-line pt-3">
                  <KontextPanel typ="norm" normKeys={[erlass.key]} variante="seitenleiste" artikelKontext={artikelKontext} />
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
        {/* W2·19-GLIEDERUNG/F1: die benannte Gruppe `group/lese` ist mit dem
            Hover-Spotlight entfallen (ArtikelLeser.tsx, ausführliche Begründung
            dort). Sie hatte GENAU EINEN Konsumenten — die dortige
            `group-has-[[data-lese]:hover]/lese:opacity-80`-Kette; ohne ihn wäre
            die Klasse eine tote Marke, die eine Wirkung behauptet, die es nicht
            mehr gibt. Die Identität der Lesespalte trägt unverändert die id
            `#lc-lesespalte` (Skip-Link-Ziel, oben referenziert). */}
        {/* S8: `leseRef` ist der Beobachtungsraum des artikelweisen Highlights
            (§4.5) — der IntersectionObserver hängt an den `<article>`-Knoten
            DIESER Spalte. Bis S8 zeigte der Ref auf den gefilterten
            Treffer-Block; den gibt es nicht mehr. */}
        <div ref={leseRef} id="lc-lesespalte" className="mx-auto w-full max-w-normtext">
          {/* A27 (David 12.7.2026): der Sticky Section-Kontextkopf «Titel › … ›
              Art. N › ⧉ Zitat» ist ENTFERNT. Seit A26 (#198) trägt der immer
              sichtbare Inhalts-Kopf (InhaltsKopf, Brotkrümel + Live-Artikel) die
              Orientierung; der tiefe In-Erlass-Gliederungspfad war für David
              «nicht notwendig». Die «Zitat kopieren»-Aktion bleibt vollständig
              erhalten — sie steht (identisches baueZitat-Voll-Zitat) je Artikel in
              der Artikelnummer-Zeile (ArtikelLeser). §15 Funktions-Treue gewahrt. */}
          {/* ── W2·19-GLIEDERUNG/S8 · die Lesespalte wird NICHT MEHR GEFILTERT ──
              Bis S8 stand hier eine Weiche: mit Treffern rendert die Spalte die
              Treffer-Artikel, sonst den Gesetzestext. Der amtliche Text war im
              Suchmodus also unvollständig — man konnte nicht weiterlesen, und
              jeder Sprung musste erst die Suche verlassen. Entscheid David (c)
              vom 8.8.2026: «die Lesespalte bleibt vollständig und springt». Die
              Weiche ist ersatzlos weg; das Verzeichnis steht in Zone B der
              Leiste (bzw. darüber, wo es keine Leiste gibt).
              Nebenwirkung, die dieselbe Entscheidung mitträgt: der teuerste
              Commit des Readers (Trefferliste → 1686 Artikel neu mounten,
              gemessen bis 21,9 s bei 8× Drossel) findet nicht mehr statt — der
              Volltext-Baum steht die ganze Zeit. */}
          {/* W2·19-GLIEDERUNG/S10 (S8-Restpunkt, Bau-Spec §4.5 letzter Punkt
              «Mobil: Trefferliste im bestehenden Such-Overlay unter dem Feld»):
              unter `xl` schwebt die Liste als Overlay unmittelbar unter dem
              Kopf statt in den Lesefluss zu drücken (`trefferOverlayMobil`,
              weiter unten VOR der Lesespalte gerendert — sie gehört nicht in
              den Dokumentfluss). Bleibt `istXl`, aber die Spalte ist
              eingeklappt/ohne Leiste (Rand-Fall, von der Spec nicht benannt),
              bleibt die alte, unauffällige Inline-Einblendung. */}
          {sucheAktiv && !listeInLeiste && istXl && (
            <div className="mb-8 border-b border-line pb-4">{trefferListeEl}</div>
          )}
          <div className="space-y-2">
            {ohneGliederung.length > 0 && (
              <div className="space-y-5 mb-6">
                {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} leitfaelle={leitfaelleFuer?.(e.artikel)} bezuege={bezuegeFuer(e.artikel)} revision={revisionFuer(e.artikel)} historie={historieFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />)}
              </div>
            )}
            {sektionen.map((s) => renderSektion(s, true, 0))}
          </div>

          {/* Einheitliches Kontext-Panel (B3): Entscheide/Materialien/Werkzeuge zu
              diesem Erlass — Norm ↔ Entscheid ↔ Material ↔ Werkzeug an einer Stelle
              (Burggraben). Lädt die Entscheide selbst (Single Source, §5). A32: in
              der 2-Spalten-Ansicht sitzt es unterhalb der Gliederung (oben, TOC-
              Spalte); HIER am Leseende nur noch als Mobil-/Rückfall-Platz
              (kontextImToc=false — Drawer-Layouts und eingeklappte Spalte). */}
          {/* W2·19-GLIEDERUNG/S6: mobil/eingeklappt trägt das Leseende auch die
              Erlass-Übersicht — über dem Panel, in derselben Reihenfolge wie in
              der Leiste (Bau-Spec §5.1 «Mobil am Leseende über dem Panel»). */}
          {!kontextImToc && (
            <div className="mt-12 border-t border-line pt-6 max-w-reading">{erlassUebersichtEl}</div>
          )}
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
