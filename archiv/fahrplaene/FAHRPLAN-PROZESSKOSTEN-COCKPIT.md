# ARCHIV — ausgelagerte Abschnitte aus `fahrplaene/FAHRPLAN-PROZESSKOSTEN-COCKPIT.md`

**Herkunft.** Plan-Neuschnitt 29.8.2026 (Auftrag David): je Fahrplan bleiben AKTIV nur der
Kopf und die §§, auf die ein OFFENER ROADMAP-Schritt zeigt. Alles Übrige steht hier —
**wörtlich, ungekürzt, nicht nachgeführt**. Wer einen dieser Abschnitte wieder braucht,
zieht ihn von hier zurück in die aktive Datei, statt ihn neu zu schreiben.

---

## Die Zielmatrix
**Kanton × Verfahrensart × Spruchkörper/Instanz × Materie → Gerichtskosten +
Parteientschädigung + Kostenrisiko**, je mit amtlichem Tarif-Link, Stand,
Ermessenskriterien und Norm (ZPO + kantonal).

- **Verfahrensart:** Schlichtung · vereinfacht · ordentlich · summarisch
- **Spruchkörper/Instanz:** erstinstanzlich (Einzel-/Kollegialgericht) ·
  **Handelsgericht** (ZH/BE/AG/SG = einzige Instanz → BGer) · weitere
  einzige-Instanz/Direktklage (Art. 5/6/8 ZPO) · **Rechtsmittel** (Berufung/
  Beschwerde, obere kantonale Instanz) · Bundesgericht (Verknüpfung BGG-Rechner)
- **Materie:** für Kostenlosigkeit (Art. 113/114 ZPO) + Sondertarife

## Etappen

**I1 — Basis (FERTIG, live):** erstinstanzliche Entscheidgebühr + Grund-
Parteientschädigung aller 26 Kantone (amtlich doppelt verifiziert), Art. 113/114-
Kostenlos-Vorschalter, Schlichtungspauschale ehrlich offengelegt, interkantonale
Vergleichstabelle. Engine `lib/prozesskosten.ts`, Rechner `/rechner/prozesskosten`.

**I2 — Verfahrensart & Instanz (Recherche läuft, `wbqdyap3x`):**
- Schlichtungsgebühren je Kanton (Art. 95 II lit. a; oft Bruchteil der GK).
- Reduktionsfaktoren vereinfacht/summarisch (GK + Parteientschädigung).
- Rechtsmittelgebühren obere kantonale Instanz (Berufung/Beschwerde).
Modelliert als **Modifikatoren** auf den verifizierten Basistarif (Faktor-Spanne
bei Ermessen). Engine: `verfahren` + `instanz` als Eingaben.

**I3 — Handelsgericht & besondere Konstellationen:** ZH/BE/AG/SG Handelsgericht
(einzige Instanz, Tarif-Spezifika gezielt verifiziert, Instanzweg → BGer);
Art. 5/6/8-ZPO-Konstellationen, wo kostenrelevant.

**I4 — Ermessenskriterien:** je Tarif die Bemessungskriterien der kantonalen
Norm (z. B. § 2 GGR BS: Bedeutung/Zeitaufwand/Komplexität/Streitwert) als
`kriterien`-Feld; Anzeige immer dann, wenn das Ergebnis eine Spanne ist (§8).

**I5 — Kostenrisiko (Art. 106–109 ZPO):** Verteilung nach Obsiegensquote →
„Wenn Sie zu X % obsiegen": eigene + zugesprochene/zu tragende Gerichtskosten
und Parteientschädigung. Macht aus dem Tariflook-up den eigentlichen
Kostenrisiko-Rechner. Rein bundesrechtlich/deterministisch (vor §7-Verifikation).

**I6 — Vollständigkeit der Kostenposten (Art. 95/98) — FERTIG (15.6.2026):**
Engine-Funktionen `berechneKostenvorschuss` (Art. 98: ½ GK als Regel; voller
Vorschuss in Schlichtung/summarisch/Rechtsmittel, Art. 98 II — summarisch mit
offengelegten Ausnahmen; BGer = Art. 62 BGG voll) · `berechneMwstParteientschaedigung`
(Normalsatz 8,1 % seit 1.1.2024, MWST_NORMALSATZ_PROZENT als §5-SSOT in
`data/tarif/typen.ts`; fallabhängig, nur auf Schalter, kantonale Behandlung
inkl./zzgl./ohne offengelegt) · `WEITERE_KOSTENPOSTEN` (Auslagen/Beweis-/
Übersetzungs-/Kindesvertretungskosten Art. 95 II c–e / III a + unentgeltliche
Rechtspflege Art. 117–118/123 als ehrlicher Hinweis). UI: Vorschuss-Kachel,
MwSt-Schalter (+Permalink `mw`), aufklappbare «Weitere Kostenposten». 11 neue
Tests (handgerechnet), Gate grün, golden byte-gleich. Nichts trägt `geprüft`.

**Schlichtungstarif — FERTIG (15.6.2026):** eigene Datenschicht
`src/data/tarif/schlichtung.ts` (alle 26 Kantone, vermögensrechtliche
Schlichtungsgebühr wörtlich aus `bibliothek/kosten/schlichtungsgebuehren-kantone.md`,
zweifach geprüft 5.6.2026). Engine nutzt in der Schlichtungsphase nun den echten
Schlichtungstarif (beziffert) statt «nicht beziffert»; VD/NE forfaitaire
(deterministisch), übrige Ermessensrahmen; FR/BS/AG `recherche`-Caveat. Art.-113-
Kostenlos-Vorschalter bleibt vorrangig.

**I7 — Instanz-Akkumulation — FERTIG (15.6.2026):** `berechneInstanzenzug`
summiert GK + Parteientschädigung über die gewählten Stufen (Schlichtung →
1. Instanz → Rechtsmittel → BGer); nicht bezifferte Stufen (aufwandbasiert) als
Untergrenze ausgewiesen. UI: aufklappbare Stufen-Tabelle + Gesamtzeile.

**I8 — Mandatstauglichkeit — FERTIG (15.6.2026):** `prozesskostenBericht` bildet
das Kostenbild (GK + PE + Vorschuss + optional MwSt/Kostenrisiko/Instanzenzug)
auf `Berechnungsergebnis` ab → zentraler PDF-Export (`PdfExportButton`) mit
Aktenzeichen (`AktenzeichenFeld`); Permalink bereits vorhanden.

**I9 — Weitere Tarif-Assets (Burggraben):** Notariats-/Grundbuchgebühren,
GebV-SchKG-Verknüpfung (bestehender Betreibungskosten-Rechner), Schlichtungs-
kosten-Sonderfälle — wo deterministisch und praxisrelevant.
**TEIL ERLEDIGT (15.6.2026):** Schlichtungskosten als eigene Datenschicht (26 Kt,
s. oben) · GebV-SchKG-Querverweis im Cockpit auf `/rechner/betreibungskosten`
(Art. 16 SchKG, vorbehalten in Art. 96 ZPO). OFFEN: Notariats-/Grundbuchgebühren.

**Zusätzlich gebaut (15.6.2026, über den ursprünglichen Fahrplan hinaus):**
Schlichtungstarif (26 Kt) · Modus nicht vermögensrechtlich (26 Kt, GK/PE/Schlichtung) ·
Sicherheit Art. 99 ZPO · Handelsgericht (Art. 6) · Verteilung Art. 106–109
(Verfahrensausgang) · unentgeltliche Rechtspflege Art. 117 ff. (Kostenrisiko-Schalter).
Alle Norm-Anker recherche-belegt; Art. 99/118/123/6 frisch am Fedlex verifiziert.

## Reihenfolge
I2 (sobald Recherche zurück) → I4 (Kriterien, mit I2) → I3 (Handelsgericht) →
I5 (Kostenrisiko, eigene §7-Grundlage Art. 106 ff.) → **I6 (fertig)** → I7 → I8 → I9.
Je Etappe: Gate grün, §9-Bug-Check, Deploy auf frisches Ja. Nichts trägt
`geprüft` bis zu Davids Wort-für-Wort-Abnahme (§7/§8).

---

## §Verzahnung — Frist × Kosten als Praxis-Workflow (`W1·5-PRAXIS`, Ideen-Intake 20.7.2026)

> **ROADMAP-Schritt:** `W1·5-PRAXIS` (Welle 1 · 5-PRAXIS). Dieser Abschnitt ist die aus der
> ROADMAP verlinkte Detailquelle (§14.1) — er ist **kein zweiter Einstieg**.
>
> **Abgrenzung zu `W1·4` (bindend, §14.3):** `W1·4` ist der **Cockpit-Restbau** (Etappen I2–I9
> oben), `parked` auf der Recherche `wbqdyap3x` (Schlichtungs-/Reduktions-/Rechtsmittel-
> Modifikatoren). `W1·5-PRAXIS` ist die **cross-Rechner-Verzahnungsschicht darüber** und
> unblockiert. Beide fassen **nicht dieselben Dateien** an: I2–I9 arbeiten in
> `src/lib/tarif`/`src/data/tarif` (Rechen-/Normschicht), `W1·5-PRAXIS` ausschliesslich in der
> Orchestrierungs-/Prefill-Schicht. Wird diese Grenze im Bau verletzt, ist es eine
> `W1·4`-Änderung und fällt unter deren Blocker.

### V-1 · Was verkettet wird (Datenfluss, keine neue Rechenregel)

```
Streitwert (streitwert.ts, staffel.ts)
      └─→ Gerichtskosten + Parteientschädigung (prozesskosten.ts, Art. 95 ZPO, 26 Kantone)
Entscheiddatum × Kanton × Gerichtsferien (zpoFeiertage.ts, fristenEngine.ts)
      └─→ Rechtsmittelfrist ──→ derselbe Kostenfluss  ──→ icsExport.ts
```

**Kein Rechenfundament wird angefasst.** Jede Zahl entsteht weiterhin in der jeweiligen Engine;
diese Einheit reicht Ergebnisse **weiter** und füllt Formulare **vor**. Das ist der Grund, warum
sie `golden byte-gleich` bleiben muss: ändert sich ein Wert, war es keine Verkettung, sondern ein
Eingriff in die Logikschicht (§1/§3).

### V-2 · Trägerbestand (verifiziert, Repo-Stand 20.7.2026)

| Baustein | Fundort | Rolle in der Kette |
|---|---|---|
| Prozesskosten (Art. 95 ZPO, 26 Kt.) | `src/lib/tarif/prozesskosten.ts` | Kosten-Senke |
| Streitwert / Staffel | `src/lib/tarif/streitwert.ts`, `staffel.ts` | Kosten-Quelle |
| Fristen-Engine + Fachlader | `src/lib/fristenspiegel/fristenEngine.ts` | Frist-Quelle |
| Feiertage/Computus (BJ-verifiziert) | `zpoFeiertage.ts`, `schkgFeiertage.ts` | Frist-Grundlage |
| Prefill/Permalink | `src/lib/rechnerPermalinks.ts`, `src/lib/permalink.ts` | **die Verkettung** |
| Kalender-Export | `src/lib/icsExport.ts` | Ausgang |

### V-3 · Offene Formfrage (Entscheid beim Bau, kein Blocker)

Eigene «Kosten-Cockpit»-Fläche **vs.** Prefill-Deep-Links zwischen den bestehenden Rechnern.
Empfehlung: **Deep-Links zuerst** — sie sind additiv, brauchen keine neue Seite, keinen neuen
Zustand und lassen sich ohne golden-Risiko zurücknehmen. Eine eigene Fläche erst, wenn die
Deep-Link-Variante nachweislich zu viele Klicks kostet.

### V-4 · Bewusst NICHT

Keine Mandats-/Falldatei-Persistenz (Werkzeuge bleiben zustandslos, CLAUDE.md §5) · keine
Fristenüberwachung und kein Anschein davon (§8) · keine neuen Tarif-Parameter (die gehören in
`W1·4`/I2) · kein Eingriff in `src/lib/tarif` oder `src/data/tarif`.

### V-5 · DoD

§6-/§9-Tore grün · **golden byte-gleich** (Engines unberührt — das ist der Beweis, dass nur
orchestriert wurde) · `check:gegenpruefung` nur, falls doch ein Risiko-Glob berührt wird; sauberes
Chaining vermeidet das. Trailer `Roadmap: W1·5-PRAXIS`.

---

## §2 · ROADMAP-Spec-Nachzug `W1·4` (wörtlich verschoben 4.8.2026, ROADMAP-Diät Welle 3)

*Herkunft: `ROADMAP.md`, Welle 1, Schritt `W1·4` — AP-11 rückwirkend angewandt (ROADMAP-Diät
Welle 3, 4.8.2026). In der ROADMAP bleiben Titel, `@meta`, die Reihenfolge a→b→c, der Slot-Vermerk
und der Pointer hierher. Steuert nicht — Spec-Heimat. **→ Bau-Spec: §1 dieser Datei.***

> **Anlass der Entparkung:** der Blocker `wbqdyap3x` trug seine eigene Auflösung im Register —
> «kein David-Gate, die Recherche ist `[OF]` und selbst Teil von W1·4; sonst bleibt der Hauptmoat
> dauerhaft geparkt». Er ist gestrichen; die Recherche ist jetzt **Arbeitsschritt (a)** dieses Schrittes.
> **Reihenfolge:** (a) Recherche Schlichtungs-/Reduktions-/Rechtsmittel-Modifikatoren an amtlichen
> Tarifen belegen (Norm + Link + Stand, §7 — Risikopfad ⇒ `QS-GP`) → (b) **I2** damit bauen →
> (c) Festsetzung/Dispositiv. **I4 ✅** (1.7.2026, Bemessungskriterien 25 GK + 26 PE, §7-belegt,
> QS-GP bestanden) · **I9-Rest ✅** (Notariats-/Grundbuch-Querverweis) — Wortlaut →
> `ROADMAP-CHRONIK.md` → W1·4 (22.7.2026).
