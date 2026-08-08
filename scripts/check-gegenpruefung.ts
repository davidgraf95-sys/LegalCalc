// scripts/check-gegenpruefung.ts
//
// Baustein a — Tor `check:gegenpruefung` (QS-GP). Eingehängt in die
// `npm run check`-Composite, die NUR `npm run gate` (Modus voll) lokal fährt —
// CI ruft die Checks namentlich auf und lässt diesen aus (ci.yml unverändert).
//
// Ablauf (Spec Z. 34-50):
//  1./2./3. Working-Tree-Diff ∩ Risiko-Globs ∖ Auto-Ausnahme → gemeinsame
//           Kernfunktion risikoDiffHash() (scripts/gegenpruefung/kern.ts).
//  4. Risiko-Menge leer → grün («nichts zu beweisen»).
//  5. sonst sha256 gegen bibliothek/.gegenpruefung-pending:
//        fehlt / Hash-Mismatch / verdikt ≠ bestanden → ROT (klare Meldung + Skill-Verweis).
//  6. CI-Selbstschutz / kein Git / kein HEAD → grün no-op (im Kern gekapselt).
//  7. WARN (blockiert nie): Register-Quelle-Pins, die laut fedlex-cache.sh überholt sind.
//
// ZWEITER EINGANG seit 8.8.2026 (QS-GP-BEREICH): dieselbe Prüfung läuft ein
// zweites Mal über den COMMITTETEN Bereich `merge-base(origin/main)..HEAD`
// (`risikoBereichHash()`). Grund: nach dem Commit ist der Working Tree sauber —
// das Tor konnte im Regelfall «Branch-Arbeit committet» nicht mehr scheitern
// (§6.7). Vorher-Beweis 8.8.2026: committete Änderung an src/lib/tarif/… bei
// sauberem Baum ⇒ «grün — keine Risiko-Datei … im Working-Tree geändert».
// Beide Eingänge werden gegen DIESELBE Pending-Datei geprüft (Hash-Gleichheit
// entscheidet, nicht der Eingang) — das Hash-Schema ist unverändert.
//
// ARBEITS-TEILUNG zu `check:merge-schutz` (ausführlich im Kopf von
// scripts/gegenpruefung/kern.ts): gleicher KLASSIFIZIERER `behalten()`, gleiche
// merge-base — aber verschiedene BEWEISFORM. merge-schutz (CI) verlangt
// committete, für Dritte sichtbare Artefakte (Trailer + Register-Wachstum);
// dieses Tor (nur lokal, CI-Selbstschutz) verlangt die inhaltsgebundene
// Pending-Quittung und meldet Sekunden statt Minuten. Keine doppelte Ladung.
// Die MENGEN sind nicht byte-identisch: merge-schutz diffft ohne `-z`/
// `--no-renames` und sieht Nicht-ASCII-Pfade gequotet sowie Renames als
// Zwei-Feld-Sätze — an diesen Kanten ist dieses Tor strenger als CI. Die
// Härtung von check-merge-schutz.ts ist ein eigener Plan-Schritt.
//
// WAS DIE QUITTUNG BINDET: Datei-Menge + Endinhalt am Branch-Kopf, NICHT die
// eingegebene Commit-Spanne (Auflage B1, Herleitung im Kopf von kern.ts).

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { risikoDiffHash, risikoBereichHash, type DiffErgebnis } from './gegenpruefung/kern';
import { lesePins } from './fedlex-pins';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PENDING = resolve(ROOT, 'bibliothek/.gegenpruefung-pending');
const REGISTER = resolve(ROOT, 'bibliothek/register/gegenpruefung-register.md');

export type Pending = {
  hash: string;
  verdikt: string;
  quellePin?: string;
  datum?: string;
  dateien?: string[];
  /** seit 8.8.2026: welcher Eingang quittiert wurde (Alt-Dateien: fehlt = 'baum'). */
  modus?: Eingang;
  /** nur Bereichs-Quittungen: die aufgelöste Bereichs-Referenz (Doku, nicht Prüfstoff). */
  bereich?: string;
  /** nur Bereichs-Quittungen: die rohe Nutzer-Eingabe (Doku, nicht Prüfstoff). */
  bereichEingabe?: string;
  /** nur Bereichs-Quittungen: Klartext, was der Hash effektiv deckt (Doku). */
  deckung?: string;
};

/** Pending-Datei seit 8.8.2026: Liste (ein Eintrag je Eingang). Alt-Form = ein Objekt. */
export type PendingDatei = { eintraege: Pending[] };

export type Eingang = 'baum' | 'bereich';

const EINGANG_TEXT: Record<Eingang, string> = {
  baum: 'im Working-Tree',
  bereich: 'im committeten Bereich',
};

/** Alt-Form (ein Objekt) und Neu-Form (Liste) auf dieselbe Liste bringen. */
export function alsListe(p: Pending | Pending[] | PendingDatei | null | undefined): Pending[] {
  if (!p) return [];
  if (Array.isArray(p)) return p;
  if ('eintraege' in p) return Array.isArray(p.eintraege) ? p.eintraege : [];
  return p.hash ? [p] : [];
}

function rotText(grund: string, dateien: string[], eingang: Eingang, bereich?: string): string {
  const wieQuittieren =
    eingang === 'bereich'
      ? `  »bestanden« quittiert der Skill mit  npm run gegenpruefung:ok -- --bereich${bereich ? `=${bereich}` : ''}`
      : '  »bestanden« quittiert der Skill mit  npm run gegenpruefung:ok';
  return [
    `check:gegenpruefung ROT — ${grund}`,
    `  Betroffene Risiko-Dateien (Rechnen/Extraktion/Norm-Tarif) ${EINGANG_TEXT[eingang]}${
      eingang === 'bereich' && bereich ? ` ${bereich}` : ''
    }:`,
    ...dateien.map((d) => `    - ${d}`),
    '  → Adversariale Gegenprüfung fahren: Skill »gegenpruefung« (unabhängiger Opus-Agent,',
    '    frischer Kontext, Output gegen die amtliche Quelle WIDERLEGEN). Bei Verdikt',
    wieQuittieren,
    '    — das bindet den Nachweis an genau diesen Diff (bibliothek/.gegenpruefung-pending).',
    ...(eingang === 'bereich'
      ? [
          '  Die Quittung bindet die oben gelisteten DATEIEN und ihren Endinhalt am',
          '    Branch-Kopf — NICHT die angegebene Commit-Spanne. Eine engere Spanne mit',
          '    derselben Datei-Menge deckt darum denselben Nachweis ab.',
          '  Rückfall unverändert: Hand-Hash nach dem risikoDiffHash-Schema ins Register',
          '    (pfad NUL art NUL sha256(Blob@HEAD) NUL, byte-sortiert) — dasselbe Schema.',
        ]
      : []),
  ].join('\n');
}

/**
 * Reine Entscheidung (testbar): aus Diff-Ergebnis + Pending-Liste → grün/rot + Meldung.
 * `eingang` wählt nur die Texte — die Prüfung ist für beide Eingänge identisch
 * (Hash-Gleichheit + Verdikt «bestanden»); das ist der Punkt des «zweiten
 * Eingangs»: EIN Schema, zwei Diff-Quellen.
 */
export function bewerte(
  r: DiffErgebnis,
  pending: Pending | Pending[] | PendingDatei | null,
  eingang: Eingang = 'baum',
): { gruen: boolean; meldung: string } {
  const eintraege = alsListe(pending);
  if (eingang === 'bereich') return bewerteBereich(r, eintraege);
  if (!r.kontext) {
    // §6 Ziff. 7 lit. b: kein stilles Grün bei fehlender Voraussetzung.
    // Bis 20.7.2026 stand hier «grün — no-op (CI oder kein Git/HEAD)» — ein
    // Grün-Exit, der zwei verschiedene Ursachen in einem Satz vermischte und
    // damit genau die Regel verletzte, die dieser PR eingeführt hat.
    // Jetzt: ausdrücklicher SKIP mit benannter Ursache und benanntem Arbiter.
    return r.grund === 'kein-git'
      ? {
          gruen: true,
          meldung:
            'check:gegenpruefung SKIP — kein Git-Kontext (kein toplevel oder kein HEAD). ' +
            'Das Tor kann seinen Diff nicht bilden und trifft KEINE Aussage über den Stand.',
        }
      : {
          gruen: true,
          meldung:
            'check:gegenpruefung SKIP — CI-Selbstschutz: dieses Tor liest den Working Tree, ' +
            'der in CI per Definition sauber ist. Arbiter für den committeten Bereich ist ' +
            'check:merge-schutz (in ci.yml verdrahtet). KEINE Aussage über den Stand.',
        };
  }
  if (r.hash === null) {
    return {
      gruen: true,
      meldung: 'check:gegenpruefung grün — keine Risiko-Datei (Rechnen/Extraktion/Norm-Tarif) im Working-Tree geändert.',
    };
  }
  return quittungPruefen(r, eintraege, 'baum');
}

/**
 * Gemeinsamer Quittungs-Teil beider Eingänge: Nachweis vorhanden? Hash passend?
 * Verdikt «bestanden»? Die Pending-Datei trägt seit 8.8.2026 eine LISTE (ein
 * Eintrag je Eingang) — massgeblich ist allein der Hash, nicht der Listenplatz.
 */
function quittungPruefen(
  r: DiffErgebnis,
  eintraege: Pending[],
  eingang: Eingang,
): { gruen: boolean; meldung: string } {
  const hash = r.hash as string;
  if (eintraege.length === 0) {
    return {
      gruen: false,
      meldung: rotText(
        'kein Gegenprüfungs-Nachweis (bibliothek/.gegenpruefung-pending fehlt).',
        r.dateien,
        eingang,
        r.bereich,
      ),
    };
  }
  const passend = eintraege.filter((p) => p.hash === hash);
  if (passend.length === 0) {
    // B3 — Diagnose-Ehrlichkeit (Auflage 8.8.2026): «Hash-Mismatch — Dateien
    // nach der Quittung geändert?» ist eine BEHAUPTUNG über die Vorgeschichte.
    // Sie stimmt nur, wenn für DIESEN Eingang überhaupt je quittiert wurde.
    // Lag bloss eine Quittung des anderen Eingangs (oder ein Alt-Eintrag ohne
    // `modus`) vor, schickte die Meldung den Leser auf die falsche Fährte — er
    // sucht eine Byte-Änderung, die es nie gab. Belegt: die bis 8.8.2026
    // getrackte Alt-Pending-Datei (B2) erzeugte genau diese Fehl-Diagnose in
    // jedem frischen Worktree.
    const eigene = eintraege.filter((p) => (p.modus ?? 'baum') === eingang);
    return {
      gruen: false,
      meldung: rotText(
        eigene.length === 0
          ? `kein Nachweis für diesen Eingang (${eingang === 'bereich' ? 'committeter Bereich' : 'Working Tree'}) — ` +
            `${eintraege.length} Quittung(en) vorhanden, aber keine für ihn.`
          : 'der Nachweis passt nicht zum aktuellen Diff (Hash-Mismatch — Dateien nach der Quittung geändert?).',
        r.dateien,
        eingang,
        r.bereich,
      ),
    };
  }
  if (!passend.some((p) => p.verdikt === 'bestanden')) {
    return {
      gruen: false,
      meldung: rotText(
        `Nachweis-Verdikt ist «${passend[0].verdikt}», nicht «bestanden».`,
        r.dateien,
        eingang,
        r.bereich,
      ),
    };
  }
  return {
    gruen: true,
    meldung:
      eingang === 'bereich'
        ? `check:gegenpruefung grün — committeter Bereich ${r.bereich ?? ''}: Gegenprüfung bestanden, ` +
          `an Diff-Hash gebunden (${hash.slice(0, 12)}…, ${r.dateien.length} Datei(en); der Hash bindet ` +
          `Datei-Menge + Endinhalt, nicht die Spanne).`
        : `check:gegenpruefung grün — Gegenprüfung bestanden, an Diff-Hash gebunden (${hash.slice(0, 12)}…).`,
  };
}

/** Zweiter Eingang: derselbe Nachweis, gebildet über merge-base(origin/main)..HEAD. */
export function bewerteBereich(
  r: DiffErgebnis,
  pending: Pending | Pending[] | PendingDatei | null,
): { gruen: boolean; meldung: string } {
  const eintraege = alsListe(pending);
  if (!r.kontext) {
    // §6 Ziff. 7 lit. b — kein stilles Grün, immer mit benannter Ursache und Arbiter.
    const grundText: Record<string, string> = {
      'ci-selbstschutz':
        'CI-Selbstschutz: der committete Bereich wird in CI von check:merge-schutz geprüft ' +
        '(Trailer + Register-Wachstum); die lokale Pending-Quittung existiert dort nicht.',
      'kein-git': 'kein Git-Kontext (kein toplevel oder kein HEAD).',
      'keine-basis':
        `Basis «${r.bereich ?? 'origin/main..HEAD'}» nicht auflösbar (kein Remote / vor dem ersten ` +
        'git fetch). Arbiter bleibt check:merge-schutz, das in diesem Fall ROT wird.',
    };
    return {
      gruen: true,
      meldung:
        `check:gegenpruefung SKIP (committeter Bereich) — ${grundText[r.grund ?? 'kein-git'] ?? 'unbekannte Ursache.'} ` +
        'KEINE Aussage über den Stand.',
    };
  }
  if (r.hash === null) {
    return {
      gruen: true,
      meldung: `check:gegenpruefung grün — keine Risiko-Datei im committeten Bereich ${r.bereich ?? ''} geändert.`,
    };
  }
  return quittungPruefen(r, eintraege, 'bereich');
}

/**
 * WARN (best-effort, OFFLINE, blockiert NIE): Register-Einträge, deren Quelle-Pin
 * älter ist als der aktuell in scripts/fedlex-cache.sh gepinnte Stand → «neu fällig».
 * Kein Netz-Call (check:fedlex-versionen bleibt der Netz-Arbiter in check:netz).
 */
export function warnUeberholtePins(): void {
  try {
    if (!existsSync(REGISTER)) return;
    const pinDatum = new Map<string, string>(); // name → YYYYMMDD
    for (const p of lesePins()) pinDatum.set(p.name, p.kons.replace(/-/g, ''));
    const md = readFileSync(REGISTER, 'utf8');
    for (const zeile of md.split('\n')) {
      if (!zeile.trimStart().startsWith('|')) continue;
      const zellen = zeile.split('|').map((s) => s.trim());
      // Spalten: |Datum|Snapshot/Engine|Diff-Hash|Verdikt|Quelle-Pin|Beleg| → Quelle-Pin = Index 5
      const quellePin = zellen[5];
      if (!quellePin) continue;
      const m = /^fedlex\s+([a-z_]+)\s+(\d{8})$/i.exec(quellePin);
      if (!m) continue;
      const cacheDatum = pinDatum.get(m[1].toLowerCase());
      if (cacheDatum && cacheDatum > m[2]) {
        console.error(
          `WARN check:gegenpruefung: Quelle-Pin «${quellePin}» überholt — fedlex-cache.sh pinnt ${m[1].toLowerCase()} auf ${cacheDatum} → Gegenprüfung neu fällig (Burn-down).`,
        );
      }
    }
  } catch {
    // WARN darf das Gate niemals blockieren.
  }
}

export function lesePending(): Pending[] {
  if (!existsSync(PENDING)) return [];
  try {
    return alsListe(JSON.parse(readFileSync(PENDING, 'utf8')) as Pending | PendingDatei);
  } catch {
    return []; // korruptes Pending = kein gültiger Nachweis → rot
  }
}

// ─── CLI ────────────────────────────────────────────────────────────────────
if (!process.env.VITEST) {
  const eintraege = lesePending();
  // Beide Eingänge laufen IMMER und werden BEIDE gemeldet — auch wenn der erste
  // schon rot ist. Wer nur die erste Meldung sähe, würde den zweiten Befund erst
  // in der nächsten Runde entdecken (das kostet genau die Zyklen, die dieser
  // Schritt einsparen soll).
  const a = bewerte(risikoDiffHash(), eintraege, 'baum');
  const b = bewerteBereich(risikoBereichHash(), eintraege);
  warnUeberholtePins(); // best-effort, blockiert nie
  for (const { gruen, meldung } of [a, b]) (gruen ? console.log : console.error)(meldung);
  process.exit(a.gruen && b.gruen ? 0 : 1);
}
