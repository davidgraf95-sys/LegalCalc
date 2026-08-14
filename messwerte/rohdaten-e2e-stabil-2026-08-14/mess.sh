#!/bin/bash
# Messreihe: <label> <n> <playwright-args...>
# Schreibt je Lauf einen JSON-Report und gibt am Ende die Per-Test-Dauern aus.
set -u
LABEL="$1"; shift
N="$1"; shift
OUT=/private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/mess
mkdir -p "$OUT"
cd /Users/david/Developer/lexmetrik-effizienz
export E2E_PORT=4783
for i in $(seq 1 "$N"); do
  T0=$(python3 -c 'import time;print(int(time.time()*1000))')
  PLAYWRIGHT_JSON_OUTPUT_NAME="$OUT/$LABEL-$i.json" npx playwright test "$@" --reporter=json > "$OUT/$LABEL-$i.log" 2>&1
  RC=$?
  T1=$(python3 -c 'import time;print(int(time.time()*1000))')
  echo "$LABEL lauf=$i exit=$RC wand_ms=$((T1-T0))"
done
