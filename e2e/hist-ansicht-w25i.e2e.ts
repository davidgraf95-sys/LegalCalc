// @shard-gruppe: 5
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ÄNDERUNGSVERMERKE: AN/AUS — ZWEIWERTIG seit S1 (FAHRPLAN-LESER-V3 Kap. 4f,
// Entscheid David F1 «ja», 16.8.2026).
//
// ── DEKLARIERTE FACHLICHE ÄNDERUNG (§6.3) ────────────────────────────────────
// Diese Datei prüfte bis S1 eine DREIWERTIGE Wahl («aus · als Fussnoten · als
// Chronologie»). Der dritte Modus ist gestrichen, also fallen die beiden
// Chronologie-Tests (Sortierbeweis, «ohne Datum») und der Drei-Knöpfe-Test — sie
// prüften genau das entfernte Verhalten. KEINE Assertion wurde gelockert: der
// Vertrag ist an zwei Stellen STRENGER geworden.
//
//   (1) Neu: «aus» lässt KEINE Historie-Spur im Lesekörper. Bis S1 hing die
//       «Fassung»-Zeile am Artikelfuss (`[data-historie-zeile]`, «Gilt seit …» +
//       Fassungs-Zeitleiste) an GAR KEINEM Schalter (Kap. 5, Befund K4) — bei
//       «Änderungsvermerke aus» blieb sie als einzige Historie stehen, und der
//       Schalter hielt nicht, was er verspricht (§8). Der Test unten fordert das
//       Verschwinden von Marker, Apparat-Zeile UND Fassungs-Zeile gemeinsam.
//   (2) Neu: DOM-Vollständigkeit wird für alle drei zugleich geprüft, nicht nur
//       für die Apparat-Zeile.
//
// ── DIE NICHT VERHANDELBARE AUFLAGE ──────────────────────────────────────────
// H0-Auflage 1 (Vollbericht `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`):
// ausblendbar ist AUSSCHLIESSLICH die build-seitig als reine Änderungshistorie
// klassifizierte Fussnote (`kl:'A'` im Sidecar → `data-fn-klasse="A"` im DOM).
// Echte Verweise (V), Grauzone (G), Publikationsnachweise (Z), Unklares (U) und
// alles OHNE Klasse bleiben in BEIDEN Stellungen sichtbar. Die Tests prüfen
// darum nicht nur, DASS «aus» etwas ausblendet, sondern dass es das RICHTIGE
// ausblendet und nichts darüber hinaus.
//
// Erlass-Wahl BGBM (16 Artikel, ~21 KB Snapshot) = derselbe kleine Träger wie in
// `leser-optionen.e2e.ts`: die Toggle-Semantik ist seitengrössen-unabhängig (Attribut +
// CSS), und der 1686-Artikel-OR starvte den gedrosselten CI-Runner (Befund 4.7.2026).
//
// Die Fixtures sind am Bestand VERIFIZIERT (Sidecar public/normtext/struktur/bund/
// BGBM.json, Stand 26.7.2026):
//   · Art. 2  → trägt einen Historie-Shard-Eintrag ⇒ «Fassung»-Zeile «Gilt seit 01.01.2025»
//   · Art. 4  → fn 12 kl=A · fn 13 kl=V («SR 0.142.112.681») · fn 14 kl=A
//   · Art. 5  → fn 15 kl=Z («BBl 2017 2175») · fn 16 kl=V · fn 17 kl=A
//   · Art. 9  → fn 25/26/27/28, ALLE kl=A ⇒ Apparat ohne nicht-A-Zeile

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: der «Ansicht»-Trigger rendert nur der Client (nicht im Crawler-HTML).
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  // Die Fussnoten kommen aus dem lazy geladenen Struktur-Sidecar — erst wenn der
  // Apparat steht, sind die Klassen im DOM.
  await expect(page.locator('.lc-leser [data-fn-apparat]').first()).toBeAttached({ timeout: 20000 });
  await page.waitForTimeout(200);
}

// IDEMPOTENT (Befund beim ersten Lauf dieser Fassung): ein Klick auf einen
// Schalter schliesst das Panel NICHT. Ein zweiter blinder Klick auf «Ansicht»
// hätte es darum zugeklappt, und die folgende Zusicherung wäre am fehlenden Panel
// gescheitert — ein Fehlschlag der Prüfmechanik, nicht der Sache.
async function ansichtOeffnen(page: Page): Promise<void> {
  const panel = page.locator('[aria-label="Darstellungsoptionen"]').first();
  if (!(await panel.isVisible())) {
    await page.getByRole('button', { name: 'Ansicht' }).first().click();
  }
  await expect(panel).toBeVisible();
}

/** Der EINE zweiwertige Schalter (S1) — kein Streifen mit drei Knöpfen mehr. */
function vermerkeSchalter(page: Page) {
  return page.getByRole('switch', { name: 'Änderungsvermerke' });
}

/** Apparat-Zeile einer Fussnote dieses Artikels (id = fn-<artikel>-<nr>). */
function apparatZeile(page: Page, artikel: string, nr: string) {
  return page.locator(`#fn-${artikel}-${nr}`);
}

test('Grundzustand: «an» ist Default, Attribut am <html>, EIN zweiwertiger Schalter', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  // R6: der Default emittiert keine CSS-Regel — die Darstellung ist die heutige.
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  await ansichtOeffnen(page);
  const schalter = vermerkeSchalter(page);
  await expect(schalter).toBeVisible();
  await expect(schalter).toHaveAttribute('aria-checked', 'true');
  // S1: der dreiwertige Streifen ist WEG — und zwar restlos, samt seiner
  // Gruppen-Beschriftung und seiner drei `data-hist-wahl`-Knöpfe. Ohne diese
  // Negativ-Sonde könnte die alte Bedienung beim nächsten Merge zurückkommen,
  // ohne dass etwas rot wird (Präzedenz: der Wächter gegen die Alt-Zeitraum-Wahl
  // in `leser-kopf-v2.e2e.ts`).
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toHaveCount(0);
  await expect(page.locator('[data-hist-wahl]')).toHaveCount(0);
});

test('«aus» blendet NUR Klasse A aus — Verweis (V) und Publikationsnachweis (Z) bleiben sichtbar', async ({ page }) => {
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

  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await expect(vermerkeSchalter(page)).toHaveAttribute('aria-checked', 'false');

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
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  await expect(a12).toBeVisible();
  await expect(a14).toBeVisible();

  // A9-Muster: klick-getriebener Reflow ist input-exkludiert ⇒ kein CLS-Beitrag.
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBe(0);
});

test('«aus» blendet auch die A-MARKER im Wortlaut aus, nicht nur den Apparat', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  const aMarker = page.locator('.lc-leser [data-fn-klasse="A"] button[aria-label^="Fussnote"]');
  const vMarker = page.locator('.lc-leser [data-fn-klasse="V"] button[aria-label^="Fussnote"]');
  const aAnzahl = await aMarker.count();
  const vAnzahl = await vMarker.count();
  expect(aAnzahl, 'BGBM trägt A-Marker im Wortlaut').toBeGreaterThan(0);
  expect(vAnzahl, 'BGBM trägt V-Marker im Wortlaut').toBeGreaterThan(0);

  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  // Alle A-Marker unsichtbar, alle V-Marker weiter sichtbar; Zahl im DOM unverändert.
  for (let i = 0; i < aAnzahl; i++) await expect(aMarker.nth(i)).toBeHidden();
  await expect(vMarker.first()).toBeVisible();
  expect(await aMarker.count()).toBe(aAnzahl);
  expect(await vMarker.count()).toBe(vAnzahl);
});

test('S1-ZUSAGE: «aus» lässt KEINE Historie-Spur im Lesekörper — und der DOM bleibt vollständig', async ({ page }) => {
  // Das ist die Zusage der Etappe S1 (Fahrplan Kap. 7). Drei Träger müssen
  // GEMEINSAM verschwinden; bis S1 verschwanden nur die ersten zwei:
  //   (1) die A-Marker im Wortlaut,
  //   (2) die Apparat-Zeilen der Klasse A (samt Rahmen, wo NUR A darin steht),
  //   (3) die «Fassung»-Zeile am Artikelfuss — sie hing an keinem Schalter (K4).
  // Und alle drei müssen im DOM BLEIBEN (A1-Mechanik, David 5.7.2026:
  // `display:none`, nie gelöscht), damit «an» sie vollständig wiederherstellt.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');

  const art2 = page.locator('#art-2');
  await art2.scrollIntoViewIfNeeded();
  const fassung = art2.locator('[data-historie-zeile]');
  const slot = art2.locator('[data-hist-slot]');
  // Sichtbarkeits-Zählung der A-Marker. `checkVisibility()` und NICHT
  // `offsetParent`/`display` am Element selbst: ausgeblendet wird der VORFAHR
  // (`[data-fn-klasse="A"]`), das Knopf-Element trägt weiter `display: inline`.
  // Und NICHT `contentVisibilityAuto`: die Artikel stehen unter
  // `content-visibility: auto` — würde man vom Scrollen übersprungene Teilbäume
  // als «unsichtbar» zählen, wäre die Zusicherung schon durch Scrollposition
  // erfüllt und damit wertlos (§6.7). Der Standard-Modus meldet genau das, was
  // hier gemeint ist: von einer CSS-Regel weggeschaltet.
  const aMarkerSichtbar = () => page
    .locator('.lc-leser [data-fn-klasse="A"] button[aria-label^="Fussnote"]')
    .evaluateAll((els) => els.filter((el) => (el as HTMLElement).checkVisibility()).length);
  // Der Badge wächst mit dem idle-Shard-Resolve ein — POSITIV-Vorbedingung: ohne
  // ihn prüfte die Negativ-Zusicherung unten nichts (§6.7).
  await expect(fassung).toBeVisible({ timeout: 15000 });
  await expect(fassung.getByText('Fassung', { exact: true })).toBeVisible();
  const badgeText = (await fassung.textContent())?.trim() ?? '';
  expect(badgeText, 'Fassungs-Zeile ohne Text — die Sonde unten wäre wertlos').toContain('Gilt seit');

  // Art. 9 trägt AUSSCHLIESSLICH A-Fussnoten: sein Apparat darf bei «aus» samt
  // Rahmen weg sein, sonst bliebe eine leere Trennlinie stehen.
  const apparat9 = page.locator('#art-9 [data-fn-apparat]');
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeVisible();
  // POSITIV-Vorbedingung auch für die Marker: es gibt überhaupt welche, und sie
  // sind sichtbar (sonst zählte die Null unten nichts, §6.7).
  expect(await aMarkerSichtbar(), 'BGBM zeigt A-Marker im Grundzustand').toBeGreaterThan(0);

  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  // (3) KEINE Fassungs-Spur mehr — weder die Zeile noch der reservierte Slot.
  // Der Slot MIT: seine reservierte Höhe (mt-4 + min-h-hist-zeile = 16+24 px)
  // bliebe sonst als Phantom-Lücke unter jedem Artikel stehen, und «aus» hätte
  // doch eine Spur hinterlassen.
  await expect(fassung).toBeHidden();
  await expect(slot).toBeHidden();
  // (2) Apparat samt Rahmen weg, wo er nur A trägt.
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeHidden();
  // (1) kein sichtbarer A-Marker im ganzen Lesekörper.
  expect(await aMarkerSichtbar(), 'A-Marker noch sichtbar').toBe(0);

  // DOM-VOLLSTÄNDIGKEIT (§8): alles ist noch da, mit unverändertem Text.
  // `textContent`, NICHT `innerText`: die Artikel stehen unter
  // `content-visibility: auto` (W2.8) — dort liefert `innerText` für nicht
  // gerenderte Teilbäume einen LEEREN String, und die Zusicherung wäre still
  // wahr. `textContent` ist layout-unabhängig.
  await expect(fassung).toHaveCount(1);
  expect((await fassung.textContent())?.trim() ?? '').toBe(badgeText);
  await expect(apparat9).toHaveCount(1);
  expect((await apparat9.textContent())?.trim() ?? '').toContain('Eingefügt durch');

  // Und der NORMTEXT des Artikels ist unberührt — sichtbar und findbar. Hier
  // ebenfalls `textContent` statt `innerText`: Art. 2 liegt weit unten, sein
  // Teilbaum ist vom `content-visibility: auto` übersprungen, und `innerText`
  // lieferte dafür einen LEEREN String (genau so beim ersten Lauf dieser Fassung
  // passiert — die Zeile wäre still falsch geworden). Die SICHTBARKEIT prüft die
  // Locator-Zusicherung, die eine Bounding-Box auswertet und vom Übersprungenen
  // nicht getäuscht wird.
  await art2.scrollIntoViewIfNeeded();
  await expect(art2).toBeVisible();
  expect(((await art2.textContent()) ?? '').length).toBeGreaterThan(20);

  // POSITIV zurück: «an» stellt alle drei vollständig wieder her.
  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeVisible();
  await expect(slot).toBeVisible();
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeVisible();
  expect(await aMarkerSichtbar(), 'A-Marker nach «an» nicht wiederhergestellt').toBeGreaterThan(0);
});

test('Persistenz + Pre-Paint: die Wahl übersteht den Reload ohne Flackern', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  // S1: der Wert steht unter dem NEUEN Schlüssel (das dreiwertige `hist` ist weg).
  expect(ls).toContain('"histansicht":"aus"');
  expect(ls, 'Alt-Schlüssel `hist` weiter geschrieben — die Migration griffe bei jedem Laden neu').not.toContain('"hist":');
  expect(ls, 'gestrichener Schalter `verweise` weiter geschrieben').not.toContain('"verweise"');

  await page.reload();
  // Pre-Paint (wendeLeserOptionenAn in main.tsx, CSP-konform aus dem Modul-Script):
  // das Attribut steht VOR dem ersten Paint — kein Flash der Änderungsvermerke.
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await expect(page.locator('#art-4')).toBeVisible();
  await expect(apparatZeile(page, '4', '12')).toBeHidden();
  await expect(apparatZeile(page, '4', '13')).toBeVisible();
});

test('S1-MIGRATION im Browser: ein gespeichertes «chronologie» steht als «an» da', async ({ page }) => {
  // Der Bestands-Speicher eines Nutzers von VOR S1 — genau der Fall, der sich
  // später nicht mehr nachstellen lässt. Die Regeln selbst liegen DOM-frei unter
  // `src/tests/leser-optionen-migration.test.ts`; hier zählt, dass der Pre-Paint-
  // Pfad (main.tsx → wendeLeserOptionenAn) sie wirklich anwendet und der Schalter
  // danach richtig steht. «chronologie» hiess «Vermerke sichtbar» ⇒ «an», nie
  // «aus» (§8: dem Nutzer nicht wegnehmen, was er ausdrücklich bestellt hat).
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        fussnoten: 'an', verweise: 'aus', leitfaelle: 'an', hist: 'chronologie',
      }));
    } catch { /* privater Modus */ }
  });
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  // Der gestrichene Schalter kann nichts mehr bewirken: kein Attribut am <html>.
  await expect(page.locator('html')).not.toHaveAttribute('data-verweise', /.*/);
  await ansichtOeffnen(page);
  await expect(vermerkeSchalter(page)).toHaveAttribute('aria-checked', 'true');
  // Und die Vermerke sind wirklich da (nicht bloss der Schalter richtig gestellt).
  await expect(apparatZeile(page, '4', '12')).toBeVisible();
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
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  await expect(a34).toBeHidden();
  await expect(u35).toBeVisible();
  await expect(g41).toBeVisible();
  // Und ihr Inhalt ist unverändert lesbar (nicht bloss ein leeres sichtbares Element).
  await expect(u35).toContainText('Beträge angepasst');
  await expect(g41).toContainText('Siehe auch die UeB');
});

test('Der Schalter bleibt bei «Fussnoten aus» stehen — weil er dort weiter wirkt', async ({ page }) => {
  // ── DEKLARIERTE UMKEHR (§6.3) ────────────────────────────────────────────
  // Bis S1 stand hier das Gegenteil: die Historie-Wahl wurde bei «Fussnoten aus»
  // ENTFERNT, weil sie nur den Fussnoten-Apparat betraf und dort wirkungslos war
  // (§13 F4, kein totes Steuerelement). Seit S1 hängt an demselben Schalter auch
  // die «Fassung»-Zeile, und die folgt `data-fussnoten` NICHT — sie kommt aus dem
  // Historie-Shard, nicht aus dem Apparat. Der Schalter ist bei «Fussnoten aus»
  // also nachweislich WIRKSAM, und ihn wegzunehmen wäre derselbe F4-Fehler,
  // nur spiegelbildlich: eine wirksame Bedienung, die man nicht erreichen kann.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  const art2 = page.locator('#art-2');
  await art2.scrollIntoViewIfNeeded();
  const fassung = art2.locator('[data-historie-zeile]');
  await expect(fassung).toBeVisible({ timeout: 15000 });

  await ansichtOeffnen(page);
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');

  // POSITIV — der Beweis der Wirksamkeit: bei «Fussnoten aus» steht die
  // Fassungs-Zeile weiter da (sie ist kein Fussnoten-Apparat) …
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeVisible();
  // … der Schalter ist erreichbar …
  await ansichtOeffnen(page);
  await expect(vermerkeSchalter(page)).toBeVisible();
  // … und er nimmt sie weg. Genau das konnte man vor S1 nicht.
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeHidden();
});

test('axe: das offene Panel mit dem zweiwertigen Schalter ist sauber', async ({ page }, testInfo) => {
  // Das Steuerelement lebt in einem Panel, das die a11y.e2e.ts-Stichprobe NICHT
  // öffnet (die scannt den Reader mit geschlossenem Menü) — ohne diesen Scan wäre
  // die axe-Zusage für diesen Schritt leer. Gescannt wird BEIDES: das offene
  // Panel und die Seite in der Stellung «aus» (dort verschwinden Elemente, und
  // ein verwaistes `aria-controls` oder ein leerer Rahmen fiele hier auf).
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
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await ansichtOeffnen(page);
  await expect(vermerkeSchalter(page)).toBeVisible();

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
