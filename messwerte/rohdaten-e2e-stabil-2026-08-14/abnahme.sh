#!/bin/bash
# Abnahme-Lauf nach Spec-Bedingung: voller e2e-Lauf + EIN gleichzeitiger
# `npm run build` (nicht die Endlos-Schleife der Diagnose — die uebersaettigt).
# Der Build wird zeitgleich mit dem e2e-Lauf gestartet; seine Wandzeit wird
# mitprotokolliert, damit der Ueberdeckungsgrad nachvollziehbar ist.
set -u
LABEL="$1"; shift
N="$1"; shift
OUT=/private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/mess
mkdir -p "$OUT"
cd /Users/david/Developer/lexmetrik-effizienz
export E2E_PORT=4783
for i in $(seq 1 "$N"); do
  ( B0=$(python3 -c "import time;print(int(time.time()*1000))")
    npx vite build --outDir /private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/last-dist --emptyOutDir > /dev/null 2>&1
    B1=$(python3 -c "import time;print(int(time.time()*1000))")
    echo "      build_wand_ms=$((B1-B0))" ) &
  BPID=$!
  L0=$(uptime | sed "s/.*averages*: //")
  T0=$(python3 -c "import time;print(int(time.time()*1000))")
  PLAYWRIGHT_JSON_OUTPUT_NAME="$OUT/$LABEL-$i.json" npx playwright test --reporter=json > "$OUT/$LABEL-$i.log" 2>&1
  RC=$?
  T1=$(python3 -c "import time;print(int(time.time()*1000))")
  wait $BPID 2>/dev/null
  L1=$(uptime | sed "s/.*averages*: //")
  echo "$LABEL lauf=$i exit=$RC wand_ms=$((T1-T0)) last_vor=[$L0] last_nach=[$L1]"
  sleep 10
done
