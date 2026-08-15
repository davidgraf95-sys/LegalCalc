// @shard-gruppe: 2
// W2·19-GLIEDERUNG/S10 — S8-Restpunkt, Bau-Spec §4.5 letzter Punkt: «Mobil:
// Trefferliste im bestehenden Such-Overlay unter dem Feld; Tap schliesst und
// springt.» Bis S10 stand die Trefferliste auf Mobil INLINE über der
// Lesespalte (drückte den Text nach unten); seit S10 schwebt sie als Overlay
// direkt unter dem Kopf und verschwindet + springt bei Tap auf einen Treffer.
//
// Leichter Referenz-Erlass (BGFA, wie leser-r1-r2.e2e.ts — vermeidet den
// dort belegten Flake-Herd «zweiter schwerer OR-Reader je Worker», §17).
import { test, expect, type Page } from '@playwright/test';

const LEICHT = '/gesetze/bund/BGFA';
const BEGRIFF = 'Berufsregeln';

const sucheKnopf = (page: Page) => page.getByRole('button', { name: 'Im Gesetz suchen' });
const sucheFeld = (page: Page) => page.getByRole('searchbox', { name: 'Im Gesetz suchen' });
const liste = (page: Page) => page.locator('[data-treffer-liste]');

async function oeffneMobil(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(LEICHT);
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
}

test.describe('W2·19-GLIEDERUNG/S10 — mobile Overlay-Trefferliste', () => {
  test('Liste schwebt unter dem Kopf, ohne den Lesetext zu verschieben', async ({ page }) => {
    await oeffneMobil(page);
    const artikelVorPos = await page.locator('#art-1').boundingBox();

    await sucheKnopf(page).click();
    await sucheFeld(page).fill(BEGRIFF);
    await expect(liste(page)).toBeVisible({ timeout: 20_000 });

    // Overlay, kein Fluss-Element: `position` ist fixed (Einzelansicht) oder
    // absolute (Pane) — nie `static`. Und der erste Artikel bleibt exakt dort,
    // wo er vor der Suche stand (kein Reflow durch eingeschobenen Inhalt).
    const position = await liste(page).evaluate((el) => {
      let n: HTMLElement | null = el as HTMLElement;
      while (n && getComputedStyle(n).position === 'static') n = n.parentElement;
      return n ? getComputedStyle(n).position : null;
    });
    expect(['fixed', 'absolute']).toContain(position);
    const artikelNachPos = await page.locator('#art-1').boundingBox();
    expect(artikelNachPos?.y).toBeCloseTo(artikelVorPos?.y ?? -1, 0);
  });

  test('Tap auf einen Treffer schliesst das Overlay UND springt zum Artikel', async ({ page }) => {
    await oeffneMobil(page);
    await sucheKnopf(page).click();
    await sucheFeld(page).fill(BEGRIFF);
    await expect(liste(page)).toBeVisible({ timeout: 20_000 });

    const ersterEintrag = liste(page).locator('[data-treffer-artikel]').first();
    const ziel = await ersterEintrag.getAttribute('data-treffer-artikel');
    await ersterEintrag.click();

    // «springt»: der Sprung-Blink markiert das Zielziel — abgefragt VOR dem
    // «schliesst»-Zustand, weil er nach 2.4 s wieder abklingt (ArtikelLeser-
    // Sprungmechanik, inhalt.tsx `lc-ziel-blink`) und ein Poll ihn sonst knapp
    // verpassen kann.
    await expect(page.locator(`#art-${ziel}.lc-ziel-blink`)).toHaveCount(1, { timeout: 20_000 });
    // «schliesst»: die Suche ist geleert, die Liste weg — kein Overlay bleibt
    // offen über dem Text stehen (Unterschied zur Desktop-Leiste, §4.5).
    await expect(sucheFeld(page)).toHaveValue('', { timeout: 20_000 });
    await expect(liste(page)).toHaveCount(0, { timeout: 20_000 });
  });
});
