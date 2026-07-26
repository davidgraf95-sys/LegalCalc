import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// W2·5i-HIST-ANSICHT / H1 — «Änderungshistorie: aus / als Fussnoten / als Chronologie».
//
// Der Schritt trägt EINE nicht verhandelbare Auflage (H0-Auflage 1, Vollbericht
// `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`): ausblendbar ist AUSSCHLIESSLICH
// die build-seitig als reine Änderungshistorie klassifizierte Fussnote (`kl:'A'` im
// Sidecar → `data-fn-klasse="A"` im DOM). Echte Verweise, Grauzone, Publikations-
// nachweise, Unklares und alles OHNE Klasse bleiben in JEDER Ansicht sichtbar. Genau
// das prüfen die Tests hier — nicht nur, dass «aus» etwas ausblendet, sondern dass es
// das RICHTIGE ausblendet und nichts darüber hinaus.
//
// Erlass-Wahl BGBM (16 Artikel, ~21 KB Snapshot) = derselbe kleine Träger wie in
// `leser-optionen.e2e.ts`: die Toggle-Semantik ist seitengrössen-unabhängig (Attribut +
// CSS), und der 1686-Artikel-OR starvte den gedrosselten CI-Runner (Befund 4.7.2026).
//
// Die Fixtures sind am Bestand VERIFIZIERT (Sidecar public/normtext/struktur/bund/
// BGBM.json, Stand 26.7.2026):
//   · Art. 4  → fn 12 kl=A · fn 13 kl=V («SR 0.142.112.681») · fn 14 kl=A
//   · Art. 5  → fn 15 kl=Z («BBl 2017 2175») · fn 16 kl=V · fn 17 kl=A
//   · Art. 9  → fn 25/26 (2021-01-01) · fn 27 (2006-07-01) · fn 28 (2007-01-01), alle A
//               ⇒ Apparat-Reihenfolge 25,26,27,28 vs. Chronologie 27,28,25,26
//   · Art. 12 → fn 30 kl=A OHNE Datum («BRB vom 17. Juni 1996.») ⇒ «ohne Datum»

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: der «Ansicht»-Trigger rendert nur der Client (nicht im Crawler-HTML).
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  // Die Fussnoten kommen aus dem lazy geladenen Struktur-Sidecar — erst wenn der
  // Apparat steht, sind Klassen und Chronologie im DOM.
  await expect(page.locator('.lc-leser [data-fn-apparat]').first()).toBeAttached({ timeout: 20000 });
  await page.waitForTimeout(200);
}

async function ansichtOeffnen(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ansicht' }).first().click();
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible();
}

/** Die dreiwertige Wahl im «Ansicht»-Panel. */
function histWahl(page: Page, wert: 'aus' | 'fussnoten' | 'chronologie') {
  return page.locator(`[aria-label="Darstellung der Änderungshistorie"] [data-hist-wahl="${wert}"]`);
}

/** Apparat-Zeile einer Fussnote dieses Artikels (id = fn-<artikel>-<nr>). */
function apparatZeile(page: Page, artikel: string, nr: string) {
  return page.locator(`#fn-${artikel}-${nr}`);
}

test('Grundzustand: «als Fussnoten» ist Default, Attribut am <html>, drei Wahl-Knöpfe', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  // R6: der Default emittiert keine CSS-Regel — die Darstellung ist die heutige.
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'fussnoten');
  await ansichtOeffnen(page);
  const gruppe = page.locator('[aria-label="Darstellung der Änderungshistorie"]');
  await expect(gruppe).toBeVisible();
  await expect(gruppe.getByRole('button')).toHaveCount(3);
  // Ehrlicher Aktiv-Zustand (aria-pressed, kein role=radiogroup — es gibt keine
  // Pfeiltasten-Bedienung, die man versprechen dürfte).
  await expect(histWahl(page, 'fussnoten')).toHaveAttribute('aria-pressed', 'true');
  await expect(histWahl(page, 'aus')).toHaveAttribute('aria-pressed', 'false');
  await expect(histWahl(page, 'chronologie')).toHaveAttribute('aria-pressed', 'false');
});

test('«aus» dämpft NUR Klasse A — Verweis (V) und Publikationsnachweis (Z) bleiben sichtbar', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');

  const a12 = apparatZeile(page, '4', '12');       // A — Änderungsvermerk
  const v13 = apparatZeile(page, '4', '13');       // V — «SR 0.142.112.681»
  const a14 = apparatZeile(page, '4', '14');       // A — Änderungsvermerk
  const z15 = apparatZeile(page, '5', '15');       // Z — «BBl 2017 2175»
  const v16 = apparatZeile(page, '5', '16');       // V — «SR 0.632.231.422»

  // Vorbedingung: die Klassifikation ist im DOM angekommen (sonst prüfte der Test
  // nichts — ein Tor, das nicht scheitern kann, §6.7).
  await expect(a12).toHaveAttribute('data-fn-klasse', 'A');
  await expect(v13).toHaveAttribute('data-fn-klasse', 'V');
  await expect(z15).toHaveAttribute('data-fn-klasse', 'Z');

  // POSITIV im Grundzustand: alle sichtbar.
  for (const l of [a12, v13, a14, z15, v16]) {
    await l.scrollIntoViewIfNeeded();
    await expect(l).toBeVisible();
  }
  const verweisText = (await v13.textContent())?.trim() ?? '';
  expect(verweisText).toContain('0.142.112.681');

  await ansichtOeffnen(page);
  // CLS-Beobachter NUR für künftige Shifts (die Lade-Shifts sind nicht Gegenstand
  // des Umschalt-Beweises).
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  await histWahl(page, 'aus').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  // NEGATIV, der Kern der Auflage: A weg — V und Z BLEIBEN.
  await expect(a12).toBeHidden();
  await expect(a14).toBeHidden();
  await expect(v13).toBeVisible();
  await expect(z15).toBeVisible();
  await expect(v16).toBeVisible();

  // R9/§8-DOM-Beweis: die ausgeblendete Zeile ist NICHT gelöscht — ihr amtlicher
  // Wortlaut steht unverändert im DOM (Popover-Quelle, Wiederherstellung per Klick).
  expect((await a12.textContent())?.trim() ?? '').toContain('Aufgehoben durch');
  expect(await a12.count()).toBe(1);

  // Und der NORMTEXT ist von keiner Regel erfasst — Ctrl+F-Beweis: der amtliche
  // Wortlaut des Artikels bleibt sichtbar und findbar.
  const artikel = page.locator('#art-4');
  await expect(artikel).toBeVisible();
  const sichtbarerText = await artikel.evaluate((el) => (el as HTMLElement).innerText);
  expect(sichtbarerText.length).toBeGreaterThan(20);
  expect(sichtbarerText).toContain('0.142.112.681');   // die V-Fussnote ist mit-sichtbar

  // POSITIV zurück: Wiederherstellung vollständig.
  await histWahl(page, 'fussnoten').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'fussnoten');
  await expect(a12).toBeVisible();
  await expect(a14).toBeVisible();

  // A9-Muster: klick-getriebener Reflow ist input-exkludiert ⇒ kein CLS-Beitrag.
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBe(0);
});

test('«aus» dämpft auch die A-MARKER im Wortlaut, nicht nur den Apparat', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  const aMarker = page.locator('.lc-leser [data-fn-klasse="A"] button[aria-label^="Fussnote"]');
  const vMarker = page.locator('.lc-leser [data-fn-klasse="V"] button[aria-label^="Fussnote"]');
  const aAnzahl = await aMarker.count();
  const vAnzahl = await vMarker.count();
  expect(aAnzahl, 'BGBM trägt A-Marker im Wortlaut').toBeGreaterThan(0);
  expect(vAnzahl, 'BGBM trägt V-Marker im Wortlaut').toBeGreaterThan(0);

  await ansichtOeffnen(page);
  await histWahl(page, 'aus').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  // Alle A-Marker unsichtbar, alle V-Marker weiter sichtbar; Zahl im DOM unverändert.
  for (let i = 0; i < aAnzahl; i++) await expect(aMarker.nth(i)).toBeHidden();
  await expect(vMarker.first()).toBeVisible();
  expect(await aMarker.count()).toBe(aAnzahl);
  expect(await vMarker.count()).toBe(vAnzahl);
});

test('«als Chronologie»: A-Einträge chronologisch am Artikelfuss, Verweise bleiben im Apparat', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-9');

  const chrono = page.locator('#art-9 [data-hist-chrono]');
  // Liegt IMMER im DOM (kein Nachladen beim Umschalten), aber nur in ihrer Ansicht sichtbar.
  await expect(chrono).toBeAttached();
  await expect(chrono).toBeHidden();

  await ansichtOeffnen(page);
  await histWahl(page, 'chronologie').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'chronologie');
  await chrono.scrollIntoViewIfNeeded();
  await expect(chrono).toBeVisible();

  // SORTIERBEWEIS: Apparat-Reihenfolge ist die Fussnoten-Nummer (25,26,27,28), die
  // Chronologie ordnet nach Inkraftsetzung → 2006, 2007, 2021, 2021. Die Liste muss
  // also GEGEN die Nummern-Reihenfolge stehen, sonst wäre sie eine Durchreiche.
  // Datum GEZIELT über `[data-hist-datum]` lesen, nicht über die Span-Position:
  // seit B4 steht die Fussnoten-Nummer als erstes Kind, ein positionsabhängiger
  // Selektor las sonst die Nummer als «Jahr» (Befund beim B4-Einbau selbst).
  const jahre = await chrono.locator('li [data-hist-datum]').evaluateAll((els) =>
    els.map((el) => (el.textContent ?? '').trim()));
  expect(jahre.length).toBeGreaterThanOrEqual(4);
  const zahlen = jahre.map((t) => Number((t.match(/(\d{4})$/) ?? [])[1] ?? NaN));
  // Die ISO-Attribute sind der eigentliche Sortierschlüssel — auch die prüfen.
  const isos = await chrono.locator('li [data-hist-datum]').evaluateAll((els) =>
    els.map((el) => el.getAttribute('data-hist-datum') ?? ''));
  expect(isos.filter(Boolean)).toEqual([...isos.filter(Boolean)].sort());
  for (let i = 1; i < zahlen.length; i++) {
    expect(zahlen[i], `Chronologie aufsteigend: ${jahre.join(' | ')}`).toBeGreaterThanOrEqual(zahlen[i - 1]);
  }
  expect(zahlen[0]).toBe(2006);
  expect(zahlen[zahlen.length - 1]).toBe(2021);

  // Gegenprüfungs-Befund B4: jede Chronologie-Zeile nennt ihre Fussnoten-NUMMER,
  // sonst ist der Marker im Wortlaut (²⁷) keinem Eintrag zuzuordnen. Erste Zeile =
  // fn 27 (2006-07-01), letzte = fn 26 (2021, Tie-Break nach Nummer hinter fn 25).
  // `textContent`, NICHT `innerText`: die Artikel stehen unter
  // `content-visibility: auto` (W2.8) — dort liefert `innerText` für nicht
  // gerenderte Teilbäume einen LEEREN String, und die Zusicherung wäre still wahr
  // bzw. still falsch, je nach Scroll-Zustand. `textContent` ist layout-unabhängig.
  const zeilen = await chrono.locator('li').evaluateAll((lis) =>
    lis.map((li) => (li.textContent ?? '').trim()));
  expect(zeilen[0].startsWith('27')).toBe(true);
  for (const nr of ['25', '26', '27', '28']) {
    expect(zeilen.some((z) => z.startsWith(nr)), `Chronologie nennt fn ${nr}`).toBe(true);
  }

  // Die A-Zeilen sind aus dem Apparat verschwunden (sie stehen jetzt oben) …
  await expect(apparatZeile(page, '9', '27')).toBeHidden();
  // … ihr Wortlaut bleibt aber im DOM (R9/§8) und das Marker-Popover findet ihn.
  expect((await apparatZeile(page, '9', '27').textContent())?.trim() ?? '').toContain('Eingefügt durch');

  // Art. 9 trägt AUSSCHLIESSLICH A-Fussnoten ⇒ der Apparat hätte nur noch unsichtbare
  // Zeilen. Die `:not(:has(> :not([data-fn-klasse="A"])))`-Regel nimmt dann auch seinen
  // Rahmen mit, damit keine leere Trennlinie stehen bleibt.
  await expect(page.locator('#art-9 [data-fn-apparat]')).toBeHidden();

  // Gegenprobe auf einem Artikel MIT Verweis: dort bleibt der Apparat (samt Rahmen)
  // stehen, weil er eine nicht-A-Zeile trägt — der V-Eintrag ist sichtbar, erscheint
  // aber NICHT in der Chronologie (die zeigt nur Änderungsvermerke).
  await page.locator('#art-4').scrollIntoViewIfNeeded();
  await expect(page.locator('#art-4 [data-fn-apparat]')).toBeVisible();
  await expect(apparatZeile(page, '4', '13')).toBeVisible();
  // Ebenfalls `textContent`: mit `innerText` wäre diese Negativ-Zusicherung schon
  // durch einen leeren String erfüllt (content-visibility) und damit wertlos.
  const chrono4 = (await page.locator('#art-4 [data-hist-chrono]').textContent()) ?? '';
  expect(chrono4.length, 'Chronologie von Art. 4 ist nicht leer (sonst prüft die Zeile unten nichts)').toBeGreaterThan(10);
  expect(chrono4).not.toContain('0.142.112.681');
});

test('Chronologie ist ehrlich bei fehlendem Datum («ohne Datum», §8)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-12');
  await ansichtOeffnen(page);
  await histWahl(page, 'chronologie').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'chronologie');
  // BGBM Art. 12 fn 30 = «BRB vom 17. Juni 1996.» — Klasse A, aber KEINE
  // «in Kraft seit»-Klausel ⇒ kein Sortierdatum. Statt zu raten (oder das Datum
  // aus dem Fliesstext zu greifen) sagt die Zeile es aus.
  const chrono = page.locator('#art-12 [data-hist-chrono]');
  await chrono.scrollIntoViewIfNeeded();
  await expect(chrono).toBeVisible();
  await expect(chrono).toContainText('ohne Datum');
  await expect(chrono).toContainText('BRB vom 17. Juni 1996');
});

test('Persistenz + Pre-Paint: die Wahl übersteht den Reload ohne Flackern', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await ansichtOeffnen(page);
  await histWahl(page, 'aus').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  expect(ls).toContain('"hist":"aus"');

  await page.reload();
  // Pre-Paint (wendeLeserOptionenAn in main.tsx, CSP-konform aus dem Modul-Script):
  // das Attribut steht VOR dem ersten Paint — kein Flash der Änderungsvermerke.
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await expect(page.locator('#art-4')).toBeVisible();
  await expect(apparatZeile(page, '4', '12')).toBeHidden();
  await expect(apparatZeile(page, '4', '13')).toBeVisible();
});

test('«aus»: GRAUZONE (G) und UNKLAR (U) bleiben sichtbar — Auflage 1 vollständig', async ({ page }) => {
  // Gegenprüfungs-Befund B5 (26.7.2026): die übrigen Tests deckten nur V und Z ab.
  // Verbreitert jemand später den CSS-Selektor von `[data-fn-klasse="A"]` auf
  // `[data-fn-klasse]`, MUSS auch für G und U rot werden — sonst schützt die
  // H0-Auflage 1 nur die zwei geprüften Klassen.
  //
  // BGBM trägt weder G noch U. ELG Art. 10 trägt A, G UND U auf EINEM Artikel
  // (verifiziert am Sidecar 26.7.2026): fn34 = A · fn35 = U («Beträge angepasst
  // gemäss …») · fn41 = G (Revisionsvermerk mit UeB-Zeiger «Siehe auch die UeB …»).
  await warteReader(page, '/gesetze/bund/ELG', 'art-10');
  const a34 = apparatZeile(page, '10', '34');
  const u35 = apparatZeile(page, '10', '35');
  const g41 = apparatZeile(page, '10', '41');

  // Vorbedingung: die Klassen stehen wirklich im DOM (sonst prüft der Test nichts, §6.7).
  await expect(a34).toHaveAttribute('data-fn-klasse', 'A');
  await expect(u35).toHaveAttribute('data-fn-klasse', 'U');
  await expect(g41).toHaveAttribute('data-fn-klasse', 'G');

  await ansichtOeffnen(page);
  await histWahl(page, 'aus').click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  await expect(a34).toBeHidden();
  await expect(u35).toBeVisible();
  await expect(g41).toBeVisible();
  // Und ihr Inhalt ist unverändert lesbar (nicht bloss ein leeres sichtbares Element).
  await expect(u35).toContainText('Beträge angepasst');
  await expect(g41).toContainText('Siehe auch die UeB');
});

test('axe: das offene Panel MIT der neuen Wahl und die Chronologie-Ansicht sind sauber', async ({ page }, testInfo) => {
  // Das neue Steuerelement lebt in einem Panel, das die a11y.e2e.ts-Stichprobe NICHT
  // öffnet (die scannt den Reader mit geschlossenem Menü) — und die Chronologie-Liste
  // ist eine neue Textfläche mit eigenem Kontrast. Beide werden hier gescannt, sonst
  // wäre die axe-Zusage für diesen Schritt leer.
  const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  // Gleiche Determinismus-Vorkehrungen wie a11y.e2e.ts: Theme gepinnt (sonst
  // entscheidet die Uhrzeit über hell/dunkel → flaky Kontraste) und reduzierte
  // Bewegung (sonst misst axe mitten in der Einblende-Animation).
  await page.addInitScript(() => {
    try { localStorage.setItem('lexmetrik-thema', 'hell'); } catch { /* privater Modus */ }
  });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await warteReader(page, '/gesetze/bund/BGBM', 'art-9');
  await ansichtOeffnen(page);
  await histWahl(page, 'chronologie').click();
  await expect(page.locator('#art-9 [data-hist-chrono]')).toBeVisible();

  const ergebnis = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  // Gleiche Tor-Politik wie a11y.e2e.ts: critical/serious gaten. `link-in-text-block`
  // ist der dokumentierte Marken-Entscheid B-2 (Inline-Links ohne Unterstreichung)
  // und gilt für die ganze Reader-Seite, nicht für diese Fläche.
  const bekannt = new Set(['link-in-text-block']);
  const schwer = ergebnis.violations.filter(
    (v) => (v.impact === 'critical' || v.impact === 'serious') && !bekannt.has(v.id),
  );
  if (ergebnis.violations.length > 0) {
    await testInfo.attach('hist-ansicht-befunde.json', {
      body: JSON.stringify(ergebnis.violations.map((v) => ({
        id: v.id, impact: v.impact, help: v.help, knoten: v.nodes.map((n) => n.target.join(' ')),
      })), null, 2),
      contentType: 'application/json',
    });
  }
  expect(
    schwer.map((v) => `${v.id} (${v.impact}): ${v.help} — z. B. ${v.nodes[0]?.target.join(' ')}`),
    'axe hist-ansicht: keine critical/serious-Verstösse',
  ).toEqual([]);
});

test('Kein totes Steuerelement: «Fussnoten AUS» entfernt die Historie-Wahl (§13 F4)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await ansichtOeffnen(page);
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toBeVisible();
  // Bei «Fussnoten aus» verschwindet der ganze Apparat — eine Historie-Wahl darin
  // wäre wirkungslos, also wird sie nicht angeboten.
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toHaveCount(0);
  // Und die Chronologie-Liste folgt dem Fussnoten-Toggle mit (sie ist Apparat-Ersatz,
  // kein Umweg um ihn).
  await expect(page.locator('#art-4 [data-hist-chrono]')).toBeHidden();
  // Zurück: die Wahl ist wieder da.
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toBeVisible();
});
