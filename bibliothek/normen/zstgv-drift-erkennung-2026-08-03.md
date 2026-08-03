# ZStGV (SR 172.042.110) — Drift-Erkennung für die CHF-75-Angabe

**Erstellt:** 2026-08-03 (Session W2·8/V9.4) · **Stand der Quelle:** Fedlex,
live abgefragt 3.8.2026
**Status:** Quelle verifiziert · **Umsetzung blockiert** — der Weg ist nicht der
angenommene (Begründung Ziff. 4). Entscheid David/Orchestrator ausstehend.

---

## 1 Ausgangslage

Die Vorsorgeauftrag-Seite trägt seit PR #411 den amtlichen Wert **CHF 75** für
die Eintragung des Vorsorgeauftrags im Personenstandsregister (Anhang 1 Ziff. 23
ZStGV). Das Zitat trägt Norm, amtlichen Live-Link und Stand — aber **keine
automatische Drift-Erkennung** gegen die Quelle. Nach §7 (Zitat-Ausnahme) ist
das Merkmal (d) von vier; ohne es ist der gespeicherte Wert streng genommen eine
zweite Wahrheit. Nebenfund L4 der Gegenprüfung zu #411.

Naheliegender Schluss war: ZStGV in `scripts/fedlex-cache.sh` pinnen, fertig.
**Das trägt nicht** (Ziff. 4).

## 2 Amtlich verifiziert (§7) — alles Nötige für den Folgeschritt

| Feld | Wert | Wie belegt |
|---|---|---|
| Erlass | V über die Gebühren im Zivilstandswesen (ZStGV) | Filestore-HTML |
| SR | 172.042.110 | `<p class="srnummer">172.042.110` im HTML |
| ELI | `cc/1999/490` | SPARQL, `classifiedByTaxonomyEntry` → `skos:notation` |
| Geltende Konsolidierung | **20241111** | SPARQL `dateApplicability`: 20 Fassungen, nur diese ohne `dateEndApplicability` |
| Künftige Fassung | keine | dieselbe Abfrage |
| `dateNoLongerInForce` | keiner (Erlass in Kraft) | dieselbe Abfrage |
| Kanonisches html-N | **2** | `isRealizedBy(DEU)` → `isEmbodiedBy(html)` → `isExemplifiedBy` via `scripts/fedlex-manifest.ts` |
| Datei | 80 693 B, 18 `art_`-, 4 `annex_`-Anker, kein Casemates-Marker | Filestore-Sonde |

**Anhang 1 Ziff. 23, wörtlich** (Tabellenzeilen aus dem Filestore-HTML):

> 23. Vorsorgeauftrag (Art. 23a ZStV):
> – Eintragung der Tatsache, dass eine Person einen Vorsorgeauftrag errichtet
>   hat, und Eintragung des Hinterlegungsortes — **75**
> – Änderung des Eintrags — **75**
> – Löschung des Eintrags — **75**

Die UI-Angabe «CHF 75» ist damit am Wortlaut bestätigt. Ebenso trägt Art. 1
Abs. 2 ZStGV die UI-Aussage, dass weitere Gebühren unzulässig sind, und Art. 4
den Verweis auf Anhang 1.

**ZStV** (SR 211.112.2, `cc/2004/362`, Konsolidierung 20250601) ist bereits
gepinnt; das gepinnte `html-1` ist per `isExemplifiedBy` als kanonisch bestätigt.
Dort ist nichts zu tun.

## 3 Der Pin, wie er aussähe

```
"zstgv|cc/1999/490|20241111|2|art_1,art_4|172.042.110"
```

Empirisch grün gefahren (Anker + SR-Identität + Shell-Sonde), und dreimal
absichtlich rot (§6.7): falscher Anker → «fehlende Anker», falsche SR →
«FALSCHER ERLASS», nicht existente Konsolidierung → «kein Filestore-HTML».
`check:fedlex-versionen` meldete «OK zstgv: gepinnt 2024-11-11 = neueste
Konsolidierung».

## 4 Warum er trotzdem zurückgenommen wurde

**Ein Pin in `fedlex-cache.sh` ist kein isolierter Eintrag, sondern die
Anmeldung eines gehosteten Volltextes.** `scripts/normtext/drift-logik.ts`
(`pruefeBundVollstaendigkeit`) verlangt für **jeden** Pflicht-Anker eines Pins
einen Bund-Snapshot `bund/<KEY>/<anker>`. Folge:

```
FEHLER Bund-Vollständigkeit: Pflicht-Anker ohne Snapshot:
  bund/ZSTGV/art_1
  bund/ZSTGV/art_4
```

`check:normtext` und `check:vollstaendigkeit` gehen rot. Die Kopplung ist kein
Zufall, sondern Absicht (Coverage-Assertion P1-b: kein gehosteter Bund-Volltext
ohne Currency-Überwachung) — sie gilt hier nur in der Gegenrichtung: **keine
Currency-Überwachung ohne gehosteten Volltext.** Alle 227 übrigen Pins erfüllen
das; die ZStGV ist der erste Fall, in dem jemand nur überwachen, nicht hosten
will. Die VA-Seite hält ausdrücklich fest, die ZStGV stehe «bewusst nicht im
Norm-Register».

Nebenbefund: das Anker-Feld ist per Test-Invariante `art_`-only
(`src/tests/normtext-inventar.test.ts`). Ein Wert, der wie hier in einem
**Anhang** steht, ist auf Anker-Ebene gar nicht pinnbar — `annex_1` macht den
Test rot. Für Gebührenverordnungen (Wert im Anhang, nicht im Artikel) ist das
strukturell relevant.

## 5 Die zwei gangbaren Wege — Entscheid offen

**Weg A — ZStGV als Volltext aufnehmen.** Die 5-Datei-Koordination
(`fedlex-cache.sh`, `src/lib/fedlex.ts`, `src/lib/normtext/register.ts`,
`scripts/normtext-snapshot.ts`, `bund-stubs-generieren.ts`), dann
`normtext:bund-stubs` → `normtext --erlass=ZSTGV` → `normtext:register`.
Konsequenzen: Risiko-Pfad (Gegenprüfung nötig), berührt `public/normtext/` und
`currency.json` — **kollidiert mit dem offenen PR #414**
(`chore/fedlex-frische-2026-08-03`, Auto-Merge, 224 Zeilen in `currency.json`).
Löst zugleich die Anhang-Frage nicht: der Wert 75 stünde als `annex_`-Token im
Snapshot, nicht als Pflicht-Anker.

**Weg B — Currency-Beobachtung ohne Volltext.** Eine dritte, additive Pin-Quelle
für `check:fedlex-versionen` (es liest heute schon zwei: `lesePins()` aus
cache.sh **plus** `PDF_EMBED_QUELLEN`). Ein Eintrag «beobachten, nicht hosten»
gäbe §7-Merkmal (d) ohne Snapshot-Pflicht. Das ist eine bewusste
Modell-Erweiterung, kein Pflege-Nachzug — sie gehört deklariert und
gegengeprüft.

Weg B ist der kleinere und passt zum Bedarf (die ZStGV soll nicht ins
Norm-Register). Weg A ist der bestandstreuere. Der Entscheid ist Davids.

## 6 Pflegebedarf bis dahin

Eine **Teilrevision der ZStGV ist in Vernehmlassung bis 15.10.2026**
(VERN-2026-32, im Materialien-Register erfasst). Sie wird eine neue
Konsolidierung erzeugen — **bis dahin ist der Wert CHF 75 unüberwacht**. Das ist
das konkrete Risiko, das dieser offene Punkt trägt.

## 7 Abnahme-Status

Quelle verifiziert (Ziff. 2, am Wortlaut). Der Umsetzungsweg ist offen und
braucht Davids Entscheid (Ziff. 5).
