# Sachgebiets-Klassierung der Rechtsprechung — J3-Regelwerk und Quirks (29.8.2026)

**Anlass:** W2·10-UI-NAV-J3 («Sachgebiets-Pipeline verfeinern», FAHRPLAN-UI-NAVIGATION §6).
Befund der Ultracode-Synthese 11.7.2026 (#23), am 29.8.2026 am Ist-Korpus reproduziert:
BGE 150 II 300 (BGFA, Anwaltsaufsicht) stand unter «Steuern & Sozialversicherung»;
der Topf `sozial-abgaben` war mit 1844/6341 Register-Einträgen (29 %) der grösste.

## Regel (deterministisch, §2 — Stand 29.8.2026)

Klassierungs-Kette je Entscheid (`mappeEntscheidOCL`, `scripts/normtext/entscheide-mapping.ts`):

1. **2A/2C/2D (II. öffentlich-rechtliche Abteilung, Bund):** Norm-Signal aus den
   ausdrücklich zitierten Erlassen (`NORM_SIGNAL`, deklarierte Prioritätsliste:
   AIG/AsylG/BewG → öffentlich · **BGFA → öffentlich (neu J3)** · DBG/StHG/MWStG/VStG
   → sozial-abgaben) ?? **Roh-StG-Signal** (`zweierRohSteuerSignal`: «StG»/
   «Steuergesetz» in den Roh-zitierten Normen → sozial-abgaben; kantonale
   Steuergesetze tragen keinen Register-Key) ?? **`legal_area` GEFILTERT** auf die
   Steuer-Frage (`zweierLegalAreaSignal`: nur STEUER-Begriffe — tax/steuer/impôt/
   fiscal — zählen; 'civil'/'criminal' UND 'social_insurance' sind auf der 2er-
   Abteilung unplausibel, Art. 31/32 BgerR; Beleg BGE 151 II 726) ?? **Abteilungs-Default `oeffentlich`
   (neu J3; vorher pauschal `sozial-abgaben`)**.

   Amtliche Grundlage: Art. 30 BgerR (SR 173.110.131, Konsolidierung 2026-02-01,
   [Fedlex-XML](https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2006/834/20260201/de/xml/fedlex-data-admin-ch-eli-cc-2006-834-20260201-de-xml.xml),
   Abruf 29.8.2026): Ausländerrecht, internationale Steueramtshilfe, öffentliches
   Wirtschaftsrecht inkl. Beschaffungswesen und freie Berufe; «Steuern und
   Abgaben» sind SEIT 1.1.2023 bei der III. öffentlich-rechtlichen Abteilung
   (Art. 31 lit. a BgerR, AS 2023 65) — der Altbestand 2A/2C bis 2022 enthält
   sie noch, darum die Signal-Kette.
2. Übrige BGer-Abteilungen: amtliche Geschäftsverteilung (`ABTEILUNG`), unverändert
   (4A/5A privat · 6B straf · 1B/7B prozess · 1C öffentlich · 8C/9C sozial-abgaben).
3. Kantonal: Aktenzeichen-Präfixe (`KANT_PRAEFIX`), unverändert.
4. Fallback: `legal_area`, zuletzt `oeffentlich`.
5. **Amtliche BGE:** unterliegendes aza-Urteil klassiert (Kette oben); ohne
   auflösbares aza das Band (I/II → öffentlich · III → privat · IV → straf ·
   V → sozial-abgaben).

**Bewusste §7-Abweichung vom Fahrplan-Wortlaut («BGFA/BV → Öffentliches Recht»):**
Die BV ist NICHT als Norm-Signal umgesetzt. Messgrund (präzisiert durch die
Gegenprüfung: 109/182 = 60 % der Entscheide mit Steuer-Key zitieren zusätzlich die
BV): als Signal hätte sie diese echten Steuerfälle nach «öffentlich» gekippt
(Gegenbeleg BGE 149 I 125: zitiert Art. 8 BV, ist reine Grundstücksteuer). Ihren
Zweck — verfassungsrechtliche 2er-Fälle nicht als Steuern zu etikettieren — erfüllt
der neue Abteilungs-Default `oeffentlich` deterministisch.

**Ebenfalls bewusst NICHT gebaut:** redaktionelle Einzel-Umklassierungen (wäre
Fachkuration → Zeitsperre, Fahrplan §6/J3) und ein hartes Band-Mapping für BGE:
Messung 29.8. zeigte, dass die aza-basierte Klassierung FEINER ist als das Band
(z. B. 72 Band-IV-BGE korrekt als «prozess», 1B/7B-Haft- und Beschwerdefälle).

## Durchgeführter Bestands-Regen

`scripts/normtext/remap-sachgebiet-j3.ts` (Scope eng: Bund-2er-Abteilung + BGE der
Bände I/II mit 2er-aza; alles Übrige byte-gleich), zwei Läufe (Erstlauf + Korrektur-
lauf nach Gegenprüfungs-Runde 1). Endstand gegen die Basis (nach Bug-Check-Nachschärfung B2, 29.8.2026): **119
geänderte Snapshots**, im nutzersichtbaren Register **237 Wechsel** (BGE-Einträge
ziehen je einen `__voll`-Verweis-Eintrag mit) (BGE-Einträge ziehen je
einen `__voll`-Verweis-Eintrag mit): 227 `sozial-abgaben → oeffentlich`,
8 `privat → oeffentlich`, 2 `privat → sozial-abgaben`; Einträge vorher = nachher
= 6341. Projektionen (register.json, norm-index, bezuege) regeneriert; dabei zog
die seit PR #476 (LM-168) stale Wortgrenzen-Kürzung von `regesteKurz` nach
(deklariert; Gegenprüfung: alle 1278 Abweichungen echte Präfixe, kein Inhaltsverlust).

**Gegenprüfungs-Runde 1 (unabhängiger Opus-Agent, 29.8.2026) — Verdikt «widerlegt»,
Befunde eingebaut:** F1 ungefilterte `legal_area` kippte 2D-/2C-Fälle nach «privat»
(BGE 152 II 142 Beschaffungsrecht, BGE 151 II 46) → `zweierLegalAreaSignal`-Filter.
F2/F3 Signal-Quelle des Re-Maps war das auf 8 Einträge GEKAPPTE `zitierteNormen` —
echte Steuer-/Zollfälle (BGE 149 I 125, 149 II 129, 148 II 491, 150 II 390,
146 I 105) kippten nach «öffentlich» → Signal jetzt aus den vollen `normKeys` +
Roh-StG-Signal. Kommentar-Beleg auf Art. 30/31 BgerR korrigiert (Steuern seit
1.1.2023 bei der III. Abteilung).

## Quirks (Q-J3, nach Q1/Q4-Muster)

- **Q-J3-1 · Offline-Signalquelle beim Re-Map (präzisiert):** Vom aza-Urteil ist
  offline nur das Aktenzeichen persistiert; Signal-Quellen sind die Felder des
  Snapshots SELBST — die vollen `normKeys` (NICHT `zitierteNormen`: dieses Feld ist
  im Snapshot auf 8 alphabetisch sortierte Einträge gekappt, Gegenprüfungs-Befund
  F3) plus die gekappten Roh-Strings fürs StG-Signal. Der Live-Import rechnet mit
  den Feldern des gemappten OCL-Records (statutes vollständig) — deklarierte
  Divergenzquelle; deterministisch bleibt beides.
- **Q-J3-5 · Restklasse ohne Signal:** Kantonale Abgabefälle der 2er-Abteilung, die
  weder einen Bundes-Steuer-Key noch «StG»/«Steuergesetz» im Roh-String noch eine
  Steuer-`legal_area` tragen, bleiben beim Default `oeffentlich` — deterministisch
  ehrlich, aber fachlich ggf. Abgaberecht. Redaktionelle Einzel-Umklassierung ist
  per J3-Spec verboten (Fachkuration); das «maschinell»-Etikett deckt §8.
- **Q-J3-6 · BGFA-vor-Steuer-Priorität ist auf dem Bestand nicht falsifizierbar:**
  0/6341 Einträge tragen BGFA UND einen Steuer-Key (Messung Gegenprüfung); belegt
  nur durch den synthetischen Unit-Test. Bei Korpus-Wachstum am ersten echten
  Kollisionsfall prüfen.
- **Q-J3-2 · `STG` ist totes Signal:** steht in `NORM_SIGNAL`, erzeugt aber nie
  einen Treffer, weil `STG` in `ABK_AUSSCHLUSS` liegt (föderal/kantonal mehrdeutig).
  Bewusst belassen (Dokumentation der Absicht), Wirkung null.
- **Q-J3-3 · `sozial-abgaben` bleibt ein Doppel-Topf:** Steuern & Abgaben und
  Sozialversicherung teilen ein Sachgebiet (1619 Einträge nach Regen). Eine Trennung
  wäre eine Taxonomie-Änderung über Rechtsprechung UND /gesetze (SSoT) — Fahrplan
  sagt «ggf.», Entscheid liegt bei David (§Y-Vorlage, siehe Fahrplan §6/J3).
- **Q-J3-8 · Re-Map-Signal breiter als Live-Signal (Bug-Check B2, 29.8.2026):**
  Der Re-Map speist die Kette aus den vollen `normKeys` (statutes + Fliesstext),
  der Live-Import BEWUSST nur aus den statutes (adapter-entscheide.ts, «schmale
  statutes-Menge»). Messung: 29/214 Scope-Snapshots (13,6 %) tragen ihr Signal in
  einem Key, der in den Roh-zitierten Normen nicht vorkommt (z. B. 146 I 105:
  VSTG nur im Fliesstext). Ein voller Live-Re-Import könnte diese Fälle anders
  klassieren — beide Ketten sind gegen­geprüft-deterministisch, aber nicht
  deckungsgleich (§5-Rest). Vereinheitlichung (eine Signal-Quelle für beide
  Pfade) als Folge-Posten im Fahrplan §6/J3-Rest vermerkt.
- **Q-J3-9 · Orphan-Wache ist binär (Bug-Check, 29.8.2026):** Die Harvest-Wache
  in `soft-law-projektion-run.ts` prüft nur `kanten.length > 0` — eine TEILWEISE
  gefüllte soft-law.db passierte sie, und die Orphan-Bereinigung löschte den
  Rest. Gleiches Verhalten wie die Tor-Wache (`check-materialien.ts`); bei einem
  echten Teil-Harvest-Fall beide zusammen härten.
- **Q-J3-7 · normKeys speisen sich auch aus dem Fliesstext (W2·6-NKEY):** beiläufige
  Erlass-Nennungen im Erwägungstext können das Sachgebiet setzen — Beleg BGE
  150 II 390 (CO₂-Sanktion): der MWSTG-Key stammt aus einer Definitionsklammer
  «(vgl. Art. 70 ZG; Art. 51 MWSTG)», nicht aus dem Streitgegenstand; Ergebnis
  `sozial-abgaben` vertretbar (Abgabecharakter), Herleitung schwach. Rückbau lohnt
  nicht (Gegenprüfung Runde 2), aber Falle dokumentiert; Folgeschritt-Idee: Messung
  «Steuer-Key nur im Fliesstext, nicht in der Regeste» über die normSignal-Fälle.
- **Q-J3-4 · Kantonale Präfix-Kollision `BV`/`SG`:** In `KANT_PRAEFIX` meint `BV`
  Berufliche Vorsorge und `SG` das Schiedsgericht Sozialversicherung BS — nicht
  Bundesverfassung/St. Gallen. Nur Aktenzeichen-Ebene, keine Norm-Keys.

**Offene Kleinreste aus Gegenprüfungs-Runde 3 (29.8.2026, alle leicht, beim
Q-J3-8-Folge-Posten miterledigen):** (H2) der Array-Guard vor
`zweierRohSteuerSignal` ist wirkungslos (String-Eingabe lieferte auch vorher
null) und die Schwesterstelle `statutesZuNormKeys(det.statutes ?? [])` ist
ungeschützt — beides angleichen oder beides streichen (§17 Ziff. 2); (H3) der
Kommentar zum Unterstrich-Fix in `remap-sachgebiet-j3.ts` nennt den falschen
Grund — richtig ist: 29 Unterstrich-Nummern existieren, aber alle bger/bpatger,
`bgeBand` läuft nur auf `gericht==='bge'`; (H4) `/imp[oô]t/` matcht Substrings
(korpus-irrelevant). Lesemodus-Overlay: Maschinen-Hinweis nur per Hover (§8-Rest).

**Pflege:** Neue 2er-relevante Erlasse (z. B. StAhiG, BüG) bei Bedarf in
`NORM_SIGNAL` deklarieren — Priorität ist die Listen-Reihenfolge, empirisch am
Korpus messen (Muster: `remap-sachgebiet-j3.ts` DRY-RUN).

**UI-Etikett (§8, Endstand nach Bug-Check B1):** Der Entscheid-Kopf trug das
«maschinell»-StatusBadge BEREITS (V1.2/W2·7-VZUI) — der J3-Erstlauf hatte es
dupliziert (dazu versal/mono im lc-overline), zurückgenommen 29.8.2026. J3
ergänzt nur `title`-Hinweise «Sachgebiet maschinell zugeordnet» direkt am
Sachgebiets-Label (Leser-Köpfe, EntscheidZeile, EntscheidKarte).

**Abnahme-Status:** maschinell umgesetzt, fachliche Abnahme der Klassierungs-Regeln
durch David offen (§7); UI etikettiert das Sachgebiet seit J3 als «maschinell».
