// @shard-gruppe: 4
import { test, expect, type Page } from '@playwright/test';

// W2·5d G2b — Kopf-Zusammenführung + «Zitat kopieren» (A27: Sticky Section-
// Kontextkopf entfernt — Orientierung im Inhalts-Kopf, Zitat je Artikel).
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten
// (die Options-Leiste existiert NUR im React-DOM), bevor geprüft wird. BV ist ein
// kleiner, ABER geschachtelter Erlass (2-Spalten-Lesemodus) — CI-fest.
//
// ── H4-UMHÄNGUNG (Flip 18.8.2026, Kontaktbogen H4 §7) ───────────────────────
// Drei Nachführungen, alle gemessen, keine davon eine Lockerung (§6.3):
//
// (1) `.lc-leser > header` → `.lc-leser header`. Beide Hüllen rendern DENSELBEN
//     `<header>` (`parts/ErlassLeserKopf.tsx`, §5); V3 hängt ihn nur eine Zone
//     tiefer (`v3/LeserErlassKopfZone`). Gemessen 18.8.2026 an BV @1440:
//     direktes Kind 0 (V3) / 1 (V1), Nachfahre 1 in BEIDEN.
// (2) Die «immer sichtbare Positionsleiste» heisst in V3 anders: die Krume
//     trägt dort `aria-label="Ort im Gesetz"` statt `"Brotkrümel"` (gemessen:
//     V1 → Brotkrümel, V3 → Ort im Gesetz). Der Selektor nennt beide Namen; die
//     AUSSAGE — der Ansicht-Öffner steht in der klebenden Ortsleiste und NICHT
//     im wegscrollenden Erlass-Kopf (A26) — bleibt Wort für Wort dieselbe.
// (3) `aria-controls` setzt V3 bewusst nur im GEÖFFNETEN Zustand
//     (`v3/LeserAnsichtV3.tsx`: «kein Sprung, der ins Leere führt», §8). Die
//     Prüfung wandert deshalb hinter das Öffnen — und wird dort STRENGER: statt
//     «irgendein nichtleerer Wert» verlangt sie jetzt, dass die Kennung auf das
//     wirklich vorhandene Optionen-Panel zeigt. Ob das Attribut im
//     GESCHLOSSENEN Zustand steht, bleibt bewusst ungeprüft — genau darin
//     unterscheiden sich die Hüllen, und beide Wege sind vertretbar.
//
// Damit ist die Datei wieder paritätsfähig und steht seit H4 in `N_SPECS`.
const KOPF = '.lc-leser header';
/** Die klebende Ortsleiste, in beiden Hüllen (A26). */
const ORTSLEISTE = 'nav[aria-label="Brotkrümel"], nav[aria-label="Ort im Gesetz"]';

async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-1').first()).toBeVisible({ timeout: 20000 });
}

test('Kopf-Zusammenführung + A26: EIN <header> (Overline/Titel), «Ansicht»-Dropdown in der immer sichtbaren Positionsleiste', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  // Genau EIN Leser-Kopf (kein duplizierter Block): der <header> mit der Overline.
  const header = page.locator(KOPF);
  await expect(header).toHaveCount(1);
  await expect(header.getByText('Bundesverfassung', { exact: false }).first()).toBeTruthy();
  // A26 (David 11.7.2026): das «Ansicht»-Dropdown ist AUS dem weggescrollenden
  // Erlass-Kopf in die IMMER sichtbare Positions-/Kontextleiste (Inhalts-Kopf mit
  // Brotkrümel) gewandert — damit die Darstellungsoptionen jederzeit erreichbar
  // sind, während man im Gesetz ist. Im Kopf steht es daher nicht mehr.
  await expect(header.getByRole('button', { name: 'Ansicht' })).toHaveCount(0);
  const leiste = page.locator('div.sticky', { has: page.locator(ORTSLEISTE) });
  const ansicht = leiste.getByRole('button', { name: 'Ansicht' });
  await expect(ansicht).toBeVisible();
  await expect(ansicht).toHaveAttribute('aria-expanded', 'false');
  await ansicht.click();
  await expect(ansicht).toHaveAttribute('aria-expanded', 'true');
  await expect(leiste.locator('[aria-label="Darstellungsoptionen"]')).toBeVisible();
});

// U-KOPF/A4 a11y: das «Ansicht»-Dropdown ist eine ehrliche Disclosure (kein
// role=menu) mit Fokus-Falle, Escape-Schliessen und Fokus-Rückgabe an den
// Auslöser (useDialogFokus). Der Trigger trägt aria-expanded + aria-controls.
test('A4 «Ansicht»-Dropdown: Öffnen fokussiert den Inhalt, Escape schliesst + gibt Fokus zurück', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  const trigger = page.getByRole('button', { name: 'Ansicht' }).first();
  await trigger.click();
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible();
  // `aria-controls` im GEÖFFNETEN Zustand — und die Kennung zeigt auf das
  // Panel, das wirklich da ist (H4: V3 setzt das Attribut bewusst nur, solange
  // es ein Ziel gibt; ein Sprung ins Leere wäre §8-widrig). Vorher stand die
  // Prüfung vor dem Klick und verlangte nur «irgendein nichtleerer Wert».
  const ziel = await trigger.getAttribute('aria-controls');
  expect(ziel, 'Auslöser nennt das Panel, das er aufzieht').toBeTruthy();
  await expect(page.locator(`#${ziel}`)).toHaveAttribute('aria-label', 'Darstellungsoptionen');
  // Fokus ist beim Öffnen in das Panel gewandert (erstes fokussierbares Element).
  const fokusImPanel = await page.evaluate(() => {
    const g = document.querySelector('[aria-label="Darstellungsoptionen"]');
    return g != null && g.contains(document.activeElement);
  });
  expect(fokusImPanel).toBe(true);
  // Escape schliesst und gibt den Fokus an den Auslöser zurück.
  await page.keyboard.press('Escape');
  await expect(gruppe).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(await trigger.evaluate((el) => el === document.activeElement)).toBe(true);
});

// A27 (David 12.7.2026): die Tests des Sticky Section-Kontextkopfs (Standort-
// Anzeige, klickbare A3-Breadcrumbs, @1024-Overflow-Schutz) sind entfernt — die
// Komponente wurde gestrichen. Die Orientierung trägt seit A26 der immer
// sichtbare Inhalts-Kopf (siehe Test oben: nav[aria-label="Brotkrümel"]); die
// «Zitat kopieren»-Aktion lebt je Artikel im ArtikelLeser (unten geprüft).

// P1-d — Currency-Aussagen im Leser-Kopf (Moat-Hebel 3). Sie stehen schon im
// prerenderten Kopf (CLS=0) UND im React-Kopf (geteilte Komponente ErlassLeserKopf,
// beide Leser-Instanzen). BV ist aktuell + hat eine künftige Fassung → beide
// Angaben; BKV ist aktuell ohne künftige Fassung → nur der Standausweis.
//
// NEU GEFASST W2·5m-LESER-V3/S3 (Entscheid F5, David 16.8.2026): der Standausweis
// heisst nicht mehr «geltend geprüft am …», sondern «gegen Fedlex-Konsolidierung
// geprüft am … (maschinell)», und er steht nicht mehr in einem Chip, sondern in
// der Stand-Zeile. Deklarierte FACHLICHE Änderung, kein Refactoring (§6.3): die
// Erwartung wird angepasst, nicht der Code gebogen. Die §8-Zusagen bleiben WÖRTLICH
// stehen — «(maschinell)» tragend, kein «gültig»/«verifiziert» — und werden zur
// Sicherheit zusätzlich um den ALTEN Wortlaut ergänzt, damit ein Rückfall auffällt.
test('Standausweis F5 + «nächste Fassung ab …» (BV)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  const header = page.locator(KOPF);
  await expect(header.getByText(/gegen Fedlex-Konsolidierung geprüft am \d{2}\.\d{2}\.\d{4} \(maschinell\)/)).toBeVisible();
  await expect(header.getByText(/nächste Fassung ab \d{2}\.\d{2}\.\d{4}/)).toBeVisible();
  // §8: kein «gültig»/«verifiziert» als eigenes Wort ausserhalb der zugelassenen Formel.
  await expect(header.getByText(/\bgültig\b/)).toHaveCount(0);
  await expect(header.getByText(/\bverifiziert\b/)).toHaveCount(0);
  // F5: der alte, irreführende Wortlaut darf nicht zurückkommen.
  await expect(header.getByText(/geltend geprüft am/)).toHaveCount(0);
});

test('Standausweis ohne künftige Fassung (BKV)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BKV');
  const header = page.locator(KOPF);
  await expect(header.getByText(/gegen Fedlex-Konsolidierung geprüft am \d{2}\.\d{2}\.\d{4} \(maschinell\)/)).toBeVisible();
  await expect(header.getByText(/nächste Fassung ab/)).toHaveCount(0);
});

test('Stand-Zeile bricht mobil @390 um — kein horizontaler Seiten-Overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await warteReader(page, '/gesetze/bund/BV');
  await expect(page.locator(KOPF).getByText(/Fedlex-Konsolidierung geprüft am/)).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

// S3 · F5-Warnzeile im KLARTEXT — der Kern des Positions-11-Befunds. STPO trägt
// eine in Kraft getretene, nicht konsolidierte Änderung; der Satz muss VOR dem
// Lesen sichtbar sein (nicht bloss im `title`) und ein Datum nennen.
test('S3/F5: nicht konsolidierte Änderung steht im Klartext im Kopf (STPO)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/STPO');
  const header = page.locator(KOPF);
  await expect(
    header.getByText(/Fedlex hat eine seit \d{2}\.\d{2}\.\d{4} geltende Änderung noch nicht in den Text eingearbeitet/),
  ).toBeVisible();
  await expect(header.getByText(/massgeblich ist die amtliche Fassung/)).toBeVisible();
});

// Gegenprobe zum §7-Stichtagsfilter, im echten Browser. BV ist der scharfe Fall:
// es TRÄGT den `nichtKonsolidiert`-Marker, aber für eine Änderung, die erst
// 2029 in Kraft tritt. Es darf darum KEINE Warnung zeigen — «Fedlex hat eine
// seit 01.01.2029 geltende Änderung noch nicht eingearbeitet» wäre eine falsche
// Tatsachenbehauptung (§1/§8). Angekündigtes trägt stattdessen sein eigenes,
// korrektes Wortfeld «nächste Fassung ab …», das der BV-Test oben prüft.
//
// (Zuerst stand hier OR. Das war ein Fehlgriff: OR ist mit 2038 Artikeln der
// schwerste Snapshot im Bestand, der Lade-Helfer lief unter Parallellast in
// 2 von 5 Läufen in den Timeout. Kein Timeout hochgesetzt, sondern der Fall
// gewechselt — BV ist leichter, in dieser Spec ohnehin schon geladen UND
// beweist mehr als OR es konnte, §17.)
test('S3/§7: künftig in Kraft tretende Änderung erzeugt KEINE Warnung (BV)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BV');
  const header = page.locator(KOPF);
  await expect(header.getByText(/noch nicht in den Text eingearbeitet/)).toHaveCount(0);
  await expect(header.getByText(/Snapshot — massgeblich ist die amtliche Fassung/)).toBeVisible();
});

test('«Zitat kopieren»: deterministisches Zitat (Kürzel + SR + Stand) in die Zwischenablage', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV#art-8');
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  // A27: die «Zitat kopieren»-Aktion steht je Artikel in der Artikelnummer-Zeile
  // (ArtikelLeser) — identisches baueZitat-Voll-Zitat wie zuvor im Kontextkopf.
  await page.locator('#art-8').getByRole('button', { name: /Zitat kopieren:/ }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  // Deterministisches Format: «… BV, SR 101 (Stand dd.mm.yyyy)».
  expect(clip).toContain('BV');
  expect(clip).toContain('SR 101');
  expect(clip).toMatch(/\(Stand \d{2}\.\d{2}\.\d{4}\)/);
});
