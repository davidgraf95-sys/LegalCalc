# FAHRPLAN-DESIGN-WAERME — Farbklima, Wärme, Atmosphäre, Typografie
<!-- @lagebild name: Design & Atmosphäre · zweck: Wärmeres, ruhigeres Erscheinungsbild — Token-Schicht, dann Anwendung. -->

Stand: 11.7.2026 · Auftrag David (wörtlich): «ultracode recherche zu design und plan
erstellen. also hinsichtlich farbe und wärme und so weiter» + «direkt umsetzen wenn
plan vorliegt». ROADMAP-Schritt **W2·11-DESIGN**. Trailer `Roadmap: W2·11-DESIGN`.

Quelle: Ultracode-Recherche 11.7.2026 — 48 Befunde (24 empirische Mess-Befunde am
Live-Stand + 24 Forschungs-Befunde: Anthropic/Claude-System, Flexoki, Radix, Stripe,
iA Writer, OKLCH/Evil Martians, APCA, Lesbarkeits-/Dark-Mode-Literatur), adversarial
durch 3 Kritik-Linsen (reglement-treue · umsetzbarkeit · geschmacks-kohärenz)
gegengeprüft. Kernsatz der Kohärenz-Linse: **Die Forschungs-Schicht IST der Plan,
die Mess-Befunde sind ihre Symptomliste — System vor Symptom**, sonst entstehen zwei
konkurrierende Wärme-Kanäle (Patchwork).

**Achtung Befund-Vintage:** Teile der Messungen datieren vor den Merges vom
10./11.7. (C-1/C-2/C-3 Farb-Wörterbuch, #201). Vor jedem Bau-Schnitt den betroffenen
Ist-Stand am Prod/HEAD **re-verifizieren** (Muster W2·10-UI-NAV) — z. B. die
Currency-Chip-Tonung sage/warn (Befund 7) ist durch C-2 bereits gebaut.

---

> Erledigt-/Stand-Abschnitte vom 14.8.2026 nach `archiv/FAHRPLAN-ERLEDIGT-ABSCHNITTE.md` verschoben (QS-PLAN-EINFACH).

## 0 · Fixpunkte (unantastbare Anker)

1. **`--paper` hell `#FAF8F2` / dunkel `#16150F` sind FIXPUNKTE.** Alle Bewegungen
   relativ dazu; die color-mix-Rezept-Architektur (alles hängt an `--paper`/`--ink-900`)
   bleibt der EINE Wärme-Steuerhebel.
2. **Farb-Wörterbuch C-1/C-2/C-3 (11.7.) ist semantischer BESTAND:** brass=Norm/
   Marke/Wortlaut-Referenz, slate=Entscheid, sage=Materialien + Currency «geltend
   geprüft (maschinell)», warn=Vorbehalt. Jede Wärme-Massnahme trägt es, keine
   stürzt es. Die gemessenen Kontraste vom 10./11.7. (slate 4.81/3.47 · warn
   5.24/9.43 · brass 4.91/10.48) sind **Regressions-Referenz** — nach jeder
   Token-Verschiebung neu messen und in `DESIGN-REGLEMENT-NORMTEXT §4b-B`
   nachziehen (D3/F6: dokumentierte Zahlen dürfen nie stillschweigend falsch werden).
3. **golden byte-gleich** für Normtext/Dokument-Outputs: alle Einheiten sind CSS-/
   Token-/Klassen-/Doku-Ebene → golden bleibt unberührt; trotzdem je PR
   `golden:vergleich` + `check:struktur-konsistenz` als Beweis, nicht Annahme.
4. **§15 Performance:** keine Textur-Assets/Noise-Overlays, kein zusätzlicher
   Font-Download; Wärme nur über Tonwerte.
5. **WCAG-Mess-Gate hell UND dunkel (§13/F2)** ist das harte Tor; APCA nur beratend.

## 1 · Die fünf tragenden Design-Entscheide

**E1 — Ein Papier, eine Tinte, ein Winkel.** Wärme entsteht ausschliesslich durch
OKLCH-Rekalibrierung der **neutralen** Achsen auf den Brass-Hue (~85–95°): ink-Rampe
hue-normalisiert (L halten), Flächen-Treppe mit Flexoki-Chroma-Tiefe-Kurve
(tiefer = mehr Chroma), alle `color-mix`-Rezepte in `oklab` statt `srgb`,
Reinweiss/Roh-Grau als Lesefläche verboten. **KEIN zweiter Wärme-Kanal:** kein
`--paper-warm`-Brass-Mix auf Arbeitsflächen, kein Sepia-Modus, keine flächen-lokalen
Warmtöne.

**E2 — Brass ist Signal, nicht Klima.** Klima-Wärme kommt aus E1 (60/30-Schicht);
Brass bleibt knappes Bedeutungs-/Marken-Signal (10 %). Dramaturgie: **warm
empfangen (Startseite/Rubriken), neutral-kühl prüfen (Entscheid/Rechner/Fristen)**
— der Temperatur-Kontrast des Wörterbuchs ist Feature, nicht Fehler. Signaturen
(gravierte Brass-Linie `scale-rule`, Schraffur, Regeste-Box) als katalogisierter
Motiv-Rhythmus an 2–3 definierten Orten, nicht als Tapete.

**E3 — Zwei Stimmen, eine deklarierte Ausnahme.** Serif (Source Serif 4) =
zitierfähiger **Werkstoff** (Normtext, Entscheidtext, Regesten, Zitate); Sans
(Geist) = **Werkzeug** (alle Produkt-UI); Mono radikal zurückgeschnitten auf echte
Sektions-Overlines + Zahlen/Aktenzeichen (`.num`). Display-Serif höchstens als EIN
definierter Marken-Moment — nur per David-Entscheid mit Perf-Messung (F5-Revision,
Geist-Entscheid 6.6.2026), nie autonom.

**E4 — Ein Lese-Register, Kontrastfenster statt -maximum.** Gemeinsame Dach-Tokens
`--reading-ink` (ink-800 in BEIDEN Modi — dämpft dunkel zugleich Halation) und
`--lese-fs`/`--lese-lh` für beide Reader; EINE Lesespalten-Regel für Regeste,
Rechner-Verdikt-Prosa und alle Langtexte; CPL erst messen, dann ändern.

**E5 — Rollen vor Stufen, Messung vor Geschmack.** Erhebung primär über Ton +
Haarlinie («Ton vor Schatten»; Schatten sekundär, ab «schwebend»). Rollen-Alias-
Schicht über den Basis-Skalen (Radix-Stufenlehre), damit künftige Rekalibrierungen
reine `:root`-Eingriffe sind. EIN Farbwelt-Mess-Tor (`check:farbwelt`) VOR jeder
Wert-Änderung — heute existiert **kein** Kontrast-Script, nur die axe-e2e-Stichprobe;
Nicht-Text-Kontraste (WCAG 1.4.11) fängt sonst niemand. Messbare Verstösse/Bugs
gehen VOR jede Atmosphäre-Arbeit.

## 2 · Bau-Einheiten (Reihenfolge ist harte Abhängigkeit)

Jede Einheit = eigener PR mit Mess-Quittung (Output `check:farbwelt` ab D-0),
axe-e2e hell+dunkel, golden-Beweis. Token-Einheiten (D-3…D-6) sind flip-reversibel;
Call-Site-Einheiten (D-8) nicht → Pilot zuerst. Bau durch Opus (Daueranweisung).

### D-6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)
*(Befunde 5+13+27+30 konsolidiert; Regelwerk 38 steckt schon in D-0(c))*
- **Kern:** (a) `--surface` dunkel eine halbe Stufe heben — EIN Wert entscheiden
  (~`#232019`, Ziel ≥1.12–1.15:1 gegen paper; heute 1.06:1 = Karten verschmelzen);
  `--paper-raised` eine Spur nach. (b) Dunkel-Schatten von reinem Schwarz
  `rgba(0,0,0,…)` (Z.192–194 — einziger kalter Fremdkörper) auf warme Basis
  (`--paper-sunken`-Ton `#100F0A`, Opazität leicht rauf). (c) optionale hauchfeine
  Lichtkante (`inset 0 1px 0 color-mix(ink-900 6%)`) als dunkle Entsprechung des
  warmen Papier-Schattens — gegen forced-colors/print prüfen. (d) Scrim-/Overlay-
  Audit: schwarze rgba-Scrims auf color-mix mit `var(--paper-sunken)` (grep zeigte
  TSX rgba-frei; Utilities mit `/alpha` prüfen).
- **Mess-Pflichten:** Karten-Rand/Nicht-Text 3:1 dunkel; L-Leiter-Assert D-0(c);
  axe dunkel.
- **Referenzfälle:** dunkle Gesetze-Übersicht, BGer-Karten Startseite, Modal/Drawer.
- **Aufwand:** S–M (Token-only, Z.161–194) · flip-reversibel.

### D-7 · Ein Lese-Register: `--reading-ink` + `--lese-fs`/`--lese-lh`
*(Befunde 42+45+23 konsolidiert + 44 Messung; Bug 19 ist schon in D-1 gefixt)*
- **Kern:** (a) `--reading-ink: var(--ink-800)` hell UND dunkel (Kontrastfenster
  ~10–12:1 statt Maximum; dunkel dämpft Halation — «Dark-Lesetext nie auf dem
  hellsten Ink-Ton»). Bestand: ArtikelLeser UND EntscheidBody stehen schon auf
  ink-800 → grossteils Formalisierung; realer Diff = Token + `RegesteBlock` (3×
  ink-900) umstellen. ink-800 auf brass-100-Fläche (Regeste!) nachmessen.
  (b) `--lese-fs`/`--lese-lh` als Dach-Basis beider Reader; Entscheid-Stepper
  (FS_STUFEN) auf Multiplikatoren des Basis-Tokens. Unifikations-Wert EINMAL
  entscheiden — Empfehlung **1.125rem** (liegt IN R2s Fenster 1.08–1.125, Gesetz-
  Leser nutzt es schon; real `leading-[1.65]`, nicht 1.625); der lh-Entscheid
  (1.65 vs. 1.7) wird einmal getroffen und in BEIDEN Domänen-Reglementen
  nachgezogen. Vorher/Nachher-Screens beider Reader in die Abnahme-Mappe.
  (c) CPL-Messung (44): Playwright im echten Reader (Art. 1 OR, volle Zeile);
  `maxWidth.reading` **NICHT global senken** (38 Call-Sites site-weit) — bei
  >72 CPL reader-spezifisches Mass-Token oder Serif-Feinstufe.
- **Regel in beide Domänen-Reglemente:** «Langtext = reading-ink; ink-900 nur
  Überschriften/Labels/kurze UI-Texte.»
- **Aufwand:** M · **Golden:** neutral (nur Klassen/Token; trotzdem Beweis je PR).

### D-8 · Anwendungs-Schicht: Wörterbuch auf die Fläche + Mono-Diät
*(Befunde 4, 17, 8, 6 — Call-Site-Arbeit, NICHT flip-reversibel → Pilot zuerst)*
1. **Slate auf Entscheid-Flächen** (4): Rubrik-Label + Leitentscheid-Chrome des
   Entscheid-Lesers auf slate-Rollen (Wörterbuch erlebbar machen; heute alles brass).
   **Die Regeste-Box-Kante bleibt brass** — amtlicher Wortlaut = exakt die
   brass-Semantik («massgeblich/Wortlaut-Referenz»); Umstellung wäre
   Wörterbuch-Verletzung. slate-Flächen dunkel gegen 3:1 messen (3.47 knapp).
2. **Mono-Diät** (17, Atmosphäre-Haupttreiber: 55 % Mono-Anteil Startseite):
   F5-Neufassung als deklarierter Reglement-Schritt — Mono nur noch (a) echte
   Sektions-Overlines, (b) Zahlen/Normzitate (`.num`, lc-chip). Feld-Labels/
   Hilfetexte auf Sans mit normalem Case. **KEIN zentrales `src/components/ui.tsx`**
   (nur `vorlagen/ui.tsx` = Wizard) — Labels leben verteilt in
   `DatumsFeld`/`BetragsFeld`/`forms/*` (~50 Stellen) → **Pilot** (Startseite +
   1 Rechner), Vorher/Nachher-Screens in die Abnahme-Mappe, dann mechanischer Rest.
   Datums-/Grusszeile in **Sans** (Serif wäre F5-Konflikt ohne David-Entscheid).
3. **Motiv-Katalog anwenden** (8): gravierte Brass-Linie (`scale-rule` besteht) an
   2–3 definierten Sektions-Orten; **Schraffur NICHT generalisieren**
   (`lc-hatch-warn` = spezifisch «Stillstand/ausgesetzt»). Reader-Kopf-Kahlheit (6)
   nur falls der Katalog eine billige Antwort hat (scale-rule unter Erlass-Titel),
   sonst zurückgestellt.
- **Aufwand:** M–L · **Golden:** neutral; Playwright-Screens Pflicht.

### D-9 · David-Entscheide (Warteliste — NICHT autonom bauen)
*(nur bereitlegen; Abnahme-Zeitsperre bis 1.12.2026 respektieren, nicht drängen)*
- **Display-Serif-Register** (22/26b): EIN Marken-Moment (Hero-H1 und/oder Erlass-/
  Entscheid-Titelzeile) — berührt F5 + Davids Geist-Entscheid 6.6.2026. VORHER
  Lade-Topologie messen (Startseite lädt Source Serif heute NICHT → potenziell
  LCP-relevanter Font-Download, §15-Behauptung des Befunds ungeprüft).
  Minimalinvasive Alternative **sofort erlaubt:** H1/H2-lineHeight leicht öffnen
  (1.05→1.1), negative Laufweite bei Lese-Überschriften reduzieren.
- **Typo-Rampe** (16): h2 25.6px→26px, h3 20→21px (~1.24er-Schritte) — sachlich
  richtig, aber verhaltensändernd site-weit → eigener deklarierter §6.3-Schritt mit
  Screenshot-Abnahme, NIE in einen Farb-Batch gemischt.
- **Stripe-L-Anker** (37): nur die vier **-700-Textstufen** auf gemeinsames L
  normieren (Vorschlag mit Screens); -500-Mitten nur bei konkretem D-0-Befund.
  Ob warn/danger lauter sein DÜRFEN (Vorbehalt-Salienz) ist Design-Entscheid, nicht
  Technik. Setzt F1-Entscheid (D-2i) voraus.
- **Regeste-Box-Kante slate?** (4-Rest): als Option dokumentieren, Empfehlung NEIN
  (brass = amtlicher Wortlaut).
- **Mobile Chip-Bündelung** (7-Rest): sekundäre Reader-Kopf-Chips hinter
  «Ansicht»-Menü — muss §4c respektieren (Fussnoten-Chip bewusst prominent,
  David 10.7.); Farbsemantik ist durch C-2 bereits gebaut → nur UX-Bündelung offen.

### D-10 · David-Entscheide 29.8.2026 (Vollzug)
*(Abschnitt am 29.8.2026 angelegt; weitere Entscheide desselben Tages werden als
eigene Zeile ANGEHÄNGT, nie über eine bestehende geschrieben.)*
- **1C · Staffelung aufheben + Zeilenmass-Deckel — GEBAUT** (Branch
  `feat/leser-eine-kante`). Wortlaut: *«wichtige änderung … im gesetz die
  staffelung aufzuheben. es soll alles auf der selben höhe stehen. … analog zu
  fedlex»*. Der Tiefen-Einzug im Gesetzes-Leser ist fort (jeder Erlass: genau
  EINE linke Textkante statt bis zu sechs), dazu der gebündelt entschiedene
  Zeichen-Deckel `--leser-zeilenmass` (~68 Zeichen, skaliert mit der
  Schriftstufe). Regelwerk: **DESIGN-REGLEMENT-NORMTEXT §4b-C** (Messreihen,
  Abgrenzung, Wächter). Damit ist auch der Satzspiegel-Vorbehalt aus dem
  Vollzugsvermerk S2 geschlossen (Vermerk in `tailwind.config.js` nachgeführt).

### Abnahme-Artefakt (F4 der Kohärenz-Linse)
Je Token-Einheit (D-3…D-7) wächst EIN Vorher/Nachher-Set: **4 Kernseiten
(Startseite · Gesetz-Reader · Entscheid · Rechner) × hell/dunkel** + Squint-Test-
Notiz → `abnahme/design-waerme/`. Nur bereitlegen (Zeitsperre) — Davids einziger
Gesamtbild-Touchpoint statt 40 Einzeländerungen.

## 3 · Verworfen (explizit, mit Grund)

| Vorschlag | Grund |
|---|---|
| `--paper-warm`-Brass-Mix-Token (Befund 1, Mechanik) | Zweiter Wärme-Kanal = Patchwork; kollidiert mit Token-Landkarte + 60-30-10; Wärme kommt aus D-4/D-5 (E1-Veto durch Befund 47) |
| Dark-Brass-Werte tauschen (9) | Inversion ist dokumentiert-absichtlich (a:hover dunkel = heller = stärker); Alias-Weg in D-2 |
| 3-stufige warme Elevation-Tokens (46) | Prämisse faktisch falsch: Hell-Schatten sind BEREITS warm ink-getönt (Z.116–118), boxShadow mappt bereits auf 3 Token-Stufen; Residuum = D-6(b) + Reglement-Satz D-2b |
| Sepia-/Wärme-Modus als dritter Modus | Redundanz zur Rezept-Architektur, verwässert das Wörterbuch (47) |
| CSS-mask-Chevron | Am nackten `<select>` technisch nicht machbar (background = Well-Füllung); nur Hex-Nachzug D-1.6 |
| Schraffur auf alle Zeitraum-Visualisierungen (8-Teil) | `lc-hatch-warn` = spezifisch «Stillstand»; Generalisierung verwässert EIN-Entscheid-je-Zeichen |
| `maxWidth.reading` global senken (44-Teil) | 38 Call-Sites überwiegend Sans-Prosa; Reader-Befund kippt nie das Dach-Token |
| Schriftgrad-Stepper «vormerken» (48) | Weitgehend gebaut (Entscheid-Reader-Stepper + globale Schriftskala); Rest-Kern = CPL-Stabilität als Fussnote in D-7(c) |
| BGer-News-Karten anreichern (24) | Inhalts-/Datenarbeit, keine Wärme-Schicht → läuft bereits in **W2·10-UI-NAV** (Rechtsprechungs-Politur «News-Karten»), kein Doppel (§14.3) |
| Reader-Kopf-Layout-Umbau (6, grosser Teil) | Layout-Empfinden, kein Token-Hebel; nur die billige Motiv-Antwort in D-8.3, Rest zurückgestellt |
| Warme-Neutrale-Sweep als «grosser Hebel» (25) | Empirisch schon sauber (0 bg-white/rgba-Treffer, Gate blockiert gray-*/zinc/neutral + Hex bereits); Rest = billige Gate-Erweiterung in D-2d |
| Papier-Texturen / Noise-Overlays | iA-Prinzip + §15 (D-2f) |

## 4 · Prozess

- **Reihenfolge hart:** D-0 → D-1 → D-2 → D-3 → D-4 → D-5 → D-6 → D-7 → D-8;
  D-9 asynchron als Entscheidungs-Mappe. Nie zwei Token-Einheiten in einem PR
  (jede Fläche nur einmal anfassen, Mess-Quittung je Commit).
- **Gates je PR:** `check:farbwelt` (ab D-0) + axe-e2e hell+dunkel + `gate:schnell`
  + golden-Beweis; Risiko-Pfade sind hier keine (reine Darstellung →
  `check:gegenpruefung` nicht betroffen), §13-Nachträge deklariert im Commit-Body.
- **Bau:** Opus (Daueranweisung Modellwahl); autonome Durchführung pro Einheit
  (Daueranweisung Batch), Auto-Merge bei grüner CI.

---

## §5 · ROADMAP-Spec W2·11-DESIGN (wörtlich verschoben 31.7.2026)

> **→ Bau-Spec: «2 · Bau-Einheiten (Reihenfolge ist harte Abhängigkeit)» dieser Datei.** Dieser § ist die *wörtlich hierher verschobene ROADMAP-Prosa* (Wortlaut-Heimat), nicht die Bau-Spezifikation — wer nur ihn slict, baut ohne die verbindlichen Einheiten, Entscheide und Querschnitt-Regeln.

*Wörtlich aus `ROADMAP.md` (QS-TOK/ROADMAP-Diät B4, 31.7.2026); dort bleiben Checkbox, `@meta`, Einzeiler, Pointer. Steuert nicht — Spec-Heimat.* *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  Farbklima/Wärme/Typografie-Plan aus 48 Ultracode-Befunden + 3 Kritik-Linsen (reglement-treue ·
  umsetzbarkeit · geschmacks-kohärenz). Fünf tragende Entscheide: **E1** Ein Papier, eine Tinte,
  ein Winkel (OKLCH-Rekalibrierung der Neutralen auf Brass-Hue, kein zweiter Wärme-Kanal) ·
  **E2** Brass ist Signal, nicht Klima (warm empfangen, kühl prüfen) · **E3** Zwei Stimmen
  (Serif=Werkstoff/Sans=Werkzeug, Mono-Diät) · **E4** Ein Lese-Register (`--reading-ink`,
  Kontrastfenster) · **E5** Rollen vor Stufen, Messung vor Geschmack (`check:farbwelt`-Tor).
  Bau-Einheiten D-0 Mess-Fundament → D-1 Sofort-Fixes (FS-Bug · Overline-AA · danger-dark-1.4.11 ·
  Lesespalte Regeste/Verdikt · Chevron · Motion-Dedup) → D-2 Rollen-Aliase+§13-Nachträge →
  D-3 oklab-Mix → D-4 Ink-Wärme → D-5 Papier-Treppe → D-6 Dunkel-Paket → D-7 Lese-Register →
  D-8 Wörterbuch-auf-Fläche+Mono-Diät; D-9 = David-Entscheide (Display-Serif · Typo-Rampe ·
  Stripe-L) nur bereitgelegt. Fixpunkte: `--paper` hell/dunkel + C-1/C-2/C-3-Kalibrierung;
  golden byte-gleich; §15 ohne Textur/Font-Zuwachs. **Vor jedem Schnitt Prod-Re-Audit**
  (Befund-Vintage teils vor #201). Verworfen mit Grund (`--paper-warm`, Dark-Brass-Tausch,
  Elevation-Neubau, Sepia-Modus u. a.). Detail: diese Datei.
  Trailer `Roadmap: W2·11-DESIGN`.

### Teilschritt-Spezifikation W2·11-DESIGN (verschoben 31.7.2026)

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026, Nachhalte-Konvention*
*Ausführungs-Protokoll Ziff. 6). Die ROADMAP führt je Teilschritt nur noch Checkbox,*
*`@meta` und einen Einzeiler; der Wortlaut unten ist die massgebliche Fassung.*

**Schnitt-Begründung (Session-Granularität AP-6) — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  **Session-Granularität (AP-6, 31.7.2026):** D-0…D-5 sind gebaut; offen bleiben D-6, D-7 und D-8.
  Die Teilschritte unten folgen der **harten Kette** des Fahrplans (`D-6 → D-7 → D-8`) und der Regel
  «**nie zwei Token-Einheiten in einem PR**»; D-8 ist entlang seiner eigenen Nummerierung 1/2/3
  geschnitten, weil es als einzige Einheit **nicht flip-reversibel** ist (Call-Site-Arbeit, Pilot
  zuerst). Dieser Schritt bleibt das Dach. **Bewusst NICHT als Teilschritt:** die 5 D-9-Posten
  (David-Entscheid-Mappe, Abnahme-Zeitsperre bis 1.12.2026).

**Ursprünglicher Wortlaut der Teilschritt-Bullets — wörtlich:** *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

  - [ ] **DESIGN-D6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)** — surface dunkel heben · warme Schattenbasis · Lichtkante · Scrim-Audit; Token-only, flip-reversibel, `check:farbwelt` + axe dunkel. Detail: diese Datei §2 (D-6). Trailer `Roadmap: W2·11-DESIGN-D6`.
  - [ ] **DESIGN-D7 · Ein Lese-Register (`--reading-ink`, `--lese-fs`/`--lese-lh`)** — Lese-Basis + Entscheid-Stepper als Multiplikatoren, CPL-Messung, Regel in beide Domänen-Reglemente; golden neutral. Detail: diese Datei §2 (D-7). Trailer `Roadmap: W2·11-DESIGN-D7`.
  - [ ] **DESIGN-D8a · Wörterbuch auf die Fläche: slate auf Entscheid-Flächen (D-8.1)** — Entscheid-Leser-Chrome und Rubrik-Label auf die Rollen-Schicht ziehen; Playwright-Screens in die Abnahme-Mappe. Detail: diese Datei §2 (D-8.1). Trailer `Roadmap: W2·11-DESIGN-D8a`.
  - [ ] **DESIGN-D8b · Mono-Diät — Pilot, dann mechanischer Rest (D-8.2)** — ~50 verteilte Fundstellen; **Pilot zuerst** (Startseite + 1 Rechner) mit Vorher/Nachher-Screens, danach der Rest. Nicht flip-reversibel. Detail: diese Datei §2 (D-8.2). Trailer `Roadmap: W2·11-DESIGN-D8b`.
  - [ ] **DESIGN-D8c · Motiv-Katalog (D-8.3)** — `scale-rule`-Motiv an 2–3 Sektions-Orten, Abschluss der Anwendungs-Schicht. Detail: diese Datei §2 (D-8.3). Trailer `Roadmap: W2·11-DESIGN-D8c`.

### Dach-Prosa W2·11-DESIGN im Wortlaut (verschoben 31.7.2026) *Wörtlich bis auf die Selbstverweise, die am 31.7.2026 auf «diese Datei» neutralisiert wurden (Endprüfung Fix-Runde 1; Fund R2-18).*

*Aus `ROADMAP.md` hierher verschoben (QS-TOK-Nachdiät, 31.7.2026); massgebliche Fassung.*

>   Farbklima/Wärme/Typografie-Plan aus 48 Ultracode-Befunden + 3 Kritik-Linsen — Token-Schicht nach
>   §13, Normtext-Körper bleibt farbfrei, golden byte-gleich.
>   **Detail:** diese Datei §5. Trailer `Roadmap: W2·11-DESIGN`.


---

## §6 · ROADMAP-Spec-Nachzug `W2·11-DESIGN-D8b` (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Welle 2, Teilschritt `W2·11-DESIGN-D8b` — AP-11 rückwirkend angewandt
(ROADMAP-Diät Welle 3, 4.8.2026). In der ROADMAP bleiben Titel, `@meta`, der Einzeiler und der
Grenz-Hinweis. Steuert nicht — Spec-Heimat. **→ Bau-Spec: §2 (D-8.2) dieser Datei.***

> **Grenze zu `W2·17-UI-BEFUNDE-B12`:** hier nur der Schriftart-Tausch (mono → Text), dort Verhalten und Zustände derselben Felder — nacheinander bauen, nicht gleichzeitig (`src/components/forms`, `DatumsFeld.tsx`, `BetragsFeld.tsx`).
