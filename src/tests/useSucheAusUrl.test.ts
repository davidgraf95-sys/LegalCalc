import { describe, it, expect } from 'vitest';
import {
  anfangsStand, nachAdresse, nachEigenemSchreiben, mitWert, type Feldstand,
} from '../components/suche/useSucheAusUrl';

// Zustandslogik der `?q=`-Kopplung (UI-NAV S1). Feld und Adresse schreiben beide;
// getestet wird, wessen Änderung jeweils gewinnt. Rein → ohne DOM durchspielbar.

/** Ein Schreibvorgang des Hooks: Merkung setzen, danach trifft das Echo ein. */
function spiegele(stand: Feldstand): Feldstand {
  const ziel = stand.wert.trim();
  return nachAdresse(nachEigenemSchreiben(stand, ziel), ziel);
}

describe('useSucheAusUrl: Feldstand', () => {
  it('fremde Adressänderung gewinnt über das Feld (Header-Sprung, Link)', () => {
    let s = anfangsStand('');
    s = mitWert(s, 'miete');
    s = nachAdresse(s, 'recht');
    expect(s.wert).toBe('recht');
  });

  it('eigenes Echo überschreibt NICHT die inzwischen weitergetippten Zeichen', () => {
    let s = anfangsStand('');
    s = mitWert(s, 'ab');
    s = nachEigenemSchreiben(s, 'ab'); // Spiegel feuert …
    s = mitWert(s, 'abc');             // … der Nutzer tippt weiter …
    s = nachAdresse(s, 'ab');          // … dann trifft das Echo ein.
    expect(s.wert).toBe('abc');
  });

  // Gegenprüfungs-Befund 7.8.2026 (ERNST). Die Merkung galt unbegrenzt: nach
  // einem gespiegelten «miete» wurde JEDE spätere Rückkehr auf ?q=miete als
  // eigenes Echo missdeutet. Die Zurück-Taste führte auf die alte Adresse, das
  // Feld behielt den neuen Begriff — und der Spiegel schrieb die History-Position
  // 300 ms später wieder um.
  it('Zurück-Taste auf einen früher selbst gespiegelten Wert wird übernommen', () => {
    let s = anfangsStand('');
    s = mitWert(s, 'miete');
    s = spiegele(s);                 // Adresse ?q=miete (selbst geschrieben)
    expect(s.wert).toBe('miete');
    s = nachAdresse(s, 'recht');     // Header-Sprung nach ?q=recht
    expect(s.wert).toBe('recht');
    s = nachAdresse(s, 'miete');     // Zurück-Taste
    expect(s.wert).toBe('miete');    // Feld folgt der Adresse …
    expect(s.wert.trim()).toBe(s.gesehen); // … also kein Rückschreiben mehr (Effekt-Wächter)
  });

  it('Merkung gilt für genau EIN Echo und verfällt danach', () => {
    let s = anfangsStand('');
    s = mitWert(s, 'miete');
    s = spiegele(s);
    expect(s.selbstGeschrieben).toBeNull();
  });

  it('unveränderte Adresse lässt den Stand unberührt (kein Render-Loop)', () => {
    const s = mitWert(anfangsStand('a'), 'abc');
    expect(nachAdresse(s, 'a')).toBe(s);
  });
});
