#!/usr/bin/env python3
"""PreToolUse-Hook: MCP-Direktkanäle, die §9/§18 umgehen, hart blocken.

WARUM (Werkzeug-Analyse 14.8.2026, Befund 3): tor-schutz.py hängt an den
Matchern Bash/Read/Task — MCP-Werkzeuge wie deploy_to_vercel erzielen dieselbe
Wirkung ohne Matcher-Treffer. Ein Direkt-Deploy an «Merge nach main IST der
Deploy» (§9) vorbei ist der racende Doppel-Deploy-Pfad, den der Skill landung
ausdrücklich verbietet («Buchstabe = Geist»); Kauf-Funktionen (buy_*) und das
Umstellen des Deployment-Schutzes gehören nie in eine Agenten-Session.

Immer blocken — es gibt KEINEN legitimen Session-Anwendungsfall; der einzige
erlaubte Deploy-Weg bleibt der Git-Auto-Deploy nach Merge (Skill landung, dort
auch die dokumentierte Hand-Ausnahme, die ein Mensch am Dashboard fährt).

Exit 2 = Aufruf blockieren. Kaputtes JSON → Exit 0 (nie fälschlich blocken;
der Matcher in settings.json trifft ohnehin nur die Zielnamen).
"""
import json
import re
import sys

MUSTER = re.compile(
    r"deploy_to_vercel|buy_domain|buy_pro|buy_credits|buy_addon"
    r"|update_project_deployment_protection"
)

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

name = str(data.get("tool_name") or "")
if not MUSTER.search(name):
    sys.exit(0)

print(
    f"BLOCKIERT (§9/§18, Werkzeug-Analyse 14.8.2026): «{name}» ist ein "
    "Direktkanal an der Landungs-Disziplin vorbei. Deploys laufen NUR über "
    "Merge nach main (Skill landung); Käufe und Schutz-Umstellungen macht "
    "nie eine Session. Wenn das wirklich gewollt ist, macht es David von "
    "Hand im Dashboard.",
    file=sys.stderr,
)
sys.exit(2)
