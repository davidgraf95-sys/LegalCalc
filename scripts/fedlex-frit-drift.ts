// ─── FR/IT-Drift-Wächter Stufe 1: eId-Mengenvergleich DE/FR/IT ──────────────
// (ROADMAP `QS-FRIT-DRIFT` · FAHRPLAN-FEDLEX-PORTFOLIO §18.1)
//
// ANLASS (3.8.2026): sämtliche Norm-Verifikationen liefen bisher NUR auf DE.
// Eine französische oder italienische Fassung könnte längst abweichen, ohne
// dass ein Tor es sieht.
//
// WAS DIESES TOR TUT — und was ausdrücklich NICHT:
//   • Es VERGLEICHT die eId-Mengen der drei Sprachfassungen desselben,
//     GEPINNTEN Konsolidierungsstandes und MELDET Abweichungen.
//   • Es schreibt KEINEN Snapshot und baut KEIN dreisprachiges Korpus — das
//     Befüllen der fr/it-Fassungen ist ein eigener Produktentscheid und liegt
//     in `W2·5g-ZEIT` («Mehrsprachiger Normvergleich»).
//
// WARUM AM GEPINNTEN DATUM (nicht «neueste Konsolidierung»): welcher Stand
// gilt, entscheidet EIN Tor — `check:fedlex-versionen` (§5, Currency-Arbiter).
// Dieses Tor fragt eine andere Frage: trägt der Stand, den wir AUSLIEFERN, in
// allen drei Amtssprachen dieselbe Artikel-Struktur? Darum wird strikt der in
// `fedlex-cache.sh` gepinnte `kons`-Tag aufgelöst — apples-to-apples.
//
// ZWEI EBENEN (empirisch begründet, Messung 15.8.2026):
//   • KERN-eIds = die vom Korpus ADRESSIERTEN Knoten: Top-Knoten ohne «/»
//     (`art_219_a`, `annex_*`, `disp_u2`) UND Artikel/Anhänge tiefer im Baum,
//     deren letztes Pfadsegment `art_`/`annex_` ist (`disp_u2/art_1` — davon
//     allein im OR 83 Stück, s. `istKernEid`). Eine Differenz hier heisst: ein
//     Artikel existiert in einer Sprache nicht bzw. trägt einen anderen eId ⇒
//     ROT. Genau hier lag der Erstbefund (OR: `art_219` fehlt in FR,
//     `art_219_a` fehlt in IT).
//   • UNTER-eIds (`art_220/para_1`, `.../lbl_2`, Container wie
//     `chap_6/lvl_u6`) = die bekannte
//     1–5 %-Residue: DE/FR/IT zählen Absätze real verschieden, und Fedlex
//     dokumentiert das im Erlass selbst (OR Art. 1033: «Im französischen und
//     italienischen Text besteht dieser Artikel aus einem einzigen Absatz»).
//     Eine Differenz hier ist ein HINWEIS, nie rot — sonst wäre das Tor
//     dauerhaft rot aus Gründen, die die amtliche Quelle bewusst so führt, und
//     ein dauerhaft rotes Tor wird abgeschaltet statt gelesen.
//   • DUPLIKAT: derselbe Kern-eId zweimal in EINER Sprachfassung ⇒ ROT. Ein
//     doppelter eId zerstört die eId-Adressierbarkeit (der Mengenvergleich
//     selbst würde ihn stillschweigend schlucken) und ist der Mechanismus,
//     über den der OR-Erstbefund entstand.
//
// Deterministisch (§2): injizierbare fetchImpl (Unit-Tests ohne Netz),
// `heute`/Auswahl als Parameter, Reihenfolge = Eingabereihenfolge, kein
// Date.now() in der Vergleichslogik. Endpoint/Batching aus `fedlex-sparql.ts`
// (SSoT §5), Pin-Liste aus `fedlex-cache.sh` via `fedlex-pins.ts` (SSoT §5).
//
//   npm run check:frit-drift            — Live-Lauf über die Kern-Erlasse
//   npm run check:frit-drift -- --liste — nur die Auswahl zeigen (kein Netz)
//
// Exit 0 → ALLE Kern-Erlasse verglichen, keine Kern-Drift, kein Duplikat.
// Exit 1 → Drift/Duplikat/fehlende Sprachfassung (Erlass · Sprache · eIds).
// Exit 2 → UNVOLLSTÄNDIG: mindestens ein Erlass konnte nicht verglichen werden
//          (SPARQL/Filestore/Netz). Kein stilles Grün (§6.7) — «keine Aussage
//          möglich» ist nicht dasselbe wie «alles gleich».
import { statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser } from 'linkedom';
import { sparqlBatch, type FetchImpl, type SparqlBinding } from './fedlex-sparql';
import { lesePinsVoll, type PinVoll } from './fedlex-pins';

export const SPRACHEN = ['de', 'fr', 'it'] as const;
export type Sprache = (typeof SPRACHEN)[number];

const SPRACH_URI: Record<Sprache, string> = {
  de: 'http://publications.europa.eu/resource/authority/language/DEU',
  fr: 'http://publications.europa.eu/resource/authority/language/FRA',
  it: 'http://publications.europa.eu/resource/authority/language/ITA',
};
const XML_FORMAT = 'https://fedlex.data.admin.ch/vocabulary/user-format/xml';

/** Wie viele Kern-Erlasse verglichen werden (§18.1: «~30»). */
export const KERN_ANZAHL = 30;
/** Höflichkeitspause zwischen zwei Filestore-Abrufen (ms). */
const DROSSEL_MS = 200;
/** Maximal gelistete eIds je Differenz-Zeile; der Rest wird gezählt. */
const MAX_LISTE = 20;

// ─── Kern-Erlass-Auswahl (rein, reproduzierbar, NICHT von Hand geführt) ──────
//
// §5: es wird keine zweite Erlass-Liste gepflegt — die Auswahl leitet sich aus
// `fedlex-cache.sh` ab und ist damit an jedem Commit nachrechenbar. Kriterien
// in dieser Reihenfolge:
//   1. Anker-Zahl absteigend — die Anker sind die vom Produkt zitierten,
//      §7-verifizierten Artikel; ihre Zahl misst die Tiefe der Abhängigkeit.
//   2. Snapshot-Gewicht absteigend — Korpus-Gewicht als Tie-Break (der
//      Anker-Schwanz ist ab 1 Anker sonst willkürlich alphabetisch).
//   3. Name aufsteigend — Determinismus.
// `gewicht` ist injiziert, damit die Auswahl ohne Dateisystem testbar bleibt.
export function waehleKernErlasse(
  pins: PinVoll[],
  gewicht: (name: string) => number,
  anzahl = KERN_ANZAHL,
): PinVoll[] {
  return [...pins]
    .sort(
      (a, b) =>
        b.anker.length - a.anker.length ||
        gewicht(b.name) - gewicht(a.name) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, anzahl);
}

/** Snapshot-Grösse in Byte (0, wenn kein Snapshot vorliegt) — für den Tie-Break. */
export function snapshotGewicht(name: string): number {
  const bund = resolve(dirname(fileURLToPath(import.meta.url)), '../public/normtext/bund');
  try {
    return statSync(`${bund}/${name.toUpperCase()}.json`).size;
  } catch {
    return 0;
  }
}

// ─── eIds aus AKN-XML lesen ──────────────────────────────────────────────────
// Namensbewusster Parser statt Regex über den Rumpf (Skill `scraping-swiss-
// official-sources`): der emittierte eId-String wird GELESEN, nie erfunden.
// Rückgabe MIT Duplikaten und in Dokumentreihenfolge — die Duplikat-Prüfung
// hängt daran.
export function leseEids(xml: string): string[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.querySelectorAll('[eId]')]
    .map((el) => el.getAttribute('eId') ?? '')
    .filter(Boolean);
}

/**
 * Kern-eId = ein vom Korpus ADRESSIERTER Knoten: entweder ein Top-Knoten (kein
 * «/») oder ein Artikel/Anhang irgendwo im Baum.
 *
 * KORREKTUR 15.8.2026 (Gegenprüfung): die erste Fassung prüfte nur «kein /» und
 * warf damit **83 echte OR-Artikel** in die nie-rote Residue-Klasse — die
 * Artikel der Schlussbestimmungen tragen zusammengesetzte eIds
 * (`disp_u2/art_1`), und genau die adressiert unser Korpus als
 * `disp_u2_art_1` (s. `public/normtext/bund/OR.json`). Eine künftige Drift dort
 * wäre unsichtbar grün gewesen. Massgeblich ist darum das LETZTE Pfadsegment.
 */
export function istKernEid(eid: string): boolean {
  if (!eid.includes('/')) return true;
  const letztes = eid.slice(eid.lastIndexOf('/') + 1);
  return /^(art|annex)_/.test(letztes);
}

// ─── Vergleich (rein, testbar, kein Netz) ────────────────────────────────────
export type Fassung = { datei: string; eids: string[] };
/** Fehlt eine Sprache ganz, ist ihr Eintrag `undefined` (⇒ SPRACHE-FEHLT). */
export type Fassungen = Partial<Record<Sprache, Fassung>>;

export type BefundArt = 'SPRACHE-FEHLT' | 'DUPLIKAT' | 'DRIFT' | 'RESIDUE' | 'ANERKANNT';
export type Befund = { art: BefundArt; text: string };

// ─── Anerkannte Sprach-Drift (§8-ehrlich; Muster: G-AUFH in ────────────────
//     fedlex-versionen-pruefen.ts, `anerkannteAufhebungNachEli`)
//
// PROBLEM: die drei Befunde vom 15.8.2026 liegen bei Fedlex, nicht bei uns —
// wir können sie nicht beheben. Ein Tor, das darum für immer rot steht, wird
// stummgeschaltet statt gelesen; genau diesen Verfall dokumentiert
// normen-monitor.yml an Issue #166 (vier Wochen identischer Kommentare).
//
// LÖSUNG (wie bei den anerkannten Aufhebungen): eine §7-verifizierte
// Abweichung wird DEKLARIERT und bei jedem Lauf LIVE gegen die Quelle
// nachgeprüft. Drei Zweige, keine Abkürzung:
//   • Ist-Drift == Deklaration  ⇒ ANERKANNT (grün, mit Nennung im Log).
//   • Ist-Drift weicht ab       ⇒ ROT (Deklaration nachführen) — auch dann,
//     wenn die Drift GEWACHSEN ist: neue Fundstellen sind neue Befunde.
//   • Ist-Drift leer            ⇒ ROT (Fedlex hat behoben ⇒ Deklaration
//     entfernen). Eine Deklaration, die nichts mehr deckt, behauptet still
//     einen Mangel, den es nicht gibt.
// Eine UNDEKLARIERTE Drift bleibt rot — das ist der Sinn des Tors.
export type DriftDeklaration = {
  erlass: string;
  sprache: Sprache;
  /** Kern-eIds, die ggü. DE fehlen (sortiert). */
  fehlend: string[];
  /** Kern-eIds, die es ggü. DE zusätzlich gibt (sortiert). */
  ueberzaehlig: string[];
  /** Kern-eIds, die in DIESER Sprachfassung doppelt vergeben sind (sortiert). */
  doppelt: string[];
  /** Datum der §7-Verifikation gegen das amtliche Filestore-XML. */
  belegt: string;
  grund: string;
};

/**
 * Am 15.8.2026 gegen das amtliche Filestore-XML verifiziert (Erstlauf dieses
 * Tors). Details und Nachweis: `bibliothek/register/frit-drift-2026-08-15.md`,
 * FAHRPLAN-FEDLEX-PORTFOLIO §18.1.
 */
export const ANERKANNTE_DRIFT: DriftDeklaration[] = [
  {
    erlass: 'or',
    sprache: 'fr',
    fehlend: ['art_219'],
    ueberzaehlig: [],
    doppelt: ['art_221'],
    belegt: '2026-08-15',
    grund:
      'Art. 219a (eingefügt per 1.1.2026, Baumängel) bekam in der FR-Fassung keinen eigenen eId: der Knoten mit <num>Art. 219</num> trägt eId art_220, art_221 ist doppelt vergeben — Artikel-Text gegenüber eId um eins versetzt.',
  },
  {
    erlass: 'or',
    sprache: 'it',
    fehlend: ['art_219_a'],
    ueberzaehlig: [],
    doppelt: ['art_219'],
    belegt: '2026-08-15',
    grund:
      'Dieselbe Wurzel in der IT-Fassung: der Knoten mit <num>Art. 219a</num> trägt eId art_219 (doppelt), art_219_a fehlt.',
  },
  {
    erlass: 'patg',
    sprache: 'fr',
    fehlend: ['art_86_l'],
    ueberzaehlig: [],
    doppelt: ['art_86_k'],
    belegt: '2026-08-15',
    grund: 'Der Knoten mit <num>Art. 86l</num> trägt eId art_86_k (doppelt), art_86_l fehlt.',
  },
  {
    erlass: 'patg',
    sprache: 'it',
    fehlend: ['art_86_l'],
    ueberzaehlig: [],
    doppelt: ['art_86_k'],
    belegt: '2026-08-15',
    grund: 'Wie FR: der Knoten mit <num>Art. 86l</num> trägt eId art_86_k (doppelt).',
  },
  {
    erlass: 'bewg',
    sprache: 'fr',
    fehlend: ['disp_u2', 'disp_u3', 'disp_u4'],
    ueberzaehlig: [],
    doppelt: [],
    belegt: '2026-08-15',
    grund:
      'Die FR-Fassung führt die Schlussbestimmungen nach einem ANDEREN eId-Schema: 1997/1999/2001 stehen als <level eId="chap_6/lvl_u6|u7|u8"> statt als <proviso eId="disp_u2|u3|u4">. Der Inhalt fehlt also nicht — aber FR disp_u1 trägt die Bestimmung von 2020 (= DE disp_u4), während DE disp_u1 die von 1997 ist: DERSELBE eId, ANDERER Erlassteil. Schärfster Beleg dafür, dass eId kein sprachübergreifender Schlüssel ist (Korrektur der ersten Lesart «fehlen ganz», Gegenprüfung 15.8.2026).',
  },
];

export type ErlassBefund = {
  name: string;
  de: Set<string>;
  fr: Set<string>;
  it: Set<string>;
  differenzen: Befund[];
  /** true ⇒ Exit 1 (Kern-Drift, Duplikat oder fehlende Sprachfassung). */
  rot: boolean;
};

function kuerze(eids: string[]): string {
  const kopf = eids.slice(0, MAX_LISTE).join(', ');
  return eids.length > MAX_LISTE ? `${kopf} … (+${eids.length - MAX_LISTE} weitere)` : kopf;
}

function duplikate(eids: string[]): string[] {
  const gesehen = new Set<string>();
  const doppelt = new Set<string>();
  for (const e of eids) {
    if (gesehen.has(e)) doppelt.add(e);
    else gesehen.add(e);
  }
  return [...doppelt];
}

const nurIn = (a: Set<string>, b: Set<string>): string[] => [...a].filter((x) => !b.has(x));

const gleich = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i]);

const beschreibe = (fehlend: string[], ueberzaehlig: string[], doppelt: string[]): string => {
  const teile: string[] = [];
  if (fehlend.length > 0) teile.push(`fehlend [${kuerze(fehlend)}]`);
  if (ueberzaehlig.length > 0) teile.push(`überzählig [${kuerze(ueberzaehlig)}]`);
  if (doppelt.length > 0) teile.push(`doppelt [${kuerze(doppelt)}]`);
  return teile.length > 0 ? teile.join(', ') : 'keine Abweichung';
};

/**
 * Vergleicht die drei Sprachfassungen EINES Erlasses.
 *
 * ABWEICHUNG vom Auftragswortlaut `vergleicheSprachfassungen(eli)`, offengelegt
 * nach §7: eine Funktion, die eine ELI entgegennimmt, müsste das Netz befragen
 * und wäre damit weder rein noch ohne Netz testbar. Der Netz-Teil steht darum
 * in `holeFassungen()`; hier liegt der seiteneffektfreie Kern.
 */
export function vergleicheSprachfassungen(
  name: string,
  fassungen: Fassungen,
  deklarationen: DriftDeklaration[] = ANERKANNTE_DRIFT,
): ErlassBefund {
  const kern = {} as Record<Sprache, Set<string>>;
  const unter = {} as Record<Sprache, Set<string>>;
  const doppelt = {} as Record<Sprache, string[]>;
  const differenzen: Befund[] = [];
  let rot = false;

  for (const s of SPRACHEN) {
    const f = fassungen[s];
    kern[s] = new Set((f?.eids ?? []).filter(istKernEid));
    unter[s] = new Set((f?.eids ?? []).filter((e) => !istKernEid(e)));
    doppelt[s] = f ? duplikate(f.eids.filter(istKernEid)).sort() : [];
    if (!f) {
      differenzen.push({
        art: 'SPRACHE-FEHLT',
        text: `SPRACHE-FEHLT ${name}: keine ${s.toUpperCase()}-XML-Fassung des gepinnten Standes auflösbar (isRealizedBy/isEmbodiedBy/isExemplifiedBy) → Sprachfassung fehlt oder ELI/Datum prüfen!`,
      });
      rot = true;
    }
  }

  // KORREKTUR 15.8.2026 (Gegenprüfung): eine leere DE-Menge darf nie als
  // «identisch» durchgehen. Drei leere Mengen sind formal gleich — und wären
  // als GLEICH mit Exit 0 gemeldet worden, obwohl gar nichts verglichen wurde.
  if (fassungen.de && kern.de.size === 0) {
    differenzen.push({
      art: 'SPRACHE-FEHLT',
      text: `SPRACHE-FEHLT ${name}: die DE-Fassung enthält KEINEN einzigen Kern-eId — kein Erlass, sondern eine leere/defekte Antwort. Kein Vergleich möglich (nie «gleich», §6.7).`,
    });
    rot = true;
  }

  // Ein Duplikat in der DE-Fassung ist NIE anerkennbar: DE ist der Anker, auf
  // dem das ausgelieferte Korpus und alle §7-Anker sitzen. Darum vor und
  // unabhängig von der Deklarations-Logik geprüft.
  if (doppelt.de.length > 0) {
    differenzen.push({
      art: 'DUPLIKAT',
      text: `DUPLIKAT      ${name} [de]: ${doppelt.de.length} Kern-eId(s) doppelt vergeben — die ANKER-Sprache selbst ist eId-mehrdeutig: ${kuerze(doppelt.de)}`,
    });
    rot = true;
  }

  // Vergleichsanker ist DE — die Sprache, in der alle §7-Verifikationen laufen.
  for (const s of ['fr', 'it'] as const) {
    if (!fassungen[s] || !fassungen.de) continue;
    const fehlend = nurIn(kern.de, kern[s]).sort();
    const ueberzaehlig = nurIn(kern[s], kern.de).sort();
    const dekl = deklarationen.find((d) => d.erlass === name && d.sprache === s);
    const istLeer = fehlend.length === 0 && ueberzaehlig.length === 0 && doppelt[s].length === 0;

    // Eine Deklaration ohne gedeckte Abweichung wäre ein Blanko-Freibrief:
    // sie würde jede künftige Drift dieses Erlasses anerkennen. Darum zählt
    // nur eine Deklaration, die überhaupt etwas behauptet (Gegenprüfung
    // 15.8.2026, Randfall B).
    const deklGueltig =
      dekl && dekl.fehlend.length + dekl.ueberzaehlig.length + dekl.doppelt.length > 0;

    if (dekl && deklGueltig) {
      const deckt =
        gleich(fehlend, [...dekl.fehlend].sort()) &&
        gleich(ueberzaehlig, [...dekl.ueberzaehlig].sort()) &&
        gleich(doppelt[s], [...dekl.doppelt].sort());
      differenzen.push(
        deckt
          ? {
              art: 'ANERKANNT',
              text: `ANERKANNT     ${name} [${s}]: bekannte Sprach-Drift, live bestätigt (verifiziert ${dekl.belegt}) — ${dekl.grund}`,
            }
          : {
              art: 'DRIFT',
              text: istLeer
                ? `DRIFT         ${name} [${s}]: als bekannte Sprach-Drift DEKLARIERT (${dekl.belegt}), Fedlex zeigt aber KEINE Abweichung mehr → Deklaration in ANERKANNTE_DRIFT entfernen!`
                : `DRIFT         ${name} [${s}]: Ist-Drift weicht von der Deklaration (${dekl.belegt}) ab — ist: ${beschreibe(fehlend, ueberzaehlig, doppelt[s])} · deklariert: ${beschreibe(dekl.fehlend, dekl.ueberzaehlig, dekl.doppelt)} → §7 nachprüfen und Deklaration nachführen!`,
            },
      );
      if (!deckt) rot = true;
      // KEIN `continue`: die Residue-Zeile unten gehört auch hier ins Log. Ihr
      // Fehlen hat bei BewG den wahren Mechanismus verdeckt (Gegenprüfung
      // 15.8.2026) — die «3 überzählig» waren der Hinweis auf das abweichende
      // eId-Schema der FR-Fassung.
    } else {
      // Undeklariert: jede Abweichung ist rot — das ist der Sinn des Tors.
      if (doppelt[s].length > 0) {
        differenzen.push({
          art: 'DUPLIKAT',
          text: `DUPLIKAT      ${name} [${s}]: ${doppelt[s].length} Kern-eId(s) doppelt vergeben — eId-Adressierung unzuverlässig: ${kuerze(doppelt[s])}`,
        });
        rot = true;
      }
      if (fehlend.length > 0 || ueberzaehlig.length > 0) {
        const teile: string[] = [];
        if (fehlend.length > 0) teile.push(`fehlt ggü. DE (${fehlend.length}): ${kuerze(fehlend)}`);
        if (ueberzaehlig.length > 0)
          teile.push(`überzählig ggü. DE (${ueberzaehlig.length}): ${kuerze(ueberzaehlig)}`);
        differenzen.push({
          art: 'DRIFT',
          text: `DRIFT         ${name} [${s}]: ${teile.join(' · ')}`,
        });
        rot = true;
      }
    }
    const rFehlend = nurIn(unter.de, unter[s]).length;
    const rUeber = nurIn(unter[s], unter.de).length;
    if (rFehlend > 0 || rUeber > 0) {
      differenzen.push({
        art: 'RESIDUE',
        text: `RESIDUE       ${name} [${s}]: ${rFehlend} fehlend / ${rUeber} überzählig unterhalb der Artikel-Ebene (Absatz-/Listen-Zählung — amtlich gewollte Sprachdifferenz, kein Rot)`,
      });
    }
  }

  return { name, de: kern.de, fr: kern.fr, it: kern.it, differenzen, rot };
}

// ─── Netz: Manifestationen auflösen und XML holen ────────────────────────────
/**
 * Löst je Pin und Sprache die kanonische XML-Manifestation des GEPINNTEN
 * Konsolidierungsstandes auf (`isExemplifiedBy` — nie string-getemplatet,
 * s. Skill `scraping-swiss-official-sources`). Rückgabe: name → {de,fr,it}.
 */
export async function loeseXmlManifeste(
  pins: PinVoll[],
  fetchImpl: FetchImpl = fetch,
): Promise<Map<string, Partial<Record<Sprache, string>>>> {
  const abstracts = [...new Set(pins.map((p) => p.eli))];
  const bindings: SparqlBinding[] = await sparqlBatch(
    abstracts.map((e) => `<https://fedlex.data.admin.ch/eli/${e}>`),
    (valuesInline) => `
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?date ?lang ?file WHERE {
  VALUES ?abstract { ${valuesInline} }
  VALUES ?lang { <${SPRACH_URI.de}> <${SPRACH_URI.fr}> <${SPRACH_URI.it}> }
  ?c jolux:isMemberOf ?abstract ;
     jolux:dateApplicability ?date ;
     jolux:isRealizedBy ?expr .
  ?expr jolux:language ?lang ;
        jolux:isEmbodiedBy ?manif .
  ?manif jolux:userFormat <${XML_FORMAT}> ;
         jolux:isExemplifiedBy ?file .
}`,
    { batchGroesse: 10, fetchImpl },
  );

  const index = new Map<string, string>(); // eli|YYYYMMDD|lang → file
  for (const b of bindings) {
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch/eli/', '');
    const datum = b.date.value.slice(0, 10).replace(/-/g, '');
    const kuerzel = (Object.keys(SPRACH_URI) as Sprache[]).find(
      (s) => SPRACH_URI[s] === b.lang.value,
    );
    if (kuerzel) index.set(`${eli}|${datum}|${kuerzel}`, b.file.value);
  }

  const ergebnis = new Map<string, Partial<Record<Sprache, string>>>();
  for (const p of pins) {
    const je: Partial<Record<Sprache, string>> = {};
    for (const s of SPRACHEN) {
      const file = index.get(`${p.eli}|${p.konsKompakt}|${s}`);
      if (file) je[s] = file;
    }
    ergebnis.set(p.name, je);
  }
  return ergebnis;
}

/**
 * Holt eine Filestore-Datei und gibt ihren Rumpf zurück.
 * SOFT-404: eine fehlende Datei antwortet mit HTTP 200 und einer Angular-Shell
 * («Casemates»). Erfolg wird darum am Content-Type/Rumpf gemessen, NIE am
 * Status (Skill `scraping-swiss-official-sources`, Fakt 3).
 */
export async function holeXml(url: string, fetchImpl: FetchImpl = fetch): Promise<string> {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
  const ct = res.headers.get('content-type') ?? '';
  const rumpf = await res.text();
  if (!ct.includes('xml') || /^\s*<!DOCTYPE html/i.test(rumpf)) {
    throw new Error(`Soft-404/Shell statt XML (Content-Type «${ct}») für ${url}`);
  }
  // KORREKTUR 15.8.2026 (Gegenprüfung): Content-Type allein genügt nicht. Eine
  // Wartungs- oder Fehlerantwort mit `application/xml` («<error>…») kam sauber
  // durch und lieferte NULL eIds — daraus wurde «Mengen identisch» statt
  // «keine Aussage möglich» (stilles Grün, §6.7). Darum das Wurzelelement
  // prüfen: ohne `<akomaNtoso` ist es kein Erlass.
  if (!rumpf.includes('<akomaNtoso')) {
    throw new Error(`Antwort ist kein AKN-Dokument (kein <akomaNtoso>) für ${url}`);
  }
  return rumpf;
}

/** Holt die drei Sprachfassungen EINES Erlasses (sequenziell, gedrosselt). */
export async function holeFassungen(
  urls: Partial<Record<Sprache, string>>,
  fetchImpl: FetchImpl = fetch,
  drosselMs = DROSSEL_MS,
): Promise<Fassungen> {
  const fassungen: Fassungen = {};
  for (const s of SPRACHEN) {
    const url = urls[s];
    if (!url) continue;
    const xml = await holeXml(url, fetchImpl);
    fassungen[s] = { datei: url, eids: leseEids(xml) };
    if (drosselMs > 0) await new Promise((r) => setTimeout(r, drosselMs));
  }
  return fassungen;
}

// ─── Lauf ────────────────────────────────────────────────────────────────────
async function main() {
  const alle = lesePinsVoll();
  if (alle.length === 0) {
    console.error('FEHLER: keine EINTRAEGE in scripts/fedlex-cache.sh gefunden (Format geändert?).');
    process.exit(2);
  }
  const kern = waehleKernErlasse(alle, snapshotGewicht);

  if (process.argv.includes('--liste')) {
    console.log(`Kern-Erlasse (${kern.length} von ${alle.length} Pins; Anker ↓, Snapshot-Gewicht ↓, Name ↑):`);
    for (const [i, p] of kern.entries()) {
      console.log(
        `${String(i + 1).padStart(2)}. ${p.name.padEnd(14)} SR ${(p.sr || '—').padEnd(16)} ${p.eli} @ ${p.kons}  (${p.anker.length} Anker)`,
      );
    }
    return;
  }

  console.log(
    `FR/IT-Drift-Wächter Stufe 1: ${kern.length} Kern-Erlasse × 3 Sprachfassungen, eId-Mengenvergleich am GEPINNTEN Stand.\n`,
  );

  let manifeste: Map<string, Partial<Record<Sprache, string>>>;
  try {
    manifeste = await loeseXmlManifeste(kern);
  } catch (e) {
    console.error(
      `FEHLER: Fedlex-SPARQL nicht erreichbar (${e instanceof Error ? e.message : e}) — keine Aussage möglich.`,
    );
    process.exit(2);
  }

  let rot = 0;
  let unvollstaendig = 0;
  let gleich = 0;
  let residue = 0;
  let bekannt = 0;

  for (const p of kern) {
    const urls = manifeste.get(p.name) ?? {};
    let fassungen: Fassungen;
    try {
      fassungen = await holeFassungen(urls, fetch);
    } catch (e) {
      // NETZ-Warnung ist AUSDRÜCKLICH keine Drift: «keine Aussage möglich»
      // darf nie als «Fassungen weichen ab» erscheinen (§8-Ehrlichkeit).
      console.log(
        `NETZ          ${p.name}: Fassungen nicht vollständig abrufbar (${e instanceof Error ? e.message : e}) — nicht verglichen.`,
      );
      unvollstaendig++;
      continue;
    }
    const befund = vergleicheSprachfassungen(p.name, fassungen);
    if (befund.rot) {
      rot++;
      for (const d of befund.differenzen) console.log(d.text);
      continue;
    }
    const anerkannt = befund.differenzen.filter((d) => d.art === 'ANERKANNT');
    const r = befund.differenzen.filter((d) => d.art === 'RESIDUE');
    if (anerkannt.length > 0) bekannt++;
    else if (r.length > 0) residue++;
    else gleich++;
    console.log(
      anerkannt.length > 0
        ? `BEKANNT       ${p.name}: ${befund.de.size} Kern-eIds, Abweichung deckungsgleich mit der Deklaration (${p.eli} @ ${p.kons})`
        : `GLEICH        ${p.name}: ${befund.de.size} Kern-eIds in de/fr/it identisch (${p.eli} @ ${p.kons})`,
    );
    for (const d of [...anerkannt, ...r]) console.log(d.text);
  }

  console.log('');
  if (rot > 0) {
    console.log(
      `${rot} von ${kern.length} Kern-Erlassen mit UNDEKLARIERTER SPRACH-DRIFT (fehlende/überzählige/doppelte Kern-eIds). ` +
        'Das ist in aller Regel ein Befund an der amtlichen Quelle, kein Defekt dieses Tors: die Differenz-Menge oben ' +
        'gegen das Fedlex-XML nachprüfen (§7), im Fahrplan §18.1 festhalten und — wenn bestätigt und von uns nicht ' +
        'behebbar — in ANERKANNTE_DRIFT deklarieren. Nie durch Anheben der Schwelle wegdrücken; sobald fr/it ' +
        'ausgeliefert werden (W2·5g-ZEIT), dürfen die betroffenen eIds nicht als sprachgleich behandelt werden.',
    );
    process.exit(1);
  }
  if (unvollstaendig > 0) {
    console.log(
      `UNVOLLSTÄNDIG: ${unvollstaendig} von ${kern.length} Kern-Erlassen konnten nicht verglichen werden (Netz/Filestore). ` +
        'Keine Aussage möglich — das ist kein Grün (§6.7).',
    );
    process.exit(2);
  }
  console.log(
    `Alle ${kern.length} Kern-Erlasse verglichen: ${gleich} vollständig identisch, ${residue} identisch auf Artikel-Ebene ` +
      `mit amtlich gewollter Absatz-Residue, ${bekannt} mit deklarierter und live bestätigter Sprach-Drift (ANERKANNTE_DRIFT). ` +
      'Keine undeklarierte Abweichung.',
  );
}

if (!process.env.VITEST) void main();
