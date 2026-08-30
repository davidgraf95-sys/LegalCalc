/**
 * abk-einzelurteil — das letzte Urteilsmittel gegen die Endpoint-Kappung
 * (Regel 5 in `abk-aliase-generieren.ts`, Nachtrag 31.8.2026).
 *
 * ANLASS. `check:fedlex-abk-netz` war in zwei Monitor-Läufen rot (33339658668,
 * 33340145194): SR 812.121.1 lieferte im Hauptlauf deterministisch KEINE Zeile,
 * womit die Verlust-Gegenprobe in ihren Regel-(4)-Pfad fiel — «nicht absicherbar,
 * kein Urteil», Exit 1 mit Handprüfungs-Auftrag. Die Handprüfung (31.8.2026,
 * Fedlex-SPARQL, Einzelabfrage OHNE Datums-FILTER) fand den geltenden Abstract
 * cc/2011/362 und seine Kürzel (de `BetmKV` · fr/it `OCStup`): das Artefakt war
 * korrekt, gekappt hatte die veränderte VALUES-Zusammensetzung nach dem
 * Register-Zuwachs (Staatsverträge, #571).
 *
 * WARUM EIN EIGENES MODUL, nicht weitere 100 Zeilen im Generator:
 *  (a) `abk-aliase-generieren.ts` ist ein AUSFÜHRBARES Skript — reine Rechenlogik
 *      muss importierbar sein, ohne dass beim Import ein echter Lauf startet
 *      (dieselbe Begründung wie `scripts/datenhaltung/turso-transport.ts`).
 *  (b) §6.6/`check:schlankheit`: der Generator lag bereits bei 922 Zeilen. Zuwachs
 *      wird gesplittet, nicht in die Baseline geschoben.
 * Der I/O-Teil bleibt drüben und wird als `hole` hereingereicht — dieses Modul
 * kennt kein Netz, keinen Stichtag aus der Wanduhr und keine Datei (§2).
 *
 * FAIL-CLOSED BLEIBT. Das Urteilsmittel kann nur ZEILEN LIEFERN, nie einen Verlust
 * bestätigen: gibt die Einzelabfrage nichts her, kehrt der Aufrufer in den
 * bestehenden «KEIN URTEIL»-Pfad zurück. Keine Ausnahme- oder Allowlist je SR.
 */
import type { SparqlBinding } from '../fedlex-sparql';
import { vergleiche } from './vergleich';

export interface AliasZeile { sr: string; sprache: 'de' | 'fr' | 'it'; abk: string }

/** Fedlex-Sprachcode → Kürzel-Sprache. Einzige Quelle beider Läufe (§5). */
export const SPRACHE: Record<string, 'de' | 'fr' | 'it'> = { DEU: 'de', FRA: 'fr', ITA: 'it' };
/** Sortier-Rang der Sprachen — deterministische Zeilenfolge (§2). */
export const RANG: Record<'de' | 'fr' | 'it', number> = { de: 0, fr: 1, it: 2 };

/** Anläufe der Einzelabfrage: 1 Anlauf + bis zu 2 Wiederholungen, dann kein Urteil. */
export const EINZEL_VERSUCHE = 3;

/**
 * Holt die Bindings EINER Einzelabfrage (VALUES nur diese SR, ohne Datums-FILTER,
 * mit COUNT-Zähltor). Hereingereicht, damit dieses Modul netzfrei bleibt.
 */
export type EinzelHole = (sr: string, etikett: string) => Promise<SparqlBinding[]>;

/**
 * CURRENCY-FENSTER (Regel 2) als EINE clientseitige Implementation — die
 * Einzelabfrage lässt den Datums-FILTER im SPARQL weg und wendet ihn hier an.
 *
 * MENGEN-, NICHT ZEILEN-SEMANTIK: ein Abstract kann mehrere `dateEntryInForce`/
 * `dateNoLongerInForce` tragen, und der SPARQL-Rumpf heisst ∃von ≤ T ∧ ¬∃bis ≤ T
 * (`FILTER NOT EXISTS`). Zeile für Zeile geprüft wäre das NICHT dasselbe — bei zwei
 * `bis`-Werten (einer vergangen, einer künftig) liesse es den abgelösten Abstract
 * durch, und das Urteilsmittel bestätigte ein Schatten-Kürzel (SR 173.110 trägt BGG
 * *und* OG). Unlesbare, leere oder fehlende Daten erfüllen nichts (fail-closed).
 */
export function imCurrencyFenster(
  von: readonly string[], bis: readonly string[], stichtag: string,
): boolean {
  const vorbei = (d: string): boolean => {
    const tag = /^\d{4}-\d{2}-\d{2}/.exec(d)?.[0];
    return tag !== undefined && tag <= stichtag;
  };
  return von.some(vorbei) && !bis.some(vorbei);
}

/**
 * Bindings der Einzelabfrage → gefensterte Alias-Zeilen DIESER SR. Die Datums-Werte
 * werden je `?cc` GESAMMELT, bevor gefenstert wird: die OPTIONAL-Projektion liefert
 * das Kreuzprodukt aus `von`/`bis`, und zeilenweise liesse sich ∃/¬∃ nicht ausdrücken.
 *
 * `konflikt` ist der Abbruch des Aufrufers: zwei amtliche Kürzel derselben (sr,
 * sprache) trotz Fenster werden nicht getiebreakt (§8) — sonst entschiede das
 * Urteilsmittel eine fachliche Frage, die es nur aufwerfen darf.
 */
export function einzelZeilen(
  roh: SparqlBinding[], sr: string, stichtag: string, konflikt: (meldung: string) => never,
): AliasZeile[] {
  const vonJeCc = new Map<string, string[]>();
  const bisJeCc = new Map<string, string[]>();
  for (const b of roh) {
    const cc = b.cc?.value ?? '';
    if (b.von?.value) vonJeCc.set(cc, [...(vonJeCc.get(cc) ?? []), b.von.value]);
    if (b.bis?.value) bisJeCc.set(cc, [...(bisJeCc.get(cc) ?? []), b.bis.value]);
  }
  const jeSprache = new Map<'de' | 'fr' | 'it', Set<string>>();
  for (const b of roh) {
    const sp = SPRACHE[b.sprache?.value ?? ''];
    const abk = (b.abk?.value ?? '').trim();                     // Trim ein zweites Mal (Regel 3)
    if (b.sr?.value !== sr || !sp || abk === '') continue;
    const cc = b.cc?.value ?? '';
    if (!imCurrencyFenster(vonJeCc.get(cc) ?? [], bisJeCc.get(cc) ?? [], stichtag)) continue;
    jeSprache.set(sp, (jeSprache.get(sp) ?? new Set()).add(abk));
  }
  const zeilen: AliasZeile[] = [];
  for (const [sprache, menge] of jeSprache) {
    if (menge.size > 1) {
      konflikt(
        `Einzelabfrage SR ${sr} / ${sprache}: ${[...menge].sort(vergleiche).join(' vs. ')} — zwei `
        + 'amtliche Kürzel trotz Currency-Fenster. NICHT automatisch entschieden (§8), Abbruch.',
      );
    }
    for (const abk of menge) zeilen.push({ sr, sprache, abk });
  }
  return zeilen.sort((a, b) => RANG[a.sprache] - RANG[b.sprache] || vergleiche(a.abk, b.abk));
}

/**
 * LETZTES URTEILSMITTEL für eine gekappte SR: eine Abfrage nur dieser SR, ohne
 * Datums-FILTER im SPARQL, gefenstert in TS, mit COUNT-Tor (Regel 4). `[]` heisst
 * weiterhin «kein Urteil», NIE «weggefallen» — der Aufrufer bleibt fail-closed.
 */
export async function einzelUrteil(
  sr: string, stichtag: string, hole: EinzelHole, konflikt: (meldung: string) => never,
): Promise<AliasZeile[]> {
  for (let versuch = 1; versuch <= EINZEL_VERSUCHE; versuch += 1) {
    const roh = await hole(sr, `Einzelabfrage SR ${sr} (Anlauf ${versuch})`);
    const zeilen = einzelZeilen(roh, sr, stichtag, konflikt);
    if (zeilen.length > 0) return zeilen;
    console.log(`    Einzelabfrage SR ${sr}: 0 Zeilen im Currency-Fenster (Anlauf ${versuch}/${EINZEL_VERSUCHE}).`);
  }
  return [];
}

/**
 * BEVOR «kein Urteil» gilt: Einzelurteil für jede SR, die das Artefakt führt und für
 * die der Hauptlauf GAR keine Zeile brachte.
 *
 * Warum hier und nicht im Regel-(4)-Zweig der Verlust-Gegenprobe: die betroffene
 * Menge ist dieselbe (eine Bestands-SR ohne Live-Zeile landet dort als «nicht
 * absicherbar»), aber so laufen die gewonnenen Zeilen durch den NORMALEN Vergleich —
 * gleich ⇒ kein Verlust, abweichend ⇒ gewöhnliche Drift-Behandlung samt Gegenprobe,
 * die jetzt eine Positivkontrolle derselben SR hat. Ein zweiter, nur ähnlicher
 * Vergleichspfad wäre die Falle aus §5/§6.7. Bleibt eine SR zeilenlos, ändert sich
 * nichts: sie endet in der Gegenprobe bei «KEIN URTEIL MÖGLICH», Exit 1.
 */
export async function einzelUrteilFuerGekappte(
  live: AliasZeile[], bestand: AliasZeile[], stichtag: string,
  hole: EinzelHole, konflikt: (meldung: string) => never,
): Promise<AliasZeile[]> {
  const liveSr = new Set(live.map((z) => z.sr));
  const gekappt = [...new Set(bestand.map((z) => z.sr))].filter((sr) => !liveSr.has(sr)).sort(vergleiche);
  if (gekappt.length === 0) return [];
  console.log(
    `\n  ${gekappt.length} SR im Artefakt OHNE jede Live-Zeile — Einzelabfrage ohne Datums-FILTER `
    + 'als letztes Urteilsmittel (Regel 5, Nachtrag 31.8.2026):',
  );
  const gewonnen: AliasZeile[] = [];
  for (const sr of gekappt) {
    const zeilen = await einzelUrteil(sr, stichtag, hole, konflikt);
    if (zeilen.length === 0) continue;
    const detail = zeilen.map((z) => `${z.sprache} '${z.abk}'`).join(', ');
    console.log(`    SR ${sr}: Kappung im Hauptlauf, per Einzelabfrage entschieden — ${detail}`);
    gewonnen.push(...zeilen);
  }
  return gewonnen;
}
