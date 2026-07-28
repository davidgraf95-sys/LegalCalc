// ─── Korpus schreiben (geteilt: Live-Generator, Offline-Seed, Tests) ─────────
//
// Schreibt aus einer Auswahl EntscheidSnapshots die public/rechtsprechung-Dateien:
// je Entscheid eine Datei + register.json (Manifest) + norm-index.json +
// norm-index-erlasse.json (schlanke Laufzeit-Projektion der Erlass-Ebene) +
// erfasste-keys.generated.ts (interne Verlinkung). Eine Stelle, kein Duplikat (§5).

import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kuerzeRegeste, normalisiereRegeste } from '../../src/lib/rechtsprechung/register';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';
import type { BrowseEntscheid, EntscheidManifest, RichterRef, RichterRegister } from '../../src/lib/rechtsprechung/register';
import { parseBesetzung, kanonisiere, bereinigeBesetzungsFreitext, type KanonEintrag } from '../../src/lib/rechtsprechung/besetzung';
import type { EntscheidRef, LeitfallRef, LeitfallShard } from '../../src/lib/rechtsprechung/norm-index';
import { minteEcliFuerSnapshot } from '../../src/lib/rechtsprechung/ecli';
import { artikelSchluesselMitBefund, AUSGESCHLOSSENE_KEYS } from './entscheide-mapping';
import { vergleiche } from './vergleich';

export function keyVon(snap: EntscheidSnapshot): { key: string; datei: string } {
  const docketSafe = snap.id.split('/').pop()!;
  return { key: `${snap.gericht}_${docketSafe}`, datei: `${snap.id}.json` };
}

/** Gekürzte Regeste aus dem geglätteten Text (normalisiereRegeste strippt u.a. die Überschrift). */
function regesteKurzVon(snap: EntscheidSnapshot): string | null {
  return snap.regeste ? kuerzeRegeste(normalisiereRegeste(snap.regeste.text)) : null;
}

/**
 * DIE Regel für `regesteKurz` in ALLEN Projektionen (register.json, proNorm,
 * proNormArtikel, Shards) — §5, EINE Stelle.
 *
 * Zwei Quellen, in dieser Reihenfolge:
 *   1. die amtliche Regeste, geglättet und gekürzt;
 *   2. NUR für die BS-Tranche (Bauplan §4): das Portal publiziert keine Regeste,
 *      aber einen amtlichen Betreff-Titel (`rubrum.gegenstand`) → Karten-Kurzzeile
 *      ≤ 120 Zeichen. `regesteVorhanden` bleibt dabei false: der Titel ist Betreff,
 *      keine Regeste (§8 — nicht als amtliche Regeste ausgeben, was keine ist).
 *
 * ALS FUNKTION HERAUSGEZOGEN 28.7.2026 (Linse 4). Stufe 2 stand vorher nur inline
 * in `schreibeKorpus`; `regeste-kurz-refresh.ts` rechnete daneben mit Stufe 1
 * allein. GEMESSEN: ein `--schreiben`-Refresh hätte die Kurzzeile bei ALLEN 3765
 * BS-Entscheiden auf null gesetzt — ein stiller Inhaltsverlust auf der Browse-Seite,
 * ausgelöst von einem Skript, das nur «auffrischen» sollte. Genau die zweite
 * Wahrheit, gegen die §5 steht.
 */
export function manifestRegesteKurz(snap: EntscheidSnapshot): string | null {
  return regesteKurzVon(snap)
    ?? (snap.quelle === 'gerichte-bs' && snap.rubrum?.gegenstand
      ? kuerzeRegeste(snap.rubrum.gegenstand, 120) : null);
}

/**
 * EntscheidRef aus einem Snapshot (identischer Inhalt wie im proNorm-Build).
 * `regesteKurz` über dieselbe Regel wie Manifest und proNorm (§5). Für den heutigen
 * Bestand verhaltensgleich zur früheren Fassung ohne BS-Zweig: die Artikel-Ebene
 * enthält ausschliesslich Bundesgerichts-Entscheide, die BS-Tranche also nie
 * (gemessen: 3765 BS-Einträge, davon 0 mit gerichtstyp 'bundesgericht'). Dass es
 * verhaltensgleich IST, beweist der byte-gleiche Regen — nicht dieser Kommentar.
 */
function refVon(snap: EntscheidSnapshot): EntscheidRef {
  const { key } = keyVon(snap);
  return {
    key, zitierung: snap.zitierung, regesteKurz: manifestRegesteKurz(snap), datum: snap.datum,
    leitcharakter: snap.leitcharakter, gericht: snap.gericht, kanton: snap.kanton,
  };
}

// Deckel je Artikel: «Leitfälle», keine Vollliste — bremst die Artikel-Fan-out des
// norm-index.json (Budget-Tor in check-entscheide.ts). Bewusst kleiner als der
// Erlass-Deckel (12), weil eine Artikel-Ansicht die wenigen zentralen Fälle zeigt.
const LEITFAELLE_PRO_ARTIKEL = 8;

/**
 * Totale Ordnung der Leitfälle je Artikel (§2-deterministisch): gewicht ↓, dann
 * Leitentscheid vor Routine, dann Datum ↓, dann key (totaler Tiebreaker) — build-
 * pfad-unabhängig stabil. EINE Quelle (§5): sowohl baueArtikelIndex als auch die
 * V1b-Shard-Regeneration (backe-rangliste-shards.ts) sortieren damit, sonst driftete
 * die E4-Neusortierung von der Ur-Ordnung ab.
 */
export function vergleicheLeitfaelle(a: LeitfallRef, b: LeitfallRef): number {
  return b.gewicht - a.gewicht
    || (a.leitcharakter === 'leitentscheid' ? 0 : 1) - (b.leitcharakter === 'leitentscheid' ? 0 : 1)
    || (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0)
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}

/**
 * Totale Ordnung der Erlass-Ebene (`proNorm`), §2-deterministisch: Leitentscheid vor
 * Routine, dann Datum ↓, dann key (totaler Tiebreaker).
 *
 * BESTANDSFEHLER, gefixt 28.7.2026 (Linse 4). Der Datums-Term lautete hier
 * `(a.datum < b.datum ? 1 : -1)` — bei GLEICHEM Datum liefert das −1 statt 0, also
 * `cmp(x,y) === cmp(y,x) === -1`. Das ist keine Ordnung, sondern eine Behauptung:
 *   · die `||`-Kette bricht bei −1 ab, der key-Tiebreaker war TOTER CODE;
 *   · das Ergebnis hing damit genau an dem, was der Tiebreaker ausschliessen
 *     sollte — der Eingabefolge (gemessen: `[A,B]` → `B,A`, `[B,A]` → `A,B`).
 * Der Kommentar an der Aufrufstelle behauptete trotzdem Totalität; er ist mit
 * korrigiert. Dieselbe Form trug schon `vergleicheLeitfaelle` oben — die war
 * richtig und dient hier als Referenz (§5: eine Form, zwei Ebenen).
 */
export function vergleicheEntscheidRefs(a: EntscheidRef, b: EntscheidRef): number {
  return (a.leitcharakter === 'leitentscheid' ? 0 : 1) - (b.leitcharakter === 'leitentscheid' ? 0 : 1)
    || (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0)
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}

/**
 * Serialisierung ALLER Rechtsprechungs-Artefakte (§5): 2-Space-Einrückung +
 * abschliessender Newline. EINE Stelle, weil `check:entscheide` die Gleichheit von
 * Monolith und schlanker Projektion BYTE-scharf prüft — und weil Nachpflege-Skripte
 * (regeste-kurz-refresh) dieselben Dateien schreiben wie `schreibeKorpus`.
 */
export function serialisiere(o: unknown): string {
  return JSON.stringify(o, null, 2) + '\n';
}

/**
 * Kanonisches Zitat-Token für den Zitier-Abgleich (Entscheid ↔ Entscheid), §2.
 * Vereinheitlicht BEIDE Seiten (Selbst-Identität eines Snapshots UND ein rohes
 * `zitierteEntscheide`-Element) auf dieselbe Normalform, damit «BGE 150 I 17»,
 * «150 I 17» und die aza-Nennung «1C_641/2022» sicher zusammenfinden:
 *   • BGE  → 'BGE:<band>:<abt>:<seite>'   (Präfix BGE/ATF/DTF optional)
 *   • aza  → 'AZA:<abt>:<nr>:<jahr>'      ('1C_641/2022', '1P.179/1994', '5A 33/2004')
 * Kein Treffer → null (nicht abgleichbar).
 */
export function kanonZitat(roh: string): string | null {
  const t = String(roh).trim().toUpperCase();
  // Abteilung inkl. optionalem Suffix der historischen Abteilungen «Ia»/«Va»
  // ([AB]?, weil t bereits gross ist) — konsistent zu zitat-extraktion.ts; beide
  // Abgleich-Seiten laufen durch kanonZitat, also intern eindeutig (Bug-Check W3).
  const bge = /(?:BGE|ATF|DTF)?\s*(\d{1,3})\s+([IVX]{1,4}[AB]?)\s+(\d{1,4})\b/.exec(t);
  if (bge) return `BGE:${bge[1]}:${bge[2]}:${bge[3]}`;
  const aza = /\b(\d[A-Z])[._ ](\d{1,6})[/_](\d{4})\b/.exec(t);
  if (aza) return `AZA:${aza[1]}:${aza[2]}:${aza[3]}`;
  return null;
}

/** Zitat-Token, unter denen ein Snapshot von ANDEREN Entscheiden genannt werden kann. */
function selbstTokens(snap: EntscheidSnapshot): string[] {
  const out = new Set<string>();
  for (const roh of [snap.bgeReferenz, snap.nummer, snap.azaUrteil?.aktenzeichen]) {
    if (!roh) continue;
    const t = kanonZitat(roh);
    if (t) out.add(t);
  }
  return [...out];
}

// Die (Register-key, Artikel)-Paare eines Snapshots rechnet jetzt
// `artikelSchluesselVonSnapshot` (entscheide-mapping.ts) — inkl. der
// Fliesstext-Erkennung (W2·6-NKEY Baustein d) und des Ausschlusses föderal/
// kantonal mehrdeutiger Kürzel («StG»). Die frühere lokale Kopie samt
// AMBIGE_BUND_KANTON_KUERZEL ist dorthin umgezogen (§5: eine Stelle — auch das
// Oracle-Tor check-rangliste-oracle rechnet nun mit derselben Funktion); die
// Begründung des StG-Ausschlusses steht dort als ABK_AUSSCHLUSS-Eintrag.

/**
 * Artikel-Ebene des Norm-Index (W3), deterministisch (§2). Nur Bundesgerichts-
 * Entscheide (wie proNorm — die Panel-Überschrift lautet «Bundesgerichtsentscheide
 * zu Art. X»; eidg./kantonale Gerichte gehören nicht darunter, §8). Für jeden
 * Artikel A ist die «topische Menge» S_A = {Bundesgerichtsentscheide, die A zitieren};
 * `gewicht` eines Falls d = Anzahl ANDERER Fälle aus S_A, die d nennen (In-degree
 * INNERHALB von S_A). Rang: gewicht ↓, dann Leitentscheid vor Routine, dann Datum ↓,
 * dann key (totaler Tiebreaker) — build-pfad-unabhängig stabil.
 */
/**
 * LITERATUR-VERWURF-STATISTIK (Gegenprüfung R3; löst die frühere Singleton-Zählung
 * der zurückgebauten Korroborations-Schwelle ab). Ein Filter, dessen Wirkung niemand
 * sieht, ist ein Tor, das nicht scheitern kann (§6.7): der `--remap`-Lauf weist die
 * Zahlen aus, damit ein Sprung nach oben («die Marker greifen zu weit») oder nach
 * unten («die Regel ist entschärft») im Lauf-Protokoll auffällt — nicht erst im
 * Artefakt. Modulweit, weil `baueArtikelIndex` seine Signatur behält (Aufrufer im Tor).
 *
 * `paare` zählt (Snapshot, Artikel)-Paare, die AUSSCHLIESSLICH aus einer entfernten
 * Zitier-Apparat-Spanne stammten; `nennungen` die Roh-Vorkommen in diesen Spannen;
 * `spannen` die Spannen selbst.
 */
let literaturVerwurf = { paare: 0, nennungen: 0, spannen: 0 };
export function letzterLiteraturVerwurf(): { paare: number; nennungen: number; spannen: number } {
  return { ...literaturVerwurf };
}

export function baueArtikelIndex(auswahl: EntscheidSnapshot[]): Record<string, LeitfallRef[]> {
  const bg = auswahl.filter((s) => s.gerichtstyp === 'bundesgericht');
  literaturVerwurf = { paare: 0, nennungen: 0, spannen: 0 };

  // Token → corpus-key (erste Nennung gewinnt; §2-deterministisch bei Eingabefolge).
  const tokenZuKey = new Map<string, string>();
  for (const s of bg) {
    const { key } = keyVon(s);
    for (const tok of selbstTokens(s)) if (!tokenZuKey.has(tok)) tokenZuKey.set(tok, key);
  }

  const refByKey = new Map<string, EntscheidRef>();
  const artikelVon = new Map<string, Set<string>>();   // key → {'OR/41', …}
  const zitiertKeys = new Map<string, Set<string>>();   // key → {zitierte corpus-keys}
  for (const s of bg) {
    const { key } = keyVon(s);
    refByKey.set(key, refVon(s));
    const befund = artikelSchluesselMitBefund(s);
    literaturVerwurf.paare += befund.literaturVerworfen.length;
    literaturVerwurf.nennungen += befund.literaturNennungen;
    literaturVerwurf.spannen += befund.literaturSpannenZahl;
    artikelVon.set(key, befund.schluessel);
    const cited = new Set<string>();
    for (const z of s.zitierteEntscheide ?? []) {
      const tok = kanonZitat(z);
      if (!tok) continue;
      const ck = tokenZuKey.get(tok);
      if (ck && ck !== key) cited.add(ck);   // Selbstzitat nie zählen
    }
    zitiertKeys.set(key, cited);
  }

  // Entscheide je Artikel gruppieren (jeder Fall genau einmal je Artikel).
  const proArtikel = new Map<string, string[]>();
  for (const [key, arts] of artikelVon) {
    for (const a of arts) {
      const liste = proArtikel.get(a) ?? (proArtikel.set(a, []), proArtikel.get(a)!);
      liste.push(key);
    }
  }

  const out: Record<string, LeitfallRef[]> = {};
  for (const artikel of [...proArtikel.keys()].sort()) {   // stabile Schlüsselfolge
    const keys = proArtikel.get(artikel)!;
    const inSet = new Set(keys);
    const gewicht = new Map<string, number>(keys.map((k) => [k, 0]));
    // Topische In-degree: nur Zitierungen von d' ∈ S_A auf d ∈ S_A zählen.
    for (const d2 of keys) {
      for (const c of zitiertKeys.get(d2) ?? []) {
        if (inSet.has(c)) gewicht.set(c, (gewicht.get(c) ?? 0) + 1);
      }
    }
    const refs: LeitfallRef[] = keys.map((k) => ({ ...refByKey.get(k)!, gewicht: gewicht.get(k) ?? 0 }));
    refs.sort(vergleicheLeitfaelle);
    out[artikel] = refs.slice(0, LEITFAELLE_PRO_ARTIKEL);
  }
  return out;
}

/**
 * Schaufenster-Shards (Weiche B, §10(6)/§11.2): proNormArtikel je Erlass in eine
 * eigene Projektion splitten. EINE Quelle (proNormArtikel), Shards = zusätzliche
 * Projektion — das grosse norm-index.json bleibt unverändert (kein Bruch bestehender
 * Konsumenten). Nur Erlasse MIT Artikel-Treffern bekommen einen Shard. Der Schlüssel
 * im Shard ist das blosse Artikel-Token (der 'REGISTERKEY/'-Präfix steckt im Dateinamen).
 * Deterministisch (§2): Token-Schlüssel sortiert, refs unverändert aus baueArtikelIndex.
 */
export function baueShards(proNormArtikel: Record<string, LeitfallRef[]>, datum: string): Map<string, LeitfallShard> {
  const proErlass = new Map<string, Record<string, LeitfallRef[]>>();
  for (const [ak, refs] of Object.entries(proNormArtikel)) {
    const schraeg = ak.indexOf('/');           // 'OR/41' → erlass 'OR', token '41'
    const erlass = ak.slice(0, schraeg);
    const token = ak.slice(schraeg + 1);
    (proErlass.get(erlass) ?? (proErlass.set(erlass, {}), proErlass.get(erlass)!))[token] = refs;
  }
  const out = new Map<string, LeitfallShard>();
  for (const erlass of [...proErlass.keys()].sort()) {
    const roh = proErlass.get(erlass)!;
    const proArtikel: Record<string, LeitfallRef[]> = {};
    for (const t of Object.keys(roh).sort()) proArtikel[t] = roh[t];   // stabile Token-Folge
    // gewichtQuelle:'alt' = un-gebackene, kuratierte In-degree. Die V1b-Regeneration
    // (backe-rangliste-shards.ts, braucht masse.db) hebt qualifizierende Erlasse auf
    // 'e4' — nach einem norm-index-Vollbau daher erneut fahren (wie V1c-Revisionen).
    out.set(erlass, { erzeugt: datum, erlass, gewichtQuelle: 'alt', proArtikel });
  }
  return out;
}

export function schreibeKorpus(auswahl: EntscheidSnapshot[], datum: string, root = process.cwd()): { anzahl: number; normBuckets: number; artikelBuckets: number; shards: number; literaturVerwurf: { paare: number; nennungen: number; spannen: number } } {
  const PUB = join(root, 'public', 'rechtsprechung');
  const GENKEYS = join(root, 'src', 'lib', 'rechtsprechung', 'erfasste-keys.generated.ts');

  if (existsSync(PUB)) rmSync(PUB, { recursive: true, force: true });
  mkdirSync(PUB, { recursive: true });

  const manifest: BrowseEntscheid[] = [];
  const proNorm: Record<string, EntscheidRef[]> = {};

  // ── Richter-Projektion, Durchgang 1: Besetzungs-Freitexte korpusweit parsen ──
  // Die Kanonisierung («P. Schmid» → Patrizia oder Patrick?) ist nur mit Blick auf
  // den GANZEN Korpus entscheidbar, darum zwei Durchgänge (§2: deterministisch,
  // kein Raten). Der Snapshot bleibt unberührt — `rubrum.besetzung` ist und bleibt
  // der amtliche Freitext (SSoT); `richter[]` ist eine reine Projektion daraus.
  // Rubrum-Grenze säubern, BEVOR irgendetwas den Freitext liest oder schreibt.
  // Der Crawl hat in Einzelfällen über die Rubrum-Grenze hinaus eingesammelt —
  // BGE 151 IV 175 trug ein Aktenzeichen im Besetzungs-Feld («… Greffière: Mme
  // Kropf. 7B_950/2024et»). Folge war nicht bloss Rauschen: das ziffernhaltige
  // Segment fiel in den «kein sicherer Name»-Zweig, und die amtlich genannte
  // Gerichtsschreiberin fehlte vollständig. Das Aktenzeichen ist nie Teil der
  // Besetzung, der Schnitt also kein Informationsverlust (§5). Idempotent (§2) —
  // ein erneuter Lauf über bereits gesäuberte Snapshots ändert nichts.
  for (const snap of auswahl) {
    const ft = snap.rubrum?.besetzung;
    if (!ft) continue;
    const sauber = bereinigeBesetzungsFreitext(ft);
    if (sauber !== ft) snap.rubrum!.besetzung = sauber;
  }

  const besetzungRoh = new Map<string, ReturnType<typeof parseBesetzung>['richter']>();
  const kanonInput: KanonEintrag[] = [];
  for (const snap of auswahl) {
    const freitext = snap.rubrum?.besetzung ?? null;
    if (!freitext) continue;
    const res = parseBesetzung(freitext, { gericht: snap.gericht });
    if (!res.richter.length) continue;
    besetzungRoh.set(keyVon(snap).key, res.richter);
    for (const r of res.richter) {
      kanonInput.push({ slug: r.slug, nachSlug: r.nachSlug, givenSlug: r.givenSlug, givenAbk: r.givenAbk, name: r.name, raum: snap.kanton });
    }
  }
  const kanon = kanonisiere(kanonInput);
  const raumVon = new Map<string, string>(auswahl.map((s2) => [keyVon(s2).key, s2.kanton]));
  const richterCount = new Map<string, number>();

  for (const snap of auswahl) {
    const { key, datei } = keyVon(snap);
    const ziel = join(PUB, datei);
    mkdirSync(join(ziel, '..'), { recursive: true });
    // §7-Provenienz / additiver Build (Batch 3): jede Datei trägt das Abrufdatum
    // IHRES Inhalts (snap.abgerufen), nicht das globale Build-Datum. So bleibt ein
    // additiver Lauf (neue Gerichte ergänzen) für unveränderte Bestands-Snapshots
    // byte-gleich (kein Drift der 272 BGE, §6), während neue Einträge ihr echtes
    // Abrufdatum behalten. Für einen Vollbau (alle abgerufen==datum) verhaltensneutral.
    // ECLI deterministisch aus Gericht/Nummer/Datum minten (W0/R1 — schliesst die
    // Interop-Lücke; additives Identitätsfeld, lässt die abschnitte-`sha` unberührt).
    snap.ecli = minteEcliFuerSnapshot(snap);
    const wrap: EntscheidSnapshotDatei = { erzeugt: snap.abgerufen || datum, eintraege: [snap] };
    writeFileSync(ziel, serialisiere(wrap), 'utf8');

    // Regel + Begründung stehen an `manifestRegesteKurz` (§5: EINE Stelle — auch
    // regeste-kurz-refresh.ts rechnet damit, sonst löschte ein Refresh die
    // BS-Betreff-Kurzzeilen).
    const regesteKurz = manifestRegesteKurz(snap);
    manifest.push({
      key, gericht: snap.gericht, gerichtName: snap.gerichtName, gerichtstyp: snap.gerichtstyp,
      kanton: snap.kanton, nummer: snap.nummer, bgeReferenz: snap.bgeReferenz, datum: snap.datum,
      // datumUnbekannt nur projizieren, wenn gesetzt (Bestand bleibt byte-gleich, §6).
      ...(snap.datumUnbekannt ? { datumUnbekannt: true as const } : {}),
      zitierung: snap.zitierung, leitcharakter: snap.leitcharakter,
      regesteVorhanden: !!snap.regeste, regesteKurz, sachgebiet: snap.sachgebiet, sprache: snap.sprache,
      normKeys: snap.normKeys, bestand: snap.bestand, kuratierung: snap.kuratierung,
      datei, quelle: snap.quelle, quelleUrl: snap.quelleUrl, fassungsToken: snap.fassungsToken,
      ...(() => {
        const roh = besetzungRoh.get(key);
        if (!roh?.length) return {};
        const raum = raumVon.get(key) ?? snap.kanton;
        const richter: RichterRef[] = roh.map((r) => ({
          s: kanon.map.get(`${raum}|${r.slug}`) ?? r.slug,
          r: r.rolle,
        }));
        // Jeder Slug kommt ins Register (damit Block B IMMER einen Anzeigenamen
        // auflösen kann — auch für reine Gerichtsschreiber:innen). Gezählt wird
        // aber nur die RICHTER-Mitwirkung: die Facette in Block B führt
        // Gerichtsschreiber:innen nicht als Richter (eigene Achse, später).
        for (const x of richter) {
          if (!richterCount.has(x.s)) richterCount.set(x.s, 0);
          if (x.r === 'gerichtsschreiber') continue;
          richterCount.set(x.s, richterCount.get(x.s)! + 1);
        }
        return { richter };
      })(),
    });

    // Getrennter Übersichts-Eintrag (Auftrag David 26.6.): das vollständige Urteil zu
    // einem BGE als EIGENE Karte, per Deep-Link auf die BGE-Detailseite mit Voll-Ansicht
    // — KEIN Daten-/Datei-Duplikat (datei:null), keine BGE-/Norm-Doppelzählung.
    if (snap.gericht === 'bge' && snap.azaUrteil && snap.auszugAbschnitte?.length) {
      manifest.push({
        key: `${key}__voll`, gericht: 'bger', gerichtName: snap.gerichtName, gerichtstyp: 'bundesgericht',
        kanton: 'CH', nummer: snap.azaUrteil.aktenzeichen, bgeReferenz: null, datum: snap.datum,
        zitierung: `BGer ${snap.azaUrteil.aktenzeichen}`, leitcharakter: 'routine',
        regesteVorhanden: false, regesteKurz: null, sachgebiet: snap.sachgebiet, sprache: snap.sprache,
        normKeys: [], bestand: snap.bestand, kuratierung: snap.kuratierung,
        datei: null, quelle: snap.quelle, quelleUrl: snap.azaUrteil.quelleUrl ?? snap.quelleUrl,
        fassungsToken: snap.fassungsToken,
        verweis: { zielKey: key, ansicht: 'voll', bgeReferenz: snap.bgeReferenz! },
      });
    }

    // C2-4 (präzisiert Batch 3): Der Norm→Entscheid-Index speist im UI die Liste
    // «Bundesgerichtsentscheide zu diesem Erlass» (norm-index.ts → GesetzLeser).
    // Darum NUR echte Bundesgerichts-Entscheide (gerichtstyp 'bundesgericht' =
    // bge/bger). Die neuen eidg. Gerichte (BVGer/BStGer/BPatGer) sind zwar canton
    // 'CH', aber NICHT das Bundesgericht → sie würden sonst fälschlich unter dieser
    // Überschrift erscheinen (§8). Für den Bestand identisch (alle CH-Einträge sind
    // bundesgericht). Kantonale/eidg. Entscheide bleiben über die Rubrik auffindbar.
    if (snap.gerichtstyp === 'bundesgericht') {
      for (const nk of snap.normKeys) {
        // Föderal/kantonal mehrdeutige Kürzel (StG) auch erlass-eben ausschliessen
        // (gleiche OCL-orientierte Entscheidung wie Artikel-Ebene; Gegenprüfung W3 #12).
        // Der Filter greift hier auf den KEY (nicht die Abkürzung), weil ALT-Bestands-
        // Snapshots den ausgeschlossenen Key noch in `normKeys` tragen können — die
        // Erzeugerseite (normKeysVonSnapshot) lässt ihn seit W2·6-NKEY gar nicht mehr
        // entstehen, der Schutz muss aber auch ohne Backfill wirken (§1).
        if (AUSGESCHLOSSENE_KEYS.has(nk)) continue;
        (proNorm[nk] ??= []).push({
          key, zitierung: snap.zitierung, regesteKurz, datum: snap.datum,
          leitcharakter: snap.leitcharakter, gericht: snap.gericht, kanton: snap.kanton,
        });
      }
    }
  }

  for (const nk of Object.keys(proNorm)) {
    // §2-Determinismus: `key` als TOTALER Tiebreaker — sonst hängt die Reihenfolge bei
    // Gleichstand (gleicher leitcharakter + gleiches Datum) von der Build-Eingabe-
    // reihenfolge ab (Vollbau [bge,bund,kanton] vs. additiver Lauf [Register-Reihen-
    // folge] erzeugten sonst denselben Inhalt in anderer Folge). Der Komparator steht
    // benannt oben (`vergleicheEntscheidRefs`) und ist dort auf Totalität getestet —
    // hier stand er inline und war es NICHT (Bestandsfehler, Begründung dort).
    proNorm[nk].sort(vergleicheEntscheidRefs);
    proNorm[nk] = proNorm[nk].slice(0, 12);
  }

  // Stabil (V8 TimSort): bei Datums-Gleichstand bleibt die Eingangsreihenfolge —
  // im additiven Lauf die committete Register-Folge, also kein Reorder des Bestands.
  //
  // ABGRENZUNG zum K1-Fix oben (gemessen 28.7.2026): dieser Komparator ist TOTAL
  // (Gleichstand → 0), also kein Fall der dortigen Fehlerklasse. Er ist aber
  // ABSICHTLICH build-pfad-ABHÄNGIG: mit umgekehrter Eingabe entsteht dasselbe
  // register.json mit identischer Menge UND identischer Datums-Folge, aber anderer
  // Reihenfolge INNERHALB eines Datums (erste Abweichung: AUS.2026.52/53, beide
  // 2026-07-01). Die Build-Pfad-Unabhängigkeit, die dieser Branch erklärt, gilt
  // damit für norm-index.json, norm-index-erlasse.json, richter.json und alle 157
  // Shards (empirisch byte-gleich über 5093 Snapshots), NICHT für register.json.
  // Das ist gewollt: ein key-Tiebreaker hier würde den ganzen Bestand umsortieren,
  // also genau das, was diese Zeile vermeiden soll. Wer die Unabhängigkeit auch
  // hier will, entscheidet damit über einen Voll-Reorder — eigener Schritt (§14).
  manifest.sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));
  const manifestObj: EntscheidManifest = { erzeugt: datum, entscheide: manifest };
  writeFileSync(join(PUB, 'register.json'), serialisiere(manifestObj), 'utf8');
  // ── Richter-Register (Slug → Anzeigename + Trefferzahl) ──
  // Eigene, schlanke Projektion: die Facette in Block B lädt sie lazy für Labels
  // und Zähler, damit das grosse register.json slug-schlank bleibt (§15).
  // Enthält ALLE Spruchkörper-Slugs (Namensauflösung ist total); `count` zählt nur
  // die Mitwirkung als RICHTER — ein Slug mit count 0 ist reine:r Gerichtsschreiber:in
  // und gehört nicht in die Richter-Facette (§8: keine falsche Rollen-Zuschreibung).
  // Deterministisch sortiert (Slug alphabetisch), damit Re-Läufe byte-gleich sind.
  const richterEintraege: RichterRegister['richter'] = {};
  for (const slug of [...richterCount.keys()].sort()) {
    richterEintraege[slug] = {
      name: kanon.anzeige.get(slug) ?? slug,
      count: richterCount.get(slug)!,
    };
  }
  const richterObj: RichterRegister = { erzeugt: datum, richter: richterEintraege };
  writeFileSync(join(PUB, 'richter.json'), serialisiere(richterObj), 'utf8');

  // Artikel-Ebene (W3) zusätzlich zur Erlass-Ebene — proNorm bleibt inhaltlich unverändert.
  const proNormArtikel = baueArtikelIndex(auswahl);
  // §2 (Linse 3, 28.7.2026): Die SCHLÜSSELFOLGE von `proNorm` war die Einfüge-
  // reihenfolge, also die Reihenfolge der Bau-Eingabe (157 Buckets, 63 unsortierte
  // Übergänge). Vollbau und `--remap` erzeugten damit inhaltsgleiche, aber
  // BYTE-VERSCHIEDENE Dateien — genau die Abhängigkeit vom Build-Pfad, die die
  // Sortierung INNERHALB der Buckets (key als totaler Tiebreaker, oben) längst
  // ausschliesst. Die Artikel-Ebene war bereits sortiert (`baueArtikelIndex`);
  // hier wird die Erlass-Ebene nachgezogen. Codepoint-Ordnung wie überall in der
  // Kette (scripts/normtext/vergleich.ts), nicht locale-abhängig.
  const proNormSortiert: Record<string, EntscheidRef[]> = {};
  for (const nk of Object.keys(proNorm).sort(vergleiche)) proNormSortiert[nk] = proNorm[nk];
  writeFileSync(join(PUB, 'norm-index.json'), serialisiere({ erzeugt: datum, proNorm: proNormSortiert, proNormArtikel }), 'utf8');
  // ── Schlanke Laufzeit-Projektion der ERLASS-Ebene (W2·6-NKEY §15) ───────────
  // Dasselbe `proNorm`-Objekt, nur ohne die Artikel-Ebene. Grund: `kontextEntscheide()`
  // (src/lib/kontext.ts) braucht fürs Verweis-Popover NUR proNorm, zog dafür aber das
  // Gesamt-JSON über die Leitung — nach dem Backfill 731 KB gzip statt 93 KB, also das
  // ~7.8-fache an Nutzlast für unveränderte Information. §5 bleibt gewahrt: EINE Quelle
  // (proNormSortiert), zwei Projektionen; die Byte-Gleichheit der Schnittmenge prüft
  // check:entscheide. Serialisierung identisch (2-Space, Trailing-Newline, sortierte
  // Schlüssel) — sonst wäre der Konsistenz-Beweis dort nicht byte-scharf führbar.
  writeFileSync(join(PUB, 'norm-index-erlasse.json'), serialisiere({ erzeugt: datum, proNorm: proNormSortiert }), 'utf8');
  // Schaufenster-Shards je Erlass (Weiche B): zusätzliche Projektion, damit der
  // ArtikelLeser nur den Shard seines Erlasses lädt (§15.3). Trailing-Newline +
  // 2-Space wie norm-index.json/register.json (Rechtsprechungs-Serialisierung).
  const shards = baueShards(proNormArtikel, datum);
  const shardDir = join(PUB, 'norm-index');
  mkdirSync(shardDir, { recursive: true });
  for (const [erlass, shard] of shards) {
    writeFileSync(join(shardDir, `${erlass}.json`), serialisiere(shard), 'utf8');
  }

  const keys = manifest.map((m) => m.key).sort();
  writeFileSync(
    GENKEYS,
    `// AUTO-GENERIERT von scripts/normtext-entscheide.ts — nicht von Hand editieren.\n`
    + `// Erfasste Rechtsprechungs-Keys (interne Verlinkung, synchron konsultiert, Fahrplan 8.5).\n`
    + `export const ERFASST: ReadonlySet<string> = new Set([\n`
    + keys.map((k) => `  ${JSON.stringify(k)},`).join('\n')
    + (keys.length ? '\n' : '')
    + `]);\n`,
    'utf8',
  );

  return {
    anzahl: manifest.length, normBuckets: Object.keys(proNorm).length,
    artikelBuckets: Object.keys(proNormArtikel).length, shards: shards.size,
    literaturVerwurf: letzterLiteraturVerwurf(),
  };
}

/**
 * Bestehenden Korpus von der Platte laden (additiver Build, Batch 3): liest das
 * committete register.json + jede zugehörige Snapshot-Datei (nicht-Verweis) IN
 * REGISTER-REIHENFOLGE. Damit kann ein Lauf neue Gerichte ergänzen, ohne den
 * Bestand über die Live-API neu zu ziehen — die 272 BGE + 4 FR bleiben byte-gleich
 * (§2/§6, kein Drift). Verweis-Einträge werden NICHT geladen (kein File; sie werden
 * in schreibeKorpus aus azaUrteil rekonstruiert). Die Reihenfolge wird bewahrt, damit
 * schreibeKorpus den stabil sortierten Manifest unverändert reproduziert.
 */
export function ladeBestandSnapshots(root = process.cwd()): EntscheidSnapshot[] {
  const PUB = join(root, 'public', 'rechtsprechung');
  const regPfad = join(PUB, 'register.json');
  if (!existsSync(regPfad)) return [];
  const manifest = JSON.parse(readFileSync(regPfad, 'utf8')) as EntscheidManifest;
  const out: EntscheidSnapshot[] = [];
  const gesehen = new Set<string>();
  for (const e of manifest.entscheide) {
    if (e.verweis || !e.datei) continue;
    const fp = join(PUB, e.datei);
    if (!existsSync(fp)) continue;
    const d = JSON.parse(readFileSync(fp, 'utf8')) as EntscheidSnapshotDatei;
    const snap = d.eintraege?.[0];
    if (snap && !gesehen.has(snap.id)) { gesehen.add(snap.id); out.push(snap); }
  }
  return out;
}
