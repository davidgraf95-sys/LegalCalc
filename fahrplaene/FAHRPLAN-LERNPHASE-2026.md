# Fahrplan Lernphase 2026 — Bauen ohne Davids Fachzeit (bis 1.12.2026)
<!-- @lagebild name: Prüfwerkzeuge schärfen · zweck: Gegenprüfung schneller melden, Tests stabiler, Beweis-Werkzeuge. -->

**Heimat: ROADMAP-Schritte `LERNPHASE-AB` und `QS-GP`.**

## §0 · Zweck

Detailquelle zu `LERNPHASE-AB`/`QS-GP` — was ohne Davids fachliche Detail-Abnahme
gebaut werden kann, bis zur Anwaltsprüfung (harte Zeitsperre bis 1.12.2026, **keine
Vermeidung**: Abnahme bis dahin nicht proaktiv vorschlagen/drängen).

**Auftrag David (22.6.2026):** Bis zur Anwaltsprüfung (**läuft bis 1.12.2026**) hat David **keine
Zeit für die fachliche Detail-Abnahme**. Das ist eine harte Zeitsperre, **keine Vermeidung** —
Abnahme bis dahin NICHT proaktiv vorschlagen/drängen (vgl. Memory `lexmetrik-abnahme-zeitsperre`,
`abnahme-david-selbst`). Erste Kanzleigespräche **G1 = Februar 2027** (nach der Prüfung).

**Herleitung:** Zwei unabhängige Council-Läufe (DMAD, Sonnet- + Opus-Panel, 22.6.2026) kamen auf
denselben Kern: Der einzige verteidigbare Solo-Moat ist die **fachkundige Abnahme** (Moat C+D),
nicht die Breite (Code = ~6 Monate kopierbar). Davids Erst-Abnahme ist die einzige
nicht-delegierbare, nicht-parallelisierbare Ressource — und steht bis 1.12. faktisch bei ~0/Woche.
Daraus folgt: Die Spannung «weiter bauen vs. abnehmen» (STRATEGIE-PLATTFORM §0 Befund 3 vs.
Ausbau-Direktive 14.6.) löst sich auf der **Zeitachse** auf statt durch eine Entweder-oder-Wahl.

```
Jun 2026 ───────────────► 1. Dez 2026 ──────────────► Feb 2027
   Lernphase                  Abnahme-Welle               G1
   (Agenten bauen,            (David, Fristen zuerst,      (geprüfter
    kein Abnahme-Druck)        Infrastruktur steht)         Kern)
```

**Leitsatz der Lernphase:** Bis Dezember nur Arbeit, die (a) **keine** Davids-Fachzeit braucht und
(b) die spätere Abnahme-Welle **billiger/schneller** macht. Jeder Bau bleibt auf `entwurf`-Niveau;
§8-Ehrlichkeit bleibt. Keine neue Engine wird als `verified`/`geprüft` ausgegeben (das geht erst
ab Dezember durch David).

---

## Strang A — Ehrliche Status-Marker (haftungssicher ohne Abnahme)

**Warum zuerst:** Der einzige echte Risikohebel, der ohne David machbar ist. Beide Councils:
130 sichtbare Karten bei 0 geprüften sind nur dann gefährlich, wenn ihr Status **nicht ehrlich
gekennzeichnet** ist. Ehrlich markiert ≠ falsch behauptet → haftungssicher.

- Jede Karte trägt sichtbar einen ehrlichen Status: `verified` / `entwurf` / `geplant` **plus
  Stand-/Gültigkeits-Datum**. Status nie schöner darstellen als er ist.
- Ungeprüfte Engines bekommen einen klaren, nicht übersehbaren «in Entwicklung / noch nicht
  fachlich abgenommen»-Hinweis am Ergebnis (nicht nur im Kleingedruckten).
- Norm-Anker (Artikel/§ + Fedlex-Link + Stand) je Wert sichtbar machen — das ist zugleich der
  spätere Burggraben-Verkaufspunkt (Moat C als Produktmerkmal, nicht nur internes Asset).
- Prüfen: Gibt es bereits ein Status-Feld im Karten-/Engine-Schema? Wenn ja, durchgängig
  befüllen/anzeigen; wenn nein, im Schema ergänzen (vgl. Schema-Registry, Ausbau-Direktive P0).

**Fertig, wenn:** Kein Nutzer kann eine ungeprüfte Engine für geprüft halten; jeder ausgegebene
Wert ist zur Norm rückverfolgbar.

## Strang B — Verifikations-Infrastruktur (der «Multiplikator danach»)

**Warum:** Macht jede einzelne Abnahme ab Dezember drastisch schneller und konserviert sie gegen
Regression. **Wichtige Grenze (beide Councils):** Golden-Tests prüfen **Konsistenz/Regression,
nicht Richtigkeit** — sie ersetzen Davids Erst-Urteil NICHT, sie bewahren es. Also: Infrastruktur
bauen, die Davids spätere Prüfung *vorbereitet und festhält*, nicht eine, die sie vortäuscht.

- Golden-Output-Abdeckung für alle abnahmekritischen Engines vervollständigen (committet + CI-gegated;
  vgl. `golden/`, FAHRPLAN-GRUNDLAGEN G2/A). Lücken schliessen, damit ab Dezember jede Abnahme
  sofort gegen einen Golden-Stand läuft.
- Norm-Anker-Extraktion/-Prüfung automatisieren (Zitate-Prüfer, Fedlex-Caches, Stand-Daten) —
  damit ein veralteter Wert mechanisch auffällt, nicht durch Disziplin.
- Verfallsregister von Disziplin auf Mechanik heben (CI-getaktet) — STRATEGIE §0 Befund 4
  (Pflegelast wird sonst zur Solo-Grenze). Terminierte Verfälle nicht in die Lernphase fallen lassen.
- Eine «Abnahme-Checkliste je Engine» vorbereiten (was David im Dezember pro Karte beurteilt) —
  standardisiert die Welle.

**Fertig, wenn:** Eine Engine im Dezember in Minuten statt Stunden abgenommen werden kann, weil
Recherche, Golden, Norm-Anker und Checkliste schon bereitliegen.

## Strang C — Fristen-Engines abnahmefertig aufreihen (Dezember-Welle vorbereiten)

**Warum Fristen zuerst:** Höchstes Haftungsrisiko (falsche Frist = direkter Haftungsfall der
Kanzlei) → in der Dezember-Welle als Erstes abzunehmen. Priorisierung nach **Haftungsrisiko**,
nicht nach Reihenfolge.

- Die haftungskritischen Fristen-Engines identifizieren und in eine priorisierte
  **Abnahme-Warteschlange** bringen (Rangfolge: Fristen → Tarife/Kosten → Form-Vorlagen).
- Je Engine das Abnahme-Material vorbereiten: Norm-Anker gesetzt, Sollwerte doppelt recherchiert
  (Recherche + unabhängige Gegenprüfung, Memory `immer-doppelt-verifizieren`), strittige Punkte
  (Auslöseereignis, Ermessensanteil) ausdrücklich markiert — sodass David im Dezember nur noch
  **beurteilt**, nicht mehr recherchiert.
- `verified` nicht binär behandeln: bei Karten mit Ermessens-/Schätzanteil einen Status
  «deterministischer Teil prüfbar, Ermessensteil gekennzeichnet» vorsehen statt falschem `verified`.

**Fertig, wenn:** Am 1. Dezember liegt eine fertige, nach Haftungsrisiko sortierte Abnahme-Liste
mit vollständig aufbereitetem Material bereit.

---

## Erster Schritt am 1. Dezember 2026

**Eine repräsentative Fristen-Engine vollständig bis `verified:true` durchziehen — und die reine
Abnahme-Zeit stoppen.** Diese eine gemessene Zahl (Zeit pro Engine) macht erst entscheidbar, wie
gross der geprüfte «G1-Demo-Korridor» bis Februar realistisch wird. Reicht der ~2–3-Monats-Runway
nicht für den geplanten G1-Umfang, wird der **Demo-Umfang gekürzt**, nicht der Termin verschoben.

## Tabu / Leitplanken (Lernphase)

- Keine Abnahme erzwingen, kein `geprüft`/`verified` ohne David.
- Markt-Themen (Hosting/Zahlung/Login) bleiben draussen (unverändert).
- Push/Deploy nur auf Davids frisches Ja (§9).
- Nie zwei 26×-Datenassets parallel; keine Rechtslogik in UI/Adapter (Ausbau-Direktive-Tabu).

---

*Quelle der Synthese: zwei DMAD-Council-Läufe 22.6.2026 (Workflow `council-lexmetrik-strategie`).
Dieses Dokument ist Planung; noch nicht committet/gepusht.*

---

## §1 · ROADMAP-Spec LERNPHASE-AB (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «Strang A», «Strang B», «Strang C» und «Erster Schritt am 1. Dezember 2026» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  trägt sichtbaren ehrlichen Status (`verified`/`entwurf`/`geplant`) + Stand; Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren. **Werkzeug-Andockung (Audit 1, 2.7.):** `fast-check`-Property-Tests
  für Staffel-/Bandgrenzen (`src/tests/tarifInvarianten.test.ts` — fängt Off-by-one; Dev-Dependency,
  seed-deterministisch §2) · **Gate-Kette parallelisieren** (`package.json`-`check` via Promise.all/spawn,
  ~9,6 s → ~2–3 s, Bordmittel) · Myers-`diff`-Package NUR als `golden:diff`-Diagnose — **das Gate selbst
  bleibt Byte-Vergleich.** Detail `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`. **Stärkste zeitsperre-konforme Arbeit** — macht die
  Dez-Abnahme billig; dauerhaft begleitend. **Alle drei Werkzeug-Andockungen erfüllt 5.7.2026**
  (PR `feat/lernphase-verifikations-infra`). Detail: `ROADMAP-CHRONIK.md` → LERNPHASE-AB.
  **Status-Korrektur 20.7.2026 (§8):** Die drei Werkzeug-Andockungen sind **fertig** (`9da9a9d4` ·
  `c6b7eef0` · `0d104ab5`, Doku `445001e9`, alle 5.7.2026) — seither **kein** Commit mit
  `Roadmap: LERNPHASE-AB`, kein Worktree, kein offener PR. Der **Dach-Auftrag** ist damit NICHT erledigt:
  «jede Karte/Engine trägt sichtbaren ehrlichen Status + Stand» (Strang A) und «Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren» sind nirgends als erfüllt belegt. Der Schritt stand nur deshalb auf
  `wip`, weil das Etikett nach dem 5.7. nie zurückgesetzt wurde ⇒ **`ready`** (offen, baubar, niemand baut).

---

## §2 · ROADMAP-Spec QS-GP (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «Strang B — Verifikations-Infrastruktur» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  erweitert die Verifikations-Infrastruktur. Der adversariale Zweitdurchgang (unabhängiger
  Opus-Agent, frischer Kontext, Auftrag: Output gegen die amtliche Quelle **widerlegen**) fing real
  die teuersten Bugs (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust), hängt aber bisher an
  Session-Disziplin statt an einem Tor. **Design-Detailquelle:**
  [`docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md`](../docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md);
  Nachweis-Register [`bibliothek/register/gegenpruefung-register.md`](../bibliothek/register/gegenpruefung-register.md).
  **Stand 1.7.2026: Bausteine a+b+c gebaut, gemergt PR #67 (`252731bd`) + prod-live** (Tor
  `check:gegenpruefung` in `npm run gate`, Skill »gegenpruefung«, Register + Quittier-Helfer
  `npm run gegenpruefung:ok`); offen nur Baustein d (rückwirkende Kampagne).
  **Präzisierung 20.7.2026 (§8 — die alte Formel «offen nur d» verdeckte, dass d SELBST dreistufig ist):**
  von den drei Kampagnen-Stufen **Rechnen → extrahierte Normen → Rest** ist **nur Stufe 1 «Rechnen» gelaufen**
  (`58e8237e`, 2.7.2026, ~45 norm-belegte Korrekturen, Trailer `Gegenpruefung: bestanden (Opus, 7 Linsen) —
  45 confirmed/0 refuted`; Report `bibliothek/register/QS-GP-KAMPAGNE-2026-07-02.md`, 127 Rohbefunde/38 Dateien).
  **Offen bleiben Stufe 2 (extrahierte Normen), Stufe 3 (Rest) und die BGE-Korpus-Regenerierung.** Das Register
  führt bisher **keinen Kampagnen-Burn-down**, sondern nur Diff-gebundene Einzelquittungen aus laufender
  Bauarbeit — der rückwirkende Fortschritt ist also nicht messbar; ihn messbar zu machen gehört in Stufe 2.
  Status darum `ready` (niemand baut daran), nicht `wip`.
  Wortlaut der gebauten Bausteine a·b·c samt Glob-Hinweis verschoben — die **as-built**-Wahrheit
  steht in `scripts/gegenpruefung/kern.ts` + der Spec. Detail: `ROADMAP-CHRONIK.md` → QS-GP.
  Offen bleibt Baustein d:
  - **d · Rückwirkende Kampagne** *(Batches, Opus, `[OF]`)* — risiko-priorisiert: **Rechnen →
    extrahierte Normen → Rest**; enthält die **BGE-Korpus-Regenerierung** (Welle 2 · 6). Gegen
    amtliche Quelle verifizierbar; Verdikte ins Register (c). **Constraints:** reine Re-Verifikation
    öffnet **keinen** 26×-Slot; ein daraus folgender Daten-Bulklauf (Korpus neu ziehen) ist ein
    26×-Asset → nur bei freiem Slot, nie zwei parallel (Leitprinzip 4). Korrekturen aus der Kampagne
    sind verhaltensändernd → golden-gegated (§6) + Push/Deploy nur auf Davids Ja (§9).

---

## §3 · Gegenprüfungs-Werkzeuge aus dem §14-Intake 3.8.2026 (`QS-GP-BEREICH`, `QS-GP-PRERENDER`)

*Angelegt 3.8.2026 (Bauplan-QS). Beide sind Werkzeuge AM Beweis, nicht am Rechtsinhalt —*
*reine Prüflogik (`Gegenpruefung: n/a`), aber beide müssen ihre Scheiterns-Fähigkeit zeigen (§6.7).*

### §3.1 `QS-GP-BEREICH` — `gegenpruefung:ok --bereich A..B`

- **Ist-Zustand:** `check:gegenpruefung` und `gegenpruefung:ok` sehen nur den **Working Tree**.
  Wer auf einem Branch committet arbeitet, muss den Risiko-Diff darum mit einem **Hand-Hash**
  nach dem `risikoDiffHash`-Schema quittieren — am 3.8.2026 dreimal an einem Tag.
- **Zu bauen:** (a) `gegenpruefung:ok --bereich <A>..<B>` nimmt einen Commit-Bereich entgegen;
  (b) `check:gegenpruefung` prüft zusätzlich `origin/main..HEAD`, nicht nur den Working Tree.
  Das Hash-Schema bleibt unverändert — es wird nur über einen zweiten Eingang gefüttert.
- **Fertig, wenn:** eine committete Risiko-Pfad-Änderung ohne Quittung das Tor **einmal rot**
  zeigt und mit `--bereich`-Quittung grün wird; der Hand-Hash-Weg bleibt als Rückfall bestehen.
- **Dateien:** `scripts/gegenpruefung-ok.ts`, `scripts/check-gegenpruefung.ts`,
  `scripts/gegenpruefung/kern.ts` (`istRisikoPfad()` bleibt der Arbiter).

### §3.2 `QS-GP-PRERENDER` — `check:prerender-golden` als Opt-in-Beweiswerkzeug

- **Anlass:** der stärkste Beweis der Totcode-Gegenprüfung zu PR #418 — Byte-Gleichheit über
  8164 prerenderte Seiten — war Handarbeit und damit nicht wiederholbar.
- **Zu bauen:** ein **nicht** in `npm run gate` verdrahteter Befehl, der zwei Prerender-Läufe
  byte-vergleicht und bei Differenz die betroffenen Dateien **benennt** (nicht nur zählt).
- **Bewusst opt-in:** das Pflicht-Gate soll nicht um einen Voll-Prerender wachsen (§15); der
  Befehl dient dem, der einen Verhaltensneutralitäts-Beweis nach §6 führen muss.
- **Fertig, wenn:** eine absichtlich veränderte Seite **einmal rot** erscheint, ein
  unveränderter Doppel-Lauf grün ist, und der Aufruf in Skill `refactoring` als Beweisweg steht.

### §3.3 `QS-GP-PREPUSH` — Verdikt-Prüfung vor dem Push

*Angelegt 3.8.2026 (Bau-Evaluation).*

- **Anlass:** der CI-Lauf zu PR #422 (3.8.2026) brauchte 11 Minuten, um ein fehlendes
  Gegenprüfungs-Verdikt zu melden — `check:gegenpruefung` hätte dasselbe lokal in Sekunden
  gezeigt, wenn es vor dem Push gelaufen wäre. Die Feedback-Schleife gehört vor den Push,
  nicht in die CI.
- **Zu bauen:** `scripts/git-setup.sh` (npm `prepare`, läuft idempotent in jedem Clone und
  Worktree) verdrahtet zusätzlich einen pre-push-Hook, der `check:gegenpruefung` im
  Bereichs-Modus (`origin/main..HEAD`, §3.1) aufruft und den Push bei Risiko-Diff ohne
  Quittung mit klarem Hinweis stoppt. Netz-frei, bei Nicht-Risiko-Diffs unter einer Sekunde;
  `git push --no-verify` bleibt als bewusster, dokumentierter Ausweg.
- **dep:** `QS-GP-BEREICH` — ohne die Bereichs-Prüfung sieht der Hook committete Arbeit nicht;
  ein Hook, der nur den Working Tree prüft, würde genau den Regelfall (committeter Branch)
  verfehlen, der den Anlass erzeugt hat.
- **Fertig, wenn:** ein Push mit unquittiertem Risiko-Diff **einmal rot** stoppt (§6.7), ein
  quittierter durchgeht, und ein reiner `.md`-Push den Hook ohne spürbare Verzögerung passiert.
- **Risiko-Klasse:** reine Prüflogik ⇒ `Gegenpruefung: n/a`.

### §3.4 `QS-E2E-STABIL` — lokale e2e-/Test-Budgets an gemessene Streuung binden

- **Anlass (Bug-Checks/Bauläufe 3./4.8.2026, je per Nullprobe auf main verortet — F3-sauber):**
  (a) `a11y.e2e.ts › Reader BS-640.100` reisst lokal das 60-s-Budget; interleaved A/B beide
  Arme rot (24.6–>60 s), CI mit 90 s + 2 Retries grün. (b) `scripts/datenhaltung/suche.test.ts`
  Hook-Timeout nur unter Voll-Parallellast (isoliert 43.1–54.7 s bei 60 s Budget, ~10 % Reserve).
  Drei unabhängige Prüf-Agenten verloren je einen Diagnose-Zyklus an dieselben zwei Flakes.
- **Zu bauen (Fünf-Schritte: erst vereinfachen, dann automatisieren):** lokale `schwer`-Budgets
  an die gemessene Streuung binden ODER den BS-640.100-axe-Lauf teilen; `suche.test.ts`-Hook
  entlasten oder Budget begründet anheben. KEINE CI-Änderung (CI ist grün und gedämpft).
- **Fertig, wenn:** fünf parallele Voll-Läufe lokal 0 Timeout-Flakes zeigen und die Budgets
  eine dokumentierte Streuungs-Begründung tragen (Messwerte im Kommentar).
- **Nachträge 4.8.2026 (Landekette W2·10):** (c) `leser-gliederung-a33` lief in CI-Shard 1
  einmal 6,5 min (Slow-file-Warnung); (d) `druck-fundstellen-z2` reisst ihr 30-s-Attach-Budget
  DETERMINISTISCH auf langsamen Runnern — `.lc-leser` steht nicht im Prerender, der OR-Vollrender
  (1686 Artikel, 1,9 MB) braucht schon ungedrosselt 9,1 s, kippt zwischen Drossel 1× und 6×
  (Messreihe im PR-#436-Body); Wurzel-Fix: kleinerer Mess-Erlass ODER kalibriertes Budget nach
  QS-PERF Ziff. 5 — blosses Hochsetzen ohne Messreihe ist dort ausgeschlossen.
- **Dateien:** `playwright.config.ts` / betroffene Specs, `scripts/datenhaltung/suche.test.ts`,
  `e2e/druck-fundstellen-z2.e2e.ts`, `e2e/leser-gliederung-a33.e2e.ts`.

### §3.5 `QS-E2E-SHARD-GEN` — Shard-Zuordnung in die Spec, JSON generieren

- **Anlass (Landekette 4.8.2026):** `e2e/shard-gruppen.json` war die Konflikt-Fläche der
  Nacht — 5 von 6 Nachzieh-Konflikten der seriellen Landung sassen in dieser einen Datei,
  weil jeder PR mit neuer Spec dieselben Gruppen-Listen editiert (und #435 sie parallel
  komplett neu packte). Jede Auflösung war trivial, aber jede kostete eine Runde.
- **Wurzel-Fix:** die Gruppen-Zuordnung wandert als Kopf-Annotation in die Spec-Datei
  selbst (z. B. `// @shard-gruppe: 3`), `shard-gruppen.json` wird daraus GENERIERT —
  damit greift der bestehende `merge=regen`-Treiber (eigene Seite behalten, Generator
  neu laufen) und die Konflikt-Klasse verschwindet; neue Specs ohne Annotation macht
  der Union-Wächter weiterhin rot.
- **Fertig, wenn:** Generator + Treiber-Eintrag stehen, der Union-Wächter unverändert
  scharf ist (einmal rot gezeigt: Spec ohne Annotation), und ein simulierter
  Parallel-Fall (zwei Branches, je neue Spec) konfliktfrei merged.
- **Dateien:** `e2e/*.e2e.ts` (Annotationen), neuer Generator unter `scripts/`,
  `.gitattributes`, `scripts/e2e-shard-gruppen.mjs`.
