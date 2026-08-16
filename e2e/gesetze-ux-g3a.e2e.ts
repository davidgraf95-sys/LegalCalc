// @shard-gruppe: 4
import { test, expect, type Page } from '@playwright/test';

// W2·5d G3a — Per-Grundart-Darstellung im Gesetzes-Reader (FAHRPLAN §2.2):
// erlassTyp-Kopf-Label, KANTON §-Label (⑥, Anker bleibt #art-/R8),
// LIVE_VERWEIS-Verweiskarte (⑧). Der frühere aufbau-abhängige Linien-Default
// (U-LINIEN/A8, `data-guide-auto`) ist mit dem Linien-Rückbau V1 (16.8.2026,
// Entscheid David 13.8.2026) ersatzlos entfallen — die beiden A28-Fälle hier
// prüften genau ihn und sind mit ihm gestrichen (§6.3: deklariert).
// Reine Darstellung (§3) — die Grundart kommt zur Laufzeit aus dem Register
// (SSoT, §5), NICHT aus der BrowseErlass. Reader = prerendertes Crawler-HTML →
// auf den Client-Takeover warten, bevor geprüft wird.
async function warteKopf(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('.lc-leser > header, header').first()).toBeVisible({ timeout: 20000 });
}
async function warteReader(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
}

// ── erlassTyp-Kopf-Label (§5.1, behebt «Verordnung als Bundesgesetz») ──────────
test('Kopf-Label: Verordnung wird als «Verordnung» betitelt, nicht «Bundesgesetz» (VMWG)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/VMWG');
  const header = page.locator('.lc-leser > header');
  const overline = header.locator('.lc-overline').first();
  await expect(overline).toContainText('Verordnung');
  await expect(overline).not.toContainText('Bundesgesetz');
});

// CI-Härtung (§194-Muster, QS-PERF): der 935-KB/1686-Artikel-OR starvte den
// gedrosselten 2-Kern-Runner nahe an die 20-s-warteReader-Latte (16–19 s lokal
// unter Contention). Die Kopf-Label-Semantik («Bundesgesetz» für grundart GESETZ)
// ist seitengrössen-unabhängig → Umzug auf das kleine ELG (~50 KB), ebenfalls ein
// Bundesgesetz. Der OR-Fall bleibt im Linien-Kanon-Tor (check:linien-kanon) gegated.
test('Kopf-Label: Gesetz bleibt «Bundesgesetz» (ELG)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ELG');
  await expect(page.locator('.lc-leser > header .lc-overline').first()).toContainText('Bundesgesetz');
});

// ── ⑥ KANTON §-Label: sichtbares «§ N», Anker bleibt #art- (R8) ────────────────
test('KANTON §-Label: Body zeigt «§», Kopf zählt «Paragraphen», Anker bleibt #art- (AG-291.150)', async ({ page }) => {
  await warteReader(page, '/gesetze/kanton/AG-291.150');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-grundart', 'KANTON');
  // Sichtbares Bestimmungs-Label beginnt mit «§» (aus dem amtlichen Snapshot).
  const artLink = page.locator('.lc-leser article[id^="art-"] a.num[href^="#art-"]').first();
  await expect(artLink).toContainText('§');
  // KRITISCH (R8): der Anker-id bleibt art-<token> (opak), NIE par-.
  const ersteArt = page.locator('.lc-leser article[id^="art-"]').first();
  const id = await ersteArt.getAttribute('id');
  expect(id).toMatch(/^art-/);
  // Kopf-Zähl-Substantiv «Paragraphen» statt «Artikel».
  await expect(page.locator('.lc-leser > header').getByText(/\d+\s+Paragraphen/)).toBeVisible();
});

// ── ⑧ LIVE_VERWEIS: ehrliche Verweiskarte statt Fehlerseite (DSGVO) ────────────
test('LIVE_VERWEIS: Verweiskarte mit amtlichem Live-Link + ehrlichem Hinweis, keine Fehlerseite (DSGVO)', async ({ page }) => {
  await warteKopf(page, '/gesetze/bund/DSGVO');
  // Ehrlicher §8-Hinweis + prominenter amtlicher Link; KEINE «nicht verfügbar»-Fehlerseite.
  await expect(page.getByText(/nicht als In-App-Volltext gehostet/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Amtliche Fassung öffnen/i })).toBeVisible();
  await expect(page.getByText(/nicht als Volltext verfügbar/i)).toHaveCount(0);
});
