// scripts/datenhaltung/suche.test.ts
// QS-DATA E2-Vorarbeiten: Unit-Tests des Such-Query-Moduls gegen die lokal (in-memory,
// via denselben ingest+fts-Bausteinen wie datenhaltung:build) gebauten HOT-DBs.
// Kernbeweise: bm25-Treffer, diakritik-insensitiv, Pagination BY DESIGN, KEINE Volltext-
// Felder im Response, und der Payload-Grenz-Test (breite Query → Antwort << 4,5-MB-Wand).
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtext, ingestNormtextZiel, ingestRechtsprechung } from './ingest';
import { baueFtsArtikel, baueFtsEntscheideSchaufenster } from './fts';
import { sucheArtikel, sucheEntscheide, MAX_LIMIT } from './suche';

const PAYLOAD_WAND = 4.5 * 1024 * 1024; // 4,5-MB-Function-Payload-Wand (§4)

let dbN: DatabaseSync;
let dbR: DatabaseSync;

beforeAll(() => {
  dbN = oeffneDb();
  frischesSchema(dbN, 'normtext');
  ingestNormtext(dbN);
  ingestNormtextZiel(dbN);
  baueFtsArtikel(dbN);

  dbR = oeffneDb();
  frischesSchema(dbR, 'rechtsprechung');
  ingestRechtsprechung(dbR);
  baueFtsEntscheideSchaufenster(dbR);
  // ── Hook-Budget 60 s → 95 s (QS-E2E-STABIL, Messung 14.8.2026) ─────────────
  // REPRODUKTION VOR DEM FIX (F3): unter der im Fahrplan genannten Bedingung
  // «Parallel-Last (Builds + e2e)» — voller `npm run test:e2e` plus dauernd
  // laufender vite-build, Last-Mittel ~14 auf 10 Kernen — fiel dieser Hook in
  // 1 von 5 Läufen mit «Hook timed out in 60000ms».
  //
  // MESSREIHE, Datei-Gesamtdauer in s (der Hook ist der weit überwiegende Teil):
  //   isoliert (nichts sonst auf der Maschine, n=5):
  //     11.66 · 10.67 · 10.62 · 10.58 · 10.70   (mittel 10.85, sd 0.45)
  //   unter Parallel-Last (n=5, Bedingung oben):
  //     46.23 · 66.60 · 49.08 · 48.97 · 41.78   (mittel 50.53, sd 9.46)
  // Lastfaktor also ~4.7×, und die Streuung wächst um mehr als das Zwanzigfache
  // (sd 0.45 → 9.46 s). Genau daran scheitert ein Deckel, der gegen den
  // ISOLIERTEN Wert bemessen ist: isoliert wirken 60 s wie Faktor 5.5 Reserve,
  // unter Last liegt der Hook IM Streubereich des Deckels.
  //
  // HÖHE nach QS-PERF Ziff. 5 (Ist + max(3 sd, 25 %)): Ist = 66 600 ms
  // (schlechtester gemessener Wert), 3 sd = 27 840 ms, 25 % = 16 650 ms
  // → 66 600 + 27 840 = 94 440 ms, gerundet 95 000 ms.
  //
  // WARUM NICHT «Hook entlasten» (die Alternative im Fahrplan): der Hook baut
  // beide HOT-DBs aus den echten Quellen über dieselben ingest+fts-Bausteine wie
  // `datenhaltung:build`. Genau das ist die Aussage dieser Datei — ein gecachtes
  // DB-Artefakt nähme die Ingest-Strecke aus der Prüfung, der Test bewiese danach
  // weniger (§1 vor Tempo). Die Arbeit ist legitim schwer; zu korrigieren war der
  // ungemessene Deckel, nicht der Hook.
  //
  // §6.7: der Deckel kann weiterhin scheitern — er greift bei Überschreitung und
  // hält zum schlechtesten belegten Wert noch ~30 % Abstand; eine echte
  // Verlangsamung der Ingest-Strecke (etwa durch einen Korpus-Sprung) fällt
  // unverändert durch. KEINE Assertion und kein Prüfschritt berührt (§6.3).
}, 95000);

afterAll(() => {
  dbN?.close();
  dbR?.close();
});

const ARTIKEL_KEYS = ['id', 'titel', 'snippet', 'fundstelle'].sort();

describe('sucheArtikel', () => {
  it('findet Artikel diakritik-insensitiv (verjahrung → Verjährung)', () => {
    const a = sucheArtikel(dbN, 'verjahrung');
    expect(a.gesamt).toBeGreaterThan(0);
    expect(a.treffer.length).toBeGreaterThan(0);
    expect(a.treffer[0].id.startsWith('art:')).toBe(true);
    expect(a.treffer[0].titel.length).toBeGreaterThan(0);
    expect(a.treffer[0].fundstelle.quelleUrl.startsWith('http')).toBe(true);
  });

  it('gibt NUR id/titel/snippet/fundstelle zurück — kein Volltext-Feld', () => {
    const a = sucheArtikel(dbN, 'eigentum', { limit: 5 });
    expect(a.treffer.length).toBe(5); // Query trifft breit → Schleife prüft wirklich
    for (const t of a.treffer) {
      expect(Object.keys(t).sort()).toEqual(ARTIKEL_KEYS);
      // Volltext-Leck ausgeschlossen (bloecke/text/volltext/bloecke_json tauchen nie auf).
      const roh = JSON.stringify(t);
      expect(roh).not.toMatch(/"bloecke"|"bloecke_json"|"volltext"/);
    }
  });

  it('F35: jeder Treffer trägt die Ebene, kantonale zusätzlich ihr Kürzel', () => {
    // EMPIRISCH gegen den echten Korpus (§7): dass `e.ebene`/`e.kanton` in der
    // Fundstelle stehen, beweist der Unit-Test suche-kern.test.ts an einer
    // Hand-Zeile — hier steht der Beweis, dass die Spalten aus dem WIRKLICHEN
    // Schema kommen und für kantonales Recht wirklich 'kanton' + Kürzel liefern.
    // Ohne diesen Fall wäre F35 an der Netzgrenze eine Behauptung.
    const alle = sucheArtikel(dbN, 'recht', { limit: MAX_LIMIT }).treffer;
    expect(alle.length).toBeGreaterThan(0);
    for (const t of alle) expect(['bund', 'kanton']).toContain(t.fundstelle.ebene);

    const kantonal = ['regierungsrat', 'grossratsbeschluss', 'anwaltstarif', 'kantonsrat']
      .flatMap((q) => sucheArtikel(dbN, q, { limit: MAX_LIMIT }).treffer)
      .filter((t) => t.fundstelle.ebene === 'kanton');
    expect(kantonal.length, 'kein kantonaler Treffer — der Prüfsatz misst nichts').toBeGreaterThan(0);
    for (const t of kantonal) expect(t.fundstelle.kanton).toMatch(/^[A-Z]{2}$/);
    // Bundeserlasse tragen KEIN Kanton-Kürzel (kein leeres Feld im Draht).
    for (const t of alle.filter((x) => x.fundstelle.ebene === 'bund')) {
      expect('kanton' in t.fundstelle).toBe(false);
    }
  });

  it('Pagination by design: Limit hart auf MAX_LIMIT geklemmt', () => {
    const a = sucheArtikel(dbN, 'recht', { limit: 1000 });
    expect(a.treffer.length).toBeLessThanOrEqual(MAX_LIMIT);
  });

  it('naechsteSeite folgt dem Fenster (offset+limit bzw. null am Ende)', () => {
    const seite1 = sucheArtikel(dbN, 'recht', { limit: 5, offset: 0 });
    if (seite1.gesamt > 5) {
      expect(seite1.naechsteSeite).toBe(5);
      const seite2 = sucheArtikel(dbN, 'recht', { limit: 5, offset: 5 });
      // disjunkte IDs zwischen Seite 1 und 2 (stabile Sortierung, kein Overlap).
      const ids1 = new Set(seite1.treffer.map((t) => t.id));
      expect(seite2.treffer.some((t) => ids1.has(t.id))).toBe(false);
    }
    // Offset jenseits des Endes → leere letzte Seite, kein naechsteSeite.
    const jenseits = sucheArtikel(dbN, 'verjahrung', { offset: 1_000_000 });
    expect(jenseits.treffer.length).toBe(0);
    expect(jenseits.naechsteSeite).toBeNull();
  });

  it('leere/symbolische Query → leere Antwort (keine FTS-Syntaxfehler)', () => {
    for (const q of ['', '   ', '***', '(']) {
      const a = sucheArtikel(dbN, q);
      expect(a).toEqual({ treffer: [], gesamt: 0, naechsteSeite: null });
    }
  });

  it('PAYLOAD-GRENZ-TEST: breite Query bei Max-Limit bleibt weit unter 4,5 MB', () => {
    const a = sucheArtikel(dbN, 'recht', { limit: MAX_LIMIT });
    expect(a.gesamt).toBeGreaterThan(MAX_LIMIT); // wirklich breit
    const bytes = Buffer.byteLength(JSON.stringify(a), 'utf8');
    expect(bytes).toBeLessThan(PAYLOAD_WAND);
    expect(bytes).toBeLessThan(200_000); // real: Grössenordnung Kilobytes, nicht Megabytes
  });
});

describe('sucheEntscheide', () => {
  it('findet Schaufenster-Entscheide diakritik-insensitiv (rechtsoffnung → Rechtsöffnung)', () => {
    const a = sucheEntscheide(dbR, 'rechtsoffnung');
    expect(a.gesamt).toBeGreaterThan(0);
    expect(a.treffer[0].id.startsWith('bund/')).toBe(true);
    expect(a.treffer[0].snippet).toContain('['); // native FTS-snippet markiert den Treffer
    expect(Object.keys(a.treffer[0]).sort()).toEqual(ARTIKEL_KEYS);
  });

  it('Pagination + Payload-Grenze auch für Entscheide', () => {
    const a = sucheEntscheide(dbR, 'recht', { limit: MAX_LIMIT });
    expect(a.treffer.length).toBeLessThanOrEqual(MAX_LIMIT);
    const bytes = Buffer.byteLength(JSON.stringify(a), 'utf8');
    expect(bytes).toBeLessThan(PAYLOAD_WAND);
  });
});
