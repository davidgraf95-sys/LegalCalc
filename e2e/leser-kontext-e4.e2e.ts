import { test, expect } from '@playwright/test';

// E4/A32 (FAHRPLAN-GESETZES-UX §10.10) — Kontext-Panel unterhalb der Gliederung.
// A9-DoD-Querschnitt (Pflicht jeder W2·5d-Einheit): die neue Panel-Position darf
// unter CPU-Drossel KEIN Layout-Springen erzeugen. Mechanik unter Beweis:
// (1) der Slot [data-toc-kontext] ist per h-toc-kontext-Token FIX reserviert
//     (§15.2 «reservierter Platz») und steht ab dem ersten Render;
// (2) das Panel blendet erst NACH vollständiger Ladung ein (variante=
//     "seitenleiste") — der async-Resolve füllt reservierten Platz.
// Damit die Einblendung DETERMINISTISCH ins Messfenster fällt, werden die
// Kontext-Feeds (rechtsprechung/materialien/verzahnung/normtext-revisionen)
// per Route angehalten, bis der CLS-Beobachter installiert ist.
// Drossel wie leser-kopf-a9: CI = 4× (2-Kern-Runner), lokal 6× (Auftrag E4).
const DROSSEL = process.env.CI ? 4 : 6;

test('A32: Panel unter der Gliederung — Einblendung ohne Layout-Springen (CLS 0), Gliederung bleibt primär', async ({ page }) => {
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
  await expect(page.locator('[data-toc]')).toBeVisible({ timeout: 20000 });

  // Der reservierte Panel-Slot steht UNTERHALB der Gliederung, mit Platzhalter.
  const slot = page.locator('[data-toc-kontext]');
  await expect(slot).toBeVisible({ timeout: 20000 });
  await expect(slot).toContainText('Kontext');
  await expect(slot).toContainText('wird geladen');
  const tocVorher = await page.locator('[data-toc]').boundingBox();
  const slotVorher = await slot.boundingBox();
  expect(tocVorher && slotVorher && slotVorher.y > tocVorher.y,
    'Slot muss unterhalb des Gliederungsbaums beginnen').toBe(true);

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

  // (a) Kein unerwarteter Layout-Shift durch die Einblendung.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS der Panel-Einblendung muss 0 sein').toBe(0);

  // (b) Reservierter Slot: Position und Höhe unverändert (nichts rückte nach).
  const slotNachher = await slot.boundingBox();
  expect(Math.abs((slotNachher?.y ?? 0) - (slotVorher?.y ?? -1)), 'Slot-Position verschoben').toBeLessThan(1);
  expect(Math.abs((slotNachher?.height ?? 0) - (slotVorher?.height ?? -1)), 'Slot-Höhe verändert').toBeLessThan(1);

  // (c) Gliederung bleibt primär: der Baum behält die Mehrheit der Spalte.
  const tocNachher = await page.locator('[data-toc]').boundingBox();
  expect(tocNachher && slotNachher && tocNachher.height > slotNachher.height,
    'Gliederungsbaum muss höher bleiben als der Panel-Slot').toBe(true);
});
