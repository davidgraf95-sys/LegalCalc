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

**Runde 5 — GEBAUT (5.9.2026, Pakete R5-A…E).** Arbeitsvorrat war die
Runde-5-Liste; jeder Punkt wurde am Preview bzw. am Quelltext reproduziert,
bevor er angefasst wurde. Die Wurzel der Runde 4 hat sich WIEDERHOLT: jeder
App-weite Ausdruck fand mehr, als die Liste nannte (**+9 Fundstellen**).

| Nr | Befund (Kurz) | Messung | Ergebnis |
|---|---|---|---|
| R5-A | §5-Dublette der Sweep-Bausteine; die Liste nannte `design-r3b-chrome.test.ts` | Sweep über `src/tests/` nach der SACHE («wandert selbst durch src und überspringt dabei `tests`»), nicht nach dem Namen: **fünf** Sonden bauen `appDateien.ts` nach — r3b, `design-r2c-bausteine`, `design-r2d-mobil-zustaende`, `listen-editor-r2f`, `erlass-adresse` | Drei migriert. Zwei bleiben als BEGRÜNDETE Ausnahme mit Beleg am Fundort, weil sie eine andere Frage stellen: `listen-editor-r2f` fegt bewusst nur Handgeschriebenes (acht `.generated.ts` liegen unter `src/`), `erlass-adresse` braucht ein Kommentar-Sieb, das `://` schützt. Neuer Wächter hält die Grenze |
| R5-B | `ErgebnisAnzeige.tsx:121` schreibt die `.num`-Deklaration roh als `style` | Ursache benannt: `.num` trug Rolle UND Monospace-Familie in EINER Zeile — wer den Ziffernsatz ohne die Familie wollte, musste ihn nachbauen. Der App-weite Ausdruck fand eine zweite Stelle, die keine Liste kannte: `ArtikelTabellen.tsx`, 4× `[font-variant-numeric:tabular-nums]` — dieselbe halbe Deklaration, die R4-C als Defekt nachgewiesen hat | `.lc-ziffern` = Rolle ohne Familie, `.num` = Rolle + Familie (wirkungsgleich). Beide Flächen migriert. `vorschauStil.ts` ist die eine begründete Ausnahme (geschlossenes Stil-Objekt, das den PDF-/DOCX-Satz spiegelt). PIXEL-BEWEIS am Preview, dass die Tabellen-Migration nichts ändert: dieselben zehn Ziffern mit `tabular-nums` und mit `lining-nums tabular-nums` in Geist Variable aufs Canvas gezeichnet ergeben BYTE-GLEICHE Daten-URL |
| R5-C | `AzRegister.tsx:223`: `Leerzustand` in mutmasslich unerreichbarem Zweig | Der Verdacht der Liste BESTÄTIGT, und zwar empirisch statt nur gelesen: Preview `/gesetze`, 27 Buchstaben-Knöpfe, 4 davon `disabled`, alle 23 übrigen durchgeklickt — der Leerzustand erschien **null Mal**. Quelltext-Grund: `gruppiereAZ` legt einen Map-Eintrag erst beim ERSTEN Erlass einer Klasse an (leere Gruppen entstehen nicht), und `n === 0` setzt `disabled` | Zurückgebaut (§6.7: ein Zweig, der nicht scheitern kann, sieht nach geprüftem Verhalten aus und ist keines). `?? []` → `?? null`, die eine bestehende Bedingung trägt jetzt beide unerreichbaren Fälle; Herleitung samt Messung am Fundort |
| R5-D | Hover-Flächen: Token-Wert-Frage aus PR #680 (`--paper-sunken` auf `--paper` = 1.04:1) | GEMESSEN am Preview: **33 Fundstellen in 21 Dateien, FÜNF Schreibweisen** für EINE Aussage — `hover:bg-paper-sunken` (13×), `.../60` (15×), `.../70` (1×), `hover:bg-well` (3×), `hover:bg-paper/60` (1×). Die letzten beiden fand erst der Ausdruck, der nach der Sache fragt. Kontrast auf `--paper`: 1.055:1 voll, 1.036:1 bei 60 % | `.lc-hover-flaeche` nimmt `var(--well)` — die Rolle, die `.lc-leiste-griff:hover` schon verwendet; kein neuer Ton, kein neues Token. Kanon ist NICHT die häufigste Form (die läge bei 60 %), sondern die reglementskonforme: §G-j legt Interaktions-Zustände auf EINE Regel, getragen von einer Rolle — eine Alpha-Verdünnung ist keine Stufe. WCAG-neutral: der Grund wird nur dunkler, der Kontrast der Schrift darauf kann nur steigen. BEWEIS am Preview: die Zeile ruht auf `rgba(0,0,0,0)` und wird beim Überfahren `rgb(246,244,238)` = Zeichen für Zeichen der alte Wert. **Ob die Stufe an sich kräftiger sein soll, ist Geschmack, nicht Konsistenz → wartet auf David** |
| R5-E | Generalfrage aus R4-D: welche Wächter hängen an einem VARIABLENNAMEN statt an der Sache? | Beantwortet durch Messung über alle 422 Dateien in `src/tests/`: **genau einer** ist übrig — `eingabe-bausteine-r2e.test.tsx:121`, `/setKopiert\([^)]*\)\s*,\s*([^)]+)\)/`. Und er ist inzwischen ein Vakuum-Tor: der Ausdruck trifft heute **0** Stellen, weil R4-D alle Kopier-Mechaniken in `useKopieren` gezogen hat | **NICHT gebaut, Runde 6**: die naheliegende Verbreiterung (Timer, der eine Quittung zurücksetzt, mit Rohzahl) trifft 1 sachfremde Stelle (`inhalt-hooks.tsx: anwenden(false), 200`) und ist damit kein sauberer Ersatz. Der richtige Zug ist wahrscheinlich RÜCKBAU statt Verbreiterung (§17-Gegengewicht): die Schwester-Sonde derselben Datei bewacht `clipboard.writeText` an der Sache und trägt die Sorge bereits allein. Test-Änderung ⇒ eigener deklarierter Schritt (§6.3) |

**Deklarierte Test-Anpassung (§6.3, eigener Commit `test(design):`).** Zwei
Bestands-Fälle prüften ihre Aussage über eine SCHREIBWEISE, die der geteilte
Baustein ersetzt hat — `ArtikelBody.test.tsx` («Ae8») zitierte
`hover:bg-paper-sunken`, `mehrspaltige-tabelle-render.test.tsx` zitierte
`tabular-nums`. Beide Aussagen sind unverändert wahr, die Wirkung ist gemessen
gleich (Hover-Farbe byte-gleich; Ziffern pixel-gleich). Der Fall in
`ArtikelBody` prüft seither SCHÄRFER als vorher: keine einzige eigene
`hover:bg-`-Stufe darf übrig bleiben (vorher war genau eine erlaubt).

**Dry-Sonde Runde 5 (5.9.2026, frischer Browser-Kontext je Route, 1600×900).**
Vier geforderte Paare plus eines: Gesetz-Leser Bund (`/gesetze/bund/OR`),
Gesetz-Leser Kanton (`/gesetze/kanton/ZH/LS-101`), Entscheid-Leser
(`/rechtsprechung/ag_gerichte_HOR_2024_19`), Rechner (`/rechner/verjaehrung`)
und Vorlagen (`/vorlagen`) — je Einzelseite gegen `?p=`-Split-View, verglichen
über `font-variant-numeric`, H1-Anatomie, ✕-Glyphengrösse, Hover-Grammatik,
Leerzustands-Arten, Overline- und Chip-Anatomie.
**Deckungsgleich:** `font-variant-numeric` ist über alle zehn Ansichten EIN
Wert (`lining-nums tabular-nums`, 3 bis 14'635 Elemente je Ansicht); genau ein
`h1` je Pane, immer 32 px, Schriftstimme folgt der Inhaltsklasse
(Zwei-Stimmen-Regel); rohe Hover-Utilities: **0** in allen zehn Ansichten,
alle 4'762–7'997 Flächen tragen den Baustein; Karten-Schatten ein Wert.
**EIN Neufund (R5-N1):** das ✕ trägt zwar überall `lc-schliessknopf`, aber in
ZWEI Glyphengrössen — 11 px in 24×24 (`lc-leiste-griff`, «Schliessen (zur
Startseite)») gegen 16 px in 28×28 (`h-7 w-7`, «Hauptfenster schliessen»).
Die Grösse liegt AUSSERHALB des Bausteins. Das ERGÄNZT die Runde-4-Aussage
«alle ✕ in EINER Glyphengrösse (16 px)», es widerspricht ihr nicht (§2b): jene
Messung lief nur über Split-View-Routen, und dort stimmt sie weiterhin.
**Kein Befund:** `.lc-chip` mit `border-radius: 0` — das ist die dokumentierte
Neutralisierung `.lc-kopf-aktionen .lc-chip` (LM-045-Familie), Begründung am
Fundort.

**DRY IST NICHT ERREICHT** (Stand nach Runde 5). Dry heisst zwei Runden ohne
neuen substanziellen Befund; Runde 5 hat **+9 Fundstellen** aus den eigenen
Wurzel-Sweeps und **1 Neufund** aus der Dry-Sonde erzeugt. Damit ist auch die
Runde-4-Diagnose bestätigt: der Vorrat sitzt nicht in den Listen, sondern in
den Ausdrücken, mit denen man sucht.

**Runde-6-Liste (aus dem Bau der Runde 5, alle belegt):**
· R5-N1 — ✕-Glyphengrösse 11 px vs. 16 px (oben gemessen). Entweder EINE
Grösse, oder zwei DOKUMENTIERTE Rollen (Schienen-Griff vs. Titelleisten-
Steuerung) — heute ist es weder noch, weil die Grösse ausserhalb des Bausteins
gesetzt wird.
· R5-E — `setKopiert`-Sonde in `eingabe-bausteine-r2e.test.tsx:121`: trifft 0
Stellen, hängt am Namen. Vermutlich Rückbau statt Verbreiterung; braucht einen
deklarierten Schritt (§6.3).
· `--flaeche`-Frage aus R5-D, falls David die Hover-Stufe kräftiger will: dann
gehört sie als eigenes Token neben `--well`, nicht als Wert-Tausch an
`--paper-sunken` (das trägt auch Wells, `--karte-leer` und die Chip-Fläche).
· Offen aus Runde 4, unverändert: der ⧉-Griff «Layout-Link kopieren» in der
Pane-Titelleiste gibt keine Rückmeldung, `LinkTeilenButton` für dieselbe
Handlung schon. Eine Quittung in der 28-px-Zeile wäre sichtbar neu →
**wartet auf einen Entscheid**, nicht auf einen Fix.


---

**Runde 6 — GEBAUT (5.9.2026, Pakete R6-A…C + ein deklarierter Test-Schritt).**
Arbeitsvorrat war die Runde-6-Liste; jeder Punkt wurde am Preview
reproduziert, bevor er angefasst wurde. Die Wurzel der Runden 4 und 5 hat sich
ZUM DRITTEN MAL wiederholt: die eigenen Sweeps fanden mehr als die Liste
(**+11 Fundstellen** beim Ziffernsatz, **+3 Flächen** beim ✕).

| Nr | Befund (Kurz) | Messung | Ergebnis |
|---|---|---|---|
| R6-A | R5-N1: ✕ in zwei Glyphengrössen (11 px vs. 16 px) | REPRODUKTION am Preview (1600×900, frischer Kontext je Route, zehn Ansichten, vierzehn ✕) **falsifiziert die Formulierung und bestätigt den Verdacht eine Ebene tiefer**: die Glyphe steht überall in **16 px**; die «11 px» der Runde 5 sind die `font-size` des KNOPFES (`lc-leiste-griff`: `.6875rem`), die der Span mit `text-base` überschreibt. Die echte Abweichung ist der SCHNITT: «Geist Mono Variable» im `InhaltsKopf` gegen «Geist Variable» sonst — gemessene ✕-Tinte **9.64 px gegen 12.20 px** bei identischer Schriftgrösse (§2b: der R5-Beleg wird ERGÄNZT, nicht nachgeführt — er beschreibt korrekt, was er gemessen hat) | WURZEL: der Baustein schrieb am Glyph-Span nur die GRÖSSE fest und liess die FAMILIE erben — dieselbe halbe Deklaration, die R4-C/R5-B beim Ziffernsatz als Defekt nachgewiesen haben, eine Ebene höher. `.lc-griff-glyph` trägt Grösse UND Schnitt an EINER Stelle. Kanon = Schnitt der Mehrheit (9 von 10) = Textschnitt der App. B6 (28.7.2026) bleibt unangetastet: die Glyphe war der Typo-Anatomie der Leiste in der GRÖSSE schon vorher entzogen. BEWEIS nachher: 14/14 ✕ in einem Wert (16 px · Geist Variable · Tinte 12.20 px), Boxen unverändert (24 px Leisten-Griff, 28 px Titelleiste/Reiter) |
| R6-B | Wurzel-Sweep: welche Schreibweisen setzen den Ziffernsatz noch roh? | Der R5-B-Wächter fragte nach der SCHREIBWEISE (`fontVariantNumeric`/`font-variant-numeric`) und lief an der Tailwind-Utility `tabular-nums` vorbei, die dieselbe Eigenschaft setzt — und zwar HALB, ohne `lining-nums`. GEMESSEN am Preview, Blatt-Elemente mit gesetztem `font-variant-numeric`: `/gesetze/bund/OR` **12 «tabular-nums» neben 8'254 «lining-nums tabular-nums»**, `/gesetze/kanton/ZH/LS-101` 1 : 3, `/rechtsprechung/ag_…HOR_2024_19` 16 : 89, `/` 1 : 38 — **EINE Rolle, zwei Werte, in JEDER geprüften Ansicht, Wächter grün**. Quelltext-Sweep: **11 Fundstellen in 7 Dateien** | Alle 11 auf `.lc-ziffern` migriert; `vorlagen/vorschauStil.ts` bleibt die eine am Fundort begründete Ausnahme. PIXEL-BEWEIS: Tinten-Breite (Range über den Textknoten, 3 Nachkommastellen) aller Ziffern-Texte derselben vier Ansichten vorher gegen nachher — **8'171 Proben, `diff` LEER**. Nachher EIN Wert je Ansicht. Wächter an die SACHE gestellt (`ZIFFERNSATZ_ROH`), rot bewiesen. NEBENWIRKUNG: der Defekt-Typ von R4-C (Utility überschreibt `.num` und nimmt ihm `lining-nums`) kann in der App nicht mehr entstehen — die Zutat ist weg; der R4-C-Wächter bleibt trotzdem, er hat einen datierten Vorfall verhindert (§17-Gegengewicht, Ausnahmesatz) |
| R6-C | Dry-Sonden-Neufund: dieselbe Frage wie R6-A, einmal breiter gestellt | Die A3-1-Ausnahmeliste hält «leeren» zu Recht neben «schliessen» (§1/§8) — sie hat aber nie gefragt, ob die (b)-Klasse mit SICH SELBST übereinstimmt. GEMESSEN am Preview (Feld je Fläche echt betippt, sonst erscheint der Griff nicht), drei Flächen mit identischem `aria-label` «Suche leeren»: `start/UniversalSuche` 16 px · Tinte 12.20 · Box 28×28 r8 · `pages/Suche` 16 px · 12.20 · 28×28 r8 · `v3/SuchSprungFeld` **14 px · 10.67 · 24×24 rund**. Eine Handlung, drei Handschriften; zwei davon wortgleiche Kopien | Die drei holen Grösse und Schnitt aus `.lc-griff-glyph`. Der Klassenname wurde dafür von `.lc-schliessknopf-glyph` umbenannt: die Anatomie gilt der GESTALT, nicht der Handlung — ein Name, der die Handlung nennt, wäre der Grund gewesen, die Gestalt ein zweites Mal hinzuschreiben. Die BOX bleibt der Zeile (Baustein-Vertrag seit R3-β; Präzedenz 16-px-Glyphe in 24-px-Box im `InhaltsKopf`). BEWEIS nachher: 16 px · Geist Variable · Tinte 12.20 px in allen dreien, Boxen unverändert. KEIN BEFUND: die beschrifteten ✕ der Klasse (a) und `WeiterlesenChip` schreiben gar keine Typografie hin — sie folgen dem Type ihres Wortes, wie es die Doktrin verlangt |
| R5-E | letzte namensgebundene Sonde (`setKopiert`) | REPRODUZIERT: der Ausdruck trifft am 5.9.2026 **0** Stellen. MUTATIONS-BEWEIS statt Behauptung — eine von Hand gebaute Kopier-Quittung mit eigener Dauer, aber anderem Variablennamen (`setQuittung(true)` … `setTimeout(…, 2500)` samt `clipboard.writeText`) eingesetzt: **namensgebundene Sonde GRÜN, R4-D ROT** | RÜCKBAU (§17-Gegengewicht/§6.7), nicht Verbreiterung: die Sorge trägt R4-D an der Sache, der verbleibende Fall hält `KOPIER_DAUER_MS` bei genau einer Definition. Verbreitern ist geprüft und verworfen — der naheliegende Ausdruck trifft genau eine SACHFREMDE Stelle (`v3/LeserErlassKopfZone.tsx: setReiterToast(false), 3200`, ein Reiter-Hinweis). Herleitung samt Messung am Fundort. **Die App hat damit keinen namensgebundenen Wächter mehr** |

**Deklarierte Test-Anpassungen (§6.3, zwei eigene `test(design):`-Commits).**
Kein Bestands-Test wurde «passend gemacht»: der R5-B-Wächter wurde an die
SACHE gestellt (Utility-Schreibweisen mit), der A3-1-Block bekam zwei neue
Fälle (Glyph-Schnitt im Baustein · kein freistehendes ✕ mit eigener
Typografie), und die zwei namensgebundenen Fälle sind zurückgebaut. Jede
Änderung mit ROT-BEWEIS durch Mutation am echten Quelltext, danach
zurückgenommen — die vier Wortlaute stehen in den Commit-Messages.

**Dry-Sonde Runde 6 (5.9.2026, frischer Browser-Kontext je Route, 1600×900,
vierzehn Flächen).** Fünf Paare Einzel ↔ Split plus vier bisher nie gesondete
Flächen (Startseite-Kacheln, Katalog `/vorlagen`, Materialien-Leser,
Entscheid-Leser). Verglichen über Ziffernsatz, ✕-Anatomie (Grösse · Schnitt ·
Tinte), H1-Anatomie, rohe Hover-Utilities, Karten-Schatten, Overline, Chip,
Radien und — neu — die Anatomie ALLER freistehenden Steuerungs-Glyphen.

**METHODEN-BEFUND ZUERST (R6-M).** Die Runde-5-Sonde hat **nicht** Split gegen
Einzel gemessen. `?p=rechtsprechung` (ohne führenden `/`) wird von
`usePaneLayout.ts:43` (`saeubere`: `!x.startsWith('/') → continue`) verworfen;
gemessen: **0 PaneKöpfe** auf allen fünf «Split»-Routen der Runde 5. Fünf der
zehn Runde-5-Ansichten waren also Einzelansichten. Das erklärt zugleich R5-N1:
in der Einzelansicht gibt es nur das ✕ des `InhaltsKopf`, und dessen
Knopf-`font-size` ist 11 px. Runde 6 misst mit `?p=%2F…` — **2 PaneKöpfe** auf
allen fünf Split-Routen (Beleg im Commit-Verlauf).

**Deckungsgleich (nach dem Bau):** Ziffernsatz **ein** Wert in allen vierzehn
Flächen (`lining-nums tabular-nums`, 4 bis 9'025 Elemente je Fläche) · ✕ **ein**
Wert (16 px · Geist Variable · Tinte 12.20 px, 14 Vorkommen) · rohe
Hover-Utilities **0** in allen vierzehn Flächen (4'764–5'107 Flächen tragen den
Baustein) · Karten-Schatten ein Wert · Overline ein Wert
(11 px/1.32 px/uppercase) neben der dokumentierten `-soft`-Variante · genau ein
`h1` je Pane, immer 32 px (Startseite 36 px, eigene Klasse).

**NEUFUNDE: drei** (R6-A eine Ebene tiefer als gemeldet, R6-B, R6-C) —
alle gebaut. Plus der Methoden-Befund R6-M.

**Kein Befund (gemessen und verworfen):** `⧉` in «zwei Grössen» (16 px und
14 px) war ein Mess-Artefakt derselben Art wie R5-N1 — am Glyphen-Span
gemessen sind **alle 21 `⧉` 16 px / Tinte 12.73 px**, die 14 px gehörten dem
Knopf. Die R6-A-Lehre hat den Fehlgriff hier verhindert · `.lc-chip` mit
`border-radius: 0` = die dokumentierte Neutralisierung (LM-045-Familie) ·
H1-Schriftstimmen = Zwei-Stimmen-Regel · `.lc-overline-soft` = dokumentierter
Modifikator (`text-transform: none`, `letter-spacing: .04em`).

**DRY IST NICHT ERREICHT** (Stand nach Runde 6). Runde 6 hat **drei**
substanzielle Neufunde und einen Methoden-Befund erzeugt. Bestätigt ist damit
zum dritten Mal: der Vorrat sitzt nicht in den Listen, sondern in den
Ausdrücken, mit denen man sucht — und Runde 6 zeigt die Verschärfung, dass er
auch in der MESSMETHODE sitzt (R6-M, das ⧉-Artefakt).

**Runde-7-Liste (aus dem Bau der Runde 6, alle belegt):**
· **R6-N1 (Kopf der Liste) — die halbe Deklaration ist nicht auf das ✕
beschränkt.** Der App-Sweep nach `aria-hidden`-Glyph-Spans fand **75 Stellen**;
`text-base leading-none` (Grösse gepinnt, Schnitt frei) steht dort mehrfach
handgeschrieben. GEMESSEN am Glyphen-Span in EINER Zeile, der Pane-Titelleiste
(`/gesetze/bund/OR?p=%2Frechtsprechung`): `▸` 14 px/Tinte 6.45 · `◂` 14 px/6.45
· `⇱` 14 px/8.44 · `⧉` **16 px**/12.73 · `✕` **16 px**/12.20 — fünf Griffe
derselben Zeile in ZWEI Grössen. R6-C hat den Wächter nur für das ✕ gestellt;
die Verallgemeinerung auf alle freistehenden Steuerungs-Glyphen ist der
nächste saubere Zug (dieselbe Trennung: Glyphe geteilt, Box der Zeile).
· `☰` in zwei Anatomien: 16 px/Geist Variable in der Topbar gegen
11 px/«Geist Mono Variable» im Leser-Griff (`lc-leiste-griff`). Anders als beim
✕ sind das ZWEI Leisten mit je eigener dokumentierter Anatomie (B6), also kein
Defekt nach heutiger Regel — aber die Frage «soll dieselbe Glyphe in zwei
Leisten verschieden aussehen?» ist nie entschieden worden. Erst entscheiden,
dann bauen.
· `--flaeche`-Frage aus R5-D, unverändert offen: falls David die Hover-Stufe
kräftiger will, gehört sie als eigenes Token neben `--well`, nicht als
Wert-Tausch an `--paper-sunken`. **wartet auf David**
· Offen aus Runde 4, REPRODUZIERT und unverändert: der ⧉-Griff «Layout-Link
kopieren» (`PaneKopf.tsx:177`) ruft `onTeilen` ohne jede Quittung, während
`LinkTeilenButton` für dieselbe Handlung eine gibt. Eine Quittung in der
28-px-Zeile wäre sichtbar neu → **wartet auf einen Entscheid**, nicht auf
einen Fix.
· Kandidat für Rückbau, NICHT in Runde 6 gezogen: der App-Sweep in
`R4-C · keine Klassenliste trägt .num und tabular-nums zugleich` kann seit
R6-B nicht mehr scheitern (der verbreiterte R5-B-Wächter verbietet die Zutat
app-weit). Er bleibt vorerst, weil er einen datierten Vorfall verhindert hat
(§17-Gegengewicht); Runde 7 soll den Streich-Entscheid mit Mutations-Beweis
fällen statt ihn zu erben.

**WAS RUNDE 7 ZU TUN HAT, damit Dry entschieden werden kann:** R6-N1 bauen
(die einzige offene Konsistenz-Sache), die zwei Entscheid-Punkte David
vorlegen, den R4-C-Rückbau entscheiden — und danach die Dry-Sonde
UNVERÄNDERT wiederholen. Findet sie null Neufunde, ist Runde 8 nur noch
Bestätigung und Dry (zwei Runden ohne Neufund) mit Runde 8 erreicht. Die Sonde
selbst ist ab Runde 6 belastbar: sie misst am Glyphen-/Textknoten statt am
Knopf und öffnet echte Split-Views (`?p=%2F…`).

**Verworfen/kein Befund:** Leerzustand-Wortlaut «gefunden» vs «erfasst» (bedeutungstragend) ·
H1-Schriftstimmen (Zwei-Stimmen-Regel) · `rounded`=`rounded-sm` (latent, via tailwind-Default
mitgefixt) · SachgebietKacheln lg: (ohne Sichtschaden, Runde 2 prüfen).
**Nebenfunde für andere Stränge (nach Landung PR #595 in den Plan buchen):** BMV
«Nachfolge-Erlass = gleiche SR» (§7-Datenfrage Korpus) · Zählparität 1'458/201+1'231/227
(§8, Cowork-32-Familie) · toter `uebersichtsZeile`-Code mit hartem «SR» (Rückbau) ·
~~`PaneKopf.stand` unerreichbar~~ — FALSIFIZIERT durch BAU-6 (31.8.): erreichbar auf 11 pdf-embed/nur-live-link-Erlassen (EMRK, DSGVO …), dort einzige Stand-Angabe des Panes; bleibt, neu bewacht (`ortsAngabe.test.tsx`).
