/**
 * Testbindung der Cache-Inhalts-Sonde `cacheBefund` (QS-CURRENCY-TESTS).
 *
 * ANLASS. Gegenprüfung zu PR #420, Befund 1 (TESTLÜCKE): die am 3.8.2026
 * eingebaute Sonde in `scripts/normtext-snapshot.ts` hing an KEINEM Test — wer
 * sie entfernt hätte, hätte kein Tor rot gemacht (§6.7: ein Tor, das nicht
 * scheitern kann, ist gefährlicher als keines).
 *
 * WAS DIE SONDE ABWEHRT. Bis 3.8.2026 prüfte `sicherstelleCaches` nur
 * `existsSync`. Eine als Datei abgelegte Soft-404-Angular-Shell des Fedlex-
 * Filestore (HTTP 200, ~9 kB, kein Normtext) galt damit als gültiger Cache —
 * der Snapshot wäre aus einer leeren SPA-Hülle gebaut worden, statt laut zu
 * scheitern. Scraping-Fakt: nach dem BODY urteilen, nie nach dem Status.
 *
 * KEIN NETZ, KEIN PIN. Alle Fixtures sind synthetisch und werden in einem
 * eigenen /tmp-Namensraum angelegt und wieder entfernt. Dieser Test ändert
 * keinen Pin und keinen Snapshot (Risikopfad-Anteil liegt in
 * QS-CURRENCY-KANON, Fahrplan FEDLEX-PORTFOLIO §17).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { cacheBefund } from '../../scripts/normtext-snapshot';

// `cacheBefund(name)` liest fest `/tmp/${name}.html`. Damit parallele Sessions
// (§12-Worktrees) sich nicht gegenseitig die Fixtures überschreiben, trägt
// jeder Name die PID; die URTEILE bleiben davon unberührt (§2 Determinismus).
let n = 0;
const angelegt: string[] = [];
function fixture(inhalt: string): string {
  const name = `lexmetrik-cachebefund-${process.pid}-${n++}`;
  const pfad = `/tmp/${name}.html`;
  writeFileSync(pfad, inhalt, 'utf8');
  angelegt.push(pfad);
  return name;
}

afterEach(() => {
  for (const p of angelegt.splice(0)) rmSync(p, { force: true, recursive: true });
});

/** Füllt auf exakt `bytes` Gesamtgrösse auf (ASCII → 1 Byte je Zeichen). */
function fuelle(kern: string, bytes: number): string {
  return kern + 'x'.repeat(Math.max(0, bytes - Buffer.byteLength(kern, 'utf8')));
}

const ANKER = '<p id="art_1">Art. 1</p>';
// Die echte Soft-404-Hülle des Fedlex-Filestore (Merkmale aus dem Live-Abruf
// vom 3.8.2026: HTTP 200, Casemates-Titel, Angular-Wurzel, kein Normtext).
const SHELL = '<html><head><title>Casemates</title></head><body><app-root ng-version="15.2.9"></app-root></body></html>';

describe('cacheBefund — Kernfälle', () => {
  it('fehlende Datei ist kein gültiger Cache', () => {
    expect(cacheBefund(`lexmetrik-cachebefund-${process.pid}-gibtsnicht`)).toEqual({
      ok: false, grund: 'fehlt',
    });
  });

  it('echter Normtext-Dump wird angenommen', () => {
    const b = cacheBefund(fixture(fuelle(`<html><body>${ANKER}`, 500_000)));
    expect(b).toEqual({ ok: true });
  });

  it('Soft-404: die Angular-Shell wird abgewiesen, obwohl sie gross genug ist', () => {
    // Der schärfste Fall: die Hülle ist auf 60 kB aufgeblasen UND trägt einen
    // art_-Anker — nur der Shell-Marker kann sie noch abweisen. So ist bewiesen,
    // dass die Abweisung am MARKER hängt und nicht an der Grösse.
    const b = cacheBefund(fixture(fuelle(SHELL + ANKER, 60_000)));
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('SOFT-404');
  });

  it('zu kleine Datei wird abgewiesen (Fehlerseite statt Erlass)', () => {
    const b = cacheBefund(fixture(fuelle(`<html><body>${ANKER}`, 9_148)));
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('9148 B < 20000 B');
  });

  it('grosser Dump ohne art_/annex_/lvl_-Anker wird abgewiesen (verstümmelt)', () => {
    const b = cacheBefund(fixture(fuelle('<html><body><p>Text ohne jeden Anker</p>', 400_000)));
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('keine art_/annex_/lvl_-Anker');
  });
});

describe('cacheBefund — Randfälle', () => {
  it('Grössen-Schwelle greift exakt bei 20 000 B (19 999 rot, 20 000 grün)', () => {
    const knappDrunter = cacheBefund(fixture(fuelle(`<html>${ANKER}`, 19_999)));
    expect(knappDrunter.ok).toBe(false);
    expect(knappDrunter.grund).toContain('19999 B < 20000 B');
    expect(cacheBefund(fixture(fuelle(`<html>${ANKER}`, 20_000)))).toEqual({ ok: true });
  });

  it('annex_- und lvl_-Anker tragen den Befund ebenso wie art_', () => {
    // Anhang-Erlasse (Tarife, Anhänge ohne Artikel) haben KEIN art_ — würde die
    // Sonde nur auf art_ prüfen, wären sie falsch-positiv rot.
    expect(cacheBefund(fixture(fuelle('<html><div id="annex_1">Anhang</div>', 50_000)))).toEqual({ ok: true });
    expect(cacheBefund(fixture(fuelle('<html><div id="lvl_A">Abschnitt</div>', 50_000)))).toEqual({ ok: true });
  });

  it('zweite Shell-Signatur (ng-version ohne Casemates-Titel) wird ebenfalls abgewiesen', () => {
    const b = cacheBefund(fixture(fuelle(`<html><body ng-version="17.0.1">${ANKER}`, 80_000)));
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('SOFT-404');
  });

  it('unlesbarer Pfad (Verzeichnis statt Datei) wird abgewiesen, nicht geworfen', () => {
    // Ein `throw` aus cacheBefund würde sicherstelleCaches abbrechen, bevor die
    // sprechende BLOCKED-Meldung entsteht — der Befund muss ein Wert bleiben.
    const name = `lexmetrik-cachebefund-${process.pid}-${n++}`;
    const pfad = `/tmp/${name}.html`;
    mkdirSync(pfad, { recursive: true });
    angelegt.push(pfad);
    const b = cacheBefund(name);
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('unlesbar');
  });

  it('Byte-Zählung, nicht Zeichen-Zählung (mehrbyteiger Inhalt)', () => {
    // 19 000 Umlaute = 38 000 Bytes: zeichenweise wäre die Datei «zu klein»,
    // bytewise ist sie es nicht. readFileSync/Buffer.byteLength müssen einig sein.
    const inhalt = `<html>${ANKER}` + 'ä'.repeat(19_000);
    expect(Buffer.byteLength(inhalt, 'utf8')).toBeGreaterThan(20_000);
    expect(inhalt.length).toBeLessThan(20_000);
    expect(cacheBefund(fixture(inhalt))).toEqual({ ok: true });
  });
});
