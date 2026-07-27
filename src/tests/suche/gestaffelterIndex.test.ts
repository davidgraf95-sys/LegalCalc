// @vitest-environment node
// ─── W2·5: gestaffelter Index-Aufbau — Auflagen David 25.7.2026 ──────────────
//
// Das Staffeln (Bund zuerst, Kanton nach) ist nur zulässig, solange es den
// LADEZEITPUNKT ändert und nicht den Inhalt. Zwei Bedingungen machen den
// Unterschied zwischen einer Performance-Massnahme und einer Auskunftslücke —
// beide sind hier gegated:
//
//   1. Der unvollständige Zustand ist in der Trefferliste SICHTBAR. Wer während
//      des Nachladens sucht, muss erkennen, dass kantonale Treffer noch fehlen.
//      Sonst schliesst ein Anwalt aus einer leeren kantonalen Trefferliste, es
//      gebe keine kantonale Bestimmung — der teuerste denkbare Fehlschluss.
//   2. Eine laufende Suche wertet sich neu aus, sobald der kantonale Index
//      steht. Die Nachrück-Mechanik (neues Ergebnis-Objekt → neue Identität →
//      React-Memo rechnet neu) hängt daran, dass `ergaenze` einen BESTEHENDEN
//      Sucher erweitert, statt ihn neu zu bauen.
import { describe, it, expect } from 'vitest';
import * as flex from 'flexsearch';
import { baueSucher } from '../../lib/suche/artikelVolltext';
import { artikelGruppe, sucheAlles } from '../../lib/universalSuche';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

const leer = { m: '', n: '', g: '', tb: '', f: '' };
const EINTRAEGE = [
  { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '253', l: 'Art. 253', t: 'miete pachtzins des vermieters', ...leer },
  { k: 'AI-640.000', ku: 'StG (GS 640.000)', eb: 'kanton' as const, kt: 'AI', a: '116', l: 'Art. 116', t: 'die handänderungssteuer wird erhoben', ...leer },
];

describe('Gestaffelter Index — Ebenen rücken nach, ohne Neuaufbau (W2·5)', () => {
  it('nach Stufe 1 ist NUR der Bund durchsuchbar', () => {
    const s = baueSucher(EINTRAEGE as never, FlexSearch);
    s.ergaenze('bund');
    expect(s.bereiteEbenen()).toEqual(['bund']);
    expect(s.suche('miete', 10).length).toBe(1);
    // Der kantonale Artikel ist noch NICHT auffindbar — genau darum muss die
    // Oberfläche das offenlegen (Bedingung 1, unten).
    expect(s.suche('handänderungssteuer', 10).length).toBe(0);
  });

  it('Stufe 2 ergänzt den bestehenden Sucher — Bund bleibt, Kanton kommt dazu', () => {
    const s = baueSucher(EINTRAEGE as never, FlexSearch);
    s.ergaenze('bund');
    s.ergaenze('kanton');
    expect(s.bereiteEbenen()).toEqual(['bund', 'kanton']);
    expect(s.suche('miete', 10).length).toBe(1);          // unverändert erreichbar
    const kant = s.suche('handänderungssteuer', 10);
    expect(kant.length).toBe(1);
    expect(kant[0].href).toBe('/gesetze/kanton/AI-640.000#art-116');
  });

  it('das gehäppchelte Ergänzen liefert dasselbe Ergebnis wie das synchrone', async () => {
    const s = baueSucher(EINTRAEGE as never, FlexSearch);
    s.ergaenze('bund');
    await s.ergaenzeGestaffelt('kanton');
    expect(s.bereiteEbenen()).toEqual(['bund', 'kanton']);
    expect(s.suche('handänderungssteuer', 10).length).toBe(1);
  });

  it('Bund bleibt im Recall vor Kanton, egal in welcher Reihenfolge ergänzt wurde', () => {
    const s = baueSucher(EINTRAEGE as never, FlexSearch);
    s.ergaenze('kanton');
    s.ergaenze('bund');
    expect(s.bereiteEbenen()).toEqual(['bund', 'kanton']);
  });
});

// ── Bedingung 1: der unvollständige Zustand ist sichtbar ─────────────────────

describe('Gestaffelter Index — Unvollständigkeit ist offengelegt (§8)', () => {
  const treffer = [{ id: 'a', label: 'Art. 253 OR', href: '/gesetze/bund/OR#art-253' }];

  it('fehlt der Kanton, nennt die Gruppe das im Klartext — mit dem Wort «kantonal»', () => {
    const g = artikelGruppe(treffer, 6, 'Miete', ['kanton']);
    expect(g.unvollstaendig).toBe(true);
    expect(g.hinweis).toBeTruthy();
    expect(g.hinweis!.toLowerCase()).toContain('kantonal');
    // «lädt» allein genügt nicht: der Satz muss sagen, dass TREFFER fehlen.
    expect(g.hinweis!.toLowerCase()).toMatch(/fehlen|noch geladen/);
  });

  it('ist der Index vollständig, gibt es weder Hinweis noch Unvollständigkeits-Marke', () => {
    const g = artikelGruppe(treffer, 6, 'Miete', []);
    expect(g.unvollstaendig).toBeUndefined();
    expect(g.hinweis).toBeUndefined();
  });

  it('OHNE Treffer bleibt die Gruppe sichtbar, solange eine Ebene fehlt', () => {
    // Der kritische Fall: rein kantonale Query («Handänderungssteuer») während
    // des Nachladens → 0 Bund-Treffer. Fiele die Gruppe aus der Liste, behauptete
    // die Suche stumm «nichts gefunden» über einen ungelesenen Bestand.
    const gruppen = sucheAlles('Handänderungssteuer', {
      presets: [], gesetze: [], artikel: [], entscheide: [], materialien: [],
      artikelFehlendeEbenen: ['kanton'],
    }, 6);
    const artikel = gruppen.find((g) => g.id === 'artikel');
    expect(artikel, 'Gesetzestext-Gruppe verschwand samt Hinweis').toBeDefined();
    expect(artikel!.hinweis!.toLowerCase()).toContain('kantonal');
  });

  it('OHNE Treffer und vollständigem Index entfällt die Gruppe wie bisher', () => {
    const gruppen = sucheAlles('Handänderungssteuer', {
      presets: [], gesetze: [], artikel: [], entscheide: [], materialien: [],
      artikelFehlendeEbenen: [],
    }, 6);
    expect(gruppen.find((g) => g.id === 'artikel')).toBeUndefined();
  });
});
