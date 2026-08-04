import { useEffect, useRef, type Dispatch, type MutableRefObject, type RefObject, type SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { aktualisiereTabArtikel, tabSchluessel } from '../../lib/tabs';
import { merkeAnker, bezugslinie, istHashVerbraucht } from './scrollAnker';
import { aktiverArtikel } from '../../lib/normtext/aktuellerArtikel';
import { useMeldeInhaltsKopf } from '../../components/layout/InhaltsKopfKontext';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur, ladeErlassKopf, ladeKantonSystematik, ladeCurrency,
  type Sektion, type StrukturMap, type ErlassKopf, type CurrencyMap,
} from '../../lib/normtext/browse';
import type { KantonSystematik } from '../../lib/normtext/systematik';
import { formatiereDatum, pfadZu } from './helpers';
import { LeserMenuPaar } from './LeserMenuPaar';
import type { Histogramm, Zeitbereich } from './bezugZeit';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import type { KlassenZahlen } from '../../lib/rechtsprechung/bezuege';
import { InGesetzSuche } from './parts/InGesetzSuche';
import { paneRoot, findeArt } from './berechnungen';
import type { BrowseErlass, BrowseManifest } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import type { LinienProfil } from './linienAufbau';

// ═══ ABSCHNITT · Reader-Effekt-Hooks (§6.6-Split, W2·12-HYGIENE/B24) ═════════
// Aus GesetzLeserInhalt ausgelagerte, side-effect-reine Custom-Hooks: die
// Daten-/Kopf-/Sprung-/Scroll-Spy-Effekte. VERHALTENSNEUTRAL: jeder Effekt +
// jede Dependency-Liste ist byte-identisch zum früheren Inline-Code; die
// HOOK-REIHENFOLGE bleibt erhalten, weil GesetzLeserInhalt diese Hooks an
// EXAKT derselben Position ruft, an der die Effekte vorher standen (kontiguer
// Effektblock je Hook, saubere Zustands-/Effekt-Grenze). Keine Rechtsregel,
// kein Normtext, keine Reihenfolge der Logik verändert.

type MeldeKopf = ReturnType<typeof useMeldeInhaltsKopf>;

// §15.2: Nachlauf-Fenster (in Pfadwechseln) fürs Auto-ZUklappen des TOC-Baums. Ein
// automatisch geöffneter Zweig bleibt so lange offen, bis die Leseposition ihn um so
// viele distinkte Pfadwechsel hinter sich gelassen hat — dann ist er sicher aus dem
// sichtbaren TOC-Fenster gescrollt und sein Zuklappen erzeugt keinen sichtbaren Layout-
// Shift (off-screen bzw. vom Scroll-Anchoring verschluckt). 6 ≈ mehrere TOC-Bildschirm-
// höhen Vorlauf; deckt das Hin-und-Her (PageUp nach PageDown) verlässlich ab.
const AUTO_ZU_NACHLAUF = 6;

// ── N2 (§17-Wurzelfix, Bug-Check 3.8.2026): Spy-Nachlauf nach dem jumpLock ────
// `auswerten` bricht ab, solange `jumpLock` steht (Klick-/TOC-Sprung, §15.2), und
// plante bisher NICHTS nach. Der Lock fällt 400/500 ms nach dem Sprung per Timer —
// ohne Scroll-Ereignis und ohne Observer-Meldung (der Sprung-Scroll ist da längst
// eingelaufen) blieb der Kopf danach bis zur nächsten NUTZER-Bewegung auf dem
// Artikel VOR dem Sprung stehen. Der Wächter sah das nicht, weil er nach dem
// Sprung 150 px scrollte und damit selbst den fehlenden Auslöser lieferte.
// Fix an der Wurzel: wer den Lock löst, meldet es hier — jeder montierte Spy holt
// genau eine Auswertung nach (derselbe rAF-Kranz, also nie zwei pro Frame; ohne
// Token-Wechsel erzeugt sie null Renders). Modul-lokale Registry statt neuem Ref
// durch drei Signaturen: hält den Diff in `inhalt.tsx` auf die Lock-Stellen
// begrenzt. Mehrere Instanzen (Split-View-Panes) registrieren sich einzeln; jede
// prüft in `auswerten` ihren EIGENEN Lock, ein fremdes Lösen weckt sie höchstens
// zu einer Neuberechnung ihres unveränderten Tokens (no-op).
const spyNachlauf = new Set<() => void>();

/** Nach dem Zurücksetzen von `jumpLock` aufrufen: plant je Spy eine Auswertung. */
export function loeseSpyNachlauf(): void {
  for (const planen of spyNachlauf) planen();
}

// ── Datenladung + Browser-Tab-Titel + Kopf-Aufräumen ─────────────────────────
export function useLeserDaten(opts: {
  ebene: string;
  schluessel: string;
  navigate: NavigateFunction;
  erlass: BrowseErlass | null;
  istSekundaer: boolean;
  meldeInhaltsKopf: MeldeKopf;
  setManifest: Dispatch<SetStateAction<BrowseManifest | null>>;
  setCurrency: Dispatch<SetStateAction<CurrencyMap | null>>;
  setStruktur: Dispatch<SetStateAction<StrukturMap | null>>;
  setKopf: Dispatch<SetStateAction<ErlassKopf | null>>;
  setKantonSys: Dispatch<SetStateAction<Record<string, KantonSystematik>>>;
  setErlass: Dispatch<SetStateAction<BrowseErlass | null>>;
  setEintraege: Dispatch<SetStateAction<NormSnapshot[] | null>>;
  setFehler: Dispatch<SetStateAction<boolean>>;
}): void {
  const {
    ebene, schluessel, navigate, erlass, istSekundaer, meldeInhaltsKopf,
    setManifest, setCurrency, setStruktur, setKopf, setKantonSys, setErlass, setEintraege, setFehler,
  } = opts;

  useEffect(() => {
    let lebt = true;
    void ladeBrowseManifest().then((m) => { if (lebt) setManifest(m); });
    void ladeCurrency().then((c) => { if (lebt) setCurrency(c); });
    void ladeStruktur(ebene, schluessel).then((s) => { if (lebt) setStruktur(s); });
    void ladeErlassKopf(ebene, schluessel).then((k) => { if (lebt) setKopf(k); });
    // N13: Systematik-Bäume nur für die Kanton-Lesesicht laden; fehlen sie, bleibt
    // die Overline ohne Sachgebiet (§8 — nichts Erfundenes).
    if (ebene === 'kanton') void ladeKantonSystematik().then((s) => { if (lebt) setKantonSys(s); });
    void ladeErlass(schluessel).then(async (e) => {
      if (!lebt) return;
      if (!e) {
        // W2·10-UI-NAV/N0b: Key case-insensitiv gegen das Register auflösen und auf
        // die kanonische URL umleiten (/gesetze/bund/or → /gesetze/bund/OR). Nur bei
        // EINDEUTIGEM Case-Treffer (kein Rate-Sprung); sonst ehrliche Fehlseite.
        const m = await ladeBrowseManifest();
        if (!lebt) return;
        const roh = schluessel.toLowerCase();
        const kandidaten = m?.erlasse.filter((x) => x.key.toLowerCase() === roh) ?? [];
        if (kandidaten.length === 1) {
          const ziel = kandidaten[0];
          navigate(`/gesetze/${ziel.ebene}/${encodeURIComponent(ziel.key)}`, { replace: true });
          return;
        }
        setFehler(true);
        return;
      }
      // pdf-embed: kein Snapshot-JSON — Erlass setzen, der Reader rendert das
      // eingebettete amtliche PDF (eintraege bleibt null).
      if (e.status === 'pdf-embed') { setErlass(e); return; }
      // LIVE_VERWEIS (⑧, W2·5d G3a): kein In-App-Volltext gehostet — Erlass setzen,
      // der Reader zeigt eine ehrliche Verweiskarte (amtlicher Live-Link + Stand,
      // §8) statt der «nicht verfügbar»-Fehlerseite. eintraege bleibt null.
      if (e.status === 'nur-live-link') { setErlass(e); return; }
      if (!e.datei) { setFehler(true); return; }
      setErlass(e);
      const datei = await ladeErlassDatei(e.datei);
      if (!lebt) return;
      if (!datei) { setFehler(true); return; }
      setEintraege(datei.eintraege);
    });
    return () => { lebt = false; };
    // Setter/navigate sind stabil; Deps bewusst auf [ebene, schluessel] gehalten
    // (byte-identisch zum früheren Inline-Effekt — kein Re-Fetch bei Render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ebene, schluessel]);

  // Browser-Tab zeigt den Erlass: «OR (Obligationenrecht) — LexMetrik». Kurztitel
  // = Klammer-Inhalt am Ende des Volltitels (LEGES-Konvention), sonst der Titel.
  useEffect(() => {
    if (!erlass || typeof document === 'undefined') return;
    if (istSekundaer) return; // sekundäres Pane treibt den Browser-Tab-Titel nicht (B-2.5)
    const kurz = erlass.titel.match(/\(([^)]+)\)\s*$/)?.[1] ?? erlass.titel;
    document.title = `${erlass.kuerzel} (${kurz}) — LexMetrik`;
  }, [erlass, istSekundaer]);

  // A/A2/A3/F: Kopf melden — die Meldung selbst steht in useInhaltsKopfMeldung (nach
  // `linien`/`fussnotenAnzahl`, die der A26-Ansicht-Slot braucht; TDZ). Hier nur das
  // Aufräumen. Beim Verlassen den Kopf räumen (Shell setzt bei Routenwechsel ohnehin zurück).
  useEffect(() => () => meldeInhaltsKopf(null), [meldeInhaltsKopf]);
}

// ── Kopf-Meldung (Breadcrumb · Stand · Live-Artikel · Ansicht + Suche) ───────
export function useInhaltsKopfMeldung(opts: {
  erlass: BrowseErlass | null;
  aktArtikel: string | null;
  meldeInhaltsKopf: MeldeKopf;
  imPane: boolean;
  eintraege: NormSnapshot[] | null;
  linien: LinienProfil;
  fussnotenAnzahl: number | null;
  /** W2·7-BEZUG/B4: Kantone, zu denen dieser Erlass Kanten hat (Kanton-Schalter).
   *  OPTIONAL: leer = noch kein Bezugs-Shard geladen ⇒ kein Kanton-Streifen. */
  kantoneVerfuegbar?: string[];
  /** B7/c: Kanten je Instanz-Klasse in diesem Erlass (Zahl am Instanz-Schalter). */
  klassenImErlass?: Partial<Record<BezugStatus, KlassenZahlen>>;
  /** W2·7-BEZUG/B5: Jahres-Verteilung der Kanten (Zeitstrahl im Dropdown).
   *  OPTIONAL: leer = noch kein Shard ⇒ der Streifen sagt das ehrlich. */
  bezugHistogramm?: Histogramm;
  /** W2·7-BEZUG/B5: aktiver Von-Bis-Bereich. OPTIONAL: Default = offen. */
  bezugBereich?: Zeitbereich;
  suche: string;
  setSuche: Dispatch<SetStateAction<string>>;
  istXl: boolean;
  tocOffen: boolean;
  tocAuf: boolean;
  setTocOffen: Dispatch<SetStateAction<boolean>>;
  setTocAuf: Dispatch<SetStateAction<boolean>>;
  sektionen: Sektion[];
}): void {
  const {
    erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, linien, fussnotenAnzahl, kantoneVerfuegbar = [], klassenImErlass,
    bezugHistogramm, bezugBereich,
    suche, setSuche, istXl, tocOffen, tocAuf, setTocOffen, setTocAuf, sektionen,
  } = opts;

  // A/A2/A3/F + A26: Kopf melden (Breadcrumb Gesetze › Ebene › Kürzel · Stand ·
  // aktueller Artikel · «Ansicht»-Dropdown). Wird vom NÄCHSTEN Provider gefangen:
  // Einzelansicht → Inhalts-Kopf (Shell); Split-View → der jeweilige PaneKopf.
  // Live-Artikel kommt aus dem IntersectionObserver.
  // A26 (David 11.7.2026): NUR die Einzelansicht (!imPane) trägt das «Ansicht»-
  // Dropdown im immer sichtbaren Inhalts-Kopf mit — im Split-View bleibt es (ohne
  // PaneKopf-Umbau/Stacking-Risiko) im Erlass-Kopf. `eintraege` (Volltext-Snapshot)
  // grenzt pdf-embed/nur-live-link aus (dort wären die Optionen wirkungslos, §13 F4).
  useEffect(() => {
    if (!erlass) return;
    const ebeneLabel = erlass.rechtsgebiet === 'international'
      ? 'International'
      : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`;
    // Ebene-Segment klickbar → gefilterte Gesetzes-Übersicht (?ebene=/?kt=).
    const ebeneTo = erlass.rechtsgebiet === 'international'
      ? '/gesetze?ebene=international'
      : erlass.ebene === 'bund' ? '/gesetze'
        : `/gesetze?ebene=kanton&kt=${encodeURIComponent(erlass.kanton ?? '')}`;
    // A35 (David 19.7.2026): ☰-Gliederungsknopf, den das In-Gesetz-Suchfeld im Kopf
    // mitführt (löst die frühere `data-such-bar`-Position ab, die in der Einzelansicht
    // entfällt). Desktop (istXl): nur als Wiedereinblender, wenn die Gliederungsspalte
    // EINGEKLAPPT ist. Mobil: öffnet die Gliederung als Overlay-Drawer. Ohne Sektionen
    // (flacher Erlass) kein Knopf.
    const zeigeGliederung = !imPane && sektionen.length > 0 && (istXl ? !tocOffen : true);
    const gliederungKnopf = zeigeGliederung ? (
      <button type="button" aria-expanded={istXl ? tocOffen : tocAuf}
        onClick={() => { if (istXl) setTocOffen(true); else setTocAuf((v) => !v); }}
        title="Gliederung" aria-label="Gliederung"
        // B6: gemeinsame Leisten-Anatomie statt eigenem bordierten Kästchen.
        // Das Wort «Gliederung» erscheint ab xl — eine Stufe SPÄTER als die
        // beiden Menü-Wörter (md), damit das Paar «Rechtsprechung ▾ · Ansicht ▾»
        // die einzige beschriftete Gruppe der mittleren Breiten bleibt und der
        // Riegel nicht drei Wörter nebeneinander trägt.
        className="lc-leiste-griff">
        <span aria-hidden>☰</span><span className="hidden xl:inline">Gliederung</span>
      </button>
    ) : undefined;
    meldeInhaltsKopf({
      breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: ebeneLabel, to: ebeneTo }, { label: erlass.kuerzel }],
      stand: erlass.stand ? formatiereDatum(erlass.stand) : null,
      // Hinter dem laufenden Artikel die Gesetzesabkürzung (z. B. «Art. 7 OR»).
      artikel: aktArtikel ? `${aktArtikel} ${erlass.kuerzel}` : null,
      ansichtSlot: !imPane && eintraege
        ? (
          // W2·7-BEZUG/B4 (Vorgabe David 28.7.2026): «Rechtsprechung ▾» als
          // EIGENES Dropdown der Werkzeugleiste, links von «Ansicht ▾». Beide
          // gehen in denselben `ansichtSlot` — der Kopf (components/layout)
          // rendert ihn opak, die Layer-Trennung bleibt also unberührt.
          // B6: die Paarung selbst liegt in `LeserMenuPaar` (§5) — sie stand
          // vorher als identisches Fragment an ZWEI Stellen (hier und in der
          // Pane-Suchleiste) und lief in den Label-Schwellen auseinander.
          <LeserMenuPaar kantoneVerfuegbar={kantoneVerfuegbar} klassenImErlass={klassenImErlass}
            bezugHistogramm={bezugHistogramm} bezugBereich={bezugBereich}
            linien={linien} fussnotenAnzahl={fussnotenAnzahl} />
        )
        : undefined,
      // A35: das In-Gesetz-Suchfeld nur in der Einzelansicht (im Split-View trägt es
      // weiter die pane-lokale `data-such-bar`, da dort kein InhaltsKopf existiert).
      sucheSlot: !imPane && eintraege
        ? <InGesetzSuche value={suche} onChange={setSuche} gliederung={gliederungKnopf} />
        : undefined,
    });
    // Setter (setSuche/setTocOffen/setTocAuf) sind stabil; Deps byte-identisch zum
    // früheren Inline-Effekt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, linien, fussnotenAnzahl,
      kantoneVerfuegbar, klassenImErlass, bezugHistogramm, bezugBereich,
      suche, istXl, tocOffen, tocAuf, sektionen.length]);
}

// ── Hash-Sprung-Seed + geteilter Aktiv-Artikel-Beobachter (Scroll-Spy) + TOC-
//    Mitscroll + Nutzer-Interaktions-Guard + Scroll-Anker ──────────────────────
export function useLeserSprungSpy(opts: {
  ebene: string;
  schluessel: string;
  eintraege: NormSnapshot[] | null;
  sektionen: Sektion[];
  ohneGliederung: NormSnapshot[];
  istSekundaer: boolean;
  imPane: boolean;
  wurzel: RefObject<HTMLElement | null> | null;
  paneLocationHash: string;
  basisPfad: string;
  offen: Record<string, boolean>;
  sucheDebounced: string;
  aktivIds: string[];
  tocBaum: Record<string, boolean>;
  istXl: boolean;
  tocOffen: boolean;
  artLabelByToken: Map<string, string>;
  setOffen: Dispatch<SetStateAction<Record<string, boolean>>>;
  setAktArtikel: Dispatch<SetStateAction<string | null>>;
  setAktivIds: Dispatch<SetStateAction<string[]>>;
  setTocBaum: Dispatch<SetStateAction<Record<string, boolean>>>;
  refs: {
    jumpLock: MutableRefObject<boolean>;
    autoOffenRef: MutableRefObject<Set<string>>;
    autoTickRef: MutableRefObject<Map<string, number>>;
    autoTickNowRef: MutableRefObject<number>;
    manuellOffenRef: MutableRefObject<Set<string>>;
    manuellZuRef: MutableRefObject<Set<string>>;
    tocBaumTimer: MutableRefObject<number | null>;
    tabArtikelTimer: MutableRefObject<number | null>;
    aktArtikelTimer: MutableRefObject<number | null>;
    tocTouchRef: MutableRefObject<number>;
  };
}): void {
  const {
    ebene, schluessel, eintraege, sektionen, ohneGliederung, istSekundaer, imPane, wurzel,
    paneLocationHash, basisPfad, offen, sucheDebounced, aktivIds, tocBaum, istXl, tocOffen,
    artLabelByToken, setOffen, setAktArtikel, setAktivIds, setTocBaum, refs,
  } = opts;
  const {
    jumpLock, autoOffenRef, autoTickRef, autoTickNowRef, manuellOffenRef, manuellZuRef,
    tocBaumTimer, tabArtikelTimer, aktArtikelTimer, tocTouchRef,
  } = refs;

  const oeffnePfad = (ids: string[]) => setOffen((o) => {
    const n = { ...o }; for (const id of ids) n[id] = true; return n;
  });

  // E3/A34 (David 16.7.2026): der Seed-Sprung unten darf pro Erlass-Ladung NUR
  // EINMAL feuern — nicht erneut, wenn die Einzelansicht in den Split-View kippt
  // (`imPane`/`wurzel` wechseln von false→true). Sonst las der Effekt beim Pane-
  // Öffnen erneut `window.location.hash` (= der zuvor angeklickte Artikel) und
  // sprang das frisch weitergescrollte Gesetz-Pane auf diesen früheren Artikel
  // zurück (Scroll-Verlust, §15 Funktions-Treue «Split-View-Pane-Zustand»). Der
  // Wächter wird pro Erlass zurückgesetzt; spätere Hash-Wechsel trägt ohnehin der
  // letzteNavKey-Effekt (Primär) bzw. die eigene Pane-History (A16/A17).
  const hashSeedGetan = useRef(false);
  useEffect(() => { hashSeedGetan.current = false; }, [ebene, schluessel]);

  // Hash-Sprung: alle Vorfahren des Ziel-Artikels öffnen + scrollen.
  // W2·5d U-POSITION/A17: auch im SEKUNDÄREN Pane an die Fundstelle springen —
  // der ⧉-Öffner legt den Pfad MIT `#art-token` ab (NormPopover readerLink), aber
  // die Fundstelle stand bisher nur in `window.location.hash` (= die Haupt-URL,
  // NICHT der Pane-Pfad) und der Effekt brach für Panes ab ⇒ das Pane öffnete oben
  // statt an der Norm. Quelle des Hashs ist im Pane die PANE-LOKALE Location
  // (`<Routes location={loc}>` → react-router `useLocation()` liefert den Pane-Pfad),
  // sonst wie bisher die echte Fenster-URL (Primär/Einzelansicht byte-gleich).
  useEffect(() => {
    if (!eintraege || !sektionen.length || typeof window === 'undefined') return;
    // A34: nur der ERSTE inhaltsbereite Lauf sät den Sprung. Danach gesperrt —
    // ein `imPane`/`wurzel`-Wechsel (Split-View öffnet) re-triggert den Effekt,
    // darf aber NICHT erneut an den (alten) Hash springen. Wächter VOR dem Hash-
    // Test setzen, damit auch ein hashloser Erststart den späteren Re-Lauf sperrt.
    if (hashSeedGetan.current) return;
    hashSeedGetan.current = true;
    // LM-199 (W2·17-UI-BEFUNDE-B2): VERBRAUCHTER Einstiegs-Hash — beim Browser-
    // Zurück aus einer anderen Route steht der alte «#art-…» noch in der URL,
    // massgeblich ist aber die A16-Anker-Restauration (App.tsx). Ohne diesen
    // Wächter kaperte der Seed-Sprung nach dem Remount die Rückkehr-Position
    // erneut (Prod-Messung 2.8.2026: ~149'000 px daneben). Nur Primär — das
    // sekundäre Pane hat seine eigene, frisch geseedete Location (A17).
    if (!istSekundaer && istHashVerbraucht()) return;
    const hashQuelle = istSekundaer ? paneLocationHash : window.location.hash;
    const m = hashQuelle.match(/^#art-(.+)$/);
    if (!m) return;
    // Deep-Link mit Artikel-Anker → aktiven Reiter darauf melden (Live-Label).
    // Sekundäres Pane treibt den globalen Reiter-Tracker NICHT (es ist nicht die URL).
    if (!istSekundaer) aktualisiereTabArtikel(window.location.pathname + window.location.search + window.location.hash);
    const token = decodeURIComponent(m[1]);
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    window.requestAnimationFrame(() => {
      if (ids.length) oeffnePfad(ids);
      window.setTimeout(() => {
        const el = findeArt(paneRoot(imPane, wurzel), token);
        // R1: oberer Lese-Rand statt Mitte (deckt sich mit der Scroll-Spy-Bezugslinie).
        el?.scrollIntoView({ block: 'start', behavior: 'auto' });
        el?.classList.add('lc-ziel-blink');
        window.setTimeout(() => el?.classList.remove('lc-ziel-blink'), 2400);
      }, 110);
    });
    // location.hash bewusst NICHT in den Deps: der Effekt springt EINMAL beim
    // Erlass-Laden an die (Pane-lokale bzw. Fenster-)Fundstelle — die Primär-
    // Instanz führt spätere Hash-Wechsel über den letzteNavKey-Effekt nach
    // (kein Doppel-Sprung/-Blink), das Pane öffnet an seiner Seed-Fundstelle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eintraege, sektionen, istSekundaer, imPane, wurzel]);

  // Geteilter «aktueller-Artikel»-Beobachter (Auftrag David 26.6.2026): EIN
  // IntersectionObserver bestimmt den Artikel, der OBEN im Viewport angeschnitten
  // ist, und speist daraus zwei Konsumenten aus EINER Quelle — (a) die Gliederungs-
  // Markierung + automatisches Auf-/Zuklappen des aktiven Zweigs (P9/K) UND (b) das
  // Live-Label des aktiven Reiters «Kürzel – Art. X» (P2). IntersectionObserver
  // statt getBoundingClientRect-Schleife wegen content-visibility:auto (Off-Screen-
  // Artikel sind nur Platzhalter).
  // R1 (Auftrag David 30.6.2026): NICHT mehr der mittige Artikel, sondern der
  // ZUOBERST angeschnittene — die Bezugslinie sitzt am Sprung-Landepunkt (5rem unter
  // dem Container-Oberrand, deckungsgleich mit `.nt-anker`). Die Auswahl-Logik bleibt
  // die reine, getestete Funktion aktiverArtikel — sie wählt generisch den Artikel
  // an der Bezugslinie (§2/§3).
  // V3/H6 (W2·5d-SPY, 3.8.2026): Das Beobachtungs-Band war früher an die Linie
  // GEKOPPELT (obere ~45 % der Root-Höhe) und verfehlte sie in zwei belegten
  // Lagen; heute ist es reiner Vorfilter (ganzer Root) und die Linie entscheidet
  // allein, ausgewertet pro Scroll-Frame. Herleitung + Messprotokoll unten am
  // Observer.
  const letzterArtToken = useRef<string | null>(null);
  useEffect(() => {
    // C (Auftrag David 26.6.2026): auch starten, wenn der Erlass KEINE Gliederung
    // hat (kantonale Erlasse → alle Artikel in `ohneGliederung`). Sonst lief der
    // Beobachter nie an und «aktueller Artikel» (Reiter-Live-Label, P2) blieb
    // bei Kanton stehen. Artikel tragen bei Bund UND Kanton id="art-<token>".
    if ((!sektionen.length && !ohneGliederung.length) || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const sichtbar = new Map<Element, IntersectionObserverEntry>();
    let raf = 0;
    const auswerten = () => {
      raf = 0;
      if (jumpLock.current) return; // während eines Klick-Sprungs nicht dazwischenfunken
      // Bezugslinie im Viewport-Koordinatensystem (getBoundingClientRect): R1 — nicht
      // mehr die Mitte, sondern eine Linie nahe dem oberen Lese-Rand, damit der zuoberst
      // angeschnittene Artikel «dran» ist. Im Pane relativ zur Pane-Oberkante, sonst
      // zum Fenster (B-2.5).
      // KRITISCH (R1×R3): Der Klick-/Anker-Sprung landet den Artikel über die
      // `.nt-anker`-scroll-margin (= 5rem, index.css) genau 5rem unter dem
      // Container-Oberrand. Die Bezugslinie MUSS denselben Offset treffen, sonst
      // markiert der Spy nach dem Sprung den Vorgänger. Darum FIXER rem-Offset (5rem
      // + Epsilon), NICHT ein Höhen-Prozent: rem-basiert skaliert er mit der
      // R3-Schriftskala mit und ist unabhängig von der Viewport-Höhe/vom Zoom.
      const sc = paneRoot(imPane, wurzel);
      const oben = sc ? sc.getBoundingClientRect().top : 0;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // N1 (§5, Bug-Check 3.8.2026): den Zahlenwert der Linie NICHT hier zweitmalig
      // ausrechnen — `bezugslinie` (scrollAnker.ts) ist die eine Wahrheit, die auch
      // die Anker-Auflösung (aufloeseAnkerY) und der Scroll-Offset unten (~Z. 632)
      // benutzen. Ein Inline-Duplikat driftet lautlos, sobald sich die Linie ändert.
      const bezug = bezugslinie(oben, remPx);
      const rects = [...sichtbar.values()]
        .filter((en) => en.isIntersecting)
        .map((en) => {
          const r = en.target.getBoundingClientRect();
          return { token: (en.target as HTMLElement).id.replace(/^art-/, ''), top: r.top, bottom: r.bottom };
        });
      const token = aktiverArtikel(rects, bezug);
      if (!token || token === letzterArtToken.current) return; // dedup: nur bei Wechsel
      letzterArtToken.current = token;
      // A3/F: aktuellen Artikel an den Kopf melden (Einzelansicht-Kopf ODER PaneKopf),
      // entprellt (150 ms) → coalesct schnelle Artikelgrenzen, weniger Pane-Re-Renders.
      // Echtes Label des Eintrags (deckt Schlusstitel «Art. 3» korrekt ab);
      // Fallback auf die Token-Heuristik nur, falls kein Eintrag passt.
      const artLabel = artLabelByToken.get(token) ?? `Art. ${token.replace(/_/g, '')}`;
      if (aktArtikelTimer.current != null) window.clearTimeout(aktArtikelTimer.current);
      aktArtikelTimer.current = window.setTimeout(() => setAktArtikel(artLabel), 150);
      // (b) Reiter-Live-Label: ?search (Instanz-?r) erhalten, Hash = #art-token.
      //     aktualisiereTabArtikel ist idempotent + no-op ohne passenden Reiter.
      //     Entprellt (trailing): beim schnellen Durchscrollen sonst ein
      //     localStorage-Write + globales TABS_EVENT pro Artikelgrenze.
      // Sekundäres Pane treibt den globalen Reiter-Tracker NICHT (es ist nicht die URL).
      if (!istSekundaer) {
        const tabZiel = `${basisPfad}${window.location.search}#art-${token}`;
        if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
        tabArtikelTimer.current = window.setTimeout(() => aktualisiereTabArtikel(tabZiel), 200);
      }
      // (a) Gliederung: aktiven Pfad markieren + den Zweig automatisch AUFklappen
      //     und beim Verlassen wieder ZUklappen (K, Auftrag David 26.6.2026) —
      //     aber nur Zweige, die der Spy selbst geöffnet hat (autoOffenRef);
      //     manuell geöffnete bleiben offen. Der Mitscroll-Effekt hält den
      //     aktiven Eintrag dann im TOC-Container sichtbar.
      const ids = pfadZu(sektionen, (s) => s.artikel.some((x) => x.artikel === token)) ?? [];
      if (!ids.length) return;
      // F3 (RC2, Auftrag David 16.7. «Gliederung springt umher»): den (a)-Block
      // (Markierung + Auto-Akkordeon) TRAILING entprellen (~200 ms, analog aktArtikel/
      // tabArtikel oben). Der Timer verarbeitet stets das ZULETZT gemeldete `ids` (jeder
      // neue Frame löscht den vorigen Timer). Wirkung: beim schnellen Durchscrollen EIN
      // Auf/Zu statt einer dichten Reflow-Folge des Baums. Das Verhalten (Auto-Auf-/
      // Zuklappen, Auftrag K 26.6.) bleibt — nur seine Frequenz sinkt. Der Klick-Sprung-
      // Pfad (springeZuArtikel/springeZuSektion) setzt aktivIds/tocBaum weiterhin SOFORT
      // und löscht diesen Timer (kein Kampf mit einem verspäteten Auto-Update).
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
      tocBaumTimer.current = window.setTimeout(() => {
        // Wertgleichen Pfad nicht neu setzen (pfadZu liefert stets ein neues Array):
        // sonst Re-Render + Mitscroll-Effekt bei jedem Artikel derselben Blatt-Sektion.
        setAktivIds((prev) => prev.length === ids.length && prev.every((v, i) => v === ids[i]) ? prev : ids);
        // Auto-Set fortschreiben (Seiteneffekt ausserhalb des State-Updaters, der rein
        // bleibt): aufklappen, was jetzt im Pfad liegt; zuklappen NUR, was die Lese-
        // position um AUTO_ZU_NACHLAUF Pfadwechsel hinter sich gelassen hat (§15.2: dann
        // off-screen → Zuklapp-Reflow zählt nicht; verhindert das sichtbare Auf-/Zu-
        // klappen beim Hin-und-Her-Scrollen, das auf 2-vCPU-CI das CLS-Budget riss).
        const auto = autoOffenRef.current;
        const tick = ++autoTickNowRef.current;
        // Aktive Pfad-IDs auto-aufklappen — aber manuell geöffnete NICHT ins Auto-Set
        // adoptieren (die bleiben dauerhaft offen) und manuell ZUgeklappte (manuellZuRef)
        // gar nicht auto-aufklappen (explizites Einklappen des aktiven Zweigs gewinnt).
        // Jedes Aktiv-Vorkommen (inkl. Vorfahren aus pfadZu) frischt den Nachlauf-Tick.
        for (const id of ids) if (!manuellOffenRef.current.has(id) && !manuellZuRef.current.has(id)) { auto.add(id); autoTickRef.current.set(id, tick); }
        // BEFUND 3 (A9-Forensik 19.7.2026): der bisherige «nur off-screen»-Wächter
        // (BEFUND 2) prüfte auf ÜBERLAPPUNG mit dem [data-toc]-Sichtband und klappte
        // jeden NICHT-überlappenden Ast zu — also auch Äste OBERHALB des Bandes. Genau
        // das riss auf dem 2-vCPU-Runner das Budget: kollabiert ein Ast oberhalb der
        // sichtbaren Zeilen, rückt der GESAMTE sichtbare Inhalt DARUNTER nach oben — ein
        // gezählter Layout-Shift (das gemeldete li 248×195→0×0 ist ein Kind eines
        // solchen oberhalb-Astes). §15.2-treuer Fix: einen Ast NUR zuklappen, wenn er
        // GANZ UNTERHALB des Sichtbandes liegt (r.top ≥ contRect.bottom) — dann bewegt
        // sein Kollaps ausschliesslich off-screen-Inhalt (der Ast selbst + alles darunter
        // sind unsichtbar), nie eine sichtbare Zeile. Äste im Band ODER darüber bleiben
        // offen. Das ist strikt KONSERVATIVER als zuvor (klappt eine Teilmenge der
        // bisherigen Äste zu) → kann keinen NEUEN Shift erzeugen. Auto-Akkordeon (Auftrag
        // K) bleibt: beim Zurück-nach-oben-Scrollen verlassene (jetzt unterhalb liegende)
        // Äste klappen weiterhin zu; beim Weiterlesen nach unten bleiben die überholten
        // (oberhalb liegenden) Äste ruhig offen statt sichtbar zu springen (deckt sich mit
        // Davids Kernwunsch «Gliederung springt nicht umher», 16.7.). `getBoundingClientRect`
        // ist reine Lese-Messung (kein Reflow-Trigger, im Timer nach dem Settle).
        const tocCont = (paneRoot(imPane, wurzel) ?? document).querySelector('[data-toc]') as HTMLElement | null;
        const contRect = tocCont?.getBoundingClientRect();
        const darfZuklappen = (id: string): boolean => {
          if (!tocCont || !contRect) return false; // kein Container/Mass ⇒ sicherheitshalber NICHT zuklappen
          const el = tocCont.querySelector(`[data-sektion-id="${CSS.escape(id)}"]`) as HTMLElement | null;
          if (!el) return false; // nicht gefunden ⇒ nicht zuklappen (keine Blind-Aktion)
          const r = el.getBoundingClientRect();
          return r.top >= contRect.bottom; // NUR wenn der Ast komplett unter dem Sichtband sitzt
        };
        const schliessen: string[] = [];
        for (const id of [...auto]) {
          if (ids.includes(id)) continue; // im aktiven Pfad → offen halten
          if (tick - (autoTickRef.current.get(id) ?? 0) <= AUTO_ZU_NACHLAUF) continue; // noch im Nachlauf-Fenster
          if (!darfZuklappen(id)) continue; // nur Äste GANZ UNTERHALB des Sichtbands (sonst sichtbarer Reflow)
          auto.delete(id); autoTickRef.current.delete(id); schliessen.push(id);
        }
        setTocBaum((o) => {
          let geaendert = false;
          const n = { ...o };
          for (const id of ids) if (!n[id] && !manuellZuRef.current.has(id)) { n[id] = true; geaendert = true; }
          for (const id of schliessen) if (n[id]) { n[id] = false; geaendert = true; }
          return geaendert ? n : o; // identische Referenz, wenn nichts ändert → kein Re-Render
        });
      }, 200);
    };
    const io = new IntersectionObserver((entries) => {
      // V3/H6 (W2·5d-SPY): NICHT-schneidende Einträge aus der Karte ENTFERNEN statt
      // sie mit `isIntersecting:false` liegen zu lassen. Sonst wuchs `sichtbar` über
      // die Lesedauer auf alle je gesehenen Artikel (OR: 1686) und jede Auswertung
      // iterierte sie alle. Fachlich identisch (der Filter unten warf sie ohnehin weg),
      // aber Voraussetzung dafür, dass `auswerten` pro Scroll-Frame billig bleibt.
      for (const en of entries) { if (en.isIntersecting) sichtbar.set(en.target, en); else sichtbar.delete(en.target); }
      if (!raf) raf = window.requestAnimationFrame(auswerten);
      // V3/H6 (W2·5d-SPY, 3.8.2026): Das Band ist nur noch VORFILTER (ganzer Root),
      // die Bezugslinie allein entscheidet. Vorher `0px 0px -55% 0px` — obere 45 %
      // der Root-Höhe. Diese Kopplung war der Härtungs-Posten aus der E7/A33-Runde
      // und ist mit Playwright reproduziert (Protokoll im PR):
      //  H6-a «Band verfehlt die Linie» — 0,45 · H_root < 5rem + 8 (Viewport 320×200
      //    ≙ 400 % Browser-Zoom nach WCAG 1.4.10, oder R3-Schriftskala 140 % auf
      //    kleinem Schirm): der Artikel AN der Linie schnitt das Band nicht mehr,
      //    `aktiverArtikel` bekam ihn gar nicht zu sehen. Gemessen auf /gesetze/bund/OR
      //    bei 320×200: 3 von 24 Proben mit falschem bzw. LEEREM Kandidatensatz
      //    (Kopf blieb auf Art. 40 stehen, während Art. 40a an der Linie lag).
      //  H6-b «Auslöser sitzt am Band, nicht an der Linie» — der Wechsel wurde erst
      //    beim VERLASSEN des Bandes an dessen Oberkante (y = 0) gemeldet, also erst
      //    5rem + 8 px Scrollweg NACH dem Überschreiten der Bezugslinie. Gemessen:
      //    OR 1440×900 3/30 Proben (bis 30 px verspätet, unter 6× CPU-Drossel
      //    identisch → layout-getrieben, kein Timing-Artefakt), BGFA 5/24 (bis 65 px),
      //    OR mit Schriftskala 140 % 2/24 (Verzug wächst mit rem, weil die Linie
      //    5rem + 8 unter der Band-Oberkante sitzt).
      // Ganzer Root als Band ⇒ der Artikel an der Linie ist IMMER im Kandidatensatz
      // (Obermenge des bisherigen), und der Satz bleibt klein (Viewport-Höhe ÷
      // Artikelhöhe ≈ 2–8). Die Auswahl bleibt die reine Funktion `aktiverArtikel`
      // (§2/§3) — sie wählt weiter «Artikel an der Bezugslinie, sonst kleinste
      // Distanz», jetzt aber über einen Satz, der die Linie garantiert überdeckt.
      // Ein rootMargin, der die Linie SELBST nachbildet (`-88px …`), wäre die
      // scheinbar direktere Kopplung, aber die falsche: rootMargin ist beim
      // Observer-Bau eingefroren, die Linie hängt an rem (R3-Schriftskala) und an
      // der Root-Höhe — genau dieses Einfrieren war der Defekt. Darum bleibt der
      // Zahlenwert der Linie dort, wo er frisch gemessen wird: in `auswerten`.
    }, { root: paneRoot(imPane, wurzel), rootMargin: '0px', threshold: 0 });
    // Alle aktuell gerenderten Artikel beobachten — im Pane nur die DIESES Panes
    // (B-2.5: sonst beobachtet der Spy auch das andere Pane → falsches Live-Label).
    // Auf-/Zuklappen (offen) und Suche (sucheDebounced) verändern die DOM-Artikelmenge
    // → Effekt läuft über die Deps neu und beobachtet die dann sichtbaren Artikel.
    // Rank 9: an sucheDebounced statt suche gekoppelt — der Observer-Neuaufbau (alle
    // art--Knoten neu beobachten) läuft so nicht bei jedem Tastendruck.
    (paneRoot(imPane, wurzel) ?? document).querySelectorAll('[id^="art-"]').forEach((el) => io.observe(el));
    // V3/H6 (W2·5d-SPY): zweiter Auslöser — jeder Scroll-Frame. Der Observer meldet
    // NUR Band-Ein-/Austritte; zwischen zwei solchen Ereignissen überquert die
    // Bezugslinie ungesehen Artikelgrenzen (H6-b). Mit dieser Zeile wird die
    // Entscheidung dort neu gefällt, wo sie hingehört: an der frisch gemessenen
    // Linie, bei jedem Frame. §15: derselbe rAF-Kranz wie der Observer (ein `raf`,
    // ein `auswerten`) — nie zwei Auswertungen pro Frame; `auswerten` liest ~2–8
    // Rechtecke und bricht beim unveränderten Token vor jedem State-Update ab
    // (`token === letzterArtToken.current`), erzeugt also im Regelfall NULL Renders.
    // Passiv registriert (kein Scroll-Blocker). Ziel ist der Scroll-Container des
    // Panes bzw. das Fenster — dieselbe Quelle, aus der `oben` gemessen wird.
    const scrollZiel: HTMLElement | Window = paneRoot(imPane, wurzel) ?? window;
    const beiScroll = () => { if (!raf) raf = window.requestAnimationFrame(auswerten); };
    scrollZiel.addEventListener('scroll', beiScroll, { passive: true });
    // N2: dritter Auslöser — das Lösen des jumpLock (Herleitung oben bei
    // `spyNachlauf`). Derselbe rAF-Kranz wie Observer und Scroll.
    spyNachlauf.add(beiScroll);
    return () => {
      io.disconnect();
      scrollZiel.removeEventListener('scroll', beiScroll);
      spyNachlauf.delete(beiScroll);
      if (raf) cancelAnimationFrame(raf);
      if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
      if (aktArtikelTimer.current != null) window.clearTimeout(aktArtikelTimer.current);
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current); // F3
    };
    // Refs/Setter (jumpLock/…/setAktivIds) + artLabelByToken sind stabil bzw. bewusst
    // ausgelassen; Deps byte-identisch zum früheren Inline-Effekt (Rank 9-Kopplung).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sektionen, ohneGliederung, basisPfad, offen, sucheDebounced, istSekundaer, imPane, wurzel]);

  // Aktiven Eintrag im TOC sichtbar halten — sanft, nur den TOC-Container, nie die
  // Seite scrollen. Läuft bei JEDEM Wechsel des aktiven Pfads (aktivIds) UND nach
  // dem Aufklapp-Settle (tocBaum): so folgt die Gliederung beim Scrollen der
  // Leseposition (P9b — vorher fehlte aktivIds in den Deps, darum scrollte der TOC
  // beim Scrollen nicht mit). Nur scrollen, wenn der aktive Eintrag aus dem Sicht-
  // feld des TOC-Containers gelaufen ist (sonst kein unnötiger Sprung).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Pane-gescopt: sonst trifft der globale Query ein FREMDES Pane (zwei breite
    // Gesetz-Panes haben je ein [data-toc]) → falsches Pane scrollt (E-Regression).
    const wurzelEl = paneRoot(imPane, wurzel);
    const cont = (wurzelEl ?? document).querySelector('[data-toc]') as HTMLElement | null;
    if (!cont) return;
    // F2 (RC1b) + V1: solange der Nutzer die Gliederung aktiv durchblättert (letzte
    // Bedienung < 1,5 s her), NICHT nachführen — er soll sich frei darin bewegen
    // können (David 16.7. «Wenn man sich darin bewegt»). V1 (stille Wiederaufnahme):
    // dieser Effekt läuft nur bei echtem aktivIds-/tocBaum-Wechsel; nach Ablauf des
    // Guards führt also erst der NÄCHSTE Artikelwechsel wieder nach — keine verspätete
    // Rückhol-Bewegung, die das Erkunden abbricht.
    if (Date.now() - tocTouchRef.current < 1500) return;
    const aktive = cont.querySelectorAll('[data-toc-aktiv]');
    const el = aktive[aktive.length - 1] as HTMLElement | undefined;
    if (!el) return;
    const cr = cont.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    // F1 (RC1a): minimaler Rand-NUDGE statt Zentrieren, INSTANT statt smooth. Nur so
    // weit scrollen, dass der aktive Eintrag knapp in das 8-px-Dead-Band am jeweiligen
    // Rand rückt (Auslöseschwelle == Zielposition → kein Re-Trigger); Delta ≈ eine
    // Zeilenhöhe statt ½ Container (früher `- cr.height/2` = Sprünge von 289–315 px).
    // Bewusst KEIN scrollIntoView({block:'nearest'}): das kann Ancestor/Seite mitscrollen
    // (E-Regression, Kommentar oben «nie die Seite scrollen»). Kein `smooth`: beseitigt
    // den Klickziel-Hazard (Buttons wandern nicht mehr unter dem Cursor weg).
    const dOben = er.top - (cr.top + 8);
    const dUnten = er.bottom - (cr.bottom - 8);
    if (dOben < 0) cont.scrollTo({ top: cont.scrollTop + dOben });
    else if (dUnten > 0) cont.scrollTo({ top: cont.scrollTop + dUnten });
    // tocTouchRef ist ein stabiler Ref; Deps byte-identisch zum früheren Inline-Effekt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktivIds, tocBaum, imPane, wurzel]);

  // F2 (RC1b): Nutzer-Interaktions-Guard. Passive Input-Listener am [data-toc]-
  // Container (pane-gescopt) armieren den Guard — NICHT `scroll`, sonst würde der
  // eigene programmatische Nudge den Guard selbst auslösen. Läuft neu, sobald die
  // TOC-Spalte erscheint/verschwindet (istXl/tocOffen/sektionen).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const wurzelEl = paneRoot(imPane, wurzel);
    const cont = (wurzelEl ?? document).querySelector('[data-toc]') as HTMLElement | null;
    if (!cont) return;
    const merke = () => { tocTouchRef.current = Date.now(); };
    cont.addEventListener('wheel', merke, { passive: true });
    cont.addEventListener('pointerdown', merke, { passive: true });
    cont.addEventListener('touchstart', merke, { passive: true });
    return () => {
      cont.removeEventListener('wheel', merke);
      cont.removeEventListener('pointerdown', merke);
      cont.removeEventListener('touchstart', merke);
    };
    // tocTouchRef ist ein stabiler Ref; Deps byte-identisch zum früheren Inline-Effekt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sektionen, istXl, tocOffen, imPane, wurzel]);

  // W2·5d U-POSITION/A16: laufend den Scroll-Anker dieses Reiters festhalten
  // (oberster sichtbarer Artikel `letzterArtToken` + Offset in ihn hinein). Beim
  // Zurück-/Reiter-Wechsel stellt App.tsx:ScrollWiederherstellung EXAKT diese Stelle
  // wieder her — element-basiert und darum robust gegen die content-visibility-
  // Höhenschätzung (David 5.7.: scrollTop allein ist unzuverlässig). Nur die
  // Primär-/Einzelansicht (die Fenster-Restoration); das Pane hat eigene History.
  // Passiver, rAF-entprellter Scroll-Listener (§15): eine getBoundingClientRect je
  // Frame, kein setState (keine Render-Kaskade).
  useEffect(() => {
    if (istSekundaer || typeof window === 'undefined') return;
    let raf = 0;
    const erfasse = () => {
      raf = 0;
      const token = letzterArtToken.current;
      if (!token) return;
      const el = findeArt(null, token);
      if (!el) return;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const offset = Math.max(0, Math.round(bezugslinie(0, remPx) - el.getBoundingClientRect().top));
      merkeAnker(tabSchluessel(basisPfad + window.location.search), { token, offset });
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(erfasse); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [istSekundaer, basisPfad]);
}
