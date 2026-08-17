import { describe, expect, it } from 'vitest';
import { migriereOptFelder } from '../pages/gesetz-leser/leserOptionen';

// ─── S1-OPTIONEN-RÜCKBAU: Migration alter gespeicherter Werte ────────────────
//
// FAHRPLAN-LESER-V3 Kap. 4f, Entscheide David F1/F2 «ja» (16.8.2026). Der Store
// trug bis S1 ein DREIWERTIGES `hist` ('aus' | 'fussnoten' | 'chronologie') und
// einen Schalter `verweise`; er trägt jetzt drei zweiwertige Felder, darunter
// `histansicht: 'an' | 'aus'`.
//
// Warum das ein eigener Test ist und keine Zeile im Store: der Fall, der wehtut,
// ist ein BESTANDS-Speicher — und der ist im Browser nicht mehr nachstellbar,
// sobald er einmal überschrieben wurde. Wer «Chronologie» gewählt hatte, wollte
// die Änderungsvermerke SEHEN; ihn nach dem Update auf «aus» zu setzen, nähme
// ihm amtliche Substanz weg, die er ausdrücklich bestellt hat (§8). Umgekehrt
// darf ein unbekannter Wert NIE durchrutschen: er landete als
// `data-histansicht="…"` am <html>, wo keine Regel greift — der Nutzer sähe eine
// Stellung, die es nicht gibt, und der Schalter stünde falsch.
//
// Rot zu bekommen (§6.7): in `migriereOptFelder` die 'chronologie'-Zeile auf
// 'aus' drehen (Fall 2 wird rot), den Default-Zweig auf 'aus' setzen (Fall 4),
// oder `verweise` wieder in FELDER aufnehmen (Fall 6).
//
// DOM-frei und uhr-frei (§2): `migriereOptFelder` ist rein.

describe('S1-Migration: hist (dreiwertig) → histansicht (zweiwertig)', () => {
  it('beide Alt-Darstellungen bedeuten «an» — «chronologie» ist keine Abwesenheit', () => {
    // Der entscheidende Fall. 'fussnoten' und 'chronologie' waren ZWEI
    // Darstellungen DERSELBEN Vermerke, nicht Vorhandensein vs. Abwesenheit.
    expect(migriereOptFelder({ hist: 'fussnoten' }).histansicht).toBe('an');
    expect(migriereOptFelder({ hist: 'chronologie' }).histansicht).toBe('an');
  });

  it('«aus» bleibt «aus» — eine getroffene Nutzerwahl kippt nicht still (§8)', () => {
    expect(migriereOptFelder({ hist: 'aus' }).histansicht).toBe('aus');
  });

  it('schon migrierter Speicher hat Vorrang vor dem Alt-Schlüssel', () => {
    // Ein `hist`-Rest kann aus einem anderen Tab oder aus einem alten Browser-
    // Profil stammen. Steht der neue Schlüssel da, ist er die Wahrheit — sonst
    // zöge ein Alt-Rest die frische Wahl bei jedem Laden zurück.
    expect(migriereOptFelder({ histansicht: 'aus', hist: 'chronologie' }).histansicht).toBe('aus');
    expect(migriereOptFelder({ histansicht: 'an', hist: 'aus' }).histansicht).toBe('an');
  });

  it('unbekannte Werte fallen auf den Default «an», ohne zu werfen', () => {
    const unfug: unknown[] = [
      undefined, null, 1, 0, true, 'chronologisch', 'AUS', 'An', '', {}, [], 'fussnote',
    ];
    for (const wert of unfug) {
      expect(() => migriereOptFelder({ hist: wert }), `Wert: ${String(wert)}`).not.toThrow();
      expect(migriereOptFelder({ hist: wert }).histansicht, `Wert: ${String(wert)}`).toBe('an');
      // Auch am NEUEN Schlüssel darf nichts Unbekanntes durchrutschen.
      expect(migriereOptFelder({ histansicht: wert }).histansicht, `Wert: ${String(wert)}`).toBe('an');
    }
  });

  it('leerer Speicher ⇒ alle drei Felder auf «an» (heutige Darstellung, R6)', () => {
    expect(migriereOptFelder({})).toEqual({ fussnoten: 'an', histansicht: 'an', leitfaelle: 'an' });
  });
});

describe('S1-Migration: der gestrichene Schalter «verweise» (F2)', () => {
  it('ein gespeichertes «verweise» wird ignoriert und schaltet nichts mehr', () => {
    // Der Schlüssel steht nicht mehr in FELDER; das Ergebnis trägt ihn nicht,
    // also kann er auch kein `data-verweise` mehr am <html> setzen. Abgeräumt
    // wird er beim nächsten Schreiben (dieselbe Mechanik wie `linien`/`zeitraum`).
    const ergebnis = migriereOptFelder({ verweise: 'aus', fussnoten: 'aus' });
    expect(Object.keys(ergebnis).sort()).toEqual(['fussnoten', 'histansicht', 'leitfaelle']);
    expect(ergebnis).not.toHaveProperty('verweise');
    // Und er färbt kein anderes Feld: «verweise aus» hiess nie «Fussnoten aus».
    expect(ergebnis.fussnoten).toBe('aus');
    expect(ergebnis.histansicht).toBe('an');
    expect(ergebnis.leitfaelle).toBe('an');
  });
});

describe('S1-Migration: die beiden unveränderten Felder', () => {
  it('fussnoten und leitfaelle werden wortwörtlich übernommen', () => {
    for (const wert of ['an', 'aus'] as const) {
      expect(migriereOptFelder({ fussnoten: wert }).fussnoten).toBe(wert);
      expect(migriereOptFelder({ leitfaelle: wert }).leitfaelle).toBe(wert);
    }
  });

  it('ein realer Bestands-Speicher (vor S1) migriert vollständig', () => {
    // Genau der Speicher, den ein Nutzer von vor S1 hat: alle Alt-Schlüssel
    // beisammen, inkl. der schon früher entfallenen `linien`/`zeitraum`.
    const bestand = {
      fussnoten: 'aus', verweise: 'aus', leitfaelle: 'an',
      hist: 'chronologie', linien: 'auto', zeitraum: '10', schrift: 'gross',
    };
    expect(migriereOptFelder(bestand)).toEqual({
      fussnoten: 'aus', histansicht: 'an', leitfaelle: 'an',
    });
  });
});
