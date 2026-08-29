# ARCHIV — ausgelagerte Abschnitte aus `fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md`

**Herkunft.** Plan-Neuschnitt 29.8.2026 (Auftrag David): je Fahrplan bleiben AKTIV nur der
Kopf und die §§, auf die ein OFFENER ROADMAP-Schritt zeigt. Alles Übrige steht hier —
**wörtlich, ungekürzt, nicht nachgeführt**. Wer einen dieser Abschnitte wieder braucht,
zieht ihn von hier zurück in die aktive Datei, statt ihn neu zu schreiben.

---

## §1 Befund-Kern (Root-Causes, alle belegt)

| Achse | Wurzel | Beleg |
|---|---|---|
| **Fussnoten VZG** | Extraktor liest die Fussnoten-Nummer NUR aus `#fnbck`-Back-Links (`fussnoten-extrahiere.ts:52`); 22 ältere Erlasse (VZG, ENTG, KOV, BGBB, KKV_FINMA, FZA, LUGUE, VRK …) nutzen die alte Definition-Form `<p id="fn-…"><sup>1</sup>TEXT` OHNE fnbck → `nr=''` für ~922 Fussnoten; Renderer überspringt nummernlose (`parts.tsx:157 if (!f.nr) continue`) → keine Marker, anonymer Apparat. Zusätzlich echter zweiter Drop: 17 VZG-Noten fehlen ganz, weil die Artikel-Regex (`:77 id="art_…"`) die Schlussbestimmungs-IDs `disp_*/art_*` verfehlt. | VZG-Roh-HTML: 0× fnbck, 226 Inline-Marker; Sidecar 207/207 `nr=''`; Arithmetik 226−(203+4+2)=17 geht exakt auf |
| **Präambel-Fussnoten** | Strukturell nie inline verlinkt — bei ALLEN Erlassen (auch OR): `kopf-extrahiere.ts:88-102` speichert keine Position (absatz:null), `ErlassKopfBlock` (parts.tsx:373-389) rendert reinen Text ohne Marker, Apparat ohne Anker. | Code + Prod |
| **BGE-Steuerung** | Weder Ab-/Anwahl noch Zeitfilter; fix 5 sichtbar nach Gewicht. ABER: alle 931 Kanten in 19 Shards tragen ein valides ISO-`datum` (1999–2026, 13 Bandjahr-Platzhalter) → Zeitfilter OHNE Datenarbeit machbar. | `norm-index/<KEY>.json`, LeitfallZeile parts.tsx:37-92 |
| **Liniengliederung** | Dreifach: (1) Auto-Default schaltet Guide auf strukturTiefe≥3 GANZ aus — trifft genau ZGB/OR (bewusste #161-Politik, David re-meldet als kaputt); (2) der eine Guide ist mit ~1.2:1 Kontrast praktisch unsichtbar (`--guide-gliederung` 10 %/14 %); (3) Einzug-Staffelung existiert (20/40/60 px rekursiv), deckelt aber bei Ebene 3 und kollabiert mobil. Datenbasis/Golden gesund, rein client-seitig. | linienAufbau.ts:101-104, index.css:56/169, inhalt.tsx:961-965 |
| **Farben** | Reader faktisch bichromatisch (Tinte+Messing): Norm-Verweis-Chip und BGE-Chip optisch identisch; ★ Leitentscheid und ↻ Revisions-WARNUNG derselbe Ton (StatusBadge.tsx:91); Currency-Chips ohne Status-Semantik; Apparat undifferenziert. Vier fertig kalibrierte Token-Familien (sage/slate/warn/danger, hell+dunkel) liegen im Reader UNGENUTZT. | index.css:73-96/180-187, KantenChip.tsx:41, ui.tsx:109 |
| **Kopf** | Nach #165 schon datenreich (SR·Stand·geltende Fassung·Currency·Ansicht-Dropdown). Lücken: kein Inkrafttreten; Fussnoten-Anwahl im Dropdown vergraben, kein Kopf-Signal/Apparat-Sprung; 54 Sidecars ohne Erlassdatum — NICHT Code-Lücke, sondern **überholte Pins** (html-0 liefert Soft-404-Angular-Shell; html-4 + heutiger Extraktor liefern korrekt). | parts.tsx:418-452; Verdikt-Empirie mit npx tsx |

**Querschnitts-Wurzel — ✅ GESCHLOSSEN 11.7.2026 (Branch `fix/fedlex-p1ab-pin-kanonik`, `Roadmap: W2·6`).** `fedlex-cache.sh` dockte bei **166/227** Pins (nicht nur den n=0-Ausgangsschätzern) an die nicht-kanonische Alias-URL an → Alt-Generations-Dumps + Soft-404-Casemates-Shells. Alle html-N sind jetzt die registrierte `isExemplifiedBy`-Manifestation (`scripts/fedlex-manifest.ts` + `fedlex-repin-kanonik.ts`), dauerhaft bewacht vom **Kanonik-Arbiter** in `check:fedlex-versionen`. 104 Snapshots + 130 Struktur-Sidecars aus der kanonischen Fassung regeneriert (kein Parser-Eingriff → alle Diffs amtlich; kein `art_`-Verlust; OR-Kronjuwel-Korruption geheilt). Der stille `struktur-run`-Skip ist gefixt (**«0 übersprungen»-Pflichtkontrolle** + Cache-Sicherstellung, fehlender Cache = harter Fehler); cache.sh trägt eine Casemates-Shell- + Anker-Count-Sonde. Damit steht **F2/FN-1/K-1 nicht mehr auf alten Dumps/Soft-404-Shells** — die restlichen FN-1/K-1-UI-Heilungen (parts.tsx/Kopf) bleiben der Kopf-Einheit. Beleg: `bibliothek/register/fedlex-pin-kanonik-2026-07-11.md`, Portfolio §Paket 1.

---

## §2 Massnahmen (alle Fable-verifiziert, Korrekturen eingearbeitet)

### F2 · Kopf nützlicher + Fussnoten-Anwahl (Aufwand M)
- **K-1 Daten (S-M):** NUR Inkrafttreten ist neu — Erlassdatum wird seit 29.6. extrahiert UND gerendert («vom … (Stand am …)», parts.tsx:367-369); die 54 Lücken sind Pin-Staleness → mit P1-a/b-Pin-Refresh regenerieren, KEIN neuer Code. Inkrafttreten-Quelle nach §7 empirisch proben: **SPARQL-Route empfohlen** (fedlex-sparql.ts, `jolux:dateEntryInForce`, Anbau an Currency-Pipeline) statt neuem AKN-XML-Cache-Plumbing (würde Aufwand → L treiben). Konservativ bei Teil-Inkrafttreten (§7), Gegenprüfung Pflicht. Meta-Zeile: nur «in Kraft seit …» ergänzen — «vom …» NICHT doppeln (§5).
  - **✅ GEBAUT 12.7.2026 (`feat/v2-k1`, Opus; Bau-Go = Davids General-Delegation 11.7. «du hast bei allem was ich entscheiden muss selbst die wahl» → Orchestrator-Entscheid: bauen).** SPARQL-Route bestätigt: **`jolux:dateEntryInForce` am ABSTRACT-ELI (cc) selbst** = Ur-Inkrafttreten des Erlasses (empirisch §7: OR/ZGB 1912-01-01, BV 2000-01-01, nDSG 2023-09-01, AHVG 1948-01-01, SchKG 1892-01-01 — alle famos-amtlich belegt). **Nicht** aus den Paket-5-Revisionen abgeleitet: deren früheste `dateEntryInForce` listet über die SR-Taxonomie auch VORGÄNGER-Erlasse (ADOV → 1973er «Verordnung über die Adoptionsvermittlung»), ist also NICHT das Ur-Inkrafttreten des heutigen Erlasses (Auftrags-Warnung empirisch bestätigt). **Build-time wie U-PDF-Muster #189** (KEINE Client-SPARQL): neuer Netz-Generator `scripts/normtext/inkrafttreten-generieren.ts` (`gen:inkrafttreten`) → Sidecar `public/normtext/inkrafttreten.json` ({key:{datum,quelle:'fedlex'}}); `browse-manifest.ts` projiziert offline in `register.json` → **`BrowseErlass.inkraftSeit`** (synchron am Erlass ⇒ **CLS 0**). **Konservativ (§7/§8):** nur bei GENAU EINEM `dateEntryInForce` je Abstract; null/mehrdeutig (Teil-Inkrafttreten) ⇒ weggelassen (kein geratenes Datum). **Abdeckung 227/227 Bund** (alle eindeutig, 0 mehrdeutig, 0 fehlend). **Kanton bewusst weggelassen (§8):** LexWork trägt kein strukturelles Ur-Inkrafttreten (`enactment` = Beschlussdatum; `version_dates_str` = In-Kraft der aktuellen Version = «Stand») — ein abgeleitetes «in Kraft seit» wäre falsch oder eine Stand-Dublette. **Meta-Zeile:** `ErlassLeserKopf.tsx` ergänzt nur «in Kraft seit …» nach «Stand»; «vom …» bleibt im Ingress (`ErlassKopfBlock`), NICHT gedoppelt. **Golden-Klasse: Engine-Golden byte-gleich** (`golden:vergleich` IDENTISCH, 209 Fälle — kein `vorlagen/tarif`-Eingriff); **register.json + daten-manifest additiv-ändernd** (neues Feld `inkraftSeit`, `datenhaltung:manifest` nachgezogen, `check:paritaet` grün = Feld überlebt DB-Projektion). **Gegated:** `inkrafttreten.test.ts` (Erhebe-Logik + Konservatismus + Sidecar/Projektions-Integrität + Coverage-Boden) · e2e `leser-kopf-v2` K-1 (BGBM «in Kraft seit 01.07.1996» sichtbar). **Gegenprüfung PFLICHT (Risiko-Pfad-nah, unabhängiger Opus-Pass, frischer Kontext, gegen Fedlex-SPARQL + HTML):** Stichprobe 9 inkl. Alt-Erlass <1900 (SchKG) + 2 Staatsverträge (FZA/LugÜ) — Verdikt siehe Register-Zeile. Trailer `Roadmap: W2·5d`.
- **K-2 UI (S-M, NACH U-VERWEIS-Merge):** Fussnoten-Chip neben ◧Ansicht: Zähler N aus Sidecar (erst nach FN-1 voll ehrlich — vorher ohne N oder ehrlich beschriftet, §8). Semantik festlegen (Entscheid David): echter Toggle (aria-pressed korrekt) ODER reine Sprung-Abkürzung (dann kein aria-pressed; bei Zustand «aus» erst einschalten — nie in ein display:none-Ziel scrollen). CLS 0 per Platzreservierung MESSEN (Chip mountet async), nicht behaupten.
  - **✅ GEBAUT 11.7.2026 (koordinierter Kopf-PR `feat/v2-kopf-pr`).** `LeserFussnotenChip` (Slot Ansicht·Fussnoten·Download): **echter Toggle** auf denselben `fussnoten`-Options-Wert (aria-pressed korrekt, §3 Ziff. 8), Zähler N = Summe der Sidecar-Fussnoten (`useMemo` in `inhalt.tsx`, null vor Sidecar-Laden ⇒ Chip erscheint erst danach, kein Zahl-Nachwachsen). **Apparat-Sprung bei Einschalten** (erst `setzeOption('fussnoten','an')`, dann `requestAnimationFrame`→`scrollIntoView` des ersten `[data-fn-marker]` — nie in ein display:none-Ziel). `anzahl===0` ⇒ kein Chip. CLS 0 beim Toggle e2e-**gemessen** (`leser-kopf-v2`, PerformanceObserver, input-exkludiert).
- Kopf-Umbauten in **EINEM koordinierten Kopf-PR-Schnitt** mit F3-Dropdown und U-PDF-Slot-Layout (Reihenfolge Ansicht·Fussnoten·Download) — der Slot darf nicht dreimal umgebaut werden.
  - **✅ GEBAUT 11.7.2026:** `inhalt.tsx`-aktionen-Slot EINMALIG neu geordnet: **Ansicht (Dropdown) · ❡N Fussnoten · ⧉ In neuem Reiter · ⬇ Amtliches PDF** (Download bleibt der letzte, verankerte Punkt). Nebenbefund behoben: das Ansicht-Dropdown ist jetzt mobil-sicher (`right-0 sm:left-0` — der neue Zeitraum-Block deckte einen vorbestehenden Rechts-Overflow bei @390 auf).

### F3 · BGE: Ab-/Anwahl + Zeitraum (Aufwand M, kein Datenbedarf, golden-neutral — Leitfall-Zeile ist client-only, nicht prerendert)
- **B-1 (S):** 4. Switch «Entscheide» (Default AN) im Ansicht-Dropdown; Mechanik rein CSS (`data-leitfaelle` am html, Blaupause der Fussnoten-Regel; `data-leitfall-zeile`-Marker an LeitfallZeile). Kein Re-Render (§15). **✅ GEBAUT 11.7.2026:** `leserOptionen.ts` um Feld `leitfaelle` (an/aus, Default an) erweitert (data-*-Mechanik geteilt); CSS `html[data-leitfaelle="aus"] .lc-leser [data-leitfall-zeile]{display:none}` (byte-gleich bei Default); OptSwitch «Entscheide» im Dropdown. Kein Normtext-Re-Render (CSS). e2e `leser-kopf-v2` (OR: Zeile ein/aus).
- **B-2 (M):** Zeitraum-Selektor «alle · 20 J. · 10 J. · 5 J.» (Default **alle**, §8-sicher), Filter über `r.datum` VOR der Sichtbarkeits-Kappung; Kappung gemäss David-Entscheid 10.7. von 5 auf **10** anheben (`LEITFAELLE_SICHTBAR`, §3 Ziff. 5); Bandjahr-BGE jahr-genau korrekt vergleichbar. **Pflicht-Korrekturen aus dem Verdikt:** Store-Abo als Primitiv-Selektor (useSyncExternalStore, nur der Zeitraum-String — sonst re-rendern alle bis 66 Zeilen bei jedem beliebigen Toggle und die §15-Zusage wäre falsch); §8-Härtung: komplett weggefilterte Zeile zeigt «Leitfälle · n ältere ausgeblendet» (klickbar → ‹alle›) statt kommentarlos zu verschwinden; aktiver Zeitraum sichtbar am Zeilen-Label.
  - **✅ GEBAUT 11.7.2026:** `LEITFAELLE_SICHTBAR` 5→**10**. Reine Filter-Funktion `leitfallFilter.ts` (`filtereLeitfaelleNachZeitraum(refs,zeitraum,jetztJahr)`, jahr-genau/Q1-sicher, unparsbares Datum konservativ behalten) + Unit-Test `leitfall-filter.test.ts` (6 Fälle). `zeitraum` im Store, **Primitiv-Selektor `useLeitfallZeitraum()`** (getSnapshot gibt nur den String ⇒ Object.is-Suppression, Zeilen rendern nur bei echter Zeitraum-Änderung). `ZeitraumWahl` im Dropdown (nur bei Entscheide AN). §8-Härtung: voll weggefilterte Zeile zeigt «n ältere ausgeblendet · alle zeigen» (klickbar→`setzeZeitraum('alle')`), trägt weiter `data-leitfall-zeile` (B-1 blendet auch die Hinweiszeile aus). Aktiver Zeitraum als Micro-Label «letzte N J.» an der Zeile (Default alle ⇒ kein Label, `leitfaelle-chips`-e2e-Text «Leitfälle» exakt bleibt).
- **Spec-/Test-Nachführung (Pflichtteil des PRs):** e2e/leser-optionen.e2e.ts:68 `toHaveCount(3)`→4 deklariert ändern; FAHRPLAN-GESETZES-UX §3.1/§10.5 («genau 3 Toggles») per neuer A-Nummer (A19+) als durch David 10.7. überstimmt deklarieren; Trigger-title des Menüs erweitern. **✅ ERLEDIGT 11.7.2026:** `toHaveCount(4)` + data-leitfaelle-Assertion; Trigger-title «… , Entscheide (mit Zeitraum)»; §3.1/§10.5-Überstimmung als A22/A23 in UX §10 vermerkt.
- Persistenz/Cross-Tab/Split-View erben die vorhandene Store-Mechanik. Kein Gegenprüfungs-Risikopfad (reine Darstellung).

### F4 · Liniengliederung reparieren (Aufwand M, kein Datenbedarf, golden-neutral)
- **L-1 (XS):** Einzug-Cap 3→5 (`inhalt.tsx:962 tiefe<=3` → `<=5`) + Mobil-Token `--einzug-mobil` (~0.75rem) statt Kollaps; Kommentarblock nachziehen; `data-linien=aus`-Override muss weiterhin ALLE Ebenen kollabieren (index.css:243-245).
  - **⛔ AUFGEHOBEN 29.8.2026** (Entscheid David, «die staffelung aufzuheben … alles auf der selben höhe … analog zu fedlex»): der Tiefen-Einzug samt beider Tokens ist ersatzlos entfernt, der Wortlaut steht auf EINER linken Kante — massgeblich ist **DESIGN-REGLEMENT-NORMTEXT §4b-C**. Der folgende Vollzugsvermerk bleibt als Historie stehen.
  - **✅ GEBAUT 11.7.2026 (feat/v2-l1-l2):** `eingerueckt = tiefe > 0 && tiefe <= 5` (Cap 3→5); Mobil-Token als tailwind-spacing `einzug-mobil: '0.75rem'` (Muster des bestehenden `einzug`-Tokens), Klasse `pl-einzug-mobil sm:pl-einzug` für ALLE eingerückten Ebenen (Guide- und Nicht-Guide-Branch vereinheitlicht — mobil beide 0.75rem statt 0/0.75). Kommentar in `inhalt.tsx` + `tailwind.config.js` nachgezogen. `data-linien="aus"` kollabiert weiter über ALLE Ebenen auf `padding-left:0` (index.css unverändert — Playwright: 0px bestätigt). **Beleg** (Playwright, Desktop 1440 + Mobil@390, Light): ZGB indentet neu Ebene 1–5 je 20px, Ebene 6–7 gekappt (`(no-pad)`); Mobil 12px (0.75rem) statt Kollaps. Golden byte-gleich (kein Snapshot berührt); CLS 0 (padding, kein async Mount).
- **L-2 (S):** Guide-Ton moderat anheben auf ~`--line-strong`-Niveau (18 %/24 %) — NICHT hart 3:1 (das machte die Deko-Linie zur dunkelsten Linie des Systems; DESIGN-REGLEMENT F2 nimmt Deko von 3:1 aus); Vorher/Nachher-Screenshots hell+dunkel als Gate.
  - **✅ GEBAUT 11.7.2026 (mit L-1):** `--guide-gliederung` hell 10 %→18 %, dunkel 14 %→24 % (= exakt `--line-strong`, nicht darüber). DESIGN-REGLEMENT-NORMTEXT §4b (Guide-Zeile + Einzug-Skala) nachgezogen mit Rationale. `check:linien-kanon` GRÜN unverändert (Tor prüft Token-Existenz/Verdrahtung, nicht die Opazität; Aufbau-Regelwerk/Referenz-Verdikte = L-3 blieben unberührt) — **keine deklarierte Regelwerk-Änderung am Kanon-Tor nötig**. **Beleg** (Playwright, computed border-left-color): BVV3/ArG Guide `srgb …/0.18` hell und `/0.24` dunkel, 1px sichtbar; ZGB Guide weiter transparent (autoGuide=aus, L-3 nicht gebaut — korrekt). Golden byte-gleich; CLS 0.
- **L-3 (M, ✅ von David 10.7. FREIGEGEBEN, nach L-1):** Auto-Default-Umkehr: tiefe Kodifikationen (ZGB/OR) erhalten ihren EINEN Guide auf guideEbene (Umkehr der #161-Politik = **der eigentliche Hebel für Davids Befund**). Referenz-Verdikte + Invariante Z.126/127 in check-linien-kanon.ts deklariert umstellen (§6.3), DESIGN-REGLEMENT-NORMTEXT §4b + linienAufbau-Kopf-Rationale nachziehen. Vorher/Nachher-Screenshots hell/dunkel/mobil im PR.
  - **✅ GEBAUT 11.7.2026 (`feat/v2-l3`).** **Gate-Aufhebung:** David 11.7. im Chat «du hast bei allem was ich entscheiden muss selbst die wahl» → Orchestrator-Entscheid: bauen mit hartem Visual-Beweis (Council/Rückfrage entfällt). **Regelwerk-Änderung (deklariert):** `linienAufbau.ts` — der Auto-Guide hängt jetzt **allein am Dichte-Boden** (`autoGuide = dichteAmGuide >= DICHTE_MIN`); die alte Tiefe-Obergrenze `strukturTiefe <= TIEF_AB−1` ist WEG (der Denkfehler von #161: es gibt keinen Strich je Ebene — der Reader emittiert höchstens EINEN Guide auf `guideEbene`, das ist kein Barcode). `TIEF_AB` bleibt nur noch Klassifikations-Schwelle. **`check:linien-kanon` deklariert nachgezogen:** B1-Invariante von der Tiefe-Obergrenze auf ein Biconditional (`autoGuide ⟺ tiefe≥1 && dichte≥2`), B2-Referenz-Verdikte ZGB/OR von `autoGuide:false` (ruhig) → `autoGuide:true` (zeigen den EINEN Guide) + Kopf-Rationale; Tor GRÜN (1144 Sidecars invariant, **Auto-Guide AN 158→230, +72 tiefe Kodifikationen** alle strukturTiefe≥3 UND dichte≥2: Tiefe 3:57 · 4:12 · 5:3). DESIGN-REGLEMENT-NORMTEXT §4b-A Tabelle+Rationale + index.css-Kommentar nachgezogen. **e2e deklariert nachgezogen:** `gesetze-ux-g3a` + `leser-linien-kanon` (ZGB-Verdikt RUHIG→sichtbar) + `leser-optionen` (BV-Toggle: Auto-Default jetzt an, Klick-Zyklus startet bei AUS). **#210-Kollision:** das dortige Ruhig-Fixture BUEG (tiefe 3, dichte 4) ist unter der L-3-Regel autoGuide=TRUE ⇒ Ruhig-Fixture deklariert auf STG gewechselt (tiefe 3, dichte 1 = echter Ruhig-Fall der neuen Regel). **Golden byte-gleich** (`golden:vergleich` IDENTISCH, 209 Fälle — data-guide-auto ist client-runtime, nicht prerendert). **K11-Tri-State unangetastet** (nur der Auto-Default kehrt um, die Nutzer-Wahl an/aus bleibt global). **Visual-Beweis (Playwright, computed border-left-color + Screenshots, 7 Referenzfälle × Desktop/Mobil@390 × Hell/Dunkel = 28 Shots):** ZGB(tief5)/OR(tief4) NEU `guide-auto=an`, EIN calmer Guide sichtbar (kein Barcode — nested Titel tragen Typo+Einzug); ArG/BVV3-Kurzerlass/HKUE-Staatsvertrag unverändert sichtbar; **VMWG(flach0)/Kanton-§ weiter `guide-auto=aus`, 0 Guide-Elemente — kein neues Linien-Rauschen auf flachen Erlassen** (der Dichte-Boden + der Tiefe-0-FLACH-Zweig schützen konservativ). CLS 0 (nur border-Farbe). Gegenprüfung n/a (reine Darstellung). Fremd-rot ausgewiesen: `check:p-klassen`/`check:vollstaendigkeit` (data byte-gleich zu main, nicht CI-gated, vorbestehend); lokale e2e-Voll-Parallel-Röten = CPU-Contention (isoliert grün, CI läuft mit 1 Worker). Trailer `Roadmap: W2·5d`.
- **L-4: ✗ ENTFÄLLT** (David 10.7.: Farbe nur Referenzschicht, Normtext-Körper farbfrei — Ton-Bänder im Lesefluss damit vom Tisch).
- Kollision: U-VERWEIS ändert inhalt.tsx (ErlassKopfBlock-Aufrufe) → «Harte Reader-Kette» §10: NACH U-VERWEIS-Merge (Design-Behauptung «parallel baubar» war widerlegt).

### F5 · Farbkonzept Referenzschicht (Aufwand M, CSS/Token-only, golden-neutral)
Doktrin: Farbe NUR auf der Referenz-/Verzahnungsschicht (Chips/Badges/Kopf); Normtext-Körper bleibt farbfrei (§4b) — Reglement-Ergänzung ist Pflichtteil der ersten Einheit.
- **C-1 (S-M, SOFORT startbar, kollisionsfrei) — ✅ GEBAUT 10.7.2026 (Bau-Go David: «go zu allem»):** KantenChip erhält **kategorie-Prop** (`'norm'|'entscheid'`, Default 'norm'=brass byte-identisch) — NICHT wholesale umfärben (KontextPanel nutzt denselben Chip für zitierte NORMEN, wäre Fehlcode); Call-Sites: LeitfallZeile + EntscheidVerzahnung → 'entscheid'/slate. Hover-Utilities am Chip mit-tauschen (sonst slate-Tick mit Brass-Hover). StatusBadge: Revisions-↻ → warn-700 via per-Prädikat-Ton im Rezept (★ bleibt brass; beide laufen heute durch dieselbe Zeile :91). Kontrast bereits gemessen: slate-500 auf well 4.81 hell/3.47 dunkel ✓ (auf paper dunkel 3.31 — knapp, Messung als Gate behalten; --slate-500 wird in html.dark bewusst nicht überschrieben).
  - **Umsetzung (feat/v2-c1-kantenchip):** Precheck ergab **U-VERWEIS (#170) bereits auf main gemergt** ⇒ die harte §4-Regel «nichts auf parts.tsx vor U-VERWEIS-Merge» ist erfüllt, LeitfallZeile-Call-Site (parts.tsx) sauber in-Scope; kein paralleler Worktree berührt parts.tsx (lm-v2-fn = scripts/normtext+Sidecars). slate-Doppelbelegung aufgelöst + im **DESIGN-REGLEMENT-NORMTEXT §4b-B** (Farb-Wörterbuch, EIN Entscheid je Farbe) dokumentiert. Golden byte-gleich (Default 'norm' unverändert; `golden:vergleich` IDENTISCH). Kontrast als Gate gemessen (Playwright, Light+Dark, Desktop+Mobil@390): slate-Tick **4.81/3.47**, warn-↻ **5.24/9.43**, brass-★ **4.91/10.48** — alle ≥ Schwelle; Hover-Swap auf slate-700 verifiziert (kein brass-Hover auf slate-Tick); CLS 0. Gegenprüfung n/a (reines UI). **C-2/C-3 bleiben nach U-VERWEIS/im Kopf-PR deferiert.**
- **C-2 (S, NACH U-VERWEIS, im koordinierten Kopf-PR):** Overline-Farbpunkte Leitfälle/Verweise + Currency-Chip-Tonung («geltend geprüft» / «nächste Fassung ab»). §7-Nuance: sage darf keine fachliche Abnahme suggerieren — «(maschinell)»-Wording tragend ODER neutral slate (Entscheid David).
  - **✅ GEBAUT 11.7.2026 (Bau-Go David «go zu allem», `feat/v2-c2`).** Zwei CSS/Token-Bausteine (golden-neutral, reines UI): (1) **Overline-Farbpunkte** — `lc-punkt`/`lc-punkt-entscheid` (index.css); «Leitfälle»-Overline (ArtikelLeser.tsx `LeitfallZeile`) trägt den slate-Punkt, «Verweise»-Overline den brass-Punkt. Redundant zum Wortlabel (`aria-hidden`, Farbe nie allein tragend §13/F2); auf `--paper` ⇒ brass-**600** (nicht -500), damit ≥3:1. (2) **Currency-Chip-Tonung** — `lc-chip-geltend` (sage) für «geltend geprüft am … (maschinell)» + `lc-chip-vorbehalt` (warn) für «nächste Fassung ab …» (ErlassLeserKopf.tsx, nur zwei Tick-Klassen ergänzt — #198 berührt diese Datei nicht, verifiziert; Currency-Chips bleiben dort, kein Konflikt). Empfehlung §3 Ziff. 3 (sage «geltend geprüft» + «(maschinell)»-Wording) umgesetzt, §7/§8 gewahrt (kein «gegengeprüft/verifiziert»-Wortfeld). **Kontrast als Gate gemessen (Playwright, Light+Dark, Desktop+Mobil@390):** slate-Punkt 5.21/3.31 · brass-600-Punkt 3.71/11.74 · sage-Tick 4.14/4.03 · warn-Tick 3.02/5.52 — alle ≥3:1; CLS 0 (inline Punkt + border-color-Swap, keine Layout-Verschiebung); Visual je 4 Achsen bestätigt. Golden byte-gleich (`golden:vergleich` IDENTISCH). Gegated: `v2-c2-farbwoerterbuch.test`. §4b-B additiv nachgezogen. Gegenprüfung n/a (reines UI). **C-3 bleibt nach U-VERWEIS deferiert.**
- **C-3 (DEFER, nach U-VERWEIS):** NormChip-Verweisfarbe + Materialien-Familie — Deferral-Grund ist die U-VERWEIS-Kollision (NormText speist NormChip), NICHT Prerender (kein React-SSR; prod-verifiziert 0 lc-chip im prerenderten HTML).
  - **✅ GEBAUT 11.7.2026 (`feat/v2-c3`) — Farb-Wörterbuch KOMPLETT.** Deferral-Grund weg (U-VERWEIS #170 gemergt; C-1 #174 / C-2 #201 live). Zwei Bausteine (reines UI): (1) **Materialien-Familie = sage** — `lc-punkt-material` (index.css) + `punkt`-Prop (`'norm'|'entscheid'|'material'`) an `KontextGruppe`: Familien-Punkt vor dem Gruppentitel (aria-hidden, Farbe nie allein tragend §13/F2); Call-Sites KontextPanel (Botschaften/Vernehmlassungen/Amtliche Materialien=material · Erlasse=norm · Entscheide=entscheid), VerweisKontext, EntscheidVerzahnung; ohne Prop kein Punkt (Werkzeuge/Revisionen neutral). (2) **NormChip-Verweisfarbe** — `CHIP_LINK_CLASS` + `hover:border-brass-400` (war der einzige Norm-Chip ohne brass-Hover-Border; jetzt EINE brass-Hover-Anatomie), `normLinkSsr.test` deklariert nachgezogen (§6.3). **Kontrast als Gate gemessen** (Playwright, Light+Dark, Desktop+Mobil@390, auf `--paper`): sage-Punkt **4.48/3.84** · slate-Punkt **5.21/3.31** · brass-600-Punkt **3.71/11.74** — alle ≥3:1; CLS 0 (Punkt inline im Gruppen-h3, kein separater async-Mount; Chip hover-only). Visual DSG 24 / DBG 65 / MWSTG je 4 Achsen, kein Overflow @390. Golden byte-gleich (`golden:vergleich` IDENTISCH, 209 Fälle). Gegated: `v2-c3-farbwoerterbuch.test`. §4b-B als ABSCHLUSS nachgezogen (sage-Zeile = Materialien-Familie + Currency). Gegenprüfung n/a (reines UI). **§7-Befund:** die Zeile oben («0 lc-chip im prerenderten HTML») war zu breit — auf Rechner-/Vorlagen-Routen IST NormChip prerendert (z. B. 5× betreibungskosten.html); unschädlich (Prerender je Deploy neu gebaut, Hydration konsistent), aber als falsche Prognose ausgewiesen.
- Offener Konflikt: slate ist heute auch «ungeprüft/in Vorbereitung»-Status — Farb-Wörterbuch als EIN Entscheid festlegen (§3-Liste).

---

## §3 Entscheidungsliste — Davids Entscheide 10.7.2026 (Chat) eingearbeitet

1. **Linien-Default (L-3): ✅ ENTSCHIEDEN «deine Empfehlung» = JA** — ZGB/OR zeigen im Auto-Default wieder ihre EINE Gliederungslinie (Umkehr #161). L-3 ist damit freigegeben, Council entfällt (David hat entschieden); Referenz-Verdikte/Invarianten/Reglement wie in §2 deklariert nachziehen.
2. **Farb-Grundsatz: ✅ ENTSCHIEDEN «deine Empfehlung»** — Farbe NUR auf der Referenzschicht (Chips/Badges/Kopf), Normtext-Körper bleibt farbfrei. Konsequenz: L-4/Ton-Bänder im Lesefluss ENTFALLEN (kein Ownership-Konflikt mehr); F5-Doktrin ist gesetzt.
3. **Farb-Wörterbuch (offen, Empfehlungen gelten mangels Einwand):** Rechtsprechung=slate, Materialien=sage (erst mit C-3), Revisions-↻=warn, Currency «geltend geprüft» mit «(maschinell)»-Wording. slate-Doppelbelegung («ungeprüft»-Status) beim Bau von C-1 auflösen und im §4b-Nachtrag dokumentieren.
4. **BGE-Details (Empfehlungen gelten mangels Einwand):** Label «Entscheide» (Davids Wort), Stufen alle/20/10/5, Default «alle», Wirkung global, leer-gefilterte Zeile mit Hinweis «n ältere ausgeblendet».
5. **BGE-Menge: ✅ ENTSCHIEDEN «auch mehr als fünf»** — Sichtbarkeits-Kappung anheben: `LEITFAELLE_SICHTBAR` 5 → **10** (Rest weiter hinter «+n weitere»/MehrKante); gehört in die B-1/B-2-Einheit (gleiche Datei). Perf-Wächter: below-fold, kein Normtext-Re-Render (§15); falls 10 auf dichten Artikeln zu laut wirkt, Rückmeldung an David statt still senken.
6. **Fussnoten-Nummerierung (Empfehlung gilt):** erlassweit kontinuierlich 1..N wie Fedlex (ergibt sich aus FN-1 von selbst).
7. **FN-5/M14 (wortgenaue Marker): ✅ ENTSCHIEDEN «später»** — deferiert bleibt deferiert (hinter QS-PERF/U-POSITION, separates David-Go vor Bau).
8. **Kopf (Empfehlungen gelten mangels Einwand):** «in Kraft seit» in die Meta-Zeile; Fussnoten-Chip als echter Toggle (aria-pressed korrekt) mit Apparat-Sprung bei Zustand AN; Kopf-/Ingress-Fussnoten folgen demselben «Fussnoten aus»-Toggle.
9. **Restposten (weiter offen, nicht blockierend):** Sprachumschalter DE/FR/IT · Änderungshistorie-/AS-Einstieg im Kopf — als Nicht-Scope geführt, bis David sie anfordert.

---

## §4 Reihenfolge, Kollisionen, Prozess

**Live-Stand 10.7.:** einziger aktiver Worktree ist `lm-u-verweis` (feat/u-verweis-a7-a10-a11-a13, ungemergt; ändert NormText.tsx, fedlex.ts, **parts.tsx** (ErlassKopfBlock intern-Prop), **inhalt.tsx**, kontext.ts, VerweisKontext.tsx). B3-Sticky (#168) und STRUKTUR-Rotation (#167) sind bereits auf main.

**Harte Regel (dreifach von Fable erzwungen — F3/F4/F5 behaupteten ihre Kollisionsfreiheit ursprünglich falsch):** KEINE Einheit, die parts.tsx oder inhalt.tsx berührt, vor dem U-VERWEIS-Merge. Precheck vor JEDER Einheit: `git worktree list` + `git diff main...<branch> --name-only` (committeter Stand!) + `git diff HEAD` (uncommitted) — genau der HEAD-only-Fehler erzeugte die falsche F5-Aussage.

**Sequenz:**
1. **Sofort, parallel zu U-VERWEIS (belegt kollisionsfrei):** FN-1+Drop-Fix+FN-2 (scripts/normtext+Sidecars) ‖ C-1 (KantenChip/StatusBadge/index.css). → liefert Davids Hauptbefund (VZG-Marker) am schnellsten.
2. **Nach U-VERWEIS-Merge:** EIN koordinierter Kopf-PR (K-2 + F3-Dropdown B-1/B-2 + U-PDF-Slot-Layout) → FN-3 (Präambel-Marker auf dem A11-NormText-Unterbau) → L-1/L-2 (+ L-3 nach David/Council) → C-2, danach C-3.
3. **Daten-Regenerationen bündeln:** FN-1-Regeneration (22 Erlasse) und K-1/Erlassdatum-Refresh (54 Sidecars) hängen beide an frischen Pins → EIN Regenerationslauf nach P1-a/b-Pin-Refresh, EIN Diff-Audit (Regen zieht auch Extraktor-Drift seit 30.6. nach — Stichproben VZG/OR/ZGB), Marker-Zählungs-Wächter vorab.
4. **Deferiert:** ~~FN-5/M14~~ (✅ gebaut 26.7.2026, s. F1) und U-POSITION hart nach QS-PERF; L-4/Farb-Ausbau nach Entscheid 2.

**Verifikationspunkt nach U-VERWEIS-Merge:** Präambel-NORMVERWEISE (toter «Artikel 15 des BG…»-Text) baut A11 mit kuratierter Genitiv-Map — nachprüfen, ob VZG-/ArG-Ingress-Formen wirklich abgedeckt sind; sonst ist dieser Live-Defekt verwaist.

**Prozess-Pflichten vor Baustart:** Davids Wortlaut 10.7. wortgetreu persistieren (docs/ux-audit-2026-07/, Muster A-Wellen) und als A19+ additiv in FAHRPLAN-GESETZES-UX §10 einordnen, inkl. deklarierter Überstimmung §3.1/§10.5 und Nachführung des U-LINIEN-Vermerks (#161 «geheilt» vs. Re-Meldung). Risikopfade (scripts/normtext, kopf-extrahiere, src/lib/normtext) ⇒ Gegenprüfungs-Skill + Quittung je Commit. Je Einheit A9-DoD (CPU-Throttle-Beweis, CLS 0, a11y), Doku-Commit separat, Trailer `Roadmap: W2·5d`/A19+.

---

## §5 Restposten (bewusst ausserhalb der 5 Massnahmen)
- Sprachumschalter + Änderungshistorie-Einstieg im Kopf (Entscheid 9).
- ~~Fedlex-Pin/Alias-Wurzel~~ **✅ ERLEDIGT 11.7.2026** (Fedlex-P1-a/b, Branch `fix/fedlex-p1ab-pin-kanonik`): 166 Pins von der Alias-URL auf `isExemplifiedBy` gehoben, Kanonik-Arbiter + struktur-run-«0 übersprungen» + cache.sh-Shell-Sonde; Snapshots/Sidecars kanonisch regeneriert, Gegenprüfung bestanden. FN-1/K-1 stehen jetzt auf kanonischer Fassung (die UI-Heilungen selbst bleiben Kopf-Einheit).
- Fussnoten-Apparat als eigene visuelle Kategorie (F5 optional slate-Trenner): fest zuweisen oder bewusst offen lassen.
- ~~Marker-Granularität bei intakten Erlassen (Absatz-Ende statt Wortstelle)~~ **✅ mit FN-5 behoben (26.7.2026)** — Rest ausgewiesen: `<dt>`-Marken-Fussnoten rendern weiter am Item-Ende (möglicher S-Folgeschritt: Marker an der Marke), Kopf-/Sektions-Marker haben keine Textstelle.
- **Sektionstitel-/Anhang-Fussnoten ohne Ziel-Token (Gegenprüfungs-Befund 10.7., vorbestehend, KEINE Regression):** Fussnoten, deren Marker auf einem artikellosen Abschnitts-/Gliederungstitel (VZG 225/226 «Schlussbestimmungen der Änderung vom …», OR 871–873/881/894/920–922/942–944 Übergangs-Titel) oder in einem Anhang (FZA 42–120, Anhang I ff.) sitzen, haben kein `art_`-Token und bleiben unerfasst — `randtitelFn` greift nur, wenn unter der Überschrift ein Artikel folgt. Eigener Backlog-Posten (Anhang-/Titel-Fussnoten-Träger), nicht Teil von FN-1.

---

## §6 Norm-Zeitmaschine + Fassungs-Diff (`W2·5g-ZEIT`, Ideen-Intake 20.7.2026)

> **ROADMAP-Schritt:** `W2·5g-ZEIT`, `status: blocked` auf `zeit-historik-poc`.
> Detailquelle zum ROADMAP-Schritt (§14.1). Die **Metadaten-Timeline** ist Sache von G-HIST /
> `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake` und wird hier **nicht dupliziert** (§14.3).

**Ziel.** «Art. X, wie er am Tag Y galt» (verknüpft mit dem Entscheiddatum) + visueller Diff
zweier Konsolidierungen. Diese Einheit konsolidiert die bisher verstreute Planung: **M16**
(Point-in-Time, freigeschaltet nach AKN-XML-Phase 1, s. §2/Quell-Architektur) + **G-HIST** als
Daten-Unterbau.

### §6.1 Die zwei Hälften sind sehr ungleich (§8, keine Schönung)

🟢 **Metadaten-Timeline** («gilt seit …» / «was änderte sich wann») — **läuft bereits** als
G-HIST-UI: `public/normtext/historie/*.json` mit `giltSeit` + `ereignisse[]` (Datum/Absatz/AS-ELI).
**Hier nichts zu bauen.**

🟠 **Echter Alt-Volltext + Alt-vs-Neu-Wortdiff — braucht Zusatzdaten und ist gross.** Auf Platte
liegt je Norm **nur die geltende Fassung** (ein `stand`/`fassungsToken`/`bloecke` je Artikel); die
Historie liefert Änderungs-**Metadaten, nicht den historischen Text**. Die Fähigkeit ist vorhanden
(Fedlex `jolux:Consolidation`/`dateApplicability` via SPARQL — `fedlex-versionen-pruefen.ts` fragt
das bereits ab), aber es braucht einen **neuen historischen Extraktions-Durchlauf**
(N Konsolidierungen × 227 Erlasse) samt neuem Speicher- und §7-Provenienz-Modell.

**Der Diff selbst ist trivial-deterministisch** (String-Diff, §2). **Der Aufwand steckt
vollständig in der Daten-Beschaffung** — wer das umdreht, plant die Einheit falsch.

### §6.2 Etappe Z0 (blocker-auflösend, VOR jedem Bau)

1. POC historische Konsolidierungs-Extraktion (ein Erlass, mehrere Konsolidierungen),
2. Speicher-/Provenienz-Entwurf (§7 a–d **je Fassung**, nicht nur je Erlass),
3. Kostenschätzung Durchlauf + Artefaktgrösse,
4. **Bau-GO je Kandidat durch David** (analog zum bestehenden G-HIST-Intake-Vorbehalt).

Rahmen und Kostenschätzung: `bibliothek/recherche/norm-zeitmaschine-poc.md`.

### §6.3 Vorbedingungen, die KEINE `dep` sein können (§14.5-Ehrlichkeit)

AKN-XML-Phase 1 und G-HIST sind **keine getrackten ROADMAP-Schritte mit `@meta`-ID** — sie leben
als Strang-Detailblock bzw. in `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`. Ein `dep` auf sie ist
maschinell nicht formulierbar; die Reihenfolge trägt darum **vollständig der Blocker
`zeit-historik-poc`**, dessen Registereintrag in `ROADMAP.md` beide Vorbedingungen ausdrücklich
mitführt. Sobald eine davon ein eigener Schritt wird, wandert sie in `dep`.

### §6.4 DoD

POC-Verdikt + David-GO **vor** Bau · `check:normtext` / `check:normtext-netz` ·
`check:gegenpruefung` (Extraktions-Risikopfad) · §7 a–d **je Fassung** · golden byte-gleich.
Trailer `Roadmap: W2·5g-ZEIT`.

---

## §7 Fassungshistorie an-/abwählbar + Fassungs-Fundament (`W2·5i-HIST-ANSICHT`, §14-Intake 20.7.2026)

### §7.1 Der Befund (gemessen am OR)
| Klasse | Anzahl | Anteil |
|---|---:|---:|
| Fussnoten gesamt | 933 | 100 % |
| davon **Änderungsvermerke** | **778** | **~83 %** |
| davon **echte Verweise** | **77** | ~8 % |

Die Fussnoten-Spalte ist damit überwiegend **Fassungshistorie im Fussnoten-Gewand**. Folge für die
Bedienung: Wer Fussnoten abschaltet, verliert die echten Verweise mit; wer sie anlässt, liest
überwiegend Revisionsprosa. Beides ist schlecht — deshalb die Trennung.

### §7.2 Bau-Vorschlag
Dreiwertige Auswahl **«Änderungshistorie: aus / als Fussnoten / als Chronologie»**, eingeklinkt in das
bestehende **«Ansicht ▾»**-Menü (`src/pages/gesetz-leser/v3/LeserAnsichtV3.tsx` — hat Persistenz
**und** Pre-Paint-Mechanik bereits; kein neues Menü bauen; `LeserAnsichtMenu.tsx` in H5 gelöscht,
21.8.2026, Nachfolger LeserAnsichtV3/leserOptionen). **Verweis-Fussnoten unabhängig davon** schaltbar.
Löst nebenbei das bekannte Leerraum-Residuum im Reader.

### §7.3 ZWINGENDE Vorstufe H0 — Trennbarkeit messen, bevor gebaut wird
Die 778/77-Zahl belegt, **dass** zwei Klassen existieren. Sie belegt **nicht**, dass sie maschinell
sauber trennbar sind. Vor jeder UI-Zeile ist zu erheben:

1. **Korpusweit**, nicht nur am OR — die Leitplanke «nie aus einem Beispiel aufs Ganze schliessen» gilt
   hier besonders, weil das OR ein alter, oft revidierter Erlass ist und damit ein Ausreisser sein
   könnte.
2. **Präzision und Recall** der Klassifikation Änderungsvermerk ↔ Verweis, mit Zahlen.
3. **Die Grauzone benennen:** Fussnoten, die *beides* tun (Änderungsvermerk *mit* Verweis). Ihre Zahl
   entscheidet mit über die Machbarkeit.

**Verdikt-Regel:** Fällt H0 schlecht aus, wird der Umschalter **nicht** gebaut. Eine Ansicht, die 5 %
der Fussnoten falsch einordnet, blendet Normtext-Information aus und verletzt die §15-Funktions-Treue.
Ein ehrliches «nicht trennbar» ist ein gültiges Ergebnis dieses Schritts.

**H0 ✅ GEMESSEN 25.7.2026 (Fable 5) — VERDIKT: BESTANDEN, H1 darf gebaut werden.**
Korpusweit (37'849 Fussnoten, 227 Bund- + 1'189 Kanton-Sidecars), deterministischer
Regel-Klassifikator `scripts/analyse/hist-h0.ts` (Seed-Stichprobe reproduzierbar):
AENDERUNG 67.0 % · VERWEIS 27.3 % · GRAUZONE 1.1 % (inkl. Hochrechnung ~2–2.6 %) ·
ZITAT 1.7 % · UNKLAR 2.8 %. **Sicherheitsrichtung Substanz→ausgeblendet: 0/60 in der
gelabelten Stichprobe (n=300) + Vollscan aller 25'367 AENDERUNG-Fälle → 2 klare
(+9 grenzwertige) Fehler ≈ 0.008–0.04 % ≪ 5 %-Schwelle.** OR-Konsistenzprobe zur
Intake-Zahl (789/75 vs. 778/77) ✓. Kanton ≠ Bund: nur 11.1 % Historie kantonal —
Nutzen des Umschalters liegt auf der Bund-Fläche. Vollbericht + bindende
H1-Auflagen (nur AENDERUNG ausblendbar; 2 bekannte Fehlerfälle in die Regeln;
Klassifikation build-seitig = Risiko-Pfad mit Gegenprüfung; ZITAT-Behandlung =
David-Entscheid): `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`; gelabelte
Stichprobe `docs/ux-audit-2026-07/hist-h0/stichprobe-300-gelabelt.json`.

**H1 ✅ GEBAUT + GEMERGT 26.7.2026 (PR #375, Squash `de8f294a`).** Dreiwertige Ansicht im
«Ansicht ▾»-Menü; Klassifikation `kl: A|V|G|Z|U` build-seitig (`scripts/normtext/
fussnoten-klassifikation.ts`, 227 Bund-Sidecars; Kanton bewusst ohne `kl` = immer sichtbar);
nur `[data-fn-klasse="A"]` dämpfbar (Auflage 1). 4 Gegenprüfungs-Runden: B1 laufende
Befristungen + B3 Fristenlauf-Anordnung aus A nach G gehoben (62 Wechsel, einzeln belegt);
#376-Konfliktauflösung als reine Verschiebung verifiziert. **Offen bei David:** ZITAT-Entscheid
(Auflage 5) + fachliche Abnahme + D1–D3 (niedrig). Wortlaut/Beweise: `ROADMAP-CHRONIK.md` →
W2·5i-HIST-ANSICHT + `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`.

### §7.4 Fassungs-Fundament (gilt über diesen Schritt hinaus)
David, 20.7.2026: das Fundament für historische Gesetzesfassungen soll bei **jeder** Normtext-Arbeit
mitgedacht werden — nicht erst, wenn die Zeitmaschine (`W2·5g-ZEIT`, geparkt) gebaut wird. Verankert
ist es hier statt dort, weil ein geparkter Schritt keine Auflage durchsetzen kann.

1. **Fassungs-Schlüssel durchgängig mitführen** — `fassungsToken` / `stand` / `sha` auch dort, wo heute
   nur die geltende Fassung gezeigt wird. Sie später nachzurüsten ist teurer, als sie jetzt
   mitzuschleifen.
2. **Anker fassungsstabil halten** — `#art-…` darf nicht kippen, sobald eine zweite Fassung danebentritt.
   Deep-Links und Zitate aus Schriftsätzen müssen über den Fassungs-Zuwachs hinweg gültig bleiben
   (§15-Funktions-Treue).
3. **§8 «nicht geltendes Recht» unmissverständlich** — sobald irgendwo eine Nicht-Ist-Fassung sichtbar
   wird, muss sie als solche erkennbar sein, ohne dass man die URL liest. Eine historische Fassung, die
   aussieht wie geltendes Recht, ist ein Haftungsrisiko, kein Feature.

**Das ist kein eigener Bau-Schritt**, sondern eine Auflage. Sie wird in `W2·5i-HIST-ANSICHT` zuerst
wirksam und gilt danach fort.

---

## §9 · ROADMAP-Spec-Nachzug (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Welle 2 — AP-11 rückwirkend angewandt (ROADMAP-Diät Welle 3, 4.8.2026).
Beide Wortlaute entstanden am 3.8.2026, also nach Anlage von §8 (31.7.2026). In der ROADMAP bleiben
je Schritt Titel, `@meta`, Anlass/Kurzabsatz und der Pointer. Steuert nicht — Spec-Heimat.*

### §9.1 `W2·5g-ZEIT` — Entparkung und Bau-Reihenfolge im Wortlaut *(→ Bau-Spec: §6 und §8 dieser Datei)*

> **Anlass der Entparkung:** der Blocker `zeit-historik-poc` war kein fremdes Gate, sondern der erste
> Arbeitsschritt des Schrittes selbst. Er ist gestrichen; die Vorbedingungen bleiben als **harte
> Bau-Reihenfolge** erhalten: **(a) POC** historische Fedlex-Konsolidierungs-Extraktion (auf Platte
> liegt nur die geltende Fassung; `dateApplicability` per SPARQL vorhanden, Durchlauf gross) →
> **(b)** AKN-XML Phase 1 (Quell-Architektur-Entscheid Council 30.6.2026, schaltet M16 frei) und
> **G-HIST** als Daten-Unterbau — beide sind **keine getrackten Schritte** und darum nicht als `dep`
> abbildbar (Wortlaut: [FAHRPLAN-NORMTEXT-DARSTELLUNG.md](FAHRPLAN-NORMTEXT-DARSTELLUNG.md)
> `§Intake`) → **(c)** Bau. Vor (c) je Kandidat das POC-Ergebnis vorlegen (§8: kein Fassungs-Diff auf
> geratener Historie).

### §9.2 `W2·5k-LINIEN-KONZEPT` — Bau-Spec im Wortlaut *(→ Bau-Spec: §2, Lehre F4/L-3 dieser Datei; Vorgeschichte A28: `FAHRPLAN-GESETZES-UX.md` Ziff. 10.9)*

> **KONZEPT-Schritt, kein Bau**: 2–3 Varianten entwerfen (z.B. Linie je
> aktiver Verschachtelungsebene, Sticky-Gliederungs-Kontext, Hover-/Fokus-Guides), als klickbare
> Prototypen (Preview-Deploy) **zur David-Abnahme VOR jedem Vollbau**. Harte Regel aus der Lehre:
> dieser Gegenstand wird **nie wieder über eine blosse Default-Umkehr** gelöst. A28 (Auto-Guide
> aus, manuell einschaltbar) bleibt bis zur Abnahme der Live-Stand. Referenz-Baustand des
> verworfenen Versuchs: geschlossener PR #423 (`fd44b37b3`, mit Beweisen).

### §9.3 `W2·5k-LINIEN-KONZEPT` — Konzept-Entwurf (Fable/Synthese-Agent, 13.8.2026)

**Status: Entwurf, zur David-Abnahme.** Erfüllt den Auftrag aus §9.2 («2–3 Varianten,
Empfehlung, David-Abnahme VOR jedem Vollbau»). Zum Verhältnis zur ebenfalls in §9.2
verlangten «klickbaren Prototypen (Preview-Deploy)» siehe die Abweichung am Ende dieses
Abschnitts.

#### a) Problemlage — was belegt ist, nicht was vermutet wird

Die Gliederungslinie (vertikaler `border-guide` neben tief verschachtelten Abschnitten)
wurde **zweimal gebaut und zweimal von David live verworfen**, beide Male am selben
Befund, nicht an einer Justage-Frage:

| Datum | Baustand | Davids Verdikt (wörtlich) | Konsequenz |
|---|---|---|---|
| 5.7.2026 | G3a/K11: Guide nur bei `grundart==='KODIFIKATION'` | A8: «Liniengliederungsdarstellung … regeln festlegen wie es wann angezeigt wird JE NACH AUFBAU GESETZ. zgb bspw. sehr viele aber arg fast keine aktuell.» | Umbau auf aufbau-basiert (Struktur-Sidecar statt Kategorie) |
| 11.7.2026 | L-3 (#207): Auto-Guide AN für dichte Erlasse, inkl. ZGB/OR | 12.7.2026 (A28): «das mit den linien funktioniert überhaupt nicht» / «also ist überhaupt nicht fördernd für die übersicht» | A28: Auto-Default korpusweit AUS, Feature bleibt nur als manueller K11-Schalter |
| 3.8.2026 | PR #423 (`fd44b37b3`, geschlossen): L-3 reaktiviert, Auto-Guide kehrt zurück | Preview-Verdikt: «eine einzige linie und unbrauchbar» | PR geschlossen, A28-Zustand bleibt Live-Stand; ROADMAP-Anlass dieses Konzept-Schritts |

Belege im Code: `src/pages/gesetz-leser/linienAufbau.ts:19–49` (A28-Chronik im
Kopfkommentar, wörtliche Zitate) · `scripts/check-linien-kanon.ts:21–34` (B1-Invariante
`autoGuide` korpusweit `false`) · `DESIGN-REGLEMENT-NORMTEXT.md §4b-A` (Zeile ~210–265,
Referenz-Tabelle + Rangfolge-Doktrin) · Vorgeschichte A28 wörtlich in
`FAHRPLAN-GESETZES-UX.md` Ziff. 10.9.

**Der strukturelle Grund, warum Nachjustieren nicht half:** `linienProfil()` zeigt
**höchstens EINEN** Guide, auf genau einer Ebene (`guideEbene = min(renderTiefe−1, 1)`,
`linienAufbau.ts:176`). Bei ZGB (Tiefe 5) oder OR (Tiefe 4) markiert dieser eine Strich
zwangsläufig nur einen Bruchteil der Verschachtelung — die tieferen Ebenen trägt seit
L-1 ohnehin nur Einzug/Typo (`DESIGN-REGLEMENT-NORMTEXT.md §4b` Rangfolge «Typo > Einzug
> Guide»). Ob der eine Strich per Kategorie, per Dichte-Schwelle oder per Default AN/AUS
gesteuert wird, ändert an diesem Deckel nichts — das erklärt, warum L-3 (Dichte-Boden)
und der frühere G3a-Default (Kategorie) am selben Befund scheiterten: **eine einzelne
Linie kann «viele Ebenen» strukturell nicht abbilden**, unabhängig von der Schalter-Logik
darüber.

**Was sich seit A28 geändert hat (wesentlich für die Varianten unten):** `W2·19-GLIEDERUNG`
ist seit dem 13.8.2026 auf `main` live (PR #478–#481) — eine eigene Seitenleiste mit
Gliederungsbaum, Scroll-Spy-Positionsmarke und Sprungnavigation. Die Erweiterung bis zum
einzelnen Artikel (`gliederungsModell.ts`, `ARTIKEL_EBENE_MAX_BLATT_DECKUNG`) liegt auf
Branch `fix/w2-18-gliederung` (Commit `b7c9ec310`, Stand 13.8.2026, **noch nicht in
main gemergt**). Die Übersichts-Funktion, die der Guide 2026 nie zuverlässig lieferte
(«wo bin ich in der Struktur», «wie tief ist dieser Erlass gegliedert»), übernimmt damit
zunehmend ein anderes, dafür gebautes Werkzeug — das ändert die Ausgangslage gegenüber
Juli/August grundlegend und ist bei der Variantenwahl zu berücksichtigen.

#### b) Varianten (keine ist eine Default-Umkehr)

**V1 — Guide-Mechanik vollständig zurückbauen, Übersicht der Seitenleiste überlassen.**
Die gesamte Linien-Mechanik im Lesetext (`autoGuide`, K11-Tri-State-Schalter «Linien»,
`data-linien`/`data-guide-auto`, `check-linien-kanon.ts` Teil B, zugehörige
`--guide-gliederung`-Verwendung) wird entfernt. Struktur im Fliesstext trägt sich
ausschliesslich über Typo + Einzug (bereits höchste zwei Ränge der §4b-Doktrin);
Navigation/Übersicht liefert die Seitenleiste (W2·19 + W2·18).
*Konsequenzen:* Rückbau, kein Neubau — geringster Aufwand (S), löst die Lehre
**endgültig** (nichts bleibt übrig, das zurückgedreht werden könnte). Verlust: keine
In-Text-Linie mehr, auch nicht optional/manuell. Golden-neutral, `check:linien-kanon`
verliert Teil B (Teil A/Linien-Kanon-Sprache bleibt für Artikel-/Struktur-Trenner
bestehen — betrifft nur den vertikalen Gliederungs-Guide).

**V2 — Guide-Mechanik zurückbauen, dafür Typo-Kontrast der Zwischentitel gezielt
verstärken.** Wie V1 (Guide weg), zusätzlich: Schriftgewicht/-grösse zwischen den
Gliederungsstufen (Teil/Titel/Kapitel/Abschnitt) deutlicher abstufen und den
Weissraum zwischen Ebenen-Wechseln vergrössern (Umsetzung der bereits skizzierten,
nie gebauten Alternativen 1+4 aus `FAHRPLAN-GESETZES-UX.md §10.9`
«A28-Alternativen-Skizze»). *Konsequenzen:* mittlerer Aufwand (M) — Typografie-Tuning
über den ganzen Korpus, Vorher/Nachher-Screenshots hell/dunkel/mobil als Beweis
(wie L-1/L-2 seinerzeit), Risiko eines erneuten «trägt nicht» ist gering, weil es
KEIN Ein/Aus-Mechanismus, sondern eine durchgehende Eigenschaft ist — es gibt nichts
zu falsifizieren im Sinne von «diese eine Linie funktioniert nicht».

**V3 — Guide durch einen dynamischen, scroll-gebundenen Tiefen-Indikator ersetzen.**
Statt einer statischen Linie auf fester Ebene: ein kurzer Guide-Abschnitt, der nur
den Bereich markiert, in dem der Leser gerade steht (gebunden an dieselbe
Scroll-Spy-Mechanik, die die Seitenleisten-Positionsmarke aus W2·19/S5 bereits nutzt),
mit gestuftem Kontrast je Vorfahren-Ebene, max. 1–2 gleichzeitig sichtbar. *Konsequenzen:*
höchster Aufwand (L) — neue, in diesem Kontext unerprobte Mechanik (dynamisch statt
statisch), Perf-Bewertung nach §15 nötig (Scroll-Listener-Budget, CLS-0-Beweis), reales
Risiko eines dritten gescheiterten Versuchs, weil David bislang jede Linien-Variante als
Konzept abgelehnt hat, nicht nur die statische. Baut auf bereits vorhandener
IntersectionObserver-Infrastruktur auf (kein Neubau der Scroll-Erkennung).

*Bewusst nicht als Variante geführt:* «Auto-Default wieder AN, anders geschwellt» — das
ist exakt die verbotene Default-Umkehr (§9.2, Lehre aus L-3/PR #423).

#### c) Empfehlung

**V1.** Begründung: (1) Der strukturelle Deckel — höchstens ein Guide auf einer Ebene —
ist in jeder bisherigen Variante gleich geblieben und war beide Male der Grund für
Davids Ablehnung, nicht die Schwellen-/Default-Logik darüber; eine weitere Justage
derselben Ein-Linien-Mechanik hat keine neue Erfolgsaussicht. (2) Der eigentliche
Zweck («Übersicht in tiefen Gesetzen», Wortlaut A28) wird seit dem 13.8.2026 von einem
dafür gebauten, mächtigeren Werkzeug getragen (Seitenleiste mit Gliederungsbaum und
— sobald `fix/w2-18-gliederung` gemergt ist — Artikel-Sprungziel), nicht mehr vom
Guide. (3) Aufwand/Risiko: V1 ist der einzige Weg, der die §17-Lehre («nie wieder über
eine blosse Default-Umkehr») nicht nur befolgt, sondern das Rückfall-Risiko auf null
senkt, weil nichts Umschaltbares übrig bleibt. V2 bleibt als **günstige Nachrüst-Option**
vorgemerkt, falls David nach dem Rückbau (V1) findet, dass die reine Typo/Einzug-Stufung
im Fliesstext zu wenig Struktur zeigt — sie ist ohne Sunk Cost aus V1 heraus nachrüstbar.
Von **V3 raten wir vorerst ab**: das Risiko eines dritten Fehlschlags an einer erneuten
In-Text-Linie ist real, und der Aufwand rechtfertigt sich nur, wenn David nach V1 aktiv
eine In-Text-Orientierung vermisst, die die Seitenleiste nicht liefert.

#### d) Abweichung vom Spec-Wortlaut (§7-Offenlegungspflicht)

§9.2 verlangt «klickbare Prototypen (Preview-Deploy)» als Teil dieses Schritts. Der
Bau-Auftrag zu diesem Konzept-Schritt (Orchestrator, 13.8.2026) grenzt ihn ausdrücklich
auf ein **Doku-Konzept ohne Code/Preview-Deploy** ein. Dieser Abschnitt liefert darum
Varianten + Konsequenzen + Empfehlung in Textform (mit Datei:Zeile-Belegen zum
bestehenden Verhalten), aber keine anklickbaren Demos. **Vorschlag, wie die Lücke
geschlossen wird:** David wählt hier zunächst eine Richtung (oder verwirft alle Guide-
Varianten zugunsten der Seitenleiste); ein *separater* Bau-Schritt liefert dann
Preview-Deploys **nur der gewählten Variante** (statt aller 2–3 vorab click-baren
Prototypen) — das spart einen Bau-Zyklus für Varianten, die David ohnehin nicht wählt.
Dieser Vorschlag selbst wartet auf Davids Bestätigung (Frage 4 unten).

#### e) Abnahme-Block — ENTSCHIEDEN (David, Chat 13.8.2026)

**Provenienz:** David, Nutzer-Turn 13.8.2026, wörtlich: *«ja linien ganz entfernen. 2 es
reicht. 3 nein. 4. ok»* — Antwort auf die vier Entscheidfragen unten (Fragen zur
Einordnung stehengelassen, Protokoll je Frage direkt darunter).

1. **Soll die Gliederungslinie im Lesetext ganz verschwinden**, weil die neue
   Seitenleiste (Inhaltsverzeichnis mit Sprungfunktion, bald bis zum einzelnen Artikel)
   die Übersicht jetzt übernimmt? *(Das ist Variante V1 — unsere Empfehlung.)*
   → **Ja.** Linie wird ganz entfernt — **Variante V1 ist der Entscheid.**
2. Falls ja: **Reicht dir die heutige Unterscheidung über Schriftgrösse/-gewicht und
   Einzug**, um die Gliederungsebenen im Text zu erkennen — oder soll das zusätzlich
   deutlicher gemacht werden (Variante V2, als spätere, kleine Nachrüstung, falls beim
   Lesen etwas fehlt)?
   → **«es reicht».** Heutige Typo/Einzug-Stufung bleibt unverändert — **Variante V2
   entfällt** (keine Typo-Nachrüstung beauftragt).
3. Oder **willst du trotz der zwei bisherigen Fehlschläge eine dritte Linien-Idee
   ausprobieren** — eine Linie, die nur den Abschnitt markiert, in dem du gerade liest,
   und beim Scrollen mitwandert (Variante V3)? Das ist die aufwendigste und riskanteste
   Option; wir empfehlen sie nicht als ersten Schritt.
   → **Nein.** **Variante V3 ist verworfen.**
4. **Ist es für dich in Ordnung, dass dieser Schritt nur Text + Beleg-Screenshots aus
   der bestehenden Historie liefert statt anklickbarer Demo-Versionen** — und eine
   Demo erst für die von dir gewählte Variante gebaut wird (siehe Abschnitt d)?
   → **«ok».** Doku-only-Vorgehen für diesen Konzept-Schritt war zulässig; §9.2s
   «klickbare Prototypen» entfallen ersatzlos, weil die gewählte Variante (V1) ein
   reiner Rückbau ohne neue Interaktion ist — es gibt nichts, das ein Prototyp zeigen
   müsste, das der Vorher/Nachher-Beweis im Bau-PR nicht ohnehin liefert.

**Ergebnis:** Der Bau-Auftrag ist **V1 — Guide-Mechanik vollständig zurückbauen,
Übersicht der Seitenleiste überlassen** (Abschnitt b oben), ohne Typo-Nachrüstung (V2)
und ohne dynamischen Scroll-Guide (V3). Umsetzung als eigener Roadmap-Schritt:
Checklisten-Zeile am Dach `W2·5h-GESETZ-UI` (bis 14.8.2026 eigenes Etikett `W2·5k-LINIEN-RUECKBAU`).

**Offene Punkte, die in den Bau-Schritt gehen:** (i) ein eigener, golden-neutraler
Bau-PR mit Vorher/Nachher-Beweis (analog L-1/L-2) — deklarierte Verhaltensänderung, kein
verstecktes Refactoring (§6); (ii) `check-linien-kanon.ts` Teil B (Aufbau-Regelwerk)
mitziehen oder stilllegen, Teil A (Linien-Kanon-Sprache für Artikel-/Struktur-Trenner)
bleibt unberührt; (iii) Prüfen, ob `fix/w2-18-gliederung` bis zum Bau-Start gemergt ist
— der Rückbau ist auch mit dem heutigen main-Stand (Gliederungsbaum ohne Artikel-Ebene)
bereits sinnvoll, da die Seitenleiste unabhängig davon lebt; (iv) sollte David parallel
eine eigene Erlass-Kategorisierung für Kantonserlasse/Staatsverträge einführen, bleibt
das nicht mehr betroffen, da die Linien-Mechanik komplett entfällt — die frühere
§4b-A-Lehre (aufbau- statt kategorie-basiert) ist mit dem Rückbau gegenstandslos.

#### f) VOLLZUG — gebaut 16.8.2026 (Branch `feat/w2-5h-gesetz-ui`, PR folgt)

V1 ist umgesetzt. Die vier offenen Punkte aus e) sind erledigt: (i) Vorher/Nachher-
Beweis liegt unter `docs/ux-audit-2026-07/reader/linien-rueckbau-2026-08-16/`
(reproduzierbares Skript `beweis.mjs vorher|nachher`, Screenshots, Messreihe,
`README.md` mit Einordnung); (ii) Teil B des Tors wurde **gestrichen, nicht
umgebaut** — Begründung unten; (iii) `fix/w2-18-gliederung` war beim Bau-Start
nicht in `main`, der Rückbau ist wie vorgesehen davon unabhängig; (iv) gegenstandslos
wie beschrieben.

**Entfernt** (nicht ausgeschaltet — es bleibt nichts Umschaltbares übrig):

| Datei | Was |
|---|---|
| `src/pages/gesetz-leser/linienAufbau.ts` → `strukturTiefe.ts` | `LinienProfil`, `guideEbene`, `dichteAmGuide`, `autoGuide`, `median()`, die Schwellen `TIEF_AB`/`DICHTE_MIN`; übrig `eIdPfadTiefe()` + `strukturTiefe()` |
| `src/pages/gesetz-leser/inhalt.tsx` | `border-l border-guide`, `data-normtext-linie` an der Gliederungs-Sektion, `data-guide-auto` am `.lc-leser`-Root |
| `src/pages/gesetz-leser/LeserAnsichtMenu.tsx` | Schalter «Linien» samt Props `zeigeLinien`/`linienAutoAn` |
| `src/pages/gesetz-leser/LeserMenuPaar.tsx`, `inhalt-kopfmeldung.tsx`, `inhalt-volltext.tsx` | die `linien: LinienProfil`-Propkette; `inhalt-volltext` reicht jetzt `gliederungsTiefe: number` an `ErlassUebersicht` |
| `src/pages/gesetz-leser/leserOptionen.ts` | Feld `linien` und der nur dafür existierende Wert `'auto'` |
| `src/index.css` | beide `[data-linien]`-Regeln, Token `--guide-gliederung` (hell + dunkel) |
| `tailwind.config.js` | Farbe `guide` (zeigte auf das entfernte Token) |
| `scripts/check-linien-kanon.ts` | Teil B vollständig; `border-guide` fällt aus dem Rollen-Kanon |
| `scripts/linien-korpus-verteilung.mjs` | gelöscht (Diagnose-Sonde, spiegelte `linienProfil`; nie in `package.json`) |
| `e2e/leser-linien-kanon.e2e.ts`, `e2e/leser-linien-eid3.e2e.ts` | gelöscht; A28-Fälle in `gesetze-ux-g3a.e2e.ts` und der Linien-Toggle-Fall in `leser-optionen.e2e.ts` ebenso |

**Bewusst geblieben:** Typo + Einzug im Fliesstext (Ränge 1 + 2 der §4b-Rangfolge;
der Einzug ist jetzt **dauerhaft** statt über «Linien AUS» abschaltbar), Teil A des
Linien-Kanons für die Artikel-/Struktur-Trenner samt `--rule-artikel`/`--rule-struktur`,
`data-grundart`, und die Kennzahl «Gliederungstiefe» in der Erlass-Übersicht.

**Warum Teil B gestrichen und nicht umgebaut (§6.7 / §17-Rückbau):** der von Teil B
bewachte Sachverhalt existiert nicht mehr — `autoGuide`/`guideEbene`/`dichteAmGuide`
sind fort, `data-guide-auto` und `data-linien` werden nirgends gesetzt,
`--guide-gliederung` ist aus dem Token-Satz entfernt. Ein umgebautes Teil B hätte nur
noch Konstanten gegen sich selbst geprüft und **könnte nicht mehr rot werden**. Teil A
bleibt scharf; Rot-Probe am 16.8.2026 gefahren (`border-line/70` an einem markierten
Container ⇒ `check:linien-kanon` exit 1 mit Fundstelle `ArtikelLeser.tsx:406`, danach
zurückgenommen ⇒ wieder grün).

**Der Wächter gegen den vierten Anlauf:** `e2e/leser-ohne-gliederungslinie.e2e.ts`
hält fest, dass ZGB Art. 684 (Tiefe 5) und OR Art. 319 (Tiefe 4) **keine** Sektions-
Kante mehr tragen, dass `data-linien`/`data-guide-auto`/der Schalter «Linien» nicht
existieren — und **positiv**, dass der Einzug weiter staffelt, damit ein späterer
«Rückbau» den Fliesstext nicht still flachzieht.

**Spec-Korrektur zu Abschnitt b (lebendige Spec, David 15.8.2026):** b) zählt
`strukturTiefe` implizit zur «gesamten Linien-Mechanik». Am Ist-Code stimmt das nicht:
`strukturTiefe` speist seit `W2·19-GLIEDERUNG/S6` die Kennzahl «Gliederungstiefe» in
`ErlassUebersicht` (`inhalt-volltext.tsx`, Prop `gliederungsTiefe`) und hat mit der
Linie nichts zu tun. Sie bleibt darum erhalten — mitsamt der EID-3(b)-Herleitung und
den Achsen 1–3 ihres Tests (`src/tests/struktur-tiefe-eid3.test.ts`, vormals
`linien-aufbau-eid3.test.ts`; die vierte Achse «`guideEbene` bleibt an die gerenderten
Stufen gebunden» ist mit dem Guide entfallen).
