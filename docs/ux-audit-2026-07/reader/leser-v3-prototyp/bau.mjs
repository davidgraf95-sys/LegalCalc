#!/usr/bin/env node
/**
 * Erzeugt index.html aus vorlage.html + echten Korpus-Daten + eingebetteter Serif.
 * Aufruf (Repo-Wurzel):  node docs/ux-audit-2026-07/reader/leser-v3-prototyp/bau.mjs
 *
 * Warum ein Generator und nicht Handarbeit: die Inhalte sollen nachweislich aus
 * public/normtext/** und public/rechtsprechung/** stammen (§5 — eine Quelle),
 * nicht abgetippt sein. index.html ist das Erzeugnis und wird nie von Hand editiert.
 * Der Prototyp selbst ist eine einzige Datei ohne externe Requests.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HIER, '../../../..');
const lies = (p) => JSON.parse(readFileSync(resolve(REPO, p), 'utf8'));

/* ── 1 · Datenslice: StPO Art. 426–432 ──────────────────────────────────── */
const NRS = ['426', '427', '428', '429', '430', '431', '432'];
const reg = lies('public/normtext/register.json').erlasse.find((e) => e.key === 'STPO');
const txt = lies('public/normtext/bund/STPO.json');
const str = lies('public/normtext/struktur/bund/STPO.json');
const his = lies('public/normtext/historie/STPO.json');
const rev = lies('public/normtext/revisionen/STPO.json');
const bez = lies('public/rechtsprechung/bezuege/STPO.json');

const artikel = NRS.map((nr) => {
  const t = txt.eintraege.find((e) => e.artikel === nr);
  const s = str.artikel[nr] || {};
  const h = his.artikel[nr] || null;
  const g = bez.gesamtProArtikel[nr] || {};
  if (!t) throw new Error('Art. ' + nr + ' fehlt im Snapshot');
  return {
    nr, label: t.artikelLabel,
    marginalie: (s.marginalie || []).join(' · '),
    gliederung: s.gliederung || [],
    bloecke: t.bloecke,
    fussnoten: (s.fussnoten || []).map((f) => ({ nr: f.nr, text: f.text, absatz: f.absatz, item: f.item })),
    historie: h ? { giltSeit: h.giltSeit, ereignisse: h.ereignisse.map((e) => ({ typ: e.typ, datum: e.datum, quellen: e.quellen })) } : null,
    bezuege: Object.values(g).reduce((a, b) => a + b, 0),
    bezuegeDetail: g,
  };
});

// Gliederung: alle Titel (Ebene 1) + der Ast von Art. 429 (10. Titel) vollständig
const knoten = [];
const gesehen = new Set();
for (const nr of Object.keys(str.artikel)) {
  for (const g of str.artikel[nr].gliederung || []) {
    if (!gesehen.has(g.eId)) { gesehen.add(g.eId); knoten.push({ ...g, ersterArtikel: nr }); }
  }
}
const daten = {
  erlass: {
    titel: reg.titel, kuerzel: reg.kuerzel, sr: reg.sr, artikelAnzahl: reg.artikelAnzahl,
    stand: reg.stand, quelleUrl: reg.quelleUrl, pdfUrl: reg.pdfUrl, geprueft: rev.abgerufen,
  },
  nichtKonsolidiert: rev.revisionen.filter((r) => r.nichtKonsolidiert)
    .map((r) => ({ ab: r.dateEntryInForce, ro: r.roFundstelle, url: r.quelleUrl })),
  ebene1: knoten.filter((g) => g.ebene === 1),
  ast: knoten.filter((g) => g.eId === 'tit_10' || g.eId.startsWith('tit_10/')),
  artikel,
  entscheide: bez.proArtikel['429'].slice(0, 14).map((x) => {
    const d = bez.dokumente[x.key];
    return { zitierung: d.zitierung, datum: d.datum, regeste: d.regesteKurz };
  }),
};

/* ── 2 · Schrift einbetten (Source Serif 4 Variable, self-hosted) ───────── */
const FONT_DIR = 'node_modules/@fontsource-variable/source-serif-4/files/';
let serifCss = '';
try {
  const b64 = (n) => readFileSync(resolve(REPO, FONT_DIR + n)).toString('base64');
  const normal = b64('source-serif-4-latin-wght-normal.woff2');
  const kursiv = b64('source-serif-4-latin-wght-italic.woff2');
  serifCss =
    `@font-face{font-family:'Source Serif 4 Proto';font-style:normal;font-weight:400 700;font-display:block;` +
    `src:url(data:font/woff2;base64,${normal}) format('woff2');}\n` +
    `@font-face{font-family:'Source Serif 4 Proto';font-style:italic;font-weight:400 700;font-display:block;` +
    `src:url(data:font/woff2;base64,${kursiv}) format('woff2');}`;
} catch {
  serifCss = '/* Source Serif 4 nicht gefunden — Fallback Georgia (siehe README) */';
  console.warn('WARNUNG: Schrift nicht eingebettet, Fallback Georgia.');
}

/* ── 3 · Zusammensetzen ─────────────────────────────────────────────────── */
const vorlage = readFileSync(resolve(HIER, 'vorlage.html'), 'utf8');
const html = vorlage
  .replace('/*__SERIF__*/', serifCss)
  .replace('/*__DATEN__*/null', JSON.stringify(daten));
const ziel = resolve(HIER, 'index.html');
writeFileSync(ziel, html);

console.log('index.html geschrieben:', (Buffer.byteLength(html) / 1024).toFixed(0), 'KB,',
  html.split('\n').length, 'Zeilen');
console.log('Artikel:', artikel.map((a) => a.nr + ' (' + a.bezuege + ' Bezüge, ' + a.fussnoten.length + ' Fn)').join(' · '));
console.log('Schrift eingebettet:', serifCss.includes('base64') ? 'ja' : 'nein');
