// @shard-gruppe: 2
import { test, expect } from '@playwright/test';
import { fehlerSammeln } from './helpers/fehlerSammeln';
import { DROSSEL, REAKTIONS_BUDGET, REAKTIONS_LATTE, CONTAINER_BUDGET_CI, CONTAINER_LOKAL_READER } from './helpers/budgets';
import { ANSICHT_PANEL, VERMERKE_SCHALTER_NAME } from './helpers/leserBeschriftung';

// W2·5d U-KOPF — A9-Querschnitt (Bedienbarkeit + Flüssigkeit unter CPU-Throttle).
// Beweist, dass die Kopf-Interaktionen (A4 «Ansicht»-Dropdown öffnen +
// Switches togglen, Gliederungs-/TOC-Sprung) auch gedrosselt ohne spürbaren Lag
// laufen und KEINEN Layout-Shift verursachen (CLS 0). BV#art-8: klein, aber
// geschachtelt (2-Spalten-Lesemodus mit TOC) → deckt die A-Punkte ab.
// A27: der In-Erlass-Kontextkopf/Breadcrumb ist entfernt, der Sprung-Schritt
// nutzt die TOC.
//
// Drossel, Reaktions-Budget, Latte und Container-Deckel kommen aus
// `./helpers/budgets` — dort steht auch die Kalibrierungs-Empirie, die bis zum
// 14.8.2026 hier lag und in drei weiteren Specs als blosser Verweis stand (§5).

test('A9: «Ansicht»-Dropdown + Gliederungs-Sprung flüssig unter CPU-Throttle, CLS 0', async ({ page }) => {
  test.setTimeout(CONTAINER_BUDGET_CI ?? CONTAINER_LOKAL_READER);
  const fehler = fehlerSammeln(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

  await page.goto('/gesetze/bund/BV#art-8');
  const trigger = page.getByRole('button', { name: 'Ansicht' }).first();
  await expect(trigger).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-8')).toBeVisible({ timeout: 20000 });
  await page.locator('#art-8').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // Scroll-Spy den Pfad setzen lassen

  // CLS-Beobachter für den GESAMTEN Interaktionsfluss (nur künftige Shifts; jede
  // toggle-/klick-getriebene Verschiebung liegt binnen 500 ms nach Input =
  // input-exkludiert → darf 0 bleiben).
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // A4: Dropdown öffnen (Budget grosszügig, gedrosselt).
  let t0 = Date.now();
  await trigger.click();
  const gruppe = page.locator(ANSICHT_PANEL).first();
  await expect(gruppe).toBeVisible({ timeout: REAKTIONS_LATTE });
  expect(Date.now() - t0, 'Dropdown öffnen zu langsam').toBeLessThan(REAKTIONS_BUDGET);

  // A4: die Switches togglen — jeder reagiert ohne Hänger. «Linien» ist mit dem
  // Linien-Rückbau V1 (16.8.2026, Entscheid David 13.8.2026) aus dem Menü
  // entfallen, «Verweise» mit dem Optionen-Rückbau S1 (17.8.2026, Entscheid
  // David F2); an seine Stelle tritt der zweite verbliebene Schalter
  // «Änderungsvermerke». Geprüfter Sachverhalt (Reaktionszeit je Schalter unter
  // Drossel) unverändert (§6.3: deklariert). Der Testerlass BV trägt 131
  // `kl:'A'`-Fussnoten, der Schalter ist dort also angeboten (S1-Nachzug B3).
  // Ä116 (18.8.2026): der zweite Schalter heisst in V3 «Fassung», in der
  // Ist-Hülle weiter «Änderungsvermerke» (helpers/leserBeschriftung).
  for (const name of [/^Fussnoten/, VERMERKE_SCHALTER_NAME] as const) {
    t0 = Date.now();
    const sw = gruppe.getByRole('switch', { name });
    const vorher = await sw.getAttribute('aria-checked');
    await sw.click();
    await expect(sw).not.toHaveAttribute('aria-checked', vorher ?? '', { timeout: REAKTIONS_LATTE });
    expect(Date.now() - t0, `Switch «${name}» zu langsam`).toBeLessThan(REAKTIONS_BUDGET);
  }

  // Dropdown schliessen (Escape), dann Gliederungs-Sprung: TOC-Klick springt
  // flüssig (A27: der In-Erlass-Kontextkopf/Breadcrumb ist entfernt — der
  // verbliebene In-Seiten-Sprung ist die TOC-Gliederung, springeZuSektion).
  await page.keyboard.press('Escape');
  await expect(gruppe).toBeHidden();
  const glied = page.locator('[data-toc] [data-toc-aktiv]').first();
  await expect(glied).toBeVisible();
  t0 = Date.now();
  await glied.click();
  await page.waitForTimeout(600);
  expect(Date.now() - t0, 'Gliederungs-Sprung zu langsam').toBeLessThan(REAKTIONS_BUDGET);

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // CLS über den gesamten Fluss == 0.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS über Dropdown/Toggle/Breadcrumb muss 0 sein').toBe(0);
  // Keine Konsolen-/Laufzeitfehler.
  expect(fehler).toEqual([]);
});
