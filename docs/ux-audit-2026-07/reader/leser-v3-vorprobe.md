# Leser V3 — Vorprobe V-1 bis V-3 (Protokoll)

**Stand:** 16.8.2026 · **Branch:** `feat/leser-v3-h1` · **Fahrplan:** `fahrplaene/FAHRPLAN-LESER-V3.md` Kap. 6
**Gegenstand:** ausschliesslich die Vorprobe. **Kein H1-Design**, keine neue Kopfzeile, keine Seitenleiste.

Die Vorprobe beantwortet genau eine Frage: **Trägt die 8-Zeilen-Fassade
`src/pages/GesetzLeser.tsx` als einziger Schaltpunkt** — für die Einzelansicht *und* für beide
Split-Panes — **und lassen sich die Treue-Tests auch gegen die neue Hülle fahren?**

---

## Kurz für David

Ja, es trägt. Ein einziger Schalter an einer einzigen Stelle schaltet die Leseansicht um, und
zwar überall gleichzeitig: im Hauptfenster und in beiden Fenster­hälften der geteilten Ansicht.
Wer nichts tut, sieht weiterhin exakt den heutigen Stand — die neue Hülle ist nur über eine
ausdrückliche Adresse (`?leser=v3`) erreichbar.

Zweitens ist bewiesen, dass die Prüfung dieser neuen Hülle **echt** ist und nicht bloss
mitläuft: mit einem absichtlich leeren Rahmen sind 56 von 57 Normtext-Prüfungen rot geworden;
mit eingehängtem Lesetext sind alle 57 grün. Ein Prüfnetz, das nicht reissen kann, wäre wertlos
gewesen — dieses reisst.

Drittens — und das ist der Punkt, der **auf dich wartet**: die Zahlen aus dem Repo-Verlauf
stützen den geplanten Deckel von fünf Bau-Schritten **nicht**, weil es im Projekt schlicht keine
Vorgeschichte für «zwei Hüllen nebeneinander» gibt. Der nächste Verwandte, der Startseiten-Neubau
(«V3»), wurde ohne Parallel-Hülle und ohne Schalter gebaut — in genau fünf Schritten, direkt am
Bestand. Siehe V-3 unten.

---

## V-1 · Nullprobe (Flag **aus**, unveränderter Stand)

Zuerst gemessen, bevor irgendetwas gebaut wurde — sonst wäre jeder spätere Fehlschlag dem
Vorhaben zugeschrieben worden, obwohl er auf `main` liegen könnte (§0 Ziff. 3a).

| Prüfung | Ergebnis | Exit |
|---|---|---|
| `bash scripts/gate.sh voll` (tsc · vitest · golden:vergleich · lint · check) | `GATE GRÜN.` | **0** |
| `npm run build` (inkl. Prerender) | `Alle 62 Routen prerendered.` | **0** |
| `npx playwright test e2e/leser-*.e2e.ts e2e/gesetze-*.e2e.ts e2e/split-view-a34.e2e.ts` | `195 passed (3.1m)` | **0** |

`golden:vergleich` ist Teil von `gate.sh voll` und lief mit grün — die Golden-Outputs sind
byte-gleich. **V-1 bestanden**; ein Fehlschlag hätte die Diagnose hier gestoppt.

Nach dem Bau erneut gefahren, gleicher Umfang, Flag aus: `198 passed (3.1m)`, Exit 0 (+3 gegenüber
195 = die neue Flag-Spec im Projekt `chromium`). **Der Ist-Stand ist unverändert.**

### Nebenbefund aus V-1: ein Flake auf `main`, nicht am Vorhaben

Im kombinierten Lauf (beide Projekte, 258 Tests) fielen zwei Tests — und zwar **derselbe** Test in
**beiden** Projekten, auch im unveränderten `chromium`. Signatur:
`leser-ohne-gliederungslinie.e2e.ts:71` (OR Art. 319), 20-s-Timeout auf
`getByRole('button', { name: 'Ansicht' })`.

Statt der Zuschreibung an das Feature erst die Verteilung (§0 Ziff. 3):

| Bedingung | Läufe | rot | Rate |
|---|---|---|---|
| Datei allein, beide Projekte | 1 | 0 | — |
| `--project=leser-v3`, 60 Tests | 5 | 2 | 40 % |
| `--project=chromium`, **dieselben 11 Dateien, Flag aus**, 60 Tests | 3 | 1 | 33 % |

**Messbedingung:** lokal, warmes `dist/`, 5 Worker, keine Fremdlast. Immer derselbe Test, dieselbe
Locator-Signatur. Gepoolt 3/8 ≈ 38 %.

Der Anteil des Features liegt damit innerhalb der Streuung — **die Messung ist das Ergebnis, nicht
die neue Hülle**. Der Defekt liegt auf `main`. Das Repo kennt die Klasse sogar schon:
`e2e/shard-gruppen.json` notiert als Wurzel «zweiter schwerer OR-Reader je Chromium-Worker». Auf
CI greift sie nicht (dort `workers: 1`, Timeout 90 s, `retries: 2`); lokal kostet sie jeden
Vollauf einen Fehlalarm.

**Folge für die Vorprobe:** keine — V-1 und V-2 sind davon unberührt (die Rot/Grün-Differenz von
V-2 ist 56 zu 0, nicht 1 zu 0). **Folge für den Plan:** die Wurzel ist offen und gehört als
eigener Schritt in die ROADMAP (§17 — ein bekannter, dokumentierter Flake ohne Wurzelfix ist ein
offener Mangel). Sie hier zu beheben hiesse, die eingefrorene Hülle (FL-4) anzufassen.

---

## V-2 · Das Tor kann scheitern (§6.7)

### Aufbau

**Schaltpunkt** — `src/pages/GesetzLeser.tsx`:

| Stelle | Was |
|---|---|
| `gesetz-leser/leserFlag.ts:20` | `LESER_V3_KEY = 'lm.leser.v3'` — eigener Schlüssel, **nicht** der Optionen-Store |
| `gesetz-leser/leserFlag.ts:41–46` | `leserFlagAuswerten(suche, gespeichert)` — reine, DOM-freie Entscheidung (§2) |
| `GesetzLeser.tsx:25` | `leserFlagAuswerten(search, leserFlagLesen())` |
| `GesetzLeser.tsx:29–30` | Weiche: `GesetzLeserV3` oder `GesetzLeserInhalt`, gleicher `key`, gleiche Props |
| `src/RouteSwitch.tsx:116` | bindet `/gesetze/:ebene/:key` an die Fassade |
| `src/components/layout/Pane.tsx:126` | schickt das **sekundäre Pane** durch denselben `RouteSwitch` ⇒ FL-1 |

Die Regel liegt bewusst **neben** der Fassade und nicht in ihr: eine Komponenten-Datei darf nichts
anderes exportieren (`react-refresh/only-export-components`, Tor `lint` — im ersten Gate-Lauf rot
gegangen), die Regel muss aber DOM-frei prüfbar sein und in H5 an **einer** Stelle auffindbar
(FL-7, §5). `leserFlag.ts` entscheidet nur; gelesen und geschrieben wird ausschliesslich über
seine zwei schmalen Vollzugs-Funktionen, beide `try`/`catch` — im Prerender-Node gibt es kein
`localStorage`, und das prerenderte Markup bleibt unberührt.

**Der V3-Rahmen** — `src/pages/gesetz-leser/GesetzLeserV3.tsx`: sichtbarer Marker
(`data-leser-v3="rahmen"`) plus der unveränderte Ist-Baum. Die alte Hülle bleibt eingefroren
(FL-4); H1 ersetzt sie *von innen*.

**Das Flag-Projekt** — `playwright.config.ts`, drittes Projekt `leser-v3` neben `schwer` und
`chromium`. Aktivierung über `storageState` (localStorage `lm.leser.v3` auf dem Origin mit dem
dynamisch abgeleiteten Port), **nicht** über einen Query-Suffix: so bleibt jede bestehende Spec
Zeichen für Zeichen unangetastet (§6.3 verbietet Test-Anpassungen im Struktur-Schritt).

### Der Rot-Beweis

**ROT** — `GesetzLeserV3` rendert nur den Marker, der `ArtikelLeser`-Baum ist ausgehängt:

```
  1) [leser-v3] › e2e/gesetze-marginalie.e2e.ts:30:1 › Blatt (Sachüberschrift) ist je Stapel die prominenteste Stufe
    Error: expect(locator).toBeVisible() failed
    Locator: locator('a[href="#art-11"]').first()   Expected: visible   Error: element(s) not found
```
```
  56 failed
  1 passed (3.5m)
ROT_EXIT=1
```

**GRÜN** — derselbe Lauf, `ArtikelLeser`-Baum eingehängt, sonst nichts geändert:

```
  57 passed (51.2s)
GRUEN_EXIT=0
```

Damit ist belegt: das Flag erreicht den Browser (sonst wäre der rote Lauf gegen V1 gelaufen und
grün gewesen), und das Projekt prüft echte Aussagen.

### Selbsttest des Flag-Projekts

Der Rot-Beweis oben gilt für *diesen* Stand. Damit das Projekt auch künftig nicht still gegen V1
läuft — etwa nach einer Port- oder Schlüssel-Änderung —, sieht `e2e/leser-v3-flag.e2e.ts` den
Marker **positiv**, statt ihn vorauszusetzen. Drei Aussagen, in beiden Projekten gefahren:

| Test | `chromium` | `leser-v3` |
|---|---|---|
| Grundzustand (R10) | Marker **nicht im DOM** | Marker sichtbar |
| `?leser=v3` merkt sich, `?leser=v1` löscht (FL-3) | grün | grün |
| **Ein Flag schaltet auch das sekundäre Pane (FL-1)** | grün | grün |

```
  6 passed (10.2s)
```

Auch diese drei sind **rot gezeigt** (§6.7), und zwar gezielt: unterdrückt man den Marker im
sekundären Pane (`rolle !== 'sekundaer'`), fällt genau die FL-1-Aussage — und nur sie:

```
  ✘  5 [chromium]  › FL-1: dasselbe Flag schaltet das sekundäre Pane mit — ohne zweite Umschalt-Stelle (23.6s)
  ✘  6 [leser-v3]  › FL-1: dasselbe Flag schaltet das sekundäre Pane mit — ohne zweite Umschalt-Stelle (24.1s)
  2 failed
  4 passed (29.4s)          FL1_ROT_EXIT=1
```

Der FL-1-Test ist der eigentliche Kern: er setzt das Flag **einmal** im Hauptfenster, wechselt zu
einem Entscheid, schlägt dort das UVG per «nebeneinander öffnen» daneben auf — und findet den
V3-Rahmen **im Pane**, das niemand umgeschaltet hat. Nebenbei belegt er, dass der Rahmen nicht
global leckt (im Entscheid-Hauptfenster: kein Marker).

### Vitest

`src/tests/leser-v3-flag.test.ts` — 5 Fälle, DOM-frei: Grundzustand aus (auch bei fremdem
Speicherwert), beide Query-Zweige, Speicher-Vorrang, und die FL-6-Aussage, dass
`lm.leser.optionen` **geteilt** und nicht dupliziert wird.

---

## V-3 · Basisrate statt Schätzung

### (a) Streichquote der «Rückbau-zuletzt»-Etappen

Durchsucht: alle 63 `FAHRPLAN-*.md` (37 in `archiv/`, 26 in `fahrplaene/`).

| Fahrplan | Rückbau-Etappe | gelandet? | Beleg |
|---|---|---|---|
| `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §9.3 (V1: Guide-Mechanik zurückbauen) | letzte Etappe | **ja** | Commit `1d571c6ed` (PR #530), 16.8.2026 |
| `FAHRPLAN-DATENHALTUNG.md:532` (Blob-Ingest-Rückbau) | letzter offener Punkt | **offen** | `git log --all -S"Blob-Ingest"` → 0 Treffer |
| *(borderline)* `FAHRPLAN-FEDLEX-PORTFOLIO.md` (Sidecar-Übergangslösung) | an `DATENHALTUNG` E1 delegiert | **offen** | Sidecars liegen unverändert vor |

**n = 2 streng zählbar** (1 gelandet, 1 offen, **0 still gestrichen**); mit dem Grenzfall n = 3
(1 / 2 / 0).

**Diese Zahl ist keine Rate, sondern eine Anekdote** (§0 Ziff. 3c). Sie kann den 5-PR-Deckel
weder stützen noch widerlegen. Der Grund für die kleine Stichprobe ist selbst ein Befund:
`FAHRPLAN-LESER-V3.md:109` hält fest, dass es im Repo **keinen Feature-Flag-Mechanismus gibt** —
grosse Umbauten liefen bisher als sequenzielle Änderungen am Bestand, ohne Doppelspur. Immerhin:
es gibt **keinen einzigen belegten Fall**, in dem ein angekündigter Rückbau kommentarlos
fallengelassen wurde; die offenen Fälle sind ausdrücklich als offen deklariert.

### (b) Reale Etappen pro Woche im Leser

Messbedingung: Squash-Landungen auf `main` (Betreff endet auf `(#NNN)`), die
`src/pages/gesetz-leser` berühren, Zeitraum **19.7.–16.8.2026** (4,1 Wochen).
`git log --merges` liefert hier **0** — das Repo merged per Squash; wer Merge-Commits zählt,
misst nichts.

| Grösse | Zahl | pro Woche |
|---|---|---|
| PR-Landungen im Leser-Ordner | 41 | **≈ 10** |
| davon benannte Fahrplan-Etappen (S1–S10, R1–R3, B1–B7, E4, EID-2/3 …) | ≈ 26 | **≈ 6** |

### Folgerung für den Deckel (**wartet auf David**)

Bei ~6 benannten Etappen pro Woche ist ein Deckel von 5 H-PRs **rechnerisch etwa eine Woche
Durchsatz** — er bindet die Bauzeit also nicht; die bindende Grösse ist die Abnahme-Kadenz, nicht
die Bau-Kapazität. Der Deckel bleibt damit sinnvoll als **Abbruch-Schwelle gegen R9**, taugt aber
nicht als Zeitplan.

Der ernstere Befund ist (a): **es gibt im Repo keine Vorgeschichte für eine flag-geschützte
Parallel-Hülle.** Der nächste Verwandte, `archiv/FAHRPLAN-STARTSEITE-V3.md`, baute die Startseite
in **5 PRs direkt am Bestand um** (S1–S5, `git log 4969e4e57..4d159a003`) — ohne Flag, ohne
Parallel-Fassung, und damit ohne die Möglichkeit, dass eine Doppelspur stehen bleibt. Das ist
kein Argument gegen (B-hybrid), aber es heisst: Der Fahrplan wählt bewusst einen Weg, den dieses
Repo noch nie gegangen ist, und R9 ist damit ein **unbelegtes** Risiko in beide Richtungen — es
gibt weder Beleg dafür, dass es hier eintritt, noch dafür, dass es beherrscht wird. Der
Vorschlag: den Deckel als Abbruch-Schwelle behalten, aber H5 (Flag-Entfernung) schon in H1 als
Abnahmezeile mitschreiben, nicht erst am Ende.

---

## Kap. 12 · Die drei «5-Minuten-Punkte»

| # | Stand | Befund |
|---|---|---|
| **A-1** `scrollAnker.ts`-Claim | **verifiziert — Fundstelle benannt, kein Kommentar-Fehler** | Der Fahrplan behauptet, `scrollAnker.ts` beschreibe einen localStorage-Spiegel, den es nicht gebe. Beides trifft nicht zu. `scrollAnker.ts:134–137` sagt ausdrücklich das **Gegenteil** («Bewusst NICHT in der Adresse und NICHT in localStorage») und verweist auf die dauerhafte Spur. Diese existiert und ist greppbar: `src/pages/gesetz-leser/lesePosition.ts:54` (`KEY = 'lexmetrik-leseposition'`, Schreibzugriff Z. 98), plus `lib/zuletztVerwendet.ts` (`'lexmetrik-zuletzt'`) für den Verlauf. `lesePosition.ts:8–19` begründet die Trennung (flüchtige Sitzungs-Registry vs. dauerhafter Spiegel, zwei Verfalls-Arbiter). **Nichts zu korrigieren; die Fahrplan-Zeile A-1 ist der Fehler und wird beim nächsten Fahrplan-Schnitt gestrichen.** |
| **A-2** `#art_N` → `#art-` | **verifiziert — nichts zu korrigieren** | Die im Fahrplan genannte Datei `02-referenzen.md` existiert im Repo nicht (sie war Scratchpad). `grep -rn '#art_' docs/` trifft ausschliesslich `docs/ux-audit-2026-07/fedlex/inspect.json` — und dort ist `#art_1` **korrekt**, es ist Fedlex' eigenes Anker-Schema in eingefangenem Fremd-HTML, keine Aussage über uns. Verbindlich ist `#art-<token>`, belegt in `src/pages/gesetz-leser/inhalt-sprung.tsx:159`: `location.hash.match(/^#art-(.+)$/)`. |
| **A-3** `EntscheidLeser.tsx` Guard | **gebaut** | Der Gesetz-Leser setzt `document.title` nur ausserhalb des sekundären Pane (`inhalt-hooks.tsx:129`, Regel B-2.5); der Entscheid-Leser tat es ungeguardet. Folge im Split-View: ein neben einem Gesetz aufgeschlagener Entscheid übernahm den Browser-Tab-Titel, obwohl das Hauptfenster das Gesetz zeigt — der Reiter log über seinen eigenen Inhalt (§8). Fix: eine Zeile in `src/pages/EntscheidLeser.tsx` (`if (rolle === 'sekundaer') return;`) plus `rolle` aus `usePaneKontext()` und in der Dep-Liste. Nachweis: `src/tests/tab-titel-paritaet.test.ts` (Quellensonde, Präzedenz `leser-adresse-lm202.test.ts`), 3 Fälle. **Ausserhalb des Leser-Ordners — im PR ausdrücklich zu deklarieren.** |

---

## Abweichungen vom Fahrplan (offengelegt, §7)

1. **«Rahmen, der `ArtikelLeser` importiert» → «Rahmen, der den `ArtikelLeser`-Baum einhängt».**
   Die acht bzw. zehn N-Specs prüfen Optionen-Menü, PDF-Download, Marginalien und Suche, also die
   **volle Hülle**. Ein Rahmen, der `ArtikelLeser` selbst zusammensetzt, könnte sie nicht
   bestehen — die Fahrplan-Zeile «danach alle acht grün» und die Zeile «leerer Rahmen» sind in
   der wörtlichen Lesart nicht gleichzeitig erfüllbar. Umgesetzt ist deshalb die Naht-Variante:
   der Rahmen delegiert den Inhalt, H1 ersetzt ihn von innen.
2. **«die 8 N-Tests» → zehn.** Kap. 10 schreibt «8 bleiben unverändert grün» und zählt in
   derselben Zelle **zehn** Namen auf. Das Flag-Projekt fährt alle zehn; mehr Deckung ist hier
   die sichere Richtung. Der Zählfehler gehört im Fahrplan korrigiert.
3. **Ein zusätzliches e2e-File** (`e2e/leser-v3-flag.e2e.ts`, Shard-Gruppe 6). Nicht vom Fahrplan
   verlangt, aber ohne den positiven Marker-Nachweis wäre `leser-v3` nach der nächsten
   Port-Änderung ein Tor, das nicht scheitern kann (§6.7).
4. **Eine Datei mehr als die Auftrags-Whitelist** (`src/pages/gesetz-leser/leserFlag.ts`). Grund:
   die Flag-Regel in der Fassade zu halten liess das Tor `lint` rot laufen
   (`react-refresh/only-export-components`) — ein Tor-Verstoss, kein Geschmacksentscheid.

---

## Tor-Stand

| Tor | Ergebnis |
|---|---|
| `bash scripts/gate.sh voll` (V-1, Flag aus) | grün, Exit 0 |
| `npm run gate` (Schlussstand) | `GATE GRÜN.` Exit 0 — erster Lauf war **rot** (`lint`: `react-refresh/only-export-components`; `check:design-tokens`: `text-sm` statt Hausskala), beides an der Wurzel behoben statt unterdrückt |
| `npm run check:e2e-shards` | `80 Specs, Union der 8 Gruppen exakt deckungsgleich` — nach `gen:e2e-shards` mit der neuen Spec |
| `npm run check:perf-budget` (nach Build) | grün — entry 51.7 KB / Budget 60.0 KB, vendor-react 71.9 KB / 90.0 KB |
| e2e Leser/Gesetze/Split-View, Flag aus (V-1, Schlussstand) | `198 passed` Exit 0 |
| e2e `--project=leser-v3` | rot `56 failed` → grün `57 passed`; Schlussstand 60 Tests, 3/5 Läufe grün (Rest = der `main`-Flake oben) |
| e2e `leser-v3-flag.e2e.ts` (beide Projekte) | `6 passed`; gezielt rot gezeigt: `2 failed / 4 passed` |
