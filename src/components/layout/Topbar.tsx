import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { HeaderSuche } from './HeaderSuche';
import { SprachUmschalter } from '../SprachUmschalter';
import { ThemaUmschalter } from './ThemaUmschalter';
import { VerlaufUebersicht } from './VerlaufUebersicht';
import { KorpusStand } from '../ui/KorpusStand';
import { BEREICHE, REG_RAND, bereichVonPfad } from './bereiche';
import { istSuchKuerzel, suchKuerzelEmpfaengerAbmelden, suchKuerzelEmpfaengerAnmelden } from '../suche/fruehesSuchKuerzel';

// ─── Titelblatt-Zeile der Sammlung (W2·24-DESIGN-IDENTITAET R2) ─────────────
//
// Vorher ein Werkzeug-Streifen mit Glas-Optik, der ausdrücklich KEINE
// Navigationsziele trug («die liegen in der Seitenleiste»). Jetzt der Kopf
// eines gedruckten Bandes: Marke links, BEREICHS-REITER daneben (Gesetze ·
// Rechtsprechung · Materialien · Rechner · Vorlagen, der aktive mit dem Strich
// seiner Registerfarbe), Werkzeuge rechts. Darunter — als eigene, NICHT
// klebende Zeilen in der Shell — die Ausgabe-Zeile (`AusgabeZeile`, unten) und
// die Arbeitsleiste mit den offenen Reitern (`Reiterleiste`).
//
// ── WARUM NUR DIESE ZEILE KLEBT (gemessen, nicht gewählt) ──────────────────
// `pages/gesetz-leser/v3/leserGeometrie.ts` führt die Höhe dieses Kopfes als
// Konstante `APP_TOPBAR_H = '4rem'` und rechnet daraus BEIDE Sprung-Offsets des
// Lesers (`--leser-v3-kopf-top`, `--nt-stick`). Die Datei gehört Runde R4 und
// ist in R2 TABU. Würde die Titelblatt-Zeile mit Ausgabe-Zeile und Arbeitsleiste
// auf ~7 rem wachsen, klebte der Leser-Kopf weiter auf 4 rem — also UNTER der
// Arbeitsleiste — und jeder `#art-…`-Anker landete um die Differenz zu hoch.
// Darum bleibt genau diese Zeile `sticky top-0` und exakt `h-16`; die zwei
// neuen Zeilen laufen im normalen Fluss mit. Sie scrollen damit weg — der Preis
// ist bewusst und steht als R4-Punkt in der Rückgabe (dort wird aus der
// Konstante ein geteiltes Token, dann kann die Arbeitsleiste kleben).
//
// `lc-glass` bleibt am header-Element: die Druckregel hängt an `header.lc-glass`
// (`src/index.css` @media print, `src/tests/druck-fundstellen.test.ts`), und
// die Klasse ist seit R1 leer bis auf `background: var(--paper)`.
export function Topbar({ onMenu, schubladeOffen, seitenleisteEingeklappt, onSeitenleisteUmschalten, ohneSeitenleiste }: {
  onMenu: () => void;
  /** Ob die Off-Canvas-Schublade offen ist — nur dann existiert ihr DOM-Ziel. */
  schubladeOffen: boolean;
  seitenleisteEingeklappt: boolean;
  onSeitenleisteUmschalten: () => void;
  /** Route ohne persistente Seitenleiste («/», §6 (d) des Fahrplans) → der
   *  Einklapp-Schalter hätte dort nichts zu schalten und entfällt. */
  ohneSeitenleiste?: boolean;
}) {
  // W2·23-STARTSEITE-V4 §6.1: auf «/» trägt der Hero die EINE Suche — der
  // Streifen zeigt dort kein zweites Feld (zwei sichtbar gleiche Suchen auf
  // einem Bildschirm sind eine Dopplung, kein Angebot). Auf allen anderen
  // Routen unverändert.
  const { pathname } = useLocation();
  const aufStartseite = pathname === '/';
  // S6 — mobiler Such-Fokusmodus: solange die Suche auf schmalem Schirm offen
  // ist, weichen Menü-Schalter, Logo und die Werkzeug-Knöpfe, damit das Feld die
  // volle Streifenbreite bekommt (getippte Query bleibt lesbar). HeaderSuche
  // meldet den Zustand; sie setzt ihn nur mobil (Desktop bleibt unberührt).
  const [sucheBreit, setSucheBreit] = useState(false);
  // Eine Klasse, drei Fundorte — `hidden` statt Unmount: die Knöpfe behalten
  // ihren Zustand (Verlauf-Panel) und der Streifen springt nicht.
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
  const aktiverBereich = bereichVonPfad(pathname);
  return (
    <header
      className="sticky top-0 z-leiste lc-glass"
    >
      {/* Die 2-px-Kante sitzt AM INNEREN Träger, nicht am <header>: mit
          `box-sizing: border-box` liegt sie damit INNERHALB der `h-16` und die
          klebende Krone misst exakt 4 rem = 64 px. Gemessen 6.9.2026 im
          Preview: mit `border-b-2` am <header> waren es 66 px — zwei Pixel mehr
          als `APP_TOPBAR_H` in `leserGeometrie.ts` annimmt, und der klebende
          Leser-Kopf sässe um genau diese zwei Pixel falsch. */}
      <div className="px-4 sm:px-6 h-16 border-b-2 border-rule flex items-center gap-3 sm:gap-5">
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

        {/* Desktop: persistente Seitenleiste ein-/ausklappen. Auf «/» gibt es
            keine (§6 (d)) — ein Schalter ohne Schaltbares wäre ein Tor, das
            nicht scheitern kann (§6.7), darum entfällt er dort ganz. */}
        {!ohneSeitenleiste && (
          <button
            type="button"
            className="lc-btn lc-btn-ghost lc-btn-sm hidden lg:inline-flex shrink-0 min-h-11 min-w-11"
            // WCAG 4.1.2 · konstanter zugänglicher Name (QS-UI Folgeschritt, 5.9.2026):
            // der Name benennt konstant das bediente Ding, den Zustand trägt allein
            // `aria-pressed` (gedrückt = Leiste ist eingeblendet). Bewacht von
            // `ARIA_ZUSTANDSNAME` (eslint.config.js).
            aria-label="Seitenleiste ein- und ausblenden"
            aria-pressed={!seitenleisteEingeklappt}
            onClick={onSeitenleisteUmschalten}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="4" width="18" height="16" stroke="currentColor" strokeWidth="1.7" />
              <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.7" />
              {seitenleisteEingeklappt && <line x1="5.5" y1="9" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
            </svg>
          </button>
        )}

        {/* Marke. Anders als vor R2 steht sie AUF JEDER BREITE im Titelblatt —
            der Kopf ist jetzt das Titelblatt der Sammlung, und ein Titelblatt
            ohne Titel gibt es nicht.
            ── C2 (Design-Review 29.8.2026) · UNTER 480 px TRÄGT DIE SCHUBLADE
            DIE MARKE. Gemessen @320 im warmen Zustand: der Streifen brauchte
            332 px in einem 320-px-Fenster. Acht Bedienelemente à 44 px passen
            dort nicht nebeneinander — die Schublade zeigt unter 480 px die
            Marke (`Sidebar.tsx`, spiegelbildlich dieselbe Schwelle). */}
        <Link to="/" className={`max-[480px]:hidden inline-flex items-center gap-2 no-underline shrink-0 min-h-11 px-1 ${weicht}`} aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={28} />
          {/* Wortmarke ab sm — auf schmalen Schirmen trägt die Suche die Mitte. */}
          <LexMetrikWortmarke className="hidden sm:block text-h3" />
        </Link>

        {/* ── Bereichs-Reiter (§5a Ziff. 1: Navigation, NICHT offene Dokumente) ─
            Unterstrichener Text ohne Fläche und ohne ✕ — optisch bewusst etwas
            anderes als die Arbeitsleiste darunter. Der aktive Bereich trägt den
            2-px-Strich SEINER Registerfarbe (`./bereiche`); inaktive tragen den
            Platz transparent, damit beim Wechsel nichts springt.
            `overflow-x-auto` + `min-w-0`: die Reiter dürfen den Kopf nie
            überlaufen (dieselbe Regel wie im Referenzbild, `.masthead nav`).
            Unter `md` trägt die Schublade die Bereichs-Navigation. */}
        <nav aria-label="Bereiche" className={`hidden md:flex min-w-0 shrink items-stretch gap-4 lg:gap-5 self-stretch overflow-x-auto lc-reiter-scroll ${weicht}`}>
          {BEREICHE.map((b) => {
            const aktiv = aktiverBereich?.ziel === b.ziel;
            return (
              <NavLink key={b.ziel} to={b.ziel} aria-current={aktiv ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center border-b-2 pt-0.5 text-body-s no-underline transition-colors ${
                  aktiv
                    ? `${REG_RAND[b.register]} font-medium text-ink-900`
                    : 'border-transparent text-ink-600 hover:text-ink-900 hover:border-rule-soft'
                }`}>
                {b.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Die Hülle bleibt IMMER stehen, auch ohne Feld: sie ist der `flex-1`-
            Dehnungsraum des Streifens. Würde sie auf «/» entfallen, rückten die
            Werkzeug-Knöpfe nach links und der Streifen spränge beim Wechsel
            «/» ↔ andere Route (§6.1: «Layout darf nicht springen»).
            Der Deckel ist seit R2 enger (`max-w-xs`, ab `xl` `max-w-sm`): die
            Bereichs-Reiter teilen sich die Zeile jetzt mit dem Feld, und ein
            576-px-Feld nähme ihnen bei 1280 px Fensterbreite den Platz. */}
        <div className="flex-1 min-w-0 max-w-xs xl:max-w-sm">
          {!aufStartseite && (
            <HeaderSuche onFokusModus={setSucheBreit} onFokusZurueck={() => { fokusWunsch.current = true; }} />
          )}
        </div>

        {/* `ml-auto`: die Werkzeuge stehen IMMER an der rechten Kante. Ohne sie
            sammelt sich der Restplatz hinter ihnen, sobald der `max-w-xs`-Deckel
            des Suchfeldes greift — GEMESSEN 6.9.2026 @1280: der Farbschema-Knopf
            stand auf «/» 93 px weiter links als auf `/gesetze` (die Startseite
            trägt weder Feld noch Seitenleisten-Schalter). Genau diesen Sprung
            verbietet §6.1 («Layout darf nicht springen»), bewacht von
            `e2e/w223b-kopf-seitenleiste.e2e.ts`. */}
        <div className={`ml-auto shrink-0 flex items-center gap-1.5 sm:gap-2 ${weicht}`}>
          {/* A5 (David 5.7.2026): kein eigener Palette-Knopf mehr — die
              HeaderSuche trägt den Norm-Sprung selbst.
              R2: der frühere ☰-Reiter-Trigger (`ReiterUebersicht`) ist ersatzlos
              weg — die offenen Reiter stehen jetzt sichtbar in der Arbeitsleiste
              (`Reiterleiste`), ihr Überlauf-Knopf «+N» trägt dieselbe Liste
              (`TabPanel`) samt Suche. Ein zweiter Zugang zum selben Panel wäre
              die Dopplung, die David abgeschafft haben wollte.
              ── C2 · DER VERLAUF-TRIGGER WEICHT UNTER 480 px: er ist der einzige
              Werkzeug-Knopf mit einem ZWEITEN Zugang (der leere Suchzustand
              speist sich aus derselben Quelle `useZuletzt`). */}
          <div className="max-[480px]:hidden"><VerlaufUebersicht /></div>
          <ThemaUmschalter />
          <SprachUmschalter />
        </div>
      </div>
    </header>
  );
}

// ─── Ausgabe-Zeile (Referenzbild `.edition`) ────────────────────────────────
//
// Die dünne Zeile unter dem Titelblatt, die sagt, WELCHE AUSGABE man vor sich
// hat: «Register erzeugt: Gesetze 5.9.2026 · …». Der Inhalt kommt unverändert
// aus dem bestehenden Baustein `ui/KorpusStand` — derselbe Satz, den die
// Seitenleiste im Fuss führt (§5: ein Baustein, mehrere Konsumenten; §8: der
// Baustein sagt «Register erzeugt», nicht «Stand der Rechtsprechung»).
//
// NICHT klebend (Begründung oben am Kopf) und `print:hidden`: im Ausdruck
// trägt die Fundstelle ihren eigenen Stand, eine Bildschirm-Ausgabezeile
// gehörte dort nicht hin.
export function AusgabeZeile() {
  return (
    // Unter `sm` weggelassen: die Zeile braucht dort zwei Zeilen Höhe für eine
    // Angabe, die auf dem Telefon niemand sucht — und sie ist nicht verloren,
    // die Schublade führt DENSELBEN Baustein in ihrem Fuss (bewacht von
    // `e2e/w223b-kopf-seitenleiste.e2e.ts` §6.3 @390).
    <div className="hidden sm:block print:hidden shrink-0 border-b border-rule-soft bg-paper">
      <div className="px-4 sm:px-6 py-1.5 flex justify-end">
        <KorpusStand />
      </div>
    </div>
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
