// @shard-gruppe: 5
import { test, expect, type Page } from '@playwright/test';

// FAHRPLAN-GESETZESDARSTELLUNG-V2 — koordinierter Kopf-PR (A22/A23, David 10.7.2026):
//   · K-1  «in Kraft seit …» in der Meta-Zeile (Ur-Inkrafttreten, Fedlex
//          dateEntryInForce, build-time projiziert ⇒ CLS 0); nur Bund.
//   · K-2  Fussnoten-Bedienung — seit A26 (David 11.7.2026) EINTRAG im «Ansicht»-
//          Dropdown (Zähler N im Accessible-Name, role=switch); CLS 0 beim Toggle.
//   · B-1  «Entscheide»-Schalter im Ansicht-Dropdown blendet die BGE-Leitfall-
//          Auflistung aus (Facetten-Wahl im Dropdown «Rechtsprechung ▾»).
//   · B-2  Zeitraum-Wahl «alle · 20 · 10 · 5 J.» — ENTFALLEN mit W2·7-BEZUG/B5
//          (David 28.7.2026). An ihre Stelle tritt der Zeitstrahl mit
//          Von-Bis-Datum im Dropdown «Rechtsprechung ▾»
//          (`bezuege-zeitstrahl-b5.e2e.ts`); der Test unten prüft jetzt die
//          ABWESENHEIT der Alt-Steuerung — §6.3-Deklaration an Ort.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

async function ansichtOeffnen(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ansicht' }).first().click();
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible();
}

test('K-1: «in Kraft seit» in der Meta-Zeile (Bund), nicht beim Kanton', async ({ page }) => {
  // Bund BGBM: Ur-Inkrafttreten 01.07.1996 (Fedlex dateEntryInForce), distinkt vom Stand.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  const zeile = page.getByText(/in Kraft seit\s+01\.07\.1996/);
  await expect(zeile).toBeVisible({ timeout: 15000 });
});

test('K-2 (A26): Fussnoten-Eintrag im «Ansicht»-Dropdown — Zähler + Toggle (aria-checked), CLS 0', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  // A26 (David 11.7.2026): der frühere separate Fussnoten-Chip ist als EINTRAG ins
  // «Ansicht»-Dropdown gewandert — role=switch mit dem Zähler N im Accessible-Name
  // («Fussnoten (N)») und dem Zähler-Badge daneben. Menü öffnen und darauf zugreifen.
  await ansichtOeffnen(page);
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  const fn = gruppe.getByRole('switch', { name: /^Fussnoten \(\d+\)$/ }); // Zähler im Namen
  await expect(fn).toBeVisible({ timeout: 15000 });
  await expect(fn).toHaveAttribute('aria-checked', 'true'); // Default: Fussnoten an

  const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first();
  await expect(marker).toBeVisible();

  // CLS-Beobachter (nur künftige Shifts): der toggle-getriebene Reflow liegt binnen
  // 500 ms nach dem Klick (input-exkludiert) und darf 0 bleiben.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // AUS: Schalter aria-checked=false, data-fussnoten=aus, Marker verschwunden (display:none).
  await fn.click();
  await expect(fn).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(marker).toBeHidden();

  // AN zurück: Marker wieder sichtbar (Wiederherstellung).
  await fn.click();
  await expect(fn).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'an');
  await expect(marker).toBeVisible();

  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS über den Fussnoten-Toggle muss 0 sein').toBe(0);
});

// B-1/B-2 laufen bewusst auf dem KLEINEN ELG (~78 KB Snapshot, Leitfall-Shard mit
// BGE an Art. 10) statt auf dem 1686-Artikel-OR: dessen Client-Takeover starvte den
// gedrosselten 2-Kern-CI-Runner ins 30s-Timeout (CI-Run 29139277748, dieselbe Lehre
// wie leser-optionen → BGBM, CI-Befund 4.7.2026). Die Toggle-/Filter-Semantik ist
// seitengrössen-unabhängig (Attribut + CSS bzw. Store).
// §6.3-DEKLARATION (28.7.2026, W2·7-BEZUG/B4 — Vorgabe David «bezüge kann weg, nur
// auflistung wenn aktiviert»): Die V1a-Chip-Reihe mit der Overline «Leitfälle» und
// der Schalter «Entscheide» im Ansicht-Menü sind ENTFALLEN. Der Artikelfuss zeigt
// die facettierte Auflistung (Gruppenkopf «LEITENTSCHEIDE n von m»), gesteuert vom
// Dropdown «Rechtsprechung ▾»; ohne aktive Facette steht dort nichts. Die
// Nachführung ist Teil dieser deklarierten fachlichen Änderung — der geprüfte
// Sachverhalt bleibt, nur die Darstellung, an der er gemessen wird, ist neu.
test('B-1: die Facetten-Wahl blendet die Entscheid-Auflistung aus und wieder ein', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ELG', 'art-1');
  const art = page.locator('#art-10');
  await art.scrollIntoViewIfNeeded();
  // Grundzustand: eine Facette aktiv (Leitentscheide) ⇒ die Auflistung steht da.
  const gruppe = art.locator('[data-bezug-gruppe="bge"]');
  await expect(gruppe).toBeVisible({ timeout: 15000 });

  // AUS: letzte Facette abwählen ⇒ NICHTS unter dem Artikel. Anders als der
  // frühere CSS-Schalter versteckt das nicht bloss — es wird auch nichts geladen.
  await page.locator('[data-rechtsprechung-menu]').first().click();
  const bge = page.locator('[data-bezug-klasse="bge"]');
  await expect(bge).toHaveAttribute('aria-pressed', 'true'); // Default an
  await bge.click();
  await expect(art.locator('[data-bezuege-zeile]')).toHaveCount(0);

  // AN zurück: Auflistung wieder da.
  await bge.click();
  await expect(gruppe).toBeVisible({ timeout: 15000 });
});

// §6.3-DEKLARATION (deklarierte fachliche Änderung, kein Refactoring):
// Dieser Test mass die Stufen-Wahl «alle · 20 · 10 · 5 J.» im «Ansicht ▾»-Menü —
// eine Steuerung, die David am 28.7.2026 ausdrücklich ersetzt hat («zeitstrahl
// und datumseingabe anstatt 5 jahre 10 jahre usw.») und die seit B4 ohnehin auf
// nichts mehr wirkte: ihre einzige Verbraucherin, die `LeitfallZeile`, wird vom
// Reader nicht mehr bedient. Der Test wurde NICHT angepasst, damit er grün wird,
// sondern UMGEDREHT, weil sein Prüfgegenstand entfernt wurde. Was er einst
// sachlich absicherte (Auswahl wirkt, Auswahl persistiert), prüft jetzt
// `bezuege-zeitstrahl-b5.e2e.ts` am Nachfolger — strenger, weil dort auch die
// Wirkung auf die Auflistung und die Ehrlichkeit der Zähler mitläuft.
//
// Was hier BLEIBT, ist der Wächter gegen die Rückkehr: eine entfernte Steuerung,
// die niemand vermisst, schleicht sich beim nächsten Merge sonst wieder ein.
test('B-2: die Alt-Zeitraum-Wahl ist aus dem Ansicht-Menü ENTFERNT (B5)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ELG', 'art-1');
  await ansichtOeffnen(page);
  const panel = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(panel).toBeVisible();
  await expect(page.locator('[aria-label="Zeitraum der Entscheide"]')).toHaveCount(0);
  for (const label of ['20 J.', '10 J.', '5 J.']) {
    await expect(panel.getByRole('button', { name: label, exact: true })).toHaveCount(0);
  }
  // Die übrigen Streifen des Menüs stehen unverändert da — entfernt wurde genau
  // eine Steuerung, nicht das Menü.
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toBeVisible();
});
