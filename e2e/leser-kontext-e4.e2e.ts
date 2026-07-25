import { test, expect } from '@playwright/test';

// E4/A32 + E4-Korrektur (David-Feedback 25.7.2026, wörtlich): «also das
// kontextfenster soll gliederung nicht abschneiden. sie soll einfach unten an
// der gliederung stehen. aktuell schneidet es gliederung ab.»
//
// DEKLARIERTE ANPASSUNG dieses Specs ans neue Soll: die frühere Fassung pinnte
// die 33vh-Slot-Geometrie (fixer Geschwister-Slot, Slot-Höhe unverändert,
// Baum > Slot) — genau dieses Layout klemmte das Gliederungs-Sichtfenster ein
// (ZGB@1440: 444px statt ~740px) und ist durch das David-Zitat oben überholt.
// Neues Soll: das Panel steht IM FLUSS INNERHALB des [data-toc]-Scrollers,
// unterhalb des Baums; die Gliederung behält ihr volles Spalten-Sichtfenster.
//
// A9-DoD-Querschnitt bleibt: die Panel-Einblendung darf unter CPU-Drossel KEIN
// Layout-Springen erzeugen. Neuer CLS-Mechanismus: unter dem Panel steht im
// Scroller nichts — das Einwachsen vergrössert nur die Scrollhöhe, verschiebt
// aber kein sichtbares Element. Kontext-Feeds werden per Route angehalten, bis
// der CLS-Beobachter steht (deterministisches Messfenster).
// Drossel wie leser-kopf-a9: CI = 4× (2-Kern-Runner), lokal 6× (Auftrag E4).
const DROSSEL = process.env.CI ? 4 : 6;

test('E4-Korrektur: Panel im Fluss unter der vollen Gliederung — kein Abschneiden, CLS 0', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

  // Kontext-Feeds anhalten (Seiten-kritische Fetches — Snapshot/Struktur/
  // Currency unter /normtext/ ohne «revisionen» — laufen ungebremst durch).
  let freigeben: (() => void) | null = null;
  const tor = new Promise<void>((r) => { freigeben = r; });
  await page.route(/\/(rechtsprechung|materialien|verzahnung)\/|\/normtext\/revisionen\//, async (route) => {
    await tor;
    await route.continue();
  });

  await page.goto('/gesetze/bund/BV');
  const toc = page.locator('[data-toc]');
  await expect(toc).toBeVisible({ timeout: 20000 });
  const slot = page.locator('[data-toc-kontext]');
  await expect(slot).toBeAttached({ timeout: 20000 });
  await expect(slot).toContainText('Kontext');
  await expect(slot).toContainText('wird geladen');

  // (a) Panel liegt IM FLUSS des [data-toc]-Scrollers (kein Geschwister-Slot).
  const struktur = await page.evaluate(() => {
    const t = document.querySelector('[data-toc]');
    const s = document.querySelector('[data-toc-kontext]');
    const aside = t?.closest('aside') ?? null;
    return {
      imScroller: !!(t && s && t.contains(s)),
      tocClient: t?.clientHeight ?? 0,
      tocScroll: t?.scrollHeight ?? 0,
      asideHoehe: aside ? Math.round(aside.getBoundingClientRect().height) : 0,
    };
  });
  expect(struktur.imScroller, 'Panel muss IM [data-toc]-Scroller liegen').toBe(true);
  // (b) Gliederung nicht abgeschnitten: der Scroller füllt die TOC-Spalte im
  // Wesentlichen ganz (>85% der Aside-Höhe) — der alte 33vh-Slot drückte ihn
  // auf ~56%. Identische Messgrösse wie die Ist-Erhebung (clientHeight).
  expect(struktur.tocClient, 'Gliederungs-Sichtfenster eingeklemmt').toBeGreaterThan(struktur.asideHoehe * 0.85);

  const tocClientVorher = struktur.tocClient;
  const ersterEintragVorher = await page.locator('[data-toc] button').first().boundingBox();

  // CLS-Beobachter installieren, DANN die Feeds freigeben.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });
  freigeben!();

  // Panel vollständig eingeblendet (Gating: alles auf einmal, Platzhalter weg).
  await expect(slot).not.toContainText('wird geladen', { timeout: 30000 });
  await page.waitForTimeout(800); // Layout unter Drossel ausschwingen lassen

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // (c) Kein unerwarteter Layout-Shift durch die Einblendung.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS der Panel-Einblendung muss 0 sein').toBe(0);

  // (d) Sichtfenster der Gliederung unverändert; das Einwachsen hat nur die
  // SCROLLhöhe des Scrollers vergrössert (Fluss-Beweis), nichts eingeklemmt.
  const nachher = await page.evaluate(() => {
    const t = document.querySelector('[data-toc]');
    return { tocClient: t?.clientHeight ?? 0, tocScroll: t?.scrollHeight ?? 0 };
  });
  expect(Math.abs(nachher.tocClient - tocClientVorher), 'Gliederungs-Sichtfenster verändert').toBeLessThan(2);
  expect(nachher.tocScroll, 'Panel muss die Scrollhöhe im Fluss vergrössern').toBeGreaterThan(struktur.tocScroll);
  // (e) Der erste sichtbare Gliederungs-Eintrag steht exakt an seinem Platz.
  const ersterEintragNachher = await page.locator('[data-toc] button').first().boundingBox();
  expect(Math.abs((ersterEintragNachher?.y ?? 0) - (ersterEintragVorher?.y ?? -1))).toBeLessThan(1);

  // (f) «einfach unten an der gliederung»: erst die Seite in die 2-Spalten-Zone
  // bringen (bei Scroll 0 liegt die sticky TOC-Spalte noch unter Kopf/Präambel),
  // dann den Gliederungs-Scroller ans Ende — das Panel wird sichtbar (Scrollen
  // ist kein Layout-Shift, CLS bleibt unberührt).
  await page.evaluate(() => document.getElementById('art-3')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    // Zum PANEL-ANFANG scrollen (der Panel-Inhalt selbst ist länger als das
    // Spalten-Sichtfenster — «Scroller ganz ans Ende» stünde am Panel-ENDE).
    const t = document.querySelector('[data-toc]');
    const k = document.getElementById('kontext-titel');
    if (t && k) t.scrollTop += k.getBoundingClientRect().top - t.getBoundingClientRect().top - 20;
  });
  await expect(page.locator('#kontext-titel')).toBeInViewport();
});
