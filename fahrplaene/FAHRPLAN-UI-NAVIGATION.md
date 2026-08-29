# FAHRPLAN — UI-Nutzwert & Navigation (Ultracode-Synthese 11.7.2026)
<!-- @lagebild name: Suchen & Navigieren · zweck: App-weite Suche und Wege zwischen Gesetzen, Entscheiden und Werkzeugen. -->

> **ROADMAP-Schritt:** `W2·10-UI-NAV` (Welle 2, nach den laufenden W2·5d-Einheiten).
> **Quelle:** Ultracode-Recherche 11.7.2026 — 60 empirische UI-Befunde (Playwright/DOM/Code)
> plus 3 adversariale Kritik-Linsen (**david-treue** · **repo-realität** · **praxis-nutzen**)
> mit Repo-Spot-Checks. Dieses Dokument ist die **Synthese**: Verdikt-gefilterte Befunde,
> zu Bau-Einheiten gebündelt (§14.2), priorisiert nach **Praxis-Hebel × Machbarkeit ohne
> Fachzeit × Kollisionslage**. Verworfenes steht explizit mit Grund (§Z).
>
> **Bilanz:** 80 Einzelverdikte (60 Befunde + Dubletten-Fassungen) → **44 übernommen ·
> 32 geändert** (davon 6 David-Entscheid, 3 hart gegated) · **4 verworfen**; nach
> Dubletten-Merges ≈ 52 Netto-Befunde in **~26 Bau-Einheiten** + 6 Zusatzposten der Linsen.

---

> Erledigt-/Stand-Abschnitte vom 14.8.2026 nach `archiv/FAHRPLAN-ERLEDIGT-ABSCHNITTE.md` verschoben (QS-PLAN-EINFACH).

## §0 · Verbindliche Prozess-Regeln (gelten für JEDE Einheit dieses Plans)

1. **Vintage-Regel (Prod-Re-Audit vor jedem Schnitt).** Viele Befunde wurden gegen einen
   Prod-Stand **vor** den Merges vom 10./11.7. erhoben (U-VERWEIS, U-POSITION, Kopf-PR #194,
   D9/D10, A5-Mobil-Dropdown) — mehrere sind bereits teilwiderlegt. **Pflicht:** Befund am
   aktuellen `lexmetrik.vercel.app` reproduzieren + Abgleich gegen `FAHRPLAN-GESETZES-UX.md`
   §10 (A1–A25) und `FAHRPLAN-VERZAHNUNG-UI.md` (Bewusst-NICHT-Liste), **bevor** gebaut wird.
2. **Sequenzierung Reader-Flächen.** Einheiten, die `parts.tsx`/`inhalt.tsx`/`ArtikelBody.tsx`/
   `index.css` berühren, laufen **hart HINTER** den offenen A-Restposten (A20/A21/A22/A24/A25
   C-2/C-3) — Kollisions-Precheck nach §10.3 (`git worktree list` + Datei-Abgleich). Suche-/
   Rechner-/Rechtsprechungs-Einheiten sind weitgehend kollisionsfrei und **zuerst** schneidbar.
3. **Modell-Daueranweisung:** Bau = Opus (Default); Risiko-Pfade (Daten-Pipeline, Presets,
   Extraktions-Nähe) = Opus + Skill `gegenpruefung` (`check:gegenpruefung`-Quittung).
4. **§8-Ehrlichkeit als Bau-Kriterium:** kein Feature zeigt mehr, als der Korpus trägt;
   maschinelle Zuordnungen tragen «maschinell»-Marker; lokale Persistenz trägt «nur auf
   diesem Gerät».
5. **§15/§13:** CLS über token-basierte Mindesthöhen, keine Magic-Numbers; golden-relevante
   Flächen byte-gleich beweisen, nicht behaupten.

**Leitthema der ganzen Welle («gebaut ≠ gefunden», Befund der Praxis-Linse):** LexMetrik hat
starke, fertige Features mit null Entdeckbarkeit (Split-View, Norm-Sprung, Popover, Zitat-
Aktionen, Pane-Persistenz). Ein Grossteil dieses Plans ist darum **Sichtbarmachung + tote
Pfade schliessen**, nicht Neubau.

---

## §1 · P0 — Quick-Win-Paket (alles S, kollisionsfrei, zusammen ~1–2 Sessions)

> **✅ GEBAUT (11.7.2026, Opus).** N0a–N0d komplett umgesetzt + je empirisch
> (Playwright Desktop+Mobil@390) belegt, ein Pathspec-Commit je Quick-Win.
> Tore grün (tsc · vitest 3701 · golden byte-gleich · lint · 26/28 Sub-Checks);
> **fremd-vorbestehend rot: `check:p-klassen` + `check:vollstaendigkeit`** (Normtext-
> Daten, von diesem reinen UI-Diff unberührt — nicht gefixt). Prerender aller 61
> Routen ok. **W3-Abweichung (deklariert):** touch-Popover als Ein-Zeilen-Legende
> am Katalog-Kopf statt an der Inline-Badge (deren Karten-Zeile ist ein `<Link>` →
> `<button>` darin wäre ungültige Verschachtelung); der `title` der Inline-Badges
> bleibt. **W4 (deklarierte fachliche Änderung, §6.3):** `/rechner`-Test auf das neue
> lokale Filterfeld gezogen (vorher «kein Suchfeld» als Invariante).

### N0a · Tote Rückwege (EIN Mini-PR)
- **Kern:** `Footer.tsx:11` `{ to: '/', label: 'Rechner & Vorlagen' }` → `/rechner` (bzw. zwei
  Einträge Rechner·Vorlagen) · `RechnerKopf.tsx:29/35` beide `Link to="/"` → «← Alle Rechner»
  `/rechner` (Vorlagen-Pendant `wizard.tsx` «Zurück zum Katalog» analog `/vorlagen`) · «Katalog»-
  Crumb Label=Ziel angleichen · Breadcrumb-Tap-Höhe ≥24 px (`py-1`). Der ✕ («zur Startseite»)
  bleibt — Label ist ehrlich.
- **Flächen:** `src/components/layout/Footer.tsx`, `RechnerKopf.tsx`, `src/components/vorlagen/wizard.tsx`.
- **Prüfpunkte:** alle drei Affordanzen führen dorthin, wohin ihr Label verspricht; e2e-Klickpfad
  Rechner→Übersicht→nächster Rechner. *(Befunde #31, #54 — beide code-bestätigt.)*

### N0b · Erlass-Key-Normalisierung + hilfreiche Fehlseite
- **Kern:** `GesetzLeser`-Key-Lookup case-insensitiv gegen das Register + Redirect auf die
  kanonische URL (`/gesetze/bund/or` → `/gesetze/bund/OR`); Fehlseite zeigt den angefragten
  Key, Fuzzy-Vorschläge deterministisch aus dem Browse-Manifest (Wiederverwendung
  `normQuery`-`norm()`-Normalisierung, **kein neuer Index**/K10) + eingebettetes Erlass-Suchfeld.
- **Flächen:** `src/pages/GesetzLeser.tsx`, `src/pages/gesetz-leser/inhalt.tsx:785` (Fehlerzweig).
- **Prüfpunkte:** `or`/`zgb`/`Or` landen im Volltext; «ORR» zeigt «Meinten Sie OR?»; echte
  Nicht-Existenz bleibt ehrliche Meldung. *(#10, #11.)*

### N0c · Anker-Landung: `scroll-margin`-Token an reale Sticky-Höhe koppeln
- **Kern:** `.nt-anker { scroll-margin-top: calc(4rem + 1rem) }` (`index.css:298`, 80 px) ist
  kleiner als der reale Sticky-Stack (~137–150 px) — Wert als **Token an die reale
  Sticky-Höhe** koppeln (Muster `--rsp-stick` aus dem Entscheid-Leser, B3-Fix). Highlight-Puls
  existiert bereits (U-POSITION) — **nicht neu bauen**.
- **Flächen:** `index.css` (+ ggf. Token in `tailwind.config.js`). Reader-CSS ⇒ §0.2-Precheck.
- **Prüfpunkte:** `/gesetze/bund/OR#art-336`: Artikelnummer + Randtitel vollständig sichtbar,
  Desktop + Mobil 390. *(#49 — bestes Aufwand/Wirkung-Verhältnis der Liste.)*

### N0d · Kleinposten-Sammel-PR (je Einzeiler-Klasse, keine Kollisionsfläche)
- **W5** «↓ Ergebnis»-FAB per IntersectionObserver ausblenden, sobald `#lc-ergebnis` im
  Viewport (am gemeinsamen Baustein `vorlagen/ui.tsx:509`; optional Umschalten «↑ Eingaben») *(#37)*.
- **W4** Rechner-Übersicht: lokales Filter-Input unter dem H1, clientseitig über die bestehende
  Katalog-Struktur; Accordions bei aktivem Filter öffnen *(#33)*.
- **W1** Streitwert-Leerzustand: Platzhalter-Ergebnispanel mit fester Mindesthöhe im
  `ErgebnisBlock` («Betrag eingeben — hier erscheinen Streitwert, Verfahrensart Art. 243 ZPO,
  BGG-Abgleich») — §15.2-CLS-positiv, C2-konform (kein Fehler vor Eingabe) *(#34)*.
- **W3** «Entwurf»-Badge: `title` existiert (`Katalog.tsx:44/80`) — Rest = Touch-taugliches
  Popover (Begriff.tsx-Muster aus VZUI wiederverwenden) + Ein-Zeilen-Legende am Katalog-Kopf.
  **Kein Status-Upgrade** (Zeitsperre 1.12.) *(#36 — deckt Strang A der Lernphase)*.
- **J5** Entscheid-Leser: Tab-Klick schreibt `?ansicht=voll|auszug` zurück (Lesen existiert
  schon, `EntscheidLeser.tsx:168ff.`) + `scrollTo` Dokumentanfang beim Wechsel *(#30)*.
- **O3** «In neuem Reiter»: Toast/Fly-to zum Reiter-Tracker + Tooltip «Reiter & Split-View»
  am ☰-Icon (`inhalt.tsx:1022`) — als Kleinposten der `W3-AUSBAU`-Zeile «Multi-Pane / Split-View»
  geführt (vormals `W3·14`, Etiketten-Konsolidierung 15.8.2026) *(#18)*.

---

## §2 · P1 — Suche glaubwürdig machen (Kette S1→S6; Zuschnitt der repo-Linse)

Die Suche ist die Haustür; «Miete» ohne OR 253 ff. und BGE-Zitate hinter 40 Artikel-Treffern
sind die schwersten Einzelbefunde. **A6-Kontrakt beachten:** die Gruppen-Rangfolge
(Rechtsinhalte vor Werkzeugen) ist David-Entscheid (5.7., `universalSuche.test.ts`) — sie wird
präzisiert, nie autonom gekippt.

### S1 · Query-Durchreichung `?q=` — S
- **Kern:** `mehrHref` mit Query (`/materialien?q=…`, `/gesetze?q=…`, `/rechtsprechung?q=…`;
  `universalSuche.ts:135/151/167` heute ohne) + die drei Browse-Pages lesen `?q=` beim Mount
  ins Filterfeld · Rechtsprechungs-Suchbegriff in URL spiegeln (debounced `replaceState`,
  Muster des bestehenden `?rg=`).
- **Flächen:** `src/lib/universalSuche.ts`, Browse-Pages, `src/pages/Rechtsprechung.tsx:75`.
- **Prüfpunkte:** «alle 408 →» liefert die 408 (gefiltert); Reload/Teilen einer
  Rechtsprechungs-Recherche stellt `rg` UND `q` wieder her. *(#42, #25, #43-Teil — macht die
  Zähler §8-ehrlich.)*

### S6 · Mobiler Such-Fokusmodus — S–M
- **Kern:** Feld expandiert beim Fokus über die volle Headerbreite (Logo/Theme temporär weg,
  ✕ zum Verlassen) · Input-`font-size` ≥16 px nur mobil (heute `text-body-s` 14 px ⇒
  iOS-Fokus-Zoom, `HeaderSuche.tsx:130`) · kurzer Mobil-Placeholder («Suche · OR 257d …») ·
  Treffer-Labels `line-clamp-2`, unterscheidendes Merkmal (Nummer/Jahr) nach vorn.
  Dropdown ist seit A5 mobil viewport-breit — **nachmessen**, was übrig ist.
- **Flächen:** `HeaderSuche.tsx`, `Topbar.tsx`, `SuchResultate.tsx`.
- **Prüfpunkte:** @390 kein iOS-Zoom, getippte Query voll lesbar, Norm-Sprung-Affordance
  sichtbar. *(#8+#47+#53 gemergt.)*

---

## §3 · P2 — Verzahnung Norm ↔ Rechtsprechung ↔ Werkzeug (der Burggraben-Anschluss)

### V2 · Hover-Preview am bestehenden NormPopover — S–M
- **Kern:** Klick-Popover MIT Wortlaut + ⧉-Split ist gebaut (U-VERWEIS/VZUI). Delta = nur der
  **Hover-Trigger** (Desktop, ~500 ms Delay; Touch bleibt Klick) am selben Popover. Evidenz:
  Wikipedia Page Previews A/B (+31 % Interaktionen, <0,04 % Abschaltquote). Lazy/memoisiert,
  §15-neutral.
- **Flächen:** `NormPopover.tsx` / Verweis-Chips. **Rest-Punkt aus #14:** nackte
  SR-Nummern-Nennungen ohne «Art.»-Kontext als **Kürzel-Chips** labeln (SR-Nr. als Tooltip) —
  kleiner Rest, auf aktuellem Prod nachmessen.
- **Prüfpunkte:** Hover zeigt Wortlaut-Karte; Klick-Verhalten unverändert; A9-Throttle CLS 0.
  *(#66+#74+#14-Rest gemergt.)*

### V3 · Leitfall-Chip-Regeste-Popover — M
- **Kern:** Regeste-Auszug (amtlicher Bestandstext) als Popover am KantenChip + Aktionen
  «Öffnen»/«Daneben öffnen». **Auflagen:** ⧉ an jedem Chip bleibt VERWORFEN (VZUI
  Grammatik-Regel 1 + A6 «keine Sekundär-Buttons je Zeile»; die Split-Aktion lebt im
  Popover, nicht am Chip); Entscheid-Link trägt bereits `?norm=` und landet seit A17 an der
  Fundstelle — nicht doppeln.
- **Flächen:** KantenChip/`parts.tsx` — **nach Kopf-PR-Fläche sequenzieren** (§0.2),
  parts.tsx-Kollisions-Precheck Pflicht.
- **Prüfpunkte:** «Norm lesen → Leitfall kurz prüfen → weiterlesen» ohne Kontextwechsel.
  *(#17.)*

### V4 · NormChip-`href` intern setzen — S
- **Kern:** Der Fedlex-Wurf-Befund *(#22)* ist im Kern **widerlegt** (NormChip öffnet per
  preventDefault das interne NormPopover). Rest: `href` intern setzen, wo ein Snapshot
  existiert (Cmd-Klick/Link-kopieren/neuer-Tab landen intern); Fedlex bleibt sichtbarer
  Zweitlink «amtlich ↗» im Popover (Leitplanke amtliche Rückverfolgbarkeit).
- **Flächen:** `NormChip.tsx` / `zitat-extraktion.ts`-Konsumenten.
- **Prüfpunkte:** Cmd-Klick auf «Art. 321 StGB» in BGE 152 I 65 öffnet den eigenen Reader.

### V5 · Erwägungs-Navigation im Entscheid-Leser — M
- **Kern:** Desktop-Rail rechts: Erwägungs-Inhaltsverzeichnis aus vorhandenen `#e-`-Ankern
  (`abschnitte.ts`) + angewandte Normen als Chips; mobil aufklappbarer «Kontext»-Abschnitt.
  **Auflage:** die Fuss-Position der Verzahnungs-Blöcke ist dokumentierter Entscheid (VZUI
  §0/1d) — der Rail ist **Navigation**, keine Verzahnungs-Fläche, und stösst 0/1d nicht um.
  Dazu **«Im Entscheid suchen»** (Pendant zur In-Gesetz-Suche; Zusatzbefund Praxis-Linse).
- **Flächen:** `src/pages/EntscheidLeser.tsx`, `src/lib/rechtsprechung/abschnitte.ts`.
- **Prüfpunkte:** E. 4.5.2 in 2 Klicks erreichbar; Juristen-Navigation über E.-Nummern.
  *(#29-geändert + Z4.)*

### V6 · Vorlage↔Rechner-Kreuzlinks (symmetrisch) — S–M
- **Kern:** Registry-Feld `passendeRechner` (grep heute: 0 Treffer) analog zur bestehenden
  Rechner→Vorlage-Verdrahtung; Chip «Frist zuerst rechnen: Verjährung →» im Vorlagen-Kopf.
  Mind.: verjaehrungsverzicht↔verjaehrung, mahnung↔verzugszins, klage-*↔streitwert/prozesskosten.
- **Flächen:** Vorlagen-Registry, `wizard.tsx`; Heimat `WERKZEUG-VERDRAHTUNG.md`. *(#32.)*

---

## §4 · P3 — Reader & Wiedereinstieg (hart hinter A20–A25, §0.2)

### R1 · In-Gesetz-Suche: Treffer-Highlight — M (Schwere: hoch, Praxis-Linse)
- **Kern:** `<mark>`-Hervorhebung in den gefilterten Artikeln (auch Fussnoten) + Trefferzahl
  je Artikel + Vor/Zurück-Sprungtasten. **Auflage:** nur Client-Render-Layer — prerendertes
  HTML/golden/Normtext-Snapshots byte-gleich (L0 «strukturerhaltend», §15-Treue).
- **Flächen:** `src/pages/gesetz-leser/inhalt.tsx` (Filterlogik). *(#12.)*

### R2 · Mobile Gliederung: volles Bottom-Sheet + «Sie sind hier» + Quickjump — M
- **Kern:** Sheet in voller Höhe (Daumenzone) · beim Öffnen Hierarchie zur aktuellen
  Leseposition aufgeklappt + markiert (Scroll-Spy-State existiert, A3 nutzt ihn) ·
  **Quickjump-Feld «Art. N»** zuoberst (deterministisch gegen vorhandene `art-`-IDs, kein
  Index — derselbe Baustein auch im Desktop-TOC-Kopf). **Virtualisierungs-Anteil der
  Ursprungs-Befunde gestrichen** (§15.1; A2 hat die Scroll-Proportionalität repariert —
  nachmessen).
- **Flächen:** `GesetzeGliederung.tsx`, Sheet-Container. *(#50-Sheet + #77 gemergt.)*

### R3 · Zitierfähige Referenz mit Permalink — überall — S–M
- **Kern:** «Zitat»-Kopie (`baueZitat`) um Deep-Link-URL + amtlichen ELI-Link ergänzen
  («Art. X Abs. Y GESETZ, SR-Nr., Stand TT.MM.JJJJ» + Links) · dieselben Zitat/Link-Buttons
  auch **einspaltig/mobil** (heute 2-Spalten-Gating, `inhalt.tsx:1154`) — z. B. im
  Artikelkopf-···-Menü · BGE-Muster «BGE 148 III 57 E. 4.2» (Pin-Cite existiert,
  `EntscheidBody:98`). **Auflagen:** Zitierformat = quasi-fachliche Konvention → doppelt
  verifizieren + Formatdefinition dokumentieren; Abs./lit.-Pinpoint erst, wenn
  Anker-Granularität existiert. **Kein** kontinuierlicher Scroll-Hash-Sync (kollidiert mit
  der frischen A16-Mechanik — der URL-Hash-Verzicht dort ist empirisch begründeter Entscheid).
- **Flächen:** `parts/ArtikelLeser.tsx:330f.`, `helpers.ts`, `inhalt.tsx`. *(#70 führend +
  #13-Zitatteil + #76 gemergt; Westlaw/Lexis «Copy with Reference»-Muster.)*

### R4 · Positions-Persistenz «Weiterlesen bei Art. X» — M
- **Kern:** den U-POSITION-`scrollAnker` `{token, offset}` je Erlass-Pfad in localStorage
  spiegeln (§5-sauber: nur Token+Zahl, nie Falldaten); beim erneuten Öffnen **kein**
  Auto-Sprung, sondern unaufdringlicher Chip «Weiterlesen bei Art. 335c ↩» im Erlass-Kopf;
  **Stand-Marker des Snapshots als Invalidierungs-Arbiter** (NN/g: Wiederherstellung nur bei
  unverändertem Inhalt). Direkte Folge-Einheit auf der frisch gemergten U-POSITION-Fläche —
  auf aktuellem main bauen.
- **Flächen:** `scrollAnker.ts`, `App.tsx`-ScrollWiederherstellung, `zuletztVerwendet.ts`. *(#73.)*

### R5 · Rücksprung-Chip — Rest-Scope — S–M
- **Kern:** A16 hat Verweis-Sprünge zu echten History-Einträgen gemacht (Zurück landet exakt —
  Davids U-POSITION-Befund ist GEBAUT). Rest: nur **TOC-/Quickjump-Sprünge** (kein
  History-Eintrag) — flüchtiger Chip «↩ zurück zu Art. X» über die vorhandene
  scrollAnker-Registry (einige Sekunden, aria-live, Position fix unten).
- **Flächen:** `scrollAnker.ts`, `SektionBaumTOC` onSprung. *(#78-Rest.)*

### R6 · Tap-Target-Pass (Sammel-Ticket) — M
- **Kern:** Hitbox ≥24 px (WCAG 2.5.8; Ziel 44 wo dicht getappt) per Padding/::after **ohne
  Optik-Änderung** (golden-neutral): Zitat/Link 22×13, Fussnoten-Sup 18×16, Gliederungs-
  Chevrons 16×13, Sidebar-Chevrons 18×18 (`Sidebar.tsx:107` `p-0.5`), Breadcrumbs 45×17,
  Stand-Leisten-✕. Das `min-h-11`-Muster des Headers als **Token-Regel ins DESIGN-REGLEMENT**
  (maschinell prüfbar, §13/E1).
- **Flächen:** `ArtikelBody.tsx`, `GesetzeGliederung.tsx`, `InhaltsKopf.tsx`, `Sidebar.tsx`
  — Reader-Anteile nach §0.2 sequenzieren. *(#6+#51 gemergt.)*

### R7 · Deep-Link-Wahrnehmung: Skeleton «Springe zu Art. X …» — S
- **Kern:** Beim Anker-Load Overlay/Skeleton mit Zielangabe statt sichtbarem Dokumentanfang.
  **Zuerst Prod-Re-Audit:** U-POSITION/A2 hat die Fläche 11.7. umgebaut und verkürzt evtl.
  die Konvergenzzeit — Messung wiederholen, nur bauen, wenn der Schmerz bleibt.
- **Flächen:** `scrollAnker.ts`/`inhalt.tsx`-Anker-Pfad. *(#7+#19-Skeleton gemergt;
  Virtualisierung gestrichen, §Z.)*

### R8 · Tastatur-Navigation j/k + «?»-Overlay — S–M · **niedrigste Priorität**
- **Kern:** EIN globaler keydown-Listener im Reader (Input/Dialog-Guard): j/k Artikel
  vor/zurück, t TOC-Fokus, c Zitat-Kopie, «?» Shortcut-Overlay (§13-Tokens). Koexistenz-
  Pflicht: «/»/⌘K global belegt (`tastatur.e2e.ts`-Kontrakt). Praxis-Linse stuft herab
  (Anwälte ≠ Vim-Nutzer) — bauen, aber ans Ende. *(#75 geändert.)*

---

## §5 · P3b — Verlauf-Initiative (EINE Baueinheit, EINE Datenquelle)

## §6 · P4 — Rechtsprechungs-Übersicht & Startseiten-News

### J1 · Browse-Liste: Batching + Band-Sprungleiste — M
- **Kern:** «Mehr laden»-Batches (~50) oder Listen-Virtualisierung (**erlaubt**: §15.1 gilt
  für NORMTEXT, eine Browse-Liste hat keinen Ctrl+F-über-Gesetz-Anspruch) + Jahr/Band-
  Sprungleiste (152/151/150 … — Juristen denken in Bänden). **Prüfpunkt zwingend:**
  Listen-Scroll-Restoration Treffer→Detail→zurück (Zusatzbefund Praxis-Linse) darf nicht
  brechen. Skaliert auf das E3-Ziel (195k) — jetzt bauen spart den Umbau.
- **Flächen:** `src/pages/Rechtsprechung.tsx`, `EntscheidZeile.tsx`. *(#26 + Z5.)*

### J2 · Mobil-Filter als Bottom-Sheet — M
- **Kern:** Filterblock hinter kompaktem «Filter (3)»-Button/Bottom-Sheet, Intro auf eine
  Zeile — Treffer «above the fold». Kachel-Scroll-Affordance ist seit D10 (#182) gefixt —
  diesen Teil streichen; dieselbe Utility auf die Schnellrechner-Chip-Zeile der Startseite
  anwenden, falls dort fehlend *(#57-Rest)*.
- **Flächen:** `Rechtsprechung.tsx`, `EntscheidFilter.tsx`. *(#27 geändert.)*

### J3 · Sachgebiets-Pipeline verfeinern — M · **Risiko-Pfad (QS-GP Pflicht)** ✅ gebaut 29.8.2026
- **Kern (Ur-Befund 11.7.):** 230/607 Entscheide (38 %) in «sozial-abgaben», Fehlklassierung
  BGE 150 II 300 (BGFA unter Steuern). Fix nur **deterministisch**; KEINE redaktionellen
  Einzel-Umklassierungen (wäre Fachkuration → Zeitsperre).
- **Umsetzung 29.8.2026 (Spec-Korrektur nach Ist-Messung, lebendige Spec):** Die Pauschale
  sass nicht im Band-II-Mapping, sondern im Abteilungs-Default `2A/2C/2D → sozial-abgaben`
  (53 Band-I- und 82 Band-II-BGE ohne Steuer-Signal im Topf). Gebaut: Default neu
  `oeffentlich`, `NORM_SIGNAL` + BGFA→öffentlich; **BV bewusst NICHT als Signal** (kippte
  echte Steuerfälle — §7-Abweichung, offengelegt); Bestands-Regen 119 Snapshots /
  237 Register-Wechsel (`scripts/normtext/remap-sachgebiet-j3.ts`; Gegenprüfungs-
  Runde 1 «widerlegt» → F1–F3 eingebaut, Runde 2 siehe Bibliothek); Badge/Titel «maschinell zugeordnet» im
  Entscheid-Leser + Listen (§8). Regelwerk + Quirks: `bibliothek/rechtsprechung/`
  `sachgebiet-klassierung-j3-2026-08-29.md`. Trennung «Steuern & Abgaben» von
  «Sozialversicherung»: NICHT gebaut → §Y (Taxonomie über Rechtsprechung UND /gesetze).
- **Rest-Posten (Bug-Check 29.8.2026, B2):** Signal-Quelle vereinheitlichen —
  Live-Import (schmale statutes) vs. Re-Map (volle normKeys) klassieren 29/214
  Scope-Fälle aus verschiedener Eingabe (Quirk Q-J3-8 der Bibliotheks-Doku);
  EINE deklarierte Quelle für beide Pfade wählen, dann Re-Map als Fixpunkt-Tor.
- **Flächen:** Erzeugungs-Pipeline `scripts/`, `register.json`, `browse.ts`. *(#23.)*

### J4 · «Neues vom Bundesgericht»-Karten — S–M
- **Kern:** `regesteKurz` wird bereits gerendert — leer sind nur Karten OHNE Regeste im
  Korpus (nicht-amtliche Entscheide). Bau: Abteilungskürzel→Rechtsgebiet-Badge
  (deterministisch mappbar), Datum-Dedupe (heute 3×), «Bundesgericht»-Fusszeile streichen;
  Fallback = zitierte Kernnormen aus dem Korpus. **NIE generierte Kurz-Résumés (§8).**
- **Flächen:** `NewsHeader.tsx`. *(#4 geändert.)*

### O4 · Kantons-Einstieg: Abdeckung ehrlich VOR dem Klick — S
- **Kern:** Erlass-Zahl-Badges an Karte/Kürzelleiste (G5/A14 liefern die Sortierung schon;
  Karte kennt «keine Erlasse» im aria-label) + Intro-Text ehrlich («Systematik, wo
  hinterlegt», §8). **Kantons-Karten-Rest** *(#15 — a11y-Kern am Code widerlegt:
  role/aria/tabIndex/Enter existieren, `SchweizKarte.tsx:64–71`)*: nur nach Prod-Repro —
  permanente Kürzel-Labels, Klick-Hitbox (pointer-events überlappender Pfade), Mobil-Default
  Liste.
- **Flächen:** `Gesetze.tsx`, `SchweizKarte.tsx`. *(#16 + #15-Rest.)*

### O2 · Sidebar-Konsistenz — S
- **Kern:** Einheitlich: Label navigiert IMMER (Rechner-Gruppen bekommen `ziel` →
  `/rechner#anker`-Übersichtsanker mitbauen), Chevron klappt; bei Navigation auto-expandieren.
  Davids Kommentar-Anweisung «Kategorien einklappbar» bleibt gewahrt. Chevron-Hitbox → R6.
- **Flächen:** `Sidebar.tsx`, `useSeitenleiste.ts`. *(#2.)*

### O5 · Scope-Labels der lokalen Suchfelder — S
- **Kern:** Jedes Browse-Filterfeld erklärt seinen Scope («Nur Erlass-Titel — Artikeltext
  über die Suche oben»); die grosse Sprung-Karte auf /gesetze ist seit A5 ein CTA auf die
  HeaderSuche (kein dritter Suchpfad) — nur Beschriftung des lokalen Felds bleibt.
- **Flächen:** Browse-Pages. *(#20/#43-Teil, teilwiderlegt → Rest 1-Zeilen-Fixe.)*

---

## §7 · Zusatzposten der Linsen (neu aufgenommen)

- **Kantons-Adressen ohne Segment-Wache (Gegenprüfung Intl-Routing 29.8.2026,
  Befund 1, VORBESTEHEND):** `/gesetze/<beliebig>/AG-291.150` rendert den
  Erlass statt zu leiten — `routenEbeneVonKey` kennt nur die 238 Bundes-Keys
  (ERLASS_REGISTER) und fällt für 1231 Kantons-Keys aufs URL-Segment zurück.
  Wurzel-Fix: Entscheid gegen das gebaute Browse-Manifest statt Register;
  danach Kanonik-Tor auf Kantons-Stichprobe ausweiten.

| ID | Posten | Aufwand | Einordnung |
|---|---|---|---|
| **Z1** | **ICS-/Kalender-Export des Frist-Ergebnisses** («Verjährung Forderung X: 31.03.2027» nach Outlook/Fristenkontrolle) — haftungsrelevanteste Lücke der Praxis-Linse; von der Produktvision explizit gedeckt («rechnen/drucken/ICS»). Ist-Stand zuerst erheben; Export «ohne Gewähr»-gelabelt (§8), reine UI-Ausleitung ohne neues Rechenrisiko. | S–M | eigene kleine Einheit nach N0 |
| **Z2** | **Print-CSS für Fundstellen** (Artikel-/Erwägungs-genauer Druck, Stand-Zeile + ELI im Ausdruck) — Kanzlei = Papier-/PDF-Akte; 755k-px-Seiten drucken heute mutmasslich katastrophal. Dockt an das gebaute U-PDF an (amtliches PDF = Ganz-Erlass; Z2 = Auszug). | S–M | Reader-Fläche, nach §0.2 |
| **Z3** | FR/IT-Kürzel-Aliasse in der Norm-Sprung-Suche | S | in **S2** eingefaltet |
| **Z4** | «Im Entscheid suchen» | — | in **V5** eingefaltet |
| **Z5** | Listen-Scroll-Restoration als Prüfpunkt | — | in **J1** eingefaltet |
| **Z6** | Korpus-Abdeckungsseite «Was ist drin» (global, aus Registern generiert) | S | in **S3/E1** eingefaltet |
| **E4** | a11y-Prüfauftrag: Skip-Link, Fokus nach Anker-Sprung, aria-live «✓ kopiert» | S–M | Prüfauftrag + Fixes, mit R6 |
| **G-SUCH** | **Suchindex indexiert Fussnoten + Tabellen mit** (Intake 17.7.2026, siehe §7b) | S | eigene Index-Einheit, Nähe **S4** |

---

## §7b · Intake G-SUCH — Suchindex ignoriert Fussnoten + Tabellen (David 17.7.2026)

> **Herkunft:** Recherche «Informations-Nutzung der Gesetze» (Auftrag David
> 17.7.2026). **Detailquelle (§11):**
> `bibliothek/normen/informations-nutzung-gesetze-2026-07-17.md`. Hierher verortet,
> weil **Index/Ranking-Fläche** (S4) — **getrennt** von den Extraktions-Risikopfad-
> Kandidaten G-REF/G-HIST (die liegen in `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`,
> §14 Ziff. 2).

- **Befund (deterministisch):** `scripts/such-index-generieren.ts`
  (`artikelText`, ~Z. 26–33 + Loop ~Z. 92–100) indexiert nur `b.text` +
  `items.text` + Marginalie + Gliederung. **Omittiert** Fussnoten-Text,
  Tabellenzellen (`mehrspaltig`), Füllpunkt-`tabelle`, `grundlage`, Bild-`alt`.
  Die **Korpus-Suche** (FlexSearch) findet damit keinen Text, der nur in
  Tabellen/Fussnoten steht; **In-Page-Ctrl+F ist unberührt** (§15).
- **Bau:** die omittierten Felder in `artikelText` (bzw. den Index-Eintrag)
  aufnehmen. Kleiner Schnitt, **kein Extraktions-Risikopfad** (reines
  Build-Artefakt, golden-neutral gegenüber der Engine). **Umfang:** S.
- **Bezug:** Eval-Harness **#251** (Umgangssprache-Recall 0.118) misst genau
  solche Recall-Lücken → dort als Regressions-Nachweis nutzbar.
- **🚧 Bau-GO ausstehend (David):** jederzeit ziehbar; Gate = `gate:schnell`
  (Index-Determinismus) + Recall-Beweis am Testset. Kein `QS-GP` nötig (kein
  Rechts-/Extraktions-Risikopfad), aber Index-Determinismus muss grün bleiben.

---

## §Y · David-Entscheide (NICHT autonom bauen — als 3-Zeilen-Fragen vorlegen)

0. **J3-Restfrage — «Steuern & Abgaben» von «Sozialversicherung» trennen?** *(29.8.2026)*:
   Ein Sachgebiet trägt heute beide (nach J3-Regen 1725 Einträge). Trennung = neues
   Rechtsgebiet in der geteilten Taxonomie (Rechtsprechung UND /gesetze, SSoT §5) —
   deterministisch machbar (8C/9C/Band V → Sozialversicherung; DBG/StHG-Signal → Steuern),
   aber Produktentscheid. Empfehlung: trennen, sobald der Kantons-Korpus wächst.
1. **A6-Präzisierung Werkzeug-Chip** *(#1+#45)*: matcht die Query einen Katalog-Titel stark,
   den EINEN besten Werkzeug-Treffer als Chip in die Sprung-Zeile heben — Gruppenordnung
   darunter unverändert. (A6-Rangfolge ist Davids Entscheid vom 5.7. — Präzisierung, kein Kippen.)
2. **Arbeitsmappe/Pinning** *(#60+#72)*: localStorage-Mappen (Stern «Merken», Export als
   Textliste) kollidieren mit der bewussten Dossier-Parkung — Richtungsfrage. Umfang-Vorschlag:
   localStorage-only, prominent «nur auf diesem Gerät» (Kanzlei-PC/Home-Office/Handy = drei
   getrennte Mappen — §8-Falle offen benennen). **«Hide»-Funktion gestrichen**
   (Vollständigkeits-/§8-Risiko bei einem Recherche-Tool).
3. **V3-Cockpit-Fragen in die wartende Abnahme-Mappe** *(#3-Umplatzierung, #9 Hero-Suche-
   Vereinheitlichung, #55 hide-on-scroll-Header)*: Startseite/Topbar sind W2·5c/Kopf-PR-
   Abnahme-Fläche — Optionen in `abnahme/startseite-v3/` legen, nicht vorab umbauen.
4. **Lese-Ergonomie-Toggles** Lesebreite/Zeilenabstand *(#79)*: Mechanik sauber
   (data-*-CSS, R6-byte-gleich), aber das «Ansicht»-Dropdown wurde zweimal per David-Entscheid
   umgebaut («keine Wucherung», §3.1) — zwei weitere Toggles nur mit Go.
5. **/suche-Ergebnisseite** *(S5)*: ~~additive Erweiterung des gerade fixierten A5/A6-Modells —
   kurzes Ja/Nein.~~ **ERLEDIGT 12.7.2026: Gate aufgehoben** (David 11.7. im Chat: «du hast bei
   allem was ich entscheiden muss selbst die wahl» → Orchestrator-Entscheid bauen), S5 gebaut +
   gemergt.
6. **Externe bger.ch-Chips im «Zitierte Entscheide»-Block** *(#24)*: der nackte Zähler ist
   dokumentierter VZUI-Entscheid (§0/1c: nur Korpus-Treffer als Chips, «keine grauen
   Nicht-Link-Chip-Reihen»). Eine Revision (externe Chips) wäre Entscheid-Änderung → Frage,
   nicht Bau. «Zitiert von» ist ohnehin VZUI-V2 (→ §X).

---

## §X · Hart gegated (Blocker ausweisen, nicht in Kurzfrist-Listen mischen)

| Vorhaben | Blocker | Verortung |
|---|---|---|
| **«Zitiert von»-Panel mit Facetten** *(#65; Shepard's/KeyCite-Rückrichtung, 8,5M Kanten liegen in masse.db)* | **VPS/E3-Serving** (David-Touchpoint netcup offen) | = **VZUI V2** (`FAHRPLAN-VERZAHNUNG-UI.md` §2.2/§3) — kein neuer Befund; einzig die Facetten-Idee (Jahr/Gericht-Counts) als Zeile in die V2-Spec ergänzen |
| **Fassungsvergleich/Zeitreise** *(#67; «Was galt am Vertragsdatum?» = Top-3-Kanzleifrage)* | (a) **Fedlex-P1a/b NICHT gemergt** (Regex-Loch, 18 Pins überholt — ein Fassungs-Dropdown darauf wäre §8-Bruch); (b) Gesetze-Update ruht bis David-Freigabe | Fedlex-Portfolio-Anschluss; Revisions-Timeline (Paket 5) ist gebaut, Fassungs-Dropdown + Artikel-Diff = echtes L-Vorhaben danach |
| **Status-Kopf Currency-Aussage** *(#68-Stufe 2: «Snapshot entspricht amtlicher Fassung vom …»)* | dasselbe P1a/b-Loch — vorher wäre es exakt das Schein-Geprüft, das §8 verbietet | Stufe 1 (Quelle+ELI+Stand) existiert; Currency-Sichtbarmachung in **A22/K-1** einfalten |
| **Facetten mit Masse-Counts** *(#71-Etappe 2)* | /suche-Seite (S5) + E3-Serving | in S5 als Etappe 2 geführt |

---

## §Z · Verworfen / Nicht bauen (explizit, mit Grund — verhindert Wiederkehr)

1. **Cmd+K-Command-Palette (Aktions-Gruppe)** *(#58)* — **kollidiert frontal mit
   David-Entscheid A5 (5.7.)**: `BefehlsPalette.tsx` wurde gelöscht, ⌘K fokussiert bewusst
   die normale Suchleiste («Palette entfällt als eigenes UI»). Eine Aktions-Gruppe im
   Dropdown wäre die Wiedereinführung durch die Hintertür. Nur mit explizitem neuen
   David-Entscheid.
2. **DOM-entfernende Virtualisierung von Normtext** *(Anteile von #19/#50)* — von
   **CLAUDE.md §15.1 explizit verboten** (content-visibility statt Windowing; Ctrl+F über das
   ganze Gesetz ist Juristen-Kernwerkzeug). Als Leitplanke hier festgehalten; A2 hat die
   Scroll-Proportionalität bereits repariert.
3. **Minimap/Lesefortschritts-Balken** *(#80 — Negativ-Befund übernommen)* — Evidenz schwach
   (UX Collective), «% gelesen» bei Normen semantisch sinnlos, §15-Scroll-Listener-Kosten.
   Orientierung leisten Scroll-Spy-TOC + A3-Breadcrumbs. **Nicht-Bauen-Notiz — nicht
   wiedervorlegen.**
4. **«Hide»/Treffer-Ausblenden** *(#72-Teil)* — Vollständigkeits-/§8-Risiko bei einem
   Rechtsrecherche-Tool; gestrichen.
5. **Breadcrumbs auf Hauptseiten** *(#61)* — am Code widerlegt: `InhaltsKopf` rendert
   `daten.breadcrumb`, A3 baute klickbare Gliederungs-Breadcrumbs im Reader. Rest
   (Vertiefung auf 3 Glieder) Nutzen gering — verworfen.
6. **Session-Restore für Split-View** *(#64)* — widerlegt: `usePaneLayout.ts` persistiert
   das Layout bereits in localStorage inkl. teilbarem `?p=`-Link (B-5). Falls die
   Restauration real nicht greift ⇒ **Bug-Report reproduzieren**, kein Feature.
7. **Kontinuierlicher Scroll-Hash-Sync in der URL** *(#13-Teil)* — kollidiert mit der
   empirisch begründeten A16-Architektur (manuelles pushState war der «widerlegte Irrweg»);
   Perf-/History-Falle. Teilbarkeit leistet R3 (Zitat+Permalink).
8. **Kontext-Block an den Kopf des Entscheid-Lesers verschieben** *(#29-Teil)* —
   dokumentierter VZUI-Entscheid §0/1d (alles am Fuss, Regeste oben); nur der
   Navigations-Rail (V5) ist zulässig.
9. **Sektionsreihenfolge der Universalsuche umdrehen** *(#1-Rohvorschlag)* — überschreibt
   A6 (David 5.7.); zulässiger Weg = §Y-Frage 1 + Kappung in S5.
10. **Teil-Dokument öffnen (nur eine Abteilung/ein Titel statt des ganzen Erlasses)**
    *(Design-Review-Benchmark B8, 29.8.2026)* — **David-Entscheid 29.8.2026, Frage 9:
    «nein».** Der Vorschlag stammte aus dem Benchmark gegen fremde Portale, die grosse
    Erlasse stückeln, weil ihr Volltext nicht performant ist. LexMetrik hat dieses
    Problem nicht: TOC und Volltext stehen gleichzeitig, und Ctrl+F über das GANZE
    Gesetz ist Juristen-Kernwerkzeug (dieselbe Begründung wie Ziff. 2 oben,
    CLAUDE.md §15.1). Ein Teil-Dokument wäre zudem eine zweite Adressierung desselben
    Erlasses neben `/gesetze/<ebene>/<key>#anker` — also eine zweite Wahrheit über den
    Ort (§5). **Nicht-Bauen-Notiz — nicht wiedervorlegen.** Wortlaut-Nachweis der
    Entscheid-Mappe: `fahrplaene/FAHRPLAN-DESIGN-WAERME.md` §7.

---

## §S · Stand 4.8.2026 — Reader-Kette gelandet (Orchestrier-Session bauplan-review-095048)

Gebaut und auf main (je EIN Opus-Bauer + unabhängiger §9-Bug-Check, teils Fix-Schleifen):
**VR** #432 (V3 Kurztext-Popover + V5 Erwägungs-Rail; Esc-Fokus/aria-Wurzelfix) ·
**R1** #429 (In-Gesetz-Suche/Quickjump/Sheet; Blocker «Geister-Fundstellen» + §8-Fussnoten-Zähler
im Check-Zyklus behoben, RV6 via MutationObserver) · **R2** #431 (R3-ELI-Zitat, R5-Rücksprung,
R7-Skeleton; vier Wurzel-Fixes: toter Anker, setInterval-Aushungerung→rAF, Chip-Clobber,
font-medium-CLS [behob main-Vorbestand 0.0017]) · **R3** #436 (R4-Weiterlesen-Persistenz +
R8-j/k/«?»; Fremdfund B5 aus #429 geheilt) · **R4** #428 (Tap-Ziel-Token + F9) · **Z** #434
(Z1-Rest Tagerechner-ICS mit UID-Diskriminator, Z2-Print-Wurzelfix — Ausdrucke waren ohne
Titel/SR/Stand/Banner) · **URL** #437 (LM-202: Scroll-Sync existierte nie [Bestand hatte ihn in
§Z Ziff. 7 verworfen — vom Entscheid bestätigt]; gebaut wurde die fehlende Teilen-Hälfte).

**Offene David-Frage (aus Z):** ICS ohne `TRANSP:TRANSPARENT` — Ganztages-Fristeintrag blockt
in Outlook/Google den Tag als «beschäftigt»; Änderung bricht Golden-Anker `allg:ics` ⇒
deklarierte Darstellungsänderung mit Test-Anpassung (§6.3), eigener Schritt nur mit David-Go.

**Verbleibende Fundstellen für spätere Batches:** Link-/Zitat-Knopf-Trefferfläche 21×13 px →
B11 (K-09b) · `EntscheidBody.tsx:104` handgerollter Adress-Schreiber ohne Pane-Wächter
(Vorbestand, LM-202-Randfall) · Split-View-Verdacht «Sheet ohne aria-modal im Pane → j/k-Guard
trifft nicht» (unreproduziert, PR-#436-Body) · Skip-Link-Höhe + stumme «✓ kopiert»-Ansage im
Gesetzes-Leser → B10 (PR-#428-Body).

## §Q · Benchmark-Belege (Muster-Quellen der Recherche)

- **Westlaw Precision:** History/Research Trail (thomsonreuters.com Hilfe «Searching/History»;
  guides.library.law.ua.edu), Folders (Hilfe «Folders in Westlaw»), Copy with Reference
  (Quick Reference Guide, pds.wv.gov), KeyCite-Flags (legal.thomsonreuters.com) → O1, R3,
  §X-Status/Zitiert-von.
- **Lexis/Shepard's:** Shepard's Report mit Gericht/Jahr-Facetten
  (supportcenter.lexisnexis.com) → VZUI-V2-Spec-Ergänzung.
- **swisslex:** Inline-Verlinkung ~40 Kanten/Dokument (swisslex.ch/de/product/features) → V2/V3.
- **beck-online:** Fassungsvergleich bei Normen (offizielles Tipps&Tricks-Video) → §X-Zeitreise.
- **Wikipedia Page Previews:** A/B 2017/18 (+31 % Interaktionen, <0,04 % Abschaltung;
  mediawiki.org) → V2 Hover-Delay-Muster.
- **entscheidsuche.ch:** hierarchische Facetten mit Hit-Counts (github.com/entscheidsuche) → S5-Etappe 2.
- **NN/g:** Breadcrumbs-Guidelines, Table-of-Contents-Guide (Sichtbarkeit als Hauptrisiko →
  R2), Local Navigation, Saving Scroll Position (→ R4), Scrolling & Attention (→ §Z-3).
- **legislation.gov.uk:** Nutzerforschung Menge+Verschachtelung, Accessibility-Zusagen
  (line-height) → R2/§Y-4.
- **WCAG 2.5.8** Target Size Minimum 24 px → R6.
- **Superhuman/Mobbin/uxpatterns.dev** Command-Palette-Muster → geprüft und **verworfen** (§Z-1).

---

## §R · Empfohlene Bau-Reihenfolge (Praxis-Hebel × Machbarkeit, kollisionssortiert)

| Rang | Einheit(en) | Aufwand | Kollision | Gate-Besonderheit |
|---|---|---|---|---|
| 1 | **N0a–N0d** Quick-Wins ✅ (11.7.) | je S | keine | reine UI, `gegenpruefung: n/a` — **gebaut+belegt** |
| 2 | **S1 · S2 · S3 · S6** Suche-Kette Kurzteil | S/M/M/S–M | `src/components/suche`, `src/lib/suche` | e2e norm-sprung + universalSuche.test (A6-Kontrakt) |
| 3 | **O1** Verlauf-Initiative (+Tracker-Label sofort) | M | zuletztVerwendet/Topbar | §8 «nur auf diesem Gerät» |
| 4 | **V1 · V4 · V6** Verzahnung datenarm | M/S/S–M | KontextPanel/Registry | V1-Datenlage zuerst erheben |
| 5 | **J1 · J2 · J4 · J5 · O4 · O2 · O5** Rechtsprechung/Übersichten | S–M | Rechtsprechung-Pages | J1-Scroll-Restoration-Prüfpunkt |
| 6 | **S4** Ranking ✅ (12.7.) · **J3** Sachgebiets-Pipeline | M–L / M | Suchindex / scripts | S4 Query-Testset **gebaut+grün**; **J3 = QS-GP** |
| 7 | **R1–R7 · V2 · V3 · V5 · Z2 · E4** Reader-Welle | S–M je | parts/inhalt/ArtikelBody/index.css | **hart hinter A20–A25** (§0.2); golden byte-gleich je Einheit |
| 8 | **S5** /suche (+Facetten E2) ✅ (12.7.) · **Z1** ICS | L / S–M | Routen/Manifest | S5 = David-Go **aufgehoben+gebaut** (§Y-5) |
| 9 | **R8** j/k · **W2** Beispiel-Chips | S–M / M | Reader / Rechner-Forms | **W2 = gegenpruefung je Preset** |

**W2 (Beispiel-Chips, #35):** `BeispielChips` ist BEREITS gemeinsamer Baustein
(`vorlagen/ui.tsx`) — nichts extrahieren, nur PRESETS je Rechner definieren; jedes Preset
mit Norm+Link belegen (Daueranweisung doppelt-verifizieren) → deshalb Rang 9 mit
Gegenprüfungs-Auflage trotz kleinem Diff.

---

*Erstellt 11.7.2026 (Synthese-Architekt, Ultracode-Recherche). Verdikt-Grundlage: 3
Kritik-Linsen mit Repo-Spot-Checks auf main@952146e1; Beobachtungs-Vintage teils
main@38e1300c− → §0.1 gilt vor jedem Schnitt.*

---

## §8 · ROADMAP-Spec W2·10-UI-NAV (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: §0–§7b und «§R · Empfohlene Bau-Reihenfolge» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  Priorisierter UI-Verbesserungs-Plan aus 60 empirischen Befunden + 3 Kritik-Linsen
  (david-treue · repo-realität · praxis-nutzen; Bilanz 44 übernommen / 32 geändert / 4
  verworfen): Quick-Win-Paket «tote Rückwege/Anker/Key-Normalisierung» → Suche-Kette
  (Query-Durchreichung `?q=` · BGE-Zitations-Direktsprung + §8-«nicht im Bestand» ·
  Dropdown-Ehrlichkeit/Enter-Puffer/Meinten-Sie · Ranking-Kernerlasse · /suche-Seite
  [David-Go] · Mobil-Fokusmodus) → Verzahnungs-Politur (Artikel↔Werkzeug-Map beidseitig,
  Hover-Preview am NormPopover, Leitfall-Regeste-Popover, Erwägungs-TOC) → Reader-/
  Wiedereinstiegs-Welle (In-Gesetz-Highlight, Mobile-Gliederung+Quickjump, Zitat+Permalink,
  Weiterlesen-Chip, Verlauf-Initiative, Tap-Target-Pass) → Rechtsprechungs-/Rechner-Politur
  (Pagination, Mobil-Filter, Sachgebiets-Pipeline [Risiko → `QS-GP`], News-Karten). Leitthema
  «gebaut ≠ gefunden». **Vor jedem Schnitt Prod-Re-Audit** (Befund-Vintage teils vor den
  Merges 10./11.7.); Reader-Flächen **hart HINTER die offenen A20–A25**; 6 Posten =
  David-Entscheid (A6-Werkzeug-Chip · Arbeitsmappe · V3-Cockpit-Fragen · Lese-Toggles ·
  /suche-Go · Zitiert-Chips); hart gegated: Zitiert-von=VZUI-V2 (VPS), Fassungsvergleich
  (Fedlex-P1a/b + Freigabe). Verworfen mit Grund (Command-Palette [A5-Entscheid],
  Normtext-Virtualisierung [§15.1], Minimap, Scroll-Hash-Sync u. a.).
  Detail: diese Datei. Trailer `Roadmap: W2·10-UI-NAV`.
  **Teillieferung 12.7.2026 (`fix/suche-aktivindex-race`):** Such-Dropdown-Race gegen die deferred Artikelgruppe an der Wurzel geschlossen (stabiler Treffer-Key `trefferAuswahl.ts`). Wortlaut → `ROADMAP-CHRONIK.md` → W2·10-UI-NAV (26.7.2026).
  **Stand 11.7.:** Einheit **N0 (Quick-Win-Paket, N0a–N0d) ✅ gebaut+belegt**; Rest der Kette (Suche S1–S6 …) offen. Wortlaut → `ROADMAP-CHRONIK.md` → W2·10-UI-NAV (26.7.2026).
  **Mess-Werkzeug 16.7. (advisory, kein Gate):** `npm run eval:suche` (`scripts/suche-eval.ts` +
  Gold `scripts/suche-eval-gold.json`, 69 verifizierte Paare) misst die ECHTE Produkt-Suche
  deterministisch/LLM-frei (Recall@1/5/10·MRR·NDCG@10 je Klasse) — ruft die Produktions-Pipeline
  (Sprung-Parser + FlexSearch-Recall + `artikelRanking`), kein Parallel-Index (§5). Baseline
  16.7. (`bibliothek/werkzeuge/suche-eval-baseline-2026-07-16.md`): Rang-1-Zitate stark
  (normzitat/bge 0.83), **umgangssprachliche Mehrwort-/Kompositum-Fragen = grösste Lücke**
  (Recall@10 0.18) → priorisiert die S-Kette (Dekompositions-/Synonym-Hebel · FR/SR-Alias
  Cst/LDIP im Norm-Sprung). Vorher-Stand für jede künftige Recall-/Ranking-Änderung.

### Teilschritt-Spezifikation W2·10-UI-NAV (verschoben 31.7.2026)

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026, Nachhalte-Konvention*
*Ausführungs-Protokoll Ziff. 6). Die ROADMAP führt je Teilschritt nur noch Checkbox,*
*`@meta` und einen Einzeiler; der Wortlaut unten ist die massgebliche Fassung.*

**Schnitt-Begründung (Session-Granularität AP-6) — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Session-Granularität (AP-6, 31.7.2026):** N0a–N0d, S2–S5, V1 und O1 sind gebaut; der offene Rest
  (25 Einheiten) ist unten in elf session-grosse Teilschritte gebündelt — geschnitten nach Datei-Fläche
  entlang der Fahrplan-Blöcke §2/§3/§4/§6/§7 und der Rangfolge §R, dieser Schritt bleibt das Dach.
  **Jeder Teilschritt erbt `dep: [W2·5d]` vom Dach** — die §0.2-Sequenzierung («Reader-Flächen hart
  HINTER den A-Restposten») wird hier nicht gelockert. **Bewusst NICHT als Teilschritt:** `G-SUCH`
  (Bau-GO David ausstehend), die 6 §Y-Entscheid-Posten und die 4 §X-gegateten Vorhaben.

**Ursprünglicher Wortlaut der Teilschritt-Bullets — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  - [ ] **UI-NAV-S · Suche-Rest (S1 + S6)** — Query-Durchreichung `?q=` in die Browse-Pages + mobiler Such-Fokusmodus (≥16 px gegen iOS-Zoom). Detail: diese Datei §2. Trailer `Roadmap: W2·10-UI-NAV-S`.
  - [ ] **UI-NAV-V · Verzahnung ohne Reader-Fläche (V2 + V4 + V6)** — Hover-Trigger am bestehenden NormPopover · NormChip-`href` intern (Cmd-Klick landet intern) · Vorlage↔Rechner-Kreuzlinks. Detail: diese Datei §3. Trailer `Roadmap: W2·10-UI-NAV-V`.
  - [ ] **UI-NAV-VR · Verzahnung auf Reader-Fläche (V3 + V5)** — Regeste-Popover am KantenChip + Erwägungs-Navigation im Entscheid-Leser; `parts.tsx`-Kollisions-Precheck Pflicht (§0.2). Detail: diese Datei §3. Trailer `Roadmap: W2·10-UI-NAV-VR`.
  - [ ] **UI-NAV-R1 · Reader: Finden im Gesetz (R1 + R2)** — In-Gesetz-Suche mit Treffer-Highlight + mobile Gliederung als Bottom-Sheet mit «Sie sind hier». Detail: diese Datei §4. Trailer `Roadmap: W2·10-UI-NAV-R1`.
  - [ ] **UI-NAV-R2 · Reader: Zitieren und Zurückspringen (R3 + R5 + R7)** — zitierfähige Referenz mit Permalink · Rücksprung-Chip-Restscope · Deep-Link-Skeleton «Springe zu Art. X …». Detail: diese Datei §4. Trailer `Roadmap: W2·10-UI-NAV-R2`.
  - [ ] **UI-NAV-R3 · Reader: Weiterlesen und Tastatur (R4 + R8)** — Positions-Persistenz «Weiterlesen bei Art. X» + Tastatur-Navigation j/k mit «?»-Overlay (R8 = niedrigste Priorität der Reihe). Detail: diese Datei §4. Trailer `Roadmap: W2·10-UI-NAV-R3`.
  - [ ] **UI-NAV-R4 · Trefferflächen und a11y (R6 + E4)** — Tap-Target-Sammelticket mit Token-Regel ins `DESIGN-REGLEMENT.md` + a11y-Prüfauftrag der Linsen. Detail: diese Datei §4/§7. Trailer `Roadmap: W2·10-UI-NAV-R4`.
  - [ ] **UI-NAV-J · Rechtsprechungs-Seiten (J1 + J2 + J4)** — Browse-Liste mit Batching und Band-Sprungleiste · Mobil-Filter als Bottom-Sheet · «Neues vom Bundesgericht»-Karten. Detail: diese Datei §6. Trailer `Roadmap: W2·10-UI-NAV-J`.
  - [ ] **UI-NAV-J3 · Sachgebiets-Pipeline verfeinern (J3)** — **bewusst allein**, weil Risiko-Pfad: `QS-GP` Pflicht + golden byte-gleich, eigene Gegenprüfungs-Runde. Detail: diese Datei §6. Trailer `Roadmap: W2·10-UI-NAV-J3`.
  - [ ] **UI-NAV-O · Übersichten und Sidebar (O2 + O4 + O5)** — Sidebar-Konsistenz · Kantons-Einstieg mit Abdeckung vor dem Klick · Scope-Labels der lokalen Suchfelder; alle drei S. Detail: diese Datei §6. Trailer `Roadmap: W2·10-UI-NAV-O`.
  - [ ] **UI-NAV-Z · Zusatzposten Ausleitung (Z1 + Z2)** — ICS-/Kalender-Export der Fristergebnisse + Print-CSS für Fundstellen; Ist-Stand vor dem Bau erheben. Detail: diese Datei §7. Trailer `Roadmap: W2·10-UI-NAV-Z`.

### Dach-Prosa W2·10-UI-NAV im Wortlaut (verschoben 31.7.2026) *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026); massgebliche Fassung.*

>   Priorisierter UI-Verbesserungs-Plan aus 60 empirischen Befunden + 3 Kritik-Linsen — Suche, Navigation
>   und Auffindbarkeit über alle Oberflächen, reine Darstellungsschicht (§3), keine Rechtslogik.
>   **Detail:** diese Datei §8. Trailer `Roadmap: W2·10-UI-NAV`.


---

### §8-N · ROADMAP-Spec W2·10-UI-NAV — Nachzug (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Welle 2, Schritt `W2·10-UI-NAV` — AP-11 rückwirkend angewandt
(ROADMAP-Diät Welle 3, 4.8.2026). Der Wortlaut unten entstand nach Anlage von §8 (31.7.2026)
und ist darum die jüngere Fassung. In der ROADMAP bleiben Titel, `@meta`, der steuernde
Kurzabsatz, die Teilschritt-Einzeiler und der Pointer hierher. Steuert nicht — Spec-Heimat.
**→ Bau-Spec: §0–§7b und «§R · Empfohlene Bau-Reihenfolge» dieser Datei.***

  **`dep`-Korrektur 3.8.2026:** §0.2 des Fahrplans sequenziert nur die **Reader-Flächen**
  (`parts.tsx`/`inhalt.tsx`/`ArtikelBody.tsx`/`index.css`) hart hinter die A-Restposten von `W2·5d`
  und nennt Suche-/Rechtsprechungs-/Sidebar-Einheiten ausdrücklich «weitgehend kollisionsfrei und
  zuerst schneidbar». Die Teilschritte **-S · -V · -J · -J3 · -O** trugen trotzdem `dep: [W2·5d]`
  und standen damit hinter einem Dach-Schritt, dessen offener Rest (EID-3, Härtung) sie gar nicht
  berührt — die dep ist dort gestrichen. Reader-Flächen (**-VR · -R1 · -R2 · -R3 · -R4 · -Z**)
  behalten sie. **Diät Welle 2 (4.8.2026):** diese sechs Teilschritte sind erledigt und stehen
  samt `-URL` wörtlich in [`ROADMAP-CHRONIK.md`](../ROADMAP-CHRONIK.md) → «Umschichtung 4.8.2026»;
  hier bleiben nur die offenen **-S · -V · -J · -J3 · -O**.

### §S-N · ROADMAP-Spec `QS-UI-HIGHLIGHT` — Bau-Spec im Wortlaut (verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Querschnitt-Band, §14-Intake 4.8.2026. In der ROADMAP bleiben Titel,
`@meta`, der Anlass und der Pointer auf §S. Steuert nicht — Spec-Heimat.*

> Highlight-Name je Pane/Leser-Instanz, alle drei Schreiber umstellen; Beweis: beide Suchen gleichzeitig markiert. Reine Darstellung.

---

## §9 · ROADMAP-Spec `QS-UI-HIGHLIGHT` — `::highlight()`-Registry je Leser-Instanz

*Angelegt 5.8.2026 (Bauplan-Review 4.8.2026, Befund B1). Der ROADMAP-Anker zeigte bis dahin
auf §S — das ist eine Stand-Chronik und trägt keine Bau-Spec; §S-N hält nur den ROADMAP-Wortlaut.
Dieser § ist die Bau-Spec. Reine Darstellung (`Gegenpruefung: n/a`).*

### §9.1 Befund (Bug-Check zu PR #432, Befund B3)

Die CSS Custom Highlight API führt ihre Registry **global am `CSS.highlights`-Objekt**, nicht am
DOM-Knoten. Im Repo existiert genau **ein** Highlight-Name `lc-such-treffer`, und **drei**
unabhängige Schreiber setzen ihn:

- `src/pages/gesetz-leser/inhalt.tsx` (In-Gesetz-Suche, R1)
- `src/pages/entscheidLeserRegeln.ts`
- `src/pages/EntscheidLeser.tsx` (dritter Schreiber, mit #432 dazugekommen)

Jeder Schreiber ruft `CSS.highlights.set('lc-such-treffer', …)` mit **seinen** Ranges und
überschreibt damit die Ranges der anderen. Im **Split-View** ist das direkt sichtbar: jeder
Tastendruck im Rail-Suchfeld löscht die Markierung des Nachbar-Panes — **gemessen 190 → 1 Ranges**.
Es ist ein **Vorbestand** (zwei Schreiber genügten bereits), den der dritte Schreiber verschärft
hat, weil Split-View die beiden Leser erst gleichzeitig sichtbar macht.

### §9.2 Bau-Ziel — zwei gangbare Wege, Wahl beim Bau

Die Registry muss aufhören, ein globaler Einzelplatz zu sein. Beide Wege lösen das; welcher
gewählt wird, entscheidet die bauende Session am Code (die Entscheidung ist hier **bewusst offen**,
weil sie von der Lebensdauer der Leser-Instanzen abhängt, die erst im Bau messbar ist):

1. **Registry je Leser-Instanz.** Jede Leser-Instanz hält ihre eigene Highlight-Registrierung und
   räumt sie beim Unmount ab. Sauberste Kapselung, verlangt aber einen Instanz-Träger (Context
   oder Ref), den heute nicht alle drei Schreiber haben.
2. **Instanz-namespaced Keys.** Der Highlight-Name bekommt einen Instanz-Diskriminator
   (`lc-such-treffer-<paneId>`), die CSS-Regel `::highlight()` wird entsprechend je Pane erzeugt
   bzw. auf die Namensfamilie gezogen. Kleinerer Eingriff, dafür muss das Abräumen verwaister
   Namen explizit passieren, sonst wächst die globale Registry über die Session.

Unabhängig vom Weg gilt: **alle drei Schreiber werden umgestellt** — bleibt einer global, ist der
Bug nur verschoben. Amtliche Substanz und Trefferlogik bleiben unangetastet; geändert wird
ausschliesslich, **wo** die Markierung registriert wird.

### §9.3 Fertig, wenn

- **Split-View-Beweis:** In zwei gleichzeitig sichtbaren Panes sind beide Suchen markiert;
  Tippen im Rail-Suchfeld des einen Panes lässt die Markierung des Nachbar-Panes **unverändert**
  (Range-Zahl vorher/nachher gleich, nicht 190 → 1).
- **Scheiterns-Fähigkeit einmal gezeigt (§6.7):** ein Test bzw. e2e-Fall, der auf dem Stand VOR
  dem Fix rot ist (er misst die Range-Zahl des Nachbar-Panes nach einem Tastendruck) und danach
  grün — ein Tor, das nicht scheitern kann, ist gefährlicher als keines.
- Alle drei Schreiber umgestellt, keine verwaisten Registry-Einträge nach Unmount.
- Golden byte-gleich (reine Darstellung, keine prerenderte Fläche berührt).
