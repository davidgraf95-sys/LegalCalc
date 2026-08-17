import type { ReactNode } from 'react';
import { grundartMeta, kopfOverline } from '../helpers';
import { ErlassLeserKopf } from '../parts';
import { AmtlichesPdf } from '../parts/AmtlichesPdf';
import { ReiterAktion } from './ReiterAktion';
import { overlineGebiet, titelKennung } from './erlassAnsicht';
import type { LeserV3Modell } from './leserV3Modell';

// ─── Der Erlass-Kopf der V3-Zelle (Kap. 4e) ──────────────────────────────────
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H3, §6.6 — der Rahmen soll sagen, WO
// etwas steht, nicht auch noch, welche sieben Props der geteilte Kopf braucht).
// Reine Weitergabe: keine Verzweigung, kein eigener Zustand.
//
// Der geteilte Erlass-Kopf, seit S3 im Neu-Design: Titel · Fakten · Stand+Status
// · Aktionen. Er trägt Stand und die Warnung «nicht konsolidiert» — damit ist
// «Stand + Warnung erkennen» in JEDER Breite ohne Umweg erfüllt, auch dort, wo
// die Leiste ein Sheet ist.
//
// S3-Nachzug: `kennzahlen` ist dieselbe Kennzahl, die die Erlass-Übersicht
// daneben schon bekommt (§5) — sie speist die Anhang-Dominanz («Einträge» statt
// «Artikel»); `nichtKonsolidiertSeit` gibt der Warnung ihren Zeitbezug. Ohne
// beides sagte der V3-Kopf weniger als der Ist-Kopf, obwohl es dieselbe
// Komponente ist.

export function LeserErlassKopfZone({ m, erlass, artikelAnzahl, bestimmungsWort, fassungsWahl }: {
  m: LeserV3Modell;
  erlass: NonNullable<LeserV3Modell['erlass']>;
  artikelAnzahl: number;
  bestimmungsWort: 'Artikel' | 'Paragraphen';
  /** W2·5g — Fassungswahl/Zeitmaschine, vor den übrigen Aktionen. */
  fassungsWahl?: ReactNode;
}) {
  const meta = grundartMeta(erlass.key);
  return (
    <ErlassLeserKopf erlass={erlass} artikelAnzahl={artikelAnzahl} bestimmungsWort={bestimmungsWort}
      currency={m.currency?.[erlass.key]} nichtKonsolidiert={m.nichtKonsolidiert}
      kennzahlen={m.gliederung.kennzahlen} nichtKonsolidiertSeit={m.nichtKonsolidiertSeit}
      // Ä-(d) aus S3: bei sehr langen Titeln steht die Kennung VOR dem Titel
      // statt am Ende einer dreizeiligen H1 (`erlassAnsicht.titelKennung`).
      kennung={titelKennung(erlass)}
      overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet(erlass, m.kantonSys))}
      hinweis="Snapshot — massgeblich ist die amtliche Fassung"
      aktionen={
        <>
          {fassungsWahl}
          <ReiterAktion kuerzel={erlass.kuerzel} onGeoeffnet={() => {
            m.setReiterToast(true);
            const toastRef = m.refs.reiterToastTimerRef;
            if (toastRef.current) window.clearTimeout(toastRef.current);
            toastRef.current = window.setTimeout(() => m.setReiterToast(false), 3200);
          }} />
          {erlass.pdfUrl && (
            <AmtlichesPdf href={erlass.pdfUrl} stand={erlass.pdfStand ?? erlass.stand} extern />
          )}
        </>
      } />
  );
}
