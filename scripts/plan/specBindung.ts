// scripts/plan/specBindung.ts
//
// Regel 11 — SPEC-BINDUNG. Prävention der Fehlerklasse «§-Anker löst auf, trifft
// aber das Falsche» (Bauplan-Review 4.8.2026, Befund B1; Spec in
// fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md, Abschnitt «Bauplan-Review 4.8.2026»,
// Umsetzungs-Schritt 3).
//
// Ausgangslage: Regel 9 prüft, dass der `fahrplan:`-PFAD existiert — also die
// Existenz des Containers. Der eigentliche Zeiger auf die Bau-Spec steht aber
// nicht im `fahrplan:`-Feld, sondern in der ROADMAP-Prosa daneben
// («**Detail:** [FAHRPLAN-X.md](fahrplaene/FAHRPLAN-X.md) §Y»), und den sah bis
// heute keine Regel an. Drei von rund 80 Verweisen zeigten am 4.8.2026 ins Leere
// oder auf einen fremden Abschnitt, ohne dass ein Tor rot wurde:
//   · `W2·5k-LINIEN-KONZEPT` → GESETZESDARSTELLUNG-V2 «§L-3/A28» (existiert nicht)
//   · `QS-KORPUS-BMV`        → FEDLEX-PORTFOLIO §17 (behandelt fza/cmr, nicht BMV)
//   · `QS-UI-HIGHLIGHT`      → UI-NAVIGATION §S (Stand-Chronik, keine Bau-Spec)
// Die Bau-Session landet damit im falschen Abschnitt und baut nach fremder Spec.
//
// Die Regel hat zwei Stufen:
//   (a) ANKER-AUFLÖSUNG — der §-Token muss in der Zieldatei als Überschrift
//       auflösen;
//   (b) ID-BINDUNG — der so adressierte Abschnitt (Überschrift bis zur nächsten
//       Überschrift gleicher oder höherer Ebene) muss die Schritt-ID wörtlich
//       nennen. Damit wird die Intake-Regel «Bau-Spec im ROADMAP-Spec-§ des
//       verlinkten Fahrplans» maschinell prüfbar statt bloss verabredet.
//
// EHRLICHE GRENZEN (§8) — gemessen 5.8.2026 an ROADMAP.md: die Regel erfasst 66
// von 68 Verweisen. Zwei Formen liegen bewusst ausserhalb, damit niemand mehr
// Deckung annimmt, als sie gibt:
//   1. Verweise in Blockquote-Prosa, deren @meta an keiner Listen-Bullet hängt
//      (im Bestand genau einer: `QS-TOK`, ROADMAP Z.292). Ohne Bullet gibt es
//      keinen Prosa-Block, dem der Verweis zugeordnet werden könnte.
//   2. Bereichsangaben der Form «§§3–§7». Sie zeigen auf eine über mehrere §§
//      verteilte Spec; eine Zerlegung müsste Bereichs-Enden raten (§2).
// Beide sind als Nachzug im Bericht vermerkt, nicht still weggelassen.
import { BULLET_RE, bulletEinzug } from './parse';
import { parseEtikett } from './etikett';

export interface SpecProblem { id: string | null; meldung: string }

/** Überschriftszeile (auch im Blockquote) — dieselbe Form wie in check.ts/parse.ts. */
const UEBERSCHRIFT_RE = /^[ \t]*(?:>[ \t]*)*(#{1,6})[ \t]/;

/**
 * Fahrplan-Verweis mit §-Anker in der ROADMAP-Prosa. Zwei Schreibformen sind im
 * Bestand belegt (erhoben per grep über ROADMAP.md, 5.8.2026):
 *   · Markdown-Link:  `](fahrplaene/FAHRPLAN-X.md) §17`
 *   · Backtick-Pfad:  `` `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3 ``
 * Der Anker selbst steht mal blank (`§17`), mal in Backticks
 * (`` `§Quell-Architektur-Entscheid` ``) — beides wird gefasst.
 *
 * Bewusst NICHT gefasst: freistehende §-Nennungen ohne unmittelbar davor
 * stehenden Datei-Verweis (z. B. «§STRANG B (B-3)», «+ §11 (GmbH-Gründung)»).
 * Sie tragen keine Datei-Angabe; welche Datei gemeint ist, wäre geraten — und
 * eine Regel, die rät, meldet Falsches (§2).
 */
const VERWEIS_RE = /(?:\]\(|`)((?:fahrplaene|archiv)\/FAHRPLAN-[^)`\s]+\.md)(?:\)|`)[ \t]*`?(§[^\s(),;`*·]+)/g;

/**
 * Begründete Ausnahmen. Schlüssel ist `«<id> <anker>»` — verschiebt jemand den
 * Anker, verliert die Ausnahme ihre Wirkung und die Regel greift wieder
 * (fail-closed). Jeder Eintrag trägt seine Begründung; ein Eintrag ohne
 * haltbare Begründung gehört NICHT hierhin, sondern in den Befundbericht.
 */
export const SPEC_BINDUNG_AUSNAHMEN: ReadonlyMap<string, string> = new Map<string, string>([
  // W3·10 zeigt als einziger Schritt in einen ARCHIVIERTEN Fahrplan — laut ROADMAP
  // (Z.589 f., 31.7.2026) eine ausdrücklich deklarierte Ausnahme, deren Auflösung
  // selbst der erste Arbeitsschritt des Schritts ist («Restpunkte-Extraktion aus
  // §P3 in einen aktiven Fahrplan»). Die Datei stammt aus der Zeit VOR der
  // §-Überschriften-Konvention: sie gliedert in `## P0`…`## P4` ohne §-Sigel, und
  // sie kennt die heutige Schritt-ID `W3·10` nicht. Beide Stufen der Regel können
  // dort also gar nicht greifen, ohne dass etwas falsch wäre. Die Ausnahme fällt
  // mit der Extraktion weg — dann zeigt der Verweis auf einen aktiven Fahrplan
  // und der Schlüssel passt nicht mehr.
  ['W3·10 §P3', 'Archiv-Fahrplan ohne §-Überschriften; Auflösung ist der erste Arbeitsschritt von W3·10 selbst'],
]);

interface Block { id: string; start: number; ende: number; einzug: number }

/**
 * Nächste Listen-Bullet oberhalb eines @meta — mit ODER ohne Checkbox.
 *
 * Bewusst NICHT `bindeCheckbox` aus parse.ts: jene Funktion beantwortet die
 * Frage «welche CHECKBOX gehört zu diesem @meta» und liefert darum `null`, wenn
 * die Bullet keine Checkbox trägt (Querschnitt-Band). Hier ist die Frage eine
 * andere — «wo beginnt der Prosa-Block dieses Schritts» —, und die hat auch eine
 * checkbox-lose Bullet als Antwort.
 */
function bulletOben(zeilen: string[], metaIdx: number): number | null {
  let leerFolge = 0;
  for (let j = metaIdx - 1; j >= 0; j--) {
    const z = zeilen[j];
    if (z.trim() === '') { if (++leerFolge >= 2) break; continue; }
    leerFolge = 0;
    if (UEBERSCHRIFT_RE.test(z)) break;
    if (BULLET_RE.test(z)) return j;
    if (z.includes('<!--') || z.includes('-->')) break; // fremdes @meta / Kommentar-Grenze
  }
  return null;
}

/** Ende des Prosa-Blocks einer Bullet: bis zur nächsten gleich-/höherrangigen
 *  Bullet, einer Überschrift oder einer doppelten Leerzeile. */
function blockEnde(zeilen: string[], start: number, einzug: number): number {
  let leerFolge = 0;
  for (let j = start + 1; j < zeilen.length; j++) {
    const z = zeilen[j];
    if (z.trim() === '') { if (++leerFolge >= 2) return j - 2; continue; }
    leerFolge = 0;
    if (UEBERSCHRIFT_RE.test(z)) return j - 1;
    if (BULLET_RE.test(z) && bulletEinzug(z) <= einzug) return j - 1;
  }
  return zeilen.length - 1;
}

/** Prosa-Blöcke aller etikettierten Einheiten, in Dokumentreihenfolge. */
export function bloecke(zeilen: string[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < zeilen.length; i++) {
    if (!zeilen[i].includes('<!-- @meta')) continue;
    const id = parseEtikett(zeilen[i]).id;
    const b = bulletOben(zeilen, i);
    if (b === null) { out.push({ id, start: i, ende: i, einzug: 0 }); continue; }
    const einzug = bulletEinzug(zeilen[b]);
    out.push({ id, start: b, ende: blockEnde(zeilen, b, einzug), einzug });
  }
  return out;
}

/**
 * Besitzer einer Zeile = der Block mit dem TIEFSTEN Einzug, der sie enthält.
 * Ein Unterschritt liegt im Block seiner Dach-Bullet; seine eigene Prosa gehört
 * ihm, die der Dach-Bullet der Dach-Bullet. Ohne die Tiefen-Regel erbte der
 * jeweils äussere Schritt jeden Verweis seiner Kinder.
 */
function besitzer(bl: Block[], zeile: number): Block | null {
  let treffer: Block | null = null;
  for (const b of bl) {
    if (zeile < b.start || zeile > b.ende) continue;
    if (!treffer || b.einzug > treffer.einzug || (b.einzug === treffer.einzug && b.start > treffer.start)) treffer = b;
  }
  return treffer;
}

export interface Verweis {
  id: string;
  datei: string;
  /** Der Anker im Wortlaut der ROADMAP — trägt die Meldung und den Ausnahme-Schlüssel. */
  anker: string;
  /** Seine Einzel-Anker: «§12/§13» sind ZWEI Zeiger, «§L-3/A28» ist EINER. */
  teile: string[];
  zeile: number;
}

/**
 * Verbund-Anker in Einzel-Anker zerlegen. Getrennt wird ausschliesslich an der
 * Folge «/§» — nur dort beginnt nachweislich ein zweiter Zeiger («§12/§13» =
 * Abschnitt 12 UND 13). Ein blosser Schrägstrich trennt nicht: «§L-3/A28» ist
 * EIN Anker, dessen zweiter Teil kein § trägt. Ohne diese Unterscheidung meldete
 * die Regel für «§12/§13» einen einzigen, nirgends existierenden Anker — der
 * Befund wäre richtig, seine Begründung aber falsch, und die Doku-Korrektur
 * liefe ins Leere (§8).
 */
function zerlege(anker: string): string[] {
  return anker.split('/§').map((t, i) => (i === 0 ? t : `§${t}`));
}

/** Alle Fahrplan-Verweise mit §-Anker, die einer etikettierten Einheit zugeordnet sind. */
export function sammleVerweise(md: string): Verweis[] {
  const zeilen = md.split(/\r?\n/);
  const bl = bloecke(zeilen);
  const out: Verweis[] = [];
  for (let i = 0; i < zeilen.length; i++) {
    VERWEIS_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = VERWEIS_RE.exec(zeilen[i])) !== null) {
      const b = besitzer(bl, i);
      if (!b) continue; // Verweis ausserhalb jeder etikettierten Einheit (Anhang-Prosa)
      const anker = m[2].replace(/[.,;:!?]+$/, '');
      if (anker === '§') continue;
      out.push({ id: b.id, datei: m[1], anker, teile: zerlege(anker), zeile: i + 1 });
    }
  }
  return out;
}

/** Zeichen, die eine Fortsetzung des Tokens wären — dahinter endet keine Wortgrenze. */
const FORTSETZUNG = /[0-9A-Za-zÀ-ÖØ-öø-ÿ.\-/]/;

/**
 * Löst der §-Token auf DIESER Überschrift auf?
 *
 * Geprüft wird der ANFANG des Überschriftstexts, nicht ein beliebiges Vorkommen.
 * Grund empirisch (§7-Abweichung vom Auftragswortlaut «Substring-Match»,
 * gemessen 5.8.2026 an FAHRPLAN-FEDLEX-PORTFOLIO.md): die Nachzug-Überschriften
 * der ROADMAP-Diät tragen ihren Ziel-§ im Titel mit — «### §20.4 `QS-KORPUS-BMV`
 * — Bau-Spec im Wortlaut *(→ Bau-Spec: §17 dieser Datei)*». Ein Substring-Match
 * liesse den Anker «§17» dort auflösen und den Abschnitt §20.4 als Treffer
 * gelten; die Regel wäre für genau den Fall blind, für den sie gebaut ist —
 * und ihr Rot-Beweis (QS-KORPUS-BMV) fiele still grün aus (§6.7).
 */
function ankerTrifft(zeile: string, anker: string): boolean {
  const m = zeile.match(UEBERSCHRIFT_RE);
  if (!m) return false;
  const text = zeile.slice(m[0].length).replace(/^[`*\s]+/, '');
  if (!text.startsWith(anker)) return false;
  const nach = text[anker.length];
  return nach === undefined || !FORTSETZUNG.test(nach);
}

/** Wortgrenzen-Treffer einer Schritt-ID im Abschnittstext (nie blosse Substring-Präsenz). */
export function idTrifft(text: string, id: string): boolean {
  const grenze = /[0-9A-Za-zÀ-ÖØ-öø-ÿ·\-]/;
  for (let i = text.indexOf(id); i >= 0; i = text.indexOf(id, i + 1)) {
    const vor = text[i - 1];
    const nach = text[i + id.length];
    if ((vor === undefined || !grenze.test(vor)) && (nach === undefined || !grenze.test(nach))) return true;
  }
  return false;
}

/** Alle Abschnitte einer Datei, deren Überschrift den Anker trägt (Text ohne die Überschriftszeile). */
function abschnitte(dateiText: string, anker: string): string[] {
  const zeilen = dateiText.split(/\r?\n/);
  const out: string[] = [];
  for (let i = 0; i < zeilen.length; i++) {
    if (!ankerTrifft(zeilen[i], anker)) continue;
    const ebene = zeilen[i].match(UEBERSCHRIFT_RE)![1].length;
    let j = i + 1;
    for (; j < zeilen.length; j++) {
      const m = zeilen[j].match(UEBERSCHRIFT_RE);
      if (m && m[1].length <= ebene) break;
    }
    out.push(zeilen.slice(i, j).join('\n'));
  }
  return out;
}

/**
 * Regel 11 — Spec-Bindung.
 *
 * @param leseDatei liefert den Dateiinhalt oder `null`, wenn die Datei fehlt.
 *   Injiziert, damit die Tests ohne Dateisystem deterministisch bleiben.
 */
export function pruefeSpecBindung(md: string, leseDatei: (pfad: string) => string | null): SpecProblem[] {
  const probleme: SpecProblem[] = [];
  const cache = new Map<string, string | null>();
  for (const v of sammleVerweise(md)) {
    const grund = SPEC_BINDUNG_AUSNAHMEN.get(`${v.id} ${v.anker}`);
    if (grund) continue;
    if (!cache.has(v.datei)) cache.set(v.datei, leseDatei(v.datei));
    const text = cache.get(v.datei) ?? null;
    if (text === null) {
      // Regel 9 meldet den toten `fahrplan:`-Pfad; hier geht es um den
      // PROSA-Verweis, der auf eine andere Datei zeigen kann als das Feld.
      probleme.push({ id: v.id, meldung: `Spec-Verweis (Z.${v.zeile}) auf "${v.datei}" — Datei nicht lesbar` });
      continue;
    }
    // (a) Anker-Auflösung: JEDER Einzel-Anker muss auflösen — ein toter Zeiger
    //     im Verbund schickt die Bau-Session ebenso ins Leere wie ein einzelner.
    const tot = v.teile.filter((t) => abschnitte(text, t).length === 0);
    if (tot.length) {
      const wo = tot.join(', ') + (tot.length < v.teile.length ? ` (aus "${v.anker}")` : '');
      probleme.push({ id: v.id, meldung: `Spec-Anker ${wo} (Z.${v.zeile}) löst in "${v.datei}" nicht auf — keine Überschrift trägt ihn` });
      continue;
    }
    // (b) ID-Bindung: der Verbund muss die Schritt-ID nennen — bei mehreren
    //     Einzel-Ankern genügt EINER, denn eine Bereichsangabe verteilt die Spec
    //     bewusst über mehrere §§ und nennt die ID dort, wo sie hingehört.
    const gebunden = v.teile.some((t) => abschnitte(text, t).some((a) => idTrifft(a, v.id)));
    if (!gebunden) {
      probleme.push({ id: v.id, meldung: `Spec-§ "${v.datei} ${v.anker}" (Z.${v.zeile}) nennt "${v.id}" nicht — der Anker löst auf, trifft aber die falsche Spec` });
    }
  }
  return probleme;
}
