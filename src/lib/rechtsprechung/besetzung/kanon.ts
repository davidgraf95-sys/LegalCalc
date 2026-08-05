// ─── Besetzung · KANONISIERUNG (Teil 2 von 2) ────────────────────────────────
//
// Aus `src/lib/rechtsprechung/besetzung.ts` herausgelöst (QS-CODE-SPLITS,
// verhaltensneutral). Alles unterhalb der Bestandslinie ist byte-gleich das
// frühere Dateiende ab dem Kanon-Pass-Trenner (Z 690–874). Einzige Kante zu
// Teil 1 ist `kanonSlug()` (Alias-Tabelle) — gerichtet, ohne Zyklus.
// Der EINE Importpfad für Konsumenten bleibt die Fassade `../besetzung`.

import { kanonSlug } from './parser';

// ─── übernommener Bestand (unverändert) ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Korpus-globaler Kanon-Pass
// ─────────────────────────────────────────────────────────────────────────────
//
// Der Parser sieht immer nur EINEN Entscheid und kann darum nicht wissen, ob das
// Initial in «P. Schmid» für Patrizia oder Patrick steht. Diese Auflösung braucht
// den Blick über den ganzen Korpus — sie passiert deshalb hier, EINMAL beim
// Generieren des Registers, deterministisch und ohne zu raten.

export interface KanonEintrag {
  slug: string;
  nachSlug: string;
  givenSlug: string | null;
  /** Stand der Vorname als Abkürzung im Amtstext? (siehe RichterRoh.givenAbk) */
  givenAbk: boolean;
  name: string;
  /**
   * Namensraum der Zusammenführung (z.B. 'CH' für Bundesgerichte, 'BS' für
   * Basler Gerichte). Initial→Vollname wird NUR innerhalb desselben Raums
   * aufgelöst: ein Bundesrichter «Müller» und ein Basler «Markus Müller» sind
   * verschiedene Personen und dürfen nie verschmelzen (§1).
   */
  raum: string;
}

export interface KanonErgebnis {
  /** `${raum}|${rohSlug}` → Kanon-Slug. */
  map: Map<string, string>;
  /** Kanon-Slug → Anzeigename (die vollständigste beobachtete Schreibweise). */
  anzeige: Map<string, string>;
  /** Report-Zeilen: mehrdeutige Initialen + gleicher Slug mit divergenten Vornamen. */
  kollisionen: string[];
}

/**
 * Führt Roh-Slugs korpusweit auf Kanon-Slugs zurück.
 *
 * Regeln (alle deterministisch, alle konservativ):
 *  1. Ein Initial-Slug («schmid-p») wird auf einen Vollnamen-Slug («schmid-patrizia»)
 *     abgebildet, wenn im selben Raum GENAU EIN Vollname mit diesem Anfangs-
 *     buchstaben existiert. Gibt es mehrere (Patrizia UND Patrick), bleibt der
 *     Initial-Eimer eigenständig und wird als Kollision berichtet — geraten wird nie.
 *  2. Nur-Nachname-Slugs (BGE/BGer-Stil) werden NICHT in Vornamen-Eimer gezogen:
 *     die Bundesgerichte nennen konsequent nur Nachnamen, die kantonalen Gerichte
 *     konsequent Vornamen — eine Zusammenführung wäre eine Vermutung über
 *     Personenidentität quer durch die Instanzen (§1/§8).
 *  3. Der Anzeigename je Kanon-Slug ist die längste beobachtete Schreibweise
 *     (Gleichstand → lexikographisch kleinste), damit die Ausgabe stabil ist (§2).
 */
/**
 * Byte-stabiler Zeichenketten-Vergleich (§2 Determinismus).
 *
 * `localeCompare()` OHNE explizite Locale ist umgebungsabhängig: das Ergebnis hängt
 * am ICU-Build und an der Default-Locale des Rechners. Empirisch verifiziert
 * (20.7.2026): «van de Graaf».localeCompare(«Van de Graaf») = -1 unter full-ICU,
 * reiner Code-Unit-Vergleich = +1 — beide Schreibweisen sind gleich lang, der
 * Tiebreak entschied also allein über den Anzeigenamen. Auf einem small-ICU-Node
 * oder unter abweichender CI-Locale hätte derselbe Input ein anderes Register
 * erzeugt, und `check:besetzung` wäre je nach Host rot geworden.
 */
function byteVergleich(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Trägt der Anzeigename ein abgekürztes Namenselement («A.», «Th.»)?
 *
 * Die zweite Alternative fängt die Form OHNE Punkt: `trimRand` entfernt die
 * Schluss-Interpunktion, «Bundesrichter Müller Th.» erreicht den Kanon-Pass also als
 * «Müller Th». Beide Formen falten auf denselben Slug (`muller-th`), es ging nur um
 * den Anzeigenamen — ohne diesen Zweig galt «Müller Th» als ausgeschrieben und
 * schlug die korrekte, dreimal häufigere Schreibweise «Th. Müller» (Befund
 * Gegenprüfung 20.7.2026).
 *
 * Nur für die ANZEIGENAMEN-Rangfolge, nie für Slug oder Identität — ein
 * fälschlich als Abkürzung gewerteter zweiteiliger Nachname («Hugi Yar») kann
 * darum keinen Schaden anrichten: konkurriert keine andere Schreibweise um
 * denselben Slug, wird er ohnehin gewählt.
 */
function hatAbkuerzung(name: string): boolean {
  return /(?:^|\s)[A-ZÄÖÜ][a-zäöüA-ZÄÖÜ]{0,2}\.(?=\s|$)/.test(name)
    || /\s[A-ZÄÖÜ][a-zäöü]{0,2}$/.test(name);
}

export function kanonisiere(eintraege: readonly KanonEintrag[]): KanonErgebnis {
  // (a) AUSGESCHRIEBENE Vornamen je (Raum, Nachname) sammeln.
  // Diskriminator ist `givenAbk`, NICHT mehr die Länge des gefalteten Vornamens:
  // «Ph.» faltet zu `ph` (Länge 2) und galt darum fälschlich als Vollname — der
  // Initial-Eimer `waegeli-p` (97) wurde auf die Abkürzung `waegeli-ph` (1) gezogen,
  // der Kanon-Eimer war also selbst eine Abkürzung (Befund Gegenprüfung 20.7.2026).
  const voll = new Map<string, Set<string>>();
  const abkuerzungen = new Map<string, Set<string>>();
  for (const e of eintraege) {
    if (!e.givenSlug) continue;
    const k = `${e.raum}|${e.nachSlug}`;
    if (e.givenAbk) {
      (abkuerzungen.get(k) ?? abkuerzungen.set(k, new Set()).get(k)!).add(e.givenSlug);
    } else {
      (voll.get(k) ?? voll.set(k, new Set()).get(k)!).add(e.givenSlug);
    }
  }

  // (b) Roh-Slug → Kanon-Slug.
  const map = new Map<string, string>();
  const kollisionen: string[] = [];
  const mehrdeutig = new Set<string>();
  for (const e of eintraege) {
    const key = `${e.raum}|${e.slug}`;
    if (map.has(key)) continue;
    let ziel = kanonSlug(e.slug);
    // Eine Abkürzung wird NUR auf einen ausgeschriebenen Vornamen zurückgeführt,
    // nie auf eine andere Abkürzung (sonst würde eine Abkürzung zum Kanon).
    if (e.givenSlug && e.givenAbk) {
      const kandidaten = [...(voll.get(`${e.raum}|${e.nachSlug}`) ?? [])]
        .filter((g) => g.startsWith(e.givenSlug!))
        .sort();
      if (kandidaten.length === 1) ziel = kanonSlug(`${e.nachSlug}-${kandidaten[0]}`);
      else if (kandidaten.length > 1) mehrdeutig.add(`${e.raum}|${e.slug}|${kandidaten.join(',')}`);
    }
    map.set(key, ziel);
  }
  for (const m of [...mehrdeutig].sort()) {
    const [raum, slug, kand] = m.split('|');
    kollisionen.push(
      `MEHRDEUTIGES INITIAL — ${raum}/${slug}: passt auf ${kand.split(',').join(' und ')} ` +
      `→ bleibt eigener Eimer (nicht zugeordnet, §8).`,
    );
  }
  // Mehrere ABKÜRZUNGS-Varianten desselben Nachnamens ohne auflösenden Vollnamen
  // («P. Wägeli» / «Ph. Wägeli») sind entweder eine Person mit zwei Schreibweisen
  // oder zwei Personen — das entscheidet der Korpus NICHT. Sie bleiben getrennt und
  // werden gemeldet, damit die Klärung über die kuratierte ALIAS-Tabelle läuft
  // statt über eine stille Regel (§8: nie raten, aber auch nie verschweigen).
  for (const [k, set] of [...abkuerzungen].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
    if (set.size < 2) continue;
    const [raum, nach] = k.split('|');
    kollisionen.push(
      `ABKÜRZUNGS-VARIANTEN — ${raum}/${nach}: ${[...set].sort().join(', ')} ` +
      `→ getrennte Eimer (keine Auflösung ohne ausgeschriebenen Vornamen, §8).`,
    );
  }

  // (c) Anzeigenamen + Divergenz-Report je Kanon-Slug.
  const namen = new Map<string, Map<string, number>>();
  for (const e of eintraege) {
    const ziel = map.get(`${e.raum}|${e.slug}`)!;
    const m = namen.get(ziel) ?? namen.set(ziel, new Map()).get(ziel)!;
    m.set(e.name, (m.get(e.name) ?? 0) + 1);
  }
  const anzeige = new Map<string, string>();
  for (const [slug, m] of [...namen].sort((a, b) => byteVergleich(a[0], b[0]))) {
    // Anzeigename-Regel (Befund Gegenprüfung 20.7.2026 — die alte Regel «längste
    // Schreibweise gewinnt» machte systematisch den TIPPFEHLER zum Facetten-Label,
    // weil ein Buchstabendreher mit Extra-Zeichen die längere Variante ist):
    //   1. AUSGESCHRIEBENE Form vor abgekürzter («Andrea Pfleiderer» ×2 schlägt
    //      «A. Pfleiderer» ×288 — die Vollform ist die bessere Auskunft),
    //   2. dann HÄUFIGKEIT («Daniela Thurnherr Keller» ×167 schlägt den Dreher
    //      «Daniela Thurnherrr Keller» ×2; «Anja Dillena» ×137 schlägt ×1
    //      «Anja Dellena»),
    //   3. dann Länge, zuletzt byte-stabiler Vergleich (§2).
    const sortiert = [...m.keys()].sort((a, b) =>
      Number(hatAbkuerzung(a)) - Number(hatAbkuerzung(b))
      || m.get(b)! - m.get(a)!
      || b.length - a.length
      || byteVergleich(a, b));
    anzeige.set(slug, sortiert[0]);
    // Divergente VORNAMEN unter einem Slug sind der klassische False-Merge.
    // Abkürzungen sind hier auszuklammern: «A. Pfleiderer» neben «Andrea Pfleiderer»
    // ist eine legitime Initial-Auflösung, kein False-Merge. Der frühere Filter
    // `length > 2` traf das nur zufällig («A.» raus, «Th.» drin) — der explizite
    // Abkürzungs-Test ist die gemeinte Regel.
    const vornamen = new Set(
      [...m.keys()].map((n) => n.split(/\s+/)[0]).filter((v) => v.length > 1 && !hatAbkuerzung(v)),
    );
    if (vornamen.size > 1) {
      kollisionen.push(
        `DIVERGENTE VORNAMEN — ${slug}: ${[...m.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([n, c]) => `«${n}»×${c}`)
          .join(' | ')} → prüfen, ob eine Person (Tippfehler) oder zwei (Alias/Trennung nötig).`,
      );
    }
  }
  return { map, anzeige, kollisionen };
}
