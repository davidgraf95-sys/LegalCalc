# /sandbox prüfen — Recherche-Befund 14.8.2026

**Erstellt:** 14.8.2026 (QS-HOOKS-AUSBAU Punkt 4, lex-recherche/lex-synthese).

**Anlass:** QS-HOOKS-AUSBAU, Punkt 4 («/sandbox prüfen» — Folge-Lücke aus dem
State-of-the-Art-Abgleich vom 7.8.2026, siehe
[state-of-the-art-abgleich-2026-08-07.md](state-of-the-art-abgleich-2026-08-07.md)).
Frage: soll LexMetrik das Claude-Code-Bash-Sandboxing aktivieren?

## Quelle mit Stand

- Amtliche Doku: https://code.claude.com/docs/en/sandboxing — Abruf 14.8.2026.
- Lokal verifiziert (Umgebungs-Eigenheit, kein Repo-Zustand): `/usr/bin/sandbox-exec`
  vorhanden, macOS 26.5.2, Claude Code 2.1.220.
- Abnahme-Status dieses Dossiers: **einfach belegt** (eine Quelle, ein Abrufdatum,
  kein zweiter unabhängiger Durchgang).

## Regel (deterministisch: was die Sandbox tut, wenn sie an ist)

1. **Existenz:** Bash-Sandboxing ist produktiv nutzbar. Auf macOS über das
   eingebaute Seatbelt (`sandbox-exec`) — nichts zu installieren. Aktivierung
   entweder dauerhaft über `"sandbox": {"enabled": true}` in `settings.json`
   oder interaktiv per `/sandbox` (schreibt nach `settings.local.json`).
2. **Zwei Schichten**, unabhängig konfigurierbar:
   - *Filesystem*: `allowWrite` / `denyRead` / `allowRead`.
   - *Network*: `allowedDomains`, `strictAllowlist`.
   Dazu eine dritte Schicht **Credentials-Abschirmung** (Datei- und
   Umgebungsvariablen-Deny), plus die Schalter `failIfUnavailable` (Sandbox
   Pflicht oder optional) und `allowUnsandboxedCommands` (Escape-Liste).
3. **Verhältnis zu `permissions.allow`** — komplementär, nicht redundant:
   Permissions entscheiden **OB** ein Tool überhaupt läuft; die Sandbox
   entscheidet **WAS** ein bereits laufender Bash-Befehl (samt Kindprozessen)
   anfassen darf. `Read`/`Edit`/`Write` und MCP-Tools laufen **nicht** durch
   die Sandbox — sie greift ausschliesslich bei Bash. Geschützte Pfade (u. a.
   `.claude/hooks`) bleiben vom Schreibzugriff ausgeschlossen, selbst wenn sie
   innerhalb eines sonst erlaubten Verzeichnisses liegen.
4. **Dokumentierte Fallstricke** (aus derselben Quelle, nicht selbst
   reproduziert — siehe Geltungsbereich unten):
   - Go-CLIs (`gh`, `gcloud`, `terraform`) scheitern teils an der
     TLS-Verifikation unter Seatbelt.
   - `npm install` kann an der Netzwerk-Allowlist scheitern; Escape ist
     `dangerouslyDisableSandbox` je Retry.
   - `docker` ist inkompatibel (Eintrag in `excludedCommands`).
   - `jest` braucht `--no-watchman`.
   - `git merge`/`git checkout` kann mit «unable to unlink old» an
     geschützten Pfaden scheitern.
   - Subagenten erben die Sandbox-Konfiguration der Parent-Session.

## Geltungsbereich und Ausnahmen

- Gilt für **Bash-Ausführung** unter Claude Code (macOS/Seatbelt hier
  bestätigt; Linux/bubblewrap wird von derselben Doku-Seite behandelt, hier
  nicht separat geprüft — LexMetrik-Sessions laufen auf macOS).
- Gilt **nicht** für Read/Edit/Write und MCP-Tool-Aufrufe (§0 der
  Dispatch-Klausel bleibt die Grenze für diese Werkzeuge).
- Die vier Fallstricke sind **Doku-Aussagen**, nicht an diesem Repo
  reproduziert — kein Selbstversuch mit `"sandbox":{"enabled":true}`
  durchgeführt. Wer aktiviert, sollte den `gh`-Fall zuerst gegen die
  Landungs-Kette (Skill `landung`) proben, bevor er sich auf die Doku-Aussage
  verlässt.

## ENTSCHEID (Prozess-Delegation an Claude, Audit-P8 8.8.2026; David-Veto möglich)

**Sandbox JETZT NICHT aktivieren.** Begründung, jede Prämisse einzeln:

a. `gh` ist das tragende Landungs-Werkzeug (Skill `landung`, PR-Merge-Kette).
   Ein TLS-Bruch dort kostet **jede** Landung, nicht nur einen Randfall.
b. Die bereits belegten Vorfallsklassen — F1 (Merge-Vorfälle), F4
   (Fehlberichte), Katastrophen-Reads — sind schon durch bestehende
   PreToolUse-Hooks + `permissions.allow` gedeckt. Die Sandbox hätte
   **keinen davon zusätzlich** verhindert (Hooks greifen vor der Ausführung,
   die Sandbox erst währenddessen — bei diesen Klassen redundant, kein
   Zusatznutzen).
c. Der Zusatznutzen der Sandbox wäre Schutz vor **unbeabsichtigten**
   Schreib-/Netzzugriffen ausserhalb des Repos (eine Klasse, die bislang
   nicht als Vorfall aufgetreten ist). Dafür ist der Preis aus (a) derzeit zu
   hoch — ein funktionierendes Landungs-Werkzeug wiegt schwerer als Schutz
   vor einer noch nicht eingetretenen Vorfallsklasse.

**Wiedervorlage-Bedingung** (eine der beiden reicht):
- die Go-CLI-TLS-Fallstricke sind in der amtlichen Doku als behoben
  vermerkt, **oder**
- ein Vorfall der Klasse «unbeabsichtigter Fremdzugriff» tritt real auf.

Bis dahin bleibt dieser Punkt geschlossen, ohne erneute Prüfung nötig.

## Pflegebedarf

Diese Doku-Seite ändert sich mit jeder Minor-Version von Claude Code. Bei
einer erneuten Prüfung: Abruf-URL und Abrufdatum aktualisieren, Claude-Code-
Version neu vermerken (aktuell 2.1.220) — nicht stillschweigend die alten
Werte stehen lassen.

## Abnahme-Status

**Einfach belegt.** Kein zweiter unabhängiger Durchgang, keine eigene
Reproduktion der vier Fallstricke. Fachliche Abnahme des Entscheids (Punkt 4)
liegt bei David — «Prozess-Delegation» heisst hier: Claude hat entschieden,
David kann per Veto widersprechen, es ist keine automatische Abnahme im
Sinne von §7.
