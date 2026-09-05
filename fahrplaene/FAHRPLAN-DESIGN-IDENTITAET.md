# FAHRPLAN — Design-Identität: nicht aussehen wie jede andere Claude-Seite (Auftrag David 5.9.2026)
<!-- @lagebild name: Design-Identität · zweck: LexMetrik bekommt eine eigene Farb- und Schrift-Handschrift, damit es nicht wie die übliche Creme-Gold-Juristenseite aussieht. -->

> **ROADMAP-Schritt:** `W2·24-DESIGN-IDENTITAET` (`feld: design`).
> **Anlass (David 5.9.2026):** legaldeadline.ch/methodik — «wahrscheinlich auch von claude erstellt
> und sieht sehr ähnlich aus, wie lexmetrik. was können wir machen um designtechnisch nicht so
> auszusehen?» · Entscheid David: «ja, leg den schritt an und mach die varianten nach der landung»
> (nach der Landung von `W2·23-STARTSEITE-V4`).

## §1 · Befund und Ziel (`W2·24-DESIGN-IDENTITAET`)

**Befund (ausgelesen 5.9.2026, legaldeadline.ch):** `--canvas #f7f5f0`, `--paper #fdfcfa`,
`--gold #8b6914`, `--navy #0a1220`, Inter, Overlines in Gold-Versalien mit weitem Tracking,
Brotkrumen, `--radius .75rem/1rem`, Schatten-Skala. LexMetrik: `--paper #FCFAF6`, `--brass-700
#826225`, `--ink-900 #1C1A15`, Geist, `.lc-overline` Versalien 0.12em, `rounded-2xl`-Karten.
**Dieselben drei Signaturen:** Creme+Gold · Gold-Versal-Etiketten · weiche Karten auf Pastell.

**Ziel:** Eine eigene, wiedererkennbare Handschrift, die die inhaltliche Tiefe (amtliche Quellen,
verzahnt) zeigt statt Rechner-Optik. Umsetzung als **Token-Tausch** in `src/index.css`
(`:root` + `html.dark`) und `tailwind.config.js`, ohne Komponenten-Umbau; flip-reversibel.

**Grenzen:** Kontrast-Tore (`check:farbwelt`, axe, APCA-Protokoll wie `abnahme/startseite-v3/
KONTRAST-PROTOKOLL.md`) grün; Normtext-Körper farbfrei (§13); keine Rohwerte in Komponenten;
Golden byte-gleich (Token-Schicht berührt keine Ausgaben); Schrift-Lizenzen offen (OFL) und
`check:lizenzen` grün; Bundle-Budget (`check:perf-budget`) für zusätzliche Webfonts prüfen.

## §2 · Die fünf Hebel (Vorschlag 5.9.2026, Reihenfolge = Wirkung)

1. **Farbwelt kippen:** kühles, fast weisses Papier; EINE tiefe Akzentfarbe aus der Schweizer
   Amtswelt (Kandidaten: dunkles Bundes-Rot · tiefes Tannengrün · Schiefer-Blau), sparsam als
   Linie/Aktivmarke; Grau-Tinte statt Braun-Tinte. Brass bleibt höchstens im Siegel.
2. **Etiketten ohne Versalien:** `.lc-overline` → kleine, nicht-versale Zeile (fett oder kursiv),
   Tracking normal. Ein Token/eine Klasse, wirkt site-weit.
3. **Kanten statt Kissen:** Radien auf `--radius-sm` (≤ 4 px), Trennung über Linien statt
   Flächen-Tönung; Schatten nur für schwebende Ebenen (Menüs, Dialoge).
4. **Text-Schrift mit Charakter:** Serife (OFL: Source Serif 4 · Literata · Newsreader) für
   Normtext und Entscheide (`DESIGN-REGLEMENT-NORMTEXT.md` nachziehen), Grotesk nur für
   Bedienelemente. Lesemass (CPL, Zeilenhöhe) neu messen.
5. **Ein Marken-Motiv:** Siegel + Skalenstrich als einziges wiederkehrendes Zeichen, in der
   neuen Akzentfarbe (Logo.tsx, Aktivmarke Sidebar).

## §3 · Vorgehen

1. **Varianten-Bilder (nach Landung W2·23):** drei Varianten (je Hebel 1 mit anderer
   Akzentfarbe, Hebel 2–3 überall gleich, Hebel 4 in zwei von drei) als Token-Overrides in einem
   Worktree; Screens «/» und ein Gesetzes-Leser @1440 hell + dunkel, @390 hell → `abnahme/
   design-identitaet/variante-{a,b,c}-*.png`. **David wählt** (Sichtentscheid, kein Jules).
2. **Umsetzung** der gewählten Variante: Token-Tausch, Kontrast-Protokoll, Reglement-Nachzug
   (`DESIGN-REGLEMENT.md` Token-Abschnitt, `.claude/rules/design.md`), `STRUKTUR.md`-Karte.
3. **Wächter:** `check:farbwelt`/`check:design-tokens` bleiben; kein neues Tor ohne Rot-Probe.

## §4 · Kollisionen

`W2·11-DESIGN` (Design-Wärme, geparkt) baut auf der Brass-Welt auf — wird durch diesen Schritt
inhaltlich abgelöst; bei Umsetzung Fahrplan-Wärme prüfen und Doppelungen in die Chronik.
`W2·19-DESIGN-KONSISTENZ` (gelandet 5.9.2026) hat `--z-*`/`--auf-sage` in `index.css` — additiv
respektieren.
