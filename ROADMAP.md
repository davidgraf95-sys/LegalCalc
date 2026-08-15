# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Die einzige Steuerungsquelle:** Reihenfolge + bau-jetzt vs. geparkt. Das *Wie* je Strang steht
> in der jeweiligen `fahrplaene/FAHRPLAN-*.md` (Detailquelle), der **Ist-Zustand/Deploy** in
> `STRUKTUR.md`, die G1-Praxis-Abdeckung in `KATALOG-ROADMAP.md`. Die Phasen-Ordnungs-Sicht
> `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` ordnet diese ROADMAP, ersetzt sie nicht.
>
> **Schritte nennen Ziel und Grenzen, nicht den Weg** (Vereinfachungs-Auftrag David 14.8.2026):
> verbindlich sind das Ziel, die Risiko-Klassierung und die genannten harten Auflagen — Reihenfolge
> im Schritt, Werkzeugwahl und Umsetzungsweg entscheidet die bauende Session selbst.

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Nimm den obersten offenen Schritt** (`npm run plan:next`); blockierte/`[D]` überspringen.
2. **Halte die Leitprinzipien** (unten) — Worktree bei Datei-Kollision (§12).
3. **Gate vor Abschluss:** `npm run gate` grün; verhaltensändernd ⇒ Golden byte-gleich.
4. **Markiere erledigt** (`plan:set … status=done`), Session-Karte in `STRUKTUR.md` nachziehen.
   Push/PR/Auto-Merge stehend freigegeben (§9: Merge nach `main` = Deploy; Sorgfalt VOR dem Merge).
   Commit-Trailer immer `Roadmap: <@meta id>`.
5. **Nur was steuert, bleibt hier.** Erledigt-Prosa wandert wörtlich in die
   [`ROADMAP-CHRONIK.md`](ROADMAP-CHRONIK.md); Spec-Prosa neuer Schritte entsteht im zugehörigen
   Fahrplan (hier nur Titel, `@meta`, 1–2 Sätze Ziel, `**Detail:**`-Link). Streichungen tragen eine
   Begründungszeile in der Chronik. Grössen-Wächter: `struktur-rotieren.py --check`
   (Ceiling 100 KB — reisst er, wird verschoben, nie gehoben).

---

## So sieht das Taschenmesser aus (Produktvision)

**LexMetrik ist DIE EINE Anlaufplattform für alle Rechtsanwender** *(Nordstern geschärft, David
3.7.2026)* — Kanzlei, Gericht, Inhouse, **Steuerbehörden, Ämter/Verwaltung, Notariate, Treuhänder**,
Studierende — um **das Schweizer Recht zu konsultieren und damit zu arbeiten.** Ein vielseitiges
Werkzeug, zu dem man zuerst greift; **alles auf amtlichen Quellen** (Fedlex, amtliche
Entscheid-Sammlungen, amtliche Tarife/Materialien — Art. 5 URG, urheberrechtlich frei),
**deterministisch gerechnet statt KI-geschätzt.**

Die «Klingen» (= die Informationsarchitektur):

- **Konsultieren.** Gesetze (Volltext + amtliche Systematik, **mehrsprachig DE/FR/IT zum
  Vergleich**) · Rechtsprechung (BGE/BGer-Korpus, amtliche Regesten) · amtliche Materialien
  (Botschaften/BBl) · **Gesetzgebung/Rechtsetzung** (was kommt: Vernehmlassung/Parlament/AS-BBl) · **Verwaltungsverordnungen/amtliche Praxis** (Kreisschreiben ESTV/BSV/FINMA/SEM, Weisungen, Merkblätter, Rundschreiben — Etappe E6a, Detail `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §5).
- **Rechnen.** Die deterministischen Klingen: Fristen · Streitwert · Prozesskosten · Verzug/
  Forderung · Zuständigkeit/Rechtsweg · Verjährung · Beurkundung · Gründungen — jeder Wert mit
  Norm + Link + Stand.
- **Verzahnen (der Burggraben).** **Norm → Werkzeug → Schriftsatz** und zurück: vom Artikel in
  den passenden Rechner/Entscheid, vom Rechen-Ergebnis in den kopierfertigen Begründungs-Absatz.
  Und quer über den ganzen Korpus: **Norm ↔ Entscheid ↔ Material ↔ Verwaltungsverordnung** — ein
  Kreisschreiben zeigt, welche Norm es auslegt; ein Entscheid, welchen Artikel er anwendet; eine
  Botschaft hängt am Gesetz; von jedem Artikel zu allem, was ihn betrifft, und zurück. **Dieselbe
  Graph-Struktur, nicht vier Silos — das Organisationsprinzip des gesamten Datenausbaus**
  (Architektur `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §0/§0bis/§1; Etappen E4/E5/E6), nicht nur der Rechner-Achse.
- **Finden (der Griff).** Eine Auffindbarkeits-Schicht: zweiachsiger Einstieg (Rechtsgebiet ×
  Aufgabe) + globale Suche → die richtige Klinge in einem Klick.

Universell, nicht in Personas-Schubladen: dieselben Klingen dienen allen; einzig die Verpackung
(Einstiege, Erklär-/Übungs-Layer) variiert. **Geparkt:** Dossier-/Mandatsverwaltung — alle
Werkzeuge bleiben **strikt zustandslos** (rechnen/drucken/ICS, keine Persistenz von Falldaten).

**Verzahnung als Rückgrat (Organisationsprinzip, kein Einzelfeature):** die tragenden Schritte dieses
Plans sind Glieder EINES Graphen (Norm ↔ Entscheid ↔ Material ↔ VerwVO) — das kann kein einzelnes
Amtsportal, darum ist die Verzahnung Burggraben UND das Einsortierungs-Kriterium für neue Schritte
(§14: neue Doktypen docken an den Graphen an, nie als Silo). *Ehrliche Grenze: Plan-Doktrin, kein
maschinelles Tor.* Glieder-Aufzählung und Code-Bestands-Inventar (kontext.ts/KontextPanel/norm-index):
`fahrplaene/FAHRPLAN-DATENHALTUNG.md` §0bis.

---

## Leitprinzipien (gelten immer)

1. **Amtliche Quellen, urheberrechtlich frei.** Inhalte ruhen **nur** auf amtlichen Werken
   (Art. 5 URG): Fedlex/kantonale amtliche Sammlungen, amtlich publizierte Entscheide + Regesten,
   amtliche Tarife/Verzeichnisse/Formulare, Botschaften/BBl. **Keine Kommentare/geschützte
   Sekundärliteratur.** Funktion, die das bräuchte ⇒ verwerfen oder auf amtliches Surrogat bauen.
2. **Mehrwert-Test (§0).** Nur bauen/behalten, was echten Mehrwert über generische Werkzeuge
   liefert (sonst streichen + in `KATALOG-ROADMAP.md` begründen).
3. **Zeitsperre bis 1.12.2026.** Nur Arbeit, die (a) **keine Davids-Fachzeit** braucht `[OF]`
   und (b) die spätere Abnahme-Welle billiger macht. Kein `verified`/`geprüft` ohne David
   (§7/§8). `[D]` = geparkt, in der Abnahme-Warteschlange (nicht drängen). G1-Gespräche ab Feb 2027.
4. **Nie zwei 26×-Datenassets gleichzeitig offen** — eine Säule fertig führen. Die sechs 26×-Assets — **fertig gebaut + aus dem Slot entlassen**
   (Abnahme ausstehend): Notariat-Grundbuch · Beurkundungs-Ausbau (entlassen 2.7.2026); **offen,
   Reihenfolge = @slot-kette-Kommentar unten:** BGer-Massenkorpus (QS-DATA E3) · Gesetze-Import-3Tier
   (W3·12) · Prozesskosten-Cockpit (W1·4-Rest) · Kantonale-Entscheide (E5). *Ein P0-Bugfix an einem Asset ist kein Daten-Bulklauf und **öffnet den
   26×-Slot nicht**.*
5. **Worktree-Isolation (§12)** bei Datei-Kollision: FUNDAMENT-UMBAU ⟂ VORLAGEN-AUSBAU ⟂
   VERTRAGS-VARIANTEN ⟂ Startseiten-Rahmen (`App.tsx`/`startseiteConfig.ts`/`vorlagenRegistry`);
   SEO-A11Y (`register.json`/`seo.ts`/`prerender.ts`/`vercel.json`).
6. **Merge nach `main` ist der Deploy (§9, stehend freigegeben — Sorgfalt VOR dem Merge);** jeder
   verhaltensändernde Schritt golden-gegated (§6). **§1 (Logik vor allem) / §5 (eine Quelle)** sind
   Invarianten über allen Wellen. **Zustandslosigkeit** (kein Dossier-Creep) ist Querschnittsregel.
7. **Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust** (David 30.6.2026, Wortlaut in
   **CLAUDE.md §15**): bei Konflikt gewinnt **immer die Treue**; jede Optimierung trägt eine explizite
   Logikverlust-Bewertung. Tor `check:perf-budget` → `QS-PERF` / `fahrplaene/FAHRPLAN-PERFORMANCE.md`.

**Verifikations-Blockaden (einmal definiert, danach nur referenziert):**
- **§4 — Lizenz/CORS für Live-Rechtsprechung** (CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits
  unbestätigt) → Rechts-/Lizenzbeurteilung = **`[D]`**. Solange offen: ENTSCHEIDSUCHE-P1 &
  KANTONALE-P1-Adapter **geparkt**. Nicht-§4-blockierte Korpus-/Übersichtsarbeit ist ausgenommen.
- **Prozesskosten I2** — die Recherche zu Schlichtungs-/Reduktionsfaktoren ist `[OF]` und **Teil von
  `W1·4`** (Entparkung 3.8.2026, David): sie ist der erste Arbeitsschritt des Schrittes, kein Wartegrund.

<!-- @blockers
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
vps-bestellung-david: E3-Serving + E4-UI hängen an einer VPS-Bestellung (David, ~15 Min; Entscheid David 8.8.2026: «mach ich erst wenn UI noch optimierter wird» — bewusst zurückgestellt, nicht vergessen) — Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md` (PR #271). ECHTES David-Gate, kein Bau-Blocker. Bis dahin sind QS-DATA/W2·6-DATA nur im NICHT-VPS-Teil baubar (E0–E4 sind lokal fertig). Befund 20.7.2026: dieser Blocker stand bisher NUR im Fliesstext («🔒 BLOCKER»), das @meta trug `blocker: null` — für `check:plan` unsichtbar.
richter-analytik-gate: Richter-/Spruchkörper-Analytik (W3·15-RICHTER). GRENZE (20.7.2026): Filtern/Facette/Verlinkung sind FREI und gebaut (#309/#311); gesperrt bleiben allein RANKING und PROGNOSE. Nur deskriptiv; bewusste Freigabe Davids erforderlich (heikel: Standesrecht, Persönlichkeitsschutz, richterliche Unabhängigkeit)
zeitreihe-5-snapshots: QS-AUTOPILOT-STUFE1 ist von David freigegeben (Entscheid 7.8.2026 «stufe 1 ja»), aber an die Mindestdatenlage gebunden: erst bauen, wenn messwerte/selbstopt-zeitreihe.json ≥ 5 Snapshots trägt (retro:17-Schwelle — darunter sind Vorschläge statistisch nicht belegbar). Prüfbar: npm run retro:17 meldet die Datenlage selbst
david-freigabe-hooks-ausbau: ERLEDIGT — Freigabe David 14.8.2026 im Chat («alle hooks freigegeben»); Eintrag bleibt als Beleg, Bindung ist gelöst.
david-entscheid-org-umzug: QS-ORG-UMZUG — Repo-Transfer in eine Gratis-Organisation für die native Merge Queue (User-Konten haben keine); Infrastruktur-Entscheid mit ~1 h Nacharbeit (Vercel, Branch-Schutz, Secrets). Erst prüfen, ob der Auto-Nachzug (Checklisten-Zeile unter QS-AUTOMATIK) den BEHIND-Schmerz ausreichend dämpft (Entscheid David 7.8.2026: «B als Schritt, A parken»)
-->

<!-- @david-fragen
zgb-a36-anhang: Die ZGB-Gliederung zeigt 74 Artikel des Anhangs «Wortlaut der früheren Bestimmungen des sechsten Titels» bewusst NICHT (Alt-Kuration A36; es sind aufgehobene Alt-Fassungen, im Lesetext weiterhin vorhanden und verlinkbar). Deine Vorgabe 13.8. («Artikel-Ebene in allen Gesetzen») ist sonst korpusweit erfüllt. Sollen diese 74 Alt-Artikel AUCH in der Leiste erscheinen? Aufwand: eine Zeile. Empfehlung: Nein (Alt-Recht bläht die Navigation, Lesetext deckt es ab).
-->
<!-- ^ Offene Fragen an David OHNE eigenen blockierten Schritt (sonst gehören sie in @blockers).
     Das Lagebild liest diesen Block mechanisch (davidFragen, scripts/plan/bildDaten.ts) —
     beantwortete Fragen HIER löschen, dann verschwinden sie von der Seite (§5; Umzug aus dem
     Generator-Code 8.8.2026, dort waren sie eine hartkodierte zweite Wahrheit). -->

<!-- @slot-kette (dokumentarisch; harte Prüfung via @meta-Feld `slot: inhaber`, check.ts 5b)
inhaber: W3·12 (Kanton-Gesetze, übergeben 20.7.2026 — E3 war seit 3.7.2026 fertig, der Slot nur nie zurückgegeben)
kette: ~~E3(W2·6-DATA) ✅ 3.7.2026~~ · W3·12(Kanton-Gesetze) ← JETZT · Tarif-Bündel(W1·4) · E5(Kanton-Rechtsprechung, W2·6-DATA) · Gerichtsferien-Matrix
begruendung-uebergabe: E3 ist gebaut (195 342 Entscheide, 2 Voll-Läufe determinismus-gleich, Gegenprüfung bestanden) ⇒ Leitprinzip 4 «eine Säule fertig führen» erfüllt. Der offene E3-**Serving**-Rest ist KEIN Massenimport, sondern hängt am David-Gate `vps-bestellung-david` — er rechtfertigt keine Slot-Bindung. Nächstes Kettenglied ist laut Kette W3·12 (Davids Reihenfolge-Entscheid 2.7.2026, `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §10(1)); W1·4 wäre falsch (26x: nein — der frühere Zusatzgrund «eigener Blocker `wbqdyap3x`» ist mit der Entparkung vom 3.8.2026 entfallen).
uebergabe: nur per explizitem `plan:set <id> slot=inhaber`-Commit; check:plan erzwingt höchstens EINEN Inhaber (muss 26x: ja)
-->

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  <!-- @meta id: LERNPHASE-AB · status: ready · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, src/tests, scripts/gegenpruefung] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  trägt sichtbaren ehrlichen Status + Stand; Golden-Abdeckung & Norm-Anker-Prüfung automatisieren.
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §1.
- **Adversariale Gegenprüfung — Restkampagne + Werkzeug-Härtungen** *(QS-GP, `[OF]`)* — offen ist
  <!-- @meta id: QS-GP · status: ready · blocker: null · dep: [] · kollision: [scripts/gegenpruefung, .claude/skills/gegenpruefung, bibliothek/register, scripts/prerender.ts, package.json, scripts/git-setup.sh, scripts/check-gegenpruefung.ts, src/lib/rechtsprechung/besetzung, scripts/normtext/entscheide-schreiben.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  Baustein d (rückwirkende Kampagne, Stufen 2–3 + BGE-Korpus-Regenerierung).
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §2.
  - [ ] `check:prerender-golden` als Opt-in-Beweiswerkzeug (nicht im Pflicht-Gate) — der Seiten-Byte-Gleichheits-Beweis ist heute Handarbeit. §3.2.
  - [ ] Verdikt-Prüfung vor dem Push (lokaler pre-push-Hook) — spart den 11-Minuten-CI-Umweg; reine Prüflogik, einmal rot zeigen (§6.7). §3.3.
  - [ ] Vier Härtungen aus Gegenprüfungen: (a) fedlex-Extraktionsschicht Risiko-klassieren; (b) `leakErkannt` ohne Konsument; (c) `trenneInterneTitel` unterläuft `PARTEI_RE`; (d) `check-merge-schutz.ts` diffs ohne `-z`/`--no-renames`. **b/c Risikopfad ⇒ Gegenprüfung**; je Punkt Rot-Beweis (§6.7). §3.6.
- **Automatik-Gesundheit** *(QS-AUTOMATIK, `[OF]`)*. Läuft unsere Automatik wirklich, und würde sie
  <!-- @meta id: QS-AUTOMATIK · status: wip · blocker: null · dep: [] · kollision: [.github/workflows, scripts/datenhaltung/check-turso-frische.ts, scripts/check-ci-laeufe.ts, scripts/check-tor-paritaet.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  scheitern können? Offen: Turso-Wächter-Abdeckung + Wachstums-Schwellen.
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §1.
  - [ ] Wächter-Zustandsbericht + Verwaiste-Worktree-Sonde — eine Stelle, die sagt, wie es den Wächtern geht. §3.1.
  - [ ] **Der Wächter selbst ist seit 12.8. rot** (Lauf `31781300926`): Branch-Schutz-Nachzug stirbt unter `bash -e` an `HTTP 403`. Fix: Lesung als optional führen (Exit-Code abfangen, Urteil ohne sie fällen und ausweisen).
  - [ ] Paritäts-Sonde: PR-Deckung ≠ Wächter-Deckung — ein post-merge-Wächter kann keinen Merge verhindern. Einmal rot zeigen (§6.7). §3.5.
  - [ ] Wächter zieht BEHIND-PRs mit scharfem Auto-Merge automatisch nach — seriell, max. 1 PR/Lauf, §6.7 einmal real. §3.1.
- **SEO/A11y** *(SEO-A11Y-GOVERNANCE)*. A11y zahlt auf Bedienbarkeit ein → begleitendes Tor
  <!-- @meta id: SEO-A11Y · status: ready · blocker: null · dep: [] · kollision: [public/normtext/register.json, src/lib/seo.ts, scripts/prerender.ts, vercel.json] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-SEO-A11Y-GOVERNANCE.md -->
  (Tabellen-Semantik, Tastatur-e2e, hreflang). Reines SEO geparkt. **Bedingung der Gleichzeitigkeit:
  eigener Worktree.**
- [ ] **`QS-CURRENCY-KANON` · `fza`/`cmr` NICHT-KANONISCH klären und kanonisch nachführen** *(**Risikopfad**)* — Bestandsdefekt auf `main`; erst Ursache klären, dann re-pinnen + regenerieren + §7-Verifikation. **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §17.
  <!-- @meta id: QS-CURRENCY-KANON · status: ready · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, scripts/fedlex-repin-kanonik.ts, public/normtext/bund] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **fedlex-frische.yml auf `--nur=bund` umstellen** (Lauf regeneriert heute sinnlos alle Kantone ohne LexWork-Token; Wurzel zweier Golden-Verluste) — mit Beweis, dass der Bund-Re-Pin vollständig bleibt. *(GP-Fund PR #482.)*
  - [ ] **fedlex-frische.yml: `gen:pdf-quellen --nur=kanton` nachfahren + `check:pdf-quellen` in den Tor-Block** — sonst driftet der amtliche PDF-Link still auf überholte Fassungen (LexWork liefert Archiv-Versionen mit HTTP 200). *(Fund BE-154.21.)*
  - [ ] **`public/normtext/pdf-quellen.json` in eine Paritäts-Klasse aufnehmen** — kann heute byte-abweichen, ohne dass `check:paritaet` es sieht.
  - [ ] **`aufgehoben`-Flag ist golden-neutral (blinder Fleck)** — eine FALSCHE Aufhebungs-Markierung sieht kein Drift-Tor (§8); eigene Prüfung, bevor die Regel weitere Kantone erreicht.
- **Geräte-Last / Performance** *(QS-PERF, `[OF]`)*. Nicht merklich langsamer, ohne Logikverlust
  <!-- @meta id: QS-PERF · status: ready · blocker: null · dep: [] · kollision: [scripts/check-perf-budget.ts, src/pages/gesetz-leser, src/lib/rechtsprechung, vite.config.ts] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  (§15). Offen: M-Daten-Pfad (9,5-MB-`register.json` ist der lohnendste Hebel) +
  Render-/Split-View-Feinschliff. **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §1.
- **Datenhaltung / VPS-Gate** *(QS-DATA)*. Trägt nur das David-Gate: E3-Serving + E4-UI-Panels
  <!-- @meta id: QS-DATA · status: blocked · blocker: vps-bestellung-david · dep: [] · kollision: [scripts/datenhaltung, daten] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
  hängen an einer VPS-Bestellung (~15 Min David). Der Datenhaltungs-Bau selbst liegt in `W2·6-DATA`.
  **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §13.
- **Optimierungs-Research Juli 2026** *(QS-OPT, `[OF]`)*. Betriebs-/Tor-/Bau-Optimierungen ohne
  <!-- @meta id: QS-OPT · status: ready · blocker: null · dep: [] · kollision: [vercel.json, .github/workflows/normen-monitor.yml, src/lib/normtext/laden.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md -->
  Rechtsinhalt (O-Reihe); keine Massnahme kürzt Beweis, Tor oder Prüfung.
  **Detail:** [FAHRPLAN-OPTIMIERUNG-2026-07.md](fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md) §1.
- **Basis-Ausbau — Fundament** *(QS-BASIS, `[OF]`)*. CI/lokal-Tor-Parität + offene B-Einheiten.
  <!-- @meta id: QS-BASIS · status: ready · blocker: null · dep: [] · kollision: [.github/workflows, package.json, package-lock.json, knip.json] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §2.
  - [ ] Totcode-Meldung wird echtes Tor `check:tot` — blockierend bei NEUEN Meldungen (Basis: 1). Reine Prüflogik. §3.2.
  - [ ] Dependency-Frische: `npm audit` + Majors + knip-Unlisted — Dependabot meldet 2 Verwundbarkeiten (1 hoch); Audit als Meldung, nie Stopper. **Lockfile nur über `npx npm@10`.** §3.3.
  - [ ] tailwind 3→4-Migration (PR #503; PostCSS-Pipeline, Config-Format, container-queries-Plugin nativ, ~249 className-Dateien visuelle Regression — kein Dependabot-Merge)
  - [ ] Dependabot-Lock-Wurzelfix: npm-Major-Mismatch erzeugt fehlende genestete Einträge (H-8-Muster, 341a4a161; 15.8. dreimal von Hand mit `npx npm@10 install --package-lock-only` geflickt) — Workflow-Schritt oder dependabot.yml-Weg finden, der den Lock automatisch mit npm@10 nachzieht
- [ ] **`QS-UI` — Oberflächen-Qualität app-weit** *(reines UI/Design, §13 · kontinuierlich)* —
  <!-- @meta id: QS-UI · status: ready · blocker: null · dep: [] · kollision: [DESIGN-REGLEMENT.md, src/index.css, tailwind.config.js, scripts/check-farbwelt.ts, e2e/a11y.e2e.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  kontinuierlicher Oberflächen-Pass (Fundament → Hierarchie → Politur), kein Einzel-Redesign.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §8.

**Kleine QS-Schritte** (jederzeit einschiebbar; Dach-Zugehörigkeit steckt im ID-Präfix, die
Bau-Spec im `ROADMAP-Spec`-§ des verlinkten Fahrplans; reine Bewertungs-/Recherche-Schritte zeigen
stattdessen auf ihr `bibliothek/`-Dossier).

- [ ] **`QS-FRIT-DRIFT` · FR/IT-Drift-Wächter Stufe 1 (eId-Mengenvergleich DE/FR/IT)** — heute wird nur DE geprüft; FR/IT könnten abweichen, ohne dass ein Tor es sieht. KEIN dreisprachiges Korpus (das ist die Zeile «Mehrsprachiger Normvergleich» in `W2·5g-ZEIT`, vormals `W2·6-MEHRSPRACH`). **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.
  <!-- @meta id: QS-FRIT-DRIFT · status: ready · blocker: null · dep: [] · kollision: [.github/workflows/normen-monitor.yml, scripts/fedlex-versionen-pruefen.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-CURRENCY-TESTS` · Testbindung `cacheBefund` + Kanonik-Ausschluss** — beide hängen an keinem Test (§6.7). Reine Prüflogik, kein Pin wird geändert (Risikopfad-Anteil liegt in `QS-CURRENCY-KANON`). **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §18.2.
  <!-- @meta id: QS-CURRENCY-TESTS · status: ready · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, src/tests] · worktree: ja · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **`QS-KORPUS` · Korpus-Pflege: fehlende und fehlerhafte amtliche Substanz** — Dach-Schritt (Fusion 15.8.2026) für die offenen Reparaturen an Normtext- und Rechtsprechungs-Korpus. **Jede Zeile liegt auf dem Risikopfad** (Extraktion/Korpus, `istRisikoPfad()`) ⇒ **Gegenprüfung Pflicht**, amtlicher Beleg mit Norm + Link + Stand (§7), Korrektur nie in der Projektion, immer in der Pipeline-Quelle (§5); je Zeile eine sortenreine Bau-Einheit.
  <!-- @meta id: QS-KORPUS · status: ready · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, scripts/normtext, public/normtext/bund, src/lib/normtext/aufhebungen.ts, scripts/rechtsprechung, public/rechtsprechung/register.json] · worktree: ja · 26x: nein · groesse: L -->
  · [ ] **Geltende BMV in den Korpus aufnehmen** — die seit 1.3.2026 geltende Nachfolge-Verordnung (Totalrevision `cc/2025/408`, gleiche SR 412.103.1) fehlt; Nutzer finden nur den historischen Text. **Risikopfad** ⇒ Gegenprüfung. (fusioniert 15.8., vormals `QS-KORPUS-BMV`; Fahrplan: [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §20.4)
  · [ ] **scope/decl-Sektionen von 12 Staatsverträgen ingestieren** — 23 amtliche Sektionen liegen ausserhalb des `div#annex`-Containers und fehlen im Snapshot. **Risikopfad** ⇒ Gegenprüfung; golden-Diff erwartet (neue amtliche Substanz). (fusioniert 15.8., vormals `QS-KORPUS-SCOPE`; Fahrplan: [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §19)
  · [ ] **Entscheid-Datumsfehler im Rechtsprechungs-Register bereinigen** — `bge_151_II_475` trägt 1999 statt 2025; Datum gegen bger.ch verifizieren, in der Pipeline-Quelle korrigieren (nie im Projektions-JSON, §5), Register-Sweep nach weiteren Band/Jahr-Diskrepanzen, Projektion neu erzeugen. **Risikopfad** ⇒ Gegenprüfung. (fusioniert 15.8., vormals `QS-KORPUS-RSPR-DATUM`; Fahrplan: [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md))
- [x] **`QS-E2E-SHARD-GEN` · Shard-Zuordnung in die Spec, JSON generieren** — `e2e/shard-gruppen.json` ist der häufigste Merge-Konflikt-Ort. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.5.
  <!-- @meta id: QS-E2E-SHARD-GEN · status: done · blocker: null · dep: [] · kollision: [e2e, scripts/e2e-shard-gruppen.mjs, .gitattributes] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [ ] **`QS-CODE-PROP` · Eigenschafts-Tests (property-based) für die Rechen-Engines** *(Entscheid David 7.8.2026)* — je Engine ein Invarianten-Katalog («eine Frist endet nie vor ihrem Beginn»), tausende generierte Eingaben. **Die Invarianten-Formulierung ist fachlich**: Katalog mit Gegenprüfung härten und David vorlegen (§7); je Invariante einmal rot zeigen (§6.7). Inline, kein Fahrplan.
  <!-- @meta id: QS-CODE-PROP · status: ready · blocker: null · dep: [] · kollision: [src/tests, package.json] · worktree: ja · 26x: nein · groesse: M -->
- [ ] **`QS-UI-HIGHLIGHT` · `::highlight()`-Registry je Leser-Instanz** — eine Registry, drei Schreiber: im Split-View löscht das Rail-Suchfeld die Markierung des Nachbar-Panes. Reine Darstellung. **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §9.
  <!-- @meta id: QS-UI-HIGHLIGHT · status: ready · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/entscheidLeserRegeln.ts, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [x] **`QS-E2E-STABIL` · Lokale e2e-/Test-Budgets an gemessene Streuung binden** — offen: (a) Budget-Modul `e2e/helpers/` statt 4 gegabelter Stellen; (b) `leser-r1-r2`-Wurzel per CI-Forensik (kein UI-Bau ins Blaue, nicht per Timeout maskieren); (c) norm-sprung/Erst-Render → `QS-PERF`. **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §3.4.
  <!-- @meta id: QS-E2E-STABIL · status: done · blocker: null · dep: [] · kollision: [playwright.config.ts, e2e/a11y.e2e.ts, scripts/datenhaltung] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
- [x] **`QS-TOK-DECKEL` · Root-Markdown-Deckel 22 → ~20** — datierte Audit-/Backlog-Dateien nach `archiv/`, Verweise nachziehen. Reine Doku. **Detail:** [FAHRPLAN-TOKEN-OEKONOMIE.md](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §11.1.
  <!-- @meta id: QS-TOK-DECKEL · status: done · blocker: null · dep: [] · kollision: [archiv] · worktree: nein · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md -->
- [x] **`QS-HOOKS-AUSBAU` · Vier Hook-/Konfig-Ausbauten** — **FREIGEGEBEN David 14.8.2026** (Chat, wörtlich: «alle hooks freigegeben»; zuvor «punkt 1 freigegeben»): alle vier Punkte baubar — (1) SubagentStop-Wache §14.7 · (2) `.claude/rules`-Pfad-Scoping · (3) SessionEnd-Lehren-Check · (4) `/sandbox` prüfen. Jeder neue Wächter einmal rot zeigen (§6.7); Anwendung/Wirkung David im Ergebnis zeigen. **Detail:** [state-of-the-art-abgleich-2026-08-07.md](bibliothek/recherche/state-of-the-art-abgleich-2026-08-07.md) § «Lücken».
  <!-- @meta id: QS-HOOKS-AUSBAU · status: done · blocker: null · dep: [] · kollision: [.claude/hooks, CLAUDE.md] · worktree: nein · 26x: nein · groesse: M -->
- [~] **`QS-TYP-LUECKE` · Typprüfung deckt scripts/ und e2e/ nicht — 33 reale Fehler, teils Risikopfad** — Werkzeug-Analyse 14.8.2026 (Zweit-Session, verifiziert): tsc -b prüft nur src/ + vite.config; in scripts/normtext, scripts/materialien, scripts/datenhaltung liegen belegte Null-/Union-Fehler (struktur-run.ts:84/93, check-bezuege.ts:367, soft-law-snapshot.ts:118ff, abk-aliase-generieren.ts:865, masse-ingest.ts:94ff) — ein durchrutschendes undefined erzeugt stille Korpus-Lücken, die Byte-Golden nie sehen. Zu bauen: tsconfig für scripts/+e2e (references), die realen Fehler fixen (Risikopfad-Anteile mit Gegenprüfung), Tor bleibt tsc -b. Bekannt seit Juli (BACKLOG-AUDIT-WERKZEUGE-2026-07 Z. 50), war nie Plan-Schritt.
  <!-- @meta id: QS-TYP-LUECKE · status: wip · blocker: null · dep: [] · kollision: [tsconfig.json, scripts/normtext, scripts/materialien, scripts/datenhaltung] · worktree: ja · 26x: nein · groesse: M -->
- [ ] **`QS-MONITOR-ROT` · Normen-Monitor seit ≥5 Wochen rot — Wurzel-Fix** — Aktivierungs-Audit 14.8.2026: `normen-monitor.yml` 5/5 Läufe failure (seit 6.7., Issue #166 offen, 8 rote Läufe in Folge); scheiternde Schritte `check:netz` und LIK-Reihe (BFS O-1.6). Rechtsstand-relevant. DIAGNOSE 14.8. (Session-Befund, Issue #166 beantwortet): Monitor korrekt, Rot ist ECHT — Checkliste: · [ ] LIK-Reihe 2026-05→2026-07 nachziehen (scripts/lik-reihe-generieren.py; amtliche Werte ⇒ Gegenprüfung trotz formal fehlendem Risikopfad-Flag) · [x] 14 nicht-kanonische Fedlex-Pins repariert (#497, 2 Gegenprüfungs-Runden 14/14 SPARQL-rederiviert; PR von 574 auf 10 Dateien entbläht — Automaten-Churn inkl. 115 Kanton-Dateien ist Befund (a2)) · [x] Frische-Automat: gen:historie/check:historie in Kaskade+Prüfliste nachgerüstet (Nullprobe-belegt) · [ ] 10 ESTV-MWST-Snapshot-Drifts aktualisieren (Risikopfad Materialien) · [ ] AIG-Botschaft BOTSCHAFT-2025-3067 nachführen (botschaften-netz rot, Klasse d — materialien:botschaften-Generator; Risikopfad) · [ ] VRV-Vernehmlassung VERN-2026-79 bereinigen (vernehmlassungen-netz rot, Klasse d — Verfahren live nicht mehr gelistet; Risikopfad) · [x] Rest-Sondierung 14.8.: 8 weitere Netz-Tore einzeln GRÜN (caches/zitate/rss-oc/normtext/pdf/pdf-quellen/revisionen/abk) — nur materialien-netz + fedlex-versionen noch offen · [ ] Materialien-System-Befunde 14.8. (aus Korpus-Nachzug, je §17-Wurzel-Fix nötig): (a) `npm run materialien` löscht in DB-losen Worktrees still 11 kanten-Artefakte — Orphan-Bereinigung bei fehlender DB überspringen; (b) Generator-Abgänge ohne Grabstein/Logzeile — Zu-/Abgänge ausgeben, Abgänge bestätigungspflichtig; (c) VERN-Schlüssel erbt mutable Fedlex-Projektnummer (79→78-Umnummerierung belegt) — intrinsische Identität wie bei fga-URIs; (d) botschaften-netz-Stichprobe = 8 feste Keys, blind für Register-Zuwachs (9 neue Erlasse monatelang ungeprüft) — Vollabgleich Grundmenge↔Roh-Dateien; (e) VERN-shas rauschen (stand=Abfragedatum im Hash); (f) Botschaften-Roh ohne ORDER BY — deterministisch sortieren; (h) Fussnoten-Link-Extraktor erzeugt «Link .»-Leerzeichen bei Satzend-Links (TGBV Fn 20/32 belegt, Muster main-weit) — Fix im Extraktor, nie in den Daten; (a2) Frische-Automat fasst bei Bund-Läufen 115 Kanton-Dateien mit Datums-Churn an (Verletzung der eigenen Reset-Invariante cache.sh:31); (g) Generator-Kaskade als EIN Kommando (materialien ⇒ normtext:revisionen ⇒ gen:zaehler — am 14.8. kostete das einzelweise Entdecken zwei CI-Rotläufe auf #499) · [ ] Verfahrens-Gap: Reparatur-Arm (Mo 04:43) vs. Detektions-Arm (Mo 05:17) — Cadence/Reihenfolge entscheiden; check:netz-&&-Kette zeigt nur ersten Befund (eigener deklarierter Schritt, §17).
  <!-- @meta id: QS-MONITOR-ROT · status: ready · blocker: null · dep: [] · kollision: [.github/workflows, scripts/normtext] · worktree: ja · 26x: nein · groesse: M -->
- [ ] **`QS-EFFIZIENZ` · Effizienz-Dauerauftrag (Token/Prozess)** — Stehender Auftrag David 14.8.2026 (Chat, «bau immer weiter an dingen die bei zukünftigem bau token sparen … volle erlaubnis … bis ich stop sage»; Wortlaut: Memory `dauerauftrag-effizienz-2026-08-14`): fortlaufende, serielle Kleinschritte an Skills/Hooks/Toren/Steuer-Doku — Prosa-Diät, tote Pfade, Wurzel-Fixes; je Punkt eigener Commit/PR, Grenzen unverändert (§1, Abnahme, Risiko-Gegenprüfung). Checkliste (laufend): · [x] plan-buchung.yml: Trailer-Fallback aus PR-Body (14.8., inkl. Gegenprüfungs-Auflagen) (Lehre 14.8.: Davids Auto-Merge nimmt Standard-Squash-Text, Trailer geht verloren) · [x] Vorschlagsdatei hooks-vorschlag-dispatch-schutz.py angewendet (14.8., byte-treu + Kopf bereinigt). Runde 2 (14.8., #493): Halden (Fixture + 2 Snapshots archiviert) · Regelaudit (Befund: Bestand konsolidiert; §11 gestrafft, gegenpruefung datiert) · Testtreue-Grenzfälle eingefroren. Offen: · [ ] Auto-Buchungs-Push: Actions-Bot scheitert an Branch-Protection (GH006, Geburts-Rotlauf 14.8., Run 31830331265) — Entscheid David 14.8.: PAT-Weg; Workflow verdrahtet (Fallback auf github.token bis Secret PLAN_BUCHUNG_TOKEN existiert, [skip ci] gegen PAT-Retrigger) — WARTET AUF DAVID nur noch: Token erstellen + als Secret hinterlegen (Anleitung im Chat 14.8.); bis dahin Hand-Buchung (laut, nicht still); NEUER BELEG 15.8. (#507): Lauf endet «success» OHNE Push — der Ausfall ist STILL, Wächter-Zeile oder Fail-hart nötig, sobald der PAT-Weg steht · [x] Wächter-Selbstmeldung gebaut + live bewiesen (#495, Issue #496 entstand beim Hand-Trigger; Befund-Korrektur: 403/bash-e-Wurzel widerlegt, Röte war korrektes Monitor-Urteil; K2/K11-Nachzug bleibt dokumentiert eingeschränkt — GITHUB_TOKEN ohne administration-Scope, PAT unverhältnismässig) · [x] Fedlex-Auto-Merge END-ZU-ENDE BEWIESEN 15.8. (#497 mergte unbeaufsichtigt, sobald das Gegenprüfungs-Verdikt den Merge-Schutz grün machte; der 403 auf gh workflow run bleibt als harmlose Rest-Reibung — CI triggert ohnehin via PAT-Push) · [x] Token-Schnappschuss beim SessionEnd verdrahtet (abschluss-wache→messwerte/token-spool.jsonl, live bewiesen 14.8.) — offen bleibt: selbstopt:erheben liest Spool + Zeitreihen-Lauf automatisieren · [x] Hook-Deckung MCP-Kanäle erledigt 15.8.: start_process/interact_with_process→tor-schutz, read_file/read_multiple_files→lese-schutz, je Rot-Beweis + 14 Testfälle (hook-mcp-deckung.test.ts, prüft echte settings.json + echte Hooks); GRAVIEREND dabei: der 14.8.-deploy-Matcher hatte NIE gefeuert (Claude-Code-Matcher ohne Metazeichen = Literal-Gleichheit, matcht mcp__<server>__<tool> nie) — repariert auf ^mcp__.*__(…)$, Falle im Test eingefroren; write_file bewusst ungedeckt (kein bestehender Write-Hook zum Spiegeln, §17-Gegengewicht); Gegenprüfung BESTANDEN MIT AUFLAGEN, Auflage (fail-open bei Nicht-String) behoben · [x] vercel.json ignoreCommand gehärtet 15.8.: Basis = `VERCEL_GIT_PREVIOUS_SHA` (letzter deployter Commit) statt HEAD^, Fallback HEAD^, unauflösbare Basis ⇒ BAUEN statt still skippen; K3-Fall (Code+Code+Doku in einem Push) damit geschlossen — 3 Semantik-Proben lokal (Code-Basis→bauen, unauflösbar→bauen, Doku-only→skip); Live-Beweis beim ersten Mehrfach-Commit-Push nach Landung · [x] Fremd-Skill-Sicherheitsscan nachgeholt 15.8. (manuell, alle Dateien beider Plugins vollständig gelesen): KEIN Befund — reine Beratungs-Prompts/WCAG-Referenzen, kein Netzwerk-/Exfil-/Injection-Muster; Behalt. Formalie offen: der Z.-157-Mechanismus (legal-builder-hub skill-installer/skills-qa-Ampel) lief nicht — bei nächster Skill-Adoption dort nachziehen · [ ] LSP: typescript-language-server jetzt devDependency — ob das Plugin ihn workspace-lokal findet, in Folge-Session live prüfen; sonst WERKZEUG-VERDRAHTUNG-Pflicht zurückbauen · [x] SCHRITTE ZUSAMMENLEGEN nach hochkalibriertem Massstab (David 15.8., «eventuell schritte zusammenlegen») — erledigt 15.8.: 14 Etiketten fusioniert → `W2·6`, `W2·6-RESOLVER`, `W2·5g-ZEIT`, `W3-AUSBAU` (neu), `QS-KORPUS` (neu); Chronik-Block gleichen Datums mit Wortlaut und Begründung je Fusion, Risikoklassen nicht gemischt, Etiketten-Bestand 65 → 53 *(der Auftrag nannte 11 Etiketten; nachgezählt sind es 14 — die drei `QS-KORPUS-*` waren in der Zählung nicht mit)* · [x] Shard-Neubalancierung 15.8. (#506): Test-Summen 1.9–3.9→3.3 Min/Gruppe, Beweis-Lauf 7/8 Shards 4.3–4.9 Min · [ ] Runner-Kontentions-Ausreisser beobachten (14–15 Min bei identischem Inhalt; 2 unabhängige Beobachtungen 14./15.8. — Zuschreibung erst nach Verteilungsregel, dann ggf. eigener Schritt) · [x] Falle-c-Wächter erledigt 15.8. durch den main-Push-Hook (tor-schutz.py 2b, PR #513): direkter main-Push ist generell geblockt — der Spezialfall «bei eigenem offenen PR» ist damit mit abgedeckt, Hook-Test 15/15 · [x] 5 Dependabot-PRs (#500–504) triagiert (15.8.: #500/#501/#504/#502 Auto-Merge scharf nach Lock-Fix mit npm@10 — H-8-Muster; #503 tailwind 3→4 → eigener Punkt in `QS-BASIS`) · [x] BAUPLAN-UMBAU erledigt 15.8. (voller Auftrags-Wortlaut: Chronik-Block «Etiketten-Konsolidierung 15.8.2026»): Recherche zuerst (SotA-Bericht `bibliothek/betrieb/agenten-bauplanung-sota-2026-08-15.md`), dann: Lebendige-Spec-Mechanismus am Werkzeug (Slicer-Banner + bauschritt Station B) · Fahrplan-§-Diät (aufraeumen.md §4b; GESETZES-UX/FEDLEX-PORTFOLIO −795 Z. wörtlich archiviert) · Kurzkarte als Session-Karten-Default (Beleg: 51 % Doku-Commits seit 1.8. vs. 12,5 % Produkt-Code) · Gross-Schnitt s. SCHRITTE-ZUSAMMENLEGEN-Punkt · Nachzug: 22 Trailer-Stellen + 2 Beispiel-/Bahn-Stellen, unabhängige Gegenprüfung BESTANDEN MIT AUFLAGEN, Auflagen behoben (Commits 7437bb2fd/608e5b675) · [ ] ENTREGULIERUNG RUNDE 2 — frühestens ~21.8., Startbedingung Token-Zeitreihe ≥5 Sessions; Prompt-Wortlaut: bibliothek/betrieb/entregulierung-2026-08-07.md § Runde 2 · [ ] Live-Beweis subagent-wache (trägt agent_type zur Laufzeit «lex-…»? — erst in einer Folge-Session prüfbar, Hooks laden beim Start).
  <!-- @meta id: QS-EFFIZIENZ · status: ready · blocker: null · dep: [] · kollision: [.claude, scripts/plan, .github/workflows] · worktree: ja · 26x: nein · groesse: L -->
- [ ] **`QS-AUTOPILOT-STUFE1` · Vorschlags-Autopilot (Entwurfs-PRs aus der Messreihe)** *(David: «stufe 1 ja», gebunden an ≥ 5 Snapshots; Stufe 2/3 NICHT freigegeben)* — Cron fährt `retro:17`, eröffnet Entwurfs-PR, kein Auto-Merge. **Detail:** [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md) § «Selbstoptimierender Bau».
  <!-- @meta id: QS-AUTOPILOT-STUFE1 · status: blocked · blocker: zeitreihe-5-snapshots · dep: [] · kollision: [.github/workflows, scripts/plan] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md -->
- [ ] **`QS-ORG-UMZUG` · Repo in eine GitHub-Organisation überführen (Merge Queue)** — erst wenn der Auto-Nachzug (Checklisten-Zeile unter `QS-AUTOMATIK`) nicht reicht. **Detail:** [entregulierung-2026-08-07.md](bibliothek/betrieb/entregulierung-2026-08-07.md).
  <!-- @meta id: QS-ORG-UMZUG · status: blocked · blocker: david-entscheid-org-umzug · dep: [] · kollision: [.github/workflows] · worktree: nein · 26x: nein · groesse: M -->


---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. **Etikett-System (`@meta`/`@queue`/`@blockers`) und Tor-Regeln:**
> [FAHRPLAN-PLAN-STEUERUNG.md](fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md); dort auch das Schätzfeld
> `groesse: S|M|L` (S nur gebündelt nehmen · M sessionfüllend · L vorher schneiden — Schätzung,
> kein Tor-Kriterium).

<!-- @queue: W2·10-UI-NAV, W2·5h-GESETZ-UI, W2·13-KANTONE, W2·6b-MAT-FINMA -->
<!-- ^ SSoT der Bau-Reihenfolge: plan:next wertet die @queue VOR der Dokumentreihenfolge aus;
     Integrität erzwingt check:plan Regel 8. Priorität ändern = NUR diese Zeile ändern.
     Gequeuete Querschnitt-Schritte steigen in die Hauptreihenfolge auf (Entscheid David 8.8.2026,
     «Prozess geht grundsätzlich vor»). -->

> **⬆ OBERSTER OFFENER SCHRITT: `W2·10-UI-NAV`** — vom Dach ist nur noch `-J3` offen
> (Risikopfad, eigene Session). Fokus-Dekret 24.7.2026 (David): die Gesetzesdarstellung steht im
> Vordergrund — Gesetzes-Schritte prioritär, daneben `W2·6b-MAT-FINMA` (Bewerbungs-Kontext FINMA).
> Wortlaute der Dekrete → `ROADMAP-CHRONIK.md`.

### Welle 1 — Kern: Norm → Werkzeug → Schriftsatz + die Alltags-Klingen

- [ ] **4 · Prozesskosten-Cockpit Restbau** *(PROZESSKOSTEN-COCKPIT, Hauptmoat)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W1·4 · status: ready · blocker: null · dep: [] · kollision: [src/lib/prozesskosten.ts, src/pages/RechnerProzesskosten.tsx, src/lib/verzahnung] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Ziel: Tarif-Modifikatoren an amtlichen Tarifen recherchieren (Risikopfad ⇒ `QS-GP`), damit I2
  bauen, dann Festsetzung/Dispositiv. Die Tarif-Tranche ist Kettenglied 3 der `@slot-kette`.
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.
 
- [ ] **5-PRAXIS · Frist × Kosten verzahnen** *(Ideen-Intake 20.7.2026 · UI-Orchestrierung, `[OF]`)*:
  <!-- @meta id: W1·5-PRAXIS · status: ready · blocker: null · dep: [] · kollision: [src/lib/rechnerPermalinks.ts, src/lib/permalink.ts, src/lib/icsExport.ts, src/pages/RechnerProzesskosten.tsx, src/pages/RechnerStreitwert.tsx, src/pages/RechnerZpo.tsx, src/pages/RechnerUebersicht.tsx, src/components/forms/ProzesskostenForm.tsx, src/components/forms/StreitwertForm.tsx, src/components/forms/ZpoFristenForm.tsx, src/components/forms/VorlagenSprung.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Die heute isoliert nebeneinander stehenden Rechner zu **einem Praxis-Weg** verketten
  (Frist → Kosten → Vorlage), reine UI-Orchestrierung ohne neue Rechtsregel (§3).
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1.

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [ ] **L-3 (Auto-Default-Umkehr ZGB/OR)** — weiterhin **hinter David/Council-Gate**, NICHT in
  feat/v2-l1-l2 gebaut; Rest von A24 (L-1/L-2 gebaut, L-4 entfällt) und der erledigte Elter `5d`
  stehen in `ROADMAP-CHRONIK.md`. V2 §2 F4.
- [ ] **10-UI-NAV · UI-Nutzwert & Navigation (Ultracode-Synthese 11.7.)** *(`[OF]`, reine UI/Navigation)*:
  <!-- @meta id: W2·10-UI-NAV · status: ready · blocker: null · dep: [] · kollision: [src/components/suche, src/lib/suche, src/lib/universalSuche.ts, src/components/layout, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx, src/pages/gesetz-leser, src/pages/GesetzLeser.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  Suche, Navigation und Auffindbarkeit über alle Oberflächen; reine Darstellungsschicht (§3).
  Offen ist nur noch **-J3**. **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §8.
  - [ ] **UI-NAV-J3 · Sachgebiets-Pipeline verfeinern (J3)** — **bewusst allein**, weil Risiko-Pfad: `QS-GP` Pflicht + golden byte-gleich, eigene Gegenprüfungs-Runde. §6.
    <!-- @meta id: W2·10-UI-NAV-J3 · status: ready · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung/register.json, src/lib/normtext/browse.ts] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [ ] **11-DESIGN · Design-Wärme & Atmosphäre (Ultracode-Synthese 11.7.)** *(`[OF]`, reine Darstellung/Token-Schicht)*:
  <!-- @meta id: W2·11-DESIGN · status: ready · blocker: null · dep: [] · kollision: [src/index.css, tailwind.config.js, DESIGN-REGLEMENT.md, scripts/check-design-tokens.ts, src/components/rechtsprechung, src/pages/EntscheidLeser.tsx, src/components/forms, src/components/DatumsFeld.tsx, src/components/BetragsFeld.tsx, src/pages/Startseite.tsx, src/components/start] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  Farbklima/Wärme/Typografie — Token-Schicht nach §13, Normtext-Körper bleibt farbfrei, golden
  byte-gleich. Dach-Schritt mit Checkliste; zwingende Binnenfolgen stehen an der Zeile.
  **Detail:** [FAHRPLAN-DESIGN-WAERME.md](fahrplaene/FAHRPLAN-DESIGN-WAERME.md) §5.
  - [ ] **DESIGN-D0 · Deckkraft-Suffix-Klassen reparieren (Infrastruktur-Fund B4, 8.8.2026)** — Tailwind-Klassen mit Opacity-Zusatz (`bg-brass-100/70` u. ä.) erzeugen am aktuellen Stand KEINE CSS-Regel und rendern unsichtbar (belegt: LM-156, unsichtbare Aktiv-Zeile der Gesetzes-Gliederung, PR #472); Repo-weiter Sweep nach betroffenen Stellen + Wurzel-Fix in `tailwind.config.js`, danach Sichtprüfung der Fundstellen. Vor D6–D8 ziehen (dieselbe Token-Fläche).
  - [ ] **DESIGN-D6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)** — surface dunkel heben · warme Schattenbasis · Lichtkante · Scrim-Audit; Token-only, flip-reversibel, `check:farbwelt` + axe dunkel. §2 (D-6).
  - [ ] **DESIGN-D7 · Ein Lese-Register (`--reading-ink`, `--lese-fs`/`--lese-lh`)** — Lese-Basis + Entscheid-Stepper als Multiplikatoren, CPL-Messung, Regel in beide Domänen-Reglemente; golden neutral. §2 (D-7).
  - [ ] **DESIGN-D8a · Wörterbuch auf die Fläche: slate auf Entscheid-Flächen (D-8.1)** — Entscheid-Leser-Chrome und Rubrik-Label auf die Rollen-Schicht ziehen; Playwright-Screens in die Abnahme-Mappe.
  - [ ] **DESIGN-D8b · Mono-Diät — Pilot, dann mechanischer Rest (D-8.2)** — ~50 verteilte Fundstellen; **Pilot zuerst** (Startseite + 1 Rechner) mit Vorher/Nachher-Screens, danach der Rest. Nicht flip-reversibel; **nach D8a**. **Grenze zu `W2·17-UI-BEFUNDE` Position B12** beachten (§5 dort).
  - [ ] **DESIGN-D8c · Motiv-Katalog (D-8.3)** — `scale-rule`-Motiv an 2–3 Sektions-Orten, Abschluss der Anwendungs-Schicht; **nach D8b**.

- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)* — **ENTPARKT 3.8.2026 (David).**
  <!-- @meta id: W2·5g-ZEIT · status: ready · blocker: null · dep: [] · kollision: [scripts/normtext, src/lib/normtext, public/normtext, src/components/normtext/ArtikelBody.tsx, src/pages/gesetz-leser] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  «Art. X, wie er am Tag Y galt» + visueller Diff zweier Konsolidierungen. Extraktions-Risikopfad
  ⇒ `QS-GP`; harte Bau-Reihenfolge (a) POC → (b) AKN-XML Phase 1 + `G-HIST` → (c) Bau.
  **Detail:** [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §8.
  Dach-Schritt seit der Fusion 15.8.2026 — dieselbe Fläche Gesetzesdaten, je Zeile eine sortenreine
  Bau-Einheit:
  · [ ] **Tabellen in Gesetzen lesbar machen** — Beispiel-Defekt `/gesetze/kanton/BS-154.810#art-29`; Extraktion = Risikopfad ⇒ `QS-GP` + golden byte-gleich, Zellinhalte exakt wie Quelle, mehrdeutig ⇒ Block als Text belassen (§1). **Grenze zu `W2·13-KANTONE-K7`** beachten (dort die PDF-Extraktion davor, hier die Darstellung). (fusioniert 15.8., vormals `W2·5j-TABELLEN`; Fahrplan: [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §18)
  · [ ] **Mehrsprachiger Normvergleich DE/FR/IT** — Auslegungswerkzeug nach Art. 14 PublG: drei Sprachfassungen je Erlass + Synopse-UI; heute ist nur `de` befüllt. Berührt Extraktion (`scripts/normtext`, Risikopfad) ⇒ `QS-GP`-Gegenprüfung Pflicht. (fusioniert 15.8., vormals `W2·6-MEHRSPRACH`; Fahrplan: [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13)
 
- [ ] **5h-GESETZ-UI · Gesetzes-Webseite: UX-Pass** *(Ideen-Intake 20.7.2026 · reine UI/Darstellung)*:
  <!-- @meta id: W2·5h-GESETZ-UI · status: ready · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/normtext, src/components/suche, scripts/check-linien-kanon.ts, e2e] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  **Folgeschritt aus `QS-UI`** (Davids Sequenz: erst app-weit, dann die Gesetzes-Seite): UX-Pass auf
  der Gesetzes-Webseite inkl. Kopfzeilen-Bündel — reine UI/Darstellung, amtliche Substanz unangetastet.
  **Detail:** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §17.
  - [ ] **Gliederungslinie im Lesetext entfernen** *(Entscheid David 13.8.2026: V1 «Linien ganz entfernen»)* — Rückbau der Guide-Mechanik; Übersicht trägt allein die Seitenleiste. **Deklarierte Verhaltensänderung** (§6): Vorher/Nachher-Beweis Pflicht, Linien-Kanon Teil A unberührt. [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §9.3.
- [ ] **5l-NORMTEXT-B2 · Schlusstitel/UeB/Anhänge (M13) + wortgenaue Fussnoten (M14)** —
  **Risikopfad** (`scripts/normtext`) ⇒ Gegenprüfung; **golden-Re-Bless erwartet** (additiv).
  <!-- @meta id: W2·5l-NORMTEXT-B2 · status: ready · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund, golden] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md -->
  Tragende Falle: Token-Kollision `disp_u1`/`art_1` (ohne eigenen id-Raum stiller Daten-Verlust).
  **Detail:** [FAHRPLAN-NORMTEXT-DARSTELLUNG.md](fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md)
  §M13/§M14 + Resume-Hinweis.
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx, bibliothek/behoerden, src/lib/kontext.ts, src/pages/RechnerUebersicht.tsx, api/suche.ts, scripts/datenhaltung, src/components/suche, scripts/verzahnung, src/lib/verzahnung] · worktree: nein · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Dach der Rechtsprechungs-Fläche. **Detail + Schnitt-Begründung:**
  [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13. Vier Etiketten sind am
  15.8.2026 hier aufgegangen (gleiche Fläche, gleiche Risiko-Klasse); je Zeile eine sortenreine
  Bau-Einheit:
  · [ ] **Gerichts-/Behörden-Adressregister** — Lese-/Index-Schicht über die bestehenden Bestände, **kein Datenduplikat** (§5); Quelle `bibliothek/behoerden/`. (fusioniert 15.8., vormals `W2·6-ADRESSEN`; Fahrplan: [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13)
  · [ ] **Entscheid-Filter über die API — Richter + allgemeine Facetten** — gebündelt, weil beide Teile dieselbe Bau-Fläche tragen (Turso-Schema + `api/suche.ts` + Facetten-UI): Richter-Facette (aus `R-RICHTER` Block B) und die allgemeinen Entscheid-Facetten über die API; **ULTRACODE freigegeben** für Teil b. Berührt `scripts/datenhaltung` (Risikopfad) ⇒ `QS-GP`-Gegenprüfung Pflicht. (fusioniert 15.8., vormals `W2·6-FILTER`; Fahrplan: [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §7)
  · [ ] **Zitationsnetz: Rückwärts-Zitate + Leitentscheid-Score** — «Welche Entscheide zitieren diesen?» + Leitentscheid-Score, deterministisch aus dem Zitat-Graph (§2 — kein Ranking-Modell, kein Bedeutungs-Urteil); Daten-Derivation ⇒ `QS-GP`, Merkposten LM-042 («ff.»-Sammelzitate) als Auflage mitführen. (fusioniert 15.8., vormals `W2·6-ZNETZ`; Fahrplan: [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §10)
  · [ ] **Rechtsprechungs-Übersicht: P0-Rest + Korpus-Breite** — SG-Regeste-Rest und die Übersichts-/Facetten-Breite; **erst nach dem Resolver-Teil von `W2·6-RESOLVER`** (die Kantons-Ausweitung setzt ihn voraus — die frühere `dep` ist damit Prosa). (fusioniert 15.8., vormals `W2·6-UEBERSICHT`; Fahrplan: [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13)
    - [ ] **6-RESOLVER · Kantonaler Norm-Resolver → Kantonalnorm-Buckets (P0-Kern)** — `norm-index` füllt heute nur Bundesnorm-Buckets; der Resolver ist Voraussetzung der kantonalen Stufe. **Risikopfad.** §13.
      <!-- @meta id: W2·6-RESOLVER · status: ready · blocker: null · dep: [] · kollision: [src/lib/rechtsprechung/norm-index.ts, public/rechtsprechung/norm-index, scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
      Risikopfad-Dach der Rechtsprechungs-DATEN; die aufgenommene Zeile teilt Fläche und Risiko-Klasse:
      · [ ] **Richternamen gegen den Staatskalender auflösen** — abgekürzte Vornamen auflösen («P. Kaderli» → «Kaderli Peter»), Abgleich gegen den amtlichen Staatskalender; **Extraktion/Personendaten = Risikopfad** ⇒ `QS-GP` Pflicht, nie raten. (fusioniert 15.8., vormals `W2·6-RNAME`; Fahrplan: [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §8)
    - [~] **Richter-/Spruchkörper-Filter — Fundament** *(`R-RICHTER`, Direktauftrag David 20.7.2026)*:
      Block A ✅, Block B trägt die Zeile «Entscheid-Filter über die API» dieses Dachs (vormals `W2·6-FILTER`). Detail: `fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md` §13 (Spec); Richter-Filter: Ziff. 12.
    *— Datenausbau-Unterschritte (Quellen → DB → Korpus = Fundament der Verzahnung):*
    - [ ] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(W2·6-DATA; Council 2.7.2026 — löst die drei OCL-Abbau-„DAVID-ENTSCHEID"-Punkte auf)*.
      <!-- @meta id: W2·6-DATA · status: ready · blocker: null · dep: [] · kollision: [scripts/normtext-snapshot.ts, scripts/prerender.ts, public/normtext/register.json] · worktree: ja · 26x: ja · groesse: L · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
      Die Adapter befüllen ein libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion
      (Tor `check:paritaet`). **Heiss/Kalt-Grenze bleibt DAVID-GATE.**
      **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §14.
- **Merkposten:** `register.json` steht bei 97 % des 780-KB-gzip-Deckels — wer es weiter belädt,
  reisst `check:perf-budget`; Lösung ist eine eigene Projektion, nie das Anheben der Schranke (§8).
- [ ] **7-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)* — ✅ V1a/V1b/V1c gebaut 3./4.7.2026 (Chronik):
  <!-- @meta id: W2·7-VZUI · status: ready · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/components/kontext/KontextPanel.tsx, src/pages/EntscheidLeser.tsx, src/components/NormPopover.tsx, src/components/suche/SuchResultate.tsx, src/pages/gesetz-leser/bezugAuswahl.ts, src/pages/gesetz-leser/bezuegeLaden.ts, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik für die Verzahnung, reine UI auf vorhandenen Daten (§3). Offen:
  V2 (E3-Serving) · V3 (E6a) — an den Datenstrang gekoppelt.
  **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §11.
  - [ ] «Grundzustand ohne Zusatz-Fetch» wiederherstellen ODER Doku ehrlich machen (`bezugAuswahl.ts`/`bezuegeLaden.ts`) — Code-Zusage ohne Deckung ist keine Option (§5/§8). §13.
  - [ ] **VZUI-SACHGEBIET · Sachgebiet-Facette an der Norm↔Entscheid-Kante** — deterministisch aus der amtlichen BGE-Bandnummer I–V (§2, keine Heuristik). Extraktion = Risikopfad ⇒ Gegenprüfung. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §12.
    <!-- @meta id: W2·7-VZUI-SACHGEBIET · status: ready · blocker: null · dep: [] · kollision: [src/lib/verzahnung/facetten.ts, src/lib/rechtsprechung/bezuege.ts, scripts/normtext/bezuege-bauen.ts, src/pages/gesetz-leser/bezugAuswahl.ts, src/components/verzahnung/BezugFacettenWahl.tsx] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
- [ ] **6b-MAT-FINMA · FINMA-Materialien prioritär + Verzahnung** *(§14-Intake 24.7.2026;
  <!-- @meta id: W2·6b-MAT-FINMA · status: ready · blocker: null · dep: [] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
  Kontext Bewerbung David bei der FINMA)* — FINMA-Rundschreiben/Wegleitungen als nächste Quelle der
  Materialien-Pipeline (Verweis-/Register-Ebene, kein Volltext-Nachbau).
  **Detail:** [FAHRPLAN-MATERIALIEN-VERZAHNUNG.md](fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md) §10.
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
  - [ ] **Zitat-Export & Fussnoten-Ausgabe** *(Ideen-Intake 20.7.2026, `[OF]`, klein → inline §14.1)* —
    Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3`) + Fussnoten-Ausgabe; Formvorschriften
    bestimmen die angebotenen Exportformate (§8). **Detail:** [FAHRPLAN-VORLAGEN-AUSBAU.md](fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md) §1.
- [ ] **9 · Aufräum-Item — zwei Restpunkte** — (a) A3 Kachel-Höhen (zur David-Abnahme geflaggt);
  <!-- @meta id: W2·9 · status: ready · blocker: null · dep: [] · kollision: [src/components, src/pages] · worktree: nein · 26x: nein · groesse: S · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  (b) globaler Schalter «aufgehobene Normen ausblenden» nie gebaut. Abhaken bleibt David-Entscheid.
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §20.
- [ ] **13 · Kantonale Gesetze — Darstellung & Suche** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit: 44 Befunde + 3 Kritik-Linsen, 10 live an Amtsquellen re-verifiziert)*
  <!-- @meta id: W2·13-KANTONE · status: ready · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/NormText.tsx, src/components/kontext/KontextPanel.tsx, src/lib/suche/onlineVolltext.ts, api/suche.ts, src/components/suche, src/lib/normtext/relevanz.ts] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  Hier die NICHT-Risiko-Einheiten (reine Darstellung/Suche/Anzeige); Extraktion & Daten →
  `W2·13-KANTONE-DATEN`. Dach-Schritt mit Checkliste.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [ ] **K-1 · Reader-Treue P0** *(F24/F25/F28/F33/F29-Display/F5, M)* — Lesereihenfolge, Doppel-Decode, «SR»-Label, Titel-Dopplung, Fussnoten-Stern-Strip, A14-Relevanz fr/it; reine Display-Schicht. §1-A.
  - [ ] **K-2 · §8-Ehrlichkeit UI** *(F26-UI/F37/F44/F27-Rest, S–M)* — zweistufiger Currency-Chip, Kanton-Hinweis im KontextPanel, Abdeckungs-Kontextzeile, «Stand unbekannt», Systematik-Hinweis; reine Anzeige. §1-A.
  - [ ] **K-3 · Suche: Kanton-Treffer auf die richtige Ebene** *(F35/F36, S)* — Edge-DTO um `ebene`/`kanton`, Treffer-Href auf `/gesetze/<ebene>/…`, Kanton-Marke, Reader-Redirect. §1-A.
  - [ ] **K-5 · NormText-Verweise Kanton** *(F41 → F40 → F42, M)* — **EINE Einheit (gleiche Datei)**, golden-neutral; harte Binnenfolge **F41 vor F40** (sonst fehlt der Ersatz), F42 nachrangig. §1-A.
  - [ ] **K-11 · Kanton-Reader-Performance profilieren** *(F32, M)* — **erst messen**: `check:perf-budget` um den Kanton-Leserpfad erweitern, nichts «fixen» vor dem Profil (Ursache unbewiesen). §1-A.
- [ ] **13-DATEN · Kantonale Gesetze — Daten & Extraktion (Risikopfad)** *(Aufteilung 8.8.2026 aus `W2·13-KANTONE`, sortenrein)*:
  <!-- @meta id: W2·13-KANTONE-DATEN · status: ready · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton, public/normtext/struktur, public/normtext/register.json, public/normtext/kanton-systematik.json, src/lib/startseiteConfig.ts, scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  Durchgehend **Risikopfad** ⇒ Skill `korpus-werkstatt` + `QS-GP` + golden byte-gleich; zwingende
  Binnenfolgen stehen an der Zeile. **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2.
  - [ ] **K-4 · Einzel-Nachzüge Stand/Currency** *(F14/F9 + SO-Lektion, S — **Risikopfad**, `QS-GP`)* — ZG-161.7 nachziehen, SZ-Stand klären, Invariante «stand ≤ Generierungsdatum» ins Tor `check:normtext`, Vollständigkeits-Invariante gegen den strukturell blinden Drift-Check. §1-A.
  - [ ] **K-6 · Quellen-Hygiene: lexfind → amtlich + Dedupe** *(F7/F8/F15/F11/F25-Keys/F22, M — **Risikopfad**, `QS-GP`)* — **pro Kanton eine Tranche**; Binnenfolge K-6a (Dedupe) vor K-6d (GL-Key-Migration). §1-A.
  - [ ] **K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter** *(F20-GATE/F17a/F18/F16/F19/F23/F13, M — **Risikopfad**, `QS-GP` + pdfplumber-Gegenprobe)* — Teil a ist das **harte Dehyphenations-Gate**; ohne es bleibt jeder FR/VS/AR-PDF-Nachzug gesperrt. §1-A.
  - [ ] **K-8 · xhtml-`<p>`-Strukturerhalt** *(F21, M)* — `parseSegment` im LexWork-Adapter, Schema nur additiv, Golden-Diff korpusweit offline. §1-A.
  - [ ] **K-9 · Erlass→Werkzeug-Brücke Kanton** *(F38, M)* — Build-Zeit-Inversion der Tarif-`quelleUrl`s zu `KANTON_ERLASS_WERKZEUGE` + Konsistenz-Tor; reine Metadaten. §1-A.
  - [ ] **K-10 · AR-Sidecar-Batch** *(F30-AR, M)* — 263 der 314 fehlenden Struktur-Sidecars sind AR; nur amtliche Überschriften, **Einzel-Erlass-POC vor dem Batch**; 1 Kanton = slot-frei. §1-A.
  - [ ] **K-12 · Reports & kuratierte Listen** *(F3-Report/F4-Liste/F33-Daten, S–M)* — lesend/planend; K-12b ist reine Planung ohne Fetch, K-12a-AR-Anteile erst nach dem F20-Gate aus K-7. §1-A.
  - [ ] **K-13 · Systematik-Bäume 7 Kantone** *(F6≡F43, M)* — ZH/GE/VD/TI/SZ/NE/JU fehlen (19 von 26 vorhanden); Quell-Erhebung je Kanton empirisch und browserlos, kantons-einzeln frei. §1-A.
  - [ ] **K-14 · Kantonales Zitat-Vokabular — POC** *(F39, L — **Risikopfad**, `QS-GP`)* — POC über 5 Gerichts-Kantone × 6 Entscheide, nur exakte Sammlungsnummer-Matches, additiver Extraktions-Pass. **Prämisse «Entscheid-`normKeys` sind Bund-only» vor dem Bau gegen `W2·6-NKEY` nachmessen.** §1-A.
  - [ ] **KANTONE-DRIFT · Kantonale Snapshots gegen die Quellen nachführen** *(Befund 2.8.2026, **Risikopfad**, Skill `korpus-werkstatt` + `QS-GP`)* — beim Bundes-Durchgang vom 2.8.2026 (`--nur=bund`) meldete der Drift-Abgleich **~28 kantonale Snapshots mit echter Inhaltsdrift** — bewusst ausgeklammert und **unverifiziert**. **Reihenfolge gegen `K-7`** beachten. **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §3.
    <!-- @meta id: W2·13-KANTONE-DRIFT · status: ready · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **PDF-Pfad liest Ziffern-Tarife falsch** *(19B-Nachtrag 13.8.)* — SG-3849-Wurzel: generisches «Art. N»-Muster greift auch in Querverweisen; Regel «Nr. XX.YY am Zeilenanfang» nötig. Verdacht auch ZH-243, SG-2935, AR-1203. §1-A.
  - [ ] **Fassungs-Drift PDF-erfasster Kantons-Snapshots unbemerkt** *(19B-Nachtrag 13.8.; §17-Wurzel-Fix)* — `fassungsToken` (PDF-Inhalts-Hash) ändert sich nicht bei neuer Portal-Fassung. SG-2808: hängt an Version 2808/2012, amtlich gilt 3863 (seit 1.7.). Nötig: Tor `current_version.id` ↔ Snapshot. §1-A.
- [ ] **14-SIGNAL · Watchlist & Änderungs-Signale** *(Ideen-Intake 20.7.2026 · Infra/UI, kein Rechtsinhalt)*:
  <!-- @meta id: W2·14-SIGNAL · status: ready · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json, public/rechtsprechung/register.json, scripts/rechtsprechung, src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut ausschliesslich auf vorhandenen
  Signalen** (Currency/Register/Wiedervorlage); Speicherung lokal, Werkzeuge bleiben zustandslos.
  Dach-Schritt mit Checkliste, Bau-Reihenfolge B1 → B2 → GER (B2 liest B1-Artefakte).
  **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §16.
  - [ ] **B1 · Statischer Änderungs-Feed (🟢)** — RSS/Atom/JSON zur Build-Zeit aus `currency.json` + Verfallsregister; nur der VORWÄRTS-Fall (`naechsteFassungAb`).
  - [ ] **B2 · Client-Watchlist (🟢)** — localStorage-Liste gemerkter Normen, gegen Build-Artefakte geprüft; Rückblick-Flag gegen `fassungsToken`/`sha`, nie `geprueftAm`.
  - [ ] **GER · Gerichts-Delta mit ehrlicher Latenz (🟡)** — Build-Zeit-Delta je Gericht/Norm; eigenes Verdikt, Import-Kadenz sichtbar (§8).
- [ ] **15-CLS · Echter CLS-Defekt auf `/gesetze` (0.109 @8× CPU)** *(§14-Intake 20.7.2026 · **Produktfehler**, reine UI)*
  <!-- @meta id: W2·15-CLS · status: ready · blocker: null · dep: [] · kollision: [src/pages/Gesetze.tsx, src/components/start] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  Gemessener Produktfehler auf `/gesetze`, reine UI.
  **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §2.
- [ ] **16-INVENTAR · Funktions-Inventar (Vorstufe der Bedienungsanleitung)** *(§14-Intake 20.7.2026, David: «erst wenn es Sinn ergibt» → Zweischritt, dies ist Schritt 1)*
  <!-- @meta id: W2·16-INVENTAR · status: ready · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, bibliothek/INDEX.md] · worktree: ja · 26x: nein · groesse: M · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Ehrliche Aufnahme dessen, was Lexmetrik heute kann — Quelle `startseiteConfig.ts` (§5),
  Status-Modell ungeschönt (§8). **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §9.
- [ ] **16-ANLEITUNG · Bedienungsanleitung / Onboarding** *(§14-Intake 20.7.2026, David — Schritt 2, **bewusst spät**)*
  <!-- @meta id: W2·16-ANLEITUNG · status: ready · blocker: null · dep: [W2·16-INVENTAR] · kollision: [src/pages, src/components/layout] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Die Anleitung folgt dem Inventar (`dep`); bewusst spät.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §10.
- [ ] **17 · UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)** *(Auftrag David 31.7.2026, Lieferung einer externen Sichtprüfung vom 29.7.)*
  <!-- @meta id: W2·17-UI-BEFUNDE · status: ready · blocker: null · dep: [] · kollision: [src/components, src/pages, src/index.css] · worktree: ja · 26x: nein · groesse: L · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  Externe Sichtprüfung, geschnitten nach Bauteil; Dach-Schritt mit Checkliste (Blocker zuerst),
  alles reine Darstellungsschicht.
  **Detail:** [FAHRPLAN-UI-BEFUNDE.md](fahrplaene/FAHRPLAN-UI-BEFUNDE.md) §24 (Spec; Triage: §1).
  - [ ] **B6-N1 · LM-162-Umbau: Ergebniskasten wächst mit dem Inhalt** — Entscheid David 8.8.2026 («umentscheiden», revidiert den CLS-Festhöhen-Entscheid); Umsetzung muss das CLS-Budget trotzdem halten (reservierter Mindestplatz + sanftes Wachsen statt Festhöhe). §7 (LM-162).
  - [ ] **B6-N2 · LM-164-Umbau: «nicht erfasst» wird ausgewiesen** — Entscheid David 8.8.2026 («umentscheiden», revidiert die Doktrin «Default bleibt nackt»); Beschriftung ehrlich (§8), beide Themes. §7 (LM-164).
  - [ ] **B7-N1 · Scrim hinter Overlays (LM-010/LM-015)** — Entscheid David 8.8.2026 («scrim ja», revidiert die Minimalismus-Vorgabe vom 28.7. für Overlay-Hintergründe); dezent, Token-Rolle, beide Themes, a11y-fest. §8 (LM-010/LM-015).
  - [ ] **B8 · Menüinhalt, Zustandsanzeige und Scrollbereiche (K-03 + K-07)** — 10 Befunde (Blocker 1 · Hoch 3). §9.
  - [ ] **B9 · Textsatz und Umbruch (K-12)** — 12 Befunde (Blocker 1 · Hoch 2). §10.
  - [ ] **B10 · Aktions-Anker, Symbolknöpfe und Trefferflächen (K-09b)** — 7 Befunde (Blocker 1 · Hoch 1). §11.
  - [ ] **B11 · Karten (K-04)** — 13 Befunde (Blocker 0 · Hoch 4). §12.
  - [ ] **B12 · Eingabe- und Auswahlfelder — Blocker bis Mittel (K-08a)** — 11 Befunde (Blocker 0 · Hoch 4). §13.
  - [ ] **B13 · Zahlen-, Datums- und Zählformate (K-11)** — 12 Befunde (Blocker 0 · Hoch 3). §14.
  - [ ] **B14 · Brotkrume, Kopfzeilen und Seitenmeta (K-19a)** — 8 Befunde (Blocker 0 · Hoch 3). §15.
  - [ ] **B15 · Umschalter, Tabs und Akkordeons (K-06)** — 9 Befunde (Blocker 0 · Hoch 2). §16.
  - [ ] **B16 · Seitengerüst und Inhaltsbreite (K-13)** — 8 Befunde (Blocker 0 · Hoch 2). §17.
  - [ ] **B17 · Schaltflächen — Varianten, Gewichtung, Deaktiviert-Zustand (K-09a)** — 8 Befunde (Blocker 0 · Hoch 1). §18.
  - [ ] **B18 · Listen, Suche und Relevanz (K-19b)** — 8 Befunde (Blocker 0 · Hoch 1). §19.
  - [ ] **B19 · Eingabe- und Auswahlfelder — Detail (K-08b)** — 7 Befunde (Blocker 0 · Hoch 0). §20.
- [ ] **18-FEHLERBUCH · Davids Alltags-Fehlerfunde (stehender Sammel-Schritt)** *(Entscheid David 8.8.2026 — Kleinvieh bündeln statt einzeln durch die volle Maschine)*
  <!-- @meta id: W2·18-FEHLERBUCH · status: ready · blocker: null · dep: [] · kollision: [src/components, src/pages] · worktree: nein · 26x: nein · groesse: M -->
  - [ ] **e2e-Assertions-Latten unter CPU-Aushungerung** *(QS-E2E-STABIL-Messreihe 14.8.: eigene Klasse, kein Timeout — international-kanonik-ia6 3× toBeInViewport, gesetze-ia-v2-walks, suche-seite:27 expect.poll, verlauf-o1, qsui-Vorlagen; wandert je Lauf mit Aushungerungstiefe. Methode wie QS-E2E-STABIL, aber gedeckelte Lastbedingung — nie die verworfene Übersättigung.)*
  - [ ] **druck-fundstellen-z2 flakt NUR auf CI-Runnern** *(CI-Forensik 14.8.: 10 Vorkommen/30 Tage; lokal 11/11 sauber bei 19,8 s gegen 30-s-Budget — braucht Runner-Messung, kein lokaler Fix; blosses Budget-Hochsetzen ohne Messreihe bleibt ausgeschlossen.)*
  - [ ] **Kalender-Export: Termine als «frei» markieren (TRANSP:TRANSPARENT)** — Go David 8.8.2026 («frei ok»); bricht deklariert einen Golden-Anker ⇒ fachliche Änderung mit Golden-Neuschrieb im eigenen Commit (Herkunft: Session-Karte 3./4.8.2026, archiv/STRUKTUR-SESSIONKARTEN.md).
  - [ ] **LM-016-Wurzel: Topbar-Icon-Zeile an die Brotkrume-Breite angleichen** (Befund B7 8.8.2026, zurückgestellt: braucht eigenen Entscheid statt Menü-Pflaster).
  - [ ] `check:design-tokens` scannt Kommentartext mit (Utility-Platzhalter im Kommentar = rotes Tor, je Vorfall ein Zyklus); Wurzel-Fix: Kommentar-Strip vor dem Scan, einmal rot zeigen (§6.7). *(Agent-Fund 8.8.2026.)*
  - [ ] **Perf-Blick auf den langen Artikel-Index (aus PR #486):** der flache Index ist bewusst nicht virtualisiert; seit dem B3-Wegfall trägt SG-3849 607 Zeilen (davon 590 im Anhang-Ast, der bei Anhang-Dominanz aufgeklappt startet), ZH-243 152. Messen, ob das auf schwachen Geräten trägt — sonst Virtualisierung des Index als eigener Schritt (Skill `perf`).
  - [ ] **`check:materialien` läuft durch blossen Kalender-Ablauf rot** — das Tor misst Kalenderzeit statt Korrektheit; Wurzel-Fix: abgelaufene Fristen deterministisch als «abgeschlossen» ableiten oder auf Harvest-Alter umstellen.
  - [ ] **Muster «Test pinnt von-Hand-Tageswert» anderswo suchen** — der `registerStand`-Fall (garantierter Fehlalarm bei jeder Pflege) ist gefixt; Geschwister finden.
  - [ ] **Alt-Flake `qsui-hierarchie.e2e.ts` (Vorlagen-Block, ~25 %/Fall, Nullprobe-belegt 25/84 auf main):** Wurzel-Fix mit Mandat; Familie + Zahlen im a33-Dossier-Nachtrag (PR #480).
  - [ ] **Alt-Flake `leser-weiterlesen-r4-r8` (Shard-Kontext, vorbestehend, Befund 9.8.2026):** gleiche Familie; Wurzel-Fix mit Mandat, Messbedingung protokollieren.
  - [ ] **Flake-Beobachtung 14.8.2026 (Voll-Suite, isoliert grün):** `gesetze-historie-badge` Lade-CLS-Budget (§15-Messrauschen unter Last) + `leser-kontext-e4` Deeplink — je 1× rot bei 539 grün, Wiederholung 8/8 grün; bei Wiederkehr zur CLS-/Leser-Flake-Familie schlagen.
  - [ ] **Klick-Pfad der Gliederungs-Zeile (Perf-Restposten W2·19):** 161 ms @4×, OR/BGFA-Verhältnis 7→14.6 verschlechtert; Messpunkte in der Perf-Nachmessung (bibliothek, via PR #480). Skill perf.
  - [ ] **Lese-Kadenz-TBT @4× (U3-Rest, ~10 s/32 s, @1× unmerklich):** Spy-/Zuklapp-/Re-Render-Pfad; Messvorschrift: Kadenz-Kopfzeile der Nachmessung.
  - [ ] **Liste `/gesetze`: ~370-px-Leerfläche am Seitenende schliessen** (LM-163-Alternativerklärung, risikoarm; Nachprüfung 9.8.2026).
  - [ ] **Wording bei Anhang-Dominanz:** «N Artikel» → «Einträge» o. ä., Kopf UND Erlass-Übersicht zugleich (§5; SG-3849 97 % Anhang).
  - [ ] **Tor gegen case-blinde Korpus-Pfad-Literale** (`public/normtext/**.json`-Strings zeichengenau gegen den git-Baum; macOS case-blind vs. Linux-CI, PR #478): `normtext-fixture.ts` deckt nur Nutzer; einmal rot zeigen (§6.7).
  - [ ] **tor-schutz.py: Trailer-Block-Format beim Commit prüfen** — ein `Gegenpruefung:`/`Roadmap:`-Trailer mit Leerzeile IM Block wird von git nicht als Trailer geparst und fällt erst als roter Merge-Schutz im CI auf (ein voller Zyklus; real 13.8.2026, PR #487, trotz Memory-Eintrag). Hook-Check beim Commit = Wurzel-Fix; einmal rot zeigen (§6.7). *(Konfig-Fläche — Umsetzung mit David-Freigabe.)*
  - [ ] **Tor gegen die Flake-Familie «einmaliges DOM-Lesen ohne Wartung»** (`boundingBox()!`, ungewartete Einzel-Lesungen in `page.evaluate`): vier belegte Fälle, je ein Diagnose-Zyklus Kosten; einmal rot zeigen (§6.7).
  David sammelt Fehler aus der täglichen Nutzung formlos hier als `- [ ]`-Zeile (oder meldet sie im
  Chat — die Session trägt sie ein); Fix-Batch-Sessions arbeiten mehrere Positionen sortenrein ab.
  **Risikopfad-Funde gehören NICHT hierher**, sondern in den passenden Risiko-Dach-Schritt. Der
  Schritt bleibt stehen (nie `done`); Erledigtes wird abgehakt und periodisch in die Chronik geräumt.

### Welle 3 — Tiefe / Breite (opportunistisch)

- [ ] **W3-AUSBAU · Welle-3-Ausbau: Rechner · Fedlex · Vorlagen · UI** *(`[OF]`, Dach-Schritt der Etiketten-Fusion 15.8.2026)* — vier Horizont-Stränge unter einem Dach, opportunistische Reihenfolge; **je Zeile eine sortenreine Bau-Einheit** (Flächen nie in EINER Session mischen). `W3·12` (26×-Slot-Inhaber) und `W3·15-RICHTER` (Freigabe-Gate) bleiben ausdrücklich eigenständig.
  <!-- @meta id: W3-AUSBAU · status: ready · blocker: null · dep: [] · kollision: [src/lib, src/pages, src/components/layout, src/App.tsx, scripts/fedlex-wiedervorlage-generieren.ts, public/normtext, tailwind.config.js] · worktree: ja · 26x: nein · groesse: L -->
  · [ ] **Neue Rechner-Klingen** *(Fläche Rechner, §2/§7)* — Zustellfiktions-Engine · Gesellschaftsrechts-Schwellen (OR 727/671/653s) · IGE-Gebühren · Geltungsstand-Prüfer · Kantonale Gerichtsferien-Datenschicht (26×-Asset, Slot beachten). **Erster Arbeitsschritt:** Restpunkte-Extraktion aus `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3 in einen aktiven Fahrplan (deklarierte Archiv-Ausnahme). (fusioniert 15.8., vormals `W3·10`)
  · [ ] **Gesetzgebungs-/Rechtsetzungs-Tracking** *(Fläche Fedlex, amtlich)* — Übersicht «was kommt»: Parlamentsgeschäfte (parlament.ch), künftige-Fassungen-Drift, Übersichtsseite «alle laufenden Vernehmlassungen», Laufend-Badge im Reader-Kopf; Andockpunkt `fedlex.ts`/Drift-System. (fusioniert 15.8., vormals `W3·11`; Fahrplan: `fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3`)
  · [ ] **Vorlagen-Breite** *(Fläche Vorlagen)* — Tiefe vor Stückzahl: GmbH qualifizierte Gründung (777c II) · Musterklagen (Bauhandwerkerpfand) · Basistypen (Kauf/Fahrniskauf Art. 184 ff. dispositiv, Schenkung/Pacht/Darlehen/Bürgschaft); eigener Worktree. (fusioniert 15.8., vormals `W3·13`; Fahrplan: [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §10 (Vertrags-Varianten) + §11 (GmbH-Gründung))
  · [ ] **Gemeinde-Validierungsliste (BFS eCH-0071)** *(Fläche Rechner)* — Build-Time-Snapshot mit gepinntem Stichtag; prüft Ortseingaben in `zustaendigkeit.ts`/`schkgZustaendigkeit.ts` und Vorlagen als **Hinweis** (nie Blockade, §8); kein historisierter Bestand (§1 unberührt). (Entscheid QS-EXTQUELLEN 15.8.; Beleg: `bibliothek/recherche/externe-quellen-repos-2026-08-03.md` §1.3)
  · [ ] **QR-Zahlteil (`swissqrbill`, MIT)** *(Fläche Vorlagen)* — gebunden an die Existenz einer Zahlungs-Vorlage (Honorarnote/Kostenvorschuss/Mahnung); browser-seitig, deterministisch; §15-Bewertung der Bundle-Wirkung vor Aufnahme. (Entscheid QS-EXTQUELLEN 15.8.; Beleg: ebd. §2)
  · [ ] **PDF/A-2b-Export vorbereiten** *(Fläche Vorlagen, Wiedervorlage 1.1.2027)* — BEKJ tritt 1.7.2027 in Kraft, `jspdf` erreicht PDF/A-2b nicht → Export-Schicht-Umbau mit Vorlauf. (Entscheid QS-EXTQUELLEN 15.8.; Beleg: ebd. §2)
  · [ ] **Multi-Pane / Split-View** *(Fläche UI, Fundament-Umbau, eigener Worktree §12; Auftrag David 29.6.2026)* — 2–3 «Engines» nebeneinander wie im Browser → Verzahnungs-Burggraben sichtbar (Gesetz | Rechner | Begründungs-Absatz). Offene Restposten: B3 Scroll-POSITIONS-Wiederherstellung (`App.tsx` noch window-basiert) + Tastatur-Pane-Wechsel · Bündel S (S1 Breadcrumb in der Pane, S2 Tracker «alles schliessen») · 3 verifizierte a11y-Restpunkte der Pane-Schicht. (fusioniert 15.8., vormals `W3·14`; Fahrplan: [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1)
- [ ] **12 · Kanton-Gesetze-Bündel** *(GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6 + POPUP-Kanton-Rest, 26×)*. **Erst öffnen, wenn
  <!-- @meta id: W3·12 · status: ready · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/kanton, src/pages/gesetz-leser] · worktree: nein · 26x: ja · groesse: L · fahrplan: fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md · slot: inhaber -->
  Hält den 26×-Slot (`slot: inhaber`); nie zwei 26×-Assets parallel (Leitprinzip 4).
  **Detail:** [FAHRPLAN-GESETZE-IMPORT-3TIER.md](fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md) §6.
- [ ] **15-RICHTER · Spruchkörper-Analytik** *(Ideen-Intake 20.7.2026 · **bewusst freigabe-pflichtig**)* —
  <!-- @meta id: W3·15-RICHTER · status: blocked · blocker: richter-analytik-gate · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung, src/pages/Rechtsprechung.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Ausschliesslich deskriptive Spruchkörper-Muster; **keine Erfolgsquoten, keine Prognose über
  Personen** (§2/§8). Bleibt freigabe-pflichtig.
  **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §14.

---


## Geparkt (bis ≥1.12.2026 / Nutzerfeedback / Markt)

- **Dossier / Fall-Rückgrat** *(FALL-RUECKGRAT, G3.3, PRODUKTAUSBAU Säule A)* — Mandats-/Dossier­
  verwaltung & «Meine Fristen». Vorerst draussen; alle Werkzeuge bleiben stateless. Umfasst auch
  das nie gebaute schlanke URL-Kontext-Rückgrat (PRODUKTAUSBAU P2, A-E0–E3 `fallakte`/`c_`-Transport)
  samt Bau-Auflagen (keine Kanonisierung mehrdeutiger Beträge, `koPrefill` nicht anfassen) — Detail
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P2.
- **Markt-Themen** — Hosting (Infomaniak), Domain `lexmetrik.ch`, Zahlung (Payrexx/Datatrans/TWINT),
  Login/Pro.
- **Live-Rechtsprechung** — §4-blockiert (s. Verifikations-Blockaden).
- **Betriebs-Instrumente (später):** Sentry (erst bei Traffic; A5-Fehler-Link deckt jetzt) · CodeQL ·
  Claude-Code-PR-Action (bewusster Entscheid) — Detail + Verworfen-Liste:
  `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`. *(`npm audit` 3.8.2026 aus dieser Liste genommen: die
  Meldungs-Variante ist eine Checklisten-Zeile unter `QS-BASIS`; geparkt bleibt nur die Stopper-Variante.)*
- **Abnahme-Warteschlange** (Haftungsrang: 1 Fristen → 2 Form-Gate-Vorlagen → 3 Beträge; aufgereiht,
  nicht gedrängt): BGER-RECHTSWEG (§7) · BEURKUNDUNGS-AUSBAU · NOTARIAT/LUECKEN (`geprüft`) ·
  GESETZESTEXT-POPUP-Snapshots · GRUNDLAGEN G2/B.
- **Offene David-Grundsatzfragen** (gebündelt mitführen): Dienstjahr-Stichtag Kündigungsfrist ·
  Sperrtage-Konvention · 3 Export-Antworten · GebV-SchKG-Promille-Rundung (0.01 vs. amtlich 0.05).

---

## Pflege & Termine  *(Quelle: `bibliothek/register/parameter-verfall.md`)*

- **30.6.2026** — SG-GKV (erledigt, s. Chronik → S0). · **Anfang Sept.** — Referenzzins (quartalsweise).
  · **1.11.2026** — BE-Formularpflicht. · **Vor SchKG-Abnahme** — GebV-SchKG-Revision AS 2025 630 vs.
  Staffel 1.1.2022. · **Vor Mietvertrags-Abnahme** — VMWG Art. 19a am Original. · **Feiertage** je
  Kanton vor «geprüft» (BJ-Liste Stand 2011).
- **1.1.2027 — Ganz-Aufhebung `PatV` (SR 232.141) und `VGV` (SR 814.621).** Beide sind in
  `scripts/fedlex-cache.sh` gepinnt und werden per 1.1.2027 **vollständig aufgehoben** (amtlich
  angekündigt, maschinell aus dem Fedlex-SPARQL-Graphen geerntet; Register-Lauf 3.8.2026 —
  `bibliothek/register/parameter-verfall.md` §«Aufgehobene und zur Aufhebung angekündigte Erlasse»).
  Massnahme am Stichtag: Snapshot ersetzen/entfernen, Nachfolgeerlass prüfen (§7/§8) — ein
  ausgeliefertes Gesetz, das es nicht mehr gibt, ist der schwerere Fehler als eine Lücke.
  **Bereits erfolgt:** `BMV` (SR 412.103.1) aufgehoben 1.3.2026 — Aufhebung nachgeführt in #287,
  Register-SSoT-Filter in #422; **Nachfolger `cc/2025/408` (gleiche SR, in Kraft 1.3.2026) fehlt
  noch im Korpus** → Schritt `QS-KORPUS`, Zeile «Geltende BMV in den Korpus aufnehmen» (vormals `QS-KORPUS-BMV`).

---

## Funktions-Katalog (Aufbau + Auflagen je Werkzeug)

Quellen durchgehend amtlich (Fedlex / amtliche Sammlungen / amtliche Entscheide+Regesten / amtliche
Tarife+Verzeichnisse — Art. 5 URG). Alle Werkzeuge **stateless**. «grenzwertig» = amtlich nutzbar mit
harter Auflage.

**Katalog-Tabelle (18 Werkzeuge: Welle · neu/vorhanden · §2 · Quelle · Aufwand) und die Kern-Auflagen
je Werkzeug** stehen wörtlich in [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §1
(Tabelle dorthin verschoben 3.8.2026, damit Katalog und Auflagen an EINEM Ort stehen, §5). Sie sind
Bau-Auflagen, keine Steuerung — vor dem Bau des jeweiligen Werkzeugs lesen.

---

## Strang-Detailpunkte & Hygiene  *(steuern nicht — Heimat = jeweilige `fahrplaene/FAHRPLAN-*.md`/`STRUKTUR.md`)*

- **Offene Detailpunkte · Infrastruktur-Fundament · Archiv-Kandidaten · Stale Doku-Köpfe · Klein-Backlog**
  — wörtlich ausgelagert nach [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §2 (Stand 31.7.2026).
- **Restpunkte der Archiv-Welle 31.7.2026** (20 `FAHRPLAN-*.md` verify-then-archive nach `archiv/`, je
  Datei ein Nur-Lese-Opus-Verdikt, alle NUR-MIT-NACHTRAG) — wörtlich in
  [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md), je Strang ein § (§1–§20),
  dort auch die Herkunft (AP-3/AP-4) und die drei begründet im Root gebliebenen Dateien. Die frühere
  20-zeilige Strang-Liste hier war ein zweites Inhaltsverzeichnis derselben Datei (Chronik 3.8.2026).

---
*Verschlankt 14.8.2026 (`QS-PLAN-EINFACH`): Schritt-Prosa auf Zielform gekürzt; abgelöste Wortlaute
stehen in der git-Historie (Stand vor der Kürzung: Commit `cc89fd3d0`) und in `ROADMAP-CHRONIK.md`.*
