import { describe, expect, it } from 'vitest';
import { tabTitel } from '../pages/gesetz-leser/helpers';

// W2·18-FEHLERBUCH — Browser-Reiter «EMRK (EMRK) — LexMetrik».
//
// BEFUND (auf Prod reproduziert 29.8.2026, /gesetze/bund/EMRK): Der Reiter-Titel
// setzte sich aus Kürzel + Klammer-Kurztitel zusammen. Der Kurztitel ist per
// LEGES-Konvention der Klammer-Inhalt am Ende des Volltitels — bei den
// Staatsverträgen ist DAS aber genau das Kürzel («Konvention zum Schutze der
// Menschenrechte und Grundfreiheiten (EMRK)»). Ergebnis: dasselbe Wort zweimal,
// die Klammer ohne jeden Informationswert.
//
// Rot zu bekommen: in `tabTitel` die `redundant`-Weiche entfernen — dann steht
// im ersten Fall wieder «EMRK (EMRK) — LexMetrik».
//
// Der zweite Block ist der eigentliche Schutz: die Weiche darf NUR den
// redundanten Fall treffen. Ein Fix, der die Klammer generell wegwirft, nähme
// dem Reiter bei OR/ZGB/StGB den ausgeschriebenen Titel — der Reiter ist beim
// Wiederfinden eines Tabs oft das Einzige, was der Nutzer sieht.

describe('tabTitel — Kürzel wird nicht gedoppelt (Fehlerbuch 29.8.2026)', () => {
  it('Klammer-Suffix == Kürzel ⇒ Klammer entfällt (EMRK)', () => {
    expect(tabTitel('EMRK', 'Konvention zum Schutze der Menschenrechte und Grundfreiheiten (EMRK)'))
      .toBe('EMRK — LexMetrik');
  });

  it('greift unabhängig von Gross-/Kleinschreibung und Randleerzeichen', () => {
    expect(tabTitel(' emrk ', 'Konvention … (EMRK)')).toBe(' emrk  — LexMetrik');
  });

  it('Titel OHNE Klammer-Suffix, der gleich dem Kürzel ist ⇒ ebenfalls nur einmal', () => {
    // `kurz` fällt dann auf den Titel selbst zurück — auch das ist Redundanz.
    expect(tabTitel('CISG', 'CISG')).toBe('CISG — LexMetrik');
  });
});

describe('tabTitel — der informative Fall bleibt unangetastet', () => {
  it('Klammer-Suffix ≠ Kürzel ⇒ Kürzel (Kurztitel)', () => {
    expect(tabTitel('OR', 'Bundesgesetz betreffend die Ergänzung des Schweizerischen Zivilgesetzbuches (Obligationenrecht)'))
      .toBe('OR (Obligationenrecht) — LexMetrik');
  });

  it('kein Klammer-Suffix ⇒ der volle Titel steht in der Klammer', () => {
    expect(tabTitel('ZH-211.11', 'Gebührenverordnung des Obergerichts'))
      .toBe('ZH-211.11 (Gebührenverordnung des Obergerichts) — LexMetrik');
  });

  it('nur das LETZTE Klammerpaar zählt, nicht ein Einschub mitten im Titel', () => {
    expect(tabTitel('BV', 'Bundesverfassung (der Eidgenossenschaft) vom 18. April 1999 (BV)'))
      .toBe('BV — LexMetrik');
    expect(tabTitel('XX', 'Erlass (mit Einschub) und Rest'))
      .toBe('XX (Erlass (mit Einschub) und Rest) — LexMetrik');
  });
});
