#!/usr/bin/env node
/**
 * Selbsttest des V-0-Prototyps: öffnet index.html per file://, schaltet die
 * Prototyp-Steuerung durch und legt je Kombination ein PNG in screens/ ab.
 * Bricht ab, wenn die Seite auch nur einen Konsolen-Fehler wirft.
 * Aufruf (Repo-Wurzel):  node docs/ux-audit-2026-07/reader/leser-v3-prototyp/schuss.mjs
 */
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const HIER = dirname(fileURLToPath(import.meta.url));
const ZIEL = resolve(HIER, 'screens');
mkdirSync(ZIEL, { recursive: true });

const BILDER = [
  // name,                 breite, variante, schrift, modus, split, extra
  ['d-a-v1-hell',           'D', 'A', 'V1', 'hell',   '0', null],
  ['d-a-v1-dunkel',         'D', 'A', 'V1', 'dunkel', '0', null],
  ['d-a-v2-hell',           'D', 'A', 'V2', 'hell',   '0', null],
  ['d-b-v1-hell',           'D', 'B', 'V1', 'hell',   '0', null],
  ['d-a-v1-hell-menue',     'D', 'A', 'V1', 'hell',   '0', 'menue'],
  ['d-a-v1-hell-panel',     'D', 'A', 'V1', 'hell',   '0', 'panel'],
  ['d-b-v1-hell-anzeige',   'D', 'B', 'V1', 'hell',   '0', 'anzeige'],
  ['s-a-v1-hell-split',     'S', 'A', 'V1', 'hell',   '1', null],
  ['s-b-v1-dunkel-sheet',   'S', 'B', 'V1', 'dunkel', '0', 'panel'],
  ['h-a-v1-hell',           'H', 'A', 'V1', 'hell',   '0', null],
  ['h-a-v1-hell-sheet',     'H', 'A', 'V1', 'hell',   '0', 'sheet'],
  ['h-b-v1-dunkel',         'H', 'B', 'V1', 'dunkel', '0', null],
];

const browser = await chromium.launch();
const seite = await browser.newPage({ viewport: { width: 1560, height: 1100 }, deviceScaleFactor: 1 });
const fehler = [];
seite.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
seite.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));

await seite.goto(pathToFileURL(resolve(HIER, 'index.html')).href);
await seite.waitForTimeout(400);

const setze = async (feld, wert) => {
  const k = seite.locator(`#steuerung button[data-set="${feld}"][data-wert="${wert}"]`);
  if (await k.isDisabled()) return;
  await k.click();
};

for (const [name, breite, variante, schrift, modus, split, extra] of BILDER) {
  await setze('split', '0');
  await setze('breite', breite);
  await setze('variante', variante);
  await setze('schrift', schrift);
  await setze('modus', modus);
  if (split === '1') await setze('split', '1');
  // Zustände im Prototyp selbst
  await seite.evaluate(() => { document.getElementById('rahmen').dataset.panel = '0';
                               document.getElementById('rahmen').dataset.sheet = '0'; });
  if (extra === 'menue') await seite.click('#k-ansicht');
  if (extra === 'panel') await seite.click('#k-oeffner');
  if (extra === 'anzeige') { await seite.click('#k-oeffner'); await seite.click('[data-reiter="anzeige"]'); }
  if (extra === 'sheet') await seite.click('#k-sheet');
  await seite.waitForTimeout(320);
  await seite.locator('#rahmen').screenshot({ path: resolve(ZIEL, name + '.png') });
  console.log('✓', name + '.png');
}

/* Funktionsprobe: Sprung, Suche, Umschalten ohne Layout-Sprung */
await setze('split', '0'); await setze('breite', 'D'); await setze('modus', 'hell'); await setze('variante', 'A');
await seite.fill('#suche', 'Art. 429');
await seite.waitForTimeout(250);
const trefferArt = await seite.textContent('#live-art');
await seite.fill('#suche', 'Genugtuung');
await seite.waitForTimeout(250);
const status = await seite.textContent('#such-status');
await seite.keyboard.press('Escape');
await seite.click('#k-ansicht');
await seite.click('#menue-ansicht [data-schalter="fussnoten"]');
await seite.click('#menue-ansicht [data-schalter="historie"]');
const sprung = await seite.textContent('#sprung');
await seite.keyboard.press('Escape');
await seite.click('#lese');
await seite.keyboard.press('/');
const fokus = await seite.evaluate(() => document.activeElement.id);
await seite.keyboard.press('Escape');
const panelZu = await seite.evaluate(() => { const r = document.getElementById('rahmen');
  r.dataset.panel = '1'; return r.dataset.panel; });
await seite.keyboard.press('Escape');
const nachEsc = await seite.getAttribute('#rahmen', 'data-panel');

console.log('\nFunktionsprobe');
console.log('  «/» fokussiert:', fokus, '· Esc schliesst Panel:', panelZu + '→' + nachEsc);
console.log('  Sprung «Art. 429» → Kopf zeigt:', trefferArt);
console.log('  Volltextsuche «Genugtuung»:', status);
console.log('  Layout-Sprung beim Umschalten:', sprung);
console.log('  Konsolen-Fehler:', fehler.length);
if (fehler.length) { console.error(fehler.join('\n')); process.exit(1); }
await browser.close();
