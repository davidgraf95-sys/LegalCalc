import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';
import { SucheLeerzustand } from '../suche/SucheLeerzustand';
import { aktivePosition, flacheTreffer, naechsterKey, vorigerKey, gewaehlterHref } from '../suche/trefferAuswahl';

// ─── Globale Suche im Top-Streifen (UI-Welle: Dropdown überall) ─────────────
//
// EIN Feld über Rechner+Vorlagen, Fristen-Vorlagen, Gesetze und Rechtsprechung
// — Treffer erscheinen als Dropdown DIREKT unter dem Feld, auf JEDER Seite
// (Auftrag David: «Resultate überall im Drop-down-Menü»). Kein ?q=-Umweg, kein
// /recherche mehr. Reine Darstellung/Navigation (§3): Trefferlogik liegt im
// geteilten Hook useUniversalSuche (§5).
//
// A5 (David 5.7.2026): der Norm-Sprung («OR 257d» → Deep-Link) sitzt jetzt HIER,
// nicht mehr in einer eigenen ⌘K-Palette — der Hook liefert die Sprung-Gruppe als
// obersten Treffer, Enter springt. «/» UND ⌘K/Ctrl-K fokussieren das Feld global
// (die frühere Befehls-Palette ist entfallen); mobil reicht das sichtbare Feld.
export function HeaderSuche({ onFokusModus, onFokusZurueck }: {
  /** S6: meldet dem Top-Streifen, dass das Feld mobil die volle Breite braucht
   *  (Logo/Werkzeuge weichen so lange). Nur mobil je true. */
  onFokusModus?: (aktiv: boolean) => void;
  /** Fokus-Ziel nach dem ✕: der Streifen sagt, wohin die Tastatur zurückkehrt. */
  onFokusZurueck?: () => void;
} = {}) {
  const navigate = useNavigate();
  const listboxId = useId();
  const [wert, setWert] = useState('');
  const [q, setQ] = useState('');
  const [offen, setOffen] = useState(false);
  const feld = useRef<HTMLInputElement>(null);
  const huelle = useRef<HTMLDivElement>(null);

  // S6 — MOBILER SUCH-FOKUSMODUS. Auf 390 px teilt sich das Feld den Streifen mit
  // Logo, Menü-Schalter und vier Werkzeug-Knöpfen; es blieben ~40 % der Breite,
  // in denen eine getippte Query («arbeitsvertrag kündigung») nie ganz lesbar
  // war. Solange die Suche offen ist, weichen die Nachbarn (Topbar) und ein ✕
  // führt zurück. Die Grenze ist dieselbe sm-Schwelle (640 px) wie im übrigen
  // Layout und folgt Rotation/Resize (Muster AzRegister).
  const [istMobil, setIstMobil] = useState(() =>
    typeof window === 'undefined' ? false : !window.matchMedia('(min-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const auf = () => setIstMobil(!mq.matches);
    mq.addEventListener('change', auf);
    return () => mq.removeEventListener('change', auf);
  }, []);

  // Debounce: Eingabe → Such-Query (~120 ms) — stösst zugleich das Lazy-Laden an.
  useEffect(() => {
    const id = setTimeout(() => setQ(wert.trim()), 120);
    return () => clearTimeout(id);
  }, [wert]);

  const { gruppen, allesGeladen, vorschlag, abdeckung } = useUniversalSuche(q);

  // Enter-Puffer (S3/#52): Wird Enter gedrückt, BEVOR Treffer geladen sind (mobil
  // trifft die «Suchen»-Taste sonst ins Leere), merkt sich das Feld die Query und
  // öffnet den obersten Treffer, sobald geladen. `wert.trim()`, weil `q` dem
  // Debounce nachhängt; bei weiterem Tippen wird der Puffer verworfen (onChange).
  const [enterQ, setEnterQ] = useState<string | null>(null);

  // Flache Trefferliste + Pfeil-Auswahl über einen STABILEN Treffer-Key (die
  // oid), NICHT über einen Positions-Index — identisch zum Hero (EIN Suchweg,
  // §5); geteilte Options-IDs via suchOptionId. Wächst die per useDeferredValue
  // entkoppelte Artikelgruppe (§15.3/#183) einen Tick später ein und verschiebt
  // die Positionen, folgt die Auswahl dem SEMANTISCH gleichen Treffer statt auf
  // einen fremden umzuspringen (Race-Fix #210, Logik in trefferAuswahl.ts).
  // flacheTreffer (SSoT, §5) enthält am Gruppenende auch die «alle N Treffer»-
  // Option (mehrHref) — so ist der Sprung auch per Tastatur erreichbar (a11y).
  const flach = flacheTreffer(gruppen, listboxId);
  const [aktivKey, setAktivKey] = useState<string | null>(null);
  // Bei neuer Query zurücksetzen (Render-Phasen-Abgleich statt setState-im-Effekt).
  const [letzteQuery, setLetzteQuery] = useState(q);
  if (q !== letzteQuery) {
    setLetzteQuery(q);
    setAktivKey(null);
  }
  const aktivPos = aktivePosition(flach, aktivKey);
  // UI-NAV O1: das Feld öffnet auch LEER (⌘K/Fokus) → Verlauf + kuratierte
  // Einstiege (SucheLeerzustand). `feldLeer` an `wert` (nicht am nachhängenden `q`),
  // damit der Leerzustand beim ersten Tastendruck sofort den Treffern weicht.
  const feldLeer = wert.trim() === '';
  const zeigtPanel = offen && !feldLeer;
  const zeigtLeer = offen && feldLeer;
  // Fokusmodus = mobil UND Suche offen. Bewusst an `offen` gekoppelt statt an ein
  // eigenes onFocus/onBlur: ein Blur feuert auch beim Antippen eines Treffers —
  // der Streifen würde mitten im Tap neu umbrechen und den Tap verschieben.
  // `offen` endet dagegen genau dort, wo die Suche endet (✕, Escape, Klick
  // ausserhalb, Trefferwahl).
  const breit = istMobil && offen;
  useEffect(() => { onFokusModus?.(breit); }, [breit, onFokusModus]);
  // Beim Verlassen der Komponente den Streifen nicht im Fokusmodus zurücklassen.
  useEffect(() => () => onFokusModus?.(false), [onFokusModus]);
  const aktivId = zeigtPanel && aktivPos >= 0 ? flach[aktivPos].oid : undefined;

  // Globale Fokus-Shortcuts: «/» UND ⌘K/Ctrl-K fokussieren das Feld (A5 — die
  // frühere Palette ist entfallen, der Shortcut bleibt nützlich). In Eingabe-
  // feldern greift «/» nicht (normales Zeichen), ⌘K/Ctrl-K schon (globaler
  // Einstieg von überall). Zusätzlich lauscht das Feld auf «lm:suche-fokus», mit
  // dem der /gesetze-Landeplatz-CTA es fokussiert. Der aktuelle Feldwert wird
  // direkt vom DOM-Element gelesen (kein stale-closure über `wert`), das Panel
  // öffnet nur bei bereits vorhandenem Text (leeres Feld bleibt ruhig).
  useEffect(() => {
    const fokussiere = () => {
      const el = feld.current;
      if (!el) return;
      el.focus();
      el.select();
      // UI-NAV O1: immer öffnen — leer erscheint der Verlauf-/Einstieg-Leerzustand.
      setOffen(true);
    };
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        fokussiere();
        return;
      }
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      e.preventDefault();
      fokussiere();
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('lm:suche-fokus', fokussiere);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('lm:suche-fokus', fokussiere);
    };
  }, []);

  // Klick ausserhalb / Escape schliesst das Dropdown (Klick auf einen Treffer
  // navigiert via Link und ruft onAuswahl, das hier ebenfalls schliesst).
  useEffect(() => {
    if (!offen) return;
    const aus = (e: PointerEvent) => { if (huelle.current && !huelle.current.contains(e.target as Node)) setOffen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOffen(false); feld.current?.blur(); } };
    window.addEventListener('pointerdown', aus);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', aus); window.removeEventListener('keydown', esc); };
  }, [offen]);

  const auswahl = () => { setOffen(false); setWert(''); setQ(''); setAktivKey(null); setEnterQ(null); };

  // Übernimmt einen «Meinten Sie …?»-Vorschlag als neue Query (S3).
  const uebernehmeVorschlag = (begriff: string) => { setWert(begriff); setQ(begriff); setOffen(true); setAktivKey(null); };

  // Gepufferten Enter auslösen, sobald der Index geladen UND der Debounce
  // eingeholt ist (enterQ === q). Öffnet den obersten Treffer der ersten
  // nicht-leeren Gruppe; gibt es keinen (echte Nulltreffer/BGE nicht im Bestand),
  // bleibt das Panel mit der ehrlichen Auskunft stehen (§8).
  useEffect(() => {
    if (enterQ === null) return;
    if (!allesGeladen || enterQ !== q) return;
    const ziel = gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href;
    // Deferred, damit kein synchrones set-state-in-effect kaskadiert (Repo-Muster).
    const id = window.setTimeout(() => {
      setEnterQ(null);
      if (ziel) { navigate(ziel); setOffen(false); setWert(''); setQ(''); setAktivKey(null); }
    }, 0);
    return () => window.clearTimeout(id);
  }, [enterQ, q, allesGeladen, gruppen, navigate]);

  // Aktiven Treffer in den sichtbaren Bereich rollen (lange Trefferliste).
  useEffect(() => {
    if (aktivId) document.getElementById(aktivId)?.scrollIntoView({ block: 'nearest' });
  }, [aktivId]);

  // Pfeil-/Enter-Navigation wie im Hero (§5): Enter öffnet den hervorgehobenen
  // bzw. — ohne Auswahl — den obersten Treffer der ersten nicht-leeren Gruppe.
  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flach.length > 0) {
      e.preventDefault();
      setOffen(true);
      setAktivKey((k) => naechsterKey(flach, k));
    } else if (e.key === 'ArrowUp' && flach.length > 0) {
      e.preventDefault();
      setAktivKey((k) => vorigerKey(flach, k));
    } else if (e.key === 'Enter') {
      const ziel = gewaehlterHref(flach, aktivKey)
        ?? gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href;
      if (ziel) { navigate(ziel); auswahl(); }
      else if (wert.trim() !== '') { setEnterQ(wert.trim()); setOffen(true); } // Puffer: öffnen, sobald geladen
    }
  };

  return (
    <div ref={huelle} className="relative" role="search">
      <input
        ref={feld}
        type="search"
        value={wert}
        onChange={(e) => { setWert(e.target.value); setOffen(true); setEnterQ(null); }}
        onFocus={() => setOffen(true)}
        onKeyDown={aufTaste}
        // Mobil kurz: der lange Satz war auf 390 px ohnehin abgeschnitten und
        // verriet gerade das Sprung-Beispiel nicht mehr, auf das es ankommt.
        placeholder={istMobil ? 'Suche · OR 257d …' : 'Suchen oder Norm springen (z. B. «OR 257d») …'}
        // text-base (16 px) UNTER sm: alles darunter löst in iOS Safari beim
        // Fokus einen Seiten-Zoom aus, aus dem der Nutzer von Hand wieder
        // herausfinden muss (S6). Ab sm bleibt die kompakte Streifen-Grösse.
        className={`lc-input h-11 py-0 text-base sm:text-body-s w-full lg:pr-14 ${breit ? 'pr-11' : 'pr-3'}`}
        aria-label="LexMetrik durchsuchen oder zur Norm springen"
        aria-keyshortcuts="/ Meta+K Control+K"
        autoComplete="off"
        role="combobox"
        aria-expanded={zeigtPanel}
        aria-controls={zeigtPanel ? listboxId : undefined}
        aria-activedescendant={aktivId}
        aria-autocomplete="list"
      />
      {/* Dezenter Shortcut-Hinweis (⌘K/Ctrl-K fokussiert das Feld). Nur Desktop,
          nicht interaktiv (pointer-events-none) — die Bedienung ist das Feld
          selbst, mobil reicht es ohne Hinweis (A5). */}
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 num text-micro font-medium tracking-tight text-ink-600 lg:inline">⌘K</kbd>
      {/* S6: Ausstieg aus dem mobilen Fokusmodus — dieselbe Wirkung wie Escape
          (Panel zu, Feld unfokussiert), aber mit dem Finger erreichbar. Nur im
          Fokusmodus im DOM, damit er ausserhalb keine Tab-Station belegt. */}
      {breit && (
        <button
          type="button"
          aria-label="Suche schliessen"
          onClick={() => {
            setOffen(false);
            feld.current?.blur();
            // Fokus GEZIELT zurückgeben: dieser Knopf verlässt beim Schliessen das
            // DOM, ein blosses blur() setzt die Tastatur sonst auf <body> zurück
            // und Screenreader-Nutzer verlieren ihre Position (Gegenprüfungs-
            // Befund 7.8.2026). Hier wird nur der WUNSCH gemeldet — das Ziel ist
            // in diesem Moment noch ausgeblendet und damit nicht fokussierbar;
            // der Streifen setzt den Fokus, sobald es wieder sichtbar ist.
            onFokusZurueck?.();
          }}
          // 44 px wie alle übrigen Bedienelemente dieser Zone (min-h-11/min-w-11);
          // 36 px lagen unter dem Komfortmuster des Streifens.
          className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-md text-ink-500 transition-colors hover:text-ink-900"
        >
          <span aria-hidden className="text-base leading-none">✕</span>
        </button>
      )}
      {(zeigtPanel || zeigtLeer) && (
        // Im Header intern scrollbar (David 28.6.): die geöffnete Trefferfläche
        // wächst sonst unbegrenzt aus dem Top-Streifen heraus. max-h + eigener
        // Scroll + overscroll-contain (kein Durchscrollen auf die Seite). Nur der
        // HEADER-Pfad ist gekappt; der Hero nutzt dieselbe SuchResultate ungekappt.
        //
        // Ab 1400 px (LM-008): unter dem Feld verankert (absolute, Feldbreite) —
        // dort ist das Feld selbst breit genug. Darunter, inkl. des ganzen
        // «schmal, aber schon Desktop»-Bereichs 640–1400 px (Dedup-Notiz LM-008:
        // dort erbte das Panel bisher die Feldbreite von ~250–300 px, Titel und
        // Snippets wurden auf ein bis zwei Wörter beschnitten, Badges lagen über
        // dem Text) UND mobil (A5 — die Suchleiste trägt den Norm-Sprung): das
        // Panel ist viewport-verankert (fixed, feste Seitenränder inset-x-2) →
        // lesbare Breite OHNE horizontalen Overflow, unabhängig von der Feldbreite.
        // LM-018 (§8 B7): die Trefferzahl-Zeile (SuchResultate) sitzt bewusst
        // AUSSERHALB der `.lc-card` — im Hero und auf /suche liegt sie damit einfach
        // auf der Papier-Fläche der Seite (§5, geteilte Komponente, dort kein Bug).
        // Hier im Header-Dropdown überlagert dasselbe Markup aber fremden Inhalt
        // (Positions-/Brotkrumleiste dahinter) — ohne eigenen Hintergrund schien
        // dieser durch die transparente Zeile hindurch. `bg-paper` schliesst NUR
        // diesen Fundort, ohne SuchResultate selbst (und damit Hero/`/suche`)
        // anzufassen.
        <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-[70vh] overflow-y-auto overscroll-contain rounded-lg bg-paper max-[1400px]:fixed max-[1400px]:inset-x-2 max-[1400px]:left-2 max-[1400px]:right-2 max-[1400px]:top-[3.75rem] max-[1400px]:mt-0">
          {zeigtLeer
            // UI-NAV O1: Leerzustand (⌘K/Fokus ohne Eingabe) — Verlauf + Einstiege.
            ? <SucheLeerzustand onAuswahl={auswahl} />
            : <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} onAuswahl={auswahl} listboxId={listboxId} aktivId={aktivId}
                vorschlag={vorschlag} abdeckung={abdeckung} onVorschlag={uebernehmeVorschlag}
                onNavigate={(href) => navigate(href)} />}
        </div>
      )}
    </div>
  );
}
