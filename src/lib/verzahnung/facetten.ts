// ─── B1: Facetten-Datenmodell der Bezüge am Artikel (W2·7-BEZUG) ────────────
//
// EINE generische Bezugs-Schicht (FAHRPLAN-VERZAHNUNG-UI §9/B1, §5): jede Kante
// Norm ↔ Dokument trägt dieselben, filterbaren Facetten — gleich, ob das Dokument
// ein Bundesgerichtsentscheid, ein kantonaler Entscheid oder (W2·6a-MAT, künftig
// W2·6b-MAT-FINMA) eine Verwaltungsverordnung ist. Kein Parallelmodell je Quelle.
//
// REINE DATENSCHICHT (§3): Typen, deklarierte Tabellen und reine Ableitungen.
// Kein JSX, kein Laden, keine Filter-Bedienung — die Filter-UI ist B4 und ein
// eigener Schritt.
//
// ── WARUM DIE FACETTE DEN STATUS TRÄGT UND NICHT DIE ANORDNUNG (§8) ──────────
// «BGE» und «übriges BGer-Urteil» sind rechtlich NICHT dasselbe: der eine ist
// amtlich publiziert und als Leitentscheid gedacht, der andere entscheidet einen
// Einzelfall. Ein kantonaler Entscheid bindet ein Bundesgericht gar nicht. Wer
// die drei in EINE Liste kippt und nur nach Datum sortiert, behauptet
// stillschweigend Gleichrang. Darum ist der Status ein PFLICHTFELD jeder Kante
// (`BezugsFacetten.status`), nicht eine Eigenschaft der Sortierung: er überlebt
// jede Umsortierung, jeden Filter und jede Projektion.
//
// ── ABGRENZUNG zu `leitcharakter` (src/lib/rechtsprechung/typen.ts) ──────────
// `leitcharakter` ist zweiwertig ('leitentscheid' | 'routine') und beantwortet
// nur «amtlich publiziert?». Ein kantonaler Entscheid ist dort ebenfalls
// 'routine' — ununterscheidbar von einem BGer-Routine-Urteil, obwohl der
// Unterschied der ganze Punkt ist. `BezugStatus` ist die vierwertige Achse, die
// diese Unterscheidung trägt; `leitcharakter` bleibt die Quelle für ihren
// BGE-Zweig (siehe `bezugStatusFuerEntscheid`).

/** Woher das Dokument stammt. Erweiterungspunkt für weitere Quellgattungen. */
export type Quelltyp = 'rechtsprechung' | 'materialien';

/** Staatsebene des DOKUMENTS (nicht der zitierten Norm). */
export type Ebene = 'bund' | 'kanton';

/**
 * Rang-/Kategorie-Achse einer Rechtsprechungs-Kante. Vier Werte, weil es vier
 * fachlich verschiedene Dinge sind:
 *  · `bge`       — amtlich publizierter Leitentscheid (BGE/ATF/DTF).
 *  · `bger`      — übriges Bundesgerichtsurteil (nicht amtlich publiziert).
 *  · `eidg`      — anderes eidgenössisches Gericht (BVGer/BStGer/BPatGer):
 *                  Bundesebene, aber NICHT das Bundesgericht.
 *  · `kantonal`  — kantonaler Entscheid.
 * Materialien-Kanten tragen `material` (eigene Gattung, kein Gericht).
 */
export type BezugStatus = 'bge' | 'bger' | 'eidg' | 'kantonal' | 'material';

/**
 * Die Facetten EINER Kante. Alle Felder sind Pflicht — eine Kante ohne Ebene
 * oder ohne Status wäre genau die stillschweigende Gleichstellung, die §8
 * verbietet. `kanton` trägt 'CH' für Bundes-Dokumente (wie im Entscheid-Manifest),
 * nicht null: so ist die Achse total und ein Filter muss keinen Sonderfall kennen.
 */
export interface BezugsFacetten {
  quelltyp: Quelltyp;
  ebene: Ebene;
  /** ISO-Kantonskürzel ('BS', 'ZH' …) oder 'CH' für Bundesebene. */
  kanton: string;
  /** Gerichts-/Herausgeber-Code des Korpus ('bge', 'bger', 'bs_appellationsgericht', 'seco'). */
  gericht: string;
  status: BezugStatus;
}

// ── DER DECKEL «8 JE STATUS» IST AUFGEHOBEN (B7, David-Auftrag 28.7.2026) ────
//
// `DECKEL_JE_STATUS` stand bis B6 hier und begrenzte die AUSGELIEFERTEN Kanten
// je Status-Klasse und Artikel auf acht. Die Konstante ist ERSATZLOS entfernt,
// nicht auf einen höheren Wert gesetzt — ein Deckel mit grösserer Zahl wäre
// derselbe Mechanismus und dieselbe stille Auswahl, nur später sichtbar.
//
// WORTLAUT DES AUFTRAGS: «or 41 dort sind nur ein teil der entscheide verlinkt
// … mach es so dass man durchscrollen kann und dann je eine linie für jede
// instanz und alle sichtbar.» Der Deckel war eine ANZEIGE-Entscheidung, die in
// der Datenschicht getroffen wurde; damit konnte die Anzeige sie nicht mehr
// revidieren. Sie liegt jetzt dort, wo sie hingehört: die Shards liefern jede
// Kante, die Linie am Artikel scrollt.
//
// `gesamtProArtikel` BLEIBT im Shard (siehe `BezugsShard` im Generator). Die
// Zahl ist jetzt gleich der gelieferten Menge, und genau das prüft das Tor
// check:bezuege als Vollständigkeits-Invariante: gelieferte Kanten je Status ==
// gesamtProArtikel. Ein Feld, das nichts mehr einschränkt, ist damit kein
// totes Feld, sondern die Gegenrechnung — und es bleibt die Bezugsgrösse für
// die UI-Zähler, sobald ein Zeit- oder Kantonsfilter die Anzeige verkürzt
// («12 von 30 im Zeitraum», §8).
//
// NICHT BETROFFEN: der Deckel `LEITFAELLE_PRO_ARTIKEL` = 8 der
// BUNDESGERICHTS-PROJEKTION (entscheide-schreiben.ts). Er gehört zum
// Bestands-Artefakt norm-index.json und bleibt unverändert — sonst hätte dieser
// Schritt ein ausgeliefertes Bestands-Artefakt verändert (§6).

/**
 * Anzeige-Reihenfolge der Status-Klassen (deklariert, §2 — nie aus Zähler oder
 * Sortierung abgeleitet). Sie ordnet nach RECHTLICHER TRAGWEITE für die
 * Auslegung einer Norm, nicht nach Menge: amtliche Leitentscheide zuerst,
 * danach die übrige bundesgerichtliche Praxis, dann die übrigen eidgenössischen
 * Gerichte, dann die kantonale Praxis, zuletzt die Materialien (Soft Law).
 */
export const STATUS_RANG: Readonly<Record<BezugStatus, number>> = {
  bge: 0, bger: 1, eidg: 2, kantonal: 3, material: 4,
};

/** Kurzlabel je Status — EINE Stelle (§5), damit B4 keine eigene Tabelle baut. */
export const STATUS_LABEL: Readonly<Record<BezugStatus, string>> = {
  bge: 'Leitentscheid (BGE)',
  bger: 'Bundesgericht, übriges Urteil',
  eidg: 'Eidg. Gericht (BVGer/BStGer/BPatGer)',
  kantonal: 'Kantonaler Entscheid',
  material: 'Verwaltungsverordnung / Materialien',
};

/**
 * Minimal-Sicht auf ein Entscheid-Dokument, die zur Facetten-Ableitung genügt.
 * Bewusst strukturell statt `EntscheidSnapshot`: derselbe Aufruf muss aus dem
 * Snapshot (Generator) UND aus dem Manifest-Eintrag (Laufzeit/Tor) funktionieren,
 * ohne dass eine der beiden Seiten die andere importiert.
 */
export interface EntscheidFacettenQuelle {
  gericht: string;
  gerichtstyp: string;
  kanton: string;
  leitcharakter: string;
}

/**
 * Status EINES Entscheids, deterministisch (§2) aus `gerichtstyp` + `gericht` +
 * `leitcharakter`.
 *
 * Reihenfolge der Prüfungen ist bedeutungstragend: `gerichtstyp` entscheidet die
 * Ebene (bundesgericht / andere eidg. Gerichte / kantonal), erst INNERHALB des
 * Bundesgerichts trennt `leitcharakter` den amtlich publizierten Leitentscheid
 * vom übrigen Urteil. Umgekehrt gelesen — erst `leitcharakter`, dann Gericht —
 * würde ein kantonaler Entscheid, den irgendwer je auf 'leitentscheid' setzt,
 * als BGE ausgegeben. Das ist keine hypothetische Sorgfalt: 'leitentscheid'
 * heisst im Korpus «amtliche Sammlung», und eine amtliche Sammlung des Bundes
 * gibt es für kantonale Entscheide nicht (§8).
 */
export function bezugStatusFuerEntscheid(q: EntscheidFacettenQuelle): BezugStatus {
  if (q.gerichtstyp === 'bundesgericht') {
    return q.leitcharakter === 'leitentscheid' ? 'bge' : 'bger';
  }
  if (q.kanton === 'CH') return 'eidg';
  return 'kantonal';
}

/** Facetten einer Rechtsprechungs-Kante. Rein (§2). */
export function facettenFuerEntscheid(q: EntscheidFacettenQuelle): BezugsFacetten {
  return {
    quelltyp: 'rechtsprechung',
    ebene: q.kanton === 'CH' ? 'bund' : 'kanton',
    kanton: q.kanton,
    gericht: q.gericht,
    status: bezugStatusFuerEntscheid(q),
  };
}

/**
 * Facetten einer MATERIALIEN-Kante — der Andockpunkt aus §9/B1 («die
 * Materialien-Kanten docken an derselben Schicht an, kein Parallelmodell»).
 *
 * Diese Funktion ist der Beweis, dass die Schicht generisch IST und nicht bloss
 * generisch heisst: eine Verwaltungsverordnung durchläuft dieselben Facetten,
 * denselben Deckel und dieselbe Ordnung wie ein Entscheid. W2·6a-MAT/W2·6b-MAT-
 * FINMA brauchen dafür keinen zweiten Index und keinen zweiten Kantentyp,
 * sondern nur `quelltyp: 'materialien'` an dieser einen Stelle.
 *
 * `herausgeber` ist der Quellen-Code des Materialien-Korpus ('seco', 'edoeb',
 * 'estv-ks' …), `kanton` 'CH' für Bundes-Verwaltungsverordnungen.
 */
export function facettenFuerMaterial(herausgeber: string, kanton = 'CH'): BezugsFacetten {
  return {
    quelltyp: 'materialien',
    ebene: kanton === 'CH' ? 'bund' : 'kanton',
    kanton,
    gericht: herausgeber,
    status: 'material',
  };
}

/**
 * Totale Ordnung der Status-Klassen für die Anzeige (§2). Getrennt von der
 * Ordnung INNERHALB einer Klasse (die trägt `vergleicheLeitfaelle` im Generator)
 * — die beiden dürfen nie vermischt werden, sonst wandert ein gut vernetzter
 * kantonaler Entscheid über einen BGE, und die Klassen-Trennung wäre wieder weg.
 */
export function vergleicheStatus(a: BezugStatus, b: BezugStatus): number {
  return STATUS_RANG[a] - STATUS_RANG[b];
}

/**
 * Anzeige-Ordnung INNERHALB einer Status-Klasse: chronologisch, neuestes zuerst
 * (B7, David-Wortlaut «chronologisch vom neusten zum ältesten»).
 *
 * ── WAS SICH GEGENÜBER B1–B6 GEÄNDERT HAT, ausdrücklich benannt (§8) ────────
 * Bis B6 war die Ordnung innerhalb der Klasse die BESTANDS-Ordnung
 * `vergleicheLeitfaelle`: gewicht ↓, Leitentscheid vor Routine, Datum ↓, key.
 * Sie ist eine RELEVANZ-Ordnung, und sie war richtig, solange nur acht Kanten je
 * Klasse ausgeliefert wurden — bei einer Auswahl entscheidet, WAS oben steht.
 * Wird ALLES ausgeliefert, entscheidet nur noch, WORAN man sich beim Scrollen
 * orientiert, und das ist die Zeitachse: eine Linie, die mit dem neuesten
 * Entscheid beginnt und rückwärts läuft, ist ohne Legende lesbar. Eine
 * Gewichts-Ordnung über 315 kantonale Kanten wäre es nicht — sie sähe aus wie
 * eine Rangliste, obwohl `gewicht` in der kantonalen und der eidgenössischen
 * Klasse gar nicht messbar ist (null, siehe `BezugsKante.gewicht`).
 *
 * Diese Funktion ordnet AUSSCHLIESSLICH nach Datum; den Gleichstand löst der
 * Aufrufer mit der bestehenden deterministischen Ordnung auf (§2: die Ordnung
 * bleibt total, kein Rückfall auf die Eingabereihenfolge). Sie ersetzt
 * `vergleicheLeitfaelle` NICHT — die Bundesgerichts-Projektion (norm-index)
 * ordnet unverändert nach Relevanz, denn dort wird weiterhin auf acht gekappt.
 *
 * Leere/fehlende Daten sortieren ans ENDE: ein Entscheid ohne Datum ist nicht
 * «von 0001», er ist unbekannt — und Unbekanntes darf die Spitze der Zeitachse
 * nicht besetzen (§8).
 */
export function vergleicheDatumAbsteigend(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? 1 : -1;
}

/**
 * Zählt Kanten je Facetten-Achse — die Grundlage der ehrlichen Trefferzahlen
 * (§8: «Trefferzahlen je Facette mit ehrlicher Grundgesamtheit»). Rein (§2);
 * die Schlüssel-Reihenfolge ist die Eingabereihenfolge, die Aufrufer sortieren.
 */
export function zaehleFacetten(facetten: readonly BezugsFacetten[]): {
  quelltyp: Record<string, number>;
  ebene: Record<string, number>;
  kanton: Record<string, number>;
  status: Record<string, number>;
  gesamt: number;
} {
  const q: Record<string, number> = {};
  const e: Record<string, number> = {};
  const k: Record<string, number> = {};
  const s: Record<string, number> = {};
  for (const f of facetten) {
    q[f.quelltyp] = (q[f.quelltyp] ?? 0) + 1;
    e[f.ebene] = (e[f.ebene] ?? 0) + 1;
    k[f.kanton] = (k[f.kanton] ?? 0) + 1;
    s[f.status] = (s[f.status] ?? 0) + 1;
  }
  return { quelltyp: q, ebene: e, kanton: k, status: s, gesamt: facetten.length };
}
