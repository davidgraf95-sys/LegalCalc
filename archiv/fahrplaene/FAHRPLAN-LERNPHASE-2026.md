# ARCHIV — ausgelagerte Abschnitte aus `fahrplaene/FAHRPLAN-LERNPHASE-2026.md`

**Herkunft.** Plan-Neuschnitt 29.8.2026 (Auftrag David): je Fahrplan bleiben AKTIV nur der
Kopf und die §§, auf die ein OFFENER ROADMAP-Schritt zeigt. Alles Übrige steht hier —
**wörtlich, ungekürzt, nicht nachgeführt**. Wer einen dieser Abschnitte wieder braucht,
zieht ihn von hier zurück in die aktive Datei, statt ihn neu zu schreiben.

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

## §3 · Gegenprüfungs- und Verifikations-Werkzeuge (§14-Intake 3.8.2026 + Nachbefunde, §3.1–§3.7)

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
- **Nachtrag Nacht-Landekette 4./5.8.2026 (Dringlichkeit steigt):** (d) traf DREIMAL in einer
  Nacht — Shard 2/8 rot auf PR #456 (Doku-Diff = eigene Nullprobe, Runner 16m33s statt ~9m,
  zusätzlich `leser-ruecksprung-r5-r7` R7-Overlay-Überhang 4375 ms gegen 1500er-Budget unter
  CPU-Drossel), erneut auf PR #449 (chf-Formatter-Diff) und auf PR #454 (Turso-Sync-Diff) —
  die Reader-Druckstrecke war in allen drei Diffs unberührt. Alle per Rerun/Neubasierung
  grün; Kosten je Vorfall ~1 Batterie-Zyklus (~18 min).
- **Nachtrag 5.8.2026 (QS-TOK-Rest-Session, §17-Nebenfund, NICHT gefixt — nur dokumentiert):**
  (e) `e2e/leser-kopf-a9.e2e.ts:63` fällt lokal unter Parallel-Last **reproduzierbar** —
  Nullprobe auf `HEAD~1` (unveränderter main-Stand, drei Wiederholungen) 3/3 rot, dieselbe
  Baseline zusätzlich 1× `leser-linien-eid3`. Defekt **vorbestehend auf main**, keine
  Regression; CI verdeckt ihn per `workers=1` + Retries. Vermutete Wurzel: dieselbe
  Zeitbudget-Klasse wie (a)–(d) — das 400-ms-Fenster der Scroll-Spy-Kopfzeile rennt gegen
  den 30-s-Attach-Timeout des Containers unter 6×-Drossel.
  Ebenfalls lastfragil (5.8.2026, T14-Bau): scripts/datenhaltung/suche.test.ts —
  beforeAll-Timeout 60 s, isoliert 30,4 s (nur Faktor-2-Luft); unter Parallel-Last
  (Builds + e2e) reisst es reproduzierbar. Gleiche Fehlerklasse, gleicher Fix-Ort.
- **Dateien:** `playwright.config.ts` / betroffene Specs, `scripts/datenhaltung/suche.test.ts`,
  `e2e/druck-fundstellen-z2.e2e.ts`, `e2e/leser-gliederung-a33.e2e.ts`,
  `e2e/leser-ruecksprung-r5-r7.e2e.ts`, `e2e/leser-kopf-a9.e2e.ts`.

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

### §3.6 `QS-GP-NACHBEFUNDE` — Nebenbefunde der Gegenprüfungs-Nächte 4./5. und 8.8.2026 (vier Härtungen)

Drei nicht-blockierende Befunde aus den adversarialen Prüfungen der QS-CODE-Landekette
(PRs #447/#448, Verdikte im Gegenprüfungs-Register 2026-08-04), gebündelt als eine
Bau-Einheit — gleiche Risiko-Klasse (Prüf-/Klassifikations-Härtung), keine Vermischung:

1. **fedlex-Fläche in `istRisikoPfad()` aufnehmen** *(Prüfung #447, Befund 2 — Bestand aus
   main, nicht PR-verursacht)*: `src/lib/fedlex.ts` war NIE Risiko-klassiert, und seit dem
   #444-Split gilt dasselbe für `src/lib/fedlex/` — die Fedlex-Extraktionsschicht läuft ohne
   Gegenprüfungs-Tor, während `scripts/fedlex-*` längst klassiert ist. Fix: beide Pfade in
   `scripts/gegenpruefung/kern.ts` aufnehmen, Test analog zum `zustaendigkeit/`-Zweig
   (Rot-Beweis: heutiges `false` je Pfad festhalten, §6.7). BEWUSSTE FOLGE: künftige
   fedlex-Edits brauchen ein Verdikt — das ist der Zweck, nicht ein Nebeneffekt.
2. **`leakErkannt` bekommt einen Pipeline-Konsumenten** *(Prüfung #448, Befund 1, niedrig)*:
   der Anonymisierungs-Leak-Flag des Besetzungs-Parsers wird ausserhalb der Tests nirgends
   ausgewertet (`scripts/normtext/entscheide-schreiben.ts` liest nur `res.richter`).
   Fix: Leak-Fälle beim Schreiben zählen und im `check:besetzung`-Bericht ausweisen.
3. **`trenneInterneTitel` darf `PARTEI_RE` nicht unterlaufen** *(Prüfung #448, Befund 2,
   niedrig-mittel; empirische Probe: «A.________, vertreten durch Rechtsanwalt Dr. Jürg
   Krumm» → Teilsegment «Dr. Jürg Krumm» passiert den Partei-Filter)*: Segment verwerfen,
   wenn schon das URSPRUNGS-Segment vor der Titel-Trennung `PARTEI_RE` trifft.
   Regressionstest mit genau dieser Probe.

4. **`check-merge-schutz.ts` Diff-Härtung** *(Nachbefund der QS-GP-BEREICH-Gegenprüfung
   8.8.2026, Befund B4)*: der Risiko-Diff wird ohne `-z`/`--no-renames` erhoben — ein
   Nicht-ASCII-Risiko-Pfad käme C-quoted an, `behalten()` träfe nie ⇒ latentes
   CI-Falsch-Grün (heute alle Risiko-Pfade ASCII; das lokale Bereichs-Tor aus PR #466
   nutzt `-z` und ist strenger). Rename risk→nonrisk divergiert analog. Fix: Diff-Erhebung
   auf `-z --no-renames` umstellen (Muster `risikoDiffHash`), Rot-Beweis mit einem
   Test-Pfad mit Umlaut (§6.7).

- **Risikopfad** (kern.ts-Klassifizierer ist Prüflogik, Punkte 2–3 berühren
  `src/lib/rechtsprechung/besetzung/` = Risiko) ⇒ Gegenprüfung für Punkte 2–3.
- **Fertig, wenn:** je Punkt Rot-Beweis/Regressionstest vorhanden, `check:besetzung` und
  Gegenprüfungs-Suite grün, Verdikt im Register.

---

### §3.7 — fusioniert in §3.1 (`QS-GP-BEREICH`), 8.8.2026

Der hier am 7.8.2026 kurzzeitig angelegte Schritt `QS-GP-COMMITDIFF` war ein
unbeabsichtigtes Duplikat von §3.1 `QS-GP-BEREICH` (gleiche Fläche
`gegenpruefung-ok.ts`/`kern.ts`/Tor, gleiches Ziel: committete Branch-Diffs
quittier- und prüfbar machen) — zusammengeführt statt daneben (Skill `auftrag`
Ziff. 3). Sein Beitrag bleibt als 2. Anlass in §3.1 erhalten: Vorfall
W2·10-UI-NAV-V vom 7.8.2026 — vierte Hand-Hash-Quittung (Register-Zeile
2026-08-07, dort noch mit dem alten Schritt-Namen), und eine falsche
«kein Risikopfad»-Bau-Aussage blieb lokal unbemerkt, weil das Tor nach dem
Commit nicht mehr scheitern kann (§6.7). Zusätzliche Bau-Anforderung aus dem
Vorfall an §3.1: Rot-Beweis ausdrücklich für den Fall «clean tree, Risiko-Diff
nur committet» führen.

---

## §4 · ROADMAP-Spec-Nachzug der §3-Kind-Schritte (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Querschnitt-Band, §14-Intake 3.8./4.8.2026 — AP-11 rückwirkend angewandt
(ROADMAP-Diät Welle 3, 4.8.2026). In der ROADMAP bleiben je Schritt Checkbox, Titel, `@meta`, der
**Anlass** (dort ausdrücklich verlangt) und der Pointer auf den jeweiligen §; die **Bau-Spec** steht
unten und in den §§3.1–3.5. Steuert nicht — Spec-Heimat.*

### §4.1 `QS-GP-BEREICH` — Bau-Spec im Wortlaut *(→ Bau-Spec: §3.1 dieser Datei)*

> Bereichs-Argument + Commit-Bereich-Diff, damit der Regelfall wieder mechanisch quittierbar ist. Tor-Code ohne Inhaltsänderung; **Scheiterns-Fähigkeit einmal rot zeigen** (§6.7).

### §4.2 `QS-GP-PRERENDER` — Bau-Spec im Wortlaut *(→ Bau-Spec: §3.2 dieser Datei)*

> ein **nicht** im Pflicht-Gate verdrahteter Befehl, der zwei Prerender-Läufe byte-vergleicht und die Differenz benennt; wer ihn ruft, bekommt denselben Beweis reproduzierbar.

### §4.3 `QS-GP-PREPUSH` — Bau-Spec im Wortlaut *(→ Bau-Spec: §3.3 dieser Datei)*

> `scripts/git-setup.sh` (npm `prepare`) verdrahtet einen pre-push-Hook, der bei Risiko-Diff in `origin/main..HEAD` ohne Quittung den Push mit Hinweis stoppt; `--no-verify` bleibt als bewusster Ausweg. Braucht die Bereichs-Prüfung aus `QS-GP-BEREICH`. Reine Prüflogik; **Scheiterns-Fähigkeit einmal rot zeigen** (§6.7).

### §4.4 `QS-E2E-STABIL` — Bau-Spec im Wortlaut *(→ Bau-Spec: §3.4 dieser Datei)*

> Budgets streuungs-begründet setzen bzw. Lauf teilen; keine CI-Änderung. **Mitnahme 4.8.2026 (Split-Welle):** drei weitere unabhängige Belege desselben Musters an EINEM Abend — `scripts/datenhaltung/suche.test.ts` (beforeAll 60 s) riss unter Parallellast bei drei Agenten, isoliert je grün in 17–34 s; Zeitbudget statt Arbeitsbudget ist die Wurzel (§17).

### §4.5 `QS-E2E-SHARD-GEN` — Bau-Spec im Wortlaut *(→ Bau-Spec: §3.5 dieser Datei)*

> Gruppen-Annotation im Spec-Kopf, JSON generiert ⇒ `merge=regen`-Treiber greift, Konflikt-Klasse entfällt; Union-Wächter bleibt scharf.
