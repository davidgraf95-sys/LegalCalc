// @shard-gruppe: 3
import { test, expect, type Page } from '@playwright/test';

// W2·5d U-KOPF — A9-Querschnitt (Bedienbarkeit + Flüssigkeit unter CPU-Throttle).
// Beweist, dass die Kopf-Interaktionen (A4 «Ansicht»-Dropdown öffnen +
// Switches togglen, Gliederungs-/TOC-Sprung) auch gedrosselt ohne spürbaren Lag
// laufen und KEINEN Layout-Shift verursachen (CLS 0). Drossel wie #163:
// CI = 4× (2-Kern-Runner), lokal 6×. BV#art-8: klein, aber geschachtelt (Guide +
// 2-Spalten-Lesemodus mit TOC) → deckt die A-Punkte ab. A27: der In-Erlass-
// Kontextkopf/Breadcrumb ist entfernt, der Sprung-Schritt nutzt die TOC.
const DROSSEL = process.env.CI ? 4 : 6;

// ── Budget-Kalibrierung für den 2-vCPU-Runner (26.7.2026, Muster 1bcca6b3) ──────
// DEKLARIERTE Test-Änderung nach §6.3 — sie hebt einen Deckel, darum steht die
// Begründung samt Messreihe hier und nicht in der Commit-Message allein.
//
// Belegter Anlass: auf main-CI (Lauf 30213927546, Shard 8/8) riss dieser Test 3×
// an den Reaktions-Budgets — «Switch Linien zu langsam» 5766 bzw. 6263 ms und
// «Gliederungs-Sprung zu langsam» 5756 ms gegen das feste 5000-ms-Budget —,
// während derselbe Code lokal grün blieb (25.8 s Gesamtlauf).
//
// Gegengemessen (26.7.2026, 4-vCPU-Container @2.1 GHz, CI-Zweig also 4× Drossel,
// workers=1 ohne Contention, 4 Läufe, alle grün):
//   Dropdown öffnen  4342 · 4057 · 4074 · 4713 ms   (Maximum bei 94 % des Budgets)
//   Switch Fussnoten 3452 · 3375 · 3122 · 3495 ms
//   Switch Linien    3996 · 3610 · 3835 · 3754 ms
//   Switch Verweise  2795 · 3008 · 2993 · 2808 ms
//   Gliederungs-Spr. 3955 · 4087 · 3784 · 3737 ms
// Das 5000-ms-Budget hat auf 4 vCPU also nur noch 6 % Luft; der 2-vCPU-Runner ist
// nochmals langsamer und überschreitet es entsprechend um 15–25 %. Gemessen wird
// im Budget-Fenster ohnehin nicht nur die App-Reaktion, sondern auch Playwrights
// Aktionierbarkeits-Prüfung («visible, enabled and stable» über aufeinander
// folgende Frames) — und die skaliert mit der Drossel mit. Der Deckel misst damit
// zu einem guten Teil Runner-Tempo, nicht Interaktions-Lag.
//
// Höhe nach der Revisions-Politik QS-PERF Ziff. 5 («Deckel = Ist + max(3 sd,
// ~25 %), Anhebung nur mit Mess-Beleg»): Ist = 6263 ms (schlechtester belegter
// Wert), 3 sd der Messreihe ≈ 915 ms, 25 % = 1566 ms → max ⇒ 7829 ms, gerundet
// 8000 ms. Der Deckel bleibt damit scharf: die belegten Runner-Werte liegen bei
// 72–78 % davon, eine echte Verdoppelung der Reaktionszeit fällt weiterhin auf
// (§6.7 — kein Tor, das nicht scheitern kann). LOKAL bleibt es bei 5000 ms: dort
// gibt es keine Runner-Streuung, und ein lockerer lokaler Deckel machte die
// Entwicklungs-Schleife blind.
//
// Die web-first-Latte MUSS über dem Budget liegen, sonst riss künftig zuerst die
// Assertion-Frist und die Budget-Assertion könnte gar nicht mehr feuern. Darum
// Latte = Budget + 3000 ms; lokal ergibt das unverändert 8000 ms.
//
// Die PRÜFAUSSAGE ist unberührt (§6.3): geprüft wird weiterhin, dass jede
// Kopf-Interaktion unter Drossel ohne Hänger reagiert und der gesamte Fluss
// CLS 0 hält — nur die Schranke ist auf die Hardware kalibriert, gegen die sie
// läuft. Hält die Kalibrierung nicht, ist der nächste Schritt eine gemessene
// Runner-Reihe (Muster `perf-kalibrierung.yml`), NICHT ein weiteres Anheben.
const REAKTIONS_BUDGET = process.env.CI ? 8000 : 5000;
const REAKTIONS_LATTE = REAKTIONS_BUDGET + 3000;

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', (e) => fehler.push(String(e)));
  return fehler;
}

test('A9: «Ansicht»-Dropdown + Gliederungs-Sprung flüssig unter CPU-Throttle, CLS 0', async ({ page }) => {
  // Container-Budget auf CI 120 s (26.7.2026). Gemessen braucht der Test auf dem
  // 4-vCPU-Container ~49 s je Lauf; der 2-vCPU-Runner liegt darüber, und die Summe
  // der vier gemessenen Fenster plus der ungedrosselten Ready-Latten kommt dem
  // 90-s-Default damit nahe. Reisst der Container zuerst, lautet die Meldung «Test
  // timeout» — und sagt nicht mehr, WELCHE Interaktion zu langsam war; genau diese
  // Auskunft ist der Ertrag des Tests. Lokal unverändert (30 s). Reine
  // Infrastruktur (Zeitbudget), kein Prüfschritt berührt (§6.3).
  if (process.env.CI) test.setTimeout(120_000);
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
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible({ timeout: REAKTIONS_LATTE });
  expect(Date.now() - t0, 'Dropdown öffnen zu langsam').toBeLessThan(REAKTIONS_BUDGET);

  // A4: die drei Switches togglen — jeder reagiert ohne Hänger.
  for (const name of ['Fussnoten', 'Linien', 'Verweise'] as const) {
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
