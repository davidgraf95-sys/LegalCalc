// src/tests/plan-retro17.test.ts — Deutung der Bau-Messreihe (QS-SELBSTOPT, Stufe 2).
//
// Geprüft werden die reinen Funktionen aus `scripts/plan/retro-17.ts` über
// FIXIERTEN Zeitreihen — kein Dateisystem, kein Netz, keine Wanduhr. Der
// CLI-Teil der Datei liegt hinter `if (!process.env.VITEST)` und läuft hier nie.
import {
  CI_FAILURE_SCHWELLE,
  CI_RERUN_SCHWELLE,
  ENTWURF_MARKE,
  MIN_SNAPSHOTS,
  NIE_ROT_MINDEST_LAEUFE,
  ROT_MINDEST,
  befunde,
  bericht,
  chronikTreffer,
} from '../../scripts/plan/retro17Kern';
import { GENERIERT_MARKE, type Snapshot, type TorAggregat, type Zeitreihe } from '../../scripts/plan/selbstoptKern';

function aggregat(je: Record<string, { gesamt: number; rot: number }>): TorAggregat {
  let gesamt = 0;
  let rot = 0;
  for (const z of Object.values(je)) {
    gesamt += z.gesamt;
    rot += z.rot;
  }
  return { gesamt, rot, je };
}

function snapshot(p: Partial<Snapshot> = {}): Snapshot {
  return {
    erhobenAm: '2026-08-07T10:00:00.000Z',
    headCommit: 'abcdef1234567890abcdef1234567890abcdef12',
    torRot: { seitLetztem: aggregat({}), kumuliert: aggregat({}) },
    ci: null,
    rework: null,
    flaky: null,
    tokens: null,
    fKlassen: {},
    ausfaelle: [],
    ...p,
  };
}

function reihe(snapshots: Snapshot[]): Zeitreihe {
  return { _generiert: GENERIERT_MARKE, schema: 1, snapshots };
}

/** `MIN_SNAPSHOTS` Snapshots mit fortlaufenden Zeitstempeln; der letzte trägt die Daten. */
function dickeReihe(letzter: Partial<Snapshot>): Zeitreihe {
  const vor = Array.from({ length: MIN_SNAPSHOTS - 1 }, (_, i) =>
    snapshot({ erhobenAm: `2026-08-0${i + 1}T10:00:00.000Z` }),
  );
  return reihe([...vor, snapshot({ erhobenAm: '2026-08-06T10:00:00.000Z', ...letzter })]);
}

describe('chronikTreffer', () => {
  it('zählt nur Wortgrenzen-Treffer, nie blosse Substring-Präsenz', () => {
    // Dispatch-§0 Ziff. 2: Belege sind Identitäts-Treffer. Ohne Wortgrenze
    // gälte «check:plan» als belegt durch «check:planung».
    expect(chronikTreffer('… check:plan lief grün …', 'check:plan')).toBe(1);
    expect(chronikTreffer('… check:planung wurde gebaut …', 'check:plan')).toBe(0);
    expect(chronikTreffer('check:plan und check:plan', 'check:plan')).toBe(2);
    expect(chronikTreffer('nichts dergleichen', 'check:plan')).toBe(0);
  });

  it('behandelt Sonderzeichen im Tor-Namen als Text, nicht als Regex', () => {
    expect(chronikTreffer('gate:golden:vergleich war ok', 'gate:golden:vergleich')).toBe(1);
  });
});

describe('befunde — Rot-Häufung', () => {
  it('meldet ein Tor über Quote UND Mindestzahl', () => {
    const z = dickeReihe({
      torRot: { seitLetztem: aggregat({}), kumuliert: aggregat({ 'check:wackel': { gesamt: 20, rot: 5 } }) },
    });
    const f = befunde(z, '');
    expect(f.map((x) => x.art)).toContain('rot-haeufung');
    expect(f[0].anlass).toContain('5 von 20');
  });

  it('schweigt unter der Mindestzahl, auch bei hoher Quote', () => {
    // 2 von 2 sind 100 % — und trotzdem kein Befund: zwei Läufe belegen nichts.
    const z = dickeReihe({
      torRot: { seitLetztem: aggregat({}), kumuliert: aggregat({ 'check:selten': { gesamt: 2, rot: 2 } }) },
    });
    expect(befunde(z, '').filter((x) => x.art === 'rot-haeufung')).toHaveLength(0);
    expect(ROT_MINDEST).toBeGreaterThan(2);
  });

  it('schweigt unter der Quote, auch bei vielen roten Läufen', () => {
    const z = dickeReihe({
      torRot: { seitLetztem: aggregat({}), kumuliert: aggregat({ 'check:gross': { gesamt: 1000, rot: 4 } }) },
    });
    expect(befunde(z, '').filter((x) => x.art === 'rot-haeufung')).toHaveLength(0);
  });

  it('nimmt den Chronik-Kontext in den Anlass auf', () => {
    const kum = aggregat({ 'check:wackel': { gesamt: 20, rot: 5 } });
    const z = dickeReihe({ torRot: { seitLetztem: aggregat({}), kumuliert: kum } });
    expect(befunde(z, 'einst wurde check:wackel gebaut')[0].anlass).toContain('check:wackel 1×');
    expect(befunde(z, 'nichts')[0].anlass).toContain('nicht als Bau-Gegenstand belegt');
  });
});

describe('befunde — «nie rot»', () => {
  const kum = aggregat({ 'check:still': { gesamt: NIE_ROT_MINDEST_LAEUFE, rot: 0 } });

  it('meldet einen PRÜFkandidaten bei ausreichender Datenlage', () => {
    const f = befunde(dickeReihe({ torRot: { seitLetztem: aggregat({}), kumuliert: kum } }), '');
    const nr = f.find((x) => x.art === 'nie-rot');
    expect(nr).toBeDefined();
    // Der Chesterton-Vorbehalt gehört IN den Vorschlag, nicht in eine Fussnote.
    expect(nr!.hinweis).toContain('Chesterton');
    expect(nr!.hinweis).toContain('Sabotage-Probe');
    expect(nr!.titel).toContain('auf Wirksamkeit prüfen');
  });

  it('ist bei dünner Datenlage AUSGESETZT — keine Streich-Empfehlung', () => {
    const duenn = reihe([snapshot({ torRot: { seitLetztem: aggregat({}), kumuliert: kum } })]);
    expect(befunde(duenn, '').filter((x) => x.art === 'nie-rot')).toHaveLength(0);
  });

  it('schweigt bei zu wenigen Läufen, auch wenn nie rot', () => {
    const wenig = aggregat({ 'check:neu': { gesamt: NIE_ROT_MINDEST_LAEUFE - 1, rot: 0 } });
    const z = dickeReihe({ torRot: { seitLetztem: aggregat({}), kumuliert: wenig } });
    expect(befunde(z, '').filter((x) => x.art === 'nie-rot')).toHaveLength(0);
  });

  // Steuerungs-Diät 29.8.2026: Die Regel erzeugte je Tor einen eigenen Block —
  // im Bestand ~30 wortgleiche Blöcke, die sich nur im Namen und in zwei Zahlen
  // unterschieden. Jetzt EINE Sammelzeile; ohne dieses Tor fiele ein Rückfall
  // auf die alte Form nicht auf (§6.7).
  it('viele Kandidaten ergeben EINEN Befund, nicht einen je Tor', () => {
    const viele = aggregat(Object.fromEntries(
      ['check:a', 'check:b', 'check:c', 'check:d'].map((t) => [t, { gesamt: NIE_ROT_MINDEST_LAEUFE, rot: 0 }]),
    ));
    const f = befunde(dickeReihe({ torRot: { seitLetztem: aggregat({}), kumuliert: viele } }), '');
    const nr = f.filter((x) => x.art === 'nie-rot');
    expect(nr).toHaveLength(1);
    expect(nr[0].titel).toBe('4 Tore auf Wirksamkeit prüfen — nie rot über die ganze Messreihe');
    // Alle Namen stehen im Anlass, alphabetisch — die Information geht nicht verloren.
    for (const t of ['check:a', 'check:b', 'check:c', 'check:d']) expect(nr[0].anlass).toContain(t);
    expect(nr[0].anlass.indexOf('check:a')).toBeLessThan(nr[0].anlass.indexOf('check:d'));
  });

  it('ein einzelner Kandidat behält den Tor-Namen im Titel', () => {
    const f = befunde(dickeReihe({ torRot: { seitLetztem: aggregat({}), kumuliert: kum } }), '');
    expect(f.find((x) => x.art === 'nie-rot')!.titel).toContain('check:still');
  });
});

describe('befunde — CI-Quoten', () => {
  it('meldet Failure- und Rerun-Rate ab Schwelle', () => {
    const z = dickeReihe({
      ci: { laeufe: 50, verdikte: 50, failureRate: CI_FAILURE_SCHWELLE, cancelledRate: 0, rerunRate: CI_RERUN_SCHWELLE, je: { failure: 10, success: 40 } },
    });
    const arten = befunde(z, '').map((x) => x.art);
    expect(arten).toContain('ci-failure');
    expect(arten).toContain('ci-rerun');
  });

  it('schweigt unter der Schwelle', () => {
    const z = dickeReihe({ ci: { laeufe: 50, verdikte: 50, failureRate: 0.01, cancelledRate: 0, rerunRate: 0.01, je: {} } });
    expect(befunde(z, '').filter((x) => x.art.startsWith('ci-'))).toHaveLength(0);
  });

  it('schweigt, wenn CI gar nicht erhoben wurde (null ist nicht 0)', () => {
    expect(befunde(dickeReihe({ ci: null }), '').filter((x) => x.art.startsWith('ci-'))).toHaveLength(0);
  });
});

describe('befunde — F-Klassen-Rückfall', () => {
  it('meldet nur den ANSTIEG zwischen erstem und letztem Snapshot', () => {
    const z = reihe([
      snapshot({ erhobenAm: '2026-08-01T10:00:00.000Z', fKlassen: { F2e: 2, F6: 2 } }),
      snapshot({ erhobenAm: '2026-08-09T10:00:00.000Z', fKlassen: { F2e: 3, F6: 2 } }),
    ]);
    const f = befunde(z, '').filter((x) => x.art === 'f-klasse');
    expect(f).toHaveLength(1);
    expect(f[0].titel).toContain('F2e');
    expect(f[0].anlass).toContain('2 → 3');
    expect(f[0].hinweis).toContain('eskalieren');
  });

  it('wertet eine neue Klasse gegen 0 und schweigt bei Gleichstand', () => {
    const z = reihe([
      snapshot({ erhobenAm: '2026-08-01T10:00:00.000Z', fKlassen: { F1: 1 } }),
      snapshot({ erhobenAm: '2026-08-09T10:00:00.000Z', fKlassen: { F1: 1, F7: 1 } }),
    ]);
    const f = befunde(z, '').filter((x) => x.art === 'f-klasse');
    expect(f).toHaveLength(1);
    expect(f[0].titel).toContain('F7');
  });
});

describe('bericht', () => {
  it('sagt bei dünner Datenlage ausdrücklich, dass nichts belegbar ist', () => {
    const t = bericht(reihe([snapshot()]), '').join('\n');
    expect(t).toContain('DATENLAGE DÜNN');
    expect(t).toContain('Keine Streich-Empfehlung belegbar');
  });

  it('sagt bei leerer Reihe, dass zuerst gemessen werden muss', () => {
    const t = bericht(reihe([]), '').join('\n');
    expect(t).toContain('KEINE DATENLAGE');
    expect(t).toContain('selbstopt:erheben');
  });

  it('markiert JEDE Vorschlagszeile als ENTWURF und vergibt kein @meta', () => {
    const z = dickeReihe({
      torRot: { seitLetztem: aggregat({}), kumuliert: aggregat({ 'check:wackel': { gesamt: 20, rot: 5 } }) },
      ci: { laeufe: 50, verdikte: 50, failureRate: 0.5, cancelledRate: 0, rerunRate: 0.5, je: {} },
    });
    const zeilen = bericht(z, '');
    const vorschlaege = zeilen.filter((l) => l.startsWith('- [ ] **'));
    const marken = zeilen.filter((l) => l.trim() === ENTWURF_MARKE);
    expect(vorschlaege.length).toBeGreaterThan(0);
    expect(marken).toHaveLength(vorschlaege.length);
    // Kein ETIKETT: eine erfundene ID stünde nicht im Inventar und machte
    // check:plan rot. Der Kopftext ERWÄHNT `@meta` (er erklärt, dass die
    // übernehmende Session es selbst vergibt) — geprüft wird deshalb die
    // Etikett-SYNTAX, nicht das blosse Wort.
    expect(zeilen.join('\n')).not.toContain('<!-- @meta');
  });

  it('nennt die gesetzten Schwellen, damit sie nicht für Messwerte gehalten werden', () => {
    const t = bericht(dickeReihe({}), '').join('\n');
    expect(t).toContain('Gesetzte Schwellen (keine Messwerte)');
  });

  it('sagt es, wenn nichts auffällig ist', () => {
    expect(bericht(dickeReihe({}), '').join('\n')).toContain('Keine Auffälligkeit');
  });

  it('behauptet nie, etwas geschrieben oder entschieden zu haben', () => {
    const t = bericht(dickeReihe({}), '').join('\n');
    expect(t).toContain('SCHLÄGT VOR und entscheidet nichts');
    expect(t).toContain('committet nicht');
  });
});
