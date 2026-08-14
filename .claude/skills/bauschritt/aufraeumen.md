# Roadmap/Struktur aufräumen (Referenzdatei des Skills `bauschritt`)

**Laden, wenn** die Steuer-Doku aufgeräumt werden soll — «räum die Roadmap
auf», «Ceiling gerissen», `struktur-rotieren.py --check` rot, «ROADMAP zu
gross», «Chronik-Überführung», «Fahrplan archivieren» — oder wenn der
Re-Akkumulations-Wächter ein Steuerdokument über Budget meldet. Ziel:
`ROADMAP.md` bleibt schlank, Erledigtes zieht wörtlich um (Vorbild
`793e9aee3`, 3.8.2026: 117.4→97.7 KB).

**Leitplanke:** diese Datei trägt die Prozedur, keine Zahlen (Ceilings,
Ist-Werte) — nur `struktur-rotieren.py` misst sie; ein Zahlen-Zweitstand
würde beim nächsten Ceiling-Wechsel unbemerkt veralten (§5-Fehlerklasse).

## 1 · Ist-Messung

```
python3 .claude/hooks/struktur-rotieren.py --check
```

Einzige Messquelle — Exit 1 nennt Steuerdokument + Überschreitung. Ceilings
liegen im Skript-Kopf (`BUDGET`-Dict), nicht hier (Endprüfungs-Fund 6/12/31:
zwei Wahrheiten über denselben Wert). Vor jeder Session einmal sehen, sonst
unklar, ob etwas zu tun ist.

## 2 · Erledigtes wörtlich nach `ROADMAP-CHRONIK.md`

**Geltende Fassung** (ROADMAP Ziff. 6, seit 3.8.2026): ein `done`-Schritt
wandert **vollständig** — Checkbox, `@meta`, Prosa — nach
`ROADMAP-CHRONIK.md`; in `ROADMAP.md` bleibt **nichts** stehen (ältere
Teil-Fassung ist in der Chronik als «abgelöst» archiviert, gilt nicht
mehr). Ausnahme (22.7.2026): **datierte ✅-Teilerfolgs-Prosa aus einem noch
OFFENEN Schritt** wandert ebenfalls wörtlich in die Chronik, im Plan bleibt
ein ✅-Einzeiler + Pointer.

**Ablageort** (`793e9aee3`): neuer datierter Block ans **Dateiende**, z. B.
`# Umschichtung <Datum> — erledigte Schritte aus dem Steuerungsplan`; je
Schritt `## <ID> — <Titel> *(<Status>, verschoben <Datum>)*` + Original-
Wortlaut samt `@meta`. Nicht am Kopf einsortieren — wächst seit 10.7.2026
nur am Ende.

**Nie zusammenfassen** — ~40 % Retrieval-Verlust; die Chronik ist Archiv,
kein Extrakt.

**`@meta` LEBENDER Schritte ist unantastbar.** Nur das `@meta` eines
tatsächlich wandernden Schrittes (`done` bzw. ✅-Teilerfolg oben) wird
verschoben; `@meta` eines offenen Schrittes (Status, `dep`, `blocker`,
`fahrplan:` — steuert `check:plan`/`plan:next`/Queue) wird nie verändert
oder gelöscht, auch nicht formatierend.

**Zwingender Zweitschritt: `scripts/plan/inventar.ts`.** Mit dem `@meta`
verschwindet die ID auch aus der Inventar-Liste — sonst `check:plan`
Regel 1 rot („kein @meta"). Entfernte ID zusätzlich als Kommentarzeile im
Kopf von `inventar.ts` dokumentieren (Vorbild: bestehende Aufräum-Blöcke) —
sonst ist Schritt 2 nicht abgeschlossen, auch wenn `ROADMAP.md` schon
schlank aussieht.

## 3 · Streich-Massstab

Vor jeder Streichung (echtes Entfernen, keine Verschiebung): **«Steuert der
Schritt noch etwas?»** Ein Posten ohne `dep`-/`@queue`-/Blocker-Referenz
mehr, dessen Anlass entfallen ist (Richtungsentscheid, Doppel-Eintrag,
abgelöster Mechanismus), fällt.

Jede Streichung bekommt in `ROADMAP-CHRONIK.md` eine **Begründungszeile**
(Vorbild «Streichungen 3.8.2026»):

```
- **`<ID>`** — gestrichen <Datum>: <ein Satz Begründung, warum der Anlass
  entfallen ist oder wer den Posten abgelöst hat>.
```

Ohne diese Zeile verschwindet ein Posten stillschweigend — der Verlust, den
§11 (Erforschtes Wissen wird geordnet abgelegt) verhindern soll.

**Für CODE gilt derselbe Massstab in beweisbarer Form (Auftrag David
14.8.2026, Chat sinngemäss «was keine Fehlfunktion auslöst, kann weg» —
präzisiert, weil unbeobachtet ≠ unbenutzt):** Eine Zeile/Datei darf weg,
wenn der NACHWEIS des Nichttragens vor der Löschung steht — (a) keine
eingehenden Verweise (Sweep-Guards oben, `git ls-files`-Bestand), (b) alle
Tore grün UND golden byte-gleich nach dem Entfernen, (c) bei Rechtslogik
zusätzlich §1-Blick: trägt die Stelle einen ungetesteten Rechtsfall, fällt
sie NICHT («keine beobachtete Fehlfunktion» ist dort kein Beweis — Tests
decken nie alle Fälle). Beweis vor Löschung, nie löschen-und-schauen.

## 4 · Fahrplan-Archivierung — verify-then-archive

`check:plan` koppelt zwei Regeln: **Regel 7** — jede `FAHRPLAN-*.md` unter
`fahrplaene/` muss aus `ROADMAP.md` verlinkt sein (Basename-Vergleich),
sonst rot; **Regel 9** umgekehrt — jeder `fahrplan:`-Zeiger im `@meta` muss
auf eine existierende Datei zeigen. Reihenfolge, sonst `check:plan` rot:

1. **Verify.** `grep -rn <Basename> ROADMAP.md fahrplaene/ bibliothek/ docs/ *.md`
   — kein lebender Zeiger/Referenz mehr? Nur dann weiter. Treffer ausserhalb
   der Steuer-Doku (z. B. `bibliothek/`) auf `archiv/…` umschreiben,
   `check:bibliothek` lokal grün VOR dem Push — Doku-Pushes laufen an der
   CI vorbei, ein toter Link macht main sonst rot (Beleg: 7.8.2026,
   `2a890c50d`/`57ebeca56`). **Nicht** gegen `ROADMAP-CHRONIK.md` grepen:
   erledigte Schritte landen dort samt Zeiger (Schritt 2) — kein lebender
   Treffer; Regel 7/9 lesen die Chronik nicht.
2. **Archive.** `git mv fahrplaene/FAHRPLAN-X.md archiv/` — danach greift
   Regel 7 nicht mehr (scannt nur `fahrplaene/`), ein toter Zeiger fiele
   sofort unter Regel 9 auf.

Ein Fahrplan mit lebendem Verweis wird i. d. R. NICHT archiviert, selbst
bei `done`. **Ausnahme** (`W3·10`, 31.7.2026): Regel 9 prüft nur Existenz
des `fahrplan:`-Pfads, nicht den Ort — bleibt ein Schritt aktiv trotz
archiviertem Fahrplan, alternativ den Zeiger auf `archiv/…` umschreiben
(statt nicht zu archivieren), dann sichtbar markieren, dass Restpunkte noch
in einen aktiven Fahrplan zu extrahieren sind, sonst verwaist die
Steuerung.

### 4b · Fahrplan-§-Diät (lebende Fahrpläne, BAUPLAN-UMBAU 15.8.2026)

Fahrpläne sind lebendige Specs (Skill-Hauptdatei, Station B) — und sie sind
mit ~16 000 Zeilen der grösste Doku-Posten im Repo. Darum gilt für **lebende**
Fahrpläne dieselbe Umzugslogik wie für die ROADMAP: **erledigte §§ wandern
wörtlich** nach `archiv/<FAHRPLAN-NAME>-erledigt.md` (datierter Block ans
Dateiende, nie zusammenfassen). Im Fahrplan bleibt je umgezogenem § **eine
Stub-Zeile** `## §N — <Titel> ✅ (erledigt <Datum>, Wortlaut: archiv/…)` —
der §-Anker bleibt bestehen, damit `check:plan` Regel 11 (Spec-Bindung) und
bestehende §-Verweise weiter auflösen. Anlass ist die Rotation oder der
Abschluss eines Schrittes, keine eigene Pflicht-Runde.

## 5 · Tor-Reihenfolge

**Abweichung von der Spec** (§7, offengelegt): `FAHRPLAN-TOKEN-OEKONOMIE.md`
§11.2 nennt `check:struktur-konsistenz`/`struktur:aktuell` als Tor-Schritte;
ersteres prüft Snapshot↔Sidecar der **Normtext-Korpora** (sachfremd),
letzteres ist reines Lag-Audit ohne Budget-Logik und kann nicht scheitern
(§6.7-Verstoss) — beide darum raus. Massgeblich ist die real im
Präzedenz-Commit `793e9aee3` gefahrene, belegte Kette:

1. `npm run check:plan`
2. `python3 .claude/hooks/struktur-rotieren.py --check`
3. Plan-Tests (`vitest` auf `src/tests/plan-*.test.ts` + `fahrplanSlice`)

`npm run struktur:aktuell` bleibt sinnvoll als **informatives** Lag-Audit
danach (kein Gate) — zeigt Session-Karten-Nachzugsbedarf.

**Bündelungsgrund:** Chronik-Überführung, Streichung, Fahrplan-Archivierung
in **einem** Commit — Regel 9/7 sind mechanisch gekoppelt, kein Tor liest
die Chronik. Ein Zwischenstand (verschoben, Zeiger nicht nachgezogen, oder
umgekehrt) wäre unter Regel 9 bzw. 7 rot.

## Verwaisungs-Sweep — vier Guards (Lehren 14.8.2026, QS-EFFIZIENZ)

Wer nach toten Dateien sucht (Totcode, Halden-Kandidaten), nimmt diese vier
Regeln in den Sweep-Auftrag — jede hat an diesem Tag einen Fehlalarm oder
Beinahe-Fehler erzeugt:

1. **Nur `git ls-files`-Bestand ist Kandidat.** Untracked/gitignorierte
   Dateien sind Davids Lokalbestand, keine Repo-Halden (Beinahe-Fall:
   COWORK.md, aktiv in Gebrauch, wäre «archiviert» worden).
2. **Backlink-Suche ohne Verzeichnis-Ausschluss** — auch `archiv/` zählt;
   Treffer dort werden als «nur historisch» ausgewiesen, nicht verschwiegen
   (Fall: zwei «0-Backlink»-Kandidaten hatten Archiv-Verweise).
3. **`*.test.ts` ist nie verwaist** (Vitest-Autodiscovery braucht keinen
   Namensverweis) und **Dateien mit dokumentierter `vite-node <pfad>`-CLI im
   Kopf sind Werkzeuge**, keine Waisen — beides vorab ausfiltern.
4. **Löschen erst nach unabhängigem Guard im ausführenden Auftrag** (Basisnamen-
   Gegensuche vor jedem `git rm`) — der Sweep ist Verdacht, nicht Urteil.

## Nachbar-Instrumente

- **`lehren`** — deckt die Session ein wiederkehrendes Prozessproblem auf
  (z. B. ein blindes Tor), gehört die Lehre ins Register dort, nicht als
  Prosa hier.
- **`landung`** — nicht mitten in eine fremde, laufende Landekette
  aufräumen; §12-Isolation gilt auch für Steuer-Doku-Arbeit.
- **`auftrag`** Ziff. 1 — der Root-Markdown-Deckel (~20 Dateien) ist eine
  eigene Grenze; neue Root-`.md`-Dateien statt Verschlankung verletzen sie.

## Wann NICHT

- Nicht mid-Kampagne an `CLAUDE.md` — betrifft
  `ROADMAP.md`/`ROADMAP-CHRONIK.md`/`STRUKTUR.md`/`fahrplaene/`, nicht das
  Reglement.
- Nicht in einer Kollisionsfläche mit paralleler Session (drei Sonden,
  §0.5) — trotz `merge=union`-Treiber erzeugt eine grosse Umschichtung
  mitten in fremdem WIP unnötige Konflikte.
- Nicht ohne vorherige Ist-Messung (Schritt 1) — Aufräumen ins Blaue ohne
  Beleg ist Verdacht, keine Ursache (§0.3).
</content>
