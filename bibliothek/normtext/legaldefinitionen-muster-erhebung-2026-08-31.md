# Legaldefinitionen — empirische Muster-Erhebung über den Gesamtkorpus

**Erstellt:** 31.8.2026 (Programm-Runde R6, FAHRPLAN-KANTONE §5 Phase III)
**Status:** Messung abgeschlossen · Umsetzung gelandet in `public/normtext/definitionen.json` · **fachliche Abnahme David offen** (alle Einträge `status: 'entwurf'`)
**Quelle:** die liegenden Norm-Snapshots des Repos, `public/normtext/{bund,kanton}/*.json` — Stand des Korpus-Laufs 29.8.2026, 1 458 Dateien / 56 113 Artikel-Einträge (Bund 227 Erlasse, Kanton 1 231 Erlasse über 26 Kantone). Offline, kein Netz.

## Warum dieses Dossier

Der **implementierte** Regelsatz steht im Kopf von
`scripts/normtext/definitionen-logik.ts` — dort gehört er hin, weil er dort
gelesen wird. Hier steht die **Messung**: welche Kandidaten geprüft wurden, wie
gross ihre Population ist, wie die Stichprobe gezogen wurde und **was mit
welcher Begründung durchgefallen ist**. Ohne das misst die nächste Runde
dieselben sechs Kandidaten noch einmal (§11; Negativbefunde nach
`STANDARDS.md` S5).

## Methode (deterministisch, reproduzierbar)

1. Kandidaten-Regex über ALLE Blocktexte und ALLE lit./Ziff.-Items des Korpus;
   Trefferzahl = Population.
2. Stichprobe: **jeder ⌊N/20⌋-te Treffer** in Korpus-Reihenfolge (systematisch,
   kein Zufall, kein Cherry-Picking). Bei Population < ~80: **Vollerhebung**.
3. Jeder Treffer von Hand als *echt* (Begriffsklärung) oder *unecht*
   (Fiktion · Rechtsfolge · Verweis · Gebot · Aufzählungs-Fortsetzung)
   beurteilt.
4. Aufnahmeschwelle **≥ ~90 %**. Bei `als-gilt` wurde eine ZWEITE, versetzte
   Stichprobe gezogen (Offset 37), weil es die mit Abstand grösste Population
   ist.

## Aufgenommen

| Muster | Population | Stichprobe | echt | Präzision |
|---|---:|---|---:|---:|
| `als-gilt` — «Als X gilt/gelten …» (Inversion) | 1 469 | 2 × 20 | 40/40 | 100 % |
| `legende-einleitung` — Lead-in «In diesem Gesetz gelten als:» + Item «X: …» | 344 | 20 Blöcke (60 Items) | 20/20 | 100 % |
| `kurzform` — «(nachfolgend: X)» / «(im Folgenden «X» genannt)» | 87 | 20 | 20/20 | 100 % |
| `guillemets` — «X» ist/sind … | 75 | Vollerhebung | 75/75 | 100 % |
| `im-sinne` — «X im Sinne dieses/dieser … ist/sind/…» | 47 | 20 | 20/20 | 100 % |
| `legende-marginalie` — Begriffs-Marginalie + Item «X: …» | 22 | Vollerhebung | 22/22 | 100 % |
| `unter-versteht` — «Unter X versteht man / ist … zu verstehen» | 13 | Vollerhebung | 13/13 | 100 % |
| `bedeutet-begriff` — «… bedeutet «X» Y» | 13 | Vollerhebung | 12/13 | 92 % |

Zu `legende-marginalie`: roh 22, davon 2 mit einem Erstwort, das keinen Begriff
eröffnen kann («im Fixzeitenmodell:» — Fallunterscheidung, nicht Term). Der
**Erstwort-Filter** (geschlossene Stoppwortliste: Pronomen, Präpositionen,
Kasus-Artikel ausserhalb des Nominativs) entfernt genau diese beiden; danach
22/22. Derselbe Filter entfernt bei `als-gilt` 20 anaphorische Treffer
(«Als solche gelten insbesondere …») — 1 469 → 1 449 roh.

Zu `bedeutet-begriff`: der eine unechte Treffer ist SSV Art. 68 Abs. 1bis
«Rotes Licht bedeutet «Halt».» — dort steht in den Anführungszeichen das
*Definiens*, nicht das *Definiendum*. Die Regel verlangt darum nach dem
schliessenden Anführungszeichen ein weiteres Wort; damit fällt dieser Fall
strukturell heraus (12/12).

## Verworfen — mit Grund (S5-Negativbefunde)

| Kandidat | Population | Präzision | Warum |
|---|---:|---:|---|
| «gilt als» **nicht** invertiert | 675 | 4/20 = 20 % | Fast durchweg **Fiktion/Rechtsfolge**, nicht Begriffsklärung: «gilt als nicht bestanden», «gelten als genehmigt», «gilt als erbracht», «gilt als im Ausland erbracht». Nur die Inversion stellt den definierten Begriff nach vorn. |
| «bezeichnet» | 804 | 0/12 = 0 % | Im Erlasstext heisst «bezeichnen» **ernennen/bestimmen** («Der Regierungsrat bezeichnet einen Konkurskreis»), nicht «benennt». Der naheliegendste Kandidat ist der wertloseste — genau der Fall, für den die Messung vor dem Bau steht. |
| «im Sinne dieses/dieser …» roh | 181 | 9/20 = 45 % | Überwiegend Rückverweis («Leistungsanspruch im Sinne dieses Gesetzes entsteht»), nicht Definition. |
| «bedeutet/bedeuten» freistehend | 145 | 6/20 = 30 % | Meist Legenden-Lead-in (bereits erfasst) oder gewöhnliches Verb («würde eine Doppelbelastung bedeuten»). |
| Begriffs-Marginalie + «X ist/sind …» | 51 | 44/51 = 86 % | **Unter der Schwelle.** Fehlerklassen: Gleichstellungssätze («Den übrigen juristischen Personen gleichgestellt sind …»), Verweissätze («Die Dispensationsgründe sind in den §§ 20–23 abschliessend genannt»), deontische Sätze («sind in das Budget aufzunehmen»), Aufzählungs-Fortsetzungen. Die zwei **strukturell markierten** Teilmengen sind einzeln aufgenommen (`guillemets`, `legende-marginalie`); der unmarkierte Rest bleibt draussen. |
| «Unter X ist/sind …» ohne «zu verstehen» | 39 | 5/20 = 25 % | «Unter Vorbehalt von Artikel 26 ist …» dominiert. |

Die Marginalie «Begriff(e)/Definition(en)» selbst kommt an **90** Artikeln vor;
sie ist ein guter *Zusatz*-Trigger, aber als alleinige Regel untauglich (sie
sagt nichts darüber, welcher Term definiert wird).

## Fremdsprachen — gezählt, NICHT aufgenommen

| Muster | Treffer |
|---|---:|
| fr «est/sont réputé(e)(s)» | 4 |
| fr «au sens de la présente …» | 4 |
| fr «on entend par» | 0 |
| it «ai sensi del/della presente» | 0 (die 2 `ai sensi`-Treffer sind Verweise auf Bundesrecht) |
| it «si intende per» | 0 |

Der fr/it-Teilkorpus (FR GE JU NE TI VD, zusammen 33 Erlasse / 1 453 Artikel)
ist für eine tragfähige Stichprobe zu dünn. Die Regeln bleiben
**unimplementiert**, statt ungemessen übernommen zu werden (§7). Aufnahme erst
mit eigener Stichprobe — offener Rest, siehe FAHRPLAN-KANTONE §5-R6.

## Nebenbefund am Korpus (nicht in dieser Runde gefixt)

Die **lit.-Marke ist im Korpus nicht eindeutig**: **623 Blöcke** tragen doppelte
Item-Marken. Grösstenteils Spiegelstrich-Punkte (`–`), aber auch echte
Verkürzungen — **HMG Art. 4 Abs. 1 hat sechs Punkte mit der Marke `a`**
(asexies … werden von der Fedlex-Extraktion auf `a` verkürzt; betroffen auch
DSG Art. 5). Das Tor `check:definitionen` wurde daran beim ersten Lauf rot.

**Regel für jede weitere Runde, die auf Aufzählungspunkte zeigt** (R2 Tabellen,
R3 Fussnoten, R5 Verweise): Anker ist der **Item-Index**, die Marke ist ein
Anzeigefeld und nie ein Schlüssel.

Ob die Marken-Verkürzung selbst ein Extraktions-Defekt ist, den der Bund-Adapter
beheben sollte, ist hier **nicht** entschieden — der Befund ist benannt, der Fix
gehört in einen eigenen, deklarierten Schritt (`scripts/normtext-snapshot.ts`,
fremde Bau-Fläche).

## Pflegebedarf

- **Gering.** Die Regeln lesen nur die liegenden Snapshots; kein Netz, kein
  externer Endpunkt, keine Datierung ausser `--datum`.
- Wächst der Korpus (neue Kantone/Erlasse), läuft der Generator ohne Änderung
  mit; `check:definitionen` wird rot, wenn das Artefakt nicht nachgezogen wurde.
- **Neu zu messen** ist nur, wenn ein Muster ERWEITERT werden soll — dann gilt
  dieselbe Methode oben, und die Zahlen hier werden **ergänzt, nicht
  überschrieben** (die Messwerte sind datiert und altern nicht).
