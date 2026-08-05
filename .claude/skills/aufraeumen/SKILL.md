---
name: aufraeumen
description: Verwenden, wenn Roadmap/Struktur aufgeräumt werden sollen — Trigger «räum die Roadmap auf», «Ceiling gerissen», «struktur-rotieren.py --check rot», «ROADMAP zu gross», «Chronik-Überführung», «Fahrplan archivieren», «Steuer-Doku verschlanken» — oder wenn `npm run struktur:aktuell` bzw. der Re-Akkumulations-Wächter ein Steuerdokument über Budget meldet.
---

# Roadmap/Struktur aufräumen

Playbook der Aufräum-Session vom 3.8.2026 (`793e9aee3`, «Roadmap-Verschlankung:
24 erledigte Schritte in die Chronik, 6 Streichungen, 2 Fahrpläne archiviert
— 117.4 → 97.7 KB»). Ziel: `ROADMAP.md` bleibt schlanker Session-Einstieg,
Erledigtes verschwindet nicht, sondern zieht wörtlich um.

**Leitplanke:** dieser Skill trägt die Prozedur. Zahlen (Ceilings, Ist-Werte)
stehen NIE hier — nur `.claude/hooks/struktur-rotieren.py` misst sie. Ein
Zahlen-Zweitstand hier würde beim nächsten Ceiling-Wechsel veralten, ohne dass
es auffällt (§5-Fehlerklasse).

## 1 · Ist-Messung

```
python3 .claude/hooks/struktur-rotieren.py --check
```

Das ist die **einzige** Messquelle — Exit 1 nennt, welches Steuerdokument
(`STRUKTUR.md` und/oder `ROADMAP.md`) sein Budget reisst und um wie viel.
Ceilings selbst liegen im Skript-Kopf (`BUDGET`-Dict) samt Begründung; sie
hier zu wiederholen war Endprüfungs-Fund 6/12/31 — zwei Wahrheiten über
denselben Schwellenwert. Vor jeder Aufräum-Session diesen Befund einmal
sehen (rot oder mit Reserve-Angabe), sonst ist unklar, ob überhaupt etwas zu
tun ist.

## 2 · Erledigtes wörtlich nach `ROADMAP-CHRONIK.md`

Jeder `[x]`-Schritt (und jede datierte ✅-Teilerfolgs-Prosa aus einem noch
offenen Schritt, Konvention 22.7.2026) wandert **byte-genau** in
`ROADMAP-CHRONIK.md`, angehängt in Wellen-Ordnung unter
`<!-- CHRONIK-EINTRAEGE -->`. In `ROADMAP.md` bleibt nur: Checkbox +
`@meta`-Etikett + Einzeiler + Pointer (`**Chronik:** ROADMAP-CHRONIK.md →
<ID>`).

**Nie zusammenfassen.** Zusammenfassen ist ~40 % Retrieval-Verlust — die
Chronik ist ein Archiv, kein Extrakt. Formatvorbild: die bestehenden
Einträge in `ROADMAP-CHRONIK.md` (`## <ID> — <Titel> *(<Etikett>, done)*`,
danach der vollständige Original-Wortlaut inkl. Datum, PR-Nummern, Tor-Belegen).

`@meta`-Etiketten selbst sind **unantastbar** — sie steuern `check:plan`,
`plan:next` und die Queue; beim Umschichten wird nur die Prosa verschoben,
nie das Etikett verändert oder gelöscht.

## 3 · Streich-Massstab

Vor jeder Streichung (nicht Verschiebung — echtes Entfernen eines Postens):
**«Steuert der Schritt noch etwas?»** Ein Posten, der von keinem `dep`, keiner
`@queue`, keinem Blocker-Register-Eintrag mehr referenziert wird und dessen
Anlass entfallen ist (Richtungsentscheid, Doppel-Eintrag, abgelöster
Mechanismus), fällt.

Jede Streichung bekommt in `ROADMAP-CHRONIK.md` eine **Begründungszeile**,
Format nach Vorbild (Abschnitt «Streichungen 3.8.2026»):

```
- **`<ID>`** — gestrichen <Datum>: <ein Satz Begründung, warum der Anlass
  entfallen ist oder wer den Posten abgelöst hat>.
```

Ohne diese Zeile verschwindet ein Posten stillschweigend — genau der Verlust,
den §11 (Erforschtes Wissen wird geordnet abgelegt) verhindern soll.

## 4 · Fahrplan-Archivierung — verify-then-archive

`check:plan` Regel 7 verlangt: **jede** `FAHRPLAN-*.md` unter `fahrplaene/`
muss aus `ROADMAP.md` verlinkt sein (Basename-Vergleich), sonst rot. Regel 9
verlangt umgekehrt: jeder `fahrplan:`-Zeiger in einem `@meta` muss auf eine
existierende Datei zeigen.

Reihenfolge, sonst wird QS-PH/`check:plan` rot:

1. **Verify.** `grep -rn <Basename> ROADMAP.md ROADMAP-CHRONIK.md` — kein
   lebender `fahrplan:`-Zeiger und keine aktive Prosa-Referenz mehr? Nur dann
   weiter.
2. **Archive.** `git mv fahrplaene/FAHRPLAN-X.md archiv/` — danach greift
   Regel 7 gar nicht mehr (sie scannt nur `fahrplaene/`), und ein
   verbliebener toter `fahrplan:`-Zeiger fiele sofort unter Regel 9 auf.

Ein Fahrplan mit weiterhin lebendem Verweis wird NICHT archiviert, auch wenn
sein Bau-Schritt `done` ist — die Doku bleibt als Nachschlagewerk, bis nichts
mehr auf sie zeigt.

## 5 · Tor-Reihenfolge

Strikt in dieser Reihenfolge, jedes grün bevor das nächste läuft:

1. `npm run check:plan`
2. `npm run check:struktur-konsistenz`
3. `npm run struktur:aktuell`
4. Plan-Tests (`vitest` auf `plan-*` + `fahrplanSlice`)

Ein Zwischenstand nach Schritt 2 der Chronik-Überführung (Roadmap schlank,
Chronik noch nicht committet, oder umgekehrt) ist per Konstruktion rot —
darum Chronik-Überführung, Streichung und Archivierung in **einem** Commit
bündeln (Vorbild `793e9aee3`), nicht über mehrere Zwischenstände strecken.

## Nachbar-Skills

- **`lehren`** — wenn die Aufräum-Session ein wiederkehrendes Prozessproblem
  freilegt (z. B. ein Tor, das die Drift nicht sieht), gehört die Lehre dort
  ins Register, nicht als Prosa hier.
- **`landung`** — nicht mitten in eine fremde, laufende Landekette aufräumen;
  §12-Isolation gilt auch für Steuer-Doku-Arbeit im geteilten Verzeichnis.
- **`auftrag`** Ziff. 1 — der Root-Markdown-Deckel (~20 Dateien) ist eine
  eigene Grenze; ein Aufräum-Schritt, der neue Root-`.md`-Dateien anlegt statt
  bestehende zu verschlanken, verletzt sie.

## Wann NICHT

- Nicht mid-Kampagne an `CLAUDE.md` — Steuer-Doku-Aufräumen betrifft
  `ROADMAP.md`/`ROADMAP-CHRONIK.md`/`STRUKTUR.md`/`fahrplaene/`, nicht das
  Reglement.
- Nicht in einer Kollisionsfläche, an der parallel eine andere Session baut
  (drei Sonden vor Baubeginn, §0.5) — ROADMAP/STRUKTUR sind Append-Register
  mit `merge=union`-Treiber, aber eine grosse Umschichtung mitten in
  fremdem WIP erzeugt trotzdem unnötige Konflikte.
- Nicht ohne vorherige Ist-Messung (Schritt 1) — ein Aufräumen ins Blaue ohne
  Beleg, dass ein Budget gerissen ist, ist Verdacht, keine Ursache (§0.3).
