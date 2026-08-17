import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { InhaltsKopf } from '../components/layout/InhaltsKopf';
import { PaneKopf } from '../components/layout/PaneKopf';
import type { KopfDaten } from '../components/layout/InhaltsKopfKontext';

// ─── A-2 · DER ERWEITERUNGSPUNKT `KopfDaten.kopfzeileSelbst` (David 17.8.2026) ─
//
// Auftrag: «wir haben jetzt oben einen header mit ähnlichem inhalt … passe das
// entsprechend sinnvoll an». Umgesetzt als EIN Feld im Melde-Vertrag statt als
// Sonderfall für den Gesetzes-Leser — meldet eine Inhaltsseite es, gibt die App-
// Hülle ihre Kopfleiste ab.
//
// WARUM EINE DOM-FREIE SONDE ZUSÄTZLICH ZUR e2e: die e2e
// (`e2e/leser-v3-eine-kopfzeile.e2e.ts`) prüft das Ergebnis IM BROWSER und für
// EINEN Konsumenten (V3). Diese Sonde prüft den VERTRAG: dass das Feld für sich
// wirkt, unabhängig davon, wer es meldet. Sie wird rot, wenn jemand die Wirkung
// an eine Route, ein Flag oder einen Erlass bindet — genau die Abkürzung, die
// FL-1 verbietet («`components/layout/**` darf nicht wissen, ob V3 läuft»).
//
// ROT ZU BEKOMMEN (§6.7, am 17.8.2026 gesehen): in
// `src/components/layout/InhaltsKopf.tsx` den Block `if (daten.kopfzeileSelbst)`
// entfernen bzw. in `PaneKopf.tsx` `nurSteuerung` ignorieren — dann tragen beide
// Leisten ihre Identität weiter und alle vier Fälle unten fallen.

const noop = () => {};

const MIT_KRUME: KopfDaten = {
  breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: 'Bund', to: '/gesetze' }, { label: 'StPO' }],
  stand: '01.04.2025',
  artikel: 'Art. 429 StPO',
};

function inhaltsKopfHtml(daten: KopfDaten): string {
  return renderToString(
    <MemoryRouter>
      <InhaltsKopf daten={daten} breiteKlasse="max-w-content" onSchliessen={noop} />
    </MemoryRouter>,
  );
}

describe('A-2 — InhaltsKopf: `kopfzeileSelbst` schaltet die Leiste ab', () => {
  it('POSITIV-SONDE: ohne das Feld steht die Leiste vollständig (sonst prüfte das Verbot nichts)', () => {
    const html = inhaltsKopfHtml(MIT_KRUME);
    expect(html).toContain('data-inhalt-kopf');
    expect(html).toContain('Brotkrümel');
    expect(html).toContain('StPO');
    expect(html).toContain('01.04.2025');
    expect(html).toContain('Art. 429');
  });

  it('mit `kopfzeileSelbst`: keine Krume, kein Stand, kein Artikel, kein ✕', () => {
    const html = inhaltsKopfHtml({ ...MIT_KRUME, kopfzeileSelbst: true });
    expect(html, 'die laute Leiste ist noch da').not.toContain('data-inhalt-kopf"');
    expect(html).not.toContain('Brotkrümel');
    expect(html).not.toContain('01.04.2025');
    expect(html).not.toContain('Art. 429');
    expect(html).not.toContain('✕');
    // Und sie ist auch nicht mehr zu SEHEN: kein Papier-Grund, keine gezeichnete
    // Kante. (Ihre HÖHE bleibt — Herleitung im nächsten Fall.)
    expect(html).not.toContain('bg-paper');
    expect(html).not.toContain('border-line');
  });

  it('der stille Träger bleibt — Anker der Rückmeldungen UND reserviertes Band', () => {
    // ZWEI Aufgaben, beide gemessen hergeleitet (Herleitung in `InhaltsKopf.tsx`):
    //  · `DeepLinkSkeleton` positioniert sich `absolute top-full` an seiner
    //    Unterkante — fiele der Träger weg, läge das Overlay am Seitenanfang;
    //  · seine HÖHE bleibt (`h-9` + 1 px Kante), damit beim Eintreffen der Meldung
    //    nichts im Fluss wandert. Ohne sie rückte `main#inhalt` 102 → 65 px hoch
    //    (Shift 0.0238) und das Bestands-Tor `leser-kopf-cls-s3` riss bei v3 @390
    //    seine Schwelle 0.05 mit 0.0573 (gemessen 17.8.2026). Sichtbar ist das
    //    Band nicht — der Leser-Kopf verschluckt es (`--leser-v3-app-band`).
    const html = inhaltsKopfHtml({ ...MIT_KRUME, kopfzeileSelbst: true });
    expect(html).toContain('data-inhalt-kopf-still');
    expect(html).toContain('sticky top-16');
    expect(html, 'das reservierte Band hat seine Höhe verloren — der Inhalt springt wieder')
      .toContain('h-9');
    expect(html).toContain('border-transparent');
    // Ohne `pointer-events-none` schluckte das Band (höheres z) die Klicks auf
    // Krume und Griffe des Kopfes, der darunter liegt.
    expect(html).toContain('pointer-events-none');
  });
});

describe('A-2 — PaneKopf: `nurSteuerung` gibt die Identität ab, behält das Fenster', () => {
  const steuerung = {
    rolle: 'sekundaer' as const, label: 'StPO', stand: '01.04.2025',
    artikel: 'Art. 429 StPO',
    breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: 'StPO' }],
    onSchliessen: noop, onHauptfenster: noop, onTeilen: noop, onBreadcrumb: noop,
    ziehbar: true,
  };

  it('POSITIV-SONDE: ohne die Prop trägt die Leiste Krume, Artikel und Stand', () => {
    const html = renderToString(<PaneKopf {...steuerung} />);
    expect(html).toMatch(/<button[^>]*>Gesetze<\/button>/);
    expect(html).toContain('data-ort-artikel');
    expect(html).toContain('01.04.2025');
  });

  it('mit `nurSteuerung`: keine Krume, kein Artikel, kein Stand — aber alle Griffe', () => {
    const html = renderToString(<PaneKopf {...steuerung} nurSteuerung />);
    expect(html, 'die Krume steht noch in der Titelleiste').not.toMatch(/<button[^>]*>Gesetze<\/button>/);
    expect(html).not.toContain('data-ort-artikel');
    expect(html).not.toContain('01.04.2025');
    // Der sichtbare Titel darf auch nicht als Fallback zurückkommen (der
    // `label`-Zweig greift, sobald keine Krume gesetzt ist — genau diese Falle
    // ist am 17.8.2026 an der e2e aufgefallen).
    expect(html).not.toMatch(/<span[^>]*>StPO<\/span>/);
    // Was bleibt: die Fenster-Steuerung samt Ziehgriff. `label` steckt weiterhin
    // in den Accessible Names — sichtbar ist er nicht mehr.
    expect(html).toContain('Zum Verschieben ziehen');
    expect(html).toContain('zum Hauptfenster machen');
    expect(html).toContain('Layout-Link kopieren');
    expect(html).toContain('» schliessen');
    expect(html).toContain('data-pane-kopf');
  });
});
