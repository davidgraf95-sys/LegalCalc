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

// Unabhängiges Orakel für die Fundstellen-Zahl (§0/2: der Test darf die Regel
// nicht aus der Implementierung ableiten). Vertrag von R1: gezählt wird, was im
// Wortlaut der Treffer-Artikel WIRKLICH GERENDERT ist —
//   · nur innerhalb von `article[id^="art-"]` (Zähler-/Meta-Zeilen der Liste
//     gehören nicht zum Gesetzestext),
//   · keine `display:none`-Teilbäume (Fussnoten-Apparat bei «Fussnoten aus»,
//     Hist-Chronologie) — was nicht gemalt werden kann, ist keine Fundstelle (§8).
// Genau diese Menge muss die Leiste anzeigen, das Highlight malen und die
// Vor/Zurück-Navigation ablaufen.
async function sichtbareFundstellen(page: Page, begriff: string): Promise<number> {
  return page.evaluate((b) => {
    const wurzel = document.querySelector('[data-treffer-liste]');
    if (!wurzel) return -1;
    const nadel = b.toLowerCase();
    let n = 0;
    for (const art of wurzel.querySelectorAll('article[id^="art-"]')) {
      const w = document.createTreeWalker(art, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (node.nodeType === 1) {
            return getComputedStyle(node as Element).display === 'none'
              ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        const hay = (t.nodeValue ?? '').toLowerCase();
        let ab = 0;
        for (;;) { const i = hay.indexOf(nadel, ab); if (i < 0) break; n++; ab = i + nadel.length; }
      }
    }
    return n;
  }, begriff);
}

/** Zahl aus «i/n» der Positionsanzeige. */
async function position(page: Page): Promise<{ i: number; n: number }> {
  const t = await page.locator('[data-treffer-position]').innerText();
  const [i, n] = t.split('/').map((s) => Number(s.trim()));
  return { i, n };
}

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

  // ── B1-Regression (Bug-Check §9, 4.8.2026) ─────────────────────────────────
  // Der Zähler-Absatz «N Fundstellen» lag INNERHALB des Walker-Containers. Bei
  // einem Suchbegriff, der in diesem Wort selbst vorkommt («stelle»), zählte das
  // frische Sammeln beim Klick die eigenen Meta-Zeilen mit: gemeldet 425, beim
  // Sprung 681 ⇒ Anzeige «681/425», und ~1/3 der Klicks landete auf einer
  // Zeile ohne Markierung. Malen, Zählen und Springen müssen EINE Menge sein.
  test('B1 — «stelle»: der Zähler zählt sich nicht selbst, Position bleibt ≤ Gesamt', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    await inGesetzSuche(page).fill('stelle');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    const vor = page.locator('[data-treffer-vor]');
    await expect(vor).toBeVisible({ timeout: 20_000 });

    // Gemeldete Gesamtzahl == unabhängig gezählte, sichtbare Fundstellen.
    const soll = await sichtbareFundstellen(page, 'stelle');
    expect(soll, 'Orakel muss Fundstellen finden').toBeGreaterThan(0);
    const { n: gemeldet } = await position(page);
    expect(gemeldet, 'gemeldete Gesamtzahl vs. sichtbare Fundstellen im Wortlaut').toBe(soll);

    // Durchklicken: die Laufzeit-Menge darf nicht grösser sein als die gemeldete,
    // und jeder Sprung muss in einem Artikel landen (Puls am Ziel-Artikel).
    for (let k = 0; k < 30; k++) {
      await vor.click();
      const p = await position(page);
      expect(p.n, `Gesamtzahl darf sich beim Springen nicht ändern (Klick ${k + 1})`).toBe(gemeldet);
      expect(p.i, `Position ${p.i} über der Gesamtzahl ${p.n} (Klick ${k + 1})`).toBeLessThanOrEqual(p.n);
      expect(await page.locator('article.lc-ziel-blink').count(),
        `Sprung ${k + 1} landete nicht in einem Artikel (Meta-Zeile ohne Markierung)`).toBeGreaterThan(0);
    }
  });

  // ── B2-Regression (Bug-Check §9, 4.8.2026) ─────────────────────────────────
  // Der Walker hatte keinen Sichtbarkeitsfilter. Bei «Fussnoten aus»
  // (html[data-fussnoten="aus"] ⇒ display:none auf dem Apparat) zählte er
  // unmalbaren Text mit: OR «Fassung» meldete 141, davon 61 (43 %) in
  // display:none-Teilbäumen — der Sprung dorthin bewegte nichts (§8: die
  // Anzeige log über den Zustand).
  test('B2 — «Fussnoten aus»: gezählt wird nur, was auch gemalt werden kann', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });

    // Der Fussnoten-Schalter der Options-Leiste schreibt genau dieses Attribut
    // an <html> (leserOptionen.ts, reiner CSS-Toggle) — hier direkt gesetzt,
    // damit der Test nicht an der Menü-Bedienung hängt.
    await page.evaluate(() => { document.documentElement.dataset.fussnoten = 'aus'; });
    await inGesetzSuche(page).fill('Fassung');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    const aus = await position(page);
    const sollAus = await sichtbareFundstellen(page, 'Fassung');
    expect(aus.n, 'bei «Fussnoten aus» nur sichtbare Fundstellen zählen').toBe(sollAus);

    // Und ein Sprung durch die ganze Menge landet nie im Unsichtbaren.
    const vor = page.locator('[data-treffer-vor]');
    for (let k = 0; k < 15; k++) {
      await vor.click();
      const sichtbar = await page.evaluate(() => {
        const el = document.querySelector('article.lc-ziel-blink');
        return el ? getComputedStyle(el).display !== 'none' : false;
      });
      expect(sichtbar, `Sprung ${k + 1} bei «Fussnoten aus» landete im Unsichtbaren`).toBe(true);
    }

    // Toggle AN erhöht die Zahl ehrlich (der Apparat ist wieder malbar).
    await page.evaluate(() => { document.documentElement.dataset.fussnoten = 'an'; });
    await inGesetzSuche(page).fill('');
    await expect(leiste(page)).toHaveCount(0, { timeout: 30_000 });
    await inGesetzSuche(page).fill('Fassung');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    const an = await position(page);
    expect(an.n, 'mit sichtbarem Apparat müssen es mehr Fundstellen sein').toBeGreaterThan(aus.n);
    expect(an.n, 'und wieder genau die sichtbaren').toBe(await sichtbareFundstellen(page, 'Fassung'));
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
