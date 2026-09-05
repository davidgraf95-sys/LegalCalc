import { Link } from 'react-router-dom';
import { KANTONE, KANTON_NAMEN } from '../../data/tarif/typen';
import { INTERNATIONAL_SAEULE } from '../../lib/navigation';
import { erfassungsgrad, STUFE_WORT } from '../../lib/normtext/erfassungsgrad';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { GesetzeChips } from './GesetzeChips';

// ─── Gesetze — Bund und Kantone (Startseite V4, Modul #8, NEU) ──────────────
//
// Der SCHWERPUNKT der Startseite (Auftrag David 5.9.2026: «taschenmesser für
// juristen aber schwerpunkt verzahnte gesetze und alle staatlichen infos an
// einem ort»). Bis V3 lag «Gesetze» als eine von fünf gleichrangigen Kacheln in
// der Landkarte; hier bekommt es eine eigene Sektion mit drei Direktzugriffen —
// Bund · Kantone · International — und dem einen Satz, der die Verzahnung
// erklärt. Reine Darstellung (§3).
//
// ZÄHLER kommen ausschliesslich aus der buildseitig generierten Mini-Datei
// (startseiteZaehler.generated.ts, Drift-Tor `check:zaehler`) — KEIN
// Register-Import in den Startseiten-Chunk (§15, `check:perf-budget`).
//
// ZIEL-URLs sind aus dem Bestand abgeleitet, nicht erfunden: der Kantons-Filter
// heisst `?ebene=kanton&kt=<KT>` (so baut ihn navigation.ts::GESETZE_KINDER und
// erlassAnsicht.ts), International hat mit IA-6 Stufe 2 die kanonische Säulen-
// Konstante `INTERNATIONAL_SAEULE`.

const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

// IA-7-Optik der Seitenleiste: Kürzel + erfasste Erlass-Zahl SICHTBAR, das
// Zustands-Wort (§8 «erfasst»/«Auswahl»/«dünn», nie «vollständig» ohne
// Enumerations-Beleg) im Accessible Name. Dieselbe Ableitung wie navigation.ts —
// erfassungsgrad.ts ist die eine Quelle, hier wird nur konsumiert (§5).
function KantonChip({ kt }: { kt: string }) {
  const n = z.kantonErlassZahlen[kt] ?? 0;
  const wort = STUFE_WORT[erfassungsgrad(kt, n).stufe];
  const mengen = n === 0 ? 'keine Erlasse' : `${n} ${n === 1 ? 'Erlass' : 'Erlasse'}`;
  return (
    <Link to={`/gesetze?ebene=kanton&kt=${kt}`}
      aria-label={`${KANTON_NAMEN[kt as keyof typeof KANTON_NAMEN]} — ${mengen} erfasst, ${wort}`}
      className="lc-chip gap-1.5 no-underline hover:text-brass-700 hover:border-brass-400">
      {kt}
      <span aria-hidden className="num text-ink-500">{n}</span>
    </Link>
  );
}

export function GesetzeBlock() {
  return (
    <div className="space-y-4">
      <div className="lc-card p-5 space-y-4">
        {/* (a) Bund — die Kern-Codes als Direktzugriff, dazu der Zähler-Link. */}
        <GesetzeChips />
        {/* (b) Kantone — 26 Chips als umbrechende Wolke (auf 390 px 3–4 Zeilen,
            kein Scroll-Streifen). */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span aria-hidden className="lc-overline mr-1">Kantone</span>
          {KANTONE.map((kt) => <KantonChip key={kt} kt={kt} />)}
          <Link to="/gesetze?ebene=kanton"
            className="lc-chip no-underline font-medium text-brass-700 hover:border-brass-400">
            {nf(z.gesetzeKantonVolltext)} Kantonserlasse im Volltext →
          </Link>
        </div>
        {/* (c) International — die kanonische Säule (nie der Alt-Alias). */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span aria-hidden className="lc-overline mr-1">International</span>
          <Link to={INTERNATIONAL_SAEULE}
            className="lc-chip no-underline font-medium text-brass-700 hover:border-brass-400">
            Staatsverträge und EU-Recht →
          </Link>
        </div>
      </div>
      {/* (d) Verzahnungs-Satz. §8: der Satz behauptet nur, was der Leser wirklich
          tut, und sagt die Grenze mit — Bezüge erscheinen dort, wo sie im Korpus
          erfasst sind (Artikel-Kontext: leitentscheideAmArtikel /
          materialienAmArtikel, artikelKontext.ts). Kein «immer», kein «alle». */}
      <p className="max-w-reading text-body-s leading-relaxed text-ink-700">
        Ein Artikel zeigt die Entscheide und Materialien, die ihn anwenden — ein Entscheid
        die Normen, auf denen er beruht; soweit die Bezüge im Korpus erfasst sind.
      </p>
    </div>
  );
}
