import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  abonniereRuecksprung, ermittleLesePosition, setzeRuecksprung, springeZurueck,
  type Ruecksprung,
} from '../../pages/gesetz-leser/scrollAnker';

// ─── W2·10-UI-NAV/R5 · «↩ zurück zu Art. X» ──────────────────────────────────
//
// Rest-Scope des Rücksprung-Befunds. A16 hat die VERWEIS-Sprünge zu echten
// History-Einträgen gemacht — dort landet «Zurück» exakt. Der Sprung aus dem
// Gliederungs-Baum ist der eine verbliebene Fall ohne Rückweg: er scrollt nur
// (bewusst, damit nicht jeder TOC-Klick die Adresse und die History füllt,
// LM-202), und der Browser-Zurück-Knopf führt danach aus dem Gesetz heraus statt
// an die verlassene Stelle.
//
// Der Chip ist die flüchtige Antwort darauf: einige Sekunden lang erreichbar,
// dann verfallen. Bewusst KEIN History-Eintrag und KEINE Adress-Änderung — die
// Rückkehr ist eine Scroll-Bewegung, keine Navigation (LM-202: der Hash entsteht
// nur bei ausdrücklichem Teilen-Klick).
//
// Reine Darstellung (§3). Rendert im Ruhezustand `null` ⇒ das prerenderte Markup
// bleibt unberührt (golden byte-gleich), und `position: fixed` hält den Chip aus
// dem Layoutfluss ⇒ CLS 0 (§15).

/** Einschwing-Fenster des TOC-Sprungs. `springeZuSektion` scrollt nach zwei
 *  rAF und hält den Scroll-Spy 500 ms gesperrt — erst danach steht fest, wo der
 *  Sprung gelandet ist. */
const SETTLE_MS = 700;
/** Lebensdauer des Chips. Lang genug, um ihn zu bemerken und zu treffen; kurz
 *  genug, dass er nicht als Dauer-Element im Blickfeld steht. */
const LEBENSDAUER_MS = 8000;

export function RuecksprungChip() {
  const [ziel, setZiel] = useState<Ruecksprung | null>(null);
  const { pathname } = useLocation();

  // Abo auf die Registry. Steht VOR dem Pfad-Effekt, damit dessen `setzeRuecksprung(null)`
  // schon beim ersten Lauf hier ankommt (Effekte laufen in Deklarations-Reihenfolge).
  useEffect(() => {
    // Der Einschwing-Timer gehört dem Effekt, nicht dem einzelnen Ereignis: ein
    // zweiter Sprung innerhalb des Fensters muss den ersten verwerfen, und beim
    // Abbau darf keiner überleben (sonst meldete sich ein Timer an einer
    // Komponente, die es nicht mehr gibt).
    let settle = 0;
    const ab = abonniereRuecksprung((r) => {
      window.clearTimeout(settle);
      if (!r) { setZiel(null); return; }
      // Erst nach dem Einschwingen prüfen, ob der Sprung überhaupt etwas bewegt
      // hat. Ein Klick auf den Abschnitt, in dem man ohnehin steht, darf keinen
      // Chip erzeugen — er verspräche eine Rückkehr an die Stelle, an der man
      // gerade steht (§8: nichts anbieten, was keine ist).
      settle = window.setTimeout(() => {
        const jetzt = ermittleLesePosition();
        if (jetzt?.token === r.token) { setzeRuecksprung(null); return; }
        setZiel(r);
      }, SETTLE_MS);
    });
    return () => { window.clearTimeout(settle); ab(); };
  }, []);

  // Erlass-Wechsel verwirft einen offenen Rücksprung: das Ziel-Token gehört zum
  // vorigen Dokument und wäre dort drüben entweder tot oder — schlimmer — ein
  // GLEICH benannter, aber anderer Artikel (jedes Gesetz hat einen «Art. 1»).
  // Das Leeren läuft über die Registry, nicht über ein zweites `setZiel` hier:
  // so gibt es genau EINEN Weg, auf dem der Chip verschwindet (das Abo oben).
  useEffect(() => { setzeRuecksprung(null); }, [pathname]);

  // Verfall. Hängt an `ziel`, nicht am Abo — jeder neue Rücksprung startet die
  // Frist neu (der vorige Timer wird über den Cleanup verworfen).
  useEffect(() => {
    if (!ziel) return;
    const t = window.setTimeout(() => { setzeRuecksprung(null); setZiel(null); }, LEBENSDAUER_MS);
    return () => window.clearTimeout(t);
  }, [ziel]);

  if (!ziel) return null;
  // Etikett wörtlich aus dem DOM (scrollAnker) — nie aus dem Token gebaut. Ist
  // keines lesbar, spricht der Chip neutral von der Leseposition (§8).
  const text = ziel.label ? `zurück zu ${ziel.label}` : 'zurück zur Leseposition';
  return (
    // `aria-live="polite"`: der Chip erscheint ohne Fokuswechsel, Screenreader
    // erfahren sonst nichts von ihm. Kein `role="alert"` — er unterbricht nicht.
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <button type="button" onClick={() => { if (!springeZurueck(ziel)) setZiel(null); }}
        // min-h-11 = 44 px Tap-Ziel (WCAG 2.5.8 / R6-Mass), auch auf dem Daumen
        // treffbar; `pointer-events-auto` holt die Klickbarkeit zurück, die der
        // Container abgeschaltet hat (der Streifen darf den Text nicht sperren).
        className="lc-btn-outline lc-btn-sm pointer-events-auto inline-flex min-h-11 items-center gap-1.5 rounded-full bg-paper-raised px-4 shadow-lg">
        <span aria-hidden>↩</span>{text}
      </button>
    </div>
  );
}
