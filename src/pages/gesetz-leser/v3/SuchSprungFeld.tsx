import { useEffect, useRef, type RefObject } from 'react';

// ─── EIN Feld für Suchen UND Springen (FAHRPLAN-LESER-V3 Kap. 4b, Pos. 4) ────
//
// Der Ist-Leser hat ZWEI Eingaben für dieselbe Absicht «bring mich zu einer
// Stelle»: das In-Gesetz-Suchfeld im Kopf und den Quickjump «Art. N» im
// Gliederungs-Sheet (K2). V3 hat eines. Die Weiche ist der EINGABEWERT, nicht
// ein Umschalter:
//
//   «429» / «Art. 429» / «art429»  ⇒ auflösbar ⇒ Enter SPRINGT zum Artikel
//   alles andere                   ⇒ die bestehende In-Gesetz-Suche läuft
//
// Aufgelöst wird mit `loeseArtikelEingabe` (suchTreffer.ts) — derselben reinen
// Funktion, die der Ist-Quickjump benutzt (§5, keine zweite Erkennungsregel).
// Der Sprung selbst geht über `springeZuArtikel` des Rahmens und erbt damit den
// Sticky-Offset (`.nt-anker` → `--nt-stick`), den der Kopf setzt (Risiko R1).
//
// TASTATUR (Kap. 4h): `⌘K`/`Ctrl+K` und `/` fokussieren das Feld; `Esc` leert
// es und schliesst die Trefferliste, SPRINGT ABER NICHT — die Scrollposition
// bleibt exakt stehen (Pos. 14, «recover from mistakes»). Darum ruft der
// Esc-Zweig ausdrücklich nichts als `setSuche('')`: jeder Sprung-Aufruf, auch
// ein «zurück an den Anfang», wäre eine Bewegung, die niemand angefordert hat.
//
// Die Tastenkürzel hängen am `window`, nicht am Feld — sie sollen ja greifen,
// während der Fokus im Lesetext steht. Sie sind trotzdem NICHT global im Sinne
// von «überall in der App»: der Effekt lebt und stirbt mit dieser Komponente,
// die nur im V3-Leser gerendert wird. `/` wird unterdrückt, solange der Fokus
// in einem Eingabefeld steht (sonst könnte man das Zeichen nirgends tippen).

/** Tippt der Nutzer gerade in ein Feld? Dann ist `/` ein Zeichen, kein Kürzel. */
function inEingabe(ziel: EventTarget | null): boolean {
  const el = ziel as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const t = el.tagName.toLowerCase();
  return t === 'input' || t === 'textarea' || t === 'select' || el.isContentEditable === true;
}

export function SuchSprungFeld({
  wert, setzeWert, loeseArtikel, onSprung, feldRef, onKuerzel,
}: {
  wert: string;
  setzeWert: (v: string) => void;
  /** «Art. 429» → Token, sonst `null`. Fehlt sie (Snapshot noch nicht da),
   *  bleibt das Feld eine reine Suche — nie ein totes Sprung-Versprechen (§8). */
  loeseArtikel?: (eingabe: string) => string | null;
  onSprung: (token: string) => void;
  /** Damit der Rahmen den Fokus setzen kann (Sheet öffnet → Feld fokussieren). */
  feldRef?: RefObject<HTMLInputElement | null>;
  /** Wird bei `⌘K`/`/` gerufen, BEVOR fokussiert wird — mobil öffnet das
   *  die Gliederung als Sheet, in der das Feld steht (Kap. 4h). */
  onKuerzel?: () => void;
}) {
  const eigenerRef = useRef<HTMLInputElement>(null);
  const ref = feldRef ?? eigenerRef;

  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      const istK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const istSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !inEingabe(e.target);
      if (!istK && !istSlash) return;
      e.preventDefault();
      onKuerzel?.();
      // Nach dem Öffnen des Sheets existiert das Feld evtl. erst im nächsten
      // Frame — der Fokus wird darum nachgereicht statt sofort versucht.
      requestAnimationFrame(() => ref.current?.focus());
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [onKuerzel, ref]);

  const token = loeseArtikel && wert.trim() !== '' ? loeseArtikel(wert) : null;

  return (
    <div data-v3-suchsprung className="space-y-1">
      <div className="relative">
        <input
          ref={ref}
          type="search"
          value={wert}
          onChange={(e) => setzeWert(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              // Kein Sprung, kein Scroll — nur leeren (Pos. 14).
              e.preventDefault();
              setzeWert('');
              return;
            }
            if (e.key === 'Enter' && token) {
              e.preventDefault();
              onSprung(token);
            }
          }}
          placeholder="Suchen oder «Art. 429» …"
          aria-label="Im Gesetz suchen oder zu einem Artikel springen"
          aria-describedby={token ? 'v3-sprung-hinweis' : undefined}
          className="lc-input h-8 w-full min-w-0 px-2.5 py-0 text-body-s"
        />
        {/* Das Kürzel steht sichtbar am Feld — ein Kürzel, das man kennen muss,
            ist keines (Design-Grundlage Kap. 8: sichtbar im Ruhezustand). Auf
            Touch-Breiten ausgeblendet, dort gibt es keine Tastatur.
            `ink-500`, NICHT `ink-400`: `ink-400` ist ein Deko-Token (~3.1:1 auf
            der Feldfläche) und trägt hier sichtbaren Text — axe meldete
            `color-contrast`, serious. Dieselbe Klasse wie W3.6 (25.6.2026) und
            der Menü-Befund vom 26.7.2026; `aria-hidden` hilft nicht, das Zeichen
            ist ja zu sehen. */}
        <kbd aria-hidden className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none text-micro text-ink-500 sm:block">⌘K</kbd>
      </div>
      {token && (
        <button type="button" id="v3-sprung-hinweis" data-v3-sprung-hinweis
          onClick={() => onSprung(token)}
          className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-body-s text-brass-700 transition-colors hover:bg-brass-100/50">
          <span aria-hidden>→</span>
          <span>Zu <span className="num font-medium">{wert.trim()}</span> springen</span>
          <kbd aria-hidden className="ml-auto hidden text-micro text-ink-500 sm:block">↵</kbd>
        </button>
      )}
    </div>
  );
}
