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
