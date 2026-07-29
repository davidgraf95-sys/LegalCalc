// ─── Das Menü-Paar der Leser-Werkzeugleiste (W2·7-BEZUG/B6) ──────────────────
//
// «Rechtsprechung ▾» und «Ansicht ▾» sind ein PAAR: zwei Antworten auf zwei
// benachbarte Fragen — WELCHE Entscheide stehen am Artikel, WIE ist der
// Gesetzestext gesetzt. Sie standen bisher an zwei Stellen als loses Fragment
// nebeneinander (Inhalts-Kopf der Einzelansicht, Such-Leiste im Split-View);
// die Paarung existierte damit zweimal im Code und konnte auseinanderlaufen —
// und tat es auch (verschiedene Label-Schwellen sm/lg).
//
// Diese Komponente ist die EINE Quelle der Paarung (§5): Reihenfolge, Abstand
// und die gemeinsame Griff-Anatomie stehen hier, nicht an den Aufrufstellen.
// Erkennbar als Paar wird es über NÄHE (gap-1 innen gegen gap-3 zu den
// Nachbarn), nicht über einen gemeinsamen Rahmen — Gruppierung trägt Weissraum
// vor Linien (DESIGN-REGLEMENT F1).
//
// Reihenfolge «Rechtsprechung» vor «Ansicht»: unverändert gegenüber B4/B5.
// Reine Darstellung (§3) — beide Menüs halten ihren Zustand selbst.

import { LeserAnsichtMenu } from './LeserAnsichtMenu';
import { LeserRechtsprechungMenu } from './LeserRechtsprechungMenu';
import type { LinienProfil } from './linienAufbau';
import type { Histogramm, Zeitbereich } from './bezugZeit';
import type { BezugStatus } from '../../lib/verzahnung/facetten';

export function LeserMenuPaar({
  kantoneVerfuegbar, klassenImErlass, bezugHistogramm, bezugBereich, linien, fussnotenAnzahl,
}: {
  /** B4: Kantone, zu denen dieser Erlass Kanten hat (Kanton-Schalter). */
  kantoneVerfuegbar?: string[];
  /** B7/c: Kanten je Instanz-Klasse in diesem Erlass (Zahl am Schalter). */
  klassenImErlass?: Partial<Record<BezugStatus, number>>;
  /** B5: Jahres-Verteilung der Kanten (Zeitstrahl). */
  bezugHistogramm?: Histogramm;
  /** B5: aktiver Von-Bis-Bereich. */
  bezugBereich?: Zeitbereich;
  linien: LinienProfil;
  fussnotenAnzahl: number | null;
}) {
  return (
    <div className="flex items-center gap-1">
      <LeserRechtsprechungMenu kantoneVerfuegbar={kantoneVerfuegbar}
        klassenImErlass={klassenImErlass}
        histogramm={bezugHistogramm} bereich={bezugBereich} />
      <LeserAnsichtMenu zeigeLinien={linien.guideEbene !== null}
        linienAutoAn={linien.autoGuide} fussnotenAnzahl={fussnotenAnzahl} />
    </div>
  );
}
