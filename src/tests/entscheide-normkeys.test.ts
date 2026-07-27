import { describe, it, expect } from 'vitest';
import {
  normalisiereAbk, normKeyFuerAbk, statutesZuNormKeys, fliesstextVon,
  normKeysVonSnapshot, artikelSchluesselVonSnapshot, remapNormKeys,
  ABK_KOLLISIONEN, ABK_AUSSCHLUSS, AUSGESCHLOSSENE_KEYS,
} from '../../scripts/normtext/entscheide-mapping';
import { ERLASS_REGISTER } from '../lib/normtext/register';
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
  it('AUSGESCHLOSSENE_KEYS überlebt eine künftige Kollision auf «StG» (Härtung B6a)', () => {
    // Befund 28.7.2026: die Menge wurde über ABK_TABELLE.get() abgeleitet. Die
    // Tabelle VERWIRFT kollidierte Abkürzungen beidseitig — ein zweiter
    // Register-Eintrag mit normalisiert 'STG' hätte den Eintrag gelöscht, die
    // Menge geleert und den Bestand-Schutzfilter STILL entwaffnet. Hier beide
    // Ableitungen an genau diesem Fall gegeneinander, damit die Härtung nicht
    // versehentlich zurückgedreht wird (§6.7).
    const REG = [...ERLASS_REGISTER, { key: 'STG_KANTONAL_DEMO', kuerzel: 'StG' } as never];
    // (1) ALTE Ableitung, nachgebaut: Tabelle bauen, Kollisionen verwerfen, get().
    const tabelle = new Map<string, string>();
    const kollidiert = new Set<string>();
    for (const e of REG as Array<{ key: string; kuerzel: string }>) {
      for (const kand of [normalisiereAbk(e.kuerzel), normalisiereAbk(e.key)]) {
        if (!kand) continue;
        const bisher = tabelle.get(kand);
        if (bisher === undefined) { tabelle.set(kand, e.key); continue; }
        if (bisher !== e.key) kollidiert.add(kand);
      }
    }
    for (const k of kollidiert) tabelle.delete(k);
    const altAbleitung = [...ABK_AUSSCHLUSS.keys()].map((a) => tabelle.get(a)).filter(Boolean);
    expect(altAbleitung).toEqual([]);        // ← genau das war die Lücke: Schutz weg
    // (2) NEUE Ableitung, dieselbe Regel wie im Produktivpfad: direkt übers Register.
    const neuAbleitung = (REG as Array<{ key: string; kuerzel: string }>)
      .filter((e) => ABK_AUSSCHLUSS.has(normalisiereAbk(e.kuerzel))
                  || ABK_AUSSCHLUSS.has(normalisiereAbk(e.key)))
      .map((e) => e.key).sort();
    expect(neuAbleitung).toEqual(['STG', 'STG_KANTONAL_DEMO']);
  });
});

describe('statutesZuNormKeys — Trailing-Token mit Ziffern-Block', () => {
  it('«Art. 27 BVV 2» → BVV_2 (ohne Ziffer fiele es auf «BVV» zurück)', () => {
    expect(statutesZuNormKeys(['Art. 27 BVV 2'])).toEqual(['BVV_2']);
  });
  it('einfaches Kürzel + Dedup unverändert', () => {
    expect(statutesZuNormKeys(['Art. 32 Abs. 2 BGG', 'Art. 42 BGG'])).toEqual(['BGG']);
  });
  it('hält die BEKANNTE Lücke im Fliesstext-Pfad fest: «BVV 2» getrennt geschrieben (B7)', () => {
    // extrahiereStatutRefs matcht GESETZ_CODE ohne Leerzeichen → 'Art. 27 BVV 2'
    // liefert gesetz 'BVV' und damit keinen key; nur die zusammengeschriebene
    // Form trifft. Der Extraktor bleibt bewusst unverändert (kampferprobte
    // Falsch-Positiv-Abstimmung); die Lücke ist benannt statt kaschiert (§8) und
    // vom statutes-Pfad gedeckt. Bricht dieser Test, hat sich die Reichweite des
    // Extraktors geändert — dann gehört der Kommentar in normalisiereAbk nachgeführt.
    expect(normKeyFuerAbk('BVV')).toBeNull();
    const getrennt = snap({ abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: 'Nach Art. 27 BVV 2 gilt …' }] }] });
    expect(normKeysVonSnapshot(getrennt)).toEqual([]);          // Lücke im Fliesstext-Pfad
    const zusammen = snap({ abschnitte: [{ typ: 'erwaegung', bloecke: [{ marke: '3', text: 'Nach Art. 27 BVV2 gilt …' }] }] });
    expect(normKeysVonSnapshot(zusammen)).toEqual(['BVV_2']);   // zusammengeschrieben trifft
    // Der statutes-Pfad deckt genau diese Schreibweise ab:
    expect(normKeysVonSnapshot(snap({ zitierteNormen: ['Art. 27 BVV 2'] }))).toEqual(['BVV_2']);
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
  it('filtert auch den HINT durch den Ausschluss — der Ausschluss ist total (B6b)', () => {
    // Befund 28.7.2026: der hint ging ungefiltert durch. Über den Quellzweig mit
    // deklarierter Erlass-Bindung wäre 'STG' also doch in den Korpus gelangt und
    // die föderal/kantonale Mehrdeutigkeit stünde wieder in den normKeys (§1/§8).
    expect(normKeysVonSnapshot(snap(), 'STG')).toEqual([]);
    expect(normKeysVonSnapshot(snap({ zitierteNormen: ['Art. 41 OR'] }), 'STG')).toEqual(['OR']);
    expect(normKeysVonSnapshot(snap(), 'ZPO')).toEqual(['ZPO']);   // gültiger hint unberührt
  });
});

describe('remapNormKeys — Re-Map bewahrt nicht rekonstruierbare Alt-Keys (B1)', () => {
  it('behält Alt-Keys, die die Neuberechnung nicht reproduziert', () => {
    // Anlassfall bge_152_I_61: committed ['BGG','BV','ZPO'], neu berechnet
    // ['BGERR','BGG','BV','IPRG'] — 'ZPO' steht WEDER in zitierteNormen NOCH im
    // Fliesstext (0 Treffer \bZPO\b/\bCPC\b) und stammt aus den nie persistierten
    // aza-statutes. Ohne Bewahrung löschte der Re-Map diesen Key still.
    const r = remapNormKeys(['BGG', 'BV', 'ZPO'], ['BGERR', 'BGG', 'BV', 'IPRG']);
    expect(r.keys).toEqual(['BGERR', 'BGG', 'BV', 'IPRG', 'ZPO']);
    expect(r.nurAlt).toEqual(['ZPO']);       // gezählt und ausgewiesen, nicht still (§6.7)
  });
  it('entfernt ausgeschlossene Keys aus dem Altbestand — dafür ist der Ausschluss da', () => {
    const r = remapNormKeys(['OR', 'STG'], ['OR']);
    expect(r.keys).toEqual(['OR']);
    expect(r.nurAlt).toEqual([]);
  });
  it('ist idempotent: das Ergebnis des ersten Laufs ist Fixpunkt des zweiten (§2)', () => {
    const eins = remapNormKeys(['BGG', 'BV', 'ZPO'], ['BGERR', 'BGG', 'BV', 'IPRG']);
    const zwei = remapNormKeys(eins.keys, ['BGERR', 'BGG', 'BV', 'IPRG']);
    expect(zwei.keys).toEqual(eins.keys);
  });
  it('sortiert alphabetisch und dedupliziert (build-pfad-unabhängig, §2)', () => {
    expect(remapNormKeys(['ZPO', 'OR'], ['OR', 'BGG']).keys).toEqual(['BGG', 'OR', 'ZPO']);
  });
  it('leerer Altbestand → reine Neuberechnung', () => {
    expect(remapNormKeys([], ['OR', 'BGG']).keys).toEqual(['BGG', 'OR']);
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
