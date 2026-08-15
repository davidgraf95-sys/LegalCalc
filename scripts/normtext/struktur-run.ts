/**
 * Runner: erzeugt die Struktur-Sidecars public/normtext/struktur/bund/<KEY>.json
 * (Gliederung + Marginalien je Artikel) aus den gecachten Fedlex-HTMLs.
 *
 * Voraussetzung: `bash scripts/fedlex-cache.sh` hat /tmp/<key>.html erzeugt
 * (gleiche Quelle wie die Bund-Snapshots). §2: --datum aus der Shell.
 * Reine Präsentations-Anreicherung — Snapshots/Golden bleiben unberührt (§3/§6).
 *
 * Aufruf: npm run normtext:struktur -- --datum=$(date +%F)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { extrahiereStruktur, extrahiereAnhangStruktur } from './struktur-extrahiere.ts';
import { extrahiereKopf } from './kopf-extrahiere.ts';
import { extrahiereFussnoten, fnDefinitionen, type Fussnote } from './fussnoten-extrahiere.ts';
import { klassifiziereFussnote } from './fussnoten-klassifikation.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('struktur-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const ZIEL = 'public/normtext/struktur/bund';
mkdirSync(ZIEL, { recursive: true });

// W2·5i-HIST-ANSICHT (H0-Auflage 3): die Fussnoten-Klasse wird GENAU HIER, EINMAL
// build-seitig berechnet und als kompaktes Feld `kl` ('A'|'V'|'G'|'Z'|'U') an jede
// Fussnote gehängt — kein Client-Regex-Lauf über 37'849 Fussnoten (§15.3), kein
// zweiter Rechenort (§5). Regeln + empirische Grundlage: fussnoten-klassifikation.ts
// bzw. bibliothek/normen/hist-ansicht-h0-trennbarkeit.md.
//
// `kl` wird ZULETZT gesetzt (Objekt-Spread am Ende), damit die bestehenden Felder
// — inkl. `pos{b,it,o,l}` aus FN-5/M14 — in unveränderter Reihenfolge und
// byte-identisch im JSON stehen: die Regeneration ist damit rein ADDITIV
// (Differ-Beweis: scripts/normtext/check-sidecar-differ.ts).
//
// Fehlt `kl` (Kanton-Sidecars, die bewusst NICHT regeneriert werden — dort sind
// nur 11 % der Fussnoten Historie), gilt die Fussnote im Reader als
// UNklassifiziert und bleibt in JEDER Ansicht sichtbar. Konservativ (§8): eine
// fehlende Klasse blendet nie etwas aus.
const mitKlasse = (f: Fussnote): Fussnote & { kl: string } => ({ ...f, kl: klassifiziereFussnote(f.text) });

/** Section-heading-Fussnote (G11): `absatz`/`item` sind hier per Konstruktion `null`
 *  (Marker sitzt am Sektions-/Randtitel-Kopf), `sektion` trägt das Quell-Heading.
 *  Genau die Form, die der `.map()` unten erzeugt — als Prädikat-Ziel des
 *  nachfolgenden `.filter()`. */
type SektionsFussnote = Fussnote & { absatz: null; item: null; sektion: string };

const bund = ERLASS_REGISTER.filter((r) => r.ebene === 'bund' && r.status === 'snapshot');
let geschrieben = 0;
const fehlend: string[] = [];

// P1-a/b (Querschnitts-Wurzel): /tmp-Caches überleben Neustarts NICHT und ein
// fehlender Cache führte hier zu STILLEM Skip (continue) mit Exit 0 → grüner
// No-op-Lauf, der die Sidecars der übersprungenen Erlasse still veralten liess
// (Symptom «54 Sidecars ohne Erlassdatum»). Darum VOR dem Lauf die Caches
// sicherstellen — genau wie der Snapshot-Generator (normtext-snapshot.ts).
const alleFehlen = bund.filter((r) => !existsSync(`/tmp/${r.key.toLowerCase()}.html`));
if (alleFehlen.length > 0) {
  console.log(`\n[Cache] ${alleFehlen.length} HTML-Cache(s) fehlen — lade via bash scripts/fedlex-cache.sh …`);
  execSync('bash scripts/fedlex-cache.sh', { stdio: 'inherit' });
}

for (const reg of bund) {
  const cache = `/tmp/${reg.key.toLowerCase()}.html`;
  if (!existsSync(cache)) { fehlend.push(reg.key); continue; }
  const html = readFileSync(cache, 'utf8');
  const struktur = extrahiereStruktur(html);
  // M13-Annex: Anhang-Gliederung («Anhänge») additiv ergänzen — Keys lockstep
  // mit den Snapshot-Annex-Tokens (gleicher Keep-Prädikat, Konsistenz-Tor).
  Object.assign(struktur, extrahiereAnhangStruktur(html));
  const anzahl = Object.keys(struktur).length;
  if (anzahl === 0) { fehlend.push(`${reg.key}(0)`); continue; }
  // Fussnoten (Änderungs-/AS/BBl-Historie) je Artikel dazumischen.
  const fussnoten = extrahiereFussnoten(html);
  const defs = fnDefinitionen(html);
  // Deterministisch sortierte Token-Schlüssel für diff-freundliches JSON.
  const sortiert: Record<string, unknown> = {};
  for (const tok of Object.keys(struktur).sort()) {
    const { randtitelFn, ...rest } = struktur[tok];
    const perArt = fussnoten[tok] ?? [];
    // Section-heading-Fussnoten auflösen (G11): absatz/item null → am Kopf, und
    // `sektion` trägt das Quell-Heading (Label), damit der Renderer den Marker am
    // richtigen Sektions-/Randtitel-Kopf setzt statt anonym auf Artikelebene.
    const rfn = (randtitelFn ?? [])
      .map((rf) => { const f = defs.get(rf.fnId); return f ? { ...f, absatz: null, item: null, sektion: rf.label } : null; })
      // Das Prädikat lautete `f is Fussnote` und war damit WEITER als der Wert,
      // den `.map()` erzeugt — TypeScript verwarf es (TS2677), `.filter()` fiel
      // auf die nicht-verengende Überladung zurück, `rfn` blieb typseitig
      // `(Fussnote | null)[]`. LAUFZEIT war davon nie betroffen: der Guard
      // `!!f` filtert die nulls seit jeher (Gegenprüfung 15.8.2026 hat die
      // Erst-Erzählung «Nulls im Sidecar» widerlegt). Die exakte Prädikat-Form
      // stellt nur die Typ-Verengung her (QS-TYP-LUECKE 15.8.2026).
      .filter((f): f is SektionsFussnote => !!f && !perArt.some((p) => p.nr === f.nr));
    // A43-Hinweis (David 16.7.): Die ANZEIGE-Reihenfolge der Fussnoten (laufende
    // Fedlex-Nummer) wird in der Darstellungsschicht hergestellt (ArtikelLeser
    // sortiert fussAnzeige), NICHT hier. Die Sidecar-Reihenfolge bleibt bewusst
    // [perArt, …rfn] (artikel-eigene VOR Section-heading-Fussnoten) — sie ist
    // load-bearing für den Revisions-Extrakt (revisionen-extrakt.ts, Gleichdatum-
    // Tie-Break first-wins): die eigene «Fassung gemäss»-Fussnote des Artikels muss
    // VOR einer gleichdatierten Section-heading-Fussnote stehen, sonst attribuiert
    // der Extrakt die Section-Revision fälschlich dem Artikel (§1/§3).
    const alle = [...perArt, ...rfn].map(mitKlasse);
    sortiert[tok] = alle.length ? { ...rest, fussnoten: alle } : rest;
  }
  // M5: Erlass-Kopf (preface/preamble) als Sidecar — golden-neutral (kein Snapshot).
  // W2·5i: die Kopf-Fussnoten (Ingress-/Präambel-Apparat) tragen `kl` ebenfalls —
  // sie sind im Reader dieselbe Bedienfläche (ErlassKopfBlock, data-fn-apparat).
  const kopfRoh = extrahiereKopf(html);
  const kopf = kopfRoh?.fussnoten?.length
    ? { ...kopfRoh, fussnoten: kopfRoh.fussnoten.map(mitKlasse) }
    : kopfRoh;
  const doc = kopf ? { erzeugt, kopf, artikel: sortiert } : { erzeugt, artikel: sortiert };
  writeFileSync(`${ZIEL}/${reg.key}.json`, JSON.stringify(doc, null, 1) + '\n', 'utf8');
  geschrieben++;
}

console.log(`Struktur-Sidecars: ${geschrieben}/${bund.length} Bund-Erlasse → ${ZIEL}/`);
// «0 übersprungen»-Pflichtkontrolle (P1-a/b): ein übersprungener Erlass ist ein
// harter Fehler, kein Hinweis — sonst regeneriert ein grüner No-op-Lauf still aus
// veralteten/fehlenden Caches (Soft-404-Shell → 0 Token → früher lautlos skip).
if (fehlend.length) {
  console.error(
    `\nFEHLER: ${fehlend.length} Erlass(e) ohne verwertbaren Cache übersprungen: ${fehlend.join(', ')}\n` +
      `→ 'bash scripts/fedlex-cache.sh' erfolgreich laufen lassen (kanonische html-N-Pins prüfen); ` +
      `ein (0) markiert eine Soft-404-Shell/leeren Extrakt — Pin-Kanonik in fedlex-cache.sh prüfen.`,
  );
  process.exit(1);
}
