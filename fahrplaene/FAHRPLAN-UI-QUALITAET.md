# FAHRPLAN — Oberflächen-Qualität app-weit (`QS-UI`)

> **ROADMAP-Schritt:** `QS-UI` (Querschnitt-Band — **kontinuierlich, kein Reihenfolge-Slot**).
> **Anlass:** Ideen-Intake 20.7.2026, Idee 8a («UI app-weit optimieren»); die Gesetzes-Fläche
> folgt als 8b in `W2·5h-GESETZ-UI`. Dieser Schritt hängt **nicht per `dep`** an diesem Strang —
> `QS-UI` ist kontinuierlich und erreicht nie «fertig», ein `dep` wäre nie erfüllbar. Massgeblich
> ist `seq-hart` auf die zwei abschliessbaren Teil-Schritte (a) Fundament- und (b) Hierarchie-Pass
> (Begründung: `FAHRPLAN-GESETZES-UX.md` §13.1).
> **Charakter:** Dieses Dokument ist die **Umbrella-Detailquelle** für einen mess-getriebenen
> Dauer-Strang. Es ist **kein Redesign-Plan** und **kein zweiter Einstieg** (§14.1) — es
> koordiniert und härtet, es baut nicht neben den bestehenden UI-Schritten her.
>
> **Fundament steht bereits:** Dach-`DESIGN-REGLEMENT.md` + 4 Domänen-Reglemente
> (`-RECHNER`, `-RECHTSPRECHUNG`, `-VORLAGEN`, `-NORMTEXT`), Tor `scripts/check-farbwelt.ts`
> (OKLCH/WCAG/APCA) und `@axe-core/playwright`. Dieser Strang erfindet keine neue
> Design-Schicht, sondern **zieht die vorhandene flächendeckend durch und verschärft ihre Tore**.

---

## §0 · Ziel und Nordstern

**Nordstern: Kanzlei-Praxistauglichkeit** — nicht Schönheit. Die Messlatte jeder Einheit ist,
ob eine Anwältin **schneller zu einem belegten Ergebnis** kommt: weniger Klicks bis zum Verdikt,
weniger Rätselraten, wo etwas herkommt, weniger Rückwege ins Nichts.

Daraus folgen drei Leitsätze, die über allen Teil-Schritten stehen:

1. **§13.2 zuerst:** Verdikt zuerst, Warum auf Abruf. Eine Fläche, die den Nutzer erst durch
   Herleitung schickt, ist unabhängig von ihrer Optik mangelhaft.
2. **§8 vor Politur:** keine Oberfläche suggeriert mehr Gewissheit, als der Korpus trägt.
   Ein hübscher Zustand, der eine Unsicherheit wegglättet, ist ein **Rückschritt**.
3. **§15 gilt:** kein UX-Gewinn, der Treue kostet. Bei Konflikt gewinnt immer die Treue.

**Ausdrücklich NICHT Ziel:** ein grosser visueller Wurf, ein Marken-Relaunch oder ein
Umbau der Token-Schicht. Farbwärme/Atmosphäre ist und bleibt `W2·11-DESIGN`.

## §1 · Audit-Methodik gegen das DESIGN-REGLEMENT

Jeder Teil-Schritt läuft nach demselben Vierschritt, damit Befunde vergleichbar bleiben:

1. **Ist-Aufnahme am laufenden Prod-Stand** (nicht am Modellgedächtnis, nicht an einem
   Vintage-Screenshot) — Playwright/DOM + Screenshot je Breite. **Vintage-Regel** analog
   `FAHRPLAN-UI-NAVIGATION.md` §0.1: jeder ältere Befund wird vor dem Bau reproduziert.
2. **Abgleich gegen das zuständige Reglement** — Dach für site-weite Muster, Domänen-Reglement
   innerhalb seiner Domäne (bei Konflikt gewinnt das speziellere, §13).
3. **Verdikt je Befund:** übernommen / geändert / verworfen — **Verworfenes bleibt mit Grund
   stehen**, sonst wird es in der nächsten Runde erneut vorgeschlagen.
4. **Bündelung zu Bau-Einheiten** nach §14.2 (keine Risiko-Klassen mischen; klein genug für
   ein sauberes Gate). Befunde, die eine bestehende Einheit betreffen, laufen **dort ein**.

**Abgrenzungs-Precheck (Pflicht vor jedem Schnitt):** berührt der Befund
`W2·10-UI-NAV`, `W2·11-DESIGN`, `W3·14` oder `W2·5h-GESETZ-UI`? Dann gehört er **dorthin**,
nicht hierher (§14.3). Dieser Strang liefert dann nur Messung und Priorisierung.

## §2 · Informationshierarchie-Pass («Verdikt zuerst»)

Werkzeugweiser Durchgang durch alle Rechner-, Rechtsprechungs- und Vorlagen-Flächen mit
denselben Fragen: Steht das Ergebnis vor der Herleitung? Ist der massgebliche Wert optisch
der stärkste Punkt? Sind Norm + Link + Stand am Wert (§13.5/§7) und nicht in einer Fussleiste?
Ist die Lesespalte gewahrt (`max-w-reading`) oder läuft Fliesstext über die volle Breite?

Ergebnis je Fläche: eine Zeile **Ist → Soll → Einheit**. Flächen ohne Befund werden
ausdrücklich als geprüft vermerkt, damit der nächste Durchgang sie überspringen kann.

### §2.1 · Messliste des Durchgangs vom 4.8.2026 (QS-UI 8b)

> **Umfang dieses Durchgangs: die Rechner-Flächen.** §2 verlangt den Durchgang über Rechner-,
> Rechtsprechungs- **und** Vorlagen-Flächen. Gemessen und begradigt sind hier die 20
> Rechner-Routen. **Rechtsprechung** (Entscheid-Leser) und **Vorlagen** (Wizard-Ausgabe,
> Dokumentmappe) stehen noch aus — sie haben eigene Domänen-Reglemente und einen anderen
> Ergebnisbegriff (ein Entscheid hat kein Verdikt der App, ein Wizard kein Live-Ergebnis).
> Teil-Schritt **(b) ist damit NICHT abgeschlossen**; der `seq-hart`-Vorbehalt von
> `W2·5h-GESETZ-UI` auf «(a) + (b)» bleibt offen. Wer den Rest baut, findet die Methodik hier
> und das Tor in `e2e/qsui-hierarchie.e2e.ts` — es ist bewusst auf Rechner-Blöcke
> (`[id^="lc-ergebnis"]`) gefasst und muss für andere Flächen erweitert werden.

Gemessen im gebauten `dist/` (Chromium, hell), zwei Breiten: **1280×800** und **390×844**.
Kennzahl ist der Abstand vom Seitenanfang zum Verdikt-Satz, in **Bildschirmhöhen** — die
Grösse, die «wie viele Blickwechsel bis zum Ergebnis» am ehesten abbildet. Zweite Kennzahl
je Fläche: der Abstand **erste Eckdaten-Kachel → Verdikt** in px; er zeigt, ob sich zwischen
den beiden etwas eingeschlichen hat, das dort nicht hingehört (R4). Genannt ist jeweils der
Wert **nach** dem Pass; wo der Pass ihn bewegt hat, steht «vorher → nachher».

| Fläche | Verdikt, Desktop | Verdikt, mobil | Kachel→Verdikt (Desktop) | Befund |
|---|---|---|---|---|
| `/rechner/erb-fristen` | 1.31 | 1.98 | 262 px | ohne Befund, geprüft |
| `/rechner/teuerung` | 1.40 | 2.21 | 243 px | B2: Quellen-Mikrozeile 910 px → behoben |
| `/rechner/verzugszins` | 1.65 | 2.50 | 244 px | ohne Befund, geprüft |
| `/rechner/erbteilung` | **2.15 → 1.65** | **2.89 → 2.35** | **666 → 270 px** | R4 Ziff. 2 verletzt → behoben |
| `/rechner/kuendigung` | 1.70 | 2.45 | —² | R4 Ziff. 1: keine Akzent-Kachel → behoben |
| `/rechner/zpo-fristen` | 1.71 | 2.43 | 243 px | ohne Befund, geprüft |
| `/rechner/mietrecht` | 1.73 | 2.52 | 243 px | ohne Befund, geprüft |
| `/rechner/verjaehrung` | 1.83 | 2.39 | 260 px | ohne Befund, geprüft |
| `/rechner/schkg-fristen` | 1.91 | 2.51 | 243 px | ohne Befund, geprüft |
| `/rechner/bgg-fristen` | 1.93 | 3.01 | 262 px | ohne Befund, geprüft |
| `/rechner/gewaehrleistung` | 1.97 | 3.02 | 283 px | ohne Befund, geprüft |
| `/rechner/inkasso-strecke` | 2.82 | 4.45 | 244 px | ohne Befund; lange Eingabestrecke |
| `/rechner/verjaehrung-board` | 3.14 | 4.50 | 282 px | ohne Befund; lange Eingabestrecke |
| `/rechner/tagerechner` | 3.35¹ | 5.31¹ | 243 px | B2: Abgrenzungs-Hinweis 910 px → behoben |

¹ Der Tagerechner trägt **zwei** Ergebnisblöcke. Der obere (Schnellrechner,
`lc-ergebnis-einfach`) hat bewusst kein Verdikt und keine Eckdaten-Kacheln (R12 Ziff. 1); er
beginnt bei rund 1.3 Bildschirmhöhen Desktop / 1.9 mobil. Die genannten 3.35 / 5.31 gelten
für den unteren Block (`lc-ergebnis-allgemein`, Regime-Rechner) — die schlechtesten Werte
der App. Ursache sind Preset-Suche und Regime-Tabs über dem zweiten Rechner, nicht die
Ergebnis-Ordnung: Kachel→Verdikt liegt mit 243 px exakt auf dem Normwert. Siehe Restliste.

² Der Kündigungsrechner öffnet auf dem Lohnfortzahlungs-Teil (Modul A), der keine
Eckdaten-Kacheln trägt; die korrigierte Akzent-Kachel liegt im Sperrfristen-Teil (Modul B).

Alle Zahlen der Spalte «nachher» sind gegenüber der Erstmessung um 0.01–0.02
Bildschirmhöhen kleiner, weil der Ergebnisblock durch den Sprungmarken-Wurzelfix (unten)
Innenabstand verloren hat. Isoliert gemessen (nur diese Änderung, Abstand Blockanfang →
erste Eckdaten-Kachel auf `/rechner/verjaehrung`): **52 → 42 px auf 1280×800** und
**63 → 47 px auf 390×844**, also 10 bzw. 16 px. Über die zwölf unveränderten Flächen
gerechnet ergibt das 9–10 px Desktop und 16 px mobil — konstant, kein Effekt eines
Einzelfixes.

**Eingabe-gegatete Flächen** (kein Ergebnis ohne Eingabe — regelkonform, kein
Hierarchie-Befund): `/rechner/streitwert`, `/rechner/prozesskosten`,
`/rechner/betreibungskosten`, `/rechner/notariat-grundbuch`, `/rechner/gerichtszitat`,
`/rechner/zustaendigkeit`. Befund hier war ein anderer: der Leerzustand-Platzhalter
(`W2·10-UI-NAV/N0d·W1`) stand in **einer** von sechs — auf den übrigen blieb die Stelle des
künftigen Ergebnisses leer. Behoben über den geteilten `ErgebnisPlatzhalter` (neu R13).

**Der tragende Befund ist der systemische — und er bleibt offen.** Auf **keiner** der 14
Flächen steht das Verdikt im ersten Viewport: Minimum 1.31 Bildschirmhöhen Desktop, 1.98
mobil, Maximum 3.35 / 5.31. Dieser Pass hat die Ordnung **im** Ergebnisblock geradegezogen
und die Abkürzung dorthin repariert; er hat die Seiten **nicht** verkürzt. Das wäre ein
Eingriff in R1/R3 (Seiten- und Formular-Skelett) und damit ein anderer Schritt.

Repariert wurde die Abkürzung: die Sprungmarke `ErgebnisSprung` trug `sm:hidden` — sie war
auf allen 14 Desktop-Flächen im DOM und `display:none`. Sie gilt jetzt auf jeder Breite (im
Split-Pane unverändert mobil-only, weil sie viewport-`fixed` ist).

**Wurzelfix aus derselben Messung:** Die Marke lag IM `ErgebnisBlock`, dessen
`lc-reveal`-Einblendung ein `transform` animiert — ein transformierter Vorfahr wird zum
enthaltenden Block für `position: fixed`. Während der 220 ms Einblendung sass die Marke
darum nicht in der Bildschirmecke. Der Befund kam nicht aus dem Auge, sondern daraus, dass
das neue Tor zuerst nur «sichtbar» prüfte und dann auf Geometrie verschärft wurde — worauf
es sofort rot wurde (§6.7). Die Marke steht jetzt **neben** dem Block. Zwei erwünschte
Nebenwirkungen: sie liegt nicht mehr in der `aria-live`-Region (ihr Auftauchen war bisher
eine Ergebnis-Ansage, obwohl sich am Ergebnis nichts ändert), und der Innenabstand im Block
springt nicht mehr (gemessen 10 px Desktop / 16 px mobil), je nachdem ob die Marke gerade
eingeblendet ist.

**Zweiter Befund aus dem §9-Bug-Check zu diesem PR (B1, Druck-Wurzelfix):** Der Druckblock
in `src/index.css` listete `.lc-btn` — die Varianten `.lc-btn-outline/-primary/-ghost`
entstehen aber über `@apply lc-btn`, und `@apply` inlined Deklarationen, es vergibt keine
Klasse. Der Selektor griff bei ihnen also nie. Unbemerkt blieb das, weil fast alle
Bedienelemente `<button>` sind und schon am Tag-Selektor fallen; es traf genau die
button-gestylten **Links** — vier Call-Sites, gemessen. Mit dem Wegfall von `sm:hidden`
druckte die Sprungmarke damit auf jeder Breite mit (auf schmalen Schirmen schon vorher).
Der Selektor lautet jetzt `[class*='lc-btn']` und schliesst die Fehlerklasse (§17); das Tor
prüft das echte Druckmedium (I5), nicht die CSS-Quelle.

**Nicht in diesem Durchgang** (Frage 3 des Katalogs oben, «Norm + Link + Stand am Wert»):
Die Eckdaten-Kacheln tragen den massgeblichen Wert **ohne** Norm-Chip; die Normverweise
stehen gesammelt am Fuss der ErgebnisAnzeige (R6 Ziff. 5). Das ist ein echter Befund gegen
§13.5/D1 — aber sein Fix verlangt, je Rechner zu bestimmen, welche Norm den Hauptwert trägt.
Das ist eine **fachliche** Zuordnung (§7/§1) und gehört nicht in eine Darstellungs-Einheit.
Als eigener Schritt mit Abnahme durch David zu führen.

**Restliste, nach Kanzlei-Nutzwert geordnet:**

1. **Norm am Wert** (oben) — höchster Nutzwert, fachliche Einheit, Abnahme David.
2. **Tagerechner, zweiter Block: 3.36 Desktop / 5.33 mobil** — Preset-Suche und Regime-Tabs
   stehen über ihm. Das ist ein Seiten-Aufbau-Problem (R1/FE-1), kein Ergebnis-Ordnungs-
   Problem; gehört zu `W3·14` (Responsive/Split), nicht in einen reinen Hierarchie-Pass.
3. **`ZustErgebnisEinleitung`** — zwischen `<ErgebnisBlock>` und `<ErgebnisAnzeige>` liegen
   440 Quelltextzeilen Behörden-Auflösung. Nach R12 gilt «ab dem Ergebnisblock R4
   unverändert», also formal ein Verstoss; inhaltlich ist die aufgelöste Behörde dort
   plausibel das Verdikt. Ohne Eingabe nicht messbar. Erst entscheiden, was hier das Verdikt
   IST, dann bauen — sonst baut man die Hierarchie am Fall vorbei.
4. **Akzent-Kachel fehlt** in `GewaehrleistungForm`, `StreitwertForm`, `SchkgZustaendigkeit-
   Teil`, `StrafZustaendigkeitTeil`, `ZustErgebnisEinleitung`. Bei Kündigung war der Hauptwert
   eindeutig (Beendigungsdatum) und wurde gesetzt; bei diesen fünf ist die Wahl fachlich
   (welcher von mehreren Werten ist der massgebliche?) — mit Punkt 1 zusammen erledigen.
5. **Verdikt-Kurzwert in der Sprungmarke** — die Marke sagt heute «↓ Ergebnis». Sie könnte den
   massgeblichen Wert selbst tragen; die Information («welche Kachel ist `akzent`») liegt
   bereits deklariert im Formular. Reine Darstellung, aber eigener Bau.

## §3 · Navigations- und Muster-Konsistenz

Gleiche Handlung, gleiches Muster — über alle Rubriken: ⌘K/Suche, Verlauf/«zuletzt verwendet»,
Breadcrumb und Rückweg, Kopier-/Export-Affordanz, Chip- und Badge-Grammatik, leere und
Fehlerzustände (§13-F4-Zustandsmatrix inkl. disabled/loading/selected/empty/error).

**Kollisionslage beachten:** das konkrete Navigations-Plumbing ist `W2·10-UI-NAV`. Hier wird
die **Grammatik** festgelegt und ihre Einhaltung geprüft; gebaut wird im Nav-Schritt.

## §4 · Gate-Verschärfung

Der Strang ist erst dann etwas wert, wenn das Erreichte **maschinell festgehalten** wird
(§13-E1: prüfbare Regeln gehören ins Tor, nicht ins .md):

1. **Farbwelt-Baseline enger ziehen** — bestehende Ausnahmen in `check-farbwelt.ts` abbauen,
   statt sie fortzuschreiben; jede verbleibende Ausnahme trägt einen datierten Grund.
2. **axe von Stichprobe auf Flächendeckung** — alle Hauptrouten in Hell **und** Dunkel.
3. **Neue Checks nur, wo sie tragen:** Lesespalten-/Hierarchie-Prüfungen sind erst dann ein
   Tor, wenn sie ohne Fehlalarm laufen. Ein flackerndes Tor ist schlechter als keines.

Jede Verschärfung kommt **nach** den Fixes, die sie grün machen — nie ein rotes Tor auf Vorrat.

## §5 · Teil-Schritt-Backlog und Verweise

| Teil-Schritt | Inhalt | Verhältnis zu bestehenden Einheiten |
|---|---|---|
| **(a) Fundament-Pass** | app-weite gemeinsame Muster + Navigation aufnehmen, Soll festschreiben | speist `W2·10-UI-NAV` |
| **(b) Hierarchie-Pass** | «Verdikt zuerst» über alle Werkzeuge (§2) | je Domäne eigene kleine Einheiten |
| **(c) Muster-Konsistenz** | ⌘K/Verlauf/Breadcrumb/Zustandsmatrix (§3) | Bau in `W2·10-UI-NAV` |
| **(d) Flow-Audits** | Kanzlei-Alltags-Flows domänenweise gegen ihr Reglement | Befunde laufen in die Domänen-Schritte ein |
| **(e) Gate-Verschärfung** | Farbwelt enger, axe flächendeckend (§4) | eigener Commit, verhaltensneutral |

**Nachgelagert:** `W2·5h-GESETZ-UI` (Idee 8b) setzt auf (a)+(b) auf — erst stehen die
gemeinsamen Muster und die Hierarchie, dann wird die Gesetzes-Fläche darauf gezogen.
**Nicht dupliziert:** `W2·10-UI-NAV` (Navigation), `W2·11-DESIGN` (Farbwärme),
`W3·14` (Split/Responsive), `FAHRPLAN-GESETZES-UX.md` + `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`
(Gesetzes-Darstellung), `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` (a11y-Governance).

## §6 · Definition of Done je Teil-Schritt

- §13-Tore grün: `check:farbwelt`, axe (Hell **und** Dunkel), `check:perf-budget` (§15).
- **Golden byte-gleich**, wo die Änderung verhaltensrelevant sein könnte (§6).
- Kein Rechtsinhalt in derselben Einheit wie reine UI (§14.2 — Risiko-Klassen nicht mischen).
- Trailer `Roadmap: QS-UI`.

---

## §7 · Funktions-Inventar und Bedienungsanleitung (`W2·16-INVENTAR` / `W2·16-ANLEITUNG`)

**§14-Intake 20.7.2026.** Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** → daraus der
**Zweischritt**. Beide Schritte hängen an diesem Fahrplan, weil das Inventar Input für `QS-UI` ist
und die Anleitung erst nach `QS-UI` entsteht.

### §7.1 Schritt 1 — Funktions-Inventar (`W2·16-INVENTAR`, früh)
Vollständige, ehrliche Aufnahme dessen, **was Lexmetrik heute kann**. Je Werkzeug/Fläche:

| Feld | Inhalt |
|---|---|
| Zweck | wofür man es benutzt, in einem Satz |
| Eingaben | was der Nutzer liefern muss |
| Grenzen | was es **nicht** kann/abdeckt (§8) |
| Status | `verified` / `entwurf` / `geplant` — **geprüft, nicht abgeschrieben** |
| Fundort | Route + Engine-Datei |

**Warum früh:** Man kann eine Oberfläche nicht konsistent machen, solange niemand die Funktionsmenge
aufgeschrieben hat. Das Inventar ist damit **Vorleistung für `QS-UI`** (§1 Audit-Methodik: man auditiert
gegen eine Liste, nicht gegen Erinnerung) und **nicht** an die Anleitung gekettet.

**Quellen:** `src/lib/startseiteConfig.ts` (§5-SSoT) + der Funktions-Katalog in `ROADMAP.md`.
**Heimat des Ergebnisses:** `bibliothek/` mit Eintrag in `bibliothek/INDEX.md` (CLAUDE.md §11).

**Fallstrick, ausdrücklich:** Status-Marker werden **an der Realität geprüft**, nicht aus dem Katalog
übernommen. Ein Inventar, das die vorhandenen Marker abschreibt, reproduziert nur deren Fehler — und
`LERNPHASE-AB` (Status-Marker-Audit) hat genau diese Aufgabe noch offen. Die beiden Schritte stützen
sich gegenseitig; wer zuerst läuft, liefert dem anderen Belege.

### §7.2 Schritt 2 — Bedienungsanleitung / Onboarding (`W2·16-ANLEITUNG`, bewusst spät)
**Nach `QS-UI` (8a) und nach `W2·5h-GESETZ-UI` (8b).** Eine Anleitung auf eine Oberfläche zu schreiben,
die gleich danach umgebaut wird, ist doppelte Arbeit und veraltet beim Merge.

**Sequenz-Mechanik (§14.3), bewusst wie bei `W2·5h-GESETZ-UI`:** `dep` trägt **nur**
`W2·16-INVENTAR` — ein endlicher Schritt, dessen `done` erreichbar ist. `QS-UI` ist ein
**kontinuierlicher Querschnitt ohne Endzustand**; ein `dep` darauf wäre nie erfüllbar und machte die
Anleitung dauerhaft nicht startbar. Die echte Reihenfolge trägt darum `seq-hart: [QS-UI(8a),
W2·5h-GESETZ-UI(8b)]`.

**DoD:** deckt die Funktionsmenge aus dem Inventar **vollständig** ab — jede stille Auslassung ist ein
§8-Verstoss, weil sie eine Fähigkeit verschweigt oder eine nicht vorhandene suggeriert · Sprache nach
§13 Ziff. 3 (klar für Fach **und** Laie, keine Schachtelsätze) · axe · golden byte-gleich.

---

## §8 · ROADMAP-Spec QS-UI (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §1–§6 dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Kein Einzel-Redesign und kein Reihenfolge-Slot**, sondern ein **kontinuierlicher, mess-getriebener
  Querschnitt-Strang** auf dem vorhandenen Fundament: Dach-`DESIGN-REGLEMENT.md` + 4 Domänen-Reglemente,
  Tor `scripts/check-farbwelt.ts` (OKLCH/WCAG/APCA) und `@axe-core/playwright`. **Nordstern:
  Kanzlei-Praxistauglichkeit** — nicht Schönheit, sondern schneller zum belegten Ergebnis.
  **Teil-Schritte statt vagem «UI besser machen»:** **(a) Fundament-Pass** app-weit gemeinsame Muster
  und Navigation · **(b) Informationshierarchie-Pass** «Verdikt zuerst, Warum auf Abruf» (§13.2) über
  alle Werkzeuge · **(c) Muster-/Navigations-Konsistenz** (⌘K, Verlauf, Breadcrumb) · **(d)
  Kanzlei-Alltags-Flow-Audits** domänenweise gegen das jeweilige Reglement · **(e) Gate-Verschärfung**
  (Farbwelt-Baseline enger ziehen, axe von Stichprobe auf Flächendeckung, ggf. Flow-/Hierarchie-Checks).
  **Feasibility 🟢 aus-Bestand** (Reglemente + Farbwelt-Gate + axe stehen). **Abgrenzung (§14.3,
  verbindlich):** `QS-UI` **koordiniert und härtet**, es **dupliziert nicht** `W2·10-UI-NAV`
  (Navigations-Plumbing), `W2·11-DESIGN` (Farbwärme) oder `W3·14` (Split/Responsive) — diese bleiben die
  konkreten Sub-Efforts, die dieser Strang treibt und einfordert. Nachgelagert hängt
  **`W2·5h-GESETZ-UI`** (Gesetzes-Fläche) an diesem Fundament. Detailquelle: diese Datei.
  **DoD je Teil-Schritt:** §13-Tore grün (`check:farbwelt`, axe) · golden byte-gleich, wo die Änderung
  verhaltensrelevant ist. Trailer `Roadmap: QS-UI`.

---

---

## §9 · ROADMAP-Spec W2·16-INVENTAR (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §7.1 «Schritt 1 — Funktions-Inventar» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  Vollständige, ehrliche Aufnahme dessen, **was Lexmetrik heute kann** — je Werkzeug/Fläche: Zweck,
  Eingaben, Grenzen, Status (§8 `verified`/`entwurf`/`geplant`), Fundort. **Der Nutzen liegt VOR der
  Anleitung:** das Inventar ist **Input für `QS-UI`** — man kann eine Oberfläche nicht konsistent machen,
  solange niemand die Funktionsmenge aufgeschrieben hat. Darum **früh** und **nicht** an die Anleitung
  gekettet. Quelle ist der bestehende **Funktions-Katalog** (`ROADMAP.md` §Funktions-Katalog) + `src/lib/startseiteConfig.ts`
  (§5-SSoT); Heimat des Ergebnisses: `bibliothek/` nach §11.
  **DoD:** jede Karte aus `src/lib/startseiteConfig.ts` erfasst · Status-Marker gegen die Realität geprüft, nicht
  abgeschrieben (§8) · `check:bibliothek` grün · Eintrag in `bibliothek/INDEX.md`.
  Trailer `Roadmap: W2·16-INVENTAR`.

---

## §10 · ROADMAP-Spec W2·16-ANLEITUNG (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §7.2 «Schritt 2 — Bedienungsanleitung / Onboarding» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** — eine Anleitung auf eine Oberfläche zu schreiben,
  die gleich danach umgebaut wird, ist doppelte Arbeit und veraltet sofort. Darum **nach `QS-UI` (8a) und
  nach `W2·5h-GESETZ-UI` (8b)**.
  **Sequenz maschinenlesbar, bewusst getrennt (§14.3 — dieselbe Konstruktion wie bei `W2·5h-GESETZ-UI`):**
  `dep` trägt nur **`W2·16-INVENTAR`** (echte Bau-Voraussetzung, endlicher Schritt). `QS-UI` ist ein
  **kontinuierlicher Querschnitt ohne Endzustand** — ein `dep` darauf wäre nie erfüllbar und machte diesen
  Schritt dauerhaft nicht startbar; massgeblich ist darum `seq-hart` auf die konkreten Teil-Schritte.
  **DoD:** deckt die Funktionsmenge aus `W2·16-INVENTAR` **vollständig** ab (keine stille Auslassung, §8) ·
  Sprache nach §13 Ziff. 3 (Fach **und** Laie) · axe · golden byte-gleich.
  Trailer `Roadmap: W2·16-ANLEITUNG`.

---

## §11 · `QS-UI-WARNLINE` — `--warn-line`-Kontrast robust machen

*Angelegt 3.8.2026 (Bauplan-QS).*

- **Befund (Kontrast-Messung 3.8.2026):** `--warn-line` erreicht **3.008** gegen seinen
  Hintergrund. Die Schwelle für nicht-textliche Kontraste liegt bei **3:1** — der Abstand von
  0.008 liegt innerhalb jeder Mess-Streuung und jeder künftigen Token-Verschiebung.
- **Zu bauen:** ein Token-Tick Abdunklung in `src/index.css`, sodass der Wert mit Reserve über
  3:1 liegt. **Reine Token-Änderung, flip-reversibel** — keine Komponente wird angefasst.
- **Fertig, wenn:** `check:farbwelt` und der axe-Lauf grün sind und der gemessene Wert im
  Prüfskript dokumentiert ist (nicht nur der Token).
- **Priorität niedrig** — kein Verstoss, sondern eine zu knappe Einhaltung. §13/DESIGN-REGLEMENT.

**✅ Erledigt 4.8.2026 in QS-UI 8a (Fundament-Pass).** `--warn-line` ist als einziger
Linien-Ton von seiner `-500`-Mitte entkoppelt und in OKLCH um **L −0.020** abgedunkelt
(`#C07A1A`→`#B9740D`, Hue/Chroma gehalten); `--warn-500` blieb unverändert, weil es
`--warn-bg`/`--warn-solid` speist. Gemessen und **im Prüfskript dokumentiert** (die
Fertig-Bedingung oben): warn-line/warn-bg **3.264 hell · 3.948 dunkel** (vorher
3.008 · 4.283), warn-line/surface 3.686 · 4.566. Damit trug der Wert genug Reserve,
um den bis dahin offenen Punkt in `scripts/check-farbwelt.ts` aufzulösen: die vier
Status-Kanten auf ihrer eigenen Tönungsfläche sind jetzt **harte Pflichtpaare** statt
einer Fussnote. `check:farbwelt` und der axe-Lauf (hell + dunkel) grün.
