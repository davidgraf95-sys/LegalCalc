# Artikel-Revisions-Extrakt — Zensus der amtlichen Fussnoten-Formulierungen

**Ausführungsbeleg §11 · 26.7.2026 · Fable-5-Bau-Session (Befund-Fix H1-Gegenprüfung W2·5i).**
**Stand:** 26.7.2026, Korpus `public/normtext/struktur/bund/*.json` (202 Erlasse mit Shard,
31 145 Fussnoten). **Status:** ZWEIFACH GEPRÜFT (Bau + adversariale Gegenprüfung Opus,
frischer Kontext, gegen amtliche Fedlex-Fassungen); fachliche Abnahme durch David offen.

Welche amtlichen Formulierungen einer **datierten Textänderung** der Parser
`src/lib/verzahnung/revisionen-extrakt.ts` erkennt (→ Shards
`public/verzahnung/artikel-revisionen/<KEY>.json`, Chronologie-Ansicht W2·5i H1) — und
welche Rest-Familie er (noch) nicht erkennt.

## 1. Quelle + Stand

- **Korpus:** Revisions-Fussnoten der Bund-Struktur-Sidecars (deterministische Projektion
  der amtlichen Fedlex-AKN-Fassungen; §7-Kette dort dokumentiert).
- **Gegenprüfung 26.7.2026 (Opus, 2 Runden):** 17 Artikel in 14 Erlassen unabhängig gegen
  die live per SPARQL (`dateApplicability`-Fenster) aufgelösten amtlichen Filestore-XML
  re-deriviert, Werte VOR Shard-Einsicht notiert; Protokoll-Kern im Commit/PR referenziert.

## 2. Regel (deterministisch, Eingabe → Ausgabe)

**Erkannt (Stand 26.7.2026), je Klausel Datum + AS-Fundstelle, je Artikel max über alle
Fussnoten:**

1. «**in Kraft seit** \<D. Mon. JJJJ\>» (Neufassung/Einfügung) — inkl. belegte
   Fedlex-Tippfehler «seit seit», «seit.».
2. «**mit Wirkung seit** \<D. Mon. JJJJ\>» (Aufhebung als Textänderung).
3. «**in Kraft vom** \<D. Mon. JJJJ\> **bis zum** \<D. Mon. JJJJ\>» (befristete
   Inkraftsetzung; massgeblich das **Anfangs**-Datum) — inkl. **Jahr-Ellipse**
   «in Kraft vom 21. März bis zum 20. Sept. 2020» (Jahr nur beim Enddatum, gilt für beide;
   AHVV Art. 41bis) und Nachsätzen («…, ab dem 1. Juli 2026 unbefristet», VTS Art. 95;
   «bis längstens zum …», ParlG Art. 10b). Korpus-Familie: 59 Fussnoten, 41 Artikel-Deltas
   (35 neu datiert + 6 später).
4. **Fremd-Adressierungs-Wächter:** Einer Klausel unmittelbar vorangestelltes
   «Art. \<Nr\>» (markup-tolerant, «Art. 40<i>c</i>») adressiert den GENANNTEN Artikel —
   sie zählt für den Host-Artikel nur bei Token-Gleichheit (korpusweit 2 Fälle, beide
   fremd-adressiert: AHVG Art. 39-Fussnote → Art. 40c; OR Art. 732-Fussnote → Art. 734f).

**Nicht erkannt — Rest-Familie (Zensus Gegenprüfung 26.7.2026, 46 distinkte Artikel):**

| Form | Artikel | Beispiel-Fundorte |
|---|---|---|
| «, Kraft seit» (fehlendes «in») | 19 | MSchG 13/41/53 … |
| «trat(en)/tritt … am \<Datum\> in Kraft» | 8 | AHVG 154, AVIG 22a, MWSTG 116 … |
| «In Kraft seit» (Satzanfang) | 7 | BetmG 3e, FAV 11, FDV 10e … |
| «in Kraft \<Datum\>» (ohne «seit») | 3 | BVG 60, MSchG 44, BKV 7 |
| «mitWirkung seit» (fehlender Blank) | 2 | AVO 60/61, IVV 80 |
| «in Kraft getreten am» | 2 | PVÜ 13/14 |
| «mit Wirkung am» | 2 | EOG 30/34 |
| Einzelfälle («in Kraft für die Schweiz seit» CMR 23 · «mit Wirkung \<Datum\>» BBG 48a · «seit in Kraft» BKV 7 · «mit Wirkung ab dem» BPR 18) | 4 | — |

Diese Artikel erscheinen in der Chronologie-Ansicht weiterhin unter «ohne Datum» —
ehrlich ausgewiesen (§8), aber Ordnungs-Lücke derselben §1-Klasse wie der behobene
Befund. «mit Wirkung vom» kommt im Korpus nicht vor (0 Treffer).

## 3. Geltungsbereich + Ausnahmen

- Nur **Bund**-Sidecars (Generator-QUELLE); Kantone haben keinen Revisions-Extrakt.
- Der Wächter (Regel 4) verwirft eine Art.-adressierte Klausel bei UNBEKANNTEM Host
  konservativ (§1: lieber kein Datum aus der Klausel als ein fremdes); der genannte
  Artikel selbst erhält das Datum nur, wenn die Fussnote auch an ihm hängt (AHVG
  Art. 40c: hängt nur am Gliederungstitel → Art. 40c bleibt undatiert — bekannte
  Sidecar-Attributions-Grenze, nicht Parser-Fehler).
- Präfix-Fenster 40 Zeichen: eine Art.-Bezeichnung, die weiter als 40 Zeichen vor dem
  Trigger steht (z. B. mit langem Abs.-Einschub), würde nicht erkannt — korpusweit
  aktuell ohne Beleg-Fall.

## 4. Pflegebedarf

- Rest-Familie (46 Artikel): eigener, deklarierter Folge-Schritt (Golden-Wirkung;
  Risikopfad ⇒ Gegenprüfung) — Aufnahme über ROADMAP-Eingang, nicht nebenbei.
- Bei Korpus-Erweiterung Zensus wiederholen: `grep -ohE` der Formen aus §2 über
  `public/normtext/struktur/bund/*.json`; neue Varianten hier nachtragen.

## 5. Abnahme-Status

Bau (TDD, Fixtures = amtliche Wortlaute) + adversariale Gegenprüfung Opus in 2 Runden:
Runde 1 **widerlegt** (Befund F1 Scope-Leak AHVG Art. 39 → Wächter Regel 4 gebaut),
Runde 2 auf dem nachgebesserten Diff. Fachliche Abnahme durch David offen.
