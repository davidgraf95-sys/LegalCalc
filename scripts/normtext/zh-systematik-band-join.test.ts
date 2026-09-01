/**
 * Wächter-Test W2·13-KANTONE-DATEN (Nachtrag 1.9.2026): der ZH-Baum
 * schlüsselt über Ordner-BÄNDER (101–176 …, zh-systematik.ts), der N0b-Join
 * (`sachgebietKantonFuer`, browse-manifest.ts) ursprünglich nur über
 * Nummern-PRÄFIXE — der Band-Zweig (2c) schliesst die Lücke.
 *
 * Befund vor dem Fix (gemessen 1.9.2026): 0/24 ZH-Erlasse trugen
 * `sachgebietKanton`. Dieser Test hält beides deterministisch fest:
 *  (a) den Band-Join selbst (synthetischer Baum — unabhängig davon, wie
 *      viele ZH-Erlasse gerade im Register stehen);
 *  (b) die Deckung am committeten Register — GENERISCH per Band, nicht per
 *      Liste: er zählt die ZH-Einträge ohne `sachgebietKanton`, statt eine
 *      feste ID-Liste abzuklappern, und greift daher auch für Erlasse, die
 *      eine parallel laufende Tranche noch hinzufügt.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sachgebietKantonFuer } from './browse-manifest';
import { baueZhSystematik, ZH_ORDNER } from './zh-systematik';

const ZH_BAUM = baueZhSystematik();

describe('sachgebietKantonFuer — ZH-Band-Zweig (2c)', () => {
  it('ordnet eine Hauptnummer aus jedem der 14 Ordner-Bänder korrekt zu', () => {
    // Je Ordner die untere Bandgrenze prüfen — deckt alle 14 Bänder ab, ohne
    // eine Erlass-Liste zu pflegen (die Regel gilt generisch per Band).
    for (const ordner of ZH_ORDNER) {
      const stamm = `ZH-${ordner.von}.1`;
      const treffer = sachgebietKantonFuer(ZH_BAUM, 'ZH', stamm);
      expect(treffer?.wurzel.nummer, `Band ${ordner.von}–${ordner.bis}`).toBe(ordner.nummer);
      expect(treffer?.wurzel.name).toBe(ordner.name);
    }
  });

  it('ordnet eine Nummer ohne Nachkommastelle (ganze Hauptnummer) zu', () => {
    // '230' steht wörtlich im Snapshot-Bestand (ZH-230.json, Ordner 3).
    expect(sachgebietKantonFuer(ZH_BAUM, 'ZH', 'ZH-230')?.wurzel.nummer).toBe('3');
  });

  it('liefert kein Feld für eine Hauptnummer ausserhalb aller Bänder (§8)', () => {
    // Zwischen Band 5 (410–412) und Band 6 (413) ist keine Lücke, aber
    // z.B. '999' liegt hinter dem letzten Band (861–954) — kein stilles Raten.
    expect(sachgebietKantonFuer(ZH_BAUM, 'ZH', 'ZH-999.1')).toBeUndefined();
  });

  it('bleibt für andere Kantone unberührt (rein additiver Zweig, kanton-scoped)', () => {
    // Derselbe numerische Aufbau, aber kanton='AG' statt 'ZH' darf den
    // ZH-Namensraum ('LS#…') nie greifen — der Zweig ist per Parameter
    // kanton-gescoped, nicht global auf jeden Baum mit 'LS#'-Schlüsseln.
    expect(sachgebietKantonFuer(ZH_BAUM, 'AG', 'AG-131.1')).toBeUndefined();
  });

  it('Register: 0 ZH-Erlasse ohne sachgebietKanton (generisch, nicht als feste Liste)', () => {
    const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
      erlasse: { key: string; ebene: string; kanton: string | null; sachgebietKanton?: unknown }[];
    };
    const zh = reg.erlasse.filter((e) => e.ebene === 'kanton' && e.kanton === 'ZH');
    expect(zh.length, 'ZH-Erlasse im Register').toBeGreaterThan(0);
    const ohne = zh.filter((e) => !e.sachgebietKanton).map((e) => e.key);
    expect(ohne).toEqual([]);
  });
});
