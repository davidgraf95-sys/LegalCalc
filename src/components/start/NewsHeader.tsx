import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { KorpusStand } from '../ui/KorpusStand';

// ─── Jüngste Entscheide im Korpus (Startseite V4, Modul #6) ─────────────────
//
// EHRLICHER TITEL (W2·23-STARTSEITE-V4 §3 #6, §8): der Streifen hiess «Neues
// vom Bundesgericht». Er zeigt aber, was IM KORPUS am jüngsten ist — und der
// endet je nach Register-Lauf Monate zurück. «Neues» versprach damit Aktualität,
// die die Daten nicht tragen. Der Titel sagt jetzt, was wirklich gezeigt wird;
// das Datum jedes Entscheids steht ohnehin als Gruppen-Überschrift darüber.
//
// Darunter EINE Korpus-Stand-Zeile über den geteilten Baustein `ui/KorpusStand`
// (zweiter Konsument: die Seitenleiste, Paket B). §8: sie sagt «Register
// erzeugt am …», nie «Stand der Rechtsprechung» — die `stand*`-Felder sind das
// Datum des Build-Laufs, nicht das des jüngsten Inhalts.
//
// Zeigt die jüngsten Bundesgerichtsentscheide als scanbaren Streifen, gespeist
// aus dem bestehenden Rechtsprechungs-Register (build-time, neueste zuerst —
// §3/§5: keine eigene Logik, nur Anzeige). Bewusst erweiterbar angelegt: weitere
// amtliche Quellen (neue Gesetze, Initiativen, …) lassen sich später als weitere
// `NachrichtenQuelle` ergänzen, ohne die Anzeige umzubauen.
//
// «live nachladen» (Davids Wahl): das Register ist die sofort sichtbare Basis;
// die Live-Augmentierung gegen entscheidsuche/OpenCaseLaw ist als eigener,
// abnahmebedürftiger Schritt offen (verifizierter API-Vertrag nötig, §1/§7) —
// hier NICHT unverifiziert eingebaut, damit nie falsche Entscheiddaten erscheinen.

// MAX 6 (V4 §3 #6): der Streifen ist eine Kostprobe, kein Archiv — «Alle
// Entscheide →» führt zur Vollsicht. Zwölf Karten hiessen auf «/» zwölf lazy
// gerenderte Kacheln in einem Scroll-Streifen, den kaum jemand zu Ende schob.
const MAX = 6;

/** ISO «YYYY-MM-DD…» → «DD.MM.YYYY» ohne Date-Objekt (deterministisch, SSR-sicher). */
function deDatum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/**
 * Ein Streifen-Eintrag: der Entscheid plus die VORAB aufgelösten Norm-Kürzel.
 *
 * Die Labels werden im dynamischen `import()` unten mitberechnet und hier
 * mitgeführt, statt `normLabel` statisch zu importieren: `browse.ts` zieht das
 * ERLASS_REGISTER nach sich und gehört darum nicht in das Startseiten-Bundle
 * (§15 — der Streifen lädt das Register ohnehin schon lazy).
 */
interface StreifenEintrag {
  e: BrowseEntscheid;
  /** Anzeigename des Rechtsgebiets (aus GEBIET_LABEL, im lazy Chunk aufgelöst). */
  gebiet: string;
  /** Kürzel der in der Regeste zitierten Kernnormen (leer, wenn keine erfasst). */
  normen: string[];
}

/** Aufeinanderfolgende Einträge gleichen Datums zu einer Gruppe bündeln.
 *
 *  J4 «Datum-Dedupe»: die Liste ist nach Datum absteigend sortiert (`nachDatum`),
 *  gleiche Daten stehen also zusammen. Statt dasselbe «07.08.2026» auf drei
 *  Karten nebeneinander zu wiederholen, trägt es die GRUPPE einmal als
 *  Überschrift. Rein darstellend (§3), keine Umsortierung — die Reihenfolge der
 *  Einträge bleibt exakt die der Quelle. */
function nachDatumGruppiert(liste: StreifenEintrag[]): { datum: string; eintraege: StreifenEintrag[] }[] {
  const gruppen: { datum: string; eintraege: StreifenEintrag[] }[] = [];
  for (const eintrag of liste) {
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.datum === eintrag.e.datum) letzte.eintraege.push(eintrag);
    else gruppen.push({ datum: eintrag.e.datum, eintraege: [eintrag] });
  }
  return gruppen;
}

export function NewsHeader() {
  const [news, setNews] = useState<StreifenEintrag[] | null>(null);
  const streifenRef = useRef<HTMLDivElement>(null);
  const titelId = useId();

  // #9: per Klick durch die Entscheide blättern — scrollt den Streifen um EINE
  // Karte, in beide Richtungen.
  //
  // Die Schrittweite wird GEMESSEN, nicht angenommen (Gegenprüfungs-Befund B3):
  // seit der Datums-Gruppierung (J4) ist ein `li` eine GRUPPE von Karten, nicht
  // mehr eine Karte, und der Abstand zwischen Karten ist keine feste Konstante
  // mehr. Beides aus dem Layout ablesen statt hart zu setzen — dann stimmt der
  // Schritt auch, wenn sich Kartenbreite (`clamp`) oder Abstand später ändern.
  const blaettere = (richtung: -1 | 1) => {
    const el = streifenRef.current;
    if (!el) return;
    const karten = el.querySelectorAll<HTMLElement>('li a');
    const erste = karten[0];
    // Abstand aus den Positionen zweier benachbarter Karten ableiten; gibt es
    // nur eine, genügt ihre Breite. Ohne jede Karte: knapp ein Sichtfenster.
    let schritt = erste ? erste.offsetWidth : el.clientWidth * 0.8;
    if (erste && karten[1]) {
      const abstand = karten[1].getBoundingClientRect().left - erste.getBoundingClientRect().left;
      if (abstand > 0) schritt = abstand;
    }
    // Nie weiter als ein Sichtfenster springen — sonst überspringt ein Klick auf
    // schmalen Geräten Karten, statt zur nächsten zu führen.
    el.scrollBy({ left: richtung * Math.min(schritt, el.clientWidth), behavior: 'smooth' });
  };

  useEffect(() => {
    let lebt = true;
    import('../../lib/rechtsprechung/browse')
      .then(async (m) => {
        // Gebiets-Labels aus DEMSELBEN lazy Chunk: `browse.ts` hängt ohnehin an
        // `normtext/register`, die beiden liegen also im gleichen Bündel — der
        // dynamische Zugriff kostet darum kein zusätzliches Startseiten-Gewicht.
        // Ein STATISCHER Import wäre hier falsch: die Startseiten-Bausteine
        // meiden das Erlass-Register bewusst (GesetzeChips führt die Kürzel
        // deshalb als eigene Liste).
        const { GEBIET_LABEL } = await import('../../lib/normtext/register');
        const manifest = await m.ladeEntscheidManifest();
        if (!lebt) return;
        // `!e.verweis`: Volltext-Verweise sind Redirect-Stubs auf einen echten
        // Eintrag (EntscheidLeser leitet auf `zielKey` um) — die Hauptansicht
        // (Rechtsprechung.tsx) zählt/listet sie durchgängig als `!e.verweis`.
        // Ohne diesen Filter doppelte der Ticker dieselbe BGE als eigene Karte.
        const bund = (manifest?.entscheide ?? []).filter((e) => e.gerichtstyp === 'bundesgericht' && !e.verweis);
        // Norm-Kürzel gleich hier auflösen — `normLabel` stammt aus demselben
        // lazy geladenen Modul und kostet darum kein zusätzliches Bundle-Gewicht.
        // Sie sind der §8-KONFORME Ersatz für eine fehlende Regeste: die im
        // Entscheid angewandten Normen stehen so im Korpus. Es wird NIE ein
        // generiertes Kurz-Résumé erzeugt (§8) — fehlt beides, bleibt die Karte
        // schlicht ohne Beschreibungszeile.
        setNews(m.nachDatum(bund).slice(0, MAX).map((e) => ({ // neueste zuerst
          e,
          gebiet: GEBIET_LABEL[e.sachgebiet] ?? e.sachgebiet,
          normen: e.normKeys.slice(0, 3).map((k) => m.normLabel(k)),
        })));
      })
      .catch(() => { if (lebt) setNews([]); });
    return () => { lebt = false; };
  }, []);

  // Leerzustand-Invariante (S3-Fix, §3 #6): das Modul verwaltet Titel, Höhen-
  // Reservierung und Kollaps selbst — nie eine Überschrift über Leerraum. Drei
  // Zustände, sauber getrennt (kein Doppelpfad; das Registry mappt titellos, S4).
  //
  // (1) LADEN (news===null): der Streifen lädt async aus dem Register nach; ohne
  //     reservierten Platz wächst er ein und schiebt die Startseite nach unten
  //     (gemessener CLS-Anteil 0,57). Während des Ladens dieselbe Mindesthöhe
  //     halten, die der geladene Streifen belegt → nahezu 0 Shift, KEIN Titel
  //     über der Reservierung. Reserviert nur Platz, kürzt keinen Inhalt (§15/2).
  if (news === null) return <div className="min-h-modul-news" aria-hidden />;
  // (2) DEFINITIV LEER (leeres Register, SSR/Prerender — in Prod nie, 272 BGE):
  //     KOMPLETT nichts — kein Titel, KEINE Höhen-Reservierung (§8). Vollkollaps.
  if (news.length === 0) return null;
  // (3) GEFÜLLT: Titel + Reservierung + Streifen, alles im Modul (s. <section>).

  return (
    /* A11y (§7): die Sektion trägt jetzt eine echte <h2> statt eines
       aria-label — dieselbe Ebene wie die übrigen Startseiten-Sektionen, damit
       das Dokument-Outline keine titellose Region mehr hat. */
    <section aria-labelledby={titelId} className="space-y-2 min-h-modul-news">
      <div className="flex items-center justify-between gap-3">
        <h2 id={titelId} className="lc-overline text-brass-700">Jüngste Entscheide im Korpus</h2>
        <div className="flex items-center gap-2">
          {/* Durchblättern per Klick (#9) — auf Touch/schmal ist zudem Wischen möglich. */}
          <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Entscheide durchblättern">
            <button type="button" onClick={() => blaettere(-1)} aria-label="Vorherige Entscheide"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-300 hover:text-brass-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => blaettere(1)} aria-label="Nächste Entscheide"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-300 hover:text-brass-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <Link to="/rechtsprechung" className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline whitespace-nowrap">
            Alle Entscheide →
          </Link>
        </div>
      </div>
      {/* Block-Scrollcontainer (klippt zuverlässig) + w-max-Flex innen — so
          verbreitert der Streifen die Seite nicht (Mobil-Overflow-Tor 390px). */}
      {/* LM-061 (Entscheid David 31.8.2026, revidiert D11): die angeschnittene
          Karte allein trägt ~2'600 px verborgenen Inhalt nicht — die
          Scrollstand-Affordanz aus B8 zeigt je Seite nur dann
          «mehr», wenn dort wirklich Karten liegen. */}
      <div ref={streifenRef} className="lc-scrollrand-x overflow-x-auto pb-1.5">
      {/* J4 · Datum-Dedupe: gruppiert nach Entscheiddatum. Das Datum steht EINMAL
          als Gruppen-Überschrift über seinen Karten, statt auf jeder Karte
          derselben Sitzung zu wiederholen. Jede Karte bleibt damit unter einem
          sichtbaren Datum — kein Eintrag verliert seine zeitliche Einordnung. */}
      {/* Snap-Ziel ist die KARTE, nicht die Gruppe (Gegenprüfungs-Befund B3):
          geblättert wird kartenweise, also muss auch dort eingerastet werden —
          sonst überspränge ein Klick innerhalb einer mehrtägigen Gruppe das
          Einrasten ganz. Die Datums-Überschrift steht über ihrer Kartenreihe und
          bleibt sichtbar, solange eine Karte der Gruppe im Blickfeld ist. */}
      <ul className="flex gap-5 w-max max-w-full snap-x snap-mandatory">
        {nachDatumGruppiert(news).map((g) => (
          <li key={g.datum} className="shrink-0">
            <p className="num mb-1.5 text-xs text-ink-500">{deDatum(g.datum)}</p>
            <div className="flex gap-3">
              {g.eintraege.map(({ e, gebiet, normen }) => (
                /* C-3 (31.8.2026): Lift + Schlagschatten entfallen — der
                   Karten-Hover läuft hausweit als EINE Regel an `.lc-card`
                   über die Farbstufe (index.css, §G-j). */
                <Link key={e.key} to={`/rechtsprechung/${encodeURIComponent(e.key)}`}
                  className="group flex h-full w-[clamp(12rem,72vw,18rem)] shrink-0 snap-start flex-col gap-1 lc-card p-3.5 bg-surface no-underline">
                  {/* J4 · Rechtsgebiet-Badge statt der «Bundesgericht»-Fusszeile.
                      Es ist das DETERMINISTISCH im Korpus erfasste `sachgebiet`
                      (dasselbe Feld, das Liste, Karte und Sachgebiets-Rail
                      benutzen — §5, eine Quelle). Bewusst NICHT aus einem
                      Abteilungskürzel abgeleitet: das Manifest führt gar kein
                      `abteilung`-Feld, eine zweite Herleitung wäre also eine
                      erfundene Achse neben der bestehenden (Befund 8.8.2026).
                      Die frühere Fusszeile «Bundesgericht» entfällt ersatzlos —
                      sie wiederholte nur den Titel des Streifens. */}
                  <span className="flex items-center gap-2">
                    <span className="lc-overline shrink-0 text-brass-700">{gebiet}</span>
                    {e.leitcharakter === 'leitentscheid' && <span className="lc-badge lc-badge-ok shrink-0">Leitentscheid</span>}
                  </span>
                  <span className="font-sans font-medium text-ink-900 text-body-s leading-snug group-hover:text-brass-800 transition-colors">{e.zitierung}</span>
                  {/* Beschreibung: amtliche Kurz-Regeste, sonst die im Entscheid
                      angewandten Kernnormen aus dem Korpus (§8: belegte Angabe,
                      kein generiertes Résumé). Fehlt beides, bleibt die Zeile weg. */}
                  {e.regesteKurz
                    ? <span className="text-body-s text-ink-500 leading-snug line-clamp-2">{e.regesteKurz}</span>
                    : normen.length > 0 && (
                      <span className="text-body-s text-ink-500 leading-snug line-clamp-2">
                        Angewandt: {normen.join(' · ')}
                      </span>
                    )}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>
      </div>
      <KorpusStand />
    </section>
  );
}
