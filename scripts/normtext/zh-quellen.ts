/**
 * ZH-4a · Deklarative ZH-Quellenliste (Zürcher Gesetzessammlung, LS) —
 * 31.8.2026, erweitert 1.9.2026 (Tranche A).
 *
 * BESTAND 1.9.2026: die 21 Kern-Erlasse der Stufe 2 plus die drei vollständigen
 * Systematik-Ordner 3 (Gerichtsorganisation/Zivilrecht/Notariat/Grundbuch, 76),
 * 10 (Finanzen/Steuern/Gebühren, 67) und 4 (SchKG/Strafrecht/Vollzug, 27) —
 * 170 Ordner-Erlasse, davon 12 schon im Kern-Bestand, Vereinigung 179. Die
 * Ordner-Zahlen decken sich mit dem Stufe-1-Inventar (76/67/27, Erhebung
 * 31.8.2026) — unabhängige Gegenprobe der Enumeration.
 * Erzeugt mit `zh-quellen-aufloesen.ts --ordner=3,10,4`; alle 12 überlappenden
 * Erlasse trugen Titel, Kürzel und Registry-URL byte-gleich zum amtlichen
 * Endpunkt (0 Konflikte) — der Kern-Bestand ist damit heute nachverifiziert.
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
 * Erlasse der ZH-Tranche. Reihenfolge = LS-Ordnungsnummer, numerisch
 * segmentweise sortiert (deterministisch). Erweiterung nur über das
 * Auflöse-Werkzeug, nie von Hand.
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
    titel: "Verfassung des Kantons Zürich",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-101-2005_02_27-2006_01_01-129.html`,
  },
  {
    nr: '131.1',
    titel: "Gemeindegesetz (GG)",
    kuerzel: "GG",
    registryUrl: `${BASIS}erlass-131_1-2015_04_20-2018_01_01-132.html`,
  },
  {
    nr: '170.4',
    titel: "Gesetz über die Information und den Datenschutz (IDG)",
    kuerzel: "IDG",
    registryUrl: `${BASIS}erlass-170_4-2007_02_12-2008_10_01-125.html`,
  },
  {
    nr: '171.1',
    titel: "Kantonsratsgesetz (KRG)",
    kuerzel: "KRG",
    registryUrl: `${BASIS}erlass-171_1-2019_03_25-2020_05_01-133.html`,
  },
  {
    nr: '175.2',
    titel: "Verwaltungsrechtspflegegesetz (VRG)",
    kuerzel: "VRG",
    registryUrl: `${BASIS}erlass-175_2-1959_05_24-1960_05_01-133.html`,
  },
  {
    nr: '177.10',
    titel: "Personalgesetz (PG)",
    kuerzel: "PG",
    registryUrl: `${BASIS}erlass-177_10-1998_09_27-1999_07_01-126.html`,
  },
  {
    nr: '211.1',
    titel: "Gesetz über die Gerichts- und Behördenorganisation im Zivil- und Strafprozess (GOG)",
    kuerzel: "GOG",
    registryUrl: `${BASIS}erlass-211_1-2010_05_10-2011_01_01-131.html`,
  },
  {
    nr: '211.11',
    titel: "Gebührenverordnung des Obergerichts (GebV OG)",
    kuerzel: "GebV OG",
    registryUrl: `${BASIS}erlass-211_11-2010_09_08-2011_01_01-087.html`,
  },
  {
    nr: '211.12',
    titel: "Verordnung der obersten kantonalen Gerichte über die Entschädigung der Zeugen und Zeuginnen,  Auskunftspersonen und Sachverständigen (Entschädigungsverordnung der obersten Gerichte)",
    kuerzel: "Entschädigungsverordnung der obersten Gerichte",
    registryUrl: `${BASIS}erlass-211_12-2002_06_11-2002_07_01-071.html`,
  },
  {
    nr: '211.13',
    titel: "Verordnung des Obergerichtes über die Verwaltung von Depositen, Kautionen und Effekten",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_13-1960_11_23-1961_01_01-071.html`,
  },
  {
    nr: '211.14',
    titel: "Verordnung des Obergerichts über das Rechnungswesen der Bezirksgerichte und des Obergerichts sowie über das zentrale Inkasso",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_14-2003_04_09-2003_07_01-071.html`,
  },
  {
    nr: '211.15',
    titel: "Informations- und Akteneinsichtsverordnung der obersten kantonalen Gerichte (IAV)",
    kuerzel: "IAV",
    registryUrl: `${BASIS}erlass-211_15-2021_07_12-2021_11_01-115.html`,
  },
  {
    nr: '211.16',
    titel: "Verordnung der obersten kantonalen Gerichte über die Archivierung von Verfahrensakten (Archivverordnung der obersten Gerichte)",
    kuerzel: "Archivverordnung der obersten Gerichte",
    registryUrl: `${BASIS}erlass-211_16-2001_03_16-2003_07_01-071.html`,
  },
  {
    nr: '211.17',
    titel: "Sprachdienstleistungsverordnung (SDV)",
    kuerzel: "SDV",
    registryUrl: `${BASIS}erlass-211_17-2018_12_19-2019_07_01-125.html`,
  },
  {
    nr: '211.21',
    titel: "Vollzugsverordnung der obersten kantonalen Gerichte zum Personalgesetz",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_21-1999_10_26-1999_11_01-071.html`,
  },
  {
    nr: '211.22',
    titel: "Verordnung der obersten kantonalen Gerichte über die Nutzung von Internet und E-Mail",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_22-2004_06_08-2004_07_01-046.html`,
  },
  {
    nr: '211.23',
    titel: "Verordnung der obersten kantonalen Gerichte über die Gerichtsauditoren und Gerichtsauditorinnen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_23-2000_06_20-2000_09_01-071.html`,
  },
  {
    nr: '211.25',
    titel: "Verordnung über das Mitspracherecht des Personals der Gerichte und Notariate",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_25-1979_06_27-1980_01_01-071.html`,
  },
  {
    nr: '211.56',
    titel: "Verordnung über den Vollzug der Zwangsmassnahmen im Ausländerrecht (VVZMA)",
    kuerzel: "VVZMA",
    registryUrl: `${BASIS}erlass-211_56-1996_12_04-1997_01_01-132.html`,
  },
  {
    nr: '211.112',
    titel: "Verordnung über das Inkasso von Gebühren und Kosten",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_112-2007_02_06-2007_07_01-071.html`,
  },
  {
    nr: '211.251',
    titel: "Reglement der Verwaltungskommission des Obergerichts über die Wahl der Mitglieder und Ersatzmitglieder der Personalausschüsse",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-211_251-1979_11_14-1980_01_01-091.html`,
  },
  {
    nr: '212.22',
    titel: "Beschluss des Kantonsrates über die Stellenprozente sowie die Mindestzahl der Mitglieder der Bezirksgerichte",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_22-2022_07_11-2022_10_01-118.html`,
  },
  {
    nr: '212.23',
    titel: "Beschluss des Kantonsrates über die Zahl der Beisitzenden der Arbeitsgerichte für die Amtsdauer 2026&#8211;2032",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_23-2025_09_29-2026_07_01-133.html`,
  },
  {
    nr: '212.24',
    titel: "Beschluss des Kantonsrates über die Zahl der Beisitzenden der Mietgerichte für die Amtsdauer 2026&#8211;2032",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_24-2025_09_29-2026_07_01-133.html`,
  },
  {
    nr: '212.51',
    titel: "Verordnung über die Organisation des Obergerichts",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_51-2010_11_03-2011_01_01-116.html`,
  },
  {
    nr: '212.53',
    titel: "Beschluss des Kantonsrates über die Festsetzung der Besoldungen der Mitglieder des Obergerichts",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_53-1991_04_22-1991_07_01-073.html`,
  },
  {
    nr: '212.61',
    titel: "Beschluss des Kantonsrates über die Zahl der Handelsrichterinnen und Handelsrichter",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_61-2004_05_10-2004_05_10-046.html`,
  },
  {
    nr: '212.81',
    titel: "Gesetz über das Sozialversicherungsgericht (GSVGer)",
    kuerzel: "GSVGer",
    registryUrl: `${BASIS}erlass-212_81-1993_03_07-1993_11_01-129.html`,
  },
  {
    nr: '212.82',
    titel: "Beschluss des Kantonsrates über den Sitz des Sozialversicherungsgerichts",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_82-2005_12_05-2005_12_05-051.html`,
  },
  {
    nr: '212.83',
    titel: "Beschluss des Kantonsrates über die Festsetzung der Besoldungen der Mitglieder des Sozialversicherungsgerichts",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_83-1994_01_03-1994_01_03-079.html`,
  },
  {
    nr: '212.84',
    titel: "Beschluss des Kantonsrates über die Zahl der Mitglieder und Ersatzmitglieder des Sozialversicherungsgerichts",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_84-2019_03_04-2019_07_01-105.html`,
  },
  {
    nr: '212.126',
    titel: "Beschluss des Regierungsrates über die Neuaufteilung der Friedensrichterkreise 3, 4, 5, 6, 9, 10, 11 und 12 (der Stadt Zürich)",
    kuerzel: "der Stadt Zürich",
    registryUrl: `${BASIS}erlass-212_126-1996_10_09-1996_10_09-091.html`,
  },
  {
    nr: '212.127',
    titel: "Beschluss des Regierungsrates über die Vereinigung der Friedensrichterkreise 1 und 2 (der Stadt Zürich)",
    kuerzel: "der Stadt Zürich",
    registryUrl: `${BASIS}erlass-212_127-2000_11_29-2000_11_29-031.html`,
  },
  {
    nr: '212.511',
    titel: "Verordnung über die Organisation und Geschäftsführung der Obergerichtskanzlei",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_511-2010_11_03-2011_01_01-071.html`,
  },
  {
    nr: '212.513',
    titel: "Akturierungsverordnung",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_513-2010_05_12-2011_01_01-071.html`,
  },
  {
    nr: '212.521',
    titel: "Beschluss des Kantonsrates über die Stellenprozente der Mitglieder und die Zahl der Ersatzmitglieder des Obergerichts",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-212_521-2023_03_20-2023_07_01-121.html`,
  },
  {
    nr: '212.811',
    titel: "Verordnung über die Organisation und den Geschäftsgang des Sozialversicherungsgerichts (OrgV SVGer)",
    kuerzel: "OrgV SVGer",
    registryUrl: `${BASIS}erlass-212_811-2004_10_26-2005_04_01-115.html`,
  },
  {
    nr: '212.812',
    titel: "Verordnung über die Gebühren, Kosten und Entschädigungen vor dem Sozialversicherungsgericht (GebV SVGer)",
    kuerzel: "GebV SVGer",
    registryUrl: `${BASIS}erlass-212_812-2011_04_12-2011_07_01-115.html`,
  },
  {
    nr: '212.814',
    titel: "Verordnung über das Schiedsgericht in Sozialversicherungsstreitigkeiten (SGVo)",
    kuerzel: "SGVo",
    registryUrl: `${BASIS}erlass-212_814-2004_10_26-2005_04_01-049.html`,
  },
  {
    nr: '213.12',
    titel: "Beschluss des Kantonsrates über die Zahl der ordentlichen Staatsanwältinnen und Staatsanwälte im Kanton und die Verteilung der Wahlstellen auf die Bezirke",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-213_12-2008_03_31-2008_05_01-061.html`,
  },
  {
    nr: '213.21',
    titel: "Verordnung über die Organisation der Oberstaatsanwaltschaft und der Staatsanwaltschaften (VOSTA)",
    kuerzel: "VOSTA",
    registryUrl: `${BASIS}erlass-213_21-2004_10_27-2005_01_01-132.html`,
  },
  {
    nr: '213.23',
    titel: "Verordnung über das Wahlfähigkeitszeugnis für Staatsanwältinnen und Staatsanwälte",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-213_23-2005_06_22-2006_01_01-071.html`,
  },
  {
    nr: '213.27',
    titel: "Verordnung zum Bundesgesetz über die Teilung eingezogener Vermögenswerte (VO TEVG)",
    kuerzel: "VO TEVG",
    registryUrl: `${BASIS}erlass-213_27-2011_12_13-2012_04_01-076.html`,
  },
  {
    nr: '213.121',
    titel: "Beschluss des Regierungsrates über die Verteilung der Wahlstellen der ordentlichen Staatsanwältinnen und Staatsanwälte  auf die Bezirke (Amtsdauer 2009&#8211;2013)",
    kuerzel: "Amtsdauer 2009&#8211;2013",
    registryUrl: `${BASIS}erlass-213_121-2008_09_03-2008_09_03-062.html`,
  },
  {
    nr: '213.231',
    titel: "Reglement der Direktion der Justiz und des Innern über die Organisation und die Tätigkeit der Prüfungskommission für die Staatsanwaltschaften",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-213_231-2006_01_06-2006_02_01-112.html`,
  },
  {
    nr: '215.1',
    titel: "Anwaltsgesetz",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_1-2003_11_17-2005_01_01-071.html`,
  },
  {
    nr: '215.2',
    titel: "Verordnung des Obergerichts über die Aufsichtskommission über die Anwältinnen und Anwälte",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_2-2004_12_15-2005_01_01-091.html`,
  },
  {
    nr: '215.3',
    titel: "Verordnung über die Anwaltsgebühren (AnwGebV)",
    kuerzel: "AnwGebV",
    registryUrl: `${BASIS}erlass-215_3-2010_09_08-2011_01_01-087.html`,
  },
  {
    nr: '215.11',
    titel: "Verordnung des Obergerichts über die Fähigkeitsprüfung für den Anwaltsberuf",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_11-2006_06_21-2007_01_01-082.html`,
  },
  {
    nr: '215.12',
    titel: "Verordnung des Obergerichts über die Gebühren, Kosten und Entschädigungen gemäss Anwaltsgesetz",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_12-2006_06_21-2007_01_01-055.html`,
  },
  {
    nr: '215.21',
    titel: "Verordnung des Obergerichts über die Durchführung der Wahl der durch die Anwaltschaft zu wählenden Mitglieder und Ersatzmitglieder der Aufsichtskommission",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_21-2004_12_15-2005_01_01-071.html`,
  },
  {
    nr: '215.22',
    titel: "Verordnung des Obergerichts über die Entschädigung der Mitglieder der Aufsichtskommission",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_22-2004_12_15-2005_01_01-091.html`,
  },
  {
    nr: '215.111',
    titel: "Verordnung des Obergerichts über die Entschädigung der Mitglieder der Anwaltsprüfungskommission",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-215_111-2006_06_21-2007_01_01-126.html`,
  },
  {
    nr: '230',
    titel: "Einführungsgesetz zum Schweizerischen Zivilgesetzbuch (EG ZGB)",
    kuerzel: "EG ZGB",
    registryUrl: `${BASIS}erlass-230-1911_04_02-1912_01_01-133.html`,
  },
  {
    nr: '230.5',
    titel: "Verordnung über die elektronische Überwachung zum Schutz gewaltbetroffener Personen (VeÜ)",
    kuerzel: "VeÜ",
    registryUrl: `${BASIS}erlass-230_5-2021_10_27-2022_01_01-115.html`,
  },
  {
    nr: '230.31',
    titel: "Vollziehungsverordnung zum Bundesgesetz über Voraussetzungen und Verfahren bei Sterilisationen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-230_31-2012_11_07-2013_01_01-079.html`,
  },
  {
    nr: '231.1',
    titel: "Kantonale Zivilstandsverordnung (ZVO)",
    kuerzel: "ZVO",
    registryUrl: `${BASIS}erlass-231_1-2004_12_01-2005_01_01-127.html`,
  },
  {
    nr: '231.13',
    titel: "Vereinbarung zwischen den Regierungsräten der Kantone Aargau und Zürich betreffend Zivilstandsdienst der Gemeinde Bergdietikon",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-231_13-2004_03_23-2004_09_01-046.html`,
  },
  {
    nr: '232.3',
    titel: "Einführungsgesetz zum Kindes- und Erwachsenenschutzrecht (EG KESR)",
    kuerzel: "EG KESR",
    registryUrl: `${BASIS}erlass-232_3-2012_06_25-2013_01_01-115.html`,
  },
  {
    nr: '232.32',
    titel: "Verordnung über den elektronischen Zugriff der Kindes- und Erwachsenenschutzbehörden auf die Einwohnerregister",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-232_32-2012_12_19-2013_04_01-080.html`,
  },
  {
    nr: '232.35',
    titel: "Verordnung über Entschädigung und Spesenersatz bei Beistandschaften (ESBV)",
    kuerzel: "ESBV",
    registryUrl: `${BASIS}erlass-232_35-2012_10_03-2013_01_01-079.html`,
  },
  {
    nr: '232.351',
    titel: "Verordnung über die Entschädigung der Fachärztinnen und Fachärzte bei der fürsorgerischen Unterbringung freiwillig Eingetretener",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-232_351-2016_11_15-2017_03_01-096.html`,
  },
  {
    nr: '234.1',
    titel: "Einführungsgesetz zum Bundesgesetz über den Erwerb von Grundstücken durch Personen im Ausland (EG BewG)",
    kuerzel: "EG BewG",
    registryUrl: `${BASIS}erlass-234_1-1988_12_04-1989_01_01-071.html`,
  },
  {
    nr: '234.3',
    titel: "Verordnung über die Meldestelle für gefundene Tiere",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-234_3-2005_03_09-2005_05_01-049.html`,
  },
  {
    nr: '234.12',
    titel: "Verordnung zum Einführungsgesetz zum Bundesgesetz über den Erwerb von Grundstücken durch Personen im Ausland (VBewG)",
    kuerzel: "VBewG",
    registryUrl: `${BASIS}erlass-234_12-2010_05_19-2010_07_01-099.html`,
  },
  {
    nr: '235.3',
    titel: "Einführungsgesetz zum Bundesgesetz über Rahmenmietverträge und deren Allgemeinverbindlicherklärung",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-235_3-1998_06_07-1999_01_01-023.html`,
  },
  {
    nr: '235.15',
    titel: "Verordnung des Obergerichts über das Verfahren bei freiwilligen öffentlichen Versteigerungen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-235_15-1979_12_19-1980_01_25-105.html`,
  },
  {
    nr: '235.41',
    titel: "Beschluss des Regierungsrates über die Formularpflicht beim Abschluss eines neuen Mietvertrages",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-235_41-2013_09_11-2013_11_01-083.html`,
  },
  {
    nr: '235.52',
    titel: "Beschluss des Regierungsrates über die Zuständigkeit für die Bewilligung zur Ausgabe von Warenpapieren",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-235_52-1937_08_05-1937_08_13-091.html`,
  },
  {
    nr: '242',
    titel: "Notariatsgesetz (NotG)",
    kuerzel: "NotG",
    registryUrl: `${BASIS}erlass-242-1985_06_09-1989_01_01-095.html`,
  },
  {
    nr: '242.1',
    titel: "Verordnung über den Erwerb des Wahlfähigkeitszeugnisses für Notarinnen und Notare (NotPV)",
    kuerzel: "NotPV",
    registryUrl: `${BASIS}erlass-242_1-2013_09_04-2014_01_01-083.html`,
  },
  {
    nr: '242.2',
    titel: "Verordnung des Obergerichtes über die Geschäftsführung der Notariate (Notariatsverordnung)",
    kuerzel: "Notariatsverordnung",
    registryUrl: `${BASIS}erlass-242_2-1960_11_23-1961_01_01-093.html`,
  },
  {
    nr: '242.5',
    titel: "Beschluss des Kantonsrates über die Notariatskreise und den Sitz der Notariate",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-242_5-1988_11_07-1989_01_01-119.html`,
  },
  {
    nr: '242.15',
    titel: "Verordnung über die Voraussetzungen der Erteilung der erweiterten Befugnisse an Beamte und Angestellte der Notariate sowie die Durchführung der Fachprüfungen (Weiterbildungsverordnung)",
    kuerzel: "Weiterbildungsverordnung",
    registryUrl: `${BASIS}erlass-242_15-1988_12_14-1989_01_01-091.html`,
  },
  {
    nr: '242.25',
    titel: "Verordnung über die Notariatsverwaltung (Notariatsverwaltungsverordnung)",
    kuerzel: "Notariatsverwaltungsverordnung",
    registryUrl: `${BASIS}erlass-242_25-1999_12_08-2001_01_01-093.html`,
  },
  {
    nr: '242.26',
    titel: "Verordnung des Obergerichts über die Rechnungs- und Kassenführung im Notariatswesen (Rechnungswesenverordnung)",
    kuerzel: "Rechnungswesenverordnung",
    registryUrl: `${BASIS}erlass-242_26-2003_06_25-2003_07_01-093.html`,
  },
  {
    nr: '243',
    titel: "Notariatsgebührenverordnung (NotGebV)",
    kuerzel: "NotGebV",
    registryUrl: `${BASIS}erlass-243-2009_03_09-2009_07_01-123.html`,
  },
  {
    nr: '244',
    titel: "Verordnung über die Archive der Notariate",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-244-2011_12_07-2012_05_01-077.html`,
  },
  {
    nr: '245',
    titel: "Übereinkunft zwischen den Kantonen Zürich und Thurgau betreffend die neue Feststellung der notarialischen Fertigungsgrenze für die auf der Kantonsgrenze Zürich&#8211;Thurgau liegenden Grundstücke der Gemeinden Ossingen, Waltalingen, zürcherisch Wilen und Oberneunforn",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-245-1907_10_18-1907_11_30-091.html`,
  },
  {
    nr: '252',
    titel: "Verordnung des Obergerichtes über die Geschäftsführung der Grundbuchämter und die Einführung des eidgenössischen Grundbuches (Kantonale Grundbuchverordnung)",
    kuerzel: "Kantonale Grundbuchverordnung",
    registryUrl: `${BASIS}erlass-252-1958_03_26-1958_07_01-127.html`,
  },
  {
    nr: '252.1',
    titel: "Verordnung des Obergerichtes über die Grundbuchführung betreffend die Korporationsteilrechte",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-252_1-1916_04_19-1916_04_19-091.html`,
  },
  {
    nr: '252.5',
    titel: "Übereinkunft zwischen den Kantonen Zürich und Thurgau betreffend die Beurkundung und die grundbuchliche Behandlung von Rechtsgeschäften über Grundstücke, die in beiden Kantonen liegen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-252_5-1926_12_24-1927_02_04-091.html`,
  },
  {
    nr: '281',
    titel: "Einführungsgesetz zum Bundesgesetz über Schuldbetreibung und Konkurs (EG SchKG)",
    kuerzel: "EG SchKG",
    registryUrl: `${BASIS}erlass-281-2007_11_26-2010_07_01-134.html`,
  },
  {
    nr: '281.1',
    titel: "Verordnung über die Betreibungs- und Gemeindeammannämter (VBG)",
    kuerzel: "VBG",
    registryUrl: `${BASIS}erlass-281_1-2010_05_12-2010_07_01-071.html`,
  },
  {
    nr: '281.2',
    titel: "Verordnung des Obergerichtes über die Geschäftsführung der Konkursämter (Kantonale Konkursverordnung)",
    kuerzel: "Kantonale Konkursverordnung",
    registryUrl: `${BASIS}erlass-281_2-1998_12_09-1999_01_01-071.html`,
  },
  {
    nr: '281.11',
    titel: "Verordnung über die Gebühren der Gemeindeammannämter (GebV GA)",
    kuerzel: "GebV GA",
    registryUrl: `${BASIS}erlass-281_11-2018_08_22-2019_05_01-105.html`,
  },
  {
    nr: '281.41',
    titel: "Stadtammannamts- und Betreibungskreise Winterthur  (Neueinteilung)",
    kuerzel: "Neueinteilung",
    registryUrl: `${BASIS}erlass-281_41-2006_04_19-2006_07_01-053.html`,
  },
  {
    nr: '281.51',
    titel: "Verordnung des Obergerichts über den Wahlfähigkeitsausweis für Betreibungsbeamtinnen und Betreibungsbeamte",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-281_51-2008_06_18-2009_01_01-091.html`,
  },
  {
    nr: '283.1',
    titel: "Übereinkunft zwischen der Schweizerischen Eidgenossenschaft und der Krone Württemberg betreffend die Konkursverhältnisse und gleiche Behandlung der beiderseitigen Staatsangehörigen in Konkursfällen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-283_1-1825_12_12-1826_05_13-081.html`,
  },
  {
    nr: '283.2',
    titel: "Übereinkunft zwischen den schweizerischen Kantonen Zürich, Bern, Luzern, Unterwalden (ob und nid dem Wald), Freiburg, Solothurn, Basel (Stadt- und Landteil), Schaffhausen, St. Gallen, Graubünden, Aargau, Thurgau, Tessin, Waadt, Wallis, Neuenburg, Genf sowie Appenzell AR und dem Königreich Bayern über gleichmässige Behandlung der gegenseitigen Staatsangehörigen in Konkursfällen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-283_2-1834_05_11-1834_06_27-081.html`,
  },
  {
    nr: '312',
    titel: "Gesetz betreffend die Ordnungsstrafen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-312-1866_10_30-1866_10_30-071.html`,
  },
  {
    nr: '315.1',
    titel: "Verordnung über die Kommission zur Bekämpfung von Menschenhandel (Runder Tisch Menschenhandel, VRTM)",
    kuerzel: "Runder Tisch Menschenhandel, VRTM",
    registryUrl: `${BASIS}erlass-315_1-2021_10_06-2022_01_01-115.html`,
  },
  {
    nr: '321.1',
    titel: "Verordnung über die Zuständigkeit der Gemeinden im Übertretungsstrafrecht",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-321_1-2010_11_03-2011_01_01-091.html`,
  },
  {
    nr: '321.2',
    titel: "Kantonale Ordnungsbussenverordnung (KOBV)",
    kuerzel: "KOBV",
    registryUrl: `${BASIS}erlass-321_2-2019_12_10-2020_01_01-131.html`,
  },
  {
    nr: '321.3',
    titel: "Verordnung über den Einsatz des Einzelgerichts als Zwangsmassnahmengericht in Haftsachen (Haftrichterverordnung)",
    kuerzel: "Haftrichterverordnung",
    registryUrl: `${BASIS}erlass-321_3-2010_09_08-2011_01_01-071.html`,
  },
  {
    nr: '321.4',
    titel: "Verordnung über psychiatrische und psychologische Gutachten in Straf- und Zivilverfahren (PPGV)",
    kuerzel: "PPGV",
    registryUrl: `${BASIS}erlass-321_4-2010_09_01-2011_03_01-133.html`,
  },
  {
    nr: '321.5',
    titel: "DNA-Verordnung (DNAV)",
    kuerzel: "DNAV",
    registryUrl: `${BASIS}erlass-321_5-2005_06_08-2005_07_01-126.html`,
  },
  {
    nr: '321.6',
    titel: "Verordnung über die Mediation im Jugendstrafverfahren",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-321_6-2010_11_03-2011_01_01-071.html`,
  },
  {
    nr: '322',
    titel: "Verordnung über die Jugendstrafrechtspflege (JStV)",
    kuerzel: "JStV",
    registryUrl: `${BASIS}erlass-322-2006_11_29-2007_01_01-079.html`,
  },
  {
    nr: '322.2',
    titel: "Beschluss des Regierungsrates über die Amtskreise der Jugendanwaltschaften",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-322_2-2007_05_23-2007_06_01-057.html`,
  },
  {
    nr: '323.1',
    titel: "Verordnung über die Gebühren, Auslagen und Entschädigungen der Strafverfolgungsbehörden (GebV StrV)",
    kuerzel: "GebV StrV",
    registryUrl: `${BASIS}erlass-323_1-2010_11_24-2011_01_01-103.html`,
  },
  {
    nr: '326',
    titel: "Reglement für das Kriminalistische Institut des Kantons Zürich",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-326-1961_03_16-1961_04_07-115.html`,
  },
  {
    nr: '331',
    titel: "Straf- und Justizvollzugsgesetz (StJVG)",
    kuerzel: "StJVG",
    registryUrl: `${BASIS}erlass-331-2006_06_19-2007_01_01-109.html`,
  },
  {
    nr: '331.1',
    titel: "Justizvollzugsverordnung (JVV)",
    kuerzel: "JVV",
    registryUrl: `${BASIS}erlass-331_1-2006_12_06-2007_01_01-129.html`,
  },
  {
    nr: '331.5',
    titel: "Kantonale Verordnung über das Strafregister-Informationssystem VOSTRA (KStReV)",
    kuerzel: "KStReV",
    registryUrl: `${BASIS}erlass-331_5-2024_06_12-2024_10_01-126.html`,
  },
  {
    nr: '334',
    titel: "Beschluss des Regierungsrates betreffend Zustimmung zum Konkordat der ostschweizerischen Kantone über den Vollzug von Strafen und Massnahmen vom 29. Oktober 2004",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-334-2006_12_13-2007_01_01-055.html`,
  },
  {
    nr: '341',
    titel: "Einführungsgesetz zum Opferhilfegesetz (EG OHG)",
    kuerzel: "EG OHG",
    registryUrl: `${BASIS}erlass-341-1995_06_25-1996_01_01-124.html`,
  },
  {
    nr: '341.1',
    titel: "Kantonale Opferhilfeverordnung (KOHV)",
    kuerzel: "KOHV",
    registryUrl: `${BASIS}erlass-341_1-2013_04_30-2013_07_01-124.html`,
  },
  {
    nr: '351',
    titel: "Gewaltschutzgesetz (GSG)",
    kuerzel: "GSG",
    registryUrl: `${BASIS}erlass-351-2006_06_19-2007_04_01-127.html`,
  },
  {
    nr: '550.1',
    titel: "Polizeigesetz (PolG)",
    kuerzel: "PolG",
    registryUrl: `${BASIS}erlass-550_1-2007_04_23-2009_07_01-131.html`,
  },
  {
    nr: '611',
    titel: "Gesetz über Controlling und Rechnungslegung (CRG)",
    kuerzel: "CRG",
    registryUrl: `${BASIS}erlass-611-2006_01_09-2008_04_01-118.html`,
  },
  {
    nr: '611.1',
    titel: "Rechnungslegungsverordnung (RLV)",
    kuerzel: "RLV",
    registryUrl: `${BASIS}erlass-611_1-2007_08_29-2008_04_01-115.html`,
  },
  {
    nr: '611.2',
    titel: "Finanzcontrollingverordnung (FCV)",
    kuerzel: "FCV",
    registryUrl: `${BASIS}erlass-611_2-2008_03_05-2008_04_01-119.html`,
  },
  {
    nr: '612',
    titel: "Lotteriefondsgesetz (LFG)",
    kuerzel: "LFG",
    registryUrl: `${BASIS}erlass-612-2020_11_02-2021_01_01-111.html`,
  },
  {
    nr: '612.1',
    titel: "Verordnung über den Gemeinnützigen Fonds (VGF)",
    kuerzel: "VGF",
    registryUrl: `${BASIS}erlass-612_1-2020_12_09-2021_01_01-111.html`,
  },
  {
    nr: '612.2',
    titel: "Sportfondsverordnung (SfV)",
    kuerzel: "SfV",
    registryUrl: `${BASIS}erlass-612_2-2020_12_09-2021_01_01-111.html`,
  },
  {
    nr: '612.3',
    titel: "Kulturfondsverordnung (KufV)",
    kuerzel: "KufV",
    registryUrl: `${BASIS}erlass-612_3-2021_02_24-2021_01_01-112.html`,
  },
  {
    nr: '612.4',
    titel: "Denkmalpflegefondsverordnung (DPFV)",
    kuerzel: "DPFV",
    registryUrl: `${BASIS}erlass-612_4-2021_12_15-2022_03_01-116.html`,
  },
  {
    nr: '614',
    titel: "Finanzkontrollgesetz (FKG)",
    kuerzel: "FKG",
    registryUrl: `${BASIS}erlass-614-2000_10_30-2001_07_01-125.html`,
  },
  {
    nr: '615',
    titel: "Gesetz über den Beitritt zur Rahmenvereinbarung für die interkantonale Zusammenarbeit mit Lastenausgleich",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-615-2007_02_12-2007_07_01-057.html`,
  },
  {
    nr: '631.1',
    titel: "Steuergesetz (StG)",
    kuerzel: "StG",
    registryUrl: `${BASIS}erlass-631_1-1997_06_08-1999_01_01-132.html`,
  },
  {
    nr: '631.11',
    titel: "Verordnung zum Steuergesetz (StV)",
    kuerzel: "StV",
    registryUrl: `${BASIS}erlass-631_11-1998_04_01-1999_01_01-108.html`,
  },
  {
    nr: '631.19',
    titel: "Verordnung über den Vollzug des Unternehmenssteuerreformgesetzes II des Bundes",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_19-2010_11_03-2011_01_01-078.html`,
  },
  {
    nr: '631.21',
    titel: "Beschluss des Kantonsrates über die Festsetzung des Steuerfusses für die Jahre 2026 und 2027",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_21-2025_12_15-2026_01_01-132.html`,
  },
  {
    nr: '631.32',
    titel: "Weisung des Regierungsrates an die Steuerbehörden über die Bewertung von Liegenschaften und die Festsetzung der Eigenmietwerte ab Steuerperiode 2026 (Weisung 2026)",
    kuerzel: "Weisung 2026",
    registryUrl: `${BASIS}erlass-631_32-2024_08_28-2026_01_01-131.html`,
  },
  {
    nr: '631.33',
    titel: "Verfügung der Finanzdirektion über die Pauschalierung von Berufsauslagen Unselbstständigerwerbender bei der Steuereinschätzung (ab Steuerperiode 2026)",
    kuerzel: "ab Steuerperiode 2026",
    registryUrl: `${BASIS}erlass-631_33-2025_09_26-2026_01_01-131.html`,
  },
  {
    nr: '631.41',
    titel: "Verordnung über die Quellensteuer für ausländische Arbeitnehmer (Quellensteuerverordnung I)",
    kuerzel: "Quellensteuerverordnung I",
    registryUrl: `${BASIS}erlass-631_41-1994_02_02-1995_01_01-111.html`,
  },
  {
    nr: '631.42',
    titel: "Verordnung über die Quellensteuer für natürliche und juristische Personen ohne steuerrechtlichen Wohnsitz oder Aufenthalt in der Schweiz (Quellensteuerverordnung II)",
    kuerzel: "Quellensteuerverordnung II",
    registryUrl: `${BASIS}erlass-631_42-1994_02_02-1995_01_01-111.html`,
  },
  {
    nr: '631.43',
    titel: "Verordnung über die elektronische Einreichung von Quellensteuerdaten",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_43-2014_09_15-2015_01_01-087.html`,
  },
  {
    nr: '631.51',
    titel: "Verordnung über die Organisation des kantonalen Steueramtes (OV KStA)",
    kuerzel: "OV KStA",
    registryUrl: `${BASIS}erlass-631_51-2024_03_27-2024_06_01-125.html`,
  },
  {
    nr: '631.53',
    titel: "Organisationsverordnung des Steuerrekursgerichts (OV StRG)",
    kuerzel: "OV StRG",
    registryUrl: `${BASIS}erlass-631_53-2010_11_12-2011_01_01-122.html`,
  },
  {
    nr: '631.55',
    titel: "Weisung der Finanzdirektion über das Meldeverfahren der gegenüber Steuerbehörden zur Auskunft und Anzeige verpflichteten Verwaltungsbehörden, Strafuntersuchungsbehörden und Gerichte",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_55-1999_11_29-1999_11_29-027.html`,
  },
  {
    nr: '631.61',
    titel: "Beschluss des Regierungsrates über die Festsetzung des Skontos und die Berechnung von Zinsen für Staats- und Gemeindesteuern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_61-1998_10_14-1999_01_01-035.html`,
  },
  {
    nr: '631.62',
    titel: "Beschluss des Regierungsrates über die Durchführung des Rekursverfahrens bei Steuererlass",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_62-2016_03_02-2016_07_01-093.html`,
  },
  {
    nr: '631.121',
    titel: "Verordnung über die elektronische Einreichung der Steuererklärung",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_121-2011_10_18-2013_01_01-129.html`,
  },
  {
    nr: '631.122',
    titel: "Verordnung über die elektronische Zustellung von Verfügungen und Rechnungen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_122-2012_09_07-2012_12_01-079.html`,
  },
  {
    nr: '631.321',
    titel: "Übergangsregelung zur Weisung des Regierungsrates an die Steuerbehörden über die Bewertung von Liegenschaften und die Festsetzung der Eigenmietwerte ab Steuerperiode 2026 (Weisung 2026)",
    kuerzel: "Weisung 2026",
    registryUrl: `${BASIS}erlass-631_321-2025_11_12-2026_01_01-131.html`,
  },
  {
    nr: '631.322',
    titel: "Weisung des Regierungsrates an die Steuerbehörden über die Gewährung eines Härtefalleinschlags auf dem Eigenmietwert bei den Staats- und Gemeindesteuern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_322-2026_02_25-2026_01_01-132.html`,
  },
  {
    nr: '631.421',
    titel: "Verordnung der Finanzdirektion über die Tarife für quellensteuerpflichtige Arbeitnehmerinnen und Arbeitnehmer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_421-2020_09_10-2021_01_01-132.html`,
  },
  {
    nr: '631.423',
    titel: "Verordnung der Finanzdirektion über die Steuerfreibeträge von quellensteuerpflichtigen Personen ohne steuerrechtlichen Wohnsitz oder Aufenthalt in der Schweiz",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_423-2020_09_10-2021_01_01-111.html`,
  },
  {
    nr: '631.424',
    titel: "Verordnung über die Bezugsprovision im Quellensteuerverfahren",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_424-2020_09_10-2021_01_01-111.html`,
  },
  {
    nr: '631.531',
    titel: "Beschluss des Kantonsrates über den Sitz des Steuerrekursgerichts sowie die Zahl und den Beschäftigungsgrad seiner Mitglieder und Ersatzmitglieder",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_531-2010_12_13-2011_01_01-071.html`,
  },
  {
    nr: '631.611',
    titel: "Beschluss des Regierungsrates über die Festsetzung und Berechnung der Zinsen für die Staats- und Gemeindesteuern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-631_611-2007_07_11-2008_01_01-131.html`,
  },
  {
    nr: '632.1',
    titel: "Erbschafts- und Schenkungssteuergesetz (ESchG)",
    kuerzel: "ESchG",
    registryUrl: `${BASIS}erlass-632_1-1986_09_28-1987_01_01-071.html`,
  },
  {
    nr: '632.11',
    titel: "Verordnung zum Erbschafts- und Schenkungssteuergesetz",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-632_11-1986_11_12-1987_01_01-070.html`,
  },
  {
    nr: '632.111',
    titel: "Verfügung der Finanzdirektion über die Berechnung von Zinsen für Erbschafts- und Schenkungssteuern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-632_111-2003_08_15-2003_10_01-042.html`,
  },
  {
    nr: '634.1',
    titel: "Verordnung über die Durchführung des Bundesgesetzes über die direkte Bundessteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-634_1-1998_11_04-1999_01_01-125.html`,
  },
  {
    nr: '634.2',
    titel: "Verordnung über die Rückerstattung der Verrechnungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-634_2-1997_12_17-1999_01_01-095.html`,
  },
  {
    nr: '634.3',
    titel: "Verordnung über die Durchführung der Anrechnung ausländischer Quellensteuern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-634_3-1967_12_07-1968_01_01-107.html`,
  },
  {
    nr: '634.5',
    titel: "Kantonale Verordnung über die Wehrpflichtersatzabgabe (KWPEV)",
    kuerzel: "KWPEV",
    registryUrl: `${BASIS}erlass-634_5-2004_05_26-2004_07_01-070.html`,
  },
  {
    nr: '634.41',
    titel: "Verordnung über die Rückerstattung des zusätzlichen Steuerrückbehaltes auf Dividenden und Zinsen von amerikanischen Gesellschaften und Obligationenschuldnern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-634_41-1952_03_13-1952_03_31-083.html`,
  },
  {
    nr: '671.1',
    titel: "Konkordat zwischen den Kantonen der Schweizerischen Eidgenossenschaft über den Ausschluss von Steuerabkommen",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-671_1-1948_12_10-1949_10_06-091.html`,
  },
  {
    nr: '672.601',
    titel: "Gegenrechtserklärungen zwischen dem Kanton Bern und dem Kanton Zürich betreffend Befreiung von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_601-1926_07_16-1927_09_29-091.html`,
  },
  {
    nr: '672.602',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Zürich einerseits und dem Regierungsrat des Kantons Luzern anderseits betreffend Steuerbefreiung für Zuwendungen von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_602-1929_06_11-1929_07_15-091.html`,
  },
  {
    nr: '672.603',
    titel: "Gegenrechtsvereinbarung zwischen dem Kanton Zürich und dem Kanton Uri über die Befreiung von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_603-1980_05_21-1980_06_02-091.html`,
  },
  {
    nr: '672.606',
    titel: "Gegenrechtsvereinbarung zwischen dem Kanton Zürich und dem Kanton Obwalden über die Befreiung von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_606-1987_08_19-1987_08_25-091.html`,
  },
  {
    nr: '672.607',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Zürich einerseits und dem Regierungsrat des Kantons Glarus anderseits betreffend Steuerbefreiung für Zuwendungen von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_607-1931_04_02-1931_04_02-091.html`,
  },
  {
    nr: '672.608',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Zürich einerseits und dem Regierungsrat des Kantons Zug anderseits betreffend Steuerbefreiung für Zuwendungen von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_608-1931_01_17-1931_01_29-091.html`,
  },
  {
    nr: '672.609',
    titel: "Vereinbarung zwischen dem Staatsrat des Kantons Freiburg und dem Regierungsrat des Kantons Zürich betreffend Gegenrecht über Steuerbefreiungen im Schenkungs- und Erbschaftssteuerverfahren",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_609-1944_10_26-1944_10_31-091.html`,
  },
  {
    nr: '672.610',
    titel: "Gegenrechtsvereinbarung zwischen den Kantonen Zürich und Solothurn über die Befreiung von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_610-1982_05_26-1982_08_10-091.html`,
  },
  {
    nr: '672.611',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Basel-Stadt einerseits und dem Regierungsrat des Kantons Zürich anderseits betreffend Steuerbefreiung für Zuwendungen von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_611-1926_05_15-1926_05_26-091.html`,
  },
  {
    nr: '672.612',
    titel: "Gegenrechtserklärung zwischen dem Regierungsrat des Kantons Basel-Landschaft und dem Regierungsrat des Kantons Zürich über die Befreiung von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_612-1952_01_25-1952_02_07-091.html`,
  },
  {
    nr: '672.613',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Schaffhausen einerseits und dem Regierungsrat des Kantons Zürich anderseits betreffend Befreiung von der Erbschafts- oder Schenkungsabgabe auf Zuwendungen für gemeinnützige Zwecke",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_613-1928_11_15-1928_12_08-091.html`,
  },
  {
    nr: '672.614',
    titel: "Gegenrechtsvereinbarung zwischen dem Regierungsrat des Kantons Zürich und dem Regierungsrat des Kantons Appenzell AR über die Steuerbefreiung von Zuwendungen für öffentliche, gemeinnützige, wohltätige, religiöse oder wissenschaftliche Zwecke auf dem Gebiete der Erbschafts-, Vermächtnis- und Schenkungssteuern",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_614-1968_12_05-1969_01_20-091.html`,
  },
  {
    nr: '672.615',
    titel: "Gegenrechtsvereinbarung zwischen dem Kanton Zürich und dem Kanton Appenzell I. Rh. über die Befreiung von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_615-1981_10_14-1981_11_03-018.html`,
  },
  {
    nr: '672.616',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Zürich und dem Regierungsrat des Kantons St. Gallen betreffend Steuerbefreiung für Zuwendungen an gemeinnützige, wohltätige oder kirchliche Zwecke",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_616-1964_06_30-1964_07_23-091.html`,
  },
  {
    nr: '672.617',
    titel: "Gegenrechtsvereinbarung zwischen dem Kleinen Rat des Kantons Graubünden und dem Regierungsrat des Kantons Zürich über die Befreiung von Zuwendungen zu öffentlichen, gemeinnützigen oder wohltätigen Zwecken von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_617-1955_10_13-1955_10_27-090.html`,
  },
  {
    nr: '672.618',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Aargau und dem Regierungsrat des Kantons Zürich über Befreiungen von der Erbschafts- und Schenkungssteuer für Zuwendungen zu öffentlichen oder gemeinnützigen Zwecken",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_618-1949_07_29-1949_08_18-091.html`,
  },
  {
    nr: '672.619',
    titel: "Vereinbarung zwischen dem Regierungsrat des Kantons Thurgau einerseits und dem Regierungsrat des Kantons Zürich anderseits betreffend Steuerbefreiung für Zuwendungen von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_619-1926_05_29-1926_06_10-091.html`,
  },
  {
    nr: '672.621',
    titel: "Gegenrechtsvereinbarung zwischen den Kantonen Zürich und Waadt über die Befreiung von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_621-1982_05_26-1982_07_14-091.html`,
  },
  {
    nr: '672.622',
    titel: "Gegenrechtsvereinbarung zwischen den Kantonen Wallis und Zürich betreffend die Befreiung von der Erbschafts- und Schenkungssteuer für Zuwendungen an gemeinnützige oder kirchliche Zwecke",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_622-1978_08_30-1978_10_05-091.html`,
  },
  {
    nr: '672.623',
    titel: "Vereinbarung zwischen dem Staatsrat der Republik und des Kantons Neuenburg und dem Regierungsrat des Kantons Zürich betreffend Befreiung von Zuwendungen von der Erbschafts- und Schenkungssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_623-1960_10_13-1960_02_01-091.html`,
  },
  {
    nr: '672.625',
    titel: "Gegenrechtserklärung zwischen dem Regierungsrat des Kantons Jura und dem Regierungsrat des Kantons Zürich betreffend Befreiung von der Erbschaftssteuer",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-672_625-1979_04_25-1979_04_25-091.html`,
  },
  {
    nr: '673.11',
    titel: "Gegenrechtserklärung des Regierungsrates über die Befreiung von Zuwendungen an Institutionen mit besonderen Zwecken in den Vereinigten Staaten von Amerika",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-673_11-1953_06_25-1953_06_25-091.html`,
  },
  {
    nr: '673.12',
    titel: "Vereinbarung zwischen dem Schweizerischen Bundesrat und der Regierung der Französischen Republik über die steuerliche Behandlung von Zuwendungen zu ausschliesslich uneigennützigen Zwecken",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-673_12-1979_10_30-1979_10_30-090.html`,
  },
  {
    nr: '682',
    titel: "Gebührenordnung für die Verwaltungsbehörden",
    kuerzel: "",
    registryUrl: `${BASIS}erlass-682-1966_06_30-1966_10_01-099.html`,
  },
  {
    nr: '691',
    titel: "Gesetz über das Salzregal und über den Beitritt des Kantons Zürich zur Interkantonalen Vereinbarung über den Salzverkauf in der Schweiz (Salzgesetz)",
    kuerzel: "Salzgesetz",
    registryUrl: `${BASIS}erlass-691-1974_09_22-1975_10_01-055.html`,
  },
  {
    nr: '700.1',
    titel: "Planungs- und Baugesetz (PBG)",
    kuerzel: "PBG",
    registryUrl: `${BASIS}erlass-700_1-1975_09_07-1976_04_01-134.html`,
  },
  {
    nr: '851.1',
    titel: "Sozialhilfegesetz (SHG)",
    kuerzel: "SHG",
    registryUrl: `${BASIS}erlass-851_1-1981_06_14-1982_01_01-123.html`,
  },
];
