// ─── Tor: Sichtbarkeit der normKeys-Abdeckung (gegen stilles Verwerfen, §6.7) ──
//
// BEFUND 21.7.2026: Die Norm-Zitate der Entscheide liefen gegen eine Hand-
// Whitelist von 26 Abkürzungen. Was sie nicht kannte, wurde OHNE JEDE SPUR
// verworfen — 57 % aller Nennungen. Ein Erlass konnte im Korpus liegen und
// trotzdem nie mit der Rechtsprechung verzahnt werden, ohne dass irgendein Tor
// es meldete (Anlassfall bge_148_II_475: Kartellgesetz zitiert, KG nicht in der
// Tabelle, keine Verzahnung, kein Alarm). Genau das ist die Fehlerklasse
// «schweigendes Tor» — der Verlust ist unsichtbar, also wächst er.
//
// Dieses Tor macht den Rest sichtbar und friert ihn ein:
//   (1) ABDECKUNGS-BODEN: die gemessene Quote darf nicht unter `QUOTE_BODEN`
//       fallen. Bricht die Ableitung (Register-Import, Fedlex-Artefakt, Regex),
//       fällt die Quote — und das Tor meldet es, statt still weniger zu verzahnen.
//   (2) DEKLARATIONSPFLICHT: jede ungemappte Abkürzung mit >= `SCHWELLE`
//       Nennungen MUSS in `IGNORIEREN` mit Kategorie und Begründung stehen.
//       Neues darüber ⇒ ROT. Damit ist «wir verwerfen X bewusst» eine
//       schriftliche Aussage und keine stille Nebenwirkung.
//   (3) TOTE REGEL: ein `IGNORIEREN`-Eintrag, der inzwischen gemappt wird oder
//       im Korpus nicht mehr vorkommt, ist eine überholte Regel und wird
//       gemeldet (dieselbe Selbstreinigung wie in check-tor-paritaet.ts).
//
// NEBENPRODUKT (Kategorie 'korpus-kandidat'): eine datenbasierte, nach Häufigkeit
// sortierte Liste von Bundeserlassen, die die Rechtsprechung zitiert, die aber
// noch nicht im Korpus sind — die ehrlichste Priorisierung für den Korpus-Ausbau.
//
// Offline (§2): liest ausschliesslich die committeten Snapshots unter
// public/rechtsprechung/. Kein Netz, kein Date.now in der Bewertung.
//
//   npm run check:normkeys            → Tor
//   npm run check:normkeys -- --voll  → zusätzlich ALLE ungemappten Tokens
//
import { ladeBestandSnapshots } from './entscheide-schreiben';
import { normKeyFuerAbk, normAbk, ABK_KOLLISIONEN, ABK_TOKENS } from './entscheide-mapping';
import { extrahiereStatutRefs } from '../../src/lib/rechtsprechung/zitat-extraktion';

/**
 * Mindest-Abdeckung der Norm-Zitat-Nennungen (Pfad `statutesZuNormKeys`).
 * Basis 21.7.2026: 43.3 % mit der Hand-Whitelist. Nach der Register-Ableitung +
 * den amtlichen Fedlex-Aliasen (W2·6-NKEY): 88.9 %. Der Boden liegt bewusst
 * darunter (Luft für Korpus-Zuwachs mit neuen, noch nicht erfassten Kürzeln),
 * aber hoch genug, dass ein Bruch der Ableitung sofort auffällt.
 */
const QUOTE_BODEN = 85.0;

/** Ab dieser Nennungszahl ist eine ungemappte Abkürzung deklarationspflichtig. */
const SCHWELLE = 5;

type Grund =
  | 'kantonal'          // kantonaler/interkantonaler Erlass — nie Bundesrecht (§1)
  | 'korpus-kandidat'   // Bundeserlass, SR per Fedlex belegt, noch nicht im Korpus
  | 'ausser-korpus'     // EU/ausländisch/aufgehobener Vorgänger-Erlass — gehört nicht dazu
  | 'historisch'        // frühere Bezeichnung eines Erlasses IM Korpus (gleiche SR)
  | 'alias-luecke'      // Erlass im Korpus, aber Fedlex führt kein Kürzel dieser Sprache
  | 'mehrdeutig'        // beansprucht mehrere Erlasse (BVV 2/3) → bewusst offen
  | 'rauschen'          // keine Erlass-Abkürzung (Strukturmarker, Sammelbegriff …)
  | 'unklar';           // Identität nicht belegbar → bewusst nicht verzahnt (§8)

/**
 * Deklarierte Ignore-Liste. Jeder Eintrag ist eine bewusste Aussage: «diese
 * Nennungen werden nicht verzahnt, und zwar aus diesem Grund».
 *
 * Klassifikation 28.7.2026. Belegweg (§7, keine Substring-Vermutung): (a) die
 * Roh-Zitate des Korpus wurden je Token gelesen (Artikelnummern + Sprache +
 * Entscheid-Kontext), (b) jedes als Bundeserlass eingeordnete Token ist gegen
 * `jolux:titleShort` der Fedlex-Metadaten geprüft — die SR-Nummer im Hinweis
 * stammt aus dieser Abfrage, nicht aus dem Gedächtnis. Wo (a) und (b) keine
 * eindeutige Identität ergaben, steht 'unklar' — nicht eine plausible Vermutung.
 */
const IGNORIEREN: ReadonlyMap<string, { grund: Grund; hinweis: string }> = new Map<string, { grund: Grund; hinweis: string }>([
  // ── keine Norm-Referenz ──────────────────────────────────────────────────────
  ['BGE', { grund: 'rauschen', hinweis: 'Entscheid-, keine Norm-Referenz («Art. 127 BGE» = Fehlparse einer BGE-Nennung)' }],
  ['VO', { grund: 'rauschen', hinweis: 'Sammelbezeichnung «Verordnung» bzw. EU-«VO (EG) Nr. …», kein bestimmter Erlass' }],
  ['VE', { grund: 'rauschen', hinweis: '«VE» = Vorentwurf (Gesetzgebungs-Material), kein geltender Erlass (Beleg: «Art. 187a VE», BGE 148 IV 329)' }],
  ['SCHLT', { grund: 'rauschen', hinweis: '«SchlT» = Schlusstitel des ZGB — Gliederungsbezeichnung innerhalb des ZGB, kein eigener Erlass' }],
  ['OECD', { grund: 'ausser-korpus', hinweis: 'OECD-Musterabkommen/Kommentar — kein schweizerischer Erlass' }],
  ['«kein Kürzel am Zitat-Ende»', { grund: 'rauschen', hinweis: 'Zitat endet nicht auf Buchstaben («Art. 1 Abs. 1 LCO2», «Art. 60 BVV 2») — Pfad 1 findet dort kein Kürzel; erfasst wird der Fall über den Zitat-Parser (Pfad 2)' }],

  // ── mehrdeutig: das Token beansprucht mehrere Erlasse (§1: lieber offen) ─────
  ['BVV', { grund: 'mehrdeutig', hinweis: 'BVV 2 (SR 831.441.1) oder BVV 3 (SR 831.461.3)?' }],
  ['OPP', { grund: 'mehrdeutig', hinweis: 'FR/IT von BVV 2/BVV 3 — und amtliches FR-Kürzel von SR 281.41' }],
  ['OPC', { grund: 'mehrdeutig', hinweis: 'amtliches FR-Kürzel von SR 281.41 UND Kurzform des amtlichen «OPC-AVS/AI» (ELV, SR 831.301)' }],
  ['GEBV', { grund: 'mehrdeutig', hinweis: 'GebV SchKG (281.35), GebV-HReg (221.411.1) oder eine kantonale Gebührenverordnung?' }],

  // ── frühere Bezeichnung eines Erlasses, der im Korpus liegt ─────────────────
  ['AUG', { grund: 'historisch', hinweis: 'AuG = frühere Bezeichnung des AIG (dieselbe SR 142.20, Umbenennung 1.1.2019); Fedlex führt nur die geltende Kurzbezeichnung — ein Hand-Alias wäre eine zweite Wahrheit (§5/§7)' }],
  ['LETR', { grund: 'historisch', hinweis: 'LEtr = französische Vorgänger-Bezeichnung des AIG (SR 142.20), siehe AUG' }],

  // ── Erlass im Korpus, aber Fedlex führt kein Kürzel dieser Sprache ──────────
  ['CV', { grund: 'alias-luecke', hinweis: 'FR/IT «Convention/Convenzione de Vienne» = VRK (SR 0.111, im Korpus); Fedlex führt für 0.111 keinen titleShort (Beleg: Art. 31/32 CV = Auslegungsregeln VRK)' }],

  // ── aufgehobene Vorgänger-Erlasse / EU- und Vertragsrecht ausserhalb ────────
  ['OG', { grund: 'ausser-korpus', hinweis: 'Bundesrechtspflegegesetz, aufgehoben 1.1.2007 (eigenständiger Vorgänger-Erlass des BGG, nicht bloss umbenannt) — Fedlex: titleShort «OG» zu SR 173.110 mit dateNoLongerInForce 2007-01-01' }],
  ['AMWSTG', { grund: 'ausser-korpus', hinweis: 'aMWSTG = das per 1.1.2010 aufgehobene MWSTG von 1999; die Nennung meint gerade das ALTE Recht und darf nie auf das geltende MWSTG zeigen (§1)' }],
  ['AEUV', { grund: 'ausser-korpus', hinweis: 'EU-Primärrecht (Vertrag über die Arbeitsweise der EU)' }],
  ['EUGVVO', { grund: 'ausser-korpus', hinweis: 'EU-Verordnung (Brüssel Ia/EuGVVO) — im Register nur als nur-live-link-Eintrag BRUESSEL_IA ohne SR' }],
  ['TCE', { grund: 'ausser-korpus', hinweis: 'Energiecharta-Vertrag (multilateral); Fedlex führt kein Kürzel «TCE» — ohne amtlichen Alias nicht verzahnbar' }],
  ['DBA', { grund: 'ausser-korpus', hinweis: 'Sammelbezeichnung der Doppelbesteuerungsabkommen — je Staat ein eigener Staatsvertrag, kein einzelner Erlass' }],
  ['CDI', { grund: 'ausser-korpus', hinweis: 'FR/IT-Sammelbezeichnung der Doppelbesteuerungsabkommen, siehe DBA' }],
  ['CIAP', { grund: 'ausser-korpus', hinweis: 'interkantonale Vereinbarung über das öffentliche Beschaffungswesen (IVöB); die Fedlex-Einträge 172.056.4/.5 sind seit 2005 aufgehoben' }],

  // ── kantonal / interkantonal (nie Bundesrecht, §1) ──────────────────────────
  ['GE', { grund: 'kantonal', hinweis: 'Kantons-Suffix genferischer Erlasse («LOJ/GE», «RPR/GE», «LTVTC/GE»)' }],
  ['VD', { grund: 'kantonal', hinweis: 'Kantons-Suffix waadtländischer Erlasse («RLUL/VD»)' }],
  ['ZH', { grund: 'kantonal', hinweis: 'Kantons-Suffix zürcherischer Erlasse («KV/ZH»)' }],
  ['TI', { grund: 'kantonal', hinweis: 'Kantons-Suffix tessiner Erlasse («LT/TI»)' }],
  ['BE', { grund: 'kantonal', hinweis: 'Kantons-Suffix bernischer Erlasse («VRPG/BE», «KV/BE», «POLG/BE»)' }],
  ['SH', { grund: 'kantonal', hinweis: 'Kantons-Suffix schaffhauser Erlasse («KV/SH»)' }],
  ['SG', { grund: 'kantonal', hinweis: 'Kantons-Suffix st. gallischer Erlasse («KV/SG»)' }],
  ['OW', { grund: 'kantonal', hinweis: 'Kantons-Suffix obwaldner Erlasse («VWVV/OW»)' }],
  ['KVZH', { grund: 'kantonal', hinweis: 'Kantonsverfassung ZH' }],
  ['KVSH', { grund: 'kantonal', hinweis: 'Kantonsverfassung SH' }],
  ['VRPG', { grund: 'kantonal', hinweis: 'kantonale Verwaltungsrechtspflegegesetze (BE, AG, …)' }],
  ['LCOMPSGE', { grund: 'kantonal', hinweis: 'genferisches Gesetz («LCOMPS/GE»)' }],
  ['LGEPA', { grund: 'kantonal', hinweis: 'genferisches Gesetz (kein Fedlex-Treffer; Beleg BGE 149 I 329, fr)' }],
  ['LIPAD', { grund: 'kantonal', hinweis: 'genferisches Informations-/Datenschutzgesetz (Beleg BGE 148 II 16, fr)' }],
  ['LEDP', { grund: 'kantonal', hinweis: 'genferisches Gesetz über die Ausübung der politischen Rechte (Beleg BGE 150 I 204, fr)' }],
  ['LPS', { grund: 'kantonal', hinweis: 'kantonales Polizeigesetz (Beleg BGE 151 I 177, fr: Art. 4/23/60); das gleichlautende IT-Kürzel von SR 704 passt nicht — dort gibt es keinen Art. 23' }],
  ['IVSE', { grund: 'kantonal', hinweis: 'Interkantonale Vereinbarung für soziale Einrichtungen — interkantonales Konkordat' }],

  // ── Bundeserlasse, die (noch) nicht im Korpus sind: Ausbau-Kandidaten ───────
  //    SR-Nummern aus jolux:titleShort (Fedlex-SPARQL, Abruf 28.7.2026).
  ['ZUG', { grund: 'korpus-kandidat', hinweis: 'Zuständigkeitsgesetz, SR 851.1 (Fedlex DEU «ZUG»)' }],
  ['LAS', { grund: 'korpus-kandidat', hinweis: 'FR/IT-Kürzel desselben Erlasses SR 851.1 (Fedlex FRA/ITA «LAS»)' }],
  ['STAHIG', { grund: 'korpus-kandidat', hinweis: 'Steueramtshilfegesetz, SR 651.1 (Fedlex DEU «StAhiG»)' }],
  ['LAAF', { grund: 'korpus-kandidat', hinweis: 'FR/IT-Kürzel desselben Erlasses SR 651.1 (Fedlex FRA/ITA «LAAF»)' }],
  ['STROMVG', { grund: 'korpus-kandidat', hinweis: 'Stromversorgungsgesetz, SR 734.7 (Fedlex DEU «StromVG»)' }],
  ['AVG', { grund: 'korpus-kandidat', hinweis: 'Arbeitsvermittlungsgesetz, SR 823.11 (Fedlex DEU «AVG»)' }],
  ['LSE', { grund: 'korpus-kandidat', hinweis: 'FR-Kürzel desselben Erlasses SR 823.11 (Fedlex FRA «LSE»)' }],
  ['LRTV', { grund: 'korpus-kandidat', hinweis: 'FR/IT-Kürzel des RTVG, SR 784.40 (Fedlex FRA/ITA «LRTV»)' }],
  ['SRVG', { grund: 'korpus-kandidat', hinweis: 'Gesetz über gesperrte Vermögenswerte, SR 196.1 (Fedlex DEU «SRVG»)' }],
  ['LVA', { grund: 'korpus-kandidat', hinweis: 'Nationalstrassenabgabe/Autobahnvignette, SR 741.71 (Fedlex FRA «LVA»)' }],
  ['PRSG', { grund: 'korpus-kandidat', hinweis: 'Produktesicherheitsgesetz, SR 930.11 (Fedlex DEU «PrSG»)' }],
  ['AUFRBGER', { grund: 'korpus-kandidat', hinweis: 'Aufsichtsreglement des Bundesgerichts, SR 173.110.132 (Fedlex DEU «AufRBGer»)' }],
  ['AVEG', { grund: 'korpus-kandidat', hinweis: 'Allgemeinverbindlicherklärung von GAV, SR 221.215.311 (Fedlex DEU «AVEG»)' }],
  ['ENV', { grund: 'korpus-kandidat', hinweis: 'Energieverordnung, SR 730.01 (Fedlex DEU «EnV»)' }],
  ['LFH', { grund: 'korpus-kandidat', hinweis: 'FR-Kürzel des WRG (Wasserrechtsgesetz), SR 721.80 (Fedlex FRA «LFH»)' }],
  ['BPI', { grund: 'korpus-kandidat', hinweis: 'Bundesgesetz über die polizeilichen Informationssysteme, SR 361 (Fedlex DEU «BPI»)' }],
  ['BZP', { grund: 'korpus-kandidat', hinweis: 'Bundesgesetz über den Bundeszivilprozess, SR 273 (Fedlex DEU «BZP»)' }],
  ['LTEO', { grund: 'korpus-kandidat', hinweis: 'FR/IT-Kürzel des WPEG (Wehrpflichtersatzabgabe), SR 661 (Fedlex FRA/ITA «LTEO»)' }],
  ['NSG', { grund: 'korpus-kandidat', hinweis: 'Nationalstrassengesetz, SR 725.11 (Fedlex DEU «NSG»)' }],
  ['TSCHG', { grund: 'korpus-kandidat', hinweis: 'Tierschutzgesetz, SR 455 (Fedlex DEU «TSchG»)' }],
  ['LPA', { grund: 'korpus-kandidat', hinweis: 'FR-Kürzel desselben Erlasses SR 455 (Fedlex FRA «LPA»); Beleg: BGE 151 II 254 zitiert TSCHG und LPA nebeneinander' }],
  ['WG', { grund: 'korpus-kandidat', hinweis: 'Waffengesetz, SR 514.54 (Fedlex DEU «WG»)' }],
  ['ZG', { grund: 'korpus-kandidat', hinweis: 'Zollgesetz, SR 631.0 (Fedlex DEU «ZG»)' }],
  ['ZV', { grund: 'korpus-kandidat', hinweis: 'Zollverordnung, SR 631.01 (Fedlex DEU «ZV»)' }],

  // ── Identität nicht belegbar — bewusst offen statt geraten (§8) ─────────────
  ['ABV', { grund: 'unklar', hinweis: 'kein geltendes Fedlex-Kürzel «ABV» (SR 952.111 seit 1997 aufgehoben); Belege BGE 151 II 466 / 149 III 355 lassen die Identität offen' }],
  ['RBG', { grund: 'unklar', hinweis: 'nur BGE 149 III 400 (Art. 51/52); kein Fedlex-Treffer' }],
  ['VKEV', { grund: 'unklar', hinweis: 'nur BGE 150 II 153 (Art. 1/2/13); kein Fedlex-Treffer' }],
  ['LTPUB', { grund: 'unklar', hinweis: 'nur BGE 147 I 16 (it, Art. 35–35d); kein Fedlex-Treffer' }],
]);

const args = process.argv.slice(2);
const voll = args.includes('--voll');

interface Zaehler { nennungen: number; gemappt: number }

function main(): void {
  const snaps = ladeBestandSnapshots(process.cwd());
  if (!snaps.length) {
    console.error('[check:normkeys] Keine Snapshots gefunden — Korpus nicht gebaut?');
    process.exit(1);
  }

  // ── Pfad 1: statutesZuNormKeys (speist snap.normKeys → Erlass-Ebene) ──
  const p1: Zaehler = { nennungen: 0, gemappt: 0 };
  // ── Pfad 2: extrahiereStatutRefs (speist den Artikel-Index/die Shards) ──
  const p2: Zaehler = { nennungen: 0, gemappt: 0 };
  // Ungemappte Tokens je Pfad getrennt gezählt; die Häufigkeit eines Tokens ist
  // das MAXIMUM beider Pfade (nicht die Summe — dieselbe Nennung wird von beiden
  // Pfaden gesehen, eine Summe verdoppelte sie und verfälschte die Schwelle).
  const ungemapptP1 = new Map<string, number>();
  const ungemapptP2 = new Map<string, number>();
  const beleg = new Map<string, string>();       // Token → erstes Roh-Zitat (Identitätsbeleg)

  const merke = (wo: Map<string, number>, token: string, roh: string, id: string): void => {
    wo.set(token, (wo.get(token) ?? 0) + 1);
    if (!beleg.has(token)) beleg.set(token, `${id} :: ${roh}`);
  };

  for (const s of snaps) {
    const rohListe = s.zitierteNormen ?? [];
    for (const roh of rohListe) {
      const txt = String(roh).trim();
      p1.nennungen++;
      const m = /([A-Za-zÄÖÜäöü]{2,})\s*$/.exec(txt);
      const abk = m?.[1] ?? null;
      if (abk && normKeyFuerAbk(abk)) p1.gemappt++;
      else merke(ungemapptP1, abk ? normAbk(abk) : '«kein Kürzel am Zitat-Ende»', txt, s.id);
    }
    // Pfad 2 arbeitet auf demselben Rohtext, aber mit dem vollen Zitat-Parser —
    // er findet Codes, die am Zeilenende nicht stehen («Art. 60 Abs. 1 BVV 2»).
    for (const ref of extrahiereStatutRefs(rohListe.join('\n'))) {
      p2.nennungen++;
      if (normKeyFuerAbk(ref.gesetz)) p2.gemappt++;
      else merke(ungemapptP2, normAbk(ref.gesetz), ref.raw, s.id);
    }
  }

  const ungemappt = new Map<string, number>();
  for (const t of new Set([...ungemapptP1.keys(), ...ungemapptP2.keys()])) {
    ungemappt.set(t, Math.max(ungemapptP1.get(t) ?? 0, ungemapptP2.get(t) ?? 0));
  }

  const quote = (z: Zaehler) => (z.nennungen ? (z.gemappt / z.nennungen) * 100 : 0);
  const q1 = quote(p1);

  console.log(`[check:normkeys] ${snaps.length} Entscheide · ${ABK_TOKENS.size} gemappte Abkürzungs-Tokens · ${ABK_KOLLISIONEN.size} Kollisions-Tokens (bewusst offen)`);
  console.log(`[check:normkeys] Pfad statutes→normKeys : ${p1.gemappt}/${p1.nennungen} = ${q1.toFixed(1)} % (Boden ${QUOTE_BODEN.toFixed(1)} %)`);
  console.log(`[check:normkeys] Pfad Zitat-Parser      : ${p2.gemappt}/${p2.nennungen} = ${quote(p2).toFixed(1)} %`);
  if (ABK_KOLLISIONEN.size) {
    for (const [t, keys] of [...ABK_KOLLISIONEN].sort()) console.log(`                 KOLLISION ${t} → ${keys.join(', ')} (nicht gemappt, §1)`);
  }

  const fehler: string[] = [];
  if (q1 < QUOTE_BODEN) {
    fehler.push(`Abdeckungs-Boden unterschritten: ${q1.toFixed(1)} % < ${QUOTE_BODEN.toFixed(1)} % — die Ableitung (Register/Fedlex-Artefakt/Regex) ist beschädigt oder ein grosser Erlass fehlt.`);
  }

  // (2) Deklarationspflicht oberhalb der Schwelle.
  const sortiert = [...ungemappt.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const undeklariert = sortiert.filter(([t, n]) => n >= SCHWELLE && !IGNORIEREN.has(t));
  for (const [t, n] of undeklariert) {
    fehler.push(
      `ungemappte Abkürzung '${t}' mit ${n} Nennungen ist nicht deklariert.\n`
      + `      Beleg: ${beleg.get(t)}\n`
      + `      → entweder den Erlass in src/lib/normtext/register.ts aufnehmen (dann mappt er automatisch),\n`
      + `      → oder in IGNORIEREN (scripts/normtext/check-normkeys.ts) mit Kategorie + Grund eintragen.`);
  }

  // (3) Tote Regeln.
  for (const [t, e] of IGNORIEREN) {
    if (normKeyFuerAbk(t)) {
      fehler.push(`IGNORIEREN['${t}'] ist überholt: das Token mappt inzwischen auf ${normKeyFuerAbk(t)} — Eintrag streichen (alter Grund: ${e.grund}).`);
    } else if (!ungemappt.has(t)) {
      fehler.push(`IGNORIEREN['${t}'] kommt im Korpus nicht (mehr) vor — tote Regel, Eintrag streichen (Grund: ${e.grund}).`);
    }
  }

  // Nebenprodukt: Korpus-Kandidaten nach Häufigkeit (ehrliche Ausbau-Priorität).
  const kandidaten = sortiert.filter(([t]) => IGNORIEREN.get(t)?.grund === 'korpus-kandidat');
  if (kandidaten.length) {
    console.log(`[check:normkeys] Korpus-Kandidaten (zitiert, aber nicht im Korpus) — ${kandidaten.length}:`);
    for (const [t, n] of kandidaten) console.log(`                 ${String(n).padStart(4)}  ${t}  — ${IGNORIEREN.get(t)!.hinweis}`);
  }

  if (voll) {
    console.log(`[check:normkeys] ALLE ungemappten Tokens (${sortiert.length}):`);
    for (const [t, n] of sortiert) {
      const e = IGNORIEREN.get(t);
      console.log(`                 ${String(n).padStart(4)}  ${t}${e ? `  [${e.grund}]` : '  <<< NICHT DEKLARIERT'}   | ${beleg.get(t)}`);
    }
  } else {
    const rest = sortiert.filter(([, n]) => n < SCHWELLE).length;
    console.log(`[check:normkeys] ungemappte Tokens: ${sortiert.length} (davon ${rest} unter der Schwelle ${SCHWELLE}; --voll zeigt alle)`);
  }

  if (fehler.length) {
    console.error(`[check:normkeys] ROT — ${fehler.length} Beanstandung(en):`);
    for (const f of fehler) console.error(`  · ${f}`);
    process.exit(1);
  }
  console.log('[check:normkeys] OK.');
}

main();
