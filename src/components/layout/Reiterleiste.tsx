import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import { schliesseTab, leereTabs, ordneTabsUm, tabSchluessel, type TabEintrag } from '../../lib/tabs';
import { erlassVonPfad, verlaufLabel, type VerlaufManifeste } from '../../lib/verlaufLabel';
import { reiterKategorie, herkunftVon, artikelLabelVonPfad, KAT_ORDER, HERKUNFT_ORDER } from '../../lib/tabGruppen';
import { registerVonPfad, REG_FLAECHE } from './bereiche';
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

/** Kanonische Kurzform eines Reiters (§5a Ziff. 2): «Art. 336c OR», «BGE 152
 *  V 52», «Fristenrechner». Deterministisch aus Pfad + Manifest. */
function kurzform(t: TabEintrag, m: VerlaufManifeste): string {
  const kuerzel = reiterKategorie(t.path) === 'gesetze' ? erlassVonPfad(t.path, m)?.kuerzel : null;
  if (!kuerzel) return verlaufLabel(t.path, m);
  const art = artikelLabelVonPfad(t.path);
  return art ? `${art} ${kuerzel}` : kuerzel;
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
  const [ueber, setUeber] = useState<string | null>(null);

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

  // Visuelle Reihenfolge — EXAKT die des `TabPanel` im Überlauf-Blatt (nach
  // Kategorie, innerhalb «gesetze» nach Herkunft). Sonst zeigte dieselbe App
  // dieselben Reiter in zwei Ordnungen, und der Nachbar beim Schliessen wäre
  // ein anderer als der sichtbare.
  const ordnung = useMemo((): TabEintrag[] => {
    const out: TabEintrag[] = [];
    for (const kat of KAT_ORDER) {
      const inKat = tabs.filter((t) => reiterKategorie(t.path) === kat);
      if (kat === 'gesetze') {
        for (const h of HERKUNFT_ORDER) out.push(...inKat.filter((t) => herkunftVon(t.path, manifeste) === h));
        out.push(...inKat.filter((t) => herkunftVon(t.path, manifeste) === null));
      } else out.push(...inKat);
    }
    return out;
  }, [tabs, manifeste]);

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const a = document.activeElement as HTMLElement | null;
      if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
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

  // Kein offener Reiter → keine Leiste (die Zeile verschwindet ganz, statt als
  // leeres Band zu stehen).
  if (tabs.length < 1) return null;

  const gefiltert = suche.trim()
    ? tabs.filter((t) => `${kurzform(t, manifeste)} ${verlaufLabel(t.path, manifeste)} ${t.path}`
        .toLowerCase().includes(suche.trim().toLowerCase()))
    : tabs;

  const ueberlaufZahl = versteckt.length;
  const blattTitel = ueberlaufZahl > 0 ? `+${ueberlaufZahl}` : `${tabs.length} offen`;

  const reiter = (t: TabEintrag, i: number) => {
    const schluessel = tabSchluessel(t.path);
    const aktiv = schluessel === aktivSchluessel;
    const name = kurzform(t, manifeste);
    const voll = verlaufLabel(t.path, manifeste);
    const reg = registerVonPfad(t.path);
    // Aktiv-Marken der Panes: welcher Reiter steht in welchem Fenster (§5a
    // Ziff. 4). Bei einem einzigen Pane trägt der aktive Reiter keine Marke —
    // «links» ohne ein «rechts» sagt nichts.
    const paneIdx = paneSchluessel.length > 1 ? paneSchluessel.indexOf(schluessel) : -1;
    const paneWort = paneIdx === 0 ? 'links' : paneIdx > 0 ? 'rechts' : null;
    return (
      <div key={schluessel}
        data-reiter-aktiv={aktiv}
        draggable
        onDragStart={(ev) => {
          gezogen.current = t.path;
          ev.dataTransfer.setData('text/plain', t.path);
          ev.dataTransfer.setData(REITER_MIME, t.path);
          ev.dataTransfer.effectAllowed = 'copyMove';
        }}
        onDragOver={(ev) => {
          const von = gezogen.current;
          if (von && von !== t.path) { ev.preventDefault(); if (ueber !== t.path) setUeber(t.path); }
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          const von = gezogen.current ?? ev.dataTransfer.getData(REITER_MIME);
          if (von && von !== t.path) ordneTabsUm(von, t.path);
          gezogen.current = null; setUeber(null);
        }}
        onDragEnd={() => { gezogen.current = null; setUeber(null); }}
        title={voll}
        className={`group/reiter relative flex shrink-0 items-center border-r border-rule-soft ${
          ueber === t.path ? 'border-l-2 border-l-rule' : ''
        } ${aktiv ? 'bg-paper-raised' : ''}`}>
        {/* Registerfarben-Strich — die einzige Farbe des Reiters (§5). Inaktiv
            blass, damit die Domäne auch im Ruhezustand ablesbar bleibt. */}
        <span aria-hidden className={`absolute inset-x-0 bottom-0 h-0.5 ${
          reg ? REG_FLAECHE[reg] : 'bg-ink-400'} ${aktiv ? '' : 'opacity-30 group-hover/reiter:opacity-60'}`} />
        <button type="button" aria-current={aktiv ? 'page' : undefined}
          onClick={() => navigate(t.path)}
          onAuxClick={(ev) => {
            // Mittelklick schliesst — das Browser-Idiom, das David meint.
            if (ev.button === 1) { ev.preventDefault(); schliessen(t.path); }
          }}
          className={`max-w-[13rem] truncate py-1.5 pl-2.5 pr-1 text-body-s ${
            aktiv ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'}`}>
          <span className="sr-only">{`Reiter ${i + 1}: `}</span>{name}
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
            className="hidden lg:inline-flex h-6 w-5 shrink-0 items-center justify-center text-ink-400 opacity-0 transition-opacity hover:text-ink-900 focus-visible:opacity-100 group-hover/reiter:opacity-100">
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
          onClick={() => schliessen(t.path)} klasse="h-6 w-6 mr-1 shrink-0" />
      </div>
    );
  };

  return (
    <nav aria-label="Offene Reiter" ref={leisteRef}
      className="print:hidden shrink-0 border-b border-rule-soft bg-paper">
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
