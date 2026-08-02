# FAHRPLAN — UI-Befundliste extern (210 Befunde, Cowork 29.7.2026)

**Heimat: ROADMAP-Schritt `W2·17-UI-BEFUNDE`** · Stand 31.7.2026 (Anlage AP-9, QS-TOK-Aufräumwelle).

Wortlaut aller 210 Befunde: [`docs/ui-befunde-2026-07/BEFUNDLISTE-COWORK-2026-07-29.md`](../docs/ui-befunde-2026-07/BEFUNDLISTE-COWORK-2026-07-29.md).
Hier steht **nur die Steuerung** — kein Volltext, keine zweite Wahrheit (§5).

---

## §0 · Quer-Lektionen (vor JEDEM Batch lesen)

**§0.1 Vintage-Regel.** Die Sichtprüfung stammt vom **29.7.2026**; seither ist gebaut worden
(u. a. W2·7-BEZUG B7 am 29.7.). **Vor jedem Batch werden die betroffenen Befunde am
Prod-Stand reproduziert** — genau nach der Spalte «Prüfen», die zugleich das Fertig-Kriterium
ist. Was sich nicht mehr reproduzieren lässt, wird als **«erledigt (überholt)»** geschlossen,
mit einer Zeile, warum. Nie blind bauen: ein Fix ohne vorher gesehenen Fehlschlag ist kein Fix.

**§0.2 Referenz-Pflicht.** Jeder Befund mit Dedup-Marker trägt eine `dedup_referenz`. Die wird
**vor** dem Bau gelesen. Wo der Bestand einen Entscheid dokumentiert hat (gebaut, verworfen,
aufgeschoben mit Grund), wird dieser Entscheid **nicht still gekippt** — entweder er trägt,
oder er wird ausdrücklich und begründet geändert (§14).

> **Anker-Form (Nachtrag 31.7.2026, Endprüfungs-Funde 16/17).** Eine **blosse Zeilenangabe
> ist kein gültiger Anker.** Sieben Referenzen waren schon zwei Commits nach dem Schreiben der
> Befundliste auf den Nachbarabsatz gerutscht (Kopfzeilen-Einschübe aus AP-7 und der
> Nachdiät), eine (LM-124) traf von Anfang an die falsche Stelle. Jede `dedup_referenz` nennt
> darum einen **§-, Überschriften- oder `@meta`-Anker**; eine Zeilenangabe darf nur
> *zusätzlich* danebenstehen und ist nie der Anker selbst.
>
> **Geltungsbereich — ehrlich begrenzt (Nachtrag 31.7.2026, Endprüfungs-Fund R2-21).** Die
> Regel gilt **ab sofort für jeden neuen Eintrag**. Der **Altbestand** ist NICHT vollständig
> umgestellt: in dieser Datei stehen weiterhin Referenzen mit blosser `Z.`-Angabe (u. a.
> LM-025, LM-095, LM-098). Umgestellt wurden bisher die sieben nachweislich verrutschten plus
> LM-124 und LM-096. **Auflage für den Altbestand:** jede noch vorhandene Zeilenangabe trägt
> beim nächsten Anfassen zusätzlich den §-/Überschriften-Kontext, und zwar im Batch, der den
> Befund baut (`B1`…`B20`) — nicht in einem eigenen Durchgang. Bis dahin ist die Regel eine
> **Vorwärts-Regel**, keine erfüllte Bestands-Aussage (§8: nicht mehr behaupten, als gedeckt ist).

**§0.3 Risiko-Trennung.** Der grösste Teil ist reine Darstellung (§3) und läuft ohne
Gegenprüfung. Drei Klassen laufen anders: **Such-/Query-Logik** (Relevanz, Ranking,
Substring-Treffer) — nie «UI-Fix», sondern eigener Nachweis; **§1-nahe Logik** (Eingabe-Parsing,
Formate, die in eine Engine laufen); **Risiko-Pfade** nach `istRisikoPfad()` →
`npm run check:gegenpruefung`. Die Risiko-Klasse steht in der Fussnote jedes Batches.

**§0.4 SSoT.** Wortlaut ausschliesslich in `docs/ui-befunde-2026-07/`. Der Fortschritt
ausschliesslich hier (Checkboxen) und in `ROADMAP.md` (`@meta status`). Kein Feld doppelt.

---

## §1 · Triage-Ergebnis 31.7.2026

### §1.0 · Herkunft der Sichtprüfung (aus `ROADMAP.md` verschoben 31.7.2026)

*Wörtlicher ROADMAP-Wortlaut, QS-TOK-Nachdiät 31.7.2026 — die ROADMAP führt den Schritt
seither nur noch mit Triage-Zahlen und Pointer hierher:*

> Externe Cowork-Sichtprüfung über ~45 Seiten, Breiten 390–2560 px, hell/dunkel, Druck, Tastatur,
> 140 % Schriftskala; geschnitten nach Bauteil K-01…K-20. **Dedup-Triage 31.7.2026** (7 Opus-Agenten
> gegen den Bestand): **45 NEIN · 144 VERDACHT · 15 BEREITS-GEBAUT · 6 SICHER** — die 6 SICHER werden
> **nicht** neu eingeplant (LM-202 ist eine **David-Frage**: der Bestand hat den Scroll-Hash-Sync
> bewusst verworfen, `FAHRPLAN-UI-NAVIGATION.md` §Z Ziff. 7). **20 Batches** — 19 Bau-Batches mit
> 7–16 baubaren Befunden (189) + 1 Prüf-Batch (15). Wortlaut: `docs/ui-befunde-2026-07/`.

210 Befunde, geprüft von 7 Opus-Agenten gegen den Bestand (Fahrpläne, Code, Abnahme-Berichte):

| Marke | Anzahl | Bedeutung |
|---|---:|---|
| **NEIN** | 45 | kein Bestandsbezug gefunden — Neubau |
| **VERDACHT** | 144 | Bestandsbezug vorhanden, aber nicht deckungsgleich — Referenz vor dem Bau lesen (§0.2) |
| **BEREITS-GEBAUT** | 15 | im Code nachweisbar gebaut — «Prüfung wiederholen, dann erledigt» (letzter Batch) |
| **SICHER** | 6 | deckungsgleich mit einem bestehenden Posten — **kein Neubau** (unten) |

**Baubar eingeplant: 189** (NEIN + VERDACHT) in 19 Bau-Batches · **15** im Prüf-Batch ·
**6** hier abgehandelt und in keinem Batch.

### §1.1 · SICHER — wird NICHT als Neubau eingeplant

Je Eintrag: Referenz aus dem Bestand + der Ein-Zeilen-Grund, warum kein Neubau.

- **LM-020** (Mittel, K-02) — gemischte Richternamen-Formen: identischer Defekt an derselben Stelle; `W2·6-RNAME` hat
  dafür bereits eine verbindliche Regel (Auflösung nur bei Eindeutigkeit, Kollisions-Report,
  Risikopfad nach dem #309-Vorfall). Dort abarbeiten, nicht doppelt einplanen.
  Referenz: `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md §6 «Richternamen gegen den Staatskalender auflösen» (W2·6-RNAME); ROADMAP.md → @meta W2·6-RNAME`
- **LM-104** (Hoch, K-10) — «SR»-Präfix an kantonalem Erlass: identische Stelle
  (`src/pages/gesetz-leser/parts/ErlassLeserKopf.tsx`), im Bestand als **F28** mit
  Snapshot-Tor geführt. Als F28 abarbeiten.
  Referenz: `FAHRPLAN-KANTONE.md Z.81 §c: «F28 «SR»-Label (ErlassLeserKopf.tsx:37): bei ebene='kanton' Präfix weg (SAR/LS/BLV/GS tragen ihr Kürzel selbst). Ein-Zei…`
- **LM-140** (Mittel, K-13) — Methodik-Seitenhöhe: der Fix ist als **D3** bereits gebaut (10 470 → 5 977 px), die Liste
  ist seither gewachsen (69 → 78 Karten). Also D3 nachmessen und um den Rest ergänzen, den
  D3 nie adressiert hat (Gruppierung/Aufklappen) — kein neuer Posten.
  Referenz: `abnahme/responsive-audit/BERICHT.md Defekt D3 («methodik | 2560 | Inhalts-/Pflege-Listen bleiben eine schmale Einzelspalte → Seite wird ~10 470 px hoc…`
- **LM-144** (Detail, K-13) — toter Rand @2560: identischer Befund, bereits verdiktet als **bewusste Lesbreite** (§13.2)
  und ausdrücklich NICHT als 20 Einzelbugs. Neu ist allein die Variante «Chrome auf
  Inhaltsbreite begrenzen» — das wäre ein Design-Entscheid, kein Defekt.
  Referenz: `abnahme/responsive-audit/BERICHT.md §Gesamtbefund («Ultrawide @2560 nutzt durchgängig eine zentrierte max-width-Spalte — bewusste Lesbreite §13.2») +…`
- **LM-150** (Hoch, K-14) — In-Gesetz-Suche ohne Treffer-Hervorhebung: deckungsgleich mit dem offenen **R1**, dort
  einlaufen lassen. **Achtung Bau-Session:** das Highlight IST gebaut (A35), aber über die
  CSS Custom Highlight API — eine DOM-Messung auf `<mark>` findet es nicht.
  Referenz: `FAHRPLAN-UI-NAVIGATION.md §4 R1 («In-Gesetz-Suche: Treffer-Highlight … <mark>-Hervorhebung in den gefilterten Artikeln + Trefferzahl je Artikel + Vor/…`
- **LM-202** (Hoch, K-20) — **David-Frage, kein Bau-Punkt.** Der kontinuierliche Scroll-Hash-Sync ist im Bestand
  erfasst **und mit Begründung verworfen** (Kollision mit der empirisch begründeten
  A16-Architektur, Perf-/History-Falle); Ersatzweg ist R3 (Zitat + Permalink). Neu
  einplanen hiesse einen dokumentierten Entscheid still kippen (§14).
  **→ David entscheidet, ob der Verwerfungs-Entscheid bestehen bleibt.**
  Referenz: `FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (Z. 545–547): «Kontinuierlicher Scroll-Hash-Sync in der URL (#13-Teil) — kollidiert mit der empirisch begründeten…`

---

## §2 · B1 — Chips, Badges und Normzitate (K-05 + K-10)

**16 Befunde** · Blocker 3 · Hoch 3 · Mittel 7 · Detail 3 · `W2·17-UI-BEFUNDE-B1`

**Prod-Re-Audit 2.8.2026: 16/16 reproduziert (12 voll, 4 teilweise); 13 gebaut, 3 zurückgestellt
(Bestands-Entscheide).**

> **Nachtrag 2.8.2026 — David-Entscheid über die drei Zurückgestellten (§0.2 «entweder er trägt,
> oder er wird ausdrücklich und begründet geändert»).** Damit ist keiner der drei mehr «offen ohne
> Adresse»: **LM-048 verworfen** (Bestands-Entscheid W2·7-BEZUG trägt, abgehakt) · **LM-041
> geöffnet** als eigener Schritt `W2·7-VZUI-SACHGEBIET` (nur die Sachgebiet-Achse, deterministisch;
> die Zitier-Rolle bleibt ausdrücklich zu) · **LM-044 geöffnet** als eigener Schritt
> `W2·17-UI-BEFUNDE-N1`, nachdem die Prüfung den DEFER-Grund als **stale Kopie** entlarvt hat
> (§5-Heilung, s. dort). Bau-Stand dieses Batches unverändert: **13 gebaut**; die zwei geöffneten
> Befunde werden **nicht** hier gebaut, sondern in ihren eigenen Schritten.

- [x] **LM-040** · Blocker · Der gewählte Chip unterscheidet sich vom ungewählten nur in der Rahmenfarbe … [Verdacht → DESIGN-REGLEMENT.md F4 «selected» + FAHRPLAN-UI-QUALITAET.md §3(c) Muster-/Zustands-Konsistenz…] — gebaut: `.lc-chip-selected` (gefüllte Fläche + ✓, hell/dunkel), Commit 0844615c4.
- [ ] **LM-041** · Hoch · Der Chip unterscheidet nicht, in welcher Rolle die Norm im Entscheid … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9/B1 Facetten-Datenmodell + §1.2 KantenChip-Dichteregel…] — → **geöffnet per David-Entscheid 2.8.2026 als `W2·7-VZUI-SACHGEBIET`** (nur Sachgebiet, deterministisch aus der amtlichen BGE-Bandnummer; Rolle bleibt zu). Der Bestands-Entscheid (FAHRPLAN-VERZAHNUNG-UI.md §9/B1 + §1.2: Facetten-Modell abschliessend definiert, Dichte-Regel EIN Zusatz je Chip) wird nicht still gekippt, sondern ausdrücklich um EINE Dimension erweitert — Nachtrag dort, Spec in §12 derselben Datei. Die Zitier-**Rolle** bleibt zu: nicht deterministisch ableitbar (§2).
- [ ] **LM-044** · Mittel · Normverweis, Statusbadge («Entwurf», «Zu unterzeichnen»), Standangabe, Sprache, Instanz und Gemeinwesen sehen … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 A25/C-3 (Z.1429: «NormChip/Materialien (DEFER, U-VERWEIS-Kollisio…] — → **geöffnet per David-Entscheid 2.8.2026** (U-VERWEIS-Prüfung: Sperrgrund seit 10.7.2026 weg — `#170` gemergt `7f6b9a17b` —, C-3 war am 11.7.2026 gebaut `13fee95ed`; der DEFER-Vermerk in FAHRPLAN-GESETZES-UX.md §10.8 A25/C-3 war eine **stale Kopie**, §5-geheilt) → **`W2·17-UI-BEFUNDE-N1`** (§23).
- [x] **LM-045** · Mittel · Fünf gleich aussehende Chips sind drei verschiedene Dinge: «↗ geltende Fassung» … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 A25/C-2 (Currency-Tonung) + src/index.css:699–700 (`.lc-chip-geltend`/`.lc-chip-vorbehalt`); Code src/pages…] — gebaut zusammen mit LM-046/LM-047: Chip-Grammatik (Link/Knopf/Angabe) über Container-Klasse `lc-chip-zeile`, Commit fd68383da.
- [x] **LM-046** · Mittel · Der Chip sieht wie die naheliegendste Aktion aus, ist aber ein … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §X «Fassungsvergleich/Zeitreise» (hart gegated: Fedlex-P1a/b + David-…] — gebaut: Form-Korrektur (kein Linkziel vorgetäuscht), §X-Fassungs-Gate unangetastet, Commit fd68383da.
- [x] **LM-047** · Mittel · Sechs Elemente in einer Zeile, drei Formensprachen: «★ Leitentscheid» (grüne Pille), … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §1.2/§1.3 (KantenChip vs. StatusBadge = zwei bewusste Anatomien) + FA…] — gebaut: Aktion/externer Link/Angabe an der Container-Klasse `lc-chip-zeile` getrennt, Commit fd68383da.
- [x] **LM-048** · Mittel · Je Verweis ist bereits eine Gewichtung erfasst: im OR 768× Wert … [Verdacht → src/pages/gesetz-leser/parts/BezuegeZeile.tsx:44–51 (Komponente `BezuegeZeile`) + src/lib/rechtsprechung/bezuege.ts:36–45 (Interface `BezugsEintrag`)…] — **erledigt (verworfen) — David-Entscheid 2.8.2026: W2·7-Entscheid bestätigt, wird nicht umgesetzt** (Gegenprüfung Runde 1/B3 + B7: `gewicht:null` = «nicht messbar», R16-Ampel/Treatment-Darstellung bleibt gesperrt). Kein Nachfolge-Schritt, keine Wiedervorlage.
- [x] **LM-049** · Mittel · Der Überlaufhinweis «+2» (bzw. «+5», «+6») steht als blosser Text neben … [neu] — gebaut: «+N weitere» statt reinem Zähler-Text, Commit 0966c0f28.
- [x] **LM-050** · Detail · An den Entscheid-Chips stehen bis zu drei Symbole hintereinander: «★» hinter … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §1.3 StatusBadge (★ «verliert sein aria-hidden-ohne-Erklärung-Dasein»…] — gebaut: ZeichenLegende als Toggletip ohne `aria-expanded`, B4-Wächtertest 32/32 grün, Commits 5960f032c + 64b80f3ac + 4f7b2a45f.
- [x] **LM-051** · Detail · Beschriftung und Zahl stehen im Text ohne Trenner aneinander: kopiert ergibt … [Verdacht → Code src/components/rechtsprechung/EntscheidFilter.tsx:36–42 (Funktion `FacettenGruppe`)] — gebaut: Trenner-Leerzeichen als eigener Textknoten, Commit 0966c0f28.
- [x] **LM-101** · Blocker · Im Markup steht «Form (Art. 266l–266o OR)». Per text-transform uppercase wird … [neu] — gebaut: 266l/266o nicht mehr uppercase-entstellt, `MietrechtForm.tsx` auf `.lc-overline-soft`, Commit d9af2b128.
- [x] **LM-102** · Blocker · Die Erlasskürzel in den Entscheidkarten sind durchgehend versal gesetzt und verlieren … [neu] — gebaut: `normLabel()` löst via `ERLASS_REGISTER` auf (60 Kürzel korrigiert, u. a. SchKG/StGB/LugÜ), 19 Schreibweisen live gegen Fedlex-SPARQL verifiziert, Commit a0e80f51c.
- [x] **LM-103** · Hoch · Normzitate brechen am Zeilenende um: «Art. 60 Abs. 1 / OR», … [neu] — gebaut: `whitespace-nowrap` in `NormLink`/`ui.tsx`, Bemerkung bleibt umbruchfähig, Commit 5ce64b912.
- [x] **LM-105** · Hoch · Das Zitat steht doppelt untereinander: «BGE 152 V 52 · Bundesgericht … [neu] — gebaut: Aktenzeichen nur bei Abweichung vom BGE-Zitat, Commit 0966c0f28.
- [x] **LM-106** · Mittel · Das Lugano-Übereinkommen wird als «LUGUE» geführt — der Umlaut des amtlichen … [neu] — gebaut zusammen mit LM-102 (dieselbe `normLabel()`/`ERLASS_REGISTER`-Lösung), Commit a0e80f51c.
- [x] **LM-107** · Detail · Hochgestellte «bis» erscheinen in derselben Ansicht in zwei Grössen: 9 px … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.10 E2 = A30 «bis/ter bei 1bis hochgestellt (Fedlex-Referenz)» — geb…] — gebaut: `margLabel`-`<sup>` auf `text-[0.62em]` vereinheitlicht (A30-konform), Commit 89ad3ff67.

**Code-Flächen (grob, aus den Routen):** `src/components/NormText.tsx`, `src/components/NormPopover.tsx`, `src/components/verzahnung`, `src/components/rechtsprechung`, `src/pages/gesetz-leser`.
**Risiko-Klasse:** gemischt — reines UI, ABER die Fundstellen-Beschriftung berührt Norm-Anker (§7/D1).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §3 · B2 — Verlauf und Zustand in der URL (K-20)

**11 Befunde** · Blocker 2 · Hoch 5 · Mittel 4 · Detail 0 · `W2·17-UI-BEFUNDE-B2`

- [ ] **LM-199** · Blocker · Nach «Zurück» landet man am Anfang des Gesetzes statt an der … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 Z. 894 (U-POSITION = A2+A16+A17) und §10.9 A16 (Z. 1292–1307, «Zu…]
- [ ] **LM-200** · Blocker · Vier Bedienelemente derselben Seite hinterlegen ihren Zustand auf drei verschiedene Arten: … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116: «Rechtsprechungs-Suchbegriff in URL spiegeln (debo…]
- [ ] **LM-201** · Hoch · Beim Wechsel auf eine kürzere Seite bleibt kurzzeitig die alte Scrollposition … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.9 A16 (Z. 1292–1307, anker-basierte Restauration, history.scrollRes…]
- [ ] **LM-203** · Hoch · Zwei Filterarten mit unterschiedlichem Verhalten in derselben Filterzeile: Das Sachgebiet schreibt … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116) — dieselbe Fläche src/pages/Rechtsprechung.tsx:75]
- [ ] **LM-204** · Hoch · Vier Bereiche, vier verschiedene Regeln. Beim Lesen eines Gesetzes ändert sich … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (Scroll-Hash-Sync verworfen) + §2/S1 + §1/N0d·J5 (?ansicht…]
- [ ] **LM-205** · Hoch · Der Rechenzustand steht erst nach dem Drücken von «Link teilen» in … [neu]
- [ ] **LM-206** · Hoch · Nach dem Neuladen ist die Richter-Auswahl wiederhergestellt und die Karten-Ansicht ebenfalls, … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2/S1 (Z. 108–116, URL-Zustand der Rechtsprechungs-Recherche) · §8-Eh…]
- [ ] **LM-207** · Mittel · Die Darstellung blockierte dabei so lange, dass eine Auswertung nach 45 … [Verdacht → ROADMAP.md QS-PERF (@meta Z. 191, status wip) — offene Posten «Der Artikel-Suchindex kostet ~28…]
- [ ] **LM-208** · Mittel · Die Adresse trägt den Parameter «?norm=Art. 367 OR», die Entscheidseite zeigt … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.8 Z. 894 / §10.9 A17 (Split-View bzw. Entscheid öffnet direkt an de…]
- [ ] **LM-209** · Mittel · Jeder Klick auf einen Abschnittsreiter erzeugt einen Verlaufseintrag (#abschnitt-erwaegung, #abschnitt-dispositiv). Drei … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §Z Ziff. 7 (History-/Hash-Politik, verworfener Scroll-Hash-Sync) · §1…]
- [ ] **LM-210** · Mittel · Der Lesemodus verändert die Adresse nicht. Ein Verweis auf die Leseansicht … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1/N0d·J5 (Z. 94–95, ?ansicht=voll|auszug in die URL zurückgeschriebe…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout`, `src/pages/gesetz-leser`, `src/pages/EntscheidLeser.tsx`, `src/pages/Rechtsprechung.tsx`.
**Risiko-Klasse:** reines UI/Navigation — aber History-Architektur (A16), Perf-Falle beachten.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §4 · B3 — Klebende Leisten (K-01)

**7 Befunde** · Blocker 2 · Hoch 4 · Mittel 1 · Detail 0 · `W2·17-UI-BEFUNDE-B3`

- [ ] **LM-001** · Blocker · Die Kopfleiste ist nicht blickdicht. Beim Scrollen läuft der Seiteninhalt sichtbar … [Verdacht → FAHRPLAN-GESETZES-UX.md Z.597–600 + Z.613–616 (G2b-Ausführungsvermerk); src/index.css:783–786 (…]
- [ ] **LM-002** · Blocker · Die klebende Leiste «Sachverhalt | Erwägungen | Dispositiv» deckt die Überschrift … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1 N0c (Z.74–81); FAHRPLAN-GESETZES-UX.md §15 K5 (Z.2055–2061); src/p…]
- [ ] **LM-003** · Hoch · Zwischen der klebenden Reiter-Kopfzeile und der darunter klebenden Werkzeugleiste bleibt ein … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9 B6 (Werkzeugleisten-Gesamtüberarbeitung, gebaut 29.7.2026 PR #405…]
- [ ] **LM-004** · Hoch · Die Werkzeugleiste jedes Reiters schwebt als eigener Kasten über dem Textbereich … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9 B6; FAHRPLAN-GESETZES-UX.md §10.10 E3/A34; src/pages/gesetz-leser/…]
- [ ] **LM-005** · Hoch · Die Leiste mit den drei Abschnitten bleibt sichtbar, auch wenn keiner … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §3 V5 (Erwägungs-Navigation im Entscheid-Leser, Z.258–266); src/pages…]
- [ ] **LM-006** · Hoch · Während des Scrollens bleibt ein grosser Teil des Fensters für einen … [Verdacht → src/index.css:783–786 (.lc-glass backdrop-filter) = dieselbe Fläche wie LM-001; Abgrenzung: FAH…]
- [ ] **LM-007** · Mittel · Kopfleiste, Breadcrumb und zwei Tab-Ebenen kleben gleichzeitig und belegen zusammen rund … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9 B6; FAHRPLAN-GESETZES-UX.md §15 K6 (Z.2062–2064); src/pages/Entsch…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout`, `src/index.css`.
**Risiko-Klasse:** reines UI (CSS/Layout).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §5 · B4 — Leseansicht Gesetz (K-14)

**12 Befunde** · Blocker 2 · Hoch 4 · Mittel 5 · Detail 1 · `W2·17-UI-BEFUNDE-B4`

- [ ] **LM-146** · Blocker · Die Gliederung ist nicht navigierbar. Sie enthält 2299 Einträge, alle als … [Verdacht → src/pages/gesetz-leser/inhalt.tsx:465-497 (springeZuSektion: Pfad öffnen → flushSync → scrollIn…]
- [ ] **LM-147** · Blocker · Allein die Gliederung enthält 2887 Tabstopps, die ganze Seite 23'537. Es … [Verdacht → src/pages/gesetz-leser/parts/SektionBaumTOC.tsx:42 (Klappknopf trägt aria-label «Einklappen»/«A…]
- [ ] **LM-148** · Hoch · Links das Inhaltsverzeichnis, rechts unmittelbar daneben dieselbe Struktur nochmals als Dokumentkopf … [Verdacht → src/pages/gesetz-leser/inhalt-volltext.tsx:314-326 (<aside … className="mb-0 sticky flex-col" m…]
- [ ] **LM-149** · Hoch · Zwei Trennlinien: eine über der linken Spalte, eine weiter rechts auf … [Verdacht → DESIGN-REGLEMENT-NORMTEXT.md §4b (EINE Linien-Sprache, 3 Rollen-Tokens --guide-gliederung/--rul…]
- [ ] **LM-151** · Hoch · Die Bestandteile der Fussnotenzeile laufen ohne Trennzeichen ineinander: Fussnotennummer, vorangestelltes Datum … [neu]
- [ ] **LM-152** · Hoch · Der Kasten ist 256 × 582 px gross, der Inhalt 17'589 … [Verdacht → FAHRPLAN-GESETZES-UX.md §15 K1 (W2·5h-GESETZ-UI, Z. 2041-2046) + §17 Intake 24.7.]
- [ ] **LM-153** · Mittel · Die Marke im Text ist hochgestellt und goldfarben; der Eintrag in … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.10 E2/A30+A31 (Z. 1836-1840, gebaut)]
- [ ] **LM-154** · Mittel · Verweise auf fedlex sind goldfarben, aber ohne Unterstreichung und ohne Hinweis … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §3 V4 (NormChip-href, «amtlich ↗» als sichtbarer Zweitlink) + FAHRPLA…]
- [ ] **LM-155** · Mittel · Acht Einrückungsebenen liegen bei 330, 340, 346, 349, 356, 365, 375 … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.9 Entscheid A28 (Z. 1489-1504, gebaut 12.7.) + U-LINIEN/A8 (Z. 890)…]
- [ ] **LM-156** · Mittel · Der aktive Pfad ist allein durch Schriftschnitt markiert: 21 von 2299 … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §4 R2 («Sie sind hier» + markiert, mobiles Sheet) + FAHRPLAN-GESETZES…]
- [ ] **LM-157** · Mittel · Beim frischen Aufruf mit Anker springt der Text korrekt zu Art. … [Verdacht → FAHRPLAN-GESETZES-UX.md §15 K5 (Scroll-Ziel/#art--Deep-Links) + FAHRPLAN-UI-NAVIGATION.md §1 N0…]
- [ ] **LM-158** · Detail · Die Standangabe erscheint zweimal gleichzeitig. Auf Mobil belegt die Angabe in … [Verdacht → FAHRPLAN-GESETZES-UX.md §15 K6 (Kopfzeile gesamthaft: Elemente/Ordnung/Responsive-Verdichtung)…]

**Code-Flächen (grob, aus den Routen):** `src/pages/gesetz-leser`, `src/components/NormText.tsx`, `src/components/normtext`.
**Risiko-Klasse:** gemischt — Gliederung/Fussnoten/Standangaben sind §7-nah (Norm, Link, Stand).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §6 · B5 — Druck, Farbschema, Reiter- und Split-Ansicht (K-16 + K-17 + K-18)

**8 Befunde** · Blocker 2 · Hoch 2 · Mittel 3 · Detail 1 · `W2·17-UI-BEFUNDE-B5`

- [ ] **LM-173** · Blocker · Die Akkordeons «Hinweise/Vorbehalte», «Rechenweg (6 Schritte)» und «Annahmen» erscheinen als leere … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §7 Z2 (Print-CSS für Fundstellen, «S–M, Reader-Fläche nach §0.2») + C…]
- [ ] **LM-174** · Blocker · Bei prefers-color-scheme dark bleibt die Wurzelklasse auf «light». Manuelles Umschalten funktioniert. [neu]
- [ ] **LM-175** · Hoch · Sa/So sind als «abgeschwächt» dunkelgrau auf dunkler Pille gesetzt und kaum … [Verdacht → FAHRPLAN-UI-QUALITAET.md §4 Ziff. 2 (axe von Stichprobe auf Flächendeckung, alle Hauptrouten he…]
- [ ] **LM-176** · Mittel · Graue Hilfetexte (#6F6B61, 11–12 px) auf getönten Kartenflächen liegen bei rund … [Verdacht → FAHRPLAN-UI-QUALITAET.md §4 Ziff. 1 (Farbwelt-Baseline enger ziehen, Ausnahmen abbauen) + Präze…]
- [ ] **LM-177** · Hoch · Unterhalb von etwa 1024 px verschwindet der zweite Reiter ersatzlos. Er … [Verdacht → FAHRPLAN-SPLIT-VIEW.md B-4 Mobil-Faltung (✅ FERTIG, Commit 3587d1fd: «< lg → 1 Pane + Reiter-Um…]
- [ ] **LM-178** · Mittel · Zwischen den Reitern liegt ein 6 px breiter Ziehgriff, der ausschliesslich … [neu]
- [ ] **LM-179** · Mittel · Die Positionsangabe je Reiter ist veraltet: der OR-Reiter wird mit «Art. … [Verdacht → FAHRPLAN-SPLIT-VIEW.md B-2.5 Ziff. 4 (merkeTab/aktualisiereTabArtikel aus basisPfad statt windo…]
- [ ] **LM-180** · Detail · «Alle schliessen» ist reiner Text ohne Button-Look. Rechtsprechung und Rechner haben … [neu]

**Code-Flächen (grob, aus den Routen):** `src/index.css`, `src/components/layout/Pane.tsx`, `src/components/layout/TabPanel.tsx`, `src/components/layout/ThemaUmschalter.tsx`.
**Risiko-Klasse:** reines UI (CSS/Layout).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §7 · B6 — Fehler-, Leer- und Ladezustände (K-15)

**14 Befunde** · Blocker 1 · Hoch 9 · Mittel 2 · Detail 2 · `W2·17-UI-BEFUNDE-B6`

- [ ] **LM-159** · Blocker · Das eingebettete PDF erscheint als grosse schwarze Fläche (gemessen 965 × … [Verdacht → FAHRPLAN-GESETZES-UX.md §2.2 ⑦ PDF_EMBED (Z. 259-262) / G3a-Ausführungsvermerk; Code src/pages/…]
- [ ] **LM-160** · Hoch · Die Meldung «EINGABEFEHLER · Fristlänge muss eine ganze Zahl > 0 … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix inkl. error) + Repo-Präzedenz src/components…]
- [ ] **LM-161** · Hoch · `/rechner/prozesskosten`, `/rechner/notariat-grundbuch`, `/rechner/gerichtszitat` und `/rechner/betreibungskosten` enden im Ausgangszustand direkt nach der … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1 N0d/W1 (Streitwert-Platzhalter, ✅ gebaut 11.7.2026) + FAHRPLAN-UI-…]
- [ ] **LM-162** · Hoch · Der Ergebniskasten hat eine feste Höhe von 384 px. Im Ausgangszustand … [Verdacht → FAHRPLAN-GESETZES-UX.md §11 IA-3 (A–Z-Register) + Code src/pages/gesetze-teile/AzRegister.tsx:1…]
- [ ] **LM-163** · Hoch · Beim Scrollen erscheint ein vollständig leeres Fenster, das erst nach kurzer … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.9 U-POSITION/A2 (content-visibility + contain-intrinsic-size, Z. 89…]
- [ ] **LM-164** · Hoch · Artikel ohne erfasste Rechtsprechung zeigen gar nichts — bei Art. 368, … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §1.3/§0 (Badges nur für Abweichungen, Default nackt; Zähler «n erfass…]
- [ ] **LM-165** · Hoch · Der Assistent meldet korrekt «EINGABEFEHLER · Zweck der Offenlegung angeben.» und … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix, error) — gemeinsame Klasse mit LM-160]
- [ ] **LM-166** · Hoch · Sachgebiete ohne Treffer verschwinden ersatzlos aus der Liste: ungefiltert stehen sechs … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §6 J3 (Sachgebiets-Pipeline, Risiko-Pfad QS-GP) + §2 S5-Etappe 2 (Fac…]
- [ ] **LM-167** · Hoch · Beim EMRK fehlt die Lese-Leiste vollständig — kein «Im Gesetz suchen», … [Verdacht → FAHRPLAN-GESETZES-UX.md G2b-Ausführungsvermerk (Z. 567-569: «der pdf-embed-Kopf NICHT … keine t…]
- [ ] **LM-168** · Hoch · Unter dem PDF folgt eine Liste von BGE mit Regeste-Auszügen, die … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §8-Badge-Vokabular («maschinell» = «Automatisch zugeordnet — keine re…]
- [ ] **LM-169** · Mittel · Der Block beschreibt eine Tabelle, die ohne Ereignisdatum nicht gerendert wird. … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Zustandsmatrix: empty) — gemeinsame Klasse mit LM-161]
- [ ] **LM-170** · Mittel · Der Balken «RECHTLICHER HINWEIS – KEINE RECHTSBERATUNG» erscheint zweimal — einmal … [neu]
- [ ] **LM-171** · Detail · Der Untertext bricht mitten im Satz ab: «Fristende ist Werktag bzw. … [neu]
- [ ] **LM-172** · Detail · Dieselbe Aussage einmal gross, einmal klein geschrieben: «Staatlich anerkannte Feiertage …» … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/fehlermeldung.ts`, `src/components/ErrorBoundary.tsx`, `src/components/suche/SucheLeerzustand.tsx`, `src/pages/NotFound.tsx`.
**Risiko-Klasse:** reines UI — Text der Zustände ist §8-relevant (Ehrlichkeit, keine Beschönigung).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §8 · B7 — Overlays und Menüfenster (K-02)

**8 Befunde** · Blocker 1 · Hoch 3 · Mittel 4 · Detail 0 · `W2·17-UI-BEFUNDE-B7`

- [ ] **LM-008** · Blocker · Unter etwa 1000 px übernimmt das Ergebnis-Panel die Breite des Suchfelds … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §2 S6 (Mobiler Such-Fokusmodus, Z.199–207); src/components/layout/Hea…]
- [ ] **LM-009** · Hoch · Das geöffnete Ansicht-Menü schliesst nicht. Es bleibt über Scrollen, eine Suche … [Verdacht → src/pages/gesetz-leser/LeserAnsichtMenu.tsx:137–148 (useDialogFokus + pointerdown-Ausserhalb)]
- [ ] **LM-010** · Hoch · Das Rechtsprechungs-Menü ist rund 460 px hoch und liegt ohne abdunkelnden … [Verdacht → DESIGN-REGLEMENT.md §b «Ton vor Schatten» (Z.375–379); src/pages/gesetz-leser/LeserRechtsprechu…]
- [ ] **LM-014** · Hoch · Der Lesemodus lässt «GEGENSTAND» und «BESETZUNG» weg — die beiden Zeilen, … [neu]
- [ ] **LM-015** · Mittel · Die Menüfenster haben keine abdunkelnde Fläche dahinter und keinen sichtbaren Bezug … [Verdacht → befundliste.json LM-010 (interne Dublette); DESIGN-REGLEMENT.md §b (Z.375–379); src/pages/geset…]
- [ ] **LM-016** · Mittel · Das Sprachmenü ist links vom auslösenden Knopf verankert, obwohl dieser rechts … [Verdacht → src/components/SprachUmschalter.tsx:43]
- [ ] **LM-018** · Mittel · Der Trefferzähler («51 Treffer, davon 40 Artikel — wird noch ergänzt») … [neu]
- [ ] **LM-019** · Mittel · Derselbe Titel steht im Lesemodus in der serifenlosen Schrift, in der … [Verdacht → src/pages/EntscheidLeser.tsx:448 (Haupt-H1) vs. :726 (Lesemodus-H1); DESIGN-REGLEMENT.md §e Zwe…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout/HeaderSuche.tsx`, `src/components/layout/ReiterUebersicht.tsx`, `src/components/layout/VerlaufUebersicht.tsx`, `src/components/suche`.
**Risiko-Klasse:** reines UI (Verankerung, Fokus, Schliessverhalten).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §9 · B8 — Menüinhalt, Zustandsanzeige und Scrollbereiche (K-03 + K-07)

**10 Befunde** · Blocker 1 · Hoch 3 · Mittel 4 · Detail 2 · `W2·17-UI-BEFUNDE-B8`

- [ ] **LM-021** · Hoch · Das Menü enthält zwei Erklärabsätze in 11 px Grauschrift, zusammen rund … [Verdacht → src/components/verzahnung/BezugFacettenWahl.tsx:152–158; src/components/verzahnung/BezugZeitWah…]
- [ ] **LM-022** · Hoch · Die Filterschalter zeigen keinen erkennbaren Aktivzustand: «alle» sieht aus wie «AG». … [Verdacht → ROADMAP.md → W2·7-BEZUG B7 + ROADMAP-CHRONIK.md → W2·7-BEZUG (B7, done 29.7.2026); src/components/v…]
- [ ] **LM-023** · Mittel · «Linien», «Fussnoten» und «Verweise» tragen rechts ein ausgeschriebenes «✓ an» bzw. … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz, §13-F4-Zustandsmatrix, Z.65–72); src/pages/gese…]
- [ ] **LM-024** · Mittel · Das Balkendiagramm zeigt sechs verschieden hohe Balken ohne Werte, ohne Achsenbeschriftung … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §9 B5; src/components/verzahnung/BezugZeitWahl.tsx:1–34 +…]
- [ ] **LM-025** · Detail · Neben «Fussnoten» steht eine unerklärte Zahl (932); bei «Linien» und «Verweise» … [Verdacht → FAHRPLAN-GESETZES-UX.md Z.1430 (A26, David 11.7.2026); src/pages/gesetz-leser/LeserAnsichtMenu.…]
- [ ] **LM-026** · Detail · «aus» und «Fussnoten» stehen inline nebeneinander, «Chronologie» steht darunter in eigener … [neu]
- [ ] **LM-061** · Blocker · Die letzte Karte bzw. der letzte Chip wird am rechten Containerrand … [Verdacht → abnahme/responsive-audit/BERICHT.md D10 + D11 + Systematik-Befund S-B; FAHRPLAN-UI-NAVIGATION.m…]
- [ ] **LM-063** · Hoch · Unter etwa 800 px wird der letzte Tab abgeschnitten («Schiedsverfah»). Kein … [Verdacht → abnahme/responsive-audit/BERICHT.md S-B + D10 (Chip-Band-Affordanz gefixt in SachgebietKacheln.…]
- [ ] **LM-064** · Mittel · Der Gliederungskasten hat eine feste Höhe und schneidet die letzte sichtbare … [Verdacht → FAHRPLAN-GESETZES-UX.md §10.10 E4/A32 (Kontextpanel im TOC-Scroller, gebaut 25.7.2026, PR #346)…]
- [ ] **LM-065** · Mittel · In einem 560 px breiten Reiter ist ein einzelner Entscheid-Chip («Appellationsgericht … [Verdacht → ROADMAP-CHRONIK.md:1227–1245 (W2·7-BEZUG B7, gebaut 29.7.2026, PR #406 5a10f8150); Code: src/pa…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout`, `src/components/forms`, `src/index.css`.
**Risiko-Klasse:** reines UI — Zählwerte in Menüs müssen der Datenlage entsprechen (§8).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §10 · B9 — Textsatz und Umbruch (K-12)

**12 Befunde** · Blocker 1 · Hoch 2 · Mittel 4 · Detail 5 · `W2·17-UI-BEFUNDE-B9`

- [ ] **LM-122** · Blocker · Die H1 bricht mitten im Wort: «Geheimhaltungsvereinbarun / g (NDA)» — … [Verdacht → FAHRPLAN-GESETZES-UX.md Z.162-165 (Silbentrennungs-Fix, G1 ✅) + DESIGN-REGLEMENT-NORMTEXT.md Z.…]
- [ ] **LM-123** · Hoch · Die Textspalte hat über die 1686 Artikel des OR sechs verschiedene … [Verdacht → DESIGN-REGLEMENT-NORMTEXT.md Z.174-183 (Einzug-Skala, Deckel 5 Stufen) + FAHRPLAN-GESETZES-UX.m…]
- [ ] **LM-124** · Hoch · Auf 140 % werden die Verfahrensphasen-Leiste («Materielle Fr…») und der Suchfeld-Platzhalter … [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D5 (A−/A+-Steller beschnitten, Such-Placeholder auf…]
- [ ] **LM-125** · Mittel · Der Hinweis läuft über rund 1070 px bei 11 px Schriftgrösse … [Verdacht → DESIGN-REGLEMENT.md §B2b-Zeile der Audit-Tabelle («Lesespalte ✅ erfüllt, 38× max-w-reading») +…]
- [ ] **LM-126** · Mittel · 19 verschiedene Schriftgrössen über 41 Seiten, darunter Paare wie 14 und … [Verdacht → DESIGN-REGLEMENT.md §B2-Zeile der Audit-Tabelle («🟡 teilweise … 22× text-[…rem] + 6× text-sm/ba…]
- [ ] **LM-127** · Mittel · Vor einem Komma steht ein Leerzeichen: «Dr. A. Pfleiderer (Vorsitz), C. … [Verdacht → public/rechtsprechung/kanton/BS/bs_sozialversicherungsgericht/AH.2025.7.json (Feld rubrum.beset…]
- [ ] **LM-129** · Mittel · Die Regeste-Auszüge brechen mitten im Wort mit Auslassungspunkten ab («… gehören … [Verdacht → ROADMAP.md → W2·6-BGE, Chronik `ROADMAP-CHRONIK.md` → W2·6/BGE-Auszug («BGE-Auszug abgeschnitten — vollständig gefixt 34/34», Schutz-Tor U+20…]
- [ ] **LM-130** · Detail · Text läuft aus der Karte heraus: «Grundausstattung» ragt über den Rand. [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D1 + Systematik-Befund S-C («Grid-Fremdkinder auf Mo…]
- [ ] **LM-131** · Detail · Label-Stile gemischt: oben Monospace-Versalien («DATUM (EREIGNIS)», «FRIST»), im unteren Rechnerteil Grotesk … [Verdacht → DESIGN-REGLEMENT.md §e «Zwei-Stimmen-Regel» (Z.393-399: Mono nur Zahlen/Aktenzeichen) + src/ind…]
- [ ] **LM-132** · Detail · Leerzeichen vor dem Komma: «Dr. med. R. von Aarburg , Dr. … [Verdacht → public/rechtsprechung/kanton/BS/bs_sozialversicherungsgericht/UV.2023.8.json (rubrum.besetzung:…]
- [ ] **LM-133** · Detail · Uneinheitliche Schreibweise des Ingress-Datums: «Vom 23. März 2005 (Stand 3. November … [Verdacht → public/normtext/struktur/bund/*.json (Zeichenkette «Stand am …» steckt im extrahierten Quelltex…]
- [ ] **LM-134** · Detail · Vor jedem Auszug steht ein «★» ohne Beschriftung und ohne Legende; … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md §0/1b + §1.2 + Abnahme-Szenario 4 («Studentin am ★ bekommt an allen v…]

**Code-Flächen (grob, aus den Routen):** `src/components/typografie.tsx`, `src/index.css`, `src/components/NormText.tsx`.
**Risiko-Klasse:** reines UI — Umbruch in Normtext darf den Wortlaut nicht verändern (§7).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §11 · B10 — Aktions-Anker, Symbolknöpfe und Trefferflächen (K-09b)

**7 Befunde** · Blocker 1 · Hoch 1 · Mittel 5 · Detail 0 · `W2·17-UI-BEFUNDE-B10`

- [ ] **LM-084** · Blocker · Die Sprungmarken «↓ Ergebnis» und «Vorschau ↓» sind bei 390 px … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1 N0d/W5 («↓ Ergebnis»-FAB per IntersectionObserver ausblenden — ✅ g…]
- [ ] **LM-086** · Hoch · Der Rücksetz-Link «zurücksetzen» erscheint nur, wenn die Richter-Auswahl gesetzt ist. Bei … [Verdacht → Code: src/components/rechtsprechung/EntscheidFilter.tsx:149–170 + :265 — Kommentar dokumentiert…]
- [ ] **LM-090** · Mittel · Jede Zeile trägt vier Symbolknöpfe (▲ ▼ ⧉ ✕) von je … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §4 R6 (Tap-Target-Pass) und §1 N0d/O3 (Reiter-Tracker); abnahme/respo…]
- [ ] **LM-091** · Mittel · Beim Überfahren erscheint rechts oben eine Leiste «Zitat | Link | … [Verdacht → FAHRPLAN-GESETZES-UX.md §12.5 (EID-2 ✅ 25.7., PR #349 — «David-Gate Platzierung … Sichtprüfung…]
- [ ] **LM-095** · Mittel · Der gewählte Name steht als Chip «C. Müller ×» rechts neben … [Verdacht → ROADMAP.md Z.485-489 R-RICHTER «Block B offen, reines UI (Autocomplete-Facette + ?richter-URL-A…]
- [ ] **LM-096** · Mittel · Neben jedem Normchip steht ein eigenes, etwa 16 px grosses Kopiersymbol … [Verdacht → FAHRPLAN-VERZAHNUNG-UI.md **§0. Kritik-Einarbeitung**, Tabellenzeile 3b (Grammatik-Regel 1: «⧉ nur auf KontextPanel-Chips + NormPopover…]
- [ ] **LM-098** · Mittel · Zwei Paare «A− A+» sind gleichzeitig sichtbar: eines links in der … [Verdacht → Reglement-Konflikt: DESIGN-REGLEMENT-RECHTSPRECHUNG.md Z.200-203 R17 (Reader-eigener A−/A+) geg…]

**Code-Flächen (grob, aus den Routen):** `src/components/ui`, `src/pages/gesetz-leser`, `src/components/rechtsprechung`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §12 · B11 — Karten (K-04)

**13 Befunde** · Blocker 0 · Hoch 4 · Mittel 7 · Detail 2 · `W2·17-UI-BEFUNDE-B11`

- [ ] **LM-027** · Hoch · Die Metazeile der Karten («1'458 Erlasse im Volltext», «23 Rechner», «26 … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–648); src/components/start/RubrikK…]
- [ ] **LM-028** · Hoch · Dasselbe Muster: «ESTV · Stand 01.02.2022» hängt am Titel statt am … [Verdacht → befundliste.json LM-027 (interne Dublette, gleiches Muster andere Route); FAHRPLAN-ARCHIV-RESTP…]
- [ ] **LM-029** · Hoch · Die Zähler (10, 4, 5, 12, 3 …) sitzen direkt hinter … [neu]
- [ ] **LM-030** · Hoch · Die Sachgebietszeile im Kartenkopf bricht je nach Länge auf eine bis … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–648)]
- [ ] **LM-031** · Mittel · Unter dem Inhalt der Erlass-Karten bleiben bis zu 62 px leer … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 «UX-PUNKTELISTE A3» (Z.641–649); Code src/components/normtext…]
- [ ] **LM-032** · Mittel · In Ergebniskartenreihen fehlt einzelnen Karten die dritte Zeile (Normzeile); unter dem … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/components/vorlagen/ui.tsx:210–220 (EckdatenKach…]
- [ ] **LM-033** · Mittel · Die hervorgehobene Karte einer Dreierreihe ist durch ihre Akzentlinie 3–4 px … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/index.css:580–585 (.lc-tile 1px-Rahmen vs. .lc-a…]
- [ ] **LM-034** · Mittel · Werte in einer Kartenreihe mischen Schriftarten: «Neues Recht (ab 1.1.2023)» grotesk … [Verdacht → DESIGN-REGLEMENT.md §4b(e) «Zwei-Stimmen-Regel» (Z.394–399: «Mono nur Zahlen/Aktenzeichen»); Co…]
- [ ] **LM-035** · Mittel · Drei Karten in einer Reihe mit drei verschieden bestückten Metazeilen: EMRK … [Verdacht → FAHRPLAN-GESETZES-UX.md §2 Grundarten ⑦ PDF_EMBED / ⑧ LIVE_VERWEIS (Z.259–266); Code src/compon…]
- [ ] **LM-036** · Mittel · Der Titel ist auf zwei Zeilen begrenzt, füllt sie aber nicht … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20/A3; Code src/components/rechtsprechung/EntscheidKarte.tsx:60–…]
- [ ] **LM-037** · Mittel · In einer etwa 20 px hohen Zeile stehen drei Schriftbilder nebeneinander: … [Verdacht → DESIGN-REGLEMENT.md §4b(e) Zwei-Stimmen-Regel; Code src/components/rechtsprechung/EntscheidKart…]
- [ ] **LM-038** · Detail · Die Karte «Kantone» trägt eine Zusatzzeile «Erfassungsgrad je Kanton: vollständig · … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.2 «Erfassungsgrad-Semantik (SSoT, BINDEND)» + IA-2 (✅ gebaut 16.7.2…]
- [ ] **LM-039** · Detail · Die Karte enthält nur «–» neben zwei gefüllten Karten. [Verdacht → DESIGN-REGLEMENT.md F4 (Zustands-Matrix inkl. empty-State, Z.200–203) + FAHRPLAN-UI-QUALITAET.m…]

**Code-Flächen (grob, aus den Routen):** `src/components/Katalog.tsx`, `src/components/start`, `src/components/ui`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §13 · B12 — Eingabe- und Auswahlfelder — Blocker bis Mittel (K-08a)

**11 Befunde** · Blocker 0 · Hoch 4 · Mittel 7 · Detail 0 · `W2·17-UI-BEFUNDE-B12`

- [ ] **LM-066** · Hoch · Bedienelemente derselben Zeile sind unterschiedlich hoch: Segmentschalter 39 px neben Datumsfeld … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (UX-PUNKTELISTE A3, Betreibungskosten-Kacheln items-start sta…]
- [ ] **LM-067** · Hoch · Auswahlfelder schneiden ihren Wert hart ab, nie mit Auslassung: «– Vorlage … [Verdacht → abnahme/responsive-audit/BERICHT.md D9 (Gesetze-Suchkürzel «hart ohne Ellipsis abgeschnitten»…]
- [ ] **LM-068** · Hoch · Platzhalter werden mitten im Wort abgeschnitten: «Suchen oder Nc» (Kopfleiste mobil), … [Verdacht → abnahme/responsive-audit/BERICHT.md D9 (gefixt: Placeholder «Suchen — Kürzel, Titel, SR-Nr. …»…]
- [ ] **LM-069** · Hoch · Die Liste enthält zwei Einträge mit identischer Beschriftung und verschiedenen Zahlen: … [neu]
- [ ] **LM-070** · Mittel · Das native Datumsfeld ist 52 px hoch, das Zahlen- und das … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3, Zeilen-Ausrichtung Rechner-Formulare, David-Abnahme offe…]
- [ ] **LM-071** · Mittel · Für denselben Bauteiltyp existieren drei rechte Reserven für das Chevron: 38 … [neu]
- [ ] **LM-072** · Mittel · Einzelne Felder sind willkürlich schmal: «Lebende Kinder (Anzahl)» rund 110 px, … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Raster-/Höhen-Ausrichtung in Rechner-Formularen, auto-r…]
- [ ] **LM-073** · Mittel · Das obere Datumsfeld ist ein natives Browserfeld mit Standard-Kalendersymbol und abweichendem … [neu]
- [ ] **LM-074** · Mittel · Die Anzeige folgt der Browsersprache, nicht der Seitensprache: «07/29/2026» statt «29.07.2026». … [neu]
- [ ] **LM-075** · Mittel · Die beiden Datumsfelder sind Browser-Standardfelder und fallen aus dem übrigen Formularbild: … [neu]
- [ ] **LM-076** · Mittel · Das Kästchen ist der Browser-Standard, gemessen 13 × 15.8 px — … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/forms`, `src/components/DatumsFeld.tsx`, `src/components/BetragsFeld.tsx`, `src/components/ui`.
**Risiko-Klasse:** gemischt — Datums-/Zahlenfelder speisen Rechen-Engines: Eingabe-Parsing ist §1-nah.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §14 · B13 — Zahlen-, Datums- und Zählformate (K-11)

**12 Befunde** · Blocker 0 · Hoch 3 · Mittel 5 · Detail 4 · `W2·17-UI-BEFUNDE-B13`

- [ ] **LM-108** · Hoch · Drei Tausendertrennzeichen im Einsatz: typografischer Apostroph 1’000 (`/`, `/rechner/teuerung`), gerader Apostroph … [Verdacht → src/lib/konventionen.ts (SSoT Formulierungsstandard: «CHF 50'000», gerader Apostroph) + PROJEKT…]
- [ ] **LM-109** · Hoch · Die Zahlen der drei Filterzeilen folgen nach dem Filtern verschiedenen Regeln: … [Verdacht → DESIGN-REGLEMENT-RECHTSPRECHUNG.md Z.184 R15 (Facetten mit Trefferzahl) + dokumentierter Code-E…]
- [ ] **LM-110** · Hoch · Alle drei verbliebenen Chips zeigen dieselbe Zahl: «Alle 140 · Kantone … [Verdacht → W2·7-BEZUG B7 (c), Commit 5a10f8150 / PR #406: «Ein Schalter, der in 98,5 % der Fälle nichts be…]
- [ ] **LM-111** · Mittel · «5%» ohne Abstand auf `/rechner/kuendigung`, `/rechner/verzugszins` und `/rechner/inkasso-strecke`, sonst «5 %». [Verdacht → src/lib/konventionen.ts:44 — Regel «Prozent mit Leerschlag («5 %», nicht «5%»)», Muster /\d%/ i…]
- [ ] **LM-113** · Mittel · «+1weitere» — fehlendes Leerzeichen. Erscheint auf jeder Artikelgruppe. [neu]
- [ ] **LM-114** · Mittel · Dieselbe Etikette bedeutet Verschiedenes: Bei der DSGVO steht «Stand 27.04.2016» — … [neu]
- [ ] **LM-115** · Mittel · Ein Platzhalter bleibt stehen: Die Beschriftung lautet «Nachwirkungsfrist vereinbaren (Geheimhaltung gilt … [neu]
- [ ] **LM-116** · Mittel · Ungefiltert steht «5093 Entscheide · 1259 Leitentscheide · 1248 Volltext-Verweise», nach … [neu]
- [ ] **LM-117** · Detail · Der Platzhalter lautet hier «tt.mm.jjjj» in Kleinbuchstaben, in den Rechnern «TT.MM.JJJJ» … [neu]
- [ ] **LM-118** · Detail · Kürzel stehen meist in Klammern («Medizinprodukteverordnung (MepV)»), einmal aber freistehend in … [neu]
- [ ] **LM-119** · Detail · Die Zahl «1'469 Erlasse nach Titel» ist in gesperrter Monospace gesetzt … [neu]
- [ ] **LM-121** · Detail · «Zuständigkeit & Rechtsmittel (ZPO) → · Streitwert (ZPO) → · Fristenrechner … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/locale.tsx`, `src/components/ErgebnisAnzeige.tsx`, `src/components/forms`.
**Risiko-Klasse:** gemischt — Formatierung ist Darstellung, aber jede Zahl stammt aus einer Engine (§3).
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §15 · B14 — Brotkrume, Kopfzeilen und Seitenmeta (K-19a)

**8 Befunde** · Blocker 0 · Hoch 3 · Mittel 1 · Detail 4 · `W2·17-UI-BEFUNDE-B14`

- [ ] **LM-181** · Hoch · Oben die Leiste «Rechner › Verfahrens- & Rechtsmittelfristen ✕», direkt darunter … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1/N0a (Z. 55–63, gebaut 11.7.) · FAHRPLAN-UI-QUALITAET.md §3 + §5 (c…]
- [ ] **LM-183** · Hoch · In der Kopfleiste «A− 100 % A+», in der Meta-Zeile nochmals … [Verdacht → FAHRPLAN-GESETZES-UX.md §3.1 (Z. 305: «Bewusst NICHT als Toggle: Schriftgrösse (existiert globa…]
- [ ] **LM-184** · Hoch · Der Zähler in der Kopfleiste steigt beim Öffnen eines Entscheids von … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §1/N0d·O3 (Z. 96–97, «Toast/Fly-to zum Reiter-Tracker + Tooltip ‹Reit…]
- [ ] **LM-188** · Mittel · Die 404-Seite trägt den Seitentitel der Startseite («LexMetrik — Schweizer Recht … [neu]
- [ ] **LM-195** · Detail · «ESTV» steht als Abschnittsüberschrift und zusätzlich in jeder Karte. Die Karten … [neu]
- [ ] **LM-196** · Detail · Der Knopf steht auf SchKG in einer eigenen Zeile über dem … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §7/Z1 (Z. 447: «ICS-/Kalender-Export des Frist-Ergebnisses … Ist-Stan…]
- [ ] **LM-197** · Detail · Auf einer Seite stehen «‹ Zur Übersicht», «↗ massgebliche Fassung», «↗ … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz: «Chip- und Badge-Grammatik», Bau in W2·10-UI-NA…]
- [ ] **LM-198** · Detail · Das Sprungziel heisst «b-BJ», der Abschnitt trägt die Überschrift «EHRA» mit … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/layout/InhaltsKopf.tsx`, `src/components/RouteMeta.tsx`, `src/pages/Materialien.tsx`.
**Risiko-Klasse:** reines UI/SEO-Meta.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §16 · B15 — Umschalter, Tabs und Akkordeons (K-06)

**9 Befunde** · Blocker 0 · Hoch 2 · Mittel 6 · Detail 1 · `W2·17-UI-BEFUNDE-B15`

- [ ] **LM-052** · Hoch · In Buttongruppen ist eine Option zweizeilig («Automatisch / folgt dem System»), … [neu]
- [ ] **LM-053** · Hoch · Geschlossen erscheint die Klappe als voll breiter, gerahmter Kasten, der nur … [Verdacht → Code src/components/rechtsprechung/EntscheidFilter.tsx:229–230 (<details className="lc-card"> +…]
- [ ] **LM-054** · Mittel · Zwei Umschalter-Stile auf einer Seite: einmal aktiv = fett ohne Fläche, … [Verdacht → Code src/pages/Gesetze.tsx:63–88 (Ebene-tablist) vs. src/pages/gesetze-teile/KantonAuswahl.tsx:…]
- [ ] **LM-055** · Mittel · Ein dritter Umschalter-Stil auf derselben Seitengruppe: aktiv = beige hinterlegt. Das … [neu]
- [ ] **LM-056** · Mittel · Zwei Akkordeon-Stile auf derselben Seite: einmal rechtsbündiges ▼, einmal winziger Pfeil … [neu]
- [ ] **LM-057** · Mittel · Vier Umschaltergruppen gleichzeitig sichtbar, in drei verschiedenen Darstellungen: «Bund | Kantone … [Verdacht → wie LM-054: src/pages/Gesetze.tsx:63–88 + src/pages/gesetze-teile/KantonAuswahl.tsx:110–130; Ka…]
- [ ] **LM-058** · Mittel · Ein weiterer Umschalter-Stil: nummerierte Kreise mit Beschriftung, der aktive Schritt in … [Verdacht → Code src/components/vorlagen/ui.tsx:101–143 (geteilter Stepper)]
- [ ] **LM-059** · Mittel · Die drei Abschnitts-Reiter tragen dasselbe Bild wie die Filterchips der Trefferliste … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Chip-/Badge-Grammatik) + FAHRPLAN-VERZAHNUNG-UI.md §1.2 (KantenChi…]
- [ ] **LM-060** · Detail · Das Akkordeon hat zwei Pfeilmarken (▼ mittig und ▸ ganz rechts); … [neu]

**Code-Flächen (grob, aus den Routen):** `src/components/ui`, `src/components/layout/TabPanel.tsx`, `src/components/forms`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §17 · B16 — Seitengerüst und Inhaltsbreite (K-13)

**8 Befunde** · Blocker 0 · Hoch 2 · Mittel 3 · Detail 3 · `W2·17-UI-BEFUNDE-B16`

- [ ] **LM-136** · Hoch · Die Inhaltsbreite springt: `/einstellungen` bricht bei 1015 px ab, Rechnerseiten bei … [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D7 («Content-Container breiter als bei den Schwester…]
- [ ] **LM-137** · Hoch · Der Inhalt endet auf der Materialienseite bei 940 px, während Brotkrumenleiste … [Verdacht → abnahme/responsive-audit/BERICHT.md §Systematik S-D + §0-Befund-Bereiche («materialleser 390/25…]
- [ ] **LM-138** · Mittel · Der Kasten ist 620 px breit und mittig gesetzt, während alle … [Verdacht → abnahme/responsive-audit/BERICHT.md §0-Befund-Bereiche: «entscheidleser-bge (768–2560)» — von z…]
- [ ] **LM-139** · Mittel · Spalte «Navigation» hat rund 52 px Zeilenabstand gegenüber der kompakten Spalte … [Verdacht → abnahme/responsive-audit/BERICHT.md Defekt D2 + §Abarbeitung («D2 ✅ gefixt: Shell-Kopf/Fuss-Tap…]
- [ ] **LM-141** · Mittel · Die 859 Erlasse sind in zwei nebeneinanderliegenden Spalten gesetzt; beim Lesen … [Verdacht → FAHRPLAN-GESETZES-UX.md §11 IA-3 «A–Z-/Kürzel-Register ✅ GEBAUT + GEMERGT 25.7.2026» (Z.1727-17…]
- [ ] **LM-142** · Detail · Der Kalender nutzt nur rund zwei Drittel der Kartenbreite; rechts bleiben … [neu]
- [ ] **LM-143** · Detail · Der Erklärtext beginnt ganz links bei x ≈ 346, der zugehörige … [neu]
- [ ] **LM-145** · Detail · Die Navigationsspalte setzt fünf Links in 14 px mit rund 47 … [Verdacht → abnahme/responsive-audit/BERICHT.md D2 (✅ gefixt: Fuss-Tap-Ziele 44 px) + src/components/layout…]

**Code-Flächen (grob, aus den Routen):** `src/components/layout/Shell.tsx`, `src/components/layout/Footer.tsx`, `src/index.css`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §18 · B17 — Schaltflächen — Varianten, Gewichtung, Deaktiviert-Zustand (K-09a)

**8 Befunde** · Blocker 0 · Hoch 1 · Mittel 6 · Detail 1 · `W2·17-UI-BEFUNDE-B17`

- [ ] **LM-085** · Hoch · Drei Gewichtungen nebeneinander: «PDF-Rechenbericht» gefüllt, «In Kalender (.ics)» outline, «Link teilen» … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz: Kopier-/Export-Affordanz, §13-F4-Zustandsmatrix…]
- [ ] **LM-087** · Mittel · 34 verschiedene Button-Varianten aus Höhe · Radius · Schriftgrad · Schnitt … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (Muster-Konsistenz) + §4 Ziff. 1/3 (Gate-Verschärfung); DESIGN-REGL…]
- [ ] **LM-088** · Mittel · Mehrere Aktionen sind reiner Text ohne Fläche oder Rahmen und dadurch … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §4 R6 (Tap-Target-Pass, Hitbox ≥24 px/Ziel 44, WCAG 2.5.8 — offen, Re…]
- [ ] **LM-089** · Mittel · Deaktivierte Knöpfe sind allein über opacity 0.5 gekennzeichnet. Der primäre «Weiter … [Verdacht → FAHRPLAN-UI-QUALITAET.md §3 (§13-F4-Zustandsmatrix «inkl. disabled/loading/selected/empty/error…]
- [ ] **LM-093** · Mittel · Die noch nicht verfügbare Karte «Verwaltung» unterscheidet sich von den drei … [Verdacht → DESIGN-REGLEMENT.md Z.196-201 (Zustandsmatrix inkl. disabled) + FAHRPLAN-UI-QUALITAET.md §3/§5(…]
- [ ] **LM-094** · Mittel · Der gesperrte «Weiter →» behält die volle dunkle Füllung (rgb 28,26,21) … [Verdacht → DESIGN-REGLEMENT.md Z.196-201 (alle Zustände inkl. disabled) + FAHRPLAN-UI-QUALITAET.md §3/§5(c…]
- [ ] **LM-097** · Mittel · Der Knopf ist die einzige nahezu schwarze Fläche der Seite und … [Verdacht → CLAUDE.md §7 Zitat-Ausnahme lit. c (im UI sichtbarer Live-Link) + Code-Entscheid src/pages/Mate…]
- [ ] **LM-099** · Detail · «heute» ist fetter Text ohne Fläche oder Rahmen. [Verdacht → FAHRPLAN-UI-QUALITAET.md §3/§5(c) (Muster-Konsistenz, Chip-/Badge-Grammatik) + Token src/index.…]

**Code-Flächen (grob, aus den Routen):** `src/components/ui`, `src/index.css`, `src/components/vorlagen`.
**Risiko-Klasse:** reines UI — der Deaktiviert-Zustand darf keine Bedienlogik verändern.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §19 · B18 — Listen, Suche und Relevanz (K-19b)

**8 Befunde** · Blocker 0 · Hoch 1 · Mittel 7 · Detail 0 · `W2·17-UI-BEFUNDE-B18`

- [ ] **LM-182** · Hoch · Rund 110 px Zeilenabstand pro Eintrag — sichtbar sind etwa 6 … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §6/O2 (Z. 429–433, Sidebar-Konsistenz) · §4/R6 (Z. 321–328, Chevron-H…]
- [ ] **LM-185** · Mittel · Die Zeilenlabels stehen inline und sind unterschiedlich lang — die drei … [Verdacht → FAHRPLAN-UI-NAVIGATION.md §6/J2 (Z. 397–402, Filterblock/Bottom-Sheet mobil) · FAHRPLAN-UI-QUAL…]
- [ ] **LM-186** · Mittel · Drei Suchfelder mit drei Bedeutungen, drei Gestaltungen und zwei Ausrichtungen: «Suchen … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.5/IA-4 (gebaut+gemergt 25.7.2026, PR #350) · FAHRPLAN-UI-NAVIGATION…]
- [ ] **LM-187** · Mittel · Die Suche liefert Art. 74 OR, Art. 581a OR, Art. 699b … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.5/IA-1 (gebaut 16.7.2026, PR #264 — «OR 257d» Zielartikel oben, e2e…]
- [ ] **LM-189** · Mittel · Die Kantonsflächen sind rosa, violett, hellblau, mintgrün — ausserhalb der warmen … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.5/IA-2 + §11.9 Ziff. 14 (O4-Korrektur: «Kartenrest nur nach Prod-Re…]
- [ ] **LM-190** · Mittel · Am Monatsübergang stossen zwei separat abgerundete Pillen aneinander — sichtbare Kerbe … [neu]
- [ ] **LM-191** · Mittel · Die Spalte ist linksbündig gesetzt; dadurch steht «Jahre» bei «10 Jahre» … [neu]
- [ ] **LM-192** · Mittel · Internationale Erlasse liegen unter «/gesetze/bund/EMRK», «/gesetze/bund/CISG», «/gesetze/bund/LUGUE» — die Adresse führt … [Verdacht → FAHRPLAN-GESETZES-UX.md §11.4 Ziff. 3 + §11.10/IA-6 (gebaut+gemergt 25.7.2026, PR #353) sowie §…]

**Code-Flächen (grob, aus den Routen):** `src/pages/Gesetze.tsx`, `src/components/suche`, `src/lib/suche`.
**Risiko-Klasse:** RISIKO — Such-/Ranking-Logik (LM-187 Substring-Treffer) ist keine reine UI: `check:gegenpruefung` + `eval:suche`.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §20 · B19 — Eingabe- und Auswahlfelder — Detail (K-08b)

**7 Befunde** · Blocker 0 · Hoch 0 · Mittel 0 · Detail 7 · `W2·17-UI-BEFUNDE-B19`

- [ ] **LM-077** · Detail · Die drei Optionen liegen 11 px versetzt zueinander. [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — gleichrangige Bedienelemente einer Reihe auf einer Lini…]
- [ ] **LM-078** · Detail · Ein Label für zwei Bedienelemente; das Zahlenfeld hat keine eigene Beschriftung. [neu]
- [ ] **LM-079** · Detail · Zwei Label-Ebenen im selben Formular (dunkel/fett gegenüber klein/grau) ohne erkennbare Logik; … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — src/components/forms/GebvKostenForm.tsx:97, Betreibungs…]
- [ ] **LM-080** · Detail · Die Felder in der Unterkarte sind gegenüber den Feldern ausserhalb um … [neu]
- [ ] **LM-081** · Detail · «Erwägung» ist halb so breit wie «Band» und «Seite»; die zweite … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Raster-/Höhen-Disziplin in Rechner-Formularen, offen)]
- [ ] **LM-082** · Detail · Der Radiobutton steht bei zweizeiligen Titeln vertikal zentriert zwischen den Zeilen, … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Ausrichtung gleichrangiger Bedienelemente, offen)]
- [ ] **LM-083** · Detail · Die zweite Rasterreihe enthält nur zwei Karten, die dritte Rasterzelle bleibt … [Verdacht → FAHRPLAN-ARCHIV-RESTPUNKTE.md §20 (A3 — Kachel-/Rasterverhalten in Rechner-Formularen, auto-row…]

**Code-Flächen (grob, aus den Routen):** `src/components/forms`, `src/components/ui`.
**Risiko-Klasse:** reines UI.
**Prod-Re-Audit-Pflicht:** ja — vor Baubeginn alle Befunde dieses Batches am Prod-Stand
reproduzieren (§0.1); nicht Reproduzierbares als «erledigt (überholt)» schliessen.

## §21 · B20 — Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)

**15 Befunde** · Blocker 1 · Hoch 5 · Mittel 6 · Detail 3 · `W2·17-UI-BEFUNDE-B20`

**Prod-Nachmessung 3.8.2026: 13/15 bestätigt, 2 Vorlagen (LM-042 Extraktion, LM-112 David).**

- [x] **LM-011** · Hoch · Die Suche lässt sich per Tastatur öffnen (Strg+K setzt den Fokus … [bereits gebaut → src/components/layout/HeaderSuche.tsx:142–156 + 170–177; src/components/suche/SuchResultate.tsx…] — Prod-Nachmessung 3.8.2026: ArrowDown setzt genau 1 `aria-selected`-Option, Enter navigiert zu `#art-257`, Fokus bleibt im Suchfeld.
- [x] **LM-012** · Hoch · Der Lesemodus öffnet als Dialog mit korrekter Auszeichnung (role=dialog, aria-modal=true, Beschriftung … [bereits gebaut → src/pages/EntscheidLeser.tsx:669–691 (useEffect im LesemodusOverlay)] — Prod-Nachmessung 3.8.2026: Fokus liegt beim Öffnen auf dem ✕-Knopf im Dialog, Tab bleibt in der Fokusfalle.
- [x] **LM-013** · Hoch · «A+» ist im Moment des Öffnens bereits gesperrt (disabled), «A−» nicht. … [bereits gebaut → src/pages/EntscheidLeser.tsx:157–169 (FS_STUFEN, ladeFsIdx) + 232–236 (setFs, localStorage rsp-…] — Prod-Nachmessung 3.8.2026: A− und A+ beim Öffnen beide `disabled=false`, Klick auf A+ hebt `rsp-fs-idx` sauber.
- [x] **LM-017** · Mittel · Beide Panels sind ebenfalls weit links vom Auslöser verankert und überlagern … [bereits gebaut → src/components/layout/ReiterUebersicht.tsx:35–46 + 163; src/components/layout/VerlaufUebersicht…] — Prod-Nachmessung 3.8.2026: beide Panels rechtsbündig exakt am Auslöser (Panel-`right` = Trigger-`right`, 4px darunter).
- [ ] **LM-042** · Hoch · Ein «ff.»-Zitat wird auf mehrere Einzelartikel gebucht: Derselbe Entscheid (Sozialversicherungsgericht BS … [bereits gebaut → src/lib/rechtsprechung/zitat-extraktion.ts:365 (GLIED_KOPF: «Sub-Marker/ff. werden bewusst NICH…] — ⛔ Rest offen — ff.-Marker fehlt im Artefakt, Fix läge in der Zitat-Extraktion (Risiko-Klasse §0.3); als Auflage beim nächsten Extraktions-Schritt (→ ROADMAP W2·6-ZNETZ, Merkposten dort).
- [x] **LM-043** · Hoch · Am Verweis ist nicht erkennbar, ob der Entscheid zur geltenden Fassung … [bereits gebaut → FAHRPLAN-VERZAHNUNG-UI.md §V1c «Normrevisions-Ehrlichkeit»; Code src/lib/verzahnung…] — Prod-Nachmessung 3.8.2026: ↻-Chip an Art. 367/370 trägt `aria-label`/`title` mit Revisionsdatum 01.01.2026 + AS 2025 270.
- [x] **LM-062** · Blocker · Die Tabelle wird rechts abgeschnitten, ohne Scrollbereich und ohne Hinweis. Die … [bereits gebaut → src/components/forms/ErbteilungForm.tsx:305 (lc-card p-5 overflow-x-auto) + :307 (table min-w-[…] — Prod-Nachmessung 3.8.2026: `overflow-x-auto` mit `scrollWidth 712 > clientWidth 298`, Pflichtteil-Spalte nach Scroll vollständig sichtbar.
- [x] **LM-092** · Mittel · Der Erklärtext ist gepunktet unterstrichen, aber nicht klickbar, und steht auf … [bereits gebaut → src/components/EntwurfLegende.tsx:33-42; FAHRPLAN-UI-NAVIGATION.md §1 N0d·W3 (✅ gebaut 11.7.202…] — Prod-Nachmessung 3.8.2026: Erklärtext ist `<button aria-expanded>`, Klick öffnet die Toggletip-Karte; `cursor:help` statt Link-Optik.
- [x] **LM-100** · Detail · Zwei Links in derselben Zeile in zwei Stilen: «Kantonale Gesetzessammlungen (lexfind) … [bereits gebaut → src/pages/Gesetze.tsx:538-545 (auch :425-426)] — Prod-Nachmessung 3.8.2026: beide Links identisch gestylt (`text-brass-700`, `no-underline`, 12px), einziger Unterschied der bewusste ↗-Aussenmarker.
- [ ] **LM-112** · Mittel · Das Zählformat wechselt je nach Filterzustand zwischen «LEITENTSCHEIDE 2» und «LEITENTSCHEIDE … [bereits gebaut → src/pages/gesetz-leser/bezugPortion.ts:128 zahlText() + W2·7-BEZUG B7, Commit 5a10f8150 (David…] — ⛔ David-Vorlage — Entscheid 29.7.2026 (zahlText, 5a10f8150) trägt; sichtbare Erklärung der ‹X von Y›-Zählweise wäre Änderungsentscheid.
- [x] **LM-120** · Detail · «Index (Basis Dezember 2020 =100)» — Leerzeichen vor dem Gleichheitszeichen, keines … [bereits gebaut → src/components/forms/TeuerungForm.tsx:164 und :169 (auch :114)] — Prod-Nachmessung 3.8.2026: beide Ergebniskarten zeigen «= 100» mit Leerzeichen vor und nach dem Gleichheitszeichen.
- [x] **LM-128** · Mittel · Der goldene Aufzählungspunkt klebt ohne Abstand am ersten Buchstaben: «•WENDET AN … [bereits gebaut → src/index.css:549-550 — .lc-punkt { … margin-right:.375em; }] — Prod-Nachmessung 3.8.2026: gemessener Abstand Marke→erstes Zeichen 4.13px (`margin-right .375em`), kein Kleben.
- [x] **LM-135** · Detail · Innerhalb einer Zeile wechselt die Schrift: «Eidgenössische Steuerverwaltung · Stand 01.02.2022 … [bereits gebaut → DESIGN-REGLEMENT.md §e «Zwei-Stimmen-Regel»: «Serif … zitierfähiger Quelltext; Sans a…] — Prod-Nachmessung 3.8.2026: nur `.num`-Elemente (Zahlen/Aktenzeichen) stehen in Geist Mono — Zwei-Stimmen-Regel greift durchgängig, kein Gegenbeispiel.
- [x] **LM-193** · Mittel · Ganz rechts in der Brotkrumenleiste steht ein «×» ohne Beschriftung und … [bereits gebaut → src/components/layout/InhaltsKopf.tsx:154–157 (aria-label/title = «Schliessen (zur Startseite)»…] — Prod-Nachmessung 3.8.2026: ✕ trägt `aria-label`/`title` «Schliessen (zur Startseite)», abgegrenzt vom Lesemodus-✕ mit sichtbarem Text.
- [x] **LM-194** · Mittel · Die Übersicht stellt sämtliche 1549 Detailverweise auf einmal dar, ohne Blätterung … [bereits gebaut → src/pages/Materialien.tsx:73–108 (Behörden-Select, Doktyp-Select, Suchfeld «Titel, Nummer oder…] — Prod-Nachmessung 3.8.2026: Behörde-/Doktyp-Select + Suchfeld filtern wirksam, 1549 → 2 Treffer bei Eingabe «Umstruktur».

> **Nachtrag 3.8.2026 — zwei Neu-Beobachtungen aus der Prod-Nachmessung, keine neuen Schritte:**
> **LM-193-Nachsatz:** eine *sichtbare* Beschriftung des ✕ («zur Startseite») gibt es weiterhin
> nicht, nur über den zugänglichen Namen (`aria-label`/`title`) — sichtbare Beschriftung wäre ein
> neuer Posten, kein B20-Fund. **LM-194-Nachsatz:** ungefiltert rendert `/materialien` alle 1549
> Detailverweise auf einmal, ohne Blätterung/Nachladen — das ist ein §15-/Perf-Posten (Nähe
> QS-PERF), kein Auffindbarkeits-Posten.

**Code-Flächen (grob, aus den Routen):** `src/components`, `src/pages`.
**Risiko-Klasse:** kein Neubau — Nachmessung; nur wenn eine Prüfung fehlschlägt, wird daraus ein Bau-Posten.
**Prod-Re-Audit-Pflicht:** dieser Batch **ist** das Re-Audit — je Befund die Spalte «Prüfen»
am Prod-Stand wiederholen; verschwunden ⇒ abhaken, sonst als Bau-Posten neu aufnehmen.

---

## §22 · Fortschritts-Regel

1. Ein erledigter Befund wird **in seinem Batch-§ abgehakt** (`- [ ]` → `- [x]`), mit
   einem Halbsatz dahinter, was gebaut wurde bzw. warum er überholt war.
   **Drei Erledigt-Formen (Ergänzung 2.8.2026, Anlass LM-048/041/044):** *gebaut* ·
   *erledigt (überholt)* nach §0.1 · **erledigt (verworfen)** — der Befund wird bewusst NICHT
   umgesetzt, weil ein Bestands-Entscheid trägt (§0.2). «Verworfen» wird ebenfalls **abgehakt**,
   mit Entscheid-Datum und Entscheider im Halbsatz; ein unerledigtes Kästchen für etwas, das
   niemand mehr baut, ist eine Unwahrheit im Fortschritt (§8). Wird ein Befund dagegen in einen
   **eigenen Schritt** ausgelagert, bleibt das Kästchen offen und die Zeile nennt die Ziel-ID —
   er ist dann nicht erledigt, sondern umgezogen.
2. Ist ein Batch vollständig abgehakt, wird der ROADMAP-Teilschritt gesetzt:
   `npm run plan:set -- W2·17-UI-BEFUNDE-B<k> status=done` — danach `npm run check:plan`.
3. **Session-Karte Pflicht** (Übergabe-Block: was gebaut, was überholt, was offen blieb).
4. Sind alle Batches done, wird `W2·17-UI-BEFUNDE` selbst auf `done` gesetzt.
5. Der Wortlaut in `docs/ui-befunde-2026-07/` wird dabei **nicht** angefasst — er ist die
   Quelle, nicht der Stand (§5).

---

## §23 · N1 — LM-044-Nachzug: Chip-Grammatik `lc-chip-zeile` ausrollen

**1 Befund (LM-044, Mittel, K-05/K-10)** · `W2·17-UI-BEFUNDE-N1` · reines UI (§3)

**Herkunft.** LM-044 stand in §2 als «⛔ zurückgestellt» mit dem Grund «Bestands-Entscheid trägt:
`FAHRPLAN-GESETZES-UX.md` §10.8 A25/C-3 = ausdrücklich DEFER, U-VERWEIS-Kollision». Die Prüfung
vom 2.8.2026 hat diesen Grund widerlegt: **U-VERWEIS (#170) ist am 10.7.2026 gemergt**
(`7f6b9a17b`), **C-3 selbst am 11.7.2026 gebaut** (`feat/v2-c3`, `13fee95ed`), und die Spec-Heimat
[`FAHRPLAN-GESETZESDARSTELLUNG-V2.md`](FAHRPLAN-GESETZESDARSTELLUNG-V2.md) §2/F5 (C-3-Zeile) sagt
das seit demselben Tag wörtlich («Deferral-Grund weg»). Der DEFER-Vermerk in §10.8 war eine **stale
Kopie** — zwei Wahrheiten über denselben Sachverhalt (§5). Die Kopie ist am 2.8.2026 geheilt
worden; der Bestands-Entscheid, auf den sich die Zurückstellung berief, existierte zum Zeitpunkt
der Zurückstellung schon nicht mehr. **David-Entscheid 2.8.2026: geöffnet.**

**Auftrag (klein, abgeschlossen).** Die in B1 gebaute Container-Klasse **`lc-chip-zeile`**
(`src/index.css:742–755`) auf die übrigen Chip-Reihen ausrollen, damit dieselbe Form überall
dasselbe bedeutet:

- **Fläche a — Filter-Chips Rechtsprechung:** `src/components/rechtsprechung/EntscheidFilter.tsx`
  (Facetten-Knöpfe `FacettenGruppe` :36–42 und die Aktiv-Filter-Chips :275–279 — beides
  `button.lc-chip`).
- **Fläche b — Materialien-/Vorlagen-Routen:** die Chip-Reihen der `src/pages/Materialien.tsx`-
  und Vorlagen-Strecken samt `src/components/vorlagen/NormChip.tsx`.

**Was schon von allein trägt und was nicht (Prüfbefund 2.8.2026, §8).** Es gibt **zwei**
Komponenten namens `NormChip`, und nur eine erbt automatisch:

| Komponente | Element | Verhalten unter `lc-chip-zeile` |
|---|---|---|
| `src/components/vorlagen/NormChip.tsx` (`CHIP_LINK_CLASS`, :48/:50) | `<a>` | **erbt automatisch** die Link-Unterstreichung |
| `src/components/rechtsprechung/NormChip.tsx` (:11) | `<span role="button">` | **erbt NICHTS** — die Grammatik-Selektoren heissen `a.lc-chip` / `button.lc-chip` |

Der `span` ist dort **kein Versehen, sondern begründet** (Kommentar :4–10: der Chip liegt als
Nachkomme in einem Karten-`<a>`; ein `<a>`/`<button>` darin wäre ungültiges Inhaltsmodell). Die
Auftragsannahme «NormChip rendert als `<a>` und erbt automatisch» trifft darum nur auf die
Vorlagen-Variante zu. **Zu entscheiden im Bau, nicht vorher anzunehmen:** entweder die Grammatik
bekommt eine dritte Regel `[role="button"].lc-chip` mit derselben Optik wie `button.lc-chip`
(dann sieht die Aktions-Achse überall gleich aus) — oder die Rechtsprechungs-Karte bleibt
ausdrücklich ausserhalb der Grammatik, mit einer Zeile, warum.

**Ehrliche Abgrenzung (bindend).** Dieser Schritt deckt **nur die Element-Art-Achse**
(Link `a` / Aktion `button` / Angabe `span`). Die **Metadatum-Achse** — also welche Angaben
überhaupt als Chip auftreten dürfen und welche als Fliesstext (Normverweis vs. Statusbadge vs.
Standangabe vs. Sprache vs. Instanz vs. Gemeinwesen, der eigentliche Kern von LM-044) — gehört zu
[`FAHRPLAN-UI-QUALITAET.md`](FAHRPLAN-UI-QUALITAET.md) §3(c) / `W2·10-UI-NAV` und wird hier
**nicht vorgegriffen**. Wer sie hier mitbaut, greift einem anderen Schritt vor (§14.3).

**Sequenz (§12).** Bau erst **nach der Landung von PR #408** (`lc-chip-zeile` entsteht dort — vorher
existiert die Klasse auf `main` nicht) **und PR #409** (Flächen-Überschneidung Vorlagen/Normzitate).
Beides ist eine PR-Landung, keine Plan-ID, und darum als `seq-hart`-Vermerk am `@meta` geführt, nicht
als `dep` — `dep` kennt nur Schritt-IDs.

**DoD.** Golden byte-gleich · CLS 0 · hell/dunkel je Fläche gesichtet · Gegenprüfung `n/a`
(reines UI, kein Risiko-Pfad) · die Grammatik-Entscheidung zum `span[role=button]` steht danach
als Satz in `src/index.css` beim Regelblock, nicht nur im Fahrplan.
