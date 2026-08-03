import { test, expect, type Page } from '@playwright/test';

// W2·5d G3a — Per-Grundart-Darstellung im Gesetzes-Reader (FAHRPLAN §2.2):
// erlassTyp-Kopf-Label, aufbau-abhängiger Linien-Default (U-LINIEN/A8, data-guide-auto),
// KANTON §-Label (⑥, Anker bleibt #art-/R8), LIVE_VERWEIS-Verweiskarte (⑧).
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

/** Border-Left-Farbe der ersten Guide-Kante über einem Artikel (oder null). */
async function guideFarbe(page: Page, artId: string): Promise<string | null> {
  return page.evaluate((id) => {
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) return cs.borderLeftColor;
      }
      el = el.parentElement;
    }
    return null;
  }, artId);
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

// ── U-LINIEN/A8 + L-3: AUFBAU-abhängiger Linien-Default (data-guide-auto) ──────
// Davids A8-Befund («zgb sehr viele, arg fast keine») geheilt: der Auto-Default
// folgt dem TATSÄCHLICHEN Aufbau, nicht der grundart-Schublade. Geltende Regel ist
// seit dem David-Entscheid vom 3.8.2026 wieder L-3 (er hebt den A28-Rückzug vom
// 12.7. auf; Chronik #161 → L-3 → A28 → Reaktivierung im Kopf von linienAufbau.ts):
// die TIEFE deckelt den Auto-Guide NICHT — die ruhige Klasse ist allein «Dichte < 2»
// (dort wäre der EINE Guide ein Per-Artikel-Barcode statt einer Gruppierung).
// Deklarierte Verdikt-Änderung (§6.3), Quelle = David-Entscheid, nicht Testdruck.
// NEGATIV: dichte-armer Erlass bleibt ruhig; POSITIV: das flache Gesetz zeigt seine
// Ebene. Fixture STG (~104 KB, strukturTiefe 3, dichteAmGuide 1) bleibt der echte
// Ruhig-Fall der Regel — am 3.8.2026 gegen die Sidecars nachgemessen (unverändert
// tiefe 3 / dichte 1 ⇒ autoGuide false); das #210-Fixture BUEG (tiefe 3, dichte 4)
// wäre unter L-3 autoGuide=true und darum weiterhin KEIN Ruhig-Fall.
// ZGB/OR bleiben als Referenz-Verdikte im Aufbau-Tor (check:linien-kanon) über den
// vollen Korpus gegated.
test('U-LINIEN/L-3: dichte-armer Erlass STG bleibt im Auto-Default RUHIG (Guide transparent)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/STG#art-10');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-guide-auto', 'aus');
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'auto');
  await expect(page.locator('#art-10')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-10');
  expect(farbe, 'Guide-Container bleibt strukturell im DOM').not.toBeNull();
  expect(farbe).toBe('rgba(0, 0, 0, 0)'); // dichte < 2 → ruhig, Guide unsichtbar (L-3)
});

test('U-LINIEN: flaches Gesetz ArG zeigt seine Ebene im Auto-Default (Guide sichtbar)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ARG#art-9');
  await expect(page.locator('.lc-leser')).toHaveAttribute('data-guide-auto', 'an');
  await expect(page.locator('#art-9')).toBeVisible({ timeout: 20000 });
  const farbe = await guideFarbe(page, 'art-9');
  expect(farbe, 'ArG-Guide vorhanden').not.toBeNull();
  expect(farbe).not.toBe('rgba(0, 0, 0, 0)'); // flaches Gesetz → Ebene sichtbar
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
