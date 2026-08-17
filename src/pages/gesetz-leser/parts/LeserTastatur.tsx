import { useEffect, useRef, useState } from 'react';
import { useDialogFokus } from '../../../components/layout/useDialogFokus';

// ─── W2·10-UI-NAV/R8 · Tastatur-Navigation j/k + «?»-Overlay ──────────────────
//
// Fahrplan R8 (niedrigste Priorität der Reihe): «EIN globaler keydown-Listener im
// Reader (Input/Dialog-Guard): j/k Artikel vor/zurück, t TOC-Fokus, «?»
// Shortcut-Overlay. Koexistenz-Pflicht: «/»/⌘K global belegt
// (`tastatur.e2e.ts`-Kontrakt).»
//
// KOEXISTENZ, konkret geprüft (der Kontrakt ist kein Kommentar, sondern eine
// Kollisionsliste):
//  · «/» und ⌘K/Ctrl-K gehören `HeaderSuche` (fokussiert das Suchfeld). Dieser
//    Listener fasst weder «/» noch irgendeine Modifier-Kombination an — die
//    Modifier-Sperre steht als ERSTE Zeile, vor jeder Tastenprüfung.
//  · «?» ist Shift+«/»; der Browser meldet `e.key === '?'`, die HeaderSuche prüft
//    auf `e.key === '/'` — beide Handler sehen sich also nie. Geprüft wird «?»
//    trotzdem OHNE Meta/Ctrl/Alt (Shift ist bei «?» auf den meisten Layouts
//    zwingend und darf darum nicht mitgesperrt werden).
//  · F6/Shift+F6 (Pane-Wechsel, `Shell.tsx`) und Escape im Suchfeld bleiben
//    unberührt: keine dieser Tasten steht unten in der Auswertung.
//
// GUARDS (in dieser Reihenfolge, weil jeder den nächsten billiger macht):
//  1. Modifier → raus (deckt ⌘K/Ctrl-K/Alt-Kombinationen samt Browser-Menüs).
//  2. Eingabefeld/contenteditable → raus. Sonst tippte «j» im In-Gesetz-Suchfeld
//     einen Artikelsprung statt eines Buchstabens — der klassische Vim-Bind-Bug.
//  3. Offener modaler Dialog (ausser dem eigenen Overlay) → raus. Ein Dialog hat
//     eine Fokusfalle; Navigation dahinter wäre Bedienung eines unsichtbaren
//     Dokuments (dasselbe Prinzip, nach dem `Shell.tsx` F6 sperrt).
//
// §3 reine Darstellung: die Komponente kennt keine Rechtslogik, nur Reihenfolge
// von Artikel-Tokens und den (hereingereichten) Sprung. §15: EIN passiv
// registrierter keydown-Listener, kein Scroll-Abo, kein Timer, kein Re-Render im
// Ruhezustand — im geschlossenen Zustand rendert sie `null`, das prerenderte
// Markup bleibt unberührt (golden byte-gleich).

/** Die Tastenbelegung — EINE Quelle für Auswertung UND Overlay (§5). Ein Eintrag,
 *  der hier fehlt, taucht auch in der Hilfe nicht auf; ein Eintrag, der hier steht
 *  und nicht wirkt, fiele beim Lesen der Hilfe sofort auf. */
/**
 * `hatPanel` = der Aufrufer hat ein Rechtsprechungs-/Kontext-Panel (LESER-V3,
 * H3). NUR DANN steht «r» in der Hilfe. Die Ist-Hülle hat kein solches Panel;
 * einen Eintrag zu zeigen, der dort nichts tut, wäre genau die Hilfe, die lügt
 * (§8) — und der Grund, warum diese Liste überhaupt EINE Quelle für Auswertung
 * und Overlay ist. Rein, damit die Zuordnung ohne Browser prüfbar ist (§6.7).
 */
export function belegung(hatPanel: boolean): readonly { taste: string; wirkung: string }[] {
  return [
    { taste: 'j', wirkung: 'Zum nächsten Artikel' },
    { taste: 'k', wirkung: 'Zum vorigen Artikel' },
    { taste: 't', wirkung: 'Fokus in die Gliederung' },
    ...(hatPanel ? [{ taste: 'r', wirkung: 'Rechtsprechung und Kontext öffnen' }] : []),
    { taste: '?', wirkung: 'Diese Übersicht öffnen' },
    { taste: 'Esc', wirkung: 'Übersicht schliessen' },
  ];
}

/** Tasten, die dieser Listener beansprucht (ohne «?»/Escape, die separat laufen).
 *  «r» ist frei: «/» und ⌘K gehören der HeaderSuche, j/k/t diesem Listener; kein
 *  Browser-Standard belegt ein blankes «r» (Reload ist ⌘/Ctrl+R und fällt bereits
 *  an Guard 1). */
const NAVIGATION = new Set(['j', 'k', 't', 'r']);

function istEingabe(ziel: EventTarget | null): boolean {
  const el = ziel as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable === true;
}

export function LeserTastatur({ tokens, aktivToken, onSprung, onPanel }: {
  /** Artikel-Tokens in DOKUMENT-Reihenfolge (Reader: aus `eintraege`). j/k gehen
   *  auf dieser Liste einen Schritt — nie auf einer DOM-Abfrage: die wäre bei
   *  `content-visibility:auto` von der Renderreihenfolge abhängig. */
  tokens: readonly string[];
  /** Der gerade gelesene Artikel (Scroll-Spy) oder null, solange keiner feststeht.
   *  Bezugspunkt für «nächster/voriger» — j/k folgen damit exakt derselben
   *  Vorstellung von «wo bin ich» wie Kopf, Reiter-Label und Gliederung (§5). */
  aktivToken: string | null;
  /** Sprung zum Token — der Reader reicht `springeZuArtikel` herein (EIN
   *  Sprung-Mechanismus für Quickjump, Treffer, Tastatur). */
  onSprung: (token: string) => void;
  /**
   * LESER-V3 H3 · «r» zieht das Rechtsprechungs-/Kontext-Panel auf.
   *
   * UNGESETZT ⇒ die Taste ist unbelegt und steht auch nicht in der Hilfe: die
   * Ist-Hülle hat kein Panel und bleibt Zeichen für Zeichen, wie sie war (FL-4).
   * KEINE ZWEITE TASTATUREBENE (Kap. 4h): V3 registriert keinen eigenen
   * keydown-Listener, sondern reicht eine Funktion in DEN einen herein.
   *
   * WARUM DAS KÜRZEL ÜBERHAUPT NÖTIG IST: Regel David 16.8.2026 — mit «Rechts­
   * prechung im Text: aus» verschwinden Zähler UND Randlasche. Dann muss das
   * Panel anders erreichbar bleiben; «Ansicht ▾» ist der eine Weg, «r» der
   * zweite (F8).
   */
  onPanel?: () => void;
}) {
  const [hilfeOffen, setHilfeOffen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  // Escape + Fokusfalle + Fokus-Rückgabe an den Auslöser über den geteilten Hook
  // (§5: dieselbe Dialog-Mechanik wie Kalender-Popover, NormPopover, TOC-Drawer).
  useDialogFokus(hilfeOffen, dialogRef, () => setHilfeOffen(false));

  // Die Auswertung liest `tokens`/`aktivToken` über Refs statt über die Effekt-
  // Abhängigkeiten: sonst würde der Listener bei jedem Spy-Wechsel (also bei jeder
  // Artikelgrenze im Scroll) ab- und neu registriert — ein vermeidbares
  // add/removeEventListener-Paar pro gelesenem Artikel (§15).
  const tokenRef = useRef(tokens);
  const aktivRef = useRef(aktivToken);
  const sprungRef = useRef(onSprung);
  useEffect(() => { tokenRef.current = tokens; }, [tokens]);
  useEffect(() => { aktivRef.current = aktivToken; }, [aktivToken]);
  useEffect(() => { sprungRef.current = onSprung; }, [onSprung]);
  // Wie `sprungRef`: über eine Ref gelesen, damit der Listener nicht bei jedem
  // Render des Rahmens ab- und neu registriert wird.
  const panelRef = useRef(onPanel);
  useEffect(() => { panelRef.current = onPanel; }, [onPanel]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      // Guard 1: jede Modifier-Kombination gehört jemand anderem (⌘K, Browser).
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Guard 2: Eingabefelder tippen Buchstaben, sie navigieren nicht.
      if (istEingabe(e.target)) return;
      // «?» SCHLIESST das eigene Overlay — auch dann, wenn es selbst das offene
      // Modal ist. Dieser eine Zweig steht vor Guard 3, weil er der einzige ist,
      // der eine Selbst-Ausnahme rechtfertigt: er RÄUMT den Dialog weg, statt
      // hinter ihm zu wirken. `dialogRef.current` ist nur gesetzt, solange das
      // Overlay gemountet ist (geschlossen rendert die Komponente `null`).
      //
      // §9-Bug-Check B1: früher nahm Guard 3 das eigene Overlay PAUSCHAL aus —
      // damit lief auch j/k weiter und scrollte das Dokument HINTER dem offenen
      // Dialog. Ein Modal hat eine Fokusfalle; was dahinter passiert, hat
      // niemand gewollt. Die Ausnahme gilt jetzt nur noch für die Taste, die
      // den Dialog beendet.
      if (e.key === '?' && dialogRef.current) {
        e.preventDefault();
        setHilfeOffen(false);
        return;
      }
      // Guard 3: hinter einem offenen modalen Dialog wird nichts bedient — ohne
      // Ausnahme, das eigene Overlay eingeschlossen (dasselbe Prinzip, nach dem
      // `Shell.tsx` F6 sperrt).
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

      if (e.key === '?') {
        e.preventDefault();
        setHilfeOffen(true);
        return;
      }
      if (!NAVIGATION.has(e.key)) return;
      if (e.key === 'r') {
        // Ohne Panel ist die Taste unbelegt — und zwar wirklich: kein
        // `preventDefault`, damit ein blankes «r» dort bleibt, was es war.
        const oeffne = panelRef.current;
        if (!oeffne) return;
        e.preventDefault();
        oeffne();
        return;
      }
      if (e.key === 't') {
        // Fokus in die Gliederung. Kein Aufklappen, kein Sprung: die Taste
        // verschiebt nur den Fokus dorthin, ab da bedient Tab/Enter den Baum.
        // Ist keine Gliederungs-Spalte da (schmale Breite, Erlass ohne Struktur),
        // passiert NICHTS — lieber ein wirkungsloser Tastendruck als ein Fokus,
        // der irgendwohin springt (§8).
        const toc = document.querySelector<HTMLElement>('[data-toc]');
        const ziel = toc?.querySelector<HTMLElement>('a[href], button:not([disabled])');
        if (!ziel) return;
        e.preventDefault();
        ziel.focus();
        return;
      }
      const liste = tokenRef.current;
      if (!liste.length) return;
      const jetzt = aktivRef.current;
      const i = jetzt === null ? -1 : liste.indexOf(jetzt);
      // Ohne bekannten Bezugspunkt (noch kein Spy-Ergebnis, z. B. direkt nach dem
      // Laden ganz oben) startet «j» beim ersten Artikel und «k» tut nichts —
      // rückwärts vom Nichts gibt es kein sinnvolles Ziel.
      const ziel = e.key === 'j' ? i + 1 : i - 1;
      if (ziel < 0 || ziel >= liste.length) return;
      e.preventDefault();
      sprungRef.current(liste[ziel]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!hilfeOffen) return null;
  return (
    // Der Overlay-Hintergrund schliesst per Klick; die Tastatur-Wege (Escape,
    // Fokusfalle, Fokus-Rückgabe) trägt `useDialogFokus`. `fixed` ⇒ kein
    // Layout-Einfluss auf das Dokument (CLS 0, §15).
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
      onClick={() => setHilfeOffen(false)}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Tastatur-Kurzbefehle"
        tabIndex={-1} onClick={(e) => e.stopPropagation()}
        className="lc-card w-full max-w-sm space-y-3 p-4">
        <h2 className="text-body-l font-semibold">Tastatur-Kurzbefehle</h2>
        <dl className="space-y-2">
          {belegung(onPanel != null).map((b) => (
            <div key={b.taste} className="flex items-baseline gap-3">
              <dt className="lc-chip shrink-0 justify-center px-2">{b.taste}</dt>
              <dd className="text-body-s text-ink-700">{b.wirkung}</dd>
            </div>
          ))}
        </dl>
        {/* §8: die global belegten Tasten gehören in dieselbe Übersicht — sonst
            liest sich die Liste als «das ist alles, was geht». */}
        <p className="text-body-s text-ink-600">
          Ausserdem überall: <span className="font-mono">/</span> oder{' '}
          <span className="font-mono">⌘K</span> für die Suche.
        </p>
        <button type="button" onClick={() => setHilfeOffen(false)}
          className="lc-btn-outline lc-btn-sm min-h-11 w-full">Schliessen</button>
      </div>
    </div>
  );
}
