import { Link } from 'react-router-dom';
import type { KopfDaten } from './InhaltsKopfKontext';

// ─── Inhalts-Kopf (Einzelansicht «analog Split-View», ohne Verschiebe-Optionen) ─
//
// Wenn EINE Inhaltsseite offen ist (kein Split-View), trägt sie oben — analog zur
// Split-View-Pane-Titelleiste — einen schmalen Kopfbalken: klickbare Breadcrumb
// «woher man kommt» (Gesetze › Bund › OR), bei Gesetzen der gerade gelesene
// Artikel (live), rechts Suche, die beiden Menüs, der Stand + ✕ → Startseite.
// KEINE Verschiebe-/Tausch-Steuerung (es gibt nur diese eine Ansicht). Reine
// Darstellung (§3). Kontext/Helfer (melde, istInhaltsPfad, kopfVonPfad) liegen
// in InhaltsKopfKontext.ts.
//
// ── W2·7-BEZUG/B6 — Gesamtüberarbeitung der Leiste (Auftrag David 28.7.2026:
//    «die gesamte werkzeugsleiste überarbeiten und minimalistischer und
//    praktischer darstellen»). Drei Befunde, drei Antworten:
//
//  ① ORT statt drei Zonen. Die Leiste war ein `grid-cols-[1fr_auto_1fr]`:
//     Brotkrumen links, Artikel MITTIG, Bedien-Cluster rechts. Brotkrumen und
//     Artikel beantworten aber DIESELBE Frage («wo bin ich?») und standen
//     dennoch durch eine leere Mittelspalte getrennt — auf 1440 px klaffte
//     zwischen ihnen ein 300-px-Loch, während sich rechts fünf Griffe drängten.
//     Neu: EINE Ortsangabe links (Krumen · Artikel), EIN Griff-Riegel rechts.
//     Die Wiederholung des Kürzels («… › ZGB · Art. 212 ZGB») entfällt dabei —
//     der Artikel steht ja unmittelbar hinter seinem Erlass (`kuerzeArtikel`).
//
//  ② SCHMALE BREITEN. Bei 360 px teilte das 1fr_auto_1fr-Raster den Rest
//     gleichmässig auf zwei Spalten auf und liess für die Krumen ~30 px übrig;
//     jede Krume truncatete FÜR SICH → die Leiste zeigte «( ) )» statt
//     «Gesetze › Bund › ZGB». Neu: unterhalb sm tragen die führenden Krumen
//     EINEN ‹-Rücksprung auf die Eltern-Ebene (bei Gesetzen die gefilterte
//     Gesetzes-Übersicht — dasselbe Ziel, das die Sektions-Krume «Gesetze»
//     ansteuert), und nur die Blatt-Krume + der Artikel bleiben ausgeschrieben.
//     Gekürzt wird als EINE Einheit, nie Zeichen für Zeichen je Krume.
//
//  ③ VIER ANATOMIEN → EINE. Die Griffe (☰, Suche, Rechtsprechung ▾, Ansicht ▾,
//     ✕) trugen bordierte Knöpfe, `lc-chip` mit Messing-Tick, `lc-input` und
//     blanken Text nebeneinander, in zwei Radien und zwei Schriftgraden. Neu
//     alle auf `lc-leiste-griff` (24 px, rounded-md, Mono-Micro); gruppiert
//     wird über Weissraum statt Rahmen (Reglement F1).
//
// Was NICHT wandert: die Stand-Angabe bleibt in JEDER Breite ausgeschrieben
// sichtbar (D1 — sie ist ein Rechtswert, kein Zierrat; sie wird leiser gesetzt,
// nie versteckt). Kein Griff ist weggefallen, keiner ist in ein Menü gerutscht.
// Höhe unverändert h-9 ⇒ CLS 0 gegenüber dem Vorzustand.

/** Artikel-Etikett ohne die Wiederholung des Erlass-Kürzels, das direkt davor
 *  in der Brotkrume steht («Art. 212 ZGB» → «Art. 212», wenn die Blatt-Krume
 *  «ZGB» heisst). Reine Anzeige-Ableitung: der Melde-Vertrag (`KopfDaten.artikel`)
 *  bleibt das volle Zitat, das der Split-View-Kopf (PaneKopf) unverändert
 *  ausgibt — dort steht das Kürzel nicht daneben. Greift nur bei exaktem
 *  Suffix-Treffer mit Wortgrenze; sonst bleibt das Etikett unangetastet. */
function kuerzeArtikel(artikel: string | null | undefined, blatt: string | undefined): string | null {
  if (!artikel) return null;
  if (!blatt) return artikel;
  const suffix = ` ${blatt}`;
  return artikel.endsWith(suffix) ? artikel.slice(0, -suffix.length) : artikel;
}

export function InhaltsKopf({ daten, breiteKlasse, onSchliessen }: {
  daten: KopfDaten;
  /** Breitenklasse der Inhaltsspalte → Kopf fluchtet mit dem Inhalt. */
  breiteKlasse: string;
  onSchliessen: () => void;
}) {
  const letzter = daten.breadcrumb.length - 1;
  const blatt = daten.breadcrumb[letzter];
  // Rücksprung-Ziel für schmale Breiten: die NÄCHSTGELEGENE klickbare Krume
  // oberhalb des Blatts. Bei Gesetzen ist das die Ebene-Krume («Bund» →
  // /gesetze, «Kanton BS» → /gesetze?ebene=kanton&kt=BS) — also dieselbe
  // Übersicht, auf die auch die Sektions-Krume führt: kein Ziel geht verloren.
  const eltern = daten.breadcrumb.slice(0, letzter).reverse().find((b) => b.to);
  const artikelKurz = kuerzeArtikel(daten.artikel, blatt?.label);
  return (
    // Klebt unter der Topbar (sticky top-16 = 4rem), bleibt beim Scrollen sichtbar
    // (damit der Live-Artikel mitläuft). z ÜBER den Inhalts-Sticky-Leisten (Suche
    // z-16 / Sektions-Kontextkopf z-15), damit das A26-«Ansicht»-Dropdown-Panel
    // beim Aufklappen über sie legt statt dahinter zu verschwinden; die Leiste
    // selbst überlappt sie nicht (sie sitzt 36 px höher), das z ist rein fürs Panel.
    // A41 (David 16.7.2026, Overlay-Bug): z BEWUSST UNTER dem Topbar-Stapelkontext
    // (Topbar sticky z-20). Vorher z-30 > 20 → dieser Kopf legte sich über das
    // GANZE Topbar-Fenster inkl. des Header-Such-Dropdowns (dessen z-30 IM z-20-
    // Topbar-Kontext gefangen ist) → «kopfzeile bei gesetzen verdeckt suchresultate
    // aus dem header». z-[19] hält den Kopf weiter über den Reader-Sticky-Leisten
    // (z-16/z-15 → A26-Panel bleibt oben), lässt aber das Header-Dropdown darüber.
    <div data-inhalt-kopf className="sticky top-16 z-[19] border-b border-line bg-paper">
      {/* `relative`: Anker für das mobile Overlay-Suchfeld (A35, sucheSlot) — es legt
          sich `absolute` über die Zeile, ohne etwas zu verschieben (§15.2). */}
      <div className={`${breiteKlasse} relative mx-auto flex h-9 items-center gap-1.5 px-5 sm:gap-2 sm:px-6 md:gap-3`}>
        {/* ① ORT: Krumen und Artikel als EINE Angabe. `min-w-0` + `overflow-hidden`
            machen sie zur einzigen schrumpfenden Zone der Leiste — die Griffe
            rechts behalten damit in jeder Breite ihre Plätze (keine
            Umbruch-Wanderung, CLS 0 beim Einlaufen des Live-Artikels). */}
        <nav aria-label="Brotkrümel" className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-xs text-ink-500">
          {/* ② Unter sm: EIN Rücksprung statt vier zerhackter Krumen. */}
          {eltern?.to && (
            <Link to={eltern.to} aria-label={`Zurück zu ${eltern.label}`} title={`Zurück zu ${eltern.label}`}
              className="shrink-0 no-underline hover:text-brass-700 sm:hidden">‹</Link>
          )}
          {daten.breadcrumb.map((b, i) => (
            <span key={`${i}-${b.label}`}
              // Unter sm bleibt nur die Blatt-Krume — und auch die nur, solange
              // KEIN Artikel läuft: sobald einer läuft, trägt sein volles Zitat
              // («Art. 212 ZGB») das Kürzel bereits mit sich. Zwei Angaben
              // desselben Erlasses auf 360 px wären die teuerste Dopplung der
              // Leiste.
              className={`min-w-0 items-center gap-1 ${
                i < letzter || daten.artikel ? 'hidden sm:inline-flex' : 'inline-flex'
              }`}>
              {i > 0 && <span aria-hidden className="hidden text-ink-300 sm:inline">›</span>}
              {b.to
                ? <Link to={b.to} className="truncate no-underline hover:text-brass-700">{b.label}</Link>
                : <span className={`truncate ${i === letzter ? 'font-medium text-ink-800' : ''}`}>{b.label}</span>}
            </span>
          ))}
          {/* Live-Artikel als feinste Stufe derselben Ortsangabe — Mono/Micro,
              damit er die Krumen nicht überstimmt (ruhigere Typo-Hierarchie).
              Zwei Fassungen desselben Werts (§5: eine Quelle, zwei Zuschnitte —
              nur je eine ist gerendert, die andere ist `display:none`):
               · ab sm ohne das Kürzel, das die Krume daneben schon nennt, und
                 `shrink-0` — beim Engerwerden gibt die Krume nach, nicht die
                 genauere Angabe (gleiche Setzung wie im PaneKopf);
               · unter sm als VOLLES Zitat und truncatend: dort steht keine
                 Krume mehr daneben, und wenn der Platz nicht reicht, soll die
                 Erlass-Abkürzung am Ende abgeschnitten werden — nie die
                 Artikelnummer am Anfang. */}
          {daten.artikel && (
            <>
              <span className="num min-w-0 truncate text-micro font-medium text-ink-700 sm:hidden">{daten.artikel}</span>
              <span className="num hidden shrink-0 text-micro font-medium text-ink-700 sm:inline">
                <span aria-hidden className="mr-1 text-ink-300">·</span>{artikelKurz}
              </span>
            </>
          )}
        </nav>
        {/* ③ GRIFF-RIEGEL: drei Gruppen (finden · wählen · Blatt), innen gap-1,
            zwischen den Gruppen gap-3 — Nähe trägt die Gruppierung, nicht Linien
            (Reglement F1). */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* A35 (David 19.7.2026): das In-Gesetz-Suchfeld sitzt HIER in der
              Kopfzeile (statt in der früheren full-width Such-Leiste) — zusammen
              mit dem ☰-Gliederungsknopf die Gruppe «finden». */}
          {daten.sucheSlot && <span data-such-slot>{daten.sucheSlot}</span>}
          {/* A26 (David 11.7.2026): das grundart-spezifische Bedien-Element (beim
              Gesetzes-Volltext das Menü-Paar «Rechtsprechung ▾ · Ansicht ▾») —
              links vom Stand/✕, damit es immer erreichbar ist, während man im
              Gesetz ist. */}
          {daten.ansichtSlot}
          {/* D1/§7: der Stand ist ein Rechtswert und bleibt in JEDER Breite
              ausgeschrieben stehen — B6 setzt ihn nur leiser (Micro statt xs),
              versteckt ihn nicht. `ink-600` statt `ink-500`, weil 11-px-Text
              ≥ 4.5:1 tragen muss (F2). */}
          {daten.stand && <span className="shrink-0 whitespace-nowrap text-micro text-ink-600">Stand <span className="num">{daten.stand}</span></span>}
          <button type="button" onClick={onSchliessen}
            aria-label="Schliessen (zur Startseite)" title="Schliessen (zur Startseite)"
            className="lc-leiste-griff">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
