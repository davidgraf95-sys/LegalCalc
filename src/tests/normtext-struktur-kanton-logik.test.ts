// Tests der Entscheidungs-Logik der kantonalen Sidecar-Erzeugung
// (scripts/normtext/struktur-kanton-logik.ts, Runner: struktur-kanton-run.ts).
//
// ANLASS (W2·19B-KORPUS, Gegenprüfung 13.8.2026): Commit 810ec9b65 behauptete,
// BEIDE neuen Tore seien im Lauf rot gezeigt worden. Belegt war nur das
// Fassungs-Tor (SG-2808). Für die Soft-404-/Content-Type-Sonde gab es keinen
// Rot-Beleg — der Lauf summierte sich zu 8 = 4 ok · 1 leer · 1 Fassung · 2 ohne
// lawId, der Fehler-Eimer blieb leer. Diese Datei holt den Beleg nach: die
// Sonde wird an einer echten Angular-Shell-Antwort geprüft, und der Test wurde
// vor dem Fix einmal rot gesehen (§6.7 — ein Tor, das nicht scheitern kann, ist
// gefährlicher als keines).
import { describe, it, expect } from 'vitest';
import { bewerteAntwort, lawIdKandidaten, besterBefund } from '../../scripts/normtext/struktur-kanton-logik.ts';

// Die reale Soft-404-Antwort der LexWork-Portale: HTTP 200, text/html,
// Angular-Shell. Genau daran scheitert die Statuscode-Prüfung (scraping-Skill
// Fakt 3) — ohne Content-Type-Sonde ginge das als Erfolg durch.
const SHELL = {
  httpOk: true,
  contentType: 'text/html; charset=UTF-8',
  xhtmlVorhanden: false,
} as const;

describe('bewerteAntwort — Soft-404-Sonde (Content-Type)', () => {
  it('erkennt die Angular-Shell trotz HTTP 200 als «shell», nicht als «leer»', () => {
    // Der Unterschied ist nicht kosmetisch: «leer» heisst «amtlich gibt es hier
    // keine Struktur» (Endzustand, nicht wiederkommen), «shell» heisst «wir
    // haben die Quelle gar nicht erreicht» (Transportfehler, erneut versuchen).
    // Wer beides verwechselt, schreibt einen Erlass dauerhaft als strukturlos
    // ab, obwohl er nie befragt wurde.
    expect(bewerteAntwort(SHELL)).toBe('shell');
  });

  it('wertet die Shell auch dann nicht als Fassungs-Abweichung, wenn eine Version erwartet wird', () => {
    expect(bewerteAntwort({ ...SHELL, erwarteteVersion: 3870 })).toBe('shell');
  });

  it('lässt echtes JSON passieren (Positivkontrolle — die Sonde darf nicht alles blocken)', () => {
    expect(bewerteAntwort({
      httpOk: true,
      contentType: 'application/json; charset=utf-8',
      selectedVersionId: 3870,
      xhtmlVorhanden: true,
      erwarteteVersion: 3870,
    })).toBe('ok');
  });

  it('akzeptiert JSON auch ohne Charset-Zusatz', () => {
    expect(bewerteAntwort({ httpOk: true, contentType: 'application/json', xhtmlVorhanden: true }))
      .toBe('ok');
  });

  it('behandelt einen fehlenden Content-Type als Shell, nicht als Erfolg', () => {
    expect(bewerteAntwort({ httpOk: true, contentType: null, xhtmlVorhanden: true })).toBe('shell');
  });
});

describe('bewerteAntwort — Reihenfolge der Tore', () => {
  it('meldet HTTP-Fehler vor allem anderen', () => {
    expect(bewerteAntwort({ httpOk: false, contentType: 'application/json', xhtmlVorhanden: false }))
      .toBe('fehler-status');
  });

  it('meldet die Fassungs-Abweichung (belegter Fall SG-2808: Snapshot 2808, Portal 3863)', () => {
    expect(bewerteAntwort({
      httpOk: true,
      contentType: 'application/json',
      selectedVersionId: 3863,
      xhtmlVorhanden: false,
      erwarteteVersion: 2808,
    })).toBe('fassung');
  });

  it('meldet «leer» nur bei richtiger Fassung ohne XHTML (belegter Fall AR-1203)', () => {
    expect(bewerteAntwort({
      httpOk: true,
      contentType: 'application/json',
      selectedVersionId: 1203,
      xhtmlVorhanden: false,
      erwarteteVersion: 1203,
    })).toBe('leer');
  });
});

describe('lawIdKandidaten — Systematiknummer aus dem erlass-Feld', () => {
  it.each([
    ['Verordnung über die Beurkundungsgebühren (BeurkGebV) (SRL 258)', ['258']],
    ['Gebührentarif für die Gemeinden (bGS 153.2)', ['153.2']],
    ['Verordnung über die Notariatsgebühren (NotGebV) (BR 210.370)', ['210.370']],
    ['Tarif des émoluments des notaires (RSF 261.16)', ['261.16']],
    ['Règlement fixant le tarif des émoluments (178.104)', ['178.104']],
    ['Tarif des frais judiciaires civils (TFJC) (BLV 270.11.5)', ['270.11.5']],
  ])('liest die Nummer aus %s', (erlass, erwartet) => {
    expect(lawIdKandidaten(erlass)).toEqual(erwartet);
  });

  // DER KERN DES BEFUNDS (Gegenprüfung 13.8.2026): SG-2935 und SG-3849 tragen
  // ein VERSCHACHTELTES Klammer-Feld mit ZWEI Erlassen. Die alte Zerlegung
  // scheiterte daran und lieferte null — der Runner meldete daraufhin «ohne
  // lawId», obwohl der wahre Skip-Grund `structured_document_id: null` ist.
  // Gefahr: ein künftiger Erlass mit doppeltem SR-Feld UND vorhandener Struktur
  // würde unter falscher Begründung endgültig übersprungen, ohne je gefragt zu
  // werden. Beide Nummern sind Kandidaten — welche gilt, entscheidet NICHT
  // dieser Parser (das wäre geraten, §7), sondern das Fassungs-Tor an der API.
  it('findet BEIDE Nummern im verschachtelten Feld von SG-2935/SG-3849', () => {
    const erlass = 'Verordnung über die Gebühren für Amtshandlungen der Grundbuchämter '
      + '(GB-GebV) — für grundstücksbezogene Beurkundungen; ergänzt durch Gebührentarif '
      + 'für die Kantons- und Gemeindeverwaltung (GebT), Abschnitt III «Beurkundungen '
      + 'und Beglaubigungen», für die übrigen öffentlichen Beurkundungen '
      + '(914.5 (GB-GebV); 821.5 (GebT))';
    expect(lawIdKandidaten(erlass)).toEqual(['914.5', '821.5']);
  });

  it('gibt eine leere Liste, wo wirklich keine Nummer steht (kein Raten, §7)', () => {
    expect(lawIdKandidaten('Irgendein Erlass ohne Klammerzusatz')).toEqual([]);
    expect(lawIdKandidaten('Erlass mit Klammer ohne Nummer (NotGebV)')).toEqual([]);
  });
});

describe('besterBefund — Auskunft bei mehreren Kandidaten', () => {
  // REALER FALL SG-3849 (Lauf 13.8.2026): Kandidat 914.5 ist ein ANDERER Erlass
  // (dessen aktuelle Version 2935 ist, erwartet wird 3849) → 'fassung'.
  // Kandidat 821.5 ist der richtige (Version 3849 stimmt), trägt aber amtlich
  // kein XHTML → 'leer'. Die zu meldende Auskunft ist «amtlich ohne XHTML» zu
  // 821.5 — nicht eine Fassungs-Abweichung gegen die fremde Nummer 914.5, die
  // den Leser auf den falschen Erlass schickt.
  it('zieht die Auskunft des ZUTREFFENDEN Kandidaten der Fassungs-Abweichung eines fremden vor', () => {
    const gewaehlt = besterBefund([
      { befund: 'fassung' as const, api: '…/texts_of_law/914.5' },
      { befund: 'leer' as const, api: '…/texts_of_law/821.5' },
    ]);
    expect(gewaehlt).toEqual({ befund: 'leer', api: '…/texts_of_law/821.5' });
  });

  it('meldet die Fassungs-Abweichung weiterhin, wenn sie die einzige Auskunft ist (SG-2808)', () => {
    const gewaehlt = besterBefund([{ befund: 'fassung' as const, api: '…/texts_of_law/941.12' }]);
    expect(gewaehlt?.befund).toBe('fassung');
  });

  it('zieht jede echte Auskunft dem Nicht-Erreichen vor', () => {
    expect(besterBefund([
      { befund: 'shell' as const }, { befund: 'fassung' as const },
    ])?.befund).toBe('fassung');
    expect(besterBefund([
      { befund: 'fehler-status' as const }, { befund: 'shell' as const },
    ])?.befund).toBe('shell');
  });

  it('gibt bei leerer Kandidatenliste null (kein erfundener Befund)', () => {
    expect(besterBefund([])).toBeNull();
  });
});
