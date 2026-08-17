import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  bieteAenderungsvermerkeSchalter, zaehleAenderungsvermerke,
} from '../pages/gesetz-leser/berechnungen';
import type { StrukturMap } from '../lib/normtext/browse';

// S1-NACHZUG B3 (Bug-Check 17.8.2026, §8) — «Änderungsvermerke» wird nur
// angeboten, wenn der Erlass Vermerke TRÄGT.
//
// BEFUND: Auf Kantonserlassen und Staatsverträgen ohne klassifizierte Historie
// blieb dem Schalter nur eine Layout-Raffung von 40 px je Artikel; die
// faktischen Änderungs-Fussnoten OHNE Klasse bleiben dort sichtbar (H0-Auflage 1
// — eine fehlende Klasse blendet nie etwas aus, `bibliothek/normen/
// hist-ansicht-h0-trennbarkeit.md`). Die Beschriftung versprach mehr, als sie hielt.
//
// Zwei Blöcke: die REGEL (rein, synthetisch — sie muss auch dann gelten, wenn
// sich der Korpus ändert) und die DATENLAGE (gegen die echten Sidecars — sie
// belegt, dass die Regel im Bestand genau die gemeldeten Erlasse trifft).

const S = (...fussnoten: Array<{ kl?: 'A' | 'V' | 'G' | 'Z' | 'U' }>): StrukturMap => ({
  '1': {
    gliederung: [],
    marginalie: [],
    fussnoten: fussnoten.map((f, i) => ({ nr: String(i + 1), text: 'x', links: [], ...f })),
  },
});

describe('zaehleAenderungsvermerke', () => {
  it('zählt AUSSCHLIESSLICH die Klasse A', () => {
    expect(zaehleAenderungsvermerke(S({ kl: 'A' }, { kl: 'A' }, { kl: 'V' }))).toBe(2);
    expect(zaehleAenderungsvermerke(S({ kl: 'V' }, { kl: 'G' }, { kl: 'Z' }, { kl: 'U' }))).toBe(0);
  });

  it('Fussnoten OHNE Klasse zählen NICHT (alle Kanton-Sidecars, H0-Auflage 1)', () => {
    // Genau der gemeldete Fall: BS-640.100 trägt 16 Fussnoten, keine davon
    // klassifiziert. Sie bleiben in jeder Schalterstellung sichtbar — also darf
    // ihre Zahl den Schalter nicht rechtfertigen.
    expect(zaehleAenderungsvermerke(S({}, {}, {}))).toBe(0);
  });

  it('null (Sidecar fehlt) ist von 0 (gibt es nicht) UNTERSCHIEDEN', () => {
    expect(zaehleAenderungsvermerke(null)).toBeNull();
    expect(zaehleAenderungsvermerke(undefined)).toBeNull();
    expect(zaehleAenderungsvermerke({})).toBe(0);
  });
});

describe('bieteAenderungsvermerkeSchalter', () => {
  const GELADEN = true;
  const LAEDT = false;

  it('kl:A vorhanden ⇒ anbieten', () => {
    expect(bieteAenderungsvermerkeSchalter(22, false, GELADEN)).toBe(true);
  });

  it('keine kl:A, aber eine «Fassung»-Zeile ⇒ TROTZDEM anbieten', () => {
    // Der Schalter blendet auch `[data-hist-slot]` aus (index.css). Gemessen gibt
    // es im Bestand zwei solche Erlasse (MONTREAL, PVUE) — dort wäre er WIRKSAM.
    // Nur `kl:'A'` zu prüfen hätte ein wirksames Steuerelement entfernt (§1).
    expect(bieteAenderungsvermerkeSchalter(0, true, GELADEN)).toBe(true);
  });

  it('weder kl:A noch Fassung ⇒ NICHT anbieten (der gemeldete Fall)', () => {
    expect(bieteAenderungsvermerkeSchalter(0, false, GELADEN)).toBe(false);
  });

  it('GAR KEIN Sidecar bei geladenem Erlass ⇒ NICHT anbieten (ZH-211.11)', () => {
    // `ladeStruktur` löst 404 und «lädt noch» beide auf `null` auf (browse.ts).
    // Ohne die dritte Eingabe behielte ZH-211.11 — der Erlass hat überhaupt kein
    // Struktur-Sidecar — den Schalter, obwohl er einer der drei gemeldeten Fälle
    // ist. Kein Sidecar bei geladenem Erlass heisst: keine Fussnoten, keine Vermerke.
    expect(bieteAenderungsvermerkeSchalter(null, false, GELADEN)).toBe(false);
  });

  it('noch am Laden ⇒ anbieten (konservativ, §8)', () => {
    // Ein Steuerelement zu verschweigen, dessen Wirkung man noch nicht kennt,
    // wäre die falsche Richtung. Der umgekehrte Fehler ist harmlos: das Panel ist
    // im Grundzustand geschlossen.
    expect(bieteAenderungsvermerkeSchalter(null, false, LAEDT)).toBe(true);
    expect(bieteAenderungsvermerkeSchalter(null, true, LAEDT)).toBe(true);
  });
});

// ── Datenlage im Bestand ─────────────────────────────────────────────────────
// Diese Zusicherungen sind ABSICHTLICH an den echten Sidecars gehängt: die Regel
// oben ist erlass-neutral, aber ihr WERT hängt daran, dass sie im Bestand die
// richtigen Erlasse trifft. Bewusst als Eigenschaften formuliert (nicht als
// eingefrorene Zahlen), damit ein wachsender Korpus den Test nicht rot färbt,
// ohne dass sich etwas Falsches geändert hätte.
const STRUKTUR = 'public/normtext/struktur';
const HISTORIE = 'public/normtext/historie';

/** `null` = kein Sidecar im Korpus — genau, was `ladeStruktur` (browse.ts) bei
 *  404 an den Reader gibt. ZH-211.11 hat keines. */
function ladeStruktur(ebene: 'bund' | 'kanton', key: string): StrukturMap | null {
  try {
    const j = JSON.parse(readFileSync(join(STRUKTUR, ebene, `${key}.json`), 'utf8')) as
      { artikel?: StrukturMap } & StrukturMap;
    return (j.artikel ?? j) as StrukturMap;
  } catch {
    return null;
  }
}
/** Trägt der Historie-Shard des Erlasses mindestens einen Artikel-Eintrag? */
function hatFassungsZeile(key: string): boolean {
  const dateien = readdirSync(HISTORIE);
  if (!dateien.includes(`${key}.json`)) return false;
  const j = JSON.parse(readFileSync(join(HISTORIE, `${key}.json`), 'utf8')) as
    { artikel?: Record<string, unknown> };
  return Object.keys(j.artikel ?? {}).length > 0;
}
/** Wie der Reader es rechnet, mit fertig geladenem Erlass. */
const bietet = (ebene: 'bund' | 'kanton', key: string): boolean =>
  bieteAenderungsvermerkeSchalter(
    zaehleAenderungsvermerke(ladeStruktur(ebene, key)), hatFassungsZeile(key), true,
  );

describe('B3 an den echten Sidecars', () => {
  it('Bundes-Kodifikationen mit Historie bekommen den Schalter', () => {
    // StPO: 187 von 283 Fussnoten sind kl:'A' (Messung 17.8.2026).
    expect(bietet('bund', 'STPO')).toBe(true);
    expect(bietet('bund', 'OR')).toBe(true);
    expect(bietet('bund', 'BV')).toBe(true);
    expect(bietet('bund', 'BGBM')).toBe(true);
  });

  it('die drei gemeldeten Erlasse bekommen ihn NICHT', () => {
    // Bug-Check-Messung: `[data-historie-zeile]` = 0 auf allen drei.
    expect(bietet('kanton', 'BS-640.100')).toBe(false); // 16 Fussnoten, keine klassifiziert
    // ZH-211.11 hat GAR KEIN Struktur-Sidecar (der `null`-Fall oben).
    expect(ladeStruktur('kanton', 'ZH-211.11')).toBeNull();
    expect(bietet('kanton', 'ZH-211.11')).toBe(false);
    expect(bietet('bund', 'LUGUE')).toBe(false);        // Staatsvertrag, 2 Fussnoten
  });

  it('Staatsverträge MIT Fassungszeile behalten ihn (Gegenprobe zur Herkunfts-Weiche)', () => {
    // MONTREAL und PVUE tragen NULL kl:'A'-Fussnoten, aber Historie-Einträge.
    // Ein `if (kanton)`-Fix oder eine reine kl:'A'-Prüfung hätte hier einen
    // wirksamen Schalter entfernt — genau darum die zweite Bedingung.
    expect(zaehleAenderungsvermerke(ladeStruktur('bund', 'MONTREAL'))).toBe(0);
    expect(hatFassungsZeile('MONTREAL')).toBe(true);
    expect(bietet('bund', 'MONTREAL')).toBe(true);
    expect(bietet('bund', 'PVUE')).toBe(true);
  });

  it('ein Historie-Shard OHNE Artikel-Einträge rechtfertigt ihn nicht', () => {
    // EAUE/HEUE/HKSUE96/UNO_BRK haben einen Shard, aber `artikel: {}` — es gibt
    // also keine «Fassung»-Zeile zum Ausblenden. Die Existenz der Datei allein
    // darf den Schalter nicht tragen (sonst wäre die Prüfung wieder kosmetisch).
    for (const key of ['EAUE', 'HEUE', 'HKSUE96', 'UNO_BRK']) {
      expect(hatFassungsZeile(key), key).toBe(false);
      expect(bietet('bund', key), key).toBe(false);
    }
  });
});
