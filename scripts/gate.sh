#!/usr/bin/env bash
# scripts/gate.sh — Prüf-Gates: leise bei Grün, volle Ausgabe nur bei Rot.
# Aufruf:  npm run gate          (volle Fünferkette)
#          npm run gate:schnell  (nur tsc · vitest · golden, ~36 s — gemessen
#                                 7.8.2026, 10-Kern: 35.9 s / 35.5 s in zwei Läufen)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

# Zeitzone BEDINGUNGSLOS festnageln (26.7.2026): die Golden-Basis ist in
# Europe/Zurich erzeugt, auf einer UTC-Maschine meldet `golden:vergleich` sonst
# `kuendigung:dj1`/`dj10` falsch-rot (kostete am 20.7. den Auftakt von
# fedlex-frische.yml). Absichtliche TZ-Proben: `TZ=<zone> npm run golden:vergleich`.
export TZ=Europe/Zurich

mode="${1:-voll}"
fail=0

# ─── Tor-Ereignis-Log (Schritt QS-SELBSTOPT, Stufe 1 «erst messen») ──────────
# Jeder Gate-Schritt hinterlässt eine JSONL-Zeile {ts, tor, ok} in
# `.selbstopt-ereignisse.jsonl` (gitignoriert, je Maschine eigen). Ohne diese
# Spur gibt es keine Antwort auf «welches Tor kostet uns wie oft Zeit» — die
# Tor-Läufe waren bisher flüchtig, jeder rote Lauf verschwand mit dem Terminal.
# Ausgewertet wird sie von `npm run selbstopt:erheben`.
#
# DREI EIGENSCHAFTEN, die nicht verhandelbar sind:
#  * Das Logging ist ein NEBENEFFEKT. Es schreibt nichts nach stdout/stderr, es
#    ändert keinen Exit-Code, und es läuft nach der Verdikt-Bildung. Zieht man
#    die Zeile ab, ist gate.sh byte-gleich zu vorher.
#  * Es kann das Gate NICHT rot machen: `|| true` am Ende. Ein volles
#    Dateisystem oder ein schreibgeschützter Baum darf keine Prüfung kosten.
#  * `set -uo pipefail` ist gesetzt, aber kein `-e` — der Schreibfehler bräche
#    also ohnehin nicht ab; das `|| true` sagt es trotzdem ausdrücklich.
# Die Tor-Namen hier sind fest verdrahtete Literale ohne Anführungszeichen —
# es gibt also nichts zu escapen.
EREIGNIS_LOG=".selbstopt-ereignisse.jsonl"
ereignis() {
  printf '{"ts":"%s","tor":"%s","ok":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" "$1" "$2" >> "$EREIGNIS_LOG" 2>/dev/null || true
}

run() {
  local name="$1"; shift
  local log code
  log="$("$@" 2>&1)"; code=$?
  if [ "$code" -eq 0 ]; then
    printf '  ok   %s\n' "$name"
  else
    fail=1
    printf '  ROT  %s (exit %s)\n' "$name" "$code"
    printf '%s\n' "$log"   # volle Ausgabe NUR für das rote Gate
  fi
  # Präfix `gate:` trennt den Gate-SCHRITT vom einzelnen Tor: `npm run check`
  # erscheint hier als `gate:check`, seine 43 Sub-Tore protokolliert
  # check-parallel.ts einzeln unter ihrem eigenen `check:*`-Namen. Ohne den
  # Präfix zählte der Sammelschritt in derselben Namensmenge wie die Tore, die
  # er enthält — und jede Aggregation wäre doppelt.
  if [ "$code" -eq 0 ]; then ereignis "gate:$name" true; else ereignis "gate:$name" false; fi
}

echo "Gates (${mode}):"
run "tsc -b"            npx tsc -b
run "vitest"            npm test
run "golden:vergleich"  npm run golden:vergleich
if [ "$mode" = "voll" ]; then
  run "lint"   npm run lint
  run "check"  npm run check
fi

if [ "$fail" -ne 0 ]; then
  echo "GATE ROT — Ursache im Code beheben. Kein 'npm run golden', Test nicht aufweichen (§6 Ziff. 3)."
  exit 1
fi
echo "GATE GRÜN."
exit 0
