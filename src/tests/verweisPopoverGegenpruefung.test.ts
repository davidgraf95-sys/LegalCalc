import { describe, it, expect } from 'vitest';
import { artikelSachtitel } from '../lib/normtext/darstellung';
import { chapeauZielFremdgesetz } from '../lib/fedlex';
import { bundSnapshotRef } from '../lib/normtext/bundRef';

// ═══ Gegenprüfungs-Nachfixe (W2·5b) — quell-belegte Befunde 1–3 ═══════════════

// ── BEFUND 1: Misch-Aufzähler (2a./1bis./5ter.) müssen gestrippt werden ───────
// Der alte ENUM (`[A-Za-z]{1,4}|\d{1,3}`) liess «2a.» stehen → OR 128a zeigte
// «2a. Zwanzig Jahre»; StGB 355d (aufgehoben) «5ter. …» hebelte istLeererTitel aus
// (Popover-Titel «Art. 355d StGB – 5ter. …» statt KEIN Titel, §8). Quelle:
// public/normtext/struktur/bund/{OR,STGB,SCHKG}.json.
describe('BEFUND 1 — artikelSachtitel strippt Misch-Aufzähler (Ziffer+Buchstabe/Suffix)', () => {
  it('OR 128a «2a. Zwanzig Jahre» → «Zwanzig Jahre»', () => {
    expect(artikelSachtitel(['G. Verjährung', 'I. Fristen', '2a. Zwanzig Jahre'])).toBe('Zwanzig Jahre');
  });
  it('SchKG 242a «3a. Herausgabe …» → «Herausgabe kryptobasierter Vermögenswerte»', () => {
    expect(artikelSachtitel(['B. Konkursverwaltung', '3a. Herausgabe kryptobasierter Vermögenswerte']))
      .toBe('Herausgabe kryptobasierter Vermögenswerte');
  });
  it('lat. Suffix-Aufzähler «1bis. Vorbehalt» → «Vorbehalt»', () => {
    expect(artikelSachtitel(['1bis. Vorbehalt'])).toBe('Vorbehalt');
  });
  it('StGB 355d (aufgehoben) «5ter. …» → null (istLeererTitel greift wieder, §8)', () => {
    expect(artikelSachtitel(['5ter. …'])).toBeNull();
  });
  it('reine Sachüberschrift bleibt unverändert', () => {
    expect(artikelSachtitel(['Gegenstand'])).toBe('Gegenstand');
  });
});

// ── BEFUND 2+3: chapeauZielFremdgesetz — Adjazenz + Katalog-Signal ────────────
// Korpus-Enumeration (Fixture-Ausschnitte je Block, real aus den Snapshots). So
// driftet die Kalibrierung nicht stillschweigend. HARTE ABNAHME: alle heute
// korrekt aufgelösten Katalog-Blöcke lösen weiter auf; FAMZG-25 UND BS-510.100-§54
// ⇒ null.
describe('BEFUND 2+3 — chapeauZielFremdgesetz (Korpus-Enumeration, Adjazenz + Katalog)', () => {
  const AUFLOESEND: Array<[string, string, string]> = [
    ['ELG 26', 'Es gelten sinngemäss die folgenden Bestimmungen des AHVG über:', 'AHVG'],
    ['EOG 21', 'Soweit dieses Gesetz nichts Abweichendes bestimmt, gelten sinngemäss folgende Bestimmungen des AHVG über:', 'AHVG'],
    ['EOG 29', 'Es gelten sinngemäss die folgenden Bestimmungen des AHVG über:', 'AHVG'],
    ['IVG 66', 'Soweit dieses Gesetz nichts Abweichendes bestimmt, gelten sinngemäss die Bestimmungen des AHVG über:', 'AHVG'],
    ['ZGB 89a Abs. 6', 'Für Personalfürsorgestiftungen, die … dem Freizügigkeitsgesetz vom 17. Dezember 1993 (FZG) unterstellt sind, gelten überdies die folgenden Bestimmungen des Bundesgesetzes vom 25. Juni 1982 über die berufliche Alters-, Hinterlassenen- und Invalidenvorsorge (BVG) über:', 'BVG'],
    ['ZGB 89a Abs. 7', 'Für Personalfürsorgestiftungen … nicht dem FZG unterstellt sind …, gelten von den Bestimmungen des BVG nur die folgenden:', 'BVG'],
    ['BANKV 25', 'Im statutarischen Einzelabschluss True and Fair View sind die Bestimmungen des OR zu folgenden Gegenständen nicht anwendbar:', 'OR'],
    ['BS 154.200 §2', 'Die nachfolgenden Bestimmungen der Schweizerischen Zivilprozessordnung (Zivilprozessordnung, ZPO) finden ebenfalls Anwendung:', 'ZPO'],
  ];
  for (const [name, text, ziel] of AUFLOESEND) {
    it(`${name} → ${ziel}`, () => {
      expect(chapeauZielFremdgesetz(text, name.split(' ')[0])).toBe(ziel);
    });
  }

  const NULL_FAELLE: Array<[string, string, string]> = [
    // BEFUND 2: Kürzel im Qualifikator, nicht Objekt von «Bestimmungen der …».
    ['FAMZG 25', 'Die Bestimmungen der AHV-Gesetzgebung mit ihren allfälligen Abweichungen vom ATSG gelten sinngemäss für:', 'FamZG'],
    // BEFUND 3: Bedingungssatz («… verwertet werden, wenn:»), kein Katalog.
    ['BS 510.100 §54', 'Eine sichergestellte Sache darf – unter Vorbehalt der Bestimmungen der StPO und des EG StPO – verwertet werden, wenn:', 'BS'],
    // mehrdeutig: zwei verschiedene Register-Gesetze.
    ['mehrdeutig', 'Es gelten die folgenden Bestimmungen des OR und des StGB über:', 'ZGB'],
    // kein Chapeau (kein Doppelpunkt).
    ['kein Kolon', 'Es gelten die Bestimmungen des BVG sinngemäss.', 'ZGB'],
    // nur eigenes Kürzel.
    ['nur eigen', 'Es gelten die folgenden Bestimmungen des ZGB über:', 'ZGB'],
    // unbekanntes Kürzel.
    ['unbekannt', 'Es gelten die folgenden Bestimmungen des XYZG über:', 'ZGB'],
  ];
  for (const [name, text, eigen] of NULL_FAELLE) {
    it(`${name} → null`, () => {
      expect(chapeauZielFremdgesetz(text, eigen)).toBeNull();
    });
  }
});

// ── Prüfer-Blindfleck: Sidecar-Token↔Key-Naht («89a» → «89_a») ────────────────
// bundSnapshotRef liefert den Token, mit dem NormChip die Marginalie im Struktur-
// Sidecar nachschlägt (m[ref.token]). Dieser Token MUSS dem Sidecar-Schlüssel
// entsprechen (Buchstaben-Suffix mit «_» getrennt), sonst kein Sachtitel.
describe('Sidecar-Token↔Key-Naht — bundSnapshotRef-Token = Struktur-Schlüssel', () => {
  it('«Art. 89a ZGB» → Token «89_a» (ZGB-Sidecar-Schlüssel)', () => {
    expect(bundSnapshotRef('Art. 89a ZGB')?.token).toBe('89_a');
  });
  it('«Art. 128a OR» → Token «128_a»', () => {
    expect(bundSnapshotRef('Art. 128a OR')?.token).toBe('128_a');
  });
  it('«Art. 113 SchKG» → Token «113» (kein Suffix)', () => {
    expect(bundSnapshotRef('Art. 113 SchKG')?.token).toBe('113');
  });
});
