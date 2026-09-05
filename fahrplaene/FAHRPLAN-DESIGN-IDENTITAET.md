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

## §5 · Freigabe David 6.9.2026 — Zielbild «Sammlung» (bindend für den Bau)

**Wortlaut David (6.9.2026):** «ja bau das, run till dry. achte darauf, dass alles sinn macht. bevor du
baust recherchiere nochmals was du dafür alles ändern musst damit es konsistent ist und dann lass
zwischen den runden einen ästhetikprüfer darüber schauen. es soll immer noch alles sinn machen mit
split screen usw. also überlege genau wie du es baust bevor du rein schiesst.»

**Referenzbild (massgeblich, statt Prosa):** `abnahme/design-identitaet/vorschlag-freigegeben.html`
(zwei Seiten: Startseite als Inhaltsverzeichnis, Gesetzesleser mit Bezügen am Rand). Bauen heisst:
die App auf dieses Bild bringen, nicht das Bild nachmalen — bestehende Bausteine, Engines, Daten,
Split-View-Mechanik bleiben; es ändert sich Darstellung (§3).

**System (aus dem Referenzbild):**
- Schrift: **Literata** (alles Gelesene: Normtext, Entscheide, Titel, Begrüssung) + **Archivo**
  (Bedienung, Marginalien, Meta) — beide OFL, self-hosted wie Geist heute (`@font-face`, kein
  Google-Fonts-Request zur Laufzeit; Budget `check:perf-budget` messen, Subsets latin/latin-ext).
  Geist/Geist Mono raus; Mono nur, wo es heute fachlich trägt (Rechenweg/Code), sonst Tabellenziffern.
- Farbe: Papier Weiss/Tinte fast Schwarz (hell) bzw. invertiert (dunkel); **vier stumpfe
  Registerfarben** als einzige Farbe: Gesetze `#1F3A5F`, Rechtsprechung `#7A1F2B`, Materialien
  `#4E6B3A`, Werkzeuge `#8A6A1F` (dunkel: aufgehellte Pendants). Brass verschwindet aus der
  Rollen-Schicht (`--accent-*` → Tinte bzw. Registerfarbe nach Domäne); Sage/Warn/Danger
  (Status-Semantik) bleiben. Kontrast AA nachweisen (`check:farbwelt`, axe).
- Form: Radien 0, keine Schatten ausser schwebende Ebenen (Menü, Dialog), kein `lc-glass`,
  Trennung über Linien (1 px `--rule-soft`, 2 px `--rule` für Kopfzeilen). Links unterstrichen.
  Overlines/Versal-Etiketten → normale kleine Grotesk-Zeilen (`.lc-overline` umdefinieren, nicht
  jeden Konsumenten anfassen; Versalien/Tracking weg).
- Layout: Satzspiegel mit **Marginalienspalte links** (150 px) auf Startseite und im Leser; im
  Split-View/Pane fällt die Marginalie unter `@3xl/pane` in die Textspalte (Zeilenform), damit
  zwei Panes nebeneinander weiter Sinn ergeben. Titelblatt-Zeile (Marke · Bereichs-Reiter ·
  Ausgabe-Zeile) ersetzt die Glas-Topbar; Seitenleiste bleibt als Inhaltsverzeichnis im Leser und
  in den Bereichsübersichten, auf «/» entfällt sie (Reiter tragen die Bereiche).
- Sprache: keine Slogans, keine Nutzenversprechen («an einem Ort», «verzahnt» als Behauptung);
  Bezeichnungen, Zahlen mit Scope, Verben. Wikipedia «Signs of AI writing» als Negativliste.
- Bezüge im Leser als Randnotizen rechts (Entscheide · Materialien · Verweise · Rechnen) — aus
  der bestehenden Verzahnungs-Datenquelle, keine neue Logik.

**Runden (jede Runde: Bau → Ästhetik-Prüfer (read-only, Screens aus dem Worktree-Preview, hell +
dunkel, 1440 + 390, Split-View mit zwei Panes) → Nachbesserung; Landung EINE PR am Schluss):**
Die konkrete Rundenliste mit Dateien steht in §6 (Inventur-Ergebnis).
