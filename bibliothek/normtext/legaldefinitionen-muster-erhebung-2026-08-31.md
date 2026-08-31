# Legaldefinitionen — empirische Muster-Erhebung über den Gesamtkorpus

**Erstellt:** 31.8.2026 (Programm-Runde R6, FAHRPLAN-KANTONE §5 Phase III)
**Status:** Messung abgeschlossen · Umsetzung gelandet in `public/normtext/definitionen.json` · **fachliche Abnahme David offen** (alle Einträge `status: 'entwurf'`) · **GP-Korrektur R6.2 vom 31.8.2026 ergänzt (§GP-Korrektur unten — die ursprünglichen Zahlen bleiben stehen, sie sind datierte Stichproben-Aussagen)**
**Quelle:** die liegenden Norm-Snapshots des Repos, `public/normtext/{bund,kanton}/*.json` — Stand des Korpus-Laufs 29.8.2026, 1 458 Dateien / 56 113 Artikel-Einträge (Bund 227 Erlasse, Kanton 1 231 Erlasse über 26 Kantone). Offline, kein Netz.

## Warum dieses Dossier

Der **implementierte** Regelsatz steht im Kopf von
`scripts/normtext/definitionen-logik.ts` — dort gehört er hin, weil er dort
gelesen wird. Hier steht die **Messung**: welche Kandidaten geprüft wurden, wie
gross ihre Population ist, wie die Stichprobe gezogen wurde und **was mit
welcher Begründung durchgefallen ist**. Ohne das misst die nächste Runde
dieselben sechs Kandidaten noch einmal (§11; Negativbefunde nach
`STANDARDS.md` S5).

## Methode (deterministisch, reproduzierbar)

1. Kandidaten-Regex über ALLE Blocktexte und ALLE lit./Ziff.-Items des Korpus;
   Trefferzahl = Population.
2. Stichprobe: **jeder ⌊N/20⌋-te Treffer** in Korpus-Reihenfolge (systematisch,
   kein Zufall, kein Cherry-Picking). Bei Population < ~80: **Vollerhebung**.
3. Jeder Treffer von Hand als *echt* (Begriffsklärung) oder *unecht*
   (Fiktion · Rechtsfolge · Verweis · Gebot · Aufzählungs-Fortsetzung)
   beurteilt.
4. Aufnahmeschwelle **≥ ~90 %**. Bei `als-gilt` wurde eine ZWEITE, versetzte
   Stichprobe gezogen (Offset 37), weil es die mit Abstand grösste Population
   ist.

## Aufgenommen

| Muster | Population | Stichprobe | echt | Präzision |
|---|---:|---|---:|---:|
| `als-gilt` — «Als X gilt/gelten …» (Inversion) | 1 469 | 2 × 20 | 40/40 | 100 % |
| `legende-einleitung` — Lead-in «In diesem Gesetz gelten als:» + Item «X: …» | 344 | 20 Blöcke (60 Items) | 20/20 | 100 % |
| `kurzform` — «(nachfolgend: X)» / «(im Folgenden «X» genannt)» | 87 | 20 | 20/20 | 100 % |
| `guillemets` — «X» ist/sind … | 75 | Vollerhebung | 75/75 | 100 % |
| `im-sinne` — «X im Sinne dieses/dieser … ist/sind/…» | 47 | 20 | 20/20 | 100 % |
| `legende-marginalie` — Begriffs-Marginalie + Item «X: …» | 22 | Vollerhebung | 22/22 | 100 % |
| `unter-versteht` — «Unter X versteht man / ist … zu verstehen» | 13 | Vollerhebung | 13/13 | 100 % |
| `bedeutet-begriff` — «… bedeutet «X» Y» | 13 | Vollerhebung | 12/13 | 92 % |

Zu `legende-marginalie`: roh 22, davon 2 mit einem Erstwort, das keinen Begriff
eröffnen kann («im Fixzeitenmodell:» — Fallunterscheidung, nicht Term). Der
**Erstwort-Filter** (geschlossene Stoppwortliste: Pronomen, Präpositionen,
Kasus-Artikel ausserhalb des Nominativs) entfernt genau diese beiden; danach
22/22. Derselbe Filter entfernt bei `als-gilt` 20 anaphorische Treffer
(«Als solche gelten insbesondere …») — 1 469 → 1 449 roh.

Zu `bedeutet-begriff`: der eine unechte Treffer ist SSV Art. 68 Abs. 1bis
«Rotes Licht bedeutet «Halt».» — dort steht in den Anführungszeichen das
*Definiens*, nicht das *Definiendum*. Die Regel verlangt darum nach dem
schliessenden Anführungszeichen ein weiteres Wort; damit fällt dieser Fall
strukturell heraus (12/12).

## Verworfen — mit Grund (S5-Negativbefunde)

| Kandidat | Population | Präzision | Warum |
|---|---:|---:|---|
| «gilt als» **nicht** invertiert | 675 | 4/20 = 20 % | Fast durchweg **Fiktion/Rechtsfolge**, nicht Begriffsklärung: «gilt als nicht bestanden», «gelten als genehmigt», «gilt als erbracht», «gilt als im Ausland erbracht». Nur die Inversion stellt den definierten Begriff nach vorn. |
| «bezeichnet» | 804 | 0/12 = 0 % | Im Erlasstext heisst «bezeichnen» **ernennen/bestimmen** («Der Regierungsrat bezeichnet einen Konkurskreis»), nicht «benennt». Der naheliegendste Kandidat ist der wertloseste — genau der Fall, für den die Messung vor dem Bau steht. |
| «im Sinne dieses/dieser …» roh | 181 | 9/20 = 45 % | Überwiegend Rückverweis («Leistungsanspruch im Sinne dieses Gesetzes entsteht»), nicht Definition. |
| «bedeutet/bedeuten» freistehend | 145 | 6/20 = 30 % | Meist Legenden-Lead-in (bereits erfasst) oder gewöhnliches Verb («würde eine Doppelbelastung bedeuten»). |
| Begriffs-Marginalie + «X ist/sind …» | 51 | 44/51 = 86 % | **Unter der Schwelle.** Fehlerklassen: Gleichstellungssätze («Den übrigen juristischen Personen gleichgestellt sind …»), Verweissätze («Die Dispensationsgründe sind in den §§ 20–23 abschliessend genannt»), deontische Sätze («sind in das Budget aufzunehmen»), Aufzählungs-Fortsetzungen. Die zwei **strukturell markierten** Teilmengen sind einzeln aufgenommen (`guillemets`, `legende-marginalie`); der unmarkierte Rest bleibt draussen. |
| «Unter X ist/sind …» ohne «zu verstehen» | 39 | 5/20 = 25 % | «Unter Vorbehalt von Artikel 26 ist …» dominiert. |

Die Marginalie «Begriff(e)/Definition(en)» selbst kommt an **90** Artikeln vor;
sie ist ein guter *Zusatz*-Trigger, aber als alleinige Regel untauglich (sie
sagt nichts darüber, welcher Term definiert wird).

## Fremdsprachen — gezählt, NICHT aufgenommen

| Muster | Treffer |
|---|---:|
| fr «est/sont réputé(e)(s)» | 4 |
| fr «au sens de la présente …» | 4 |
| fr «on entend par» | 0 |
| it «ai sensi del/della presente» | 0 (die 2 `ai sensi`-Treffer sind Verweise auf Bundesrecht) |
| it «si intende per» | 0 |

Der fr/it-Teilkorpus (FR GE JU NE TI VD, zusammen 33 Erlasse / 1 453 Artikel)
ist für eine tragfähige Stichprobe zu dünn. Die Regeln bleiben
**unimplementiert**, statt ungemessen übernommen zu werden (§7). Aufnahme erst
mit eigener Stichprobe — offener Rest, siehe FAHRPLAN-KANTONE §5-R6.

## Nebenbefund am Korpus (nicht in dieser Runde gefixt)

Die **lit.-Marke ist im Korpus nicht eindeutig**: **623 Blöcke** tragen doppelte
Item-Marken. Grösstenteils Spiegelstrich-Punkte (`–`), aber auch echte
Verkürzungen — **HMG Art. 4 Abs. 1 hat sechs Punkte mit der Marke `a`**
(asexies … werden von der Fedlex-Extraktion auf `a` verkürzt; betroffen auch
DSG Art. 5). Das Tor `check:definitionen` wurde daran beim ersten Lauf rot.

**Regel für jede weitere Runde, die auf Aufzählungspunkte zeigt** (R2 Tabellen,
R3 Fussnoten, R5 Verweise): Anker ist der **Item-Index**, die Marke ist ein
Anzeigefeld und nie ein Schlüssel.

Ob die Marken-Verkürzung selbst ein Extraktions-Defekt ist, den der Bund-Adapter
beheben sollte, ist hier **nicht** entschieden — der Befund ist benannt, der Fix
gehört in einen eigenen, deklarierten Schritt (`scripts/normtext-snapshot.ts`,
fremde Bau-Fläche).

## Pflegebedarf

- **Gering.** Die Regeln lesen nur die liegenden Snapshots; kein Netz, kein
  externer Endpunkt, keine Datierung ausser `--datum`.
- Wächst der Korpus (neue Kantone/Erlasse), läuft der Generator ohne Änderung
  mit; `check:definitionen` wird rot, wenn das Artefakt nicht nachgezogen wurde.
- **Neu zu messen** ist nur, wenn ein Muster ERWEITERT werden soll — dann gilt
  dieselbe Methode oben, und die Zahlen hier werden **ergänzt, nicht
  überschrieben** (die Messwerte sind datiert und altern nicht).

---

## GP-Korrektur und Fix-Runde R6.2 (31.8.2026, gleicher Tag)

Die adversariale Gegenprüfung (Fable, 31.8.2026) hat das Verdikt **WIDERLEGT**
gefällt: die als-gilt-«100 %» waren eine **Stichproben-Aussage (2×20), keine
Populations-Aussage** — die 2×20-Ziehung hat drei unechte Klassen verfehlt.
Die alten Zahlen oben bleiben stehen (Belege altern nicht); hier die Korrektur
mit Neu-Messung nach dem Fix.

### B1 · Invertierte Fiktionen — vier endliche Guards (`definitionen-logik.ts`)

GP-Signatur war «Begriff beginnt mit Partizip II oder ‹nicht›». Die
Korpus-Nachmessung hat sie **verfeinert** (§7: Abweichung offengelegt):
attributives Partizip vor Substantiv ist hier überwiegend eine ECHTE
Definition («beschuldigte Person» StPO 111, «geschädigte Person» StPO 115,
«versicherter Verdienst» AVIG 23/UVG 15/UVV 22/MVV 16, «ernsthafte
Nachteile» AsylG 3) — eine pauschale Partizip-Erstwort-Regel hätte ~40
Lehrbuch-Definitionen entfernt. Die tragfähige Signatur ist die
**prädikative Stellung**. Implementiert (alle Vollerhebungen 31.8.2026):

| Guard | Regel | Treffer | Belege |
|---|---|---:|---|
| G-N | Erstwort «nicht» | 5 | FIDLEV 2 · BS 291.900 §9 · BS 153.270 §17 · BS 772.140 §4 · BS 861.540 §22 — alle Negativ-Fiktionen |
| G-P | Begriff ganz ohne grossgeschriebenes Wort UND ≥1 Wort Partizip II (endliche Morphologie: un-Abzug · -iert · De-Flexion e/em/en/er/es · «end»-Sperre für Partizip I · ge-Muster · trennbare+untrennbare Präfixe) | 24 | «angenommen» OR 395 · «entschuldigt» AR 412.01 · «abgelaufen» SG 811.1 · «verkürzt» AVIV 46/66a · «anerkannt» BS 270.100 u.a. |
| G-A | Partizip-II-Erstwort + «gilt/gelten nur» ODER Segment enthält «in der Fassung vom» | 2 | «bestandene Karenztage» AVIV 51a (Restriktion) · «erteilte Bewilligung» CHEMRRV Anh. 1.7 (intertemporale Gleichstellung) |
| G-R | Erstwort ∈ ROLLENNOMEN (B2) | 48 | s. unten |

**Gegenprobe gemessen:** «gilt/gelten nur» allein wäre FALSCH — 22 Treffer,
davon 21 echte restringierende Definitionen (USG 7 «Boden», AVIV 6
«Wartezeit», 14× «betriebsnotwendig»); nur mit Partizip-Erstwort trennt es.

**Dokumentierter Recall-Verzicht (G-P):** prädikatives Partizip ist am Korpus
MEHRDEUTIG — formgleich stehen Fiktion («entschuldigt») und Definition
(«beteiligt» BS 730.100 §133, «qualifiziert beteiligt» KAG 14,
«wirtschaftlich berechtigt» FinfraV-FINMA 10, «wirtschaftlich verbunden»
FINIV 3, «mitinteressiert» RVOV 4/AR 142.121, «beitragsberechtigt»
BS 428.300, «getrennt lebend» ELV 3, «gebunden» AR 612.0). GP-Vorgabe und
§1: im Zweifel raus — diese Grenzfälle gehen MIT raus und sind hier benannt.

### B2 · Rollennomen (48 Einträge raus)

Geschlossene Erstwort-Liste, je Vollerhebung: Grundlage 4 · Richtgrösse 1 ·
Obergrenze 1 · Nachweis 3 · Basis 2 · Stichtag 3 · **Beginn 13 · Ende 11**
(Entscheid: «Beginn/Ende der Steuerpflicht» DBG 61a/b + StHG + 9 Kantone ist
Ereignis-Aufzählung, kein Begriff — im Zweifel raus) · Ausnahme 1 ·
Bemessungsgrundlage 1 · Berechnungsgrundlage 2 · Zeitpunkt 3 ·
Einreichungsdatum 3. Lexikalisierte Komposita («Baubeginn», «Anmeldedatum»,
«Steuerperiode», «Verkehrswert») bleiben bewusst DRIN — eigenständige Termini.

### B4 · Legende-Köpfe mit Unterliste (+8 Einträge)

Der `rest.length<5`-Guard warf 8 echte Legende-Köpfe weg, deren Definiens in
den Unterpunkten steht. Fix: Kopf-Einträge mit Unterlisten-Zitat (Kopf +
direkt folgende tiefe>0-Items, je wörtlich, U+000A-verbunden; Tor-Prüfung D
rekonstruiert byte-genau): DSG 5 «besonders schützenswerte Personendaten» ·
MWSTG 3 «Lieferung» + «eng verbundene Personen» · FIDLEG 3
«Finanzinstrumente» · FINFRAG 2 «Finanzmarktinfrastruktur» · FAV 2
«Schnittstelle» · VVEA 3 «Siedlungsabfälle» + «Quecksilberabfälle».
Vollerhebung: genau 8 Fälle im Korpus. Regressionstest:
`scripts/normtext/definitionen-logik.test.ts`.

### B6 · Passiv «Als X wird/werden … bezeichnet» — NICHT aufgenommen

Vollerhebung 31.8.2026: **17 Treffer**, davon von Hand **13/17 echt (76 %)**
— unter der ~90-%-Schwelle. Unechte Klasse ist die **Organ-Ernennung**
(«Als kantonale Meldestelle wird das Aktuariat der Sanitätskommission
bezeichnet» AR 816.11 · Beratungsstelle Pro Infirmis BS 730.110 ·
«zuständiges Departement» BS 812.210; dazu prädikativ «geschlossen»
AR 341.11). Die echten Fälle (u.a. BS 497.120 «archäologischer Befund»,
ZStV 9 «Totgeborenes», FZA 10 «Bezugsjahr») bleiben **dokumentierter
Recall-Verzicht** — eine deterministische Trennung der Ernennungs-Klasse ist
nicht in Sicht, und 76 % Präzision fabrizierte falsche Einträge (§1/§7).

### B3 · Neu-Messung als-gilt nach dem Fix

Population **1 380** (vorher 1 459; −79 durch G-N/G-P/G-A/G-R, dazu +0 hier —
die 8 B4-Einträge zählen zur `legende-einleitung`). Deterministische
Stichprobe **jeder 13. Treffer, n = 107**, von Hand beurteilt:

- **104/107 echt = 97,2 %.** Unecht: LSV 2 «neue ortsfeste Anlagen»
  («gelten auch» Gleichstellung alt→neu) · AI 640.000 §23 «der Vorsorge
  dienend» (Steuer-Qualifikation) · BS 419.810 §5 «Erwerbstätigkeit»
  («gelten auch» Haushalt/Militärdienst — Gleichstellung).
- **Strengste Lesart** (zusätzlich ALLE «gelten auch»-Umfangserweiterungen
  als unecht gezählt: BEWV 1, DBG 16, FinfraV 58j, UVV 12): 100/107 =
  **93,5 %**. Beide Lesarten über der Schwelle; die Grauzone «gelten auch»
  (Umfangsbestimmung vs. Gleichstellungsfiktion) ist juristisches Urteil und
  bleibt bei der fachlichen Abnahme (§7/§8 — alle Einträge `entwurf`).
- Messbedingung: offline, liegender Korpus 29.8.2026, deterministische
  Ziehung ohne Zufall; Beurteilung Einzel-Session R6.2.

**Keine «100 %»-Behauptung mehr:** der Katalog-Kopf in
`definitionen-logik.ts` verweist für Populations-Aussagen hierher.

### Bilanz Artefakt R6 → R6.2

2 035 → **1 964** Einträge (−79 als-gilt-Fiktionen/Rollen, +8 Legende-Köpfe).
als-gilt 1 459 → 1 380 · legende-einleitung 342 → 350. Rot-Beweise: die
Belegfall-Tests waren vor dem Fix rot (40/47), je Guard einzeln per Mutation
rot gezeigt; Tor-Prüfung D am mutierten Kopf-Zitat rot (Meldung «keine
byte-gleiche Kopf+Unterpunkte-Kette»).

---

## §R6.3 · GP Runde 2 (31.8.2026, WIDERLEGT) — Definiens-Anbau + Guard-Morphologie

### Korrektur zu B4, datiert (Beleg-Regel: ergänzen, nie nachführen)

Die Aussage oben «Vollerhebung: genau 8 Fälle im Korpus» (B4) war
**prädikats-, nicht phänomenbezogen**: erhoben wurde die Population des
`rest.length<5`-Prädikats, nicht das Phänomen «Zitat ohne Definiens».
Die phänomenbezogene Vollerhebung am Artefakt (Lauf 31.8.2026,
`zitat.endsWith(':')` ohne Anbau) ergibt **339** Einträge: 306 als-gilt ·
18 legende-einleitung · 9 im-sinne · 3 guillemets · 3 kurzform. Die
GP-Zählung (323 = 304 + 18 + 1) war ihrerseits eine Untermessung —
Nachmessung offengelegt (§7). Die alte Zahl bleibt oben stehen; der
Zeichenzähler ist seit R6.3 gestrichen (`legendeBegriff` liefert nur noch
den Begriff, das Phänomen «Kopf-Satz endet auf ':'» entscheidet).

### F1 · Fix-Mechanik und Verwerf-Klassen

Zitat = Kopf-Satz + angekündigte Aufzählung, je wörtlich, U+000A-verbunden
(Blocktext-Kopf: alle Items des Blocks; Item-Kopf: direkt folgende tiefere
Items). Tor-Prüfung D rekonstruiert byte-genau, neue Tor-Prüfung F
(«Definiens vorhanden»: Zitat endet nicht auf ':' ODER trägt angehängte
Zeilen) war am Ist-Stand rot (339) und ist nach dem Fix grün. 333 Einträge
repariert; **5 verworfen** (Kopf ohne Fortsetzung an der Fundstelle):

- Definiens in Folgeblock/Tabelle: BOEB Anh. 3 («nachfolgend aufgeführte
  Leistungen» in eigenem Tabellenblock) · GR 310.250 Art. 3 II (Ansätze-
  Tabelle im Folgeblock).
- Flach-Extraktion (Unterpunkte auf GLEICHER Tiefe, nicht deterministisch
  zuordenbar): BS 685.360 §7 («Gebäudewert») · BS 910.500 §2 lit. b
  («Technische Vorschriften») · SZ 82040 §4 (verklebter Marginalien-Begriff).
- ERV 4 II lit. d («…einzig erfolgt durch:») ist KEIN eigener Kopf-Fall:
  der Punkt reist als Item samt t1-Kindern im Block-Zitat von
  «Als Instrumente mit Beteiligungscharakter gelten …» mit.

ZITAT_MAX 2000 → 4000: längstes legitimes Zitat nach Anbau 2 605 Zeichen
(MWSTG 8), zweitlängstes 2 207 (MWSTV 48a) — die Reissleine hätte beide
still gefressen (§6.7; Generator meldet die Maximallänge je Lauf).

### F2 · Rollennomen morphologisch (zweistufig)

Erstwort ± eine Flexionsendung (-e/-en/-n) gegen zwei geschlossene Listen:
**Suffix-Stämme** (Komposita/Plural gehen mit raus): Grundlage, Richtgrösse,
Obergrenze, Nachweis, Basis, Stichtag, Zeitpunkt, Einreichungsdatum.
**Exakt-Stämme**: Beginn, Ende, Ausnahme, **Periode (neu)**. Raus damit:
Zahlungsnachweise (EOV 21/35k/35s) · Berechnungsbasis (BS 164.250) ·
Stichtage (BS 424.510, BS 460.210) · KVV 96 II «Als Periode für die
Feststellung …» — **Gleichbehandlungs-Beleg KVV 96**: Abs. 3 «Als Zeitpunkt
der Inanspruchnahme …» war seit R6.2 draussen (Stamm Zeitpunkt), Abs. 2
blieb drin; seit R6.3 beide draussen.
**Grenzfall-Messung, warum «-ende» NIE Suffix ist:** naives Suffix-Matching
über alle Stämme träfe 60 Einträge, darunter echte Kern-Definitionen
(«nahestehende Personen» SchKG 286/288, «marktbeherrschende Unternehmen»
KG 4, «erschwerende Umstände» MWSTG 97, «ozonschichtabbauende Stoffe»
CHEMRRV, «Studierende» AR 411.5/BS 442.300) — der Stamm «Ende» kollidiert
morphologisch mit attributivem Partizip I. Die Termini-Komposita
Steuerperiode (×22) / Abrechnungsperiode / Kontrollperiode / Baubeginn /
Abbruchbeginn bleiben DRIN (R6.2-Entscheid oben, unverändert).

### F3 · Finites Verb im Begriff (geschlossene Liste)

Begriff mit finitem Verb = Satzfragment, kein Terminus. Vollerhebung am
Artefakt: **3 Treffer** (GP erwartete 1 — Abweichung offengelegt):
BS 427.950 §16 «Leistungsnachweise können auch solche» (der GP-Belegfall) ·
AVIV 8 «Berufe, in denen … üblich sind» (Relativsatz-Begriff, dokumentierter
Mit-Ausschluss: 76-Zeichen-Relativsatz ist kein Registerbegriff, GP-Vorgabe
«im Zweifel raus») · KVV 96 II (geht bereits über F2 raus).

### F4 · Partizip-I-Erweiterungsfiktion — ABWEICHUNG von der GP-Signatur

GP verlangte: Partizip-I-Einzelwort ohne Substantiv → pauschal raus.
Vollerhebung: **5 Treffer, davon 4 echte Definitionen** («rechtsetzend»
ParlG 22 IV, «vermögend» FIDLEG 5, «krebserzeugend» LRV Anh. 1,
«grenzüberschreitend» VEVA 3) — der Pauschal-Guard hätte 20 % Präzision
und läge unter jedem Katalog-Massstab (§1). Implementiert ist G-P1:
Partizip-I-Einzelwort **nur** in der Erweiterungsfiktion «gilt/gelten
auch» → raus; einziger Treffer StPO 428 «Als unterliegend gilt auch die
Partei …». Abweichung offengelegt (§7); Verdikt der GP Runde 3 offen.

### Bilanz Artefakt R6.2 → R6.3

1 964 → **1 949** (−15: 5 F1-verworfen · 7 F2 · 2 F3 · 1 F4), 333 Einträge
per Anbau repariert, 0 Rest-Doppelpunkt-Köpfe, 0 sonstige Zitat-Änderungen
(Diff-Vollerhebung alt↔neu). Rot-Beweise: Tor-Prüfung F am Ist-Stand rot
(339/1964); Belegfall-Tests 9 rot / 52 grün vor dem Fix, 61/61 danach;
Mutations-Rot je Prüfung (D: gestohlene Fortsetzungszeile → «keine
byte-gleiche Kopf+Fortsetzung-Kette», F: nackter Kopf). Messbedingung:
offline, liegender Korpus 29.8.2026, kalt, Einzel-Session R6.3.

### Stichprobe R6.3 gegen die Amtsquellen (1.9.2026)

Deterministische Ziehung: jeder 33. der 341 mehrzeiligen (angebauten)
Einträge, n = 11 (8 Bund · 3 Kanton). Identitätsprüfung je Zitat-ZEILE
(49 Zeilen gesamt) gegen die amtliche Quelle — Bund: gepinnte kanonische
Fedlex-Filestore-Manifestation (fedlex-cache.sh-Pins), Kanton: LexWork-API
`/api/de/texts_of_law/{id}` (`selected_version.xhtml_tol`), version_uid
jeweils == Snapshot-`fassungsToken` (keine Drift). **Trefferquote 11/11**
(AHVG 5 · BEWG 10 · ChemV 2 · FIDLEV 96 · GwV-FINMA 13 · MepV 3 · OR 734a ·
VMWG 6c · AR 526.21 Art. 31 · BS 419.700 §4 · SG 811.1 Art. 83bis).
Messbedingung: live-Fetch 1.9.2026, Vergleich nach Tag-/Fussnoten-Strip +
Entity-Dekodierung, leerzeichenfrei (Fedlex-Inline-`<i>` erzeugt sonst
Kunst-Leerzeichen — zwei Probe-Iterationen waren Messartefakte der Probe,
nie der Daten; dokumentiert im R6.3-Bericht).
