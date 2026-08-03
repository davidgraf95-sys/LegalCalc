// W2·10-UI-NAV — R3 (zitierfähige Referenz), R5 (Rücksprung-Chip) und R7
// (Deep-Link-Skeleton). Läuft gegen `vite preview` (dist), wie die übrigen
// Reader-Specs. A9-DoD am Schluss: Bedienbarkeit (Tastatur/Touch/aria/Tap-Ziele)
// und Flüssigkeit unter CPU-Drossel 6× mit CLS-Beobachter.
import { test, expect, type Page } from '@playwright/test';
import { clsBeobachtenInstallieren, clsAuslesen } from './helpers/cls';

// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten,
// bevor geprüft wird (Muster leser-kopf-g2b).
async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('article[id^="art-"]').first()).toBeVisible({ timeout: 20000 });
}

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`); });
  return fehler;
}

const chip = (page: Page) => page.getByRole('button', { name: /zurück zu/ });

// Die SPRUNG-Knöpfe des Gliederungs-Baums — und nur die. `[data-toc]` enthält
// ausserdem die Klapp-Chevrons und (unterhalb, `data-toc-kontext`) die
// «nebeneinander öffnen»-Knöpfe der Leitfall-Chips; beide tragen ein aria-label,
// der Sprung-Knopf trägt keines. Ohne diese Eingrenzung trifft `.last()` einen
// Leitfall-Chip, der gar nicht springt (Fehlgriff der ersten Fassung).
const tocSprung = (page: Page) =>
  page.locator('[data-toc] li[data-sektion-id] button:not([aria-label])');

// ── R3 · Die Kopie trägt den amtlichen Deep-Link ─────────────────────────────
test.describe('R3 — zitierfähige Referenz', () => {
  test('«Zitat»-Kopie trägt Fundstelle, Stand, Permalink UND die amtliche Fassung', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 1440, height: 900 });
    await warteReader(page, '/gesetze/bund/BV#art-8');
    await page.locator('#art-8').scrollIntoViewIfNeeded();
    // Der Artikel muss den amtlichen Link auch ANBIETEN — sonst prüfte der Test
    // eine Zeile, die es aus gutem Grund (§8) gar nicht geben darf.
    const amtlichLink = page.locator('#art-8').getByRole('link', { name: /Amtliche Fassung/ });
    await expect(amtlichLink).toHaveCount(1);
    const href = await amtlichLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.locator('#art-8').getByRole('button', { name: /Zitat kopieren:/ }).click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    // Bestand (B-6) unverändert …
    expect(clip).toContain('SR 101');
    expect(clip).toMatch(/\(Stand \d{2}\.\d{2}\.\d{4}\)/);
    expect(clip).toMatch(/abgerufen am \d{2}\.\d{2}\.\d{4}/);
    expect(clip).toContain('/gesetze/bund/BV#art-8');
    // … und neu die amtliche Quelle, ausdrücklich benannt und ZULETZT (§7:
    // massgeblich ist die amtliche Fassung, nicht unsere Projektion).
    expect(clip).toContain(`amtliche Fassung: ${href}`);
    expect(clip.indexOf('#art-8')).toBeLessThan(clip.indexOf('amtliche Fassung:'));
  });
});

// ── R5 · Rücksprung nach einem TOC-Sprung ────────────────────────────────────
test.describe('R5 — Rücksprung-Chip', () => {
  test('TOC-Sprung ⇒ Chip nennt die verlassene Stelle und führt exakt dorthin zurück', async ({ page }) => {
    test.slow();
    const fehler = fehlerSammeln(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await warteReader(page, '/gesetze/bund/BV');

    // Ein Stück weit hineinlesen, damit es überhaupt etwas zu verlassen gibt.
    await page.locator('#art-8').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const vorher = await page.evaluate(() => {
      const arts = document.querySelectorAll<HTMLElement>('article[id^="art-"]');
      let letzter = '';
      for (const el of arts) { if (el.getBoundingClientRect().top <= 88) letzter = el.id; else break; }
      return { id: letzter, y: Math.round(window.scrollY) };
    });
    expect(vorher.id, 'vor dem Sprung wird ein Artikel gelesen').not.toBe('');
    expect(vorher.y).toBeGreaterThan(200);

    // Sprung aus dem Gliederungs-Baum — bewusst ein WEIT entfernter Abschnitt.
    await tocSprung(page).last().click();
    await page.waitForTimeout(1200); // Settle-Fenster des Chips (700 ms) + Sprung

    const c = chip(page);
    await expect(c).toBeVisible();
    // Das Etikett kommt WÖRTLICH aus dem Anker der verlassenen Stelle …
    const label = await page.evaluate((id) => {
      const a = document.querySelector<HTMLElement>(`#${CSS.escape(id)} a[href="#${CSS.escape(id)}"]`);
      return a?.textContent?.trim() ?? '';
    }, vorher.id);
    expect(label, 'Anker-Etikett lesbar').not.toBe('');
    await expect(c).toHaveText(new RegExp(`zurück zu ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));

    // … der Sprung selbst hat die Adresse NICHT angefasst (LM-202).
    expect(new URL(page.url()).hash).toBe('');

    // Rückweg: der Klick führt an die verlassene Stelle, und der Chip verfällt.
    await c.click();
    await page.waitForTimeout(400);
    const nachher = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    }, vorher.id);
    expect(nachher, 'verlassener Artikel steht wieder im oberen Lesebereich').not.toBeNull();
    expect(Math.abs(nachher as number)).toBeLessThan(140);
    await expect(c).toHaveCount(0);
    // Auch der Rückweg ist eine Scroll-Bewegung, keine Navigation.
    expect(new URL(page.url()).hash).toBe('');
    expect(fehler).toEqual([]);
  });

  test('Chip verfällt von selbst — und ein Sprung, der nichts bewegt, erzeugt keinen neuen', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await warteReader(page, '/gesetze/bund/BV');
    await page.locator('#art-8').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const ziel = tocSprung(page).last();
    await ziel.click();
    const c = chip(page);
    await expect(c).toBeVisible({ timeout: 8000 });
    // Lebensdauer 8 s ab Anzeige; grosszügiges Fenster für langsame Runner.
    // Er bleibt nicht als Dauer-Element im Blickfeld stehen.
    await expect(c).toHaveCount(0, { timeout: 25000 });

    // Und jetzt der Leerlauf-Fall: DERSELBE Abschnitt noch einmal. Wir stehen
    // bereits dort, der Sprung bewegt nichts — ein Chip würde eine Rückkehr an
    // die Stelle versprechen, an der man schon steht (§8).
    await ziel.click();
    await page.waitForTimeout(2000);
    await expect(chip(page)).toHaveCount(0);
  });
});

// ── R7 · Deep-Link-Einsprung ─────────────────────────────────────────────────
test.describe('R7 — Deep-Link-Skeleton', () => {
  test('Einsprung über #art-… zeigt die Zielansage statt des Dokumentanfangs', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    // Drosseln, damit der Einsprung so lang dauert wie im Prod-Re-Audit gemessen
    // (1.8–2.8 s Dokumentanfang) — ungedrosselt wäre das Fenster kaum greifbar,
    // und der Test bewiese nichts über den Fall, für den das Overlay gebaut ist.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });

    // Das Overlay ist FLÜCHTIG — es lebt genau so lange wie der Einsprung dauert.
    // Eine Messung NACH `toBeVisible()` trifft darum je nach Maschine schon das
    // Nichts (gemessen: Overlay bei t=0 vollständig da, 300 ms später weg). Ein
    // nachgelagerter Poll ist hier konstruktionsbedingt ein Wettlauf, kein Test.
    // Darum dasselbe Mittel, das die Specs für Layout-Shifts nutzen: ein
    // rAF-Sampler ab Dokumentstart protokolliert JEDEN Frame mit; ausgewertet
    // wird hinterher aus dem Protokoll. Deterministisch statt zufallsabhängig.
    await page.addInitScript(() => {
      interface P { t: number; top: number; bottom: number; vh: number; scrollY: number }
      const w = window as unknown as { __r7: P[] };
      w.__r7 = [];
      const tick = () => {
        const el = Array.from(document.querySelectorAll('[role="status"]'))
          .find((e) => /Springe zu/.test(e.textContent ?? ''));
        if (el) {
          const r = el.getBoundingClientRect();
          w.__r7.push({
            t: Math.round(performance.now()), top: Math.round(r.top),
            bottom: Math.round(r.bottom), vh: window.innerHeight,
            scrollY: Math.round(window.scrollY),
          });
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await page.goto('/gesetze/bund/OR#art-957');
    const overlay = page.getByRole('status').filter({ hasText: /Springe zu/ });
    // Es verschwindet von selbst, sobald der Sprung gelandet ist.
    await expect(overlay).toHaveCount(0, { timeout: 25000 });

    interface P { t: number; top: number; bottom: number; vh: number; scrollY: number }
    const proben: P[] = await page.evaluate(() => (window as unknown as { __r7: P[] }).__r7);
    const dauerMs = proben.length ? proben[proben.length - 1].t - proben[0].t : 0;
    // Es stand überhaupt — und zwar spürbar lang, nicht für einen Frame.
    expect(proben.length, `Overlay-Frames ${proben.length}`).toBeGreaterThan(3);
    expect(dauerMs, `Overlay-Standzeit ${dauerMs} ms`).toBeGreaterThan(300);
    // …und in JEDEM dieser Frames deckte es den Lesebereich ab. Genau das ist die
    // Behauptung von R7: statt des Dokumentanfangs steht dort die Zielansage.
    const schlecht = proben.filter((p) => !(p.top < p.vh * 0.4 && p.bottom > p.vh * 0.5));
    expect(schlecht.length, `Frames ohne Deckung: ${JSON.stringify(schlecht.slice(0, 3))}`).toBe(0);
    // … und dann steht das Ziel wirklich oben (der Sprung ist nicht bloss
    // «weg-animiert» worden).
    const top = await page.evaluate(() => {
      const el = document.getElementById('art-957');
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    });
    expect(top, 'Ziel im DOM').not.toBeNull();
    expect(Math.abs(top as number)).toBeLessThan(220);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  });

  test('Ohne Anker (normaler Aufruf) erscheint KEIN Overlay', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await warteReader(page, '/gesetze/bund/BV');
    await expect(page.getByRole('status').filter({ hasText: /Springe zu/ })).toHaveCount(0);
  });

  test('Eigenes Scrollen beendet das Overlay sofort (keine Falle)', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.goto('/gesetze/bund/OR#art-957');
    const overlay = page.getByRole('status').filter({ hasText: /Springe zu/ });
    await expect(overlay).toBeVisible({ timeout: 10000 });
    await page.mouse.wheel(0, 300); // Nutzer übernimmt
    await expect(overlay).toHaveCount(0, { timeout: 5000 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  });

  // ── B1 (§9-Bug-Check zu PR #431) ───────────────────────────────────────────
  // TOTER ANKER. Alt-Permalinks überleben Aufhebungen und Umnummerierungen —
  // genau die Zitate, die dieses Feature erzeugt, liegen jahrelang in fremden
  // Akten. Zeigt so einer ins Leere, kann die Lande-Bedingung NIE eintreten:
  // das Overlay stand bis zur 6000-ms-Kappe als deckender Schleier über der
  // ganzen Lesespalte und versprach eine Landung, die es nicht geben kann (§8) —
  // schlechter als der Zustand ohne das Feature. Sobald der Reader steht, das
  // Ziel aber fehlt, ist die Antwort bekannt: aufhören.
  test('Toter Anker: Overlay gibt auf, sobald der Reader steht — kein 6-s-Schleier', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });

    // Sampler ab Dokumentstart (Muster wie oben): protokolliert je Frame, ob das
    // Overlay steht und ob der Reader seine Artikel schon gerendert hat.
    await page.addInitScript(() => {
      interface P { t: number; overlay: boolean; artikel: number }
      const w = window as unknown as { __b1: P[] };
      w.__b1 = [];
      const tick = () => {
        const el = Array.from(document.querySelectorAll('[role="status"]'))
          .some((e) => /Springe zu/.test(e.textContent ?? ''));
        w.__b1.push({
          t: Math.round(performance.now()), overlay: el,
          artikel: document.querySelectorAll('article[id^="art-"]').length,
        });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await page.goto('/gesetze/bund/BV#art-9999');
    const overlay = page.getByRole('status').filter({ hasText: /Springe zu/ });
    // Grosszügig über die alte 6000-ms-Kappe hinaus warten: WÜRDE der Schleier
    // wieder so lange stehen, liefe dieser Test in die Assertion unten, nicht in
    // einen Timeout — die Fehlermeldung nennt dann die gemessene Standzeit.
    await expect(overlay).toHaveCount(0, { timeout: 25000 });

    interface P { t: number; overlay: boolean; artikel: number }
    const proben: P[] = await page.evaluate(() => (window as unknown as { __b1: P[] }).__b1);
    const mitOverlay = proben.filter((p) => p.overlay);
    const standzeit = mitOverlay.length
      ? mitOverlay[mitOverlay.length - 1].t - mitOverlay[0].t : 0;
    // Der Beleg: NACHDEM der Reader seine Artikel gerendert hat, darf das Overlay
    // nur noch einen Wimpernschlag stehen (ein Prüf-Takt = 120 ms, plus Luft für
    // den Render-Commit unter 6×-Drossel).
    const ersterMitArtikeln = proben.find((p) => p.artikel > 0);
    expect(ersterMitArtikeln, 'Reader hat Artikel gerendert').toBeTruthy();
    const nachRender = mitOverlay.filter((p) => p.t > (ersterMitArtikeln as P).t);
    const ueberhang = nachRender.length
      ? nachRender[nachRender.length - 1].t - (ersterMitArtikeln as P).t : 0;
    expect(
      ueberhang,
      `Overlay-Überhang nach Artikel-Render ${ueberhang} ms (Standzeit gesamt ${standzeit} ms)`,
    ).toBeLessThan(1000);
    // Und die harte Kappe darf gar nicht erst zum Zuge kommen.
    expect(standzeit, `Overlay-Standzeit ${standzeit} ms`).toBeLessThan(5000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  });
});

// ── A9-DoD: Bedienbarkeit + Flüssigkeit unter CPU-Drossel ────────────────────
test('A9 — Chip: Tastatur/aria/Tap-Ziel, und der TOC-Sprung bleibt unter 6× Drossel CLS-frei', async ({ page }) => {
  test.slow();
  const fehler = fehlerSammeln(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await warteReader(page, '/gesetze/bund/BV');
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Warmlauf ungedrosselt beendet — danach messen (Messfenster-Politik cls.ts).
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await clsBeobachtenInstallieren(page, true, true);

  await tocSprung(page).last().click();
  await page.waitForTimeout(1400);
  const c = chip(page);
  await expect(c).toBeVisible();

  // aria: der Chip erscheint ohne Fokuswechsel → er muss angesagt werden.
  const live = page.locator('[aria-live="polite"]').filter({ has: c });
  await expect(live).toHaveCount(1);

  // Tap-Ziel ≥ 44 px (WCAG 2.5.8 / R6-Mass) — der Chip wird auf dem Daumen bedient.
  const box = await c.boundingBox();
  expect(box, 'Chip hat eine Box').not.toBeNull();
  expect(box!.height, `Chip-Höhe ${box!.height}px`).toBeGreaterThanOrEqual(44);

  // Tastatur: der Chip ist per Tab erreichbar und per Enter auslösbar.
  await c.focus();
  await expect(c).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await expect(c).toHaveCount(0);

  const { cls, bericht } = await clsAuslesen(page);
  // Chip und Overlay liegen ausserhalb des Layoutflusses (fixed/absolute) — sie
  // dürfen NICHTS verschieben. Budget wie die übrigen A9-Tests.
  expect(cls, `CLS ${cls} — ${bericht}`).toBeLessThan(0.05);
  expect(fehler).toEqual([]);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});
