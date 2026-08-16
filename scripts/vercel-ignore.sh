#!/bin/sh
# Vercel «Ignored Build Step» (vercel.json → ignoreCommand: sh scripts/vercel-ignore.sh).
# Semantik: Exit 0 = Build ÜBERSPRINGEN, Exit 1 = BAUEN.
#
# Regel (QS-AUTOMATIK, 16.8.2026): Übersprungen wird NUR ein sicherer Nur-Doku-Diff
# gegen den letzten erfolgreichen Deploy; jede Unsicherheit ⇒ bauen. Anlass: der
# frühere Inline-Command (#519) prüfte den Vorgänger-SHA mit `git rev-parse
# --verify`, das bei einem vollen 40-Hex-SHA auch OHNE vorhandenes Objekt Exit 0
# liefert; im Shallow-Clone von Vercel scheiterte dann `git diff` («bad object»),
# grep sah keine Zeile, `!` machte daraus «überspringen» — sieben Merges
# (#519–#530) waren auf main, aber nie live. Prod-Smoke sah nur HTTP 200.
# Als Datei, weil Vercel `ignoreCommand` auf 256 Zeichen begrenzt (Schema-
# Fehler «should NOT be longer than 256 characters», Preview #531).
# Tor: src/tests/vercel-ignore-command.test.ts fährt genau dieses Skript.

[ "$VERCEL_GIT_COMMIT_REF" != "main" ] && exit 0
B="$VERCEL_GIT_PREVIOUS_SHA"
[ -n "$B" ] || exit 1
git cat-file -e "$B^{commit}" 2>/dev/null || exit 1
D=$(git diff --name-only "$B" HEAD 2>/dev/null) || exit 1
[ -n "$D" ] || exit 1
# grep: 0 = mindestens eine Nicht-Doku-Datei ⇒ bauen · 1 = alles Doku ⇒ überspringen ·
# 2 = grep-Fehler ⇒ ebenfalls bauen (ein blosses `!` machte aus 2 ein «überspringen»).
printf '%s\n' "$D" | grep -qvE '\.md$|^(bibliothek|archiv|docs|\.claude)/'
case $? in 1) exit 0 ;; *) exit 1 ;; esac
