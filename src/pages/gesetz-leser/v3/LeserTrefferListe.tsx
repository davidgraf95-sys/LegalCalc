import { Fragment, useState } from 'react';
import { SUCH_META } from '../suchHighlight';
import { badgesFuer, type ArtikelFundstelle, type Ausschnitt, type LeserTreffer, type SuchBereich } from '../leserSuche';
import { SuchBereichWahl } from './SuchBereichWahl';
import { useAnfangSlot } from './anfangSlot';
import { zaehlform, type BestimmungsWort } from './erlassAnsicht';

// ═══ Trefferliste V3 — Verzeichnis in Erlass-Reihenfolge (H2, Kap. 4b Pos. 5) ═
//
// NACHFOLGER von `parts/TrefferListe.tsx`. Der Unterschied ist nicht das
// Aussehen, sondern was die Liste IST:
//
//  V1: eine nach Relevanz gereihte Kandidatenliste. Ein Artikel = eine Zeile mit
//      EINEM Ausschnitt, egal wie oft er trifft. Die ↑↓-Navigation lief über
//      Fundstellen, die in der Liste gar nicht sichtbar waren — der Leser sah
//      «7/34» und hatte keine Möglichkeit zu wissen, was 8 sein würde.
//  V3: ein VERZEICHNIS in Erlass-Reihenfolge (S4). Jeder Artikel ist ein Kopf,
//      darunter steht JEDE seiner Fundstellen mit eigenem Kontext-Schnipsel, und
//      die laufende Stelle der ↑↓-Navigation ist genau die hervorgehobene Zeile.
//      Die Navigation ist damit nicht mehr blind: man sieht, wo man ist und was
//      als Nächstes kommt.
//
// SIE RECHNET NICHTS (§3). Reihenfolge, Zahlen, Ausschnitte und Badges kommen
// fertig aus `leserSuche.ts` (rein, unit-getestet); die Fundstellen eines
// Artikels holt sie über `fundstellenFuer` und auch das nur für aufgeklappte
// Artikel. Der Zähler bleibt DATENSEITIG (§4.4 Ziff. 1) — er zählt den Erlass,
// nicht den gemalten DOM.
//
// `data-such-meta` an der Wurzel (SUCH_META): diese Liste ist BEDIENUNG, kein
// Gesetzestext. Der Highlight-Walker überspringt solche Teilbäume vollständig,
// sonst zählte ein Begriff seine eigenen Ausschnitte mit (Bug-Check 4.8.2026).

/** Wie viele ARTIKEL-Köpfe auf einmal gemalt werden (Erbe B10, Herleitung dort). */
export const TREFFER_DECKEL = 200;

/**
 * Wie viele Fundstellen-Zeilen ein aufgeklappter Artikel höchstens zeigt.
 *
 * Der Deckel je Artikel ist nötig, weil einzelne Artikel im Korpus dreistellige
 * Fundstellenzahlen tragen (OR Art. 1 auf «der»). Er ist BEWUSST klein: wer in
 * EINEM Artikel 40 Stellen hat, sucht dort nicht mehr über die Liste, sondern
 * liest. Der Kopf nennt weiter die volle Zahl, und die ↑↓-Navigation läuft
 * unverändert über alle — es verschwindet keine Information (§8).
 */
export const STELLEN_DECKEL = 40;

export interface LeserTrefferListeProps {
  treffer: LeserTreffer[];
  begriff: string;
  fundstellen: number;
  /** Ä23 (H2b) · Zähl-Substantiv aus dem Datenmodell: kantonale Erlasse zählen
   *  «Paragraphen», nicht «Artikel». Es stand hier an ZWEI Stellen als Literal —
   *  gemessen 17.8.2026 an ZH-211.11: «9 Artikel · 15 Fundstellen» in einem
   *  Erlass, der durchweg «§» führt. Kein Vorgabewert: ein stiller Rückfall auf
   *  «Artikel» wäre genau der Bund-Standard, den die Erlass-Neutralität
   *  ausschliesst (Fundament-Auflage 2) — der Aufrufer MUSS sich äussern.
   *  B8 (H2b-Nachzug): Typ und Zählform kommen aus `./erlassAnsicht`, nicht mehr
   *  als Literal-Union je Datei. */
  bestimmungsWort: BestimmungsWort;
  fussnotenAus: boolean;
  /** 0-basierte laufende Fundstelle der ↑↓-Navigation; -1 = noch keine. */
  position: number;
  /** Artikel + Rang der laufenden Fundstelle — hebt GENAU EINE Zeile hervor. */
  aktivStelle: { token: string; rang: number } | null;
  bereich: SuchBereich;
  setzeBereich: (b: SuchBereich) => void;
  /** Fundstellen EINES Artikels, auf Abruf (nur für aufgeklappte Artikel). */
  fundstellenFuer: (token: string) => ArtikelFundstelle[];
  onZurueck: () => void;
  onVor: () => void;
  /** Klick auf den Artikelkopf: zur ersten Fundstelle dieses Artikels. */
  onSprung: (token: string) => void;
  /** Klick auf eine Fundstellen-Zeile: zu genau dieser Stelle. */
  onSprungStelle: (token: string, rang: number) => void;
}

/** Ein Kontext-Schnipsel mit markiertem Begriff — aus den QUELL-Strings.
 *  Nimmt den `Ausschnitt` selbst, nicht die Fundstelle drumherum: Ä17 zeigt
 *  denselben Baustein auch für den Artikel-Ausschnitt (`LeserTreffer.ausschnitt`),
 *  der zu keiner einzelnen `ArtikelFundstelle` gehört. */
function Schnipsel({ a, einzeilig = false }: { a: Ausschnitt; einzeilig?: boolean }) {
  return (
    // `[overflow-wrap:anywhere]`: echter Fliesstext-Auszug, kein kontrolliertes
    // Label — ein unbrechbares Lauftext-Fragment sprengte sonst den Scroller.
    //
    // ── Ä96 (H4-Nachzug 18.8.2026) · DER SCHNIPSEL DARF GEKÜRZT WERDEN ────────
    // `einzeilig` gilt am ARTIKELKOPF (Herleitung dort). In der aufgeklappten
    // Fundstellen-Liste NICHT: dort ist der Schnipsel die einzige Auskunft der
    // Zeile — was hier wegfiele, wäre nicht Kontext, sondern der Inhalt.
    <span className={`lc-such-ausschnitt min-w-0 flex-1 text-micro leading-snug text-ink-600 [overflow-wrap:anywhere] ${
      einzeilig ? 'line-clamp-1' : ''}`}>
      {a.vor}<mark>{a.treffer}</mark>{a.nach}
    </span>
  );
}

export function LeserTrefferListe({
  treffer, begriff, fundstellen, bestimmungsWort, fussnotenAus, position, aktivStelle,
  bereich, setzeBereich, fundstellenFuer, onZurueck, onVor, onSprung, onSprungStelle,
}: LeserTrefferListeProps) {
  // Ä94: «↑ Anfang», wenn die Leiste ihn abgegeben hat — `null`, wo sie ihn
  // selbst zeigt (Spalte) oder wo gar keine Leiste steht (Blatt am Feld).
  // Herleitung, warum ein Slot und kein Prop: `./anfangSlot`.
  const onAnfang = useAnfangSlot();
  const hatSprung = fundstellen > 0;
  const anzeige = position < 0 ? '–' : String(position + 1);

  // Deckel und Handauf-Zustand hängen am BEGRIFF (Gültigkeits-Schlüssel): eine
  // neue Anfrage fängt wieder bei 200 an und klappt alles zu, sonst bliebe eine
  // einmal geöffnete Riesenliste für den Rest der Sitzung stehen. Der Schlüssel
  // wird beim RENDER geprüft statt in einem Effekt zurückgesetzt — kein
  // Kaskaden-Render (react-hooks/set-state-in-effect), dasselbe Muster wie in V1.
  const [gemerkt, setGemerkt] = useState<{ begriff: string; n: number; auf: string[] }>(
    { begriff, n: TREFFER_DECKEL, auf: [] });
  const gueltig = gemerkt.begriff === begriff;
  const deckel = gueltig ? gemerkt.n : TREFFER_DECKEL;
  const handAuf = gueltig ? gemerkt.auf : [];

  const sichtbar = treffer.slice(0, deckel);
  const rest = treffer.length - sichtbar.length;
  const zeilen = sichtbar.map((t, i) => ({
    t, kopf: t.gruppe !== null && t.gruppe !== (sichtbar[i - 1]?.gruppe ?? null) ? t.gruppe : null,
  }));

  const klappe = (token: string) => setGemerkt((g) => {
    const basis = g.begriff === begriff ? g : { begriff, n: TREFFER_DECKEL, auf: [] };
    return {
      ...basis, begriff,
      auf: basis.auf.includes(token) ? basis.auf.filter((x) => x !== token) : [...basis.auf, token],
    };
  });

  return (
    <div {...{ [SUCH_META]: '' }} data-treffer-liste className="pb-2">
      {/* B6-Erbe: klebt UNTER Zone A. `--toc-deckel` setzt die Leiste selbst;
          der Rückfall 0px hält den Vorzustand, falls die Marke einmal fehlt.
          §15.2 CLS 0: feste Zeilenhöhen, ab dem ersten Render vorhanden — der
          Zähler ist datenseitig und steht sofort, es wächst nichts nach. */}
      <div data-treffer-leiste
        style={{ top: 'var(--toc-deckel, 0px)' }}
        className="sticky z-10 space-y-1 bg-paper pb-1 pt-0.5 text-body-s text-ink-500">
        {/* ── Ä94 (H4-Nachzug 18.8.2026) · DER STUMMEL NIMMT DEN KNOPF AUF ─────
            Gemessen im Handy-Sheet (390, StPO/«Entschädigung»): das Segment stand
            mit 288 px in einem 358-px-Kasten — 70 px Stummel rechts —, und genau
            darüber klebte eine eigene 34-px-Zeile, die ausser «↑ Anfang» (62 px)
            nichts trug. Zwei Fehler, eine Bewegung: die Leiste gibt den Knopf ab
            (`./anfangSlot`), er füllt den Stummel, und die halbleere Zeile
            entfällt. Das Segment behält seine Breite (288 = 18 rem, seine
            Kalibrierung), verliert aber die Lücke.
            NICHT in die Zähler-Zeile darunter: die trägt schon Zähler, Stand
            «–/88» und die beiden 44-px-Sprungknöpfe und misst damit @390
            rechnerisch 361 px in 358 — ein fünftes Element hätte den Zähler
            umbrechen lassen, also die Kernauskunft verschlechtert, um eine
            Kernauskunft zu retten (Ä15). */}
        <div className="flex items-center gap-2">
          <SuchBereichWahl wert={bereich} setzeWert={setzeBereich} />
          {onAnfang && (
            <button type="button" data-v3-anfang onClick={onAnfang}
              title="Zum Anfang des Erlasses"
              className="lc-leiste-griff ml-auto shrink-0 gap-1 px-1.5 text-micro">
              <span aria-hidden>↑</span><span>Anfang</span>
            </button>
          )}
        </div>
        <div className="flex items-start gap-1">
          {/* ── Ä15 (H2b) · KEINE ELLIPSE AN EINER KERNAUSKUNFT ────────────────
              Gemessen 17.8.2026 in der 280-px-Leiste: «49 Artikel · 110
              Fundstellen» braucht 176 px in einer 148 px breiten Zelle — das
              `truncate` schnitt genau die Zahl weg, um die es geht. §8 verbietet
              das: eine Kernauskunft wird umgebrochen oder gekürzt, nie
              angeschnitten.
              GEWÄHLT: Umbruch, nicht Abkürzung. «9 Art. · 15 Stellen» spart drei
              Zeichen und kostet die Ehrlichkeit der Zahl («Stellen» ist keine
              amtliche Einheit); die zweite Zeile kostet 16 px in einer Zone, die
              nur während einer Suche existiert. `min-h-5` bleibt als
              Ein-Zeilen-Reservierung — der Umbruch tritt erst ein, wenn die Zahl
              ihn braucht, und dann durch eine Nutzer-Eingabe (§15.2). */}
          {/* ── Ä30 (H2b-Nachzug) · DER UMBRUCH SITZT AM TRENNER ──────────────
              Ä15 erlaubte den Umbruch statt der Ellipse — aber ohne zu sagen, WO.
              Gemessen 17.8.2026 an BS-154.125 («Gericht»): der Browser brach
              irgendwo, «15 Paragraphen · 62 Fundstellen» stand zweizeilig mit
              «Paragraphen» allein in Zeile 2, an langen Wörtern auch dreizeilig
              («285 / Paragraphen · 2203 / Fundstellen»). Eine Zahl von ihrer
              Einheit zu trennen ist an einer Kernauskunft dasselbe Übel wie die
              Ellipse (§8).
              JETZT: jedes Segment «Zahl + Einheit» ist ein eigener,
              nicht-umbrechbarer Block (`whitespace-nowrap`), und es gibt GENAU
              EINE Bruchstelle — die hinter dem Trenner «·».
              Zwei Punkte, die dabei gemessen werden mussten:
              (1) Der Trenner klebt am ERSTEN Segment, nicht zwischen den beiden.
              Stünde er frei, könnte er als einzelnes Zeichen an den Anfang der
              zweiten Zeile rutschen — genau das hängende Zeichen, das Ä5 aus der
              Übersichtszeile entfernt hat.
              (2) Die Leerzeichen um den Trenner sind ECHTE Textknoten (`{' '}`),
              nicht `mx-1`. Ohne sie hat die Zeile GAR KEINE Bruchstelle: JSX
              verschluckt Zeilenumbrüche zwischen Elementen, der Absatz kann
              nicht umbrechen, und dann ellipsiert er wieder — gemessen 17.8.2026
              an der StPO/«Kosten» mit `mx-1`: 176 px in 148 px, Höhe 20 px, also
              EINE Zeile mit Überlauf. Der Ä30-Fix hätte damit Ä15 gebrochen. */}
          <p className="min-h-5 min-w-0 flex-1 leading-snug">
            <span className="whitespace-nowrap">
              <span className="num">{treffer.length}</span> {zaehlform(treffer.length, bestimmungsWort)}
              {' '}<span aria-hidden className="text-ink-300">·</span>
            </span>
            {' '}
            <span className="whitespace-nowrap"><span className="num">{fundstellen}</span>{fundstellen === 1 ? ' Fundstelle' : ' Fundstellen'}</span>
          </p>
          {hatSprung && (
            <>
              <span data-treffer-position role="status" aria-live="polite"
                className="shrink-0 text-micro tabular-nums text-ink-500">
                <span className="num">{anzeige}</span>/<span className="num">{fundstellen}</span>
              </span>
              {/* A9-DoD: 44×44-px-Tap-Ziele, echte <button>, aria-label. */}
              <button type="button" onClick={onZurueck} data-treffer-zurueck
                aria-label="Vorherige Fundstelle" title="Vorherige Fundstelle (↑)"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700">
                <span aria-hidden className="text-base leading-none">↑</span>
              </button>
              <button type="button" onClick={onVor} data-treffer-vor
                aria-label="Nächste Fundstelle" title="Nächste Fundstelle (↓)"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700">
                <span aria-hidden className="text-base leading-none">↓</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* §8: ehrliche Leerzeile statt eines leeren Kastens — und sie nennt den
          Bereich mit, weil sonst «nichts gefunden» die halbe Wahrheit ist.
          ── P1-4 (Bug-Check 18.8.2026) · DIE ABSAGE WIRD ANGESAGT ──────────────
          `leser-r1-r2` hat den Verlust beim H4-Flip ausdrücklich als offenen
          Befund gemeldet: die V1-Absage war eine Live-Region und wurde
          vorgelesen, diese hier nicht. Für einen blinden Leser war die Absage
          damit genauso stumm wie eine leere Liste.
          `status`, nicht `alert`: eine Auskunft, keine Störung — `alert`
          unterbräche beim Tippen jede laufende Ansage. IMMER GEMOUNTET, damit die
          Region schon dasteht, bevor sich ihr Inhalt ändert (eine erst mit dem
          Text entstehende Region überliest ein Teil der Screenreader);
          `empty:hidden` hält sie ohne Inhalt aus dem Fluss — kein Leerraum, kein
          CLS. Gleiche Fassung in `../parts/TrefferListe.tsx` (§5). */}
      <p data-treffer-leer role="status" className="px-1 py-2 text-body-s text-ink-500 empty:hidden">
        {treffer.length === 0 && (
          <>
            {/* Ä23 · zweite Stelle, an der «Artikel» hart stand. B8: die Einzahl
                kommt aus derselben `zaehlform` wie oben — hier stand sonst eine
                dritte Schreibweise derselben Regel. */}
            Kein {zaehlform(1, bestimmungsWort)} gefunden für «{begriff}»
            {bereich !== 'alles' && <> im gewählten Suchbereich</>}.
          </>
        )}
      </p>

      <ul className="space-y-0.5">
        {zeilen.map(({ t, kopf }) => {
          const badges = badgesFuer(t, fussnotenAus);
          // Aufgeklappt ist ein Artikel, wenn die laufende Fundstelle in ihm
          // liegt ODER der Leser ihn selbst geöffnet hat. Der erste Teil ist der
          // wichtige: wer ↑↓ drückt, soll die Stelle SEHEN, zu der er springt —
          // ohne ihn wäre die Hervorhebung in einem zugeklappten Ast unsichtbar.
          const aktiv = aktivStelle?.token === t.token;
          const offen = aktiv || handAuf.includes(t.token);
          const stellen = offen ? fundstellenFuer(t.token).slice(0, STELLEN_DECKEL) : [];
          return (
            <Fragment key={t.token}>
              {kopf !== null && (
                // Seit S4 (Dokument-Reihenfolge) erscheint jedes Kapitel GENAU
                // EINMAL — der Zwischenkopf ist damit das, wonach er aussieht.
                // `lc-overline` trägt die kalibrierte ink-600-Basis; ein
                // Dimm-Override wäre bei 11 px ein AA-Fail (check:design-tokens).
                <li aria-hidden className="lc-overline px-1 pb-0.5 pt-3">
                  <span className="line-clamp-1" title={kopf}>{kopf}</span>
                </li>
              )}
              <li data-treffer-artikel={t.token} data-fundstellen-zahl={t.fundstellen}>
                <button type="button" onClick={() => { onSprung(t.token); klappe(t.token); }}
                  data-treffer-aktiv={aktiv ? '1' : undefined}
                  aria-current={aktiv ? 'location' : undefined}
                  aria-expanded={offen}
                  className={`w-full rounded px-1.5 py-1.5 text-left transition-colors ${aktiv ? 'bg-paper-sunken/70' : 'hover:bg-paper-sunken/60'}`}>
                  {/* ── Ä10/Ä26 (H2b-Nachzug) · DAS ETIKETT SPRENGT DIE LEISTE NICHT
                      Gemessen 17.8.2026 (LugÜ, Suche «Gericht»): `shrink-0` am
                      Etikett war für «Art. 47» richtig und für Anhänge falsch —
                      «Protokoll 1 über bestimmte Zuständigkeits-, Verfahrens- und
                      Vollstreckungsfragen» ist 80 Zeichen lang und trug den
                      Scroller auf `scrollWidth` **699 px in `clientWidth` 280 px**
                      (Blatt @390 ebenso: 699/366). Der Fundstellen-Zähler rechts
                      lag damit hunderte Pixel ausserhalb des Sichtfelds — die
                      Leiste hatte einen horizontalen Scroller, den sie ausdrücklich
                      nicht haben darf (`overflow-x-hidden`, S9-Zusage).
                      JETZT: das Etikett darf schrumpfen (`min-w-0 truncate`, voller
                      Wortlaut im `title` und im Erlass selbst), der ZÄHLER behält
                      `shrink-0` und bleibt sichtbar — er ist die Auskunft, die die
                      Zeile hier gibt. Der Randtitel gibt weiterhin zuerst nach:
                      er hat `flex-1`, das Etikett nicht. */}
                  {/* ── Ä96 (H4-Nachzug 18.8.2026) · DER RANDTITEL IST KEIN BEIWERK
                      Gemessen 18.8.2026 (StPO/«Kosten», D 1440, Spalte 280 px,
                      erste acht Trefferzeilen): DREI von acht Randtiteln liefen
                      in die Ellipse — «Entschädigung der amtlichen Verteidigung»
                      244 px in 178, «Entschädigung und Kostentragung» 198 in 178,
                      «Unberechtigte Zeugnisverweigerung» 206 in 178 —, während
                      der Kontext-Schnipsel darunter über zwei bis drei Zeilen
                      lief (30–45 px, nur einer der acht einzeilig).
                      Die Zeile gab also die Höhe dem Beiwerk und schnitt die
                      Kernauskunft: der Randtitel ist die amtliche Sachüberschrift
                      der Bestimmung — er sagt, WORUM es geht, und ist damit
                      dieselbe Klasse Auskunft wie der Zähler in Ä15, den §8
                      ausdrücklich umbrechen statt anschneiden lässt. Der
                      Schnipsel dagegen IST ein Ausschnitt; ihn zu kürzen ist sein
                      Wesen, nicht sein Verlust — und wer mehr will, klappt den
                      Artikel auf und bekommt jede Fundstelle voll.
                      JETZT: Randtitel bis zwei Zeilen ohne Ellipse
                      (`line-clamp-2` fängt nur den pathologischen Fall),
                      Schnipsel einzeilig. Rechnerisch am Fall Art. 135: Titel
                      17 → 34 px, Schnipsel 45 → 15 px, Zeile netto 13 px KÜRZER
                      bei vollständigem Titel. `title` bleibt als Ergänzung, nie
                      als Ersatz (S3 «KEIN title-ERSATZ»). */}
                  <span className="flex items-baseline gap-2">
                    <span className="num min-w-0 truncate text-body-s font-semibold text-ink-800" title={t.label}>{t.label}</span>
                    {t.randtitel && (
                      <span data-treffer-randtitel className="line-clamp-2 min-w-0 flex-1 font-serif text-xs text-ink-600" title={t.randtitel}>{t.randtitel}</span>
                    )}
                    <span className="ml-auto shrink-0 text-micro tabular-nums text-ink-500">{t.fundstellen}</span>
                  </span>
                  {/* ── Ä17 (H2b) · DER SCHNIPSEL IST ZURÜCK ────────────────────
                      Gemessen 17.8.2026: im Ruhezustand zeigte die Liste NULL
                      Kontext-Ausschnitte («Art. 47 · Kosten · 4»), V1 zeigte je
                      Zeile einen. Damit war die Liste ein Verzeichnis von
                      Nummern: man musste jeden Artikel aufklappen, um zu sehen,
                      ob er die gesuchte Stelle trägt — 49 Klicks für eine
                      Sichtprüfung, die vorher ein Blick war.
                      Gezeigt wird der Ausschnitt, den `LeserTreffer` OHNEHIN
                      trägt (`ausschnitt`, erste bzw. stärkste Fundstelle,
                      leserSuche.ts) — kein zusätzlicher Lauf, keine zweite
                      Quelle, kein Preis (§15): `fundstellenFuer` bleibt dem
                      aufgeklappten Artikel vorbehalten.
                      NUR im zugeklappten Zustand: aufgeklappt steht dieselbe
                      Stelle als Zeile mit Rang 1 darunter, und zweimal derselbe
                      Ausschnitt wäre eine Dopplung (§5). */}
                  {!offen && t.ausschnitt && (
                    <span data-treffer-schnipsel className="mt-0.5 flex">
                      <Schnipsel a={t.ausschnitt} einzeilig />
                    </span>
                  )}
                  {badges.length > 0 && (
                    // Herkunfts-Badge: SICHTBARER Text, nie nur `title` — der
                    // Leser sieht, warum der Artikel trifft, auch wenn im
                    // Wortlaut nichts leuchtet (§8).
                    <span className="mt-1 flex flex-wrap gap-1">
                      {badges.map((b) => (
                        <span key={b} data-treffer-badge
                          className="rounded border border-line px-1 text-micro leading-4 text-ink-500">{b}</span>
                      ))}
                    </span>
                  )}
                </button>
                {offen && stellen.length > 0 && (
                  // Die Fundstellen als eigene Sprungziele. Einrückung + Linie
                  // statt eines Kastens: die Liste soll ruhig bleiben (Kap. 2),
                  // und eine Kante genügt, um Zugehörigkeit zu zeigen.
                  <ul data-treffer-stellen className="ml-2 border-l border-line pl-2">
                    {stellen.map((f) => {
                      const stelleAktiv = aktiv && aktivStelle?.rang === f.rang;
                      return (
                        <li key={f.rang}>
                          <button type="button" onClick={() => onSprungStelle(t.token, f.rang)}
                            data-treffer-stelle={f.rang}
                            data-treffer-stelle-aktiv={stelleAktiv ? '1' : undefined}
                            aria-current={stelleAktiv ? 'location' : undefined}
                            className={`flex w-full items-baseline gap-1.5 rounded px-1.5 py-1 text-left transition-colors ${
                              stelleAktiv ? 'bg-brass-100/60' : 'hover:bg-paper-sunken/60'}`}>
                            <span aria-hidden className="shrink-0 text-micro tabular-nums text-ink-400">{f.rang + 1}</span>
                            <Schnipsel a={f.ausschnitt} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            </Fragment>
          );
        })}
      </ul>

      {rest > 0 && (
        // §8: die Zahl steht dran — der Leser weiss, dass da noch etwas ist und
        // wie viel. 44-px-Tap-Ziel wie die Navigationsknöpfe (A9-DoD).
        <button type="button" data-treffer-mehr
          onClick={() => setGemerkt((g) => ({
            begriff, n: (g.begriff === begriff ? g.n : TREFFER_DECKEL) + TREFFER_DECKEL,
            auf: g.begriff === begriff ? g.auf : [],
          }))}
          className="mt-2 flex min-h-11 w-full items-center justify-center rounded-md px-2 text-body-s text-ink-600 transition-colors hover:bg-paper-sunken/60 hover:text-brass-700">
          {rest} weitere anzeigen
        </button>
      )}
    </div>
  );
}
