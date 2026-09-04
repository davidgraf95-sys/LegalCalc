// scripts/analyse/gemini-diskrepanz-text.ts — deterministische Klartext-Reduktion
// für den Gemini-Diskrepanz-Finder (FAHRPLAN-FREMDAGENTEN §2 Phase 2).
//
// Zwei unabhängige Reduzierer, die je Artikel DASSELBE Format erzeugen, damit
// ein Zweitmodell (Gemini) Quelle und Snapshot textlich vergleichen kann:
//   - reduziereQuelleHtml: gepinntes Fedlex-Filestore-HTML -> Klartext je Artikel
//   - reduziereSnapshot:   NormSnapshot[] (public/normtext/**.json) -> Klartext je Artikel
//
// Harness-Lehren aus dem T2-Recall-Test (scratchpad t2-recall/ERGEBNIS.md,
// 3.9.2026): Absatznummern INLINE in den Text setzen (nicht in ein separates
// Feld auslagern — das erzeugte dort Scheinfunde), KEINE Platzhaltertexte
// («[SVG]» o.ä.) einstreuen, Artikelgrenzen exakt einhalten. Der Fussnoten-
// Apparat der Quelle wird bewusst GETRENNT vom Artikeltext gehalten (eigener
// Abschnitt) statt inline vermischt, weil der Snapshot ihn nicht als Feld
// führt (src/lib/normtext/typen.ts) — sonst wäre jeder Fussnotentext ein
// systematischer "drop"-Scheinfund.
//
// Bewusst UNABHÄNGIG von scripts/normtext/extrahiere-fedlex.ts: ein zweiter,
// eigenständiger Parser ist der Sinn des Diskrepanz-Finders (ein Bug, der in
// BEIDEN Parsern gleich wäre, entginge sonst). Reine Lesefunktion — ändert
// keinen Risikopfad, schreibt nichts.

import { parseHTML } from 'linkedom';
import type { NormSnapshot } from '../../src/lib/normtext/typen.ts';

export interface ArtikelKlartext {
  artikel: string;
  label: string;
  /** Artikeltext mit inline Absatz-/Item-Markern, OHNE Fussnoten-Apparat. */
  text: string;
  /** Fussnoten-Apparat der Quelle, getrennt gehalten (Snapshot hat keine Entsprechung). */
  fussnoten: string;
}

function normWs(s: string): string {
  return s.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
}

// ─── Quelle (Fedlex-HTML) ────────────────────────────────────────────────

/** Entfernt Fussnoten-Referenzmarker (<sup><a href="#fn-...">N</a></sup>) — reines Verweis-Rauschen, kein Normtext. */
function stripFussnotenRefs(el: Element): void {
  const sups = Array.from(el.querySelectorAll('sup'));
  for (const sup of sups) {
    const a = sup.querySelector('a[href^="#fn-"]');
    if (a) sup.remove();
  }
}

function textOf(el: Element | null): string {
  if (!el) return '';
  return normWs(el.textContent ?? '');
}

/**
 * Rendert eine <dl>-Aufzählung (dt=Marke, dd=Text) als eingerückte Zeilen.
 * `dd` trägt seinen Text meist DIREKT (kein Kind-Element) — reines
 * `container.children`-Rekurrieren (wie renderBodyChildren) sähe da NICHTS,
 * darum eigener Pfad über `textContent` mit vorab entfernten Unterlisten
 * (verschachtelte lit./Ziff.-Ebenen wie Art. 33 Abs. 1 lit. g Ziff. 1/2).
 */
function renderDl(dl: Element, tiefe = 0): string[] {
  const zeilen: string[] = [];
  const einzug = '  '.repeat(1 + tiefe);
  const kinder = Array.from(dl.children);
  for (let i = 0; i < kinder.length; i++) {
    const k = kinder[i];
    if (k.tagName?.toLowerCase() !== 'dt') continue;
    const marke = textOf(k).replace(/\.\s*$/, '').trim();
    const dd = kinder[i + 1]?.tagName?.toLowerCase() === 'dd' ? kinder[i + 1] : null;
    if (!dd) {
      zeilen.push(`${einzug}${marke}.`);
      continue;
    }
    const ddOhneUnterlisten = dd.cloneNode(true) as Element;
    for (const sub of Array.from(ddOhneUnterlisten.querySelectorAll('dl'))) sub.remove();
    const eigenerText = normWs(ddOhneUnterlisten.textContent ?? '');
    zeilen.push(`${einzug}${marke}. ${eigenerText}`.trimEnd());
    const unterlisten = Array.from(dd.children).filter((c) => c.tagName?.toLowerCase() === 'dl');
    for (const sub of unterlisten) zeilen.push(...renderDl(sub, tiefe + 1));
  }
  return zeilen;
}

/** Rendert eine amtliche <table> zeilenweise, Zellen mit " | " getrennt (Struktur bleibt sichtbar). */
function renderTable(table: Element): string[] {
  const zeilen: string[] = [];
  const rows = Array.from(table.querySelectorAll('tr'));
  for (const row of rows) {
    const zellen = Array.from(row.querySelectorAll('th,td')).map((z) => normWs(z.textContent ?? ''));
    if (zellen.length) zeilen.push(zellen.join(' | '));
  }
  return zeilen;
}

/** Rekursiv: Absatz-<p>, <dl>, <table> und Container in Dokumentreihenfolge rendern. */
function renderBodyChildren(container: Element): string {
  const teile: string[] = [];
  for (const kind of Array.from(container.children)) {
    const tag = kind.tagName?.toLowerCase();
    if (tag === 'p') {
      const cls = kind.getAttribute('class') ?? '';
      if (cls.includes('footnotes')) continue;
      const sup = kind.querySelector('sup');
      let marker = '';
      if (sup && cls.includes('absatz')) {
        const supText = normWs(sup.textContent ?? '');
        if (/^\d+$/.test(supText)) marker = `${supText} `;
      }
      const txt = normWs(kind.textContent ?? '');
      const withoutLeadingNum = marker && txt.startsWith(normWs(sup!.textContent ?? ''))
        ? txt.slice(normWs(sup!.textContent ?? '').length).trim()
        : txt;
      if (marker) teile.push(`${marker}${withoutLeadingNum}`.trim());
      else if (txt) teile.push(txt);
    } else if (tag === 'dl') {
      teile.push(...renderDl(kind));
    } else if (tag === 'table') {
      teile.push(...renderTable(kind));
    } else if (tag === 'div' || tag === 'section') {
      const cls = kind.getAttribute('class') ?? '';
      if (cls.includes('footnotes')) continue;
      const nested = renderBodyChildren(kind);
      if (nested) teile.push(nested);
    } else {
      const txt = normWs(kind.textContent ?? '');
      if (txt) teile.push(txt);
    }
  }
  return teile.filter(Boolean).join('\n');
}

function renderFussnoten(el: Element | null): string {
  if (!el) return '';
  const zeilen: string[] = [];
  for (const p of Array.from(el.querySelectorAll('p[id^="fn-"]'))) {
    const nr = normWs(p.querySelector('sup a')?.textContent ?? '');
    const klon = p.cloneNode(true) as Element;
    const supA = klon.querySelector('sup');
    if (supA) supA.remove();
    const txt = normWs(klon.textContent ?? '');
    if (txt) zeilen.push(nr ? `${nr}. ${txt}` : txt);
  }
  return zeilen.join('\n');
}

/**
 * Reduziert gepinntes Fedlex-Filestore-HTML (scripts/fedlex-cache.sh) zu
 * Klartext je Artikel. `von`/`bis` (Artikelnummer als Zahl, inklusive) filtert
 * optional auf einen Ausschnitt — Grossauflagen (OR, ZGB) sonst zu gross für
 * eine Gruppe.
 */
export function reduziereQuelleHtml(
  html: string,
  von?: number,
  bis?: number,
): Map<string, ArtikelKlartext> {
  const { document } = parseHTML(html);
  const out = new Map<string, ArtikelKlartext>();
  const artikel = Array.from(document.querySelectorAll('article[id^="art_"]'));
  for (const art of artikel) {
    const id = art.getAttribute('id') ?? '';
    const nummer = id.replace(/^art_/, '');
    const nummerZahl = parseInt(nummer.replace(/[^0-9].*$/, ''), 10);
    if (von !== undefined && !Number.isNaN(nummerZahl) && nummerZahl < von) continue;
    if (bis !== undefined && !Number.isNaN(nummerZahl) && nummerZahl > bis) continue;

    const klon = art.cloneNode(true) as Element;
    stripFussnotenRefs(klon);

    // Label bewusst NUR "Art. N" (ohne amtlichen Randtitel aus <h6>): der
    // Bund-Snapshot führt aktuell KEIN `titel`-Feld (0 von 240 DBG-Einträgen,
    // Stichprobe) — ein Vergleich der Randtitel wäre ein systematischer
    // Scheinfund über JEDEN Artikel hinweg, kein realer Korpus-Fehler (T2-
    // Lehre: keine Harness-Artefakte einstreuen). `div.collapseable` enthält
    // ohnehin nur den Artikelkörper, nicht das <h6>.
    const label = `Art. ${nummer}`;

    const body = klon.querySelector('div.collapseable') ?? klon;
    const fussnotenEl = body.querySelector('div.footnotes');
    const fussnoten = renderFussnoten(fussnotenEl);
    const text = renderBodyChildren(body);

    out.set(nummer, { artikel: nummer, label, text, fussnoten });
  }
  return out;
}

// ─── Snapshot (public/normtext/**.json) ─────────────────────────────────

function renderSnapshotBlock(b: NormSnapshot['bloecke'][number]): string {
  const zeilen: string[] = [];
  if (b.titel) {
    zeilen.push(normWs(b.text));
    return zeilen.join('\n');
  }
  const marker = b.absatz ? `${b.absatz} ` : '';
  const haupttext = normWs(b.text ?? '');
  if (marker || haupttext) zeilen.push(`${marker}${haupttext}`.trim());
  for (const item of b.items ?? []) {
    const einzug = '  '.repeat(1 + (item.tiefe ?? 0));
    zeilen.push(`${einzug}${item.marke}. ${normWs(item.text)}`.trimEnd());
  }
  for (const zeile of b.tabelle ?? []) {
    zeilen.push(`  ${normWs(zeile.beschreibung)} | ${normWs(zeile.betrag)}`);
  }
  if (b.mehrspaltig) {
    const kopf = b.mehrspaltig.spalten?.map((s) => s.titel) ?? b.mehrspaltig.kopf ?? [];
    if (kopf.length) zeilen.push(`  ${kopf.map(normWs).join(' | ')}`);
    for (const zeile of b.mehrspaltig.zeilen) {
      zeilen.push(`  ${zeile.map(normWs).join(' | ')}`);
    }
  }
  if (b.verweis) {
    zeilen.push(`  ${normWs(b.verweis.etikett)} ${normWs(b.verweis.ziffern)}`);
  }
  return zeilen.filter(Boolean).join('\n');
}

/**
 * Reduziert die Snapshot-Einträge EINES Erlasses zu Klartext je Artikel, im
 * selben Format wie reduziereQuelleHtml. `fussnoten` bleibt immer leer — der
 * Snapshot (src/lib/normtext/typen.ts) führt keinen separaten Fussnoten-Text.
 */
export function reduziereSnapshot(eintraege: NormSnapshot[]): Map<string, ArtikelKlartext> {
  const out = new Map<string, ArtikelKlartext>();
  for (const e of eintraege) {
    const zeilen = e.bloecke.map(renderSnapshotBlock).filter(Boolean);
    out.set(e.artikel, {
      artikel: e.artikel,
      label: e.artikelLabel,
      text: zeilen.join('\n'),
      fussnoten: '',
    });
  }
  return out;
}

export function formatiereArtikel(a: ArtikelKlartext): string {
  const teile = [`${a.label}\n${a.text}`];
  if (a.fussnoten) teile.push(`--- Fussnoten (Quelle) ---\n${a.fussnoten}`);
  return teile.join('\n');
}
