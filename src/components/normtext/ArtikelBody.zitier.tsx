import React, { useState } from 'react';
import { zitatMitAusweis, heuteIso } from '../../lib/format';
import type { AusweisBasis } from './ArtikelBody.helfer';

// Klickbare Zitat-Marke (Absatznummer oder lit./Ziff.). Kopiert die präzise
// Fundstelle; kurzes ✓ als Rückmeldung. Nur in der Lesesicht (zitierKontext).
// B-6 (QS-BASIS): liegt eine `ausweis`-Basis vor, wird beim Klick der Stand-
// Ausweis (Fassung + Abrufdatum + Permalink, §7 a–d) an die Fundstelle gehängt.
export function ZitierMarke({ zitat, ausweis, sup, klasse, children }: {
  zitat: string; ausweis?: AusweisBasis; sup?: boolean; klasse?: string; children: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);
  const kopiere = () => {
    const text = ausweis && typeof window !== 'undefined'
      ? zitatMitAusweis(zitat, {
          fassung: ausweis.fassung,
          abruf: heuteIso(new Date()),
          permalink: `${window.location.origin}${ausweis.permalinkBasis}`,
        })
      : zitat;
    void navigator.clipboard?.writeText(text).then(() => {
      setOk(true); window.setTimeout(() => setOk(false), 1200);
    });
  };
  // DESIGN-D0: `text-brass-700/55` → `text-brass-700`. Die Deckkraft war seit je
  // ein No-op (Fund B4) — ausgeliefert wurde immer das volle brass-700 (5.41:1,
  // AA). Mit dem Wurzel-Fix hätte sie erstmals gegriffen und den Zitierknopf auf
  // 2.2:1 gedrückt (#b9a683 auf Papier), weit unter AA. Ein gedämpfter
  // Ruhezustand wäre eine neue Design-Entscheidung — die trifft nicht D0.
  const knopf = (
    <button type="button" onClick={kopiere} title={`${zitat} — kopieren`}
      className={`num font-semibold cursor-pointer text-brass-700 hover:underline decoration-dotted underline-offset-2 ${klasse ?? ''}`}>
      {ok ? '✓' : children}
    </button>
  );
  return sup ? <sup className="mr-1">{knopf}</sup> : knopf;
}
