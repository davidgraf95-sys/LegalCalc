# Kantonale Gliederungs-Sidecars — Erschliessbarkeit der 42 Erlasse ohne Sidecar, und der Fehlbefund SG-3849

**Erstellt:** 13.8.2026 — Anlass: Roadmap-Schritt `W2·19B-KORPUS`, beide
Teilaufträge aus dem Entscheid David 8.8.2026 (archiv/FAHRPLAN-W2-19-SEITENLEISTE §11
Ziff. 2 und 3): (a) Sidecar-Nachzug der 42 Kantonserlasse ohne Gliederungs-
Sidecar, (b) Korpus-Prüfauftrag SG-3849. Beides Extraktions-Risikopfad.

**Status:** ERSTRECHERCHE — der SG-3849-Kern zusätzlich auf zwei unabhängigen
Wegen belegt (Portal-JSON-API und amtlicher PDF-Volltext, getrennt erhoben).
Fachliche Abnahme durch David offen; kein `verified: true`, kein «geprüft».

**Quellen** (alle abgerufen 13.8.2026; Portale der LexWork/clex-Familie, Antworten
je am `Content-Type` verifiziert — HTTP 200 allein ist bei diesen Portalen kein
Erfolgsbeweis, unbekannte Pfade liefern eine Angular-Shell mit Status 200):

| Quelle | URL | Stand / Fassung |
|---|---|---|
| GebT SG (Gegenstand des Prüfauftrags) | `https://www.gesetzessammlung.sg.ch/api/de/texts_of_law/821.5` | Version 3849, in Vollzug seit 1.1.2026 |
| GebT SG, amtliches PDF | `https://www.gesetzessammlung.sg.ch/api/de/versions/3849/pdf_file` | dito, 61 Seiten |
| GB-GebV SG (Abgrenzung) | `https://www.gesetzessammlung.sg.ch/api/de/texts_of_law/914.5` | Version 2935, in Vollzug seit 1.6.2020 |
| GKV SG (Fassungs-Befund) | `https://www.gesetzessammlung.sg.ch/api/de/texts_of_law/941.12` | Version 3863, in Vollzug seit 1.7.2026 |
| BeurkGebV LU | `https://srl.lu.ch/api/de/texts_of_law/258` | Version 3870 |
| NotGebV GR | `https://www.gr-lex.gr.ch/api/de/texts_of_law/210.370` | Version 3348 |
| Tarif des émoluments des notaires FR | `https://bdlf.fr.ch/api/fr/texts_of_law/261.16` | Version 8428 |
| Tarif des émoluments VS | `https://lex.vs.ch/api/fr/texts_of_law/178.104` | Version 1413 |
| Gebührentarif Gemeinden AR | `https://ar.clex.ch/api/de/texts_of_law/153.2` | Version 1203 |

---

## Regel (deterministisch, Eingabe → Ausgabe)

**Eingabe:** ein kantonaler Snapshot `public/normtext/kanton/<KEY>.json` mit der
`quelleUrl` seines ersten Eintrags.
**Ausgabe:** ob ein Gliederungs-Sidecar erzeugbar ist, und woraus.

1. `quelleUrl` matcht `/app/<lang>/texts_of_law/<sn>` → LexWork-Leseadresse.
   Struktur-API ist `…/api/<lang>/texts_of_law/<sn>`; Sidecar erzeugbar, sofern
   `selected_version.xhtml_tol` gesetzt ist. **1189 Erlasse.**
2. `quelleUrl` matcht `/api/<lang>/versions/<vid>/pdf_file` → PDF-Adresse
   derselben Portal-Familie. Die Struktur-API ist daraus **nicht** direkt
   adressierbar, weil der Pfad die Versions-Id statt der Systematiknummer führt.
   Die Systematiknummer steht im Snapshot selbst (`erlass`-Feld, Klammerzusatz —
   dieselbe Zerlegung, aus der `register.json` seinen `sr` speist). Sidecar
   erzeugbar, wenn zusätzlich **beide** Tore halten:
   `selected_version.id === vid` (Fassungs-Tor) **und** `xhtml_tol` gesetzt.
   **8 Erlasse; davon 4 erzeugbar.**
3. Sonst (lexfind-`tolv`-Auslieferung oder kantonseigenes Portal) → keine
   strukturierte amtliche Schnittstelle bekannt; Sidecar **nicht** erzeugbar
   ohne je eigenen Portal-Parser. **34 Erlasse.**

**Warum das Fassungs-Tor unverzichtbar ist:** Die Struktur-API antwortet immer
mit der *aktuell* geltenden Fassung, der Snapshot hängt aber an genau einer
Version. Ohne das Tor bekäme ein alter Snapshot eine Gliederung der neuen
Fassung untergeschoben — eine zweite Wahrheit im selben Erlass (§5). Der Lauf
vom 13.8.2026 hat das Tor real greifen sehen (SG-2808).

**Nachtrag Gegenprüfung 13.8.2026 — drei Korrekturen an dieser Regel.**

*(a) Mehrdeutiges Systematik-Feld.* Regel 2 setzte voraus, dass im `erlass`-Feld
genau eine Nummer steht. SG-2935 und SG-3849 tragen aber ein verschachteltes
Feld mit zwei Erlassen: `(914.5 (GB-GebV); 821.5 (GebT))`. Die Zerlegung
scheiterte daran, und der Lauf meldete «ohne lawId» — eine **Falschauskunft**,
denn der wahre Grund ist ein anderer. Gefährlich wäre das bei einem künftigen
Erlass mit doppeltem Feld **und** vorhandener Struktur: er würde unter falscher
Begründung übersprungen, ohne je gefragt zu werden. Die Nummern-Erkennung ist
jetzt verschachtelungsfest und liefert **alle** Kandidaten; welcher gilt, wird
nicht geraten (§7), sondern vom Fassungs-Tor an der API entschieden. Seither
melden beide Erlasse den zutreffenden Befund «amtlich ohne XHTML» — SG-3849
gegen **821.5**. Das bestätigt die Identitätsfeststellung dieses Dossiers
unabhängig: das Tor verwirft 914.5 (führt Version 2935) und nimmt 821.5 (führt
Version 3849).

*(b) Aussagekraft bei mehreren Kandidaten.* Ein Kandidat mit abweichender
Fassung ist meist nur der falsche Erlass — keine Aussage über den gesuchten.
Diese Meldung darf darum die spezifischere Auskunft eines zutreffenden
Kandidaten nicht verdecken (sonst meldete SG-3849 eine Fassungs-Abweichung
gegen die fremde Nummer 914.5 und schickte den Leser zum falschen Erlass).
Rangfolge jetzt: `ok` > `leer` > `fassung` > `shell` > Transportfehler.

*(c) Die Soft-404-Sonde ist jetzt belegt statt behauptet.* Sie wurde im Lauf nie
rot (kein Portal antwortete mit einer Shell) und war damit unbewiesen — der
Commit, der «beide Tore rot gezeigt» behauptete, deckte nur das Fassungs-Tor.
Sie ist jetzt unit-getestet, und der Rot-Beweis förderte zutage, dass eine Shell
ohne sie als **«amtlich ohne XHTML»** durchginge: ein Erlass gälte dauerhaft als
strukturlos abgeklärt, obwohl die Quelle nie geantwortet hat. Die reine
Entscheidungs-Logik liegt dafür jetzt in `struktur-kanton-logik.ts` — der Runner
selbst ist nicht importierbar, weil er beim Laden `process.exit` aufruft, und
genau deshalb konnten seine Tore bis dahin nicht geprüft werden.

## Ergebnis des Nachzugs

| Erlass | Systematiknummer | Befund | Modus vorher → nachher |
|---|---|---|---|
| LU-3870 | SRL 258 | Sidecar erzeugt, 56/56 Artikel, Gliederung 3 Ebenen tief | b3-leer → b1-offen |
| GR-3348 | BR 210.370 | Sidecar erzeugt, 23/23 Artikel | b3-leer → b1-offen |
| VS-1413 | 178.104 | Sidecar erzeugt, 26/26 Artikel | b3-leer → b1-offen |
| FR-8428 | RSF 261.16 | Sidecar erzeugt (Kopf + Fussnoten); der Erlass hat amtlich **keine** Abschnitte | b4-mini → b4-mini (8 Artikel) |
| AR-1203 | bGS 153.2 | `structured_document_id: null` → amtlich nur PDF | unverändert b3-leer |
| SG-2808 | sGS 941.12 | Fassungs-Tor: Snapshot hängt an Version 2808, amtlich gilt 3863 | unverändert b3-leer |
| SG-2935 | sGS 914.5 | amtlich nur PDF | unverändert b3-leer |
| SG-3849 | sGS 821.5 | amtlich nur PDF (siehe Prüfauftrag unten) | unverändert b3-leer |

Bei allen vier erzeugten Sidecars gilt belegt: Vereinigung aus baumzugeordneten
Artikeln und `ohneGliederung` ist **zeichengleich mit der Artikel-Folge des
Snapshots**, ohne Duplikate und ohne Verluste — die Artikel-Ebene ist vollständig.

## Prüfauftrag SG-3849 — Verdikt: unsere Erfassung ist fehlerhaft

Die Ausgangsannahme (FAHRPLAN §11 Ziff. 2) lautete «teilerfasst, Artikel-Folge
lückenhaft: beginnt bei Art. 2, dann Art. 7». Sie ist **widerlegt**.

1. **Identität.** SG-3849 ist der *Gebührentarif für die Kantons- und
   Gemeindeverwaltung* (GebT, sGS 821.5), Stand 1.1.2026. Das `erlass`-Feld des
   Snapshots nennt daneben die GB-GebV (sGS 914.5) — das ist ein **zweiter,
   eigener Erlass** (dort Version 2935) und gehört nicht in dieselbe Datei.
2. **Struktur.** Der GebT führt amtlich **keine eigenen Artikel**. Sein
   Textkörper ist durchgehend nach Gebühren-Nummern gegliedert (10.01 … 70.11,
   teils vierstufig, z.B. 50.32.12.11.01). Es fehlt also nichts «zwischen Art. 2
   und Art. 7» — es gibt gar keine Artikel, und damit auch keine Lücke.
3. **Die 17 «Art. N»-Einträge sind Fehlextraktionen.** Nummern: 2, 7, 11, 12,
   13, 15, 19, 43, 51, 71, 80, 82, 84, 381, 505, 544, 1032. Jede ist ein
   Bruchstück eines Verweises auf einen **fremden** Erlass — Art. 381/505/544
   ZGB, Art. 1032 OR, dazu kantonale Verordnungen. Der PDF-Pfad hat das Muster
   «Art. &lt;Zahl&gt;» im Fliesstext als eigenen Artikel-Kopf gelesen.
   **Stichprobe 17/17 (100 %)**, unabhängig über Portal-API und PDF-Volltext.
4. **Nur PDF.** Für Version 3849 sind `xhtml_tol`, `xhtml_cac_tol`,
   `xhtml_cac_unified_tol` und `doc_link_tol` amtlich `null`. Eine strukturierte
   Extraktion ist bei diesem Erlass nicht möglich; jede Struktur muss aus dem PDF
   kommen.

**Folge in der UI:** Der §8-Hinweis wurde nicht aufgelöst, sondern **präzisiert**
(`src/pages/gesetz-leser/erlassUebersichtDaten.ts`): statt «Auswahl, nicht
vollständig» sagt er jetzt, dass der Erlass gar keine eigenen Artikel kennt und
die 17 «Art.»-Einträge irrtümlich übernommene Fremdverweise sind. Aufgelöst wird
er erst, wenn der PDF-Pfad die Ziffern-Tarife richtig liest.

## Struktur-Typen unter den 42 (Inventur für die Erlass-Kategorisierung)

Erhoben am committeten Snapshot-Bestand, rein deterministisch aus
`artikelLabel` + Block-Formen:

| Typ | Anzahl | Merkmal | Beispiele |
|---|---|---|---|
| T-ARTIKEL | 31 | reine `Art.`-Folge, kein Anhang | GE-rsg_d3_30 (194), VD-vd-105539 (118) |
| T-PARAGRAF | 7 | reine `§`-Folge (LU, SZ, ZH) | LU-3870 (56), SZ-173.111 (40) |
| T-ANHANGDOMINANT | 4 | Ziffern-Tarif; die Ziffern **sind** der Haupttext, «Artikel» nur Beiwerk | SG-3849 (590/607), ZH-243 (132/150), SG-2935 (87/112), AR-1203 (44/59) |

**Architektur-Befund zum Schema.** Das Sidecar-Schema
(`StrukturMap = Record<ArtikelToken, {gliederung, marginalie, fussnoten}>`) ist
artikel-geschlüsselt und bildet kantonale Ebenen **treu** ab: die Labels kommen
verbatim aus der Quelle, es wird kein Bundes-Schema erzwungen. LU-3870 trägt
darum «§»-Designatoren unter drei eigenen Ebenen, GR/VS je eine Ebene mit
kantonseigener Nummerierung — alles ohne Schema-Anpassung.

**Wo das Schema nicht trägt:** beim Typ T-ANHANGDOMINANT. Diese Erlasse haben
keine Artikel-Ebene, sondern eine mehrstufige **Nummern-Hierarchie** als
Haupttext. Der Snapshot presst sie heute in Artikel-Token mit dem Label «Anhang
Ziff. N» — das ist doppelt ungenau: es ist kein Anhang, und die Hierarchie
zwischen 50.32 und 50.32.12.11.01 geht verloren (alle Ziffern liegen flach
nebeneinander). Ein tragfähiges Fundament für diesen Typ bräuchte entweder eine
eigene Struktur-Kategorie «Ziffern-Tarif» oder die Ableitung der Hierarchie aus
der Nummer selbst. **Nicht eigenmächtig geändert** — Entscheid steht aus.

## Negativbefunde (S5)

- **lexfind.ch `/tolv/<id>/<lang>` ist kein Struktur-Endpunkt.** Die URL liefert
  `Content-Type: application/pdf`. Die probeweise abgeleiteten JSON-Formen
  (`/api/fe/<lang>/texts-of-law/<id>`, `/api/fe/<lang>/tolv/<id>`) antworten 404.
  Für die 9 Erlasse dieser Familie ist über lexfind keine Gliederung erreichbar.
- **`/api/<lang>/versions/<vid>` existiert bei der LexWork-Familie nicht** (404
  bzw. HTML-Fehlerseite). Es gibt keinen Weg von der Versions-Id zurück zur
  Systematiknummer über die API; die Nummer muss aus eigenen Daten kommen.
- **Für AR-1203, SG-2808, SG-2935, SG-3849 ist amtlich kein XHTML vorhanden**
  (`structured_document_id: null`). Nicht erneut suchen.
- **Für die 25 Erlasse auf kantonseigenen Portalen** (zh.ch, m3.ti.ch,
  silgeneve.ch, rsn.ne.ch, rsju.jura.ch, sz.ch) wurde in diesem Durchgang **kein**
  Struktur-Endpunkt gesucht — sie sind in `lexfind-discovery.ts` bereits als
  Tier B/C klassifiziert. Offen, nicht widerlegt.

## Pflegebedarf

- **Fassungs-Drift bei PDF-erfassten Kantonserlassen ist heute unbemerkt.** Der
  `fassungsToken` ist bei diesen Snapshots ein Inhalts-Hash des PDF; solange das
  alte Versions-PDF unter seiner URL erreichbar bleibt, ändert er sich nicht,
  auch wenn das Portal längst eine neue Fassung führt. SG-2808 ist der belegte
  Fall (Snapshot 2012, amtlich gilt seit 1.7.2026 Version 3863). Ein Tor, das
  `current_version.id` gegen die Snapshot-Version prüft, fehlt.
- **Die 4 neuen Sidecars altern mit ihrer Quelle.** Sie sind an
  `selected_version.id` gebunden; ändert das Portal die geltende Fassung, wird
  das Fassungs-Tor beim nächsten Lauf greifen und den Nachzug verweigern — das
  ist gewollt und macht die Drift sichtbar, statt sie zu überschreiben.
- **Der PDF-Pfad braucht eine Erkennungsregel für Ziffern-Tarife**, sonst
  wiederholt sich der SG-3849-Fehler bei jedem Erlass vom Typ T-ANHANGDOMINANT.
  Verdacht auf dieselbe Fehlerklasse bei ZH-243, SG-2935 und AR-1203 — **nicht
  geprüft**, gehört in einen eigenen Schritt.

## Abnahme-Status

**entwurf.** Kein `verified: true`, kein «geprüft». Die fachliche Abnahme der
SG-3849-Einordnung (Identität, Nicht-Existenz eigener Artikel) liegt bei David.
