import { describe, it, expect, beforeEach } from 'vitest';
import { ladeTabs, merkeTab, ersetzeTab, schliesseTab, leereTabs, ordneTabsUm, naechsteInstanz, aktualisiereTabArtikel } from '../lib/tabs';

// In-App-Reiter (lib/tabs.ts): Persistenz, stabile Reihenfolge, Dublette per
// pathname, MAX-Kappung, korruptes localStorage. Reines Speicher-Werkzeug.
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

describe('tabs.ts — offene Reiter', () => {
  it('neuer Reiter hinten angehängt; Reihenfolge stabil', () => {
    merkeTab('/rechner/tagerechner');
    merkeTab('/gesetze/bund/or');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/rechner/tagerechner', '/gesetze/bund/or']);
  });

  it('Dublette per pathname: Position bleibt, Label wird aktualisiert', () => {
    merkeTab('/rechner/tagerechner');
    merkeTab('/gesetze/bund/or');
    merkeTab('/rechner/tagerechner', 'Fristenrechner');
    const t = ladeTabs();
    expect(t.map((x) => x.path)).toEqual(['/rechner/tagerechner', '/gesetze/bund/or']);
    expect(t[0].label).toBe('Fristenrechner');
  });

  it('verschiedene ?query desselben Pfads = derselbe Reiter', () => {
    merkeTab('/rechner/tagerechner?preset=a');
    merkeTab('/rechner/tagerechner?preset=b');
    expect(ladeTabs().length).toBe(1);
  });

  it('MAX 50: der älteste (vorn) fällt heraus (Limit 8→50, Auftrag David)', () => {
    for (let i = 0; i < 52; i++) merkeTab(`/rechner/r${i}`);
    const t = ladeTabs();
    expect(t.length).toBe(50);
    expect(t[0].path).toBe('/rechner/r2');
    expect(t[49].path).toBe('/rechner/r51');
  });

  it('?r-Diskriminator: dasselbe Gesetz mehrfach offen (Auftrag David)', () => {
    merkeTab('/gesetze/bund/OR');
    merkeTab('/gesetze/bund/OR?r=2');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/OR?r=2']);
    // andere Query (kein ?r) bleibt EIN Reiter
    merkeTab('/gesetze/bund/OR?preset=x');
    expect(ladeTabs().length).toBe(2);
  });

  it('naechsteInstanz: nächster freier ?r, Artikel-Anker bleibt erhalten', () => {
    merkeTab('/gesetze/bund/OR');
    expect(naechsteInstanz('/gesetze/bund/OR#art-41')).toBe('/gesetze/bund/OR?r=2#art-41');
    merkeTab('/gesetze/bund/OR?r=2');
    expect(naechsteInstanz('/gesetze/bund/OR')).toBe('/gesetze/bund/OR?r=3');
  });

  it('aktualisiereTabArtikel ändert nur den Anker des passenden Reiters', () => {
    merkeTab('/gesetze/bund/OR?r=2');
    aktualisiereTabArtikel('/gesetze/bund/OR?r=2#art-97');
    expect(ladeTabs()[0].path).toBe('/gesetze/bund/OR?r=2#art-97');
    // kein passender Reiter → keine Änderung, kein Crash
    aktualisiereTabArtikel('/gesetze/bund/ZGB#art-1');
    expect(ladeTabs().length).toBe(1);
  });

  // ── W2·24 §5a Ziff. 3 (R2-Nachzug 6.9.2026) · ERSETZEN STATT ANHÄUFEN ─────
  // VERHALTENSÄNDERUNG, deklariert: bis hierher legte JEDE Navigation einen
  // Reiter an (gemessen im Preview: drei Klicks OR → ZGB → ZPO = drei Reiter).
  // `merkeTab` behält seine anhängende Bedeutung — sie ist jetzt der Weg für den
  // AUSDRÜCKLICH neuen Reiter (Mittelklick, ⌘/Ctrl+Enter, zweite Instanz);
  // die gewöhnliche Navigation läuft über `ersetzeTab`.
  describe('ersetzeTab — die Navigation verbraucht den aktiven Reiter', () => {
    it('ersetzt an Ort und Stelle; die Reihenfolge bleibt', () => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/rechner/tagerechner');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/ZGB', '/rechner/tagerechner']);
    });

    it('drei Navigationen hintereinander = EIN Reiter (kein Wildwuchs)', () => {
      ersetzeTab(null, '/gesetze/bund/OR');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      ersetzeTab('/gesetze/bund/ZGB', '/gesetze/bund/ZPO');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/ZPO']);
    });

    it('Ziel schon offen → nur wechseln, der aktive Reiter bleibt stehen', () => {
      merkeTab('/gesetze/bund/OR');
      merkeTab('/gesetze/bund/ZGB');
      ersetzeTab('/gesetze/bund/ZGB', '/gesetze/bund/OR', 'Obligationenrecht');
      expect(ladeTabs().map((t) => t.path)).toEqual(['/gesetze/bund/OR', '/gesetze/bund/ZGB']);
      expect(ladeTabs()[0].label).toBe('Obligationenrecht');
    });

    it('kein aktiver Reiter (Kaltstart, Übersichtsseite) → anhängen wie bisher', () => {
      merkeTab('/gesetze/bund/OR');
      ersetzeTab(null, '/rechner/tagerechner');
      ersetzeTab('/gesetze/bund/UNBEKANNT', '/vorlagen/kuendigung');
      expect(ladeTabs().map((t) => t.path))
        .toEqual(['/gesetze/bund/OR', '/rechner/tagerechner', '/vorlagen/kuendigung']);
    });

    it('der ersetzte Reiter erbt NICHTS vom alten (Label, Lesestellung, Wahl)', () => {
      merkeTab('/gesetze/bund/OR#art-336_c', 'Obligationenrecht');
      aktualisiereTabArtikel('/gesetze/bund/OR#art-97');
      ersetzeTab('/gesetze/bund/OR', '/gesetze/bund/ZGB');
      expect(ladeTabs()).toEqual([{ path: '/gesetze/bund/ZGB' }]);
    });
  });

  // ── F5 (Prüfbefund 6.9.2026) · BESCHRIFTUNG AUS DER ADRESSE, NICHT AUS DEM
  // SCROLL. Rot zu bekommen: in `eintragAus` den `wahl`-Zweig streichen, oder
  // in `aktualisiereTabArtikel` `wahl` mitschreiben.
  describe('wahl — der gewählte Anker neben der Lesestellung', () => {
    it('die Adresse setzt `wahl`; der Scroll-Spy rührt sie nicht an', () => {
      merkeTab('/gesetze/bund/OR#art-336_c');
      expect(ladeTabs()[0].wahl).toBe('#art-336_c');
      aktualisiereTabArtikel('/gesetze/bund/OR#art-97');
      const t = ladeTabs()[0];
      expect(t.path, 'die Lesestellung folgt dem Scroll').toBe('/gesetze/bund/OR#art-97');
      expect(t.wahl, 'die Beschriftung folgt der Adresse').toBe('#art-336_c');
    });

    it('ein Update OHNE Anker löscht die Wahl nicht (Tracker schickt pathname+search)', () => {
      merkeTab('/gesetze/bund/OR#art-336_c');
      merkeTab('/gesetze/bund/OR');
      expect(ladeTabs()[0].wahl).toBe('#art-336_c');
    });

    it('ohne Anker in der Adresse gibt es keine Wahl (kein geratener Artikel)', () => {
      merkeTab('/gesetze/bund/ZGB');
      aktualisiereTabArtikel('/gesetze/bund/ZGB#art-3');
      expect(ladeTabs()[0].wahl).toBeUndefined();
    });
  });

  it('schliesseTab entfernt per pathname', () => {
    merkeTab('/a'); merkeTab('/b');
    schliesseTab('/a');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b']);
  });

  it('leereTabs leert die Liste', () => {
    merkeTab('/a'); leereTabs();
    expect(ladeTabs()).toEqual([]);
  });

  it('ordneTabsUm verschiebt den Reiter an die Zielposition (#12 Drag-and-Drop)', () => {
    merkeTab('/a'); merkeTab('/b'); merkeTab('/c'); merkeTab('/d');
    // /d nach vorne (an Position von /a)
    ordneTabsUm('/d', '/a');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/d', '/a', '/b', '/c']);
    // /d wieder nach hinten (an Position von /c)
    ordneTabsUm('/d', '/c');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/b', '/c', '/d']);
  });

  // ── D15/D16 (David 6.9.2026) · DIE SEITE KOMMT VOM ZEIGER ────────────────
  // «per drag and drop soll man register verschieben können … analog browser».
  // Der dritte Parameter sagt, ob der Reiter DAVOR oder DAHINTER einrastet;
  // ohne ihn liesse sich kein Reiter ans ENDE ziehen (hinter dem letzten gibt
  // es kein weiteres Ziel). Der Default bleibt die frühere, richtungsabhängige
  // Regel — der Fall darüber prüft sie unverändert weiter.
  it('ordneTabsUm mit ausdrücklicher Seite: davor / dahinter', () => {
    merkeTab('/a'); merkeTab('/b'); merkeTab('/c');
    // /a DAHINTER /c → ans Ende (mit dem Default wäre es ebenfalls dahinter,
    // hier steht es ausdrücklich).
    ordneTabsUm('/a', '/c', false);
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/c', '/a']);
    // /a DAVOR /c — dieselbe Richtung wie eben, aber die andere Seite: der
    // Default (von > nach ⇒ davor … hier von < nach) läge falsch.
    leereTabs(); merkeTab('/a'); merkeTab('/b'); merkeTab('/c');
    ordneTabsUm('/a', '/c', true);
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/a', '/c']);
    // Rückwärts, ausdrücklich dahinter.
    leereTabs(); merkeTab('/a'); merkeTab('/b'); merkeTab('/c');
    ordneTabsUm('/c', '/a', false);
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/c', '/b']);
  });

  it('ordneTabsUm: unbekannter Pfad oder gleiche Position → unverändert', () => {
    merkeTab('/a'); merkeTab('/b');
    ordneTabsUm('/x', '/a');   // /x existiert nicht
    ordneTabsUm('/a', '/a');   // gleiche Position
    expect(ladeTabs().map((t) => t.path)).toEqual(['/a', '/b']);
  });

  it('ordneTabsUm identifiziert per pathname (Query egal)', () => {
    merkeTab('/a'); merkeTab('/b');
    ordneTabsUm('/b?x=1', '/a?y=2');
    expect(ladeTabs().map((t) => t.path)).toEqual(['/b', '/a']);
  });

  it('korruptes JSON / Nicht-Array → leere Liste (kein Crash)', () => {
    localStorage.setItem('lexmetrik-tabs', '{kaputt');
    expect(ladeTabs()).toEqual([]);
    localStorage.setItem('lexmetrik-tabs', '42');
    expect(ladeTabs()).toEqual([]);
  });
});
