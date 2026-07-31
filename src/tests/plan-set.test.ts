// src/tests/plan-set.test.ts
import { setField } from '../../scripts/plan/set';

const MD = `- [ ] **6 · Konsultieren**
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  Prosa.
`;

describe('setField', () => {
  it('setzt status=done und toggelt Checkbox auf [x]', () => {
    const out = setField(MD, 'W2·6', 'status', 'done');
    expect(out).toContain('status: done');
    expect(out).toContain('- [x] **6 · Konsultieren**');
  });

  it('setzt status=wip und toggelt Checkbox auf [~]', () => {
    const out = setField(MD, 'W2·6', 'status', 'wip(meine-wt)');
    expect(out).toContain('status: wip(meine-wt)');
    expect(out).toContain('- [~] **6 · Konsultieren**');
  });

  it('ändert ein Nicht-Status-Feld ohne Checkbox-Toggle', () => {
    const out = setField(MD, 'W2·6', 'blocker', 'wbqdyap3x');
    expect(out).toContain('blocker: wbqdyap3x');
    expect(out).toContain('- [ ] **6 · Konsultieren**');
  });

  it('wirft, wenn id nicht existiert', () => {
    expect(() => setField(MD, 'W9·9', 'status', 'done')).toThrow();
  });

  it('ändert ein Feld mit Mittelpunkt-Werten (dep mit W2·n-IDs)', () => {
    const md = [
      '- [ ] **6 · X**',
      '  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [W2·5] · kollision: [] · worktree: nein · 26x: nein -->',
      '',
    ].join('\n');
    const out = setField(md, 'W2·6', 'dep', '[W2·5, W2·7]');
    expect(out).toContain('dep: [W2·5, W2·7]');
  });

  it('Wert mit $ wird literal eingesetzt (keine Backreference)', () => {
    const md = ['- [ ] **x**', '  <!-- @meta id: A · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->'].join('\n');
    const out = setField(md, 'A', 'kollision', '[src/$1/x.ts]');
    expect(out).toContain('kollision: [src/$1/x.ts]');
  });

  it('erhält den Blockquote-Präfix (> ) der @meta-Zeile', () => {
    const md = [
      '> **⬆ Prosa**',
      '> <!-- @meta id: QS-TOK · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    const out = setField(md, 'QS-TOK', 'status', 'wip');
    const metaZeile = out.split('\n').find((z) => z.includes('@meta'))!;
    expect(metaZeile.startsWith('> ')).toBe(true);
    expect(metaZeile).toContain('status: wip');
  });
});

// Fund 27 der QS-TOK-Endprüfung (31.7.2026): Der Checkbox-Nachzug prüfte
// `/^\s*-\s*\[[ x~]\]/` — `[d]`/`[D]` (Legenden-Status «geparkt/zurückgestellt»)
// fehlte in der Zeichenklasse. Folge: `plan:set <geparkter Schritt> status=ready`
// setzte das @meta, liess die Checkbox aber auf `[d]` stehen; check:plan (Glied von
// `npm run gate`) wurde dadurch beim Entparken rot — mit ZWEI Meldungen:
// «Checkbox [d] passt nicht zu status ready» und «status ready aber blocker gesetzt».
// Betroffen alle drei geparkten Schritte (W1·4, W2·5g-ZEIT, W2·5j-TABELLEN) sowie
// ROADMAP:494 `[D]`. Beide Meldungen müssen verschwinden, sonst ist nur die halbe
// Kette geheilt.
describe('setField — Entparken (Fund 27)', () => {
  const geparkt = (cb: string) => [
    `- ${cb} **5j-TABELLEN · X**`,
    '  <!-- @meta id: W2·5j · status: parked · of: ja · blocker: david-spaeter-tabellen · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
  ].join('\n');

  it('[d] → status=ready zieht die Checkbox auf [ ] nach', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'ready');
    expect(out.split('\n')[0]).toBe('- [ ] **5j-TABELLEN · X**');
    expect(out).toContain('status: ready');
  });

  it('[D] (gross) → status=wip zieht die Checkbox auf [~] nach', () => {
    const out = setField(geparkt('[D]'), 'W2·5j', 'status', 'wip');
    expect(out.split('\n')[0]).toBe('- [~] **5j-TABELLEN · X**');
  });

  it('[d] → status=done zieht die Checkbox auf [x] nach', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'done');
    expect(out.split('\n')[0]).toBe('- [x] **5j-TABELLEN · X**');
  });

  it('status=ready räumt den blocker mit ab (sonst bleibt check:plan rot)', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'ready');
    expect(out).toContain('blocker: null');
    expect(out).not.toContain('david-spaeter-tabellen');
  });

  it('status=blocked lässt den blocker unangetastet', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'blocked');
    expect(out).toContain('blocker: david-spaeter-tabellen');
  });
});
