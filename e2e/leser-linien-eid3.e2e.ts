// @shard-gruppe: 7
import { test, expect, type Page } from '@playwright/test';
import { DROSSEL, REAKTIONS_BUDGET, REAKTIONS_LATTE, CONTAINER_BUDGET_CI } from './helpers/budgets';

// W2·5d-EID3 Teil (b) — A9-Querschnitt auf der EINZIGEN Fläche, die der Umbau
// überhaupt berührt.
//
// Der Umbau speist `linienProfil().strukturTiefe` primär aus der Fedlex-eId-
// Pfadlänge statt aus der hN-Ableitung. Korpusweit (1416 Sidecars) weicht GENAU
// EIN Erlass ab: SVG (SR 741.01) — `tit_3/lvl_u1/chap_2/lvl_I` = 4 Segmente bei
// 3 Sidecar-Stufen, weil Fedlex den Container `tit_3/lvl_u1` («Grundregel») als
// `div.heading aria-level=2` führt. Genau dort muss der Beweis liegen, dass die
// Darstellung UNVERÄNDERT ist: `guideEbene` bleibt an die gerenderten Stufen
// gebunden (1), der Guide sitzt auf derselben Ebene wie zuvor, es bleibt bei
// EINEM Guide-Stapel (R4), und der Zustand des Auto-Defaults ist unberührt
// (V2·A28: `data-guide-auto="aus"`, David-Verdikt 12.7.2026, am 3.8.2026 erneut
// bestätigt — die Linie wird NIE aufgedrängt).
//
// A9-DoD: Bedienbarkeit (Tastatur/aria/Tap-Ziel) und Flüssigkeit unter
// CPU-Throttle, CLS über den INTERAKTIONS-Fluss = 0, keine Konsolenfehler.
// Drossel/Budget/Latte aus `./helpers/budgets` (§5) — dort auch die Herleitung.
// WCAG 2.5.8 (AA, Target Size Minimum) — dieselbe Latte wie in der übrigen
// Reader-A9-Reihe.
const TAP_MIN = 24;

// ── Warum der Scroll-Abschnitt einen Deckel statt einer 0 trägt (Messung 3.8.2026) ──
// Der Toggle-Fluss ist input-getrieben (Shift binnen 500 ms nach Input ⇒
// `hadRecentInput`) und muss hart 0 bleiben. Ein WHEEL-Scroll ist das nicht: er
// zählt nicht als «recent input», und lange Reader-Seiten schieben beim Nach-
// rendern minimal nach. Das ist ein BESTEHENDER, feature-unabhängiger Effekt —
// Nullprobe unter identischer Drossel, gleicher Testkörper, nur andere Route:
//   SVG (die EINZIGE vom Umbau berührte Fläche)  CLS 0.00103
//   BV  (vom Umbau NICHT berührt, Kontrolle)     CLS 0.00671  ← 6,5× HÖHER
// Der berührte Erlass liegt also deutlich UNTER der unberührten Kontrolle; der
// Beitrag stammt vom Scrollen, nicht von der Tiefen-Quelle (§0 Ziff. 3: die
// Nullprobe ist ebenfalls «rot» ⇒ der Effekt liegt nicht am Feature). Deckel
// darum auf dem projektüblichen Lighthouse-CLS-Budget 0.05 (vgl.
// gesetze-historie-badge.e2e.ts) — 7× über dem gemessenen Ist, aber 20× unter
// Googles «gut»-Grenze 0.1; ein echter Layout-Bruch fällt weiterhin auf
// (§6.7 — kein Tor, das nicht scheitern kann).
const SCROLL_CLS_DECKEL = 0.05;

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', (e) => fehler.push(String(e)));
  return fehler;
}

/** Zahl der SICHTBAR Guide-tragenden `section[data-normtext-linie]`-Vorfahren über
 *  einem Artikel. Das Markup trägt die border-Breite IMMER (R6/CLS-0: das Aus-
 *  blenden bewegt keinen Textknoten, index.css setzt nur `border-left-color:
 *  transparent`) — gezählt wird darum die FARBE, nicht die Breite. */
async function guideStapel(page: Page, artId: string): Promise<number> {
  return page.evaluate((id) => {
    const unsichtbar = (c: string) => c === 'transparent' || /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/.test(c);
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    let n = 0;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0 && !unsichtbar(cs.borderLeftColor)) n++;
      }
      el = el.parentElement;
    }
    return n;
  }, artId);
}

test('EID-3(b): SVG behält EINEN Guide auf der gerenderten Ebene; Toggle flüssig unter CPU-Throttle, CLS 0', async ({ page }) => {
  if (CONTAINER_BUDGET_CI) test.setTimeout(CONTAINER_BUDGET_CI);
  const fehler = fehlerSammeln(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

  // Art. 29 liegt unter dem abweichenden Pfad (III. Titel → [lvl_u1] → 2. Abschnitt
  // → I. Allgemeine Fahrregeln).
  await page.goto('/gesetze/bund/SVG#art-29');
  const trigger = page.getByRole('button', { name: 'Ansicht' }).first();
  await expect(trigger).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-29')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);

  // V2·A28 unberührt: der Auto-Guide bleibt korpusweit aus — die längere eId-Tiefe
  // darf daran nichts drehen.
  await expect(page.locator('.lc-leser').first()).toHaveAttribute('data-guide-auto', 'aus');
  expect(await guideStapel(page, 'art-29'), 'ohne Nutzer-«an» kein Guide (A28)').toBe(0);

  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // Bedienbarkeit: das Menü ist per Tastatur erreichbar und bedienbar.
  await trigger.focus();
  await expect(trigger).toBeFocused();
  let t0 = Date.now();
  await page.keyboard.press('Enter');
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible({ timeout: REAKTIONS_LATTE });
  expect(Date.now() - t0, 'Dropdown per Tastatur zu langsam').toBeLessThan(REAKTIONS_BUDGET);

  const linien = gruppe.getByRole('switch', { name: 'Linien' });
  await expect(linien).toHaveAttribute('aria-checked', 'false');
  const box = await linien.boundingBox();
  expect(box, 'Linien-Schalter hat keine Box').not.toBeNull();
  expect(box!.height, 'Tap-Ziel Linien-Schalter zu klein').toBeGreaterThanOrEqual(TAP_MIN);

  // «Linien AN» — der EINE Guide erscheint, gedrosselt ohne Hänger.
  t0 = Date.now();
  await linien.click();
  await expect(linien).toHaveAttribute('aria-checked', 'true', { timeout: REAKTIONS_LATTE });
  expect(Date.now() - t0, 'Switch «Linien» zu langsam').toBeLessThan(REAKTIONS_BUDGET);
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'an');

  await page.keyboard.press('Escape');
  await expect(gruppe).toBeHidden();

  // R4/EID-3(b): GENAU EIN Guide-Stapel über Art. 29 — die eId-Pfadtiefe 4 darf
  // den Guide weder vervielfachen noch auf eine nicht gerenderte Ebene schieben
  // (dann wären es 0).
  expect(await guideStapel(page, 'art-29'), 'genau EIN Guide auf der gerenderten Ebene').toBe(1);

  // CLS über den INTERAKTIONS-Fluss (Tastatur-Öffnen + Toggle): hart 0.
  const clsInteraktion = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(clsInteraktion, 'CLS über Tastatur/Toggle muss 0 sein').toBe(0);

  // Scroll-Flüssigkeit unter Drossel (der Guide wird über viele Sektionen gemalt).
  t0 = Date.now();
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(600);
  expect(Date.now() - t0, 'Scrollen unter Drossel zu langsam').toBeLessThan(REAKTIONS_BUDGET);

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  const clsGesamt = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(clsGesamt, 'CLS über Toggle+Scroll über Budget').toBeLessThan(SCROLL_CLS_DECKEL);
  expect(fehler).toEqual([]);
});
