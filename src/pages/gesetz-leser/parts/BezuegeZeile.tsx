// ─── B4/B7: «Bezüge» am Artikel — je Instanz EINE scrollbare Linie ───────────
//
// W2·7-BEZUG/B4 (FAHRPLAN-VERZAHNUNG-UI §9), B7 (David-Auftrag 28.7.2026). Der
// ERWEITERTE Zustand der Kanten-Zeile: sobald der Nutzer im Dropdown
// «Rechtsprechung ▾» eine Klasse zuschaltet, rendert der Artikel-Fuss diese
// Zeile statt der bestehenden `LeitfallZeile` — aus dem Bezugs-Shard (Obermenge)
// statt aus dem schlanken Leitfall-Shard.
//
// ── WAS B7 GEÄNDERT HAT (David-Wortlaut) ───────────────────────────────────
// «or 41 dort sind nur ein teil der entscheide verlinkt … mach es so dass man
// durchscrollen kann und dann je eine linie für jede instanz und alle sichtbar.
// chronologisch vom neusten zum ältesten»
// Bis B6 zeigte jede Gruppe sechs Chips und dahinter «+n weitere»; die
// Datenschicht lieferte ohnehin nur acht je Klasse, der Rest war unerreichbar.
// Beides ist weg: der Shard liefert ALLE Kanten (facetten.ts), und jede Gruppe
// ist eine waagrecht scrollbare Linie über die volle Menge, chronologisch
// neu → alt.
//
// ── WARUM GRUPPIERT UND NICHT EINE REIHE (§8, der tragende Entwurf) ─────────
// `facetten.ts` hält fest: «Wer die drei in EINE Liste kippt und nur nach Datum
// sortiert, behauptet stillschweigend Gleichrang.» Genau das würde eine flache
// Chip-Reihe tun — ein BGE und ein kantonaler Entscheid sähen identisch aus,
// sobald der ★ das einzige Unterscheidungsmerkmal ist (und ein kantonaler
// Entscheid trägt keinen). Darum trägt JEDE Status-Klasse ihre eigene Linie mit
// ausgeschriebenem Label: die Rangordnung wird STRUKTURELL sichtbar und
// überlebt jede Sortierung, jedes Nachladen und jeden Filter. Dass die Ordnung
// INNERHALB der Linie chronologisch ist, widerspricht dem nicht — sie ordnet
// Gleichrangiges, nie über Klassen hinweg.
//
// ── EHRLICHE ZAHL AM GRUPPENKOPF (§8) ──────────────────────────────────────
// Ohne Filter steht die schlichte Gesamtzahl da («Leitentscheide 30») — seit
// B7 ist sie die Vollzahl, kein «gezeigt von». Verkürzt ein Zeitraum- oder
// Kantons-Filter die Linie, steht «12 von 30 im Zeitraum» bzw. «12 von 30»:
// die Bezugsgrösse kommt aus `gesamtProArtikel` des Shards und schrumpft NICHT
// mit dem Filter mit — sonst behauptete sie, es gäbe weniger Praxis, als es
// gibt.
//
// ── `gewicht: null` WIRD NIE ZU 0 (§8) ─────────────────────────────────────
// Der Zitier-Graph erkennt nur BGE-Fundstellen und Bundesgerichts-Aktenzeichen;
// kantonale und eidgenössische Geschäftsnummern treffen keine dieser Formen
// (siehe `BezugsEintrag` in bezuege.ts). Diese Zeile rendert `gewicht` DARUM
// GAR NICHT als Zahl — weder 0 noch «–». Seit B7 nutzt sie es nicht einmal mehr
// als Reihenfolge: die Linie ist chronologisch geordnet, und das ist die
// einzige Achse, die in allen vier Klassen wirklich messbar ist.

import { memo, useCallback, useState } from 'react';
import { KantenChip } from '../../../components/verzahnung/KantenChip';
import { usePaneSteuerung } from '../../../components/layout/usePaneLayout';
import type { Bezug } from '../../../lib/rechtsprechung/bezuege';
import type { BezugStatus } from '../../../lib/verzahnung/facetten';
import { STATUS_LABEL, STATUS_RANG } from '../../../lib/verzahnung/facetten';
import { KLASSE_KURZ } from '../bezugAuswahl';
import {
  klassifiziereFassungsBezug, entscheidDatum, type ArtikelRevision,
} from '../../../lib/verzahnung/artikel-revisionen';

/**
 * Wie viele Chips einer Linie SOFORT im DOM stehen — und wie viele beim
 * Weiterscrollen dazukommen (§15, Lazy-Rendering statt echter Virtualisierung).
 *
 * ── WARUM ÜBERHAUPT GESTÜCKELT (die Zahl, die es erzwingt) ─────────────────
 * Art. 42 BGG trägt 4'140 Kanten an EINEM Artikel (Beschwerdebegründung — den
 * zitiert praktisch jedes Bundesgerichtsurteil); Art. 5 StPO 115 kantonale,
 * Art. 41 OR 30 Leitentscheide. Alle Chips eines Erlasses auf einmal zu
 * rendern, hiesse im BGG-Leser fünfstellig viele DOM-Knoten aufzubauen, von
 * denen ein Nutzer vielleicht acht ansieht. Das ist genau die Idle-Herde aus
 * W2·7-VZUI (§15.4), nur an anderer Stelle.
 *
 * ── WARUM NICHT ECHTE VIRTUALISIERUNG (absolute Positionierung + Fenster) ──
 * Die Chips sind VERSCHIEDEN BREIT («BGE 146 IV 76» gegen «Appellationsgericht
 * BS SB.2024.85 vom 17.11.2025»). Echte Virtualisierung bräuchte darum entweder
 * gemessene Breiten (ein Layout-Durchgang je Chip — teurer als das Rendern) oder
 * eine erzwungene Einheitsbreite (die Zitierung würde abgeschnitten, und eine
 * abgeschnittene Fundstelle ist keine Fundstelle mehr, §7). Anhängen ist die
 * Bauform, die zur Datenform passt.
 *
 * ERSTE_SICHTBAR = 12 füllt jede realistische Linienbreite (~8 Chips sichtbar)
 * und lässt genug Rest, dass die Scroll-Affordanz erscheint. NACHLADE_SCHRITT
 * = 36 heisst: dreimal Wischen, bevor wieder nachgeladen wird.
 */
const ERSTE_SICHTBAR = 12;
const NACHLADE_SCHRITT = 36;
/** Abstand zum rechten Ende, ab dem nachgeladen wird (px). */
const NACHLADE_SCHWELLE_PX = 240;

/**
 * Zahl am Gruppenkopf mit ehrlicher Bezugsgrösse (§8).
 *
 * `gezeigt === gesamt` ⇒ nur die eine Zahl. Das ist seit B7 der NORMALFALL —
 * die Linie zeigt alles, und ein «30 von 30» wäre Lärm ohne Erkenntnis.
 * `gezeigt < gesamt` kann nur noch ein UI-Filter verursacht haben; welcher, sagt
 * der Zusatz, damit niemand die Verkürzung für die Datenlage hält.
 */
function zahlText(gezeigt: number, gesamt: number, zeitAktiv: boolean): string {
  if (gesamt <= gezeigt) return String(gezeigt);
  return zeitAktiv ? `${gezeigt} von ${gesamt} im Zeitraum` : `${gezeigt} von ${gesamt}`;
}

/**
 * Eine Status-Gruppe: Label + ehrliche Zahl + EINE waagrecht scrollbare Linie.
 *
 * ── FESTE HÖHE = CLS 0 ─────────────────────────────────────────────────────
 * Die Linie ist `h-7` hoch, egal wie viele Chips nachgeladen werden: sie wächst
 * nach RECHTS in den Scroll-Bereich, nie nach unten. Der Artikeltext darunter
 * bewegt sich damit nie — weder beim ersten Erscheinen der Zeile noch beim
 * Nachladen. Die Chips selbst sind `min-height: 24px` (WCAG 2.5.8), die 28 px
 * der Linie tragen sie ohne Umbruch.
 *
 * ── TASTATUR (WCAG 2.1.1) ──────────────────────────────────────────────────
 * Die Linie ist selbst fokussierbar (`tabIndex={0}` + `role="group"` +
 * `aria-label`): ein scrollbarer Bereich muss ohne Maus erreichbar und mit den
 * Pfeiltasten bedienbar sein. Zusätzlich sind die Chips Links und damit
 * ohnehin in der Tab-Folge — der Browser scrollt die Linie beim Tabben mit.
 * Beides zusammen, nicht eines statt des anderen: wer nur tabbt, käme sonst nur
 * an die bereits gerenderten Chips.
 */
const StatusGruppe = memo(function StatusGruppe({ status, kanten, gesamtRoh, zeitAktiv, normZitat, revision }: {
  status: BezugStatus;
  kanten: readonly Bezug[];
  gesamtRoh: number | undefined;
  zeitAktiv: boolean;
  normZitat: string;
  revision?: ArtikelRevision | null;
}) {
  const [sichtbar, setSichtbar] = useState(ERSTE_SICHTBAR);
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  const anzahl = kanten.length;

  // Nachladen beim Scrollen. Der Handler hängt AN DIESER Linie, nicht am
  // Fenster — er kostet nichts, solange niemand hier wischt (§15.4). Er wird
  // zudem nur gesetzt, wenn es überhaupt etwas nachzuladen gibt.
  const beiScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollWidth - el.scrollLeft - el.clientWidth > NACHLADE_SCHWELLE_PX) return;
    setSichtbar((n) => (n >= anzahl ? n : Math.min(n + NACHLADE_SCHRITT, anzahl)));
  }, [anzahl]);

  if (anzahl === 0) return null;

  const liste = sichtbar >= anzahl ? kanten : kanten.slice(0, sichtbar);
  const gesamt = Math.max(gesamtRoh ?? anzahl, anzahl);
  const zahl = zahlText(anzahl, gesamt, zeitAktiv);

  return (
    <div data-bezug-gruppe={status} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
      {/* Der Kopf steht FEST und scrollt nicht mit: er sagt, WAS in der Linie
          steht, und diese Auskunft darf nicht wegscrollen (§8).
          MOBIL ÜBER der Linie, ab sm daneben — gemessen 29.7.2026 bei 375 px:
          nebeneinander schnitt «KANTONAL 13» in den Scrollbereich, und der
          Zähler verschwand hinter dem ersten Chip. Ein abgeschnittener Zähler
          ist schlimmer als eine Zeile mehr Höhe.
          `min-w` statt fester Breite: die vier Labels sind verschieden lang
          («Kantonal» gegen «Bundesgericht, übrige»); eine feste Breite müsste
          sich am längsten orientieren und liesse beim kürzesten ein Loch, eine
          zu knappe schnitte wieder ab. So fluchten die kurzen und die langen
          nehmen, was sie brauchen. `whitespace-nowrap`, weil ein umbrechender
          Gruppenkopf die feste Zeilenhöhe (CLS 0) sprengte. */}
      <span className="lc-overline shrink-0 whitespace-nowrap sm:min-w-[11rem]" title={STATUS_LABEL[status]}>
        {KLASSE_KURZ[status]}
        <span className="num tabular-nums ml-1 font-normal normal-case text-ink-500">{zahl}</span>
      </span>
      <div
        data-bezug-linie={status}
        className="lc-bezug-linie flex h-7 min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overflow-y-hidden"
        tabIndex={0}
        role="group"
        aria-label={`${zahl} — ${STATUS_LABEL[status]}, waagrecht scrollbare Liste, chronologisch vom neusten zum ältesten`}
        onScroll={anzahl > ERSTE_SICHTBAR ? beiScroll : undefined}
      >
        {liste.map((b) => {
          // ?norm= trägt die Fundstellen-Absicht (wie in der LeitfallZeile): das
          // Ziel springt zur ersten Erwägung, die diese Norm zitiert (§5).
          const ziel = `/rechtsprechung/${encodeURIComponent(b.key)}?norm=${encodeURIComponent(normZitat)}`;
          // §V1c: hat sich die Norm SEIT diesem Entscheid revidiert? Q1-sicher über
          // die Entscheid-Präzision (BGE-Bandjahr-Platzhalter ⇒ Jahresvergleich).
          const revidiert = klassifiziereFassungsBezug(entscheidDatum(b.datum, b.facetten.gericht), revision) === 'revidiert'
            ? (revision ?? null) : null;
          return (
            <span key={b.key} className="inline-flex shrink-0 items-center">
              <KantenChip to={ziel} label={b.zitierung} kategorie="entscheid"
                leitentscheid={b.facetten.status === 'bge'}
                revidiert={revidiert}
                titel={b.regesteKurz ?? `${b.zitierung} — ${STATUS_LABEL[b.facetten.status]}`} />
              {kannOeffnen && !istOffen(ziel) && (
                <button type="button" onClick={() => oeffneDaneben(ziel)}
                  title={`${b.zitierung} nebeneinander öffnen`} aria-label={`${b.zitierung} nebeneinander öffnen`}
                  className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
                  <span aria-hidden className="text-base leading-none">⧉</span>
                </button>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Die «Bezüge»-Zeile: alle gewählten Facetten-Klassen dieses Artikels,
 * je Klasse EINE Linie, geordnet nach Status-Rang (§2 — deklarierte Ordnung aus
 * `STATUS_RANG`, nie aus Zählern abgeleitet).
 *
 * REINER RENDERER, wie die `LeitfallZeile`: der Reader lädt den Bezugs-Shard
 * GENAU EINMAL je Erlass (inhalt.tsx) und reicht die aufgelösten, bereits
 * gefilterten Kanten als Prop durch. Kein Fetch je Zeile — bei ~1000 Artikeln
 * grosser Erlasse wäre das die belegte Idle-Herde aus W2·7-VZUI (§15.4).
 *
 * `data-leitfall-zeile` bleibt gesetzt: der bestehende «Entscheide»-Schalter
 * (V2·B-1, rein CSS über `data-leitfaelle` am <html>) blendet die Kanten-Zeile
 * aus — er muss die erweiterte Form genauso treffen wie die schlanke, sonst
 * hätte das Zuschalten einer Facette einen Schalter still ausgehebelt (§13 F4).
 */
export const BezuegeZeile = memo(function BezuegeZeile({ kanten, gesamt, zeitAktiv = false, normZitat, revision }: {
  /** Kanten dieses Artikels NACH Facetten-Filter, in Shard-Ordnung. */
  kanten?: readonly Bezug[];
  /** Kanten je Status an diesem Artikel, OHNE UI-Filter — die Bezugsgrösse (§8). */
  gesamt?: Partial<Record<BezugStatus, number>>;
  /** Ist ein Zeitraum-Filter aktiv? Entscheidet nur über den Wortlaut der Zahl
   *  («12 von 30 im Zeitraum» statt «12 von 30») — eine Verkürzung ohne Grund
   *  zu zeigen, wäre die halbe Auskunft (§8). */
  zeitAktiv?: boolean;
  /** Voll zitierfähige Norm («Art. 429 StPO») für den Fundstellen-Sprung. */
  normZitat: string;
  revision?: ArtikelRevision | null;
}) {
  // Keine Kanten ⇒ NICHTS. Kein Platzhalter, kein Hinweis, keine Overline —
  // null Pixel Verzahnungs-UI im Lesetext-Bereich (Vorgabe David 28.7.2026:
  // «bezüge kann weg. nur auflistung wenn aktiviert.»). Das gilt auch, wenn der
  // Nutzer alle Facetten abgewählt hat: er hat die Auflistung abgeschaltet, und
  // ein Rest-Hinweis wäre genau die Zeile, die weg soll. Der Weg zurück steht im
  // Dropdown «Rechtsprechung ▾», wo er abgeschaltet wurde — dort trägt der
  // Zähler auch die ehrliche Grundgesamtheit (§8), nicht mehr der Artikelfuss.
  if (!kanten || kanten.length === 0) return null;

  // Nach Status-Klasse gruppieren, Reihenfolge INNERHALB der Klasse = Shard-
  // Ordnung (seit B7 chronologisch neu→alt) — die Datenschicht hat sie gesetzt,
  // hier wird sie nur erhalten (§5: keine zweite Sortier-Wahrheit). Klassen ohne
  // Treffer erscheinen gar nicht.
  const gruppen = new Map<BezugStatus, Bezug[]>();
  for (const b of kanten) {
    const liste = gruppen.get(b.facetten.status);
    if (liste) liste.push(b);
    else gruppen.set(b.facetten.status, [b]);
  }
  const geordnet = [...gruppen.entries()].sort((a, b) => STATUS_RANG[a[0]] - STATUS_RANG[b[0]]);

  return (
    <div data-leitfall-zeile data-bezuege-zeile className="mt-4 flex flex-col gap-1.5">
      {geordnet.map(([status, liste]) => (
        <StatusGruppe key={status} status={status} kanten={liste} gesamtRoh={gesamt?.[status]}
          zeitAktiv={zeitAktiv} normZitat={normZitat} revision={revision} />
      ))}
    </div>
  );
});
