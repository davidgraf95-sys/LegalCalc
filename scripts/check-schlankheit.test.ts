// scripts/check-schlankheit.test.ts
// QS-TOK — Unit-Tests der Kernlogik von check:schlankheit (§6.6 mechanisiert).
// Beweist die drei im Auftrag verlangten Fälle: (1) eine neue Datei über der
// Schwelle ist rot, (2) eine Bestands-Datei +>10% über ihrer Baseline-Zahl ist
// rot, (3) eine stabile Bestands-Datei bleibt grün. Zusätzlich die Rand- und
// Hinweis-Fälle (Toleranz-Grenze, Unterschreitung, gelöschte Baseline-Datei).
import { describe, it, expect } from 'vitest';
import { pruefeSchlankheit } from './check-schlankheit';

describe('pruefeSchlankheit — Kernlogik (§6.6 mechanisiert)', () => {
  it('neue Datei über der Schwelle, nicht in der Baseline → rot', () => {
    const aktuell = new Map([['src/lib/neu.ts', 850]]);
    const { rot, hinweise } = pruefeSchlankheit(aktuell, {});
    expect(rot).toHaveLength(1);
    expect(rot[0]).toContain('src/lib/neu.ts');
    expect(rot[0]).toContain('NEU über der Schwelle');
    expect(hinweise).toHaveLength(0);
  });

  it('neue Datei UNTER der Schwelle, nicht in der Baseline → grün (kein Eintrag nötig)', () => {
    const aktuell = new Map([['src/lib/klein.ts', 500]]);
    const { rot, hinweise } = pruefeSchlankheit(aktuell, {});
    expect(rot).toHaveLength(0);
    expect(hinweise).toHaveLength(0);
  });

  it('Bestands-Datei wächst um mehr als 10% über ihre Baseline-Zahl → rot (der Anlass: 781 → 1090 Z. = +39.6%)', () => {
    const aktuell = new Map([['src/pages/gesetz-leser/inhalt.tsx', 1090]]);
    const baseline = { 'src/pages/gesetz-leser/inhalt.tsx': 781 };
    const { rot } = pruefeSchlankheit(aktuell, baseline);
    expect(rot).toHaveLength(1);
    expect(rot[0]).toContain('39.6% über der Baseline');
  });

  it('Bestands-Datei exakt auf der 10%-Toleranzgrenze bleibt grün, ein Zeichen darüber wird rot', () => {
    const baseline = { 'src/lib/x.ts': 1000 };
    const anGrenze = new Map([['src/lib/x.ts', 1100]]); // exakt +10 %
    expect(pruefeSchlankheit(anGrenze, baseline).rot).toHaveLength(0);

    const uebergrenze = new Map([['src/lib/x.ts', 1101]]); // +10.1 %
    expect(pruefeSchlankheit(uebergrenze, baseline).rot).toHaveLength(1);
  });

  it('Bestands-Datei stabil (unverändert oder leicht geschrumpft, weiter über der Schwelle) → grün', () => {
    const baseline = { 'src/lib/stabil.ts': 900 };
    const unveraendert = new Map([['src/lib/stabil.ts', 900]]);
    expect(pruefeSchlankheit(unveraendert, baseline).rot).toHaveLength(0);

    const geschrumpft = new Map([['src/lib/stabil.ts', 850]]);
    const befund = pruefeSchlankheit(geschrumpft, baseline);
    expect(befund.rot).toHaveLength(0);
    expect(befund.hinweise).toHaveLength(0); // weiterhin über der Schwelle (800) → kein Hinweis
  });

  it('Bestands-Datei fällt unter die Schwelle → kein Rot, aber ein Hinweis (kein Auto-Write, §2)', () => {
    const baseline = { 'src/lib/geschrumpft.ts': 900 };
    const aktuell = new Map([['src/lib/geschrumpft.ts', 700]]);
    const { rot, hinweise } = pruefeSchlankheit(aktuell, baseline);
    expect(rot).toHaveLength(0);
    expect(hinweise).toHaveLength(1);
    expect(hinweise[0]).toContain('kann aus der Baseline entfernt werden');
  });

  it('Baseline-Eintrag ohne aktuelle Datei (gelöscht/verschoben) → Hinweis, kein Rot', () => {
    const baseline = { 'src/lib/weg.ts': 900 };
    const { rot, hinweise } = pruefeSchlankheit(new Map(), baseline);
    expect(rot).toHaveLength(0);
    expect(hinweise).toHaveLength(1);
    expect(hinweise[0]).toContain('gelöscht/verschoben');
  });

  it('gemischter Bestand: mehrere Dateien unabhängig bewertet', () => {
    const baseline = { 'a.ts': 900, 'b.ts': 1000 };
    const aktuell = new Map([
      ['a.ts', 905],   // stabil → grün
      ['b.ts', 1200],  // +20% → rot
      ['c.ts', 810],   // neu über Schwelle → rot
    ]);
    const { rot } = pruefeSchlankheit(aktuell, baseline);
    expect(rot).toHaveLength(2);
    expect(rot.some((z) => z.includes('b.ts'))).toBe(true);
    expect(rot.some((z) => z.includes('c.ts'))).toBe(true);
  });
});
