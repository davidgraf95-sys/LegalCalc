// ─── Ist-Hüllen-Fälle in GEMISCHTEN Spec-Dateien · H4-Flip, 18.8.2026 ────────
//
// LAGE. Mit dem Flip (David-Ja 17.8.2026) rendert das Regelprojekt `chromium`
// den V3-Leser; die alte Hülle lief bis H5 (PR #560, 21.8.2026) im Projekt
// `leser-v1` — seither ist das Projekt aus `playwright.config.ts` entfernt und
// dieses Modul hat keine Aufrufer mehr (grep-geprüft 21.8.2026, H5-Nachlese) —
// Rückbau-Kandidat §17, hier nicht gelöscht (Doku-Nachlese, kein Code-Rückbau).
// Einige
// Bestands-Specs prüfen einen MONTAGEPUNKT, den V3 planmässig aufgegeben hat —
// die Rechtsprechungs-Auskunft steht nicht mehr am Artikelfuss, das
// Kontextfenster nicht mehr im Gliederungs-Scroller, das mobile Suchfeld nicht
// mehr hinter einem Knopf, «/» gehört im Leser nicht mehr der Kopf-Suche. Diese
// Fälle sind in V3 nicht «rot», sie sind GEGENSTANDSLOS.
//
// WARUM NICHT DIE GANZE DATEI PINNEN. Die betroffenen Dateien enthalten daneben
// Fälle, die hüllenneutral sind und im Regelprojekt scharf bleiben MÜSSEN (bei
// `verzahnung.e2e.ts` sind das 5 von 11). Eine Datei ganz ins Rückweg-Projekt zu
// schieben nähme dem Regelprojekt diese Wächter — ein Tor, das die neue Hülle
// nicht mehr prüft, ist schlimmer als keines (§6.7). Darum steht die Grenze am
// EINZELFALL, nicht an der Datei.
//
// WARUM NICHT UMSCHREIBEN. Ein Fall, der die Wirkung an einem verschwundenen Ort
// misst, wird beim Umschreiben nicht zum geänderten, sondern zum NEUEN Test —
// und der gehört zu den `leser-v3-*`-Specs, nicht in eine Datei, die H5 löscht.
// Wo bereits eine `leser-v3-*`-Spec dieselbe Sache prüft, ist das im Aufruf
// benannt; wo keine existiert, steht die Lücke als H5-Auflage im Kontaktbogen
// H4 §7. H5 löscht die Ist-Hülle erst, wenn die Lücken geschlossen sind.
//
// WARUM DAS KEIN VERSTECKEN IST. Der Fall verschwindet nicht, er wechselt das
// Projekt: die Datei steht in `V1_GEMISCHT` (playwright.config.ts) und läuft
// damit im Rückweg-Projekt vollständig — dort ist die Aussage wahr und wird
// geprüft. Rot bleibt rot, nur am richtigen Ort.
//
// Muster übernommen von `leser-v3-umschalten` (c), das dieselbe
// Projekt-Abhängigkeit seit dem Zuschnitt des Flag-Projekts (16.8.2026) trägt.

/** Name des Projekts, das die alte Hülle fährt (`playwright.config.ts`). */
export const IST_HUELLE_PROJEKT = 'leser-v1';

/**
 * Bedingung für `test.skip(...)`: WAHR, sobald der Fall NICHT im Rückweg-Projekt
 * läuft. Aufruf-Muster (der `test`-Import bleibt in der Spec, damit kein
 * Playwright-Objekt durch Helper wandert):
 *
 * ```ts
 * test.skip(nichtIstHuelle(info.project.name), istHuellenGrund('…', '…'))
 * ```
 */
export function nichtIstHuelle(projekt: string): boolean {
  return projekt !== IST_HUELLE_PROJEKT;
}

/**
 * Der Skip-Grund, in einer Form, die im Report vollständig lesbar ist.
 *
 * @param montagepunkt Was in V3 nicht mehr existiert (der ORT, nicht die Sache).
 * @param v3Deckung    Welche `leser-v3-*`-Spec bzw. Vitest die Sache in V3
 *                     prüft — oder «Deckungslücke, H5-Auflage (Kontaktbogen H4
 *                     §7)», wenn keine existiert. Nie leer lassen: eine
 *                     Verschiebung ohne benannte Gegenseite ist ein stiller
 *                     Deckungsverlust.
 */
export function istHuellenGrund(montagepunkt: string, v3Deckung: string): string {
  return `H4-Flip: ${montagepunkt} gibt es in V3 nicht — der Fall läuft bis H5 im Projekt `
    + `«${IST_HUELLE_PROJEKT}». V3-Seite: ${v3Deckung}.`;
}
