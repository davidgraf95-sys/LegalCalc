# Sachgebiets-Klassierung der Rechtsprechung — J3-Regelwerk und Quirks (29.8.2026)

**Anlass:** W2·10-UI-NAV-J3 («Sachgebiets-Pipeline verfeinern», FAHRPLAN-UI-NAVIGATION §6).
Befund der Ultracode-Synthese 11.7.2026 (#23), am 29.8.2026 am Ist-Korpus reproduziert:
BGE 150 II 300 (BGFA, Anwaltsaufsicht) stand unter «Steuern & Sozialversicherung»;
der Topf `sozial-abgaben` war mit 1844/6341 Register-Einträgen (29 %) der grösste.

## Regel (deterministisch, §2 — Stand 29.8.2026)

Klassierungs-Kette je Entscheid (`mappeEntscheidOCL`, `scripts/normtext/entscheide-mapping.ts`):

1. **2A/2C/2D (II. öffentlich-rechtliche Abteilung, Bund):** Norm-Signal aus den
   ausdrücklich zitierten Erlassen (`NORM_SIGNAL`, deklarierte Prioritätsliste:
   AIG/AsylG/BewG → öffentlich · **BGFA → öffentlich (neu J3)** · DBG/StHG/MWStG/VStG
   → sozial-abgaben) ?? **Roh-StG-Signal** (`zweierRohSteuerSignal`: «StG»/
   «Steuergesetz» in den Roh-zitierten Normen → sozial-abgaben; kantonale
   Steuergesetze tragen keinen Register-Key) ?? **`legal_area` GEFILTERT** auf die
   Steuer-Frage (`zweierLegalAreaSignal`: nur STEUER-Begriffe — tax/steuer/impôt/
   fiscal — zählen; 'civil'/'criminal' UND 'social_insurance' sind auf der 2er-
   Abteilung unplausibel, Art. 31/32 BgerR; Beleg BGE 151 II 726) ?? **Abteilungs-Default `oeffentlich`
   (neu J3; vorher pauschal `sozial-abgaben`)**.

   Amtliche Grundlage: Art. 30 BgerR (SR 173.110.131, Konsolidierung 2026-02-01,
   [Fedlex-XML](https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2006/834/20260201/de/xml/fedlex-data-admin-ch-eli-cc-2006-834-20260201-de-xml.xml),
   Abruf 29.8.2026): Ausländerrecht, internationale Steueramtshilfe, öffentliches
   Wirtschaftsrecht inkl. Beschaffungswesen und freie Berufe; «Steuern und
   Abgaben» sind SEIT 1.1.2023 bei der III. öffentlich-rechtlichen Abteilung
   (Art. 31 lit. a BgerR, AS 2023 65) — der Altbestand 2A/2C bis 2022 enthält
   sie noch, darum die Signal-Kette.
2. Übrige BGer-Abteilungen: amtliche Geschäftsverteilung (`ABTEILUNG`), unverändert
   (4A/5A privat · 6B straf · 1B/7B prozess · 1C öffentlich · 8C/9C sozial-abgaben).
3. Kantonal: Aktenzeichen-Präfixe (`KANT_PRAEFIX`), unverändert.
4. Fallback: `legal_area`, zuletzt `oeffentlich`.
5. **Amtliche BGE:** unterliegendes aza-Urteil klassiert (Kette oben); ohne
   auflösbares aza das Band (I/II → öffentlich · III → privat · IV → straf ·
   V → sozial-abgaben).

**Bewusste §7-Abweichung vom Fahrplan-Wortlaut («BGFA/BV → Öffentliches Recht»):**
Die BV ist NICHT als Norm-Signal umgesetzt. Messgrund (präzisiert durch die
Gegenprüfung: 109/182 = 60 % der Entscheide mit Steuer-Key zitieren zusätzlich die
BV): als Signal hätte sie diese echten Steuerfälle nach «öffentlich» gekippt
(Gegenbeleg BGE 149 I 125: zitiert Art. 8 BV, ist reine Grundstücksteuer). Ihren
Zweck — verfassungsrechtliche 2er-Fälle nicht als Steuern zu etikettieren — erfüllt
der neue Abteilungs-Default `oeffentlich` deterministisch.

**Ebenfalls bewusst NICHT gebaut:** redaktionelle Einzel-Umklassierungen (wäre
Fachkuration → Zeitsperre, Fahrplan §6/J3) und ein hartes Band-Mapping für BGE:
Messung 29.8. zeigte, dass die aza-basierte Klassierung FEINER ist als das Band
(z. B. 72 Band-IV-BGE korrekt als «prozess», 1B/7B-Haft- und Beschwerdefälle).

## Durchgeführter Bestands-Regen

`scripts/normtext/remap-sachgebiet-j3.ts` (Scope eng: Bund-2er-Abteilung + BGE der
Bände I/II mit 2er-aza; alles Übrige byte-gleich), zwei Läufe (Erstlauf + Korrektur-
lauf nach Gegenprüfungs-Runde 1). Endstand gegen die Basis (nach Bug-Check-Nachschärfung B2, 29.8.2026): **119
geänderte Snapshots**, im nutzersichtbaren Register **237 Wechsel** (BGE-Einträge
ziehen je einen `__voll`-Verweis-Eintrag mit) (BGE-Einträge ziehen je
einen `__voll`-Verweis-Eintrag mit): 227 `sozial-abgaben → oeffentlich`,
8 `privat → oeffentlich`, 2 `privat → sozial-abgaben`; Einträge vorher = nachher
= 6341. Projektionen (register.json, norm-index, bezuege) regeneriert; dabei zog
die seit PR #476 (LM-168) stale Wortgrenzen-Kürzung von `regesteKurz` nach
(deklariert; Gegenprüfung: alle 1278 Abweichungen echte Präfixe, kein Inhaltsverlust).

**Gegenprüfungs-Runde 1 (unabhängiger Opus-Agent, 29.8.2026) — Verdikt «widerlegt»,
Befunde eingebaut:** F1 ungefilterte `legal_area` kippte 2D-/2C-Fälle nach «privat»
(BGE 152 II 142 Beschaffungsrecht, BGE 151 II 46) → `zweierLegalAreaSignal`-Filter.
F2/F3 Signal-Quelle des Re-Maps war das auf 8 Einträge GEKAPPTE `zitierteNormen` —
echte Steuer-/Zollfälle (BGE 149 I 125, 149 II 129, 148 II 491, 150 II 390,
146 I 105) kippten nach «öffentlich» → Signal jetzt aus den vollen `normKeys` +
Roh-StG-Signal. Kommentar-Beleg auf Art. 30/31 BgerR korrigiert (Steuern seit
1.1.2023 bei der III. Abteilung).

## Quirks (Q-J3, nach Q1/Q4-Muster)

- **Q-J3-1 · Offline-Signalquelle beim Re-Map (präzisiert):** Vom aza-Urteil ist
  offline nur das Aktenzeichen persistiert; Signal-Quellen sind die Felder des
  Snapshots SELBST — die vollen `normKeys` (NICHT `zitierteNormen`: dieses Feld ist
  im Snapshot auf 8 alphabetisch sortierte Einträge gekappt, Gegenprüfungs-Befund
  F3) plus die gekappten Roh-Strings fürs StG-Signal. Der Live-Import rechnet mit
  den Feldern des gemappten OCL-Records (statutes vollständig) — deklarierte
  Divergenzquelle; deterministisch bleibt beides.
- **Q-J3-5 · Restklasse ohne Signal:** Kantonale Abgabefälle der 2er-Abteilung, die
  weder einen Bundes-Steuer-Key noch «StG»/«Steuergesetz» im Roh-String noch eine
  Steuer-`legal_area` tragen, bleiben beim Default `oeffentlich` — deterministisch
  ehrlich, aber fachlich ggf. Abgaberecht. Redaktionelle Einzel-Umklassierung ist
  per J3-Spec verboten (Fachkuration); das «maschinell»-Etikett deckt §8.
- **Q-J3-6 · BGFA-vor-Steuer-Priorität ist auf dem Bestand nicht falsifizierbar:**
  0/6341 Einträge tragen BGFA UND einen Steuer-Key (Messung Gegenprüfung); belegt
  nur durch den synthetischen Unit-Test. Bei Korpus-Wachstum am ersten echten
  Kollisionsfall prüfen.
- **Q-J3-2 · `STG` ist totes Signal:** steht in `NORM_SIGNAL`, erzeugt aber nie
  einen Treffer, weil `STG` in `ABK_AUSSCHLUSS` liegt (föderal/kantonal mehrdeutig).
  Bewusst belassen (Dokumentation der Absicht), Wirkung null.
- **Q-J3-3 · ERLEDIGT 29.8.2026 — der Doppel-Topf ist getrennt:** ~~Steuern & Abgaben
  und Sozialversicherung teilen ein Sachgebiet (1619 Einträge nach Regen).~~ David hat
  am 29.8.2026 im Chat entschieden («ja trennen»); gebaut als **W2-TRENNUNG** (Branch
  `feat/w2-sachgebiet-trennung`). Der Wert `sozial-abgaben` existiert nicht mehr — an
  seine Stelle treten `steuern` («Steuern & Abgaben») und `sozialversicherung`
  («Sozialversicherung»), in Rechtsprechung UND /gesetze (eine Taxonomie, §5).
  Details siehe Abschnitt «Trennung des Doppel-Topfs» unten.
- **Q-J3-8 · Re-Map-Signal breiter als Live-Signal (Bug-Check B2, 29.8.2026):**
  Der Re-Map speist die Kette aus den vollen `normKeys` (statutes + Fliesstext),
  der Live-Import BEWUSST nur aus den statutes (adapter-entscheide.ts, «schmale
  statutes-Menge»). Messung: 29/214 Scope-Snapshots (13,6 %) tragen ihr Signal in
  einem Key, der in den Roh-zitierten Normen nicht vorkommt (z. B. 146 I 105:
  VSTG nur im Fliesstext). Ein voller Live-Re-Import könnte diese Fälle anders
  klassieren — beide Ketten sind gegen­geprüft-deterministisch, aber nicht
  deckungsgleich (§5-Rest). Vereinheitlichung (eine Signal-Quelle für beide
  Pfade) als Folge-Posten im Fahrplan §6/J3-Rest vermerkt.
- **Q-J3-9 · Orphan-Wache ist binär (Bug-Check, 29.8.2026):** Die Harvest-Wache
  in `soft-law-projektion-run.ts` prüft nur `kanten.length > 0` — eine TEILWEISE
  gefüllte soft-law.db passierte sie, und die Orphan-Bereinigung löschte den
  Rest. Gleiches Verhalten wie die Tor-Wache (`check-materialien.ts`); bei einem
  echten Teil-Harvest-Fall beide zusammen härten.
- **Q-J3-7 · normKeys speisen sich auch aus dem Fliesstext (W2·6-NKEY):** beiläufige
  Erlass-Nennungen im Erwägungstext können das Sachgebiet setzen — Beleg BGE
  150 II 390 (CO₂-Sanktion): der MWSTG-Key stammt aus einer Definitionsklammer
  «(vgl. Art. 70 ZG; Art. 51 MWSTG)», nicht aus dem Streitgegenstand; Ergebnis
  `sozial-abgaben` vertretbar (Abgabecharakter), Herleitung schwach. Rückbau lohnt
  nicht (Gegenprüfung Runde 2), aber Falle dokumentiert; Folgeschritt-Idee: Messung
  «Steuer-Key nur im Fliesstext, nicht in der Regeste» über die normSignal-Fälle.
- **Q-J3-4 · Kantonale Präfix-Kollision `BV`/`SG`:** In `KANT_PRAEFIX` meint `BV`
  Berufliche Vorsorge und `SG` das Schiedsgericht Sozialversicherung BS — nicht
  Bundesverfassung/St. Gallen. Nur Aktenzeichen-Ebene, keine Norm-Keys.

**Offene Kleinreste aus Gegenprüfungs-Runde 3 (29.8.2026, alle leicht, beim
Q-J3-8-Folge-Posten miterledigen):** (H2) der Array-Guard vor
`zweierRohSteuerSignal` ist wirkungslos (String-Eingabe lieferte auch vorher
null) und die Schwesterstelle `statutesZuNormKeys(det.statutes ?? [])` ist
ungeschützt — beides angleichen oder beides streichen (§17 Ziff. 2); (H3) der
Kommentar zum Unterstrich-Fix in `remap-sachgebiet-j3.ts` nennt den falschen
Grund — richtig ist: 29 Unterstrich-Nummern existieren, aber alle bger/bpatger,
`bgeBand` läuft nur auf `gericht==='bge'`; (H4) `/imp[oô]t/` matcht Substrings
(korpus-irrelevant). Lesemodus-Overlay: Maschinen-Hinweis nur per Hover (§8-Rest).

**Pflege:** Neue 2er-relevante Erlasse (z. B. StAhiG, BüG) bei Bedarf in
`NORM_SIGNAL` deklarieren — Priorität ist die Listen-Reihenfolge, empirisch am
Korpus messen (Muster: `remap-sachgebiet-j3.ts` DRY-RUN).

**UI-Etikett (§8, Endstand nach Bug-Check B1):** Der Entscheid-Kopf trug das
«maschinell»-StatusBadge BEREITS (V1.2/W2·7-VZUI) — der J3-Erstlauf hatte es
dupliziert (dazu versal/mono im lc-overline), zurückgenommen 29.8.2026. J3
ergänzt nur `title`-Hinweise «Sachgebiet maschinell zugeordnet» direkt am
Sachgebiets-Label (Leser-Köpfe, EntscheidZeile, EntscheidKarte).

**Abnahme-Status:** maschinell umgesetzt, fachliche Abnahme der Klassierungs-Regeln
durch David offen (§7); UI etikettiert das Sachgebiet seit J3 als «maschinell».

## Trennung des Doppel-Topfs (W2-TRENNUNG, 29.8.2026)

**Anlass:** Entscheid David im Chat, 29.8.2026, wörtlich «ja trennen» — auf die
§Y-Vorlage Ziff. 0 des `fahrplaene/FAHRPLAN-UI-NAVIGATION.md` hin. Erledigt damit
Q-J3-3.

**Was sich geändert hat:** Die Sach-Achse `'sozial-abgaben'` («Steuern,
Sozialversicherung & Abgaben») ist ersatzlos aus dem Typ `Rechtsgebiet` entfernt.
An ihre Stelle treten zwei Achsen: `'steuern'` («Steuern & Abgaben») und
`'sozialversicherung'` («Sozialversicherung»). Die Achse ist geteilt (§5) — sie
trägt sowohl `ErlassRegistereintrag.rechtsgebiet` als auch
`EntscheidSnapshot.sachgebiet` und das Rechtsgebiet der Materialien.

### Zuordnungsregeln (deterministisch, §2 — keine Einzelfall-Kuration)

**Gesetze — die amtliche SR-Systematik entscheidet.** Quelle: Fedlex-Rechts-
taxonomie, abgefragt am 29.8.2026 über <https://fedlex.data.admin.ch/sparqlendpoint>
(`skos:notation` vom Typ `id-systematique` → `skos:prefLabel@de`):

| SR-Gruppe | amtlicher Titel | Ziel | Erlasse |
|---|---|---|---|
| 64 | Steuern | `steuern` | 9 (DBG, StHG, MWSTG, MWSTV, StG, VStG, VStV, QStV, BKV) |
| 830–838 | Sozialversicherung (830 Allgemeiner Teil des Sozialversicherungsrechts · 831 Alters-, Hinterlassenen- und Invalidenversicherung · 832 Kranken- und Unfallversicherung · 833 Militärversicherung · 834 Erwerbsersatz · 836 Familienzulagen · 837 Arbeitslosenversicherung · 838 Mutterschaftsversicherung) | `sozialversicherung` | 29 |
| 822 / 823 | Arbeitnehmerschutz / Arbeitsmarkt und Arbeitsbeschaffung | `oeffentlich` | 7 (ArG, ArGV 1–5, EntsG) |

**Zur Vollständigkeit der SR-83-Reihe (nachgeprüft 29.8.2026, Fedlex-SPARQL,
`skos:notation` Typ `id-systematique` → `skos:prefLabel@de`).** Die Regel nannte
bis dahin «830–837» und war damit unvollständig: **838 «Mutterschaftsversicherung»**
existiert als Taxonomie-Gruppe (`status = CURRENT`, `startDate 2021-12-21`),
ist aber **korpusleer** — kein einziger konsolidierter Erlass ist darunter
klassiert (ihre einzige Untergruppe 838.1 trägt das prefLabel «Erwerbsersatz»
und ist ebenfalls leer). Das ist Taxonomie-Altbestand: das
Mutterschaftsversicherungsgesetz von 1999 trat nie in Kraft, die
Mutterschaftsentschädigung lebt heute in der EO (SR 834; Art. 31 lit. d BgerR
nennt sie folgerichtig als «Erwerbsersatzordnung, einschliesslich
Mutterschaft»). Die Regel deckt 838 jetzt ausdrücklich mit ab, damit ein
künftig dort klassierter Erlass nicht durch die Maschen fällt. **835 gibt es
nicht** — weder als Taxonomie-Eintrag noch als SR-Nummernpräfix; die
Bereichsschreibweise «830–838» ist insofern lückenhaft und genau so gemeint.

Die dritte Zeile ist die einzige Stelle, an der die Trennung mehr tut als
umbenennen, und sie ist bewusst so: Das Arbeitsgesetz und seine fünf Verordnungen
sowie das Entsendegesetz sind öffentlich-rechtlicher Arbeitnehmerschutz — weder
Steuer- noch Sozialversicherungsrecht. Sie sassen im Doppel-Topf nur, weil er der
«Arbeit & Soziales»-Sammelplatz war. Unter dem Etikett «Sozialversicherung» wären
sie für einen Juristen sichtbar falsch einsortiert; `oeffentlich` ist die Rubrik,
in der Verwaltungsrecht ohnehin steht. Ihr `rang` wurde als geschlossener Block
119–125 ans Ende der öffentlich-rechtlichen Reihe gesetzt (reine Anzeige-Ordnung,
§3 — ihre alten Ränge 6/30/61/67–69/76 hätten sie zufällig weit nach oben
gespült).

**Rechtsprechung — Abteilung und Sammlungs-Band entscheiden.**

| Regel | Grundlage | Ziel |
|---|---|---|
| BGer-Abteilung 8C | IV. öffentlich-rechtliche Abteilung, Art. 32 BgerR (SR 173.110.131): UV, ALV, kantonale SV, Familienzulagen, Sozialhilfe, MV, EL, Überbrückungsleistungen — keine Steuersachen | `sozialversicherung` |
| BGer-Abteilung 9C | III. öffentlich-rechtliche Abteilung, Art. 31 BgerR — **gemischt**: lit. a «Steuern und Abgaben» neben lit. b–f AHV/IV/EO/KV/berufliche Vorsorge. Darum kein Pauschal-Ziel, sondern die Kette `dritteOerSachgebiet` (s. u.) | `steuern` / `sozialversicherung` / `oeffentlich` |
| BGE-Band V | Sozialrechts-Band der amtlichen Sammlung | `sozialversicherung` |
| BGE-Band II mit 9C-aza | Verwaltungs-/Abgaberecht-Band der amtlichen Sammlung — schlägt das Abteilungs-Signal, nie `sozialversicherung` | `steuern` (mit Steuer-Signal), sonst `oeffentlich` |
| kant. Präfixe EL·IV·UV·ALV·EO·AHV·BV·KV·FZ, BS AL·AH·MV·SG | `KANT_PRAEFIX` (unverändert, Q-J3-4 beachten) | `sozialversicherung` |
| `NORM_SIGNAL` DBG·StHG·MWStG·StG·VStG | J3-Kette der 2er-Abteilung | `steuern` |
| Roh-«StG»/«Steuergesetz», gefilterte `legal_area` | J3-Kette (F2/F1) | `steuern` |
| `legal_area` tax/steuer bzw. social/sozial (Fallback) | OCL-Feld | `steuern` / `sozialversicherung` |

### §7-Abweichung vom Auftragswortlaut (offengelegt)

Der Bau-Auftrag verlangte, `NORM_SIGNAL` um Sozialversicherungs-Erlasse zu
ergänzen (AHVG, IVG, UVG, ATSG, KVG, BVG, ELG, AVIG → `sozialversicherung`). Das
ist **bewusst nicht umgesetzt.** `NORM_SIGNAL` wird ausschliesslich in der Kette
der II. öffentlich-rechtlichen Abteilung ausgewertet (`istMehrdeutigeOerAbteilung`,
2A/2C/2D), und dort ist Sozialversicherung nach Art. 30 BgerR gar keine
Zuständigkeit (sie liegt nach Art. 31/32 bei der III. und IV.
öffentlich-rechtlichen Abteilung — hier stand bis zur Anker-Korrektur vom
29.8.2026 «Art. 30/34/35 BgerR», was falsch war: Art. 34/35 sind die zivil-
bzw. strafrechtlichen Abteilungen). Ein solches Signal stellte exakt den Defekt wieder her, den die
J3-Gegenprüfung am 29.8.2026 als Befund B2 beseitigt hat: BGE 151 II 726
(2C_565/2022, Verbleiberecht nach FZA) nennt das AHVG nur als Altersmassstab und
wurde davon fälschlich als Sozialversicherungsfall etikettiert. Die echten
Sozialversicherungsfälle klassieren die Abteilungs-Zeile (8C bzw. die
9C-Kette) und das Band V — dort, wo die amtliche Geschäftsverteilung sie führt.
Am Unit-Test festgenagelt (`normSignalSachgebiet(['AHVG'])` muss `null` bleiben).

### Die 9C-Kette (Korrektur F1 vom 29.8.2026)

Amtliche Grundlage, am AKN-XML der Konsolidierung 2026-02-01 nachgeprüft
(<https://www.fedlex.admin.ch/eli/cc/2006/834/de>): Art. 31 BgerR behandelt
wörtlich «a. Steuern und Abgaben; b. Alters- und Hinterlassenenversicherung;
c. Invalidenversicherung; d. Erwerbsersatzordnung, einschliesslich
Mutterschaft; e. Krankenversicherung; f. berufliche Vorsorge». Eingefügt durch
V des BGer vom 13.6.2022, in Kraft seit 1.1.2023 (AS 2023 65); zuvor standen
die Steuern in Art. 30 Abs. 1 lit. b. Die 9C ist damit eine **gemischte**
Abteilung, und die frühere Pauschale `'9C': 'sozialversicherung'` etikettierte
jeden 9C-Steuerfall falsch (68 BGE des Abgabe-Bands II).

`dritteOerSachgebiet` in der Reihenfolge:

1. **BGE Band V** → `sozialversicherung` (Sozialrechts-Band).
2. **BGE Band II** → Steuer-Signal ? `steuern` : `oeffentlich`. Nie
   `sozialversicherung`: der amtliche Band ist die Systematik der Sammlung
   selbst und schlägt das Abteilungs-Signal.
3. **sonst** (bger ohne Band, BGE Band I/III/IV) → Steuer-Signal nur, wenn
   **kein** Sozialversicherungs-Erlass (SR 830–838) mitzitiert ist; sonst
   `sozialversicherung`.

**Warum der Guard in Stufe 3, aber nicht in Stufe 2 — gemessen, nicht
vermutet.** Die AHV-Beiträge Selbstständiger werden nach Art. 23 AHVV aus der
Steuermeldung der kantonalen Steuerbehörde abgeleitet; ein echter
AHV-Beitragsfall zitiert darum regelmässig das DBG. Am Bestand (29.8.2026):
von 69 Einträgen der 9C mit Steuer-Signal tragen **16** zusätzlich einen
SR-830–838-Erlass — die Gegenbeispiele sind real. Auf Band II greift der Guard
dennoch nicht, weil dort an **allen 68** Einträgen empirisch gilt, dass auch
die mit BVG-/ATSG-/AHVG-Zitat Steuerfälle sind: BGE 150 II 20 «Art. 32 Abs. 2
DBG, steuerliche Behandlung des Erneuerungsfonds», BGE 150 II 409
«Beschwerdelegitimation … direkte Bundessteuer», BGE 151 II 345 «Art. 85
MWSTG», BGE 150 II 478 «Art. 23 StHG, Grundstückgewinnsteuer».

**Deklarierte Grenze (§8).** BGE 149 II 381 (9C_259/2023, Parteientschädigung
bei «Überarztung», ATSG/KVG) ist inhaltlich Krankenversicherungsrecht, wurde
vom Bundesgericht aber in Band II publiziert und trägt kein Steuer-Signal — er
landet damit auf `oeffentlich`. Der amtlichen Bandzuteilung zu folgen ist
bewusst gewählt; die Alternative wäre eine redaktionelle Einzelfall-Zuordnung,
und die ist auf diesem Pfad ausgeschlossen (§2).

**Werkzeug-Falle, beim Verifizieren aufgefallen (29.8.2026).**
entscheidsuche.ch liefert im Feld `meta.de` für die 9C-Sammlung
(`CH_BGer_009_*`) die Bezeichnung «IV. Öffentlich-rechtliche Abteilung
(II. Sozialrechtliche Abteilung)». Das ist **falsch** — die Urteilsrubren
derselben Dokumente sagen «III. öffentlich-rechtliche Abteilung». Wer die
Abteilung aus Aggregator-Metadaten ableitet, baut den Fehler ein; massgeblich
sind Rubrum oder Präfix + BgerR.

### Bestands-Regen

`scripts/normtext/remap-sachgebiet-trennung.ts` (Scope: **nur** Snapshots mit
`sachgebiet === 'sozial-abgaben'`; alles Übrige byte-gleich). Ergebnis:

- 1267 Snapshots gewechselt → **40 `steuern` · 1227 `sozialversicherung`**,
  **0 ungelöst**.
- Register: 1619 Alt-Einträge → **79 `steuern` · 1540 `sozialversicherung`**
  (BGE-Einträge ziehen je einen `__voll`-Verweis mit). Einträge vorher = nachher
  = **6341**.
- Fixpunkt bewiesen: zweiter DRY-RUN meldet 0 Einträge im Alt-Topf.
- Diff-Reinheit belegt (Wort-Diff): in Snapshots und `register.json`
  ausschliesslich `sachgebiet`-Werte geändert, kein weiteres Byte.

Gesetze-Verteilung nachher (Bund): privat 30 · straf 11 · prozess 12 · schkg 5 ·
oeffentlich 105 · **steuern 9** · **sozialversicherung 29** · international 37.

Materialien: `scripts/materialien/rechtsgebiet-nachziehen.ts` rechnet die
abgeleitete Rechtsgebiets-Spalte der beiden generierten Register offline mit der
identischen Generator-Regel nach — 331 Wechsel (208 `sozialversicherung`, 91
`steuern`, 32 `oeffentlich`), Fixpunkt bewiesen, Wort-Diff belegt: nur
`rechtsgebiet`-Werte. Bewusst OHNE Fedlex-Netzlauf, sonst mischte sich die
Tagesfrische ins Diff und die Verhaltensneutralität wäre nicht mehr beweisbar (§6).

### Alt-URL-Kompatibilität

`ALT_GEBIET_ALIAS` (in `src/lib/normtext/register.ts`) bildet den abgelösten Wert
auf die **Vereinigung** seiner Nachfolger ab; `filterEntscheide` filtert darüber.
Eine gespeicherte Facetten-URL `?rg=sozial-abgaben` zeigt damit exakt dieselbe
Trefferliste wie vor der Trennung. Verworfen wurden: auf einen der beiden umleiten
(verlöre die Hälfte der Treffer, §8) und den Filter still fallen lassen (zeigte
plötzlich das ganze Korpus). Der Alias ist reine Eingabe-Toleranz — er wird nie
geschrieben, erscheint in keiner Facette und in keinem Zähler.

### Quirks der Trennung

- **Q-TR-1 · CO2-Gesetz ist die eine offene Flanke.** `CO2_GESETZ` (SR 641.71)
  steht als `oeffentlich`. Es war **nie** im Doppel-Topf, fällt aber unter die
  SR-Gruppe 64 «Steuern» — das Tor `normtext-register.test.ts` führt es darum als
  NAMENTLICHE Ausnahme (gefunden bei der Rot-Probe des Tors). Fedlex ordnet es
  641 zu, weil es die CO2-Abgabe trägt; sein Gegenstand ist Klima- und Umweltrecht,
  die Abgabe nur ein Instrument darin. Umklassierung wäre eine eigene fachliche
  Frage → **wartet auf David.**
- **Q-TR-2 · Sozialhilfe läuft unter «Sozialversicherung» mit.** Die Abteilung 8C
  führt auch Sozialhilfe-Beschwerden; solche Entscheide tragen jetzt
  `sozialversicherung` (Beleg: BGE 146 I 1, Genfer Sozialhilfegesetz, aza
  8C_444/2019). Fachlich ist Sozialhilfe keine Sozialversicherung. Die
  Abteilungs-Regel ist trotzdem die ehrlichste verfügbare — der Alternativweg wäre
  redaktionelle Einzelfall-Kuration (per J3-Spec gesperrt). Das UI etikettiert das
  Sachgebiet ohnehin als «maschinell» (§8).
- **Q-TR-3 · Ein Steuer-Norm-Signal schlägt eine Sozialversicherungs-`legal_area`.**
  Beleg BGE 147 II 248 (2C_404/2020): `legal_area` ist `social_insurance`, die
  Regeste betrifft aber Art. 9 Abs. 2 lit. h StHG (Abzug von Krankheits- und
  Unfallkosten) — das StHG-Signal gewinnt, das Ergebnis `steuern` ist richtig. Die
  deklarierte Prioritätsordnung (Norm-Signal vor `legal_area`) ist hier belegt
  besser als die Drittextraktion.
- **Q-TR-4 · Der Alt-Wert lebt in Kommentaren weiter.** In `entscheide-mapping.ts`
  und `adapter-entscheide.ts` stehen weiterhin Vorkommen von `'sozial-abgaben'` —
  ausnahmslos in historischen Begründungs-Kommentaren (J3-Herleitung, B2-Befund).
  Ein Grep auf den String ist darum kein Nachweis einer Rest-Verwendung; die
  belastbare Prüfung ist der Typ (`Rechtsgebiet` kennt den Wert nicht mehr) plus
  das Tor «kein Erlass trägt mehr den abgelösten Wert».

**Abnahme-Status:** maschinell umgesetzt, fachliche Abnahme der Trennungs-Regeln
durch David offen (§7). Adversariale Gegenprüfung ausstehend — `check:gegenpruefung`
steht rot, wie es soll.
