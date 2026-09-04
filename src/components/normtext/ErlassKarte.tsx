import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { istLesbar, type BrowseErlass } from '../../lib/normtext/browse-typen';
import { useErlassOeffnen, istErlassOffen } from '../../lib/useErlassOeffnen';
import { werkzeugeFuerNorm } from '../../lib/normtext/werkzeuge';
import { erlassPfad } from '../../lib/normtext/erlassAdresse';
import { StandChip } from '../ui/StandChip';

// Klick-Handler für eine Erlass-Verlinkung (Punkt G): der <Link> trägt weiter den
// nackten Basispfad (SEO/Mittelklick/Cmd-Klick/Copy-Link). Nur der EINFACHE
// Linksklick wird abgefangen — und auch nur, wenn das Gesetz schon offen ist:
// dann öffnet der Hook eine neue Instanz (?r). Sonst läuft der normale
// Link-Navigate, der ohnehin den Basispfad öffnet.
function macheOeffnenHandler(
  e: BrowseErlass,
  basePath: string,
  oeffne: (ebene: string, key: string, kuerzel?: string) => void,
) {
  return (ev: MouseEvent) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (!istErlassOffen(basePath)) return;
    ev.preventDefault();
    oeffne(e.ebene, e.key, e.kuerzel);
  };
}

// Erlass-Karte in der Übersicht /gesetze. Nüchtern/kanzleihaft (DESIGN-REGLEMENT):
// Kürzel als Anker, Titel klein, Meta (SR · Artikelzahl), Stand als Chip. Reine
// Darstellung (§3). 'snapshot' UND 'pdf-embed' (amtliches PDF in-app) führen in
// die In-App-Lesesicht; 'nur-live-link' trägt ehrlich nur den amtlichen Link (§8).

// Der Stand-Chip lag hier und in `materialien/MaterialKarte.tsx` zeichengleich
// als lokale Kopie (Design-Konsistenz, C-Begleitbefund «Stand-Chip-Dedupe»,
// 31.8.2026). Jetzt EIN Baustein in `ui/StandChip.tsx` — er nutzt zugleich die
// eine Datums-Quelle `<Datum>` (B-3: Daten laufen in der Textstimme, nicht Mono).

function KarteInhalt({ e }: { e: BrowseErlass }) {
  // Norm↔Werkzeug-Brücke (ROADMAP Schritt 2, Task 4.3): dezenter Hinweis, dass
  // dieser Erlass passende Rechner/Vorlagen trägt (das Alleinstellungsmerkmal,
  // §8: nur verfügbare Werkzeuge gezählt). Die Karte verlinkt in den Reader, wo
  // das Kontext-Panel sie ausklappt — hier nur das Signal, kein zweiter Link.
  const werkzeugAnzahl = werkzeugeFuerNorm(e.key).length;
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-h3 font-semibold text-ink-900 leading-none">{e.kuerzel}</span>
        <span className="flex items-baseline gap-2 shrink-0">
          {/* §8: ganz aufgehobener Erlass bleibt auffindbar, ist aber sichtbar
              markiert (Design-Token danger, §13). */}
          {e.aufgehoben && <span className="lc-badge lc-badge-danger">Aufgehoben</span>}
          {e.sprache !== 'de' && (
            <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>
          )}
        </span>
      </div>
      {/* Entscheid David 29.8.2026 «4 grösser» (Design-Review T8): der Karten-
          TEXT steigt eine Stufe der bestehenden Skala, body-s → base (14→16 px).
          Kein neuer Wert — `base` ist die in tailwind.config.js dokumentierte
          16-px-Stufe, die auf /gesetze bisher übersprungen wurde (T8 mass hier
          einen 18→14-Sprung). Das Kürzel (h3, 20 px) bleibt der Anker; die
          Staffelung der Karte wird damit dicht statt gesprungen.
          Die Meta-Zeile darunter bleibt BEWUSST auf xs (12 px): sie ist ein
          Register aus Zahlen und Chips, kein Text. Mit 14 px gemessen (29.8.,
          1280 px, Relevanz-Sicht) wuchs die Karte 166→200 px und der Stand-Chip
          fiel bei StGB/SchKG auf eine eigene Zeile — die Zeile wurde unruhiger,
          nicht lesbarer. Mit dem Titel allein: 166→168 px, unverändert 6 Karten
          im Sichtfeld. */}
      <p className="mt-1.5 text-base text-ink-600 leading-snug line-clamp-2">{e.titel}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        {e.sr && <span>SR <span className="num">{e.sr}</span></span>}
        {/* EIN Meta-Schema für alle Karten (Fehlerbuch-Befund 47, auf Prod
            reproduziert 29.8.2026): «SR x.y · N Artikel · [Format] · Stand».
            Vorher standen MENGE und FORMAT im selben Slot, im selben Ton, als
            Zweig eines Entweder-oder — EMRK las sich als «SR 0.101 · amtliches
            PDF», CISG als «SR 0.221.211.1 · 101 Artikel». Wer die beiden
            International-Karten nebeneinander sah, konnte nicht erkennen, ob
            EMRK keine Artikel HAT oder ob dort etwas anderes ausgesagt wird.
            Jetzt sind es zwei getrennte Slots mit je eigener Stimme:

            · MENGE — nur wo wir sie wirklich haben. `artikelAnzahl` ist laut
              browse-typen.ts bei nicht-Snapshot-Erlassen 0; die Zahl hängt
              deshalb an `> 0`, nicht am Status. Das ist zugleich die Wache
              gegen ein «0 Artikel», das ein leeres Register behaupten würde,
              wo in Wahrheit gar kein Snapshot existiert (§8).
            · FORMAT — als Badge (`lc-badge-soft`, Token, §13/D2), also sichtbar
              eine ANDERE Art von Aussage als eine Zahl. Volltext-Snapshots
              tragen kein Tag: sie sind der Normalfall, und 1'300 Karten mit
              «Volltext» zu beschriften wäre Lärm, keine Auskunft. */}
        {e.artikelAnzahl > 0 && <span><span className="num">{e.artikelAnzahl}</span> Artikel</span>}
        {e.status === 'pdf-embed' && <span className="lc-badge lc-badge-soft">amtliches PDF</span>}
        {e.status === 'nur-live-link' && <span className="lc-badge lc-badge-soft">nur Live-Link</span>}
        <StandChip stand={e.stand} />
        {werkzeugAnzahl > 0 && (
          <span className="text-brass-700">
            <span className="num">{werkzeugAnzahl}</span> {werkzeugAnzahl === 1 ? 'passendes Werkzeug' : 'passende Werkzeuge'}
          </span>
        )}
      </div>
    </>
  );
}

// Kompakte Zeile für untergeordnetes Ausführungsrecht (Verordnungen/Reglemente):
// dezent, einzeilig — damit die Leitgesetze (Karten) prominent bleiben
// (Praktikabilität, Auftrag David). Gleiche Verlinkung wie die Karte.
//
// `variant='leitgesetz'` (J3-Nachzug, Auftrag David 21.8.2026): für Listen, in
// denen die Zeile selbst das Leitgesetz ist (Rechtsgebiets-Übersicht /gesetze)
// kehrt sich die Hierarchie um — der ausgeschriebene Titel ist die Hauptaussage
// (bestehende `text-body-s`, umbricht statt `truncate`/Abschneiden), Kürzel +
// SR-Nr. rücken als sekundäre Mono-Angabe dahinter. Default (`'kompakt'`,
// unverändert) bleibt für RechtsgebietSicht/geteilt.tsx, wo die Verordnung nur
// über ihr Leitgesetz identifiziert werden muss, nicht über den eigenen Titel.
export function ErlassZeile({ e, variant = 'kompakt' }: { e: BrowseErlass; variant?: 'kompakt' | 'leitgesetz' }) {
  const inhalt = variant === 'leitgesetz' ? (
    <>
      <span className="text-body-s text-ink-800 leading-snug break-words">{e.titel}</span>
      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 num text-micro text-ink-500">
        <span className="font-medium text-ink-600">{e.kuerzel}</span>
        {e.sr && <span>SR {e.sr}</span>}
        {/* §8: aufgehobener Erlass sichtbar markiert, bleibt aber verlinkt/lesbar. */}
        {e.aufgehoben && <span className="lc-badge lc-badge-danger">aufgehoben</span>}
        {e.status === 'nur-live-link' && <span aria-hidden className="text-brass-700">↗ Live-Link</span>}
      </span>
    </>
  ) : (
    <>
      <span className="font-medium text-ink-700 shrink-0">{e.kuerzel}</span>
      {/* §8: aufgehobener Erlass sichtbar markiert, bleibt aber verlinkt/lesbar. */}
      {e.aufgehoben && <span className="lc-badge lc-badge-danger shrink-0">aufgehoben</span>}
      <span className="text-ink-500 truncate">{e.titel}</span>
      {e.sr && <span className="num text-xs text-ink-500 shrink-0 ml-auto">SR {e.sr}</span>}
      {e.status === 'nur-live-link' && <span aria-hidden className="text-xs text-brass-700 shrink-0">↗</span>}
    </>
  );
  const cls = variant === 'leitgesetz'
    ? 'flex flex-col gap-0.5 text-body-s no-underline rounded px-2 py-1.5 hover:bg-brass-100/30 transition-colors min-w-0'
    : 'flex items-baseline gap-2 text-body-s no-underline rounded px-2 py-1 hover:bg-brass-100/30 transition-colors min-w-0';
  const oeffne = useErlassOeffnen();
  const basePath = erlassPfad(e);
  return istLesbar(e)
    ? <Link to={basePath} onClick={macheOeffnenHandler(e, basePath, oeffne)} className={cls}>{inhalt}</Link>
    : <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inhalt}</a>;
}

// Stand-Jahr (ISO «YYYY-…») — reine Anzeige. Sehr alte Stände (vor 1990) werden
// dezent markiert: ein sehr alter Stand ist für die Anwältin ein nützliches
// Signal, soll aber nicht so laut wie ein frischer wirken. Fixe Schwelle (kein
// Date.now(), §2 — reine Darstellung).
const standJahr = (stand: string): string | null =>
  stand.slice(0, 4).match(/^\d{4}$/)?.[0] ?? null;

// Kompakte, überlaufsichere Erlass-Zeile für die Kanton-Sichten (Systematik +
// Relevanz + Rechtsgebiet): SR-Nr fix links (tabellarisch), dann der Titel, dann
// die Meta (Artikelzahl · Stand-Jahr) rechts. Bewusst NICHT ErlassZeile —
// kantonale «kuerzel» sind oft der ganze (bis 276 Z.) Titel.
//
// A14 (David 5.7.2026): der lange amtliche Titel wird NICHT MEHR abgeschnitten
// (kein `truncate` → «aktuell viel abgeschnitten»). Drei-Spalten-Grid
// (SR · Titel · Meta) mit `items-baseline`: der Titel umbricht in der mittleren
// Spalte auf beliebig viele Zeilen (`break-words`, `minmax(0,1fr)` gegen
// Overflow), SR und Meta bleiben auf der ersten Grundlinie. So bleibt der ganze
// Titel lesbar — auch @390 — ohne H-Overflow.
export function SysZeile({ e }: { e: BrowseErlass }) {
  const jahr = standJahr(e.stand);
  const altDezent = jahr != null && Number(jahr) < 1990;
  const inhalt = (
    <>
      <span className="num text-xs text-ink-500 shrink-0 w-20 truncate">{e.sr}</span>
      <span className="text-ink-700 break-words group-hover/z:text-brass-700 min-w-0">{e.titel}</span>
      {istLesbar(e) ? (
        <span className="shrink-0 flex items-baseline gap-2 num text-xs">
          {e.artikelAnzahl > 0 && <span className="text-ink-500">{e.artikelAnzahl} Art.</span>}
          {/* Sehr alte Stände dezent (italic) statt blass — Kontrast (S10/WCAG) bleibt gewahrt. */}
          {jahr && <span className={`hidden sm:inline text-ink-500${altDezent ? ' italic' : ''}`}>{jahr}</span>}
        </span>
      ) : (
        <span aria-hidden className="text-xs text-brass-700 shrink-0">↗</span>
      )}
    </>
  );
  const cls = 'group/z grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-3 text-body-s no-underline rounded px-2 py-1 hover:bg-brass-100/30 transition-colors';
  const oeffne = useErlassOeffnen();
  const basePath = erlassPfad(e);
  return !istLesbar(e)
    ? <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inhalt}</a>
    : (
      <Link
        to={basePath}
        onClick={macheOeffnenHandler(e, basePath, oeffne)}
        className={cls}
      >{inhalt}</Link>
    );
}

export function ErlassKarte({ e }: { e: BrowseErlass }) {
  // Hook vor jeder Verzweigung (Rules of Hooks) — auch wenn der nur-live-link-
  // Pfad ihn nicht braucht.
  const oeffne = useErlassOeffnen();
  // nur-live-link: kein interner Reader (ehrlich, §8) → amtlicher Link extern.
  if (!istLesbar(e)) {
    return (
      <a
        href={e.quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lc-card block p-4 no-underline"
      >
        <KarteInhalt e={e} />
        <span className="mt-2 inline-flex text-xs text-brass-700">↗ amtliche Fassung</span>
      </a>
    );
  }
  const basePath = erlassPfad(e);
  return (
    <Link
      to={basePath}
      onClick={macheOeffnenHandler(e, basePath, oeffne)}
      className="lc-card group block p-4 no-underline"
    >
      <KarteInhalt e={e} />
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brass-700 opacity-0 transition-opacity group-hover:opacity-100">
        {e.status === 'pdf-embed' ? 'Amtliches PDF öffnen →' : 'Volltext lesen →'}
      </span>
    </Link>
  );
}
