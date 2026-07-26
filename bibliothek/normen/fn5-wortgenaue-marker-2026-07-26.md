# FN-5/M14 — wortgenaue Fussnoten-Marker: Verfahren, Coverage, Restklassen (W2·5d)

**Erstellt:** 26.7.2026 · Anlass: ROADMAP-Schritt `W2·5d` / FN-5 (Bau-Auftrag David
25.7.2026, «nächste Session … am richtigen Ort»); Spec `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`
§M14 (Sidecar-Variante) + `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F1.
**Status:** ERSTRECHERCHE + adversariale Gegenprüfung gemäss Skill »gegenpruefung«
(Verdikt im PR-/Commit-Trailer dieser Bau-Einheit; Register `bibliothek/gegenpruefung-register.md`).
**Quellen:** Gepinnte Fedlex-Filestore-HTMLs (via `scripts/fedlex-cache.sh`,
kanonische html-N-Pins, geladen 26.7.2026) für alle 227 Bund-Erlasse; eigener
Korpus `public/normtext/{bund,struktur/bund}` (generator-erzeugt aus genau
diesen Pins). Werkzeug: `scripts/normtext/fussnoten-offsets.ts` (deterministisch, §2).

## 1 · Regel (Eingabe → Ausgabe)

Für jeden Fussnoten-Marker `<sup><a href="#fn-…">N</a></sup>` im Artikel-Body
wird die wortgenaue Position im Snapshot-Blocktext berechnet:
`pos = { b: Block-Index, it?: Item-Index, o: Zeichen-Offset, l: Textlänge }`,
gespeichert im Struktur-Sidecar (`fussnoten[].pos`). Verfahren: Platzhalter-Parse
(Marker → U+E000/U+E001-Token) durch die UNVERÄNDERTE Snapshot-Pipeline
(`parseArtikelInner`), dann Zwei-Zeiger-Ausrichtung gegen den Referenz-Parse.
**Ein Offset wird NUR emittiert, wenn die Ausrichtung zeichengenau bis zum
Textende gelingt** — sonst Fallback aufs bisherige Verhalten (Marker am
Absatz-/Item-Ende). Haupt-Snapshots byte-unverändert (M14-Gating «Sidecar hält
golden»); Drift-Riegel `l` lässt den Reader Offsets verwerfen, wenn Sidecar und
Snapshot nicht aus demselben Lauf stammen.

## 2 · Korpuszahlen (Lauf 26.7.2026, 227/227 Bund-Erlasse)

| Klasse | n | pos? | Begründung |
|---|--:|---|---|
| Kopf-/Marginalien-Fussnoten (Artikelebene) | 8'861 | nein | Marker sitzt amtlich auf `<h6>`-Kopf — keine Textstelle |
| Sektions-/Randtitel-Fussnoten (G11) | 1'582 | nein | Marker am Sektions-Kopf — keine Textstelle |
| Block-verortete Marker **mit** Wortposition | **16'881** | **ja** | zeichengenau bewiesen (81.5 % der block-verorteten) |
| Block-verortete ohne pos (Fallback) | 3'822 | nein | s. Ziff. 3 |
| Item-Positionen (Teilmenge von «mit») | 2'999 | ja | Offset in `items[j].text` |

Differ-Beweis der Regeneration: alle 227 Sidecars unterscheiden sich von den
Vorfassungen **nur** durch `erzeugt` + hinzugefügte `pos`-Felder (Skript-Lauf
26.7.2026, 0 Verletzungen); Checkbox-/Strukturvergleich `check:struktur-konsistenz` grün.

## 3 · Restklassen (ausgewiesen, kein stiller Verlust)

1. **`<dt>`-Marken-Fussnoten** (Hauptteil der 3'822, z. B. AHVG Art. 3 lit. a):
   der Marker klebt amtlich an der lit.-MARKE («a.⁴²»), nicht im Item-Text —
   eine Wortposition im Text existiert nicht. Render bleibt am Item-Ende.
   *Möglicher Folgeschritt:* Marker an der Marke rendern (reine Darstellung, S).
2. **Ausrichtungs-Fallback**: Blöcke, in denen der Platzhalter-Parse die
   Struktur verändert oder die Ausrichtung nicht zeichengenau gelingt →
   bewusst KEIN Offset (lieber Blockende als geratene Position, §1/§7).
3. **Satzend-Marker nach Interpunktions-Wrappern**: Fedlex setzt Schlusspunkte
   teils in `<span style="color:…">` und Spacer-`<sup> </sup>` VOR den Marker
   (ELG 10 fn42 · VG 20 fn46 · VSTG 5 fn34, geprüft am Pin 26.7.2026) — der
   Marker steht amtlich NACH dem Punkt; `pos.o == l` ist dort korrekt.

## 4 · Stichproben-Verfahren (Wortlaut je Defektklasse)

Deterministische Stichprobe (jede 80. pos-Fussnote, n=212) gegen den gepinnten
Cache: Wort unmittelbar vor dem Marker im HTML ↔ Wort am Offset im Snapshot.
176 direkt bestätigt, 29 nicht auswertbar (Regex-Grenzen der Probe, nicht der
Pipeline), 7 Auffälligkeiten einzeln aufgeklärt (alle = Klasse Ziff. 3.3 bzw.
Artefakte der Proben-Regex; kein Positionsfehler). Unabhängige Re-Derivation:
adversariale Gegenprüfung (eigener Agent, frischer Kontext, anderes Modell).

## 5 · Pflegebedarf

- Regeneration der Sidecars (`npm run normtext:struktur`) berechnet `pos` bei
  jedem Lauf neu — kein separater Pflegelauf.
- Kippt ein künftiger Fedlex-Re-Pin die Textbasis, verwirft der `l`-Riegel im
  Reader veraltete Offsets automatisch (Fallback Blockende, nie falsche Stelle).
- Wächter: `e2e/fn5-wortposition.e2e.ts` (ZGB 798a fn667 mitten im Satz ·
  KKV-FINMA 60 fn14) + Unit `src/tests/fussnoten-offsets.test.ts` (inkl.
  Negativ-Fälle, §6.7).
