---
name: deploy-check
description: Verwenden, wenn David Push/Deploy/Live-Gang von LexMetrik verlangt, ein Merge nach main ansteht (main wird automatisch auf Prod ausgeliefert) oder ein Release-Stand geprüft werden soll.
---

# Deploy-Check LexMetrik (§9 — «Weg 1», Stand 25.7.2026)

**Dieser Skill IST §9.** Seit dem A4-Umzug (25.7.2026) steht die
Deploy-Disziplin hier, nicht mehr im Reglement; `CLAUDE.md` §9 trägt nur noch
den Kern in drei Sätzen und zeigt hierher. Bei einem Widerspruch zwischen
diesem Skill und einer älteren §9-Erinnerung gewinnt **dieser Text** — wer sich
an einen ausführlichen §9 in `CLAUDE.md` erinnert, erinnert einen Altstand.

Unverändert übergeordnet bleiben die Invarianten in `CLAUDE.md`, insbesondere
§1 (Korrektheit), §6 (Verhaltensneutralität, Golden) und §8 (Ehrlichkeit).

**Kernmodell (Weg 1):** Vercel liefert `main` automatisch auf Prod aus.
**Der Merge nach `main` IST der Deploy.** Es gibt keinen separaten
`vercel --prod`-Handschritt. Darum verschiebt sich die gesamte §9-Sorgfalt
(Schritte 0–2: Tore grün, Bug-Check, Golden byte-gleich, doppelt verifiziert)
zwingend **VOR den Merge/Push auf main**.

Reihenfolge strikt einhalten. Jedes Tor-Kommando NACKT laufen lassen
(keine Pipes — der PreToolUse-Hook blockiert sie ohnehin), volle Ausgabe
lesen, Exit-Code prüfen.

## 0 · Vorbedingungen

1. `git status` — fremden WIP einer Parallel-Session identifizieren.
   Eigene Commits IMMER mit explizitem Pathspec:
   `git commit -m "…" -- <dateien>`. NIE `git stash`, NIE `--amend`.
2. Review-Schrott räumen: `find src -name '__*'` muss leer sein
   (Repro-Dateien von Review-Agents brechen Suite/Lint).
3. Untracked Ballast im Root prüfen (PDFs, Bücher) — darf nie **committet**
   werden. Der Git-Deploy baut nur committete Inhalte; die Gefahr ist ein
   versehentliches `git add -A`, nicht mehr ein Verzeichnis-Upload.

## 1 · Tore (alle grün, volle Ausgabe)

```
npx tsc -b
npm test
npm run lint        # nie tail/Pipe — hat schon 8 Fehler verschluckt
npm run build
npm run golden:vergleich   # byte-gleich; Exit-Code prüfen!
npm run check       # check:seriell-Kette (Sweep, Smoke, Register u. a.)
npm run test:e2e    # Playwright (a11y/axe beide Theme-Modi + Funktions-Smokes);
                    # braucht dist (nach build), startet vite preview selbst.
npm run check:perf-budget  # QS-PERF: Bundle-Topologie/-Budget + Single-React;
                    # liest das gebaute dist (nach build), Chrome-frei.
```

- **`test:e2e` zwingend vor jedem Merge nach main** — es ist bewusst NICHT im
  schnellen `gate` (build+Browser, zu langsam pro Iteration); ohne diesen Lauf
  rottet die Suite (axe-Befunde, veraltete Locator). Die a11y-Prüfpunkte pinnen
  das Theme (hell + Reader zusätzlich dunkel) → uhrzeitunabhängig deterministisch.
- **`check:perf-budget` zwingend vor jedem Merge nach main** (QS-PERF/§15):
  sichert die vendor-react-Topologie (ein stabiler Chunk, kein Doppel-React) und
  die gzip-Budgets; deterministisch, braucht das gebaute `dist` → nur hier, nicht
  im schnellen `gate`. Die Lighthouse-Metrik-Schranken bleiben der manuelle
  Mess-Schritt in Schritt 4 (Nachkontrolle), Punkt 4.
- Golden-Abweichungen ERST den interleaved Commits der Parallel-Session
  zuordnen, dann erst über Neu-Schreiben entscheiden (nur deklariert).
- Falls zusätzlich `check:netz`/`check:zitate` gefahren wird: vorher den
  Anker-Count der /tmp-Fedlex-Caches verifizieren — Workflow-/Review-Agents
  überschreiben sie.

## 2 · Bug-Check §9

Unabhängige Review-Agents über das Deploy-Delta (`git log <letzter
Deploy>..HEAD`): mindestens 2 Agents (Code-Lupe + empirische
vite-node-Repros); bei grossen Deltas das bewährte Workflow-Muster
«6 Strang-Finder × 2 adversariale Lupen». Bestätigte Befunde fixen,
Regressionstests dazu, danach Tore aus Schritt 1 erneut.

## 3 · Push + Merge = Deploy (Weg 1)

**Push ist stehend freigegeben** (Daueranweisung David 2.7.2026: «immer ja zum
push» — `git push` + PR + Auto-Merge ohne Einzel-Nachfrage). KEINE gesonderte
Push-Bestätigung mehr einholen; Davids Deploy-/Merge-Verlangen («bring das auf
Prod», Batch-Freigabe) deckt den Push mit ab.

**Der Live-Gang-Entscheid ist die Freigabe zum Merge nach `main`** — Vercel
baut und liefert den gemergten Commit automatisch auf Prod aus.

Normalfall (Feature-Branch):

```
git push
gh pr create …                       # falls noch kein PR existiert
gh pr merge --auto --merge           # Auto-Merge bei grüner CI (Daueranweisung 30.6.)
```

**`--auto` ist der Deploy-Zünder — erst scharf machen, wenn Schritte 0–2
komplett abgeschlossen sind.** Ein früh gesetztes `--auto` merged (= deployt)
automatisch, sobald die CI grün ist, auch wenn lokale Tore (test:e2e,
perf-budget, Bug-Check) noch laufen oder nie liefen. Grüne CI ist
Merge-Voraussetzung, sie ERSETZT die Schritte 0–2 nicht.

Nie einen roten PR mergen (Billing-roter Check + lokal grün = OK). Arbeit
direkt auf `main`: `git push origin main` löst den Prod-Deploy unmittelbar aus
— darum müssen die Schritte 0–2 **vor diesem Push** abgeschlossen sein.

**Verboten im Normalfall:** `npx vercel --prod`, jeder `/tmp`-Worktree-Deploy,
jeder zweite Deploy-Pfad neben dem Git-Auto-Deploy. Ein zusätzlicher manueller
Prod-Deploy raced mit dem Git-Deploy: der langsamere Build überschreibt den
korrekten, und wenn lokal HEAD ≠ `origin/main` (Parallel-Session-Commits),
geht ein ANDERER Commit live als der gemergte.

**Bewusste Grenze:** nichts mergen, was Tore rot lässt oder nicht doppelt
verifiziert ist. Rot = Stopp, kein «mergen und nachbessern».

### Auto-Merge ist auf Risiko-Pfaden gesperrt

Auf Risiko-Pfaden (Extraktion, Rechnen, Norm-Tarif — Definition über
`istRisikoPfad()` in `scripts/gegenpruefung/kern.ts`) wird **erst nach
vorliegendem Gegenprüfungs-Verdikt** gemergt. `--auto` ist dort **ganz
gesperrt**: Es prüft nur den Stand beim Aktivieren, nicht den beim Mergen.

Das Verdikt braucht eine prüfbare Form **und** einen Zuwachs im committeten
Gegenprüfungs-Register. Ein Trailer allein ist eine Behauptung über eine
Prüfung, kein Nachweis.

Maschinelle Rückendeckung, dreifach:

- `check:merge-schutz` als dedizierter CI-Job «Merge-Schutz
  (Required-Kontext)», gesetzt als **Required Check** in den Branch-Regeln —
  ein entfernter Job hinterlässt einen «expected»-Block.
- derselbe Check im Hook `tor-schutz.py` vor jedem Merge-Kommando (erste
  Verteidigungslinie, lokal).
- `check:gegenpruefung` blockiert `npm run gate`, bis für den Diff ein
  `bestanden`-Nachweis vorliegt.

**Vorfall, der das erzwungen hat:** PR #309 — elf erfundene Amtsträger:innen
gingen rund eine Stunde auf Prod, weil der Verweis auf die Gegenprüfung beim
Abarbeiten der Liste übersprungen wurde.

**Einzige Ausnahme — manueller Deploy.** Nur wenn GENAU EINES dieser zwei
beobachtbaren Prädikate erfüllt ist (oder beide):

- David ordnet einen manuellen Deploy AUSDRÜCKLICH an, ODER
- der Vercel-Git-Deploy läuft nachweislich nicht (Dashboard bzw.
  `npx vercel ls` zeigt für den Merge-Commit keinen Build).

Nur dann: erst `git fetch` und verifizieren, dass der zu deployende Stand
== `origin/main` ist, dann aus einem sauberen HEAD-Worktree deployen
(`git worktree add /tmp/lexmetrik-deploy origin/main` ·
`cp -R .vercel /tmp/lexmetrik-deploy/` · `npm ci && npx vercel --prod` ·
danach `git worktree remove /tmp/lexmetrik-deploy`), nie aus dem
Arbeitsverzeichnis.

### Rationalisierungen (alle schon vorgekommen oder naheliegend)

| Ausrede | Realität |
|---|---|
| «In `CLAUDE.md` §9 steht der ausführliche Deploy-Ablauf — ich halte mich daran.» | Seit 25.7.2026 steht dort nur noch der Kern plus ein Zeiger hierher. Wer einen ausführlichen §9 erinnert, erinnert einen Altstand. Dieser Skill ist der Text. |
| «§9 nennt selbst ‹Prod: npx vercel --prod› — der Handschritt ist gedeckt.» | Diese alte Prod-Zeile wurde am 17.7.2026 gestrichen; Weg 1 «Merge = Deploy» ist der einzige verbindliche Pfad. Wer sich an ‹npx vercel --prod› erinnert, erinnert einen Altstand. |
| «Die Gegenprüfung lief, ich habe den Trailer gesetzt — `--auto` kann scharf.» | Auf Risiko-Pfaden ist `--auto` ganz gesperrt, und ein Trailer ohne Registerzuwachs ist eine Behauptung, kein Nachweis. Vorfall PR #309. |
| «Doppelt hält besser — ein zusätzlicher vercel --prod aus sauberem Worktree schadet nicht.» | Doppel-Deploy = Race. Der langsamere Build überschreibt den korrekten; bei HEAD ≠ origin/main geht ein falscher Commit live. |
| «Die GitHub-CI ist grün — das ersetzt die lokalen Tore, ich kann --auto schon mal setzen.» | Grüne CI ist Merge-Voraussetzung, nicht Ersatz für Schritte 0–2. `--auto` vor Abschluss von 0–2 = unkontrollierter Prod-Deploy bei nächstem grünen CI-Lauf. |
| «David hat nur den Deploy verlangt, den Push nicht wörtlich — also Push einzeln bestätigen lassen.» | Push ist stehend freigegeben (2.7.2026); die Einzel-Nachfrage ist abgeschafft. «Bring das auf Prod» deckt Push + Merge. |
| «Der /tmp-Worktree schützt vor dem Hochladen von untracked Ballast.» | Der Git-Deploy baut nur Committetes — untracked erreicht Vercel gar nicht. Die echte Gefahr ist versehentliches Committen (Schritt 0.3). |
| «Nur ein flakiger Test rot / fast grün — mergen und nachbessern.» | Bewusste Grenze (oben, Schritt 3): nichts mergen, was Tore rot lässt oder nicht doppelt verifiziert ist. |

### Red Flags — STOP

- Du bist dabei, `npx vercel --prod` zu tippen, ohne dass ein Ausnahme-Prädikat
  (ausdrückliche Anordnung ODER nachweislich ausgefallener Git-Deploy) erfüllt ist.
- Du legst `/tmp/lexmetrik-deploy` für einen Normalfall-Deploy an.
- Du setzt `gh pr merge --auto`, bevor die Schritte 0–2 abgeschlossen sind.
- Du willst David für den Push separat um Bestätigung bitten.
- Du willst mergen, obwohl ein Tor aus Schritt 1 rot oder Schritt 2 offen ist.
- Du berufst dich auf die alte, am 17.7.2026 gestrichene §9-Zeile «Prod: `npx vercel --prod`» als Freibrief für einen Handschritt.
- Nach dem Merge willst du «zur Sicherheit» zusätzlich manuell deployen.

**Buchstabe = Geist:** Ein zweiter Prod-Deploy-Pfad, der «technisch kein
`vercel --prod` ist» (z. B. `vercel deploy --prebuilt`, `vercel promote` bzw.
der Dashboard-Klick «Promote to Production» auf einem Preview-Deploy, das
Vercel-MCP-Tool `deploy_to_vercel`, ein Redeploy-Klick im Dashboard), ist
derselbe verbotene racende Doppel-Deploy. Den Buchstaben umgehen heisst den
Geist verletzen.

## 4 · Nachkontrolle

1. Prod-Deploy dem Merge-Commit zuordnen: das Vercel-Prod-Deployment muss den
   gemergten Commit bauen (PR-Deploy-Status bzw. `npx vercel ls`); warten,
   bis es Ready ist — nicht durch einen manuellen Deploy «beschleunigen».
2. Asset-Hash live = lokal (index.html der Prod-URL gegen `dist/` des
   gemergten Stands).
3. Kernrouten auf HTTP 200: `/`, `/rechner/tagerechner`,
   `/rechner/zustaendigkeit`, `/rechner/verjaehrung`,
   `/rechner/mietrecht`, `/vorlagen`, eine Vorlagen-Detailroute.
4. Lighthouse-Metriken manuell messen (QS-PERF/§15): CLS/LCP/TBT auf
   `/gesetze/bund/OR` unter 4× CPU — Soll-Werte in `fahrplaene/FAHRPLAN-PERFORMANCE.md`;
   bleibt manuell, bis ein CI-Chrome verdrahtet ist.
5. Aufräumen: gemergten Branch + zugehörigen Worktree entfernen
   (Daueranweisung 30.6.).
6. STRUKTUR.md / ROADMAP.md spiegeln (deployter Stand, Commit-Hash) —
   STRUKTUR-Pflicht: Skill `auftrag`, Ziff. 4a.
