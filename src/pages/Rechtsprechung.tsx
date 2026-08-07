import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { usePaneKlasse } from '../components/layout/PaneKontext';
import { EntscheidKarte } from '../components/rechtsprechung/EntscheidKarte';
import { EntscheidZeile } from '../components/rechtsprechung/EntscheidZeile';
import { EntscheidFilter } from '../components/rechtsprechung/EntscheidFilter';
import { SachgebietKacheln } from '../components/rechtsprechung/SachgebietKacheln';
import { LiveSuche } from '../components/rechtsprechung/LiveSuche';
import {
  ladeEntscheidManifest, ladeRichterRegister, filterEntscheide, sortiere, gruppiereNachLeit,
  gruppiereNachInstanz, zaehleSachgebiete, normLabel,
  type EntscheidFilterWerte, type SortModus,
} from '../lib/rechtsprechung/browse';
import {
  achsenDiff, leseFilterAusUrl, lokaleWerte, wendeAchsenAn,
  leseDichte, schreibeDichte, leseSort, schreibeSort, leseKlappe, schreibeKlappe,
  leseDeckel, schreibeDeckel, zaehleAktiveFilter,
  type Dichte, type UrlAchse,
} from '../components/rechtsprechung/zustand';
import { zaehleBaender, istChronologisch, type BandGruppe } from '../components/rechtsprechung/baender';
import { FilterSheet } from '../components/rechtsprechung/FilterSheet';
import type { BrowseEntscheid, RichterRegister } from '../lib/rechtsprechung/register';
import type { Rechtsgebiet } from '../lib/normtext/register';
import { useSucheAusUrl } from '../components/suche/useSucheAusUrl';

// Übersicht der Rubrik «Rechtsprechung» — kuratierter Einstieg (Sachgebiets-Rail,
// Leitentscheide-first, Norm-Verzahnung), bessere Übersicht als eine flache
// Trefferliste. Reine Darstellung (§3): Laden/Sortieren/Filtern/Gruppieren liegen
// in lib/rechtsprechung/browse.ts.
//
// Wo welcher Zustand liegt — Inhalt (Treffermenge) in der URL, Darstellung
// (Liste/Karten, Sortierung, Klappe) in localStorage — steht mitsamt Begründung
// an EINER Stelle: components/rechtsprechung/zustand.ts. Diese Seite wendet die
// Weiche nur an; neue Filter kommen dort in die Tabelle URL_ACHSEN und sind
// damit automatisch teilbar und neuladefest.

// DOM-Deckel (BS-Tranche §7.1, axe-Timeout-Lektion): mit ~3'800 BS-Einträgen
// wüchse eine ungefilterte Sektion sonst auf Tausende DOM-Knoten. Es werden je
// Liste max. LISTE_DECKEL Einträge GERENDERT («Weitere anzeigen» lädt +Deckel);
// die Facetten-/Sektions-Zähler bleiben über den Gesamtbestand (R15) — reine
// Render-Begrenzung, keine Daten-/Zählerspaltung. Die Register-Liste ist kein
// Normtext (§15.1 unberührt); jeder Entscheid bleibt als Datei vollständig.
const LISTE_DECKEL = 100;

// Eine Treffer-Liste je Dichte rendern (geteilte Datenquelle, nur Darstellung).
//
// `speicherKey` identifiziert DIESE Liste innerhalb der Seite (jede Sektion hat
// ihren eigenen Deckel). `mitSprungleiste` schaltet die Band-/Jahr-Leiste zu —
// nur der EINE Strom bekommt sie, nicht die Sektions-Ansicht (dort ordnet
// bereits die Sektion, und dieselbe Jahreszahl käme je Sektion erneut vor).
function Liste({ liste, dichte, onNorm, speicherKey, mitSprungleiste }: {
  liste: BrowseEntscheid[]; dichte: Dichte; onNorm: (k: string) => void;
  speicherKey: string; mitSprungleiste?: boolean;
}) {
  // Deckel aus der Sitzung wiederherstellen — LAZY, also schon im ersten Render
  // (J1-Prüfpunkt: nach «zurück» muss das Dokument sofort wieder so hoch sein,
  // sonst greift die zentrale Scroll-Wiederherstellung in App.tsx ins Leere).
  const [max, setMax] = useState(() => leseDeckel(speicherKey, LISTE_DECKEL));
  // Bei neuer Datenbasis (Filterwechsel) auf den Deckel zurücksetzen — offizielles
  // «adjust state during render»-Muster (kein Effekt-Flackern, kein Ref im Render).
  // Beim MOUNT greift das nicht (gleiche Referenz) — der wiederhergestellte Wert
  // überlebt die Rückkehr also, ein Filterwechsel setzt ihn zurück.
  const [vorherListe, setVorherListe] = useState(liste);
  if (vorherListe !== liste) { setVorherListe(liste); setMax(LISTE_DECKEL); }
  const behalteMax = (neu: number) => { setMax(neu); schreibeDeckel(speicherKey, neu); };

  const behaelterRef = useRef<HTMLDivElement>(null);
  // Sprungziel als Index in `liste`; wird erst NACH dem Render aufgelöst, damit
  // der Eintrag garantiert im DOM steht (er kann jenseits des alten Deckels liegen).
  // Das Ziel selbst liegt in einer REF, nicht im State: es wird im Effekt
  // verbraucht, und ein setState dort löste eine Kaskaden-Renderung aus
  // (react-hooks/set-state-in-effect). Der Zähler ist die Auslöse-Flanke und
  // wird ausschliesslich im Klick-Handler gesetzt. Kein React Compiler (§15.4).
  const sprungRef = useRef<number | null>(null);
  const [sprungTick, setSprungTick] = useState(0);

  const sichtbar = liste.length > max ? liste.slice(0, max) : liste;
  const mehr = liste.length - sichtbar.length;

  // Gruppen über die GANZE Liste (nicht nur den sichtbaren Teil): die Leiste soll
  // auch auf Jahre zeigen, die noch nicht geladen sind — der Sprung lädt nach.
  const gruppen = useMemo(
    () => (mitSprungleiste ? zaehleBaender(liste) : []), [mitSprungleiste, liste]);
  const leisteZeigen = gruppen.length > 1 && istChronologisch(gruppen);

  // Nach dem Klick: erst genug Batches laden (Render), dann scrollen. Der Effekt
  // läuft nach dem Commit, `children[i]` existiert dann.
  useEffect(() => {
    const ziel = sprungRef.current;
    if (ziel === null) return;
    if (ziel >= max) return;                 // wartet auf den Render mit höherem Deckel
    sprungRef.current = null;                // Ref-Schreiben im Effekt, kein setState
    const el = behaelterRef.current?.children[ziel] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
  }, [sprungTick, max]);

  const springe = (g: BandGruppe) => {
    // Deckel so weit heben, dass das Ziel gerendert ist — auf die nächste volle
    // Batch-Grenze, damit auch der Kontext darunter mitkommt.
    sprungRef.current = g.ersterIndex;
    const noetig = Math.ceil((g.ersterIndex + 1) / LISTE_DECKEL) * LISTE_DECKEL;
    if (noetig > max) behalteMax(noetig);
    setSprungTick((t) => t + 1);
  };

  const sprungleiste = leisteZeigen && (
    // Juristen denken in Bänden: die Leiste führt direkt auf den Jahrgang, statt
    // ihn über wiederholtes «Weitere anzeigen» zu erscrollen (J1).
    <nav aria-label="Nach Jahrgang springen"
      className="lc-chip-zeile mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span aria-hidden className="lc-overline shrink-0">Jahrgang</span>
      {gruppen.map((g) => (
        <button key={g.jahr} type="button" onClick={() => springe(g)}
          aria-label={`Zu Jahrgang ${g.label} springen (${g.count})`}
          className="lc-chip hover:border-brass-400 hover:text-brass-700">
          {g.label}{' '}<span className="num ml-1.5 text-ink-600">{g.count}</span>
        </button>
      ))}
    </nav>
  );

  const mehrKnopf = mehr > 0 && (
    <button type="button" onClick={() => behalteMax(max + LISTE_DECKEL)}
      className="lc-chip mx-auto mt-3 block hover:border-brass-400 hover:text-brass-700">
      Weitere anzeigen (<span className="num">{mehr}</span> weitere)
    </button>
  );
  if (dichte === 'karten') {
    return (
      <div>
        {sprungleiste}
        <div ref={behaelterRef} className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {sichtbar.map((e) => <EntscheidKarte key={e.key} e={e} onNorm={onNorm} />)}
        </div>
        {mehrKnopf}
      </div>
    );
  }
  return (
    <div>
      {sprungleiste}
      <div ref={behaelterRef} className="lc-panel divide-y divide-line overflow-hidden">
        {sichtbar.map((e) => <EntscheidZeile key={e.key} e={e} onNorm={onNorm} />)}
      </div>
      {mehrKnopf}
    </div>
  );
}

function Sektion({ titel, liste, dichte, onNorm, speicherKey }: {
  titel: string; liste: BrowseEntscheid[]; dichte: Dichte; onNorm: (k: string) => void;
  speicherKey: string;
}) {
  if (!liste.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="lc-overline text-brass-700 flex items-center gap-3">
        {titel}<span className="num text-ink-500">{liste.length}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </h2>
      <Liste liste={liste} dichte={dichte} onNorm={onNorm} speicherKey={speicherKey} />
    </section>
  );
}

export function Rechtsprechung() {
  // Split-View B-1: im Pane reagiert das 2-Spalten-Layout auf die PANE-Breite
  // (@3xl/pane) statt auf den Viewport; ausserhalb byte-gleich (lg:).
  const pk = usePaneKlasse();
  const [alle, setAlle] = useState<BrowseEntscheid[] | null>(null);
  // Richter-Register (Slug → Name) — eigene, kleine Projektion neben dem Manifest.
  // Nur für Labels; Filtern/Zählen laufen über die Slugs im Manifest. Bleibt es
  // null, zeigt die Facette ehrlich den Slug statt eines geratenen Namens (§8).
  const [richterRegister, setRichterRegister] = useState<RichterRegister | null>(null);
  const [fehler, setFehler] = useState(false);
  const [params, setParams] = useSearchParams();
  // Der Suchbegriff steht seit UI-NAV S1 EBENFALLS in der Adresse (`?q=`), aber
  // über einen eigenen, ENTPRELLTEN Weg: ein Facetten-Klick ist ein Ereignis, ein
  // getippter Begriff sind zehn — jede Taste sofort in die URL zu schreiben wäre
  // ein anderes Problem als der Klick (s. zustand.ts). Darum bleibt `q` aus
  // URL_ACHSEN/`achsenDiff` heraus und läuft über useSucheAusUrl.
  const [suchQ, setSuchQ] = useSucheAusUrl({ spiegeln: true });
  // Der übrige lokale Rest (heute leer — alle anderen Filter liegen in der URL).
  const [rest, setRest] = useState<EntscheidFilterWerte>({});
  const [sort, setSortState] = useState<SortModus>(leseSort);
  const [dichte, setDichte] = useState<Dichte>(leseDichte);
  const [klappeOffen, setKlappeOffen] = useState<boolean>(leseKlappe);

  // Alle Inhalts-Achsen aus der Adresse — die Adresse ist die Wahrheit über das,
  // was gefiltert wird (LM-206: nach dem Neuladen dieselbe Treffermenge).
  const urlWerte = useMemo(() => leseFilterAusUrl(params), [params]);
  const sachgebiet = urlWerte.sachgebiet ?? null;
  const norm = urlWerte.norm ?? null;

  // Immer GEMEINSAM schreiben: zwei getrennte Schreibvorgänge im selben Handler
  // bauen beide auf demselben — im laufenden Render bereits veralteten — `params`
  // auf (Begründung und Fundstelle in zustand.ts/wendeAchsenAn).
  // Funktionale Form: baut auf dem AKTUELLEN Stand der Adresse auf. Seit S1
  // schreibt auch die entprellte `?q=`-Spiegelung — ein Facetten-Klick, der auf
  // dem beim Render eingefangenen `params` aufbaut, nähme sie sonst zurück.
  const setzeUrlAchsen = (achsen: Partial<Record<UrlAchse, string | null>>) => {
    setParams((vorher) => wendeAchsenAn(vorher, achsen), { replace: true });
  };
  const setzeUrl = (schluessel: UrlAchse, wert: string | null) => setzeUrlAchsen({ [schluessel]: wert });
  // Darstellungs-Zustände: State + localStorage im Gleichschritt (drei gleiche
  // Fälle, ein Muster).
  const setzeDichte = (d: Dichte) => { setDichte(d); schreibeDichte(d); };
  const setzeSort = (s: SortModus) => { setSortState(s); schreibeSort(s); };
  const setzeKlappe = (offen: boolean) => { setKlappeOffen(offen); schreibeKlappe(offen); };

  useEffect(() => {
    let lebt = true;
    ladeEntscheidManifest().then((m) => {
      if (!lebt) return;
      if (!m) { setFehler(true); return; }
      setAlle(m.entscheide);
    });
    // Parallel, nicht verkettet: das Register blockiert die Liste nie (§15.3).
    ladeRichterRegister().then((r) => { if (lebt) setRichterRegister(r); });
    return () => { lebt = false; };
  }, []);

  // URL-Achsen + lokaler Rest + Suchbegriff zusammenführen. `q` zuletzt: das
  // Feld ist die Wahrheit über den Begriff, die Adresse folgt ihm entprellt
  // (sonst überschriebe der nachhängende URL-Stand die eben getippten Zeichen).
  const werte: EntscheidFilterWerte = useMemo(
    () => ({ ...rest, ...urlWerte, q: suchQ }), [rest, urlWerte, suchQ]);

  // Rail-Zähler über den vollen Bestand minus Sachgebiet (sonst zeigt die nicht
  // gewählte Kachel «0»); restliche Filter (Suche/Norm/…) dürfen die Zähler aber
  // einschränken, darum ohne sachgebiet.
  const fuerRail = useMemo(
    () => (alle ? filterEntscheide(alle, { ...werte, sachgebiet: null }) : []),
    [alle, werte],
  );
  const railZaehler = useMemo(() => zaehleSachgebiete(fuerRail), [fuerRail]);
  // «Alle Sachgebiete» = Summe der Kacheln: Verweis-Einträge (vollständige Urteile zu
  // einem BGE) ausschliessen, symmetrisch zu zaehleSachgebiete/echtAnzahl — sonst zeigt
  // der Aggregat-Zähler einen Wert ≠ Summe seiner Teile (Doppelzählung der BGE).
  const railGesamt = useMemo(() => fuerRail.filter((e) => !e.verweis).length, [fuerRail]);

  const gefiltert = useMemo(
    () => (alle ? sortiere(filterEntscheide(alle, werte), sort) : []),
    [alle, werte, sort],
  );
  const leitAnzahl = useMemo(() => gefiltert.filter((e) => !e.verweis && e.leitcharakter === 'leitentscheid').length, [gefiltert]);
  // Verweis-Einträge (vollständige Urteile) zählen nicht als eigenständige Entscheide.
  const echtAnzahl = useMemo(() => gefiltert.filter((e) => !e.verweis).length, [gefiltert]);
  const volltextAnzahl = useMemo(() => gefiltert.filter((e) => !!e.verweis).length, [gefiltert]);

  // Zwei Sektionen (Leitentscheide / Weitere) nur im Default-Sort ohne aktive
  // Suche/Norm — sonst EIN sortierter Strom (Leit oben via Sortierung).
  const alsSektionen = sort === 'relevanz' && !werte.q?.trim() && !norm;
  const gruppen = useMemo(() => gruppiereNachLeit(gefiltert), [gefiltert]);

  const onFilter = (w: EntscheidFilterWerte) => {
    // Jeder Inhalts-Filter geht in die URL, der Rest bleibt lokal — die Aufteilung
    // steht in zustand.ts und nicht hier, damit sie beim nächsten Filter nicht
    // vergessen wird (genau so entstand die Asymmetrie aus LM-200/203/206).
    const achsen = achsenDiff(w, params);
    if (Object.keys(achsen).length > 0) setzeUrlAchsen(achsen);
    const { q: neuQ, ...uebrig } = lokaleWerte(w);
    setSuchQ(neuQ ?? '');
    setRest(uebrig);
  };
  const waehleSachgebiet = (g: Rechtsgebiet | null) => setzeUrl('rg', g);
  const waehleNorm = (k: string) => setzeUrl('norm', k);

  // Identität einer Liste für den Sitzungs-Deckel (J1): Filterzustand + Rolle der
  // Liste auf der Seite. Der Filterzustand MUSS mit hinein — sonst erbte eine
  // über einen geteilten Link frisch geöffnete, ganz andere Treffermenge den
  // Deckel der zuvor besuchten. Innerhalb derselben Adresse ist der Schlüssel
  // stabil, und genau das trägt den Rückweg Treffer → Detail → zurück.
  const deckelBasis = params.toString();
  const deckelKey = (rolle: string) => `${deckelBasis}|${rolle}`;

  return (
    <div className="space-y-6">
      <SeitenKopf
        overline="Bundesgericht & Kantone"
        titel="Rechtsprechung"
        intro="Entscheide des Bundesgerichts und kantonaler Gerichte, verzahnt mit der angewandten Norm."
      />

      {fehler && (
        <div className="lc-notice lc-notice-warn">
          Die Rechtsprechungs-Sammlung konnte nicht geladen werden. Bitte die Seite neu laden.
        </div>
      )}

      {!alle && !fehler && (
        <div className="space-y-3 py-12 text-center">
          <div className="scale-rule mx-auto max-w-[200px]" aria-hidden />
          <p className="text-body-s text-ink-500">Die Sammlung wird abgerufen …</p>
        </div>
      )}

      {alle && alle.length === 0 && (
        <div className="lc-notice">
          Es sind noch keine Entscheide erfasst. Die Sammlung wird laufend erweitert.
        </div>
      )}

      {alle && alle.length > 0 && (
        <div className={pk('lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6', '@3xl/pane:grid @3xl/pane:grid-cols-[14rem_minmax(0,1fr)] @3xl/pane:gap-6')}>
          {/* Links: Sachgebiets-Rail (Mobil oben als Chip-Band). */}
          <div className={pk('mb-4 lg:mb-0', 'mb-4 @3xl/pane:mb-0')}>
            <SachgebietKacheln
              zaehler={railZaehler}
              gesamt={railGesamt}
              aktiv={sachgebiet}
              onWaehle={waehleSachgebiet}
            />
          </div>

          {/* Rechts: Ergebnis-Spalte. */}
          <div className="min-w-0 space-y-4">
            {/* Discovery über den ganzen CH-Korpus (extern, opt-in) — prominent am
                Kopf der Ergebnis-Spalte (Auftrag David), über der kuratierten Auswahl. */}
            <LiveSuche initialQ={werte.q ?? ''} />

            {/* J2: mobil hinter einem «Filter (n)»-Auslöser im Bottom-Sheet,
                ab lg unverändert inline — damit die Treffer auf 390 px nicht
                erst unter der ganzen Steuerleiste beginnen. */}
            <FilterSheet anzahl={zaehleAktiveFilter(werte)}>
              <EntscheidFilter
                werte={werte}
                onChange={onFilter}
                bestand={alle}
                richterRegister={richterRegister}
                sort={sort}
                onSort={setzeSort}
                dichte={dichte}
                onDichte={setzeDichte}
                klappeOffen={klappeOffen}
                onKlappe={setzeKlappe}
              />
            </FilterSheet>

            {/* Norm-Kontextstreifen — der explizite Pfad «Rechtsprechung zu Art. X». */}
            {norm && (
              <div className="lc-notice flex items-center justify-between gap-3">
                <span className="text-body-s">
                  Rechtsprechung zu <span className="font-medium text-ink-900">{normLabel(norm)}</span>
                  {' '}— <span className="num">{gefiltert.length}</span> {gefiltert.length === 1 ? 'Entscheid' : 'Entscheide'}
                </span>
                <button type="button" onClick={() => setzeUrl('norm', null)}
                  className="shrink-0 text-xs font-medium text-brass-700 hover:text-brass-600">
                  aufheben
                </button>
              </div>
            )}

            {/* Treffer-Zähler. Die Bund↔Kanton-Trennung (früher ein eigenes Ebene-
                Segment, Auftrag David) liegt jetzt in der «Gemeinwesen»-Facetten-
                Leiste der Filterzeile — eine kohärente Achse statt zweier Controls. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-500">
              <span><span className="num text-ink-700">{echtAnzahl}</span> {echtAnzahl === 1 ? 'Entscheid' : 'Entscheide'}</span>
              {leitAnzahl > 0 && <span>· <span className="num">{leitAnzahl}</span> Leitentscheide</span>}
              {volltextAnzahl > 0 && <span>· <span className="num">{volltextAnzahl}</span> Volltext-Verweise</span>}
            </div>

            {gefiltert.length === 0 ? (
              <div className="lc-notice">Kein Entscheid gefunden. Filter anpassen oder zurücksetzen.</div>
            ) : alsSektionen ? (
              <div className="space-y-8">
                <Sektion titel="Amtliche Leitentscheide (BGE)" liste={gruppen.leitentscheide} dichte={dichte} onNorm={waehleNorm} speicherKey={deckelKey('leit')} />
                {gruppen.volltexte.length > 0 && (
                  <Sektion titel="Vollständige Urteile zu den Leitentscheiden" liste={gruppen.volltexte} dichte={dichte} onNorm={waehleNorm} speicherKey={deckelKey('volltexte')} />
                )}
                {/* A3-Regel 5: Urteile ausserhalb der amtlichen BGE-Sammlung als eigene
                    Voll-Urteil-Zeilen, GRUPPIERT UNTER IHRER INSTANZ (gerichtstyp). Die
                    «verweis»-Karte bleibt der BGE-Auszug→Volltext-Brücke vorbehalten (oben).
                    Wortlaut «nicht in der amtlichen Sammlung (BGE)» statt «nicht amtlich
                    publiziert» (§8-Fix 19.7.2026): kantonale Portal-Entscheide (BS) SIND
                    amtlich publiziert (Rechtsprechungs-Datenbank der Gerichte BS, Karten-
                    Label «amtlich») — falsch ist nur die Zugehörigkeit zur BGE-Sammlung. */}
                {gruppen.weitere.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="lc-overline flex items-center gap-3">
                      Weitere Entscheide — nicht in der amtlichen Sammlung (BGE)
                      <span className="num text-ink-500">{gruppen.weitere.length}</span>
                      <span aria-hidden className="h-px flex-1 bg-line" />
                    </h2>
                    {gruppiereNachInstanz(gruppen.weitere).map((g) => (
                      <Sektion key={g.typ} titel={g.label} liste={g.liste} dichte={dichte} onNorm={waehleNorm} speicherKey={deckelKey(`instanz:${g.typ}`)} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Liste liste={gefiltert} dichte={dichte} onNorm={waehleNorm} speicherKey={deckelKey('strom')} mitSprungleiste />
            )}

            {/* B2/R1 (QS-UI 8b Teil 2): Der §8-Fuss lief mit 728 px über die
                Lesespalte (41 rem ≙ 656 px, gemessen 1280×800). Gerade die
                Ehrlichkeits-Zeile soll gelesen werden. Trennlinie und Text laufen
                BEIDE in der Lesespalte (border-t sitzt am selben <p> — Bug-Check
                #441 B1: der frühere Kommentar behauptete «volle Spalte»). */}
            <p className="border-t border-line/60 pt-3 text-micro text-ink-500 max-w-reading">
              Keine Rechtsberatung. «ungeprüft» = maschinell erfasst, fachlich noch nicht abgenommen; massgeblich ist stets die amtliche Fassung (Link je Entscheid).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
