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

// ---------------------------------------------------------------------------
// FALLBACK (Lehre 14.8.2026, real bei PR #491): GitHub Auto-Merge nimmt bei
// einem Squash mit MEHREREN Commits den Standard-Text — nur die verketteten
// Commit-SUBJECTS, endet auf "Co-authored-by". Ein Trailer, der nur im BODY
// eines Zwischen-Commits stand, erreicht den Squash-Commit dann nie; der
// Buchungs-Workflow blieb (korrekt fail-safe) still, die Buchung musste von
// Hand nachgezogen werden.
//
// Ersatzweise wird die Buchungs-Absicht aus dem PR-BODY gelesen — dort steht
// sie unverändert, unabhängig davon, was GitHub in den Squash-Commit kopiert.
// PR-Body ist FREMDTEXT (Daten, nie Code, §14.7 Dispatch-Klausel): er wird wie
// eine Commit-Message als Trailer-Block interpretiert (git-Konvention: der
// LETZTE durch eine Leerzeile abgetrennte Absatz, und zwar nur, wenn WIRKLICH
// jede Zeile darin dem Muster "Key: value" folgt — sonst ist es Fliesstext,
// kein Trailer, und es wird nichts gebucht). Gefundene Werte laufen exakt durch
// dieselbe Zeichensatz-Wache (`parseBuchung` → `ID_RE`/`TOKEN_RE`) wie
// Commit-Trailer; ein Injection-Versuch im Blocker-Token oder in der ID wird
// dadurch genauso hart abgewiesen. Priorität: Commit-Trailer schlägt PR-Body
// (der Workflow ruft diesen Fallback nur auf, wenn der Commit-Trailer fehlte).
const TRAILER_LINE_RE = /^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/;

/**
 * Interpretiert den letzten Absatz von `text` als Git-Trailer-Block: nur wenn
 * JEDE nicht-leere Zeile darin "Key: value" ist, werden die Paare
 * zurückgegeben — sonst ein leeres Objekt (kein Trailer-Block gefunden, das
 * ist der Normalfall bei einer gewöhnlichen PR-Beschreibung ohne Buchungs-
 * Absicht). Mehrfache Vorkommen desselben Keys: der letzte gewinnt (wie
 * `git interpret-trailers`).
 */
export function extractTrailerBlock(text: string): Record<string, string> {
  const trimmed = text.trim();
  if (!trimmed) return {};
  const absaetze = trimmed.split(/\n\s*\n/);
  const letzter = absaetze[absaetze.length - 1];
  const zeilen = letzter.split('\n').map((z) => z.trim()).filter((z) => z.length > 0);
  if (zeilen.length === 0) return {};
  const ergebnis: Record<string, string> = {};
  for (const zeile of zeilen) {
    const m = zeile.match(TRAILER_LINE_RE);
    if (!m) return {}; // Absatz enthält eine Nicht-Trailer-Zeile -> kein Trailer-Block
    ergebnis[m[1]] = m[2].trim();
  }
  return ergebnis;
}

/**
 * Liest die Buchungs-Trailer ersatzweise aus einem PR-Body. Gibt `null`
 * zurück, wenn dort kein vollständiger Trailer-Block steht (stiller
 * Normalfall, §6.7 kein Rot). Steht ein Trailer-Block da, aber mit ungültigem
 * Wert oder verbotenen Zeichen, wirft diese Funktion — wie `parseBuchung` —
 * und der Aufrufer (CLI unten) beendet den Prozess mit Exit 1: ein erkannter,
 * aber kaputter/bösartiger Buchungsversuch darf nie still verpuffen.
 */
export function parseBuchungAusPrBody(body: string): Buchung | null {
  const block = extractTrailerBlock(body);
  const roadmap = block['Roadmap'];
  const status = block['Roadmap-Status'];
  if (!roadmap || !status) return null;
  return parseBuchung(roadmap, status);
}

// CLI, zwei Modi:
//   vite-node scripts/plan/buchung.ts -- "<Roadmap-Trailer>" "<Roadmap-Status-Trailer>"
//     Commit-Trailer-Pfad (unverändert). Gibt bei Erfolg drei Zeilen im
//     GITHUB_OUTPUT-Format aus (id=…/status=…/blocker=…) und wirft (Exit 1)
//     bei ungültiger Eingabe.
//   vite-node scripts/plan/buchung.ts --pr-body   (Body auf STDIN)
//     PR-Body-Fallback. Kein Trailer-Block im Body -> Exit 0 OHNE Ausgabe
//     (still, wie der Normalfall). Trailer-Block vorhanden, aber ungültig/
//     Injection-Versuch -> Exit 1, wie oben.
if (!process.env.VITEST) {
  const mode = process.argv[2];
  if (mode === '--pr-body') {
    void (async () => {
      let body = '';
      process.stdin.setEncoding('utf8');
      for await (const chunk of process.stdin) body += chunk;
      try {
        const b = parseBuchungAusPrBody(body);
        if (b) {
          console.log(`id=${b.id}`);
          console.log(`status=${b.status}`);
          console.log(`blocker=${b.blocker ?? ''}`);
        }
        // kein Trailer-Block im PR-Body: bewusst keine Ausgabe, Exit 0 (still).
      } catch (e) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
      }
    })();
  } else {
    const [idTrailer, statusTrailer] = process.argv.slice(2);
    if (!idTrailer || !statusTrailer) {
      console.error('Aufruf: vite-node scripts/plan/buchung.ts -- "<Roadmap>" "<Roadmap-Status>"');
      console.error('   oder: vite-node scripts/plan/buchung.ts --pr-body   (Body auf STDIN)');
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
}
