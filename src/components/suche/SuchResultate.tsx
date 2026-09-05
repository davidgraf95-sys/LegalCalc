import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SuchGruppe, SuchTreffer } from '../../lib/universalSuche';
import { hervorhebungsStellen } from '../../lib/suche/hervorhebung';
import type { Abdeckung } from './useUniversalSuche';
import { suchOptionId } from './suchOptionId';
import { MEHR_TREFFER_ID } from './trefferAuswahl';
import { StatusBadge } from '../verzahnung/StatusBadge';
import { TrefferZeile, TREFFER_ZEILE_RAHMEN } from '../ui/TrefferZeile';
import { Leerzustand } from '../ui/Leerzustand';

// ─── Trefferpanel der Universal-Suche (geteilt: Header-Dropdown + Hero, §5) ──
//
// Reine Darstellung (§3): rendert die vom Aggregator gelieferten Gruppen als
// gruppierte Trefferliste. Identisch in Header und Startseiten-Hero, damit beide
// EINEN Suchweg zeigen. `onAuswahl` schliesst das Dropdown nach einem Klick.
//
// Tastatur/ARIA (Bug-Check §13/F4): Wird `listboxId` gesetzt, rendert das Panel
// als ARIA-Listbox (role=listbox + role=option je Treffer, stabile Options-IDs,
// aria-selected für den hervorgehobenen Treffer). Das steuernde Eingabefeld
// (Hero/Header) hält aria-activedescendant auf der aktiven Options-ID. Ohne
// `listboxId` bleibt das Markup wie zuvor (Header-Dropdown ohne Pfeil-Nav).
// Die knappe Trefferzahl wird über EINE sr-only Live-Region angesagt — nicht
// mehr das ganze Panel, das sonst bei jedem Tastendruck neu vorgelesen würde.

function Marke({ text, ton, redundant }: NonNullable<SuchTreffer['marke']>) {
  // Leitentscheid über das geteilte StatusBadge-Vokabular (W2·7-VZUI): EIN
  // aria-label an allen vier Fundorten (Suche, Panel, Leitfall-Zeile, Reader).
  // Nicht interaktiv — die Zeile ist eine ARIA-Option (kein nested-interactive).
  if (ton === 'leitentscheid') return <StatusBadge praedikat="leitentscheid" className="shrink-0" />;
  const cls = ton === 'ok' ? 'lc-badge-ok' : ton === 'entwurf' ? 'lc-badge-entwurf' : 'lc-badge-soft';
  // Redundanter Typ-Chip (dupliziert den Gruppentitel «Gesetzestext»/«Material»/…):
  // auf Mobil ausgeblendet, wo der Platz knapp ist (S3/#56). Desktop bleibt.
  const mobil = redundant ? 'max-sm:hidden ' : '';
  return <span className={`${mobil}lc-badge ${cls} shrink-0`}>{text}</span>;
}

// C-4 (31.8.2026): die Zeilen-ANATOMIE liegt in `ui/TrefferZeile` — dieselbe wie
// in den Katalog-Registern. Hier bleibt nur der BEHÄLTER: der Streifen des
// Panels (dichtere Polsterung, Hover-Fläche). Der Gruppen-Name kommt aus
// `TREFFER_ZEILE_RAHMEN` (vorher `group/z`), damit der Titel-Hover greift.
const ZEILE_CLS = `${TREFFER_ZEILE_RAHMEN} px-4 py-2 no-underline transition-colors hover:bg-brass-100/40`;

// Query-Wörter im Snippet/Untertitel deterministisch hervorheben (S3/#56).
// WELCHE Stellen das sind, entscheidet die Suche selbst: `hervorhebungsStellen`
// verwendet ihre Tokenisierung, ihre Normalisierung und ihre Wortgrenzen-Regel
// (§5). Bis 5.9.2026 baute diese Funktion ein eigenes Alternativ-Muster aus den
// Query-Wörtern OHNE Wortanfangs-Anker — sie markierte «or» mitten in
// «S·or·gfalt» und «miete» in «Ver·miete·r», obwohl der Index mit
// `tokenize: 'forward'` (Präfix ab Wortanfang) nie so getroffen hat (LM-187,
// Prod-Reproduktion 5.9.2026). Hier bleibt nur die DARSTELLUNG (§3): Text an den
// gelieferten Spannen schneiden, die Trefferstücke in <mark> fassen.
function markiere(text: string, q: string): ReactNode {
  const stellen = hervorhebungsStellen(text, q);
  if (stellen.length === 0) return text;
  // Hervorhebung über Gewicht + dunklere Tinte statt Farbfläche: eine brass-
  // Hintergrund-Tönung drückte den ink-500-Snippet-Text unter AA (axe: 4.23:1
  // auf brass-100) — Gewicht/ink-700 ist in BEIDEN Themes kontrastsicher, weil
  // der Hintergrund die Panel-Fläche bleibt (§13/F2).
  const teile: ReactNode[] = [];
  let pos = 0;
  stellen.forEach((s, i) => {
    if (s.start > pos) teile.push(text.slice(pos, s.start));
    teile.push(
      <mark key={i} className="bg-transparent font-semibold text-ink-700">{text.slice(s.start, s.ende)}</mark>,
    );
    pos = s.ende;
  });
  if (pos < text.length) teile.push(text.slice(pos));
  return teile;
}

function ZeileInhalt({ t, sprung, q }: { t: SuchTreffer; sprung?: boolean; q: string }) {
  return (
    // `streifen`: S6 — mobil zweizeilig statt einzeilig abgeschnitten (die Labels
    // tragen das unterscheidende Merkmal vorn: Kürzel «OR ·», Zitierung «BGE 148
    // III 57», Behörde+Nummer «ESTV 12 ·»; auf 390 px fiel der Titel sonst ganz
    // weg). Ab sm bleibt die einzeilige Kappung — die Streifen-Höhe des Panels
    // ist ein CLS-Versprechen (§15.2); darum trägt der Baustein diesen Fall als
    // deklarierte Ausnahme, nicht der Katalog seine Kappung.
    // Norm-Sprung (A5): ↵ signalisiert die Primäraktion «Enter springt».
    <TrefferZeile
      streifen
      titel={t.label}
      /* Zweizeiliges Snippet mit Highlight (S3/#56) statt einzeiligem Abschnitt. */
      untertitel={t.untertitel ? markiere(t.untertitel, q) : undefined}
      marke={t.marke && <Marke {...t.marke} />}
      pfeil={sprung ? '↵' : '→'}
    />
  );
}

function Zeile({ t, onAuswahl, onNavigate, optionId, aktiv, alsOption, sprung, q }: {
  t: SuchTreffer;
  onAuswahl?: () => void;
  onNavigate?: (href: string) => void;
  optionId?: string;
  aktiv?: boolean;
  alsOption?: boolean;
  sprung?: boolean;
  q: string;
}) {
  // Listbox-Option: KEIN inneres <a> (ein fokussierbarer Link in role=option ist
  // nested-interactive, axe serious — Entscheid David 26.6.2026). Maus/Touch
  // navigieren über onNavigate; die Tastatur läuft über die Combobox (Enter im
  // Feld öffnet den aktiven Treffer, aria-activedescendant zeigt ihn an).
  if (alsOption) {
    return (
      <li role="option" id={optionId} aria-selected={!!aktiv}
        onClick={() => { onAuswahl?.(); onNavigate?.(t.href); }}
        className={`${ZEILE_CLS} cursor-pointer${aktiv ? ' bg-brass-100/40' : ''}`}>
        <ZeileInhalt t={t} sprung={sprung} q={q} />
      </li>
    );
  }
  return (
    <li>
      <Link to={t.href} onClick={onAuswahl} className={ZEILE_CLS}>
        <ZeileInhalt t={t} sprung={sprung} q={q} />
      </Link>
    </li>
  );
}

function Gruppe({ g, index, onAuswahl, onNavigate, listboxId, aktivId, q, sektionsRollen }: {
  g: SuchGruppe;
  index: number;
  onAuswahl?: () => void;
  onNavigate?: (href: string) => void;
  listboxId?: string;
  aktivId?: string;
  q: string;
  sektionsRollen?: boolean;
}) {
  // Gruppen-Landmarke: im Listbox-Modus zwingend (role=group in der Listbox); auf
  // der /suche-Seite (S5) optional per `sektionsRollen`, damit Screenreader die
  // Inhaltstyp-Abschnitte ansteuern können — ohne den Options-Modus.
  const alsGruppe = !!listboxId || !!sektionsRollen;
  return (
    <div role={alsGruppe ? 'group' : undefined} aria-label={alsGruppe ? g.titel : undefined}
      className="lc-reveal border-t border-line first:border-t-0" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="flex items-baseline gap-2 px-4 pt-3 pb-1">
        <span className="lc-overline">{g.titel}</span>
        {/* Zähler je Gruppe (A6) — ausser beim einzeiligen Norm-Sprung («1» wäre Lärm). */}
        {!g.laedt && g.id !== 'sprung' && <span className="num text-xs text-ink-500">{g.gesamt}</span>}
        {/* Listbox-Modus: KEIN <a> im Gruppenkopf — ein Link ist als Listbox-Kind
            ein axe-critical aria-required-children-Verstoss. Der «alle N»-Sprung
            wird dort als echte role=option am Gruppenende gerendert (unten). */}
        {g.mehrHref && !listboxId && (
          <Link to={g.mehrHref} onClick={onAuswahl} className="ml-auto text-body-s text-brass-700 no-underline hover:text-brass-600">
            alle {g.gesamt} →
          </Link>
        )}
      </div>
      {/* Einmalige, dezente §8-Offenlegung (z. B. «Suchbegriffe verlassen den Browser»). */}
      {g.hinweis && <p className="px-4 pb-1 text-body-s text-ink-500">{g.hinweis}</p>}
      {/* Externer Amtslink (BGE «nicht im Bestand» → search.bger.ch). Echter
          `<a target>` (kein Listbox-Option — External-Navigation), rel gesichert. */}
      {g.externLink && (
        <a href={g.externLink.href} target="_blank" rel="noopener noreferrer"
          className="mx-4 mb-2 mt-1 inline-flex items-center gap-1.5 text-body-s text-brass-700 no-underline hover:text-brass-600">
          {g.externLink.label} <span aria-hidden>↗</span>
        </a>
      )}
      {g.laedt
        // Mindesthöhen-Platzhalter (§15.2): reserviert eine Trefferzeile, damit
        // die Gruppen darunter beim Einwachsen weniger springen (min-h-11-Token).
        ? <p className="px-4 pb-3 text-body-s text-ink-500 min-h-11">wird durchsucht …</p>
        : <ul role={listboxId ? 'none' : undefined} className="pb-1.5">
            {g.treffer.map((t) => {
              const oid = listboxId ? suchOptionId(listboxId, g.id, t.id) : undefined;
              return <Zeile key={`${g.id}:${t.id}`} t={t} onAuswahl={onAuswahl} onNavigate={onNavigate}
                optionId={oid} aktiv={!!oid && oid === aktivId} alsOption={!!listboxId} sprung={g.id === 'sprung'} q={q} />;
            })}
            {/* «alle N Treffer»-Sprung als ARIA-Option (statt Kopf-Link, s. oben);
                in flacheTreffer() enthalten → per Pfeiltasten + Enter erreichbar. */}
            {listboxId && g.mehrHref && (() => {
              const oid = suchOptionId(listboxId, g.id, MEHR_TREFFER_ID);
              return (
                <li role="option" id={oid} aria-selected={oid === aktivId}
                  onClick={() => { onAuswahl?.(); onNavigate?.(g.mehrHref!); }}
                  className={`${ZEILE_CLS} cursor-pointer${oid === aktivId ? ' bg-brass-100/40' : ''}`}>
                  {/* C-4: derselbe Pfeil wie an jeder Treffer-Zeile (statisch
                      brass-700) — der Hover läuft über die Streifen-Fläche. */}
                  <span className="min-w-0 flex-1 text-body-s font-medium text-brass-700">alle {g.gesamt} Treffer anzeigen</span>
                  <span aria-hidden className="shrink-0 leading-none text-brass-700">→</span>
                </li>
              );
            })()}
          </ul>}
    </div>
  );
}

export function SuchResultate({ gruppen, allesGeladen, q, onAuswahl, onNavigate, listboxId, aktivId, vorschlag, abdeckung, onVorschlag, sektionsRollen, onLeeren }: {
  gruppen: SuchGruppe[];
  allesGeladen: boolean;
  q: string;
  onAuswahl?: () => void;
  /** Maus/Touch-Navigation im Listbox-Modus (Optionen sind keine <a> mehr). */
  onNavigate?: (href: string) => void;
  /** Setzt das Panel in den ARIA-Listbox-Modus (Pfeil-Nav vom steuernden Feld). */
  listboxId?: string;
  /** Options-ID des aktuell hervorgehobenen Treffers (aria-activedescendant). */
  aktivId?: string;
  /** «Meinten Sie …?»-Vorschlag (S3) — oder null/undefined. */
  vorschlag?: string | null;
  /** §8-Korpus-Offenlegung für die Fusszeile (S3/E1) — oder null. */
  abdeckung?: Abdeckung | null;
  /** Übernimmt einen Vorschlag als neue Query (setzt das Feld). */
  onVorschlag?: (begriff: string) => void;
  /** /suche-Seite (S5): jede Gruppe als role=group-Landmarke (ohne Listbox). */
  sektionsRollen?: boolean;
  /** Setzt die Suche zurück (Weiterweg aus dem Null-Treffer-Leerzustand, B2). */
  onLeeren?: () => void;
}) {
  if (q === '') return null;

  // §8-ehrlicher Zähler (S3/#5): solange Sektionen laden, ist die Zahl nicht final
  // → «N+ … wird noch durchsucht»; erst wenn alles geladen ist, die feste Zahl.
  const nochLaedt = !allesGeladen || gruppen.some((g) => g.laedt);
  // `unvollstaendig` (W2·5, gestaffelter Artikel-Index) ist NICHT dasselbe wie
  // `laedt`: Treffer sind bereits da und brauchbar, die Menge wächst nur noch.
  // Darum behält die Kopfzeile ihre Aufschlüsselung — der Überblick soll sofort
  // ablesbar sein — und trägt den Vorbehalt als Zusatz. Die Alternative («mindestens
  // N …») hätte die Aufschlüsselung bis zum Ende des Nachladens verschluckt und
  // damit weniger Auskunft gegeben, nicht mehr. Welche Ebene fehlt, sagt der
  // Hinweis AN der betroffenen Gruppe (universalSuche: EBENEN_FEHLT) — hier
  // bewusst ebenen-neutral formuliert, damit die Ebene nicht doppelt kodiert ist.
  const waechstNoch = gruppen.some((g) => g.unvollstaendig);
  const gesamt = gruppen.reduce((n, g) => n + (g.laedt ? 0 : g.gesamt), 0);
  // Ergebnis-Kopfzeile «n Treffer, davon x Erlasse / y Artikel» (IA-1, praxis #10):
  // die Aufschlüsselung nennt nur die tatsächlich getroffenen Inhaltsklassen
  // (Gesetze/Gesetzestext), damit ein Überblick sofort ablesbar ist — kein
  // «0 …»-Lärm (§8), Singular/Plural sauber.
  const zahl = (id: string) => gruppen.find((g) => g.id === id && !g.laedt)?.gesamt ?? 0;
  const erlasse = zahl('gesetz');
  const artikel = zahl('artikel');
  const teile: string[] = [];
  if (erlasse > 0) teile.push(`${erlasse} ${erlasse === 1 ? 'Erlass' : 'Erlasse'}`);
  if (artikel > 0) teile.push(`${artikel} Artikel`);
  const kopf = `${gesamt} Treffer${teile.length ? `, davon ${teile.join(' / ')}` : ''}`
    + (waechstNoch ? ' — wird noch ergänzt' : '');
  const status = gruppen.length === 0
    ? (allesGeladen ? 'Keine Treffer' : 'wird durchsucht …')
    : nochLaedt ? `mindestens ${gesamt} Treffer, wird noch durchsucht …` : kopf;

  return (
    <>
      {/* Knappe Live-Region: die Trefferzahl (mit Aufschlüsselung), nicht die ganze
          Liste (§13/F4). */}
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
      {/* Sichtbare Ergebnis-Kopfzeile (IA-1): der Text erscheint erst, wenn alles
          geladen ist (der Leerfall steht ehrlich in der Karte selbst). aria-hidden,
          weil die Live-Region oben denselben Text bereits ansagt.
          §15.2/CLS-Fix (Shard-1-Last, 20.7.2026): Der SLOT wird bereits reserviert,
          sobald Gruppen da sind — solange geladen wird, hält ihn `invisible` auf
          voller Zeilenhöhe (Layout bleibt, kein sichtbarer Text). Erschien die
          Kopfzeile erst mit `!nochLaedt`, mountete sie unter Runner-Last SPÄT
          (ausserhalb des 500-ms-hadRecentInput-Fensters) ÜBER der bereits gemalten
          Trefferkarte und schob diese um eine Zeilenhöhe nach unten — der dominante
          A9-Shift (Δ≈0.125, `div#…lc-card` y+19). Mit reserviertem Slot bewegt sich
          die Karte beim Fertig-Werden nicht mehr. `invisible` ist eine echte
          Utility (keine Magic-Number, §13); der Slot bleibt aria-hidden. */}
      {gruppen.length > 0 && (
        <p aria-hidden className={`mb-2 px-1 text-body-s font-medium text-ink-600${nochLaedt ? ' invisible' : ''}`}>{nochLaedt ? ' ' : (kopf || ' ')}</p>
      )}
      {/* «Meinten Sie …?» (S3) — deterministischer Tippfehler-Vorschlag, ausserhalb
          der Listbox (kein Options-Element), setzt bei Klick die Query. */}
      {vorschlag && (
        <p className="lc-card mb-2 px-4 py-2 text-body-s text-ink-600">
          Meinten Sie{' '}
          <button type="button" onClick={() => onVorschlag?.(vorschlag)}
            className="font-medium text-brass-700 underline decoration-dotted underline-offset-2 hover:text-brass-600">
            {vorschlag}
          </button>
          ?
        </p>
      )}
      <div className="lc-card overflow-hidden"
        role={listboxId ? 'listbox' : undefined} id={listboxId}
        aria-label={listboxId ? 'Suchtreffer' : undefined}>
        {gruppen.length === 0
          ? (allesGeladen
              // B2 (W2·19-DESIGN-KONSISTENZ R6-B): der kanonische Leerzustand
              // (ui/Leerzustand, §5/§10) statt einer eigenen Kopie — mit
              // Rücksetz-Knopf wie die übrigen Null-Treffer-Fälle (Materialien,
              // Gesetze, RechnerUebersicht, Rechtsprechung, Katalog).
              ? <div className="px-4 py-4">
                  <Leerzustand art="filter"
                    text={`Keine Treffer zu «${q}». Versuchen Sie einen Erlass, eine Norm oder ein Stichwort.`}
                    weiterweg={{ text: 'Suche zurücksetzen', onKlick: () => onLeeren?.() }} />
                </div>
              : <p className="px-4 py-4 text-body-s text-ink-500">wird durchsucht …</p>)
          : gruppen.map((g, i) => <Gruppe key={g.id} g={g} index={i} onAuswahl={onAuswahl} onNavigate={onNavigate} listboxId={listboxId} aktivId={aktivId} q={q} sektionsRollen={sektionsRollen} />)}
      </div>
      {/* §8-Korpus-Offenlegung (S3/E1): was die Suche wirklich durchsucht, ausserhalb
          der Listbox. Link auf die Abdeckungsseite «Was ist drin». Erscheint — wie
          zuvor — sobald die Manifeste (gesetze+entscheide) da sind, NICHT erst wenn
          alles fertig geladen ist: das hielte die §8-Offenlegung auf dem langsamen
          Runner unnötig lange zurück (Fragilität genau dort, wo wir härten). Ihr
          kleiner, spät durch das Karten-Wachstum ausgelöster Rest-Shift bleibt weit
          unter Budget; den dominanten A9-Shift trägt die Kopfzeilen-Reservierung
          oben (§15.2). */}
      {abdeckung && (
        // 11px-Feinschrift in ink-600, nicht ink-500 (Auftrag David 25.6.2026,
        // Muster lc-fineprint): auf brass-getönten Flächen (Hero) fällt ink-500
        // bei 11px unter AA (axe 4.23:1) — ink-600 trägt AA in beiden Themes.
        // T2 (Design-Qualitäts-Pass 29.8.2026): Abdeckungs-Zeile auf der
        // 11-px-Stufe, gemessen @1440 auf `/suche` 630 px = 129 ch/Zeile
        // (WCAG 2.2 SC 1.4.8: 80). `max-w-kleintext` ist die Feinschrift-
        // Lesespalte (Herleitung am Token in `tailwind.config.js`). Die GRÖSSE
        // bleibt hier `micro`: anders als die Hinweise im Leser trägt diese
        // Zeile keinen Fliesstext, sondern eine Zahlen-Bilanz dicht unter dem
        // Trefferzähler.
        <p className="mt-2 px-1 max-w-kleintext text-micro leading-snug text-ink-600">
          {/* «Erlasse (Bund + International)», nicht «Bund-Erlasse» (Cowork-Befund
              32, 18.8.2026): die Zahl zählt alle Volltext-Snapshots der Ebene
              `bund` — darunter die Staatsverträge/EU-Erlasse, die unter dieser
              Ebene geführt werden. Die /gesetze-Kachel «Bundesrecht» zählt den
              Katalog OHNE International (201 vs. 227): zwei Mengen, die ohne
              Benennung wie ein Widerspruch lasen (§8). */}
          {/* K3-Scharfschaltung (1.9.2026): der statische Index trägt keine
              kantonalen Artikel mehr — kantonaler Volltext kommt aus der
              Online-Suche und fehlt ohne Verbindung. «Nur nach Titel» allein
              wäre jetzt zu wenig gesagt (die Online-Suche findet sehr wohl im
              Wortlaut) und «durchsucht» zu viel (offline findet sie nichts);
              die Zeile nennt darum beides (§8). */}
          Durchsucht: {abdeckung.volltext} Erlasse im Volltext (Bund + International) · {abdeckung.bge} BGE ·
          {' '}kantonale Erlasse ({abdeckung.kantonTitel}): nach Titel — im Volltext nur online.{' '}
          <Link to="/abdeckung" onClick={onAuswahl} className="text-brass-700 no-underline hover:text-brass-600">Was ist drin? →</Link>
        </p>
      )}
    </>
  );
}
