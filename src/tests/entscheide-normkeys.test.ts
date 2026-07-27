import { describe, it, expect } from 'vitest';
import {
  normalisiereAbk, normKeyFuerAbk, statutesZuNormKeys, fliesstextVon,
  normKeysVonSnapshot, artikelSchluesselVonSnapshot,
  ABK_KOLLISIONEN, ABK_AUSSCHLUSS, AUSGESCHLOSSENE_KEYS,
} from '../../scripts/normtext/entscheide-mapping';
import type { EntscheidSnapshot } from '../lib/rechtsprechung/typen';

// ─── W2·6-NKEY Baustein a+d — normKeys aus dem Register + Fliesstext ─────────
//
// FACHLICHE ÄNDERUNG, bewusst deklariert (§6.3): die Abkürzungs-Tabelle war eine
// Hand-Whitelist mit 26 Einträgen und kannte z.B. das IPRG nicht, obwohl der
// Erlass im ERLASS_REGISTER geführt wird. Sie wird jetzt aus dem Register
// ABGELEITET (§5) und die Zitat-Erkennung greift zusätzlich in den FLIESSTEXT
// (Anlassfall BGE 152 III 137: nennt das IPRG 68-mal im Text, hatte aber keinen
// IPRG-normKey). Diese Datei ist der Beweis, dass die Ableitung tut, was sie
// soll — und dass sie an den fachlich heiklen Stellen NICHT rät.

// ── Snapshot-Fabrik: nur die für normKeys relevanten Felder variabel ─────────
function snap(o: Partial<EntscheidSnapshot> = {}): EntscheidSnapshot {
  return {
    id: 'bund/bge/152_III_137', gericht: 'bge', gerichtName: 'Bundesgericht',
    gerichtstyp: 'bundesgericht', kanton: 'CH', abteilung: null, nummer: '152 III 137',
    bgeReferenz: '152 III 137', zitierung: 'BGE 152 III 137', datum: '2026-01-01',
    sprache: 'de', leitcharakter: 'leitentscheid', sachgebiet: 'privat', legalArea: null,
    rubrum: null, regeste: null, regesteAmtlich: true,
    abschnitte: [], dispositivOrders: [], zitierteNormen: [], normKeys: [],
    zitierteEntscheide: [], bestand: 'snapshot', kuratierung: 'maschinell',
    quelle: 'opencaselaw', quelleUrl: 'https://www.bger.ch', abgerufen: '2026-01-01',
    fassungsToken: 'h', sha: 's',
    ...o,
  };
}

describe('normalisiereAbk — Vergleichsform der Abkürzung', () => {
  it('gross + Sonderzeichen weg, Umlaut bleibt', () => {
    expect(normalisiereAbk('SchKG')).toBe('SCHKG');
    expect(normalisiereAbk('BüG')).toBe('BÜG');
    expect(normalisiereAbk('GebV-HReg')).toBe('GEBVHREG');
  });
  it('bewahrt Ziffern — sonst kollabierten «BVV 2» und «BVV 3» auf ein Token (§1)', () => {
    expect(normalisiereAbk('BVV 2')).toBe('BVV2');
    expect(normalisiereAbk('BVV 3')).toBe('BVV3');
    expect(normalisiereAbk('BVV 2')).not.toBe(normalisiereAbk('BVV 3'));
  });
});

describe('normKeyFuerAbk — Ableitung aus dem ERLASS_REGISTER', () => {
  it('kennt Erlasse, die die alte Hand-Whitelist NICHT kannte (Anlassfall IPRG)', () => {
    expect(normKeyFuerAbk('IPRG')).toBe('IPRG');
  });
  it('mappt die Anzeige-Abkürzung auf den dateisicheren Register-key', () => {
    // Register: bund('VBB', 'VFRR', …) → Anzeige «VFRR», key 'VBB'.
    expect(normKeyFuerAbk('VFRR')).toBe('VBB');
    // Umlaut-Kürzel: «BüG» → 'BÜG' → Register-key 'BUEG'.
    expect(normKeyFuerAbk('BüG')).toBe('BUEG');
    // Ziffern-Kürzel bleiben getrennt (siehe normalisiereAbk).
    expect(normKeyFuerAbk('BVV 2')).toBe('BVV_2');
    expect(normKeyFuerAbk('BVV 3')).toBe('BVV3');
  });
  it('gibt föderal/kantonal mehrdeutige Kürzel NICHT aus (StG), Unbekanntes ebenso wenig', () => {
    // Lieber eine Lücke als eine falsche Bundesrechts-Zuordnung (§1/§8) —
    // Begründung: ABK_AUSSCHLUSS-Eintrag, Gegenprüfung W3 (Opus, 2.7.2026).
    expect(normKeyFuerAbk('StG')).toBeNull();
    expect(normKeyFuerAbk('KV/SH')).toBeNull();   // kantonal, nicht registriert
    expect(normKeyFuerAbk('GIBTSNICHT')).toBeNull();
  });
});

describe('Sicherungen der Ableitung — sichtbar statt still (§6.7)', () => {
  it('ABK_KOLLISIONEN ist heute exakt leer — das Register ist eindeutig', () => {
    // EXAKTE Liste, nicht «≤ n»: ein neuer Register-Eintrag, der eine Abkürzung
    // doppelt belegt, macht dieses Tor ROT, statt den Treffer still zu verlieren.
    // Sabotage-Probe 27.7.2026: ein zusätzlicher Register-Eintrag mit kuerzel
    // 'IPRG' unter anderem key liefert ABK_KOLLISIONEN = ['IPRG'] → rot.
    expect([...ABK_KOLLISIONEN]).toEqual([]);
  });
  it('ABK_AUSSCHLUSS trägt heute nur «STG», mit begründendem Text', () => {
    expect([...ABK_AUSSCHLUSS.keys()]).toEqual(['STG']);
    expect(ABK_AUSSCHLUSS.get('STG')).toMatch(/kantonal/);
  });
  it('AUSGESCHLOSSENE_KEYS spiegelt den Ausschluss auf Register-key-Ebene (Alt-Bestand)', () => {
    expect([...AUSGESCHLOSSENE_KEYS]).toEqual(['STG']);
  });
});

describe('statutesZuNormKeys — Trailing-Token mit Ziffern-Block', () => {
  it('«Art. 27 BVV 2» → BVV_2 (ohne Ziffer fiele es auf «BVV» zurück)', () => {
    expect(statutesZuNormKeys(['Art. 27 BVV 2'])).toEqual(['BVV_2']);
  });
  it('einfaches Kürzel + Dedup unverändert', () => {
    expect(statutesZuNormKeys(['Art. 32 Abs. 2 BGG', 'Art. 42 BGG'])).toEqual(['BGG']);
  });
});

// ── Baustein d: Zitate im FLIESSTEXT, nicht nur in den Roh-statutes ──────────
const IPRG_TEXT = 'Nach Art. 126 IPRG untersteht die Stellvertretung dem Recht des Staates, '
  + 'in dem der Vertreter seine Niederlassung hat.';

describe('fliesstextVon — deterministische Text-Assemblage', () => {
  it('nimmt Regeste (flach + Sprachfassungen inkl. weitererRegesten) und alle Abschnitts-Blöcke', () => {
    const s = snap({
      regeste: {
        text: 'Regeste-Fliesstext.', quelle: 'opencaselaw',
        sprachfassungen: [{
          sprache: 'de', kopf: 'Kopf DE.', absaetze: ['Absatz DE.'],
          weitereRegesten: [{ label: 'b', kopf: 'Kopf b.', absaetze: ['Absatz b.'] }],
          quelleUrl: 'https://www.bger.ch/x',
        }],
      },
      abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '1', text: 'Erwägung.' }] }],
      auszugAbschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '2', text: 'Auszug.' }] }],
    });
    expect(fliesstextVon(s)).toBe(
      'Regeste-Fliesstext.\nKopf DE.\nAbsatz DE.\nKopf b.\nAbsatz b.\nErwägung.\nAuszug.',
    );
  });
  it('nimmt Rubrum und Dispositiv-Orders NICHT auf (dort stehen Parteien/Verfahren)', () => {
    const s = snap({
      rubrum: { gegenstand: 'Art. 41 OR', parteien: null, vorinstanz: null, besetzung: null },
      dispositivOrders: ['Die Beschwerde wird nach Art. 66 BGG abgewiesen.'],
    });
    expect(fliesstextVon(s)).toBe('');
  });
});

describe('normKeysVonSnapshot — Roh-statutes ∪ Fliesstext ∪ hint', () => {
  it('findet den Erlass, der NUR im Fliesstext steht (Anlassfall IPRG)', () => {
    const s = snap({ abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: IPRG_TEXT }] }] });
    expect(normKeysVonSnapshot(s)).toEqual(['IPRG']);
  });
  it('vereinigt Roh-statutes, Fliesstext und hint — alphabetisch sortiert (§2)', () => {
    const s = snap({
      zitierteNormen: ['Art. 32 Abs. 2 BGG'],
      abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: IPRG_TEXT }] }],
    });
    expect(normKeysVonSnapshot(s, 'ZPO')).toEqual(['BGG', 'IPRG', 'ZPO']);
  });
  it('nimmt das mehrdeutige «StG» auch aus dem Fliesstext NICHT auf', () => {
    const s = snap({
      abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: 'Gestützt auf Art. 12 StG.' }] }],
    });
    expect(normKeysVonSnapshot(s)).toEqual([]);
  });
});

describe('artikelSchluesselVonSnapshot — «KEY/artikel», eine Stelle für Index und Oracle (§5)', () => {
  it('erkennt den Artikel im Fliesstext (vorher nur aus zitierteNormen)', () => {
    const s = snap({ abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: IPRG_TEXT }] }] });
    expect([...artikelSchluesselVonSnapshot(s)]).toEqual(['IPRG/126']);
  });
  it('vereinigt Roh-statutes und Fliesstext, ohne das ausgeschlossene «StG»', () => {
    const s = snap({
      zitierteNormen: ['Art. 41 OR', 'Art. 12 StG'],
      abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: IPRG_TEXT }] }],
    });
    expect([...artikelSchluesselVonSnapshot(s)].sort()).toEqual(['IPRG/126', 'OR/41']);
  });
});
