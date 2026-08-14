// src/tests/plan-groesse.test.ts — das optionale @meta-Feld `groesse` (S/M/L),
// Auftrag David 5.8.2026: «nicht zu grosse oder kleine nehmen».
//
// Das Feld ist eine SCHÄTZHILFE, kein Tor-Kriterium. Genau daraus folgen die vier
// Eigenschaften, die hier geprüft werden — jede davon war eine bewusste
// Entwurfsentscheidung und nicht bloss Implementierungsdetail:
//   1. Fehlen ist zulässig (Bestandsschonung; §8: die Anzeige rät nicht).
//   2. `parseEtikett` wirft bei unbekanntem Wert NICHT — sonst brächte ein
//      Tippfehler in einer Lese-Hilfe die ganze Plan-Werkzeugkette zum Absturz.
//   3. Dafür meldet ihn `check:plan` Regel 12 als EINE benannte Meldung (§6.7 —
//      ein Tor, das nicht scheitern kann, ist gefährlicher als keines).
//   4. Der Round-Trip bleibt byte-gleich, sonst erzeugt jedes `plan:set`
//      Diff-Rauschen in der ROADMAP (dieselbe Falle wie bei `seq-hart`, R2-16).
import { readFileSync } from 'node:fs';
import { GROESSE_WERTE, istGroesse, parseEtikett, serializeEtikett } from '../../scripts/plan/etikett';
import { pruefe } from '../../scripts/plan/check';
import { groesseBadge } from '../../scripts/plan/bildHtml';
import { bauPrompt } from '../../scripts/plan/bildSeiten';
import type { Etikett } from '../../scripts/plan/etikett';
import type { Einheit } from '../../scripts/plan/parse';
import type { SchrittInfo } from '../../scripts/plan/bildDaten';

const OHNE = '  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-X.md -->';
const MIT = '  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-X.md -->';

describe('Etikett-Feld `groesse` — Parsen und Serialisieren', () => {
  it('liest S/M/L', () => {
    for (const g of GROESSE_WERTE) {
      expect(parseEtikett(MIT.replace('groesse: L', `groesse: ${g}`)).groesse).toBe(g);
    }
  });

  it('fehlendes Feld → null (Bestandsschonung: kein Pflichtfeld)', () => {
    expect(parseEtikett(OHNE).groesse).toBeNull();
  });

  it('unbekanntes Vokabular wirft NICHT — es ist eine Lese-Hilfe, kein Steuerfeld', () => {
    expect(() => parseEtikett(MIT.replace('groesse: L', 'groesse: XL'))).not.toThrow();
    expect(parseEtikett(MIT.replace('groesse: L', 'groesse: XL')).groesse).toBe('XL');
  });

  it('Round-Trip byte-gleich — mit und ohne Feld (sonst Diff-Rauschen bei jedem plan:set)', () => {
    expect(serializeEtikett(parseEtikett(MIT), '  ')).toBe(MIT);
    expect(serializeEtikett(parseEtikett(OHNE), '  ')).toBe(OHNE);
  });

  it('istGroesse trennt gültig von ungültig', () => {
    expect(istGroesse('M')).toBe(true);
    expect(istGroesse('XL')).toBe(false);
    expect(istGroesse(null)).toBe(false);
  });
});

// --- check:plan Regel 12 -----------------------------------------------------
const PLAN = `## Die geordnete Abarbeitung
<!-- @blockers
-->
- [ ] **6 · A**
  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->

Siehe FAHRPLAN-PLAN-STEUERUNG.md.
`;
const INV = ['W2·6'];
const DA = () => true;
const lauf = (md: string) => pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], DA, INV);
const groesseProbleme = (md: string) => lauf(md).filter((p) => /groesse/.test(p.meldung));

describe('check:plan — `groesse` ist reine Lese-Hilfe (Regel 12 gestrichen, QS-PLAN-EINFACH 14.8.2026)', () => {
  it('ohne Feld grün: das Tor verlangt die Schätzung nicht', () => {
    expect(lauf(PLAN)).toEqual([]);
  });

  it('S, M und L sind grün', () => {
    for (const g of GROESSE_WERTE) {
      expect(lauf(PLAN.replace('26x: nein', `26x: nein · groesse: ${g}`))).toEqual([]);
    }
  });

  it('auch unbekanntes Vokabular macht das Tor nicht rot (Feld steuert nichts)', () => {
    expect(groesseProbleme(PLAN.replace('26x: nein', '26x: nein · groesse: gross'))).toEqual([]);
  });
});

// --- Anzeige -----------------------------------------------------------------
describe('groesseBadge — Lagebild', () => {
  it('S nennt die Bündelung, L das Schneiden, M den Normalfall', () => {
    expect(groesseBadge('S')).toContain('nur gebündelt nehmen');
    expect(groesseBadge('L')).toContain('erst in Teilschritte schneiden');
    expect(groesseBadge('M')).toContain('sessionfüllend');
  });

  it('ohne Schätzung steht «Grösse ungeschätzt» — der Renderer rät nicht (§8)', () => {
    expect(groesseBadge(null)).toContain('Grösse ungeschätzt');
  });

  it('unbekannter Wert wird ebenfalls als ungeschätzt gezeigt statt roh durchgereicht', () => {
    expect(groesseBadge('XL')).toContain('Grösse ungeschätzt');
    expect(groesseBadge('XL')).not.toContain('XL');
  });

  it('nutzt ausschliesslich chip-Klassen, die das gemeinsame Stylesheet schon kennt', () => {
    // Ein neuer `.chip.*`-Selektor läge im geteilten Stylesheet und änderte damit
    // ALLE vier erzeugten Seiten, nicht nur das Lagebild — dieselbe Auflage, unter
    // der `bereichsBadges` gebaut wurde.
    for (const html of [groesseBadge('S'), groesseBadge('M'), groesseBadge('L'), groesseBadge(null)]) {
      expect(html).toMatch(/class="chip (ready|done|wip|block|gold)"/);
    }
  });
});

// --- Bau-Prompt --------------------------------------------------------------
function einheit(groesse: string | null): Einheit {
  const etikett: Etikett = {
    id: 'QS-TEST-1',
    status: 'ready',
    blocker: null,
    dep: [],
    kollision: ['scripts/plan/**'],
    worktree: true,
    asset26x: false,
    groesse,
    fahrplan: 'fahrplaene/FAHRPLAN-X.md',
  };
  return { id: 'QS-TEST-1', checkbox: '[ ]', sektion: 'Querschnitt', pos: 3, etikett };
}
const SCHRITT: SchrittInfo = { titel: 'Testschritt', prosa: 'Wortlaut.', par: '4', pflicht: [], ankerDefekt: null, gekuerzt: false, checkliste: null };

describe('bauPrompt — die Schätzung reist mit', () => {
  // Ohne diese Zeile sähe die bauende Session die Schätzung nie: der
  // Grössen-Check in Station A des Skills `bauschritt` ist der einzige Ort, der
  // aus ihr eine Handlung ableitet, und `plan:next` gibt das Feld nicht aus.
  it('S verlangt Bündeln, L verlangt Schneiden, M nennt den Normalfall', () => {
    expect(bauPrompt(einheit('S'), SCHRITT)).toContain('Grösse S —');
    expect(bauPrompt(einheit('S'), SCHRITT)).toContain('kollisionsfreie `ready-now`-Nachbarn');
    expect(bauPrompt(einheit('L'), SCHRITT)).toContain('in sessionfüllende Teilschritte schneiden');
    expect(bauPrompt(einheit('M'), SCHRITT)).toContain('Grösse M —');
  });

  it('ohne Schätzung sagt der Prompt das ehrlich, statt M zu unterstellen', () => {
    expect(bauPrompt(einheit(null), SCHRITT)).toContain('Grösse ungeschätzt');
  });

  it('unbekanntes Vokabular fällt auf «ungeschätzt» zurück, nie auf eine geratene Klasse', () => {
    expect(bauPrompt(einheit('XL'), SCHRITT)).toContain('Grösse ungeschätzt');
  });

  it('jeder Prompt nennt die Grenze: Schätzung, kein Tor-Kriterium', () => {
    for (const g of [...GROESSE_WERTE, null]) {
      expect(bauPrompt(einheit(g), SCHRITT)).toContain('kein Tor-Kriterium');
    }
  });
});

// --- Bestand -----------------------------------------------------------------
describe('ROADMAP-Bestand', () => {
  // BEWUSST wird hier NICHT geprüft, dass jeder offene Schritt eine Schätzung
  // trägt. Das Feld ist optional (Bestandsschonung, Auftrag 5.8.2026); ein solcher
  // Test machte es durch die Hintertür zur Pflicht und ginge beim nächsten neu
  // aufgenommenen Schritt rot, obwohl der Entwurf das ausdrücklich erlaubt.
  it('keine Schätzung ausserhalb des Vokabulars — Regel 12 auf den echten Daten', () => {
    const meta = readFileSync('ROADMAP.md', 'utf8')
      .split('\n')
      .filter((z) => z.includes('<!-- @meta '))
      .map((z) => parseEtikett(z));
    expect(meta.length).toBeGreaterThan(0);
    expect(meta.filter((e) => e.groesse !== null && !istGroesse(e.groesse)).map((e) => e.id)).toEqual([]);
  });
});
