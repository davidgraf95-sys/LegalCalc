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

*(Der Negativbefund ist mit H1 überholt — siehe Ziff. 7: die Klassifikation ist
jetzt persistiert. Er bleibt als Zustandsbeschreibung VOR dem Bau stehen.)*

---

## 7 · H1-Nachtrag: Umsetzung der Auflagen (26.7.2026)

**Quelle/Stand:** eigener Korpus `public/normtext/struktur/{bund,kanton}`, gemessen
26.7.2026 am regenerierten Bestand. **Abnahme-Status:** gebaut + Tore grün;
**fachliche Abnahme David offen**, adversariale Gegenprüfung des Risiko-Pfads
offen (Auflage 3, s. u.).

### 7.1 Wo die Regeln jetzt leben (Auflage 3)

Die Regeln sind aus dem Messwerkzeug in die Generator-Schicht **gehoben**, nicht
kopiert: `scripts/normtext/fussnoten-klassifikation.ts` ist die eine Quelle;
`scripts/analyse/hist-h0.ts` importiert sie und bleibt reine Messung (§5).
`scripts/normtext/struktur-run.ts` berechnet die Klasse **einmal build-seitig**
und schreibt sie als kompaktes Feld `kl` (`'A'|'V'|'G'|'Z'|'U'`) an jede Fussnote
— kein Client-Regex-Lauf über 37'849 Fussnoten (§15.3).

**Deterministische Regel (Eingabe → Ausgabe):** roher Fussnotentext → Tags
gestrippt/Whitespace normalisiert → erste greifende Regel in fester Reihenfolge
gewinnt → Klasse. Gleiche Eingabe ⇒ gleiche Ausgabe, keine Heuristik (§2).

### 7.2 Auflage 2 umgesetzt — und was sie am Bestand bewirkt

| Signal | Ziel-Klasse | Begründung |
|---|---|---|
| `unter dem Vorbehalt` | **VERWEIS** | BS-780.100 § 29: Genehmigung unter **Auslegungs**-Vorbehalt = geltende materielle Vorgabe |
| `eingesehen werden` | **VERWEIS** | BS-953.900 § 93: Bezugsquelle eines nicht abgedruckten Texts = einziger Leserweg |
| `nicht abgedruckt` | **GRAUZONE** | BS-Familie: Vollständigkeits-Hinweis «hier fehlt Text» — §8-relevant, aber kein Verweis |

Die Riegel stehen **vor** dem Revisionsprosa-Test; sonst gewinnt `REV_START`
(«Die Änderungen …») und der Fall landet wieder in `A`.

**Abgrenzung (bewusst eng):** `unter dem Vorbehalt` fängt NICHT
«unter Vorbehalt des unbenützten Ablaufs der Referendumsfrist» (AR-822.41 § 28) —
das ist reine Inkraftsetzungs-Prosa. Eine weite Fassung hätte massenhaft Historie
in die nicht-ausblendbaren Klassen verschoben und den Umschalter entwertet.

**Wirkung, gemessen:** genau **13** Fussnoten verlassen AENDERUNG (12× «nicht
abgedruckt» + 1× «unter dem Vorbehalt»), **alle kantonal**. Korpus-Delta gegen
Ziff. 2: AENDERUNG 25'367 → **25'354**, Kanton 674 → **661**. Die Bund-Fläche
(24'693) ist von Auflage 2 **nicht** betroffen.

### 7.3 Regeneriert wurde NUR Bund (bewusst)

227 Bund-Sidecars, 31'786 Fussnoten. Verteilung nach der Regeneration:

| | A | V | G | Z | U |
|---|---:|---:|---:|---:|---:|
| Bund (31'786) | 24'693 (77.7 %) | 5'759 (18.1 %) | 292 (0.9 %) | 632 (2.0 %) | 410 (1.3 %) |

Kanton bleibt **ohne** `kl` (1'189 Sidecars): dort sind nur 11.1 % der Fussnoten
Historie, der Nutzen liegt auf der Bund-Fläche. Eine Fussnote **ohne** `kl` gilt
im Reader als unklassifiziert und bleibt in **jeder** Ansicht sichtbar — die
fehlende Klasse blendet also nie etwas aus (konservativ, §8).

**Additivitäts-Beweis** (`scripts/normtext/check-sidecar-differ.ts`, §6): alt↔neu
strukturell verglichen, erlaubt sind ausschliesslich `erzeugt` und neu
hinzugefügte `…/fussnoten/N/kl`. Ergebnis: 227 Dateien, 31'786 neue `kl`,
**0 unerlaubte Abweichungen**, 0 `erzeugt`-Änderungen — alle Bestandsfelder inkl.
der FN-5/M14-Offsets `pos{b,it,o,l}` unverändert. Gegenprobe im selben Tor: jede
Fussnote MUSS ein gültiges `kl` tragen (sonst wäre ein No-op-Lauf grün, §6.7);
einmal rot gezeigt mit verschobenem `pos.o`, geändertem Text und gelöschtem `kl`.

### 7.4 Auflage 1 in der UI: was ausblendbar ist

Ausgeblendet wird ausschliesslich `[data-fn-klasse="A"]` — der Attribut-Selektor
greift nur bei exakt `A`. V/G/Z/U **und** alles ohne Klasse bleiben in allen drei
Ansichten sichtbar. `display:none` trifft nur Marker-Ziffern und Apparat-Zeilen,
nie einen Substanz-Träger; der Normtext ist von keiner Regel erfasst und bleibt
sichtbar, durchsuchbar und im Ausdruck (R9/§8). Der `<p id="fn-…">`-Quellblock
bleibt im DOM, weshalb das Marker-Popover auch in der Chronologie-Ansicht trägt.

### 7.5 Auflage 5 (ZITAT) — bleibt David-Entscheid

`Z` (632 Fussnoten im Bund, 2.0 %) ist **sichtbar** gelassen = die Empfehlung aus
Ziff. 5 (Provenienz). **Nicht** entschieden, nur umgesetzt-wie-empfohlen: der
finale ZITAT-Entscheid liegt bei David. Umschalten wäre ein Ein-Zeichen-Eingriff
in `klassifiziere()` (ZITAT → AENDERUNG) plus Regeneration — die Stelle ist im
Regel-Modul als solche kommentiert.

### 7.6 Pflegebedarf

Ändert Fedlex den Wortlaut seiner Revisionsvermerke, wandern Fälle nach `U`
(sichtbar, harmlos) — nie automatisch nach `A`. Neue Auflage-2-Fälle gehören in
`SUBSTANZ_VERWEIS`/`VOLLSTAENDIGKEIT` **mit** Unit-Test-Fixture im amtlichen
Wortlaut (`src/tests/fussnoten-klassifikation.test.ts`). Nach jeder Regeländerung:
`npx vite-node scripts/analyse/hist-h0.ts` (Korpuszahlen) + Regeneration +
Differ-Beweis.

### 7.7 Was offen bleibt

- **Adversariale Gegenprüfung** des Klassifikator-Codes (Auflage 3) — der
  Bau-Auftrag durfte sie nicht selbst quittieren; `check:gegenpruefung` prüft nur
  den Working-Tree, nicht den Branch-Diff.
- **Fachliche Abnahme David** (§7/§8) — inkl. ZITAT-Entscheid (7.5).
- **Kopf-Fussnoten** folgen der Wahl bewusst nicht (keine Chronologie-Ersatz-
  darstellung für den Erlass-Kopf; Begründung am Fundort in `ErlassKopfBlock.tsx`).
- Der **Recall**-Rest aus Ziff. 3 (~96.7 %) ist unverändert: Historie in `V`/`U`
  bleibt als Komfort-Rauschen sichtbar — kein Treue-Problem.
