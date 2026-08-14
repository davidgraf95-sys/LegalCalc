// @shard-gruppe: 1
// W2·10-UI-NAV/R1 + R2 — «Finden im Gesetz», NEUGESCHRIEBEN für
// W2·19-GLIEDERUNG/S8 (Bau-Spec fahrplaene/FAHRPLAN-W2-19-SEITENLEISTE.md §4,
// §10; Freigabe David 8.8.2026: «e2e-Anpassungen in deklarierten Commits
// erlaubt», Entscheid (a) — und Entscheid (c) für die Sache selbst).
//
// ─── WAS SICH ÄNDERT UND WARUM (deklariert, nicht beiläufig) ─────────────────
// R1 prüfte bis S8 einen Vertrag, den es nicht mehr gibt: «gemeldete Zahl ==
// DOM-sichtbare Fundstellen», gemessen an einer Lesespalte, die im Suchmodus
// nur die Treffer-Artikel zeigte. Seit S8 bleibt die Lesespalte vollständig,
// die Trefferliste steht in der Leiste, und der Zähler ist DATENSEITIG (§4.4):
//   1. «N Artikel · M Fundstellen» zählt den Erlass über alle sechs Feldklassen,
//      unabhängig von Ansicht-Schaltern.
//   2. Jeder Nicht-Fliesstext-Treffer trägt einen Herkunfts-Badge; bei
//      `data-fussnoten="aus"` mit dem Zusatz «(ausgeblendet)».
//   3. Gemalt wird nur, was malbar ist ⇒ «gemalte ≤ gezählte», nicht Gleichheit.
// Diese drei Sätze prüft die Datei jetzt. R2 (Bottom-Sheet, Quickjump) ist
// sachlich unverändert und nur auf einen leichten Erlass umgezogen.
//
// ─── §17-WURZELFIX DES FLAKE-HERDS (Messbedingung mitgenannt) ────────────────
// BEFUND, der zur Neuschrift führt (Kopf der Vorfassung, Messung 8.8.2026):
// alle sieben R1-Suchfälle scheiterten im CI-Lauf 31220026058 im ERSTVERSUCH an
// `[data-treffer-leiste]` (>20 s), jeder Retry grün. Die Signatur war
// «element(s) not found» und traf einen Desktop-OR-Suchfall ausnahmslos dann,
// wenn er NICHT der erste Test seines frischen Chromium-Workers war. Lokal (bis
// 20× CPU-Drossel, vier OR-Vorladungen im selben Browser) liess sich der
// Fehlschlag NICHT auslösen — er braucht die CI-Umgebung. Wurzel also: der
// ZWEITE schwere OR-Reader je Worker, nicht die Zahl gerenderter Treffer.
//
// Zwei Konsequenzen, beide hier eingebaut:
//  (a) MECHANIK LÄUFT AUF EINEM LEICHTEN ERLASS. BGFA: 40 Artikel, 10
//      Gliederungsknoten, 18 Fussnoten — trägt jede Fläche, die geprüft wird
//      (Baum, Trefferliste, Badges, Fussnoten-Toggle, Sheet), ohne den zweiten
//      schweren Reader je Worker. OR kommt genau EINMAL vor, als letzter Fall
//      der Datei, und nur für den Beweis, der ohne Grösse sinnlos wäre.
//  (b) JEDE DOM-MESSUNG IST EIN POLL, keine einmalige Lesung. Die belegte
//      Flake-Familie dieses Bestands sind einmalige `evaluate`-Lesungen ohne
//      Wartung; `expect.poll` misst dieselbe Aussage, wartet aber, statt zu
//      raten. Die Budgets bleiben bei 20 s — Anheben wäre Maskierung.
import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ timeout: 120_000 });

const inGesetzSuche = (page: Page) => page.getByRole('searchbox', { name: 'Im Gesetz suchen' });
const leiste = (page: Page) => page.locator('[data-treffer-leiste]');
const liste = (page: Page) => page.locator('[data-treffer-liste]');
const sheet = (page: Page) => page.locator('[data-gliederung-sheet]');

/** Leichter Referenz-Erlass der Mechanik (s. Kopf, (a)). */
const LEICHT = '/gesetze/bund/BGFA';
/** Begriff mit Treffern im Fliesstext UND im Randtitel (Badge «Randtitel»). */
const BEGRIFF = 'Berufsregeln';
/** Begriff, dessen Treffer im FUSSNOTEN-Apparat liegen (Badge «Fussnote»). */
const BEGRIFF_FN = 'Fassung';

/**
 * Unabhängiges Orakel für die MALBARE Menge (§0/2: der Test darf die Regel
 * nicht aus der Implementierung ableiten). Es zählt, was im Wortlaut der
 * Lesespalte wirklich markierbar ist:
 *   · nur innerhalb von `article[id^="art-"]`,
 *   · ohne `[data-such-meta]` (Bedienung: Zitat/Link, Verweis-Chips,
 *     Rechtsprechungs-Zeile, Historie-Slot),
 *   · ohne Fussnoten-MARKER (Verweiszeichen, kein Wortlaut — dieselben zwei
 *     Merkmale, mit denen index.css sie beim Schalter «Fussnoten aus» ausblendet),
 *   · ohne `display:none`-Teilbäume.
 * Der Vertrag von S8 lautet: diese Zahl ist eine TEILMENGE der datenseitig
 * gemeldeten — nie mehr.
 */
async function malbareFundstellen(page: Page, begriff: string): Promise<number> {
  return page.evaluate((b) => {
    const wurzel = document.querySelector('#lc-lesespalte');
    if (!wurzel) return -1;
    const nadel = b.toLowerCase();
    let n = 0;
    for (const art of wurzel.querySelectorAll('article[id^="art-"]')) {
      const w = document.createTreeWalker(art, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (node.nodeType === 1) {
            const el = node as Element;
            const marker = el.hasAttribute('data-fn-marker')
              || (el.tagName === 'BUTTON' && (el.getAttribute('aria-label') ?? '').startsWith('Fussnote'));
            if (el.hasAttribute('data-such-meta') || marker) return NodeFilter.FILTER_REJECT;
            return getComputedStyle(el).display === 'none'
              ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        const hay = (t.nodeValue ?? '').toLowerCase();
        let ab = 0;
        for (;;) { const i = hay.indexOf(nadel, ab); if (i < 0) break; n++; ab = i + nadel.length; }
      }
    }
    return n;
  }, begriff);
}

/** Gemeldete Fundstellen-Zahl aus dem Listenkopf (datenseitig, §4.4 Ziff. 1). */
async function gemeldet(page: Page): Promise<number> {
  const t = await leiste(page).innerText();
  return Number(t.match(/(\d+)\s+Fundstelle/)?.[1] ?? -1);
}

/** Zahl aus «i/n» der Positionsanzeige. */
async function position(page: Page): Promise<{ i: number; n: number }> {
  const t = await page.locator('[data-treffer-position]').innerText();
  const [i, n] = t.split('/').map((s) => Number(s.trim()));
  return { i, n };
}

/** Grösse der gemalten Highlight-Menge (CSS Custom Highlight API). */
const gemalt = (page: Page) => page.evaluate(() => {
  const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS?.highlights;
  return reg?.get('lc-such-treffer')?.size ?? 0;
});

function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('pageerror', (e) => fehler.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') fehler.push(`console.error: ${msg.text()}`); });
  return fehler;
}

/** Reader öffnen und auf den ersten Artikel warten (EIN Ort für das Budget). */
async function oeffneLeser(page: Page, pfad: string, breite = 1440, hoehe = 900) {
  await page.setViewportSize({ width: breite, height: hoehe });
  await page.goto(pfad);
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
  // B9 (Bug-Check §9 zu S8) — SIDECAR-RACE, deklarierte Härtung, KEIN
  // Assertion-Change (§6.3): `#art-1` steht, sobald der Snapshot da ist; der
  // Suchindex speist sich aber ZUSÄTZLICH aus dem parallel geladenen
  // Struktur-Sidecar (Randtitel, Gliederungspfad). Wer dazwischen misst, sieht
  // eine halbe Datenlage — der Zähler für «Berufsregeln» springt am BGFA von 6
  // auf 17, und weil fünf Fälle ihn EINMALIG einfrieren, gab das ein 20-s-Rot
  // mit grünem Retry: genau die Flake-Klasse, die die Neuschrift dieser Datei
  // per §17 schliessen sollte.
  // GEWARTET WIRD AUF `[data-sek]` (Sektionskopf im FLIESSTEXT), NICHT auf
  // `[data-sektion-id]` (Gliederungs-Zeile in der Leiste): die Leiste ist
  // breitenabhängig: bei Mobil-Viewport lebt sie im Bottom-Sheet und ist
  // ungemountet, solange das Sheet zu ist — ein Wartepunkt dort hängt in genau
  // den R2-Fällen, die das Sheet erst öffnen wollen (hier beim Bau gemessen).
  // Der Sektionskopf im Fliesstext speist sich aus demselben Sidecar, steht in
  // jeder Breite und ist damit das breitenneutrale Signal.
  await page.locator('[data-sek]').first().waitFor({ timeout: 20_000 });
}

// ── CLS-Beobachter, GESCOPT auf die R1/R2-Flächen (Reader-Wurzel `.lc-leser`,
// Gliederungs-Sheet, Trefferliste). Grund (§0/3 «Verteilung statt Einzelwert»,
// Nullprobe 4.8.2026): auf /gesetze/bund/BV @390 unter 6× Drossel fällt schon
// OHNE JEDE Interaktion ein input-freier Shift von ~0.00157 an — Quelle ist der
// rechte Bedien-Cluster der TOPBAR, nicht der Reader; der Wert war zwischen
// Nullprobe und Interaktionslauf byte-identisch. Fremde Shifts werden
// mitprotokolliert, aber nicht dieser Bau-Einheit zugerechnet.
async function clsBeobachten(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __cls: number; __clsQuellen: string[]; __clsFremd: number; __clsFremdQ: string[] };
    w.__cls = 0; w.__clsQuellen = []; w.__clsFremd = 0; w.__clsFremdQ = [];
    const eigen = (n: Element | null | undefined) =>
      !!n?.closest('.lc-leser, [data-gliederung-sheet], [data-treffer-liste]');
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const s = e as unknown as { value: number; hadRecentInput: boolean; sources?: { node?: Element | null }[] };
        if (s.hadRecentInput) continue;
        const quellen = s.sources ?? [];
        const namen = quellen.map((q) => q.node
          ? `${q.node.tagName}${q.node.id ? `#${q.node.id}` : ''}.${String(q.node.className).slice(0, 60)}`
          : '(ohne Knoten)');
        // Ohne Attribution konservativ als EIGEN werten (nie stillschweigend fallen lassen).
        if (quellen.length === 0 || quellen.some((q) => eigen(q.node))) {
          w.__cls += s.value; w.__clsQuellen.push(...namen);
        } else {
          w.__clsFremd += s.value; w.__clsFremdQ.push(...namen);
        }
      }
    }).observe({ type: 'layout-shift' });
  });
}
const clsLesen = (page: Page) => page.evaluate(() => {
  const w = window as unknown as { __cls: number; __clsQuellen: string[]; __clsFremd: number; __clsFremdQ: string[] };
  return { cls: w.__cls, quellen: w.__clsQuellen, fremd: w.__clsFremd, fremdQ: w.__clsFremdQ };
});

test.describe('S8 — Trefferliste in der Leiste, Lesespalte vollständig', () => {
  test('Die Liste steht in Zone B des [data-toc] und ersetzt dort den Baum — der Gesetzestext bleibt ganz', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await oeffneLeser(page, LEICHT);

    // Ausgangslage: Baum da, keine Liste, voller Text.
    await expect(page.locator('[data-sektion-id]').first()).toBeVisible({ timeout: 20_000 });
    await expect(liste(page)).toHaveCount(0);
    const artikelVorher = await page.locator('article[id^="art-"]').count();
    expect(artikelVorher, 'BGFA-Volltext steht vor der Suche').toBeGreaterThan(30);

    await inGesetzSuche(page).fill(BEGRIFF);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    // GENAU EINE Liste, und sie liegt im [data-toc]-Scroller (Zone B).
    await expect(liste(page)).toHaveCount(1);
    await expect(liste(page).locator('xpath=ancestor::*[@data-toc]')).toHaveCount(1);
    // Der Baum tritt zurück, solange gesucht wird …
    await expect(page.locator('[data-toc] [data-sektion-id]')).toHaveCount(0);
    // … und die LESESPALTE bleibt vollständig (Entscheid David (c) 8.8.2026):
    // die Zahl der Artikel im Wortlaut ändert sich durch die Suche nicht mehr.
    await expect.poll(async () => page.locator('article[id^="art-"]').count(), { timeout: 20_000 })
      .toBe(artikelVorher);

    // Jeder Eintrag nennt Artikel-Label, Fundstellenzahl und Textausschnitt.
    const eintraege = liste(page).locator('[data-treffer-artikel]');
    await expect.poll(async () => eintraege.count(), { timeout: 20_000 }).toBeGreaterThan(0);
    const zahlen = await eintraege.evaluateAll(
      (els) => els.map((e) => Number(e.getAttribute('data-fundstellen-zahl'))));
    expect(zahlen.every((n) => Number.isInteger(n) && n > 0), `Fundstellen je Artikel: ${zahlen}`).toBe(true);
    // Die Summe der Einträge deckt sich mit dem Kopf-Zähler (EINE Quelle, §5).
    expect(await gemeldet(page), 'Kopf-Zähler vs. Summe der Einträge')
      .toBe(zahlen.reduce((a, b) => a + b, 0));
    // Ausschnitt mit hervorgehobenem Begriff (Entscheid c: «mit Textausschnitten»).
    await expect(liste(page).locator('.lc-such-ausschnitt mark').first()).toBeVisible();

    // Suche verlassen ⇒ Baum zurück, Liste weg, Highlight weg.
    await inGesetzSuche(page).fill('');
    await expect(liste(page)).toHaveCount(0, { timeout: 20_000 });
    await expect(page.locator('[data-toc] [data-sektion-id]').first()).toBeVisible({ timeout: 20_000 });
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBe(0);
    expect(fehler).toEqual([]);
  });

  test('§4.4 — der Zähler ist datenseitig, und gemalt wird höchstens, was gezählt ist', async ({ page }) => {
    await oeffneLeser(page, LEICHT);
    await inGesetzSuche(page).fill(BEGRIFF);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    const gezaehlt = await gemeldet(page);
    expect(gezaehlt, 'gemeldete Fundstellen').toBeGreaterThan(0);

    // (1) Die MALBARE Menge im Wortlaut ist eine Teilmenge der gezählten —
    //     nicht mehr Gleichheit (§4.4 Ziff. 3): Gliederungspfad, Bild-Alt und
    //     nachrangige Randtitel werden gezählt, aber nie gemalt.
    await expect.poll(async () => malbareFundstellen(page, BEGRIFF), { timeout: 20_000 })
      .toBeLessThanOrEqual(gezaehlt);
    // (2) … und die tatsächlich gesetzte Highlight-Menge erst recht (sie deckt
    //     nur das Sichtband, §4.5 artikelweise on demand).
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBeLessThanOrEqual(gezaehlt);

    // (3) Der Zähler hängt NICHT an der Ansicht: derselbe Wert bei
    //     ein- und ausgeschaltetem Fussnoten-Apparat. Genau das war mit dem
    //     alten Gleichheits-Vertrag unmöglich.
    await page.evaluate(() => { document.documentElement.dataset.fussnoten = 'aus'; });
    await expect.poll(async () => gemeldet(page), { timeout: 20_000 }).toBe(gezaehlt);
    await page.evaluate(() => { document.documentElement.dataset.fussnoten = 'an'; });
    await expect.poll(async () => gemeldet(page), { timeout: 20_000 }).toBe(gezaehlt);
  });

  test('§4.5 — was ins Sichtband scrollt, leuchtet mit (artikelweises Highlight)', async ({ page }) => {
    // Der Beweis für den IntersectionObserver-Pfad, und zwar OHNE Sprung: der
    // Sprung malt sein Ziel selbst, er würde die Frage also nicht beantworten
    // (§6.7 — ein Tor, das nicht scheitern kann, ist gefährlicher als keines).
    // Hier wird nur GESCROLLT.
    await oeffneLeser(page, LEICHT);
    await inGesetzSuche(page).fill(BEGRIFF);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    const token = await liste(page).locator('[data-treffer-artikel]').first()
      .getAttribute('data-treffer-artikel');
    await page.locator(`#art-${token}`).scrollIntoViewIfNeeded();
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBeGreaterThan(0);

    // Und wieder weg vom Treffer: die Markierung bleibt nicht als Karteileiche
    // an einem Artikel hängen, den niemand mehr sieht.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBe(0);
  });

  test('§4.4 — Herkunfts-Badges sagen, warum ein Artikel trifft, und wann die Stelle ausgeblendet ist', async ({ page }) => {
    await oeffneLeser(page, LEICHT);
    await inGesetzSuche(page).fill(BEGRIFF_FN);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    // «Fassung» trifft im BGFA im Fussnoten-Apparat ⇒ Badge «Fussnote».
    const badges = liste(page).locator('[data-treffer-badge]');
    await expect.poll(async () => badges.count(), { timeout: 20_000 }).toBeGreaterThan(0);
    await expect(badges.filter({ hasText: /^Fussnote$/ }).first()).toBeVisible({ timeout: 20_000 });

    // Apparat ausblenden: der Badge sagt es AUSDRÜCKLICH — die Ansicht wird
    // beim Sprung nicht still umgeschaltet (§4.4 Ziff. 2, §8).
    await page.evaluate(() => { document.documentElement.dataset.fussnoten = 'aus'; });
    await expect(badges.filter({ hasText: 'Fussnote (ausgeblendet)' }).first())
      .toBeVisible({ timeout: 20_000 });
    // Und der Badge ist SICHTBARER Text, nicht nur ein `title` (Touch/Screenreader).
    await expect(liste(page)).toContainText('(ausgeblendet)');
    await page.evaluate(() => { document.documentElement.dataset.fussnoten = 'an'; });
    await expect(badges.filter({ hasText: 'Fussnote (ausgeblendet)' })).toHaveCount(0, { timeout: 20_000 });
  });

  test('↑↓ springt zyklisch durch die Fundstellen (Tastatur + 44-px-Tap-Ziele)', async ({ page }) => {
    await oeffneLeser(page, LEICHT);
    await inGesetzSuche(page).fill(BEGRIFF);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    const vor = page.locator('[data-treffer-vor]');
    const zurueck = page.locator('[data-treffer-zurueck]');
    const pos = page.locator('[data-treffer-position]');
    await expect(vor).toBeVisible({ timeout: 20_000 });

    // A9-DoD Tap-Ziele: beide Knöpfe mindestens 44×44 px.
    for (const knopf of [vor, zurueck]) {
      const box = await knopf.boundingBox();
      expect(box!.width, 'Tap-Ziel Breite').toBeGreaterThanOrEqual(44);
      expect(box!.height, 'Tap-Ziel Höhe').toBeGreaterThanOrEqual(44);
    }

    // Vor der ersten Navigation: «–/n» (nichts Erfundenes, §8).
    await expect(pos).toContainText('–');
    await vor.click();
    await expect(pos).toContainText(/^1\//);
    await vor.click();
    await expect(pos).toContainText(/^2\//);
    await zurueck.click();
    await expect(pos).toContainText(/^1\//);
    // Zyklisch: von der ersten zurück auf die letzte.
    await zurueck.click();
    await expect.poll(async () => { const p = await position(page); return p.i === p.n; }, { timeout: 20_000 }).toBe(true);
    // Tastatur: die Knöpfe sind echte <button> und per Enter bedienbar.
    await vor.focus();
    await page.keyboard.press('Enter');
    await expect(pos).toContainText(/^1\//);
    // Der Sprung markiert seinen Ziel-Artikel im Wortlaut (kein DOM-Umbau).
    await expect.poll(async () => page.locator('article.lc-ziel-blink').count(), { timeout: 20_000 })
      .toBeGreaterThan(0);
  });

  test('Ein Treffer-Klick springt in den vollständigen Text — und lässt die Suche stehen (§4.5)', async ({ page }) => {
    await oeffneLeser(page, LEICHT);
    const artikelVorher = await page.locator('article[id^="art-"]').count();
    await inGesetzSuche(page).fill(BEGRIFF);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });

    const ersterEintrag = liste(page).locator('[data-treffer-artikel]').first();
    const token = await ersterEintrag.getAttribute('data-treffer-artikel');
    await ersterEintrag.getByRole('button').first().click();

    // Ziel steht im Sichtbereich, der Wortlaut ist unverändert vollständig …
    await expect(page.locator(`#art-${token}`)).toBeInViewport({ timeout: 20_000 });
    await expect.poll(async () => page.locator('article[id^="art-"]').count(), { timeout: 20_000 })
      .toBe(artikelVorher);
    // … und die Suche lebt weiter: Feld gefüllt, Liste da, Markierung gesetzt.
    await expect(inGesetzSuche(page)).toHaveValue(BEGRIFF);
    await expect(liste(page)).toHaveCount(1);
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBeGreaterThan(0);
  });

  test('Ohne aktive Suche kein Zähler, keine Tasten, kein Highlight — Normtext-DOM unverändert', async ({ page }) => {
    await oeffneLeser(page, LEICHT);
    // Signatur des WORTLAUTS: Artikel-Id + Textlänge OHNE die
    // `[data-such-meta]`-Teilbäume. Diese Ausklammerung ist keine Aufweichung,
    // sondern die Bedingung dafür, dass die Aussage überhaupt eine ist: unter
    // dem Artikel laufen idle geladene Shards nach (Rechtsprechungs-Bezüge,
    // Fassungs-Historie) und verlängern seinen Text — im ersten Lauf gemessen
    // art-1 197 → 243 Zeichen, ohne jede Beteiligung der Suche. Der Test würde
    // sonst das Nachladen messen statt den Suchmodus. Genau diese Nachlade-
    // Flächen tragen seit S8 `data-such-meta` (sie sind Referenzschicht, kein
    // Gesetzestext), also gibt es dafür bereits die richtige Marke.
    const signatur = () => page.evaluate(() => {
      const arts = [...document.querySelectorAll('article[id^="art-"]')].slice(0, 25);
      const wortlaut = (a: Element) => {
        let n = 0;
        const w = document.createTreeWalker(a, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
          acceptNode(k) {
            if (k.nodeType !== 1) return NodeFilter.FILTER_ACCEPT;
            return (k as Element).hasAttribute('data-such-meta')
              ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
          },
        });
        for (let t = w.nextNode(); t; t = w.nextNode()) n += (t.nodeValue ?? '').length;
        return n;
      };
      return arts.map((a) => `${a.id}|${wortlaut(a)}`).join('~');
    });
    const vorher = await signatur();
    await expect(leiste(page)).toHaveCount(0);
    await expect(page.locator('[data-treffer-vor]')).toHaveCount(0);

    await inGesetzSuche(page).fill(BEGRIFF);
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    await page.locator('[data-treffer-vor]').click();
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBeGreaterThan(0);

    await inGesetzSuche(page).fill('');
    await expect(leiste(page)).toHaveCount(0, { timeout: 20_000 });
    await expect.poll(async () => gemalt(page), { timeout: 20_000 }).toBe(0);
    // Der Wortlaut-Baum ist derselbe wie vor der Suche (reine Render-Schicht).
    await expect.poll(async () => signatur(), { timeout: 20_000 }).toBe(vorher);
  });
});

test.describe('R2 — Mobile Gliederung als volles Bottom-Sheet', () => {
  test('Sheet ist unten angeschlagen, füllt die Höhe, trägt «Sie sind hier» + Quickjump', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await oeffneLeser(page, LEICHT, 390, 844);

    await page.getByRole('button', { name: /Gliederung/ }).first().click();
    await expect(sheet(page)).toBeVisible({ timeout: 20_000 });

    // Bottom-Sheet: unten am Viewport verankert (Daumenzone) und deutlich höher
    // als der frühere 60-vh-Drawer, der oben klebte.
    const box = (await sheet(page).boundingBox())!;
    expect(Math.abs(box.y + box.height - 844), 'Sheet ist unten angeschlagen').toBeLessThan(2);
    expect(box.height, 'volle Höhe der Daumenzone').toBeGreaterThan(844 * 0.7);

    // aria: echter modaler Dialog mit Namen.
    await expect(sheet(page)).toHaveAttribute('role', 'dialog');
    await expect(sheet(page)).toHaveAttribute('aria-modal', 'true');
    await expect(sheet(page)).toHaveAttribute('aria-label', 'Gliederung');

    // «Sie sind hier» ist da und benennt die Leseposition (nichts Erfundenes).
    await expect(page.locator('[data-sie-sind-hier]')).toBeVisible();
    await expect(page.locator('[data-sie-sind-hier]')).toContainText('Sie sind hier');

    // Quickjump «Art. N» steht ZUOBERST (über dem Baum).
    const feld = page.getByRole('textbox', { name: 'Zu Artikel springen' });
    await expect(feld).toBeVisible();
    const feldBox = (await feld.boundingBox())!;
    const baumBox = (await sheet(page).getByRole('list').first().boundingBox())!;
    expect(feldBox.y, 'Quickjump über dem Gliederungsbaum').toBeLessThan(baumBox.y);

    // Schliessen-Knopf ist ein 44-px-Tap-Ziel.
    const zu = page.getByRole('button', { name: 'Gliederung schliessen' });
    const zuBox = (await zu.boundingBox())!;
    expect(zuBox.width).toBeGreaterThanOrEqual(44);
    expect(zuBox.height).toBeGreaterThanOrEqual(44);

    // Esc schliesst (Tastatur-Bedienbarkeit, useDialogFokus).
    await page.keyboard.press('Escape');
    await expect(sheet(page)).toHaveCount(0, { timeout: 10_000 });
    expect(fehler).toEqual([]);
  });

  test('Quickjump springt deterministisch zum Artikel — Unbekanntes wird ehrlich abgelehnt', async ({ page }) => {
    await oeffneLeser(page, LEICHT, 390, 844);
    await page.getByRole('button', { name: /Gliederung/ }).first().click();
    await expect(sheet(page)).toBeVisible({ timeout: 20_000 });

    const feld = page.getByRole('textbox', { name: 'Zu Artikel springen' });
    // Unbekannter Artikel: KEIN Sprung, sondern ein ehrlicher Hinweis (§8).
    await feld.fill('Art. 99999');
    await feld.press('Enter');
    await expect(page.getByRole('alert')).toContainText(/gibt es in diesem Erlass nicht/);
    await expect(sheet(page)).toBeVisible();

    // Bekannter Artikel (mit «Art.»-Präfix + Punkt): Sprung + Sheet zu.
    await feld.fill('Art. 12');
    await feld.press('Enter');
    await expect(page.locator('#art-12')).toBeInViewport({ timeout: 20_000 });
  });

  test('Desktop-TOC-Kopf trägt denselben Quickjump-Baustein (§5)', async ({ page }) => {
    await oeffneLeser(page, LEICHT);
    const feld = page.getByRole('textbox', { name: 'Zu Artikel springen' });
    await expect(feld).toBeVisible({ timeout: 20_000 });
    // Genau EINES (kein Doppel aus Sheet + Spalte).
    await expect(feld).toHaveCount(1);
    // W2·19-GLIEDERUNG/S4 — deklarierte Umkehrung EINER Assertion (Bau-Spec §2,
    // e2e-Freigabe David 8.8.2026). Bisher stand hier: das Feld liegt im
    // TOC-Kopf, aber NICHT im [data-toc]-Scroller — mit der Begründung «bleibt
    // beim Blättern stehen». Seit S4 bildet es zusammen mit der «Sie sind
    // hier»-Pfadzeile die Zone A und klebt sticky INNERHALB des Scrollers. Die
    // GEPRÜFTE EIGENSCHAFT bleibt dieselbe und wird sogar strenger: das Feld
    // bleibt beim Blättern stehen — vorher als «ausserhalb des Scrollers»
    // behauptet, jetzt als `position: sticky` BEWIESEN.
    await expect(feld.locator('xpath=ancestor::aside')).toHaveCount(1);
    await expect(feld.locator('xpath=ancestor::*[@data-toc]')).toHaveCount(1);
    const zoneA = feld.locator('xpath=ancestor::*[@data-toc-zone-a]');
    await expect(zoneA).toHaveCount(1);
    expect(await zoneA.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');

    await feld.fill('12');
    await feld.press('Enter');
    await expect(page.locator('#art-12')).toBeInViewport({ timeout: 20_000 });
  });
});

test.describe('A9-DoD — Flüssigkeit unter CPU-Drossel 6×', () => {
  test('Suche, Fundstellen-Sprung und Gliederungs-Sheet ohne Layout-Shift (CLS 0)', async ({ page }) => {
    test.slow();
    const fehler = fehlerSammeln(page);
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });

    // BV statt OR: gemessen wird der LAYOUT-SHIFT der R1/R2-Flächen, nicht die
    // Rebuild-Dauer eines grossen Baums. Die BV trägt dieselben Flächen
    // (Gliederung, Trefferliste, Sheet) in bedienbarer Grösse.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gesetze/bund/BV');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 40_000 });
    await clsBeobachten(page);

    // Mobil (< sm) trägt der Inhalts-Kopf nur das Such-ICON (A35, David 19.7.2026);
    // es öffnet das Feld als Overlay über der Zeile. Erst danach ist die searchbox da.
    await page.getByRole('button', { name: 'Im Gesetz suchen' }).click();

    // 1 · Suchmodus betreten. Seit S8 wächst dabei NICHTS mehr in den Fluss:
    //     Zähler und Ausschnitte kommen datenseitig, die Lesespalte bleibt stehen.
    await inGesetzSuche(page).fill('Kanton');
    await expect(leiste(page)).toBeVisible({ timeout: 40_000 });
    await page.waitForTimeout(900);

    // 2 · Zwei Fundstellen-Sprünge (reines Scrollen, kein Reflow).
    const vor = page.locator('[data-treffer-vor]');
    await vor.click();
    await vor.click();
    await page.waitForTimeout(900);

    // 3 · Suchmodus verlassen. Mobil über das ✕ des Such-Overlays (leert UND
    //     schliesst, wie der Nutzer es tut).
    await page.getByRole('button', { name: 'Suche schliessen' }).click();
    await expect(leiste(page)).toHaveCount(0, { timeout: 40_000 });
    await page.waitForTimeout(900);

    // 4 · Gliederungs-Sheet auf und zu (Overlay, aus dem Fluss).
    await page.getByRole('button', { name: /Gliederung/ }).first().click();
    await expect(sheet(page)).toBeVisible({ timeout: 40_000 });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'Gliederung schliessen' }).click();
    await expect(sheet(page)).toHaveCount(0, { timeout: 20_000 });
    await page.waitForTimeout(900);

    const { cls, quellen, fremd, fremdQ } = await clsLesen(page);
    expect(cls, `Input-freier Layout-Shift der R1/R2-Flächen — Quellen: ${quellen.join(' | ') || '—'}`
      + ` (fremd, nicht zugerechnet: ${fremd} · ${fremdQ.join(' | ') || '—'})`).toBe(0);

    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    expect(fehler).toEqual([]);
  });
});

// ── Der EINZIGE OR-Fall dieser Datei, bewusst am Ende (Kopf, (a)) ────────────
// Er prüft, was nur an einem grossen Erlass prüfbar ist: dass der Suchmodus den
// Volltext-Baum NICHT mehr abräumt. Der Ein- und Ausstieg aus der Suche war bis
// S8 der teuerste Commit des Readers (1686 Artikel-Knoten neu mounten, gemessen
// ~2,4 s ohne Drossel bis 21,9 s bei 8×) — genau die Latenz, an der die
// Vorfassung dieser Datei im CI reihum hängenblieb. Fällt der Beweis, ist die
// Wurzelursache zurück.
test.describe('Perf-Beweis am schweren Erlass (OR)', () => {
  test('Der Suchmodus räumt den Volltext nicht mehr ab — kein Massen-Remount', async ({ page }) => {
    test.slow();
    await oeffneLeser(page, '/gesetze/bund/OR');
    const artikelVorher = await page.locator('article[id^="art-"]').count();
    expect(artikelVorher, 'OR-Volltext steht').toBeGreaterThan(1000);

    await inGesetzSuche(page).fill('Vertrag');
    await expect(leiste(page)).toBeVisible({ timeout: 20_000 });
    // Die Knotenzahl bleibt — der Baum wird weder abgeräumt noch neu gemountet.
    await expect.poll(async () => page.locator('article[id^="art-"]').count(), { timeout: 20_000 })
      .toBe(artikelVorher);

    // Und der Ausstieg ist ebenso billig geworden: kein Wiederaufbau, nur die
    // Liste verschwindet und der Baum kehrt zurück.
    await inGesetzSuche(page).fill('');
    await expect(liste(page)).toHaveCount(0, { timeout: 20_000 });
    await expect.poll(async () => page.locator('article[id^="art-"]').count(), { timeout: 20_000 })
      .toBe(artikelVorher);
    await expect(page.locator('[data-toc] [data-sektion-id]').first()).toBeVisible({ timeout: 20_000 });
  });
});
