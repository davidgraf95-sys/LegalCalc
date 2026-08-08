// scripts/plan/bildHtml.ts — Darstellungs-Bausteine des Lagebild-Generators
// (Schritt QS-PLAN-BILD, Mehrseiten-Ausbau Go David 4.8.2026).
//
// Hier liegen die geteilten Bausteine ALLER vier Seiten: Design-Tokens/CSS,
// Escaping, Navigations-Leiste, Dokument-Rahmen und die kleinen
// Wiederhol-Bausteine (Kacheln, Tabellen-Container, Status-Punkte).
// Keine Datenbeschaffung, keine Seiten-Inhalte — die liegen in
// `bildDaten.ts` bzw. `bildSeiten.ts`.

/** Text → HTML-Text. Einzige Escaping-Stelle des Generators. */
export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Seiten-Register — die vier Seiten und ihre Dateinamen
// ---------------------------------------------------------------------------
/** Die Index-Seite heisst IMMER `plan-bild.html` (bzw. der per `--out`
 *  gewählte Name): App-Kachel und LaunchAgent zeigen auf diesen Anker. Die
 *  drei Zusatzseiten hängen ihr Suffix an DENSELBEN Präfix — so bleiben die
 *  Verweise relativ und funktionieren auch unter `file://`. */
export const SEITEN = [
  { schluessel: 'lagebild', suffix: '', titel: 'Lagebild' },
  { schluessel: 'projekt', suffix: '-projekt', titel: 'Projekt & Produkt' },
  { schluessel: 'geschichte', suffix: '-geschichte', titel: 'Geschichte' },
  { schluessel: 'methode', suffix: '-methode', titel: 'Arbeitsweise' },
] as const;

export type SeitenSchluessel = (typeof SEITEN)[number]['schluessel'];

/** Live-Plattform (Prod-Deploy von `main`; Beleg STRUKTUR.md, Prod-Re-Audit 2.8.2026). */
export const LIVE_URL = 'https://lexmetrik.vercel.app';

/** `tmp/plan-bild.html` → `tmp/plan-bild-projekt.html` usw. (voller Pfad). */
export function seitenPfad(indexPfad: string, schluessel: SeitenSchluessel): string {
  const suffix = SEITEN.find((s) => s.schluessel === schluessel)?.suffix ?? '';
  const m = indexPfad.match(/^(.*?)(\.html?)$/i);
  return m ? `${m[1]}${suffix}${m[2]}` : `${indexPfad}${suffix}`;
}

/** Nur der Dateiname — das ist der relative Verweis in der Navigations-Leiste. */
export function seitenDatei(indexPfad: string, schluessel: SeitenSchluessel): string {
  return seitenPfad(indexPfad, schluessel).replace(/^.*\//, '');
}

// ---------------------------------------------------------------------------
// Design-Tokens + Stylesheet (unverändert aus der Ein-Seiten-Fassung
// übernommen, ergänzt um Navigations-Leiste, Tabellen und Kanton-Raster)
//
// Zwei Regeln stehen hier ohne Kommentar im CSS und darum hier:
//  * Gegen horizontales Scrollen wirkt AUSSCHLIESSLICH der `.tabelle`-Container
//    (`overflow-x:auto`). Ein `overflow-x` auf `body` wurde bewusst verworfen:
//    `hidden` erzeugt einen Scroll-Container und setzt die sticky
//    Navigations-Leiste ausser Kraft, `clip` ist ein unnötiges Risiko am
//    selben Ort. Jede breite Fläche gehört stattdessen in ihren eigenen
//    Scroll-Container.
//  * Im Template-Literal sind KEINE Backticks zulässig (sie beenden den
//    String) — Kommentare zum CSS gehören deshalb hierher.
// ---------------------------------------------------------------------------
export const STIL = `
  :root { --paper:#FCFAF6; --raised:#FFFEFC; --ink:#1C1A15; --soft:#4A463C; --faint:#7A7466;
    --line:#E4DFD2; --gold:#8A6D1F; --gold-bg:#F5EEDA; --sage:#4E6B45; --sage-bg:#EAEBE2;
    --slate:#4A5350; --slate-bg:#E9E9E5; --warn:#8A5417; --warn-bg:#F5EBDE; --danger:#A03A28; --danger-bg:#F2E5DD; }
  @media (prefers-color-scheme: dark) { :root { --paper:#16150F; --raised:#201E17; --ink:#ECE8DD;
    --soft:#B8B2A2; --faint:#857E6E; --line:#35311F; --gold:#C9A94E; --gold-bg:#2C2510;
    --sage:#96B38C; --sage-bg:#22251B; --slate:#A9B3AE; --slate-bg:#21231F; --warn:#D9A75B;
    --warn-bg:#312515; --danger:#D98A75; --danger-bg:#2C1D15; } }
  * { box-sizing: border-box; }
  body { background:var(--paper); color:var(--ink); margin:0; line-height:1.55;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; }
  .wrap { max-width:1020px; margin:0 auto; padding:2.5rem 1.25rem 5rem; }
  h1,h2,h3 { font-family:Charter,Georgia,Cambria,"Times New Roman",serif; text-wrap:balance; margin:0; }
  h1 { font-size:2.1rem; } h2 { font-size:1.4rem; margin-bottom:.35rem; } h3 { font-size:1.05rem; }
  p { margin:.4rem 0; } section { margin-top:3rem; }
  .lede { color:var(--soft); max-width:46rem; }
  .eyebrow { text-transform:uppercase; letter-spacing:.14em; font-size:.72rem; font-weight:600; color:var(--gold); margin-bottom:.5rem; }
  .sub { color:var(--faint); font-size:.82rem; } .quelle { font-size:.78rem; color:var(--faint); }
  .id { font-size:.75rem; color:var(--faint); font-family:ui-monospace,"SF Mono",Menlo,monospace; }
  header.top { border-bottom:3px double var(--line); padding-bottom:1.4rem; }
  .stand { display:inline-block; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase; color:var(--faint);
    border:1px solid var(--line); border-radius:999px; padding:.15rem .7rem; margin-bottom:.9rem; }
  .lage { font-size:1.12rem; margin-top:.8rem; }
  .tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:.7rem; margin-top:1rem; }
  .tile { background:var(--raised); border:1px solid var(--line); border-radius:6px; padding:.8rem .9rem; }
  .tile b { display:block; font-size:1.5rem; font-variant-numeric:tabular-nums; font-family:Charter,Georgia,serif; }
  .tile span { font-size:.8rem; color:var(--soft); }
  .chip { display:inline-block; font-size:.72rem; font-weight:600; border-radius:999px; padding:.08rem .55rem; white-space:nowrap; vertical-align:middle; }
  .chip.done{background:var(--sage-bg);color:var(--sage);} .chip.ready{background:var(--slate-bg);color:var(--slate);}
  .chip.wip{background:var(--gold-bg);color:var(--gold);} .chip.block{background:var(--danger-bg);color:var(--danger);}
  .chip.gold{background:var(--gold-bg);color:var(--gold);}
  .panel { border:1px solid var(--warn); border-left-width:5px; border-radius:6px; background:var(--warn-bg); padding:1rem 1.2rem; margin-top:1rem; }
  .panel h2 { color:var(--warn); } .panel ul { margin:.5rem 0 0; padding-left:1.2rem; } .panel li { margin:.5rem 0; }
  .liste { list-style:none; margin:1rem 0 0; padding:0; display:flex; flex-direction:column; gap:.55rem; }
  .liste li { background:var(--raised); border:1px solid var(--line); border-radius:6px; padding:.7rem .95rem; display:flex; gap:.6rem; align-items:baseline; }
  ol.queue { margin:1rem 0 0; padding:0; list-style:none; counter-reset:q; display:flex; flex-direction:column; gap:.55rem; }
  ol.queue li { background:var(--raised); border:1px solid var(--line); border-radius:6px; padding:.7rem .95rem .7rem 3rem; position:relative; counter-increment:q; }
  ol.queue li::before { content:counter(q); position:absolute; left:.85rem; top:.72rem; width:1.5rem; height:1.5rem; border-radius:50%;
    background:var(--gold-bg); color:var(--gold); font-weight:700; font-size:.85rem; display:flex; align-items:center; justify-content:center; }
  .phasen { display:flex; flex-direction:column; margin-top:1rem; border-left:2px solid var(--line); }
  .phase { display:grid; grid-template-columns:2rem 1fr; gap:.5rem; padding:.45rem .6rem .45rem 0; }
  .phase .dot { width:.9rem; height:.9rem; border-radius:50%; border:2px solid var(--faint); background:var(--paper); margin-left:-.53rem; margin-top:.3rem; }
  .phase.done .dot { background:var(--sage); border-color:var(--sage); }
  .phase.now { background:var(--gold-bg); border-radius:0 6px 6px 0; }
  .phase.now .dot { background:var(--gold); border-color:var(--gold); }
  .phase .t { font-size:.92rem; } .phase .t .sub { display:block; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:.8rem; margin-top:1rem; }
  .card { background:var(--raised); border:1px solid var(--line); border-radius:6px; padding:.95rem 1.05rem; display:flex; flex-direction:column; gap:.45rem; }
  .card .kopf { display:flex; justify-content:space-between; align-items:baseline; gap:.5rem; }
  .card .zweck { font-size:.88rem; color:var(--soft); flex:1; }
  .bar { height:6px; border-radius:3px; background:var(--slate-bg); overflow:hidden; }
  .bar i { display:block; height:100%; background:var(--sage); }
  .fortschritt { font-size:.78rem; color:var(--faint); font-variant-numeric:tabular-nums; }
  .card .next { font-size:.84rem; }
  details { border-top:1px dashed var(--line); padding-top:.4rem; }
  summary { cursor:pointer; font-size:.78rem; color:var(--faint); }
  summary:focus-visible, .kopier:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
  details ul { margin:.4rem 0 0; padding:0; list-style:none; font-size:.8rem; display:flex; flex-direction:column; gap:.25rem; }
  details li { display:flex; gap:.45rem; align-items:baseline; }
  .s { width:.55rem; height:.55rem; border-radius:50%; flex:none; position:relative; top:.05rem; }
  .s.done{background:var(--sage);} .s.ready{background:var(--faint);opacity:.45;} .s.block{background:var(--danger);} .s.wip{background:var(--gold);}
  .kopier { font:inherit; font-size:.72rem; font-weight:600; color:var(--gold); background:var(--gold-bg);
    border:1px solid var(--gold); border-radius:999px; padding:.12rem .65rem; cursor:pointer; transition:background .12s,color .12s; }
  .kopier:hover { background:var(--gold); color:var(--paper); }
  .empfehlung { border:1px solid var(--sage); border-left-width:5px; border-radius:6px; background:var(--sage-bg); padding:1rem 1.2rem; margin-top:1rem; }
  .empfehlung .kopier { font-size:.85rem; padding:.3rem .95rem; }
  .card { box-shadow:0 1px 2px rgba(0,0,0,.05); transition:box-shadow .15s; }
  .card:hover { box-shadow:0 3px 12px rgba(0,0,0,.09); }
  /* Wirkungsbereich-Farben (Auftrag David 8.8.2026: Zugehörigkeit sichtbar machen).
     Je Bereich EIN Variablen-Paar; Chips und Karten lesen dieselben Variablen. */
  .bz-ui{--bz:#31597B;--bz-bg:#E4EDF5;} .bz-logik{--bz:#8A3040;--bz-bg:#F5E3E6;}
  .bz-daten{--bz:#3F6B2F;--bz-bg:#E7F0DF;} .bz-halt{--bz:#5C4A80;--bz-bg:#ECE6F4;}
  .bz-ausl{--bz:#2E6B64;--bz-bg:#E0EFEC;} .bz-ki{--bz:#8A6D1F;--bz-bg:#F5EEDA;}
  .bz-rest{--bz:#4A5350;--bz-bg:#E9E9E5;}
  @media (prefers-color-scheme: dark) {
    .bz-ui{--bz:#8FB6D6;--bz-bg:#1A2530;} .bz-logik{--bz:#D9909C;--bz-bg:#2C171B;}
    .bz-daten{--bz:#9CC287;--bz-bg:#1F2718;} .bz-halt{--bz:#B5A5D8;--bz-bg:#241E30;}
    .bz-ausl{--bz:#8EC4BC;--bz-bg:#17302C;} .bz-ki{--bz:#C9A94E;--bz-bg:#2C2510;}
    .bz-rest{--bz:#A9B3AE;--bz-bg:#21231F;}
  }
  .chip.bz { background:var(--bz-bg); color:var(--bz); }
  .card.bz { border-left:4px solid var(--bz); }
  .card.bz h3 { color:var(--bz); }
  footer { margin-top:3rem; border-top:1px solid var(--line); padding-top:1rem; font-size:.8rem; color:var(--faint); }
  .hinweis { font-size:.82rem; color:var(--faint); margin-top:.6rem; }
  #toast { position:fixed; bottom:1rem; left:50%; transform:translateX(-50%); background:var(--ink); color:var(--paper);
    border-radius:6px; padding:.5rem 1rem; font-size:.85rem; opacity:0; transition:opacity .2s; pointer-events:none; }
  a { color:var(--gold); text-decoration-thickness:1px; text-underline-offset:2px; }
  a:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
  .springen { font-size:.82rem; color:var(--faint); margin-top:.9rem; display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; }
  .springen a { color:var(--soft); text-decoration:none; border:1px solid var(--line); border-radius:999px; padding:.12rem .65rem; background:var(--raised); }
  .springen a:hover { border-color:var(--gold); color:var(--gold); }
  html { scroll-behavior:smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior:auto; } }
  #filter { font:inherit; font-size:.9rem; color:var(--ink); background:var(--raised); border:1px solid var(--line);
    border-radius:6px; padding:.5rem .8rem; width:100%; max-width:26rem; margin-top:1rem; }
  #filter:focus-visible { outline:2px solid var(--gold); outline-offset:1px; }
  /* --- Navigations-Leiste (Mehrseiten-Ausbau 4.8.2026) --------------------- */
  nav.haupt { position:sticky; top:0; z-index:10; background:var(--raised); border-bottom:1px solid var(--line); }
  nav.haupt .inner { max-width:1020px; margin:0 auto; padding:.5rem 1.25rem; display:flex; flex-wrap:wrap;
    align-items:center; gap:.35rem .5rem; }
  nav.haupt .marke { font-family:Charter,Georgia,serif; font-weight:700; letter-spacing:.02em; margin-right:.5rem; }
  nav.haupt a.seite { font-size:.85rem; color:var(--soft); text-decoration:none; border:1px solid transparent;
    border-radius:999px; padding:.2rem .7rem; }
  nav.haupt a.seite:hover { background:var(--slate-bg); }
  nav.haupt a.seite[aria-current="page"] { color:var(--gold); background:var(--gold-bg); border-color:var(--gold); font-weight:600; }
  nav.haupt a.live { margin-left:auto; font-size:.82rem; font-weight:600; color:var(--sage); background:var(--sage-bg);
    border:1px solid var(--sage); border-radius:999px; padding:.2rem .8rem; text-decoration:none; }
  nav.haupt a.live:hover { filter:brightness(1.05); }
  /* --- Tabellen: immer im eigenen Scroll-Container, nie die Seite schieben -- */
  .tabelle { overflow-x:auto; margin-top:.6rem; border:1px solid var(--line); border-radius:6px; background:var(--raised); }
  .tabelle table { border-collapse:collapse; width:100%; font-size:.82rem; min-width:34rem; }
  .tabelle th, .tabelle td { text-align:left; padding:.35rem .7rem; border-bottom:1px solid var(--line); white-space:nowrap; }
  .tabelle th { color:var(--faint); font-weight:600; font-size:.75rem; text-transform:uppercase; letter-spacing:.06em; }
  .tabelle td.titel { white-space:normal; min-width:16rem; }
  .tabelle tr:last-child td { border-bottom:none; }
  .tabelle td.num { text-align:right; font-variant-numeric:tabular-nums; }
  /* --- Kanton-Raster (26 Felder) ----------------------------------------- */
  .kantone { display:grid; grid-template-columns:repeat(auto-fit,minmax(4.6rem,1fr)); gap:.35rem; margin-top:.8rem; }
  .kantone div { background:var(--raised); border:1px solid var(--line); border-radius:5px; padding:.3rem .45rem; text-align:center; }
  .kantone b { display:block; font-size:.95rem; font-variant-numeric:tabular-nums; }
  .kantone span { font-size:.7rem; color:var(--faint); letter-spacing:.06em; }
  .kantone div.leer b { color:var(--faint); opacity:.5; }
  /* --- Gruppen-Listen (Werkzeug-Katalog, Zeitachse, Glossar) -------------- */
  .gruppe { margin-top:1.2rem; }
  .gruppe > h3 { display:flex; justify-content:space-between; align-items:baseline; gap:.5rem; border-bottom:1px solid var(--line); padding-bottom:.25rem; }
  ul.eintraege { list-style:none; margin:.5rem 0 0; padding:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(15rem,1fr)); gap:.2rem .8rem; font-size:.85rem; }
  ul.eintraege li { display:flex; gap:.45rem; align-items:baseline; }
  dl.glossar { margin:1rem 0 0; }
  dl.glossar dt { font-weight:600; margin-top:.9rem; }
  dl.glossar dd { margin:.1rem 0 0; color:var(--soft); font-size:.9rem; }
  .zeitachse { margin-top:1rem; }
  .monat { border-left:2px solid var(--line); padding:.15rem 0 .6rem 1rem; }
  .monat > b { font-family:Charter,Georgia,serif; font-size:1rem; }
  .monat ul { margin:.3rem 0 0; padding-left:1.1rem; font-size:.85rem; color:var(--soft); }
  .monat ul li { margin:.12rem 0; }
`;

// ---------------------------------------------------------------------------
// Dokument-Rahmen
// ---------------------------------------------------------------------------
/** Navigations-Leiste — vier relative Verweise + Live-Link, aktive Seite markiert. */
export function navigation(indexPfad: string, aktiv: SeitenSchluessel): string {
  const links = SEITEN.map((s) => {
    const href = seitenDatei(indexPfad, s.schluessel);
    const cur = s.schluessel === aktiv ? ' aria-current="page"' : '';
    return `<a class="seite" href="${esc(href)}"${cur}>${esc(s.titel)}</a>`;
  }).join('\n    ');
  return `<nav class="haupt" aria-label="Seiten dieses Lagebilds">
  <div class="inner">
    <span class="marke">LexMetrik</span>
    ${links}
    <a class="live" href="${LIVE_URL}" target="_blank" rel="noopener">Zur Live-Plattform ↗</a>
  </div>
</nav>`;
}

export interface RahmenOpts {
  /** Pfad der INDEX-Seite (`--out`) — Basis für alle relativen Verweise. */
  indexPfad: string;
  aktiv: SeitenSchluessel;
  titel: string;
  watch: number | null;
  inhalt: string;
  /** Optionales Seiten-Skript (nur die Index-Seite braucht eines). */
  skript?: string;
  /** Optionaler Zusatz direkt vor `</body>` (z. B. Toast-Element). */
  nachSpann?: string;
}

/** Vollständiges HTML-Dokument mit Nav, Inhalt und gemeinsamer Fussnote. */
export function rahmen(o: RahmenOpts): string {
  const refresh = o.watch ? `<meta http-equiv="refresh" content="${Math.max(15, Math.min(o.watch, 300))}">` : '';
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${refresh}
<title>${esc(o.titel)}</title>
<style>${STIL}</style>
</head>
<body>
${navigation(o.indexPfad, o.aktiv)}
<div class="wrap">
${o.inhalt}
</div>
${o.nachSpann ?? ''}
${o.skript ? `<script>\n${o.skript}\n</script>` : ''}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Kleine Wiederhol-Bausteine
// ---------------------------------------------------------------------------
/** Kopfzeile einer Seite: Stand-Stempel, Titel, Einleitung, optionaler Zusatz. */
export function seitenKopf(o: { stand: string; watch: number | null; marke: string; h1: string; lede: string; extra?: string }): string {
  return `<header class="top">
  <span class="stand">${esc(o.marke)} · erzeugt ${esc(o.stand)}${o.watch ? ' · aktualisiert sich selbst' : ''}</span>
  <h1>${esc(o.h1)}</h1>
  ${o.lede ? `<p class="lede">${o.lede}</p>` : ''}
  ${o.extra ?? ''}
</header>`;
}

/** Kachel-Reihe. `wert` ist bereits gezählt; `null` wird als «—» ehrlich gezeigt. */
export function kacheln(items: { wert: number | string | null; label: string }[]): string {
  const inner = items
    .map((i) => `<div class="tile"><b>${esc(String(i.wert ?? '—'))}</b><span>${i.label}</span></div>`)
    .join('\n    ');
  return `<div class="tiles">\n    ${inner}\n  </div>`;
}

/** Tabelle in eigenem Scroll-Container (kein horizontales Scrollen der Seite). */
export function tabelle(kopfzeilen: string[], zeilen: string[][], klassen: string[] = []): string {
  const th = kopfzeilen.map((k) => `<th>${esc(k)}</th>`).join('');
  const tr = zeilen
    .map((z) => `<tr>${z.map((c, i) => `<td${klassen[i] ? ` class="${klassen[i]}"` : ''}>${esc(c)}</td>`).join('')}</tr>`)
    .join('\n');
  return `<div class="tabelle"><table><thead><tr>${th}</tr></thead><tbody>\n${tr}\n</tbody></table></div>`;
}

// ---------------------------------------------------------------------------
// Laien-Block «Was gerade passiert» (Schritt QS-PLAN-BILD-LAGE, Auftrag David
// 5.8.2026: «ich brauche einfachere Sprache um zu verstehen was gerade passiert»)
//
// Drei Bauregeln dieses Blocks:
//
//  * **Jeder Satz steht hier statisch im Code**, gefüllt werden nur die Werte.
//    Kein Modell zur Laufzeit, keine Formulierung aus Repo-Prosa — gleicher
//    Repo-Stand ergibt gleichen Text (§2). Insbesondere werden die `Anlass:`-
//    Texte der ROADMAP NICHT übernommen: sie sind Fachprosa und würden den
//    Zweck des Blocks (Laiensprache) genau verfehlen.
//  * **Keine eigenen Design-Tokens.** Der Block nutzt ausschliesslich
//    bestehende Klassen aus `STIL`. Würde er das Stylesheet ergänzen, änderten
//    sich alle vier Seiten — die drei anderen sollen byte-gleich bleiben.
//  * **Zweitanzeige, nicht zweite Wahrheit (§5).** «Wartet auf David» erscheint
//    weiter unten auch fachlich (Sektion `#david`); beide Fassungen entstehen
//    aus demselben Resolver-Ergebnis, dieser Block verweist auf jene Sektion.
// ---------------------------------------------------------------------------

/**
 * Datei-Fläche → Alltagsbegriff. Statische Zuordnung, längster Präfix gewinnt;
 * ein unbekannter Pfad bleibt UNÜBERSETZT stehen (lieber ein technischer Pfad
 * als ein erfundener Oberbegriff, §8).
 *
 * Die Tabelle beschreibt, was ein Bereich für den Nutzer BEDEUTET, nicht was
 * er technisch enthält — «src/lib» heisst darum «Rechen- und Rechtslogik» und
 * nicht «Bibliotheks-Verzeichnis».
 */
export const FLAECHEN_KLARTEXT: readonly (readonly [string, string])[] = [
  ['scripts/plan', 'Werkzeuge der Bau-Planung'],
  ['scripts/gegenpruefung', 'Werkzeuge der Gegenprüfung'],
  ['scripts', 'Hilfsprogramme hinter den Kulissen'],
  ['src/pages', 'sichtbare Seiten der App'],
  ['src/components', 'Bausteine der Benutzeroberfläche'],
  ['src/lib', 'Rechen- und Rechtslogik'],
  ['src/tests', 'automatische Tests'],
  ['src/index.css', 'Erscheinungsbild der App'],
  ['e2e', 'Klick-Tests im Browser'],
  ['public/normtext', 'gespeicherte Gesetzestexte'],
  ['public/rechtsprechung', 'gespeicherte Gerichtsentscheide'],
  ['public', 'ausgelieferte Dateien'],
  ['daten', 'Rohdaten-Ablage'],
  ['fahrplaene', 'Detailpläne der Baustellen'],
  ['archiv', 'archivierte Detailpläne'],
  ['bibliothek', 'abgelegtes Recherche-Wissen'],
  ['ROADMAP', 'der Projektplan'],
  ['STRUKTUR.md', 'die Projekt-Landkarte'],
  ['CLAUDE.md', 'die Grundregeln des Projekts'],
  ['DESIGN-REGLEMENT.md', 'die Gestaltungsregeln'],
  ['.claude', 'Arbeitsregeln der KI-Sessions'],
  ['.github', 'die Prüfstrasse (automatische Kontrollen)'],
  ['vercel.json', 'die Auslieferung ins Internet'],
  ['package.json', 'die Bau- und Prüfbefehle'],
];

/**
 * Deckt der Tabellen-Eintrag diesen Pfad? Nur an einer TRENNSTELLE — hinter dem
 * Präfix steht das Pfad-Ende oder eines von `/ . -`. Ohne diese Bedingung
 * schluckte «scripts» auch ein künftiges `scriptsammlung/`; mit ihr trägt
 * «ROADMAP» weiterhin `ROADMAP.md` UND `ROADMAP-CHRONIK.md`.
 */
function deckt(pfad: string, praefix: string): boolean {
  if (!pfad.startsWith(praefix)) return false;
  const nach = pfad[praefix.length];
  return nach === undefined || nach === '/' || nach === '.' || nach === '-';
}

/**
 * `kollision:`-Globs → Alltagsbegriffe, ohne Wiederholung und in der
 * Reihenfolge ihres ersten Auftretens. Zwei Globs desselben Bereichs
 * (`src/pages/**` und `src/pages/gesetze.tsx`) ergeben EINEN Eintrag.
 */
export function flaechenKlartext(globs: string[]): string[] {
  const out: string[] = [];
  for (const glob of globs) {
    const pfad = glob.replace(/[*?{[].*$/, '').replace(/\/+$/, '');
    let treffer: string | null = null;
    let laenge = -1;
    for (const [praefix, wort] of FLAECHEN_KLARTEXT) {
      if (deckt(pfad, praefix) && praefix.length > laenge) {
        treffer = wort;
        laenge = praefix.length;
      }
    }
    const wort = treffer ?? glob;
    if (!out.includes(wort)) out.push(wort);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Wirkungsbereiche — «welchen Teil des Projekts berührt dieser Schritt?»
// (Auftrag David 5.8.2026: «klassifiziere in themenbereiche» · «sessions
// kommunizieren mit diesen bezeichnungen»)
//
// Abgeleitet wird MECHANISCH aus denselben `kollision:`-Globs wie
// `flaechenKlartext` — eine Wahrheit, zwei Auflösungsgrade (§5): der
// Alltagsbegriff sagt, WAS die Datei ist, der Wirkungsbereich, in welches der
// sechs Themenfelder sie fällt. Eine gepflegte Zweitliste je Schritt gäbe es
// nicht, weil sie still veralten würde.
// ---------------------------------------------------------------------------

/** Auffangkategorie für Pfade ohne Zuordnung — ehrlich benannt statt geraten (§8). */
export const UEBRIGE_TECHNIK = 'Übrige Technik';

/**
 * Die sechs Wirkungsbereiche in KANONISCHER Reihenfolge. Sie bestimmt zugleich
 * die Reihenfolge der Badges: sonst entschiede die zufällige Reihenfolge der
 * `kollision:`-Globs darüber, wie ein Schritt beschriftet aussieht (§2).
 */
export const WIRKUNGSBEREICHE = [
  'Benutzeroberfläche',
  'Rechtslogik & Berechnungen',
  'Gesetzes- & Urteilsdaten',
  'Datenhaltung',
  'Auslieferung & Prüfstrasse',
  'KI-Arbeitsprozesse',
] as const;

export type Wirkungsbereich = (typeof WIRKUNGSBEREICHE)[number] | typeof UEBRIGE_TECHNIK;

/** Je Bereich ein Laien-Satz — die Definition für die Glossar-Seite. */
export const BEREICH_ERKLAERUNG: readonly (readonly [Wirkungsbereich, string])[] = [
  ['Benutzeroberfläche', 'Alles, was man auf dem Bildschirm sieht und anklickt: Seiten, Formulare, Navigation, Erscheinungsbild.'],
  ['Rechtslogik & Berechnungen', 'Die Rechenkerne der Werkzeuge — Fristen, Streitwerte, Tarife, Vorlagen-Inhalte. Ein Fehler hier wird zu einer falschen Rechtsauskunft.'],
  ['Gesetzes- & Urteilsdaten', 'Das Beschaffen, Speichern und Überwachen der Gesetzestexte und Gerichtsentscheide aus den amtlichen Quellen.'],
  ['Datenhaltung', 'Wo die Daten liegen und wie sie dorthin kommen: Datenbank, Abgleich-Läufe, eingefrorene Vergleichsstände.'],
  ['Auslieferung & Prüfstrasse', 'Der Weg vom fertigen Code zur öffentlichen Plattform — samt den automatischen Prüfungen, die vorher bestehen müssen.'],
  ['KI-Arbeitsprozesse', 'Wie gebaut wird statt was: Projektplan, Detailpläne, Arbeitsregeln der KI-Sessions, abgelegtes Recherche-Wissen.'],
  [UEBRIGE_TECHNIK, 'Technische Flächen, die in keines der sechs Felder fallen — bewusst nicht eingeordnet, statt eine Einordnung zu erfinden.'],
];

/**
 * Pfadpräfix → Wirkungsbereich. Längster Präfix gewinnt (dieselbe Trennstellen-
 * Regel wie `flaechenKlartext`), Mehrfach-Zuordnung eines Schritts ist normal.
 *
 * Zwei Abgrenzungen sind bewusst gesetzt und stehen darum hier:
 *  * `src/lib/normtext` und `src/lib/rechtsprechung` zählen zu den DATEN, nicht
 *    zur Rechtslogik — dort wird geladen und dargestellt, nicht gerechnet.
 *    Jeder andere `src/lib`-Pfad gilt im Zweifel als Rechtslogik, weil eine
 *    zu Unrecht als harmlos einsortierte Rechenfläche der teurere Fehler wäre.
 *  * `scripts/check-*` ist Prüfstrasse, `scripts/plan` Arbeitsprozess,
 *    `scripts/fedlex*`/`scripts/normtext` Daten — «scripts» allein sagt nichts.
 */
export const BEREICH_PFADE: readonly (readonly [string, Wirkungsbereich])[] = [
  ['src/pages', 'Benutzeroberfläche'],
  ['src/components', 'Benutzeroberfläche'],
  ['src/index.css', 'Benutzeroberfläche'],
  ['index.html', 'Benutzeroberfläche'],
  ['tailwind.config.js', 'Benutzeroberfläche'],
  ['DESIGN-REGLEMENT', 'Benutzeroberfläche'],

  ['src/lib', 'Rechtslogik & Berechnungen'],
  ['src/data', 'Rechtslogik & Berechnungen'],

  ['src/lib/normtext', 'Gesetzes- & Urteilsdaten'],
  ['src/lib/rechtsprechung', 'Gesetzes- & Urteilsdaten'],
  ['public/normtext', 'Gesetzes- & Urteilsdaten'],
  ['public/rechtsprechung', 'Gesetzes- & Urteilsdaten'],
  ['scripts/normtext', 'Gesetzes- & Urteilsdaten'],
  ['scripts/rechtsprechung', 'Gesetzes- & Urteilsdaten'],
  ['scripts/fedlex', 'Gesetzes- & Urteilsdaten'],
  ['daten', 'Gesetzes- & Urteilsdaten'],

  ['scripts/datenhaltung', 'Datenhaltung'],
  ['turso', 'Datenhaltung'],
  ['golden', 'Datenhaltung'],

  ['.github', 'Auslieferung & Prüfstrasse'],
  ['vercel.json', 'Auslieferung & Prüfstrasse'],
  ['package.json', 'Auslieferung & Prüfstrasse'],
  ['package-lock.json', 'Auslieferung & Prüfstrasse'],
  ['knip.json', 'Auslieferung & Prüfstrasse'],
  ['scripts/check', 'Auslieferung & Prüfstrasse'],
  ['scripts/gegenpruefung', 'Auslieferung & Prüfstrasse'],
  ['e2e', 'Auslieferung & Prüfstrasse'],
  ['src/tests', 'Auslieferung & Prüfstrasse'],

  ['.claude', 'KI-Arbeitsprozesse'],
  ['scripts/plan', 'KI-Arbeitsprozesse'],
  ['ROADMAP', 'KI-Arbeitsprozesse'],
  ['STRUKTUR.md', 'KI-Arbeitsprozesse'],
  ['CLAUDE.md', 'KI-Arbeitsprozesse'],
  ['fahrplaene', 'KI-Arbeitsprozesse'],
  ['archiv', 'KI-Arbeitsprozesse'],
  ['bibliothek', 'KI-Arbeitsprozesse'],
];

/**
 * `kollision:`-Globs → Wirkungsbereiche, ohne Wiederholung und in kanonischer
 * Reihenfolge. Ein Schritt darf mehrere tragen; ein nicht zuordenbarer Pfad
 * erzeugt «Übrige Technik». Ohne Globs bleibt die Liste LEER — «keine Fläche
 * deklariert» ist etwas anderes als «keinem Bereich zuzuordnen» (§8).
 */
export function wirkungsbereiche(globs: string[]): Wirkungsbereich[] {
  const gefunden = new Set<Wirkungsbereich>();
  for (const glob of globs) {
    const pfad = glob.replace(/[*?{[].*$/, '').replace(/\/+$/, '');
    let treffer: Wirkungsbereich | null = null;
    let laenge = -1;
    for (const [praefix, bereich] of BEREICH_PFADE) {
      if (deckt(pfad, praefix) && praefix.length > laenge) {
        treffer = bereich;
        laenge = praefix.length;
      }
    }
    gefunden.add(treffer ?? UEBRIGE_TECHNIK);
  }
  const out: Wirkungsbereich[] = WIRKUNGSBEREICHE.filter((b) => gefunden.has(b));
  if (gefunden.has(UEBRIGE_TECHNIK)) out.push(UEBRIGE_TECHNIK);
  return out;
}

/** CSS-Klasse eines Wirkungsbereichs — Farbzuordnung (Auftrag David 8.8.2026,
 *  «visuell klarer, was zu was gehört»). EINE Tabelle für Chips und Karten. */
export function bereichKlasse(b: Wirkungsbereich | string): string {
  switch (b) {
    case 'Benutzeroberfläche': return 'bz-ui';
    case 'Rechtslogik & Berechnungen': return 'bz-logik';
    case 'Gesetzes- & Urteilsdaten': return 'bz-daten';
    case 'Datenhaltung': return 'bz-halt';
    case 'Auslieferung & Prüfstrasse': return 'bz-ausl';
    case 'KI-Arbeitsprozesse': return 'bz-ki';
    default: return 'bz-rest';
  }
}

/**
 * Wirkungsbereiche als Badge-Reihe — seit 8.8.2026 farbcodiert (Auftrag David;
 * vorher bewusst farblos, um die Seiten byte-gleich zu halten). Der Text bleibt
 * die primäre Unterscheidung, die Farbe kommt dazu — farbunabhängig lesbar.
 */
export function bereichsBadges(globs: string[]): string {
  const b = wirkungsbereiche(globs);
  if (!b.length) return '';
  return ` ${b.map((x) => `<span class="chip bz ${bereichKlasse(x)}" title="Wirkungsbereich">${esc(x)}</span>`).join(' ')}`;
}

/**
 * Klartext einer geschätzten Bau-Grösse: Badge-Text, Titel (Tooltip) und die
 * Chip-Klasse. EINE Tabelle für alle Anzeigeorte (§5) — das Wort steht nicht
 * dreimal im Markup.
 *
 * Farbwahl aus den BESTEHENDEN Chip-Klassen, ohne Stylesheet-Zusatz (dieselbe
 * Begründung wie bei `bereichsBadges`: ein neuer Selektor änderte alle vier
 * Seiten). Die Unterscheidung trägt darum der TEXT, nicht die Farbe — «Grösse L»
 * und «im Bau» sind beide gold, lesen sich aber nicht verwechselbar.
 */
const GROESSE_TEXT: Record<string, { badge: string; titel: string; klasse: string }> = {
  S: {
    badge: 'Grösse S — nur gebündelt nehmen',
    titel: 'Geschätzt: trägt keine eigene Session. Der Skill «bauschritt» bündelt sie in Station A mit 1–2 kollisionsfreien Nachbarn gleicher Risikoklasse.',
    klasse: 'ready',
  },
  M: {
    badge: 'Grösse M — sessionfüllend',
    titel: 'Geschätzt: füllt eine Bau-Session — der Normalfall, ohne Zusatz-Handgriff.',
    klasse: 'done',
  },
  L: {
    badge: 'Grösse L — erst in Teilschritte schneiden',
    titel: 'Geschätzt: zu gross für eine Session. Vor dem Bau in sessionfüllende Teilschritte schneiden (AP-6-Muster); bei Dach-Schritten läuft der Bau ohnehin über die Unterschritte.',
    klasse: 'wip',
  },
};

/**
 * Die geschätzte Bau-Grösse als Badge — Steuerhilfe für Davids Auswahl («nicht zu
 * grosse oder kleine nehmen», Auftrag 5.8.2026).
 *
 * Fehlt das `groesse:`-Feld, steht hier **«Grösse ungeschätzt»** statt einer
 * geratenen Einstufung. Aus Kollisionszahl oder Prosalänge eine Grösse abzuleiten
 * wäre genau die stille Zweitwahrheit, die §8 verbietet: die Schätzung ist ein
 * URTEIL und gehört ins `@meta`, nicht in den Renderer. Ein unbekanntes Vokabular
 * wird ebenso als «ungeschätzt» gezeigt — rot gemeldet hat es dann schon
 * `check:plan` Regel 12, und die Anzeige soll dabei nicht zusätzlich raten.
 */
export function groesseBadge(groesse: string | null): string {
  const g = groesse !== null ? GROESSE_TEXT[groesse] : undefined;
  if (!g) {
    return ` <span class="chip ready" title="Für diesen Schritt ist keine Grösse geschätzt (das @meta-Feld «groesse» fehlt) — hier wird nicht geraten.">Grösse ungeschätzt</span>`;
  }
  return ` <span class="chip ${g.klasse}" title="${esc(g.titel)}">${esc(g.badge)}</span>`;
}

/**
 * Ein Schritt in der Anzeige: **Klartext-Titel zuerst**, das Kürzel danach in
 * Klammern (Auftrag David 5.8.2026 — nie mehr ID-first).
 *
 * Warum übersetzen statt umbenennen: die Kürzel sind projektweite Verweis-Anker
 * (ROADMAP, Fahrpläne, Commit-Trailer, Branch-Namen). Sie umzubenennen liesse
 * hunderte Bestandsverweise auf das Falsche zeigen — dieselbe Fehlerklasse, die
 * CLAUDE.md §16 für Paragraphen-Nummern festhält. Sie bleiben also stehen wie
 * Hausnummern und bekommen nur ein lesbares Schild davor.
 */
export function schrittLabel(titel: string, id: string, fett = true): string {
  const t = esc(titel);
  return `${fett ? `<b>${t}</b>` : t} <span class="id">(${esc(id)})</span>`;
}

/** Was der Block anzeigt. Alle Felder sind bereits erhoben — die Funktion rechnet nicht. */
export interface WasPassiert {
  /** Schritte auf `wip`: Klartext-Titel, Kürzel und ihre `kollision:`-Globs (roh). */
  imBau: { titel: string; id: string; flaechen: string[] }[];
  /** Parallele Bau-Plätze (Worktrees ohne Haupt-Repo); `null` = nicht abfragbar. */
  bauplaetze: number | null;
  /** Letzte `main`-Commits; `null` = git nicht abfragbar. */
  gelandet: { datum: string; betreff: string }[] | null;
  /** Schritte, deren Blocker-NAME David nennt. */
  wartetAufDavid: { titel: string; id: string; blocker: string; flaechen: string[] }[];
  /**
   * Übrige blockierte Schritte — Blocker-Name ohne «david».
   *
   * Sie werden GEZÄHLT statt verschwiegen: die Kopfzeile derselben Seite nennt
   * die Gesamtzahl der Blockierten, und ein Block, der weniger zeigt, sähe nach
   * einem Widerspruch aus. Belegter Fall 5.8.2026 — `richter-analytik-gate`
   * verlangt laut `@blockers`-Register ausdrücklich «bewusste Freigabe Davids»,
   * trägt seinen Namen aber ohne «david». Die Namens-Erkennung untertreibt hier
   * also; die Zahl macht das sichtbar, ohne dass der Generator raten müsste,
   * was ein David-Gate ist (§8).
   */
  weitereBlockierte: number;
  /** Relativer Verweis auf die Seite «Arbeitsweise & Glossar». */
  methodeDatei: string;
  /** Erzeugungs-Zeitpunkt im Klartext — der Wahrheitsanker der ganzen Seite. */
  stand: string;
}

/** Ein Satz über die parallelen Bau-Plätze — die drei Fälle sind fest formuliert. */
function bauplatzSatz(n: number | null): string {
  if (n === null) return 'Wie viele Bauplätze gerade offen sind, lässt sich auf diesem Rechner nicht abfragen.';
  if (n === 0) return 'Sonst keine parallelen Bauplätze — es läuft höchstens eine Arbeit auf einmal.';
  if (n === 1) return '1 weiterer Bauplatz ist aktiv: dort wird gleichzeitig an etwas anderem gearbeitet.';
  return `${n} weitere Bauplätze sind aktiv: dort wird gleichzeitig an anderem gearbeitet.`;
}

/** Der Block «Was gerade passiert» — reine Funktion über bereits erhobenen Daten. */
export function wasGeradePassiert(d: WasPassiert): string {
  const imBau = d.imBau.length
    ? d.imBau
        .map((s) => {
          const worte = flaechenKlartext(s.flaechen);
          const betrifft = worte.length
            ? `Betrifft: ${esc(worte.join(' · '))}`
            : 'Betrifft: das ganze Projekt — für dieses Arbeitspaket ist kein Bereich eingegrenzt.';
          return `<li><span class="s wip"></span><div>${schrittLabel(s.titel, s.id)}${bereichsBadges(s.flaechen)}<br><span class="sub">${betrifft}</span></div></li>`;
        })
        .join('\n')
    : '<li><span class="s ready"></span><div>An keinem Arbeitspaket wird gerade gebaut.</div></li>';

  const gelandet =
    d.gelandet === null
      ? '<li><span class="s ready"></span><div>Die Projekt-Geschichte lässt sich auf diesem Rechner gerade nicht abfragen (git nicht verfügbar).</div></li>'
      : d.gelandet.length === 0
        ? '<li><span class="s ready"></span><div>Noch nichts fertig geworden.</div></li>'
        : d.gelandet
            .map((c) => `<li><span class="s done"></span><div>${esc(c.betreff)}<br><span class="sub">fertig am ${esc(c.datum)}</span></div></li>`)
            .join('\n');

  const david = d.wartetAufDavid.length
    ? d.wartetAufDavid
        .map((s) => `<li><span class="s block"></span><div>${schrittLabel(s.titel, s.id)}${bereichsBadges(s.flaechen)}<br><span class="sub">wartet auf deine Entscheidung: ${esc(s.blocker)}</span></div></li>`)
        .join('\n')
    : '<li><span class="s done"></span><div>Nichts — im Moment hält kein Arbeitspaket auf deine Entscheidung.</div></li>';

  return `<section id="jetzt">
  <p class="eyebrow">In einfachen Worten</p>
  <h2>Was gerade passiert</h2>
  <p class="lage"><b>Stand: ${esc(d.stand)}</b></p>
  <p class="lede">Drei Fragen, ohne Fachsprache beantwortet: Woran wird gerade gearbeitet, was ist zuletzt
  fertig geworden, und was liegt bei dir. Die Fachfassung derselben Lage steht weiter unten auf dieser Seite.
  Die farbigen Schilder nennen den <b>Wirkungsbereich</b> — welchen Teil des Projekts ein Arbeitspaket berührt (je Bereich eine Farbe);
  alle sechs sind auf der Seite <a href="${esc(d.methodeDatei)}">Arbeitsweise &amp; Glossar</a> erklärt.</p>

  <h3>Gerade im Bau</h3>
  <ul class="liste">${imBau}</ul>
  <p class="hinweis">${esc(bauplatzSatz(d.bauplaetze))} Ein «Bauplatz» ist eine eigene Arbeitskopie des Projekts:
  zwei Arbeiten laufen darin gleichzeitig, ohne sich in die Dateien zu greifen.</p>

  <h3>Zuletzt fertig geworden</h3>
  <p class="sub">Die letzten fünf gelandeten Arbeitspakete — die Titel sind Fachtitel und stehen unverändert da.</p>
  <ul class="liste">${gelandet}</ul>

  <h3>Wartet auf David</h3>
  <ul class="liste">${david}</ul>
  ${d.weitereBlockierte > 0 ? `<p class="hinweis">Dazu ${d.weitereBlockierte === 1 ? 'wartet 1 weiteres Arbeitspaket' : `warten ${d.weitereBlockierte} weitere Arbeitspakete`} auf eine Klärung, die nicht schon im Namen bei dir liegt — vollständig unter <a href="#david">Wartet auf dich, David</a>.</p>\n  ` : ''}<p class="hinweis">Diese Angaben stammen vom letzten <span class="id">npm run plan:bild</span>-Lauf (${esc(d.stand)}).
  Jeden Fachbegriff dieser Seite erklärt die Seite <a href="${esc(d.methodeDatei)}">Arbeitsweise &amp; Glossar</a> in je einem Satz.</p>
</section>`;
}

// ---------------------------------------------------------------------------
// Gemeinsames der Seiten-Module
//
// `SeitenOpts` und `fussnote` lagen bis 5.8.2026 in `bildSeiten.ts`. Seit die
// Methode-Seite ein eigenes Modul hat (§6.6-Split, s. bildMethode.ts), brauchen
// sie ZWEI Seiten-Module — und zwei Kopien wären zwei Wahrheiten (§5). Sie
// gehören ohnehin hierher: der eine ist der Vertrag jeder Seiten-Funktion, der
// andere ein Wiederhol-Baustein wie `kacheln` oder `tabelle`.
// ---------------------------------------------------------------------------

/** Aufruf-Vertrag jeder Seiten-Funktion. */
export interface SeitenOpts {
  /** Pfad der Index-Seite (`--out`) — Basis der relativen Verweise. */
  indexPfad: string;
  watch: number | null;
  /** Erzeugungs-Zeitstempel; für alle vier Seiten eines Laufs identisch. */
  stand: string;
}

/** Gemeinsame Fussnote aller vier Seiten; `zusatz` nennt die Quellen der Seite. */
export function fussnote(zusatz: string): string {
  return `<footer>
  <p>Erzeugt von <span class="id">npm run plan:bild</span> aus ROADMAP.md (Parser und Resolver von <span class="id">plan:next</span>),
  den Korpus-Registern, git und gh. ${zusatz}
  Diese Dateien sind git-ignoriert — sie sind eine Projektion, nie eine zweite Wahrheit (§5).</p>
</footer>`;
}

/** Deutsche Monatsbeschriftung aus «YYYY-MM». */
const MONATSNAMEN = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export function monatLabel(key: string): string {
  const [jahr, monat] = key.split('-');
  return `${MONATSNAMEN[Number(monat) - 1] ?? monat} ${jahr}`;
}
