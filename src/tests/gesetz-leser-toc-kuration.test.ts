/**
 * E4/A36 (David 16.7.2026, FAHRPLAN-GESETZES-UX §10.10) — ZGB-TOC-Kuration.
 *
 * Der ZGB-Gliederungseintrag «Wortlaut der früheren Bestimmungen des sechsten
 * Titels» (Schlusstitel-Anhang, M13-disp-Division: Token `disp_u2_art_*`) wird
 * NUR aus der GLIEDERUNG (TOC-Baum) entfernt — render-seitiger Filter in der
 * Darstellungsschicht (§3), Sidecar/Generator unberührt (golden-/Daten-neutral).
 * §15-Treue: der INHALT bleibt vollständig (Lesespalte rendert weiter den
 * ungefilterten Baum; Artikel-Token/Anker/Ctrl+F/Print unberührt) — die
 * Substanz-Proben unten beweisen das gegen die ECHTEN committeten Daten.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { baueGliederungsbaum, type StrukturMap, type Sektion } from '../lib/normtext/browse';
import type { NormSnapshot } from '../lib/normtext/typen';
import { kuratiereTocSektionen } from '../pages/gesetz-leser/berechnungen';

const LABEL = 'Wortlaut der früheren Bestimmungen des sechsten Titels';

const snapshot = JSON.parse(readFileSync('public/normtext/bund/ZGB.json', 'utf8')) as {
  eintraege: NormSnapshot[];
};
const struktur = (JSON.parse(readFileSync('public/normtext/struktur/bund/ZGB.json', 'utf8')) as {
  artikel: StrukturMap;
}).artikel;

const { sektionen } = baueGliederungsbaum(snapshot.eintraege, struktur);
const topLabels = (liste: Sektion[]) => liste.map((s) => s.label);

describe('A36 — ZGB-TOC-Kuration (render-seitiger Gliederungs-Filter)', () => {
  it('Repro: der Eintrag steht heute als Top-Level-Knoten in der ZGB-Gliederung', () => {
    // Identitäts-Treffer (exaktes Label, §7) — kein Substring.
    expect(topLabels(sektionen)).toContain(LABEL);
  });

  it('TOC-Kuration: der kuratierte Baum enthält den Eintrag nicht mehr', () => {
    const toc = kuratiereTocSektionen(sektionen);
    expect(topLabels(toc)).not.toContain(LABEL);
    // Alle ÜBRIGEN Top-Level-Knoten bleiben vollständig und in Reihenfolge.
    expect(topLabels(toc)).toEqual(topLabels(sektionen).filter((l) => l !== LABEL));
  });

  it('Substanz-Probe (§15): der Inhalt bleibt — disp-Token in den Artikel-Daten, Voll-Baum unberührt', () => {
    // Die Lesespalte rendert den UNGEFILTERTEN Baum: der Knoten existiert dort weiter.
    kuratiereTocSektionen(sektionen);
    expect(topLabels(sektionen)).toContain(LABEL);
    // Die Artikel des früheren sechsten Titels bleiben in den Artikel-Daten
    // (Anker `#art-disp_u2_art_178`, Ctrl+F, Print speisen sich daraus).
    const tokens = new Set(snapshot.eintraege.map((e) => e.artikel));
    expect(tokens.has('disp_u2_art_178')).toBe(true);
    // Und sie hängen im Voll-Baum unter dem kuratierten Knoten (Lesespalte zeigt sie).
    const knoten = sektionen.find((s) => s.label === LABEL);
    const zaehle = (s: Sektion): number =>
      s.artikel.length + s.kinder.reduce((n, k) => n + zaehle(k), 0);
    expect(knoten && zaehle(knoten)).toBeGreaterThan(0);
  });

  it('Identitäts-Erhalt: ohne Treffer kommt DIESELBE Array-Referenz zurück (memo-stabil)', () => {
    const ohne = sektionen.filter((s) => s.label !== LABEL);
    expect(kuratiereTocSektionen(ohne)).toBe(ohne);
  });
});
