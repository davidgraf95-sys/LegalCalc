# Invarianten-Katalog der Rechen-Engines (Eigenschafts-Tests)

**Erstellt:** 15.8.2026 · ROADMAP-Schritt QS-CODE-PROP
**Status:** technisch bewiesen, soweit unten so markiert — die als *fachlich
vorzulegen* markierten Zeilen warten auf David (§7: `verified`/«geprüft» wird
nie automatisch gesetzt).
**Werkzeug:** `fast-check` ^4.8, fester Seed `20260815`
(`src/tests/propertyArb.ts`), je Engine eine Datei `src/tests/*.property.test.ts`.

Eine **Invariante** ist eine Aussage, die für JEDE zulässige Eingabe gilt —
nicht ein einzelner Beispielwert. Die Tests erzeugen dafür Tausende Eingaben
und schrumpfen ein Gegenbeispiel auf den kleinsten Fall. Wird eine Invariante
real rot, ist das ein **Rechen-Befund** (§1) und kein Grund, die Invariante
abzuschwächen.

**Status-Legende**
- **technisch bewiesen** — die Aussage folgt aus Norm-Wortlaut, Engine-Doku
  oder bestehendem Test; der Property-Test hält sie über die volle
  Eingabedomäne und wurde einmal rot gezeigt (§6.7).
- **fachlich vorzulegen** — juristische Wertung offen; die Aussage wird NICHT
  als Invariante behauptet (Auftragsgrenze: keine erfundenen Rechtsregeln).

---

## Querschnitt

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| Q-1 | **Determinismus:** gleiche Eingabe ⇒ byte-gleiche Ausgabe, inklusive Rechenweg und Prosa. Gilt für JEDE Engine. | CLAUDE.md §2 | technisch bewiesen (12/12 Engines) |
| Q-2 | **Grenzen:** kein ausgewiesener Betrag oder Tag ist `NaN`, `Infinity`, negativ oder `Invalid Date`. | §8 (Ehrlichkeit); UI-Vertrag | technisch bewiesen |
| Q-3 | **Spannen nie invertiert:** jede Ermessens-Spanne erfüllt `von ≤ bis`. | §8; Rahmen-Semantik | technisch bewiesen |
| Q-4 | **Rundungs-Kohärenz:** jeder CHF-Betrag ist rappengenau; abgeleitete Werte weichen höchstens einen halben Rappen von der ungerundeten Rechnung ab (Hauskonvention `round2`). | Engine-Kopf `gebvKosten.ts` | technisch bewiesen |

---

## `fristenEngine` — fachneutrale Fristen-Primitiven

Datei: `src/tests/fristenEngine.property.test.ts` · numRuns 1000 · geprüft über
die drei realen Regimes (ohne Stillstand · ZPO-Ruhen · SchKG-Betreibungsferien).

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| FE-1 | Determinismus aller vier Primitiven. | §2 | technisch bewiesen |
| FE-2 | `nthWerktagNach(d, n)` liegt **strikt nach** `d`, ist ein Werktag und wächst streng mit `n`. | Art. 63 SchKG; BGE 108 III 49; Engine-Doku | technisch bewiesen |
| FE-3 | Tagesfrist: `ereignis < diesAQuo ≤ ende`, und `ende ≥ ereignis + laenge`. Ruhen kann nur verlängern. | Art. 142 Abs. 1 ZPO | technisch bewiesen |
| FE-4 | Tagesfrist ist **streng monoton** in der Fristlänge. | Zähl-Semantik der Norm | technisch bewiesen |
| FE-5 | Kalenderfrist: `diesAQuo ≥ ereignis`, `verlaengerungTage ≥ 0`, `ende ≥ naives Ende`. | Art. 146 Abs. 1 ZPO | technisch bewiesen |
| FE-6 | `normalisiereEnde` verschiebt **nur vorwärts**; das Ergebnis ist stets ein Werktag ausserhalb geschlossener Zeit; das `verschoben`-Flag stimmt mit dem Datum überein. | Art. 142 Abs. 3 ZPO / Art. 63 SchKG | technisch bewiesen |

## `allgemeineFrist` — Art. 77/78 OR

Datei: `src/tests/allgemeineFrist.property.test.ts` · numRuns 1000.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| AF-1 | Determinismus. | §2 | technisch bewiesen |
| AF-2 | `start < fristbeginn ≤ rohes Ende ≤ Fristende`; der Fristbeginn ist genau der Folgetag. | Art. 77 Abs. 1 OR (dies a quo non computatur) | technisch bewiesen |
| AF-3 | `verschoben` ⟺ Enddatum ≠ rohes Ende; die Verschiebung geht nie zurück. | Art. 78 OR | technisch bewiesen |
| AF-4 | Monotonie: mehr Frist ⇒ nie früheres Ende. | Zähl-Semantik | technisch bewiesen |
| AF-5 | Mit gewählter Verschiebung endet die Frist nie an einem Samstag/Sonntag, mit Feiertags-Option auch nie an einem anerkannten Feiertag des Kantons. | Art. 78 Abs. 1 OR; SR 173.110.3 | technisch bewiesen |
| AF-6 | Rückwärtsfrist: Handlungstag liegt **strikt vor** dem Stichtag; die Option «vorverlegen» verschiebt nur rückwärts und nie auf ein Wochenende. | Art. 77 OR analog; Art. 700 Abs. 1 OR; Engine-Doku | technisch bewiesen |
| AF-7 | `tageZwischen` ist symmetrisch, nie negativ, `werktageMoFr ≤ kalendertage`, und die Kalendertage entsprechen `differenceInCalendarDays`. | reines Zählwerkzeug (§4) | technisch bewiesen |

## `schkgFristen` — Art. 31/56/63 SchKG

Datei: `src/tests/schkgFristen.property.test.ts` · numRuns 400.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| SF-1 | Determinismus. | §2 | technisch bewiesen |
| SF-2 | `ereignis ≤ diesAQuo ≤ diesAdQuem`; bei Tagesfristen ist der dies a quo echt der Folgetag. | Art. 142 Abs. 1/2 ZPO i.V.m. Art. 31 SchKG | technisch bewiesen |
| SF-3 | Das Wartefrist-Datum ist stets ein Werktag; ohne Stillstand liegt es **echt nach** dem Fristablauf. | Art. 88 Abs. 1 SchKG («frühestens … nach»); Bug-Check 10.6.2026 | technisch bewiesen |
| SF-4 | Jede Handlungsfrist endet auf einem Werktag des gewählten Kantons. | Art. 31 SchKG i.V.m. Art. 142 Abs. 3 ZPO | technisch bewiesen |
| SF-5 | Regime-Trennung: Betreibungsferien- und ZPO-Regime enden nie vor dem Regime «kein»; `modusAktiv` bleibt erkennbar. | §4; Art. 145 ZPO / Art. 63 SchKG | technisch bewiesen |
| SF-6 | Monotonie in der Fristlänge — **eingeschränkt** auf `kein` und `zpo_stillstand`. | Untergrenzen-Semantik der Endverschiebung | technisch bewiesen (eingeschränkt) |
| SF-7 | Hemmung der Verwirkungsfrist verlängert nur — **eingeschränkt** auf `kein` und `zpo_stillstand`. | Art. 88 Abs. 2 / 166 Abs. 2 SchKG | technisch bewiesen (eingeschränkt) |
| SF-8 | **Pin:** Im Betreibungsferien-Regime ankert die Verlängerung am ENDE der geschlossenen Zeit, nicht am ursprünglichen Ablauf. Belegt: Ereignis 25.12.2015, AG — 7 Tage → 6.1.2016, 8 Tage → 4.1.2016. | Art. 63 Satz 2 SchKG, Wortlaut am gepinnten Cache verifiziert 15.8.2026: «… so wird die Frist bis zum dritten Tag nach **deren** Ende verlängert» | technisch bewiesen (norm-getreu) |

**Fachlich vorzulegen (SF-F1):** Wegen SF-8 ist das Fristende im
Betreibungsferien-Regime **nicht monoton** — eine LÄNGERE Frist kann FRÜHER
enden, und eine Hemmung nach Art. 88 Abs. 2 SchKG kann eine Verwirkungsfrist
verkürzen (belegt: Ereignis 1.1.2015, Jahresfrist, AG — ohne Hemmung
6.1.2016, mit einem Tag Hemmung 4.1.2016). Das ist die mechanische Folge des
Norm-Wortlauts, nicht ein Engine-Defekt. Offen bleibt die juristische Frage,
ob die Art.-63-Verlängerung bei einer gehemmten Frist erhalten bleiben muss.
Bis zum Entscheid wird nichts geändert; die Stelle ist durch den Pin SF-8
sichtbar gehalten.

**Fachlich vorzulegen (SF-F2):** Ein Wartefrist-Ablauf innerhalb der
Betreibungsferien führt zu einem früheren «frühesten Handlungstag» als
dieselbe Frist als Handlungsfrist (4.1.2016 gegenüber 6.1.2016). Die Engine
wendet Art. 63 SchKG bewusst nicht auf Wartefristen an (QS-GP-Fix 2.7.2026);
ob das im Ergebnis richtig ist, ist eine Wertung.

## `bggVwvgFristen` — Art. 22a VwVG / Art. 46 BGG

Datei: `src/tests/bggVwvgFristen.property.test.ts` · numRuns 1000.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| BV-1 | Determinismus. | §2 | technisch bewiesen |
| BV-2 | Ende liegt nach dem Ereignis, ist ein Werktag, und bei Tagesfristen nie vor `ereignis + laenge`. | Art. 20 Abs. 3 VwVG / Art. 45 BGG | technisch bewiesen |
| BV-3 | `stillstandAktiv` ⟺ Einheit «tage»; Nicht-Tagesfristen tragen die Offenlegung der Schranke. | Art. 22a Abs. 1 VwVG / Art. 46 Abs. 1 BGG («nach Tagen bestimmte» Fristen) | technisch bewiesen |
| BV-4 | Regime-Trennung: gleiches Datum (geteilte Perioden), aber **nie** gleicher Norm-Anker und **nie** gleicher Ausnahmekatalog — VwVG 2 Ausnahmen, BGG 5; kein VwVG-Anker enthält «BGG» und umgekehrt. | §4; Art. 22a Abs. 2 VwVG vs. Art. 46 Abs. 2 lit. a–e BGG | technisch bewiesen |
| BV-5 | Monotonie in der Fristlänge. | Ruhen + Werktagsverschiebung sind Untergrenzen-Operationen | technisch bewiesen |

## `erbFristen` — ZGB-Fristenkatalog

Datei: `src/tests/erbFristen.property.test.ts` · numRuns 1000 · alle 15 Katalog-Tatbestände.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| EF-1 | Determinismus. | §2 | technisch bewiesen |
| EF-2 | Fristende liegt für jeden Tatbestand echt nach dem Trigger; Status stets `ok`. | Art.-77-OR-analoge Zählung (Engine-Annahme) | technisch bewiesen |
| EF-3 | Der Katalog wird unverfälscht angewandt: zurückgegebenes Preset = angefragter Key, rohes Ende = Trigger + Katalog-Dauer (mit Monatsende-Klemmung). | §5 Single Source of Truth; Art. 77 Abs. 1 Ziff. 3 OR analog | technisch bewiesen |
| EF-4 | Werktags-Option verschiebt nur vorwärts und nie auf Samstag/Sonntag/Feiertag. | Art. 78 OR analog | technisch bewiesen |
| EF-5 | Gruppen-Trennung: nur «erbgang» trägt Art. 570/576 ZGB, nur «klage» den Einrede-Vorbehalt (Art. 521 Abs. 3 / 533 Abs. 3 ZGB); die eigene Katalog-Norm steht immer in den Normverweisen. | §4; §8 | technisch bewiesen |

## `kuendigungsfrist` — Art. 335a–c OR

Datei: `src/tests/kuendigungsfrist.property.test.ts` · numRuns 1000.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| KF-1 | Determinismus. | §2 | technisch bewiesen |
| KF-2 | Beendigung liegt stets nach dem Zugang der Kündigung. | Zugangsprinzip; Art. 335b/c OR | technisch bewiesen |
| KF-3 | Regime-Trennung Probezeit: `istProbezeit` ⟺ `fristMonate = 0` ⟺ Beendigung = Zugang + 7 Tage; ausserhalb liegt die Frist stets in der gesetzlichen Staffel {1, 2, 3}; ohne vereinbarte Probezeit gibt es keine. | Art. 335b/335c Abs. 1 OR | technisch bewiesen |
| KF-4 | Längere Betriebszugehörigkeit ⇒ nie kürzere Frist und nie frühere Beendigung (ohne Probezeit geprüft). | Art. 335c Abs. 1 OR (1 / 2 / 3 Monate) | technisch bewiesen |
| KF-5 | Mit Monatsendtermin ist der ordentliche Endtermin der Monatsletzte und liegt nie vor dem taggenauen Fristlauf; der Fristlauf ist exakt Zugang + `fristMonate`. | Art. 335c Abs. 1 OR | technisch bewiesen |
| KF-6 | Resttage des Urlaubs des andern Elternteils verlängern **taggenau** über den ordentlichen Endtermin hinaus, ausschliesslich bei Arbeitgeberkündigung, und verschieben den ordentlichen Endtermin nicht. | Art. 335c Abs. 3 i.V.m. Art. 329g OR; SHK-Abgleich-Fix 10.6.2026 | technisch bewiesen |

## `sperrfristen` — Art. 336c OR

Datei: `src/tests/sperrfristen.property.test.ts` · numRuns 500 · Zweig-Abdeckung
gemessen (500 Fälle: 59 Nichtigkeiten, 21 echte Verlängerungen, 79 Probezeit).

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| SP-1 | Determinismus. | §2 | technisch bewiesen |
| SP-2 | Beendigung nach dem Zugang; jedes Sperrintervall `von ≤ bis`; Sperrtage, Kontingente und Restkontingente nie negativ. | Art. 336c Abs. 1 OR; §8 | technisch bewiesen |
| SP-3 | Regime-Trennung: Arbeitnehmerkündigung und Probezeit-Kündigung sind identisch zur reinen Kündigungsfrist-Engine und nie nichtig. | Art. 336c Abs. 1 OR (nur Arbeitgeberkündigung); Art. 335b OR | technisch bewiesen |
| SP-4 | Sperrereignisse verlängern nur — das Verhältnis endet nie früher als ohne sie. | Art. 336c Abs. 2/3 OR (Unterbruch + Erstreckung) | technisch bewiesen |
| SP-5 | Bei Nichtigkeit wird **kein** Beendigungsdatum ausgewiesen; stattdessen Sperrfristende und frühester neuer Kündigungstag, der nie davor und nie am Zugangstag liegt. | Art. 336c Abs. 2 Satz 1 OR; §8 | technisch bewiesen |

## `verjaehrung` — Art. 60/67/127–142 OR

Datei: `src/tests/verjaehrung.property.test.ts` · numRuns 500 · alle 6 Regimes.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| VJ-1 | Determinismus. | §2 | technisch bewiesen |
| VJ-2 | Verjährungseintritt liegt echt nach dem Fristbeginn, stets auf einem Werktag am Erfüllungsort, und `werktagsEnde` ist darauf idempotent. | Art. 132 Abs. 1/2 i.V.m. Art. 78 OR | technisch bewiesen |
| VJ-3 | Das Verdikt am Stichtag widerspricht nie dem ausgewiesenen Datum: `verjaehrtAmStichtag` ⟺ Stichtag > letzter Tag; ohne Fristende nie «verjährt». | Art. 142 OR; §8 | technisch bewiesen |
| VJ-4 | Stillstand verlängert nur; `gehemmtTage ≥ 0`; ungültige Perioden verkürzen die Frist nicht. | Art. 134 OR («gehemmte Tage werden angehängt») | technisch bewiesen |
| VJ-5 | Ohne Unterbrechung ist das massgebliche Ende das **frühere** von relativer und absoluter Frist, und die benannte Frist zeigt auf genau dieses Datum. | Art. 60/67 OR; Engine-Doku «die relative Frist kann nie über die absolute hinauslaufen» | technisch bewiesen |
| VJ-6 | Regime-Trennung: Zwei-Fristen-Regimes verweigern die Rechnung ohne absoluten Beginn (`unzulaessig`); Ein-Fristen-Regimes rechnen ohne ihn und weisen nie ein absolutes Ende aus. | §4; Art. 127/128 vs. 60/67/128a OR | technisch bewiesen |
| VJ-7 | Einredeverzicht wirkt nur vorwärts und höchstens 10 Jahre ab Verjährungseintritt. | Art. 141 Abs. 1 OR | technisch bewiesen |

## `streitwert` — Art. 91–94a ZPO

Datei: `src/tests/streitwert.property.test.ts` · numRuns 1000.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| SW-1 | Determinismus. | §2 | technisch bewiesen |
| SW-2 | Beide Ausgaben sind `null` oder endliche Zahlen ≥ 0. | §8 | technisch bewiesen |
| SW-3 | **Kein Schätzen:** enthält die Häufung ein nicht bezifferbares Begehren, sind Verfahrens-Streitwert UND Kosten-Basis `null`, mit Warnung. | §2; Art. 91 Abs. 2 / Art. 94a ZPO | technisch bewiesen |
| SW-4 | Sich ausschliessende Begehren ergeben nie mehr als die Zusammenrechnung. | Art. 93 Abs. 1 ZPO | technisch bewiesen |
| SW-5 | Widerklage: Verfahrens-Streitwert = max(Haupt, Widerklage); die Kosten-Basis folgt einem **eigenen** Regime (Teilklage nur Hauptklage; Ausschluss = höherer Wert; sonst Summe). | Art. 94 Abs. 1/2/3 ZPO (Abs. 3 Rev. 2025) | technisch bewiesen |
| SW-6 | Monotonie im bezifferten Betrag. | Zusammenrechnungs-/Maximum-Semantik | technisch bewiesen |
| SW-7 | Grenzwert-Regimes kollabieren nicht: ZPO-Verfahrensgrenze stets 30 000 und **gebietsunabhängig** (auch im Verdikt), BGG-Schwelle 15 000/30 000 gebietsabhängig, Richtung gegenläufig (ZPO «bis», BGG «ab»); Ermessen ⇒ beide Verdikte `null`; nicht-rechenbare Tore stets offengelegt. | Art. 243 Abs. 1 ZPO vs. Art. 74 Abs. 1 lit. a/b BGG; §4/§8 | technisch bewiesen |

## `gebvKosten` + `schkgZustaendigkeit` — GebV SchKG

Datei: `src/tests/gebvKosten.property.test.ts` · numRuns 1000.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| GB-1 | Determinismus aller Gebühren-Funktionen. | §2 | technisch bewiesen |
| GB-2 | Alle vier Staffeln sind monoton (nie fallend), auch **erschöpfend** an jeder Bandgrenze (100 / 500 / 1 000 / 10 000 / 100 000 / 1 000 000) — der klassische Off-by-one-Ort. | Art. 16/19/20/30 GebV SchKG (aufsteigende Staffeln) | technisch bewiesen |
| GB-3 | Jede Gebühr endlich, ≥ 0, rappengenau; Einzahlungsgebühr ≤ CHF 500; Zahlungsbefehl trägt stets eine Band-Bezeichnung. | Art. 19 Abs. 1 GebV SchKG; Q-4 | technisch bewiesen |
| GB-4 | Entscheid-Rahmen (Art. 48): `0 < von < bis`, beide rappengenau — nie zu einem Punktwert verdichtet. | Art. 48 Abs. 1 GebV SchKG; §2-Schnitt | technisch bewiesen |
| GB-5 | Verwertung: mit Erwerber ≤ Erlös; ohne Erwerber ≤ CHF 1 000 und ≤ halbe Rohgebühr (Rundungstoleranz ein halber Rappen). | Art. 30 Abs. 3/4 GebV SchKG | technisch bewiesen |
| GB-6 | Punktwerte und Ermessens-Rahmen bleiben getrennt: die Rahmengebühr erhöht das Total nie; ohne Entscheid-Gesuch gibt es keine Bandbreite. Das Zahlungsbefehls-Total steigt mit der Forderung. | §2-Schnitt (Dossier §C) | technisch bewiesen |
| GB-7 | Betreibungsort-Regimes kollabieren nicht: bei GRUNDPFAND und beim KONKURSBEGEHREN wird der Arrest-Wahlort nie angeboten; Grundpfand trägt stets den Anker Art. 51 Abs. 2 SchKG; jede Konstellation liefert Ort, Forum, Eingabe und Norm-Anker. | Art. 51 Abs. 2 / Art. 52 Satz 2 SchKG; §4 | technisch bewiesen |
| GB-8 | Die Art.-16-Staffel wird in `schkgZustaendigkeit` wiederverwendet, nicht zweitgepflegt. | §5 | technisch bewiesen |

## `bgerRechtsweg` — BGG

Datei: `src/tests/bgerRechtsweg.property.test.ts` · numRuns 1000.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| BG-1 | Determinismus. | §2 | technisch bewiesen |
| BG-2 | `fristTage ∈ {null, 3, 5, 10, 30}` mit Norm-Anker; Rechtsverweigerung ⇒ keine Frist, kein Fristende, keine Stillstandsfrage. | Art. 100 Abs. 1–4/7 BGG | technisch bewiesen |
| BG-3 | Konkretes Fristende liegt nach der Eröffnung, nie vor dem naiven Ablauf, und auf einem Werktag. | Art. 44 Abs. 1 / Art. 45 BGG | technisch bewiesen |
| BG-4 | Hard-Stop: Markenwiderspruch bleibt bei **jedem** Streitwert und trotz Ausnahmegründen unzulässig, ohne Abteilung und ohne Fristende. | Art. 73 BGG | technisch bewiesen |
| BG-5 | Zivil: Verdikt entspricht exakt der gebietsabhängigen Schwelle (15 000 arbeits-/mietrechtlich, sonst 30 000); ohne bezifferten Streitwert bleibt es «offen» statt «zulässig». | Art. 74 Abs. 1 lit. a/b BGG; §8 | technisch bewiesen |
| BG-6 | Schiedsbeschwerde und SchKG-Aufsicht sind streitwertunabhängig; Aufsichtsfrist 10 Tage, bei Wechselbetreibung 5 Tage und ohne Stillstand. | Art. 77 / 74 Abs. 2 lit. c / 100 Abs. 2 lit. a / 100 Abs. 3 lit. a / 46 Abs. 2 lit. b BGG | technisch bewiesen |
| BG-7 | Die Abteilungs-Zuteilung ist total (jedes Zivilgebiet erhält genau eine der beiden Abteilungen mit passendem Norm-Anker); Rechtsöffnung geht in die I., übrige SchKG-Sachen in die II. | Art. 33 lit. i / Art. 34 lit. c BGerR | technisch bewiesen |
| BG-8 | `bgerKapitalwert20x(x) = 20·x`, monoton, nie negativ. | Art. 51 Abs. 4 BGG | technisch bewiesen |

## `prozesskosten` — Art. 95–99/106–118 ZPO

Datei: `src/tests/prozesskosten.property.test.ts` · numRuns 400 · alle 26 Kantone.

| # | Invariante | Herleitung | Status |
|---|---|---|---|
| PK-1 | Determinismus. | §2 | technisch bewiesen |
| PK-2 | Kein Betrag negativ, keine Spanne invertiert, jeder Tarif mit Norm-Anker. | §7/§8 | technisch bewiesen |
| PK-3 | Im Schlichtungsverfahren wird **nie** eine Parteientschädigung gesprochen — in keinem Kanton, keiner Materie, mit Art.-113-Begründung. | Art. 113 Abs. 1 ZPO | technisch bewiesen |
| PK-4 | Phasen kollabieren nicht: Miete/Pacht ist in der Schlichtung kostenlos, im Entscheidverfahren nicht; die Arbeits-Kostenfreiheit endet exakt oberhalb CHF 30 000. | Art. 113 Abs. 2 lit. c/d vs. Art. 114 ZPO | technisch bewiesen |
| PK-5 | Monotonie: höherer Streitwert ⇒ nie tiefere Untergrenze bei Gerichtskosten und Parteientschädigung. | aufsteigende kantonale Staffeln; Kostenfreiheits-Schwelle springt aufwärts | technisch bewiesen |
| PK-6 | Kostenrisiko: Quote wird auf [0,1] geklemmt; volles Obsiegen belastet mit 0 Gerichtskosten und 0 netto; volles Unterliegen belastet nie weniger; unentgeltliche Rechtspflege befreit von den eigenen Gerichtskosten. | Art. 106/111/118 ZPO | technisch bewiesen |
| PK-7 | Kostenvorschuss: `faktor ∈ {0.5, 1}`, `voll` ⟺ Faktor 1, Vorschuss nie über den mutmasslichen Gerichtskosten, stets mit Norm-Anker. | Art. 98 Abs. 1/2 ZPO (Fassung 1.1.2025); Art. 62 BGG | technisch bewiesen |
| PK-8 | MwSt: Enthält der Tarif sie bereits, wird **kein** Aufschlag gerechnet (keine Doppelzählung); sonst brutto ≥ netto und Spanne nie invertiert. | Art. 95 Abs. 3 lit. b ZPO; Bug-Check 15.6.2026 | technisch bewiesen |
| PK-9 | Sicherheitsleistung: Schlichtung, summarisches Verfahren und DSG-Streitigkeiten schliessen die Kaution aus — ohne Spanne, mit Begründung. | Art. 99 Abs. 3 lit. c/d ZPO; Art. 113 Abs. 1 ZPO | technisch bewiesen |

## `tarif/staffel` — Beurkundung/Grundbuch

Bereits abgedeckt durch `src/tests/tarifStaffel.property.test.ts`
(Werkzeug-Audit Nulltarif-Paket): Determinismus, Monotonie, Bandgrenzen,
Stetigkeit an der `abChf`-Kante, Rahmen nie invertiert, Rundungs-Invarianz.
Nicht dupliziert (§17-Rückbau: wer hinzufügt, ersetzt zuerst die Stelle, die
dieselbe Sorge schon trägt).

---

## Nicht behauptet — bewusst weggelassen

| Kandidat | Warum nicht |
|---|---|
| «Fristende ist monoton in der Fristlänge» als **Querschnitts**-Invariante | Im SchKG-Betreibungsferien-Regime norm-getreu falsch (SF-8). |
| «Mehr Streitwert ⇒ mehr Gebühr» als **strenge** Monotonie | Die realen Tarife enthalten Plateaus (gleiche Gebühr über ein ganzes Band); nur «nie fallend» ist belegbar. |
| «Die Kosten-Basis ist nie kleiner als der Verfahrens-Streitwert» | Bei Teilklage (Art. 94 Abs. 3 ZPO) ist sie kleiner — die Umkehrung wäre eine erfundene Regel. |
| «Ein Rahmen ist immer breiter als null» ausserhalb Art. 48 GebV SchKG | Kantonale Tarife kennen entartete Rahmen (von = bis); nur für Art. 48 ist die echte Spanne belegt. |

## Laufzeit

`npx vitest run src/tests/*.property.test.ts` — 13 Dateien, 99 Tests,
**7,6 s** (Messbedingung: warm, lokal, Vitest-Default-Parallelität).
Budget < 30 s eingehalten; `numRuns` je Engine im Tabellenkopf vermerkt.

## Rot-Beweis (§6.7)

Jede Invariante wurde einmal rot gezeigt: die INVARIANTE wird im Test
invertiert (nie die Engine), der Testlauf muss scheitern. Ergebnis
**89/89 Tests rot** über alle zwölf neuen Dateien; der eine Nachzügler
(`bgerRechtsweg` BG-6 Schiedsbeschwerde, `.not.toBe` — vom Skript doppelt
invertiert) wurde von Hand rot gezeigt: `expected 'zulaessig_ausnahme' to be
'schwelle_verfehlt'`. Danach byte-gleich zurückgebaut, alle Dateien grün.
