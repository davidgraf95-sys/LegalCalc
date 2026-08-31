import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// ─── Wächter: Transkription des V-1-Tors ↔ Produktions-Quelltext ────────────
//
// `scripts/check-verweis-inventar.ts` misst, wie der Leser Verweise auflöst.
// Die Erkenner importiert es echt; die INLINE-GUARDS der Entscheidkette leben
// aber in React-internen, nicht exportierten Funktionen
// (`restMitIntern` in NormText.tsx, `etabliertFremdgesetz` in ArtikelBody.tsx)
// und sind im Tor TRANSKRIBIERT. Eine Transkription, die still von ihrem
// Original abdriftet, wäre die schlimmste Sorte Messgerät: sie meldet Ruhe
// über etwas anderes als das, was läuft.
//
// Dieser Test ist die UNABHÄNGIGE Gegenprobe zum Wächter, den das Tor selbst
// fährt: er liest die Guard-Tabelle aus dem Tor-Quelltext (statt sie zu
// importieren — das Tor führt beim Import seinen ganzen Korpus-Lauf aus) und
// prüft jedes Literal zeichengleich gegen die genannte Quelldatei. Ändert
// jemand einen Guard, ohne das Tor nachzuziehen, kippt dieser Test.
//
// Ergänzend: der SHA-256-Anker aus dem committeten Artefakt. Er fängt, was ein
// Literal-Vergleich strukturell NICHT sehen kann — eine geänderte
// Entscheid-REIHENFOLGE in `restMitIntern` bei unveränderten Regex-Literalen.

const TOR = 'scripts/check-verweis-inventar.ts';
const ARTEFAKT = 'messwerte/verweis-inventar.json';
const QUELLEN: Record<string, string> = {
  'NormText.tsx': 'src/components/NormText.tsx',
  'ArtikelBody.tsx': 'src/components/normtext/ArtikelBody.tsx',
};

/** Guard-Tabelle des Tors: (Name, Quelldatei, transkribiertes Literal). */
function guards(): { name: string; datei: string; literal: string }[] {
  const quelle = readFileSync(TOR, 'utf8');
  const treffer = [
    ...quelle.matchAll(
      /(\w+): \{\s*\n\s*zweck: '[^']*',\s*\n\s*datei: '([^']+)',\s*\n\s*literal: String\.raw`([^`]*)`,/g,
    ),
  ];
  return treffer.map((m) => ({ name: m[1], datei: m[2], literal: m[3] }));
}

describe('V-1 · Verweis-Inventar-Tor: Guard-Transkription', () => {
  it('findet genau so viele Guards, wie das Artefakt deklariert', () => {
    // §6.7 lit. b: ein Wächter, dessen Fundmenge leer laufen kann, ist keiner.
    // Gegengelesen wird gegen die Zahl, die das Tor selbst in die Basislinie
    // geschrieben hat — ein zugefügter oder entfernter Guard verlangt damit
    // eine bewusste Regeneration, statt still an diesem Test vorbeizugehen.
    const artefakt = JSON.parse(readFileSync(ARTEFAKT, 'utf8')) as { _quellen: { guards: number } };
    expect(guards().length).toBe(artefakt._quellen.guards);
    expect(guards().length).toBeGreaterThan(0);
  });

  it('jedes transkribierte Muster steht zeichengleich in seiner Quelldatei', () => {
    // Verglichen wird das MUSTER, nicht die Schreibweise des Literals: ein
    // verhaltensneutraler Umbau («const X = String.raw`…`; new RegExp(X, 'g')»)
    // darf keinen Fehlalarm auslösen, jede Musteränderung dagegen schon.
    // Begründung im Tor bei `suchtext()`.
    const muster = (literal: string) => {
      const m = /^\/(.*)\/([a-z]*)$/s.exec(literal);
      return m ? m[1] : literal;
    };
    const abweichungen: string[] = [];
    for (const g of guards()) {
      const pfad = QUELLEN[g.datei];
      expect(pfad, `Unbekannte Quelldatei «${g.datei}» in ${TOR}`).toBeTruthy();
      const gesucht = g.literal.startsWith("'") ? g.literal : muster(g.literal);
      if (!readFileSync(pfad, 'utf8').includes(gesucht)) {
        abweichungen.push(`${g.name} fehlt in ${pfad}: ${gesucht}`);
      }
    }
    expect(abweichungen).toEqual([]);
  });

  it('deckt die Guards ab, die über Link/kein-Link entscheiden', () => {
    const namen = guards().map((g) => g.name);
    for (const pflicht of [
      'ART_INTERN', 'PARAGRAF_INTERN', 'PARAGRAF_FREMD_GROSS', 'PARAGRAF_FREMD_NAME',
      'M12', 'NORM_REF', 'KUERZEL_KANON',
      'CHAPEAU_DOPPELPUNKT', 'CHAPEAU_BESTIMMUNGEN', 'CHAPEAU_KUERZEL',
    ]) {
      expect(namen, `Guard ${pflicht} nicht mehr transkribiert`).toContain(pflicht);
    }
  });

  it('der SHA-256-Anker im Artefakt zeigt auf die heutige NormText.tsx', () => {
    // Zieht jemand NormText.tsx um (V-2/V-4), MUSS die Basislinie im selben
    // Commit regeneriert werden: npm run check:verweis-inventar -- --schreiben
    const artefakt = JSON.parse(readFileSync(ARTEFAKT, 'utf8')) as {
      _quellen: { normTextSha256: string };
    };
    const ist = createHash('sha256')
      .update(readFileSync(QUELLEN['NormText.tsx']))
      .digest('hex');
    expect(artefakt._quellen.normTextSha256).toBe(ist);
  });
});
