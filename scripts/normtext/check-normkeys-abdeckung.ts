/**
 * check:normkeys — Sichtbarkeits-Tor der normKeys-Abdeckung (W2·6-NKEY c).
 *
 * ANLASS. Die Verzahnung Rechtsprechung ↔ Gesetz hängt an genau einer
 * Zuordnung: Gesetzes-Abkürzung im Urteil → Register-key. Was diese Zuordnung
 * NICHT trifft, verschwindet lautlos — kein Fehler, kein Log, nur ein Leitfall,
 * der beim Artikel nie erscheint. Der Anlassfall der Bau-Einheit: BGE 152 III 137
 * nennt das IPRG 68-mal, die frühere Hand-Whitelist kannte es nicht, und niemand
 * hätte es je bemerkt. Für stilles Verwerfen gilt CLAUDE.md §6.7 — dieses Tor
 * macht die Lücke messbar, statt sie zu vermuten.
 *
 * WAS GEMESSEN WIRD. Über den committeten Korpus (`ladeBestandSnapshots`) werden
 * je Snapshot dieselben Kandidaten-Token gebildet, die auch der Produktpfad
 * bildet (§5 — keine zweite Zerlegung, sonst misst das Tor etwas anderes als es
 * prüfen soll):
 *   (a) statutes-Pfad   — Trailing-Token je Roh-Zeile aus `zitierteNormen`,
 *                         über `abkVonStatut` (dieselbe Funktion, die
 *                         `statutesZuNormKeys` benutzt);
 *   (b) Fliesstext-Pfad — `ref.gesetz` aus `extrahiereStatutRefs(fliesstextVon(snap))`.
 * Jedes Token wird mit `normalisiereAbk` normalisiert und einer von drei Klassen
 * zugeordnet: GEMAPPT (`normKeyFuerAbk` ≠ null), AUSGESCHLOSSEN (steht in
 * `ABK_AUSSCHLUSS` — bewusste Lücke, zählt NICHT als ungemappt, wird aber
 * sichtbar ausgewiesen) oder UNGEMAPPT.
 *
 * SCHWELLE = 20 SNAPSHOTS, datenbasiert (Messung 28.7.2026, 5'093 Snapshots).
 * Häufigkeit ist bewusst die SNAPSHOT-Frequenz (in wie vielen Entscheiden kommt
 * das Token vor), nicht die Zahl der Nennungen: ein einziges Urteil, das «LTF»
 * 60-mal zitiert, ist ein Fall, kein Muster — die Nennungs-Zählung würde von
 * solchen Ausreissern dominiert. Verteilung der ungemappten Token nach
 * Snapshot-Frequenz: ≥3 → 312, ≥5 → 177, ≥10 → 92, ≥15 → 58, ≥20 → 46,
 * ≥30 → 33, ≥50 → 19. Die Kurve hat keinen natürlichen Knick; 20 (≈0.4 % des
 * Korpus) ist die Grenze, ab der eine Abkürzung systematisch auftritt statt
 * vereinzelt, und sie ist die Grenze, bis zu der JEDER Ignore-Eintrag unten
 * einzeln am Korpus-Beleg verifiziert werden konnte. Das ist der Preis der
 * Regel «kein Eintrag ohne geprüfte Begründung» (§7): lieber eine höhere
 * Schwelle mit 12 belegten Einträgen als eine tiefere mit geratenen. Ein
 * Absenken auf 10 ist möglich, seit die FR/IT-Amtskürzel gemappt sind (die
 * Restliste ist klein genug zum Verifizieren) — es bleibt aber ein EIGENER
 * Schritt: jedes Token zwischen 10 und 20 will einzeln am Korpus belegt sein,
 * bevor es in die Ignore-Tabelle darf.
 *
 * DAS TOR WAR BEI SEINER EINFÜHRUNG ROT, UND DAS WAR KORREKT (§6.7). Über der
 * Schwelle standen 34 französische und italienische AMTSKÜRZEL desselben
 * Bundesrechts (LTF/CST/COST = BGG/BV, CP/CPP/CPC/CC/CO, LP/LEF, CEDH/CEDU …).
 * Sie waren keine Lücke im Register, sondern eine fehlende Alias-Ebene; sie
 * gehörten darum ausdrücklich NICHT in die Ignore-Tabelle, sondern in die
 * Rot-Liste. Ein Tor, das man grün macht, indem man die offene Arbeit in seine
 * Ausnahmeliste schreibt, hätte den Zweck verfehlt.
 *
 * W2·6-NKEY Baustein b (amtliche Fedlex-Kürzel als generiertes Alias-Artefakt)
 * hat sie abgeräumt: gemessen am selben Korpus stieg die gemappte Quote von
 * 76.8 % auf 93.6 % der Nennungen, und die Rot-Liste ab 20 Snapshots schrumpfte
 * von 46 auf genau die 12 unten deklarierten Ignore-Einträge (Messung
 * 28.7.2026, 5'093 Snapshots). Alle 34 Token wurden GEMAPPT, keines wurde
 * ignoriert — der Unterschied ist der ganze Punkt dieses Tors.
 *
 * NICHT geprüft: ob eine gemappte Zuordnung fachlich RICHTIG ist. Das Tor zählt
 * Abdeckung, nicht Wahrheit. Falsch-Zuordnungen sind die Zuständigkeit des
 * Ausschlusses (`ABK_AUSSCHLUSS`) und der fachlichen Abnahme (§7).
 *
 * Offline, deterministisch (§2): liest nur committete Artefakte, sortiert jede
 * Ausgabe, kein Netz, kein Datums-Zugriff in der Prüflogik.
 * Aufruf: vite-node scripts/normtext/check-normkeys-abdeckung.ts
 */
import { ladeBestandSnapshots } from './entscheide-schreiben';
import {
  ABK_ALIAS_AUSGESCHLOSSEN,
  ABK_ALIAS_NOTIZEN,
  ABK_AUSSCHLUSS,
  ABK_KOLLISIONEN,
  abkVonStatut,
  fliesstextVon,
  normKeyFuerAbk,
  normalisiereAbk,
} from './entscheide-mapping';
import { ABK_ALIASE } from '../../src/lib/normtext/abk-aliase.generated';
import { extrahiereStatutRefs } from '../../src/lib/rechtsprechung/zitat-extraktion';

/** Snapshot-Frequenz, ab der ein ungemapptes Token das Tor rot macht. */
const SCHWELLE = 20;

type Grund = 'kantonal' | 'ausserhalb-korpus' | 'rauschen' | 'aufgehoben';

interface IgnoreEintrag {
  grund: Grund;
  kommentar: string;
  /**
   * SR-Nummer, wenn das Token nachweislich einen BUNDES-Erlass bezeichnet, der
   * (noch) nicht im ERLASS_REGISTER steht. Nur solche Einträge erscheinen unten
   * als KORPUS-KANDIDATEN — die Liste ist damit deklariert und nicht geraten.
   */
  srNummer?: string;
}

/**
 * Ungemappte Token über der Schwelle, deren Nicht-Zuordnung BEGRÜNDET ist.
 *
 * Jeder Eintrag ist am Korpus-Beleg verifiziert (§7) — die Belegstelle steht im
 * Kommentar. «Kommt oft vor» ist keine Begründung; die Frage, die ein Eintrag
 * beantworten muss, lautet: warum ist es RICHTIG, dass dieses Zitat keinen
 * Register-key bekommt?
 *
 * KEINE FR/IT-Amtskürzel hier (siehe Kopf): die sind offene Arbeit, keine
 * Ausnahme.
 */
const IGNORE: Record<string, IgnoreEintrag> = {
  // ── kantonal ──────────────────────────────────────────────────────────────
  VRPG: {
    grund: 'kantonal',
    kommentar:
      'Gesetz über die Verwaltungsrechtspflege — kantonaler Erlass (BE: BSG 155.21; '
      + 'gleichlautend AG/TG/AR). Belege ausschliesslich aus kantonalen Entscheiden, '
      + 'z.B. kanton/BE/be_verwaltungsgericht/200202645 «Art. 79 Abs. 1 VRPG», '
      + '«Art. 32 Abs. 2 VRPG». Ein Bundes-key wäre hier schlicht falsch (§1).',
  },

  // ── ausserhalb des Korpus (EU-Recht / Bundeserlass ohne Register-Eintrag) ──
  RL: {
    grund: 'ausserhalb-korpus',
    kommentar:
      'Abgeschnittener Rest von «RL 2008/115/EG» (EU-Rückführungsrichtlinie) — der '
      + 'Extraktor endet vor der Zahlenkennung. Beleg kanton/BS/bs_appellationsgericht/'
      + 'AUS.2026.55: «… soweit diese mit der gebotenen Sorgfalt vorangetrieben werden '
      + '(vgl. Art. 15 Abs. 1 RL 2008/115/EG)». EU-Recht ist kein Schweizer Erlass und '
      + 'gehört nicht ins ERLASS_REGISTER.',
  },
  SIS: {
    grund: 'ausserhalb-korpus',
    kommentar:
      'Abgeschnittener Rest von «SIS-II-Verordnung» ((EG) Nr. 1987/2006) — der '
      + 'Extraktor bricht am Bindestrich ab. Beleg kanton/BS/bs_appellationsgericht/'
      + 'SB.2024.39: «Damit wird dem in Art. 21 SIS-II-Verordnung verankerten '
      + 'Verhältnismässigkeitsprinzip Rechnung getragen.» EU-Recht, kein Schweizer '
      + 'Erlass. (Die schweizerische N-SIS-Verordnung SR 362.0 ist ein ANDERER Erlass '
      + 'und wird in denselben Entscheiden ausgeschrieben zitiert.)',
  },
  VO: {
    grund: 'ausserhalb-korpus',
    kommentar:
      'Abgeschnittener Rest von «VO (Nr.) 883/2004» (EU-Verordnung zur Koordinierung '
      + 'der Systeme der sozialen Sicherheit). Belege: bund/bge/151_V_315 «Art. 11 '
      + 'Abs. 3 lit. e VO 883/2004»; kanton/BS/bs_sozialversicherungsgericht/KV.2024.4 '
      + '«gemäss Art. 11 VO Nr. 883/2004 in Verbindung mit Art. 23 VO Nr. 883/2004». '
      + 'EU-Recht; daneben Restnutzung als blosses Wort «Verordnung» ohne Erlass-'
      + 'Identität — in beiden Lesarten nicht zuordenbar.',
  },
  BZP: {
    grund: 'ausserhalb-korpus',
    srNummer: '273',
    kommentar:
      'Bundesgesetz vom 4. Dezember 1947 über den Bundeszivilprozess (BZP), SR 273 — '
      + 'echter Bundeserlass, aber (noch) NICHT im ERLASS_REGISTER. Beleg amtlich im '
      + 'Korpus: bund/bge/148_I_33 «… Bestimmungen des Bundesgesetzes vom 4. Dezember '
      + '1947 über den Bundeszivilprozess (BZP; SR 273)». Darum Korpus-Kandidat, nicht '
      + 'Rauschen: die Lücke schliesst man durch Aufnahme des Erlasses, nicht durch '
      + 'ein Alias.',
  },
  WG: {
    grund: 'ausserhalb-korpus',
    srNummer: '514.54',
    kommentar:
      'Waffengesetz (WG), SR 514.54 — echter Bundeserlass, (noch) nicht im '
      + 'ERLASS_REGISTER. Beleg im Korpus: public/normtext/struktur/kanton/AR-524.2 '
      + 'zitiert «Waffengesetz (WG; SR 514.54)»; Anwendungsfälle z.B. bund/bge/'
      + '152_IV_107 «Art. 33 Abs. 1 lit. a WG». Korpus-Kandidat.',
  },

  // ── aufgehobenes / abgelöstes Recht ───────────────────────────────────────
  OG: {
    grund: 'aufgehoben',
    kommentar:
      'Bundesgesetz vom 16. Dezember 1943 über die Organisation der Bundesrechtspflege '
      + '(OG) — aufgehoben per 1.1.2007 durch das BGG. Beleg amtlich in unserem eigenen '
      + 'Snapshot public/normtext/bund/BGG.json (Aufhebung bisherigen Rechts): '
      + '«… über die Organisation der Bundesrechtspflege wird aufgehoben.» Die Zitate '
      + 'sind altrechtliche Verweise (bund/bge/151_II_657 «Art. 87 Abs. 1 OG»); ein '
      + 'Link auf geltendes Recht gäbe es nicht (§7: massgeblich ist die geltende Fassung).',
  },
  AUG: {
    grund: 'aufgehoben',
    kommentar:
      'Bundesgesetz über die Ausländerinnen und Ausländer (AuG), SR 142.20 — die '
      + 'Bezeichnung ist per 1.1.2019 durch AIG abgelöst (gleiche SR-Nummer). Beleg '
      + 'aus dem Korpus: «… Ausländergesetzes (AuG; seit 1. Januar 2019 Ausländer- und '
      + 'Integrationsgesetz, AIG, SR 142.20) …». Eine Zuordnung AuG → AIG wäre '
      + 'vertretbar, ist aber eine FACHLICHE Entscheidung über altrechtliche Zitate '
      + '(die zitierte Fassung ist nicht die geltende) und kein Register-Fakt — bis '
      + 'zum Entscheid darüber bewusst ungemappt (§7/§8).',
  },
  ABV: {
    grund: 'aufgehoben',
    kommentar:
      '«aBV» = Bundesverfassung vom 29. Mai 1874, abgelöst durch die BV vom 18.4.1999. '
      + 'Belege bund/bge/151_I_314: «Art. 27 Abs. 3 aBV», «seit dem Inkrafttreten von '
      + 'Art. 4 Abs. 2 aBV». Die Artikel-Nummern sind NICHT deckungsgleich mit der '
      + 'geltenden BV — ein Mapping auf BV zeigte auf den falschen Artikel (§1).',
  },
  ASTGB: {
    grund: 'aufgehoben',
    kommentar:
      '«aStGB» = die im Tatzeitpunkt geltende ältere Fassung des StGB (lex mitior, '
      + 'Art. 2 Abs. 2 StGB), kein eigener Erlass. Belege kanton/BS/bs_appellations'
      + 'gericht/SB.2024.69 «Art. 285 Ziff. 1 aStGB», bund/bge/152_IV_14 «Art. 259 '
      + 'Abs. 1 aStGB». Der Snapshot führt nur die GELTENDE Fassung; die «Ziff.»-'
      + 'Gliederung der Alt-Fassung existiert dort nicht mehr — ein Mapping auf StGB '
      + 'verlinkte auf einen anderen Normtext als den zitierten (§7).',
  },

  // ── Rauschen (Extraktions-Artefakt, kein Erlass) ──────────────────────────
  BGE: {
    grund: 'rauschen',
    kommentar:
      'Artefakt der Roh-Drittextraktion (OCL statutes[]): Zeilen der Form «Art. 127 '
      + 'BGE» (bund/bge/152_II_98, neben korrektem «Art. 127 Abs. 2 CST» derselben '
      + 'Liste). BGE ist die amtliche Entscheid-SAMMLUNG, kein Erlass — hier ist die '
      + 'Nicht-Zuordnung das richtige Ergebnis. Ausschliesslich statutes-Pfad '
      + '(Fliesstext-Nennungen: 0), was die Herkunft bestätigt.',
  },
  BVV: {
    grund: 'rauschen',
    kommentar:
      'Abgeschnittene Form von «BVV 2»/«BVV 3» (Verordnungen zur beruflichen Vorsorge). '
      + 'Der Fliesstext-Extraktor liest die Ziffer nach dem Leerzeichen nicht mit — die '
      + 'in entscheide-mapping.ts (normalisiereAbk) dokumentierte und bewusst offen '
      + 'gelassene Ziffern-Lücke. Belege: bund/bge/151_V_343 «Art. 60b Abs. 1 BVV», '
      + 'kanton/BS/…/BV.2023.16 «Art. 1k lit. a BVV» (beides BVV 2). Ein Mapping auf '
      + '«BVV» wäre eine Wahl zwischen zwei verschiedenen Erlassen, also Raten (§1); '
      + 'gedeckt bleibt die Nennung über den statutes-Pfad, der die Ziffer trägt.',
  },
};

// ── Erhebung ────────────────────────────────────────────────────────────────

interface TokenZahl {
  token: string;
  /** Nennungen im statutes-Pfad (Roh-Zeilen aus zitierteNormen). */
  statutes: number;
  /** Nennungen im Fliesstext-Pfad (Refs aus extrahiereStatutRefs). */
  fliesstext: number;
  /** Anzahl SNAPSHOTS, in denen das Token vorkommt — die Häufigkeit des Tors. */
  snapshots: number;
}

function erhebe(): { zahlen: Map<string, TokenZahl>; snapshots: number } {
  const zahlen = new Map<string, TokenZahl>();
  const hole = (token: string): TokenZahl => {
    let z = zahlen.get(token);
    if (!z) { z = { token, statutes: 0, fliesstext: 0, snapshots: 0 }; zahlen.set(token, z); }
    return z;
  };

  const snaps = ladeBestandSnapshots();
  for (const snap of snaps) {
    const imSnapshot = new Set<string>();
    for (const zeile of snap.zitierteNormen ?? []) {
      const abk = abkVonStatut(zeile);
      if (!abk) continue;
      const token = normalisiereAbk(abk);
      if (!token) continue;
      hole(token).statutes += 1;
      imSnapshot.add(token);
    }
    for (const ref of extrahiereStatutRefs(fliesstextVon(snap))) {
      const token = normalisiereAbk(ref.gesetz);
      if (!token) continue;
      hole(token).fliesstext += 1;
      imSnapshot.add(token);
    }
    for (const token of imSnapshot) hole(token).snapshots += 1;
  }
  return { zahlen, snapshots: snaps.length };
}

function prozent(teil: number, ganz: number): string {
  return ganz === 0 ? '—' : `${((teil / ganz) * 100).toFixed(1)} %`;
}

function main(): void {
  console.log('\n── Tor: normKeys-Abdeckung (Rechtsprechungs-Korpus → ERLASS_REGISTER) ───');

  const { zahlen, snapshots } = erhebe();
  const fehler: string[] = [];

  // Leerer Korpus ⇒ jede Quote wäre trivial «vollständig». Ein Tor, das durch
  // Wegfall seiner Datenquelle grün wird, ist genau der Fall aus §6.7.
  if (snapshots === 0 || zahlen.size === 0) {
    console.error(
      `  FEHLER: Korpus leer (${snapshots} Snapshots, ${zahlen.size} Token) — das Tor `
      + 'kann nichts messen. public/rechtsprechung/register.json prüfen.',
    );
    process.exit(1);
  }

  // ── Klassifikation ────────────────────────────────────────────────────────
  const alle = [...zahlen.values()].sort((a, b) => a.token.localeCompare(b.token));
  const gemappt = alle.filter((z) => normKeyFuerAbk(z.token) !== null);
  const ausgeschlossen = alle.filter(
    (z) => normKeyFuerAbk(z.token) === null && ABK_AUSSCHLUSS.has(z.token),
  );
  const ungemappt = alle.filter(
    (z) => normKeyFuerAbk(z.token) === null && !ABK_AUSSCHLUSS.has(z.token),
  );

  const summe = (liste: TokenZahl[], feld: 'statutes' | 'fliesstext'): number =>
    liste.reduce((n, z) => n + z[feld], 0);

  const nStatutes = summe(alle, 'statutes');
  const nFliess = summe(alle, 'fliesstext');
  const nGesamt = nStatutes + nFliess;
  const gStatutes = summe(gemappt, 'statutes');
  const gFliess = summe(gemappt, 'fliesstext');

  // ── (1) Ungemappte Token über der Schwelle ohne Ignore-Eintrag ────────────
  const rot = ungemappt
    .filter((z) => z.snapshots >= SCHWELLE && !(z.token in IGNORE))
    .sort((a, b) => b.snapshots - a.snapshots || a.token.localeCompare(b.token));
  if (rot.length > 0) {
    fehler.push(
      `${rot.length} ungemappte(s) Token ab ${SCHWELLE} Snapshots ohne Ignore-Eintrag:\n`
      + rot.map((z) => `      ${z.token.padEnd(10)} ${String(z.snapshots).padStart(4)} Snapshots`
        + ` (${z.statutes} statutes / ${z.fliesstext} Fliesstext)`).join('\n')
      + '\n      → Entweder im ERLASS_REGISTER/Alias-Artefakt zuordenbar machen (dann wird\n'
      + '        das Zitat sichtbar), oder mit GEPRÜFTER Begründung in IGNORE eintragen\n'
      + '        (scripts/normtext/check-normkeys-abdeckung.ts). Kein Eintrag ohne Beleg.',
    );
  }

  // ── (2) Verrottete Ignore-Einträge ────────────────────────────────────────
  for (const token of Object.keys(IGNORE).sort()) {
    const eintrag = IGNORE[token];
    if (normalisiereAbk(token) !== token) {
      fehler.push(
        `IGNORE-Schlüssel '${token}' ist nicht normalisiert (erwartet `
        + `'${normalisiereAbk(token)}') — der Eintrag könnte nie greifen.`,
      );
      continue;
    }
    if (normKeyFuerAbk(token) !== null) {
      fehler.push(
        `IGNORE '${token}' ist überholt: das Token mappt inzwischen auf `
        + `'${normKeyFuerAbk(token)}'. Eintrag streichen. (Grund war: ${eintrag.grund})`,
      );
      continue;
    }
    const z = zahlen.get(token);
    const n = z?.snapshots ?? 0;
    if (n < SCHWELLE) {
      fehler.push(
        `IGNORE '${token}' ist tote Regel: nur noch ${n} Snapshot(s), Schwelle ist `
        + `${SCHWELLE}. Eintrag streichen. (Grund war: ${eintrag.grund})`,
      );
    }
  }

  // ── (3) Abkürzungs-Kollisionen im abgeleiteten Mapping ───────────────────
  if (ABK_KOLLISIONEN.length > 0) {
    fehler.push(
      `${ABK_KOLLISIONEN.length} ABK_KOLLISION(EN): ${ABK_KOLLISIONEN.join(', ')}.\n`
      + '      Dieselbe normalisierte Abkürzung zeigt auf zwei Register-keys; das Mapping\n'
      + '      wird beidseitig verworfen — beide Erlasse verlieren ihre Zitate. Register-\n'
      + '      Einträge entzerren (src/lib/normtext/register.ts).',
    );
  }

  // ── (4) Aliase, die sich nicht auf einen Register-key auflösen ────────────
  // Das generierte Artefakt bindet über die SR-Nummer ans Register. Fällt ein
  // Erlass aus dem Register oder wird seine SR-Nummer doppelt belegt, werden
  // seine Aliase wirkungslos — und ein wirkungsloses Alias verhält sich exakt
  // wie ein nie erzeugtes, also unsichtbar (§6.7). Darum hier laut.
  if (ABK_ALIAS_NOTIZEN.length > 0) {
    fehler.push(
      `${ABK_ALIAS_NOTIZEN.length} Alias/Aliase des Artefakts lösen sich NICHT auf:\n`
      + ABK_ALIAS_NOTIZEN.map((n) => `      ${n}`).join('\n')
      + '\n      → Artefakt und Register sind auseinandergelaufen. Entweder neu ernten\n'
      + '        (npm run gen:abk-aliase -- --datum=$(date +%F)) oder die doppelt belegte\n'
      + '        SR-Nummer im ERLASS_REGISTER entzerren.',
    );
  }

  // ── Ausgabe ───────────────────────────────────────────────────────────────
  console.log(`  Snapshots:            ${snapshots}`);
  console.log(
    `  Nennungen gesamt:     ${nGesamt} — gemappt ${gStatutes + gFliess} `
    + `(${prozent(gStatutes + gFliess, nGesamt)})`,
  );
  console.log(
    `    davon statutes:     ${nStatutes} — gemappt ${gStatutes} (${prozent(gStatutes, nStatutes)})`,
  );
  console.log(
    `    davon Fliesstext:   ${nFliess} — gemappt ${gFliess} (${prozent(gFliess, nFliess)})`,
  );
  console.log(
    `  Token:                ${alle.length} — gemappt ${gemappt.length}, `
    + `ausgeschlossen ${ausgeschlossen.length}, ungemappt ${ungemappt.length}`,
  );
  console.log(
    `  Alias-Ebene (Fedlex): ${ABK_ALIASE.length} amtliche DE/FR/IT-Kürzel, `
    + `${ABK_ALIAS_NOTIZEN.length} nicht auflösbar`,
  );
  if (ABK_ALIAS_AUSGESCHLOSSEN.length > 0) {
    // Kein Fehler: die bewusst fortgeführte ABK_AUSSCHLUSS-Lücke, hier nur
    // benannt — eine Lücke, die niemand sieht, lässt sich nicht schliessen (§8).
    console.log(
      `  Alias auf ausgeschlossenen Erlass (bewusste Lücke, kein Fehler): `
      + ABK_ALIAS_AUSGESCHLOSSEN.join(', '),
    );
  }
  if (ausgeschlossen.length > 0) {
    console.log(
      '  AUSGESCHLOSSEN (bewusste Lücke, kein Fehler): '
      + ausgeschlossen
        .map((z) => `${z.token} (${z.snapshots})`)
        .join(', '),
    );
  }

  const top = [...ungemappt]
    .sort((a, b) => b.snapshots - a.snapshots || a.token.localeCompare(b.token))
    .slice(0, 20);
  console.log(`  Top-20 ungemappt (Snapshots · statutes/Fliesstext · Ignore-Grund):`);
  for (const z of top) {
    const g = IGNORE[z.token]?.grund ?? '—';
    console.log(
      `    ${z.token.padEnd(10)} ${String(z.snapshots).padStart(4)}  `
      + `${String(z.statutes).padStart(4)}/${String(z.fliesstext).padStart(5)}  ${g}`,
    );
  }

  // KORPUS-KANDIDATEN: ungemappte Token, die nachweislich einen Bundes-Erlass
  // mit SR-Nummer bezeichnen — Nebenprodukt der Messung und die eigentliche
  // Ausbau-Liste für das ERLASS_REGISTER.
  const kandidaten = Object.entries(IGNORE)
    .filter(([, e]) => e.srNummer)
    .map(([token, e]) => ({ token, sr: e.srNummer!, n: zahlen.get(token)?.snapshots ?? 0 }))
    .sort((a, b) => b.n - a.n || a.token.localeCompare(b.token));
  console.log(`  KORPUS-KANDIDATEN (Bund-SR-Erlasse ohne Register-Eintrag): ${kandidaten.length}`);
  for (const k of kandidaten) {
    console.log(`    ${k.token.padEnd(10)} SR ${k.sr.padEnd(10)} ${k.n} Snapshots`);
  }

  if (fehler.length > 0) {
    console.error(`\ncheck:normkeys ROT — ${fehler.length} Befund(e):`);
    for (const f of fehler) console.error(`  • ${f}`);
    console.error(
      '\nEin ungemapptes Zitat verschwindet lautlos: der Entscheid erscheint beim Artikel\n'
      + 'nie, und die Lücke meldet sonst niemand (§6.7).',
    );
    process.exit(1);
  }

  console.log(
    `check:normkeys OK — ${prozent(gStatutes + gFliess, nGesamt)} der Nennungen gemappt, `
    + `kein ungemapptes Token ab ${SCHWELLE} Snapshots ausserhalb der `
    + `${Object.keys(IGNORE).length} deklarierten Ignore-Einträge.`,
  );
}

main();
