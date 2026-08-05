---
name: landung
description: Verwenden, wenn ein fertiger Feature-PR nach main gelandet werden soll — Trigger «landen», «Landung», «PR mergen», «einsammeln», «rebasen auf main», «Merge-Kette abarbeiten» — oder wenn mehrere offene PRs seriell nach main gebracht werden. Kodifiziert die serielle Landung + Merge-Treiber-Politik (§12) gegen wiederkehrende Konflikte.
---

# Serielle Landung eines PR nach main

Ziel: Konflikte paralleler PRs entschärfen, indem **EINE** PR aufs Mal
gelandet wird und generierte Dateien nie von Hand gemischt werden. Die
Deploy-Sorgfalt gilt weiterhin **vor** dem Merge (Skill `deploy-check`);
dieser Skill ist die Merge-Mechanik davor.

**Dieser Skill trägt §12** (Parallel-Sessions nur isoliert). Seit dem
A4-Umzug (25.7.2026) steht der Paragraph hier, `CLAUDE.md` §12 zeigt nur
noch hierher.

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
   HEAD-Worktree (Skill `deploy-check`).
4. **Merge-Treiber-Politik** (`.gitattributes`, aktiv pro Clone via `prepare` →
   `scripts/git-setup.sh`): Append-Register `merge=union`; generierte
   Projektionen (`daten-manifest.json`, `*.generated.ts`,
   rechtsprechung-Indexe) `merge=regen` — eigene Seite behalten, **Generator
   neu laufen lassen**. `golden/*.json` und `public/normtext/**` bewusst OHNE
   Treiber: dort SOLL der Konflikt anhalten (Byte-Orakel bzw. Drop/Leak).
   `rerere` ist aktiv. Die Treiber greifen nur bei **lokalen** Merges und
   Rebases, nie beim GitHub-Server-Merge.

---

## Ablauf

Voraussetzung einmal pro Clone/Worktree: `npm install` lief (setzt via
`prepare` → `scripts/git-setup.sh` den `regen`-Treiber + rerere). Sonst
`bash scripts/git-setup.sh` von Hand.

Strikt der Reihe nach, EIN Kommando aufs Mal, volle Ausgabe lesen:

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
   Schritt 3: ein vergessener Generator-Neulauf fällt als rotes `check:*` auf.

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
   *Warum als eigener Schritt und nicht als Verweis: PR #309 hat genau hier
   versagt — 11 erfundene Amtsträger:innen gingen ~1 h auf prod, weil der
   Verweis auf den Gegenprüfungs-Skill beim Abarbeiten der Liste übersprungen
   wurde. Maschinelle Rückendeckung: `check:merge-schutz` blockiert den Merge
   auf Risiko-Pfaden ohne Verdikt.*

7. **Manuell mergen.** `gh pr merge <nr> --squash`. **KEIN `--auto`**, solange
   die Required Checks nicht neu gesetzt sind (David-Handschritt offen).
   Danach Worktree/Branch aufräumen (`git worktree remove …`, Branch löschen).

8. **Nächste PR erst danach.** Erst wenn diese PR auf main ist, die nächste
   auf das neue main rebasen (zurück zu Schritt 1). So kollidiert nie eine
   zweite Landung mit einer schwebenden.
