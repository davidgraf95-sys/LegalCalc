import type { ReactNode } from 'react';
import { zaehlform, type BestimmungsWort } from './erlassAnsicht';

// ═══ Ä19 (H2b) · DIE KLEBENDE SUCH-ZONE DES KOPF-BLOCKS ═════════════════════
//
// BEFUND, gemessen 17.8.2026 im Split @1440: `[data-v3-suchsprung] input`
// **count === 0**. Die Panes sind 590 px breit, unterschreiten also die
// xl-Schwelle; die Seitenleiste ist dort ein Bottom-Sheet, und das Such-/
// Sprungfeld lebte ausschliesslich darin. Wer im Split suchen wollte, musste ein
// Blatt öffnen, das das Pane vollständig verdeckt — man suchte im Text, den man
// dabei nicht mehr sah. V1 hat je Pane ein Feld; V3 hatte keines. Derselbe
// Mangel traf das Handy und, unbemerkt, den Desktop mit EINGEKLAPPTER Gliederung.
//
// DIE REGEL, die daraus folgt (und die Kap. 4b für die Spalte schon setzt):
// **Das Such-/Sprungfeld ist auf JEDER Breite das oberste Element des klebenden
// Blocks.** Welcher Block das ist, hängt allein davon ab, ob die Gliederung als
// Spalte steht:
//
//   Spalte da     → klebender Block der Seitenleiste  (Kap. 4b, unverändert)
//   keine Spalte  → klebender Block der Kopfzeile     (diese Zone)
//
// Damit gibt es weiterhin GENAU EIN Feld im DOM, es ist ohne Geste erreichbar,
// und es verdeckt keinen Text: die Zone ist Teil des Chromes, das ohnehin klebt.
// Das Blatt bleibt für die Trefferliste zuständig und trägt kein zweites Feld.
//
// DEKLARIERTE PRÄZISIERUNG von Kap. 4a («die Kopfzeile trägt kein Suchfeld»):
// die Kopf-ZEILE trägt weiterhin keines — ihre Element-Zahl ist unverändert
// (Design-Grundlage Kap. 6, ≤ 4 Elemente, davon ≤ 2 reine Icons). Der klebende
// Kopf-BLOCK bekommt eine zweite Zeile, und zwar nur dort, wo es sonst überhaupt
// kein erreichbares Feld gäbe. Kap. 4a hat diese Lage nicht bedacht; Ä19 ist der
// Befund dazu, und er ist der gewichtigste des Ästhetik-Reviews H1.
//
// HÖHE: der Rahmen legt sie als `--leser-v3-such-h` aus, mit ZWEI festen Werten
// statt einer Messung — `--nt-stick` (Sprung-Offset der Anker) rechnet die Zone
// mit, und eine gemessene Höhe wäre eine zweite Geometrie-Quelle neben der
// Kopfhöhe (Lehre LM-003). Die Zone wächst genau dann, wenn eine Suche läuft,
// und das ist eine Tastatur-Eingabe (CLS-exkludiert, §15.2).
//
// §3: reine Anordnung. Die Zone kennt weder Erlass noch Suchmaschine — Feld und
// Zahlen kommen fertig herein, der Weg zur Liste ist ein Callback.

// ── B9 (H2b-Nachzug) · DIE HÖHE STEHT DORT, WO DAS MARKUP STEHT ──────────────
//
// BEFUND (Architektur-Review 17.8.2026, Position 3): die zwei Höhenwerte lagen
// als Zahlen-Literale im RAHMEN (`LeserRahmenV3.tsx`, `'4.25rem'`/`'2.75rem'`),
// das Markup, dessen Höhe sie behaupten, liegt HIER — und kein Wächter verband
// beides. Wer der Zone eine Zeile hinzufügt oder ihr Polster ändert, verstellt
// still den Sprung-Offset aller Anker (`--nt-stick` rechnet die Zone mit). Genau
// diese Klasse hat LM-003 einmal gekostet.
//
// JETZT: die Werte gehören der Zone und werden vom Rahmen IMPORTIERT — eine
// Quelle, an derselben Stelle wie das Markup. Der Vertrag ist gemessen bewacht:
// `e2e/leser-v3-suchfeld-ueberall.e2e.ts` (e) vergleicht die tatsächliche
// Element-Höhe mit dem Wert der Variable, im Ruhezustand UND mit laufender Suche.
/** Höhe der Zone, solange keine Suche läuft (nur das Feld: 32 px + 8 px `pb-2`). */
export const SUCH_H_RUHE = '2.75rem';
/** Höhe mit laufender Suche (Feld + Zähler-Zeile `min-h-5` + `gap-1`). */
export const SUCH_H_AKTIV = '4.25rem';

export function SuchZone({
  suchFeld, sucheAktiv, bestimmungen, fundstellen, bestimmungsWort, onListe, blatt,
}: {
  /** Das Such-/Sprungfeld. Oberstes Element — das ist die ganze Zusage (Ä19).
   *
   *  A2 (H2b-Nachzug): `undefined`, solange das Bottom-Sheet offen ist. Das Feld
   *  steht dann IM Blatt (dort ist es fokussierbar, dort greift Esc auf den
   *  Dialog); die Zone bleibt mit UNVERÄNDERTER Höhe stehen, damit das Chrome
   *  hinter dem Overlay nichts verschiebt. Es gibt weiterhin genau EIN Feld im
   *  DOM — die Zone gibt es her, das Blatt nimmt es (§5/K2). */
  suchFeld?: ReactNode;
  /** Läuft gerade eine Suche? Nur dann gibt es etwas zu berichten. */
  sucheAktiv: boolean;
  /** Getroffene Bestimmungen (Artikel bzw. Paragraphen). */
  bestimmungen: number;
  /** Fundstellen darin — dieselben Zahlen wie im Kopf der Trefferliste (§5). */
  fundstellen: number;
  /** Zähl-Substantiv aus dem Datenmodell (Ä23) — nie ein Bund-Vorgabewert.
   *  B8: Typ und Zählform aus `./erlassAnsicht` (eine Quelle). */
  bestimmungsWort: BestimmungsWort;
  /** Weg zur vollen Trefferliste: Blatt am Feld öffnen bzw. Bottom-Sheet. */
  onListe: () => void;
  /** ── Ä70 (17.8.2026) · DIE TREFFERLISTE, ANGEHÄNGT AN DIESE ZONE ───────────
   *  Gesetzt, wo die Gliederung als Spalte fehlt, aber Platz neben dem Text ist
   *  (Desktop mit eingeklappter Spalte) — dann liegt die Liste als Blatt DIREKT
   *  unter dem Feld statt inline über dem Lesetext, wo sie 3596 px hoch unter der
   *  Falz verschwand (Befund und Messreihe: `./LeserTrefferBlatt`).
   *  Es hängt an DIESER Zone, weil «die Liste steht, wo das Feld steht» die eine
   *  Regel ist, die Ä19 für alle Breiten gesetzt hat — und weil die Zone das
   *  einzige Element ist, das in JEDER Lage ohne Spalte klebt. */
  blatt?: ReactNode;
}) {
  return (
    // `relative`: der Bezugsrahmen des Blattes (`absolute top-full`). Es nimmt
    // keinen Platz — die Zonen-Höhe bleibt allein `--leser-v3-such-h`, und die
    // Höhen-Konstanten oben behalten ihre Gültigkeit (B9-Wächter unberührt).
    <div data-v3-such-zone className="relative flex flex-col justify-start gap-1 pb-2"
      style={{ height: 'var(--leser-v3-such-h)' }}>
      {suchFeld}
      {sucheAktiv && (
        // §8: die Zahl steht dran, und der Weg zur Liste ist BENANNT statt als ☰
        // zu erraten — genau das war der zweite Teil des Ä19-Befunds («das
        // geöffnete Blatt verdeckt das Pane»): der Leser soll selbst entscheiden,
        // ob er die Liste sehen will. Kein zweiter Zähler: dieselben Werte wie im
        // Listenkopf, aus derselben Quelle (§5).
        <button type="button" data-v3-treffer-weg onClick={onListe}
          className="flex min-h-5 w-full items-center gap-1 rounded-sm text-left text-micro text-ink-600 transition-colors hover:text-brass-700">
          <span className="num">{bestimmungen}</span>
          <span>{zaehlform(bestimmungen, bestimmungsWort)}</span>
          <span aria-hidden className="text-ink-300">·</span>
          <span className="num">{fundstellen}</span>
          <span>{fundstellen === 1 ? 'Fundstelle' : 'Fundstellen'}</span>
          <span aria-hidden className="ml-auto shrink-0">Treffer anzeigen →</span>
        </button>
      )}
      {blatt}
    </div>
  );
}
