---
name: landung
description: Verwenden, wenn ein fertiger Stand nach main soll — Trigger «landen», «Landung», «PR mergen», «einsammeln», «rebasen auf main», «Merge-Kette abarbeiten», «Push», «Deploy», «Live-Gang», «bring das auf Prod», «Release-Stand prüfen». Kodifiziert §12 (serielle Landung, Merge-Treiber) UND §9 (Merge nach main IST der Deploy — Vercel liefert main automatisch aus); der frühere Skill deploy-check ist hier aufgegangen (QS-SKILL-DIAET 8.8.2026).
---

# Landung nach main = Deploy (§12 + §9, «Weg 1»)

**Dieser Skill trägt §12 UND §9.** Seit dem A4-Umzug (25.7.2026) stehen beide
Paragraphen ausserhalb des Reglements, `CLAUDE.md` zeigt nur noch hierher; seit
der Skill-Diät (QS-SKILL-DIAET, 8.8.2026) ist auch der frühere Skill
`deploy-check` hier aufgegangen. Bei einem Widerspruch zwischen diesem Text und
einer älteren §9-/§12-/deploy-check-Erinnerung gewinnt **dieser Text** — wer
sich an einen ausführlichen §9 in `CLAUDE.md` oder an einen eigenen
deploy-check-Skill erinnert, erinnert einen Altstand.

**Kernmodell (Weg 1):** Vercel liefert `main` automatisch auf Prod aus.
**Der Merge nach `main` IST der Deploy.** Es gibt keinen separaten
`vercel --prod`-Handschritt. Darum liegt die gesamte §9-Sorgfalt (Tore grün,
Bug-Check, Golden byte-gleich, doppelt verifiziert) zwingend **VOR dem
Merge/Push auf main**. Unverändert übergeordnet bleiben die Invarianten in
`CLAUDE.md`, insbesondere §1 (Korrektheit), §6 (Verhaltensneutralität, Golden)
und §8 (Ehrlichkeit).

Ziel der Merge-Mechanik: Konflikte paralleler PRs entschärfen, indem **EINE**
PR aufs Mal gelandet wird und generierte Dateien nie von Hand gemischt werden.

## §12 · Isolation — die Grundregeln vor jeder Landung

Gleichzeitige Sessions im selben Arbeitsverzeichnis haben wiederholt Arbeit
zerstört. Darum:

1. **Zweite und jede weitere Session arbeitet in einem eigenen git-Worktree**
   (`git worktree add …` bzw. die native Worktree-Isolation von Claude Code)
   und bringt Ergebnisse als Commits zurück. Wer beim Start fremden WIP in
   `git status` sieht, der nicht zum eigenen Auftrag gehört, wechselt **vor**
   Struktur-Arbeiten in einen Worktree.
2. **Im geteilten Verzeichnis gelten zwingend:**
   - Commits nur mit explizitem Pathspec: `git commit -m "…" -- <dateien>`
   - **kein** `git stash` bei fremdem WIP
   - **kein** `git commit --amend` (der Hook `tor-schutz.py` blockiert es)
   - nach jedem Commit die `--stat`-Dateizahl gegen die eigene add-Liste prüfen
3. **Deploys nie aus dem Arbeitsverzeichnis**, immer aus einem sauberen
   HEAD-Worktree (einziger Fall: Ausnahme «manueller Deploy» unten).
4. **Merge-Treiber-Politik** (`.gitattributes`, aktiv pro Clone via `prepare` →
   `scripts/git-setup.sh`): Append-Register `merge=union`; generierte
   Projektionen (`daten-manifest.json`, `*.generated.ts`,
   rechtsprechung-Indexe) `merge=regen` — eigene Seite behalten, **Generator
   neu laufen lassen**. `golden/*.json` und `public/normtext/**` bewusst OHNE
   Treiber: dort SOLL der Konflikt anhalten (Byte-Orakel bzw. Drop/Leak).
   `rerere` ist aktiv. Die Treiber greifen nur bei **lokalen** Merges und
   Rebases, nie beim GitHub-Server-Merge.

**Anker-Konkordanz «§12.x»** (Audit-Befund 7.8.2026, Kollision; QS-AUDIT-VERWEISE):
Alt-Verweise «CLAUDE.md §12.2» meinen **Ziff. 2** dieser Liste (Pathspec-Commits,
kein stash/amend), «§12.3» **Ziff. 3** (Deploy nur aus sauberem HEAD-Worktree).
Achtung Verwechslungsgefahr: Fahrpläne nummerieren ihre EIGENEN Abschnitte
dateiintern ebenfalls «§12.x» (z. B. `FAHRPLAN-VERZAHNUNG-UI.md` §12.2
«Herleitung», `FAHRPLAN-GESETZES-UX.md` §12.x) — solche Verweise sind stets
dateigebunden und nie Reglement-Anker; im Zweifel entscheidet der Kontext
(«diese Datei §…» = Fahrplan-Anker).

---

## 0 · Vorbedingungen

Einmal pro Clone/Worktree: `npm install` lief (setzt via `prepare` →
`scripts/git-setup.sh` den `regen`-Treiber + rerere), sonst
`bash scripts/git-setup.sh` von Hand. Jedes Tor-Kommando NACKT laufen lassen
(keine Pipes — der PreToolUse-Hook blockiert sie ohnehin), volle Ausgabe
lesen, Exit-Code prüfen. Dann:

1. `git status` — fremden WIP einer Parallel-Session identifizieren.
   Eigene Commits IMMER mit explizitem Pathspec:
   `git commit -m "…" -- <dateien>`. Im Landungs-Kontext gilt verschärft und
   ohne Bedingung: NIE `git stash`, NIE `--amend` (§12.2 ist das Minimum).
2. Review-Schrott räumen: `find src -name '__*'` muss leer sein
   (Repro-Dateien von Review-Agents brechen Suite/Lint).
3. Untracked Ballast im Root prüfen (PDFs, Bücher) — darf nie **committet**
   werden. Der Git-Deploy baut nur committete Inhalte; die Gefahr ist ein
   versehentliches `git add -A`, nicht mehr ein Verzeichnis-Upload.

## 1 · Tore vor dem Merge (alle grün, volle Ausgabe)

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
  im schnellen `gate`. Die Lighthouse-Metrik-Schranken bleiben der Mess-Schritt
  in der Nachkontrolle (unten, Punkt 4).
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

## 3 · Serielle Landung — strikt der Reihe nach, EIN Kommando aufs Mal

1. **Landungs-Rolle ansagen.** Vor Landungs-Beginn einen PR-Kommentar setzen
   («Landung übernommen — Session/Worktree <name>»); wer an einem PR einen
   fremden, jüngeren Landungs-Kommentar sieht, merged ihn NICHT. *(Anlass
   3./4.8.2026: drei Parallel-Sessions, zwei beanspruchten dieselbe Rolle,
   mehrere PRs wurden bei Grün extern gemergt, einer davon vor Abschluss des
   laufenden §9-Bug-Checks — gutgegangen, aber nur zufällig.)*
2. **Kollisionen sichten.** `gh pr list --state open` — prüfen, ob ein
   anderer offener PR dieselben Dateien/dasselbe Subsystem berührt
   (Doppelarbeit/Kollision). Bei Überschneidung: erst den anderen landen,
   dann diesen rebasen (Schritt 8). Nie zwei kollidierende PRs gleichzeitig.
   **Scharfer Auto-Merge ist keine Landung:** bei `mergeStateStatus: BEHIND`
   (Branch hinter main, Required «up to date») feuert er NIE von selbst —
   nach jeder main-Landung die verbleibenden Auto-Merge-PRs per
   `gh pr view <n> --json mergeStateStatus` prüfen und bei BEHIND
   `gh pr update-branch` fahren. Realfall #445 (5.8.2026): 16 h scharf,
   alle Checks grün, kein Merge — Ursache waren fünf zwischenzeitliche
   main-Landungen.
3. **origin/main einziehen.** `git fetch origin` → dann in den Feature-Branch
   `git merge origin/main` (oder `git rebase origin/main`). Hier greifen die
   lokalen Merge-Treiber aus `.gitattributes`.
4. **Konflikte auflösen — nie von Hand mischen.**
   - **Generierte Datei** (`daten-manifest.json`, `*.generated.ts`,
     `public/rechtsprechung/*index*`): der `regen`-Treiber hat schon die
     eigene Seite behalten (kein Marker). **Generator neu laufen**, damit der
     Inhalt zum gemergten Stand passt:
       - `daten-manifest.json` → `npm run datenhaltung:manifest`
       - `*.generated.ts` → das im Datei-Banner genannte `npm run gen:*`
       - `public/rechtsprechung/*index*` → entscheide-Pipeline (`npm run entscheide …`)
   - **Append-Register** (`bibliothek/register/gegenpruefung-register.md`):
     der `union`-Treiber hat beide Seiten behalten — nur prüfen, keine Aktion.
   - **golden/*.json**: KEIN Treiber. Von Hand auflösen, dann `npm run golden`,
     den Byte-Diff bewusst als beabsichtigt bestätigen (§6-Oracle).
   - **public/normtext/**/*.json**: KEIN Treiber. Konflikt SOLL anhalten →
     Gegenprüfung (Drop/Leak), nie blind eine Seite nehmen.
   - **STRUKTUR.md / ROADMAP.md / FAHRPLAN-* / INDEX.md**: in-place, von Hand
     auflösen (beide Beiträge behalten). rerere merkt sich die Auflösung.
5. **Gate.** `npm run gate` (grün Pflicht). Das erzwingt die Regeneration aus
   Schritt 4: ein vergessener Generator-Neulauf fällt als rotes `check:*` auf.
6. **CI-Grün verifizieren.** Push (`git push`), dann `gh pr checks <nr> --watch`
   bis grün. Billing-rot bei lokal-grün = OK (§9).
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

   **Wenn nach einem Push KEIN `pull_request`-Lauf erscheint** (Realfälle
   3.8.2026, PRs #414/#417): erst die Ursache prüfen, dann das passende Mittel —
   (a) leerer Diff / md-only: seit der CI-Härtung klassifiziert `ci.yml` selbst,
   ein Lauf muss IMMER erscheinen; fehlt er, `gh api commits/<head>/check-suites`
   ansehen; (b) Event nicht zugestellt: der Wächter zieht fehlende Required-
   Kontexte an offenen PRs täglich per `workflow_dispatch` nach — manuell geht
   `gh workflow run ci.yml --ref <branch>` sofort; (c) ein leerer Commit hilft
   nur bei hängendem VERCEL-Kontext, er erzeugt KEINEN Actions-Lauf (kein
   Datei-Diff) und schiebt den Head von bereits grünen Check-Runs weg.

   **Vercel-Tageslimit (Free-Tier ~100 Deploys/Tag):** Die Wurzel ist seit dem
   #445-Merge (5.8.2026, QS-CI-VERCEL) behoben — der Ignored Build Step lässt
   App-fremde Diffs den Vercel-Build gar nicht erst verbrauchen; ein
   übersprungener Build meldet den Check als `success` («Canceled by Ignored
   Build Step») und ist mergefähig. Das frühere Admin-Bypass-Interim
   («lass vercel aus dem spiel», David 4.8.2026) ist damit GESTRICHEN: Reisst
   das Limit trotzdem (App-Diff-Ketten), ist das kein Bypass-Fall mehr,
   sondern Warten/Re-Trigger nach Reset — ein leerer Commit auf den Branch
   genügt als Vercel-Re-Trigger (er erzeugt keinen Actions-Lauf, schiebt aber
   den Head; Realfall 5.8.2026: #445 selbst so gelandet). Unverändert gilt:
   ein Vercel-Rot mit echtem Build-Fehler bleibt Rot, und an landeintensiven
   Tagen frisst jedes `update-branch` einen App-Deploy — Kette seriell und
   ohne überflüssige Zwischen-Pushes fahren.

6b. **Bei Daten-/Extraktions-PRs: Identitätsbeleg.** Bevor neue Entitäten
   (Personen, Erlasse, Entscheide) live gehen, eine Stichprobe **n ≥ 10** gegen
   die **amtliche Quelle** prüfen und die Trefferquote im PR dokumentieren.
   Belege sind **Identitäts-Treffer mit Wortgrenze**, nie Substring-Präsenz.
   *Warum als eigener Schritt und nicht als Verweis: der Vorfall PR #309
   (unten, Risiko-Sperre) ist genau hier passiert.*

7. **Push + Merge = Deploy.** **Push ist stehend freigegeben** (Daueranweisung
   David 2.7.2026: «immer ja zum push» — `git push` + PR + Auto-Merge ohne
   Einzel-Nachfrage). KEINE gesonderte Push-Bestätigung mehr einholen; Davids
   Deploy-/Merge-Verlangen («bring das auf Prod», Batch-Freigabe) deckt den
   Push mit ab. **Der Live-Gang-Entscheid ist die Freigabe zum Merge nach
   `main`** — Vercel baut und liefert den gemergten Commit automatisch aus.

   Falls noch kein PR existiert: `gh pr create …` (der Branch ist durch den
   Früh-Push aus Station A des Skills `bauschritt` bereits auf origin).
   Merge manuell: `gh pr merge <nr> --squash`. **KEIN `--auto`**, solange die
   Required Checks nicht neu gesetzt sind (David-Handschritt offen). Wo
   `--auto` grundsätzlich zulässig ist (Daueranweisung 30.6.), gilt:
   **`--auto` ist der Deploy-Zünder — erst scharf machen, wenn die Schritte
   0–2 komplett abgeschlossen sind.** Ein früh gesetztes `--auto` merged
   (= deployt) automatisch, sobald die CI grün ist, auch wenn lokale Tore
   (test:e2e, perf-budget, Bug-Check) noch laufen oder nie liefen. Grüne CI
   ist Merge-Voraussetzung, sie ERSETZT die Schritte 0–2 nicht.

   Nie einen roten PR mergen (Billing-roter Check + lokal grün = OK). Arbeit
   direkt auf `main`: `git push origin main` löst den Prod-Deploy unmittelbar
   aus — darum müssen die Schritte 0–2 **vor diesem Push** abgeschlossen sein.

   **Verboten im Normalfall:** `npx vercel --prod`, jeder `/tmp`-Worktree-
   Deploy, jeder zweite Deploy-Pfad neben dem Git-Auto-Deploy. Ein
   zusätzlicher manueller Prod-Deploy raced mit dem Git-Deploy: der langsamere
   Build überschreibt den korrekten, und wenn lokal HEAD ≠ `origin/main`
   (Parallel-Session-Commits), geht ein ANDERER Commit live als der gemergte.

   **Bewusste Grenze:** nichts mergen, was Tore rot lässt oder nicht doppelt
   verifiziert ist. Rot = Stopp, kein «mergen und nachbessern».

8. **Nächste PR erst danach.** Erst wenn diese PR auf main ist, die nächste
   auf das neue main rebasen (zurück zu Schritt 1). So kollidiert nie eine
   zweite Landung mit einer schwebenden.

9. **Schritt-Status schliessen — wip verlässt die Session nie.** Bevorzugter
   Weg (seit 14.8.2026, QS-PLAN-EINFACH): dem Squash-Commit den Trailer
   `Roadmap-Status: done|ready|parked(<token>)` mitgeben — `plan-buchung.yml`
   bucht nach dem Merge automatisch (rot bei ungültiger ID/Status, nie ein
   unwahrer Plan). **Denselben Trailer-Block zusätzlich als eigenen Absatz in
   den PR-BODY** (unformatiert, nicht eingerückt, kein Code-Fence; BEIDE
   Zeilen im SELBEN Absatz — getrennte Absätze buchten bis 15.8. still
   nichts, seither macht ein halber Block den Buchungs-Lauf laut rot; der
   🤖-Footer darf danach folgen): mergt jemand per GitHub-Auto-Merge mit
   Standard-Squash-Text, geht der Commit-Trailer verloren — der Workflow
   liest ihn dann ersatzweise aus dem PR-Body (Lehre 14.8.2026, PR #491:
   Auto-Buchung blieb still, Hand-Buchung nötig). Fällt beides aus: von Hand
   `plan:set <id> status=…` + committen (done ⇒ Block per Ziff. 6 in die
   Chronik). Realfall 5.8.2026:
   `QS-TOK`/`QS-TOK-AUFRAEUMEN` blieben nach Session-Ende stundenlang `wip`,
   das Lagebild zeigte falschen Bau — seither warnt `plan:next` bei wip ohne
   Bau-Spur, aber die Warnung ist das Netz, nicht der Prozess.

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

### Ausnahmefall manueller Deploy · Ausreden-Tabelle → referenz-ausnahmen.md

Beides selten gebraucht und darum ausgelagert (Wortlaut unverändert,
QS-EFFIZIENZ 14.8.2026): Wer einen manuellen Deploy erwägt ODER sich bei
einem Red Flag unten beim Rationalisieren ertappt, liest ZUERST
`referenz-ausnahmen.md` im Skill-Ordner — die zwei Ausnahme-Prädikate und
die belegten Ausreden stehen dort.
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
   Prod-URL ist https://lexmetrik.vercel.app (eine Custom-Domain
   lexmetrik.ch existiert NICHT — Fehlversuch 5.8.2026, curl exit 6).
4. Lighthouse-Metriken (QS-PERF/§15): CLS/LCP/TBT auf `/gesetze/bund/OR` —
   Soll-Werte in `fahrplaene/FAHRPLAN-PERFORMANCE.md`. Läuft seit dem CI-Ausbau
   **automatisiert** als `check:perf-lighthouse` nach dem Merge auf main
   (ci.yml; Faktenkorrektur 7.8.2026, Reglement-Audit — «manuell bis CI-Chrome»
   war überholt). Manuell nur noch bei Verdacht zwischen zwei Läufen.
5. Aufräumen: gemergten Branch + zugehörigen Worktree entfernen
   (`git worktree remove …`, Branch lokal + remote löschen; Daueranweisung
   30.6.).
6. STRUKTUR.md / ROADMAP.md spiegeln (deployter Stand, Commit-Hash) —
   STRUKTUR-Pflicht: Skill `auftrag`, Ziff. 4a.
