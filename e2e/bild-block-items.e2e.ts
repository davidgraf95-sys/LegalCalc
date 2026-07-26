// Wächter (FN-5-Gegenprüfung R2, 26.7.2026): Bild-/Kachel-Blöcke, die zusätzlich
// `items` tragen, müssen Bild UND Aufzählung rendern. Vorbestehender main-Defekt:
// ArtikelBody kehrte bei bb.bild/bb.bildKacheln früh zurück und verschluckte die
// items — bei DBG Art. 22 und STHG Art. 7 hing die amtliche <dl> («Ist diese
// Rendite negativ oder null, so beträgt der Ertragsanteil null Prozent.») am
// Formelbild-Block und war im Reader unsichtbar (§1/§8: amtliche Substanz fehlt).
// Prüft am echten Reader (gebautes dist via vite preview).
import { test, expect } from '@playwright/test'

test('DBG 22: Formelbild-Block zeigt Bild UND seine lit./Ziff.-Items', async ({ page }) => {
  await page.goto('/gesetze/bund/DBG#art-22')
  const art = page.locator('#art-22')
  await expect(art).toBeVisible()
  await art.scrollIntoViewIfNeeded()

  // Das Formelbild bleibt da (kein Regressions-Tausch Bild gegen Items).
  await expect(art.locator('img[src*="bilder/dbg/image2"]')).toBeVisible()

  // Amtlicher Item-Wortlaut am zweiten Formelbild-Block (Ziff. 2 der Staffel).
  await expect(
    art.getByText('Ist diese Rendite negativ oder null, so beträgt der Ertragsanteil null Prozent.'),
  ).toBeVisible()
  // Item am ersten Formelbild-Block (Ziff. 2 zur Zinssatz-Formel).
  await expect(
    art.getByText('Ist dieser Zinssatz negativ oder null, so beträgt der Ertragsanteil null Prozent.'),
  ).toBeVisible()
})

test('STHG 7: Formelbild-Block zeigt Bild UND seine Items', async ({ page }) => {
  await page.goto('/gesetze/bund/STHG#art-7')
  const art = page.locator('#art-7')
  await expect(art).toBeVisible()
  await art.scrollIntoViewIfNeeded()

  await expect(
    art.getByText('Ist diese Rendite negativ oder null, so beträgt der Ertragsanteil null Prozent.'),
  ).toBeVisible()
})
