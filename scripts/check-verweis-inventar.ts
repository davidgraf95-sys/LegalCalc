// ─── check:verweis-inventar — Verweis-Inventar des Normtext-Korpus (V-1) ─────
//
// Anlass: Auftrag David 31.8.2026 (Verweis-Schärfe), Fahrplan
// `fahrplaene/FAHRPLAN-VERWEIS-SCHAERFE.md` §1 · V-1. Bis hierher existierte
// KEINE Messung, wie viele Verweis-Stellen der Korpus trägt und wie sie
// aufgelöst werden — die einzigen Zahlen standen als Kommentar in
// `NormText.tsx` (F41: «199 Self-Links») und in einem datierten Messbericht
// (`bibliothek/normtext/verweis-inventar-messung-2026-08-31.md`). Kommentar-
// Zahlen altern still; dieses Tor ersetzt sie durch ein reproduzierbares,
// committetes Artefakt (`messwerte/verweis-inventar.json`).
//
// WAS GEMESSEN WIRD. Je Formklasse (= eine Stelle im Entscheidbaum, an der
// über Link/kein-Link entschieden wird): Zahl der Stellen, Zahl der Erlasse,
// der Entscheid (SELF / FREMD / TEXT) und die Zahl der Stellen mit explizitem
// SELBSTMARKER («dieses Gesetzes», «des vorliegenden Gesetzes» …). Dazu zwei
// Sonderlisten: tote Selbstziele (Selbstmarker-Verweis auf eine Bestimmung,
// die es im Erlass nicht gibt) und Zeit-Kanten-Stellen (Selbstmarker in
// Übergangs-/Altrecht-Kontext; nur Zählung, siehe V-5).
//
// ─── TRANSKRIPTION (§8-Offenlegung, bindend lesen) ──────────────────────────
//
// Die produktive Entscheidkette lebt in `restMitIntern` / `selbstSpanSprung`
// (`src/components/NormText.tsx`) und in `etabliertFremdgesetz`
// (`src/components/normtext/ArtikelBody.tsx`). Alle drei sind React-interne,
// NICHT exportierte Funktionen. Das Tor arbeitet darum mit einer
// TRANSKRIPTION der Guards, nicht mit dem Original — sie steht in
// `scripts/verweis-inventar-transkription.ts` (§6.6-Trennung: dort WAS die
// Produktion tut, hier WIE gemessen und verglichen wird):
//
//   · Die ERKENNER sind die echten Produktions-Funktionen (importiert):
//     normVerweiseImText, fremdgesetzNachArtikel, fremdRoutingFormB,
//     artikelnPluralVerweise, chapeauZielFremdgesetz, erkenneFedlexGesetz —
//     keine zweite Regex-Wahrheit über das, was ein Verweis IST (§5).
//   · Die GUARDS (ART_INTERN, PARAGRAF_INTERN, PARAGRAF_ANHANG,
//     PARAGRAF_FREMD_GROSS/-NAME, des/der-Guard, M12, SELBST_MARKER,
//     nenntEigenesKuerzel, normRef, kuerzelKanon, etabliertFremdgesetz) sind
//     als Zeichenketten transkribiert.
//   · Diese Zeichenketten sind zugleich (a) der Vergleichs-Massstab des
//     Wächters gegen den Quelltext UND (b) die Quelle der compilierten
//     RegExp (`re()`). Eine Transkription, die vom Original abweicht,
//     kann darum nicht still danebenliegen — sie reisst den Wächter.
//   · Zusätzlich hält das Artefakt den SHA-256 von `NormText.tsx`. Ändert
//     jemand die Datei (auch die Entscheid-REIHENFOLGE, die kein Literal-
//     Vergleich sieht), wird das Tor rot und verlangt eine bewusste
//     Regeneration der Basislinie.
//
// GRENZEN (§8, nicht wegglätten):
//   · Gemessen wird die Transkription, nicht das React-Rendering.
//   · Text-Umfang = `bloecke[].text` und `bloecke[].items[].text` aller
//     Snapshots. Präambel/Ingress (ErlassKopfBlock), Tabellen- und Bild-
//     Sonderpfade sind NICHT enthalten. (Der Messbericht vom 31.8.2026 mass
//     nur die BLOCK-Texte — daher dort 24 489 statt 34 058 Stellen; sein
//     datierter Befund bleibt unangetastet, hier steht der weitere Umfang.)
//   · Der Kontext ist der des Lesers (`useInternRefs`): tokenMap aus den
//     Snapshot-Artikeln, `paragrafDesigniert` aus GRUNDART_SEED,
//     `eigenesKuerzel` aus dem Register-Key, `registerKuerzel` aus dem
//     Register-Feld `kuerzel`. Der Chapeau-Kontext (M6/M6-D, ArtikelBody) ist
//     für Items nachgebildet.
//   · Die Spalte `selbstmarker` zählt seit V-2 (Commit 967870b41) exakt die
//     Stellen, an denen `selbstSignalAmZitat` greift — der frühere EIGENE
//     Detektor dieses Tors ist ersetzt (§5, keine zweite Wahrheit). Er läuft
//     nur an SINGULÄREN «Art. N»/«§ N»-Stellen, nicht an Plural-Regionen.
//   · Zeit-Kante = Kontext-INDIZ (Randtitel «Übergangs…» bzw. Altrecht-Wendung
//     im Block), keine rechtliche Klassifikation.
//
// BASISLINIEN-MODELL (Vorbild `check:ui-normzitate`): das Artefakt ist
// committet; das Tor rechnet neu und vergleicht. Jede Abweichung ist ROT.
// Bewusste Änderungen (Korpus-Nachzug, Erkenner-Umbau, V-2/V-3) regenerieren
// das Artefakt IM SELBEN Commit:
//
//   npm run check:verweis-inventar -- --schreiben
//
// Determinismus (§2): keine Zeitstempel im Artefakt, stabile Sortierung
// (Klassen alphabetisch, Sonderlisten nach Fundstelle).
//
// Scheiterns-Fähigkeit (§6.7): ein Selbsttest jagt bei JEDEM Lauf ein Dutzend
// synthetischer Texte durch dieselbe Pipeline — je einen pro Weiche, die drei
// V-2-Ziele eingeschlossen — und prüft die erwartete Klassenzuordnung; stimmt
// eine nicht, bricht das Tor sich selbst ab.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { chapeauZielFremdgesetz } from '../src/lib/fedlex';
import { GRUNDART_SEED } from '../src/lib/normtext/grundart.generated';
import {
  G, KLASSEN, NORMTEXT_PFAD, ZEIT_ALTRECHT, ZEIT_TITEL, etabliertFremdgesetz,
  glaetteInterpunktion, kuerzelKanon, normRef, stellenImText, waechterGuards,
  type Ctx, type Entscheid,
} from './verweis-inventar-transkription';

const WURZEL = process.cwd();
const ARTEFAKT_PFAD = join(WURZEL, 'messwerte', 'verweis-inventar.json');
const REGISTER_PFAD = join(WURZEL, 'public', 'normtext', 'register.json');
const SNAPSHOT_WURZEL = join(WURZEL, 'public', 'normtext');

// ─── 4 · Korpus-Lauf ────────────────────────────────────────────────────────

interface RegisterErlass {
  key: string; ebene: string; kanton: string | null; kuerzel: string; status: string; datei: string | null;
}

// ─── V-3 · Kürzel-Register je Kanton (Spiegel von baueKantonKuerzelKarte) ────
//
// Der Leser leitet die Karte aus dem Browse-Manifest ab — und das IST
// `public/normtext/register.json` (`ladeBrowseManifest`, browse.ts:63), also
// dieselbe Datei, die dieses Tor liest. Kein zweiter Datenstand.
//
// Die Regeln stehen an `baueKantonKuerzelKarte` (inhalt-sprung.tsx); zwei
// davon sind als Literal transkribiert und vom Wächter gedeckt
// (KANTON_KUERZEL_KANDIDAT/-FILTER). Der ZIELWERT ist hier der Register-Key
// statt der Lese-Adresse: das Tor zählt Klassen, es baut keine URL — was es
// braucht, ist «gibt es genau ein Ziel und ist es ein anderer Erlass».
function kuerzelKandidaten(kuerzel: string): string[] {
  return kuerzel.split(';').map((s) => s.trim())
    .filter((s) => s.length >= 2 && !/\s/.test(s) && /^[A-ZÄÖÜ]/.test(s));
}

function kartenJeKanton(erlasse: RegisterErlass[]): Map<string, Map<string, string>> {
  const je = new Map<string, Map<string, string>>();
  const mehrdeutig = new Map<string, Set<string>>();
  for (const e of erlasse) {
    if (!e.kanton || e.status !== 'snapshot') continue;
    if (!je.has(e.kanton)) { je.set(e.kanton, new Map()); mehrdeutig.set(e.kanton, new Set()); }
    const karte = je.get(e.kanton)!, doppelt = mehrdeutig.get(e.kanton)!;
    for (const k of kuerzelKandidaten(e.kuerzel)) {
      if (doppelt.has(k)) continue;
      const schon = karte.get(k);
      if (schon !== undefined && schon !== e.key) { karte.delete(k); doppelt.add(k); continue; }
      karte.set(k, e.key);
    }
  }
  return je;
}

/** Die Karte, wie der Leser DIESES Erlasses sie sieht: ohne die eigenen Kürzel. */
function karteFuerErlass(je: Map<string, Map<string, string>>, e: RegisterErlass):
ReadonlyMap<string, string> | undefined {
  if (!e.kanton) return undefined;
  const karte = new Map(je.get(e.kanton) ?? []);
  for (const k of kuerzelKandidaten(e.kuerzel)) karte.delete(k);
  return karte;
}
interface SnapshotBlock { text: string; items?: { text: string }[] }
interface SnapshotEintrag { id: string; artikel: string; titel?: string; bloecke?: SnapshotBlock[] }

interface KlassenZeile {
  klasse: string; entscheid: Entscheid; stellen: number; erlasse: number;
  selbstmarker: number; was: string;
}
interface TotesZiel { erlass: string; fundstelle: string; bestimmung: string }
interface Artefakt {
  _zweck: string;
  _regenerieren: string;
  _quellen: { normTextSha256: string; guards: number };
  korpus: { erlasse: number; eintraege: number; texte: number };
  gesamt: { stellen: number; self: number; fremd: number; text: number; selbstmarker: number };
  klassen: KlassenZeile[];
  toteSelbstziele: TotesZiel[];
  zeitKanten: { stellen: number; erlasse: number; uebergangsTitel: number; altrechtBlock: number };
}

function sha256(pfad: string): string {
  return createHash('sha256').update(readFileSync(pfad)).digest('hex');
}

function berechne(): Artefakt {
  const register = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as { erlasse: RegisterErlass[] };
  const erlasse = register.erlasse
    .filter((e) => e.status === 'snapshot' && e.datei)
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  // V-3: Kürzel-Register je Kanton — EINMAL für den ganzen Lauf (der Leser baut
  // es je Erlass, das Ergebnis ist dasselbe; hier wäre es 1 231 Mal dieselbe
  // Schleife über das Register).
  const kantonKarten = kartenJeKanton(register.erlasse);

  const stellenJeKlasse = new Map<string, number>();
  const selbstJeKlasse = new Map<string, number>();
  const erlasseJeKlasse = new Map<string, Set<string>>();
  const toteSelbstziele: TotesZiel[] = [];
  const zeitErlasse = new Set<string>();
  let zeitStellen = 0, zeitTitel = 0, zeitAltrecht = 0;
  let eintraegeGesamt = 0, texteGesamt = 0;

  for (const e of erlasse) {
    const datei = join(SNAPSHOT_WURZEL, e.datei!);
    if (!existsSync(datei)) continue;
    const snap = JSON.parse(readFileSync(datei, 'utf8')) as { eintraege: SnapshotEintrag[] };
    const tokenMap = new Map<string, string>();
    for (const x of snap.eintraege) tokenMap.set(normRef(x.artikel), x.artikel);
    const leser: Ctx = {
      tokenMap,
      // Produktion: kuerzelKanon(basisPfad.split('/').pop()) — das letzte
      // Pfadsegment IST der Register-Key (erlassPfad baut es so).
      eigenesKuerzel: kuerzelKanon(e.key),
      // V-2: `useInternRefs` reicht `erlassKuerzel: erlass?.kuerzel` durch —
      // das ist genau das Register-Feld `kuerzel` (leserV3Modell.ts:353).
      registerKuerzel: e.kuerzel,
      paragrafDesigniert: GRUNDART_SEED[e.key]?.bestimmungsEtikett === 'paragraf',
      // V-3: `leserV3Modell` gibt genau diese Karte an `useInternRefs` weiter
      // (Bund ⇒ kein Kanton ⇒ undefined ⇒ die Weiche ruht).
      kantonKuerzel: karteFuerErlass(kantonKarten, e),
    };

    for (const eintrag of snap.eintraege) {
      eintraegeGesamt += 1;
      const titelZeit = ZEIT_TITEL.test(eintrag.titel ?? '');
      for (const b of eintrag.bloecke ?? []) {
        const blockZeit = ZEIT_ALTRECHT.test(b.text ?? '');
        const fremdKey = chapeauZielFremdgesetz(b.text ?? '', e.kuerzel);
        const fremdItems = etabliertFremdgesetz(b.text ?? '', e.kuerzel);
        const itemCtx: Ctx | null = fremdKey
          ? { tokenMap: new Map(), eigenesKuerzel: '', paragrafDesigniert: false, fremdKuerzel: fremdKey }
          : fremdItems ? null : leser;

        const texte: { text: string; ctx: Ctx | null }[] = [{ text: b.text ?? '', ctx: leser }];
        for (const it of b.items ?? []) texte.push({ text: it.text ?? '', ctx: itemCtx });

        for (const t of texte) {
          if (!t.text) continue;
          texteGesamt += 1;
          const stellen = stellenImText(
            glaetteInterpunktion(t.text), t.ctx, leser.paragrafDesigniert,
          );
          for (const st of stellen) {
            stellenJeKlasse.set(st.klasse, (stellenJeKlasse.get(st.klasse) ?? 0) + 1);
            if (!erlasseJeKlasse.has(st.klasse)) erlasseJeKlasse.set(st.klasse, new Set());
            erlasseJeKlasse.get(st.klasse)!.add(e.key);
            if (st.selbstmarker) {
              selbstJeKlasse.set(st.klasse, (selbstJeKlasse.get(st.klasse) ?? 0) + 1);
              if (titelZeit || blockZeit) {
                zeitStellen += 1;
                zeitErlasse.add(e.key);
                if (titelZeit) zeitTitel += 1;
                if (blockZeit) zeitAltrecht += 1;
              }
            }
            if (st.totesZiel && st.nummer) {
              toteSelbstziele.push({ erlass: e.key, fundstelle: eintrag.id, bestimmung: st.nummer });
            }
          }
        }
      }
    }
  }

  const klassen: KlassenZeile[] = Object.keys(KLASSEN).sort().map((k) => ({
    klasse: k,
    entscheid: KLASSEN[k].entscheid,
    stellen: stellenJeKlasse.get(k) ?? 0,
    erlasse: erlasseJeKlasse.get(k)?.size ?? 0,
    selbstmarker: selbstJeKlasse.get(k) ?? 0,
    was: KLASSEN[k].was,
  }));
  const summe = (f: (z: KlassenZeile) => boolean) =>
    klassen.filter(f).reduce((a, z) => a + z.stellen, 0);

  return {
    _zweck:
      'Verweis-Inventar des Normtext-Korpus (V-1, W2·20-VERWEIS-SCHAERFE). Basislinie: '
      + 'jede Abweichung Artefakt ↔ Neuberechnung ist ROT. Erzeugung und Grenzen: '
      + 'scripts/check-verweis-inventar.ts (Kopf).',
    _regenerieren: 'npm run check:verweis-inventar -- --schreiben',
    _quellen: { normTextSha256: sha256(NORMTEXT_PFAD), guards: Object.keys(G).length },
    korpus: { erlasse: erlasse.length, eintraege: eintraegeGesamt, texte: texteGesamt },
    gesamt: {
      stellen: klassen.reduce((a, z) => a + z.stellen, 0),
      self: summe((z) => z.entscheid === 'SELF'),
      fremd: summe((z) => z.entscheid === 'FREMD'),
      text: summe((z) => z.entscheid === 'TEXT'),
      selbstmarker: klassen.reduce((a, z) => a + z.selbstmarker, 0),
    },
    klassen,
    toteSelbstziele: toteSelbstziele.sort((a, b) =>
      `${a.fundstelle}|${a.bestimmung}` < `${b.fundstelle}|${b.bestimmung}` ? -1
        : `${a.fundstelle}|${a.bestimmung}` > `${b.fundstelle}|${b.bestimmung}` ? 1 : 0),
    zeitKanten: {
      stellen: zeitStellen, erlasse: zeitErlasse.size,
      uebergangsTitel: zeitTitel, altrechtBlock: zeitAltrecht,
    },
  };
}

// ─── 6 · Selbsttest (§6.7) ──────────────────────────────────────────────────

function selbsttest(): void {
  const artErlass: Ctx = {
    tokenMap: new Map([['5', '5'], ['12', '12']]),
    eigenesKuerzel: 'AHVG', registerKuerzel: 'AHVG', paragrafDesigniert: false,
  };
  const parErlass: Ctx = {
    tokenMap: new Map([['19', '19']]),
    eigenesKuerzel: 'BS162100', registerKuerzel: 'Personalgesetz', paragrafDesigniert: true,
  };
  // V-3: derselbe §-Erlass, aber MIT dem Kürzel-Register seines Kantons. «IRG»
  // ist dort eindeutig, «StG» fehlt (mehrdeutig ⇒ nicht in der Karte), das
  // eigene «Personalgesetz» ist entfernt (Regel 3).
  const parMitKarte: Ctx = {
    ...parErlass,
    kantonKuerzel: new Map([['IRG', '/gesetze/kanton/BS-131.100']]),
  };
  // Voll zitierter Anker auf den gelesenen Erlass (V-2 Ziel 3): Kontext = SSV.
  const ssv: Ctx = {
    tokenMap: new Map([['65', '65']]),
    eigenesKuerzel: 'SSV', registerKuerzel: 'SSV', paragrafDesigniert: false,
  };
  // V-6: Item unter einem Fremdgesetz-Chapeau (M6-D) — wie `berechne()` ihn baut.
  const chapeau: Ctx = {
    tokenMap: new Map(), eigenesKuerzel: '', paragrafDesigniert: false, fremdKuerzel: 'AHVG',
  };
  const proben: [string, Ctx | null, string, boolean][] = [
    // Text, Kontext, erwartete Klasse der ERSTEN Stelle, erwarteter Selbstmarker
    ['Massgeblich ist Art. 336c OR für diesen Fall.', artErlass, 'anker-fedlex', false],
    ['Die Frist nach Art. 5 beginnt zu laufen.', artErlass, 'art-self', false],
    ['Die Frist nach Art. 99 dieses Gesetzes beginnt.', artErlass, 'art-kein-token', true],
    ['Es gilt Art. 7 des Bundesgesetzes über die Sache.', artErlass, 'art-desder-guard', false],
    ['Es gilt Art. 5 sinngemäss.', parErlass, 'art-f41', false],
    // ── V-2-Weichen (Commit 967870b41) ──────────────────────────────────────
    // Ziel 1, Wendung: schlägt den des/der-Guard (Zwilling AHVG Art. 9).
    ['Der Beitrag nach Art. 5 des vorliegenden Gesetzes ist geschuldet.', artErlass, 'art-self', true],
    // … auch mit Passus dazwischen (PARAGRAF_ANHANG wird überlesen).
    ['Der Beitrag nach Art. 5 Absatz 2 des vorliegenden Gesetzes ist geschuldet.', artErlass, 'art-self', true],
    // Ziel 1, Wendung schlägt F41 (BS-833.100 § 6, «Art. 12 dieses Vertrages»).
    ['Er erlässt gemäss Art. 19 dieses Vertrages Vorschriften.', parErlass, 'art-self', true],
    // Ziel 2, eigenes Kürzel: schlägt den §-Grosswort-Guard (BS-162.100 § 19a).
    ['Es gilt § 19 Personalgesetz sinngemäss.', parErlass, 'paragraf-self', true],
    // … ein FREMDES Grosswort bleibt Text.
    ['Es gilt § 19 Integrationsgesetz sinngemäss.', parErlass, 'paragraf-fremd-grosswort', false],
    // Ziel 2, Bindestrich-Wortgrenze (Lehre KKV vs. KKV-FINMA): ein Kürzel mit
    // angehängtem «-…» ist ein ANDERER Erlass — ohne diese Regel wäre das hier
    // ein Self-Link auf die falsche Bestimmung (§1).
    ['Es gilt § 19 Personalgesetz-Anhang sinngemäss.', parErlass, 'paragraf-fremd-grosswort', false],
    // ── V-3-Weiche (Kanton-Kürzel-Resolver) ─────────────────────────────────
    // Beleg-Fall des Auftrags: «§ 6 IRG» in BS-111.100 → BS-131.100.
    ['Gesuche nach § 6 IRG sind einzureichen.', parMitKarte, 'paragraf-kanton-kuerzel', false],
    // … mit Passus dazwischen (der Passus gehört zum Zitat, nicht zum Kürzel).
    ['Gesuche nach § 6 Abs. 2 IRG sind einzureichen.', parMitKarte, 'paragraf-kanton-kuerzel', false],
    // … Satzzeichen am Ende zählen nicht zum Kürzel.
    ['Vorbehalten bleibt § 6 IRG.', parMitKarte, 'paragraf-kanton-kuerzel', false],
    // Ein Kürzel MIT Anhang ist ein anderer Erlass (Wortgrenze inkl. Bindestrich).
    ['Vorbehalten bleibt § 6 IRG-Anhang.', parMitKarte, 'paragraf-fremd-grosswort', false],
    // Nicht im Register des Kantons ⇒ unverändert Text.
    ['Vorbehalten bleibt § 6 Integrationsgesetz.', parMitKarte, 'paragraf-fremd-grosswort', false],
    // Das EIGENE Kürzel bleibt ein Selbstverweis (V-2 schlägt V-3).
    ['Es gilt § 19 Personalgesetz sinngemäss.', parMitKarte, 'paragraf-self', true],
    // OHNE Karte (Bund, Kanton ohne Register-Treffer) bleibt alles wie vorher.
    ['Gesuche nach § 6 IRG sind einzureichen.', parErlass, 'paragraf-fremd-grosswort', false],
    // ── V-6-Weiche (M12 sieht auch HINTER den Passus) ───────────────────────
    // Kernfall (Produktions-Beleg OR Art. 973g «(Art. 895–898 ZGB)»): der
    // Aufzählungs-Schwanz trägt kein führendes Leerzeichen, der Guard sah das
    // Kürzel darum bis V-6 nicht — Ergebnis war ein Self-Link auf einen
    // ZGB-Artikel im OR.
    ['Es gilt Art. 5–7 ZGB sinngemäss.', artErlass, 'art-m12-kuerzel', false],
    // ODER, nicht Ersetzung: hier bricht der Passus-Überleser hinter dem «a» ab
    // («–e» ist kein Zahlenglied), und der Rest «–e ZGB» trägt kein führendes
    // Leerzeichen. Nur weil der ROHE Rest weiter geprüft wird, greift N2 —
    // eine Ersetzung machte daraus einen falschen Self-Link (150 Stellen).
    ['Es gilt Art. 5 Buchstaben a–e ZGB sinngemäss.', artErlass, 'art-n2-fremdkuerzel', false],
    // Abgrenzung: das Passus-Wort selbst ist nie ein Kürzel (EIN Grossbuchstabe).
    ['Es gilt Art. 5 Absatz 2 sinngemäss.', artErlass, 'art-self', false],
    // Im Fremdgesetz-Chapeau ruht die Erweiterung: das genannte Kürzel IST das
    // Chapeau-Ziel (IVG Art. 66 «die Ausgleichskassen (Art. 53–70 AHVG)»), und
    // der Guard würde einen RICHTIGEN Fremd-Link unterdrücken.
    ['die Ausgleichskassen (Art. 53–70 AHVG);', chapeau, 'art-chapeau-fremd', false],
    // Ziel 3, voll zitierter Anker auf den gelesenen Erlass.
    ['Vorbehalten bleibt Art. 65 SSV.', ssv, 'anker-self', false],
    // … derselbe Anker in einem ANDEREN Erlass bleibt der Fedlex-Chip.
    ['Vorbehalten bleibt Art. 65 SSV.', artErlass, 'anker-fedlex', false],
  ];
  for (const [text, ctx, sollKlasse, sollSelbst] of proben) {
    const st = stellenImText(text, ctx, false);
    if (st.length === 0 || st[0].klasse !== sollKlasse || st[0].selbstmarker !== sollSelbst) {
      console.error(
        `check:verweis-inventar ROT (Selbsttest §6.7): «${text}» ergab `
        + `${st.length === 0 ? '<keine Stelle>' : `${st[0].klasse}/selbstmarker=${st[0].selbstmarker}`}`
        + `, erwartet ${sollKlasse}/selbstmarker=${sollSelbst} — der Klassifizierer misst nicht, was er messen soll.`,
      );
      process.exit(1);
    }
  }
  // Totes Selbstziel muss als solches erkannt werden (Sonderliste 1).
  const tot = stellenImText('Die Frist nach Art. 99 dieses Gesetzes beginnt.', artErlass, false);
  if (!tot[0].totesZiel) {
    console.error('check:verweis-inventar ROT (Selbsttest §6.7): totes Selbstziel «Art. 99 dieses Gesetzes» nicht erkannt.');
    process.exit(1);
  }
}

// ─── 7 · Lauf ───────────────────────────────────────────────────────────────

const schreiben = process.argv.includes('--schreiben');

const guardFehler = waechterGuards();
if (guardFehler.length > 0) {
  console.error(
    'check:verweis-inventar ROT — die transkribierten Guards weichen vom Quelltext ab.\n'
    + 'Das Tor misst dann etwas anderes als die Produktion tut. Transkription in\n'
    + 'scripts/check-verweis-inventar.ts (Abschnitt 1) nachziehen UND Basislinie neu schreiben:',
  );
  for (const f of guardFehler) console.error(`  · ${f}`);
  process.exit(1);
}

selbsttest();

const ist = berechne();
const alsText = `${JSON.stringify(ist, null, 2)}\n`;

if (schreiben) {
  writeFileSync(ARTEFAKT_PFAD, alsText);
  console.log(
    `Basislinie geschrieben: ${ist.gesamt.stellen} Stellen · ${ist.klassen.length} Klassen · `
    + `${ist.toteSelbstziele.length} tote Selbstziele → ${relative(WURZEL, ARTEFAKT_PFAD)}`,
  );
  process.exit(0);
}

if (!existsSync(ARTEFAKT_PFAD)) {
  console.error(
    `check:verweis-inventar ROT — Basislinie fehlt (${relative(WURZEL, ARTEFAKT_PFAD)}).\n`
    + '  Erzeugen: npm run check:verweis-inventar -- --schreiben',
  );
  process.exit(1);
}

const soll = JSON.parse(readFileSync(ARTEFAKT_PFAD, 'utf8')) as Artefakt;

console.log(
  `check:verweis-inventar — ${ist.korpus.erlasse} Erlasse · ${ist.korpus.eintraege} Bestimmungen · `
  + `${ist.gesamt.stellen} Verweis-Stellen (SELF ${ist.gesamt.self} · FREMD ${ist.gesamt.fremd} · `
  + `TEXT ${ist.gesamt.text}) · Selbstmarker ${ist.gesamt.selbstmarker} · `
  + `tote Selbstziele ${ist.toteSelbstziele.length} · Zeit-Kanten ${ist.zeitKanten.stellen}`,
);

const abweichungen: string[] = [];
if (soll._quellen?.normTextSha256 !== ist._quellen.normTextSha256) {
  abweichungen.push(
    `NormText.tsx hat sich geändert (SHA-256 ${String(soll._quellen?.normTextSha256).slice(0, 12)} → `
    + `${ist._quellen.normTextSha256.slice(0, 12)}). ZUERST die Transkription (Abschnitt 1 + 3 dieses `
    + 'Skripts) gegen die NEUE Entscheidkette prüfen — ein zugefügter oder umgestellter Guard ändert '
    + 'die Auflösung, ohne ein Literal zu entfernen, und wäre für den Literal-Wächter unsichtbar. '
    + 'ERST danach die Basislinie neu schreiben; ein blosses Regenerieren macht das Tor grün über '
    + 'eine Messung, die die Produktion nicht mehr abbildet.',
  );
}
const zeileSoll = new Map((soll.klassen ?? []).map((z) => [z.klasse, z]));
for (const z of ist.klassen) {
  const s = zeileSoll.get(z.klasse);
  if (!s) { abweichungen.push(`Klasse «${z.klasse}» ist NEU (${z.stellen} Stellen).`); continue; }
  if (s.stellen !== z.stellen || s.erlasse !== z.erlasse || s.selbstmarker !== z.selbstmarker) {
    abweichungen.push(
      `${z.klasse}: Stellen ${s.stellen} → ${z.stellen} · Erlasse ${s.erlasse} → ${z.erlasse} · `
      + `Selbstmarker ${s.selbstmarker} → ${z.selbstmarker}`,
    );
  }
}
for (const z of soll.klassen ?? []) {
  if (!ist.klassen.some((k) => k.klasse === z.klasse)) abweichungen.push(`Klasse «${z.klasse}» ist WEGGEFALLEN.`);
}
for (const feld of ['erlasse', 'eintraege', 'texte'] as const) {
  if (soll.korpus?.[feld] !== ist.korpus[feld]) {
    abweichungen.push(`korpus.${feld}: ${soll.korpus?.[feld]} → ${ist.korpus[feld]}`);
  }
}
const schluessel = (t: TotesZiel) => `${t.fundstelle}|${t.bestimmung}`;
const sollTot = new Set((soll.toteSelbstziele ?? []).map(schluessel));
const istTot = new Set(ist.toteSelbstziele.map(schluessel));
for (const t of ist.toteSelbstziele) if (!sollTot.has(schluessel(t))) abweichungen.push(`Totes Selbstziel NEU: ${schluessel(t)}`);
for (const k of sollTot) if (!istTot.has(k)) abweichungen.push(`Totes Selbstziel BEHOBEN: ${k} (Basislinie nachziehen)`);
for (const feld of ['stellen', 'erlasse', 'uebergangsTitel', 'altrechtBlock'] as const) {
  if (soll.zeitKanten?.[feld] !== ist.zeitKanten[feld]) {
    abweichungen.push(`zeitKanten.${feld}: ${soll.zeitKanten?.[feld]} → ${ist.zeitKanten[feld]}`);
  }
}

if (abweichungen.length > 0) {
  console.error(`check:verweis-inventar ROT — ${abweichungen.length} Abweichung(en) gegen die Basislinie:`);
  for (const a of abweichungen) console.error(`  · ${a}`);
  console.error(
    '\n  Bewusste Änderung? Basislinie IM SELBEN Commit regenerieren:\n'
    + '    npm run check:verweis-inventar -- --schreiben',
  );
  process.exit(1);
}

console.log('check:verweis-inventar GRÜN — Inventar deckungsgleich mit der Basislinie.');
