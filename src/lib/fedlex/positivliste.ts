// ─── Fedlex · Achse 3a: Erlassnamen-Positivliste (V-7/V-8, W2·20-VERWEIS-SCHAERFE) ───
//
// Drei KURATIERTE Tabellen, die ausgeschriebene oder abweichend geschriebene
// Nennungen eines Bundeserlasses deterministisch auf den FEDLEX-Key abbilden.
// Keine Heuristik, kein Fuzzy-Matching (§1: kein Link ist besser als ein
// falscher) — jeder Eintrag ist ein Identitäts-Treffer mit Wortgrenze und
// trägt seinen Beleg. Wächter: `src/tests/fedlex-positivliste.test.ts` prüft
// jeden Eintrag gegen das Bund-Register (`public/normtext/register.json`,
// Titel aus der Fedlex-Extraktion mit `quelleUrl`/`stand`) bzw. gegen die
// FEDLEX-URL des Ziels — ein Eintrag ohne belegbaren Anker reisst das Tor.
//
// Kette ohne Zyklus: tabelle ← positivliste ← erkennung ← parser.
//
// Anlass (Messung 1.9.2026, Basislinie messwerte/verweis-inventar.json auf
// main 70002a287): 1 281 «Art. N des/der …»-Stellen und 916 «§ N des/der …»-
// Stellen fielen pauschal in den des/der-Guard (TEXT); 601 «Art. N KÜRZEL»-
// Stellen blieben unerkannt, weil der Text die AMTLICHE Schreibweise («BankG»,
// «AsylG», «FinfraG») trägt, die FEDLEX-Tabelle aber den Grossbuchstaben-Key.
// Gemessen ausserdem EIN falscher Link auf main: BE-154.21 «Artikel 21 des
// Datenschutzgesetzes vom 19. Februar 1986 (KDSG)» sprang auf das Bundes-DSG —
// das kantonale Datenschutzgesetz (AR-146.1, BE KDSG) trägt denselben Namen.
// Darum die GELTUNG je Eintrag: Kurznamen, die auch ein kantonaler Erlass tragen
// kann, lösen NUR in Bundeserlassen auf (`bund`); amtliche Volltitel
// («Bundesgesetzes über …») sind ebenenübergreifend eindeutig (`alle`).

import { FEDLEX, type FedlexGesetz } from './tabelle';

/** Ebene des LESENDEN Erlasses — steuert, welche Kurznamen auflösen dürfen. */
export type FremdEbene = 'bund' | 'kanton';
/** `alle` = in jedem Erlass eindeutig · `bund` = nur in Bundeserlassen (ein
 *  gleichnamiger kantonaler Erlass ist möglich oder belegt). */
export type Geltung = 'alle' | 'bund';

export interface GenitivEintrag {
  /** Genitiv-Form, wie sie nach «des/der» im Text steht (exakt, Wortgrenze). */
  name: string;
  gesetz: FedlexGesetz;
  geltung: Geltung;
  /** Beleg: Teilstring des Bund-Register-Titels (Fedlex-Kurztitel) ODER die
   *  FEDLEX-URL des Ziels, wenn das Register den Kurztitel nicht führt. */
  beleg: string;
}

// ─── V-7a · Kurztitel-Genitive ───────────────────────────────────────────────
//
// Bestand bis 31.8.2026 (26 Einträge, A10/A11 David 5.7.2026, verifiziert
// 2026-07-10 gegen `kopf.titel`) — jetzt mit Geltung und Beleg. Neu (1.9.2026)
// die im Korpus gemessenen Kurztitel ohne Klammer-Kürzel; Kandidaten OHNE
// FEDLEX-Ziel (Gaststaatgesetz, Nachrichtendienstgesetz, Zollgesetz,
// Subventionsgesetz, Revisionsaufsichtsgesetz …) bleiben bewusst draussen —
// Tabellen-Ausbau ist ein eigener Schritt, kein Raten.
const U = (g: FedlexGesetz): string => FEDLEX[g];
export const GENITIV_EINTRAEGE: ReadonlyArray<GenitivEintrag> = [
  // Verfassung, Kodifikationen, Prozessordnungen — ebenenübergreifend eindeutig.
  { name: 'Bundesverfassung', gesetz: 'BV', geltung: 'alle', beleg: 'Bundesverfassung' },
  { name: 'Strafgesetzbuches', gesetz: 'StGB', geltung: 'alle', beleg: 'Strafgesetzbuch' },
  { name: 'Strafgesetzbuchs', gesetz: 'StGB', geltung: 'alle', beleg: 'Strafgesetzbuch' },
  { name: 'Schweizerischen Strafgesetzbuches', gesetz: 'StGB', geltung: 'alle', beleg: 'Strafgesetzbuch' },
  { name: 'Schweizerischen Strafgesetzbuchs', gesetz: 'StGB', geltung: 'alle', beleg: 'Strafgesetzbuch' },
  { name: 'Militärstrafgesetzes', gesetz: 'MStG', geltung: 'alle', beleg: 'Militärstrafgesetz' },
  { name: 'Zivilgesetzbuches', gesetz: 'ZGB', geltung: 'alle', beleg: 'Zivilgesetzbuch' },
  { name: 'Zivilgesetzbuchs', gesetz: 'ZGB', geltung: 'alle', beleg: 'Zivilgesetzbuch' },
  { name: 'Schweizerischen Zivilgesetzbuches', gesetz: 'ZGB', geltung: 'alle', beleg: 'Zivilgesetzbuch' },
  { name: 'Schweizerischen Zivilgesetzbuchs', gesetz: 'ZGB', geltung: 'alle', beleg: 'Zivilgesetzbuch' },
  { name: 'Obligationenrechts', gesetz: 'OR', geltung: 'alle', beleg: 'Obligationenrecht' },
  { name: 'Schweizerischen Obligationenrechts', gesetz: 'OR', geltung: 'alle', beleg: 'Obligationenrecht' },
  { name: 'Strafprozessordnung', gesetz: 'StPO', geltung: 'alle', beleg: 'Strafprozessordnung' },
  { name: 'Schweizerischen Strafprozessordnung', gesetz: 'StPO', geltung: 'alle', beleg: 'Strafprozessordnung' },
  { name: 'Zivilprozessordnung', gesetz: 'ZPO', geltung: 'alle', beleg: 'Zivilprozessordnung' },
  { name: 'Schweizerischen Zivilprozessordnung', gesetz: 'ZPO', geltung: 'alle', beleg: 'Zivilprozessordnung' },
  { name: 'Schweizerischen Jugendstrafprozessordnung', gesetz: 'JStPO', geltung: 'alle', beleg: 'Jugendstrafprozessordnung' },
  { name: 'Bundesgerichtsgesetzes', gesetz: 'BGG', geltung: 'alle', beleg: 'Bundesgerichtsgesetz' },
  { name: 'Militärstrafprozesses', gesetz: 'MStP', geltung: 'alle', beleg: 'Militärstrafprozess' },
  // Bundesgesetze mit Kurztitel, die kein Kanton so nennt.
  { name: 'Asylgesetzes', gesetz: 'ASYLG', geltung: 'alle', beleg: 'Asylgesetz' },
  { name: 'Strassenverkehrsgesetzes', gesetz: 'SVG', geltung: 'alle', beleg: 'Strassenverkehrsgesetz' },
  { name: 'Versicherungsvertragsgesetzes', gesetz: 'VVG', geltung: 'alle', beleg: U('VVG') },
  { name: 'Freizügigkeitsgesetzes', gesetz: 'FZG', geltung: 'alle', beleg: 'Freizügigkeitsgesetz' },
  { name: 'Lebensmittelgesetzes', gesetz: 'LMG', geltung: 'alle', beleg: 'Lebensmittelgesetz' },
  { name: 'Fusionsgesetzes', gesetz: 'FusG', geltung: 'alle', beleg: 'Fusionsgesetz' },
  { name: 'Bundespersonalgesetzes', gesetz: 'BPG', geltung: 'alle', beleg: 'Bundespersonalgesetz' },
  { name: 'Unfallversicherungsgesetzes', gesetz: 'UVG', geltung: 'alle', beleg: U('UVG') },
  { name: 'Mehrwertsteuergesetzes', gesetz: 'MWSTG', geltung: 'alle', beleg: U('MWSTG') },
  { name: 'Kartellgesetzes', gesetz: 'KG', geltung: 'alle', beleg: 'Kartellgesetz' },
  { name: 'Bankengesetzes', gesetz: 'BANKG', geltung: 'alle', beleg: 'Bankengesetz' },
  { name: 'Finanzmarktaufsichtsgesetzes', gesetz: 'FINMAG', geltung: 'alle', beleg: 'Finanzmarktaufsichtsgesetz' },
  { name: 'Finanzmarktinfrastrukturgesetzes', gesetz: 'FINFRAG', geltung: 'alle', beleg: 'Finanzmarktinfrastrukturgesetz' },
  { name: 'Finanzinstitutsgesetzes', gesetz: 'FINIG', geltung: 'alle', beleg: 'Finanzinstitutsgesetz' },
  { name: 'Finanzdienstleistungsgesetzes', gesetz: 'FIDLEG', geltung: 'alle', beleg: 'Finanzdienstleistungsgesetz' },
  { name: 'Kollektivanlagengesetzes', gesetz: 'KAG', geltung: 'alle', beleg: 'Kollektivanlagengesetz' },
  { name: 'eidgenössischen Kollektivanlagengesetzes', gesetz: 'KAG', geltung: 'alle', beleg: 'Kollektivanlagengesetz' },
  { name: 'Versicherungsaufsichtsgesetzes', gesetz: 'VAG', geltung: 'alle', beleg: 'Versicherungsaufsichtsgesetz' },
  { name: 'Geldwäschereigesetzes', gesetz: 'GWG', geltung: 'alle', beleg: 'Geldwäschereigesetz' },
  { name: 'Bucheffektengesetzes', gesetz: 'BEG', geltung: 'alle', beleg: 'Bucheffektengesetz' },
  { name: 'Betäubungsmittelgesetzes', gesetz: 'BETMG', geltung: 'alle', beleg: 'Betäubungsmittelgesetz' },
  { name: 'Heilmittelgesetzes', gesetz: 'HMG', geltung: 'alle', beleg: 'Heilmittelgesetz' },
  { name: 'Epidemiengesetzes', gesetz: 'EpG', geltung: 'alle', beleg: 'Epidemiengesetz' },
  { name: 'Transplantationsgesetzes', gesetz: 'TxG', geltung: 'alle', beleg: 'Transplantationsgesetz' },
  { name: 'Militärgesetzes', gesetz: 'MG', geltung: 'alle', beleg: 'Militärgesetz' },
  { name: 'Partnerschaftsgesetzes', gesetz: 'PARTG', geltung: 'alle', beleg: 'Partnerschaftsgesetz' },
  { name: 'Jugendstrafgesetzes', gesetz: 'JSTG', geltung: 'alle', beleg: 'Jugendstrafgesetz' },
  { name: 'Opferhilfegesetzes', gesetz: 'OHG', geltung: 'alle', beleg: 'Opferhilfegesetz' },
  { name: 'Rechtshilfegesetzes', gesetz: 'IRSG', geltung: 'alle', beleg: 'Rechtshilfegesetz' },
  { name: 'Arbeitslosenversicherungsgesetzes', gesetz: 'AVIG', geltung: 'alle', beleg: 'Arbeitslosenversicherungsgesetz' },
  { name: 'Entsendegesetzes', gesetz: 'ENTSG', geltung: 'alle', beleg: 'Entsendegesetz' },
  { name: 'Steuerharmonisierungsgesetzes', gesetz: 'STHG', geltung: 'alle', beleg: 'Steuerharmonisierungsgesetz' },
  { name: 'Ausländer- und Integrationsgesetzes', gesetz: 'AIG', geltung: 'alle', beleg: 'Ausländer- und Integrationsgesetz' },
  { name: 'Fernmeldegesetzes', gesetz: 'FMG', geltung: 'alle', beleg: 'Fernmeldegesetz' },
  { name: 'Luftfahrtgesetzes', gesetz: 'LFG', geltung: 'alle', beleg: 'Luftfahrtgesetz' },
  { name: 'Eisenbahngesetzes', gesetz: 'EBG', geltung: 'alle', beleg: 'Eisenbahngesetz' },
  { name: 'Patentgesetzes', gesetz: 'PatG', geltung: 'alle', beleg: 'Patentgesetz' },
  { name: 'Markenschutzgesetzes', gesetz: 'MSchG', geltung: 'alle', beleg: 'Markenschutzgesetz' },
  { name: 'Designgesetzes', gesetz: 'DESG', geltung: 'alle', beleg: 'Designgesetz' },
  { name: 'Sortenschutzgesetzes', gesetz: 'SortG', geltung: 'alle', beleg: 'Sortenschutzgesetz' },
  { name: 'Binnenmarktgesetzes', gesetz: 'BGBM', geltung: 'alle', beleg: 'Binnenmarktgesetz' },
  { name: 'Preisüberwachungsgesetzes', gesetz: 'PUEG', geltung: 'alle', beleg: 'Preisüberwachungsgesetz' },
  // Amtlich zitierte Kurzformen ohne Register-Kurztitel (Beleg: FEDLEX-URL; im
  // Korpus vom Bundesgesetzgeber selbst so zitiert — OR Art. 93 «des
  // Schuldbetreibungs- und Konkursgesetzes vom 11. April 1889», ArG Art. 6 «des
  // Verwaltungsstrafrechtsgesetzes vom 22. März 1974», ZGB Art. 21a «des
  // Erwerbsersatzgesetzes vom 25. September 1952»).
  { name: 'Schuldbetreibungs- und Konkursgesetzes', gesetz: 'SchKG', geltung: 'alle', beleg: U('SchKG') },
  { name: 'Verwaltungsstrafrechtsgesetzes', gesetz: 'VSTRR', geltung: 'alle', beleg: U('VSTRR') },
  { name: 'Erwerbsersatzgesetzes', gesetz: 'EOG', geltung: 'alle', beleg: U('EOG') },
  { name: 'Urheberrechtsgesetzes', gesetz: 'URG', geltung: 'alle', beleg: U('URG') },
  { name: 'Konsumkreditgesetzes', gesetz: 'KKG', geltung: 'alle', beleg: U('KKG') },
  // NUR in Bundeserlassen: ein gleichnamiger kantonaler Erlass ist belegt
  // (Register 1.9.2026: AR-146.1 Datenschutzgesetz, BS-780.100 Umweltschutz-
  // gesetz, AR-814.0 Umwelt- und Gewässerschutzgesetz, BS-420.200 Gesetz über
  // die Berufsbildung, AR-145.52/ZH-215.1 Anwaltsgesetz, BS-772.100 Energie-
  // gesetz, AR-931.1/BS-911.600 Waldgesetz) oder üblich (Verantwortlichkeits-,
  // Bürgerrechts-, Familienzulagen-, Publikations-, Öffentlichkeits-,
  // Gleichstellungs-, Parlaments-, Raumplanungs-, Verwaltungsverfahrens- und
  // Organisationsgesetze der Kantone; «Arbeitsgesetz» ist in BS das Register-
  // Kürzel des Einführungsgesetzes BS-812.100).
  { name: 'Verwaltungsgerichtsgesetzes', gesetz: 'VGG', geltung: 'bund', beleg: 'Verwaltungsgerichtsgesetz' },
  { name: 'Verwaltungsverfahrensgesetzes', gesetz: 'VwVG', geltung: 'bund', beleg: U('VwVG') },
  { name: 'Umweltschutzgesetzes', gesetz: 'USG', geltung: 'bund', beleg: 'Umweltschutzgesetz' },
  { name: 'Gewässerschutzgesetzes', gesetz: 'GSCHG', geltung: 'bund', beleg: 'Gewässerschutzgesetz' },
  { name: 'Arbeitsgesetzes', gesetz: 'ArG', geltung: 'bund', beleg: 'Arbeitsgesetz' },
  { name: 'Datenschutzgesetzes', gesetz: 'DSG', geltung: 'bund', beleg: U('DSG') },
  { name: 'Berufsbildungsgesetzes', gesetz: 'BBG', geltung: 'bund', beleg: U('BBG') },
  { name: 'Raumplanungsgesetzes', gesetz: 'RPG', geltung: 'bund', beleg: 'Raumplanungsgesetz' },
  { name: 'Regierungs- und Verwaltungsorganisationsgesetzes', gesetz: 'RVOG', geltung: 'bund', beleg: 'Regierungs- und Verwaltungsorganisationsgesetz' },
  { name: 'Parlamentsgesetzes', gesetz: 'PARLG', geltung: 'bund', beleg: 'Parlamentsgesetz' },
  { name: 'Strafbehördenorganisationsgesetzes', gesetz: 'STBOG', geltung: 'bund', beleg: 'Strafbehördenorganisationsgesetz' },
  { name: 'Verantwortlichkeitsgesetzes', gesetz: 'VG', geltung: 'bund', beleg: 'Verantwortlichkeitsgesetz' },
  { name: 'Anwaltsgesetzes', gesetz: 'BGFA', geltung: 'bund', beleg: 'Anwaltsgesetz' },
  { name: 'Energiegesetzes', gesetz: 'EnG', geltung: 'bund', beleg: 'Energiegesetz' },
  { name: 'Bürgerrechtsgesetzes', gesetz: 'BUEG', geltung: 'bund', beleg: 'Bürgerrechtsgesetz' },
  { name: 'Gleichstellungsgesetzes', gesetz: 'GLG', geltung: 'bund', beleg: 'Gleichstellungsgesetz' },
  { name: 'Öffentlichkeitsgesetzes', gesetz: 'BGOE', geltung: 'bund', beleg: 'Öffentlichkeitsgesetz' },
  { name: 'Familienzulagengesetzes', gesetz: 'FAMZG', geltung: 'bund', beleg: 'Familienzulagengesetz' },
  { name: 'Publikationsgesetzes', gesetz: 'PUBLG', geltung: 'bund', beleg: 'Publikationsgesetz' },
  { name: 'Waldgesetzes', gesetz: 'WAG', geltung: 'bund', beleg: 'Waldgesetz' },
];

// ─── V-7b · Amtliche Volltitel «Bundesgesetzes/Verordnung [vom Datum] über …» ──
//
// Der Text nennt den Erlass mit seinem amtlichen Titel, oft mit Datums-
// Einschub («des Bundesgesetzes vom 20. Dezember 1946 über die Alters- und
// Hinterlassenenversicherung»). Kopfwort + Titelfragment sind zusammen der
// Erlass — ein Kanton erlässt kein «Bundesgesetz», darum gilt der Kopf
// `Bundesgesetzes` ebenenübergreifend. Der Kopf `Verordnung` ist generisch
// (kantonale «Verordnung über den Datenschutz» …) und löst NUR in
// Bundeserlassen auf. Jedes Fragment ist wörtlich der Register-Titel des Ziels
// ohne Kopfwort und Klammer-Zusatz (Wächter vergleicht auf Gleichheit).
export type TitelKopf = 'Bundesgesetzes' | 'Verordnung';
export interface TitelEintrag { kopf: TitelKopf; fragment: string; gesetz: FedlexGesetz }
export const TITEL_EINTRAEGE: ReadonlyArray<TitelEintrag> = [
  { kopf: 'Bundesgesetzes', fragment: 'über den Versicherungsvertrag', gesetz: 'VVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Urheberrecht und verwandte Schutzrechte', gesetz: 'URG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Fusion, Spaltung, Umwandlung und Vermögensübertragung', gesetz: 'FusG' },
  { kopf: 'Bundesgesetzes', fragment: 'gegen den unlauteren Wettbewerb', gesetz: 'UWG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Schutz von Marken und Herkunftsangaben', gesetz: 'MSchG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Erfindungspatente', gesetz: 'PatG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Schutz von Pflanzenzüchtungen', gesetz: 'SortG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Pauschalreisen', gesetz: 'PRG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Bucheffekten', gesetz: 'BEG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die eingetragene Partnerschaft gleichgeschlechtlicher Paare', gesetz: 'PARTG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Internationale Privatrecht', gesetz: 'IPRG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Konsumkredit', gesetz: 'KKG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das bäuerliche Bodenrecht', gesetz: 'BGBB' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Schutz von Design', gesetz: 'DESG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Jugendstrafrecht', gesetz: 'JSTG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Betäubungsmittel und die psychotropen Stoffe', gesetz: 'BETMG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Verwaltungsstrafrecht', gesetz: 'VSTRR' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Hilfe an Opfer von Straftaten', gesetz: 'OHG' },
  { kopf: 'Bundesgesetzes', fragment: 'über internationale Rechtshilfe in Strafsachen', gesetz: 'IRSG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Bundesgericht', gesetz: 'BGG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Verwaltungsverfahren', gesetz: 'VwVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Bundesverwaltungsgericht', gesetz: 'VGG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Freizügigkeit der Anwältinnen und Anwälte', gesetz: 'BGFA' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Verantwortlichkeit des Bundes sowie seiner Behördemitglieder und Beamten', gesetz: 'VG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Organisation der Strafbehörden des Bundes', gesetz: 'STBOG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Schuldbetreibung und Konkurs', gesetz: 'SchKG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Datenschutz', gesetz: 'DSG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Berufsbildung', gesetz: 'BBG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Erwerb von Grundstücken durch Personen im Ausland', gesetz: 'BewG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Kartelle und andere Wettbewerbsbeschränkungen', gesetz: 'KG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die politischen Rechte', gesetz: 'BPR' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Bundesversammlung', gesetz: 'PARLG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Sammlungen des Bundesrechts und das Bundesblatt', gesetz: 'PUBLG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Öffentlichkeitsprinzip der Verwaltung', gesetz: 'BGOE' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Raumplanung', gesetz: 'RPG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Umweltschutz', gesetz: 'USG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Bekämpfung der Geldwäscherei und der Terrorismusfinanzierung', gesetz: 'GWG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Ausländerinnen und Ausländer und über die Integration', gesetz: 'AIG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Gleichstellung von Frau und Mann', gesetz: 'GLG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Eidgenössische Finanzmarktaufsicht', gesetz: 'FINMAG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Banken und Sparkassen', gesetz: 'BANKG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Arzneimittel und Medizinprodukte', gesetz: 'HMG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das Schweizer Bürgerrecht', gesetz: 'BUEG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Natur- und Heimatschutz', gesetz: 'NHG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Schutz der Gewässer', gesetz: 'GSCHG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Wald', gesetz: 'WAG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Enteignung', gesetz: 'ENTG' },
  { kopf: 'Bundesgesetzes', fragment: 'über das öffentliche Beschaffungswesen', gesetz: 'BOEB' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Finanzdienstleistungen', gesetz: 'FIDLEG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die kollektiven Kapitalanlagen', gesetz: 'KAG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Finanzinstitute', gesetz: 'FINIG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Finanzmarktinfrastrukturen und das Marktverhalten im Effekten- und Derivatehandel', gesetz: 'FINFRAG' },
  { kopf: 'Bundesgesetzes', fragment: 'betreffend die Aufsicht über Versicherungsunternehmen', gesetz: 'VAG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Reduktion der CO2-Emissionen', gesetz: 'CO2-Gesetz' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Bekämpfung übertragbarer Krankheiten des Menschen', gesetz: 'EpG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Transplantation von Organen, Geweben und Zellen', gesetz: 'TxG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Lebensmittel und Gebrauchsgegenstände', gesetz: 'LMG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Luftfahrt', gesetz: 'LFG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Armee und die Militärverwaltung', gesetz: 'MG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die technischen Handelshemmnisse', gesetz: 'THG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Binnenmarkt', gesetz: 'BGBM' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Arbeit in Industrie, Gewerbe und Handel', gesetz: 'ArG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die flankierenden Massnahmen bei entsandten Arbeitnehmerinnen und Arbeitnehmern', gesetz: 'ENTSG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Mehrwertsteuer', gesetz: 'MWSTG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Stempelabgaben', gesetz: 'StG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die direkte Bundessteuer', gesetz: 'DBG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Verrechnungssteuer', gesetz: 'VStG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Harmonisierung der direkten Steuern der Kantone und Gemeinden', gesetz: 'STHG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Krankenversicherung', gesetz: 'KVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Erwerbsersatz', gesetz: 'EOG' },
  { kopf: 'Bundesgesetzes', fragment: 'über den Allgemeinen Teil des Sozialversicherungsrechts', gesetz: 'ATSG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die berufliche Alters-, Hinterlassenen- und Invalidenvorsorge', gesetz: 'BVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Unfallversicherung', gesetz: 'UVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die obligatorische Arbeitslosenversicherung und die Insolvenzentschädigung', gesetz: 'AVIG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Invalidenversicherung', gesetz: 'IVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Familienzulagen und Finanzhilfen an Familienorganisationen', gesetz: 'FAMZG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Alters- und Hinterlassenenversicherung', gesetz: 'AHVG' },
  { kopf: 'Bundesgesetzes', fragment: 'über Ergänzungsleistungen zur Alters-, Hinterlassenen- und Invalidenversicherung', gesetz: 'ELG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Freizügigkeit in der beruflichen Alters-, Hinterlassenen- und Invalidenvorsorge', gesetz: 'FZG' },
  { kopf: 'Bundesgesetzes', fragment: 'über die Militärversicherung', gesetz: 'MVG' },
  // Verordnungen (nur Bund-Kontext, s. o.).
  { kopf: 'Verordnung', fragment: 'über die Miete und Pacht von Wohn- und Geschäftsräumen', gesetz: 'VMWG' },
  { kopf: 'Verordnung', fragment: 'über den Schutz von Marken und Herkunftsangaben', gesetz: 'MSchV' },
  { kopf: 'Verordnung', fragment: 'über die Erfindungspatente', gesetz: 'PatV' },
  { kopf: 'Verordnung', fragment: 'über den Schutz von Design', gesetz: 'DesV' },
  { kopf: 'Verordnung', fragment: 'über das Urheberrecht und verwandte Schutzrechte', gesetz: 'URV' },
  { kopf: 'Verordnung', fragment: 'zum Konsumkreditgesetz', gesetz: 'VKKG' },
  { kopf: 'Verordnung', fragment: 'über die Adoption', gesetz: 'AdoV' },
  { kopf: 'Verordnung', fragment: 'über die Aufnahme von Pflegekindern', gesetz: 'PAVO' },
  { kopf: 'Verordnung', fragment: 'über kriminalpolizeiliche Zentralstellen des Bundes', gesetz: 'ZentV' },
  { kopf: 'Verordnung', fragment: 'über die Betäubungsmittelkontrolle', gesetz: 'BetmKV' },
  { kopf: 'Verordnung', fragment: 'über die Geschäftsführung der Konkursämter', gesetz: 'KOV' },
  { kopf: 'Verordnung', fragment: 'über Zulassung, Aufenthalt und Erwerbstätigkeit', gesetz: 'VZAE' },
  { kopf: 'Verordnung', fragment: 'über die Zulassung von Personen und Fahrzeugen zum Strassenverkehr', gesetz: 'VZV' },
  { kopf: 'Verordnung', fragment: 'über den Datenschutz', gesetz: 'DSV' },
  { kopf: 'Verordnung', fragment: 'über den Erwerb von Grundstücken durch Personen im Ausland', gesetz: 'BewV' },
  { kopf: 'Verordnung', fragment: 'über die Einreise und die Visumerteilung', gesetz: 'VEV' },
  { kopf: 'Verordnung', fragment: 'über die Integration von Ausländerinnen und Ausländern', gesetz: 'VIntA' },
  { kopf: 'Verordnung', fragment: 'über die Vermeidung und die Entsorgung von Abfällen', gesetz: 'VVEA' },
  { kopf: 'Verordnung', fragment: 'über den Schutz vor gefährlichen Stoffen und Zubereitungen', gesetz: 'ChemV' },
  { kopf: 'Verordnung', fragment: 'über den Natur- und Heimatschutz', gesetz: 'NHV' },
  { kopf: 'Verordnung', fragment: 'über den Wald', gesetz: 'WaV' },
  { kopf: 'Verordnung', fragment: 'über die technischen Anforderungen an Strassenfahrzeuge', gesetz: 'VTS' },
  { kopf: 'Verordnung', fragment: 'über die Banken und Sparkassen', gesetz: 'BankV' },
  { kopf: 'Verordnung', fragment: 'über die kollektiven Kapitalanlagen', gesetz: 'KKV' },
  { kopf: 'Verordnung', fragment: 'über die Eigenmittel und Risikoverteilung der Banken und Wertpapierhäuser', gesetz: 'ERV' },
  { kopf: 'Verordnung', fragment: 'über die Finanzinstitute', gesetz: 'FINIV' },
  { kopf: 'Verordnung', fragment: 'über die Finanzmarktinfrastrukturen und das Marktverhalten im Effekten- und Derivatehandel', gesetz: 'FinfraV' },
  { kopf: 'Verordnung', fragment: 'über die Finanzdienstleistungen', gesetz: 'FIDLEV' },
  { kopf: 'Verordnung', fragment: 'über die Beaufsichtigung von privaten Versicherungsunternehmen', gesetz: 'AVO' },
  { kopf: 'Verordnung', fragment: 'über die Arzneimittel', gesetz: 'VAM' },
  { kopf: 'Verordnung', fragment: 'über die Bewilligungen im Arzneimittelbereich', gesetz: 'AMBV' },
  { kopf: 'Verordnung', fragment: 'über die Bekämpfung übertragbarer Krankheiten des Menschen', gesetz: 'EpV' },
  { kopf: 'Verordnung', fragment: 'über die Berufsbildung', gesetz: 'BBV' },
  { kopf: 'Verordnung', fragment: 'über die Berufsmaturität', gesetz: 'BMV' },
  { kopf: 'Verordnung', fragment: 'über das Zentrale Migrationsinformationssystem', gesetz: 'ZEMIS-V' },
  { kopf: 'Verordnung', fragment: 'über die Ausstellung von Reisedokumenten für ausländische Personen', gesetz: 'RDV' },
  { kopf: 'Verordnung', fragment: 'über die Umweltverträglichkeitsprüfung', gesetz: 'UVPV' },
  { kopf: 'Verordnung', fragment: 'über den Verkehr mit Abfällen', gesetz: 'VeVA' },
  { kopf: 'Verordnung', fragment: 'über die Infrastruktur der Luftfahrt', gesetz: 'VIL' },
  { kopf: 'Verordnung', fragment: 'über Fernmeldedienste', gesetz: 'FDV' },
  { kopf: 'Verordnung', fragment: 'über Fernmeldeanlagen', gesetz: 'FAV' },
  { kopf: 'Verordnung', fragment: 'zum Bundesgesetz über die Schweizerische Nationalbank', gesetz: 'NBV' },
  { kopf: 'Verordnung', fragment: 'über die Verrechnungssteuer', gesetz: 'VStV' },
  { kopf: 'Verordnung', fragment: 'über die Krankenversicherung', gesetz: 'KVV' },
  { kopf: 'Verordnung', fragment: 'über die Alters- und Hinterlassenenversicherung', gesetz: 'AHVV' },
  { kopf: 'Verordnung', fragment: 'über die Invalidenversicherung', gesetz: 'IVV' },
  { kopf: 'Verordnung', fragment: 'über die Ergänzungsleistungen zur Alters-, Hinterlassenen- und Invalidenversicherung', gesetz: 'ELV' },
  { kopf: 'Verordnung', fragment: 'über die berufliche Alters-, Hinterlassenen- und Invalidenvorsorge', gesetz: 'BVV 2' },
  { kopf: 'Verordnung', fragment: 'über die Unfallversicherung', gesetz: 'UVV' },
  { kopf: 'Verordnung', fragment: 'über die obligatorische Arbeitslosenversicherung und die Insolvenzentschädigung', gesetz: 'AVIV' },
  { kopf: 'Verordnung', fragment: 'über den Allgemeinen Teil des Sozialversicherungsrechts', gesetz: 'ATSV' },
  { kopf: 'Verordnung', fragment: 'über die Freizügigkeit in der beruflichen Alters-, Hinterlassenen- und Invalidenvorsorge', gesetz: 'FZV' },
  { kopf: 'Verordnung', fragment: 'über die steuerliche Abzugsberechtigung für Beiträge an anerkannte Vorsorgeformen', gesetz: 'BVV 3' },
  { kopf: 'Verordnung', fragment: 'über die Militärversicherung', gesetz: 'MVV' },
  { kopf: 'Verordnung', fragment: 'über die Familienzulagen', gesetz: 'FamZV' },
  { kopf: 'Verordnung', fragment: 'über die freiwillige Alters-, Hinterlassenen- und Invalidenversicherung', gesetz: 'VFV' },
  { kopf: 'Verordnung', fragment: 'über die Versichertenkarte für die obligatorische Krankenpflegeversicherung', gesetz: 'VVK' },
  { kopf: 'Verordnung', fragment: 'über die Kostenermittlung und die Leistungserfassung durch Spitäler, Geburtshäuser und Pflegeheime in der Krankenversicherung', gesetz: 'VKL' },
];

/** Geltung eines Titel-Kopfs: nur `Bundesgesetzes` ist ebenenübergreifend. */
export const titelGeltung = (kopf: TitelKopf): Geltung => (kopf === 'Bundesgesetzes' ? 'alle' : 'bund');

// ─── V-8 · Amtliche Kürzel-Schreibweisen → FEDLEX-Key ──────────────────────
//
// Die FEDLEX-Tabelle führt jüngere Keys in Grossbuchstaben (BANKG, ASYLG …);
// der Gesetzestext schreibt das amtliche Kürzel gemischt («BankG», «AsylG»).
// Ohne diese Tabelle blieb «Art. 1b BankG» ein unbekanntes Kürzel (M12,
// Text) — 601 Stellen im Korpus (1.9.2026). Beleg je Eintrag: das Kürzel
// steht in der Klammer des Bund-Register-Titels («… (Bankengesetz, BankG)»).
export const KUERZEL_SCHREIBWEISEN: ReadonlyArray<readonly [string, FedlexGesetz]> = [
  ['FinfraG', 'FINFRAG'], ['BankG', 'BANKG'], ['AsylG', 'ASYLG'], ['GSchG', 'GSCHG'],
  ['BetmG', 'BETMG'], ['FamZG', 'FAMZG'], ['GwG', 'GWG'], ['JStG', 'JSTG'],
  ['PartG', 'PARTG'], ['DesG', 'DESG'], ['EntG', 'ENTG'], ['VStrR', 'VSTRR'],
  ['WaG', 'WAG'], ['StHG', 'STHG'], ['EntsG', 'ENTSG'], ['ParlG', 'PARLG'],
  ['PublG', 'PUBLG'], ['StBOG', 'STBOG'], ['GlG', 'GLG'], ['BüG', 'BUEG'],
  ['BGÖ', 'BGOE'], ['BöB', 'BOEB'], ['PüG', 'PUEG'], ['EAUe', 'EAUE'],
];

export function schreibweiseZuKey(schreibweise: string): FedlexGesetz | null {
  return KUERZEL_SCHREIBWEISEN.find(([s]) => s === schreibweise)?.[1] ?? null;
}
