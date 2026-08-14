---
name: bauschritt
description: Verwenden für einen Lagebild-Bau-Prompt oder einen einzelnen Roadmap-Schritt — Trigger «Baue den LexMetrik-ROADMAP-Schritt …», «bau das», «nimm den nächsten Schritt», Bau-Auftrag aus plan-bild.html. Kodifiziert Einstieg → Bau → Prüfung → Landung → Weiterbau → Abschluss (inkl. leichter Pfad für Nicht-Risiko-Fix-Batches) sowie, via aufraeumen.md, das Steuer-Doku-Aufräumen («räum die Roadmap auf», «Ceiling gerissen», «struktur-rotieren.py --check rot», «ROADMAP zu gross», «Chronik-Überführung», «Fahrplan archivieren», «Steuer-Doku verschlanken»); Nachfolger von aufraeumen (QS-SKILL-DIAET 8.8.2026).
---

# Bauschritt — Standard-Lebenszyklus einer Bau-Session

**Dünne Klammer, keine Kopien:** entscheidet nur *was wann* dran ist, nicht
*wie* (§5 — kein Fachinhalt an zwei Stellen). **Eine Bau-Einheit = ein
Schritt:** angefangen, geprüft, gelandet, Status geschlossen; Neues
unterwegs → in den Plan (Station B), nicht in die Session. Nach Landung
baut eine tragfähige Session automatisch weiter (Station W), bis nichts
Sinnvolles mehr ansteht oder der Kontext zur Neige geht. Davids einziger
Input ist der Bau-Prompt — alles Übrige läuft ohne Rückfrage nach diesem
Zyklus.

## Pfadwahl: Normalpfad oder leichter Pfad

**Leichter Pfad** (David 8.8.2026): sortenreine Nicht-Risiko-Fix-Batches
(z. B. `W2·17`/`W2·18`-Checklisten, kein Risikopfad, keine neue
Architektur). Nur Prozedur-Prosa verschlankt — **Tore identisch** (Station C,
Skill `landung`, §14.7, §18 unverändert).

- **Einstieg:** `plan:next` (Kollisionen), STOPP-Regel Station A Ziff. 2
  unverändert, dann `plan:set … status=wip` + `check:plan`, wip-Commit
  pushen, Branch `feat/<slug>` — Grössen-Prosa/Spec-Slice entfallen
  (Checklisten-Zeile ist die Spec).
- **Abschluss:** Status schliessen (Station D), **eine Karten-Zeile** statt
  voller Karte, `struktur-rotieren.py --check`, `plan:bild`, Bau-Flächen
  abräumen, kurzer Klartext-Schluss; §17 nur bei tatsächlicher Lehre.
  Entfällt: volle Session-Karte, Memory-Durchsicht, langer Schlusssatz.

Alles andere — inkl. jede Risikopfad-Berührung — Normalpfad (Stationen A–E).

---

## Station A — Einstieg (vor jeder Zeile Code)

1. **`plan:next`** zuerst, Lage-Block **lesen**: stale `wip`/fremde
   Bau-Plätze = Kollisionsmeldung → melden, dann entscheiden, nie parallel
   in dieselbe Fläche bauen.
2. **ID gegen `ready-now`.** Nicht darin (Abhängigkeit offen, `done`,
   blockiert) ⇒ **STOPP, melden, nicht bauen** — massgeblich ist
   `plan:next`, nicht der Prompt.
3. **Grössen-Check** (Massstab hochkalibriert, David 15.8.2026 — Referenz
   ist die orchestrierte Session, die mehrere M-Schritte landet):
   `groesse:` im @meta lesen; weicht die eigene Einschätzung ab, gilt sie,
   per `plan:set` korrigiert.
   - **S/M:** von Beginn an so viele bündelbare `ready-now`-Nachbarn
     (gleiche Fläche/Risikoklasse, kollisionsfrei) einplanen, dass die
     Session gefüllt ist — je eigener Commit/Trailer; Station W führt fort.
   - **Zu gross (L mit echtem Serialisierungs-/Risiko-Zwang):** **STOPP**,
     erst per `plan:set`/ROADMAP schneiden (AP-6-Muster) — Grösse allein
     ist seit 15.8. kein Schneide-Grund mehr.
   - **Harte Grenze:** nie Risikoklassen mischen, nie fremde Flächen dazu.
4. **Bau-Spec:** `npm run fahrplan -- <fahrplan-datei> <§>` — Slice statt
   Volltext.
5. **Sichtbar werden** (F6): `plan:set -- <id> status=wip && check:plan`,
   committen, **pushen** — sonst unsichtbares Kollisionsrisiko.
6. **Branch `feat/<slug-der-id>`**, sofort pushen; Worktree nach
   `worktree:`-Feld im `@meta` (§12, Skill `landung`).

## Station B — Bau

- Nach **Bau-Prompt + Fahrplan-Spec**, nicht nach Erinnerung.
- **Delegation:** Klassen/Stufen/Dispatch-Vorlage → Skill `auftrag` Ziff. 6;
  diese Session orchestriert und landet.
- **WIP-Commit nach jedem Teilschritt** (F5) — nie über längere Arbeit
  uncommittet bleiben.
- **Nebenfunde in den Plan**, nie in diese Session oder als Chip:
  Checklisten-Zeile im Dach-Schritt, sonst ROADMAP-Schritt (Skill `auftrag`
  Ziff. 3), weiterbauen.

## Station C — Prüfung

- Genannte **Tore nackt fahren** (kein `--silent`, keine Filter, volle
  Ausgabe lesen); Abschluss `npm run gate`.
- **Rot-Beweise (§6.7) nur mit sauberem Index:** erst eigene neue Dateien
  committen, DANN Wegwerf-Probe-Commit anlegen/verwerfen — `git reset
  --hard` danach verschluckt sonst untracked Neu-Dateien und uncommittete
  Nachbar-Änderungen (Beleg: 8.8.2026, QS-AUDIT-VERWEISE).
- **Risiko-Pfad** (`istRisikoPfad`, `scripts/gegenpruefung/kern.ts`) im
  Diff ⇒ Skill **`gegenpruefung`** Pflicht, Merge gesperrt bis Verdikt.
- Verhaltensändernd ⇒ golden byte-gleich (§6, Skill `refactoring`).

## Station D — Landung

Skill **`landung`** Schritt für Schritt (§12 + §9: Tore vor Merge,
Bug-Check, serielle Landung, CI-Grün, Nachkontrolle). Schlusspunkt:
**Status schliessen** (`plan:set <id> status=done`/`ready`/`parked`,
`check:plan`, committen, pushen).

## Station W — Weiterbau (David 8.8.2026)

Gelandet + Session tragfähig ⇒ **nicht abschliessen**, weiterbauen:

- **(a)** nächste offene Position derselben Dach-Checkliste;
- **(b)** sonst oberster `ready`-Schritt **gleicher Risikoklasse**, selber
  Wirkungsbereich (`plan:next` + Kollisionsprüfung);
- **(c)** nichts Sinnvolles mehr ⇒ Abschluss (Station E).

Je Weiterbau: voller Zyklus im Kleinen (`status=wip`, volle Sorgfalt,
eigener Commit mit eigenem Roadmap-Trailer).
**NIE sortenrein-widrig auf Risikopfade wechseln**; Schluss **spätestens
bevor der Kontext zur Neige geht** — lieber sauber landen als anreissen.

## Station E — Abschluss (Checkliste, keine Kür)

- [ ] **Session-Karte `STRUKTUR.md`** — was gebaut, belegt, offen
      (leichter Pfad: eine Zeile).
- [ ] `struktur-rotieren.py --check` — bei Rot: Steuer-Doku aufräumen nach
      **[aufraeumen.md](aufraeumen.md)**.
- [ ] `npm run plan:bild` — Dock-Datei aktuell.
- [ ] **Bau-Flächen abräumen:** Worktree, Feature-Branch (lokal + remote),
      `git worktree prune`, Scratch-Dateien.
- [ ] **§17-Lehren-Check:** Lehre aufgekommen? Verankert nach Formregel
      Skill `lehren` (Tor > Dispatch-§0 > Skill > Prosa) — nur im Chat
      gilt als nicht gezogen.
- [ ] **Memory-Hygiene:** Erledigtes löschen, Überholtes korrigieren —
      Repo-Inhalt nicht ins Memory.
- [ ] **Schlusssatz an David** — Klartext: was live ist, «nichts wartet
      auf dich» oder genau *was* und warum nur er entscheidet.

---

## Token-Regeln (in jeder Station)

- **Slices statt Dateien:** `fahrplan -- <datei> <§>`, `plan:next` —
  ROADMAP/STRUKTUR nie am Stück gelesen.
- **Nichts doppelt lesen:** Unteragenten-Bericht ist das Ergebnis.
- **Mechanik nach unten delegieren** (Verschieben/Formatieren/Umbenennen/
  Sweeps auf günstigere Stufe, Skill `auftrag` Klassen-Palette).
- **Doku-Pushes bündeln** — Ausnahme: `wip`-Push aus Station A, sofort.
- **Antworten kurz:** kein Nacherzählen von Tool-Ausgaben.
</content>
