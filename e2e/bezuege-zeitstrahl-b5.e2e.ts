// @shard-gruppe: 6
import { test, expect, type Page } from '@playwright/test';

// W2·7-BEZUG/B5 — Zeitstrahl + Von-Bis-Datum im Dropdown «Rechtsprechung ▾».
//
// Was hier NICHT nochmal geprüft wird: die Bereichs-Arithmetik, die Q1-Regel und
// die Summen-Identität des Histogramms — das tun `bezug-zeit.test.ts` und
// `bezug-zeitstrahl.test.tsx` schneller und mit mehr Fällen. Hier steht nur, was
// allein der echte Browser zeigen kann:
//   · die ZIEH-GESTE trägt (Pointer-Capture, Index-Rechnung an echten Rects),
//   · die Datumsfelder wirken bis in die Auflistung unter dem Artikel,
//   · die Zähler bleiben dabei EHRLICH (Grundgesamtheit ohne Zeitfilter),
//   · die EINMALIGE Migration der Alt-Stufe greift beim ersten Laden,
//   · die Wahl überlebt einen Neuladen.
//
// §6.3-DEKLARATION (29.7.2026, W2·7-BEZUG/B7): die Zähler-Anker dieser Datei
// lauteten «8 von 16» und massen den ENTFERNTEN Auslieferungs-Deckel. Der Shard
// liefert jetzt alle 16 Leitentscheide; die Linie zeigt 5 davon auf einmal
// (David 29.7.2026). Die §8-ZUSAGE dieser Suite — «die Grundgesamtheit
// schrumpft nicht mit dem Filter mit» — ist NICHT entfallen, sie ist nur
// umgezogen: sichtbar steht jetzt die gefilterte Grundmenge («5 von 5 im
// Zeitraum»), die ungefilterte Zahl trägt der `title` des Gruppenkopfs. Genau
// dort wird sie unten weiterhin geprüft — der Sachverhalt bleibt gemessen, nicht
// bloss die Formulierung geändert.
//
// Träger ist wieder die StPO (wie B4). Verifiziert am ausgelieferten Shard
// `public/rechtsprechung/bezuege/STPO.json`, 29.7.2026 nach B7:
//   · Art. 5 trägt 16 Leitentscheide, alle ausgeliefert, chronologisch neu→alt:
//     2025-02-06 · 2025-02-05 · 2024-11-19 · 2024-09-04 · 2024-04-25 ·
//     2023-02-17 · 2023-02-01 · 2022-09-09 · 2022-09-05 · 2022-01-12 ·
//     2021-09-14 · 2021-04-27 · 2020-10-14 · 2020-07-06 · 2020-03-23 ·
//     2019-10-03 — kein Bandjahr-Platzhalter darunter.
//     Ab 2024 bleiben 5, im Jahr 2024 allein 3, ab 2025 genau 2.
//   · Der Strahl im Grundzustand (nur Leitentscheide) reicht 2019–2026.
const STPO = '/gesetze/bund/STPO';

async function warteReader(page: Page): Promise<void> {
  await page.goto(STPO);
  await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-5')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
}

async function menuOeffnen(page: Page): Promise<void> {
  await page.locator('[data-rechtsprechung-menu]').first().click();
  await expect(page.locator('[aria-label="Auswahl der Rechtsprechung"]').first()).toBeVisible();
}

/** Die Bezüge-Zeile, die zu Art. 5 gehört (nächste im Dokumentfluss). */
function zeileArt5(page: Page) {
  return page.locator('#art-5').locator('xpath=ancestor-or-self::*[.//*[@data-bezuege-zeile]][1]')
    .locator('[data-bezuege-zeile]').first();
}

/** Warten, bis der Strahl aus dem geladenen Shard steht (nicht der Leer-Hinweis). */
async function warteStrahl(page: Page): Promise<void> {
  await expect(page.locator('[data-zeitstrahl]')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('[data-zeitstrahl-jahr]').first()).toBeVisible({ timeout: 20000 });
}

test.describe('B5 · Zeitstrahl und Von-Bis-Datum', () => {
  test('Grundzustand: Strahl da, Zeitraum offen, Auflistung ungeschnitten', async ({ page }) => {
    await warteReader(page);
    await expect(zeileArt5(page)).toContainText('5 von 16', { timeout: 20000 });
    await menuOeffnen(page);
    await warteStrahl(page);
    // Die Balken decken die belegten Jahre lückenlos ab — 2019 bis 2026.
    await expect(page.locator('[data-zeitstrahl-jahr="2019"]')).toHaveCount(1);
    await expect(page.locator('[data-zeitstrahl-jahr="2026"]')).toHaveCount(1);
    // Offener Bereich ⇒ kein Rücksetz-Knopf, kein Punkt am Auslöser.
    await expect(page.getByTitle('Zeitraum aufheben — wieder alle Entscheide zeigen')).toHaveCount(0);
    // Beide Felder stehen leer und sind bedienbar (WCAG 2.1.1).
    await expect(page.locator('[data-zeit-feld="von"]')).toHaveValue('');
    await expect(page.locator('[data-zeit-feld="bis"]')).toHaveValue('');
  });

  test('Datumsfeld «von» schneidet die Auflistung — der Zähler bleibt ehrlich (§8)', async ({ page }) => {
    await warteReader(page);
    await expect(zeileArt5(page)).toContainText('5 von 16', { timeout: 20000 });
    await menuOeffnen(page);
    await warteStrahl(page);
    await page.locator('[data-zeit-feld="von"]').fill('2024-01-01');
    // 5 der 16 Leitentscheide zu Art. 5 sind von 2024 oder jünger.
    await expect(zeileArt5(page)).toContainText('5 von 5 im Zeitraum', { timeout: 20000 });
    // ENTSCHEIDEND (§8): die Grundgesamtheit OHNE Filter bleibt 16 — sie
    // schrumpft NICHT mit, sonst behauptete sie weniger Praxis, als es gibt.
    // Sie steht seit B7 im `title` des Gruppenkopfs, damit die sichtbare Zeile
    // bei zwei Zahlen bleibt; geprüft wird sie deshalb dort.
    await expect(zeileArt5(page).locator('[data-bezug-gruppe="bge"] > span').first())
      .toHaveAttribute('title', /16 insgesamt an diesem Artikel/);
  });

  test('beide Felder zusammen grenzen auf ein Jahr ein', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    await page.locator('[data-zeit-feld="von"]').fill('2024-01-01');
    await page.locator('[data-zeit-feld="bis"]').fill('2024-12-31');
    await expect(zeileArt5(page)).toContainText('3 von 3 im Zeitraum', { timeout: 20000 });
  });

  test('verdrehte Eingabe wird getauscht, nicht als leere Menge gedeutet', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    // «von» NACH «bis» — der häufigste Tippfehler. Erwartetes Ergebnis ist
    // dasselbe Jahresfenster wie oben, nicht eine leere Auflistung.
    await page.locator('[data-zeit-feld="bis"]').fill('2024-01-01');
    await page.locator('[data-zeit-feld="von"]').fill('2024-12-31');
    await expect(zeileArt5(page)).toContainText('3 von 3 im Zeitraum', { timeout: 20000 });
  });

  test('Zieh-Auswahl über den Strahl setzt den Bereich', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    const von = page.locator('[data-zeitstrahl-jahr="2025"]');
    const bis = page.locator('[data-zeitstrahl-jahr="2026"]');
    const a = await von.boundingBox();
    const b = await bis.boundingBox();
    if (!a || !b) throw new Error('Zeitstrahl-Balken ohne Geometrie');
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 5 });
    await page.mouse.up();
    // 2025–2026: zwei Leitentscheide zu Art. 5 (05.02. und 06.02.2025).
    await expect(zeileArt5(page)).toContainText('2 von 2 im Zeitraum', { timeout: 20000 });
    // Der aktive Bereich wird BENANNT — ein Filter, der still wirkt, ist der
    // §8-Verstoss, den das Signal verhindert.
    await expect(page.getByTitle('Zeitraum aufheben — wieder alle Entscheide zeigen'))
      .toContainText('01.01.2025 – 31.12.2026');
  });

  test('ein Zug über den GANZEN Strahl heisst «alle», nicht «die heutigen Ränder»', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    const balken = page.locator('[data-zeitstrahl-jahr]');
    const erster = await balken.first().boundingBox();
    const letzter = await balken.last().boundingBox();
    if (!erster || !letzter) throw new Error('Zeitstrahl-Balken ohne Geometrie');
    await page.mouse.move(erster.x + 1, erster.y + erster.height / 2);
    await page.mouse.down();
    await page.mouse.move(letzter.x + letzter.width - 1, letzter.y + letzter.height / 2, { steps: 8 });
    await page.mouse.up();
    // Offener Bereich ⇒ kein Rücksetz-Knopf, volle Auflistung.
    await expect(page.getByTitle('Zeitraum aufheben — wieder alle Entscheide zeigen')).toHaveCount(0);
    await expect(zeileArt5(page)).toContainText('5 von 16', { timeout: 20000 });
  });

  test('Zurücksetzen hebt den Zeitraum auf', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    await page.locator('[data-zeit-feld="von"]').fill('2025-01-01');
    await expect(zeileArt5(page)).toContainText('2 von 2 im Zeitraum', { timeout: 20000 });
    await page.getByTitle('Zeitraum aufheben — wieder alle Entscheide zeigen').click();
    await expect(zeileArt5(page)).toContainText('5 von 16', { timeout: 20000 });
    await expect(page.locator('[data-zeit-feld="von"]')).toHaveValue('');
  });

  test('der Zeitraum überlebt einen Neuladen und meldet sich am Auslöser', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    await page.locator('[data-zeit-feld="von"]').fill('2024-01-01');
    await expect(zeileArt5(page)).toContainText('5 von 5 im Zeitraum', { timeout: 20000 });

    await page.reload();
    await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
    await expect(zeileArt5(page)).toContainText('5 von 5 im Zeitraum', { timeout: 20000 });
    // §8: der Auslöser trägt den Punkt, sonst wirkte ein Filter unsichtbar —
    // die Auflistung wäre bloss kürzer, ohne dass irgendwo etwas anders aussähe.
    await expect(page.locator('[data-rechtsprechung-menu] .lc-punkt-entscheid')).toHaveCount(1);
    await menuOeffnen(page);
    await expect(page.locator('[data-zeit-feld="von"]')).toHaveValue('2024-01-01');
  });

  test('MIGRATION: eine gespeicherte Alt-Stufe «5 J.» wird EINMALIG zum Von-Datum', async ({ page }) => {
    // Speicher-Stand einer Sitzung VOR B5 herstellen: die Stufen-Wahl «5», noch
    // ohne Bereichs-Felder. Bewusst KEIN `addInitScript` — das liefe bei JEDEM
    // Navigieren erneut und schriebe den Alt-Stand nach dem Reload zurück; der
    // Test prüfte dann nicht die Einmaligkeit, sondern seine eigene Saat (beim
    // ersten Lauf genau so reproduziert). Also einmal setzen, dann neu laden.
    await warteReader(page);
    await page.evaluate(() => {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        fussnoten: 'an', verweise: 'an', leitfaelle: 'an',
        zeitraum: '5', hist: 'fussnoten',
      }));
    });
    await page.reload();
    await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });

    const stand = await page.evaluate(() => JSON.parse(localStorage.getItem('lm.leser.optionen') ?? '{}'));
    expect(stand.zeitraum).toBeUndefined();          // Alt-Feld abgeräumt
    expect(stand.bezugBis).toBe('');                 // «bis» bleibt offen
    const erwartet = await page.evaluate(() => {
      const h = new Date();
      const j = h.getUTCFullYear() - 5;
      const rest = h.toISOString().slice(4, 10);
      const schalt = (j % 4 === 0 && j % 100 !== 0) || j % 400 === 0;
      return `${j}${rest === '-02-29' && !schalt ? '-02-28' : rest}`;
    });
    expect(stand.bezugVon).toBe(erwartet);

    // Und die Migration ist EINMALIG: ein zweiter Laden-Vorgang darf den Wert
    // nicht neu berechnen. Wir setzen ihn absichtlich auf ein anderes Datum und
    // prüfen, dass er stehen bleibt.
    await page.evaluate(() => {
      const o = JSON.parse(localStorage.getItem('lm.leser.optionen') ?? '{}');
      o.bezugVon = '2024-01-01';
      localStorage.setItem('lm.leser.optionen', JSON.stringify(o));
    });
    await page.reload();
    await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
    await menuOeffnen(page);
    await expect(page.locator('[data-zeit-feld="von"]')).toHaveValue('2024-01-01');
  });

  test('MIGRATION: «alle» bleibt offen — keine erfundene Einschränkung', async ({ page }) => {
    await warteReader(page);
    await page.evaluate(() => {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        fussnoten: 'an', verweise: 'an', leitfaelle: 'an',
        zeitraum: 'alle', hist: 'fussnoten',
      }));
    });
    await page.reload();
    await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
    await expect(zeileArt5(page)).toContainText('5 von 16', { timeout: 20000 });
    await menuOeffnen(page);
    await expect(page.locator('[data-zeit-feld="von"]')).toHaveValue('');
    await expect(page.getByTitle('Zeitraum aufheben — wieder alle Entscheide zeigen')).toHaveCount(0);
  });

  // ── Bestandsfehler aus B4, in diesem PR mitbehoben ────────────────────────
  // Wer «Entscheide» VOR B4 abgeschaltet hatte, behielt `leitfaelle:'aus'` im
  // Speicher. Die CSS-Regel `html[data-leitfaelle="aus"] … [data-leitfall-zeile]`
  // blendet die Auflistung weiterhin aus, der zugehörige Schalter ist mit B4
  // entfallen, und KEINE Stelle rief seither `setzeOption('leitfaelle', …)` —
  // es gab also keinen Weg zurück, und der Hinweistext nannte obendrein ein
  // Steuerelement, das es nicht mehr gibt (§8/§13 F4).
  test('B4-Sackgasse: «Entscheide aus» nennt keinen toten Schalter und hat einen Ausweg', async ({ page }) => {
    await warteReader(page);
    await page.evaluate(() => {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        fussnoten: 'an', verweise: 'an', leitfaelle: 'aus', hist: 'fussnoten',
      }));
    });
    await page.reload();
    await expect(page.locator('[data-rechtsprechung-menu]').first()).toBeVisible({ timeout: 20000 });
    // Ausgangslage reproduziert: unter den Artikeln steht nichts.
    await expect(page.locator('[data-bezuege-zeile]')).toHaveCount(0);

    await menuOeffnen(page);
    const panel = page.locator('[aria-label="Auswahl der Rechtsprechung"]').first();
    // Der tote Verweis ist weg …
    await expect(panel).not.toContainText('Ansicht ▾ › Entscheide');
    // … und es gibt einen benannten Ausweg.
    await panel.locator('[data-entscheide-zurueck]').click();

    // Danach ist die Facetten-Wahl wieder wirksam: eine Instanz einschalten
    // bringt die Auflistung zurück (vorher blieb sie CSS-seitig unsichtbar).
    await page.locator('[data-bezug-klasse="bge"]').click();
    await expect(zeileArt5(page)).toContainText('5 von 16', { timeout: 20000 });
  });

  test('alle Instanzen aus ⇒ kein Zeitstrahl (kein Steuerelement ohne Wirkung, §13 F4)', async ({ page }) => {
    await warteReader(page);
    await menuOeffnen(page);
    await warteStrahl(page);
    await page.locator('[data-bezug-klasse="bge"]').click();
    await expect(page.locator('[data-zeitstrahl]')).toHaveCount(0);
    await expect(page.locator('[data-zeit-feld="von"]')).toHaveCount(0);
  });
});
