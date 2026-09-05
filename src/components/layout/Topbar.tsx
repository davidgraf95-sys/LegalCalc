import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HeaderSuche } from './HeaderSuche';
import { SprachUmschalter } from '../SprachUmschalter';
import { ThemaUmschalter } from './ThemaUmschalter';
import { ReiterUebersicht } from './ReiterUebersicht';
import { VerlaufUebersicht } from './VerlaufUebersicht';
import { istSuchKuerzel, suchKuerzelEmpfaengerAbmelden, suchKuerzelEmpfaengerAnmelden } from '../suche/fruehesSuchKuerzel';

// ─── Top-Streifen der App-Shell (Build-Plan App-Shell, Phase 3) ─────────────
//
// NUR Werkzeuge, KEINE Navigationsziele (die liegen in der Seitenleiste):
// Logo/Wortmarke · globale Katalog-Suche · Verlauf/Reiter · Thema ·
// Sprachumschalter. Die Schriftgrösse der ganzen Seite steht seit
// W2·23-STARTSEITE-V4 (§6.2) auf `/einstellungen` (Baustein
// `ui/SchriftgroessenRegler.tsx`) — der Streifen wird dadurch ruhiger. Auf
// Mobil zusätzlich der ☰-Schalter, der die Seitenleisten-Schublade öffnet
// (onMenu, von Shell); auf Desktop ein Schalter, der die persistente
// Seitenleiste ein-/ausklappt.
export function Topbar({ onMenu, schubladeOffen, seitenleisteEingeklappt, onSeitenleisteUmschalten }: {
  onMenu: () => void;
  /** Ob die Off-Canvas-Schublade offen ist — nur dann existiert ihr DOM-Ziel. */
  schubladeOffen: boolean;
  seitenleisteEingeklappt: boolean;
  onSeitenleisteUmschalten: () => void;
}) {
  // W2·23-STARTSEITE-V4 §6.1: auf «/» trägt der Hero die EINE Suche — der
  // Streifen zeigt dort kein zweites Feld (zwei sichtbar gleiche Suchen auf
  // einem Bildschirm sind eine Dopplung, kein Angebot). Auf allen anderen
  // Routen unverändert.
  const aufStartseite = useLocation().pathname === '/';
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
  // Solange der Streifen kein Feld trägt (auf «/»), übernimmt er die globalen
  // Such-Kürzel für die Suche der Seite — sonst drückte «/» dort ins Leere.
  useSuchKuerzelUmleitung(aufStartseite);
  return (
    <header
      className="sticky top-0 z-leiste border-b border-line lc-glass"
    >
      <div className="px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-5">
        {/* Mobil: Schublade öffnen — auf Desktop trägt die persistente Leiste. */}
        <button
          type="button"
          ref={menuKnopf}
          className={`lc-btn lc-btn-ghost lc-btn-sm lg:hidden shrink-0 min-h-11 min-w-11 ${weicht}`}
          aria-label="Navigation öffnen"
          aria-expanded={schubladeOffen}
          // aria-controls nur bei offener Schublade: die Ziel-ID existiert erst
          // dann im DOM — axe wertet den Dauer-Verweis als critical
          // (aria-valid-attr-value; Bug-Check Mobile-Kopf 29.8.2026).
          aria-controls={schubladeOffen ? 'seitenleisten-schublade' : undefined}
          onClick={onMenu}
        >
          <span aria-hidden className="text-base leading-none">☰</span>
        </button>

        {/* Desktop: persistente Seitenleiste ein-/ausklappen. */}
        <button
          type="button"
          className="lc-btn lc-btn-ghost lc-btn-sm hidden lg:inline-flex shrink-0 min-h-11 min-w-11"
          // WCAG 4.1.2 · konstanter zugänglicher Name (QS-UI Folgeschritt, 5.9.2026;
          // in Teilpass (e) noch zurückgestellt, weil er eine Test-Zeile berührt).
          // Vorher: `seitenleisteEingeklappt ? 'Seitenleiste einblenden' :
          // 'Seitenleiste ausblenden'` neben `aria-pressed`. Gemessen @1440:
          // «Seitenleiste einblenden»/pressed=false im Leser, nach Klick
          // «Seitenleiste ausblenden»/pressed=true — der Zustand stand doppelt und
          // in ENTGEGENGESETZTER Leserichtung («ausblenden, gedrückt», während die
          // Leiste eingeblendet IST), und der Name WECHSELTE beim Klick:
          // Sprachsteuerung («klicke Seitenleiste einblenden») zielt danach auf
          // einen Namen, den es nicht mehr gibt. Jetzt benennt der Name konstant
          // das bediente Ding, den Zustand trägt allein `aria-pressed`
          // (gedrückt = Leiste ist eingeblendet). Bewacht von `ARIA_ZUSTANDSNAME`
          // (eslint.config.js) — die Ausnahme von Teilpass (e) ist ersatzlos weg,
          // das Tor ist hier wieder scharf.
          aria-label="Seitenleiste ein- und ausblenden"
          aria-pressed={!seitenleisteEingeklappt}
          onClick={onSeitenleisteUmschalten}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.7" />
            {seitenleisteEingeklappt && <line x1="5.5" y1="9" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
          </svg>
        </button>

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
            (`HeaderSuche`). Die Lupe hält ihre 44 px selbst — `min-w-11 shrink-0`
            an IHR, nicht an dieser Hülle.
            NACHGEMESSEN 29.8.2026 (Korrekturrunde, warm, Chromium gegen dist/):
            hier stand zusätzlich ein `max-[480px]:min-w-11`, das nie band. Die
            flex-1-Hülle bekommt den Restplatz und ist auf jeder geprüften Breite
            weiter als ihr Inhalt — 72 px @320, 112 @360, 152 @400, 212 @460, auf
            allen vier Routen (/gesetze · / · Leser V3 · /rechtsprechung), und
            zwar mit UND ohne die Untergrenze identisch (16/16 Messpunkte). Die
            Lupe stand dabei nie über der Hüllenkante, sondern 28 px darin. Die
            Untergrenze ist darum gestrichen statt bewacht (§17): sie trug keine
            Wirkung, aber die Behauptung einer. */}
        {/* Die Hülle bleibt IMMER stehen, auch ohne Feld: sie ist der `flex-1`-
            Dehnungsraum des Streifens. Würde sie auf «/» entfallen, rückten die
            Werkzeug-Knöpfe nach links und der Streifen spränge beim Wechsel
            «/» ↔ andere Route (§6.1: «Layout darf nicht springen»). */}
        <div className="flex-1 min-w-0 max-w-xl">
          {!aufStartseite && (
            <HeaderSuche onFokusModus={setSucheBreit} onFokusZurueck={() => { fokusWunsch.current = true; }} />
          )}
        </div>

        <div className={`shrink-0 flex items-center gap-1.5 sm:gap-2 ${weicht}`}>
          {/* A5 (David 5.7.2026): kein eigener Palette-Knopf mehr — die
              HeaderSuche trägt den Norm-Sprung selbst; ⌘K/Ctrl-K und «/»
              fokussieren ihr Feld (Hinweis-kbd sitzt im Feld). */}
          {/* ── C2 · DER VERLAUF-TRIGGER WEICHT UNTER 480 px ────────────────
              Zweite Hälfte derselben Rechnung wie beim Logo. Der Verlauf ist der
              einzige Werkzeug-Knopf mit einem ZWEITEN Zugang: das Suchfeld
              öffnet leer den `SucheLeerzustand`, und der speist sich aus
              DERSELBEN Quelle (`useZuletzt` → `lib/zuletztVerwendet.ts`, §5),
              nicht aus einer Kopie. Reiter, Farbschema und Sprache haben das
              nicht und bleiben darum stehen. Ab 480 px ist der Trigger
              unverändert da (Gegenprobe im Tor).
              GRENZE DIESES ARGUMENTS, nachgemessen 29.8.2026 (Korrekturrunde):
              der Zweitzugang ist dieselbe Quelle, aber NICHT dieselbe Länge —
              `zuletztVerwendet.ts` hält MAX = 12, `HeaderSuche` kappt den
              Leerzustand auf 5. Unter 480 px sind die Einträge 6–12 damit ohne
              Bedien-Weg (erreichbar bleiben sie über die Suche selbst und über
              normale Navigation, es ist eine Komfort-Lücke, keine Sackgasse).
              Die frühere Fassung dieses Kommentars behauptete «genau diese
              Liste» — das war zu stark und ist hier korrigiert statt still
              stehengelassen (§8). Die Kappung wird NICHT im Vorbeigehen gehoben:
              5 Verlaufs-Zeilen + kuratierte Einstiege ist die gewachsene
              Anordnung des Leerzustands (UI-NAV O1), und 12 Zeilen schöben die
              Einstiege unter die Falz. Ob der Leerzustand unter 480 px die volle
              Liste zeigen soll, ist ein Anordnungs-Entscheid für David —
              offener Punkt in der Rückgabe der Bau-Einheit W2·11-MOBILKOPF. */}
          <div className="max-[480px]:hidden"><VerlaufUebersicht /></div>
          <ReiterUebersicht />
          <ThemaUmschalter />
          <SprachUmschalter />
        </div>
      </div>
    </header>
  );
}

// ─── «/» und ⌘K, wenn der Streifen kein Feld trägt (W2·23-STARTSEITE-V4 §6.1) ─
//
// Auf «/» rendert der Streifen keine `HeaderSuche` — und mit ihr keinen Zuhörer
// für die globalen Such-Kürzel. Dieser Hook leitet sie dorthin um, wo die Suche
// der Seite steht.
//
// BEWUSST OHNE KOPPLUNG an die Startseiten-Interna (Arbeitspaket A baut sie
// parallel): das Ziel ist über den ARIA-Kontrakt gesucht — `[role="search"]`
// mit einem `input` darin, nicht über eine Komponente, eine ID oder ein
// aria-label. Was den Kontrakt erfüllt, wird gefunden; ändert die Startseite
// ihren Aufbau, bleibt die Umleitung heil.
//
// DER LISTENER HÄNGT AN KEINER ROUTE, sondern entscheidet zur Ereigniszeit, ob
// der Kopf ein eigenes Feld trägt. Gemessen 5.9.2026 (Preview, SPA-Klick
// «Gesetze» → «Start»): mit einem routen-abhängigen Effekt (`[aufStartseite]`)
// lief zwischen dem History-Wechsel und dem Effekt-Lauf ein Fenster OHNE
// Zuhörer — der erste «/»-Druck nach dem Klick verpuffte (activeElement blieb
// der Link, auch 1.5 s später), erst der zweite fokussierte das Feld. Der
// Alltagsweg auf «/» ist genau dieser Klick, nicht das Neuladen. Registriert
// ist der Handler jetzt einmal beim Mount des Streifens; solange die
// HeaderSuche im Kopf steht, hält er sich vollständig heraus (sie hat ihre
// eigene, eingespielte Mechanik samt Vorrangregel B1 und Mobil-Lupe).
//
// Die ENTSCHEIDUNG, ob ein Tastendruck das Such-Kürzel ist, kommt aus
// `suche/fruehesSuchKuerzel.ts` (§5 — dieselbe Regel wie HeaderSuche und der
// Vorlauf aus `main.tsx`, keine zweite Kopie der Tastenlogik). Als Empfänger
// des Vorlaufs meldet sich der Hook nur an, wenn beim Mount kein Kopf-Feld da
// ist (der Erstlade-Fall auf «/»); sonst gehört diese Rolle der HeaderSuche.
function useSuchKuerzelUmleitung(aufStartseite: boolean): void {
  /** Das Suchfeld des KOPFES — steht es da, kümmert sie sich selbst. */
  const kopfFeld = () => document.querySelector('header [role="search"] input');
  /** Erstes Suchfeld der Seite ausserhalb des Kopfes. */
  const seitenFeld = () => {
    for (const f of document.querySelectorAll<HTMLInputElement>('[role="search"] input')) {
      if (!f.closest('header')) return f;
    }
    return null;
  };

  // DER WUNSCH ÜBERLEBT EIN PAAR FRAMES — dasselbe Muster, das `HeaderSuche`
  // für ihr Lupen-Feld führt (`fokusWunschFeld`), hier gegen eine andere
  // Ursache: GEMESSEN 5.9.2026 (Preview, SPA-Klick «Gesetze» → «Start», Sonde
  // im Seiten-Kontext) stand im Moment des ersten «/»-Drucks noch KEIN
  // `[role="search"] input` im Dokument — die Startseite hatte ihre Module
  // noch nicht gerendert; sie erschienen ~200 ms später. `focus()` auf ein
  // Element, das es nicht gibt, verpufft still. Darum wird bis zu 2 s lang je
  // Frame nachgesehen. Abbruch, sobald der Kopf wieder ein Feld trägt (Route
  // gewechselt — dann gehört die Sache der HeaderSuche) oder der Nutzer selbst
  // in einem Eingabefeld steht: ein verspäteter Fokus darf ihm nicht in die
  // Tastatur greifen.
  const fokussiere = useCallback(() => {
    const bis = performance.now() + 2000;
    const versuch = () => {
      if (kopfFeld()) return;
      const aktiv = document.activeElement as HTMLElement | null;
      if (aktiv && (/^(INPUT|TEXTAREA|SELECT)$/.test(aktiv.tagName) || aktiv.isContentEditable)) return;
      const f = seitenFeld();
      if (f && f.offsetParent !== null) { f.focus(); f.select(); return; }
      if (performance.now() < bis) requestAnimationFrame(versuch);
    };
    versuch();
  }, []);

  // (a) Der Tasten-Zuhörer hängt an KEINER Route, sondern entscheidet zur
  //     Ereigniszeit, ob der Kopf ein eigenes Feld trägt — so gibt es beim
  //     Routenwechsel kein Fenster ohne Zuhörer. Solange die HeaderSuche im
  //     Kopf steht, hält er sich vollständig heraus (sie hat ihre eigene,
  //     eingespielte Mechanik samt Vorrangregel B1 und Mobil-Lupe).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Vorrangregel B1 (16.8.2026): wer in der Capture-Phase schon
      // beansprucht hat, gewinnt.
      if (e.defaultPrevented) return;
      if (kopfFeld()) return;
      if (!istSuchKuerzel(e)) return;
      e.preventDefault();
      fokussiere();
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('lm:suche-fokus', fokussiere);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('lm:suche-fokus', fokussiere);
    };
  }, [fokussiere]);

  // (b) EMPFÄNGER-ROLLE, und warum sie an der Route hängen MUSS.
  //     `fruehesSuchKuerzel.ts` fängt jeden Kürzel-Druck ab, solange KEIN
  //     Empfänger angemeldet ist — es ruft dabei `preventDefault()` und merkt
  //     den Wunsch. GEMESSEN 5.9.2026 (Sonde im Seiten-Kontext nach dem
  //     SPA-Klick auf «Start»): genau das geschah hier. Die HeaderSuche hatte
  //     sich beim Unmount abgemeldet, diese Umleitung war nicht angemeldet —
  //     der Vorlauf beanspruchte den Druck, und der Zuhörer aus (a) stieg
  //     korrekt bei `defaultPrevented` aus. Der Druck war damit nicht verloren,
  //     sondern GEMERKT; er brauchte nur einen Empfänger. Diese Anmeldung ist
  //     er: sie löst den gemerkten Wunsch beim Wechsel auf «/» sofort ein und
  //     hält den Vorlauf danach heraus. Auf anderen Routen gehört die Rolle der
  //     HeaderSuche — darum hier nur auf «/», und abgemeldet wird
  //     identitätsgeprüft (eine fremde Anmeldung wird nie abgeräumt).
  useEffect(() => {
    if (!aufStartseite) return;
    suchKuerzelEmpfaengerAnmelden(fokussiere);
    return () => suchKuerzelEmpfaengerAbmelden(fokussiere);
  }, [aufStartseite, fokussiere]);
}
