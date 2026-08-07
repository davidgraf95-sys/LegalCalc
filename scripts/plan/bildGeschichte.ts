// scripts/plan/bildGeschichte.ts — die Seite «Geschichte & Bau-Statistik»
// (plan-bild-geschichte.html): Chronik-Zeitachse und Bau-Statistik.
//
// Eigenes Modul seit 7.8.2026 (§6.6-Split, Tor `check:schlankheit`) — nach dem
// Muster von `bildMethode.ts` (Split vom 5.8.2026), inklusive Fassade.
//
// ANLASS, mit Nullprobe belegt: `check:schlankheit` war auf unverändertem
// `main` (3a57cd29c) bereits ROT — `bildSeiten.ts` stand mit 823 Zeilen über
// der 800er-Schwelle und in keiner Baseline. Der QS-SELBSTOPT-Schritt hat das
// nicht verursacht, hätte es aber mit seiner Messreihen-Sektion auf 860 Zeilen
// vergrössert. §17 verlangt an dieser Stelle den Wurzel-Fix statt des
// Umschiffens: nicht `schlankheit:update` (das schriebe das Problem in die
// Baseline fort), sondern schneiden.
//
// WARUM DIESE SEITE. Von den verbliebenen drei Seiten ist sie die am
// klarsten abgegrenzte: sie liest ausschliesslich RÜCKWÄRTS (Chronik-Archiv,
// git-Historie, Zähler) und teilt mit dem Lagebild keine einzige Datenquelle
// und keinen Zustand. Der Schnitt trennt «was war» von «was ist und was
// kommt» — dieselbe Linie, an der `bildMethode.ts` bereits getrennt wurde.
//
// Verhaltensneutral (§6): reiner Move ohne eine geänderte Zeile im Rumpf;
// belegt durch byte-gleiche HTML-Ausgabe aller vier Seiten vor/nach dem Split.

import { readFileSync } from 'node:fs';
import { parseRoadmap } from './parse';
import { bauStatistik, chronikErledigt, chronikMeilensteine } from './bildDaten';
import { esc, fussnote, kacheln, monatLabel, rahmen, seitenKopf, type SeitenOpts } from './bildHtml';

// ===========================================================================
// 3. Geschichte & Bau-Statistik — plan-bild-geschichte.html
// ===========================================================================
export function geschichteSeite(o: SeitenOpts): string {
  const meilensteine = chronikMeilensteine();
  const stat = bauStatistik();
  const chronik = chronikErledigt();

  let zeitachse: string;
  if (!meilensteine) {
    zeitachse = '<p class="hinweis">⚠ <span class="id">ROADMAP-CHRONIK.md</span> nicht lesbar — die Zeitachse entfällt.</p>';
  } else {
    const ohneDatum = meilensteine.filter((m) => !m.monat);
    const nachMonat = new Map<string, string[]>();
    for (const m of meilensteine) {
      if (!m.monat) continue;
      if (!nachMonat.has(m.monat)) nachMonat.set(m.monat, []);
      nachMonat.get(m.monat)!.push(m.titel);
    }
    const monate = [...nachMonat.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    const bloecke = monate
      .map(([key, titel]) => {
        const liste = `<ul>${titel.map((t) => `<li>${esc(t)}</li>`).join('\n')}</ul>`;
        const inhalt = titel.length > 5
          ? `<details><summary>alle ${titel.length} Arbeitspakete anzeigen</summary>${liste}</details>`
          : liste;
        return `<div class="monat"><b>${esc(monatLabel(key))}</b> <span class="fortschritt">${titel.length} Arbeitspaket${titel.length === 1 ? '' : 'e'}</span>
  ${inhalt}
</div>`;
      })
      .join('\n');
    const summe = monate.reduce((a, [, t]) => a + t.length, 0);
    zeitachse = `<div class="zeitachse">${bloecke}
  <div class="monat"><b>ohne Datumsangabe</b> <span class="fortschritt">${ohneDatum.length}</span>
  ${ohneDatum.length ? `<ul>${ohneDatum.map((m) => `<li>${esc(m.titel)}</li>`).join('\n')}</ul>` : '<p class="sub">—</p>'}
  </div>
</div>
<p class="hinweis">Zählprobe: ${summe} datierte + ${ohneDatum.length} undatierte = ${summe + ohneDatum.length} Chronik-Einträge insgesamt.
<b>Datierung:</b> erste Datumsangabe im Chronik-Eintrag (Überschrift und die folgenden 15 Zeilen) — eine deklarierte
Heuristik, kein gepflegtes Datumsfeld. Einträge ohne jede Datumsangabe stehen deshalb getrennt und werden keinem Monat zugeschlagen.</p>`;
  }

  const anzahl = meilensteine?.length ?? chronik;
  const kopf = seitenKopf({
    stand: o.stand,
    watch: o.watch,
    marke: 'Geschichte',
    h1: 'Was bereits gebaut wurde',
    lede: anzahl !== null
      ? `${anzahl} abgeschlossene Arbeitspakete seit Projektbeginn — verschoben ins Chronik-Archiv, hier als Zeitachse.`
      : 'Die Chronik ist derzeit nicht lesbar.',
  });

  const inhalt = `${kopf}

<section id="zeitachse">
  <p class="eyebrow">Meilensteine</p>
  <h2>Zeitachse — neueste zuoberst</h2>
  <p class="lede">Der laufende Plan führt fast nur den offenen Rest. Alles Erledigte wandert in ein eigenes Archiv;
  diese Zeitachse liest es Monat für Monat zurück.</p>
  ${zeitachse}
</section>

<section id="statistik">
  <p class="eyebrow">Bau-Statistik</p>
  <h2>Der Bau in Zahlen</h2>
  ${kacheln([
    { wert: stat.commits?.toLocaleString('de-CH') ?? null, label: 'Änderungsschritte (Commits)' },
    { wert: stat.gemergtePrs, label: 'übernommene Änderungsvorschläge (PRs)' },
    { wert: stat.pruefTore, label: 'automatische Prüf-Tore' },
    { wert: stat.testDateien, label: 'Test-Dateien' },
    { wert: chronik, label: 'erledigte Arbeitspakete (Chronik)' },
    { wert: offeneSchritte(), label: 'offene Schritte im Plan' },
  ])}
  <p class="hinweis"><b>So wurde gezählt.</b>
  Commits: <span class="id">git rev-list --count HEAD</span> (alle Änderungsschritte der Projekt-Historie).
  PRs: Anzahl Einträge aus <span class="id">gh pr list --state merged --limit 1000</span> — bei mehr als 1000
  gemergten PRs wäre diese Zahl gedeckelt.
  Prüf-Tore: Anzahl der <span class="id">check:</span>-Skripte in <span class="id">package.json</span>
  (ein Skript kann mehrere Einzelprüfungen bündeln).
  Test-Dateien: Dateien unter <span class="id">src/tests/</span> und <span class="id">e2e/</span> mit Endung
  <span class="id">.test.ts</span> oder <span class="id">.e2e.ts</span> — gezählt werden Dateien, nicht einzelne Testfälle;
  die Zahl der Testfälle liegt deutlich höher.
  Offene Schritte: Einheiten in <span class="id">ROADMAP.md</span>, deren Status nicht «done» ist (derselbe Parser wie
  <span class="id">plan:next</span>).
  ${stat.gemergtePrs === null || stat.commits === null ? '<b>⚠ Mindestens eine Quelle war nicht abfragbar</b> — die betroffene Kachel zeigt «—» statt einer geschätzten Zahl.' : ''}</p>
</section>

${fussnote('Die Zeitachse liest ROADMAP-CHRONIK.md, die Statistik git, gh und package.json.')}`;

  return rahmen({ indexPfad: o.indexPfad, aktiv: 'geschichte', titel: `LexMetrik — Geschichte ${o.stand}`, watch: o.watch, inhalt });
}

/** Offene Plan-Schritte (Status ≠ done) — dieselbe Parser-Wahrheit wie plan:next. */
function offeneSchritte(): number | null {
  try {
    const { einheiten } = parseRoadmap(readFileSync('ROADMAP.md', 'utf8'));
    return einheiten.filter((e) => e.etikett.status !== 'done').length;
  } catch {
    return null;
  }
}
