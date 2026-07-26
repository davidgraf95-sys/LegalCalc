# Fedlex-Quellfehler ArGV 5 Art. 22 «20006» + VStV Art. 58 «Anteilsan» — Verdikt: amtliche Artefakte, kein Pipeline-Fehler

**Erstellt:** 26.7.2026 — Anlass: FN-5-Gegenprüfung vom 26.7.2026, Befund B4
(Dossier `fn5-wortgenaue-marker-2026-07-26.md`, parallele Session): zwei
vorbestehende Text-Artefakte in Bund-Snapshots, deren Herkunft (amtliche Quelle
vs. eigener Extraktions-Randfall) zu klären war (§7: verifizieren, nicht
vertrauen; §1: Wortlaut nie stillschweigend «korrigieren»).

**Status:** ERSTRECHERCHE (Artefakt je Fall in 2 Manifestationen reproduziert —
DE-Filestore-HTML + DE-AKN-XML; dazu FR-Quervergleich sauber und für ArGV 5 der
AS-2007-PDF-Mechanismus-Beleg. §9-Bug-Check 26.7.2026: Code-Lupe + Repro-Agent
haben Roh-HTML-Zitate, Pins und Snapshot-Stellen unabhängig nachgeprüft)

**Quellen** (alle abgerufen 26.7.2026, Pins = `scripts/fedlex-cache.sh`):

| Quelle | URL | Stand |
|---|---|---|
| ArGV 5 Filestore-HTML (gepinnt, kanonisch html-2) | `https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2007/692/20240401/de/html/fedlex-data-admin-ch-eli-cc-2007-692-20240401-de-html-2.html` → `/tmp/argv5.html` (32 859 B, SR-Sonde 822.115 ✓) | Konsolidierung 2024-04-01 |
| ArGV 5 AKN-XML | dito, `de/xml/…-de-xml-2.xml` | Konsolidierung 2024-04-01 |
| ArGV 5 FR-HTML (Quervergleich) | dito, `fr/html/…-fr-html.html` | Konsolidierung 2024-04-01 |
| ArGV 5 Original-AS (Mechanismus-Beleg) | `https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/oc/2007/692/de/pdf-a/fedlex-data-admin-ch-eli-oc-2007-692-de-pdf-a.pdf` (AS 2007 4959, Art. 22 auf S. 4966) | AS 2007, publiziert 2007 |
| VStV Filestore-HTML (gepinnt, kanonisch html-6) | `https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/1966/1585_1641_1624/20250101/de/html/fedlex-data-admin-ch-eli-cc-1966-1585_1641_1624-20250101-de-html-6.html` → `/tmp/vstv.html` (157 139 B, SR-Sonde 642.211 ✓) | Konsolidierung 2025-01-01 |
| VStV AKN-XML | dito, `de/xml/…-de-xml-6.xml` | Konsolidierung 2025-01-01 |
| VStV FR-HTML (Quervergleich) | dito, `fr/html/…-fr-html-6.html` | Konsolidierung 2025-01-01 |

---

## Verdikt (beide Fälle)

**Fall (a) — echte Fedlex-Quellfehler.** Beide Artefakte stehen wortgleich im
amtlichen Fedlex-**Datenbestand** (HTML- **und** AKN-XML-Manifestation der
gepinnten, kanonischen Konsolidierung). Die Snapshot-Pipeline extrahiert
quelltreu; es gibt **keinen zweiten `<sup>`, den sie verschluckt**, und keinen
Whitespace-Kollaps. **Keine Pipeline-Änderung**; nach §1 wird der Wortlaut in
unseren Snapshots **nicht** still «korrigiert» — massgeblich bleibt die
amtliche Fassung, das Artefakt bildet sie ab (§7).

## Befund 1 — ArGV 5 (SR 822.115) Art. 22: «vom 10. Mai 20006»

Snapshot (`public/normtext/bund/ARGV5.json`, `bund/ARGV5/art_22`):
«Die Verordnung 1 vom 10. Mai 20006 zum Arbeitsgesetz wird wie folgt geändert:»

**Roh-HTML der amtlichen Quelle** (zeichengenau):

```html
<p class="absatz ">Die Verordnung 1 vom 10. Mai 2000<sup><a href="#fn-d7e556"
id="fnbck-d7e556">15</a></sup>6 zum Arbeitsgesetz wird wie folgt geändert:</p>
```

Die verirrte **«6» ist blanker Fliesstext AUSSERHALB jedes `<sup>`** — der
Fussnoten-Marker der geltenden Fassung ist die «15» (Fussnote 15 = SR 822.111).
Auf fedlex.admin.ch selbst rendert die Stelle also als «2000¹⁵6 zum
Arbeitsgesetz». **AKN-XML identisch:** `2000<authorialNote>…SR 822.111…
</authorialNote>6 zum Arbeitsgesetz` — die «6» steht als Text-Node in der
Datenebene, nicht nur im HTML-Rendering.

**Mechanismus (belegt am Original-AS):** In AS 2007 4966 lautet die Stelle
«Die Verordnung 1 vom 10. Mai 2000⁶ …» mit **Fussnote 6 = «SR 822.111»**
(PDF-Textextraktion liefert exakt «20006», da Superskript). Bei der
Fedlex-Datenkonversion wurde die Fussnote als `authorialNote` neu angelegt
(heute Nr. 15), die **alte Marker-Ziffer 6 blieb als Fliesstext-Rest** im
konsolidierten Datenbestand kleben.

**Quervergleich FR** (sauber, ohne Artefakt): «L'ordonnance 1 du 10 mai 2000
relative à la loi sur le travail¹⁵ est modifiée comme suit:» → DE-spezifischer
Konversionsfehler.

## Befund 2 — VStV (SR 642.211) Art. 58 Abs. 2: «seines Anteilsan der Erbschaft»

Snapshot (`public/normtext/bund/VSTV.json`, `bund/VSTV/art_58`):
«… nach Massgabe seines Anteilsan der Erbschaft ein Anspruch …»

**Roh-HTML der amtlichen Quelle** (zeichengenau):

```html
… nach Massgabe seines Anteils<sup><a href="#fn-d7e2207"
id="fnbck-d7e2207">90</a></sup>an der Erbschaft ein Anspruch …
```

Das Leerzeichen **fehlt in der Quelle**: Die Fussnote 90 («Ausdruck gemäss
Ziff. I der V vom 3. Febr. 2021, in Kraft seit 1. Jan. 2022 (AS 2021 77).»)
sitzt exakt an der Stelle, wo das Leerzeichen stehen müsste — Text-Nodes sind «…seines Anteils» + `<sup>` +
«an der Erbschaft…». **AKN-XML identisch:**
`Anteils<authorialNote>…</authorialNote>an` (kein Whitespace zwischen Note-Ende
und «an»). Auf fedlex.admin.ch rendert die Stelle als «Anteils⁹⁰an».

**Kontrollstellen:** Art. 59 Abs. 2 derselben Fassung trägt (ohne Fussnote)
korrekt «seines Anteils an der Erbschaft»; FR Art. 58 al. 2 («au prorata de sa
part successorale») ist sauber. → Fehler entstand beim Einpflegen der
Ausdrucks-Änderung AS 2021 77 in den DE-Datenbestand.

## Konsequenzen

1. **Keine Pipeline-Änderung, keine Snapshot-Korrektur.** Extraktion ist
   quelltreu (Negativbefund S5: kein Extraktions-Bug, kein verschluckter
   zweiter `<sup>`, kein Whitespace-Kollaps). Eine «Reparatur» in unserem
   Snapshot wäre eine stille Wortlaut-Abweichung von der amtlichen Fassung
   (§1/§7) — unterbleibt.
2. **FN-5-Rendering:** Mit wortgenauen Fussnoten-Markern rendert LexMetrik die
   Stellen so, wie Fedlex selbst sie zeigt («2000¹⁵6», «Anteils⁹⁰an») — das ist
   korrekt-ehrlich (§8), nicht zu glätten.
3. **Fedlex-Meldung (Vorschlag an David, Entscheid offen):** Beide Fälle
   eignen sich für eine Korrektur-Meldung ans Kompetenzzentrum Amtliche
   Veröffentlichungen (KAV/BK; Kontakt über fedlex.admin.ch). Meldetext kann
   aus diesem Dossier kopiert werden (Fundstellen + Manifestations-URLs oben).
4. **Pflegebedarf: selbstheilend.** Korrigiert Fedlex den Datenbestand,
   verschwinden die Artefakte beim nächsten Re-Pin/Regenerat automatisch als
   amtlicher Diff (`check:fedlex-versionen` + Snapshot-Regenerat); ein eigener
   Verfallsregister-Eintrag mit Datum ist nicht nötig, da kein terminiertes
   Ereignis existiert.
