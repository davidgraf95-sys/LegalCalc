import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';

// ─── Vorsorgeauftrag (Art. 360–369 ZGB) – dritte Vorlage ────────────────────
//
// Rechtsstand gemäss Normtext-Snapshot, Stand 1.7.2026 (public/normtext/bund/
// ZGB.json; OR-Snapshot Stand 1.1.2026). Zentrale Determinismus-Weiche: formMode —
// EIGENHÄNDIG (von Anfang bis Ende von Hand, datiert, unterzeichnet,
// Art. 361 Abs. 2 ZGB → Ausgabe nur als Abschreib-Mustertext) ODER
// ÖFFENTLICH BEURKUNDET (Entwurf für die Urkundsperson; Verfahren kantonal,
// BGE 151 III 81). Errichtung verlangt HANDLUNGSFÄHIGKEIT (volljährig +
// urteilsfähig, Art. 13 ZGB; keine umfassende Beistandschaft, Art. 398 Abs. 3 ZGB).
// Wirksam wird der Auftrag erst durch KESB-Validierung (Art. 363 ZGB).

export type VaFormMode = 'eigenhaendig' | 'oeffentlich_beurkundet';
export type VaBereich = 'personensorge' | 'vermoegenssorge' | 'rechtsverkehr';

export const VA_BEREICHE: { id: VaBereich; label: string }[] = [
  { id: 'personensorge', label: 'Personensorge' },
  { id: 'vermoegenssorge', label: 'Vermögenssorge' },
  { id: 'rechtsverkehr', label: 'Vertretung im Rechtsverkehr' },
];

// Aufgaben-Module je Bereich (Checkbox-Auswahl, Klauseltexte fest)
export const VA_MODULE: Record<VaBereich, { id: string; label: string }[]> = {
  personensorge: [
    { id: 'wohnsituation', label: 'Entscheid über Wohnsituation und Aufenthalt (inkl. Heim-/Pflegeeintritt)' },
    { id: 'pflege', label: 'Organisation von Pflege und alltäglicher Betreuung' },
    { id: 'medizin', label: 'Vertretung bei medizinischen Massnahmen (Art. 378 Abs. 1 Ziff. 1 i.V.m. Art. 377 ZGB); eine Patientenverfügung geht vor' },
    { id: 'post', label: 'Entgegennahme und Erledigung der Post' },
    { id: 'teilhabe', label: 'Sicherstellung der Teilhabe am gesellschaftlichen Leben' },
  ],
  vermoegenssorge: [
    { id: 'verwaltung', label: 'Verwaltung von Einkommen und Vermögen' },
    { id: 'zahlungsverkehr', label: 'Zahlungsverkehr und Begleichung von Rechnungen' },
    { id: 'bank', label: 'Bankgeschäfte (Konten und Depots, Weiterführung der Anlagestrategie)' },
    { id: 'liegenschaften', label: 'Verwaltung von Liegenschaften' },
    { id: 'steuern', label: 'Erstellen und Einreichen der Steuererklärung' },
  ],
  rechtsverkehr: [
    { id: 'behoerden', label: 'Vertretung gegenüber Behörden, Gerichten, Banken und Versicherungen' },
    { id: 'vertraege', label: 'Abschluss, Änderung und Kündigung von Verträgen' },
    { id: 'heimvertrag', label: 'Abschluss eines Vertrags mit einer Wohn- oder Pflegeeinrichtung' },
    { id: 'schweigepflicht', label: 'Entbindung von Berufs- und Amtsgeheimnissen gegenüber der beauftragten Person' },
  ],
};

export type VaBeauftragte = {
  name: string;
  typ: 'natuerlich' | 'juristisch';
  angaben: string;            // Geburtsdatum/Adresse bzw. Sitz
  bereiche: VaBereich[];
};

/** Ersatzperson (Ersatzverfügung, Art. 360 Abs. 3 ZGB) – strukturell wie die
 *  Hauptbeauftragten, damit dieselben Schranken greifen (Personensorge nur
 *  natürliche Person). `bereiche` ist OPTIONAL: leer oder fehlend bedeutet
 *  Ersatz für ALLE übertragenen Aufgabenbereiche (bisherige Semantik – der
 *  Klauseltext bleibt dann wortgleich wie vor W2·8). */
export type VaErsatzperson = {
  name: string;
  typ: 'natuerlich' | 'juristisch';
  angaben: string;            // Geburtsdatum/Adresse bzw. Sitz
  bereiche?: VaBereich[];
};

/** Zusammenwirken mehrerer beauftragter Personen. Das Gesetz regelt es nicht
 *  ausdrücklich (Art. 360 ZGB nennt nur die Übertragung); die ausdrückliche
 *  Anordnung im Auftrag schafft Klarheit gegenüber KESB, Banken und Behörden.
 *  Muster: VmVertretung in vollmacht.ts (dort Art. 33 Abs. 2 OR). */
export type VaVertretung = 'einzeln' | 'gemeinsam';

/** Alte gespeicherte Stände (localStorage vor W2·8) kennen `typ` bei
 *  Ersatzpersonen noch nicht. Fehlendes Feld wird wie 'natuerlich' gelesen –
 *  nie wie 'juristisch': sonst entstünde aus einem Altstand ein Blocker, den
 *  die Nutzerin nie ausgelöst hat. */
function ersatzTyp(e: VaErsatzperson): 'natuerlich' | 'juristisch' {
  return e.typ === 'juristisch' ? 'juristisch' : 'natuerlich';
}

/** W2·8/V9.5 (Gegenprüfung Runde 3, Befund N1): Normalisierung des Datums —
 *  EINE Stelle für alle drei Auswertungen (Zweigwahl der Schlusszeile,
 *  Formatierung, Datums-Warnung in `pruefeVaGates`). Zuvor prüften alle drei
 *  den Rohwert auf Wahrheit, während der Ort schon getrimmt wurde: ein Datum
 *  aus reinem Whitespace («  ») galt damit als vorhanden, die Schlusszeile
 *  zeigte statt «Datum: ________» eine LEERE Zeile unmittelbar über der
 *  Unterschriftslinie, und die Gültigkeits-Warnung des Art. 361 Abs. 2 ZGB
 *  blieb aus — genau der Fehler, den B8 für den fehlenden Wert behoben hatte.
 *  Über die UI ist der Wert nicht erzeugbar (date-Feld); massgeblich ist
 *  gleichwohl die Engine, nicht die Darstellungsschicht (§3), und ein
 *  gespeicherter Altstand oder Import kann ihn tragen.
 *  Das Feld ist typseitig `string`; `?? ''` fängt Alt-Stände ohne Feld ab. */
function vaDatumRoh(a: VaAntworten): string {
  return (a.datum ?? '').trim();
}

/** W2·8/V9.5 (Befund N3): Der Ort wird für den Anschluss «{Ort}, den {Datum}»
 *  von abschliessender Interpunktion befreit — «Basel,» ergab sonst
 *  «Basel,, den 15.06.2026», weil das Komma im Anschluss schon steckt.
 *  Rein typografische Normalisierung am RAND: Binnen-Kommas bleiben
 *  unangetastet («Riehen, BS» bleibt vollständig), der Ortsinhalt wird nicht
 *  beschnitten. Besteht der Wert nur aus Interpunktion, ist er kein Ort und
 *  fällt in den B7-Zweig (nur Datum, kein hängendes «den»). */
function vaOrtNormalisiert(a: VaAntworten): string {
  return (a.ort ?? '').trim().replace(/[\s,]+$/u, '');
}

export type VaAntworten = {
  // Step 0 – Eligibility (Art. 13/14/16/398 ZGB)
  volljaehrig: boolean;
  urteilsfaehigBestaetigt: boolean;
  keineUmfassendeBeistandschaft: boolean;
  // Form-Gate (Art. 361)
  formMode: VaFormMode;
  kanton?: string;            // für Beurkundungs-Hinweise (nur informativ)
  // Auftraggeberin/Auftraggeber
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  heimatort: string;
  adresse: string;
  // Beauftragte + Ersatz
  beauftragte: VaBeauftragte[];
  ersatzpersonen: VaErsatzperson[];  // Reihenfolge = Rang
  vertretung: VaVertretung;          // nur relevant bei mehreren Beauftragten
  // Module je Bereich (gewählte Modul-IDs)
  module: Record<VaBereich, string[]>;
  // Sondervollmachten / Weisungen / Entschädigung
  schenkungenErlaubt: boolean;
  besondereGeschaefte: boolean;  // Vergleich, Schiedsabrede, Wechsel (Art. 396 Abs. 3 OR)
  weisungen?: string;
  entschaedigung: 'keine_angabe' | 'unentgeltlich' | 'pauschale' | 'nach_aufwand';
  entschaedigungBetrag?: number; // CHF/Jahr (pauschale) bzw. CHF/Stunde (nach_aufwand)
  // Abschluss
  pvVorhanden: boolean;
  pvHinterlegung?: string;
  ersetztFruehere: boolean;
  /** Datum des FRÜHEREN Vorsorgeauftrags (ISO), nur bei der Ergänzungs-Variante
   *  (`ersetztFruehere: false`). Bewusst OHNE Default: fehlt das Datum, zeigt die
   *  Ergänzungs-Klausel den Ausfüll-Strich «________» statt eines falschen Datums
   *  (Platzhalter-Konvention der Engine; der Feldname trägt bewusst kein
   *  «Satz»/«Zeile»-Suffix, sonst verschwände der Strich ersatzlos). */
  fruehererVaDatum?: string;
  ort?: string;
  datum: string;              // nur eigenhändig zwingend (wird mit abgeschrieben)
};

export const VA_DEFAULTS: VaAntworten = {
  volljaehrig: false, urteilsfaehigBestaetigt: false, keineUmfassendeBeistandschaft: false,
  formMode: 'eigenhaendig',
  vorname: '', nachname: '', geburtsdatum: '', heimatort: '', adresse: '',
  beauftragte: [],
  ersatzpersonen: [],
  vertretung: 'einzeln',
  module: { personensorge: [], vermoegenssorge: [], rechtsverkehr: [] },
  schenkungenErlaubt: false,
  besondereGeschaefte: false,
  entschaedigung: 'keine_angabe',
  pvVorhanden: false,
  ersetztFruehere: true,
  datum: '',
};

// W2·8/B5 (Befund F6): Die frühere Funktion `beurkundungsHinweis(kanton)`
// pflegte eine ZWEITE WAHRHEIT über Notariatssystem und Gebühren-Richtwerte
// (§5-Verstoss) — mit drei belegten Abweichungen von den eigenen Stammdaten:
// TG «gemischt» gegen `NOTARIATE.TG.system === 'amtsnotariat'`, BE «ab ca.
// CHF 500» gegen das Tarif-Minimum von CHF 300 (Art. 8a Abs. 1 GebVN,
// BSG 169.81) und SG «ca. CHF 400» ohne Beleg gegen den Rahmen 110–1100
// (GebT sGS 821.5 Nr. 60.05.01). Sie ist ersatzlos gestrichen; die UI speist
// den Hinweis aus den beiden bestehenden Einzelquellen: `NOTARIATE`
// (src/lib/notariate.ts) für System und Anlaufstelle, `berechneBeurkundung`
// (src/lib/beurkundung.ts) für die Gebühr mit Norm, Link und Stand (D1) bzw.
// für das ehrliche «offen», solange ein kantonaler Tarif fehlt (§8).
// Grundlage: bibliothek/recherche/vorsorgeauftrag-inhalte.md Ziff. 7.

// ── Gates ───────────────────────────────────────────────────────────────────

export type VaGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeVaGates(a: VaAntworten): VaGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // Eligibility-Gate (Art. 13/14/16/398 ZGB) – hart
  if (!a.volljaehrig || !a.urteilsfaehigBestaetigt || !a.keineUmfassendeBeistandschaft) {
    blocker.push(
      'Errichtungsvoraussetzungen nicht bestätigt: Der Vorsorgeauftrag verlangt Handlungsfähigkeit – Volljährigkeit (Art. 14 ZGB), Urteilsfähigkeit (Art. 16 ZGB) und keine umfassende Beistandschaft (Art. 398 Abs. 3 ZGB).',
    );
  }

  // Mindestens ein Bereich einer beauftragten Person zugewiesen
  const aktiveBereiche = new Set(a.beauftragte.flatMap((b) => (b.name.trim() ? b.bereiche : [])));
  if (a.beauftragte.length === 0 || aktiveBereiche.size === 0) {
    blocker.push('Mindestens eine beauftragte Person mit mindestens einem Aufgabenbereich bezeichnen (Art. 360 Abs. 1 ZGB).');
  }

  // Juristische Person und Personensorge — KEIN Blocker (W2·8, Befunde V-1/V-2).
  //
  // Wortlaut-Befund am Snapshot (ZGB, Stand 1.7.2026): Art. 360 Abs. 1 erlaubt
  // AUSDRÜCKLICH, «eine natürliche oder juristische Person» mit der
  // Personensorge zu beauftragen. Der frühere harte Blocker zitierte Art. 360
  // ZGB damit contra legem (V-1). Auch die Medizin-Variante trug ihr Zitat
  // nicht: Art. 378 Abs. 1 Ziff. 1 nennt schlicht «die in einer
  // Patientenverfügung oder in einem Vorsorgeauftrag bezeichnete Person» und
  // enthält keine Natürlichkeits-Schranke; diese steht wörtlich nur in
  // Art. 370 Abs. 2 — und dort für die PATIENTENVERFÜGUNG (V-2).
  //
  // Offengelegte Lehre-Position: Für die medizinische Vertretung kommt nach
  // verbreiteter Lehre nur eine natürliche Person in Betracht (Anlehnung an
  // Art. 370 Abs. 2). Das ist Lehre, kein Gesetzesbefehl — deshalb WARNUNG mit
  // Validierungs-Risiko (Art. 363 Abs. 2 Ziff. 3), nicht Blocker: Das Werkzeug
  // sperrt nicht, was das Gesetz erlaubt (§1/§8).
  //
  // Historie: Der Vorlagen-Audit 25.6.2026 hatte den Blocker vom medizin-
  // Teilfall auf die ganze Personensorge AUSGEWEITET — gestützt auf ebenjenes
  // contra-legem-Zitat. Diese Ausweitung entfällt mit der Herabstufung.
  // Grundlage: bibliothek/recherche/vorsorgeauftrag-inhalte.md Ziff. 5,
  // Befundregister V-1/V-2.
  //
  // Ersatzpersonen sind mit erfasst (W2·8/F1): Wer im Ersatzfall einrückt,
  // übernimmt die Aufgabe selbst. Ohne ausdrückliche Bereichs-Wahl gilt die
  // Ersatzverfügung für ALLE übertragenen Bereiche.
  const ersatzBereiche = (e: VaErsatzperson): VaBereich[] =>
    e.bereiche && e.bereiche.length > 0 ? e.bereiche : [...aktiveBereiche];
  //
  // W2·8/Gegenprüfung B2 — Namens-Filter-Asymmetrie behoben: Die Prüfung der
  // HAUPTBEAUFTRAGTEN wertete auch Zeilen ohne Namen. Eine frisch hinzugefügte,
  // noch leere Beauftragten-Zeile mit Typ «juristisch» erzeugte damit eine
  // Warnung über eine Person, die im Dokument gar nie erscheint: sowohl
  // `beauftragteListe` (vaZusammenstellen) als auch `aktiveBereiche` oben und
  // die Ersatzpersonen-Prüfung unten filtern seit je auf `name.trim()`. Der
  // Filter gilt jetzt an allen vier Stellen gleich (§5: eine Aussage darüber,
  // wer «bezeichnet» ist).
  const personensorgeJuristisch =
    a.beauftragte.some((b) => b.name.trim() && b.typ === 'juristisch' && b.bereiche.includes('personensorge')) ||
    a.ersatzpersonen.some(
      (e) => e.name.trim() && ersatzTyp(e) === 'juristisch' && ersatzBereiche(e).includes('personensorge'),
    );
  if (personensorgeJuristisch) {
    if (a.module.personensorge.includes('medizin')) {
      warnungen.push(
        'Für die Vertretung bei medizinischen Massnahmen kommt nach verbreiteter Lehre nur eine natürliche Person in Betracht (vgl. Art. 370 Abs. 2 ZGB zur Patientenverfügung); es besteht das Risiko, dass die KESB die Einsetzung insoweit nicht validiert (Art. 363 Abs. 2 Ziff. 3 ZGB). Empfehlung: für die medizinische Vertretung eine natürliche Person bezeichnen.',
      );
    } else {
      hinweise.push(
        'Die Beauftragung einer juristischen Person ist auch für die Personensorge zulässig (Art. 360 Abs. 1 ZGB); die KESB prüft ihre Eignung bei der Validierung (Art. 363 Abs. 2 Ziff. 3 ZGB). Einzelne höchstpersönliche Handlungen werden faktisch durch natürliche Hilfspersonen wahrgenommen.',
      );
    }
  }

  // Eigenhändige Form ohne Datum → Warnung. Das Datum ist beim eigenhändigen
  // Vorsorgeauftrag GÜLTIGKEITSBESTANDTEIL (Art. 361 Abs. 2 ZGB: von Anfang bis
  // Ende von Hand niedergeschrieben, datiert, unterzeichnet). Bisher erzwang das
  // nur die UI als Schritt-Fehler — die Rechtsregel lebte damit allein in der
  // Darstellungsschicht (§3-Verstoss); sie gehört in die Engine.
  // V9.5/N1: gegen den NORMALISIERTEN Wert prüfen (siehe `vaDatumRoh`).
  if (a.formMode === 'eigenhaendig' && !vaDatumRoh(a)) {
    warnungen.push(
      'Ohne Datum ist der eigenhändige Vorsorgeauftrag ungültig – der ganze Text einschliesslich Datum und Unterschrift wird von Hand abgeschrieben (Art. 361 Abs. 2 ZGB).',
    );
  }

  // Interessenkollision bei der Personenwahl. Praktisch wichtigste Regel der
  // Personenwahl (Erbin zugleich Vermögenssorgerin, Geschäftspartner): Bei
  // Interessenkollision entfallen die Befugnisse VON GESETZES WEGEN
  // (Art. 365 Abs. 3 ZGB) — der Auftrag läuft dann insoweit leer.
  if (aktiveBereiche.size > 0) {
    hinweise.push(
      'Bei der Wahl der beauftragten Person Interessenkonflikte bedenken: Bei Interessenkollision entfallen ihre Befugnisse von Gesetzes wegen (Art. 365 Abs. 3 ZGB); nicht erfasste Geschäfte und widerstreitende Interessen sind der KESB zu melden (Art. 365 Abs. 2 ZGB).',
    );
  }

  // Liegenschaften → ausdrückliche Sondervollmacht (wird automatisch aufgenommen)
  if (a.module.vermoegenssorge.includes('liegenschaften')) {
    // W2·8/B5 (Restbefund aus B3/B4): Formulierung an den V07-Baustein-Hinweis
    // angeglichen. Die Auftragsrecht-Verweisung des Art. 365 Abs. 1 ZGB trägt
    // die besondere Ermächtigung — «analoge Anwendung umstritten» beschrieb den
    // Rechtsstand unzutreffend (Befund V-3).
    hinweise.push('Liegenschaften gewählt: Die ausdrückliche Sondervollmacht für Erwerb, Belastung und Veräusserung von Grundstücken wird automatisch aufgenommen (Art. 396 Abs. 3 OR i.V.m. Art. 365 Abs. 1 ZGB – die Auftragsrecht-Verweisung trägt die besondere Ermächtigung; der Erwerb bedarf keiner solchen und wird zur Klarstellung mitgenannt).');
  }

  // Ersatzperson empfohlen
  if (aktiveBereiche.size > 0 && a.ersatzpersonen.filter((e) => e.name.trim()).length === 0) {
    hinweise.push('Eine Ersatzverfügung ist empfohlen, falls die beauftragte Person ungeeignet ist, ablehnt oder kündigt (Art. 360 Abs. 3 ZGB) – idealerweise eine Person ausserhalb möglicher Interessenkonflikte.');
  }

  // Entschädigung offen → KESB legt fest, ABER NUR UNTER VORAUSSETZUNGEN.
  // W2·8/Gegenprüfung B5: Der frühere Satz stellte die Festsetzung unbedingt
  // dar («legt die KESB … fest»). Der Wortlaut knüpft sie an zwei alternative
  // Voraussetzungen (ZGB-Snapshot Stand 1.7.2026, Art. 366 Abs. 1): «… so legt
  // die Erwachsenenschutzbehörde eine angemessene Entschädigung fest, wenn dies
  // mit Rücksicht auf den Umfang der Aufgaben als gerechtfertigt erscheint oder
  // wenn die Leistungen der beauftragten Person üblicherweise entgeltlich
  // sind.» Die Kostentragung steht in Abs. 2 und bleibt als eigener Anker
  // sichtbar — sonst läse sich Abs. 1 als Träger beider Aussagen (§7/§8).
  // W2·8/Gegenprüfung Runde 2, L1–L3 (drei Abweichungen vom Wortlaut):
  // L1 «angemessene» fehlte — der Massstab gehört zur Rechtsfolge von Abs. 1.
  // L2 «bei der Validierung» steht nicht in Art. 366 ZGB; die Norm nennt
  //    keinen Zeitpunkt, die Zuschreibung an Art. 363 wäre unbelegt.
  // L3 Abs. 2 belastet «die Entschädigung und die notwendigen Spesen» — die
  //    Spesen fehlten, der Satz las sich als reine Entschädigungs-Kostenregel.
  if (a.entschaedigung === 'keine_angabe') {
    hinweise.push('Ohne Entschädigungsregelung legt die KESB eine angemessene Entschädigung fest, wenn dies nach dem Umfang der Aufgaben gerechtfertigt erscheint oder die Leistungen üblicherweise entgeltlich sind (Art. 366 Abs. 1 ZGB); Entschädigung und notwendige Spesen werden der auftraggebenden Person belastet (Abs. 2).');
  }

  // Wirksamkeit erst nach KESB-Validierung – immer
  hinweise.push('Wirksam wird der Vorsorgeauftrag erst, wenn die KESB am Wohnsitz (Art. 442 Abs. 1 ZGB) bei eingetretener Urteilsunfähigkeit Gültigkeit, Voraussetzungen und Eignung geprüft hat (Validierung, Art. 363 ZGB).');

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

const BEREICH_LABEL: Record<VaBereich, string> = {
  personensorge: 'Personensorge',
  vermoegenssorge: 'Vermögenssorge',
  rechtsverkehr: 'Vertretung im Rechtsverkehr',
};

// Satzform «… für die Personensorge» (Ersatzverfügung mit Bereichs-Wahl).
const ERSATZ_BEREICH_LABEL: Record<VaBereich, string> = {
  personensorge: 'die Personensorge',
  vermoegenssorge: 'die Vermögenssorge',
  rechtsverkehr: 'die Vertretung im Rechtsverkehr',
};

export const VA_SCHEMA: VorlageSchema = {
  id: 'vorsorgeauftrag',
  version: '1.1.0 (Rechtsstand Art. 360–369 ZGB, Snapshot-Stand 1.7.2026)',
  titel: 'Vorsorgeauftrag',
  ausgabeArt: 'abschrift',  // eigenhändig Art. 361 Abs. 2 ZGB; bei Beurkundung → 'entwurf' (zusammenstellen)
  disclaimer:
    'Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Gültig ist der Vorsorgeauftrag nur ' +
    'vollständig eigenhändig (von Hand geschrieben, datiert, unterzeichnet, Art. 361 Abs. 2 ZGB) ' +
    'oder öffentlich beurkundet (Art. 361 Abs. 1 ZGB); wirksam erst nach Validierung durch die ' +
    'KESB (Art. 363 ZGB). Bei komplexen Vermögensverhältnissen oder Unternehmen: Notariat bzw. ' +
    'Fachberatung beiziehen.',
  bausteine: [
    {
      id: 'V01_identifikation',
      text:
        'Ich, {{vorname}} {{nachname}}, geboren am {{geburtsdatum}}, von {{heimatort}}, wohnhaft ' +
        '{{adresse}}, errichte hiermit – handlungsfähig im Sinne von Art. 13 ZGB – für den Fall ' +
        'meiner Urteilsunfähigkeit den folgenden Vorsorgeauftrag:',
      begruendung: 'Identifikation und Handlungsfähigkeits-Präambel – immer enthalten.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V02_beauftragte',
      ueberschrift: 'Beauftragte Person(en)',
      text: 'Ich beauftrage:',
      includeIf: { feld: 'beauftragteListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mindestens eine beauftragte Person bezeichnet wurde.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V02b_beauftragteliste',
      text: '– {{item.name}} ({{item.angaben}}) für: {{item.bereicheText}};',
      includeIf: { feld: 'beauftragteListe', nichtLeer: true },
      wiederholeUeber: 'beauftragteListe',
      begruendung: 'Je beauftragte Person eine Zeile mit den übertragenen Aufgabenbereichen.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V02c_einzeln',
      text: 'Sind mehrere Personen beauftragt, ist jede im ihr übertragenen Aufgabenbereich einzeln zur Vertretung berechtigt.',
      includeIf: { and: [{ feld: 'mehrereBeauftragte', eq: true }, { feld: 'vertretung', eq: 'einzeln' }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mehrere Personen beauftragt sind und Einzelvertretung gewählt wurde.',
      // W2·8/Gegenprüfung B6: Anker-Präzision. Der Baustein regelt nicht die
      // ÜBERTRAGUNG (Abs. 1), sondern die ART der Aufgabenerfüllung — dafür
      // trägt Abs. 2 (Umschreibung der Aufgaben, Weisungen für die Erfüllung).
      // Damit konsistent zu V04b/V05b/V06b, die schon auf Abs. 2 zeigen.
      norm: 'Art. 360 Abs. 2 ZGB',
      hinweis: 'Das Gesetz regelt das Zusammenwirken mehrerer beauftragter Personen nicht ausdrücklich; die ausdrückliche Anordnung im Auftrag schafft Klarheit für KESB, Banken und Behörden.',
    },
    {
      id: 'V02d_gemeinsam',
      text: 'Sind mehrere Personen im selben Aufgabenbereich beauftragt, handeln sie in diesem Bereich nur gemeinsam (Kollektivvertretung).',
      includeIf: { and: [{ feld: 'mehrereBeauftragte', eq: true }, { feld: 'vertretung', eq: 'gemeinsam' }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mehrere Personen beauftragt sind und Kollektivvertretung gewählt wurde.',
      // W2·8/Gegenprüfung B6 — wie V02c: Art der Aufgabenerfüllung, nicht die
      // Übertragung selbst.
      norm: 'Art. 360 Abs. 2 ZGB',
      hinweis: 'Das Gesetz regelt das Zusammenwirken mehrerer beauftragter Personen nicht ausdrücklich; die ausdrückliche Anordnung im Auftrag schafft Klarheit für KESB, Banken und Behörden.',
    },
    {
      id: 'V03_ersatz',
      text:
        'Ist eine beauftragte Person für die Aufgaben nicht geeignet, nimmt sie den Auftrag nicht ' +
        'an oder kündigt sie ihn, setze ich als Ersatz ein (in dieser Reihenfolge): {{ersatzText}}.',
      includeIf: { feld: 'ersatzText', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Ersatzpersonen bezeichnet wurden (Ersatzverfügung).',
      norm: 'Art. 360 Abs. 3 ZGB',
    },
    {
      id: 'V04_personensorge',
      ueberschrift: 'Personensorge',
      text: 'Im Bereich der Personensorge umfasst der Auftrag insbesondere:',
      includeIf: { feld: 'personensorgeListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil der Bereich Personensorge übertragen und Module gewählt wurden.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V04b_personensorgeliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'personensorgeListe', nichtLeer: true },
      wiederholeUeber: 'personensorgeListe',
      begruendung: 'Je gewähltes Personensorge-Modul eine Zeile.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V05_vermoegenssorge',
      ueberschrift: 'Vermögenssorge',
      text: 'Im Bereich der Vermögenssorge umfasst der Auftrag insbesondere:',
      includeIf: { feld: 'vermoegenssorgeListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil der Bereich Vermögenssorge übertragen und Module gewählt wurden.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V05b_vermoegenssorgeliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'vermoegenssorgeListe', nichtLeer: true },
      wiederholeUeber: 'vermoegenssorgeListe',
      begruendung: 'Je gewähltes Vermögenssorge-Modul eine Zeile.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V06_rechtsverkehr',
      ueberschrift: 'Vertretung im Rechtsverkehr',
      text: 'Im Rechtsverkehr umfasst der Auftrag insbesondere:',
      includeIf: { feld: 'rechtsverkehrListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil der Bereich Rechtsverkehr übertragen und Module gewählt wurden.',
      norm: 'Art. 360 Abs. 1 ZGB',
    },
    {
      id: 'V06b_rechtsverkehrliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'rechtsverkehrListe', nichtLeer: true },
      wiederholeUeber: 'rechtsverkehrListe',
      begruendung: 'Je gewähltes Rechtsverkehr-Modul eine Zeile.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V07_grundstueck',
      text:
        'Die beauftragte Person ist ausdrücklich ermächtigt, Grundeigentum zu erwerben, zu belasten ' +
        'und zu veräussern sowie die entsprechenden Grundbucheinschreibungen zu veranlassen.',
      includeIf: { feld: 'liegenschaftenGewaehlt', eq: true },
      nummeriert: true,
      begruendung: 'Automatisch aufgenommen, weil das Modul «Liegenschaften» gewählt wurde – ausdrückliche Sondervollmacht.',
      norm: 'Art. 396 Abs. 3 OR',
      hinweis: 'Art. 396 Abs. 3 OR deckt Veräusserung und Belastung; der Erwerb bedarf keiner besonderen Ermächtigung und wird zur Klarstellung im Grundbuchverkehr mitgenannt. Die Brücke ins Erwachsenenschutzrecht schlägt Art. 365 Abs. 1 ZGB (Auftragsrecht-Verweisung).',
    },
    {
      id: 'V08_schenkungen',
      text:
        'Die beauftragte Person ist befugt, übliche Gelegenheitsgeschenke auszurichten und ' +
        'Zuwendungen zur Erfüllung einer sittlichen Pflicht vorzunehmen.',
      includeIf: { feld: 'schenkungenErlaubt', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Gelegenheitsgeschenke erlaubt werden sollen.',
      norm: 'Art. 240 Abs. 2 und Art. 239 Abs. 3 OR',
      hinweis: 'Aus dem Vermögen einer handlungsunfähigen Person dürfen nur übliche Gelegenheitsgeschenke ausgerichtet werden – weitergehende Schenkungen sind problematisch.',
    },
    {
      id: 'V09_besondere',
      text:
        'Die beauftragte Person ist ausdrücklich ermächtigt, Vergleiche abzuschliessen, ' +
        'Schiedsvereinbarungen einzugehen und Wechselverbindlichkeiten einzugehen.',
      includeIf: { feld: 'besondereGeschaefte', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil besondere Geschäfte ausdrücklich ermächtigt werden sollen.',
      norm: 'Art. 396 Abs. 3 OR',
    },
    {
      id: 'V10_weisungen',
      ueberschrift: 'Weisungen',
      text: '{{weisungen}}',
      includeIf: { feld: 'weisungen', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Weisungen für die Erfüllung der Aufgaben erteilt wurden.',
      norm: 'Art. 360 Abs. 2 ZGB',
    },
    {
      id: 'V11_entschaedigung',
      ueberschrift: 'Entschädigung',
      text: '{{entschaedigungText}}',
      includeIf: { feld: 'entschaedigungText', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil eine Entschädigungsregelung getroffen wurde (sonst legt die KESB sie fest).',
      norm: 'Art. 366 Abs. 1 ZGB (e contrario)',
    },
    {
      id: 'V12_pv',
      text: 'Ich habe eine separate Patientenverfügung errichtet{{pvHinterlegungZeile}}; für medizinische Massnahmen geht diese vor.',
      includeIf: { feld: 'pvVorhanden', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil auf eine bestehende Patientenverfügung verwiesen wird.',
      norm: 'Art. 372 Abs. 2 i.V.m. Art. 377 Abs. 1 ZGB',
    },
    {
      id: 'V13_ersetzt',
      text: 'Ich widerrufe hiermit alle früheren Vorsorgeaufträge. Dieser Vorsorgeauftrag tritt an ihre Stelle.',
      includeIf: { feld: 'ersetztFruehere', eq: true },
      nummeriert: true,
      begruendung:
        'Aufgenommen, weil frühere Vorsorgeaufträge ausdrücklich aufgehoben werden sollen: Der Widerruf wird in einer Errichtungsform ausgesprochen (Art. 362 Abs. 1 ZGB) statt bloss angedeutet.',
      // W2·8/Gegenprüfung B6: Der Baustein spricht ZWEI Sätze aus — den
      // Widerruf (Abs. 1: Widerruf in einer Errichtungsform) und die Rechtsfolge
      // «tritt an ihre Stelle» (Abs. 3). Der Anker trägt beide, sonst stünde der
      // zweite Satz ohne Norm da (D1/§13).
      norm: 'Art. 362 Abs. 1 und 3 ZGB',
    },
    {
      id: 'V13b_ergaenzung',
      text: 'Dieser Vorsorgeauftrag ergänzt meinen Vorsorgeauftrag vom {{fruehererVaDatum}} und lässt ihn im Übrigen unberührt.',
      includeIf: { feld: 'ersetztFruehere', eq: false },
      nummeriert: true,
      begruendung:
        'Aufgenommen, weil der frühere Vorsorgeauftrag bestehen bleiben soll: Die Klausel stellt die Ausnahme «zweifellos eine blosse Ergänzung» (Art. 362 Abs. 3 ZGB) ausdrücklich her.',
      norm: 'Art. 362 Abs. 3 ZGB',
      hinweis: 'Ohne diese Klausel gälte die gesetzliche Ersetzungsvermutung: Ein neuer Vorsorgeauftrag tritt an die Stelle des früheren, sofern er nicht zweifellos eine blosse Ergänzung darstellt (Art. 362 Abs. 3 ZGB).',
    },
    {
      id: 'V14_schluss_eigenhaendig', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\n\n_________________________________\n(eigenhändige Unterschrift: {{vorname}} {{nachname}})',
      includeIf: { feld: 'formMode', eq: 'eigenhaendig' },
      // W2·8/V9.5 (Gegenprüfung Runde 3, Befund N2 — Fachänderung, deklariert):
      // Die Begründung nannte «Ort/Datum und Unterschrift» als Bestandteile der
      // eigenhändigen Form und stellte damit den Ort als Formerfordernis dar.
      // Art. 361 Abs. 2 ZGB verlangt ihn nicht (ZGB-Snapshot Stand 1.7.2026:
      // «von Anfang bis Ende von Hand niederzuschreiben, zu datieren und zu
      // unterzeichnen»). Der Baustein rendert den Ort weiterhin, wenn er
      // erfasst ist — die Begründung sagt jetzt aber, was Gültigkeits-
      // erfordernis ist und was nicht (§7/§8; konsistent zu `ortDatumZeile`,
      // die den Strich nur für das Datum beschriftet).
      begruendung:
        'Schlussformel der eigenhändigen Form: Datum und Unterschrift sind Gültigkeitserfordernis und werden – wie der ganze Text – von Hand geschrieben; die Ortsangabe verlangt Art. 361 Abs. 2 ZGB nicht, sie ist fakultativ und dient nur der Zuordnung.',
      norm: 'Art. 361 Abs. 2 ZGB',
    },
    {
      id: 'V14_schluss_beurkundung', rolle: 'unterschrift',
      text:
        'Ort, Datum und Unterschriften erfolgen anlässlich der öffentlichen Beurkundung durch die ' +
        'Urkundsperson nach kantonalem Recht.',
      includeIf: { feld: 'formMode', eq: 'oeffentlich_beurkundet' },
      begruendung: 'Schlusshinweis der beurkundeten Form: Errichtung erfolgt vor der Urkundsperson.',
      norm: 'Art. 361 Abs. 1 ZGB',
      hinweis: 'Das Beurkundungsverfahren richtet sich nach kantonalem Recht; zwei Zeugen wie beim öffentlichen Testament sind nicht erforderlich (BGE 151 III 81).',
    },
  ],
};

// ── Antworten aufbereiten und zusammenstellen ───────────────────────────────

export function vaZusammenstellen(a: VaAntworten) {
  // V9.5/N1 + N3: Ort und Datum werden EINMAL am Funktionsanfang normalisiert
  // und danach nur noch in dieser Form ausgewertet.
  const datumRoh = vaDatumRoh(a);
  const ort = vaOrtNormalisiert(a);
  const datum = datumRoh ? datumRoh.split('-').reverse().join('.') : '________';
  const beauftragteListe = a.beauftragte
    .filter((b) => b.name.trim() && b.bereiche.length > 0)
    .map((b) => ({
      name: b.name,
      angaben: b.angaben || (b.typ === 'juristisch' ? 'juristische Person' : '________'),
      bereicheText: b.bereiche.map((x) => BEREICH_LABEL[x]).join(', '),
    }));

  const modulListe = (bereich: VaBereich) => {
    const aktiv = a.beauftragte.some((b) => b.name.trim() && b.bereiche.includes(bereich));
    if (!aktiv) return [];
    return VA_MODULE[bereich].filter((m) => a.module[bereich].includes(m.id)).map((m) => ({ label: m.label }));
  };

  const entschaedigungText =
    a.entschaedigung === 'unentgeltlich'
      ? 'Die beauftragte Person übt den Auftrag unentgeltlich aus; notwendige Spesen werden ihr ersetzt.'
      : a.entschaedigung === 'pauschale'
        ? `Die beauftragte Person erhält eine pauschale Entschädigung von CHF ${a.entschaedigungBetrag ?? '________'} pro Jahr; notwendige Spesen werden ihr zusätzlich ersetzt.`
        : a.entschaedigung === 'nach_aufwand'
          ? `Die beauftragte Person wird nach Zeitaufwand zu einem Ansatz von CHF ${a.entschaedigungBetrag ?? '________'} pro Stunde entschädigt; notwendige Spesen werden ihr ersetzt.`
          : '';

  // Bereichs-Zusatz der Ersatzverfügung (W2·8/F1): NUR bei ausdrücklicher
  // Bereichs-Wahl. Ohne Wahl gilt der Ersatz für alle übertragenen Bereiche –
  // dann bleibt der Satz wortgleich wie vor W2·8 (keine stille Textänderung
  // bestehender Aufträge).
  const ersatzBereicheText = (e: VaErsatzperson) =>
    e.bereiche && e.bereiche.length > 0
      ? ` für ${e.bereiche.map((x) => ERSATZ_BEREICH_LABEL[x]).join(', ')}`
      : '';

  const antworten: Antworten = {
    ...a,
    beauftragteListe,
    mehrereBeauftragte: beauftragteListe.length > 1,
    ersatzText: a.ersatzpersonen
      .filter((e) => e.name.trim())
      .map((e, i) => `${i + 1}. ${e.name}${e.angaben ? ` (${e.angaben})` : ''}${ersatzBereicheText(e)}`)
      .join('; '),
    personensorgeListe: modulListe('personensorge'),
    vermoegenssorgeListe: modulListe('vermoegenssorge'),
    rechtsverkehrListe: modulListe('rechtsverkehr'),
    liegenschaftenGewaehlt:
      a.module.vermoegenssorge.includes('liegenschaften') &&
      a.beauftragte.some((b) => b.name.trim() && b.bereiche.includes('vermoegenssorge')),
    entschaedigungText,
    pvHinterlegungZeile: a.pvHinterlegung?.trim() ? ` (Hinterlegungsort: ${a.pvHinterlegung.trim()})` : '',
    // W2·8/Gegenprüfung B7: Ohne Ort stand hier ein hängendes «den 15.06.2026».
    // «den» ist der Anschluss an den Ort («Basel, den …»), nicht Teil des
    // Datums – fehlt der Ort, steht nur das Datum.
    // W2·8/Gegenprüfung Runde 2, B8: Fehlen Ort UND Datum, stand hier ein
    // nackter Strich «________» unmittelbar über der Unterschriftslinie und
    // war von dieser nicht zu unterscheiden. Im Abschreibe-Muster hätte die
    // abschreibende Person ihn als Teil der Unterschrift lesen und das Datum
    // weglassen können — das Datum ist nach Art. 361 Abs. 2 ZGB
    // Gültigkeitserfordernis der eigenhändigen Errichtung («… von Hand
    // niederzuschreiben, zu datieren und zu unterzeichnen», ZGB-Snapshot
    // Stand 1.7.2026). Der Strich wird deshalb beschriftet; der Ort bleibt
    // unbeschriftet, weil ihn Art. 361 Abs. 2 ZGB nicht verlangt.
    // W2·8/V9.5, N1+N3: Der Zweig entscheidet über die normalisierten Werte —
    // Whitespace-Datum fällt in den beschrifteten Strich, «Basel,» erzeugt
    // kein Doppelkomma.
    ortDatumZeile: ort ? `${ort}, den ${datum}` : (datumRoh ? datum : 'Datum: ________'),
  };
  const erg = assemble(VA_SCHEMA, antworten);
  // Form-Gate-Matrix: Beurkundungs-Variante ist ein ENTWURF für die
  // Urkundsperson (Wasserzeichen), eigenhändig bleibt Abschreibe-Muster.
  erg.dokument.ausgabeArt = a.formMode === 'oeffentlich_beurkundet' ? 'entwurf' : 'abschrift';
  return erg;
}
