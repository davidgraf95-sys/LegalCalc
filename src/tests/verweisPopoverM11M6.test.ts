import { describe, it, expect } from 'vitest';
import { artikelSachtitel } from '../lib/normtext/darstellung';
import { chapeauZielFremdgesetz } from '../lib/fedlex';

// ── M11 — Artikel-Sachtitel (Randtitel-Blatt) für die Popover-Bezeichnung ─────
// Der Sachtitel liegt im Struktur-Sidecar als Marginalie; das letzte Glied ist
// die artikel-EIGENE Sachüberschrift (Aufzähler «2.» wird gestrippt). Empirisch
// gegen die Fedlex-Konsolidierung belegt (SchKG Art. 113 = «2. Nachträge»).
describe('M11 — artikelSachtitel (Randtitel-Blatt aus der Marginalie)', () => {
  it('SchKG Art. 113 «[…, «2. Nachträge»]» → «Nachträge» (Aufzähler gestrippt)', () => {
    expect(artikelSachtitel(['G. Pfändungsurkunde', '2. Nachträge'])).toBe('Nachträge');
  });
  it('SchKG Art. 112 «[…, «1. Aufnahme»]» → «Aufnahme»', () => {
    expect(artikelSachtitel(['G. Pfändungsurkunde', '1. Aufnahme'])).toBe('Aufnahme');
  });
  it('reine Sachüberschrift ohne Aufzähler bleibt unverändert', () => {
    expect(artikelSachtitel(['Gegenstand'])).toBe('Gegenstand');
  });
  it('aufgehobene Sachüberschrift «…» → null (§7/§8: nichts fabrizieren)', () => {
    expect(artikelSachtitel(['A. Allgemeines', 'c. …'])).toBeNull();
  });
  it('leere Marginalie → null', () => {
    expect(artikelSachtitel([])).toBeNull();
  });
});

// ── M6-D — Chapeau-Zielgesetz deterministisch aus dem Fremdgesetz-Chapeau ─────
// «… gelten … die folgenden Bestimmungen des … (BVG) über:» → BVG. Das massgebende
// Kürzel steht NACH dem letzten «Bestimmungen des/der»; ein früher genanntes «(FZG)»
// im qualifizierenden Nebensatz ist NICHT das Zielgesetz (§1: nur wenn eindeutig).
describe('M6-D — chapeauZielFremdgesetz (deterministisches Fremdgesetz des Chapeaus)', () => {
  const abs6 = 'Für Personalfürsorgestiftungen, die auf dem Gebiet der Alters-, Hinterlassenen- und Invalidenvorsorge tätig sind und die dem Freizügigkeitsgesetz vom 17. Dezember 1993 (FZG) unterstellt sind, gelten überdies die folgenden Bestimmungen des Bundesgesetzes vom 25. Juni 1982 über die berufliche Alters-, Hinterlassenen- und Invalidenvorsorge (BVG) über:';
  const abs7 = 'Für Personalfürsorgestiftungen, die … nicht dem FZG unterstellt sind …, gelten von den Bestimmungen des BVG nur die folgenden:';
  it('Abs. 6 (FZG im Nebensatz, BVG regiert «Bestimmungen des …») → BVG', () => {
    expect(chapeauZielFremdgesetz(abs6, 'ZGB')).toBe('BVG');
  });
  it('Abs. 7 («Bestimmungen des BVG») → BVG', () => {
    expect(chapeauZielFremdgesetz(abs7, 'ZGB')).toBe('BVG');
  });
  it('kein Chapeau (kein Doppelpunkt) → null', () => {
    expect(chapeauZielFremdgesetz('Es gelten die Bestimmungen des BVG sinngemäss.', 'ZGB')).toBeNull();
  });
  it('mehrdeutig — zwei verschiedene Fremdkürzel im regierenden Teil → null (§1)', () => {
    expect(chapeauZielFremdgesetz('Es gelten die Bestimmungen des OR und des StGB über:', 'ZGB')).toBeNull();
  });
  it('nur das eigene Kürzel → null (kein Fremdgesetz)', () => {
    expect(chapeauZielFremdgesetz('Es gelten die folgenden Bestimmungen des ZGB über:', 'ZGB')).toBeNull();
  });
  it('unbekanntes Kürzel (nicht im FEDLEX-Register) → null (kein geratenes Ziel)', () => {
    expect(chapeauZielFremdgesetz('Es gelten die folgenden Bestimmungen des XYZG über:', 'ZGB')).toBeNull();
  });
});
