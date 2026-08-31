/**
 * ZH-4a · Deklarative ZH-Quellenliste (Kern-Erlasse der Zürcher
 * Gesetzessammlung, LS) — 31.8.2026.
 *
 * WARUM DIESE DATEI EXISTIERT (§7-d-Lücke, Dossier §7):
 * Bis hierher war die ZH-Erlassmenge eine ABLEITUNG aus den Tarif-Tabellen
 * (`sammleZhPdfInventar()` filtert `alleTarifEintraege()` auf zhlex-URLs). Ein
 * Erlass ohne Tarif-Zitat existierte damit weder für den Snapshot-Generator
 * noch für die Drift-Prüfung — er war unsichtbar UND driftblind. Der Umweg
 * über `src/data/tarif/*.ts` ist verboten (das ist Rechenlogik und reisst
 * `golden/lexmetrik-golden.json`). Darum: eine eigene, deklarative Liste, die
 * NEBEN die Tarif-Ableitung tritt; beide werden über die Registry-URL
 * dedupliziert vereinigt (inventar-kanton.ts) und von check-drift.ts gelesen.
 *
 * ERZEUGUNGSWEG (§5 — nie von Hand raten, immer empirisch auflösen):
 *   npx vite-node scripts/normtext/zh-quellen-aufloesen.ts
 * Das Werkzeug löst je Ordnungsnummer die Registry-URL der GELTENDEN Fassung
 * über den amtlichen JSON-Endpunkt auf und meldet Abweichungen gegen diese
 * Datei. Die AEM-Komponenten-ID (`lawcollectionsearch_<id>`) wird dabei zur
 * Laufzeit aus der server-gerenderten Suchseite aufgelöst und NIE verdrahtet
 * (Dossier §5: ein Seiten-Redesign ändert sie ohne Vorwarnung).
 *
 * QUELLE (alle Felder am 31.8.2026 empirisch erhoben):
 *   Suchseite   https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung.html
 *   JSON        …/gesetzessammlung/_jcr_content/main/lawcollectionsearch_<id>
 *               .zhweb-zhlex-ls.zhweb-cache.json?referenceNumber=<Nr>
 *               &includeRepealedEnactments=false
 *   `titel` = `enactmentTitle` wörtlich; `kuerzel` = Klammerzusatz des
 *   amtlichen Titels (leer, wenn der Titel keinen trägt — kein erfundenes
 *   Kürzel, §8); `registryUrl` = `link` absolut gemacht.
 *
 * FALLEN (Dossier §5): der JSON-Endpunkt antwortet bei 0 Treffern mit
 * HTTP 204 und LEEREM Body (kein JSON — Status/Länge vor `JSON.parse` prüfen);
 * ohne `fileNumber`-Slice kappt er hart bei 150 Treffern.
 *
 * §2: reine Daten, keine Laufzeit-Auflösung. Die Liste ist der SOLL-Bestand;
 * fehlt ein gelisteter Erlass im Lauf, bricht `normtext-snapshot.ts` sichtbar
 * ab (ZH-4b) statt still eine Lücke zu schreiben.
 */

export interface ZhQuelle {
  /** LS-Ordnungsnummer, z. B. '211.1'. */
  nr: string;
  /** Amtlicher Titel (`enactmentTitle` des JSON-Endpunkts, wörtlich). */
  titel: string;
  /** Erwartetes Kürzel aus dem Klammerzusatz des amtlichen Titels; '' = keins. */
  kuerzel: string;
  /** Registry-URL der geltenden Fassung (= Manifest-Key des Snapshots). */
  registryUrl: string;
}

const BASIS = 'https://www.zh.ch/de/politik-staat/gesetze-beschluesse/gesetzessammlung/zhlex-ls/';

/**
 * Kern-Erlasse der ZH-Tranche Stufe 2. Reihenfolge = LS-Ordnungsnummer
 * (deterministisch). Erweiterung nur über das Auflöse-Werkzeug, nie von Hand.
 *
 * `titel` ist der `enactmentTitle` wörtlich, lediglich an den Enden getrimmt —
 * der Endpunkt liefert bei einigen Erlassen ein bis zwei angehängte Leerzeichen
 * («Gemeindegesetz (GG) »); das ist Transport-Artefakt, nicht Titelbestandteil.
 *
 * §7-Abweichung gegenüber Dossier §6 (offengelegt, 31.8.2026): LS 323.1 heisst
 * amtlich «GebV StrV», nicht «GebV Strafverfolgung» — das Dossier führte eine
 * Sachbezeichnung statt des amtlichen Kürzels.
 *
 * NACHGEZOGEN 31.8.2026 (Fix-Runde, Befund E2-H1): LS 101 Kantonsverfassung ist
 * jetzt in der Liste. Der Adapter kannte nur den «§ N.»-Marker und lieferte für
 * die KV 0 Artikel; seit `erkenneZhMarker` die Zählweise je Erlass aus der
 * Textbasis erhebt, liest er die 147 «Art. N»-Bestimmungen vollständig.
 *
 * ZURÜCKGESTELLT (Qualitäts-Triage §1, 31.8.2026 — bewusst NICHT in der Liste;
 * Begründungen im Bericht/Fahrplan §4):
 *   - LS 131.11 Gemeindeverordnung (VGG): der Anhang-Spalten-Zweig (für den
 *     NotGebV-Anhang gebaut) liefert hier Ziffern-Token aus einer anders
 *     gebauten Tabelle → erst nach Prüfung dieses Zweigs aufnehmen.
 */
export const ZH_QUELLEN: readonly ZhQuelle[] = [
  {
    nr: '101',
    titel: 'Verfassung des Kantons Zürich',
    kuerzel: '',
    registryUrl: `${BASIS}erlass-101-2005_02_27-2006_01_01-129.html`,
  },
  {
    nr: '131.1',
    titel: 'Gemeindegesetz (GG)',
    kuerzel: 'GG',
    registryUrl: `${BASIS}erlass-131_1-2015_04_20-2018_01_01-132.html`,
  },
  {
    nr: '170.4',
    titel: 'Gesetz über die Information und den Datenschutz (IDG)',
    kuerzel: 'IDG',
    registryUrl: `${BASIS}erlass-170_4-2007_02_12-2008_10_01-125.html`,
  },
  {
    nr: '171.1',
    titel: 'Kantonsratsgesetz (KRG)',
    kuerzel: 'KRG',
    registryUrl: `${BASIS}erlass-171_1-2019_03_25-2020_05_01-133.html`,
  },
  {
    nr: '175.2',
    titel: 'Verwaltungsrechtspflegegesetz (VRG)',
    kuerzel: 'VRG',
    registryUrl: `${BASIS}erlass-175_2-1959_05_24-1960_05_01-133.html`,
  },
  {
    nr: '177.10',
    titel: 'Personalgesetz (PG)',
    kuerzel: 'PG',
    registryUrl: `${BASIS}erlass-177_10-1998_09_27-1999_07_01-126.html`,
  },
  {
    nr: '211.1',
    titel: 'Gesetz über die Gerichts- und Behördenorganisation im Zivil- und Strafprozess (GOG)',
    kuerzel: 'GOG',
    registryUrl: `${BASIS}erlass-211_1-2010_05_10-2011_01_01-131.html`,
  },
  {
    nr: '211.15',
    titel:
      'Informations- und Akteneinsichtsverordnung der obersten kantonalen Gerichte (IAV)',
    kuerzel: 'IAV',
    registryUrl: `${BASIS}erlass-211_15-2021_07_12-2021_11_01-115.html`,
  },
  {
    nr: '212.812',
    titel:
      'Verordnung über die Gebühren, Kosten und Entschädigungen vor dem Sozialversicherungsgericht (GebV SVGer)',
    kuerzel: 'GebV SVGer',
    registryUrl: `${BASIS}erlass-212_812-2011_04_12-2011_07_01-115.html`,
  },
  {
    nr: '215.1',
    titel: 'Anwaltsgesetz',
    // Befund B-9 (Gegenprüfung 31.8.2026): hier stand «AnwG». Der amtliche
    // Titel trägt keinen Klammerzusatz (JSON-Endpunkt: 'Anwaltsgesetz'), und
    // die Zeichenfolge «AnwG» kommt im Erlass-PDF nicht vor — das Kürzel war
    // erfunden (§8). Leeres Feld ist die ehrliche Angabe; das Auflöse-Werkzeug
    // prüft `kuerzel` seit dieser Runde mit.
    kuerzel: '',
    registryUrl: `${BASIS}erlass-215_1-2003_11_17-2005_01_01-071.html`,
  },
  {
    nr: '230',
    titel: 'Einführungsgesetz zum Schweizerischen Zivilgesetzbuch (EG ZGB)',
    kuerzel: 'EG ZGB',
    registryUrl: `${BASIS}erlass-230-1911_04_02-1912_01_01-133.html`,
  },
  {
    nr: '232.3',
    titel: 'Einführungsgesetz zum Kindes- und Erwachsenenschutzrecht (EG KESR)',
    kuerzel: 'EG KESR',
    registryUrl: `${BASIS}erlass-232_3-2012_06_25-2013_01_01-115.html`,
  },
  {
    nr: '242',
    titel: 'Notariatsgesetz (NotG)',
    kuerzel: 'NotG',
    registryUrl: `${BASIS}erlass-242-1985_06_09-1989_01_01-095.html`,
  },
  {
    nr: '281.1',
    titel: 'Verordnung über die Betreibungs- und Gemeindeammannämter (VBG)',
    kuerzel: 'VBG',
    registryUrl: `${BASIS}erlass-281_1-2010_05_12-2010_07_01-071.html`,
  },
  {
    nr: '323.1',
    titel:
      'Verordnung über die Gebühren, Auslagen und Entschädigungen der Strafverfolgungsbehörden (GebV StrV)',
    kuerzel: 'GebV StrV',
    registryUrl: `${BASIS}erlass-323_1-2010_11_24-2011_01_01-103.html`,
  },
  {
    nr: '331',
    titel: 'Straf- und Justizvollzugsgesetz (StJVG)',
    kuerzel: 'StJVG',
    registryUrl: `${BASIS}erlass-331-2006_06_19-2007_01_01-109.html`,
  },
  {
    nr: '550.1',
    titel: 'Polizeigesetz (PolG)',
    kuerzel: 'PolG',
    registryUrl: `${BASIS}erlass-550_1-2007_04_23-2009_07_01-131.html`,
  },
  {
    nr: '631.1',
    titel: 'Steuergesetz (StG)',
    kuerzel: 'StG',
    registryUrl: `${BASIS}erlass-631_1-1997_06_08-1999_01_01-132.html`,
  },
  {
    nr: '631.11',
    titel: 'Verordnung zum Steuergesetz (StV)',
    kuerzel: 'StV',
    registryUrl: `${BASIS}erlass-631_11-1998_04_01-1999_01_01-108.html`,
  },
  {
    nr: '700.1',
    titel: 'Planungs- und Baugesetz (PBG)',
    kuerzel: 'PBG',
    registryUrl: `${BASIS}erlass-700_1-1975_09_07-1976_04_01-134.html`,
  },
  {
    nr: '851.1',
    titel: 'Sozialhilfegesetz (SHG)',
    kuerzel: 'SHG',
    registryUrl: `${BASIS}erlass-851_1-1981_06_14-1982_01_01-123.html`,
  },
];
