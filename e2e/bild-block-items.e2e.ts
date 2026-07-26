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

test('DBG 22: fn 57 sitzt IM Rendite-Item des Formelbild-Blocks (B1-Riegel-Lockerung)', async ({ page }) => {
  // Nach der Riegel-Lockerung (Item-Slot existiert seit dem itemListe-Fix auch
  // auf Bild-Blöcken) routet pos {b:4,it:0,o:79} wieder inline: der Marker
  // klebt am Rendite-Item selbst — nicht mehr via Legacy-Fallback (absatz='3')
  // am Ende des Abs.-3-Fliesstexts, zwei Blöcke über der Zielstelle.
  // Genau EIN Marker im Artikel (kein Doppel-Rendering).
  await page.goto('/gesetze/bund/DBG#art-22')
  const art = page.locator('#art-22')
  await expect(art).toBeVisible()
  await art.scrollIntoViewIfNeeded()
  const fn57 = art.getByRole('button', { name: 'Fussnote 57' })
  await expect(fn57).toHaveCount(1)
  const renditeItem = art.locator('li', { hasText: 'Ist diese Rendite negativ oder null' })
  await expect(renditeItem).toHaveCount(1)
  await expect(renditeItem.getByRole('button', { name: 'Fussnote 57' })).toHaveCount(1)
})

test('STHG 7: Formelbild-Block zeigt Bild UND seine Items', async ({ page }) => {
  await page.goto('/gesetze/bund/STHG#art-7')
  const art = page.locator('#art-7')
  await expect(art).toBeVisible()
  await art.scrollIntoViewIfNeeded()

  await expect(
    art.getByText('Ist diese Rendite negativ oder null, so beträgt der Ertragsanteil null Prozent.'),
  ).toBeVisible()
  // fn 27 (pos {b:5,it:0,o:79}) routet nach der Riegel-Lockerung inline ins
  // Rendite-Item — genau einmal, kein Verlust, kein Doppel.
  const fn27 = art.getByRole('button', { name: 'Fussnote 27' })
  await expect(fn27).toHaveCount(1)
  await expect(
    art.locator('li', { hasText: 'Ist diese Rendite negativ oder null' }).getByRole('button', { name: 'Fussnote 27' }),
  ).toHaveCount(1)
})
