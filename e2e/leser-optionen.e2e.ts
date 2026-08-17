// @shard-gruppe: 5
import { test, expect, type Page } from '@playwright/test';

// W2·5d G2a — Leser-Options-Leiste: reine data-*-/CSS-Toggles am <html>,
// persistent (localStorage) + Pre-Paint (main.tsx, CSP-konform ohne
// Inline-Script). Belegt R6 (Grundzustand = heutige Darstellung, Toggle rein CSS)
// und R9/A1 (Fussnoten-«AUS» lässt Marker und Apparat VERSCHWINDEN, löscht sie
// nie — der Text bleibt im DOM). Positiv UND negativ (AN sichtbar ↔ AUS weg).
//
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten
// (die Options-Leiste existiert NUR im React-DOM = App-Ready-Marker), bevor
// geklickt wird. Erlass-Wahl: die Toggle-Semantik ist seitengrössen-unabhängig
// (Attribut + CSS) — die Toggles laufen darum auf dem KLEINEN BGBM
// (~22 KB Snapshot, 25 Fussnoten-Marker, 62 Verweis-Links), NICHT auf dem
// 1686-Artikel-OR: dessen Voll-Re-Render (Apparat-Toggle) + Ganzseiten-Style-
// Recalc starvten den gedrosselten CI-Runner ins 30s-Test-Timeout (CI-Befund
// 4.7.2026, Run 28711156193 — lokal auch mit 20×-CPU-Throttle nicht
// reproduzierbar).
//
// LINIEN-RÜCKBAU V1 (16.8.2026, Entscheid David 13.8.2026 «ja linien ganz
// entfernen»): der frühere dritte Schalter «Linien» und sein eigener Toggle-Fall
// (Guide sichtbar → transparent, Einzug kollabiert) sind ersatzlos gestrichen —
// sie prüften genau das entfernte Verhalten (§6.3: deklariert, kein Refactoring).
// Dass im Lesetext KEINE Gliederungslinie mehr erscheint, hält jetzt
// `leser-ohne-gliederungslinie.e2e.ts` fest.
//
// ── S1 · OPTIONEN-RÜCKBAU (deklarierte fachliche Änderung, §6.3) ─────────────
// Entscheid David F2 «ja» (16.8.2026): der Schalter «Verweise» ist ERSATZLOS
// GESTRICHEN. Sein Toggle-Fall («AUS unterdrückt die dotted Unterstreichung»)
// fällt mit ihm — er prüfte genau das entfernte Verhalten. Was der Schalter
// NICHT betraf, war ohnehin nie hier gedeckt und bleibt unverändert: Farbe,
// href, Klickbarkeit und Ctrl+F der Verweis-Links (`verweis-u.e2e.ts`).
// An seine Stelle im Menü tritt der zweiwertige Schalter «Änderungsvermerke»
// (F1) — die Zahl der Schalter bleibt damit ZWEI, ihre NAMEN ändern sich. Der
// Vertrag dieses Schalters liegt vollständig unter `hist-ansicht-w25i.e2e.ts`;
// hier wird nur die Bestückung des Menüs festgehalten.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: der «Ansicht»-Trigger (U-KOPF/A4) rendert nur der Client (nicht im
  // Crawler-HTML) — erst danach hängen die React-Handler.
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

// W2·5d U-KOPF/A4: die Switches liegen jetzt im «Ansicht»-Dropdown — vor jedem
// Switch-Zugriff öffnen. Das Panel (role=group) ist absolut positioniert (kein
// Layout-Shift der Seite) und trägt aria-label="Darstellungsoptionen".
async function ansichtOeffnen(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ansicht' }).first().click();
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible();
}

test('Options-Leiste: zwei role=switch (Fussnoten/Änderungsvermerke) — «Entscheide» via «Rechtsprechung ▾», «Linien» und «Verweise» entfallen', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  await ansichtOeffnen(page);
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible();
  // W2·7-BEZUG/B4 (Vorgabe David 28.7.2026): der frühere Schalter «Entscheide» ist
  // entfallen — er steuerte dieselbe Sache wie das Dropdown «Rechtsprechung ▾».
  // LINIEN-RÜCKBAU V1 (Entscheid David 13.8.2026): «Linien» ist ebenfalls entfallen,
  // die Gliederungslinie im Lesetext gibt es nicht mehr.
  // S1 (Entscheid David F2, 16.8.2026): «Verweise» ist gestrichen; an seine Stelle
  // tritt der zweiwertige «Änderungsvermerke». Bleiben zwei Schalter.
  await expect(gruppe.getByRole('switch')).toHaveCount(2);
  await expect(gruppe.getByRole('switch', { name: 'Linien' })).toHaveCount(0);
  // Negativ-Sonde gegen die Rückkehr: eine entfernte Steuerung, die niemand
  // vermisst, schleicht sich beim nächsten Merge sonst wieder ein.
  await expect(gruppe.getByRole('switch', { name: 'Verweise' })).toHaveCount(0);
  for (const name of ['Fussnoten', 'Änderungsvermerke']) {
    await expect(gruppe.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'true');
  }
  const html = page.locator('html');
  // Kein `data-linien` mehr am <html> — das Attribut existierte nur für die Linie.
  await expect(html).not.toHaveAttribute('data-linien', /.*/);
  // Und kein `data-verweise`: der Schalter ist weg, also darf auch die Weiche weg
  // sein — ein zurückgelassenes Attribut wäre der stille Rest, an dem eine
  // CSS-Regel später wieder anwachsen könnte.
  await expect(html).not.toHaveAttribute('data-verweise', /.*/);
  await expect(html).toHaveAttribute('data-fussnoten', 'an');
  await expect(html).toHaveAttribute('data-histansicht', 'an');
});

test('Fussnoten-Toggle: AN sichtbar → AUS VERSCHWINDEN (A1, David 5.7.2026), Text bleibt im DOM, kein CLS beim Toggle', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');

  // A1 (David 5.7.2026, überstimmt die frühere R9-Dämpfungs-Regel): Fussnoten bei
  // AUS VERSCHWINDEN visuell (display:none am `[data-fn-marker]`-Cluster und am
  // `[data-fn-apparat]`), statt nur gedämpft zu werden. Trade-off: die Marker-
  // Ziffern + Apparat-Texte verlassen Ctrl+F — NUR sie, nie der Normtext; der
  // Fussnotentext bleibt im DOM (`#fn-…`) und «Fussnoten AN» stellt alles wieder her.
  const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first();
  await expect(marker).toBeVisible({ timeout: 15000 });
  const nrText = (await marker.textContent())?.trim() ?? '';
  expect(nrText.length).toBeGreaterThan(0);

  // A4: Switches liegen im «Ansicht»-Dropdown — öffnen (absolut positioniert,
  // kein Layout-Shift der Seite), dann den CLS-Beobachter installieren.
  await ansichtOeffnen(page);

  // CLS-Beobachter INSTALLIEREN (NUR künftige Shifts, kein `buffered` — die
  // Lade-Shifts sind nicht Gegenstand des Toggle-Beweises), dann togglen: ein
  // toggle-getriebener Reflow liegt binnen 500 ms nach dem Klick (input-exkludiert)
  // und darf KEINEN CLS beitragen.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // NEGATIV: «Fussnoten» AUS → Marker + Apparat visuell WEG (display:none), aber
  // der Marker bleibt im DOM (Text abfragbar), niemals gelöscht.
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(marker).toBeHidden();
  expect(await marker.evaluate((el) => getComputedStyle(el).display)).toBe('none');
  // Text bleibt im DOM (Element existiert, Inhalt unverändert) — nur visuell weg.
  expect((await marker.textContent())?.trim()).toBe(nrText);
  await expect(page.locator('.lc-leser [data-fn-apparat]').first()).toBeHidden();

  // POSITIV zurück: «Fussnoten» AN → Marker wieder sichtbar (Wiederherstellung).
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'an');
  await expect(marker).toBeVisible();

  // CLS über beide Toggles == 0 (input-exkludiert): kein Layout-Sprung.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBe(0);
});

test('S1: die Verweis-Links behalten OHNE den Schalter alles, was sie tragen', async ({ page }) => {
  // ── ERSATZ für den gestrichenen «Verweise»-Toggle-Fall (§6.3, deklariert) ──
  // Der Schalter ist weg (F2), sein Toggle-Fall damit gegenstandslos. Was David
  // in F2 ausdrücklich zugesichert bekam, ist NICHT gegenstandslos: «Farbe,
  // Klickbarkeit und Ctrl+F bleiben in jedem Fall.» Genau das hält diese Zeile
  // fest — und sie ist strenger als der alte Fall, weil sie prüft, dass die
  // Unterstreichung bei :hover WEITER ERSCHEINT (der Wegfall der Option darf
  // nicht heissen, dass die Regel «aus» eingebrannt wurde).
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  // `a.decoration-dotted` und nicht `.decoration-dotted`: dieselbe Utility trägt
  // auch der Kopier-Knopf der Artikel-Nummer (`<button>`, kein href) — er stand
  // beim ersten Lauf dieser Fassung als erster Treffer da. Die Zusage aus F2
  // betrifft die VERWEIS-LINKS, also wird auf das Element gezielt, das eine
  // Adresse haben kann.
  const links = page.locator('.lc-leser [id^="art-"] a.decoration-dotted');
  const link = links.first();
  const anzahl = await links.count();
  test.skip(anzahl === 0, 'kein Verweis-Link auf dieser Seite');

  await link.scrollIntoViewIfNeeded();
  // POSITIV: :hover unterstreicht — unverändert das heutige Verhalten.
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain('underline');
  // Klickbarkeit/Anker: der Link trägt weiter ein Ziel.
  await expect(link).toHaveAttribute('href', /.+/);
  // Ctrl+F: der Verweis-Text ist sichtbarer Text, nicht versteckt.
  expect(((await link.textContent()) ?? '').trim().length).toBeGreaterThan(0);
  await expect(link).toBeVisible();
});
