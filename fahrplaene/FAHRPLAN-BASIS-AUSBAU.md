# FAHRPLAN — Basis-Ausbau LexMetrik (Fundament-Handlungsplan, Stand 17.7.2026)

> **Detailquelle zum ROADMAP-Querschnitt `QS-BASIS`** (§14.1) — nie zweiter Einstieg, immer
> nur verlinkte Detailquelle.

**Plan-Prinzip (Daueranweisung David, 17.7.2026, wörtlich):** «bauplan soll so aufgebaut sein,
dass handlungsschritte von meiner seite erst am schluss kommen und du alles baust was du kannst
ohne mich.»

**Umsetzung des Prinzips:** Dieser Plan ist in **zwei Blöcke** gegliedert — **§A Agent-baubar
ohne David** (die Bau-Reihenfolge, komplett autonom, terminkritischer Teil zuerst) und **§B
David-Schlussblock** (alle Beschaffungs-/Freigabe-Handschritte gebündelt ans Ende). Teilbare
Einheiten sind explizit gesplittet: der **baubare Anteil** (Dossier / Entwurf / Skript / Tor /
Vorbereitung) liegt in §A und wird jetzt gebaut; nur der **Handschritt** (Bestellung / Freigabe /
Kauf) wandert nach §B und wird am Schluss in ~30–45 Min in EINEM Block erledigt. Je Gate ist
notiert, **was danach noch zu VERDRAHTEN** bleibt (der kleine Rest-Bau nach dem Handschritt).

**Auftrag David (17.7.2026, wörtlich):** «überleg dir mit ultrathink und ultracode was ich
an der basis von lexmetrik verbessern kann offen und erstelle daraus handlungsplan».

**Methodik:** 5 Miner-Agenten (Vertrauen · Praxis · Burggraben · Ingenieur · Infra-Bestand,
read-only Repo-/Live-Erhebung 17.7.2026) → 3 Fable-Strategen (Wirkung÷Aufwand aus drei
Linsen) → **Fable-Judge** (Deduplikation gegen den Plan-Bestand nach §14, Priorisierung,
Verwerfung). Jede Kernaussage ist im Bestands-Anhang (§Quellen) belegt. Die Einordnung
folgt strikt §14: bereits geplante Flächen werden **nur referenziert, nie dupliziert**;
neu sind ausschliesslich die Fundament-Lücken ohne bestehende Schritt-ID.

**Leitplanke (Zeitsperre):** Alle Trust-/Nachweis-Posten bleiben **maschinell geprüft**,
nie «fachlich geprüft» — David hat bis ≥1.12.2026 keine Abnahme-Zeit
(`FAHRPLAN-LERNPHASE-2026.md`, Default-Abnahmewelle Feb 2027). Kein Posten fordert Fachzeit;
die David-Gates sind reine Beschaffungs-/Freigabe-Handschritte (fachzeit-arm).

---

## §A — Agent-baubar OHNE David (Bau-Reihenfolge, autonom)

*(Ebene 31.7.2026 von `#` auf `##` gehoben, Endprüfungs-Fund R2-17: `HEADING_RE` in
`scripts/fahrplan-slice.ts` erfasst `#{2,3}`. Als H1 fanden weder der Slicer noch das
mitgelieferte Inventar §A und §B — genau die zwei Zeiger, deren Satz lautet «wer nur ihn
slict, baut ohne die verbindlichen Einheiten». Probe nach der Hebung: beide lösen auf und
stehen im Inventar.)*

Diese Kette wird **jetzt** gebaut, in genau dieser Reihenfolge, je Einheit eigener Worktree + PR +
Auto-Merge. Terminkritisches zuerst (B-3 vor dem 1.8.-Berg). Kein Posten hier wartet auf David.

| Rang | Einheit (baubarer Anteil) | Warum hier | Handschritt-Rest → §B |
|---|---|---|---|
| A1 | **B-3** Bund-Currency-Kette prüfen/schliessen | **terminkritisch 1.8.** | — (kein Gate) |
| A2 | **B-5-Dossier** VPS-Bestell-Dossier + ROADMAP-Blocker-Zeile | entsperrt E3/E4-Beschaffung | Bestellung → G4 |
| A3 | **B-6** Stand-Ausweis in jeder Kopie/Export | reiner Trust-Fix, Rohstoff da | — |
| A4 | **B-8** Kantons-Currency-Wachhund + FR/IT-Label-Fix | Voraussetzung 26×-Glaubwürdigkeit | — |
| A5 | **B-11-Cron-Teil** Prod-Smoke + PR #244 + Rollback-Runbook | Prod heute unüberwacht | externe Sonde → G6 (opt.) |
| A6 | **B-1-Entwurf** DS-/Impressums-ENTWURF mit `[PLATZHALTER]` | volle Text-/Routing-Arbeit vorab | Name/Adresse → G1 |
| A7 | **B-2-Vorbereitung** Backup-Skript + Restore-Doku (Ziel offen) | existenzielles Skript vorab | Ziel/Zahlmittel → G2 |
| A8 | **B-10-Vorbereitung** ID-Inventar + Redirect-Tor + `/zitieren` | domain-neutral baubar | URL-Freeze nach Domain → G3 |
| A9 | **B-7** Determinismus-Nachweis auf `/methodik` | **nach B-3** (sonst Loch beweisen) | — |
| A10 | **B-9-Design** append-only Fassungs-Archiv (Mechanik) | Rohstoff-Sammlung ab heute | Scharfstellen nach B-2-Ziel → G2 |
| A11 | **B-12-Vorbereitung** Merge-Queue-Konfig vorbereiten | **nach QS-OPT O-3.2/O-3.3** | Aktivierung (G7 Kenntnisnahme) |

### A1 · B-3 · Bund-Currency-Kette vor dem 1.8.-Verfall-Berg  · **TERMINKRITISCH vor 1.8.** · kein Gate
**Kern:** Die fertige, ungemergte Bau-Einheit P1a/b (18 Pins überholt + Regex-Loch) macht «immer geltender
Stand» ggf. zum §8-Schein-Versprechen; zugleich werden per 1.8. Bundeserlasse fällig und `check:verfall`
ist rot-nah = Deploy-Hindernis für ALLE Arbeit.
> **Prämissen-Abgleich (17.7.):** Laut `FAHRPLAN-OPTIMIERUNG-2026-07.md` ist P1-a/b bereits als
> **QS-CURRENCY Paket 1 ✅ (PR #195, 0 stale)** gemergt — falls beim Bau bestätigt, verliert dieser Posten
> den akuten Merge-Teil und schrumpft auf den terminierten **Batch-Re-Pin (O-2.1)**. **Erste Aktion beim
> Bau: `check:fedlex-versionen` + `check:verfall` real laufen lassen und den Ist-Stand festnageln**, dann
> nur den offenen Teil bauen (nicht doppelt re-pinnen).
**Mechanik-Skizze:** P1a/b rebasen + mergen (falls noch offen) · dann `fedlex-repin-batch` (**O-2.1**, in
PR #259 unterwegs — Merge-Stand prüfen) mit Deadline ~25.7. ausführen — Reihenfolge zwingend, sonst
doppelte Re-Pin-Arbeit. Falls alles grün: **Beweis-Vermerk statt Blindbau**.
**Aufwand:** S–M + M · **Wirkung:** hoch · **Abhängigkeit:** terminkritisch vor 1.8.; Opus (Risikopfad);
Skill `scraping-swiss-official-sources`.
**DoD:** `check:fedlex-versionen` Exit 0 (0 stale); 1.8.-Fälle re-gepinnt; `check:verfall` grün mit Vorlauf.
Risiko-Pfad (Extraktion/Currency) → **`check:gegenpruefung` `bestanden`** verlangt.

### A2 · B-5-Dossier · VPS-Bestell-Dossier + expliziter Blocker-Schritt in ROADMAP  · **Handschritt → §B (G4)**
**Kern:** E3 (195k Entscheide) + E4 (8,7 Mio Zitat-Kanten) sind seit 3.7. lokal fertig und doppelt geprüft —
der einzige Blocker ist die VPS-Bestellung, die nur als Memory-Notiz lebt; VZUI-V2 «Zitiert-von» und die
gesamte Verzahnungs-Tiefe hängen daran. **Serving-Bau selbst ist QS-DATA** (E3/E4) — hier nur das Dossier.
**§A-Anteil (jetzt bauen):** fertiges Anbieter-Dossier (Hetzner/netcup/OVH gegen §6.3: ≥350 GB NVMe/≥32 GB
RAM, live-verifizierte Preise/Links, Setup-Plan OS/Sicherung/rsync-Ziel, Schritt-für-Schritt-Bestellanleitung)
· ROADMAP-Zeile «BLOCKER: VPS-Bestellung (David)» unter QS-DATA. **Synergie:** derselbe VPS kann
Backup-Zweitziel (B-2) sein.
**§B-Anteil (Handschritt G4):** David bestellt den VPS (~15 Min).
**Aufwand:** S · **Wirkung:** hoch (entsperrt 3 Baustränge) · **Abhängigkeit:** keine.
**DoD:** Dossier liegt (≥2–3 Anbieter gegen §6.3 verglichen, Bestell-Links); Blocker-Zeile in ROADMAP/QS-DATA
sichtbar. E3-Serving bleibt QS-DATA, kein Duplikat hier.

### A3 · B-6 · Stand-Ausweis in JEDER Kopie und JEDEM Export  · kein Gate
**Kern:** Die Zitat-Kopie (`ArtikelBody`/`EntscheidBody`) liefert «Art. X Abs. Y OR» ohne Fassungs-/Abrufdatum
— anwaltlich unvollständig und bei der nächsten Revision eine Falle in der eigenen Akte.
**Mechanik-Skizze:** Zitat-Kopie, Print-Kopf und Rechner-PDF um «Fassung vom [fassungsToken] · abgerufen am
[Datum] · Permalink» ergänzen; Rohstoff (`currency.json`, Register-Stand) liegt vollständig vor. Bereitet
**M16 datenseitig vor** statt es zu duplizieren (kein M16-Vorgriff auf die Darstellung).
**Aufwand:** S · **Wirkung:** hoch · **Abhängigkeit:** keine (Permalink-Teil profitiert von B-4).
**DoD:** jede Kopie/jeder Export trägt Fassung + Abrufdatum + Permalink; golden byte-gleich (§6); da die
Kopie-Fläche an den Norm-/Tarif-Pfad grenzt → **`check:gegenpruefung`** prüfen, ob der Diff Risiko-Globs trifft.
> **Status 17.7.2026: B-6 ✅ (#275).** Stand-Ausweis in 5 Zitat-Kopie-Pfaden via `lib/format` `standAusweis()`;
> Vorlagen-Fusszeilen deklariert unberührt, golden byte-gleich.

### A4 · B-8 · Kantons-Datenwahrheit: Currency-Wachhund für 1231 Erlasse + FR/IT-Sprach-Label-Korrektur  · kein Gate
**Kern:** `currency.json` deckt exakt die 227 Bund-Kürzel — kantonale Revisionen (inkl. BS mit 859 Erlassen =
Kernbestand) veralten still ohne je rot zu werden; zusätzlich sind GE/VD/TI/JU/NE-Erlasse falsch als sprache
«de» getaggt (de=1467, fr=2) — für jeden Romandie-Anwalt ein sofortiger Glaubwürdigkeitsbruch.
**Mechanik-Skizze:** `geprueftAm`/`version_uid`-Mechanik analog Bund (BS+AR tief, Rest Sonde) in
`normen-monitor.yml` · Label-Prüfung je betroffenem Erlass · Register-Tor gegen künftiges Fehl-Labeling ·
ehrlicher `/abdeckung`-Ausweis. **Tranchen-schonend, LexWork-API-freundlich.**
**Aufwand:** M (+S) · **Wirkung:** hoch (Voraussetzung 26×-Glaubwürdigkeit) · **Abhängigkeit:** keine;
Vorbedingung für jeden weiteren Kantons-Ausbau.
**DoD:** kantonale Staleness wird rot; Sprach-Labels je betroffenem Erlass korrekt; Register-Tor fängt
künftiges Fehl-Labeling. Daten-/Extraktions-Nähe → Skill `scraping-swiss-official-sources` + `check:gegenpruefung` prüfen.

### A5 · B-11-Cron-Teil · Prod-Watchdog: Synthetic-Smoke + PR #244 + Rollback-Runbook  · **externe Sonde → §B (G6, optional)**
**Kern:** `normen-monitor` überwacht die QUELLEN, niemand überwacht die eigene PROD — Runtime-Fehler sind
unsichtbar, der CSP-Fresser (`entscheidsuche.ch` fehlt in `connect-src`) liegt verifiziert noch OPEN in PR #244,
und ein Rückweg für kaputte Prod-Stände ist nirgends dokumentiert.
**§A-Anteil (jetzt bauen):** GitHub-Cron-Workflow nach `normen-monitor`-Muster (Kernrouten 200+Inhalt,
`api/suche`-Status, CSP-Deckung, Sitemap; Issue bei Rot) · externe-Sonde-**Vorbereitung** (Konfig-Datei/Doku,
läuft auch ohne Konto) · PR #244 mergen · Rollback-Runbook (`vercel rollback`) + Env-Var-Inventar in
`docs/betrieb/` bzw. `BETRIEB.md`. **PR-#244-Bestand nutzen, nicht duplizieren.**
**§B-Anteil (Handschritt G6, optional):** externes Gratis-Monitor-Konto (UptimeRobot o. ä.).
> **Abgleich:** überlappt mit QS-OPT **O-1** (Prod-Smoke, CSP-Fix, `/api/fehler` = O-1.9). **Nicht daneben
> bauen:** prüfen, was O-1 abgedeckt hat, nur Delta ergänzen. `/api/fehler` (O-1.9) hängt später hier ein.
**Aufwand:** S · **Wirkung:** mittel–hoch · **Abhängigkeit:** keine.
**DoD:** Prod-Smoke-Cron meldet Rot als Issue; externe Sonde vorbereitet (aktiv oder dokumentiert entfallen);
PR #244 gemergt (CSP-Loch zu); Rollback-Runbook + Env-Inventar dokumentiert.
> **Status 17.7.2026: B-11 ✅ (#273).** Prod-Smoke 12 Checks grün, 6h-Cron, Runbooks.

### A6 · B-1-Entwurf · Datenschutz-/Impressums-ENTWURF mit `[PLATZHALTER]`  · **Freigabe → §B (G1)**
**Kern:** Live und indexierbar steht «[Name und Adresse … wird ergänzt]» in der Datenschutzerklärung,
und es gibt keine Impressums-Route — die Seite hat keine benannte verantwortliche Stelle. Billigster,
höchstwirksamer Trust-Fix im ganzen Bestand.
**§A-Anteil (jetzt bauen):** vollständiger DS-/Impressums-ENTWURF mit `[PLATZHALTER Name/Adresse]`-Markern ·
Vercel-AVV-Absatz finalisieren (Agent-Recherche, kein Fachrecht) · Route vorbereitet, aber **unverlinkt oder
mit «Entwurf»-Banner**; §8-Status `entwurf`.
**§B-Anteil (Handschritt G1):** David gibt Name/Zustelladresse frei + wählt Impressums-Form.
**Was danach zu VERDRAHTEN:** Platzhalter durch echten Namen ersetzen, Banner entfernen, Route verlinken (~5 Min Rest-Bau).
**Aufwand:** S · **Wirkung:** hoch. Reine Text-/Routing-Änderung, kein Risiko-Pfad → `Gegenpruefung: n/a`.
**DoD (§A):** Entwurf vollständig, Platzhalter klar markiert, §6-/§9-Tore grün, keine falsche «benannte Stelle»
suggeriert (Banner). Kein Platzhalter-freier Live-Stand ohne G1.

### A7 · B-2-Vorbereitung · Off-site-Backup-Skript + Restore-Probe-Anleitung  · **Ziel/Zahlmittel → §B (G2)** · Verankerungs-Kandidat #1
**Kern:** Der gesamte Rohdaten-Steinbruch (`bger.parquet` 785 MB, `normtext.db` 173 MB, alle DBs)
existiert exakt einmal auf Davids Mac — gitignored, null Backup-Treffer in DATENHALTUNG/BETRIEB; ein
SSD-Tod vernichtet Monate E3/E4-Arbeit, und der Rebuild-Pfad hängt selbst an den ungesicherten Parquets.
**§A-Anteil (jetzt bauen):** Backup-Skript (restic/rclone verschlüsselt, Ziel als **`[GATE-2]`-Konfig-
Platzhalter**) · launchd-Wochenjob-Vorlage · Restore-Proben-Anleitung in `BETRIEB.md` · **lokales
Sofort-Backup auf zweite lokale Platte FALLS vorhanden** (prüfen, nicht annehmen).
**§B-Anteil (Handschritt G2):** David wählt Backup-Ziel + hinterlegt Zahlmittel (B2/Hetzner Storage Box).
**Was danach zu VERDRAHTEN:** Ziel-Konfig eintragen, EINE Restore-Übung real ausführen + protokollieren (~15 Min).
**Aufwand:** S–M · **Wirkung:** existenziell · **Abhängigkeit:** keine (Skript sofort; Scharfstellung nach G2).
**DoD (§A):** Skript + Restore-Anleitung liegen; Ziel als Platzhalter; lokales Zweitplatten-Backup geprüft/ausgeführt
falls Platte da. Betriebs-Skript, kein Rechts-/Rechen-Pfad.

### A8 · B-10-Vorbereitung · Permalink-Beständigkeits-Vertrag + Daten-Contract (domain-neutral)  · **URL-Freeze nach Domain → §B (G3)**
**Kern:** Zitierfähigkeit ist technisch stark gebaut, aber ohne dokumentiertes Beständigkeits-VERSPRECHEN ist
ein Link für den Anwalt kein Zitat sondern ein Risiko; wer zuerst stabile dokumentierte CH-Rechts-IDs (ELI-treu,
BGE-Keys) anbietet, wird Referenz-Infrastruktur.
**§A-Anteil (jetzt bauen):** stabile-ID-Inventar · URL-/ID-Schema als eingefrorenes Commitment dokumentieren ·
`schemaVersion` in Registern · Tor `check:permalink-stabilitaet` (Golden-URL-Liste → 200/301, Alt-Pfad→Neu-Pfad-
Redirect-Testinfrastruktur) · kurze **domain-neutrale** `/zitieren`-Seite. **KEIN API-Server** (wäre Feature, VPS-gegated).
**§B-Anteil (Handschritt G3):** Domain `lexmetrik.ch` registrieren (B-4).
**Was danach zu VERDRAHTEN:** finalen Host in die eingefrorene URL-Basis eintragen; der eigentliche URL-Umzug
bleibt **SEO-A11Y W3.4** (dort gebaut, nicht hier duplizieren).
**Aufwand:** S–M · **Wirkung:** hoch (langfristig stärkste Distributions-Achse) · **Abhängigkeit:** URL-Freeze NACH B-4.
**DoD (§A):** ID-/URL-Schema dokumentiert; `schemaVersion` in Registern; Redirect-Tor grün; `/zitieren`-Seite live
(domain-neutral).

### A9 · B-7 · Öffentlicher Qualitäts-/Determinismus-Nachweis («Prüfstand»-Block auf `/methodik`)  · kein Gate · **nach B-3**
**Kern:** Golden-Gates, `check:gegenpruefung` und Manifest-SHAs sind nirgends nutzer-sichtbar — `/methodik`
behauptet Determinismus nur qualitativ, und weil «geprüft»-Badges bis Feb 2027 leer bleiben MÜSSEN, ist der
maschinelle Beleg die einzige jetzt auszahlbare Vertrauens-Währung.
**Mechanik-Skizze:** build-generierter Block «X Golden-Fälle byte-identisch · Y Tore grün · Z Erlasse gegen
Fedlex-Version geprüft am [Datum]» — bewusst **«maschinell geprüft», nie «fachlich geprüft»** (zeitsperren-konform).
**Aufwand:** S–M · **Wirkung:** hoch (Differenzierung ggü. jedem LLM-Produkt, G1-Gespräche) ·
**Abhängigkeit:** **nach B-3** (sonst beweist man ein Loch).
**DoD:** Block auf `/methodik` zeigt build-aktuelle Zahlen; Wortlaut «maschinell geprüft»; golden byte-gleich.

### A10 · B-9-Design · Fassungs-Archiv ab sofort (append-only), besonders Kantone  · kein Gate · **NACH B-2-Ziel scharf**
**Kern:** M16 (Point-in-Time-Darstellung) ist geplant und gegated, aber der ROHSTOFF entsteht nur durch
Sammeln ab heute — Bund ist via Fedlex-ELI rekonstruierbar, kantonale Alt-Fassungen sind es oft NICHT; jeder
Monat ohne Archiv ist unwiederbringlich verlorene Historie = reinstes unbackfillbares Burggraben-Asset.
**Mechanik-Skizze:** bei jedem Monitor-Lauf/Re-Pin die alte Fassung datiert nach `daten/archiv/` legen
(gitignored, via B-2 gesichert) — **kein UI, keine Darstellung** (dupliziert M16 NICHT).
**Aufwand:** M · **Wirkung:** hoch (zeitbasiertes Asset, physisch nicht nachholbar) · **Abhängigkeit:**
Design/Mechanik jetzt baubar; **scharf NACH B-2-Ziel** (sonst archiviert man auf denselben Single-Point-of-Failure); Synergie mit B-8.
**DoD:** jeder Re-Pin/Monitor-Lauf legt die abgelöste Fassung datiert nach `daten/archiv/`; von B-2 mitgesichert;
keine Darstellungsänderung.

### A11 · B-12-Vorbereitung · GitHub Merge Queue vorbereiten  · **Aktivierung G7 (Kenntnisnahme)** · **ZULETZT, nach O-3.x**

> **⛔ STAND 3.8.2026 — GEGENSTANDSLOS, nicht mehr bauen.** Der Schritt `QS-BASIS-MQ` ist am
> 3.8.2026 auf **David-Entscheid (Verzicht)** gestrichen: GitHub bietet Merge Queues nur für
> **Organisations-Repos** an, LexMetrik liegt auf dem persönlichen Account (Ruleset-API 422 beim
> Aktivierungsversuch nach #421). Absicherung ist stattdessen `strict: true` (aktiv seit 3.8.) +
> serielle Landung nach Skill `landung`. **A11, B-12 und das Gate G7 unten sind damit hinfällig**
> und bleiben nur als Beschreibung stehen, falls das Repo je in eine Organisation wandert. Der
> `merge_group`-Trigger in `ci.yml` schadet ohne Queue nicht und bleibt. Begründung:
> `ROADMAP-CHRONIK.md` → Streichungen 3.8.2026.

**Kern:** Parallel-Agenten-Sessions sind der Arbeitsmodus, aber es gibt nur Auto-merge ohne serialisiertes
Gating — `strict=false` heisst: PRs mergen gegen veralteten `main`, Race-Merges können still Semantik brechen
(Memory-Lektion git/Parallel-Sessions); die Queue ist der Multiplikator der Agenten-Fabrik.
**§A-Anteil (jetzt vorbereiten):** Queue-Konfig + Required-Check-Zuordnung dokumentieren/skripten; Kompatibilität
`gh pr merge --auto` belegen; QS-TOK-Kopplung (CI-Läufe/Kosten) notieren. Erhöht CI-Läufe pro Merge → **bewusst LETZTER Posten**.
**§B-Anteil (G7, Kenntnisnahme):** Aktivierung per `gh api` — Davids OK genügt.
**Abhängigkeit:** **NACH QS-OPT O-3.2 (Flake-Wurzel) + O-3.3 (Sharding)** — sonst verstopft die Queue.
**DoD:** Konfig vorbereitet + O-3.2/O-3.3 als Voraussetzung belegt; Aktivierung wartet auf grüne O-3.x + G7.

#### Status-Log · 17.7.2026 — B-12-Vorbereitung erledigt (mit O-3.3)

**Gebaut (branch `feat/o33-e2e-sharding`, lokal):** `merge_group`-Trigger in `.github/workflows/ci.yml`
eingebaut (schadet ohne Queue nicht) + Tore-Split für O-3.3 (Jobs `tore` → `e2e` [3 Shards] → `perf`).
Damit ist der Workflow queue-fähig; die **Aktivierung bleibt David-Gate G7**.

**⚠ Zwangs-Begleitschritt aus dem Job-Split (unabhängig von der Queue):** Bisher deckte der EINE Required Check
`Tore (tsc · Tests · Lint · Build · Checks)` alles ab (er enthielt e2e + perf). Nach dem Split sind e2e/perf
**eigene Checks**. Aktueller Stand Branch-Protection `main`: required = `Tore …` + `Vercel`, `strict=false`.
→ **Sobald dieser Branch auf `main` ist, blockieren rote e2e/perf-Läufe NICHT mehr den Merge**, bis die neuen
Checks als required ergänzt sind. Das ist Teil desselben ~10-Min-Handschritts.

**David-Anleitung (~10 Min, G7 — Reihenfolge einhalten):**
1. **Required Checks ergänzen** (Settings → Branches → Rule `main` → *Require status checks*): Kontexte seit dem
   CI-Umbau 26.7.2026 — `Tore (Tests · Lint · Checks)`, `Browser-Smoke Shard 1/8 (Playwright)` … `… Shard 8/8 …`,
   `Vercel`, `Merge-Schutz (Required-Kontext)`. Perf ist NICHT mehr required (läuft nur noch auf main/merge_group;
   auf PRs wäre der Kontext dekorativ, GitHub wertet skipped als erfüllt). Erst NACH einem
   ersten grünen Lauf erscheinen neue Kontexte in der Auswahl-Liste.
2. **Merge Queue einschalten**: dieselbe Rule → *Require merge queue* anhaken (Default-Settings genügen). Die Queue
   fährt CI auf `merge_group`-Events — genau dafür der neue Trigger. Ohne Schritt 1 hätte die Queue nichts zu warten.
3. **`strict` (up-to-date) prüfen**: Die Queue testet jeden PR gegen den frisch serialisierten `main`, darum wird
   das heutige `strict=false` (Race-Merge-Risiko, Memory-Lektion git/Parallel-Sessions) durch die Queue selbst
   entschärft — `strict` kann auf `false` bleiben; die Queue ist der Serialisierer.
4. **Auto-merge bleibt kompatibel**: `gh pr merge --auto` reiht bei aktiver Queue nur ein statt sofort zu mergen —
   Daueranweisung «Auto-merge bei grüner CI» gilt unverändert. `concurrency: ci-${{ github.ref }}` isoliert
   Queue-Läufe (eigene ref) von PR-Läufen; kein Umbau nötig.
5. **Kosten-Notiz (QS-TOK):** Die Queue erhöht CI-Läufe pro Merge (Test-gegen-serialisierten-main); der O-3.3-Split
   (dist einmal bauen + Shards parallel) hält die Wanduhr je Lauf niedrig und dämpft das ab — darum ist B-12
   bewusst der LETZTE Posten und erst NACH O-3.3 sinnvoll.

**Rollback:** *Require merge queue* wieder abhaken; Workflow bleibt gültig (der `merge_group`-Trigger feuert dann
nie). Kein Code-Rückbau nötig.

---

## §B — David-Schlussblock (alle Handschritte gebündelt, ans Ende)

**NUR David, fachzeit-arm, empfohlen als EIN gebündelter ~30–45-Min-Block.** Alles Beschaffung/Freigabe,
**keine fachliche Abnahme.** Jeder §A-Baustein oben ist so gebaut, dass er OHNE diese Schritte fertig und
grün ist; die Gates schalten nur den jeweils letzten Verdrahtungs-Rest scharf.

| # | Handschritt | Aufwand | entsperrt §A-Einheit | danach noch zu VERDRAHTEN (Rest-Bau) |
|---|---|---|---|---|
| G1 | **Name/Zustelladresse für Datenschutzerklärung freigeben + Impressums-Form wählen** (eigene Seite oder in `/ueber` konsolidiert) | ~2 Min | B-1-Entwurf (A6) | Platzhalter→echter Name, «Entwurf»-Banner weg, Route verlinken (~5 Min) |
| G2 | **Backup-Speicherziel wählen + Zahlmittel hinterlegen** (Backblaze B2 oder Hetzner Storage Box, ~1–6 €/Mt; Alt. externe SSD) | einmalig ~15 Min | B-2-Vorbereitung (A7) + B-9-Design (A10) | Ziel-Konfig eintragen, EINE Restore-Übung real + protokollieren, Archiv-Ziel scharf (~15 Min) |
| G3 | **Domain `lexmetrik.ch` registrieren** (~15 CHF/Jahr) + Vercel-DNS bestätigen (F1.1; `BETRIEB.md` «NOCH NICHT registriert») | ~15 Min | B-10-Vorbereitung (A8) → dann B-4 | finalen Host in URL-Basis eintragen; URL-Umzug = SEO-A11Y W3.4 (dort) |
| G4 | **VPS bestellen** (≥350 GB NVMe / ≥32 GB RAM, ~25–50 €/Mt, Hetzner/netcup/OVH; Dossier aus A2 liegt vor) | ~15 Min | B-5-Dossier (A2) | E3-Serving-Bau = QS-DATA (dort); kann Backup-Zweitziel (G2) sein |
| G5 | **Turso-Env-Vars in Vercel setzen** (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`; bestehendes Gate QS-DATA) | ~10 Min | fertige Edge-Suche `api/suche` (55k Artikel + 342 BGE), heute ehrlicher 503 | — (Suche schaltet sofort live) |
| G6 | *(Optional)* **Monitor-Konto anlegen** (UptimeRobot o. ä., gratis) für externe Uptime-Sonde | ~5 Min | externe-Sonde-Teil von B-11 (A5) | Sonden-URL/Token in vorbereitete Konfig (~5 Min); GitHub-Cron läuft auch ohne |
| G7 | *(Nur Kenntnisnahme)* **Merge-Queue-Aktivierung auf `main`** (B-12) — Setting per `gh api`, Davids OK genügt | 0 | B-12-Vorbereitung (A11) | Aktivierungs-`gh api` ausführen (nach grünem O-3.2/O-3.3) |

Spätere Gates (nicht in diesem Panel): Kantonswahl Pilot-Ausbau (default-bar ZH) · Bezahl-Tiers/Login
(geparkt, Markt-Thema) · fachliche Abnahme-Welle (zeitgesperrt bis ≥1.12.2026, Default Feb 2027 — nicht drängen).

---

## §0 · Zweck

Detailquelle zu `QS-BASIS` und `QS-AUTOMATIK` — was an der Basis von LexMetrik
verbessert werden kann. **Plan-Prinzip (Daueranweisung David, 17.7.2026, wörtlich):**
«handlungsschritte von meiner seite erst am schluss» — **§A Agent-baubar ohne
David** (autonome Bau-Reihenfolge) + **§B David-Schlussblock** (Freigabe-/
Beschaffungs-Handschritte gebündelt ans Ende), je Gate mit VERDRAHTEN-Rest notiert.

---

## §Verworfen (mit Grund)

### Schon geplant mit ID — nur referenzieren, NICHT neu aufnehmen (§14)
- **E3/E4-Serving-Architektur** → QS-DATA / W2·6-DATA; hier nur der Beschaffungs-Entscheid als B-5.
- **CI-Sharding** → QS-OPT O-3.3; **e2e-Flake-Wurzel / `waitForTimeout`-Abbau** → O-3.2 (harte Reihenfolge).
- **M15 (DE/FR/IT-Verlinkung) + M16 (Point-in-Time-Darstellung)** → `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` B3,
  AKN-gegated; B-6/B-8/B-9 sind bewusst nur die S/M-grossen **Vorstufen** ohne Duplikat.
- **SEO-A11Y-Ausbau** → eigener Schritt SEO-A11Y (Domain-UMZUG dort als W3.4; B-4 ist nur der Registrierungs-Entscheid).
- **Fall-Rückgrat / Fristenbuch / Mandat / Arbeitsmappe** → `archiv/FAHRPLAN-FALL-RUECKGRAT.md` (Archiv-Welle 31.7.2026), strategisch geparkt
  bis ≥1.12.2026 — nicht vorziehen (die Unverzichtbarkeits-Schicht, aber Parkung auf Nutzerfeedback vertretbar,
  solange B-1…B-10 stehen).
- **`/api/fehler`-Rückkanal** → O-1.9 offen; nur Anhebung, hängt in B-11 ein statt Neu-Posten.
- **Turso-Live-Paritäts-Sonde** → O-1.6 · **Live-API-Vertragstests** → O-1.8 · **BGE-Currency-Sonde** → O-2.3 (alle geplant).
- **Turso-Env-Vars** → existiert bereits als David-Handschritt (QS-DATA) — kein neuer Posten, nur ins
  David-Gates-Bündel (G5) aufgenommen.
- **`fedlex-repin-batch`** → O-2.1 existiert; in B-3 nur terminlich angehoben, kein Duplikat.
- **Redesign-zurückgestellt** → in W2·5c/STARTSEITE-V3 aufgegangen (done); Memory-Status überholt.

### Inhaltlich verworfen
- **CI-Auto-Rerun-Workflow** — maskiert Flake-Symptome und konkurrenziert die geplante Wurzelheilung
  O-3.2/O-3.3; Brücke bleibt das dokumentierte manuelle `gh run rerun --failed`, Aufwand fliesst besser in O-3.2.
- **Main-Härtung `enforce_admins`/`strict=true`** — `strict=true` kollidiert mit der Starvation-Lage bis
  O-3.x/B-12; der werthaltige Teil (Rollback-Runbook + Env-Inventar) ist in B-11 aufgegangen.
- **Hosting-Limit-Erhebung + Payload-Budget-Tor** — erst vor dem nächsten Kantons-Breiten-Ausbau
  entscheidungsrelevant; kein solcher Ausbau aktiv geplant, S-Erhebung dann als Vorschritt dort.
- **Kantons-Extraktions-Schablone / Pilotkanton ZH** — L-Aufwand mit Ausbau-Charakter, nicht Basis; erst NACH
  B-8 (Currency) + B-9 (Archiv) sinnvoll, dann eigener ROADMAP-Schritt mit David-Kantonswahl.
- **Änderungs-Feed «Was hat sich geändert»** — Distributions-Feature, nicht Fundament; billiges Abfallprodukt
  ERST wenn B-8 (Kanton-Wachhund) steht, dann eigene Initiative.
- **Kantons-Ausbau in der Breite** — Content/Feature, nicht Basis (Praxis-Linse bestätigt).

---

## Bau-Go-Status

**§A wird autonom gebaut** (Prinzip oben: alles ohne David zuerst), je Einheit eigener Worktree + PR +
Auto-Merge, in der §A-Reihenfolge A1→A11. **§B ist Davids Schlussblock** (G1–G7, ein ~30–45-Min-Beschaffungs-/
Freigabe-Bündel am Ende) — jede §A-Einheit ist so gebaut, dass sie ohne ihr Gate fertig und grün ist; das Gate
schaltet nur den letzten Verdrahtungs-Rest scharf. Risiko-Pfade (B-3 Currency/Extraktion, B-6/B-8 wo Norm-/
Kopie-Fläche berührt) IMMER Opus + `check:gegenpruefung`.

---

## §Quellen (Bestands-Anhang — read-only erhoben 17.7.2026, zusammengefasst)

Belegbasis der Miner-Erhebung (Repo `~/Developer/LexMetrik`, branch `main`). Kein Wortlaut, nur die tragenden Befunde:

**Hosting/Betrieb (Infra-Miner):** Vercel-Projekt «lexmetrik», Deploy = Git-Push auf `main` (kein CI-Deploy-Gate).
**Keine eigene Domain** im Repo — Prod unter `lexmetrik.vercel.app` (→ B-4). Genau EINE Edge-Function `api/suche.ts`
(dependency-frei, Turso-HTTP), **heute inaktiv** mangels Env-Vars → ehrlicher 503, Fallback statischer Client-Index
(→ G5). CSP `default-src 'self'` solide, aber **LiveSuche POSTet auf `entscheidsuche.ch`, das nicht in `connect-src`
steht** → «CSP frisst Feature», gefixt in **PR #244 (Merge-Status offen)** (→ B-11). Build-Payload dist/ 251 MB /
public/ 197 MB, innerhalb Vercel-Static-Limits; die 7,5-GB-Massendaten laufen bewusst nie im Vercel-Build.

**CI (Infra-Miner):** EIN Monolith-Job «Tore» auf 2-Kern-Free-Runner, 16 Schritte sequenziell, kein Sharding/
Merge-Queue. `concurrency` pro Ref (nicht global) → parallele PRs konkurrieren um dieselben Runner. e2e 39 Specs,
auf CI seriell (`workers:1`) wegen CPU-Aushungerung; **live belegt** (gh run list 16./17.7.): nahezu jeder Code-PR-
Lauf FAILURE bei 20–36 min, No-op-Doku-Zwilling grün in ~40–60 s = flaky Starvation (→ O-3.2/O-3.3 vorausgesetzt für
B-12). `normen-monitor.yml` wöchentlich, prüft Quellen, legt Issue bei Rot — überwacht aber **nie die eigene Prod** (→ B-11).

**Lokale Daten-Risiken (Infra-Miner — höchstes Einzelrisiko):** `daten/` gitignored → alle DBs existieren **nur auf
Davids Mac**. Bestand lokal 6,9 GB (`normtext.db` 173 MB / 55 822 Artikel / 1458 Erlasse, `rechtsprechung.db` 39 MB,
`daten/poc/` 6,7 GB inkl. `bger.parquet` 785 MB / `bge.parquet` 140 MB / `citations.parquet` 49 MB). `masse.db` (E3)
aktuell **nicht mehr als fertige DB lokal** — reproduzierbar aus poc/-Parquet, aber die Parquets selbst sind
**ungesichert**. **Kein Backup-Konzept in DATENHALTUNG/BETRIEB** (→ B-2, B-9).

**Vertrauen/Praxis/Burggraben (Strategen-Linsen):** Datenschutzerklärung mit Live-Platzhalter «[Name und Adresse …
wird ergänzt]», kein Impressum (→ B-1). `currency.json` deckt nur die 227 Bund-Kürzel, kantonale Staleness unsichtbar +
FR/IT-Erlasse als «de» fehl-getaggt (de=1467, fr=2) (→ B-8). Golden-/Determinismus-Nachweise nicht nutzer-sichtbar (→ B-7).
Zitat-Kopie ohne Fassungs-/Abrufdatum (→ B-6). Permalink technisch stark, aber ohne Beständigkeits-Versprechen (→ B-10).
E3/E4 seit 3.7. lokal fertig, einziger Blocker VPS-Bestellung als blosse Memory-Notiz (→ B-5).

---

## §1 · ROADMAP-Spec QS-AUTOMATIK (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «§A — Agent-baubar OHNE David» (A1–A11) dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  **Gebündelt aus zwei Befunden vom 20.7., weil sie dieselbe Prüf-Fläche und dieselbe Risiko-Klasse haben**
  (Tor-/Automatik-Logik, kein Rechtsinhalt) — §14.2. Der Anlass ist die **zentrale Lektion des 20.7.:**
  *ein Tor, das sich gegen die eigene Ladung prüft, ist kein Tor* — dreimal an einem Tag aufgetreten
  (Turso-Sync→Marke→Wächter · selbst-attestierter Gegenprüfungs-Trailer · Hook-Probe mit selbstgebautem
  stdin). Dieser Querschnitt hält die Gegenfrage dauerhaft offen: **läuft die Automatik, und würde sie
  scheitern können?**
  - **a · Zwei tote Workflows** (gefunden von `waechter.yml`, sofort beim ersten Lauf):
    **`normen-monitor.yml` — letzter Erfolgslauf 22.6.2026, seither failure/cancelled, also ~4 Wochen
    still tot.** **`fedlex-frische.yml` — jüngster Lauf failure.** Der zweite wiegt schwerer, als er
    aussieht: er ist der benannte **Ersatz-Arbiter für neun nur-lokale Tore** — solange er rot ist,
    **läuft deren Allowlist-Begründung leer** (s. `QS-BASIS`, Tor-Parität 16/36). Erst diagnostizieren,
    dann fixen; nicht raten.
    - **a′ · `normen-monitor.yml` — Ursache diagnostiziert (20.7.2026, doppelt verifiziert, Beleg
      CI-Run `29727448005`).** Der Monitor ist seit 29.6. rot; die **aktuelle** Ursache liegt in
      `check:netz`/Kanonik-Arbiter: **`chemrrv`** (SR 814.81, `eli/cc/2005/478`, Konsolidierung
      `20260716`, gepinnt 16.7.) zeigt auf die **nicht-kanonische** Revisions-Wurzel `html-0`,
      kanonisch ist `html-1`. **Reparatur (offener Bau-Schritt, NICHT im reinen Doku-Schritt
      ausgeführt):** Re-Pin nur für `chemrrv` via `scripts/fedlex-repin-kanonik.ts` → Snapshot-
      Regeneration über den Generator → **Inhalts-Treue-Diff** (gleiche Konsolidierung ⇒ substanziell
      identischer Text; ~31 mehrspaltig-Tabellenblöcke stichprobenhaft) → dann `workflow_dispatch` des
      Normen-Monitors als Echt-Beweis. **Dringlichkeit:** die Rechtsstand-Wache ist bis zur Reparatur
      faktisch **blind**, weil das Dauer-Rot jede neue Drift maskiert. **Risiko-Klasse abweichend von
      der DoD dieses Querschnitts:** dieser Re-Pin ist ein **Extraktions-Risikopfad** (Fedlex-Snapshot,
      berührt `scripts/fedlex-*`/`public/normtext/**`) ⇒ **`QS-GP`-Gegenprüfung Pflicht, kein
      Auto-Merge vor Verdikt** (§14.4) — anders als die reine Workflow-Plumbing-Arbeit unter a/b. Die
      Re-Pin-Mechanik teilt sich mit **`QS-CURRENCY`** (Korpus-Pflege) und **`QS-OPT` O-2** (Batch-
      Re-Pin vor dem 1.8.-Berg); der `chemrrv`-Fix ist deren terminnahes Geschwister, wird aber hier
      geführt, weil er den Monitor entsperrt.
  - **b · Turso-Wächter-Abdeckung ausdehnen.** `check:turso-frische` (aus #313) prüft vierfach
    (Struktur · Vollständigkeit gegen Soll-Zahlen · `manifest_sha` · Alter) — offen bleibt: **wo überall**
    geprüft wird, eine **Laufzeit-Prüfung in `api/suche`** (der Ausfall vom 20.7. war im Betrieb
    unsichtbar: ein halber Gesetzesindex und **null** Entscheide, ohne je rot zu werden), ein definierter
    **Alarmpfad** (wer erfährt es, wie?) und **Wachstums-Schwellen** (Budget-Ist 652/1024 MiB = 64 %;
    ab welchem Füllstand wird gewarnt, bevor der Sync an die Wand fährt?).
  **Leitplanke für JEDE Massnahme hier (aus derselben Lektion):** das neue/erweiterte Tor gegen eine
  **unabhängige** Referenz prüfen und seine **Scheiterns-Fähigkeit an einem ECHTEN Aufruf** belegen —
  nicht an einer Nachbildung mit selbstgebauter Eingabe (CLAUDE.md §6 Ziff. 7).
  **DoD:** beide Workflows nachweislich wieder grün **mit protokollierter Ursache** (nicht durch Rerun
  grün gemacht) · `check:ci-laeufe` grün · Alarmpfad dokumentiert. Die Workflow-/Tor-Plumbing-Anteile
  (a/b) sind **reine Prüflogik ⇒ golden byte-gleich, `Gegenpruefung: n/a`**; der `chemrrv`-Re-Pin (a′)
  ist die **Ausnahme** — Extraktions-Risikopfad ⇒ eigener Commit mit `QS-GP`-Verdikt, kein Auto-Merge.
  Trailer `Roadmap: QS-AUTOMATIK`.

---

## §2 · ROADMAP-Spec QS-BASIS (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «§A — Agent-baubar OHNE David» + «§B — David-Schlussblock» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.*

  Kritik-gefilterte Ablage des Ultracode-Fundament-Research (Auftrag David 17.7.2026: «was ich an der
  Basis von LexMetrik verbessern kann»; 5 Miner + 3 Fable-Strategen + Fable-Judge, dedupliziert gegen den
  Plan-Bestand nach §14). Detailquelle **`FAHRPLAN-BASIS-AUSBAU.md`** — 12 B-Einheiten (Wirkung÷Aufwand):
  **B-1** Betreiber-Identität (DS-Platzhalter + Impressum) · **B-2** Off-site-Backup + Restore-Probe für
  `daten/` (6,9 GB, heute **null Backup** = höchstes Einzelrisiko) · **B-3** Bund-Currency-Kette vor dem
  **1.8.-Verfall-Berg** (terminkritisch; Prämisse P1-a/b evtl. schon ✅, vor Bau festnageln) · **B-4** Domain
  `lexmetrik.ch` registrieren (Entscheid; Umzug bleibt SEO-A11Y W3.4) · **B-5** VPS-Bestell-Dossier +
  Blocker-Zeile (Serving = QS-DATA) · **B-6** Stand-Ausweis (Fassung/Abruf/Permalink) in jeder Kopie/Export ·
  **B-7** öffentlicher Determinismus-Nachweis auf `/methodik` (maschinell, nie fachlich) · **B-8**
  Kantons-Currency-Wachhund + FR/IT-Sprach-Label-Fix · **B-9** append-only Fassungs-Archiv (nach B-2) ·
  **B-10** Permalink-Beständigkeits-Vertrag (nach B-4) · **B-11** Prod-Watchdog (Delta zu QS-OPT O-1, +
  PR #244) · **B-12** Merge Queue (zuletzt, nach O-3.2/O-3.3).
  **Neu strukturiert (Daueranweisung David 17.7. «handlungsschritte von meiner seite erst am schluss …
  du alles baust was du kannst ohne mich»):** Plan in **§A Agent-baubar ohne David** (autonome Bau-Reihenfolge
  A1→A11: B-3→B-5-Dossier→B-6→B-8→B-11-Cron→B-1-Entwurf→B-2-Vorbereitung→B-10-Vorbereitung→B-7→B-9-Design→
  B-12-Vorbereitung) + **§B David-Schlussblock** (G1–G7 gebündelt am Ende, ~30–45-Min-Beschaffungs-/Freigabe-Block,
  je Gate notiert was danach noch zu VERDRAHTEN bleibt). Teilbare Einheiten gesplittet: Dossier/Entwurf/Skript/Tor
  = §A (jetzt), Bestellung/Freigabe/Kauf = §B. **§A wird jetzt autonom gebaut** (je Einheit Worktree+PR+Auto-Merge);
  Trailer `Roadmap: QS-BASIS`.

### QS-BASIS · §14-Intake 20.7.2026 (a)–(d) im Wortlaut (verschoben 31.7.2026)

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026). Die ROADMAP führt*
*den Posten seither als Einzeiler; der Wortlaut unten ist die massgebliche Fassung.*

>   **§14-Intake 20.7.2026 (David):** (a) **Turso-Wächter-Abdeckung** — alle relevanten Stellen prüfen, gekoppelt an die Tor-Echtheit (Wächter gegen UNABHÄNGIGE Grösse, nicht gegen die Sync-Marke; `cancelled`/`skipped` zählen als rot — Auslöser `turso-sync.yml` timeout-minutes: 20). (b) **CI-Fehlläufe** (#30) — Referenz auf Worktree `lm-ci`, hier NICHT duplizieren; Playbook-Eintrag «CI-Starvation» ist WIDERLEGT (Queue-Wartezeit 0,0–0,3 min über 10 Läufe gemessen), Kostentreiber sind Reruns (~72 % der Wanduhr). (c) **CI/lokal-Tor-Parität** — `check:seriell` fährt 36 Tore, CI 11; `check:tor-paritaet` friert die Lücke ein, das Schliessen ist offen. **Stand 20.7.2026 (PR `docs/bau-fundament`): 16/36 in CI** (Detail: `ROADMAP-CHRONIK.md` → QS-BASIS). Rest-Lücke 20 Tore, davon 9 mit Ersatz-Arbiter `fedlex-frische.yml` — **dessen Lauf ist rot (#37), solange das gilt, läuft diese Begründung leer.** (d) **Datenhaltungs-Optimierung** *(§14-Intake David 20.7.2026; im ersten Intake-Durchgang verloren gegangen und durch die adversariale Prüfung von PR #315 wiedergefunden — Nachtrag 20.7.)*: **inkrementeller Sync** (nicht bei jedem Lauf den Vollbestand schieben) · **contentless-FTS** (`content=''` statt external content, wo der Rohtext schon im Serving-Store liegt) · **Index-Strategie** (welche Spalten tragen die realen Query-Pfade aus `api/suche`) · **Heiss/Kalt-Gate** (was gehört in die 1-GB-Turso-Replika, was bleibt kalt) · **Korpus aus git ausgliedern (R6)** — gemessen 20./21.7.2026 als **moderate Kosten** (git status 25–80 ms, CI shallow; real: ~400 MB je Worktree-Checkout, 273 MB Pack, minimaler Churn) ⇒ **kein Dringlichkeits-Fall**, Vorstufe/Teil dieses serverlosen Korpus-Serving-Vorhabens, nicht als isolierter git-Eingriff (Detail `FAHRPLAN-DATENHALTUNG.md` §12.4). Detailquelle `FAHRPLAN-DATENHALTUNG.md`; Bau-Strang W2·6-DATA (E4-Nachbarschaft). Kein eigener FAHRPLAN.

---

## §3 · Kind-Schritte aus dem §14-Intake 3.8.2026 (`QS-AUTOMATIK-BERICHT`, `QS-BASIS-TOT`, `QS-BASIS-DEPS`)

*Angelegt 3.8.2026 (Bauplan-QS). Anlass jedes Schrittes steht in `ROADMAP.md`; hier steht,*
*was zu bauen ist und woran eine fremde Session erkennt, dass sie fertig ist.*

### §3.1 `QS-AUTOMATIK-BERICHT` — Wächter-Zustandsbericht + Verwaiste-Worktree-Sonde

**Fusioniert 3.8.2026** aus den zwei getrennt aufgenommenen Schritten `QS-AUTOMATIK-BERICHT`
(Übersicht) und `QS-AUTOMATIK-WT` (Worktree-Sonde) — dieselbe Datei, dieselbe Risiko-Klasse.

- **Zu bauen:** ein Unterbefehl in `scripts/check-ci-laeufe.ts`, der zwei Abschnitte ausgibt.
  **(a) Wächter-Zustand:** je Workflow in `.github/workflows/` der letzte Lauf mit Ergebnis,
  Datum und **Alter in Tagen** — ein Wächter, der seit Wochen nicht lief, ist so sichtbar wie
  einer, der rot ist. **(b) Verwaiste Worktrees:** für jeden Eintrag aus `git worktree list`
  den Diff des zugehörigen Branches gegen `origin/main`; ist er **leer**, wird der Worktree als
  «gelandet, nicht abgeräumt» gemeldet. **Erweitert 3.8.2026 (Bau-Evaluation):** dieselbe Sonde
  gleicht auch Branches **ohne** Worktree (lokal wie `origin/*`) gegen die offenen PRs ab
  (`gh pr list`) und meldet Worktrees ausserhalb des Repo-Verzeichnisses (Scratchpad-Pfade
  beendeter Sessions). Ist-Befund der Evaluation: 9 Worktrees, 6 Feature-Branches — die manuelle
  Rest-Inventur (Aufräum-Disziplin 27.7.2026) skaliert nicht über parallele Sessions; dieser
  Befehl macht sie mechanisch, dieselbe Bewegung wie beim Plansystem (Regel → Werkzeug).
- **Fertig, wenn:** der Befehl beide Abschnitte liefert, ein künstlich angelegter leerer
  Worktree **einmal rot** erscheint (§6.7 — die Sonde muss scheitern können) und die
  Zustandsliste gegen `gh run list` stichprobenweise stimmt.
- **Nicht hier:** das Reparieren einzelner Workflows (das war PR #419, `QS-AUTOMATIK`) und
  Wachstums-Schwellen der Turso-Wächter (bleibt am Dach-Schritt `QS-AUTOMATIK`).
- **Risiko-Klasse:** reine Prüflogik ⇒ `Gegenpruefung: n/a`.

### §3.2 `QS-BASIS-TOT` — `check:tot` blockierend bei NEUEN Meldungen

- **Zu bauen:** `--no-exit-code` aus dem knip-Aufruf entfernen und eine **deklarierte
  Basislinie von 1 Meldung** setzen (`SkalaEintrag`, begründetes Falsch-Positiv). Jede weitere
  Meldung macht das Tor rot.
- **Fertig, wenn:** ein absichtlich eingefügtes totes Symbol das Tor **einmal rot** zeigt und
  nach Entfernen wieder grün; die Basislinie ist im Repo begründet, nicht bloss gesetzt.
- **Anlass-Beleg:** die Totcode-Welle PR #418/#420 senkte knip von 162 auf 1 Meldung — erst
  dadurch ist eine harte Schranke überhaupt tragbar.
- **Risiko-Klasse:** reine Prüflogik ⇒ `Gegenpruefung: n/a`.

### §3.3 `QS-BASIS-DEPS` — Dependency-Frische

- **Zu bauen:** (a) `npm audit` als **Meldung, nie Stopper** in den Wächter-Bericht (§3.1)
  einhängen; (b) die knip-Unlisted-Funde `playwright` und `react-router` sauber deklarieren;
  (c) offene Major-Sprünge einzeln bewerten, nicht sammeln.
- **ACHTUNG Lockfile:** jede Änderung an `package-lock.json` nur über `npx npm@10` — das lokal
  installierte npm 11 erzeugt eine CI-inkompatible Lockfile-Fassung.
- **Fertig, wenn:** Audit-Ausgabe läuft ohne Exit-Code-Wirkung, knip meldet kein Unlisted mehr,
  und je Major-Sprung steht ein Ja/Nein mit Begründung.
- **Abgrenzung:** der Geparkt-Entscheid «Betriebs-Instrumente später» betrifft nur die
  **Stopper**-Variante; die Meldungs-Variante ist genau dieser Schritt.

### §3.4 `QS-BASIS-DOKU-CI` — Doku-Kurzpfad auch für main-Pushes (David-Entscheid)

*Angelegt 3.8.2026 (Bau-Evaluation). Blocker-Slug: `david-entscheid-doku-kurzpfad-main`.*

- **Anlass:** fünf `docs(plan)`-Pushes auf `main` liefen am 3.8.2026 je ~15 Minuten Voll-CI
  (u. a. Läufe 20:29 / 19:55 / 19:36). Der PR-Kurzpfad (`art=doku`, ci.yml Diff-Klassierung)
  kürzt reine `.md`-Diffs bereits auf Minuten ab — greift aber bewusst nur bei `pull_request`.
- **Der Entscheid (darum blockiert):** ci.yml begründet ausdrücklich, dass `push` und
  `merge_group` nie klassiert werden — «ein Deploy-Stand wird nie nach Dateiendungen
  abgekürzt». Diesen Grundsatz für den Fall «reiner `.md`-Diff auf `main`» zu lockern, ist
  ein Sicherheits-Trade (weniger Prüfung auf dem Deploy-Stand gegen täglich ~75 gesparte
  CI-Minuten bei aktueller Plan-Commit-Frequenz) und liegt bei David.
- **Zu bauen (nach Freigabe):** die bestehende Klassierung auf `push`-Events ausweiten. Bei
  push liefert `git diff --name-only` des Push-Bereichs die Dateiliste (der API/`changed_files`-
  Abgleich des PR-Wegs entfällt); im Zweifel — force-push, leerer Bereich, Sonderzeichen —
  immer Volllauf. **Keine zweite Workflow-Datei** (die `ci-doku-noop.yml`-Falle ist im
  ci.yml-Kopf dokumentiert). Prüfungen, die `.md`-Inhalte wirklich lesen (`check:plan`,
  ggf. `check:bibliothek`), bleiben im Kurzpfad **echt** — das ist Teil des Baus, nicht
  Verhandlungsmasse.
- **Fertig, wenn:** ein reiner `.md`-Push auf einem Test-Branch nachweislich im Kurzpfad
  läuft, ein gemischter Push den Volllauf **einmal** gezeigt behält (§6.7), und der
  ci.yml-Kopf den gelockerten Grundsatz samt David-Entscheid-Datum dokumentiert.
- **Risiko-Klasse:** reine CI-/Prüflogik ⇒ `Gegenpruefung: n/a`.
