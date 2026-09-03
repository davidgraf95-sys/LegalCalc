#!/usr/bin/env bash
# scripts/analyse/test-assertion-diff.sh — Inhalts-Diff für Testdateien zwischen zwei Refs.
#
# Vergleicht NICHT nur Zählwerte (Anzahl Tests/Assertions), sondern den tatsächlichen
# Inhalt: describe-Namen, it/test-Namen und expect(...)-Aufrufe, je normalisiert
# (Leerraum entfernt) und als sortierte Menge verglichen. Anlass (T5, 3.9.2026):
# ein abgeschwächter Matcher (toBeLessThan -> toBeLessThanOrEqual) hätte gleiche
# Zählwerte erzeugt — nur der Inhalts-Diff findet ihn.
#
# Aufruf: bash scripts/analyse/test-assertion-diff.sh <base-ref> <head-ref> [pfad-praefix]
#   pfad-praefix default: src/tests/
#
# Exit 0: alle drei Diffs (describe/it-test/expect) leer.
# Exit 1: mindestens ein Diff nicht leer, oder Aufruffehler.
#
# Kein echo fuer Dateiinhalte (zsh/echo interpretiert \n) — Inhalte kommen
# ausschliesslich per `git show <ref>:<datei> > <tempdatei>`.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <base-ref> <head-ref> [pfad-praefix, default src/tests/]" >&2
  exit 1
fi

BASE_REF="$1"
HEAD_REF="$2"
PREFIX="${3:-src/tests/}"

WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/test-assertion-diff.XXXXXX")"
trap 'rm -rf "$WORKDIR"' EXIT

EXTRACTOR="$WORKDIR/extract.pl"
cat > "$EXTRACTOR" <<'PERL_EOF'
#!/usr/bin/env perl
# Liest eine einzelne Testdatei (Pfad als ARGV[0]) und schreibt normalisierte
# Zeilen im Format "D::<name>", "I::<name>" oder "E::<statement>" auf STDOUT.
use strict;
use warnings;

my $path = shift @ARGV or die "Pfad fehlt\n";
open(my $fh, '<', $path) or die "kann $path nicht lesen: $!\n";
local $/;
my $content = <$fh>;
close $fh;
$content = '' unless defined $content;

sub normalisiere {
    my ($s) = @_;
    $s =~ s/\s+//g;
    return $s;
}

# --- describe(...) / it(...) / test(...) — einzeilige Titel-Extraktion ---
for my $line (split /\n/, $content) {
    if ($line =~ /^\s*describe(?:\.(?:only|skip|todo|concurrent))?\s*(?:\.each\([^)]*\))?\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/) {
        print "D::" . normalisiere($2) . "\n";
    } elsif ($line =~ /^\s*(?:it|test)(?:\.(?:only|skip|todo|concurrent))?\s*(?:\.each\([^)]*\))?\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/) {
        print "I::" . normalisiere($2) . "\n";
    }
}

# --- expect(...) — mehrzeilige Aufrufe bis zur schliessenden ");" zusammenziehen ---
my $len = length($content);
while ($content =~ /\bexpect\s*\(/g) {
    my $start = $-[0];
    my $i = pos($content); # direkt nach der "(" von expect(
    my $depth = 1;
    while ($i < $len) {
        my $c = substr($content, $i, 1);
        if ($c eq '(') {
            $depth++;
        } elsif ($c eq ')') {
            $depth--;
            if ($depth == 0) {
                my $j = $i + 1;
                $j++ while ($j < $len && substr($content, $j, 1) =~ /\s/);
                if ($j < $len && substr($content, $j, 1) eq ';') {
                    $i = $j;
                    last;
                }
                # kein ';' direkt danach -> verkettetes .toXyz(...): weiterscannen,
                # depth bleibt 0 bis zur naechsten '(' einer verketteten Methode.
            }
        }
        $i++;
    }
    my $stmt = substr($content, $start, $i - $start + 1);
    print "E::" . normalisiere($stmt) . "\n";
    pos($content) = $i + 1;
}
PERL_EOF

# Liste der Dateien unter dem Praefix fuer einen Ref (*.ts/*.tsx, inkl. Hilfsdateien).
dateien_fuer_ref() {
  local ref="$1"
  git ls-tree -r --name-only "$ref" -- "$PREFIX" 2>/dev/null | grep -E '\.tsx?$' || true
}

# Extrahiert die drei normalisierten, sortierten Mengen fuer einen Ref in
# $WORKDIR/<label>-describe.txt / -ittest.txt / -expect.txt
extrahiere_ref() {
  local ref="$1"
  local label="$2"
  local raw="$WORKDIR/$label-raw.txt"
  : > "$raw"

  local files
  files="$(dateien_fuer_ref "$ref")"
  if [ -n "$files" ]; then
    while IFS= read -r datei; do
      [ -z "$datei" ] && continue
      local tmp="$WORKDIR/content"
      if git show "$ref:$datei" > "$tmp" 2>/dev/null; then
        perl "$EXTRACTOR" "$tmp" >> "$raw"
      fi
    done <<< "$files"
  fi

  (grep '^D::' "$raw" || true) | sed 's/^D:://' | sort -u > "$WORKDIR/$label-describe.txt"
  (grep '^I::' "$raw" || true) | sed 's/^I:://' | sort -u > "$WORKDIR/$label-ittest.txt"
  (grep '^E::' "$raw" || true) | sed 's/^E:://' | sort -u > "$WORKDIR/$label-expect.txt"
}

extrahiere_ref "$BASE_REF" "base"
extrahiere_ref "$HEAD_REF" "head"

STATUS=0

vergleiche() {
  local kind="$1"
  local titel="$2"
  local a="$WORKDIR/base-$kind.txt"
  local b="$WORKDIR/head-$kind.txt"
  [ -f "$a" ] || : > "$a"
  [ -f "$b" ] || : > "$b"
  local diff_out
  diff_out="$(diff -u "$a" "$b" || true)"
  if [ -n "$diff_out" ]; then
    echo "=== $titel: UNTERSCHIED (base=$BASE_REF head=$HEAD_REF) ==="
    echo "$diff_out"
    STATUS=1
  else
    echo "=== $titel: identisch ==="
  fi
}

vergleiche "describe" "describe-Namen"
vergleiche "ittest" "it/test-Namen"
vergleiche "expect" "expect-Zeilen"

if [ "$STATUS" -ne 0 ]; then
  echo "test-assertion-diff.sh: Inhalts-Diff gefunden — mindestens eine der drei Mengen unterscheidet sich zwischen $BASE_REF und $HEAD_REF." >&2
fi

exit "$STATUS"
