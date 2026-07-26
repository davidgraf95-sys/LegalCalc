#!/usr/bin/env bash
# scripts/gate.sh — Prüf-Gates: leise bei Grün, volle Ausgabe nur bei Rot.
# Aufruf:  npm run gate          (volle Fünferkette)
#          npm run gate:schnell  (nur tsc · vitest · golden, ~7 s)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

# Zeitzone festnageln (26.7.2026). Die Golden-Basis ist in Europe/Zurich erzeugt,
# und `berechneKuendigungsfrist` liefert lokale Tagesgrenzen — auf einer
# UTC-Maschine meldet `golden:vergleich` darum zwangsläufig `kuendigung:dj1` und
# `kuendigung:dj10` als abweichend, obwohl der Code identisch ist (reproduziert:
# ohne TZ genau dieses Fallpaar, mit TZ «IDENTISCH — 249 Fälle byte-gleich»).
# `ci.yml` setzt TZ je Job aus demselben Grund; wer das Gate lokal auf einer
# UTC-Maschine oder in einem Container fährt, bekam sonst ein falsches Rot —
# und ein Tor, das aus Umgebungsgründen rot ist, wird bald ignoriert.
# Dasselbe Rot hat am 20.7.2026 den Auftakt-Lauf von fedlex-frische.yml gekostet.
#
# BEDINGUNGSLOS, nicht `${TZ:-…}`: `ci.yml` setzt die Zone je Job ebenso
# unbedingt, und wer TZ im Profil exportiert hat (Container-Images oft `UTC`),
# liefe sonst genau in das falsche Rot, das diese Zeile beseitigen soll.
# Absichtliche TZ-Experimente laufen weiterhin am Gate vorbei, direkt über
# `TZ=<zone> npm run golden:vergleich`.
export TZ=Europe/Zurich

mode="${1:-voll}"
fail=0

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
