/**
 * Reine Entscheidungs-Logik der kantonalen Sidecar-Erzeugung (Runner:
 * `struktur-kanton-run.ts`). Eigenes Modul nach dem Haus-Muster `*-logik.ts`
 * (vgl. `drift-logik.ts`, `confidence-logik.ts`, `vollstaendigkeit-logik.ts`),
 * und zwar aus einem prüftechnischen Grund: der Runner parst beim Import
 * `process.argv` und ruft `process.exit(1)`, wenn `--datum` fehlt. Er lässt sich
 * darum nicht importieren, und seine Tore waren bis hierher NICHT unit-testbar —
 * genau deshalb konnte die Content-Type-Sonde behauptet, aber nie belegt werden.
 *
 * §2: alles hier ist rein und deterministisch — kein Netz, kein Datum, kein I/O.
 */

/** Wie eine Antwort der LexWork-Struktur-API zu werten ist. */
export type AntwortBefund =
  /** Verwertbar: JSON, richtige Fassung, XHTML vorhanden. */
  | 'ok'
  /** HTTP-Fehlerstatus. */
  | 'fehler-status'
  /** HTTP 200, aber kein JSON — die Angular-Shell der Portale (Soft-404). */
  | 'shell'
  /** Portal führt eine andere Fassung als die, an der der Snapshot hängt. */
  | 'fassung'
  /** JSON und richtige Fassung, aber amtlich kein strukturiertes XHTML. */
  | 'leer';

export interface AntwortLage {
  /** `Response.ok` der Anfrage. */
  httpOk: boolean;
  /** Roher `Content-Type`-Header (oder null, wenn keiner mitkam). */
  contentType: string | null;
  /** `text_of_law.selected_version.id` aus dem Body. */
  selectedVersionId?: number;
  /** Ob `selected_version.xhtml_tol` einen nicht-leeren Wert trägt. */
  xhtmlVorhanden: boolean;
  /** Versions-Id, an der der Snapshot hängt (nur bei der PDF-Adressform). */
  erwarteteVersion?: number;
}

/**
 * Bewertet eine Antwort der Struktur-API. Die Reihenfolge ist bindend: erst
 * Transport, dann Identität der Fassung, dann Inhalt — sonst würde z.B. eine
 * Shell-Antwort ohne `selected_version` als «Fassungs-Abweichung» gemeldet und
 * der wahre Grund verschwiegen.
 */
export function bewerteAntwort(lage: AntwortLage): AntwortBefund {
  if (!lage.httpOk) return 'fehler-status';
  // Soft-404-Sonde (scraping-Skill Fakt 3): die LexWork-Portale beantworten
  // einen unbekannten Pfad mit HTTP 200 und einer Angular-Shell in text/html.
  // Der Status ist deshalb KEIN Erfolgsbeweis — der Content-Type entscheidet.
  // Sie steht VOR den inhaltlichen Toren, weil eine Shell weder eine Fassung
  // noch ein xhtml_tol trägt und sonst als «andere Fassung» oder «amtlich ohne
  // Struktur» gemeldet würde. Beides wäre eine Falschauskunft mit Folgen: der
  // Erlass gälte als abschliessend geklärt, obwohl die Quelle nie antwortete.
  if (!/^application\/json\b/i.test((lage.contentType ?? '').trim())) return 'shell';
  if (lage.erwarteteVersion !== undefined && lage.selectedVersionId !== lage.erwarteteVersion) {
    return 'fassung';
  }
  if (!lage.xhtmlVorhanden) return 'leer';
  return 'ok';
}

/**
 * Aussagekraft eines Befunds, wenn MEHRERE Kandidaten-Adressen befragt wurden
 * (Snapshot mit doppeltem Systematik-Feld). Der aussagekräftigste gewinnt.
 *
 * Die Reihenfolge ist nicht beliebig, sie folgt dem Informationsgehalt:
 * - `ok` — erledigt.
 * - `leer` — die spezifischste Negativ-Auskunft: dieser Kandidat WAR der
 *   richtige Erlass (sonst hätte das Fassungs-Tor vorher gegriffen), und er
 *   trägt amtlich kein XHTML. Ein Endbefund.
 * - `fassung` — bei mehreren Kandidaten heisst das meist nur «dieser Kandidat
 *   ist der falsche Erlass», nicht «der Erlass ist veraltet». Deshalb rangiert
 *   es UNTER `leer`: sonst meldete SG-3849 eine Fassungs-Abweichung gegen die
 *   fremde Nummer 914.5, statt die zutreffende Auskunft zu 821.5 zu zeigen.
 *   Bei nur einem Kandidaten bleibt es die richtige und einzige Meldung.
 * - `shell` / `fehler-status` — die Quelle wurde gar nicht erreicht, das ist
 *   überhaupt kein Endbefund über den Erlass.
 */
export const BEFUND_RANG: Readonly<Record<AntwortBefund, number>> = Object.freeze({
  ok: 4, leer: 3, fassung: 2, shell: 1, 'fehler-status': 0,
});

/** Wählt aus den Befunden mehrerer Kandidaten den aussagekräftigsten (erster
 *  bei Gleichstand — stabile, reihenfolgetreue Wahl). */
export function besterBefund<T extends { befund: AntwortBefund }>(kandidaten: T[]): T | null {
  let bester: T | null = null;
  for (const k of kandidaten) {
    if (!bester || BEFUND_RANG[k.befund] > BEFUND_RANG[bester.befund]) bester = k;
  }
  return bester;
}

/**
 * Systematiknummern (LexWork-`lawId`) aus dem `erlass`-Feld eines Snapshots.
 * Die Nummer steht dort im Klammerzusatz am Ende ('… (SRL 258)').
 *
 * VERSCHACHTELUNGSFEST (Gegenprüfungs-Befund 13.8.2026). Zwei Snapshots
 * (SG-2935, SG-3849) tragen ein Feld mit inneren Klammern und ZWEI Erlassen:
 * '… (914.5 (GB-GebV); 821.5 (GebT))'. Die frühere Zerlegung — dieselbe, die
 * `identitaetAusErlass` für `register.json` verwendet — scheiterte daran und
 * lieferte nichts; der Runner meldete dann «ohne lawId», obwohl der wahre Grund
 * ein ganz anderer war. Ein künftiger Erlass mit doppeltem Feld UND vorhandener
 * Struktur würde so unter falscher Begründung übersprungen, ohne je gefragt zu
 * werden. Darum wird der Klammer-Block hier über einen Tiefenzähler bestimmt
 * statt über «alles ausser Klammer».
 *
 * Es werden ALLE gefundenen Nummern zurückgegeben, bewusst ohne Auswahl: bei
 * zwei Kandidaten wäre jede Wahl geraten (§7). Welcher gilt, entscheidet das
 * Fassungs-Tor an der API — der Kandidat, dessen `selected_version.id` zur
 * Version des Snapshots passt. `identitaetAusErlass` bleibt unverändert, damit
 * sich an `register.json` nichts ändert (§5/§6).
 */
export function lawIdKandidaten(erlass: string): string[] {
  const s = erlass.trim();
  if (!s.endsWith(')')) return [];
  // Rückwärts bis zur zugehörigen öffnenden Klammer (Tiefenzähler).
  let tiefe = 0;
  let start = -1;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ')') tiefe++;
    else if (s[i] === '(') {
      tiefe--;
      if (tiefe === 0) { start = i; break; }
    }
  }
  if (start < 0) return [];
  const inhalt = s.slice(start + 1, -1);
  // Nummern-Token: Ziffernfolgen, optional punktgetrennt ('258', '270.11.5').
  // Amts-Präfixe ('SRL', 'bGS', 'BLV') und Kürzel ohne Ziffern fallen von
  // selbst heraus, weil sie keine Ziffer tragen.
  return [...inhalt.matchAll(/(?<![\w.])(\d+(?:\.\d+)*)(?![\w.])/g)].map((m) => m[1]);
}
