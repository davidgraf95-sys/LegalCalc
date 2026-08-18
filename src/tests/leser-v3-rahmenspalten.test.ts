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
    expect(LESER_MAX_REM).toBe(84);
    expect(LESER_MAX_REM * REM).toBe(1344);
  });

  it('@1440 stehen alle drei Spuren, und der Rahmen wächst auf genau 1344 px', () => {
    const b = rahmenBild(LAGE);
    expect(b.blattForm).toBe('spalte');
    expect(b.gliederungSpalte).toBe(true);
    expect(b.schiene).toBe(false);
    expect(b.spalten).toBe('18rem minmax(0,1fr) 22rem');
    expect(b.breite?.width).toBe('var(--leser-max-w)');
    expect((b.breite as Record<string, string>)['--leser-max-w']).toBe('1344px');
  });

  it('unter 84 rem weicht die GLIEDERUNG, nie das Lesemass', () => {
    for (const fenster of [1024, 1100, 1150, 1280, 1391]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.blattForm, `@${fenster}`).toBe('spalte');
      expect(b.gliederungSpalte, `@${fenster}: Gliederungsspalte UND Blatt — der Text wird gequetscht`).toBe(false);
      expect(b.schiene, `@${fenster}: keine Schiene — die Gliederung wäre unerreichbar`).toBe(true);
      expect(b.schieneHoltPlatz, `@${fenster}: der Schienen-Griff schlösse das Blatt nicht`).toBe(true);
      // Und die Lesespalte, die dabei bleibt: Raum − Schiene − 2 × Abstand − Blatt.
      const lese = (fenster - 48) - 36 - 32 - 32 - 352;
      expect(lese, `@${fenster}: Lesespalte ${lese} px unter dem 448-px-Boden`).toBeGreaterThanOrEqual(448);
    }
  });

  it('ab 84 rem Raum bleibt die Gliederungsspalte stehen', () => {
    for (const fenster of [1392, 1440, 1920, 2560]) {
      const b = rahmenBild({ ...LAGE, raum: raumFuer(fenster) });
      expect(b.gliederungSpalte, `@${fenster}`).toBe(true);
      expect((b.breite as Record<string, string>)['--leser-max-w'],
        `@${fenster}: der Rahmen wächst über seine drei Spuren hinaus`).toBe('1344px');
    }
  });

  it('geschlossenes Blatt = der Rahmen von heute, Zeichen für Zeichen', () => {
    const b = rahmenBild({ ...LAGE, blattOffen: false });
    expect(b.blattForm).toBe('rechts');
    expect(b.breite, 'ohne offenes Blatt darf nichts aufgeweitet werden').toBeUndefined();
    expect(b.spalten).toBe('18rem minmax(0,1fr)');
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
  });

  it('zu wenig Raum für Text + Blatt ⇒ keine Spur (ausgeklappte App-Seitenleiste)', () => {
    // Fenster 1200 px, App-Seitenleiste 256 px ⇒ Raum 896 < 900 (56.25 rem).
    const eng = { raumPx: 896, ruhePx: 896, remPx: REM };
    expect(rahmenBild({ ...LAGE, raum: eng }).blattForm).toBe('rechts');
    // Ein Pixel mehr, und die Spur steht — die Schwelle ist keine Zierde.
    expect(rahmenBild({ ...LAGE, raum: { ...eng, raumPx: 900, ruhePx: 900 } }).blattForm).toBe('spalte');
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

  it('@1440 rückt genau der Rest — 112 px, gemessen im Browser bestätigt', () => {
    expect(dx(1440)).toBe(-112);
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
