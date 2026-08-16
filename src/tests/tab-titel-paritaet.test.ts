import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// FAHRPLAN-LESER-V3 Kap. 12, A-3 — Guard-Parität für den Browser-Tab-Titel.
//
// BEFUND (16.8.2026): Der Gesetz-Leser setzt `document.title` nur, wenn er NICHT
// im sekundären Pane steht (`inhalt-hooks.tsx`, Regel B-2.5). Der Entscheid-
// Leser hatte denselben Effekt OHNE Guard. Folge im Split-View: wer neben einem
// Gesetz einen Entscheid aufschlägt, bekommt den Entscheid als Browser-Tab-
// Titel — obwohl das Hauptfenster das Gesetz zeigt. Der Reiter log über seinen
// eigenen Inhalt (§8), und beim Wiederfinden eines Tabs ist der Titel das
// Einzige, was der Nutzer sieht.
//
// Quellensonde statt Render-Test: Präzedenz `leser-adresse-lm202.test.ts`
// (derselbe Prüfstil für dieselbe Split-View-Falle). Die Aussage ist eine
// STRUKTURELLE — «beide Leser tragen denselben Guard» —, und genau die zerfällt
// im Render-Test in zwei unabhängige Fälle, die getrennt verrotten können.
//
// Rot zu bekommen: die Guard-Zeile in einer der beiden Dateien entfernen.

const ENTSCHEID = 'src/pages/EntscheidLeser.tsx';
const GESETZ = 'src/pages/gesetz-leser/inhalt-hooks.tsx';

function quelle(pfad: string): string {
  return readFileSync(new URL(`../../${pfad}`, import.meta.url), 'utf8');
}

/** Der Titel-Effekt samt der zwei Zeilen davor/danach — eng genug, dass ein
 *  Guard irgendwo sonst in der Datei nicht fälschlich mitzählt. */
function titelEffekt(text: string): string {
  const i = text.indexOf('document.title =');
  expect(i, 'kein document.title-Effekt gefunden').toBeGreaterThan(-1);
  return text.slice(Math.max(0, i - 400), i + 100);
}

describe('Browser-Tab-Titel: sekundäres Pane schreibt nicht (A-3, B-2.5)', () => {
  it('Gesetz-Leser guardet den Titel gegen das sekundäre Pane', () => {
    expect(titelEffekt(quelle(GESETZ))).toMatch(/if \(istSekundaer\) return;/);
  });

  it('Entscheid-Leser guardet ihn ebenso — Parität, nicht Zufall', () => {
    expect(titelEffekt(quelle(ENTSCHEID))).toMatch(/if \(rolle === 'sekundaer'\) return;/);
  });

  it('der Guard hängt in der Dep-Liste, sonst friert er beim Rollenwechsel ein', () => {
    const text = quelle(ENTSCHEID);
    const i = text.indexOf('document.title =');
    expect(text.slice(i, i + 200)).toMatch(/\}, \[snap, rolle\]\);/);
  });
});
