# LexMetrik — Handlungsplan (DER eine Steuerungsplan)

> **Stand 20.7.2026.** Die **einzige Steuerungsquelle**: sie entscheidet **Reihenfolge** +
> **bau-jetzt vs. geparkt** und ist so geordnet, dass eine **künftige Session sie autonom
> Schritt für Schritt abarbeiten** kann. Sie faltet das frühere `HANDLUNGSPLAN.md` ein
> (→ `archiv/`). Das *Wie* je Strang steht in der jeweiligen `fahrplaene/FAHRPLAN-*.md` (Detailquelle),
> der **Ist-Zustand/Deploy** in `STRUKTUR.md`, die G1-Praxis-Abdeckung in `KATALOG-ROADMAP.md`.
>
> **Chronologische Ordnungs-Schicht:** `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` (Council+Fable 2.7.2026) ordnet
> ALLE offenen Stränge in **7 Phasen bis zum Nordstern** (Juli 2026 → ab Mitte 2027) — 4 Parallel-Bahnen,
> serieller 26×-Slot (@meta-Etikett), Autonomie bis 1.12.2026, Abnahme-Welle ab Feb 2027. Sie ist eine
> **reine Lese-/Ordnungs-Sicht** (steuert nicht selbst): Sie **ordnet** diese ROADMAP, ersetzt sie nicht;
> bei Divergenz gilt die ROADMAP nach Davids **Freigabe-Paket T0b** (= der David-Touchpoint «Freigabe-Paket»,
> definiert in `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` Phase 0 — ein ~30-Min-Ja/Nein-Paket, ohne das der Default gilt).

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Nimm den obersten offenen Schritt** der «Geordneten Abarbeitung», dessen Abhängigkeiten
   erfüllt sind (`[OF]` zuerst; `[D]`/blockierte überspringen). Die **phasen-übergreifende
   Reihenfolge** (welcher Strang wann, konfliktfrei) gibt `fahrplaene/FAHRPLAN-GESAMTAUFBAU.md` vor.
2. **Halte die Leitprinzipien** (Zeitsperre/`[OF]` · amtliche Quellen · nie zwei 26×-Assets
   parallel · Worktree-Isolation · golden-gegated · Deploy nur auf Davids Ja).
3. **Bau in eigenem Worktree**, wenn der Schritt eine Kollisionsdatei berührt (§12).
4. **Gate vor Abschluss:** `npm run gate` grün; verhaltensändernd ⇒ Golden byte-gleich.
5. **Markiere erledigt** (Häkchen + Datum hier), zieh die Session-Karte in `STRUKTUR.md` nach,
   → nächster Schritt. **Push/PR/Auto-Merge stehend freigegeben (§9 Weg 1, David 3.7.2026:
   Merge nach `main` = Deploy-Entscheid; die §9-Sorgfalt — Tore/Golden/Bug-Check — gilt VOR dem
   Merge).** *(Ersetzt das frühere «Push/Deploy nicht selbst — sammeln fürs Batch-Deploy-Fenster».)*
6. **Erledigt-Prosa gehört in die Chronik (Token-Ökonomie, QS-TOK/T7).** Wird ein Schritt
   abgeschlossen, kommt die ausführliche Abschluss-Prosa («gebaut/PR#…/Beweise») **direkt** nach
   [`ROADMAP-CHRONIK.md`](ROADMAP-CHRONIK.md); hier bleibt nur Checkbox + `@meta` + Einzeiler +
   Pointer. So bläht `ROADMAP.md` (der Session-Einstieg) nicht wieder auf. **Nie zusammenfassen**
   (voller Wortlaut in der Chronik) — nur verschieben.
   **Nachhalte-Konvention (QS-TOK/AP-11, 31.7.2026): am Zielort schreiben, nicht später
   umräumen.** Abschluss-/Erledigt-Prosa wird von Anfang an **direkt in `ROADMAP-CHRONIK.md`**
   verfasst (hier nur Einzeiler + Pointer); die **Spec-Prosa eines neuen Schrittes** ebenso von
   Anfang an **direkt in die zugehörige `fahrplaene/FAHRPLAN-*.md`** (hier nur Titel, `@meta`,
   ein bis zwei Sätze Zweck, `**Detail:**`-Link). Wer erst hier ausformuliert und später
   auslagert, zahlt die Diät zweimal — die Welle vom 31.7.2026 hat genau das gekostet.
   **Kontrolle ist kein neues Tor**, sondern der bestehende Re-Akkumulations-Wächter
   `python3 .claude/hooks/struktur-rotieren.py --check` (läuft bei SessionStart; Ceilings
   `ROADMAP.md` 100 KB · `STRUKTUR.md` 60 KB). Meldet er rot, ist Prosa am falschen Ort
   gelandet — dann verschieben, nicht das Ceiling heben.

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

**Verzahnung als Rückgrat (Organisationsprinzip, kein Einzelfeature):** die tragenden Schritte
dieses Plans sind Glieder EINES Graphen — W1·2 (Norm↔Werkzeug, live) · W2·6 Norm→Entscheid +
W2·6-DATA E4 Zitat-Graph · W2·7 Verzahnungs-Klingen · E5/E6a/E6b (Kanton-Entscheide, VerwVO,
Materialien) · W3·14 Split-View (macht den Graphen sichtbar). Das kann kein einzelnes Amtsportal —
darum ist die Verzahnung Burggraben UND das Kriterium, nach dem neue Schritte einsortiert werden
(§14: neue Doktypen docken immer an den Graphen an, nie als Silo). Der bestehende Code-Bestand dazu
(kontext.ts/KontextPanel/norm-index) ist in `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §0bis inventarisiert.
*Ehrliche Grenze: das Rückgrat ist Plan-Doktrin, kein maschinelles Tor — es wird über
§14-Einsortierung und Review gelebt, nicht von einem `check:` erzwungen.*

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
6. **Push/Deploy nur auf Davids frisches Ja (§9);** jeder verhaltensändernde Schritt golden-gegated
   (§6). **§1 (Logik vor allem) / §5 (eine Quelle)** sind Invarianten über allen Wellen.
   **Zustandslosigkeit** (kein Dossier-Creep) ist Querschnittsregel.
7. **Geräte-Last: nicht merklich langsamer — ausser bei Logikverlust** (Anweisung David 30.6.2026,
   voll in **CLAUDE.md §15**). Lexmetrik darf den Computer des Nutzers nicht merklich verlangsamen,
   **solange daraus kein Logikverlust** (Inhalts-/Rechtsregel-/Funktions-Treue, golden-Byte-Gleichheit)
   entsteht; bei Konflikt gewinnt **immer die Treue** (§1-untergeordnet). Jede Optimierung trägt eine
   explizite Logikverlust-Bewertung. Operationalisiert durch das Tor **`check:perf-budget`** →
   Querschnitt **`QS-PERF`** / **`fahrplaene/FAHRPLAN-PERFORMANCE.md`**.

**Verifikations-Blockaden (einmal definiert, danach nur referenziert):**
- **§4 — Lizenz/CORS für Live-Rechtsprechung** (CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits
  unbestätigt) → Rechts-/Lizenzbeurteilung = **`[D]`**. Solange offen: ENTSCHEIDSUCHE-P1 &
  KANTONALE-P1-Adapter **geparkt**. Nicht-§4-blockierte Korpus-/Übersichtsarbeit ist ausgenommen.
- **Prozesskosten I2** ⟵ Recherche `wbqdyap3x` (Schlichtungs-/Reduktionsfaktoren).

<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Schlichtungs-/Reduktionsfaktoren. EIGENTÜMER: kein David-Gate — die Recherche ist [OF] und selbst Teil von W1·4. Also zuerst erledigen, nicht als Wartegrund führen (sonst bleibt der Hauptmoat dauerhaft geparkt).
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
26x-slot: FREI seit 3.7.2026 (E3 fertig), aber bis 20.7.2026 nicht zurückgegeben — 17 Tage grundlose Blockade von W3·12. Slot am 20.7.2026 per @slot-kette an W3·12 übergeben (Kanton-Gesetze, Leitprinzip 4 + Davids Reihenfolge-Entscheid 2.7.: «E3 zuerst, W3·12 danach»). Dieser Blocker ist damit AUFGELÖST und wird von keinem Schritt mehr referenziert; Eintrag bleibt als Beleg der Kette stehen.
vps-bestellung-david: E3-Serving + E4-UI hängen an einer VPS-Bestellung (David, ~15 Min) — Dossier `bibliothek/betrieb/vps-bestell-dossier-2026-07-17.md` (PR #271). ECHTES David-Gate, kein Bau-Blocker. Bis dahin sind QS-DATA/W2·6-DATA nur im NICHT-VPS-Teil baubar (E0–E4 sind lokal fertig). Befund 20.7.2026: dieser Blocker stand bisher NUR im Fliesstext («🔒 BLOCKER»), das @meta trug `blocker: null` — für `check:plan` unsichtbar.
zeit-historik-poc: Norm-Zeitmaschine/Fassungs-Diff (W2·5g-ZEIT) — historische Fedlex-Konsolidierungs-Extraktion fehlt (auf Platte nur die geltende Fassung; SPARQL dateApplicability vorhanden, Durchlauf gross); POC + Bau-GO je Kandidat durch David ausstehend. UMFASST AUCH die beiden Vorbedingungen, die KEINE getrackten ROADMAP-Schritte sind und darum nicht als `dep` abbildbar wären: AKN-XML-Phase 1 (Quell-Architektur-Entscheid Council 30.6., schaltet M16 frei) und G-HIST als Daten-Unterbau (beide dokumentarisch im Strang-Detailblock oben + fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake, Bau-GO je Kandidat ebenfalls offen)
david-spaeter-tabellen: Tabellen-Darstellung in Gesetzen (W2·5j-TABELLEN). KEIN technischer Blocker — Daten und Weg sind geklärt (656 `mehrspaltig`-Blöcke, 137 Erlasse); David hat den Punkt am 20.7.2026 ausdrücklich auf «später» gesetzt. Auflösung = Davids Ja, kein Bau-Vorlauf nötig.
richter-analytik-gate: Richter-/Spruchkörper-Analytik (W3·15-RICHTER). GRENZE (20.7.2026): Filtern/Facette/Verlinkung sind FREI und gebaut (#309/#311); gesperrt bleiben allein RANKING und PROGNOSE. Nur deskriptiv; bewusste Freigabe Davids erforderlich (heikel: Standesrecht, Persönlichkeitsschutz, richterliche Unabhängigkeit)
-->

<!-- @slot-kette (dokumentarisch; harte Prüfung via @meta-Feld `slot: inhaber`, check.ts 5b)
inhaber: W3·12 (Kanton-Gesetze, übergeben 20.7.2026 — E3 war seit 3.7.2026 fertig, der Slot nur nie zurückgegeben)
kette: ~~E3(W2·6-DATA) ✅ 3.7.2026~~ · W3·12(Kanton-Gesetze) ← JETZT · Tarif-Bündel(W1·4) · E5(Kanton-Rechtsprechung, W2·6-DATA) · Gerichtsferien-Matrix
begruendung-uebergabe: E3 ist gebaut (195 342 Entscheide, 2 Voll-Läufe determinismus-gleich, Gegenprüfung bestanden) ⇒ Leitprinzip 4 «eine Säule fertig führen» erfüllt. Der offene E3-**Serving**-Rest ist KEIN Massenimport, sondern hängt am David-Gate `vps-bestellung-david` — er rechtfertigt keine Slot-Bindung. Nächstes Kettenglied ist laut Kette W3·12 (Davids Reihenfolge-Entscheid 2.7.2026, `fahrplaene/FAHRPLAN-DATENHALTUNG.md` §10(1)); W1·4 wäre falsch (26x: nein + eigener Blocker `wbqdyap3x`).
uebergabe: nur per explizitem `plan:set <id> slot=inhaber`-Commit; check:plan erzwingt höchstens EINEN Inhaber (muss 26x: ja)
-->

---

## Querschnitt-Band (läuft begleitend — kein Reihenfolge-Slot)

- **Status-Marker-Audit + Verifikations-Infrastruktur** *(LERNPHASE A/B, `[OF]`)*. Jede Karte/Engine
  <!-- @meta id: LERNPHASE-AB · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  trägt sichtbaren ehrlichen Status (`verified`/`entwurf`/`geplant`) + Stand; Golden-Abdeckung &
  Norm-Anker-Prüfung automatisieren. **Dach-Auftrag offen** (die drei Werkzeug-Andockungen sind
  seit 5.7.2026 fertig, Strang A und die Anker-Automatisierung nicht). **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §1.
- **Adversariale Gegenprüfung — systematisiert** *(QS-GP, LERNPHASE B, `[OF]`)*, neu 29.6.2026 —
  <!-- @meta id: QS-GP · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-LERNPHASE-2026.md -->
  erweitert die Verifikations-Infrastruktur: adversarialer Zweitdurchgang (unabhängiger Opus-Agent,
  frischer Kontext, Auftrag «Output widerlegen») als Tor statt Session-Disziplin. Bausteine a+b+c
  gebaut+live (PR #67); **offen bleibt Baustein d** (rückwirkende Kampagne) — davon ist nur Stufe 1
  «Rechnen» gelaufen, offen Stufe 2 (extrahierte Normen), Stufe 3 (Rest) + BGE-Korpus-Regenerierung.
  **Detail:** [FAHRPLAN-LERNPHASE-2026.md](fahrplaene/FAHRPLAN-LERNPHASE-2026.md) §2.
- **Plan-Hygiene-Wächter** *(QS-PH, `[OF]`)*. Mechanischer Check im Tor `check:plan`
  <!-- @meta id: QS-PH · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md -->
  (**Regel 7**, `scripts/plan/check.ts` — *nicht* im SessionStart-Hook `struktur-aktuell.py`;
  Zuschreibung korrigiert 31.7.2026, QS-TOK/AP-11): meldet **rot**, sobald eine neu hinzugefügte `fahrplaene/FAHRPLAN-*.md`
  **nicht aus `ROADMAP.md` verlinkt** ist — setzt die Plan-Hygiene-Regel durch (jede `fahrplaene/FAHRPLAN-*.md`
  muss aus der ROADMAP referenziert sein, sonst steuert sie unsichtbar; CLAUDE.md §14 Ziff. 1). Detail + Etikett-System: **`fahrplaene/FAHRPLAN-PLAN-STEUERUNG.md`** (Tor `check:plan` = Etikett-Konsistenz + FAHRPLAN-Verlinkung der referenzierten Dateien).
- **Automatik-Gesundheit: läuft unsere Automatik wirklich?** *(QS-AUTOMATIK, `[OF]`, neu 20.7.2026 — §14-Intake)*.
  <!-- @meta id: QS-AUTOMATIK · status: ready · of: ja · blocker: null · dep: [] · kollision: [.github/workflows, scripts/datenhaltung/check-turso-frische.ts, scripts/check-ci-laeufe.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  **Läuft unsere Automatik wirklich, und würde sie scheitern können?** Gebündelt aus zwei Befunden
  vom 20.7. (a zwei tote Workflows `normen-monitor.yml`/`fedlex-frische.yml` · b Turso-Wächter-
  Abdeckung + Alarmpfad + Wachstums-Schwellen). **Leitplanke:** jedes Tor gegen eine *unabhängige*
  Referenz prüfen und seine Scheiterns-Fähigkeit an einem ECHTEN Aufruf belegen (§6 Ziff. 7).
  a/b sind reine Prüflogik (`Gegenpruefung: n/a`); der `chemrrv`-Re-Pin (a′) ist die Ausnahme —
  Extraktions-Risikopfad ⇒ eigener Commit mit `QS-GP`-Verdikt, kein Auto-Merge.
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §1. Trailer `Roadmap: QS-AUTOMATIK`.
- **Wissens-/Werkzeug-Infrastruktur** *(QS-WISSEN, `[OF]`, neu 10.7.2026)*.
  <!-- @meta id: QS-WISSEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-NOTEBOOKLM-EINSATZ.md -->
  NotebookLM als **menschen-seitige** Recall-/Recherche-Oberfläche über den stabilen
  LexMetrik-Doku-Korpus (David lädt FAHRPLÄNE/ROADMAP/Register/Dossiers hoch; Quellenzitat je
  Antwort, Audio-Overview). **Kein** Ersatz für die `STRUKTUR.md`-Navigation und **kein**
  In-Session-Query des Assistenten — kein ToS-konformer Consumer-API zum programmatischen
  Abfragen/Bespielen. Schwester zu `[[werkzeuge-zuerst-pruefen]]`. Detailquelle:
  **`fahrplaene/FAHRPLAN-NOTEBOOKLM-EINSATZ.md`** (Machbarkeits-Matrix, 6.7.2026). **Status: bereitgestellt**
  — die Notebook-Befüllung selbst ist Davids Handschritt, kein Bau-Auftrag.
- **SEO/A11y** *(SEO-A11Y-GOVERNANCE)*. A11y zahlt auf Bedienbarkeit ein → begleitendes Tor
  <!-- @meta id: SEO-A11Y · status: ready · of: ja · blocker: null · dep: [] · kollision: [public/normtext/register.json, src/lib/seo.ts, scripts/prerender.ts, vercel.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SEO-A11Y-GOVERNANCE.md -->
  (Tabellen-Semantik, Tastatur-e2e, hreflang). Reines SEO geparkt. **Bedingung der Gleichzeitigkeit:
  eigener Worktree.**
- **Gesetze-Currency & Coverage** *(QS-CURRENCY, `[OF]`, neu 4.7.2026 — Fedlex-Portfolio Paket 1)*.
  <!-- @meta id: QS-CURRENCY · status: done · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-cache.sh, public/normtext/register.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Kein Bund-Erlass wird veraltet ausgeliefert, keine Currency-Lücke bleibt strukturell
  unsichtbar. Detailquelle **`fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md`** (Paket 1, P1-a…d). **Paket 1
  komplett 5.7.2026 (P1-a–d, Gegenprüfung bestanden); Etikett-Korrektur 20.7.2026 ⇒ `done`,
  kein Rest unter diesem Etikett.** Laufende Korpus-Pflege läuft als Automatik weiter (Gesundheit
  überwacht `QS-AUTOMATIK`). Wortlaut → `ROADMAP-CHRONIK.md` → QS-CURRENCY (26.7.2026).
- **Geräte-Last / Performance** *(QS-PERF, `[OF]`, neu 30.6.2026 — Leitprinzip 7 + CLAUDE.md §15)*.
  **§14-Intake 20.7. + 24.7.2026 (David):** TBT-Budget `/gesetze/bund/OR` (#28) — Nullprobe +
  Streuung VOR jeder Feature-Zuschreibung, Lighthouse-Median n≥3 · CI-Pfad-Filter für Doku-/Plan-PRs
  mit **protokolliertem SKIP** (§6 Ziff. 7 lit. b), Tore-Job läuft immer.
  <!-- @meta id: QS-PERF · status: wip · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  Lexmetrik soll Computer **nicht merklich langsamer** machen, **ohne Logikverlust** (Treue gewinnt
  immer, §15). Reihenfolge a–e: a Tor `check:perf-budget` ✅ · b billige Quick-Wins ✅ · **c M-Daten-Pfad**
  (Idle-Defer, Suchindex in Worker/`export()`, `register.json` sharden) · **d Render-/Split-View-Feinschliff**
  · e CLS-Race-Härtung ✅. **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §1.
  - [~] **TBT-Deckel je Job normieren statt absolut prüfen** — gebaut, gemessen, **VERWORFEN 20.7.2026**; assertiert wird weiter der Rohwert, «TBT auf OR scharf» bleibt offen (§8).
  - [x] **Chrome-Isolation je Lighthouse-Lauf + Neukalibrierung** — erledigt 20.7.2026, Schwellen über 16 Runner neu erhoben.
  - [ ] **OR-LCP ist bimodal — Ursache offen** *(20.7.2026)* — ~3.5 s oder ~11.3–11.6 s, nichts dazwischen; Deckel 13500 bleibt bis zur verstandenen Bimodalität (§8).
  - [x] **Bimodaler ~48-s-Stall in der ersten gedrosselten Such-Interaktion — AUFGEKLÄRT + BEHOBEN** *(26.7.2026, PR #382)* — Deckel byte-gleich.
  - [ ] **Artikel-Suchindex kostet ~28.5 s Main-Thread-Aufbau** *(26.7.2026)* — Client-Rebuild des Index, kein Flake.
  - [ ] **§8-Auskunftslücke im Fehlerpfad der Artikel-Suche** *(26.7.2026)* — der Fehlschlag wird still geschluckt statt ausgewiesen.
  - [ ] **«~4 MB Artikel-Index» ist in ~10 Kommentaren falsch — real 45.7 MiB** *(26.7.2026)* — reine Kommentar-Korrektur (§5).
  - [ ] **Dauer-rAF-Sampler in `e2e/helpers/cls.ts` ohne Abschalt-Bedingung** *(26.7.2026)* — belastet jede gedrosselte Messung; Abschalt-Bedingung wäre verlustfrei.
  - [ ] **e2e-Shard-Balance gegen GEMESSENE CI-Dauern packen** — geparkt, an Davids Merge-Queue-Entscheid gekoppelt.
- **Datenhaltung / Single-Source-DB** *(QS-DATA, `[OF]`, neu 2.7.2026 — Council-Entscheid)*.
  <!-- @meta id: QS-DATA · status: blocked · of: ja · blocker: vps-bestellung-david · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
  Für die Korpus-Inhalte (Normtext · Rechtsprechung · Materialien) ist das DB-Artefakt die eine Quelle;
  `public/*.json` + Prerender sind Projektionen (§5/§7 Build-Regel 6). **Blocker: `vps-bestellung-david`**
  — E3-Serving + E4-UI-Panels hängen daran; frei baubar bleibt die Datenhaltungs-Optimierung.
  **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §13.
- **Optimierungs-Research Juli 2026 — Betrieb/Frische/Prüf-Tore/FR-IT** *(QS-OPT, `[OF]`, neu 12.7.2026)*.
  <!-- @meta id: QS-OPT · status: ready · of: ja · blocker: null · dep: [] · kollision: [vercel.json, .github/workflows/normen-monitor.yml, src/lib/normtext/laden.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md -->
  Kritik-gefilterte Ablage des allgemeinen Ultracode-Optimierungs-Research: Betriebs-/Tor-/Bau-
  Optimierungen ohne Rechtsinhalt (O-Reihe). **Leitplanke:** keine Massnahme kürzt Beweis, Tor oder
  Prüfung; jede Einheit golden byte-gleich (§6). **Detail:** [FAHRPLAN-OPTIMIERUNG-2026-07.md](fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md) §1.
- **Basis-Ausbau — Fundament-Handlungsplan** *(QS-BASIS, `[OF]`, neu 17.7.2026)*.
  **§14-Intake 20.7.2026 (David), Posten (a)–(d):** Turso-Wächter-Abdeckung · CI-Fehlläufe (#30) · CI/lokal-Tor-Parität (16/36 in CI, Rest-Lücke 20 Tore) · Datenhaltungs-Optimierung (inkl. R6). Wörtlich: [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §2.
  <!-- @meta id: QS-BASIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-BASIS-AUSBAU.md -->
  Kritik-gefilterte Ablage des Ultracode-Fundament-Research (B-Reihe): Tor-Parität lokal/CI,
  Datenhaltungs-Optimierung, Doku-/Register-Wahrheit — Fundament, kein Feature.
  **Detail:** [FAHRPLAN-BASIS-AUSBAU.md](fahrplaene/FAHRPLAN-BASIS-AUSBAU.md) §2.
- [ ] **`QS-UI` — Oberflächen-Qualität app-weit** *(Ideen-Intake 20.7.2026 · reines UI/Design, §13 · kontinuierlich)*
  <!-- @meta id: QS-UI · status: ready · of: ja · blocker: null · dep: [] · kollision: [DESIGN-REGLEMENT.md, src/index.css, tailwind.config.js, scripts/check-farbwelt.ts, e2e/a11y.e2e.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  **Kein Einzel-Redesign und kein Reihenfolge-Slot**, sondern ein **kontinuierlicher Oberflächen-Pass**
  app-weit (Fundament → Hierarchie → Politur), der VOR den flächigen Gesetzes-UI-Schritten läuft.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §8. Trailer `Roadmap: QS-UI`.

## ⚡ S0 — fristgetrieben (FRIST 30.6.2026) — ✅ gebaut + gegated 28.6.2026 (live 2.7.2026, Deploy a3769d72)
<!-- @meta id: S0 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->

**Verfallsregister mechanisch.** `check:verfall` muss den am 30.6. ablaufenden SG-GKV-Tarif +
die weiteren datierten Verfälle (s. «Pflege & Termine») erfassen und auf einer benannten UI-Fläche
sichtbar machen. `[OF]`. «Sichtbar» = verhaltensändernd → golden-gegated; bis 30.6. realistisch
**gebaut + gegated**, Live erst im Batch-Deploy-Fenster.

> **Erledigt 28.6.2026 (gebaut + gegated, deployt 2.7.2026):** geteilte Parse-Grammatik
> (`scripts/verfall-parse.ts`) für `check:verfall` + `gen:verfall`; Drift-Tor `check:verfall-ui`;
> UI-Fläche «Aktualität & Pflege der Parameter» auf `/methodik`. **Chronik:** `ROADMAP-CHRONIK.md` → S0.

---

## Die geordnete Abarbeitung (DAS ist der Plan)

> Reihenfolge nach Praxis-Hebel × Machbarkeit ohne Fachzeit × Abhängigkeiten. Alles `[OF]`, sofern
> nicht vermerkt. Details + Bau-Auflagen je Werkzeug: «Funktions-Katalog» unten + jeweilige `fahrplaene/FAHRPLAN-*.md`.

<!-- @queue: QS-TOK, W2·5d, W2·5h-GESETZ-UI, W2·13-KANTONE, W2·6b-MAT-FINMA -->
<!-- ^ SSoT der Bau-Reihenfolge (Einbau 24.7.2026): plan:next wertet die @queue VOR der
     Dokumentreihenfolge aus; Integrität erzwingt check:plan Regel 8 (tote/erledigte IDs rot,
     Prosa-«OBERSTER» muss dem Queue-Kopf entsprechen). Priorität ändern = NUR diese Zeile
     ändern, nicht Prosa. Begründung je Schritt in den Dekret-Blöcken darunter.
     Präzedenz QS-TOK vor Gesetzesdarstellung: von David BESTÄTIGT (Chat 24.7.2026, «nein
     passt»); will er später die Gesetzesdarstellung vorziehen, W2·12-HYGIENE an den Kopf
     dieser Zeile setzen. -->

> **⬆ OBERSTER OFFENER SCHRITT: `QS-TOK`.** Steht am Kopf der `@queue` (Priorisierung David
> 10.7.2026, Wortlaut «oberster schritt soll sein den token verbrauch zu minimieren»); die
> Aufräumwelle vom 31.7.2026 (AP-0…AP-11, PR #407) ist gebaut, der Schritt daher wieder
> **`ready`** statt `wip`. Offener Rest: **T10 · T12-Stufe-2 · T14 · T16 · T20** (Go David
> 27.7.2026 erteilt; T16 nur in frischer Session) sowie die ROADMAP unter das 100-KB-Ceiling
> (der Re-Akkumulations-Wächter meldet rot; die Ist-Zahl liefert
> `python3 .claude/hooks/struktur-rotieren.py --check` und wird hier bewusst **nicht**
> zweitgeführt — die frühere fixe Zahl war überholt, Endprüfungs-Funde 6/12/31. Herleitung in
> [`fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md`](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §Stand 31.7.2026).
> **Bau-Spec: [`fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md`](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) §§3–§7, Reihenfolge §8; Stand/Belege: §Stand 31.7.2026.**
> Die Verzahnungs-Stufe `W2·7-BEZUG` ist seit 29.7.2026 **`done`** (B1–B7 gebaut, PRs
> #401–#406; Vorstufe `W2·6-NKEY` am 28.7.2026 erledigt — die normKeys-Abdeckung trägt 99.9 %
> der Entscheid-Snapshots). Danach folgt `W2·5d` gemäss `@queue`.
> <!-- @meta id: QS-TOK · status: ready · of: ja · blocker: null · dep: [] · kollision: [package.json, scripts, .claude, CLAUDE.md, ROADMAP.md, STRUKTUR.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md -->
> Bau verbraucht **weniger Tokens** — nur über Effizienz (gezielter lesen, kompakter übergeben,
> deterministisch statt modellgetrieben, cachen, indizieren); Einmal-Investitionen ok.
> **Leitplanke (nicht verhandelbar):** keine Massnahme kürzt Beweis, Tor oder Prüfung —
> Gegenprüfung/Doppel-Verifikation/iterative Bug-Checks/golden byte-gleich bleiben unangetastet.
> Detailquelle [`fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md`](fahrplaene/FAHRPLAN-TOKEN-OEKONOMIE.md) (ultracode-Audit
> 10.7.2026, Pakete P0–P5). **Start = P0/T2 Token-Baseline (Messung zuerst)**, dann Pakete in
> Plan-Reihenfolge. Die Feature-Reihenfolge danach steht in der **`@queue`-Zeile oben** (SSoT);
> abgelöste Fassung wörtlich → `ROADMAP-CHRONIK.md` → Steuerungs-Prosa (24.7.2026).
> **Stand 24.7.2026 (Nachmessung, Session III): autonomer Bau-Rest LEER** — T1/T2/T3/T5/T6/T7/
> T9/T15/T17/T18/T19 + Dispatch-Template + `map`/`zeige`/`fahrplan` sind gebaut (Belege:
> FAHRPLAN §Stand + Repo-Nachmessung); für die verbleibenden Posten hat David das
> Go erteilt (**Go David 27.7.2026: T10 · T12-Stufe-2 · T14 · T16 · T20**) — sie sind damit
> autonom baubar, mit drei Massgaben: T16 weiterhin NUR in einer frischen Session (T19-
> Vorbedingung, chirurgischer CLAUDE.md-Eingriff); T12-Stufe-2: die im Fahrplan dokumentierte
> Weglassungs-Begründung vor dem Bau neu bewerten (Go hebt das Gate, nicht das Urteil);
> T20 = stehendes Einsatz-Instrument, kein Einmal-Bau. Unwirtschaftlich zurückgestellt
> bleibt T13-Rest (Risikopfade).

> **■ Fokus-Dekret 24.7.2026 (David, §14-Intake — 14 Anmerkungen, präzisiert die
> Feature-Reihenfolge oben): die Gesetzesdarstellung steht im Vordergrund.** Reihenfolge:
> **(1)** zuerst Code-Anpassungen, die den **Aufbau der Gesetzes-Strecke einfacher** machen
> (verhaltensneutral nach §6, golden byte-gleich; Vehikel: `W2·12-HYGIENE`-Slices auf
> `gesetz-leser`/`normtext` + §6.6-Splits — kein neuer Parallel-Schritt) → **(2)** danach die
> **Gesetzes-Schritte des Plans prioritär** (W2·5-Familie inkl. neuem Kopfzeilen-Bündel in
> `W2·5h`, M12 in `W2·5b`, `W2·13-KANTONE`) → **(3)** mit Priorität daneben:
> **Verzahnungs-Fundament `W2·7-BEZUG`** (Gesetz ↔ Gerichtsentscheide = Kern-Differenzierung,
> Wortlaut David «sehr gutes Feature, das ich mit Priorität einbauen will») und
> **FINMA-Materialien `W2·6b-MAT-FINMA`** (Bewerbungs-Kontext: Bewerbung FINMA mit Verweis auf
> LexMetrik — der Bereich muss vorzeigbar sein). **SSoT der Reihenfolge = `@queue`-Zeile oben** —
> dieser Block ist die Begründung, nicht die Mechanik.
> **Stand 31.7.2026 zu (3):** `W2·7-BEZUG` ist eingelöst und `done` (B1–B7, PRs #401–#406);
> offen bleibt aus diesem Punkt nur `W2·6b-MAT-FINMA`.

> **■ Auftrags-Eingang 30.6.2026 (David) — §14 gebündelt + verortet.** 13 Aufträge, alle `[OF]`;
> Risiko-Klassen getrennt halten (§14.2), Daten-/Verweis-Pfade ⇒ `QS-GP` + golden byte-gleich.
> Bündel R + N ✅ in `W2·5b` · Bündel B ✅ (W2·6-B/U-KOPF) · I1/I2 + Merker ✅ in `W2·5c` ·
> **Bündel S** offen als `W3·14-S`. Quell-Architektur-Entscheid (AKN-XML Phase 1) und der Intake
> «Informations-Nutzung der Gesetze» (G-REF/G-HIST, Bau-GO je Kandidat offen) stehen im Volltext in
> [`FAHRPLAN-NORMTEXT-DARSTELLUNG.md`](fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md) `§Quell-Architektur-Entscheid` bzw. `§Intake`.
> **Wortlaut des ganzen Blocks:** [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §2.

### Welle 1 — Kern: Norm → Werkzeug → Schriftsatz + die Alltags-Klingen

- [x] **1 · Begründungs-Absatz** *(BEGRUENDUNGS-ABSATZ, ~5 %)*. Kopierfertiger, normgestützter Absatz (UI; PDF-Kapazität bewusst aus — David-Entscheid #3 vom 28.6.2026), jeder Wert mit Norm+Link+Stand; schliesst die Rückrichtung Werkzeug→Norm. **Chronik:** `ROADMAP-CHRONIK.md` → W1·1.
  <!-- @meta id: W1·1 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: archiv/FAHRPLAN-BEGRUENDUNGS-ABSATZ.md -->
- [x] **2 · Norm↔Werkzeug-Brücke** *(RECHTSSAMMLUNG P4/D1)* — Index-Teil erledigt 28.6.2026 (gegated, deployt 2.7.2026): `werkzeugeFuerNorm` + `ERLASS_WERKZEUGE` + Konsistenz-Tor; «N passende Werkzeuge»-Hinweis auf der Erlass-Karte. **Chronik:** `ROADMAP-CHRONIK.md` → W1·2.
  <!-- @meta id: W1·2 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [x] **3 · Alltags-Rechner als Cockpits** *(neu-Verpackung vorhandener Engines, `[OF]`)* — abgearbeitet 28.6.2026: Streitwert-Grenzwert-Abgleich neu gebaut (gegated, deployt 2.7.2026); Zuständigkeits-Navigator + Rechtsmittelprüfung bestanden bereits (kein §5-Duplikat); Fristen-Cockpit zurückgestellt (S-5c-Konflikt). **Chronik:** `ROADMAP-CHRONIK.md` → W1·3.
  <!-- @meta id: W1·3 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **4 · Prozesskosten-Cockpit Restbau** *(PROZESSKOSTEN-COCKPIT, Hauptmoat)* — **GEPARKT 1.7.2026, 26×-Slot FREI.**
  <!-- @meta id: W1·4 · status: parked · of: ja · blocker: wbqdyap3x · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  **I4 ✅** (1.7.2026, Bemessungskriterien 25 GK + 26 PE, §7-belegt, QS-GP bestanden) · **I9-Rest ✅**
  (Notariats-/Grundbuch-Querverweis) — Wortlaut → `ROADMAP-CHRONIK.md` → W1·4 (22.7.2026).
  **I2 bleibt blockiert** (⟵ Recherche `wbqdyap3x`: Schlichtungs-/Reduktions-/
  Rechtsmittel-Modifikatoren). Festsetzung/Dispositiv → Welle 2. **26×-Slot damit frei** →
  Voraussetzung für Welle 3 · Schritt 12 erfüllt.
- [ ] **5-PRAXIS · Frist × Kosten verzahnen** *(Ideen-Intake 20.7.2026 · UI-Orchestrierung, `[OF]`)*:
  <!-- @meta id: W1·5-PRAXIS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechnerPermalinks.ts, src/lib/permalink.ts, src/lib/icsExport.ts, src/pages/RechnerProzesskosten.tsx, src/pages/RechnerStreitwert.tsx, src/pages/RechnerZpo.tsx, src/pages/RechnerUebersicht.tsx, src/components/forms/ProzesskostenForm.tsx, src/components/forms/StreitwertForm.tsx, src/components/forms/ZpoFristenForm.tsx, src/components/forms/VorlagenSprung.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md -->
  Die heute isoliert nebeneinander stehenden Rechner zu **einem Praxis-Weg** verketten
  (Frist → Kosten → Vorlage), reine UI-Orchestrierung ohne neue Rechtsregel (§3).
  **Detail:** [FAHRPLAN-PROZESSKOSTEN-COCKPIT.md](fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md) §1. Trailer `Roadmap: W1·5-PRAXIS`.

### Welle 2 — Griff (Auffindbarkeit) + Konsultieren + mehr Klingen

- [x] **5 · Auffindbarkeits-Schicht** *(ein Index → mehrere Oberflächen)*. **Zweiachsiger Einstieg
  <!-- @meta id: W2·5 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
  (Rechtsgebiet × Aufgabe)** ✅ **28.6.2026** (gegated, deployt 2.7.) · **Globale Artikel-
  Volltextsuche** ✅ **28.6.2026** (FlexSearch, build-time-Index, lazy) · **Kanton-Volltext im
  Index** ✅ **25.7.2026** (PR #365 — 54 444 Artikel: Bund 25 389 + Kanton 29 055 aus 26 Kantonen;
  Ebene ist Generator-Parameter statt Literal, Treffer nennt seinen Kanton, Recall je Ebene getrennt).
  Wortlaut → `ROADMAP-CHRONIK.md` → W2·5 (22.7. + 25.7.2026).
  **ABGESCHLOSSEN 25.7.2026.** ~~Startseiten-Modul-Rahmen~~ → **wird in W2·5c gebaut**
  (Modul-Registry, `archiv/FAHRPLAN-STARTSEITE-V3.md` §4 — FUNDAMENT-Vorleistung), gehörte nie hierher.
  **Zur Klarstellung (Befund 20.7.):** `W2·5b`/`5c`/`5d`/`5g`/`5h` sind **keine Kinder** dieses Schritts —
  `scripts/plan/*` kennt kein Eltern-/Kind-Konzept, jeder trägt eigenes `@meta` mit eigenem Status. Es ist
  eine **Nummern-Familie, keine Hierarchie**; W2·5 ist selbsttragend und wurde eigenständig abgeschlossen.
- [x] **5b · Reader-Darstellung Bund** *(GESETZESDARSTELLUNG-BUND, `[OF]`)* —
  <!-- @meta id: W2·5b · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: archiv/FAHRPLAN-GESETZESDARSTELLUNG-BUND.md -->
  **ABGESCHLOSSEN 25.7.2026** — alle Einheiten M1–M12 des QA-Sweeps ✅ (zuletzt M12 PR #340 · M11+M6-D PR #342 · HAENGEND-Folge-Härtung PR #343). Wortlaut (inkl. QA-Sweep-Spec, Status-Korrektur 20.7., Nachmess-Warnung Batch C/D) → `ROADMAP-CHRONIK.md` → W2·5b (26.7.2026); Tabellen-Detail quer in `archiv/FAHRPLAN-TARIF-TABELLEN-STUFE2.md`, Popover in `archiv/FAHRPLAN-GESETZESTEXT-POPUP.md`.
  - [x] **M12 · Randtitel-Leerzeichen-Verklebung** — **✅ GEBAUT + GEGENGEPRÜFT + GEMERGT
    24./25.7.2026** (PR #340 `c872e4a9` + Folge-Härtung PR #343 `e3622991`): Generator-Fix am
    Join (`loeseTrennung`/`biErsetzung`), Tor `check:verklebung` (Sabotage rot gezeigt),
    231 Sidecars regeneriert, 2+2 Opus-Gegenprüfungs-Durchgänge (Register `ce06aa72`/`e964599c`).
    Dieser Marker stand stale auf offen (Etikett-Korrektur 26.7.); Wortlaut + Beweise:
    `archiv/FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` §M12.
- [x] **5c · Startseite V3 + Branding I2** *(STARTSEITE-V3, done)* — ✅ GEBAUT 3.7.2026 (Bausequenz S1–S5 komplett, PRs #106/#107/#108/#111 + S5 Brass-Hero) + Zuletzt-Tracker. **Rest offen (kein Blocker):** Wash-Ton-Veto `bg-surface`-Fallback in `Hero.tsx`. Spec `archiv/FAHRPLAN-STARTSEITE-V3.md`. Trailer `Roadmap: W2·5c`. **Chronik:** `ROADMAP-CHRONIK.md` → W2·5c.
  <!-- @meta id: W2·5c · status: done · of: ja · blocker: null · dep: [] · kollision: [src/pages/Startseite.tsx, src/components/start, src/lib/navigation.ts, src/lib/seo.ts, index.html, tailwind.config.js, src/components/layout/Topbar.tsx, scripts/prerender.ts] · worktree: ja · 26x: nein · fahrplan: archiv/FAHRPLAN-STARTSEITE-V3.md -->
- [ ] **5d · Gesetzes-UX & Darstellungs-Reglement** *(GESETZES-UX, `[OF]`, eigener Worktree; Auftrag David 4.7.)*:
  **Stand 26.7.2026:** G0–G6, A1–A18, A19–A25 (ohne zurückgezogenes L-3/A28), E-Reihe A29–A40/E1–E7,
  §11 IA-1–IA-7, EID-1/EID-2 und FN-5/M14 gebaut — **offener Rest = EID-3** + Härtungs-/Politur-Posten.
  <!-- @meta id: W2·5d · status: ready · of: ja · blocker: null · dep: [W2·5c] · kollision: [src/pages/gesetz-leser/parts.tsx, src/pages/gesetz-leser/inhalt.tsx, src/components/normtext/ArtikelBody.tsx, src/lib/normtext/register.ts, src/components/suche, scripts/normtext] · seq-hart: [QS-PERF(ArtikelBody.tsx)] · seq-weich: [W2·5b-L0(scripts/normtext, nur U-PDF)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  UX/Lesbarkeit des Gesetz-Lesers auf State-of-the-Art (Fedlex = Mindestlatte): EINE Linien-Sprache,
  Lesespalte `max-w-reading`, Leser-Kopf-Optionen, je Grundart eine Designvorschrift; G3b ist Risiko-Pfad.
  **Detail (Spec wörtlich, inkl. Nachzug-Wellen A19–A25/A29–A40, IA-Reihe §11, eId-Reihe §12):** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §16.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §16 (ROADMAP-Spec W2·5d). Trailer `Roadmap: W2·5d`.
  - [ ] **5d-EID3 · EID-3 Teil (b): Linien-Tiefe aus der eId-Pfadlänge** — Guide-/Einzugstiefe aus dem kumulativen eId-Pfad statt aus der Sidecar-Rekursionstiefe; golden-neutral, Tor `check:linien-kanon`.
    <!-- @meta id: W2·5d-EID3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/linienAufbau.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [ ] **5d-ANNEX · eId-Anker für Annex-Sections** — die aus EID-1 bekannte Grenze schliessen: Container-eIds auch auf dem separaten Anhang-Pfad mitschneiden. **Extraktion = Risikopfad.**
    <!-- @meta id: W2·5d-ANNEX · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext/struktur-extrahiere.ts, public/normtext/bund] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [ ] **5d-SPY · V3/H6 — Scroll-Spy-Härtung (rootMargin ↔ Bezugslinie)** — der einzige offene Härtungs-Posten der E-Reihe; **erst reproduzieren, dann fixen** (H6 ist unreproduziert).
    <!-- @meta id: W2·5d-SPY · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts/SektionBaumTOC.tsx, src/pages/gesetz-leser/scrollAnker.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [ ] **5d-YC · IA-Rest Y-C: `/international` Stufe 2** — echter Redirect mit Hash-Mapping; §11 ist sonst komplett, Stufe 2 war dem Stufe-1-Betrieb nachgelagert.
    <!-- @meta id: W2·5d-YC · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/seo.ts, src/lib/navigation.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  - [x] **A19** (FN-1+FN-2 + Drop-Fix `disp_*`) — **✅ GEBAUT 10.7.2026** (`feat/v2-fn1-fn2`). Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/A19–A25 (26.7.2026). V2 §2 F1.
  - [x] **A20** (FN-3): Präambel-Fussnoten inline (nach U-VERWEIS-Merge). V2 §2 F1.
    **✅ GEBAUT 12.7.2026 (`feat/v2-fn3`, PR #212).** Detail §10.8.
  - [x] **A21** (FN-4) — **✅ ERLEDIGT OHNE BAU 25.7.2026** (PR #354; e2e-Wächter `fussnote-absatz-altform`). Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/A19–A25 (26.7.2026). V2 §2 F1.
  - [x] **A22** (K-1+K-2) — **K-2 ✅ GEBAUT 11.7.2026** (`feat/v2-kopf-pr`, PR #194) · **K-1 ✅ GEBAUT 12.7.2026** (`feat/v2-k1`, PR #213, `9e7e505b`). Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/A19–A25 (26.7.2026). V2 §2 F2.
  - [x] **A23** (B-1+B-2) — **✅ GEBAUT 11.7.2026** (`feat/v2-kopf-pr`, PR #194). Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/A19–A25 (26.7.2026). V2 §2 F3.
  - [~] **A24** (L-1+L-2+L-3): Linien-Reparatur, Auto-Default-Umkehr ZGB/OR (Umkehr
    #161, David freigegeben); L-4 entfällt. V2 §2 F4.
    - [x] **L-1+L-2 ✅ GEBAUT 11.7.2026** (`feat/v2-l1-l2`). Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/A19–A25 (26.7.2026). V2 §2 F4.
    - [ ] **L-3** (Auto-Default-Umkehr): weiterhin **hinter David/Council-Gate** —
      NICHT in feat/v2-l1-l2 gebaut. V2 §2 F4.
  - **A25** (C-1+C-2+C-3): Farbe nur Referenzschicht (Chips/Badges/Kopf),
    Normtext-Körper farbfrei. V2 §2 F5. Bau-Go David 10.7. «go zu allem».
    - [x] **C-1 ✅ 10.7.2026 · C-2 ✅ 11.7.2026 (#201) · C-3 ✅ 11.7.2026 — Farb-Wörterbuch KOMPLETT** (DESIGN-REGLEMENT §4b-B Abschluss). Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/A19–A25 (26.7.2026). V2 §2 F5.
  - [x] **FN-5/M14** wortgenaue Fussnoten-Marker — **✅ GEBAUT 26.7.2026** als
    SIDECAR-Variante nach M14-Spec (`fahrplaene/FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §M14) statt
    Haupt-Snapshot-Diff: Snapshots byte-unverändert (§7-Abweichung von der hier
    früher angenommenen Snapshot-Diff-Mechanik offengelegt). `pos{b,it,o,l}` je
    Marker im Struktur-Sidecar, 16'894 Marker wortgenau (97.7 % der text-verorteten;
    `<dt>`-Marken/Kopf/Sektion ausgewiesen ohne Textstelle), Differ-Beweis nur
    erzeugt+pos, Gegenprüfung, Wächter `e2e/fn5-wortposition.e2e.ts` + Unit-Negativfälle.
    Dossier `bibliothek/normen/fn5-wortgenaue-marker-2026-07-26.md`; Bau-Auftrags-
    Wortlaut → `ROADMAP-CHRONIK.md` → W2·5d/FN-5 (26.7.2026). V2 §2 F1.
- [ ] **5e · UI-Nutzwert & Navigation (Ultracode-Synthese 11.7.)** *(`[OF]`, reine UI/Navigation)*:
  <!-- @meta id: W2·10-UI-NAV · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/components/suche, src/lib/suche, src/lib/universalSuche.ts, src/components/layout, src/components/rechtsprechung, src/pages/Rechtsprechung.tsx, src/pages/gesetz-leser, src/pages/GesetzLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  Priorisierter UI-Plan aus 60 empirischen Befunden + 3 Kritik-Linsen — Suche, Navigation und
  Auffindbarkeit über alle Oberflächen; reine Darstellungsschicht (§3), keine Rechtslogik.
  **Detail:** [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §8. Trailer `Roadmap: W2·10-UI-NAV`.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-UI-NAVIGATION.md](fahrplaene/FAHRPLAN-UI-NAVIGATION.md) §8 (ROADMAP-Spec W2·10-UI-NAV). Trailer `Roadmap: W2·10-UI-NAV`.
  - [ ] **UI-NAV-S · Suche-Rest (S1 + S6)** — Query-Durchreichung `?q=` in die Browse-Pages + mobiler Such-Fokusmodus (≥16 px gegen iOS-Zoom). §2.
    <!-- @meta id: W2·10-UI-NAV-S · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/lib/universalSuche.ts, src/components/suche, src/components/layout/HeaderSuche.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-V · Verzahnung ohne Reader-Fläche (V2 + V4 + V6)** — Hover-Trigger am bestehenden NormPopover · NormChip-`href` intern (Cmd-Klick landet intern) · Vorlage↔Rechner-Kreuzlinks. §3.
    <!-- @meta id: W2·10-UI-NAV-V · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/components/NormPopover.tsx, src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-VR · Verzahnung auf Reader-Fläche (V3 + V5)** — Regeste-Popover am KantenChip + Erwägungs-Navigation im Entscheid-Leser; `parts.tsx`-Kollisions-Precheck Pflicht (§0.2). §3.
    <!-- @meta id: W2·10-UI-NAV-VR · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/EntscheidLeser.tsx, src/lib/rechtsprechung/abschnitte.ts, src/pages/gesetz-leser/parts.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-R1 · Reader: Finden im Gesetz (R1 + R2)** — In-Gesetz-Suche mit Treffer-Highlight + mobile Gliederung als Bottom-Sheet mit «Sie sind hier». §4.
    <!-- @meta id: W2·10-UI-NAV-R1 · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/parts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-R2 · Reader: Zitieren und Zurückspringen (R3 + R5 + R7)** — zitierfähige Referenz mit Permalink · Rücksprung-Chip-Restscope · Deep-Link-Skeleton «Springe zu Art. X …». §4.
    <!-- @meta id: W2·10-UI-NAV-R2 · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/scrollAnker.ts, src/components/layout/InhaltsKopf.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-R3 · Reader: Weiterlesen und Tastatur (R4 + R8)** — Positions-Persistenz «Weiterlesen bei Art. X» + Tastatur-Navigation j/k mit «?»-Overlay (R8 = niedrigste Priorität der Reihe). §4.
    <!-- @meta id: W2·10-UI-NAV-R3 · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/lib/zuletztVerwendet.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-R4 · Trefferflächen und a11y (R6 + E4)** — Tap-Target-Sammelticket mit Token-Regel ins `DESIGN-REGLEMENT.md` + a11y-Prüfauftrag der Linsen. §4/§7.
    <!-- @meta id: W2·10-UI-NAV-R4 · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/index.css, e2e/a11y.e2e.ts, DESIGN-REGLEMENT.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-J · Rechtsprechungs-Seiten (J1 + J2 + J4)** — Browse-Liste mit Batching und Band-Sprungleiste · Mobil-Filter als Bottom-Sheet · «Neues vom Bundesgericht»-Karten. §6.
    <!-- @meta id: W2·10-UI-NAV-J · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/Rechtsprechung.tsx, src/components/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-J3 · Sachgebiets-Pipeline verfeinern (J3)** — **bewusst allein**, weil Risiko-Pfad: `QS-GP` Pflicht + golden byte-gleich, eigene Gegenprüfungs-Runde. §6.
    <!-- @meta id: W2·10-UI-NAV-J3 · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [scripts/rechtsprechung, public/rechtsprechung/register.json, src/lib/normtext/browse.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-O · Übersichten und Sidebar (O2 + O4 + O5)** — Sidebar-Konsistenz · Kantons-Einstieg mit Abdeckung vor dem Klick · Scope-Labels der lokalen Suchfelder; alle drei S. §6.
    <!-- @meta id: W2·10-UI-NAV-O · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/components/layout/Sidebar.tsx, src/pages/Gesetze.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
  - [ ] **UI-NAV-Z · Zusatzposten Ausleitung (Z1 + Z2)** — ICS-/Kalender-Export der Fristergebnisse + Print-CSS für Fundstellen; Ist-Stand vor dem Bau erheben. §7.
    <!-- @meta id: W2·10-UI-NAV-Z · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/lib/icsExport.ts, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-NAVIGATION.md -->
- [ ] **5f · Design-Wärme & Atmosphäre (Ultracode-Synthese 11.7.)** *(`[OF]`, reine Darstellung/Token-Schicht)*:
  <!-- @meta id: W2·11-DESIGN · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/index.css, tailwind.config.js, DESIGN-REGLEMENT.md, scripts/check-design-tokens.ts, src/components/rechtsprechung, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  Farbklima/Wärme/Typografie-Plan aus 48 Ultracode-Befunden + 3 Kritik-Linsen — Token-Schicht nach
  §13, Normtext-Körper bleibt farbfrei, golden byte-gleich.
  **Detail:** [FAHRPLAN-DESIGN-WAERME.md](fahrplaene/FAHRPLAN-DESIGN-WAERME.md) §5. Trailer `Roadmap: W2·11-DESIGN`.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-DESIGN-WAERME.md](fahrplaene/FAHRPLAN-DESIGN-WAERME.md) §5 (ROADMAP-Spec W2·11-DESIGN). Trailer `Roadmap: W2·11-DESIGN`.
  - [ ] **DESIGN-D6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)** — surface dunkel heben · warme Schattenbasis · Lichtkante · Scrim-Audit; Token-only, flip-reversibel, `check:farbwelt` + axe dunkel. §2 (D-6).
    <!-- @meta id: W2·11-DESIGN-D6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D7 · Ein Lese-Register (`--reading-ink`, `--lese-fs`/`--lese-lh`)** — Lese-Basis + Entscheid-Stepper als Multiplikatoren, CPL-Messung, Regel in beide Domänen-Reglemente; golden neutral. §2 (D-7).
    <!-- @meta id: W2·11-DESIGN-D7 · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D6] · kollision: [src/index.css, src/pages/EntscheidLeser.tsx, src/components/rechtsprechung, DESIGN-REGLEMENT.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D8a · Wörterbuch auf die Fläche: slate auf Entscheid-Flächen (D-8.1)** — Entscheid-Leser-Chrome und Rubrik-Label auf die Rollen-Schicht ziehen; Playwright-Screens in die Abnahme-Mappe.
    <!-- @meta id: W2·11-DESIGN-D8a · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D7] · kollision: [src/components/rechtsprechung, src/pages/EntscheidLeser.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D8b · Mono-Diät — Pilot, dann mechanischer Rest (D-8.2)** — ~50 verteilte Fundstellen; **Pilot zuerst** (Startseite + 1 Rechner) mit Vorher/Nachher-Screens, danach der Rest. Nicht flip-reversibel.
    <!-- @meta id: W2·11-DESIGN-D8b · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D8a] · kollision: [src/components/forms, src/components/DatumsFeld.tsx, src/components/BetragsFeld.tsx, src/pages/Startseite.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->
  - [ ] **DESIGN-D8c · Motiv-Katalog (D-8.3)** — `scale-rule`-Motiv an 2–3 Sektions-Orten, Abschluss der Anwendungs-Schicht.
    <!-- @meta id: W2·11-DESIGN-D8c · status: ready · of: ja · blocker: null · dep: [W2·11-DESIGN-D8b] · kollision: [src/components/start, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-DESIGN-WAERME.md -->

- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)*:
  **Status 20.7.2026 (David):** «irgendwann, aktuell nicht relevant» → von `blocked` auf `parked`; der Blocker `zeit-historik-poc` bleibt bestehen. Damit verschwindet der Schritt aus der aktiven Entscheidungslast, ohne dass die Vorbedingungen verloren gehen.
  <!-- @meta id: W2·5g-ZEIT · status: parked · of: ja · blocker: zeit-historik-poc · dep: [] · kollision: [scripts/normtext, src/lib/normtext, public/normtext] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  «Art. X, wie er am Tag Y galt» (verknüpft mit dem Entscheiddatum) + **visueller Diff zweier
  Konsolidierungen**; konsolidiert **M16** «Point-in-Time» + **G-HIST** als Daten-Unterbau in eine
  getrackte Einheit. Extraktions-Risikopfad ⇒ `QS-GP`; Reihenfolge steuert allein der Blocker
  `zeit-historik-poc` (darum `dep: []`, §14.5).
  **Detail:** [FAHRPLAN-GESETZESDARSTELLUNG-V2.md](fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §8.
- [ ] **5h-GESETZ-UI · Gesetzes-Webseite: UX-Pass** *(Ideen-Intake 20.7.2026 · reine UI/Darstellung)*:
  <!-- @meta id: W2·5h-GESETZ-UI · status: ready · of: ja · blocker: null · dep: [W2·5d] · kollision: [src/pages/gesetz-leser, src/pages/GesetzLeser.tsx, src/components/normtext, src/components/suche] · seq-hart: [QS-UI(a Fundament-Pass + b Hierarchie-Pass), W2·5b(gesetz-leser/parts.tsx, inhalt.tsx, ArtikelBody.tsx)] · seq-weich: [W2·10-UI-NAV(gesetz-leser, GesetzLeser.tsx, components/suche), W3·14(Split-View-Rahmen)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  **Folgeschritt aus `QS-UI`** (Davids Sequenz: erst app-weit, dann die Gesetzes-Seite): UX-Pass auf
  der Gesetzes-Webseite inkl. Kopfzeilen-Bündel — reine UI/Darstellung, amtliche Substanz unangetastet.
  **Detail:** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §17. Trailer `Roadmap: W2·5h-GESETZ-UI`.
- [x] **5i-HIST-ANSICHT · Fassungshistorie an-/abwählbar** — **✅ GEBAUT + GEMERGT 26.7.2026**
  <!-- @meta id: W2·5i-HIST-ANSICHT · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md -->
  (PR #375, Squash `de8f294a`): H0-Verdikt BESTANDEN (25.7.) → H1 dreiwertige Ansicht
  «Änderungshistorie: aus / als Fussnoten / als Chronologie», Klassifikation `kl` build-seitig
  (227 Bund-Sidecars; nur Klasse A dämpfbar, Auflage 1 strukturell erzwungen), 4 Gegenprüfungs-
  Runden (B1 Befristungen + B3 Fristenlauf gefixt, 62 A→G). **Offen bei David:** fachliche
  Abnahme + ZITAT-Entscheid (Auflage 5; gebaut = Empfehlung «sichtbar») + D1–D3 (niedrig).
  Wortlaut → `ROADMAP-CHRONIK.md` → W2·5i-HIST-ANSICHT (26.7.2026); Dossier
  `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`. Trailer `Roadmap: W2·5i-HIST-ANSICHT`.
- [d] **5j-TABELLEN · Tabellen in Gesetzen lesbar machen** *(§14-Intake 20.7.2026, David: **ausdrücklich «später»**)*
  <!-- @meta id: W2·5j-TABELLEN · status: parked · of: ja · blocker: david-spaeter-tabellen · dep: [] · kollision: [src/components/normtext/ArtikelBody.tsx, src/pages/gesetz-leser/inhalt.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-GESETZES-UX.md -->
  Tabellen in Gesetzen lesbar machen (Beispiel `/gesetze/kanton/BS-154.810#art-29`); Datenlage erhoben.
  **Geparkt auf Davids ausdrückliches «später»** (Blocker `david-spaeter-tabellen`).
  **Detail:** [FAHRPLAN-GESETZES-UX.md](fahrplaene/FAHRPLAN-GESETZES-UX.md) §18.
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  - **Mehrsprachiger Normvergleich DE/FR/IT** (Art. 14 PublG) · **Recherche Norm → amtlicher Entscheid**
    (deterministisch, kein LLM-Ranking) · **Gerichts-/Behörden-Adressregister** (Lese-Schicht, kein
    Duplikat) · **BGE-Band-Nachzug 146–149** (PR-A 146+147 ✅, PR-B 148+149 offen) · **Rechtsprechungs-
    Übersicht** (P0-Fix SG-Regeste + kant. Norm-Resolver, Korpus-Breite `[OF]`).
    **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §13 (ROADMAP-Spec W2·6). Trailer `Roadmap: W2·6`.
    - [ ] **6-MEHRSPRACH · Mehrsprachiger Normvergleich DE/FR/IT** — Auslegungswerkzeug nach Art. 14 PublG: drei Sprachfassungen je Erlass + Synopse-UI; heute ist nur `de` befüllt. §13.
      <!-- @meta id: W2·6-MEHRSPRACH · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/normtext/bund, src/pages/gesetz-leser] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-RESOLVER · Kantonaler Norm-Resolver → Kantonalnorm-Buckets (P0-Kern)** — `norm-index` füllt heute nur Bundesnorm-Buckets; der Resolver ist Voraussetzung der kantonalen Stufe. **Risikopfad.** §13.
      <!-- @meta id: W2·6-RESOLVER · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/rechtsprechung/norm-index.ts, public/rechtsprechung/norm-index] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-ADRESSEN · Gerichts-/Behörden-Adressregister** — Lese-/Index-Schicht über die bestehenden Bestände, **kein Datenduplikat** (§5). Quelle `bibliothek/behoerden/`. §13.
      <!-- @meta id: W2·6-ADRESSEN · status: ready · of: ja · blocker: null · dep: [] · kollision: [bibliothek/behoerden, src/lib/kontext.ts, src/pages/RechnerUebersicht.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [ ] **6-UEBERSICHT · Rechtsprechungs-Übersicht: P0-Rest + Korpus-Breite** — SG-Regeste-Rest und die Übersichts-/Facetten-Breite; Kantons-Ausweitung setzt den Resolver voraus (darum `dep`). §13.
      <!-- @meta id: W2·6-UEBERSICHT · status: ready · of: ja · blocker: null · dep: [W2·6-RESOLVER] · kollision: [src/pages/Rechtsprechung.tsx, src/components/rechtsprechung, public/rechtsprechung/register.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
    - [x] **Kanton BS: Rechtsprechungs-Vollimport seit 2022 (amtliches Portal)** *(Direktauftrag David 19.7.2026)* — ✅; ~3'765 Dokumente (2022–2026) aller 4 BS-Instanzen, Tor `check:bs-entscheide`. Wortlaut → `ROADMAP-CHRONIK.md` → W2·6-BS (26.7.2026). Trailer `Roadmap: W2·6-BS`.
    - [~] **Richter-/Spruchkörper-Filter — Fundament** *(`R-RICHTER`, Direktauftrag David 20.7.2026;
      dieselbe Pipeline/dasselbe Datenasset wie die BS-Tranche darüber, §14.2)*: **Block A (Daten) ✅
      20.7.2026** (Extraktion + Kanon + `richter.json` + Tor `check:besetzung`); **Block B offen, reines
      UI** (Autocomplete-Facette + `?richter`-URL-Achse + e2e/axe/perf). Detail: `fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md`
      §12 und §13. Trailer `Roadmap: R-RICHTER`.
    *— Datenausbau-Unterschritte (Quellen → DB → Korpus = Fundament der Verzahnung):*
    - [D] **Quellen-Steinbruch OpenCaseLaw** *(Analyse 2.7.2026; **Richtungsentscheid gefallen 2.7.: KONSUMIEREN statt scrapen** — Massen-/Graph-Verwertung läuft im DB-Strang **W2·6-DATA**/`fahrplaene/FAHRPLAN-DATENHALTUNG.md`; Technik-Ports W1/W4–W13 unverändert nach `PLAN-OCL-ABBAU.md`)* — Auswertung
      von opencaselaw.ch/`caselaw-repo-1` (Daten CC0, Code MIT) — Leit-Doktrin: OCL nie load-bearing, nur
      Seed/Diff-Orakel, Endpunkt-Wissen selbst gegen die amtliche Quelle nachbauen. Baustein ① LexWork-
      Kantons-API ✅ verifiziert 11.7.2026 (kein Neubau, §1/§6). **Detail:** [FAHRPLAN-OPENCASELAW-QUELLEN.md](fahrplaene/FAHRPLAN-OPENCASELAW-QUELLEN.md) §1.
    - [~] **Fedlex-Datenarten-Portfolio** *(Plan 2.7.2026; Go David 10.7.2026 «go zu allem», Reihenfolge 1→2→5→3→4)* — 6 verwertbare
      Fedlex-Datenarten (Erlasse/Materialien/Verfahren/Staatsverträge u.a.), ausschliesslich amtliche
      Fedlex-Stelle (SPARQL + Filestore, nie Dritt-Repo); **alle 5 Pakete ✅ ausgeführt (10.7.2026)**.
      **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §15.
    - [ ] **Datenhaltung-Bau: DB-Artefakt + Massen-Korpus + Edge-Suche** *(W2·6-DATA; Council 2.7.2026 — löst die drei OCL-Abbau-„DAVID-ENTSCHEID"-Punkte auf)*.
      <!-- @meta id: W2·6-DATA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext-snapshot.ts, scripts/prerender.ts, public/normtext/register.json] · worktree: ja · 26x: ja · fahrplan: fahrplaene/FAHRPLAN-DATENHALTUNG.md -->
      Andockpunkt **eine Schicht UNTER dem heutigen Generator**: die bestehenden Adapter befüllen ein
      libSQL/SQLite-Artefakt, `public/*.json` + Prerender werden Projektion (Tor `check:paritaet`).
      **E0–E4 gebaut**; offen ist (i) VPS-gebunden E3-Serving + E4-UI-Panels (David-Gate
      `vps-bestellung-david`), (ii) frei baubar die Datenhaltungs-Optimierung, nachgelagert E5 (26×)/E6a/E6b.
      **Heiss/Kalt-Grenze bleibt DAVID-GATE** — was die Suche behaupten darf, wenn der Long-Tail kalt
      liegt, ist eine §8-Frage, nicht technisch entscheidbar; bis dahin nicht implementieren.
      **Detail:** [FAHRPLAN-DATENHALTUNG.md](fahrplaene/FAHRPLAN-DATENHALTUNG.md) §14.
    - [x] **+ Auftrags-Eingang 30.6.: Bündel B** — **B1+B2+A18 ✅ GEBAUT 5.7.2026** (Branch
      <!-- @meta id: W2·6-B · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
      `feat/w26b-regeste-a18`); B3 via U-KOPF-Refactor `60988318` ⇒ alle drei Posten erledigt, Status `done`. Wortlaut → `ROADMAP-CHRONIK.md` → W2·6-B (22.7. + 26.7.2026).
    - [x] **Verweis-Präzision im Entscheid-Leser (Referenz BGE 151 III 377)** *(W2·6, `QS-GP`, 3.7.2026)*. i.V.m.-Ketten-Verlinkung (Kürzel auf bare Glieder propagiert, `normVerweiseImText`) + Zitierte-Normen-Chips → Sprung zur ersten Fundstelle-Erwägung; Tore grün, Snapshots additiv. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/Verweis-Präzision.
    - [x] **BGE-Auszug abgeschnitten — vollständig gefixt (34/34)** *(W2·6-BGE, Inhaltsverlust, `[OF]`)*. 29.6.2026: still mitten im Wort gekappte Auszug-Erwägungen voll nachgeladen (`fuelleGekappteErwaegungen` + Id-Disambiguierung) + Schutz-Tor U+2026 in `check:entscheide`; alle 34 BGE regeneriert, golden byte-gleich. Öffnet keinen 26×-Slot. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug.
      - [x] **Rest 30.6.2026 geschlossen** — `bge_151_V_1`/`bge_151_V_30` via Id-Disambiguierung sauber re-gefetcht (kein Hand-Edit §7), WARN-Quarantäne entfernt. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug.
- [ ] **6-FILTER · Entscheid-Filter über die API — Richter + allgemeine Facetten** *(§14-Intake 20.7.2026, David — Queue-Plätze 2 und 3; **ULTRACODE freigegeben** für Teil b)*
  <!-- @meta id: W2·6-FILTER · status: ready · of: ja · blocker: null · dep: [] · kollision: [api/suche.ts, scripts/datenhaltung, src/components/suche, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  **Gebündelt, weil beide Teile dieselbe Bau-Fläche tragen** (Turso-Schema + `api/suche.ts` + Facetten-UI):
  Richter-Facette (aus `R-RICHTER` Block B) und die allgemeinen Entscheid-Facetten über die API.
  **Detail:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §7. Trailer `Roadmap: W2·6-FILTER`.
- [ ] **6-RNAME · Richternamen gegen den Staatskalender auflösen** *(§14-Intake 20.7.2026, David · **Extraktion/Personendaten — Risikopfad**, `QS-GP`)*
  <!-- @meta id: W2·6-RNAME · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md -->
  Abgekürzte Vornamen auflösen: **«P. Kaderli» → «Kaderli Peter»**, Abgleich gegen den amtlichen
  Staatskalender. **Extraktion/Personendaten = Risikopfad** ⇒ `QS-GP` Pflicht, nie raten: ohne
  eindeutigen amtlichen Treffer bleibt die Abkürzung stehen (§8).
  **Detail:** [FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md](fahrplaene/FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md) §8. Trailer `Roadmap: W2·6-RNAME`.
- [ ] **6-ZNETZ · Zitationsnetz: Rückwärts-Zitate + Leitentscheid-Score** *(Ideen-Intake 20.7.2026 · Daten-Derivation, `QS-GP`)*:
  <!-- @meta id: W2·6-ZNETZ · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/verzahnung, src/lib/verzahnung, src/lib/rechtsprechung, public/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  «Welche Entscheide zitieren diesen?» (Rückwärts-Kanten) + **Leitentscheid-Score**, deterministisch
  aus dem Zitat-Graph abgeleitet (§2 — kein Ranking-Modell, kein Bedeutungs-Urteil); Daten-Derivation
  ⇒ `QS-GP`. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §10. Trailer `Roadmap: W2·6-ZNETZ`.
- [x] **6-NKEY · normKeys-Abdeckung generalisieren — Register-Ableitung + FR/IT-Aliase + Sichtbarkeits-Tor** *(§14-Intake 21.7.2026, David · Extraktion/Mapping — Risikopfad, `QS-GP`; Dekret David 27.7.2026)* — **✅ 28.7.2026 GEBAUT** (Worktree `w26-nkey`, ULTRACODE): Hand-Whitelist 26 Einträge → Register-Ableitung + Fedlex-Alias-Ebene (597 amtliche DE/FR/IT-Kürzel); Nennungs-Abdeckung 43 % → **93.6 %**, Snapshots mit `normKeys` 21.9 % → **99.9 %** (5093 Entscheide); Sichtbarkeits-Tor `check:normkeys` (Schwelle 20, 11 deklarierte Ignore-Einträge). Gegenprüfung **bestanden** (Opus, 4 Runden). Status `done`. Wortlaut → `ROADMAP-CHRONIK.md` → W2·6-NKEY (28.7.2026).
  <!-- @meta id: W2·6-NKEY · status: done · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein -->
  **Offen als Folgearbeit (nicht Teil dieses Schritts):** `register.json` trägt `normKeys` je Entscheid
  und steht damit bei **97 % des 780-KB-gzip-Deckels** (756.9 KB) — die Verschlankung (eigene Projektion,
  wie `richter.json` sie für die Spruchkörper-Slugs vormacht) ist **nicht** durch Anheben der Schranke
  zu lösen (§8). Wer `register.json` weiter belädt, reisst `check:perf-budget`.
- [ ] **6-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)* — **V1a ✅ 3.7. · V1c ✅ 4.7. · V1b ✅ 4.7.2026 GEBAUT** (Fundament/Vereinheitlichung · Normrevisions-Ehrlichkeit · E4-Rangliste; Gegenprüfungen bestanden; Wortlaut → `ROADMAP-CHRONIK.md` → W2·7-VZUI, 24.7.2026) · **offen: V2 (E3-Serving) · V3 (E6a)**:
  <!-- @meta id: W2·7-VZUI · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/components/kontext/KontextPanel.tsx, src/pages/EntscheidLeser.tsx, src/components/NormPopover.tsx, src/components/suche/SuchResultate.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik für die Verzahnung (KantenChip · StatusBadge nur-Abweichung · KontextPanel),
  reine UI auf vorhandenen Daten (§3). **Offen: V2 (E3-Serving) · V3 (E6a)** — beide an den Datenstrang
  gekoppelt. **Detail:** [FAHRPLAN-VERZAHNUNG-UI.md](fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md) §11. Trailer `Roadmap: W2·7-VZUI`.
- [x] **7-BEZUG · Bezüge am Artikel — Facetten-Fundament alle Instanzen** — ✅ **done 28.7.2026**,
  <!-- @meta id: W2·7-BEZUG · status: done · of: ja · blocker: null · dep: [W2·6-NKEY] · kollision: [scripts/normtext/entscheide-schreiben.ts, src/lib/rechtsprechung/norm-index.ts, src/lib/verzahnung, src/components/kontext/KontextPanel.tsx, src/pages/gesetz-leser/LeserAnsichtMenu.tsx, public/rechtsprechung] · seq-weich: [W2·7-VZUI(KontextPanel.tsx), W2·5h-GESETZ-UI(LeserAnsichtMenu.tsx)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  B1–B6 + B7 komplett (PRs #401–#406).
  Übergabe-Restposten (G-a…G-g, «Folgeaufträge Verzahnungs-Session 28.7.») → [FAHRPLAN-OPTIMIERUNG-2026-07.md](fahrplaene/FAHRPLAN-OPTIMIERUNG-2026-07.md) §1.
  - [x] **B7 · Voll-Auflistung + Eidg.-Facette** — ✅ **done 29.7.2026** (PR #406 `5a10f8150`,
    4 GP-Runden; Voll-Auslieferung ohne Deckel, 5er-Portionierung, «Eidg.»-Facette ehrlich).
    <!-- @meta id: W2·7-BEZUG-B7 · status: done · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext/bezuege-bauen.ts, public/rechtsprechung/bezuege, src/pages/gesetz-leser, src/components/verzahnung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VERZAHNUNG-UI.md -->
  Detail: `ROADMAP-CHRONIK.md` → W2·7-BEZUG.
- [x] **6a-MAT · Materialien-Verzahnung Stufe 1** *(DATA+UI, Worktree)* — Verwaltungsverordnungen/Wegleitungen als Kanten am Norm-Artikel (E6a Stufe 1 = nur Verweis-/Register-Ebene, §7 a–d). Komplett 4.7.2026 (M0–M5, PRs #126/#127/#128 + ESTV-KS/MWST + UI-Delta; 4 Quellen SECO/EDÖB/ESTV-KS/ESTV-MWST, Cutoff-Revisions-Invariante, Gegenprüfung bestanden, CLS 0). Kein 26×-Bezug. Spec `fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md`. **Chronik:** `ROADMAP-CHRONIK.md` → W2·6a-MAT.
  <!-- @meta id: W2·6a-MAT · status: done · of: ja · blocker: null · dep: [W2·7] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien/typen.ts, src/lib/materialien/register.ts, src/pages/Materialien.tsx, src/lib/kontext.ts, src/components/kontext/KontextPanel.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
- [ ] **6b-MAT-FINMA · FINMA-Materialien prioritär + Verzahnung** *(§14-Intake 24.7.2026;
  <!-- @meta id: W2·6b-MAT-FINMA · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/materialien/**, public/materialien/**, src/lib/materialien] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md -->
  **Fokus-Dekret-Priorität**, Kontext Bewerbung David bei der FINMA mit Verweis auf LexMetrik)* —
  FINMA-Rundschreiben/Wegleitungen als nächste Quelle der bestehenden Materialien-Pipeline (E6a
  Stufe 1: Verweis-/Register-Ebene, §7 a–d, kein Volltext-Nachbau).
  **Detail:** [FAHRPLAN-MATERIALIEN-VERZAHNUNG.md](fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md) §10. Trailer `Roadmap: W2·6b-MAT-FINMA`.
- [x] **7 · Verzahnungs-Klingen** *(`[OF]`, amtlich)* — GEBAUT 5.7.2026: (a) Verjährungs-/Gewährleistungs-Board · (b) Verzugs-/Inkasso-Strecke · (c) Gerichts-Baustein-Set (Zitierer + Rubrum-Vorlage). Reine Darstellung auf bestehenden Engines (§3), golden 201 (+8 additiv), Gegenprüfung bestanden. **Chronik:** `ROADMAP-CHRONIK.md` → W2·7.
  <!-- @meta id: W2·7 · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein -->
- [ ] **8 · Schriften-Baukasten** *(VORLAGEN, Worktree)* — Berufung/BGG-Beschwerde/Sistierung/
  <!-- @meta id: W2·8 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md -->
  Beweisverzeichnis über `vorlagen/engine.ts`; Zulässigkeit nur Hinweis, Status «entwurf».
  - [ ] **Zitat-Export & Fussnoten-Ausgabe** *(Ideen-Intake 20.7.2026, `[OF]`, klein → inline §14.1)* —
    Ein-Klick-Zitat in korrekter amtlicher Form (`BGE 148 III 1 E. 2.3`) + Fussnoten-Ausgabe; Formvorschriften
    bestimmen die angebotenen Exportformate (§8). **Detail:** [FAHRPLAN-VORLAGEN-AUSBAU.md](fahrplaene/FAHRPLAN-VORLAGEN-AUSBAU.md) §1.
- [ ] **9 · Aufräum-Item** *(UX-PUNKTELISTE ⚫ überholt)*. **Verengt 31.7.2026 auf zwei Restpunkte.**
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §20 — dort steht
  die massgebliche Fassung der zwei Restpunkte (A3 / E-Optional) samt Herkunftsbeleg auf
  `archiv/FAHRPLAN-UX-PUNKTELISTE.md`. Der frühere `fahrplan:`-Zeiger auf die Archivdatei lieferte
  die überholte 20-Punkte-Liste statt der Verengung (Endprüfungs-Fund 14, 31.7.2026).
  **§14-Intake 20.7.2026 (David):** Bedienungsanleitung/Onboarding für LexMetrik — Ersteinstieg «was kann das Werkzeug», je Rubrik ein Kurzpfad; **Träger sind `W2·16-INVENTAR` und `W2·16-ANLEITUNG`** (`fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md`), **nicht** dieser Schritt — die UX-Punkteliste enthält zu Bedienungsanleitung/Onboarding kein Wort (Grep-Befund 31.7.2026), der frühere Zeiger hierher war faktisch falsch.
  <!-- @meta id: W2·9 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  **Restbestand:** (a) **A3** — Anw. 18 «Kacheln einer Reihe gleich hoch» vs. gebautes `items-start`
  (`src/components/forms/GebvKostenForm.tsx:97`), zur David-Abnahme geflaggt; (b) **E-Optional** —
  globaler Schalter «aufgehobene Normen ausblenden» nie gebaut. Die Prämisse «*bevor* Restpunkte
  C2/C5 angefasst werden» ist aufgelöst: C2 und C5 sind gebaut. Das Deliverable **Mapping-Tabelle
  alt-Punkt → Code-Pfad → Status** ist durch das Archiv-Verdikt 31.7.2026 geliefert (18/20 live,
  Batch D über IV-1/IV-2, Batch F über `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md`) — **das Abhaken
  bleibt David-Entscheid** (Status-Hoheit), darum steht `status` unverändert auf `ready`.
  Detail `archiv/FAHRPLAN-UX-PUNKTELISTE.md`.
- [x] **12 · Code- & Bibliothek-Hygiene** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit
  <!-- @meta id: W2·12-HYGIENE · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: archiv/FAHRPLAN-CODE-HYGIENE.md -->
  **ABGESCHLOSSEN 24.7.2026** — alle baubaren Einheiten H-1…H-14 + B24 ✅ (zuletzt B24
  inhalt.tsx-Split 1494→781 Z., PR #338 `b56b9193`; H-3 No-op, Git-Stand bereits sauber).
  Status-Log je Einheit: `archiv/FAHRPLAN-CODE-HYGIENE.md §S`. Gesperrt-/Eskaliert-Posten laufen
  ausserhalb weiter: Alt-Engine-Ablösung Gründungsgebühren (Entscheid-Queue David) ·
  NE-Umzugsprüfung + Fedlex-Wiedervorlagen (Currency-Slot, «Pflege & Termine»).
  41 Befunde + 3 Kritik-Linsen mit Repo-Stichproben)* — Plan-Prosa-Wortlaut (14 Bau-Einheiten H-1…H-14, Beweisregeln G1–G3) → `ROADMAP-CHRONIK.md` → W2·12-HYGIENE (26.7.2026).
- [ ] **13 · Kantonale Gesetze & Darstellung** *(Auftrag David 12.7.2026, `[OF]`; Ultracode-Audit
  <!-- @meta id: W2·13-KANTONE · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/normtext, src/pages/gesetz-leser/inhalt.tsx, src/pages/GesetzLeser.tsx, src/components/NormText.tsx, src/lib/suche/onlineVolltext.ts, src/lib/normtext/relevanz.ts, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  44 Befunde + 3 Kritik-Linsen (10 live an Amtsquellen re-verifiziert) — **14 sofort baubare Einheiten
  K-1…K-14**; Extraktions-Anteile sind Risikopfad ⇒ `QS-GP` + golden byte-gleich.
  **Detail:** [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2. Trailer `Roadmap: W2·13-KANTONE`.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-KANTONE.md](fahrplaene/FAHRPLAN-KANTONE.md) §2 (ROADMAP-Spec W2·13-KANTONE). Trailer `Roadmap: W2·13-KANTONE`.
  - [ ] **K-1 · Reader-Treue P0** *(F24/F25/F28/F33/F29-Display/F5, M)* — Lesereihenfolge, Doppel-Decode, «SR»-Label, Titel-Dopplung, Fussnoten-Stern-Strip, A14-Relevanz fr/it; reine Display-Schicht. §1-A.
    <!-- @meta id: W2·13-KANTONE-K1 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/inhalt.tsx, src/pages/gesetz-leser/inhalt-volltext.tsx, src/pages/GesetzLeser.tsx, src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx, src/lib/normtext/relevanz.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-2 · §8-Ehrlichkeit UI** *(F26-UI/F37/F44/F27-Rest, S–M)* — zweistufiger Currency-Chip, Kanton-Hinweis im KontextPanel, Abdeckungs-Kontextzeile, «Stand unbekannt», Systematik-Hinweis; reine Anzeige. §1-A.
    <!-- @meta id: W2·13-KANTONE-K2 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K1] · kollision: [src/components/kontext/KontextPanel.tsx, src/components/NormText.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-3 · Suche: Kanton-Treffer auf die richtige Ebene** *(F35/F36, S)* — Edge-DTO um `ebene`/`kanton`, Treffer-Href auf `/gesetze/<ebene>/…`, Kanton-Marke, Reader-Redirect. §1-A.
    <!-- @meta id: W2·13-KANTONE-K3 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K2] · kollision: [src/lib/suche/onlineVolltext.ts, api/suche.ts, src/components/suche] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-4 · Einzel-Nachzüge Stand/Currency** *(F14/F9 + SO-Lektion, S — **Risikopfad**, `QS-GP`)* — ZG-161.7 nachziehen, SZ-Stand klären, Invariante «stand ≤ Generierungsdatum» ins Tor `check:normtext`, Vollständigkeits-Invariante gegen den strukturell blinden Drift-Check. §1-A.
    <!-- @meta id: W2·13-KANTONE-K4 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K3] · kollision: [scripts/normtext/check-drift.ts, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-5 · NormText-Verweise Kanton** *(F41 → F40 → F42, M)* — **EINE Einheit (gleiche Datei)**, golden-neutral; harte Binnenfolge **F41 vor F40** (sonst fehlt der Ersatz), F42 nachrangig. §1-A.
    <!-- @meta id: W2·13-KANTONE-K5 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K4] · kollision: [src/components/NormText.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-6 · Quellen-Hygiene: lexfind → amtlich + Dedupe** *(F7/F8/F15/F11/F25-Keys/F22, M — **Risikopfad**, `QS-GP`)* — **pro Kanton eine Tranche**; Binnenfolge K-6a (Dedupe) vor K-6d (GL-Key-Migration). §1-A.
    <!-- @meta id: W2·13-KANTONE-K6 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K5] · kollision: [public/normtext/kanton, scripts/normtext/lexfind-discovery.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter** *(F20-GATE/F17a/F18/F16/F19/F23/F13, M — **Risikopfad**, `QS-GP` + pdfplumber-Gegenprobe)* — Teil a ist das **harte Dehyphenations-Gate**; ohne es bleibt jeder FR/VS/AR-PDF-Nachzug gesperrt. §1-A.
    <!-- @meta id: W2·13-KANTONE-K7 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K6] · kollision: [scripts/normtext, public/normtext/kanton] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-8 · xhtml-`<p>`-Strukturerhalt** *(F21, M)* — `parseSegment` im LexWork-Adapter, Schema nur additiv, Golden-Diff korpusweit offline. §1-A.
    <!-- @meta id: W2·13-KANTONE-K8 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K7] · kollision: [scripts/normtext/adapter-lexwork.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-9 · Erlass→Werkzeug-Brücke Kanton** *(F38, M)* — Build-Zeit-Inversion der Tarif-`quelleUrl`s zu `KANTON_ERLASS_WERKZEUGE` + Konsistenz-Tor; reine Metadaten. §1-A.
    <!-- @meta id: W2·13-KANTONE-K9 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K8] · kollision: [src/lib/startseiteConfig.ts, public/normtext/register.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-10 · AR-Sidecar-Batch** *(F30-AR, M)* — 263 der 314 fehlenden Struktur-Sidecars sind AR; nur amtliche Überschriften, **Einzel-Erlass-POC vor dem Batch**; 1 Kanton = slot-frei. §1-A.
    <!-- @meta id: W2·13-KANTONE-K10 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K9] · kollision: [public/normtext/struktur, scripts/normtext/struktur-extrahiere.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-11 · Kanton-Reader-Performance profilieren** *(F32, M)* — **erst messen**: `check:perf-budget` um den Kanton-Leserpfad erweitern, nichts «fixen» vor dem Profil (Ursache unbewiesen). §1-A.
    <!-- @meta id: W2·13-KANTONE-K11 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K10] · kollision: [src/pages/gesetz-leser] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-12 · Reports & kuratierte Listen** *(F3-Report/F4-Liste/F33-Daten, S–M)* — lesend/planend; K-12b ist reine Planung ohne Fetch, K-12a-AR-Anteile erst nach dem F20-Gate aus K-7. §1-A.
    <!-- @meta id: W2·13-KANTONE-K12 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K11] · kollision: [scripts/normtext/inventar-kanton.ts, scripts/normtext/lexfind-discovery.ts] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-13 · Systematik-Bäume 7 Kantone** *(F6≡F43, M)* — ZH/GE/VD/TI/SZ/NE/JU fehlen (19 von 26 vorhanden); Quell-Erhebung je Kanton empirisch und browserlos, kantons-einzeln frei. §1-A.
    <!-- @meta id: W2·13-KANTONE-K13 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K12] · kollision: [scripts/normtext/kanton-systematik-run.ts, public/normtext/kanton-systematik.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
  - [ ] **K-14 · Kantonales Zitat-Vokabular — POC** *(F39, L — **Risikopfad**, `QS-GP`)* — POC über 5 Gerichts-Kantone × 6 Entscheide, nur exakte Sammlungsnummer-Matches, additiver Extraktions-Pass. **Prämisse «Entscheid-`normKeys` sind Bund-only» vor dem Bau gegen `W2·6-NKEY` nachmessen.** §1-A.
    <!-- @meta id: W2·13-KANTONE-K14 · status: ready · of: ja · blocker: null · dep: [W2·13-KANTONE-K13] · kollision: [scripts/rechtsprechung, public/rechtsprechung, src/lib/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-KANTONE.md -->
- [ ] **14-SIGNAL · Watchlist & Änderungs-Signale** *(Ideen-Intake 20.7.2026 · Infra/UI, kein Rechtsinhalt)*:
  <!-- @meta id: W2·14-SIGNAL · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json, public/rechtsprechung/register.json, src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  «Sag mir, wenn sich Norm Y ändert / Gericht X neu entscheidet.» **Baut ausschliesslich auf vorhandenen
  Signalen** (Currency/Register/Wiedervorlage); Speicherung lokal, Werkzeuge bleiben zustandslos.
  **Detail:** [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §16. Trailer `Roadmap: W2·14-SIGNAL`.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-FEDLEX-PORTFOLIO.md](fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md) §16 (ROADMAP-Spec W2·14-SIGNAL). Trailer `Roadmap: W2·14-SIGNAL`.
  - [ ] **14-SIGNAL-B1 · Statischer Änderungs-Feed (🟢)** — RSS/Atom/JSON zur Build-Zeit aus `currency.json` + Verfallsregister; **nur der VORWÄRTS-Fall** (`naechsteFassungAb`).
    <!-- @meta id: W2·14-SIGNAL-B1 · status: ready · of: ja · blocker: null · dep: [] · kollision: [scripts/fedlex-wiedervorlage-generieren.ts, public/normtext/currency.json] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **14-SIGNAL-B2 · Client-Watchlist (🟢)** — localStorage-Liste gemerkter Normen, beim Besuch gegen die Build-Artefakte geprüft. **Rückblick-Flag gegen `fassungsToken`/`sha`, nie `geprueftAm`.**
    <!-- @meta id: W2·14-SIGNAL-B2 · status: ready · of: ja · blocker: null · dep: [W2·14-SIGNAL-B1] · kollision: [src/lib/zuletztVerwendet.ts, src/pages/Startseite.tsx, src/pages/Einstellungen.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  - [ ] **14-SIGNAL-GER · Gerichts-Delta mit ehrlicher Latenz (🟡)** — Build-Zeit-Delta über `register.json` je Gericht/Norm; **eigenes Verdikt**, Import-Kadenz sichtbar ausgeliefert (§8).
    <!-- @meta id: W2·14-SIGNAL-GER · status: ready · of: ja · blocker: null · dep: [W2·14-SIGNAL-B2] · kollision: [public/rechtsprechung/register.json, scripts/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
- [ ] **15-CLS · Echter CLS-Defekt auf `/gesetze` (0.109 @8× CPU)** *(§14-Intake 20.7.2026 · **Produktfehler**, reine UI)*
  <!-- @meta id: W2·15-CLS · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/Gesetze.tsx, src/components/start] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-PERFORMANCE.md -->
  **Bewusst ein eigener Schritt und NICHT unter `QS-PERF` mitgeführt** — ein gemessener Produktfehler
  auf `/gesetze` (CLS 0.109 @8× CPU), reine UI, keine Logik-Berührung.
  **Detail:** [FAHRPLAN-PERFORMANCE.md](fahrplaene/FAHRPLAN-PERFORMANCE.md) §2. Trailer `Roadmap: W2·15-CLS`.
- [ ] **16-INVENTAR · Funktions-Inventar (Vorstufe der Bedienungsanleitung)** *(§14-Intake 20.7.2026, David: «erst wenn es Sinn ergibt» → Zweischritt, dies ist Schritt 1)*
  <!-- @meta id: W2·16-INVENTAR · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/startseiteConfig.ts, bibliothek/INDEX.md] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Vollständige, **ehrliche** Aufnahme dessen, was Lexmetrik heute kann — Quelle bleibt
  `startseiteConfig.ts` (§5), Status-Modell entwurf/geprüft/geplant ungeschönt (§8).
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §9. Trailer `Roadmap: W2·16-INVENTAR`.
- [ ] **16-ANLEITUNG · Bedienungsanleitung / Onboarding** *(§14-Intake 20.7.2026, David — Schritt 2, **bewusst spät**)*
  <!-- @meta id: W2·16-ANLEITUNG · status: ready · of: ja · blocker: null · dep: [W2·16-INVENTAR] · kollision: [src/pages, src/components/layout] · seq-hart: [QS-UI(8a), W2·5h-GESETZ-UI(8b)] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-QUALITAET.md -->
  Davids Vorgabe wörtlich: **«erst wenn es Sinn ergibt»** — die Anleitung folgt dem Inventar, nicht
  umgekehrt (`dep: [W2·16-INVENTAR]`); bewusst spät, damit sie nichts beschreibt, was sich noch bewegt.
  **Detail:** [FAHRPLAN-UI-QUALITAET.md](fahrplaene/FAHRPLAN-UI-QUALITAET.md) §10. Trailer `Roadmap: W2·16-ANLEITUNG`.
- [ ] **17 · UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)** *(Auftrag David 31.7.2026, Lieferung einer externen Sichtprüfung vom 29.7.)*
  <!-- @meta id: W2·17-UI-BEFUNDE · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/**] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  Externe Sichtprüfung, geschnitten nach Bauteil K-01…K-20; Triage 31.7.2026: **45 NEIN · 144 VERDACHT ·
  15 BEREITS-GEBAUT · 6 SICHER**, davon **20 Batches** (19 Bau-Batches mit 189 Befunden + 1 Prüf-Batch, 15).
  **Detail:** [FAHRPLAN-UI-BEFUNDE.md](fahrplaene/FAHRPLAN-UI-BEFUNDE.md) §1. Trailer `Roadmap: W2·17-UI-BEFUNDE`.
  **Reihenfolge-Freigabe (`@queue`) bleibt Davids Entscheid** — darum bewusst NICHT in der Queue.
  - [~] **B1 · Chips, Badges und Normzitate (K-05 + K-10)** — 16 Befunde (Blocker 3 · Hoch 3). §2.
    <!-- @meta id: W2·17-UI-BEFUNDE-B1 · status: wip · of: ja · blocker: null · dep: [] · kollision: [src/components/NormText.tsx, src/components/NormPopover.tsx, src/components/verzahnung, src/components/rechtsprechung, src/pages/gesetz-leser] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B2 · Verlauf und Zustand in der URL (K-20)** — 11 Befunde (Blocker 2 · Hoch 5). §3.
    <!-- @meta id: W2·17-UI-BEFUNDE-B2 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B1] · kollision: [src/components/layout, src/pages/gesetz-leser, src/pages/EntscheidLeser.tsx, src/pages/Rechtsprechung.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B3 · Klebende Leisten (K-01)** — 7 Befunde (Blocker 2 · Hoch 4). §4.
    <!-- @meta id: W2·17-UI-BEFUNDE-B3 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B2] · kollision: [src/components/layout, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B4 · Leseansicht Gesetz (K-14)** — 12 Befunde (Blocker 2 · Hoch 4). §5.
    <!-- @meta id: W2·17-UI-BEFUNDE-B4 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B3] · kollision: [src/pages/gesetz-leser, src/components/NormText.tsx, src/components/normtext] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B5 · Druck, Farbschema, Reiter- und Split-Ansicht (K-16 + K-17 + K-18)** — 8 Befunde (Blocker 2 · Hoch 2). §6.
    <!-- @meta id: W2·17-UI-BEFUNDE-B5 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B4] · kollision: [src/index.css, src/components/layout/Pane.tsx, src/components/layout/TabPanel.tsx, src/components/layout/ThemaUmschalter.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B6 · Fehler-, Leer- und Ladezustände (K-15)** — 14 Befunde (Blocker 1 · Hoch 9). §7.
    <!-- @meta id: W2·17-UI-BEFUNDE-B6 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B5] · kollision: [src/components/fehlermeldung.ts, src/components/ErrorBoundary.tsx, src/components/suche/SucheLeerzustand.tsx, src/pages/NotFound.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B7 · Overlays und Menüfenster (K-02)** — 8 Befunde (Blocker 1 · Hoch 3). §8.
    <!-- @meta id: W2·17-UI-BEFUNDE-B7 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B6] · kollision: [src/components/layout/HeaderSuche.tsx, src/components/layout/ReiterUebersicht.tsx, src/components/layout/VerlaufUebersicht.tsx, src/components/suche] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B8 · Menüinhalt, Zustandsanzeige und Scrollbereiche (K-03 + K-07)** — 10 Befunde (Blocker 1 · Hoch 3). §9.
    <!-- @meta id: W2·17-UI-BEFUNDE-B8 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B7] · kollision: [src/components/layout, src/components/forms, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B9 · Textsatz und Umbruch (K-12)** — 12 Befunde (Blocker 1 · Hoch 2). §10.
    <!-- @meta id: W2·17-UI-BEFUNDE-B9 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B8] · kollision: [src/components/typografie.tsx, src/index.css, src/components/NormText.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B10 · Aktions-Anker, Symbolknöpfe und Trefferflächen (K-09b)** — 7 Befunde (Blocker 1 · Hoch 1). §11.
    <!-- @meta id: W2·17-UI-BEFUNDE-B10 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B9] · kollision: [src/components/ui, src/pages/gesetz-leser, src/components/rechtsprechung] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B11 · Karten (K-04)** — 13 Befunde (Blocker 0 · Hoch 4). §12.
    <!-- @meta id: W2·17-UI-BEFUNDE-B11 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B10] · kollision: [src/components/Katalog.tsx, src/components/start, src/components/ui] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B12 · Eingabe- und Auswahlfelder — Blocker bis Mittel (K-08a)** — 11 Befunde (Blocker 0 · Hoch 4). §13.
    <!-- @meta id: W2·17-UI-BEFUNDE-B12 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B11] · kollision: [src/components/forms, src/components/DatumsFeld.tsx, src/components/BetragsFeld.tsx, src/components/ui] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B13 · Zahlen-, Datums- und Zählformate (K-11)** — 12 Befunde (Blocker 0 · Hoch 3). §14.
    <!-- @meta id: W2·17-UI-BEFUNDE-B13 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B12] · kollision: [src/components/locale.tsx, src/components/ErgebnisAnzeige.tsx, src/components/forms] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B14 · Brotkrume, Kopfzeilen und Seitenmeta (K-19a)** — 8 Befunde (Blocker 0 · Hoch 3). §15.
    <!-- @meta id: W2·17-UI-BEFUNDE-B14 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B13] · kollision: [src/components/layout/InhaltsKopf.tsx, src/components/RouteMeta.tsx, src/pages/Materialien.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B15 · Umschalter, Tabs und Akkordeons (K-06)** — 9 Befunde (Blocker 0 · Hoch 2). §16.
    <!-- @meta id: W2·17-UI-BEFUNDE-B15 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B14] · kollision: [src/components/ui, src/components/layout/TabPanel.tsx, src/components/forms] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B16 · Seitengerüst und Inhaltsbreite (K-13)** — 8 Befunde (Blocker 0 · Hoch 2). §17.
    <!-- @meta id: W2·17-UI-BEFUNDE-B16 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B15] · kollision: [src/components/layout/Shell.tsx, src/components/layout/Footer.tsx, src/index.css] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B17 · Schaltflächen — Varianten, Gewichtung, Deaktiviert-Zustand (K-09a)** — 8 Befunde (Blocker 0 · Hoch 1). §18.
    <!-- @meta id: W2·17-UI-BEFUNDE-B17 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B16] · kollision: [src/components/ui, src/index.css, src/components/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B18 · Listen, Suche und Relevanz (K-19b)** — 8 Befunde (Blocker 0 · Hoch 1). §19.
    <!-- @meta id: W2·17-UI-BEFUNDE-B18 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B17] · kollision: [src/pages/Gesetze.tsx, src/components/suche, src/lib/suche] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B19 · Eingabe- und Auswahlfelder — Detail (K-08b)** — 7 Befunde (Blocker 0 · Hoch 0). §20.
    <!-- @meta id: W2·17-UI-BEFUNDE-B19 · status: ready · of: ja · blocker: null · dep: [W2·17-UI-BEFUNDE-B18] · kollision: [src/components/forms, src/components/ui] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
  - [ ] **B20 · Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)** — 15 Befunde (Blocker 1 · Hoch 5). §21.
    <!-- @meta id: W2·17-UI-BEFUNDE-B20 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components, src/pages] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-UI-BEFUNDE.md -->
    **`dep: []` seit 31.7.2026 (Endprüfungs-Fund 18):** B20 ist kein Neubau, sondern Nachmessung,
    und trägt mit LM-062 den einzigen Blocker der «bereits gebaut»-Klasse. Am Kettenende hätte die
    Behauptung «ist gebaut» erst nach 19 Bau-Batches geprüft — erwiese sie sich als falsch, entstünde
    der Bau-Posten am spätesten möglichen Punkt. B20 ist damit **unabhängig und vorziehbar**; die
    Bau-Kette B1→…→B19 bleibt unverändert seriell. `plan:next` führt B20 dadurch gewollt in ready-now.

### Welle 3 — Tiefe / Breite (opportunistisch)

- [ ] **10 · Neue Rechner-Klingen** *(`[OF]`, §2/§7)*: **Zustellfiktions-Engine** (deterministisch,
  <!-- @meta id: W3·10 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md -->
  fristrelevant) · **Gesellschaftsrechtliche Schwellen-Module** (OR 727/671/653s, harte Zahlen) ·
  **Schutzrechts-Gebühren IGE** · **Normfassungs-/Geltungsstand-Prüfer** (intertemporal) ·
  **Kantonale Gerichtsferien-Datenschicht** (eigene/zusätzliche Gerichtsferien im kant.
  Verfahrensrecht VRPG/Justizgesetz, optionale Schicht über der bestehenden `stillstandsperioden`-
  Strategie, je Kanton eigene Deklaration — **26×-Datenasset, Leitprinzip 4/Slot beachten**;
  Bau-Auflagen Zustellfiktion SchKG strikt trennen, BGE 138 III 225 nur offengelegte Annahme:
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P3).
  **Zum `fahrplan: archiv/…` (bewusste Ausnahme, deklariert 31.7.2026 — Endprüfungs-Fund R3-3/R3-11):**
  Für W3·10 gibt es **keinen aktiven Nachfolger** — die 20 §§ von `fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md`
  decken PRODUKTAUSBAU/BURGGRABEN nicht ab, anders als bei `W3·13`. Der Zeiger bleibt darum auf die
  Archivdatei; deren Kopf trägt **Stand 14.6.2026** und ist nach §0 der Archiv-Restpunkte **teilweise
  stale**. Die Restpunkte-Extraktion (Zustellfiktion, OR-Schwellen, IGE-Gebühren, kant. Gerichtsferien)
  **steht aus** und gehört in den Bau-Batch dieses Schritts. Massgeblich ist bis dahin §P3, gelesen mit
  diesem Vorbehalt.
- [ ] **11 · Gesetzgebungs-/Rechtsetzungs-Tracking** *(neu, amtlich)*. Übersicht «was kommt»:
  <!-- @meta id: W3·11 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md -->
  Vernehmlassungen (admin.ch), Parlamentsgeschäfte (parlament.ch), in AS/BBl publiziert aber noch
  nicht in Kraft (Fedlex), künftige Fassungen — Drift gegen die geltende Fassung. Andockpunkt
  `fedlex.ts`/Drift-System.
  **Teil-ERLEDIGT 10.7.2026 (Fedlex-Portfolio Paket 3: Vernehmlassungen, 822 Verfahren).** Wortlaut → `ROADMAP-CHRONIK.md` → W3·11 (26.7.2026); Detail `fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3` + `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.
  **Rest offen:** Parlamentsgeschäfte (parlament.ch), künftige-Fassungen-Drift, Übersichtsseite «alle
  laufenden Vernehmlassungen», Laufend-Badge im Reader-Kopf (gesetz-leser war TABU).
- [ ] **12 · Kanton-Gesetze-Bündel** *(GESETZE-IMPORT-3TIER + BS-VORBILDKANTON + RECHTSSAMMLUNG P6 + POPUP-Kanton-Rest, 26×)*. **Erst öffnen, wenn
  <!-- @meta id: W3·12 · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: nein · 26x: ja · fahrplan: fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md · slot: inhaber -->
  **SLOT-ÜBERGABE 20.7.2026: dieser Schritt hält jetzt den 26×-Slot** (`slot: inhaber`); Reihenfolge
  E3 → W3·12 entschieden (David 2.7.). Kanton-Gesetze-Bündel = 3-Tier-Import + BS-Vorbildkanton +
  Rechtssammlung P6 + POPUP-Kanton-Rest; nie zwei 26×-Assets parallel (Leitprinzip 4).
  **Detail:** [FAHRPLAN-GESETZE-IMPORT-3TIER.md](fahrplaene/FAHRPLAN-GESETZE-IMPORT-3TIER.md) §6. Trailer `Roadmap: W3·12`.
- [ ] **13 · Vorlagen-Breite** *(VORLAGEN V5/V6/V8, GMBH G2, VERTRAGS-VARIANTEN P3; Worktree)*.
  <!-- @meta id: W3·13 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/vorlagen] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md -->
  Tiefe vor Stückzahl. GmbH qualifizierte Gründung (777c II) · Musterklagen (Bauhandwerkerpfand) ·
  Basistypen (Kauf/Fahrniskauf Art. 184 ff. dispositiv, Schenkung/Pacht/Darlehen/Bürgschaft).
  **Detail:** [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §10
  (Vertrags-Varianten) + §11 (GmbH-Gründung) — W3·13 trägt beide Stränge. *(Zeiger 31.7.2026
  umgestellt, Endprüfungs-Fund R2-14/R2-19: `fahrplan:` zeigte auf `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md`
  und lieferte damit die archivierte Vollfassung statt der massgeblichen Restpunkte — dieselbe
  Lage und dieselbe Begründung wie bei `W2·9`; §0 der Archiv-Restpunkte erklärt die archivierten
  Köpfe ausdrücklich für teilweise stale.)*
- [ ] **14 · Multi-Pane / Split-View** *(SPLIT-VIEW, Fundament-Umbau, eigener Worktree; Auftrag
  <!-- @meta id: W3·14 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/components/layout/Shell.tsx, src/components/layout/Topbar.tsx, src/App.tsx, tailwind.config.js] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
  David 29.6.2026)*. 2–3 „Engines" nebeneinander **wie im Browser** → der **Verzahnungs-Burggraben
  sichtbar** (Gesetz | Rechner | Begründungs-Absatz). **Erst Strang A** (Inhaltsbreite-Umschalter),
  dann der Fundament-Umbau; eigener Worktree (§12).
  **Detail:** [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1. Trailer `Roadmap: W3·14`.
  **Session-Granularität (AP-6, 31.7.2026):** Schnitt-Begründung und die bewusst nicht portionierten Posten wörtlich in [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1 (ROADMAP-Spec W3·14). Trailer `Roadmap: W3·14`.
  - [ ] **14-B3 · Scroll & Fokus pro Pane — Restposten** — pro-Pane-Scroll und Spy laufen; **offen**: Scroll-POSITIONS-Wiederherstellung (`App.tsx` noch window-basiert) + Tastatur-Pane-Wechsel. §STRANG B (B-3).
    <!-- @meta id: W3·14-B3 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/App.tsx, src/components/layout/usePaneLayout.ts, src/components/layout/Pane.tsx] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
  - [x] **Gebündelt (Auftrag David 29.6.2026): Bildschirm-/Responsive-Audit** *(SPLIT-VIEW, `[OF]`)* — AUDIT GEFAHREN 5.7.2026 (rein lesend, PR `chore/responsive-audit`): 30 Motive × 5 Breiten = 150 Aufnahmen, 0 Seiten-Overflow, 12 Defekte geflaggt; Befund `abnahme/responsive-audit/BERICHT.md`, Fixes = spätere Schritt-14-Einheiten. **Chronik:** `ROADMAP-CHRONIK.md` → W3·14-Responsive-Audit.
    <!-- @meta id: W3·14-Responsive-Audit · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
  - [x] **Responsive-Audit-Defekte D1–D10 abgearbeitet** *(reines UI, Go David 10.7.2026, Branch `fix/responsive-audit-defekte`)* — ✅; Status je Defekt in `abnahme/responsive-audit/BERICHT.md`. Wortlaut → `ROADMAP-CHRONIK.md` → W3·14-Responsive-Defekte (26.7.2026).
    <!-- @meta id: W3·14-Responsive-Defekte · status: done · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein -->
  - [ ] **+ Auftrags-Eingang 30.6.: Bündel S** — **S1** Breadcrumbs in der Pane laufen über globalen
    <!-- @meta id: W3·14-S · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
    Router-`<Link>` (`InhaltsKopf.tsx` Z.30) statt PaneKontext-Navigator → fixen · **S2** Tracker «alles
    schliessen» muss auch `usePaneLayout` (Pane-Store) leeren. S1+S2 bündeln. Wortlaut: [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
  - [ ] **Split-View a11y-Restpunkte** *(SPLIT-VIEW, `[OF]`, NIEDRIG — aus §9-Bug-Check 29.6.2026)* —
    <!-- @meta id: W3·14-a11y · status: ready · of: ja · blocker: null · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-SPLIT-VIEW.md -->
    3 verifizierte, bewusst **nach** dem Prod-Deploy zurückgestellte a11y-Kanten der Pane-Schicht.
    **Detail:** [FAHRPLAN-SPLIT-VIEW.md](fahrplaene/FAHRPLAN-SPLIT-VIEW.md) §1.
- [ ] **15-RICHTER · Spruchkörper-Analytik** *(Ideen-Intake 20.7.2026 · **bewusst freigabe-pflichtig**)* —
  <!-- @meta id: W3·15-RICHTER · status: blocked · of: ja · blocker: richter-analytik-gate · dep: [] · kollision: [] · worktree: ja · 26x: nein · fahrplan: fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md -->
  Ziel = **ausschliesslich deskriptive** Spruchkörper-Muster auf Entscheid-Metadaten (Sachgebiete/
  Formalien je Kammer und Zeitraum). **Verfahrensausgänge sind bewusst NICHT Gegenstand** — keine
  Erfolgsquoten, keine Prognose über Personen (§2/§8). **Bleibt freigabe-pflichtig**
  (Blocker `richter-analytik-gate`); Fundament liegt in `W2·6-FILTER`/`R-RICHTER`.
  **Detail:** [FAHRPLAN-RECHTSPRECHUNG.md](fahrplaene/FAHRPLAN-RECHTSPRECHUNG.md) §14.

---

## 🚀 Batch-Deploy-Fenster (eigenes Item)

✅ **Erledigt 2.7.2026** — der aufgestaute Stand (Beurkundungs-Ausbau, Vertrags-Varianten P0–P2, S0,
Welle-1-Ergebnisse, M13, Bündel N, AKN-Batch PR #78) ist auf PROD (Deploy `a3769d72`). Das Fenster
bleibt als **Mechanismus**: künftige gegatete Stände sammeln, Push/Deploy **nur auf Davids frisches
Ja** (§9), aus sauberem HEAD-Worktree (§12).

---

## Geparkt (bis ≥1.12.2026 / Nutzerfeedback / Markt)

- **Dossier / Fall-Rückgrat** *(FALL-RUECKGRAT, G3.3, PRODUKTAUSBAU Säule A)* — Mandats-/Dossier­
  verwaltung & «Meine Fristen». Vorerst draussen; alle Werkzeuge bleiben stateless. Umfasst auch
  das nie gebaute schlanke URL-Kontext-Rückgrat (PRODUKTAUSBAU P2, A-E0–E3 `fallakte`/`c_`-Transport)
  samt Bau-Auflagen (keine Kanonisierung mehrdeutiger Beträge, `koPrefill` nicht anfassen) — Detail
  `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P2.
- **Markt-Themen** — Hosting (Infomaniak), Domain `lexmetrik.ch`, Zahlung (Payrexx/Datatrans/TWINT),
  Login/Pro.
- ~~Grundsätzliche Startseiten-Überarbeitung~~ — **✅ ENTPARKT 3.7.2026 → Welle 2 · Schritt 5c**
  (Ultracode-Recherche + bindendes Council-Verdikt; bündelt Redesign-zurückgestellt 16.6.,
  FUNDAMENT-Startseitenrahmen, I1 + I2; Spec `archiv/FAHRPLAN-STARTSEITE-V3.md`).
- **Live-Rechtsprechung** — §4-blockiert (s. Verifikations-Blockaden).
- **Betriebs-Instrumente (später):** Sentry (erst bei Traffic; A5-Fehler-Link deckt jetzt) · CodeQL ·
  `npm audit` als Prüf-**Meldung** (nie Stopper) · Claude-Code-PR-Action (bewusster Entscheid) —
  Detail + Verworfen-Liste: `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`.
- **Abnahme-Warteschlange** (Haftungsrang: 1 Fristen → 2 Form-Gate-Vorlagen → 3 Beträge; aufgereiht,
  nicht gedrängt): BGER-RECHTSWEG (§7) · BEURKUNDUNGS-AUSBAU · NOTARIAT/LUECKEN (`geprüft`) ·
  GESETZESTEXT-POPUP-Snapshots · GRUNDLAGEN G2/B.
- **Offene David-Grundsatzfragen** (gebündelt mitführen): Dienstjahr-Stichtag Kündigungsfrist ·
  Sperrtage-Konvention · 3 Export-Antworten · GebV-SchKG-Promille-Rundung (0.01 vs. amtlich 0.05).

---

## Pflege & Termine  *(Quelle: `bibliothek/register/parameter-verfall.md`)*

- **30.6.2026** — SG-GKV (= S0). · **Anfang Sept.** — Referenzzins (quartalsweise). · **1.11.2026**
  — BE-Formularpflicht. · **Vor SchKG-Abnahme** — GebV-SchKG-Revision AS 2025 630 vs. Staffel 1.1.2022.
  · **Vor Mietvertrags-Abnahme** — VMWG Art. 19a am Original. · **Feiertage** je Kanton vor «geprüft»
  (BJ-Liste Stand 2011).

---

## Funktions-Katalog (Aufbau + Auflagen je Werkzeug)

Quellen durchgehend amtlich (Fedlex / amtliche Sammlungen / amtliche Entscheide+Regesten / amtliche
Tarife+Verzeichnisse — Art. 5 URG). Alle Werkzeuge **stateless**. «grenzwertig» = amtlich nutzbar mit
harter Auflage.

| Werkzeug | Welle | neu/vorh. | §2 | Quelle amtl. | Aufw. |
|---|---|---|---|---|---|
| Fristen-Cockpit (Vorw./Rückw./Stillstand) | 1 | Verpackung | ja | ja | M |
| Streitwert + Grenzwert-Abgleich | 1 | Ausbau | ja | ja | S |
| Zuständigkeits-/Verfahrensnavigator | 1 | Ausbau | ja | ja | S |
| Rechtsmittel-/Eintretensprüfung | 1 | neu | teils | ja | M |
| Prozesskosten-Cockpit (Risiko/Festsetz./Dispositiv) | 1/2 | Verpackung | ja | ja | L |
| Norm→amtlicher Entscheid (Recherche) | 1/2 | Ausbau | ja | grenzwertig | M |
| Mehrsprach-Vergleich DE/FR/IT | 2 | neu | ja | ja | L |
| Verjährungs-/Gewährleistungs-Board | 2 | Ausbau | ja | ja | M |
| Verzugs-/Forderungs-/Inkasso-Strecke | 2 | Verpackung | teils | ja | M |
| Gerichts-/Behörden-Adressregister | 2 | Verpackung | ja | ja | M |
| Gerichts-Baustein-Set (Rubrum + Zitierer) | 2 | Verpackung | ja | grenzwertig | M |
| Schriften-/Eingaben-Baukasten | 2 | Ausbau | teils | ja | L |
| Gesetzgebungs-/Rechtsetzungs-Tracking | 3 | neu | teils | ja | M |
| Zustellfiktions-Engine | 3 | neu | ja | ja | M |
| Gesellschafts-/Schwellen-Module | 3 | neu | teils | ja | L |
| B2B-/Basis-Vertragsbaukasten | 3 | Ausbau | ja | grenzwertig | L |
| Schutzrechts-Gebühren (IGE) | 3 | neu | ja | ja | M |
| Normfassungs-/Geltungsstand-Prüfer | 3 | neu | teils | ja | L |

**Kern-Auflagen je Werkzeug (§1/§2/§8-kritisch)** — wörtlich ausgelagert nach
[FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §1 (Fristen-Cockpit · Streitwert · Rechtsmittel-
prüfung · Prozesskosten · Recherche/Gerichts-Set · Adressregister · Verzug/Inkasso · B2B-Vertrag ·
Schwellen-Module). Sie sind Bau-Auflagen, keine Steuerung — vor dem Bau des jeweiligen Werkzeugs lesen.

---

## Strang-Detailpunkte & Hygiene  *(steuern nicht — Heimat = jeweilige `fahrplaene/FAHRPLAN-*.md`/`STRUKTUR.md`)*

- **Offene Detailpunkte · Infrastruktur-Fundament · Archiv-Kandidaten · Stale Doku-Köpfe · Klein-Backlog**
  — wörtlich ausgelagert nach [FAHRPLAN-GESAMTAUFBAU.md](fahrplaene/FAHRPLAN-GESAMTAUFBAU.md) §2 (Stand 31.7.2026).
  Sie steuern nicht; Heimat bleibt die jeweilige `fahrplaene/FAHRPLAN-*.md`/`STRUKTUR.md`.

### Nachträge aus der Archiv-Welle 31.7.2026 (20 Fahrpläne, verify-then-archive)

*20 `FAHRPLAN-*.md` sind am 31.7.2026 verify-then-archive nach `archiv/` gewandert (je Datei ein
Nur-Lese-Opus-Verdikt, alle NUR-MIT-NACHTRAG). Ihre Restpunkte stehen **wörtlich** in
[FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) — je Strang ein §, dort auch die
Herkunft (AP-3/AP-4) und die drei begründet im Root gebliebenen Dateien. Sie steuern nicht.*

- **Beurkundungs-Ausbau** — 4 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §1
- **BGer-Rechtsweg** — 1 Restpunkt → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §2
- **Fall-Rückgrat** — 3 Restpunkte *(David-Entscheid enthalten)* → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §3
- **Fundament-Umbau** — 6 Restpunkte *(David-Entscheid enthalten)* → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §4
- **Grundlagen** — 4 Restpunkte *(David-Entscheid enthalten)* → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §5
- **International-Volltext** — 2 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §6
- **Kantonale Entscheide** — 5 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §7
- **Lücken schliessen** — 2 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §8
- **Notariat & Grundbuch** — 3 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §9
- **Vertrags-Varianten** — 6 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §10
- **GmbH-Gründung** — 9 Restpunkte *(David-Entscheid enthalten)* → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §11
- **Rechtssammlung (Rubrik V «Gesetze»)** — 3 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §12
- **Begründungs-Absatz** — 6 Restpunkte *(David-Entscheid enthalten)* → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §13
- **BS-Vorbildkanton** — 4 Restpunkte *(David-Entscheid enthalten)* → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §14
- **Code- & Bibliothek-Hygiene** — 4 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §15
- **Gesetzesdarstellung Bund** — 5 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §16
- **Gesetzestext-Popup (Norm-Vorschau)** — 1 Restpunkt → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §17
- **Startseite V3 + Branding I2** — 2 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §18
- **Tarif-Tabellen Stufe 2** — 2 Restpunkte → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §19
- **UX-Punkteliste** — 2 Restpunkte (A3-Abnahme, E-Optional) + 1 Statusbefund → [FAHRPLAN-ARCHIV-RESTPUNKTE.md](fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md) §20

---
*Konsolidiert 28.6.2026 aus den 26 `FAHRPLAN-*.md` + Strategie-Dokumenten + dem früheren
`HANDLUNGSPLAN.md` (→ `archiv/`) + ultracode-Funktions-Ideation (alle Juristen, amtliche Quellen).
Detailquellen = die jeweilige `fahrplaene/FAHRPLAN-*.md`; Ist-Zustand/Deploy = `STRUKTUR.md`; G1-Abdeckung =
`KATALOG-ROADMAP.md`. Diese Datei ordnet sie und ist der eine Plan, der Schritt für Schritt
abgearbeitet wird.*
