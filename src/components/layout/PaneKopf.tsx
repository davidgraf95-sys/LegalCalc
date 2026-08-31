import type { DragEvent, ReactNode } from 'react';
import { OrtsAngabe, StandAngabe } from './OrtsAngabe';

// ─── Pane-Kopf (Split-View «Fensterkopf», Auftrag David) ────────────────────
//
// EINE Titelleiste je Pane, IDENTISCH für primär + sekundär, nur im Multipane
// montiert (1-Pane-Default trägt keine Chrome → byte-gleich). Sagt, WAS im Pane
// liegt (Icon · Label · Stand) und trägt die Pane-Steuerung rechts:
// ⠿ Ziehgriff · ◂/▸ Umsortieren (Tastatur/Touch) · [zum Hauptfenster] · [teilen] · ✕.
// Reine Darstellung (§3); Tokens-only (§13). Sitzt AUSSERHALB des Scroll-
// Containers (echte Leiste, kein sticky-Hack).
//
// ── A-2 (David 17.8.2026): der IDENTITÄTS-Teil ist abwählbar (`nurSteuerung`).
//    Trägt die Inhaltsseite ihre Kopfzeile selbst, bleibt hier die reine
//    Fenster-Steuerung — Herleitung an der Prop und im Vertrag
//    `InhaltsKopfKontext.KopfDaten.kopfzeileSelbst`.

export interface PaneKopfProps {
  icon?: ReactNode;
  label: string;
  /**
   * In-Kraft-/Konsolidierungs-Stand, nur wenn auflösbar (§8 — kein erfundener Stand).
   *
   * ── §7-ABWEICHUNG VOM BAU-PAKET A-4 (31.8.2026), offengelegt ──────────────
   * Das Paket verlangte die STREICHUNG dieser Prop als unerreichbar (§6.7).
   * Nachgerechnet statt geglaubt — die Behauptung ist falsifiziert:
   *   (a) `stand` ist genau dann gesetzt, wenn `Shell.titelVon()` einen Erlass
   *       auflöst; `lib/verlaufLabel.erlassVonPfad` gibt nur auf GESETZ-Pfaden
   *       etwas zurück.
   *   (b) Der Gesetz-Leser meldet `kopfzeileSelbst` NICHT unbedingt: auf drei
   *       Wegen nimmt `pages/gesetz-leser/v3/useKopfAnspruch.ts` (Z. 51) die
   *       Meldung zurück, wenn der Rahmen eine BLEIBENDE Ansicht ohne Kopfzeile
   *       rendert — Fehlseite · `pdf-embed` · `nur-live-link`
   *       (`pages/gesetz-leser/inhalt-ansichten.FruehAnsicht`).
   *   (c) Dann ist `kopfDaten === null`, also `nurSteuerung === undefined`,
   *       also `zeigeIdentitaet === true` — und der Stand steht.
   *   (d) Betroffener Bestand, gezählt am `public/normtext/register.json`
   *       (31.8.2026): 11 Erlasse mit `status` ∈ {pdf-embed, nur-live-link},
   *       davon 11 MIT `stand` — u. a. `bund/EMRK` (2022-09-16),
   *       `bund/DSGVO` (2016-04-27), `bund/NYUE` (2026-05-06).
   * Auf genau diesen Seiten ist diese Zeile die EINZIGE Stand-Angabe des Panes;
   * streichen hiesse einen Rechtswert entfernen (§8, D1). Die Prop bleibt und
   * ist seit 31.8.2026 bewacht: `src/tests/ortsAngabe.test.tsx` fährt die Kette
   * (a)–(d) nach und wird rot, sobald sie fällt.
   */
  stand?: string | null;
  /** F: Breadcrumb «Gesetze › Bund › OR» statt blossem Label (Parität zur Einzelansicht). */
  breadcrumb?: { label: string; to?: string }[];
  /** Klick auf einen Krümel mit `to` navigiert PANE-LOKAL (David 1.7.2026): der
   *  Callback geht an den Pane-eigenen Navigator (sekundär) bzw. den Haupt-Router
   *  (primär) — NIE ein globaler <Link> (der das ganze Fenster wegnavigieren würde).
   *  Fehlt der Callback (z. B. SSR/Prerender), bleibt die Breadcrumb statisch. */
  onBreadcrumb?: (to: string) => void;
  /** F: aktuell gelesener Artikel (Gesetz, live), z. B. «Art. 7 OR». */
  artikel?: string | null;
  rolle: 'primaer' | 'sekundaer';
  onSchliessen: () => void;
  /** Sekundär: dieses Pane zum Hauptfenster (URL) machen. */
  onHauptfenster?: () => void;
  /** Sekundär: Layout-Link kopieren. */
  onTeilen?: () => void;
  /** Umsortieren (Tastatur/Touch). disabled an den Enden. */
  onLinks?: () => void;
  onRechts?: () => void;
  kannLinks?: boolean;
  kannRechts?: boolean;
  /** ── A-2 (David 17.8.2026) · NUR PANE-STEUERUNG, KEINE IDENTITÄT ──────────
   *  Die Inhaltsseite dieses Panes hat `kopfzeileSelbst` gemeldet — sie trägt
   *  Krume, Titel, Ortsangabe und Stand selbst, eine Zeile weiter unten. Diese
   *  Leiste lässt ihren Identitäts-Teil dann WEG und behält genau das, was eine
   *  Inhaltsseite nicht tragen kann, weil es nicht ihr gehört, sondern dem
   *  Fenster: ⠿ Ziehgriff · ◂/▸ Umsortieren · ⇱ Hauptfenster · ⧉ Teilen · ✕
   *  Pane schliessen.
   *  `label` bleibt trotzdem gesetzt: die Steuer-Knöpfe brauchen ihn für ihre
   *  Accessible Names («‹StPO› schliessen») — sichtbar wird er nicht mehr. */
  nurSteuerung?: boolean;
  /** HTML5-Drag-Handler für den ⠿-Griff (nur wenn ziehbar, d. h. ≥2 Panes). */
  ziehbar?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
}

const knopf = 'inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:text-brass-700 hover:bg-brass-100/40 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-500 transition-colors';

export function PaneKopf({ icon, label, stand, breadcrumb, onBreadcrumb, artikel, rolle, onSchliessen, onHauptfenster, onTeilen, onLinks, onRechts, kannLinks, kannRechts, nurSteuerung, ziehbar, onDragStart, onDragEnd }: PaneKopfProps) {
  // A-2: eine Zeile, ein Zuständiger. Trägt die Seite ihre Kopfzeile selbst,
  // zeigt diese Leiste NICHTS von der Identität — sonst stünde derselbe Ort
  // zweimal in zwei Zentimetern (§5, Ä45 «Doppelkrume»).
  const zeigeIdentitaet = !nurSteuerung;
  return (
    // `data-pane-kopf` (A-2): Testanker der Titelleiste — bis 17.8.2026 liess sie
    // sich nur über Utility-Klassen (`div.h-9`) finden, und ein Test, der am
    // Aussehen sucht, prüft irgendwas (dieselbe Lehre wie `data-ort-artikel`).
    // Gebraucht von `e2e/leser-v3-eine-kopfzeile.e2e.ts` (d), das messen muss, ob
    // hier noch Identität steht. Reine Kennzeichnung, keine Anzeige-Änderung.
    <div data-pane-kopf data-pane-rolle={rolle}
      className={`shrink-0 grid grid-cols-[1fr_auto] items-center gap-2 h-9 px-1.5 border-b border-line bg-paper ${rolle === 'primaer' ? 'border-l-2 border-l-brass-700' : ''}`}>
      {/* Links: Identität (Icon · Label · Stand). pl-0 + enger gap → der Breadcrumb-
          Text fluchtet mit dem Inhalts-Gutter darunter (☰-Knopf/Artikeltext), statt
          vom ⠿-Griff nach rechts geschoben zu werden (Wunsch David: links bündig). */}
      <div className="flex min-w-0 items-center gap-1 pl-0">
        {ziehbar && (
          <span
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            aria-hidden
            title="Zum Verschieben ziehen"
            className="shrink-0 cursor-grab active:cursor-grabbing select-none px-0.5 text-ink-400 hover:text-brass-600"
          >⠿</span>
        )}
        {zeigeIdentitaet && icon && <span className="shrink-0">{icon}</span>}
        {/* ── A-4 (31.8.2026) · DIE ORTSANGABE IST DIESELBE WIE IN DER
            EINZELANSICHT ────────────────────────────────────────────────────
            Bis hierher baute diese Leiste ihre Krumen-Kette selbst nach — in
            `text-body-s` statt `text-xs`, ohne Landmark, mit dem vollen
            Artikel-Zitat neben der Krume, die sein Kürzel schon nennt, und vor
            allem OHNE jede Overflow-Regel: jede Krume truncatete für sich, also
            genau das «( ) )»-Bild, das der `InhaltsKopf` unter ② längst behoben
            hatte. Beides zieht jetzt auf `./OrtsAngabe` (§5/§10); die Kaskade
            dort misst die ZONE und wirkt darum im schmalen Pane wie auf dem
            Telefon. `aufKrume` hält die Navigation pane-lokal (David 1.7.2026),
            der Landmark-Name nennt das Fenster, damit mehrere Panes
            unterscheidbare Landmarks tragen. */}
        {zeigeIdentitaet && (
          <OrtsAngabe breadcrumb={breadcrumb} blattLabel={label} artikel={artikel}
            aufKrume={onBreadcrumb} navLabel={`Brotkrümel «${label}»`} />
        )}
        {/* D1/§7: der Stand ist ein Rechtswert — EINE Anatomie mit der
            Einzelansicht (`./OrtsAngabe`, dort auch die F2-Herleitung für
            ink-600, die diese Leiste bis 31.8.2026 auf ink-500 unterlief). Der
            Platz ist pane-eigen: hier steht kein Griff-Riegel, in den die Angabe
            gehörte, darum sitzt sie hinter der Ortsangabe (Trenner «·»). */}
        {zeigeIdentitaet && stand && <StandAngabe stand={stand} trenner />}
        {rolle === 'primaer' && <span className="sr-only">(aktuelle Adresse)</span>}
      </div>
      {/* Rechts: Steuerung. */}
      <div className="flex items-center">
        {onLinks && (
          <button type="button" className={knopf} disabled={!kannLinks} onClick={onLinks} aria-label={`«${label}» nach links`}>
            <span aria-hidden className="text-body-s leading-none">◂</span>
          </button>
        )}
        {onRechts && (
          <button type="button" className={knopf} disabled={!kannRechts} onClick={onRechts} aria-label={`«${label}» nach rechts`}>
            <span aria-hidden className="text-body-s leading-none">▸</span>
          </button>
        )}
        {onHauptfenster && (
          <button type="button" className={knopf} onClick={onHauptfenster} aria-label={`«${label}» zum Hauptfenster machen`} title="Zum Hauptfenster machen">
            <span aria-hidden className="text-body-s leading-none">⇱</span>
          </button>
        )}
        {onTeilen && (
          <button type="button" className={knopf} onClick={onTeilen} aria-label="Layout-Link kopieren" title="Layout-Link kopieren">
            <span aria-hidden className="text-base leading-none">⧉</span>
          </button>
        )}
        <button type="button" className={`${knopf} hover:text-danger-700`} onClick={onSchliessen}
          aria-label={rolle === 'primaer' ? 'Hauptfenster schliessen' : `«${label}» schliessen`}
          title={rolle === 'primaer' ? 'Hauptfenster schliessen' : 'Schliessen'}>
          <span aria-hidden className="text-body-s leading-none">✕</span>
        </button>
      </div>
    </div>
  );
}
