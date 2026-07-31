// scripts/plan/inventar.ts
// Kanonische ID-Liste der etikettierbaren Einheiten (Geltungsbereich, FAHRPLAN-PLAN-STEUERUNG.md).
export const INVENTAR: readonly string[] = [
  'S0',
  'W1·1', 'W1·2', 'W1·3', 'W1·4',
  'W2·5', 'W2·5b', 'W2·5c', 'W2·5d', 'W2·6', 'W2·7', 'W2·8', 'W2·9',
  'W3·10', 'W3·11', 'W3·12', 'W3·13', 'W3·14',
  'LERNPHASE-AB', 'QS-GP', 'QS-PH', 'SEO-A11Y', 'QS-PERF', 'QS-DATA', 'QS-CURRENCY', 'QS-TOK',
  'W2·6-B', 'W2·6-DATA', 'W2·6a-MAT', 'W2·7-VZUI', 'W2·10-UI-NAV', 'W2·11-DESIGN',
  'W3·14-Responsive-Audit', 'W3·14-Responsive-Defekte', 'W3·14-S', 'W3·14-a11y', 'QS-WISSEN',
  'W2·12-HYGIENE', 'QS-OPT', 'QS-BASIS',

  // 'W2·12-HYGIENE' stand hier ein zweites Mal — Dublette entfernt 31.7.2026 (AP-6, QS-TOK).
  // Rein mechanisch: check.ts Regel 1 iteriert das Inventar und prüft nur die Existenz eines
  // @meta je ID, ein Doppeleintrag prüfte also zweimal dasselbe. Kein Verhaltensunterschied.
  'W2·13-KANTONE',

  // Ideen-Intake 20.7.2026 (§14): 8 Alleinstellungs-Ideen verortet.
  'W1·5-PRAXIS', 'W2·5g-ZEIT', 'W2·5h-GESETZ-UI', 'W2·6-ZNETZ', 'W2·14-SIGNAL', 'W3·15-RICHTER', 'QS-UI',

  // §14-Intake 20.7.2026 (2. Welle, Befunde des Tages). Label-Vergabe bewusst geprüft:
  // W2·5e/5f sind VERBRANNT (am 20.7. doppelt vergeben, danach auf 5g/5h umbenannt) —
  // die Reihe wird darum bei 5i fortgesetzt, nicht mit den freigewordenen Buchstaben.
  'W2·5i-HIST-ANSICHT', 'W2·5j-TABELLEN', 'W2·6-FILTER', 'W2·6-RNAME',
  'W2·15-CLS', 'W2·16-INVENTAR', 'W2·16-ANLEITUNG', 'QS-AUTOMATIK',

  // §14-Intake 21.7.2026: normKeys-Abdeckung (Anlassfall bge_148_II_475 ohne KG-Verzahnung).
  'W2·6-NKEY',

  // §14-Intake 24.7.2026 (Anmerkungs-Session David): Verzahnungs-Fundament + FINMA-Materialien.
  'W2·7-BEZUG', 'W2·7-BEZUG-B7', 'W2·6b-MAT-FINMA',

  // §14-Intake 31.7.2026 (AP-9, QS-TOK-Aufräumwelle): externe UI-Befundliste (Cowork 29.7.2026,
  // 210 Befunde) — Dachschritt + 20 Batches (19 Bau + 1 Prüf-Batch), Fahrplan FAHRPLAN-UI-BEFUNDE.md.
  'W2·17-UI-BEFUNDE', 'W2·17-UI-BEFUNDE-B1', 'W2·17-UI-BEFUNDE-B2', 'W2·17-UI-BEFUNDE-B3',
  'W2·17-UI-BEFUNDE-B4', 'W2·17-UI-BEFUNDE-B5', 'W2·17-UI-BEFUNDE-B6', 'W2·17-UI-BEFUNDE-B7',
  'W2·17-UI-BEFUNDE-B8', 'W2·17-UI-BEFUNDE-B9', 'W2·17-UI-BEFUNDE-B10', 'W2·17-UI-BEFUNDE-B11',
  'W2·17-UI-BEFUNDE-B12', 'W2·17-UI-BEFUNDE-B13', 'W2·17-UI-BEFUNDE-B14', 'W2·17-UI-BEFUNDE-B15',
  'W2·17-UI-BEFUNDE-B16', 'W2·17-UI-BEFUNDE-B17', 'W2·17-UI-BEFUNDE-B18', 'W2·17-UI-BEFUNDE-B19',
  'W2·17-UI-BEFUNDE-B20',

  // AP-6 (QS-TOK-Aufräumwelle, 31.7.2026): Session-Granularität — offene Mehr-Sessions-Schritte
  // in Teilschritte zerlegt, die plan:next einzeln ausgibt und EINE Session abschliessen kann.
  // Der jeweilige Elter behält sein @meta und bleibt das Dach.
  'W2·5d-EID3', 'W2·5d-ANNEX', 'W2·5d-SPY', 'W2·5d-YC',
  'W2·6-MEHRSPRACH', 'W2·6-RESOLVER', 'W2·6-ADRESSEN', 'W2·6-UEBERSICHT',
  'W2·10-UI-NAV-S', 'W2·10-UI-NAV-V', 'W2·10-UI-NAV-VR', 'W2·10-UI-NAV-R1', 'W2·10-UI-NAV-R2',
  'W2·10-UI-NAV-R3', 'W2·10-UI-NAV-R4', 'W2·10-UI-NAV-J', 'W2·10-UI-NAV-J3', 'W2·10-UI-NAV-O',
  'W2·10-UI-NAV-Z',
  'W2·11-DESIGN-D6', 'W2·11-DESIGN-D7', 'W2·11-DESIGN-D8a', 'W2·11-DESIGN-D8b', 'W2·11-DESIGN-D8c',
  'W2·13-KANTONE-K1', 'W2·13-KANTONE-K2', 'W2·13-KANTONE-K3', 'W2·13-KANTONE-K4',
  'W2·13-KANTONE-K5', 'W2·13-KANTONE-K6', 'W2·13-KANTONE-K7', 'W2·13-KANTONE-K8',
  'W2·13-KANTONE-K9', 'W2·13-KANTONE-K10', 'W2·13-KANTONE-K11', 'W2·13-KANTONE-K12',
  'W2·13-KANTONE-K13', 'W2·13-KANTONE-K14',
  'W2·14-SIGNAL-B1', 'W2·14-SIGNAL-B2', 'W2·14-SIGNAL-GER',
  'W3·14-B3',
];
