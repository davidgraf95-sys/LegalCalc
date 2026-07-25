# H0-Verdikt: Trennbarkeit Änderungsvermerk ↔ Verweis in den Korpus-Fussnoten (W2·5i)

**Erstellt:** 25.7.2026 · Anlass: ROADMAP-Schritt `W2·5i-HIST-ANSICHT`, zwingende
Vorstufe H0 nach `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §7.3 («Trennbarkeit messen,
bevor gebaut wird»); Intake David 20.7.2026 (#27).
**Status:** ERSTRECHERCHE *(Messung + Hand-Labelung Fable 5; korpusweiter
Risiko-Signal-Scan als interner Zweitdurchgang — ein unabhängiger adversarialer
Durchgang steht aus und ist vor dem H1-Merge über die Gegenprüfung des dann
risikopfad-pflichtigen Klassifikator-Codes ohnehin fällig)*.
**Quellen:** Eigener Korpus `public/normtext/struktur/{bund,kanton}` (generator-
erzeugt aus den gepinnten Fedlex-Konsolidierungen bzw. der LexWork-API; Stand der
Sidecars im Repo, gelesen 25.7.2026). Kein externer Abruf nötig — gemessen wird
die eigene Datenlage. Werkzeug: `scripts/analyse/hist-h0.ts` (deterministisch,
Seed 20260725); gelabelte Stichprobe:
`docs/ux-audit-2026-07/hist-h0/stichprobe-300-gelabelt.json`.

## 1 · Verdikt

**H0 BESTANDEN — der Umschalter «Änderungshistorie: aus / als Fussnoten /
als Chronologie» darf gebaut werden (H1).** Die sicherheitskritische
Fehlerrichtung (echte Substanz würde als Änderungsvermerk ausgeblendet) liegt
empirisch bei **≈ 0.01–0.05 %**, zwei Grössenordnungen unter der 5 %-Schwelle
der Verdikt-Regel (V2 §7.3). Die Grauzone existiert, ist aber klein (~1–3 %)
und maschinell **erkennbar** — sie bleibt in jeder Ansicht sichtbar.

## 2 · Korpuszahlen (deterministischer Klassifikator, 25.7.2026)

37'849 Fussnoten in 227 Bund- + 1'189 Kanton-Sidecars, fünf Klassen:

| Teil | n | AENDERUNG | VERWEIS | GRAUZONE | ZITAT | UNKLAR |
|---|---:|---:|---:|---:|---:|---:|
| gesamt | 37'849 | 25'367 (67.0 %) | 10'329 (27.3 %) | 424 (1.1 %) | 658 (1.7 %) | 1'071 (2.8 %) |
| Bund | 31'786 | 24'693 (77.7 %) | 5'756 (18.1 %) | 292 (0.9 %) | 632 (2.0 %) | 413 (1.3 %) |
| Kanton | 6'063 | 674 (11.1 %) | 4'573 (75.4 %) | 132 (2.2 %) | 26 (0.4 %) | 658 (10.9 %) |

Klassen-Semantik: **AENDERUNG** = reine Revisionsprosa (einzige ausblendbare
Klasse) · **VERWEIS** = echter Verweis/Substanz · **GRAUZONE** = Revisions-
vermerk MIT Leser-Redirect («Siehe auch die SchlB…», «Heute: …», Aufhebung mit
Nachfolger) · **ZITAT** = reine Publikationsnachweise (BBl-Botschaft,
«[AS …]»-Fassungsketten) · **UNKLAR** = keine Regel greift. VERWEIS, GRAUZONE,
ZITAT und UNKLAR bleiben in **jeder** Ansicht sichtbar (konservativ, §15).

**Konsistenzprobe gegen die Intake-Messung (20.7.2026, OR 778/77):** der
Klassifikator misst am OR 789 AENDERUNG / 75 VERWEIS / 33 GRAUZONE / 23 ZITAT /
13 UNKLAR — deckungsgleich mit dem Intake-Befund.

**Leitplanken-Befund «nie aus einem Beispiel aufs Ganze»:** das OR (und der Bund
insgesamt, 77.7 %) ist NICHT repräsentativ — im Kanton sind nur 11.1 % der
Fussnoten Änderungsvermerke, 75.4 % echte Verweise. Der Umschalter entfaltet
seinen Nutzen fast vollständig auf der Bund-Fläche; kantonal ändert «aus» wenig.

## 3 · Präzision/Recall (Hand-Labelung, stratifizierte Stichprobe n=300)

Geseedete Stichprobe (Seed 20260725, 60 je Klassifikator-Klasse), jede Fussnote
von Hand gelesen und gelabelt (Label-Raum inkl. SUBSTANZ = Substanz-Notiz, die
weder Verweis noch Historie ist):

| Klassifikator-Klasse | Präzision | Fehlklassifikationen (alle UNGEFÄHRLICH — bleiben sichtbar) |
|---|---|---|
| AENDERUNG | **60/60 = 100 %** | keine — **0 Substanz-Fälle unter den Ausblendbaren** |
| VERWEIS | 55/60 = 91.7 % | 3× BS-Umbenennungs-Revisionsprosa, 1× «Jetzt:»-Grauzone, 1× Substanz-Notiz |
| GRAUZONE | 60/60 = 100 % | keine |
| ZITAT | 54/60 = 90.0 % | 6× Grauzone («Siehe heute …»/«entsprechen heute …» nach [AS]-Kette) |
| UNKLAR (Rest) | — | wahre Labels: 19× Historie · 24× Verweis · 8× Grauzone · 2× Zitat · 7× Substanz |

**Sicherheitsmetrik (die einzige, die §15 berührt): Substanz → AENDERUNG.**
Stichprobe: **0/60**. Weil 60 Fälle allein nur eine Obergrenze von ~4.9 %
belegen (Dreier-Regel), zusätzlich ein **korpusweiter Risiko-Signal-Scan über
alle 25'367** als AENDERUNG klassifizierten Fussnoten (Signale: URL,
«abgedruckt/einsehbar/abrufbar», «entspricht», «nie in Kraft», «jetzt»,
«nicht veröffentlicht», «bezogen werden» u. a.): **27 Treffer**, davon nach
Einzeldurchsicht:

- 12× «Bezeichnung gemäss **nicht veröffentlichtem** BRB …» → echte Historie ✓
- 4× BV-Volksabstimmungs-Historie ✓
- ~9× «Die Änderungen werden hier nicht abgedruckt.» (BS) → redaktioneller
  Grenzfall (Vollständigkeits-Hinweis; §8-freundlicher sichtbar zu lassen)
- **2 echte Substanz-Fehler:** `BS-780.100 §29` (Genehmigung des Bundesrats
  **unter Auslegungs-Vorbehalt** — materiell!) · `BS-953.900 §93` («kann bei der
  Direktion der BVB **eingesehen werden**» — Bezugsquelle).

Zusätzlich alle 732 «exotischen» AENDERUNG-Fälle ohne Publikations-/Organ-Anker
per Anfangsmuster-Inventar geprüft: dominiert von gutartigen Familien
(«Ursprünglich Art. …»-Umnummerierung, Redaktionskommissions-Berichtigungen,
«Softwarebedingte, redaktionelle Einfügung», Paarform-Vermerke) — keine
weiteren Substanz-Funde. **Empirische Fehlerrate: 2 klare (+9 grenzwertige)
von 25'367 ≈ 0.008 % (0.04 % inkl. Grenzfälle).**

**Recall der Historie-Erfassung ≈ 96.7 %** (Hochrechnung über die Strata:
~516 Historie-Fussnoten stecken in VERWEIS, ~341 in UNKLAR und bleiben als
Komfort-Rauschen sichtbar — kein Treue-Problem, nur entgangener Aufräum-Effekt).
Die Ansicht «aus» blendet damit **67 %** aller Fussnoten aus (Bund: 78 %).

## 4 · Die Grauzone (V2 §7.3 Ziff. 3)

Beziffert: 424 direkt erkannt (1.1 %) + hochgerechnet ~170 in VERWEIS, ~140 in
UNKLAR, ~65 in ZITAT → **gesamt ~800 ≈ 2.1 % des Korpus**. Typen:
Revisionsvermerk mit SchlB-/UeB-Zeiger (häufigster Fall, ~350×), «Heute: …»/
«Siehe heute …»-Nachführungen, Aufhebung mit Nachfolger-Angabe («Massgebend ist
jetzt … (SG …)»), Wert-Provenienz («Betrag gemäss …»). Alle Typen sind
regelbasiert **erkennbar**; sie werden nie ausgeblendet. Die Grauzone
verhindert den Bau also nicht — sie bestätigt nur, dass ein simples
«Fussnoten aus» (ohne Klassifikation) Substanz verlieren würde, genau wie der
Intake-Befund sagte.

## 5 · Auflagen für H1 (bindend aus dieser Messung)

1. **Nur AENDERUNG ist ausblendbar.** VERWEIS/GRAUZONE/ZITAT/UNKLAR bleiben in
   jeder der drei Ansichten sichtbar — UNKLAR-Rest (2.8 %) ist der bezahlte
   Preis für Konservativität, kein Bug.
2. **Die 2 bekannten Substanz-Fehler vor dem H1-Merge in die Regeln aufnehmen**
   (Signale «unter dem Vorbehalt», «eingesehen werden») und die BS-Familie
   «… werden hier nicht abgedruckt» explizit zu SUBSTANZ routen.
3. Wandert der Klassifikator in die Generator-/Registerschicht
   (`scripts/normtext/`, Sidecar-Feld), ist das ein **Risiko-Pfad**:
   `check:gegenpruefung` Pflicht + golden-Deklaration; die Klassifikation wird
   dann EINMAL build-seitig berechnet (kein Client-Regex-Lauf, §15.3).
4. Fassungs-Fundament nach V2 §7.4 (i)–(iii) gilt für die H1-Arbeit.
5. ZITAT (1.7 %, v. a. Botschafts-/[AS]-Ketten) ist ein **David-Entscheid** in
   H1: sichtbar lassen (Empfehlung, da Provenienz) oder zur Historie schlagen.

## 6 · Negativbefund (S5)

Es existiert im Repo **keine** vorbestehende Fussnoten-Klassifikation
(weder Feld im Sidecar noch Code); die Intake-Zahl 778/77 war eine
Ad-hoc-Messung ohne persistierte Regeln. Diese Datei + `scripts/analyse/hist-h0.ts`
sind jetzt die reproduzierbare Referenz.
