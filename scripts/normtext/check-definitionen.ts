// ─── Tor `check:definitionen` (R6, offline) ──────────────────────────────────
//
// Beweist FÜNF Dinge über `public/normtext/definitionen.json`. Jede Prüfung ist
// so gebaut, dass sie ROT werden KANN (§6.7) — der Rot-Beweis je Prüfung wurde
// über eine Mutations-Kopie in der Sandbox geführt (O2, FAHRPLAN-KANTONE §5.4).
//
//   (A) DETERMINISMUS — zwei frische Läufe des Generators sind byte-gleich.
//   (B) DRIFT — der frische Lauf ist byte-gleich mit der committeten Datei.
//       Damit ist das Artefakt keine zweite Wahrheit, sondern eine Projektion
//       (§5); ein von Hand editierter Eintrag fällt sofort auf.
//   (C) NORM-EXISTENZ — jede Referenz (Snapshot-Schlüssel · Artikel-id ·
//       Blockindex · Fundstelle) zeigt auf eine wirklich vorhandene Stelle im
//       Korpus. UNABHÄNGIG nachgeladen aus den Snapshots, nicht aus dem
//       Generator-Ergebnis — sonst prüfte das Tor sich selbst.
//   (D) ZITAT-TREUE — das `zitat` ist ein WÖRTLICHER Substring der Quellzeichen-
//       kette an genau dieser Fundstelle (Blocktext oder lit.-Item), und der
//       `begriff` kommt im `zitat` vor.
//   (E) STATUS — jeder Eintrag trägt `status: 'entwurf'`. Was als
//       Legaldefinition GILT, ist juristisches Urteil; das Tor lässt keinen
//       gehobenen Status durch (§7/§8: Abnahme nur über den Skill `abnahme`).
//
// Aufruf:  npm run check:definitionen

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshot, NormSnapshotDatei } from '../../src/lib/normtext/typen';
import { ZITAT_MAX } from './definitionen-logik';
import {
  ZIEL, baueDefinitionen, serialisiere, committetesErzeugt,
  type DefinitionenDatei,
} from './definitionen-generieren';

const fehler: string[] = [];
const melde = (s: string): void => void fehler.push(s);

// ─── (A) Determinismus ───────────────────────────────────────────────────────
const erzeugt = committetesErzeugt();
if (!existsSync(ZIEL)) {
  melde(`${ZIEL} fehlt — mit "npm run gen:definitionen -- --datum=$(date +%F)" erzeugen.`);
} else if (erzeugt === null) {
  melde(`${ZIEL} trägt kein "erzeugt"-Feld.`);
}

const platzhalter = erzeugt ?? '0000-00-00';
const lauf1 = serialisiere(baueDefinitionen(), platzhalter);
const lauf2 = serialisiere(baueDefinitionen(), platzhalter);
if (lauf1 !== lauf2) {
  let i = 0;
  while (i < lauf1.length && lauf1[i] === lauf2[i]) i++;
  melde(`(A) Determinismus: zwei Läufe weichen ab @${i} — ${JSON.stringify(lauf1.slice(i, i + 80))} ≠ ${JSON.stringify(lauf2.slice(i, i + 80))}`);
}

// ─── (B) Drift gegen das committete Artefakt ─────────────────────────────────
if (existsSync(ZIEL) && erzeugt !== null) {
  const committet = readFileSync(ZIEL, 'utf8');
  if (committet !== lauf1) {
    let i = 0;
    while (i < committet.length && i < lauf1.length && committet[i] === lauf1[i]) i++;
    melde(
      `(B) Drift: ${ZIEL} ≠ frischer Generator-Lauf @Byte ${i}\n`
      + `      committet: ${JSON.stringify(committet.slice(i, i + 90))}\n`
      + `      frisch   : ${JSON.stringify(lauf1.slice(i, i + 90))}\n`
      + '      → "npm run gen:definitionen -- --datum=$(date +%F)" neu laufen lassen (Snapshots nie von Hand nachziehen).',
    );
  }
}

// ─── Korpus UNABHÄNGIG laden (für C/D) ───────────────────────────────────────
/** snapshotKey ('bund/AHVG') → id ('bund/AHVG/art_5') → Snapshot. */
const korpus = new Map<string, Map<string, NormSnapshot>>();
for (const [ebene, dir] of [['bund', 'public/normtext/bund'], ['kanton', 'public/normtext/kanton']] as const) {
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.json') || name === 'index.json') continue;
    const roh: unknown = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    const eintraege = (roh as Partial<NormSnapshotDatei> | null)?.eintraege;
    if (!Array.isArray(eintraege)) continue;
    const key = `${ebene}/${name.replace(/\.json$/, '')}`;
    const proId = new Map<string, NormSnapshot>();
    for (const e of eintraege as NormSnapshot[]) proId.set(e.id, e);
    korpus.set(key, proId);
  }
}

/**
 * Die Quellzeichenkette einer Fundstelle — oder null, wenn es sie nicht gibt.
 * Anker ist der ITEM-INDEX, nicht die Marke: sie ist im Korpus nicht eindeutig
 * (623 Blöcke mit doppelten Marken, z.B. HMG Art. 4 Abs. 1 mit sechsmal 'a').
 * Zusätzlich wird die mitgeführte Marke gegen die Quelle geprüft — so bleibt
 * das Anzeigefeld ehrlich, statt still zu driften.
 */
function quelltext(
  snap: NormSnapshot, block: number, stelle: string, item: number | null, marke: string | null,
): { text: string; markeSoll: string | null } | null {
  const b = snap.bloecke?.[block];
  if (!b) return null;
  if (stelle === 'text') {
    if (item !== null || marke !== null) return null;
    return b.text ? { text: b.text, markeSoll: null } : null;
  }
  if (stelle !== 'item' || item === null) return null;
  const it = (b.items ?? [])[item];
  if (!it?.text) return null;
  return { text: it.text, markeSoll: it.marke ?? null };
}

/**
 * R6.2/B4 — Legende-Kopf mit Unterliste: Kopf-Item-Text + die direkt folgenden
 * Unterpunkt-Texte (tiefe > 0, bis zum nächsten tiefe-0-Item), mit U+000A
 * verbunden. UNABHÄNGIG aus der Quelle rekonstruiert (nicht aus dem
 * Generator-Ergebnis) — Prüfung D vergleicht byte-genau, das ist STRENGER als
 * Substring: jede veränderte oder fehlende Zeile macht das Tor rot.
 * Ohne Unterpunkte null (dann gibt es keinen legitimen Kopf-Eintrag).
 */
function kopfMitUnterpunkten(snap: NormSnapshot, block: number, item: number): string | null {
  const items = snap.bloecke?.[block]?.items ?? [];
  const kopf = items[item];
  if (!kopf?.text) return null;
  const teile = [kopf.text];
  for (let j = item + 1; j < items.length && (items[j].tiefe ?? 0) > 0; j++) {
    if (items[j].text) teile.push(items[j].text);
  }
  return teile.length > 1 ? teile.join('\n') : null;
}

// ─── (C) Norm-Existenz · (D) Zitat-Treue · (E) Status ────────────────────────
if (existsSync(ZIEL)) {
  const datei = JSON.parse(readFileSync(ZIEL, 'utf8')) as DefinitionenDatei;
  const eintraege = Array.isArray(datei.eintraege) ? datei.eintraege : [];
  if (eintraege.length === 0) melde('(C) Artefakt enthält keine Einträge.');

  let cFehler = 0, dFehler = 0, eFehler = 0;
  const zeige = (n: number, s: string): void => { if (n < 5) melde(`      ${s}`); };
  const gesehen = new Set<string>();

  eintraege.forEach((e, i) => {
    const wo = `[${i}] ${e.norm?.id ?? '?'} B${e.norm?.block ?? '?'}/${e.norm?.stelle ?? '?'}${e.norm?.item === null || e.norm?.item === undefined ? '' : `[${e.norm.item}]`} «${e.begriff ?? '?'}»`;

    // (E) Status
    if (e.status !== 'entwurf') {
      zeige(eFehler++, `(E) ${wo}: status "${String(e.status)}" statt "entwurf".`);
      return;
    }

    // (C) Norm-Existenz
    const proId = korpus.get(e.norm?.snapshot ?? '');
    if (!proId) { zeige(cFehler++, `(C) ${wo}: Snapshot "${e.norm?.snapshot}" existiert nicht.`); return; }
    const snap = proId.get(e.norm.id);
    if (!snap) { zeige(cFehler++, `(C) ${wo}: Artikel-id nicht im Snapshot ${e.norm.snapshot}.`); return; }
    if (snap.artikel !== e.norm.artikel || snap.artikelLabel !== e.norm.artikelLabel) {
      zeige(cFehler++, `(C) ${wo}: Artikel-Token "${e.norm.artikel}"/"${e.norm.artikelLabel}" ≠ Snapshot "${snap.artikel}"/"${snap.artikelLabel}".`);
      return;
    }
    const treffer = quelltext(snap, e.norm.block, e.norm.stelle, e.norm.item ?? null, e.norm.marke ?? null);
    if (treffer === null) {
      zeige(cFehler++, `(C) ${wo}: Fundstelle Block ${e.norm.block} / ${e.norm.stelle}[${String(e.norm.item)}] existiert im Artikel nicht.`);
      return;
    }
    const quelle = treffer.text;
    if ((e.norm.marke ?? null) !== treffer.markeSoll) {
      zeige(cFehler++, `(C) ${wo}: marke "${String(e.norm.marke)}" ≠ Quelle "${String(treffer.markeSoll)}".`);
      return;
    }
    const absatzSoll = snap.bloecke[e.norm.block].absatz ?? null;
    if ((e.norm.absatz ?? null) !== absatzSoll) {
      zeige(cFehler++, `(C) ${wo}: absatz "${String(e.norm.absatz)}" ≠ Block-Absatz "${String(absatzSoll)}".`);
      return;
    }

    // (D) Zitat-Treue
    if (typeof e.zitat !== 'string' || e.zitat.length === 0) {
      zeige(dFehler++, `(D) ${wo}: leeres Zitat.`); return;
    }
    if (e.zitat.length > ZITAT_MAX) {
      zeige(dFehler++, `(D) ${wo}: Zitat ${e.zitat.length} > ZITAT_MAX ${ZITAT_MAX}.`); return;
    }
    if (!quelle.includes(e.zitat)) {
      // R6.2/B4: Kopf-Einträge zitieren Kopf + Unterpunkte ('\n'-verbunden) —
      // byte-genaue Rekonstruktion aus der Quelle statt Substring.
      const kopfKette = e.norm.stelle === 'item' && e.norm.item !== null && e.norm.item !== undefined
        ? kopfMitUnterpunkten(snap, e.norm.block, e.norm.item)
        : null;
      if (kopfKette === null || kopfKette !== e.zitat) {
        zeige(dFehler++, `(D) ${wo}: Zitat ist KEIN wörtlicher Substring der Quelle (und keine byte-gleiche Kopf+Unterpunkte-Kette).\n          Zitat : ${JSON.stringify(e.zitat.slice(0, 100))}\n          Quelle: ${JSON.stringify(quelle.slice(0, 100))}`);
        return;
      }
    }
    if (!e.begriff || !e.zitat.includes(e.begriff)) {
      zeige(dFehler++, `(D) ${wo}: Begriff kommt im Zitat nicht vor.`); return;
    }
    // Provenienz (§7): Stand + Link müssen die des Artikels sein.
    if (e.stand !== snap.stand || e.quelleUrl !== snap.quelleUrl) {
      zeige(cFehler++, `(C) ${wo}: stand/quelleUrl weichen vom Snapshot ab.`); return;
    }
    // Keine Dublette an derselben Stelle mit demselben Begriff.
    const schluessel = `${e.norm.id}|${e.norm.block}|${e.norm.stelle}|${String(e.norm.item)}|${e.begriff}|${e.zitat}`;
    if (gesehen.has(schluessel)) { zeige(dFehler++, `(D) ${wo}: Dublette.`); return; }
    gesehen.add(schluessel);
  });

  if (cFehler) melde(`(C) Norm-Existenz: ${cFehler} von ${eintraege.length} Einträgen zeigen ins Leere.`);
  if (dFehler) melde(`(D) Zitat-Treue: ${dFehler} von ${eintraege.length} Einträgen nicht wörtlich belegt.`);
  if (eFehler) melde(`(E) Status: ${eFehler} von ${eintraege.length} Einträgen nicht "entwurf".`);

  if (fehler.length === 0) {
    const proMuster = Object.entries(datei.proMuster ?? {}).map(([k, v]) => `${k} ${v}`).join(' · ');
    console.log(
      `check:definitionen grün: ${eintraege.length} Einträge — Norm-Referenz, Zitat-Treue (wörtlich), `
      + `Begriff-im-Zitat, Status "entwurf", Determinismus und Byte-Gleichheit mit dem Generator geprüft.`,
    );
    console.log(`  je Muster: ${proMuster}`);
    console.log(`  je Ebene:  ${Object.entries(datei.proEbene ?? {}).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  }
}

if (fehler.length) {
  console.error('check:definitionen ROT:');
  for (const f of fehler) console.error(`  - ${f}`);
  process.exit(1);
}
