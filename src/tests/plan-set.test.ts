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
// Beide Meldungen müssen verschwinden, sonst ist nur die halbe Kette geheilt.
//
// Umfang richtiggestellt 31.7.2026 (Fund R2-10/R2-13 der Endprüfung Runde 2): Die
// frühere Fassung dieses Kommentars nannte «alle drei geparkten Schritte (W1·4,
// W2·5g-ZEIT, W2·5j-TABELLEN) sowie ROADMAP:494 `[D]`». Nachgezählt trägt die
// ROADMAP genau ZWEI `[d]/[D]`-Marken: die Bullet von `W2·5j-TABELLEN` und die
// Bullet `[D] **Quellen-Steinbruch OpenCaseLaw**`, die gar kein @meta trägt und
// für `plan:set` darum unerreichbar ist. W1·4 und W2·5g-ZEIT tragen `- [ ]`, waren
// also nie betroffen. Die Zeilenangabe «ROADMAP:494» war zudem schon beim Schreiben
// falsch (der Bullet stand auf 496) — Anker deshalb auf die stabile Form gehoben.
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

  // Fund R2-9/R2-15 (Runde 2): Der Fund-27-Fix nahm `d`/`D` in die Zeichenklasse
  // auf, ergänzte aber CHECKBOX_FUER nicht — für alles ausser done/wip griff der
  // Fallback `?? '[ ]'`. Damit überschrieb `plan:set <geparkt> status=parked` die
  // Legendenmarke `[d]` still mit `[ ]`, und kein Tor sah es: CHECKBOX_STATUS
  // erlaubt `[ ]` auch für parked/blocked. Der geparkte Schritt las sich danach
  // wie ein offener — genau die Marke, die das Ausführungs-Protokoll Ziff. 1 zum
  // Überspringen verlangt. `plan:set` konnte `[d]` zudem nie wieder erzeugen.
  it('parked → parked erhält die Legendenmarke [d]', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'parked');
    expect(out.split('\n')[0]).toBe('- [d] **5j-TABELLEN · X**');
  });

  it('parked → blocked erhält die Legendenmarke [d]', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'blocked');
    expect(out.split('\n')[0]).toBe('- [d] **5j-TABELLEN · X**');
  });

  it('[D] (gross) → parked bleibt als geparkt-Marke erhalten', () => {
    const out = setField(geparkt('[D]'), 'W2·5j', 'status', 'parked');
    expect(out.split('\n')[0]).toBe('- [D] **5j-TABELLEN · X**');
  });

  // Gegenprobe: passt die vorhandene Marke NICHT zum neuen Status, wird sie
  // nachgezogen — sonst wäre der Nachzug wirkungslos statt schonend.
  it('[x] → parked wird auf die geparkt-Marke [d] nachgezogen', () => {
    const out = setField(geparkt('[x]').replace('status: parked', 'status: done'), 'W2·5j', 'status', 'parked');
    expect(out.split('\n')[0]).toBe('- [d] **5j-TABELLEN · X**');
  });
});

// ---------------------------------------------------------------------------
// Fund R2-1/R2-10 (Runde 2, KRITISCH): dieselbe Nachbarschafts-Annahme wie in
// parse.ts — der Checkbox-Nachzug brach an der ersten nicht-leeren Zeile über dem
// @meta ab. Steht dort Prosa, schreibt `plan:set` das @meta und lässt die
// sichtbare Checkbox stehen. Beide Layouts wörtlich aus der echten ROADMAP.
// ---------------------------------------------------------------------------
describe('setField — Checkbox-Nachzug über Prosa hinweg (Fund R2-1/R2-10)', () => {
  const B20 = [
    '  - [ ] **B20 · Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)** — 15 Befunde (Blocker 1 · Hoch 5). §21.',
    '    **`dep: []` seit 31.7.2026 (Endprüfungs-Fund 18):** B20 ist kein Neubau, sondern Nachmessung,',
    '    und trägt mit LM-062 den einzigen Blocker der «bereits gebaut»-Klasse. Am Kettenende hätte die',
    '    Behauptung «ist gebaut» erst nach 19 Bau-Batches geprüft — erwiese sie sich als falsch, entstünde',
    '    der Bau-Posten am spätesten möglichen Punkt. B20 ist damit **unabhängig und vorziehbar**; die',
    '    Bau-Kette B1→…→B19 bleibt unverändert seriell. `plan:next` führt B20 dadurch gewollt in ready-now.',
    '    <!-- @meta id: W2·17-UI-BEFUNDE-B20 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->',
  ].join('\n');

  const ZEIT = [
    '- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)*:',
    '  **Status 20.7.2026 (David):** «irgendwann, aktuell nicht relevant» → von `blocked` auf `parked`.',
    '  <!-- @meta id: W2·5g-ZEIT · status: parked · of: ja · blocker: zeit-historik-poc · dep: [] · kollision: [] · worktree: ja · 26x: nein -->',
  ].join('\n');

  it('B20-Layout: status=done zieht die Checkbox trotz 5 Prosa-Zeilen auf [x]', () => {
    const out = setField(B20, 'W2·17-UI-BEFUNDE-B20', 'status', 'done');
    expect(out.split('\n')[0].startsWith('  - [x] **B20 ·')).toBe(true);
  });

  it('W2·5g-ZEIT-Layout: status=wip zieht die Checkbox trotz Prosa-Zeile auf [~]', () => {
    const out = setField(ZEIT, 'W2·5g-ZEIT', 'status', 'wip');
    expect(out.split('\n')[0].startsWith('- [~] **5g-ZEIT ·')).toBe(true);
  });

  it('bindet NICHT an eine fremde Bullet-Zeile darüber', () => {
    const md = [
      '  - [ ] **fremde Checkbox der Nachbarliste**',
      '- **Datenhaltung / Single-Source-DB** *(QS-DATA)*.',
      '  <!-- @meta id: QS-DATA · status: blocked · of: ja · blocker: b1 · dep: [] · kollision: [] · worktree: nein · 26x: nein -->',
    ].join('\n');
    const out = setField(md, 'QS-DATA', 'status', 'done');
    expect(out.split('\n')[0]).toBe('  - [ ] **fremde Checkbox der Nachbarliste**');
  });
});

// ---------------------------------------------------------------------------
// Fund R2-16 (Runde 2): `serializeEtikett` kannte `seq-hart`/`seq-weich` nicht und
// verwarf beide beim Neu-Serialisieren. `seq-hart` steuert die Kollisionsreihen-
// folge auf geteilten Dateien (§12); sein stiller Verlust kann zwei Sessions auf
// dieselbe Datei laufen lassen. Fixture ist die ECHTE W2·5d-Zeile der ROADMAP.
// ---------------------------------------------------------------------------
describe('setField — seq-hart/seq-weich überleben den Round-Trip (Fund R2-16)', () => {
  const W2_5D =
    '  <!-- @meta id: W2·5d · status: ready · of: ja · blocker: null · dep: [W2·5c] · kollision: [src/pages/gesetz-leser/parts.tsx, src/pages/gesetz-leser/inhalt.tsx, src/components/normtext/ArtikelBody.tsx, src/lib/normtext/register.ts, src/components/suche, scripts/normtext] · seq-hart: [QS-PERF(ArtikelBody.tsx)] · seq-weich: [W2·5b-L0(scripts/normtext, nur U-PDF)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->';
  const MD_5D = ['- [ ] **5d · Gesetzes-UX**', '  Prosa dazwischen.', W2_5D].join('\n');

  it('status-Wechsel erhält seq-hart und seq-weich byte-gleich', () => {
    const out = setField(MD_5D, 'W2·5d', 'status', 'wip');
    const zeile = out.split('\n').find((z) => z.includes('@meta'))!;
    expect(zeile).toBe(W2_5D.replace('status: ready', 'status: wip'));
  });

  it('Nicht-Status-Feld erhält seq-hart und seq-weich byte-gleich', () => {
    const out = setField(MD_5D, 'W2·5d', 'worktree', 'nein');
    const zeile = out.split('\n').find((z) => z.includes('@meta'))!;
    expect(zeile).toBe(W2_5D.replace('worktree: ja', 'worktree: nein'));
  });

  it('seq-hart ist als Feld setzbar', () => {
    const out = setField(MD_5D, 'W2·5d', 'seq-hart', '[QS-PERF(ArtikelBody.tsx), W2·5b-L0(x)]');
    expect(out).toContain('seq-hart: [QS-PERF(ArtikelBody.tsx), W2·5b-L0(x)]');
    expect(out).toContain('seq-weich: [W2·5b-L0(scripts/normtext, nur U-PDF)]');
  });
});
