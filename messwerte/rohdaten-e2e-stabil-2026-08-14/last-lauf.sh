#!/bin/bash
# Voll-Lauf unter Parallel-Last: <label> <n>
# Last = dauernd laufender `npm run build` (10-Kern-Maschine, esbuild/rollup +
# Prerender ziehen alle Kerne) parallel zum vollen e2e-Lauf mit 10 Workern.
set -u
LABEL="$1"; shift
N="$1"; shift
OUT=/private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/mess
mkdir -p "$OUT"
cd /Users/david/Developer/lexmetrik-effizienz
export E2E_PORT=4783

for i in $(seq 1 "$N"); do
  # Last-Generator: Build-Schleife in EIGENEM Verzeichnis-Ausgang, damit sie
  # dist/ des laufenden preview-Servers nicht unter den Füssen wegzieht.
  ( while true; do npx vite build --outDir /private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/last-dist --emptyOutDir > /dev/null 2>&1; done ) &
  LASTPID=$!
  T0=$(python3 -c 'import time;print(int(time.time()*1000))')
  PLAYWRIGHT_JSON_OUTPUT_NAME="$OUT/$LABEL-$i.json" npx playwright test --reporter=json > "$OUT/$LABEL-$i.log" 2>&1
  RC=$?
  T1=$(python3 -c 'import time;print(int(time.time()*1000))')
  kill $LASTPID 2>/dev/null
  pkill -P $LASTPID 2>/dev/null
  pkill -f "vite build --outDir /private/tmp" 2>/dev/null
  echo "$LABEL lauf=$i exit=$RC wand_ms=$((T1-T0))"
  sleep 5
done
