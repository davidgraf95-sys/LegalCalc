# Landung — Referenz: CI-Grün, Vercel, Trailer (Vorfalls-Wortlaut)

<!-- Wortlaut unverändert aus SKILL.md ausgelagert (QS-EFFIZIENZ 15.8.2026,
     Skills-Diät). Die REGELN stehen weiterhin im Skill; hier liegen die
     ausführlichen Vorfalls-Belege und die selten gebrauchten Sonderfälle.
     Laden, wenn ein CI-/Vercel-Sonderfall eintritt: kein pull_request-Lauf,
     skipped/cancelled-Bewertung, Vercel-Limit, stille Plan-Buchung. -->

### Warum `test:e2e` und `check:perf-budget` erst hier laufen

- **`test:e2e` zwingend vor jedem Merge nach main** — es ist bewusst NICHT im
  schnellen `gate` (build+Browser, zu langsam pro Iteration); ohne diesen Lauf
  rottet die Suite (axe-Befunde, veraltete Locator). Die a11y-Prüfpunkte pinnen
  das Theme (hell + Reader zusätzlich dunkel) → uhrzeitunabhängig deterministisch.
- **`check:perf-budget` zwingend vor jedem Merge nach main** (QS-PERF/§15):
  sichert die vendor-react-Topologie (ein stabiler Chunk, kein Doppel-React) und
  die gzip-Budgets; deterministisch, braucht das gebaute `dist` → nur hier, nicht
  im schnellen `gate`. Die Lighthouse-Metrik-Schranken bleiben der Mess-Schritt
  in der Nachkontrolle (Skill, Abschnitt 4, Punkt 4).

### Anlass der Landungs-Rolle (Schritt 3.1)

*(Anlass 3./4.8.2026: drei Parallel-Sessions, zwei beanspruchten dieselbe Rolle,
mehrere PRs wurden bei Grün extern gemergt, einer davon vor Abschluss des
laufenden §9-Bug-Checks — gutgegangen, aber nur zufällig.)*

### Scharfer Auto-Merge bei `BEHIND` (Schritt 3.2)

**Scharfer Auto-Merge ist keine Landung:** bei `mergeStateStatus: BEHIND`
(Branch hinter main, Required «up to date») feuert er NIE von selbst —
nach jeder main-Landung die verbleibenden Auto-Merge-PRs per
`gh pr view <n> --json mergeStateStatus` prüfen und bei BEHIND
`gh pr update-branch` fahren. Realfall #445 (5.8.2026): 16 h scharf,
alle Checks grün, kein Merge — Ursache waren fünf zwischenzeitliche
main-Landungen.

### `cancelled`/`skipped` und die designte Ausnahme (Schritt 6)

**`cancelled` und `skipped` zählen als ROT**, nicht als «nicht rot» — ein
abgebrochener Lauf hat nichts bewiesen. (Realfall 20.7.2026: 5 stumm
abgebrochene `turso-sync`-Läufe, der Suchindex veraltete unbemerkt.)
**Ausnahme — DESIGNTE konditionale Jobs:** `Perf-Budget (§15 — nur bei
grüner Treue)` skippt auf JEDEM `pull_request`-Lauf per
`if: github.event_name != 'pull_request'` (ci.yml, Entscheid David
26.7.2026 — gemessen wird nach dem Merge auf main); dieser Skip ist
mergefähig, die §15-Substanz wird lokal per `npm run check:perf-budget`
auf dem gemergten Stand belegt. Gleiches gilt für Vercel «Canceled by
Ignored Build Step» = success (#445). Massstab: Ein Skip zählt nur dann
als erfüllt, wenn seine Bedingung DOKUMENTIERT designt ist UND die
Substanz anderweitig belegt wurde — jeder andere skipped/cancelled
bleibt ROT.

**Und: FEHLENDE Checks zählen als PENDING, nie als grün.** Im Fenster
direkt nach einem Push sind die Checks des neuen Heads noch nicht
registriert — wer dann «kein pending, kein fail» als grün liest, merged
ungeprüft. Vor der Bewertung die Präsenz der Kern-Batterie verifizieren
(Tore + Bau + letzter Playwright-Shard). (Realfall 4./5.8.2026: Wächter
meldete GRÜN, während Bau/Tore noch gar nicht liefen — nur der
Verifikations-Zwischenschritt vor dem Merge fing es ab.)

### Wenn nach einem Push KEIN `pull_request`-Lauf erscheint

(Realfälle 3.8.2026, PRs #414/#417): erst die Ursache prüfen, dann das passende
Mittel — (a) leerer Diff / md-only: seit der CI-Härtung klassifiziert `ci.yml`
selbst, ein Lauf muss IMMER erscheinen; fehlt er, `gh api
commits/<head>/check-suites` ansehen; (b) Event nicht zugestellt: der Wächter
zieht fehlende Required-Kontexte an offenen PRs täglich per `workflow_dispatch`
nach — manuell geht `gh workflow run ci.yml --ref <branch>` sofort; (c) ein
leerer Commit hilft nur bei hängendem VERCEL-Kontext, er erzeugt KEINEN
Actions-Lauf (kein Datei-Diff) und schiebt den Head von bereits grünen
Check-Runs weg.

### Vercel-Tageslimit (Free-Tier ~100 Deploys/Tag)

Die Wurzel ist seit dem #445-Merge (5.8.2026, QS-CI-VERCEL) behoben — der
Ignored Build Step lässt App-fremde Diffs den Vercel-Build gar nicht erst
verbrauchen; ein übersprungener Build meldet den Check als `success` («Canceled
by Ignored Build Step») und ist mergefähig. Das frühere Admin-Bypass-Interim
(«lass vercel aus dem spiel», David 4.8.2026) ist damit GESTRICHEN: Reisst das
Limit trotzdem (App-Diff-Ketten), ist das kein Bypass-Fall mehr, sondern
Warten/Re-Trigger nach Reset — ein leerer Commit auf den Branch genügt als
Vercel-Re-Trigger (er erzeugt keinen Actions-Lauf, schiebt aber den Head;
Realfall 5.8.2026: #445 selbst so gelandet). Unverändert gilt: ein Vercel-Rot
mit echtem Build-Fehler bleibt Rot, und an landeintensiven Tagen frisst jedes
`update-branch` einen App-Deploy — Kette seriell und ohne überflüssige
Zwischen-Pushes fahren.

**Stand 16.8.2026:** Der Vercel-Kontext ist KEIN Required Check mehr
(David, Branch-Schutz-Edit 15.8. nach dem Tageslimit-Stau) und Feature-
Branches bauen keine Previews (vercel.json, #519). Die Klasse «PR wartet auf
Vercel» existiert damit nicht mehr; ein Admin-Bypass hat keinen Anlass. Ein
Vercel-Rot auf `main` (echter Build-Fehler) bleibt Rot — sichtbar über den
Prod-Deploy-Status, nicht über einen PR-Check.

**Stand 17.8.2026 — alles darüber ist Historie.** Der Ignored Build Step
reichte nicht: Vercel legte trotzdem für JEDEN Push auf JEDEN Branch ein
Deployment an und zählte es ans Tageslimit, auch wenn es sofort «Canceled by
Ignored Build Step» hiess. Am 16.8. abends riss das die 100/Tag und blockierte
Prod 24 h (Vorfall #540). Wurzel-Fix (Entscheid David «Weg b»):
**Git-Auto-Deploys sind aus** (`vercel.json` → `git.deploymentEnabled: false`),
Prod liefert der CI-Job «Deploy (Prod, Vercel CLI)» per
`vercel deploy --prebuilt --prod`. Damit gilt:

- Ein Deployment entsteht **je Merge auf `main`**, nicht je Push. Das
  Tageslimit ist für Branch-Arbeit kein Thema mehr; `update-branch` und
  Zwischen-Pushes kosten keinen Deploy.
- **Kein Vercel-Commit-Status mehr** — weder grün noch rot, auch nicht auf
  `main`. Sein Fehlen ist der Normalfall, kein Verdacht; Deploy-Rot steht im
  Actions-Lauf des Merge-Commits.
- `scripts/vercel-ignore.sh` und sein Tor bleiben als Sicherung liegen, falls
  Git-Deploy je wieder eingeschaltet wird; im Normalbetrieb läuft es nie.

### Warum der Trailer zusätzlich in den PR-Body gehört (Schritt 9)

**Denselben Trailer-Block zusätzlich als eigenen Absatz in den PR-BODY**
(unformatiert, nicht eingerückt, kein Code-Fence; BEIDE Zeilen im SELBEN
Absatz — getrennte Absätze buchten bis 15.8. still nichts, seither macht ein
halber Block den Buchungs-Lauf laut rot; der 🤖-Footer darf danach folgen):
mergt jemand per GitHub-Auto-Merge mit Standard-Squash-Text, geht der
Commit-Trailer verloren — der Workflow liest ihn dann ersatzweise aus dem
PR-Body (Lehre 14.8.2026, PR #491: Auto-Buchung blieb still, Hand-Buchung
nötig). Fällt beides aus: von Hand `plan:set <id> status=…` + committen (done ⇒
Block per Ziff. 6 in die Chronik). Realfall 5.8.2026: `QS-TOK`/
`QS-TOK-AUFRAEUMEN` blieben nach Session-Ende stundenlang `wip`, das Lagebild
zeigte falschen Bau — seither warnt `plan:next` bei wip ohne Bau-Spur, aber die
Warnung ist das Netz, nicht der Prozess.

---

## Umzug 31.8.2026 (Landung-Diät, QS-EFFIZIENZ) — Wortlaute aus SKILL.md

### §Auslieferung — Wer ausliefert: seit 17.8.2026 die CI, nicht mehr Vercel selbst

Vercel-Git-Deploys sind abgeschaltet (`vercel.json` → `git.deploymentEnabled:
false`; Entscheid David «Weg b»). Ausgeliefert wird im Job **«Deploy (Prod,
Vercel CLI)»** in `ci.yml`: ausgelöst vom `push` auf `main`, mit
`needs: [diff, tore, bau, e2e]` — Prod bekommt also nur, was die Tore
freigegeben haben. Anlass: Vercel legte bei JEDEM Push auf JEDEN Branch ein
Deployment an (auch das sofort «Canceled by Ignored Build Step»); am 16.8.2026
riss das die Free-Grenze von 100/Tag und blockierte Prod 24 h. Folgen für die
Landung: Push kostet keinen Deploy mehr (die §0-Sparregel «nur bei
Meilensteinen pushen» bleibt gute Sitte, ihr Vorfallsgrund ist entfallen) ·
kein Vercel-Check am PR (ohne Git-Deploy kein Vercel-Commit-Status; auch kein
Required Check mehr, Branch-Schutz-Edit 15.8.2026 — ein fehlender
Vercel-Kontext ist der Normalfall, kein Verdacht) · Deploy-Rot ist ein
CI-Job-Rot (steht im Actions-Lauf des Merge-Commits, nicht im
Vercel-Dashboard) · Handdeploy bleibt verboten (racender Doppel-Deploy; wenn
lokal HEAD ≠ origin/main, geht ein ANDERER Commit live als der gemergte).

### Anker-Konkordanz «§12.x» (Audit-Befund 7.8.2026, QS-AUDIT-VERWEISE)

«CLAUDE.md §12.2» = Ziff. 2 der §12-Grundregeln (Pathspec-Commits, kein
stash/amend), «§12.3» = Ziff. 3 (Deploy nur aus sauberem HEAD-Worktree).
Fahrpläne nummerieren ihre eigenen Abschnitte dateiintern ebenfalls «§12.x» —
solche Verweise sind dateigebunden, nie Reglement-Anker.

### Realfall #445 (5.8.2026) — scharfer Auto-Merge ist keine Landung

16 h scharf, grün, kein Merge: bei `mergeStateStatus: BEHIND` feuert
Auto-Merge NIE von selbst. Darum nach jeder main-Landung die verbleibenden
Auto-Merge-PRs per `gh pr view <n> --json mergeStateStatus` prüfen und bei
BEHIND `gh pr update-branch` fahren.

### Realfälle zu Schritt 6 (CI-Grün)

`cancelled`/`skipped` zählen als ROT: Realfall 20.7.2026, fünf stumme
`turso-sync`-Abbrüche — GitHub färbt cancelled GRAU, der Suchindex veraltete
unbemerkt. FEHLENDE Checks zählen als PENDING, nie als grün: Realfall
4./5.8.2026 — nach einem Push fehlte die Kern-Batterie im Lauf, beinahe
ungeprüft gemerged. Ein Vercel-Rot mit echtem Build-Fehler bleibt Rot; an
landeintensiven Tagen die Kette seriell und ohne überflüssige Zwischen-Pushes
fahren (jedes `update-branch` frisst einen App-Deploy — Ära vor dem
17.8.2026; seither kostet es nur CI-Minuten).

### Realfall 15.8.2026 zu Schritt 7 (Verwaltung bündeln)

~15 Verwaltungs-Pushes (Doku/Plan/Buchung/wip-Marker direkt auf main) rissen
das Vercel-Tageslimit, sechs fertige PRs standen stundenlang: jeder
main-Push kostete damals einen Deploy UND warf jeden offenen Auto-Merge-PR
auf BEHIND (= je ein weiterer Deploy pro Nachzug). Daraus die Regel
«Feature einzeln landen, Verwaltung bündeln» und der Hook-Block für direkte
main-Pushes; der Ausnahmefall «Hand-Buchung nach stiller Auto-Buchung»
gehört ebenfalls in den nächsten Sammel-Push, nicht sofort auf main.

### Realfall 15./16.8.2026 zu Schritt 7b (Ketten-Wächter, F2h)

Der Landeketten-Wächter mergte Risikopfad-PRs nur bei `mergeStateStatus:
CLEAN`; nach Davids Branch-Schutz-Edit standen sie auf `UNSTABLE`
(nicht-required Vercel-Kontext rot, alle 11 Required grün) — 7 h kein Merge
(17:24→00:33), zwei weitere PRs `DIRTY` (Konflikt), ebenfalls stumm. Erst
Davids Nachfrage brachte es ans Licht.

### Historie zu Schritt 9 (Trailer im PR-Body)

Vereinfachung 15.8.2026 (§5): vorher Commit-Trailer UND PR-Body — heute 2×
still verloren, 3× nachgebessert. Der Standard-Squash-Text verliert
Commit-Trailer ohnehin (PR #491); seither liest `plan-buchung.yml` den Block
aus dem PR-Body und macht einen halben Block laut rot.

### Realfälle zur Nachkontrolle 1 (Deploy-Zuordnung)

Realfall 15./16.8.2026: 7 Merges #519–#530 waren auf main, aber nie live
(`git rev-parse --verify` schlug bei fehlendem Objekt fehl) — den Fall fängt
seither der Deploy-Job selbst (Live-Kennungs-Probe, 3 Versuche à 20 s),
zusätzlich der Wächter `pruefeBuildStand` im Prod-Smoke (#531). Historisch:
bis 17.8.2026 baute Vercel per Git-Integration; ein «Canceled by Ignored
Build Step» auf einem Code-Commit war dort ROT. Diese Deploy-Art gibt es
nicht mehr.
