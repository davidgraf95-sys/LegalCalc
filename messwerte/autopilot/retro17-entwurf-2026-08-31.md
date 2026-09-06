# retro:17 — ENTWURF vom 2026-08-31 (Vorschlags-Autopilot, Stufe 1)

**Status: ENTWURF. Übernahme nur durch Session-/David-Entscheid.**

Maschinell erzeugt von `.github/workflows/autopilot.yml` (Wochen-Cron) aus
`npm run retro:17`. Der Autopilot merged nichts, ändert `ROADMAP.md` nicht und
vergibt keine `@meta`-Etiketten — er legt nur vor. Wer eine Zeile übernimmt,
vergibt selbst ID und `@meta` und verantwortet sie als eigenen Entscheid.

Diese Datei ist **nicht zum Mergen** gedacht: sie ist die Lesefläche des PR.
Nach dem Abarbeiten wird der PR geschlossen, nicht gelandet.

```
═══════════════════════════════════════════════════════════════════════
retro:17 — ENTWURF eines ROADMAP-Vorschlagsblocks (Stufe 2, QS-SELBSTOPT)
═══════════════════════════════════════════════════════════════════════

Quellen: messwerte/selbstopt-zeitreihe.json (14 Snapshots) · ROADMAP-CHRONIK.md
Letzte Erhebung: 2026-08-29

Dieses Werkzeug SCHLÄGT VOR und entscheidet nichts. Es schreibt keine Datei,
committet nicht und öffnet keinen PR. Wer eine Zeile übernimmt, vergibt selbst
ID und `@meta` (eine erfundene ID kollidiert womöglich mit einer echten und macht check:plan
rot) und verantwortet den Vorschlag als eigenen Entscheid.

10 Vorschlagsblöcke — zum Prüfen, nicht zum Übernehmen:

- [ ] **`gate:check` stabilisieren — häufigstes Rot der Messreihe** *(Anlass: 10 von 55 Läufen rot (18 %); Schwelle 10 % und mindestens 3 rote Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt)* — Erst die Ursachen der roten Läufe auszählen (echter Fund vs. Umgebung vs. Flake), dann entscheiden — ein oft rotes Tor kann das wertvollste sein.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **`gate:lint` stabilisieren — häufigstes Rot der Messreihe** *(Anlass: 6 von 55 Läufen rot (11 %); Schwelle 10 % und mindestens 3 rote Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt)* — Erst die Ursachen der roten Läufe auszählen (echter Fund vs. Umgebung vs. Flake), dann entscheiden — ein oft rotes Tor kann das wertvollste sein.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **40 Tore auf Wirksamkeit prüfen — nie rot über die ganze Messreihe** *(Anlass: über 14 Snapshots je 0 rot; Schwelle 30 Läufe. check:artikel-revisionen (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:besetzung (62 Läufe; die Chronik nennt check:besetzung 2×) · check:bezuege (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:bilder (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:bs-entscheide (62 Läufe; die Chronik nennt check:bs-entscheide 3×) · check:datenhaltung (62 Läufe; die Chronik nennt check:datenhaltung 2×) · check:design-tokens (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:dispatch-klausel (62 Läufe; die Chronik nennt check:dispatch-klausel 2×) · check:dossiers (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:entscheide (62 Läufe; die Chronik nennt check:entscheide 9×) · check:farbwelt (62 Läufe; die Chronik nennt check:farbwelt 1×) · check:golden-normtext (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:grundart (62 Läufe; die Chronik nennt check:grundart 2×) · check:historie (62 Läufe; die Chronik nennt check:historie 2×) · check:invarianten (62 Läufe; die Chronik nennt check:invarianten 2×) · check:linien-kanon (62 Läufe; die Chronik nennt check:linien-kanon 5×) · check:materialien (62 Läufe; die Chronik nennt check:materialien 1×) · check:normkeys (62 Läufe; die Chronik nennt check:normkeys 2×) · check:normtext (62 Läufe; die Chronik nennt check:normtext 3×) · check:p-klassen (62 Läufe; die Chronik nennt check:p-klassen 2×) · check:paritaet (62 Läufe; die Chronik nennt check:paritaet 3×) · check:pdf (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:pdf-quellen (62 Läufe; die Chronik nennt check:pdf-quellen 1×) · check:plan (62 Läufe; die Chronik nennt check:plan 12×) · check:revisionen (62 Läufe; die Chronik nennt check:revisionen 1×) · check:seo-index (62 Läufe; die Chronik nennt check:seo-index 3×) · check:smoke (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:struktur-konsistenz (62 Läufe; die Chronik nennt check:struktur-konsistenz 3×) · check:sweep (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:tabellen (62 Läufe; die Chronik nennt check:tabellen 4×) · check:tor-paritaet (62 Läufe; die Chronik nennt check:tor-paritaet 1×) · check:ui-normzitate (62 Läufe; die Chronik nennt check:ui-normzitate 1×) · check:verfall (62 Läufe; die Chronik nennt check:verfall 4×) · check:verfall-ui (62 Läufe; die Chronik nennt check:verfall-ui 2×) · check:verklebung (62 Läufe; die Chronik nennt check:verklebung 2×) · check:vollstaendigkeit (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:zaehler (62 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · check:zyklen (62 Läufe; die Chronik nennt check:zyklen 1×) · gate:golden:vergleich (73 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt) · gate:tsc -b (73 Läufe; in der Chronik bisher nicht als Bau-Gegenstand belegt))* — PRÜFkandidaten, kein Streich-Auftrag (Chesterton): «nie rot» belegt genauso gut, dass das Tor wirkt — der Fehler wird nicht mehr gebaut, WEIL es da ist. Vor jeder Streichung die Sabotage-Probe: Defekt einpflanzen, prüfen ob es rot wird, byte-gleich zurückbauen. Wird es rot, ist es wirksam und bleibt. Je Tor einzeln entscheiden, nie als Paket.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **CI-Ausfallquote senken — Ursachen der roten Läufe auszählen** *(Anlass: Failure-Rate 30 % über 44 Läufe MIT Verdikt (von 47 abgeschlossenen; Schwelle 20 %); Aufschlüsselung: cancelled 3, failure 13, success 31)* — Abgebrochene Läufe (`cancelled`/`skipped`) sind hier weder Zähler noch Nenner — sie hatten nie Gelegenheit zu prüfen. `timed_out` und Konsorten zählen als Ausfall. Vor jeder Zuschreibung an ein Feature: Nullprobe und Streuung (Dispatch-§0 Ziff. 3).
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **Fehlerklasse F2g eskalieren — Gegenmittel greift nicht** *(Anlass: datierte Vorfälle 0 → 1 zwischen dem ersten (2026-08-07) und dem letzten Snapshot (2026-08-29); Quelle: Spalte «Was passierte» des Registers im Skill `lehren` — Reparaturdaten zählen dort nicht mit)* — Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **Fehlerklasse F2h eskalieren — Gegenmittel greift nicht** *(Anlass: datierte Vorfälle 0 → 1 zwischen dem ersten (2026-08-07) und dem letzten Snapshot (2026-08-29); Quelle: Spalte «Was passierte» des Registers im Skill `lehren` — Reparaturdaten zählen dort nicht mit)* — Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **Fehlerklasse F5 eskalieren — Gegenmittel greift nicht** *(Anlass: datierte Vorfälle 0 → 1 zwischen dem ersten (2026-08-07) und dem letzten Snapshot (2026-08-29); Quelle: Spalte «Was passierte» des Registers im Skill `lehren` — Reparaturdaten zählen dort nicht mit)* — Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **Fehlerklasse F7 eskalieren — Gegenmittel greift nicht** *(Anlass: datierte Vorfälle 0 → 1 zwischen dem ersten (2026-08-07) und dem letzten Snapshot (2026-08-29); Quelle: Spalte «Was passierte» des Registers im Skill `lehren` — Reparaturdaten zählen dort nicht mit)* — Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **Fehlerklasse F8 eskalieren — Gegenmittel greift nicht** *(Anlass: datierte Vorfälle 0 → 1 zwischen dem ersten (2026-08-07) und dem letzten Snapshot (2026-08-29); Quelle: Spalte «Was passierte» des Registers im Skill `lehren` — Reparaturdaten zählen dort nicht mit)* — Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

- [ ] **Fehlerklasse F9 eskalieren — Gegenmittel greift nicht** *(Anlass: datierte Vorfälle 0 → 2 zwischen dem ersten (2026-08-07) und dem letzten Snapshot (2026-08-29); Quelle: Spalte «Was passierte» des Registers im Skill `lehren` — Reparaturdaten zählen dort nicht mit)* — Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.
  <!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->

Gesetzte Schwellen (keine Messwerte): Rot-Häufung ab 10 % und 3 roten Läufen · «nie rot» ab 30 Läufen und 5 Snapshots · CI-Failure ab 20 % · CI-Rerun ab 15 %.
```
