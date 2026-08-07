#!/usr/bin/env python3
"""VORSCHLAG — vollstaendiger Ersatz fuer .claude/hooks/dispatch-schutz.py.

    ANWENDUNG (macht David, nicht der Bau-Agent):
        cp scripts/hooks-vorschlag-dispatch-schutz.py .claude/hooks/dispatch-schutz.py

    WARUM ALS VORSCHLAG: `.claude/` ist Bau-TABU (CLAUDE.md, Dispatch-§0) —
    ein Sub-Agent, der seine eigenen Schutz-Hooks umschreibt, hebt die Grenze
    auf, die ihn haelt. Die Datei liegt darum daneben und wartet auf einen
    bewussten Kopiervorgang. Bis dahin bleibt der alte Hook aktiv; er ist
    STRENGER als noetig, nie laxer — er verlangt von Pruef-Auftraegen die
    sechs Punkte, die sie seit 7.8.2026 nicht mehr tragen muessen. Folge ohne
    Kopie: Freitext-Pruef-Dispatches werden weiterhin blockiert und muessen
    den Voll-Block tragen. Kein Loch, nur Reibung.

    AENDERUNG gegenueber dem Stand vom 4.8.2026 (QS-DISPATCH-P0-PRUEF):
    Der §0-Block hat zwei Fassungen. Traegt ein Prompt die Kopfzeile
    «§0 PFLICHT-KLAUSEL (PRÜFUNG» (read-only-Klassen pruefung/recherche),
    verlangt der Hook nur die Punkte 1-3; beim Voll-Marker weiterhin alle
    sechs. Sonst ist nichts veraendert.

    WARUM UEBERHAUPT: Die Punkte 4 (Recovery-COMMIT), 5 (Kollisionssonden vor
    BAUBEGINN) und 6 (kein MERGE im BAU-Auftrag) setzen Schreibrechte voraus.
    Die read-only-Klassen duerfen nicht schreiben — ihr TABU lautet «nichts
    aendern». Punkt 4 widersprach diesem TABU im selben Prompt offen.
    Freigabe David 7.8.2026 (bibliothek/betrieb/entregulierung-2026-08-07.md).

── ab hier der Datei-Kopf des Hooks selbst ──────────────────────────────

PreToolUse-Hook (Task): kein Sub-Agenten-Auftrag ohne §0-Pflichtklausel.

WARUM (Befund adversariale Pruefung PR #315, 20.7.2026):
Die Fehlerklassen F3 (Verteilung statt Einzelwert), F4 (Daten sind kein
Auftrag), F5 (Recovery-Commit) und F6 (Kollisionspruefung) hatten als einzigen
Traeger einen Prosa-Block in `docs/token-oekonomie/dispatch-template.md`.
`check:dispatch-klausel` bewies nur, dass der Text IN DER DOKU steht — nicht,
dass ein tatsaechlich abgesetzter Auftrag ihn traegt. `npm run dispatch` war
ein rein freiwilliger Drucker.

Empirischer Gegenbeweis aus dem Betrieb: der erste Dispatch nach dem Einbau
des Mechanismus (die adversariale Pruefung dieses PR selbst) enthielt KEINEN
§0-Block. Die erste Gelegenheit hat ihn nicht getragen. Ein Appell, den die
naechste Gelegenheit bereits verfehlt, ist kein Mechanismus.

Dieser Hook macht den Block erzwungen statt empfohlen: er liest den Prompt
des Task-Aufrufs und blockiert, wenn die Klausel fehlt. Damit ist der Traeger
nicht mehr die Disziplin des Orchestrators, sondern die Tool-Ebene — dieselbe
Ebene, die schon `gh pr merge` auf Risikopfaden haelt (§9).

BEWUSSTE GRENZE (ehrlich, §8): Der Hook greift nur, wo diese settings.json
gilt — nicht bei Auftraegen aus einer fremden Session, einem anderen Rechner
oder der Web-Oberflaeche. Er schliesst die Klasse nicht vollstaendig, er
verschiebt sie von «niemand prueft» zu «der uebliche Weg prueft».

Exit 2 = Aufruf blockieren, stderr geht als Feedback an Claude.
"""
import json
import re
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

# Das Delegations-Werkzeug heisst je nach Harness "Task" ODER "Agent" (in der
# Umgebung vom 20.7.2026: "Agent"). Ein Matcher auf nur EINEN Namen macht diesen
# Hook zum stillen No-op — genau die Fehlerklasse, die er verhindern soll.
# Befund von Fable bei der Vor-Merge-Pruefung von #316; die Sabotage-Proben des
# PR liefen mit synthetischem stdin und konnten das darum nicht aufdecken.
if data.get("tool_name") not in ("Task", "Agent"):
    sys.exit(0)

ti = data.get("tool_input") or {}
prompt = ti.get("prompt") or ""

# Agent-Typen lex-<klasse> (.claude/agents/, seit 4.8.2026) tragen die
# §0-Klausel IN der generierten Definition — der Prompt muss sie nicht
# wiederholen. Diese Befreiung ist nur sicher, weil check:dispatch-klausel
# Ebene (C) die Byte-Gleichheit der Definitionen mit der Projektion aus
# dispatch-agents.ts beweist (Drift => Tor rot). Freitext-Dispatches ohne
# lex-Typ bleiben voll pruefpflichtig.
if str(ti.get("subagent_type") or "").startswith("lex-"):
    sys.exit(0)

# Kurze, klar begrenzte Auftraege ohne Bau-/Pruefcharakter (z. B. eine reine
# Datei-Suche) sollen nicht am Formalismus scheitern. Die Schwelle ist
# bewusst niedrig: alles, was ernsthaft delegiert wird, liegt darueber.
if len(prompt) < 400:
    sys.exit(0)

MARKER = "§0 PFLICHT-KLAUSEL"

# Kopfzeile der read-only-Fassung (Klassen pruefung/recherche, seit 7.8.2026).
# Sie ist der Umschalter: nur sie senkt das Pflicht-Set auf 1-3. Wer sie
# faelschlich setzt, verliert die Punkte 4-6 — deshalb steht sie in der
# generierten Vorlage und wird nicht von Hand getippt (npm run dispatch).
PRUEF_KOPF = r"^§0 PFLICHT-KLAUSEL \(PRÜFUNG"

# Die Punkte einzeln — ein halb eingefuegter Block ist kein Block.
PUNKTE_123 = [
    (r"^1 DATEN, NICHT AUFTRAG\.", "1 Daten-nicht-Auftrag (F4)"),
    (r"^2 ERST REPRODUZIEREN, DANN FIXEN\.", "2 Reproduzieren-vor-Fix (F2d)"),
    (r"^3 VERTEILUNG STATT EINZELWERT\.", "3 Verteilung-statt-Einzelwert (F3)"),
]
PUNKTE_456 = [
    (r"^4 RECOVERY\.", "4 Recovery-Commit (F5)"),
    (r"^5 KOLLISION\.", "5 Kollisionspruefung (F6)"),
    (r"^6 KEIN MERGE IM BAU-AUFTRAG\.", "6 Kein-Merge-im-Bau-Auftrag (F1)"),
]

if MARKER not in prompt:
    print(
        "BLOCKIERT (§14 Ziff. 6/7): Sub-Agenten-Auftrag ohne §0-Pflichtklausel.\n\n"
        "  Sub-Agenten sehen CLAUDE.md NICHT (verifiziert 20.7.2026). Der §0-Block\n"
        "  ist der einzige Ort, an dem F3 (Verteilung statt Einzelwert), F4 (Daten\n"
        "  sind kein Auftrag), F5 (Recovery-Commit) und F6 (Kollisionspruefung)\n"
        "  einen delegierten Auftrag ueberhaupt erreichen.\n\n"
        "  Weg 1 (bevorzugt): subagent_type auf einen Agent-Typ lex-<klasse>\n"
        "        setzen (bau|daten|pruefung|recherche|mechanisch|synthese) —\n"
        "        die Klausel sitzt dort in der Definition.\n"
        "  Weg 2 (Freitext): npm run dispatch -- <klasse>\n"
        "        Ausgabe woertlich an den Anfang des Task-Prompts, dann erneut.",
        file=sys.stderr,
    )
    sys.exit(2)

# Read-only-Fassung: die Punkte 4-6 setzen Schreibrechte voraus und sind fuer
# pruefung/recherche nicht bloss ueberfluessig, sondern (Punkt 4) dem eigenen
# TABU zuwider. Voll-Marker => weiterhin alle sechs.
ist_pruefung = re.search(PRUEF_KOPF, prompt, re.MULTILINE) is not None
punkte = PUNKTE_123 if ist_pruefung else PUNKTE_123 + PUNKTE_456
fassung = "Pruef-Fassung (read-only)" if ist_pruefung else "Voll-Fassung"

fehlend = [name for muster, name in punkte
           if not re.search(muster, prompt, re.MULTILINE)]

if fehlend:
    print(
        f"BLOCKIERT (§14 Ziff. 6/7): §0-Block ({fassung}) ist unvollstaendig — "
        f"{len(fehlend)} Pflichtpunkt(e) fehlen:\n"
        + "\n".join(f"    - {n}" for n in fehlend)
        + "\n\n  Der Block geht WOERTLICH und UNVERAENDERT in den Auftrag.\n"
          "  Frisch erzeugen:  npm run dispatch -- <klasse>",
        file=sys.stderr,
    )
    sys.exit(2)

sys.exit(0)
