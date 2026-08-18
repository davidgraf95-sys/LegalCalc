// @shard-gruppe: 7
import { test, expect, type Page } from '@playwright/test';
import { ANSICHT_OEFFNER, warteLeserBereit } from './helpers/leserBereit';
import { ANSICHT_PANEL } from './helpers/leserBeschriftung';

// LINIEN-RÜCKBAU V1 — die Gliederungslinie im Lesetext bleibt weg.
//
// Entscheid David 13.8.2026 im Wortlaut: «ja linien ganz entfernen» (Variante V1,
// FAHRPLAN-GESETZESDARSTELLUNG-V2 §9.3 e). Vorgeschichte: die Linie wurde DREIMAL
// gebaut und DREIMAL live verworfen — A8 (5.7.2026), A28 (12.7.2026: «das mit den
// linien funktioniert überhaupt nicht»), PR #423 (3.8.2026: «eine einzige linie und
// unbrauchbar»). Jeder Anlauf drehte an der Schalter-/Schwellen-Logik über einer
// Mechanik, die strukturell nur EINE Linie auf EINER Ebene zeigen konnte.
//
// Diese Spec ist der Wächter gegen den vierten Anlauf. Sie deckt DREI Aussagen,
// jede einzeln rot zu bekommen:
//   1. NEGATIV — im Lesetext rendert keine Gliederungs-Sektion mehr eine linke
//      Kante, auch nicht am tiefsten Punkt des Korpus (ZGB Art. 684, Tiefe 5).
//   2. NEGATIV — die Steuer-Attribute der alten Mechanik sind fort: kein
//      `data-linien` am <html>, kein `data-guide-auto` am `.lc-leser`-Root.
//   3. POSITIV — was BEWUSST blieb, ist noch da: der Einzug staffelt die
//      Verschachtelung weiter (Rang 2 der Rangfolge DESIGN-REGLEMENT-NORMTEXT
//      §4b «Typo > Einzug»), und zwar dauerhaft statt abschaltbar. Ohne diese
//      Zeile könnte ein «Rückbau» den Fliesstext still flachziehen.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: der «Ansicht»-Trigger rendert nur der Client (nicht im Crawler-HTML).
  // Seit 17.8.2026 über die geteilte ATTRIBUT-Wartung: die frühere Rolle+Name-
  // Abfrage rechnete für jeden der 13 518 OR-Knöpfe den zugänglichen Namen aus
  // und riss unter 4× CPU-Drossel dieses 20-s-Budget 5/5 (Wurzel von Ä24).
  // Messreihe und Herleitung: `e2e/helpers/leserBereit.ts`. Budget und
  // Sachaussage unverändert (§6.3).
  await warteLeserBereit(page);
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);
}

/** Gliederungs-Sektionen über einem Artikel: wie viele tragen eine gerenderte
 *  linke Kante, wie viele einen Einzug? Gezählt werden nur `section`-Vorfahren
 *  innerhalb von `.lc-leser` — die Spalten-Trennlinien des 2-Spalten-Grids sind
 *  `div`s und bleiben aussen vor. */
async function sektionsKanten(page: Page, artId: string): Promise<{ sektionen: number; mitKante: number; mitEinzug: number }> {
  return page.evaluate((id) => {
    const wurzel = document.querySelector('.lc-leser');
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    let sektionen = 0;
    let mitKante = 0;
    let mitEinzug = 0;
    while (el && wurzel?.contains(el)) {
      if (el.tagName === 'SECTION') {
        sektionen++;
        const cs = getComputedStyle(el);
        const breite = parseFloat(cs.borderLeftWidth);
        if (cs.borderLeftStyle !== 'none' && breite > 0) mitKante++;
        if (parseFloat(cs.paddingLeft) > 0) mitEinzug++;
      }
      el = el.parentElement;
    }
    return { sektionen, mitKante, mitEinzug };
  }, artId);
}

test('ZGB Art. 684 (Tiefe 5): keine Gliederungslinie im Lesetext, Einzug bleibt', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/ZGB#art-684', 'art-684');

  const k = await sektionsKanten(page, 'art-684');
  expect(k.sektionen, 'Art. 684 steckt in Gliederungs-Sektionen').toBeGreaterThan(0);
  expect(k.mitKante, 'KEINE Sektion trägt mehr eine vertikale Gliederungslinie').toBe(0);
  expect(k.mitEinzug, 'der Einzug staffelt die Verschachtelung weiter (§4b Rang 2)').toBeGreaterThan(0);

  // Die Steuer-Attribute der alten Mechanik sind fort.
  await expect(page.locator('html')).not.toHaveAttribute('data-linien', /.*/);
  await expect(page.locator('.lc-leser').first()).not.toHaveAttribute('data-guide-auto', /.*/);
});

test('OR Art. 319 (Tiefe 4): keine Gliederungslinie, kein Schalter «Linien» im Ansicht-Menü', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/OR#art-319', 'art-319');

  expect((await sektionsKanten(page, 'art-319')).mitKante, 'OR ohne Gliederungslinie').toBe(0);

  // Auch der KLICK über das Attribut, nicht über Rolle+Name — DERSELBE
  // Mechanismus wie oben: jeder Klick-Versuch löst die Rolle+Name-Abfrage über
  // 13 518 Knöpfe NEU auf. Beobachtet 17.8.2026 in einem Lauf unter 8-Worker-Last:
  // «locator.click: Test timeout of 30000ms exceeded · waiting for
  // getByRole('button', {name: 'Ansicht'})», 7/10.
  // EHRLICHE EINSCHRÄNKUNG ZUR BEWEISLAGE: dieser 7/10-Wert ist KEIN saubereres
  // A/B — auf derselben Maschine liefen gleichzeitig drei fremde
  // Agenten-Sessions (Worktrees `LexMetrik-fix`, `-krume`, `-uebersicht`), und
  // Wiederholungen kippten die Arm-Reihenfolge (18/20 gegen 16/20, danach 10/20
  // gegen 17/20). Belastbar ist allein die prozessinterne Messung mit 4×
  // CPU-Drossel, zweimal gefahren: Rolle+Name 28.2–29.1 s (5/5 über dem
  // 20-s-Budget) gegen Attribut 17.8–19.9 s (0/5 über). Diese Zeile folgt also
  // dem GEMESSENEN Mechanismus, nicht einer Rate ohne Bedingung (§0 Ziff. 3c).
  // Sachaussage unverändert; der zugängliche Name des Öffners ist weiter in
  // `leser-kopf-a9.e2e.ts`/`leser-kopf-g2b.e2e.ts` gedeckt.
  await page.locator(ANSICHT_OEFFNER).first().click();
  const gruppe = page.locator(ANSICHT_PANEL).first();
  await expect(gruppe).toBeVisible();
  await expect(gruppe.getByRole('switch', { name: 'Linien' })).toHaveCount(0);
});
