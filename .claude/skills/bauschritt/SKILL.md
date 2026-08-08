---
name: bauschritt
description: Verwenden, wenn ein Lagebild-Bau-Prompt eingefügt wird oder ein einzelner Roadmap-Schritt gebaut werden soll — Trigger «Baue den LexMetrik-ROADMAP-Schritt …», «bau das», «nimm den nächsten Schritt», ein eingefügter Bau-Auftrag aus plan-bild.html. Kodifiziert den kompletten Session-Zyklus Einstieg → Bau → Prüfung → Landung → Weiterbau → Abschluss (inkl. leichtem Pfad für sortenreine Nicht-Risiko-Fix-Batches) sowie — als Referenzdatei aufraeumen.md — das Aufräumen der Steuer-Doku («räum die Roadmap auf», «Ceiling gerissen», «struktur-rotieren.py --check rot», «Chronik-Überführung», «Fahrplan archivieren»); der frühere Skill aufraeumen ist hier aufgegangen (QS-SKILL-DIAET 8.8.2026).
---

# Bauschritt — der Standard-Lebenszyklus einer Bau-Session

**Grundsatz: dünne Klammer, keine Kopien.** Dieser Skill entscheidet nur, *was
wann* dran ist; *wie* es geht, steht im jeweiligen Instrument, und nur dort
(§5 — kein Fachinhalt an zwei Stellen). Wer hier eine Anleitung vermisst, hat
den Verweis noch nicht geöffnet — er gehört nicht hierher kopiert.

**Eine Bau-Einheit = ein Schritt:** angefangen, geprüft, gelandet, Status
geschlossen. Kommt unterwegs etwas Neues auf: in den Plan, nicht in diese
Session (Station B). Nach einer Landung baut eine tragfähige Session
automatisch weiter (Station W) — abgeschlossen wird erst, wenn nichts
Sinnvolles mehr ansteht oder der Kontext zur Neige geht.

Davids einziger Input ist der Bau-Prompt. Alles Übrige — Einstieg, Prüfung,
Landung, Weiterbau, Aufräumen, Schlusssatz — läuft ohne Rückfrage nach diesem
Zyklus.

## Pfadwahl: Normalpfad oder leichter Pfad

**Leichter Pfad (Entscheid David 8.8.2026, Entstückelung):** für **sortenreine
Nicht-Risiko-Fix-Batches** — typisch das checklisten-weise Abarbeiten eines
Dach-Schritts (`W2·17`, `W2·18`), kein Risikopfad im Diff, keine neue
Architektur. Verschlankt wird **nur Prozedur-Prosa**; die **Tore laufen in
beiden Pfaden identisch** (Station C und Skill `landung` gelten unverändert,
ebenso §14.7 und §18).

- **Kurzer Einstieg:** `npm run plan:next` lesen (Kollisionen!), `plan:set …
  status=wip` + `check:plan`, wip-Commit pushen, Branch `feat/<slug>` — fertig
  (Grössen-Prosa und Spec-Slice entfallen: die Checklisten-Zeile ist die Spec).
- **Kurzer Abschluss:** Status schliessen (Station D Schluss), **eine
  Karten-Zeile** in `STRUKTUR.md` statt voller Session-Karte, `npm run
  plan:bild`, Bau-Flächen abräumen. §17 bleibt bedingt: ist eine Lehre
  aufgekommen, wird sie verankert; sonst entfällt der Posten. Die übrigen
  Station-E-Posten entfallen.

Alles andere — inkl. jeder Bau mit Risikopfad-Berührung — fährt den Normalpfad
(Stationen A–E).

---

## Station A — Einstieg (vor jeder Zeile Code)

1. **`npm run plan:next`** — Pflicht, immer als erstes. Den Lage-Block
   **lesen**, nicht überfliegen: Warnungen zu stale `wip`-Schritten oder
   fremden Bau-Plätzen sind Kollisionsmeldungen. Bei Treffer **erst melden**
   (an David, kurz), dann entscheiden — nie parallel in dieselbe Fläche bauen.
2. **Schritt-ID gegen `ready-now` prüfen.** Steht die ID aus dem Prompt nicht
   unter den baubaren Schritten (Abhängigkeit offen, bereits `done`, blockiert):
   **STOPP, melden, nicht bauen.** Der Prompt ist eine Momentaufnahme, `plan:next`
   ist der Ist-Stand.
3. **Grössen-Check** (die Session-Fixkosten — Startlektüre, `plan:next`,
   Spec-Slice — müssen sich lohnen): Ausgangspunkt ist die `Grösse:`-Angabe im
   Bau-Prompt bzw. das `groesse:`-Feld im `@meta` (S/M/L, geschätzt); weicht
   die eigene Einschätzung ab, gilt die eigene — dann die Schätzung im Plan per
   `plan:set` korrigieren (Beobachtung zurückschreiben, damit die nächste
   Session die bessere Zahl sieht).
   - **Zu klein** (reine Doku, Einzeiler, geschätzt < ~1 h Bau): die
     `ready-now`-Liste auf **1–2 bündelbare Nachbarn** prüfen — gleiche Fläche
     bzw. gleicher Fahrplan, **gleiche Risikoklasse**, laut Lanes kollisionsfrei
     — und mitbauen (je eigener Commit mit eigenem Trailer; Bündelungsregel
     Skill `auftrag`).
   - **Zu gross** für eine Session: **STOPP.** Erst per `plan:set`/ROADMAP in
     sessionfüllende Teilschritte schneiden (AP-6-Muster), dann bauen.
   - **Harte Grenze:** nie Risikoklassen mischen, nie fremde Flächen dazunehmen.
4. **Bau-Spec holen:** `npm run fahrplan -- <fahrplan-datei> <§>`. Der gezielte
   Slice ersetzt die Datei-Lektüre — Fahrpläne werden nie ganz gelesen.
5. **Sichtbar werden, bevor gebaut wird** (F6): `npm run plan:set -- <id>
   status=wip && npm run check:plan`, committen und **pushen**. Ein Bau, den
   parallele Sessions nicht sehen, ist ein Kollisionsrisiko.
6. **Branch `feat/<slug-der-id>`** (ID kleingeschrieben, z. B. `QS-TOK-T14` →
   `feat/qs-tok-t14`), sofort nach Anlage pushen. Worktree ja/nein richtet sich
   nach dem `worktree:`-Feld im `@meta`-Block des Schritts (§12, Skill `landung`).

## Station B — Bau

- Gebaut wird nach **Bau-Prompt + Fahrplan-Spec**, nicht nach Erinnerung.
- **Delegation:** Klassen-Zuordnung, Stufen-Palette und Dispatch-Vorlage stehen
  im Skill `auftrag` (Ziff. 6). Diese Session orchestriert und landet.
- **WIP-Commit nach jedem abgeschlossenen Teilschritt** (F5) — nie über längere
  Arbeit hinweg uncommittet bleiben.
- **Nebenfunde gehen in den Plan**, nicht in diese Session und nicht in Chips:
  Kleinbefund als Checklisten-Zeile in den passenden Dach-Schritt, sonst
  ROADMAP-Schritt vorschlagen oder anlegen (Skill `auftrag`, Ziff. 3),
  weiterbauen.

## Station C — Prüfung

- Die im Bau-Prompt und in der Spec genannten **Tore nackt fahren** (kein
  `--silent`, keine Filter, volle Ausgabe lesen); Abschluss `npm run gate`.
- Berührt der Diff einen **Risiko-Pfad** (`istRisikoPfad`,
  `scripts/gegenpruefung/kern.ts`): Skill **`gegenpruefung`** ist **Pflicht**,
  der Merge bleibt gesperrt, bis ein Verdikt vorliegt.
- Verhaltensändernd? Golden byte-gleich belegen (§6, Skill `refactoring`).

## Station D — Landung

Skill **`landung`** Schritt für Schritt — er trägt die komplette Merge- UND
Deploy-Disziplin (§12 + §9: Tore vor dem Merge, Bug-Check, serielle Landung,
CI-Grün, Nachkontrolle) samt dem Schlusspunkt, der die Session nie offen
verlässt: **Status schliessen** (`plan:set <id> status=done` bzw.
`ready`/`parked`, `check:plan`, committen, pushen).

## Station W — Weiterbau (Entscheid David 8.8.2026)

«Automatisch weiterarbeiten, ohne dass ich es sagen muss»: Ist der Schritt
gelandet und die Session noch tragfähig, **NICHT abschliessen**, sondern direkt
weiterbauen. Reihenfolge:

- **(a)** nächste offene Position derselben Dach-Checkliste;
- **(b)** sonst oberster `ready`-Schritt **gleicher Risikoklasse** im selben
  Wirkungsbereich (`npm run plan:next` + Kollisionsprüfung gegen fremde
  wip/Worktrees);
- **(c)** nichts Sinnvolles mehr ⇒ regulär abschliessen (Station E).

Je Weiterbau gilt der volle Zyklus im Kleinen: `status=wip` setzen, volle
Sorgfalt (Tore, ggf. Gegenprüfung), eigener Commit mit eigenem
Roadmap-Trailer. **NIE sortenrein-widrig auf Risikopfade wechseln**, und
Schluss **spätestens bevor der Kontext zur Neige geht** — lieber sauber landen
als einen Schritt anreissen.

## Station E — Abschluss (Checkliste, keine Kür)

- [ ] **Session-Karte in `STRUKTUR.md`** — kurz: was gebaut, was belegt, was
      offen (im leichten Pfad: eine Karten-Zeile).
- [ ] `python3 .claude/hooks/struktur-rotieren.py --check` — bei Rot die
      Steuer-Doku aufräumen: Prozedur in **[aufraeumen.md](aufraeumen.md)**
      (Chronik-Überführung, Streich-Massstab, Fahrplan-Archivierung).
- [ ] `npm run plan:bild` — Davids Dock-Datei auf frischem Stand.
- [ ] **Bau-Flächen abräumen:** Worktree entfernen, Feature-Branch löschen
      (lokal + remote), `git worktree prune`, Scratch-Dateien weg.
- [ ] **§17-Lehren-Check:** Ist im Bau eine Lehre aufgekommen? Dann ist sie
      nach der Formregel des Skills `lehren` verankert (Tor > Dispatch-§0 >
      Skill > Prosa). Eine Lehre, die nur im Chat steht, gilt als nicht gezogen.
- [ ] **Memory-Hygiene:** Erledigtes löschen, Überholtes korrigieren — was das
      Repo trägt, gehört nicht ins Memory.
- [ ] **Schlusssatz an David** — Klartext, kein Statusbericht: was jetzt live
      ist, und entweder «nichts wartet auf dich» oder genau, *was* auf ihn
      wartet und warum nur er es entscheiden kann.

---

## Token-Regeln (gelten in jeder Station)

- **Slices statt Dateien.** `npm run fahrplan -- <datei> <§>` und `plan:next`
  liefern das Nötige; ROADMAP.md und STRUKTUR.md werden nicht am Stück gelesen.
- **Nichts doppelt lesen.** Was ein Unteragent schon gelesen hat, wird nicht in
  der Hauptsession nachgelesen — sein Bericht ist das Ergebnis.
- **Mechanik nach unten delegieren.** Verschieben, Formatieren, Umbenennen,
  Sweeps gehen auf die günstigere Stufe (Skill `auftrag`, Klassen-Palette).
- **Doku-Pushes bündeln.** Status-, Karten- und Plan-Änderungen sammeln und in
  einem Commit landen — Ausnahme: der `wip`-Push aus Station A, der muss sofort.
- **Antworten kurz.** Kein Nacherzählen von Tool-Ausgaben; Ergebnis, Beleg, Rest.
