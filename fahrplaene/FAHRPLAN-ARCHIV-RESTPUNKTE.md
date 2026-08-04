# Archiv-Restpunkte — offene Reste der 20 archivierten Fahrpläne (Archiv-Welle 31.7.2026)
<!-- @lagebild name: Archiv-Restpunkte · zweck: Übriggebliebene Einzelposten älterer Aufträge. -->

**Heimat:** ROADMAP «Strang-Detailpunkte & Hygiene» — dort steht je Strang ein Einzeiler,
hier der wörtliche Rest. Diese Datei steuert nicht; sie hält fest, was beim `git mv` der 20
Fahrpläne nach `archiv/` sonst verloren ginge.

Jeder `## §<n>` entspricht **genau einem** archivierten Strang (Reihenfolge wie in der
ROADMAP-Sektion) und lässt sich einzeln ziehen:
`npm run fahrplan -- fahrplaene/FAHRPLAN-ARCHIV-RESTPUNKTE.md <n>` — das liefert Kopf + §0 + den
gewünschten §, statt der ganzen Datei.

*Je Datei prüfte ein Nur-Lese-Opus-Agent, ob ALLE offenen Punkte in `ROADMAP.md` stehen; alle
Verdikte lauteten NUR-MIT-NACHTRAG. Die folgenden Einzeiler sind dieser Nachtrag — sie steuern nicht,
sie halten den Rest fest, damit der `git mv` nach `archiv/` informationsverlustfrei ist.*

*Zwei Wellen: **AP-3** (11 verwaiste Fahrpläne, 45 Einzeiler — ab «Beurkundungs-Ausbau») und
**AP-4** (9 Fahrpläne erledigter/überholter Schritte, 36 Einzeiler — ab «Rechtssammlung»). In AP-4
prüften 12 Agenten; **drei Dateien bleiben begründet im Root**: `FAHRPLAN-PLAN-STEUERUNG.md` (einzige
Doku der `@meta`-DSL, keine Ersatz-Heimat), `FAHRPLAN-RECHTSPRECHUNG.md` (Detailquelle des noch
offenen `R-RICHTER`) und `FAHRPLAN-OPENCASELAW-QUELLEN.md` (geltende Grundlage von
`PLAN-OCL-ABBAU.md`).*

## §0 · Quer-Lektionen

- **Herkunft:** Methode *verify-then-archive* — je Datei prüfte ein Nur-Lese-Opus-Agent, ob
  ALLE offenen Punkte in `ROADMAP.md` stehen; alle 20 Verdikte lauteten NUR-MIT-NACHTRAG.
  Die §§ unten sind dieser Nachtrag, wörtlich aus `ROADMAP.md` hierher verschoben.
- **Regel beim Abarbeiten:** Ein erledigter Punkt wird **hier** abgehakt (nicht in der
  ROADMAP, die nur den Einzeiler trägt); erfordert er eine fachliche Abnahme (§7/§8), gehört
  der David-Abnahme-Vermerk mit Datum an denselben Punkt. Fällt ein ganzer § leer, bleibt
  die Überschrift stehen und bekommt den Vermerk «vollständig erledigt» — sonst rutschen die
  §-Nummern und die Einzeiler in der ROADMAP zeigen ins Falsche.
- **Datei-Historie** (welche Datei wann und warum ins Archiv ging): `archiv/README.md`.
  Die archivierten Fahrpläne selbst bleiben byte-genau historisch stehen — ihre Köpfe sind
  teilweise stale und werden dort **nicht** nachgeführt.

## §1 · Beurkundungs-Ausbau

*(→ `archiv/FAHRPLAN-BEURKUNDUNGS-AUSBAU.md`)*

- **BEURKUNDUNG Tarif-Lücken (72 Zellen):** in `src/data/tarif/beurkundung.ts` tragen 72 von 546
  (Geschäftsart × Kanton)-Kombinationen keinen Sondertarif → Engine `status: 'offen'`, UI «In
  Recherche» (§8-ehrlich, nie ein Schätzwert). Systematisch fehlen **baurecht/vorkaufsrecht/
  schuldbrief/verpfruendung/kapitalherabsetzung für LU·GL·ZG·SO·BS·BL·SH·AR·AI·AG**, dazu
  vorsorgeauftrag (6 Kt) · schuldanerkennung (6) · vollmacht (3) · schenkung (2) ·
  genossenschaft_gruendung (2) · stiftung/statutenaenderung (je 1) · vorkaufsrecht TI. Mitursache:
  der im Plan vorgesehene Default `GENERELLER_WERTTARIF` ist ein **leeres** Objekt (Z.31), der
  Fallback in `tarifFuer()` läuft nie. Je Zelle **erheben oder als tariflos begründen** (freies
  Notariat ZG/SO/BL: Honorar frei → «nach Vereinbarung» statt «in Recherche»). Heimat
  `archiv/FAHRPLAN-BEURKUNDUNGS-AUSBAU.md` §3 + `archiv/FAHRPLAN-LUECKEN-SCHLIESSEN.md`
  (L2-Nachfolge, dort bisher nur die 3 prozeduralen Arten inventarisiert). Risiko-Pfad ⇒ `QS-GP`.
  `[OF]`
- **Gründungs-Tarif doppelt gepflegt (§5):** neben der 26-Kt-Schicht `src/lib/beurkundung.ts`/
  `src/data/tarif/beurkundung.ts` versorgt die 6-Kt-Alt-Engine
  `src/lib/notariatsgebuehrenGruendung.ts` (Dossier
  `bibliothek/kosten/notariatstarife-gruendung-kantone.md`) weiterhin
  `src/pages/vorlage-ag-gruendung/schritte-dokumente.tsx` — die im Plan verlangte
  Dossier-Integration ist nur inhaltlich, nicht strukturell erfolgt. Zusammenführen **oder** die
  Regime-Trennung ausdrücklich begründen (§1 vor §6); Divergenz-Präzedenz: BS-Gründung Rahmen
  750–2000 vs. Punktwert (16.6.2026 behoben).
- **Stale Register-Einträge Gründungs-Dossier:** `bibliothek/INDEX.md` Z.283,
  `bibliothek/register/parameter-verfall.md` Z.36 und `bibliothek/register/engine-map.md` Z.95
  führen ZH-Nachtrag-123 · SG-Brutto/Netto-MwSt · Agio weiter als «offen», obwohl Agio am 7.6.2026
  auf «belegt» gehoben, die MwSt zentral in `src/lib/beurkundungZusatzkosten.ts` (MWSTG Art. 25 I,
  8,1 %, nur freies Notariat) gelöst und ZH Ziff. 4.4.3.1 in `beurkundung.ts` mit der
  Nachtrag-123-Fassung (Stand 1.1.2024) verlinkt ist — nachführen oder den Restzweifel benennen;
  ZH-123-PDF-Beleg ist von der Aufräumwelle **nicht** am Original nachgeprüft worden.
- **Klein-Backlog Beurkundung:** «Eintragung Eigentumsvorbehalt» (Plan-Tabelle «alles weitere») ist
  in keiner Taxonomie abgebildet — fachlich Register beim Betreibungsamt (Art. 715 ZGB, EigVV
  SR 211.413.1), nicht Notariat/Grundbuch: entweder eigener Kostenblock oder bewusst streichen und
  in `beurkundung-typen.ts` als Nicht-Gegenstand vermerken.

## §2 · BGer-Rechtsweg

*(→ `archiv/FAHRPLAN-BGER-RECHTSWEG.md`)*

- **BGER-RECHTSWEG R-3d** (Etappe nie gebaut, Befund 31.7.2026): BGG-Such-Einträge im
  Preset-Such-Index `src/lib/presetIndex.ts` fehlen — `PresetRegime` kennt nur
  `allgemein|zpo|schkg`, und `/rechner/bgg-fristen` hat gar keine Presets. Entweder BGG-Presets
  nachziehen oder den Punkt als gegenstandslos abschreiben; Detail
  `archiv/FAHRPLAN-BGER-RECHTSWEG.md` R-3d. `[OF]`

## §3 · Fall-Rückgrat

*(→ `archiv/FAHRPLAN-FALL-RUECKGRAT.md`)*

- **FALL-RUECKGRAT Säule 2 (`.lexmetrik`-Krypto, Konzept, nie gebaut):** verschlüsselter
  Fall-Export/-Import (AES-GCM-256 + PBKDF2-HMAC-SHA256, `crypto.subtle`, kein Backend) mit den vier
  Pflicht-Härtungen der Krypto-Linse — Iterations-Floor 600'000 (OWASP 2023) und harte Ablehnung von
  `iter < MIN_ITER` beim Entschlüsseln · Decrypt-Allowlist
  `v===1 && alg==='AES-GCM' && kdf==='PBKDF2-SHA256'` · AAD-Bindung der Umschlag-Header ans
  GCM-Auth-Tag · Chunked Base64 statt `btoa`/Spread; `.lexmetrik` bewusst **nicht** golden-gegated
  (per Design nicht-deterministisch, IV/salt frisch je Export). Detail
  `archiv/FAHRPLAN-FALL-RUECKGRAT.md` Phase 3.
- **FALL-RUECKGRAT — 5 offene David-Entscheide** (reisen mit dem geparkten Strang, vor einer
  Reaktivierung zu beantworten): ID-Mechanismus `crypto.randomUUID()` vs. Inhalts-Hash ·
  «Heute»/Fälligkeits-Ampel als reines Darstellungs-Metadatum (§2-Grenze) · Default der
  `.lexmetrik`-Import-Konfliktstrategie (behalten/überschreiben/zusammenführen) ·
  Klartext-localStorage für sensible Freitext-Adressen oder nur verschlüsselte Datei (§8,
  Wipe-Frage) · Sichtbarkeit «Meine Fristen» (Header+Footer vs. zusätzlich Startseiten-Hinweis).
  Detail `archiv/FAHRPLAN-FALL-RUECKGRAT.md` §Offene David-Entscheide.
- **FALL-RUECKGRAT Detail-Verweis** (im Geparkt-Block «Dossier / Fall-Rückgrat» nachziehen):
  Konzept-Spezifikation vom 16.6.2026 → `archiv/FAHRPLAN-FALL-RUECKGRAT.md` (Datenmodell
  `lexmetrik.fristen.v1`/`lexmetrik.parteien.v1`, Phasen 0–5, §13-Auflage «Permalink ohne `origin`»,
  `.lexmetrik` nie an ein Backend) — ohne diesen Verweis zeigt der Geparkt-Eintrag nach dem Umzug
  nur noch auf `archiv/FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md` §P2 und die Konzept-Substanz ist aus
  ROADMAP nicht mehr erreichbar.

## §4 · Fundament-Umbau

*(→ `archiv/FAHRPLAN-FUNDAMENT-UMBAU.md`)*

- **FUNDAMENT A5/A6** *(Thema A)* — Rest-Rollout der generischen `VorlagenSeite` auf weitere lineare
  Standard-Briefe (Stand 31.7.: 5 von 34 `Vorlage*.tsx` umgestellt; 25× direkter `useWizardState`,
  10× kopierte ISO-Regex) + deklarative Optionalfelder/Verzweigungen (A6, z. B. NDA-Richtungs-Toggle)
  **ohne** `includeIf`-Duplikat in der Config (§3). Opt-in bleibt Pflicht: VariantenKopf-/
  Mehrschritt-/Eigen-Gate-Seiten (Werkvertrag, Auftrag, NDA, Klagen, Testament, Gründungen) bleiben
  bewusst handgeschrieben (§1). Beweis je Seite: golden byte-gleich **+** Playwright-DOM
  byte-identisch. `[OF]`
- **FUNDAMENT C3** *(Thema C, GEFAHRENZONE)* — Inline-Verbatim aus `basisAntworten()`
  (`src/lib/vorlagen/gruendungAgDokumente.ts`: Stichentscheid-Satz, Agio-Zusatz u. a.) in den
  Schema-`text:`-Kanal heben; **je Fragment ein Commit**, `golden:diff` byte-gleich, sonst sofort
  zurück. Berechnete Werte bleiben in `basisAntworten` (Logik ≠ Wortlaut). Solange offen, erscheinen
  diese Fragmente in den Abnahme-Dossiers nur als Platzhalter — der Wortlaut entzieht sich Davids
  §7-Abnahme.
- **FUNDAMENT C4** *(optional)* — additives `verified?: boolean` am Baustein-Typ (von `assemble`
  nicht gelesen → Golden byte-gleich); nur falls David Schemas nach der Wortlaut-Abnahme markieren
  will. Nie automatisch setzen (§7).
- **FUNDAMENT E3/E4** *(Thema E, **Davids Entscheid**)* — `scripts/lik-reihe-generieren.py` nach TS
  portieren **nur** mit byte-identischer `src/data/likReihe.ts` gegen sha256-Snapshot, erst danach
  Python + `requirements.txt` entfernen. Konflikt-Register: `openpyxl`-float vs. TS-Reader-Rundung
  könnte Teuerung/Verzugszins kippen (§1 vor §6) — bei Zweifel bei E1 stehenbleiben. E1
  (`requirements.txt`) ist erledigt.
- **FUNDAMENT F1/F2/F3/F5** *(Thema F)* — §8-Hinweis «nur dieser Browser» am Vorlagen-Wizard selbst
  (heute nur global auf `/einstellungen`) · Export/Import der Antworten als lokale JSON-Datei über
  den **bestehenden** `normalisieren()`-Pfad (§5, kein zweiter Lade-Pfad) · Norm-Bezeichnung im
  Schema vom Klauseltext trennen (verhaltensneutraler i18n-Vorbau, golden-gegated) · **Davids
  Entscheid**, ob/welche Vorlagen amtlich übersetzte fr/it-Klauseln bekommen (nur amtlich, **kein
  LLM** — §7/§8; ROADMAP-O-4 deckt nur Gesetze/BGer, nicht Vorlagen-Klauseln). F4 (local-only vs.
  Server-Sync) ist über «Dossier/Fall-Rückgrat» geparkt.
- **Stale Doku-Kopf FUNDAMENT/GESAMTAUFBAU — mit der Archivierung 31.7.2026 korrigiert:**
  `FAHRPLAN-GESAMTAUFBAU.md` Z.85 führte «(iv) FUNDAMENT-UMBAU Thema B+C Go/No-Go» als einzigen
  offenen T0b-Punkt, der Fahrplan-Kopf selbst (Z.16–19) behauptet «Themen B–F unberührt offen
  (3.7.2026)». Beides ist überholt: Thema B (Routen-SSoT) und C1–C2 (Abnahme-Dossiers) sind seit
  13.6.2026 gebaut (`src/routesManifest.ts`, `src/tests/routenManifest.test.ts`,
  `scripts/abnahmeDossier.ts`). Das T0b-Gate ist beim Archivieren mitkorrigiert worden — es wartete
  auf eine längst getroffene Entscheidung; der Fahrplan-Kopf selbst bleibt im Archiv byte-genau
  historisch stehen.

## §5 · Grundlagen

*(→ `archiv/FAHRPLAN-GRUNDLAGEN.md`)*

- **GRUNDLAGEN G3.2a · Katalog-Konsolidierung** *(Heimat `archiv/FAHRPLAN-GRUNDLAGEN.md`)*:
  `startseiteConfig.ts` + `katalogSuche.ts` — «ein Einstieg pro Rechtsfrage», Thema-Bündel,
  `szenarien[]`/`imKatalog:false`, Umlaut-Suche, sichtbare Kartenzahl weiter senken;
  **Verb-Titel-Entscheid David (E1.1, `archiv/FAHRPLAN-KATALOG-UI.md`)** in derselben Welle.
  Auffindbarkeits-Hälfte ist mit W2·5/W2·5c erledigt — offen ist nur die Katalog-Seite. `[OF]` ausser
  dem Verb-Titel-Entscheid `[D]`.
- **GRUNDLAGEN G3.2b · Engine-Verschmelzung** *(Entscheid David 8.6.2026, CLAUDE.md §4)*: erlaubt,
  aber **golden-gegated (§6) und regime-treu** (interne Verzweigung statt Kollaps); risikoärmster
  Merge zuerst = Fristen-Infrastruktur `fristenEngine.ts`/`datumsUtils.ts` hinter den
  Regime-Engines, `golden:vergleich` byte-gleich als Tor. Wiedervorlage mit §0a-Öffnung;
  Vorgeschichte `archiv/FAHRPLAN-VEREINHEITLICHUNG.md` V5 (zurückgestellt), Protokoll = Skill
  `refactoring`. `[OF]`
- **GRUNDLAGEN G4.1-Rest · Bibliothek-Dossier-Reife (§11/S9)**: zu gebauten Engines gehörende
  Dossiers auf **Decision-Tree-Form** heben (Eingabe→Ausgabe statt Prosa),
  `engine-map.md`-«Dossier-only»/Abnahme-Blocker nachführen. Gebaut sind bereits S6-Schärfung
  (`scripts/bibliothek-check.sh`) und die bidirektionalen Dossier-Köpfe
  (`src/tests/dossierVerweise.test.ts`); S9 bleibt per Entscheid **nicht** maschinell prüfbar
  (`bibliothek/STANDARDS.md` S10) → Abnahme/adversariale Durchgänge. `[OF]`
- **GRUNDLAGEN A3-Restbefunde** *(3 Stück, je «klein», Output-wirksam → Wortlaut-Verifikation +
  Golden-Deklaration in eigener Welle; Detail `archiv/HANDLUNGSPLAN.md` B.4b)*:
  Art.-40/41-StPO-Zitatschärfe in der Gerichtsstands-Weiche
  (`src/lib/strafZustaendigkeit.ts:138`) · Erbschaft+Pfand-Kombination ohne Vorrang-Klärung
  (`schkgZustaendigkeit.ts`, Art. 49 vs. 51 SchKG) · Widerspruch-Fahrplantext ignoriert
  `grundstueck`-Konstellation (Parteirollen nach Grundbuch-Eintrag, Art. 109 Abs. 3 / 107 f. SchKG).
  `[OF]`

## §6 · International-Volltext

*(→ `archiv/FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`)*

- **INTERNATIONAL-VOLLTEXT IV-1 — Extraktor-Rest `scope_*`/`decl_*` korpusweit** *(aus
  P4-Gegenprüfung 10.7.2026; Detail `archiv/FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`)*: Der Nachzug
  `9a144596a` (11.7.) nahm «scope|decl» in `alleAnhangAnker()` auf, scannt aber erst ab
  `<div id="annex">` und liefert ohne Annex-Container nichts ⇒ **14/27 Staatsverträge tragen
  `scope_*`, 7/27 `decl_*`; 13 (u. a. KRK, CISG, CEDAW, UNO-Pakt I/II, UNO-BRK) droppen
  Geltungsbereich und CH-Vorbehalte weiterhin**. Offen: Scanner auch ohne/vor dem Annex-Container in
  `scripts/normtext/extrahiere-fedlex.ts`, dann Re-Extraktion **aller 27** (je eigener Golden-Diff,
  §6/§14.2). **`decl_*` zuerst** — «Vorbehalte und Erklärungen Schweiz» sind für die CH materiell
  verbindliches Recht, die `scope_*`-Parteien-Tabelle ist zeitveränderliche Verwaltungsdaten.
  Extraktions-Risikopfad ⇒ `QS-GP`-Gegenprüfung Pflicht, Opus. Bis dahin volle Fassung inkl.
  Geltungsbereich/Vorbehalten über den amtlichen Live-Link (§7c/§8, dokumentiert, nicht stumm).
  `[OF]`
- **INTERNATIONAL-VOLLTEXT IV-2 — weitere SR 0.\* als Volltext** *(optional, Backlog; gleiche
  konsolidierte `eli/cc`-Mechanik + Gehalt-Test, kein neues Format/Skript)*: Rechtshilfe Strafsachen
  (0.351.\*) · **DBA-Paket kohärent statt einzeln** · weitere Bilaterale CH–EU · WÜD/WÜK
  (0.191.01/.02). Bewusst **nicht** gebaut bleiben ESÜ (0.211.230.01, durch HKsÜ überholt), DBA-DE
  (0.672.913.62, Scope-Creep) und EPÜ 2000 (0.232.142.2, weder HTML noch PDF/A → nur Live-Link);
  §11-Beleg `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`. Stand 10.7.2026:
  International-Volltext 27.

## §7 · Kantonale Entscheide

*(→ `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md`)*

- **KANTONALE P0-Rest** (Bugfix-Klasse neben dem gemappten SG-Regeste-Fix, öffnet keinen 26×-Slot):
  AG/BE/GR/ZH je 6 Pilot-Entscheide **ohne Regeste-Feld** (Übersicht zeigt Synth-Leitzeile) ·
  **`rubrum: null` bei allen 30 Pilot-Entscheiden** (BS-Tranche hat Rubrum) — Stand 31.7.2026
  nachgezählt. Detail `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §0 + §7a F3 (Parteien/Kammer;
  Besetzung ist über R-RICHTER erledigt).
- **KANTONALE P3 · PDF-Fallback statt Pseudo-Struktur**: für die sperrigen Quellen den bestehenden
  pdf-embed-Pfad (EMRK-Muster, `GesetzLeser.tsx`) wiederverwenden — TG
  (Confluence-Jahres-Sammel-PDFs, nicht parsen) · VS (Nuxt-SPA) · **GE als Pilot** (einzige
  sprechende PDF-Permalinks); dazu die Sonderfälle **GR-Strukturbruch 2025** (KG+VG → Obergericht,
  Gerichtscodes neu mappen) und **ZH** (drei getrennte DBs = drei Quellen), je mit Marker «als
  amtliches PDF dargestellt» (§8). Detail `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §4/§5-P3;
  Bahn-Einordnung `FAHRPLAN-GESAMTAUFBAU.md` Bahn B.
- **KANTONALE P2-Auflagen (vor jeder Breiten-Ingestion, gilt an E5)**:
  **Anonymisierungs-Stichprobe + DSG-/Haftungsbetrachtung VOR der Ausweitung** (R1; im Zweifel
  PDF-embed statt Re-Hosting) und die **§8-Dauerauflage R4** — die quell-bedingt selektive,
  durchgängig anonymisierte kantonale Abdeckung nie als «vollständig» ausgeben (struktureller
  Befund, kein behebbarer Bug). Detail `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §5-P2/§6.
- **KANTONALE F1/F5/F6 (Folge-Einheiten der BS-Tranche, nicht gebaut)**: **F1** BS-Bestand vor 2022
  (~7'000 Dok.) · **F5** Register-Sharding der Rechtsprechung (≠ `register.json`-Sharding unter
  QS-PERF) · **F6** weitere Findinfo-Kantone auf demselben `bs-client`-Kern (Vendor-Hebel §2; die ID
  ist in `src/lib/rechtsprechung/browse.ts` verankert). Detail
  `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §7a +
  `bibliothek/register/BS-RECHTSPRECHUNG-QUELLE-2026-07.md`.
- **KANTONALE P4 · Kuratierung + Abnahme**: kantonale Entscheide sind durchgehend
  `leitcharakter:'routine'`/`kuratierung:'maschinell'` (3795/3795, Stand 31.7.2026) — Kuratierung
  kantonaler Leitentscheide erst mit Davids Fachzeit; die Erstrecherche (zwei unabhängige
  Web-Agenten) und die BS-Tranche warten auf die fachliche Abnahme → in die
  **Abnahme-Warteschlange** aufnehmen. Detail `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §5-P4 +
  Schlussabschnitt «Abnahme-Status».

## §8 · Lücken schliessen

*(→ `archiv/FAHRPLAN-LUECKEN-SCHLIESSEN.md`)*

- **LUECKEN L2-Restlücke** (Beurkundungstarif, 3 von 78 Kanton×Art-Zellen): JU bei
  `genossenschaft_gruendung` + `statutenaenderung`, SG bei `genossenschaft_gruendung` ohne
  Sondertarif; beide Arten sind `bemessung: 'fix'` und `GENERELLER_WERTTARIF` ist leer →
  `berechneBeurkundung()` liefert `status:'offen'`, die UI zeigt dort «in Recherche»
  (`src/data/tarif/beurkundung.ts`). Detail `archiv/FAHRPLAN-LUECKEN-SCHLIESSEN.md` L2.
- **LUECKEN L4/L5 Methodik-Grenzen** (bestehen fort, nur offengelegt — §8, kein Bau-Auftrag):
  SZ-Stockwerkeigentum als 0,63‰-Näherung statt exakter Ceil-Stufe Fr. 45 je angefangene
  Fr. 50'000 von 70 % (`src/data/tarif/grundbuch.ts` STWE/SZ; <500k leicht zu tief) · Schenkung ohne
  Substrat-Split (Engine rechnet Grundstück-Regel, Fahrnis-Auffangnorm nur im Hinweis: ZH Ziff. 4.6 /
  TG § 16 / SZ Nr. 3). Träger nach der Archivierung = die Code-Hinweise; Detail
  `archiv/FAHRPLAN-LUECKEN-SCHLIESSEN.md` L4/L5.

## §9 · Notariat & Grundbuch

*(→ `archiv/FAHRPLAN-NOTARIAT-GRUNDBUCH.md`)*

- **NOTARIAT Restscope Beurkundungs-Geschäftsarten:** **Erbteilung** ist als beurkundbare
  Geschäftsart weder in `src/data/tarif/beurkundung-typen.ts` (22 Arten) noch in der
  Geschäftsart-Tabelle von `archiv/FAHRPLAN-BEURKUNDUNGS-AUSBAU.md` abgebildet — Erweiterung über
  dieselbe Engine, vor dem Bau fachlich klären, ob überhaupt beurkundungsbedürftig (Art. 634 ZGB =
  Schriftform) `[OF]`.
- **NOTARIAT §8-Ehrlichkeit im Bestandstext:** `archiv/FAHRPLAN-BEURKUNDUNGS-AUSBAU.md` Z.11–12
  bezeichnet die Grundstückkauf-Schicht als «doppelt verifiziert», obwohl alle Einträge in
  `src/data/tarif/notariat-grundbuch.ts` auf `recherche` stehen und NG-4 offen ist. Mit der
  Archivierung 31.7.2026 bleibt der Satz dort byte-genau historisch stehen — **massgeblich ist ab
  hier: erstrecherchiert, Doppelcheck offen (NG-4)**, damit der falsche Stand die Archivierung des
  Ursprungsplans nicht überlebt.
- **Stale Doku-Kopf NOTARIAT-GRUNDBUCH — erledigt durch die Archivierung 31.7.2026** (Datei nach
  `archiv/`; die überholten Kopf-Angaben — Handänderungssteuer-Kantonsliste ohne
  SZ/NW/OW-Korrektur, Datei-Pfade `notariat.ts`/`grundbuch.ts` — sind damit historisch, massgeblich
  ist `src/data/tarif/notariat-grundbuch.ts` + `bibliothek/kosten/notariat-grundbuch-kantone.md`).

## §10 · Vertrags-Varianten

*(→ `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md`)*

- **VERTRAGS-VARIANTEN — Restbestand neuer Basistypen** *(Heimat
  `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md` §2/§5; Bau-Anker `W3·13`)*: **P3-Rest** Tausch (237) ·
  Gebrauchsleihe (305) · Miet-Untertypen Parkplatz/möbliert — **P4-Rest** Schuldanerkennung
  (82 SchKG) · Garantievertrag (111) — **P5** Mäkler (412 ff.) · Agentur (418a ff.) · Kommission
  (425) · Lizenz (innominat) · Kooperation/JV · Franchise — **P6** einfache Gesellschaft (530 ff.)
  als eigene Karte · Aufhebungsvereinbarung (Feld A, Saldoklausel-Module). Je eigenes OR-Regime →
  eigenes Schema/eigene Engine (§4), nie in eine bestehende Karte kollabieren; jede neue Karte
  trifft `startseiteConfig`/`vorlagenRegistry` → Worktree (§12).
- **VERTRAGS-VARIANTEN P2-Rest (Untertypen, nicht Detailgrad)**: der Detailgrad-Rollout ist auf allen
  sechs Vertrags-Karten durch, der **Untertyp**-Rollout nicht — offen: Auftrag
  (Beratung/Treuhand/Inkasso/Mandat) · NDA (Personal/M&A/IT) · Werkvertrag-Experte-Module
  (Zahlungsplan/Bauhandwerkerpfand-Hinweis/Pönale/Abnahmeprotokoll) · Konkubinat-Module. Detail
  `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md` §2/§5-P2.
- **VERTRAGS-VARIANTEN P1f — Zähl-Hygiene**: `src/lib/vorlagen/variantenInventar.ts` +
  `src/tests/variantenInventar.test.ts` sind der ehrliche Fortschrittszähler (Stand 168 erzeugbare
  Dokumente = 17 % des 1000-Ziels) — **bei jeder neuen Vertrags-Karte und jedem neuen Untertyp
  Inventar UND Test nachführen** (§8, kein stiller Schwund). «1000» ist die kombinatorische
  Dokumentenmenge (Typ × Untertyp × Detailgrad × Module), nie eine Kartenzahl.
- **Abnahme-Warteschlange, Ergänzung Rang 2 (Form-Gate-Vorlagen)**: Lehrvertrag
  (Schriftform-Gültigkeit Art. 344a I) · Handelsreisendenvertrag (347–350a) · Heimarbeitsvertrag
  (351–354) — gebaut 14.6.2026, Anker am Fedlex-Cache 20260101 verifiziert, golden additiv;
  **fachliche Abnahme David ausstehend** (Detail `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md` §7).
- **Stale Doku-Köpfe**: Teileintrag «VERTRAGS-VARIANTEN «1000»» ist mit der Archivierung 31.7.2026
  **gestrichen** — der Kopf bleibt im Archiv byte-genau stehen, die Zähl-Wahrheit trägt jetzt
  `variantenInventar` (Stand 168 = 17 %).
- **W3·13 @meta**: nach der Archivierung `fahrplan: archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md` ergänzen
  (Feld fehlt heute, anders als bei W3·12/W3·14) —
  `npm run fahrplan -- archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md §2` löst den Pfad auf, der Slice bleibt
  damit erreichbar.

## §11 · GmbH-Gründung

*(→ `archiv/FAHRPLAN-GMBH-GRUENDUNG.md`)*

- **GMBH-GRUENDUNG G0** *(Detail: `archiv/FAHRPLAN-GMBH-GRUENDUNG.md`)* — Korrektheits-Abgleich am
  Original: Singular-Urkunde verbatim (`bibliothek/muster/zh-gmbh-gruendung-1person-bar.txt`) ·
  Vorsitz-/Ernennungs-Beschluss-Formalia (Beginn/Ende/Abwesend) · Zeichnungsarten
  ohne/Kollektivprokura · Statuten-kurz Geschäftsjahr-/Beschlussfassungsarten
  (805 V Ziff. 2bis / 701 III OR) · Wahlannahme Revisionsstelle · Anmeldungs-Hinweise 24a HRegV ·
  Nachtragsvollmacht.
- **GMBH-GRUENDUNG G1** — Statuten kurz/lang aus `bibliothek/muster/zh-gmbh-statuten-lang.txt`;
  Binnenverweise nummerierungsfest; bestehende `statutKlauseln` (Nachschuss etc.) bleiben Weichen.
- **GMBH-GRUENDUNG G3** — Fremdwährung (Art. 773 II OR, Gegenwert CHF 20'000, Anhang 3 HRegV) + Agio
  (Ausgabebetrag, unter pari 777c I sinngemäss/624); **keine Teilliberierung** (777c I: volle
  Liberierung jedes Stammanteils zwingend).
- **GMBH-GRUENDUNG G4** — Urkunden-Optionen: Wahlannahme GF · Vorsitz-/Zeichnungsregelung (Gate
  GF ⊆ Gründer, AG-Befund 1) · Domizil nur in der Anmeldung · Lex-Koller-Dokument ·
  Gründungs-Nachtrag (GmbH-Vorlage existiert nicht → Haus-Fassung offenlegen, §8).
- **GMBH-GRUENDUNG G5** — Info-Schicht: GF-Pflichten (Art. 820 OR → 725 ff.) · private Register ·
  FINMA-Wortprüfung · Übersetzungen.
- **GMBH-GRUENDUNG G6** — Wizard-Umbau `VorlageGmbhGruendung` (6 Schritte analog AG) +
  Sammel-Download; teilt sich den Rahmen mit dem Klein-Backlog-Punkt «Gründungs-Rahmen GmbH/AG
  teilen».
- **GMBH-GRUENDUNG G7** — Sammel-Bug-Check §9 (2 Agents: Kombinatorik-Sweep + Wortlaut gegen die
  GmbH-Originale in `bibliothek/muster/`); AG-Sammelcheck-Befunde als Checkliste
  (Satz|Zeile-Fragmente · Agio-Gegenwert auf GELEISTETEN Einlagen · VR/GF⊆Gründer-Gate ·
  Beilagen-Listen ehrlich filtern · Konventions-Testfälle je Numerus/Variante).
- **GMBH-GRUENDUNG — David-Gate:** Bau **pausiert seit 7.6.2026** («warte noch mit dem bau der gmbh,
  mach nur recherche»); G0–G7 starten erst auf ausdrückliches Go. W3·13 (`GMBH G2`) trägt den
  Blocker noch nicht — beim Aufgreifen `blocker` setzen oder das Gate bewusst als aufgehoben
  vermerken.
- **GMBH-GRUENDUNG — Wortlaut-Basis:** die Originale liegen committet in `bibliothek/muster/`
  (+ `MANIFEST.md` mit Quell-URLs), Klausel-Katalog S1–S20 in
  `bibliothek/recherche/gruendungsdokumente-wortlaute.md`, Recherche-Stand in
  `gmbh-gruendung-deltas-g0.md` (GD1–GD8) + `gmbh-qualifizierte-gruendung.md`. Der Fahrplan-Zeiger
  auf `.scratch/gmbh-knowledge/` ist **tot** (gitignored, gelöscht) — nicht mehr verwenden.

## §12 · Rechtssammlung (Rubrik V «Gesetze»)

*(→ `archiv/FAHRPLAN-RECHTSSAMMLUNG.md`)*

- **RECHTSSAMMLUNG O6 — Generator-Steuerung verstreut, «eine Zeile pro Gesetz» nur halb wahr:**
  die ELI-/Konsolidierungs-Pins leben weiterhin NEBEN dem Register — `scripts/fedlex-cache.sh`
  trägt 227 `EINTRAEGE`-Zeilen im Format `name|eli|kons(YYYYMMDD)|html-N|pflicht-anker|SR`,
  kantonale `lawId`/`pdfProfil`-Angaben liegen in den Tarif-/Adapter-Tabellen;
  `src/lib/normtext/register.ts` kennt davon nur die Zeiger `fedlexKey`/`pdfPfad`
  (`register-typen.ts:59,65`). Der geplante deklarative `bezug`-Block (EIN Steuerpult für Aufnahme
  + Pflege) ist nie gebaut — bewusst nicht im MVP (vergrössert das Register, riskiert Golden),
  aber auch in keinem Nachfolge-Fahrplan geführt: `FAHRPLAN-FEDLEX-PORTFOLIO.md` §72 beschreibt
  `fedlex-cache.sh` nur als Ist-Zustand. Entweder als eigener verhaltensneutraler Refactor nach §6
  einplanen (Golden byte-gleich, `check:caches` mitziehen) **oder** ausdrücklich verwerfen und die
  Zwei-Orte-Pflege als bewusste Regime-Trennung begründen (§5). Detail
  `archiv/FAHRPLAN-RECHTSSAMMLUNG.md` §O6. `[OF]`
- **RECHTSSAMMLUNG — Absatz-tiefe Permalinks (`#art-{token}-abs-{n}`) offen, Zitat-Seite ist
  gebaut:** die absatz-/lit.-/ziffern-genaue **Zitat**-Kette existiert
  (`src/components/normtext/ArtikelBody.tsx:19,621` «Art. X Abs. Y lit. z ERLASS», W2·5d G2b), der
  geteilte **Anker** bleibt aber artikel-grob (`permalinkBasis` = `#art-${e.artikel}`,
  `src/pages/gesetz-leser/parts/ArtikelLeser.tsx:329,473`; korpusweit 0 `-abs-`-Anker). Folge: ein
  kopierter Link auf einen langen Artikel (z. B. OR 336c, ZPO 198) springt nur an den Artikelkopf,
  während das mitkopierte Zitat den Absatz nennt — Zitat und Link zeigen unterschiedlich tief. Der
  im Plan als «später» markierte ELI-Geist-Ausbau ist in keinem Schritt geführt; nächstgelegene
  Bau-Fläche = `W2·10-UI-NAV` (Reader-Welle «Zitat+Permalink») bzw. `W2·5d`. Detail
  `archiv/FAHRPLAN-RECHTSSAMMLUNG.md` Task 3.6 (c) + «Übernommene Muster» Ziff. 5.
- **RECHTSSAMMLUNG — stale Zahlen im Nachfolge-Dossier (§11-Träger, gehört zu «Stale
  Doku-Köpfe»):** nach der Archivierung ist `bibliothek/normen/gesetzessammlung-rubrik-v.md` die
  einzige lebende Wissensablage der Rubrik V, steht aber unverändert auf dem Erstellungsstand
  17.6.2026 — «27 Bundesgesetze + 113 kantonale Erlasse» (Z.24 f.), «Bund-Breite: 27 Volltext + 30
  verifizierte Stubs = 57 Bund» (Z.146 f.), Status «ERSTRECHERCHE … Branch `feat/rechtssammlung`,
  ungepusht» (Z.9–11) und «LexWork = EIN Adapter deckt 73/113 Erlasse» (Z.141). Ist-Stand
  `public/normtext/register.json` (erzeugt 2026-07-27): **238 Bund + 1231 Kanton = 1469 Erlasse,
  davon 11 `nur-live-link`**; der Branch ist seit 19.6.2026 entfernt, die Rubrik ist prod-live.
  Zahlen, Statuszeile und Adapter-Quote nachführen (die inhaltlichen Regeln a–e bleiben gültig) —
  sonst führt der einzige verbliebene Träger überholte Mengen als Wahrheit.

## §13 · Begründungs-Absatz

*(→ `archiv/FAHRPLAN-BEGRUENDUNGS-ABSATZ.md`)*

- **BEGRUENDUNG B0-2-Rest + B1-Rest** (Beweis-Lücke, Stand 31.7.2026 nachgezählt):
  `scripts/golden-outputs.ts` trägt **14** `absatz:`-Goldens — es fehlen `allg`/`zust`/`rm`, weil
  diese drei ihr Ergebnis UI-seitig wickeln. Damit hängt zusammen, dass
  `AllgemeineFristForm.tsx:310` die Fristbeginn-Norm weiterhin über den **Magic-Index**
  `ergebnis.normverweise[0]?.artikel` zieht (Kritik-5 «Deploy-Bug-#5-Klasse» ist nur für
  `ZpoErgebnis`/`SchkgErgebnis` über das benannte Feld `fristbeginnNorm` geschlossen).
  Fix-Reihenfolge: benanntes Feld an `allgemeineFrist.ts`, dann Golden nachziehen (byte-Gleichheit
  des alten Ausdrucks als Beweis, Muster B1-1). Detail `archiv/FAHRPLAN-BEGRUENDUNGS-ABSATZ.md`
  B0-2/B1-1. `[OF]`
- **BEGRUENDUNG B4-1 · Zuständigkeit ohne prosa-tauglichen Ergebnissatz** (§8, bewusst nicht
  verdrahtet): `schkgZustaendigkeitBericht().ergebnis` ist ein telegrafisches «·»-Fragment
  (`src/lib/schkgZustaendigkeit.ts:377`, «Betreibungsamt Zürich · Betreibungsbegehren»),
  `strafZustaendigkeitBericht().ergebnis` = `forum.text` (satz-näher, inhaltsabhängig) — ein
  Rechtsschrift-Absatz darüber wäre irreführend. Vor der Verdrahtung braucht es je einen eigenen
  prosa-tauglichen Ergebnissatz im `lib` (Rechtsfrage-nah, nicht clean `[OF]`); die
  Zivil-Zuständigkeit ist über `ZustErgebnisEinleitung.tsx` bereits am Slot. Behandlung wie der
  Kosten-Entscheid. Detail `archiv/FAHRPLAN-BEGRUENDUNGS-ABSATZ.md` B4-1.
- **BEGRUENDUNG B4-2 · Kosten-Rechner = offener David-Entscheid** (Default gesetzt 28.6.2026,
  Bestätigung offen): Prozesskosten/Beurkundung/Notariat-Grundbuch bekommen **keinen**
  Rechtsschrift-Absatz, weil ihr `ergebnis`-Satz eine Kostenzeile ist, kein Rechtsschrift-Text
  (die `*Bericht()`-Adapter existieren, es fehlt nur die Prosa). Optionen: (a) separater
  «Kosten-Begründungs»-Satz im jeweiligen `lib` mit eigenem Titel, (b) bewusst ausnehmen
  (konservativer Default). Bei (a) muss für Prozesskosten der `zusatz`
  **Kostenrisiko/Instanzenzug/MwSt/Kaution** in die Quelle eingehen, sonst wird der Absatz
  irreführend unvollständig (§8). Der bestehende UI-Absatz von `GebvKostenForm` bleibt unberührt.
  `[D]`
- **BEGRUENDUNG B4-3 · EinfacheFrist / GrundbuchEintrag**: `GrundbuchEintragForm` nutzt
  `grundbuchgebuehrBericht()` heute nur für die PDF-`sections` (Z.81) → am `BegruendungSlot`
  trivial nachziehbar, Behandlung wie der Kosten-Entscheid. `EinfacheFristForm` mischt **vier**
  Engines (`allgemeineFrist`/`zpoFristen`/`bggVwvgFristen`/`schkgFristen`) ohne einheitliches
  Bericht-Resultat → erst klären, welcher Ergebnistyp den Absatz speist, sonst bewusst ausnehmen
  (§8). `[OF]`
- **BEGRUENDUNG PDF-Block = bewusst abgeschaltete Kapazität, kein toter Code** (David-Entscheid
  28.6.2026: «AUS — Ansatz in UI reicht»): `PdfDocConfig.begruendung` und der «Für die
  Rechtsschrift»-Block in `src/lib/pdf/pdfModel.ts:46/190–192` sind gebaut und getestet
  (`src/tests/pdfBegruendung.test.ts`), aber **keine** Form setzt das Feld — einziger Aufrufer ist
  der Test. Damit sind B3-2/B3-3 (Rollout) und der B5-2-UI↔PDF-Konsistenz-Wächter **entfallen,
  nicht offen**. Ein künftiger Hygiene-Durchgang darf die Kapazität weder als «unbenutzt»
  entfernen noch stillschweigend anschalten; Wiedereinschalten wäre ein eigener §6-deklarierter
  Schritt mit Snapshot je Form. Folgerichtig zu korrigieren: die ROADMAP-Zeile zu W1·1 beschreibt
  den Absatz noch als «(UI+PDF)», `ROADMAP-CHRONIK.md` → W1·1 nennt als «Nächster Schritt» den
  längst entschiedenen PDF-Block + Kopier-Hook.
- **BEGRUENDUNG · offene Formulierungs-/Abnahmefragen an David** (alle NIEDRIG, kein
  Handlungsdruck): (1) **Monats-/Jahresfrist-Satz** — `fristbeginnZusatz` erzeugt «Der Fristenlauf
  begann am <Ereignistag> (Art. 142 Abs. 2 ZPO)»; Abs. 2 regelt das Frist*ende*
  (gleichbezeichneter Tag), der Beginn steht in Abs. 1 → die Zitierung ist doktrinär lose, auch
  wenn die Engine-Sachfrage korrekt ist (Ereignistag = dies a quo seit BGer 5A_691/2023, belegt in
  `bibliothek/normen/zpo-fristen-bk-abgleich.md` R-142.3, Verdikt «Engine korrekt»; das
  Frist*ende* stimmt). Entscheid: Satz so lassen oder für Monats-/Jahresfristen schärfen. (2)
  `MAX_NORMEN=6` + «u. a.»-Kappung als sichtbares Kappungs-Signal beibehalten (Default) —
  pro-Engine-Konfiguration erst auf Bedarf. (3) SchKG-Zitierstil «Art. 31 SchKG i.V.m. …» im Feld
  `fristbeginnNorm` (Default: übernommen). (4) **B5-3** optionaler Playwright-Smoke auf «Absatz
  kopieren» je Rechtsgebiet — nie gebaut, in `e2e/` existiert kein Test darauf. `[D]` ausser B5-3
  `[OF]`

## §14 · BS-Vorbildkanton

*(→ `archiv/FAHRPLAN-BS-VORBILDKANTON.md`)*

- **BS-VORBILD D3 · Prüfstand-Ehrlichkeit im Gesetzeskorpus (nie gebaut, Befund 31.7.2026):**
  `public/normtext/confidence.json` deckt 150 Erlasse (115 kantonal), davon **5 von 859 BS**; der
  Wert wird in `src/` **nirgends geladen**, und alle 859 BS-Registereinträge tragen
  ununterscheidbar `status:'snapshot'` — ein ungeprüfter Auto-Import sieht damit aus wie ein
  abgenommener (§8). Offen: `check:confidence` (`scripts/normtext/check-confidence.ts`,
  `package.json:84`) auf alle 859 BS ausweiten, Ergebnis in `browse.ts` laden, Marker «automatisch
  importiert · fachlich nicht abgenommen» vs. «abgenommen» in SysZeile + Leser-Kopf. **Nicht
  deckungsgleich** mit dem Currency-Chip (`W2·13-KANTONE` K-2a = Geltungs-, nicht
  Extraktions-Konfidenz). Heimat `archiv/FAHRPLAN-BS-VORBILDKANTON.md` §D3. `[OF]`
- **BS-VORBILD D4 · 51 unsichtbare BS-Erlasse + fehlendes Abdeckungs-Drift-Tor (nie gebaut):** in
  Kraft stehende BS-Erlasse ohne Registereintrag werden in `scripts/normtext-snapshot.ts` still
  `continue`-übersprungen (**auch der `uebersprungen`-Pfad**, sonst bleibt die Lücke teils offen)
  statt als `status:'nur-live-link'` emittiert — Belegstand 31.7.2026: BS-Register **859/859
  `snapshot`, 0 `nur-live-link`**, obwohl die Mechanik für den Bund existiert
  (`scripts/fedlex-eli-aufloesen.ts:27`, `register.ts`, `ErlassKarte.tsx` nur-live-link-Pfad).
  Zusätzlich fehlt das Tor: `enumeriereKanton`-Sollzahl gegen die Registereinträge in `check:netz`
  warnen + datierten Discovery-Snapshot ins Repo schreiben, damit die wachsende Lücke (48→51)
  **diffbar** statt flüchtig auf der Konsole ist. `W2·13-KANTONE` K-2c (F44) deckt nur die
  Anzeige-Kontextzeile, **nicht** die Register-Emission und **nicht** das Tor. Randmaterie ⇒
  niedrig ranggewichten, damit Kern-Statute nicht verwässern (§8). `[OF]`
- **BS-VORBILD F7 · offener David-Entscheid «Randtitel bei aufgehobenen Artikeln»:** 70 von 962
  ganz aufgehobenen Artikeln tragen einen Randtitel, die übrigen nicht — quellenbedingt, visuell
  uneinheitlich. Quellentreu belassen ist nach §7 vertretbar; vor einer Vereinheitlichung oder
  Ausgrauung ist **Davids Entscheid einzuholen, nicht eigenmächtig zu handeln**. Heimat
  `archiv/FAHRPLAN-BS-VORBILDKANTON.md` §F7 (Befund 19 der 2. Ultra-Check-Liste).
- **BS-VORBILD N12 · strukturierte `erlassart` fehlt (Filter unbrauchbar):** die Erlassart wird
  heute allein über die Titel-Regex `istVerordnung` geraten
  (`src/pages/gesetze-teile/geteilt.tsx:22`, `/verordnung|reglement/i`), und `rechtsgebiet` ist
  bei **allen 859 BS-Erlassen** `'oeffentlich'` — als Ordnungsmerkmal wertlos. Offen: `erlassart`
  (Gesetz/Verordnung/Staatsvertrag/Konkordat/Tarif) im Generator aus Titel + SR-Systematik
  ableiten und als Filter-Chip in der Kanton-Ansicht anbieten (würde die BS-Liste ~halbieren).
  Komfort, nachrangig; Heimat `archiv/FAHRPLAN-BS-VORBILDKANTON.md` §N12/§N5-2.

## §15 · Code- & Bibliothek-Hygiene

*(→ `archiv/FAHRPLAN-CODE-HYGIENE.md`)*

- **HYGIENE — Abnahme-Dossier-Drift + Drift-Guard-PR** *(H-5/B29-Restposten, Befund 12.7.2026)*:
  der `abnahme:dossiers`-Probelauf zeigte **5 gedriftete Dossiers** (ARBEITSVERTRAG · EHESCHUTZ ·
  MIET · SCHEIDUNG ×2); die Regeneration wurde bewusst NICHT mitcommittet, weil sie eine eigene
  Beweisklasse ist (§14.2). Offen sind beide Hälften: `abnahme/dossiers/*` regenerieren **und**
  den im Plan vorgesehenen Drift-Guard (`vite-node scripts/abnahme-dossiers.ts` + `git diff
  --exit-code`) als eigenes kleines Tor bauen — heute existiert nur `npm run abnahme:dossiers`
  (`package.json` Z.119), kein `check:*`. Plan-Bedingung: nur wenn die Regeneration < 60 s läuft,
  und als **eigener kleiner PR** mit einmal rot gezeigtem Tor (§6.7). Drift-Stand am 31.7.2026
  nicht nachgemessen (Nur-Lese-Verdikt). `[OF]`
- **HYGIENE — `bund-stubs.generated.ts` nie mit Netz regeneriert** *(H-8/B22-Nachtrag)*: der
  Zyklen-Umbau passte korrekt das Generator-Template `scripts/normtext/bund-stubs-generieren.ts`
  an, konnte `src/lib/normtext/bund-stubs.generated.ts` aber mangels Fedlex-SPARQL-Zugriff nicht
  echt neu erzeugen (ein Sandbox-Testlauf leerte den einzigen PrHG-Eintrag auf 0); die
  Import-Zeile wurde 1:1 dem fixierten Template-Output nachgezogen, der Rest blieb byte-identisch.
  Die Datei ist seither unberührt (letzter Commit `a5ed2cfcb`, 13.7.2026). **Bei der nächsten
  echten Regenerierung mit Netz verifizieren, dass der Output unverändert bleibt** — eine
  Abweichung wäre ein stiller Template-Fehler, den kein Tor fängt.
- **HYGIENE — SG Stiftung: Zeilenminimum 330 vs. Code-Sockel 385** *(Rand-Befund der
  H-7-Gegenprüfung 12.7.2026, **vorbestehend**, nicht vom Staffel-Generator verursacht)*: GebT sGS
  821.5 Nr. 60.01 nennt für die Stiftungsurkunde amtlich «330 bis 3850»,
  `src/data/tarif/beurkundung.ts` startet über die «wie 60.13»-Ansätze bei 385; `origin/main` trug
  385 identisch ⇒ kein H-7-Regress, aber ein offener Tarif-Befund. Beleg
  `bibliothek/register/gegenpruefung-register.md` Z.87. Klärung am Original (LexWork-Fassung) und
  eine allfällige Korrektur liegen im Risikopfad `src/data/tarif` ⇒ `QS-GP`-Gegenprüfung Pflicht.
  `[OF]`
- **HYGIENE — ESLint `@typescript-eslint/consistent-type-imports` bleibt uneingelöst**: der
  repo-weite Autofix-Sweep war ausschliesslich wegen der PR-Kette #164/#165 deferiert (Plan-Regel
  G2); die Kette ist längst gelandet, die Regel steht bis heute nicht in `eslint.config.js`
  (verifiziert 31.7.2026, repo-weiter Grep: kein Treffer ausserhalb des archivierten Fahrplans).
  Entweder als **warn-only** einführen (eigener PR, Autofix-Churn nie mit einer anderen
  Beweisklasse mischen) oder den Punkt ausdrücklich als gegenstandslos abschreiben.

## §16 · Gesetzesdarstellung Bund

*(→ `archiv/FAHRPLAN-GESETZESDARSTELLUNG-BUND.md`)*

- **Tabellen-Regelwerk T-A…T-F bleibt materiell in Kraft (§5-Merker, kein Bau-Schritt):** die
  kanonische SSoT der Tabellen-Normalisierung (Anhang 1, Konflikte K1–K4, Regeln T-A1–A9 · T-B1–B6
  · T-C1–C7 · T-D1–D7 · T-E1–E7 · T-F1–F9) liegt ab 31.7.2026 in
  `archiv/FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` und gilt fachlich unverändert fort. Sie ist von
  aktivem Bestand referenziert: `scripts/normtext/tabelle-normalisieren.ts` Z.25 («Regeln A/B/E»),
  `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` Z.5-11/85, `DESIGN-REGLEMENT-NORMTEXT.md` §4a +
  Korrektur-Kasten, und sie ist die Detailquelle für `W2·5j-TABELLEN` beim Entparken. Der
  Übernahme-Auftrag «A/B/F → STUFE2» (Anhang 1, Kopf) ist bis heute **nicht** vollzogen — der
  STUFE2-Fahrplan verweist nur; C/D **sind** in `DESIGN-REGLEMENT-NORMTEXT.md` §4a angekommen.
  Entweder A/B/F nachziehen oder die Verweis-Lösung ausdrücklich als gewollt festhalten. `[OF]`
- **TABELLEN Legacy-Fallback-Fläche (Nachmessung 31.7.2026, überholt die 9er-Liste von 30.6.):**
  `check:tabellen` ist für Bund blockierend, wertet aber nicht-kanonisierte Blöcke als «ehrlichen
  Legacy-Fallback» (T-E4) und zählt sie nur — heute **146 Legacy-`mehrspaltig`-Blöcke in 40
  Bund-Dateien** (gegen 383 kanonische; Spitzen VVV 19 · VTS 13 · VZV 12 · LRV 11 · CHEMRRV/VVEA
  je 10 · RVOV/SSV je 8) und **59 in 28 Kanton-Dateien** (gegen 71 kanonische; BS-772.420 14 ·
  AR-833.151/BS-786.150 je 5). Das im Fahrplan genannte Residuum (AHVV Art. 52 Caption-Lücke;
  BV.196 · DBG.36 · FZA.10 · VGKE.4 · VTS.94 · GEBV Art. 37) ist darin nur noch der historische
  Kern — der Bund-Korpus wuchs seither von 28 auf 218+ Erlasse. Je Block entscheiden: kanonisieren
  (T-A2–A7) oder als ragged/Prosa begründet belassen (T-E4/T-E6, §8-ehrlich). Detail
  `archiv/FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` M10 + Anhang 1 (A)/(E). `[OF]`
- **TABELLEN §7-Faithfulness im Legacy-Render-Pfad (Befund 31.7.2026, Code + Korpus belegt):**
  `LegacyMehrspaltigeTabelle` (`src/components/normtext/ArtikelBody.tsx` Z.393-430) schickt in
  Z.425 **jede** Zelle durch `gruppiereTausender`; dessen Pass 2
  (`src/lib/normtext/darstellung.ts` Z.180-195) gruppiert jeden ≥4-stelligen Ziffernlauf. Über die
  oben gezählten Legacy-Blöcke tragen **1948 Zellen eine nackte Jahreszahl** (z.B.
  `bund/APOSTILLE/scope_u1`: 2004 · 1996 · 1981 · 1988) → angezeigt als «2'004». Exakt dieselbe
  Klasse ist für Kanton bereits als §7-Bug belegt und geheilt worden — aber nur für die 6
  kanonisierten Klasse-A-Dateien (`FAHRPLAN-TARIF-TABELLEN-STUFE2.md` Z.71-84, BS-154.810 §19/§20
  «1937»→«1'937»). Der kanonische Pfad ist korrekt (typgesteuert, `ArtikelBody.tsx` Z.380, T-C5) —
  der Defekt lebt allein im Legacy-Zweig. Zwei Wege, beide zulässig: Legacy-Blöcke kanonisieren
  **oder** die Gruppierung im Legacy-Renderer auf Geld-Kontext einengen (Muster
  `gruppiereBetraege`, `darstellung.ts` Z.197-213). Reine Darstellung, kein Snapshot-Wert
  betroffen (§7: Snapshot bleibt byte-treu). Risiko-Pfad-nah bei Kanonisierung ⇒ `QS-GP`. `[OF]`
- **TABELLEN Validator-Scharfschaltung + Schema-Finalisierung (Umsetzungsplan Schritt 8, nie
  ausgeführt):** `scripts/normtext/check-tabellen.ts` Z.104-120 fährt Kanton weiterhin im
  **Report-Modus** (warnend), Bund blockierend — so vorgesehen «bis der Kanton-Generator-Pfad
  nachgezogen ist»; der Nachzug ist seit 5.7.2026 nur für 6 von 34 Kanton-Dateien erfolgt. Ebenso
  steht der als deprecated geplante Alias `kopf?` unverändert in `src/lib/normtext/typen.ts`
  Z.79-88. Beide Punkte hängen an der Legacy-Fläche oben und sind erst danach schaltbar; bis dahin
  ist der Ist-Zustand bewusst und dokumentiert, nicht vergessen. `[OF]`
- **Abnahme-Warteschlange, Ergänzung: Reader-Darstellung Bund (M9/M10 visuell).** Der Fahrplan
  führt für M9 (aufgehobene Artikel bündig auf einer Ebene) und für die neu kanonisierten Tabellen
  ausdrücklich eine **visuelle Schluss-Abnahme bei David** (`abnahme-david-selbst`) — sie steht
  bis heute in keiner Warteschlange. Kein Bau-Schritt, kein Blocker: Sichtprüfung am Reader
  (Leitfall GebV SchKG Art. 20 · ein aufgehobener Artikel · ein Legacy-Fallback-Block), Rang 3
  (Beträge). Detail `archiv/FAHRPLAN-GESETZESDARSTELLUNG-BUND.md` M9/M10.

## §17 · Gesetzestext-Popup (Norm-Vorschau)

*(→ `archiv/FAHRPLAN-GESETZESTEXT-POPUP.md`)*

- **POPUP Volltext-Restlücken** (Ziel des Plans «alle Tarif-Quellen zeigen Volltext», Mess-Stand
  17.6.2026: 219/253): ohne strukturierten Snapshot bleiben die nurPdf-/Nicht-LexWork-Erlasse **SG
  941.12 · SG 914.5 · OW 210.32 · AR 153.2 · NW 265.51** sowie 14 Anhang-/Tarif-Ziffer-Tokens
  (**BE 154.21** Ziff. 1.6/2.1/3.1.1/3.2/3.3.1/3.4/3.5 · **SG 914.5** Nr. 10.01/11.01/60.01.01 ·
  **GL III B/3/2** Ziff. 1.1/8.1 · **NW 265.51** Nr. 2.6.1.1) und das Fremd-Erlass-Zitat **SH
  211.433 § 13** (unter der quelleUrl von 221.101). Jede Lücke ist mit Grund deklariert in
  `scripts/normtext/check-vollstaendigkeit.ts` (`BEKANNTE_LUECKEN` / `BEKANNTE_LUECKEN_HTMZH`) und
  zeigt im Popover den ehrlichen Live-Link statt Text (§8). Der Anhang-Segmentierer wurde für
  LexWork/HTM **bewusst nicht** verdrahtet — BE 154.21 führt den Tarif-Anhang nur als Querverweis
  im Artikeltext, ein Segmentierer griffe die Verweiszeile statt des Tarifs (§1: ehrliche Lücke
  vor verstümmeltem Gesetzestext). Schliessen heisst: je Layout ein `PdfProfil` in
  `scripts/normtext/adapter-pdf.ts` ergänzen (Qualitäts-Tor: kein plausibler Artikel → nicht
  speichern) und den Eintrag aus der Lücken-Liste streichen. Heimat
  `archiv/FAHRPLAN-GESETZESTEXT-POPUP.md` §HANDOVER Schritt 3 +
  `bibliothek/normen/norm-vorschau-snapshot-system.md` §Genuine Lücken / §Regel PDF. `[OF]`

## §18 · Startseite V3 + Branding I2

*(→ `archiv/FAHRPLAN-STARTSEITE-V3.md`)*

- **STARTSEITE-V3 Kontrast-Rest «Input-Ruhe-Grenze» (Auflage §8/§9 Ziff. 8 nicht erfüllt,
  deklariert abgehakt 3.7.2026):** die Ruhezustand-Grenze des Hero-Suchfelds auf dem Brass-Wash
  erreicht die 3:1-Nicht-Text-Schwelle (WCAG 1.4.11) in KEINEM Modus — Rand `--line` kompositiert
  1.22:1 hell / 1.48:1 dunkel, Füllung `well` gegen `brass-100` 1.06:1 / 1.28:1; der
  aktive/fokussierte Zustand besteht dagegen klar (`--focus` 4.63:1 / 5.39:1) und axe ist grün
  (critical/serious = 0). Als «strukturell, ausweich-unlösbar, nicht-regressiv» dokumentiert, weil
  kein heller eingabetauglicher Flächen-Token 3:1 gegen `brass-100` erreicht und `lc-input`
  app-weit geteilt ist. **Der einzige Beleg liegt gitignored**
  (`abnahme/startseite-v3/KONTRAST-PROTOKOLL.md`, Zeilen f/g/h + Befund-Abschnitt) — bei Verlust
  der Arbeitskopie ist die Messung weg. Zu tun: entweder beim nächsten `lc-input`-Anfassen eine
  echte Rand-Verstärkung auf Brass-Flächen (dunklerer Grenz-Token nur im Hero-Kontext) oder die
  Ruhe-Grenze als bewusste, begründete Ausnahme ins DESIGN-REGLEMENT heben; drittens greift
  ersatzweise der dokumentierte Ein-Klassen-Fallback `HERO_FLAECHE = 'bg-surface'`
  (`src/components/start/Hero.tsx:18`). Detail `archiv/FAHRPLAN-STARTSEITE-V3.md` §8/§9 Ziff. 8.
  `[OF]`
- **STARTSEITE-V3 Abnahme-Mappe — Detail-Verweis** (am W2·5c-Schritt und in der
  Abnahme-Warteschlange mitführen): Davids spätere Sichtung läuft über `abnahme/startseite-v3/`
  (**gitignored, nur lokal**: `ABNAHME-MAPPE.md`, `BASELINE.md`, `KONTRAST-PROTOKOLL.md`,
  Screenshot-Serien `baseline`/`s2`/`s3`/`s4`/`final`, Desktop 1280 + Mobil 390 × hell/dunkel).
  Zwei Schalter warten dort auf ein Wort: **Wash-Ton-Veto** ⇒ Ein-Klassen-Rückstellung
  `bg-brass-100` → `bg-surface` in `src/components/start/Hero.tsx:18` (kein weiterer Umbau) und
  die **V3-Cockpit-Fragen** (#3 Umplatzierung der Zuletzt-Rubrik · #9 Hero-Suche-Vereinheitlichung
  · #55 hide-on-scroll-Header) aus `FAHRPLAN-UI-NAVIGATION.md` §Y Ziff. 3 — deren Optionen gehören
  in dieselbe Mappe, nicht vorab gebaut. Zeitsperre gilt: aufreihen, nicht drängen. Detail
  `archiv/FAHRPLAN-STARTSEITE-V3.md` §13.

## §19 · Tarif-Tabellen Stufe 2

*(→ `archiv/FAHRPLAN-TARIF-TABELLEN-STUFE2.md`)*

- **SZ-280.411 Absatz-/Überschriften-Klebeklasse (pdfjs, pre-existing, von F19 NICHT gedeckt):**
  im regenerierten Snapshot ist **§18 Abs 2 in Abs 1 verklebt** und der Übergangsbestimmungs-Titel
  sitzt in Abs 3; **Abschnitts-Überschriften** («V. Ausnahmen» …) kleben generell an Absatz-Enden.
  `FAHRPLAN-KANTONE.md` K-7d/**F19** löst ausdrücklich nur die **Glyph-Umordnung** (x-Sortierung,
  drei Fixture-Stellen «Fr. 1 - 000.bis» / «zua- m chen» / «e-B zirksgericht») — die
  **Absatz-Segmentierung + Überschriften-Abgrenzung im PDF-Adapter** bleibt offen: entweder als
  F19-Teilauflage mitnehmen oder als eigene Klasse erheben (Muster: F22/TI-Absatz-Marker,
  F18-Randtitel-Abgrenzung). Risiko-Pfad (Extraktion) ⇒ Opus + `check:gegenpruefung` +
  pdfplumber-Gegenprobe. Detail `archiv/FAHRPLAN-TARIF-TABELLEN-STUFE2.md` §Nachzug SZ-280.411.
  `[OF]`
- **SG-2935 `art_17` Tabellen-Schnitt (kosmetisch, kein Wortlaut-Verlust):** eine Prosa-Notiz
  zwischen Tarif-Position **26.01 und 26.02** bricht den Füllpunkt-Block, wodurch **26.02 samt
  intaktem «50.–» in den `nachtext`** statt in die Tarif-Tabelle wandert — die Gebühr bleibt
  lesbar, die Tabelle ist aber unvollständig. NICHT identisch mit den 32 §1-konservativ als
  Plaintext belassenen SG-Restblöcken (dieser Block IST tableisiert, nur falsch geschnitten). Beim
  nächsten SG-Anfassen (K-G4-Tranche) mitnehmen **oder** ausdrücklich als §1-konservativ belassen
  quittieren. Detail `archiv/FAHRPLAN-TARIF-TABELLEN-STUFE2.md` §Schritt 3, Nebenbefund.

## §20 · UX-Punkteliste

*(→ `archiv/FAHRPLAN-UX-PUNKTELISTE.md`)*

**Zählung (31.7.2026, R2-22):** **2 Restpunkte** (A3-Abnahme · E-Optional), **dazu 1
Statusbefund** (der dritte Spiegelstrich stellt nur fest, dass `W2·9` auf genau diese zwei
verengt ist — er ist kein eigener Bau-Posten). Die ROADMAP-Zeile nennt darum «2 Restpunkte
+ 1 Statusbefund»; die frühere Angabe «3 Restpunkte» widersprach dem Verengungs-Satz zwei
Sektionen weiter oben.

- **UX-PUNKTELISTE A3 · Betreibungskosten-Kacheln, Anweisung und Umsetzung zeigen in verschiedene
  Richtungen** *(Anw. 18, David-Abnahme offen seit 26.6.2026)*: verlangt war «Kacheln einer Reihe
  gleich hoch» (`auto-rows-fr` + `h-full`), gebaut wurde in
  `src/components/forms/GebvKostenForm.tsx:97` `items-start` — also ausdrücklich **ungleiche**
  Höhen; der Commit `3ccfd9d7e` deklariert das selbst offen («Felder bereits zeilen-aligned an
  Desktop/Tablet verifiziert — zur Abnahme geflaggt»). Entweder David nimmt die abweichende Lösung
  ab oder `auto-rows-fr`/`h-full` nachziehen. Reine Darstellung (§3), kein Risiko-Pfad. Detail
  `archiv/FAHRPLAN-UX-PUNKTELISTE.md` A3.
- **UX-PUNKTELISTE E-Optional · globaler Schalter «aufgehobene Normen ausblenden» nie gebaut**
  *(Batch E «Optional», verzahnt mit C2)*: das Ansicht-Menü des Lesers kennt nur
  `linien|fussnoten|verweise|leitfaelle` (`src/pages/gesetz-leser/leserOptionen.ts:65`,
  `LeserAnsichtMenu.tsx`); aufgehobene Artikel sind heute fix eine gedämpfte Einzeile mit
  AS-Aufhebungsnotiz (`ArtikelLeser.tsx:431/450`), ohne Ausblende-Option. Entweder als fünftes
  `OptFeld` nachziehen **oder** bewusst streichen mit der Begründung, dass eine ausgeblendete Norm
  dem Leser eine Lücke verschweigt (§8). Detail `archiv/FAHRPLAN-UX-PUNKTELISTE.md` Batch E,
  letzter Spiegelstrich. `[OF]`
- **UX-PUNKTELISTE · `W2·9` ist gegenstandslos geworden** *(Befund 31.7.2026)*: Der Schritt
  verlangt eine Mapping-Tabelle «alt-Punkt → Code-Pfad → Status», *bevor* die Restpunkte **C2/C5**
  angefasst werden — beide sind längst gebaut (C2 = `artikelGanzAufgehoben` + Aufhebungsnotiz,
  `ArtikelLeser.tsx:169/450`; C5 = Ingress/Erlassformel als M5,
  `scripts/normtext/kopf-extrahiere.ts` + `parts/ErlassKopfBlock.tsx`). Von den 20 Anweisungen
  sind 18 live, Batch D ist über IV-1/IV-2 gemappt, Batch F über
  `archiv/FAHRPLAN-KANTONALE-ENTSCHEIDE.md`. **Verbleibender Restbestand = genau die beiden Zeilen
  oben (A3-Abnahme, E-Optional).** `W2·9` darum abhaken oder auf diese zwei Punkte verengen; der
  Datei-Kopf «Status: reiner Plan. Noch nichts umgesetzt.» ist seit dem 26.6.2026 stale und bleibt
  im Archiv nur historisch stehen — die Status-Wahrheit trägt die Session-Karte
  `archiv/STRUKTUR-SESSIONKARTEN.md` («16/20 live + D-Teil + 2 Pläne»).

---

## §21 · ROADMAP-Spec-Nachzug `W2·9` / `W3·13` (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md` — AP-11 rückwirkend angewandt (ROADMAP-Diät Welle 3, 4.8.2026). In der
ROADMAP bleiben je Schritt Titel, `@meta`, Kurzabsatz und Pointer. Steuert nicht — Spec-Heimat.*

### §21.1 `W2·9` — Zeiger-Wortlaut *(→ Bau-Spec: §20 dieser Datei)*

> die Archivdatei `archiv/FAHRPLAN-UX-PUNKTELISTE.md` trägt die überholte
> 20-Punkte-Liste). Herkunft der Verengung und die Abgrenzung zur Bedienungsanleitung (Träger sind
> `W2·16-INVENTAR`/`W2·16-ANLEITUNG`, nicht dieser Schritt) → `ROADMAP-CHRONIK.md` → W2·9 (3.8.2026).

### §21.2 `W3·13` — Zeiger-Wortlaut *(→ Bau-Spec: §10 + §11 dieser Datei)*

> *(Zeiger 31.7.2026
> umgestellt, Endprüfungs-Fund R2-14/R2-19: `fahrplan:` zeigte auf `archiv/FAHRPLAN-VERTRAGS-VARIANTEN.md`
> und lieferte damit die archivierte Vollfassung statt der massgeblichen Restpunkte — dieselbe
> Lage und dieselbe Begründung wie bei `W2·9`; §0 der Archiv-Restpunkte erklärt die archivierten
> Köpfe ausdrücklich für teilweise stale.)*
