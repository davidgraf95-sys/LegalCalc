import { test, expect, type Page } from '@playwright/test';

// W2·7-BEZUG/B4 — Facetten-Filter der Bezüge im Gesetz-Leser.
//
// Was hier NICHT nochmal geprüft wird: Auswahl-Logik, Ordnung und die ehrlichen
// Zahlen — das tun die node-Suiten `bezug-auswahl.test.ts` und
// `bezuege-zeile-b4.test.tsx` schneller und genauer. Hier steht nur, was allein
// der echte Browser zeigen kann: dass die Bedienung im ZUSAMMENSPIEL trägt —
// Dropdown → Store → Nachladen des Shards → Darstellung am Artikel — und dass
// der Grundzustand dabei unangetastet bleibt.
//
// Träger ist die StPO, weil sie den grössten Klassen-Mix hat (verifiziert am
// ausgelieferten Shard, 29.7.2026 nach B7): Art. 5 trägt 16 Leitentscheide,
// 2 übrige Bundesgerichtsurteile und 115 kantonale Entscheide — alle
// ausgeliefert, der Deckel «8 je Status» ist mit B7 aufgehoben.
//
// §6.3-DEKLARATION (29.7.2026, W2·7-BEZUG/B7): die Zähler-Anker dieser Datei
// lauteten «8 von 16» und «8 von 115» und massen damit den ENTFERNTEN
// Auslieferungs-Deckel. Sie lauten jetzt «5 von 16» / «5 von 115» — die 5 ist
// keine neue Grenze, sondern die Anzeige-Portion der Linie (David 29.7.2026:
// «es soll einfach 5 entscheide pro linie sein und mit klick lädt es die
// nächsten 5»), die ein Klick beliebig weit öffnet. Der GEPRÜFTE SACHVERHALT
// ist unverändert: die Zahl nennt Gezeigtes UND die Grundmenge (§8).
const STPO = '/gesetze/bund/STPO';

async function warteReader(page: Page): Promise<void> {
  await page.goto(STPO);
  await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-5')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
}

async function menuOeffnen(page: Page): Promise<void> {
  // Eindeutig über das data-Attribut: die linke Sidebar führt eine EIGENE Rubrik
  // «Rechtsprechung», ein Rollen-/Namens-Selektor traf sie statt des Chips.
  await page.locator('[data-rechtsprechung-menu]').first().click();
  await expect(page.locator('[aria-label="Auswahl der Rechtsprechung"]').first()).toBeVisible();
}

/** Die Bezüge-Zeile, die zu Art. 5 gehört (nächste im Dokumentfluss). */
function zeileArt5(page: Page) {
  return page.locator('#art-5').locator('xpath=ancestor-or-self::*[.//*[@data-bezuege-zeile]][1]')
    .locator('[data-bezuege-zeile]').first();
}

test.describe('B4 · Facetten-Filter der Bezüge', () => {
  test('Grundzustand: die Leitentscheid-Auflistung steht direkt unter dem Artikel', async ({ page }) => {
    await warteReader(page);
    const zeile = zeileArt5(page);
    await expect(zeile).toBeVisible({ timeout: 20000 });
    await expect(zeile.locator('[data-bezug-gruppe="bge"]')).toBeVisible();
    await expect(zeile).toContainText('5 von 16');
    // Kein Zwischenzustand: keine Aufklapp-Zeile, keine «Bezüge»-Overline.
    await expect(zeile.locator('[data-bezuege-schalter]')).toHaveCount(0);
    // Nur Leitentscheide — kantonale Praxis ist nicht vorausgewählt.
    await expect(zeile.locator('[data-bezug-gruppe="kantonal"]')).toHaveCount(0);
    await menuOeffnen(page);
    await expect(page.locator('[data-bezug-klasse="bge"]')).toHaveAttribute('aria-pressed', 'true');
    for (const k of ['bger', 'eidg', 'kantonal']) {
      await expect(page.locator(`[data-bezug-klasse="${k}"]`)).toHaveAttribute('aria-pressed', 'false');
    }
  });

  test('Kantonal zuschalten: Shard lädt nach, Zeile erscheint mit ehrlicher Grundgesamtheit', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await page.locator('[data-bezug-klasse="kantonal"]').click();
    const zeile = zeileArt5(page);
    await expect(zeile).toBeVisible({ timeout: 20000 });
    // §8: die Zahl nennt Gezeigtes UND Erfasstes — «5» allein wäre die
    // Vollständigkeits-Behauptung, die §8 verbietet.
    await expect(zeile.locator('[data-bezug-gruppe="kantonal"]')).toContainText('5 von 115');
    await expect(zeile.locator('[data-bezug-gruppe="bge"]')).toContainText('5 von 16');
    // B7: der Rest ist erreichbar, nicht versteckt — ein Klick lädt die
    // nächsten fünf, und der Zähler zählt sichtbar mit.
    await zeile.locator('[data-bezug-weitere="kantonal"]').click();
    await expect(zeile.locator('[data-bezug-gruppe="kantonal"]')).toContainText('10 von 115');
  });

  test('Rang bleibt getrennt: der ★ hängt nur an den Leitentscheiden', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await page.locator('[data-bezug-klasse="kantonal"]').click();
    const zeile = zeileArt5(page);
    await expect(zeile.locator('[data-bezug-gruppe="kantonal"]')).toBeVisible({ timeout: 20000 });
    await expect(zeile.locator('[data-bezug-gruppe="bge"]')).toContainText('★');
    await expect(zeile.locator('[data-bezug-gruppe="kantonal"]')).not.toContainText('★');
  });

  test('alle Facetten aus ⇒ NICHTS unter dem Artikel — und nicht plötzlich alles', async ({ page }) => {
    await warteReader(page);
    await expect(zeileArt5(page)).toBeVisible({ timeout: 20000 });
    await menuOeffnen(page);
    await page.locator('[data-bezug-klasse="bge"]').click();
    // Null Pixel Verzahnungs-UI im Lesetext-Bereich (Vorgabe David 28.7.2026).
    await expect(page.locator('[data-bezuege-zeile]')).toHaveCount(0, { timeout: 20000 });
  });

  test('die Wahl überlebt einen Neuladen (Persistenz im Leser-Options-Store)', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await page.locator('[data-bezug-klasse="kantonal"]').click();
    await expect(zeileArt5(page)).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
    await expect(zeileArt5(page)).toBeVisible({ timeout: 20000 });
    await menuOeffnen(page);
    await expect(page.locator('[data-bezug-klasse="kantonal"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('Kanton-Schnitt löscht die Bundes-Kanten nicht', async ({ page }) => {
    // Der teure Denkfehler: BGer-Entscheide tragen kanton='CH' und fielen aus
    // einer naiven Kantons-Auswahl heraus — «nur BS» hätte die
    // bundesgerichtliche Praxis gelöscht (§1).
    await warteReader(page);
    await menuOeffnen(page);
    await page.locator('[data-bezug-klasse="kantonal"]').click();
    await expect(zeileArt5(page)).toBeVisible({ timeout: 20000 });
    await page.locator('[data-bezug-kanton="BS"]').click();
    const zeile = zeileArt5(page);
    await expect(zeile).toContainText('Leitentscheide');
    await expect(zeile).toContainText('Kantonal');
  });
});
