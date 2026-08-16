import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { formatiereDatum } from './helpers';
import { LeserMenuPaar } from './LeserMenuPaar';
import { InGesetzSuche } from './parts/InGesetzSuche';
import type { Histogramm, Zeitbereich } from './bezugZeit';
import type { BezugStatus } from '../../lib/verzahnung/facetten';
import type { KlassenZahlen } from '../../lib/rechtsprechung/bezuege';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { useMeldeInhaltsKopf } from '../../components/layout/InhaltsKopfKontext';

// `MeldeKopf` NICHT aus ./inhalt-hooks importiert (check:zyklen, Schranke 1):
// inhalt-hooks.tsx re-exportiert `useInhaltsKopfMeldung` VON hier — ein
// Rückimport hierher (auch reiner Typ) wäre ein Modul-Zyklus. Beide Dateien
// leiten den Typ darum unabhängig aus derselben Quelle ab (§5: eine WAHRHEIT,
// zwei Ableitungen desselben Ausdrucks — kein manuell gepflegtes Duplikat).
type MeldeKopf = ReturnType<typeof useMeldeInhaltsKopf>;

// ═══ ABSCHNITT · Kopf-Meldung (§6.6-Split, W2·19-GLIEDERUNG/S9) ══════════════
//
// Aus ./inhalt-hooks HERAUSGELÖST (nicht neu geschrieben, byte-gleiche Logik):
// die Datei stand nach dem S9-Schwachstelle-8-Fix (`zeigeGliederung` auf
// `eintraege` statt `sektionen`) bei 804/800 Zeilen. `useInhaltsKopfMeldung`
// ist ein einzelner, in sich geschlossener Effekt-Hook (Breadcrumb · Stand ·
// Live-Artikel · Ansicht-/Such-Slot) ohne Zustand, der mit keinem anderen Hook
// dieser Datei geteilte Refs oder Reihenfolge-Abhängigkeiten hat — der
// sauberste Schnitt (§6.6 Fassaden-Muster). `inhalt-hooks.tsx` re-exportiert
// den Namen unverändert (`export { useInhaltsKopfMeldung } from
// './inhalt-kopfmeldung'`), der Aufrufer in `inhalt.tsx` bleibt unangetastet.
//
// `MeldeKopf` bleibt bei ./inhalt-hooks definiert (dort auch von
// `useLeserDaten` gebraucht) und wird hier nur als Typ importiert (§5: eine
// Definition, kein zweiter Alias).

// ── Kopf-Meldung (Breadcrumb · Stand · Live-Artikel · Ansicht + Suche) ───────
export function useInhaltsKopfMeldung(opts: {
  erlass: BrowseErlass | null;
  aktArtikel: string | null;
  meldeInhaltsKopf: MeldeKopf;
  imPane: boolean;
  eintraege: NormSnapshot[] | null;
  fussnotenAnzahl: number | null;
  /** W2·7-BEZUG/B4: Kantone, zu denen dieser Erlass Kanten hat (Kanton-Schalter).
   *  OPTIONAL: leer = noch kein Bezugs-Shard geladen ⇒ kein Kanton-Streifen. */
  kantoneVerfuegbar?: string[];
  /** B7/c: Kanten je Instanz-Klasse in diesem Erlass (Zahl am Instanz-Schalter). */
  klassenImErlass?: Partial<Record<BezugStatus, KlassenZahlen>>;
  /** W2·7-BEZUG/B5: Jahres-Verteilung der Kanten (Zeitstrahl im Dropdown).
   *  OPTIONAL: leer = noch kein Shard ⇒ der Streifen sagt das ehrlich. */
  bezugHistogramm?: Histogramm;
  /** W2·7-BEZUG/B5: aktiver Von-Bis-Bereich. OPTIONAL: Default = offen. */
  bezugBereich?: Zeitbereich;
  suche: string;
  setSuche: Dispatch<SetStateAction<string>>;
  istXl: boolean;
  tocOffen: boolean;
  tocAuf: boolean;
  setTocOffen: Dispatch<SetStateAction<boolean>>;
  setTocAuf: Dispatch<SetStateAction<boolean>>;
}): void {
  const {
    erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, fussnotenAnzahl, kantoneVerfuegbar = [], klassenImErlass,
    bezugHistogramm, bezugBereich,
    suche, setSuche, istXl, tocOffen, tocAuf, setTocOffen, setTocAuf,
  } = opts;

  // A/A2/A3/F + A26: Kopf melden (Breadcrumb Gesetze › Ebene › Kürzel · Stand ·
  // aktueller Artikel · «Ansicht»-Dropdown). Wird vom NÄCHSTEN Provider gefangen:
  // Einzelansicht → Inhalts-Kopf (Shell); Split-View → der jeweilige PaneKopf.
  // Live-Artikel kommt aus dem IntersectionObserver.
  // A26 (David 11.7.2026): NUR die Einzelansicht (!imPane) trägt das «Ansicht»-
  // Dropdown im immer sichtbaren Inhalts-Kopf mit — im Split-View bleibt es (ohne
  // PaneKopf-Umbau/Stacking-Risiko) im Erlass-Kopf. `eintraege` (Volltext-Snapshot)
  // grenzt pdf-embed/nur-live-link aus (dort wären die Optionen wirkungslos, §13 F4).
  useEffect(() => {
    if (!erlass) return;
    const ebeneLabel = erlass.rechtsgebiet === 'international'
      ? 'International'
      : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`;
    // Ebene-Segment klickbar → gefilterte Gesetzes-Übersicht (?ebene=/?kt=).
    const ebeneTo = erlass.rechtsgebiet === 'international'
      ? '/gesetze?ebene=international'
      : erlass.ebene === 'bund' ? '/gesetze'
        : `/gesetze?ebene=kanton&kt=${encodeURIComponent(erlass.kanton ?? '')}`;
    // A35 (David 19.7.2026): ☰-Gliederungsknopf, den das In-Gesetz-Suchfeld im Kopf
    // mitführt (löst die frühere `data-such-bar`-Position ab, die in der Einzelansicht
    // entfällt). Desktop (istXl): nur als Wiedereinblender, wenn die Gliederungsspalte
    // EINGEKLAPPT ist. Mobil: öffnet die Gliederung als Overlay-Drawer.
    // W2·19-GLIEDERUNG/S9 (Bau-Spec §7 «☰-Knopf existiert künftig auch bei
    // sektionen.length === 0», Schwachstelle 8): die frühere Bedingung
    // `sektionen.length > 0` liess den Knopf für JEDEN Erlass ohne amtliche
    // Gliederung verschwinden — genau die 486 T4-Fälle, die B2/B3 überhaupt
    // erst betreffen (dieselbe `hatLeiste`-Logik wie inhalt-volltext.tsx,
    // dort auf `eintraege.length` — hier liegt nur das Prop, keine Länge 0
    // ausser bei einem wirklich leeren Snapshot).
    const zeigeGliederung = !imPane && (eintraege?.length ?? 0) > 0 && (istXl ? !tocOffen : true);
    const gliederungKnopf = zeigeGliederung ? (
      <button type="button" aria-expanded={istXl ? tocOffen : tocAuf}
        onClick={() => { if (istXl) setTocOffen(true); else setTocAuf((v) => !v); }}
        title="Gliederung" aria-label="Gliederung"
        // B6: gemeinsame Leisten-Anatomie statt eigenem bordierten Kästchen.
        // Das Wort «Gliederung» erscheint ab xl — eine Stufe SPÄTER als die
        // beiden Menü-Wörter (md), damit das Paar «Rechtsprechung ▾ · Ansicht ▾»
        // die einzige beschriftete Gruppe der mittleren Breiten bleibt und der
        // Riegel nicht drei Wörter nebeneinander trägt.
        className="lc-leiste-griff">
        <span aria-hidden>☰</span><span className="hidden xl:inline">Gliederung</span>
      </button>
    ) : undefined;
    meldeInhaltsKopf({
      breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: ebeneLabel, to: ebeneTo }, { label: erlass.kuerzel }],
      stand: erlass.stand ? formatiereDatum(erlass.stand) : null,
      // Hinter dem laufenden Artikel die Gesetzesabkürzung (z. B. «Art. 7 OR»).
      artikel: aktArtikel ? `${aktArtikel} ${erlass.kuerzel}` : null,
      ansichtSlot: !imPane && eintraege
        ? (
          // W2·7-BEZUG/B4 (Vorgabe David 28.7.2026): «Rechtsprechung ▾» als
          // EIGENES Dropdown der Werkzeugleiste, links von «Ansicht ▾». Beide
          // gehen in denselben `ansichtSlot` — der Kopf (components/layout)
          // rendert ihn opak, die Layer-Trennung bleibt also unberührt.
          // B6: die Paarung selbst liegt in `LeserMenuPaar` (§5) — sie stand
          // vorher als identisches Fragment an ZWEI Stellen (hier und in der
          // Pane-Suchleiste) und lief in den Label-Schwellen auseinander.
          <LeserMenuPaar kantoneVerfuegbar={kantoneVerfuegbar} klassenImErlass={klassenImErlass}
            bezugHistogramm={bezugHistogramm} bezugBereich={bezugBereich}
            fussnotenAnzahl={fussnotenAnzahl} />
        )
        : undefined,
      // A35: das In-Gesetz-Suchfeld nur in der Einzelansicht (im Split-View trägt es
      // weiter die pane-lokale `data-such-bar`, da dort kein InhaltsKopf existiert).
      sucheSlot: !imPane && eintraege
        ? <InGesetzSuche value={suche} onChange={setSuche} gliederung={gliederungKnopf} />
        : undefined,
    });
    // Setter (setSuche/setTocOffen/setTocAuf) sind stabil; Deps byte-identisch zum
    // früheren Inline-Effekt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, fussnotenAnzahl,
      kantoneVerfuegbar, klassenImErlass, bezugHistogramm, bezugBereich,
      suche, istXl, tocOffen, tocAuf]);
}
