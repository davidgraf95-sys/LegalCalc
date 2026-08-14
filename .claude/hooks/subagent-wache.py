#!/usr/bin/env python3
"""SubagentStop-Hook: §14.7 durchsetzbar machen (QS-HOOKS-AUSBAU, 14.8.2026).

WARUM (F4-Klasse, Register Skill `lehren`): Ein Erfolgsbericht ohne prüfbares
Artefakt (Commit-SHA, PR-Nummer, Tor-Ausgabe mit Exit-Code) gilt als NICHT
erfolgt — bisher stand das nur als Prosa in CLAUDE.md §14.7 und im
Rückgabe-Schema der lex-Agenten. Belegter Anlass: 1× fabrizierter
Erfolgsbericht bei 0 Tool-Calls (F4, 18.–20.7.2026). Dieser Hook verschiebt
die Regel von «der Orchestrator soll prüfen» auf die Tool-Ebene: meldet ein
SCHREIBENDER Sub-Agent Erfolg ohne Artefakt, wird sein Abschluss EINMAL
blockiert und er nachweispflichtig gemacht.

Geltungsbereich (bewusst eng, keine False-Positive-Falle):
  - Nur schreibende Klassen lex-bau / lex-daten / lex-mechanisch /
    lex-synthese. Read-only-Klassen (pruefung, recherche) und generische
    Agenten (Explore, claude, …) liefern Befunde — ihr Bericht IST das
    Artefakt; sie bleiben unberührt.
  - Nur wenn der Bericht ERFOLG behauptet. Fehlschlag-/Blocker-Meldungen
    («blockiert», «nicht reproduzierbar», Befund an David) passieren
    ungehindert — §8: Ehrlichkeit wird nie bestraft.

Loop-Schutz: SubagentStop kennt laut Doku (code.claude.com/docs/en/hooks,
Abruf 14.8.2026) KEIN stop_hook_active — der Hook führt darum selbst Buch
(.subagent-wache-gemahnt, gitignored): je agent_id wird genau EINMAL
blockiert, danach Durchlass. Bremsklotz, kein Zaun.

BEWUSSTE GRENZEN (ehrlich, §8):
  - Greift nur, wo diese settings.json gilt, und nur für lex-*-Dispatches.
  - `agent_type` ist der dokumentierte Feldname (Abruf 14.8.2026); liefert
    eine künftige Version das Feld leer, wird der Hook zum stillen No-op —
    dieselbe Klasse wie Task-vs-Agent beim dispatch-schutz. Gegenmittel:
    src/tests/hooks-wache.test.ts prüft die Blockier-Logik mit Fixtures;
    das Feld selbst kann nur ein Live-Dispatch beweisen.
  - Artefakt-Muster sind Heuristik: ein Agent kann einen SHA erfinden. Der
    Hook erzwingt die FORM des Nachweises; die Orchestrator-Pflicht, gegen
    prüfbare Artefakte zu VERIFIZIEREN (§14.7), bleibt bestehen.

Exit 2 = Abschluss blockieren, stderr geht als Feedback an den Sub-Agenten.
Bei jeder Unsicherheit (kaputtes JSON, fehlende Felder) → Exit 0.
"""
import json
import os
import re
import sys

# Schreibende Klassen: von ihnen verlangt das Rückgabe-Schema Artefakte.
SCHREIBENDE = {"lex-bau", "lex-daten", "lex-mechanisch", "lex-synthese"}

# Erfolg wird behauptet …
ERFOLG = re.compile(
    r"erledigt|fertig(?:gestellt)?|abgeschlossen|umgesetzt|gebaut|"
    r"implementiert|committed|gelandet|erfolgreich|"
    r"alle\s+(?:Tore|Tests?|Checks?)\s+(?:sind\s+)?gr[üu]n|"
    r"\bdone\b|\bcompleted\b",
    re.IGNORECASE,
)

# … aber ein prüfbares Artefakt fehlt. Als Artefakt zählt (§14.7):
#   Commit-SHA · PR-Nummer/-URL · Tor-/Testausgabe mit Exit-Code oder Zählern.
ARTEFAKT = re.compile(
    r"\b[0-9a-f]{7,40}\b"                       # Commit-SHA (kurz oder voll)
    r"|\bPR\s*#?\d+"                            # PR-Nummer
    r"|/pull/\d+"                               # PR-URL
    r"|[Ee]xit(?:[- ]?[Cc]ode)?\s*[:=]?\s*\d"   # «Exit-Code 0», «exit 0»
    r"|\b\d+\s+passed\b"                        # vitest/Playwright-Zähler
    r"|\b\d+\s+Tests?\s+gr[üu]n"                # deutscher Zähler
)

# Ausdrückliche Nicht-Erfolgs-Marker: Blocker/Befund-Berichte nie behelligen.
KEIN_ERFOLG = re.compile(
    r"blockiert|fehlgeschlagen|nicht\s+(?:erfolgt|reproduzierbar|gebaut)|"
    r"abgebrochen|Befund\s+an\s+David|keine\s+Änderung(?:en)?\s+vorgenommen",
    re.IGNORECASE,
)


def merkdatei() -> str:
    repo = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    return os.path.join(repo, ".subagent-wache-gemahnt")


try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

if data.get("hook_event_name") not in (None, "SubagentStop"):
    sys.exit(0)

agent_typ = str(data.get("agent_type") or "")
if agent_typ not in SCHREIBENDE:
    sys.exit(0)

bericht = str(data.get("last_assistant_message") or "")
if not bericht:
    sys.exit(0)

if KEIN_ERFOLG.search(bericht):
    sys.exit(0)
if not ERFOLG.search(bericht):
    sys.exit(0)
if ARTEFAKT.search(bericht):
    sys.exit(0)

# Erfolgsbehauptung ohne Artefakt: genau EINMAL je agent_id blockieren.
agent_id = str(data.get("agent_id") or data.get("session_id") or "")
pfad = merkdatei()
try:
    with open(pfad, encoding="utf-8") as f:
        gemahnt = f.read().split()
except OSError:
    gemahnt = []

if agent_id and agent_id in gemahnt:
    sys.exit(0)  # schon gemahnt — Bremsklotz, kein Zaun

try:  # Merkliste fortschreiben (Kappung gegen unbegrenztes Wachstum)
    with open(pfad, "w", encoding="utf-8") as f:
        f.write("\n".join(([*gemahnt, agent_id] if agent_id else gemahnt)[-200:]) + "\n")
except OSError:
    pass  # ohne Merkliste lieber einmal zu viel mahnen als crashen

print(
    "SUBAGENT-WACHE (§14.7): Dein Bericht behauptet Erfolg, enthält aber KEIN "
    "prüfbares Artefakt. Ein Erfolgsbericht ohne Artefakt gilt als nicht "
    "erfolgt.\n\n"
    "  Ergänze im Abschlussbericht mindestens eines:\n"
    "    - Commit-SHA der eigenen Arbeit (git rev-parse --short HEAD),\n"
    "    - Tor-/Testausgabe mit Exit-Code (z. B. «npm run gate → exit 0»),\n"
    "    - PR-Nummer, falls einer angelegt wurde.\n"
    "  ODER stelle klar, dass nichts gebaut/geändert wurde (dann ist der "
    "Bericht ein Befund, kein Erfolgsbericht).",
    file=sys.stderr,
)
sys.exit(2)
