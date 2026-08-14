// scripts/plan/buchung.ts — Kernlogik des Merge-Trailers `Roadmap-Status`
// (QS-PLAN-EINFACH, 14.8.2026, Punkt 1).
//
// ZWECK: Der Hand-Schritt «plan:set status=… + push» nach jeder Landung entfällt,
// wenn der Squash-Commit die Absicht schon trägt. Trailer-Konvention (ZUSÄTZLICH
// zum bestehenden `Roadmap: <ID>`, siehe scripts/plan/bildSeiten.ts Z. 166):
//
//   Roadmap-Status: done
//   Roadmap-Status: ready
//   Roadmap-Status: parked(<blocker-token>)
//
// Der Workflow `.github/workflows/plan-buchung.yml` kann diese Prüfung nicht
// lokal vorführen (kein `act`-Runner hier) — darum liegt die Trailer-Parse- und
// Validierungslogik hier als reine, mit Vitest getestete Funktion. Der Workflow
// ruft diese Datei als CLI auf; bei einem ungültigen Trailer wirft sie und
// beendet den Prozess mit Exit 1, BEVOR `npm run plan:set` je aufgerufen wird —
// kein unwahrer Buchungsversuch, kein Teil-Schreibzugriff auf ROADMAP.md (§6.7).
//
// ABSICHTLICH NICHT HIER GEPRÜFT: ob die ID tatsächlich in ROADMAP.md existiert.
// Das prüft `plan:set` bereits selbst (setField wirft `Schritt-id "…" nicht
// gefunden`, siehe set.ts) — eine zweite Prüfung derselben Regel wäre eine
// zweite Wahrheit (§5). «Unbekannte ID ⇒ Exit 1» ist damit über die bestehende
// Kette abgedeckt, sobald der Workflow `npm run plan:set` aufruft.
import { STATUS_WERTE, type Status } from './etikett';

// Nur diese drei Werte sind per Merge-Trailer buchbar. `wip`/`blocked` bleiben
// bewusst aussen vor: ein Merge nach main ist ein ABSCHLUSS-Ereignis, kein
// Zwischenstand — ein automatischer `wip`/`blocked`-Trailer hätte keine
// plausible Quelle (wer merged einen Schritt als "noch in Arbeit"?) und bleibt
// darum weiterhin nur von Hand über `npm run plan:set` setzbar.
const BUCHBARE_STATUS: readonly Status[] = ['done', 'ready', 'parked'];

export interface Buchung {
  id: string;
  status: Status;
  blocker: string | null;
}

/**
 * Parst den Wert des `Roadmap-Status`-Trailers. Wirft bei unbekanntem Status,
 * bei einem Klammer-Zusatz ausserhalb von `parked`, oder wenn `parked` OHNE
 * Blocker-Token kommt (die Roadmap kennt keinen "geparkt, aber warum"-Zustand —
 * FELDER-Kommentar in set.ts / check.ts Regel 3).
 */
export function parseStatusTrailer(wert: string): { status: Status; blocker: string | null } {
  const roh = wert.trim();
  const m = roh.match(/^(\w+)(?:\((.*)\))?$/);
  if (!m) {
    throw new Error(`Roadmap-Status: Wert unlesbar "${wert}" — erwartet "done" | "ready" | "parked(<token>)".`);
  }
  const [, statusRoh, blockerRoh] = m;
  if (!STATUS_WERTE.includes(statusRoh as Status) || !BUCHBARE_STATUS.includes(statusRoh as Status)) {
    throw new Error(
      `Roadmap-Status: ungültiger Wert "${statusRoh}" — per Merge-Trailer buchbar sind nur ` +
      `${BUCHBARE_STATUS.join('/')} (wip/blocked sind kein Merge-Ergebnis, weiterhin nur per ` +
      `'npm run plan:set' von Hand setzbar).`);
  }
  const status = statusRoh as Status;
  if (status === 'parked') {
    if (!blockerRoh || !blockerRoh.trim()) {
      throw new Error(
        `Roadmap-Status: "parked" verlangt ein Blocker-Token in Klammern, z. B. ` +
        `"Roadmap-Status: parked(a33-flake)".`);
    }
    return { status, blocker: blockerRoh.trim() };
  }
  if (blockerRoh !== undefined) {
    throw new Error(
      `Roadmap-Status: "${status}(${blockerRoh})" — der Klammer-Zusatz ist nur bei "parked" erlaubt.`);
  }
  return { status, blocker: null };
}

/**
 * Kombiniert die beiden Trailer-Werte (`Roadmap`, `Roadmap-Status`) zu einer
 * validierten Buchung. Der Workflow ruft diese Funktion nur auf, wenn BEIDE
 * Trailer im Head-Commit vorhanden sind — sie bleibt trotzdem defensiv gegen
 * einen leeren Trailer-WERT (`Roadmap:` ohne Inhalt ist für `git log
 * %(trailers:…)` ein vorhandener, aber leerer Treffer).
 */
// Enger Zeichensatz für ID und Blocker-Token (Gegenprüfungs-Befund 14.8.2026):
// die Werte stammen aus dem Commit-Text und fliessen in plan:set und die
// Commit-Message des Buchungs-Commits — Shell-Metazeichen (`$`, Backtick, `;`,
// Anführungszeichen …) haben in einer Schritt-ID nichts verloren und werden
// hart abgewiesen, BEVOR irgendetwas weiterläuft. Echte IDs: `W2·10-UI-NAV`,
// `QS-GP`; echte Tokens: `vps-bestellung-david`, `pr-451`.
const ID_RE = /^[A-Za-z0-9·.-]+$/;
const TOKEN_RE = /^[a-z0-9-]+$/;

export function parseBuchung(idTrailer: string, statusTrailer: string): Buchung {
  const id = idTrailer.trim();
  if (!id) throw new Error('Roadmap: Trailer ist leer — keine ID zum Buchen.');
  if (!ID_RE.test(id)) {
    throw new Error(`Roadmap: "${id}" enthält unerlaubte Zeichen (erlaubt: Buchstaben, Ziffern, ·, ., -).`);
  }
  const { status, blocker } = parseStatusTrailer(statusTrailer);
  if (blocker !== null && !TOKEN_RE.test(blocker)) {
    throw new Error(`Roadmap-Status: Blocker-Token "${blocker}" enthält unerlaubte Zeichen (erlaubt: a-z, 0-9, -).`);
  }
  return { id, status, blocker };
}

// CLI: vite-node scripts/plan/buchung.ts -- "<Roadmap-Trailer>" "<Roadmap-Status-Trailer>"
// Gibt bei Erfolg drei Zeilen im GITHUB_OUTPUT-Format aus (id=…/status=…/
// blocker=…, `blocker=` leer wenn keiner gesetzt ist) — der Workflow leitet
// stdout direkt in `$GITHUB_OUTPUT` um. Wirft (Exit 1) bei ungültiger Eingabe.
if (!process.env.VITEST) {
  const [idTrailer, statusTrailer] = process.argv.slice(2);
  if (!idTrailer || !statusTrailer) {
    console.error('Aufruf: vite-node scripts/plan/buchung.ts -- "<Roadmap>" "<Roadmap-Status>"');
    process.exit(2);
  }
  try {
    const b = parseBuchung(idTrailer, statusTrailer);
    console.log(`id=${b.id}`);
    console.log(`status=${b.status}`);
    console.log(`blocker=${b.blocker ?? ''}`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
