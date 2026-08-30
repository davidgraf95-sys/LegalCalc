# Landung — Referenz: Ausnahmefall und Ausreden-Tabelle

<!-- Wortlaut unverändert aus SKILL.md ausgelagert (QS-EFFIZIENZ 14.8.2026,
     Skill-Diät: lädt nur bei Bedarf — Trigger stehen im Skill). -->

### Einzige Ausnahme — manueller Deploy

Nur wenn GENAU EINES dieser zwei beobachtbaren Prädikate erfüllt ist (oder
beide):

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
| «Für den Deploy gibt es den Skill `deploy-check` — den lade ich.» | Seit 8.8.2026 (QS-SKILL-DIAET) hier aufgegangen; dieser Skill ist der einzige Landungs-/Deploy-Text. |
| «§9 nennt selbst ‹Prod: npx vercel --prod› — der Handschritt ist gedeckt.» | Diese alte Prod-Zeile wurde am 17.7.2026 gestrichen; Weg 1 «Merge = Deploy» ist der einzige verbindliche Pfad. Wer sich an ‹npx vercel --prod› erinnert, erinnert einen Altstand. |
| «Die Gegenprüfung lief, ich habe den Trailer gesetzt — `--auto` kann scharf.» | Auf Risiko-Pfaden ist `--auto` ganz gesperrt, und ein Trailer ohne Registerzuwachs ist eine Behauptung, kein Nachweis. Vorfall PR #309. |
| «Doppelt hält besser — ein zusätzlicher vercel --prod aus sauberem Worktree schadet nicht.» | Doppel-Deploy = Race. Der langsamere Build überschreibt den korrekten; bei HEAD ≠ origin/main geht ein falscher Commit live. |
| «Die GitHub-CI ist grün — das ersetzt die lokalen Tore, ich kann --auto schon mal setzen.» | Grüne CI ist Merge-Voraussetzung, nicht Ersatz für Schritte 0–2. `--auto` vor Abschluss von 0–2 = unkontrollierter Prod-Deploy bei nächstem grünen CI-Lauf. |
| «David hat nur den Deploy verlangt, den Push nicht wörtlich — also Push einzeln bestätigen lassen.» | Push ist stehend freigegeben (2.7.2026); die Einzel-Nachfrage ist abgeschafft. «Bring das auf Prod» deckt Push + Merge. |
| «Der /tmp-Worktree schützt vor dem Hochladen von untracked Ballast.» | Der Git-Deploy baut nur Committetes — untracked erreicht Vercel gar nicht. Die echte Gefahr ist versehentliches Committen (Schritt 0.3). |
| «Nur ein flakiger Test rot / fast grün — mergen und nachbessern.» | Bewusste Grenze (Schritt 7): nichts mergen, was Tore rot lässt oder nicht doppelt verifiziert ist. |


## Buchstabe = Geist — Umgehungs-Aufzählung (Umzug 31.8.2026 aus SKILL.md)

Ein zweiter Prod-Deploy-Pfad, der «technisch kein `vercel --prod` ist»
(z. B. `vercel deploy --prebuilt`, `vercel promote` bzw. der Dashboard-Klick
«Promote to Production» auf einem Preview-Deploy, das Vercel-MCP-Tool
`deploy_to_vercel`, ein Redeploy-Klick im Dashboard), ist derselbe verbotene
racende Doppel-Deploy. Den Buchstaben umgehen heisst den Geist verletzen.
