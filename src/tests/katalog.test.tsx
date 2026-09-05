import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { Startseite } from '../pages/Startseite';
import { RechnerUebersicht } from '../pages/RechnerUebersicht';
import { VorlagenUebersicht } from '../pages/VorlagenUebersicht';
import { HeaderSuche } from '../components/layout/HeaderSuche';
import { HERO_TITEL } from '../lib/seo';

// Akzeptanztests Katalog/Rubriken. Stand UI-Welle (deklarierte Anpassung
// §6 Ziff. 3): /recherche ist aufgelöst — die Rechner-/Vorlagen-Register leben
// auf eigenen Übersichtsseiten (/rechner, /vorlagen), die die bestehende
// KategorieSektion wiederverwenden; die Suche liegt im Header-Dropdown. Die
// Startseite «/» ist das Suche-zuerst-Cockpit. Startseite V3 · Schritt 2
// (deklarierte Änderung §6.3): Favoriten gestrichen (Anweisung David 5.6.),
// Zeiterfassung auf /rechner verschoben — beide nicht mehr auf «/».
// W2·23-STARTSEITE-V4 (5.9.2026, deklarierte Änderung §6.3 — fachlich gewollter
// Umbau, kein Refactoring): der Tab-Kasten «Schnellrechner» ist auf «/»
// zurückgebaut (nur noch die Fristen-ZEILE + zwei Link-Karten unter
// «Werkzeuge»), «Gesetze» hat eine eigene Schwerpunkt-Sektion, und die
// Landkarte heisst «Weitere Bereiche».

// Minimaler localStorage-Mock (Node hat keinen)
beforeEach(() => {
  const speicher = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => void speicher.set(k, v),
    removeItem: (k: string) => void speicher.delete(k),
    clear: () => speicher.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
});

// UI-Welle: /recherche ist aufgelöst — die Rechner- und Vorlagen-Register
// leben jetzt auf eigenen Übersichtsseiten (/rechner, /vorlagen), die die
// bestehende KategorieSektion wiederverwenden (kein ?kategorie-Drilldown mehr,
// keine ?q=-Flachsuche — die Suche liegt im Header-Dropdown).
const rechnerHtml = () =>
  renderToString(
    <MemoryRouter initialEntries={['/rechner']}>
      <LocaleProvider><RechnerUebersicht /></LocaleProvider>
    </MemoryRouter>,
  );
const vorlagenHtml = (url = '/vorlagen') =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><VorlagenUebersicht /></LocaleProvider>
    </MemoryRouter>,
  );

// Startseite V2 (Cockpit) — eigener Renderer für die Anatomie-Tests.
const startHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><Startseite /></LocaleProvider>
    </MemoryRouter>,
  );

// Suche lebt seit dem App-Shell-Umbau im Top-Streifen (Topbar → HeaderSuche);
// Verhalten unverändert, neuer Ort (deklarierte Anpassung, §6 Ziff. 3).
const sucheHtml = (url: string) =>
  renderToString(
    <MemoryRouter initialEntries={[url]}>
      <LocaleProvider><HeaderSuche /></LocaleProvider>
    </MemoryRouter>,
  );

describe('Rechner-Übersicht /rechner (UI-Welle: Ersatz fürs Katalog-Deckblatt, §6.3)', () => {
  it('zeigt die drei Rechner-Kategorien als Sektionen — ohne Vorlagen/Deckblatt/Zurück-Weg, mit EINEM lokalen Filter (N0d·W4)', () => {
    const html = rechnerHtml();
    expect(html).toContain('id="register-zustaendigkeiten"');
    expect(html).toContain('id="register-fristen"');
    expect(html).toContain('id="register-gebuehren"');
    // Vorlagen liegen auf der eigenen Seite /vorlagen
    expect(html).not.toContain('id="register-vorlagen"');
    // kein Deckblatt-Klickmodell, kein «Alle Kategorien»-Zurück
    expect(html).not.toContain('aria-label="Oberkategorien"');
    expect(html).not.toContain('Alle Kategorien');
    // W2·10-UI-NAV/N0d·W4 (deklarierte fachliche Änderung, §6.3): GENAU EIN lokales
    // Filter-Feld über die bestehende Katalog-Struktur (keine zweite Voll-Suche —
    // die UniversalSuche bleibt der Kopf). Vorher war hier bewusst KEIN Suchfeld.
    expect(html).toContain('id="rechner-filter"');
    expect(html.match(/type="search"/g)?.length ?? 0).toBe(1);
  });

  it('Fristen-Register direkt sichtbar: Haupteinstieg Tagerechner + prozessual/materiell (kein Drilldown)', () => {
    const html = rechnerHtml();
    expect(html).toContain('id="register-titel-fristen"');
    expect(html).toContain('Fristen berechnen');
    expect(html).toContain('Einfacher Fristenrechner (Datum · Frist · Ferien-Wahl)');
    expect(html).toContain('href="/rechner/tagerechner"');
    expect(html).toContain('Prozessuale Fristen');
    expect(html).toContain('href="/rechner/zpo-fristen"');
    expect(html).toContain('href="/rechner/schkg-fristen"');
    expect(html).toContain('Materielle Fristen');
    expect(html).toContain('href="/rechner/verjaehrung"');
    expect(html).toContain('Art. 336c OR');
    // Ordnung INNERHALB des Fristen-Registers (Haupteinstieg Tagerechner vor
    // der materiellen Gewährleistungs-Frist). Ab dem Register-Anker schneiden,
    // da der neue «Einstieg nach Rechtsgebiet» (ROADMAP Schritt 5) oberhalb
    // dieselben Werkzeuge listet (deklarierte Struktur-Erweiterung, §6.3).
    const fristenAbschnitt = html.slice(html.indexOf('id="register-titel-fristen"'));
    expect(fristenAbschnitt.indexOf('Fristenrechner')).toBeLessThan(fristenAbschnitt.indexOf('Gewährleistung'));
    // Fristenspiegel aufgelöst; keine gleichrangige Mischliste
    expect(html).not.toContain('Fristenspiegel');
    expect(html).not.toContain('Weitere Werkzeuge');
  });

  it('Zuständigkeiten- + Gebühren-Sektion tragen ihre Werkzeuge; Ehrlichkeit (§8) bleibt', () => {
    const html = rechnerHtml();
    expect(html).toContain('Rechtswege');                  // Zuständigkeits-Register
    expect(html).toContain('href="/rechner/verzugszins"'); // Gebühren-Werkzeug
    expect(html).toContain('Entwurf</span>');
    expect(html).toContain('In Vorbereitung');
    expect(html).toContain('<details');
  });

  it('Methodik-Fuss + Pflichthinweis (§8) erreichbar; kein «kostenlos»', () => {
    const html = rechnerHtml();
    expect(html).toContain('So rechnet LexMetrik');
    expect(html).toContain('href="/methodik"');
    expect(html).toContain('Rechtlicher Hinweis');
    expect(html).not.toContain('kostenlos');
  });
});

describe('Vorlagen-Übersicht /vorlagen (UI-Welle)', () => {
  it('zeigt die Vorlagen-Sektion mit Dokument-Gruppen + Rechtsgebiet-Filter, keine Rechner-Sektion', () => {
    const html = vorlagenHtml();
    expect(html).toContain('id="register-vorlagen"');
    // Dokument-Gruppen (VORLAGE_SEKTIONEN-Titel)
    expect(html).toContain('Behördeneingaben');
    expect(html).toContain('Verträge');
    // Filter-Pillen nur in der Vorlagen-Kategorie
    expect(html).toContain('aria-label="Vorlagen nach Rechtsgebiet filtern"');
    // Rechner-Sektionen liegen auf /rechner
    expect(html).not.toContain('id="register-fristen"');
    expect(html).not.toContain('aria-label="Oberkategorien"');
  });

  it('eine verfügbare Vorlage ist direkt verlinkt; Filter-Reset «Alle» vorhanden', () => {
    const html = vorlagenHtml();
    expect(html).toContain('href="/vorlagen/mahnung"');
    expect(html).toContain('>Alle<');
  });
});

describe('Globale Suche im Top-Streifen (UI-Welle: Dropdown überall, §6.3)', () => {
  // Deklarierte fachliche Änderung (§6.3, UI-Welle): Das Topbar-Feld führt nicht
  // mehr über ?q=/«/recherche», sondern zeigt Treffer als Dropdown direkt unter
  // dem Feld — auf JEDER Seite gleich. Beim ersten Render (SSR, leeres Feld) ist
  // genau ein leeres Suchfeld da; das Dropdown erscheint erst clientseitig beim
  // Tippen (Lazy-Daten).
  it('rendert genau ein leeres Suchfeld mit «/»- UND ⌘K-Kürzel — unabhängig vom Pfad', () => {
    for (const url of ['/', '/rechner/verzugszins', '/gesetze', '/rechtsprechung']) {
      const html = sucheHtml(url);
      expect(html.match(/type="search"/g)?.length, url).toBe(1);
      expect(html, url).toContain('value=""');
      // A5 (David 5.7.2026): das Feld trägt jetzt auch ⌘K/Ctrl-K (frühere Palette
      // entfallen, Shortcut fokussiert das Feld). «/» bleibt Bestandteil des Kürzels.
      expect(html, url).toContain('aria-keyshortcuts="/ Meta+K Control+K"');
    }
  });

  it('trägt die Such-Landmark (role="search") und kein ?q=-gebundenes Vorbefüllen mehr', () => {
    const html = sucheHtml('/?q=Rechtsvorschlag');
    expect(html).toContain('role="search"');
    // Kein Spiegeln von ?q= ins Feld (Dropdown-Suche ist URL-unabhängig).
    expect(html).toContain('value=""');
  });
});

describe('Startseite V4 — Hero · Gesetze-Schwerpunkt · Werkzeuge (deklarierte Anpassung §6.3)', () => {
  it('zeigt Hero-H1, Begrüssung, Gesetze-Block und die Landkarte — KEIN Katalog-Deckblatt', () => {
    const html = startHtml('/');
    // Der Hero trägt die Value-Proposition-H1 (aus seo.ts) UND — neu in V4,
    // Auftrag David 5.9.2026 — wieder eine wechselnde Begrüssung samt Datum
    // «Wochentag, T. Monat JJJJ», weiterhin OHNE tickende Uhr.
    expect(html).toContain(HERO_TITEL);
    expect(html).toMatch(/\d{1,2}\.\s(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s\d{4}/);
    expect(html).not.toContain('Berechnung statt KI');
    // Sektionen des Cockpits: der Gesetze-Schwerpunkt, die Werkzeuge-Zeile und
    // die (auf vier Kacheln gekürzte) Landkarte.
    expect(html).toContain('Gesetze — Bund und Kantone');
    expect(html).toContain('Werkzeuge');
    expect(html).toContain('Weitere Bereiche');
    expect(html).not.toContain('Alle Bereiche');
    // Direktzugriff-Chips Bund + der bezifferte Link auf die Vollsicht.
    expect(html).toContain('href="/gesetze/bund/OR"');
    expect(html).toContain('Bundeserlasse');
    // Kantons-Chips mit dem Bestands-Ziel `?ebene=kanton&kt=<KT>` (nie erfunden).
    expect(html).toContain('/gesetze?ebene=kanton&amp;kt=BS');
    // Favoriten (5.6.) + Zeiterfassung (→ /rechner) sind nicht mehr auf «/».
    expect(html).not.toContain('Favoriten');
    expect(html).not.toContain('Zeiterfassung');
    // Die Fristen-Zeile rechnet live (echte Engine, keine Kopie).
    expect(html).toContain('Live-Berechnung');
    // Vertrauens-Fuss trägt den Pflichthinweis (§8).
    expect(html).toContain('Rechtlicher Hinweis');
    // Der Katalog (vier Oberkategorien) ist NICHT mehr auf der Startseite.
    expect(html).not.toContain('aria-label="Oberkategorien"');
  });

  it('«Werkzeuge» ist EINE Fristen-Zeile plus zwei Link-Karten — kein Tab-Kasten mehr', () => {
    const html = startHtml('/');
    // V4-Rückbau: der dreifache Reiter (und die zweite, anders gestaltete
    // Tab-Leiste der Gebührenart) ist von «/» verschwunden.
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toMatch(/role="tab"/);
    // Statt eingebetteter Zweit-Formulare zwei Einstiege in die Voll-Rechner.
    expect(html).toContain('href="/rechner/tagerechner"');
    expect(html).toContain('href="/rechner/prozesskosten"');
    expect(html).toContain('href="/rechner/zustaendigkeit"');
  });

  it('die Beispiel-Chips des Hero zeigen auf echte Korpus-Ziele', () => {
    const html = startHtml('/');
    expect(html).toContain('href="/gesetze/bund/OR#art-336_c"');
    expect(html).toContain('href="/rechtsprechung/bge_152_V_52"');
    expect(html).toContain('href="/vorlagen/arbeitsvertrag"');
  });
});

describe('FE-4: Rück-Abzweigung der Spezialrechner (FAHRPLAN-FRISTEN-EINHEIT)', () => {
  it.each(['RechnerVerjaehrung', 'RechnerGewaehrleistung', 'RechnerErbFristen', 'RechnerMietrecht', 'RechnerKuendigung'] as const)(
    '%s verlinkt zurück zum EINEN Fristenrechner-Einstieg', async (name) => {
      const mod = await import(`../pages/${name}.tsx`);
      const Seite = mod[name] as () => React.JSX.Element;
      const html = renderToString(
        <MemoryRouter initialEntries={['/x']}>
          <LocaleProvider><Seite /></LocaleProvider>
        </MemoryRouter>,
      );
      expect(html).toContain('Zum Fristenrechner');
      expect(html).toContain('href="/rechner/tagerechner"');
    });
});

describe('Kombinierter Fristenrechner (Auftrag 5.6.2026)', () => {
  it('Verfahrens-Schnitt vorhanden; Default Allgemein; Engines getrennt erreichbar', async () => {
    const { RechnerTagerechner } = await import('../pages/RechnerTagerechner');
    const html = renderToString(
      <MemoryRouter initialEntries={['/rechner/tagerechner']}>
        <LocaleProvider><RechnerTagerechner /></LocaleProvider>
      </MemoryRouter>,
    );
    expect(html).toContain('Allgemein (Vertrag/OR)');
    expect(html).toContain('Zivilprozess (ZPO)');
    expect(html).toContain('Betreibung (SchKG)');
    // Default = Allgemein-Form gerendert (Tabs frist/rueckwaerts/zwischen)
    expect(html).toContain('Tage zwischen');
    // FE-2: geführte Regime-Frage statt nackter Tabs; Weiche fragt, rät nicht
    expect(html).toContain('In welchem Verfahren läuft die Frist?');
    expect(html).toContain('Weiss nicht?');
  });
});
