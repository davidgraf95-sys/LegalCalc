import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Sektion, Fussnote } from '../../lib/normtext/browse';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import { ERLASS_REGISTER, type ErlassTyp, type Grundart } from '../../lib/normtext/register';
import { GRUNDART_SEED } from '../../lib/normtext/grundart.generated';
import { sachgruppe, topTitel, subTitel, type KantonSystematik } from '../../lib/normtext/systematik';
import { norm } from '../../lib/suche/normQuery';
import { datumCh } from '../../lib/normtext/erlassKopfText';

// M11 (§5 Verzahnung): Reverse-Resolver SR-Nummer → interner Erlass, ABGELEITET
// aus dem Register (keine Handtabelle, §3/§5 eine Quelle). Nur Bund-Erlasse, die
// wir tatsächlich im Volltext/PDF-embed haben — sonst bleibt der Fedlex-Link der
// ehrliche Fallback (§8). Einmal modulweit aufgebaut (statisch).
const SR_INTERN: ReadonlyMap<string, { key: string; ebene: 'bund' | 'kanton' }> = new Map(
  ERLASS_REGISTER
    .filter((e) => e.ebene === 'bund' && e.sr && (e.status === 'snapshot' || e.status === 'pdf-embed'))
    .map((e) => [e.sr as string, { key: e.key, ebene: e.ebene }]),
);

/**
 * W2·19-GLIEDERUNG/S7: SR-Nummer → intern gehaltener Erlass, sonst `undefined`.
 * Derselbe `SR_INTERN`-Index, den der Fussnoten-Renderer weiter unten schon nutzt
 * (§5, EINE Auflösung) — exportiert, damit der Artikel-Kontext einen
 * Fussnoten-Verweis intern verlinken kann, WO wir den Erlass wirklich halten,
 * und sonst ehrlich beim amtlichen Link bleibt (§8, kein toter interner Pfad).
 */
export function internerErlassFuerSr(sr: string): { key: string; ebene: 'bund' | 'kanton' } | undefined {
  return SR_INTERN.get(sr);
}

/**
 * §5 (W2·5m-LESER-V3/S3): die EINE ISO→CH-Datumsform lebt in
 * `lib/normtext/erlassKopfText` — der prerenderte SEO-Kopf (`lib/seo-detail.ts`)
 * braucht dieselbe Form, und die Bibliotheks-Schicht darf nicht auf `pages/`
 * zeigen (§3). Der eingeführte Name bleibt hier als Fassade stehen, damit die
 * bestehenden Aufrufstellen nicht wandern müssen (§6.1: kleinster Eingriff).
 */
export const formatiereDatum = datumCh;

/**
 * N13 (BS-Audit 23.6.2026) — das VERIFIZIERTE amtliche Sachgebiet eines
 * kantonalen Erlasses, oder `null`.
 *
 * §8: Für nicht zugeordnete Systematik-Nummern liefert die Kanton-Systematik
 * neutrale PLATZHALTER («Bereich SAR», «Ohne Systematik-Nummer»). Das sind keine
 * Sachgebiete, sondern die Auskunft «wir wissen es nicht» — sie werden darum
 * weggelassen statt angezeigt.
 *
 * W2·19-GLIEDERUNG/S7 (Bug-Check B9): diese Filterregel stand nur inline in der
 * Reader-Overline (`inhalt-volltext.tsx`). Die Erlass-Übersicht baute ihren
 * Brotkrümel daneben NEU — und zeigte den Platzhalter, den die Overline
 * derselben Seite korrekt unterdrückte (~80 Kantonserlasse, 6.5 %). Jetzt EINE
 * Regel für beide Stellen (§5); wer sie ändert, ändert sie überall.
 *
 * `sub` ist der Untergruppen-Titel und darf leer sein (nicht jede Nummer hat
 * eine); der Aufrufer filtert ihn selbst weg.
 */
export function verifiziertesSachgebiet(
  erlass: Pick<BrowseErlass, 'kanton' | 'sr'>,
  kantonSys: Record<string, KantonSystematik>,
): { top: string; sub: string } | null {
  const sys = erlass.kanton ? kantonSys[erlass.kanton] : undefined;
  if (!sys) return null;
  const { top, sub } = sachgruppe(sys, erlass.sr);
  if (top === '~') return null;
  const topName = topTitel(sys, top);
  if (/^Bereich /.test(topName)) return null;
  return { top: topName, sub: subTitel(sys, top, sub) };
}

// «Zitat kopieren» (W2·5d G2b, FAHRPLAN §3.3/K12b): EIN deterministisches Zitat-
// Format aus der vorliegenden Provenienz (§7 a–d): Fundstelle (Art./§ + Kürzel) +
// amtliche SR-Nummer (wo vorhanden) + Stand. Rein deterministisch (§2), keine
// Heuristik — `artikelLabel` trägt bereits «Art. 7» bzw. «§ 7» (labelMitBereich),
// die Abs./lit. bleibt bewusst weg (am Kopf/Artikel nicht eindeutig bestimmbar,
// §8 «nichts Erfundenes»). Beispiel: «Art. 7 OR, SR 220 (Stand 01.01.2025)».
export function baueZitat(
  erlass: Pick<BrowseErlass, 'kuerzel' | 'sr' | 'stand'>,
  artikelLabel: string,
): string {
  const teile = [`${artikelLabel} ${erlass.kuerzel}`.trim()];
  if (erlass.sr) teile.push(`SR ${erlass.sr}`);
  let s = teile.join(', ');
  if (erlass.stand) s += ` (Stand ${formatiereDatum(erlass.stand)})`;
  return s;
}

// Laufzeit-Anbindung der Grundart an den Reader (W2·5d G3a, §5): die Laufzeit-
// `BrowseErlass` trägt BEWUSST keine Grundart (byte-gleiche Snapshot-Projektion,
// register.json). SSoT ist die Klassifikation GRUNDART_SEED (grundart.generated.ts):
// `mitGrundart` merged sie in die BUND-Register-Einträge, kantonale Erlasse stehen
// aber NICHT im ERLASS_REGISTER (ihre Identität leitet der Generator aus dem
// Snapshot ab) — darum schlägt der Reader zur Laufzeit DIREKT im Seed nach, die
// EINE Quelle für Bund UND Kanton (keine zweite Wahrheit, keine Daten-
// Regeneration). Reiner Read-Accessor in der Darstellungsschicht (§3): er wählt
// nur, welche Grundart die Designvorschrift (§2.2) steuert — kein Rechtsinhalt.
export function grundartMeta(key: string): {
  grundart?: Grundart;
  erlassTyp?: ErlassTyp;
  bestimmungsEtikett?: 'art' | 'paragraf';
  bestimmungsEtikettStatus?: 'entwurf';
} {
  const s = GRUNDART_SEED[key];
  if (!s) return {};
  return {
    grundart: s.grundart,
    erlassTyp: s.erlassTyp,
    bestimmungsEtikett: s.bestimmungsEtikett,
    bestimmungsEtikettStatus: s.bestimmungsEtikettStatus,
  };
}

// Kopf-Overline JE GRUNDART (W2·5d G3a, FAHRPLAN §2.2 + §5.1): das Kopf-Label
// leitet sich aus `erlassTyp` (Register, SSoT) ab statt aus der früheren
// «ebene»-Heuristik, die JEDE Bund-Norm «Bundesgesetz» nannte — auch die 103
// Verordnungen (VMWG/GBV/VZV …). Reine Darstellung (§3), deterministisch (§2).
//   • International → «Staatsvertrag» (⑤; erlassTyp Arbiter, Gebiet als Fallback).
//   • Bund → Bundesverfassung / Bundesgesetz / Verordnung / Staatsvertrag
//     (undefined/sonstiges → «Bundesgesetz» = heutiger Default, byte-verträglich),
//     das amtliche Sachgebiet bleibt als « · Gebiet»-Zusatz (N13).
//   • Kanton → «Kanton XX · Gesetz|Verordnung» (⑥); wo erlassTyp neutral ist
//     (sonstiges), das amtliche Sachgebiet als Zusatz behalten (N13).
export function kopfOverline(
  erlass: Pick<BrowseErlass, 'ebene' | 'kanton' | 'rechtsgebiet'>,
  erlassTyp: ErlassTyp | undefined,
  overlineGebiet: string | null,
): string {
  if (erlass.rechtsgebiet === 'international') {
    if (erlassTyp === 'staatsvertrag') return 'Staatsvertrag';
    return overlineGebiet ?? 'Staatsvertrag';
  }
  if (erlass.ebene === 'bund') {
    const typ =
      erlassTyp === 'verfassung' ? 'Bundesverfassung'
      : erlassTyp === 'verordnung' ? 'Verordnung'
      : erlassTyp === 'staatsvertrag' ? 'Staatsvertrag'
      : 'Bundesgesetz';
    return overlineGebiet ? `${typ} · ${overlineGebiet}` : typ;
  }
  const basis = `Kanton ${erlass.kanton}`;
  const typ =
    erlassTyp === 'gesetz' ? 'Gesetz'
    : erlassTyp === 'verordnung' ? 'Verordnung'
    : erlassTyp === 'verfassung' ? 'Verfassung'
    : null;
  const zusatz = typ ?? overlineGebiet;
  return zusatz ? `${basis} · ${zusatz}` : basis;
}

// W2·19-GLIEDERUNG/S8: `passtAufSuche` ist hier ENTFALLEN. Sie war die
// Filterregel der alten, lesespalten-filternden In-Gesetz-Suche und las
// ausschliesslich `artikelLabel` und `bloecke[].text`/`items[].text`. Seit S8
// sucht `leserSuche.ts` über alle sechs Feldklassen und liefert zusätzlich
// Reihenfolge, Herkunft und Ausschnitt; die alte Regel hätte daneben eine
// zweite, ärmere Treffer-Wahrheit behauptet (§5). Ersatzlos entfernt statt
// stehen gelassen — toter Code, der eine Wirkung suggeriert, ist die teuerste
// Sorte (§Aufräumen).

// «Erster Titel: Die Entstehung …» → {pre:'Erster Titel', rest:'Die Entstehung …'}
export function romanFrei(label: string): { pre: string; rest: string } {
  const m = label.match(/^([^:]+):\s*(.+)$/);
  return m ? { pre: m[1].trim(), rest: m[2].trim() } : { pre: '', rest: label };
}

// A30 (David 16.7.2026): Marginalien-/Randtitel-Enumeratoren tragen lateinische
// Ordnungs-Suffixe («IIIbis», «Ia»). Fedlex setzt das Ordnungs-WORT (bis/ter/…)
// HOCHGESTELLT (<sup>) und einen einzelnen Buchstaben-Suffix (Ia) KURSIV (<i>) —
// empirisch am gepinnten Filestore-HTML verifiziert (ZGB: «III<sup>bis</sup>.»,
// «I<i>a</i>.», §7). Reine Darstellung (§3): der Label-STRING bleibt unverändert,
// nur die Auszeichnung des schon im String liegenden Suffixes wird rekonstruiert.
// Greift NUR, wenn der Enumerator eine römische Zahl oder arabische Ziffer ist
// (Buchstaben-Enumeratoren «A.»/«b.» tragen keinen Suffix) UND der Suffix direkt an
// einem Wort-/Satzende klebt — sonst No-op (Sachtitel wie «Mitgliederverzeichnis»
// bleiben unberührt; das Ordnungswort nach reinem Römisch/Ziffer-Präfix ist
// praktisch nur der Enumerator).
const MARG_ORD = /^((?:[IVXLCDM]+|\d+))(bis|ter|quater|quinquies|sexies|septies|octies|novies|decies)(?=[.\s]|$)/;
const MARG_BUCHST = /^((?:[IVXLCDM]+|\d+))([a-z])(?=[.\s]|$)/;
export function margLabel(label: string): ReactNode {
  const ord = label.match(MARG_ORD);
  // LM-107: der nackte <sup> übernahm bislang den Browser-Default
  // `font-size: smaller` (browserabhängig, ~0.75em der jeweils UMGEBENDEN
  // Schrift) — dadurch erscheint dasselbe «bis»/«ter» im Gliederungsbaum
  // (text-xs-Kontext → 9px) und in der Artikel-Überschrift (text-base-Kontext
  // → 12px) in zwei Grössen derselben Ansicht. Fix: derselbe deterministische
  // Multiplikator wie bei den bestehenden hochgestellten Fussnoten-Markern
  // (ArtikelBody.tsx FnRef-Button, `text-[0.62em]`) statt des UA-Defaults —
  // keine neue Grössen-Systematik, nur der bereits etablierte Wert.
  if (ord) return <Fragment>{ord[1]}<sup className="text-[0.62em]">{ord[2]}</sup>{label.slice(ord[0].length)}</Fragment>;
  const bu = label.match(MARG_BUCHST);
  if (bu) return <Fragment>{bu[1]}<em>{bu[2]}</em>{label.slice(bu[0].length)}</Fragment>;
  return label;
}

// Pfad (Sektions-ids Wurzel→Treffer) zur ersten Sektion, die das Prädikat erfüllt.
export function pfadZu(sektionen: Sektion[], treffer: (s: Sektion) => boolean): string[] | null {
  for (const s of sektionen) {
    if (treffer(s)) return [s.id];
    const sub = pfadZu(s.kinder, treffer);
    if (sub) return [s.id, ...sub];
  }
  return null;
}

// G15: Hervorhebungen (fett/kursiv) im Fussnotentext als Rich-Text rendern. Der
// Extraktor (fussnoten-extrahiere.clean) behält bare <b>/<i>; hier werden sie in
// <strong>/<em> übersetzt (rekursiv für die seltene Verschachtelung <i>…<b>…</b>…</i>).
//
// W2·19-GLIEDERUNG/S7 (Bug-Check B2): EXPORTIERT, weil der Artikel-Kontext
// dieselben amtlichen Labels zeigt («SR <b>281.1</b>» — 100 % der rs-Fussnoten
// im Bund-Korpus tragen die Tags). Eine zweite Parse-Regel daneben wäre eine
// §5-Doppelwahrheit; die eine hier ist bereits am Fussnoten-Text erprobt.
// (Natürlicher Langzeit-Ort wäre ein geteiltes Darstellungs-Modul — der Import
// aus der Komponenten-Schicht ist eine Schicht-Inversion für EINE reine
// Funktion, erzeugt aber keinen Zyklus; siehe check:zyklen.)
export function richText(s: string, keyBase: string): ReactNode {
  if (!s.includes('<')) return s;
  const out: ReactNode[] = [];
  const re = /<(b|i)>([\s\S]*?)<\/\1>/gi;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const kinder = richText(m[2], `${keyBase}-${k}`);
    out.push(m[1].toLowerCase() === 'b'
      ? <strong key={`${keyBase}-b${k}`}>{kinder}</strong>
      : <em key={`${keyBase}-i${k}`}>{kinder}</em>);
    last = re.lastIndex;
    k++;
  }
  if (last < s.length) out.push(s.slice(last));
  return out.length === 1 ? out[0] : out;
}

/**
 * Derselbe Wortlaut OHNE Auszeichnung — für Attribute (`title`), die kein
 * Markup rendern können und es sonst als rohe Zeichen zeigen würden (§8: was
 * dort steht, muss lesbar sein, nicht «SR &lt;b&gt;281.1&lt;/b&gt;»).
 * Deckt genau die Tags, die der Extraktor durchlässt (b/i, G15).
 */
export function ohneMarkup(s: string): string {
  return s.replace(/<\/?[bi]>/gi, '');
}

// Fussnoten-Text mit klickbaren AS/BBl-Verweisen (die Label-Vorkommen werden
// durch Anker ersetzt) und erhaltenen Hervorhebungen (G15). Reine Darstellung.
function escRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ── W2·10-UI-NAV/N0b: Fuzzy-Erlass-Vorschläge für die Fehlseite ──────────────
// Deterministisch (§2 — kein LLM): normalisiert Anfrage + Kandidaten mit norm()
// aus normQuery (dieselbe Normalform wie die Norm-Sprung-Auflösung, KEIN neuer
// Index/K10) und rankt per Levenshtein-Distanz gegen Kürzel + Routen-Key des
// Manifests. «ORR» → «OR» (Distanz 1); Titel-Teilstring als schwächerer Treffer
// («obligationenrecht» → OR). Nur nahe Kandidaten (kurze Keys: Distanz ≤ 1,
// längere ≤ 2, oder Präfix/Teilstring). Rein ableitend (§3), keine Rechtslogik.
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let vor = Array.from({ length: n + 1 }, (_, i) => i);
  let akt = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    akt[0] = i;
    for (let j = 1; j <= n; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
      akt[j] = Math.min(akt[j - 1] + 1, vor[j] + 1, vor[j - 1] + kosten);
    }
    [vor, akt] = [akt, vor];
  }
  return vor[n];
}

export function erlassVorschlaege<T extends Pick<BrowseErlass, 'key' | 'kuerzel' | 'titel'>>(
  erlasse: readonly T[],
  roh: string,
  max = 6,
): T[] {
  const nq = norm(roh);
  if (!nq) return [];
  const grenze = nq.length <= 4 ? 1 : 2;
  // Rang für Titel-Teilstring-Treffer: bewusst nicht-ganzzahlig, damit er NIE mit
  // einer echten (ganzzahligen) Levenshtein-Distanz kollidiert und die Titel-Treffer
  // stets NACH den nahen Kürzel-/Key-Treffern (≤ grenze) einsortiert werden.
  const TITEL_RANG = 2.5;
  const bewertet: { e: T; rang: number }[] = [];
  for (const e of erlasse) {
    const kandidaten = [...new Set([norm(e.kuerzel), norm(e.key)])].filter(Boolean);
    let dist = Infinity;
    for (const k of kandidaten) {
      if (k === nq) { dist = 0; break; }
      if (k.startsWith(nq) || nq.startsWith(k)) dist = Math.min(dist, 0.5);
      else dist = Math.min(dist, levenshtein(nq, k));
    }
    if (dist <= grenze) bewertet.push({ e, rang: dist });
    else if (nq.length >= 4 && norm(e.titel).includes(nq)) bewertet.push({ e, rang: TITEL_RANG });
  }
  bewertet.sort((a, b) =>
    a.rang - b.rang
    || a.e.kuerzel.length - b.e.kuerzel.length
    || a.e.key.localeCompare(b.e.key));
  return bewertet.slice(0, max).map((x) => x.e);
}
// DESIGN-D0: die drei Fussnoten-Links unten trugen `text-brass-700/90`. Die
// Deckkraft war seit je ein No-op (Fund B4) — ausgeliefert wurde immer das volle
// brass-700 (5.41:1, AA). Mit dem Wurzel-Fix hätte sie erstmals gegriffen: axe
// mass #8e713a auf Papier = 4.4:1 an 16 Knoten, unter AA (`a11y.e2e.ts`
// «Gesetze — Reader Bund»). Suffix gestrichen, damit bleibt der ausgelieferte
// Zustand; `hover:text-brass-700` war dadurch wirkungslos und fällt mit
// (F7 «keine Leichen»).
export function fnTextMitLinks(fn: Fussnote): ReactNode {
  if (!fn.links.length) return richText(fn.text, 'fn');
  const map = new Map(fn.links.map((l) => [l.label, l]));
  const re = new RegExp(`(${[...map.keys()].sort((a, b) => b.length - a.length).map(escRe).join('|')})`, 'g');
  return fn.text.split(re).map((t, i) => {
    const link = map.get(t);
    if (link === undefined) return <Fragment key={i}>{richText(t, `fn${i}`)}</Fragment>;
    const url = link.url;
    // A42 (Kanton): der Generator hat den zitierten Erlass bereits als internen
    // Reader-Verweis aufgelöst (wo gehalten) — direkt intern verlinken, sonst
    // amtlicher Fallback (§8). Bund-Fussnoten tragen kein `intern` → sie laufen
    // durch die SR-Label-Auflösung unten (unverändert, golden-stabil).
    if (link.intern) {
      return (
        <Link key={i} to={`/gesetze/${link.intern.ebene}/${encodeURIComponent(link.intern.key)}`}
          title="Intern öffnen"
          className="text-brass-700 hover:underline decoration-dotted underline-offset-2">{richText(t, `fn${i}`)}</Link>
      );
    }
    const kinder = richText(t, `fn${i}`);
    // M11 (§5): SR-Verweis «SR 220» auf einen Erlass, den wir im Volltext haben,
    // verlinkt INTERN auf den LexMetrik-Leser statt immer nach Fedlex — man bleibt
    // im Werkzeug. Nur exakte Treffer (Bund, snapshot/pdf-embed). Sonst amtlicher
    // ELI-Link als ehrlicher Fallback (§8).
    // G-REF: die SR-Nummer kommt jetzt maschinen-genau aus `link.rs` (Fedlex
    // `data-rs`), sonst — für ungetaggte Alt-Links — aus dem TAG-FREIEN Label
    // («SR <b>220</b>»). `link.url` ist bei SR-Verweisen der amtliche ELI-Deep-Link
    // (data-rs-uri), nicht mehr die Vokabular-Taxonomie-Seite.
    const srNr = link.rs ?? t.replace(/<[^>]+>/g, '').match(/^SR\s+([\d.]+)$/)?.[1];
    const intern = srNr ? SR_INTERN.get(srNr) : undefined;
    if (intern) {
      // Stand-Transparenz (§5/§8, David-Entscheid 28.6.): der intern gezeigte
      // Stand kann vom zitierten abweichen (bis Versionierung) → den zitierten
      // Fedlex-Konsolidierungsstand im title offenlegen, nicht stillschweigend
      // gleichsetzen. Konsolidierung steht als YYYYMMDD im Fedlex-Link.
      const standM = url.match(/\/(\d{4})(\d{2})(\d{2})(?:\/|$)/);
      const titel = standM
        ? `Intern öffnen · zitierter Fedlex-Stand ${standM[3]}.${standM[2]}.${standM[1]}`
        : 'Intern öffnen';
      return (
        <Link key={i} to={`/gesetze/${intern.ebene}/${encodeURIComponent(intern.key)}`}
          title={titel}
          className="text-brass-700 hover:underline decoration-dotted underline-offset-2">{kinder}</Link>
      );
    }
    // LM-154 (W2·17-UI-BEFUNDE-B4): reine Fedlex-Verweise (BBl/AS ohne SR-Treffer)
    // trugen nur `hover:underline` (ohne Hover also unsichtbar als Link) und keinen
    // Hinweis auf den externen Tab-Wechsel — anders als die Normverweise im
    // Fliesstext (NormText.tsx `INLINE_CLASS`: persistente gepunktete Unterlinie).
    // Dieselbe Auszeichnung hier: `underline decoration-dotted` bleibt SICHTBAR statt
    // nur bei Hover; `title` nennt amtliche Quelle + Tab-Wechsel (§8, wie bei den
    // übrigen externen Aktionen dieser Datei — AmtlichesPdf/«In neuem Reiter» tragen
    // ebenfalls ein `title` statt eines Icons je Einzel-Fundstelle, da ein Apparat
    // mehrere Zitate in einer dichten Zeile aneinanderreiht).
    return (
      <a key={i} href={url} target="_blank" rel="noopener noreferrer" title="Amtliche Fedlex-Quelle – öffnet in neuem Tab"
        className="text-brass-700 underline decoration-dotted underline-offset-2">{kinder}</a>
    );
  });
}

// Randtitel-Stufe einheitlich formatieren (Auftrag 6a, David 26.6.2026 «un-
// einheitliche Bold-Formatierung»). Zwei stabile Rollen statt der früheren
// Positions-Logik `i === marg.length-1`:
//   • Das BLATT (unterste gezeigte Stufe = die eigentliche Sachüberschrift des
//     Artikels) ist IMMER prominent — auch wenn es allein steht. Das ist der
//     Normalfall: ~83 % der Randtitel sind eine einzige Sachüberschrift (oft
//     ohne Aufzähler, z. B. «Gegenstand und Geltungsbereich»); die dürfen nicht
//     zu einem blassen Abschnittslabel verkümmern.
//   • Die darüberliegenden VORFAHREN sind ruhiger Kontext, einheitlich je
//     ABSOLUTER Gliederungstiefe (0 = Abschnitt «A.» uppercase, tiefer schlicht)
//     — so flippt kein Vorfahre mehr zwischen den Artikeln (Befund: «II. Hand-
//     lungsfähigkeit» mal fett, mal klein). Reine Darstellung (§3), zur Laufzeit
//     abgeleitet aus Delta-Offset + Position (kein Massen-Regen, F3).
export function margStufeStil(level: number, istBlatt: boolean): string {
  // Hängender-Einzug-Schutz (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Randtitel-
  // Hierarchie): mehrzeilige Randtitel («1. Im Allgemeinen») brechen sonst als
  // «1. Im / Allgemeinen» — die Fortsetzungszeile rückt via text-indent:-1em +
  // pl-[1em] auf die Titel-Startspalte ein (Fedlex-AVOID). Reine Darstellung (§3).
  const hang = '[text-indent:-1em] pl-[1em]';
  if (istBlatt) return `${hang} text-base font-semibold text-ink-800`;
  if (level <= 0) return `${hang} text-body-s font-medium uppercase tracking-wide text-ink-500`;
  return `${hang} text-body-s text-ink-600`;
}
