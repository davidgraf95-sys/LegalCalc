# Vorsorgeauftrag — fachliche Grundlage für den Umbau

**Erstellt:** 2.8.2026 (Nachtlauf-Session W2·8) · **Stand** der Normprüfung:
Snapshots 1.7.2026 (ZGB) / 1.1.2026 (OR), ZStV/ZStGV live 2.8.2026.

Inhaltliche Zusammenstellung für die Überarbeitung der Vorsorgeauftrags-Vorlage
(`src/lib/vorlagen/vorsorgeauftrag.ts`): was rechtlich gilt, was heute unrichtig
oder unvollständig ist, welche Inhalte ins Dokument gehören — und Überlegungen,
wie das Werkzeug für die errichtende Person, die beauftragte Person und die
prüfende KESB brauchbarer wird. Methodisches Vorbild ist das
PV-Grundlagendokument (Patientenverfügung, Cowork-Session Juli 2026).

**Normbasis:** eigener Normtext-Snapshot `public/normtext/bund/ZGB.json`
(Stand 1.7.2026, abgerufen 27.7.2026) und `OR.json` (Stand 1.1.2026); ZStV/ZStGV
live via Fedlex-SPARQL/AKN-XML verifiziert (Session 2.8.2026, Agenten-Protokolle).
Jeder Norm-Anker unten ist ein Identitäts-Treffer am Wortlaut, keine Plausibilität.

**Status:** Erstrecherche, zweifach agentisch geprüft (Norm-Verifikation +
Gebühren-Verifikation) · **fachliche Abnahme durch David: OFFEN** · Entscheide
dieser Session sind als solche gekennzeichnet und morgens rückholbar.

Der gedankliche Ausgangspunkt, vom PV-Dokument übernommen und hier angepasst:
Adressat eines Vorsorgeauftrags ist nicht die errichtende Person, sondern die
KESB, die ihn Jahre später validieren muss, die Bank, die ihn akzeptieren muss,
und die beauftragte Person, die mit der Urkunde in der Hand handeln soll.

---

## 1 · Errichtung, Form, Widerruf, frühere Aufträge (Art. 360–362 ZGB)

**Errichtung.** Eine handlungsfähige Person kann eine natürliche **oder
juristische** Person beauftragen, im Fall ihrer Urteilsunfähigkeit die
Personensorge oder die Vermögenssorge zu übernehmen oder sie im Rechtsverkehr zu
vertreten (Art. 360 Abs. 1). Die Aufgaben sind zu **umschreiben**; Weisungen
sind zulässig (Abs. 2). Ersatzverfügungen für die drei gesetzlichen
Ausfall-Fälle — nicht geeignet / nimmt nicht an / kündigt — sind vorgesehen
(Abs. 3). Handlungsfähigkeit setzt Volljährigkeit (Art. 14) und
Urteilsfähigkeit (Art. 16) voraus (Art. 13); unter umfassender Beistandschaft
entfällt sie von Gesetzes wegen (Art. 398 **Abs. 3**).

**Form.** Eigenhändig — von Anfang bis Ende von Hand, datiert, unterzeichnet
(Art. 361 Abs. 2) — oder öffentlich beurkundet (Abs. 1). Das ist der grosse
Formunterschied zur Patientenverfügung (dort genügt Schriftlichkeit mit Datum
und Unterschrift): **jede Zeile des Vorsorgeauftrags wird von Hand
abgeschrieben.** Für das Werkzeug folgt daraus ein hartes Längen-Argument: jede
Klausel, die nicht Anordnung ist, verteuert die Urkunde (Ziff. 8).

**Widerruf.** Jederzeit in einer Errichtungsform (Art. 362 Abs. 1) oder durch
Vernichtung der Urkunde (Abs. 2). Errichtet die Person einen neuen Auftrag,
ohne den früheren ausdrücklich aufzuheben, tritt der neue an dessen Stelle,
sofern er nicht zweifellos eine blosse Ergänzung darstellt (Abs. 3).

**Die zentrale Einsicht — identisch zur PV:** Jedes erzeugte Dokument ist
potenziell ein Widerruf, von Gesetzes wegen und ohne Klausel. Die heutige
Klausel V13 («Dieser Vorsorgeauftrag ersetzt alle früheren Vorsorgeaufträge»)
sollte den Widerruf **aussprechen**, nicht andeuten: *«Ich widerrufe hiermit
alle früheren Vorsorgeaufträge. Dieser Vorsorgeauftrag tritt an ihre Stelle.»*
Tragende Norm ist Art. 362 **Abs. 1** (ausdrückliche Aufhebung in
Errichtungsform) — nicht Abs. 3, der gerade den gegenteiligen Fall regelt
(heutiges Zitat falsch, Befund V-6 unten). Und wer «nein» wählt, darf nicht
Schweigen bekommen: ohne Klausel gilt die gesetzliche Ersetzungsvermutung.
Nötig ist dann die ausdrückliche **Ergänzungs-Klausel**: *«Dieser
Vorsorgeauftrag ergänzt meinen Vorsorgeauftrag vom … und lässt ihn im Übrigen
unberührt.»* — womit die Ausnahme von Abs. 3 («zweifellos eine blosse
Ergänzung») aktiv hergestellt wird. Das verlangt ein Datumsfeld des früheren
Auftrags; ohne Datum bleibt die Klausel mit Ausfüll-Strich.

**Datierung.** Beim eigenhändigen Auftrag ist das Datum
Gültigkeitsbestandteil (Art. 361 Abs. 2). Die UI erzwingt es heute als
Schritt-Fehler; die Engine-Gates kennen es nicht (die Rechtsregel lebt damit
nur in der Darstellungsschicht — §3-Verstoss). → Gate-Warnung in der Engine.

## 2 · Validierung, Wirksamwerden, Registrierung (Art. 361 Abs. 3, 363 ZGB)

**Registrierung.** Das Zivilstandsamt trägt **auf Antrag** die Tatsache der
Errichtung und den **Hinterlegungsort** in die zentrale Datenbank ein
(Art. 361 Abs. 3). Ausführung: Art. 23a ZStV (SR 211.112.2, Stand 1.6.2025) —
zuständig ist **jedes** Zivilstandsamt, nicht nur das Wohnsitzamt; eingetragen
wird nur Tatsache + Hinterlegungsort, **nie der Inhalt**. Gebühr: **CHF 75**
für Eintragung, Änderung oder Löschung (Anhang 1 Ziff. 23 ZStGV,
SR 172.042.110, Stand 11.11.2024). Das ist ein **fixer Bundestarif** — weitere
Gebühren sind unzulässig (Art. 1 Abs. 2 ZStGV). Die heutige UI-Angabe «Gebühr
CHF 75, Bestätigung +CHF 30 – Richtwerte» ist damit doppelt falsch: kein
Richtwert, und die «+CHF 30» sind nicht belegbar (kein Tatbestand im Anhang;
die Ziff.-1.1-Gebühr von CHF 30 betrifft beurkundete Personenstandsdaten,
der VA-Eintrag ist nach Art. 8a ZStV gerade nicht beurkundet). → korrigieren,
«+30» streichen (Befund N1).

**Warum die Registrierung zählt:** Erfährt die KESB von einer
Urteilsunfähigkeit und weiss nicht, ob ein Vorsorgeauftrag vorliegt,
**erkundigt sie sich beim Zivilstandsamt** (Art. 363 Abs. 1). Ein nicht
registrierter, zu Hause liegender Auftrag hängt davon ab, dass Angehörige ihn
finden und einreichen. Die Registrierung ist der einzige Mechanismus, der den
Auftrag von Amtes wegen auffindbar macht — das Pendant zur
Versichertenkarten-Regel der PV (Art. 371 Abs. 2).

**Validierung.** Liegt ein Auftrag vor, prüft die KESB (Art. 363 Abs. 2):
gültige Errichtung · Eintritt der Wirksamkeitsvoraussetzungen · **Eignung** der
beauftragten Person · ob weitere Massnahmen nötig sind. Bei Annahme wird die
beauftragte Person auf ihre Pflichten nach OR-Auftragsrecht hingewiesen und
erhält eine **Urkunde über ihre Befugnisse** (Abs. 3) — das Dokument, mit dem
sie gegenüber Banken und Behörden auftritt. Zuständig ist die KESB am Wohnsitz
(Art. 442 **Abs. 1**). Die beauftragte Person kann die KESB später um
**Auslegung und Ergänzung in Nebenpunkten** ersuchen (Art. 364) — ein Grund,
Aufgaben präzise zu umschreiben, aber keine Angst vor Randlücken zu haben.

## 3 · Die beauftragte Person (Art. 365–368 ZGB)

- **Sorgfalt/OR-Auftragsrecht:** Sie vertritt im Rahmen des Auftrags und nimmt
  die Aufgaben «nach den Bestimmungen des Obligationenrechts über den Auftrag
  sorgfältig wahr» (Art. 365 Abs. 1). Diese Verweisung ist zugleich die Brücke,
  über die Art. 396 Abs. 3 OR (besondere Ermächtigungen) in den Vorsorgeauftrag
  hineinwirkt — stärker als der heutige Hinweis «analoge Anwendung umstritten»
  suggeriert.
- **Interessenkollision:** Bei nicht erfassten Geschäften oder widersprechenden
  Interessen ist unverzüglich die KESB zu benachrichtigen (Abs. 2); **bei
  Interessenkollision entfallen die Befugnisse von Gesetzes wegen** (Abs. 3).
  Das ist die praktisch wichtigste Regel bei der **Personenwahl** (Erbin und
  Vermögenssorgerin in einer Person; Geschäftspartner) — heute nirgends in
  Engine oder UI. → EIN neuer Gate-Hinweis (Ziff. 9: Warnungs-Ökonomie).
- **Entschädigung:** Ohne Anordnung legt die KESB sie fest, wenn gerechtfertigt
  (Art. 366 Abs. 1); Entschädigung und Spesen zulasten der auftraggebenden
  Person (Abs. 2). Der heutige Gate-Hinweis stimmt; das Baustein-Zitat trägt
  nur e contrario (Befund V-7).
- **Kündigung:** jederzeit mit zweimonatiger Frist, schriftlich an die KESB;
  fristlos aus wichtigen Gründen (Art. 367). Wissen für die beauftragte Person,
  nicht für die Urkunde → Beiblatt (Ziff. 8).
- **Einschreiten der KESB:** Bei Gefährdung trifft sie von Amtes wegen oder auf
  Antrag Massnahmen — Weisungen, Inventar, periodische Rechnungsablage,
  Berichterstattung, Entzug (Art. 368). Ebenfalls Beiblatt-Stoff.

## 4 · Mehrere Beauftragte, Ersatz, Vertretungsregel

**Mehrere Beauftragte.** Das Gesetz regelt das Zusammenwirken mehrerer
beauftragter Personen nicht. Sind zwei Personen im selben Bereich eingesetzt,
ist die Frage «einzeln oder nur gemeinsam?» genau die Zeile, die Bank und KESB
suchen — und die heute fehlt. Muster existiert in der Vollmacht
(`VmVertretung`, `vollmacht.ts`): zwei sich ausschliessende Bausteine.
Normanker: Art. 360 Abs. 1/2 (Umschreibungslast der auftraggebenden Person);
**nicht** Art. 33 Abs. 2 OR (Vollmachts-Kontext). → Feld
`vertretung: einzeln | gemeinsam`, Default einzeln (Usanz), Klausel nur bei
≥2 wirksam Beauftragten. *(Entscheid Session: Default «einzeln», weil
Kollektivvertretung bei Urteilsunfähigkeit der auftraggebenden Person
handlungsunfähig machen kann, wenn eine der Personen ausfällt; offengelegt.)*

**Ersatzpersonen.** Art. 360 Abs. 3 nennt die drei Ausfall-Fälle wörtlich —
die heutige V03-Klausel bildet sie korrekt ab. Strukturell sind Ersatzpersonen
heute aber nur `{name, angaben}`: kein Typ, keine Bereiche. Folge 1: Die
Personensorge-/Medizin-Prüfung (Ziff. 5) greift für Ersatzpersonen nicht —
eine Treuhand AG als Ersatz für die Personensorge läuft durch. Folge 2: Bei
mehreren Beauftragten mit verschiedenen Bereichen sagt der Ersatztext nicht,
**wofür** die Ersatzperson einspringt. → Ersatzpersonen strukturell wie
Hauptbeauftragte (`typ`, optional `bereiche`; ohne Angabe: alle übertragenen
Bereiche — heutige Semantik als Default, golden-schonend).

## 5 · Grenzen: juristische Person, Medizin, PV, Ehegatten-Vertretung

**Juristische Person und Personensorge — Korrektur der heutigen Engine.**
Art. 360 Abs. 1 erlaubt **ausdrücklich**, «eine natürliche oder juristische
Person» mit der **Personensorge** zu beauftragen. Der heutige harte Blocker
(«Die Personensorge ist höchstpersönlich und kann nur einer NATÜRLICHEN Person
übertragen werden (Art. 360 ZGB)») zitiert die Norm **contra legem** — sie
sagt das Gegenteil (Befund V-1, SCHWER). Auch die Medizin-Variante des
Blockers trägt ihr Zitat nicht: Art. 378 Abs. 1 Ziff. 1 («die in einer
Patientenverfügung oder in einem Vorsorgeauftrag bezeichnete Person») enthält
keine Beschränkung auf natürliche Personen; die Beschränkung steht wörtlich
nur in Art. 370 Abs. 2 — für die **Patientenverfügung** (Befund V-2, SCHWER).

*Entscheid Session (rückholbar, David-Review):* Herabstufung nach dem
Ehrlichkeits-Prinzip (§8):
- Juristische Person + Personensorge allgemein → **Hinweis** (zulässig nach
  Art. 360 Abs. 1; die KESB prüft die Eignung, Art. 363 Abs. 2 Ziff. 3;
  faktisch handeln stets natürliche Hilfspersonen).
- Juristische Person + Modul «medizinische Vertretung» → **Warnung** (nach
  verbreiteter Lehre kommt für die medizinische Vertretung nur eine natürliche
  Person in Betracht — Anlehnung an Art. 370 Abs. 2; Risiko, dass die KESB die
  Einsetzung insoweit nicht validiert). Kein Blocker, weil der Gesetzeswortlaut
  die Konstellation nicht verbietet und das Werkzeug nichts sperren soll, was
  das Gesetz erlaubt (§1/§8). Die Warnung bleibt deutlich.
- Beide Prüfungen erfassen neu auch **Ersatzpersonen**.

**Verhältnis zur Patientenverfügung.** Der Vorrang der PV bei medizinischen
Massnahmen folgt nicht aus Art. 370 (heutiges V12-Zitat), sondern aus
Art. 372 Abs. 2 (Befolgungspflicht der Ärztin) i.V.m. Art. 377 Abs. 1
(Behandlungsplan nur, soweit keine PV-Äusserung). Art. 378 Abs. 1 Ziff. 1
stellt die PV- und die VA-bezeichnete Person sogar in dieselbe Kaskadenstufe.
→ V12-Norm korrigieren (Befund V-5); Klauseltext bleibt inhaltlich richtig.

**Ehegatten-Vertretungsrecht.** Das gesetzliche Vertretungsrecht des Ehegatten/
eingetragenen Partners (Art. 374: gemeinsamer Haushalt oder regelmässiger
persönlicher Beistand) besteht nur, «wenn weder ein Vorsorgeauftrag noch eine
entsprechende Beistandschaft besteht» — und es ist eng (Unterhalt, ordentliche
Verwaltung, Post; Ausserordentliches nur mit KESB-Zustimmung, Abs. 3). Das ist
das stärkste sachliche Argument **für** einen Vorsorgeauftrag auch unter
Ehegatten und gehört als Erklärtext in die UI/das Beiblatt, nicht in die Urkunde.

## 6 · Ende des Auftrags (Art. 369 ZGB)

Wird die auftraggebende Person wieder urteilsfähig, verliert der Auftrag seine
Wirksamkeit von Gesetzes wegen (Abs. 1); die beauftragte Person muss nötigenfalls
fortführen, bis die Person ihre Interessen selber wahren kann (Abs. 2);
Gutglaubensschutz für Geschäfte vor Kenntnis des Erlöschens (Abs. 3). Für die
errichtende Person im Erstellungs-Moment ist das Hintergrundwissen → Beiblatt,
keine Gate-Meldung (Warnungs-Ökonomie).

## 7 · Form-Weiche, Kantone, Kosten (SSoT)

Die Beurkundungs-Variante untersteht kantonalem Verfahrensrecht (Art. 55
SchlT ZGB; BGE 151 III 81 — im BGE-Register erfasst, Status «zu verifizieren»).
Die Engine-Funktion `beurkundungsHinweis()` pflegt dafür eine **zweite
Wahrheit** mit belegten Abweichungen von den eigenen Stammdaten: TG als
«gemischt» (SSoT `notariate.ts`: Amtsnotariat) · BE «ab ca. CHF 500» (SSoT-Tarif:
Minimum CHF 300) · SG «ca. CHF 400» (SSoT: Rahmen 110–1100). Beide SSoT-Quellen
existieren und tragen Norm+Link+Stand: `NOTARIATE` (alle 26 Kantone,
Notariatssystem) und `berechneBeurkundung({geschaeftsart:'vorsorgeauftrag',
kanton})` (Sondertarife für 20 Kantone, ehrliches «offen» für den Rest).
→ `beurkundungsHinweis()` ersatzlos streichen, UI aus den SSoT speisen
(golden-neutral, nur UI). Zivilstandsamt-Zeile gemäss Ziff. 2 korrigieren.

## 8 · Abwägung Beiblatt-Konzept (Davids offene Frage)

**Für:** (a) Beim eigenhändigen Auftrag wird jede Zeile von Hand abgeschrieben —
Rechtsbelehrung in der Urkunde kostet wörtlich Schreibarbeit und senkt die
Fertigstellungsquote. (b) Der Empfänger-Stoff (Validierungsablauf, Kündigung
Art. 367, Interessenkollision Art. 365, Erlöschen Art. 369, KESB-Aufsicht
Art. 368, Registrierung) veraltet mit Rechtsänderungen — ein nicht
unterschriftsbedürftiges Beiblatt ist austauschbar, ohne dass neu abgeschrieben
werden muss. (c) Die beauftragte Person ist ein eigener, heute unbedienter
Adressat («was kommt auf mich zu, was darf ich, wo endet meine Befugnis»).

**Wider:** (a) Anders als bei der PV steht die Rechtsbelehrung heute schon
**nicht** in der Urkunde — die Bausteine sind reine Anordnungen, das
Prozesswissen lebt im UI-Form-Gate. Der Leidensdruck ist kleiner als bei der
PV. (b) Ein Mehr-Dokument-Export (Urkunde + Beiblatt in einem PDF-Lauf) braucht
einen neuen Rahmen in `vorlagenPdf`/`vorlagenDocx` — nach §10 erst Rahmen, dann
Feature; das sprengt die Nacht-Einheit und mischte Risiko-Klassen (Rechtsinhalt
+ Render-Infrastruktur).

**Entscheid Session:** Konzept **ja, Bau vertagt**. Diese Nacht: Urkunde
schlank halten (keine neuen Belehrungs-Bausteine), Empfänger-Wissen im
UI-Form-Gate nachführen. Das «Merkblatt für die beauftragte Person» wird als
eigener ROADMAP-Unterschritt unter W2·8 vermerkt (inkl. PV-Analog: Merkblatt
auch dort). So bleibt der Gewinn erreichbar, ohne heute den Render-Rahmen
anzufassen.

## 9 · Bedienbarkeit: Warnungs-Ökonomie und Vorbelegungen

PV-Lehre übernommen: **Wenige, treffende Meldungen wirken; viele löschen sich
gegenseitig.** Ziel-Zustand der Gates nach dem Umbau:

- **Blocker (unverändert 2):** Errichtungsvoraussetzungen nicht bestätigt ·
  keine beauftragte Person mit Bereich.
- **Warnungen (neu 2, situativ):** juristische Person für medizinische
  Vertretung (Haupt oder Ersatz) · eigenhändige Form ohne Datum.
- **Hinweise (situativ statt Sammelband):** Interessenkollisions-Hinweis bei
  der Personenwahl (Art. 365 Abs. 2/3) **neu** · Liegenschaften-Sondervollmacht
  (bestehend) · Ersatzperson empfohlen (bestehend) · Entschädigung-offen
  (bestehend) · KESB-Validierung (bestehend, immer) · juristische Person +
  Personensorge allgemein (**herabgestuft** von Blocker).

Vorbelegungen: `ersetztFruehere: true` bleibt Default (häufigster Fall,
entspricht ohnehin der gesetzlichen Vermutung), wird aber im UI als bewusste
Wahl mit Gegen-Option «Ergänzung» dargestellt statt als stille Checkbox.
`vertretung: 'einzeln'` als Default mit «(empfohlen)»-Label und Begründung.

## 10 · Befundregister (Engine-Ist gegen Norm, Session 2.8.2026)

| # | Fundort | Befund | Schwere | Behandlung |
|---|---|---|---|---|
| V-1 | Gate Z. 149–155 | Personensorge-Blocker zitiert Art. 360 ZGB contra legem (Wortlaut erlaubt jur. Person) | SCHWER | Herabstufung → Hinweis, Zitat korrigiert (Ziff. 5) |
| V-2 | Gate Z. 152 | Medizin-Blocker: Art. 378 Abs. 1 Ziff. 1 enthält keine Natürlichkeits-Schranke; die steht in Art. 370 Abs. 2 (nur PV) | SCHWER | → Warnung mit ehrlicher Lehr-Offenlegung |
| V-3 | V07_grundstueck | «erwerben» überdehnt Art. 396 Abs. 3 OR (nur veräussern/belasten) | MITTEL | Text behalten (Klarstellung für Grundbuchverkehr), Norm/Hinweis präzisieren: Erwerb bedarf keiner besonderen Ermächtigung |
| V-4 | V08_schenkungen | «sittliche Pflicht» nicht von Art. 240 Abs. 2 OR gedeckt (das ist OR 239 Abs. 3); Gelegenheitsgeschenke-Zitat korrekt | LEICHT | Zweitzitat OR 239 Abs. 3 ergänzen |
| V-5 | V12_pv | PV-Vorrang folgt aus Art. 372 Abs. 2 i.V.m. 377 Abs. 1, nicht aus Art. 370 | MITTEL | Norm korrigieren |
| V-6 | V13_ersetzt | Ausdrückliche Aufhebung = Art. 362 Abs. 1; Abs. 3 regelt den gegenteiligen Fall | MITTEL | Norm korrigieren + Widerruf aussprechen + Ergänzungs-Variante (Ziff. 1) |
| V-7 | V11_entschaedigung | Art. 366 greift nur ohne Anordnung; Baustein-Zitat trägt e contrario | LEICHT | Zitat «Art. 366 Abs. 1 ZGB (e contrario)» + Begründung präzisieren |
| V-8 | Eligibility-Gate | pauschal «Art. 398 ZGB»; tragend ist Abs. 3 | LEICHT | Absatz ergänzen |
| V-9 | Gate-Hinweis KESB | «Art. 442 ZGB» ohne Absatz; tragend Abs. 1 | LEICHT | Absatz ergänzen |
| V-10 | Modul-Label medizin | «Art. 377 f. ZGB» unpräzis | LEICHT | «Art. 378 Abs. 1 Ziff. 1 i.V.m. Art. 377 ZGB» |
| N1 | UI Z. 348 | «CHF 75 … Richtwerte»: fixer Bundestarif; «+CHF 30» unbelegbar | MITTEL | Text ersetzen (Ziff. 2), Norm-Anker ZStV 23a + Anhang 1 Ziff. 23 ZStGV |
| F1 | Typ VaAntworten | Ersatzpersonen ohne typ/bereiche | SCHWER (Lücke) | Strukturangleichung (Ziff. 4) |
| F2 | Schema | keine Einzel-/Kollektivregel | SCHWER (Lücke) | V02c/V02d (Ziff. 4) |
| F6 | beurkundungsHinweis() | zweite Wahrheit, 3 belegte Abweichungen (TG/BE/SG) | MITTEL | streichen, SSoT verdrahten (Ziff. 7) |
| — | Kopfkommentar Z. 6 | «seither nicht revidiert» aus dem Snapshot nicht belegbar | LEICHT | auf Snapshot-Stand umformulieren |

## 11 · Offene Punkte (ausdrücklich)

- **BGE 151 III 81**: im BGE-Register erfasst, Status «zu verifizieren» — vor
  fachlicher Abnahme am Entscheidtext prüfen.
- **Art. 55 SchlT ZGB**: nicht als eigener Snapshot-Eintrag verifiziert.
- **OR 240 Abs. 3**: im Snapshot als «…» (mutmasslich aufgehoben) — für die
  Engine ohne Belang, für Zitierpräzision offen.
- **Kantonale/private Hinterlegungsstellen** (KESB-Hinterlegung, Notariat):
  bundesrechtlich weder vorgesehen noch ausgeschlossen; 26-Kantone-Recherche
  nicht durchgeführt — UI macht dazu keine Aussagen.
- **Lehr-Beleg zur Medizin-Warnung** (Ziff. 5): Die Lehrmeinung ist nicht aus
  amtlicher Quelle belegbar (Kommentarliteratur, Art. 5 URG-Grenze des
  Projekts); die Warnung ist entsprechend als Lehre gekennzeichnet, nicht als
  Gesetzesbefehl.
- **Revisionsstand Art. 360–369 seit 2013**: nur über die Revisions-Timeline
  (`bibliothek/normtext/`) belegbar; Kopfkommentar wird snapshot-treu.

## 12 · Bau-Schnitt dieser Nacht (Verweis)

B1 Golden-Ausbau (✅, +6 Fälle additiv) · B2 Ersatz-Modell + Vertretungsregel ·
B3/B4 Norm-Korrekturen V-1…V-10, Widerruf/Ergänzung, Datums-Warnung,
Interessenkollisions-Hinweis, Gate-Umbau · B5 SSoT-Verdrahtung + N1-Text ·
B6 Dossier-Regeneration, Gate, adversariale Gegenprüfung, PR (kein Merge).
Deklarierte Golden-Änderungen einzeln im jeweiligen Commit begründet.
