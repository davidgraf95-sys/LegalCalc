// ─── Eingabe-Bausteine der Rechner/Vorlagen (Design-Konsistenz R2-E) ────────
//
// Drei Wächter und drei Vertrags-Belege zu den Befunden F1-1 (natives
// `type="date"`), F1-6 («(optional)» im Label statt der `optional`-Prop) und
// F1-10 (drei Kopier-Knopf-Bauformen).
//
// F1-1 ist KEINE Geschmacksfrage: `<input type="date">` rendert in der Locale
// des BROWSERS. Auf einem us-englischen Profil steht dort MM/DD/YYYY — und
// genau diese Felder tragen das fristauslösende Ereignis, das Datum des
// GV-Beschlusses (6-Monats-Verfall, Art. 650 Abs. 3 OR) oder den Stichtag
// einer Sperrfrist. Das Haus-`DatumsFeld` schreibt TT.MM.JJJJ fest und hält
// den WERT unverändert bei ISO (yyyy-MM-dd) — Engines und Vorlagen-Schemas
// sehen also exakt dasselbe wie vorher (§3: reine Darstellung).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { DatumsFeld } from '../components/DatumsFeld';
import { BetragsFeld } from '../components/BetragsFeld';
import { Field, KopierButton } from '../components/vorlagen/ui';

// Die Flächen des Pakets R2-E. Die Liste darf SCHRUMPFEN (eine Fläche fällt
// weg) und WACHSEN (eine neue Rechner-/Vorlagen-Fläche kommt dazu) — sie darf
// nur nie eine Fläche verlieren, weil dort wieder ein rohes Feld steht.
const R2E_FLAECHEN = [
  'src/components/forms/EinfacheFristForm.tsx',
  'src/components/forms/KombinierteAnsicht.tsx',
  'src/components/forms/ZpoFristenForm.tsx',
  'src/components/forms/MietrechtForm.tsx',
  'src/components/forms/GewaehrleistungForm.tsx',
  'src/components/forms/KuendigungSperrForm.tsx',
  'src/components/forms/LohnfortzahlungForm.tsx',
  'src/components/vorlagen/GmbhDokumentmappe.tsx',
  // R2-F (31.8.2026): Die GmbH-Gründungs-SEITE fehlte in dieser Liste — nur
  // ihre Dokumentmappe stand drin. Genau dort überlebte «(CHF, optional)» im
  // Label samt rohem CHF-Input. Aufgenommen, damit der Wächter die Fläche
  // künftig mitliest (die Liste darf wachsen).
  'src/pages/VorlageGmbhGruendung.tsx',
  'src/pages/VorlageKapitalerhoehung.tsx',
  'src/pages/VorlageMahnung.tsx',
  'src/pages/VorlageWerkvertrag.tsx',
  'src/pages/VorlageAuftrag.tsx',
  'src/pages/VorlageNda.tsx',
  'src/pages/VorlageKonkubinat.tsx',
  'src/pages/VorlageForderungsabtretung.tsx',
  'src/pages/VorlageVerjaehrungsverzicht.tsx',
  'src/pages/VorlageEheschutzgesuch.tsx',
  'src/pages/VorlageScheidungsklage.tsx',
  'src/pages/VorlageMietvertrag.tsx',
  'src/pages/vorlage-ag-gruendung/schritte-eingabe.tsx',
] as const;

const quelle = (p: string) => readFileSync(p, 'utf8');

// Kommentare fliegen raus, bevor gesucht wird: sie zitieren `type="date"` und
// «(optional)» legitim als Beleg (dieselbe Vorsichtsmassnahme wie in
// tap-ziel-token.test.ts).
const ohneKommentare = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('R2-E/F1-1 — kein natives type="date" auf den Rechner-/Vorlagen-Flächen', () => {
  it.each(R2E_FLAECHEN)('%s benutzt DatumsFeld statt <input type="date">', (pfad) => {
    const treffer = [...ohneKommentare(quelle(pfad)).matchAll(/type=["']date["']/g)];
    expect(
      treffer.length,
      `${pfad}: <input type="date"> rendert in der Browser-Locale (US: MM/DD/YYYY) — `
      + 'stattdessen <DatumsFeld value={iso} onChange={…} /> (Wert bleibt ISO)',
    ).toBe(0);
  });
});

describe('R2-E/F1-6 — «optional» steht in der Prop, nicht im Label-Text', () => {
  it.each(R2E_FLAECHEN)('%s trägt kein «(optional)» im Field-Label', (pfad) => {
    const labels = [...ohneKommentare(quelle(pfad)).matchAll(/<Field\s+label=(\{`[^`]*`\}|"[^"]*")/g)]
      .map((m) => m[1])
      .filter((l) => /optional/i.test(l));
    expect(
      labels,
      `${pfad}: «optional» gehört in die Field-Prop (rendert « · optional»), nicht in den Label-Text`,
    ).toEqual([]);
  });
});

describe('R2-E/F1-10 — «Kopiert ✓» rendert nur der geteilte KopierButton', () => {
  // Ausnahme mit Ablaufdatum: die Kontakt-Seite trägt noch ihre eigene
  // Kopier-Mechanik. Sie liegt ausserhalb der R2-E-Whitelist; die Zeile ist
  // hier notiert, damit sie sichtbar bleibt statt still zu überleben.
  const NOCH_EIGEN = ['src/pages/Kontakt.tsx'];

  it('kein zweiter Renderer der Erfolgs-Beschriftung', () => {
    const roh = rendernDeDateien();
    const fremde = roh.filter((p) => p !== 'src/components/vorlagen/ui.tsx' && !NOCH_EIGEN.includes(p));
    expect(
      fremde,
      'Erfolgs-Beschriftung «Kopiert ✓» nur im KopierButton (src/components/vorlagen/ui.tsx)',
    ).toEqual([]);
  });
});

/** Dateien, die die Erfolgs-Beschriftung wirklich RENDERN (Kommentare zählen
 *  nicht — mehrere Dateien erklären das Häkchen im Fliesstext). */
function rendernDeDateien(): string[] {
  const kandidaten = [
    'src/components/vorlagen/ui.tsx',
    'src/components/vorlagen/Dokumentmappe.tsx',
    'src/components/vorlagen/wizard.tsx',
    'src/components/vorlagen/useWizardState.ts',
    'src/components/ErgebnisAnzeige.tsx',
    'src/components/BegruendungAbsatz.tsx',
    'src/components/useKopieren.ts',
    'src/pages/Kontakt.tsx',
  ];
  return kandidaten.filter((p) => ohneKommentare(quelle(p)).includes('Kopiert ✓'));
}

describe('R2-E — der Wert-Vertrag der Bausteine bleibt unverändert', () => {
  it('DatumsFeld: ISO rein, TT.MM.JJJJ auf dem Schirm (F1-1)', () => {
    const html = renderToString(<DatumsFeld value="2026-06-01" onChange={() => {}} />);
    expect(html, 'die Anzeige ist schweizerisch').toContain('value="01.06.2026"');
    expect(html, 'kein natives Datumsfeld mehr').not.toContain('type="date"');
    expect(html, 'das Eingabemuster steht im Feld').toContain('placeholder="TT.MM.JJJJ"');
  });

  it('BetragsFeld: Rohwert rein, Schweizer Gruppierung auf dem Schirm (F1-7)', () => {
    // Der Rohwert-Vertrag ist der Punkt: das Schema bekommt weiterhin die
    // nackte Zahl, `fmtCHF`/`zahl` normalisieren Apostrophe ohnehin.
    expect(renderToString(<BetragsFeld value="100000" onChange={() => {}} />))
      .toContain('value="100&#x27;000"');
    expect(renderToString(<BetragsFeld value="100'000" onChange={() => {}} />))
      .toContain('value="100&#x27;000"');
  });

  it('Field verknüpft auch das zusammengesetzte DatumsFeld mit seinem Label (F1-2)', () => {
    const html = renderToString(
      <Field label="Zugang Kündigung"><DatumsFeld value="2026-06-01" onChange={() => {}} /></Field>,
    );
    const labelId = html.match(/id="([^"]+)-label"/)?.[1];
    expect(labelId, 'das Label trägt eine id').toBeTruthy();
    expect(html, 'das innere Eingabefeld zeigt darauf').toContain(`aria-labelledby="${labelId}-label"`);
  });

  it('Field: «optional» rendert als Nachsatz am Label (F1-6)', () => {
    const html = renderToString(<Field label="Zustellart" optional><input /></Field>);
    expect(html).toContain('· optional');
  });

  it('KopierButton: Gegenstand im Label, Kanon-Optik (F1-10)', () => {
    const html = renderToString(<KopierButton text="x" gegenstand="Ergebnis" />);
    expect(html, 'der Knopf sagt, WAS kopiert wird').toContain('Ergebnis kopieren');
    expect(html, 'Kanon-Optik lc-btn-outline lc-btn-sm').toContain('class="lc-btn-outline lc-btn-sm"');
  });
});
