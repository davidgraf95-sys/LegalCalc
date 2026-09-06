import { describe, expect, it } from 'vitest';
import {
  LESER_MAX_REM, rahmenBild, type RahmenLage,
} from '../pages/gesetz-leser/v3/rahmenSpalten';

// ─── Ä60 (c) · Die Rahmen-Entscheidung an JEDER Breite (H4, 18.8.2026) ───────
//
// `rahmenBild` ist eine reine Funktion — sie lässt sich für jede Breite
// nachrechnen, nicht nur für die drei, die ein Bildbogen zufällig trifft (§2,
// dieselbe Begründung wie bei `kopfStufen`/`useElementBreite`). Der e2e-Fall
// `e2e/leser-v3-rahmen.e2e.ts` misst dieselben Zusagen im echten Browser; diese
// Datei sichert die ARITHMETIK ab, auch dort, wo kein Screenshot hinkommt.
//
// Rot zu bekommen: `LESER_MAX_REM` verkleinern (die Gliederungsspalte fiele auch
// dort, wo alles passt), `blattSpur` fest auf `false` (nichts bekommt je eine
// Spur — genau der Ist-Zustand vor H4) oder die Aufweitung zentrieren statt zu
// verankern (der letzte Block unten misst die Verankerung mit Zahlen).

const REM = 16;
/** Fenster → Raum: die Aussenabstände des Route-Wrappers sind 2 × 24 px. */
const raumFuer = (fensterPx: number, ruhePx = Math.min(1072, fensterPx - 48)) =>
  ({ raumPx: fensterPx - 48, ruhePx, remPx: REM });

const LAGE: RahmenLage = {
  raum: raumFuer(1440),
  spaltenLage: true,
  tocOffen: true,
  blattOffen: true,
  ruheForm: 'rechts',
};

describe('Ä60 (c) · das Blatt bekommt eine eigene Spur — und wo nicht', () => {
  it('Positiv-Sonde: die Grundlage stimmt (84 rem = 18 + 2 + 40 + 2 + 22)', () => {
    // 84 → 82.5 am 29.8.2026: SPUR_ABSTAND 2 → 1.25 rem (Auftrag David,
    // deklarierte fachliche Änderung — weniger Abstand Gliederung ↔ Text).
    expect(LESER_MAX_REM).toBe(82.5);
    expect(LESER_MAX_REM * REM).toBe(1320);
  });

  it('@1440 stehen alle drei Spuren, und der Rahmen wächst auf genau 1320 px', () => {
    const b = rahmenBild(LAGE);
    expect(b.blattForm).toBe('spalte');
    expect(b.gliederungSpalte).toBe(true);
    expect(b.schiene).toBe(false);
    expect(b.spalten).toBe('18rem minmax(0,1fr) 22rem');
    expect(b.breite?.width).toBe('var(--leser-max-w)');
    expect((b.breite as Record<string, string>)['--leser-max-w']).toBe('1320px');
  });

  it('unter 82.5 rem weicht die GLIEDERUNG, nie das Lesemass', () => {
    for (const fenster of [1024, 1100, 1150, 1280, 1367]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.blattForm, `@${fenster}`).toBe('spalte');
      expect(b.gliederungSpalte, `@${fenster}: Gliederungsspalte UND Blatt — der Text wird gequetscht`).toBe(false);
      expect(b.schiene, `@${fenster}: keine Schiene — die Gliederung wäre unerreichbar`).toBe(true);
      expect(b.schieneHoltPlatz, `@${fenster}: der Schienen-Griff schlösse das Blatt nicht`).toBe(true);
      // Und die Lesespalte, die dabei bleibt: Raum − Schiene − 2 × Abstand − Blatt.
      const lese = (fenster - 48) - 36 - 20 - 20 - 352;
      expect(lese, `@${fenster}: Lesespalte ${lese} px unter dem 448-px-Boden`).toBeGreaterThanOrEqual(448);
    }
  });

  it('ab 82.5 rem Raum bleibt die Gliederungsspalte stehen', () => {
    for (const fenster of [1368, 1440, 1920, 2560]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.gliederungSpalte, `@${fenster}`).toBe(true);
      expect((b.breite as Record<string, string>)['--leser-max-w'],
        `@${fenster}: der Rahmen wächst über seine drei Spuren hinaus`).toBe('1320px');
    }
  });

  // ── §6.3-DEKLARATION (W2·24-R6/M1, 6.9.2026) · ZWEITER GRUND ZUR AUFWEITUNG ─
  // Bis hierher hing die Aufweitung ALLEIN am Treffer-Blatt, und dieser Fall
  // hielt das fest. Seit R6 holt auch die RANDNOTIZ-Spalte Platz — sie ist die
  // dritte Spur des Satzspiegels und braucht dieselbe Rechnung. Der Grund ist
  // gemessen: ohne Aufweitung ruht der Rahmen auf 1072 px, die Lese-Zelle bleibt
  // 764 px, und `'voll'` (Randnotizen rechts) verlangt 976 — der Zweig konnte
  // auf KEINER Bildschirmbreite feuern (@1440/@1700/@1920 je `150px 578px`,
  // `.lr-notiz` 0×). Deklarierte fachliche Änderung, kein Refactoring.
  // Die ABSICHT des Falls bleibt und wird schärfer: er prüft weiter, dass ohne
  // Blatt keine Blatt-Spur entsteht (`blattForm`, `spalten`) — nur die
  // Rahmenbreite ist jetzt an eine zweite, ausdrücklich benannte Bedingung
  // gebunden statt an gar keine. Der Pane-Fall unten bewacht die Gegenrichtung.
  it('geschlossenes Blatt: keine Blatt-Spur — aufgeweitet wird für die Randnotiz', () => {
    const b = rahmenBild({ ...LAGE, blattOffen: false });
    expect(b.blattForm).toBe('rechts');
    expect(b.spalten).toBe('18rem minmax(0,1fr)');
    expect(b.satzspiegel, '@1440 trägt der aufgeweitete Rahmen die Randnotiz').toBe('voll');
    expect((b.breite as Record<string, string>)['--leser-max-w'],
      'für die dritte Spur des Satzspiegels wächst der Rahmen wie fürs Blatt').toBe('1320px');
  });

  it('zu schmal für die Randnotiz ⇒ auch ohne Blatt keine Aufweitung', () => {
    // 1150 px Fenster: aufgeweitet blieben der Zelle 1102 − 308 = 794 px, also
    // unter `SPIEGEL_MIN_VOLL` (976). Nichts zu gewinnen, nichts zu weiten.
    const b = rahmenBild({ ...LAGE, blattOffen: false, raum: raumFuer(1150) });
    expect(b.satzspiegel).not.toBe('voll');
    expect(b.breite, 'ohne Gewinn wird der Rahmen nicht angefasst').toBeUndefined();
  });

  it('ohne Spalten-Lage (unter 1024 px) und im Pane bleibt alles beim Alten', () => {
    // Kein `spaltenLage` ⇒ kein Grid, keine Spur, keine Aufweitung.
    const schmal = rahmenBild({ ...LAGE, spaltenLage: false, raum: raumFuer(1000) });
    expect(schmal.blattForm).toBe('rechts');
    expect(schmal.spalten).toBeUndefined();
    expect(schmal.breite).toBeUndefined();
    // Im Pane ist die Ruhe-Gestalt `'unten'` — die harte Regel «nie drei
    // vertikale Flächen im Split-View» bleibt unberührt, egal wie breit es ist.
    const pane = rahmenBild({ ...LAGE, ruheForm: 'unten', raum: raumFuer(2560) });
    expect(pane.blattForm).toBe('unten');
    expect(pane.breite).toBeUndefined();
    // R6/M1: und auch der Satzspiegel holt sich im Pane keine dritte Spur.
    expect(pane.satzspiegel, 'im Pane nie drei vertikale Flächen').not.toBe('voll');
  });

  it('zu wenig Raum für Text + Blatt ⇒ keine Spur (ausgeklappte App-Seitenleiste)', () => {
    // Schwelle seit 29.8.2026: 54.75 rem = 876 px (SPUR_ABSTAND 1.25 rem).
    const eng = { raumPx: 872, ruhePx: 872, remPx: REM };
    expect(rahmenBild({ ...LAGE, raum: eng }).blattForm).toBe('rechts');
    // Ein Pixel mehr, und die Spur steht — die Schwelle ist keine Zierde.
    expect(rahmenBild({ ...LAGE, raum: { ...eng, raumPx: 876, ruhePx: 876 } }).blattForm).toBe('spalte');
  });

  it('ohne Messung (erster Render, kein `<main>`) bleibt alles wie bisher', () => {
    const b = rahmenBild({ ...LAGE, raum: null });
    expect(b.blattForm).toBe('rechts');
    expect(b.breite).toBeUndefined();
  });

  it('der Schriftregler skaliert die Schwellen mit (rem, nicht px)', () => {
    // Bei 20-px-Wurzel braucht die volle Lage 84 × 20 = 1680 px Raum.
    const gross = { raumPx: 1392, ruhePx: 1340, remPx: 20 };
    const b = rahmenBild({ ...LAGE, raum: gross });
    expect(b.gliederungSpalte, 'bei grösserer Schrift passen die drei Spuren @1440 nicht mehr').toBe(false);
    expect((b.breite as Record<string, string>)['--leser-max-w']).toBe('1392px');
  });
});

// ── DIE VERANKERUNG: der Text weicht nur so weit, wie er muss ───────────────
// Der Rahmen wächst ZUERST in den freien Rand rechts und rückt nur um den Rest
// nach links. Ohne diese Regel schöbe das Öffnen den gelesenen Text @1920 um
// 152 px waagrecht weg, obwohl rechts 400 px frei liegen.
describe('Ä60 (c) · die Aufweitung rückt so wenig wie möglich nach links', () => {
  const dx = (fenster: number) => {
    const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
    return parseFloat(String((b.breite as Record<string, string>).marginInlineStart));
  };

  it('@1920 rückt nichts (der freie Rand rechts trägt die ganze Aufweitung)', () => {
    expect(dx(1920)).toBe(0);
  });

  it('@1440 rückt genau der Rest — 88 px seit dem schmaleren Spur-Abstand (29.8.2026)', () => {
    expect(dx(1440)).toBe(-88);
  });

  it('der Kasten geht auf: Anfang + Breite + Ende = Elternbreite', () => {
    for (const fenster of [1150, 1280, 1440, 1920]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      const s = b.breite as Record<string, string>;
      const summe = parseFloat(s.marginInlineStart) + parseFloat(s['--leser-max-w']) + parseFloat(s.marginInlineEnd);
      expect(summe, `@${fenster}`).toBe(raumFuer(fenster).ruhePx);
    }
  });
});
