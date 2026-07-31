# ROADMAP — Erledigt-Chronik (Detail-Archiv erledigter Schritte)

> **Angelegt 10.7.2026 (QS-TOK / T7 «ROADMAP-Chronik-Split», Detailquelle `FAHRPLAN-TOKEN-OEKONOMIE.md` §3).**
> Diese Datei nimmt die **Erledigt-Prosa abgeschlossener (`[x]`) Schritte** aus `ROADMAP.md` auf —
> **verschoben, nie zusammengefasst** (kein Retrieval-Verlust; voller Wortlaut erhalten). In
> `ROADMAP.md` bleibt je Schritt: Checkbox + `@meta`-Etikett + Einzeiler + Pointer hierher.
> `ROADMAP.md` ist damit wieder der schlanke Session-Einstieg; hier steht das «Wie es gebaut wurde»
> zum Nachschlagen.
>
> **Nachhalte-Konvention (T7-K, Spec-Pflicht):** Wird ein Schritt künftig erledigt, wandert seine
> Abschluss-Prosa **direkt hierher** (Protokoll-Konvention in `ROADMAP.md` ▶ Ausführungs-Protokoll);
> in `ROADMAP.md` verbleibt sofort nur Einzeiler + Pointer. Der mechanische Re-Akkumulations-Wächter
> gehört in das QS-TOK-T1-Rotations-Skript (noch offen — kein Doku-Umschichtungs-Gegenstand).
>
> Reihenfolge = wie in `ROADMAP.md` (Wellen-Ordnung). Kein Steuerungs-Dokument: es **steuert nicht**,
> es archiviert nur. Der eine Plan bleibt `ROADMAP.md`.
>
> **Konventions-Erweiterung (Entscheid David 22.7.2026):** Auch **datierte ✅-Teilerfolgs-Prosa
> aus noch OFFENEN (`[ ]`) Schritten** wandert hierher (wörtlich, nie zusammengefasst); im Plan
> bleibt je Teilerfolg ein ✅-Einzeiler + Pointer. **Im Plan bleiben vollständig:** Status-
> Korrekturen, Bau-Warnungen («vor Bau-Start nachmessen»), offene Restposten und alles, was
> künftige Bau-Entscheide steuert. Beweis der Steuerungs-Neutralität je Umschichtung:
> `npm run plan:next` byte-identisch vorher/nachher + `check:plan` grün.

---

<!-- CHRONIK-EINTRAEGE (neue Einträge in ROADMAP-Wellen-Ordnung anhängen) -->

## S0 — Verfallsregister mechanisch *(fristgetrieben, done)*

**Erledigt 28.6.2026 (gebaut + gegated, deployt 2.7.2026):** Parse-Grammatik in eine geteilte
Quelle gezogen (`scripts/verfall-parse.ts`, §5) — `check:verfall` (Tor) und neuer Generator
`gen:verfall` teilen sie. Generator schreibt `src/data/verfallTermine.generated.ts` aus dem
Register; Drift-Tor `check:verfall-ui` in der `check`-Kette. Benannte UI-Fläche: Abschnitt
**«Aktualität & Pflege der Parameter»** auf `/methodik` (`src/components/VerfallUebersicht.tsx`)
listet die 15 datierten Parameter mit nächstem Prüftermin; Tagesbezug (verfallen / bald fällig /
aktuell) client-seitig (prerender-/hydration-sicher). SG-GKV 30.6. erscheint als «bald fällig»,
ab 1.7. «verfallen». `npm run gate` grün, Golden byte-gleich. Deployt 2.7.2026 (a3769d72).

## W1·1 — Begründungs-Absatz *(BEGRUENDUNGS-ABSATZ, done)*

Aus dem Rechen-Ergebnis ein **kopierfertiger, normgestützter Absatz**, jeder Wert mit
Norm+Link+Stand (schliesst die Rückrichtung *Werkzeug→Norm*). **Erst EIN Flaggschiff-
Vertikalschnitt komplett** (Prozesskosten), dann Rollout. §8-Rahmung «keine Rechtsberatung».

**Abschluss-Stand 28.6.2026 (deployt im §9-Batch 2.7.2026, `a3769d72`):** Phasen 0–2 umgesetzt —
`begruendungsAbsatz()` / `fristbeginnZusatz` / `BEGRUENDUNG_VORBEHALT`, `BegruendungSlot` als EINE
Aufrufstelle in 16 Forms, `useKopieren`-Hook, benanntes Engine-Feld `fristbeginnNorm` an ZPO/SchKG
(Magic-Index dort geschlossen, Wächter `src/tests/fristbeginnNorm.test.ts`), 14 `absatz:`-Goldens +
Linter über 14 Engines. Die 4 David-Entscheide sind gefallen; **Entscheid #3 = PDF-Absatz AUS**
(«Ansatz in UI reicht») ⇒ der frühere «nächste Schritt» PDF-Block + Kopier-Hook ist **erledigt bzw.
entfallen**: `PdfDocConfig.begruendung` in `src/lib/pdf/pdfModel.ts` bleibt gebaute, bewusst
abgeschaltete Kapazität ohne Aufrufer (weder entfernen noch stillschweigend anschalten — ein
Wiedereinschalten wäre ein eigener §6-deklarierter Schritt). Restpunkte → `ROADMAP.md`
«Nachträge aus der Archiv-Welle 31.7.2026»; Detail `archiv/FAHRPLAN-BEGRUENDUNGS-ABSATZ.md`.

## W1·2 — Norm↔Werkzeug-Brücke *(RECHTSSAMMLUNG P4/D1, done)*

**Index-Teil erledigt 28.6.2026 (gegated, deployt 2.7.2026).** `werkzeugeFuerNorm` (erlass-granular,
17 Erlasse) benannt + Map `ERLASS_WERKZEUGE` exportiert + Konsistenz-Tor `werkzeuge.test.ts` (kein
stiller Tippfehler → heimlich fehlendes Werkzeug, §8). Anzeige im Reader (KontextPanel «Passende
Werkzeuge») bestand schon; **neu** dezenter «N passende Werkzeuge»-Hinweis auf der Erlass-Karte
(`/gesetze`, Task 4.3). SSoT = Katalog (§5). **Der zweiachsige Startseiten-Einstieg (Rechtsgebiet ×
Aufgabe) ist Schritt 5** (Welle 2) und nutzt denselben Index — kein zweiter Pfad.

## W1·3 — Alltags-Rechner als Cockpits *(neu-Verpackung vorhandener Engines, done)*

**abgearbeitet 28.6.2026:** #2 neu gebaut (Grenzwert-Abgleich); #3 + #4 bestanden bereits
(kein §5-Duplikat gebaut); #1 zurückgestellt (S-5c-Konflikt, Davids Entscheid offen):
- **Fristen-Cockpit** (Vorwärts/Rückwärts/Stillstand) über `fristenspiegel/` + `icsExport`.
  ⚠️ **Zurückgestellt:** kollidiert mit S-5c (10.6.: eigenständiger Fristenspiegel bewusst
  aufgelöst, Ereignisse in Fach-Rechnern). David möchte den eigenständigen Einstieg NICHT
  wieder einführen → nicht gebaut.
- **Streitwert + Grenzwert-Abgleich** ✅ 28.6.2026 (gegated, deployt 2.7.2026): `streitwertGrenzwerte()`
  in `streitwert.ts` ordnet den Verfahrens-Streitwert STRIKT getrennt der ZPO-Verfahrensart
  (Art. 243 I, 30k) und der BGG-Beschwerde-Schwelle (Art. 74 I, 30k/15k Miete-Arbeit) zu; nicht-
  rechenbare Tore (243 II / 74 II / kant. Zuständigkeit / Art. 51–53 BGG) als «selbst prüfen» (§8).
  Schwellen am Snapshot verifiziert (§7). In `StreitwertForm` mit Gebiets-Toggle; Test + visuell.
- **Zuständigkeits-/Verfahrensnavigator** (`zustaendigkeit/straf/schkg`) — ✅ bestand bereits
  vollständig: Rechtsweg-Switcher Zivil/SchKG/Straf, je Weg voller Flow + Hero + Permalink + PDF,
  6 Test-Dateien (inkl. `*Bericht`-Adapter), e2e. Verwaltung bewusst `aktiv:false` (nicht im Scope,
  bräuchte Verifikation). Adress-Ausbau = Schritt 6.
- **Rechtsmittel-/Eintretensprüfung** — ✅ Logik bestand bereits: kantonal `bestimmeRechtsmittel()`
  (Berufung/Beschwerde, Fristen, Art. 314 Familienrecht, Stillstand) + BGG `berechneBgerRechtsweg()`,
  integriert in der Rechtsmittel-Gabelung des Navigators. Eine separate `rechtsmittel.ts` wäre
  §5-Duplikat → bewusst NICHT gebaut.

## W2·5c — Startseite V3 + Branding I2 *(STARTSEITE-V3, done)*

**✅ GEBAUT 3.7.2026 — Bausequenz S1–S5 komplett** (PRs #106 Messaging-SSoT ·
#107 Plumbing · #108 Bugfixes · #111 Neukomposition · S5 Brass-Hero; je Schritt Tore grün,
golden 201 byte-gleich, S4 e2e VOLL 89 passed, S5 Kontrast GEMESSEN hell+dunkel mit 2×
ink-500→ink-600-Ausweich [axe fing den zweiten] + dokumentierter Input-Ruhe-Grenze
[nicht-regressiv]; **Abnahme-Mappe `abnahme/startseite-v3/`** für Davids spätere Sichtung —
kein Druck, Zeitsperre). **Gesetz-/Entscheid-Titel im Zuletzt-Tracker ✅ 3.7.2026**
(Schreibzeit-Auflösung via lazy Manifest-Lader in `lib/zuletztTitel.ts` — dynamic import
erst beim Track-Event per requestIdleCallback+setTimeout-Fallback; Startseiten-/Shell-Chunk
ohne Register-Import [browse-Chunk hash-identisch, +1,1 KB reiner Tracker-Code], Kurzform
Kürzel/Zitierung mit Wortgrenzen-Kappung, Alt-Einträge ohne Titel crash-frei gefiltert;
Playwright-Nachweis OR→«OR», Entscheid→Zitierung, Rechner unverändert). **Rest offen (kein
Blocker):** Doks-Wording «deterministisch statt KI-geschätzt» ✅ nachgezogen (5.7.2026) · Wash-Ton-Veto =
Ein-Klassen-Fallback `bg-surface` in `Hero.tsx`. *Ursprünglicher Auftrag:* Neubau der Einstiegsseite: **modular** (Modul-Registry als FUNDAMENT-Vorleistung),
einfacher Einstieg in alle Funktionen, willkommend + modern OHNE Startup-Look. **Design-Richtung
durch DMAD-Council BINDEND entschieden** (Delegation David): Hybrid «A-Basis + Brass-Hero» als
Schalter-Liste — `bg-brass-100`-Hero mit integrierter Suche als einzige Wärme-Dosis (Fallback
`bg-surface`), KEINE Deko-SVG/Badges/XL-Typo/Gruss-Wort; Schnellrechner VOR den Kacheln;
Favoriten → «Zuletzt verwendet»; Zeiterfassung als Sektion auf `/rechner` (keine neue Route,
`ERWARTETE_ROUTEN` bleibt 57); H1 wird Value Proposition, I2-Messaging-SSoT in `seo.ts` +
neues Tor `check:seo-index`. **Bündelt:** geparkten Startseiten-Merker (30.6.) + I1
Sidebar-Reihenfolge + I2 Branding + W2·5-Startseiten-Modul-Rahmen + Redesign-zurückgestellt
(16.6., Kernideen im Council verwertet). **Bau-Spec (bau-fertig für autonome Opus-Session,
10 verbindliche Auflagen + erzwungene Bausequenz Plumbing→Hero-zuletzt):**
`archiv/FAHRPLAN-STARTSEITE-V3.md`; Herleitung + volles Council-Verdikt:
`bibliothek/recherche/startseite-v3-design.md`. **Auflagen-Kern:** Status-Wording §8-ehrlich
(kein «jede Angabe»-Absolutum, kein «geprüfte Bausteine»), Kontrast-MESSUNG vor Merge,
golden byte-gleich, e2e-Anker erhalten, §12-Koordination (tailwind↔W3·14, seo/prerender↔SEO-A11Y,
Topbar/UniversalSuche↔E2-Suche), Pflicht-Screenshot-Serie + Abnahme-Mappe. Trailer `Roadmap: W2·5c`.

## W2·6 / Verweis-Präzision im Entscheid-Leser (Referenz BGE 151 III 377) *(W2·6, QS-GP, done)*

**Teil 1 (Bug, §1-nah):** i.V.m.-Ketten-Verlinkung. Nur das letzte Glied trägt das Kürzel
(«Art. 684 i.V.m. Art. 679 ZGB»); das Kürzel wird jetzt auf die vorangehenden bare Glieder
**propagiert** und jedes einzeln verlinkt — EINE Wahrheit `normVerweiseImText` (`fedlex.ts`),
konsumiert von `NormText` (Inline-Linker) UND der Fundstellensuche. §1-Vorsicht: Propagation
NUR über echte Konnektoren (i.V.m./in Verbindung mit/und/sowie/Komma) auf bare Glieder; bricht
an Semikolon/BGE-Zitat/Satzgrenze/fremdem Kürzel; «f./ff.»+Abs./lit. brechen nicht; Anzeige
zeichenidentisch (Auflösungsziel synthetisiert). Doppelt verifiziert: 342 Snapshots, **890
propagierte Glieder / 686 Blöcke** (19870→20760 Links), 8 Handproben §1-korrekt.
**Teil 2 (Feature):** (a) Erwägungs-Anker (`e-2-4`, marke-basiert, schon vorhanden) +
Deep-Link-Scroll nach on-demand-Laden; (b) **Zitierte-Normen-Chips im Kopf → Sprung zur ersten
Erwägung mit Fundstelle** (`ersteFundstelle`, gleiche Ketten-Logik → «Art. 679 ZGB»-Chip trifft
die «Art. 684 i.V.m. Art. 679 ZGB»-Stelle in **E. 2.3.1**), lc-ziel-blink-Highlight, Regeste-
Fallback. Tore grün (golden 201, tsc/lint/3127 Tests inkl. neuer Units, `check:entscheide`/
`check:struktur-konsistenz`, Playwright), Snapshots unberührt (additiv).

## W2·6 / BGE-Auszug abgeschnitten — vollständig gefixt (34/34) *(W2·6-BGE, Inhaltsverlust, done)*

29.6.2026 GEFIXT + verifiziert (gate/golden byte-gleich, zwei adversariale Gegenprüfungen
gegen amtliche Quelle; die 1. fand einen Schutz-Tor-Blindfleck — Regex verlangte einen
Buchstaben vor U+2026 und übersah 5 auf Space/Punkt/Ziffer endende Kappungen → Regex auf
`(?<!\()…\s*$` geweitet, 5 nachgezogen, 2. Pass bestätigt). Die Default-«Auszug»-Ansicht der BGE-Leitentscheide schnitt Erwägungen
>5000 Z. **still mitten im Wort** ab (U+2026): `holeBgeLeitentscheid` lud — anders als der
Urteils-Body — den OCL-`/structure`-Auszug nicht voll nach (Datenfehler, nicht CSS).
**Fix** (`scripts/normtext/adapter-entscheide.ts`): geteilter Helfer `fuelleGekappteErwaegungen`
lädt gekappte Erwägungen (`holeErwaegung`) in BEIDEN Pfaden voll nach (Trigger: `text_chars
≥4900` ODER Ellipsis-Ende); **Id-Disambiguierung** gegen die präfixunscharfe OCL-Keyed-Lookup:
mehrere Id-Formen probieren (`151_V_1` · `151 V 1` · `bge_BGE_151_V_1`), nur die EXAKT passende
Entscheidung nehmen, Struktur über die kanonische `decision_id` holen.
**Regenerierung** ohne Vollbau via neuem Flag `npm run entscheide -- --additiv --bge-refresh`
(zieht nur die aktuell gekappten BGE neu, by-id-Überschreib; Bund/Kanton/eidg unberührt,
§7 kein Hand-Edit). **Schutz-Tor** in `check:entscheide`: Block, der auf U+2026 endet
(`(?<!\()…\s*$` — ausser amtl. «(…)»), ist ein gekapptes Excerpt → FEHLER/exit 1; deckt
`abschnitte` + `auszugAbschnitte`. **Ergebnis:** ALLE 34 BGE regeneriert + voll, gate/golden
byte-gleich, `check:entscheide` 0 Kappungen. **Öffnet keinen 26×-Slot.**

**Rest 30.6.2026 geschlossen** — `bge_151_V_1`/`bge_151_V_30` (kurze Seiten-Ids, deren
`/decisions/151_V_1` präfixunscharf auf `151_V_194` matchte) jetzt über die Id-Disambiguierung
(`151 V 1` bzw. `bge_BGE_151_V_1` lösen eindeutig auf, ref=`BGE 151 V 1`) sauber re-gefetcht —
kein Hand-Edit (§7). WARN-Quarantäne wieder entfernt, Tor ist reines FEHLER.

## W2·6a-MAT — Materialien-Verzahnung Stufe 1 *(DATA+UI, done)*

Verwaltungsverordnungen/Wegleitungen als Kanten am Norm-Artikel (David 3.7.: «SECO für ArG, EDÖB für DSG, ESTV für MWSTG»),
E6a Stufe 1 = NUR Verweis-/Register-Ebene (Index-Karte + Norm-Mapping + amtlicher Link, §7 a–d
korrekt gemappt inkl. sichtbarem Live-Link-Beweis, KEIN Volltext). **4 POC-bewiesene Quellen:**
ESTV-MWST (artikelscharf via Fedlex-#art_N-Anker, ToC-Hash-Drift-Arbiter) · SECO ArG/ArGV 1
(artikelscharf via Payload/Dateiname) · EDÖB Leitfäden (Erlass-Ebene ehrlich; VBGÖ gestrichen —
nicht im Korpus) · ESTV KS/RS (Suffix-Kaskade; Seiten-Fallback ehrlich `quelle='maschinell'`).
**Revisions-Invariante:** Cutoff-Tabelle je Erlass (revDSG/MWSTG-Teilrev) — artikelscharfe Kante
nur bei Dokument-Stand ≥ Cutoff, sonst Downgrade Erlass-Ebene; UI sagt «verweist auf … (Stand des
Dokuments)». SSoT `daten/soft-law.db` (gitignored) + **committeter Zustandsträger**
`bibliothek/register/soft-law-zustand.jsonl` (append-only; Entlistetes nie löschen, aus Projektionen
raus) → deterministische Projektion `public/materialien/kanten/<ERLASS>[/<bucket>].json`
(Kanten je (Dokument, Artikel) aggregiert, Bucket-Split ab M0, Weiche C = Rebuild aus
Manifest+Snapshot). Kanten im §3.2-Schema (zitat_key/roh_zitat/konfidenz; quelle-Enum +'amtlich').
Etappen M0 Fundament (check:materialien-NEUBAU) → M1–M4 Adapter (je PR = Prod-sichtbarer
Content-Release in Suche+Browse; browserlos, Drift in normen-monitor.yml) → **M5 UI-Delta GATED
auf V1a-Merge** (dep W2·7-VZUI, nur Etappe M5; BESTEHENDE Materialien-Gruppe, `VerzahnungsKante`
ziel.typ 'verwaltungsverordnung', StatusBadge 'nur-verweis' als bewusster V3-Vorzug; kein
Registry-Refactor). **M1 (ESTV-MWST) gated auf Davids robots-Freigabe Q1 (Fahrplan §8)**; M0/M2–M4
ohne Blocker sofort baubar. Tore: `check:materialien` (Neubau, +Wortfeld+Cutoff+Entlistungs-Quote) ·
`check:materialien-netz` (+normen-monitor.yml-Step) · gegenpruefung-Globs NEU `scripts/materialien/**`
· `gen:zaehler`. Stufe 2 benannt (BSV nach POC, FINMA/SEM nein, PDF-Volltext-Kanten nein). Kein
26×-Bezug — parallel zu E3/VPS fahrbar. Aufwand ehrlich ~7–10 Tage.
**Detailquelle:** `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` (§0 = Kritik-Einarbeitung, §8 = der eine
offene David-Punkt robots Q1). **Stand 4.7.2026: M0 ✅ (#126) · M2 SECO ✅ (#127) · M3 EDÖB ✅
(#128, 10 Dok DSG/BGÖ) · M4 ESTV-KS ✅ (90 Dok, 121 Kanten DBG/VSTG/STG) · M1 ESTV-MWST ✅
(robots-Freigabe David 4.7.2026 im Chat; 48 Dok MI+MBI, 3375 Roh-/1739 aggregierte Kanten
MWSTG/MWSTV, 1417 artikelscharf, 1186 Cutoff-Downgrades, MWSTG-Bucket-Split real,
§2.4-Revisions-Listen doppelt erhoben; Gegenprüfung 2 Durchgänge — D1 fand Anker-Drop
durch Fundstellen-Merge, gefixt via Teil-Kontext + Disambiguierung) · **M5 UI-Delta ✅ 4.7.2026**
(async `kontextSoftLaw`-Loader Shard/Buckets, «Amtliche Materialien»-Gruppe sync+async gemerged
mit Fundstellen-Sublabel «via Art. N u. a.»/Stand + Staleness §2.4 + «maschinell»-Badge; `StatusBadge
'nur-verweis'` als V3-Vorzug auf der MaterialLeser-Karte; `gen:zaehler` +Materialien-Zähler [326] +
Startseiten-Kachel; kuratierter Nachtrag als in-Bundle-Artikel-Anker STATT DB-Migration [DATABREACH→
Art. 24 DSG, KS 6a→Art. 65 DBG, DSFA §2.4-Downgrade — 3/3 gegen Live-Fedlex CONFIRMED]; 10 Unit + 3
e2e grün, CLS 0 auf OR/Startseite). **6a-MAT komplett (M0–M5).**

## W2·7-VZUI — Verzahnung sichtbar machen: V1a/V1c/V1b *(offener Schritt; ✅-Prosa wörtlich verschoben 24.7.2026)*

Ursprünglicher ROADMAP-Wortlaut (Schritt-Kopfzeile, Stand 24.7.2026):

- [ ] **6-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)* — **V1a ✅ GEBAUT 3.7.2026** (PRs #118/#121/#122 + e2e/Doku-PR; Fundament + Vereinheitlichung + Entscheid beide Richtungen + alle 4 Zusatzaufträge; 13 Verzahnungs-e2e grün, Referenzfall ZGB 684→BGE 151 III 377 = E. 2.3.1) · **V1c ✅ GEBAUT 4.7.2026** (Normrevisions-Ehrlichkeit: Build-Extrakt `public/verzahnung/artikel-revisionen/` 201 Erlasse/12702 Artikel + `klassifiziereFassungsBezug` in LeitfallZeile/KontextPanel/EntscheidLeser + `StatusBadge revidiert` ↻ mit Revisionsdatum+AS; Gegenprüfung bestanden — 3 reale Parser-Bugs gefixt, 0 Rest über 12702 Belege + 10 Artikel gegen Fedlex; 22 Unit + e2e AIG Art. 5/34); **V1b ✅ GEBAUT 4.7.2026** (Branch `feat/vzui-v1b-rangliste`; E4-Rangliste in die 19 Leitfall-Shards eingebacken: `norm_rangliste`-`gewicht` ersetzt build-time das kuratierte, Provenienz NIE gemischt — `gewichtQuelle:'e4'|'alt'` je Shard, 5 e4 [AHVG/AVIG/BVG/ELG/VVG] / 14 alt [vintage-absent Band-152-BGE oder Recall-Lücke]; masse.db-Rebuild deterministisch [195 342 Entscheide, Resolve-Quote 0,8245], Oracle-Tor GRÜN 931 Tripel/0 UNERKLÄRT, `check:entscheide` prüft Membership+Monotonie masse-frei; **727a-Vorbestands-Bug gefixt** [`normArtikelToken` strippt `_`, Reader-Query `727_a`→Shard `727a`]; Gegenprüfung bestanden) · **offen: V2 (E3-Serving) · V2 (E3-Serving) · V3 (E6a)**:

---

## W2·7 — Verzahnungs-Klingen *(done)*

**GEBAUT 5.7.2026** (Worktree `feat/w27-verzahnungs-klingen`, Dossier
`bibliothek/recherche/verzahnungs-klingen-w27.md`, STRUKTUR-Karte 5.7.). **(a) Verjährungs-/
Gewährleistungs-Board** (`/rechner/verjaehrung-board`): `verjaehrung.ts`-Regime-Matrix +
Gewährleistungs-Sonderfall + AT-Brücke; CISG nur Link. **(b) Verzugszins-/Forderungs-/Inkasso-
Strecke** (`/rechner/inkasso-strecke`): stateless Reverse-Reader Verzug→Verzugszins→Mahnung→
Betreibung→Fristen. **(c) Gerichts-Baustein-Set**: amtlicher Zitierer BGE/BGer
(`/rechner/gerichtszitat`, `gerichtszitat.ts`) + Rubrum-Vorlage (`/vorlagen/rubrum`, Art. 238
ZPO/112 BGG live verifiziert + gegengeprüft bestanden). Reine Darstellung auf bestehenden Engines
(§3); Golden 201 unverändert (+8 additiv), Gate grün, e2e 163, Gegenprüfung bestanden.

## W3·14-Responsive-Audit — Bildschirm-/Responsive-Audit *(SPLIT-VIEW, done)*

**ein** `ultracode`-Workflow — **AUDIT GEFAHREN 5.7.2026 (rein lesend, PR `chore/responsive-audit`):
30 Motive × 5 Breiten (390/768/1280/1536/2560) = 150 Aufnahmen; 0 Seiten-Overflow, 0 Konsolenfehler;
12 Defekte geflaggt (1 hoch: Vorschau-Knopf im Vertragstyp-Raster @390 · 2 mittel: Header-Tap-Ziele
<44px @390, methodik-Einzelspalte @2560 · 9 niedrig, 2 davon «manuell verifizieren»). Befund +
Anleitung `abnahme/responsive-audit/BERICHT.md`; Fixes = spätere Schritt-14-Einheiten.**

*Ursprüngliche Bau-Anweisung (Plan):* fotografiert **Seiten × Breakpoints** (Handy hoch ~390 ·
Tablet ~768 · Laptop ~1280 · Desktop ~1536 · Ultrawide ~2560) und flaggt Layout/Umbruch/**Tabellen-
Overflow** (maschinell je `<table>`/Pane über `scrollWidth>clientWidth`, deterministisch §2).
**Werkzeug zuerst prüfen (§5/§10): auf dem bestehenden Playwright-bash-Harness `scripts/screenshots.ts`
aufsetzen** — Playwright-Start, Motiv→Route, Arg-Parsing und ehrliches FEHLT-Logging (§8) sind dort
schon da; nur die Breitenliste (heute 360/768/1280) auf die fünf erweitern und die Seitenmenge
ergänzen, **nicht** neu erfinden. **NICHT** der Playwright-MCP (Bash-Lektion 22.6.); Playwright ist
bereits Dependency. **Aufruf** (kontextlos lauffähig): `npm run preview -- --port 4321 --strictPort`,
dann `npx vite-node scripts/screenshots.ts -- --base-url http://localhost:4321 --out
abnahme/responsive-audit/ist-<sha7>` — neuer Ausgabe-Pfad ⇒ eine `.gitignore`-Zeile
`abnahme/responsive-audit/` ergänzen, Binär-PNGs nie committen (§6). **Rein lesend:** berührt selbst
keine §12-Kollisionsdatei und kein Golden-/Logik-Tor (§6), Status-Modell unberührt (§8), kein Deploy
ohne Davids Ja (§9); Befund = Screenshot-Mappe + Defektliste, **rein visuell verifizierbar, keine
Davids-Fachzeit**. **Kein eigener Strang — gehört in Schritt 14** (dasselbe Breakpoint-/Container-
Query-Subsystem), denn die aus dem Audit folgenden Fixes treffen **dieselben §12-Kollisionsdateien wie
Schritt 14** → **im selben Worktree wie Strang B, nie als paralleler Strang** (kein 26×-Bezug).

## W2·5d — Gesetzes-UX: Teilerfolge G0–G6 + Anmerkungs-Welle A1–A18 *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  **Stand 4.7.2026:** **G0** (Grundart-Register/`check:grundart`) **und G1**
  (Linien-Kanon 3 Rollen-Tokens + `max-w-reading` + Einzug-Skala/Mobil-Kollaps +
  `hyphens:manual` + Randtitel-Hänge-Einzug; Tore R1 `check:linien-kanon` /
  R2 eslint / R4·R5 e2e; Reglement-Falt in `DESIGN-REGLEMENT-NORMTEXT.md §4b`;
  Wortlaut + Engine-Golden byte-gleich) **gebaut**. **G2a** (Leser-Options-Leiste
  Linien/Fussnoten/Verweise als reine `data-*`/CSS-Toggles am `<html>`,
  localStorage + Pre-Paint via `main.tsx` CSP-konform ohne Inline-Script;
  `leserOptionen.ts` + `LeserOptionenLeiste.tsx`; R6 golden byte-gleich bewiesen
  [`golden:vergleich` IDENTISCH 201], R9 Fussnoten-«AUS» dämpft/versteckt nie
  [e2e]; global = beide Reader-Instanzen synchron ohne Re-Render §15) **gebaut**.
  Bewusste G2a-Grenze: Linien-Default global AN (grundart-abhängiger Default =
  G2b, `grundart` nicht auf `BrowseErlass`); Fussnoten-Options-Toggle koexistiert
  mit dem bestehenden Apparat-Schalter (Unifizierung = G2b Kopf-Zusammenführung).
  Nächste Etappe **G2b** (Kopf-Merge/Fussnoten-Render-Fix/Sticky-Kontextkopf).
  R5-Mobil offengelegt auf ~30ch statt aspirativ 40ch (physikalisch gedeckelt
  @390, s. FAHRPLAN + Spec-Kommentar). **G4** (Einstieg /gesetze + Cmd/Ctrl-K,
  eigener Worktree, kollisionsarm) **gebaut**: (a) Landeplatz löst die Dreifach-
  Redundanz auf — drei gleichwertige Einstiegskacheln mit Live-Statistik statt
  stillem Bund-Default, neutrale Overline, Segment/Tab-Panel erst NACH Säulen-Wahl
  (`?ebene=`); alte Deep-Links (`?ebene=`/`?kt=`/`#sys-`/`?q=`) bleiben erreichbar.
  (b) Globale **Befehls-/Sprung-Palette** (`Cmd/Ctrl-K` + Mobil-Knopf in der Topbar)
  mit deterministischem **Norm-Query-Parser** (`src/lib/suche/normQuery.ts`):
  «OR 257d»/«Art. 5 AIG»/«ZGB 684 II»/«VMWG»/Kanton mit Code «StG AI 5» →
  `#art-<token>`-Deep-Link in ≤2 Interaktionen; Token-Ableitung kongruent
  passus.ts (257d→257_d, 49abis→49_a_bis), KEIN neuer Index (sitzt auf dem
  Browse-Manifest), Freitext → normale Suche (kein Fehl-Sprung). Lazy (§15, kein
  Eager-Load im Erst-Paint), a11y role="dialog"/Fokus-Falle/Esc via `useDialogFokus`.
  29 Unit-Akzeptanztests (`normQuery.test.ts`), 6 e2e (`befehlspalette.e2e.ts`);
  golden byte-gleich (kein Normtext/Engine); `gegenpruefung: n/a — reine UI`.
  **G5** (Kantons-Seite entrümpelt, eigener Worktree, kollisionsarm) **gebaut**:
  Kontext-Zeile Mengen-Asymmetrie (§8) · Sicht-Umschalter **Karte | Liste**
  (Karte default sichtbar statt zugeklapptem `<details>`) · Sortierung
  **Alphabet/Erlass-Zahl/Region** (Region = BFS-Grossregionen `grossregionen.ts`) ·
  Ordnung vereinheitlicht (Sidebar-Kantone alphabetisch nach Vollname statt föderal,
  `navigation.ts`) · Roh-Code→Klartext (Sammlungs-Kürzel-Buckets «LS»/«bGS» → ein
  ehrlicher «Nicht systematisiert»-Block statt «Bereich LS», Roh-Code bleibt je
  Erlass an der Nummer) · Mobil-Vollnamen (kein `truncate`, wrap). Reine Darstellung
  (§3), kein Risiko-Pfad im Diff → `gegenpruefung: n/a`; golden `golden:vergleich`
  IDENTISCH; 8 Unit (`grossregionen`/`navigation`) + 6 e2e (`gesetze-kanton-g5`),
  volle Suite 139 grün.
  **G2b** (Kopf-Merge `ErlassLeserKopf` + Fussnoten-Unifizierung + Sticky-Section-
  Kontextkopf + «Zitat kopieren», eigener Worktree) **gebaut** (s. STRUKTUR-Karte).
  **G3a** (Per-Grundart-Darstellung, Worktree `feat/gesetzes-ux-g3a`) **gebaut
  (5.7.2026):** Laufzeit-Grundart aus `GRUNDART_SEED` via `grundartMeta()` in der
  Darstellungsschicht (`helpers.tsx`, §5 — kantonale Erlasse stehen nicht im
  `ERLASS_REGISTER`, darum Seed als SSoT; **kein Risiko-Pfad im Diff**). **erlassTyp-
  Kopf-Label** (`kopfOverline`): 103 Verordnungen heissen jetzt «Verordnung» statt
  «Bundesgesetz», BV «Bundesverfassung», 18 Staatsverträge «Staatsvertrag», Kanton
  «Kanton XX · Gesetz|Verordnung». **⑥ KANTON §-Label:** «§ N» steht schon im
  Snapshot-`artikelLabel` → `bestimmungsEtikett` steuert nur das Kopf-Zähl-Substantiv
  «N Paragraphen» (775 §-Kantone); Anker bleibt **überall** `art-<token>` (R8, e2e).
  **⑤ Staatsvertrag** Präambel (bereits `ErlassKopfBlock`) + Label; **⑦ PDF-Rahmen**
  `border-rule-struktur`; **⑧ LIVE_VERWEIS** ehrliche Verweiskarte statt Fehlerseite
  (amtlicher Live-Link + Stand + §8-Hinweis) für die 9 `nur-live-link`-Erlasse; **④**
  Kurzerlass-Lesespalte lag durch G1 schon auf `max-w-reading`. **K11 umgesetzt**
  (grundart-abhängiger Linien-Default): Tri-State `data-linien:auto` + `data-grundart`
  am `.lc-leser` — nur KODIFIKATION zeigt den Guide im Default, expliziter Klick
  übersteuert; CLS 0. **Nebenfix:** Options-Switch OFF-Zustand `text-ink-500`→
  `text-ink-600` (WCAG 4.47→~6.7:1, latenter G2a-a11y-Bug, durch K11-Default-OFF
  aufgedeckt). Reine Darstellung (§3) → **`gegenpruefung: n/a`**; `golden:vergleich`
  IDENTISCH (201) + Prosa-Byte-Beweis ZGB/OR/VMWG/BV/AG-Kanton gegen `origin/main`;
  `check:grundart`/`check:linien-kanon`/`check:normtext`/`check:struktur-konsistenz`
  grün; neuer e2e `gesetze-ux-g3a` (6) + a11y/leser-Specs grün.
  **G6** (Rechtsgebiets-Sicht «Gerüst», Worktree `feat/gesetzes-ux-g6`,
  kollisionsarm) **gebaut (5.7.2026):** zweite, achsen-orthogonale Gliederung über
  eine vierte Landeplatz-Tür (`?ansicht=rechtsgebiet`) in `src/pages/Gesetze.tsx` —
  (a) **Auto-Grundgerüst** aus der vorhandenen `rechtsgebiet`-Achse (7 GEBIETE,
  aufklappbar, deckt JEDEN Bund-Erlass) + (b) **Querschnitts-Delta**: 8 kuratierte
  Praxisfelder (Arbeit / Miete & Pacht / Vertrag & Haftung / Gesellschaft & Handel /
  Familie & Erbrecht / Sachenrecht & Grundeigentum / Zwangsvollstreckung / Steuern &
  Abgaben) in `src/lib/normtext/rechtsgebiet-thema.ts` (SSoT — **kein** dupliziertes
  Register-Feld `rechtsgebietThema`, Abweichung von Spec §5.1 offengelegt, §5), enge
  Norm-Verankerung mit funktionierendem Deep-Link (OR Art. 319–362 → `#art-319`,
  Anker bleibt `art-<token>`, K2/R8) + je Thema **Verzahnung** (Rechner-Slug +
  `/rechtsprechung?rg=`) + `status: entwurf` (§8, K8). **Tolerantes Tor**
  `src/tests/rechtsgebiet-thema.test.ts`: Mitglieder-/Werkzeug-Slugs müssen
  existieren, 6–8 Themen, §7-Beleg je Zeile; Abdeckung wird beziffert (40/229
  Bund-Erlasse thematisiert), «unzugeordnet» ist zulässig (nie rot). Reine
  Darstellung/Klassifikation (§3); `golden:vergleich` IDENTISCH (201); neuer e2e
  `gesetze-rechtsgebiet-g6` (2) + Landeplatz-/Kanton-Regressionen grün; Visual-Review
  Desktop 1440 + Mobil 390 (0 Overflow). **Vollkuration bleibt späterer Strang**
  (nach Abnahme-Zeitsperre). **G3b Schritt 1 · Kanton-Tarif-Tabellen Stufe 2, Klasse A+D
  (Risiko-Pfad, 5.7.2026) gebaut:** die bereits extrahierten ·/—-Kanton-Tabellen
  (NW-265.51, BS-154.810, BS-291.400, SO-614.11, VS-173.8-de+fr; 32 Blöcke) vom
  Legacy-`{kopf,zeilen}` aufs kanonische typisierte `{spalten:[{typ,titel}],zeilen}`-
  Modell (T-B1/T-B4) nachgezogen → typgesteuerte Ausrichtung + Klasse-D-Tausender-
  gruppierung NUR in betrag/zahl/bereich (T-C5). Behebt einen §7-Faithfulness-Bug
  des Legacy-Renderers (globales `gruppiereTausender` verunstaltete Zitat-Jahre:
  «1937»→«1'937» in BS-154.810 Verfahrens-Spalten). Deterministischer Spalten-Typer
  `typisiereSpalten` (Prosa/Position→text, Staffel→bereich, Betrag→betrag, Satz/%→zahl,
  ziffernloses Einzelwort «gebührenfrei»→betrags-kompatibel); Werte (`zeilen`)
  byte-gleich (nur Typ-Metadaten+`sha` neu). Offline-Re-Projektion über den
  generator-eigenen Typer+`sha256Bloecke` (kein LexWork-Refetch → 0 Fremd-Drift).
  `check:gegenpruefung` **bestanden** (unabhängiger Opus-Pass gegen LexWork-APIs
  NW/BS/SO/VS, alle Stichproben byte-exakt, 0 Zeile verloren). Tore
  golden/tsc/vitest/lint/check:tabellen/paritaet/normtext grün, e2e 12/12; Visual
  Desktop+Mobil (0 Overflow @390). Zusatz: e2e-Flake `gesetze.e2e.ts` (OR
  fill-Timeout) gehärtet (Scroll-Spy/Suche-Kontrakt auf VGKE seitengrössen-
  unabhängig, App-Ready-Wait; 6× CPU-Throttle-Probe 5/5). **G3b Schritt 2 ·
  Anhang-Block-Rendering ③/⑤ (reine Darstellung, 5.7.2026) gebaut:** Anhänge
  (`annex_*`) + Staatsvertrags-Protokolle (`lvl_*`, LugÜ) rendern jetzt als
  eigenständig erkennbare, klar abgesetzte Blöcke (Struktur-Trenner + «Anhang N»/
  «Protokoll N» als Struktur-Überschrift, `data-anhang`; Anker bleibt `#art-`/R8;
  Ziffer-Zwischentitel via bestehendem `titel`-Block/M13). **LugÜ-Mobil-Overflow
  (scrollW 790 @390) gefixt** — Ursache war empirisch NICHT die Tabelle (die
  scrollt im `overflow-x-auto`-Container), sondern der `shrink-0`-Bereich-Badge der
  Anhang-Sektion (Lang-Labels 770px) → für Anhang-Sektionen unterdrückt + generisch
  umbruchfähig. Mehrspalten-Tabellen: `lc-scroll-x` + `min-w-full w-max` → breite
  Tabellen scrollen seitlich statt Zellen zu zerquetschen. **`gegenpruefung: n/a`
  literal** (nur `src/pages/gesetz-leser/**` + `ArtikelBody.tsx` + e2e — keine
  Risiko-Datei). Wortlaut-Byte-Beweis GSchV/ChemRRV/LugÜ/ZGB byte-identisch gegen
  `origin/main`; voller `gate` grün; e2e 1 Worker grün + neuer Spec
  `gesetze-ux-g3b-anhang` (5); Visual Desktop 1440 + Mobil 390 (0 Overflow @390).
  Trailer `Roadmap: W2·5d`.
  **G3b Schritt 2 (Tarif-Strang) · Klasse B (verklebte Zahlen, 5.7.2026,
  parallel zur Anhang-Einheit) fertig:** die x-koordinaten-rekonstruierten
  Streitwert-Staffeln ZH-215.3 §4, ZH-211.11 §3+§4 (zhlex-PDF) sowie ZG-163.4 §3,
  TG-176.31 §5 (LexWork-·/—) aufs kanonische `spalten`-Modell nachgezogen (5
  Tabellen / 44 Zeilen; `zeilen` byte-gleich). **Befund (§7, wie Schritt 1):** die
  x-Spaltenrekonstruktion war für ZH bereits committet (Commits e17793e8/559b1d9a),
  ZG/TG kommen vor-gespalten aus den LexWork-Zellen — kein NEUer Extraktions-Code
  nötig; der ZH-Adapter emittiert die Staffel jetzt kanonisch (kein Legacy-Regress).
  Verkleben-Befunde `100001250`=`10 000`|`1'250` und `5000250`=`5 000`|`250`
  x-getrennt verifiziert. `check:gegenpruefung` **bestanden** (unabhängiger Opus,
  44 Zeilen gegen zhlex-PDF via pdfplumber + LexWork-xhtml; Konkatenation==Roh,
  0 verloren/erfunden/geändert). Tore golden/tsc/vitest/lint/check:tabellen/
  paritaet grün, e2e 158; Visual ZH-215.3 §4 + ZH-211.11 §4 Desktop+Mobil (Tabelle
  scrollt im Container, 0 Page-Overflow @390, Tausender-Apostroph korrekt).
  **G3b Schritt 3 (Tarif-Strang) · Klasse C (SG-Füllpunkt-Rest, 5.7.2026) fertig —
  G3b KOMPLETT (A+B+C+D):** Diagnose der 159 nicht erfassten SG-Blöcke (SG-3849 135/
  SG-2935 20/SG-2808 4) = **kein** Block-Grenzen-Problem, sondern der **DEFECT-1-Guard**
  (Block als Plaintext gedroppt, sobald das letzte Leader-Segment nach dem Betrag noch
  angeklebten Folge-Inhalt trug — nächste Position/Überschrift/Folge-Artikel/Seitenzahl).
  Fix §1-konservativ: DEFECT-1 → **`nachtext`** (saubere Leader-Zeilen tableisiert, trailing
  Rest verlustfrei als Folge-Textblock; **Konkatenations-Invariante** als Unit-Test).
  Mehrdeutiges bleibt Text (mittleres Segment ohne Betrag, eingebetteter No-Leader-Betrag,
  No-Dash). **127 Einträge → +127 Tabellen** (SG-3849 110/SG-2935 15/SG-2808 2), **32 §1-
  konservativ Plaintext** (14 eingebettete Beträge + 18 Nicht-Tarif-Füllpunkte, unverändert
  zu HEAD). **Blast-Radius bewiesen SG-only** (0 Fremd-Kanton neu tableisiert; AUSSCHLUSS
  BL/FR unberührt). Klasse D für SG-`tabelle` durch bestehenden `TarifTabelle`-Renderer
  gedeckt (`gruppiereTausender` → `4'000`/`15'000`). Offline-Nachzug `kanton-fuellpunkt-
  nachzug.ts` (exakte produktive `reichereTabellen`, kein PDF-Refetch → 0 Drift); leader-
  freier Inhalt aller 728 SG-Einträge byte-identisch HEAD↔regeneriert. `check:gegenpruefung`
  **bestanden** (unabhängiger Opus, neue Tabellen zeichenweise gegen SG-PDFs via pdfplumber).
  Tore golden `IDENTISCH`/tsc/vitest/lint/check:tabellen/paritaet/normtext/struktur-konsistenz
  grün, e2e 163/163; Visual SG Desktop 1200 + Mobil 390 (0 Overflow @390, Apostroph korrekt).
  `ArtikelBody`/Reader unberührt (TABU). Detail: `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`.
  **Stand 5.7.: G0–G6 ✅ gemergt** (#132/#135/#136/#141/#143/#145/#147/#148/#149,
  golden byte-gleich). **Anmerkungs-Welle A1–A18 (David 5.7., Go erteilt im Chat
  «run till dry»; Wortlaut-Quelle `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-05.md`,
  Bau-Spec `FAHRPLAN-GESETZES-UX.md` §10):** revidiert die GEMERGTEN Etappen —
  **U-LINIEN ✅ gebaut** (PR `feat/u-linien-a8`: Linien-Default aufbau-basiert statt
  grundart-Kategorie — SSoT `linienAufbau.ts`, Schwellen empirisch aus 1135 Sidecars,
  Reglement §4b-A, Tor `check:linien-kanon` = R1/R4-Nachfolger; ZGB ruhig, ArG
  sichtbar; Wortlaut/Golden byte-gleich) → **U-KOPF ✅ gebaut** (PR
  `feat/u-kopf-a1-a3-a4`, Auto-Merge armiert; Ausführungsvermerk §10.7): A1
  Fussnoten-AUS = VERSCHWINDEN (display:none, überstimmt R9 — David-Entscheid;
  Normtext bleibt durchsuchbar, Print folgt Toggle, CLS 0) · A3 Positions-Leiste =
  echte klickbare Breadcrumbs (nav/ol/li, aria-current, springeZuSektion) · A4
  «Ansicht»-Dropdown im Kopf (`LeserAnsichtMenu`, ehrliche Disclosure + useDialog-
  Fokus; Chip-Leiste entfällt); P1 golden-ändernd (Kopf-Markup), Artikel-Prosa
  byte-gleich; Gate + e2e (inkl. neuer A9-Throttle `leser-kopf-a9`) grün →
  **U-VERWEIS ✅ gebaut (10.7., PR `feat/u-verweis-a7-a10-a11-a13`;
  Ausführungsvermerk §10.7):** A10 Plural-Linker `artikelnPluralVerweise`
  (MWSTG Art. 5 = GENAU 5 Links art_31/35/37/38/45; bounded, §1-Unterdrückungs-
  Regeln BGSA/Code-civil/42octies; Korpus 2091 Regionen/5187 Glieder) · A11
  Präambel-Verweise (kuratierte Genitiv-Map «der Bundesverfassung»→BV, 26 belegte
  Einträge + **aBV-Schutz**: Ingress-Linkung nur Erlassdatum ≥ 2000) · A7
  Verweis-Popover strukturiert (Wortlaut → Provenienz → Massgebliche Entscheide →
  abgetrennt Amtliche Materialien; `VerweisKontext`, geteilte Shards, Top-3+Zähler,
  CLS 0 by construction) · A13 Materialien-Kanten klarer (artikelscharf prominent,
  Erlass-Ebene hinter `<details>`-Zähler). Reglement §5a; Gate voll grün, Engine-
  Golden byte-gleich, e2e 188/188 inkl. `verweis-u` (A9-Throttle) →**
  **U-POSITION ✅ gebaut (11.7., PR `feat/u-position-a2-a16-a17`;
  Ausführungsvermerk §10.7):** A2 inhalts-proportionale content-visibility-
  Platzhalterhöhe (`schaetzeArtikelHoehe`, überschreibt den Flach-320px →
  proportionaler Scrollbalken, content-visibility bleibt = kein Logikverlust) ·
  A16 anker-basierte Scroll-Restoration (`scrollAnker.ts`, oberster Artikel +
  Offset, element-basiert robust gegen die Höhenschätzung; interne Verweise
  navigieren über den Router = echter History-Eintrag; NormPopover «Im Gesetz
  öffnen» SPA-`<Link>` → Cross-Erlass-Zurück landet am Ausgangs-Artikel) · A17
  Split-View liest den Pane-lokalen Hash/`?norm` ⇒ Norm-⧉ öffnet an Art.+Passus,
  Entscheid-⧉ an der Erwägung (nie stumm falsch). Golden byte-gleich (Client-
  Reader; kein `public/normtext`), Gate voll grün, e2e `leser-position-u` (P4 +
  A9-Throttle CLS 0). Parallel kollisionsarm:
  **U-SUCHE ✅ AUSGEFÜHRT (5.7., PR feat/u-suche-a5-a6, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** normQuery aus der
  gelöschten `BefehlsPalette` in die NORMALE Suchleiste (Sprung = oberster
  Treffer, Enter springt), Palette entfällt, ⌘K/«/» fokussieren die HeaderSuche;
  A6-Relevanz-Gruppierung (Rechtsinhalte vor Werkzeugen); KEIN Zweit-Index; Gate
  + e2e grün, `Gegenpruefung: n/a` · U-UEBERSICHT (A14/A15: Titel umbrechen statt kappen,
  Relevanz-Sortierung dokumentiert-deterministisch, Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen; G6 = Modus statt vierte
  Tür) · **U-PDF ✅ AUSGEFÜHRT (11.7., PR `feat/u-pdf-a12`, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** Download = amtliches PDF
  der gepinnten Fassung (Bund Fedlex-`isExemplifiedBy` build-time — Suffix-Falle `-2`
  durch exakte URL statt Konstruktion gelöst, 227/227; Kanton LexWork bei Versions-
  Gleichstand, 1184/1231; Staatsvertrag self-hosted; render-eigenes `.txt` entfernt,
  §10.5); neues Tor `check:pdf-quellen` bindet die PDF-URL an die `fedlex-cache.sh`-
  Pins; `Gegenpruefung: bestanden` (P5-Stichprobe 12, Fassungsdatum-im-PDF-Beweis
  inkl. `-2`). **Damit ist die kollisionsarme A1–A18-Welle gebaut; offen nur das in
  CI laufende U-POSITION (A2/A16/A17).** A18 (BGE-Regeste nach Sprachen) → W2·6-B B2.
  A9 = DoD-Querschnitt (CPU-Throttle-Beweis) in jedem Bau-Prompt. **Kollisions-
  Precheck gegen laufende Worktrees (lm-qsperf/lm-l0) vor jeder Einheit; W2·7-Klingen
  #154 und W2·6a-MAT sind gemergt — nicht mehr live.** Trailer `Roadmap: W2·5d`.
  **U-UEBERSICHT ✅ (5.7., Opus, Worktree `feat/u-uebersicht-a14-a15`):** A14
  (Kanton-Titel umbrechen statt kappen + Relevanz-Sortierung = dokumentierte
  Kern-Erlass-Kategorie, dann Systematik) + A15 (Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen, G6 = Modus + Tür bleibt;
  Wahl persistent `?gliederung=`/localStorage, alle bestehenden Deep-Links
  erreichbar). SR-0.*-Labels per Gegenprüfung korrigiert (0.5 → «Krieg und
  Neutralität»). Gate 25/25 grün, golden identisch, e2e 173/173 (inkl. A9
  6×-Throttle). Detail: `FAHRPLAN-GESETZES-UX.md` §10.7. Rest der Welle offen
  (U-LINIEN/U-KOPF/U-VERWEIS/U-POSITION Reader-Kette nach QS-PERF; U-SUCHE; U-PDF).

## W2·5b — Reader-Darstellung Bund: Bündel R/N + Phase-1-Batch + Restblock *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  - **+ Auftrags-Eingang 30.6.:** **[x] Bündel R ✅ FERTIG + LIVE** (PR #59 `0560fd87`, prod-verifiziert 30.6.
    via Perf-Deploy): R1 Scroll-Spy Kopf+Gliederung · R2 Gliederung links ab 1024 px · R3 A−/A+ Schriftgrösse
    statt Kompakt/Breit. **[x] Bündel N ✅ FERTIG (1.7., Worktree, gegated — deployt 2.7.2026):**
    **N1** zerrissene Artikelnummer «329 g»→«329g» am Extraktor (`entferneTags` strippt Inline-Tags
    leerzeichenlos, Ziffern-sup/sub behalten Abstand; 194 Bund-Snapshots regeneriert, golden byte-gleich,
    Opus-Gegenprüfung BESTANDEN). **N2** falscher Self-Link auf benanntes Fremdgesetz unterdrückt
    (`fremdgesetzNachArtikel`, ~1195 Fälle, render-only; §7-Abweichung: ELI-Ziel steht NICHT im HTML-Body
    → erlass-genaue Chips = Phase-1-Folge; Gegenprüfung fand+fixte FinfraV-FINMA-Kürzel-Regression).
    **+ Verifikations-Tor** `check:invarianten` (Markup-/Entity-/Suffix-Leak). **+ Status-Marker:
    empirisch schon erfüllt** (aufgehoben = «· aufgehoben»-Statuszeile + Einklappen; noch-nicht-in-Kraft
    kommt bei current-consolidation-Pinning nicht vor) → §7-dokumentiert, kein Neubau. Details Eingangsblock.
  - **+ 2.7.: Verlässliche-Umwandlung-Spec (Fable-Ultracode) + Phase-1-Fundament-Batch.** Spec
    `docs/superpowers/specs/2026-07-02-verlaessliche-normtext-umwandlung-bund.md` (Verdikt Hybrid «XML-Träger,
    HTML-Arbiter»; verlinkt aus `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur`). **[x]** erster Bau-Schritt
    rein HTML gebaut+gegated+gegenprüft: **P2** Split-sup-Merge (6 Blöcke: GEBV/HMG×2/KLV/CO2/VRV), **P4**
    SSV-Kachel-379-Leak, **P1** sha deckt `mehrspaltig.spalten`, **P5** `[tab]`-Negativ-Lexikon (Expected-Fail-Register).
    **[x] P3** Drop-Klasse laut ✅ 5.7.2026 (W2·5b-Restblock, s.u.). Detail STRUKTUR-Karte 2.7. + Spec §7.
  - [x] **+ Audit-Andockung 3.7.2026 (Audit 1, `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`):** **N3 · `he` statt
    Handtabelle ✅ 3.7.2026** (Branch `feat/nulltarif-werkzeuge`: Ergebnis BESSER als erwartet — Bund-Regen aus
    gepinnten Caches **0-Byte-Diff** (golden-neutral; die `&ge;`/`&le;`-Klasse sitzt in Kanton-Quellen und
    greift bei deren nächstem Regen); einzige Divergenzen der Alt-Tabelle: `&nbsp;`/`&mu;` als dokumentierte
    Sonderfälle BEHALTEN, `&ldquo;`/`&rdquo;`-ASCII-Abflachung als deklarierte Korrektur auf WHATWG (Korpus-Impact
    heute null); Beleg `bibliothek/register/he-entity-korrekturen-2026-07-03.md`, QS-GP-Quittung).
    **✅ W2·5b-Restblock KOMPLETT 5.7.2026 (Worktree `feat/w25b-l0-haertung`, alle vier Posten):**
    **P3 Drop-Klasse laut ✅** — korpusweite `<p>`-Klassen-Inventur (218 Erlasse/24 602 Artikel,
    `p3-drop-inventar.ts`): Verdikt je Klasse in `bibliothek/register/p3-drop-klassen-inventar-2026-07-05.md`;
    EXTRAHIERT: standalone `man-template-tab-krpr` (OR art_361/362 = 28+61 Vorschriften-Zeilen inkl.
    aufgehobener «…»-Platzhalter, VRV 8
    Verweis-Noten; neue Block-Alternative 7) + bare `class="referenz"`→`grundlage` (347 Trägernorm-Verweise
    in ATSV/FZV/BankV/FINIV/FinfraV/ArGV5; Regex `\breferenz\b` deckt beide Formen); BEWUSST IGNORIERT
    (belegt): inkrafttreten/abstand1seite/tab-utit-Titel/tab-kpf/italic-Note; DEFERIERT (dokumentiert):
    absatz-pt-Varianten (ParlG-Eid, UVPV 13 III/IV) + GBV-34i-Textformel. **Stille Drops sind LAUT:** neues
    Tor **`check:p-klassen`** (Manifest entschiedener Klassen; jede neue Fedlex-Drop-Klasse bricht das Tor).
    **N3-B1 `he`-Entities ✅** — war schon 3.7. gelandet (Commit `50fd4e15`, main): Bund-Regen 0-Byte-Diff,
    Sonderfälle `&nbsp;`/`&mu;` dokumentiert BEHALTEN; hier verifiziert, kein Rest offen.
    **linkedom-POC ✅ GEMESSEN, Verdikt: KEINE Migration** — 9 562 `<dl>`- + 35 178 `<dd>`-Grenzen über den
    ganzen Korpus: **0 Abweichungen** Regex-Tiefenzähler vs. DOM (linkedom devDep nur für den POC;
    `poc-linkedom-tiefenzaehler.ts`, Beleg `bibliothek/register/poc-linkedom-tiefenzaehler-2026-07-05.md`) —
    Regex ist DOM-äquivalent, Umbau wäre verhaltensneutral = nur Risiko/Laufzeit ohne Gewinn (§7-Messpflicht
    erfüllt; E0/E1 bauen bewusst auf dem BEWIESENEN Parser). **SVG-style-Leak ✅** — `<style>/<script>`-
    Element-INHALT wird vor dem Tag-Strip entfernt (`NICHT_TEXT_ELEMENTE`); SSV-Signalkatalog-Kacheln von
    «.cls-1 { fill: #010101; }»-CSS bereinigt (5 Stellen, Signal-Nr/Name/Artikel vollständig erhalten;
    einziger `<style>`-Träger im Korpus). Daten-Regen 9 Erlasse (OR +4 713 Z., VRV +409 Z., 6 VO +348
    grundlage, SSV −CSS), golden klassifiziert-additiv, Engine-Golden byte-gleich, QS-GP-Quittung.

## W2·5 — Auffindbarkeits-Schicht: Zweiachsiger Einstieg + Artikel-Volltextsuche *(ABGESCHLOSSEN 25.7.2026; ✅-Prosa verschoben 22.7., Abschluss ergänzt 25.7.2026)*

### Restposten «Kanton-Volltext im Index» ✅ 25.7.2026 (PR #365, Trailer `Roadmap: W2·5`)

**Ausgangslage (gemessen):** `scripts/such-index-generieren.ts` las ausschliesslich
`public/normtext/bund` und schrieb `artikel-bund.json` mit hartcodiertem `ebene: 'bund'`.
**Gebaut:** die Ebene ist jetzt **Parameter** (`EBENEN = ['bund','kanton']`, `baueEbenenIndex(ebene)`
→ `baueIndex()`); Artefakt heisst `public/such-index/artikel.json`. **54 444 Artikel: Bund 25 389 +
Kanton 29 055 aus allen 26 Kantonen** (1 231 kantonale Erlasse). Prod-Smoke-Pfad mitgezogen.

- **Herkunft ehrlich (§8):** jeder Eintrag trägt `eb` (Ebene) + `kt` (Kantonskürzel). Der Treffer
  nennt den Kanton doppelt — Label-Suffix «· AI» **und** Marke «AI» **ohne** `redundant`, weil
  `redundant: true` die Marke auf Mobile ausblendet (`SuchResultate.tsx`, `max-sm:hidden`): beim
  Bund-«Gesetzestext» richtig (wiederholt nur den Gruppentitel), beim Kanton hätte es die
  Herkunftsangabe auf dem Handy komplett gelöscht. href geht auf `/gesetze/<eb>/<key>`.
- **Ranking-Regression gefunden UND behoben (der eigentliche Fund dieser Einheit):** das
  Query-Testset wurde auf den **vollen** Index umgestellt (bund-only wäre ab jetzt Fiktion) — und
  lief prompt rot: **«Miete» fand OR 253 überhaupt nicht mehr.** Ursache gemessen: FlexSearch kappt
  **je Feld** bei `limit`; im gemeinsamen Index teilen sich die Ebenen dieses Kontingent, die 193
  kantonalen Gliederungs-Treffer drückten OR 253 im `g`-Feld von Rang 259 auf **339** und damit aus
  dem 300er-Fenster. OR 253 führt «Miete» nur in der Gliederung («Achter Titel: Die Miete»), war
  also unauffindbar. **Fix: ein FlexSearch-Index JE EBENE** — der Bund-Recall ist damit exakt der
  von vorher und hängt nicht mehr davon ab, wie viel kantonales Recht im Korpus liegt; jeder weitere
  Kanton kann die Bund-Trefferlage nicht mehr verschlechtern. Dazu ein Tiebreak **Bund vor Kanton**
  bei gleicher Themennähe/Kernerlass-Rang (`EBENEN_RANG`, `artikelRanking.ts`) — sonst entschiede die
  Key-Alphabetik («AG-291.150» < «AHVG»), also der Zufall. Nach dem Fix: «Miete» → OR 253 **Rang 1**.
- **Kein stiller Verlust (§8):** der Generator protokolliert jede nicht indexierte Datei mit Grund
  (`unlesbar` / `kein-eintraege-array` / `kein-volltext`) im Artefakt **und** in der CLI-Ausgabe;
  vorher schluckte ein blosses `catch { continue }` kaputtes JSON spurlos. Real übersprungen: **genau
  eine** Datei, `kanton/index.json` (URL→Datei-Karte, kein Erlass). Neues Tor `suchIndex.test.ts`
  vergleicht gegen `public/normtext/register.json` in **beide** Richtungen.
- **§6.7-Sabotage-Probe gefahren:** Erlass still fallen lassen → rot («spurlos aus dem Index gefallen:
  kanton/AG-291.150»); `kt` blanken → rot (1 229 Erlasse ohne Kanton + Manifest-Abweichung).
- **Geräte-Last gemessen (§15):** Index **25.97 MB → 47.96 MB** roh, **5.44 MB → 9.94 MB** gzip
  (+83 %). **Lazy-Loading hält:** der Index lädt erst beim ersten Tastendruck in der Suche —
  Vollaufbau von `/gesetze` löst empirisch **0** Index-Anfragen aus. First Paint unberührt.
- **Praxisbeweis im Browser:** «Handänderungssteuer» (rein kantonale Steuer, vorher artikelseitig
  nicht auffindbar) liefert jetzt AI- und AR-Steuergesetzartikel; Klick landet auf
  `/gesetze/kanton/AI-640.000#art-116`, keine Konsolenfehler.
- **Beweis:** `npm run gate` voll grün · `check:suchindex` grün · Golden byte-gleich 249/249 ·
  `check:gegenpruefung` grün (kein Risiko-Pfad berührt — weder Rechnen noch Extraktion noch Norm-Tarif).
- **CI-Befund + Behebung (Nachtrag David 25.7.2026):** `Browser-Smoke Shard 1/3` war rot,
  `Perf-Budget` dadurch übersprungen. Drei Such-Specs liefen nach 2 Retries in `Timeout: 10000ms`
  mit `Received: 0` — Assertions korrekt, Treffer zu spät. Gemessene Ursache: clientseitiger
  FlexSearch-Aufbau **3 153 → 6 143 ms (+95 %)**. Behoben durch **gestaffelten Aufbau** (David
  gab Weg 1 frei): `baueSucher` ist inkrementell, die Doc-IDs sind globale Positionen im
  Eintrags-Array — der Kanton rückt nach, ohne dass der Bund-Index neu gebaut wird (der wäre
  sonst zweimal zu zahlen). Kanton in 2000er-Häppchen mit Yield, damit der Hauptthread frei bleibt.
  **Der volle Index wird weiterhin vollständig geladen; gestaffelt ist nur der Zeitpunkt.**
  Zwei Auflagen, beide gegated (`src/tests/suche/gestaffelterIndex.test.ts`):
    · **Teilzustand sichtbar** — `hinweis` an der Gesetzestext-Gruppe nennt die fehlende Ebene im
      Klartext, die Kopfzeile trägt «— wird noch ergänzt». Die Gruppe bleibt dabei **auch bei null
      Treffern** stehen: bei einer rein kantonalen Query verschwände sonst der Hinweis mitsamt der
      Gruppe, und die Suche behauptete stumm «nichts gefunden» über einen ungelesenen Bestand.
    · **Automatische Neuauswertung** — der Nachlade-Callback setzt ein neues `ArtikelSuche`-Objekt;
      die neue Identität lässt die React-Memo neu rechnen. Niemand tippt dieselbe Query zweimal.
  **Zeitmessung im Browser (lokal, `vite preview`):** erste Trefferanzeige **5 328 → 3 668 ms**,
  Kopfzeile mit Aufschlüsselung **5 344 → 3 941 ms**. Volle E2E-Suite lokal **314/314 grün**.
- **Index-Grösse im Perf-Budget verankert:** `check:perf-budget` deckelt
  `public/such-index/artikel.json` auf **10 400 KB gzip** (heute 9 667 KB). Hergeleitet, nicht
  gegriffen: ~3.6 KB gzip je Kanton-Erlass ⇒ ~200 weitere Erlasse Luft — ein weiterer mittlerer
  Kanton passt durch, ein Massenimport schlägt an. Der eigentliche Kostentreiber ist nicht die
  Leitung, sondern der clientseitige Aufbau; das steht als Warnung am Budget. Sabotage-Probe rot
  gezeigt (Deckel 9 000 KB ⇒ exit 1).
- **Ebenen-Tiebreak als PROVISORISCH gekennzeichnet** (Logik unverändert — sie hat eine echte
  Regression behoben): der Kommentar am Fundort hält fest, dass «Bund vor Kanton» eine Anzeige-
  Ordnung und keine entschiedene Relevanz-Politik ist, und dass sie in Gebieten kantonaler
  Zuständigkeit (Einführungsgesetze, Notariat, Steuern, Gerichtsorganisation) die einschlägige
  Norm systematisch nach hinten schiebt. **Entscheid David 25.7.2026: «Bund vor Kanton bleibt
  vorerst so.»** Damit ist die Ordnung bestätigt, aber ausdrücklich als vorläufig — die
  Kennzeichnung im Code bleibt darum bestehen und ist nicht zu entfernen.

  (Rechtsgebiet × Aufgabe)** ✅ **28.6.2026 (gegated, deployt 2.7.2026):** `einstiegMatrix()`
  (`src/lib/einstieg.ts`) projiziert den Katalog (§5) auf Rechtsgebiet × Aufgabe; Komponente
  `ZweiachsigerEinstieg` als zweite Achse auf `/rechner` (aufklappbare Gebiets-Kacheln, Werkzeuge
  nach Aufgabe gruppiert, nur verfügbar §8). Konsistenz-Tor `einstieg.test.ts`. Visuell bestätigt.
  **Globale Artikel-Volltextsuche** ✅ **28.6.2026 (David: «FlexSearch ja»; gegated, deployt 2.7.2026):**
  FlexSearch über alle **24 183 Bund-Artikel** (`bloecke`-Text), in DIE bestehende Suche integriert
  (neue Gruppe «Gesetzestext», `universalSuche`/`useUniversalSuche`, §5 ein Such-Workstream). Index
  build-time generiert (`gen:suchindex` → `public/such-index/`, gitignored, im `build`), lazy + eigener
  Chunk (FlexSearch 17 kB gz, NICHT im Haupt-Bundle — Task 4.4); Lib+Index ~4 MB gz erst auf erste
  Suche. Zitat-/Term-Suche stark («243 ZPO» → Art. 243 ZPO; Notwehr→Art. 16 StGB), Deklinations-
  Phrasen unscharf (§8-ehrlich). Snippet + Sprung `#art-`. Visuell bestätigt.

## QS-PERF — Teilerfolge Tor/Härtung/Kalibrierung *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  - **a · Tor `check:perf-budget`** — **`[✓]` KOMPLETT (5.7.2026, PR feat/qs-perf-a-b).** Bundle-Teil
    (Chrome-frei, `scripts/check-perf-budget.ts`) war seit 30.6. da; jetzt ergänzt: **`check:perf-lighthouse`**
    (`scripts/perf/lighthouse-budget.ts`) misst CLS/LCP/TBT/TTI/Score auf `/gesetze/bund/OR` + Startseite im
    Lighthouse-**Mobil-Preset (4× CPU + langsames 4G)** und ist als **letzte CI-Stufe** nach Build + allen
    Treue-Toren (golden/smoke/struktur-konsistenz/e2e) verdrahtet → §15-**Gegenkopplung** über die
    Schritt-Reihenfolge (Treue rot ⇒ Job bricht vor der Messung; nicht im schnellen `gate`, der nicht baut).
    **Median aus 3 Läufen** (CI; lokal 1) gegen Ausreisser-Flake. Schwellen an der **CI-Baseline**
    kalibriert (dort läuft das Tor — der 2-Kern-Runner legt unter 4×-CPU echten Spät-Shift/Blocking offen,
    stärker als lokal): CLS OR ≤ **0,15** / Start ≤ 0,10 (Regressions-Fänger, kappt die alte 0,64/0,57 mit
    Marge; FAHRPLAN-Eintritt war 0,25 → Ziel 0,10); LCP/TBT/TTI/Score grosszügige Deckel. **Ist Mobil-Preset:**
    OR CLS lokal 0,005 / CI ~0,10, Score CI ~38–56; Startseite CLS **0,000**. CI-Impact ~2 Min. Verschärfung =
    dokumentierter Folgeschritt nach breiterer CI-Baseline.

  - **e · CLS-Race-Härtung Reader-e2e** — **`[✓]` KOMPLETT (10.7.2026, `fix/cls-race-haertung`).**
    Drei byte-identische, nur unter CI-Parallel-Last reproduzierbare e2e-Rotfälle mit LayoutShift-
    Attribution auf die Wurzel gefixt (§15.2/§15.3), 12-s/CLS-Schwellen UNVERÄNDERT: (1) `verweis-u`
    0,49-CLS = `istXlVp`-Post-Mount-Flip 1→2-Spalten (`inhalt.tsx`, jetzt lazy-`useState` = Client-
    Initialstate gepinnt); (2) `leser-kopf-a9` 0,0001-Mikro-Shift = TOC-Akkordeon-Höhen-ANIMATION +
    spät committende `springeZuSektion`-Zweigöffnung (`parts.tsx` Akkordeon sofort statt animiert;
    `flushSync` + jumpLock 500 ms in `inhalt.tsx`); (3) `norm-sprung` Sprung >12 s = teure 4-MB-
    Artikelsuche blockierte den Sprung-Aufbau (`useUniversalSuche` `useDeferredValue` entkoppelt).
    Golden byte-gleich (nur React-Reader/Such-Hook); 10× lokal grün unter 6× Drossel. Detail:
    STRUKTUR-Karte 10.7.

  - [~] **TBT-Deckel je Job normieren statt absolut prüfen** *(gebaut, gemessen, VERWORFEN 20.7.2026)*.
    Umgesetzt und empirisch geprüft: eine synthetische, deterministische CPU-Last
    (`dist/_perf-kalibrier.html`) wird über dieselbe Lighthouse-Kette gemessen und als Divisor
    genutzt. **Ergebnis: funktioniert nicht zuverlässig.** Zwei Reihen zu je 8 unabhängigen Runnern
    (identischer App-Code) widersprechen sich: Reihe 1 senkt die OR-TBT-Streuung von CV 31.2 % auf
    16.5 % und räumt die Runner-Korrelation ab (r +0.83 → −0.21); Reihe 2 kehrt das Vorzeichen um
    (roh r −0.43) und das Normieren VERSCHLECHTERT auf CV 29.9 %. Gepoolt (n=16) bleibt eine
    Scheinverbesserung 26.8 % → 23.3 %. Auch eine abgeschwächte Korrektur `roh·(BASIS/kalib)^α`
    rettet es nicht: das gepoolt beste α=0.70 wirkt in den beiden Reihen in ENTGEGENGESETZTE
    Richtungen. Die Regressions-Steigung log(TBT)~log(kalib) ist 0.65 statt 1 — die unterstellte
    Proportionalität besteht nicht (eine Integer-Schleife misst die Kernfrequenz, die OR-TBT hängt
    daneben an Speicherbandbreite/Cache/Nachbarlast). **Assertiert wird darum weiter der Rohwert.**
    Die Kalibrierung bleibt als Diagnose-Ausgabe stehen (~15 s je Job) — Rohmaterial für einen
    späteren, besseren Normierer und im Log sofort sichtbar, ob ein Job langsam lief.
    **Damit ist «TBT auf OR wieder scharf» NICHT erreicht** und bleibt offen (§8, kein
    stillschweigend abgehaktes Ziel).

  - [x] **Chrome-Isolation je Lighthouse-Lauf + Neukalibrierung** *(erledigt 20.7.2026)*.
    `einLauf()` startet je Messung eine frische Chrome-Instanz und killt sie danach (~1–2 s/Lauf,
    ~15 s je CI-Job). Die kumulative Instanz-Drift ist weg (belegt: Startseite sprang zuvor von
    143–237 auf 1543 ms TBT ohne App-Code-Änderung), jeder Lauf ist definierte Kalt-Last.
    Schwellen im SELBEN Schritt neu erhoben über **16 Messpunkte auf 16 unabhängigen Runnern**;
    die Historie des alten Regimes wurde verworfen, nicht übernommen. **Verschärft** (echte
    Schärfe, runner-unabhängige Metriken): Start-TBT 1500 → **400** (Deckel lag 571 % über dem Ist),
    Start-LCP 11000 → **10000** (sd nur 37 ms über alle 16 Runner!), OR-TTI 15000 → **13000**,
    Start-Score 40 → **55**. **Unverändert** OR-TBT 6500 (siehe Schritt oben) und CLS 0.05.

  - **b · Billig & verlustfrei zuerst** — Wortlaut der Quick-Win-Liste *(wörtlich verschoben 31.7.2026)*

    `React.memo(ArtikelLeser)` + `SektionBaumTOC` (`parts.tsx`),
    token-Mindesthöhen (`min-h-screen` Suspense-Fallback `App.tsx` + Reader-Ladezustand `inhalt.tsx`,
    `min-h-modul-news` `NewsHeader`), Reader-Chunk-Vorladen, `vendor-react`-manualChunks (`vite.config.ts`).

  - [x] **Bimodaler ~48-s-Stall in der ersten gedrosselten Such-Interaktion — AUFGEKLÄRT + BEHOBEN** *(26.7.2026, PR #382; Wortlaut wörtlich verschoben 31.7.2026)*

    `norm-sprung`
    A9 war als 2-vCPU-Flake gemeldet; gemessen war es ein **Messfehler des Tests**: der Warmlauf
    wartete auf den «Sprung»-Treffer, der aus Register/Parser deterministisch berechnet wird und
    schon steht, **während der Artikel-Suchindex noch aufgebaut wird**. Nach dem Erscheinen von
    «Sprung» waren gemessen noch **11 586 – 14 484 ms** Ladearbeit offen; diese Restlast fiel in die
    GEDROSSELTE Messphase und erschien dort ×4 als ~48-s-Stall — streng bimodal, weil es ein Rennen
    zwischen Einmal-Load und Query-Reset ist (zwei Zustände, kein Kontinuum). Auf dem Runner riss das
    alle drei Versuche (PR #382 Shard 7/8). **Fix:** der Warmlauf wartet jetzt auf den Ladezustand,
    den er zu erreichen behauptet — Ergebnis-Kopfzeile sichtbar UND Vorbehalt «wird noch ergänzt»
    weg (letzteres deckt die gestaffelte 2. Aufbaustufe, die `unvollstaendig` statt `laedt` setzt und
    von `allesGeladen` NICHT erfasst wird).

## W2·6-B — Bündel B: B1 aza-Resolver + B2/A18 Regeste dreisprachig + B3 *(done; Prosa wörtlich verschoben 22.7.2026)*

    - [x] **+ Auftrags-Eingang 30.6.: Bündel B** — **B1+B2+A18 ✅ GEBAUT 5.7.2026** (Branch
      `feat/w26b-regeste-a18`). **Korrektur 20.7.2026:** die frühere Klammer «B3 offen = reine UI» war stale —
      **B3 ist erledigt und empirisch verifiziert** (10.7.2026, s. Zeile «Bündel B» oben: der Sticky-Kopf-Defekt
      wurde durch den U-KOPF/Split-View-Refactor `60988318` geschlossen, Playwright-Beweis an BGE 152 I 65).
      Damit sind alle drei Posten des Bündels erledigt ⇒ Status `wip` → **`done`**. **B1** BGE ohne «vollständiges Urteil»:
      aza-Resolver gehärtet (2. OCL-Kopfformat «BGE … (aza)» + Bandjahr statt fehlerhaftem
      `decision_date` als Plausibilitäts-Referenz) — **5/12 voll aufgelöst** (150 I 183/151 V 30/
      151 I 41/150 II 334/151 IV 316), **2 Kollisions-quarantäniert** (152 V 2/20 = OCL-Konflation,
      korrekt Auszug-only §8), **5 weiter Auszug** (151 I 73/151 II 710 kein aza im Kopf;
      151 III 336/151 II 475/151 V 100 Inversions-/Fetch-Grenze — ehrlicher Auszug §8).
      **B2+A18** (EIN Regeste-Pass, Quell-Wahl §7): die amtliche BGE-Regeste ist als flacher
      OCL-String weder dreisprachig noch strukturiert → aus **bger.ch clir** (`atf://<band>:de|fr|it`)
      nachextrahiert: Regestenkopf (massgebliche Artikel **fett**) + Absätze, je Sprachfassung,
      **strukturbasiert getrennt** (`<div id="regeste" lang>`) und **sortiert DE→FR→IT** — **272/272
      BGE, 0 Lücken**, additiv (`regeste.sprachfassungen`; `regeste.text` byte-stabil, Engine-Golden
      unberührt). `RegesteBlock.tsx`: DE prominent, FR/IT dezent einklappbar. Tor
      `check:entscheide` erzwingt Sortierung+Kopf+clir-Quelle; Gegenprüfung **bestanden** (Opus-
      Zweitpass 6 BGE × 3 Sprachen byte-genau vs. bger.ch). Detail `FAHRPLAN-GESETZES-UX.md`
      §10/U-REGESTE. · **B3** Sticky-Kopf überdeckt Body in `EntscheidLeser.tsx`
      (*reine UI, eigener Commit — NICHT in dieser Einheit*). Details im Eingangsblock oben.

## W2·6-NKEY — normKeys-Abdeckung generalisieren: Register-Ableitung + FR/IT-Aliase + Sichtbarkeits-Tor *(done 28.7.2026; Plan-Prosa wörtlich verschoben, Abschluss-Prosa ergänzt)*

### Die Plan-Prosa des Schritts (wörtlich, Stand vor dem Bau)

  **Befund (empirisch, 21.7.2026, Anlassfall `bge_148_II_475` ohne KG-Verzahnung):** Von 9 905
  Norm-Zitat-Nennungen über 5 093 Entscheide mappt die Hand-Whitelist `ABK_REGISTER`
  (`scripts/normtext/entscheide-mapping.ts`, 26 Einträge) nur **43 %** auf `normKeys`; der Rest wird
  **still verworfen** (§6.7-Verstoss dem Geist nach). Davon: **97 Erlasse sind längst im Korpus**,
  fehlen nur in der Tabelle (+13 %: IPRG, KVG, RPG, MWSTG, SVG, VwVG, USG, KG, …); **~40 % sind
  FR/IT-Abkürzungen** (CST→BV, CP→StGB, CPP→StPO, LTF→BGG, CO→OR, CPC→ZPO, CC→ZGB, LP/LEF→SchKG,
  LIFD→DBG, LAMal→KVG, LCart→KG, …), die die Tabelle gar nicht kennt. Drei Bausteine, Reihenfolge
  **a → c → b**:
  - **a · Mapping aus dem Register generieren (§5):** Die deutsche Abkürzung IST der Register-Key
    (`src/lib/normtext/register.ts`, 227 Bund-Erlasse) — Tabelle build-time ableiten statt parallel
    pflegen; jeder künftige Erlass wird automatisch verzahnbar (Ende der «BGFA-Fix»-Fehlerklasse,
    PR #290). Deklarierte Kollisions-/Ausschlussliste bleibt (Muster StG≠StGB; kantonale Namensvetter
    StG/KV/BauG dürfen NIE auf Bundesrecht mappen — §1).
  - **c · Sichtbarkeits-Tor gegen stilles Verwerfen (§6.7):** Wächter listet ungemappte Abkürzungen
    nach Häufigkeit gegen eine deklarierte Ignore-Liste (kantonal/ausserhalb Korpus/Rauschen wie
    «BGE» = bewusst); Neues darüber = rot. Sabotage-Probe Pflicht. Nebenprodukt: datenbasierte
    Korpus-Kandidaten (KVG 108+ Nennungen).
  - **b · Amtliche DE/FR/IT-Aliase aus Fedlex-Metadaten:** SPARQL liefert die amtliche Abkürzung je
    SR-Nummer und Sprache (Pipeline spricht Fedlex-SPARQL bereits, `scripts/fedlex-cache.sh`);
    generiertes Alias-Artefakt (`*.generated.ts`, Quelle+Stand §7, `merge=regen` §12), kein Hand-
    Erraten von Paaren. Ziel-Abdeckung **85–90 %**.
  **Backfill:** Entscheid-Snapshots + `norm-index`/Leitfall-Shards regenerieren (5 093 Entscheide,
  deterministisch, 2 Läufe byte-gleich). **Bündelung geprüft (§14.2/§14.3):** NICHT in `W2·6-FILTER`
  (andere Risiko-Klasse: hier Extraktion/Mapping = Risikopfad, dort Abfrage/Projektion) — löst aber
  dessen 🔴-Blocker «normKeys 18 %» und ist Fundament für `W2·6-ZNETZ`/`W2·7-VZUI`-Normfilter.
  Kollisionsfläche mit ZNETZ/FILTER (`public/rechtsprechung`) ⇒ Worktree + serielle Landung (§12).
  **DoD:** `check:entscheide` grün · Wächter-Tor einmal rot gezeigt · Abdeckungs-Quote vorher/nachher
  im PR ausgewiesen (§8) · `check:gegenpruefung` **bestanden** (Opus, unabhängig gegen Fedlex-
  Abkürzungen) · golden byte-gleich. Trailer `Roadmap: W2·6-NKEY` + `Gegenpruefung: <Verdikt>`.

### Wie es gebaut wurde (28.7.2026, Worktree `w26-nkey`, ULTRACODE)

**a · Register-Ableitung statt Hand-Whitelist (§5).** Die Tabelle wird aus `ERLASS_REGISTER`
abgeleitet, mit zwei Kandidaten je Eintrag (Anzeige-Abkürzung `kuerzel` und dateisicherer `key`,
beide über `normalisiereAbk` normalisiert): **654 auflösbare Abkürzungs-Formen auf 237 Erlasse**
(238 Bund-Einträge). Zeigt eine normalisierte Abkürzung auf ZWEI Register-keys, wird sie
**beidseitig verworfen** und als Kollision ausgewiesen — nie geraten (§1). `ABK_AUSSCHLUSS` hält
`StG` (SR 641.10) draussen: föderal UND kantonal, pro Zitat nicht sicher trennbar — lieber eine
Lücke als eine falsche Bundesrechts-Zuordnung (§8).

**b · Fedlex-Alias-Ebene.** `src/lib/normtext/abk-aliase.generated.ts` trägt **597 amtliche
DE/FR/IT-Kurzbezeichnungen** aus `jolux:titleShort` (Currency-Fenster über
`dateEntryInForce`/`dateNoLongerInForce`), über die SR-Nummer an den Register-key gebunden —
«art. 42 LTF» = Art. 42 BGG, «art. 41 CO» = Art. 41 OR. Vorher verschwand jedes Zitat eines
französisch- oder italienischsprachigen Entscheids lautlos. Die Aliase sind **keine zweite
Wahrheit** (§5): der Erlass-Bestand bleibt das Register, das Artefakt trägt nur dessen
fremdsprachige Namen. Der SR-Index nimmt **nur Bund-Einträge** — bei kantonalen Einträgen trägt
`sr` die kantonale Systematiknummer, die einer Bundes-SR zufällig gleichen kann. Der Ausschluss
wirkt auch auf Aliase: «LT» (fr) und «LTB» (it) hätten `STG` sonst durch die Hintertür in den
Korpus getragen — das wäre eine fachliche Entscheidung, und die trifft kein Build-Schritt nebenbei
(§7/§8). Methodik + Regenerier-Befehl: `bibliothek/recherche/fedlex-abkuerzungen-titleshort.md`.

**c · Sichtbarkeits-Tor `check:normkeys`.** Schwelle 20 Snapshots, **11 deklarierte
Ignore-Einträge** je mit Grund (aufgehoben / ausserhalb-korpus / kantonal / rauschen). Das Tor
beziffert die Restlücke, statt sie zu verschweigen: es weist die **62 von 597 Aliase** aus, die im
Fliesstext-Pfad strukturell unerreichbar sind — je mit Ursache (Leerzeichen 32 · Trennzeichen
kappt den Code 17 · Akzent/Umlaut im Wortinnern 9 · nur 1 Grossbuchstabe bei Länge > 3 3 ·
Sperrliste 1) und mit Korpus-Beleg (34 Formen in 207 Snapshots, 264 Artikel-Zitate ausserhalb des
Quoten-Nenners). Es nennt **Korpus-Kandidaten ohne Register-Eintrag** (BZP SR 273 · WG SR 514.54)
und meldet Ignore-Einträge, die unter die Schwelle gefallen sind, als Streich-Kandidaten.

**d · Fliesstext-Artikel (Zusatzauftrag David 27.7.).** Artikel-Zitate im Erwägungstext werden
erkannt und zugeordnet, nicht mehr nur die `statutes`-Kopfzeile — dort liegt die Masse:
**88 913 der 98 755 Nennungen** stammen aus dem Fliesstext.

**Ergebnis am Landungsstand.** Nennungs-Abdeckung **93.6 %** (statutes 89.3 % · Fliesstext 94.1 %);
Snapshots mit `normKeys` **21.9 % → 99.9 %** über 5093 Entscheide; Norm-Index-Buckets von 25 auf
**156 Erlasse / 4452 Artikel**.

**§15-Laufzeit-Projektion.** Der Backfill hob `norm-index.json` auf 724 KB gzip — gegen eine
260-KB-Schranke. Statt den Deckel zu heben, wurde die **Erlass-Ebene als eigene Projektion**
ausgeschrieben (`norm-index-erlasse.json`, **92.7 KB gzip**, Budget 120 KB); nur sie liegt auf dem
Nutzerpfad (`rechtsprechungFuerErlass()`), der Monolith ist reines Build-/Prüf-Artefakt.
Logikverlust-Bewertung: **keiner** — identische Daten, identische Rückgabe, nur weniger Bytes.
Die andere Hälfte derselben Messung ist ehrlich mitgezählt: derselbe Backfill hob `register.json`
auf 756.9 KB gzip = **97 % des 780-KB-Deckels**. Bewusst NICHT durch Anheben gelöst (§8) — die
Verschlankung bleibt als Folgearbeit im Plan stehen.

**Vier adversariale Gegenprüfungs-Runden (Opus, frischer Kontext).**
- **R1 widerlegt:** unvollständige Ordinal-Serie; fr «par.» als Absatzmarker nicht erkannt.
- **R2 widerlegt:** Literatur-Phantome + Folge-/Wortbereichs-Zitate ⇒ Artikel-Index-Korroboration.
- **R3 widerlegt:** die eingebaute Häufigkeits-Schwelle löschte **echte Rechtsanwendung**
  (OR/30 Furchterregung, StPO/428, EMRK/6). Eine Regel, die echte Rechtsanwendung löscht, um eine
  schmale Phantom-Klasse zu treffen, verletzt §1 — **Häufigkeit ist kein Signal für
  Tragfähigkeit**. Die Schwelle wurde **zurückgebaut** und durch eine gezielte, deklarierte
  **Literatur-Kontext-Regel** (`ohneLiteraturApparat`) ersetzt: nicht WIE OFT eine Norm genannt
  wird entscheidet, sondern WO. Nennungen innerhalb einer Zitier-Apparat-Spanne (Kommentar-Titel,
  Randnummer-Fundstelle, fr/it «ad art.») sind Angaben ÜBER Literatur, nicht Rechtsanwendung des
  Gerichts; sie werden vor der Extraktion aus dem Text genommen — auf BEIDEN Ebenen gleich
  (13 041 Spannen in 1120 Snapshots). Damit bleibt der Dekret-Stand «erst vollständig erkennen»
  unangetastet: jede erkannte Nennung im Erwägungstext zählt wieder, ohne Schwelle.
- **R4 bestanden:** 12 amtliche Einzel-Belege gegen bger.ch, korpusweite Verlust-Bilanz **13/13
  deklariert** (11 STG-Ausschluss, 2 Literatur mechanisch belegt).

**Nachtrag am Landungsstand:** der Begründungs-Kommentar in `scripts/check-perf-budget.ts` trug
noch die Zahlen VOR dem R3-Rückbau (157 Erlass-/4473 Artikel-Buckets, 731 KB gzip) — auf die
nachgemessenen 156/4452/724 richtiggestellt, mit Vermerk warum.

## W2·6-DATA — Etappen-Erzählung E0/E0+/E1/E2/E3 *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

      Änderung golden byte-gleich (§6) + `QS-GP`. OCL-Pakete W12 (Bulk-Parquet) + F2 gehen hier auf. **E0 ✅ 2.7.2026** (PR #80/81, `ad065c03`: 218 Bund-Normtext byte-gleich DB↔JSON, `check:paritaet` in der Gate-Kette, doppelt verifiziert). **E0+ ✅ 3.7.2026** (Branch `feat/qs-data-e0-plus`, expliziter Sub-Schritt, KEIN neuer ROADMAP-Schritt — §14): Ziel-Schema §3 angelegt (erlasse/erlass_fassungen/artikel/entscheide inkl. `ecli_key`/`bge_key`+Indizes/soft_law + leere norm_referenzen/zitat_kanten/norm_rangliste) · Partitionierung je Doktyp (`daten/normtext.db`·`rechtsprechung.db`·`soft-law.db`; Monolith `lexmetrik.db` entfällt ersatzlos) · `normalisiere-zitat.ts` + DB-freie Unit-Tests · Reverse-Ingest ausgedehnt (Kanton-Normtext 1231 · Rechtsprechung 342 · 4 Manifeste inkl. Trailing-Newline · Materialien 1) — **`check:paritaet` byte-gleich über 1796 Dateien**, golden-neutral, doppelt verifiziert. **Nächstes: E1** (Generator-Flip). **Klarstellung Leitprinzip 4:** der Reverse-Ingest bereits committeter Kantons-JSONs öffnet **KEINEN** 26×-Slot (Leitprinzip 4 meint neuen Massenimport, nicht Reverse-Befüllung committeter Daten). **Weichen entschieden 3.7.:** Kontext-Auslieferung = Hybrid (Shards+Edge, `FAHRPLAN-DATENHALTUNG.md` §10(6)/§11.5) · Massen-Rebuild = Voll-Rebuild (§10(7)). **E1 ✅ 3.7.2026** (Branch `feat/qs-data-e1-flip`): Generator-Flip Bund-Normtext auf das Spalten-Zielschema (`erlasse`/`erlass_fassungen`/`artikel`), `public/*.json` = Projektion (Wächter alt≠neu → hart ab); neues Tor **`check:datenhaltung`** (Dump-Manifest-Determinismus + Drift gegen committetes `daten-manifest.json` + Invarianten Orphans/§7-Spalten/ATTACH); Risiko-Globs um `scripts/datenhaltung/**`+`daten/**`+`normtext-snapshot.ts` erweitert; Stabilitäts-Report. Byte-Beweis 3 Doppelläufe alt==neu==committet (218 Erlasse/24858 Artikel), `check:paritaet` unverändert 1796, golden byte-gleich, `QS-GP` bestanden. **VORBEHALT:** alter Direktpfad bleibt Wächter (Entfernen = eigener §6-Schritt); Kanton/Rechtsprechung/Materialien noch Blob-Weg. **E2 ✅ 3.7.2026** (Edge-Suche live: `api/suche.ts` + Turso-Hot-Replika; Sync-Timeout-Wurzel behoben 20.7., PR #313). **E3 ✅** (`rechtsprechung.db`, 488 MB).

## Fedlex-Datenarten-Portfolio — Pakete 1/2/5/4 Erledigt-Erzählung *(✅-Prosa wörtlich verschoben 22.7.2026)*

      **Paket 1 (Gesetze-Currency, `QS-CURRENCY`) ✅.** **Paket 2 (Botschaften/«Entstehungsgeschichte», W2·6) ✅ 10.7.2026** —
      401 Botschaften des Bundesrates über die 218 Volltext-Erlasse (Projekt-Graph, `nur-live-link`), im Norm-Kontext-Bus
      (Bridge B1); Join-Felder `projEli/ocUris/botschaftDate` für Paket 5 persistiert. **Paket 5 (Änderungshistorie/AS, W2·6-REV) ✅ 10.7.2026** —
      3108 AS/RO-Änderungs-Erlasse über die 218 Volltext-Erlasse (SPARQL Pfad (b) SR-Taxonomie), RO-Fundstelle aus oc-URI (100 %),
      Botschafts-Join über `ocUris` (477), `nichtKonsolidiert`-Marker (93) + Sammelerlass-Cross-Check gegen Pfad (a) ab 2000 (1942);
      Sidecar `public/normtext/revisionen/` (Übergangslösung bis E1→`erlass_fassungen`), im Norm-Kontext-Bus «Änderungen / Revisionen»
      neben der Entstehungsgeschichte (Bridge B1); Tore `check:revisionen`(-netz), Gegenprüfung bestanden. **Alle 5 Pakete (1/2/5/3/4) ✅ AUSGEFÜHRT** — Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md`.

      (Bridge B1); Join-Felder `projEli/ocUris/botschaftDate` für Paket 5 persistiert. Paket 5/3 (Änderungshistorie/AS,
      Vernehmlassungen) via eigene PRs. **Paket 4 (Staatsverträge, `W2·6`) ✅ 10.7.2026** — 9 kuratierte SR-0.*-Verträge
      (HKsÜ 96/HUVÜ/EAUe/CMR/Montreal/RBÜ/UNO-BRK/Istanbul/Apostille) als Volltext über die bestehende `eli/cc`-Pipeline
      (kein `eli/treaty`-Extraktor); International-Volltext 18→27; POC: keine strukturierte Parteien-Kante → «Geltungsbereich»-Anhang
      verbatim, html-0 bei 5/9 stale → kanonische html-N gepinnt; Gegenprüfung bestanden. Detailquelle
      `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`. **Damit sind alle 5 Portfolio-Pakete gebaut.**

## W1·4 — Prozesskosten-Cockpit: I4 Bemessungskriterien + I9-Rest *(geparkter Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  **I4 ✅** (1.7.2026): `kriterien`/`kriterienNorm` auf `KantonalerTarif` — Bemessungskriterien je
  Tarif (25 GK + 26 PE, Kanton × GK/PE frisch am amtlichen Erlass extrahiert, §7-belegt in
  `bibliothek/register/bemessungskriterien-tarife-kantone.md`), Anzeige im Ermessensrahmen-Block bei
  Spanne (§8); GR gk ohne Kriteriennorm → generischer Fallback. Adversariale Gegenprüfung (QS-GP,
  2 Opus-Agenten): 1 Fund korrigiert (OW pe Art. 4a→Art. 32), 4 Titel-Korrekturen bestätigt. Golden
  byte-gleich (Engine liest kriterien nicht). **I9-Rest ✅**: Notariats-/Grundbuch-Querverweis im
  Cockpit.

## Auftrags-Eingang 30.6.2026 — erledigte Bündel/Einzelposten (R · N · B3 · I1/I2) *(✅-Prosa wörtlich verschoben 22.7.2026)*

> **Bündel R · Gesetz-Reader-Lesesteuerung → Schritt 5b** *(reine UI, eigener Worktree, golden-neutral):*
> - **R1 Scroll-Spy:** mitscrollender **Kopf UND Gliederung** markieren den **zuoberst im Viewport
>   angeschnittenen** Artikel, nicht einen mittigen (`gesetz-leser/`, eine „aktiver-Artikel"-Bestimmung).
> - **R2 Gliederung links auch auf kleineren Laptops:** Schwelle `istXl` (~1280px) in
>   `gesetz-leser/inhalt.tsx` ~Z.754 senken → linke TOC grundsätzlich, nur bei echt-zu-klein in den
>   Drawer. Wechselwirkung `PANE_BREIT_PX` + `max-w-reading` prüfen. (Quer zu Schritt 14 Responsive-Audit.)
> - **R3 Schriftgrösse +/− statt «Kompakt/Breit»:** Breiten-Umschalter (`Topbar.tsx` Z.54–62 +
>   `useInhaltsbreite.ts`, localStorage) durch **+/−-Schriftgrössen-Steller** ersetzen (persistent,
>   §13-Tokens/rem-Faktor, keine `text-[..px]`). Global (Topbar) → trifft alle Seiten.
>
> **Bündel N · Normtext-Fidelity/Verweise → Schritt 5b (Extraktor-Härtung, L0) bzw. Schritt 6:**
> - **N1 Zerrissene Artikelnummer** «Artikel 7 b»→«7b» (auch «43 a», «28–28 b», «14 a», «1 bis»):
>   Muster `Art. <zahl> <buchstabe>` in **111/218 Bund-Erlassen** (steht im Block-/items-`text`).
>   Fix am **Generator/Extraktor** (§7 kein Hand-Edit), Quelle-vs-Extraktion bestätigen
>   (`scripts/fedlex-cache.sh`). **§1/§2:** keine blinde Zahl-Leer-Buchstabe-Regex (echte «1 a)»-Listen).
>   *Daten/Pipeline → golden + `QS-GP`.* Bsp. David: Art. 7e ATSV; Art. 16/14a BetmKV.
>   **Ursache (Probe 30.6.):** Quelle hat `7<i>b</i>` (kein Leerzeichen, b kursiv) — unser Extraktor
>   fügt das Leerzeichen beim Strippen der Inline-Tags `<i>`/`<sup>` selbst ein. Fix = **kein Whitespace
>   zwischen Ziffer und Inline-getaggtem Buchstaben/`bis`/`ter`** (gilt für HTML *und* XML, kein Quell-Wechsel).
> - **N2 Falsche Verweis-Auflösung** *(§1-NAH, heikler):* interner Artikel-Link zeigt auf den
>   **aktuellen** Erlass, obwohl ein anderer genannt ist (Bsp.: «Artikel 14a … BetmG» in BetmKV Art. 16
>   → Klick landet bei Art. 14a der BetmKV statt im BetmG). Resolver ignoriert die nachgestellte
>   Erlass-Abkürzung. Nähe `norm-link`/`fntext-links`/`NormChip`. *Erst Häufigkeit messen, dann fixen;
>   golden/Tests + `QS-GP`.*
>   **Befund (Probe 30.6.):** das ELI-Verweisziel steht **schon im HTML** (`<a href="…/eli/…">`, 19 in
>   BetmKV, identisch im XML, z.B. StGB) — der Resolver liest es nur nicht. Fix = **Ziel lesen statt raten**
>   (erlass-genau; `#art` selbst auflösen). **Geschwister von M12** → Verweis-Chips als Feature.

>   ✅ **10.7.2026 — bereits behoben, empirisch verifiziert** (kein neuer Code nötig): Der U-KOPF/Split-
>   View-Refactor (Commit `60988318`) hat alle drei Kandidaten geschlossen — Block zu **EINEM** sticky-
>   Element konsolidiert, `top`-Offset von `top-16`→`calc(4rem + 2.25rem)` (sitzt jetzt UNTER dem
>   InhaltsKopf-Breadcrumb statt ihn zu überdecken), opaker `bg-paper`, `z-[15]` (< Topbar `z-20`,
>   > Breadcrumb `z-10`), `scroll-margin-top:var(--rsp-stick)` = 12.75rem. Playwright-Beweis 152 I 65
>   (Desktop 1280 + Mobil 390, Light+Dark, 3 Scroll-Stände, alle 3 Sprung-Chips, beide Tab-Fassungen):
>   **0 Overpaint**, Sprung-Ziele landen sichtbar unter dem 185/193px-Kopf; die alte `top-16`-Fassung
>   reproduziert den Überdeckungs-Defekt (Breadcrumb verschwindet). Golden byte-gleich (Doku-only).

> - **I1 Seitenleisten-/Rubriken-Reihenfolge** → **✅ gebündelt in W2·5c (3.7.2026):** `navigation.ts`-
>   SSoT-Array auf **Gesetze → Rechtsprechung → Materialien → Rechner → Vorlagen** — Bau im
>   Plumbing-Schritt von `archiv/FAHRPLAN-STARTSEITE-V3.md` §10 (treibt Sidebar UND Startseiten-Kacheln).
> - **I2 Branding-Neuausrichtung** → **✅ gebündelt in W2·5c (3.7.2026):** das geforderte
>   **Messaging-Konzept ist erledigt** (Ultracode-Recherche + DMAD-Council, gegen «nicht nach KI
>   klingen» geprüft; Wortlaut + SSoT-Architektur `seo.ts`→Projektionen + Tor `check:seo-index` in
>   `archiv/FAHRPLAN-STARTSEITE-V3.md` §6, Herleitung `bibliothek/recherche/startseite-v3-design.md`);
>   Ausrollen = Bausequenz-Schritt 1 des W2·5c. *(Ursprünglicher Auftragstext:)* weg von
>   «Berechnen statt KI» → **KI-freies Übersichtstool über amtliche Quellen, inkl. Rechner + Vorlagen**;
>   «KI-frei» als Vertrauensmerkmal (positiv), nicht als Headline. Surfaces ohne SSoT (§5-Geruch,
>   mitkonsolidieren): `index.html` (title/meta/og/twitter), `seo.ts` (`SITE_TITEL`/`SITE_DESCRIPTION`/
>   Route-Beschreibungen/`/methodik`), `Startseite.tsx` Hero, `KatalogHinweis.tsx`. **Deliverable:
>   Messaging-Konzept zuerst** (brainstorming/council, gegen «nicht nach KI klingen» geprüft), DANN
>   ausrollen + auf EINE SSoT ziehen (`seo.ts` Quelle, `index.html` daraus). Doks-Wording
>   (ROADMAP/PROJEKTBESCHRIEB «deterministisch statt KI-geschätzt») **✅ nachgezogen (5.7.2026,
>   W2·5c-Rest):** `Methodik.tsx`-Abschnittstitel umgestellt, Erinnerungs-Marker aufgelöst.

## Steuerungs-Prosa — abgelöste Dekret-/Essay-Passagen des Abarbeitungs-Kopfs *(wörtlich verschoben 24.7.2026, @queue-Einbau)*

Kontext: Mit dem `@queue`-Einbau (24.7.2026) trägt die Queue-Zeile die Bau-Reihenfolge; die
folgenden Passagen verloren ihre Steuer-Funktion bzw. sind vollständig in ihren
FAHRPLAN-Detailquellen enthalten (Verifikation 24.7.2026) und wurden hierher rotiert.

**Aus dem QS-TOK-Dekret (10.7.2026), abgelöster Schlusssatz:**

> Die Reader-Kette **W2·5d U-POSITION → U-PDF** ist danach der nächste
> Feature-Schritt.

**Quell-Architektur-Entscheid (Council 30.6.2026), ROADMAP-Wortlaut** (Vollinhalt weiterhin in
`FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur-Entscheid`):

> **Quell-Architektur-Entscheid (Council 30.6.2026) → Detail `FAHRPLAN-NORMTEXT-DARSTELLUNG.md
> §Quell-Architektur-Entscheid`, Memory `lexmetrik-akn-xml-architektur-entscheid`.** N1/N2 sind **Phase 0**
> (jetzt, variantenunabhängig) zusammen mit einem **asymmetrischen Verifikations-Tor** (Containment: jedes
> Quell-Wort verbucht → fängt stille Drops + Struktur-Invarianten) + **Status-Marker** (in Kraft/aufgehoben/
> noch-nicht-in-Kraft). Der **HTML→AKN-XML-Wechsel ist Phase 1** — inkrementell über den Drift-Zyklus, **nie
> Big-Bang** (B «XML direkt rendern» verworfen); empirisch freigegeben (eId 99,7 % stabil über Konsolidierungen,
> DE/FR/IT ~95–99 % ausgerichtet) → schaltet `#art`-genaue Chips, ELI-Zitations-Graph, M15 (DE/FR/IT) und
> M16 (Point-in-Time) frei. **M16 ist seit dem Ideen-Intake 20.7.2026 als eigene Bau-Einheit
> `W2·5g-ZEIT` getrackt** (Norm-Zeitmaschine + Fassungs-Diff, `blocked` auf `zeit-historik-poc`) —
> diese Stelle hier bleibt die *Architektur*-Begründung, die *Bau*-Planung steht dort und wird hier
> nicht doppelt geführt (§14.3).

**Intake «Informations-Nutzung der Gesetze» (David 17.7.2026), ROADMAP-Wortlaut** (Vollinhalt
weiterhin in `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`):

> **Intake «Informations-Nutzung der Gesetze» (David 17.7.2026) → hierher:** Recherche-Verdikt
> = Normtext-KÖRPER nahezu erschöpfend genutzt; die handlungsreifen Lücken sind **G-REF** (externe
> amtliche ELI-Verweise, verworfen via `entferneTags` — konkretisiert N2/Phase-1-ELI-Graph) und
> **G-HIST** (artikel-genaue Historie liegt nur als Fussnoten-Prosa — Daten-Unterbau von M16, und
> damit ausdrücklich Vorbedingung des Blockers `zeit-historik-poc` in `W2·5g-ZEIT`). Beide
> = **Extraktions-Risikopfad** (`QS-GP`, golden byte-gleich; **Bau-GO je Kandidat ausstehend, David**),
> verortet in `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Intake`. Der **Suchindex** (G-SUCH, Fussnoten/Tabellen
> nicht indexiert, kein Risikopfad) liegt getrennt in `FAHRPLAN-UI-NAVIGATION.md §7b`, **G-PRERENDER**
> (SEO/§15) in `FAHRPLAN-SEO-A11Y-GOVERNANCE.md §11`. **Detailquelle (§11):**
> `bibliothek/normen/informations-nutzung-gesetze-2026-07-17.md`.

**«Einzeln»-Posten + Startseiten-Merker (30.6.-Eingang), ROADMAP-Wortlaut:**

> **Einzeln:**
> - **I1 Seitenleisten-Reihenfolge** + **I2 Branding-Neuausrichtung** → **✅ beide gebündelt in
>   W2·5c (3.7.2026) und dort gebaut** (SSoT `navigation.ts` bzw. Messaging-SSoT `seo.ts` +
>   Tor `check:seo-index`; Doks-Wording ✅ 5.7.). Wortlaut → `ROADMAP-CHRONIK.md` → Eingang-30.6.
>
> **Merker Startseiten-Überarbeitung: ✅ entparkt 3.7.2026 → Schritt W2·5c** (Ultracode-Recherche
> + bindendes Council-Verdikt liegen vor; Redesign-zurückgestellt 16.6. + FUNDAMENT-Startseitenrahmen
> dort abgeglichen).

## W2·5b — Abschluss-Prosa + QA-Sweep-Spec des abgeschlossenen Schritts *(done; Wortlaut wörtlich verschoben 26.7.2026)*

Aus `ROADMAP.md` Schritt 5b; im Plan verbleiben Checkbox + `@meta` + Einzeiler + der offene M12-Unterpunkt:

  **ABGESCHLOSSEN 25.7.2026** — alle Einheiten M1–M12 des QA-Sweeps ✅ (zuletzt in dieser
  Kampagne: **M12** Randtitel-Naht-Fix + Tor `check:verklebung`, PR #340 · **M11 + M6-D**
  Verweis-Popover mit Artikel-Bezeichnung + Chapeau-Item-Auflösung, PR #342 · **HAENGEND-
  Folge-Härtung**, PR #343 · Batch C M4/M5/M7/M8 per Nachmessung als durch W2·5d faktisch
  erledigt belegt). Je Risikopfad-Einheit adversariale Gegenprüfung (2–3 Runden, zwei davon
  widerlegten zunächst → Nachfixe). Status-Log je Einheit: `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`.
  **Status-Korrektur 20.7.2026: `wip(reader-wt)` → `ready`.** Der Marker zeigte auf einen Worktree, den es
  **nicht mehr gibt** (`git worktree list` kennt nur LexMetrik/lm-ci/lm-fundament/lm-planintake; kein Branch
  `*w25b*`/`*reader*`). Der Restblock ist gelandet: **PR #156, Merge-Commit `9b0f9e48` (5.7.2026)**.
  **Vor einem Bau-Start zwingend nachmessen (§8, nicht abhaken ohne Beleg):** `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`
  führt Batch C (M4 Suche/Gliederung responsiv · M5 kompakt zum Header · M7 Scroll-Offset nach Suche ·
  M8 Treffer-Highlight) und Batch D (M11 Verweis-Popup + Artikel-Bezeichnung · M6-Renderteil) noch unabgehakt —
  **M5 und M8 sind aber vermutlich durch W2·5d-Arbeit faktisch erledigt** (PR #284 «A35 Suche in Kopfzeile +
  A40 Highlight», PR #301 «Suchfeld in die Kopfzeile»), ohne dass die Fahrplan-Checkboxen nachgezogen wurden.
  Erst am heutigen Reader verifizieren, dann bauen — sonst wird zweimal dasselbe gebaut.
  konsolidierter QA-Sweep der **Bund-Gesetzesdarstellung** (29.6.2026): 11 Defekt-/Ausbau-Punkte
  (Präambel-Fussnoten · Fussnoten einheitlich erst auf Klick · Randtitel-/Gruppierungslinien je
  Gesetz + Umschalter · Suche↔Gliederung responsiv + kompakt zum Header · Verweis ZGB→BVG via
  ELI/`data-rs` · Treffer-Highlight · Sprung-Offset nach Suche · aufgehobene Artikel bündig ·
  **Tabellen-Regelwerk T-A…T-F seitenweit** · Verweis-Popup + Artikel-Bezeichnung) unter der
  **Leitlinie L0** «Extraktor strukturerhaltend härten statt pro Gesetz patchen» (Fedlex-HTML
  empirisch einheitlich, verifiziert 29.6.). **Plan = `FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`**
  (4 Batches: A Extraktor/Pipeline konfliktfrei zuerst → B Render zuletzt, **Split-View-Konflikt auf
  `ArtikelBody.tsx`** abstimmen → C Suche/Layout → D Popover). **Auflagen:** zuerst nur Bund;
  **Renderer abwärtskompatibel** (Kanton-Altdaten nicht brechen); golden byte-gleich + §6.3;
  neuer `check:tabellen`-Validator. Tabellen-Detail quer in `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`,
  Layout/a11y in `DESIGN-REGLEMENT-NORMTEXT.md`, Popover in `archiv/FAHRPLAN-GESETZESTEXT-POPUP.md`.
  - **Gebaut (✅; Wortlaut → `ROADMAP-CHRONIK.md` → W2·5b, 22.7.2026):** Bündel R (Scroll-Spy/
    Gliederung/A−A+, PR #59, prod 30.6.) · Bündel N (N1 zerrissene Artikelnummern am Extraktor +
    N2 Self-Link-Unterdrückung + Tor `check:invarianten`, deployt 2.7.) · Phase-1-Fundament-Batch
    P1/P2/P4/P5 (Spec 2.7.) · N3 `he`-Entities (0-Byte-Diff) · **W2·5b-Restblock komplett 5.7.**
    (P3 Drop-Klassen-Inventur + Tor `check:p-klassen` · linkedom-POC gemessen → KEINE Migration ·
    SVG-style-Leak; QS-GP-Quittungen). Spec-Heimat unverändert (s. oben).

## W2·5d — Nachzug-Welle A19–A25: erledigte Einheiten (A19 · A21 · A22 · A23 · L-1+L-2 · C-1–C-3) *(offener Schritt; ✅-Prosa wörtlich verschoben 26.7.2026)*

Aus `ROADMAP.md` Schritt 5d, Liste «Nachzug-Welle A19–A25»; im Plan verbleiben je Einheit Einzeiler + Pointer (A20, das offene L-3 und FN-5/M14 blieben vollständig im Plan):

  - [x] **A19** (FN-1+FN-2 +Drop-Fix `disp_*`): **✅ GEBAUT 10.7.2026 (Bau-Go David «go
    zu allem», `feat/v2-fn1-fn2`).** VZG-Alt-Form-Fussnoten erhalten nr (873 nr='' → echt,
    22 Erlasse), Präambel-`fnNrs` erfasst. **Abweichung (§7): Drop-Fix breiter als geplant** —
    recovert die verworfenen Schlusstitel-Fussnoten (`disp_uN/art_*`) korpusweit (227 recovert,
    u.a. OR/ZGB); «OR/ZGB byte-gleich» galt NICHT, stattdessen strukturell nicht-regressions-
    bewiesen (nur additiv, 0 Verlust). Gegenprüfung gegen Fedlex bestanden; Detail V2 §2 F1. V2 §2 F1.

  - [x] **A21** (FN-4): Absatz-Zuordnung Alt-Form. V2 §2 F1. **✅ ERLEDIGT OHNE BAU 25.7.2026
    (PR #354, Blanko-Go 24.7.):** Defekt nicht mehr reproduzierbar — der P1-a/b-Pin-Refresh
    (11.7.) ersetzte die Aspose-Alt-Form; Korpus-Audit 230 Caches: 0 fn-Definitionen ohne
    Backlink, 0 Fussnoten mit absatz=null in nummeriertem Absatz; Regeneration byte-identisch
    (git diff leer). Statt Nichts-Fix: e2e-Wächter `fussnote-absatz-altform` (Sabotage-Probe
    §6.7) + FN-4-Vermerk in V2 §2 F1. FN-5/M14 (wortgenau, XL) als Task-Chip verortet.

  - [x] **A22** (K-1+K-2): Kopf nützlicher + Fussnoten-Anwahl. V2 §2 F2. **K-2 ✅ GEBAUT
    11.7.2026 (`feat/v2-kopf-pr`, PR #194) — Fussnoten-Chip. K-1 ✅ GEBAUT 12.7.2026
    (`feat/v2-k1`, PR #213, `9e7e505b`): «in Kraft seit» im Erlass-Kopf, build-time SPARQL
    `jolux:dateEntryInForce` → `public/normtext/inkrafttreten.json` + `inkraftSeit` in
    browse-typen.** *(Plan-Korrektur 25.7.2026: der «weiterhin offen»-Vermerk war stale —
    Git-Abgleich fand den gemergten PR; live im OR-Kopf sichtbar.)* Detail §10.8.

  - [x] **A23** (B-1+B-2): BGE Ab-/Anwahl + Zeitfilter in Rubrik-Ansicht, Kappung
    `LEITFAELLE_SICHTBAR` 5→10 (überstimmt §3.1-«3 Toggles»; nach U-VERWEIS).
    V2 §2 F3. **✅ GEBAUT 11.7.2026 (`feat/v2-kopf-pr`, PR #194).** Detail §10.8.

    - [x] **L-1+L-2 ✅ GEBAUT 11.7.2026 (feat/v2-l1-l2):** Einzug-Cap 3→5 + Mobil-
      Token `einzug-mobil` (0.75rem statt Kollaps auf 0; `data-linien=aus` kollabiert
      weiter alle Ebenen) + Guide-Ton 10 %/14 % → 18 %/24 % (= `--line-strong`).
      Golden byte-gleich (reine Reader-CSS/TS, kein Snapshot); `check:linien-kanon`
      GRÜN unverändert (Aufbau-Regelwerk/Referenz-Verdikte unberührt). Playwright-
      Beleg Light+Dark, Desktop+Mobil@390: Guide 0.18/0.24 gemessen; ZGB indentet
      neu Ebene 1–5 (6–7 gekappt); Mobil-Einzug 12px; CLS 0 (padding/border). V2 §2 F4.

    - [x] **C-1 ✅ (10.7.2026, feat/v2-c1-kantenchip):** KantenChip `kategorie`-Prop
      (Norm=brass byte-identisch / Entscheid=slate-Tick+Hover), ↻ Revision→warn-700
      (★ bleibt brass), slate-Doppelbelegung aufgelöst → DESIGN-REGLEMENT-NORMTEXT
      §4b-B (Farb-Wörterbuch). Golden byte-gleich, Kontrast als Gate gemessen, CLS 0.
    - [x] **C-2 ✅ (11.7.2026, feat/v2-c2, #201):** Overline-Farbpunkte Leitfälle/
      Verweise (`lc-punkt`/`lc-punkt-entscheid`) + Currency-Chip-Tonung
      (`lc-chip-geltend` sage «geltend geprüft (maschinell)» / `lc-chip-vorbehalt`
      warn «nächste Fassung ab»). Kontrast gemessen, golden byte-gleich, CLS 0.
    - [x] **C-3 ✅ (11.7.2026, feat/v2-c3) — Farb-Wörterbuch KOMPLETT:**
      Materialien-Familie sage (`lc-punkt-material` + `punkt`-Prop an KontextGruppe:
      Materialien/Norm/Entscheid-Gruppen tragen ihren Familien-Punkt) + NormChip-
      Verweisfarbe (`hover:border-brass-400`, brass-Hover-Familie vereinheitlicht).
      Kontrast gemessen (sage 4.48/3.84 ≥3:1), golden byte-gleich, CLS 0. V2 §2 F5,
      DESIGN-REGLEMENT §4b-B Abschluss.

## W2·10-UI-NAV — Teillieferung Suche-Race (12.7.) + N0 Quick-Win-Paket (Stand 11.7.) *(offener Schritt; ✅-Prosa wörtlich verschoben 26.7.2026)*

  **Teillieferung 12.7.2026 (`fix/suche-aktivindex-race`):** Such-Dropdown-Race
  gegen die deferred Artikelgruppe (#183/§15.3) an der Wurzel geschlossen — die
  Pfeil-Auswahl folgt jetzt einem STABILEN Treffer-Key (`src/components/suche/trefferAuswahl.ts`,
  geteilt von HeaderSuche + Hero) statt einem Positions-Index; nachwachsende
  Treffer verschieben das Enter-Ziel nicht mehr (empirisch war Enter auf
  SCHKG#art-257 statt OR#art-257_d gelandet). Deterministischer Repro-Test +
  10×-Drossel-Beweis grün; die #210-A9-Reset-Härtung bleibt als Redundanz.
  **Stand 11.7.:** Einheit **N0 (Quick-Win-Paket, N0a–N0d) ✅ gebaut+belegt** (Opus, Playwright
  Desktop+Mobil): tote Rückwege · Erlass-Key-case-insensitiv+hilfreiche Fehlseite · Anker-`--nt-stick` ·
  Kleinposten (Ergebnis-FAB-IO · Rechner-Filter · Streitwert-Leerzustand · Entwurf-Legende-Popover ·
  Entscheid-`?ansicht=` · «In neuem Reiter»-Toast+☰-Tooltip). Rest der Kette (Suche S1–S6 …) offen.

## W2·6-BS — Kanton BS: Rechtsprechungs-Vollimport seit 2022 *(done-Unterschritt von W2·6; Wortlaut wörtlich verschoben 26.7.2026)*

    - [x] **Kanton BS: Rechtsprechungs-Vollimport seit 2022 (amtliches Portal)** *(BS-Tranche
      des P3+-Slices, FAHRPLAN-RECHTSPRECHUNG §10; Direktauftrag David 19.7.2026 — zieht die
      erste Kanton-Tranche VOR die E5-Slot-Kette; committete `public/`-Projektion, DB-Angleichung
      = Folge-Einheit F4 in E5)*: ~3'765 Dokumente (2022–2026, inkl. 42 datumlose) aller 4
      BS-Instanzen von `rechtsprechung.gerichte.bs.ch` (Findinfo/Omnis, GET-only-CGI); Pipeline
      `scripts/rechtsprechung/bs-*` (`npm run entscheide:bs`, resumierbar, golden raw), Count-Gates
      Portal==Inventar==Snapshots + entscheidsuche-Untergrenze, Latin-1/Windows-1252-Fidelity,
      neues Offline-Tor **`check:bs-entscheide`** in der Gate-Kette, `BUDGET_MB` 200→1024 (David
      19.7.2026). Detail: `FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §7a + Dossier
      `bibliothek/register/BS-RECHTSPRECHUNG-QUELLE-2026-07.md`. Trailer `Roadmap: W2·6-BS`.

## W2·6-B — Restzeilen des ROADMAP-Blocks *(Nachtrag zum W2·6-B-Eintrag oben; wörtlich verschoben 26.7.2026)*

      `feat/w26b-regeste-a18`); B3 war schon 10.7. durch den U-KOPF-Refactor `60988318` geschlossen
      (Playwright-Beweis BGE 152 I 65) ⇒ alle drei Posten erledigt, Status `done`. B2/A18: Regeste
      dreisprachig aus bger.ch clir, 272/272 BGE, Tor `check:entscheide`, Gegenprüfung bestanden.
      Wortlaut → `ROADMAP-CHRONIK.md` → W2·6-B (22.7.2026).

## W2·12-HYGIENE — Plan-Prosa des abgeschlossenen Schritts (H-1…H-14, Beweisregeln G1–G3) *(done; Wortlaut wörtlich verschoben 26.7.2026)*

Aus `ROADMAP.md` Schritt 12 (Kopfzeile, `@meta`, ABGESCHLOSSEN-Einzeiler und die Gesperrt-/Eskaliert-Hinweise stehen weiterhin dort; die erste Zeile unten wiederholt den im Plan verbliebenen Halbsatz «41 Befunde …», damit der Wortlaut hier vollständig lesbar ist):

  41 Befunde + 3 Kritik-Linsen mit Repo-Stichproben)* — 14 Bau-Einheiten **H-1…H-14** in
  Risikoklassen-Reihenfolge: P0 Doku-/Git-Hygiene (Bibliothek-Wahrheits-Sweep inkl.
  SH-Doppel-Wahrheit §5/S8, check-Scope, 16 gemergte Branches) → P1 verhaltensneutraler Code
  (Tot-Sweeps src/scripts, Kanton-Typ-Konsolidierung, SG-60.13-Staffel-Generator, Import-Zyklen
  + `check:zyklen`-Tor) → P2 gegated (Format-SSOT `lib/format.ts` + Gegenprüfung,
  §6.6-Splits billig, `zahl()`-Eingabe-Entdopplung [Commit B = deklarierte UI-Änderung],
  Vorlagen-Schema-Konventionstest) → P3 nach PR-Kette #164/#165 (grosse §6.6-Splits,
  engine-map). **GESPERRT ohne David:** Alt-Engine-Ablösung Gründungsgebühren (BE>20-Mio-
  Divergenz, Entscheid-Queue). **Eskaliert (scope-fremd):** NE-Umzugsprüfung (per 12.7.
  FÄLLIG) + 10 Fedlex-Wiedervorlagen 1.8. → Currency-Slot, s. «Pflege & Termine».
  Beweisregeln G1–G3 (richtiger Beweis-Anker je Fläche, keine Beweisklassen-Mischung pro PR,
  Gegenprüfungs-Pflicht Risikopfade) im Plan. Detail: **`archiv/FAHRPLAN-CODE-HYGIENE.md`**.
  Trailer `Roadmap: W2·12-HYGIENE`.

## W3·11 — Teil-Erledigt: Vernehmlassungen (Fedlex-Portfolio Paket 3) *(offener Schritt; ✅-Prosa wörtlich verschoben 26.7.2026)*

  **Teil-ERLEDIGT 10.7.2026 (Fedlex-Portfolio Paket 3):** Vernehmlassungen über den Fedlex-Graphen
  (822 Verfahren, direkte `foreseenImpactToLegalResource`-Kante; Status/Frist/DE·FR·IT; Norm-Kontext-Bus
  «Gesetzgebung in Arbeit», laufend zuerst). Currency-Tor `check:vernehmlassungen-netz` + Offline-Assertion.
  Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 3` + `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.

## W3·14-Responsive-Defekte — D1–D10 abgearbeitet *(done; Wortlaut wörtlich verschoben 26.7.2026)*

  - [x] **Responsive-Audit-Defekte D1–D10 abgearbeitet** *(reines UI, Go David 10.7.2026, Branch `fix/responsive-audit-defekte`)* — **gefixt:** D1 Vorschau-FAB (Karten-Optik → gefülltes Pill), D2 Shell-Kopf/Fuss-Tap-Ziele auf 44px, D3 Methodik-Pflegeliste mehrspaltig (Höhe −43 %), D5 «A− A+»-Steller + Header-Suche, D9 Gesetze-Placeholder, D10 Chip-Band-Scroll-Affordance. **Bereits geheilt (empirisch belegt):** D7 (Container-Breiten jetzt konsistent 1120px, via A15-Refactor #908bf143) · D8 (Ingress jetzt max-w-reading). **Caveat/nicht Code-Defekt:** D4 (Headless-PDF-Artefakt, Fallbacks vorhanden) · D6 (Sticky-Sidebar-Screenshot-Artefakt) — beide zudem im TABU-Pfad `gesetz-leser/**`. Status je Defekt in `abnahme/responsive-audit/BERICHT.md`.

## Strang-Detailpunkte / SG-2935-Rohtext-Reparatur *(erledigt 5.7.2026; Wortlaut wörtlich verschoben 26.7.2026)*

  **ERLEDIGT 5.7. (SG-2935-Rohtext-Reparatur, Branch `fix/sg2935-x-spalten`):** der
  Gegenprüfungs-Vorbefund (SG-2935 21.03–21.06/3.04–3.07/24.01 fehlten komplett) ist behoben —
  Wurzel war KEIN Zweispalten-Merge, sondern das Kopf-/Fussband im falschen Koordinatenraum
  (MediaBox-Ursprung y0≈123 vs. `viewport.height*0.9`-Schwelle → oberste Positionszeilen jeder
  Anhang-Seite als Schein-Kopfband verworfen) + verworfene ~0-breite Wort-Trenner-Fragmente
  (Verklebungen) + umgebrochene Querverweis-Zeilen als Schein-Positions-Köpfe (Gegenprüfungs-D1–D3
  → Geometrie-Orakel `istZifferKopfZeile`: Kopf nur in der Nr.-Spalte). Fix in `adapter-pdf.ts`
  (`bandSchwellen` MediaBox-relativ, origin-0 byte-identisch) + `anhang-segmenter.ts` (Orakel);
  SG-2935 83→112 Positionen (25.10 zeigt wieder amtliche 100.–), SG-2808/3849 wortlaut-treuer
  (verlustfrei; 3849: 4 Phantom-Positionen aus Nachtrags-Historie entfernt). Korpus-Probe über
  alle 27 PDF-Kanton-Snapshots: 10 weitere Nicht-SG-Dateien tragen Wortlaut-Verbesserungen durch
  denselben Fix (LU/FR/VS/SZ×4/VD×3, davon SZ-280.411 auch MediaBox-versetzt=Band-Klasse) —
  Nachzug via `normen-monitor`-Drift (`check:pdf-netz` wird rot) bzw. gezielte Regeneration,
  Detail `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` §SG-2935-Reparatur.

## W2·5d / FN-5 — Bau-Auftrags-Wortlaut des erledigten Postens *(erledigt 26.7.2026; Wortlaut wörtlich verschoben 26.7.2026)*

- [ ] **FN-5/M14** wortgenaue Fussnoten-Marker (XL). V2 §2 F1. **BAU-AUFTRAG STEHT
  (David 25.7.2026, wörtlich: «vermerke 3 im bauplan, dass nächste session es am
  richtigen ort macht»)** — das frühere separate David-Go ist erteilt, die
  Sequenz-Vorbedingungen (QS-PERF, U-POSITION) sind erfüllt. **Nächste Bau-Session
  nimmt FN-5 als EIGENE Einheit** (nicht nebenbei): Extraktor-Offset/Platzhalter im
  Haupt-Snapshot = Risikopfad `scripts/normtext` mit grossem deklariertem §6.3-
  Snapshot-Diff ⇒ volle adversariale Gegenprüfung (Skill »gegenpruefung«), Differ-
  Beweis (nur Marker-Positions-Felder, kein Textverlust), Wortlaut-Stichproben je
  Defektklasse gegen den Fedlex-Cache, Reader-Render (FnRef am Wort-Offset) + CLS.
  Bis dahin bleibt der Marker am Absatz-/Item-Ende (ausgewiesene Rest-Ungenauigkeit).

*(Umsetzungs-Anm. 26.7.2026: gebaut wurde die SIDECAR-Variante der M14-Spec —
Haupt-Snapshots byte-unverändert statt des hier angenommenen grossen
Snapshot-Diffs; §7-Abweichung im ROADMAP-Einzeiler und im PR offengelegt.)*

## QS-CURRENCY — Gesetze-Currency & Coverage: Paket 1 *(done; Wortlaut wörtlich verschoben 26.7.2026)*

**Stand 5.7.2026:
P1-a + P1-b gebaut (dieser PR) — Paket 1 damit komplett (P1-c/d schon in main, PR #142).**
**P1-b (Monitoring dicht):** Regex-Fix `fedlex-pins.ts` `[a-z_]+`→`[a-z0-9_]+` (11 parser-blinde
Ziffern-Pins jetzt überwacht, 207→218) + Parser-Selbsttest + Coverage-Assertion (kein gehosteter
Bund-Volltext ohne Pin, rot bei Verstoss) + PDF-Embed-Pins (EMRK/NYÜ) ins `check:fedlex-versionen`.
**P1-a (Datenlauf):** 18 überholte Snapshots + 2 PDF-Embeds auf die geltende Fassung gehoben
(html-N SPARQL-kanonisch via isExemplifiedBy; klv/vrv=8, ssv=14; Artikel-Diff +85, 9 eId-Renames
1:1, 0 Verlust); `check:fedlex-versionen` **Exit 0 (0 stale)**. Nebenbei zwei Mechanik-Bugs gefixt
(Golden-`--erlass`-Merge behielt Phantom-Keys; check:pdf-netz notation-Join-Partial-Result).
Gegenprüfung bestanden. Trailer `Roadmap: QS-CURRENCY`. **Status: `[✓]` (Paket 1 abgeschlossen).**
**Etikett-Korrektur 20.7.2026:** Der Schritt stand trotz dieses `[✓]` noch auf `wip` ⇒ jetzt **`done`**.
Geprüft, dass der Schritt-Umfang wirklich nur **Paket 1** ist: `FAHRPLAN-FEDLEX-PORTFOLIO.md` ordnet die
Pakete 2/5/3/4 fremden IDs zu (`W2·6`, `W2·6-REV`, `W3·11`, `W3·13`), `W2·14-SIGNAL` hängt nur lose daran —
es bleibt also kein Rest unter diesem Etikett liegen. Die laufende **Korpus-Pflege** (`check:fedlex-versionen`,
Wiedervorlage-Läufe, z. B. `5b676c3b`) läuft als Automatik weiter und ist **kein** offener Bau-Schritt;
die Gesundheit dieser Automatik wird neu von **`QS-AUTOMATIK`** überwacht (dort ist `fedlex-frische.yml` rot).

## R-RICHTER — Richter-/Spruchkörper-Filter, Block A (Daten/Risiko) *(offener Schritt; Block-A-Prosa wörtlich verschoben 26.7.2026)*

**Block A (Daten/Risiko, erledigt):** Schnitt `scripts/rechtsprechung/bs-besetzung.ts`
(BS-Deckblatt + Signatur, Re-Parse der 3765 aus dem Roh-Golden **ohne Re-Crawl**), reiner
Parser/Kanon `src/lib/rechtsprechung/besetzung.ts` (deterministisch, §2), Projektion
`BrowseEntscheid.richter[{s,r}]` + neues `public/rechtsprechung/richter.json`
(Slug → Anzeigename + Trefferzahl), neues Tor **`check:besetzung`** in der Gate-Kette
(Leak/Konsistenz/Determinismus hart, Abdeckung mit Schwelle, Kollisions-Report).
Abdeckung BS 98.6 % · Bund 96.1 %, 511 Slugs (208 Richter:innen, 303 Gerichtsschreiber:innen),
**Anonymisierungs-Leak-Scan korpusweit 0**. `abschnitte`/`sha` byte-unverändert (§6).


## W2·5i-HIST-ANSICHT — Fassungshistorie an-/abwählbar: H0-Verdikt + H1-Bau + Gegenprüfungs-Erzählung *(erledigt 26.7.2026, PR #375 Squash `de8f294a`; Wortlaut wörtlich verschoben 26.7.2026)*

  *(§14-Intake 20.7.2026, David — Queue-Platz 4 · Darstellung + Datenklassifikation, kein Rechtsinhalt)*.
  **Der Befund, der den Schritt trägt (gemessen, nicht geschätzt):** im OR sind **778 von 933 Fussnoten
  Änderungsvermerke** und nur **77 echte Verweise**. Die Fussnoten-Spalte ist damit zu ~83 % Fassungs-
  historie, die als «Fussnote» getarnt den Lesefluss trägt — wer Fussnoten abschaltet, verliert die
  echten Verweise mit; wer sie anlässt, liest überwiegend Revisionsprosa.
  **Bau-Vorschlag:** dreiwertige Auswahl **«Änderungshistorie: aus / als Fussnoten / als Chronologie»**
  im bestehenden **«Ansicht ▾»-Menü** (`src/pages/gesetz-leser/LeserAnsichtMenu.tsx` hat Persistenz **und** Pre-Paint-Mechanik
  schon — dort einklinken, kein neues Menü), **Verweis-Fussnoten unabhängig davon** schaltbar. Löst
  nebenbei das bekannte Leerraum-Residuum.
  **ZWINGENDE VORSTUFE H0 — Trennbarkeit MESSEN, bevor irgendetwas gebaut wird (§8):** die 778/77-Zahl
  belegt, *dass* es zwei Klassen gibt, **nicht**, dass sie maschinell **sauber trennbar** sind. Vor dem Bau
  ist korpusweit (nicht nur am OR — Leitplanke «nie aus einem Beispiel aufs Ganze») zu erheben, mit welcher
  Präzision/Recall die Klassifikation Änderungsvermerk ↔ Verweis gelingt und **wie die Grauzone aussieht**
  (Fussnoten, die beides tun). Ergebnis ist ein Verdikt mit Zahlen; fällt es schlecht aus, wird der
  Umschalter **nicht** gebaut (eine Ansicht, die 5 % der Fussnoten falsch einordnet, verliert Normtext-
  Information und verstösst gegen §15-Funktions-Treue). **Erst H0, dann H1 (UI).**
  **Fassungs-Fundament (§14-Intake 20.7., David — gilt über diesen Schritt hinaus):** Dieser Schritt ist die
  erste aktive Fläche, an der es greift — darum hier verankert statt im geparkten `W2·5g-ZEIT`:
  **(i)** Fassungs-Schlüssel (`fassungsToken`/`stand`/`sha`) **durchgängig** mitführen, auch wo heute nur die
  geltende Fassung gezeigt wird · **(ii)** Anker **fassungsstabil** halten (`#art-` darf nicht kippen, wenn
  später eine zweite Fassung danebentritt) · **(iii)** §8 «nicht geltendes Recht» **unmissverständlich**
  auszeichnen. Das ist **kein eigener Bau-Schritt**, sondern eine Auflage an **jede** Normtext-Arbeit;
  Begründung und Detail: `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §7.
  **DoD:** H0-Verdikt mit Korpus-Zahlen **vor** H1 · `check:normtext`/`check:historie` · golden byte-gleich
  (§6/§15 — kein Fussnoten-Verlust in KEINER der drei Ansichten) · axe · `check:perf-budget`.
  Trailer `Roadmap: W2·5i-HIST-ANSICHT`.
  **H0 ✅ 25.7.2026 (Fable 5): VERDIKT BESTANDEN** — 37'849 Fussnoten korpusweit klassifiziert,
  Substanz→ausgeblendet empirisch 0.008–0.04 % (≪ 5 %-Schwelle; Stichprobe n=300 gelabelt +
  Vollscan aller 25'367 AENDERUNG); Kanton nur 11 % Historie (Nutzen = Bund-Fläche). H1 darf
  gebaut werden, Auflagen 1–5 in `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`
  (nur AENDERUNG ausblendbar · Klassifikation build-seitig ⇒ Risiko-Pfad/Gegenprüfung ·
  ZITAT-Behandlung = David-Entscheid). Messwerkzeug `scripts/analyse/hist-h0.ts`.
  **H1 ✅ GEBAUT 26.7.2026 (Branch `feat/w25i-hist-ansicht`, Tore grün — Merge steht aus).**
  Klassifikator in die Generator-Schicht gehoben (`scripts/normtext/fussnoten-klassifikation.ts`
  = SSoT, `hist-h0.ts` importiert sie); Auflage 2 eingebaut (13 Fussnoten verlassen AENDERUNG,
  **alle kantonal** → korpusweit 25'354; Bund unverändert 24'693). NUR Bund regeneriert:
  227 Sidecars, 31'786 neue `kl`-Felder (A 24'693 · V 5'759 · G 292 · Z 632 · U 410) —
  **Additivität bewiesen** (`check-sidecar-differ.ts`: 0 unerlaubte Abweichungen, `pos{b,it,o,l}`
  aus FN-5 byte-identisch). UI dreiwertig im bestehenden «Ansicht ▾»-Menü (`data-histansicht`
  am `<html>`, Pre-Paint, Default = heutige Darstellung ⇒ R6-No-op); **nur `[data-fn-klasse="A"]`
  ist dämpfbar** (Auflage 1), Fussnoten OHNE Klasse (ganzer Kanton) bleiben immer sichtbar.
  Tore: `npm run gate` grün (golden byte-gleich) · `check:normtext`/`check:historie`/
  `check:struktur-konsistenz` · `check:perf-budget` · 41 neue Unit-Tests + 8 e2e (inkl.
  axe-Scan des offenen Panels und §6.7-Sabotage-Proben, je einmal rot gezeigt).
  Nebenbefund gefixt: latenter WCAG-Kontrast-Verstoss `ink-400` am OptSwitch-AUS-Zustand
  (serious, seit A4 latent — erst der Scan des GEÖFFNETEN Panels deckte ihn auf).
  **Gegenprüfung ✅ 26.7.2026 (Auflage 3): VERDIKT BESTANDEN, 6 Befunde — alle umgesetzt.**
  Sachlich tragend waren zwei: **B1** — 62 Bund-Fussnoten tragen ein Geltungs-ENDdatum
  (27 davon ≥ 2026, laufende Befristungen: `ASYLG 95a` fn300 «gilt bis 31. Dez. 2027»,
  `KVG 37` fn116/117, `VTS 95` fn438) und waren als `A` ausblendbar → Regel «Befristung»
  → `G`; **B3** — `AVIV 51a` fn168 «Laut Ziff. II kann die Karenzfrist …» = operative
  Fristenlauf-Regel → `G`. **§2-Entscheid dabei:** auch ABGELAUFENE Befristungen werden
  `G`; eine Unterscheidung nach «heute» wäre `Date.now()` in der Klassifikation und
  machte das Sidecar unreproduzierbar (eigener Unit-Test sichert die Gleichbehandlung).
  Wirkung, gemessen: **62× A→G** (einzeln im Differ ausgewiesen), Bund A 24'693 → **24'631**,
  G 292 → **354**. B4 Fussnoten-Nr in der Chronologie-Zeile · B5 e2e deckt jetzt auch je
  einen `G`- und `U`-Fall (`ELG` Art. 10) · B6 `check-sidecar-differ` ehrlich als
  Einmalbeweis-Skript benannt und als `npm run normtext:sidecar-differ` verankert.
  **Offen vor Merge:** nur noch die **fachliche Abnahme David** inkl. **ZITAT-Entscheid**
  (Auflage 5: heute sichtbar = Empfehlung, nicht entschieden).

*(Nachtrag 26.7.2026: «Merge steht aus» ist überholt — PR #375 wurde nach 4 Gegenprüfungs-Runden
(R1/Delta/Delta-2 inkl. #376-Konfliktauflösung als reine Verschiebung) gemergt und deployt.)*

## Auftrags-Eingang 30.6.2026 / Bündel B — Detail-Wortlaut B1 · B2 · B3 *(erledigt via `W2·6-B` 5.7.2026 und `W2·6-BGE`/U-KOPF 10.7.2026; Wortlaut wörtlich verschoben 31.7.2026)*

> **Bündel B · Rechtsprechungs-Leser → Schritt 6 / W2·6-BGE:**
> - **B1 BGE ohne «vollständiges Urteil»** (Bsp. BGE 152 V 2): `azaUrteil:null` + kein
>   `auszugAbschnitte` ⇒ `switcherSichtbar=false`, Ansicht fest auf «Auszug». **12/272 BGE** betroffen
>   (151_I_73, 151_III_336, 152_V_20, 152_V_2, 150_I_183, 151_V_30, 151_I_41, 150_II_334, 151_II_475,
>   151_V_100, 151_IV_316, 151_II_710). *Daten/Pipeline (AZA-Resolver, vgl. W2·6-Id-Disambiguierung) → `QS-GP`.*
> - **B2 Regeste wie amtlich:** **Absätze + massgebliche Artikel FETT**. Heute `regeste.text` flacher
>   String ohne `\n`/Markup → Struktur **aus der Quelle nachextrahieren** (kein Raten, §1/§2). *Daten/
>   Pipeline → `QS-GP`; Geschwister von B1 (gemeinsamer Korpus-Re-Lauf denkbar).*
> - **B3 Sticky-Kopf überdeckt Body** im Entscheid-Leser (Screenshot BGE 152 I 65): Hintergrund nicht
>   deckend / z-index / scroll-margin in `EntscheidLeser.tsx`. *Reine UI (§13-F) — eigener Commit, NICHT mit B1/B2.*
>   ✅ **10.7.2026 — bereits behoben, empirisch verifiziert** (U-KOPF/Split-View-Refactor `60988318`,
>   Playwright-Beweis BGE 152 I 65). Wortlaut → `ROADMAP-CHRONIK.md` → Eingang-30.6. (22.7.2026).

## W2·7-BEZUG — Bezüge am Artikel: Facetten-Fundament alle Instanzen (inkl. B7) *(done 28./29.7.2026, PRs #401–#406; Wortlaut wörtlich verschoben 31.7.2026)*

- [x] **7-BEZUG · Bezüge am Artikel — Facetten-Fundament alle Instanzen** — **✅ 28.7.2026 GEBAUT,
  B1–B6 komplett** (PRs #401 `5e461f5f5` · #403 `4e160737b` · #404 `d42322ed1` · #405 `efba2dceb`):
  Facetten-Datenmodell + BS-Korpus + BGer-Nicht-Leitentscheide (24'173 Kanten, 311 Shards, **9
  Gegenprüfungs-Runden**, R1–R8 widerlegt+gefixt, R9 bestanden) · Auflistung direkt am Artikel ohne
  Zwischenzeile (David-Vorgaben Minimalismus) · Rechtsprechungs-Dropdown in der Werkzeugleiste ·
  interaktiver Zeitstrahl + Von-Bis-Datum statt Perioden-Buckets · Werkzeugleisten-Gesamtüberarbeitung.
  Übergabe-Restposten siehe Block «Folgeaufträge Verzahnungs-Session 28.7.» unter QS-OPT.
  - [x] **B7 · Voll-Auflistung + Eidg.-Facette** — **✅ 29.7.2026 GEBAUT** (PR #406 `5a10f8150`, 4
    GP-Runden: R1–R3 widerlegt+gefixt, R4 bestanden; 75'365 Kanten voll ausgeliefert, Mengen-
    Invarianz korpusweit 8'368/8'368 bewiesen; 5er-Portionierung mit ehrlichen Filter-Zählern;
    «Eidg.» = kein Bug, Klasse dünn — Schalter zeigen jetzt distinkte Entscheid-Zahlen)
    *(§14-Intake David 28.7.2026 abends, klein → inline:
    «or 41 dort sind nur ein teil der entscheide verlinkt … mach es so dass man durchscrollen kann
    und dann je eine linie für jede instanz und alle sichtbar. chronologisch vom neusten zum
    ältesten» + «Eidg. das scheint keine funktion zu haben?»)* — (a) Auslieferungs-Deckel 8 je
    Status aufheben: ALLE Kanten je Artikel in den Shards (Generator-Änderung ⇒ Risikopfad-Fläche,
    Determinismus + Grössen-Budgets mit Begründung nachziehen, §15 on-demand bleibt); (b) UI: je
    Instanz EINE scrollbare Linie, alle Entscheide sichtbar, chronologisch neu→alt; (c) Diagnose
    «Eidg.»-Facette (funktionslos? leer-Zustand ehrlich zeigen oder Bug fixen).
  *(§14-Intake 24.7.2026;
  **Fokus-Dekret-Priorität**, Wortlaut David: Verzahnung Gesetz↔Entscheide «sehr gutes Feature, das
  ich mit Priorität einbauen will»; **Dekret David 27.7.2026: Vorstufe ist `W2·6-NKEY`** — erst das
  Entscheid-Screening generalisieren, damit ALLE Norm-Zitate erkannt und zugeordnet sind (heute 43 %),
  dann erst die Bezüge-Schicht darauf bauen; darum `dep: [W2·6-NKEY]` + Queue-Platz davor)* — das Verzahnungs-Fundament wird von «BGE-Leitfälle an
  Bundesnormen» auf **alle Instanzen und Entscheidkategorien** erweitert: **(a)** kantonale
  Entscheide am Artikel (Start BS-Korpus 3765 aus W2·6-BS; kantonaler Norm-Resolver/P0 zuerst) ·
  **(b)** BGer-**Nicht-Leitentscheide** aus dem kuratierten Korpus — Leitentscheid vs. übriges
  Urteil bleibt als Status **unterschieden** (§8, nie stillschweigend gleichgestellt) · **(c)** jede
  Kante trägt **filterbare Facetten** (Quelltyp · Ebene · Kanton · Gericht · Leitentscheid-Status) —
  EINE generische «Bezüge am Artikel»-Schicht, an der auch Materialien-Kanten andocken (W2·6a-MAT,
  künftig `W2·6b-MAT-FINMA`), kein Zweitmodell (§5) · **(d)** Filter-UI im Gesetz-Leser
  (Instanz/Ebene/Kanton an-/abwählbar, Default konservativ: Leitentscheide an; Persistenz im
  Ansicht-Menü) · **(e = B5, §14-Intake David 28.7.2026)** eigenes Rechtsprechungs-Dropdown in der
  **Leser-Werkzeugleiste** (analog «Ansicht ▾») als reine **Ansichtsauswahl** der Verzahnung:
  Facetten + interaktiver **Zeitstrahl** + Von-Bis-Datumseingabe statt Perioden-Buckets;
  Entscheide bleiben unter den Artikeln (Detail Fahrplan §9 B5) · **(f = B6, §14-Intake David
  28.7.2026)** Gesamtüberarbeitung der Leser-Werkzeugleiste — minimalistischer und praktischer,
  ohne Funktionsabbau (Detail Fahrplan §9 B6; seriell nach B5, gleiche Fläche).
  **Abgrenzung (§14.3):** Long-Tail 195k Massen-Entscheide bleibt `W2·6-DATA` E3/E4;
  UI-Grammatik bleibt `W2·7-VZUI`. Facetten = Datenschicht, Filter = Darstellung (§3). Kantonale
  Zitat-/Norm-Resolver-Extraktion = Risiko-Pfad ⇒ `check:gegenpruefung`; Generator deterministisch,
  2 Läufe byte-gleich. Detail: `FAHRPLAN-VERZAHNUNG-UI.md` §9. Trailer `Roadmap: W2·7-BEZUG`.

## LERNPHASE-AB — Werkzeug-Andockung Audit 1: die drei erfüllten Andockungen *(offener Schritt; Erledigt-Prosa wörtlich verschoben 31.7.2026)*

  **Stand 5.7.2026 (PR `feat/lernphase-verifikations-infra`): alle drei
  Werkzeug-Andockungen erfüllt** — (1) Property-Tests um 3 Klassen erweitert (`tarifStaffel.property.test.ts`, jetzt 9
  Tests: Stetigkeit/Sprung an der `abChf`-Kante inkl. Hinweis-Sprache · Rahmen nie invertiert · Rundungs-Invarianz; alle
  grün, keine Engine-Änderung) · (2) Gate-Parallelisierung nachgemessen (seriell 16,2 s → parallel 6,5 s, 10-Kern; durch
  langsamsten Einzel-Check gedeckelt; Rot-Propagation adversarial bewiesen) · (3) B6 Myers-`diff` in `golden:diff` (Gate
  bleibt Byte-Vergleich).

## QS-GP — Bausteine a·b·c (gebaut/gemergt 1.7.2026, PR #67) samt Glob-Hinweis *(offener Schritt; Erledigt-Prosa wörtlich verschoben 31.7.2026)*

  **Hinweis:** die
  Risiko-Glob-Formen unten sind der *ursprüngliche Plan* — beim Bau korrigiert (verschachtelte
  `public/normtext/**` statt Top-Level-`*.json`, hand-gerolltes Pfad-Prädikat statt kaputter
  `*(a|b)*`-Alternation, `git status -uall`); die **as-built**-Wahrheit steht in
  `scripts/gegenpruefung/kern.ts` + der Spec. Bausteine:
  - **a · Gegenprüfungs-Gate `check:gegenpruefung`** — eingehängt in `npm run gate` (**nur lokal**,
    CI unverändert). Schneidet `git diff` ∩ Risiko-Pfade: **Extraktion** `scripts/normtext/**`,
    `src/lib/normtext/**`, `public/normtext/*.json` · **Rechnen** `src/lib/*(tarif|kosten|gebuehr|`
    `zustaendigkeit|frist|verjaehr|streitwert|beurkund|gruendung|schkg|straf|bger)*.ts` plus die
    Engine-Verzeichnisse `src/lib/tarif/**`, `src/lib/fristenspiegel/**` · **Norm/Tarif**
    `src/data/tarif/**`, `src/lib/vorlagen/**`. Trifft der Diff diese Globs, verlangt das Tor einen
    **Nachweis** (Commit-Trailer `Gegenpruefung:`; vor dem Commit liegt das Token in
    `bibliothek/.gegenpruefung-pending`, **gitignored** — Eintrag in `.gitignore` ergänzen), sonst
    **rot**. Über-Triggerung auf reine Tor-/Test-Änderungen wird mit Trailer
    `Gegenpruefung: n/a — reine Prüflogik` quittiert. **ERSTE AKTION beim Bau:** die Glob-Form gegen
    den real existierenden Baum prüfen (Verzeichnisse vs. `*.ts` — `src/lib/tarif`/`fristenspiegel`
    sind Ordner), sonst läuft das Tor leer. Das Tor selbst ist reine Prüflogik → golden byte-gleich (§6).
  - **b · Adversariales Protokoll als feste Skill** — unabhängiger Opus-Agent, frischer Kontext, vor
    sich Output **und** amtliche Quelle, Auftrag: widerlegen; **beim Rechnen** unabhängig aus der
    Norm nachrechnen (nicht den Code lesen). Gibt dem Trailer `Gegenpruefung:` überall dieselbe,
    nachvollziehbare Bedeutung.
  - **c · Gegenprüfungs-Register mit «Stand»** (`bibliothek/`, §11) — hält je Snapshot/Engine fest,
    welcher protokollierte Durchgang vorliegt (Datum, Verdikt, **gepinnte Quell-Version**) →
    Rück-Prüfung als Burn-down. Gekoppelt an `check:fedlex-versionen`: überholter Pin ⇒ Eintrag wird
    «**neu fällig**».

## QS-DATA — Stand 3.7.2026 (E0…E2, §11.2-Chips) + Sync-Reparatur 20.7.2026 *(offener/blockierter Schritt; Erledigt-Prosa wörtlich verschoben 31.7.2026)*

  **(a) Detail zu «Stand 3.7.2026: E0/E0+/E1/E1-Rest-A + E2-Vorarbeiten durch»:**
  (E1 = Generator-Flip Bund + Tor `check:datenhaltung`; **E2-Vorarbeiten = hot-FTS build-time [`fts_artikel` external content + `fts_entscheide_schaufenster` standalone, Tokenizer `unicode61 remove_diacritics 2`, HOT-Replika 178 MiB/1 GB] + Such-Query-Modul `scripts/datenhaltung/suche.ts` mit Pagination-by-design + Edge-Funktion `api/suche.ts` [503 ohne Turso]**; **E2-Anbindung ✅ 3.7.2026 = Gruppe «Volltext-Suche (online)» im geteilten `useUniversalSuche`/`SuchResultate` [`src/lib/suche/onlineVolltext.ts`, debounced Fetch, AbortController ~4 s, §8-Offenlegung, ehrliches Degradieren bei 503/Netz/Timeout/200-leer, 5-min-Feature-Cache]**)

  **(b) Detail zu «§11.2 Leitfälle-Chips (3.7.2026): das tote `proNormArtikel`-Modell ist verdrahtet»:**
  — Schaufenster-Shards je Erlass (`public/rechtsprechung/norm-index/<ERLASS>.json`, 19) + `leitfaelleFuerArtikel`-Lazy-Lader + Chip-Zeile im `ArtikelLeser` (Chip → Entscheid + «⧉ daneben öffnen»)

  **Reparatur 20.7.2026 — Sync-Transport + Frische-Wächter (E2 betriebsfest).** Der Workflow
  `turso-sync.yml` lief seit dem 18.7. sechsmal in den 20-min-Job-Timeout und wurde jedes Mal
  `cancelled` (grau, nicht rot) — BS-Import #300, G-REF #299, ASYLV2 #304, Richter #309/#310
  erreichten die Suche nie. Ursache war NICHT der Timeout: der Sync schickte je Zeile ein eigenes
  Hrana-`execute`, also einen durablen Commit pro Zeile (**gemessen 33 Zeilen/s** → ~46 min für
  61k Zeilen). Behoben durch **Mehrzeilen-INSERT in BEGIN/COMMIT** (gemessen **1429 Zeilen/s**,
  43×) + **Schatten-Tabellen mit atomarem Tausch** (ein Abbruch lässt den alten Stand stehen,
  statt wie bisher eine halb gedroppte Prod-Replika zu hinterlassen — genau das lag tagelang live:
  `artikel` 16'400 von 55'822, `fts_entscheide_schaufenster` gar nicht vorhanden). Die Atomarität
  trägt erst über den Hrana-**`baton`** (BEGIN und COMMIT in getrennten Requests): ein einzelner
  Request mit `BEGIN/…/COMMIT` ist NICHT atomar — die Pipeline bricht bei einem fehlgeschlagenen
  Statement nicht ab und das COMMIT schreibt den Teilzustand fest (von der Gegenprüfung empirisch
  widerlegt, im Wegwerf-Test verschwand eine Live-Tabelle dauerhaft). Neu:
  **`check:turso-frische`** — vierfach: Struktur · **Vollständigkeit** (Ist-Zeilenzahl gegen die
  vom letzten Sync protokollierten Soll-Zahlen; eine reine «nicht leer»-Prüfung hätte den
  historischen Schaden von 16'400 statt 55'822 Zeilen passieren lassen) · `manifest_sha` gegen
  `daten-manifest.json` · Alter — als harter Schritt im Sync **und** als täglicher cron-Job mit
  eigenem Token-Riegel; bewusst NICHT in `check:netz` (dort ohne Token = Schein-Abdeckung).
  Ein abgebrochener Sync schweigt nicht mehr (§8).

## QS-BASIS — Tor-Parität: Stand 20.7.2026 (16/36 in CI) *(offener Schritt; Erledigt-Prosa wörtlich verschoben 31.7.2026)*

  **Stand 20.7.2026 (PR `docs/bau-fundament`): 16/36 in CI** — `check:merge-schutz` · `check:tor-paritaet` · `check:dispatch-klausel` · `check:besetzung` · `check:entscheide` · `check:bs-entscheide` neu verdrahtet; die drei Rechtsprechungs-Tore standen mit der sachlich FALSCHEN Begründung «braucht rechtsprechung.db (488 MB)» auf der Allowlist, sie lesen in Wahrheit die committeten Projektionen (je ~1 s grün unter `CI=1`).
