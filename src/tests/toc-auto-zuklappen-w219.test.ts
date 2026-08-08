// @vitest-environment node
/**
 * W2·19-GLIEDERUNG · S5 — die Zuklapp-Regel des Gliederungsbaums (F2).
 *
 * Bau-Spec: fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §3.6.
 *
 * WARUM DIESER TEST ÜBERHAUPT EXISTIERT (§6.7 «ein Tor, das nicht scheitern
 * kann, ist gefährlicher als keines»). Für S5 war ein Rot-Zwischenstand Pflicht.
 * Gegen die bestehenden e2e-Tore liess er sich NICHT erzeugen: zwei bewusst
 * eingebaute Sabotagen — (a) Sichtband-Wächter entfernt, also auch sichtbare
 * Äste kollabieren, (b) Kompensation verzehnfacht — liefen beide vollständig
 * GRÜN durch `leser-gliederung-a33` und `leser-kopf-a9` (je gebaut und gegen den
 * echten Build gefahren). Der Grund ist strukturell: das Auto-Zuklappen greift
 * erst, wenn ein Ast AUTO_ZU_NACHLAUF (6) Pfadwechsel alt ist, und so weit
 * scrollen die a33-/a9-Fälle nicht. Die Mechanik war damit ungetestet — der
 * Zustand, vor dem §6.7 warnt.
 *
 * Dieser Test schliesst die Lücke dort, wo die Entscheidung wirklich fällt: an
 * der reinen Funktion `planeZuklappen`. Geprüft wird die REGEL (Sichtband-
 * Wächter, Nachlauf-Fenster, Aktiv-Pfad-Schutz, Kompensation nur für die
 * äussersten Oberhalb-Äste), nicht das Browser-Layout.
 *
 * DOM-DOUBLE statt echter DOM: die Suite läuft in `node` (kein jsdom im Projekt,
 * und `linkedom` liefert für `getBoundingClientRect` nur Nullen). `planeZuklappen`
 * berührt genau fünf DOM-Fähigkeiten — Container-Rect, `querySelector` auf dem
 * Container und auf der Zeile, Ast-Rect und `contains`. Die werden hier exakt
 * nachgebildet; alles andere wäre Kulisse, die nichts beweist.
 */
import { describe, it, expect } from 'vitest';
import { planeZuklappen, AUTO_ZU_NACHLAUF, F2_SICHERHEITSSAUM, F2_OBERHALB } from '../pages/gesetz-leser/tocAutoZuklappen';

interface ZeilenBau {
  /** Ids, die diese Zeile trägt (verdichtete Kette: mehrere). */
  ids: string[];
  /** Lage des KIND-Containers; `null` = Zeile hat keinen offenen Ast. */
  ast: { top: number; bottom: number } | null;
  /** Ids der Zeilen, deren Ast INNERHALB dieses Astes liegt (Verschachtelung). */
  enthaelt?: string[];
}

/** Baut einen Container-Doppelgänger mit dem Sichtband [contTop, contBottom]. */
function baueToc(contTop: number, contBottom: number, zeilen: ZeilenBau[]): HTMLElement {
  const aeste = new Map<string, { rect: { top: number; bottom: number }; enthaelt: string[] }>();
  for (const z of zeilen) {
    if (z.ast) aeste.set(z.ids[0], { rect: z.ast, enthaelt: z.enthaelt ?? [] });
  }

  const astEl = (schluessel: string): HTMLElement => {
    const eintrag = aeste.get(schluessel)!;
    const el = {
      __id: schluessel,
      getBoundingClientRect: () => ({
        top: eintrag.rect.top,
        bottom: eintrag.rect.bottom,
        height: eintrag.rect.bottom - eintrag.rect.top,
      }),
      contains: (anderer: { __id?: string }) =>
        anderer?.__id !== undefined && eintrag.enthaelt.includes(anderer.__id),
    };
    return el as unknown as HTMLElement;
  };

  const zeileEl = (z: ZeilenBau): HTMLElement => ({
    querySelector: (sel: string) =>
      sel === ':scope > div.grid' && z.ast ? astEl(z.ids[0]) : null,
  } as unknown as HTMLElement);

  return {
    getBoundingClientRect: () => ({ top: contTop, bottom: contBottom, height: contBottom - contTop }),
    querySelector: (sel: string) => {
      const treffer = /\[data-sektion-ids~="([^"]+)"\]/.exec(sel);
      if (!treffer) return null;
      const z = zeilen.find((x) => x.ids.includes(treffer[1]));
      return z ? zeileEl(z) : null;
    },
  } as unknown as HTMLElement;
}

/** Ticks so setzen, dass jede Id das Nachlauf-Fenster überschritten hat. */
const alt = (ids: string[]): Map<string, number> => new Map(ids.map((id) => [id, 0]));
// Die Oberhalb-Richtung ist in der Produktion per Fallback ABGESCHALTET
// (F2_OBERHALB = false, Herleitung dort). Die REGEL bleibt implementiert und
// geprüft — sie wird gebraucht, sobald der Nachfolge-Mechanismus steht. Wo ein
// Fall sie prüft, wird sie darum ausdrücklich eingeschaltet.
const MIT_OBEN = { oberhalbErlaubt: true } as const;
const TICK = AUTO_ZU_NACHLAUF + 5;

// Sichtband des Containers in dieser Datei: y = 100 … 500.
const OBEN = { top: -300, bottom: -100 };   // ganz oberhalb
const IM_BAND = { top: 200, bottom: 400 };  // mitten drin
const UNTEN = { top: 700, bottom: 900 };    // ganz unterhalb
const RAND_OBEN = { top: -50, bottom: 150 };  // ragt ins Band hinein
const RAND_UNTEN = { top: 450, bottom: 650 }; // ragt ins Band hinein

describe('S5 — Sichtband-Wächter: was zugeklappt werden darf', () => {
  it('UNTERHALB: klappt zu, ohne Kompensation (nichts Sichtbares bewegt sich)', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: UNTEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) });
    expect(plan.schliessen).toEqual(['sek-1']);
    expect(plan.kompensation).toBe(0);
  });

  it('OBERHALB: klappt zu UND meldet die verschwindende Höhe zur Kompensation', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual(['sek-1']);
    expect(plan.kompensation).toBe(200); // -300 … -100
  });

  it('IM BAND: bleibt offen — der 19.7.-Wächter gilt hier weiter', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: IM_BAND }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) });
    expect(plan.schliessen).toEqual([]);
    expect(plan.kompensation).toBe(0);
  });

  it('AM RAND (ragt ins Band): bleibt offen — «berührt» genügt, beide Richtungen', () => {
    for (const ast of [RAND_OBEN, RAND_UNTEN]) {
      const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast }]);
      const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) });
      expect(plan.schliessen, `Ast ${JSON.stringify(ast)} darf nicht zuklappen`).toEqual([]);
    }
  });

  it('KNAPP DANEBEN bleibt offen — der Sicherheitssaum (Regression a33-Rotlauf)', () => {
    // DER FALL, DER GEFEHLT HAT. Der rote a33-Lauf (CLS 0.050354, drei sichtbare
    // Zeilen 280×43 → 0×0) entstand NICHT daran, dass der Wächter die Ausdehnung
    // falsch mass — eine Sonde im gebauten Stand hat für alle acht beobachteten
    // Geometrie-Urteile belegt, dass zum Messzeitpunkt keine Kind-Zeile im Band
    // lag. Er entstand daran, dass «gerade eben draussen» als sicher galt: bis
    // die Mutation committet war, hatte sich der Scroller weiterbewegt, und der
    // Ast stand im Band. Ein Ast, der nur um wenige Pixel am Band vorbeischrammt,
    // darf darum nicht mehr zuklappen. Gegen den Stand VOR dieser Regel ist genau
    // dieser Fall rot — dort zählte jeder Pixel jenseits der Kante als «draussen».
    // ABSOLUTE Werte, bewusst nicht aus der Konstanten abgeleitet: dieser Fall
    // beschreibt die REALE Gefahr (ein Ast, der nur 10–20 px am Band vorbeizieht
    // und bis zum Commit hineinrutscht), nicht die jeweils eingestellte Kante.
    // Würde er aus `F2_SICHERHEITSSAUM` rechnen, wanderte er mit jeder Änderung
    // der Konstanten mit — und könnte den Rückbau des Saums nicht mehr rot
    // zeigen. Genau das ist beim ersten Entwurf passiert (mit Saum 0 blieb er
    // grün, weil die Fixtures mitrutschten); die Kanten-Fälle unten dürfen die
    // Konstante lesen, dieser hier nicht.
    const knappOben = { top: -300, bottom: 90 };   // 10 px über der Bandoberkante
    const knappUnten = { top: 520, bottom: 900 };  // 20 px unter der Bandunterkante
    for (const ast of [knappOben, knappUnten]) {
      const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast }]);
      const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
      expect(plan.schliessen, `Ast ${JSON.stringify(ast)} liegt im Saum und darf nicht zuklappen`).toEqual([]);
      expect(plan.kompensation).toBe(0);
    }
    // Einen Pixel weiter draussen greift die Regel wieder — der Saum ist eine
    // Kante, keine Abschaltung.
    for (const [ast, was] of [
      [{ top: -300, bottom: 100 - F2_SICHERHEITSSAUM }, 'oben'],
      [{ top: 500 + F2_SICHERHEITSSAUM, bottom: 900 }, 'unten'],
    ] as const) {
      const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast }]);
      const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
      expect(plan.schliessen, `${was}: exakt am Saum muss zuklappen`).toEqual(['sek-1']);
    }
  });

  it('Fallback F2_OBERHALB=false stellt exakt den 19.7.-Zustand her', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }, { ids: ['sek-2'], ast: UNTEN }]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK,
      ticks: alt(['sek-1', 'sek-2']), oberhalbErlaubt: false,
    });
    expect(plan.schliessen).toEqual(['sek-2']); // nur der Ast UNTERHALB
    expect(plan.kompensation).toBe(0);
  });
});

describe('S5 — wer geschützt bleibt', () => {
  it('der aktive Pfad klappt nie zu, egal wie alt der Tick ist', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: ['sek-1'], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual([]);
  });

  it('innerhalb des Nachlauf-Fensters passiert nichts — die Kante liegt bei > NACHLAUF', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const bau = (tick: number) => planeZuklappen({
      tocCont: toc, auto: ['sek-1'], aktivIds: [], tick, ticks: new Map([['sek-1', 0]]), ...MIT_OBEN,
    });
    expect(bau(AUTO_ZU_NACHLAUF).schliessen).toEqual([]);      // genau am Fenster
    expect(bau(AUTO_ZU_NACHLAUF + 1).schliessen).toEqual(['sek-1']); // eins darüber
  });

  it('eine verdichtete Kette wird über JEDE ihrer Ids gefunden (data-sektion-ids~=)', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-7', 'sek-8', 'sek-9'], ast: OBEN }]);
    for (const id of ['sek-7', 'sek-8', 'sek-9']) {
      const plan = planeZuklappen({ tocCont: toc, auto: [id], aktivIds: [], tick: TICK, ticks: alt([id]), ...MIT_OBEN });
      expect(plan.schliessen, `${id} muss die Zeile treffen`).toEqual([id]);
      expect(plan.kompensation).toBe(200);
    }
  });

  it('ohne Container und ohne gerenderte Zeile wird nichts angefasst (keine Blind-Aktion)', () => {
    expect(planeZuklappen({ tocCont: null, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']) }))
      .toEqual({ schliessen: [], kompensation: 0 });
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-fremd'], aktivIds: [], tick: TICK, ticks: alt(['sek-fremd']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual([]);
  });

  it('eine Zeile ohne offenen Ast liefert nichts zu schliessen', () => {
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: null }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1'], aktivIds: [], tick: TICK, ticks: alt(['sek-1']), ...MIT_OBEN });
    expect(plan.schliessen).toEqual([]);
  });

  it('PRODUKTIONS-DEFAULT ist der gezogene Fallback: oberhalb wird NICHT zugeklappt', () => {
    // Der Schalter steht nach dem a33-Rotlauf auf `false` (Herleitung dort).
    // Dieser Fall hält den Ist-Zustand fest, damit ein Wiedereinschalten eine
    // BEWUSSTE Änderung ist und nicht unbemerkt mitläuft.
    expect(F2_OBERHALB).toBe(false);
    const toc = baueToc(100, 500, [{ ids: ['sek-1'], ast: OBEN }, { ids: ['sek-2'], ast: UNTEN }]);
    const plan = planeZuklappen({ tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']) });
    expect(plan.schliessen).toEqual(['sek-2']);
    expect(plan.kompensation).toBe(0);
  });
});

describe('S5 — Kompensation zählt nur die äussersten Äste', () => {
  it('verschachtelte Äste werden NICHT doppelt gezählt', () => {
    // sek-1 umschliesst sek-2; beide liegen oberhalb und dürften zuklappen.
    // Die Höhe von sek-2 steckt bereits in sek-1 — summierte man beide,
    // überkompensierte der Scroll und der Baum spränge in die Gegenrichtung.
    const toc = baueToc(100, 500, [
      { ids: ['sek-1'], ast: { top: -400, bottom: -100 }, enthaelt: ['sek-2'] },
      { ids: ['sek-2'], ast: { top: -300, bottom: -200 } },
    ]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']), ...MIT_OBEN,
    });
    expect(plan.schliessen.sort()).toEqual(['sek-1', 'sek-2']);
    expect(plan.kompensation).toBe(300); // NUR sek-1, nicht 300 + 100
  });

  it('nebeneinanderliegende Oberhalb-Äste werden addiert', () => {
    const toc = baueToc(100, 500, [
      { ids: ['sek-1'], ast: { top: -400, bottom: -300 } },
      { ids: ['sek-2'], ast: { top: -250, bottom: -100 } },
    ]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']), ...MIT_OBEN,
    });
    expect(plan.kompensation).toBe(100 + 150);
  });

  it('ein Ast unterhalb trägt nie zur Kompensation bei, auch neben einem oberhalb', () => {
    const toc = baueToc(100, 500, [
      { ids: ['sek-1'], ast: OBEN },
      { ids: ['sek-2'], ast: UNTEN },
    ]);
    const plan = planeZuklappen({
      tocCont: toc, auto: ['sek-1', 'sek-2'], aktivIds: [], tick: TICK, ticks: alt(['sek-1', 'sek-2']), ...MIT_OBEN,
    });
    expect(plan.schliessen.sort()).toEqual(['sek-1', 'sek-2']);
    expect(plan.kompensation).toBe(200); // nur der Oberhalb-Ast
  });
});
