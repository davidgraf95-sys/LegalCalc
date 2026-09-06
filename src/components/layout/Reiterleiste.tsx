import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import { schliesseTab, leereTabs, ordneTabsUm, tabSchluessel, type TabEintrag, reiterKurzform } from '../../lib/tabs';
import { erlassVonPfad, verlaufLabel, type VerlaufManifeste } from '../../lib/verlaufLabel';
import { reiterKategorie, artikelLabelVonPfad } from '../../lib/tabGruppen';
import { registerVonPfad, REG_FLAECHE, REG_TON, REG_HOVER_FLAECHE_REITER } from './bereiche';
import { SchliessKnopf } from '../ui/SchliessKnopf';
import { Leerzustand } from '../ui/Leerzustand';
import { TabPanel } from './TabPanel';
import { useDialogFokus } from './useDialogFokus';
import { usePaneSteuerung } from './usePaneLayout';

// ─── Arbeitsleiste: die offenen Reiter, sichtbar (W2·24 §5a, Wunsch David) ───
//
// «analog zum browser die offenen tabs oben anstatt mit dem drei linien drop
// down» (David 6.9.2026). Ersetzt `ReiterUebersicht` (☰-Trigger + Flyout) —
// die Datei ist mit diesem Schritt gelöscht, ihr Flyout-Inhalt (`TabPanel`)
// lebt hier im Überlauf-Blatt weiter.
//
// ZWEITE ZEILE, ZWEITE BEDEUTUNG (§5a Ziff. 1): die Titelblatt-Zeile darüber
// führt BEREICHE (unterstrichener Text, keine Fläche, kein ✕), diese Leiste
// führt DOKUMENTE (Reiter mit Registerfarben-Strich und ✕). Damit man die
// beiden nicht verwechselt, sind sie optisch verschieden gebaut.
//
// KEINE neue Reiter-Mechanik (§3/§5): Liste, Reihenfolge, Umsortieren,
// Schliessen und die Persistenz kommen unverändert aus `lib/tabs.ts`
// (localStorage `lexmetrik-tabs`, Pfad INKLUSIVE `#art-…`-Anker — die
// Lesestellung überlebt den Neustart also schon heute, §5a Ziff. 6).

/** Wie viele Reiter höchstens NEBENEINANDER stehen; der Rest zieht in das
 *  «+N»-Blatt. Zahl aus §5a Ziff. 5 («Überlauf ab ~8 Reitern»). Der aktive
 *  Reiter ist von der Kappung ausgenommen — er ist immer im Bild. */
const SICHTBAR_MAX = 8;
/** Ab dieser Zahl bietet die schmale Ansicht zusätzlich den «N offen»-Knopf
 *  an (§5a Ziff. 8). */
const MOBIL_BLATT_AB = 3;
/** Eigener MIME-Typ für das Ziehen eines Reiters in ein Pane (§5a Ziff. 4).
 *  `dragover` darf die Nutzlast nicht lesen, nur die Typen — darum ein eigener
 *  Typ statt einer Inhaltsprüfung auf `text/plain`. */
export const REITER_MIME = 'application/x-lexmetrik-reiter';

/** ── Gerichts-Kurzformen (F6) ───────────────────────────────────────────────
 *  Die Zitierung eines Entscheids ist «Gericht + Geschäftsnummer». GEMESSEN
 *  6.9.2026: «Obergericht AG HOR.2024.19» lief in `max-w-[13rem]` auf und wurde
 *  als «Obergericht AG HOR.2024.1…» abgeschnitten — die Nummer ist aber das
 *  EINZIGE, was den Entscheid identifiziert (§8: lieber das Gericht kürzen als
 *  die Nummer verstümmeln).
 *  Die Tabelle ist BEWUSST geschlossen und trägt nur die im schweizerischen
 *  Gebrauch etablierten Kürzel (BGer, OGer, KGer …). Ein unbekanntes Gericht
 *  wird NICHT geraten (§7), sondern bleibt ausgeschrieben — dann trägt es die
 *  Kürzung, nicht die Nummer. */
const GERICHT_KURZ: Record<string, string> = {
  Bundesgericht: 'BGer',
  Bundesverwaltungsgericht: 'BVGer',
  Bundesstrafgericht: 'BStGer',
  Bundespatentgericht: 'BPatGer',
  Obergericht: 'OGer',
  Kantonsgericht: 'KGer',
  Verwaltungsgericht: 'VGer',
  Appellationsgericht: 'AppGer',
  Handelsgericht: 'HGer',
  Bezirksgericht: 'BezGer',
  Zivilgericht: 'ZGer',
  Strafgericht: 'StGer',
  Sozialversicherungsgericht: 'SVGer',
  Versicherungsgericht: 'VersGer',
  Arbeitsgericht: 'ArbGer',
  Mietgericht: 'MGer',
  Kassationsgericht: 'KassGer',
  Steuerrekursgericht: 'StRG',
  Baurekursgericht: 'BRG',
};

/** Zerlegung einer Zitierung in «Kopf» (kürzbar) und «Kern» (nie kürzbar).
 *  Kern = alles ab dem ersten Wort mit einer Ziffer, also die Geschäftsnummer
 *  bzw. bei einer BGE-Zitierung die Fundstelle («BGE» + «152 V 52»). Das
 *  angehängte Urteilsdatum («… vom 14.01.2026») fällt weg — es identifiziert
 *  nichts, was die Nummer nicht schon identifiziert, und der `title` des
 *  Reiters trägt die vollständige Zitierung weiter. Ohne Ziffern-Wort gibt es
 *  keinen Kern; dann kürzt wie bisher der ganze Text. */
function zerlege(zitierung: string): { kopf: string; kern: string } {
  const ohneDatum = zitierung.replace(/\s+vom\s+\d{1,2}\.\d{1,2}\.\d{2,4}\s*$/, '');
  const worte = ohneDatum.split(/\s+/).filter(Boolean);
  const i = worte.findIndex((w) => /\d/.test(w));
  if (i <= 0) return { kopf: '', kern: ohneDatum };
  const kopf = worte.slice(0, i).map((w) => GERICHT_KURZ[w] ?? w).join(' ');
  return { kopf, kern: worte.slice(i).join(' ') };
}

/** Kanonische Kurzform eines Reiters (§5a Ziff. 2): «Art. 336c OR», «BGE 152
 *  V 52», «Fristenrechner».
 *
 *  DETERMINISTISCH AUS DER ADRESSE (F5): der Artikel kommt aus `t.wahl` — dem
 *  Anker, den die ADRESSE trug —, NICHT aus `t.path`, in den der Scroll-Spy des
 *  Lesers laufend die Lesestellung schreibt. GEMESSEN 6.9.2026 (Preview 4335):
 *  mit `t.path` hiess derselbe Reiter auf derselben Adresse `/gesetze/bund/ZGB`
 *  einmal «ZGB» (kalt) und nach 1500 px Scrollen «Art. 3 ZGB» — eine
 *  Beschriftung, die sich unter dem Zeiger ändert, ist keine Kurzform.
 *  Die Lesestellung bleibt sichtbar: im `title` des Reiters und in der
 *  Reiter-Liste (`TabPanel`), und sie überlebt den Neustart wie bisher. */
function kurzform(t: TabEintrag, m: VerlaufManifeste): { kopf: string; kern: string } {
  // R3-F7 (Prüfbefund 6.9.2026): Übersichts- und Startseiten-Routen tragen ihre
  // Kurzform aus `lib/tabs` («Gesetze», «Sammlung») statt des SEO-Titels, den
  // `labelAusMeta` liefert («Schweizer Recht an einem Ort: …»). Erst seit D7
  // können solche Routen überhaupt Reiter sein — die Kurzform ist die
  // Voraussetzung dafür, nicht eine Verzierung.
  const fest = reiterKurzform(t.path);
  if (fest) return { kopf: '', kern: fest };
  const kat = reiterKategorie(t.path);
  const kuerzel = kat === 'gesetze' ? erlassVonPfad(t.path, m)?.kuerzel : null;
  if (kuerzel) {
    // Gesetze: EIN kurzer Block («Art. 336c OR») — hier gibt es nichts, was
    // gegen die Kürzung geschützt werden müsste, der ganze Text ist die Marke.
    const art = t.wahl ? artikelLabelVonPfad(t.wahl) : null;
    return { kopf: '', kern: art ? `${art} ${kuerzel}` : kuerzel };
  }
  const voll = verlaufLabel(t.path, m);
  return kat === 'rechtsprechung' ? zerlege(voll) : { kopf: '', kern: voll };
}

/** Einzeiler für Suchfeld, Accessible Names und Titel. */
function kurzformText(t: TabEintrag, m: VerlaufManifeste): string {
  const { kopf, kern } = kurzform(t, m);
  return kopf ? `${kopf} ${kern}` : kern;
}

export function Reiterleiste({ paneSchluessel = [] }: {
  /** Reiter-Schlüssel der offenen Panes in Fenster-Ordnung (0 = links/Haupt).
   *  Daraus zeichnet die Leiste die Aktiv-Marken «links»/«rechts» (§5a Ziff. 4). */
  paneSchluessel?: string[];
}) {
  const tabs = useTabs();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  const [blattOffen, setBlattOffen] = useState(false);
  const [suche, setSuche] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const blattRef = useRef<HTMLDivElement>(null);
  const leisteRef = useRef<HTMLDivElement>(null);
  const gezogen = useRef<string | null>(null);
  /** Gezogener Reiter als STATE (nicht nur Ref): der Reiter unter dem Zeiger
   *  soll sich während des Zugs sichtbar zurücknehmen — dafür braucht es ein
   *  Re-Render. Die Ref bleibt daneben, weil `dragover`/`drop` sie SYNCHRON
   *  lesen müssen (ein State-Wert wäre im selben Ereignis noch der alte). */
  const [zieht, setZieht] = useState<string | null>(null);
  /** Wo die Einfügemarke steht: an welchem Reiter, und auf welcher Seite.
   *  Die Seite kommt aus dem Zeiger-X über der Ziel-Hälfte (D15). */
  const [ueber, setUeber] = useState<{ path: string; davor: boolean } | null>(null);

  // Reader-Labels (Gesetz/Entscheid) aus den ohnehin lazy ladbaren Manifesten —
  // Muster und Bedingung wörtlich aus der abgelösten `ReiterUebersicht`.
  useEffect(() => {
    const brauchtG = tabs.some((t) => reiterKategorie(t.path) === 'gesetze');
    const brauchtE = tabs.some((t) => reiterKategorie(t.path) === 'rechtsprechung');
    if (!brauchtG && !brauchtE) return;
    let lebt = true;
    void (async () => {
      const [g, ent] = await Promise.all([
        brauchtG ? import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()).catch(() => null) : Promise.resolve(null),
        brauchtE ? import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()).catch(() => null) : Promise.resolve(null),
      ]);
      if (lebt) setManifeste((alt) => ({ gesetze: g ?? alt.gesetze ?? null, entscheide: ent ?? alt.entscheide ?? null }));
    })();
    return () => { lebt = false; };
  }, [tabs]);

  const aktivSchluessel = tabSchluessel(pathname + search);

  // ── D16 (David 6.9.2026) · DIE LEISTE ZEIGT DEN SPEICHER, SONST NICHTS ────
  //
  // Hier stand bis zum Fixer 1c eine ZWEITE Ordnung: die Reiter wurden nach
  // `KAT_ORDER` gebündelt und innerhalb «gesetze» nach `HERKUNFT_ORDER` —
  // dieselbe Gruppierung wie im Überlauf-Blatt (`TabPanel`). Der Gedanke war
  // «eine App, eine Ordnung». Gemessen war die Folge das Gegenteil:
  // `lib/tabs.ordneTabsUm` verschiebt den FLACHEN Speicher, und jede
  // Verschiebung über eine Kategoriegrenze sammelte das Bucketing sofort wieder
  // ein. David 6.9.2026: «es geht nur wenn nur gesetze offen sind — bug»
  // (nachgestellt über acht Kombinationen, `e2e/w224-reiter-umordnen-d16`).
  //
  // ENTSCHEID (analog Browser): man ordnet, was man SIEHT. Die Arbeitsleiste
  // zeigt darum die reine Speicherreihenfolge. Die Gruppierung nach Art bleibt
  // dort, wo sie eine LISTE ordnet und niemand zieht — im Überlauf-Blatt.
  // Dass die beiden damit verschieden sortieren, ist kein Widerspruch, sondern
  // die Aufgabenteilung: die Leiste ist eine Arbeitsfläche, das Blatt ein
  // Verzeichnis.
  const ordnung = tabs;

  // ── Überlauf (§5a Ziff. 5) · NIE STILLES SCHLIESSEN ────────────────────────
  // Gekappt wird nur die SICHTBARKEIT, nie die Liste. Der aktive Reiter ist von
  // der Kappung ausgenommen: liegt er hinter der Grenze, rückt er auf den
  // letzten sichtbaren Platz — «der aktive Reiter ist im Bild» gilt auch, wenn
  // zwölf offen sind.
  const { sichtbar, versteckt } = useMemo(() => {
    if (ordnung.length <= SICHTBAR_MAX) return { sichtbar: ordnung, versteckt: [] as TabEintrag[] };
    const vorn = ordnung.slice(0, SICHTBAR_MAX);
    const hinten = ordnung.slice(SICHTBAR_MAX);
    const aktivHinten = hinten.findIndex((t) => tabSchluessel(t.path) === aktivSchluessel);
    if (aktivHinten === -1) return { sichtbar: vorn, versteckt: hinten };
    const getauscht = [...vorn.slice(0, SICHTBAR_MAX - 1), hinten[aktivHinten]];
    const rest = [vorn[SICHTBAR_MAX - 1], ...hinten.filter((_, i) => i !== aktivHinten)];
    return { sichtbar: getauscht, versteckt: rest };
  }, [ordnung, aktivSchluessel]);

  const schliessen = (path: string) => {
    const teil = tabSchluessel(path);
    if (aktivSchluessel === teil) {
      const idx = ordnung.findIndex((t) => tabSchluessel(t.path) === teil);
      const nachbar = ordnung[idx - 1] ?? ordnung[idx + 1];
      schliesseTab(path);
      navigate(nachbar ? nachbar.path : '/');
    } else schliesseTab(path);
  };

  // ── Tastatur (§5a Ziff. 7) ────────────────────────────────────────────────
  // Alt+1…9 springt auf den n-ten Reiter der sichtbaren Ordnung. Zum SCHLIESSEN
  // ist es Alt+W und NICHT Ctrl/⌘+W: der Browser fängt Ctrl/⌘+W selbst ab und
  // schliesst sein eigenes Fenster — eine Belegung, die man nicht bekommen
  // kann, wäre eine Zusage, die nicht gilt (§8). §5a Ziff. 7 sieht genau diesen
  // Rückfall vor. Kein Eingriff, solange der Fokus in einem Eingabefeld steht.
  //
  // ── D15 · UMORDNEN OHNE MAUS: Alt+Shift+←/→ ───────────────────────────────
  // Ziehen ist eine Zeigergeste; sie allein zu bauen hiesse, das Umordnen für
  // Tastatur und Screenreader gar nicht anzubieten (WCAG 2.1.1). Alt+Shift ist
  // frei — Alt+Ziffer und Alt+W belegen die Leiste schon, Alt+←/→ OHNE Shift
  // gehört dem Browser (Verlauf zurück/vorwärts). KEIN UMLAUF am Rand: ein
  // Reiter, der am linken Ende gedrückt plötzlich rechts steht, ist verloren
  // statt verschoben.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const a = document.activeElement as HTMLElement | null;
      if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const idx = ordnung.findIndex((t) => tabSchluessel(t.path) === aktivSchluessel);
        if (idx === -1) return;
        const links = e.key === 'ArrowLeft';
        const ziel = ordnung[idx + (links ? -1 : 1)];
        if (!ziel) { e.preventDefault(); return; }
        e.preventDefault();
        ordneTabsUm(ordnung[idx].path, ziel.path, links);
        return;
      }
      if (e.shiftKey) return;
      if (/^[1-9]$/.test(e.key)) {
        const ziel = ordnung[Number(e.key) - 1];
        if (!ziel) return;
        e.preventDefault();
        navigate(ziel.path);
        return;
      }
      if (e.key.toLowerCase() === 'w') {
        const aktiv = ordnung.find((t) => tabSchluessel(t.path) === aktivSchluessel);
        if (!aktiv) return;
        e.preventDefault();
        schliessen(aktiv.path);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Aktiven Reiter ins Bild scrollen (§5a Ziff. 8, mobile Leiste).
  //
  // BEWUSST NICHT `scrollIntoView`: GEMESSEN 6.9.2026 (Preview, Chromium,
  // `/gesetze/bund/GEBV_HREG`) setzte der Aufruf den Startpunkt der
  // Tab-Reihenfolge des Dokuments auf den Reiter — der erste Tab-Druck landete
  // danach auf dem Reiter statt auf dem Skip-Link, und `e2e/a11y.e2e.ts` (E4)
  // wurde rot. Der Skip-Link ist die erste Zusage der Tastaturbedienung; ein
  // Komfort-Scroll darf sie nicht kosten. Hier wird darum NUR die waagrechte
  // Scroll-Position des Streifens selbst gesetzt: kein Dokument-Scroll, kein
  // Eingriff in die Fokus-Reihenfolge, gleiche Wirkung.
  useEffect(() => {
    const streifen = leisteRef.current?.querySelector<HTMLElement>('[data-reiter-streifen]');
    const el = streifen?.querySelector<HTMLElement>('[data-reiter-aktiv="true"]');
    if (!streifen || !el) return;
    const links = el.offsetLeft;
    const rechts = links + el.offsetWidth;
    if (links < streifen.scrollLeft) streifen.scrollLeft = links;
    else if (rechts > streifen.scrollLeft + streifen.clientWidth) {
      streifen.scrollLeft = rechts - streifen.clientWidth;
    }
  }, [aktivSchluessel, sichtbar.length]);

  // Blatt schliessen bei Klick ausserhalb (Trigger + portaliertes Blatt).
  useEffect(() => {
    if (!blattOffen) return;
    const zu = (e: MouseEvent) => {
      const ziel = e.target as Node;
      if (triggerRef.current?.contains(ziel) || blattRef.current?.contains(ziel)) return;
      setBlattOffen(false);
    };
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [blattOffen]);
  useDialogFokus(blattOffen, blattRef, () => setBlattOffen(false));

  // ── R10-BEFUND (Nullprobe 6.9.2026) · DIE HÖHE STEHT VOR DEN REITERN ──────
  //
  // Hier stand `if (tabs.length < 1) return null` — «keine Reiter, keine
  // Zeile». GEMESSEN am Stand `0093fad28` (Preview, `/rechner/tagerechner`,
  // ganzer Spec-Lauf `ics-export-z1` A9): der Prerender kennt keinen Speicher,
  // lieferte also KEINE Leiste; unmittelbar nach der Hydration las `useTabs`
  // den `localStorage`, die Leiste erschien, und `main#inhalt` rutschte von
  // 132 px auf 166 px — 34 px = genau `--app-reiter-h`, CLS 0.025 auf einer
  // Seite, die sonst 0 misst (§15).
  //
  // WURZEL-FIX: die Zeile ist ab jetzt IMMER da und immer gleich hoch. Ohne
  // offene Reiter ist sie ein ruhiger, leerer Streifen — kein Text, kein
  // Leerzustands-Satz («keine Reiter offen» wäre eine Auskunft über nichts und
  // stünde auf jeder Kaltstart-Seite). Kein `<nav>` in diesem Fall: eine
  // Navigations-Landmark ohne ein einziges Ziel ist für den Screenreader ein
  // leeres Versprechen. Beides — Platzhalter und Leiste — trägt dieselbe
  // Geometrie (`sticky top-[--app-krone-h]`, `h-[--app-reiter-h]`, dieselbe
  // Unterlinie), darum verschiebt der Wechsel nichts.
  if (tabs.length < 1) {
    return (
      <div aria-hidden
        className="print:hidden shrink-0 sticky top-[var(--app-krone-h)] z-leiste h-[var(--app-reiter-h)] border-b border-rule-soft bg-paper" />
    );
  }

  const gefiltert = suche.trim()
    ? tabs.filter((t) => `${kurzformText(t, manifeste)} ${verlaufLabel(t.path, manifeste)} ${t.path}`
        .toLowerCase().includes(suche.trim().toLowerCase()))
    : tabs;

  const ueberlaufZahl = versteckt.length;
  const blattTitel = ueberlaufZahl > 0 ? `+${ueberlaufZahl}` : `${tabs.length} offen`;

  const reiter = (t: TabEintrag, i: number) => {
    const schluessel = tabSchluessel(t.path);
    const aktiv = schluessel === aktivSchluessel;
    const { kopf, kern } = kurzform(t, manifeste);
    const name = kopf ? `${kopf} ${kern}` : kern;
    const voll = verlaufLabel(t.path, manifeste);
    // Die LESESTELLUNG steht seit dem R2-Nachzug (F5) nicht mehr in der
    // Beschriftung, sondern hier und in der Reiter-Liste — verloren ist sie
    // damit nicht, sie wackelt nur nicht mehr unter dem Zeiger.
    const gelesen = reiterKategorie(t.path) === 'gesetze' ? artikelLabelVonPfad(t.path) : null;
    const titel = gelesen && gelesen !== kopf ? `${voll} — gelesen bis ${gelesen}` : voll;
    const reg = registerVonPfad(t.path);
    // F10 · EINE REGEL FÜR BEIDE GRIFFE (✕ und ⧉): der aktive Reiter zeigt sie
    // immer, inaktive bei Hover ODER Tastatur-Fokus irgendwo im Reiter. Vorher
    // war das ✕ dauernd sichtbar und das ⧉ nur bei Hover — zwei Regeln für
    // dieselbe Zeile, und die Tastatur erreichte das ⧉ nur unsichtbar.
    const griffSicht = aktiv
      ? ''
      : 'opacity-0 transition-opacity group-hover/reiter:opacity-100 group-focus-within/reiter:opacity-100';
    // Aktiv-Marken der Panes: welcher Reiter steht in welchem Fenster (§5a
    // Ziff. 4). Bei einem einzigen Pane trägt der aktive Reiter keine Marke —
    // «links» ohne ein «rechts» sagt nichts.
    const paneIdx = paneSchluessel.length > 1 ? paneSchluessel.indexOf(schluessel) : -1;
    const paneWort = paneIdx === 0 ? 'links' : paneIdx > 0 ? 'rechts' : null;
    return (
      <div key={schluessel}
        data-reiter-aktiv={aktiv}
        // Test-Anker: die Reiter-IDENTITÄT im DOM (`lib/tabs.tabSchluessel`).
        // Die Beschriftung taugt dafür nicht — sie hängt an lazy geladenen
        // Manifesten und ist genau das, was hier NICHT gemessen werden soll.
        data-reiter-schluessel={schluessel}
        draggable
        onDragStart={(ev) => {
          gezogen.current = t.path;
          setZieht(t.path);
          ev.dataTransfer.setData('text/plain', t.path);
          ev.dataTransfer.setData(REITER_MIME, t.path);
          ev.dataTransfer.effectAllowed = 'copyMove';
          // GHOST: der Reiter selbst hängt am Zeiger, gefasst dort, wo man ihn
          // angepackt hat. Chromium nimmt zwar von sich aus das gezogene
          // Element — aber erst NACH dem Handler und ohne Griffpunkt; ein
          // explizites `setDragImage` mit dem Zeiger-Offset ist der Unterschied
          // zwischen «etwas fliegt» und «ich halte diesen Reiter» (D15: die
          // Funktion war da, nur nicht als Funktion erkennbar).
          const kasten = ev.currentTarget.getBoundingClientRect();
          try { ev.dataTransfer.setDragImage(ev.currentTarget, ev.clientX - kasten.left, ev.clientY - kasten.top); }
          catch { /* ältere Engines ohne setDragImage — der Default-Ghost tut es auch */ }
        }}
        onDragOver={(ev) => {
          const von = gezogen.current;
          if (!von || von === t.path) return;
          ev.preventDefault();
          // SEITE AUS DEM ZEIGER-X (D15, «analog browser»): linke Hälfte des
          // Ziels = davor, rechte Hälfte = dahinter. Ohne diese Unterscheidung
          // liesse sich ein Reiter nie ans ENDE der Leiste ziehen — hinter dem
          // letzten gibt es kein weiteres Ziel.
          const kasten = ev.currentTarget.getBoundingClientRect();
          const davor = ev.clientX < kasten.left + kasten.width / 2;
          if (ueber?.path !== t.path || ueber.davor !== davor) setUeber({ path: t.path, davor });
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          const von = gezogen.current ?? ev.dataTransfer.getData(REITER_MIME);
          if (von && von !== t.path) {
            const kasten = ev.currentTarget.getBoundingClientRect();
            ordneTabsUm(von, t.path, ev.clientX < kasten.left + kasten.width / 2);
          }
          gezogen.current = null; setZieht(null); setUeber(null);
        }}
        onDragEnd={() => { gezogen.current = null; setZieht(null); setUeber(null); }}
        title={titel}
        // F9 · DER AKTIVE REITER IST EINE FLÄCHE, KEIN 4-EINHEITEN-UNTERSCHIED.
        // GEMESSEN 6.9.2026: aktiv `paper-raised` (255) gegen inaktiv `paper`
        // (251) — der Unterschied trug allein der 2-px-Strich. Jetzt trägt der
        // aktive Reiter die REGISTERFARBE seiner Domäne als leichte Tönung
        // (Papier bleibt Papier, die Farbe sagt zugleich, WELCHES Register).
        // `cursor-grab` / `active:cursor-grabbing` an der HÜLLE: die Affordanz
        // war der ganze D15-Befund — das Ziehen funktionierte, sah aber nach
        // nichts aus. Der Zeiger sagt jetzt schon vor dem Anfassen, dass hier
        // etwas zu greifen ist; die Griffe ✕/⧉ setzen ihren eigenen Zeiger.
        // Der gezogene Reiter nimmt sich zurück (`opacity-40`) — was am Zeiger
        // hängt, soll nicht zugleich an seinem alten Platz stehen.
        className={`group/reiter relative flex shrink-0 cursor-grab items-center border-r border-rule-soft active:cursor-grabbing ${
          zieht === t.path ? 'opacity-40' : ''
        } ${aktiv ? (reg ? REG_TON[reg] : 'bg-paper-raised') : ''}`}>
        {/* EINFÜGEMARKE (D15): 2 px in der Registerfarbe des GEZOGENEN Reiters,
            über die volle Reiterhöhe, auf der Seite, auf der er landen wird.
            Sie ersetzt den früheren, immer linken `border-l-2` — der konnte
            nicht sagen, ob der Reiter davor oder dahinter einrastet, und ans
            Ende der Leiste kam man mit ihm gar nicht. */}
        {ueber?.path === t.path && (
          <span aria-hidden data-reiter-marke={ueber.davor ? 'davor' : 'dahinter'}
            className={`pointer-events-none absolute inset-y-0 w-0.5 ${ueber.davor ? '-left-px' : '-right-px'} ${
              zieht && registerVonPfad(zieht) ? REG_FLAECHE[registerVonPfad(zieht)!] : 'bg-ink-900'}`} />
        )}
        {/* Registerfarben-Strich — die einzige Farbe des Reiters (§5). Inaktiv
            Tinte auf 30 % (kein blasses Register-Echo, das mit dem aktiven
            verwechselbar wäre); beim Hover zeigt er die Registerfarbe des
            Ziels, damit die Domäne auch im Ruhezustand erreichbar bleibt. */}
        <span aria-hidden className={`absolute inset-x-0 bottom-0 h-0.5 ${
          aktiv
            ? (reg ? REG_FLAECHE[reg] : 'bg-ink-900')
            : `bg-ink-400 opacity-30 ${reg ? REG_HOVER_FLAECHE_REITER[reg] : ''} group-hover/reiter:opacity-70`}`} />
        <button type="button" aria-current={aktiv ? 'page' : undefined}
          onClick={() => navigate(t.path)}
          onAuxClick={(ev) => {
            // Mittelklick schliesst — das Browser-Idiom, das David meint.
            if (ev.button === 1) { ev.preventDefault(); schliessen(t.path); }
          }}
          className={`flex min-w-0 items-baseline gap-1 py-1.5 pl-2.5 pr-1 text-body-s ${
            aktiv ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'}`}>
          <span className="sr-only">{`Reiter ${i + 1}: `}</span>
          {/* F6 · DIE GESCHÄFTSNUMMER WIRD NIE GEKÜRZT. Gekürzt wird der Kopf
              (das Gericht, ohnehin schon abgekürzt); der Kern trägt die Nummer
              und steht `shrink-0`. Der Deckel sitzt darum AM KOPF, nicht am
              Knopf: läge er am Knopf, ragte ein langer Kern als `shrink-0`-Kind
              über dessen Kasten und legte sich über die ⧉/✕-Griffe daneben.
              Ohne Kopf kürzt der Kern selbst — dann ist er der ganze Name
              (Gesetz, Rechner, Vorlage) und nichts daran ist geschützt. */}
          {kopf && <span className="truncate max-w-[9rem]">{kopf}</span>}
          <span className={kopf ? 'shrink-0' : 'truncate max-w-[15rem]'}>{kern}</span>
          {paneWort && <span className="sr-only">{` (Fenster ${paneWort})`}</span>}
        </button>
        {/* Fenster-Marke: zeigt, welcher Reiter links bzw. rechts steht. */}
        {paneWort && (
          <span aria-hidden title={`Fenster ${paneWort}`}
            className="shrink-0 border border-rule-soft px-1 text-micro leading-tight text-ink-500">
            {paneWort === 'links' ? '◧' : '◨'}
          </span>
        )}
        {/* «daneben öffnen» — der Klick-Weg zu dem, was das Ziehen ins zweite
            Fenster tut (§5a Ziff. 4); nur ab lg und mit freier Kapazität. */}
        {kannOeffnen && !istOffen(t.path) && (
          <button type="button" onClick={() => oeffneDaneben(t.path)}
            aria-label={`«${name}» daneben öffnen`} title="Daneben öffnen"
            className={`hidden lg:inline-flex h-6 w-5 shrink-0 items-center justify-center text-ink-400 hover:text-ink-900 ${griffSicht}`}>
            <span aria-hidden className="lc-griff-glyph">⧉</span>
          </button>
        )}
        {/* A3-1: EIN Schliess-✕ der App; der Klick wirft ein offenes Dokument
            samt Leseposition weg — derselbe deklarierte destruktive Ton wie in
            der Reiter-Liste und der Pane-Titelleiste.
            `komfort={false}`: die 44-px-Trefferfläche des Bausteins läge in
            einer 28-px-Reiterzeile über dem ⧉-Nachbarn UND über dem nächsten
            Reiter — dieselbe begründete Ausnahme wie dort; die AA-Untergrenze
            (24 px, WCAG 2.5.8) hält die Grundklasse. */}
        <SchliessKnopf name={`Reiter «${name}» schliessen`} ton="destruktiv" komfort={false}
          onClick={() => schliessen(t.path)} klasse={`h-6 w-6 mr-1 shrink-0 ${griffSicht}`} />
      </div>
    );
  };

  return (
    <nav aria-label="Offene Reiter" ref={leisteRef}
      // W2·24-R4: die Arbeitsleiste KLEBT jetzt — unter der Titelblatt-Zeile
      // (`--app-krone-h`) und mit ihrer eigenen, festen Höhe (`--app-reiter-h`).
      // Beide Zahlen stehen in `src/index.css`; dieselbe Summe (`--app-kopf-h`)
      // liest `pages/gesetz-leser/v3/leserGeometrie.ts` für den Kopf-Anschlag
      // und `--nt-stick`. R2 hatte die Leiste bewusst im Fluss gelassen, weil
      // diese eine Quelle fehlte (R2-Protokoll §2) — ohne sie landete jeder
      // `#art-…`-Sprung um die Leistenhöhe zu hoch.
      className="print:hidden shrink-0 sticky top-[var(--app-krone-h)] z-leiste h-[var(--app-reiter-h)] border-b border-rule-soft bg-paper">
      <div className="flex items-stretch px-4 sm:px-6">
        <div data-reiter-streifen className="relative flex min-w-0 flex-1 items-stretch overflow-x-auto lc-reiter-scroll border-l border-rule-soft">
          {sichtbar.map(reiter)}
        </div>
        {/* «+N» bzw. «N offen» — EIN Blatt für Überlauf (Desktop) und die
            schmale Ansicht (§5a Ziff. 5 + 8). Inhalt ist die gruppierte Liste
            `TabPanel`, also genau das, was das abgelöste ☰-Flyout zeigte,
            zusätzlich mit Suchfeld. */}
        {(ueberlaufZahl > 0 || tabs.length >= MOBIL_BLATT_AB) && (
          <button ref={triggerRef} type="button"
            aria-haspopup="dialog" aria-expanded={blattOffen}
            aria-label={`Alle ${tabs.length} offenen Reiter`}
            title="Alle offenen Reiter"
            onClick={() => setBlattOffen((v) => !v)}
            className={`shrink-0 self-center ml-2 border border-rule-soft px-2 py-1 text-body-s text-ink-600 hover:text-ink-900 ${
              ueberlaufZahl > 0 ? '' : 'md:hidden'}`}>
            <span className="num">{blattTitel}</span>
          </button>
        )}
      </div>

      {blattOffen && createPortal(
        <div className="fixed inset-0 z-overlay">
          <div className="lc-scrim-voll absolute inset-0" onClick={() => setBlattOffen(false)} aria-hidden />
          <div ref={blattRef} tabIndex={-1} role="dialog" aria-label="Alle geöffneten Reiter"
            className="lc-schwebeflaeche absolute right-2 top-2 max-h-[80vh] w-[22rem] max-w-[calc(100vw-1rem)] overflow-y-auto p-2 focus:outline-none">
            <label className="mb-2 block">
              <span className="sr-only">Offene Reiter durchsuchen</span>
              <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
                placeholder="Reiter suchen" className="lc-input h-9 w-full py-0 text-body-s" />
            </label>
            <TabPanel
              tabs={gefiltert}
              manifeste={manifeste}
              aktivSchluessel={aktivSchluessel}
              onNavigate={(p) => { navigate(p); setBlattOffen(false); }}
              onSchliessen={schliessen}
              onDaneben={kannOeffnen ? (p) => { oeffneDaneben(p); setBlattOffen(false); } : undefined}
              paneOffen={istOffen}
            />
            {gefiltert.length === 0 && (
              <div className="px-2 py-3">
                {/* D-7: EIN Leerzustands-Baustein für «hier ist nichts» — die
                    Suche filtert einen BESTAND, der Weiterweg ist das Leeren
                    des Feldes. */}
                <Leerzustand art="filter" text={`Kein offener Reiter passt zu «${suche.trim()}».`}
                  weiterweg={{ text: 'Filter leeren', onKlick: () => setSuche('') }} />
              </div>
            )}
            {tabs.length > 1 && (
              <div className="mt-1 border-t border-rule-soft pt-1">
                <button type="button"
                  onClick={() => { leereTabs(); navigate('/'); setBlattOffen(false); }}
                  className="lc-btn-outline lc-btn-sm w-full">
                  Alle schliessen
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </nav>
  );
}
