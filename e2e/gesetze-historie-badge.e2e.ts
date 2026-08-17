// @shard-gruppe: 1
import { test, expect, type Page } from '@playwright/test';

// G-HIST-UI — «Gilt seit»-Badge + aufklappbare Fassungs-Timeline aus dem erlass-
// lokalen Historie-Shard (public/normtext/historie/<KEY>.json, G-HIST #286).
//   · Badge zeigt das In-Kraft-Datum der aktuellen Fassung eines Artikels mit
//     bekannter Historie (BGBM Art. 2 → «Gilt seit 01.01.2025»).
//   · Timeline klappt auf und listet die amtlichen Fassungs-Ereignisse.
//   · Artikel ohne Historie-Eintrag (BGBM Art. 6) → KEIN Badge (§8).
//   · Erlass ohne Shard (CISG, Staatsvertrag) → nirgends ein Badge.
//   · CLS: Timeline-Aufklappen (echter Input) verursacht keinen Shift; der
//     Badge-Einwuchs am Artikel-Fuss verschiebt nichts (§15.2, Reservierung).
//
// ── FLAKE-WURZEL (S1, 17.8.2026 — Fahrplan Kap. 14 weist diese Datei S1 zu) ───
// Die Datei stand als Flake auf der Liste. KEIN Timeout, KEINE Retry-Erhöhung —
// hier die Diagnose und der Wurzel-Fix (§17).
//
// REPRODUKTION (Messbedingung genannt, §0 Ziff. 3): lokal, macOS, 10 Kerne, WARM
// (dist gebaut, `vite preview` wiederverwendet).
//   · ganze Datei, volle Parallelität (5 Tests / 5 Worker):  1 von 10 Läufen ROT
//   · NUR dieser Test, isoliert:                             0 von 20 Läufen ROT
//   · isoliert unter CPU-Drossel 1× / 4× / 8×:               0 von 13, CLS stabil
//                                                            0.0058–0.0075
// Der Treiber ist also PARALLEL-LAST, nicht CPU-Tempo — und die Streuung ist
// bimodal (≈0.006 gegen 0.119), keine Wolke um die Schwelle.
//
// URSACHE (aus dem roten Lauf, Diagnose-Bericht des CLS-Helfers): der Test
// installierte den Beobachter mit `buffered: true` und rechnete damit ALLE
// Layout-Shifts seit der Navigation dem Badge zu. Der dominante Shift ist aber
// nicht der Badge, sondern der Reader-Kopf, der nach dem Client-Takeover seinen
// Inhalt einträgt: `⇑Wachser: header +161px→238, h1 +49px→75`, Quelle
// `div.flex.shrink-0 1121,71·135×24→680,71·576×24`. Dieser Reflow passiert in
// JEDEM Lauf (in 20 Sonden-Läufen als Δ0.0052 messbar). Er wird nur dann zu
// Δ0.1190, wenn die Artikelliste zu diesem Zeitpunkt SCHON GEMALT ist — dann
// liegt das 976×312 grosse Lese-Grid in seiner Wirkfläche. Ob sie gemalt ist,
// entscheidet die Parallel-Last. Der Badge selbst tauchte in keinem der Läufe
// unter den Top-Quellen auf: seine Höhe ist reserviert (`mt-4 min-h-hist-zeile`,
// ArtikelHistorie.tsx), er trägt ~0 bei.
//
// Das ist DIESELBE Fehlerklasse, die `helpers/cls.ts` am 20.7.2026 schon einmal
// behoben hat (Messfenster-Korrektur, `nurAbInstall`) — dort ausdrücklich für die
// A9-Interaktions-Tests, und für DIESEN Test damals bewusst NICHT: «für einen
// LADE-CLS-Test ist das genau richtig». Der Satz stimmt für ein Seiten-Budget,
// nicht für einen Badge-Test. Ein Tor, das das Falsche misst, ist schlimmer als
// keines (§6.7).
//
// WURZEL-FIX: die Messung deckt sich jetzt mit dem Prüfgegenstand. Der
// Historie-Shard wird per `page.route` ANGEHALTEN, bis der Reader fertig steht;
// erst dann läuft der Beobachter an, dann wird der Shard freigegeben. Gemessen
// wird also genau der Badge-Einwuchs. Das ist deterministisch (7/7 Sonden-Läufe
// inkl. 6× CPU-Drossel: CLS 0.00000) und STRENGER als vorher: zusätzlich zum
// Budget wird die Reservierung direkt geprüft — die y-Position der folgenden
// Artikel und die Seitenhöhe müssen EXAKT gleich bleiben. Nähme jemand
// `min-h-hist-zeile` weg, war der alte Test im Rauschen des Kopf-Reflows
// womöglich weiter grün; der neue ist sofort rot (rot gezeigt, §6.7).
//
// Das SEITEN-Lade-CLS bleibt gedeckt, und zwar dort, wo es hingehört: im
// Lighthouse-Tor `check:perf-budget` (CLS ≤ 0.05 auf OR + Startseite). Der
// Kopf-Reflow ist damit weiter bewacht — nur nicht mehr unter dem Namen des
// Badges. (Er ist ein echter Befund; als eigener Schritt gehört er in den Strang
// der Auslieferung, nicht in S1.)

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

test('Badge zeigt das In-Kraft-Datum der aktuellen Fassung (BGBM Art. 2)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  const art = page.locator('#art-2');
  await art.scrollIntoViewIfNeeded();
  const zeile = art.locator('[data-historie-zeile]');
  // Der Badge wächst mit dem idle-Shard-Resolve ein (below-fold).
  await expect(zeile).toBeVisible({ timeout: 15000 });
  await expect(zeile.getByText('Fassung', { exact: true })).toBeVisible();
  await expect(zeile.getByRole('button', { name: /Gilt seit\s+01\.01\.2025/ })).toBeVisible();
});

test('Timeline klappt auf und listet Fassungs-Ereignisse; Aufklappen ohne CLS', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  const art = page.locator('#art-2');
  await art.scrollIntoViewIfNeeded();
  const badge = art.getByRole('button', { name: /Gilt seit/ });
  await expect(badge).toBeVisible({ timeout: 15000 });
  await expect(badge).toHaveAttribute('aria-expanded', 'false');

  // CLS-Beobachter NUR für den Toggle (input-exkludiert → muss 0 bleiben, wie K-2).
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  await badge.click();
  await expect(badge).toHaveAttribute('aria-expanded', 'true');
  // Aufgeklappte Timeline: die Ereignis-Liste ist da und trägt ≥1 datierten Eintrag.
  const liste = art.locator('ol[id^="hist-"]');
  await expect(liste).toBeVisible();
  await expect(liste.locator('li').first()).toBeVisible();
  await expect(liste.getByText(/in Kraft seit\s+01\.01\.2025/).first()).toBeVisible();

  // Wieder einklappen.
  await badge.click();
  await expect(badge).toHaveAttribute('aria-expanded', 'false');
  await expect(liste).toBeHidden();

  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS über das Timeline-Auf-/Zuklappen muss 0 sein').toBe(0);
});

test('Artikel ohne Historie-Eintrag zeigt kein Badge (BGBM Art. 6)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-6');
  const art = page.locator('#art-6');
  await art.scrollIntoViewIfNeeded();
  // Shard ist geladen (Art. 2 hat ein Badge), aber Art. 6 trägt keinen Eintrag.
  await expect(page.locator('#art-2 [data-historie-zeile]')).toBeVisible({ timeout: 15000 });
  await expect(art.locator('[data-historie-zeile]')).toHaveCount(0);
});

test('Erlass ohne Historie-Shard zeigt nirgends ein Badge (CISG)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/CISG', 'art-1');
  // Kurz warten, damit ein etwaiger (hier 404-) Shard-Fetch sicher durch ist.
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-historie-zeile]')).toHaveCount(0);
});

test('Badge-Einwuchs verschiebt nichts: die Reservierung hält (§15.2)', async ({ page }) => {
  // Wurzel-Fix des bekannten Flakes — Diagnose und Messreihen am Datei-Kopf.
  //
  // Der Shard wird angehalten, damit der Einwuchs ein KONTROLLIERTES Ereignis ist
  // und nicht ein Rennen gegen den Seitenaufbau. Ohne dieses Anhalten kann der
  // Test nicht wissen, ob er den Badge oder den Kopf-Reflow gemessen hat.
  let freigabe: () => void = () => {};
  const angehalten = new Promise<void>((res) => { freigabe = res; });
  await page.route('**/normtext/historie/*.json', async (route) => {
    await angehalten;
    await route.continue();
  });

  await page.goto('/gesetze/bund/BGBM');
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  // Den Seitenaufbau ausklingen lassen: erst danach ist alles, was noch shiftet,
  // wirklich der Badge. `networkidle` deckt die übrigen Sidecars ab — mit KURZEM
  // eigenem Zeitfenster, denn der angehaltene Historie-Shard zählt als offene
  // Anfrage und lässt den Zustand nie eintreten. Ohne diese Grenze lief der Test
  // in den 30-s-Test-Timeout (Befund beim ersten Lauf dieser Fassung); der
  // `catch` allein fängt einen HÄNGER nicht, nur eine Ablehnung.
  await page.waitForLoadState('networkidle', { timeout: 3000 })
    .catch(() => { /* der Shard hängt absichtlich — erwarteter Fall */ });
  await page.waitForTimeout(700);

  // Der Badge ist NOCH NICHT da — sonst prüfte der Test einen bereits
  // abgeschlossenen Einwuchs (§6.7: ein Tor, das nicht scheitern kann).
  await expect(page.locator('[data-historie-zeile]')).toHaveCount(0);

  // Referenzgeometrie: die y-Position zweier FOLGENDER Artikel und die Seitenhöhe.
  // Genau sie darf der Einwuchs nicht bewegen — das ist die Zusage der
  // Reservierung, und sie ist exakt prüfbar statt nur budgetiert.
  const geometrie = () => page.evaluate(() => ({
    art2: Math.round(document.querySelector('#art-2')!.getBoundingClientRect().y),
    art3: Math.round(document.querySelector('#art-3')!.getBoundingClientRect().y),
    hoehe: Math.round(document.body.scrollHeight),
  }));
  const vorher = await geometrie();

  // Beobachter OHNE `buffered`: nur was ab jetzt shiftet, gehört dem Badge.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  freigabe();
  // POSITIV: der Einwuchs hat wirklich stattgefunden (sonst messen wir Stillstand).
  await expect(page.locator('#art-2 [data-historie-zeile]')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(600);

  const nachher = await geometrie();
  expect(nachher.art2, `Artikel 2 verschoben: ${vorher.art2} → ${nachher.art2}`).toBe(vorher.art2);
  expect(nachher.art3, `Artikel 3 verschoben: ${vorher.art3} → ${nachher.art3}`).toBe(vorher.art3);
  expect(nachher.hoehe, `Seitenhöhe gewachsen: ${vorher.hoehe} → ${nachher.hoehe}`).toBe(vorher.hoehe);

  // Und derselbe Sachverhalt in der Währung des Budgets — gemessen 0.00000 über
  // 7 Sonden-Läufe inkl. 6× CPU-Drossel. Die Schwelle bleibt die des
  // Lighthouse-Tors (0.05), die Zusicherung ist NICHT gelockert.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'der Badge-Einwuchs trägt CLS bei — die Reservierung greift nicht').toBeLessThan(0.05);
});
