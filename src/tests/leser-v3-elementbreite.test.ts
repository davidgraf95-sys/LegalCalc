import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  SCHWELLE_D, SCHWELLE_S, SCHWELLE_SPALTE, modusFuer, type Breitenmodus,
} from '../pages/gesetz-leser/v3/useElementBreite';
import {
  KOPF_SCHWELLE_KOMPAKT, KOPF_SCHWELLE_MINI, kopfStufe,
} from '../pages/gesetz-leser/v3/kopfStufen';

// ─── A-8 · EINE Breiten-Quelle der V3-Hülle (Kap. 12 A-8) ───────────────────
//
// Vorzustand, gemessen 17.8.2026: ZWEI unabhängige Entscheider über denselben
// Platz — `kopfStufe` (`v3/kopfStufen.ts`, Schwellen 640/900, gemessen am
// Rahmen-Element) und `istXl` (`inhalt-zustand.tsx:397`, Schwelle 1024, gemessen
// am Viewport bzw. an der Pane-Wurzel). Zwei Quellen für eine Frage sind eine
// zweite Wahrheit (§5); A-8 führt darum die EINE Quelle ein.
//
// WAS DIESER TEST BEWEIST — und wie er rot wird:
//  ① Die drei Zahlen leben in GENAU EINER Datei. Rot zu bekommen: 640 oder 900
//     in `kopfStufen.ts` wieder als Literal hinschreiben. Das ist die eigentliche
//     A-8-Aussage; ohne diese Sonde wäre die «eine Quelle» eine Behauptung über
//     Code-Kosmetik, die der nächste Bau still zurücknimmt.
//  ② Die Abbildung Modus → Kopf-Zuschnitt ist widerspruchsfrei über den ganzen
//     Bereich. Rot zu bekommen: `modusFuer` und `kopfStufe` an verschiedenen
//     Schwellen schneiden lassen.
//  ③ Die Schwellen sind BYTE-GLEICH zum Vorzustand (640/900/1024). Rot zu
//     bekommen: eine Zahl verschieben — dann ist es keine Verhaltensneutralität
//     mehr, sondern eine fachliche Änderung (§6.3) und gehört deklariert.
const LIES = (p: string) => readFileSync(p, 'utf8');

/** Quelltext ohne Kommentare — die Dateien BEGRÜNDEN die Zahlen in Prosa, eine
 *  Sonde über den Rohtext fände die Begründung und wäre grundlos rot (dieselbe
 *  Falle wie in `leser-v3-adresse.test.ts`, dort am 16.8.2026 reproduziert). */
function ohneKommentare(quelle: string): string {
  return quelle
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
}

const QUELLE = 'src/pages/gesetz-leser/v3/useElementBreite.ts';
const KOPF = 'src/pages/gesetz-leser/v3/kopfStufen.ts';
/** V4: die Ist-Hülle, gegen die `SCHWELLE_SPALTE` deklariert doppelt liegt. */
const IST_ZUSTAND = 'src/pages/gesetz-leser/inhalt-zustand.tsx';

describe('A-8 · EINE Breiten-Quelle (v3/useElementBreite)', () => {
  it('die Modi liegen an den heutigen Schwellen 640 und 900 — byte-gleich', () => {
    expect(SCHWELLE_S).toBe(640);
    expect(SCHWELLE_D).toBe(900);
    expect(modusFuer(0)).toBe('sheet');
    expect(modusFuer(SCHWELLE_S - 1)).toBe('sheet');
    expect(modusFuer(SCHWELLE_S)).toBe('s');
    expect(modusFuer(SCHWELLE_D - 1)).toBe('s');
    expect(modusFuer(SCHWELLE_D)).toBe('d');
    expect(modusFuer(2000)).toBe('d');
  });

  it('Kopf-Zuschnitt und Breitenmodus widersprechen sich an KEINER Breite', () => {
    const erwartet: Record<Breitenmodus, 'voll' | 'kompakt' | 'mini'> = {
      d: 'voll', s: 'kompakt', sheet: 'mini',
    };
    for (let b = 200; b <= 2000; b += 1) {
      expect(kopfStufe(b), `Widerspruch bei ${b} px`).toBe(erwartet[modusFuer(b)]);
    }
  });

  it('die Kopf-Schwellen sind Weiterleitungen, keine zweiten Zahlen', () => {
    expect(KOPF_SCHWELLE_MINI).toBe(SCHWELLE_S);
    expect(KOPF_SCHWELLE_KOMPAKT).toBe(SCHWELLE_D);
  });

  // ── V4 (Nachzug 17.8.2026) · DIE SPALTEN-SCHWELLE GEGEN IHRE HERKUNFT ──────
  // Hier stand `expect(SCHWELLE_SPALTE).toBe(1024)` — eine Tautologie: die Zahl
  // gegen sich selbst, in derselben Datei geändert und in derselben Datei
  // bestätigt. Der Architektur-Review 17.8.2026 hat sie als Tor gemeldet, das
  // nicht scheitern kann (§6.7).
  // `SCHWELLE_SPALTE` ist eine DEKLARIERTE Doppelung: die Ist-Hülle entscheidet
  // dieselbe Frage in `inhalt-zustand.tsx` (`PANE_BREIT_PX` für die Pane-Wurzel,
  // `matchMedia('(min-width: 1024px)')` für den Viewport), und die V3-Hülle darf
  // von dort nicht importieren (Fundament-Sonde). Also wird nicht die Zahl
  // wiederholt, sondern die QUELLE gelesen — verschiebt die Ist-Hülle ihre
  // Schwelle, wird dieser Test rot statt die Doppelung still auseinanderzulaufen.
  // Rot zu bekommen: `SCHWELLE_SPALTE` auf 1023 setzen (oder `PANE_BREIT_PX`
  // bzw. die matchMedia-Zahl in `inhalt-zustand.tsx` verschieben).
  it('V4 · SCHWELLE_SPALTE stimmt mit der Ist-Hülle überein (gelesen, nicht wiederholt)', () => {
    const ist = ohneKommentare(LIES(IST_ZUSTAND));
    const paneBreit = /\bPANE_BREIT_PX\s*=\s*(\d+)\b/.exec(ist);
    const mediaQuery = /matchMedia\('\(min-width:\s*(\d+)px\)'\)/.exec(ist);
    // Positiv-Sonden zuerst: ohne sie prüfte ein Umbenennen in der Ist-Hülle
    // gegen `null` und der Test bliebe stumm grün.
    expect(paneBreit, '`PANE_BREIT_PX = <Zahl>` steht nicht mehr in inhalt-zustand.tsx').not.toBeNull();
    expect(mediaQuery, 'die matchMedia-Schwelle steht nicht mehr in inhalt-zustand.tsx').not.toBeNull();
    expect(Number(paneBreit![1]), 'Pane-Schwelle der Ist-Hülle weicht ab').toBe(SCHWELLE_SPALTE);
    expect(Number(mediaQuery![1]), 'Viewport-Schwelle der Ist-Hülle weicht ab').toBe(SCHWELLE_SPALTE);
  });

  // V4 · und der tote Export ist wirklich weg (Rückbau, §17). Rot zu bekommen:
  // `spalteFuer` in `useElementBreite.ts` wieder anlegen, ohne ihn zu rufen.
  it('V4 · kein toter Export `spalteFuer` mehr in der Breiten-Quelle', () => {
    expect(/\bexport function spalteFuer\b/.test(ohneKommentare(LIES(QUELLE))),
      '`spalteFuer` ist zurück — ein Export ohne Aufrufer').toBe(false);
  });

  it('GENAU EINE Datei trägt die Zahlen — `kopfStufen.ts` nennt sie nicht mehr', () => {
    const kopf = ohneKommentare(LIES(KOPF));
    expect(/\b640\b/.test(kopf), '640 steht wieder als Literal in kopfStufen.ts').toBe(false);
    expect(/\b900\b/.test(kopf), '900 steht wieder als Literal in kopfStufen.ts').toBe(false);
    // Positiv-Sonde: die Quelle nennt sie WIRKLICH (sonst gewönne das Verbot
    // oben gegen zwei leere Dateien — ein Tor, das nicht scheitern kann, §6.7).
    const quelle = ohneKommentare(LIES(QUELLE));
    expect(/\b640\b/.test(quelle), 'die eine Quelle nennt 640 nicht').toBe(true);
    expect(/\b900\b/.test(quelle), 'die eine Quelle nennt 900 nicht').toBe(true);
  });

  it('die Messung hängt am ELEMENT, nicht am Viewport (Pane-Parität, Kap. 4a)', () => {
    const quelle = ohneKommentare(LIES(QUELLE));
    // ResizeObserver auf border-box: die Zusage «im Pane gilt dieselbe Regel»
    // steht und fällt damit. Rot zu bekommen: auf matchMedia zurückbauen.
    expect(/new ResizeObserver\(/.test(quelle), 'kein ResizeObserver — die Regel messe wieder den Viewport').toBe(true);
    expect(/box:\s*'border-box'/.test(quelle), 'nicht border-box — die Pane-Scrollbar verschiebt die Schwelle').toBe(true);
    expect(/matchMedia/.test(quelle), 'matchMedia in der Breiten-Quelle (Viewport statt Element)').toBe(false);
  });
});
