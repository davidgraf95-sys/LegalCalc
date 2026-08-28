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
   → sozial-abgaben) ?? OCL-`legal_area` ?? **Abteilungs-Default `oeffentlich`
   (neu J3; vorher pauschal `sozial-abgaben`)**.
2. Übrige BGer-Abteilungen: amtliche Geschäftsverteilung (`ABTEILUNG`), unverändert
   (4A/5A privat · 6B straf · 1B/7B prozess · 1C öffentlich · 8C/9C sozial-abgaben).
3. Kantonal: Aktenzeichen-Präfixe (`KANT_PRAEFIX`), unverändert.
4. Fallback: `legal_area`, zuletzt `oeffentlich`.
5. **Amtliche BGE:** unterliegendes aza-Urteil klassiert (Kette oben); ohne
   auflösbares aza das Band (I/II → öffentlich · III → privat · IV → straf ·
   V → sozial-abgaben).

**Bewusste §7-Abweichung vom Fahrplan-Wortlaut («BGFA/BV → Öffentliches Recht»):**
Die BV ist NICHT als Norm-Signal umgesetzt. Messgrund: praktisch jeder Steuerentscheid
zitiert die BV (Art. 127); als Signal (vor `legal_area`) hätte sie echte Steuerfälle
ohne DBG/StHG-Nennung nach «öffentlich» gekippt. Ihren Zweck — verfassungsrechtliche
2er-Fälle nicht als Steuern zu etikettieren — erfüllt der neue Abteilungs-Default
`oeffentlich` deterministisch.

**Ebenfalls bewusst NICHT gebaut:** redaktionelle Einzel-Umklassierungen (wäre
Fachkuration → Zeitsperre, Fahrplan §6/J3) und ein hartes Band-Mapping für BGE:
Messung 29.8. zeigte, dass die aza-basierte Klassierung FEINER ist als das Band
(z. B. 72 Band-IV-BGE korrekt als «prozess», 1B/7B-Haft- und Beschwerdefälle).

## Durchgeführter Bestands-Regen

`scripts/normtext/remap-sachgebiet-j3.ts` (Scope eng: Bund-2er-Abteilung + BGE der
Bände I/II mit 2er-aza; alles Übrige byte-gleich): **119 Wechsel** von 5093
Snapshots — 115 `sozial-abgaben → oeffentlich`, 2 `privat → oeffentlich`,
2 `sozial-abgaben → privat`. Projektionen (register.json, norm-index, bezuege)
regeneriert; dabei zog die seit PR #476 (LM-168) stale Wortgrenzen-Kürzung von
`regesteKurz` nach (deklariert, unit-getestet, reine Anzeige).

## Quirks (Q-J3, nach Q1/Q4-Muster)

- **Q-J3-1 · Offline-Signalquelle beim BGE-Re-Map:** Vom aza-Urteil ist offline nur
  das Aktenzeichen persistiert; Signal-Quelle des Re-Maps sind die zitierten Normen
  und `legalArea` des BGE-Snapshots SELBST (derselbe Fall, dieselben Erlasse). Der
  Live-Import rechnet mit den Feldern des jeweils gemappten OCL-Records — minimale,
  deklarierte Divergenzquelle; deterministisch bleibt beides.
- **Q-J3-2 · `STG` ist totes Signal:** steht in `NORM_SIGNAL`, erzeugt aber nie
  einen Treffer, weil `STG` in `ABK_AUSSCHLUSS` liegt (föderal/kantonal mehrdeutig).
  Bewusst belassen (Dokumentation der Absicht), Wirkung null.
- **Q-J3-3 · `sozial-abgaben` bleibt ein Doppel-Topf:** Steuern & Abgaben und
  Sozialversicherung teilen ein Sachgebiet (1725 Einträge nach Regen). Eine Trennung
  wäre eine Taxonomie-Änderung über Rechtsprechung UND /gesetze (SSoT) — Fahrplan
  sagt «ggf.», Entscheid liegt bei David (§Y-Vorlage, siehe Fahrplan §6/J3).
- **Q-J3-4 · Kantonale Präfix-Kollision `BV`/`SG`:** In `KANT_PRAEFIX` meint `BV`
  Berufliche Vorsorge und `SG` das Schiedsgericht Sozialversicherung BS — nicht
  Bundesverfassung/St. Gallen. Nur Aktenzeichen-Ebene, keine Norm-Keys.

**Pflege:** Neue 2er-relevante Erlasse (z. B. StAhiG, BüG) bei Bedarf in
`NORM_SIGNAL` deklarieren — Priorität ist die Listen-Reihenfolge, empirisch am
Korpus messen (Muster: `remap-sachgebiet-j3.ts` DRY-RUN).

**Abnahme-Status:** maschinell umgesetzt, fachliche Abnahme der Klassierungs-Regeln
durch David offen (§7); UI etikettiert das Sachgebiet seit J3 als «maschinell».
