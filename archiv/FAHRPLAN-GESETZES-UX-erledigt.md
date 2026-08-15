# FAHRPLAN-GESETZES-UX.md — erledigte §§ (ausgelagert per Fahrplan-§-Diät, aufraeumen.md §4b)

*Ausgelagert 15.8.2026 (BAUPLAN-UMBAU). Der Wortlaut unten ist **unverändert** aus
`fahrplaene/FAHRPLAN-GESETZES-UX.md` übernommen — nie zusammengefasst. Im Fahrplan steht je § eine Stub-Zeile,
die den §-Anker hält und hierher zeigt.*

---

## §10.7 · Ausführungsvermerke der §10-Einheiten *(ausgelagert 15.8.2026)*

### 10.7 · Ausführungsvermerke der §10-Einheiten

**Ausführungsvermerk U-UEBERSICHT (A14 + A15, 5.7.2026, Opus, Worktree
`feat/u-uebersicht-a14-a15`, kollisionsarm — nur Übersicht-Fläche
`src/pages/Gesetze.tsx`, KEIN `parts.tsx`/`inhalt.tsx`/`ArtikelBody.tsx`;
`register.ts` unangetastet):** Beide Anmerkungen auf der gemergten G5/G6-Fläche
gebaut.

- **A14 Kanton-Übersicht.** (1) **Titel umbrechen statt kappen:** `SysZeile` (aus
  `Gesetze.tsx` nach `ErlassKarte.tsx` gezogen, geteilt) auf ein Drei-Spalten-Grid
  `grid-cols-[auto_minmax(0,1fr)_auto]` mit `break-words` umgestellt — der lange
  amtliche Titel läuft mehrzeilig, SR-Nr. und Meta bleiben auf der ersten
  Grundlinie; kein `truncate`, kein H-Overflow (@390 e2e-belegt, BS mit bis 521 Z.
  langen Vertrags-Titeln). (2) **Relevanz-Sortierung**, dokumentiert-deterministisch
  (§8, KEINE geratene Wichtigkeit): `src/lib/normtext/relevanz.ts`,
  **Kanton-Kriterium = «Kern-Erlass-Kategorie, dann Systematik»** — der
  Manifest-`rang` ist für Kantone einheitlich 0 (browse-manifest.ts) und darum
  unbrauchbar; an seine Stelle tritt eine dokumentierte, anker-feste Titel-/Kürzel-
  Klassifikation, die genau Davids genannte Kern-Erlasse zuerst zieht (Kantons­-
  verfassung → Einführungsgesetze → Gerichts-/Behördenorganisation → Steuer-/
  Gebührenrecht), danach die amtliche Systematik (Sachgebiets-Rang · SR-Vergleich).
  Die G5-Umschalter (Alphabet/Erlass-Zahl/Region) auf dem 26er-Kanton-Raster
  bleiben unberührt (sie ordnen die KANTONE, nicht die Erlasse).
- **A15 Gliederungs-Umschalter auf ALLEN drei Säulen** (Relevanz · Systematisch ·
  Rechtsgebiet), gemeinsamer `GliederungUmschalter` (role=group/aria-pressed,
  `src/components/normtext/GesetzeGliederung.tsx`). **Bund:** Relevanz =
  kuratierter Leitgesetz-`rang` (BV, Kern-Kodifikationen zuerst) · Systematisch =
  bestehende `BundSystematik` (Default, byte-gleich) · Rechtsgebiet = bestehende
  `RechtsgebietSicht` als **Modus** (nicht mehr nur die vierte Tür). **Kantone**
  (je gewähltem Kanton): Relevanz (A14) · Systematisch (`KantonSystematik`) ·
  Rechtsgebiet (nach Register-`rechtsgebiet`, §8-ehrlich, da kantonal meist
  Default). **International:** Relevanz · Systematisch (`InternationalRubriken`) ·
  Rechtsgebiet = **SR-0.*-Sachklassen** (amtliche Völkerrechts-Achse 0.1–0.9,
  EU-Recht als eigene Gruppe). **Persistenz:** `src/lib/normtext/gliederung.ts`,
  EINE Wahl für alle Säulen, Rangfolge URL `?gliederung=` → localStorage
  (`lm.gesetze.gliederung`) → Default `systematisch` (hält Prerender/Golden/e2e
  byte-gleich); Pre-Paint-Muster (synchrone Store-Lesung, kein Inline-Script).
- **URL-Kompatibilität (alle bestehenden Deep-Links erreichbar):** `?ebene=`,
  `?kt=`, `#sys-`, `?ansicht=rechtsgebiet` (G6-Tür bleibt unverändert, nur neu
  ALS Modus zusätzlich erreichbar), Default = Systematisch → `?ebene=kanton&kt=ZH`
  zeigt weiter «Nicht systematisiert», `?ebene=bund` weiter «Alle aufklappen»
  (e2e-belegt).
- **Gegenprüfung (KC2 — `src/lib/normtext/` ist Risiko-Pfad):** die SR-0.*-Klassen-
  Labels wurden per **unabhängiger Gegenprüfung** (Opus, frischer Kontext, gegen
  die amtliche Fedlex-SR-Systematik via SPARQL `legal-taxonomy id-systematique`,
  2026-07-05) geprüft. **Die Erstfassung wurde WIDERLEGT:** `0.5` war fälschlich
  «Landesverteidigung» (das ist die nationalrechtliche SR-Hauptklasse 5) →
  **gefixt auf «Krieg und Neutralität»** (belegt über 0.51/0.52); zusätzlich `0.2`
  «Zwangsvollstreckung»→«Vollstreckung» und `0.1`→«im Allgemeinen». Nachverifikation
  bestanden → `check:gegenpruefung` quittiert (Diff-Hash-gebunden). Sortier-/
  Persistenz-Logik selbst = reine Darstellung (§3), kein Rechtswert.
- **Tore:** voller `npm run gate` **GRÜN (25/25)**, `golden:vergleich` **IDENTISCH**,
  neue Unit `src/tests/relevanz.test.ts` (7) + neuer e2e `gesetze-uebersicht-u`
  (10, inkl. **A9 CPU-Throttle 6×**: Umschalten flüssig, keine Fehler), volle
  e2e-Suite **173/173** (Regressionen `gesetze`/`gesetze-kanton-g5`/
  `gesetze-rechtsgebiet-g6` grün, Kontrakte gewahrt). Visual-Review Desktop 1440 +
  Mobil 390 (Bund/International + Kantone ZH/AI/BS, 0 Overflow, Titel-Umbruch
  belegt). `playwright.config.ts` additiv env-`E2E_PORT` (Default 4317
  unverändert) für kollisionsfreie Parallel-Worktrees (§12).
- **Bewusst NICHT (U-UEBERSICHT-Scope):** keine Reader-Berührung (U-KOPF/U-LINIEN/
  U-POSITION getrennt) · keine neue Kuration im G6-Grundgerüst (K8-Zeitsperre
  unberührt) · `?ansicht=rechtsgebiet`-Tür bleibt bestehen (nicht entfernt, nur
  zusätzlich als Modus).

**Ausführungsvermerk U-SUCHE (A5 + A6) — AUSGEFÜHRT 5.7.2026.**

**Status: gebaut, Tore grün, PR mit armiertem Auto-Merge.** Worktree `lm-u-suche`
(`feat/u-suche-a5-a6`), Trailer `Roadmap: W2·5d`. `Gegenpruefung: n/a — reine
UI/Suche` (kein Risiko-Pfad berührt; `normQuery.ts` unverändert, kein Parser-
Eingriff nötig — die bestehende Auflösung deckt P3 vollständig).

**A5 — Norm-Sprung in der normalen Suchleiste (Integrations-Design):**
- Der Parser `src/lib/suche/normQuery.ts` bleibt UNVERÄNDERT. Er wird jetzt aus
  dem geteilten Hook `useUniversalSuche` gefahren: der Index (`baueNormIndex`)
  wird **einmal pro geladenem Gesetzes-Manifest** über die **schon geladenen**
  `gesetze` gebaut (K10 — **kein Zweit-Index**; keine zusätzliche Fetch-Quelle),
  `parseNormQuery(q, index)` läuft pro Query.
- Der Treffer wird als **erste Gruppe `sprung`** (`sprungGruppe()` in
  `src/lib/universalSuche.ts`) VOR die statischen Gruppen gehängt — dadurch ist er
  automatisch der oberste Eintrag der flachen Tastatur-Liste, **Enter springt**
  (ohne Sonderpfad; er ist `flach[0]`). Marke «Sprung» (`lc-badge-ok`) + amtlicher
  Titel als Untertitel + ↵-Affordanz (`SuchResultate`, `id==='sprung'`).
- **Palette entfernt:** `src/components/suche/BefehlsPalette.tsx` gelöscht; Shell
  ohne Palette-Zustand/Lazy-Mount; Topbar-Palette-Knopf entfernt. **⌘K/Ctrl-K UND
  «/» fokussieren die HeaderSuche** (Handler in `HeaderSuche.tsx` mit Feld-Ref,
  liest den Feldwert direkt vom DOM → kein stale-closure). Der /gesetze-Landeplatz-
  CTA fokussiert das Feld über `lm:suche-fokus` (vormals `lm:befehlspalette`).
  Mobil (kein ⌘K): das Feld reicht; das Dropdown ist auf < sm viewport-verankert
  (`fixed inset-x-2`) → lesbare Breite ohne Overflow (Verbesserung ggü. dem
  feldschmalen Header-Dropdown).

**A6 — Gruppierung nach Typ + Relevanz-Rangfolge (dokumentierte Regeln):**
- Reihenfolge in `sucheAlles` neu (fachliche Änderung, `universalSuche.test.ts`
  nachgezogen): **Norm-Sprung → Gesetze → Gesetzestext/Artikel → Rechtsprechung →
  Materialien → Rechner & Vorlagen → Fristen-Vorlagen** (Rechtsinhalte vor
  Werkzeugen; Online-Edge-Gruppe bleibt CLS-sicher zuunterst).
- **Innerhalb** jeder Gruppe unverändert die bestehende, je eigene Relevanz-
  Sortierung der Filter-Funktionen (K10 — keine neue Ranking-Logik): Gesetze/Artikel
  Titel- vor Volltext-Match, Rechtsprechung neueste zuerst, Materialien
  `vergleicheGlobal`. Je Gruppe Overline + Zähler (ausser Sprung), «alle n ansehen»
  via `mehrHref` (bestand). Tastatur-Navigation über alle Gruppen (flache Liste,
  `aria-activedescendant`); Enter = Primäraktion (Navigieren/Springen). **Keine
  Sekundär-Buttons (⧉/Kopieren) je Zeile** — sie wären nested-interactive in
  `role=option` (axe serious); bewusst weggelassen (David «ggf.»), a11y-sauber.

**P3-Beweis** (`e2e/norm-sprung.e2e.ts`, umgebaut aus `befehlspalette.e2e.ts` —
Kontrakt = Sprung-Funktion, nicht Palette-UI): «OR 257d» ⇒ Sprung ist oberster
Treffer, Enter → `/gesetze/bund/OR#art-257_d` (Anker im DOM); Kanton «ABRG 3» →
`/gesetze/kanton/AR-621.12#art-3`; Freitext «Kündigung» → kein Sprung, gruppierte
Suche. **A9** (`setCPUThrottlingRate 6`): Tippen/Navigieren flüssig (gebundene
web-first-Auflösung ohne Test-Timeout-Nähe), **CLS < 0.05**. **«/»-Koexistenz**
(`tastatur.e2e.ts`): ⌘K und «/» fokussieren dieselbe HeaderSuche, kein Overlay.
Voller `npm run gate` grün (golden byte-gleich, `check:*` inkl. `gegenpruefung`);
`test:e2e` gegen dist (1 Worker) grün.

- **U-LINIEN (A8) — GEBAUT (5.7.2026), PR `feat/u-linien-a8`.** Der Linien-Default
  ist von der grundart-Schublade (G3a/K11 «nur KODIFIKATION») auf ein AUFBAU-
  basiertes Regelwerk umgestellt: SSoT `src/pages/gesetz-leser/linienAufbau.ts`
  (`linienProfil`) leitet aus dem Struktur-Sidecar (Gliederungstiefe + Artikel-
  Dichte je Ebene) ab, ob und wo der EINE Guide erscheint. Regeln + empirische
  Schwellen (`TIEF_AB=3`, `DICHTE_MIN=2`; Korpus-Verteilung 1135 Sidecars via
  `scripts/linien-korpus-verteilung.mjs`) im **DESIGN-REGLEMENT-NORMTEXT
  §4b-A**. Reader: `renderSektion` nutzt `linien.guideEbene`, `.lc-leser` trägt
  `data-guide-auto`, `index.css` blendet den Guide bei tiefen Kodifikationen aus
  (Einzug bleibt, Rangfolge §4b). Tor `check:linien-kanon` zum Nachfolger von
  R1/R4 umgebaut (vite-node, importiert `linienProfil` → kein Drift; korpusweite
  Invarianten + Referenz-Verdikte positiv+negativ + Reader/CSS-Verdrahtung). e2e
  `leser-linien-kanon`/`gesetze-ux-g3a`/`leser-optionen` nachgezogen (ZGB ruhig,
  ArG sichtbar). **Davids A8-Befund geheilt:** ZGB (Tiefe 5) bleibt ruhig, ArG
  (Tiefe 2) bekommt seine Ebene sichtbar — P6-Referenzfälle Vorher/Nachher
  Desktop 1440 + Mobil 390 visuell + per computed-style verifiziert. Wortlaut +
  Engine-Golden byte-gleich (nur Klassen/Attribute). `data-grundart` bleibt als
  semantischer Marker. K11-Nutzer-Override (global an/aus) unberührt.

- **U-KOPF (A1 + A3 + A4) — GEBAUT (5.7.2026, Opus), PR `feat/u-kopf-a1-a3-a4`,
  Trailer `Roadmap: W2·5d`.** Worktree `lm-u-kopf`, kollisionsarm nach der
  Reader-Kette (U-LINIEN gemergt, QS-PERF-Fläche `ArtikelBody.tsx` nicht berührt).
  `Gegenpruefung: n/a — reine Darstellung` (keine `public/normtext`-Änderung; nur
  Komponenten + CSS). Commits A1 → A3 → A4 → Reglement → Doku.
  - **A1 — Fussnoten bei AUS VERSCHWINDEN (überstimmt R9/K5, David-Entscheid).**
    `index.css`: `data-fussnoten="aus"` schaltet Marker-Buttons
    (`button[aria-label^="Fussnote"]`), Marker-Cluster (`[data-fn-marker]`, neu an
    den drei Cluster-Wrappern in `parts.tsx` inkl. Komma-Trenner) und Apparat
    (`[data-fn-apparat]`) auf `display:none` statt `opacity/color`. Der
    Fussnotentext bleibt im DOM (`#fn-…`); Normtext nie betroffen (stets
    durchsuchbar); «AN» stellt alles wieder her. **Print folgt dem Toggle**;
    **CLS 0** (nutzer-initiierter Reflow, input-exkludiert — e2e-belegt via
    PerformanceObserver). Default AN = kein Regel-Match = byte-gleich (R6).
    R9-Tor = e2e `leser-optionen` (Assertions scharf: AUS ⇒ nicht sichtbar +
    display:none + Text bleibt im DOM, AN ⇒ wieder sichtbar).
    DESIGN-REGLEMENT §4c-Regel 4 + U-KOPF-Nachtrag nachgezogen.
  - **A3 — Positions-Leiste = echte Breadcrumbs.** `SektionKontextKopf` nimmt jetzt
    `glieder:{id,label}[]` + `onSpringe` statt `pfad:string[]`: `nav[aria-label]` >
    `ol`/`li`, jedes Glied ein Button → `springeZuSektion` (Klick-Ziel = Anfang der
    Gliederungsebene, konsistent mit dem TOC-Klick), letztes Glied
    `aria-current="location"`, tastaturbedienbar. Datenquelle bleibt die vorhandene
    Scroll-Spy-State (kein neuer Observer, §15). Mobil-/Overflow-Kürzung rein per
    CSS (`truncate` + `overflow-hidden` + mittlere Glieder `hidden sm:inline-flex`
    + «…»). Der Sticky-Positions-Kopf bleibt ein ≥ 1024px-2-Spalten-Feature.
  - **A4 — «Ansicht»-Dropdown im Kopf (Chip-Leiste entfällt).** Neue
    `LeserAnsichtMenu.tsx` (ersetzt `LeserOptionenLeiste.tsx`): ehrliche Disclosure
    (KEIN `role=menu` — Switches sind Formular-Steuerelemente), Trigger «Ansicht»
    mit `aria-expanded` + `aria-controls`, Panel = `role="group"
    aria-label="Darstellungsoptionen"` mit den drei `role="switch"`-Reihen.
    Fokus-Falle + Escape + Fokus-Rückgabe via `useDialogFokus`;
    pointerdown-ausserhalb schliesst; Panel absolut positioniert ⇒ kein
    Layout-Shift. Persistenz-/Pre-Paint-Mechanik (`leserOptionen.ts`, data-* am
    `<html>`) unverändert darunter. **pdf-embed** bleibt bewusst ohne
    Ansicht-Controls (keine toten Steuerelemente, G2b). Beide Reader-Instanzen
    (Einzel + Pane) teilen die Komponente.
  - **P1-Ergebnis (Golden-Klasse):** golden-**ändernd** wie vorhergesagt — das
    Kopf-Markup ändert sich (Dropdown-Umbau + Breadcrumb-`ol`/`li`), aber die
    Artikel-PROSA ist byte-gleich (kein `public/normtext`-Eingriff;
    `golden:vergleich` GRÜN = Engine/Vorlagen-Golden unberührt; alle
    `normtext`-Struktur-/Vollständigkeits-Tore grün). Die reinen CSS-Toggle-Pfade
    (A1-Verschwinden) sind rein visuell.
  - **Tore:** voller `npm run gate` GRÜN (tsc · vitest · golden · lint · check).
    `test:e2e` gegen dist (1 Worker, eigener Port): `leser-optionen`,
    `leser-kopf-g2b` (inkl. A4-a11y-Probe + A3-Breadcrumbs), neuer
    `leser-kopf-a9` (A9-Throttle CI?4:6, CLS 0, 0 Konsolenfehler), `a11y` (axe),
    `gesetze-ux-g3a/g3b`, `verzahnung` (Split-View) grün.

**Ausführungsvermerk U-VERWEIS (A7 + A10 + A11 + A13) — AUSGEFÜHRT 10.7.2026.**

**Status: gebaut, voller Gate GRÜN, Gegenprüfung in Runde 1 WIDERLEGT →
B1-Fix → Runde 2 BESTANDEN, PR mit armiertem Auto-Merge.** Worktree
`lm-u-verweis` (`feat/u-verweis-a7-a10-a11-a13`), Trailer `Roadmap: W2·5d`.
Risiko-Pfad Linker (Extraktions-Klasse) ⇒ unabhängige Gegenprüfung (Opus,
frischer Kontext, gegen amtliche Fedlex-Filestore-HTMLs + SPARQL).

- **Gegenprüfung (2 Runden).** Runde 1 (Opus, unabhängige Lesarten VOR dem
  Vergleich notiert; MWSTG 20250331 / BETMG 20230901 / ArG 20230901 amtlich
  geöffnet; SPARQL-titleShort-Belege inkl. Ambiguitätssuche Schengen-DSG):
  **WIDERLEGT** — Befund **B1**: eine durch «Buchstabe» unterbrochene
  Plural-«Absätze»-Wertliste liess «und N» als Artikel-Glied lecken
  (BETMG 8a ⇒ Falsch-Link «5»→Art. 5; FAV 44a; FinfraV 129 ×2 — 4 amtlich
  belegte Instanzen). **Fix:** Plural-Kontext der Passus-Kette wird über die
  Buchstabe-Gruppe hinweg gehalten; «und|oder N» ohne Passus-Wort ⇒ Wertliste
  (Komma/sowie bleiben Glied-Konnektoren); Verbatim-Regressionstests. Notizen
  ohne Widerlegungs-Rang: B2 Anaphern-Self («der Artikel 32 und 33» meint
  ATSG — bewusst akzeptierte Self-Grenze, dokumentiert), B3 Under-Link FUSG
  (erlassdatum im Sidecar fehlt ⇒ Ingress unverlinkt, §1-konservativ), B4
  theoretischer Klein-Adjektiv-Bypass (0 Live-Stellen), B5 Sidecar verliert
  bis/ter im ArG-Ingress-Kopf (Extraktor-Backlog, ausserhalb Diff). Runde 2
  über den korrigierten Diff: **BESTANDEN** (voller Re-Lauf:
  B1-Ziele amtlich verifiziert — BETMG 8a ⇒ [8, 11, 13, 19, 20], FAV 44a ⇒
  [7, 19, 24a], FinfraV 129 ⇒ [36, 37]; alle Runde-1-Vorbefunde unverändert;
  8 adversariale Angriffe gegen den Fix gescheitert; unabhängiger
  Voll-Korpus-Diff: −4 Glieder = exakt die Leaks, keine neuen/verschluckten).

- **A10 — Plural-Linker.** Neuer reiner Resolver `artikelnPluralVerweise`
  (fedlex.ts): Öffner «Artikeln N» / «die|der Artikel N, M …» (Letzteres nur bei
  ≥ 2 Gliedern oder Gesetz-Signal), Glieder einzeln verlinkt, Anzeige =
  Quelltext (§1). Bounded: Passus-Kette typ-treu (Singular-Keyword = genau EIN
  Wert — «Absatz 2, 34 und 114» lässt 34/114 Glieder sein; Plural/Abkürzung =
  Wertliste mit Glied-Kopf-Guard), Wort-Ende-Anker gegen Backtracking
  («38»→«3», «42octies»→«42o» gebannt). Auflösung: Gesetz-Signal am Ende
  (Klammer-Kürzel > Genitiv-Map > bare Kürzel) ⇒ fremd; §1-Unterdrückung bei
  unbekanntem Klammer-Kürzel/Fremdnamen/bare-Kürzel (BGSA-Korpus-Fund) /
  unparsebarem Glied; sonst Self via tokenMap (nur existierende Token).
  **P2-Beweis: MWSTG Art. 5 verbatim = GENAU 5 Links art_31/35/37/38/45**
  (Unit + SSR + e2e-DOM + Screenshot). Korpus: 2091 Regionen / 5183 Glieder
  (self 1304 · fremd 443 · unterdrückt 344).
- **A11 — Präambel/Ingress-Verweise.** Kuratierte, belegte `GENITIV_GESETZ`-Map
  (26 Einträge, «der Bundesverfassung»→BV …; generische Wendungen bewusst ohne
  Eintrag); `fremdRoutingFormB` akzeptiert die Genitiv-Form zusätzlich zur
  N2b-Klammer (Klammer autoritativ, hat Vorrang); Soft-Hyphen-Toleranz (U+00AD).
  `ErlassKopfBlock` rendert Präambel-Zeilen durch NormText (beide
  Reader-Instanzen; pdf-embed-Fallback linkt nur Fremdziele). **aBV-Schutz
  (Gegenprüfungs-Vorbereitung, §1):** Ingress-Verlinkung NUR bei Erlassdatum ≥
  2000 — Ingresse sind historisch, Erlasse vor 2000 zitieren die BV von 1874
  (ArG-Beleg; Fliesstext ungegated, dort amtlich nachgeführt: ASYLG 121a,
  RVOG 184).
- **A7 — Verweis-Popover strukturiert.** `VerweisKontext.tsx` im NormPopover:
  Wortlaut → Provenienz-Fuss → «Wird zitiert von · Massgebliche Entscheide» →
  abgetrennt «Legt aus · Amtliche Materialien» (Behörde · Doktyp — Titel ·
  Ziff. · Stand). Wiederverwendete Verzahnungs-Grammatik (KontextGruppe,
  StatusBadge, Richtungs-Label als Text); Daten = DIESELBEN erlass-lokalen
  Shards wie Artikel-Fuss/Kontext-Panel via neues `kontextFuerArtikel`/
  `materialienFuerArtikel` (kontext.ts, geteilte Promise-Caches §15.3). Kompakt
  Top-3 + Zähler + «Alle n»; ans ENDE des Popovers gehängt ⇒ CLS 0 by
  construction.
- **A13 — Materialien-Kanten klarer.** Kontext-Panel: artikelscharfe Kanten
  prominent zuerst (Sublabel/Behörde/Stand — bestand), reine Erlass-Ebene
  dezenter HINTER dem Zähler (`<details>` «n Dokumente auf Erlass-Ebene»);
  e2e materialien-m5 auf den neuen Kontrakt nachgezogen (deklarierte fachliche
  Änderung, Davids A13-Wortlaut). Visual-Review-Beweis DBG (KS 6a via Art. 65
  prominent, 76 Erlass-Ebene-Dokumente eingeklappt).
- **P2-Beweise einzeln:** MWSTG Art. 5 = 5 Links ✓ (e2e: GENAU 5, toHaveCount) ·
  bounded ✓ (Negativtests + «genannten Frankenbeträge» ausserhalb der Region) ·
  Fremdgesetz-Signal «…Artikeln 4 und 5 des StGB» ✓ (Unit + SSR) ·
  Präambel-Test ✓ (MWSTG Art. 130 BV Singular + DSG 95/97/122/173 Plural;
  aBV-Negativfall ArG) · Korpus-grep-Statistik ✓ (oben; in der Gegenprüfung
  nachvollzogen).
- **A9-DoD:** e2e `verweis-u` mit `setCPUThrottlingRate` (CI 4 / lokal 6) +
  `test.slow()`: Popover-Öffnen + Plural-Glied-Sprung ohne Lag (< 8 s Budget
  gedrosselt), CLS < 0.05 je Seite (input-frei, Interaktion gemessen); Esc
  schliesst; Tap-Ziele = normale Links/Buttons; `check:perf-budget` grün (im
  vollen `check`).
- **Tore:** voller `npm run gate` GRÜN (tsc · vitest 3617 · golden:vergleich
  IDENTISCH · lint · check 25er-Kette). **Golden-Klasse: Engine-Golden
  byte-gleich; Reader-Markup deklariert-ändernd** (neue <a>-Hüllen im
  prerenderten Artikel-/Ingress-Text — reine Anker-Hüllen, Wortlaut
  zeichenidentisch; kein `public/normtext`-Eingriff, kein daten-manifest).
  e2e-Vollsuite 188/188 (leser-kopf-a9-Flake einmal unter Parallel-Last,
  standalone + Wiederholung grün — bekannte Throttle-Flake-Klasse).
  Visual-Review Desktop 1440 + Mobil 390: MWSTG 5, MWSTG/DSG-Ingress, DBG-65-
  Kontext, Popover MWSTG-18 (Materialien) + OR-20 (Entscheide), 0 Overflow.
- **Bewusst NICHT (U-VERWEIS-Scope):** keine Scroll-/Anker-Mechanik (A16 =
  U-POSITION) · kein Fuzzy-Matching ausgeschriebener Namen ohne kuratierten
  Eintrag · keine aBV-Konkordanz-Map (Under-Link statt Rate-Link) · lat.
  Suffixe > sexies (septies/octies …) bleiben unverlinkt-unterdrückt
  (konsistent mit artikelToken; Extraktor-Backlog).

**Ausführungsvermerk U-POSITION (A2 + A16 + A17) — AUSGEFÜHRT 11.7.2026 (Opus).**

**Status: gebaut, voller Gate grün (nur der VORBESTEHENDE `check:plan`-Orphan
W3·14-Responsive-Defekte war rot — mit-reconciliert), e2e grün, PR mit armiertem
Auto-Merge.** Worktree `lm-u-position` (`feat/u-position-a2-a16-a17`), Trailer
`Roadmap: W2·5d`. Baut auf dem gemergten QS-PERF/#181/#183-Stand auf (parts.tsx-
Barrel, berechnungen.ts, CLS-Härtung), nicht dagegen. Reine Darstellung/Interaktion
⇒ `Gegenpruefung: n/a` (kein Linker/Extraktion/Rechnen, kein `public/normtext`).

- **A2 — Scrollbalken-Proportionalität.** Wurzel EMPIRISCH bestätigt: die
  `.nt-art-cv`-Klasse gab JEDEM Artikel denselben `contain-intrinsic-size: auto
  320px` (index.css) — ein 40-Absatz-Artikel und ein Einzeiler reservierten
  dieselbe Platzhalterhöhe, die Summe (Dokumenthöhe vor dem Rendern) wich stark
  von der Realität ab ⇒ Daumen-ans-Ende landete in der Gesetzes-Mitte, Höhe „lief
  weg". **Fix-Kandidat gewählt: per-Artikel-Höhenschätzung aus dem Snapshot**
  (`schaetzeArtikelHoehe`, berechnungen.ts: Absätze × Zeilenmass + Items +
  Tabellen; deterministisch, unit-getestet), inline als `contain-intrinsic-size`
  je `<article>` gesetzt (überschreibt den Flachwert). **Logikverlust-Bewertung:
  KEINER** — `content-visibility:auto` BLEIBT (Off-Screen spart Layout/Paint),
  jeder Knoten bleibt im DOM (Ctrl+F/Anker/Screenreader/Druck/SEO unberührt); nur
  der PLATZHALTER-Schätzwert wird inhalts-proportional statt konstant. Golden/
  Prerender unberührt (der String-Builder `erlassVolltextHtml` emittiert kein
  `nt-art-cv`; die Optimierung existiert nur im Client-Reader). `check:perf-budget`
  bleibt grün (content-visibility unverändert; genauere Schätzungen mindern eher
  Scroll-Anchoring-Sprünge). Deaktivierung auf langen Erlassen (Kandidat 3)
  VERWORFEN — hätte Tempo geopfert ohne Not; Höhen-Cache (Kandidat 2) überflüssig,
  da `auto` die echte Höhe nach erstem Render ohnehin merkt.
- **A16 — Zurück landet exakt am Ausgangsort (anker-basiert).** `scrollAnker.ts`
  (neu): Registry {Artikel-Token, Offset} je Reiter-Identität; ein passiver,
  rAF-entprellter Scroll-Listener im Reader hält den obersten sichtbaren Artikel +
  Offset fest (§15, kein setState). `App.tsx:ScrollWiederherstellung` nutzt für
  Leser-Reiter den Anker als Ziel — je Frame der bestehenden Konvergenz-Schleife
  gegen das AKTUELLE DOM aufgelöst (`aufloeseAnkerY`, `getElementById` → element-
  basiert, robust gegen die content-visibility-Höhenschätzung, Davids Hinweis);
  `scrollY` bleibt Fallback → jede Nicht-Leser-Route byte-gleich. Interne Verweise
  navigieren jetzt über den **Router** (echter History-Eintrag; der `letzteNavKey`-
  Effekt führt den Sprung aus) — ein MANUELLES `pushState` war der EMPIRISCH
  widerlegte Irrweg (desynchronisiert react-router ⇒ Zurück löste keinen Location-
  Wechsel/keinen Rück-Sprung aus, debug-belegt). NormPopover «Im Gesetz öffnen»
  wurde von Vollseiten-`<a>` auf SPA-`<Link>` umgestellt (deklarierte Änderung),
  damit der In-Memory-Anker das Verweis-Folgen überlebt ⇒ **Cross-Erlass
  AIG→StGB→zurück landet wieder an Art. 5**. Im PANE bleibt der direkte Sprung
  (eigene Pane-History unangetastet).
- **A17 — Split-View öffnet an der Fundstelle.** Der ⧉ legte den Pfad zwar MIT
  Fundstelle ab (readerLink `#art-token`, Leitfall/Kontext `?norm=`), aber die
  Reader lasen sie aus `window.location.hash` (= Haupt-URL, NICHT der Pane-Pfad)
  und brachen für Panes ab ⇒ Pane öffnete oben. Fix: Gesetz-Leser springt auch im
  sekundären Pane, Fundstelle aus der PANE-LOKALEN Location (`<Routes location>` →
  `useLocation`); EntscheidLeser liest den `?norm`-Guard + `#e`-Hash Pane-lokal
  (sonst brach ein Gesetz-Pane mit `#art-…` in der Haupt-URL den Erwägungs-Sprung
  fälschlich als „Hash gewinnt" ab). **Nie stumm falsch:** ohne auflösbare
  Fundstelle (`ersteFundstelle`→null) ehrlicher Dokumentanfang. Materialien haben
  keinen In-App-Volltext (nur-live-link, §8) ⇒ keine Ziffer-Fundstelle zum
  Anspringen, kein Falsch-Sprung möglich (n/a by Datenlage).
- **P4-Beweise einzeln (e2e `leser-position-u`, gegen dist):** A2 — OR: Scroll-
  Position bildet die Dokument-Position proportional ab (Top-Index bei 0.25/0.5/
  0.75 der Balkenhöhe monoton, Mitte≈Mitte; scrollHeight weit über dem 320px-Boden)
  ✓. A16 — Cross-Erlass AIG→StGB (Popover) → Zurück = Art. 5 im Viewport ✓; interner
  Verweis MWSTG Art. 5→31 → Zurück = Art. 5 im Viewport ✓. A17 — Norm-⧉ aus dem
  Entscheid öffnet das Pane an Art. 18 (nicht oben) ✓; Split-View-e2e (`verzahnung`,
  Pane-History) grün ✓. A9-DoD — Scroll unter CPU-Throttle (rate 4) flüssig, CLS 0
  (Tastatur-Scroll = echtes Input ⇒ content-visibility-Reflow input-exkludiert;
  der neue Anker-Listener erzeugt keinen unerwarteten Shift) ✓.
- **Golden-Klasse:** byte-gleich — alle Änderungen sind Client-Reader (inline
  `style`/Navigation/CSS-Kommentar); kein `public/normtext`, kein Daten-Manifest,
  kein `erlassVolltextHtml`-Eingriff. `golden:vergleich` IDENTISCH; `check:normtext`/
  `check:struktur-konsistenz` grün.
- **Tore:** voller `npm run gate` grün bis auf den VORBESTEHENDEN `check:plan`-
  Orphan `W3·14-Responsive-Defekte` (10.7.-Session hatte das @meta in der ROADMAP,
  aber nicht in `scripts/plan/inventar.ts` registriert) — im Doku-Commit mit-
  reconciliert (Inventar-Zeile ergänzt, §12-„fehlende Karte nachtragen"). Voll-e2e-
  Sweep 192/192 (die einmalige `norm-sprung`-A9-Flake unter Parallel-Last löst
  standalone grün — bekannte Throttle-Flake-Klasse, nicht auf U-POSITION-Fläche).
- **Bewusst NICHT (U-POSITION-Scope):** keine Pane-interne Per-History-Eintrag-
  Scroll-Restoration (Pane-`go`/`push`; Pane-eigene History unangetastet, Shell-
  scrollMerk deckt den Pane-Modus-Wechsel/-Schliessen wie bisher) · kein
  Sub-Artikel-Passus-Highlight über den bestehenden Artikel-Blink hinaus · keine
  Änderung an `window.scrollY`-Restoration für Nicht-Leser-Routen.
**Ausführungsvermerk U-PDF (A12) — AUSGEFÜHRT 11.7.2026 (Opus, Worktree
`feat/u-pdf-a12`, kollisionsarm — Kopf-Aktions-Slot + Generator/Registerfeld, KEIN
`inhalt.tsx`-Scroll-/Anker-Eingriff, `register.ts` unangetastet).**

- **Ist-Befund des alten Knopfs (Spec-Auflage «zuerst erheben»):** zwei Pfade. (1)
  `status:'pdf-embed'` (EMRK/NYÜ + kant. PDF) lieferte bereits das **amtliche**
  self-hosted PDF («⬇ PDF herunterladen» → `/normtext/pdf/*.pdf`) — korrekt, nur
  relabelt. (2) `status:'snapshot'` (Bund + Kanton Volltext) bot ein **render-
  eigenes `.txt`** (`baueErlassText`, client-Blob) — genau der von §10.5 verbotene
  «Schein-Download». **Behoben:** der Snapshot-Download lädt jetzt das amtliche PDF
  der gepinnten Fassung; wo keins existiert, entfällt die Aktion (§8, nie render-
  eigenes PDF). `baueErlassText`/`herunterladen()` ersatzlos entfernt (§5-Aufräumen).
- **Ermittlung (build-time, KEINE Client-SPARQL):** neuer Netz-Generator
  `scripts/normtext/pdf-quellen-generieren.ts` (`gen:pdf-quellen`) → Sidecar
  `public/normtext/pdf-quellen.json` ({key:{url,stand,quelle}}); `browse-manifest.ts`
  projiziert offline in `register.json` → **`BrowseErlass.pdfUrl/pdfStand`** (synchron
  am Erlass ⇒ **CLS 0**, §15/2, kein zweiter Async-Fetch).
  - **Bund:** Fedlex-`jolux:isExemplifiedBy` der pdf-a-Manifestation der Konsolidierung
    mit `dateApplicability` == gepinnte Fassung. Die **EXAKTE** Filestore-URL wird
    gelesen, nicht konstruiert — der Revisions-Suffix variiert real: (none)·-1·-2·-3·
    -4·-5·-12 (Verteilung 109/69/24/9/11/4/1 über 227 Erlasse). **Suffix-Falle `-2`
    (P1-a/b) damit gegenstandslos**: eine suffixlose Konstruktion hätte für 118/227
    die ÄLTERE Datei geladen (HTTP 200, kein 404). **227/227 Bund** aufgelöst (inkl. 9 P4-Staatsverträge nach additivem Rebase).
  - **Kanton:** LexWork `selected_version.pdf_link_tol`, nur bei Versions-Gleichstand
    (In-Kraft-Datum == snapshot.stand, sonst Drift ⇒ weglassen, §8). **1184/1231**
    (47 ehrlich ohne Aktion; 0 Netz-Fehler).
  - **Staatsvertrag/pdf-embed:** bestehendes self-hosted PDF (EMRK `-2` kanonisch,
    NYÜ suffixlos), nur ehrlich beschriftet.
- **Abdeckung:** **1411 Erlasse** mit amtlichem PDF (227 Bund + 1184 Kanton) +
  2 Staatsverträge; ehrlich ohne Aktion: 47 Kanton (Drift/kein PDF).
- **Beschriftung (§8):** eine Komponente `parts/AmtlichesPdf.tsx` — «⬇ Amtliches PDF
  (Fassung vom TT.MM.JJJJ)», `<a>` (Bund/Kanton neuer Tab; pdf-embed same-origin
  `download`), `aria-label` vollständig, `lc-chip`-24px-Tap-Ziel (WCAG 2.2 §2.5.8).
- **Drift/Pin-Überwachung (A12-Auflage):** neues Tor **`check:pdf-quellen`** (offline,
  in `check`/`gate`) bindet jede Bund-PDF-URL an den `fedlex-cache.sh`-Pin (URL-
  Konsolidierung == Pin-Konsolidierung == stand) + Projektions-Integrität register↔
  Sidecar + Coverage-Floor; **`check:pdf-quellen-netz`** (in `check:netz`) HEAD-prüft
  alle Bund-URLs + Kanton-Stichprobe auf `application/pdf`. `check:fedlex-versionen`
  bleibt Currency-Arbiter der Pins (grün: alle geltend, inkl. pdf-embed).
- **P5-Gegenprüfung (Risiko-Pfad, unabhängiger Opus-Pass, frischer Kontext, gegen
  Fedlex-SPARQL + Filestore-PDF + LexWork):** Stichprobe 12 (AIG·BBG = Suffix-`-2`;
  ZGB `-1`, OR `-4`, DSG none, BV `-3`; 3× Kanton AG; EMRK/NYÜ) — je unabhängig
  re-derivierte URL == gespeichert UND **Fassungsdatum im PDF gegen `stand`** geprüft;
  der `-2`-Fall gegen die suffixlose (ältere) Datei kontrastiert. **Verdikt:
  `bestanden`** (`gegenpruefung:ok` quittiert, Diff-gebunden).
- **A9-DoD:** e2e `gesetze-pdf-download` (Bund Fedlex-Filestore-Ziel + ehrliche
  «Fassung vom …» + `target=_blank` + aria + Tastaturfokus; Kanton LexWork-Ziel);
  `check:perf-budget` grün (CLS 0 — pdfUrl am Erlass, keine neue Async-Klasse).
- **Tore:** tsc · vitest (inkl. neuer `pdf-quellen.test.ts`) · golden:vergleich
  IDENTISCH · lint · build · e2e `gesetze-pdf-download` grün; `check:pdf-quellen`/
  `check:paritaet`/`check:gegenpruefung` grün. **Alle CI-gated Stufen grün** (CI-`ci.yml`
  fährt tsc/test/lint/build/golden/smoke/e2e/perf — NICHT die volle `check`-Kette).
  **EINZIGES lokales Rot: der VORBESTEHENDE `check:revisionen`** — der P4-Merge (#186,
  9 Staatsverträge) fügte 9 Bund-Snapshots OHNE Paket-5-Revisionen-Sidecar hinzu ⇒
  auf `origin/main` bereits rot (227 Bund vs. 218 Sidecars), **nicht dieser Diff, nicht
  CI-gated**; heilbar nur durch eine eigene Paket-5-Reconciliation (`normtext:revisionen`,
  Risiko-Pfad — bewusst NICHT in U-PDF gebündelt, §14.2). **Golden-Klasse: Engine-Golden
  byte-gleich** (kein `src/lib/vorlagen|tarif`-Eingriff); **register.json + daten-manifest
  additiv-ändernd** (neues Feld `pdfUrl/pdfStand`, `datenhaltung:manifest` nachgezogen).
- **Bewusst NICHT (U-PDF-Scope):** kein render-eigenes PDF (§10.5) · keine Client-
  SPARQL · keine Kopf-Slot-Umlayoutierung (A22-K-1/K-2 «in Kraft seit» + Fussnoten-
  Chip bleiben dem koordinierten V2-Kopf-PR, §10.8 A22 — U-PDF liefert nur den
  Download-Slot) · kein Bund-Self-Hosting (direkter amtlicher Filestore-Link ist
  ehrlicher + driftfrei; pdf-embed bleibt self-hosted wegen `X-Frame-Options`).
