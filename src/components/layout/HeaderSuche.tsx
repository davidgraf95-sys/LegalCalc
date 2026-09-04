import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';
import { SucheLeerzustand } from '../suche/SucheLeerzustand';
import { leerOptionen } from '../suche/SucheLeerzustandKontext';
import { aktivePosition, flacheTreffer, naechsterKey, vorigerKey, gewaehlterHref } from '../suche/trefferAuswahl';
import { useZuletzt } from './useZuletzt';
import { SchliessKnopf } from '../ui/SchliessKnopf';
import { suchKuerzelEmpfaengerAbmelden, suchKuerzelEmpfaengerAnmelden } from '../suche/fruehesSuchKuerzel';

/** Platzhalter des Suchfelds — lang, wo er ganz hineinpasst, sonst kurz (LM-124). */
const PLATZHALTER_LANG = 'Suchen oder Norm springen (z. B. «OR 257d») …';
const PLATZHALTER_KURZ = 'Suche · OR 257d …';

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

  // ─── LM-124 (W2·17-UI-BEFUNDE-B9, 4.9.2026) · DER PLATZHALTER MISST SEINEN
  //     EIGENEN PLATZ ────────────────────────────────────────────────────────
  //
  // Der lange Satz wurde bisher an der VIEWPORT-Schwelle gewählt (`istMobil`,
  // 640 px). Der Viewport ist die falsche Zahl — dieselbe Lehre wie bei
  // `ui/SeitenTitel` (A-1): was zählt, ist die Breite, die das FELD wirklich
  // bekommt, und die hängt an drei Dingen zugleich (Fensterbreite,
  // Topbar-Aufteilung, Schriftskala A−/A+).
  //
  // GEMESSEN am gebauten Stand, Bedarf des langen Satzes gegen den freien Platz
  // im Feld (`/rechner/zpo-fristen`): @1440/100 % 302 gegen 504 px — passt;
  // @1440/140 % 422 gegen 315 px — passt NICHT (der Befund); @1024/100 % 302
  // gegen 141 px und @768/100 % 302 gegen 240 px — passt ebenfalls nicht, und
  // zwar schon ohne jede Skalenstufe. Die Viewport-Schwelle konnte das nicht
  // sehen: sie kennt weder die Topbar-Aufteilung noch die Wurzel-Schriftgrösse.
  //
  // Die Antwort ist die, die `useSchriftskala` schon gibt (Stufenband 0.9–1.4,
  // «damit Tap-Ziele und Layout nicht brechen»): passt der lange Satz nicht,
  // steht der kurze — er trägt das Sprung-Beispiel, auf das es ankommt, und war
  // für 390 px ohnehin schon formuliert. KEIN neuer Text, keine dritte Variante.
  // Canvas-`measureText` statt eines Mess-Knotens: kein zusätzlicher Layout-Lauf
  // im ResizeObserver-Rückruf (und damit keine Rückkopplung — der Platzhalter
  // ändert die Feldbreite nicht).
  const [platzKnapp, setPlatzKnapp] = useState(false);
  useEffect(() => {
    const el = feld.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const messen = () => {
      const cs = getComputedStyle(el);
      const c2d = document.createElement('canvas').getContext('2d');
      if (!c2d) return;
      c2d.font = cs.font || `${cs.fontSize} ${cs.fontFamily}`;
      const noetig = c2d.measureText(PLATZHALTER_LANG).width;
      const platz = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setPlatzKnapp(noetig > platz + 1);
    };
    const ro = new ResizeObserver(messen);
    ro.observe(el);
    // Die Schriftskala ändert die Feldbreite nicht zwingend (rem-Layout wächst
    // mit), wohl aber den BEDARF — darum zusätzlich am Wurzel-Element horchen.
    const mo = new MutationObserver(messen);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    messen();
    return () => { ro.disconnect(); mo.disconnect(); };
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
  // UI-NAV O1: das Feld öffnet auch LEER (⌘K/Fokus) → Verlauf + kuratierte
  // Einstiege (SucheLeerzustand). `feldLeer` an `wert` (nicht am nachhängenden `q`),
  // damit der Leerzustand beim ersten Tastendruck sofort den Treffern weicht.
  const feldLeer = wert.trim() === '';
  const zeigtPanel = offen && !feldLeer;
  const zeigtLeer = offen && feldLeer;
  // Befund 38 (21.8.2026): EIN geteilter useZuletzt()-Aufruf für Anzeige UND
  // Pfeiltasten-Navigation (leerOptionen) — dieselbe Liste, kein zweiter, evtl.
  // abweichender Hook-Stand in SucheLeerzustand. Die Listbox-Options-Liste des
  // Leerzustands hat einen eigenen Namensraum (Gruppen «verlauf»/«einstieg»,
  // suchOptionId) und kollidiert nie mit den Treffer-oids aus `flach`.
  const verlauf = useZuletzt().slice(0, 5);
  const flachLeer = useMemo(() => leerOptionen(verlauf, listboxId), [verlauf, listboxId]);
  // Aktive Pfeil-Auswahl: EIN Key-State über beide Listen hinweg (Panel/Leer sind
  // nie gleichzeitig sichtbar, s. zeigtPanel/zeigtLeer oben) — welche Liste
  // gerade gilt, entscheidet `feldLeer`.
  const aktivListe = feldLeer ? flachLeer : flach;
  const [aktivKey, setAktivKey] = useState<string | null>(null);
  // Bei neuer Query ODER beim Wechsel leer↔Treffer zurücksetzen (Render-Phasen-
  // Abgleich statt setState-im-Effekt) — sonst zeigt aria-activedescendant auf
  // eine oid aus der jeweils ANDEREN Liste (harmlos dank aktivePosition-Fallback
  // -1, aber unnötig verwirrend beim Umschalten).
  const [letzterStand, setLetzterStand] = useState({ q, feldLeer });
  if (q !== letzterStand.q || feldLeer !== letzterStand.feldLeer) {
    setLetzterStand({ q, feldLeer });
    setAktivKey(null);
  }
  const aktivPos = aktivePosition(aktivListe, aktivKey);
  // Fokusmodus = mobil UND Suche offen. Bewusst an `offen` gekoppelt statt an ein
  // eigenes onFocus/onBlur: ein Blur feuert auch beim Antippen eines Treffers —
  // der Streifen würde mitten im Tap neu umbrechen und den Tap verschieben.
  // `offen` endet dagegen genau dort, wo die Suche endet (✕, Escape, Klick
  // ausserhalb, Trefferwahl).
  const breit = istMobil && offen;
  useEffect(() => { onFokusModus?.(breit); }, [breit, onFokusModus]);
  // Beim Verlassen der Komponente den Streifen nicht im Fokusmodus zurücklassen.
  useEffect(() => () => onFokusModus?.(false), [onFokusModus]);
  const aktivId = (zeigtPanel || zeigtLeer) && aktivPos >= 0 ? aktivListe[aktivPos].oid : undefined;

  // ── C1/B10/L3 (Design-Review 29.8.2026) · DER FOKUS-WUNSCH ÜBERLEBT EIN RENDER
  // Unter 480 px steht das Feld im Ruhezustand nicht im Bild (Lupen-Modus, s.
  // unten) — `focus()` auf ein `display:none`-Element verpufft still. Der Wunsch
  // wird darum gemerkt und eingelöst, sobald das Feld sichtbar IST. Über 480 px
  // ist das Feld immer sichtbar, der Zweig wird nie betreten, das Verhalten
  // (⌘K/«/»/CTA) ist unverändert.
  const fokusWunschFeld = useRef(false);
  const fokussiere = useCallback(() => {
    // UI-NAV O1: immer öffnen — leer erscheint der Verlauf-/Einstieg-Leerzustand.
    setOffen(true);
    const el = feld.current;
    if (el && el.offsetParent !== null) { el.focus(); el.select(); }
    else fokusWunschFeld.current = true;
  }, []);
  useEffect(() => {
    if (!fokusWunschFeld.current) return;
    const el = feld.current;
    if (!el || el.offsetParent === null) return;
    fokusWunschFeld.current = false;
    el.focus();
    el.select();
  });

  // Globale Fokus-Shortcuts: «/» UND ⌘K/Ctrl-K fokussieren das Feld (A5 — die
  // frühere Palette ist entfallen, der Shortcut bleibt nützlich). In Eingabe-
  // feldern greift «/» nicht (normales Zeichen), ⌘K/Ctrl-K schon (globaler
  // Einstieg von überall). Zusätzlich lauscht das Feld auf «lm:suche-fokus», mit
  // dem der /gesetze-Landeplatz-CTA es fokussiert. Der aktuelle Feldwert wird
  // direkt vom DOM-Element gelesen (kein stale-closure über `wert`), das Panel
  // öffnet nur bei bereits vorhandenem Text (leeres Feld bleibt ruhig).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // VORRANGREGEL (Bug-Check B1 zu Leser V3, 16.8.2026): Wer denselben
      // Tastendruck in der CAPTURE-Phase schon beansprucht hat, gewinnt. Der
      // V3-Leser tut das für sein Such-/Sprungfeld (`v3/suchKuerzel.ts`) —
      // ohne diese Zeile öffnete ⌘K/«/» dort BEIDES: hier synchron das
      // Dropdown, dort einen Frame später den Fokus, und das Dropdown blieb
      // sichtbar über der Lesefläche stehen. Einzige Änderung an dieser Datei;
      // ausserhalb des V3-Lesers ruft niemand `preventDefault` in Capture, das
      // Verhalten bleibt also unverändert.
      if (e.defaultPrevented) return;
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
    // VORLAUF (§17-Wurzel-Fix 4.9.2026): dieser Effekt läuft erst nach dem
    // ersten React-Commit. Ein ⌘K aus dem Fenster davor hat `main.tsx` gemerkt
    // — hier wird es eingelöst. Ab der Anmeldung hält sich der Vorlauf heraus,
    // die Mechanik oben (samt Vorrangregel B1) bleibt die einzige, die zählt.
    if (suchKuerzelEmpfaengerAnmelden(fokussiere)) fokussiere();
    return () => {
      suchKuerzelEmpfaengerAbmelden(fokussiere);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('lm:suche-fokus', fokussiere);
    };
  }, [fokussiere]);

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
  // Läuft über `aktivListe` (Treffer ODER Leerzustand-Optionen, je nach
  // `feldLeer`) — Befund 38: Pfeiltasten navigieren die Vorschläge, TAB bleibt
  // dagegen dem Browser überlassen und verlässt das Feld sofort (kein eigener
  // Tab-Handler hier — genau das ist der Fix).
  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && aktivListe.length > 0) {
      e.preventDefault();
      setOffen(true);
      setAktivKey((k) => naechsterKey(aktivListe, k));
    } else if (e.key === 'ArrowUp' && aktivListe.length > 0) {
      e.preventDefault();
      setAktivKey((k) => vorigerKey(aktivListe, k));
    } else if (e.key === 'Enter') {
      const ziel = gewaehlterHref(aktivListe, aktivKey)
        ?? (feldLeer ? undefined : gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href);
      if (ziel) { navigate(ziel); auswahl(); }
      else if (!feldLeer && wert.trim() !== '') { setEnterQ(wert.trim()); setOffen(true); } // Puffer: öffnen, sobald geladen
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
        // Kurz, sobald der lange Satz nicht ins Feld passt: er war dort ohnehin
        // abgeschnitten und verriet gerade das Sprung-Beispiel nicht mehr, auf
        // das es ankommt. Der Auslöser ist seit LM-124 die gemessene Feldbreite
        // statt der Viewport-Schwelle (Herleitung oben bei `platzKnapp`).
        placeholder={platzKnapp ? PLATZHALTER_KURZ : PLATZHALTER_LANG}
        // text-base (16 px) UNTER sm: alles darunter löst in iOS Safari beim
        // Fokus einen Seiten-Zoom aus, aus dem der Nutzer von Hand wieder
        // herausfinden muss (S6). Ab sm bleibt die kompakte Streifen-Grösse.
        // C1/B10/L3: unter 480 px weicht das FELD im Ruhezustand der Lupe (s.
        // unten) — geöffnet (`breit`) steht es dort über die volle Streifenbreite.
        className={`lc-input h-11 py-0 text-base sm:text-body-s w-full lg:pr-14 ${breit ? 'pr-11' : 'pr-3 max-[480px]:hidden'}`}
        aria-label="LexMetrik durchsuchen oder zur Norm springen"
        aria-keyshortcuts="/ Meta+K Control+K"
        autoComplete="off"
        role="combobox"
        // Befund 38: aria-expanded/-controls galten bisher NUR im Treffer-Panel —
        // der Leerzustand (SucheLeerzustand) öffnete visuell denselben Dropdown,
        // meldete das aber nicht (aria-expanded blieb false). Beide Panel-Arten
        // sind jetzt dieselbe ARIA-Listbox (`listboxId`), also gilt dieselbe
        // Bedingung für beide.
        aria-expanded={zeigtPanel || zeigtLeer}
        aria-controls={(zeigtPanel || zeigtLeer) ? listboxId : undefined}
        aria-activedescendant={aktivId}
        aria-autocomplete="list"
      />
      {/* ── C1/B10/L3 (Design-Review 29.8.2026) · UNTER 480 px EINE LUPE ───────
          BEFUND, gemessen 29.8.2026 (Chromium, `vite preview`, warmer Zustand):
          das Feld war @320 und @375 genau 28 px breit — ein leerer Rahmen ohne
          Lupe, ohne Platzhalter, ohne erkennbaren Zweck. Es ist `flex-1 min-w-0`
          und gibt allen anderen Streifen-Elementen nach, bis nichts mehr da ist.
          Der Review las das als Leser-Eigenheit; nachgemessen tritt es auf JEDER
          Route auf, sobald Verlauf und ein Reiter existieren (Messreihe im
          Commit zu C2).
          DIE ENTSCHEIDUNG: unter 480 px ist ein 28-px-Feld keine kleine Suche,
          sondern gar keine. Dort steht ein 44-px-Ziel mit Lupe; ein Tap darauf
          schaltet in den Fokusmodus, den es seit S6 ohnehin gibt — Feld über die
          volle Streifenbreite, Nachbarn weichen, ✕ zurück. Kein zweites Overlay,
          kein zweiter Zustand: derselbe `offen`-Zustand, dieselbe Trefferfläche.
          Ab 480 px ist alles unverändert (Gegenprobe im Tor
          `e2e/topbar-kein-ueberlauf-320.e2e.ts`).
          Warum ein Knopf und keine reine `min-width` am Feld: 44 px Mindestbreite
          hätten das Feld nur wieder zum leeren Rahmen gemacht, in dem nichts
          lesbar ist — die Untergrenze löst die Sichtbarkeit, nicht die
          Benutzbarkeit (§8: nichts anbieten, was in dieser Grösse nicht trägt). */}
      {!breit && (
        <button
          type="button"
          data-suche-lupe
          onClick={fokussiere}
          aria-label="LexMetrik durchsuchen oder zur Norm springen"
          aria-keyshortcuts="/ Meta+K Control+K"
          className="hidden max-[480px]:inline-flex shrink-0 min-h-11 min-w-11 items-center justify-center rounded-lg border border-line bg-surface text-ink-600 transition-colors hover:text-ink-900"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <line x1="15.8" y1="15.8" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {/* Dezenter Shortcut-Hinweis (⌘K/Ctrl-K fokussiert das Feld). Nur Desktop,
          nicht interaktiv (pointer-events-none) — die Bedienung ist das Feld
          selbst, mobil reicht es ohne Hinweis (A5). */}
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 num text-micro font-medium tracking-tight text-ink-600 lg:inline">⌘K</kbd>
      {/* S6: Ausstieg aus dem mobilen Fokusmodus — dieselbe Wirkung wie Escape
          (Panel zu, Feld unfokussiert), aber mit dem Finger erreichbar. Nur im
          Fokusmodus im DOM, damit er ausserhalb keine Tab-Station belegt. */}
      {breit && (
        <SchliessKnopf
          name="Suche schliessen"
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
          // 36 px lagen unter dem Komfortmuster des Streifens. Die SICHTBARE Box
          // bleibt damit, wo sie war — A3-1 (R3-β) vereinheitlicht Glyph, Ton
          // und Trefferfläche, nicht die Box der Zeile. Der Hover wird warm
          // (brass-700) statt dunkel (ink-900): §G-j, eine Flexoki-Stufe.
          klasse="absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2"
        />
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
            // Listbox-Modus (Befund 38): Maus-Klick navigiert UND schliesst/leert
            // das Feld in einem Zug (wie Enter/Tastatur-Auswahl).
            ? <SucheLeerzustand verlauf={verlauf} listboxId={listboxId} aktivId={aktivId}
                onNavigate={(href) => { navigate(href); auswahl(); }} />
            : <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} onAuswahl={auswahl} listboxId={listboxId} aktivId={aktivId}
                vorschlag={vorschlag} abdeckung={abdeckung} onVorschlag={uebernehmeVorschlag}
                onNavigate={(href) => navigate(href)} />}
        </div>
      )}
    </div>
  );
}
