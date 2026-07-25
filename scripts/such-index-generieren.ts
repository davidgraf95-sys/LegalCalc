// ─── Generator: Artikel-Volltext-Suchindex (ROADMAP Schritt 5, Task 4.1) ──────
//
// Baut aus den gepinnten Volltext-Snapshots (public/normtext/<ebene>/*.json)
// EINE kompakte Datendatei public/such-index/artikel.json für die globale
// Artikel-Volltextsuche. Der FlexSearch-Index wird daraus CLIENT-seitig lazy
// gebaut (eigener Chunk, §3/§6.4 — nie im Haupt-Bundle).
//
//   npm run gen:suchindex          schreibt die Datei
//   npm run check:suchindex        prüft Drift (Index ≠ Snapshots) → exit 1
//
// EBENEN-NEUTRAL (W2·5, 25.7.2026): Bund UND Kanton laufen durch DIESELBE
// Pipeline; die Ebene ist Parameter, nicht Literal. Jeder Eintrag trägt seine
// Ebene (`eb`) und — kantonal — seinen Kanton (`kt`) mit, damit die Oberfläche
// einen kantonalen Treffer als solchen ausweisen kann und nicht wie Bundesrecht
// aussehen lässt (§8). Vorher las das Skript ausschliesslich public/normtext/bund
// mit hartcodiertem `ebene: 'bund'`.
//
// Nur Erlasse MIT `bloecke` (echter Volltext); Stubs/PDF/Live-Link tragen keinen
// durchsuchbaren Text und werden ausgelassen (§8: nichts vortäuschen). Was
// ausgelassen wird, verschwindet aber NICHT stillschweigend: jede übersprungene
// Datei landet mit Grund in `uebersprungen` (im Artefakt UND in der CLI-Ausgabe),
// und das Tor src/tests/suchIndex.test.ts hält jeden Erlass fest, der Volltext
// führt, aber nicht im Index steht.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NORMTEXT = resolve(wurzel, 'public/normtext');
const ZIEL = resolve(wurzel, 'public/such-index/artikel.json');

/** Indexierte Ebenen — Reihenfolge bestimmt die Eintrags-Reihenfolge (§2 stabil). */
export const EBENEN = ['bund', 'kanton'] as const;
export type Ebene = (typeof EBENEN)[number];

// Bild/Kachel: `alt` ist der einzige durchsuchbare Text (SSV-Signalnamen wie
// «Rechtskurve», «Engpass»). Der generische Fallback «Amtliche Abbildung» (271×
// im Bund) trägt keinen Inhalt und wird verworfen (§8: kein Suchrauschen).
interface Bild { alt?: string; formel?: boolean }
interface Kachel { bild?: Bild; nummer?: string; name?: string }
interface Mehrspaltig { spalten?: { titel?: string }[]; zeilen?: (string | number)[][] }
interface Block {
  absatz?: string; text?: string; items?: { marke?: string; text?: string }[];
  mehrspaltig?: Mehrspaltig; tabelle?: Record<string, unknown>[];
  bild?: Bild; bildKacheln?: Kachel[];
}
// `quelle` trägt bei kantonalen Snapshots das Kantonskürzel («AG», «BS»); Bund
// führt das Feld nicht. Es ist die Grundlage der ehrlichen Herkunfts-Anzeige.
interface Eintrag { id: string; erlass: string; artikel: string; artikelLabel: string; grundlage?: string; quelle?: string; bloecke?: Block[] }

/** Durchsuchbarer Plaintext eines Artikels (Absätze + Aufzählungen, Whitespace normalisiert). */
function artikelText(bloecke: Block[]): string {
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.text) teile.push(b.text);
    for (const it of b.items ?? []) if (it.text) teile.push(it.text);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

const GENERISCHES_ALT = /^amtliche abbildung$/i;

/** Nicht-generischer Alt-Text eines Bildes (SSV-Signalname o. Ä.), sonst ''. */
function bildAlt(b?: Bild): string {
  const alt = (b?.alt ?? '').trim();
  return alt && !GENERISCHES_ALT.test(alt) ? alt : '';
}

/** Tabellen-/Struktur-Tier eines Artikels: Tabellenzellen (mehrspaltig-Spalten-
 *  titel + Zeilen, Füllpunkt-`tabelle`), Bild-Alt-Texte (SSV-Signalnamen; ohne
 *  den generischen «Amtliche Abbildung»-Platzhalter) und Kachel-Beschriftungen.
 *  Ein Rang UNTER Marginalie/Gliederung, ÜBER Fussnote (Feld-Gewichtung S4). */
function tabellenText(bloecke: Block[]): string {
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.mehrspaltig) {
      for (const s of b.mehrspaltig.spalten ?? []) if (s.titel) teile.push(s.titel);
      for (const z of b.mehrspaltig.zeilen ?? []) for (const c of z) if (c != null && c !== '') teile.push(String(c));
    }
    // Füllpunkt-Tabelle (`tabelle`): Array von Zeilen-Objekten mit freien String-
    // Feldern (Kanton-Gebührentarife: {beschreibung, betrag}). Bund führt aktuell
    // keine — verhaltensneutral hier, aber der Extraktor bleibt vollständig.
    for (const zeile of b.tabelle ?? []) {
      for (const v of Object.values(zeile)) if (typeof v === 'string' && v.trim()) teile.push(v);
    }
    const alt = bildAlt(b.bild);
    if (alt) teile.push(alt);
    for (const k of b.bildKacheln ?? []) {
      if (k.name) teile.push(k.name);
      const ka = bildAlt(k.bild);
      if (ka) teile.push(ka);
    }
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

/** Fussnoten-Body eines Artikels als durchsuchbarer Plaintext (Änderungs-/
 *  Quellenhinweise, AS-/BBl-Referenzen). Fedlex-Hervorhebungen <b>/<i> und alle
 *  übrigen Tags fallen; niedrigster Recall-Tier (Feld-Gewichtung S4). */
function fussnotenText(fussnoten: { text?: string }[]): string {
  const teile: string[] = [];
  for (const fn of fussnoten) {
    // Tags raus, Fedlex-Entities dekodieren; die \s+-Normalisierung unten
    // fasst nbsp (von \s erfasst) mit ein.
    const t = (fn.text ?? '').replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (t.trim()) teile.push(t);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

// ── Sachüberschrift (Marginalie + Gliederung) je Artikel (UI-NAV S4) ─────────
//
// Der Ranking-Boost «Marginalie/Sachüberschrift» (S4/#40) braucht den Randtitel
// UND den Titel-/Abschnitts-Pfad als DURCHSUCHBARES Feld. Beides liegt bereits in
// public/normtext/struktur/bund/<key>.json (artikel[a].marginalie + .gliederung) —
// derselbe Datenbestand, aus dem der Reader die Randtitel rendert (K10: KEIN
// Zweit-Index, nur ein zusätzliches Feld auf denselben Daten). So trifft die
// Alltags-Query «Miete» über die Gliederung «Achter Titel: Die Miete» direkt die
// mietrechtlichen Artikel (OR 253 ff.), die im Artikeltext das Wort «Miete» selbst
// nie führen (FlexSearch-forward: «miete» ist kein Präfix von «mietvertrag»).
interface StrukturArtikel { marginalie?: string[]; gliederung?: { ebene?: number; label?: string }[]; fussnoten?: { text?: string }[] }
interface StrukturDatei { artikel?: Record<string, StrukturArtikel> }

/** Enumerator-Präfix eines Randtitels entfernen («G. Verjährung» → «Verjährung»,
 *  «1. Zehn Jahre» → «Zehn Jahre», «a. Grundsatz» → «Grundsatz»). Deterministisch;
 *  reine Text-Säuberung, damit die Buchstaben-/Ziffern-Zähler nicht als Suchrauschen
 *  in den Index geraten. */
function ohneEnumerator(s: string): string {
  return s.replace(/^\s*(?:[0-9]+|[IVXLCDMivxlcdm]+|[A-Za-z])[.)]\s+/, '').trim();
}

/** Labels entdoppeln + säubern (Enumerator weg, Whitespace normalisiert), in
 *  stabiler Reihenfolge zu einem Text joinen. */
function labelText(rohe: (string | undefined)[]): string {
  const teile: string[] = [];
  const sehen = new Set<string>();
  for (const roh of rohe) {
    const s = ohneEnumerator((roh ?? '').replace(/\s+/g, ' ').trim());
    if (s && !sehen.has(s.toLowerCase())) { sehen.add(s.toLowerCase()); teile.push(s); }
  }
  return teile.join(' · ');
}

// Kompaktes Schema (kurze Keys → kleinere Datei): k=ROUTEN-Key (Dateiname-Stamm
// = ERLASS_REGISTER.key, für /gesetze/<eb>/<k>), ku=Anzeige-Kürzel (z. B. «StGB»;
// kantonal der amtliche Titel «Anwaltstarif (SAR 291.150)»), eb=Ebene
// ('bund'|'kanton'), kt=Kantonskürzel («AG») bzw. '' bei Bund,
// a=artikel, l=label, m=PRIMÄRE Marginalie (oberster Randtitel = Hauptthema des
// Artikels), n=nachrangige Marginalie (tiefere Randtitel-Stufen), g=Gliederung
// (Titel-/Abschnitts-Pfad), t=text.
// eb/kt sind KEINE Recall-Felder, sondern Anzeige- und Routing-Daten: sie tragen
// den href auf die richtige Ebene (/gesetze/kanton/AG-291.150) und die
// Kanton-Marke im Treffer. Ohne sie sähe ein kantonaler Treffer wie Bundesrecht
// aus — genau die Unehrlichkeit, die §8 verbietet.
// m/n/g werden GETRENNT geführt (S4): trifft die Query die primäre Marginalie ODER
// den Gliederungs-Titel, ist der Artikel dem Thema GEWIDMET (OR 127 «Verjährung»,
// OR 492 im Titel «Die Bürgschaft»); trifft sie nur eine nachrangige Marginalie,
// NENNT der Artikel das Thema bloss (OR 121 «Verrechnung … Bei Bürgschaft»). Die
// Rangschicht (artikelRanking.ts) wertet das unterschiedlich.
// WICHTIG (§8): k MUSS der Dateiname-Stamm sein, NICHT das interne `erlass`-Feld —
// 71/218 Erlasse haben Kürzel ≠ Dateiname (StGB/STGB, AdoV/ADOV …); sonst tote Links.
// tb=Tabellen-/Struktur-Tier (Tabellenzellen + Füllpunkt-`tabelle` + Bild-Alt +
// `grundlage`-Delegationsnorm), f=Fussnoten-Body. Beide sind RECALL-only (kein
// topischer Boost — eine Fussnoten-/Tabellen-Nennung widmet den Artikel dem Thema
// nicht) und tragen die von der Korpus-Suche bisher übersehenen Werte, die NUR in
// Tabellen oder Fussnoten stehen. Feld-Gewichtung: t > m > n > g > tb > f.
interface IndexEintrag { k: string; ku: string; eb: Ebene; kt: string; a: string; l: string; m: string; n: string; g: string; t: string; tb: string; f: string }

/** Warum eine Datei keinen (oder keinen vollständigen) Beitrag zum Index leistet.
 *  Wird mitgeschrieben statt verschluckt — ein Erlass, der aus dem Index fällt,
 *  muss sichtbar sein und nicht im Nichts verschwinden (§8). */
export interface Uebersprungen {
  ebene: Ebene;
  datei: string;
  /** 'unlesbar' = JSON kaputt · 'kein-eintraege-array' = keine Erlass-Datei
   *  (z. B. kanton/index.json, eine URL→Datei-Karte) · 'kein-volltext' = Erlass
   *  ohne einen einzigen indexierbaren Artikel (Stub/PDF/Live-Link). */
  grund: 'unlesbar' | 'kein-eintraege-array' | 'kein-volltext';
  /** Zahl der Snapshot-Einträge in der Datei (0 wenn unlesbar/kein Array). */
  eintraege: number;
}

export interface EbenenIndex { eintraege: IndexEintrag[]; uebersprungen: Uebersprungen[]; ohneText: number }

/**
 * Baut den Index EINER Ebene aus public/normtext/<ebene> + dem Struktur-Sidecar.
 * Rein und deterministisch (§2): Datei-Reihenfolge sortiert, kein Date, kein Netz.
 */
export function baueEbenenIndex(ebene: Ebene): EbenenIndex {
  const quellDir = resolve(NORMTEXT, ebene);
  const strukturDir = resolve(NORMTEXT, 'struktur', ebene);
  const eintraege: IndexEintrag[] = [];
  const uebersprungen: Uebersprungen[] = [];
  let ohneText = 0;
  for (const datei of readdirSync(quellDir).filter((f) => f.endsWith('.json')).sort()) {
    const key = datei.replace(/\.json$/, ''); // = Routen-Key (ERLASS_REGISTER.key)
    let snap: { eintraege?: Eintrag[] };
    try { snap = JSON.parse(readFileSync(resolve(quellDir, datei), 'utf8')); } catch {
      uebersprungen.push({ ebene, datei, grund: 'unlesbar', eintraege: 0 });
      continue;
    }
    // Nicht jede *.json unter public/normtext/<ebene> ist ein Erlass: der Kanton
    // führt dort zusätzlich index.json (URL→Dateiname-Karte). Kein Erlass ⇒ kein
    // Verlust, aber protokollpflichtig, damit «fehlt» und «ist keiner» unterscheidbar bleibt.
    if (!Array.isArray(snap.eintraege)) {
      uebersprungen.push({ ebene, datei, grund: 'kein-eintraege-array', eintraege: 0 });
      continue;
    }
    // Sidecar-Strukturdatei (Marginalie/Gliederung) — fehlt sie, bleibt m leer (§8).
    let struktur: StrukturDatei = {};
    try { struktur = JSON.parse(readFileSync(resolve(strukturDir, datei), 'utf8')); } catch { /* keine Struktur → m='' */ }
    const vorher = eintraege.length;
    for (const e of snap.eintraege) {
      if (!e.bloecke || e.bloecke.length === 0) { ohneText++; continue; }
      const t = artikelText(e.bloecke);
      if (!t) { ohneText++; continue; }
      const sa = struktur.artikel?.[e.artikel];
      const marg = sa?.marginalie ?? [];
      const m = labelText(marg.slice(0, 1)); // primäre (oberste) Marginalie = Hauptthema
      const n = labelText(marg.slice(1)); // nachrangige Randtitel-Stufen
      const g = labelText((sa?.gliederung ?? []).map((x) => x.label));
      // Tabellen-Tier: Zellen/Bild-Alt aus den Blöcken + `grundlage` (Delegations-
      // norm-Template, «(Art. 1 ArG)»). Fussnoten-Tier: aus dem Struktur-Sidecar.
      const tbTeile = tabellenText(e.bloecke);
      const grundlage = (e.grundlage ?? '').replace(/\s+/g, ' ').trim();
      const tb = [tbTeile, grundlage].filter(Boolean).join(' ');
      const f = fussnotenText(sa?.fussnoten ?? []);
      // kt aus dem Snapshot-Feld `quelle` (Kanton) — bei Bund leer. Ein kantonaler
      // Eintrag OHNE Kanton wäre eine stille Herkunfts-Lüge; das Tor
      // src/tests/suchIndex.test.ts lässt genau das rot auflaufen.
      const kt = ebene === 'kanton' ? (e.quelle ?? '').trim() : '';
      eintraege.push({ k: key, ku: e.erlass, eb: ebene, kt, a: e.artikel, l: e.artikelLabel, m, n, g, t, tb, f });
    }
    // Erlass-Datei, die KEINEN einzigen indexierbaren Artikel beigetragen hat.
    if (eintraege.length === vorher) {
      uebersprungen.push({ ebene, datei, grund: 'kein-volltext', eintraege: snap.eintraege.length });
    }
  }
  // Stabile Reihenfolge (erlass, dann Datei-Reihenfolge der Artikel bleibt erhalten).
  return { eintraege, uebersprungen, ohneText };
}

export interface Suchindex {
  erzeugt: string;
  ebenen: readonly Ebene[];
  eintraege: IndexEintrag[];
  /** Alles, was NICHT in den Index kam — mit Grund (§8: kein stiller Verlust). */
  uebersprungen: Uebersprungen[];
}

/** Gesamt-Index über alle Ebenen, in EBENEN-Reihenfolge (Bund vor Kanton). */
export function baueIndex(): Suchindex {
  const eintraege: IndexEintrag[] = [];
  const uebersprungen: Uebersprungen[] = [];
  for (const ebene of EBENEN) {
    const teil = baueEbenenIndex(ebene);
    eintraege.push(...teil.eintraege);
    uebersprungen.push(...teil.uebersprungen);
  }
  return { erzeugt: 'generiert', ebenen: EBENEN, eintraege, uebersprungen };
}

// CLI-Logik NICHT unter vitest ausführen — der Test importiert baueIndex
// und darf den Index nicht als Seiteneffekt schreiben. (vite-node setzt VITEST
// nicht → gen:suchindex/check:suchindex laufen normal.)
if (!process.env.VITEST) {
  const istCheck = process.argv.includes('--check');
  const index = baueIndex();
  const neu = JSON.stringify(index);
  // Je-Ebene-Zählung für die Ausgabe: der Bericht muss zeigen, dass BEIDE Ebenen
  // im Index sind — eine blosse Gesamtzahl verstiege sich zur Aussage «viel» und
  // verschwiege eine leer gelaufene Ebene (§8).
  const jeEbene = EBENEN.map((eb) => `${eb} ${index.eintraege.filter((e) => e.eb === eb).length}`).join(' · ');
  if (istCheck) {
    let alt = '';
    try { alt = readFileSync(ZIEL, 'utf8'); } catch {
      console.error('check:suchindex: ' + ZIEL + ' fehlt — `npm run gen:suchindex` ausführen.');
      process.exit(1);
    }
    if (alt !== neu) {
      console.error('check:suchindex: public/such-index/artikel.json ist VERALTET gegenüber den Snapshots — `npm run gen:suchindex` ausführen.');
      process.exit(1);
    }
    console.log(`check:suchindex: Index synchron mit den Snapshots (${index.eintraege.length} Artikel — ${jeEbene}).`);
  } else {
    mkdirSync(dirname(ZIEL), { recursive: true });
    writeFileSync(ZIEL, neu, 'utf8');
    console.log(`gen:suchindex: ${index.eintraege.length} Artikel (${jeEbene}) → public/such-index/artikel.json`);
  }
  // Übersprungenes IMMER ausweisen (auch im --check-Lauf): ein Erlass, der aus
  // dem Index fällt, soll im Build-Log stehen und nicht im Nichts verschwinden.
  if (index.uebersprungen.length > 0) {
    const nachGrund = new Map<string, Uebersprungen[]>();
    for (const u of index.uebersprungen) {
      const s = `${u.ebene}/${u.grund}`;
      const arr = nachGrund.get(s);
      if (arr) arr.push(u); else nachGrund.set(s, [u]);
    }
    console.log(`  nicht indexiert (${index.uebersprungen.length} Datei(en)):`);
    for (const [s, arr] of [...nachGrund].sort()) {
      const namen = arr.map((u) => u.datei).sort();
      const zeige = namen.slice(0, 12).join(', ');
      console.log(`    ${s}: ${arr.length} — ${zeige}${namen.length > 12 ? `, … (+${namen.length - 12})` : ''}`);
    }
  }
}
