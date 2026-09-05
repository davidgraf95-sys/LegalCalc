# FAHRPLAN — Design-Konsistenz: gleiche Dinge gleich darstellen (Auftrag David 31.8.2026)
<!-- @lagebild name: Design-Konsistenz · zweck: Gleiche Inhalte sehen überall gleich aus — im Split-View wie auf jeder Seite. -->

> **ROADMAP-Schritt:** `W2·19-DESIGN-KONSISTENZ` (Querschnitt Darstellung, `feld: design`).
> **Auftrag David 31.8.2026 (wörtlich):** «designrecherche mit mehreren agenten machen wo du die
> webseite im design angleichst. also dass gleiche dinge gleich dargestellt werden. bspw. im
> split view oder auch sonst. befunde dann gleich umsetzen. run till dry.»

## §1 · Ziel und Grenzen (`W2·19-DESIGN-KONSISTENZ`)

**Ziel:** Dieselbe Inhaltsklasse (Erlass-Kopf, Treffer-Zeile, Chip/Badge, Meta-Zeile,
Leerzustand, Datum, Karten-Layout, …) wird site-weit mit demselben Muster dargestellt —
insbesondere Split-View vs. Vollansicht, Gesetz- vs. Entscheid-Leser, Übersichten vs. Panels.
Massstab ist das **bestehende Reglement** (`DESIGN-REGLEMENT.md` + Domänen-Reglemente +
`.claude/rules/design.md`), nicht neuer Geschmack: wo zwei Darstellungen divergieren, gewinnt
die reglementskonforme bzw. die im Reglement als kanonisch bezeichnete; schweigt das Reglement,
gewinnt die verbreitetere Form und das Reglement wird ergänzt (§5: eine Wahrheit).

**Grenzen (bindend):**
- §1/§3: reine Darstellungsschicht; keine Rechtslogik, keine Datenänderung.
- Normtext-Körper bleibt farbfrei; Golden byte-gleich, sonst deklarierter Schritt.
- §8: Status-/Ehrlichkeits-Texte werden vereinheitlicht, nie abgeschwächt.
- Vereinheitlichen heisst **Konsumenten auf den geteilten Baustein ziehen** (Token,
  gemeinsame Komponente), nicht Kopien angleichen (§5/§10).

## §2 · Methode (run till dry, Mandat David 31.8.2026)

Runden zu je: (1) **Finder-Welle** — mehrere parallele Recherche-Agenten mit disjunkten
Linsen (Split-View-Paritäten · Leser-Köpfe/Marken · Übersichten/Karten · Chips/Badges/
Leerzustände · Token-Treue/Hardcodes); Beweis je Befund: Screenshot/DOM (Playwright gegen
`vite preview`, Regeln `.claude/rules/webseiten-pruefung.md`) + Datei:Zeile + betroffene
Reglement-Stelle. (2) **Konsolidierung** durch den Orchestrator (Dubletten, Reglement-Abgleich,
Verwerfungen mit Grund hier protokolliert). (3) **Bau-Welle** — Umsetzung mit Vorher/Nachher-
Screenshot, Tests/Tore. (4) Nächste Finder-Welle sieht den neuen Stand. **Dry = zwei Runden
ohne neuen substanziellen Befund.** Befund-Protokoll: §3 dieser Datei (lebendig).

## §3 · Befund-Protokoll (lebendig, je Runde nachgeführt)

**Runde 1 (31.8.2026, 5 Finder-Agenten, 32 Befunde).** Vollberichte in den Session-Transkripten;
Screenshots im Session-Scratchpad `design-r1/`. Kurzregister (Umsetzungs-Zuordnung):

| Nr | Befund (Kurz) | Kanon-Quelle | Welle |
|---|---|---|---|
| B-1/B-2/B-6 | Amtliche-Fassung-Link 4 Formen · Banner bricht Ä110 · «Fassung» vs «Quelle» (Zählung 10:5 falsifiziert, Gegenprüfung N1 — Entscheid trägt über Präzision) | Glossar Ä110 / Zählung | **B1·BAU-1** |
| B-3 | Datum Mono vs Proportional; 5 byte-gleiche TT.MM.JJJJ-Formatierer | Grundlage «Mono nur SR/Az» | **B1·BAU-1** (+B2 EntscheidLeser) |
| A-3 | Material-Pane heisst «Material öffnen» | §8 | **B1·BAU-1** |
| E-1…E-4 | 9 Fokusringe an `--focus` vorbei · 2 Tabs-Kopien · theme-color-Drift ΔE 2.23 · Roh-Übergang | F3/F7/F8, D-1.7 | **B1·BAU-2** |
| D-1/D-2 | 3 Facetten-Chip-Optiken (Kanon `.lc-chip`, LM-040/F2/F4) | index.css:1284 | **B1·BAU-3** |
| D-4 | «Entwurf» slate statt `lc-badge-entwurf` (1 Stelle) | NORMTEXT:337 | **B1·BAU-3** |
| D-7 | Leerzustände 3 Formen; «?»-Satz; Sackgassen | REGL:122, IA-2 | **B1·BAU-3** |
| D-8 | Zähler als grüner Status-Badge | §G-i | **B1·BAU-3** |
| A-2/A-5/B-5 (+B-1/B-3-Konsum) | EntscheidLeser: einzige Nicht-pk-Fläche · Lesemodus-Bleed über beide Panes · Namens-Dopplung | usePaneKlasse 50:1, overlayWurzel | **B2·BAU-4** |
| D-6 | Fehlseiten 3 Bauformen, Entscheid-Sackgasse | REGL:122 | **B2·BAU-4** |
| C-1/C-2/C-6/C-7/C-3 | Karten-Raster viewport-gebunden · 4 Zähler-Schemata (Kanon nackte Zahl 12:6:4:2) · Gruppenkopf-Typo · Hover 3 Grammatiken (Kanon Farbstufe §G-j) | pk 48:1, Zählung | **B2·BAU-5** |
| A-1/A-4/A-6 | h1 Pane>Voll · 2 Ortsleisten · Route-Fade/Fallback/ErrorBoundary nur in App | kopfStufen-Wortlaut | **B2·BAU-6** |
| B-4/B-7 | Kopf-Gerüst 4 Bänder · Overline-Ordnung | Kap. 4e/Ä6 | Runde 2 (strukturell, nach BAU-1/4) |
| C-4/C-5/D-3 | TrefferZeile · RubrikKachel · SelectionGrid-Pillen | Zählung/SelectionGrid | Runde 2 |
| D-5 | «geplant»: 2 Töne, 3 Wortlaute — beide Töne vom Farb-Wörterbuch ausgeschlossen | NORMTEXT:337/339 | **wartet auf David** (V2·C-3: Ton-Entscheid) |

**Nachtrag aus der Gegenprüfung B1 (31.8.2026):** N2 — der Fassung/Quelle-Kanon deckt erst die
8 Wächter-Dateien; ~11 sichtbare «amtliche Quelle»-Stellen bleiben (EntscheidLeser ×2 → BAU-4,
seo-detail ×2, KontextPanel ×2, Gesetze ×2, Materialien, glossar, statusRezept, ArtikelHistorie)
→ Runde 2: nachziehen ODER Zwei-Begriffe-Regel festschreiben (Erlass-Kontext «Fassung»,
Dokument-Kontext «Quelle») — dann Wächter-Geltungsbereich entsprechend ausweiten.

**Runde-2-Liste (aus den Bau-Wellen, 31.8.2026):** Pane-Wrapper-Polsterung `px-5 sm:px-6`
viewport-gesteuert (Wurzel zweier deklarierter A-2-Ausnahmen) · LiveSuche-Datum in Mono
(B-3-Rest) · zwei «‹ Übersicht»-Rücksprünge in inhalt-ansichten (D-6-Rest) ·
`formatiereDatum`-Alias in rechtsprechung/format (verdeckte die sechste Kopie, §17-Rückbau) ·
LesemodusOverlay-Fokus-Falle von Hand statt `useDialogFokus` (§5) · Fassung/Quelle-Rest
(~9 Stellen, s. N2-Nachtrag) · dritte FacettenGruppe-Kopie in EntscheidFilter ·
`lc-notice`-Kanton-Leerzustand auf /gesetze als Leerzustand-Variante prüfen · B-4/B-7,
C-4/C-5, D-3 (geplant aus Runde 1) · SperrtageZaehler-Haarlinie ohne aria-hidden ·
zwei inhalt-ansichten-Quell-Link-Formen (an e2e gesetze-ux-g3a gekoppelt).

**Runde 2 — GEBAUT (31.8.2026, Pakete R2-A…F + 2 Einzel-Fixes + D-5):** die komplette
Runde-1-Restliste und die 16 Runde-2-Finder-Befunde (F1-1…10, F2-MOBIL-1…6) sind umgesetzt;
dazu Davids zwei Entscheide (LM-061-Affordanz im B8-Strang; «geplant»-Marke = neue
Farb-Wörterbuch-Zeile). Neue Bausteine: GruppenKopf · Leerzustand · FehlSeite · StandChip ·
TrefferZeile · RubrikKachel · FacettenGruppe · SelectionGrid-Pille · ListenEditor ·
SheetRahmen · AbrufFehler · SchwebeMeldung · SeitenTitel · OrtsAngabe · RouteHuelle ·
LeserKopfGeruest · KopierButton; Token: --scrim×3, --tap-ziel-komfort, lc-akzent-danger,
lc-badge-geplant. Reglement: R14 neu, R4 ergänzt, Wörterbuch-Zeile «geplant».
**Für Runde 3 (Finder-Welle 3, dry-Kriterium: 2 Runden ohne Neufund):** die
«geprüft und konsistent»-Listen beider R2-Finder gelten als abgedeckt; offen aus deren
Mitdenken: Shell-Schubladen-Kopf ohne lc-glass-Rolle · Startseiten-Dichte der fünf
h1-Zahlen (Squint) · SelectionGrid-Pillen ohne min-h-Token (B10-Liste) · sage→ok-Rolle
der zustimmen-Töne · Safe-Area als eigener Bauschritt (kein Konsistenz-Befund).

**Runde 3 — GEBAUT (31.8.2026, Pakete R3-α/β + 1 Restfix):** Dry-Test ergab 15 Befunde
(R3-A: 6, R3-B: 9) mit erkannter Wurzel «Wächter bewachen Listen, nicht die App» — behoben:
die fünf Konsistenz-Wächter fegen jetzt App-weit (appDateien.ts, Ausnahmen nur mit
Fundort-Begründung); der Sweep fand selbst vier weitere Kopien. Neue Bausteine SchliessKnopf
(8 ✕-Formen→1) und .lc-schwebeflaeche; GruppenKopf-Familie komplett (als/dicht/marke);
SelectionGrid/Leerzustand/QuellLink/SeitenTitel/Datum/KopierButton/geplant-Reste migriert;
sage→ok-Rolle (§G-i) mit Tor. Startlisten-Punkte Schublade+Startseiten-Dichte: KEIN Befund
(belegt). **R3-γ-Restliste (Runde 4 bzw. Folge-Batch):** PaneKopf-✕ (Klassen-String-Split;
latentes hover-Duell brass/danger dokumentiert) · span-Gruppenköpfe BezuegeZeile/
LeserPanelOeffner · 12 tote num-tabular-nums · 3 stateful Kopier-Mechaniken ·
RechnerTagerechner-Leerzustand-Doktrinfrage (filter-Weiterweg wäre sichtbar neu) ·
Panel-Reiter-Scroll-Entdeckbarkeit (R3-A-Nebenfund).

**Runde 4 — GEBAUT (5.9.2026, Pakete R4-A…E).** Arbeitsvorrat war die
R3-γ-Restliste; jeder Punkt wurde am Preview bzw. am Quelltext reproduziert,
bevor er angefasst wurde. Wiederkehrende Wurzel: **die Wächter der Runde 3
prüften Listen und Namen, nicht Sachen** — jeder der drei App-weiten Sweeps
dieser Runde fand mehr, als die Restliste nannte (+9 Fundstellen).

| Nr | Befund (Kurz) | Messung | Ergebnis |
|---|---|---|---|
| R4-A | Pane-✕ = achte ✕-Form; Klassen-String trug `hover:text-brass-700` UND `hover:text-danger-700` | Preview `/gesetze/bund/OR?p=/gesetze/bund/ZGB`: ruhend `rgb(111,107,97)`, hover `rgb(122,47,35)` = danger-700 — entschieden durch die Stylesheet-Sortierung, nicht durch eine Aussage | `GRIFF_BOX`/`GRIFF_FLAECHE` teilen den String; ✕ aus `ui/SchliessKnopf` mit `ton="destruktiv"` (gleiche Farbe, jetzt benannt), `komfort={false}` als dritte begründete Ausnahme (vom Wächter beim Bau rot gefunden). Neue App-weite Sonde «kein Knopf trägt zwei Hover-Töne» |
| R4-B | dichter Gruppenkopf: achte handgezeichnete Kopie in `BezuegeZeile` | Wächter zweifach zu eng — Regex verlangte `className="lc-overline"` ALLEIN, und er prüfte eine Vierer-Liste. ROT-BEWEIS mit wieder eingesetzter Vorher-Form: Sweep meldet `["pages/gesetz-leser/parts/BezuegeZeile.tsx"]`, Exit 1 | Sweep app-weit; `GruppenKopf` bekommt `als="span"` (Flex-Zelle) und einen String-`zahl` für den §8-Zähler «5 von 13 gekürzt» |
| R4-C | «12 tote `num tabular-nums`» — die Einordnung «tot» war FALSCH | Preview, `getComputedStyle`: `.num` → `lining-nums tabular-nums`; `.num tabular-nums` → `tabular-nums`. `.num` liegt in `@layer components`, die Utility in `@layer utilities`; die spätere Schicht ersetzt die ganze Deklaration und nimmt `lining-nums` weg | 16 Fundstellen in 11 Dateien bereinigt (Sweep fand 5 mehr als die Liste). App-weiter Wächter + Negativ-Kontrolle. NACHWEIS am Preview: über alle sechs Ansichten der Dry-Sonde ist `font-variant-numeric` der 8'254/8'339/91 `.num`-Elemente EIN Wert |
| R4-D | «3 stateful Kopier-Mechaniken» — es waren ACHT | Quelltext-Sweep über `clipboard.writeText`. `LinkTeilenButton` setzte die Quittung VOR dem Promise → «Link kopiert ✓» über unveränderter Zwischenablage (§8-Defekt). `ArtikelBody.zitier` trug mit 1'200 ms eine VIERTE Verweildauer, die der R3-α-Wächter nicht sah: er sucht `setKopiert(`, die Stelle heisst `setOk(` | Wurzel behoben — `useKopieren` nimmt den Text jetzt beim KLICK (sechs von acht Flächen kennen ihn erst dann) und trägt eine MARKE für Flächen mit zwei Kopier-Zielen. Sieben Flächen migriert; `EntscheidBody` ausgenommen, Begründung AM FUNDORT und vom Wächter wörtlich verlangt (aria-live-Ansage mit Wiederhol-Zähler ≠ ✓ mit Rückstell-Timer) |
| R4-E | Tagerechner-Leerzustand (in R3-γ als «Doktrinfrage» offen) | Preview: `/rechner/tagerechner` mit «zzzzz» → `data-leerzustand="bestand"`, KEIN Weiterweg; `/rechtsprechung?q=zzzzzz` → `"filter"` MIT Weiterweg. Derselbe Sachverhalt, zwei Darstellungen | Massgeblich ist die LAGE, nicht der Wortlaut (Doktrin der beiden `Gesetze.tsx`-Fundstellen): der Zweig läuft nur bei nicht-leerer Suche ⇒ `art="filter"` + Weiterweg «Suche leeren». Satz Zeichen für Zeichen unverändert (§8). Die übrigen acht `art="bestand"`-Stellen geprüft: alle korrekt |
| R3-γ-6 | Panel-Reiter-Scroll-Entdeckbarkeit | — | **überholt**: am selben Tag durch R3-B/Paket B8 gebaut; die Leiste trägt `lc-scrollrand-x lc-scrollrand-grund-raised` (`v3/LeserPanel.tsx:167`), Herleitung samt Messung 385/350 px im Dateikopf |

**Dry-Sonde Runde 4 (5.9.2026, frischer Browser-Kontext je Route, 1600×900).**
Drei Paare Split-View ↔ Einzelseite — Gesetz-Leser (`/gesetze/bund/OR`),
Entscheid-Leser (`/rechtsprechung/ag_gerichte_HOR_2024_19`), Rechner
(`/rechner/verjaehrung`) — verglichen über Klassenfamilien-Zählung,
H1-Anatomie und `font-variant-numeric`. **Kein Neufund:** genau ein `h1` je
Ansicht, gleiche Grösse (32 px), Umschaltung `sm:` ↔ `@xl/pane:` überall über
`usePaneKlasse`; Schriftstimme folgt der Inhaltsklasse (Zwei-Stimmen-Regel,
Runde 1 kein Befund); alle ✕ tragen den Baustein in EINER Glyphengrösse (16 px).

**DRY IST NICHT ERREICHT.** Dry heisst zwei Runden ohne neuen substanziellen
Befund; Runde 4 hat aus ihren eigenen Wurzel-Sweeps neun zusätzliche
Fundstellen erzeugt. Die enge Paar-Sonde oben ist EIN sauberer Zähler, nicht
zwei — Runde 5 braucht eine echte Finder-Welle.

**Runde-5-Liste (aus dem Bau der Runde 4, alle belegt):**
· `src/tests/design-r3b-chrome.test.ts` rollt eigenes `alleTsx`/`rel`/
`ohneKommentare` statt `tests/appDateien.ts` — die §5-Dublette genau des
Bausteins, den R3-α gegen Listen-Wächter gebaut hat.
· `components/ErgebnisAnzeige.tsx:121` setzt
`style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}` — die Deklaration
von `.num` roh dupliziert (§5/F9).
· `pages/gesetze-teile/AzRegister.tsx:223`: `Leerzustand` in einem mutmasslich
unerreichbaren Zweig (`gruppen.get(buchstabe)` ist nie leer) — §6.7-Verdacht,
prüfen und ggf. zurückbauen.
· Der ⧉-Griff «Layout-Link kopieren» (Pane-Titelleiste) gibt KEINE Rückmeldung,
`LinkTeilenButton` für dieselbe Handlung schon. Eine Quittung in der 28-px-Zeile
wäre sichtbar neu → **wartet auf einen Entscheid**, nicht auf einen Fix.
· Generalfrage aus R4-D: welche weiteren Wächter hängen an einem VARIABLENNAMEN
statt an der Sache? (`setKopiert(` liess `setOk(` mit 1'200 ms durch.)

**Verworfen/kein Befund:** Leerzustand-Wortlaut «gefunden» vs «erfasst» (bedeutungstragend) ·
H1-Schriftstimmen (Zwei-Stimmen-Regel) · `rounded`=`rounded-sm` (latent, via tailwind-Default
mitgefixt) · SachgebietKacheln lg: (ohne Sichtschaden, Runde 2 prüfen).
**Nebenfunde für andere Stränge (nach Landung PR #595 in den Plan buchen):** BMV
«Nachfolge-Erlass = gleiche SR» (§7-Datenfrage Korpus) · Zählparität 1'458/201+1'231/227
(§8, Cowork-32-Familie) · toter `uebersichtsZeile`-Code mit hartem «SR» (Rückbau) ·
~~`PaneKopf.stand` unerreichbar~~ — FALSIFIZIERT durch BAU-6 (31.8.): erreichbar auf 11 pdf-embed/nur-live-link-Erlassen (EMRK, DSGVO …), dort einzige Stand-Angabe des Panes; bleibt, neu bewacht (`ortsAngabe.test.tsx`).
