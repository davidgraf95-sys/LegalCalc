import { Fragment, useState } from 'react';
import { SUCH_META } from '../suchHighlight';
import { badgesFuer, type ArtikelFundstelle, type Ausschnitt, type LeserTreffer, type SuchBereich } from '../leserSuche';
import { SuchBereichWahl } from './SuchBereichWahl';

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
   *  ausschliesst (Fundament-Auflage 2) — der Aufrufer MUSS sich äussern. */
  bestimmungsWort: 'Artikel' | 'Paragraphen';
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

/**
 * Ä23 · Zählform des Bestimmungsworts. «Artikel» ist im Deutschen formgleich,
 * «Paragraphen» nicht — «1 Paragraphen» wäre ein Grammatikfehler an einer
 * Kernauskunft. Rein und an dieser Stelle, weil nur die Liste zählt (§3).
 */
function zahlwort(n: number, wort: 'Artikel' | 'Paragraphen'): string {
  return n === 1 && wort === 'Paragraphen' ? 'Paragraph' : wort;
}

/** Ein Kontext-Schnipsel mit markiertem Begriff — aus den QUELL-Strings.
 *  Nimmt den `Ausschnitt` selbst, nicht die Fundstelle drumherum: Ä17 zeigt
 *  denselben Baustein auch für den Artikel-Ausschnitt (`LeserTreffer.ausschnitt`),
 *  der zu keiner einzelnen `ArtikelFundstelle` gehört. */
function Schnipsel({ a }: { a: Ausschnitt }) {
  return (
    // `[overflow-wrap:anywhere]`: echter Fliesstext-Auszug, kein kontrolliertes
    // Label — ein unbrechbares Lauftext-Fragment sprengte sonst den Scroller.
    <span className="lc-such-ausschnitt min-w-0 flex-1 text-micro leading-snug text-ink-600 [overflow-wrap:anywhere]">
      {a.vor}<mark>{a.treffer}</mark>{a.nach}
    </span>
  );
}

export function LeserTrefferListe({
  treffer, begriff, fundstellen, bestimmungsWort, fussnotenAus, position, aktivStelle,
  bereich, setzeBereich, fundstellenFuer, onZurueck, onVor, onSprung, onSprungStelle,
}: LeserTrefferListeProps) {
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
        <SuchBereichWahl wert={bereich} setzeWert={setzeBereich} />
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
          <p className="min-h-5 min-w-0 flex-1 leading-snug">
            <span className="num">{treffer.length}</span> {zahlwort(treffer.length, bestimmungsWort)}
            <span aria-hidden className="mx-1 text-ink-300">·</span>
            <span className="num">{fundstellen}</span>
            {fundstellen === 1 ? ' Fundstelle' : ' Fundstellen'}
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

      {treffer.length === 0 && (
        // §8: ehrliche Leerzeile statt eines leeren Kastens — und sie nennt den
        // Bereich mit, weil sonst «nichts gefunden» die halbe Wahrheit ist.
        <p className="px-1 py-2 text-body-s text-ink-500">
          {/* Ä23 · zweite Stelle, an der «Artikel» hart stand. */}
          {bestimmungsWort === 'Paragraphen' ? 'Kein Paragraph' : 'Kein Artikel'} gefunden für «{begriff}»
          {bereich !== 'alles' && <> im gewählten Suchbereich</>}.
        </p>
      )}

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
                  <span className="flex items-baseline gap-2">
                    <span className="num shrink-0 text-body-s font-semibold text-ink-800">{t.label}</span>
                    {t.randtitel && (
                      <span className="min-w-0 flex-1 truncate font-serif text-xs text-ink-600" title={t.randtitel}>{t.randtitel}</span>
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
                      <Schnipsel a={t.ausschnitt} />
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
