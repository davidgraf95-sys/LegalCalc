import { Link } from 'react-router-dom';
import type { BrowseMaterial } from '../../lib/materialien/typen';
import { StandChip } from '../ui/StandChip';

// ─── Material-Karte in der Übersicht /materialien ───────────────────────────
//
// Amtliche Ressource (Soft-Law) als Karte. Nüchtern/kanzleihaft (DESIGN-
// REGLEMENT §13): Doktyp+Nummer als Overline, Titel als Anker, Behörde+Stand als
// Meta. Reine Darstellung (§3). Die Karte führt auf die IN-APP-Detailseite
// (/materialien/:key) mit bibliografischen Metadaten + prominentem Live-Link —
// KEIN gespeicherter Dokumentinhalt (§7/§8), massgeblich bleibt die amtliche
// Quelle.

// Der Stand-Chip stand hier und in `normtext/ErlassKarte.tsx` zeichengleich als
// lokale Kopie (Design-Konsistenz, C-Begleitbefund «Stand-Chip-Dedupe»,
// 31.8.2026) — jetzt EIN Baustein: `ui/StandChip.tsx`.

export function MaterialKarte({ m }: { m: BrowseMaterial }) {
  const overline = m.nummer ? `${m.doktypLabel} · ${m.nummer}` : m.doktypLabel;
  return (
    <Link
      to={`/materialien/${encodeURIComponent(m.key)}`}
      className="lc-card group block p-4 no-underline"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="lc-overline">{overline}</span>
        {m.sprache !== 'de' && <span className="lc-badge lc-badge-soft uppercase">{m.sprache}</span>}
      </div>
      <p className="mt-1.5 text-body-s font-medium text-ink-900 leading-snug line-clamp-3">{m.titel}</p>
      {/* lc-chip-zeile (LM-044/N1): der Stand-Chip ist ein <span> ohne role und
          bleibt darum ausdrücklich FLACH — reine Angabe, keine Aktion, kein Link.
          Genau das war der Befund: «Stand 01.02.2022» war formal nicht von einem
          Normverweis «ZGB» zu unterscheiden. Die Opt-in-Klasse macht die
          Flachheit zur ERKLÄRTEN Aussage statt zum Zufall (§23). */}
      <div className="lc-chip-zeile mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        <span className="font-medium text-ink-700">{m.behoerdeKuerzel}</span>
        <StandChip stand={m.stand} />
      </div>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brass-700 opacity-0 transition-opacity group-hover:opacity-100">
        Details &amp; amtliche Fassung →
      </span>
    </Link>
  );
}
