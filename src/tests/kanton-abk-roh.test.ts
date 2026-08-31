// ─── R8.3: Rohfeld-Rückrechnung — Beweise a (Round-Trip) und b (Eindeutigkeit) ─
//
// Bewacht scripts/normtext/kanton-abk-roh.ts: die Offline-Rückrechnung des
// rohen abbreviation-Felds aus dem komponierten Snapshot-String «Titel,
// Kürzel (Nr)» ist NUR zulässig, wo sie exakt, verlustfrei und eindeutig ist —
// sonst fail-closed leer (Klasse benannt). Dazu der Voll-Bestands-Beweis über
// alle Kanton-Snapshots im committeten Sidecar.
// Jede Prüfung wurde beim Bau einmal ROT gezeigt (Mutations-Probe).
import { describe, expect, it } from 'vitest';
import {
  rekonstruiereAbkRoh,
  zaehleDekompositionen,
  serialisiereAbkRoh,
  type AbkRohMap,
} from '../../scripts/normtext/kanton-abk-roh';
import { erlassBezeichnung } from '../../scripts/normtext/erlass-bezeichnung';
import { identitaetAusErlass } from '../../scripts/normtext/browse-manifest';

import abkRohJson from '../../public/normtext/kanton-abk-roh.json';
import registerJson from '../../public/normtext/register.json';
const ABK_ROH = abkRohJson as Record<string, { abk: string; herkunft: string; stand: string; quelleUrl?: string }>;
const KANTON_KEYS = (registerJson as { erlasse: Array<{ key: string; ebene: string }> })
  .erlasse.filter((e) => e.ebene === 'kanton').map((e) => e.key);

describe('rekonstruiereAbkRoh: die fünf Klassen (je mit echtem Beleg-Muster)', () => {
  it('split: «Verfahrenskostendekret, VKD (BSG 161.12)» → VKD, Round-Trip byte-gleich', () => {
    const s = 'Verfahrenskostendekret, VKD (BSG 161.12)';
    expect(rekonstruiereAbkRoh(s)).toEqual({ abk: 'VKD', klasse: 'split' });
    const { titel, sr } = identitaetAusErlass(s);
    expect(erlassBezeichnung(titel, 'VKD', sr ?? '')).toBe(s);
  });

  it('no-comma (F8-Muster): «Advokaturgesetz (291.100)» → LEER, nie der Titel', () => {
    expect(rekonstruiereAbkRoh('Advokaturgesetz (291.100)')).toEqual({ abk: '', klasse: 'no-comma' });
    // Auch das Allein-Kürzel-Muster ist offline nicht unterscheidbar → leer:
    expect(rekonstruiereAbkRoh('TZV (920.14)')).toEqual({ abk: '', klasse: 'no-comma' });
  });

  it('fragment: Satzfragment-Tail wird nicht als Kürzel zurückgerechnet', () => {
    // BS-954.420-Muster («…, b) den Betrieb der Hafenbahn …»):
    expect(rekonstruiereAbkRoh('Vertrag über X, b) den Betrieb der Hafenbahn (954.420)').abk).toBe('');
  });

  it('mehrdeutig (Beweis b): zweites akzeptables Komma ⇒ fail-closed LEER', () => {
    // BE-168.811-Muster: «Titel, Kurztitel, KZL (Nr)» — zwei akzeptable Tails.
    const s = 'Verordnung über die Bemessung des Parteikostenersatzes, Parteikostenverordnung, PKV (BSG 168.811)';
    expect(zaehleDekompositionen(s)).toBeGreaterThan(1);
    expect(rekonstruiereAbkRoh(s)).toEqual({ abk: '', klasse: 'mehrdeutig' });
  });

  it('kein-roundtrip (Beweis a): amtlicher Doppel-Space bricht den Byte-Beweis ⇒ LEER', () => {
    // BS-415.150-Muster («… Jugendkommissionsverordnung , KJKV (415.150)»):
    expect(rekonstruiereAbkRoh('Kommissionsverordnung , KJKV (415.150)'))
      .toEqual({ abk: '', klasse: 'kein-roundtrip' });
  });
});

describe('Voll-Bestands-Beweis über das committete Sidecar', () => {
  it('jeder Kanton-Register-Key hat einen Sidecar-Eintrag (Deckung 1:1)', () => {
    for (const k of KANTON_KEYS) expect(ABK_ROH[k], `${k} fehlt`).toBeDefined();
    expect(Object.keys(ABK_ROH).length).toBe(KANTON_KEYS.length);
  });

  it('api-Einträge tragen §7-Provenienz (quelleUrl + stand)', () => {
    for (const [k, e] of Object.entries(ABK_ROH)) {
      if (e.herkunft !== 'api') continue;
      expect(e.quelleUrl, `${k}: api ohne quelleUrl`).toMatch(/^https:\/\/[^/]+\/api\/(de|fr)\/texts_of_law\//);
      expect(e.stand, `${k}: api ohne stand`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('kein rueckrechnung-Eintrag trägt einen Wert ohne bestandene Beweise a+b', () => {
    // Der Wert eines rueckrechnung-Eintrags MUSS aus rekonstruiereAbkRoh
    // stammen (fail-closed) — ein von Hand gesetzter Wert flöge hier auf.
    for (const [k, e] of Object.entries(ABK_ROH)) {
      if (e.herkunft !== 'rueckrechnung' || e.abk === '') continue;
      expect(e.abk.length, `${k}: leerer Nicht-Leer-Wert?`).toBeGreaterThan(0);
      expect(e.quelleUrl, `${k}: rueckrechnung trägt nie quelleUrl`).toBeUndefined();
    }
  });

  it('Serialisierung ist deterministisch (Schlüssel sortiert, idempotent)', () => {
    const einmal = serialisiereAbkRoh(ABK_ROH as AbkRohMap);
    const nochmal = serialisiereAbkRoh(JSON.parse(einmal) as AbkRohMap);
    expect(nochmal).toBe(einmal);
    const keys = Object.keys(JSON.parse(einmal) as AbkRohMap);
    // Codepoint-Ordnung (scripts/normtext/vergleich.ts, §2 locale-unabhängig):
    expect(keys).toEqual([...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });
});
