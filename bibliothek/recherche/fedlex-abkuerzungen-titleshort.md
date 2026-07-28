# Amtliche Erlass-Abkürzungen DE/FR/IT aus Fedlex (`jolux:titleShort`)

**Erstellt 28.7.2026 · Ausführungsbeleg §11 zur Bau-Einheit ROADMAP `W2·6-NKEY` (Baustein b).**
**Stand:** 28.7.2026, Stichtag des gepinnten Laufs `--datum=2026-07-28`; Abdeckung **200/230 SR**
(de 200 · fr 199 · it 198). **Status:** ZWEIFACH GEPRÜFT (Bau + adversariale Gegenprüfung Opus,
4 Runden, frischer Kontext); fachliche Abnahme durch David offen.

## Wozu

Ein Bundesgerichtsentscheid in französischer Amtssprache zitiert «art. 42 **LTF**», ein
italienischer «art. 41 **CO**» — dasselbe Bundesgesetz, ein anderes amtliches Kürzel. Die
normKeys-Zuordnung kannte nur die deutsche Anzeige-Abkürzung aus dem `ERLASS_REGISTER`, darum
verschwand jedes fr/it-Zitat lautlos. Diese Kette liefert die fehlende **Alias-Ebene**: amtliche
Kurzbezeichnung je SR-Nummer und Amtssprache, nicht geraten, nicht übersetzt, nicht aus
Modellwissen (§7).

Die Aliase sind **keine zweite Wahrheit** (§5): der Erlass-Bestand bleibt das Register, das
generierte Artefakt trägt nur dessen fremdsprachige Namen.

## Regel (Eingabe → Ausgabe)

**Eingabe:** SR-Nummer eines Bund-Erlasses aus `ERLASS_REGISTER` + Stichtag `YYYY-MM-DD`.
**Ausgabe:** 0..3 Zeilen `{ sr, sprache, abk }` — die amtliche Kurzbezeichnung der am Stichtag
geltenden Konsolidierung, je Amtssprache; leer, wenn Fedlex für diesen Erlass keine führt.

**Property:** `jolux:titleShort` am sprachlichen Ausdruck (`jolux:isRealizedBy`) des
`jolux:ConsolidationAbstract`, das über `jolux:classifiedByTaxonomyEntry` an der SR-Notation hängt.

## Die vier Regeln, ohne die das Artefakt falsch wird

1. **Datentyp-IRI an der Notation ist Pflicht.** `?e skos:notation "220"` trifft ohne Typ-IRI auch
   die Notationstypen `id` und `id-amt` — also **fremde Erlasse mit derselben Zeichenkette**. Nur
   `"220"^^<https://fedlex.data.admin.ch/vocabulary/notation-type/id-systematique>` ist die
   SR-Nummer.
2. **Currency-Fenster gegen Schatten-Abstracts.** An einer SR-Nummer hängen historische
   Konsolidierungs-Abstracts abgelöster Erlasse: SR 173.110 trägt BGG **und** OG, SR 101 trägt BV
   **und** BV 1874. Ohne Fenster liefert dieselbe `(sr, sprache)` zwei verschiedene Kürzel.
   Fenster = `dateEntryInForce <= Stichtag` UND **kein** `dateNoLongerInForce <= Stichtag`.
   Empirisch (27.7.2026, 227 SR): mit Fenster **0 Konfliktgruppen**.
3. **Trim + Leerstring-Verwurf.** Der Endpoint liefert 42 Zeilen mit führendem Leerzeichen
   (z. B. `' LRD'`) und 761 Zeilen mit leerem `titleShort`. Beides wird in der Abfrage bereinigt
   und in TypeScript ein zweites Mal geprüft — billig, und es hält das Artefakt sauber, falls der
   Endpoint sich ändert.
4. **Stille Teilergebnisse — der gefährlichste Befund.** Der Endpoint antwortet gelegentlich
   (**≈2 von 20 Läufen**) mit HTTP 200 und **fehlenden Zeilen**. Ein Generator ohne Gegenprobe
   schriebe ein stillschweigend unvollständiges Artefakt, und niemand bemerkte die fehlenden
   Kürzel (§6.7). Darum je Batch (40 SR) ein **COUNT-Gate über dieselbe DISTINCT-Projektion**,
   bis zu 5 Anläufe, danach Abbruch ohne Schreiben. **Je Anlauf ein frisches Paar** (COUNT +
   Zeilen): ein Vergleich, dessen Referenz denselben Fehler haben kann wie der Prüfling, prüft
   nichts — war der erste COUNT der verstümmelte, bestätigte das «Tor» sonst ein Teilergebnis.
   Global zusätzlich: sinkt die Zeilenzahl unter die des committeten Artefakts, bricht der
   Generator ab — ein Netz-Ausfall darf Bestand nicht löschen.

**Konflikte werden nicht geraten (§8):** trägt eine `(sr, sprache)` trotz Fenster zwei
verschiedene Kürzel, bricht der Generator mit Fehler ab, statt still zu tiebreaken.

## Geltungsbereich und Ausnahmen

- **Nur Bund-Einträge.** Bei kantonalen Registereinträgen trägt `sr` die **kantonale**
  Systematiknummer, die einer Bundes-SR zufällig gleichen kann («161.12» in BE) — eine Auflösung
  darüber zeigte auf einen völlig anderen Erlass (§1). Staatsverträge (SR `0.*`) sind erfasst.
- **Ausschluss wirkt auch auf Aliase.** SR 641.10 (Stempelabgaben) ist als `StG` föderal/kantonal
  mehrdeutig und darum in `ABK_AUSSCHLUSS`; die amtlichen Kürzel `LT` (fr) und `LTB` (it) sind es
  nicht und würden denselben Key `STG` **durch die Hintertür** in den Korpus tragen. Das wäre eine
  fachliche Entscheidung, und die trifft kein Build-Schritt nebenbei (§7/§8).
- **30 der 230 SR führen kein `titleShort`** — das ist eine Quellen-Eigenschaft, kein Fehler.
- **62 der 597 Zeilen sind im Fliesstext-Pfad strukturell unerreichbar** (Leerzeichen im Kürzel,
  Trennzeichen, Akzent im Wortinnern …); im `statutes`-Pfad wirken sie. `check:normkeys` weist sie
  einzeln mit Ursache und Korpus-Beleg aus, statt sie zu verschweigen.

## Regenerieren

```
npm run gen:abk-aliase -- --datum=$(date +%F)
```

Stichtag ist **Pflicht** (§2): er geht ins Currency-Fenster ein, steht im Datei-Kopf und macht den
Lauf reproduzierbar — kein `Date.now()`.

- **Generator:** `scripts/normtext/abk-aliase-generieren.ts`
- **Artefakt:** `src/lib/normtext/abk-aliase.generated.ts` (`merge=regen` §12; nicht aus `src/`
  importieren — reine Build-Zeit-Quelle, §15)
- **Verbraucher:** `scripts/normtext/entscheide-mapping.ts` (löst je Zeile `sr` → Register-key auf)
- **Tor:** `npm run check:normkeys` misst Abdeckung, Kollisionen und die unerreichbaren Formen

## Pflegebedarf

Kein Verfallsdatum im engen Sinn — die Kette ist **reproduzierbar**, nicht datenhaltend. Neu
aufzufrischen ist sie, wenn (a) neue Erlasse ins `ERLASS_REGISTER` kommen, (b) ein Erlass abgelöst
wird (Schatten-Abstract-Fall: das Fenster fängt es, aber nur beim Neulauf), oder (c)
`check:normkeys` fr/it-Kürzel über der Schwelle meldet, die das Artefakt nicht kennt.

## Abnahme-Status

Bau + 4 adversariale Gegenprüfungs-Runden (Opus, frischer Kontext) bestanden; Register-Zeile
28.7.2026 in `bibliothek/register/gegenpruefung-register.md`. **Fachliche Abnahme durch David
offen** — `verified`/«geprüft» wird nie automatisch gesetzt (§7).
