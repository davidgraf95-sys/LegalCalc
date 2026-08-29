import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HeaderSuche } from './HeaderSuche';
import { SprachUmschalter } from '../SprachUmschalter';
import { ThemaUmschalter } from './ThemaUmschalter';
import { ReiterUebersicht } from './ReiterUebersicht';
import { VerlaufUebersicht } from './VerlaufUebersicht';
import type { Schriftskala } from './useSchriftskala';

// ─── Top-Streifen der App-Shell (Build-Plan App-Shell, Phase 3) ─────────────
//
// NUR Werkzeuge, KEINE Navigationsziele (die liegen in der Seitenleiste):
// Logo/Wortmarke · globale Katalog-Suche · Schriftgrösse · Sprachumschalter. Auf
// Mobil zusätzlich der ☰-Schalter, der die Seitenleisten-Schublade öffnet
// (onMenu, von Shell); auf Desktop ein Schalter, der die persistente
// Seitenleiste ein-/ausklappt.
export function Topbar({ onMenu, seitenleisteEingeklappt, onSeitenleisteUmschalten, schrift }: {
  onMenu: () => void;
  seitenleisteEingeklappt: boolean;
  onSeitenleisteUmschalten: () => void;
  /** Globale Schriftskala (A−/A+), R3 — ersetzt den früheren Breiten-Umschalter. */
  schrift: Schriftskala;
}) {
  // S6 — mobiler Such-Fokusmodus: solange die Suche auf schmalem Schirm offen
  // ist, weichen Menü-Schalter, Logo und die Werkzeug-Knöpfe, damit das Feld die
  // volle Streifenbreite bekommt (getippte Query bleibt lesbar). HeaderSuche
  // meldet den Zustand; sie setzt ihn nur mobil (Desktop bleibt unberührt).
  const [sucheBreit, setSucheBreit] = useState(false);
  // Eine Klasse, drei Fundorte — `hidden` statt Unmount: die Knöpfe behalten
  // ihren Zustand (Verlauf/Reiter-Panels) und der Streifen springt nicht.
  const weicht = sucheBreit ? 'hidden' : '';
  // Fokus-Ziel beim Verlassen des Fokusmodus: der ☰-Schalter ist das erste
  // Bedienelement des Streifens und mobil immer da — die Tastatur landet damit
  // am Anfang derselben Zone statt auf <body>.
  const menuKnopf = useRef<HTMLButtonElement>(null);
  // Der Wunsch wird im ✕-Klick gemeldet, ausgeführt wird er erst NACH dem
  // Re-Render: solange der Fokusmodus läuft, trägt der Schalter `hidden` und ein
  // display:none-Element nimmt keinen Fokus an. Der Effekt feuert genau auf der
  // Flanke «Fokusmodus endet» — nicht beim Verlassen über einen Treffer (dort
  // wird kein Wunsch gesetzt und die Navigation behält ihren eigenen Fokus).
  const fokusWunsch = useRef(false);
  useEffect(() => {
    if (sucheBreit || !fokusWunsch.current) return;
    fokusWunsch.current = false;
    menuKnopf.current?.focus();
  }, [sucheBreit]);
  return (
    <header
      className="sticky top-0 z-20 border-b border-line lc-glass"
    >
      <div className="px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-5">
        {/* Mobil: Schublade öffnen — auf Desktop trägt die persistente Leiste. */}
        <button
          type="button"
          ref={menuKnopf}
          className={`lc-btn lc-btn-ghost lc-btn-sm lg:hidden shrink-0 min-h-11 min-w-11 ${weicht}`}
          aria-label="Navigation öffnen"
          aria-controls="seitenleisten-schublade"
          onClick={onMenu}
        >
          <span aria-hidden className="text-base leading-none">☰</span>
        </button>

        {/* Desktop: persistente Seitenleiste ein-/ausklappen. */}
        <button
          type="button"
          className="lc-btn lc-btn-ghost lc-btn-sm hidden lg:inline-flex shrink-0 min-h-11 min-w-11"
          aria-label={seitenleisteEingeklappt ? 'Seitenleiste einblenden' : 'Seitenleiste ausblenden'}
          aria-pressed={!seitenleisteEingeklappt}
          onClick={onSeitenleisteUmschalten}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.7" />
            {seitenleisteEingeklappt && <line x1="5.5" y1="9" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
          </svg>
        </button>

        {/* Desktop: globale Schriftgrösse A−/A+ (R3 — ersetzt den Kompakt/Breit-
            Schalter). Skaliert die Wurzel-rem (useSchriftskala) → trifft alle
            Seiten; Wert persistent. Eigenständiger Name je Knopf (role="group"-
            Name wird von Screenreadern nicht zuverlässig vorgelesen); disabled an
            den Anschlägen (§13/F4); Tastatur + sichtbarer Fokus über die globale
            :focus-visible-Outline. Ab lg, mobil aus (knapper Topbar-Platz). */}
        {/* ── C4 · ENTSCHEID DAVID 5B (29.8.2026) · BEIDE REGLER SAGEN, WAS SIE STELLEN
            BEFUND (Design-Review C4, gemessen 17.8. und erneut 29.8.2026 @1440
            im Leser): zwei sichtbar gleich aussehende «A− 100 % A+»-Regler
            standen gleichzeitig auf 120 % und 118 % — dieser hier skaliert die
            ganze Anwendung über die Wurzel-rem (`useSchriftskala`, WCAG 1.4.4),
            der im «Ansicht»-Menü nur den Normtext (`leserSchrift.ts`). Der
            Unterschied stand ausschliesslich im `aria-label`; wer sieht, sah
            zweimal dasselbe Bedienelement (= Fehlerbuch-18, dort als «Kern:
            Scope nur im aria-label» präzisiert).
            ENTSCHEID: nicht einen Regler streichen, sondern beide beschriften —
            der Scope steht sichtbar davor, in derselben Anordnung wie im Menü
            (Wort links, Steller rechts), damit die zwei als ZWEI Werkzeuge
            lesbar sind statt als Dopplung. Gegenstück: «Nur Gesetzestext» in
            `v3/LeserAnsichtV3.tsx`; das Wort «Nur» dort trägt die Abgrenzung.
            Der Regler bleibt ab lg sichtbar und mobil aus (Streifen-Platz, C2). */}
        <div role="group" aria-label="Schriftgrösse der ganzen Seite" className="hidden lg:inline-flex shrink-0 items-center gap-1.5">
          <span aria-hidden className="select-none whitespace-nowrap text-micro text-ink-500">Ganze Seite</span>
          <span className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
            <button
              type="button"
              aria-label="Ganze Seite verkleinern"
              title="Verkleinert die ganze Anwendung — der Gesetzestext hat im Menü «Ansicht» einen eigenen Regler"
              disabled={!schrift.kannKleiner}
              onClick={schrift.kleiner}
              className="rounded-md px-2.5 py-1 text-body-s font-medium text-ink-600 transition-colors hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40"
            >
              A<span aria-hidden>−</span>
            </button>
            {/* Live-Wertansage des aktuellen Prozentwerts (WCAG 4.1.3), tabular für
                ruckelfreie Breite; w-12 hält die Breite stabil (Token, keine px). */}
            <span aria-live="polite" className="w-12 select-none text-center text-micro tabular-nums text-ink-500">{schrift.prozent} %</span>
            <button
              type="button"
              aria-label="Ganze Seite vergrössern"
              title="Vergrössert die ganze Anwendung — der Gesetzestext hat im Menü «Ansicht» einen eigenen Regler"
              disabled={!schrift.kannGroesser}
              onClick={schrift.groesser}
              className="rounded-md px-2.5 py-1 text-body-s font-medium text-ink-600 transition-colors hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40"
            >
              A<span aria-hidden>+</span>
            </button>
          </span>
        </div>

        {/* Logo nur unterhalb lg — ab lg trägt die Seitenleiste die Marke.
            ── C2 (Design-Review 29.8.2026) · UNTER 480 px TRÄGT DIE SCHUBLADE DIE MARKE
            Gemessen @320 im warmen Zustand (Verlauf + ein offener Reiter): der
            Streifen brauchte 332 px in einem 320-px-Fenster, «de ▾» hing über der
            Kante. Acht Bedienelemente à 44 px passen dort nicht nebeneinander —
            eines muss weichen, und es ist das, was einen benannten Ersatz EINEN
            Tap entfernt hat: der ☰-Schalter steht in derselben Ecke, die
            Schublade zeigt unter 480 px die Marke (`Sidebar.tsx`, spiegelbildlich
            dieselbe Schwelle) und darunter «Start» als ersten Nav-Eintrag. Ab
            480 px steht das Logo unverändert hier. */}
        <Link to="/" className={`lg:hidden max-[480px]:hidden inline-flex items-center gap-2 no-underline shrink-0 min-h-11 px-1 ${weicht}`} aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          {/* Wortmarke ab sm — auf schmalen Schirmen trägt die Suche die Mitte. */}
          <LexMetrikWortmarke className="hidden sm:block text-h3" />
        </Link>

        {/* max-w-xl deckelt die Feldbreite auf Desktop; im mobilen Fokusmodus ist
            der Viewport ohnehin schmaler, das Feld füllt also den Streifen.
            C1/B10/L3: unter 480 px trägt die Zone im Ruhezustand die 44-px-Lupe
            (`HeaderSuche`). `min-w-11` statt `min-w-0` hält sie dort — sonst
            schrumpfte die flex-1-Hülle weiter unter ihr eigenes Bedienelement und
            die Lupe stünde über der Hüllenkante. Nur die Untergrenze wechselt;
            die Zone bleibt dieselbe flex-1-Zone in jeder Breite. */}
        <div className="flex-1 min-w-0 max-[480px]:min-w-11 max-w-xl">
          <HeaderSuche onFokusModus={setSucheBreit} onFokusZurueck={() => { fokusWunsch.current = true; }} />
        </div>

        <div className={`shrink-0 flex items-center gap-1.5 sm:gap-2 ${weicht}`}>
          {/* A5 (David 5.7.2026): kein eigener Palette-Knopf mehr — die
              HeaderSuche trägt den Norm-Sprung selbst; ⌘K/Ctrl-K und «/»
              fokussieren ihr Feld (Hinweis-kbd sitzt im Feld). */}
          {/* ── C2 · DER VERLAUF-TRIGGER WEICHT UNTER 480 px ────────────────
              Zweite Hälfte derselben Rechnung wie beim Logo. Der Verlauf ist der
              einzige Werkzeug-Knopf mit einem ZWEITEN, wortgleichen Zugang: das
              Suchfeld öffnet leer den `SucheLeerzustand`, und der zeigt genau
              diese Liste — aus DERSELBEN Quelle (`useZuletzt`, §5), nicht aus
              einer Kopie. Reiter, Farbschema und Sprache haben das nicht und
              bleiben darum stehen. Ab 480 px ist der Trigger unverändert da
              (Gegenprobe im Tor). */}
          <div className="max-[480px]:hidden"><VerlaufUebersicht /></div>
          <ReiterUebersicht />
          <ThemaUmschalter />
          <SprachUmschalter />
        </div>
      </div>
    </header>
  );
}
