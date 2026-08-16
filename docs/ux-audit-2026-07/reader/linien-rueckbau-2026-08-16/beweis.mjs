// Vorher/Nachher-Beweis zum Linien-Rückbau V1 (ROADMAP W2·5h-GESETZ-UI,
// FAHRPLAN-GESETZESDARSTELLUNG-V2 §9.3, Entscheid David 13.8.2026).
//
// DEKLARIERTE Verhaltensänderung (§6): die Gliederungslinie im Lesetext und ihr
// Schalter «Linien» im Ansicht-Menü verschwinden ersatzlos; die Übersicht trägt
// allein die Seitenleiste (W2·19-GLIEDERUNG). Der Beweis ist reproduzierbar:
// dasselbe Skript läuft VOR und NACH dem Rückbau gegen denselben Dev-Server
// (`npm run dev`, http://localhost:5173) und schreibt Screenshots + eine
// maschinenlesbare Messreihe.
//
//   node docs/ux-audit-2026-07/reader/linien-rueckbau-2026-08-16/beweis.mjs vorher
//   node docs/ux-audit-2026-07/reader/linien-rueckbau-2026-08-16/beweis.mjs nachher
//
// Gemessen wird an ZGB Art. 684 (Gliederungstiefe 5 — der Erlass, an dem David
// die Linie zweimal verworfen hat) und am Ansicht-Menü (Schalter-Bestand).
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PHASE = process.argv[2];
if (PHASE !== 'vorher' && PHASE !== 'nachher') {
  console.error('Aufruf: node beweis.mjs <vorher|nachher>');
  process.exit(2);
}
const OUT = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BEWEIS_BASIS ?? 'http://localhost:5173';

/** Sichtbare vertikale Guide-Kanten über einem Artikel (Farbe, nicht Breite —
 *  das Markup trug die border-Breite bisher immer und blendete nur die Farbe aus). */
const messeGuides = (id) => {
  const unsichtbar = (c) => c === 'transparent' || /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/.test(c);
  let el = document.getElementById(id)?.parentElement ?? null;
  let sichtbar = 0;
  let markiert = 0;
  while (el) {
    if (el.matches('section[data-normtext-linie]')) {
      markiert++;
      const cs = getComputedStyle(el);
      if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0 && !unsichtbar(cs.borderLeftColor)) sichtbar++;
    }
    el = el.parentElement;
  }
  return { markiert, sichtbar };
};

const messeVerdrahtung = () => ({
  htmlDataLinien: document.documentElement.getAttribute('data-linien'),
  leserDataGuideAuto: document.querySelector('.lc-leser')?.getAttribute('data-guide-auto') ?? null,
  borderGuideElemente: document.querySelectorAll('.border-guide').length,
  guideTokenDefiniert: getComputedStyle(document.documentElement).getPropertyValue('--guide-gliederung').trim() || null,
});

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const mess = { phase: PHASE, basis: BASE, erhoben: new Date().toISOString() };

await page.goto(`${BASE}/gesetze/bund/ZGB#art-684`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#art-684', { timeout: 60000 });
await page.evaluate(() => document.fonts?.ready);
await page.evaluate(() => document.getElementById('art-684')?.scrollIntoView({ block: 'start' }));
await page.waitForTimeout(1200);

mess.grundzustand = { ...(await page.evaluate(messeGuides, 'art-684')), ...(await page.evaluate(messeVerdrahtung)) };
await page.screenshot({ path: resolve(OUT, `${PHASE}-1-zgb-684-grundzustand.png`) });

// Ansicht-Menü: welche Darstellungs-Schalter gibt es überhaupt?
await page.getByRole('button', { name: 'Ansicht' }).first().click();
const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
await gruppe.waitFor({ timeout: 15000 });
mess.ansichtSchalter = await gruppe.getByRole('switch').evaluateAll((n) => n.map((e) => e.textContent.trim()));
await page.screenshot({ path: resolve(OUT, `${PHASE}-2-ansicht-menu.png`) });

// Gibt es den Linien-Schalter noch, wird er EINMAL betätigt — das ist der
// Zustand, den David verworfen hat («eine einzige linie und unbrauchbar»).
const linienSchalter = gruppe.getByRole('switch', { name: 'Linien' });
mess.linienSchalterVorhanden = (await linienSchalter.count()) > 0;
if (mess.linienSchalterVorhanden) {
  await linienSchalter.click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  mess.nachKlickLinienAn = { ...(await page.evaluate(messeGuides, 'art-684')), ...(await page.evaluate(messeVerdrahtung)) };
  await page.screenshot({ path: resolve(OUT, `${PHASE}-3-zgb-684-linien-an.png`) });
} else {
  mess.nachKlickLinienAn = null;
}

writeFileSync(resolve(OUT, `${PHASE}-messung.json`), JSON.stringify(mess, null, 2) + '\n');
console.log(JSON.stringify(mess, null, 2));
await browser.close();
