// ─── Fedlex — Fassade ────────────────────────────────────────────────────────
//
// Der Inhalt dieser Datei liegt seit QS-CODE-SPLITS in vier Geschwister-Modulen
// unter `src/lib/fedlex/`, geschnitten entlang der vier dokumentierten Achsen und
// gerichtet ohne Zyklus verkettet:
//
//   tabelle.ts   — die FEDLEX-Konstantentabelle + FedlexGesetz
//   url.ts       — Anker-Token (artikelToken) und URL-Bau (fedlexUrl)
//   erkennung.ts — Gesetzes-Erkennung (Kürzel, Genitiv, Chapeau, Direktlink)
//   parser.ts    — Fliesstext-Parser (NORM_IM_TEXT, Ketten, Fremdrouting, Plural)
//
// Diese Datei bleibt der EINE Importpfad für alle Konsumenten (`@/lib/fedlex`)
// und re-exportiert exakt die bisherige öffentliche Oberfläche — unverändert,
// verhaltensneutral, keine Ergänzung und keine Auslassung (§6).

export { FEDLEX } from './fedlex/tabelle';
export type { FedlexGesetz } from './fedlex/tabelle';

export { artikelToken, fedlexUrl } from './fedlex/url';

export {
  erkenneFedlexGesetz,
  erkenneGenitivGesetz,
  erkenneTitelGesetz,
  chapeauZielFremdgesetz,
  fedlexLinkFuerArtikel,
} from './fedlex/erkennung';
export {
  GENITIV_EINTRAEGE, TITEL_EINTRAEGE, KUERZEL_SCHREIBWEISEN, titelGeltung,
} from './fedlex/positivliste';
export type { FremdEbene, Geltung, GenitivEintrag, TitelEintrag, TitelKopf } from './fedlex/positivliste';

export {
  NORM_IM_TEXT,
  fremdgesetzNachArtikel,
  fremdRoutingFormB,
  normVerweiseImText,
  artikelnPluralVerweise,
} from './fedlex/parser';
export type { FremdRoutingGlied, FremdSignal, NormVerweisSpan, PluralRegion } from './fedlex/parser';
