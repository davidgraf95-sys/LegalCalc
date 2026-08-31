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

**Verworfen/kein Befund:** Leerzustand-Wortlaut «gefunden» vs «erfasst» (bedeutungstragend) ·
H1-Schriftstimmen (Zwei-Stimmen-Regel) · `rounded`=`rounded-sm` (latent, via tailwind-Default
mitgefixt) · SachgebietKacheln lg: (ohne Sichtschaden, Runde 2 prüfen).
**Nebenfunde für andere Stränge (nach Landung PR #595 in den Plan buchen):** BMV
«Nachfolge-Erlass = gleiche SR» (§7-Datenfrage Korpus) · Zählparität 1'458/201+1'231/227
(§8, Cowork-32-Familie) · toter `uebersichtsZeile`-Code mit hartem «SR» (Rückbau) ·
~~`PaneKopf.stand` unerreichbar~~ — FALSIFIZIERT durch BAU-6 (31.8.): erreichbar auf 11 pdf-embed/nur-live-link-Erlassen (EMRK, DSGVO …), dort einzige Stand-Angabe des Panes; bleibt, neu bewacht (`ortsAngabe.test.tsx`).
