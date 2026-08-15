# FR/IT-Sprach-Drift der Fedlex-eIds (Erstlauf `QS-FRIT-DRIFT`) — 15.8.2026

**Erstellt:** 15.8.2026 · **Status:** belegt (Quelle nachgeprüft), Meldung an Fedlex
offen — wartet auf David
**Einheit:** ROADMAP `QS-FRIT-DRIFT` · FAHRPLAN-FEDLEX-PORTFOLIO §18.1 · Branch
`feat/qs-frit-drift` · Trailer `Roadmap: QS-FRIT-DRIFT`

## Quelle mit Stand

Amtliches Fedlex-Filestore-XML (AKN 3.0 / LegalDocML.CH), aufgelöst über den
amtlichen SPARQL-Endpunkt `https://fedlex.data.admin.ch/sparqlendpoint`
(`isRealizedBy(DEU|FRA|ITA) → isEmbodiedBy(userFormat=xml) → isExemplifiedBy`),
je Erlass am **gepinnten** Konsolidierungsstand aus `scripts/fedlex-cache.sh`.
Abruf und Nachprüfung am **15.8.2026**.

## Befund (deterministisch, reproduzierbar mit `npm run check:frit-drift`)

Über 30 Kern-Erlasse stimmen die **Kern-eIds** (Artikel und Top-Container) in 27
Fällen in allen drei Amtssprachen exakt überein. Drei Erlasse weichen ab:

| Erlass | Stand | Sprache | Abweichung |
|---|---|---|---|
| OR (SR 220) | 2026-01-01 | fr | `art_219` fehlt · `art_221` doppelt vergeben |
| OR (SR 220) | 2026-01-01 | it | `art_219_a` fehlt · `art_219` doppelt vergeben |
| PatG (SR 232.14) | 2025-07-01 | fr + it | `art_86_l` fehlt · `art_86_k` doppelt vergeben |
| BewG (SR 211.412.41) | 2023-07-01 | fr | `disp_u2`, `disp_u3`, `disp_u4` fehlen als eIds — **anderes eId-Schema**, s. unten (IT wie DE) |

**Mechanismus** (bei OR und PatG identisch, am XML abgelesen): ein **neu
eingeschobener** Artikel erhält in der FR-/IT-Fassung **keinen eigenen eId**,
sondern den des Vorgängers. Im OR-FR trägt der Knoten mit `<num>Art. 219</num>`
den eId `art_220` — der Artikel-Text ist gegenüber dem eId **um eins versetzt**;
`art_221` erscheint zweimal. In der IT-Fassung trägt der Knoten mit
`<num>Art. 219a</num>` den eId `art_219`. Auslöser im OR ist Art. 219a (eingefügt
per 1.1.2026, «Baumängel», AS 2025 270; BBl 2022 2743), im PatG Art. 86l.

**BewG — der schärfste Fall (Korrektur der ersten Lesart, Gegenprüfung
15.8.2026).** Die erste Auswertung las «drei Schlussbestimmungen fehlen in FR».
Das ist **falsch**: der Inhalt ist vorhanden, aber nach einem **anderen
eId-Schema** geführt — 1997/1999/2001 stehen in der FR-Fassung als
`<level eId="chap_6/lvl_u6|u7|u8">` statt als `<proviso eId="disp_u2|u3|u4">`.
Entscheidend ist die Folge: **FR `disp_u1` trägt die Schlussbestimmung von 2020**
(inhaltlich = DE `disp_u4`), **während DE `disp_u1` die von 1997 ist**. Derselbe
eId, ein anderer Erlassteil — eine Kollision, die ein reiner Mengenvergleich
NICHT sieht (die Menge enthält `disp_u1` in beiden Sprachen). Das ist der
stärkste Beleg für Regel 1 unten und zugleich die Grenze von Stufe 1.

## Regel (deterministisch)

1. **Die eId-Achse trägt nicht sprachübergreifend.** `eId` ist innerhalb einer
   Sprachfassung eine gute Kennung, aber **kein** verlässlicher Join-Schlüssel
   zwischen DE/FR/IT. Wer FR/IT je über DE-eIds adressiert, serviert an den
   betroffenen Stellen **stillschweigend den falschen Artikel**.
2. **Sprachübergreifend ist über `<num>` abzugleichen**, nicht über `eId`
   (Konsequenz für `W2·5g-ZEIT`, «Mehrsprachiger Normvergleich»).
3. **eId-Eindeutigkeit ist nicht garantiert** — die Duplikat-Prüfung gehört in
   jeden Ingest, nicht nur in diesen Wächter.
4. **Unterhalb der Artikel-Ebene** (`art_X/para_Y`) ist Sprachdifferenz
   **normal und amtlich gewollt**: das OR sagt es in Art. 1033 selbst («Im
   französischen und italienischen Text besteht dieser Artikel aus einem einzigen
   Absatz»). Diese Residue darf nie als Fehler gewertet werden. Extremwert im
   Bestand: BV 330/665 (fr) bzw. 328/783 (it) bei identischer Artikel-Menge.

5. **Ein Mengenvergleich allein genügt nicht.** Der BewG-Fall zeigt eine
   Abweichung, die die Menge nicht sieht: gleicher eId, anderer Inhalt. Stufe 2
   muss über `<num>`/Heading abgleichen, nicht über die Menge (offen).

## Geltung / Ausnahmen

Gilt für konsolidiertes Bundesrecht (`eli/cc/…`) im Filestore-XML. Die DE-Fassung
war in allen 30 geprüften Erlassen eId-konsistent; DE bleibt damit die tragfähige
Ankersprache. Ungeprüft: die übrigen 197 Pins, Romanisch, und die AS-Ebene
(`eli/oc/…`).

## Pflegebedarf

Die vier Fundstellen sind in `scripts/fedlex-frit-drift.ts` als `ANERKANNTE_DRIFT`
**deklariert** und werden bei jedem Lauf des Normen-Monitors **live gegen die
Quelle nachgeprüft** (Muster G-AUFH): Heilt Fedlex den Defekt oder wächst er, wird
das Tor rot und verlangt das Nachführen der Deklaration. Es ist also keine
stille Ausnahme, sondern eine überwachte.

## Abnahme-Status

Technischer Befund, gegen die amtliche Quelle verifiziert (§7) — **keine**
fachliche Abnahme nötig, weil nichts am ausgelieferten Korpus geändert wurde.
**Wartet auf David:** ob die vier Fundstellen dem Fedlex-Betrieb gemeldet werden.
