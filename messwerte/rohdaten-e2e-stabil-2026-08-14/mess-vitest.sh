#!/bin/bash
# Messreihe suche.test.ts: <label> <n>
set -u
LABEL="$1"; shift
N="$1"; shift
OUT=/private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/mess
mkdir -p "$OUT"
cd /Users/david/Developer/lexmetrik-effizienz
for i in $(seq 1 "$N"); do
  T0=$(python3 -c 'import time;print(int(time.time()*1000))')
  npx vitest run scripts/datenhaltung/suche.test.ts > "$OUT/$LABEL-$i.log" 2>&1
  RC=$?
  T1=$(python3 -c 'import time;print(int(time.time()*1000))')
  # Vitest meldet die Hook-Dauer nicht direkt; die Zeile "Duration" trägt setup/collect/tests/…
  D=$(grep -E "^ *Duration" "$OUT/$LABEL-$i.log" | tail -1)
  echo "$LABEL lauf=$i exit=$RC wand_ms=$((T1-T0)) | $D"
done
