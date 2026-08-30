---
name: landung
description: Verwenden, wenn ein fertiger Stand nach main soll — Trigger «landen», «Landung», «PR mergen», «einsammeln», «rebasen auf main», «Merge-Kette abarbeiten», «Push», «Deploy», «Live-Gang», «bring das auf Prod», «Release-Stand prüfen». Kodifiziert §12 (serielle Landung, Merge-Treiber) UND §9 (Merge nach main IST der Deploy, ausgeliefert vom CI-Job «Deploy (Prod, Vercel CLI)»).
---

# Landung nach main = Deploy (§12 + §9, «Weg 1»)

**Dieser Skill trägt §12 UND §9** (A4-Umzug 25.7.2026; der frühere Skill
`deploy-check` ist hier aufgegangen, QS-SKILL-DIAET 8.8.2026). Bei Widerspruch
zu einer älteren §9-/§12-/deploy-check-Erinnerung gewinnt **dieser Text** — wer
einen ausführlichen §9 in `CLAUDE.md` erinnert, erinnert einen Altstand.

**Kernmodell (Weg 1):** **Der Merge nach `main` IST der Deploy** — es gibt
keinen separaten `vercel --prod`-Handschritt. Darum liegt die gesamte
§9-Sorgfalt (Tore grün, Bug-Check, Golden byte-gleich, doppelt verifiziert)
zwingend **VOR dem Merge/Push auf main**; übergeordnet bleiben §1, §6 und §8.
Ziel der Merge-Mechanik: **EINE** PR aufs Mal landen, generierte Dateien nie
von Hand mischen.

**Wer ausliefert — seit 17.8.2026 die CI, nicht mehr Vercel selbst.**
Vercel-Git-Deploys sind abgeschaltet (`vercel.json` → `git.deploymentEnabled:
false`; Entscheid David «Weg b»). Ausgeliefert wird im Job **«Deploy (Prod,
Vercel CLI)»** in `ci.yml`: ausgelöst vom `push` auf `main`, mit
`needs: [diff, tore, bau, e2e]` — Prod bekommt also nur, was die Tore
freigegeben haben. Anlass: Vercel legte bei JEDEM Push auf JEDEN Branch ein
Deployment an (auch das sofort «Canceled by Ignored Build Step»); am 16.8.2026
riss das die Free-Grenze von 100/Tag und blockierte Prod 24 h. Folgen für die
Landung:

- **Push kostet keinen Deploy mehr.** Die §0-Sparregel «nur bei Meilensteinen
  pushen» bleibt gute Sitte, ihr Vorfallsgrund ist entfallen.
- **Kein Vercel-Check am PR.** Ohne Git-Deploy gibt es keinen Vercel-Commit-
  Status; er ist auch kein Required Check mehr (Branch-Schutz-Edit 15.8.2026).
  Ein fehlender Vercel-Kontext ist ab jetzt der Normalfall, kein Verdacht.
- **Deploy-Rot ist ein CI-Job-Rot** — es steht im Actions-Lauf des
  Merge-Commits, nicht im Vercel-Dashboard.
- **Handdeploy bleibt verboten** (Abschnitt «manueller Deploy» unten): ein
  lokales `vercel deploy --prod` liefert einen ungetesteten Arbeitsbaum aus und
  rennt gegen den CI-Job um denselben Alias.

## §12 · Isolation — die Grundregeln vor jeder Landung

Gleichzeitige Sessions im selben Arbeitsverzeichnis haben wiederholt Arbeit
zerstört. Darum:

1. **Zweite und jede weitere Session arbeitet in einem eigenen git-Worktree**
   und bringt Ergebnisse als Commits zurück. Wer beim Start fremden WIP in
   `git status` sieht, wechselt **vor** Struktur-Arbeiten in einen Worktree.
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

**Anker-Konkordanz «§12.x»** (Audit-Befund 7.8.2026, QS-AUDIT-VERWEISE):
«CLAUDE.md §12.2» = **Ziff. 2** oben (Pathspec-Commits, kein stash/amend),
«§12.3» = **Ziff. 3** (Deploy nur aus sauberem HEAD-Worktree). Fahrpläne
nummerieren ihre eigenen Abschnitte dateiintern ebenfalls «§12.x» — solche
Verweise sind dateigebunden, nie Reglement-Anker («diese Datei §…»).

---

## 0 · Vorbedingungen

Einmal pro Clone/Worktree: `npm install` lief (setzt via `prepare` →
`scripts/git-setup.sh` den `regen`-Treiber + rerere), sonst
`bash scripts/git-setup.sh` von Hand. Jedes Tor-Kommando NACKT laufen lassen
(keine Pipes — der PreToolUse-Hook blockiert sie ohnehin), volle Ausgabe
lesen, Exit-Code prüfen. Dann:

1. `git status` — fremden WIP identifizieren. Eigene Commits IMMER mit
   Pathspec; im Landungs-Kontext ohne Bedingung: NIE `git stash`, NIE
   `--amend` (Ziff. 2 oben ist das Minimum).
2. Review-Schrott räumen: `find src -name '__*'` muss leer sein
   (Repro-Dateien von Review-Agents brechen Suite/Lint).
3. Untracked Ballast im Root (PDFs, Bücher) nie **committen** — der Git-Deploy
   baut nur Committetes; die Gefahr ist ein versehentliches `git add -A`.

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

- **`test:e2e` und `check:perf-budget` sind zwingend vor jedem Merge nach main**
  und bewusst NICHT im schnellen `gate` (Browser bzw. gebautes `dist`).
  Begründung im Detail: `referenz-ci.md`.
- Golden-Abweichungen ERST den interleaved Commits der Parallel-Session
  zuordnen, dann erst über Neu-Schreiben entscheiden (nur deklariert).
- Falls zusätzlich `check:netz`/`check:zitate` gefahren wird: vorher den
  Anker-Count der /tmp-Fedlex-Caches verifizieren — Workflow-/Review-Agents
  überschreiben sie.

## 2 · Bug-Check §9

**Nach Diff-Klasse skaliert (Vereinfachung 15.8.2026):**
- **Produkt-/Werkzeug-Diff** (`src/**`, `scripts/**`, `.github/**`, `vercel.json`,
  `package.json`): unabhängige Review-Agents über das Deploy-Delta — Code-Lupe
  + empirische vite-node-Repros (2 Agents); bei grossen Deltas «6 Strang-Finder
  × 2 adversariale Lupen». Bestätigte Befunde fixen, Regressionstests dazu,
  danach Tore aus Schritt 1 erneut.
- **Reiner Doku-/Plan-/Test-Diff** (`*.md`, `fahrplaene/`, `bibliothek/`,
  `.claude/`, `src/tests/**` ohne `src/lib`-Berührung): **kein** Agenten-
  Bug-Check — die Tore (`gate`, `check:plan`, `check:bibliothek`) sind die
  Prüfung; ein Bug-Check-Agent auf einem Doku-Diff ist Leerprüfung (15.8.:
  je ~40–80k Token für «keine Befunde»). Risikopfad-Anteile bleiben davon
  unberührt (Gegenprüfung ist eine andere Pflicht, unten).

## 3 · Serielle Landung — strikt der Reihe nach, EIN Kommando aufs Mal

1. **Landungs-Rolle ansagen — nur bei sichtbarer Parallel-Session.** Zeigt
   `plan:next` fremde Bau-Spuren (fremder wip, fremder Worktree/Branch, fremder
   offener PR auf gleicher Fläche), VOR Landungs-Beginn einen PR-Kommentar
   setzen («Landung übernommen — Session/Worktree <name>»); wer einen fremden,
   jüngeren Landungs-Kommentar sieht, merged NICHT. Im Ein-Session-Betrieb
   entfällt der Kommentar (Vereinfachung 15.8.2026: 12 Kommentare ohne Leser).
   *(Anlass 3./4.8.2026, drei Parallel-Sessions — Wortlaut: `referenz-ci.md`.)*
2. **Kollisionen sichten.** `gh pr list --state open` — prüfen, ob ein
   anderer offener PR dieselben Dateien/dasselbe Subsystem berührt
   (Doppelarbeit/Kollision). Bei Überschneidung: erst den anderen landen,
   dann diesen rebasen (Schritt 8). Nie zwei kollidierende PRs gleichzeitig.
   **Scharfer Auto-Merge ist keine Landung:** bei `mergeStateStatus: BEHIND`
   feuert er NIE von selbst — nach jeder main-Landung die verbleibenden
   Auto-Merge-PRs per `gh pr view <n> --json mergeStateStatus` prüfen und bei
   BEHIND `gh pr update-branch` fahren (Realfall #445, 5.8.2026: 16 h scharf,
   grün, kein Merge — Wortlaut: `referenz-ci.md`).
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
   **`cancelled`/`skipped` zählen als ROT** (Realfall 20.7.2026, 5 stumme
   `turso-sync`-Abbrüche). Einzige Ausnahme: ein **dokumentiert designter**
   konditionaler Skip, dessen Substanz anderweitig belegt ist — heute
   `Perf-Budget (§15 …)` auf `pull_request` und Vercel «Canceled by Ignored
   Build Step» (#445). **FEHLENDE Checks zählen als PENDING, nie als grün** —
   direkt nach einem Push die Präsenz der Kern-Batterie (Tore + Bau + letzter
   Playwright-Shard) verifizieren, sonst merged man ungeprüft (Realfall
   4./5.8.2026). **Ein Vercel-Rot mit echtem Build-Fehler bleibt Rot**; an
   landeintensiven Tagen die Kette seriell und ohne überflüssige
   Zwischen-Pushes fahren (jedes `update-branch` frisst einen App-Deploy).

   Sonderfälle — **kein `pull_request`-Lauf nach dem Push** (#414/#417,
   3.8.2026), Bewertung eines skipped/cancelled im Grenzfall, gerissenes
   **Vercel-Tageslimit**: Vorgehen und Vorfalls-Wortlaut in `referenz-ci.md`.

6b. **Bei Daten-/Extraktions-PRs: Identitätsbeleg.** Bevor neue Entitäten
   (Personen, Erlasse, Entscheide) live gehen, eine Stichprobe **n ≥ 10** gegen
   die **amtliche Quelle** prüfen und die Trefferquote im PR dokumentieren.
   Belege sind **Identitäts-Treffer mit Wortgrenze**, nie Substring-Präsenz.
   *Warum als eigener Schritt und nicht als Verweis: der Vorfall PR #309
   (unten, Risiko-Sperre) ist genau hier passiert.*

7. **Push + Merge = Deploy.** **Push ist stehend freigegeben** (Daueranweisung
   David 2.7.2026 «immer ja zum push»): keine gesonderte Push-Bestätigung
   einholen; Davids Deploy-/Merge-Verlangen deckt den Push mit ab. **Der
   Live-Gang-Entscheid ist die Freigabe zum Merge nach `main`.**

   **Jeder Push auf `main` ist ein Deploy — darum: Feature einzeln landen,
   Verwaltung bündeln (Auftrag David 15.8.2026, gilt für jede Session).**
   Direkte `main`-Pushes für Doku/Plan/Buchung/wip-Marker sind **verboten**
   (Hook `tor-schutz.py` blockt sie): Sie kosten je einen Vercel-Deploy UND
   lassen jeden offenen Auto-Merge-PR auf BEHIND fallen (= je ein weiterer
   Deploy pro Nachzug). Realfall 15.8.2026: ~15 Verwaltungs-Pushes rissen das
   Tageslimit, sechs fertige PRs standen stundenlang. Regel: Plan-Buchung
   und Status-Marker fahren **im Feature-Branch/PR** mit (Trailer, Ziff. 9);
   Doku, die keinen PR hat, wird **am Session-Ende in EINEM Push** gebündelt
   (Station E des Skills `bauschritt`) — oder als eigener kleiner PR. Der
   Ausnahmefall «Hand-Buchung nach stiller Auto-Buchung» gehört ebenfalls in
   den nächsten Sammel-Push, nicht sofort auf main.

   Falls noch kein PR existiert: `gh pr create …` (der Branch ist durch den
   Früh-Push aus Station A des Skills `bauschritt` bereits auf origin).
   Merge manuell: `gh pr merge <nr> --squash`. **KEIN `--auto`**, solange die
   Required Checks nicht neu gesetzt sind (David-Handschritt offen). Wo
   `--auto` zulässig ist (Daueranweisung 30.6.): **`--auto` ist der
   Deploy-Zünder — erst scharf machen, wenn die Schritte 0–2 komplett
   abgeschlossen sind.** Früh gesetzt merged (= deployt) es, sobald die CI
   grün ist, auch wenn lokale Tore noch laufen oder nie liefen. Grüne CI ist
   Merge-Voraussetzung, sie ERSETZT die Schritte 0–2 nicht.

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

7b. **Wächter für die Kette (Lehre F2h, 16.8.2026):** wer eine Landekette
   per Hintergrund-Wächter begleitet, baut ihn so, dass er (a) bei
   Risikopfad-Hand-Merges auf «alle Required grün» prüft (Required-Liste per
   `gh api repos/…/branches/main/protection/required_status_checks`), nicht
   auf `mergeStateStatus: CLEAN` — ein nicht-required roter Kontext (z. B.
   Vercel nach dem Limit) hält sonst alles stumm; (b) `DIRTY`/`UNKNOWN`
   länger als 2 Runden **laut meldet** statt zu warten; (c) nach 30 min ohne
   Zustandsänderung Stillstand meldet. Realfall 15./16.8.: 7 h kein Merge bei
   6 offenen, fertig geprüften PRs — bis David fragte.
8. **Nächste PR erst danach.** Erst wenn diese PR auf main ist, die nächste
   auf das neue main rebasen (zurück zu Schritt 1). So kollidiert nie eine
   zweite Landung mit einer schwebenden.

9. **Schritt-Status schliessen — wip verlässt die Session nie.** EINE
   Quelle (Vereinfachung 15.8.2026, §5 — vorher Commit-Trailer UND PR-Body,
   heute 2× still verloren, 3× nachgebessert): der Trailer-Block steht **im
   PR-BODY**, als eigener Absatz, beide Zeilen zusammen, unformatiert:
   ```
   Roadmap: <ID>
   Roadmap-Status: done|ready|parked(<token>)
   ```
   `plan-buchung.yml` liest ihn nach dem Squash-Merge aus dem PR (Standard-
   Squash-Text verliert Commit-Trailer ohnehin, PR #491); ein halber Block
   macht den Lauf laut rot (seit 15.8.). Ein zusätzlicher Commit-Trailer
   schadet nicht, ist aber keine Pflicht mehr. Fällt die Auto-Buchung aus
   (Branch-Protection, PAT offen): `plan:set <id> status=…` im nächsten
   PR/Sammel-Push (Ziff. 7 — kein direkter main-Push). Trailer-Form: Skill
   `auftrag` Ziff. 5; Vorfalls-Wortlaut: `referenz-ci.md`.

### Auto-Merge ist auf Risiko-Pfaden gesperrt

Auf Risiko-Pfaden (Extraktion, Rechnen, Norm-Tarif — Definition über
`istRisikoPfad()` in `scripts/gegenpruefung/kern.ts`) wird **erst nach
vorliegendem Gegenprüfungs-Verdikt** gemergt. `--auto` ist dort **ganz
gesperrt**: Es prüft nur den Stand beim Aktivieren, nicht den beim Mergen.
Das Verdikt braucht eine prüfbare Form **und** einen Zuwachs im committeten
Gegenprüfungs-Register — ein Trailer allein ist eine Behauptung, kein Nachweis.

Maschinelle Rückendeckung, dreifach: `check:merge-schutz` als Required-Check-Job
«Merge-Schutz» (ein entfernter Job hinterlässt einen «expected»-Block) ·
derselbe Check lokal im Hook `tor-schutz.py` vor jedem Merge-Kommando ·
`check:gegenpruefung` blockiert `npm run gate` ohne `bestanden`-Nachweis.

**Vorfall, der das erzwungen hat:** PR #309 — elf erfundene Amtsträger:innen
gingen rund eine Stunde auf Prod, weil der Verweis auf die Gegenprüfung beim
Abarbeiten der Liste übersprungen wurde.

### Ausnahmefall manueller Deploy · Ausreden-Tabelle → referenz-ausnahmen.md

Wer einen manuellen Deploy erwägt ODER sich bei einem Red Flag unten beim
Rationalisieren ertappt, liest ZUERST `referenz-ausnahmen.md` im Skill-Ordner —
die zwei Ausnahme-Prädikate und die belegten Ausreden stehen dort (ausgelagert
QS-EFFIZIENZ 14.8.2026, Wortlaut unverändert).

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

1. Prod-Deploy dem Merge-Commit zuordnen: im Actions-Lauf **des Merge-Commits
   auf `main`** muss der Job **«Deploy (Prod, Vercel CLI)»** grün sein — warten,
   bis er durch ist, nicht durch einen manuellen Deploy «beschleunigen».
   Gegenprobe von Hand:
   `curl -s https://lexmetrik.vercel.app/ | grep lexmetrik-build` muss den
   gemergten Kurz-SHA zeigen. Dieselbe Probe fährt der Deploy-Job seit
   17.8.2026 selbst als letzten Schritt (3 Versuche à 20 s für die
   Alias-Umschaltung, sonst rot) — ein grüner Job heisst also bereits «live».
   **Skipped ist hier NICHT grün:** fehlt der Job im Lauf, wurde nichts
   ausgeliefert (erwartbar nur bei `art=doku`). Realfall 15./16.8.2026: 7 Merges
   #519–#530 waren auf main, aber nie live (`git rev-parse --verify` log bei
   fehlendem Objekt) — den Fall fängt jetzt der Job selbst, zusätzlich der
   Wächter `pruefeBuildStand` im Prod-Smoke (#531). Historisch: bis 17.8.2026
   baute Vercel per Git-Integration; ein `Canceled by Ignored Build Step` auf
   einem Code-Commit war dort ROT. Diese Deploy-Art gibt es nicht mehr.
2. Asset-Hash live = lokal (index.html der Prod-URL gegen `dist/` des
   gemergten Stands).
3. Kernrouten auf HTTP 200: `/`, `/rechner/tagerechner`,
   `/rechner/zustaendigkeit`, `/rechner/verjaehrung`,
   `/rechner/mietrecht`, `/vorlagen`, eine Vorlagen-Detailroute.
   Prod-URL ist https://lexmetrik.vercel.app (eine Custom-Domain
   lexmetrik.ch existiert NICHT — Fehlversuch 5.8.2026, curl exit 6).
4. Lighthouse-Metriken (QS-PERF/§15): CLS/LCP/TBT auf `/gesetze/bund/OR`,
   Soll-Werte in `fahrplaene/FAHRPLAN-PERFORMANCE.md` — läuft automatisiert als
   `check:perf-lighthouse` nach dem Merge auf main (ci.yml; Faktenkorrektur
   7.8.2026). Manuell nur bei Verdacht zwischen zwei Läufen.
5. Aufräumen: gemergten Branch + zugehörigen Worktree entfernen
   (`git worktree remove …`, Branch lokal + remote löschen; Daueranweisung
   30.6.).
6. Session-Karte in `STRUKTUR.md` nachziehen (deployter Stand, Commit-Hash) —
   **Kurzkarte ist der Default**, Form und Ausnahmen: Skill `bauschritt`
   Station E; Pflicht: Skill `auftrag`, Ziff. 4.
