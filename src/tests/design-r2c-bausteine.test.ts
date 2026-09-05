/**
 * W2·19-DESIGN-KONSISTENZ — Runde 2, Paket C (31.8.2026).
 *
 * Bewacht die vier Kanons dieses Pakets:
 *   C-4  EINE Treffer-Zeile (`ui/TrefferZeile`) für Katalog-Register UND
 *        Such-Panel; der Behälter bleibt je Fläche.
 *   C-5  EINE Rubrik-Kachel (`ui/RubrikKachel`) für die Startseiten-Landkarte
 *        UND den /gesetze-Einstieg — inkl. §8: der Zähler-WORTLAUT ist beim
 *        Umbau von der Fusszeile in die Einheit gewandert, nicht verändert.
 *   D-3  EIN Auswahl-Signal: die invertierte `bg-ink-900`-Füllung ist weg, die
 *        Pillen laufen über `ui/SelectionGrid` (variant «pille»).
 *   §5   EINE Dialog-Fokus-Falle: `useDialogFokus`, auch im Lesemodus-Overlay.
 *
 * QUELLTEXT-Sonde, kein Render-Test: bewacht wird «diese Form kommt in der App
 * genau einmal vor» — am Quelltext messbar, am DOM einer Seite nicht.
 *
 * ROT-BEWEIS (§6.7): jeder Fall trägt eine NEGATIV-KONTROLLE mit dem Wortlaut,
 * wie er vor dem Bau im Repo stand. Läuft die Kontrolle grün, prüft der Ausdruck
 * nichts und der Fall ist wertlos.
 *
 * Reine Darstellung (§3) — keine Rechtslogik berührt.
 */
import { describe, it, expect } from 'vitest';
// R5-A (5.9.2026) · §5: Verzeichnis-Wanderung und Kommentar-Sieb standen hier
// als eigene Kopie von `appDateien.ts`. Ein Wächter, der seinen Sweep selbst
// nachbaut, ist ab der ersten Abweichung ein anderer Wächter als sein
// Nachbar — beide hängen jetzt an der einen Quelle.
import { join } from 'node:path';
import { APP_WURZEL, alleQuellen, ohneKommentare, liesRoh } from './appDateien';

const WURZEL = APP_WURZEL;

const rohLies = (pfad: string) => liesRoh(join(WURZEL, pfad));

/** Quelltext OHNE Kommentare — die Herleitungen dürfen den Vorzustand beim
 *  Namen nennen (§2b), ohne die Sonde für immer rot zu färben. */
const lies = (rel: string) => rohLies(rel)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((z) => !/^\s*(\/\/|\*)/.test(z)).join('\n');



// ─── C-4 · EINE Treffer-Zeile ───────────────────────────────────────────────

describe('C-4 · Treffer-Zeilen laufen über EINEN Baustein', () => {
  const katalog = lies('components/Katalog.tsx');
  const suche = lies('components/suche/SuchResultate.tsx');

  it('beide Flächen konsumieren `ui/TrefferZeile` samt gemeinsamem Rahmen', () => {
    for (const [name, q] of [['Katalog', katalog], ['SuchResultate', suche]] as const) {
      expect(q, `${name}: rendert den Baustein`).toContain('<TrefferZeile');
      expect(q, `${name}: teilt die Flex-Geometrie/den Gruppen-Namen`).toContain('TREFFER_ZEILE_RAHMEN');
    }
  });

  it('keine der beiden zeichnet Titel/Untertitel/Pfeil noch selbst', () => {
    // Die drei Formen, die vor dem Bau je Fläche dastanden.
    const eigeneTitelzeile = /<span className="block [^"]*text-ink-900[^"]*">\{(?:sansAmp\(k\.title\)|t\.label)\}/;
    const eigenerPfeil = /className="[^"]*group-hover\/z:translate-x-0\.5/;
    for (const [name, q] of [['Katalog', katalog], ['SuchResultate', suche]] as const) {
      expect(q, `${name}: eigene Titelzeile`).not.toMatch(eigeneTitelzeile);
      expect(q, `${name}: eigener Hover-Pfeil`).not.toMatch(eigenerPfeil);
    }
  });

  it('NEGATIV-KONTROLLE: die Ausdrücke finden die Vorher-Formen', () => {
    // Katalog.tsx vor dem Bau (Stand 31.8.2026, Zeile 40).
    expect(
      '<span className="block font-sans font-medium text-ink-900 text-body-s leading-snug">{sansAmp(k.title)}</span>',
    ).toMatch(/<span className="block [^"]*text-ink-900[^"]*">\{(?:sansAmp\(k\.title\)|t\.label)\}/);
    // SuchResultate.tsx vor dem Bau (Stand 31.8.2026, Zeile 66/75).
    expect(
      '<span className="block max-sm:line-clamp-2 sm:truncate text-body-s font-medium text-ink-900 transition-colors group-hover/z:text-brass-800">{t.label}</span>',
    ).toMatch(/<span className="block [^"]*text-ink-900[^"]*">\{(?:sansAmp\(k\.title\)|t\.label)\}/);
    expect(
      `className="text-ink-300 transition-all group-hover/z:translate-x-0.5 group-hover/z:text-brass-500"`,
    ).toMatch(/className="[^"]*group-hover\/z:translate-x-0\.5/);
  });

  it('der Baustein ist genau einmal definiert', () => {
    const definitionen = alleQuellen()
      .filter((d) => /export function TrefferZeile\(/.test(liesRoh(d)));
    expect(definitionen.map((d) => d.slice(WURZEL.length + 1)))
      .toEqual(['components/ui/TrefferZeile.tsx']);
  });
});

// ─── C-5 · EINE Rubrik-Kachel ───────────────────────────────────────────────

describe('C-5 · Einstiegs-Kacheln laufen über EINEN Baustein', () => {
  const start = lies('components/start/RubrikKacheln.tsx');
  const gesetze = lies('pages/Gesetze.tsx');

  it('beide Flächen konsumieren `ui/RubrikKachel`', () => {
    for (const [name, q] of [['RubrikKacheln', start], ['Gesetze', gesetze]] as const) {
      expect(q, `${name}: rendert den Baustein`).toContain('<RubrikKachel');
    }
  });

  it('keine der beiden zeichnet die Kachel-Anatomie noch selbst', () => {
    // Der Kachel-Kopf (grosse Zahl + Einheit-Overline) und die Startseiten-
    // Fusszeile stehen nur noch im Baustein.
    const eigenerZahlKopf = /className="num font-display text-h1 leading-none text-brass-700"/;
    const eigeneZaehlerFusszeile = /className="block text-micro num text-ink-500"/;
    expect(gesetze, 'Gesetze: eigener Zahl-Kopf').not.toMatch(eigenerZahlKopf);
    expect(start, 'RubrikKacheln: eigene Zähler-Fusszeile').not.toMatch(eigeneZaehlerFusszeile);
    // Die Landkarten-Kachel ist `lc-card` (und erbt damit die EINE Hover-Regel
    // aus C-3), nicht mehr `lc-tile` mit eigener Hover-Kette.
    expect(start, 'RubrikKacheln: keine eigene lc-tile-Kachel').not.toContain('lc-tile');
  });

  it('NEGATIV-KONTROLLE: die Ausdrücke finden die Vorher-Formen', () => {
    expect('<span className="num font-display text-h1 leading-none text-brass-700">{k.zahl}</span>')
      .toMatch(/className="num font-display text-h1 leading-none text-brass-700"/);
    expect('<span className="block text-micro num text-ink-500">{r.zaehler}</span>')
      .toMatch(/className="block text-micro num text-ink-500"/);
  });

  it('§8: der Zähler-Wortlaut ist gewandert, nicht abgeschwächt', () => {
    // «erfasst» für die bibliografischen Materialien, «im Volltext» für die
    // echten Volltexte (E6a·M5) — der Umbau darf die Aussage nicht glätten.
    expect(start).toContain('amtliche Materialien erfasst');
    expect(start).toContain('Entscheide im Volltext');
    // DEKLARIERTE ANPASSUNG (W2·23-STARTSEITE-V4 §3, 5.9.2026, §6.3): der
    // Erlass-Zähler steht nicht mehr in der Landkarte — «Gesetze» hat mit V4
    // eine eigene Schwerpunkt-Sektion. Geprüft wird darum dort, WO die Zahl
    // heute steht; die §8-Aussage selbst ist unverändert scharf.
    const gesetzeBund = lies('components/start/GesetzeChips.tsx');
    const gesetzeBlock = lies('components/start/GesetzeBlock.tsx');
    expect(start, 'Landkarte führt den Erlass-Zähler nicht mehr').not.toContain('Erlasse im Volltext');
    expect(gesetzeBund, 'Bund-Zeile: Zähler mit Scope').toMatch(/erlasse im Volltext/i);
    expect(gesetzeBlock, 'Kanton-Zeile: Zähler mit Scope').toMatch(/erlasse im Volltext/i);
    // §8 am Kantons-Chip: Zustands-Wort im Accessible Name, nie «vollständig»
    // aus eigener Kraft (erfassungsgrad.ts bleibt die eine Quelle).
    expect(gesetzeBlock).toContain('STUFE_WORT');
    expect(gesetzeBlock).toContain('erfasst');
  });

  it('der Baustein ist genau einmal definiert', () => {
    const definitionen = alleQuellen()
      .filter((d) => /export function RubrikKachel\(/.test(liesRoh(d)));
    expect(definitionen.map((d) => d.slice(WURZEL.length + 1)))
      .toEqual(['components/ui/RubrikKachel.tsx']);
  });
});

// ─── D-3 · EIN Auswahl-Signal ───────────────────────────────────────────────

describe('D-3 · Auswahl-Pillen laufen über SelectionGrid', () => {
  /** Die invertierte Füllung, mit der vier Wizard-Stellen die Auswahl zeigten. */
  const INVERS = 'bg-ink-900 border-ink-900 text-paper';
  /** Die Pillen-Anatomie — sie darf nur noch im Baustein stehen. */
  const PILLE = /px-3 py-1\.5 rounded-full text-body-s font-medium border transition-colors/;

  it('die invertierte ink-900-Füllung als Auswahl-Signal ist nirgends mehr', () => {
    const funde = alleQuellen()
      .filter((d) => ohneKommentare(liesRoh(d)).includes(INVERS))
      .map((d) => d.slice(WURZEL.length + 1));
    expect(funde).toEqual([]);
  });

  it('die Pillen-Anatomie steht genau einmal — im Baustein', () => {
    const funde = alleQuellen()
      .filter((d) => PILLE.test(ohneKommentare(liesRoh(d))))
      .map((d) => d.slice(WURZEL.length + 1));
    expect(funde).toEqual(['components/ui/SelectionGrid.tsx']);
  });

  it('NEGATIV-KONTROLLE: die Ausdrücke finden die Vorher-Form', () => {
    const vorher = 'className={`px-3 py-1.5 rounded-full text-body-s font-medium border transition-colors ${'
      + "a.entschaedigung === code ? 'bg-ink-900 border-ink-900 text-paper' : 'bg-surface border-line text-ink-600 hover:border-brass-400'}`}";
    expect(vorher).toContain(INVERS);
    expect(PILLE.test(vorher)).toBe(true);
  });

  it('die vier Fundstellen konsumieren die Pillen-Variante', () => {
    for (const rel of [
      'pages/VorlagePatientenverfuegung.tsx',
      'pages/VorlageVorsorgeauftrag.tsx',
      'pages/VorlageSchlichtungsgesuchBs.tsx',
    ]) {
      expect(lies(rel), `${rel}: variant="pille"`).toContain('variant="pille"');
    }
  });

  it('§1: die BEDEUTUNGS-Töne der Patientenverfügung überleben die Vereinheitlichung', () => {
    // «zustimmen»/«ablehnen»/«nur befristet» tragen Farbe als AUSSAGE, nicht als
    // Auswahl-Zustand — sie wegzunehmen wäre Informationsverlust (§1/§8).
    const pv = lies('pages/VorlagePatientenverfuegung.tsx');
    expect(pv).toMatch(/code: 'zustimmen',[^\n]*ton: 'zustimmung'/);
    expect(pv).toMatch(/code: 'ablehnen',[^\n]*ton: 'ablehnung'/);
    expect(pv).toMatch(/code: 'nur_befristet',[^\n]*ton: 'vorbehalt'/);
    const baustein = lies('components/ui/SelectionGrid.tsx');
    // A3-6-NACHFÜHRUNG (R3-α, 31.8.2026) — DEKLARIERTE fachliche Änderung, kein
    // Refactoring-Nachziehen (§6.3): der Zustimmungs-Ton stand in der
    // MATERIALIEN-Kennfarbe `sage`. Er ist auf die Zustands-Rolle `--ok-*`
    // gezogen (wertidentisch, §4b-B-i) — das Signal ist unverändert, seine
    // Herkunft ist es nicht mehr. Die Zusicherung dieses Falls («die drei
    // Bedeutungs-Töne überleben») bleibt Wort für Wort dieselbe.
    expect(baustein).toContain('bg-ok-bg border-ok-line text-ok-text');
    expect(baustein).toContain('bg-danger-bg border-danger-line text-danger-700');
    expect(baustein).toContain('bg-warn-bg border-warn-500 text-warn-700');
  });
});

// ─── §5 · EINE Dialog-Fokus-Falle ───────────────────────────────────────────

describe('§5 · der Lesemodus benutzt die geteilte Fokus-Falle', () => {
  const overlay = lies('components/rechtsprechung/LesemodusOverlay.tsx');

  it('ruft `useDialogFokus` statt einer eigenen Tab-Schleife', () => {
    expect(overlay).toContain('useDialogFokus(true, dialogRef, onClose, schliessRef)');
    expect(overlay).not.toContain("querySelectorAll<HTMLElement>('a[href], button:not([disabled])')");
    expect(overlay).not.toContain('e.shiftKey && document.activeElement === erst');
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die Vorher-Falle', () => {
    const vorher = `const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (e.shiftKey && document.activeElement === erst) { e.preventDefault(); letzt.focus(); }`;
    expect(vorher).toContain("querySelectorAll<HTMLElement>('a[href], button:not([disabled])')");
    expect(vorher).toContain('e.shiftKey && document.activeElement === erst');
  });

  it('der Anfangsfokus bleibt «✕ schliessen» (nicht der erste Grössen-Knopf)', () => {
    expect(lies('components/layout/useDialogFokus.ts'))
      .toContain('(startFokus?.current ?? sammle()[0] ?? wurzel).focus()');
  });
});
