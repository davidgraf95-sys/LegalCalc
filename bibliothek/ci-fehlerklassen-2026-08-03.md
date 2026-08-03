# CI-Fehlerklassen K1–K13 — Diagnose Phase A (3.8.2026)

**Erstellt:** 3.8.2026 · **Status:** entwurf (nicht fachlich abgenommen) ·
**Quelle:** CI-Diagnose Phase A, Session 3.8.2026, **80 ausgewertete Läufe** des
Repos `RaveDave/LexMetrik` (GitHub Actions) · **Behebung:** PR #419
(`02df51a0a`), Vorlauf #414 (`9c63c647a`), Nachzug #420 (`d864a9caa`).

Warum diese Liste (§11): die Diagnose fand 13 durchnummerierte Fehlerklassen,
verteilt über sieben Workflows. Ohne geordnete Ablage bliebe das Wissen in einer
Commit-Message und in 80 Lauf-Logs, die GitHub nach 90 Tagen löscht. Jede Klasse
steht hier mit **Symptom · Wurzel · Fix/Status · Beleg** — der Beleg ist stets
eine Lauf-, PR- oder Issue-Nummer, nie eine Vermutung (§7).

**Ehrliche Grenze vorweg:** von den Nummern K1–K13 sind **neun** (K1, K2, K3, K5,
K6, K7, K11, K12, K13) in gelandeten Commits belegt. **K4, K8, K9 und K10 tragen
im Repo keinen Beleg** — sie erscheinen in keinem Commit, keinem Workflow und
keinem Kommentar des Tages. Sie sind hier als offene Nummern geführt und **nicht
rekonstruiert**; wer sie braucht, klärt sie an der Diagnose-Quelle, nicht an
dieser Liste (§8). Zwei weitere Fixe des Tages liefen ohne K-Nummer und stehen
darum am Ende.

---

## Die belegten Klassen

| # | Symptom | Wurzel | Fix / Status | Beleg |
|---|---|---|---|---|
| **K1** | Bot-PR aus `fedlex-frische.yml` trägt keinen Required-Kontext, `gh pr merge --auto` wartet ewig | PR-Eröffnung mit `github.token`; für Events dieses Tokens löst GitHub **keine** Workflows aus. `AUTOMERGE_TOKEN` existierte nicht (`gh secret list` kannte nur `TURSO_AUTH_TOKEN`) | **behoben** #419: nach PR-Eröffnung `gh workflow run ci.yml --ref <branch>` (`workflow_dispatch` ist die dokumentierte Ausnahme von der GITHUB_TOKEN-Rekursionssperre), `permissions: actions: write`. **Wurzel-Fix nachgezogen:** David hat `AUTOMERGE_TOKEN` am 3.8.2026, 17:54Z angelegt | Läufe `30795814361`, `30795814304` (beide `action_required`) |
| **K2** | Ein Required-Kontext fehlt am PR-Head-SHA: nichts ist rot, nichts scheitert — der PR ist nur dauerhaft blockiert | Zweite Fehlerklasse neben «Lauf rot»: es findet **gar kein Lauf statt**. Kein Wächter sah das | **behoben** #419: der Wächter prüft je offenem PR Check-Runs **und** Commit-Statuses am Head-SHA und zieht fehlende Actions-Kontexte per Dispatch nach — nur bei FEHLENDEN, nie bei roten (ein rotes Tor ist ein Befund, kein Ausfall). Kontextliste aus dem Branch-Schutz selbst (§5) | Trockenprobe: Head `e1788d45` (PR #417) → 14 Kontexte, 0 fehlend, kein Dispatch · Head `d49792a6` → 11 Actions-Kontexte fehlend, Dispatch |
| **K3** | Ein PR erzeugt **keinen** Lauf und damit keinen Kontext — GitHub wartet dauerhaft auf «expected» | `ci.yml` ignorierte auf `pull_request` alle `**.md`-Diffs, `ci-doku-noop.yml` triggerte invers auf `**.md`. Ein Diff, der durch **beide** Filter fällt, trifft keinen Workflow | **behoben** #419: `pull_request` verliert jeden Pfadfilter; ein billiger Job `diff` klassiert den PR-Diff als `art=code`/`art=doku`, die Fallunterscheidung sitzt in den SCHRITTEN. Job-Menge ereignisunabhängig konstant. Jede Unsicherheit der Klassierung fällt auf `art=code` (volles Programm) | PR **#417** (`changed_files=0`, Status BLOCKED, ohne dass ein Tor rot war) |
| **K5** | Alarm-Rauschen: Issue #166 (angelegt 6.7.2026) trug am 3.8. vier gleichlautende «Erneut rot am …»-Kommentare | `normen-monitor.yml` legte bei Rot einen Zettel an oder kommentierte ihn — **nie geschlossen, nie eskaliert**. Ein Alarm, der sich vier Wochen unverändert wiederholt, ist Rauschen; genau darin gingen die 8 nicht-kanonischen Fedlex-Pins unter | **behoben** #419: (1) GRÜN schliesst den Zettel (`if: success()`), erneutes Rot legt einen neuen an — der Zeitpunkt der Rückkehr bleibt ablesbar; (2) ab dem **3. roten Lauf in Folge** Titel-Präfix «ESKALATION:», idempotent, Serienlänge in jedem Kommentar. `cancelled`/`timed_out` brechen die Serie NICHT (§6.7 lit. c) | Issue **#166**; Trockenprobe gegen die echte Historie: Serie = 8 ⇒ Eskalation JA |
| **K6** | `check:ci-laeufe` seit Anlage am 20.7.2026 **15 Läufe, 15× `failure`** — kein einziger grüner | Das Tor sammelte ALLE Workflows mit `schedule:`-Trigger, also auch `waechter.yml`, in dem es selbst läuft. Der eigene laufende Lauf ist `in_progress` und fällt aus der `completed`-Filterung ⇒ beurteilt wurde immer der **vorige** Lauf des Wächters. Einmal rot = für immer rot | **behoben** #419: Selbstausschluss über die Konstante `SELBST`, am Fundort begründet; das Tor prüft die Existenz der ausgeschlossenen Datei und wird sonst rot (§6.7 lit. b, damit der Ausschluss nicht ins Leere läuft). §6.7-Rotprobe **zweifach** gezeigt | Lauf `30803981348` nennt wörtlich «waechter.yml: jüngster Lauf 'failure'» |
| **K7** | Ein Registertermin läuft ab und färbt **schlagartig alle offenen PRs rot**, ohne dass einer davon damit zu tun hätte | `check:verfall` war das einzige Tor im PR-Pfad, dessen Ergebnis von der **Wanduhr** abhängt statt vom Diff (`verfall-pruefen.ts` vergleicht gegen `new Date()`) | **behoben** #419: Tor **verschoben, nicht gestrichen** — wöchentlich in `normen-monitor.yml` (`if: always()`), vor jedem Reparatur-PR in `fedlex-frische.yml`, vor jedem Deploy lokal in `check:seriell`. Vorlauf-Warnung 45 Tage (bewusst über den beauftragten 14, mit `VerfallUebersicht.tsx` gespiegelt — Abweichung offengelegt, §7) | Lauf `30764225649` (2.8.2026, Branch `claude/sleepy-mestorf-5dbea7`): «VERFALLEN 2026-08-01 Künftige Fassung BüV (SR 141.01)» |
| **K11** | Required-Kontexte, die niemand erzeugt, bleiben unbemerkt «expected» | Kein Wächter auf der Ebene «Lauf hat nie stattgefunden» — dieselbe Wurzel wie K2, andere Blickrichtung (PR statt Workflow) | **behoben** #419 gemeinsam mit K2; `if: always()`, damit der Nachzug gerade dann läuft, wenn der Lauf-Zustands-Check darüber rot war | s. K2 |
| **K12** | Elf Required-Kontextnamen mussten **byte-synchron über drei Systeme** gepflegt werden (`ci.yml` · `ci-doku-noop.yml` · Branch-Schutz) | Zwillings-Workflow als Pfadfilter-Gegenstück: jeder Kontextname zweimal deklariert (§5-Verstoss im Build-System) | **behoben** #419: `ci-doku-noop.yml` **gelöscht**; jeder Required-Kontext hat genau einen Erzeuger in genau einer Datei. Die 11 Required-Namen sind **unverändert** (Branch-Schutz nicht angefasst), maschinell verglichen: 0 Abweichungen | Zweimal misslungen: PRs **#318/#320** hingen unmergbar, weil der Zwilling die 8 Shard-Kontexte und «Perf-Budget» nicht meldete (im Kopf von `ci-doku-noop.yml` Z. 13–25 selbst dokumentiert) |
| **K13** | Deprecation-Warnung in **jedem** Lauf-Log — und daneben stehen die Warnungen, die zählen | `actions/checkout` und `actions/setup-node` auf v4 = Node 20 | **behoben** #419: wholesale über alle 7 Workflows (10× checkout, 10× setup-node) auf v5. `upload-artifact`/`download-artifact`/`cache` bleiben auf v4 — dort ist v4 die aktuelle Major | YAML-Parse aller 7 Workflows grün; expandierte Kontextnamen-Liste unverändert |

## Ohne K-Nummer, gleiche Session, gleiche Wurzelklasse

| Sache | Symptom | Wurzel | Fix / Status | Beleg |
|---|---|---|---|---|
| **Kanonik-Selbstheilung** | Der Normen-Monitor war seit dem **29.6.2026 rot** — fünf Wochen Befund ohne Massnahme | Der Frische-Workflow hob nur überholte **Konsolidierungsdaten** (3. Pipe-Feld in `fedlex-cache.sh`). Die zweite Achse — die nicht-kanonische **html-Revision** (4. Feld) — wurde vom Arbiter in `check:fedlex-versionen` zwar erkannt, aber von niemandem repariert | **behoben** #419: nach dem Datums-Repin läuft `check:fedlex-versionen`; rot ⇒ `fedlex:repin-kanonik --write`, danach erneute Prüfung. Bleibt der Arbiter rot, wird der **Lauf** rot, statt einen PR zu eröffnen, der eine Heilung behauptet, die nicht stattfand (§8). `fedlex:repin-kanonik` als npm-Skript ergänzt | 8 Pins standen nicht-kanonisch (`zgb` 1→2, `mwstg` 3→4, `bbg` 2→3, `usg` 0→1, `gwg` 6→7, `kag` 6→7, `fza` 5→9, `cmr` 3→6); Hand-Fix `671e93450`, gelandet mit #414 (`9c63c647a`) |
| **Stiller Fallback in `fedlex-cache.sh`** | Ein fehlgeschlagener Pin-Abruf lieferte still eine **andere html-Revision** — amtlicher Text, aber nicht der geltende; das Tor meldete «OK» | Fallback-Schleife html-1..5 setzte die erste Variante ein, die HTTP 200 + >20 kB lieferte. Der Bereich war zu klein: **67 der 227 Pins** stehen auf N≥6 (bis N=17: `vwvg`, `finma_gebv`) — für sie hätte die Schleife zwangsläufig eine falsche Revision eingesetzt. *(Abweichung vom Auftrag, der von «5 Pins bei N≥6» ausging: ausgezählt sind es 67, §7.)* | **behoben** #419: Fallback entfernt, Fehlschlag ist laut. Zuständig für «welche Revision ist kanonisch» ist Fedlex über `isExemplifiedBy` (§5) | §6.7-Rotprobe gegen denselben manipulierten Pin (`zgb`, html-N künstlich 93): ALT Exit **0** («OK … 6/1099 Anker geprüft»), NEU Exit **1** («gepinnter Abruf fehlgeschlagen (HTTP 200, 9148 B)») |

## Offene Nummern

**K4 · K8 · K9 · K10** — im Repo nicht belegt. Sie tauchen in keinem Commit von
#414/#419/#420, in keinem Workflow und in keinem Kommentar auf. Möglich ist
beides: in der Diagnose verworfen, oder in einer der anderen Massnahmen
aufgegangen. **Nicht rekonstruiert** — eine plausible Erklärung wäre hier
schlimmer als die Lücke (§8).

## Was daraus als Regel bleibt

1. **Ein Melder, der sich selbst überwacht, meldet seine eigene Vergangenheit**
   (K6). Wer einen Wächter baut, schliesst ihn aus seiner eigenen Prüfmenge aus
   — und sichert den Ausschluss gegen stilles Ins-Leere-Laufen ab.
2. **«Kein Lauf» ist eine eigene Fehlerklasse neben «Lauf rot»** (K2/K3/K11).
   Rot ist sichtbar; fehlend ist unsichtbar und blockiert genauso.
3. **Zwei Filter, die einander ergänzen sollen, lassen eine Lücke** (K3). Ein
   Erzeuger je Kontext, Fallunterscheidung in den Schritten statt in den
   Triggern (§5).
4. **Ein Tor, dessen Ergebnis von der Wanduhr abhängt, gehört nicht in den
   PR-Pfad** (K7) — verschieben, nie streichen.
5. **Ein Alarm ohne Gegenstück wird Rauschen** (K5). Wer anlegt, muss auch
   schliessen und eskalieren können.
6. **Ein stiller Fallback ist gefährlicher als ein Fehlschlag** (fedlex-cache):
   er liefert etwas Plausibles und lässt jedes Tor grün melden.

## Pflegebedarf

- Die Lauf-IDs oben verweisen auf GitHub-Actions-Läufe; **GitHub löscht Logs nach
  90 Tagen**. Ab ~1.11.2026 sind die IDs nur noch Referenz, nicht mehr abrufbar —
  die inhaltliche Aussage ist darum hier ausgeschrieben, nicht bloss verlinkt.
- Offen als Folgearbeit im Plan: `QS-AUTOMATIK-BERICHT` (Wächter-Zustandsbericht,
  damit die nächste Diagnose nicht wieder 80 Läufe einzeln auswerten muss) ·
  `QS-AUTOMATIK-WT` (Verwaiste-Worktree-Sonde, Anlass K3/PR #417) ·
  `QS-BASIS-MQ` (Merge Queue G7 nach Landung der Runner-Robustheit).

## Abnahme-Status

**entwurf** — nicht fachlich abgenommen. Die Fix-Zuordnungen sind aus den
gelandeten Commits belegt; die Vollständigkeit der Klassenliste ist es **nicht**
(s. «Offene Nummern»).
