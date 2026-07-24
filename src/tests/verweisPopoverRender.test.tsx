import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { NormPopover } from '../components/NormPopover';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import type { NormSnapshot } from '../lib/normtext/typen';

// NormPopover rendert einen react-router <Link> («Im Gesetz öffnen») → Router-
// Kontext nötig (wie NormPopover.test.tsx). href-Zusicherungen unverändert.
const rp = (el: ReactElement) => renderToString(<MemoryRouter>{el}</MemoryRouter>);

// ── M11 — Popover-Titel trägt die Artikel-Bezeichnung (Sachüberschrift) ───────
const SNAP: NormSnapshot = {
  id: 'bund/SCHKG/art_113', ebene: 'bund', quelle: 'SCHKG', erlass: 'SchKG',
  artikel: '113', artikelLabel: 'Art. 113',
  bloecke: [{ absatz: null, text: 'Nehmen neue Gläubiger an einer Pfändung teil …' }],
  stand: '2026-01-01', quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/11/529_488_529/de#art_113',
  abgerufen: '2026-06-30', fassungsToken: '20260101', sha: 'x',
};

describe('M11 — NormPopover trägt die Sachüberschrift im Titel', () => {
  it('sachtitel="Nachträge" → Kopf enthält «Art. 113 SchKG – Nachträge»', () => {
    const out = rp(<NormPopover snapshot={SNAP} passus={{ absatz: null }} sachtitel="Nachträge" onClose={() => {}} />);
    expect(out).toContain('Art. 113');
    expect(out).toContain('SchKG');
    expect(out).toContain('Nachträge');
  });
  it('ohne sachtitel bleibt der Kopf unverändert (byte-neutral, kein Bindestrich-Rest)', () => {
    const out = rp(<NormPopover snapshot={SNAP} passus={{ absatz: null }} onClose={() => {}} />);
    expect(out).not.toContain('Nachträge');
    expect(out).not.toContain('– </span>'); // kein leerer Bindestrich-Anhang
  });
});

// ── M6-D — Chapeau-Items lösen auf das Fremdgesetz (BVG) auf ──────────────────
const intern = { tokenMap: new Map<string, string>(), basisPfad: '/gesetze/bund/ZGB', springeZu: () => {} };

describe('M6-D — Fremdgesetz-Chapeau-Items als BVG-Verweis aufgelöst', () => {
  it('«(Art. 52)» im BVG-Chapeau → BVG-Verweis (#art_52), KEIN Self-Link (#art-52)', () => {
    const bl: NormSnapshot['bloecke'] = [{
      absatz: '7',
      text: 'Für Personalfürsorgestiftungen … gelten von den Bestimmungen des BVG nur die folgenden:',
      items: [{ marke: '3', text: 'die Verantwortlichkeit (Art. 52);' }],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bl} artikel="89_a" passus={{ absatz: null }} autolink intern={intern}
        zitierKontext={{ artikelLabel: 'Art. 89a', kuerzel: 'ZGB' }} />,
    );
    expect(out).toContain('Art. 52');       // Wortlaut bleibt
    expect(out).toContain('#art_52');        // BVG-Deep-Link (Unterstrich)
    expect(out).not.toContain('#art-52');    // kein interner Self-Sprunglink (Bindestrich)
  });
  it('Kontroll-Chapeau mit MEHRDEUTIGEM Ziel (OR und StGB) → Item bleibt Text (§1)', () => {
    const bl: NormSnapshot['bloecke'] = [{
      absatz: '1',
      text: 'Es gelten die folgenden Bestimmungen des OR und des StGB über:',
      items: [{ marke: 'a', text: 'die Sache (Art. 52);' }],
    }];
    const out = renderToString(
      <ArtikelBody bloecke={bl} artikel="1" passus={{ absatz: null }} autolink intern={intern}
        zitierKontext={{ artikelLabel: 'Art. 1', kuerzel: 'ZGB' }} />,
    );
    expect(out).toContain('Art. 52');
    expect(out).not.toContain('#art_52');
    expect(out).not.toContain('#art-52');
  });
});
