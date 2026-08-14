# Roadmap/Struktur aufräumen (Referenzdatei des Skills `bauschritt`)

**Laden, wenn** die Steuer-Doku aufgeräumt werden soll — «räum die Roadmap
auf», «Ceiling gerissen», `struktur-rotieren.py --check` rot, «ROADMAP zu
gross», «Chronik-Überführung», «Fahrplan archivieren» — oder wenn der
Re-Akkumulations-Wächter ein Steuerdokument über Budget meldet. Ziel:
`ROADMAP.md` bleibt schlanker Session-Einstieg, Erledigtes verschwindet
nicht, sondern zieht wörtlich um (Vorbild: Aufräum-Session `793e9aee3`,
3.8.2026 — 117.4 → 97.7 KB).

**Leitplanke:** diese Datei trägt die Prozedur. Zahlen (Ceilings, Ist-Werte)
stehen NIE hier — nur `.claude/hooks/struktur-rotieren.py` misst sie. Ein
Zahlen-Zweitstand hier würde beim nächsten Ceiling-Wechsel veralten, ohne
dass es auffällt (§5-Fehlerklasse).

## 1 · Ist-Messung

```
python3 .claude/hooks/struktur-rotieren.py --check
```

Einzige Messquelle — Exit 1 nennt Steuerdokument und Budget-Überschreitung.
Ceilings liegen im Skript-Kopf (`BUDGET`-Dict), nicht hier (Endprüfungs-Fund
6/12/31: zwei Wahrheiten über denselben Schwellenwert). Vor jeder
Aufräum-Session einmal sehen (rot oder mit Reserve-Angabe), sonst unklar,
ob überhaupt etwas zu tun ist.

## 2 · Erledigtes wörtlich nach `ROADMAP-CHRONIK.md`

**Geltende Fassung** (ROADMAP Ausführungs-Protokoll Ziff. 6, seit
3.8.2026): ein `done`-Schritt wandert **vollständig** — Checkbox, `@meta`,
Prosa — nach `ROADMAP-CHRONIK.md`; in `ROADMAP.md` bleibt **nichts** von
ihm stehen. (Frühere Fassung — Checkbox+`@meta`+Einzeiler+Pointer bleiben
im Plan — als «abgelöste Fassung» in der Chronik archiviert, nicht wieder
anwenden.) Ausnahme (Konvention 22.7.2026): **datierte ✅-Teilerfolgs-Prosa
aus einem noch OFFENEN Schritt** wandert ebenfalls wörtlich in die Chronik,
im Plan bleibt ein ✅-Einzeiler + Pointer — der Schritt selbst ist ja nicht
`done`.

**Ablageort** (Präzedenz `793e9aee3`): neuer, datierter Block ans
**Dateiende** angehängt, z. B. `# Umschichtung <Datum> — erledigte Schritte
aus dem Steuerungsplan`; je Schritt einzeln als `## <ID> — <Titel>
*(<Status>, verschoben <Datum>)*`, gefolgt vom kompletten Original-Wortlaut
samt `@meta`-Kommentar. Nicht am Kopf in die ursprüngliche Wellen-Ordnung
einsortieren — die Datei wächst seit der ersten Übernahme (10.7.2026) nur
am Ende.

**Nie zusammenfassen.** Zusammenfassen ist ~40 % Retrieval-Verlust — die
Chronik ist ein Archiv, kein Extrakt.

**`@meta`-Etiketten LEBENDER Schritte sind unantastbar.** Nur das `@meta`
eines Schrittes, der tatsächlich in die Chronik wandert (`done` bzw. der
✅-Teilerfolgs-Fall oben), wird verschoben. Jedes `@meta` eines offenen
Schrittes — Status, `dep`, `blocker`, `fahrplan:` — steuert `check:plan`,
`plan:next` und die Queue und wird bei einer Aufräum-Session nie verändert
oder gelöscht, auch nicht formatierend.

**Zwingender Zweitschritt: `scripts/plan/inventar.ts`.** Mit dem `@meta`
aus `ROADMAP.md` verschwindet die ID auch aus der kanonischen
Inventar-Liste — sonst meldet `check:plan` Regel 1 „Inventar-ID … hat kein
@meta". Jede entfernte ID gehört zusätzlich als Kommentarzeile in den
Datei-Kopf von `inventar.ts` (Vorbild: Blöcke „AUFRÄUMUNG 3.8.2026" /
„DIÄT WELLE 2" / „ZIFF-6-VOLLZUG 5.8.2026"), damit nachvollziehbar bleibt,
wohin eine ID verschwunden ist. Ohne diesen Schritt ist Schritt 2 nicht
abgeschlossen, auch wenn `ROADMAP.md` schon schlank aussieht.

## 3 · Streich-Massstab

Vor jeder Streichung (echtes Entfernen, keine Verschiebung): **«Steuert der
Schritt noch etwas?»** Ein Posten, der von keinem `dep`, keiner `@queue`,
keinem Blocker-Register-Eintrag mehr referenziert wird und dessen Anlass
entfallen ist (Richtungsentscheid, Doppel-Eintrag, abgelöster Mechanismus),
fällt.

Jede Streichung bekommt in `ROADMAP-CHRONIK.md` eine **Begründungszeile**,
Format nach Vorbild (Abschnitt «Streichungen 3.8.2026»):

```
- **`<ID>`** — gestrichen <Datum>: <ein Satz Begründung, warum der Anlass
  entfallen ist oder wer den Posten abgelöst hat>.
```

Ohne diese Zeile verschwindet ein Posten stillschweigend — genau der
Verlust, den §11 (Erforschtes Wissen wird geordnet abgelegt) verhindern
soll.

## 4 · Fahrplan-Archivierung — verify-then-archive

`check:plan` Regel 7 verlangt: **jede** `FAHRPLAN-*.md` unter `fahrplaene/`
muss aus `ROADMAP.md` verlinkt sein (Basename-Vergleich), sonst rot. Regel 9
verlangt umgekehrt: jeder `fahrplan:`-Zeiger in einem `@meta` muss auf eine
existierende Datei zeigen.

Reihenfolge, sonst wird QS-PH/`check:plan` rot:

1. **Verify.** `grep -rn <Basename> ROADMAP.md fahrplaene/ bibliothek/ docs/ *.md`
   — kein lebender `fahrplan:`-Zeiger und keine aktive Prosa-Referenz mehr?
   Nur dann weiter. Treffer ausserhalb der Steuer-Doku (z. B. `bibliothek/`)
   beim Archivieren auf den `archiv/…`-Pfad umschreiben, `npm run
   check:bibliothek` lokal grün zeigen, BEVOR der Doku-Commit gepusht wird —
   Doku-Pushes auf main laufen an der CI vorbei, ein toter Link [S7] macht
   sonst main rot und blockiert fremde Landungen (Beleg: 7.8.2026, Rotation
   `2a890c50d`, Heilung `57ebeca56`). **Bewusst NICHT gegen
   `ROADMAP-CHRONIK.md` grepen:** erledigte Schritte wandern samt ihrer
   `@meta`-Zeile (und damit ihrem historischen `fahrplan:`-Zeiger) dorthin
   (Schritt 2) — ein Treffer dort ist ein toter, archivierter Verweis, kein
   lebender. Weder Regel 7 noch Regel 9 lesen die Chronik, ein Treffer dort
   würde jede Archivierung grundlos blockieren.
2. **Archive.** `git mv fahrplaene/FAHRPLAN-X.md archiv/` — danach greift
   Regel 7 gar nicht mehr (sie scannt nur `fahrplaene/`), und ein
   verbliebener toter `fahrplan:`-Zeiger fiele sofort unter Regel 9 auf.

Ein Fahrplan mit weiterhin lebendem Verweis wird in der Regel NICHT
archiviert, auch wenn sein Bau-Schritt `done` ist — die Doku bleibt als
Nachschlagewerk, bis nichts mehr auf sie zeigt. **Deklarierte Ausnahme**
(Präzedenz `W3·10`, 31.7.2026): Regel 9 prüft nur, dass der `fahrplan:`-Pfad
EXISTIERT, nicht dass er unter `fahrplaene/` liegt. Bleibt ein Schritt
aktiv, obwohl sein Fahrplan bereits archiviert gehört, ist die Alternative
zum Blockieren, den `fahrplan:`-Zeiger selbst auf den neuen `archiv/…`-Pfad
umzuschreiben (statt die Archivierung zu unterlassen) — dann aber sofort
sichtbar markieren, dass Restpunkte aus dem archivierten Stand noch in
einen aktiven Fahrplan zu extrahieren sind, sonst verwaist die Steuerung.

## 5 · Tor-Reihenfolge

**Abweichung von der Spec-Formulierung** (§7-Prinzip: empirisch gegen die
Repo-Realität geprüft, abweichend umgesetzt, Abweichung offengelegt):
`FAHRPLAN-TOKEN-OEKONOMIE.md` §11.2 nennt `check:struktur-konsistenz` und
`struktur:aktuell` als Tor-Schritte. Geprüft gegen den Code:
`check:struktur-konsistenz` (`scripts/normtext/check-struktur-konsistenz.ts`)
prüft Snapshot ↔ Struktur-Sidecar der **Normtext-Korpora** — mit
Steuer-Doku-Aufräumen sachlich nicht verwandt. `struktur:aktuell`
(`.claude/hooks/struktur-aktuell.py`) ist ein reines **On-Demand-Lag-Audit**
ohne Budget-Logik (meldet nur, wie weit `STRUKTUR.md` hinter HEAD
zurückliegt) und kann nicht scheitern — ein Tor, das nicht rot werden kann,
ist gefährlicher als keines (§6.7). Massgeblich ist darum die real im
Präzedenz-Commit `793e9aee3` gefahrene, belegte Kette:

1. `npm run check:plan`
2. `python3 .claude/hooks/struktur-rotieren.py --check`
3. Plan-Tests (`vitest` auf `src/tests/plan-*.test.ts` + `fahrplanSlice`)

`npm run struktur:aktuell` bleibt sinnvoll als **informatives** Lag-Audit
danach (kein Gate, kein Blocker) — es zeigt, ob `STRUKTUR.md` seinerseits
Session-Karten-Nachzug braucht.

**Bündelungsgrund** (abgeleitet aus `793e9aee3`, keine wörtliche
Zitierung): Chronik-Überführung, Streichung und Fahrplan-Archivierung
gehören in **einen** Commit, weil `check:plan` Regel 9 (jeder
`fahrplan:`-Zeiger muss existieren) und Regel 7 (jede Datei unter
`fahrplaene/` muss verlinkt sein) mechanisch gekoppelt sind — kein Tor
liest `ROADMAP-CHRONIK.md` selbst. Ein Zwischenstand, in dem eine Datei
schon nach `archiv/` verschoben, aber ihr `fahrplan:`-Zeiger noch nicht
nachgezogen ist (oder umgekehrt), wäre unter Regel 9 bzw. 7 rot.

## Nachbar-Instrumente

- **`lehren`** — wenn die Aufräum-Session ein wiederkehrendes
  Prozessproblem freilegt (z. B. ein Tor, das die Drift nicht sieht),
  gehört die Lehre dort ins Register, nicht als Prosa hier.
- **`landung`** — nicht mitten in eine fremde, laufende Landekette
  aufräumen; §12-Isolation gilt auch für Steuer-Doku-Arbeit im geteilten
  Verzeichnis.
- **`auftrag`** Ziff. 1 — der Root-Markdown-Deckel (~20 Dateien) ist eine
  eigene Grenze; ein Aufräum-Schritt, der neue Root-`.md`-Dateien anlegt
  statt bestehende zu verschlanken, verletzt sie.

## Wann NICHT

- Nicht mid-Kampagne an `CLAUDE.md` — Steuer-Doku-Aufräumen betrifft
  `ROADMAP.md`/`ROADMAP-CHRONIK.md`/`STRUKTUR.md`/`fahrplaene/`, nicht das
  Reglement.
- Nicht in einer Kollisionsfläche, an der parallel eine andere Session
  baut (drei Sonden vor Baubeginn, §0.5) — ROADMAP/STRUKTUR sind
  Append-Register mit `merge=union`-Treiber, aber eine grosse Umschichtung
  mitten in fremdem WIP erzeugt trotzdem unnötige Konflikte.
- Nicht ohne vorherige Ist-Messung (Schritt 1) — ein Aufräumen ins Blaue
  ohne Beleg, dass ein Budget gerissen ist, ist Verdacht, keine Ursache
  (§0.3).
</content>
