// ─── B4: «Bezüge» am Artikel — facettierte Kanten aller Instanzen ────────────
//
// W2·7-BEZUG/B4 (FAHRPLAN-VERZAHNUNG-UI §9). Der ERWEITERTE Zustand der
// Kanten-Zeile: sobald der Nutzer im «Ansicht ▾»-Menü eine Klasse jenseits der
// Leitentscheide zuschaltet, rendert der Artikel-Fuss diese Zeile statt der
// bestehenden `LeitfallZeile` — aus dem Bezugs-Shard (Obermenge) statt aus dem
// schlanken Leitfall-Shard. Im Grundzustand wird diese Datei nicht angefasst;
// die heutige Darstellung bleibt byte-gleich (§6).
//
// ── WARUM GRUPPIERT UND NICHT EINE REIHE (§8, der tragende Entwurf) ─────────
// `facetten.ts` hält fest: «Wer die drei in EINE Liste kippt und nur nach Datum
// sortiert, behauptet stillschweigend Gleichrang.» Genau das würde eine flache
// Chip-Reihe tun — ein BGE und ein kantonaler Entscheid sähen identisch aus,
// sobald der ★ das einzige Unterscheidungsmerkmal ist (und ein kantonaler
// Entscheid trägt keinen). Darum trägt JEDE Status-Klasse ihre eigene
// Untergruppe mit ausgeschriebenem Label: die Rangordnung wird STRUKTURELL
// sichtbar und überlebt jede Sortierung, jedes Nachladen und jeden Filter.
// Das ist die `KontextGruppe`-Grammatik (§1.4) am Artikel-Fuss, mit
// unverändertem `KantenChip` (§1.2) und unveränderter `MehrKante` (§1.5) —
// B4 ERWEITERT die Grammatik um Facetten, ersetzt kein Element (§9 B4).
//
// ── EHRLICHE GRUNDGESAMTHEIT (§8) ──────────────────────────────────────────
// Jede Gruppe zeigt «gezeigt von gesamt», sobald der klassenweise Deckel
// (DECKEL_JE_STATUS = 8) gegriffen hat: «8 von 115» statt «8». `gesamt` kommt
// aus `gesamtProArtikel` des Shards (Vor-Deckel-Zahl), nicht aus der gerenderten
// Liste — sonst wäre die Zahl bloss eine Wiederholung dessen, was man ohnehin
// sieht. Ist `gesamt === gezeigt`, steht nur die eine Zahl: ein «8 von 8» wäre
// Lärm ohne Erkenntnis.
//
// ── `gewicht: null` WIRD NIE ZU 0 (§8) ─────────────────────────────────────
// Der Zitier-Graph erkennt nur BGE-Fundstellen und Bundesgerichts-Aktenzeichen;
// kantonale und eidgenössische Geschäftsnummern treffen keine dieser Formen
// (siehe `BezugsEintrag` in bezuege.ts). Diese Zeile rendert `gewicht` DARUM
// GAR NICHT als Zahl — weder 0 noch «–». Sie nutzt es ausschliesslich als
// Reihenfolge, die der Shard schon gesetzt hat. Wer die Zahl je zeigen will,
// muss den Unterschied «nicht messbar» ↔ «null Zitierungen» mitrendern; solange
// das nicht gebaut ist, ist Schweigen die ehrliche Darstellung.

import { memo, useState } from 'react';
import { KantenChip } from '../../../components/verzahnung/KantenChip';
import { MehrKante } from '../../../components/verzahnung/MehrKante';
import { usePaneSteuerung } from '../../../components/layout/usePaneLayout';
import type { Bezug } from '../../../lib/rechtsprechung/bezuege';
import type { BezugStatus } from '../../../lib/verzahnung/facetten';
import { STATUS_LABEL, STATUS_RANG } from '../../../lib/verzahnung/facetten';
import { KLASSE_KURZ } from '../bezugAuswahl';
import {
  klassifiziereFassungsBezug, entscheidDatum, type ArtikelRevision,
} from '../../../lib/verzahnung/artikel-revisionen';

/** Sichtbare Chips JE GRUPPE. Bewusst kleiner als die 10 der flachen
 *  Leitfall-Zeile: bei vier Klassen stünden sonst bis zu 40 Chips am
 *  Artikel-Fuss. Der Rest bleibt hinter «+n weitere» erreichbar (§1.5). */
const PRO_GRUPPE_SICHTBAR = 6;

/**
 * Trefferzahl einer Gruppe mit ehrlicher Grundgesamtheit.
 * `gesamt > gezeigt` ⇒ «8 von 115»; sonst nur «8» (siehe Kopf-Kommentar).
 */
function zahlText(gezeigt: number, gesamt: number): string {
  return gesamt > gezeigt ? `${gezeigt} von ${gesamt}` : String(gezeigt);
}

/**
 * Eine Status-Gruppe: Label + ehrliche Zahl + Chips + «+n weitere».
 *
 * `gesamtRoh` ist die Vor-Deckel-Zahl DIESER Klasse an DIESEM Artikel aus
 * `gesamtProArtikel`. Sie wird nur dann als Grundgesamtheit ausgewiesen, wenn
 * sie die gezeigten Kanten wirklich übersteigt — eine Grundgesamtheit, die
 * kleiner wäre als die gezeigte Menge (denkbar bei einem Alt-Shard ohne
 * `gesamtProArtikel`), würde sonst eine Untertreibung behaupten.
 */
const StatusGruppe = memo(function StatusGruppe({ status, kanten, gesamtRoh, normZitat, revision }: {
  status: BezugStatus;
  kanten: readonly Bezug[];
  gesamtRoh: number | undefined;
  normZitat: string;
  revision?: ArtikelRevision | null;
}) {
  const [alleAuf, setAlleAuf] = useState(false);
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  if (kanten.length === 0) return null;

  const sichtbar = alleAuf ? kanten : kanten.slice(0, PRO_GRUPPE_SICHTBAR);
  const rest = kanten.length - sichtbar.length;
  const gesamt = Math.max(gesamtRoh ?? kanten.length, kanten.length);

  return (
    <div data-bezug-gruppe={status} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="lc-overline shrink-0" title={STATUS_LABEL[status]}>
        {KLASSE_KURZ[status]}
        {/* Die Zahl ist Teil der Gruppen-Überschrift, nicht ein Badge am Chip:
            sie gilt für die KLASSE, nicht für eine einzelne Kante (§8). */}
        <span className="num tabular-nums ml-1 font-normal normal-case text-ink-500">
          {zahlText(kanten.length, gesamt)}
        </span>
      </span>
      {sichtbar.map((b) => {
        // ?norm= trägt die Fundstellen-Absicht (wie in der LeitfallZeile): das
        // Ziel springt zur ersten Erwägung, die diese Norm zitiert (§5).
        const ziel = `/rechtsprechung/${encodeURIComponent(b.key)}?norm=${encodeURIComponent(normZitat)}`;
        // §V1c: hat sich die Norm SEIT diesem Entscheid revidiert? Q1-sicher über
        // die Entscheid-Präzision (BGE-Bandjahr-Platzhalter ⇒ Jahresvergleich).
        const revidiert = klassifiziereFassungsBezug(entscheidDatum(b.datum, b.facetten.gericht), revision) === 'revidiert'
          ? (revision ?? null) : null;
        return (
          <span key={b.key} className="inline-flex items-center">
            <KantenChip to={ziel} label={b.zitierung} kategorie="entscheid"
              leitentscheid={b.facetten.status === 'bge'}
              revidiert={revidiert}
              titel={b.regesteKurz ?? `${b.zitierung} — ${STATUS_LABEL[b.facetten.status]}`} />
            {kannOeffnen && !istOffen(ziel) && (
              <button type="button" onClick={() => oeffneDaneben(ziel)}
                title={`${b.zitierung} nebeneinander öffnen`} aria-label={`${b.zitierung} nebeneinander öffnen`}
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
                <span aria-hidden className="text-base leading-none">⧉</span>
              </button>
            )}
          </span>
        );
      })}
      <MehrKante rest={rest} offen={alleAuf} onOeffne={() => setAlleAuf(true)} />
    </div>
  );
});

/**
 * Die «Bezüge»-Zeile: alle gewählten Facetten-Klassen dieses Artikels,
 * gruppiert nach Status-Rang (§2 — deklarierte Ordnung aus `STATUS_RANG`,
 * nie aus Zählern abgeleitet).
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
export const BezuegeZeile = memo(function BezuegeZeile({ kanten, gesamt, normZitat, revision }: {
  /** Kanten dieses Artikels NACH Facetten-Filter, in Shard-Ordnung. */
  kanten?: readonly Bezug[];
  /** Vor-Deckel-Grundgesamtheit je Status an diesem Artikel (§8). */
  gesamt?: Partial<Record<BezugStatus, number>>;
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
  // Ordnung (Gewicht/Leitcharakter/Datum) — die Datenschicht hat sie gesetzt,
  // hier wird sie nur erhalten (§5: keine zweite Sortier-Wahrheit). Klassen ohne
  // Treffer erscheinen gar nicht.
  const gruppen = new Map<BezugStatus, Bezug[]>();
  for (const b of kanten) {
    const liste = gruppen.get(b.facetten.status);
    if (liste) liste.push(b);
    else gruppen.set(b.facetten.status, [b]);
  }
  const geordnet = [...gruppen.entries()].sort((a, b) => STATUS_RANG[a[0]] - STATUS_RANG[b[0]]);

  // Direkt die Auflistung, ohne Zwischenzustand: was aktiviert ist, steht da.
  // Die ehrliche Zahl sitzt als dezenter Kopf AN DER GRUPPE, zu der sie gehört
  // («Kantonal 8 von 115») — nicht als eigene Dauerzeile darüber.
  return (
    <div data-leitfall-zeile data-bezuege-zeile className="mt-4 flex flex-col gap-1.5">
      {geordnet.map(([status, liste]) => (
        <StatusGruppe key={status} status={status} kanten={liste} gesamtRoh={gesamt?.[status]}
          normZitat={normZitat} revision={revision} />
      ))}
    </div>
  );
});
