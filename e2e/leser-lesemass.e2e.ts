// @shard-gruppe: 2
import { test, expect, type Page } from '@playwright/test';

// R5 (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Typo-Skala): die Lesespalte hält ein
// komfortables Zeilenmass — Desktop ≤ 75 ch @ 1440px, Mobil hinreichend breit @ 390px.
// Der frühere Ist-Fehler: arbitrary max-w-[52/56rem] (zu breit) + auf Mobil ~16 ch
// (5 gestapelte Guide-Linien à ~24px = ~120px Fraß). Fix: max-w-reading (Token) +
// Guide-/Einzug-Kollaps mobil → gemessen ~32–34 ch (2× der ~16-ch-Basis).
//
// OFFENGELEGTE ABWEICHUNG (§7/§8) vom aspirativen «≥ 40 ch @ 390» der Spec:
// empirisch physikalisch gedeckelt. Bei 390px bleiben nach dem Shell-Seitensteg
// (px-5 = 40px) und der amtstreuen Absatznummer-Rinne (`pl-9` = 36px hängender
// Einzug) ~314px Textbreite; bei der 18px-Lese-Serife (Signatur «über Fedlex»,
// D-B) sind das ~32–34 ch. 40 ch bräuchten ~392px Text (breiter als der Viewport)
// oder eine Schrift < 16px bzw. das Schrumpfen der Absatznummer-Rinne / des
// globalen Seitenstegs — alle drei ausserhalb G1 (D-A…D-E). Floor daher auf die
// robust erreichte, deutlich verbesserte Marke gesetzt; zusätzlich strikt: KEIN
// horizontaler Overflow @390 (der eigentliche Mobil-Gesundheitscheck).
//
// Messmethode (aus docs/ux-audit-2026-07/reader/measure.mjs): der längste
// mehrzeilige Fliesstext-<p> im Volltext; charsPerLine = Textlänge / Zeilenkästen
// (range.getClientRects()). Der Reader liefert PRERENDERTES HTML, React ersetzt es
// nach dem Fetch (render-then-replace) → erst auf #art-1 warten.
const MOBIL_MIN_CH = 30; // robust erreicht (~32–34), 2× der ~16-ch-Basis; s. Abweichungsnotiz

const ERLASSE = ['ZGB', 'OR', 'VMWG'] as const;

async function ladeReader(page: Page, key: string): Promise<void> {
  await page.goto(`/gesetze/bund/${key}`);
  await expect(page.locator('#art-1')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  // Etwas Inhalt in den Viewport bringen, damit content-visibility-Artikel
  // Layout bekommen (die obersten sind ohnehin sichtbar).
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
}

async function messeMaxCharsPerLine(page: Page): Promise<{ ch: number; px: number } | null> {
  return page.evaluate(() => {
    let best: { ch: number; px: number } | null = null;
    document.querySelectorAll('[id^="art-"] p').forEach((p) => {
      const text = (p.textContent ?? '').trim();
      if (text.length < 40) return; // zu kurz für eine belastbare Messung
      const range = document.createRange();
      range.selectNodeContents(p);
      const rects = range.getClientRects();
      if (rects.length < 3) return; // nur echt umbrechende Absätze
      const ch = Math.round(text.length / rects.length);
      const px = Math.round((p as HTMLElement).getBoundingClientRect().width);
      if (!best || ch > best.ch) best = { ch, px };
    });
    return best;
  });
}

// ═══ S2 (W2·5m-LESER-V3, Pos. 19 · F3 = V2, David 17.8.2026 am Bildbogen) ═══
//
// Der Fliesstext läuft auf der Token-Stufe `leser-text` (1.0625 rem / lh 1.55)
// statt auf `text-body-l` + rohem `leading-[1.65]`-Override. Was hier festgehalten
// wird, ist die WCAG-Zusage der Etappe (SC 1.4.8 «Visual Presentation»: Zeile
// ≤ 80 Zeichen, Zeilenabstand ≥ 1.5) — und zwar an ALLEN drei Bogen-Breiten, nicht
// nur an der Desktop-Breite, die die Fälle oben schon prüfen.
//
// ROT ZU BEKOMMEN (§6.7): in `ArtikelLeser.tsx` `text-leser-text` durch
// `text-body-l` ersetzen (lh fällt auf 1.5 → der lh-Fall bleibt knapp grün, der
// px-Fall reisst), oder in `tailwind.config.js` die Stufe `leser-text` auf
// lineHeight 1.4 setzen (lh-Fall rot), oder `max-w-normtext` aufweiten (ch-Fall).
const BOGEN_BREITEN = [390, 720, 1440] as const;

test.describe('S2 · WCAG 1.4.8 am Fliesstext (≤ 80 ch, lh ≥ 1.5)', () => {
  for (const width of BOGEN_BREITEN) {
    test(`StPO @${width}: Fliesstext ≤ 80 ch und lh ≥ 1.5`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await ladeReader(page, 'STPO');
      const m = await messeMaxCharsPerLine(page);
      expect(m, `@${width}: mehrzeiliger Fliesstext-Absatz gefunden`).not.toBeNull();
      expect(m!.ch, `@${width}: ${m!.ch} ch (${m!.px}px) muss ≤ 80 sein (SC 1.4.8)`)
        .toBeLessThanOrEqual(80);

      // Zeilenabstand am GERECHNETEN Stil, nicht an der Klasse: nur so fällt der
      // Fall auch dann, wenn ein Override die Stufe später wieder überschreibt
      // (genau das tat `leading-[1.65]` bis S2).
      const typo = await page.evaluate(() => {
        const p = document.querySelector('[id^="art-"] [data-lese] p');
        if (!p) return null;
        const s = getComputedStyle(p);
        return { fs: parseFloat(s.fontSize), lh: parseFloat(s.lineHeight) };
      });
      expect(typo, `@${width}: Fliesstext-Absatz im Lese-Container gefunden`).not.toBeNull();
      const quotient = typo!.lh / typo!.fs;
      expect(quotient, `@${width}: lh ${typo!.lh}px / fs ${typo!.fs}px = ${quotient.toFixed(3)} muss ≥ 1.5 sein (SC 1.4.8)`)
        .toBeGreaterThanOrEqual(1.5);
      // Und die Stufe selbst: 1.0625 rem = 17 px bei 16-px-Wurzel.
      expect(typo!.fs, `@${width}: Fliesstext-Grösse (F3 = V2: 17 px)`).toBeCloseTo(17, 1);
    });
  }
});

test.describe('S2 · Fussnotenmarke: hochgestellt, ohne Klammern (Entscheid David 17.8.2026)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('StPO: Marke ist hochgestellt und kleiner als der Fliesstext — kein «(» im Markentext', async ({ page }) => {
    await ladeReader(page, 'STPO');
    // ENTSCHEID DAVID 17.8.2026 am Bildbogen, Wortlaut «v2 gefällt mir besser aber
    // fussnoten hochgestellt»: der V2-Satzspiegel gilt, die Marke behält aber die
    // hochgestellte, klammerlose V1-Form. Die V2-Spalte des Fahrplans (Kap. 8) sah
    // runde Klammern vor — dieser Fall hält die Abweichung fest, damit ein späterer
    // «Nachzug auf V2» sie nicht stillschweigend zurückdreht.
    const marke = await page.evaluate(() => {
      const el = document.querySelector('[id^="art-"] [data-fn-marker] a, [id^="art-"] [data-fn-marker] button');
      if (!el) return null;
      const s = getComputedStyle(el);
      // `--fn-marke` ist em-relativ, und `em` bezieht sich auf den ELTERNKNOTEN —
      // gegen den wird darum gemessen, nicht gegen einen beliebigen Fliesstext-
      // Absatz. (Die Marke sitzt je nach Fundort im Fliesstext ODER an der
      // Marginalie; ein `[data-lese] p` gibt es im zweiten Fall nicht.)
      const eltern = el.parentElement;
      return {
        text: (el.textContent ?? '').trim(),
        va: s.verticalAlign,
        fs: parseFloat(s.fontSize),
        basis: eltern ? parseFloat(getComputedStyle(eltern).fontSize) : null,
      };
    });
    expect(marke, 'Fussnoten-Marke im Fliesstext gefunden').not.toBeNull();
    expect(marke!.text, 'Marke trägt eine Klammer — Entscheid David 17.8.2026 verlangt die klammerlose Form')
      .not.toContain('(');
    expect(marke!.text, 'Marke trägt eine schliessende Klammer').not.toContain(')');
    expect(marke!.va, 'Marke ist nicht hochgestellt (align-super)').toBe('super');
    // Kleiner als der Fliesstext, aber nicht winzig: `--fn-marke` = 0.72 em.
    expect(marke!.fs).toBeLessThan(marke!.basis!);
    expect(marke!.fs / marke!.basis!).toBeCloseTo(0.72, 1);
  });
});

// ── S2 · Ä26: die Beiwerk-Reserve folgt dem DATENMODELL, nicht der Erlass-Ebene ──
//
// Befund des Ästhetik-Prüfers (17.8.2026): der Fassungs-Slot reservierte 40 px
// unter JEDEM Artikel JEDES Erlasses — auch dort, wo nie eine Fassungs-Zeile
// eintreffen kann (auf BS-640.100 waren das 292 von 292 Artikeln). Die Reserve
// hängt jetzt daran, ob DER ARTIKEL Fussnoten führt: nur aus denen erzeugt
// `historie-generieren.ts` überhaupt Einträge (Generator-Invariante, Herleitung
// und Korpus-Messung am Slot in `ArtikelLeser.tsx`).
//
// Der KANTONS-Erlass ist hier bewusst der Träger des POSITIV-Falls, nicht nur des
// Negativ-Falls. Ein S2-Zwischenstand hing die Reserve an `erlass.ebene === 'bund'`
// — korpustreu, aber ein Erlass-Sonderpfad. Dieser Fall wäre unter jener Regel ROT
// gewesen und hält die Erlass-Neutralität darum konstruktiv fest.
//
// ROT ZU BEKOMMEN (§6.7): in `ArtikelLeser.tsx` die Bedingung des Slots auf
// `erlass.ebene === 'bund'` zurückdrehen (Positiv-Fall rot) oder das `min-h-beiwerk`
// bedingungslos setzen (Negativ-Fall rot).
test.describe('S2 · Ä26 — Reserve nur, wo eine Fassungs-Zeile eintreffen kann', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('BS-640.100: § 20 (mit Fussnoten) reserviert, § 1 (ohne) reserviert NICHT', async ({ page }) => {
    await page.goto('/gesetze/kanton/BS-640.100');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(300);

    const hoehen = await page.evaluate(() => {
      const lies = (id: string) => {
        const art = document.getElementById(id);
        if (!art) return null;
        const slot = art.querySelector('[data-hist-slot]');
        if (!slot) return { slot: false as const };
        return { slot: true as const, min: getComputedStyle(slot).minHeight };
      };
      return { a20: lies('art-20'), a1: lies('art-1') };
    });

    // § 20 trägt eine Fussnote (Struktur-Sidecar, 14 solche Artikel im Erlass) ⇒
    // hier KANN eine Fassungs-Zeile ankommen, also steht der Boden.
    expect(hoehen.a20, '§ 20 nicht gefunden').not.toBeNull();
    expect(hoehen.a20!.slot, '§ 20 hat keinen Fassungs-Slot').toBe(true);
    expect(parseFloat(hoehen.a20!.min!), '§ 20: Reserve fehlt (Ä26-Regel greift nicht auf Kantonsrecht ⇒ Erlass-Sonderpfad)')
      .toBeCloseTo(24, 0);

    // § 1 trägt keine Fussnote ⇒ kein Eintrag möglich ⇒ kein reservierter Raum.
    expect(hoehen.a1, '§ 1 nicht gefunden').not.toBeNull();
    const min1 = hoehen.a1!.slot ? parseFloat(hoehen.a1!.min ?? '0') : 0;
    expect(min1 || 0, '§ 1: Phantom-Lücke — reserviert, obwohl nie eine Fassungs-Zeile kommen kann (Ä26)')
      .toBeLessThan(4);
  });
});

// ── S2 · Umschalten hinterlässt keinen Rest (Rundlauf) ───────────────────────
//
// ABGRENZUNG ZUM ABNAHME-KRITERIUM DER ETAPPE, offengelegt (§7): der Auftrag
// verlangte «das Umschalten aller drei Schalter erzeugt an keinem Artikel einen
// Layout-Sprung». Das ist mit dem David-Entscheid A1 (5.7.2026, «AUS» = die
// Fussnoten VERSCHWINDEN, statt gedämpft zu werden) nicht erfüllbar: der Apparat
// misst je Artikel 27–187 px, und ihn höhenfest zu reservieren wäre genau das
// verbotene Dämpfen. Ein Boden fängt nur, was kleiner ist als er selbst.
// (Nebenbefund: es sind seit S1 ZWEI Schalter — «Fussnoten» und
// «Änderungsvermerke» —, «Rechtsprechung» ist ein Dropdown, kein Schalter.)
//
// Erfüllbar und darum hier zugesichert ist die Zusage, die A1 nicht verletzt: das
// Umschalten ist VERLUSTFREI. Nach an→aus→an steht jeder Artikel wieder exakt auf
// seiner Ausgangshöhe — kein zurückgelassener reservierter Rest, keine
// verschluckten Pixel. Genau diese Fehlerklasse hat Ä26 hervorgebracht (eine
// Reserve, die den Schalter überlebt) und S1-K4 davor.
test.describe('S2 · Schalter-Rundlauf ist verlustfrei (A1-konform)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('BGBM: an→aus→an stellt jede Artikel-Höhe exakt wieder her', async ({ page }) => {
    // BGBM wie in `leser-optionen.e2e.ts`: klein (~22 KB), trägt Marker UND
    // Apparat — der grosse OR starvte den gedrosselten CI-Runner (Befund 4.7.2026).
    await page.goto('/gesetze/bund/BGBM');
    await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(300);

    const hoehen = () => page.evaluate(() => Array.from(document.querySelectorAll('article[id^="art-"]'))
      .map((a) => Math.round(a.getBoundingClientRect().height)));

    const vorher = await hoehen();
    expect(vorher.length, 'keine Artikel gemessen').toBeGreaterThan(3);

    const schalten = async (name: string) => {
      await page.getByRole('button', { name: 'Ansicht' }).first().click();
      const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
      await expect(gruppe).toBeVisible();
      await gruppe.getByRole('switch', { name }).click();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
    };

    for (const name of ['Fussnoten', 'Änderungsvermerke']) {
      await schalten(name);          // an → aus
      const aus = await hoehen();
      // Der Schalter muss überhaupt WIRKEN — sonst wäre der Rundlauf unten
      // trivial grün (ein Schalter ohne Wirkung besteht ihn immer, §6.7).
      expect(aus.join(','), `Schalter «${name}» ändert gar nichts`).not.toBe(vorher.join(','));
      await schalten(name);          // aus → an
      expect(await hoehen(), `Schalter «${name}»: Rundlauf lässt einen Rest zurück`).toEqual(vorher);
    }
  });
});

test.describe('R5 · Lesemass Desktop (≤ 75 ch @ 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const key of ERLASSE) {
    test(`${key}: Lesespalte ≤ 75 ch`, async ({ page }) => {
      await ladeReader(page, key);
      const m = await messeMaxCharsPerLine(page);
      expect(m, `${key}: mehrzeiliger Fliesstext-Absatz gefunden`).not.toBeNull();
      expect(m!.ch, `${key} @1440: ${m!.ch} ch (${m!.px}px) muss ≤ 75 sein`).toBeLessThanOrEqual(75);
    });
  }
});

test.describe(`R5 · Lesemass Mobil (≥ ${MOBIL_MIN_CH} ch @ 390, kein H-Overflow)`, () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const key of ERLASSE) {
    test(`${key}: Lesespalte ≥ ${MOBIL_MIN_CH} ch, kein H-Overflow`, async ({ page }) => {
      await ladeReader(page, key);
      const m = await messeMaxCharsPerLine(page);
      expect(m, `${key}: mehrzeiliger Fliesstext-Absatz gefunden`).not.toBeNull();
      expect(m!.ch, `${key} @390: ${m!.ch} ch (${m!.px}px) muss ≥ ${MOBIL_MIN_CH} sein`).toBeGreaterThanOrEqual(MOBIL_MIN_CH);
      // Kein horizontaler Overflow des Dokuments (grid-cols-1-Falle / lange Komposita).
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${key} @390: horizontaler Overflow ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});
