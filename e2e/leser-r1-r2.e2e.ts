// W2·10-UI-NAV/R1 + R2 — «Finden im Gesetz» (Fahrplan UI-NAVIGATION §4).
//
//  · R1 · In-Gesetz-Suche: zur bestehenden A35-Hervorhebung kommen die
//    TREFFERZAHL (Artikel + gemessene Fundstellen, auch je Artikel) und
//    VOR/ZURÜCK-SPRUNGTASTEN zwischen den Fundstellen. Auflage des Fahrplans:
//    nur Client-Render-Layer — das gerenderte Normtext-DOM bleibt OHNE aktive
//    Suche unverändert (hier bewiesen: die Artikel-Signatur vor der Suche ist
//    nach dem Leeren byte-gleich, und Zähler/Tasten existieren nur im Suchmodus).
//  · R2 · Mobile Gliederung: volles BOTTOM-Sheet in der Daumenzone statt des
//    früheren oben angeschlagenen 60-vh-Drawers, mit «Sie sind hier» (aus dem
//    bestehenden Scroll-Spy-Zustand) und dem Quickjump «Art. N» (deterministisch
//    gegen die geladenen art-IDs, kein Index).
//  · A9-DoD: Bedienbarkeit (Tastatur/Touch/aria, 44-px-Tap-Ziele) und Flüssigkeit
//    unter CPU-Drossel 6× — Such-/Sheet-/Sprung-Interaktionen ohne Layout-Shift
//    (CLS 0, input-freie Shifts gemessen).
//
// Läuft gegen `vite preview` (dist). Zeitbudget wie die A35-Suite: der OR-Reader
// kettet mehrere 15–20-s-Latches, auf dem 2-vCPU-Runner unter Drossel mehr.
import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

const inGesetzSuche = (page: Page) => page.getByRole('searchbox', { name: 'Im Gesetz suchen' });
const leiste = (page: Page) => page.locator('[data-treffer-leiste]');
const sheet = (page: Page) => page.locator('[data-gliederung-sheet]');

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`); });
  return fehler;
}

// CLS-Beobachter, GESCOPT auf die R1/R2-Flächen (Reader-Wurzel `.lc-leser`,
// Gliederungs-Sheet, Treffer-Leiste). Grund (§0/3 «Verteilung statt Einzelwert»,
// Nullprobe 4.8.2026): auf /gesetze/bund/BV @390 unter 6× Drossel fällt schon
// OHNE JEDE Interaktion ein input-freier Shift von 0.0015679722447315269 an —
// Quelle `DIV.shrink-0 flex items-center gap-1.5 sm:gap-2`, das ist der rechte
// Bedien-Cluster der TOPBAR (src/components/layout/Topbar.tsx), nicht der Reader.
// Der Wert ist zwischen Nullprobe und Interaktionslauf BYTE-IDENTISCH ⇒ er liegt
// auf dem Ladepfad und nicht an R1/R2. Dieser Test misst darum, was er im Titel
// behauptet: die R1/R2-Flächen. Fremde Shifts werden mitprotokolliert (und im
// Fehlerfall ausgegeben), aber nicht dieser Bau-Einheit zugerechnet.
async function clsBeobachten(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __cls: number; __clsQuellen: string[]; __clsFremd: number; __clsFremdQ: string[] };
    w.__cls = 0; w.__clsQuellen = []; w.__clsFremd = 0; w.__clsFremdQ = [];
    const eigen = (n: Element | null | undefined) =>
      !!n?.closest('.lc-leser, [data-gliederung-sheet], [data-treffer-leiste]');
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const s = e as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Element | null }[] };
        if (s.hadRecentInput) continue;
        const quellen = s.sources ?? [];
        const namen = quellen.map((q) => q.node
          ? `${q.node.tagName}${q.node.id ? `#${q.node.id}` : ''}.${String(q.node.className).slice(0, 60)}`
          : '(ohne Knoten)');
        // Ohne Attribution konservativ als EIGEN werten (nie stillschweigend fallen lassen).
        if (quellen.length === 0 || quellen.some((q) => eigen(q.node))) {
          w.__cls += s.value; w.__clsQuellen.push(...namen);
        } else {
          w.__clsFremd += s.value; w.__clsFremdQ.push(...namen);
        }
      }
    }).observe({ type: 'layout-shift' });
  });
}
const clsLesen = (page: Page) => page.evaluate(() => {
  const w = window as unknown as { __cls: number; __clsQuellen: string[]; __clsFremd: number; __clsFremdQ: string[] };
  return { cls: w.__cls, quellen: w.__clsQuellen, fremd: w.__clsFremd, fremdQ: w.__clsFremdQ };
});

test.describe('R1 — In-Gesetz-Suche: Trefferzahl + Fundstellen-Navigation', () => {
  test('Trefferliste nennt Artikel UND gemessene Fundstellen, je Artikel eine Zahl', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });

    await inGesetzSuche(page).fill('Vertrag');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    // Artikel-Zahl + Fundstellen-Zahl stehen in EINER Zeile; die Fundstellen
    // sind gemessen (nicht geschätzt) und deshalb ≥ der Artikel-Zahl.
    await expect(leiste(page)).toContainText(/Treffer für «Vertrag»/, { timeout: 20_000 });
    await expect(leiste(page)).toContainText(/Fundstellen?/, { timeout: 20_000 });

    const zahlen = await page.locator('[data-fundstellen-zahl]').evaluateAll(
      (els) => els.map((e) => Number(e.getAttribute('data-fundstellen-zahl'))));
    expect(zahlen.length, 'jeder Treffer-Artikel trägt eine Fundstellen-Zahl').toBeGreaterThan(0);
    expect(zahlen.every((n) => Number.isInteger(n) && n > 0), `Fundstellen je Artikel: ${zahlen.slice(0, 8)}`).toBe(true);

    // Die Summe je Artikel deckt sich mit der Gesamtzahl der Leiste (EINE
    // Treffer-Semantik, §5 — nicht zwei sich widersprechende Zahlen, §8).
    const gesamtText = (await leiste(page).innerText()).match(/(\d+)\s+Fundstellen?/);
    expect(gesamtText, 'Gesamtzahl in der Leiste').not.toBeNull();
    const summe = zahlen.reduce((a, b) => a + b, 0);
    expect(Number(gesamtText![1]), `Summe je Artikel ${summe} vs. Leisten-Gesamt`).toBe(summe);
    expect(fehler).toEqual([]);
  });

  test('Vor/Zurück springt zyklisch durch die Fundstellen (Tastatur + 44-px-Tap-Ziele)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    await inGesetzSuche(page).fill('Vertrag');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    const vor = page.locator('[data-treffer-vor]');
    const zurueck = page.locator('[data-treffer-zurueck]');
    const pos = page.locator('[data-treffer-position]');
    await expect(vor).toBeVisible({ timeout: 20_000 });

    // A9-DoD Tap-Ziele: beide Knöpfe mindestens 44×44 px.
    for (const knopf of [vor, zurueck]) {
      const box = await knopf.boundingBox();
      expect(box!.width, 'Tap-Ziel Breite').toBeGreaterThanOrEqual(44);
      expect(box!.height, 'Tap-Ziel Höhe').toBeGreaterThanOrEqual(44);
    }

    // Vor der ersten Navigation: «–/n» (nichts Erfundenes, §8).
    await expect(pos).toContainText('–');
    await vor.click();
    await expect(pos).toContainText(/^1\//);
    await vor.click();
    await expect(pos).toContainText(/^2\//);
    // Zurück ist die Umkehrung.
    await zurueck.click();
    await expect(pos).toContainText(/^1\//);
    // Zyklisch: von der ersten zurück auf die letzte.
    await zurueck.click();
    const text = await pos.innerText();
    const [i, n] = text.split('/').map((s) => Number(s.trim()));
    expect(i, `zyklischer Rücksprung auf die letzte Fundstelle (${text})`).toBe(n);

    // Tastatur: die Knöpfe sind echte <button> und per Enter bedienbar.
    await vor.focus();
    await page.keyboard.press('Enter');
    await expect(pos).toContainText(/^1\//);
  });

  test('Der Sprung bewegt den Lesefluss zur Fundstelle (Scroll, kein DOM-Umbau)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    await inGesetzSuche(page).fill('Vertrag');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    const vor = page.locator('[data-treffer-vor]');
    await expect(vor).toBeVisible({ timeout: 20_000 });

    // Knoten-Zahl der Trefferliste vor/nach dem Sprung: der Sprung ist reine
    // Scroll-/Paint-Bewegung, er mutiert den Wortlaut-Baum NICHT (R1-Auflage).
    const knotenVorher = await page.evaluate(() => document.querySelectorAll('article[id^="art-"]').length);
    for (let k = 0; k < 12; k++) await vor.click();
    const knotenNachher = await page.evaluate(() => document.querySelectorAll('article[id^="art-"]').length);
    expect(knotenNachher, 'Trefferliste unverändert (kein DOM-Umbau durch den Sprung)').toBe(knotenVorher);
    // Es wurde tatsächlich gescrollt (12 Fundstellen weiter liegen im OR nicht
    // mehr im ersten Viewport).
    const y = await page.evaluate(() => window.scrollY);
    expect(y, 'Sprung hat den Lesefluss bewegt').toBeGreaterThan(0);
  });

  test('Ohne aktive Suche kein Zähler, keine Tasten, kein Highlight — Normtext-DOM unverändert', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });

    const signatur = () => page.evaluate(() => {
      const arts = [...document.querySelectorAll('article[id^="art-"]')].slice(0, 25);
      return arts.map((a) => `${a.id}|${(a.textContent ?? '').length}`).join('~');
    });
    const vorher = await signatur();
    await expect(leiste(page)).toHaveCount(0);
    await expect(page.locator('[data-treffer-vor]')).toHaveCount(0);
    await expect(page.locator('[data-fundstellen-zahl]')).toHaveCount(0);

    await inGesetzSuche(page).fill('Vertrag');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    // Highlight-Registry NUR im Suchmodus belegt.
    await expect.poll(async () => page.evaluate(() => (window as unknown as {
      CSS?: { highlights?: Map<string, unknown> } }).CSS?.highlights?.has('lc-such-treffer') ?? false),
    { timeout: 30_000 }).toBe(true);

    await inGesetzSuche(page).fill('');
    await expect(leiste(page)).toHaveCount(0, { timeout: 30_000 });
    await expect.poll(async () => page.evaluate(() => (window as unknown as {
      CSS?: { highlights?: Map<string, unknown> } }).CSS?.highlights?.has('lc-such-treffer') ?? false),
    { timeout: 30_000 }).toBe(false);
    // Und der Wortlaut-Baum ist derselbe wie vor der Suche (reine Render-Schicht).
    expect(await signatur(), 'Normtext-DOM nach dem Suchmodus').toBe(vorher);
  });
});

test.describe('R2 — Mobile Gliederung als volles Bottom-Sheet', () => {
  test('Sheet ist unten angeschlagen, füllt die Höhe, trägt «Sie sind hier» + Quickjump', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: /Gliederung/ }).first().click();
    await expect(sheet(page)).toBeVisible({ timeout: 20_000 });

    // Bottom-Sheet: unten am Viewport verankert (Daumenzone) und deutlich höher
    // als der frühere 60-vh-Drawer, der oben klebte.
    const box = (await sheet(page).boundingBox())!;
    expect(Math.abs(box.y + box.height - 844), 'Sheet ist unten angeschlagen').toBeLessThan(2);
    expect(box.height, 'volle Höhe der Daumenzone').toBeGreaterThan(844 * 0.7);

    // aria: echter modaler Dialog mit Namen.
    await expect(sheet(page)).toHaveAttribute('role', 'dialog');
    await expect(sheet(page)).toHaveAttribute('aria-modal', 'true');
    await expect(sheet(page)).toHaveAttribute('aria-label', 'Gliederung');

    // «Sie sind hier» ist da und benennt die Leseposition (nichts Erfundenes).
    await expect(page.locator('[data-sie-sind-hier]')).toBeVisible();
    await expect(page.locator('[data-sie-sind-hier]')).toContainText('Sie sind hier');

    // Quickjump «Art. N» steht ZUOBERST (über dem Baum).
    const feld = page.getByRole('textbox', { name: 'Zu Artikel springen' });
    await expect(feld).toBeVisible();
    const feldBox = (await feld.boundingBox())!;
    const baumBox = (await sheet(page).getByRole('list').first().boundingBox())!;
    expect(feldBox.y, 'Quickjump über dem Gliederungsbaum').toBeLessThan(baumBox.y);

    // Schliessen-Knopf ist ein 44-px-Tap-Ziel.
    const zu = page.getByRole('button', { name: 'Gliederung schliessen' });
    const zuBox = (await zu.boundingBox())!;
    expect(zuBox.width).toBeGreaterThanOrEqual(44);
    expect(zuBox.height).toBeGreaterThanOrEqual(44);

    // Esc schliesst (Tastatur-Bedienbarkeit, useDialogFokus).
    await page.keyboard.press('Escape');
    await expect(sheet(page)).toHaveCount(0, { timeout: 10_000 });
    expect(fehler).toEqual([]);
  });

  test('Quickjump springt deterministisch zum Artikel — Unbekanntes wird ehrlich abgelehnt', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: /Gliederung/ }).first().click();
    await expect(sheet(page)).toBeVisible({ timeout: 20_000 });

    const feld = page.getByRole('textbox', { name: 'Zu Artikel springen' });
    // Unbekannter Artikel: KEIN Sprung, sondern ein ehrlicher Hinweis (§8).
    await feld.fill('Art. 99999');
    await feld.press('Enter');
    await expect(page.getByRole('alert')).toContainText(/gibt es in diesem Erlass nicht/);
    await expect(sheet(page)).toBeVisible();

    // Bekannter Artikel (mit «Art.»-Präfix + Punkt): Sprung + Sheet zu.
    await feld.fill('Art. 41');
    await feld.press('Enter');
    await expect(page.locator('#art-41')).toBeInViewport({ timeout: 20_000 });
  });

  test('Desktop-TOC-Kopf trägt denselben Quickjump-Baustein (§5)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    const feld = page.getByRole('textbox', { name: 'Zu Artikel springen' });
    await expect(feld).toBeVisible({ timeout: 20_000 });
    // Genau EINES (kein Doppel aus Sheet + Spalte).
    await expect(feld).toHaveCount(1);
    // Es steht im TOC-Kopf, NICHT im [data-toc]-Scroller (bleibt beim Blättern stehen).
    await expect(feld.locator('xpath=ancestor::aside')).toHaveCount(1);
    await expect(feld.locator('xpath=ancestor::*[@data-toc]')).toHaveCount(0);

    await feld.fill('110');
    await feld.press('Enter');
    await expect(page.locator('#art-110')).toBeInViewport({ timeout: 20_000 });
  });
});

test.describe('A9-DoD — Flüssigkeit unter CPU-Drossel 6×', () => {
  test('Suche, Fundstellen-Sprung und Gliederungs-Sheet ohne Layout-Shift (CLS 0)', async ({ page }) => {
    test.slow();
    const fehler = fehlerSammeln(page);
    await page.setViewportSize({ width: 390, height: 844 });
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });

    // BV statt OR: gemessen wird der LAYOUT-SHIFT der R1/R2-Flächen, nicht die
    // Rebuild-Dauer eines 1686-Artikel-Baums. Der Suchmodus-AUSSTIEG mountet den
    // vollen Volltext neu — bei OR sind das unter 6× Drossel dokumentierte
    // ~20 s+ (A35-Kommentar in inhalt.tsx), was den Test zum Runner-Messgerät
    // machte statt zum CLS-Beweis. Die BV trägt dieselben Flächen (Gliederung,
    // Trefferliste, Sheet) in bedienbarer Grösse.
    await page.goto('/gesetze/bund/BV');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 40_000 });
    await clsBeobachten(page);

    // Mobil (< sm) trägt der Inhalts-Kopf nur das Such-ICON (A35, David 19.7.2026);
    // es öffnet das Feld als Overlay über der Zeile. Erst danach ist die searchbox da.
    await page.getByRole('button', { name: 'Im Gesetz suchen' }).click();

    // 1 · Suchmodus betreten — Zähler + Tasten wachsen in reservierte Slots ein.
    await inGesetzSuche(page).fill('Kanton');
    await expect(leiste(page)).toBeVisible({ timeout: 40_000 });
    // Nachlauf: späte (input-freie) Shifts einsammeln — hier sitzt das Nachwachsen
    // der GEMESSENEN Fundstellen-Zahlen (sie kommen erst nach dem Render).
    await page.waitForTimeout(900);

    // 2 · Zwei Fundstellen-Sprünge (reines Scrollen, kein Reflow).
    const vor = page.locator('[data-treffer-vor]');
    await vor.click();
    await vor.click();
    await page.waitForTimeout(900);

    // 3 · Suchmodus verlassen — zurück zum Volltext. Mobil über das ✕ des
    // Such-Overlays (leert UND schliesst, wie der Nutzer es tut; ein blosses
    // Leeren liesse das Overlay über der Kopfzeile stehen).
    await page.getByRole('button', { name: 'Suche schliessen' }).click();
    await expect(leiste(page)).toHaveCount(0, { timeout: 40_000 });
    await page.waitForTimeout(900);

    // 4 · Gliederungs-Sheet auf und zu (Overlay, aus dem Fluss).
    await page.getByRole('button', { name: /Gliederung/ }).first().click();
    await expect(sheet(page)).toBeVisible({ timeout: 40_000 });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'Gliederung schliessen' }).click();
    await expect(sheet(page)).toHaveCount(0, { timeout: 20_000 });
    await page.waitForTimeout(900);

    const { cls, quellen, fremd, fremdQ } = await clsLesen(page);
    expect(cls, `Input-freier Layout-Shift der R1/R2-Flächen — Quellen: ${quellen.join(' | ') || '—'}`
      + ` (fremd, nicht zugerechnet: ${fremd} · ${fremdQ.join(' | ') || '—'})`).toBe(0);

    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    expect(fehler).toEqual([]);
  });
});
